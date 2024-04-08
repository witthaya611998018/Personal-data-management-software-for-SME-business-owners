const session = require("express-session");
const funchistory = require('../account_controllers')
require('dotenv').config()
const nodemailer = require('nodemailer');
const controller = {};


// controller.ActivityRopaList = (req, res) => {
//     console.log(req.session.userid);
//     console.log(req.session.admin);

//     if (typeof req.session.userid != "undefined") {
//         req.getConnection((err, conn) => {
//             conn.query("SELECT * FROM TB_TR_PDPA_CLASSIFICATION AS class LEFT JOIN  TB_TR_PDPA_PATTERN AS pat  ON class.pattern_id = pat.pattern_id LEFT JOIN TB_TR_PDPA_EVENT_PROCESS AS ep ON class.event_process_id = ep.event_process_id LEFT JOIN TB_MM_PDPA_CLASSIFICATION_SPECIAL_CONDITIONS AS csc ON class.classification_special_conditions_id = csc.classification_special_conditions_id LEFT JOIN  TB_TR_ACCOUNT AS acc ON class.acc_id = acc.acc_id  ORDER BY class.classify_id DESC", (_, data_classify) => {
//                 conn.query("SELECT *,acc.acc_id as  id_acc FROM TB_TR_ACCOUNT as acc LEFT JOIN TB_TR_DEL_ACC as del_acc ON acc.acc_id=del_acc.acc_id where acc.admin between 3 and 4 or acc.admin=5 ORDER BY  acc.acc_id DESC", (_, document_types) => {
//                     res.send({ document_types, data_classify })
//                 });
//             });
//         });
//     } else {
//         res.redirect("/");
//     }
// };


