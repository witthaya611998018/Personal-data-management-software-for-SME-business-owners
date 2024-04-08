const session = require("express-session");
// const fs = require('fs');
// const csv = require('csv-parser');
// const nodemailer = require('nodemailer');
const funchistory = require('../account_controllers')
const controller = {};

function check_user_login(req) {
    let user = ''
    if (req.session.acc_id_control) {
        user = req.session.acc_id_control
    } else {
        user = req.session.userid;
    }
    return user
}

controller.appeal_view_add = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_PDPA_CLASSIFICATION;', (err, classify) => {
                conn.query("SELECT * FROM TB_MM_PREFIX", (err, prefix) => {
                    funchistory.funchistory(req, "รับเรื่องร้องเรียน การละเมิด", `เข้าสู่เมนู รับเรื่องร้องเรียน การละเมิด`, req.session.userid)
                    conn.query("SELECT TB_TR_ACCOUNT.acc_id,TB_TR_ACCOUNT.firstname,TB_TR_ACCOUNT.lastname FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5)", (err, account) => {
                        res.render('./appeal_infraction/appeal_infraction_add', {
                            prefix,
                            classify,
                            account,
                            session: req.session
                        });
                    });

                });

            });
        });
    } else {
        res.redirect("/");
    }
}


controller.infraction_list = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        req.getConnection((err, conn) => {
            // conn.query("SELECT *,DATE_FORMAT(infraction_date,'%d/%m/%Y') as day_complaint,infraction.infraction_id as id_infraction_id FROM TB_TR_PDPA_APPEAL_INFRACTION AS infraction LEFT JOIN TB_TR_APPEAL_INFRACTION_INFRACTIONTYPE_COMBINED AS combined ON combined.infraction_id=infraction.infraction_id LEFT JOIN TB_MM_PREFIX as prefix ON infraction.prefix_id=prefix.prefix_id WHERE infraction.acc_id=?   AND (DATE_FORMAT(infraction_date,'%Y-%m')=DATE_FORMAT(NOW(),'%Y-%m'))  ORDER BY infraction.infraction_id DESC", [user], (err, infraction) => {
            conn.query("SELECT *,DATE_FORMAT(infraction_date,'%d/%m/%Y') as day_complaint,infraction.infraction_id as id_infraction_id,DATE_FORMAT(infraction_date,'%Y-%m-%d %H:%i:%s') as date_insert,DATE_FORMAT(NOW(),'%Y-%m-%d %H:%i:%s') as date_now  FROM TB_TR_PDPA_APPEAL_INFRACTION AS infraction LEFT JOIN TB_TR_APPEAL_INFRACTION_INFRACTIONTYPE_COMBINED AS combined ON combined.infraction_id=infraction.infraction_id LEFT JOIN TB_MM_PREFIX as prefix ON infraction.prefix_id=prefix.prefix_id WHERE infraction.acc_id=?    ORDER BY infraction.infraction_id DESC", [user], (err, infraction) => {

                conn.query("SELECT * FROM TB_TR_INFORMATION_INFRACTIONTYPE WHERE infractiontype_type=1 ORDER BY  infractiontype_id DESC", (err, infractiontype) => {
                    conn.query("SELECT board_id,board_type,infraction_id,DATE_FORMAT(board_date_send,'%d/%m/%Y %H:%i:%s') as day_inbox FROM TB_TR_PDPA_EMAIL_BOARD as mail WHERE mail.acc_id=? AND board_check_send=1 AND ropa=0 AND board_type=2 ORDER  BY board_id DESC", [user], (err, email_owner_check) => {
                        conn.query("SELECT board_id,board_type,infraction_id,DATE_FORMAT(board_date_send,'%d/%m/%Y %H:%i:%s') as day_inbox FROM TB_TR_PDPA_EMAIL_BOARD as mail WHERE mail.acc_id=? AND board_check_send=1 AND ropa=0 AND board_type=1 ORDER  BY board_id DESC", [user], (err, email_board) => {

                            if (infraction.length <= 0 || infraction.length == "") {
                                infraction = "ไม่มีข้อมูล"
                            }
                            if (email_owner_check.length <= 0 || email_owner_check.length == "") {
                                email_owner_check = "ไม่มีข้อมูล"
                            }
                            if (email_board.length <= 0 || email_board.length == "") {
                                email_board = "ไม่มีข้อมูล"
                            }
                            res.send({ infraction, infractiontype, email_owner_check, email_board });
                        })
                    });
                });
            });
        });
    } else {
        res.redirect("/");
    }
}


