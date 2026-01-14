import {BrowserRouter as Router,Switch,Route} from "react-router-dom";
import React, { useState, useEffect } from "react";
import {connect} from 'react-redux';

import AddpackageAdmin from './Components/Admin/AddpackageAdmin';
import Homepage from './Components/Homepage';
import HomepageAdmin from './Components/Admin/HomepageAdmin';
import UpdatepackageAdmin from './Components/Admin/UpdatepackageAdmin';
import LoginPage from './Components/Login_signup/Loginpage';
import Signuppage from './Components/Login_signup/Signuppage';
import UserHomePage from './Components/UserPages/ErrorPage';
import LocalTourPage from './Components/UserPages/LocalTourPage';
import TourPackage from './Components/UserPages/TourPackage';
import ConfirmBooking from './Components/UserPages/ConfirmBooking';
import Thanks from './Components/UserPages/Thanks';
import TourConfirmBooking from './Components/UserPages/tourconfirmbooking';
import BookingList from './Components/UserPages/BookingList';
import AllsignedUsers from './Components/Admin/AllsignedUsers';
import Header from './Components/HeaderComponent/Header';
import AuthService from './Components/services/auth'
import AdminHeader from "./Components/HeaderComponent/AdminHeader";
import Tourbookinglist from "./Components/UserPages/Tourbookinglist";
import AllLocalBooked from "./Components/Admin/AllLocalBooked";
import AllTourBooked from "./Components/Admin/AllTourBooked";
import TourBeforeConfirm from "./Components/UserPages/TourBeforeConfirm";
import CarDetails from "./Components/UserPages/CarDetails";
import CarDetailsAdmin from "./Components/Admin/CarDetailsAdmin";
import AddCarKmdetail from "./Components/Admin/AddCarKmdetail";
import UpdateCarKmDetail from "./Components/Admin/UpdateCarKmDetail";
import UserLogDetail from "./Components/UserPages/UserLogDetail";
import PickupLocationPage from "./Components/UserPages/PickupLocationPage";
import DropLocationPage from "./Components/UserPages/DropLocationPage";
import Booking from "./Components/Admin/Booking";
import UserHeader from "./Components/HeaderComponent/UserHeader";
import DriverHeader from "./Components/HeaderComponent/DriverHeader";
import DriverManagement from "./Components/Admin/DriverManagement";
import DriverHomePage from "./Components/UserPages/DriverHomePage";
import DriverFeedback from "./Components/UserPages/DriverFeedback";
import DriverMyFeedback from "./Components/UserPages/DriverMyFeedback";
import FeedbackForm from "./Components/UserPages/FeedbackForm";
import MyFeedback from "./Components/UserPages/MyFeedback";
import FeedbackManagement from "./Components/Admin/FeedbackManagement";
import SessionManager from './Components/services/sessionManager';
import DriverRouteProtection from './Components/Common/DriverRouteProtection';

