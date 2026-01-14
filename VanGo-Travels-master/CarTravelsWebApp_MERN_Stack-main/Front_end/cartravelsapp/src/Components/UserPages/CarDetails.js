import React, { Component } from 'react'
import authHeader from '../services/auth-header'
import AuthService from '../services/auth'
import car1 from '../Assets/car21.png'
import car3 from '../Assets/car4.png'
import car2 from '../Assets/car5.png';
import car4 from '../Assets/toyato-6-1.png';
import car5 from '../Assets/car-6-seater.jpg';
import car6 from '../Assets/car-12-seater1.png';
import {Button,Card,Row,Container} from 'react-bootstrap' 
import './CarDetails.css'

export default class CarDetails extends Component {
        constructor(){
            super();
            this.searchinput = React.createRef();
            this.state = {
                Car_km_Details: [], 
                cargallery: [car1,car2,car3,car4,car5,car6], 
                searchList:[], 
                displayAll:true,
                showBookingModal: false,
                selectedCar: null,
                bookingForm: {
                    pickupDate: '',
                    pickupTime: '',
                    returnDate: '',
                    returnTime: '',
                    pickupLocation: '',
                    userName: '',
                    phoneNumber: '',
                    promoCode: ''
                }
            }
        }
    
        componentDidMount(){
            fetch('http://localhost:8010/api/v1/CarkilometerDetails',{
                headers:authHeader()
            })
            .then(res=>res.json())
            .then(data=>{
                // Handle new API response format
                if (data && data.success && Array.isArray(data.data)) {
                    this.setState({Car_km_Details : data.data})
                } else if (Array.isArray(data)) {
                    this.setState({Car_km_Details : data})
                } else if (data && Array.isArray(data.data)) {
                    this.setState({Car_km_Details : data.data})
                } else {
                    console.error('API response is not an array:', data);
                    this.setState({Car_km_Details : []})
                }
            })
            .catch(error => {
                console.error('Error fetching car details:', error);
                this.setState({Car_km_Details : []})
            });
        }

        // Handle opening booking modal
        openBookingModal = (car) => {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            this.setState({
                showBookingModal: true,
                selectedCar: car,
                bookingForm: {
                    pickupDate: today.toISOString().split('T')[0],
                    pickupTime: '12:00',
                    returnDate: tomorrow.toISOString().split('T')[0],
                    returnTime: '12:00',
                    pickupLocation: 'Colombo 15',
                    promoCode: ''
                }
            });
        }

        // Handle closing booking modal
        closeBookingModal = () => {
            this.setState({
                showBookingModal: false,
                selectedCar: null,
                bookingForm: {
                    pickupDate: '',
                    pickupTime: '',
                    returnDate: '',
                    returnTime: '',
                    pickupLocation: '',
                    promoCode: ''
                }
            });
        }

        // Handle form input changes
        handleInputChange = (e) => {
            const { name, value } = e.target;
            this.setState(prevState => ({
                bookingForm: {
                    ...prevState.bookingForm,
                    [name]: value
                }
            }));
        }

        // Handle promo code application
        applyPromoCode = () => {
            // Add promo code logic here
            console.log('Applying promo code:', this.state.bookingForm.promoCode);
        }

        // Validate booking form
        validateBookingForm = () => {
            const { bookingForm } = this.state;
            const errors = {};

            if (!bookingForm.pickupDate) {
                errors.pickupDate = 'Pickup date is required';
            }

            if (!bookingForm.returnDate) {
                errors.returnDate = 'Return date is required';
            }

            if (bookingForm.pickupDate && bookingForm.returnDate) {
                const pickupDate = new Date(bookingForm.pickupDate);
                const returnDate = new Date(bookingForm.returnDate);
                
                if (returnDate <= pickupDate) {
                    errors.returnDate = 'Return date must be after pickup date';
                }
            }

            if (!bookingForm.pickupLocation.trim()) {
                errors.pickupLocation = 'Pickup location is required';
            }

            if (!bookingForm.userName.trim()) {
                errors.userName = 'Your name is required';
            }

            if (!bookingForm.phoneNumber.trim()) {
                errors.phoneNumber = 'Phone number is required';
            } else if (!/^\d{10}$/.test(bookingForm.phoneNumber.replace(/\D/g, ''))) {
                errors.phoneNumber = 'Please enter a valid 10-digit phone number';
            }

            return errors;
        }