controller.infraction_detail = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        const { id } = req.params
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "รับเรื่องร้องเรียนการละเมิด", `เข้าสู่เมนู ดูรายละเอียดการละเมิด`, req.session.userid)
            conn.query("SELECT * FROM TB_TR_INFORMATION_INFRACTIONTYPE  ORDER BY  infractiontype_id DESC", (err, infractiontype) => {
                conn.query('SELECT *,DATE_FORMAT(infraction_date," %d/%m/%Y") as day_complaint,DATE_FORMAT(infraction_measures_date," %d/%m/%Y") as day_measures,DATE_FORMAT(infraction_measures_date," %Y-%m-%d") as day_last FROM TB_TR_PDPA_APPEAL_INFRACTION AS infraction LEFT JOIN TB_TR_APPEAL_INFRACTION_INFRACTIONTYPE_COMBINED AS combined ON combined.infraction_id=infraction.infraction_id LEFT JOIN TB_MM_PREFIX as prefix ON infraction.prefix_id=prefix.prefix_id LEFT JOIN   TB_TR_PDPA_CLASSIFICATION as class ON infraction.classify_id=class.classify_id  WHERE infraction.infraction_id=? ORDER BY infraction.infraction_id DESC', [id], (err, infraction) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_DATA_TYPE ORDER BY  data_type_id DESC", (err, data_type) => {
                        conn.query("SELECT * FROM TB_TR_MEASURES  order by measures_id desc;", (err, measures) => {
                            conn.query("SELECT * FROM TB_TR_MEASURES_RISK_BASED_APPROACH AS approach LEFT JOIN  TB_TR_MEASURES AS measures ON approach.measures_id=measures.measures_id LEFT JOIN TB_TR_INFORMATION_ASSETS  as ass ON approach.assets_id=ass.assets_id WHERE measures.acc_id=? AND measures.specify_id=2  ORDER BY approach.approach_id DESC", [user], (err, approach) => {
                                conn.query("SELECT *,specifi.specific_id as id_specifi FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id WHERE measures.specify_id=3 AND measures.acc_id=? ORDER BY specifi.specific_id DESC", [user], (err, specific) => {
                                    conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE  doc_status=2 AND  type !=3 AND doc_action =0 AND  user_id=?", [user], (err, doc) => {
                                        var date = new Date(infraction[0].day_last);
                                        date.setDate(date.getDate() + infraction[0].infraction_measures_date_count);
                                        var day_last = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()

                                        if (infraction[0].infraction_infringement == 1) {



                                            let infractiontype_type_violation_id = infraction[0].infractiontype_type_violation_id.split(',')
                                            let infractiontype_effect_id = infraction[0].infractiontype_effect_id.split(',')
                                            let infractiontype_effectiveness_id = infraction[0].infractiontype_effectiveness_id.split(',')
                                            let measures_id = infraction[0].measures_id.split(',')
                                            let approach_id = infraction[0].approach_id.split(',')
                                            let specific_id = infraction[0].specific_id.split(',')
                                            let doc_id = infraction[0].doc_id.split(',')
                                            let violation_name = ''
                                            let effect_name = ''
                                            let effectiveness_name = ''
                                            let measures_name = ''
                                            let approach_name_assets = ''
                                            let approach_name_newwork = ''
                                            let specific_name = ''

                                            for (let i = 0; i < infractiontype.length; i++) {
                                                if (infractiontype_type_violation_id.indexOf(String(infractiontype[i].infractiontype_id)) > -1) {
                                                    violation_name += `${infractiontype[i].infractiontype_name}, `
                                                }
                                                if (infractiontype_effect_id.indexOf(String(infractiontype[i].infractiontype_id)) > -1) {
                                                    effect_name += `${infractiontype[i].infractiontype_name}, `
                                                }
                                                if (infractiontype_effectiveness_id.indexOf(String(infractiontype[i].infractiontype_id)) > -1) {
                                                    effectiveness_name += `${infractiontype[i].infractiontype_name}, `
                                                }
                                            }
                                            let data_type_id = infraction[0].data_type_id.split(',')
                                            let data_type_persanal = ''
                                            for (let i = 0; i < data_type.length; i++) {
                                                if (data_type_id.indexOf(String(data_type[i].data_type_id)) > -1) {
                                                    data_type_persanal += `${data_type[i].data_type_name}, `
                                                }
                                            }
                                            for (let i = 0; i < measures.length; i++) {
                                                if (measures_id.indexOf(String(measures[i].measures_id)) > -1) {
                                                    measures_name += `${measures[i].measures_section_name}, `
                                                }
                                            }
                                            for (let i = 0; i < approach.length; i++) {
                                                if (approach[i].approach_heading_risk_based == 1) {
                                                    if (approach_id.indexOf(String(approach[i].approach_id)) > -1) {
                                                        approach_name_assets += `${approach[i].measures_section_name}, `
                                                    }
                                                } else {
                                                    if (approach_id.indexOf(String(approach[i].approach_id)) > -1) {
                                                        approach_name_newwork += `${approach[i].measures_section_name}, `
                                                    }
                                                }
                                            }
                                            for (let i = 0; i < specific.length; i++) {
                                                if (specific_id.indexOf(String(specific[i].id_specifi)) > -1) {
                                                    specific_name += `${specific[i].measures_section_name}, `
                                                }
                                            }
                                            let doc_detail = []
                                            for (let i = 0; i < doc.length; i++) {
                                                if (doc_id.indexOf(String(doc[i].doc_id)) > -1) {
                                                    doc_detail.push({
                                                        'doc_id': doc[i].doc_id,
                                                        'doc_name': doc[i].doc_name
                                                    })
                                                }
                                            }
                                            funchistory.funchistory(req, `เรื่องร้องเรียนการละเมิด `, `ดูข้อมูล ${infraction[0].infraction_infringement_customer}`, req.session.userid)
                                            res.render('./appeal_infraction/appeal_infraction_detail', {
                                                infraction,
                                                infractiontype,
                                                day_last, violation_name, data_type_persanal,
                                                effect_name, effectiveness_name, approach_name_newwork,
                                                measures_name, approach_name_assets, specific_name,
                                                doc_detail,
                                                session: req.session
                                            });
                                        } else {
                                            funchistory.funchistory(req, `เรื่องร้องเรียนการละเมิด `, `ดูข้อมูล ${infraction[0].infraction_infringement_customer}`, req.session.userid)
                                            res.render('./appeal_infraction/appeal_infraction_detail', {
                                                infraction,
                                                infractiontype,
                                                day_last,
                                                session: req.session
                                            });
                                        }
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
}



controller.get_data = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_INFORMATION_INFRACTIONTYPE WHERE acc_id=? ORDER BY infractiontype_id DESC', [user], (err, infractiontype) => {
                conn.query("SELECT * FROM TB_MM_PDPA_DATA_TYPE ORDER BY  data_type_id DESC", (err, data_type) => {
                    conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE  doc_status=2 AND  type !=3 AND doc_action =0 AND  user_id=?", [user], (err, doc) => {
                        conn.query("SELECT * FROM TB_TR_MEASURES_RISK_BASED_APPROACH AS approach LEFT JOIN  TB_TR_MEASURES AS measures ON approach.measures_id=measures.measures_id LEFT JOIN TB_TR_INFORMATION_ASSETS  as ass ON approach.assets_id=ass.assets_id WHERE measures.acc_id=? AND measures.specify_id=2  ORDER BY approach.approach_id DESC", [user], (err, approach) => {
                            conn.query("SELECT *,specifi.specific_id as id_specific FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id WHERE measures.specify_id=3 AND measures.acc_id=? ORDER BY specifi.specific_id DESC", [user], (err, specific) => {
                                conn.query("SELECT * FROM  TB_TR_MEASURES as m LEFT JOIN  TB_TR_MEASURES_TYPE as mt ON m.measures_type_id=mt.measures_type_id LEFT JOIN  TB_TR_PDPA_DOCUMENT as doc  ON m.doc_id=doc.doc_id WHERE specify_id=1  ORDER BY measures_id DESC", (err, measures) => {
                                    if (data_type.length <= 0 || data_type.length == "") {
                                        data_type = "ไม่มีข้อมูล"
                                    }
                                    if (doc.length <= 0 || doc.length == "") {
                                        doc = "ไม่มีข้อมูล"
                                    }
                                    if (infractiontype.length <= 0 || infractiontype.length == "") {
                                        infractiontype = "ไม่มีข้อมูล"
                                    }
                                    if (specific.length <= 0 || specific.length == "") {
                                        specific = "ไม่มีข้อมูล"
                                    }
                                    if (approach.length <= 0 || approach.length == "") {
                                        approach = "ไม่มีข้อมูล"
                                    }
                                    if (measures.length <= 0 || measures.length == "") {
                                        measures = "ไม่มีข้อมูล"
                                    }
                                    res.send({ data_type, doc, infractiontype, specific, approach, measures })
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
}


controller.save = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        const data = req.body
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_PDPA_APPEAL_INFRACTION order by infraction_id DESC limit 1;', (err, selecte_infraction) => {
                let complaint_number = '00000'
                if (selecte_infraction.length > 0) {
                    complaint_number = Number(selecte_infraction[0].infraction_complaint_number) + 1
                    complaint_number = String(complaint_number).padStart(5, '0')
                } else {
                    complaint_number = '00001'
                }
                if (data.infraction_infringement == 2) {
                    let consult = 0
                    if (data.infraction_measures_consult) {
                        consult = 1
                    }
                    conn.query('INSERT  INTO  TB_TR_PDPA_APPEAL_INFRACTION SET acc_id=?,infraction_complaint_number=?,infraction_measures_consult=?,infraction_date=?,infraction_email=?,prefix_id=?,infraction_firstname=?,infraction_lastname=?,infraction_address=?,infraction_contact=?,classify_id=?,infraction_infringement_customer=?,infraction_assess_credibility=?,infraction_assess_credibility_explain=?,infraction_infringement=? ',
                        [user, complaint_number, consult, data.infraction_date, data.infraction_email, data.prefix_name.split(',')[1], data.infraction_firstname, data.infraction_lastname, data.infraction_address, data.infraction_contact, data.classify_id, data.infraction_infringement_customer, data.infraction_assess_credibility, data.infraction_assess_credibility_explain, data.infraction_infringement], (err, insert_infaction) => {
                            funchistory.funchistory(req, `เรื่องร้องเรียนการละเมิด `, `เพิ่มข้อมูล ${data.infraction_infringement_customer}`, req.session.userid)
                            res.redirect("/appeal/infraction/list");
                        });
                } else {
                    let consult = 0
                    if (data.infraction_measures_consult) {
                        consult = 1
                    }
                    conn.query('INSERT  INTO  TB_TR_PDPA_APPEAL_INFRACTION SET acc_id=?,infraction_complaint_number=?,infraction_measures_consult=?,infraction_date=?,infraction_email=?,prefix_id=?,infraction_firstname=?,infraction_lastname=?,infraction_address=?,infraction_contact=?,classify_id=?,infraction_infringement_customer=?,infraction_assess_credibility=?,infraction_assess_credibility_explain=?,infraction_infringement=?,infraction_measures_date=?,infraction_measures_date_count=?,infraction_measures_supervisor=? ',
                        [user, complaint_number, consult, data.infraction_date, data.infraction_email, data.prefix_name.split(',')[1], data.infraction_firstname, data.infraction_lastname, data.infraction_address, data.infraction_contact, data.classify_id, data.infraction_infringement_customer, data.infraction_assess_credibility, data.infraction_assess_credibility_explain, data.infraction_infringement, data.infraction_measures_date, data.infraction_measures_date_count, data.infraction_measures_supervisor], (err, insert_infaction) => {
                            conn.query('INSERT  INTO  TB_TR_APPEAL_INFRACTION_INFRACTIONTYPE_COMBINED SET combined_assess_risk=?,data_type_explain=?,personal_data_breach_explain=?,combined_annotation=?,infraction_id=?,infractiontype_type_violation_id=?, combined_infringement_name=?,violation_action_explain=?,measures_id=?,approach_id=?,specific_id=?,doc_id=?,infractiontype_legal_status_id=?,infractiontype_legal_status_id_explain=?,data_type_id=?,personal_information_records_explain=?,infractiontype_effect_id=?,infractiontype_effect_id_explain=?,severity_impact_explain=?,infractiontype_effectiveness_id=?,infractiontype_effectiveness_id_explain=?,infractiontype_healing_explain=?',
                                [data.combined_assess_risk, data.data_type_explain, data.personal_data_breach_explain, data.combined_annotation, insert_infaction.insertId, data.infractiontype_type_violation_id.toString(), data.combined_infringement_name, data.violation_action_explain, data.measures_id.toString(), data.approach_id.toString(), data.specific_id.toString(), data.doc_id.toString(), data.infractiontype_legal_status_id.toString(), data.infractiontype_legal_status_id_explain, data.data_type_id.toString(), data.personal_information_records_explain, data.infractiontype_effect_id.toString(), data.infractiontype_effect_id_explain, data.severity_impact_explain, data.infractiontype_effectiveness_id.toString(), data.infractiontype_effectiveness_id_explain, data.infractiontype_healing_explain], (err, insert_two_join_table) => {
                                    funchistory.funchistory(req, `เรื่องร้องเรียนการละเมิด `, `เพิ่มข้อมูล ${data.infraction_infringement_customer}`, req.session.userid)
                                    res.redirect("/appeal/infraction/list");
                                });
                        });
                }
            });
        });
    } else {
        res.redirect("/");
    }
}



controller.type_save = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        const data = req.body
        let redirect = ''
        if (data.infractiontype_name_add) {
            redirect = "/appeal/infraction/add"
            data.infractiontype_name = data.infractiontype_name_add
        } else {
            redirect = "/appeal/infraction/manage/type" + data.infractiontype_type
        }
        let type = ''
        if (data.infractiontype_type == 1) {
            type = 'หัวเรื่องการละเมิด'
        } else if (data.infractiontype_type == 2) {
            type = 'ประเภทหรือสถานะเจ้าข้อมูลส่วนบุคคล'
        } else if (data.infractiontype_type == 3) {
            type = 'ผลกระทบ'
        } else if (data.infractiontype_type == 4) {
            type = 'สถานะทางกฏหมายของผู้ควบคุมข้อมูลส่วนบุคคล'
        }
        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_TR_INFORMATION_INFRACTIONTYPE SET infractiontype_name=?,infractiontype_type=?,acc_id=?",
                [data.infractiontype_name, data.infractiontype_type, user], (err, insert_infraction) => {
                    funchistory.funchistory(req, ` ประเภทของการการละเมิด `, `เพิ่มข้อมูล ${type}`, req.session.userid)
                    res.redirect(redirect);
                });
        });
    } else {
        res.redirect("/");
    }
}


controller.infraction_view_edit = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        const { id } = req.params
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_MM_PDPA_DATA_TYPE ORDER BY  data_type_id DESC", (err, data_type) => {
                conn.query('SELECT * FROM TB_TR_PDPA_CLASSIFICATION;', (err, classify) => {
                    conn.query("SELECT * FROM TB_MM_PREFIX", (err, prefix) => {
                        conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE  doc_status=2 AND  type !=3 AND doc_action =0 AND  user_id=?", [user], (err, doc) => {
                            conn.query('SELECT *,infraction.infraction_id AS id_infraction,DATE_FORMAT(infraction_date,"%Y-%m-%d") as day_complaint,DATE_FORMAT(infraction_measures_date,"%Y-%m-%d") as day_measures_date FROM TB_TR_PDPA_APPEAL_INFRACTION AS infraction LEFT JOIN TB_TR_APPEAL_INFRACTION_INFRACTIONTYPE_COMBINED AS combined ON combined.infraction_id=infraction.infraction_id LEFT JOIN TB_MM_PREFIX as prefix ON infraction.prefix_id=prefix.prefix_id   WHERE infraction.infraction_id=? ORDER BY infraction.infraction_id DESC', [id], (err, infraction) => {
                                conn.query("SELECT * FROM TB_TR_INFORMATION_INFRACTIONTYPE ORDER BY  infractiontype_id DESC", (err, infractiontype) => {
                                    conn.query("SELECT * FROM TB_TR_MEASURES_RISK_BASED_APPROACH AS approach LEFT JOIN  TB_TR_MEASURES AS measures ON approach.measures_id=measures.measures_id LEFT JOIN TB_TR_INFORMATION_ASSETS  as ass ON approach.assets_id=ass.assets_id WHERE measures.acc_id=? AND measures.specify_id=2  ORDER BY approach.approach_id DESC", [user], (err, approach) => {
                                        conn.query("SELECT *,specifi.specific_id as id_specific FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id WHERE measures.specify_id=3 AND measures.acc_id=? ORDER BY specifi.specific_id DESC", [user], (err, specific) => {
                                            conn.query("SELECT * FROM  TB_TR_MEASURES as m LEFT JOIN  TB_TR_MEASURES_TYPE as mt ON m.measures_type_id=mt.measures_type_id LEFT JOIN  TB_TR_PDPA_DOCUMENT as doc  ON m.doc_id=doc.doc_id WHERE specify_id=1  ORDER BY measures_id DESC", (err, measures) => {
                                                // funchistory.funchistory(req, `เรื่องร้องเรียนการละเมิด`, `ดูข้อมูล ${type}`, req.session.userid)
                                                let infractiontype_violation = []
                                                let infractiontype_effect = []
                                                let infractiontype_effectiveness = []
                                                let infractiontype_status = []

                                                for (let i = 0; i < infractiontype.length; i++) {
                                                    if (infractiontype[i].infractiontype_type == 1) {
                                                        infractiontype_violation.push(infractiontype[i])
                                                    } else if (infractiontype[i].infractiontype_type == 2) {
                                                        infractiontype_effect.push(infractiontype[i])
                                                    } else if (infractiontype[i].infractiontype_type == 3) {
                                                        infractiontype_effectiveness.push(infractiontype[i])
                                                    } else if (infractiontype[i].infractiontype_type == 4) {
                                                        infractiontype_status.push(infractiontype[i])
                                                    }
                                                }
                                                if (infraction[0].infraction_infringement == 1) {
                                                    let violation = infraction[0].infractiontype_type_violation_id.split(',')
                                                    let measures_id = infraction[0].measures_id.split(',')
                                                    let approach_id = infraction[0].approach_id.split(',')
                                                    let specific_id = infraction[0].specific_id.split(',')
                                                    let status = infraction[0].infractiontype_legal_status_id.split(',')
                                                    let data_type_id = infraction[0].data_type_id.split(',')
                                                    let effect = infraction[0].infractiontype_effect_id.split(',')
                                                    let effectiveness = infraction[0].infractiontype_effectiveness_id.split(',')
                                                    let doc_id = infraction[0].doc_id.split(',')
                                                    res.render('./appeal_infraction/appeal_infraction_edit', {
                                                        prefix, effectiveness, violation, measures_id,
                                                        approach_id, specific_id, status, measures, approach,
                                                        data_type_id, effect, doc_id, doc, specific,
                                                        classify, data_type, infractiontype_effect,
                                                        infraction, infractiontype_violation,
                                                        infractiontype_effectiveness,
                                                        infractiontype_status,
                                                        session: req.session
                                                    });
                                                } else {
                                                    res.render('./appeal_infraction/appeal_infraction_edit', {
                                                        prefix, infractiontype_violation, infractiontype_effect,
                                                        infractiontype_effectiveness,
                                                        infractiontype_status, measures, approach,
                                                        doc, specific,
                                                        classify, data_type,
                                                        infraction,
                                                        session: req.session
                                                    })
                                                }
                                            });
                                        });
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
}

controller.infraction_save_edit = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        // var user = check_user_login(req)
        const data = req.body
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_APPEAL_INFRACTION WHERE infraction_id=?", [data.id.split(',')[0]], (err, select_infraction) => {
                if (select_infraction[0].infraction_infringement == data.infraction_infringement) {
                    if (data.id.split(',')[1]) {
                        conn.query('UPDATE  TB_TR_PDPA_APPEAL_INFRACTION SET infraction_measures_consult=?,infraction_date=?,infraction_email=?,prefix_id=?,infraction_firstname=?,infraction_lastname=?,infraction_address=?,infraction_contact=?,classify_id=?,infraction_infringement_customer=?,infraction_assess_credibility=?,infraction_assess_credibility_explain=?,infraction_infringement=?,infraction_measures_date=?,infraction_measures_date_count=?,infraction_measures_supervisor=? WHERE infraction_id=?',
                            [data.infraction_measures_consult, data.infraction_date, data.infraction_email, data.prefix_name.split(',')[1], data.infraction_firstname, data.infraction_lastname, data.infraction_address, data.infraction_contact, data.classify_id, data.infraction_infringement_customer, data.infraction_assess_credibility, data.infraction_assess_credibility_explain, data.infraction_infringement, data.infraction_measures_date, data.infraction_measures_date_count, data.infraction_measures_supervisor, data.id.split(',')[0]], (err, insert_infaction) => {
                                conn.query('UPDATE TB_TR_APPEAL_INFRACTION_INFRACTIONTYPE_COMBINED SET combined_assess_risk=?,data_type_explain=?,personal_data_breach_explain=?,combined_annotation=?,infractiontype_type_violation_id=?, combined_infringement_name=?,violation_action_explain=?,measures_id=?,approach_id=?,specific_id=?,doc_id=?,infractiontype_legal_status_id=?,infractiontype_legal_status_id_explain=?,data_type_id=?,personal_information_records_explain=?,infractiontype_effect_id=?,infractiontype_effect_id_explain=?,severity_impact_explain=?,infractiontype_effectiveness_id=?,infractiontype_effectiveness_id_explain=?,infractiontype_healing_explain=? where combined_id=?',
                                    [data.combined_assess_risk, data.data_type_explain, data.personal_data_breach_explain, data.combined_annotation, data.infractiontype_type_violation_id.toString().trim(), data.combined_infringement_name, data.violation_action_explain, data.measures_id.toString().trim(), data.approach_id.toString().trim(), data.specific_id.toString().trim(), data.doc_id.toString().trim(), data.infractiontype_legal_status_id.toString().trim(), data.infractiontype_legal_status_id_explain, data.data_type_id.toString().trim(), data.personal_information_records_explain, data.infractiontype_effect_id.toString().trim(), data.infractiontype_effect_id_explain, data.severity_impact_explain, data.infractiontype_effectiveness_id.toString().trim(), data.infractiontype_effectiveness_id_explain, data.infractiontype_healing_explain, data.id.split(',')[1]], (err, insert_two_join_table) => {
                                        funchistory.funchistory(req, `เรื่องร้องเรียนการละเมิด `, `แก้ไขข้อมูล ${select_infraction[0].infraction_complaint_number}`, req.session.userid)
                                        res.redirect("/appeal/infraction/list");
                                    });
                            });

                    } else {
                        conn.query('UPDATE TB_TR_PDPA_APPEAL_INFRACTION SET infraction_measures_consult=?,infraction_date=?,infraction_email=?,prefix_id=?,infraction_firstname=?,infraction_lastname=?,infraction_address=?,infraction_contact=?,classify_id=?,infraction_infringement_customer=?,infraction_assess_credibility=?,infraction_assess_credibility_explain=?,infraction_infringement=? WHERE infraction_id=?',
                            [data.infraction_measures_consult, data.infraction_date, data.infraction_email, data.prefix_name.split(',')[1], data.infraction_firstname, data.infraction_lastname, data.infraction_address, data.infraction_contact, data.classify_id, data.infraction_infringement_customer, data.infraction_assess_credibility, data.infraction_assess_credibility_explain, data.infraction_infringement, data.id.split(',')[0]], (err, insert_infaction) => {
                                funchistory.funchistory(req, `เรื่องร้องเรียนการละเมิด `, `แก้ไขข้อมูล ${select_infraction[0].infraction_complaint_number}`, req.session.userid)
                                res.redirect("/appeal/infraction/list");
                            });
                    }
                } else {
                    if (data.id.split(',')[1]) {
                        conn.query('UPDATE TB_TR_PDPA_APPEAL_INFRACTION SET infraction_infringement=?,infraction_measures_date=?,infraction_measures_date_count=?,infraction_measures_supervisor=? WHERE infraction_id=?',
                            [2, null, null, null, data.id.split(',')[0]], (err, insert_infaction) => {
                                funchistory.funchistory(req, `เรื่องร้องเรียนการละเมิด `, `แก้ไขข้อมูล ${select_infraction[0].infraction_complaint_number}`, req.session.userid)
                                conn.query('DELETE  FROM TB_TR_APPEAL_INFRACTION_INFRACTIONTYPE_COMBINED  WHERE combined_id=?',
                                    [data.id.split(',')[1]], (err, delete_infaction) => {
                                        res.redirect("/appeal/infraction/list");
                                    });
                            });
                    } else {
                        conn.query('INSERT INTO TB_TR_APPEAL_INFRACTION_INFRACTIONTYPE_COMBINED SET infraction_id=?,combined_assess_risk=?,data_type_explain=?,personal_data_breach_explain=?,combined_annotation=?,infractiontype_type_violation_id=?, combined_infringement_name=?,violation_action_explain=?,measures_id=?,approach_id=?,specific_id=?,doc_id=?,infractiontype_legal_status_id=?,infractiontype_legal_status_id_explain=?,data_type_id=?,personal_information_records_explain=?,infractiontype_effect_id=?,infractiontype_effect_id_explain=?,severity_impact_explain=?,infractiontype_effectiveness_id=?,infractiontype_effectiveness_id_explain=?,infractiontype_healing_explain=?',
                            [data.id.split(',')[0], data.combined_assess_risk, data.data_type_explain, data.personal_data_breach_explain, data.combined_annotation, data.infractiontype_type_violation_id.toString().trim(), data.combined_infringement_name, data.violation_action_explain, data.measures_id.toString().trim(), data.approach_id.toString().trim(), data.specific_id.toString().trim(), data.doc_id.toString().trim(), data.infractiontype_legal_status_id.toString(), data.infractiontype_legal_status_id_explain, data.data_type_id.toString(), data.personal_information_records_explain, data.infractiontype_effect_id.toString(), data.infractiontype_effect_id_explain, data.severity_impact_explain, data.infractiontype_effectiveness_id.toString(), data.infractiontype_effectiveness_id_explain, data.infractiontype_healing_explain], (err, insert_two_join_table) => {
                                conn.query('UPDATE  TB_TR_PDPA_APPEAL_INFRACTION SET infraction_measures_consult=?,infraction_date=?,infraction_email=?,prefix_id=?,infraction_firstname=?,infraction_lastname=?,infraction_address=?,infraction_contact=?,classify_id=?,infraction_infringement_customer=?,infraction_assess_credibility=?,infraction_assess_credibility_explain=?,infraction_infringement=?,infraction_measures_date=?,infraction_measures_date_count=?,infraction_measures_supervisor=? WHERE infraction_id=?',
                                    [data.infraction_measures_consult, data.infraction_date, data.infraction_email, data.prefix_name.split(',')[1], data.infraction_firstname, data.infraction_lastname, data.infraction_address, data.infraction_contact, data.classify_id, data.infraction_infringement_customer, data.infraction_assess_credibility, data.infraction_assess_credibility_explain, 1, null, null, data.infraction_measures_supervisor, data.id.split(',')[0]], (err, insert_infaction) => {
                                        funchistory.funchistory(req, `เรื่องร้องเรียนการละเมิด `, `แก้ไขข้อมูล ${select_infraction[0].infraction_complaint_number}`, req.session.userid)
                                        res.redirect("/appeal/infraction/list");
                                    });
                            });
                    }
                }
            });
        })
    } else {
        res.redirect("/");
    }
}


controller.search = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        const data = req.body
        req.getConnection((err, conn) => {
            if (data.text == '') {
                conn.query("SELECT *,DATE_FORMAT(infraction_date,'%d/%m/%Y') as day_complaint,infraction.infraction_id as id_infraction_id FROM TB_TR_PDPA_APPEAL_INFRACTION AS infraction LEFT JOIN TB_TR_APPEAL_INFRACTION_INFRACTIONTYPE_COMBINED AS combined ON combined.infraction_id=infraction.infraction_id LEFT JOIN TB_MM_PREFIX as prefix ON infraction.prefix_id=prefix.prefix_id WHERE infraction.acc_id=?   AND  DATE_FORMAT(infraction.infraction_date,'%Y-%m-%d') BETWEEN  ?  AND  ?   ORDER BY infraction.infraction_id DESC",
                    [user, data.firstDay, data.lastDay], (err, infraction) => {
                        conn.query("SELECT * FROM TB_TR_INFORMATION_INFRACTIONTYPE WHERE infractiontype_type=1 ORDER BY  infractiontype_id DESC", (err, infractiontype) => {
                            if (infraction.length <= 0 || infraction.length == "") {
                                infraction = "ไม่มีข้อมูล"
                            }
                            res.json({ infraction, infractiontype })
                        });
                    });
            } else {
                conn.query("SELECT *,DATE_FORMAT(infraction_date,'%d/%m/%Y') as day_complaint,infraction.infraction_id as id_infraction_id FROM TB_TR_PDPA_APPEAL_INFRACTION AS infraction LEFT JOIN TB_TR_APPEAL_INFRACTION_INFRACTIONTYPE_COMBINED AS combined ON combined.infraction_id=infraction.infraction_id LEFT JOIN TB_MM_PREFIX as prefix ON infraction.prefix_id=prefix.prefix_id WHERE infraction.acc_id=?   AND  (CONCAT(prefix.prefix_name,infraction_firstname, ' ',infraction_lastname) LIKE  ?  OR  infraction_complaint_number LIKE ?) AND  DATE_FORMAT(infraction_date,'%Y-%m-%d') BETWEEN  ?  AND  ?   ORDER BY infraction.infraction_id DESC",
                    [user, "%" + data.text + "%", "%" + data.text + "%", data.firstDay, data.lastDay], (err, infraction) => {
                        conn.query("SELECT * FROM TB_TR_INFORMATION_INFRACTIONTYPE WHERE infractiontype_type=1 ORDER BY  infractiontype_id DESC", (err, infractiontype) => {
                            if (infraction.length <= 0 || infraction.length == "") {
                                infraction = "ไม่มีข้อมูล"
                            }
                            res.json({ infraction, infractiontype })
                        });
                    });
            }

        });
    } else {
        res.redirect("/");
    }
}


controller.infraction_manage_list = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM  TB_TR_INFORMATION_INFRACTIONTYPE WHERE  acc_id=?   ORDER BY infractiontype_type ASC", [user], (err, infractiontype) => {
                if (infractiontype.length <= 0 || infractiontype.length == "") {
                    infractiontype = "ไม่มีข้อมูล"
                }
                res.json(infractiontype);
            });
        });
    } else {
        res.redirect("/");
    }
}

