import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import authHeader from '../services/auth-header'
import AuthService from '../services/auth'
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge'

export default class UserBookingList extends Component {
    constructor(){
        super();
        this.state = {
            previousBookingList: [],
            feedbackEligibility: {},
            message: ''
        }
    }

    componentDidMount(){
        const userid = AuthService.finduserid();
        
        if(!userid){
            console.log('❌ No user ID found');
            this.setState({previousBookingList: []});
            return;
        }
        
        console.log('✅ Fetching bookings for user:', userid);
        
        fetch(`http://localhost:8010/api/v1/carbookedusers/user/${userid}`, {
            headers: authHeader()
        })
        .then(res => {
            if(!res.ok){
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('✅ Bookings fetched:', data);
            const bookings = data.data || [];
            this.setState({previousBookingList: bookings});
            
            // Check feedback eligibility for each booking
            this.checkFeedbackEligibility(bookings);
        })
        .catch(err => {
            console.error('❌ Failed to fetch bookings:', err);
            this.setState({previousBookingList: []});
        });
    }

    checkFeedbackEligibility = async (bookings) => {
        const eligibility = {};
        
        for (const booking of bookings) {
            try {
                const response = await fetch(`http://localhost:8010/api/v1/feedback/check-eligibility/${booking._id}?bookingType=local`, {
                    headers: authHeader()
                });
                
                if (response.ok) {
                    const data = await response.json();
                    eligibility[booking._id] = data.data;
                } else {
                    eligibility[booking._id] = { canSubmitFeedback: false };
                }
            } catch (error) {
                console.error('Error checking feedback eligibility:', error);
                eligibility[booking._id] = { canSubmitFeedback: false };
            }
        }
        
        this.setState({ feedbackEligibility: eligibility });
    };

    deletepreviousBooking(id){
        fetch('http://localhost:8010/api/v1/carbookedusers/' + id, {
        headers:authHeader(),    
        method: 'DELETE' 
        })
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            this.setState({message: 'Record successfully deleted'})
            var Userid  =  AuthService.finduserid();
                fetch('http://localhost:8010/api/v1/carbookedusers/'+ Userid,{
                    headers:authHeader()
                })
                .then(res=>res.json())
                .then(data=>{
                    this.setState({previousBookingList : data})
                });
        });
    }

    cancelBooking = (id) => {
        console.log('🔄 Attempting to cancel booking:', id);
        
        if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            console.log('✅ User confirmed cancellation');
            
            const headers = authHeader();
            console.log('📤 Request headers:', headers);
            
            fetch(`http://localhost:8010/api/v1/carbookedusers/${id}/cancel`, {
                method: 'PATCH',
                headers: headers
            })
            .then(res => {
                console.log('📥 Response status:', res.status);
                console.log('📥 Response headers:', Object.fromEntries(res.headers.entries()));
                
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('📥 Response data:', data);
                
                if (data.success) {
                    console.log('✅ Booking cancelled successfully');
                    this.setState({ message: 'Booking cancelled successfully' });
                    
                    // Refresh the booking list
                    const userid = AuthService.finduserid();
                    console.log('🔄 Refreshing booking list for user:', userid);
                    
                    fetch(`http://localhost:8010/api/v1/carbookedusers/user/${userid}`, {
                        headers: authHeader()
                    })
                    .then(res => res.json())
                    .then(data => {
                        console.log('📥 Refreshed booking list:', data);
                        const bookings = data.data || [];
                        this.setState({ previousBookingList: bookings });
                    })
                    .catch(err => {
                        console.error('❌ Error refreshing booking list:', err);
                    });
                } else {
                    console.error('❌ Cancellation failed:', data.message);
                    this.setState({ message: `Failed to cancel booking: ${data.message}` });
                }
            })
            .catch(err => {
                console.error('❌ Error cancelling booking:', err);
                this.setState({ message: `Failed to cancel booking: ${err.message}` });
            });
        } else {
            console.log('❌ User cancelled the cancellation');
        }
    }

    render() {
        console.log("length => ",this.state.previousBookingList.length )
        let previousBookingDataList;
        if(!this.state.previousBookingList.length){
            previousBookingDataList = (
                <tr>
                    <td colSpan="9" className="text-center">Not yet Booked any travel !</td>
                </tr>
            );
        }else{
            previousBookingDataList = this.state.previousBookingList.map((previousBooking, i)=>{
                return (
                        <tr key={i}>
                            <th scope="row">{i+1}</th>
                            <td>{previousBooking.user_name}</td>
                            <td>{previousBooking.phoneNumber}</td>
                            <td>{previousBooking.FromLocation}</td>
                            <td>{previousBooking.ToLocation}</td>
                            <td>{previousBooking.DateTime}</td>
                            <td>
                                {previousBooking.driver ? (
                                    <div>
                                        <Badge variant="success">
                                            <i className="fas fa-user-check mr-1"></i>
                                            {previousBooking.driver.name}
                                        </Badge>
                                        <br />
                                        <small className="text-muted">
                                            {previousBooking.driver.phone}
                                        </small>
                                    </div>
                                ) : (
                                    <Badge variant="secondary">
                                        <i className="fas fa-user-times mr-1"></i>
                                        No Driver Assigned
                                    </Badge>
                                )}
                            </td>
                            <td>
                                <Badge variant={
                                    previousBooking.status === 'completed' ? 'success' :
                                    previousBooking.status === 'in_progress' ? 'warning' :
                                    previousBooking.status === 'cancelled' ? 'danger' : 'secondary'
                                }>
                                    {previousBooking.status || 'assigned'}
                                </Badge>
                            </td>
                            <td>
                                {/* Cancel button - only show for bookings that can be cancelled */}
                                {(previousBooking.status === 'assigned' || previousBooking.status === 'in_progress') && (
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            console.log('🔘 Cancel button clicked for booking:', previousBooking._id, 'Status:', previousBooking.status);
                                            this.cancelBooking(previousBooking._id);
                                        }} 
                                        className="btn btn-warning m-1"
                                        title="Cancel this booking"
                                    >
                                        <i className="fas fa-times mr-1"></i>
                                        Cancel
                                    </button>
                                )}
                                {/* Show cancelled status for cancelled bookings */}
                                {previousBooking.status === 'cancelled' && (
                                    <span className="text-muted">
                                        <i className="fas fa-ban mr-1"></i>
                                        Cancelled
                                    </span>
                                )}
                                <button type="button" onClick={this.deletepreviousBooking.bind(this, previousBooking._id)} className="btn btn-danger m-1"> Delete </button>
                                {this.state.feedbackEligibility[previousBooking._id]?.canSubmitFeedback ? (
                                    <Link 
                                        to={{
                                            pathname: '/feedback-form',
                                            state: {
                                                bookingData: {
                                                    bookingType: 'local',
                                                    bookingId: previousBooking._id
                                                }
                                            }
                                        }}
                                        className="btn btn-success m-1"
                                    >
                                        Give Feedback
                                    </Link>
                                ) : this.state.feedbackEligibility[previousBooking._id]?.hasFeedback ? (
                                    <span className="btn btn-secondary m-1" disabled>
                                        Feedback Given
                                    </span>
                                ) : (
                                    <span className="btn btn-outline-secondary m-1" disabled>
                                        No Driver Assigned
                                    </span>
                                )}
                            </td>
                        </tr>
                );
            })
        }
    return (
        <div className="MainDiv">
        <h1 className="bookinglist">Local Package Booking List</h1>
        
        {/* Success/Error Message Display */}
        {this.state.message && (
            <div className={`alert ${this.state.message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                <i className={`fas ${this.state.message.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
                {this.state.message}
                <button 
                    type="button" 
                    className="close" 
                    onClick={() => this.setState({ message: '' })}
                    aria-label="Close"
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        )}
        
        <Table responsive className="table table-striped">
            <thead className="thead-dark">
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Name</th>
                    <th scope="col">Phone No.</th>
                    <th scope="col">Pick Up</th>
                    <th scope="col">Drop</th>
                    <th scope="col">Booked Date</th>
                    <th scope="col">Assigned Driver</th>
                    <th scope="col">Status</th>
                    <th scope="col">Any changes</th>
                </tr>
            </thead>
            <tbody>
                {previousBookingDataList}
            </tbody>
        </Table>
      </div>
    )
   }
}

