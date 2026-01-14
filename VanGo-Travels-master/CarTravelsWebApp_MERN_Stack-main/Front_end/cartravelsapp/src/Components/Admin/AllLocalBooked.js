import React, { Component } from 'react'
import authHeader from '../services/auth-header'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import './AllLocalBooked.css'

export default class AllLocalBooked extends Component {
    constructor(){
        super();
        this.searchinput = React.createRef();
        this.state = {
            previousBookingList: [],
            searchList: [], 
            displayAll: true,
            drivers: [],
            showDriverModal: false,
            selectedBooking: null,
            selectedDriver: '',
            loading: false,
            statusFilter: 'all',
            driverFilter: 'all',
            locationFilter: 'all',
            fromDate: '',
            toDate: '',
            fromLocation: '',
            toLocation: '',
            sortBy: 'date',
            sortOrder: 'desc',
            // Enhanced search functionality
            searchType: 'userid',
            searchTerm: '',
            searchResults: [],
            isSearching: false,
            searchSuggestions: [],
            showSuggestions: false,
            showReassignModal: false,
            sourceBooking: null,
            targetBooking: null,
            availableDrivers: [],
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
        this.fetchLocalBookings();
        this.fetchDrivers();
    }

    fetchLocalBookings = () => {
        fetch('http://localhost:8010/api/v1/carbookedusers',{
            headers:authHeader()
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data=>{
            console.log('Local bookings data:', data);
            if (data.success && data.data) {
                this.setState({previousBookingList: data.data});
                this.calculateBookingStats(data.data);
            } else {
                this.setState({previousBookingList: []});
                this.calculateBookingStats([]);
            }
        })
        .catch(error => {
            console.error('Error fetching local bookings:', error);
            this.setState({previousBookingList: []});
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

    handleStatusFilter = (status) => {
        this.setState({ statusFilter: status });
    }

    handleDriverFilter = (driverStatus) => {
        this.setState({ driverFilter: driverStatus });
    }

    handleLocationFilter = (location) => {
        this.setState({ locationFilter: location });
    }


    handleFromDateChange = (e) => {
        const fromDate = e.target.value;
        console.log('From date changed:', fromDate);
        
        // If toDate exists and is before the new fromDate, clear it
        if (this.state.toDate && fromDate && new Date(fromDate) > new Date(this.state.toDate)) {
            console.log('From date is after to date, clearing to date');
            this.setState({ fromDate, toDate: '' });
        } else {
            this.setState({ fromDate });
        }
    }

    handleToDateChange = (e) => {
        const toDate = e.target.value;
        console.log('To date changed:', toDate);
        
        // If fromDate exists and is after the new toDate, show warning
        if (this.state.fromDate && toDate && new Date(this.state.fromDate) > new Date(toDate)) {
            alert('To Date cannot be before From Date. Please select a valid date range.');
            return;
        }
        
        this.setState({ toDate });
    }

    handleFromLocationChange = (e) => {
        this.setState({ fromLocation: e.target.value });
    }

    handleToLocationChange = (e) => {
        this.setState({ toLocation: e.target.value });
    }

    handleQuickDateFilter = (period) => {
        console.log('Quick date filter clicked:', period);
        const today = new Date();
        let fromDate = '';
        let toDate = '';

        switch (period) {
            case 'today':
                fromDate = today.toISOString().split('T')[0];
                toDate = today.toISOString().split('T')[0];
                break;
            case 'week':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                fromDate = startOfWeek.toISOString().split('T')[0];
                toDate = today.toISOString().split('T')[0];
                break;
            case 'month':
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                fromDate = startOfMonth.toISOString().split('T')[0];
                toDate = today.toISOString().split('T')[0];
                break;
            case 'clear':
                fromDate = '';
                toDate = '';
                break;
            default:
                return;
        }

        console.log('Setting date range:', { fromDate, toDate });
        this.setState({ fromDate, toDate });
    }

    handleSortChange = (sortBy) => {
        const newSortOrder = this.state.sortBy === sortBy && this.state.sortOrder === 'asc' ? 'desc' : 'asc';
        this.setState({ sortBy, sortOrder: newSortOrder });
    }


    clearAllFilters = () => {
        this.setState({
            statusFilter: 'all',
            driverFilter: 'all',
            locationFilter: 'all',
            fromDate: '',
            toDate: '',
            fromLocation: '',
            toLocation: '',
            sortBy: 'date',
            sortOrder: 'desc'
        });
    }

    getFilteredBookings = () => {
        const { 
            previousBookingList, 
            searchList, 
            displayAll, 
            statusFilter, 
            driverFilter, 
            locationFilter, 
            dateFilter,
            fromDate,
            toDate,
            fromLocation,
            toLocation,
            sortBy,
            sortOrder
        } = this.state;
        
        let bookings = displayAll ? previousBookingList : searchList;
        
        // Apply status filter
        if (statusFilter !== 'all') {
            bookings = bookings.filter(booking => {
            const status = booking.status || 'assigned';
            return status === statusFilter;
        });
        }

        // Apply driver filter
        if (driverFilter !== 'all') {
            if (driverFilter === 'assigned') {
                bookings = bookings.filter(booking => booking.driver);
            } else if (driverFilter === 'unassigned') {
                bookings = bookings.filter(booking => !booking.driver);
            }
        }

        // Apply location filter
        if (locationFilter !== 'all') {
            if (fromLocation) {
                bookings = bookings.filter(booking => 
                    booking.FromLocation && 
                    booking.FromLocation.toLowerCase().includes(fromLocation.toLowerCase())
                );
            }
            if (toLocation) {
                bookings = bookings.filter(booking => 
                    booking.ToLocation && 
                    booking.ToLocation.toLowerCase().includes(toLocation.toLowerCase())
                );
            }
        }

        // Apply date filter
        if (fromDate || toDate) {
            console.log('Applying date filter:', { fromDate, toDate });
            const originalCount = bookings.length;
            
            bookings = bookings.filter(booking => {
                if (!booking.DateTime) {
                    console.log('Booking has no DateTime:', booking);
                    return false;
                }
                
                // Parse booking date and normalize to date only (remove time)
                const bookingDate = new Date(booking.DateTime);
                const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
                
                const from = fromDate ? new Date(fromDate) : null;
                const to = toDate ? new Date(toDate) : null;
                
                console.log('Checking booking date:', {
                    bookingDateTime: booking.DateTime,
                    bookingDate: bookingDate,
                    bookingDateOnly: bookingDateOnly,
                    from: from,
                    to: to,
                    fromCheck: from ? bookingDateOnly >= from : true,
                    toCheck: to ? bookingDateOnly <= to : true
                });
                
                // Compare dates only (ignore time)
                if (from && bookingDateOnly < from) {
                    console.log('Booking date is before from date');
                    return false;
                }
                if (to && bookingDateOnly > to) {
                    console.log('Booking date is after to date');
                    return false;
                }
                
                console.log('Booking date is within range');
                return true;
            });
            
            console.log(`Date filter applied: ${originalCount} -> ${bookings.length} bookings`);
        }

        // Apply sorting
        bookings.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'date':
                    aValue = new Date(a.DateTime || 0);
                    bValue = new Date(b.DateTime || 0);
                    break;
                case 'name':
                    aValue = (a.user_name || '').toLowerCase();
                    bValue = (b.user_name || '').toLowerCase();
                    break;
                case 'status':
                    aValue = (a.status || 'assigned').toLowerCase();
                    bValue = (b.status || 'assigned').toLowerCase();
                    break;
                case 'fromLocation':
                    aValue = (a.FromLocation || '').toLowerCase();
                    bValue = (b.FromLocation || '').toLowerCase();
                    break;
                case 'toLocation':
                    aValue = (a.ToLocation || '').toLowerCase();
                    bValue = (b.ToLocation || '').toLowerCase();
                    break;
                default:
                    return 0;
            }
            
            if (sortBy === 'date') {
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            } else {
                if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            }
        });
        
        return bookings;
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

    // Enhanced search functionality
    handleSearchTypeChange = (e) => {
        this.setState({ 
            searchType: e.target.value,
            searchTerm: '',
            searchResults: [],
            showSuggestions: false
        });
        if (this.searchinput && this.searchinput.current) {
            this.searchinput.current.value = '';
        }
    }

    handleSearchTermChange = (e) => {
        const searchTerm = e.target.value;
        this.setState({ searchTerm });
        
        // Generate suggestions for autocomplete
        if (searchTerm.length >= 2) {
            this.generateSearchSuggestions(searchTerm);
        } else {
            this.setState({ showSuggestions: false, searchSuggestions: [] });
        }
    }

    generateSearchSuggestions = (term) => {
        const { previousBookingList, searchType } = this.state;
        const suggestions = [];
        const termLower = term.toLowerCase();

        previousBookingList.forEach(booking => {
            let matchValue = '';
            switch (searchType) {
                case 'userid':
                    matchValue = booking.usernameid || '';
                    break;
                case 'name':
                    matchValue = booking.user_name || '';
                    break;
                case 'phone':
                    matchValue = booking.phoneNumber || '';
                    break;
                case 'email':
                    matchValue = booking.email || '';
                    break;
                case 'fromLocation':
                    matchValue = booking.FromLocation || '';
                    break;
                case 'toLocation':
                    matchValue = booking.ToLocation || '';
                    break;
                default:
                    return;
            }

            if (matchValue.toLowerCase().includes(termLower)) {
                const suggestion = {
                    value: matchValue,
                    booking: booking
                };
                
                // Avoid duplicates
                if (!suggestions.find(s => s.value === matchValue)) {
                    suggestions.push(suggestion);
                }
            }
        });

        this.setState({ 
            searchSuggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
            showSuggestions: suggestions.length > 0
        });
    }

    selectSuggestion = (suggestion) => {
        this.setState({
            searchTerm: suggestion.value,
            showSuggestions: false
        });
        if (this.searchinput && this.searchinput.current) {
            this.searchinput.current.value = suggestion.value;
        }
    }

    // Enhanced search method with multiple search types
    search = (e) => {
        e.preventDefault();
        const searchTerm = this.state.searchTerm.trim() || (this.searchinput.current ? this.searchinput.current.value.trim() : '');
        
        if (!searchTerm) {
            alert('Please enter a search term');
            return;
        }
        
        this.setState({ 
            isSearching: true,
            displayAll: false,
            showSuggestions: false
        });

        // Client-side search for better performance
        const results = this.performClientSideSearch(searchTerm);
        
        if (results.length > 0) {
            this.setState({ 
                searchList: results,
                searchResults: results,
                isSearching: false
            });
        } else {
            // Fallback to server-side search for User ID
            if (this.state.searchType === 'userid') {
                this.performServerSideSearch(searchTerm);
            } else {
                this.setState({ 
                    searchList: [],
                    searchResults: [],
                    isSearching: false
                });
                alert(`No bookings found for ${this.getSearchTypeLabel()}: ${searchTerm}`);
            }
        }
    }

    performClientSideSearch = (searchTerm) => {
        const { previousBookingList, searchType } = this.state;
        const termLower = searchTerm.toLowerCase();

        return previousBookingList.filter(booking => {
            let searchFields = [];
            
            switch (searchType) {
                case 'userid':
                    searchFields = [booking.usernameid];
                    break;
                case 'name':
                    searchFields = [booking.user_name, booking.usernameid];
                    break;
                case 'phone':
                    searchFields = [booking.phoneNumber];
                    break;
                case 'email':
                    searchFields = [booking.email];
                    break;
                case 'fromLocation':
                    searchFields = [booking.FromLocation];
                    break;
                case 'toLocation':
                    searchFields = [booking.ToLocation];
                    break;
                case 'all':
                    searchFields = [
                        booking.usernameid,
                        booking.user_name,
                        booking.phoneNumber,
                        booking.email,
                        booking.FromLocation,
                        booking.ToLocation
                    ];
                    break;
                default:
                    return false;
            }

            return searchFields.some(field => 
                field && field.toString().toLowerCase().includes(termLower)
            );
        });
    }

    performServerSideSearch = (searchTerm) => {
        fetch('http://localhost:8010/api/v1/carbookedusers/user/' + searchTerm, {
            headers: authHeader()
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('Server search results:', data);
            if (data.success && data.data) {
                this.setState({
                    searchList: data.data,
                    searchResults: data.data,
                    isSearching: false
                });
            } else {
                this.setState({
                    searchList: [],
                    searchResults: [],
                    isSearching: false
                });
                alert(`No bookings found for User ID: ${searchTerm}`);
            }
        })
        .catch(error => {
            console.error('Error searching bookings:', error);
            this.setState({
                searchList: [],
                searchResults: [],
                isSearching: false
            });
            alert('Error searching bookings. Please try again.');
        });
    }

    getSearchTypeLabel = () => {
        const labels = {
            'userid': 'User ID',
            'name': 'Customer Name',
            'phone': 'Phone Number',
            'email': 'Email',
            'fromLocation': 'Pickup Location',
            'toLocation': 'Drop Location',
            'all': 'Any Field'
        };
        return labels[this.state.searchType] || 'Field';
    }
 
    allbooking = (e) => {
        e.preventDefault();
        if (this.searchinput.current) {
            this.searchinput.current.value = "";
        }
        this.setState({
            displayAll: true,
            searchTerm: '',
            searchResults: [],
            searchSuggestions: [],
            showSuggestions: false,
            isSearching: false
        });
    }

    // Driver assignment methods
    handleAssignDriver = (booking) => {
        // Prevent assigning driver to cancelled bookings
        if (booking.status === 'cancelled') {
            alert('Cannot assign driver to a cancelled booking.');
            return;
        }
        
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

        // Double-check that the booking is not cancelled
        if (this.state.selectedBooking.status === 'cancelled') {
            alert('Cannot assign driver to a cancelled booking.');
            this.handleCloseModal();
            return;
        }

        // Check if driver is already assigned to another active booking
        const selectedDriver = this.state.drivers.find(d => d._id === this.state.selectedDriver);
        const driverActiveBookings = this.state.previousBookingList.filter(booking => 
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
            const response = await fetch(`http://localhost:8010/api/v1/carbookedusers/${this.state.selectedBooking._id}/assign-driver`, {
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
                this.fetchLocalBookings(); // Refresh the list
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
            const response = await fetch(`http://localhost:8010/api/v1/carbookedusers/${booking._id}/remove-driver`, {
                method: 'PATCH',
                headers: authHeader()
            });

            const data = await response.json();

            if (data.success) {
                alert('Driver removed successfully!');
                this.fetchLocalBookings(); // Refresh the list
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
            const response = await fetch(`http://localhost:8010/api/v1/carbookedusers/admin/assign-next/${driverId}`, {
                method: 'PATCH',
                headers: authHeader()
            });

            const data = await response.json();

            if (data.success) {
                alert('Next booking assigned successfully!');
                this.fetchLocalBookings(); // Refresh the list
            } else {
                alert(data.message || 'Failed to assign next booking');
            }
        } catch (error) {
            console.error('Error assigning next booking:', error);
            alert('Error assigning next booking. Please try again.');
        }
    }

    // Driver Reassignment Methods
    handleReassignDriver = (sourceBooking) => {
        // Only allow reassignment from completed or cancelled bookings
        if (sourceBooking.status !== 'completed' && sourceBooking.status !== 'cancelled') {
            alert('Driver can only be reassigned from completed or cancelled bookings.');
            return;
        }

        if (!sourceBooking.driver) {
            alert('This booking has no driver assigned.');
            return;
        }

        // Get available bookings (unassigned bookings)
        const availableBookings = this.state.previousBookingList.filter(booking => 
            !booking.driver && 
            booking.status !== 'completed' && 
            booking.status !== 'cancelled'
        );

        if (availableBookings.length === 0) {
            alert('No available bookings to reassign the driver to.');
            return;
        }

        this.setState({
            sourceBooking: sourceBooking,
            targetBooking: null,
            availableDrivers: availableBookings,
            showReassignModal: true
        });
    }

    handleTargetBookingChange = (e) => {
        const targetBookingId = e.target.value;
        const targetBooking = this.state.availableDrivers.find(booking => booking._id === targetBookingId);
        this.setState({ targetBooking });
    }

    handleReassignSubmit = async () => {
        if (!this.state.targetBooking) {
            alert('Please select a target booking to reassign the driver to.');
            return;
        }

        if (!window.confirm(`Are you sure you want to reassign driver ${this.state.sourceBooking.driver.name} from booking ${this.state.sourceBooking._id} to booking ${this.state.targetBooking._id}?`)) {
            return;
        }

        try {
            // First, remove driver from source booking
            const removeResponse = await fetch(`http://localhost:8010/api/v1/carbookedusers/${this.state.sourceBooking._id}/remove-driver`, {
                method: 'PATCH',
                headers: authHeader()
            });

            const removeData = await removeResponse.json();

            if (!removeData.success) {
                alert('Failed to remove driver from source booking: ' + removeData.message);
                return;
            }

            // Then, assign driver to target booking
            const assignResponse = await fetch(`http://localhost:8010/api/v1/carbookedusers/${this.state.targetBooking._id}/assign-driver`, {
                method: 'PATCH',
                headers: {
                    ...authHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    driverId: this.state.sourceBooking.driver._id
                })
            });

            const assignData = await assignResponse.json();

            if (assignData.success) {
                alert('Driver reassigned successfully!');
                this.fetchLocalBookings(); // Refresh the list
                this.handleCloseReassignModal();
            } else {
                alert('Failed to assign driver to target booking: ' + assignData.message);
                // Try to restore driver to source booking
                await fetch(`http://localhost:8010/api/v1/carbookedusers/${this.state.sourceBooking._id}/assign-driver`, {
                    method: 'PATCH',
                    headers: {
                        ...authHeader(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        driverId: this.state.sourceBooking.driver._id
                    })
                });
            }
        } catch (error) {
            console.error('Error reassigning driver:', error);
            alert('Error reassigning driver. Please try again.');
        }
    }

    handleCloseReassignModal = () => {
        this.setState({
            showReassignModal: false,
            sourceBooking: null,
            targetBooking: null,
            availableDrivers: []
        });
    }

    render() {
        const display = this.getFilteredBookings();

        console.log("length => ",display.length)
        let FetchedData;
        if(!display.length){
            FetchedData = (
                <tr>
                    <td colSpan="9" className="text-center">
                        {this.state.displayAll ? "No local bookings found" : "No bookings found for this user"}
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
                            <td>{previousBooking.user_name || 'N/A'}</td>
                            <td>{previousBooking.phoneNumber || 'N/A'}</td>
                            <td>{previousBooking.FromLocation || 'N/A'}</td>
                            <td>{previousBooking.ToLocation || 'N/A'}</td>
                            <td>{previousBooking.DateTime || 'N/A'}</td>
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
                                        {(previousBooking.status === 'completed' || previousBooking.status === 'cancelled') && (
                                            <Button 
                                                size="sm" 
                                                variant="outline-warning" 
                                                onClick={() => this.handleReassignDriver(previousBooking)}
                                                className="mt-1 btn-reassign"
                                                title="Reassign driver to another booking"
                                            >
                                                <i className="fas fa-exchange-alt mr-1"></i>
                                                Reassign Driver
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
                        <h2 className="mb-4">Local Package Booked List</h2>
                        
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
                                                const driverActiveBookings = this.state.previousBookingList.filter(booking => 
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
                        
                        {/* Search and Basic Filters */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <i className="fas fa-search mr-2"></i>
                                    Search & Filter Bookings
                                </h5>
                            </div>
                            <div className="card-body">
                                {/* Enhanced Search Section */}
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <div className="card">
                                            <div className="card-header">
                                                <h6 className="mb-0">
                                                    <i className="fas fa-search mr-2"></i>
                                                    Enhanced Search
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <form className="form-inline mb-3" onSubmit={this.search}>
                            <div className="form-group mr-3">
                                                        <select 
                                                            className="form-control mr-2" 
                                                            value={this.state.searchType}
                                                            onChange={this.handleSearchTypeChange}
                                                            style={{minWidth: '150px'}}
                                                        >
                                                            <option value="userid">User ID</option>
                                                            <option value="name">Customer Name</option>
                                                            <option value="phone">Phone Number</option>
                                                            <option value="email">Email</option>
                                                            <option value="fromLocation">Pickup Location</option>
                                                            <option value="toLocation">Drop Location</option>
                                                            <option value="all">Search All Fields</option>
                                                        </select>
                                                    </div>
                                                    
                                                    <div className="form-group mr-3 position-relative">
                                <input 
                                    type="text"  
                                    ref={this.searchinput} 
                                    className="form-control" 
                                    id="inputsearch" 
                                                            placeholder={`Search by ${this.getSearchTypeLabel()}...`}
                                    autoComplete="off"
                                                            value={this.state.searchTerm}
                                                            onChange={this.handleSearchTermChange}
                                                            style={{minWidth: '250px'}}
                                                        />
                                                        
                                                        {/* Search Suggestions Dropdown */}
                                                        {this.state.showSuggestions && this.state.searchSuggestions.length > 0 && (
                                                            <div className="dropdown-menu show position-absolute w-100" style={{top: '100%', zIndex: 1000}}>
                                                                {this.state.searchSuggestions.map((suggestion, index) => (
                                                                    <button
                                                                        key={index}
                                                                        type="button"
                                                                        className="dropdown-item"
                                                                        onClick={() => this.selectSuggestion(suggestion)}
                                                                    >
                                                                        <div>
                                                                            <strong>{suggestion.value}</strong>
                                                                            {suggestion.booking.user_name && (
                                                                                <div className="text-muted small">
                                                                                    {suggestion.booking.user_name} • {suggestion.booking.phoneNumber}
                            </div>
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                            <button 
                                type="submit" 
                                className="btn btn-warning mr-2" 
                                                        disabled={this.state.isSearching}
                                                    >
                                                        {this.state.isSearching ? (
                                                            <>
                                                                <i className="fas fa-spinner fa-spin mr-1"></i>
                                                                Searching...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-search mr-1"></i>
                                Search
                                                            </>
                                                        )}
                            </button>
                                                    
                            <button 
                                                        type="button" 
                                className="btn btn-secondary mr-2" 
                                                        onClick={this.allbooking}
                            >
                                                        <i className="fas fa-list mr-1"></i>
                                All Bookings
                            </button>
                                                    
                                                    
                            <button 
                                type="button" 
                                                        className="btn btn-outline-danger mr-2" 
                                                        onClick={this.clearAllFilters}
                            >
                                                        <i className="fas fa-times mr-1"></i>
                                                        Clear All
                            </button>
                                                </form>
                                                
                                                {/* Search Results Summary */}
                                                {!this.state.displayAll && (
                                                    <div className="alert alert-info mb-0">
                                                        <i className="fas fa-info-circle mr-2"></i>
                                                        <strong>Search Results:</strong> 
                                                        {this.state.searchResults.length} booking(s) found for "{this.state.searchTerm}" 
                                                        in {this.getSearchTypeLabel()}
                            <button 
                                type="button" 
                                                            className="btn btn-sm btn-outline-secondary ml-2" 
                                                            onClick={this.allbooking}
                                                        >
                                                            <i className="fas fa-times mr-1"></i>
                                                            Clear Search
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Filter Buttons */}
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <div className="btn-group mr-2" role="group">
                                            <button 
                                                type="button" 
                                                className={`btn ${this.state.statusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => this.handleStatusFilter('all')}
                            >
                                <i className="fas fa-list mr-1"></i>
                                                All Status
                            </button>
                                            <button 
                                                type="button" 
                                                className={`btn ${this.state.statusFilter === 'in_progress' ? 'btn-warning' : 'btn-outline-warning'}`}
                                                onClick={() => this.handleStatusFilter('in_progress')}
                                            >
                                                <i className="fas fa-clock mr-1"></i>
                                                In Progress
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`btn ${this.state.statusFilter === 'completed' ? 'btn-success' : 'btn-outline-success'}`}
                                                onClick={() => this.handleStatusFilter('completed')}
                                            >
                                                <i className="fas fa-check-circle mr-1"></i>
                                                Completed
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`btn ${this.state.statusFilter === 'cancelled' ? 'btn-danger' : 'btn-outline-danger'}`}
                                                onClick={() => this.handleStatusFilter('cancelled')}
                                            >
                                                <i className="fas fa-times-circle mr-1"></i>
                                                Cancelled
                                            </button>
                                        </div>
                                        
                                        <div className="btn-group ml-2" role="group">
                                            <button 
                                                type="button" 
                                                className={`btn ${this.state.driverFilter === 'all' ? 'btn-info' : 'btn-outline-info'}`}
                                                onClick={() => this.handleDriverFilter('all')}
                                            >
                                                <i className="fas fa-users mr-1"></i>
                                                All Drivers
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`btn ${this.state.driverFilter === 'assigned' ? 'btn-success' : 'btn-outline-success'}`}
                                                onClick={() => this.handleDriverFilter('assigned')}
                                            >
                                                <i className="fas fa-user-check mr-1"></i>
                                                Assigned
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`btn ${this.state.driverFilter === 'unassigned' ? 'btn-warning' : 'btn-outline-warning'}`}
                                                onClick={() => this.handleDriverFilter('unassigned')}
                                            >
                                                <i className="fas fa-user-plus mr-1"></i>
                                                Unassigned
                                            </button>
                            </div>
                                    </div>
                                </div>

                                {/* Date Filter Section */}
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <div className="card date-filter-card">
                                            <div className="card-header">
                                                <h6 className="mb-0">
                                                    <i className="fas fa-calendar-alt mr-2"></i>
                                                    Date Filter
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        <label className="form-label date-filter-label">From Date</label>
                                                        <input 
                                                            type="date" 
                                                            className="form-control date-input" 
                                                            value={this.state.fromDate}
                                                            onChange={this.handleFromDateChange}
                                                            placeholder="Select start date"
                                                            max={this.state.toDate || new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label date-filter-label">To Date</label>
                                                        <input 
                                                            type="date" 
                                                            className="form-control date-input" 
                                                            value={this.state.toDate}
                                                            onChange={this.handleToDateChange}
                                                            placeholder="Select end date"
                                                            min={this.state.fromDate || undefined}
                                                            max={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label date-filter-label">Quick Date Filters</label>
                                                        <div className="btn-group w-100" role="group">
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-outline-secondary btn-sm quick-date-btn"
                                                                onClick={() => this.handleQuickDateFilter('today')}
                                                            >
                                                                Today
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-outline-secondary btn-sm quick-date-btn"
                                                                onClick={() => this.handleQuickDateFilter('week')}
                                                            >
                                                                This Week
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-outline-secondary btn-sm quick-date-btn"
                                                                onClick={() => this.handleQuickDateFilter('month')}
                                                            >
                                                                This Month
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-outline-secondary btn-sm quick-date-btn"
                                                                onClick={() => this.handleQuickDateFilter('clear')}
                                                            >
                                                                Clear
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Date Range Display */}
                                                {(this.state.fromDate || this.state.toDate) && (
                                                    <div className="date-range-display">
                                                        <i className="fas fa-calendar-check"></i>
                                                        <strong>Filtering by date range:</strong> 
                                                        {this.state.fromDate ? ` From ${this.state.fromDate}` : ' From beginning'} 
                                                        {this.state.toDate ? ` to ${this.state.toDate}` : ' to present'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>


        {/* Filter Status Header */}
        {(this.state.statusFilter !== 'all' || this.state.driverFilter !== 'all' || this.state.fromDate || this.state.toDate || this.state.fromLocation || this.state.toLocation) && (
            <div className="alert alert-info mb-3">
                <i className="fas fa-filter mr-2"></i>
                <strong>Active Filters:</strong>
                <div className="mt-2">
                    {this.state.statusFilter !== 'all' && (
                        <span className="badge badge-primary mr-2">
                            Status: {this.state.statusFilter.charAt(0).toUpperCase() + this.state.statusFilter.slice(1)}
                        </span>
                    )}
                    {this.state.driverFilter !== 'all' && (
                        <span className="badge badge-info mr-2">
                            Driver: {this.state.driverFilter.charAt(0).toUpperCase() + this.state.driverFilter.slice(1)}
                        </span>
                    )}
                    {(this.state.fromDate || this.state.toDate) && (
                        <span className="badge badge-warning mr-2">
                            Date: {this.state.fromDate || 'Any'} to {this.state.toDate || 'Any'}
                        </span>
                    )}
                    {(this.state.fromLocation || this.state.toLocation) && (
                        <span className="badge badge-success mr-2">
                            Location: {this.state.fromLocation || 'Any'} → {this.state.toLocation || 'Any'}
                        </span>
                    )}
                    <span className="badge badge-secondary mr-2">
                        Sort: {this.state.sortBy} ({this.state.sortOrder})
                    </span>
                </div>
                <div className="mt-2">
                    <strong>Results:</strong> {display.length} booking{display.length !== 1 ? 's' : ''} found
                <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary ml-2" 
                        onClick={this.clearAllFilters}
                >
                    <i className="fas fa-times mr-1"></i>
                        Clear All Filters
                </button>
                </div>
            </div>
        )}

        <Table responsive className="table table-striped">
            <thead className={this.state.statusFilter === 'cancelled' ? 'thead-danger' : 'thead-dark'}>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">User Id</th>
                    <th 
                        scope="col" 
                        style={{cursor: 'pointer'}}
                        onClick={() => this.handleSortChange('name')}
                        title="Click to sort by name"
                    >
                        Booked by
                        {this.state.sortBy === 'name' && (
                            <i className={`fas fa-sort-${this.state.sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>
                        )}
                    </th>
                    <th scope="col">Phone No.</th>
                    <th 
                        scope="col" 
                        style={{cursor: 'pointer'}}
                        onClick={() => this.handleSortChange('fromLocation')}
                        title="Click to sort by pickup location"
                    >
                        Pick Up
                        {this.state.sortBy === 'fromLocation' && (
                            <i className={`fas fa-sort-${this.state.sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>
                        )}
                    </th>
                    <th 
                        scope="col" 
                        style={{cursor: 'pointer'}}
                        onClick={() => this.handleSortChange('toLocation')}
                        title="Click to sort by drop location"
                    >
                        Drop
                        {this.state.sortBy === 'toLocation' && (
                            <i className={`fas fa-sort-${this.state.sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>
                        )}
                    </th>
                    <th 
                        scope="col" 
                        style={{cursor: 'pointer'}}
                        onClick={() => this.handleSortChange('date')}
                        title="Click to sort by booking date"
                    >
                        Booked Date
                        {this.state.sortBy === 'date' && (
                            <i className={`fas fa-sort-${this.state.sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>
                        )}
                    </th>
                    <th 
                        scope="col" 
                        style={{cursor: 'pointer'}}
                        onClick={() => this.handleSortChange('status')}
                        title="Click to sort by status"
                    >
                        Status
                        {this.state.sortBy === 'status' && (
                            <i className={`fas fa-sort-${this.state.sortOrder === 'asc' ? 'up' : 'down'} ml-1`}></i>
                        )}
                    </th>
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

        {/* Driver Reassignment Modal */}
        <Modal show={this.state.showReassignModal} onHide={this.handleCloseReassignModal} size="lg" className="reassign-modal">
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fas fa-exchange-alt mr-2"></i>
                    Reassign Driver
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {this.state.sourceBooking && (
                    <div>
                        <div className="alert alert-info">
                            <h6><i className="fas fa-info-circle mr-2"></i>Source Booking</h6>
                            <p className="mb-1">
                                <strong>Driver:</strong> {this.state.sourceBooking.driver.name} ({this.state.sourceBooking.driver.email})
                            </p>
                            <p className="mb-1">
                                <strong>From:</strong> {this.state.sourceBooking.FromLocation} → {this.state.sourceBooking.ToLocation}
                            </p>
                            <p className="mb-1">
                                <strong>Customer:</strong> {this.state.sourceBooking.user_name} ({this.state.sourceBooking.phoneNumber})
                            </p>
                            <p className="mb-0">
                                <strong>Status:</strong> 
                                <span className={`badge ml-2 ${
                                    this.state.sourceBooking.status === 'completed' ? 'badge-success' : 'badge-danger'
                                }`}>
                                    {this.state.sourceBooking.status}
                                </span>
                            </p>
                        </div>

                        <Form>
                            <Form.Group>
                                <Form.Label>Select Target Booking:</Form.Label>
                                <Form.Control 
                                    as="select" 
                                    value={this.state.targetBooking ? this.state.targetBooking._id : ''}
                                    onChange={this.handleTargetBookingChange}
                                >
                                    <option value="">Choose a booking to reassign driver to...</option>
                                    {this.state.availableDrivers.map(booking => (
                                        <option key={booking._id} value={booking._id}>
                                            {booking.user_name} - {booking.FromLocation} → {booking.ToLocation} 
                                            ({booking.DateTime ? new Date(booking.DateTime).toLocaleDateString() : 'No date'})
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            {this.state.targetBooking && (
                                <div className="alert alert-warning">
                                    <h6><i className="fas fa-exclamation-triangle mr-2"></i>Target Booking</h6>
                                    <p className="mb-1">
                                        <strong>Customer:</strong> {this.state.targetBooking.user_name} ({this.state.targetBooking.phoneNumber})
                                    </p>
                                    <p className="mb-1">
                                        <strong>Route:</strong> {this.state.targetBooking.FromLocation} → {this.state.targetBooking.ToLocation}
                                    </p>
                                    <p className="mb-0">
                                        <strong>Date:</strong> {this.state.targetBooking.DateTime ? new Date(this.state.targetBooking.DateTime).toLocaleString() : 'No date'}
                                    </p>
                                </div>
                            )}
                        </Form>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={this.handleCloseReassignModal}>
                    Cancel
                </Button>
                <Button 
                    variant="warning" 
                    onClick={this.handleReassignSubmit}
                    disabled={!this.state.targetBooking}
                >
                    <i className="fas fa-exchange-alt mr-1"></i>
                    Reassign Driver
                </Button>
            </Modal.Footer>
        </Modal>
      </div>
    )
   }
}
