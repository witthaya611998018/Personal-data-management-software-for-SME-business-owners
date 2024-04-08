const express = require('express');
const router = express.Router();
const device_controllers = require('../controllers/device_controllers');
const validator = require('../controllers/validator');
const setting_controllers = require('../controllers/setting_controllers');

router.get('/device/list', device_controllers.list);
router.get('/device/input', device_controllers.input);
router.post('/device/add', device_controllers.add);
router.get('/device/new/:id', device_controllers.new);
router.get('/device/edit/:id', device_controllers.edit);
router.get('/device/view/:id', device_controllers.view);
router.get('/device/block/:id', device_controllers.block);
router.post('/device/blocked/:id', device_controllers.blocked);
router.post('/device/save/:id', device_controllers.save);
router.get('/device/blocklist', device_controllers.blocklist);
router.get('/device/allow/:id', device_controllers.allow);
router.post('/device/delblocked/:id', device_controllers.delblocked);
router.post('/device/confirmdelete/:id', device_controllers.confirmdelete);
router.get('/device/del/:id', device_controllers.delete);
router.post('/ajaxcheckuser', setting_controllers.ajaxcheckuser);

module.exports = router;