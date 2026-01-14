import React, { Component } from 'react'
import { Container, Button, Table, Form, Row, Col, Modal } from 'react-bootstrap'
import authHeader from '../services/auth-header';
import ImageUpload from '../Common/ImageUpload';

export default class DriverManagement extends Component {
    constructor(){
        super();
        this.state = {
            list: [],
            message: '',
            q: '',
            sortBy: 'name',
            showEditModal: false,
            selectedDriver: null,
            selectedLicenseImage: null,
            editSelectedLicenseImage: null
        };
        // Refs for create form
        this.name = React.createRef();
        this.email = React.createRef();
        this.phone = React.createRef();
        this.address = React.createRef();
        this.password = React.createRef();
        this.licenseNumber = React.createRef();
        this.experienceYears = React.createRef();
        
        // Refs for edit form
        this.editName = React.createRef();
        this.editEmail = React.createRef();
        this.editPhone = React.createRef();
        this.editAddress = React.createRef();
        this.editLicenseNumber = React.createRef();
        this.editExperienceYears = React.createRef();
    }

    componentDidMount(){
        this.fetchDrivers();
    }

    fetchDrivers(){
        const { q, sortBy } = this.state;
        const query = new URLSearchParams();
        if(q) query.set('q', q);
        if(sortBy) query.set('sortBy', sortBy);
        query.set('_ts', Date.now());
        fetch('http://localhost:8010/api/v1/drivers?'+query.toString(),{ headers: authHeader(), cache: 'no-store' })
          .then(r=> r.json())
          .then(d=> this.setState({ list: d.data || [] }))
          .catch(()=> this.setState({ message: 'Failed to load drivers' }));
    }

    async saveDriver(e){
        e.preventDefault();
        
        // Get form values
        const formData = {
            name: this.name.current.value?.trim(),
            email: this.email.current.value?.trim(),
            phone: this.phone.current.value?.trim(),
            address: this.address.current.value?.trim(),
            password: this.password.current.value?.trim(),
            licenseNumber: this.licenseNumber.current.value?.trim(),
            experienceYears: this.experienceYears.current.value?.trim()
        };
        
        // Validate required fields
        const missingFields = [];
        if(!formData.name) missingFields.push('Name');
        if(!formData.email) missingFields.push('Email');
        if(!formData.phone) missingFields.push('Phone');
        if(!formData.address) missingFields.push('Address');
        if(!formData.password) missingFields.push('Password');
        if(!formData.licenseNumber) missingFields.push('License Number');
        if(!formData.experienceYears) missingFields.push('Experience Years');
        if(!this.state.selectedLicenseImage) missingFields.push('License Image');
        
        if(missingFields.length > 0){
            this.setState({message: `Please fill in all required fields: ${missingFields.join(', ')}`});
            return;
        }
        
        // Validate name length
        if(formData.name.length < 3){
            this.setState({message: 'Name must be at least 3 characters long'});
            return;
        }
        
        // Validate email format - must contain @ and .com
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;
        if(!emailRegex.test(formData.email)){
            this.setState({message: 'Please enter a valid email address with .com domain (e.g., driver@example.com)'});
            return;
        }
        
        // Validate Sri Lankan phone format (10 digits starting with 0)
        const sriLankanPhoneRegex = /^0[0-9]{9}$/;
        if(!sriLankanPhoneRegex.test(formData.phone)){
            this.setState({message: 'Please enter a valid Sri Lankan phone number (10 digits starting with 0, e.g., 0771234567)'});
            return;
        }
        
        // Validate Sri Lankan address format
        if(formData.address.length < 5){
            this.setState({message: 'Address must be at least 5 characters long'});
            return;
        }
        
        // Check if address contains Sri Lankan location indicators
        const sriLankanLocationKeywords = [
            'colombo', 'kandy', 'galle', 'jaffna', 'negombo', 'anuradhapura', 'trincomalee', 'batticaloa',
            'kurunegala', 'ratnapura', 'badulla', 'matara', 'kalutara', 'gampaha', 'polonnaruwa', 'monaragala',
            'hambantota', 'vavuniya', 'puttalam', 'kegalle', 'nuwara eliya', 'sri lanka', 'ceylon'
        ];
        
        const addressLower = formData.address.toLowerCase();
        const hasSriLankanLocation = sriLankanLocationKeywords.some(keyword => 
            addressLower.includes(keyword)
        );
        
        if(!hasSriLankanLocation){
            this.setState({message: 'Address must contain a Sri Lankan city or location (e.g., Colombo, Kandy, Galle, etc.)'});
            return;
        }
        
        // Validate password length
        if(formData.password.length < 8 || formData.password.length > 20){
            this.setState({message: 'Password must be between 8 and 20 characters'});
            return;
        }
        
        // License image validation is handled by ImageUpload component
        
        // Validate Sri Lankan license number format
        const sriLankanLicenseRegex = /^[A-Z]{1,2}[0-9]{6,7}$/i;
        if(!sriLankanLicenseRegex.test(formData.licenseNumber)){
            this.setState({message: 'Invalid Sri Lankan license number format (1-2 letters followed by 6-7 digits, e.g., B1234567 or AB123456)'});
            return;
        }
        
        // Validate experience years - must be positive number
        const experienceYears = Number(formData.experienceYears);
        if(isNaN(experienceYears) || experienceYears < 0 || !Number.isInteger(experienceYears)){
            this.setState({message: 'Experience years must be a valid positive whole number (0 or greater)'});
            return;
        }
        
        try{
            // Create FormData for file upload
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('licenseNumber', formData.licenseNumber);
            formDataToSend.append('experienceYears', experienceYears);
            
            if (this.state.selectedLicenseImage) {
                formDataToSend.append('licenseImage', this.state.selectedLicenseImage);
            }
            
            console.log('Sending driver data with file upload');
            
            const res = await fetch('http://localhost:8010/api/v1/drivers',{
                method: 'POST',
                headers: {
                    ...authHeader()
                    // Don't set Content-Type, let browser set it for FormData
                },
                body: formDataToSend
            });
            
            const payload = await res.json();
            console.log('Driver creation response:', res.status, payload);
            
            if(res.status === 201){
                this.setState({message: 'Driver saved successfully'});
                // Clear form fields
                e.target.reset();
                this.name.current.value = '';
                this.email.current.value = '';
                this.phone.current.value = '';
                this.address.current.value = '';
                this.password.current.value = '';
                this.licenseNumber.current.value = '';
                this.experienceYears.current.value = '';
                this.setState({ selectedLicenseImage: null });
                this.fetchDrivers();
            }else{
                const errorMsg = payload?.message || payload?.error || 'Unable to save driver details';
                this.setState({message: errorMsg});
            }
        }catch(err){
            console.error('Driver creation error:', err);
            this.setState({message: 'Network error. Please check your connection and try again.'});
        }
    }
    
