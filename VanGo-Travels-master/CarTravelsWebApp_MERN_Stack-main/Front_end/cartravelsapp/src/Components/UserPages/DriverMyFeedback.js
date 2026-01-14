import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Alert, Spinner } from 'react-bootstrap';
import './MyFeedback.css';

const DriverMyFeedback = () => {
    const [feedback, setFeedback] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDriverFeedback();
    }, []);

    const fetchDriverFeedback = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view your feedback');
                return;
            }
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const response = await axios.get('/api/v1/feedback/driver/my-feedback', config);
            
            setFeedback(response.data.data);
            setStatistics(response.data.statistics);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch feedback');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="star-display">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`star ${star <= rating ? 'filled' : ''}`}
                    >
                        ★
                    </span>
                ))}
                <span className="rating-number">({rating}/5)</span>
            </div>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={6} className="text-center">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">Loading your feedback...</p>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    <h2>💬 My Feedback & Ratings</h2>
                    <p className="text-muted">Reviews and ratings from customers about your service</p>
                </Col>
            </Row>

            {/* Statistics Card */}
            {statistics && (
                <Row className="mb-4">
                    <Col md={12}>
                        <Card className="mb-3">
                            <Card.Header>
                                <h5>📊 Your Performance Summary</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={3} className="text-center">
                                        <div className="stat-item">
                                            <h4 className="text-primary">{statistics.avgDriverRating?.toFixed(1) || '0.0'}</h4>
                                            <p className="text-muted">Driver Rating</p>
                                        </div>
                                    </Col>
                                    <Col md={3} className="text-center">
                                        <div className="stat-item">
                                            <h4 className="text-success">{statistics.avgVehicleRating?.toFixed(1) || '0.0'}</h4>
                                            <p className="text-muted">Vehicle Rating</p>
                                        </div>
                                    </Col>
                                    <Col md={3} className="text-center">
                                        <div className="stat-item">
                                            <h4 className="text-info">{statistics.avgServiceRating?.toFixed(1) || '0.0'}</h4>
                                            <p className="text-muted">Service Rating</p>
                                        </div>
                                    </Col>
                                    <Col md={3} className="text-center">
                                        <div className="stat-item">
                                            <h4 className="text-warning">{statistics.totalFeedback || 0}</h4>
                                            <p className="text-muted">Total Reviews</p>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Feedback List */}
            <Row>
                <Col>
                    {feedback.length === 0 ? (
                        <Card>
                            <Card.Body className="text-center">
                                <h5>No feedback yet</h5>
                                <p className="text-muted">
                                    You haven't received any feedback from customers yet. 
                                    Complete some trips to start receiving reviews!
                                </p>
                            </Card.Body>
                        </Card>
                    ) : (
                        <div className="feedback-list">
                            {feedback.map((item) => (
                                <Card key={item._id} className="mb-3 feedback-item">
                                    <Card.Body>
                                        <div className="feedback-header-info">
                                            <div className="booking-type">
                                                <Badge variant={item.bookingType === 'local' ? 'primary' : 'success'}>
                                                    {item.bookingType === 'local' ? 'Local Trip' : 'Tour Package'}
                                                </Badge>
                                            </div>
                                            <div className="feedback-date">
                                                {formatDate(item.createdAt)}
                                            </div>
                                        </div>

                                        <div className="ratings-section">
                                            <Row>
                                                <Col md={6}>
                                                    <div className="rating-item">
                                                        <label>Overall Rating:</label>
                                                        {renderStars(item.rating)}
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="rating-item">
                                                        <label>Driver Rating:</label>
                                                        {renderStars(item.driverRating)}
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <div className="rating-item">
                                                        <label>Vehicle Rating:</label>
                                                        {renderStars(item.vehicleRating)}
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="rating-item">
                                                        <label>Service Rating:</label>
                                                        {renderStars(item.serviceRating)}
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>

                                        <div className="review-section">
                                            <h6>Customer Review:</h6>
                                            <p className="review-text">{item.review}</p>
                                        </div>

                                        <div className="customer-info">
                                            <small className="text-muted">
                                                From: {item.user?.username || 'Anonymous'} 
                                                {item.user?.emailid && ` (${item.user.emailid})`}
                                            </small>
                                        </div>

                                        {item.adminResponse && (
                                            <div className="admin-response mt-3">
                                                <h6>Admin Response:</h6>
                                                <p className="admin-response-text">{item.adminResponse}</p>
                                                <small className="text-muted">
                                                    Responded on: {formatDate(item.updatedAt)}
                                                </small>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default DriverMyFeedback;
