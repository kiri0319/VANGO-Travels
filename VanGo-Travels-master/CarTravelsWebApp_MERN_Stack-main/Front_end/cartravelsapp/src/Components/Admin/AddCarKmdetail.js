import React, { Component } from 'react'
import {Container, Row, Col, Card, Form, Button, Alert, Spinner} from 'react-bootstrap'
import authHeader from '../services/auth-header';

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
        this.fileInputRef = React.createRef();
    }

    handleInputChange = (field, value) => {
        // Filter input for Vehicle ID to only allow alphanumeric characters
        if (field === 'vechicleid') {
            value = value.replace(/[^A-Za-z0-9]/g, '');
        }
        
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [field]: value
            }
        }), () => {
            // Clear error message when user starts typing
            if (this.state.message && this.state.messageType === 'danger') {
                this.setState({ message: '' });
            }
        });
    }

    validateForm = () => {
        const { formData } = this.state;
        const errors = [];

        // Vehicle ID validation
        if (!formData.vechicleid || !formData.vechicleid.trim()) {
            errors.push('Vehicle ID is required');
        } else if (formData.vechicleid.trim().length < 3) {
            errors.push('Vehicle ID must be at least 3 characters long');
        } else if (!/^[A-Za-z0-9]+$/.test(formData.vechicleid.trim())) {
            errors.push('Vehicle ID can only contain letters and numbers (no spaces or special characters)');
        } else if (!/[A-Za-z]/.test(formData.vechicleid.trim())) {
            errors.push('Vehicle ID must contain at least one letter');
        } else if (!/[0-9]/.test(formData.vechicleid.trim())) {
            errors.push('Vehicle ID must contain at least one number');
        }

        // Vehicle name validation
        if (!formData.vechicle || !formData.vechicle.trim()) {
            errors.push('Vehicle name is required');
        } else if (formData.vechicle.trim().length < 2) {
            errors.push('Vehicle name must be at least 2 characters long');
        }

        // Minimum KM validation
        if (!formData.minkm || formData.minkm === '') {
            errors.push('Minimum kilometers is required');
        } else if (isNaN(formData.minkm) || Number(formData.minkm) <= 0) {
            errors.push('Minimum kilometers must be a positive number');
        } else if (Number(formData.minkm) > 1000) {
            errors.push('Minimum kilometers cannot exceed 1000');
        }

        // Rate per KM validation
        if (!formData.rateperkm || formData.rateperkm === '') {
            errors.push('Rate per kilometer is required');
        } else if (isNaN(formData.rateperkm) || Number(formData.rateperkm) <= 0) {
            errors.push('Rate per kilometer must be a positive number');
        } else if (Number(formData.rateperkm) > 100) {
            errors.push('Rate per kilometer cannot exceed ₹100');
        }

        // Amount validation
        if (!formData.amount || formData.amount === '') {
            errors.push('Amount is required');
        } else if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
            errors.push('Amount must be a positive number');
        } else if (Number(formData.amount) > 50000) {
            errors.push('Amount cannot exceed ₹50,000');
        }

        // Seating capacity validation
        if (!formData.seatingCapacity || formData.seatingCapacity === '') {
            errors.push('Seating capacity is required');
        } else if (isNaN(formData.seatingCapacity) || Number(formData.seatingCapacity) <= 0) {
            errors.push('Seating capacity must be a positive number');
        } else if (Number(formData.seatingCapacity) > 50) {
            errors.push('Seating capacity cannot exceed 50');
        }

        // Driver allowance validation (optional field)
        if (formData.driverallowance && formData.driverallowance !== '') {
            if (isNaN(formData.driverallowance) || Number(formData.driverallowance) < 0) {
                errors.push('Driver allowance must be a non-negative number');
            } else if (Number(formData.driverallowance) > 10000) {
                errors.push('Driver allowance cannot exceed ₹10,000');
            }
        }

        return errors;
    }

    async AddCarKmDetail(event){
        event.preventDefault();
        
        const validationErrors = this.validateForm();
        if (validationErrors.length > 0) {
            this.setState({
                message: `❌ Please fix the following errors:\n• ${validationErrors.join('\n• ')}`,
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
            const form = new FormData();
            form.append('vechicleid', this.state.formData.vechicleid.toUpperCase());
            form.append('vechicle', this.state.formData.vechicle.toUpperCase());
            form.append('minkm', String(Number(this.state.formData.minkm)));
            form.append('rateperkm', String(Number(this.state.formData.rateperkm)));
            form.append('driverallowance', String(Number(this.state.formData.driverallowance) || 0));
            form.append('amount', String(Number(this.state.formData.amount)));
            form.append('carType', this.state.formData.carType);
            form.append('seatingCapacity', String(Number(this.state.formData.seatingCapacity)));
            form.append('fuelType', this.state.formData.fuelType);
            form.append('transmission', this.state.formData.transmission);
            const file = this.fileInputRef.current && this.fileInputRef.current.files && this.fileInputRef.current.files[0];
            if (file) {
                form.append('image', file);
            }

            const response = await fetch('http://localhost:8010/api/v1/CarkilometerDetails', {
                method: 'POST',
                headers: {
                    ...authHeader()
                    // NOTE: do not set Content-Type, browser will set multipart boundary
                },
                body: form,
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
        if (this.fileInputRef.current) {
            this.fileInputRef.current.value = '';
        }
    }

    closemessage(){
        this.setState({message : ""})
    }

    // Get field validation state
    getFieldValidationState = (field) => {
        const { formData } = this.state;
        const value = formData[field];
        
        switch(field) {
            case 'vechicleid':
                if (!value || !value.trim()) return null;
                const trimmedValue = value.trim();
                const hasLetters = /[A-Za-z]/.test(trimmedValue);
                const hasNumbers = /[0-9]/.test(trimmedValue);
                const isAlphanumeric = /^[A-Za-z0-9]+$/.test(trimmedValue);
                return (trimmedValue.length >= 3 && isAlphanumeric && hasLetters && hasNumbers) ? 'valid' : 'invalid';
            case 'vechicle':
                if (!value || !value.trim()) return null;
                return value.trim().length >= 2 ? 'valid' : 'invalid';
            case 'minkm':
                if (!value || value === '') return null;
                return !isNaN(value) && Number(value) > 0 && Number(value) <= 1000 ? 'valid' : 'invalid';
            case 'rateperkm':
                if (!value || value === '') return null;
                return !isNaN(value) && Number(value) > 0 && Number(value) <= 100 ? 'valid' : 'invalid';
            case 'amount':
                if (!value || value === '') return null;
                return !isNaN(value) && Number(value) > 0 && Number(value) <= 50000 ? 'valid' : 'invalid';
            case 'seatingCapacity':
                if (!value || value === '') return null;
                return !isNaN(value) && Number(value) > 0 && Number(value) <= 50 ? 'valid' : 'invalid';
            case 'driverallowance':
                if (!value || value === '') return null;
                return !isNaN(value) && Number(value) >= 0 && Number(value) <= 10000 ? 'valid' : 'invalid';
            default:
                return null;
        }
    }

    render() {
        const { message, messageType, loading, formData } = this.state;

        return (
        <div className="MainDiv">
                <Container className="mt-4">
                    <Row className="justify-content-center">
                        <Col lg={10} xl={8}>
                            <Card className="shadow-lg">
                                <Card.Header className="bg-primary text-white">
                                    <h2 className="mb-0">
                                        🚗 Add New Car Details
                                    </h2>
                                    <p className="mb-0">Add comprehensive car information for your fleet</p>
                                </Card.Header>
                                
                                <Card.Body className="p-4">
                                    {message && (
                                        <Alert 
                                            variant={messageType} 
                                            dismissible 
                                            onClose={this.closemessage.bind(this)}
                                        >
                                            <div style={{ whiteSpace: 'pre-line' }}>
                                                {message}
                                            </div>
                                        </Alert>
                                    )}

                                    <Form onSubmit={this.AddCarKmDetail.bind(this)}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        Vehicle ID *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="e.g., CAR001, SUV202, INNOVA123"
                                                        value={formData.vechicleid}
                                                        onChange={(e) => this.handleInputChange('vechicleid', e.target.value)}
                                                        isInvalid={this.getFieldValidationState('vechicleid') === 'invalid'}
                                                        isValid={this.getFieldValidationState('vechicleid') === 'valid'}
                                                        required
                                                    />
                                                    <Form.Text className="text-muted">
                                                        Unique identifier (must contain both letters and numbers, min 3 characters)
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        Vehicle Name *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="e.g., Toyota Innova, Maruti Swift"
                                                        value={formData.vechicle}
                                                        onChange={(e) => this.handleInputChange('vechicle', e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        Car Photo (optional)
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="file"
                                                        accept="image/*"
                                                        ref={this.fileInputRef}
                                                    />
                                                    <Form.Text className="text-muted">
                                                        Upload a clear photo of the car from your device.
                                                    </Form.Text>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        Minimum KM *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="e.g., 100"
                                                        value={formData.minkm}
                                                        onChange={(e) => this.handleInputChange('minkm', e.target.value)}
                                                        isInvalid={this.getFieldValidationState('minkm') === 'invalid'}
                                                        isValid={this.getFieldValidationState('minkm') === 'valid'}
                                                        min="1"
                                                        max="1000"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        Rate per KM *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="e.g., 15"
                                                        value={formData.rateperkm}
                                                        onChange={(e) => this.handleInputChange('rateperkm', e.target.value)}
                                                        min="1"
                                                        step="0.01"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        Driver Allowance
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="e.g., 500"
                                                        value={formData.driverallowance}
                                                        onChange={(e) => this.handleInputChange('driverallowance', e.target.value)}
                                                        min="0"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        Base Amount *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="e.g., 2000"
                                                        value={formData.amount}
                                                        onChange={(e) => this.handleInputChange('amount', e.target.value)}
                                                        min="1"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        Seating Capacity *
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="e.g., 4, 6, 8"
                                                        value={formData.seatingCapacity}
                                                        onChange={(e) => this.handleInputChange('seatingCapacity', e.target.value)}
                                                        min="1"
                                                        max="15"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            
                                            <Col md={4}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        Car Type *
                                                    </Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        value={formData.carType}
                                                        onChange={(e) => this.handleInputChange('carType', e.target.value)}
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
                                                        Fuel Type
                                                    </Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        value={formData.fuelType}
                                                        onChange={(e) => this.handleInputChange('fuelType', e.target.value)}
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
                                                        Transmission
                                                    </Form.Label>
                                                    <Form.Control
                                                        as="select"
                                                        value={formData.transmission}
                                                        onChange={(e) => this.handleInputChange('transmission', e.target.value)}
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
                                                className="mr-3"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" className="mr-2" />
                                                        Adding Car Details...
                                                    </>
                                                ) : (
                                                    <>
                                                        ➕ Add New Car Details
                                                    </>
                                                )}
                                            </Button>
                                            
                                            <Button 
                                                type="button" 
                                                variant="outline-secondary" 
                                                size="lg"
                                                onClick={this.resetForm}
                                            >
                                                🔄 Reset Form
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
