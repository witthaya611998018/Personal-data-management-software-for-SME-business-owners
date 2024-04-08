const express = require("express");
const router = express.Router();
const funchistory = require('../../controllers/account_controllers');
const activity = require('../../controllers/controller_policy/controller_activity_ropa');

router.get('/activity-ropa/:name', function (req, res) {
    if (typeof req.session.userid != "undefined") {
        let types = req.params.name
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "การบันทึกรายการกิจกรรม (RoPA)", `เข้าสู่เมนู การบันทึกรายการกิจกรรม (RoPA)`, req.session.userid)
            req.session.ropa = types
            res.render("policy/activity_ropa", {
                session: req.session,
            });
        });
    } else {
        res.redirect("/");
    }
});

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

router.get('/api/activity-ropa/list', activity.ActivityRopaList);
router.post('/api/activity-ropa/search-type-user', activity.ActivityRopaSearchTypeUser);
router.post('/api/activity-ropa/search-classifi', activity.ActivityRopaSearchClassifi);

router.post('/api/activity-ropa/search-data-controller', activity.ActivityRopaSearchDataController);

router.post('/api/activity-ropa/send-mail', activity.ActivityRopaSearchDataControllerSendMail);

router.post('/activity-ropa/update', activity.ActivityRopaUpdate);



// //  Save,Delete,edit
// router.post('/announce-policy/add', Announce.AnnouncePolicyAdd);
// router.post('/announce-policy/deleted', Announce.AnnouncePolicyDeleted);
// router.post('/announce-policy/update', Announce.AnnouncePolicyUpdate);
// // Get Data
// router.get('/api/get-data/announce-policy', Announce.AnnouncePolicylist);
// router.post('/api/announce-policy/send-mail', Announce.AnnouncePolicySendMail);
// // ค้นหา ประเภทเอกสาร
// router.post('/api/announce-policy/search-type', Announce.AnnouncePolicySearchType);





module.exports = router;