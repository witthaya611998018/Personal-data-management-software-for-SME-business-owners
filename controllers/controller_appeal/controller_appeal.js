const session = require("express-session");
const fs = require('fs');
const csv = require('csv-parser');
const nodemailer = require('nodemailer');
const funchistory = require('../account_controllers')
const controller = {};
controller.appeal = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        funchistory.funchistory(req, "appeal", `เข้าสู่เมนู รับเรื่องร้องเรียน`, req.session.userid)
        res.render("cookie/view_appeal/appeal", {
            session: req.session,
        });
    } else {
        res.redirect("/");
    }
}

controller.api_appeal = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            conn.query("SELECT classify_name,prefix_name,id_ap,DATE_FORMAT(appeal_date,'%d/%m/%Y %H:%i:%s') appeal_date,DATE_FORMAT(appeal_date_approve,'%d/%m/%Y %H:%i:%s') appeal_date_approve,appeal_firstname,appeal_lastname,appeal_address,appeal_contact,appeal_detail,appeal_share,appeal_approved_complaint FROM  TB_TR_PDPA_APPEAL as app left join TB_MM_PREFIX as pre ON app.prefix_id=pre.prefix_id LEFT JOIN TB_TR_PDPA_CLASSIFICATION AS c ON app.classify_id=c.classify_id WHERE  (DATE_FORMAT(appeal_date,'%Y-%m')=DATE_FORMAT(NOW(),'%Y-%m')) ORDER BY id_ap DESC",
                (err1, pdpa_appeal) => {
                    conn.query("SELECT id_ap,count(appeal_approved_complaint) count_0,DATE_FORMAT(appeal_date,'%d/%m/%Y %H:%i:%s') appeal_date FROM  TB_TR_PDPA_APPEAL where appeal_approved_complaint =0 GROUP BY appeal_date;",
                        (err, count_0) => {
                            conn.query("SELECT id_ap,count(appeal_approved_complaint) count_1,DATE_FORMAT(appeal_date,'%d/%m/%Y %H:%i:%s') appeal_date FROM  TB_TR_PDPA_APPEAL where appeal_approved_complaint =1 GROUP BY appeal_date;",
                                (err, count_1) => {
                                    conn.query("SELECT id_ap,count(appeal_approved_complaint) count_2,DATE_FORMAT(appeal_date,'%d/%m/%Y %H:%i:%s') appeal_date FROM  TB_TR_PDPA_APPEAL where appeal_approved_complaint =2 GROUP BY appeal_date;",
                                        (err, count_2) => {
                                            if (pdpa_appeal.length > 0) {
                                                res.send({ pdpa_appeal, count_0, count_1, count_2 });
                                            } else {
                                                res.send('ไม่มีข้อมูล');
                                            }
                                        });
                                });
                        });
                });
        });
    } else {
        res.redirect("/");
    }
}

controller.appeal_add = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_MM_PREFIX", (err, prefix) => {
                conn.query('SELECT * FROM TB_TR_PDPA_CLASSIFICATION;', (err, classify) => {
                    funchistory.funchistory(req, "appeal", `เข้าสู่เมนู เพิ่มเรื่องร้องเรียน`, req.session.userid)
                    res.render("cookie/view_appeal/appeal_add", {
                        prefix,
                        classify,
                        session: req.session
                    });
                });
            });
        });
    } else {
        res.redirect("/");
    }
}

controller.appeal_mail = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const id = req.params.id;
        var results = [];
        var personal_data = [];
        fs.createReadStream('./dist/file_email_csv/123_Email.csv', 'utf8')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                for (let i = 0; i < results.length; i++) {
                    if (id == results[i].id) {
                        personal_data.push(results[i])
                        break
                    }
                }
                res.render("cookie/view_appeal/appeal_mail", {
                    personal_data,
                    session: req.session
                });
            });
    } else {
        res.redirect("/");
    }
}

