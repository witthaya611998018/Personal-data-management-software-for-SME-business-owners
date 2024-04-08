const express = require('express');
const router = express.Router();

const report_papercopnsent = require('../../controllers/controller_report/controller_report_paperconsent');
const funchistory = require('../../controllers/account_controllers')

router.get('/report/paperconsent', function (req, res) {
    if (typeof req.session.userid != "undefined") {
        funchistory.funchistory(req, "report", `เข้าสู่เมนู รายงาน Paper Consent`, req.session.userid)
        res.render("cookie/view_report/report_paperconsent", {
            session: req.session,
        });
    } else {
        res.redirect("/");
    }
});
router.get('/api/report/paperconsent', report_papercopnsent.api_report_paperconsent);
router.post('/api/report/paperconsent/search_date', report_papercopnsent.api_report_paperconsent_search_date);
router.post('/api/report/paperconsent/search_text', report_papercopnsent.api_report_paperconsent_search_text);


module.exports = router;