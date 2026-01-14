import React, { Component } from 'react'
import {Button,Card,Row,Container} from 'react-bootstrap' 
import tourcar2 from '../Assets/tour-car2.png';

import authHeader from '../services/auth-header';
import AuthService from '../services/auth'

export default class TourPackage extends Component {
    constructor(){
        super();
        this.sortbydata = React.createRef();
        this.state = {PackageNumberList:[1,2,3], DisplayNoOfDaysList:[],GalleryDatas:[], currentrole : "",searchList:[], displayAll : 1}
    }

    componentDidMount(){
        // Check if user is logged in, if not redirect to login
        if(!AuthService.isAuthenticated() || AuthService.findrole() !== "user"){
            this.props.history.push("/login");
            return;
        }
        
        fetch('http://localhost:8010/api/v1/adminHomePage',{
            headers:authHeader()
        })
        .then(res=>res.json())
        .then(data=>{
            this.setState({GalleryDatas: data.data})
        })
        .catch(err => {
            console.error('Failed to fetch packages:', err);
        });
    }

    addTourBookingDB(Gallerydata){
        var userid  =  AuthService.finduserid();
        var usernameid = AuthService.findusername();
        fetch('http://localhost:8010/api/v1/cartourbookedusers', {
                method: 'POST',
                headers: {
                    ...authHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({packagename: Gallerydata.packagename, packageprice : Gallerydata.packageprice, carType : Gallerydata.carType, noofdays : Gallerydata.noofdays, user : userid, usernameid : usernameid}),
        })
        .then(res=>{
            console.log(res.status);
            if(res.status === 201){
                this.props.history.push("/tourconfirmbooking");
            } else {
                return res.json().then(err => {
                    alert(err.message || 'Booking failed');
                });
            }
        })
        .catch(err => {
            console.error('Booking error:', err);
            alert('Network error. Please try again.');
        });
    }

    booknow(Gallerydata){
        if(AuthService.findrole() === "user"){
            console.log("gallerydate = > ",Gallerydata)
            // this.addTourBookingDB(Gallerydata)
            this.props.history.push("/tourbeforeconfirmpage/"+Gallerydata)
        }else if(AuthService.findrole() === "admin"){
            alert("Admin can't Book tours")
        }else{
            alert("Please Login to Book ! 😊")
            this.props.history.push("/login")
        }
    }

    sortfunction(e){
        e.preventDefault();
        fetch('http://localhost:8010/api/v1/adminHomePage/?sort='+ this.sortbydata.current.value,{
            headers:authHeader()
        })
        .then(res=>res.json())
        .then(data=>{
            this.setState({searchList : data.data, displayAll : 2})
            console.log("user",this.state.searchList)
        })
        .catch(err => {
            console.error('Failed to fetch sorted packages:', err);
        });   
    }

    displayBasedOnNoofDays(NoofDays){
        console.log("Package_NoofDays",NoofDays)
        fetch('http://localhost:8010/api/v1/adminHomePage/'+NoofDays,{
            headers:authHeader()
        })
        .then(res=>res.json())
        .then(data=>{
            this.setState({DisplayNoOfDaysList : data,displayAll : 3})
            console.log("user",this.state.DisplayNoOfDaysList)
        })
        .catch(err => {
            console.error('Failed to fetch packages by days:', err);
        });
    }

    render() {
            var Packagenumberlist = this.state.PackageNumberList.map((Pack_No, i)=>{
                return(
                    <div className="col-12 col-sm-4 col-md-4 col-xl-4 cardpackage" key={i}>
                        <div className="card text-center border-0">
                            <div className="card-header packagecardheader">
                            Package
                            </div>
                            <div className="packagecardbody py-5">
                                <Button className="btn btn-info" onClick={this.displayBasedOnNoofDays.bind(this,Pack_No)}>{Pack_No} day Package</Button>
                            </div>
                        </div>
                    </div>
                )
            })

            console.log("displayAll_Number",this.state.displayAll)
            if(this.state.displayAll === 1){
                var display = this.state.GalleryDatas
            }else if(this.state.displayAll === 2){
                var display = this.state.searchList
            }else{
                var display = this.state.DisplayNoOfDaysList
            }
            console.log("length => ",display.length)
            console.log("Display => ",display)
    
            if(!display.length){
                var GalleryList = "No Data Available !"
            }else{
                var GalleryList = display.map((Gallerydata, i)=>{
                return (
                    <div className="col-12 col-sm-6 col-md-6 col-xl-4">
                      <Card className="Card_Gallery border-0" key={i}>
                        <Card.Img 
                            variant="top" 
                            src={Gallerydata.packageimage || 'https://via.placeholder.com/340x250?text=Tour+Package'} 
                            width="340px" 
                            height="250px"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/340x250?text=Tour+Package';
                            }}
                            style={{objectFit: 'cover'}}
                        />
                        <Card.Body className="text-center">
                            <Card.Title className="text-success cardtitle"><b>{Gallerydata.packagename}</b></Card.Title>
                            <Card.Text >
                                <p className="card-text text-primary">{Gallerydata.packagedetails}</p>
                                <p className="card-text text-info"> Car Type : {Gallerydata.carType}</p>
                                <p className="card-text text-secondary"> No. of Days : <b>{Gallerydata.noofdays}</b> day package</p>
                                <p className="card-text"><b>Price @ LKR {Gallerydata.packageprice}</b></p>
                            </Card.Text>
                        <Button variant="success" className="mt-3"  onClick={this.booknow.bind(this,Gallerydata.packagenameid)}> Book now</Button> 
                       </Card.Body>
                      </Card>
                   </div>
                );
            })
        }
        return (
          <div className="MainDiv CarImageMain">
             <div className="row">
                <img 
                    class="d-block opacity-decide-1" 
                    width="100%" 
                    height="500px" 
                    src={tourcar2} 
                    alt="Tour Package Background"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/1200x500?text=Safe+Journey+Happy+Journey';
                    }}
                    style={{objectFit: 'cover'}}
                />
                <div class="img-data">
                   <h1>Safe Journey &<br></br>Happy Journery</h1>
                   <p>Want to have a safe and happy Journey ?<br></br>CBE10 travels Welcomes you</p>
                   <button>
                         Select Tour Package
                         <i class="far fa-hand-point-down icon-tour"></i>
                    </button>
                 </div>
            </div>
            <div className="packagecolor">
               <Container className="card_main_div">
                    <div class="row">
                        {Packagenumberlist}
                    </div>
                </Container>
            </div>
                <div className="card_main_div gall_list_padding">
                    <form class="form-inline my-3">
                        <p className="tourpackage">Tour Packages</p>
                        <div class="form-group tourpackage_inline form-inline">
                            <select className="form-control" ref={this.sortbydata} id="sortbydata">
                                <option value=""> Display From </option>
                                <option value="packageprice"> Low to High Price</option>
                                <option value="-packageprice"> High to Low Price</option>
                            </select>
                            <button type="submit" className="btn btn-warning m-2 ml-0" onClick={this.sortfunction.bind(this)}>Search</button>
                        </div>
                    </form>
            
                    <Row> 
                        {GalleryList}
                    </Row>  

                 </div> 
          </div>
        )
    }
}


    