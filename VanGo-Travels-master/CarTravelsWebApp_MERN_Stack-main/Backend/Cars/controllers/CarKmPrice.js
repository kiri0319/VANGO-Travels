const CarKmPriceData = require('../model/CarKmPrice.js')
const asyncHandler = require('../middleware/asyncHandler.js');

const insertdetail = asyncHandler(async(req,res,next) => {
    try {
        console.log('=== ADDING CAR KM DETAILS ===');
        console.log('Request body:', req.body);
        
        // Validate required fields
        const { vechicleid, vechicle, minkm, rateperkm, amount } = req.body;
        
        if (!vechicleid) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle ID is required'
            });
        }
        
        if (!vechicle) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle name is required'
            });
        }
        
        if (!minkm) {
            return res.status(400).json({
                success: false,
                message: 'Minimum kilometers is required'
            });
        }
        
        if (!rateperkm) {
            return res.status(400).json({
                success: false,
                message: 'Rate per kilometer is required'
            });
        }
        
        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Amount is required'
            });
        }
        
        // If an image was uploaded, attach its public URL
        let imageUrl = '';
        if (req.file && req.file.filename) {
            imageUrl = `/uploads/car-images/${req.file.filename}`;
        }

        const cardetail_postdata = await CarKmPriceData.create({
            ...req.body,
            imageUrl
        });
        console.log('✅ Car details added successfully:', cardetail_postdata);
        
        res.status(201).json({
            success: true,
            message: 'Car details added successfully',
            data: cardetail_postdata
        });
        
    } catch (error) {
        console.error('❌ Error adding car details:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle ID already exists. Please use a different ID.'
            });
        }
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to add car details',
            error: error.message
        });
    }
})

const findAlldetails = asyncHandler(async(req,res, next) => {
    try {
        const Car_datas = await CarKmPriceData.find().sort({ createdAt: -1 });
        console.log(`Found ${Car_datas.length} car details`);
        
        res.status(200).json({
            success: true,
            count: Car_datas.length,
            data: Car_datas
        });
    } catch (error) {
        console.error('Error fetching car details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch car details',
            error: error.message
        });
    }
})

const findOnedetail = asyncHandler(async(req,res,next)=>{
    try {
        const Car_data = await CarKmPriceData.find({vechicleid : req.params.vechicleid});
        if(Car_data.length !== 0){
            res.status(200).json({
                success: true,
                data: Car_data[0]
            });
            console.log('Found car detail:', Car_data[0]);
        } else {
            res.status(404).json({
                success: false,
                message: `No car detail found for vehicle ID: ${req.params.vechicleid}`
            });
        }
    } catch (error) {
        console.error('Error fetching car detail:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch car detail',
            error: error.message
        });
    }
})

const deletedetail = asyncHandler(async (req,res,next)=>{
    try {
        const Car_data = await CarKmPriceData.deleteOne({vechicleid : req.params.vechicleid});
        if(Car_data.deletedCount !== 0){
            res.status(200).json({
                success: true,
                message: 'Car detail deleted successfully'
            });
            console.log(`Deleted car detail with vehicle ID: ${req.params.vechicleid}`);
        } else {
            res.status(404).json({
                success: false,
                message: `No car detail found for vehicle ID: ${req.params.vechicleid}`
            });
        }
    } catch (error) {
        console.error('Error deleting car detail:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete car detail',
            error: error.message
        });
    }
})

const updatedetail = asyncHandler(async(req,res,next) => {
    try {
        const update = { 
            vechicle: req.body.vechicle, 
            minkm: req.body.minkm, 
            rateperkm: req.body.rateperkm, 
            driverallowance: req.body.driverallowance, 
            amount: req.body.amount
        };
        
        if (req.file && req.file.filename) {
            update.imageUrl = `/uploads/car-images/${req.file.filename}`;
        }
        
        const updatedCar = await CarKmPriceData.findOneAndUpdate(
            {vechicleid : req.params.vechicleid}, 
            { $set : update },
            { new: true, runValidators: true }
        );
        
        if (updatedCar) {
            res.status(200).json({
                success: true,
                message: 'Car detail updated successfully',
                data: updatedCar
            });
            console.log('Updated car detail:', updatedCar);
        } else {
            res.status(404).json({
                success: false,
                message: `No car detail found for vehicle ID: ${req.params.vechicleid}`
            });
        }
    } catch (error) {
        console.error('Error updating car detail:', error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update car detail',
            error: error.message
        });
    }
})


module.exports = {insertdetail,findAlldetails,findOnedetail,deletedetail,updatedetail};