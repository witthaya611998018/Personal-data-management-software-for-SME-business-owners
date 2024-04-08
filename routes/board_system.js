const express = require('express');
const router = express.Router();
const board_system_controllers = require('../controllers/board_system_controllers');

const validator = require('../controllers/validator');

router.get('/monitor', board_system_controllers.monitor);

//favorite
router.get('/favorite', board_system_controllers.favorite);

//compair
router.get('/compare', board_system_controllers.compare);


//watchdog
router.get('/watchdog', board_system_controllers.watchdog);
router.post('/watchdog/add', board_system_controllers.addwatchdog);
router.get('/delwatch/:wd_id', board_system_controllers.delwatch);
router.post('/watchdog/edit', board_system_controllers.editwatchdog);


//watchdog
router.get('/datain', board_system_controllers.datain);

//watchdog
router.get('/pagedataout', board_system_controllers.dataout);


router.post('/up', board_system_controllers.up);

router.get('/log_chart_1', board_system_controllers.log_chart_1);

router.get('/data_compare/:id', board_system_controllers.data_compare);

router.get('/datain_1/:id', board_system_controllers.datain_1);

router.get('/exportdata', board_system_controllers.exportdata);

router.get('/exportdata_out', board_system_controllers.exportdata_out);
router.get('/user_activity', board_system_controllers.user_activity);
router.get('/user_activity_data', board_system_controllers.user_activity_data);
router.post('/user_activity_data_view', board_system_controllers.user_activity_data_view);

router.post('/user_activity_date', board_system_controllers.user_activity_date);

//router.get('/change', account_controllers.pw_change);
module.exports = router;