const express = require('express');
const router = express.Router();
const funchistory = require('../../controllers/account_controllers')

const appeals_infraction = require('../../controllers/controller_appeal/controller_appeal_infraction');

router.get('/api/appeal/infraction/list', appeals_infraction.infraction_list);
router.get('/appeal/infraction/list', function (req, res) {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "รับเรื่องร้องเรียน การละเมิด", `เข้าสู่เมนู รับเรื่องร้องเรียน การละเมิด`, req.session.userid)
            res.render('./appeal_infraction/appeal_infraction_list', {
                session: req.session
            });
        });
    } else {
        res.redirect("/");
    }
});







router.get('/appeal/infraction/add', appeals_infraction.appeal_view_add);
router.get('/api/appeal/infraction/get_data', appeals_infraction.get_data);
router.get('/appeal/infraction/edit/:id', appeals_infraction.infraction_view_edit);
router.post('/appeal/infraction/edit/save', appeals_infraction.infraction_save_edit);



router.post('/appeal/infraction/add/save', appeals_infraction.save);
router.get('/appeal/infraction/detail/:id', appeals_infraction.infraction_detail);
router.post('/appeal/infraction/add/type/save', appeals_infraction.type_save);
//  ค้นหา
router.post('/api/appeal/infraction/search', appeals_infraction.search);





// จัดการประเภทการละเมิด
router.get('/appeal/infraction/manage/type', function (req, res) {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "จัดการประเภทการละเมิด", `เข้าสู่เมนู จัดการประเภทการละเมิด`, req.session.userid)
            res.render('./appeal_infraction/appeal_infraction_manage_type', {
                session: req.session
                ,
                data:0
            });
        });
    } else {
        res.redirect("/");
    }
});
router.get('/appeal/infraction/manage/type1', function (req, res) {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "จัดการประเภทการละเมิด", `เข้าสู่เมนู จัดการประเภทการละเมิด`, req.session.userid)
            res.render('./appeal_infraction/appeal_infraction_manage_type1', {
                session: req.session,
                data:1
            });
        });
    } else {
        res.redirect("/");
    }
});
router.get('/appeal/infraction/manage/type2', function (req, res) {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "จัดการประเภทการละเมิด", `เข้าสู่เมนู จัดการประเภทการละเมิด`, req.session.userid)
            res.render('./appeal_infraction/appeal_infraction_manage_type2', {
                session: req.session,
                data:2
            });
        });
    } else {
        res.redirect("/");
    }
});
router.get('/appeal/infraction/manage/type3', function (req, res) {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "จัดการประเภทการละเมิด", `เข้าสู่เมนู จัดการประเภทการละเมิด`, req.session.userid)
            res.render('./appeal_infraction/appeal_infraction_manage_type3', {
                session: req.session,
                data:3
            });
        });
    } else {
        res.redirect("/");
    }
});
router.get('/appeal/infraction/manage/type4', function (req, res) {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "จัดการประเภทการละเมิด", `เข้าสู่เมนู จัดการประเภทการละเมิด`, req.session.userid)
            res.render('./appeal_infraction/appeal_infraction_manage_type4', {
                session: req.session,
                data:4
            });
        });
    } else {
        res.redirect("/");
    }
});


router.get('/api/appeal/infraction/manage/type/list', appeals_infraction.infraction_manage_list);
router.get('/api/appeal/infraction/manage/type/list2/:type', appeals_infraction.infraction_manage_list2);

router.post('/api/appeal/infraction/manage/type/search', appeals_infraction.manage_type_search);
router.post('/appeal/infraction/manage/type/edit/save', appeals_infraction.edit_save);

router.post('/appeal/infraction/manage/type/del', appeals_infraction.del);
router.get('/appeal/infraction/manage/type/get/:type/:text', appeals_infraction.manage_type_getsearch);




module.exports = router;