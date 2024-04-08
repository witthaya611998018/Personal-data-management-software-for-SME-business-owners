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

controller.previews = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const { id } = req.params;
        req.getConnection((err, conn) => {
            conn.query("SELECT doc_name,email_firstname,email_lastname,DATE_FORMAT(email_date_send,'%d/%m/%Y %H:%i:%s น.') as email_date_send,id_email,email_files,email_to,email_status,email_content,email_subject,DATE_FORMAT(email_date_consent,'%d/%m/%Y %H:%i:%s น.') as email_date_consent FROM TB_TR_PDPA_EMAIL  as mail LEFT JOIN TB_TR_PDPA_DOCUMENT as doc  ON mail.doc_id=doc.doc_id  WHERE  id_email=?", [id], (err, select_pdpa_email) => {
                if (select_pdpa_email[0].email_files) {
                    var file = [];
                    var file_array = select_pdpa_email[0].email_files.split(",");
                    for (let i = 0; i < file_array.length; i++) {
                        file.push(file_array[i].replaceAll("_", ",").split(",")[1])
                    }
                    res.render("cookie/view_email/email_consent_preview", {
                        select_pdpa_email: select_pdpa_email,
                        file,
                        session: req.session
                    });
                } else {
                    var file = "0";
                    res.render("cookie/view_email/email_consent_preview", {
                        select_pdpa_email: select_pdpa_email,
                        file,
                        session: req.session
                    });
                }
                funchistory.funchistory(req, "E-mail Consent", `ดูข้อมูล E-mail Consent ${select_pdpa_email[0].email_to}`, req.session.userid)
            });
        });
    } else {
        res.redirect("/");
    }
};


controller.Inbox = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE type BETWEEN 0 AND 1 AND doc_status=2 AND user_id=?",
                [user], (err, doc_pdpa_document) => {
                    funchistory.funchistory(req, "E-mail Consent", `เข้าสู่เมนู เขียน E-mail`, req.session.userid)
                    res.render("cookie/view_email/email_inbox", {
                        doc_pdpa_document: doc_pdpa_document,
                        session: req.session
                    });
                });
        });
    } else {
        res.redirect("/");
    }
};

controller.api_policy = (req, res) => {
    const id = req.body.id;
    var host = sethost(req);
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM  TB_TR_ACCOUNT WHERE admin=3 ", (err, account) => {
            conn.query("SELECT * FROM  TB_MM_QUESTIONNAIRE", (err, user_site) => {
                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id =? and dp.page_action = 0 ", [id], (err, page) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send({ user_site, data: page, host, account })
                    }
                });
            });
        });
    });
};




controller.consent = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "E-mail Consent", `เข้าสู่เมนู E-mail Consent`, req.session.userid)
            res.render("cookie/view_email/email_consent", {
                session: req.session
            });
        });
    } else {
        res.redirect("/");
    }
}

