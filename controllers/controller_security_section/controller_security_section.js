const session = require("express-session");
require('dotenv').config()

const controller = {};


function check_user_login(req) {
    let user = req.session.acc_id_control ? req.session.acc_id_control : req.session.userid;
    return user
}


controller.list_measure_doc = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM  TB_TR_PDPA_EVENT_PROCESS ORDER BY event_process_id DESC", (err, process) => {
                conn.query("SELECT * FROM  TB_TR_INFORMATION_ASSETS WHERE acc_id=?  ORDER BY assets_id DESC ", [user], (err, assets) => {
                    conn.query("SELECT * FROM  TB_TR_DEFENSE_IN_DEPTH WHERE acc_id=? ORDER BY depth_id DESC ", [user], (err, depth) => {
                        conn.query("SELECT * FROM  TB_TR_MEASURES_TYPE ORDER BY measures_type_id DESC ", (err, measures) => {
                            conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE doc_status=2 AND  type !=3 AND doc_action =0", [user], (err, doc) => {
                                conn.query("SELECT TB_TR_PDPA_DOCUMENT .*,TB_MM_PDPA_DOCUMENT_TYPE.doc_type_name as doc_type_name ,count(TB_TR_PDPA_DOCUMENT_PAGE.doc_id) as page FROM TB_TR_PDPA_DOCUMENT join TB_MM_PDPA_DOCUMENT_TYPE on TB_MM_PDPA_DOCUMENT_TYPE.doc_type_id = TB_TR_PDPA_DOCUMENT.doc_type_id join TB_TR_PDPA_DOCUMENT_PAGE on TB_TR_PDPA_DOCUMENT_PAGE.doc_id = TB_TR_PDPA_DOCUMENT.doc_id WHERE  TB_TR_PDPA_DOCUMENT.doc_status = 2 AND doc_action IS NOT TRUE group by  TB_TR_PDPA_DOCUMENT_PAGE.doc_id ;", (err, doc_pdpa_document) => {
                                    conn.query("SELECT TB_TR_ACCOUNT.acc_id, TB_TR_ACCOUNT.firstname, TB_TR_ACCOUNT.lastname,TB_TR_ACCOUNT.type_user  FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5);", (err, account_pdpa) => {

                                        if (measures.length <= 0 || measures.length == "") {
                                            measures = "ไม่มีข้อมูล"
                                        }
                                        if (doc.length <= 0 || doc.length == "") {
                                            doc = "ไม่มีข้อมูล"
                                        }
                                        if (depth.length <= 0 || depth.length == "") {
                                            depth = "ไม่มีข้อมูล"
                                        }
                                        if (assets.length <= 0 || depth.length == "") {
                                            assets = "ไม่มีข้อมูล"
                                        }
                                        if (process.length <= 0 || process.length == "") {
                                            process = "ไม่มีข้อมูล"
                                        }
                                        if (doc_pdpa_document.length <= 0 || doc_pdpa_document.length == "") {
                                            doc_pdpa_document = "ไม่มีข้อมูล"
                                        }
                                        if (account_pdpa.length <= 0 || account_pdpa.length == "") {
                                            account_pdpa = "ไม่มีข้อมูล"
                                        }
                                        res.send({ measures, doc, depth, assets, process, doc_pdpa_document, account_pdpa })
                                    });
                                });
                            });
                        });
                    });
                });

            });
        });
    } else {
        res.redirect(`/`);
    }
}

