import React, { Component } from 'react'
import '../App.css'
import {Button} from 'react-bootstrap' 
import {Link} from "react-router-dom";
import * as actions from '../action/auth-action';
import {connect} from 'react-redux';
import logo from "../Assets/Logo.png"
import './UserHeader.css'

class UserHeader extends Component {
    constructor(props){
        super(props);
        this.state = {navbarshow:"collapse navbar-collapse justify-content-end", ShowStatus : false}
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
                            <Link to={'/userlocalbookinglist'} className="nav-link modern-link">
                                <i className="fas fa-list-alt"></i>
                                <span>Local Booked</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/usertourbookinglist'} className="nav-link modern-link">
                                <i className="fas fa-map-marked-alt"></i>
                                <span>Tour Booked</span>
                            </Link>
                        </li>
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
                            <Link to={'/userlogdetails'} className="nav-link modern-link">
                                <i className="fas fa-history"></i>
                                <span>User Log</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/my-feedback'} className="nav-link modern-link">
                                <i className="fas fa-comment-dots"></i>
                                <span>My Feedback</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/'} onClick={()=>this.props.onUserLogout()} className="nav-link modern-link logout-link">
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
    console.log('Inside Component ', state);
    return {
      authenticated: state.authReducer.authenticated
    }
  }

const mapDispatchToProps = (dispatch) => {
    return {
      onUserLogout: (user)=>dispatch(actions.login(false))
    }
  }
  
export default connect(mapStateToProps, mapDispatchToProps)(UserHeader);
