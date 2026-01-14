import React, { Component } from 'react'
import {Container, Row, Col} from 'react-bootstrap' 
import {Link} from "react-router-dom";
import AuthService from '../services/auth'
import SessionManager from '../services/sessionManager'

export default class LocalTourPage extends Component {
    constructor(){
        super();
        this.username_ = false;
        this.phonenum_ = false;
        this.pickup_ = false;
        this.drop_ = false;
        this.mapRef = React.createRef();
        this.map = null;
        this.geocoder = null;
        this.pickupMarker = null;
        this.dropMarker = null;
        
        // Sri Lanka bounds for location validation
        this.sriLankaBounds = {
            north: 10.09,
            south: 5.91,
            west: 79.52,
            east: 81.88
        };
        
        this.state = {
            username: "",
            usernameCheck: "form-control",
            phonenumber: "",
            phonenumberCheck: "form-control",
            pickupLocation: "",
            pickupLocationCheck: "form-control",
            dropLocation: "",
            dropLocationCheck: "form-control",
            // Location coordinates
            pickupLatLng: null,
            dropLatLng: null,
            currentLocation: null,
            locationStatus: "",
            // Google Maps state
            mapLoaded: false,
            selectingMode: null, // 'pickup' | 'drop' | null
            mapCenter: { lat: 7.8731, lng: 80.7718 } // Sri Lanka center
        }
    }

    componentDidMount(){
        // Check authentication
        if(!AuthService.isAuthenticated() || AuthService.findrole() !== "user"){
            alert("Please login to book local tours");
            this.props.history.push("/login");
            return;
        }
        
        console.log('✅ LocalTourPage loaded - User authenticated');
        this.loadGoogleMaps();
    }

