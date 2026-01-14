const CarLocalBookedUsersData = require('../model/Localbooking.js')
const SignupUser = require('../model/signupuser.js')
const Driver = require('../model/Driver.js')
const asyncHandler = require('../middleware/asyncHandler.js');

// ===========================================
// CREATE LOCAL BOOKING
// ===========================================
const insertuser = asyncHandler(async(req, res, next) => {
    try {
        console.log('=== LOCAL BOOKING CREATE ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Request headers:', req.headers);
        console.log('Authenticated user:', req.user);
        
        // Extract and validate required fields
        const {
            FromLocation,
            ToLocation,
            user_name,
            phoneNumber,
            user,
            usernameid
        } = req.body;
        
        console.log('Extracted fields:', {
            FromLocation: FromLocation,
            ToLocation: ToLocation,
            user_name: user_name,
            phoneNumber: phoneNumber,
            user: user,
            usernameid: usernameid
        });

        // Validation
        if (!FromLocation || !ToLocation) {
            console.log('❌ Validation failed: Missing locations');
            return res.status(400).json({
                success: false,
                message: 'FromLocation and ToLocation are required'
            });
        }

        if (!user_name || !phoneNumber) {
            console.log('❌ Validation failed: Missing user details');
            return res.status(400).json({
                success: false,
                message: 'User name and phone number are required'
            });
        }

        // Get authenticated user ID
        const authenticatedUserId = req.user?.id;
        if (!authenticatedUserId) {
            console.log('❌ Authentication failed: No user ID');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Create booking payload
        const bookingData = {
            FromLocation: FromLocation.trim(),
            ToLocation: ToLocation.trim(),
            user_name: user_name.trim(),
            phoneNumber: phoneNumber.trim(),
            user: authenticatedUserId,
            usernameid: req.user.username || usernameid,
            DateTime: new Date().toLocaleString()
        };

        console.log('✅ Creating booking with data:', bookingData);

        // Save to database
        const newBooking = await CarLocalBookedUsersData.create(bookingData);
        
        console.log('✅ Booking created successfully:', newBooking._id);
        
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: newBooking
        });

    } catch (error) {
        console.error('❌ Booking creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// ===========================================
// GET ALL LOCAL BOOKINGS (ADMIN/DRIVER)
// ===========================================
const findAllusers = asyncHandler(async(req, res) => {
    try {
        console.log('=== GET ALL LOCAL BOOKINGS ===');
        
    const { driver } = req.query;
    let filter = {};
    
    // If driver query parameter is provided, filter by driver
    if(driver) {
        filter.driver = driver;
            console.log('Filtering by driver ID:', driver);
        }
        
        const bookings = await CarLocalBookedUsersData.find(filter)
            .populate('user', 'username emailid')
            .populate('driver', 'name email phone')
            .sort({ DateTime: -1 });

        console.log(`✅ Found ${bookings.length} bookings`);
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        console.error('❌ Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// ===========================================
// GET USER'S LOCAL BOOKINGS
// ===========================================
const findOneUser = asyncHandler(async(req, res) => {
    try {
        console.log('=== GET USER BOOKINGS ===');
        console.log('User ID:', req.params.user);
        
        const userId = req.params.user;
        
        // Find bookings by user ID
        const bookings = await CarLocalBookedUsersData.find({ user: userId })
            .sort({ DateTime: -1 });

        console.log(`✅ Found ${bookings.length} bookings for user ${userId}`);
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        console.error('❌ Error fetching user bookings:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// ===========================================
// UPDATE LOCAL BOOKING
// ===========================================
const updateuser = asyncHandler(async(req, res) => {
    try {
        console.log('=== UPDATE LOCAL BOOKING ===');
        console.log('Booking ID:', req.params._id);
        console.log('Update data:', req.body);
        
        const bookingId = req.params._id;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData.user;
        delete updateData.usernameid;
        delete updateData.DateTime;

        const updatedBooking = await CarLocalBookedUsersData.findByIdAndUpdate(
            bookingId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedBooking) {
            console.log('❌ Booking not found');
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        console.log('✅ Booking updated successfully');
        
        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            data: updatedBooking
        });

    } catch (error) {
        console.error('❌ Error updating booking:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// ===========================================
// DELETE LOCAL BOOKING
// ===========================================
const deleteuser = asyncHandler(async(req, res) => {
    try {
        console.log('=== DELETE LOCAL BOOKING ===');
        console.log('Booking ID:', req.params._id);
        
        const bookingId = req.params._id;

        const deletedBooking = await CarLocalBookedUsersData.findByIdAndDelete(bookingId);

        if (!deletedBooking) {
            console.log('❌ Booking not found');
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        console.log('✅ Booking deleted successfully');
        
        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting booking:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// ===========================================
// ASSIGN DRIVER TO LOCAL BOOKING
// ===========================================
const assignDriver = asyncHandler(async(req, res, next) => {
    try {
        console.log('=== ASSIGN DRIVER TO LOCAL BOOKING ===');
        console.log('Booking ID:', req.params._id);
        console.log('Driver ID:', req.body.driverId);
        
        const bookingId = req.params._id;
        const driverId = req.body.driverId;
        
        // Validate driver exists
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        
        // Check if driver is active
        if (driver.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Driver is not active'
            });
        }
        
        // Check if driver is already assigned to another booking
        const existingLocalBooking = await CarLocalBookedUsersData.findOne({ 
            driver: driverId,
            _id: { $ne: bookingId }
        });
        
        if (existingLocalBooking) {
            return res.status(400).json({
                success: false,
                message: 'Driver is already assigned to another local booking'
            });
        }
        
        // Update booking with driver assignment
        const updatedBooking = await CarLocalBookedUsersData.findByIdAndUpdate(
            bookingId,
            { driver: driverId },
            { new: true, runValidators: true }
        ).populate('driver', 'name email phone')
         .populate('user', 'username emailid');
        
        if (!updatedBooking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        console.log('✅ Driver assigned successfully');
        
        res.status(200).json({
            success: true,
            message: 'Driver assigned successfully',
            data: updatedBooking
        });
        
    } catch (error) {
        console.error('❌ Error assigning driver:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// ===========================================
// REMOVE DRIVER FROM LOCAL BOOKING
// ===========================================
const removeDriver = asyncHandler(async(req, res, next) => {
    try {
        console.log('=== REMOVE DRIVER FROM LOCAL BOOKING ===');
        console.log('Booking ID:', req.params._id);
        
        const bookingId = req.params._id;
        
        const updatedBooking = await CarLocalBookedUsersData.findByIdAndUpdate(
            bookingId,
            { $unset: { driver: 1 } },
            { new: true, runValidators: true }
        ).populate('driver', 'name email phone')
         .populate('user', 'username emailid');
        
        if (!updatedBooking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        console.log('✅ Driver removed successfully');
        
        res.status(200).json({
            success: true,
            message: 'Driver removed successfully',
            data: updatedBooking
        });
        
    } catch (error) {
        console.error('❌ Error removing driver:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// ===========================================
// CANCEL LOCAL BOOKING
// ===========================================
const cancelBooking = asyncHandler(async(req, res) => {
    try {
        console.log('=== CANCEL LOCAL BOOKING ===');
        console.log('Booking ID:', req.params._id);
        
        const bookingId = req.params._id;
        
        // Find the booking
        const booking = await CarLocalBookedUsersData.findById(bookingId);
        
        if (!booking) {
            console.log('❌ Booking not found');
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking can be cancelled
        if (booking.status === 'cancelled') {
            console.log('❌ Booking already cancelled');
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        if (booking.status === 'completed') {
            console.log('❌ Cannot cancel completed booking');
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed booking'
            });
        }

        // Update booking status to cancelled
        const cancelledBooking = await CarLocalBookedUsersData.findByIdAndUpdate(
            bookingId,
            { 
                status: 'cancelled',
                cancelledAt: new Date().toISOString(),
                cancelledBy: req.user?.id || 'user'
            },
            { new: true, runValidators: true }
        ).populate('user', 'username emailid')
         .populate('driver', 'name email phone');

        console.log('✅ Booking cancelled successfully');
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: cancelledBooking
        });

    } catch (error) {
        console.error('❌ Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// ===========================================
// ADMIN COMPLETE BOOKING
// ===========================================
const adminCompleteBooking = asyncHandler(async(req, res) => {
    try {
        console.log('=== ADMIN COMPLETE BOOKING ===');
        console.log('Booking ID:', req.params._id);
        
        const bookingId = req.params._id;
        
        // Find the booking
        const booking = await CarLocalBookedUsersData.findById(bookingId);
        
        if (!booking) {
            console.log('❌ Booking not found');
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update booking status to completed
        const completedBooking = await CarLocalBookedUsersData.findByIdAndUpdate(
            bookingId,
            { 
                status: 'completed',
                completedAt: new Date().toISOString(),
                completedBy: req.user?.id || 'admin'
            },
            { new: true, runValidators: true }
        ).populate('driver', 'name email phone')
         .populate('user', 'username emailid');

        console.log('✅ Booking completed by admin');

        // If there was a driver assigned, try to reassign them to next available booking
        let reassignmentResult = null;
        if (completedBooking.driver) {
            const nextBooking = await CarLocalBookedUsersData.findOne({
                status: 'assigned',
                driver: { $exists: false }
            }).sort({ DateTime: 1 });

            if (nextBooking) {
                const reassignedBooking = await CarLocalBookedUsersData.findByIdAndUpdate(
                    nextBooking._id,
                    { 
                        driver: completedBooking.driver._id,
                        status: 'in_progress',
                        assignedAt: new Date().toISOString(),
                        assignedBy: req.user?.id || 'admin'
                    },
                    { new: true, runValidators: true }
                ).populate('driver', 'name email phone')
                 .populate('user', 'username emailid');

                reassignmentResult = {
                    success: true,
                    message: 'Driver reassigned to next booking',
                    nextBooking: reassignedBooking
                };
                console.log('✅ Driver reassigned to next booking:', nextBooking._id);
            } else {
                reassignmentResult = {
                    success: false,
                    message: 'No available bookings for reassignment'
                };
                console.log('ℹ️ No available bookings for reassignment');
            }
        }

        res.status(200).json({
            success: true,
            message: 'Booking completed successfully',
            data: {
                completedBooking,
                reassignment: reassignmentResult
            }
        });

    } catch (error) {
        console.error('❌ Error completing booking:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// ===========================================
// ADMIN CANCEL BOOKING
// ===========================================
const adminCancelBooking = asyncHandler(async(req, res) => {
    try {
        console.log('=== ADMIN CANCEL BOOKING ===');
        console.log('Booking ID:', req.params._id);
        
        const bookingId = req.params._id;
        
        // Find the booking
        const booking = await CarLocalBookedUsersData.findById(bookingId);
        
        if (!booking) {
            console.log('❌ Booking not found');
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status === 'cancelled') {
            console.log('❌ Booking already cancelled');
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        if (booking.status === 'completed') {
            console.log('❌ Cannot cancel completed booking');
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed booking'
            });
        }

        // Update booking status to cancelled
        const cancelledBooking = await CarLocalBookedUsersData.findByIdAndUpdate(
            bookingId,
            { 
                status: 'cancelled',
                cancelledAt: new Date().toISOString(),
                cancelledBy: req.user?.id || 'admin'
            },
            { new: true, runValidators: true }
        ).populate('driver', 'name email phone')
         .populate('user', 'username emailid');

        console.log('✅ Booking cancelled by admin');
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: cancelledBooking
        });

    } catch (error) {
        console.error('❌ Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// ===========================================
// DRIVER COMPLETE BOOKING
// ===========================================
const driverCompleteBooking = asyncHandler(async(req, res) => {
    try {
        console.log('=== DRIVER COMPLETE BOOKING ===');
        console.log('Booking ID:', req.params._id);
        console.log('Driver ID:', req.user.id);
        
        const bookingId = req.params._id;
        const driverId = req.user.id;
        
        // Find the booking and verify driver ownership
        const booking = await CarLocalBookedUsersData.findById(bookingId);
        
        if (!booking) {
            console.log('❌ Booking not found');
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if driver is assigned to this booking
        if (!booking.driver || booking.driver.toString() !== driverId) {
            console.log('❌ Driver not assigned to this booking');
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this booking'
            });
        }

        // Check if booking can be completed
        if (booking.status === 'completed') {
            console.log('❌ Booking already completed');
            return res.status(400).json({
                success: false,
                message: 'Booking is already completed'
            });
        }

        if (booking.status === 'cancelled') {
            console.log('❌ Cannot complete cancelled booking');
            return res.status(400).json({
                success: false,
                message: 'Cannot complete a cancelled booking'
            });
        }

        // Update booking status to completed
        const completedBooking = await CarLocalBookedUsersData.findByIdAndUpdate(
            bookingId,
            { 
                status: 'completed',
                completedAt: new Date().toISOString(),
                completedBy: driverId
            },
            { new: true, runValidators: true }
        ).populate('driver', 'name email phone')
         .populate('user', 'username emailid');

        console.log('✅ Booking completed by driver');
        res.status(200).json({
            success: true,
            message: 'Booking completed successfully',
            data: completedBooking
        });

    } catch (error) {
        console.error('❌ Error completing booking:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// ===========================================
// DRIVER CANCEL BOOKING
// ===========================================
const driverCancelBooking = asyncHandler(async(req, res) => {
    try {
        console.log('=== DRIVER CANCEL BOOKING ===');
        console.log('Booking ID:', req.params._id);
        console.log('Driver ID:', req.user.id);
        
        const bookingId = req.params._id;
        const driverId = req.user.id;
        
        // Find the booking and verify driver ownership
        const booking = await CarLocalBookedUsersData.findById(bookingId);
        
        if (!booking) {
            console.log('❌ Booking not found');
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if driver is assigned to this booking
        if (!booking.driver || booking.driver.toString() !== driverId) {
            console.log('❌ Driver not assigned to this booking');
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this booking'
            });
        }

        if (booking.status === 'cancelled') {
            console.log('❌ Booking already cancelled');
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        if (booking.status === 'completed') {
            console.log('❌ Cannot cancel completed booking');
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed booking'
            });
        }

        // Update booking status to cancelled
        const cancelledBooking = await CarLocalBookedUsersData.findByIdAndUpdate(
            bookingId,
            { 
                status: 'cancelled',
                cancelledAt: new Date().toISOString(),
                cancelledBy: driverId
            },
            { new: true, runValidators: true }
        ).populate('driver', 'name email phone')
         .populate('user', 'username emailid');

        console.log('✅ Booking cancelled by driver');
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: cancelledBooking
        });

    } catch (error) {
        console.error('❌ Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// ===========================================
// GET DRIVER'S BOOKINGS
// ===========================================
const getDriverBookings = asyncHandler(async(req, res) => {
    try {
        console.log('=== GET DRIVER BOOKINGS ===');
        console.log('Driver ID:', req.user.id);
        
        const driverId = req.user.id;
        const { status } = req.query;
        
        let filter = { driver: driverId };
        
        // Filter by status if provided
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        const bookings = await CarLocalBookedUsersData.find(filter)
            .populate('user', 'username emailid')
            .sort({ DateTime: -1 });

        console.log(`✅ Found ${bookings.length} bookings for driver`);
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });

    } catch (error) {
        console.error('❌ Error fetching driver bookings:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

// ===========================================
// ADMIN ASSIGN NEXT BOOKING TO DRIVER
// ===========================================
const adminAssignNextBooking = asyncHandler(async(req, res) => {
    try {
        console.log('=== ADMIN ASSIGN NEXT BOOKING TO DRIVER ===');
        console.log('Driver ID:', req.params.driverId);
        
        const driverId = req.params.driverId;
        
        // Verify driver exists and is active
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }
        
        if (driver.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Driver is not active'
            });
        }
        
        // Check if driver already has an active booking
        const activeBooking = await CarLocalBookedUsersData.findOne({
            driver: driverId,
            status: { $in: ['assigned', 'in_progress'] }
        });
        
        if (activeBooking) {
            return res.status(400).json({
                success: false,
                message: 'Driver already has an active booking'
            });
        }
        
        // Find next unassigned booking
        const nextBooking = await CarLocalBookedUsersData.findOne({
            status: 'assigned',
            driver: { $exists: false }
        }).sort({ DateTime: 1 });
        
        if (!nextBooking) {
            return res.status(404).json({
                success: false,
                message: 'No available bookings for assignment'
            });
        }
        
        // Assign booking to driver
        const assignedBooking = await CarLocalBookedUsersData.findByIdAndUpdate(
            nextBooking._id,
            { 
                driver: driverId,
                status: 'in_progress',
                assignedAt: new Date().toISOString(),
                assignedBy: req.user.id
            },
            { new: true, runValidators: true }
        ).populate('driver', 'name email phone')
         .populate('user', 'username emailid');
        
        console.log('✅ Next booking assigned to driver');
        
        res.status(200).json({
            success: true,
            message: 'Booking assigned successfully',
            data: assignedBooking
        });
        
    } catch (error) {
        console.error('❌ Error assigning next booking:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});

module.exports = {
    insertuser,
    findAllusers,
    findOneUser,
    updateuser,
    deleteuser,
    assignDriver,
    removeDriver,
    cancelBooking,
    adminCompleteBooking,
    adminCancelBooking,
    driverCompleteBooking,
    driverCancelBooking,
    getDriverBookings,
    adminAssignNextBooking
};