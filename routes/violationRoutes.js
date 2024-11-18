const express = require('express');
const {
    addViolation,
    processViolation,
    undoViolation,
    generateReport,
    getViolations,
    getInvoices,
} = require('../controllers/violationController');

const router = express.Router();

// Routes
router.post('/add', addViolation);
router.post('/process', processViolation);
router.post('/undo', undoViolation);
router.get('/report', generateReport);
router.get('/all', getViolations);
router.get('/invoices', getInvoices);
module.exports = router;
