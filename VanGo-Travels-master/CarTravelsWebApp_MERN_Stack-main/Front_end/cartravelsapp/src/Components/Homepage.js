import React, { Component } from 'react'
import './Homepage.css'
import {Link} from "react-router-dom";
import {Card,Row,Container} from 'react-bootstrap' 
import Carousel from 'react-bootstrap/Carousel'
import car1 from './Assets/car1.png';
import homecarousal1 from './Assets/home_carousal_1.jpg'
import homecarousal2 from './Assets/home_carousal_2.jpg'
import homecarousal3 from './Assets/home_carousal_3.jpg'

import Gallery_11 from './Assets/home_gallery_1.jpg'
import Gallery_12 from './Assets/home_gallery_2.jpg'
import Gallery_13 from './Assets/home_gallery_3.jpg'
import Gallery_14 from './Assets/home_gallery_4.jpg'
import Gallery_21 from './Assets/home_gallery_21.jpg'
import Gallery_22 from './Assets/home_gallery_22.jpg'
import Gallery_23 from './Assets/home_gallery_23.jpg'
import Gallery_24 from './Assets/home_gallery_24.jpg'
import Gallery_31 from './Assets/home_gallery_31.jpg'
import Gallery_32 from './Assets/home_gallery_32.jpg'
import Gallery_33 from './Assets/home_gallery_33.jpg'
import Gallery_34 from './Assets/home_gallery_34.jpg'
import logo from './Assets/Logo.png'


