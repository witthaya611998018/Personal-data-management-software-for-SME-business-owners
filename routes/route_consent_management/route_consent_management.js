const express = require('express');
const session = require("express-session");
const router = express.Router();
const consent_management = require('../../controllers/controller_consent_management/controller_consent_management');
const funchistory = require('../../controllers/account_controllers')

// router.get('/consent/management', consent_management.consent_management);

router.get('/consent/management/:tap', function (req, res) {
    if (typeof req.session.userid != "undefined") {
        var tap = "";
        if (req.params.tap == "cookie") {
            tap = "cookie"
        } else if (req.params.tap == "paper") {
            tap = "paper"
        } else {
            tap = "email"
        }
        funchistory.funchistory(req, "Consent Management", `เข้าสู่เมนู Consent Management`, req.session.userid)
        res.render("cookie/view_consent_management/consent_management", {
            tap,
            session: req.session,
        });
    } else {
        res.redirect("/");
    }
});
router.get('/consent/management/cookie/:id', consent_management.consent_management_cookies);
router.post('/consent/management/cookie/save', consent_management.save_cookie);
//  API E-mail
router.post('/api/all/consent/management', consent_management.allConsent);
// router.post('/api/email/consent/management/search', consent_management.search_email);
router.post('/api/email/consent/management/edit', consent_management.edit_email);
router.post('/api/email/consent/management/search/date', consent_management.email_search_date);
router.post('/api/email/consent/management/search/text', consent_management.email_search_text);
router.post('/api/all/consent/management/reface_email', consent_management.reface_email);
//  API  Paper 
router.post('/api/paper/consent/management/edit', consent_management.edit_paper);
router.post('/api/paper/consent/management/search/text', consent_management.paper_search_text);
router.post('/api/paper/consent/management/search/date', consent_management.paper_search_date);
//  API  Cookie 
router.post('/api/cookie/consent/management/search/text', consent_management.cookie_search_text);
router.post('/api/cookie/consent/management/search/date', consent_management.cookie_search_date);


module.exports = router;