const express = require('express');
const router = express.Router();
const views_controllers = require('../controllers/views_controllers');
const validator = require('../controllers/validator');


router.get('/userviews', views_controllers.list);
// router.get('/filelog', views_controllers.filelog);
// router.get('/filelogcheck/:id', views_controllers.filelog);
// router.post('/log/add', views_controllers.add);
// router.post('/log/adduser', views_controllers.adduser);
// router.get('/log/check/:id', views_controllers.check);
// router.get('/log/del/:id', views_controllers.del);
// router.get('/log/del/:id', views_controllers.del);
// router.get('/log/download/:id', views_controllers.download);
// router.post('/log/save/:id', views_controllers.save);
// router.get('/exporthistory', views_controllers.exporthistory);
// router.get('/access_history', views_controllers.access_history);
// router.post('/log/search', views_controllers.search);

module.exports = router;