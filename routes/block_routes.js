const express = require('express');
const router = express.Router();
const block_controllers = require('../controllers/block_controllers');
const validator = require('../controllers/validator');

router.get('/micro_block', block_controllers.list);
// Send to Ajax
router.post('/micro_block?', block_controllers.list1);
router.get('/micro_block/:name', block_controllers.select);

module.exports = router;