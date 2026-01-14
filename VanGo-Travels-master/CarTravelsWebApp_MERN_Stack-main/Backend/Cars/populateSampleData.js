const mongoose = require('mongoose');
const adminHomePageDataSchema = require('./model/Adminhomepage.js');

// Sample data with proper image URLs
const samplePackages = [
    {
        packagenameid: 'tour-001',
        packagename: 'Sigiriya Rock Fortress',
        packagedetails: 'Visit the ancient rock fortress with stunning views',
        packageprice: 15000,
        packageimage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        carType: 'AC',
        noofdays: 1
    },
    {
        packagenameid: 'tour-002',
        packagename: 'Colombo City Tour',
        packagedetails: 'Explore the vibrant capital city of Sri Lanka',
        packageprice: 12000,
        packageimage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop',
        carType: 'AC',
        noofdays: 1
    },
    {
        packagenameid: 'tour-003',
        packagename: 'Jaffna Cultural Tour',
        packagedetails: 'Discover the rich cultural heritage of Jaffna',
        packageprice: 18000,
        packageimage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        carType: 'AC',
        noofdays: 2
    },
    {
        packagenameid: 'tour-004',
        packagename: 'Kandy Temple Tour',
        packagedetails: 'Visit the sacred Temple of the Tooth Relic',
        packageprice: 14000,
        packageimage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        carType: 'Non-AC',
        noofdays: 1
    },
    {
        packagenameid: 'tour-005',
        packagename: 'Galle Fort Heritage',
        packagedetails: 'Explore the UNESCO World Heritage site',
        packageprice: 16000,
        packageimage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        carType: 'AC',
        noofdays: 1
    },
    {
        packagenameid: 'tour-006',
        packagename: 'Ella Scenic Train',
        packagedetails: 'Experience the famous train journey through tea plantations',
        packageprice: 20000,
        packageimage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        carType: 'AC',
        noofdays: 2
    }
];

async function populateDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://kavithusan20026_db_user:OmrcR6KYpXWpxNl9@cluster0.qhq7w5i.mongodb.net/cartravels?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing data
        await adminHomePageDataSchema.deleteMany({});
        console.log('Cleared existing packages');

        // Insert sample data
        const insertedPackages = await adminHomePageDataSchema.insertMany(samplePackages);
        console.log(`Successfully inserted ${insertedPackages.length} packages`);

        // Display inserted packages
        insertedPackages.forEach((pkg, index) => {
            console.log(`${index + 1}. ${pkg.packagename} - ₹${pkg.packageprice}`);
        });

        console.log('Database populated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error populating database:', error);
        process.exit(1);
    }
}

// Run the script
populateDatabase();