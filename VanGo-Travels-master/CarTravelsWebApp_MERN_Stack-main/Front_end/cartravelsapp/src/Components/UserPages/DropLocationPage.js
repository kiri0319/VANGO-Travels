import React, { Component } from 'react'
import {Container, Row, Col} from 'react-bootstrap' 
import {Link} from "react-router-dom";
import AuthService from '../services/auth'
import SessionManager from '../services/sessionManager'

export default class DropLocationPage extends Component {
    constructor(){
        super();
        this.drop_ = false
        this.state = {
            selectedLocation: "",
            locationCheck: "form-control",
            // Popular drop locations in Coimbatore with categories
            popularLocations: {
                "Transportation Hubs": [
                    "Coimbatore Railway Station",
                    "Coimbatore Airport",
                    "Gandhipuram Bus Stand",
                    "Singanallur Bus Stand",
                    "Ukkadam Bus Stand"
                ],
                "Commercial Areas": [
                    "RS Puram",
                    "Saibaba Colony",
                    "Peelamedu",
                    "Saravanampatti",
                    "Kovaipudur",
                    "Thudiyalur",
                    "Periyanaickenpalayam",
                    "Kurichi",
                    "Vadavalli",
                    "Town Hall"
                ],
                "Shopping Centers": [
                    "Brookefields Mall",
                    "Prozone Mall",
                    "Fun Republic Mall",
                    "Central Mall",
                    "Big Bazaar"
                ],
                "Tourist Attractions": [
                    "Isha Yoga Center",
                    "Marudhamalai Temple",
                    "Kovai Kutralam Falls",
                    "Gedee Museum",
                    "Black Thunder Water Park",
                    "VOC Park",
                    "Perur Temple",
                    "Dhyanalinga Temple",
                    "Siruvani Waterfalls",
                    "Topslip Wildlife Sanctuary"
                ],
                "Educational Institutions": [
                    "Coimbatore Medical College",
                    "PSG College of Technology",
                    "Anna University",
                    "Bharathiar University",
                    "Government Arts College"
                ],
                "Hospitals": [
                    "Coimbatore Medical College Hospital",
                    "PSG Hospitals",
                    "Kovai Medical Center",
                    "Ganga Hospital",
                    "Sri Ramakrishna Hospital"
                ]
            },
            customLocation: "",
            showCustomInput: false,
            pickupLocation: "",
            searchTerm: "",
            filteredLocations: []
        }
    }

    componentDidMount(){
        // Check if user is logged in
        if(!AuthService.isAuthenticated() || AuthService.findrole() !== "user"){
            alert("Please login to book local tours");
            this.props.history.push("/login");
        }

        // Get pickup location from sessionStorage
        const pickupLocation = sessionStorage.getItem('pickupLocation');
        if(!pickupLocation){
            alert("Please select pickup location first");
            this.props.history.push("/pickuplocation");
            return;
        }
        
        this.setState({ pickupLocation });
        console.log('Pickup location from session:', pickupLocation);
        
        // Check if there's already a selected drop location
        const existingDrop = sessionStorage.getItem('dropLocation');
        if(existingDrop) {
            this.setState({
                selectedLocation: existingDrop,
                locationCheck: "form-control is-valid"
            });
            this.drop_ = true;
        }
        
        // Initialize filtered locations
        this.setState({ filteredLocations: this.getAllLocations() });
    }

    getAllLocations() {
        const allLocations = [];
        Object.values(this.state.popularLocations).forEach(category => {
            allLocations.push(...category);
        });
        return allLocations;
    }

    searchLocations(event) {
        const searchTerm = event.target.value.toLowerCase();
        this.setState({ searchTerm });
        
        if(searchTerm === '') {
            this.setState({ filteredLocations: this.getAllLocations() });
        } else {
            const filtered = this.getAllLocations().filter(location => 
                location.toLowerCase().includes(searchTerm)
            );
            this.setState({ filteredLocations: filtered });
        }
    }

    selectPopularLocation(location){
        this.setState({
            selectedLocation: location,
            locationCheck: "form-control is-valid",
            showCustomInput: false
        });
        this.drop_ = true;
        console.log('Selected drop location:', location);
    }

    customLocationHandler(event){
        const location = event.target.value;
        this.setState({
            customLocation: location,
            selectedLocation: location
        });
        
        if(location.length >= 10){
            this.setState({locationCheck: "form-control is-valid"});
            this.drop_ = true;
        } else {
            this.setState({locationCheck: "form-control is-invalid"});
            this.drop_ = false;
        }
    }

    toggleCustomInput(){
        this.setState({
            showCustomInput: !this.state.showCustomInput,
            selectedLocation: "",
            customLocation: "",
            locationCheck: "form-control"
        });
        this.drop_ = false;
    }

