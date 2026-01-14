import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import authHeader from '../services/auth-header';
import AuthService from '../services/auth'
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge'

export default class Tourbookinglist extends Component {
    constructor(){
        super();
        this.state = {
            tourpreviousBookingList: [],
            feedbackEligibility: {}
        }
    }

    componentDidMount(){
        var Userid  =  AuthService.finduserid();
        fetch('http://localhost:8010/api/v1/cartourbookedusers/'+ Userid,{
            headers:authHeader()
        })
        .then(res=>{
            if(!res.ok){
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(data=>{
            const bookings = data || [];
            this.setState({tourpreviousBookingList: bookings});
            console.log(this.state.tourpreviousBookingList);
            
            // Check feedback eligibility for each booking
            this.checkFeedbackEligibility(bookings);
        })
        .catch(err=>{
            console.error('Failed to fetch tour bookings:', err);
            this.setState({tourpreviousBookingList: []});
        });
    }

    checkFeedbackEligibility = async (bookings) => {
        const eligibility = {};
        
        for (const booking of bookings) {
            try {
                const response = await fetch(`http://localhost:8010/api/v1/feedback/check-eligibility/${booking._id}?bookingType=tour`, {
                    headers: authHeader()
                });
                
                if (response.ok) {
                    const data = await response.json();
                    eligibility[booking._id] = data.data;
                } else {
                    eligibility[booking._id] = { canSubmitFeedback: false };
                }
            } catch (error) {
                console.error('Error checking feedback eligibility:', error);
                eligibility[booking._id] = { canSubmitFeedback: false };
            }
        }
        
        this.setState({ feedbackEligibility: eligibility });
    };

    deletepreviousBooking(_id){
        console.log("tourdeleteid",_id)
        fetch('http://localhost:8010/api/v1/cartourbookedusers/' + _id, {
            headers:authHeader(),
            method: 'DELETE'
        })
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            var Userid  =  AuthService.finduserid();
            fetch('http://localhost:8010/api/v1/cartourbookedusers/'+Userid,{
                headers:authHeader()
            })
            .then(res=>res.json())
            .then(data=>{
                this.setState({tourpreviousBookingList: data})
                console.log(this.state.tourpreviousBookingList)
            });
        });
    }
    render() {
        console.log("length => ",this.state.tourpreviousBookingList.length)
        let previousBookingDataList;
        if(!this.state.tourpreviousBookingList.length){
            previousBookingDataList = (
                <tr>
                    <td colSpan="11" className="text-center">Not yet Booked any travel !</td>
                </tr>
            );
        }else{
            previousBookingDataList = this.state.tourpreviousBookingList.map((previousBooking, i)=>{
                return (
                        <tr key={i}>
                            <th scope="row">{i+1}</th>
                            <td>{previousBooking.name}</td>
                            <td>{previousBooking.phoneNumber}</td> 
                            <td>{previousBooking.packagename}</td>
                            <td>{previousBooking.carType}</td>
                            <td>{previousBooking.noofdays}</td>
                            <td>{previousBooking.packageprice}</td>
                            <td>{previousBooking.packageDate}</td>
                            <td>
                                {previousBooking.driver ? (
                                    <div>
                                        <Badge variant="success">
                                            <i className="fas fa-user-check mr-1"></i>
                                            {previousBooking.driver.name}
                                        </Badge>
                                        <br />
                                        <small className="text-muted">
                                            {previousBooking.driver.phone}
                                        </small>
                                    </div>
                                ) : (
                                    <Badge variant="secondary">
                                        <i className="fas fa-user-times mr-1"></i>
                                        No Driver Assigned
                                    </Badge>
                                )}
                            </td>
                            <td>
                                <Badge variant={
                                    previousBooking.status === 'completed' ? 'success' :
                                    previousBooking.status === 'in_progress' ? 'warning' :
                                    previousBooking.status === 'cancelled' ? 'danger' : 'secondary'
                                }>
                                    {previousBooking.status || 'assigned'}
                                </Badge>
                            </td>
                            <td>
                                <button type="button" onClick={this.deletepreviousBooking.bind(this, previousBooking._id)} className="btn btn-danger m-1"> Delete </button>
                                {this.state.feedbackEligibility[previousBooking._id]?.canSubmitFeedback ? (
                                    <Link 
                                        to={{
                                            pathname: '/feedback-form',
                                            state: {
                                                bookingData: {
                                                    bookingType: 'tour',
                                                    bookingId: previousBooking._id
                                                }
                                            }
                                        }}
                                        className="btn btn-success m-1"
                                    >
                                        Give Feedback
                                    </Link>
                                ) : this.state.feedbackEligibility[previousBooking._id]?.hasFeedback ? (
                                    <span className="btn btn-secondary m-1" disabled>
                                        Feedback Given
                                    </span>
                                ) : (
                                    <span className="btn btn-outline-secondary m-1" disabled>
                                        No Driver Assigned
                                    </span>
                                )}
                            </td>
                        </tr>
                );
            })
        }
    
    return (
        <div className="MainDiv">
        <h1 className="bookinglist">Tour Package Booking List</h1>
        <Table responsive className="table table-striped">
            <thead className="thead-dark">
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Booked by</th>
                    <th scope="col">Phone No</th>
                    <th scope="col">Package Name</th>
                    <th scope="col">Car Type</th>
                    <th scope="col">Days</th>
                    <th scope="col">Price</th>
                    <th scope="col">Booked Date</th>
                    <th scope="col">Assigned Driver</th>
                    <th scope="col">Status</th>
                    <th scope="col">Any changes</th>
                </tr>
            </thead>
            <tbody>
                {previousBookingDataList}
            </tbody>
        </Table>
        </div>
    )
   }
}

