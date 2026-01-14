const mongoose = require('mongoose');
const CarKmPriceData = require('./model/CarKmPrice.js');

// Sample car details data for Sri Lanka
const sampleCarDetails = [
    {
        vechicleid: 'CAR001',
        vechicle: 'TOYOTA COROLLA',
        minkm: 100,
        rateperkm: 15,
        driverallowance: 2000,
        amount: 8000,
        imageUrl: '/uploads/car-images/toyota-corolla-sample.jpg'
    },
    {
        vechicleid: 'CAR002',
        vechicle: 'HONDA CIVIC',
        minkm: 120,
        rateperkm: 18,
        driverallowance: 2500,
        amount: 9500,
        imageUrl: '/uploads/car-images/honda-civic-sample.jpg'
    },
    {
        vechicleid: 'CAR003',
        vechicle: 'NISSAN SUNNY',
        minkm: 80,
        rateperkm: 12,
        driverallowance: 1500,
        amount: 6000,
        imageUrl: '/uploads/car-images/nissan-sunny-sample.jpg'
    },
    {
        vechicleid: 'CAR004',
        vechicle: 'TOYOTA PREMIO',
        minkm: 150,
        rateperkm: 20,
        driverallowance: 3000,
        amount: 12000,
        imageUrl: '/uploads/car-images/toyota-premio-sample.jpg'
    },
    {
        vechicleid: 'CAR005',
        vechicle: 'MITSUBISHI LANCER',
        minkm: 90,
        rateperkm: 14,
        driverallowance: 1800,
        amount: 7000,
        imageUrl: '/uploads/car-images/mitsubishi-lancer-sample.jpg'
    },
    {
        vechicleid: 'CAR006',
        vechicle: 'SUZUKI SWIFT',
        minkm: 70,
        rateperkm: 10,
        driverallowance: 1200,
        amount: 4500,
        imageUrl: '/uploads/car-images/suzuki-swift-sample.jpg'
    },
    {
        vechicleid: 'CAR007',
        vechicle: 'TOYOTA CAMRY',
        minkm: 200,
        rateperkm: 25,
        driverallowance: 4000,
        amount: 15000,
        imageUrl: '/uploads/car-images/toyota-camry-sample.jpg'
    },
    {
        vechicleid: 'CAR008',
        vechicle: 'HONDA ACCORD',
        minkm: 180,
        rateperkm: 22,
        driverallowance: 3500,
        amount: 13500,
        imageUrl: '/uploads/car-images/honda-accord-sample.jpg'
    },
    {
        vechicleid: 'CAR009',
        vechicle: 'NISSAN TIIDA',
        minkm: 85,
        rateperkm: 13,
        driverallowance: 1600,
        amount: 6500,
        imageUrl: '/uploads/car-images/nissan-tiida-sample.jpg'
    },
    {
        vechicleid: 'CAR010',
        vechicle: 'TOYOTA AQUA',
        minkm: 60,
        rateperkm: 8,
        driverallowance: 1000,
        amount: 3500,
        imageUrl: '/uploads/car-images/toyota-aqua-sample.jpg'
    }
];

async function populateCarDetails() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://kavithusan20026_db_user:OmrcR6KYpXWpxNl9@cluster0.qhq7w5i.mongodb.net/cartravels?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing car details
        await CarKmPriceData.deleteMany({});
        console.log('Cleared existing car details');

        // Insert sample car details
        const insertedCars = await CarKmPriceData.insertMany(sampleCarDetails);
        console.log(`Successfully inserted ${insertedCars.length} car details`);

        // Display inserted data
        console.log('\n=== INSERTED CAR DETAILS ===');
        insertedCars.forEach((car, index) => {
            console.log(`${index + 1}. ${car.vechicle} (${car.vechicleid})`);
            console.log(`   Min KM: ${car.minkm}, Rate/KM: LKR ${car.rateperkm}`);
            console.log(`   Driver Allowance: LKR ${car.driverallowance}, Daily Rate: LKR ${car.amount}`);
            console.log(`   Image: ${car.imageUrl}\n`);
        });

        console.log('Car details population completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error populating car details:', error);
        process.exit(1);
    }
}

// Run the script
populateCarDetails();

