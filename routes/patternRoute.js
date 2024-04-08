const express = require('express');
const router = express.Router();

const patternController = require('../controllers/patternController');
const validator = require('../controllers/validator');

// Index
router.get('/pattern', patternController.indexPattern);
// Send Ajax to function JS
router.post('/pattern', patternController.ajaxIndexPattern);
router.post('/policy', patternController.ajaxIndexPolicy);
router.post('/policy/select-policy', patternController.ajaxSelectedPolicy);
router.post('/policy/get', patternController.ajaxAddPolicy);
router.post('/tag', patternController.ajaxAddTag);
router.post('/processing_base', patternController.ajaxAddProcessingBase);
router.post('/pattern/user', patternController.ajaxAddUser);
router.post('/pattern/select-users', patternController.ajaxSelectedUser);
router.post('/pattern/selectAgent', patternController.ajaxSelectAgent);
router.post('/pattern/getAgent', patternController.ajaxGetAgent);
router.post('/pattern/checkPattern', patternController.ajaxSelectCheckPattern);
router.post('/pattern/del', patternController.ajaxDeletePattern);
// New data
router.get('/pattern/new', patternController.newPattern);
// Add Data
router.post('/pattern/add', patternController.addPattern);
// Detail Page
router.get('/pattern/detail:id', patternController.detailPattern)
// Edit Page
router.get('/pattern/edit:id', patternController.editPattern);
// Update Data
router.post('/pattern/edit:id', patternController.updatePattern);
// Delete Data
router.post('/pattern/delete:id', patternController.deletePattern);
// Statistics (All)
router.get('/pattern/datatype', patternController.datatypePattern);
// Statistics (Disk)
router.get('/pattern/disk', patternController.diskPattern);
// Statistics (Used)
router.get('/pattern/used', patternController.usedPattern);

// list account   ผู้ดูแลข้อมูลหรือผู้ดูแลระบบหรือผู้ควบคุมมาตราการ
router.get('/api/account/list', patternController.accountSupervisor);
// ดึงข้อมูล มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPA กำหนด (PDPA Specific Measures) ( pattern edit )
router.get('/api/patternSpecific:id', patternController.patternSpecific);
// ดึงข้อมูล มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPA กำหนด (PDPA Specific Measures)
router.post('/api/pattern/get/measures/pecific', patternController.fetchSpecific);


router.post('/pattern/get/doc_id_detail', patternController.ajexPatternget_doc_id_detail);

router.post('/pattern/dpo_edit', patternController.dpo_edit);
router.post('/api/pattern/measures/check', patternController.check_measures);






module.exports = router;
