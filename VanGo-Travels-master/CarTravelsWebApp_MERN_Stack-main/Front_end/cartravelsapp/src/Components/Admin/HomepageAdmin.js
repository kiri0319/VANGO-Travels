import React, { Component } from 'react'
import '../App.css'
import { Button, Card} from 'react-bootstrap'
import {Link} from "react-router-dom";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import authHeader from '../services/auth-header';

export default class HomepageAdmin extends Component {
    constructor(){
        super();
        this.state = {GalleryDatas: [], message: ''}
    }

    componentDidMount(){
        fetch('http://localhost:8010/api/v1/adminHomePage',{
            headers:authHeader()
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data=>{
            console.log('Admin homepage data:', data);
            if (data.success && data.data) {
                this.setState({GalleryDatas: data.data});
            } else {
                this.setState({message: 'No tour packages found'});
            }
        })
        .catch(error => {
            console.error('Error fetching admin homepage data:', error);
            this.setState({message: 'Failed to load tour packages: ' + error.message});
        });
    }

    deletepackage(packagenameid){
        if (!window.confirm('Are you sure you want to delete this tour package?')) {
            return;
        }
        
        fetch('http://localhost:8010/api/v1/adminHomePage/' + packagenameid, {
            headers:authHeader(),
            method: 'DELETE'
         })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data=>{
            console.log('Delete response:', data);
            this.setState({message: 'Package deleted successfully'});
            // Refresh the list
            fetch('http://localhost:8010/api/v1/adminHomePage',{
                headers:authHeader()
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data=>{
                if (data.success && data.data) {
                    this.setState({GalleryDatas: data.data});
                }
            })
            .catch(error => {
                console.error('Error refreshing data:', error);
                this.setState({message: 'Package deleted but failed to refresh list'});
            });
        })
        .catch(error => {
            console.error('Error deleting package:', error);
            this.setState({message: 'Failed to delete package: ' + error.message});
        });
    }

    render() {
        const { GalleryDatas, message } = this.state;
        
        let GalleryList;
        if (GalleryDatas.length === 0) {
            GalleryList = (
                <div className="col-12 text-center">
                    <div className="alert alert-info">
                        <h5>No tour packages found</h5>
                        <p>Click "Add Tour" to create your first tour package.</p>
                    </div>
                </div>
            );
        } else {
            GalleryList = GalleryDatas.map((Gallerydata, i)=>{
                return (
                    <div className="col-12 col-sm-6 col-md-6 col-xl-4" key={i}>
                    <Card className="Card_Gallery m-2 border-0">
                      <Card.Img 
                        variant="top" 
                        src={Gallerydata.packageimage || 'https://via.placeholder.com/340x250?text=No+Image'} 
                        width="340px" 
                        height="250px"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/340x250?text=No+Image';
                        }}
                        style={{objectFit: 'cover'}}
                      />
                      <Card.Body className="text-center">
                          <Card.Title className="text-success cardtitle">
                              <b>{Gallerydata.packagename}</b>
                          </Card.Title>
                          <Card.Text>
                              <p className="card-text text-primary">{Gallerydata.packagedetails}</p>
                              <p className="card-text text-info">Car Type: {Gallerydata.carType}</p>
                              <p className="card-text text-secondary">
                                  No. of Days: <b>{Gallerydata.noofdays}</b> day package
                              </p>
                              <p className="card-text"><b>Price: LKR {Gallerydata.packageprice}</b></p>
                          </Card.Text>
                          <Button variant="outline-primary" className="m-2">
                              <Link to={'updatepackagedetail/' + Gallerydata.packagenameid}>
                                  Update
                              </Link>
                          </Button>
                          <Button 
                              variant="outline-danger" 
                              onClick={this.deletepackage.bind(this, Gallerydata.packagenameid)} 
                              className="m-2"
                          >
                              Delete
                          </Button>
                       </Card.Body>
                    </Card>
                 </div>
                );
            });
        }

        return (
            <div className="MainDiv">
                <Container>
                    {message && (
                        <div className={`alert ${message.includes('success') || message.includes('Successfully') ? 'alert-success' : 'alert-danger'} mt-3`}>
                            {message}
                        </div>
                    )}
                    
                    <div className="tourpackage">
                        <h2>Tour Packages Management</h2>
                        <p>Manage your tour packages - add, edit, or delete packages</p>
                    </div>
                    
                    <Row>
                        {GalleryList}
                    </Row>
                </Container>
            </div>
        )
    }
}
