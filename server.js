const express = require('express');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { readFromFile, writeToFile, historyPath } = require('./models/violationModel');
const violationRoutes = require('./routes/violationRoutes');
const app = express();

app.use(express.json());

// Routes
app.use('/violations', violationRoutes);

// Automated Report Generation
cron.schedule('0 0 * * *', () => {
    // This runs every day at midnight
    generateDailyReport();
});

cron.schedule('0 0 * * 0', () => {
    // This runs every Sunday at midnight
    generateWeeklyReport();
});

// Generate Daily Report
const generateDailyReport = () => {
    const allViolations = readFromFile(historyPath);
    const today = new Date().toISOString().split('T')[0];
    const dailyViolations = allViolations.filter(violation => {
        const violationDate = new Date(violation.timestamp).toISOString().split('T')[0];
        return violationDate === today;
    });

    const dailyReportPath = path.join(__dirname, `data/daily_report_${today}.json`);
    writeToFile(dailyReportPath, dailyViolations);
    console.log(`Daily report generated: ${dailyReportPath}`);
};

// Generate Weekly Report
const generateWeeklyReport = () => {
    const allViolations = readFromFile(historyPath);
    const currentDate = new Date();
    const weekAgoDate = new Date(currentDate);
    weekAgoDate.setDate(currentDate.getDate() - 7);

    const weeklyViolations = allViolations.filter(violation => {
        const violationDate = new Date(violation.timestamp);
        return violationDate >= weekAgoDate && violationDate <= currentDate;
    });

    const weeklyReportPath = path.join(__dirname, `data/weekly_report_${currentDate.toISOString().split('T')[0]}.json`);
    writeToFile(weeklyReportPath, weeklyViolations);
    console.log(`Weekly report generated: ${weeklyReportPath}`);
};

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
