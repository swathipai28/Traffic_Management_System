const {
    violationsQueue,
    historyStack,
    invoices,
    writeToFile,
    readFromFile,
    finesPath,
    historyPath,
    invoicesPath,
} = require('../models/violationModel');
const fs = require('fs');
const path = require('path');
const violationsPath = path.join(__dirname, '../data/fines.json');
const reportsPath = path.join(__dirname, '../reports');

const generateInvoiceId = () => `INV-${Date.now()}`;
// Add a violation
const addViolation = (req, res) => {
    const { type, description, severity, fineAmount } = req.body;

    // Push violation into priority queue based on severity
    const violation = { type, description, severity, fineAmount, timestamp: new Date() };
    violationsQueue.push(violation);
    violationsQueue.sort((a, b) => b.severity - a.severity);

    // Push violation to history stack
    historyStack.push(violation);
    const invoice = {
        invoiceId: generateInvoiceId(),
        type,
        description,
        fineAmount,
        issuedAt: new Date(),
    };
    invoices.push(invoice);

    // Save data
    writeToFile(finesPath, violationsQueue);
    writeToFile(historyPath, historyStack);
    writeToFile(invoicesPath, invoices);
    res.status(201).json({ message: 'Violation added successfully.', violation,invoice });
};
const getInvoices = (req, res) => {
    const allInvoices = readFromFile(invoicesPath);
    res.status(200).json({ invoices: allInvoices });
};
// Process the next violation
const processViolation = (req, res) => {
    if (violationsQueue.length === 0) {
        return res.status(400).json({ message: 'No violations to process.' });
    }

    const processedViolation = violationsQueue.shift();
    writeToFile(finesPath, violationsQueue);

    res.status(200).json({ message: 'Violation processed.', processedViolation });
};

// Undo last violation
const undoViolation = (req, res) => {
    if (historyStack.length === 0) {
        return res.status(400).json({ message: 'No history to undo.' });
    }

    const undoneViolation = historyStack.pop();
    violationsQueue.push(undoneViolation);
    violationsQueue.sort((a, b) => b.severity - a.severity);

    writeToFile(finesPath, violationsQueue);
    writeToFile(historyPath, historyStack);

    res.status(200).json({ message: 'Last violation undone.', undoneViolation });
};
const generateReport = (req, res) => {
    try {
        // Read existing violations
        const violations = JSON.parse(fs.readFileSync(violationsPath, 'utf8'));

        // Create a report object
        const report = {
            date: new Date().toISOString(),
            totalViolations: violations.length,
            violations,
        };

        // Ensure the reports directory exists
        if (!fs.existsSync(reportsPath)) {
            fs.mkdirSync(reportsPath);
        }

        // Save report as JSON file
        const reportFile = path.join(reportsPath, `daily_report_${Date.now()}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        res.status(200).json({ message: 'Report generated successfully.', filePath: reportFile });
    } catch (err) {
        console.error('Error generating report:', err);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};



// Get all violations
const getViolations = (req, res) => {
    res.status(200).json({ violationsQueue });
};

module.exports = {
    addViolation,
    processViolation,
    undoViolation,
    generateReport,
    getViolations,
    getInvoices,

};
