const express = require('express');
const router = express.Router();
const funchistory = require('../../controllers/account_controllers')
const security_section = require('../../controllers/controller_security_section/controller_security_section')


router.get('/security/section/:tap', function (req, res) {
    if (typeof req.session.userid != "undefined") {
        var tap = "";
        if (req.params.tap == "General-Measures") {
            tap = "General-Measures"
        } else if (req.params.tap == "Risk-based-Approach") {
            tap = "Risk-based-Approach"
        } else {
            tap = "Specific-Measures"
        }
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "มาตรการรักษาความปลอดภัย", `เข้าสู่เมนู มาตรการรักษาความปลอดภัย`, req.session.userid)
            res.render('./security_section/security_section_list', {
                tap,
                session: req.session
            });
        });
    } else {
        res.redirect(`/`);
    }
});

router.get('/security/section/:tap/add', function (req, res) {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            conn.query("SELECT TB_TR_ACCOUNT.acc_id,TB_TR_ACCOUNT.firstname,TB_TR_ACCOUNT.lastname FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5)", (err, account) => {

            if (req.params.tap == "General-Measures") {
                funchistory.funchistory(req, "มาตรการรักษาความปลอดภัย", `เข้าสู่เมนู มาตรการรักษาความปลอดภัย`, req.session.userid)
                res.render('./security_section/general_measures_add', {
                    account:account,
                    session: req.session
                });
            } else if (req.params.tap == "Risk-based-Approach") {
                funchistory.funchistory(req, "มาตรการรักษาความปลอดภัย", `เข้าสู่เมนู มาตรการรักษาความปลอดภัย`, req.session.userid)
                res.render('./security_section/risk_based_approach_add', {
                    account:account,
                    session: req.session
                });
            } else {
                funchistory.funchistory(req, "มาตรการรักษาความปลอดภัย", `เข้าสู่เมนู มาตรการรักษาความปลอดภัย`, req.session.userid)
                res.render('./security_section/pdpa_specific_measures_add', {
                    account:account,
                    session: req.session
                });
            }
        });
    });
    } else {
        res.redirect(`/`);
    }
});


// ถูกเรียกใช้งานใน pattern 
router.get('/api/security/section/pattern/specific', security_section.section_specific); // ดึงข้อมุล  มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPA กำหนด (PDPA Specific Measures)
// router.get('/api/security/section/pattern/specific/search', security_section.section_specific_search); // ค้นหา  มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPA กำหนด (PDPA Specific Measures)


//      API 
router.get('/api/measures/doc/list', security_section.list_measure_doc); // ดึงข้อมุล  ชื่อมาตรการ เเละ เอกสาร pdpa
router.get('/api/security/section/list', security_section.security_section_list); // ดึงข้อมุล  ชื่อมาตรการ เเละ เอกสาร pdpa



//  POST
router.post('/General-Measures/save', security_section.save); // เพิ่มมาตรการรักษาความปลอดภัย
router.post('/General-Measures/add_title', security_section.add_title); // เพิ่มหัวเรื่อง
router.post('/General-Measures/edit_title', security_section.edit_title); // เเก้ไขหัวเรื่อง

router.get('/General-Measures/details/:id', security_section.General_Measures_Details); // ดูรายละเอียดมาตรการรักษาความปลอดภัย
router.post('/General-Measures/edit/save', security_section.General_Measures_Edit_Save); // เเก้ไขมาตรการรักษาความปลอดภัย
// GET 
router.get('/General-Measures/edit/:id', security_section.General_Measures_Edit_View); // เพิ่มหัวเรื่อง


//  Risk-based-Approach

// POST
router.post('/Risk-based-Approach/add', security_section.Risk_based_Approach_LevelUp_Measures_Add); // เพิ่มระดับชั้น,เพิ่มมาตรการป้องกัน 
router.post('/Risk-based-Approach/edit/save', security_section.Risk_based_Approach_Edit_Save); // เเเก้ไข  มาตรการรักษาความมั่นคงปลอดภัยเกี่ยวกับทรัพย์สินสารสนเทศ (Information assets)

// GET 
router.get('/Risk-based-Approach/details/:id', security_section.Risk_based_Approach_Details); // ดูรายละเอียด มาตรการรักษาความมั่นคงปลอดภัยเกี่ยวกับทรัพย์สินสารสนเทศ (Information assets)
router.get('/Risk-based-Approach/edit/:id', security_section.Risk_based_Approach_Edit_View); // เเเก้ไข มาตรการรักษาความมั่นคงปลอดภัยเกี่ยวกับทรัพย์สินสารสนเทศ (Information assets)

//  PDPA Specific Measures

// GET 
router.get('/Specific-Measures/details/:id', security_section.Specific_Measures_Details); // ดูรายละเอียด มาตรการรักษาความปลอดภัย ขั้นต่ำ ที่PDPA กำ หนด (PDPA Specific Measures)
router.get('/Specific-Measures/edit/:id', security_section.Specific_Measures_Edit_View); // เเเก้ไข มาตรการรักษาความปลอดภัย ขั้นต่ำ ที่PDPA กำ หนด (PDPA Specific Measures)

// POST 
router.post('/Specific-Measures/edit/save', security_section.Specific_Measures_Edit_Save); // update มาตรการรักษาความปลอดภัย ขั้นต่ำ ที่PDPA กำ หนด (PDPA Specific Measures)




router.get('/manage/measures/:tap', function (req, res) {
    if (typeof req.session.userid != "undefined") {
        var tap = "";
        if (req.params.tap == "measures_type") {
            tap = "measures_type"
        } else if (req.params.tap == "approach_type") {
            tap = "approach_type"
        } else if (req.params.tap == "assets") {
            tap = "assets"
        }
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "จัดการมาตรการ", `เข้าสู่เมนู จัดการมาตรการ`, req.session.userid)
            res.render('./security_section/manage_measures', {
                tap,
                session: req.session
            });
        });
    } else {
        res.redirect(`/`);
    }
});



//  Manage Measures
// API 
router.get('/api/manage/measures/list', security_section.Manage_Measures_list); // ดึงข้อมุล  จัดการมาตรการ
router.post('/manage/measures/depth/update', security_section.Manage_Measures_Depth_Update); // update  การป้องกันเชิงลึก
router.post('/manage/measures/depth/delete', security_section.Manage_Measures_Depth_Delete); // delete  การป้องกันเชิงลึก

router.post('/manage/measures/update', security_section.Manage_Measures_Update); // update  การป้องกันเชิงลึก
router.post('/manage/measures/delete', security_section.Manage_Measures_Delete); // delete  การป้องกันเชิงลึก


//  information_assets
router.post('/Information/edit/save', security_section.Information_Assets_Edite_Save); // update ทรัพย์สินสารสนเทศ
router.post('/Information/assets/save', security_section.Information_Assets_Save); // เพิ่ม ทรัพย์สินสารสนเทศ
router.post('/Information/assets/delete', security_section.Information_Assets_Delete); // delete  ทรัพย์สินสารสนเทศ (Information assets)

//Delete Measures
router.post('/measures/delete_Measures', security_section.C_Delete_Measures); // delete  
router.post('/measures/delete_approach', security_section.C_Delete_approach); // delete  
router.post('/measures/delete_specific', security_section.C_Delete_specific); // delete 

module.exports = router;
