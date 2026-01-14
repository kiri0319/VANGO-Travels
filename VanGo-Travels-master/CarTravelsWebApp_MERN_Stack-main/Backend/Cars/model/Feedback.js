const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'signupuserData',
        required: [true, "User ID is mandatory"]
    },
    username: {
        type: String,
        required: [true, "Username is mandatory"]
    },
    email: {
        type: String,
        required: [true, "Email is mandatory"]
    },
    bookingType: {
        type: String,
        enum: ['local', 'tour'],
        required: [true, "Booking type is mandatory"]
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'bookingModel',
        required: [true, "Booking ID is mandatory"]
    },
    bookingModel: {
        type: String,
        enum: ['CarLocalBookedUsersData', 'CarTourBookedUsersData'],
        required: [true, "Booking model is mandatory"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, "Rating is mandatory (1-5)"]
    },
    review: {
        type: String,
        minLength: [10, 'Review should be at least 10 characters'],
        maxLength: [500, 'Review should not exceed 500 characters'],
        required: [true, "Review is mandatory"]
    },
    driverRating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, "Driver rating is mandatory (1-5)"]
    },
    vehicleRating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, "Vehicle rating is mandatory (1-5)"]
    },
    serviceRating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, "Service rating is mandatory (1-5)"]
    },
    isRead: {
        type: Boolean,
        default: false
    },
    adminResponse: {
        type: String,
        maxLength: [300, 'Admin response should not exceed 300 characters']
    },
    createdAt: {
        type: String,
        default: new Date().toLocaleString()
    },
    updatedAt: {
        type: String,
        default: new Date().toLocaleString()
    }
});

// Update the updatedAt field before saving
FeedbackSchema.pre('save', function(next) {
    this.updatedAt = new Date().toLocaleString();
    next();
});

const Feedback = mongoose.model('Feedback', FeedbackSchema);
module.exports = Feedback;