controller.infraction_manage_list2 = (req, res) => {
    var type = req.params.type;

    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM  TB_TR_INFORMATION_INFRACTIONTYPE WHERE  acc_id=? AND infractiontype_type = ?   ORDER BY infractiontype_type ASC", [user, type], (err, infractiontype) => {

                if (infractiontype.length <= 0 || infractiontype.length == "") {
                    infractiontype = "ไม่มีข้อมูล"
                }
                res.json(infractiontype);
            });
        });
    } else {
        res.redirect("/");
    }
}




controller.manage_type_search = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        const data = req.body
        let search_query = ''
        if (data.type != 0 && data.text != "") { // กรณี text ไม่ว่าง  เเละ type ไม่ว่าง
            search_query = `AND infractiontype_type=${data.type} AND infractiontype_name LIKE '%${data.text}%'`
        } else if (data.type == 0 && data.text != "") {  // กรณี text ไม่ว่าง 
            search_query = `AND infractiontype_name LIKE  '%${data.text}%'`
        } else if (data.type != 0 && data.text == "") { // กรณี text ว่าง 
            search_query = `AND infractiontype_type=${data.type}`
        }
        req.getConnection((err, conn) => {
            conn.query(`SELECT * FROM  TB_TR_INFORMATION_INFRACTIONTYPE WHERE  acc_id=?  ${search_query}  ORDER BY infractiontype_type ASC`,
                [user], (err, infractiontype) => {
                    if (infractiontype.length <= 0 || infractiontype.length == "") {
                        infractiontype = "ไม่มีข้อมูล"
                    }
                    res.json(infractiontype);
                });
        });
    } else {
        res.redirect("/");
    }
}