    loadGoogleMaps(){
        if (window.google && window.google.maps) {
            this.initMap();
            return;
        }
        const existing = document.querySelector('script[data-role="gmaps"]');
        if (existing) {
            existing.addEventListener('load', () => this.initMap());
            return;
        }
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.dataset.role = 'gmaps';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey || ''}&libraries=places`;
        script.onload = () => this.initMap();
        script.onerror = () => {
            console.error('Failed to load Google Maps script.');
        };
        document.body.appendChild(script);
    }

    initMap(){
        if (!this.mapRef.current || !(window.google && window.google.maps)) return;
        this.map = new window.google.maps.Map(this.mapRef.current, {
            center: this.state.mapCenter,
            zoom: 7,
            disableDefaultUI: false
        });
        // Restrict map panning to Sri Lanka
        this.map.setOptions({
            restriction: {
                latLngBounds: this.sriLankaBounds,
                strictBounds: false
            }
        });
        this.geocoder = new window.google.maps.Geocoder();
        this.setState({ mapLoaded: true });

        this.map.addListener('click', (e) => {
            const clickedLatLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            
            // If no specific mode is selected, default to pickup location
            if (!this.state.selectingMode) {
                this.placeOrMoveMarker('pickup', clickedLatLng);
                this.reverseGeocode(clickedLatLng, 'pickup');
                // Show feedback that pickup location was set
                this.setState({ selectingMode: 'pickup' });
                setTimeout(() => {
                    this.setState({ selectingMode: null });
                }, 2000);
                return;
            }
            
            // Handle specific mode selection
            if (this.state.selectingMode === 'pickup') {
                this.placeOrMoveMarker('pickup', clickedLatLng);
                this.reverseGeocode(clickedLatLng, 'pickup');
            } else if (this.state.selectingMode === 'drop') {
                this.placeOrMoveMarker('drop', clickedLatLng);
                this.reverseGeocode(clickedLatLng, 'drop');
            }
        });
    }

    placeOrMoveMarker(type, latLng){
        const isPickup = type === 'pickup';
        const existingMarker = isPickup ? this.pickupMarker : this.dropMarker;
        if (existingMarker) {
            existingMarker.setPosition(latLng);
        } else {
            const marker = new window.google.maps.Marker({
                position: latLng,
                map: this.map,
                label: isPickup ? 'P' : 'D',
                title: isPickup ? 'Pickup Location' : 'Drop Location'
            });
            if (isPickup) this.pickupMarker = marker; else this.dropMarker = marker;
        }
        this.setState(isPickup ? { pickupLatLng: latLng } : { dropLatLng: latLng });
    }

    reverseGeocode(latLng, type){
        if (!this.geocoder) return;
        this.geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const address = results[0].formatted_address;
                if (type === 'pickup') {
                    this.setState({
                        pickupLocation: address,
                        pickupLocationCheck: 'form-control is-valid'
                    });
                    this.pickup_ = true;
                } else {
                    this.setState({
                        dropLocation: address,
                        dropLocationCheck: 'form-control is-valid'
                    });
                    this.drop_ = true;
                }
            }
        });
    }

    startPickupSelect(){
        this.setState({ selectingMode: 'pickup' });
        if (this.state.pickupLatLng && this.map) this.map.panTo(this.state.pickupLatLng);
    }

    startDropSelect(){
        this.setState({ selectingMode: 'drop' });
        if (this.state.dropLatLng && this.map) this.map.panTo(this.state.dropLatLng);
    }

    // Get user's current location and fill pickup address
    getCurrentLocation(){
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        // Show loading state
        this.setState({
            pickupLocation: 'Getting your location...',
            pickupLocationCheck: 'form-control',
            locationStatus: 'Getting your current location...'
        });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latLng = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Check if location is within Sri Lanka bounds
                if (latLng.lat >= this.sriLankaBounds.south && 
                    latLng.lat <= this.sriLankaBounds.north &&
                    latLng.lng >= this.sriLankaBounds.west && 
                    latLng.lng <= this.sriLankaBounds.east) {
                    
                    // Place marker on map if map is loaded
                    if (this.map) {
                        this.placeOrMoveMarker('pickup', latLng);
                        this.map.panTo(latLng);
                    }
                    
                    // Store coordinates
                    this.setState({ 
                        pickupLatLng: latLng,
                        currentLocation: latLng
                    });
                    
                    // Use reverse geocoding to get proper address
                    this.reverseGeocode(latLng, 'pickup');
                    
                    this.setState({
                        locationStatus: 'Location set successfully!'
                    });
                    
                    // Clear status message after 3 seconds
                    setTimeout(() => {
                        this.setState({ locationStatus: "" });
                    }, 3000);
                } else {
                    alert('Your location is outside Sri Lanka. Please select a location within Sri Lanka.');
                    this.setState({
                        pickupLocation: '',
                        pickupLocationCheck: 'form-control',
                        locationStatus: 'Location outside Sri Lanka'
                    });
                }
            },
            (error) => {
                let errorMessage = 'Unable to get your location. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please allow location access and try again.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'An unknown error occurred.';
                        break;
                }
                alert(errorMessage);
                this.setState({
                    pickupLocation: '',
                    pickupLocationCheck: 'form-control',
                    locationStatus: 'Failed to get location'
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    }

    // Set pickup location manually with coordinates
    setPickupLocation(lat, lng) {
        const latLng = { lat: parseFloat(lat), lng: parseFloat(lng) };
        
        // Validate coordinates are within Sri Lanka
        if (latLng.lat >= this.sriLankaBounds.south && 
            latLng.lat <= this.sriLankaBounds.north &&
            latLng.lng >= this.sriLankaBounds.west && 
            latLng.lng <= this.sriLankaBounds.east) {
            
            const address = `Lat: ${latLng.lat.toFixed(6)}, Lng: ${latLng.lng.toFixed(6)}`;
            
            this.setState({
                pickupLocation: address,
                pickupLocationCheck: 'form-control is-valid',
                pickupLatLng: latLng,
                locationStatus: 'Pickup location set!'
            });
            this.pickup_ = true;
            
            // Clear status message after 3 seconds
            setTimeout(() => {
                this.setState({ locationStatus: "" });
            }, 3000);
        } else {
            alert('Please enter coordinates within Sri Lanka bounds.');
        }
    }

    usernameHandler(event){
        const username = event.target.value.trim();
        const validUsername = /^[a-zA-Z\s]{3,25}$/;
        
        if (validUsername.test(username)) {
            this.setState({
                username: username,
                usernameCheck: "form-control is-valid"
            });
            this.username_ = true;
        } else {
            this.setState({
                username: username,
                usernameCheck: "form-control is-invalid"
            });
            this.username_ = false;
        }
    }

    phonenumberHandler(event){
        const phonenumber = event.target.value;
        const validPhoneNumber = /^[0-9]{10}$/;
        
        if (validPhoneNumber.test(phonenumber) && phonenumber.length === 10) {
            this.setState({
                phonenumber: phonenumber,
                phonenumberCheck: "form-control is-valid"
            });
            this.phonenum_ = true;
        } else {
            this.setState({
                phonenumber: phonenumber,
                phonenumberCheck: "form-control is-invalid"
            });
            this.phonenum_ = false;
        }
    }

    pickupLocationHandler(event){
        const pickupLocation = event.target.value.trim();
        
        if (pickupLocation.length >= 10) {
            this.setState({
                pickupLocation: pickupLocation,
                pickupLocationCheck: "form-control is-valid"
            });
            this.pickup_ = true;
        } else {
            this.setState({
                pickupLocation: pickupLocation,
                pickupLocationCheck: "form-control is-invalid"
            });
            this.pickup_ = false;
        }
    }

    dropLocationHandler(event){
        const dropLocation = event.target.value.trim();
        
        if (dropLocation.length >= 10) {
            this.setState({
                dropLocation: dropLocation,
                dropLocationCheck: "form-control is-valid"
            });
            this.drop_ = true;
        } else {
            this.setState({
                dropLocation: dropLocation,
                dropLocationCheck: "form-control is-invalid"
            });
            this.drop_ = false;
        }
    }

    proceedToBooking(){
        if(!this.username_ || !this.phonenum_ || !this.pickup_ || !this.drop_){
            alert("Please fill in all required fields");
            return;
        }
        
        // Store all booking details using SessionManager
        SessionManager.setBookingSessionData({
            userName: this.state.username,
            phoneNumber: this.state.phonenumber,
            pickupLocation: this.state.pickupLocation,
            dropLocation: this.state.dropLocation,
            pickupCoordinates: this.state.pickupLatLng,
            dropCoordinates: this.state.dropLatLng
        });
        
        console.log('✅ All booking details stored:', {
            username: this.state.username,
            phonenumber: this.state.phonenumber,
            pickupLocation: this.state.pickupLocation,
            dropLocation: this.state.dropLocation,
            pickupCoordinates: this.state.pickupLatLng,
            dropCoordinates: this.state.dropLatLng
        });
        
        // Navigate directly to confirm booking page
        this.props.history.push('/confirmbooking');
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
                                        <i className="fas fa-car mr-2"></i>
                                        Local Tour Booking
                                    </h4>
                                </div>
                                <div className="card-body">
                                    <p className="text-muted mb-4">
                                        Fill in your details to proceed with local tour booking.
                                    </p>
                                    
                                    {/* User Details Form */}
                                    <div className="form-group row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="username" className="form-label">
                                                <i className="fas fa-user mr-2"></i>
                                                Full Name
                                            </label>
                                            <input 
                                                type="text" 
                                                className={this.state.usernameCheck} 
                                                id="username" 
                                                placeholder="Enter your full name"
                                                value={this.state.username}
                                                onChange={this.usernameHandler.bind(this)}
                                            />
                                            <small className="form-text text-muted">
                                                Enter 3-25 characters (letters and spaces only)
                                            </small>
                                        </div>
                                        
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="phonenumber" className="form-label">
                                                <i className="fas fa-phone mr-2"></i>
                                                Phone Number
                                            </label>
                                            <input 
                                                type="tel" 
                                                className={this.state.phonenumberCheck} 
                                                id="phonenumber" 
                                                placeholder="Enter 10-digit phone number"
                                                value={this.state.phonenumber}
                                                onChange={this.phonenumberHandler.bind(this)}
                                                maxLength="10"
                                            />
                                            <small className="form-text text-muted">
                                                Enter 10-digit number starting with 0-9
                                            </small>
                                        </div>
                                    </div>

                                    {/* Location Details Form */}
                                    <div className="form-group row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="pickupLocation" className="form-label">
                                                <i className="fas fa-map-marker-alt mr-2"></i>
                                                Pickup Location
                                            </label>
                                            <input 
                                                type="text" 
                                                className={this.state.pickupLocationCheck} 
                                                id="pickupLocation" 
                                                placeholder="Enter pickup location or use current location"
                                                value={this.state.pickupLocation}
                                                onChange={this.pickupLocationHandler.bind(this)}
                                            />
                                            <div className="mt-2">
                                                <button type="button" className="btn btn-sm btn-success mr-2" onClick={this.getCurrentLocation.bind(this)}>
                                                    <i className="fas fa-crosshairs mr-1"></i> Use Current Location
                                                </button>
                                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={this.startPickupSelect.bind(this)}>
                                                    <i className="fas fa-map-pin mr-1"></i> Pick on Map
                                                </button>
                                            </div>
                                            <small className="form-text text-muted">
                                                Use current location or enter your pickup location manually
                                            </small>
                                            {this.state.locationStatus && (
                                                <div className="alert alert-info mt-2 mb-0">
                                                    <small><i className="fas fa-info-circle mr-1"></i>{this.state.locationStatus}</small>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="dropLocation" className="form-label">
                                                <i className="fas fa-location-arrow mr-2"></i>
                                                Drop Location
                                            </label>
                                            <input 
                                                type="text" 
                                                className={this.state.dropLocationCheck} 
                                                id="dropLocation" 
                                                placeholder="Enter drop location (minimum 10 characters)"
                                                value={this.state.dropLocation}
                                                onChange={this.dropLocationHandler.bind(this)}
                                            />
                                            <div className="mt-2">
                                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={this.startDropSelect.bind(this)}>
                                                    <i className="fas fa-map-pin mr-1"></i> Drop on Map
                                                </button>
                                            </div>
                                            <small className="form-text text-muted">
                                                Enter your drop location or select on map
                                            </small>
                                        </div>
                                    </div>

                                    {/* Map Section */}
                                    <div className="mb-3">
                                        {this.state.selectingMode && (
                                            <div className={`alert alert-${this.state.selectingMode === 'pickup' ? 'success' : 'info'} mb-2`}>
                                                <i className="fas fa-hand-pointer mr-2"></i>
                                                {this.state.selectingMode === 'pickup' ? 'Pickup location set! Click anywhere on map to change it.' : `Click on the map to set ${this.state.selectingMode} location`}
                                            </div>
                                        )}
                                        {!this.state.selectingMode && (
                                            <div className="alert alert-light mb-2">
                                                <i className="fas fa-info-circle mr-2"></i>
                                                Click anywhere on the map to automatically set your pickup location
                                            </div>
                                        )}
                                        <div ref={this.mapRef} style={{ width: '100%', height: '400px', borderRadius: '6px', border: '1px solid #e0e0e0' }} />
                                        {!this.state.mapLoaded && (
                                            <div className="text-muted small mt-2">Loading map...</div>
                                        )}
                                    </div>

                                    {/* Location Information */}
                                    <div className="alert alert-info">
                                        <h6 className="mb-2">
                                            <i className="fas fa-info-circle mr-2"></i>
                                            Location Information
                                        </h6>
                                        <p className="mb-1">
                                            <strong>Current Location:</strong> {this.state.currentLocation ? 
                                                `Lat: ${this.state.currentLocation.lat.toFixed(6)}, Lng: ${this.state.currentLocation.lng.toFixed(6)}` : 
                                                'Not detected'
                                            }
                                        </p>
                                        <p className="mb-1">
                                            <strong>Pickup Coordinates:</strong> {this.state.pickupLatLng ? 
                                                `Lat: ${this.state.pickupLatLng.lat.toFixed(6)}, Lng: ${this.state.pickupLatLng.lng.toFixed(6)}` : 
                                                'Not set'
                                            }
                                        </p>
                                        <p className="mb-0">
                                            <strong>Drop Coordinates:</strong> {this.state.dropLatLng ? 
                                                `Lat: ${this.state.dropLatLng.lat.toFixed(6)}, Lng: ${this.state.dropLatLng.lng.toFixed(6)}` : 
                                                'Not set'
                                            }
                                        </p>
                                    </div>

                                    {/* Information Alert */}
                                    <div className="alert alert-warning">
                                        <h6 className="mb-0">
                                            <i className="fas fa-exclamation-triangle mr-2"></i>
                                            Fill in all the details above to proceed with your local tour booking
                                        </h6>
                                    </div>

                                    {/* Action Button */}
                                    <div className="text-center mt-4">
                                        <button 
                                            type="button" 
                                            className="btn btn-primary btn-lg" 
                                            onClick={this.proceedToBooking.bind(this)}
                                            disabled={!this.username_ || !this.phonenum_ || !this.pickup_ || !this.drop_}
                                        >
                                            <i className="fas fa-check mr-2"></i>
                                            Proceed to Booking Confirmation
                                        </button>
                                        
                                        {(!this.username_ || !this.phonenum_ || !this.pickup_ || !this.drop_) && (
                                            <div className="text-muted small mt-2">
                                                Please fill in all required fields to continue
                                            </div>
                                        )}
                                    </div>

                                    {/* Navigation Links */}
                                    <div className="text-center mt-4">
                                        <Link to="/homepage" className="btn btn-outline-secondary mr-2">
                                            <i className="fas fa-home mr-2"></i>
                                            Back to Home
                                        </Link>
                                        <Link to="/tourpackagelist" className="btn btn-outline-info">
                                            <i className="fas fa-map mr-2"></i>
                                            View Tour Packages
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