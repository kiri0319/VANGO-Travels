import React, { Component } from 'react'
import { Container, Row, Col, Card, Button, Badge, Alert, Modal, Form, Spinner } from 'react-bootstrap'
import AuthService from '../services/auth'
import authHeader from '../services/auth-header'

export default class DriverHomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            driverInfo: null,
            assignedTrips: [],
            vehicleInfo: null,
            notifications: [],
            showTripModal: false,
            selectedTrip: null,
            tripStatus: '',
            loading: true,
            error: '',
            refreshLoading: false,
            lastRefresh: null,
            myBookings: [],
            bookingStatusFilter: 'all'
        };
        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;
        console.log('🚗 DriverHomePage mounted');
        this.initializeDriverDashboard();
    }

    componentWillUnmount() {
        this._isMounted = false;
        console.log('🚗 DriverHomePage unmounted');
    }

    initializeDriverDashboard = () => {
        try {
            console.log('🚀 Initializing driver dashboard...');
            
            // Check authentication first
            if (!this.checkAuthentication()) {
                console.log('❌ Authentication check failed');
                return;
            }

            console.log('✅ Authentication passed, loading data...');
            // Load all data
            this.loadAllData();
        } catch (error) {
            console.error('❌ Error initializing driver dashboard:', error);
            this.handleError('Failed to initialize dashboard: ' + error.message);
        }
    }

    checkAuthentication = () => {
        try {
            const isAuthenticated = AuthService.isAuthenticated();
            const userRole = AuthService.findrole();
            const userId = AuthService.finduserid();

            console.log('🔐 Authentication check:', { isAuthenticated, userRole, userId });

            if (!isAuthenticated || userRole !== 'driver' || !userId) {
                console.log('❌ Authentication failed, redirecting to login');
                this.props.history.push('/login');
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ Error in authentication check:', error);
            this.props.history.push('/login');
            return false;
        }
    }

    loadAllData = async () => {
        try {
            console.log('📊 Starting to load all data...');
            this.setState({ loading: true, error: '' });
            
            // Load all data in parallel
            await Promise.all([
                this.loadDriverData(),
                this.loadAssignedTrips(),
                this.loadNotifications(),
                this.fetchMyBookings()
            ]);

            console.log('✅ All data loaded successfully');
            this.setState({ 
                loading: false, 
                lastRefresh: new Date().toLocaleTimeString() 
            });

        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.handleError('Failed to load dashboard data: ' + error.message);
        }
    }

    loadDriverData = async () => {
        try {
            const driverId = AuthService.finduserid();
            if (!driverId) {
                throw new Error('Driver ID not found in token');
            }

            console.log('👤 Loading driver data for ID:', driverId);
        
            const response = await fetch(`http://localhost:8010/api/v1/drivers/${driverId}`, {
                headers: authHeader()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Driver data loaded:', data);

            if (data.success && this._isMounted) {
                this.setState({ driverInfo: data.data });
            } else {
                throw new Error(data.message || 'Failed to load driver information');
            }

        } catch (error) {
            console.error('❌ Failed to load driver data:', error);
            throw error;
        }
    }

    loadAssignedTrips = async () => {
        try {
            const driverId = AuthService.finduserid();
            if (!driverId) {
                throw new Error('Driver ID not found for loading trips');
            }

            console.log('🚗 Loading assigned trips for driver ID:', driverId);

            // Load both local and tour bookings assigned to this driver
            const [localTripsResponse, tourTripsResponse] = await Promise.all([
                fetch(`http://localhost:8010/api/v1/carbookedusers?driver=${driverId}`, {
                    headers: authHeader()
                }),
                fetch(`http://localhost:8010/api/v1/cartourbookedusers?driver=${driverId}`, {
                    headers: authHeader()
                })
            ]);

            // Check responses
            if (!localTripsResponse.ok) {
                throw new Error(`Local trips HTTP ${localTripsResponse.status}: ${localTripsResponse.statusText}`);
            }
            if (!tourTripsResponse.ok) {
                throw new Error(`Tour trips HTTP ${tourTripsResponse.status}: ${tourTripsResponse.statusText}`);
            }

            const [localTrips, tourTrips] = await Promise.all([
                localTripsResponse.json(),
                tourTripsResponse.json()
            ]);

            console.log('📊 Trips data:', { localTrips, tourTrips });
            
            // Filter trips to only show those assigned to this specific driver by admin
            const driverName = AuthService.findusername();
            
            console.log('🔍 Driver Info:', { driverId, driverName });
            
            // Strict filtering: Only show trips where driver is explicitly assigned
            const assignedLocalTrips = (localTrips.data || []).filter(trip => {
                const isAssigned = trip.driver && 
                                 trip.driver._id === driverId && 
                                 trip.driver._id !== null && 
                                 trip.driver._id !== undefined;
                
                console.log(`🚗 Local Trip ${trip._id.slice(-6)}:`, {
                    hasDriver: !!trip.driver,
                    driverId: trip.driver?._id,
                    currentDriverId: driverId,
                    isAssigned,
                    customer: trip.user_name
                });
                
                return isAssigned;
            });
            
            const assignedTourTrips = (tourTrips.data || []).filter(trip => {
                const isAssigned = trip.driver && 
                                 trip.driver._id === driverId && 
                                 trip.driver._id !== null && 
                                 trip.driver._id !== undefined;
                
                console.log(`🏖️ Tour Trip ${trip._id.slice(-6)}:`, {
                    hasDriver: !!trip.driver,
                    driverId: trip.driver?._id,
                    currentDriverId: driverId,
                    isAssigned,
                    customer: trip.name
                });
                
                return isAssigned;
            });
            
            console.log('🔍 Filtered trips summary:', { 
                totalLocalTrips: localTrips.data?.length || 0,
                assignedLocalTrips: assignedLocalTrips.length,
                totalTourTrips: tourTrips.data?.length || 0,
                assignedTourTrips: assignedTourTrips.length,
                currentDriver: driverName
            });
            
            // Combine and process only assigned trips
            const allTrips = [
                ...assignedLocalTrips.map(trip => ({ 
                    ...trip, 
                    type: 'local',
                    displayName: trip.user_name || trip.usernameid || 'Unknown Customer',
                    route: `${trip.FromLocation} → ${trip.ToLocation}`,
                    dateTime: trip.DateTime || trip.createdAt,
                    driverName: trip.driver ? trip.driver.name : 'Unassigned'
                })),
                ...assignedTourTrips.map(trip => ({ 
                    ...trip, 
                    type: 'tour',
                    displayName: trip.name || trip.usernameid || 'Unknown Customer',
                    route: trip.packagename || 'Tour Package',
                    dateTime: trip.createdAt,
                    driverName: trip.driver ? trip.driver.name : 'Unassigned'
                }))
            ];
            
            console.log('✅ All assigned trips processed:', allTrips);
            
            if (this._isMounted) {
                this.setState({ assignedTrips: allTrips });
            }

        } catch (error) {
            console.error('❌ Failed to load trips:', error);
            throw error;
        }
    }

    loadNotifications = () => {
        // Simulate notifications - in real app, this would come from backend
        const notifications = [
            { 
                id: 1, 
                message: 'New trip assignment: Local booking #123', 
                time: '2 hours ago', 
                type: 'assignment',
                priority: 'high'
            },
            { 
                id: 2, 
                message: 'Vehicle maintenance due in 3 days', 
                time: '1 day ago', 
                type: 'maintenance',
                priority: 'medium'
            },
            { 
                id: 3, 
                message: 'Trip completed successfully', 
                time: '2 days ago', 
                type: 'completion',
                priority: 'low'
            }
        ];
        
        if (this._isMounted) {
            this.setState({ notifications });
        }
    }

    updateTripStatus = async (tripId, status) => {
        const trip = this.state.assignedTrips.find(t => t._id === tripId);
        if (!trip) {
            console.error('❌ Trip not found for ID:', tripId);
            this.showAlert('Trip not found', 'danger');
            return;
        }

        console.log('📝 Updating trip status:', { 
            tripId, 
            status, 
            tripType: trip.type,
            currentStatus: trip.status,
            driverId: AuthService.finduserid()
        });

        try {
            const endpoint = trip.type === 'local' 
                ? `http://localhost:8010/api/v1/carbookedusers/${tripId}`
                : `http://localhost:8010/api/v1/cartourbookedusers/${tripId}`;
            
            console.log('🌐 Making request to:', endpoint);
            console.log('📤 Request payload:', { status });
            
            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    ...authHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            console.log('📥 Response status:', response.status);
            console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Trip status updated response:', data);

            if (data.success && this._isMounted) {
                // Update the trip in local state immediately for better UX
                const updatedTrips = this.state.assignedTrips.map(t => 
                    t._id === tripId ? { ...t, status } : t
                );
                this.setState({ 
                    assignedTrips: updatedTrips,
                    showTripModal: false, 
                    selectedTrip: null 
                });
                
                // Then refresh from server to ensure consistency
                setTimeout(() => this.loadAssignedTrips(), 1000);
                
                this.showAlert('Trip status updated successfully', 'success');
            } else {
                throw new Error(data.message || 'Failed to update trip status');
            }

        } catch (error) {
            console.error('❌ Failed to update trip status:', error);
            this.showAlert('Failed to update trip status: ' + error.message, 'danger');
        }
    }

    openTripModal = (trip) => {
        this.setState({ 
            showTripModal: true, 
            selectedTrip: trip,
            tripStatus: trip.status || 'assigned'
        });
    }

    handleRefresh = async () => {
        this.setState({ refreshLoading: true });
        try {
            await this.loadAllData();
            this.showAlert('Dashboard refreshed successfully', 'success');
        } catch (error) {
            this.showAlert('Failed to refresh dashboard: ' + error.message, 'danger');
        } finally {
            this.setState({ refreshLoading: false });
        }
    }

    handleError = (errorMessage) => {
        console.error('❌ Driver Dashboard Error:', errorMessage);
        if (this._isMounted) {
            this.setState({ 
                error: errorMessage, 
                loading: false 
            });
        }
    }

    showAlert = (message, variant = 'info') => {
        // Simple alert for now - could be enhanced with toast notifications
        alert(message);
    }

    // ===========================================
    // BOOKING MANAGEMENT METHODS
    // ===========================================
    
    fetchMyBookings = async () => {
        try {
            console.log('📋 Fetching driver bookings...');
            const response = await fetch('http://localhost:8010/api/v1/carbookedusers/driver/my-bookings', {
                headers: authHeader()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📋 Bookings data:', data);

            if (data.success && data.data) {
                this.setState({ myBookings: data.data });
            } else {
                this.setState({ myBookings: [] });
            }
        } catch (error) {
            console.error('❌ Error fetching driver bookings:', error);
            this.setState({ myBookings: [] });
        }
    }

    handleCompleteBooking = async (booking) => {
        if (!window.confirm(`Are you sure you want to mark this booking as completed?\n\nCustomer: ${booking.user_name}\nFrom: ${booking.FromLocation}\nTo: ${booking.ToLocation}`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8010/api/v1/carbookedusers/${booking._id}/driver-complete`, {
                method: 'PATCH',
                headers: authHeader()
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert('Booking completed successfully!', 'success');
                this.fetchMyBookings(); // Refresh bookings
            } else {
                this.showAlert(data.message || 'Failed to complete booking', 'danger');
            }
        } catch (error) {
            console.error('Error completing booking:', error);
            this.showAlert('Error completing booking. Please try again.', 'danger');
        }
    }

    handleCancelBooking = async (booking) => {
        if (!window.confirm(`Are you sure you want to cancel this booking?\n\nCustomer: ${booking.user_name}\nFrom: ${booking.FromLocation}\nTo: ${booking.ToLocation}\n\nThis action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8010/api/v1/carbookedusers/${booking._id}/driver-cancel`, {
                method: 'PATCH',
                headers: authHeader()
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert('Booking cancelled successfully!', 'success');
                this.fetchMyBookings(); // Refresh bookings
            } else {
                this.showAlert(data.message || 'Failed to cancel booking', 'danger');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            this.showAlert('Error cancelling booking. Please try again.', 'danger');
        }
    }

    handleBookingStatusFilter = (status) => {
        this.setState({ bookingStatusFilter: status });
    }

    getFilteredBookings = () => {
        const { myBookings, bookingStatusFilter } = this.state;
        
        if (bookingStatusFilter === 'all') {
            return myBookings;
        }
        
        return myBookings.filter(booking => {
            const status = booking.status || 'assigned';
            return status === bookingStatusFilter;
        });
    }

    // Navigate to Google Maps with pickup location
    navigateToGoogleMaps = (fromLocation) => {
        try {
            let mapUrl = '';
            
            // Check if the location contains coordinates (Lat: X.XXXXXX, Lng: Y.YYYYYY)
            const coordMatch = fromLocation.match(/Lat:\s*([+-]?\d+\.?\d*),\s*Lng:\s*([+-]?\d+\.?\d*)/);
            
            if (coordMatch) {
                // Extract coordinates
                const lat = coordMatch[1];
                const lng = coordMatch[2];
                mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
            } else {
                // Treat as address and search for it
                const encodedAddress = encodeURIComponent(fromLocation);
                mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
            }
            
            // Open Google Maps in a new tab
            window.open(mapUrl, '_blank');
            
        } catch (error) {
            console.error('Error opening Google Maps:', error);
            alert('Unable to open Google Maps. Please check the location format.');
        }
    }

    render() {
        const { 
            driverInfo, 
            assignedTrips, 
            notifications, 
            showTripModal, 
            selectedTrip, 
            tripStatus, 
            loading, 
            error,
            refreshLoading,
            lastRefresh,
            myBookings,
            bookingStatusFilter
        } = this.state;

        // Loading state
        if (loading) {
            return (
                <div className="MainDiv">
                    <Container className="mt-5 p-5">
                        <div className="text-center">
                            <Spinner animation="border" variant="primary" />
                            <h4 className="mt-3">Loading Driver Dashboard...</h4>
                            <p className="text-muted">Please wait while we load your information</p>
                        </div>
                    </Container>
                </div>
            );
        }

        // Error state
        if (error) {
            return (
                <div className="MainDiv">
                    <Container className="mt-5 p-5">
                        <Alert variant="danger">
                            <Alert.Heading>Dashboard Error</Alert.Heading>
                            <p>{error}</p>
                            <hr />
                            <div className="d-flex justify-content-end">
                                <Button variant="outline-danger" onClick={this.handleRefresh}>
                                    Try Again
                                </Button>
                            </div>
                        </Alert>
                    </Container>
                </div>
            );
        }

        return (
            <div className="MainDiv">
                <Container className="mt-3 p-3">
                    {/* Header */}
                    <Row className="mb-4">
                        <Col md={10}>
                            <h2>🚗 Driver Dashboard</h2>
                            <p className="text-muted">Fleet Management & Trip Operations</p>
                            {lastRefresh && (
                                <small className="text-info">
                                    Last updated: {lastRefresh}
                                </small>
                            )}
                        </Col>
                        <Col md={2} className="text-right">
                            <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onClick={this.handleRefresh}
                                disabled={refreshLoading}
                            >
                                {refreshLoading ? (
                                    <>
                                        <Spinner size="sm" animation="border" className="mr-1" />
                                        Refreshing...
                                    </>
                                ) : (
                                    '🔄 Refresh'
                                )}
                            </Button>
                        </Col>
                    </Row>

                    {/* Driver Info Card */}
                    {driverInfo && (
                        <Row className="mb-4">
                            <Col md={6}>
                                <Card>
                                    <Card.Header>
                                        <h5>👤 Driver Information</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <p><strong>Name:</strong> {driverInfo.name}</p>
                                        <p><strong>Email:</strong> {driverInfo.email}</p>
                                        <p><strong>Phone:</strong> {driverInfo.phone}</p>
                                        <p><strong>License:</strong> {driverInfo.licenseNumber}</p>
                                        <p><strong>Experience:</strong> {driverInfo.experienceYears} years</p>
                                        <p><strong>Status:</strong> 
                                            <Badge variant={driverInfo.status === 'active' ? 'success' : 'danger'} className="ml-2">
                                                {driverInfo.status}
                                            </Badge>
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card>
                                    <Card.Header>
                                        <h5>📊 Quick Stats</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <p><strong>Active Trips:</strong> 
                                            <Badge variant="warning" className="ml-2">
                                                {assignedTrips.filter(t => t.status === 'in_progress').length}
                                            </Badge>
                                        </p>
                                        <p><strong>Completed Today:</strong> 
                                            <Badge variant="success" className="ml-2">
                                                {assignedTrips.filter(t => t.status === 'completed').length}
                                            </Badge>
                                        </p>
                                        <p><strong>Pending Assignments:</strong> 
                                            <Badge variant="secondary" className="ml-2">
                                                {assignedTrips.filter(t => t.status === 'assigned').length}
                                            </Badge>
                                        </p>
                                        <p><strong>Total Trips:</strong> 
                                            <Badge variant="info" className="ml-2">
                                                {assignedTrips.length}
                                            </Badge>
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {/* Assigned Trips */}
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card>
                                <Card.Header>
                                    <h5>🚗 Admin-Assigned Trips ({assignedTrips.length})</h5>
                                    <small className="text-muted">
                                        <i className="fas fa-shield-alt"></i> Only trips assigned by admin are shown
                                    </small>
                                </Card.Header>
                                <Card.Body>
                    {assignedTrips.length === 0 ? (
                        <div className="text-center py-4">
                            <div className="mb-3">
                                <i className="fas fa-clipboard-list fa-3x text-muted"></i>
                            </div>
                            <h5 className="text-muted">No Admin-Assigned Trips</h5>
                            <p className="text-muted">You don't have any trips assigned by admin at the moment.</p>
                            <div className="mt-3">
                                <small className="text-info">
                                    <strong>Driver:</strong> {AuthService.findusername() || 'Unknown'} | 
                                    <strong> ID:</strong> {AuthService.finduserid() || 'Not found'}
                                </small>
                            </div>
                            <div className="mt-2">
                                <small className="text-warning">
                                    <i className="fas fa-info-circle"></i> Only trips assigned by admin will appear here
                                </small>
                            </div>
                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-striped table-hover">
                                                <thead className="thead-dark">
                                                    <tr>
                                                        <th>Trip ID</th>
                                                        <th>Type</th>
                                                        <th>Customer</th>
                                                        <th>Route</th>
                                                        <th>Date/Time</th>
                                                        <th>Assigned Driver</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {assignedTrips.map(trip => (
                                                        <tr key={trip._id}>
                                                            <td>
                                                                <code>{trip._id.slice(-6)}</code>
                                                            </td>
                                                            <td>
                                                                <Badge variant={trip.type === 'local' ? 'primary' : 'info'}>
                                                                    {trip.type.toUpperCase()}
                                                                </Badge>
                                                            </td>
                                                            <td>{trip.displayName}</td>
                                                            <td>{trip.route}</td>
                                                            <td>{trip.dateTime}</td>
                                                            <td>
                                                                <Badge variant="success">
                                                                    <i className="fas fa-user-check"></i> {trip.driverName || 'You'}
                                                                </Badge>
                                                                <br />
                                                                <small className="text-success">
                                                                    <i className="fas fa-shield-alt"></i> Admin Assigned
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <Badge variant={
                                                                    trip.status === 'completed' ? 'success' :
                                                                    trip.status === 'in_progress' ? 'warning' : 'secondary'
                                                                }>
                                                                    {trip.status || 'assigned'}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline-primary"
                                                                    onClick={() => this.openTripModal(trip)}
                                                                    className="mr-1"
                                                                >
                                                                    📝 Update Status
                                                                </Button>
                                                                {trip.status !== 'completed' && (
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="success"
                                                                        onClick={() => this.updateTripStatus(trip._id, 'completed')}
                                                                    >
                                                                        ✅ Complete
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* My Bookings Management */}
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card>
                                <Card.Header>
                                    <h5>📋 My Bookings ({myBookings.length})</h5>
                                    <small className="text-muted">
                                        <i className="fas fa-user"></i> Manage your assigned bookings
                                    </small>
                                </Card.Header>
                                <Card.Body>
                                    {/* Booking Status Filter */}
                                    <div className="mb-3">
                                        <div className="btn-group" role="group">
                                            <button 
                                                type="button" 
                                                className={`btn ${bookingStatusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => this.handleBookingStatusFilter('all')}
                                            >
                                                All ({myBookings.length})
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`btn ${bookingStatusFilter === 'assigned' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => this.handleBookingStatusFilter('assigned')}
                                            >
                                                Assigned ({myBookings.filter(b => b.status === 'assigned').length})
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`btn ${bookingStatusFilter === 'in_progress' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => this.handleBookingStatusFilter('in_progress')}
                                            >
                                                In Progress ({myBookings.filter(b => b.status === 'in_progress').length})
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`btn ${bookingStatusFilter === 'completed' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => this.handleBookingStatusFilter('completed')}
                                            >
                                                Completed ({myBookings.filter(b => b.status === 'completed').length})
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`btn ${bookingStatusFilter === 'cancelled' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => this.handleBookingStatusFilter('cancelled')}
                                            >
                                                Cancelled ({myBookings.filter(b => b.status === 'cancelled').length})
                                            </button>
                                        </div>
                                    </div>

                                    {this.getFilteredBookings().length === 0 ? (
                                        <div className="text-center py-4">
                                            <div className="mb-3">
                                                <i className="fas fa-clipboard-list fa-3x text-muted"></i>
                                            </div>
                                            <h5 className="text-muted">No Bookings Found</h5>
                                            <p className="text-muted">
                                                {bookingStatusFilter === 'all' 
                                                    ? "You don't have any bookings assigned yet." 
                                                    : `No ${bookingStatusFilter} bookings found.`
                                                }
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-striped">
                                                <thead className="thead-dark">
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Customer</th>
                                                        <th>Phone</th>
                                                        <th>From</th>
                                                        <th>To</th>
                                                        <th>Date</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.getFilteredBookings().map((booking, index) => (
                                                        <tr key={booking._id}>
                                                            <td>{index + 1}</td>
                                                            <td>
                                                                <strong>{booking.user_name}</strong>
                                                                <br/>
                                                                <small className="text-muted">{booking.usernameid}</small>
                                                            </td>
                                                            <td>{booking.phoneNumber}</td>
                                                            <td>
                                                                <small>{booking.FromLocation}</small>
                                                            </td>
                                                            <td>
                                                                <small>{booking.ToLocation}</small>
                                                            </td>
                                                            <td>
                                                                <small>{booking.DateTime}</small>
                                                            </td>
                                                            <td>
                                                                <Badge variant={
                                                                    booking.status === 'completed' ? 'success' :
                                                                    booking.status === 'in_progress' ? 'warning' :
                                                                    booking.status === 'cancelled' ? 'danger' : 'secondary'
                                                                }>
                                                                    {booking.status || 'assigned'}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <div className="btn-group-vertical" role="group">
                                                                    {/* From Location Button - Always visible */}
                                                                    <Button 
                                                                        size="sm" 
                                                                        variant="info" 
                                                                        onClick={() => this.navigateToGoogleMaps(booking.FromLocation)}
                                                                        className="mb-1"
                                                                        title="Open pickup location in Google Maps"
                                                                    >
                                                                        <i className="fas fa-map-marker-alt mr-1"></i>
                                                                        From Location
                                                                    </Button>
                                                                    
                                                                    {(booking.status === 'assigned' || booking.status === 'in_progress') && (
                                                                        <>
                                                                            <Button 
                                                                                size="sm" 
                                                                                variant="success" 
                                                                                onClick={() => this.handleCompleteBooking(booking)}
                                                                                className="mb-1"
                                                                            >
                                                                                <i className="fas fa-check mr-1"></i>
                                                                                Complete
                                                                            </Button>
                                                                            <Button 
                                                                                size="sm" 
                                                                                variant="danger" 
                                                                                onClick={() => this.handleCancelBooking(booking)}
                                                                            >
                                                                                <i className="fas fa-times mr-1"></i>
                                                                                Cancel
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                    {booking.status === 'completed' && (
                                                                        <span className="badge badge-success">
                                                                            <i className="fas fa-check-circle mr-1"></i>
                                                                            Completed
                                                                        </span>
                                                                    )}
                                                                    {booking.status === 'cancelled' && (
                                                                        <span className="badge badge-danger">
                                                                            <i className="fas fa-times-circle mr-1"></i>
                                                                            Cancelled
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Notifications */}
                    <Row>
                        <Col md={12}>
                            <Card>
                                <Card.Header>
                                    <h5>🔔 Notifications ({notifications.length})</h5>
                                </Card.Header>
                                <Card.Body>
                                    {notifications.length === 0 ? (
                                        <p className="text-muted">No notifications at the moment.</p>
                                    ) : (
                                        <div className="list-group">
                                            {notifications.map(notification => (
                                                <div key={notification.id} className="list-group-item">
                                                    <div className="d-flex w-100 justify-content-between">
                                                        <h6 className="mb-1">{notification.message}</h6>
                                                        <small>{notification.time}</small>
                                                    </div>
                                                    <Badge variant={
                                                        notification.priority === 'high' ? 'danger' :
                                                        notification.priority === 'medium' ? 'warning' : 'info'
                                                    }>
                                                        {notification.type}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Trip Status Update Modal */}
                    <Modal show={showTripModal} onHide={() => this.setState({ showTripModal: false })}>
                        <Modal.Header closeButton>
                            <Modal.Title>Update Trip Status</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedTrip && (
                                <div>
                                    <p><strong>Trip ID:</strong> {selectedTrip._id.slice(-6)}</p>
                                    <p><strong>Type:</strong> {selectedTrip.type.toUpperCase()}</p>
                                    <p><strong>Customer:</strong> {selectedTrip.displayName}</p>
                                    <p><strong>Route:</strong> {selectedTrip.route}</p>
                                    
                                    <Form.Group>
                                        <Form.Label>Status</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={tripStatus}
                                            onChange={(e) => this.setState({ tripStatus: e.target.value })}
                                        >
                                            <option value="assigned">Assigned</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </Form.Control>
                                    </Form.Group>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => this.setState({ showTripModal: false })}>
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={() => this.updateTripStatus(selectedTrip._id, tripStatus)}
                            >
                                Update Status
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Container>
            </div>
        );
    }
}