controller.manage_type_getsearch = (req, res) => {
    if (typeof req.session.userid != "undefined") {

        var user = check_user_login(req)
        const data = { type: req.params.type, text: req.params.text }
        let search_query = ''
        if (data.type != 0 && data.text != "") { // กรณี text ไม่ว่าง  เเละ type ไม่ว่าง
            search_query = `AND infractiontype_type=${data.type} AND infractiontype_name LIKE '%${data.text}%'`
        } else if (data.type == 0 && data.text != "") {  // กรณี text ไม่ว่าง 
            search_query = `AND infractiontype_name LIKE  '%${data.text}%'`
        } else if (data.type != 0 && data.text == "") { // กรณี text ว่าง 
            search_query = `AND infractiontype_type=${data.type}`
        }
        req.getConnection((err, conn) => {
            conn.query(`SELECT * FROM  TB_TR_INFORMATION_INFRACTIONTYPE WHERE  acc_id=?  ${search_query}  ORDER BY infractiontype_type ASC`,
                [user], (err, infractiontype) => {
                    if (infractiontype.length <= 0 || infractiontype.length == "") {
                        infractiontype = "ไม่มีข้อมูล"
                    }
                    res.json(infractiontype);
                });
        });
    } else {
        res.redirect("/");
    }
}