controller.list_measure_doc_active = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM  TB_TR_PDPA_EVENT_PROCESS ORDER BY event_process_id DESC ", (err, process) => {
                conn.query("SELECT * FROM  TB_TR_INFORMATION_ASSETS WHERE acc_id=?  ORDER BY assets_id DESC ", [user], (err, assets) => {
                    conn.query("SELECT * FROM  TB_TR_DEFENSE_IN_DEPTH WHERE acc_id=? ORDER BY depth_id DESC ", [user], (err, depth) => {
                        conn.query("SELECT * FROM  TB_TR_MEASURES_TYPE ORDER BY measures_type_id DESC ", (err, measures) => {
                            conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE  doc_status=2 AND  type !=3 AND doc_action =0", [user], (err, doc) => {
                                conn.query("SELECT TB_TR_PDPA_DOCUMENT .*,TB_MM_PDPA_DOCUMENT_TYPE.doc_type_name as doc_type_name ,count(TB_TR_PDPA_DOCUMENT_PAGE.doc_id) as page FROM TB_TR_PDPA_DOCUMENT join TB_MM_PDPA_DOCUMENT_TYPE on TB_MM_PDPA_DOCUMENT_TYPE.doc_type_id = TB_TR_PDPA_DOCUMENT.doc_type_id join TB_TR_PDPA_DOCUMENT_PAGE on TB_TR_PDPA_DOCUMENT_PAGE.doc_id = TB_TR_PDPA_DOCUMENT.doc_id WHERE  TB_TR_PDPA_DOCUMENT.doc_status = 2 AND doc_action IS NOT TRUE group by  TB_TR_PDPA_DOCUMENT_PAGE.doc_id ;", (err, doc_pdpa_document) => {
                                    conn.query("SELECT TB_TR_ACCOUNT.acc_id, TB_TR_ACCOUNT.firstname, TB_TR_ACCOUNT.lastname,TB_TR_ACCOUNT.type_user  FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5);", (err, account_pdpa) => {
                                        conn.query("SELECT d.device_id as device_id,d.name FROM `TB_TR_DEVICE` as d WHERE device_id NOT IN (SELECT device_id FROM `TB_TR_DEL_DEVICE`)", (err, log_device) => {
                                            conn.query("SELECT pam.agm_id,pam.agm_name FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id;", (err, agent_data) => {

                                                for (let f = 0; f < log_device.length; f++) {
                                                    assets.push({
                                                        assets_id: log_device[f].device_id,
                                                        assets_name: log_device[f].name,
                                                        id_check: 'check_edit'
                                                    })

                                                }
                                                for (let g = 0; g < agent_data.length; g++) {
                                                    assets.push({
                                                        assets_id: agent_data[g].agm_id,
                                                        assets_name: agent_data[g].agm_name,
                                                        id_check: 'check_edit'
                                                    })

                                                }
                                                if (measures.length <= 0 || measures.length == "") {
                                                    measures = "ไม่มีข้อมูล"
                                                }
                                                if (doc.length <= 0 || doc.length == "") {
                                                    doc = "ไม่มีข้อมูล"
                                                }
                                                if (depth.length <= 0 || depth.length == "") {
                                                    depth = "ไม่มีข้อมูล"
                                                }
                                                if (assets.length <= 0 || depth.length == "") {
                                                    assets = "ไม่มีข้อมูล"
                                                }
                                                if (process.length <= 0 || process.length == "") {
                                                    process = "ไม่มีข้อมูล"
                                                }
                                                if (doc_pdpa_document.length <= 0 || doc_pdpa_document.length == "") {
                                                    doc_pdpa_document = "ไม่มีข้อมูล"
                                                }
                                                if (account_pdpa.length <= 0 || account_pdpa.length == "") {
                                                    account_pdpa = "ไม่มีข้อมูล"
                                                }
                                                res.send({ measures, doc, depth, assets, process, doc_pdpa_document, account_pdpa })
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
        res.redirect(`/`);
    }
}

controller.save = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        const data = req.body

        if (data.measures_consult) {
            data.measures_consult = 1
        } else {
            data.measures_consult = 0
        }
        if (data.doc_id == "") {
            data.doc_id = 0
        } else {
            data.doc_id = data.doc_id
        }
        measures_supervisor_text = '';
        if (Array.isArray(data.measures_supervisor)) {
            for (let c = 0; c < data.measures_supervisor.length; c++) {
                if (c == 0) {
                    measures_supervisor_text = measures_supervisor_text + data.measures_supervisor[c];
                } else {
                    measures_supervisor_text = measures_supervisor_text + ',' + data.measures_supervisor[c];
                }
            }
        } else {
            measures_supervisor_text = data.measures_supervisor;
        }

        req.getConnection((err, conn) => {
            if (data.assets_id) {
                var insert_data = ''
                console.log(data);
                conn.query("INSERT INTO TB_TR_MEASURES  SET measures_section_name=?,measures_detail=?,measures_supervisor=?,measures_date=?,measures_date_count=?,measures_consult=?,doc_id=?,acc_id=?,specify_id =2",
                    [data.measures_section_name, data.measures_detail, measures_supervisor_text, data.measures_date, data.measures_date_count, data.measures_consult, data.doc_id.toString(), user], (err, insert_measures) => {
                        if (data.approach_heading_risk_based == 1) {
                            insert_data = `INSERT INTO TB_TR_MEASURES_RISK_BASED_APPROACH  SET measures_id=${insert_measures.insertId},approach_confidentiality=${data.approach_confidentiality},approach_integrity=${data.approach_integrity},approach_availability=${data.approach_availability},approach_confidentiality_explain='${data.approach_confidentiality_explain}',approach_integrity_explain='${data.approach_integrity_explain}',approach_availability_explain='${data.approach_availability_explain}',approach_heading_risk_based=${data.approach_heading_risk_based},assets_id=${data.assets_id}`
                        } else {

                            data.depth_id_defense = data.depth_id_defense + ''
                            insert_data = `INSERT INTO TB_TR_MEASURES_RISK_BASED_APPROACH  SET measures_id=${insert_measures.insertId},depth_id_defense='${data.depth_id_defense}',approach_defense_principles_explain='${data.approach_defense_principles_explain}',depth_id_measures='${data.depth_id_measures}',approach_defense_protection_explain='${data.approach_defense_protection_explain}',approach_defense_principles=${data.approach_defense_principles},approach_defense_protection=${data.approach_defense_protection},assets_id=${data.assets_id},approach_heading_risk_based=${data.approach_heading_risk_based} `
                        }
                        conn.query(insert_data, (err, insert_approach) => {
                            res.redirect(`/security/section/Risk-based-Approach`);
                        });
                    });
            } else if (data.event_process_id) {
                conn.query("INSERT INTO TB_TR_MEASURES  SET measures_section_name=?,measures_detail=?,measures_supervisor=?,measures_date=?,measures_date_count=?,measures_consult=?,doc_id=?,acc_id=?,specify_id =3",
                    [data.measures_section_name, data.measures_detail, measures_supervisor_text, data.measures_date, data.measures_date_count, data.measures_consult, data.doc_id.toString(), user], (err, insert_measures_pdpa) => {
                        conn.query("INSERT INTO TB_TR_MEASURES_PDPA_SPECIFIC  SET measures_id=?,specific_access_control=?,specific_user_access_management=?,specific_user_responsibilitites=?,specific_audit_trails=?,specific_privacy_security_awareness=?,specific_where_incident_occurs=?,specific_access_control_explain=?,specific_user_access_management_explain=?,specific_user_responsibilitites_explain=?,specific_audit_trails_explain=?,specific_privacy_security_awareness_explain=?,specific_where_incident_occurs_explain=?,event_process_id=?;",
                            [insert_measures_pdpa.insertId, data.specific_access_control, data.specific_user_access_management, data.specific_user_responsibilitites, data.specific_audit_trails, data.specific_privacy_security_awareness, data.specific_where_incident_occurs, data.specific_access_control_explain, data.specific_user_access_management_explain, data.specific_user_responsibilitites_explain, data.specific_audit_trails_explain, data.specific_privacy_security_awareness_explain, data.specific_where_incident_occurs_explain, data.event_process_id], (err, insert_specific) => {
                                res.redirect(`/security/section/Specific-Measures`);
                            });
                    });
            } else {
                conn.query(`INSERT INTO TB_TR_MEASURES  SET measures_section_name='${data.measures_section_name}',measures_detail='${data.measures_detail}',measures_supervisor='${measures_supervisor_text}',measures_date='${data.measures_date}',measures_date_count=${data.measures_date_count},measures_consult=${data.measures_consult},doc_id='${data.doc_id.toString()}',measures_type_id =${data.measures_type_id},acc_id=${user},specify_id =1`, (err, insert_measures) => {
                    res.redirect(`/security/section/General-Measures`);
                });
            }
        });

    } else {
        res.redirect(`/`);
    }
}

controller.security_section_list = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = check_user_login(req)
        req.getConnection((err, conn) => {
            conn.query("SELECT *,m.doc_id as doc_id_measures FROM  TB_TR_MEASURES as m LEFT JOIN  TB_TR_MEASURES_TYPE as mt ON m.measures_type_id=mt.measures_type_id LEFT JOIN  TB_TR_PDPA_DOCUMENT as doc  ON m.doc_id=doc.doc_id WHERE specify_id=1  ORDER BY measures_id DESC", (err, measures) => {
                conn.query("SELECT *,ass.assets_id as ch,approach.assets_id as ass_ch FROM TB_TR_MEASURES_RISK_BASED_APPROACH AS approach LEFT JOIN  TB_TR_MEASURES AS measures ON approach.measures_id=measures.measures_id LEFT JOIN TB_TR_INFORMATION_ASSETS  as ass ON approach.assets_id=ass.assets_id WHERE measures.acc_id=? AND measures.specify_id=2 AND approach_heading_risk_based=1 ORDER BY approach.approach_id DESC", [user], (err, approach_Information) => {
                    conn.query("SELECT *,ass.assets_id as ch,approach.assets_id as ass_ch FROM TB_TR_MEASURES_RISK_BASED_APPROACH AS approach LEFT JOIN  TB_TR_MEASURES AS measures ON approach.measures_id=measures.measures_id LEFT JOIN TB_TR_INFORMATION_ASSETS  as ass ON approach.assets_id=ass.assets_id WHERE measures.acc_id=? AND measures.specify_id=2 AND approach_heading_risk_based=2 ORDER BY approach.approach_id DESC", [user], (err, approach_Network) => {
                        conn.query("SELECT *,specifi.specific_id as id_specific,measures.measures_id as measures_id FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id WHERE measures.specify_id=3 AND measures.acc_id=? ORDER BY specifi.specific_id DESC", [user], (err, specific) => {
                            conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE  doc_status=2 AND  type !=3 AND doc_action =0", [user], (err, doc) => {
                                conn.query("SELECT d.device_id as device_id,d.name FROM `TB_TR_DEVICE` as d WHERE device_id NOT IN (SELECT device_id FROM `TB_TR_DEL_DEVICE`)", (err, log_device) => {
                                    conn.query("SELECT pam.agm_id,pam.agm_name FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id;", (err, agent_data) => {

                                        for (let h = 0; h < approach_Information.length; h++) {
                                            const element = approach_Information[h].ch;
                                            if (element == null) {
                                                for (let h1 = 0; h1 < log_device.length; h1++) {
                                                    if (log_device[h1].device_id == approach_Information[h].ass_ch) {
                                                        approach_Information[h].assets_name = log_device[h1].name
                                                    }
                                                }
                                                for (let h2 = 0; h2 < agent_data.length; h2++) {
                                                    if (agent_data[h2].agm_id == approach_Information[h].ass_ch) {
                                                        approach_Information[h].assets_name = agent_data[h2].agm_name
                                                    }
                                                }
                                            }

                                        }

                                        for (let h = 0; h < approach_Network.length; h++) {
                                            const element = approach_Network[h].ch;
                                            if (element == null) {
                                                for (let h3 = 0; h3 < log_device.length; h3++) {
                                                    if (log_device[h3].device_id == approach_Network[h].ass_ch) {
                                                        approach_Network[h].assets_name = log_device[h3].name
                                                    }
                                                }
                                                for (let h4 = 0; h4 < agent_data.length; h4++) {
                                                    if (agent_data[h4].agm_id == approach_Network[h].ass_ch) {
                                                        approach_Network[h].assets_name = agent_data[h4].agm_name
                                                    }
                                                }
                                            }

                                        }

                                        if (measures.length <= 0 || measures.length == "") {
                                            measures = "ไม่มีข้อมูล"
                                        }
                                        if (approach_Information.length <= 0 || approach_Information.length == "") {
                                            approach_Information = "ไม่มีข้อมูล"
                                        }
                                        if (approach_Network.length <= 0 || approach_Network.length == "") {
                                            approach_Network = "ไม่มีข้อมูล"
                                        }
                                        if (specific.length <= 0 || specific.length == "") {
                                            specific = "ไม่มีข้อมูล"
                                        }
                                        if (doc.length <= 0 || doc.length == "") {
                                            doc = "ไม่มีข้อมูล"
                                        }
                                        res.send({ measures, approach_Information, approach_Network, specific, doc })
                                    });
                                });
                            });
                        });
                    });
                });

            });

        });
    } else {
        res.redirect(`/`);
    }
}

controller.add_title = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const data = req.body
        let redirect = `/security/section/General-Measures/add`
        if (data.measure_type_add) {
            data.measure_type = data.measure_type_add
            redirect = `//manage/measures/measures_type`
        }
        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_TR_MEASURES_TYPE  SET measures_type=?",
                [data.measure_type], (err, insert_measure) => {
                    res.redirect(redirect);
                });
        });

    } else {
        res.redirect(`/`);
    }
}

controller.edit_title = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const data = req.body
        req.getConnection((err, conn) => {
            conn.query("UPDATE  TB_TR_MEASURES_TYPE  SET measures_type=? WHERE measures_type_id=?",
                [data.measure_type, data.measures_type_id], (err, insert_measure) => {
                    res.redirect(`manage/measures`);
                });
        });

    } else {
        res.redirect(`/`);
    }
}

