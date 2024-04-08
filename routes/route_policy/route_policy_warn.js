const express = require("express");
const router = express.Router();

const funchistory = require('../../controllers/account_controllers');
const Warn = require('../../controllers/controller_policy/controller_policy_warn');

// router.get('/warn-policy', function (req, res) {
//     if (typeof req.session.userid != "undefined") {
//         req.getConnection((err, conn) => {
//             conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE;", (err, doc_type) => {
//                 funchistory.funchistory(req, "ประกาศนโยบาย/เเจ้งเตือน", `เข้าสู่เมนู การแจ้งเตือนทางอิเล็คทรอนิค`, req.session.userid)
//                 res.render("policy/warn/warn_policy", {
//                     doc_type,
//                     session: req.session,
//                 });
//             });
//         });
//     } else {
//         res.redirect("/");
//     }
// });
router.get('/Warn-policy', Warn.WarnPolicy);

//  Save,Delete,edit
router.post('/Warn-policy/add', Warn.WarnPolicyAdd);
router.post('/Warn-policy/deleted', Warn.WarnPolicyDeleted);
router.post('/Warn-policy/update', Warn.WarnPolicyUpdate);
router.post('/Warn-policy/copy', Warn.WarnPolicyCopy);

router.get('/api/get-data/warn-policy', Warn.WarnPolicylist); // Get Data
router.post('/api/warn-policy/send-mail', Warn.WarnPolicySendMail); // send mail

// ค้นหา ประเภทเอกสาร
router.post('/api/warn-policy/search-type', Warn.WarnPolicySearchType);
// ค้นหา ขื่อเอกสาร
router.post('/api/warn-policy/search-policy-name', Warn.WarnPolicySearchPolicyName);


module.exports = router;