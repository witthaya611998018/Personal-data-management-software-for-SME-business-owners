const express = require('express');
const router = express.Router();

// const email = require('../../controllers/controller_email/controller_email');
const email = require('../../controllers/controller_email/controller_email');


router.get('/inbox-email', email.Inbox);
router.get('/resend-email/:id', email.resend); // ส่งอีเมลอีกรอบ 

// email
router.post('/send-email', email.send);
// router.post('/send-email', email.send_test);

router.get('/agree-email/:id', email.agree);  //กลับตอบอีเมลเเบบยินยอม
router.get('/notagree-email', email.not_agree); //กลับตอบอีเมลเเบบไม่ยินยอม
router.get('/notagree-email_csv/:id', email.not_agree_csv); //กลับตอบอีเมลเเบบไม่ยินยอม

router.get('/resend-notagree-email/:id', email.resend_not_agree); // กลับตอบอีเมลเเบบไม่ยินยอม (resend)
router.get('/notagree-email-confirm/:id', email.Dont_agree);
router.get('/management/email_consent', email.consent);

router.get('/api/email_consent', email.api_consent);
// router.post('/api/email_consent/search', email.api_consent_search);
router.post('/api/email_consent/search/text', email.api_consent_search_text);
router.get('/management/email_consent/previews/:id', email.previews);
router.post('/api/email_consent/policy', email.api_policy);



module.exports = router;