controller.api_consent = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        funchistory.check_limit(req)
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT DATE_FORMAT(email_date_send,'%Y-%m-%d') as day_inbox,email_firstname,email_lastname,email_content,DATE_FORMAT(email_date_send,'%d/%m/%Y %H:%i:%s') as date_inbox,id_email,email_files,email_to,email_status,email_content,email_subject,DATE_FORMAT(email_date_consent,'%d/%m/%Y %H:%i:%s') as date_consent FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id  WHERE mail.acc_id=? AND email_check_send=1  AND (DATE_FORMAT(email_date_send,'%Y-%m')=DATE_FORMAT(NOW(),'%Y-%m'))  ORDER  BY id_email DESC",
                [user], (err, pdpa_email) => {
                    if (pdpa_email.length > 0) {
                        res.send({ pdpa_email, 'limit_email': req.session.limit.email })
                    } else {
                        res.send("ไม่มีข้อมูล")
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};

controller.api_consent_search_text = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            if (data.data == 'all') {
                conn.query("SELECT DATE_FORMAT(email_date_send,'%Y-%m-%d') as day_inbox,email_firstname,email_lastname,email_content,DATE_FORMAT(email_date_send,'%d/%m/%Y %H:%i:%s') as date_inbox,id_email,email_files,email_to,email_status,email_content,email_subject,DATE_FORMAT(email_date_consent,'%d/%m/%Y %H:%i:%s') as date_consent FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id  WHERE mail.acc_id=? AND email_check_send=1  AND (DATE_FORMAT(email_date_send,'%Y-%m')=DATE_FORMAT(NOW(),'%Y-%m')) AND DATE_FORMAT(mail.email_date_send,'%Y-%m-%d') BETWEEN  ?  AND  ? ORDER  BY id_email DESC",
                    [user, data.date_first, data.date_last], (err, pdpa_email) => {
                        if (pdpa_email.length > 0) {
                            res.send(pdpa_email)
                        } else {
                            res.send(JSON.stringify("ไม่มีข้อมูล"));
                        }
                    });
            } else {
                conn.query("SELECT email_firstname,email_lastname,email_content,DATE_FORMAT(email_date_send,'%d/%m/%Y %H:%i:%s') as date_inbox,id_email,email_files,email_to,email_status,email_content,email_subject,DATE_FORMAT(email_date_consent,'%d/%m/%Y %H:%i:%s') as date_consent   FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id  WHERE mail.acc_id=? AND email_check_send=1  AND (email_firstname=? OR (CONCAT(email_firstname, ' ',email_lastname)=?)  OR  mail.email_subject=?  OR mail.email_to=?) AND DATE_FORMAT(mail.email_date_send,'%Y-%m-%d') BETWEEN  ?  AND  ?  ORDER  BY id_email DESC",
                    [user, data.data, data.data, data.data, data.data, data.date_first, data.date_last],
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
var host_name = '';
controller.send = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var host = sethost(req);
        host_name = host;
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc  ON mail.acc_id=acc.acc_id WHERE mail.acc_id=? ORDER BY id_email DESC", [user],
                (err, selecte_pdpa_email) => {
                    var length_mail = selecte_pdpa_email.length;
                    var email_consent = req.session.email_consent;
                    var attachments_new = []; // สร้าง array ขึ้นมาใหม่เพื่อมาเก็บ ชื่อไฟลื กับ path 
                    if (req.files == null) {
                        if (data.doc_id == null) {
                            data.doc_id = "0"
                        }
                        conn.query("INSERT INTO TB_TR_PDPA_EMAIL SET email_location=?,email_from='smartpdpa@gmail.com',email_check_send=1,email_status=0,email_content=?,email_subject=?,email_to=?,email_files=?,acc_id=?,doc_id=?,email_firstname=?,email_lastname=?",
                            [data.location, data.email_content, data.email_subject, data.email_to, file_upload, user, data.doc_id, data.email_firstname, data.email_lastname], (err, insert_email) => {
                                conn.query("SELECT * FROM  TB_TR_PDPA_EMAIL WHERE acc_id=? ORDER BY id_email DESC ", [user], (err, selecte_email) => {
                                    funchistory.funchistory(req, "E-mail Consent", `เพิ่มข้อมูล E-mail Consent ${data.email_to}`, req.session.userid)
                                    send_mail(req, selecte_email[0].id_email, host)
                                });
                            });
                    } else if (req.files.email_file && req.files.email_file_csv) {
                        var file = req.files.email_file;
                        var file_csv = req.files.email_file_csv;
                        var file_upload_csv = uuidv4() + ".csv"
                        // console.log("xxxxxxxx", file.name);
                        // console.log("xxxxxxxx", utf8.encode(file.name, "UTF-8"));
                        if (!Array.isArray(file)) {
                            file = new Array(file)
                        }
                        var array_file = '';
                        for (var i = 0; i < file.length; i++) {
                            var file_upload = uuidv4() + "." + file[i].name.split('.')[1];
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
                        file_csv.mv(`./${process.env.FOLDER_FILESUPLOAD}/file_email_csv/${file_upload_csv}`, function (err) {
                            if (err) { console.log(err); }
                            var results = []
                            fs.createReadStream(`./${process.env.FOLDER_FILESUPLOAD}/file_email_csv/${file_upload_csv}`, 'utf8').pipe(csv())
                                .on('data', (data) => results.push(data))
                                .on('end', () => {
                                    if (data.doc_id == null) {
                                        data.doc_id = "0"
                                    }
                                    for (let i = 0; i < results.length; i++) {
                                        if (length_mail == email_consent) {
                                            break
                                        } else {
                                            conn.query("INSERT INTO TB_TR_PDPA_EMAIL SET email_check_send=1,email_location=?,email_from='smartpdpa@gmail.com',email_status=0,email_content=?,email_subject=?,email_to=?,email_files_csv=?,email_files=?,acc_id=?,doc_id=?,email_firstname=?,email_lastname=?",
                                                [data.location, data.email_content, data.email_subject, results[i].email_to, file_upload_csv, array_file, user, data.doc_id, results[i].firstname, results[i].lastname], (err, insert_email) => {
                                                    var id = insert_email.insertId;
                                                    funchistory.funchistory(req, "E-mail Consent", `เพิ่มข้อมูล E-mail Consent ${results[i].email_to}`, req.session.userid)
                                                    send_mail_file(req, id, host, attachments_new);
                                                });
                                        }
                                    };
                                });
                        });
                    } else if (req.files.email_file) {
                        var file = req.files.email_file;
                        if (!Array.isArray(file)) {
                            file = new Array(file)
                        }
                        var array_file = '';
                        for (var i = 0; i < file.length; i++) {
                            var file_upload = uuidv4() + "_" + file[i].name;
                            file[i].mv(`./${process.env.FOLDER_FILESUPLOAD}/files_upload/${file_upload}`, function (err) {
                                if (err) { console.log(err); }
                            });
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
                        if (data.doc_id == null) {
                            data.doc_id = "0"
                        }
                        conn.query("INSERT INTO TB_TR_PDPA_EMAIL SET email_from='smartpdpa@gmail.com',email_location=?,email_check_send=1,email_status=0,email_content=?,email_subject=?,email_to=?,email_files=?,acc_id=?,doc_id=?,email_firstname=?,email_lastname=?",
                            [data.location, data.email_content, data.email_subject, data.email_to, array_file, user, data.doc_id, data.email_firstname, data.email_lastname], (err, insert_email) => {
                                funchistory.funchistory(req, "E-mail Consent", `เพิ่มข้อมูล E-mail Consent ${data.email_to}`, req.session.userid)
                                send_mail_file_first(req, insert_email.insertId, host, attachments_new)
                            });
                    } else if (req.files.email_file_csv) {
                        var file_csv = req.files.email_file_csv;
                        var file_upload_csv = uuidv4() + "_" + file_csv.name;
                        file_csv.mv(`./${process.env.FOLDER_FILESUPLOAD}/file_email_csv/${file_upload_csv}`, function (err) {
                            if (err) console.log(err);
                            var results = []
                            if (data.doc_id == null) {
                                data.doc_id = "0"
                            }
                            fs.createReadStream(`./${process.env.FOLDER_FILESUPLOAD}/file_email_csv/${file_upload_csv}`, 'utf8').pipe(csv())
                                .on('data', (data) => results.push(data))
                                .on('end', () => {
                                    for (let i = 0; i < results.length; i++) {
                                        if (length_mail == email_consent) {
                                            break
                                        } else {
                                            conn.query("INSERT INTO TB_TR_PDPA_EMAIL SET email_check_send=1,email_location=?,email_from='smartpdpa@gmail.com',email_status=0,email_content=?,email_subject=?,email_to=?,email_files_csv=?,email_files=?,acc_id=?,doc_id=?,email_firstname=?,email_lastname=?",
                                                [data.location, data.email_content, data.email_subject, results[i].email_to, file_upload_csv, array_file, user, data.doc_id, results[i].firstname, results[i].lastname], (err, insert_email) => {
                                                    var id = insert_email.insertId;
                                                    funchistory.funchistory(req, "E-mail Consent", `เพิ่มข้อมูล E-mail Consent ${results[i].email_to}`, req.session.userid)
                                                    send_mail_file(req, id, host, attachments_new);
                                                });
                                        }
                                    }
                                });
                        });

                    }
                });
            res.redirect("/management/email_consent");
        });
    } else {
        res.redirect("/");
    }
};