controller.General_Measures_Edit_View = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const { id } = req.params
        req.getConnection((err, conn) => {
            conn.query("SELECT *,m.doc_id as doc_id_name,m.measures_id as id_measures,DATE_FORMAT(measures_date,'%Y-%m-%d') as day FROM  TB_TR_MEASURES as m LEFT JOIN  TB_TR_MEASURES_TYPE as mt ON m.measures_type_id=mt.measures_type_id LEFT JOIN  TB_TR_PDPA_DOCUMENT as doc  ON m.doc_id=doc.doc_id WHERE specify_id=1 AND m.measures_id =?  ORDER BY measures_id DESC", [id], (err, measures) => {
                conn.query("SELECT * FROM  TB_TR_MEASURES_TYPE ORDER BY measures_type_id DESC ", (err, measures_type) => {
                    conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE  doc_status=2 AND  type !=3 AND doc_action =0", [user], (err, doc) => {
                        conn.query("SELECT TB_TR_ACCOUNT.acc_id,TB_TR_ACCOUNT.firstname,TB_TR_ACCOUNT.lastname FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5)", (err, account) => {
                            let doc_id_name = measures[0].doc_id_name.split(",")
                            res.render('./security_section/general_measures_edit', {
                                account: account,
                                measures, measures_type, doc, doc_id_name,
                                session: req.session
                            });
                        });
                    });
                });
            });
        });
    } else {
        res.redirect(`/`);
    }
}

