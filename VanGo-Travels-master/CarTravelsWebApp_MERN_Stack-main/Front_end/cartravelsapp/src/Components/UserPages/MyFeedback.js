import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyFeedback.css';

const MyFeedback = () => {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyFeedback();
    }, []);

    const fetchMyFeedback = async () => {
        try {
            const token = localStorage.getItem('token');
            if(!token){
                setError('Please log in to view your feedback');
                return;
            }
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const response = await axios.get('/api/v1/feedback/my-feedback', config);

            setFeedback(response.data.data);
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


    const handleDeleteClick = async (feedbackId) => {
        if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            await axios.delete(`/api/v1/feedback/${feedbackId}`, config);

            // Update local state
            setFeedback(prev => prev.filter(item => item._id !== feedbackId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete feedback');
        }
    };


    if (loading) {
        return (
            <div className="feedback-list-container">
                <div className="loading">Loading your feedback...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="feedback-list-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="feedback-list-container">
            <div className="feedback-header">
                <h2>My Feedback & Reviews</h2>
                <p>View all your submitted feedback and admin responses</p>
            </div>

            {feedback.length === 0 ? (
                <div className="no-feedback">
                    <div className="no-feedback-icon">📝</div>
                    <h3>No Feedback Yet</h3>
                    <p>You haven't submitted any feedback yet. After completing a trip, you can share your experience with us!</p>
                </div>
            ) : (
                <div className="feedback-list">
                    {feedback.map((item) => (
                        <div key={item._id} className="feedback-item">
                            <div className="feedback-header-info">
                                <div className="booking-type">
                                    <span className={`type-badge ${item.bookingType}`}>
                                        {item.bookingType === 'local' ? 'Local Trip' : 'Tour Package'}
                                    </span>
                                </div>
                                <div className="feedback-date">
                                    {formatDate(item.createdAt)}
                                </div>
                            </div>

                            <div className="ratings-section">
                                <div className="rating-item">
                                    <label>Overall:</label>
                                    {renderStars(item.rating)}
                                </div>
                                <div className="rating-item">
                                    <label>Driver:</label>
                                    {renderStars(item.driverRating)}
                                </div>
                                <div className="rating-item">
                                    <label>Vehicle:</label>
                                    {renderStars(item.vehicleRating)}
                                </div>
                                <div className="rating-item">
                                    <label>Service:</label>
                                    {renderStars(item.serviceRating)}
                                </div>
                            </div>

                            <div className="review-section">
                                <h4>Your Review:</h4>
                                <p className="review-text">{item.review}</p>
                            </div>

                            {item.adminResponse && (
                                <div className="admin-response">
                                    <h4>Admin Response:</h4>
                                    <div className="response-content">
                                        <p>{item.adminResponse}</p>
                                        <small className="response-date">
                                            Responded on: {formatDate(item.updatedAt)}
                                        </small>
                                    </div>
                                </div>
                            )}

                            <div className="feedback-actions">
                                <div className="feedback-status">
                                    <span className={`status-badge ${item.isRead ? 'read' : 'unread'}`}>
                                        {item.isRead ? 'Read by Admin' : 'Unread'}
                                    </span>
                                </div>
                                <div className="action-buttons">
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteClick(item._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyFeedback;
