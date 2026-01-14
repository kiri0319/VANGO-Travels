const CarTourBookedUsersData = require('../model/TourBooking.js')
const SignupUser = require('../model/signupuser.js')
const Driver = require('../model/Driver.js')
const asyncHandler = require('../middleware/asyncHandler.js');

const insertuser = asyncHandler(async(req,res,next) => {
    const { name, phoneNumber, packagename, packageprice, carType, noofdays } = req.body || {};

    if(!packagename || packageprice === undefined || !carType){
        res.status(400);
        throw new Error('packagename, packageprice and carType are required');
    }

    const authenticatedUserId = req.user && req.user.id ? req.user.id : null;
    let dbUser = null;
    if((!name || !phoneNumber) && authenticatedUserId){
        dbUser = await SignupUser.findById(authenticatedUserId).select('username phonenumber');
    }

    const payload = {
        name: name || (req.user && req.user.username) || (dbUser && dbUser.username),
        phoneNumber: phoneNumber || (req.user && req.user.phonenumber) || (dbUser && dbUser.phonenumber),
        packagename,
        packageprice,
        carType,
        noofdays: noofdays || 1,
        user: authenticatedUserId || req.body.user,
        usernameid: (req.user && req.user.username) || (dbUser && dbUser.username) || req.body.usernameid,
        driver: req.body.driver
    };

    let caruser_postdata = await CarTourBookedUsersData.create(payload);
    console.log(caruser_postdata);
    res.status(201).json({success: "Added Sucessfully", data: caruser_postdata})
})

const findAllusers = asyncHandler(async(req,res, next) => {
    const { driver } = req.query;
    let filter = {};
    
    // If driver query parameter is provided, filter by driver
    if(driver) {
        filter.driver = driver;
    }
    
    let Car_datas = await CarTourBookedUsersData.find(filter)
        .populate('user', 'username emailid')
        .populate('driver', 'name email phone');
    res.json({ success: true, data: Car_datas });
    console.log(Car_datas);
})

// const findAllusers = asyncHandler(async(req, res)=>{
//     res.status(200).json(res.advancedResults);
// })

const findOneUser = asyncHandler(async(req,res,next)=>{
    var params_data = req.params.user
    if(params_data[0] >= 0 && params_data[0] <= 9){
        let Car_data=await CarTourBookedUsersData.find({user:params_data});
        if(Car_data.length !=0){
            res.json(Car_data);
            console.log(Car_data);}
        else throw new Error(`No record found for ${req.params.user}`)
    }else{
        let Car_data=await CarTourBookedUsersData.find({usernameid:params_data});
        if(Car_data.length !=0){
            res.json(Car_data);
            console.log(Car_data);}
        else throw new Error(`No record found for ${req.params.usernameid}`)
    }
})

const deleteuser = asyncHandler(async (req,res,next)=>{
    let Car_data=await CarTourBookedUsersData.deleteOne({_id:req.params._id});
    if(Car_data.n !== 0){
          res.status(201).json({success: "Successfully Deleted"})}
    else throw new Error(`No record found for ${req.params._id}`)
})

const updateuser = asyncHandler(async(req,res,next) => {
    try {
        console.log('=== UPDATE TOUR BOOKING ===');
        console.log('Booking ID:', req.params._id);
        console.log('Update data:', req.body);
        
        const bookingId = req.params._id;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData.user;
        delete updateData.usernameid;
        delete updateData.createdAt;

        const updatedBooking = await CarTourBookedUsersData.findByIdAndUpdate(
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

    } catch(err) {
        console.error('❌ Error updating booking:', err);
        next(err);
    }
})

// ===========================================
// ASSIGN DRIVER TO TOUR BOOKING
// ===========================================
const assignDriver = asyncHandler(async(req, res, next) => {
    try {
        console.log('=== ASSIGN DRIVER TO TOUR BOOKING ===');
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
        const existingTourBooking = await CarTourBookedUsersData.findOne({ 
            driver: driverId,
            _id: { $ne: bookingId }
        });
        
        if (existingTourBooking) {
            return res.status(400).json({
                success: false,
                message: 'Driver is already assigned to another tour booking'
            });
        }
        
        // Update booking with driver assignment
        const updatedBooking = await CarTourBookedUsersData.findByIdAndUpdate(
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
// REMOVE DRIVER FROM TOUR BOOKING
// ===========================================
const removeDriver = asyncHandler(async(req, res, next) => {
    try {
        console.log('=== REMOVE DRIVER FROM TOUR BOOKING ===');
        console.log('Booking ID:', req.params._id);
        
        const bookingId = req.params._id;
        
        const updatedBooking = await CarTourBookedUsersData.findByIdAndUpdate(
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

module.exports = {insertuser,findAllusers,findOneUser,deleteuser,updateuser,assignDriver,removeDriver};