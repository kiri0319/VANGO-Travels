import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedbackManagement.css';

const FeedbackManagement = () => {
    const [feedback, setFeedback] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        fetchFeedback();
        fetchStats();
    }, [currentPage, filter]);

    const fetchFeedback = async () => {
        try {
            const token = localStorage.getItem('token');
            if(!token){
                setError('Please log in as admin to view feedback');
                setLoading(false);
                return;
            }
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const response = await axios.get(`/api/v1/feedback?page=${currentPage}&limit=10`, config);

            setFeedback(response.data.data);
            setTotalPages(response.data.pagination.pages);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch feedback');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if(!token){
                return;
            }
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const response = await axios.get('/api/v1/feedback/stats/feedback-stats', config);

            setStats(response.data.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const handleResponseSubmit = async () => {
        if (!selectedFeedback || !responseText.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            await axios.put(`/api/v1/feedback/${selectedFeedback._id}`, {
                adminResponse: responseText,
                isRead: true
            }, config);

            // Update local state
            setFeedback(prev => prev.map(item => 
                item._id === selectedFeedback._id 
                    ? { ...item, adminResponse: responseText, isRead: true }
                    : item
            ));

            setSelectedFeedback(null);
            setResponseText('');
            fetchStats(); // Refresh stats
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit response');
        }
    };

    const markAsRead = async (feedbackId) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            await axios.put(`/api/v1/feedback/${feedbackId}`, { isRead: true }, config);

            // Update local state
            setFeedback(prev => prev.map(item => 
                item._id === feedbackId 
                    ? { ...item, isRead: true }
                    : item
            ));

            fetchStats(); // Refresh stats
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark as read');
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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredFeedback = feedback.filter(item => {
        if (filter === 'unread') return !item.isRead;
        if (filter === 'read') return item.isRead;
        return true;
    });

    if (loading) {
        return (
            <div className="feedback-management-container">
                <div className="loading">Loading feedback data...</div>
            </div>
        );
    }

    return (
        <div className="feedback-management-container">
            <div className="feedback-header">
                <h2>Feedback Management</h2>
                <p>Manage user feedback and respond to reviews</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Statistics Section */}
            {stats && (
                <div className="stats-section">
                    <div className="stat-card">
                        <h3>Total Feedback</h3>
                        <div className="stat-number">{stats.totalFeedback}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Unread</h3>
                        <div className="stat-number unread">{stats.unreadFeedback}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Avg Rating</h3>
                        <div className="stat-number">
                            {stats.averageRatings.avgRating ? 
                                stats.averageRatings.avgRating.toFixed(1) : '0.0'}
                        </div>
                    </div>
                    <div className="stat-card">
                        <h3>Driver Rating</h3>
                        <div className="stat-number">
                            {stats.averageRatings.avgDriverRating ? 
                                stats.averageRatings.avgDriverRating.toFixed(1) : '0.0'}
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Section */}
            <div className="filter-section">
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({feedback.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread ({feedback.filter(f => !f.isRead).length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
                        onClick={() => setFilter('read')}
                    >
                        Read ({feedback.filter(f => f.isRead).length})
                    </button>
                </div>
            </div>

            {/* Feedback List */}
            <div className="feedback-list">
                {filteredFeedback.length === 0 ? (
                    <div className="no-feedback">
                        <h3>No feedback found</h3>
                        <p>There are no feedback items matching your current filter.</p>
                    </div>
                ) : (
                    filteredFeedback.map((item) => (
                        <div key={item._id} className={`feedback-item ${!item.isRead ? 'unread' : ''}`}>
                            <div className="feedback-header-info">
                                <div className="user-info">
                                    <h4>{item.username}</h4>
                                    <p>{item.email}</p>
                                </div>
                                <div className="booking-info">
                                    <span className={`type-badge ${item.bookingType}`}>
                                        {item.bookingType === 'local' ? 'Local Trip' : 'Tour Package'}
                                    </span>
                                    <p className="date">{formatDate(item.createdAt)}</p>
                                </div>
                                <div className="status-section">
                                    <span className={`status-badge ${item.isRead ? 'read' : 'unread'}`}>
                                        {item.isRead ? 'Read' : 'Unread'}
                                    </span>
                                    {!item.isRead && (
                                        <button
                                            className="mark-read-btn"
                                            onClick={() => markAsRead(item._id)}
                                        >
                                            Mark Read
                                        </button>
                                    )}
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
                                <h4>User Review:</h4>
                                <p className="review-text">{item.review}</p>
                            </div>

                            {item.adminResponse && (
                                <div className="admin-response">
                                    <h4>Your Response:</h4>
                                    <p>{item.adminResponse}</p>
                                    <small>Responded on: {formatDate(item.updatedAt)}</small>
                                </div>
                            )}

                            {!item.adminResponse && (
                                <div className="response-section">
                                    <button
                                        className="respond-btn"
                                        onClick={() => setSelectedFeedback(item)}
                                    >
                                        Respond to Feedback
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </button>
                    <span className="page-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="page-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Response Modal */}
            {selectedFeedback && (
                <div className="modal-overlay">
                    <div className="response-modal">
                        <h3>Respond to Feedback</h3>
                        <p className="user-info">
                            From: {selectedFeedback.username} ({selectedFeedback.email})
                        </p>
                        <div className="modal-content">
                            <label>Your Response:</label>
                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Enter your response to the user..."
                                rows="4"
                                maxLength="300"
                            />
                            <small className="char-count">
                                {responseText.length}/300 characters
                            </small>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setSelectedFeedback(null);
                                    setResponseText('');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleResponseSubmit}
                                disabled={!responseText.trim()}
                            >
                                Send Response
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackManagement;