controller.appreal_information = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const id = req.params.id;
        req.getConnection((err, conn) => {
            conn.query("SELECT classify_name,appeal_personal_data_id,id_ap,DATE_FORMAT(appeal_date,'%d/%m/%Y %H:%i:%s') appeal_date,DATE_FORMAT(appeal_date_approve,'%d/%m/%Y %H:%i:%s') appeal_date_approve,appeal_firstname,appeal_lastname,appeal_address,appeal_detail,appeal_contact,appeal_share,appeal_email,appeal_detail_summary,appeal_revoke,appeal_access,appeal_edit_information,appeal_delet_information,appeal_suspend,appeal_transfer,appeal_oppose,appeal_decision,appeal_approved_complaint FROM  TB_TR_PDPA_APPEAL AS app LEFT JOIN TB_TR_PDPA_CLASSIFICATION as class ON app.classify_id=class.classify_id  WHERE id_ap=? ", [id],
                (err, pdpa_appeal) => {
                    res.render("cookie/view_appeal/appreal_information", {
                        pdpa_appeal: pdpa_appeal,
                        session: req.session
                    });
                })
        });
    } else {
        res.redirect("/");
    }
}

controller.aprrove = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body
        req.getConnection((err, conn) => {
            conn.query("UPDATE  TB_TR_PDPA_APPEAL SET appeal_approved_complaint=1,appeal_date_approve=NOW() WHERE id_ap=? ",
                [data.id], (err, pdpa_appeal) => {
                    conn.query("SELECT * FROM   TB_TR_PDPA_APPEAL as p LEFT JOIN TB_MM_PREFIX as mp ON p.prefix_id=mp.prefix_id  WHERE id_ap=? ", [data.id],
                        (err, select_appeal) => {
                            funchistory.funchistory(req, "appeal", `อนุมัติข้อมูล เรื่องร้องเรียน ${select_appeal[0].prefix_name + select_appeal[0].appeal_firstname + " " + select_appeal[0].appeal_lastname}`, req.session.userid)
                            setTimeout(() => {
                                res.send(pdpa_appeal);
                            }, 100);
                        })
                })
        });
    } else {
        res.redirect("/");
    }
}

controller.deny = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body
        req.getConnection((err, conn) => {
            conn.query("UPDATE  TB_TR_PDPA_APPEAL SET appeal_approved_complaint=2,appeal_date_approve=NOW() WHERE id_ap=? ", [data.id],
                (err, pdpa_appeal) => {
                    conn.query("SELECT * FROM   TB_TR_PDPA_APPEAL as p LEFT JOIN TB_MM_PREFIX as mp ON p.prefix_id=mp.prefix_id  WHERE id_ap=? ", [data.id],
                        (err, select_appeal) => {
                            funchistory.funchistory(req, "appeal", `ปฏิเสธข้อมูล เรื่องร้องเรียน ${select_appeal[0].prefix_name + select_appeal[0].appeal_firstname + " " + select_appeal[0].appeal_lastname}`, req.session.userid)
                            setTimeout(() => {
                                res.send(pdpa_appeal);
                            }, 100);
                        })
                })
        });
    } else {
        res.redirect("/");
    }
}





controller.api_appeal_text = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            if (data.text == 'all') {
                conn.query("SELECT classify_name,prefix_name,id_ap,DATE_FORMAT(appeal_date,'%d/%m/%Y %H:%i:%s') appeal_date,DATE_FORMAT(appeal_date_approve,'%d/%m/%Y %H:%i:%s') appeal_date_approve,appeal_firstname,appeal_lastname,appeal_address,appeal_contact,appeal_detail,appeal_share,appeal_approved_complaint FROM  TB_TR_PDPA_APPEAL  as app LEFT JOIN TB_MM_PREFIX as pre ON app.prefix_id=pre.prefix_id LEFT JOIN TB_TR_PDPA_CLASSIFICATION AS C ON app.classify_id=c.classify_id WHERE  (DATE_FORMAT(appeal_date,'%Y-%m-%d') BETWEEN  ?  AND  ?   OR DATE_FORMAT(appeal_date_approve,'%Y-%m-%d') BETWEEN  ?  AND  ? )  ORDER BY id_ap DESC",
                    [data.date_first, data.date_last, data.date_first, data.date_last], (err, pdpa_appeal) => {
                        if (pdpa_appeal.length > 0) {
                            res.send(pdpa_appeal)
                        } else {
                            res.send(JSON.stringify("ไม่มีข้อมูล"));
                        }
                    });
            } else {
                conn.query("SELECT classify_name,prefix_name,id_ap,DATE_FORMAT(appeal_date,'%d/%m/%Y %H:%i:%s') appeal_date,DATE_FORMAT(appeal_date_approve,'%d/%m/%Y %H:%i:%s') appeal_date_approve,appeal_firstname,appeal_lastname,appeal_address,appeal_contact,appeal_detail,appeal_share,appeal_approved_complaint FROM  TB_TR_PDPA_APPEAL  as app LEFT JOIN TB_MM_PREFIX as pre ON app.prefix_id=pre.prefix_id LEFT JOIN TB_TR_PDPA_CLASSIFICATION AS C ON app.classify_id=c.classify_id WHERE ((CONCAT(prefix_name,appeal_firstname, ' ',appeal_lastname) LIKE ? OR CONCAT(prefix_name,appeal_firstname) LIKE ?) OR  appeal_detail LIKE ?  OR appeal_detail LIKE ? OR appeal_contact LIKE ?) AND (DATE_FORMAT(appeal_date,'%Y-%m-%d') BETWEEN  ?  AND  ?   OR DATE_FORMAT(appeal_date_approve,'%Y-%m-%d') BETWEEN  ?  AND  ? )  ORDER BY id_ap DESC",
                    ['%' + data.text + '%', '%' + data.text + '%', '%' + data.text + '%', '%' + data.text + '%', '%' + data.text + '%', data.date_first, data.date_last, data.date_first, data.date_last], (err, pdpa_appeal) => {
                        if (pdpa_appeal.length > 0) {
                            res.send(pdpa_appeal)
                        } else {
                            res.send(JSON.stringify("ไม่มีข้อมูล"));
                        }
                    });
            }
        });
    } else {
        res.redirect("/");
    }
};


