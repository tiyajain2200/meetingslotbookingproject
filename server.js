const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();

// Middleware to parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql@22',  // Use your actual MySQL password here 
    database: 'meeting_slot_booking'
});

// Connecting to the MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// Serve static files (if any) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// API to add a visitor to the database
app.post('/api/visitors', (req, res) => {
    console.log('Request Body:', req.body);
    const { name, phone, gov_id } = req.body;
    const sql = 'INSERT INTO visitors (name, phone, gov_id) VALUES (?, ?, ?)';
    db.query(sql, [name, phone, gov_id], (err, result) => {
        if (err) {
            console.error('Error inserting visitor:', err);
            return res.status(500).json({ message: 'Error adding visitor' });
        }
        const visitorId = result.insertId;  // Get the inserted visitor ID
        res.status(201).json({ visitor_id: visitorId });  // Return the visitor ID in the response
    });
});

// API to add a patient to the database
app.post('/api/patients', (req, res) => {
    const { patient_id, name, ward } = req.body;
    const sql = 'INSERT INTO patients (patient_id, name, ward) VALUES (?, ?, ?)';
    db.query(sql, [patient_id, name, ward], (err, result) => {
        if (err) {
            console.error('Error inserting patient:', err);
            return res.status(500).json({ message: 'Error adding patient' });
        }
        res.status(201).send('Patient added');
    });
});

// API to search a patient by ID
app.get('/api/patients/:patientId', (req, res) => {
    const patientId = req.params.patientId;
    const sql = 'SELECT * FROM patients WHERE patient_id = ?';
    db.query(sql, [patientId], (err, result) => {
        if (err) {
            console.error('Error fetching patient:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.length > 0) {
            res.status(200).json(result[0]); // Send back the patient details
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    });
});

// API to add a meeting (visitor meeting with patient)
app.post('/api/meetings', (req, res) => {
    const { visitor_id, patient_id, num_persons, meeting_time } = req.body;

    // Check if all required fields are provided
    if (!visitor_id || !patient_id || !num_persons || !meeting_time) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // SQL query to insert the meeting details into the meetings table
    const sql = 'INSERT INTO meetings (visitor_id, patient_id, num_persons, meeting_time) VALUES (?, ?, ?, ?)';

    db.query(sql, [visitor_id, patient_id, num_persons, meeting_time], (err, result) => {
        if (err) {
            console.error('Error inserting meeting:', err);
            return res.status(500).json({ message: 'Error scheduling meeting' });
        }

        // Respond with a success message
        res.status(201).send('Meeting scheduled successfully');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0' ,() => {
    console.log(`Server is running on port ${PORT}`);
});
