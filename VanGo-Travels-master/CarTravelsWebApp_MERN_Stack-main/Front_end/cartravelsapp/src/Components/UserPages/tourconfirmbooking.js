import React, { Component } from 'react'
import {Link} from "react-router-dom";
import authHeader from '../services/auth-header';
import AuthService from '../services/auth'
import SessionManager from '../services/sessionManager'

export default class TourConfirmBooking extends Component {
    constructor(props){
        super(props);
        
        // Safely extract data from props with fallbacks
        const locationQuery = props.location?.query || {};
        const locationState = props.location?.state || {};
        
        // Try to get data from props, then from sessionStorage as fallback
        const tourconfirmbooking = locationQuery.confirmdata || locationState.confirmdata || JSON.parse(sessionStorage.getItem('tourBookingData') || '[]');
        const UserName = locationQuery.UserName || locationState.UserName || sessionStorage.getItem('tourUserName') || '';
        const PhoneNumber = locationQuery.PhoneNumber || locationState.PhoneNumber || sessionStorage.getItem('tourPhoneNumber') || '';
        
        this.state = {
            tourconfirmbooking: tourconfirmbooking,
            UserName: UserName,
            PhoneNumber: PhoneNumber,
            userselectedDetails: [],
            error: null
        }
        
        console.log('TourConfirmBooking initialized with:', {
            tourconfirmbooking: this.state.tourconfirmbooking,
            UserName: this.state.UserName,
            PhoneNumber: this.state.PhoneNumber
        });
    }

    componentDidMount() {
        // Validate that we have the required data
        if (!this.state.tourconfirmbooking || this.state.tourconfirmbooking.length === 0) {
            console.error('❌ No tour booking data found');
            this.setState({ error: 'No tour booking data found. Please select a tour package first.' });
            // Redirect to tour package list after a short delay
            setTimeout(() => {
                this.props.history.push('/tourpackagelist');
            }, 3000);
            return;
        }

        if (!this.state.UserName || !this.state.PhoneNumber) {
            console.error('❌ Missing user details');
            this.setState({ error: 'Missing user details. Please provide your name and phone number.' });
            return;
        }

        console.log('✅ TourConfirmBooking data validated successfully');
    }

    submittourbooked(){
        // Validate data before submission
        if (!this.state.tourconfirmbooking || this.state.tourconfirmbooking.length < 4) {
            alert('Invalid tour booking data. Please select a tour package again.');
            this.props.history.push('/tourpackagelist');
            return;
        }

        if (!this.state.UserName || !this.state.PhoneNumber) {
            alert('Please provide your name and phone number.');
            return;
        }

        var userid = AuthService.finduserid();
        var usernameid = AuthService.findusername();
        
        if(!userid || !usernameid){
            alert('Please log in to book');
            return;
        }
        
        const bookingData = {
            name: this.state.UserName,
            phoneNumber: this.state.PhoneNumber,
            packagename: this.state.tourconfirmbooking[0],
            packageprice: this.state.tourconfirmbooking[1],
            carType: this.state.tourconfirmbooking[2],
            noofdays: this.state.tourconfirmbooking[3],
            packageDate: new Date().toLocaleString(),
            user: userid,
            usernameid: usernameid
        };

        console.log('Submitting tour booking:', bookingData);
        
        fetch('http://localhost:8010/api/v1/cartourbookedusers', {
            method: 'POST',
            headers: {
                ...authHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData),
        })
        .then(res=>{
            if(res.status === 201){
                // Clear any tour session data
                sessionStorage.removeItem('tourUserName');
                sessionStorage.removeItem('tourPhoneNumber');
                sessionStorage.removeItem('tourBookingData');
                
                alert('Tour booking confirmed successfully!');
                this.props.history.push("/thankyou");
            } else {
                return res.json().then(err => {
                    alert(err.message || 'Booking failed');
                });
            }
        })
        .catch(err => {
            console.error('Booking error:', err);
            alert('Network error. Please try again.');
        });
    }

    cancel(){
        alert("You're at the door step !\nWe will be waiting for your Booking\nThank You!")
        this.props.history.push("/tourpackagelist");
    }

    render() {
        const { tourconfirmbooking, UserName, PhoneNumber, error } = this.state;

        // Show error state if there's an error
        if (error) {
            return (
                <div className="MainDiv">
                    <div className="container mt-5">
                        <div className="row justify-content-center">
                            <div className="col-md-6">
                                <div className="alert alert-danger text-center">
                                    <h4>⚠️ Error</h4>
                                    <p>{error}</p>
                                    <p className="mb-0">Redirecting to tour packages...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Show loading state if data is not ready
        if (!tourconfirmbooking || tourconfirmbooking.length === 0) {
            return (
                <div className="MainDiv">
                    <div className="container mt-5">
                        <div className="row justify-content-center">
                            <div className="col-md-6">
                                <div className="alert alert-info text-center">
                                    <h4>Loading...</h4>
                                    <p>Please wait while we load your booking details.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="MainDiv">
                <div className="container mt-4">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-header bg-primary text-white">
                                    <h4 className="mb-0">
                                        <i className="fas fa-check-circle mr-2"></i>
                                        Confirm Tour Booking
                                    </h4>
                                </div>
                                <div className="card-body">
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <h6 className="text-primary">Customer Details</h6>
                                            <p><strong>Name:</strong> {UserName}</p>
                                            <p><strong>Phone:</strong> {PhoneNumber}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="text-success">Tour Package Details</h6>
                                            <p><strong>Package:</strong> {tourconfirmbooking[0]}</p>
                                            <p><strong>Duration:</strong> {tourconfirmbooking[3]} day package</p>
                                            <p><strong>Car Type:</strong> {tourconfirmbooking[2]}</p>
                                            <p><strong>Price:</strong> LKR {tourconfirmbooking[1]}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <button 
                                            type="button" 
                                            className="btn btn-success btn-lg mr-3" 
                                            onClick={this.submittourbooked.bind(this)}
                                        >
                                            <i className="fas fa-check mr-2"></i>
                                            Confirm Booking
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-danger btn-lg" 
                                            onClick={this.cancel.bind(this)}
                                        >
                                            <i className="fas fa-times mr-2"></i>
                                            Cancel
                                        </button>
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