controller.Risk_based_Approach_Edit_Save = (req, res) => {
    if (typeof req.session.userid != "undefined") {

        const data = req.body
        let measures_id = data.id.split(',')[1] // id TB_TR_MEASURES
        let approach_id = data.id.split(',')[0] // id TB_TR_MEASURES_RISK_BASED_APPROACH
        measures_supervisor_text = '';
        if (Array.isArray(data.measures_supervisor)) {
            for (let c = 0; c < data.measures_supervisor.length; c++) {
                if (c == 0) {
                    measures_supervisor_text = measures_supervisor_text + data.measures_supervisor[c];
                } else {
                    measures_supervisor_text = measures_supervisor_text + ',' + data.measures_supervisor[c];
                }
            }
        } else {
            measures_supervisor_text = data.measures_supervisor;
        }
        req.getConnection((err, conn) => {
            if (data.approach_heading_risk_based == 1) {
                conn.query("UPDATE TB_TR_MEASURES SET doc_id=?,measures_section_name=?, measures_detail=?,measures_date=?,measures_date_count=?,measures_supervisor=?,measures_consult=?  WHERE  measures_id=?",
                    [data.doc_id.toString(), data.measures_section_name, data.measures_detail, data.measures_date, data.measures_date_count, measures_supervisor_text, data.measures_consult, measures_id], (err, update_measures) => {
                        conn.query("UPDATE TB_TR_MEASURES_RISK_BASED_APPROACH SET assets_id=?,approach_confidentiality=?,approach_integrity=?,approach_availability=?,approach_confidentiality_explain=?,approach_integrity_explain=?,approach_availability_explain=?,approach_heading_risk_based=? WHERE approach_id=?",
                            [data.assets_id, data.approach_confidentiality, data.approach_integrity, data.approach_availability, data.approach_confidentiality_explain, data.approach_integrity_explain, data.approach_availability_explain, data.approach_heading_risk_based, approach_id], (err, update_approach) => {
                                res.redirect(`/security/section/Risk-based-Approach`);
                            });
                    });
            } else {
                conn.query("UPDATE TB_TR_MEASURES SET doc_id=?,measures_section_name=?, measures_detail=?,measures_date=?,measures_date_count=?,measures_supervisor=?,measures_consult=?  WHERE  measures_id=?",
                    [data.doc_id.toString(), data.measures_section_name, data.measures_detail, data.measures_date, data.measures_date_count, measures_supervisor_text, data.measures_consult, measures_id], (err, update_measures) => {
                        conn.query("UPDATE TB_TR_MEASURES_RISK_BASED_APPROACH SET depth_id_defense=?, approach_defense_principles_explain=?,depth_id_measures=?,approach_defense_protection_explain=?,approach_defense_principles=?,approach_defense_protection=?,assets_id=? WHERE approach_id=?",
                            [data.depth_id_defense + '', data.approach_defense_principles_explain, data.depth_id_measures + '', data.approach_defense_protection_explain, data.approach_defense_principles, data.approach_defense_protection, data.assets_id, approach_id], (err, update_approach) => {
                                res.redirect(`/security/section/Risk-based-Approach`);
                            });
                    });
            }
        });
    } else {
        res.redirect(`/`);
    }
}

controller.General_Measures_Edit_Save = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const data = req.body
        if (data.measures_consult) {
            data.measures_consult = 1
        } else {
            data.measures_consult = 0
        }
        if (data.doc_id == "") {
            data.doc_id = 0
        } else {
            data.doc_id = data.doc_id
        }

        measures_supervisor_text = '';
        if (Array.isArray(data.measures_supervisor)) {
            for (let c = 0; c < data.measures_supervisor.length; c++) {
                if (c == 0) {
                    measures_supervisor_text = measures_supervisor_text + data.measures_supervisor[c];
                } else {
                    measures_supervisor_text = measures_supervisor_text + ',' + data.measures_supervisor[c];
                }
            }
        } else {
            measures_supervisor_text = data.measures_supervisor;
        }

        req.getConnection((err, conn) => {
            conn.query("UPDATE TB_TR_MEASURES  SET measures_section_name=?,measures_detail=?,measures_supervisor=?,measures_date=?,measures_date_count=?,measures_consult=?,doc_id=?,measures_type_id =?,acc_id=? WHERE measures_id=?",
                [data.measures_section_name, data.measures_detail, measures_supervisor_text, data.measures_date, data.measures_date_count, data.measures_consult, data.doc_id.toString(), data.measures_type_id, user, data.measures_id], (err, insert_measures) => {
                    res.redirect(`/security/section/General-Measures`);
                });
        });

    } else {
        res.redirect(`/`);
    }
}

