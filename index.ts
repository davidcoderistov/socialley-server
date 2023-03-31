import dotenv from 'dotenv'
import configureCloudinary from './config/cloudinary'
import initStorage from './config/storage'
import connectDB from './config/db'
import setupServer from './config/server'

// Configure env variables
dotenv.config()

// Configure cloudinary
configureCloudinary()

// Initialize storage
initStorage()

// Connect to database
connectDB().then(() => {
    // Set up server
    setupServer().catch(console.log)
}).catch(console.log)