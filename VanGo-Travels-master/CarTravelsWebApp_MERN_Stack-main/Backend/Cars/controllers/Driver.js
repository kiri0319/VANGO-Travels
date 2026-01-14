const Driver = require('../model/Driver');
const asyncHandler = require('../middleware/asyncHandler');
const TourBooking = require('../model/TourBooking');
const LocalBooking = require('../model/Localbooking');

const createDriver = asyncHandler(async(req, res) => {
	// Check for existing driver with same email, phone, or license
	const exists = await Driver.findOne({ 
		$or: [
			{ email: req.body.email }, 
			{ phone: req.body.phone }, 
			{ licenseNumber: req.body.licenseNumber }
		] 
	});
	
	if(exists) {
		let conflictField = '';
		if(exists.email === req.body.email) conflictField = 'Email';
		else if(exists.phone === req.body.phone) conflictField = 'Phone';
		else if(exists.licenseNumber === req.body.licenseNumber) conflictField = 'License Number';
		
		return res.status(409).json({ 
			success: false, 
			message: `${conflictField} already exists` 
		});
	}
	
	try {
		// Handle license image upload
		let licenseImageUrl = '';
		if (req.file) {
			licenseImageUrl = `/uploads/license-images/${req.file.filename}`;
		} else if (req.body.licenseImageUrl) {
			licenseImageUrl = req.body.licenseImageUrl;
		} else {
			return res.status(400).json({ 
				success: false, 
				message: 'License image is required' 
			});
		}

		const driverData = {
			...req.body,
			licenseImageUrl: licenseImageUrl
		};

		const driver = await Driver.create(driverData);
		res.status(201).json({ success: true, data: driver });
	} catch (error) {
		// Handle validation errors
		if (error.name === 'ValidationError') {
			const validationErrors = Object.values(error.errors).map(err => err.message);
			return res.status(400).json({ 
				success: false, 
				message: 'Validation failed', 
				errors: validationErrors 
			});
		}
		throw error;
	}
});

const listDrivers = asyncHandler(async(req, res) => {
	const { q, sortBy } = req.query;
	const filter = q ? { $or: [ { name: { $regex: q, $options: 'i' } }, { licenseNumber: { $regex: q, $options: 'i' } }, { status: { $regex: q, $options: 'i' } } ] } : {};
	const sort = sortBy ? sortBy.split(',').join(' ') : '-createdAt';
	const drivers = await Driver.find(filter).sort(sort);
	res.json({ success: true, data: drivers });
});

const getDriver = asyncHandler(async(req, res) => {
	const driver = await Driver.findById(req.params.id);
	if(!driver) throw new Error('Driver not found');
	
	// If driver is accessing their own data, allow it
	// If admin is accessing any driver data, allow it
	if(req.user.role === 'driver' && req.user.id !== req.params.id) {
		return res.status(403).json({ success: false, message: 'Access denied' });
	}
	
	res.json({ success: true, data: driver });
});

const updateDriver = asyncHandler(async(req, res) => {
	// If driver is updating their own data, allow it
	// If admin is updating any driver data, allow it
	if(req.user.role === 'driver' && req.user.id !== req.params.id) {
		return res.status(403).json({ success: false, message: 'Access denied' });
	}
	
	const updates = req.body || {};
	
	// Handle license image upload
	if (req.file) {
		updates.licenseImageUrl = `/uploads/license-images/${req.file.filename}`;
	}
	
	if(updates.email){
		const exists = await Driver.findOne({ _id: { $ne: req.params.id }, email: updates.email });
		if(exists){
			return res.status(409).json({ success: false, message: 'Email already in use' });
		}
	}
	if(updates.phone){
		const exists = await Driver.findOne({ _id: { $ne: req.params.id }, phone: updates.phone });
		if(exists){
			return res.status(409).json({ success: false, message: 'Phone already in use' });
		}
	}
	if(updates.licenseNumber){
		const exists = await Driver.findOne({ _id: { $ne: req.params.id }, licenseNumber: updates.licenseNumber });
		if(exists){
			return res.status(409).json({ success: false, message: 'License number already in use' });
		}
	}
	const driver = await Driver.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
	if(!driver) throw new Error('Driver not found');
	res.json({ success: true, data: driver });
});

const deleteDriver = asyncHandler(async(req, res) => {
	const id = req.params.id;
	const assignedInTour = await TourBooking.findOne({ driver: id });
	const assignedInLocal = await LocalBooking.findOne({ driver: id });
	if(assignedInTour || assignedInLocal){
		return res.status(409).json({ success: false, message: 'Driver is already assigned to an active booking' });
	}
	const result = await Driver.findByIdAndDelete(id);
	if(!result) throw new Error('Driver not found');
	res.status(201).json({ success: true });
});

// Login driver
const loginDriver = asyncHandler(async(req, res)=>{
    const { email, password } = req.body;
    const driver = await Driver.findOne({ email });
    if(!driver) throw new Error('Invalid username/password!!');
    const isMatch = await driver.matchPassword(password);
    if(!isMatch) throw new Error('Invalid username/password!!');
    const token = await driver.generateToken();
    res.json({ success: true, token });
});

module.exports = { createDriver, listDrivers, getDriver, updateDriver, deleteDriver, loginDriver };


