import dotenv from 'dotenv'
import connectDB from './config/db'
import setupServer from './config/server'

// Configure env variables
dotenv.config()

// Connect to database
connectDB()

// Set up server
setupServer()