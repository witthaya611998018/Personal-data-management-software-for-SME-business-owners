const express = require('express');
const router = express.Router();

const report_pattern = require('../../controllers/controller_report/controller_report_pattern');
router.get('/report/pattern', report_pattern.report_pattern);
router.get('/api/report/pattern', report_pattern.api_pattern);
// Search
router.post('/api/search/report/pattern', report_pattern.api_search_pattern_text)
router.post('/api/report/pattern/search_date', report_pattern.api_search_pattern_date);
module.exports = router;