function send_mail_file(req, id, host, attachments_new) {
    var attachmentFile = []
    for (let i = 0; i < attachments_new.length; i++) {
        attachmentFile.push(host + "/" + attachments_new[i].path.replace('./', ''))
    }
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM TB_TR_PDPA_EMAIL  WHERE  id_email=? ", [id],
            async (err, selecte_email) => {
                var html_send;
                if (selecte_email[0].email_location == "top") {
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
                                                            <a href="${host}/agree-email/${id}"
                                                                style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                                                                ยินยอม </a>
                                                            <a href="${host}/notagree-email_csv/${id}"
                                                                style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #4fc3f7; border-radius: 5px; text-decoration:none;">
                                                                ไม่ยินยอม </a>
                                                        </div>
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                  
                                                                    <p>${selecte_email[0].email_content}</p>
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
                                                  
                                                    <p>${selecte_email[0].email_content}</p>
                                                    <div
                                                    style="border-top: 3px solid;color: rgb(240,185,11);text-align: center;margin-top: 30px;">
                                                    <a href="${host}/agree-email/${id}"
                                                        style="display: inline-block; padding: 5px 8px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                                                        ยินยอม </a>
                                                    <a href="${host}/notagree-email_csv/${id}"
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
                        to: selecte_email[0].email_to,
                        subject: `PDPA 3in1 subject:${selecte_email[0].email_subject}`,
                        text: selecte_email[0].email_content,
                        html: html_send,
                        attachments: []
                    }

                    for (let i = 0; i < attachments_new.length; i++) {
                        mailOptions.attachments.push(attachments_new[i])
                    }
                    mail.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                } else {
                    var data = {
                        "from": "pipr@dol.go.th",
                        "to": `${selecte_email[0].email_to}`,
                        "subject": `${selecte_email[0].email_subject}`,
                        "body": `${html_send} ${attachments_new}`,
                        "attachment_url": [`${attachmentFile}`]
                    }
                    let res = await axios.post(`${process.env.EMAIL_API}`, data).then((response) => {
                        console.log(response);
                    }, (error) => {
                        console.log(error);
                    });
                    console.log("send_mail_file", res);
                }
            });
    });
}

