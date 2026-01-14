import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import './FeedbackForm.css';

const FeedbackForm = () => {
    const history = useHistory();
    const location = useLocation();
    
    // Get booking details from location state
    const bookingData = location.state?.bookingData;
    
    const [formData, setFormData] = useState({
        rating: 5,
        driverRating: 5,
        vehicleRating: 5,
        serviceRating: 5,
        review: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRatingChange = (ratingType, value) => {
        setFormData(prev => ({
            ...prev,
            [ratingType]: parseInt(value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!bookingData) {
            setError('No booking data found. Please go back and try again.');
            return;
        }

        if (formData.review.length < 10) {
            setError('Review must be at least 10 characters long.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            const feedbackData = {
                bookingType: bookingData.bookingType,
                bookingId: bookingData.bookingId,
                rating: formData.rating,
                review: formData.review,
                driverRating: formData.driverRating,
                vehicleRating: formData.vehicleRating,
                serviceRating: formData.serviceRating
            };

            await axios.post(
                'http://localhost:8010/api/v1/feedback',
                feedbackData,
                config
            );

            setSuccess('Feedback submitted successfully! Thank you for your review.');
            
            // Redirect after 2 seconds
            setTimeout(() => {
                history.push('/my-feedback');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (ratingType, currentRating) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`star ${star <= currentRating ? 'filled' : ''}`}
                        onClick={() => handleRatingChange(ratingType, star)}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    if (!bookingData) {
        return (
            <div className="feedback-container">
                <div className="feedback-card">
                    <h2>No Booking Data Found</h2>
                    <p>Please go back to your booking list and try again.</p>
                    <button 
                        className="btn-primary"
                        onClick={() => history.push('/userlocalbookinglist')}
                    >
                        Go to Booking List
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="feedback-container">
            <div className="feedback-card">
                <h2>Share Your Experience</h2>
                <p className="booking-info">
                    Booking: {bookingData.bookingType === 'local' ? 'Local Trip' : 'Tour Package'}
                </p>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="feedback-form">
                    <div className="form-group">
                        <label>Overall Experience Rating:</label>
                        {renderStars('rating', formData.rating)}
                        <span className="rating-text">{formData.rating}/5</span>
                    </div>

                    <div className="form-group">
                        <label>Driver Rating:</label>
                        {renderStars('driverRating', formData.driverRating)}
                        <span className="rating-text">{formData.driverRating}/5</span>
                    </div>

                    <div className="form-group">
                        <label>Vehicle Rating:</label>
                        {renderStars('vehicleRating', formData.vehicleRating)}
                        <span className="rating-text">{formData.vehicleRating}/5</span>
                    </div>

                    <div className="form-group">
                        <label>Service Rating:</label>
                        {renderStars('serviceRating', formData.serviceRating)}
                        <span className="rating-text">{formData.serviceRating}/5</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="review">Your Review:</label>
                        <textarea
                            id="review"
                            name="review"
                            value={formData.review}
                            onChange={handleInputChange}
                            placeholder="Please share your experience with us (minimum 10 characters)..."
                            rows="5"
                            required
                        />
                        <small className="char-count">
                            {formData.review.length}/500 characters
                        </small>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => history.push('/userlocalbookinglist')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || formData.review.length < 10}
                        >
                            {loading ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;
