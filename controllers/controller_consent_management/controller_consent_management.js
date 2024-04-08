const session = require("express-session");
const funchistory = require('../account_controllers')
const controller = {};
controller.consent_management_cookies = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const { id } = req.params;
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_DOMAIN_SETTING_COOKIEPOLICY as dsc LEFT JOIN  TB_TR_COOKIEPOLICY AS c ON dsc.cookiepolicy_id=c.id_cp  WHERE dsc.domain_id=? AND c.id_status !=4",
                [id], (err, domain_setting_cookiepolicy) => {
                    conn.query(" SELECT * FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY AS lsc LEFT JOIN TB_TR_PDPA_POLICYLOG AS p  ON lsc.policy_id=p.id_policylog  LEFT JOIN TB_TR_DOMAINGROUP AS dg  ON p.domaingroup_id=dg.id_dg   LEFT JOIN TB_MM_PDPA_COOKIE_STATUS as s  ON dg.status_cookie_id=s.id_status  WHERE lsc.domaingroup_id=? ORDER BY lsc.id_lsc DESC  LIMIT 1",
                        [id], (err, pdpa_log_setting_cookiepolicy) => {
                            var cookiepolicy_check = pdpa_log_setting_cookiepolicy[0].cookiepolicy.split('')
                            funchistory.funchistory(req, "Consent Management", `เข้าสู่เมนู Cookie Consent Management`, req.session.userid)
                            res.render("cookie/view_consent_management/cookie_consent_edit", {
                                cookiepolicy: domain_setting_cookiepolicy,
                                pdpa_log_setting_cookiepolicy,
                                cookiepolicy_check,
                                session: req.session,
                            });
                        });
                });
        });
    } else {
        res.redirect("/");
    }
}


