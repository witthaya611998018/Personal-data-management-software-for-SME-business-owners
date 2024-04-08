const session = require("express-session");
const uuidv4 = require('uuid').v4;
const fs = require('fs');
const nodemailer = require('nodemailer');
const csv = require('csv-parser');
const axios = require('axios');
const funchistory = require('../account_controllers')
require('dotenv').config()
const controller = {};

function sethost(req) {
    var hostset = req.headers;
    var protocol = 'http'
    if (hostset.hasOwnProperty('x-forwarded-proto')) {
        protocol = 'https'
    }
    var host = ""
    if (process.env.EMAIL_API == "dev") {
        host = protocol + "://" + req.headers.host
    } else {
        host = process.env.COOKIE_DOMAIN
    }
    return host
}

function check_user_login(req) {
    let user = ''
    if (req.session.acc_id_control) {
        user = req.session.acc_id_control
    } else {
        user = req.session.userid;
    }
    return user
}

controller.ApiEmailBoard = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        funchistory.check_limit(req)
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(board_date_send,'%Y-%m-%d') as day_inbox,DATE_FORMAT(board_date_send,'%d/%m/%Y %H:%i:%s') as date_inbox,DATE_FORMAT(board_date_consent,'%d/%m/%Y %H:%i:%s') as date_consent FROM TB_TR_PDPA_EMAIL_BOARD as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id  WHERE mail.acc_id=? AND board_check_send=1 AND board_type=1  AND (DATE_FORMAT(board_date_send,'%Y-%m')=DATE_FORMAT(NOW(),'%Y-%m'))  ORDER  BY board_id DESC",
                [user], (err, pdpa_email_board) => {
                    if (err) console.log(err);
                    if (pdpa_email_board.length > 0) {
                        res.send({ pdpa_email_board, 'email_personal': req.session.limit.email_personal })
                    } else {
                        res.json('ไม่มีข้อมูล')
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};



controller.EmailBoard = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "การส่งข้อมูลไปยังคณะกรรมการ", `เข้าสู่เมนู การส่งข้อมูลไปยังคณะกรรมการ`, req.session.userid)
            res.render("cookie/view_email/email_board", {
                session: req.session
            });
        });
    } else {
        res.redirect("/");
    }
}


controller.InboxEmailBoard = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE type BETWEEN 0 AND 1 AND doc_status=2 AND user_id=?",
                [user], (err, doc_pdpa_document) => {
                    conn.query("SELECT *,DATE_FORMAT(infraction_date,'%d/%m/%Y') as day_complaint,infraction.infraction_id as id_infraction_id FROM TB_TR_PDPA_APPEAL_INFRACTION AS infraction LEFT JOIN TB_TR_APPEAL_INFRACTION_INFRACTIONTYPE_COMBINED AS combined ON combined.infraction_id=infraction.infraction_id LEFT JOIN TB_MM_PREFIX as prefix ON infraction.prefix_id=prefix.prefix_id WHERE infraction.acc_id=? AND infraction.infraction_infringement=1  ORDER BY infraction.infraction_id DESC", [user], (err, infraction) => {
                        funchistory.funchistory(req, "การส่งข้อมูลไปยังคณะกรรมการ", `เข้าสู่เมนู เขียน E-mail`, req.session.userid)
                        if (doc_pdpa_document.length > 0) {
                            doc_pdpa_document = doc_pdpa_document
                        } else {
                            doc_pdpa_document = 'ไม่มีข้อมูล'
                        }
                        if (infraction.length > 0) {
                            infraction = infraction
                        } else {
                            infraction = 'ไม่มีข้อมูล'
                        }
                        res.render("cookie/view_email/email_board_inbox", {
                            doc_pdpa_document, infraction,
                            session: req.session
                        });
                    });
                });
        });
    } else {
        res.redirect("/");
    }
}


controller.ApiPolicy = (req, res) => { // ปิดใว้ก่อนเพราะตัวนี้คือตัวเลือกเสารเเบบ muti
    var host = sethost(req);
    var user = check_user_login(req)
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE type BETWEEN 0 AND 1 AND doc_status=2 AND user_id=?",
            [user], (err, doc_pdpa_document) => {
                if (doc_pdpa_document.length <= 0 || doc_pdpa_document.length == "") {
                    doc_pdpa_document = "ไม่มีข้อมูล"
                }
                res.send({
                    doc_pdpa_document,
                    host,
                })

            });
    });
};

