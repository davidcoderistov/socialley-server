import dotenv from 'dotenv'
import configureCloudinary from './config/cloudinary'
import connectDB from './config/db'
import setupServer from './config/server'

// Configure env variables
dotenv.config()

// Configure cloudinary
configureCloudinary()

// Connect to database
connectDB().then(() => {
    // Set up server
    setupServer().catch(console.log)
}).catch(console.log)