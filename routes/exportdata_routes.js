const express = require('express');
const router = express.Router();
const export_controllers = require('../controllers/export_controllers');
const validator = require('../controllers/validator');


router.get('/dataout', export_controllers.dataout);
router.get('/sumhost', export_controllers.sumhost);
router.post('/dataoutckeck/:id', export_controllers.dataoutckeck);
router.get('/dataout', export_controllers.dataout);
router.post('/createdataout', export_controllers.createdataout);
router.get('/overall', export_controllers.overall);
router.post('/comparedevice', export_controllers.comparedevice);
router.post('/comparehost', export_controllers.comparehost);
router.post('/deldataout', export_controllers.deldataout);
router.get('/overallmonth', export_controllers.overallmonth);
router.get('/overallseven', export_controllers.overallseven);

module.exports = router;