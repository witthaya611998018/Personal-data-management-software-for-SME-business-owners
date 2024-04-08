const express = require('express');
const router = express.Router();

const report_emailconsent = require('../../controllers/controller_report/controller_report_emailconsent');
router.get('/report/emailconsent', report_emailconsent.report_emailconsent);
// api get data
router.get('/api/report/emailconsent', report_emailconsent.api_report_emailconsent);
// router.post('/api_report_emailconsent_search', report_emailconsent.api_report_emailconsent_search);

// email
router.post('/api/report/emailconsent/search_date', report_emailconsent.api_report_emailconsent_search_date);
router.post('/api/report/emailconsent/search_text', report_emailconsent.api_report_emailconsent_search_text);




module.exports = router;