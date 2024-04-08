const express = require('express');
const session = require("express-session");
const router = express.Router();

const report_appeal = require('../../controllers/controller_report/controller_report_appeal');
const funchistory = require('../../controllers/account_controllers')


router.get('/report/appeal', function (req, res) {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "report", `เข้าสู่เมนู รายงาน รับเรื่องร้องเรียน`, req.session.userid)
            res.render('./cookie/view_report/report_appeal', {
                session: req.session
            });
        });
    } else {
        res.redirect("/");
    }
});

// AJAX
router.get('/api/report/appeal', report_appeal.api_report_appeal);

router.post('/api/report/appeal/search_text', report_appeal.api_report_appeal_search_text);
router.post('/api/report/appeal/search_date', report_appeal.api_report_appeal_search_date);


module.exports = router;