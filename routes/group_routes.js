const express = require('express');
const router = express.Router();
const group_controllers = require('../controllers/group_controllers');
const validator = require('../controllers/validator');


router.get('/group/list', group_controllers.list);
router.get('/group/new/:id', group_controllers.new);
router.post('/group/add', group_controllers.add);
router.post('/group/adduser', group_controllers.adduser);
router.get('/group/check/:id', group_controllers.check);

module.exports = router;