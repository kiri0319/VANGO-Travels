import React, { Component } from 'react'
import {Container} from 'react-bootstrap'
import authHeader from '../services/auth-header';

export default class UpdateCarKmDetail extends Component {
        constructor(){
            super();
            this.vechicleid  = React.createRef();
            this.vechicle    = React.createRef();
            this.minkm       = React.createRef();
            this.rateperkm   = React.createRef();
            this.driverallowance   = React.createRef();
            this.amount      = React.createRef();
            this.state = {CarKmDatas: [],message: "" }
        }
    
        componentDidMount() {
            const { match: { params } } = this.props;
            console.log('Loading car detail for vehicle ID:', params.vechicleid);
            
            fetch('http://localhost:8010/api/v1/CarkilometerDetails/'+params.vechicleid,{
                headers: authHeader()
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('Car detail data:', data);
                // Handle new API response format
                let carData = null;
                if (data && data.success && data.data) {
                    carData = data.data;
                } else if (data && data.length > 0) {
                    carData = data[0];
                } else if (data) {
                    carData = data;
                }
                
                if (carData) {
                    this.vechicleid.current.value = carData.vechicleid;
                    this.vechicle.current.value = carData.vechicle;
                    this.minkm.current.value = carData.minkm;
                    this.rateperkm.current.value = carData.rateperkm;
                    this.driverallowance.current.value = carData.driverallowance;
                    this.amount.current.value = carData.amount;

                    this.setState({CarKmDatas: carData});
                } else {
                    this.setState({message: 'Car detail not found'});
                }
            })
            .catch(error => {
                console.error('Error loading car detail:', error);
                this.setState({message: 'Failed to load car detail. Please try again.'});
            });
        }
    
        UpdateCarKmDetail(event){
            event.preventDefault();
            if(this.vechicle.current.value === "" || this.minkm.current.value === "" || this.rateperkm.current.value === "" || this.driverallowance.current.value === "" ||  this.amount.current.value === ""){
                this.setState({message: 'Please fill in all the fields'})
            }else{
                this.setState({message: 'Updating...'});
                
                fetch('http://localhost:8010/api/v1/CarkilometerDetails/'+this.state.CarKmDatas.vechicleid, {
                    method: 'PATCH',
                    headers: {
                        ...authHeader(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        vechicle: this.vechicle.current.value, 
                        minkm: this.minkm.current.value, 
                        rateperkm: this.rateperkm.current.value, 
                        driverallowance: this.driverallowance.current.value, 
                        amount: this.amount.current.value
                    }),
                })
                .then(res => {
                    console.log('Update response status:', res.status);
                    if(res.ok){
                        return res.json();
                    } else {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                })
                .then(data => {
                    console.log('Update response data:', data);
                    this.setState({message: 'Successfully Updated ✔ 😍 Redirecting back to car details page...'});
                    
                    // Navigate back to car details page after 3 seconds
                    setTimeout(() => {
                        this.props.history.push('/carKilometerDetailsAdmin');
                    }, 3000);
                })
                .catch(error => {
                    console.error('Error updating car detail:', error);
                    this.setState({message: 'Failed to update car detail. Please try again.'});
                });
            } 
        }
    
        closemessage(){
            this.setState({message : ""})
        }
    
        render() {
            if(this.state.message){
                 var message = (
                    <div class="alert alert-success" role="alert">
                        {this.state.message}
                       <button type="button" className="closebutton float-right" onClick={this.closemessage.bind(this)}>x</button>
                    </div>
            )}
            return (
            <div className="MainDiv">
                 <Container className="mt-3 p-3">
                {message}
                <form onSubmit={this.UpdateCarKmDetail.bind(this)}>
                    <div className="form-group">
                        <div className="form-group row">
                            <label for="inputvechicleid" className="col-sm-2 col-form-label">Vehicle Id</label>
                            <div className="col-sm-10">
                                <input ref={this.vechicleid} type="text" class="form-control" id="inputvechicleid" placeholder="Unique Vechicle Id" disabled required/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label for="inputvechicle" className="col-sm-2 col-form-label">Vehicle Name</label>
                            <div className="col-sm-10">
                                <input ref={this.vechicle} type="text" class="form-control" id="inputvechicle" placeholder="Enter Vechicle" required/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label for="inputminkm" className="col-sm-2 col-form-label">Minimum kilometers</label>
                            <div className="col-sm-10">
                                <input ref={this.minkm} type="number" class="form-control" id="inputminkm" placeholder="Enter Minimum Kms" required/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label for="inputrateperkm" className="col-sm-2 col-form-label">Rate/Km</label>
                            <div className="col-sm-10">
                                <input ref={this.rateperkm} type="number" class="form-control" id="inputrateperkm" placeholder="Enter Rate/Km" required/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label for="inputdriverallowance" className="col-sm-2 col-form-label">Driver Allowance</label>
                            <div className="col-sm-10">
                                <input ref={this.driverallowance} type="number" class="form-control" id="inputdriverallowance" placeholder="Enter Driver Allowance" required/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label for="inputamount" className="col-sm-2 col-form-label">Amount</label>
                            <div className="col-sm-10">
                                <input ref={this.amount} type="number" class="form-control" id="amount" placeholder="Enter Amount" required/>
                            </div>
                        </div>
                        <div className="form-group row">
                            <div className="col-sm-12 text-center">
                                <input type="submit" value="Update Detail 🚗" className="btn btn-primary m-2"/>
                                <button type="button" onClick={() => this.props.history.push('/carKilometerDetailsAdmin')} className="btn btn-secondary m-2">
                                    Back to Car Details
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
                </Container>
                </div>
            )
        }
    }
    