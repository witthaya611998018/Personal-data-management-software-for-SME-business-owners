const express = require('express');
const router = express.Router();

const report_policy = require('../../controllers/controller_report/controller_report_policy');
router.get('/report/policy', report_policy.report_policy);
router.get('/api/report/policy', report_policy.api_policy);
// Search
router.post('/api/search/report/policy', report_policy.api_search_policy_text)
router.post('/api/report/policy/search_date', report_policy.api_search_policy_date);
module.exports = router;