function send_mail(req, id, host) {
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM TB_TR_PDPA_EMAIL  WHERE  id_email=? ", [id],
            async (err, selecte_email) => {
                var html_send;
                if (selecte_email[0].email_location == "top") {
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
                                                            <a href="${host}/agree-email/${id}"
                                                                style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                                                                ยินยอม </a>
                                                            <a href="${host}/notagree-email_csv/${id}"
                                                                style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #4fc3f7; border-radius: 5px; text-decoration:none;">
                                                                ไม่ยินยอม </a>
                                                        </div>
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                  
                                                                    <p>${selecte_email[0].email_content}</p>
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
                                                  
                                                    <p>${selecte_email[0].email_content}</p>
                                                    <div
                                                    style="border-top: 3px solid;color: rgb(240,185,11);text-align: center;margin-top: 30px;">
                                                    <a href="${host}/agree-email/${id}"
                                                        style="display: inline-block; padding: 5px 8px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                                                        ยินยอม </a>
                                                    <a href="${host}/notagree-email_csv/${id}"
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
                    });
                    var mailOptions = {
                        from: 'PDPA 3in1' + '<smartpdpa@gmail.com>',
                        to: selecte_email[0].email_to,
                        subject: 'PDPA 3in1 subject: ' + selecte_email[0].email_subject,
                        text: selecte_email[0].email_content,
                        html: html_send,
                    };
                    mail.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                } else {
                    var data = {
                        "from": "pipr@dol.go.th",
                        "to": `${selecte_email[0].email_to}`,
                        "subject": `${selecte_email[0].email_subject}`,
                        "body": `${html_send}`
                    }
                    let res = await axios.post(`${process.env.EMAIL_API}`, data).then((response) => {
                        console.log(response);
                    }, (error) => {
                        console.log(error);
                    });
                    console.log("send_mail", res);

                }
            });
    });
};

