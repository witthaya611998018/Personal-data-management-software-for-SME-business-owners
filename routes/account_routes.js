const express = require('express');
const router = express.Router();
const account_controllers = require('../controllers/account_controllers');
const setting_controllers = require('../controllers/setting_controllers');
const otp_controllers = require('../controllers/otp_controllers');

const validator = require('../controllers/validator');
const upload = require('express-fileupload')
const multer = require('multer');
const path = require('path');

router.get('/login', account_controllers.login);
router.get('/index2', account_controllers.admin);
router.get('/indexcheck/:date', account_controllers.indexcheck);
router.post('/check', account_controllers.check);
router.get('/account/list', account_controllers.list);
router.get('/account/new', account_controllers.new);
router.post('/account/add', account_controllers.add);
router.post('/account/adduser', account_controllers.adduser);
router.get('/account/delete/:id', account_controllers.delete);
router.get('/account/del/:id', account_controllers.del);
router.get('/account/del/:id', account_controllers.del);
router.get('/account/edit/:id', account_controllers.edit);
router.post('/account/save/:id', account_controllers.save);
router.get('/questionnaire', account_controllers.quest);
router.get('/questionnaire/view', account_controllers.questview);
router.post('/ans', account_controllers.ans);
router.get('/profile', account_controllers.profile);
router.post('/qr', setting_controllers.qr);
//router.get('/change', account_controllers.pw_change);
router.get('/otp', otp_controllers.otp);
router.get('/otp/email', otp_controllers.email);
router.get('/otp/google', otp_controllers.google);
router.post('/verify/email', otp_controllers.verify_email);
router.post('/verify/google', otp_controllers.verify_google);

router.get('/account/new/general/:id', account_controllers.new_general);

module.exports = router;