export default class Homepage extends Component {
    constructor(){
        super();
        this.state = {GalleryDatas: []}
    }
    componentDidMount(){
        fetch('http://localhost:8010/api/v1/adminHomePage')
        .then(res=>{
            if(!res.ok){
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(data=>{
            this.setState({GalleryDatas: data.data || []})
        })
        .catch((err)=>{
            console.error('Failed to fetch adminHomePage:', err);
            this.setState({GalleryDatas: []});
        });
    }

    render() {
        console.log(this.state.GalleryDatas)
        let GalleryList = this.state.GalleryDatas.map((Gallerydata, i)=>{
            if(i<3){
                return (
                <div className="package-item" key={i}>
                    <img 
                        src={Gallerydata.packageimage || 'https://via.placeholder.com/350x250?text=Tour+Package'} 
                        alt={Gallerydata.packagename}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/350x250?text=Tour+Package';
                        }}
                    />
                    <div className="package-content">
                        <h4>{Gallerydata.packagename}</h4>
                        <p>{Gallerydata.packagedetails}</p>
                        <div className="package-meta">
                            <span>{Gallerydata.carType}</span>
                            <span>{Gallerydata.noofdays} days</span>
                        </div>
                        <div className="package-price">LKR {Gallerydata.packageprice}</div>
                    </div>
                 </div>
               );
            }
        })
        return (
            <div className="modern-homepage">
                {/* Hero Carousel Section */}
                <div className="hero-carousel">
                    <Carousel fade interval={5000}>
                        <Carousel.Item>
                            <img 
                                className="d-block w-100" 
                                src={homecarousal1} 
                                alt="Sigiriya"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/1200x400?text=Sigiriya';
                                }}
                            />
                            <Carousel.Caption>
                                <h3>Explore Sigiriya</h3>
                                <p>Discover the ancient rock fortress and breathtaking views</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                className="d-block w-100" 
                                src={homecarousal2} 
                                alt="Colombo"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/1200x400?text=Colombo';
                                }}
                            />
                            <Carousel.Caption>
                                <h3>Visit Colombo</h3>
                                <p>Experience the vibrant capital city and its rich culture</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img 
                                className="d-block w-100" 
                                src={homecarousal3} 
                                alt="Jaffna"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/1200x400?text=Jaffna';
                                }}
                            />
                            <Carousel.Caption>
                                <h3>Discover Jaffna</h3>
                                <p>Explore the northern cultural hub and its unique heritage</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                    </Carousel>
                </div>

                {/* Floating Action Buttons */}
                <div className="floating-buttons">
                    <button className="floating-btn" title="Book Now">🚗</button>
                    <button className="floating-btn" title="Call Us">📞</button>
                    <button className="floating-btn" title="WhatsApp">💬</button>
                </div>

                {/* Main Content Section */}
                <div className="main-content-section">
                    <div className="container">
                        <div className="content-wrapper">
                            <div className="content-image">
                                <img 
                                    src={car1} 
                                    alt="Luxury Car Travel"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/600x400?text=Luxury+Car+Travel';
                                    }}
                                />
                            </div>
                            <div className="content-text">
                                <h2>Your Journey Starts Here</h2>
                                <p>
                                    Experience the ultimate in comfort and convenience with our premium car travel services. 
                                    From local tours to long-distance journeys, we provide reliable, safe, and luxurious 
                                    transportation solutions tailored to your needs.
                                </p>
                                <div className="d-flex gap-3">
                                    <button className="package-btn">Book Now</button>
                                    <button className="package-btn" style={{background: 'var(--gradient-secondary)'}}>Learn More</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Package Selection Section */}
                <div className="package-selection">
                    <div className="package-container">
                        <div className="text-center mb-5">
                            <h2 className="text-white mb-3">Choose Your Adventure</h2>
                            <p className="text-white-50">Select the perfect package for your travel needs</p>
                        </div>
                        <div className="package-grid">
                            <div className="package-card">
                                <h3>Tour Packages</h3>
                                <p>Explore multiple destinations with our comprehensive tour packages</p>
                                <Link to={'/tourpackagelist'} className="package-btn">
                                    View Tours
                                </Link>
                            </div>
                            <div className="package-card">
                                <h3>Local Packages</h3>
                                <p>Discover local attractions and hidden gems in your area</p>
                                <Link to={'/localnewbooking'} className="package-btn">
                                    Local Tours
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Popular Packages Section */}
                <div className="popular-packages">
                    <div className="container">
                        <div className="section-title">
                            <h2>Popular Packages</h2>
                            <p>Discover our most loved travel packages and create unforgettable memories</p>
                        </div>
                        <div className="packages-grid">
                            {GalleryList}
                        </div>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="gallery-section">
                    <div className="container">
                        <div className="gallery-title">
                            <h2>Travel Gallery</h2>
                            <p>Take a glimpse into the amazing experiences our customers have enjoyed</p>
                        </div>
                        <div className="gallery-carousel">
                            <Carousel interval={4000}>
                                <Carousel.Item>
                                    <div className="gallery-slider">
                                        <img src={Gallery_11} alt="gallery pic" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Gallery'}/>
                                        <img src={Gallery_12} alt="gallery pic" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Gallery'}/>
                                        <img src={Gallery_13} alt="gallery pic" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Gallery'}/>
                                        <img src={Gallery_14} alt="gallery pic" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Gallery'}/>
                                    </div>
                                </Carousel.Item>
                                <Carousel.Item>
                                    <div className="gallery-slider">
                                        <img src={Gallery_21} alt="gallery pic" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Gallery'}/>
                                        <img src={Gallery_22} alt="gallery pic" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Gallery'}/>
                                        <img src={Gallery_23} alt="gallery pic" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Gallery'}/>
                                        <img src={Gallery_24} alt="gallery pic" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Gallery'}/>
                                    </div>
                                </Carousel.Item>
                                <Carousel.Item>
                                    <div className="gallery-slider">
                                        <img src={Gallery_31} alt="gallery pic" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Gallery'}/>
                                        <img src={Gallery_32} alt="gallery pic" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Gallery'}/>
                                        <img src={Gallery_33} alt="gallery pic" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Gallery'}/>
                                        <img src={Gallery_34} alt="gallery pic" onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Gallery'}/>
                                    </div>
                                </Carousel.Item>
                            </Carousel>
                        </div>
                    </div>
                </div>

                {/* Car Door Opening Animation Section */}
                <div className="car-door-section">
                    <div className="container">
                        <div className="car-door-container">
                            <div className="car-door-wrapper">
                                <div className="car-body">
                                    <div className="car-door left-door">
                                        <div className="door-handle"></div>
                                        <div className="door-window"></div>
                                        <div className="door-panel"></div>
                                    </div>
                                    <div className="car-door right-door">
                                        <div className="door-handle"></div>
                                        <div className="door-window"></div>
                                        <div className="door-panel"></div>
                                    </div>
                                    <div className="car-front">
                                        <div className="headlight left-headlight"></div>
                                        <div className="headlight right-headlight"></div>
                                        <div className="grille"></div>
                                    </div>
                                    <div className="car-rear">
                                        <div className="taillight left-taillight"></div>
                                        <div className="taillight right-taillight"></div>
                                    </div>
                                    <div className="car-roof">
                                        <div className="roof-rack"></div>
                                    </div>
                                </div>
                                <div className="car-wheels">
                                    <div className="wheel front-left">
                                        <div className="wheel-rim"></div>
                                        <div className="wheel-spokes"></div>
                                    </div>
                                    <div className="wheel front-right">
                                        <div className="wheel-rim"></div>
                                        <div className="wheel-spokes"></div>
                                    </div>
                                    <div className="wheel rear-left">
                                        <div className="wheel-rim"></div>
                                        <div className="wheel-spokes"></div>
                                    </div>
                                    <div className="wheel rear-right">
                                        <div className="wheel-rim"></div>
                                        <div className="wheel-spokes"></div>
                                    </div>
                                </div>
                                <div className="car-interior">
                                    <div className="interior-logo-section">
                                        <div className="interior-logo">
                                            <img src={logo} alt="Car Travels Logo" className="interior-logo-img"/>
                                        </div>
                                        <div className="interior-brand-name">
                                            <h3>Car Travels</h3>
                                            <p>Premium Travel Services</p>
                                        </div>
                                    </div>
                                    <div className="steering-wheel"></div>
                                    <div className="dashboard"></div>
                                    <div className="seats">
                                        <div className="seat driver-seat"></div>
                                        <div className="seat passenger-seat"></div>
                                    </div>
                                </div>
                                <div className="car-effects">
                                    <div className="sparkle sparkle-1"></div>
                                    <div className="sparkle sparkle-2"></div>
                                    <div className="sparkle sparkle-3"></div>
                                    <div className="sparkle sparkle-4"></div>
                                    <div className="light-beam"></div>
                                </div>
                            </div>
                            <div className="car-door-text">
                                <h2>Welcome to VanGo Travels</h2>
                                <p>Experience the luxury of our premium car services</p>
                                <button 
                                    className="door-open-btn" 
                                    onClick={() => {
                                        const carSection = document.querySelector('.car-door-section');
                                        const button = document.querySelector('.door-open-btn');
                                        
                                        if (carSection.classList.contains('doors-open')) {
                                            carSection.classList.remove('doors-open');
                                            button.textContent = 'Open Doors';
                                            button.classList.remove('doors-open');
                                        } else {
                                            carSection.classList.add('doors-open');
                                            button.textContent = 'Close Doors';
                                            button.classList.add('doors-open');
                                        }
                                    }}
                                >
                                    Open Doors
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