function send_mail_file_first(req, id, host, attachments_new) {
    var attachmentFile = []
    for (let i = 0; i < attachments_new.length; i++) {
        attachmentFile.push(host + "/" + attachments_new[i].path.replace('./', ''))
    }
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM TB_TR_PDPA_EMAIL  WHERE  id_email=? ", [id],
            async (err, selecte_email) => {
                var html_send = '';
                if (selecte_email[0].email_location == "top") {
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
                                                <a href="${host}/agree-email/${id}"
                                                    style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                                                    ยินยอม </a>
                                                <a href="${host}/notagree-email_csv/${id}"
                                                    style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #4fc3f7; border-radius: 5px; text-decoration:none;">
                                                    ไม่ยินยอม </a>
                                            </div>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                      
                                                        <p>${selecte_email[0].email_content}</p>
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
                                                  <p>${selecte_email[0].email_content}</p>
                                                    <div
                                                    style="border-top: 3px solid;color: rgb(240,185,11);text-align: center;margin-top: 30px;">
                                                    <a href="${host}/agree-email/${id}"
                                                        style="display: inline-block; padding: 5px 8px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                                                        ยินยอม </a>
                                                    <a href="${host}/notagree-email_csv/${id}"
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
                        to: selecte_email[0].email_to,
                        subject: 'PDPA 3in1 subject: ' + selecte_email[0].email_subject,
                        text: selecte_email[0].email_content,
                        html: html_send,
                        attachments: []
                    }

                    for (let i = 0; i < attachments_new.length; i++) {
                        mailOptions.attachments.push(attachments_new[i])
                    }

                    mail.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                } else {
                    var data = {
                        "from": "pipr@dol.go.th",
                        "to": `${selecte_email[0].email_to}`,
                        "subject": `${selecte_email[0].email_subject}`,
                        "body": `${html_send} ${attachments_new}`,
                        "attachment_url": [`${attachmentFile}`]
                    }
                    let res = await axios.post(`${process.env.EMAIL_API}`, data).then((response) => {
                        console.log(response);
                    }, (error) => {
                        console.log(error);
                    });
                    console.log("send_mail_file_first", res);
                }
            });
    });


}



controller.agree = (req, res) => {
    if (req.params.id == "undefined") {
        res.redirect("/");
    } else {
        var host = sethost(req);
        req.getConnection((err, conn) => {
            const { id } = req.params;
            conn.query("UPDATE TB_TR_PDPA_EMAIL SET  email_status=1,email_date_consent=NOW() WHERE  id_email=? ", [id],
                (err, update_pdpa_email) => {
                    res.render("cookie/view_email/email_agree", {
                        host,
                        session: req.session
                    });
                });
        });
    }
};


controller.not_agree = (req, res) => {
    var host = sethost(req);
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM  TB_TR_PDPA_EMAIL ORDER BY id_email DESC",
            (err, select_pdpa_email) => {
                var id_email = select_pdpa_email[0].id_email;
                res.render("cookie/view_email/form_donot_agree", {
                    id_email,
                    host,
                    session: req.session
                });
            });
    });
};


controller.not_agree_csv = (req, res) => {
    if (req.params.id == "undefined") {
        res.redirect("/");
    } else {
        var host = sethost(req);
        req.getConnection((err, conn) => {
            const id = req.params.id;
            conn.query("SELECT * FROM  TB_TR_PDPA_EMAIL WHERE id_email=?", [id],
                (err, select_pdpa_email) => {
                    var id_email = select_pdpa_email[0].id_email;
                    res.render("cookie/view_email/form_donot_agree", {
                        id_email, host,
                        session: req.session
                    });
                });
        });
    }
};


controller.resend_not_agree = (req, res) => {
    if (req.params.id == "undefined") {
        res.redirect("/");
    } else {
        var host = sethost(req);
        req.getConnection((err, conn) => {
            const { id } = req.params;
            conn.query("SELECT * FROM  TB_TR_PDPA_EMAIL WHERE id_email=? ", [id],
                (err, select_pdpa_email) => {
                    var id_email = select_pdpa_email[0].id_email;
                    res.render("cookie/view_email/form_donot_agree", {
                        id_email, host,
                        session: req.session
                    });
                });
        });
    }
};


controller.Dont_agree = (req, res) => {
    const { id } = req.params;
    var host = sethost(req);
    req.getConnection((err, conn) => {
        conn.query("UPDATE TB_TR_PDPA_EMAIL SET  email_status=2,email_date_consent=NOW() WHERE  id_email=? ", [id],
            (err, update_pdpa_email) => {
                res.render("cookie/view_email/email_notAgree", {
                    host,
                    session: req.session
                });
            });
    });
};