    proceedToConfirmBooking(){
        if(!this.drop_ || !this.state.selectedLocation){
            alert("Please select a drop location");
            return;
        }
        
        // Store drop location using SessionManager
        SessionManager.setBookingSessionData({
            dropLocation: this.state.selectedLocation
        });
        console.log('Stored drop location:', this.state.selectedLocation);
        
        // Navigate to confirm booking page
        this.props.history.push('/confirmbooking');
    }

    render(){
        return (
            <div className="MainDiv">
                <div className="container mt-4">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-header bg-success text-white">
                                    <h4 className="mb-0">
                                        <i className="fas fa-location-arrow mr-2"></i>
                                        Select Drop Location
                                    </h4>
                                </div>
                                <div className="card-body">
                                    {/* Pickup Location Display */}
                                    <div className="alert alert-info mb-4">
                                        <h6 className="mb-0">
                                            <i className="fas fa-map-marker-alt mr-2"></i>
                                            Pickup Location: <strong>{this.state.pickupLocation}</strong>
                                        </h6>
                                    </div>
                                    
                                    <p className="text-muted mb-4">
                                        Choose your drop location from popular places or enter a custom location.
                                    </p>
                                    
                                    {/* Search Bar */}
                                    <div className="mb-4">
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <i className="fas fa-search"></i>
                                                </span>
                                            </div>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="Search locations..."
                                                value={this.state.searchTerm}
                                                onChange={this.searchLocations.bind(this)}
                                            />
                                        </div>
                                    </div>

                                    {/* Popular Locations by Category */}
                                    <div className="mb-4">
                                        <h5 className="mb-3">
                                            <i className="fas fa-star text-warning mr-2"></i>
                                            Popular Drop Locations
                                        </h5>
                                        
                                        {this.state.searchTerm ? (
                                            // Show filtered results
                                            <div className="row">
                                                {this.state.filteredLocations.map((location, index) => (
                                                    <div key={index} className="col-md-6 mb-2">
                                                        <button 
                                                            className={`btn btn-outline-success btn-sm w-100 ${
                                                                this.state.selectedLocation === location ? 'active' : ''
                                                            }`}
                                                            onClick={() => this.selectPopularLocation(location)}
                                                        >
                                                            <i className="fas fa-location-arrow mr-2"></i>
                                                            {location}
                                                        </button>
                                                    </div>
                                                ))}
                                                {this.state.filteredLocations.length === 0 && (
                                                    <div className="col-12 text-center text-muted">
                                                        No locations found matching "{this.state.searchTerm}"
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            // Show categorized locations
                                            Object.entries(this.state.popularLocations).map(([category, locations]) => (
                                                <div key={category} className="mb-3">
                                                    <h6 className="text-secondary mb-2">
                                                        <i className="fas fa-tag mr-2"></i>
                                                        {category}
                                                    </h6>
                                                    <div className="row">
                                                        {locations.map((location, index) => (
                                                            <div key={index} className="col-md-6 mb-2">
                                                                <button 
                                                                    className={`btn btn-outline-success btn-sm w-100 ${
                                                                        this.state.selectedLocation === location ? 'active' : ''
                                                                    }`}
                                                                    onClick={() => this.selectPopularLocation(location)}
                                                                >
                                                                    <i className="fas fa-location-arrow mr-2"></i>
                                                                    {location}
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Custom Location Option */}
                                    <div className="mb-4">
                                        <button 
                                            className="btn btn-secondary btn-sm"
                                            onClick={this.toggleCustomInput.bind(this)}
                                        >
                                            <i className="fas fa-plus mr-2"></i>
                                            {this.state.showCustomInput ? 'Hide Custom Location' : 'Enter Custom Location'}
                                        </button>
                                        
                                        {this.state.showCustomInput && (
                                            <div className="mt-3">
                                                <div className="form-group">
                                                    <label htmlFor="customLocation">Custom Drop Location</label>
                                                    <input 
                                                        type="text" 
                                                        className={this.state.locationCheck}
                                                        id="customLocation"
                                                        placeholder="Enter your drop location (minimum 10 characters)"
                                                        value={this.state.customLocation}
                                                        onChange={this.customLocationHandler.bind(this)}
                                                    />
                                                    <small className="invalid-feedback">
                                                        Please enter a valid location of minimum 10 characters
                                                    </small>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Location Display */}
                                    {this.state.selectedLocation && (
                                        <div className="alert alert-success">
                                            <h6 className="mb-0">
                                                <i className="fas fa-check-circle mr-2"></i>
                                                Selected Drop Location: <strong>{this.state.selectedLocation}</strong>
                                            </h6>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="d-flex justify-content-between mt-4">
                                        <Link to="/pickuplocation" className="btn btn-secondary">
                                            <i className="fas fa-arrow-left mr-2"></i>
                                            Back to Pickup Location
                                        </Link>
                                        <button 
                                            className="btn btn-success"
                                            onClick={this.proceedToConfirmBooking.bind(this)}
                                            disabled={!this.drop_}
                                        >
                                            <i className="fas fa-check mr-2"></i>
                                            Confirm Locations
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