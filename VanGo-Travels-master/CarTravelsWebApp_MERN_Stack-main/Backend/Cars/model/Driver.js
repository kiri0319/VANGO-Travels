const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const driverSchema = new Schema({
	name: { type: String, required: [true, 'Driver name is required'], trim: true, minLength: 3 },
	email: { type: String, trim: true, unique: true, required: [true, 'Email is required'], match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/, 'Provide a valid email with .com domain'] },
	phone: { type: String, trim: true, unique: true, required: [true, 'Phone is required'], match: [/^0[0-9]{9}$/, 'Provide a valid Sri Lankan phone number (10 digits starting with 0)'] },
	address: { type: String, trim: true, required: [true, 'Address is required'], minLength: 5 },
	password: { type: String, trim: true, required: [true, 'Password is required'], minLength: 8, maxLength: 20 },
	licenseNumber: { type: String, trim: true, unique: true, required: [true, 'License number is required'], match: [/^[A-Z]{1,2}[0-9]{6,7}$/i, 'Invalid Sri Lankan license number format (1-2 letters followed by 6-7 digits)'] },
	experienceYears: { 
		type: Number, 
		min: [0, 'Experience years cannot be negative'], 
		required: [true, 'Experience is required'],
		validate: {
			validator: function(value) {
				return Number.isInteger(value) && value >= 0;
			},
			message: 'Experience years must be a positive whole number (0 or greater)'
		}
	},
	licenseImageUrl: { type: String, trim: true, required: [true, 'License image is required'] },
	status: { type: String, enum: ['active', 'inactive'], default: 'active' },
	role: { type: String, enum: ['driver'], default: 'driver' },
	createdAt: { type: Date, default: Date.now }
});

driverSchema.methods.generateToken = async function(){
	const user = { id: this._id, role: this.role, emailid: this.email, username: this.name };
	const token = await jwt.sign(user, 'mytravelsapp');
	return token;
}

driverSchema.methods.matchPassword = async function(enteredPassword){
	return await bcrypt.compare(enteredPassword, this.password);
}

driverSchema.pre('save', async function(){
	if(!this.isModified('password')) return;
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;


