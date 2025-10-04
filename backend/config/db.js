const mongoose = require('mongoose');

/**
 * @desc Connects the application to MongoDB using the URI from environment variables.
 */
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;

        // CRITICAL CHECK: Ensure the URI is present before attempting connection
        if (!mongoURI) {
            console.error('CRITICAL ERROR: MONGO_URI is not defined in environment variables. Check your .env file or Render settings.');
            // Exit process with failure since the database is mandatory
            process.exit(1); 
        }

        const conn = await mongoose.connect(mongoURI);
        
        // Log successful connection details for verification
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
    } catch (err) {
        // Log the full error and exit
        console.error(`MongoDB Connection Failed: ${err.message}`);
        
        // Note: If you see "Could not connect to any servers...", the fix is in MongoDB Atlas Network Access.
        process.exit(1);
    }
};

module.exports = connectDB;
