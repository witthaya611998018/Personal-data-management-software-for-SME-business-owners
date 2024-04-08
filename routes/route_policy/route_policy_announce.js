const express = require("express");
const router = express.Router();
const funchistory = require('../../controllers/account_controllers');
const Announce = require('../../controllers/controller_policy/controller_policy_announce');


router.get('/announce-policy', Announce.AnnouncePolicy);

// router.get('/policy/paperpages/:id', function (req, res) {
//     if (typeof req.session.userid != "undefined") {
//         req.getConnection((err, conn) => {
//             //     funchistory.funchistory(req, "ประกาศนโยบาย/เเจ้งเตือน", `เข้าสู่เมนู ประกาศนโยบายทางอิเล็คทรอนิค`, req.session.userid)
//             const { id } = req.params;
//             console.log(id);
//             req.session.doc_id = id;
//             res.render("policy/announce/paper_pages", {
//                 session: req.session
//             });
//         });
//     } else {
//         res.redirect("/");
//     }
// });

router.get('/api/policy/paperpages', Announce.PolicyPaperPages);

//  Save,Delete,edit
router.post('/announce-policy/add', Announce.AnnouncePolicyAdd);
router.post('/announce-policy/deleted', Announce.AnnouncePolicyDeleted);
router.post('/announce-policy/update', Announce.AnnouncePolicyUpdate);
router.post('/announce-policy/copy', Announce.AnnouncePolicyCopy);
// Get Data
router.get('/api/get-data/announce-policy', Announce.AnnouncePolicylist);
router.post('/api/announce-policy/send-mail', Announce.AnnouncePolicySendMail);
// ค้นหา ประเภทเอกสาร
router.post('/api/announce-policy/search-type', Announce.AnnouncePolicySearchType);





module.exports = router;