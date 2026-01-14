import React, { Component } from 'react'
import {Link} from 'react-router-dom'

export default class UpdateBooked extends Component {

    constructor(){
        super();
        this.name = React.createRef();
        this.phoneNumber = React.createRef();
        this.FromLocation = React.createRef();
        this.ToLocation = React.createRef();
        this.DateTime = React.createRef();
        this.state = {message: "" }
    }
    componentDidMount() {
        const { match: { params } } = this.props;
        console.log(this.props);
        fetch('http://localhost:8010/api/v1/carbookedusers/'+params.name)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            this.name.current.value = data.name;
            this.phoneNumber.current.value = data.phoneNumber;
            this.FromLocation.current.value = data.FromLocation;
            this.ToLocation.current.value = data.ToLocation;
            this.DateTime.current.value = data.DateTime;
        })
    }

    UpdateBookingdata(event){
        event.preventDefault();
        if(this.name.current.value === "" || this.phoneNumber.current.value === "" || this.FromLocation.current.value === "" || this.ToLocation.current.value === "" || this.DateTime.current.value === ""){
            this.setState({message: 'Enter all the fields'})
        }else{
            fetch('http://localhost:8010/api/v1/carbookedusers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: this.name.current.value, phoneNumber: this.phoneNumber.current.value, FromLocation : this.FromLocation.current.value, ToLocation : this.ToLocation.current.value, DateTime : this.DateTime.current.value}),
            })
            .then(res=>{
                console.log(res.status);
                if(res.status === 201){
                    this.setState({message: 'Successfully Updated ✔ 😍'})
                }
            })
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
        <div className="Component">
        {message}
        <form>
            <div className="form-group">
                <div className="form-group row">
                    <label for="inputname" className="col-sm-2 col-form-label">Name</label>
                    <div className="col-sm-10">
                        <input ref={this.name} type="text" class="form-control" id="inputname" placeholder="EnterName" required autoComplete="off"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label for="inputphonenumber" className="col-sm-2 col-form-label">Phone Number</label>
                    <div className="col-sm-10">
                        <input ref={this.phoneNumber} type="text" class="form-control" id="inputphonenumber" placeholder="Enter Phone Number" required autoComplete="off"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label for="inputFromLocation" className="col-sm-2 col-form-label">Pickup Location</label>
                    <div className="col-sm-10">
                        <input ref={this.FromLocation} type="text" class="form-control" id="inputFromLocation" placeholder="Enter Pickup Location " required autoComplete="off"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label for="inputToLocation" className="col-sm-2 col-form-label">Drop Location</label>
                    <div className="col-sm-10">
                        <input ref={this.ToLocation} type="text" class="form-control" id="inputToLocation" placeholder="Enter Drop Location" required autoComplete="off"/>
                    </div>
                </div>
                <div className="form-group row">
                    <label for="inputdate_" className="col-sm-2 col-form-label">Date/Time</label>
                    <div className="col-sm-10">
                        <input ref={this.DateTime} type="text" class="form-control" id="inputdate_" placeholder="DD-MM-YY HH:MM"  required autoComplete="off"/>
                    </div>
                </div>
                <button type="submit" onClick={this.UpdateBookingdata.bind(this)} className="btn btn-primary">Update now 🚗</button>
            </div>
        </form>
        </div>
        )
    }
}