controller.ActivityRopaList = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            // let check_type = req.session.ropa
            let ropa = req.session.ropa
            var user = '';
            if (req.session.acc_id_control) {
                user = req.session.acc_id_control
            } else {
                user = req.session.userid
            }
            conn.query("SELECT *,DATE_FORMAT(pat.pattern_start_date,'%Y/%m/%d') as date_use FROM TB_TR_PDPA_CLASSIFICATION AS class LEFT JOIN  TB_TR_PDPA_PATTERN AS pat  ON class.pattern_id = pat.pattern_id LEFT JOIN TB_TR_PDPA_EVENT_PROCESS AS ep ON class.event_process_id = ep.event_process_id LEFT JOIN TB_MM_PDPA_CLASSIFICATION_SPECIAL_CONDITIONS AS csc ON class.classification_special_conditions_id = csc.classification_special_conditions_id LEFT JOIN  TB_TR_ACCOUNT AS acc ON class.acc_id = acc.acc_id LEFT JOIN  TB_MM_PDPA_PATTERN_PROCESSING_BASE AS ppb ON pat.pattern_processing_base_id=ppb.pattern_processing_base_id ORDER BY class.classify_id DESC", (_, data_classify) => {
                conn.query("SELECT acc.* FROM TB_TR_ACCOUNT acc LEFT JOIN TB_TR_DEL_ACC del_acc ON del_acc.acc_id = acc.acc_id    WHERE del_acc.acc_id IS NULL", (_, processor) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE user_id=?', [user], (err, policy) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_CLASSIFICATION ORDER BY classify_id DESC', (err, classifi_name) => {
                            conn.query('SELECT * FROM TB_TR_PDPA_DATA_OUT ORDER BY classify_id DESC', (err, data_out) => {
                                conn.query('SELECT * FROM TB_TR_PDPA_APPEAL as app LEFT JOIN TB_MM_PREFIX  as pre ON app.prefix_id=pre.prefix_id  ORDER BY app.classify_id desc', (err, appeal) => {
                                    conn.query('SELECT * FROM TB_TR_PDPA_DATA', async (err, data_person) => {
                                        let data_set = await query_data(req, data_classify, data_person, policy, data_out, appeal);
                                        //  fetch ข้อมูลมาตราการใน classifi
                                        let specifics = await fetchData(data_classify, req);
                                        res.send({ processor, data_set, data_classify, classifi_name, ropa, specifics });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    } else {
        res.redirect("/");
    }
};


controller.ActivityRopaUpdate = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body
        req.getConnection((err, conn) => {
            conn.query("UPDATE TB_TR_ACCOUNT SET  firstname=?,lastname=?,contact=?,email=?,phone=? WHERE acc_id=?",
                [data.data_account[1].split(' ')[0], data.data_account[1].split(' ')[1], data.data_account[2], data.data_account[3], data.data_account[4], data.data_account[0]], (err, insert_account) => {
                    res.redirect("/activity-ropa/" + req.session.ropa);
                });
        });
    } else {
        res.redirect("/");
    }
};




controller.ActivityRopaSearchClassifi = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body
        req.getConnection((err, conn) => {
            if (data.id == "all") {
                conn.query(" SELECT *,DATE_FORMAT(pat.pattern_start_date,'%Y/%m/%d') as date_use FROM TB_TR_PDPA_CLASSIFICATION AS class LEFT JOIN  TB_TR_PDPA_PATTERN AS pat  ON class.pattern_id = pat.pattern_id LEFT JOIN TB_TR_PDPA_EVENT_PROCESS AS ep ON class.event_process_id = ep.event_process_id LEFT JOIN TB_MM_PDPA_CLASSIFICATION_SPECIAL_CONDITIONS AS csc ON class.classification_special_conditions_id = csc.classification_special_conditions_id LEFT JOIN  TB_TR_ACCOUNT AS acc ON class.acc_id = acc.acc_id LEFT JOIN  TB_MM_PDPA_PATTERN_PROCESSING_BASE AS ppb ON pat.pattern_processing_base_id=ppb.pattern_processing_base_id ORDER BY class.classify_id DESC", (_, data_classify) => {
                    conn.query("SELECT * FROM TB_TR_ACCOUNT  AS acc LEFT JOIN TB_TR_DEL_ACC del_acc ON del_acc.acc_id=acc.acc_id  ORDER BY acc.acc_id DESC", (_, processor) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT', (err, policy) => {
                            conn.query('SELECT * FROM TB_TR_PDPA_CLASSIFICATION ORDER BY classify_id DESC', (err, classifi_name) => {
                                conn.query('SELECT * FROM TB_TR_PDPA_DATA_OUT ORDER BY classify_id DESC', (err, data_out) => {
                                    conn.query('SELECT * FROM TB_TR_PDPA_APPEAL as app LEFT JOIN TB_MM_PREFIX  as pre ON app.prefix_id=pre.prefix_id  ORDER BY app.classify_id desc', (err, appeal) => {
                                        conn.query('SELECT * FROM TB_TR_PDPA_DATA', async (err, data_person) => {
                                            let data_set = await query_data(req, data_classify, data_person, policy, data_out, appeal)
                                            let specifics = await fetchData(data_classify, req);
                                            res.send({ processor, data_set, data_classify, classifi_name, specifics })
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            } else {
                conn.query(" SELECT *,DATE_FORMAT(pat.pattern_start_date,'%Y/%m/%d') as date_use FROM TB_TR_PDPA_CLASSIFICATION AS class LEFT JOIN  TB_TR_PDPA_PATTERN AS pat  ON class.pattern_id = pat.pattern_id LEFT JOIN TB_TR_PDPA_EVENT_PROCESS AS ep ON class.event_process_id = ep.event_process_id LEFT JOIN TB_MM_PDPA_CLASSIFICATION_SPECIAL_CONDITIONS AS csc ON class.classification_special_conditions_id = csc.classification_special_conditions_id LEFT JOIN  TB_TR_ACCOUNT AS acc ON class.acc_id = acc.acc_id LEFT JOIN  TB_MM_PDPA_PATTERN_PROCESSING_BASE AS ppb ON pat.pattern_processing_base_id=ppb.pattern_processing_base_id  where class.classify_id=? ORDER BY class.classify_id DESC", [data.id], (_, data_classify) => {
                    conn.query("SELECT * FROM TB_TR_ACCOUNT  AS acc LEFT JOIN TB_TR_DEL_ACC del_acc ON del_acc.acc_id=acc.acc_id  ORDER BY acc.acc_id DESC", (_, processor) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT', (err, policy) => {
                            conn.query('SELECT * FROM TB_TR_PDPA_CLASSIFICATION ORDER BY classify_id DESC', (err, classifi_name) => {
                                conn.query('SELECT * FROM TB_TR_PDPA_DATA_OUT ORDER BY classify_id DESC', (err, data_out) => {
                                    conn.query('SELECT * FROM TB_TR_PDPA_APPEAL as app LEFT JOIN TB_MM_PREFIX  as pre ON app.prefix_id=pre.prefix_id  ORDER BY app.classify_id desc', (err, appeal) => {
                                        conn.query('SELECT * FROM TB_TR_PDPA_DATA', async (err, data_person) => {
                                            let data_set = await query_data(req, data_classify, data_person, policy, data_out, appeal)
                                            let specifics = await fetchData(data_classify, req);
                                            res.send({ processor, data_set, data_classify, classifi_name, specifics })
                                        });
                                    });
                                });
                            });
                        });
                    });
                });

            }
        });
    } else {
        res.redirect("/");
    }
};




controller.ActivityRopaSearchTypeUser = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body
        req.getConnection((err, conn) => {
            conn.query(" SELECT * FROM TB_TR_PDPA_CLASSIFICATION AS class LEFT JOIN  TB_TR_PDPA_PATTERN AS pat  ON class.pattern_id = pat.pattern_id LEFT JOIN TB_TR_PDPA_EVENT_PROCESS AS ep ON class.event_process_id = ep.event_process_id LEFT JOIN TB_MM_PDPA_CLASSIFICATION_SPECIAL_CONDITIONS AS csc ON class.classification_special_conditions_id = csc.classification_special_conditions_id LEFT JOIN  TB_TR_ACCOUNT AS acc ON class.acc_id = acc.acc_id ORDER BY class.classify_id DESC", (_, data_classify) => {
                conn.query("SELECT * FROM TB_TR_ACCOUNT  WHERE acc_id=?", [data.id], (_, processor) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT', (err, policy) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_DATA_OUT ORDER BY classify_id DESC', (err, data_out) => {
                            conn.query('SELECT * FROM TB_TR_PDPA_APPEAL as app LEFT JOIN TB_MM_PREFIX  as pre ON app.prefix_id=pre.prefix_id  ORDER BY app.classify_id desc', (err, appeal) => {
                                conn.query('SELECT * FROM TB_TR_PDPA_DATA', async (err, data_person) => {
                                    let data_set = await query_data(req, data_classify, data_person, policy, data_out, appeal)
                                    res.send({ processor, data_set, data_classify })
                                });
                            });

                        });
                    });
                });
            });
        });
    } else {
        res.redirect("/");
    }
};

controller.ActivityRopaSearchDataController = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body
        req.getConnection((err, conn) => {
            conn.query(" SELECT *,DATE_FORMAT(pat.pattern_start_date,'%Y/%m/%d') as date_use FROM TB_TR_PDPA_CLASSIFICATION AS class LEFT JOIN  TB_TR_PDPA_PATTERN AS pat  ON class.pattern_id = pat.pattern_id LEFT JOIN TB_TR_PDPA_EVENT_PROCESS AS ep ON class.event_process_id = ep.event_process_id LEFT JOIN TB_MM_PDPA_CLASSIFICATION_SPECIAL_CONDITIONS AS csc ON class.classification_special_conditions_id = csc.classification_special_conditions_id LEFT JOIN  TB_TR_ACCOUNT AS acc ON class.acc_id = acc.acc_id LEFT JOIN  TB_MM_PDPA_PATTERN_PROCESSING_BASE AS ppb ON pat.pattern_processing_base_id=ppb.pattern_processing_base_id ORDER BY class.classify_id DESC", (_, data_classify) => {
                conn.query("SELECT * FROM TB_TR_ACCOUNT  WHERE acc_id=?", [data.id], (_, processor) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT', (err, policy) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_DATA_OUT ORDER BY classify_id DESC', (err, data_out) => {
                            conn.query('SELECT * FROM TB_TR_PDPA_APPEAL as app LEFT JOIN TB_MM_PREFIX  as pre ON app.prefix_id=pre.prefix_id  ORDER BY app.classify_id desc', (err, appeal) => {
                                conn.query('SELECT * FROM TB_TR_PDPA_DATA', async (err, data_person) => {
                                    let data_set = await query_data(req, data_classify, data_person, policy, data_out, appeal)
                                    res.send({ processor, data_set, data_classify })
                                });
                            });

                        });
                    });
                });
            });
        });
    } else {
        res.redirect("/");
    }
};