        async updateDriver(e){
            e.preventDefault();
            
            // Get form values
            const formData = {
                name: this.editName.current.value?.trim(),
                email: this.editEmail.current.value?.trim(),
                phone: this.editPhone.current.value?.trim(),
                address: this.editAddress.current.value?.trim(),
                licenseNumber: this.editLicenseNumber.current.value?.trim(),
                experienceYears: this.editExperienceYears.current.value?.trim()
            };
            
            // Validate required fields
            const missingFields = [];
            if(!formData.name) missingFields.push('Name');
            if(!formData.email) missingFields.push('Email');
            if(!formData.phone) missingFields.push('Phone');
            if(!formData.address) missingFields.push('Address');
            if(!formData.licenseNumber) missingFields.push('License Number');
            if(!formData.experienceYears) missingFields.push('Experience Years');
            // License image is optional for updates (keep existing if not provided)
            
            if(missingFields.length > 0){
                this.setState({message: `Please fill in all required fields: ${missingFields.join(', ')}`});
                return;
            }
            
            // Validate name length
            if(formData.name.length < 3){
                this.setState({message: 'Name must be at least 3 characters long'});
                return;
            }
            
            // Validate email format - must contain @ and .com
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;
            if(!emailRegex.test(formData.email)){
                this.setState({message: 'Please enter a valid email address with .com domain (e.g., driver@example.com)'});
                return;
            }
            
            // Validate Sri Lankan phone format (10 digits starting with 0)
            const sriLankanPhoneRegex = /^0[0-9]{9}$/;
            if(!sriLankanPhoneRegex.test(formData.phone)){
                this.setState({message: 'Please enter a valid Sri Lankan phone number (10 digits starting with 0, e.g., 0771234567)'});
                return;
            }
            
            // Validate Sri Lankan address format
            if(formData.address.length < 5){
                this.setState({message: 'Address must be at least 5 characters long'});
                return;
            }
            
            // Check if address contains Sri Lankan location indicators
            const sriLankanLocationKeywords = [
                'colombo', 'kandy', 'galle', 'jaffna', 'negombo', 'anuradhapura', 'trincomalee', 'batticaloa',
                'kurunegala', 'ratnapura', 'badulla', 'matara', 'kalutara', 'gampaha', 'polonnaruwa', 'monaragala',
                'hambantota', 'vavuniya', 'puttalam', 'kegalle', 'nuwara eliya', 'sri lanka', 'ceylon'
            ];
            
            const addressLower = formData.address.toLowerCase();
            const hasSriLankanLocation = sriLankanLocationKeywords.some(keyword => 
                addressLower.includes(keyword)
            );
            
            if(!hasSriLankanLocation){
                this.setState({message: 'Address must contain a Sri Lankan city or location (e.g., Colombo, Kandy, Galle, etc.)'});
                return;
            }
            
            // License image validation is handled by ImageUpload component
            
            // Validate Sri Lankan license number format
            const sriLankanLicenseRegex = /^[A-Z]{1,2}[0-9]{6,7}$/i;
            if(!sriLankanLicenseRegex.test(formData.licenseNumber)){
                this.setState({message: 'Invalid Sri Lankan license number format (1-2 letters followed by 6-7 digits, e.g., B1234567 or AB123456)'});
                return;
            }
            
            // Validate experience years - must be positive number
            const experienceYears = Number(formData.experienceYears);
            if(isNaN(experienceYears) || experienceYears < 0 || !Number.isInteger(experienceYears)){
                this.setState({message: 'Experience years must be a valid positive whole number (0 or greater)'});
                return;
            }
            try{
                const selectedId = this.state.selectedDriver && this.state.selectedDriver._id;
                
                // Create FormData for file upload
                const formDataToSend = new FormData();
                formDataToSend.append('name', formData.name);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('phone', formData.phone);
                formDataToSend.append('address', formData.address);
                formDataToSend.append('licenseNumber', formData.licenseNumber);
                formDataToSend.append('experienceYears', experienceYears);
                
                if (this.state.editSelectedLicenseImage) {
                    formDataToSend.append('licenseImage', this.state.editSelectedLicenseImage);
                }
                
                const res = await fetch('http://localhost:8010/api/v1/drivers/'+selectedId,{
                    method: 'PATCH',
                    headers: {
                        ...authHeader()
                        // Don't set Content-Type, let browser set it for FormData
                    },
                    body: formDataToSend
                });
                const payload = await res.json().catch(()=>null);
                console.log('Update response:', res.status, payload);
                if(res.ok && payload && payload.success){
                    // Optimistic update UI with returned driver data
                    this.setState(prev=>({
                        list: prev.list.map(d=> d._id === selectedId ? (payload.data || d) : d),
                        message: 'Driver updated',
                        showEditModal: false,
                        selectedDriver: null,
                        editSelectedLicenseImage: null
                    }), ()=> this.fetchDrivers());
                }else{
                    const msg = (payload && (payload.message || payload.error)) || 'Unable to update driver details. Please check your connection and try again.';
                    this.setState({message: msg});
                }
            }catch(err){
                console.error('Update error:', err); // Debug log
                this.setState({message: 'Unable to update driver details. Please check your connection and try again.'});
            }
        }

