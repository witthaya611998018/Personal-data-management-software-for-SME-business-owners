const express = require('express');
const router = express.Router();
const importdata_controllers = require('../controllers/importdata_controllers');
const validator = require('../controllers/validator');


router.get('/import', importdata_controllers.list);
router.post('/import_file', importdata_controllers.import_file);
router.get('/views_import/:id', importdata_controllers.views_import);
router.post('/createftp', importdata_controllers.create);
router.post('/deleteftp/:id', importdata_controllers.deleteftp);
router.get('/alert', importdata_controllers.alert);
router.post('/createalert', importdata_controllers.createalert);
router.post('/updatealert/:id', importdata_controllers.updatealert);
router.post('/dellert', importdata_controllers.dellert);

module.exports = router;