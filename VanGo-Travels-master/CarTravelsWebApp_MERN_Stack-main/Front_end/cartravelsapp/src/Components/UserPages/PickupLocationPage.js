import React, { Component } from 'react'
import {Container, Row, Col} from 'react-bootstrap' 
import {Link} from "react-router-dom";
import AuthService from '../services/auth'
import SessionManager from '../services/sessionManager'

export default class PickupLocationPage extends Component {
    constructor(){
        super();
        this.pickup_ = false
        this.state = {
            selectedLocation: "",
            locationCheck: "form-control",
            // Popular pickup locations in Coimbatore with categories
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
        
        // Check if there's already a selected pickup location
        const existingPickup = sessionStorage.getItem('pickupLocation');
        if(existingPickup) {
            this.setState({
                selectedLocation: existingPickup,
                locationCheck: "form-control is-valid"
            });
            this.pickup_ = true;
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
        this.pickup_ = true;
        console.log('Selected pickup location:', location);
    }

    customLocationHandler(event){
        const location = event.target.value;
        this.setState({
            customLocation: location,
            selectedLocation: location
        });
        
        if(location.length >= 10){
            this.setState({locationCheck: "form-control is-valid"});
            this.pickup_ = true;
        } else {
            this.setState({locationCheck: "form-control is-invalid"});
            this.pickup_ = false;
        }
    }

    toggleCustomInput(){
        this.setState({
            showCustomInput: !this.state.showCustomInput,
            selectedLocation: "",
            customLocation: "",
            locationCheck: "form-control"
        });
        this.pickup_ = false;
    }

    proceedToDropLocation(){
        if(!this.pickup_ || !this.state.selectedLocation){
            alert("Please select a pickup location");
            return;
        }
        
        // Store pickup location using SessionManager
        SessionManager.setBookingSessionData({
            pickupLocation: this.state.selectedLocation
        });
        console.log('Stored pickup location:', this.state.selectedLocation);
        
        // Navigate to drop location page
        this.props.history.push('/droplocation');
    }

    render(){
        return (
            <div className="MainDiv">
                <div className="container mt-4">
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-header bg-primary text-white">
                                    <h4 className="mb-0">
                                        <i className="fas fa-map-marker-alt mr-2"></i>
                                        Select Pickup Location
                                    </h4>
                                </div>
                                <div className="card-body">
                                    <p className="text-muted mb-4">
                                        Choose your pickup location from popular places or enter a custom location.
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
                                            Popular Pickup Locations
                                        </h5>
                                        
                                        {this.state.searchTerm ? (
                                            // Show filtered results
                                            <div className="row">
                                                {this.state.filteredLocations.map((location, index) => (
                                                    <div key={index} className="col-md-6 mb-2">
                                                        <button 
                                                            className={`btn btn-outline-primary btn-sm w-100 ${
                                                                this.state.selectedLocation === location ? 'active' : ''
                                                            }`}
                                                            onClick={() => this.selectPopularLocation(location)}
                                                        >
                                                            <i className="fas fa-map-marker-alt mr-2"></i>
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
                                                                    className={`btn btn-outline-primary btn-sm w-100 ${
                                                                        this.state.selectedLocation === location ? 'active' : ''
                                                                    }`}
                                                                    onClick={() => this.selectPopularLocation(location)}
                                                                >
                                                                    <i className="fas fa-map-marker-alt mr-2"></i>
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
                                                    <label htmlFor="customLocation">Custom Pickup Location</label>
                                                    <input 
                                                        type="text" 
                                                        className={this.state.locationCheck}
                                                        id="customLocation"
                                                        placeholder="Enter your pickup location (minimum 10 characters)"
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
                                                Selected Pickup Location: <strong>{this.state.selectedLocation}</strong>
                                            </h6>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="d-flex justify-content-between mt-4">
                                        <Link to="/localnewbooking" className="btn btn-secondary">
                                            <i className="fas fa-arrow-left mr-2"></i>
                                            Back to Booking
                                        </Link>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={this.proceedToDropLocation.bind(this)}
                                            disabled={!this.pickup_}
                                        >
                                            <i className="fas fa-arrow-right mr-2"></i>
                                            Proceed to Drop Location
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