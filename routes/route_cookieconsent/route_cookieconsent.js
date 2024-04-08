const express = require('express');
const router = express.Router();

const cookie_consent = require('../../controllers/controller_cookieconsent/controller_cookie_consent');
router.post('/api/send_cookieTypes', cookie_consent.send_type);
module.exports = router;