controller.Risk_based_Approach_LevelUp_Measures_Add = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const data = req.body
        let depth_type = ""
        let depth_name = ""
        let redirect = `/security/section/Risk-based-Approach/add`
        if (data.depth_type_level_up) {
            depth_type = 1
            depth_name = data.depth_type_level_up
        } else if (data.depth_type_measures) {
            depth_type = 2
            depth_name = data.depth_type_measures
        } else if (data.depth_type) {
            depth_type = data.depth_type
            depth_name = data.depth_name
            redirect = `/manage/measures/approach_type`
        }


        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_TR_DEFENSE_IN_DEPTH  SET depth_name=?,depth_type=?,acc_id=?",
                [depth_name, depth_type, user], (err, insert_depth) => {
                    if (err) {
                        console.log(err);
                    }
                    res.redirect(redirect);
                });
        });
    } else {
        res.redirect(`/`);
    }
}

controller.Risk_based_Approach_Details = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const { id } = req.params
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(measures.measures_date,'%d/%m/%Y')  day_measures,DATE_FORMAT(measures.measures_date,'%Y-%m-%d')  date_last,ass.assets_id as ch,approach.assets_id as ass_ch,approach.assets_id as assets_id FROM TB_TR_MEASURES_RISK_BASED_APPROACH AS approach LEFT JOIN  TB_TR_MEASURES AS measures ON approach.measures_id=measures.measures_id  LEFT JOIN TB_TR_INFORMATION_ASSETS  as ass ON approach.assets_id=ass.assets_id WHERE measures.acc_id=? AND measures.specify_id=2 AND approach_id=?",
                [user, id], (err, approach) => {
                    conn.query("SELECT * FROM TB_TR_DEFENSE_IN_DEPTH WHERE acc_id= ? ORDER BY depth_id DESC ", [user], (err, depth) => {
                        conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE   type !=3 AND  user_id=?", [user], (err, doc) => {
                            conn.query("SELECT TB_TR_ACCOUNT.acc_id,TB_TR_ACCOUNT.firstname,TB_TR_ACCOUNT.lastname FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5)", (err, account) => {



                                var date = new Date(approach[0].date_last);
                                date.setDate(date.getDate() + approach[0].measures_date_count);
                                var day_last = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
                                var arr_new = []
                                var arr_doc = []

                                if (approach[0].approach_heading_risk_based == 2) {
                                    let arr = approach[0].depth_id_defense.split(',')
                                    arr.push(...approach[0].depth_id_measures.split(','))
                                    arr_new.push(...arr)
                                }
                                if (approach[0].doc_id) {
                                    arr_doc.push(...approach[0].doc_id.split(','))
                                }
                                res.render('./security_section/risk_based_approach_details', {
                                    approach,
                                    day_last,
                                    depth,
                                    arr_new,
                                    arr_doc,
                                    account: account,
                                    doc,
                                    session: req.session
                                });
                            });
                        });
                    });
                });
        });

    } else {
        res.redirect(`/`);
    }
}


controller.General_Measures_Details = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const { id } = req.params
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT *,m.doc_id as doc_id_measures,DATE_FORMAT(m.measures_date,'%d/%m/%Y') as mdate FROM  TB_TR_MEASURES as m LEFT JOIN  TB_TR_MEASURES_TYPE as mt ON m.measures_type_id=mt.measures_type_id LEFT JOIN  TB_TR_PDPA_DOCUMENT as doc  ON m.doc_id=doc.doc_id WHERE specify_id=1 and m.measures_id = ? ORDER BY measures_id DESC",
                [id], (err, general) => {
                    conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE   type !=3 AND  user_id=?", [user], (err, doc) => {
                        conn.query("SELECT TB_TR_ACCOUNT.acc_id,TB_TR_ACCOUNT.firstname,TB_TR_ACCOUNT.lastname FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5)", (err, account) => {




                            var date = new Date(general[0].measures_date);
                            date.setDate(date.getDate() + general[0].measures_date_count);
                            var day_last = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
                            var arr_new = []
                            var arr_doc = []


                            if (general[0].doc_id_measures) {
                                arr_doc.push(...general[0].doc_id_measures.split(','))
                            }


                            res.render('./security_section/general_measures_details', {
                                general,
                                day_last,
                                arr_new,
                                arr_doc,
                                account: account,
                                doc,
                                session: req.session
                            });
                        });
                    });
                });
        });

    } else {
        res.redirect(`/`);
    }
}


controller.Risk_based_Approach_Edit_View = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const { id } = req.params
        req.getConnection((err, conn) => {
            conn.query("SELECT *,measures.doc_id as id_doc,measures.measures_id as id_measures,approach.approach_id as id_approach,DATE_FORMAT(measures_date,'%Y-%m-%d') as day,ass.assets_id as ch,approach.assets_id as ass_ch,approach.assets_id as assets_id FROM TB_TR_MEASURES_RISK_BASED_APPROACH AS approach LEFT JOIN  TB_TR_MEASURES AS measures ON approach.measures_id=measures.measures_id LEFT JOIN TB_TR_INFORMATION_ASSETS  as ass ON approach.assets_id=ass.assets_id WHERE measures.acc_id=? AND measures.specify_id=2 AND approach.approach_id=?  ORDER BY approach.approach_id DESC", [user, id], (err, approach) => {
                conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE  doc_status=2 AND  type !=3 AND doc_action =0", [user], (err, doc) => {
                    conn.query("SELECT * FROM TB_TR_INFORMATION_ASSETS WHERE acc_id=? ORDER BY assets_id DESC", [user], (err, assets) => {
                        conn.query("SELECT * FROM TB_TR_DEFENSE_IN_DEPTH WHERE acc_id=?  ORDER BY depth_id DESC ", [user], (err, depth) => {
                            conn.query("SELECT TB_TR_ACCOUNT.acc_id, TB_TR_ACCOUNT.firstname, TB_TR_ACCOUNT.lastname,TB_TR_ACCOUNT.type_user  FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5);", (err, account_pdpa) => {


                                for (let h = 0; h < approach.length; h++) {
                                    const element = approach[h].ch;
                                    if (element == null) {
                                        for (let h1 = 0; h1 < log_device.length; h1++) {
                                            if (log_device[h1].device_id == approach[h].ass_ch) {
                                                approach[h].assets_name = log_device[h1].name
                                            }
                                        }
                                        for (let h2 = 0; h2 < agent_data.length; h2++) {
                                            if (agent_data[h2].agm_id == approach[h].ass_ch) {
                                                approach[h].assets_name = agent_data[h2].agm_name
                                            }
                                        }
                                    }

                                }

                                let doc_id_name = approach[0].id_doc.split(',')
                                var arr_new = []
                                if (approach[0].approach_heading_risk_based == 2) {
                                    let arr = approach[0].depth_id_defense.split(',')
                                    arr.push(...approach[0].depth_id_measures.split(','))
                                    arr_new.push(...arr)
                                }
                                res.render('./security_section/risk_based_approach_edit', {
                                    doc,
                                    depth,
                                    assets,
                                    arr_new,
                                    approach,
                                    doc_id_name,
                                    account: account_pdpa,
                                    session: req.session
                                });
                            });
                        });
                    });

                });
            });
        });
    } else {
        res.redirect(`/`);
    }
}

