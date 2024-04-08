const express = require('express');
const router = express.Router();
const apicheckverify_controllers = require('../controllers/apicheckverify_controllers');

router.get('/apicheckverify/list', apicheckverify_controllers.list);
router.post('/apicheckverify/add', apicheckverify_controllers.add);
router.post('/apicheckverify/changekey', apicheckverify_controllers.changekey);
router.post('/apicheckverify/block', apicheckverify_controllers.block);
// router.post('/apicheckverify/apireq', apicheckverify_controllers.apireq);
router.get('/apicheckverify/guide', apicheckverify_controllers.apiguide);
router.get('/apicheckverify/guideadmin', apicheckverify_controllers.apiguideadmin);
router.get('/apidatainlog/guide', apicheckverify_controllers.apidatainlog);
router.get('/apidatainpdpa/guide', apicheckverify_controllers.apidatainpdpa);

module.exports = router;