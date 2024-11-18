const fs = require('fs');
const path = require('path');
const invoicesPath = path.join(__dirname, '../data/invoices.json');
// Path to JSON files
const finesPath = path.join(__dirname, '../data/fines.json');
const historyPath = path.join(__dirname, '../data/history.json');

// Priority queue for violations
let violationsQueue = [];
let invoices = readFromFile(invoicesPath);
// Stack for violation history
let historyStack = [];

// Read and Write Helpers
const writeToFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};
    function readFromFile(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error('Error reading file:', err);
            return [];
        }
    }
// Load existing data
violationsQueue = readFromFile(finesPath);
historyStack = readFromFile(historyPath);

module.exports = {
    violationsQueue,
    historyStack,
    invoices,
    writeToFile,
    readFromFile,
    finesPath,
    historyPath,
    invoicesPath,
};