controller.manage_type_getsearch = (req, res) => {
    if (typeof req.session.userid != "undefined") {

        var user = check_user_login(req)
        const data = { type: req.params.type, text: req.params.text }
        let search_query = ''
        if (data.type != 0 && data.text != "") { // กรณี text ไม่ว่าง  เเละ type ไม่ว่าง
            search_query = `AND infractiontype_type=${data.type} AND infractiontype_name LIKE '%${data.text}%'`
        } else if (data.type == 0 && data.text != "") {  // กรณี text ไม่ว่าง 
            search_query = `AND infractiontype_name LIKE  '%${data.text}%'`
        } else if (data.type != 0 && data.text == "") { // กรณี text ว่าง 
            search_query = `AND infractiontype_type=${data.type}`
        }
        req.getConnection((err, conn) => {
            conn.query(`SELECT * FROM  TB_TR_INFORMATION_INFRACTIONTYPE WHERE  acc_id=?  ${search_query}  ORDER BY infractiontype_type ASC`,
                [user], (err, infractiontype) => {
                    if (infractiontype.length <= 0 || infractiontype.length == "") {
                        infractiontype = "ไม่มีข้อมูล"
                    }
                    res.json(infractiontype);
                });
        });
    } else {
        res.redirect("/");
    }
}
controller.edit_save = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        // var user = check_user_login(req)
        const data = req.body
        req.getConnection((err, conn) => {
            conn.query("UPDATE  TB_TR_INFORMATION_INFRACTIONTYPE SET infractiontype_name=?,infractiontype_type=? WHERE  infractiontype_id=? ",
                [data.infractiontype_name, data.infractiontype_type, data.infractiontype_id], (err, infractiontype) => {
                    res.redirect("/appeal/infraction/manage/type" + data.infractiontype_type);
                });
        });
    } else {
        res.redirect("/");
    }
}

controller.del = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        // var user = check_user_login(req)
        const data = req.body
        req.getConnection((err, conn) => {

            conn.query("DELETE FROM  TB_TR_INFORMATION_INFRACTIONTYPE  WHERE  infractiontype_id=? ",
                [data.infractiontype_id], (err, infractiontype) => {
                    res.redirect("/appeal/infraction/manage/type" + data.type);
                });
        });
    } else {
        res.redirect("/");
    }
}


module.exports = controller;