        // Handle booking submission
        handleBookingSubmit = (e) => {
            e.preventDefault();
            const { selectedCar, bookingForm } = this.state;
            
            // Validate form
            const errors = this.validateBookingForm();
            if (Object.keys(errors).length > 0) {
                alert('Please fix the following errors:\n' + Object.values(errors).join('\n'));
                return;
            }

            // Create booking data
            const bookingData = {
                carId: selectedCar._id,
                vehicle: selectedCar.vechicle,
                pickupDate: bookingForm.pickupDate,
                pickupTime: bookingForm.pickupTime,
                returnDate: bookingForm.returnDate,
                returnTime: bookingForm.returnTime,
                pickupLocation: bookingForm.pickupLocation,
                userName: bookingForm.userName,
                phoneNumber: bookingForm.phoneNumber,
                promoCode: bookingForm.promoCode,
                dailyRate: selectedCar.amount,
                totalAmount: this.calculateTotalAmount(),
                status: 'pending'
            };

            // Submit booking to API
            this.submitBooking(bookingData);
        }

        // Calculate rental days
        calculateRentalDays = () => {
            const { bookingForm } = this.state;
            if (!bookingForm.pickupDate || !bookingForm.returnDate) return 0;

            const pickupDate = new Date(bookingForm.pickupDate);
            const returnDate = new Date(bookingForm.returnDate);
            const days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));
            
            return Math.max(1, days); // Minimum 1 day
        }

        // Calculate total amount based on rental period
        calculateTotalAmount = () => {
            const { selectedCar } = this.state;
            const days = this.calculateRentalDays();
            
            return days * (selectedCar?.amount || 0);
        }

        // Submit booking to backend
        submitBooking = async (bookingData) => {
            try {
                // Get user authentication data
                const userid = AuthService.finduserid();
                const usernameid = AuthService.findusername();
                
                if(!userid || !usernameid){
                    alert('Authentication error. Please login again.');
                    this.props.history.push('/login');
                    return;
                }

                // Transform data to match backend expectations
                const backendBookingData = {
                    FromLocation: bookingData.pickupLocation,
                    ToLocation: bookingData.pickupLocation, // For local booking, same location
                    user_name: bookingData.userName || AuthService.findusername() || 'Guest User',
                    phoneNumber: bookingData.phoneNumber || '0000000000',
                    user: userid,
                    usernameid: usernameid,
                    // Additional car booking data
                    carId: bookingData.carId,
                    vehicle: bookingData.vehicle,
                    pickupDate: bookingData.pickupDate,
                    pickupTime: bookingData.pickupTime,
                    returnDate: bookingData.returnDate,
                    returnTime: bookingData.returnTime,
                    dailyRate: bookingData.dailyRate,
                    totalAmount: bookingData.totalAmount,
                    promoCode: bookingData.promoCode,
                    status: bookingData.status
                };

                console.log('Submitting booking data:', backendBookingData);

                const response = await fetch('http://localhost:8010/api/v1/LocalBooking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...authHeader()
                    },
                    body: JSON.stringify(backendBookingData)
                });

                const result = await response.json();
                console.log('Booking response:', result);

                if (response.ok && result.success) {
                    alert('Booking request submitted successfully!');
                    console.log('Booking submitted:', result);
                    this.closeBookingModal();
                } else {
                    alert('Failed to submit booking: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error submitting booking:', error);
                alert('Failed to submit booking. Please try again.');
            }
        }
    
        render() {
                // Safety check to ensure Car_km_Details is an array before mapping
                const carDetails = Array.isArray(this.state.Car_km_Details) ? this.state.Car_km_Details : [];
                const galleryLength = this.state.cargallery.length || 1;
                const apiBase = 'http://localhost:8010';
                var GalleryList = carDetails.map((Car_km_Detail, i)=>{
                    const uploaded = Car_km_Detail && Car_km_Detail.imageUrl ? Car_km_Detail.imageUrl : '';
                    const resolvedUploaded = uploaded
                        ? (uploaded.startsWith('http') ? uploaded : `${apiBase}${uploaded}`)
                        : '';
                    const fallback = this.state.cargallery[i % galleryLength];
                    const imageSrc = resolvedUploaded || fallback;
                    
                    

                    return (
                        <div key={i} className="car-card fadeUp" style={{ animationDelay: `${100 + i*60}ms` }}>
                            <div className="car-image-container">
                                <img 
                                    src={imageSrc}
                                    alt={Car_km_Detail.vechicle || 'Car'}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Car+Image'; }}
                                />
                                <div className="price-overlay">
                                    <div className="price-amount">LKR {Car_km_Detail.amount}.00 / Day</div>
                                    <div className="mileage-badge">{Car_km_Detail.minkm} KM / Day</div>
                                </div>
                                <div className="featured-badge">
                                    <span className="star-icon">★</span>
                                </div>
                            </div>
                            <div className="car-card__body">
                                <h6 className="car-card__title">{Car_km_Detail.vechicle}</h6>
                                
                                {/* Admin Input Data Display */}
                                <div className="admin-data-section">
                                    <div className="admin-data-title">Pricing Details</div>
                                    <div className="data-row">
                                        <div className="data-item">
                                            <span className="data-label">Min KM:</span>
                                            <span className="data-value">{Car_km_Detail.minkm} KM</span>
                                        </div>
                                        <div className="data-item">
                                            <span className="data-label">Rate/KM:</span>
                                            <span className="data-value">LKR {Car_km_Detail.rateperkm}</span>
                                        </div>
                                    </div>
                                    <div className="data-row">
                                        <div className="data-item">
                                            <span className="data-label">Driver Allowance:</span>
                                            <span className="data-value">LKR {Car_km_Detail.driverallowance}</span>
                                        </div>
                                        <div className="data-item">
                                            <span className="data-label">Daily Rate:</span>
                                            <span className="data-value">LKR {Car_km_Detail.amount}</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    className="book-now-btn"
                                    onClick={() => this.openBookingModal(Car_km_Detail)}
                                >
                                    BOOK NOW
                                </button>
                            </div>
                        </div>
                    );
                })
    
        return (
        <div className="MainDiv">
        <p className="availabecars car-section-title">Ride of the day</p>
            <div className="car-details-wrapper">
                <div className="car-grid">
                    {GalleryList}
                </div>
            </div>

            {/* Booking Modal */}
            {this.state.showBookingModal && (
                <div className="booking-modal-overlay" onClick={this.closeBookingModal}>
                    <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="booking-modal-header">
                            <h3>Book Your Vehicle</h3>
                            <button className="close-btn" onClick={this.closeBookingModal}>×</button>
                        </div>
                        
                        <div className="booking-modal-content">
                            <div className="car-info-section">
                                <div className="car-image-preview">
                                    <img 
                                        src={this.state.selectedCar && this.state.selectedCar.imageUrl ? 
                                            (this.state.selectedCar.imageUrl.startsWith('http') ? 
                                                this.state.selectedCar.imageUrl : 
                                                `http://localhost:8010${this.state.selectedCar.imageUrl}`) : 
                                            this.state.cargallery[0]} 
                                        alt={this.state.selectedCar?.vechicle || 'Car'}
                                    />
                                </div>
                                <div className="car-details-preview">
                                    <h4>{this.state.selectedCar?.vechicle || 'Car'}</h4>
                                    <div className="rating-section">
                                        <span className="stars">★★★★★</span>
                                        <span className="rating-text">(15 Trips)</span>
                                    </div>
                                    <div className="price-section">
                                        <span className="price">LKR {this.state.selectedCar?.amount || '0'}.00 / Day</span>
                                    </div>
                                    <div className="rental-period">
                                        <p>3 Day(s) Minimum rental period</p>
                                        <p>3 Month(s) Maximum rental period</p>
                                    </div>
                                    <div className="rent-mode">
                                        <span className="rent-mode-label">Rent Mode</span>
                                        <button className="rent-mode-btn active">🚗 Vehicle only</button>
                                    </div>
                                </div>
                            </div>

                            <form className="booking-form" onSubmit={this.handleBookingSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Pick up</label>
                                        <div className="datetime-input">
                                            <input
                                                type="date"
                                                name="pickupDate"
                                                value={this.state.bookingForm.pickupDate}
                                                onChange={this.handleInputChange}
                                                className="date-input"
                                            />
                                            <input
                                                type="time"
                                                name="pickupTime"
                                                value={this.state.bookingForm.pickupTime}
                                                onChange={this.handleInputChange}
                                                className="time-input"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Return</label>
                                        <div className="datetime-input">
                                            <input
                                                type="date"
                                                name="returnDate"
                                                value={this.state.bookingForm.returnDate}
                                                onChange={this.handleInputChange}
                                                className="date-input"
                                            />
                                            <input
                                                type="time"
                                                name="returnTime"
                                                value={this.state.bookingForm.returnTime}
                                                onChange={this.handleInputChange}
                                                className="time-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Pickup Location</label>
                                    <input
                                        type="text"
                                        name="pickupLocation"
                                        value={this.state.bookingForm.pickupLocation}
                                        onChange={this.handleInputChange}
                                        className="location-input"
                                        placeholder="Enter pickup location"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Your Name</label>
                                        <input
                                            type="text"
                                            name="userName"
                                            value={this.state.bookingForm.userName}
                                            onChange={this.handleInputChange}
                                            className="location-input"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={this.state.bookingForm.phoneNumber}
                                            onChange={this.handleInputChange}
                                            className="location-input"
                                            placeholder="Enter your phone number"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Promo Code</label>
                                    <div className="promo-code-section">
                                        <input
                                            type="text"
                                            name="promoCode"
                                            value={this.state.bookingForm.promoCode}
                                            onChange={this.handleInputChange}
                                            className="promo-input"
                                            placeholder="Enter promo code"
                                        />
                                        <button 
                                            type="button" 
                                            className="apply-promo-btn"
                                            onClick={this.applyPromoCode}
                                        >
                                            🎁 Apply Promo Code
                                        </button>
                                    </div>
                                    <p className="promo-text">Add a Promo Code and get instant discounts!</p>
                                </div>

                                <div className="total-amount-section">
                                    <div className="total-calculation">
                                        <div className="calculation-row">
                                            <span>Daily Rate:</span>
                                            <span>LKR {this.state.selectedCar?.amount || '0'}.00</span>
                                        </div>
                                        <div className="calculation-row">
                                            <span>Duration:</span>
                                            <span>{this.calculateRentalDays()} day(s)</span>
                                        </div>
                                        <div className="calculation-row total-row">
                                            <span>Total Amount:</span>
                                            <span>LKR {this.calculateTotalAmount()}.00</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="availability-status">
                                    <p className="not-available">Vehicle is Not Available!</p>
                                </div>

                                <button type="submit" className="request-vehicle-btn">
                                    REQUEST VEHICLE
                                </button>
                            </form>

                            <div className="host-info">
                                <h5>Hosted by</h5>
                                <div className="host-details">
                                    <div className="host-avatar">👤</div>
                                    <div className="host-info-text">
                                        <span className="host-name">Ajith</span>
                                        <div className="host-rating">
                                            <span className="stars">★★★★★</span>
                                            <span className="host-trips">34 trips</span>
                                        </div>
                                        <p className="host-joined">Joined February 2024</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
        )
       }
    }
        
    {/* <td><button type="button" onClick={this.deleteCar_km_Detail.bind(this, Car_km_Detail._id)} className="btn btn-danger m-1"> Delete </button> */}
    {/* <button type="button" className="btn btn-warning m-1"> <Link to={'updateCarBookedData/' + Car_km_Detail.name}>Update</Link> </button> */}
    {/* </td> */}
    // deleteCar_km_Detail(id){
    //     fetch('http://localhost:8010/api/v1/carbookedusers/' + id, {
    //     headers:authHeader(),    
    //     method: 'DELETE' 
    //     })
    //     .then(res=>res.json())
    //     .then(data=>{
    //         console.log(data);
    //         this.setState({message: 'Record successfully deleted'})
    //             fetch('http://localhost:8010/api/v1/carbookedusers/',{
    //                 headers:authHeader()
    //             })
    //             .then(res=>res.json())
    //             .then(data=>{
    //                 this.setState({Car_km_Details : data})
    //             });
    //     });
    // }

      {/* <div className="row">
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3">
                <img src={Carimg1}></img>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3">
                <img src={Carimg2} ></img>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3">
                <img src={Carimg3} ></img>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3">
                <img src={Carimg4} ></img>
            </div>
        </div> */}
       {/* <div className="bookinglist">
                    <form class="form-inline">
                    <h2>Local Package Booking List</h2>
                    <div class="form-group ml-auto">
                        <input type="text"  ref = {this.searchinput} className="form-control m-2 " id="inputsearch" placeholder="Search By User Id"/>
                    </div>
                    <button type="submit" className="btn btn-warning m-2" onClick={this.search.bind(this)}>Search</button>
                    <button type="submit" className="btn btn-secondary m-2" onClick={this.allbooking.bind(this)}>All Bookings</button>
                    </form>
                </div> */}
                      // if(this.state.displayAll){
            //     var display = this.state.Car_km_Details
            // }else{
            //     var display = this.state.searchList
            // }
    
            // console.log("length => ",display.length)
            // if(!display.length){
            //     var FetchedData = "No Data Available !"
            // }else{

              
        // search(e){
        //     e.preventDefault();
        //     this.setState({displayAll:false})
        //     fetch('http://localhost:8010/api/v1/CarkilometerDetails/'+ this.searchinput.current.value,{
        //         headers:authHeader()
        //     })
        //     .then(res=>res.json())
        //     .then(data=>{
        //         this.setState({searchList : data})
        //     });   
        // }
     
        // allbooking(e){
        //     e.preventDefault();
        //     this.searchinput.current.value="";
        //     this.setState({displayAll:true});
        // }
