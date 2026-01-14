import React, { Component } from 'react'
import {Container} from 'react-bootstrap'
import authHeader from '../services/auth-header';

export default class AddpackageAdmin extends Component {
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

    async AddPackageDetail(event){
        event.preventDefault();
        if(this.packagenameid.current.value ==="" || this.packagename.current.value === "" || this.packagedetails.current.value === "" || this.packageprice.current.value === "" || this.packageimage.current.value === "" ||  this.carType.current.value === "" || this.noofdays.current.value === ""){
            this.setState({message: 'Enter all the fields'})
            return;
        }

        const token = localStorage.getItem('token');
        if(!token){
            this.setState({message: 'Please login as admin to add a package'})
            return;
        }

        try{
            const response = await fetch('http://localhost:8010/api/v1/adminHomePage', {
                method: 'POST',
                headers: {
                    ...authHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    packagenameid: this.packagenameid.current.value,
                    packagename: this.packagename.current.value,
                    packagedetails: this.packagedetails.current.value,
                    packageprice: Number(this.packageprice.current.value),
                    packageimage: this.packageimage.current.value,
                    carType: this.carType.current.value,
                    noofdays: Number(this.noofdays.current.value)
                }),
            });
            console.log('Add package status:', response.status);
            let payload = null;
            try{ payload = await response.json(); }catch(e){ /* ignore */ }
            if(response.status === 201){
                this.setState({message: 'Successfully Added ✔ 😍'});
                event.target.reset();
            }else if(response.status === 403){
                this.setState({message: 'Unauthorized: admin access required'});
            }else{
                const serverMsg = payload && (payload.message || payload.success);
                this.setState({message: serverMsg || 'Failed to add package'});
            }
        }catch(err){
            console.error('Add package error:', err);
            this.setState({message: 'Network error. Please try again.'})
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
                    <h2 className="mb-4">Add New Tour Package</h2>
                    
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
                    
                    <form onSubmit={this.AddPackageDetail.bind(this)}>
                        <div className="form-group">
                            <div className="form-group row">
                                <label htmlFor="inputpackagenameid" className="col-sm-2 col-form-label">Package Name ID</label>
                                <div className="col-sm-10">
                                    <input 
                                        ref={this.packagenameid} 
                                        type="text" 
                                        className="form-control" 
                                        id="inputpackagenameid" 
                                        placeholder="e.g., SRILANKA_CITY_TOUR" 
                                        required
                                    />
                                    <small className="form-text text-muted">Unique identifier for the package (uppercase, underscores)</small>
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
                                        placeholder="e.g., Srilanka City Tour" 
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
                                    <button type="submit" className="btn btn-primary btn-lg">
                                        <i className="fas fa-plus mr-2"></i>
                                        Add Package 🚗
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
