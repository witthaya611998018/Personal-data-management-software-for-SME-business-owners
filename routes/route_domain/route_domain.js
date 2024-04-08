const express = require('express');
const router = express.Router();

const domain = require('../../controllers/controller_domain/controller_domain');
// const Tag = require('../../controllers/controller_tag/controller_tag');

router.post('/delete', domain.delete);
router.post('/adddomain', domain.adddomain);
router.post('/edit-domain', domain.edit);
router.get('/add/status/domain/:id/:text', domain.add_status_domain); // กำหนด สถานะ

module.exports = router;