controller.resend = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const { id } = req.params;
        var host = sethost(req);

        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_EMAIL WHERE id_email=?", [id],
                (err, selecte_email) => {
                    conn.query("INSERT INTO  TB_TR_PDPA_EMAIL SET email_from=?,email_status=0,email_check_send=1,email_content=?,email_subject=?,email_to=?,email_date_send=NOW(),email_files=?,email_files_csv=?,email_firstname=?,email_lastname=?,email_location=?,acc_id=?,doc_id=? ",
                        [selecte_email[0].email_from, selecte_email[0].email_content, selecte_email[0].email_subject, selecte_email[0].email_to, selecte_email[0].email_files, selecte_email[0].email_files_csv, selecte_email[0].email_firstname, selecte_email[0].email_lastname, selecte_email[0].email_location, selecte_email[0].acc_id, selecte_email[0].doc_id],
                        async (err, insert_email) => {
                            var attachments_new = [];
                            var attachments_file = [];
                            if (selecte_email[0].email_files != null) {
                                var files_resend = selecte_email[0].email_files.split(",");
                                for (let i = 0; i < files_resend.length; i++) {
                                    attachments_new.push({
                                        filename: files_resend[i].replace("_", ",").split(",")[1],
                                        path: `./${process.env.FOLDER_FILESUPLOAD}/files_upload/` + files_resend[i]

                                    })
                                    attachments_file.push(
                                        files_resend.push(`${host}/${process.env.FOLDER_FILESUPLOAD}/files_upload/` + files_resend[i])
                                    )
                                }
                            }
                            var html_send;
                            if (selecte_email[0].email_location == "top") {
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
                                                                <a href="${host}/agree-email/${insert_email.insertId}"
                                                                    style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                                                                    ยินยอม </a>
                                                                <a href="${host}/notagree-email_csv/${insert_email.insertId}"
                                                                    style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #4fc3f7; border-radius: 5px; text-decoration:none;">
                                                                    ไม่ยินยอม </a>
                                                            </div>
                                                            <tbody>
                                                                <tr>
                                                                    <td>
                                                                      
                                                                        <p>${selecte_email[0].email_content}</p>
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
                                                      
                                                        <p>${selecte_email[0].email_content}</p>
                                                        <div
                                                        style="border-top: 3px solid;color: rgb(240,185,11);text-align: center;margin-top: 30px;">
                                                        <a href="${host}/agree-email/${insert_email.insertId}"
                                                            style="display: inline-block; padding: 5px 8px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                                                            ยินยอม </a>
                                                        <a href="${host}/notagree-email_csv/${insert_email.insertId}"
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
                                    to: selecte_email[0].email_to,
                                    subject: 'PDPA 3in1 subject: ' + selecte_email[0].email_subject,
                                    text: selecte_email[0].email_content,
                                    html: html_send,
                                    attachments: []
                                }

                                for (let i = 0; i < attachments_new.length; i++) {
                                    mailOptions.attachments.push(attachments_new[i])
                                }

                                mail.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log('Email sent: ' + info.response);
                                        console.log("upload success");
                                    }
                                });
                            } else {
                                var data = {
                                    "from": "pipr@dol.go.th",
                                    "to": `${selecte_email[0].email_to}`,
                                    "subject": `${selecte_email[0].email_subject}`,
                                    "body": `${html_send}`,
                                    "attachment_url": [`${attachments_file}`]
                                }
                                let res = await axios.post(`${process.env.EMAIL_API}`, data).then((response) => {
                                    console.log(response);
                                }, (error) => {
                                    console.log(error);
                                });
                                console.log("resend", res);
                            }
                        });
                    var user = '';
                    if (req.session.acc_id_control) {
                        user = req.session.acc_id_control
                    } else {
                        user = req.session.userid
                    }
                    conn.query("UPDATE TB_TR_PDPA_EMAIL SET email_check_send=0 WHERE id_email=?", [id],
                        (err, UPDATE_pdpa_email) => {
                            conn.query("SELECT DATE_FORMAT(email_date_send,'%Y-%m-%d') as day_inbox,email_firstname,email_lastname,email_content,DATE_FORMAT(email_date_send,'%d/%m/%Y %H:%i:%s') as date_inbox,id_email,email_files,email_to,email_status,email_content,email_subject,DATE_FORMAT(email_date_consent,'%d/%m/%Y %H:%i:%s') as date_consent FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id  WHERE mail.acc_id=? AND email_check_send=1  AND (DATE_FORMAT(email_date_send,'%Y-%m')=DATE_FORMAT(NOW(),'%Y-%m')) ORDER  BY id_email DESC",
                                [user], (err, pdpa_email) => {
                                    funchistory.funchistory(req, "E-mail Consent", `แก้ไขข้อมูล E-mail Consent ${selecte_email[0].email_to}`, req.session.userid)
                                    res.send({ pdpa_email })
                                });
                        });
                });
        });
    } else {
        res.redirect("/");
    }
};


module.exports = controller;
