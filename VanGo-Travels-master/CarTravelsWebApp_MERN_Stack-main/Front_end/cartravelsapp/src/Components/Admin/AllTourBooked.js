import React, { Component } from 'react'
import authHeader from '../services/auth-header'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import './AllLocalBooked.css'

export default class AllTourBooked extends Component {
    constructor(){
        super();
        this.searchinput = React.createRef();
        this.state = {
            tourpreviousBookingList: [],
            searchList: [], 
            displayAll: true,
            drivers: [],
            showDriverModal: false,
            selectedBooking: null,
            selectedDriver: '',
            loading: false,
            // Simplified filter states - only the requested filters
            useridFilter: '',
            bookedByFilter: '',
            phoneFilter: '',
            startDate: '',
            endDate: '',
            bookingStats: {
                total: 0,
                assignedDriver: 0,
                in_progress: 0,
                completed: 0,
                cancelled: 0
            }
        }
    }

    componentDidMount(){
        this.fetchTourBookings();
        this.fetchDrivers();
    }

    fetchTourBookings = () => {
        fetch('http://localhost:8010/api/v1/cartourbookedusers',{
            headers:authHeader()
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data=>{
            console.log('Tour bookings data:', data);
            if (data.success && data.data) {
                this.setState({tourpreviousBookingList: data.data});
                this.calculateBookingStats(data.data);
            } else {
                this.setState({tourpreviousBookingList: []});
                this.calculateBookingStats([]);
            }
        })
        .catch(error => {
            console.error('Error fetching tour bookings:', error);
            this.setState({tourpreviousBookingList: []});
        });
    }

    fetchDrivers = () => {
        fetch('http://localhost:8010/api/v1/drivers', {
            headers: authHeader()
        })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data) {
                this.setState({drivers: data.data});
            } else {
                this.setState({drivers: []});
            }
        })
        .catch(error => {
            console.error('Error fetching drivers:', error);
            this.setState({drivers: []});
        });
    }

    calculateBookingStats = (bookings) => {
        const stats = {
            total: bookings.length,
            assignedDriver: 0,
            in_progress: 0,
            completed: 0,
            cancelled: 0
        };

        bookings.forEach(booking => {
            const status = booking.status || 'assigned';
            if (stats.hasOwnProperty(status)) {
                stats[status]++;
            }
            
            // Count bookings with drivers assigned
            if (booking.driver) {
                stats.assignedDriver++;
            }
        });

        this.setState({ bookingStats: stats });
    }

    // Simplified filter handlers
    handleFilterChange = (filterType, value) => {
        this.setState({ [filterType]: value });
    }

    handleClearAllFilters = () => {
        this.setState({
            useridFilter: '',
            bookedByFilter: '',
            phoneFilter: '',
            startDate: '',
            endDate: ''
        });
    }

    // Helper methods for filter status display
    hasActiveFilters = () => {
        const { 
            useridFilter, 
            bookedByFilter, 
            phoneFilter, 
            startDate, 
            endDate 
        } = this.state;
        
        return useridFilter || bookedByFilter || phoneFilter || startDate || endDate;
    }

    getActiveFiltersText = () => {
        const filters = [];
        const { 
            useridFilter, 
            bookedByFilter, 
            phoneFilter, 
            startDate, 
            endDate 
        } = this.state;
        
        if (useridFilter) {
            filters.push(`User ID: ${useridFilter}`);
        }
        if (bookedByFilter) {
            filters.push(`Booked By: ${bookedByFilter}`);
        }
        if (phoneFilter) {
            filters.push(`Phone: ${phoneFilter}`);
        }
        if (startDate || endDate) {
            const dateRange = `${startDate || 'Any'} to ${endDate || 'Any'}`;
            filters.push(`Date: ${dateRange}`);
        }
        
        return filters;
    }

    getFilteredBookings = () => {
        const { 
            tourpreviousBookingList, 
            searchList, 
            displayAll, 
            useridFilter,
            bookedByFilter,
            phoneFilter,
            startDate,
            endDate
        } = this.state;
        
        let bookings = displayAll ? tourpreviousBookingList : searchList;
        
        // Apply simplified filters
        return bookings.filter(booking => {
            // User ID filter
            if (useridFilter) {
                const userId = booking.usernameid || '';
                if (!userId.toLowerCase().includes(useridFilter.toLowerCase())) return false;
            }
            
            // Booked By filter
            if (bookedByFilter) {
                const bookedBy = booking.name || '';
                if (!bookedBy.toLowerCase().includes(bookedByFilter.toLowerCase())) return false;
            }
            
            // Phone Number filter
            if (phoneFilter) {
                const phone = booking.phoneNumber ? booking.phoneNumber.toString() : '';
                if (!phone.includes(phoneFilter)) return false;
            }
            
            // Date range filter
            if (startDate || endDate) {
                const bookingDate = new Date(booking.packageDate);
                if (startDate && bookingDate < new Date(startDate)) return false;
                if (endDate && bookingDate > new Date(endDate)) return false;
            }
            
            return true;
        });
    }

    search(e){
        e.preventDefault();
        this.setState({displayAll:false})
        fetch('http://localhost:8010/api/v1/cartourbookedusers/'+ this.searchinput.current.value,{
            headers:authHeader()
        })
        .then(res=>res.json())
        .then(data=>{
            this.setState({searchList : data})
        });   
    }

    allbooking(e){
        e.preventDefault();
        this.searchinput.current.value="";
        this.setState({displayAll:true});
    }

    // Driver assignment methods
    handleAssignDriver = (booking) => {
        this.setState({
            selectedBooking: booking,
            selectedDriver: booking.driver ? booking.driver._id : '',
            showDriverModal: true
        });
    }

    handleDriverChange = (e) => {
        this.setState({selectedDriver: e.target.value});
    }

    handleAssignDriverSubmit = async () => {
        if (!this.state.selectedDriver) {
            alert('Please select a driver');
            return;
        }

        // Check if driver is already assigned to another active booking
        const selectedDriver = this.state.drivers.find(d => d._id === this.state.selectedDriver);
        const driverActiveBookings = this.state.tourpreviousBookingList.filter(booking => 
            booking.driver && 
            booking.driver._id === this.state.selectedDriver && 
            booking.status !== 'completed' && 
            booking.status !== 'cancelled'
        );

        if (driverActiveBookings.length > 0) {
            alert(`Driver ${selectedDriver.name} is already assigned to an active booking. Please wait for completion before assigning another booking.`);
            return;
        }

        this.setState({loading: true});

        try {
            const response = await fetch(`http://localhost:8010/api/v1/cartourbookedusers/${this.state.selectedBooking._id}/assign-driver`, {
                method: 'PATCH',
                headers: {
                    ...authHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    driverId: this.state.selectedDriver
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Driver assigned successfully!');
                this.fetchTourBookings(); // Refresh the list
                this.handleCloseModal();
            } else {
                alert(data.message || 'Failed to assign driver');
            }
        } catch (error) {
            console.error('Error assigning driver:', error);
            alert('Error assigning driver. Please try again.');
        } finally {
            this.setState({loading: false});
        }
    }

    handleRemoveDriver = async (booking) => {
        if (!window.confirm('Are you sure you want to remove the driver from this booking?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8010/api/v1/cartourbookedusers/${booking._id}/remove-driver`, {
                method: 'PATCH',
                headers: authHeader()
            });

            const data = await response.json();

            if (data.success) {
                alert('Driver removed successfully!');
                this.fetchTourBookings(); // Refresh the list
            } else {
                alert(data.message || 'Failed to remove driver');
            }
        } catch (error) {
            console.error('Error removing driver:', error);
            alert('Error removing driver. Please try again.');
        }
    }

    handleCloseModal = () => {
        this.setState({
            showDriverModal: false,
            selectedBooking: null,
            selectedDriver: ''
        });
    }

    // Admin assign next booking to driver
    handleAssignNextBooking = async (driverId) => {
        if (!window.confirm(`Are you sure you want to assign the next available booking to this driver?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8010/api/v1/cartourbookedusers/admin/assign-next/${driverId}`, {
                method: 'PATCH',
                headers: authHeader()
            });

            const data = await response.json();

            if (data.success) {
                alert('Next booking assigned successfully!');
                this.fetchTourBookings(); // Refresh the list
                this.fetchDrivers(); // Refresh driver data
            } else {
                alert(data.message || 'Failed to assign next booking');
            }
        } catch (error) {
            console.error('Error assigning next booking:', error);
            alert('Error assigning next booking. Please try again.');
        }
    }

    render() {
        const display = this.getFilteredBookings();

        console.log("length => ",display.length)
        let FetchedData;
        if(!display.length){
            FetchedData = (
                <tr>
                    <td colSpan="11" className="text-center">
                        {this.state.displayAll ? "No tour bookings found" : "No bookings found for this user"}
                    </td>
                </tr>
            );
        }else{
            FetchedData = display.map((previousBooking, i)=>{
                const isCancelled = previousBooking.status === 'cancelled';
                return (
                        <tr key={i} className={isCancelled ? 'table-danger' : ''}>
                            <th scope="row">{i+1}</th>
                            <td>{previousBooking.usernameid || 'N/A'}</td>
                            <td>{previousBooking.name || 'N/A'}</td>
                            <td>{previousBooking.phoneNumber || 'N/A'}</td>
                            <td>{previousBooking.packagename || 'N/A'}</td>
                            <td>{previousBooking.carType || 'N/A'}</td>
                            <td>{previousBooking.noofdays || 'N/A'}</td>
                            <td>{previousBooking.packageprice || 'N/A'}</td>
                            <td>{previousBooking.packageDate || 'N/A'}</td>
                            <td>
                                <span className={`badge ${
                                    previousBooking.status === 'completed' ? 'badge-success' :
                                    previousBooking.status === 'in_progress' ? 'badge-warning' :
                                    previousBooking.status === 'cancelled' ? 'badge-danger' : 'badge-secondary'
                                }`}>
                                    <i className={`fas ${
                                        previousBooking.status === 'completed' ? 'fa-check-circle' :
                                        previousBooking.status === 'in_progress' ? 'fa-clock' :
                                        previousBooking.status === 'cancelled' ? 'fa-times-circle' : 'fa-user-clock'
                                    } mr-1`}></i>
                                    {previousBooking.status || 'assigned'}
                                </span>
                                {previousBooking.status === 'cancelled' && previousBooking.cancelledAt && (
                                    <div className="mt-1">
                                        <small className="text-muted">
                                            <i className="fas fa-calendar-times mr-1"></i>
                                            Cancelled: {new Date(previousBooking.cancelledAt).toLocaleString()}
                                        </small>
                                    </div>
                                )}
                            </td>
                            <td>
                                {previousBooking.driver ? (
                                    <div>
                                        <span className="badge badge-success">
                                            {previousBooking.driver.name}
                                        </span>
                                        <br/>
                                        <small className="text-muted">{previousBooking.driver.email}</small>
                                        <br/>
                                        {previousBooking.status !== 'completed' && previousBooking.status !== 'cancelled' && (
                                            <Button 
                                                size="sm" 
                                                variant="outline-danger" 
                                                onClick={() => this.handleRemoveDriver(previousBooking)}
                                                className="mt-1"
                                            >
                                                Remove Driver
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    previousBooking.status === 'cancelled' ? (
                                        <span className="badge badge-danger">
                                            <i className="fas fa-ban mr-1"></i>
                                            Cannot Assign Driver
                                        </span>
                                    ) : (
                                        <Button 
                                            size="sm" 
                                            variant="primary" 
                                            onClick={() => this.handleAssignDriver(previousBooking)}
                                        >
                                            Assign Driver
                                        </Button>
                                    )
                                )}
                            </td>
                        </tr>
                );
            })
        }
      

    return (
        <div className="MainDiv">
            <div className="container mt-4">
                <div className="row">
                    <div className="col-12">
                        <h2 className="mb-4">Tour Package Booked List</h2>
                        
                        {/* Booking Statistics */}
                        <div className="row mb-4">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title">Booking Statistics</h5>
                                        <div className="row">
                                            <div className="col-md-2">
                                                <div className="text-center">
                                                    <h4 className="text-primary">{this.state.bookingStats.total}</h4>
                                                    <small className="text-muted">Total</small>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="text-center">
                                                    <h4 className="text-info">{this.state.bookingStats.assignedDriver}</h4>
                                                    <small className="text-muted">Assigned Driver</small>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="text-center">
                                                    <h4 className="text-warning">{this.state.bookingStats.in_progress}</h4>
                                                    <small className="text-muted">In Progress</small>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="text-center">
                                                    <h4 className="text-success">{this.state.bookingStats.completed}</h4>
                                                    <small className="text-muted">Completed</small>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <div className="text-center">
                                                    <h4 className="text-danger">{this.state.bookingStats.cancelled}</h4>
                                                    <small className="text-muted">Cancelled</small>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Cancelled Bookings Alert */}
                                        {this.state.bookingStats.cancelled > 0 && (
                                            <div className="alert alert-warning mt-3" role="alert">
                                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                                <strong>Attention:</strong> There are {this.state.bookingStats.cancelled} cancelled booking(s) that need review.
                                                <button 
                                                    type="button" 
                                                    className="btn btn-sm btn-outline-danger ml-2" 
                                                    onClick={() => this.handleStatusFilter('cancelled')}
                                                >
                                                    <i className="fas fa-eye mr-1"></i>
                                                    View Cancelled Bookings
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Available Drivers Section */}
                        <div className="row mb-4">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title">🚗 Available Drivers</h5>
                                        <p className="card-text">Assign next available booking to drivers</p>
                                        <div className="row">
                                            {this.state.drivers.map(driver => {
                                                const driverActiveBookings = this.state.tourpreviousBookingList.filter(booking => 
                                                    booking.driver && 
                                                    booking.driver._id === driver._id && 
                                                    booking.status !== 'completed' && 
                                                    booking.status !== 'cancelled'
                                                );
                                                const isAvailable = driverActiveBookings.length === 0;
                                                
                                                return (
                                                    <div key={driver._id} className="col-md-4 mb-3">
                                                        <div className={`card ${isAvailable ? 'border-success' : 'border-warning'}`}>
                                                            <div className="card-body">
                                                                <h6 className="card-title">{driver.name}</h6>
                                                                <p className="card-text">
                                                                    <small className="text-muted">{driver.email}</small><br/>
                                                                    <small className="text-muted">Phone: {driver.phone}</small><br/>
                                                                    <small className="text-muted">Experience: {driver.experienceYears} years</small>
                                                                </p>
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <span className={`badge ${isAvailable ? 'badge-success' : 'badge-warning'}`}>
                                                                        {isAvailable ? 'Available' : 'Busy'}
                                                                    </span>
                                                                    {isAvailable ? (
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="primary"
                                                                            onClick={() => this.handleAssignNextBooking(driver._id)}
                                                                        >
                                                                            <i className="fas fa-plus mr-1"></i>
                                                                            Assign Next
                                                                        </Button>
                                                                    ) : (
                                                                        <small className="text-muted">
                                                                            {driverActiveBookings.length} active booking(s)
                                                                        </small>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Simplified Filter Section */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        <i className="fas fa-filter mr-2"></i>
                                        Filters
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn btn-sm btn-outline-secondary" 
                                        onClick={this.handleClearAllFilters}
                                    >
                                        <i className="fas fa-times mr-1"></i>
                                        Clear All
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {/* User ID Filter */}
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">User ID</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Enter User ID"
                                            value={this.state.useridFilter}
                                            onChange={(e) => this.handleFilterChange('useridFilter', e.target.value)}
                                        />
                                    </div>
                                    
                                    {/* Booked By Filter */}
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Booked By</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Enter Name"
                                            value={this.state.bookedByFilter}
                                            onChange={(e) => this.handleFilterChange('bookedByFilter', e.target.value)}
                                        />
                                    </div>
                                    
                                    {/* Phone Number Filter */}
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Phone Number</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Enter Phone Number"
                                            value={this.state.phoneFilter}
                                            onChange={(e) => this.handleFilterChange('phoneFilter', e.target.value)}
                                        />
                                    </div>
                                    
                                    {/* Date Range Filter */}
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">Booking Date Range</label>
                                        <div className="input-group">
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                placeholder="Start Date"
                                                value={this.state.startDate}
                                                onChange={(e) => this.handleFilterChange('startDate', e.target.value)}
                                            />
                                            <div className="input-group-append">
                                                <span className="input-group-text">to</span>
                                            </div>
                                            <input 
                                                type="date" 
                                                className="form-control" 
                                                placeholder="End Date"
                                                value={this.state.endDate}
                                                onChange={(e) => this.handleFilterChange('endDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        {/* Simplified Filter Status Header */}
        {this.hasActiveFilters() && (
            <div className="alert alert-info mb-3">
                <i className="fas fa-filter mr-2"></i>
                <strong>Active Filters:</strong>
                <div className="mt-2">
                    {this.getActiveFiltersText().map((filter, index) => (
                        <span key={index} className="badge badge-primary mr-2 mb-1">
                            {filter}
                        </span>
                    ))}
                </div>
                <div className="mt-2">
                    <strong>Results:</strong> {display.length} booking{display.length !== 1 ? 's' : ''} found
                    <button 
                        type="button" 
                        className="btn btn-sm btn-outline-secondary ml-2" 
                        onClick={this.handleClearAllFilters}
                    >
                        <i className="fas fa-times mr-1"></i>
                        Clear All Filters
                    </button>
                </div>
            </div>
        )}

        <Table responsive className="table table-striped">
            <thead className="thead-dark">
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">User Id</th>
                    <th scope="col">Booked by</th>
                    <th scope="col">Phone No.</th>
                    <th scope="col">Package Name</th>
                    <th scope="col">Car Type</th>
                    <th scope="col">Days</th>
                    <th scope="col">Price</th>
                    <th scope="col">Booked Date</th>
                    <th scope="col">Status</th>
                    <th scope="col">Driver Assignment</th>
                </tr>
            </thead>
           
            <tbody>
                {FetchedData}
            </tbody>
            
        </Table>

        {/* Driver Assignment Modal */}
        <Modal show={this.state.showDriverModal} onHide={this.handleCloseModal}>
            <Modal.Header closeButton>
                <Modal.Title>Assign Driver</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Select Driver:</Form.Label>
                        <Form.Control 
                            as="select" 
                            value={this.state.selectedDriver}
                            onChange={this.handleDriverChange}
                        >
                            <option value="">Choose a driver...</option>
                            {this.state.drivers.map(driver => (
                                <option key={driver._id} value={driver._id}>
                                    {driver.name} - {driver.email} ({driver.experienceYears} years exp)
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={this.handleCloseModal}>
                    Cancel
                </Button>
                <Button 
                    variant="primary" 
                    onClick={this.handleAssignDriverSubmit}
                    disabled={this.state.loading}
                >
                    {this.state.loading ? 'Assigning...' : 'Assign Driver'}
                </Button>
            </Modal.Footer>
        </Modal>
        </div>
    )
    }
}