    async deleteDriver(id){
        // Show confirmation dialog
        if (!window.confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch('http://localhost:8010/api/v1/drivers/'+id,{ 
                method:'DELETE', 
                headers: authHeader() 
            });
            
            const payload = await res.json().catch(() => null);
            
            if(res.ok && payload && payload.success){
                this.setState({message: 'Driver deleted successfully!'});
                this.fetchDrivers(); // Refresh the list
                // Clear success message after 3 seconds
                setTimeout(() => this.setState({message: ''}), 3000);
            } else {
                this.setState({message: (payload && payload.message) || 'Delete failed'});
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.setState({message: 'Failed to delete driver. Please try again.'});
        }
    }

    openEditModal(driver){
        this.setState({
            showEditModal: true,
            selectedDriver: driver,
            editSelectedLicenseImage: null
        }, () => {
            // Populate form fields with driver data
            this.editName.current.value = driver.name;
            this.editEmail.current.value = driver.email;
            this.editPhone.current.value = driver.phone;
            this.editAddress.current.value = driver.address;
            this.editLicenseNumber.current.value = driver.licenseNumber;
            this.editExperienceYears.current.value = driver.experienceYears;
        });
    }

    closeEditModal(){
        this.setState({
            showEditModal: false,
            selectedDriver: null,
            editSelectedLicenseImage: null
        });
    }

    handleLicenseImageChange = (file) => {
        this.setState({ selectedLicenseImage: file });
    }

    handleEditLicenseImageChange = (file) => {
        this.setState({ editSelectedLicenseImage: file });
    }

    closeMessage(){
        this.setState({message: ''});
    }

    render(){
        return (
            <div className="MainDiv">
              <Container className="mt-3 p-3">
                {this.state.message && (
                    <div className={`alert ${this.state.message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible`} role="alert">
                        {this.state.message}
                        <button type="button" className="btn-close" onClick={this.closeMessage.bind(this)}></button>
                    </div>
                )}
                <h4 className="mb-3">Driver Management - Sri Lankan Drivers Only</h4>
                <div className="alert alert-info mb-3">
                  <strong>Note:</strong> This system is designed for Sri Lankan drivers only. All drivers must have valid Sri Lankan phone numbers, addresses, and license numbers.
                </div>

                <Form onSubmit={this.saveDriver.bind(this)}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Name</Form.Label>
                        <Form.Control ref={this.name} type="text" placeholder="Driver name" required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Email (.com required)</Form.Label>
                        <Form.Control ref={this.email} type="email" placeholder="driver@example.com" required />
                        <Form.Text className="text-muted">Must be a .com email address</Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Phone (Sri Lankan)</Form.Label>
                        <Form.Control ref={this.phone} type="text" placeholder="0771234567" required />
                        <Form.Text className="text-muted">10 digits starting with 0</Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Home Address (Sri Lankan)</Form.Label>
                        <Form.Control ref={this.address} type="text" placeholder="123 Main Street, Colombo" required />
                        <Form.Text className="text-muted">Must include a Sri Lankan city or location</Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Password</Form.Label>
                        <Form.Control ref={this.password} type="password" placeholder="Password" required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>License Number (Sri Lankan)</Form.Label>
                        <Form.Control ref={this.licenseNumber} type="text" placeholder="B1234567" required />
                        <Form.Text className="text-muted">1-2 letters followed by 6-7 digits</Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Experience (years)</Form.Label>
                        <Form.Control ref={this.experienceYears} type="number" placeholder="5" min="0" step="1" required />
                        <Form.Text className="text-muted">Must be a positive whole number (0 or greater)</Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <ImageUpload
                        onImageChange={this.handleLicenseImageChange}
                        label="License Image"
                        required={true}
                        accept="image/*"
                        maxSize={5 * 1024 * 1024}
                      />
                    </Col>
                  </Row>
                  <Button type="submit" className="mt-2">Save</Button>
                </Form>

                <hr/>
                <Row className="mb-2">
                  <Col md={6}>
                    <Form.Control placeholder="Search by name/license/status" value={this.state.q} onChange={(e)=> this.setState({q: e.target.value}, ()=> this.fetchDrivers()) } />
                  </Col>
                  <Col md={3}>
                    <Form.Control as="select" value={this.state.sortBy} onChange={(e)=> this.setState({sortBy: e.target.value}, ()=> this.fetchDrivers()) }>
                      <option value="name">Name</option>
                      <option value="licenseNumber">License</option>
                      <option value="status">Status</option>
                      <option value="-createdAt">Newest</option>
                    </Form.Control>
                  </Col>
                </Row>

                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Phone</th><th>License</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.list.map(d=> (
                      <tr key={d._id}>
                        <td>{d.name}</td>
                        <td>{d.email}</td>
                        <td>{d.phone}</td>
                        <td>{d.licenseNumber}</td>
                        <td>{d.status}</td>
                        <td>
                          <Button variant="info" size="sm" className="me-2" onClick={()=> this.openEditModal(d)}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={()=> this.deleteDriver(d._id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Container>

              {/* Edit Driver Modal */}
              <Modal show={this.state.showEditModal} onHide={()=> this.closeEditModal()}>
                <Modal.Header closeButton>
                  <Modal.Title>Edit Driver</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={this.updateDriver.bind(this)}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Name</Form.Label>
                          <Form.Control ref={this.editName} type="text" placeholder="Driver name" required />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Email (.com required)</Form.Label>
                          <Form.Control ref={this.editEmail} type="email" placeholder="driver@example.com" required />
                          <Form.Text className="text-muted">Must be a .com email address</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Phone (Sri Lankan)</Form.Label>
                          <Form.Control ref={this.editPhone} type="text" placeholder="0771234567" required />
                          <Form.Text className="text-muted">10 digits starting with 0</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Home Address (Sri Lankan)</Form.Label>
                          <Form.Control ref={this.editAddress} type="text" placeholder="123 Main Street, Colombo" required />
                          <Form.Text className="text-muted">Must include a Sri Lankan city or location</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>License Number (Sri Lankan)</Form.Label>
                          <Form.Control ref={this.editLicenseNumber} type="text" placeholder="B1234567" required />
                          <Form.Text className="text-muted">1-2 letters followed by 6-7 digits</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Experience (years)</Form.Label>
                          <Form.Control ref={this.editExperienceYears} type="number" placeholder="5" min="0" step="1" required />
                          <Form.Text className="text-muted">Must be a positive whole number (0 or greater)</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <ImageUpload
                          onImageChange={this.handleEditLicenseImageChange}
                          currentImageUrl={this.state.selectedDriver?.licenseImageUrl}
                          label="License Image"
                          required={false}
                          accept="image/*"
                          maxSize={5 * 1024 * 1024}
                        />
                      </Col>
                    </Row>
                    <Button variant="secondary" className="me-2" onClick={()=> this.closeEditModal()}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Update Driver
                    </Button>
                  </Form>
                </Modal.Body>
              </Modal>
            </div>
          )
      }
  }


