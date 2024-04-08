const express = require('express');
const router = express.Router();
const setting_controllers = require('../controllers/setting_controllers');
const validator = require('../controllers/validator');


router.post('/network', setting_controllers.network);
router.post('/setting/add', setting_controllers.add);
router.get('/setting', setting_controllers.new);
router.get('/setting/view', setting_controllers.view);
router.post('/settingadd', setting_controllers.settingadd);
router.get('/change', setting_controllers.change);
router.get('/construction', setting_controllers.construction);
router.post('/qr', setting_controllers.qr);
router.post('/changepw', setting_controllers.changepw);
router.post('/checkqr', setting_controllers.checkqr);
router.post('/ajaxcheckuser', setting_controllers.ajaxcheckuser);
router.post('/ajaxchecktheme', setting_controllers.ajaxchecktheme);
router.get('/backup', setting_controllers.backup);
router.get('/backup/download/:id', setting_controllers.download);
router.post('/ajaxbackup', setting_controllers.ajaxbackup);
router.get('/restore', setting_controllers.restore);
router.post('/filerestore', setting_controllers.filerestore);

router.post('/setting/update', setting_controllers.update);

module.exports = router;