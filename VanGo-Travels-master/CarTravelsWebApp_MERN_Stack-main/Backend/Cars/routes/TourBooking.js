var express = require('express')
var router = express.Router()
const {protect,authorize_role} = require('../middleware/authenticate.js');
// const query_find = require('../middleware/query_params');
const {findAllusers,insertuser,findOneUser,deleteuser,updateuser,assignDriver,removeDriver} = require('../controllers/TourBooking.js')
// const TourDetails = require('../model/TourBooking');

router.route('/')
.get(findAllusers)
.post(protect,authorize_role('user'),insertuser)

router.route('/:user')
.get(protect,authorize_role('user','admin'),findOneUser)

router.route('/:_id')
.delete(protect,authorize_role('user'),deleteuser)
.patch(protect,authorize_role('user','admin','driver'),updateuser)

// Driver assignment routes
router.route('/:_id/assign-driver')
.patch(protect,authorize_role('admin'),assignDriver)

router.route('/:_id/remove-driver')
.patch(protect,authorize_role('admin'),removeDriver)

module.exports = router