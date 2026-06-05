/**
 * Vasudeva Ayurveda - Backend Server
 * Express Server with MongoDB Atlas integration using Mongoose
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('<username>')) {
  console.warn('WARNING: MongoDB Connection URI is using placeholder values. Please check your .env file.');
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas database');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB Atlas:', err.message);
  });

// Setup Mongoose Schema and Model for Bookings
const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  package: {
    type: String,
    required: [true, 'Preferred package is required'],
    trim: true
  },
  details: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Endpoint - Create Booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, email, phone, package: preferredPackage, details } = req.body;

    // Simple backend validation
    if (!name || !email || !phone || !preferredPackage) {
      return res.status(400).json({
        success: false,
        error: 'Please fill all required fields: Name, Email, Phone, and Preferred Therapy'
      });
    }

    // Save entry to MongoDB
    const newBooking = new Booking({
      name,
      email,
      phone,
      package: preferredPackage,
      details
    });

    const savedBooking = await newBooking.save();

    console.log('New booking saved successfully:', savedBooking._id);

    return res.status(201).json({
      success: true,
      message: 'Booking enquiry saved successfully',
      data: savedBooking
    });
  } catch (error) {
    console.error('Error saving booking to database:', error);
    
    // Check for Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error occurred while saving booking'
    });
  }
});

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname)));

// Wildcard Route - Serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`Vasudeva Ayurveda server is running on port ${PORT}`);
});
