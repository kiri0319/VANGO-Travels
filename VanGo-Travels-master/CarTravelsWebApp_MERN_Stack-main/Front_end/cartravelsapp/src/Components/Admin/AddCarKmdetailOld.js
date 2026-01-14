import React, { Component } from 'react'
import {Container, Row, Col, Card, Form, Button, Alert, Spinner} from 'react-bootstrap'
import authHeader from '../services/auth-header';
import './AddCarKmdetail.css';

export default class AddCarKmdetail extends Component {
    constructor(){
        super();
        this.vechicleid  = React.createRef();
        this.vechicle    = React.createRef();
        this.minkm = React.createRef();
        this.rateperkm   = React.createRef();
        this.driverallowance   = React.createRef();
        this.amount        = React.createRef();
        this.state = {
            CarKmDatas: [],
            message: "",
            messageType: "success",
            loading: false,
            formData: {
                vechicleid: '',
                vechicle: '',
                minkm: '',
                rateperkm: '',
                driverallowance: '',
                amount: '',
                carType: 'AC',
                seatingCapacity: '',
                fuelType: 'Petrol',
                transmission: 'Manual'
            }
        }
    }

    handleInputChange = (field, value) => {
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [field]: value
            }
        }));
    }

    validateForm = () => {
        const { formData } = this.state;
        const errors = [];

        if (!formData.vechicleid.trim()) errors.push('Vehicle ID is required');
        if (!formData.vechicle.trim()) errors.push('Vehicle name is required');
        if (!formData.minkm || formData.minkm <= 0) errors.push('Minimum kilometers must be greater than 0');
        if (!formData.rateperkm || formData.rateperkm <= 0) errors.push('Rate per kilometer must be greater than 0');
        if (!formData.amount || formData.amount <= 0) errors.push('Amount must be greater than 0');
        if (!formData.seatingCapacity || formData.seatingCapacity <= 0) errors.push('Seating capacity must be greater than 0');

        return errors;
    }

    async AddCarKmDetail(event){
        event.preventDefault();
        
        const validationErrors = this.validateForm();
        if (validationErrors.length > 0) {
            this.setState({
                message: 'Validation Error: ' + validationErrors.join(', '),
                messageType: 'danger'
            });
            return;
        }

        const token = localStorage.getItem('token');
        if(!token){
            this.setState({
                message: 'Please login as admin to add car km detail',
                messageType: 'danger'
            });
            return;
        }

        this.setState({ loading: true, message: '' });

        try{
            const response = await fetch('http://localhost:8010/api/v1/CarkilometerDetails', {
                method: 'POST',
                headers: {
                    ...authHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    vechicleid: this.state.formData.vechicleid.toUpperCase(),
                    vechicle: this.state.formData.vechicle.toUpperCase(),
                    minkm: Number(this.state.formData.minkm),
                    rateperkm: Number(this.state.formData.rateperkm),
                    driverallowance: Number(this.state.formData.driverallowance) || 0,
                    amount: Number(this.state.formData.amount),
                    carType: this.state.formData.carType,
                    seatingCapacity: Number(this.state.formData.seatingCapacity),
                    fuelType: this.state.formData.fuelType,
                    transmission: this.state.formData.transmission
                }),
            });
            
            console.log('Add car km status:', response.status);
            let payload = null;
            try{ payload = await response.json(); }catch(e){ /* ignore */ }
            
            if(response.status === 201){
                this.setState({
                    message: '🚗 Car details added successfully! ✔️',
                    messageType: 'success'
                });
                this.resetForm();
            }else if(response.status === 403){
                this.setState({
                    message: 'Unauthorized: Admin access required',
                    messageType: 'danger'
                });
            }else if(response.status === 400){
                if(payload && payload.errors && Array.isArray(payload.errors)){
                    this.setState({
                        message: 'Validation Error: ' + payload.errors.join(', '),
                        messageType: 'danger'
                    });
                }else{
                    this.setState({
                        message: payload?.message || 'Validation failed',
                        messageType: 'danger'
                    });
                }
            }else{
                const serverMsg = payload && (payload.message || payload.success);
                this.setState({
                    message: serverMsg || 'Failed to add car details',
                    messageType: 'danger'
                });
            }
        }catch(err){
            console.error('Add car km error:', err);
            this.setState({
                message: 'Network error. Please try again.',
                messageType: 'danger'
            });
        } finally {
            this.setState({ loading: false });
        }
    }

    resetForm = () => {
        this.setState({
            formData: {
                vechicleid: '',
                vechicle: '',
                minkm: '',
                rateperkm: '',
                driverallowance: '',
                amount: '',
                carType: 'AC',
                seatingCapacity: '',
                fuelType: 'Petrol',
                transmission: 'Manual'
            }
        });
    }

    closemessage(){
        this.setState({message : ""})
    }

    render() {
        if(this.state.message){
             var message = (
                <div className="alert alert-success" role="alert">
                    {this.state.message}
                   <button type="button" className="closebutton float-right" onClick={this.closemessage.bind(this)}>x</button>
                </div>
        )}
        return (
        <div className="MainDiv">
               <Container className="mt-3 p-3">
                {message}
                <form onSubmit={this.AddCarKmDetail.bind(this)}>
                    <div className="form-group">
                        <div className="form-group row">
                            <label htmlFor="inputvechicleid" className="col-sm-2 col-form-label">Vehicle Id</label>
                            <div className="col-sm-10">
                                <input ref={this.vechicleid} type="text" className="form-control" id="inputvechicleid" placeholder="Unique Vechicle Id" required/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="inputvechicle" className="col-sm-2 col-form-label">Vehicle Name</label>
                            <div className="col-sm-10">
                                <input ref={this.vechicle} type="text" className="form-control" id="inputvechicle" placeholder="Enter Vechicle" required/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="inputminkm" className="col-sm-2 col-form-label">Minimum kilometers</label>
                            <div className="col-sm-10">
                                <input ref={this.minkm} type="number" className="form-control" id="inputminkm" placeholder="Enter Minimum Kms" required/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="inputrateperkm" className="col-sm-2 col-form-label">Rate/Km</label>
                            <div className="col-sm-10">
                                <input ref={this.rateperkm} type="number" className="form-control" id="inputrateperkm" placeholder="Enter Rate/Km" required/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="inputdriverallowance" className="col-sm-2 col-form-label">Driver Allowance</label>
                            <div className="col-sm-10">
                                <input ref={this.driverallowance} type="number" className="form-control" id="inputdriverallowance" placeholder="Enter Driver Allowance" required/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="inputamount" className="col-sm-2 col-form-label">Amount</label>
                            <div className="col-sm-10">
                                <input ref={this.amount} type="number" className="form-control" id="amount" placeholder="Enter Amount" required/>
                            </div>
                        </div>
                        <input type="submit" value="Add New Detail 🚗" className="btn btn-primary m-2"/>
                    </div>
                </form>
                </Container>
            </div>
        )
    }
}