controller.Specific_Measures_Details = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const { id } = req.params
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(measures.measures_date,'%d/%m/%Y')  day_measures,DATE_FORMAT(measures.measures_date,'%Y-%m-%d')  date_last FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id  WHERE measures.specify_id=3 AND measures.acc_id=? AND specifi.specific_id=?",
                [user, id], (err, specific) => {
                    conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE   type !=3 AND  user_id=?", [user], (err, doc) => {
                        conn.query("SELECT TB_TR_ACCOUNT.acc_id,TB_TR_ACCOUNT.firstname,TB_TR_ACCOUNT.lastname FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5)", (err, account) => {

                            var date = new Date(specific[0].date_last);
                            date.setDate(date.getDate() + specific[0].measures_date_count);
                            var day_last = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
                            var arr_doc = []
                            if (specific[0].doc_id) {
                                arr_doc.push(...specific[0].doc_id.split(','))
                            }
                            res.render('./security_section/pdpa_specific_measures_details', {
                                specific,
                                account,
                                day_last,
                                doc, arr_doc,
                                session: req.session
                            });
                        });
                    });
                });
        });

    } else {
        res.redirect(`/`);
    }
}

controller.Specific_Measures_Edit_View = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const { id } = req.params
        req.getConnection((err, conn) => {
            conn.query("SELECT *,measures.doc_id as id_doc_edit, specifi.specific_id as id_specific,measures.measures_id as id_measures ,DATE_FORMAT(measures.measures_date,'%Y-%m-%d')  day_measures FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id LEFT JOIN TB_TR_PDPA_DOCUMENT AS doc ON measures.doc_id=doc.doc_id WHERE measures.specify_id=3 AND measures.acc_id=? AND specifi.specific_id=? ORDER BY specifi.specific_id DESC",
                [user, id], (err, specific) => {
                    conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE  doc_status=2 AND  type !=3 AND doc_action =0", [user], (err, doc) => {
                        conn.query("SELECT * FROM  TB_TR_PDPA_EVENT_PROCESS ORDER BY event_process_id DESC ", (err, process2) => {
                            conn.query("SELECT TB_TR_ACCOUNT.acc_id,TB_TR_ACCOUNT.firstname,TB_TR_ACCOUNT.lastname FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5)", (err, account) => {
                                let doc_id_name = specific[0].id_doc_edit.split(',')
                                res.render('./security_section/pdpa_specific_measures_edit', {
                                    account: account,
                                    doc, process2, specific, doc_id_name,
                                    session: req.session
                                });//Update process to process2 fixbug error
                            });
                        });
                    });
                });
        });
    } else {
        res.redirect(`/`);
    }
}

controller.Specific_Measures_Edit_Save = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body
        let measures_id = data.id.split(',')[1] // id TB_TR_MEASURES
        let specific_id = data.id.split(',')[0] // id TB_TR_MEASURES_PDPA_SPECIFIC
        measures_supervisor_text = '';
        if (Array.isArray(data.measures_supervisor)) {
            for (let c = 0; c < data.measures_supervisor.length; c++) {
                if (c == 0) {
                    measures_supervisor_text = measures_supervisor_text + data.measures_supervisor[c];
                } else {
                    measures_supervisor_text = measures_supervisor_text + ',' + data.measures_supervisor[c];
                }
            }
        } else {
            measures_supervisor_text = data.measures_supervisor;
        }
        req.getConnection((err, conn) => {
            conn.query("UPDATE  TB_TR_MEASURES  SET measures_detail=?,measures_section_name=?,measures_date=?,measures_date_count=?,measures_supervisor=?,measures_consult=?,doc_id=? WHERE measures_id=?",
                [data.measures_detail, data.measures_section_name, data.measures_date, data.measures_date_count, measures_supervisor_text, data.measures_consult, data.doc_id.toString(), measures_id], (err, update_measures) => {
                    conn.query("UPDATE  TB_TR_MEASURES_PDPA_SPECIFIC  SET specific_access_control=?,specific_user_access_management=?,specific_user_responsibilitites=?,specific_audit_trails=?,specific_privacy_security_awareness=?,specific_where_incident_occurs=?,specific_access_control_explain=?,specific_user_access_management_explain=?,specific_user_responsibilitites_explain=?,specific_audit_trails_explain=?,specific_privacy_security_awareness_explain=?,specific_where_incident_occurs_explain=?,event_process_id=? WHERE specific_id=?;",
                        [data.specific_access_control, data.specific_user_access_management, data.specific_user_responsibilitites, data.specific_audit_trails, data.specific_privacy_security_awareness, data.specific_where_incident_occurs, data.specific_access_control_explain, data.specific_user_access_management_explain, data.specific_user_responsibilitites_explain, data.specific_audit_trails_explain, data.specific_privacy_security_awareness_explain, data.specific_where_incident_occurs_explain, data.event_process_id, specific_id], (err, insert_specific) => {
                            res.redirect(`/security/section/Specific-Measures`);
                        });
                });

        });
    } else {
        res.redirect(`/`);
    }
}

