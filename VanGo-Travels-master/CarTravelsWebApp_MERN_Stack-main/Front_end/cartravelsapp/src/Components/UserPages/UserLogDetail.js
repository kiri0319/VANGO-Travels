import React, { Component } from 'react'
import Table from 'react-bootstrap/Table'
import AuthService from '../services/auth'
import authHeader from '../services/auth-header'
    
export default class UserLogDetail extends Component {
        constructor(){
            super();
            this.searchinput = React.createRef();
            this.state = {userlogdetails: []}
        }
    
        componentDidMount(){
            var current_user = AuthService.finduserid();
            fetch('http://localhost:8010/api/v1/AllUsersLog/'+current_user,{
                headers:authHeader()
            })
            .then(res=>res.json())
            .then(data=>{
                this.setState({userlogdetails : data})
            });
        }
    
        render() {
                var FetchedData = this.state.userlogdetails.map((userlogdetail, i)=>{
                    return (
                            <tr key={i}>
                                <th scope="row">{i+1}</th>
                                <td>{userlogdetail.loggedinAt}</td>
                                <td>{userlogdetail.loggedoutAt}</td>
                                <td>{userlogdetail.status}</td>
                                </tr>
                    );
                })
        return (
        <div className="MainDiv main_carkmdetail ">
        <p className="carkm_ptag">Your Login-Logout Details</p>

            <div className="carkmdetail">
            <Table responsive className="table table-striped ">
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Login Time</th>
                        <th scope="col">LogOut Time</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>  {FetchedData}  </tbody>
                </Table>
            </div>    
              {/* <footer>
                 <p>&copy; 2021 done by Chandru</p>
            </footer>        */}
        </div>
        )
        }
    }
