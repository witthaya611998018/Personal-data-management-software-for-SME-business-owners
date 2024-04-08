const express = require('express');
const router = express.Router();
// const owner_psersonal = require('../../controllers/controller_email/controller_email_owner_persoanl');
const owner_psersonal = require('../../controllers/controller_email/controller_email_owner_persoanl');

//  render 

router.get('/email-owner-personal', owner_psersonal.email_owner_personal_views); // render 
router.get('/email-owner-personal/inbox', owner_psersonal.inbox); // render  หน้าเขียน emial 
router.get('/default-messgaes-personal', owner_psersonal.DefaultMessageRender); // render หน้า ข้อความเริ่มต้น


// AJAX
router.get('/api/email-owner-personal/inbox/infraction/:id', owner_psersonal.ApiInfraction); // ดึงข้อมูล ข้อมูลการแจ้งละเมิด ประเมินมีความเสี่ยงสูงที่ยังไม่ส่งเจ้าชองข้อมูลส่วนบุคค
router.get('/api/email-owner-personal/list', owner_psersonal.ApiEmail_list); // ดึงข้อมูล email มาเเสดง
router.post('/api/email-owner-personal/search/text', owner_psersonal.search); // ค้นหา
router.get('/api/resend-email-owner-personal/:id', owner_psersonal.ResendMail); // ResendMail


//  POST 
router.post('/email-owner-personal/send-mail', owner_psersonal.SendMail);  // ส่ง email 



module.exports = router;
