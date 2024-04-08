const express = require('express');
const router = express.Router();
const log_controllers = require('../controllers/log_controllers');
const validator = require('../controllers/validator');


router.get('/log', log_controllers.list);
router.post('/log', log_controllers.ajaxlist);
router.get('/filelog', log_controllers.filelog);
router.post('/filelog', log_controllers.ajaxfilelog);
router.get('/filelogcheck/:id', log_controllers.filelog);
router.post('/log/add', log_controllers.add);
router.post('/log/adduser', log_controllers.adduser);
router.get('/log/check/:id', log_controllers.check);
router.post('/log/check/:id', log_controllers.ajaxcheck);
router.get('/log/del/:id', log_controllers.del);
router.get('/log/del/:id', log_controllers.del);
router.get('/log/download/:id', log_controllers.download);
router.post('/log/save/:id', log_controllers.save);
router.get('/exporthistory', log_controllers.exporthistory);
router.post('/exporthistory/search', log_controllers.exporthistorysearch);

router.get('/access_history', log_controllers.access_history);
router.post('/access_history', log_controllers.ajex_access_history);
router.post('/access_history/search', log_controllers.access_historysearch);
router.post('/api/history/search', log_controllers.api_history_search);

router.post('/log/search', log_controllers.search);
router.get('/log/search/:id', log_controllers.ajaxsearch);
router.post('/file/search', log_controllers.filesearch);
router.post('/file/ajaxfilesearch', log_controllers.ajaxfilesearch);
router.post('/filter', log_controllers.filter);
router.post('/ajaxfilter', log_controllers.ajaxfilter);

router.get('/access_compare', log_controllers.access_compare);
router.post('/api/compare/search', log_controllers.api_compare_search);

module.exports = router;