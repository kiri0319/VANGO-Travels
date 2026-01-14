import React, { Component } from 'react'
import { Container, Row, Col, Card, Button, Alert, Form, Table, Badge } from 'react-bootstrap'
import AuthService from '../services/auth'
import authHeader from '../services/auth-header'

export default class DriverFeedback extends Component {
    constructor(props) {
        super(props);
        this.state = {
            feedbacks: [],
            loading: true,
            error: '',
            showForm: false,
            formData: {
                rating: 5,
                comment: '',
                type: 'general'
            }
        };
    }

    componentDidMount() {
        this.loadDriverFeedbacks();
    }

    loadDriverFeedbacks = async () => {
        try {
            this.setState({ loading: true, error: '' });
            
            const driverId = AuthService.finduserid();
            if (!driverId) {
                throw new Error('Driver ID not found');
            }

            const response = await fetch(`http://localhost:8010/api/v1/feedback?driver=${driverId}`, {
                headers: authHeader()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.setState({ feedbacks: data.data || [] });
            } else {
                throw new Error(data.message || 'Failed to load feedbacks');
            }

        } catch (error) {
            console.error('Failed to load feedbacks:', error);
            this.setState({ error: error.message });
        } finally {
            this.setState({ loading: false });
        }
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [name]: value
            }
        }));
    }

    handleSubmitFeedback = async (e) => {
        e.preventDefault();
        
        try {
            const driverId = AuthService.finduserid();
            const feedbackData = {
                ...this.state.formData,
                driver: driverId,
                user: driverId, // Driver providing feedback about their experience
                tripId: null // General feedback
            };

            const response = await fetch('http://localhost:8010/api/v1/feedback', {
                method: 'POST',
                headers: {
                    ...authHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(feedbackData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.setState({ 
                    showForm: false,
                    formData: { rating: 5, comment: '', type: 'general' }
                });
                this.loadDriverFeedbacks(); // Reload feedbacks
                alert('Feedback submitted successfully!');
            } else {
                throw new Error(data.message || 'Failed to submit feedback');
            }

        } catch (error) {
            console.error('Failed to submit feedback:', error);
            alert('Failed to submit feedback: ' + error.message);
        }
    }

    render() {
        const { feedbacks, loading, error, showForm, formData } = this.state;

        if (loading) {
            return (
                <div className="MainDiv">
                    <Container className="mt-3 p-3">
                        <div className="text-center">
                            <h4>Loading feedback...</h4>
                        </div>
                    </Container>
                </div>
            );
        }

        return (
            <div className="MainDiv">
                <Container className="mt-3 p-3">
                    <Row>
                        <Col md={12}>
                            <h2>💬 Driver Feedback</h2>
                            <p className="text-muted">Share your experience and suggestions</p>
                        </Col>
                    </Row>

                    {error && (
                        <Alert variant="danger" dismissible onClose={() => this.setState({ error: '' })}>
                            <strong>Error:</strong> {error}
                        </Alert>
                    )}

                    {/* Feedback Form */}
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card>
                                <Card.Header>
                                    <h5>📝 Submit Feedback</h5>
                                </Card.Header>
                                <Card.Body>
                                    {!showForm ? (
                                        <Button 
                                            variant="primary" 
                                            onClick={() => this.setState({ showForm: true })}
                                        >
                                            Add New Feedback
                                        </Button>
                                    ) : (
                                        <Form onSubmit={this.handleSubmitFeedback}>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>Rating</Form.Label>
                                                        <Form.Control
                                                            as="select"
                                                            name="rating"
                                                            value={formData.rating}
                                                            onChange={this.handleInputChange}
                                                            required
                                                        >
                                                            <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                                                            <option value={4}>⭐⭐⭐⭐ Good</option>
                                                            <option value={3}>⭐⭐⭐ Average</option>
                                                            <option value={2}>⭐⭐ Poor</option>
                                                            <option value={1}>⭐ Very Poor</option>
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label>Type</Form.Label>
                                                        <Form.Control
                                                            as="select"
                                                            name="type"
                                                            value={formData.type}
                                                            onChange={this.handleInputChange}
                                                            required
                                                        >
                                                            <option value="general">General Feedback</option>
                                                            <option value="suggestion">Suggestion</option>
                                                            <option value="complaint">Complaint</option>
                                                            <option value="compliment">Compliment</option>
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group>
                                                <Form.Label>Comment</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    name="comment"
                                                    value={formData.comment}
                                                    onChange={this.handleInputChange}
                                                    placeholder="Share your thoughts, suggestions, or concerns..."
                                                    required
                                                />
                                            </Form.Group>
                                            <div className="d-flex justify-content-end">
                                                <Button 
                                                    variant="secondary" 
                                                    className="mr-2"
                                                    onClick={() => this.setState({ showForm: false })}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button variant="primary" type="submit">
                                                    Submit Feedback
                                                </Button>
                                            </div>
                                        </Form>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Feedback List */}
                    <Row>
                        <Col md={12}>
                            <Card>
                                <Card.Header>
                                    <h5>📋 Your Feedback History ({feedbacks.length})</h5>
                                </Card.Header>
                                <Card.Body>
                                    {feedbacks.length === 0 ? (
                                        <p className="text-muted">No feedback submitted yet.</p>
                                    ) : (
                                        <div className="table-responsive">
                                            <Table striped hover>
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Type</th>
                                                        <th>Rating</th>
                                                        <th>Comment</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {feedbacks.map(feedback => (
                                                        <tr key={feedback._id}>
                                                            <td>{new Date(feedback.createdAt).toLocaleDateString()}</td>
                                                            <td>
                                                                <Badge variant={
                                                                    feedback.type === 'complaint' ? 'danger' :
                                                                    feedback.type === 'compliment' ? 'success' :
                                                                    feedback.type === 'suggestion' ? 'info' : 'secondary'
                                                                }>
                                                                    {feedback.type}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                {'⭐'.repeat(feedback.rating)}
                                                            </td>
                                                            <td>{feedback.comment}</td>
                                                            <td>
                                                                <Badge variant={
                                                                    feedback.status === 'resolved' ? 'success' :
                                                                    feedback.status === 'pending' ? 'warning' : 'secondary'
                                                                }>
                                                                    {feedback.status || 'pending'}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}