function App(props) {
    // Initialize authentication state on app startup
    useEffect(() => {
        console.log('🚀 App component mounted, initializing session...');
        SessionManager.initializeAuthState(props.dispatch);
        SessionManager.setupTokenExpirationCheck(props.dispatch);
        
        // Validate session integrity
        if (props.authenticated && !SessionManager.validateSession()) {
            console.log('❌ Session validation failed, redirecting to login');
            props.dispatch({ type: 'USER_LOGIN', payload: false });
        }
    }, []);

    // Determine navigation bar based on authentication state and role
    let navBar;
    if(props.authenticated){
        const role_ = AuthService.findrole();
        console.log('Current user role:', role_);
        
        if(role_ === "user"){
            navBar = <Route path="/" component={UserHeader}></Route>  
        }else if(role_ === "admin"){
            navBar = <Route path="/" component={AdminHeader}></Route>  
        }else if(role_ === "driver"){
            navBar = <Route path="/" component={DriverHeader}></Route>  
        } else {
            // Invalid role, show default header
            navBar = <Route path="/" component={Header}></Route>
        }
    }else{
        console.log("User not authenticated, showing default header");
        navBar = <Route path="/" component={Header}></Route>  
    }

  return (
    <Router>
        {navBar}
        <Route path="/" exact component={Homepage}></Route>
      <Switch>
        <Route path="/mainhomepage" component={HomepageAdmin}></Route>
        <Route path="/updatepackage" component={UpdatepackageAdmin}></Route>
        <Route path="/login" component={LoginPage}></Route>
        <Route path="/notloggedinErrorpage" component={UserHomePage}></Route>
        <Route path="/signup" component={Signuppage}></Route>
        <Route path="/adminhomepage" component={HomepageAdmin}></Route>
        <Route path="/addpackagedetail" component={AddpackageAdmin}></Route>
        <Route path="/localnewbooking" component={LocalTourPage}></Route>
        <Route path="/localpackagelist" component={LocalTourPage}></Route>
        <Route path="/tourpackagelist" component={TourPackage}></Route>
        <Route path="/confirmbooking" component={ConfirmBooking}></Route>
        {/* <Route path="/tourconfirmbooking/:currentdetails" component={TourConfirmBooking}></Route> */}
        <Route path="/tourconfirmbooking" component={TourConfirmBooking}></Route> 
        <Route path="/updatepackagedetail/:packagenameid" component={UpdatepackageAdmin}></Route>
        <Route path="/thankyou" component={Thanks}></Route>
        <Route path="/userlocalbookinglist" component={BookingList}></Route>
        <Route path="/usertourbookinglist" component={Tourbookinglist}></Route> 
        <Route path="/allsignedupusers" component={AllsignedUsers}></Route>
        <Route path="/adminAllLocalBookingList" component={AllLocalBooked}></Route>
        <Route path="/adminAllTourbookinglist" component={AllTourBooked}></Route>
        <Route path="/tourbeforeconfirmpage/:packagenameid" component={TourBeforeConfirm}></Route>
        <Route path="/carKilometerDetails" component={CarDetails}></Route>
        <Route path="/carKilometerDetailsAdmin" component={CarDetailsAdmin}></Route>
        <Route path="/addnewcarkmdetails" component={AddCarKmdetail}></Route>
        <Route path="/updatecarkmdetail/:vechicleid" component={UpdateCarKmDetail}></Route>
        <Route path="/userlogdetails" component={UserLogDetail}></Route>
        <Route path="/pickuplocation" component={PickupLocationPage}></Route>
        <Route path="/droplocation" component={DropLocationPage}></Route>
        <Route path="/Adminbookingdata" component={Booking}></Route>
        <Route path="/admin/drivers" component={DriverManagement}></Route>
        <Route path="/driver/home" component={() => <DriverRouteProtection><DriverHomePage /></DriverRouteProtection>}></Route>
        <Route path="/driver/feedback" component={() => <DriverRouteProtection><DriverMyFeedback /></DriverRouteProtection>}></Route>
        <Route path="/feedback-form" component={FeedbackForm}></Route>
        <Route path="/my-feedback" component={MyFeedback}></Route>
        <Route path="/admin/feedback" component={FeedbackManagement}></Route>


      </Switch>
 <section className="footer">
    <div className="box-container">
      {/* Company Brand Section */}
      <div className="box">
        <h3>Car Travels</h3>
        <p>Your trusted partner for comfortable and reliable car travel services. We provide premium transportation solutions for local tours, long-distance travel, and special occasions.</p>
        
        <div className="social-links">
          <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
          <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
          <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
        </div>
      </div>

      {/* Quick Links */}
      <div className="box">
        <h3>Quick Links</h3>
        <a href="/localnewbooking"><i className="fas fa-car"></i>Local Tours</a>
        <a href="/tourpackagelist"><i className="fas fa-map-marked-alt"></i>Tour Packages</a>
        <a href="/carKilometerDetails"><i className="fas fa-route"></i>Car Details</a>
        <a href="/userlocalbookinglist"><i className="fas fa-list"></i>My Bookings</a>
        <a href="/login"><i className="fas fa-sign-in-alt"></i>Login</a>
        <a href="/signup"><i className="fas fa-user-plus"></i>Sign Up</a>
      </div>

      {/* Services */}
      <div className="box">
        <h3>Our Services</h3>
        <a href="#"><i className="fas fa-car-side"></i>Airport Transfer</a>
        <a href="#"><i className="fas fa-city"></i>City Tours</a>
        <a href="#"><i className="fas fa-mountain"></i>Hill Station Tours</a>
        <a href="#"><i className="fas fa-temple-hindu"></i>Pilgrimage Tours</a>
        <a href="#"><i className="fas fa-birthday-cake"></i>Special Events</a>
        <a href="#"><i className="fas fa-briefcase"></i>Corporate Travel</a>
      </div>

      {/* Contact & Newsletter */}
      <div className="box">
        <h3>Contact Info</h3>
        <div className="contact-info">
          <div className="contact-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>240 Nallur Road, Jaffna Center, Sri Lanka</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-phone"></i>
            <span>+94 (71) 555-1234</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-envelope"></i>
            <span>VanGo@cartravels.com</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-clock"></i>
            <span>24/7 Customer Support</span>
          </div>
        </div>

        <div className="newsletter">
          <h4>Newsletter</h4>
          <p>Subscribe for travel deals and updates</p>
          <div className="newsletter-input">
            <input type="email" placeholder="Enter your email" />
            <button type="button">Subscribe</button>
          </div>
        </div>
      </div>
    </div>

    {/* Footer Bottom */}
    <div className="footer-bottom">
      <p>
        © 2025 VanGo Car Travels. Made with <span className="heart">♥</span> for travelers worldwide. 
        <a href="#" style={{color: '#3b82f6', marginLeft: '0.5rem'}}>Privacy Policy</a> | 
        <a href="#" style={{color: '#3b82f6', marginLeft: '0.5rem'}}>Terms of Service</a>
      </p>
    </div>
  </section>
    </Router>
  );
}

const mapStateToProps = (state) => {
  console.log('Inside Component APP.Js ', state);
  return {
    authenticated: state.authReducer.authenticated
  }
}

export default connect(mapStateToProps, null)(App);


