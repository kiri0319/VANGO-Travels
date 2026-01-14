import React, { Component } from 'react'
import '../App.css'
import {Button} from 'react-bootstrap' 
import {Link} from "react-router-dom";
import * as actions from '../action/auth-action';
import {connect} from 'react-redux';
import logo from "../Assets/Logo.png"
import AuthService from '../services/auth'
import './UserHeader.css'

class DriverHeader extends Component {
    constructor(props){
        super(props);
        this.state = {
            navbarshow: "collapse navbar-collapse justify-content-end", 
            ShowStatus: false,
            driverInfo: null
        }
    }
 
    show(){
        if(!this.state.ShowStatus){
          this.setState({navbarshow: "collapse navbar-collapse justify-content-end show", ShowStatus: true})
        }else{
          this.setState({navbarshow: "collapse navbar-collapse justify-content-end", ShowStatus: false})
        }
    }

    componentDidMount() {
        this.loadDriverInfo();
    }

    loadDriverInfo = () => {
        const driverId = AuthService.finduserid();
        if (driverId) {
            // Load driver info for display
            fetch(`http://localhost:8010/api/v1/drivers/${driverId}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    this.setState({ driverInfo: data.data });
                }
            })
            .catch(err => {
                console.error('Failed to load driver info:', err);
            });
        }
    }

    handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem('token');
        sessionStorage.clear();
        
        // Dispatch logout action
        this.props.onUserLogout();
        
        // Redirect to login
        window.location.href = '/login';
    }

    render() {
        const { driverInfo } = this.state;
        const driverName = driverInfo ? driverInfo.name : AuthService.findusername() || 'Driver';
      
        return (
            <div className="MainDiv">
            <nav className="navbar navbar-expand-lg modern-navbar">
              <div className="navbar-brand modern-brand">
                <Link to={'/driver/home'} className="brand-link">
                    <img alt="logo" src={logo} className="brand-logo"/>
                    <span className="brand-text">VanGo Travels - Driver Portal</span>
                </Link>
              </div>

                <button className="navbar-toggler modern-toggler" type="button" onClick={this.show.bind(this)} data-toggle="collapse" data-target="#navbarNavDropdown">
                    <span className="toggler-icon"></span>
                    <span className="toggler-icon"></span>
                    <span className="toggler-icon"></span>
                </button>

                <div className={this.state.navbarshow} id="navbarNavDropdown">
                    <ul className="navbar-nav modern-nav">
                        <li className="nav-item">
                            <Link to={'/driver/home'} className="nav-link modern-link">
                                <i className="fas fa-home"></i>
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/carKilometerDetails'} className="nav-link modern-link">
                                <i className="fas fa-car"></i>
                                <span>Car Details</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/driver/feedback'} className="nav-link modern-link">
                                <i className="fas fa-comment-dots"></i>
                                <span>My Feedback</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/'} onClick={this.handleLogout} className="nav-link modern-link logout-link">
                                <i className="fas fa-sign-out-alt"></i>
                                <span>Log Out</span>
                            </Link>
                        </li>
                     </ul>
                </div>

                </nav>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    console.log('Inside DriverHeader Component ', state);
    return {
        authenticated: state.authReducer.authenticated
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onUserLogout: (user) => dispatch(actions.login(false))
    }
}
         
export default connect(mapStateToProps, mapDispatchToProps)(DriverHeader);