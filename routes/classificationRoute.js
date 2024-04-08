const express = require('express');
const router = express.Router();

const classificationController = require('../controllers/classificationController');
const validation = require('../controllers/validator');

// Index
router.get('/classification', classificationController.index);
// Send Ajax
router.post('/classification', classificationController.getIndexClassification);
router.post('/classification_pattern', classificationController.getIndexPattern);
router.post('/pattern/select-pattern', classificationController.selectPattern);
router.post('/event_process', classificationController.addEventProcess);
router.post('/event_process/get', classificationController.selectEventProcess);
router.post('/users', classificationController.addUsers);
router.post('/users/get', classificationController.selectUser);
router.post('/event_process/add', classificationController.InsertEventProcess);
router.post('/classification/selectUsed', classificationController.selectShowClassify);
router.post('/classification/getDel', classificationController.getClassification);
router.post('/classification/listEventProcess', classificationController.listEventProcess);
router.post('/classification/selectEventProcess', classificationController.selectEventProcess1);
// New Classification
router.get('/classification/new', classificationController.newClassification);
// Add Classification
router.post('/classification/add', classificationController.addClassification);
// Detail Classification
router.get('/classification/detail:id', classificationController.detailClassification);
// Eidt Classification
router.get('/classification/edit:id', classificationController.editClassification);
// Update Classification
router.post('/classification/update:id', classificationController.updateClassification);
// Delete Classification
router.post('/classification/delete:id', classificationController.deleteClassification);
// DataFlow
// router.get('/dataFlow',classificationController.dataFlow);
// Search dataflow
// router.post('/dataFlow', classificationController.searchData);
// Preview print dataflow
// router.post('/dataFlow/print', classificationController.printDataflow);
// Event list
router.get('/classification/event', classificationController.eventProcessList);
// Form new event
router.get('/classification/event/new', classificationController.eventProcessNew);
// Insert event
router.post('/classification/event/add', classificationController.eventProcessCreate);
// Form edit event
router.get('/classification/event/edit:id', classificationController.eventProcessEdit);
// Update event
router.post('/classification/event/update:id', classificationController.eventProcessUpdate);
// Delete event
router.post('/classification/event/delete:id', classificationController.eventProcessDelete);



router.post('/classification/get/doc_id_pattern_detail', classificationController.doc_id_pattern_detail);
router.post('/classification/dpo_edit/:id', classificationController.dpo_edit);










const dataflowController = require('../controllers/dataflow/controller_dataflow.js');


router.get('/dataFlow', dataflowController.home);

router.post('/dataFlow2/get/get_search_flow', dataflowController.get_search_flow);

router.get('/dataFlow2/flow_preview_print/:select_policy/:select_pattern/:select_classify/:select_personal_data/:select_users', dataflowController.flow_preview_print);




//   fetch ข้อมูล มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPA กำหนด (PDPA Specific Measures)
router.post('/classification/fetch/specific', classificationController.fetchSpecific);
// fetch ข้อมูลมาตราการตอน เลือก checkbox
router.post('/classification/fetch/specific/search', classificationController.fetchSpecificSearch);

//  หน้าเเก้ไข เลือก pattern ใน classifi เพื่อหา มาตราการ
router.post('/classification/fetch/specific/edit/search', classificationController.fetchSpecificClassificEditSearch);

//   fetch ข้อมูล มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPA กำหนด (PDPA Specific Measures) หน้าเเก้ขไ classifi
router.post('/classification/fetch/specific/edit', classificationController.fetchSpecificEdit);
// fetch ข้อมูลมาตราการตอน เลือก checkbox หน้า เเก้ไข classifi
router.post('/classification/fetch/specific/search/edit', classificationController.fetchSpecificSearchEdit);

module.exports = router;
