var express = require('express')
var router = express.Router()
const {protect,authorize_role} = require('../middleware/authenticate.js');
// const query_find = require('../middleware/query_params');

const {findAllusers,insertuser,findOneUser,deleteuser,updateuser,assignDriver,removeDriver,cancelBooking,driverCompleteBooking,driverCancelBooking,getDriverBookings,adminAssignNextBooking} = require('../controllers/LocalBooking.js')
// const LocalTourDetails = require('../model/Localbooking');

router.route('/')
.get(findAllusers)
.post(protect,authorize_role('user'),insertuser)

// Test route for debugging
router.route('/test')
.post((req, res) => {
    console.log('=== TEST ROUTE DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body type:', typeof req.body);
    console.log('Body keys:', Object.keys(req.body || {}));
    
    res.json({ 
        message: 'Test route working', 
        receivedData: req.body,
        bodyType: typeof req.body,
        bodyKeys: Object.keys(req.body || {}),
        timestamp: new Date().toISOString()
    });
})

router.route('/user/:user')
.get(protect, authorize_role('user'), findOneUser)

router.route('/:_id')
.delete(protect,authorize_role('user'),deleteuser)
.patch(protect,authorize_role('user','admin','driver'),updateuser)

// Driver assignment routes
router.route('/:_id/assign-driver')
.patch(protect,authorize_role('admin'),assignDriver)

router.route('/:_id/remove-driver')
.patch(protect,authorize_role('admin'),removeDriver)

router.route('/:_id/cancel')
.patch(protect,authorize_role('user'),cancelBooking)

// Driver booking management routes
router.route('/driver/my-bookings')
.get(protect,authorize_role('driver'),getDriverBookings)

router.route('/:_id/driver-complete')
.patch(protect,authorize_role('driver'),driverCompleteBooking)

router.route('/:_id/driver-cancel')
.patch(protect,authorize_role('driver'),driverCancelBooking)

// Admin assign next booking to driver
router.route('/admin/assign-next/:driverId')
.patch(protect,authorize_role('admin'),adminAssignNextBooking)

module.exports = router