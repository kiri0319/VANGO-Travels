var express = require('express')
var router = express.Router()
const {protect,authorize_role} = require('../middleware/authenticate.js');
const query_find = require('../middleware/query_params.js');
const {findAllpackages,insertpackage,findonepackage,deletepackage,updatepackage,insertBulkPackages} = require('../controllers/Adminhomepage.js')

const adminTourPackageDetails = require('../model/Adminhomepage.js');

router.route('/')
.get(query_find(adminTourPackageDetails),findAllpackages)
.post(protect,authorize_role('admin'),insertpackage)

router.route('/bulk')
.post(protect,authorize_role('admin'),insertBulkPackages)

router.route('/:packagenameid')
.get(findonepackage)
.delete(protect,authorize_role('admin'),deletepackage)
.patch(protect,authorize_role('admin'),updatepackage)

module.exports = router

// router.route('/:noofdays')
// .get(findonepackageBasedOnDays)