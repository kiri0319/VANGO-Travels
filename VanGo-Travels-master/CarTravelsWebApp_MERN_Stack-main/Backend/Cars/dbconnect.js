const mongoose = require('mongoose');
require('dotenv').config();

const connectToDatabase = async()=>{
     try {
        const mongoUri = process.env.MONGO_URI || "mongodb+srv://kavithusan20026_db_user:OmrcR6KYpXWpxNl9@cluster0.qhq7w5i.mongodb.net/cartravels?retryWrites=true&w=majority&appName=Cluster0";
        let connection = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });
        console.log(`Connected to MongoDB Atlas successfully`.green.bold);
        return connection;
     } catch (error) {
        console.error('Database connection error:', error.message);
        console.log('⚠️  Server will continue running without database connection');
        console.log('⚠️  Please check your MongoDB Atlas IP whitelist settings');
        // Don't throw error, let server continue running
        return null;
     }
}

module.exports = connectToDatabase;