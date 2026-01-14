const express = require('express');
const app = express();
const cors = require('cors')
const multer = require('multer')
require('dotenv').config()
require('colors');

const SignedUserRoutes = require('./routes/signupuser')
const caruserRoutes = require('./routes/LocalBooking')
const cartouruserRoutes = require('./routes/TourBooking')
const adminhomepageRoute = require('./routes/Adminhomepage')
const carkmpriceRoute = require('./routes/CarKmPrice')
const UsersAttendance = require('./routes/Attendance')
const driverRoutes = require('./routes/Driver')
const feedbackRoutes = require('./routes/Feedback')

const errorHandler = require('./middleware/errorhandler')
const connectToDatabase = require('./dbconnect')
const path = require('path')
const fs = require('fs')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static serving for uploaded images
const uploadsDir = path.join(__dirname, 'uploads', 'car-images')
const licenseUploadsDir = path.join(__dirname, 'uploads', 'license-images')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
if (!fs.existsSync(licenseUploadsDir)) {
  fs.mkdirSync(licenseUploadsDir, { recursive: true })
}
app.use('/uploads/car-images', express.static(uploadsDir))
app.use('/uploads/license-images', express.static(licenseUploadsDir))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'licenseImage') {
      cb(null, licenseUploadsDir)
    } else {
      cb(null, uploadsDir)
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'licenseImage') {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed for license upload'), false)
    }
  } else {
    cb(null, true)
  }
}

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Make upload middleware available to routes
app.locals.upload = upload

connectToDatabase();

app.use('/api/v1/signedupuserdetails', SignedUserRoutes);
app.use('/api/v1/carbookedusers', caruserRoutes);
app.use('/api/v1/cartourbookedusers', cartouruserRoutes);
app.use('/api/v1/adminHomePage', adminhomepageRoute);
app.use('/api/v1/CarkilometerDetails', carkmpriceRoute);
app.use('/api/v1/AllUsersLog', UsersAttendance);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/feedback', feedbackRoutes);

app.get('/',(req,res)=>{
    res.send("hello API")
})

app.use(errorHandler);


const PORT = process.env.PORT || 8010;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