controller.save_cookie = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM   TB_TR_DOMAIN_SETTING_COOKIEPOLICY  WHERE domain_id= ? ", [data.domaingroup_id], (err, select_cookiepolicy_approve) => {
                var cookiepolicys = "";
                if (data.approve_cp) {
                    if (!Array.isArray(data.approve_cp)) {
                        data.approve_cp = new Array(data.approve_cp)
                    }
                    for (let i = 0; i < data.cookiepolicy.length; i++) {
                        for (let j = 0; j < data.approve_cp.length; j++) {
                            if (data.approve_cp[j] == data.cookiepolicy[i]) {
                                data.cookiepolicy[i] = true
                            }
                        }
                    }
                    for (let i = 0; i < data.cookiepolicy.length; i++) {
                        if (data.cookiepolicy[i] == true) {
                            cookiepolicys += 1
                        } else {
                            cookiepolicys += 0
                        }
                    }
                } else {
                    for (let i = 0; i < data.cookiepolicy.length; i++) {
                        cookiepolicys += 0
                    }
                }
                var text = "";
                if (((cookiepolicys.split("1").length - 1) == cookiepolicys.length) || ((cookiepolicys.split("0").length - 1) == cookiepolicys.length)) {
                    if (cookiepolicys.search("1") > -1) {
                        text = "อนุญาตทั้งหมด"
                    } else {
                        text = "ปฏิเสธทั้งหมด"
                    }
                } else {
                    text = "อนุญาตตามที่เลือก"
                }

                conn.query("SELECT * FROM   TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lsc LEFT JOIN TB_TR_DOMAINGROUP AS c ON lsc.domaingroup_id=c.id_dg  WHERE lsc.id_lsc=?", [data.id_lsc], (err, select_log_cookiepolicy) => {
                    conn.query("SELECT * FROM   TB_TR_PDPA_POLICYLOG  WHERE id_policylog= ? ", [select_log_cookiepolicy[0].policy_id], (err, pdpa_policylog) => {
                        conn.query("INSERT INTO  TB_TR_PDPA_POLICYLOG SET policylog_ip=?,policylog_sessionid=?,policylog_browser=?,policylog_date=NOW(),policylog_cookieconsent=?,domaingroup_id=?",
                            [pdpa_policylog[0].policylog_ip, pdpa_policylog[0].policylog_sessionid, pdpa_policylog[0].policylog_browser, text, pdpa_policylog[0].domaingroup_id], (err, update_pdpa_policylog) => {
                                conn.query("INSERT INTO  TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY SET cookiepolicy=?,policy_id=?,domaingroup_id=?",
                                    [cookiepolicys, update_pdpa_policylog.insertId, select_log_cookiepolicy[0].domaingroup_id], (err, update_cookiepolicy_approve) => {
                                        conn.query("UPDATE TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY SET check_edit_consent=0 WHERE id_lsc=?",
                                            [data.id_lsc], (err, update_cookiepolicy_approve) => {
                                                funchistory.funchistory(req, "Consent Management", `แก้ไขข้อมูล Consent Management ${select_log_cookiepolicy[0].namedomain_dg}`, req.session.userid)
                                                res.redirect("/consent/management/cookie");
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


controller.allConsent = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(email_date_send,"%Y-%m-%d") as date_send,email_date_consent as date_consent,doc_name,email_check_send,email_firstname,email_lastname,pd.doc_id,DATE_FORMAT(email_date_consent,"%d/%m/%Y %H:%i:%s") as email_date_consent,email_content,DATE_FORMAT(email_date_send,"%d-%m-%Y  %H:%i:%s") as date_inbox,id_email,email_files,email_to,email_status,email_content,email_subject FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id LEFT JOIN TB_TR_PDPA_DOCUMENT as pd ON mail.doc_id=pd.doc_id WHERE mail.email_status between  1 AND 2 AND  mail.acc_id=? ORDER BY mail.id_email DESC;',
                [user], (err, email_consent) => {
                    conn.query("SELECT check_edit_consent,id_dg,id_policylog,id_lsc,namedomain_dg,DATE_FORMAT(policylog_date,'%Y-%m-%d') as day,DATE_FORMAT(policylog_date,'%d/%m/%Y %H:%i:%s') as policylog_date,cookiepolicy,policylog_ip,policylog_sessionid,policylog_browser FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lsc LEFT JOIN TB_TR_PDPA_POLICYLOG as pl ON lsc.policy_id=pl.id_policylog LEFT JOIN TB_TR_DOMAINGROUP as dg ON lsc.domaingroup_id=dg.id_dg WHERE  dg.acc_id=? ORDER BY id_lsc DESC;",
                        [user], (err, log_cookiepolicy) => {
                            conn.query("SELECT consent_other_name,consent_ckeck,DATE_FORMAT(consent_date,'%Y-%m-%d') as day,consent_firstname,consent_lastname,consent_phone,consent_address,consent_other,dc.doc_consent_status,DATE_FORMAT(consent_date,'%d/%m/%Y %H:%i:%s') as consent_date,DATE_FORMAT(doc_date_create,'%d/%m/%Y %H:%i:%s') as doc_date_create,doc_name,dc.doc_id,doc_consent_id FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA as dc LEFT JOIN TB_TR_PDPA_DOCUMENT as d ON dc.doc_id=d.doc_id  LEFT JOIN TB_TR_PDPA_DOCUMENT_CONSENT  AS pc ON pc.doc_id=d.doc_id WHERE d.user_id=? ORDER BY dc.doc_consent_id DESC;",
                                [user], (err, select_document_consent) => {
                                    conn.query("SELECT * FROM TB_TR_COOKIEPOLICY  WHERE acc_id=? AND id_status !=4",
                                        [user], (err, cookiepolicy) => {
                                            if (email_consent.length > 0 || log_cookiepolicy.length > 0 || select_document_consent.length > 0) {
                                                var limit_email = req.session.email_consent;
                                                // var paper_consent = req.session.paper_consent;
                                                var cookie_consent = req.session.cookie_consent;
                                                res.send({ email_consent, log_cookiepolicy, cookiepolicy, select_document_consent, limit_email, cookie_consent });
                                            } else {
                                                var data_null = "ไม่มีข้อมูล";
                                                res.send({ data_null, cookiepolicy })
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

controller.reface_email = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            // conn.query('SELECT DATE_FORMAT(email_date_send,"%Y-%m-%d") as date_send,doc_name,email_check_send,email_firstname,email_lastname,pd.doc_id,DATE_FORMAT(email_date_consent,"%d/%m/%Y %H:%i:%s") as email_date_consent,email_content,DATE_FORMAT(email_date_send,"%d-%m-%Y  %H:%i:%s") as date_inbox,id_email,email_files,email_to,email_status,email_content,email_subject FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id LEFT JOIN doc_pdpa_document as pd ON mail.doc_id=pd.doc_id WHERE mail.email_status between  1 AND 2 AND  mail.acc_id=? ORDER BY mail.id_email DESC;',
            conn.query('SELECT DATE_FORMAT(email_date_send,"%Y-%m-%d") as date_send,doc_name,email_check_send,email_firstname,email_lastname,pd.doc_id,DATE_FORMAT(email_date_consent,"%d/%m/%Y %H:%i:%s") as email_date_consent,email_content,DATE_FORMAT(email_date_send,"%d-%m-%Y  %H:%i:%s") as date_inbox,id_email,email_files,email_to,email_status,email_content,email_subject FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id LEFT JOIN TB_TR_PDPA_DOCUMENT as pd ON mail.doc_id=pd.doc_id WHERE mail.email_status between  1 AND 2 AND  mail.acc_id=? ORDER BY mail.id_email DESC;',
                [user], (err, email_consent) => {
                    if (email_consent.length > 0) {
                        var limit_email = req.session.email_consent;
                        res.send({ email_consent, limit_email });
                    } else {
                        res.send(JSON.stringify("ไม่มีข้อมูล"))
                    }
                });
        });
    } else {
        res.redirect("/");
    }
}

controller.email_search_date = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            // conn.query("SELECT doc_name,email_check_send,email_firstname,email_lastname,pd.doc_id,DATE_FORMAT(email_date_consent,' %d/%m/%Y %H:%i:%s') as email_date_consent,email_content,DATE_FORMAT(email_date_send,' %d/%m/%Y %H:%i:%s') as date_inbox,id_email,email_files,email_to,email_status,email_content,email_subject FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id LEFT JOIN TB_TR_PDPA_DOCUMENT as pd ON mail.doc_id=pd.doc_id WHERE mail.email_status between  1 AND 2 AND  mail.acc_id=? AND (DATE_FORMAT(mail.email_date_consent,'%Y-%m-%d')>=? AND DATE_FORMAT(mail.email_date_consent,'%Y-%m-%d')<=?) ORDER BY mail.id_email DESC;",
            conn.query("SELECT doc_name,email_check_send,email_firstname,email_lastname,pd.doc_id,DATE_FORMAT(email_date_consent,' %d/%m/%Y %H:%i:%s') as email_date_consent,email_content,DATE_FORMAT(email_date_send,' %d/%m/%Y %H:%i:%s') as date_inbox,id_email,email_files,email_to,email_status,email_content,email_subject FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id LEFT JOIN TB_TR_PDPA_DOCUMENT as pd ON mail.doc_id=pd.doc_id WHERE mail.email_status between  1 AND 2 AND  mail.acc_id=? AND (DATE_FORMAT(mail.email_date_consent,'%Y-%m-%d')>=? AND DATE_FORMAT(mail.email_date_consent,'%Y-%m-%d')<=?) ORDER BY mail.id_email DESC;",
                [user, data.date_first, data.date_last], (err, email_consent) => {
                    if (email_consent.length > 0) {
                        var limit_email = req.session.email_consent;
                        res.send({ email_consent, limit_email });
                    } else {
                        res.send(JSON.stringify("ไม่มีข้อมูล"))
                    }
                });
        });
    } else {
        res.redirect("/");
    }
}

controller.email_search_text = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            // conn.query("SELECT DATE_FORMAT(email_date_send,'%Y-%m-%d') as date_send,doc_name,email_check_send,email_firstname,email_lastname,pd.doc_id,DATE_FORMAT(email_date_consent,' %d/%m/%Y %H:%i:%s') as email_date_consent,email_content,DATE_FORMAT(email_date_send,' %d/%m/%Y %H:%i:%s') as date_inbox,id_email,email_files,email_to,email_status,email_content,email_subject FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id LEFT JOIN TB_TR_PDPA_DOCUMENT as pd ON mail.doc_id=pd.doc_id WHERE mail.email_status between  1 AND 2 AND  mail.acc_id=? AND mail.email_to LIKE ?  OR mail.email_subject LIKE ?  OR CONCAT(mail.email_firstname,' ', mail.email_lastname)  LIKE ?  ORDER BY mail.id_email DESC;",
            conn.query("SELECT DATE_FORMAT(email_date_send,'%Y-%m-%d') as date_send,doc_name,email_check_send,email_firstname,email_lastname,pd.doc_id,DATE_FORMAT(email_date_consent,' %d/%m/%Y %H:%i:%s') as email_date_consent,email_content,DATE_FORMAT(email_date_send,' %d/%m/%Y %H:%i:%s') as date_inbox,id_email,email_files,email_to,email_status,email_content,email_subject FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id LEFT JOIN TB_TR_PDPA_DOCUMENT as pd ON mail.doc_id=pd.doc_id WHERE mail.email_status between  1 AND 2 AND  mail.acc_id=? AND mail.email_to LIKE ?  OR mail.email_subject LIKE ?  OR CONCAT(mail.email_firstname,' ', mail.email_lastname)  LIKE ?  ORDER BY mail.id_email DESC;",
                [user, data.text + "%", data.text + "%", data.text + "%"], (err, email_consent) => {
                    if (email_consent.length > 0) {
                        var limit_email = req.session.email_consent;
                        res.send({ email_consent, limit_email });
                    } else {
                        res.send(JSON.stringify("ไม่มีข้อมูล"))
                    }
                });
        });
    } else {
        res.redirect("/");
    }
}

controller.edit_email = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            if (data.edit == "approve") {
                conn.query("SELECT * FROM TB_TR_PDPA_EMAIL WHERE id_email=?",
                    [data.id], (err, pdpa_email) => {
                        conn.query("INSERT INTO TB_TR_PDPA_EMAIL SET  email_check_send=1,email_from=?,doc_id=?,email_firstname=?,email_lastname=?,email_date_consent=NOW(),email_status=2,email_content=?,email_subject=?,email_to=?,email_date_send=?,email_files=?,email_files_csv=?,acc_id=?",
                            [pdpa_email[0].email_from, pdpa_email[0].doc_id, pdpa_email[0].email_firstname, pdpa_email[0].email_lastname, pdpa_email[0].email_content, pdpa_email[0].email_subject, pdpa_email[0].email_to, pdpa_email[0].email_date_send, pdpa_email[0].email_files, pdpa_email[0].email_files_csv, user],
                            (err, update_email) => {
                                conn.query("UPDATE TB_TR_PDPA_EMAIL SET email_check_send=0 WHERE id_email=?",
                                    [pdpa_email[0].id_email], (err, update_email) => {
                                        conn.query('SELECT email_check_send,email_firstname,email_lastname,doc_id,DATE_FORMAT(email_date_consent,"%d/%m/%Y %H:%i:%s") as email_date_consent,email_content,DATE_FORMAT(email_date_send,"%d-%m-%Y %I:%i%p") as date_inbox,id_email,email_files,email_to,email_status,email_content,email_subject FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id  WHERE mail.email_status between  1 AND 2 AND  mail.acc_id=? ORDER BY mail.id_email DESC;', [user], (err, email_consent) => {
                                            funchistory.funchistory(req, "Consent Management", `แก้ไขข้อมูล Consent Management ${pdpa_email[0].email_to}`, req.session.userid)
                                            if (email_consent.length > 0) {
                                                var limit_email = req.session.email_consent;
                                                res.send({ email_consent, limit_email });
                                            } else {
                                                res.send(JSON.stringify("ไม่มีข้อมูล"))
                                            }
                                        });
                                    });
                            });
                    });
            } else {
                conn.query("SELECT * FROM TB_TR_PDPA_EMAIL WHERE id_email=?",
                    [data.id], (err, pdpa_email) => {
                        conn.query("INSERT INTO TB_TR_PDPA_EMAIL SET  email_check_send=1,email_from=?,doc_id=?,email_firstname=?,email_lastname=?,email_date_consent=NOW(),email_status=1,email_content=?,email_subject=?,email_to=?,email_date_send=?,email_files=?,email_files_csv=?,acc_id=?",
                            [pdpa_email[0].email_from, pdpa_email[0].doc_id, pdpa_email[0].email_firstname, pdpa_email[0].email_lastname, pdpa_email[0].email_content, pdpa_email[0].email_subject, pdpa_email[0].email_to, pdpa_email[0].email_date_send, pdpa_email[0].email_files, pdpa_email[0].email_files_csv, user],
                            (err, update_email) => {
                                conn.query("UPDATE TB_TR_PDPA_EMAIL SET email_check_send=0 WHERE id_email=?",
                                    [pdpa_email[0].id_email], (err, update_email) => {
                                        conn.query('SELECT email_check_send,email_firstname,email_lastname,doc_id,DATE_FORMAT(email_date_consent,"%d/%m/%Y %H:%i:%s") as email_date_consent,email_content,DATE_FORMAT(email_date_send,"%d-%m-%Y %I:%i%p") as date_inbox,id_email,email_files,email_to,email_status,email_content,email_subject FROM TB_TR_PDPA_EMAIL as mail LEFT JOIN TB_TR_ACCOUNT as acc ON mail.acc_id=acc.acc_id  WHERE mail.email_status between  1 AND 2 AND  mail.acc_id=? ORDER BY mail.id_email DESC;', [user], (err, email_consent) => {
                                            funchistory.funchistory(req, "Consent Management", `แก้ไขข้อมูล Consent Management ${pdpa_email[0].email_to}`, req.session.userid)
                                            if (email_consent.length > 0) {
                                                var limit_email = req.session.email_consent;
                                                res.send({ email_consent, limit_email });
                                            } else {
                                                res.send(JSON.stringify("ไม่มีข้อมูล"))
                                            }
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



controller.edit_paper = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            if (data.edit == "approve") {
                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA WHERE doc_consent_id=?",
                    [data.id], (err, doc_pdpa_document_consent) => {
                        conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_CONSENT_DATA SET  consent_date=NOW(),doc_id=?,doc_consent_status=1,consent_firstname=?,consent_lastname=?,consent_phone=?,consent_address=?,consent_other=?",
                            [doc_pdpa_document_consent[0].doc_id, doc_pdpa_document_consent[0].consent_firstname, doc_pdpa_document_consent[0].consent_lastname, doc_pdpa_document_consent[0].consent_phone, doc_pdpa_document_consent[0].consent_address, doc_pdpa_document_consent[0].consent_other],
                            (err, update_document_consen) => {
                                conn.query("UPDATE TB_TR_PDPA_DOCUMENT_CONSENT_DATA SET consent_ckeck=0 WHERE doc_consent_id=?",
                                    [data.id], (err, update_document_consent) => {
                                        conn.query("SELECT consent_other_name,consent_ckeck,consent_firstname,consent_lastname,consent_phone,consent_address,consent_other,dc.doc_consent_status,DATE_FORMAT(consent_date,'%d/%m/%Y %H:%i:%s') as consent_date,DATE_FORMAT(doc_date_create,'%d/%m/%Y %H:%i:%s') as doc_date_create,doc_name,dc.doc_id,doc_consent_id FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA as dc LEFT JOIN TB_TR_PDPA_DOCUMENT as d ON dc.doc_id=d.doc_id LEFT JOIN TB_TR_PDPA_DOCUMENT_CONSENT  AS pc ON pc.doc_id=d.doc_id  WHERE d.user_id=? ORDER BY dc.doc_consent_id DESC;",
                                            [user], (err, select_document_consent) => {
                                                funchistory.funchistory(req, "Consent Management", `แก้ไขข้อมูล Consent Management ${select_document_consent[0].doc_name}`, req.session.userid)
                                                res.send(select_document_consent);
                                            });
                                    });
                            });
                    });
            } else {
                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA WHERE doc_consent_id=?",
                    [data.id], (err, doc_pdpa_document_consent) => {
                        conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_CONSENT_DATA SET  consent_date=NOW(),doc_id=?,doc_consent_status=0,consent_firstname=?,consent_lastname=?,consent_phone=?,consent_address=?,consent_other=?",
                            [doc_pdpa_document_consent[0].doc_id, doc_pdpa_document_consent[0].consent_firstname, doc_pdpa_document_consent[0].consent_lastname, doc_pdpa_document_consent[0].consent_phone, doc_pdpa_document_consent[0].consent_address, doc_pdpa_document_consent[0].consent_other],
                            (err, update_document_consen) => {
                                conn.query("UPDATE TB_TR_PDPA_DOCUMENT_CONSENT_DATA SET consent_ckeck=0 WHERE doc_consent_id=?",
                                    [data.id], (err, update_document_consent) => {
                                        conn.query("SELECT consent_other_name,consent_ckeck,consent_firstname,consent_lastname,consent_phone,consent_address,consent_other,dc.doc_consent_status,DATE_FORMAT(consent_date,'%d/%m/%Y %H:%i:%s') as consent_date,DATE_FORMAT(doc_date_create,'%d/%m/%Y %H:%i:%s') as doc_date_create,doc_name,dc.doc_id,doc_consent_id FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA as dc LEFT JOIN TB_TR_PDPA_DOCUMENT as d ON dc.doc_id=d.doc_id LEFT JOIN TB_TR_PDPA_DOCUMENT_CONSENT  AS pc ON pc.doc_id=d.doc_id  WHERE d.user_id=? ORDER BY dc.doc_consent_id DESC;",
                                            [user], (err, select_document_consent) => {
                                                funchistory.funchistory(req, "Consent Management", `แก้ไขข้อมูล Consent Management ${select_document_consent[0].doc_name}`, req.session.userid)
                                                res.send(select_document_consent);
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



controller.paper_search_text = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT consent_other_name,consent_ckeck,DATE_FORMAT(consent_date,'%Y-%m-%d') as day,consent_firstname,consent_lastname,consent_phone,consent_address,consent_other,dc.doc_consent_status,DATE_FORMAT(consent_date,'%d/%m/%Y %H:%i:%s') as consent_date,DATE_FORMAT(doc_date_create,'%d/%m/%Y %H:%i:%s') as doc_date_create,doc_name,dc.doc_id,doc_consent_id FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA as dc LEFT JOIN TB_TR_PDPA_DOCUMENT as d ON dc.doc_id=d.doc_id LEFT JOIN TB_TR_PDPA_DOCUMENT_CONSENT  AS pc ON pc.doc_id=d.doc_id  WHERE d.user_id=? AND CONCAT(consent_firstname,' ', consent_lastname) LIKE ? OR doc_name LIKE ? OR consent_phone LIKE ? OR consent_other LIKE ? ORDER BY dc.doc_consent_id DESC;",
                [user, data.text + "%", data.text + "%", data.text + "%", data.text + "%"], (err, select_document_consent) => {
                    if (select_document_consent.length > 0) {
                        var paper_consent = req.session.paper_consent;
                        res.send({ select_document_consent, paper_consent });
                    } else {
                        res.send(JSON.stringify("ไม่มีข้อมูล"))
                    }
                });
        });
    } else {
        res.redirect("/");
    }
}


controller.paper_search_date = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT consent_other_name,consent_ckeck,DATE_FORMAT(consent_date,'%Y-%m-%d') as day,consent_firstname,consent_lastname,consent_phone,consent_address,consent_other,dc.doc_consent_status,DATE_FORMAT(consent_date,'%d/%m/%Y %H:%i:%s') as consent_date,DATE_FORMAT(doc_date_create,'%d/%m/%Y %H:%i:%s') as doc_date_create,doc_name,dc.doc_id,doc_consent_id FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA as dc LEFT JOIN TB_TR_PDPA_DOCUMENT as d ON dc.doc_id=d.doc_id LEFT JOIN TB_TR_PDPA_DOCUMENT_CONSENT  AS pc ON pc.doc_id=d.doc_id  WHERE d.user_id=? AND  DATE_FORMAT(dc.consent_date,'%Y-%m-%d')>=? AND DATE_FORMAT(dc.consent_date,'%Y-%m-%d')<=? ORDER BY dc.doc_consent_id DESC;",
                [user, data.date_first, data.date_last], (err, select_document_consent) => {
                    if (select_document_consent.length > 0) {
                        var paper_consent = req.session.paper_consent;
                        res.send({ select_document_consent, paper_consent });
                    } else {
                        res.send(JSON.stringify("ไม่มีข้อมูล"))
                    }
                });
        });
    } else {
        res.redirect("/");
    }
}


controller.cookie_search_text = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT check_edit_consent,id_dg,id_policylog,id_lsc,namedomain_dg,DATE_FORMAT(policylog_date,'%Y-%m-%d') as day,DATE_FORMAT(policylog_date,'%Y-%m-%d %H:%i:%s') as policylog_date,cookiepolicy,policylog_ip,policylog_sessionid,policylog_browser FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lsc LEFT JOIN TB_TR_PDPA_POLICYLOG as pl ON lsc.policy_id=pl.id_policylog LEFT JOIN TB_TR_DOMAINGROUP as dg ON lsc.domaingroup_id=dg.id_dg WHERE dg.acc_id=? AND (namedomain_dg=?  OR policylog_ip=?  OR policylog_sessionid=?  OR policylog_browser=?) ORDER BY id_lsc DESC;",
                [user, data.text, data.text, data.text, data.texta], (err, log_cookiepolicy) => {
                    conn.query("SELECT * FROM TB_TR_COOKIEPOLICY  WHERE acc_id=?", [req.session.userid],
                        (err, cookiepolicy) => {
                            if (log_cookiepolicy.length > 0) {
                                res.send({ log_cookiepolicy, cookiepolicy });
                            } else {
                                res.send(JSON.stringify("ไม่มีข้อมูล"))
                            }
                        });
                });
        });
    } else {
        res.redirect("/");
    }
}

controller.cookie_search_date = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT check_edit_consent,id_dg,id_policylog,id_lsc,namedomain_dg,DATE_FORMAT(policylog_date,'%Y-%m-%d') as day,DATE_FORMAT(policylog_date,'%Y-%m-%d %H:%i:%s') as policylog_date,cookiepolicy,policylog_ip,policylog_sessionid,policylog_browser FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lsc LEFT JOIN TB_TR_PDPA_POLICYLOG as pl ON lsc.policy_id=pl.id_policylog LEFT JOIN TB_TR_DOMAINGROUP as dg ON lsc.domaingroup_id=dg.id_dg WHERE dg.acc_id=? AND DATE_FORMAT(policylog_date,'%Y-%m-%d')>=? AND DATE_FORMAT(policylog_date,'%Y-%m-%d')<=? ORDER BY id_lsc DESC;",
                [user, data.date_first, data.date_last], (err, log_cookiepolicy) => {
                    conn.query("SELECT * FROM TB_TR_COOKIEPOLICY  WHERE acc_id=?", [req.session.userid],
                        (err, cookiepolicy) => {
                            if (log_cookiepolicy.length > 0) {
                                res.send({ log_cookiepolicy, cookiepolicy });
                            } else {
                                res.send(JSON.stringify("ไม่มีข้อมูล"))
                            }
                        });
                });
        });
    } else {
        res.redirect("/");
    }
}

module.exports = controller;

