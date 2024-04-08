const express = require('express');
const router = express.Router();

const dialog = require('../../controllers/controller_cookie_managemet/controller_cookie_managemet');

const Tag = require('../../controllers/controller_tag/controller_tag');
router.get('/management/script_banner/:id', dialog.script_banner);

router.post('/saveTag', Tag.saveTag);
router.get('/deleteTag/:id', Tag.deleteTag);
router.post('/editTag', Tag.editTag);
router.get('/api/get/Tag', Tag.api_tag);
router.post('/api/get/Tag_search', Tag.api_tag_search);
router.get('/dialogs/:id', dialog.dialogs);
router.get('/management/cookies', dialog.management_cookies);
router.get('/api/cookie_management', dialog.api_cookie);
router.get('/api/group_domain/:id/:id_d', dialog.group_domain); // เพิ่ม tag ใส่โดเมน
router.post('/Savedialogs', dialog.Save);
router.get('/cookie_policy', dialog.policy);
router.get('/ApiCookie', dialog.ApiCookie);
router.post('/api/cookies/search/text', dialog.SearchCookie);



module.exports = router;