import React, { Component } from 'react'
import '../App.css'
import {Button} from 'react-bootstrap' 
import {Link} from "react-router-dom";
import logo from "../Assets/Logo.png"
import './Header.css'

export default class Header extends Component {
    constructor(){
        super();
        this.state = {navbarshow:"collapse navbar-collapse justify-content-end", ShowStatus : false}
    }

    logout(){
        localStorage.removeItem('token');
        this.props.history.push("/");
        window.location.reload();
    }

    show(){
        if(!this.state.ShowStatus){
          this.setState({navbarshow:"collapse navbar-collapse justify-content-end show", ShowStatus : true})
        }else{
          this.setState({navbarshow:"collapse navbar-collapse justify-content-end", ShowStatus : false})
        }
    }

    render() {
      
        return (
            <div className="MainDiv">
            <nav className="navbar navbar-expand-lg modern-navbar">
              <div className="navbar-brand modern-brand">
                <Link to={'/'} className="brand-link">
                    <img alt="logo" src={logo} className="brand-logo"/>
                    <span className="brand-text">VanGo Travels</span>
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
                            <Link to={'/localnewbooking'} className="nav-link modern-link">
                                <i className="fas fa-car"></i>
                                <span>Local Package</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/tourpackagelist'} className="nav-link modern-link">
                                <i className="fas fa-route"></i>
                                <span>Tour Package</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/carKilometerDetails'} className="nav-link modern-link">
                                <i className="fas fa-cogs"></i>
                                <span>Car Details</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/signup'} className="nav-link modern-link signup-link">
                                <i className="fas fa-user-plus"></i>
                                <span>Sign Up</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/login'} className="nav-link modern-link login-link">
                                <i className="fas fa-sign-in-alt"></i>
                                <span>Log In</span>
                            </Link>
                        </li>
                    </ul>
                </div>

                </nav>
            </div>
        )
    }
}