// controller.ApiPolicy = (req, res) => {
//     const id = req.body.id;
//     console.log(req.body);
//     var host = sethost(req);
//     req.getConnection((err, conn) => {
//         conn.query("SELECT * FROM  TB_TR_ACCOUNT WHERE admin=3 ", (err, account) => {
//             conn.query("SELECT * FROM  TB_MM_QUESTIONNAIRE", (err, user_site) => {
//                 conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id =? and dp.page_action = 0 ",
//                     [id], (err, page) => {
//                         if (err) {
//                             console.log(err);
//                         } else {
//                             res.send({
//                                 user_site,
//                                 data: page,
//                                 host,
//                                 account
//                             })
//                         }
//                     });
//             });
//         });
//     });
// };



controller.PrintEnvelopesAndDefaultMessage = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const { text } = req.params
        var user = check_user_login(req)
        req.getConnection((err, conn) => {
            if (text.split(',')[0] === 'defaultMessage') {
                conn.query("SELECT * FROM TB_TR_PDPA_DEFAULT_MESSAGE  WHERE acc_id=? and message_type=? ORDER BY message_id DESC", [user, text.split(',')[1]], (err, select_account) => {
                    console.log("select_account", select_account);
                    if (select_account.length > 0) {
                        res.send(select_account);
                    } else {
                        res.send("ไม่มีข้อมูล")
                    }
                });
            } else {
                conn.query("SELECT * FROM TB_TR_ACCOUNT  AS acc LEFT JOIN TB_TR_DEL_ACC del_acc ON del_acc.acc_id=acc.acc_id WHERE admin=5 ORDER BY acc.acc_id DESC", (err, select_account) => {
                    res.send(select_account);
                });
            }
        });
    } else {
        res.redirect("/");
    }
}

controller.DefaultMessageRender = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            var user = check_user_login(req)
            conn.query("SELECT * FROM TB_TR_PDPA_DEFAULT_MESSAGE WHERE acc_id=? and message_type=0 ORDER BY message_id DESC", [user], (err, select_default) => {
                funchistory.funchistory(req, "ข้อความเริ่มต้น", `เข้าสู่เมนู ข้อความเริ่มต้น`, req.session.userid)
                let type = 0
                res.render("cookie/view_email/email_default_message", {
                    select_default,
                    type,
                    session: req.session
                });
            });
        });
    } else {
        res.redirect("/");
    }
}

controller.DefaultMessageAdd = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body
        var user = check_user_login(req)
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_DEFAULT_MESSAGE WHERE acc_id=? and message_type=?", [user, data.message_type], (err, select_default) => {
                if (select_default.length > 0) {
                    conn.query("UPDATE  TB_TR_PDPA_DEFAULT_MESSAGE SET message_subject=?,message_content=? WHERE message_id=?", [data.message_subject, data.message_content, data.message_id], (err, insert_default) => {
                        funchistory.funchistory(req, "ข้อความเริ่มต้น", `บันทึกข้อมูล ข้อมความเริ่มต้น`, req.session.userid)
                    });
                } else {
                    conn.query("INSERT INTO TB_TR_PDPA_DEFAULT_MESSAGE SET message_subject=?,message_content=?,acc_id=?,message_type=?", [data.message_subject, data.message_content, user, data.message_type], (err, insert_default) => {
                        funchistory.funchistory(req, "ข้อความเริ่มต้น", `บันทึกข้อมูล ข้อมความเริ่มต้น`, req.session.userid)
                    });
                }
                if (data.message_type == 0) {
                    res.redirect("/inbox-email-board");

                } else {
                    res.redirect("/email-owner-personal/inbox");
                }
            });
        });
    } else {
        res.redirect("/");
    }
}

