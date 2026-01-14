const asyncHandler = require('../middleware/asyncHandler');
const Feedback = require('../model/Feedback');
const CarLocalBookedUsersData = require('../model/Localbooking');
const CarTourBookedUsersData = require('../model/TourBooking');

// @desc    Submit user feedback
// @route   POST /api/feedback
// @access  Private
const submitFeedback = asyncHandler(async (req, res) => {
    const {
        bookingType,
        bookingId,
        rating,
        review,
        driverRating,
        vehicleRating,
        serviceRating
    } = req.body;

    // Check if user has already submitted feedback for this booking
    const existingFeedback = await Feedback.findOne({
        user: req.user.id,
        bookingId: bookingId,
        bookingType: bookingType
    });

    if (existingFeedback) {
        res.status(400);
        throw new Error('You have already submitted feedback for this booking');
    }

    // Verify booking exists and belongs to user
    let booking;
    if (bookingType === 'local') {
        booking = await CarLocalBookedUsersData.findOne({
            _id: bookingId,
            user: req.user.id
        });
    } else if (bookingType === 'tour') {
        booking = await CarTourBookedUsersData.findOne({
            _id: bookingId,
            user: req.user.id
        });
    }

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found or does not belong to you');
    }

    // Check if driver is assigned to the booking
    if (!booking.driver) {
        res.status(400);
        throw new Error('Cannot submit feedback: No driver has been assigned to this booking yet');
    }

    const feedback = await Feedback.create({
        user: req.user.id,
        username: req.user.username,
        email: req.user.emailid,
        bookingType,
        bookingId,
        bookingModel: bookingType === 'local' ? 'CarLocalBookedUsersData' : 'CarTourBookedUsersData',
        rating,
        review,
        driverRating,
        vehicleRating,
        serviceRating
    });

    res.status(201).json({
        success: true,
        data: feedback,
        message: 'Feedback submitted successfully'
    });
});

// @desc    Get all feedback (Admin only)
// @route   GET /api/feedback
// @access  Private/Admin
const getAllFeedback = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const feedback = await Feedback.find()
        .populate('user', 'username emailid')
        .populate('bookingId')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(startIndex);

    const total = await Feedback.countDocuments();

    res.status(200).json({
        success: true,
        count: feedback.length,
        total,
        pagination: {
            current: page,
            pages: Math.ceil(total / limit)
        },
        data: feedback
    });
});

// @desc    Get user's feedback
// @route   GET /api/feedback/my-feedback
// @access  Private
const getMyFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.find({ user: req.user.id })
        .populate('bookingId')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: feedback.length,
        data: feedback
    });
});

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Private
const getFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findById(req.params.id)
        .populate('user', 'username emailid')
        .populate('bookingId');

    if (!feedback) {
        res.status(404);
        throw new Error('Feedback not found');
    }

    // Check if user is authorized to view this feedback
    if (req.user.role !== 'admin' && feedback.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to view this feedback');
    }

    res.status(200).json({
        success: true,
        data: feedback
    });
});

// @desc    Update feedback (User edit)
// @route   PUT /api/feedback/:id/user-edit
// @access  Private
const updateUserFeedback = asyncHandler(async (req, res) => {
    const { rating, review, driverRating, vehicleRating, serviceRating } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
        res.status(404);
        throw new Error('Feedback not found');
    }

    // Check if user is authorized to edit this feedback
    if (feedback.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to edit this feedback');
    }

    // Validate ratings
    if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
            res.status(400);
            throw new Error('Overall rating must be between 1 and 5');
        }
        feedback.rating = rating;
    }

    if (driverRating !== undefined) {
        if (driverRating < 1 || driverRating > 5) {
            res.status(400);
            throw new Error('Driver rating must be between 1 and 5');
        }
        feedback.driverRating = driverRating;
    }

    if (vehicleRating !== undefined) {
        if (vehicleRating < 1 || vehicleRating > 5) {
            res.status(400);
            throw new Error('Vehicle rating must be between 1 and 5');
        }
        feedback.vehicleRating = vehicleRating;
    }

    if (serviceRating !== undefined) {
        if (serviceRating < 1 || serviceRating > 5) {
            res.status(400);
            throw new Error('Service rating must be between 1 and 5');
        }
        feedback.serviceRating = serviceRating;
    }

    if (review !== undefined) {
        if (review.trim().length < 10) {
            res.status(400);
            throw new Error('Review must be at least 10 characters long');
        }
        feedback.review = review.trim();
    }

    // Mark as unread when user edits (admin should review changes)
    feedback.isRead = false;

    const updatedFeedback = await feedback.save();

    res.status(200).json({
        success: true,
        data: updatedFeedback,
        message: 'Feedback updated successfully'
    });
});