controller.save = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var complaint = "";
        if (data.appeal_personal_data) {
            data.appeal_personal_data = data.appeal_personal_data
        } else {
            data.appeal_personal_data = 0
        }
        req.getConnection((err, conn) => {
            if (data.appeal_approved_complaint) {
                if (data.appeal_approved_complaint == 1) {
                    funchistory.funchistory(req, "appeal", `เพิ่มข้อมูล เรื่องร้องเรียน ${data.prefix_name.split(',')[0] + data.appeal_firstname + " " + data.appeal_lastname}`, req.session.userid)
                    conn.query("INSERT INTO TB_TR_PDPA_APPEAL SET  classify_id=?,appeal_date_approve=NOW(),appeal_date=NOW(),appeal_email=?,prefix_id=?,appeal_firstname=?,appeal_lastname=?,appeal_address=?,appeal_detail=?,appeal_contact=?,appeal_detail_summary=?,appeal_revoke=?,appeal_access=?,appeal_edit_information=?,appeal_delet_information=?,appeal_suspend=?,appeal_transfer=?,appeal_oppose=?,appeal_decision=?,appeal_approved_complaint=1,appeal_personal_data_id=?",
                        [data.activity, data.appeal_email, data.prefix_name.split(',')[1], data.appeal_firstname, data.appeal_lastname, data.appeal_address, data.appeal_detail, data.appeal_contact, data.appeal_detail_summary, data.appeal_revoke, data.appeal_access, data.appeal_edit_information, data.appeal_delet_information, data.appeal_suspend, data.appeal_transfer, data.appeal_oppose, data.appeal_decision, data.appeal_personal_data], (err, insert_pdpa_appeal) => {
                            funchistory.funchistory(req, "appeal", `อนุมัติข้อมูล เรื่องร้องเรียน ${data.prefix_name.split(',')[0] + data.appeal_firstname + " " + data.appeal_lastname}`, req.session.userid)
                            res.redirect("/appeal");
                        });
                } else {
                    conn.query("INSERT INTO TB_TR_PDPA_APPEAL SET  classify_id=?,appeal_date_approve=NOW(),appeal_date=NOW(),appeal_email=?,prefix_id=?,appeal_firstname=?,appeal_lastname=?,appeal_address=?,appeal_detail=?,appeal_contact=?,appeal_detail_summary=?,appeal_revoke=?,appeal_access=?,appeal_edit_information=?,appeal_delet_information=?,appeal_suspend=?,appeal_transfer=?,appeal_oppose=?,appeal_decision=?,appeal_approved_complaint=2,appeal_personal_data_id=?",
                        [data.activity, data.appeal_email, data.prefix_name.split(',')[1], data.appeal_firstname, data.appeal_lastname, data.appeal_address, data.appeal_detail, data.appeal_contact, data.appeal_detail_summary, data.appeal_revoke, data.appeal_access, data.appeal_edit_information, data.appeal_delet_information, data.appeal_suspend, data.appeal_transfer, data.appeal_oppose, data.appeal_decision, data.appeal_personal_data], (err, insert_pdpa_appeal) => {
                            funchistory.funchistory(req, "appeal", `ปฏิเสธข้อมูล เรื่องร้องเรียน ${data.prefix_name.split(',')[0] + data.appeal_firstname + " " + data.appeal_lastname}`, req.session.userid)
                            res.redirect("/appeal");
                        });
                }
            } else {
                complaint = "0";
                conn.query("INSERT INTO TB_TR_PDPA_APPEAL SET  classify_id=?,appeal_date=NOW(),appeal_email=?,prefix_id=?,appeal_firstname=?,appeal_lastname=?,appeal_address=?,appeal_detail=?,appeal_contact=?,appeal_detail_summary=?,appeal_revoke=?,appeal_access=?,appeal_edit_information=?,appeal_delet_information=?,appeal_suspend=?,appeal_transfer=?,appeal_oppose=?,appeal_decision=?,appeal_approved_complaint=?,appeal_personal_data_id=?",
                    [data.activity, data.appeal_email, data.prefix_name.split(',')[1], data.appeal_firstname, data.appeal_lastname, data.appeal_address, data.appeal_detail, data.appeal_contact, data.appeal_detail_summary, data.appeal_revoke, data.appeal_access, data.appeal_edit_information, data.appeal_delet_information, data.appeal_suspend, data.appeal_transfer, data.appeal_oppose, data.appeal_decision, complaint, data.appeal_personal_data], (err, insert_pdpa_appeal) => {
                        funchistory.funchistory(req, "appeal", `เพิ่มข้อมูล เรื่องร้องเรียน ${data.prefix_name.split(',')[0] + data.appeal_firstname + " " + data.appeal_lastname}`, req.session.userid)
                        res.redirect("/appeal");
                    });
            }
        });
    } else {
        res.redirect("/");
    }
};