controller.ViewInformation = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const { id } = req.params;
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(board_date_send,'%d/%m/%Y %H:%i:%s น.') as board_date_send,DATE_FORMAT(board_date_consent,'%d/%m/%Y %H:%i:%s น.') as board_date_consent FROM TB_TR_PDPA_EMAIL_BOARD  WHERE  board_id=?", [id], (err, select_pdpa_email) => {
                console.log(select_pdpa_email[0].board_type);
                if (select_pdpa_email[0].board_files) {
                    var file = [];
                    var file_array = select_pdpa_email[0].board_files.split(",");
                    for (let i = 0; i < file_array.length; i++) {
                        file.push(file_array[i].replaceAll("_", ",").split(",")[1])
                    }
                    res.render("cookie/view_email/email_board_information", {
                        select_pdpa_email: select_pdpa_email,
                        file,
                        session: req.session
                    });
                } else {
                    var file = "0";
                    res.render("cookie/view_email/email_board_information", {
                        select_pdpa_email: select_pdpa_email,
                        file,
                        session: req.session
                    });
                }
                funchistory.funchistory(req, "การส่งข้อมูลไปยังคณะกรรมการ", `ดูข้อมูล การส่งข้อมูลไปยังคณะกรรมการ ${select_pdpa_email[0].email_to}`, req.session.userid)
            });
        });
    } else {
        res.redirect("/");
    }
};



controller.SendMail = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            if (req.files != null) {
                var file = req.files.files_send;
                var attachments_new = [];
                if (!Array.isArray(file)) {
                    file = new Array(file)
                }
                var array_file = '';
                for (var i = 0; i < file.length; i++) {
                    // var file_upload = uuidv4() + "." + file[i].name.split('.')[1];
                    var file_upload = uuidv4() + "_" + file[i].name;
                    file[i].mv(`./${process.env.FOLDER_FILESUPLOAD}/files_upload/${file_upload}`, "utf8", function (err) {
                        if (err) { console.log(err); }
                    })
                    attachments_new.push({
                        filename: file[i].name,
                        path: `./${process.env.FOLDER_FILESUPLOAD}/files_upload/${file_upload}`,
                    })
                    if (i + 1 != file.length) {
                        array_file += file_upload + ",";
                    } else {
                        array_file += file_upload;
                    }
                }
                conn.query("INSERT INTO TB_TR_PDPA_EMAIL_BOARD SET board_type=1,infraction_id=?,board_check_send=1,board_location=?,board_from='smartpdpa@gmail.com',board_status=0,board_content=?,board_subject=?,board_to=?,board_files=?,board_firstname=?,board_lastname=?,acc_id=?",
                    [data.infraction, data.location, data.content, data.subject, data.email_to, array_file, data.firstname, data.lastname, user], (err, InsertEmail) => {
                        if (err) {
                            console.log(err);
                        } else {
                            Mailer(req, InsertEmail.insertId, attachments_new)
                        }
                    });
            } else {
                conn.query("INSERT INTO TB_TR_PDPA_EMAIL_BOARD SET board_type=1,infraction_id=?,board_check_send=1,board_location=?,board_from='smartpdpa@gmail.com',board_status=0,board_content=?,board_subject=?,board_to=?,board_firstname=?,board_lastname=?,acc_id=?",
                    [data.infraction, data.location, data.content, data.subject, data.email_to, data.firstname, data.lastname, user], (err, InsertEmail) => {
                        if (err) {
                            console.log(err);
                        } else {
                            Mailer(req, InsertEmail.insertId)
                        }
                    });
            }
            res.redirect("/email-board");
        });
    } else {
        res.redirect("/");
    }
};


var HostApi = ""
controller.Agree = (req, res) => {
    if (req.params.id == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            const { id } = req.params;
            console.log("id", id);
            conn.query("UPDATE TB_TR_PDPA_EMAIL_BOARD SET  board_status=1,board_date_consent=NOW() WHERE  board_id=? ", [id],
                (err, update_pdpa_email_board) => {
                    res.render("cookie/view_email/email_board_agree", {
                        session: req.session
                    });
                });
        });
    }
};

controller.NotAgree = (req, res) => {
    if (req.params.id == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            const id = req.params.id;
            res.render("cookie/view_email/email_board_notAgree", {
                id,
                HostApi,
                session: req.session
            });
        });
    }
};

controller.ConfirmNotAgree = (req, res) => {
    const { id } = req.params;
    req.getConnection((err, conn) => {
        conn.query("UPDATE TB_TR_PDPA_EMAIL_BOARD SET  board_status=2,board_date_consent=NOW() WHERE  board_id=? ", [id],
            (err, update_pdpa_email) => {
                res.end()
            });
    });
};

