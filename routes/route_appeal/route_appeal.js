const express = require('express');
const router = express.Router();

const appeals = require('../../controllers/controller_appeal/controller_appeal');
// route ห้ามเอาชื่อ route ที่เหมือนกัน
router.get('/appeal/add', appeals.appeal_add);
router.get('/appeal', appeals.appeal);
router.get('/appreal_information/:id', appeals.appreal_information);
router.get('/appeal/mail/:id', appeals.appeal_mail);

router.post('/update/approve/', appeals.aprrove);
router.post('/update/deny/', appeals.deny);
// router.post('/save/appeal', appeals.save);
router.post('/save/appeal', appeals.save);
router.get('/api/get/appeal', appeals.api_appeal);
//ค้นหา
router.post('/api/get/appeal/search', appeals.api_appeal_text);
// router.post('/api/get/appeal/date', appeals.api_appeal_date);
// ค้นหาข้อมูลจากข้อมูลส่วนบุคคลทั้งหมด
router.post('/api/get/personal_data/search', appeals.api_personal_data_search);


module.exports = router;