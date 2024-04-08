const express = require('express');
const router = express.Router();

const report_cookieconsent = require('../../controllers/controller_report/controller_report_cookieconsent');
router.get('/report/cookieconsent', report_cookieconsent.report_cookieconsent);
router.get('/api/report/cookiesconsent', report_cookieconsent.api_cookiesconsent);
// Search
router.post('/api/search/report/cookiesconsent', report_cookieconsent.api_search_cookiesconsent_text)
router.post('/api/report/cookieconsent/search_date', report_cookieconsent.api_search_cookiesconsent_date);
module.exports = router;