// ส่ง mail ใหม่อีกรอบ
controller.ResendMail = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const { id } = req.params;
        var host = sethost(req);
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((_, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_EMAIL_BOARD WHERE board_id=?", [id],
                (_, selecte_email) => {
                    conn.query("INSERT INTO  TB_TR_PDPA_EMAIL_BOARD SET board_type=1,board_from=?,board_status=0,board_check_send=1,board_content=?,board_subject=?,board_to=?,board_date_send=NOW(),board_files=?,board_firstname=?,board_lastname=?,board_location=?,acc_id=?",
                        [selecte_email[0].board_from, selecte_email[0].board_content, selecte_email[0].board_subject, selecte_email[0].board_to, selecte_email[0].board_files, selecte_email[0].board_firstname, selecte_email[0].board_lastname, selecte_email[0].board_location, selecte_email[0].acc_id],
                        async (_, insert_email) => {
                            var attachments_file = [];
                            var html_send;
                            if (selecte_email[0].board_location == "top") {
                                html_send = `
                                        <body style="margin:0px; background: #f8f8f8; ">
                                            <div width="100%"
                                                style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;">
                                                <div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px">
                                                    <div style="padding: 40px; background: #fff;">
                                                        <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                                                            <div
                                                                style="border-bottom: 3px solid;color:rgb(240,185,11);font-weight: 600;font-size: xx-large;margin-bottom: 20px;">
                                                                <p style="text-align: center;margin-bottom: 20px;">
                                                                PDPA 3in1
                                                                </p>
                                                            </div>
                                                            <div style="text-align: center;margin-bottom: 10px;">
                                                                <a href="${host}/agree-email-board/${insert_email.insertId}"
                                                                    style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                                                                    ยินยอม </a>
                                                                <a href="${host}/notagree-email-board/${insert_email.insertId}"
                                                                    style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #4fc3f7; border-radius: 5px; text-decoration:none;">
                                                                    ไม่ยินยอม </a>
                                                            </div>
                                                            <tbody>
                                                                <tr>
                                                                    <td>
                                                                        <p>${selecte_email[0].board_content}</p>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </body>`
                            } else {
                                html_send = `
                        <body style="margin:0px; background: #f8f8f8; ">
                            <div width="100%"
                                style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;">
                                <div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px">
                                    <div style="padding: 40px; background: #fff;">
                                        <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                                            <div
                                                style="border-bottom: 3px solid;color:rgb(240,185,11);font-weight: 600;font-size: xx-large;margin-bottom: 20px;">
                                                <p style="text-align: center;margin-bottom: 20px;">
                                                PDPA 3in1
                                                </p>
                                            </div>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                      
                                                        <p>${selecte_email[0].board_content}</p>
                                                        <div
                                                        style="border-top: 3px solid;color: rgb(240,185,11);text-align: center;margin-top: 30px;">
                                                        <a href="${host}/agree-email-board/${insert_email.insertId}"
                                                            style="display: inline-block; padding: 5px 8px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                                                            ยินยอม </a>
                                                        <a href="${host}/notagree-email-board/${insert_email.insertId}"
                                                            style="display: inline-block; padding: 5px 8px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #4fc3f7; border-radius: 5px; text-decoration:none;">
                                                            ไม่ยินยอม </a>
                                                    </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </body>`
                            }
                            if (process.env.EMAIL_API == "dev") {
                                var mail = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'smartpdpa@gmail.com',
                                        pass: 'laenkjbuhbzxkikc'
                                    },
                                })
                                var mailOptions = {
                                    from: 'PDPA 3in1' + '<smartpdpa@gmail.com>',
                                    to: selecte_email[0].board_to,
                                    subject: 'PDPA 3in1 subject: ' + selecte_email[0].board_subject,
                                    text: selecte_email[0].board_content,
                                    html: html_send,
                                }
                                if (selecte_email[0].board_files != null) {
                                    var attachments_new = [];
                                    var files_resend = selecte_email[0].board_files.split(",")
                                    for (let i = 0; i < files_resend.length; i++) {
                                        attachments_new.push({
                                            filename: files_resend[i].replace("_", ",").split(",")[1],
                                            path: `./${process.env.FOLDER_FILESUPLOAD}/files_upload/` + files_resend[i]
                                        })
                                    }
                                    mailOptions.attachments = attachments_new // เพิ่ม object 
                                }

                                mail.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        console.log("ppppppppppp", error);
                                    } else {
                                        console.log('Email sent: ' + info.response);
                                        console.log("upload success");
                                    }
                                });
                            } else {
                                console.log("2222222222222222");
                                var data = {
                                    "from": "pipr@dol.go.th",
                                    "to": `${selecte_email[0].board_to}`,
                                    "subject": `${selecte_email[0].board_subject}`,
                                    "body": `${html_send}`,
                                    "attachment_url": [`${attachments_file}`]
                                }
                                let res = await axios.post(`${process.env.EMAIL_API}`, data).then((response) => {
                                    console.log(response);
                                }, (error) => {
                                    console.log(error);
                                });
                            }
                        });
                    conn.query("UPDATE TB_TR_PDPA_EMAIL_BOARD SET board_check_send=0 WHERE board_id=?", [id],
                        (err, UPDATE_pdpa_email) => {
                            conn.query("SELECT DATE_FORMAT(board_date_send,'%Y-%m-%d') as day_inbox,board_firstname,board_lastname,board_content,DATE_FORMAT(board_date_send,'%d/%m/%Y %H:%i:%s') as date_inbox,board_id,board_files,board_to,board_status,board_content,board_subject,DATE_FORMAT(board_date_consent,'%d/%m/%Y %H:%i:%s') as date_consent FROM TB_TR_PDPA_EMAIL_BOARD as mail  LEFT JOIN TB_TR_ACCOUNT as acc  ON mail.acc_id=acc.acc_id  WHERE mail.acc_id=? AND board_check_send=1  AND board_type=1  AND (DATE_FORMAT(board_date_send,'%Y-%m')=DATE_FORMAT(NOW(),'%Y-%m')) ORDER  BY board_id DESC",
                                [user], (err, pdpa_email) => {
                                    funchistory.funchistory(req, "การส่งข้อมูลไปยังคณะกรรมการ", `แก้ไขข้อมูล การส่งข้อมูลไปยังคณะกรรมการ ${selecte_email[0].email_to}`, req.session.userid)
                                    res.send(pdpa_email)
                                });
                        });
                });
        });
    } else {
        res.redirect("/");
    }
};

