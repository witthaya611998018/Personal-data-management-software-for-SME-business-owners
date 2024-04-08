const express = require('express');
const router = express.Router();

const report_classification = require('../../controllers/controller_report/controller_report_classification');
router.get('/report/classification', report_classification.report_classification);
router.get('/api/report/classification', report_classification.api_classification);
// Search
router.post('/api/search/report/classification', report_classification.api_search_classification_text)
router.post('/api/report/classification/search_date', report_classification.api_search_classification_date);
module.exports = router;