controller.Manage_Measures_list = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT *,type_m.measures_type_id as id,ms.measures_id as id_check FROM TB_TR_MEASURES_TYPE  AS type_m LEFT JOIN TB_TR_MEASURES AS ms ON type_m.measures_type_id=ms.measures_type_id group by id ORDER BY type_m.measures_type_id DESC", (err, measures_type) => {
                conn.query("SELECT * FROM TB_TR_DEFENSE_IN_DEPTH WHERE acc_id=? ORDER BY  depth_id DESC", [user], (err, depth) => {
                    conn.query("SELECT * FROM TB_TR_MEASURES_RISK_BASED_APPROACH AS approach LEFT JOIN  TB_TR_MEASURES AS measures ON approach.measures_id=measures.measures_id WHERE measures.acc_id=?", [user], (err, depth_check) => {
                        conn.query("SELECT assets.assets_id ,assets_name,approach.assets_id as id_check,assets.device_id,assets.agent_id FROM TB_TR_INFORMATION_ASSETS AS assets LEFT JOIN TB_TR_MEASURES_RISK_BASED_APPROACH  AS  approach ON approach.assets_id=assets.assets_id WHERE assets.acc_id=? group by assets.assets_id ORDER BY assets.assets_id DESC", [user], (err, assets) => {
                            conn.query("SELECT d.device_id as device_id,d.name FROM `TB_TR_DEVICE` as d WHERE device_id NOT IN (SELECT device_id FROM `TB_TR_DEL_DEVICE`)", (err, log_device) => {
                                conn.query("SELECT pam.agm_id,pam.agm_name FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id;", (err, agent_data) => {
                                    conn.query("SELECT a.assets_id,a.device_id,a.agent_id,d.device_id as d_id,pam.agm_id FROM TB_TR_INFORMATION_ASSETS as a left join TB_TR_DEVICE as d on a.device_id = d.device_id left join TB_TR_PDPA_AGENT_MANAGE as pam on a.agent_id = pam.agm_id WHERE a.acc_id=? and a.device_id != '' or a.agent_id != '' ORDER BY a.assets_id DESC", [user], (err, check_e_d) => {


                                        for (let f = 0; f < log_device.length; f++) {
                                            check_status = 0;
                                            for (let index = 0; index < assets.length; index++) {
                                                if (assets[index].device_id == log_device[f].device_id) {
                                                    check_status = 1;
                                                }
                                            }
                                            if (check_status == 0) {
                                                conn.query("INSERT INTO TB_TR_INFORMATION_ASSETS  SET assets_name=?,acc_id=?,device_id=?,status=?", [log_device[f].name, user, log_device[f].device_id, 2], (err, insert_assets) => { });

                                            }

                                        }
                                        for (let g = 0; g < agent_data.length; g++) {
                                            check_status = 0;
                                            for (let the = 0; the < assets.length; the++) {
                                                if (assets[the].agent_id == agent_data[g].agm_id) {
                                                    check_status = 1;
                                                }
                                            }
                                            if (check_status == 0) {
                                                conn.query("INSERT INTO TB_TR_INFORMATION_ASSETS  SET assets_name=?,acc_id=?,agent_id=?,status=?", [agent_data[g].agm_name, user, agent_data[g].agm_id, 2], (err, insert_assets) => { });
                                            }

                                        }

                                        for (let why = 0; why < check_e_d.length; why++) {
                                            if (check_e_d[why].device_id != '' && check_e_d[why].agent_id != '') {
                                                if (check_e_d[why].device_id != null && check_e_d[why].d_id == null) {
                                                    conn.query("UPDATE `DOL_PDPA_UPDATE`.`TB_TR_INFORMATION_ASSETS` SET `status` = '3' WHERE (`assets_id` = ?)", [check_e_d[why].assets_id], (err, query) => { });
                                                } else if (check_e_d[why].agent_id != null && check_e_d[why].agm_id == null) {
                                                    conn.query("UPDATE `DOL_PDPA_UPDATE`.`TB_TR_INFORMATION_ASSETS` SET `status` = '3' WHERE (`assets_id` = ?)", [check_e_d[why].assets_id], (err, query) => { });
                                                }

                                            }
                                        }
                                        //2 ห้ามลบ
                                        //3 ลบได้

                                        conn.query("SELECT assets.assets_id ,assets_name,approach.assets_id as id_check,assets.device_id,assets.agent_id,assets.status FROM TB_TR_INFORMATION_ASSETS AS assets LEFT JOIN TB_TR_MEASURES_RISK_BASED_APPROACH  AS  approach ON approach.assets_id=assets.assets_id WHERE assets.acc_id=? group by assets.assets_id ORDER BY assets.assets_id DESC", [user], (err, assets) => {
                                            conn.query("SELECT d.device_id as device_id,d.name FROM `TB_TR_DEVICE` as d WHERE device_id NOT IN (SELECT device_id FROM `TB_TR_DEL_DEVICE`)", (err, log_device) => {
                                                conn.query("SELECT pam.agm_id,pam.agm_name FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id;", (err, agent_data) => {


                                                    for (let world = 0; world < assets.length; world++) {
                                                        for (let f = 0; f < log_device.length; f++) {
                                                            if (assets[world].device_id == log_device[f].device_id) {
                                                                assets[world].type = "Log Device";
                                                                assets[world].old_name = log_device[f].name
                                                            }
                                                        }
                                                        for (let g = 0; g < agent_data.length; g++) {
                                                            if (assets[world].agent_id == agent_data[g].agm_id) {
                                                                assets[world].type = "Agent";
                                                                assets[world].old_name = agent_data[g].agm_name
                                                            }
                                                        }
                                                        if (assets[world].type == undefined) {
                                                            assets[world].type = "กำหนดเอง"
                                                            assets[world].old_name = '-'
                                                        }
                                                    }


                                                    if (measures_type.length <= 0 || measures_type.length == "") {
                                                        measures_type = "ไม่มีข้อมูล"
                                                    }
                                                    if (depth.length <= 0 || depth.length == "") {
                                                        depth = "ไม่มีข้อมูล"
                                                    }

                                                    if (depth_check.length <= 0 || depth_check.length == "") {
                                                        depth_check = "ไม่มีข้อมูล"
                                                    }
                                                    if (assets.length <= 0 || assets.length == "") {
                                                        assets = "ไม่มีข้อมูล"
                                                    }
                                                    res.send({ measures_type, depth, depth_check, assets, check_e_d })
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
        });
    } else {
        res.redirect(`/`);
    }
}

controller.Manage_Measures_Depth_Update = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body
        req.getConnection((err, conn) => {
            conn.query("UPDATE TB_TR_DEFENSE_IN_DEPTH SET depth_name=?,depth_type=?  WHERE depth_id=?",
                [data.depth_name, data.depth_type, data.depth_id], (err, depth) => {
                    res.redirect(`/manage/measures/approach_type`);
                });
        });
    } else {
        res.redirect(`/`);
    }
}

controller.Manage_Measures_Depth_Delete = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body
        req.getConnection((err, conn) => {
            conn.query("DELETE FROM TB_TR_DEFENSE_IN_DEPTH   WHERE depth_id=?",
                [data.depth_id], (err, depth) => {
                    res.redirect(`/manage/measures/approach_type`);
                });
        });
    } else {
        res.redirect(`/`);
    }
}

controller.Manage_Measures_Update = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body
        req.getConnection((err, conn) => {
            conn.query("UPDATE TB_TR_MEASURES_TYPE SET measures_type=?  WHERE measures_type_id=?",
                [data.measure_type, data.measures_type_id], (err, depth) => {
                    res.redirect(`/manage/measures/measures_type`);
                });
        });
    } else {
        res.redirect(`/`);
    }
}

controller.Manage_Measures_Delete = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body
        req.getConnection((err, conn) => {
            conn.query("DELETE  FROM TB_TR_MEASURES_TYPE  WHERE measures_type_id=?",
                [data.measures_type_id], (err, depth) => {
                    res.redirect(`/manage/measures/measures_type`);
                });
        });
    } else {
        res.redirect(`/`);
    }
}

controller.Information_Assets_Save = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const data = req.body
        let assets_name = ''
        let redirect = `/security/section/Risk-based-Approach/add`

        if (data.assets_name_add) {
            assets_name = data.assets_name_add
            redirect = `/manage/measures/assets`
        } else {
            assets_name = data.assets_name
        }
        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_TR_INFORMATION_ASSETS  SET assets_name=?,acc_id=?", [assets_name, user], (err, insert_assets) => {
                res.redirect(redirect);
            });
        });
    } else {
        res.redirect(`/`);
    }
}

