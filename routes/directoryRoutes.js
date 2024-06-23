const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Route to list years
router.get("/", (req, res) => {
  const dataDir = path.join(__dirname, "../public/data");

  fs.readdir(dataDir, (err, years) => {
    if (err) {
      console.error("Error reading data directory:", err);
      return res.status(500).send("Error reading directory");
    }

    res.render("home", { years });
  });
});

// Route to list weeks for a specific year
router.get("/:year", (req, res) => {
  const { year } = req.params;
  const yearDir = path.join(__dirname, `../public/data/${year}`);

  fs.readdir(yearDir, (err, weeks) => {
    if (err) {
      console.error(`Error reading ${year} directory:`, err);
      return res.status(500).send("Error reading directory");
    }

    res.render("filesystem/year", { year, weeks });
  });
});

// Route to list days for a specific week and year
router.get("/:year/:week", (req, res) => {
  const { year, week } = req.params;
  const weekDir = path.join(__dirname, `../public/data/${year}/${week}`);

  fs.readdir(weekDir, (err, days) => {
    if (err) {
      console.error(`Error reading ${weekDir}:`, err);
      return res.status(500).send("Error reading directory");
    }

    res.render("filesystem/week", { year, week, days });
  });
});

// Route to list daily_checks and work_logs for a specific day, week, and year
router.get("/:year/:week/:day", (req, res) => {
  const { year, week, day } = req.params;
  const dayDir = path.join(__dirname, `../public/data/${year}/${week}/${day}`);

  const dailyChecksDir = path.join(dayDir, "daily_checks");
  const workLogsDir = path.join(dayDir, "work_logs");

  let dailyChecks = [];
  let workLogs = [];

  // Read daily_checks if directory exists
  if (fs.existsSync(dailyChecksDir)) {
    dailyChecks = fs.readdirSync(dailyChecksDir);
  }

  // Read work_logs if directory exists
  if (fs.existsSync(workLogsDir)) {
    workLogs = fs.readdirSync(workLogsDir);
  }

  res.render("filesystem/day", { year, week, day, dailyChecks, workLogs });
});

// Route to list files inside daily_checks for a specific day, week, and year
router.get("/:year/:week/:day/daily_checks", (req, res) => {
  const { year, week, day } = req.params;
  const dailyChecksDir = path.join(__dirname, `../public/data/${year}/${week}/${day}/daily_checks`);

  fs.readdir(dailyChecksDir, (err, files) => {
    if (err) {
      console.error(`Error reading ${dailyChecksDir}:`, err);
      return res.status(500).send("Error reading directory");
    }

    res.render("filesystem/dailyChecks", { year, week, day, files });
  });
});

// Route to list files inside work_logs for a specific day, week, and year
router.get("/:year/:week/:day/work_logs", (req, res) => {
  const { year, week, day } = req.params;
  const workLogsDir = path.join(__dirname, `../public/data/${year}/${week}/${day}/work_logs`);

  fs.readdir(workLogsDir, (err, files) => {
    if (err) {
      console.error(`Error reading ${workLogsDir}:`, err);
      return res.status(500).send("Error reading directory");
    }

    res.render("filesystem/work_logs", { year, week, day, files });
  });
});

module.exports = router;
