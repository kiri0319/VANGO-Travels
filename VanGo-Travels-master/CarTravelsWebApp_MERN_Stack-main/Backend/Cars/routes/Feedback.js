const express = require('express');
const router = express.Router();
const {
    submitFeedback,
    getAllFeedback,
    getMyFeedback,
    getFeedback,
    updateUserFeedback,
    updateFeedback,
    deleteFeedback,
    checkFeedbackEligibility,
    getDriverFeedback,
    getFeedbackStats
} = require('../controllers/Feedback');
const { protect, authorize_role } = require('../middleware/authenticate');

// Public routes (none for feedback - all require authentication)

// Protected routes
router.use(protect);

// User routes
router.post('/', submitFeedback);
router.get('/my-feedback', getMyFeedback);
router.get('/check-eligibility/:bookingId', checkFeedbackEligibility);
router.get('/:id', getFeedback);
router.put('/:id/user-edit', updateUserFeedback);
router.delete('/:id', deleteFeedback);

// Driver routes
router.get('/driver/my-feedback', authorize_role('driver'), getDriverFeedback);

// Admin routes
router.get('/', authorize_role('admin'), getAllFeedback);
router.put('/:id', authorize_role('admin'), updateFeedback);
router.get('/stats/feedback-stats', authorize_role('admin'), getFeedbackStats);

module.exports = router;
