import React, { Component } from 'react'
import {Container, Row, Col, Card, Form, Button, Alert, Spinner} from 'react-bootstrap'
import authHeader from '../services/auth-header';
import './AddCarKmdetail.css';

export default class AddCarKmdetail extends Component {
    constructor(){
        super();
        this.state = {
            CarKmDatas: [],
            message: "",
            messageType: "success",
            loading: false,
            formData: {
                vechicleid: '',
                vechicle: '',
                minkm: '',
                rateperkm: '',
                driverallowance: '',
                amount: '',
                carType: 'AC',
                seatingCapacity: '',
                fuelType: 'Petrol',
                transmission: 'Manual'
            }
        }
    }

    handleInputChange = (field, value) => {
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [field]: value
            }
        }));
    }

    validateForm = () => {
        const { formData } = this.state;
        const errors = [];

        if (!formData.vechicleid.trim()) errors.push('Vehicle ID is required');
        if (!formData.vechicle.trim()) errors.push('Vehicle name is required');
        if (!formData.minkm || formData.minkm <= 0) errors.push('Minimum kilometers must be greater than 0');
        if (!formData.rateperkm || formData.rateperkm <= 0) errors.push('Rate per kilometer must be greater than 0');
        if (!formData.amount || formData.amount <= 0) errors.push('Amount must be greater than 0');
        if (!formData.seatingCapacity || formData.seatingCapacity <= 0) errors.push('Seating capacity must be greater than 0');

        return errors;
    }

    async AddCarKmDetail(event){
        event.preventDefault();
        
        const validationErrors = this.validateForm();
        if (validationErrors.length > 0) {
            this.setState({
                message: 'Validation Error: ' + validationErrors.join(', '),
                messageType: 'danger'
            });
            return;
        }

        const token = localStorage.getItem('token');
        if(!token){
            this.setState({
                message: 'Please login as admin to add car km detail',
                messageType: 'danger'
            });
            return;
        }

        this.setState({ loading: true, message: '' });

        try{
            const response = await fetch('http://localhost:8010/api/v1/CarkilometerDetails', {
                method: 'POST',
                headers: {
                    ...authHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    vechicleid: this.state.formData.vechicleid.toUpperCase(),
                    vechicle: this.state.formData.vechicle.toUpperCase(),
                    minkm: Number(this.state.formData.minkm),
                    rateperkm: Number(this.state.formData.rateperkm),
                    driverallowance: Number(this.state.formData.driverallowance) || 0,
                    amount: Number(this.state.formData.amount),
                    carType: this.state.formData.carType,
                    seatingCapacity: Number(this.state.formData.seatingCapacity),
                    fuelType: this.state.formData.fuelType,
                    transmission: this.state.formData.transmission
                }),
            });
            
            console.log('Add car km status:', response.status);
            let payload = null;
            try{ payload = await response.json(); }catch(e){ /* ignore */ }
            
            if(response.status === 201){
                this.setState({
                    message: '🚗 Car details added successfully! ✔️',
                    messageType: 'success'
                });
                this.resetForm();
            }else if(response.status === 403){
                this.setState({
                    message: 'Unauthorized: Admin access required',
                    messageType: 'danger'
                });
            }else if(response.status === 400){
                if(payload && payload.errors && Array.isArray(payload.errors)){
                    this.setState({
                        message: 'Validation Error: ' + payload.errors.join(', '),
                        messageType: 'danger'
                    });
                }else{
                    this.setState({
                        message: payload?.message || 'Validation failed',
                        messageType: 'danger'
                    });
                }
            }else{
                const serverMsg = payload && (payload.message || payload.success);
                this.setState({
                    message: serverMsg || 'Failed to add car details',
                    messageType: 'danger'
                });
            }
        }catch(err){
            console.error('Add car km error:', err);
            this.setState({
                message: 'Network error. Please try again.',
                messageType: 'danger'
            });
        } finally {
            this.setState({ loading: false });
        }
    }

    resetForm = () => {
        this.setState({
            formData: {
                vechicleid: '',
                vechicle: '',
                minkm: '',
                rateperkm: '',
                driverallowance: '',
                amount: '',
                carType: 'AC',
                seatingCapacity: '',
                fuelType: 'Petrol',
                transmission: 'Manual'
            }
        });
    }

    closemessage(){
        this.setState({message : ""})
    }

    render() {
        const { message, messageType, loading, formData } = this.state;

        return (
            <div className="MainDiv">
                <Container className="mt-4">
                    <Row className="justify-content-center">
                        <Col lg={10} xl={8}>
                            <Card className="modern-card shadow-lg">
                                <Card.Header className="modern-card-header">
                                    <h2 className="mb-0">
                                        <i className="fas fa-car mr-2"></i>
                                        Add New Car Details
                                    </h2>
                                    <p className="text-muted mb-0">Add comprehensive car information for your fleet</p>
                                </Card.Header>
                                
                                <Card.Body className="p-4">
                                    {message && (
                                        <Alert 
                                            variant={messageType} 
                                            dismissible 
                                            onClose={this.closemessage.bind(this)}
                                            className="modern-alert"
                                        >
                                            <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
                                            {message}
                                        </Alert>
                                    )}

                                    <Form onSubmit={this.AddCarKmDetail.bind(this)} className="modern-form">
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <i className="fas fa-id-card mr-1"></i>
                                                        Vehicle ID *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="e.g., CAR001, SUV002"
                                                        value={formData.vechicleid}
                                                        onChange={(e) => this.handleInputChange('vechicleid', e.target.value)}
                                                        className="modern-input"
                                                        required
                                                    />
                                                    <Form.Text className="text-muted">
                                                        Unique identifier for the vehicle
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <i className="fas fa-car mr-1"></i>
                                                        Vehicle Name *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="e.g., Toyota Innova, Maruti Swift"
                                                        value={formData.vechicle}
                                                        onChange={(e) => this.handleInputChange('vechicle', e.target.value)}
                                                        className="modern-input"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <i className="fas fa-route mr-1"></i>
                                                        Minimum KM *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="e.g., 100"
                                                        value={formData.minkm}
                                                        onChange={(e) => this.handleInputChange('minkm', e.target.value)}
                                                        className="modern-input"
                                                        min="1"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <i className="fas fa-rupee-sign mr-1"></i>
                                                        Rate per KM *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="e.g., 15"
                                                        value={formData.rateperkm}
                                                        onChange={(e) => this.handleInputChange('rateperkm', e.target.value)}
                                                        className="modern-input"
                                                        min="1"
                                                        step="0.01"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <i className="fas fa-user-tie mr-1"></i>
                                                        Driver Allowance
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="e.g., 500"
                                                        value={formData.driverallowance}
                                                        onChange={(e) => this.handleInputChange('driverallowance', e.target.value)}
                                                        className="modern-input"
                                                        min="0"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <i className="fas fa-money-bill-wave mr-1"></i>
                                                        Base Amount *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="e.g., 2000"
                                                        value={formData.amount}
                                                        onChange={(e) => this.handleInputChange('amount', e.target.value)}
                                                        className="modern-input"
                                                        min="1"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <i className="fas fa-users mr-1"></i>
                                                        Seating Capacity *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="e.g., 4, 6, 8"
                                                        value={formData.seatingCapacity}
                                                        onChange={(e) => this.handleInputChange('seatingCapacity', e.target.value)}
                                                        className="modern-input"
                                                        min="1"
                                                        max="15"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <i className="fas fa-snowflake mr-1"></i>
                                                        Car Type *
                                                    </Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        value={formData.carType}
                                                        onChange={(e) => this.handleInputChange('carType', e.target.value)}
                                                        className="modern-input"
                                                    >
                                                        <option value="AC">AC</option>
                                                        <option value="Non-AC">Non-AC</option>
                                                    </Form.Control>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <i className="fas fa-gas-pump mr-1"></i>
                                                        Fuel Type
                                                    </Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        value={formData.fuelType}
                                                        onChange={(e) => this.handleInputChange('fuelType', e.target.value)}
                                                        className="modern-input"
                                                    >
                                                        <option value="Petrol">Petrol</option>
                                                        <option value="Diesel">Diesel</option>
                                                        <option value="CNG">CNG</option>
                                                        <option value="Electric">Electric</option>
                                                    </Form.Control>
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        <i className="fas fa-cogs mr-1"></i>
                                                        Transmission
                                                    </Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        value={formData.transmission}
                                                        onChange={(e) => this.handleInputChange('transmission', e.target.value)}
                                                        className="modern-input"
                                                    >
                                                        <option value="Manual">Manual</option>
                                                        <option value="Automatic">Automatic</option>
                                                    </Form.Control>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <div className="text-center mt-4">
                                            <Button 
                                                type="submit" 
                                                variant="primary" 
                                                size="lg"
                                                disabled={loading}
                                                className="modern-submit-btn"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" className="mr-2" />
                                                        Adding Car Details...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-plus mr-2"></i>
                                                        Add New Car Details
                                                    </>
                                                )}
                                            </Button>
                                            
                                            <Button 
                                                type="button" 
                                                variant="outline-secondary" 
                                                size="lg"
                                                onClick={this.resetForm}
                                                className="ml-3 modern-reset-btn"
                                            >
                                                <i className="fas fa-undo mr-2"></i>
                                                Reset Form
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}
