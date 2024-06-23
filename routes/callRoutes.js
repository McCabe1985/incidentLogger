const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require('uuid'); 
const getWeekNumber = require("../utils/getWeekNumber");
const getDayName = require("../utils/getDayName");

const router = express.Router();

// Route to render the form for creating a new log
router.get("/", (req, res) => {
    res.render("calls/newCall");
});

// Route to handle the creation of a new log
router.post("/create-call", (req, res) => {
    const { company, contactName, phone, email, issue } = req.body;
    const currentDate = new Date();
    const weekNumber = getWeekNumber(currentDate);
    const dayName = getDayName(currentDate);

    // Sanitize company and contactName for use in filename
    const sanitizedCompany = company.replace(/[^\w\s]/gi, ''); // Remove non-word characters
    const sanitizedContactName = contactName.replace(/[^\w\s]/gi, ''); // Remove non-word characters

    // Base directory for data storage
    const dataDir = path.join(__dirname, '../public/data');

    // Directory paths for year, week, and day
    const yearDir = path.join(dataDir, currentDate.getFullYear().toString());
    const weekDir = path.join(yearDir, `week ${weekNumber}`);
    const dayDir = path.join(weekDir, dayName);
    const workLogsDir = path.join(dayDir, 'work_logs');

    // Ensure directories exist recursively
    try {
        fs.mkdirSync(yearDir, { recursive: true });
        fs.mkdirSync(weekDir, { recursive: true });
        fs.mkdirSync(dayDir, { recursive: true });
        fs.mkdirSync(workLogsDir, { recursive: true });
    } catch (err) {
        console.error('Error creating directories:', err);
        return res.status(500).send('An error occurred while creating directories');
    }

    // Format the filename for work logs
    const filename = `${sanitizedCompany}_${sanitizedContactName}_work.txt`;

    // Construct the path to save the file in work_logs subfolder
    const logFilePath = path.join(workLogsDir, filename);

    // Generate a unique identifier for the log entry
    const logId = uuidv4();

    // Format the log entry
    const logEntry = `
        Log ID: ${logId}
        Company: ${company}
        Contact Name: ${contactName}
        Phone: ${phone}
        Email: ${email}
        Issue: ${issue}
        Date: ${currentDate.toLocaleDateString()}
        Time: ${currentDate.toLocaleTimeString()}
    `;

    // Write the log entry to the file
    fs.writeFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Error writing log file:', err);
            return res.status(500).send('An error occurred while saving the log');
        }
        console.log('Log file saved successfully:', logFilePath);
        res.redirect(`/data/${currentDate.getFullYear()}/week ${weekNumber}/${dayName}`);
    });
});// Route to render the form for updating a call log
router.get("/update-call/:year/:week/:day/:filename", (req, res) => {
    const { year, week, day, filename } = req.params;
    const logFilePath = path.join(__dirname, `../public/data/${year}/${week}/${day}/work_logs`, filename);

    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err);
            return res.status(500).send('Error reading log file');
        }

        // Render the update form with existing log data
        res.render('calls/updateCall', { year, week, day, filename, logContent: data });
    });
});

// Route to handle the update of a call log
router.post("/update-call/:year/:week/:day/:filename", (req, res) => {
    const { year, week, day, filename } = req.params;
    const logFilePath = path.join(__dirname, `../public/data/${year}/${week}/${day}/work_logs`, filename);
    const newComment = req.body.newComment;

    const currentDate = new Date();
    const logEntry = `
        Update at ${currentDate.toLocaleString()}:
        ${newComment}
    `;

    // Append the new log entry to the file
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Error appending to log file:', err);
            return res.status(500).send('Error appending to log file');
        }
        console.log('Log file updated successfully:', logFilePath);
        res.redirect(`/data/${year}/${week}/${day}/work_logs/${filename}`);
    });
});



module.exports = router;
