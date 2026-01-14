import React, { Component } from 'react'
import {Container} from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import authHeader from '../services/auth-header';

class UpdatepackageAdmin extends Component {
    constructor(){
        super();
        this.packagenameid  = React.createRef();
        this.packagename    = React.createRef();
        this.packagedetails = React.createRef();
        this.packageprice   = React.createRef();
        this.packageimage   = React.createRef();
        this.carType        = React.createRef();
        this.noofdays       = React.createRef();
        this.state = {GalleryDatas: [],message: "" }
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
            this.packagenameid.current.value = data.packagenameid;
            this.packagename.current.value = data.packagename;
            this.packagedetails.current.value = data.packagedetails;
            this.packageprice.current.value = data.packageprice;
            this.packageimage.current.value = data.packageimage;
            this.carType.current.value = data.carType;
            this.noofdays.current.value = data.noofdays;
            this.setState({GalleryDatas: data});
            
            // Show current image preview
            if (data.packageimage) {
                this.validateImageUrl(data.packageimage);
            }
        })
        .catch(err => {
            console.error('Failed to fetch package details:', err);
            this.setState({message: 'Failed to load package details'});
        });
    }

    async UpdatePackageDetail(event){
        event.preventDefault();
        
        // Validate all required fields
        if(this.packagename.current.value === "" || 
           this.packagedetails.current.value === "" || 
           this.packageprice.current.value === "" || 
           this.packageimage.current.value === "" ||
           this.carType.current.value === "" ||
           this.noofdays.current.value === ""){
            this.setState({message: 'Please fill in all the required fields'});
            return;
        }

        // Validate price is a positive number
        const price = Number(this.packageprice.current.value);
        if(isNaN(price) || price <= 0){
            this.setState({message: 'Please enter a valid positive price'});
            return;
        }

        // Validate number of days is a positive integer
        const days = Number(this.noofdays.current.value);
        if(isNaN(days) || days <= 0 || !Number.isInteger(days)){
            this.setState({message: 'Please enter a valid number of days (positive integer)'});
            return;
        }

        try {
            const updateData = { 
                packagename: this.packagename.current.value, 
                packagedetails: this.packagedetails.current.value, 
                packageprice: price, 
                packageimage: this.packageimage.current.value, 
                carType: this.carType.current.value,
                noofdays: days
            };
            
            console.log('Updating package with data:', updateData);
            console.log('Package ID:', this.state.GalleryDatas.packagenameid);
            
            const response = await fetch('http://localhost:8010/api/v1/adminHomePage/'+this.state.GalleryDatas.packagenameid, {
                method: 'PATCH',
                headers: {
                    ...authHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData),
            });

            console.log('Update response status:', response.status);
            
            let responseData = null;
            try {
                responseData = await response.json();
            } catch (e) {
                console.log('No JSON response body');
            }

            if(response.status === 200){
                this.setState({message: 'Successfully Updated ✔ 😍'});
                // Optionally redirect back to admin homepage after successful update
                setTimeout(() => {
                    this.props.history.push('/adminhomepage');
                }, 2000);
            } else if(response.status === 404){
                this.setState({message: 'Package not found. It may have been deleted.'});
            } else if(response.status === 403){
                this.setState({message: 'Unauthorized: Admin access required'});
            } else if(response.status === 401){
                this.setState({message: 'Authentication required. Please login again.'});
            } else {
                const errorMessage = responseData?.message || responseData?.success || `Update failed with status ${response.status}`;
                this.setState({message: errorMessage});
            }
        } catch (error) {
            console.error('Error updating package:', error);
            this.setState({message: 'Network error. Please try again.'});
        }
    }

    closemessage(){
        this.setState({message : ""})
    }

    validateImageUrl(url) {
        const previewDiv = document.getElementById('imagePreview');
        if (!url) {
            previewDiv.innerHTML = '';
            return;
        }

        // Check if URL is valid
        try {
            new URL(url);
        } catch {
            previewDiv.innerHTML = '<small className="text-danger">Invalid URL format</small>';
            return;
        }

        // Check if it's an image URL
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
        if (!imageExtensions.test(url)) {
            previewDiv.innerHTML = '<small className="text-warning">URL does not appear to be an image</small>';
        }

        // Create preview
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '200px';
        img.style.maxHeight = '150px';
        img.style.border = '1px solid #ddd';
        img.style.borderRadius = '4px';
        img.onload = () => {
            previewDiv.innerHTML = '<small className="text-success">✓ Image loaded successfully</small><br/>';
            previewDiv.appendChild(img);
        };
        img.onerror = () => {
            previewDiv.innerHTML = '<small className="text-danger">✗ Failed to load image</small>';
        };
    }

    render() {
        const { message } = this.state;
        
        return (
        <div className="MainDiv">
            <Container className="p-3">
                <h2 className="mb-4">Update Tour Package</h2>
                
                {message && (
                    <div className={`alert ${message.includes('Successfully') || message.includes('success') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                        {message}
                        <button 
                            type="button" 
                            className="close" 
                            onClick={this.closemessage.bind(this)}
                            aria-label="Close"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                )}
                
                <form onSubmit={this.UpdatePackageDetail.bind(this)}>
                    <div className="form-group">
                        <div className="form-group row">
                            <label htmlFor="inputpackagenameid" className="col-sm-2 col-form-label">Package ID</label>
                            <div className="col-sm-10">
                                <input 
                                    ref={this.packagenameid} 
                                    type="text" 
                                    className="form-control" 
                                    id="inputpackagenameid" 
                                    placeholder="Package ID" 
                                    readOnly
                                    style={{backgroundColor: '#f8f9fa'}}
                                />
                                <small className="form-text text-muted">Package ID cannot be changed</small>
                            </div>
                        </div>
                        
                        <div className="form-group row">
                            <label htmlFor="inputpackagename" className="col-sm-2 col-form-label">Package Name</label>
                            <div className="col-sm-10">
                                <input 
                                    ref={this.packagename} 
                                    type="text" 
                                    className="form-control" 
                                    id="inputpackagename" 
                                    placeholder="Enter Package Name" 
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="inputpackagedetails" className="col-sm-2 col-form-label">Package Details</label>
                            <div className="col-sm-10">
                                <textarea 
                                    ref={this.packagedetails} 
                                    className="form-control" 
                                    id="inputpackagedetails" 
                                    placeholder="Describe the tour package details..." 
                                    rows="3"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group row">
                            <label htmlFor="inputpackageprice" className="col-sm-2 col-form-label">Package Price (LKR)</label>
                            <div className="col-sm-10">
                                <input 
                                    ref={this.packageprice} 
                                    type="number" 
                                    className="form-control" 
                                    id="inputpackageprice" 
                                    placeholder="15000" 
                                    min="1000"
                                    required
                                />
                                <small className="form-text text-muted">Enter price in Sri Lankan Rupees (LKR). Typical Sri Lanka tour packages range from LKR 15,000 - LKR 25,000</small>
                            </div>
                        </div>
                        
                        <div className="form-group row">
                            <label htmlFor="inputpackageimage" className="col-sm-2 col-form-label">Package Image URL</label>
                            <div className="col-sm-10">
                                <input 
                                    ref={this.packageimage} 
                                    type="url" 
                                    className="form-control" 
                                    id="inputpackageimage" 
                                    placeholder="https://example.com/image.jpg" 
                                    required
                                    onChange={(e) => this.validateImageUrl(e.target.value)}
                                />
                                <small className="form-text text-muted">Enter a valid image URL (jpg, png, gif, webp)</small>
                                <div id="imagePreview" className="mt-2"></div>
                            </div>
                        </div>
                        
                        <div className="form-group row">
                            <label htmlFor="inputcarType" className="col-sm-2 col-form-label">Car Type</label>
                            <div className="col-sm-10">
                                <select ref={this.carType} className="form-control" id="inputcarType" required>
                                    <option value="">Select Car Type</option>
                                    <option value="AC">AC</option>
                                    <option value="Non-AC">Non-AC</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-group row">
                            <label htmlFor="inputnoofdays" className="col-sm-2 col-form-label">No. of Days</label>
                            <div className="col-sm-10">
                                <input 
                                    ref={this.noofdays} 
                                    type="number" 
                                    className="form-control" 
                                    id="inputnoofdays" 
                                    placeholder="1" 
                                    min="1"
                                    max="30"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-group row">
                            <div className="col-sm-10 offset-sm-2">
                                <button type="submit" className="btn btn-success btn-lg">
                                    <i className="fas fa-save mr-2"></i>
                                    Update Package 🚗
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary btn-lg ml-2"
                                    onClick={() => this.props.history.push('/adminhomepage')}
                                >
                                    <i className="fas fa-arrow-left mr-2"></i>
                                    Back to Packages
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

export default withRouter(UpdatepackageAdmin);
