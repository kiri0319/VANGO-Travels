var express = require('express')
var router = express.Router()
const {protect,authorize_role} = require('../middleware/authenticate.js');
const { createDriver, listDrivers, getDriver, updateDriver, deleteDriver, loginDriver } = require('../controllers/Driver');

// Middleware to get upload from app.locals
const getUploadMiddleware = (req, res, next) => {
  req.upload = req.app.locals.upload;
  next();
};

router.route('/')
	.get(protect, authorize_role('admin'), listDrivers)
	.post(protect, authorize_role('admin'), getUploadMiddleware, (req, res, next) => {
		req.upload.single('licenseImage')(req, res, next);
	}, createDriver)

router.route('/:id')
	.get(protect, authorize_role('admin','driver'), getDriver)
	.patch(protect, authorize_role('admin','driver'), getUploadMiddleware, (req, res, next) => {
		req.upload.single('licenseImage')(req, res, next);
	}, updateDriver)
	.delete(protect, authorize_role('admin'), deleteDriver)

router.route('/login')
	.post(loginDriver)

module.exports = router


