import React, { Component } from 'react'
import AllLocalBooked from './AllLocalBooked'

export default class Booking extends Component {
    render() {
        return (
            <>
            <div className="bookinglist row text-center">
                <div className="col-6 col-sm-6 col-md-6 col-xl-6">
                   <button type="submit" className="btn btn-secondary btn-lg" >Local Bookings</button>
                </div>

                <div className="col-6 col-sm-6 col-md-6 col-xl-6">
                    <button type="submit" className="btn btn-secondary btn-lg">Tour Bookings</button>
                </div>
            </div>
            <AllLocalBooked/>
            </>
        )
    }
}
