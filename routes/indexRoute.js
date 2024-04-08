const express = require("express");
const router = express.Router();

const indexController = require('../controllers/indexController');


//เอกสาร Policy
router.get('/index', indexController.doc_list);
router.post('/SearchPolicy/', indexController.doc_list_find);
router.get('/show_slide/:id', indexController.show_slide);
router.get('/api_link/:id', indexController.api_link);
router.get('/api_support/:id', indexController.api_support);

router.get('/api_paperconsent/:id', indexController.api_paperconsent);
router.get('/api_paperslide/:id', indexController.api_paperslide);
router.post('/get_paperconsent', indexController.get_paperconsent);
router.get('/api_paper/:id', indexController.api_paper);

router.post('/sent_mail', indexController.sent_mail);
router.get('/approve_doc/:id', indexController.approve_doc);
router.post('/confirm_approve', indexController.confirm_approve);
router.get('/unapprove_doc/:id', indexController.unapprove_doc);
router.post('/confirm_unapprove', indexController.confirm_unapprove);
router.post('/copydoc_save', indexController.copydoc_save);
router.get('/print_doc_policy/:id', indexController.print_doc);
router.post('/save_doc_consent', indexController.save_doc_consent);
router.post('/update_doc_consent', indexController.update_doc_consent);


//Paper Consent
router.get('/paper_consent_show', indexController.paper_consent_show);
router.get('/paper_consent_thank', indexController.paper_consent_thank);
router.post('/paper_consent_add', indexController.paper_consent_add);

//ประเภทของเอกสาร 
router.get('/doc_type', indexController.doc_type);
router.post('/doc_type', indexController.doc_type_find);
router.post('/save_doc_type', indexController.save_doc_type);
router.post('/update_doc_type', indexController.update_doc_type);
router.post('/delete_doc_type', indexController.delete_doc_type);



//คำใช้บ่อย
router.get('/words', indexController.words);
router.post('/new_word', indexController.new_word);
router.post('/updateword/:id', indexController.updateword);
router.post('/deleteword/:id', indexController.deleteword);


//หน้ากระดาษ
router.post('/paper', indexController.savedoc);

router.get('/paper/:id', indexController.paper);
router.get('/createpaper/:id', indexController.createpaper);
router.get('/editpaper/:id', indexController.editpaper);
router.post('/updatepaper/:id', indexController.updatepaper);
router.get('/deletepaper/:id', indexController.deletepaper);

// เอกสาร
router.post('/updatedoc', indexController.updatedoc);
router.post('/deletedoc', indexController.deletedoc);

// consent
router.get('/paper_consent/:id', indexController.paper_consent);
router.get('/editpaper_consent/:id', indexController.editpaper_consent);
router.post('/updatepaper_consent/:id', indexController.updatepaper_consent);
router.get('/deletepaper_consent/:id', indexController.deletepaper_consent);

// ประเภทของข้อมูลส่วนบุคคล
router.get('/data_type', indexController.data_type);
router.post('/data_type', indexController.data_type_find);
router.get('/new_data_type', indexController.new_data_type);
router.post('/save_data_type', indexController.save_data_type);
router.post('/update_data_type', indexController.update_data_type);
router.post('/delete_data_type', indexController.delete_data_type);

//ระดับข้อมูลส่วนบุคคล
router.get('/level_type', indexController.level_type);
router.post('/level_type', indexController.level_type_find);
router.get('/new_level', indexController.new_level);
router.post('/save_level', indexController.save_level);
router.post('/update_level', indexController.update_level);
router.post('/delete_level', indexController.delete_level);

//ข้อมูลส่วนบุคคล
router.get('/personal_data', indexController.personal_data);
router.post('/personal_data', indexController.personal_data_find);
router.post('/personal_data0', indexController.personal_data_find0);
router.get('/new_personal', indexController.new_personal);
router.post('/save_personal', indexController.save_personal);
router.get('/file_personal/:id', indexController.file_personal);
router.get('/edit_personal/:id', indexController.edit_personal);
router.post('/update_personal/:id', indexController.update_personal);
router.post('/delete_personal', indexController.delete_personal);

//tag
router.post('/docsaveTag', indexController.docsaveTag);

// ตั้งค่าระบบ 
router.get('/system_setting', indexController.system_setting)

//ระบบสมาชิก
router.get('/membership', indexController.membership);

//เอกสาร Policy
router.get('/protect_policy', indexController.protect_policy)
router.get('/publish_policy', indexController.publish_policy)
router.get('/test_policy', indexController.test_policy)
router.get('/share_policy', indexController.share_policy)

//จอภาพตรวจสอบ (Monitoring)
router.get('/monitoring', indexController.monitoring);

//Data_Protect
router.get('/data_gateway', indexController.data_gateway);

// ลบแท็ก
router.post('/delete_tage', indexController.delete_tage);


module.exports = router;