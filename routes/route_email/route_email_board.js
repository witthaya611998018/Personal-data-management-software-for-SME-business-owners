const express = require('express');
const router = express.Router();
const EmailBoadConterller = require('../../controllers/controller_email/controller_email_board');

//  render 
router.get('/email-board/view-information/:id', EmailBoadConterller.ViewInformation); // ดูข้อมูล
router.get('/email-board', EmailBoadConterller.EmailBoard); // render หน้า  การส่งข้อมูลไปยังคณะกรรมการ
router.get('/inbox-email-board', EmailBoadConterller.InboxEmailBoard); // render หน้า เขียน mail
router.get('/default-messgaes', EmailBoadConterller.DefaultMessageRender); // render หน้า เขียน mail


// SaveData บันทึกข้อมูล
router.post('/send-email-board', EmailBoadConterller.SendMail);
router.post('/default-messgaes/add', EmailBoadConterller.DefaultMessageAdd);

//  API [ดึงข้อมูล,บันทึก]
router.get('/api/email-board', EmailBoadConterller.ApiEmailBoard); // ดึงข้อมูลมา show หน้า การส่งข้อมูลไปยังคณะกรรมการ
router.get('/api/resend-mail-board/:id', EmailBoadConterller.ResendMail); // ResendMail
router.get('/api/email-board/getData/:text', EmailBoadConterller.PrintEnvelopesAndDefaultMessage);  //พิมพ์ศองจดหมาย
router.get('/api/email-inbox-board/policy', EmailBoadConterller.ApiPolicy); // ปิดใว้ก่อนเพราะตัวนี้คือตัวเลือกเสารเเบบ muti
// router.post('/api/email-inbox-board/policy', EmailBoadConterller.ApiPolicy);



// API Search
router.post('/api/email-board/search/text', EmailBoadConterller.SearchText);
router.post('/api/email-board/search/date', EmailBoadConterller.SearchDate);

// การตอกลับ email 
router.get('/agree-email-board/:id', EmailBoadConterller.Agree);  //กลับตอบอีเมล ยินยอม
router.get('/notagree-email-board/:id', EmailBoadConterller.NotAgree); //กลับตอบอีเมล ไม่ยินยอม
router.get('/notagree-email-confirm-board/:id', EmailBoadConterller.ConfirmNotAgree); // ยืนยันการปฏิเสธ 


// router.get('/agree-email-board/:id', EmailBoadConterller.agree);  //กลับตอบอีเมลเเบบยินยอม
// router.get('/notagree-email-board', EmailBoadConterller.not_agree); //กลับตอบอีเมลเเบบไม่ยินยอม
// router.get('/notagree-email-board/:id', EmailBoadConterller.not_agree_csv); //กลับตอบอีเมลเเบบไม่ยินยอม




module.exports = router;