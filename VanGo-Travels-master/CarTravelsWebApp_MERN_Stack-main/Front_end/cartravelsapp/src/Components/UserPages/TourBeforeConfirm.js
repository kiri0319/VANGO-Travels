import React, { Component } from 'react'
import authHeader from '../services/auth-header';
import {Link} from "react-router-dom";


export default class TourBeforeConfirm extends Component {
    constructor(){
        super();
        this.username_ = false
        this.phonenum_ = false
        this.state = {currentCardData: [], datalist:[],name_:[],pass_:[],usernameCheck:"form-control",phonenumberCheck:"form-control"}
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        console.log(this.props);
        fetch('http://localhost:8010/api/v1/adminHomePage/'+params.packagenameid,{
            headers:authHeader()
        })
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            this.setState({currentCardData: data, datalist:[data.packagename,data.packageprice,data.carType,data.noofdays]})
        })
    }

    usernameHandler(event){
        let username1 = event.target.value;
        var validusername = new RegExp('[a-zA-Z\s]{3,25}');
        if (validusername.test(username1)) {
            this.setState({
                name_: [username1],
                usernameCheck:"form-control is-valid"
            })
            this.username_ = true
        }
        else {this.setState({usernameCheck:"form-control is-invalid"})
            this.username_=false
        }
    }

    phonenumberHandler(event){
        let phonenumber1 = event.target.value;
        var validphonenumber = new RegExp('^[0-9]{10}$');
        if (validphonenumber.test(phonenumber1)) {
            this.setState({
                pass_: [phonenumber1],
                phonenumberCheck:"form-control is-valid"
            })
            this.phonenum_ = true
        }
        else {this.setState({phonenumberCheck:"form-control is-invalid"})
             this.phonenum_ = false
        }
    }

    render() { 
        var show = true
        if(this.phonenum_ && this.username_){
            show = false
        }
        return (
         <div className="form-align">
            <div className="newbooking-loginpage change-bg">
            <div className="newbooking-user_login_top change-color"></div>
            <p className="mt-2 change-font-size">Please Give Name and Phonenumber for further contact !</p>
                <form className="newbooking-form" autoComplete="off" aria-required required>
                <div className="form-group">

                <div className="form-group row">
                    <div className="input-group mb-2">
                        <div className="input-group-prepend">
                            <div className="input-group-text"><i className="fas fa-user"></i></div>
                        </div>
                        <input type="text"  pattern="[A-Za-z]{3}" onChange={this.usernameHandler.bind(this)} className={this.state.usernameCheck} id="name" placeholder="Name" required="true"/>
                        <small className="invalid-feedback text-left"> 
                            Please Enter Valid Username
                        </small>
                    </div>
                </div>
                <div className="form-group row">
                    <div className="input-group mb-2">
                        <div className="input-group-prepend">
                            <div className="input-group-text"><i className="fas fa-mobile-alt"></i></div>
                        </div>
                        <input type="number"  onChange={this.phonenumberHandler.bind(this)} className={this.state.phonenumberCheck} id="phonenumber" placeholder="Phonenumber" required="true"/>
                        <small className="invalid-feedback text-left"> 
                            Please Enter Valid phonenumber
                        </small>
                    </div>
                </div>  
               
                <button 
                    type="button" 
                    className="btn btn-primary btn-color mb-4"  
                    disabled={show}
                    onClick={() => {
                        // Store data in sessionStorage as backup
                        const userName = this.state.name_[this.state.name_.length - 1];
                        const phoneNumber = this.state.pass_[this.state.pass_.length - 1];
                        
                        sessionStorage.setItem('tourUserName', userName);
                        sessionStorage.setItem('tourPhoneNumber', phoneNumber);
                        sessionStorage.setItem('tourBookingData', JSON.stringify(this.state.datalist));
                        
                        // Navigate with state data
                        this.props.history.push('/tourconfirmbooking', {
                            confirmdata: this.state.datalist,
                            PhoneNumber: phoneNumber,
                            UserName: userName
                        });
                    }}
                >
                    Continue
                </button>
                </div>
                </form>
                </div>
            </div>
        )
    }
}