controller.Information_Assets_Edite_Save = (req, res) => {
    if (typeof req.session.userid != "undefined") {

        const data = req.body
        req.getConnection((err, conn) => {
            conn.query("UPDATE  TB_TR_INFORMATION_ASSETS  SET assets_name=? WHERE assets_id=?",
                [data.assets_name, data.assets_id], (err, update_assets) => {
                    res.redirect(`/manage/measures/assets`);
                });
        });
    } else {
        res.redirect(`/`);
    }
}

controller.Information_Assets_Delete = (req, res) => {
    if (typeof req.session.userid != "undefined") {

        const data = req.body
        req.getConnection((err, conn) => {
            conn.query("DELETE FROM  TB_TR_INFORMATION_ASSETS  WHERE assets_id=?",
                [data.assets_id], (err, delete_assets) => {
                    res.redirect(`/manage/measures/assets`);
                });
        });
    } else {
        res.redirect(`/`);
    }
}

controller.C_Delete_Measures = (req, res) => {
    if (typeof req.session.userid != "undefined") {

        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("DELETE FROM TB_TR_MEASURES WHERE (`measures_id` = ?);", [data.data_id], (err, delete_assets) => {
                res.redirect(`/security/section/General-Measures`);
            });
        });
    } else {
        res.redirect(`/`);
    }
}
controller.C_Delete_approach = (req, res) => {
    if (typeof req.session.userid != "undefined") {

        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("DELETE FROM TB_TR_MEASURES_RISK_BASED_APPROACH WHERE (`measures_id` = ?)", [data.data_id], (err, delete_assets) => {
                conn.query("DELETE FROM TB_TR_MEASURES WHERE (`measures_id` = ?);", [data.data_id], (err, delete_assets) => {
                    res.redirect(`/security/section/Risk-based-Approach`);
                });
            });
        });
    } else {
        res.redirect(`/`);
    }
}
controller.C_Delete_specific = (req, res) => {

    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("DELETE FROM `TB_TR_MEASURES_PDPA_SPECIFIC` WHERE (`specific_id` = ?)", [data.data_id], (err, delete_assets) => {
                conn.query("DELETE FROM TB_TR_MEASURES WHERE (`measures_id` = ?);", [data.data_id], (err, delete_assets) => {
                    res.redirect(`/security/section/Specific-Measures`);
                });
            });
        });
    } else {
        res.redirect(`/`);
    }
}


controller.section_specific = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        let user = check_user_login(req);
        req.getConnection((err, conn) => {
            conn.query("SELECT *,specifi.specific_id as id_specific FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id WHERE measures.specify_id=3 AND measures.acc_id=? ORDER BY specifi.specific_id DESC",
                [user], (err, specific) => {
                    if (specific.length <= 0 || specific.length == "") {
                        specific = "ไม่มีข้อมูล";
                    }
                    res.send(specific);
                }
            );
        });
    } else {
        res.redirect("/");
    }
};


module.exports = controller;
