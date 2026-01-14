import React, { Component } from 'react'
import {Link} from "react-router-dom";
import AuthService from '../services/auth'
import authHeader from '../services/auth-header'
import SessionManager from '../services/sessionManager'

export default class ConfirmBooking extends Component {
    constructor(props){
        super(props);
        
        // Get data from SessionManager
        const sessionData = SessionManager.getBookingSessionData();
        const userName = sessionData.userName;
        const phoneNumber = sessionData.phoneNumber;
        const pickupLocation = sessionData.pickupLocation;
        const dropLocation = sessionData.dropLocation;
        
        this.state = {
            userName: userName || '',
            phoneNumber: phoneNumber || '',
            pickupLocation: pickupLocation || '',
            dropLocation: dropLocation || '',
            isLoading: false,
            error: null
        };
        
        console.log('✅ ConfirmBooking initialized with data:', this.state);
    }

    componentDidMount(){
        // Check if all required data is present
        if(!this.state.userName || !this.state.phoneNumber || !this.state.pickupLocation || !this.state.dropLocation){
            alert('Missing booking information. Please start over.');
            this.props.history.push('/localnewbooking');
            return;
        }
        
        // Check authentication
        if(!AuthService.isAuthenticated() || AuthService.findrole() !== "user"){
            alert('Please login to confirm booking');
            this.props.history.push('/login');
            return;
        }
        
        console.log('✅ ConfirmBooking ready - All data present');
    }

    submitBooking = async () => {
        try {
            this.setState({ isLoading: true, error: null });
            
            // Get user authentication data
            const userid = AuthService.finduserid();
            const usernameid = AuthService.findusername();
            
            if(!userid || !usernameid){
                alert('Authentication error. Please login again.');
                this.props.history.push('/login');
                return;
            }
            
            // Prepare booking data
            const bookingData = {
                FromLocation: this.state.pickupLocation,
                ToLocation: this.state.dropLocation,
                user_name: this.state.userName,
                phoneNumber: this.state.phoneNumber,
                user: userid,
                usernameid: usernameid
            };
            
            console.log('✅ Submitting booking:', bookingData);
            
            // Make API call
            const response = await fetch('http://localhost:8010/api/v1/carbookedusers', {
                method: 'POST',
                headers: {
                    ...authHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });
            
            const result = await response.json();
            
            if(response.ok && result.success){
                console.log('✅ Booking created successfully:', result.data);
                
                // Clear session data
                this.clearSessionData();
                
                // Show success message
                alert('Booking confirmed successfully!');
                
                // Redirect to thank you page
                this.props.history.push('/thankyou');
            } else {
                console.error('❌ Booking failed:', result.message);
                this.setState({ error: result.message || 'Booking failed' });
                alert(result.message || 'Booking failed. Please try again.');
            }
            
        } catch (error) {
            console.error('❌ Booking error:', error);
            this.setState({ error: 'Network error. Please try again.' });
            alert('Network error. Please try again.');
        } finally {
            this.setState({ isLoading: false });
        }
    }

    clearSessionData = () => {
        SessionManager.clearBookingSession();
        console.log('✅ Session data cleared');
    }

    cancelBooking = () => {
        if(window.confirm('Are you sure you want to cancel this booking?')){
            this.clearSessionData();
            this.props.history.push('/localnewbooking');
        }
    }

    render(){
        const { userName, phoneNumber, pickupLocation, dropLocation, isLoading, error } = this.state;
        
        return (
            <div className="MainDiv">
                <div className="container mt-4">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-header bg-success text-white">
                                    <h4 className="mb-0">
                                        <i className="fas fa-check-circle mr-2"></i>
                                        Confirm Your Booking
                                    </h4>
                                </div>
                                <div className="card-body">
                                    {/* Error Display */}
                                    {error && (
                                        <div className="alert alert-danger">
                                            <i className="fas fa-exclamation-triangle mr-2"></i>
                                            {error}
                                        </div>
                                    )}
                                    
                                    {/* Booking Summary */}
                                    <div className="booking-summary">
                                        <h5 className="mb-3">
                                            <i className="fas fa-clipboard-list mr-2"></i>
                                            Booking Summary
                                        </h5>
                                        
                                        {/* User Details */}
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <div className="info-item">
                                                    <strong>
                                                        <i className="fas fa-user mr-2"></i>
                                                        Name:
                                                    </strong>
                                                    <span className="ml-2">{userName}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-item">
                                                    <strong>
                                                        <i className="fas fa-phone mr-2"></i>
                                                        Phone:
                                                    </strong>
                                                    <span className="ml-2">{phoneNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Location Details */}
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <div className="info-item">
                                                    <strong>
                                                        <i className="fas fa-map-marker-alt mr-2 text-primary"></i>
                                                        Pickup:
                                                    </strong>
                                                    <span className="ml-2">{pickupLocation}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-item">
                                                    <strong>
                                                        <i className="fas fa-location-arrow mr-2 text-success"></i>
                                                        Drop:
                                                    </strong>
                                                    <span className="ml-2">{dropLocation}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Booking Date */}
                                        <div className="row mb-3">
                                            <div className="col-12">
                                                <div className="info-item">
                                                    <strong>
                                                        <i className="fas fa-calendar mr-2"></i>
                                                        Booking Date:
                                                    </strong>
                                                    <span className="ml-2">{new Date().toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="text-center mt-4">
                                        <button 
                                            type="button" 
                                            className="btn btn-success btn-lg mr-3" 
                                            onClick={this.submitBooking}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                                    Confirming...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-check mr-2"></i>
                                                    Confirm Booking
                                                </>
                                            )}
                                        </button>
                                        
                                        <button 
                                            type="button" 
                                            className="btn btn-danger btn-lg" 
                                            onClick={this.cancelBooking}
                                            disabled={isLoading}
                                        >
                                            <i className="fas fa-times mr-2"></i>
                                            Cancel
                                        </button>
                                    </div>
                                    
                                    {/* Navigation Links */}
                                    <div className="text-center mt-4">
                                        <Link to="/localnewbooking" className="btn btn-outline-secondary mr-2">
                                            <i className="fas fa-arrow-left mr-2"></i>
                                            Back to Booking
                                        </Link>
                                        <Link to="/homepage" className="btn btn-outline-primary">
                                            <i className="fas fa-home mr-2"></i>
                                            Home
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}