controller.SearchText = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        console.log(data);
        var user = check_user_login(req)
        req.getConnection((err, conn) => {
            if (data.data == "") {
                conn.query("SELECT *,DATE_FORMAT(board_date_send,'%d/%m/%Y %H:%i:%s') as date_inbox,DATE_FORMAT(board_date_consent,'%d/%m/%Y %H:%i:%s') as date_consent   FROM TB_TR_PDPA_EMAIL_BOARD as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id WHERE mail.acc_id=? AND board_check_send=1 AND board_type=1 AND  DATE_FORMAT(mail.board_date_send,'%Y-%m-%d') BETWEEN  ?  AND  ?  ORDER  BY board_id DESC",
                    [user, data.firstDay, data.lastDay], (err, pdpa_email_board) => {
                        if (err) console.log(err);
                        if (pdpa_email_board.length > 0) {
                            res.send(pdpa_email_board)
                        } else {
                            res.send('ไม่มีข้อมูล')
                        }
                    });
            } else {
                conn.query("SELECT *,DATE_FORMAT(board_date_send,'%d/%m/%Y %H:%i:%s') as date_inbox,DATE_FORMAT(board_date_consent,'%d/%m/%Y %H:%i:%s') as date_consent   FROM TB_TR_PDPA_EMAIL_BOARD as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id WHERE mail.acc_id=? AND board_check_send=1 AND board_type=1 AND (board_firstname LIKE ? OR (CONCAT(board_firstname, ' ',board_lastname) LIKE ?)  OR  mail.board_subject LIKE ?  OR mail.board_to LIKE ?) AND DATE_FORMAT(mail.board_date_send,'%Y-%m-%d') BETWEEN  ?  AND  ?  ORDER  BY board_id DESC",
                    [user, "%" + data.data + "%", "%" + data.data + "%", "%" + data.data + "%", "%" + data.data + "%", data.firstDay, data.lastDay],
                    (err, pdpa_email) => {
                        if (pdpa_email.length > 0) {
                            res.send(pdpa_email)
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

controller.SearchDate = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(board_date_send,'%d/%m/%Y %H:%i:%s') as date_inbox,DATE_FORMAT(board_date_consent,'%d/%m/%Y %H:%i:%s') as date_consent  FROM TB_TR_PDPA_EMAIL_BOARD as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id  WHERE mail.acc_id=? AND mail.board_check_send=1 AND DATE_FORMAT(mail.board_date_send,'%Y-%m-%d') BETWEEN  ?  AND  ?   AND DATE_FORMAT(mail.board_date_send,'%Y-%m-%d') BETWEEN ?  AND  ?   ORDER  BY board_id DESC",
                [user, data.firstDay, data.lastDay, data.firstDay, data.lastDay],
                (err, pdpa_email) => {
                    if (pdpa_email.length > 0) {
                        res.send(pdpa_email)
                    } else {
                        res.send(JSON.stringify("ไม่มีข้อมูล"))
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};


function Mailer(req, id, attachments_new) {
    var host = sethost(req)
    HostApi = host
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM TB_TR_PDPA_EMAIL_BOARD  WHERE  board_id=? ", [id],
            async (err, selecte_email) => {
                var html_send = '';
                if (selecte_email[0].location == "top") {
                    html_send = `
                        <body style="margin:0px; background: #f8f8f8; ">
                            <div width="100%"
                                style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;">
                                <div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px">
                                    <div style="padding: 40px; background: #fff;">
                                        <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                                            <div
                                                style="border-bottom: 3px solid;color:rgb(240,185,11);font-weight: 600;font-size: xx-large;margin-bottom: 20px;">
                                                <p style="text-align: center;margin-bottom: 20px;">
                                                PDPA 3in1
                                                </p>
                                            </div>
                                            <div style="text-align: center;margin-bottom: 10px;">
                                                <a href="${host}/agree-email-board/${id}"
                                                    style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                                                    ยินยอม </a>
                                                <a href="${host}/notagree-email-board/${id}"
                                                    style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #4fc3f7; border-radius: 5px; text-decoration:none;">
                                                    ไม่ยินยอม </a>
                                            </div>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <p>${selecte_email[0].board_content}</p>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </body>`
                } else {
                    html_send = `
                    <body style="margin:0px; background: #f8f8f8; ">
                        <div width="100%"
                            style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;">
                            <div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px">
                                <div style="padding: 40px; background: #fff;">
                                    <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                                        <div
                                            style="border-bottom: 3px solid;color:rgb(240,185,11);font-weight: 600;font-size: xx-large;margin-bottom: 20px;">
                                            <p style="text-align: center;margin-bottom: 20px;">
                                            PDPA 3in1
                                            </p>
                                        </div>
                                        <tbody>
                                            <tr>
                                                <td>
                                                  <p>${selecte_email[0].board_content}</p>
                                                    <div
                                                    style="border-top: 3px solid;color: rgb(240,185,11);text-align: center;margin-top: 30px;">
                                                    <a href="${host}/agree-email-board/${id}"
                                                        style="display: inline-block; padding: 5px 8px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                                                        ยินยอม </a>
                                                    <a href="${host}/notagree-email-board/${id}"
                                                        style="display: inline-block; padding: 5px 8px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #4fc3f7; border-radius: 5px; text-decoration:none;">
                                                        ไม่ยินยอม </a>
                                                </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </body>`
                }

                if (process.env.EMAIL_API == "dev") {
                    var mail = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'smartpdpa@gmail.com',
                            pass: 'laenkjbuhbzxkikc'
                        }
                    })
                    var mailOptions = {
                        from: 'PDPA 3in1' + '<smartpdpa@gmail.com>',
                        to: req.body.email_to,
                        subject: 'PDPA 3in1 subject: ' + req.body.subject,
                        text: selecte_email[0].board_content,
                        html: html_send,
                    }

                    if (attachments_new != undefined) {
                        mailOptions.attachments = attachments_new  // กรณีมีไฟล์เเนบให้เพิ่ม attachments[ไฟล์เเนบ] ใน object mailOptions 
                    }

                    mail.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                } else {
                    var attachmentFile = []
                    if (attachments_new != undefined) {
                        for (let i = 0; i < attachments_new.length; i++) {
                            attachmentFile.push(host + "/" + attachments_new[i].path.replace('./', ''))
                        }
                    }
                    var data = {
                        "from": "pipr@dol.go.th",
                        "to": `${selecte_email[0].email_to}`,
                        "subject": `${selecte_email[0].board_subject}`,
                        "body": `${html_send} ${attachments_new}`,
                        "attachment_url": [`${attachmentFile}`]
                    }
                    let res = await axios.post(`${process.env.EMAIL_API}`, data).then((response) => {
                        console.log(response);
                    }, (error) => {
                        console.log(error);
                    });
                }
            });
    });
}


module.exports = controller;