controller.ActivityRopaSearchDataControllerSendMail = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_TR_PDPA_EMAIL_BOARD SET board_from='smartpdpa@gmail.com',board_check_send=1,board_status=0,board_content=?,board_subject=?,board_to=?,acc_id=?,ropa=1",
                [data.content, data.subject, data.mail_to, user], (err, insert_email) => {
                    // conn.query("SELECT * FROM  TB_TR_PDPA_EMAIL WHERE acc_id=? ORDER BY id_email DESC ", [req.session.userid], (err, selecte_email) => {
                    funchistory.funchistory(req, "การบันทึกรายการกิจกรรม (RoPA)", `เพิ่มข้อมูล การบันทึกรายการกิจกรรม (RoPA) ${data.mail_to}`, req.session.userid)
                    send_mail(req, insert_email.insertId)
                    res.send(JSON.stringify('success'))
                    // });
                });
        });
    } else {
        res.redirect("/");
    }
}

function send_mail(req, id) {
    // var attachmentFile = []
    // for (let i = 0; i < attachments_new.length; i++) {
    //     attachmentFile.push(host + "/" + attachments_new[i].path.replace('./', ''))
    // }
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM TB_TR_PDPA_EMAIL_BOARD  WHERE  board_id=? ", [id],
            async (err, selecte_email) => {
                var html_send = selecte_email[0].board_content
                // if (selecte_email[0].email_location == "top") {
                //     html_send = `
                //                     <body style="margin:0px; background: #f8f8f8; ">
                //                         <div width="100%"
                //                             style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;">
                //                             <div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px">
                //                                 <div style="padding: 40px; background: #fff;">
                //                                     <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                //                                         <div
                //                                             style="border-bottom: 3px solid;color:rgb(240,185,11);font-weight: 600;font-size: xx-large;margin-bottom: 20px;">
                //                                             <p style="text-align: center;margin-bottom: 20px;">
                //                                                 ALLTRA
                //                                             </p>
                //                                         </div>
                //                                         <div style="text-align: center;margin-bottom: 10px;">
                //                                             <a href="${host}/agree-email/${id}"
                //                                                 style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                //                                                 ยินยอม </a>
                //                                             <a href="${host}/notagree-email_csv/${id}"
                //                                                 style="display: inline-block; padding: 5px 8px;  font-size: 15px; color: #fff; background: #4fc3f7; border-radius: 5px; text-decoration:none;">
                //                                                 ไม่ยินยอม </a>
                //                                         </div>
                //                                         <tbody>
                //                                             <tr>
                //                                                 <td>

                //                                                     <p>${selecte_email[0].email_content}</p>
                //                                                 </td>
                //                                             </tr>
                //                                         </tbody>
                //                                     </table>
                //                                 </div>
                //                             </div>
                //                         </div>
                //                     </body>`
                // } else {
                //     html_send = `
                //     <body style="margin:0px; background: #f8f8f8; ">
                //         <div width="100%"
                //             style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;">
                //             <div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px">
                //                 <div style="padding: 40px; background: #fff;">
                //                     <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                //                         <div
                //                             style="border-bottom: 3px solid;color:rgb(240,185,11);font-weight: 600;font-size: xx-large;margin-bottom: 20px;">
                //                             <p style="text-align: center;margin-bottom: 20px;">
                //                             ALLTRA
                //                             </p>
                //                         </div>
                //                         <tbody>
                //                             <tr>
                //                                 <td>

                //                                     <p>${selecte_email[0].email_content}</p>
                //                                     <div
                //                                     style="border-top: 3px solid;color: rgb(240,185,11);text-align: center;margin-top: 30px;">
                //                                     <a href="${host}/agree-email/${id}"
                //                                         style="display: inline-block; padding: 5px 8px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #39c449; border-radius: 5px; text-decoration:none;">
                //                                         ยินยอม </a>
                //                                     <a href="${host}/notagree-email_csv/${id}"
                //                                         style="display: inline-block; padding: 5px 8px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #4fc3f7; border-radius: 5px; text-decoration:none;">
                //                                         ไม่ยินยอม </a>
                //                                 </div>
                //                                 </td>
                //                             </tr>
                //                         </tbody>
                //                     </table>
                //                 </div>
                //             </div>
                //         </div>
                //     </body>`
                // }
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
                        to: selecte_email[0].board_to,
                        subject: `PDPA 3in1 subject:${selecte_email[0].board_subject}`,
                        text: selecte_email[0].board_content,
                        html: html_send,
                        // attachments: []
                    }

                    // for (let i = 0; i < attachments_new.length; i++) {
                    //     mailOptions.attachments.push(attachments_new[i])
                    // }
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



let query_data = async (req, data, data_person, policy, data_out, appeal) => {
    var person_data_name = [];
    var policy_data_name = []
    var data_out_new = []
    var data_appeal_new = []
    var complaint_new = []
    var complaint_approve_reject_new = []
    var appeal_detail_summary_new = []
    var name_appeal_new = []
    var data_id_appeal_new = []
    var data_out_previews_new = []
    var classify_explain_process = [] //วัตถุประสงค์

    var Complainant = [] // ผู้ร้องเรียน
    var ComplaintRights = [] // สิทธิการร้องเรียน

    var test = [] // มาตราการ
    for (let i = 0; i < data.length; i++) {
        classify_explain_process.push(data[i].classify_explain_process)
        var data_name = [];
        var have_data_name = 0;
        for (let k = 0; k < data_person.length; k++) {
            if (data[i].doc_id_person_data_pattern.search((data_person[k].data_id)) > -1) {
                data_name.push(data_person[k].data_name);
                have_data_name++;
            }
        }
        if (have_data_name > 0) {
            person_data_name.push(data_name);
        } else {
            person_data_name.push('-');
        }
        data_name = [];
        have_data_name = 0;
        var data_name_policy = [];
        var have_data_name_policy = 0;
        // console.log("data", data[i].doc_id);
        for (let k = 0; k < policy.length; k++) {
            if (data[i].doc_id.search((policy[k].doc_id)) > -1) {
                data_name_policy.push("<br>" + policy[k].doc_name);
                have_data_name_policy++;
            }
        }
        if (have_data_name_policy > 0) {
            policy_data_name.push(data_name_policy);
        } else {
            policy_data_name.push('-');
        }
        var data_out_previews = []
        var data_name_out = [];
        var have_data_name_out = 0;
        for (let k = 0; k < data_out.length; k++) {
            if (data[i].classify_id == data_out[k].classify_id) {
                if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data_out[k].res_link)) {
                    data_name_out.push(`<br> ${data_out[k].res_link} <a href="/dataoutdetails/${data_out[k].data_out_id}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>`);
                    data_out_previews.push(`<br> ${data_out[k].res_link} `)
                } else {
                    data_name_out.push(`<br> API <a href="/dataoutdetails/${data_out[k].data_out_id}" target="_blank"  class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>`);
                    data_out_previews.push('<br> API')
                }
                have_data_name_out++;
            }
        }
        if (have_data_name_out > 0) {
            data_out_new.push(data_name_out);
            data_out_previews_new.push(data_out_previews)
        } else {
            data_out_new.push('-');
            data_out_previews_new.push('-')
        }
        var data_name_appeal = [];
        var have_data_name_appeal = 0;

        var complaint_approve_reject = []
        var appeal_detail_summary = []
        var name_appeal = []
        var data_id_all_appeal = []
        var complaint = []



        for (let k = 0; k < appeal.length; k++) {
            if (data[i].classify_id == appeal[k].classify_id) {

                if (appeal[k].appeal_revoke == 1) {
                    complaint.push('การเพิกถอนความยินยอม ')
                } if (appeal[k].appeal_access == 1) {
                    complaint.push('การเข้าถึงข้อมูลส่วนบุคคล')
                } if (appeal[k].appeal_edit_information == 1) {
                    complaint.push('การเเก้ไขข้อมูลส่วนบุคคลให้ถูกต้อง')
                } if (appeal[k].appeal_delet_information == 1) {
                    complaint.push('การลบข้อมูลส่วนบุคคล')
                } if (appeal[k].appeal_suspend == 1) {
                    complaint.push('การระงับการประมวลผลข้อมูล')
                } if (appeal[k].appeal_transfer == 1) {
                    complaint.push('การให้โอนย้ายข้อมูลส่วนบุคคล')
                } if (appeal[k].appeal_oppose == 1) {
                    complaint.push('การคัดค้านการประมวลผลข้อมูล')
                } if (appeal[k].appeal_decision == 1) {
                    // complaint.push('<br> การไม่ตกอยู่ภายใต้การสินใจอัตโตโนมัตเพียงอย่างเดียว')
                    complaint.push('การไม่ตกอยู่ภายใต้การสินใจอัตโตโนมัตเพียงอย่างเดียว')

                }
                // สิทธิที่เเสดงหน้าเว็บ
                let complaintShow = ""
                complaint.map((items, index) => {
                    complaintShow += `${index + 1}.${items}<br>`
                })
                if (appeal[k].appeal_approved_complaint == 1) {
                    complaint_approve_reject.push(`
                    <br> อนุมัติตามคำร้องเรียน
                    <a href="/appreal_information/${appeal[k].id_ap}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                    `)
                } else if (appeal[k].appeal_approved_complaint == 2) {
                    complaint_approve_reject.push(`
                   <br> ปฏิเสธเรื่องร้องเรียน
                    <a href="/appreal_information/${appeal[k].id_ap}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                    `)
                } else if (appeal[k].appeal_approved_complaint == 0) {
                    complaint_approve_reject.push(`
                  <br> รอตอบกลับ
                    <a href="/appreal_information/${appeal[k].id_ap}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                    `)
                }
                if (appeal[k].appeal_detail_summary != null || appeal[k].appeal_detail_summary != '') {
                    if (k == 0) {
                        appeal_detail_summary.push(appeal[k].appeal_detail_summary + ` <a href="/appreal_information/${appeal[k].id_ap}"  target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>`)
                    } else {
                        appeal_detail_summary.push("<br> " + appeal[k].appeal_detail_summary + ` <a href="/appreal_information/${appeal[k].id_ap}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>`)
                    }
                }
                // console.log("appeal[k].appeal_detail", appeal[k].appeal_detail);
                //  ตรวจสอบ มีรายละเอียดของเเจ้ง สิทธิไหม
                if (appeal[k].appeal_detail == null || appeal[k].appeal_detail == "") {
                    data_name_appeal.push(`<br>
                    ${appeal[k].prefix_name}${appeal[k].appeal_firstname} ${appeal[k].appeal_lastname}
                     <a href="/appreal_information/${appeal[k].id_ap}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                    `);
                    if (k == 0) {
                        name_appeal.push(`${appeal[k].prefix_name}${appeal[k].appeal_firstname} ${appeal[k].appeal_lastname} : ${complaint} <a href="/appreal_information/${appeal[k].id_ap}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>`)
                    } else {
                        name_appeal.push(`<br>${appeal[k].prefix_name}${appeal[k].appeal_firstname} ${appeal[k].appeal_lastname} : ${complaint} <a href="/appreal_information/${appeal[k].id_ap}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>`)
                    }
                    data_id_all_appeal.push(appeal[k].id_ap)
                    Complainant.push(`${appeal[k].prefix_name}${appeal[k].appeal_firstname} ${appeal[k].appeal_lastname} `)
                    ComplaintRights.push(complaintShow)

                } else {
                    data_name_appeal.push(`${appeal[k].prefix_name}${appeal[k].appeal_firstname} ${appeal[k].appeal_lastname} : ${appeal[k].appeal_detail} <a href="/appreal_information/${appeal[k].id_ap}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>`);
                    if (k == 0) {
                        name_appeal.push(`${appeal[k].prefix_name}${appeal[k].appeal_firstname} ${appeal[k].appeal_lastname} : ${complaint} <a href="/appreal_information/${appeal[k].id_ap}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a> `)
                    } else {
                        name_appeal.push(`
                        <br>${appeal[k].prefix_name}${appeal[k].appeal_firstname} ${appeal[k].appeal_lastname} :
                         ${complaint} 
                         <a href="/appreal_information/${appeal[k].id_ap}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                         `)
                    }
                    data_id_all_appeal.push(appeal[k].id_ap)
                    Complainant.push(`${appeal[k].prefix_name}${appeal[k].appeal_firstname} ${appeal[k].appeal_lastname} `)
                    ComplaintRights.push(complaintShow)
                }

                have_data_name_appeal++;
            }
        }
        // console.log("data_appeal_new", data_appeal_new);
        if (have_data_name_appeal > 0) {
            data_appeal_new.push(data_name_appeal);
            complaint_new.push(complaint);
            complaint_approve_reject_new.push(complaint_approve_reject);
            appeal_detail_summary_new.push(appeal_detail_summary)
            name_appeal_new.push(name_appeal)
            data_id_appeal_new.push(data_id_all_appeal)
        } else {
            data_appeal_new.push('N/A');
            complaint_new.push('N/A');
            complaint_approve_reject_new.push('-');
            appeal_detail_summary_new.push('-');
            name_appeal_new.push('-');
            data_id_appeal_new.push('-')
            Complainant.push("-")
            ComplaintRights.push('-')
        }
    }


    return {
        person_data_name, policy_data_name, data_out_new, data_appeal_new,
        complaint_new, complaint_approve_reject_new, appeal_detail_summary_new,
        name_appeal_new, data_id_appeal_new, data_out_previews_new, classify_explain_process, Complainant, ComplaintRights
    }

}


async function fetchData(data, req) {
    let specific = [];
    for (const items of data) {
        let test = await queryDataFromDatabase(items, req);
        specific.push(test);
    }
    return specific;
}

async function queryDataFromDatabase(data, req) {
    return new Promise((resolve, reject) => {
        req.getConnection((err, conn) => {
            conn.query('SELECT specificclass.classification_measures_section_name,specificclass.specific_id,specificclass.classification_specific_id FROM TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION   AS specificclass  LEFT JOIN TB_TR_PDPA_EVENT_PROCESS AS event ON specificclass.event_process_id=event.event_process_id  LEFT JOIN  TB_TR_PDPA_CLASSIFICATION as class on specificclass.classify_id=class.classify_id  WHERE specificclass.classify_id =?  AND specificclass.pattern_id=?  ORDER BY  specificclass.specific_id DESC',
                [data.classify_id, data.pattern_id], (err, specificOnClassifi) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(specificOnClassifi);
                    }
                });
        })
    });
}

module.exports = controller;