// @desc    Update feedback (Admin response)
// @route   PUT /api/feedback/:id
// @access  Private/Admin
const updateFeedback = asyncHandler(async (req, res) => {
    const { adminResponse, isRead } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
        res.status(404);
        throw new Error('Feedback not found');
    }

    // Only admin can update feedback
    if (req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to update feedback');
    }

    if (adminResponse !== undefined) {
        feedback.adminResponse = adminResponse;
    }

    if (isRead !== undefined) {
        feedback.isRead = isRead;
    }

    const updatedFeedback = await feedback.save();

    res.status(200).json({
        success: true,
        data: updatedFeedback,
        message: 'Feedback updated successfully'
    });
});

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
const deleteFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
        res.status(404);
        throw new Error('Feedback not found');
    }

    // Check if user is authorized to delete this feedback
    if (req.user.role !== 'admin' && feedback.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this feedback');
    }

    await feedback.remove();

    res.status(200).json({
        success: true,
        message: 'Feedback deleted successfully'
    });
});

// @desc    Check if booking has driver assigned (for feedback eligibility)
// @route   GET /api/feedback/check-eligibility/:bookingId
// @access  Private
const checkFeedbackEligibility = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { bookingType } = req.query;

    if (!bookingType || !['local', 'tour'].includes(bookingType)) {
        res.status(400);
        throw new Error('Booking type is required and must be either "local" or "tour"');
    }

    // Find the booking and check if driver is assigned
    let booking;
    if (bookingType === 'local') {
        booking = await CarLocalBookedUsersData.findOne({
            _id: bookingId,
            user: req.user.id
        }).populate('driver', 'name email phone');
    } else if (bookingType === 'tour') {
        booking = await CarTourBookedUsersData.findOne({
            _id: bookingId,
            user: req.user.id
        }).populate('driver', 'name email phone');
    }

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found or does not belong to you');
    }

    // Check if user has already submitted feedback
    const existingFeedback = await Feedback.findOne({
        user: req.user.id,
        bookingId: bookingId,
        bookingType: bookingType
    });

    res.status(200).json({
        success: true,
        data: {
            hasDriver: !!booking.driver,
            driverInfo: booking.driver ? {
                name: booking.driver.name,
                email: booking.driver.email,
                phone: booking.driver.phone
            } : null,
            hasFeedback: !!existingFeedback,
            canSubmitFeedback: !!booking.driver && !existingFeedback,
            bookingStatus: booking.status
        }
    });
});

// @desc    Get driver's feedback (Driver only)
// @route   GET /api/feedback/driver/my-feedback
// @access  Private/Driver
const getDriverFeedback = asyncHandler(async (req, res) => {
    const driverId = req.user.id;
    
    // Find all bookings where this driver was assigned
    const localBookings = await CarLocalBookedUsersData.find({ driver: driverId }).select('_id');
    const tourBookings = await CarTourBookedUsersData.find({ driver: driverId }).select('_id');
    
    const localBookingIds = localBookings.map(booking => booking._id);
    const tourBookingIds = tourBookings.map(booking => booking._id);
    
    // Find feedback for these bookings
    const feedback = await Feedback.find({
        $or: [
            { bookingId: { $in: localBookingIds }, bookingType: 'local' },
            { bookingId: { $in: tourBookingIds }, bookingType: 'tour' }
        ]
    })
    .populate('user', 'username emailid')
    .populate('bookingId')
    .sort({ createdAt: -1 });

    // Calculate driver's average ratings
    const avgRatings = await Feedback.aggregate([
        {
            $match: {
                $or: [
                    { bookingId: { $in: localBookingIds }, bookingType: 'local' },
                    { bookingId: { $in: tourBookingIds }, bookingType: 'tour' }
                ]
            }
        },
        {
            $group: {
                _id: null,
                avgDriverRating: { $avg: '$driverRating' },
                avgVehicleRating: { $avg: '$vehicleRating' },
                avgServiceRating: { $avg: '$serviceRating' },
                avgOverallRating: { $avg: '$rating' },
                totalFeedback: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        count: feedback.length,
        data: feedback,
        statistics: avgRatings[0] || {
            avgDriverRating: 0,
            avgVehicleRating: 0,
            avgServiceRating: 0,
            avgOverallRating: 0,
            totalFeedback: 0
        }
    });
});

// @desc    Get feedback statistics (Admin only)
// @route   GET /api/feedback/stats
// @access  Private/Admin
const getFeedbackStats = asyncHandler(async (req, res) => {
    const totalFeedback = await Feedback.countDocuments();
    const unreadFeedback = await Feedback.countDocuments({ isRead: false });
    const avgRating = await Feedback.aggregate([
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                avgDriverRating: { $avg: '$driverRating' },
                avgVehicleRating: { $avg: '$vehicleRating' },
                avgServiceRating: { $avg: '$serviceRating' }
            }
        }
    ]);

    const ratingDistribution = await Feedback.aggregate([
        {
            $group: {
                _id: '$rating',
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalFeedback,
            unreadFeedback,
            averageRatings: avgRating[0] || {
                avgRating: 0,
                avgDriverRating: 0,
                avgVehicleRating: 0,
                avgServiceRating: 0
            },
            ratingDistribution
        }
    });
});

module.exports = {
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
};