controller.api_personal_data_search = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body.data;
        var results = [];
        fs.createReadStream('./dist/file_email_csv/123_Email.csv', 'utf8')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                for (let i = 0; i < results.length; i++) {
                    if (data == results[i].personal) {
                        res.send(results[i])
                        break
                    }
                }
            });
    } else {
        res.redirect("/");
    }
};
function send_mail_appeal(req) {
    var id = req.body.id;
    var hostname = req.body.hostname;
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM  TB_TR_PDPA_APPEAL WHERE id_ap=? ", [id],
            (err, pdpa_appeal) => {
                var mail = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'email.consent.18@gmail.com',
                        pass: 'Passw0rd18'
                    }
                })
                var mailOptions = {
                    from: 'email.consent.18@gmail.com',
                    to: pdpa_appeal[0].appeal_contact,
                    subject: "เรื่องร้องเรียน",
                    // text: pdpa_appeal[0].email_content,
                    html: `
                    <body style="margin:0px; background: #f8f8f8; ">
                    <div width="100%"
                    style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;">
                    <div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px">
                        <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 0px">
                            <tbody>
                                <tr>
                                    <td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="#"
                                            target="_blank"><img src="http://127.0.0.51:8081/UI/assets/images/logo-icon.png"
                                                alt="alltra" style="border:none"></td>
                                </tr>
                            </tbody>
                        </table>
                        <div style="padding: 40px; background: #fff;">
                            <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                                <tbody>
                                    <tr>
                                        <td><b>เรียน คุณ ${pdpa_appeal[0].appeal_prefix}${pdpa_appeal[0].appeal_firstname} ${pdpa_appeal[0].appeal_lastname}</b>
                                            <p>This is to inform you that, Your account with AdminX has been created successfully.
                                                Log it for more details.</p>
                                            <p>This email template can be used for Create Account, Change Password, Login
                                                Information and other informational things.</p>
                                            <b>ขอบคุณ (บริษัท ALLTRA ประเทศไทย จำกัด)</b>
                                            <br>
                                            <a href="${hostname}/agree-email/${pdpa_appeal[0].id_email}"
                                                style="display: inline-block; padding: 10px 15px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                                                ยินนอม </a>
                                            <a href="${hostname}/notagree-email_csv/${pdpa_appeal[0].id_email}"
                                                style="display: inline-block; padding: 10px 15px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #4fc3f7; border-radius: 5px; text-decoration:none;">
                                                ไม่ยินยอม </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    </div>
                    </body>`,
                }
                mail.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                        console.log("upload success");
                    }
                });
            });
    });
}
module.exports = controller;

