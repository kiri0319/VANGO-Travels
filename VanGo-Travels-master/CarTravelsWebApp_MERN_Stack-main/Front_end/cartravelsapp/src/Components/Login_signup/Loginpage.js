import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Container, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as actions from '../action/auth-action';
import AuthService from '../services/auth';

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            emailid: "",
            password: "",
            emailidCheck: "form-control",
            passwordCheck: "form-control"
        };
    }

    emailidHandler = (event) => {
        const email1 = event.target.value;
        const validemail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (validemail.test(email1)) {
            this.setState({ emailidCheck: "form-control is-valid", emailid: email1 });
        } else {
            this.setState({ emailidCheck: "form-control is-invalid" });
        }
    }

    passwordHandler = (event) => {
        const password1 = event.target.value;
        if (password1.length < 8) {
            this.setState({ passwordCheck: "form-control is-invalid" });
        } else {
            this.setState({ passwordCheck: "form-control is-valid", password: password1 });
        }
    }

    loginuser = (event) => {
        event.preventDefault();
        if (this.state.emailidCheck === "form-control is-valid" && this.state.passwordCheck === "form-control is-valid") {
            let user = { emailid: this.state.emailid, password: this.state.password };
            console.log("userdetail", user);
            this.props.onUserLogin(user).then(() => {
                const role = AuthService.findrole();
                if(role === 'admin'){
                    this.props.history.push('/adminhomepage');
                }else if(role === 'driver'){
                    this.props.history.push('/driver/home');
                }else{
                    this.props.history.push('/');
                }
            });
        } else {
            alert("input the correct credentials!");
        }
    }

    render() {
        return (
            <div className="MainDiv">
                <Container className="mt-3 mb-4 p-3">
                    <div className="loginpage">

                        <div className="user_login_top"></div>
                        <p className="user_login mt-2">User Login</p>

                        <form onSubmit={this.loginuser}>
                            <div className="form-group">
                                <div className="form-group row">
                                    <div className="input-group mb-2">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text"><i className="fas fa-envelope-square"></i></div>
                                        </div>
                                        <input
                                            type="email"
                                            onChange={this.emailidHandler}
                                            className={this.state.emailidCheck}
                                            id="email"
                                            placeholder="Email Id"
                                        />
                                        <small className="invalid-feedback text-left">
                                            சரியான Email-ஐ இடவும்
                                        </small>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <div className="input-group mb-2">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text"><i className="fas fa-unlock-alt"></i></div>
                                        </div>
                                        <input
                                            type="password"
                                            onChange={this.passwordHandler}
                                            className={this.state.passwordCheck}
                                            id="password"
                                            placeholder="Password"
                                        />
                                        <small className="invalid-feedback text-left">
                                            Password குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="login-button">Log in</Button>
                        </form>

                        <p className="text-muted mt-3 mb-1">Create Your Account </p>
                        <Link to={'/signup'} className="linkcolor">
                            <Button className="login-signup-button mb-4">Sign up</Button>
                        </Link>
                    </div>
                </Container>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onUserLogin: (user) => dispatch(actions.userLogin(user))
    };
}

export default connect(null, mapDispatchToProps)(LoginPage);
