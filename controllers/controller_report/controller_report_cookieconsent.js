const session = require("express-session");
const funchistory = require('../account_controllers')
const controller = {};
controller.report_cookieconsent = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "report", `เข้าสู่เมนู รายงาน Cookie Consent`, req.session.userid)
            res.render("cookie/view_report/report_cookieconsent", {
                session: req.session
            });
        });
    } else {
        res.redirect("/");
    }
};
controller.api_cookiesconsent = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_COOKIEPOLICY WHERE acc_id=? AND  id_status!=4", [req.session.userid], (err, cookiepolicy) => {
                conn.query("SELECT id_dg,id_policylog,id_lsc,namedomain_dg,DATE_FORMAT(policylog_date,'%d/%m/%Y %H:%i:%s') as day,cookiepolicy,policylog_ip,policylog_sessionid,policylog_browser FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lsc LEFT JOIN TB_TR_PDPA_POLICYLOG as pl ON lsc.policy_id=pl.id_policylog LEFT JOIN TB_TR_DOMAINGROUP as dg ON lsc.domaingroup_id=dg.id_dg WHERE lsc.check_edit_consent=1 AND dg.acc_id=? AND DATE_FORMAT(policylog_date,'%Y-%m') = DATE_FORMAT(NOW(),'%Y-%m') ORDER BY  lsc.id_lsc DESC ",
                    [req.session.userid], (err, log_cookiepolicy) => {
                        conn.query("SELECT count(*) as count,p.policylog_cookieconsent  FROM TB_TR_PDPA_POLICYLOG AS p  LEFT JOIN TB_TR_DOMAINGROUP AS d  ON p.domaingroup_id=d.id_dg LEFT JOIN TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY AS lc ON lc.policy_id=p.id_policylog  WHERE lc.check_edit_consent=1 AND d.acc_id=?  AND DATE_FORMAT(policylog_date,'%Y-%m') = DATE_FORMAT(NOW(),'%Y-%m') group by p.policylog_cookieconsent order by p.policylog_cookieconsent",
                            [req.session.userid], (err, pie_setting_cookiepolicy) => {
                                conn.query("SELECT policylog_cookieconsent,COUNT(*) as count,DATE_FORMAT(policylog_date,'%d-%m-%Y') as policylog_date FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lc LEFT JOIN TB_TR_PDPA_POLICYLOG as p ON lc.policy_id=p.id_policylog  LEFT JOIN TB_TR_DOMAINGROUP as dg ON p.domaingroup_id=dg.id_dg WHERE lc.check_edit_consent=1 AND p.policylog_cookieconsent='ปฏิเสธทั้งหมด' AND dg.acc_id=?  AND DATE_FORMAT(policylog_date,'%Y-%m') = DATE_FORMAT(NOW(),'%Y-%m') GROUP BY DATE_FORMAT(policylog_date,'%d-%m-%Y');",
                                    [req.session.userid], (err, graph_cookie_consent_reject) => {
                                        conn.query("SELECT policylog_cookieconsent,COUNT(*) as count,DATE_FORMAT(policylog_date,'%d-%m-%Y') as policylog_date FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lc LEFT JOIN TB_TR_PDPA_POLICYLOG as p ON lc.policy_id=p.id_policylog  LEFT JOIN TB_TR_DOMAINGROUP as dg ON p.domaingroup_id=dg.id_dg WHERE lc.check_edit_consent=1 AND p.policylog_cookieconsent='อนุญาตตามที่เลือก' AND dg.acc_id=?  AND DATE_FORMAT(policylog_date,'%Y-%m') = DATE_FORMAT(NOW(),'%Y-%m') GROUP BY DATE_FORMAT(policylog_date,'%d-%m-%Y');",
                                            [req.session.userid], (err, graph_cookie_consent_accept_custom) => {
                                                conn.query("SELECT policylog_cookieconsent,COUNT(*) as count,DATE_FORMAT(policylog_date,'%d-%m-%Y') as policylog_date FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lc LEFT JOIN TB_TR_PDPA_POLICYLOG as p ON lc.policy_id=p.id_policylog  LEFT JOIN TB_TR_DOMAINGROUP as dg ON p.domaingroup_id=dg.id_dg WHERE lc.check_edit_consent=1 AND p.policylog_cookieconsent='อนุญาตทั้งหมด' AND dg.acc_id=?  AND DATE_FORMAT(policylog_date,'%Y-%m') = DATE_FORMAT(NOW(),'%Y-%m') GROUP BY DATE_FORMAT(policylog_date,'%d-%m-%Y');",
                                                    [req.session.userid], (err, graph_cookie_consent_accept_all) => {
                                                        if (pie_setting_cookiepolicy.length > 0) {
                                                            res.send({ cookiepolicy, log_cookiepolicy, pie_setting_cookiepolicy, graph_cookie_consent_reject, graph_cookie_consent_accept_custom, graph_cookie_consent_accept_all });
                                                        } else {
                                                            var data_nul = "ไม่มีข้อมูล"
                                                            res.send({ data_nul, cookiepolicy });
                                                        }
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


controller.api_search_cookiesconsent_text = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_COOKIEPOLICY WHERE acc_id=?  AND  id_status!=4 ", [req.session.userid], (err, cookiepolicy) => {
                conn.query("SELECT id_dg,id_policylog,id_lsc,namedomain_dg,DATE_FORMAT(policylog_date,'%d/%m/%Y %H:%i:%s') as day,cookiepolicy,policylog_ip,policylog_sessionid,policylog_browser FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lsc LEFT JOIN TB_TR_PDPA_POLICYLOG as pl  ON lsc.policy_id=pl.id_policylog  LEFT JOIN TB_TR_DOMAINGROUP as dg  ON lsc.domaingroup_id=dg.id_dg WHERE lsc.check_edit_consent=1 AND  dg.acc_id=?  AND  (dg.namedomain_dg=?  OR pl.policylog_ip=? OR pl.policylog_sessionid=? OR pl.policylog_browser=?) AND DATE_FORMAT(policylog_date,'%Y-%m-%d') BETWEEN  ?  AND  ?  ORDER BY  lsc.id_lsc DESC;",
                    [req.session.userid, data.text, data.text, data.text, data.text, data.firstDay, data.lastDay], (err, log_cookiepolicy) => {
                        conn.query("SELECT count(*) as count,p.policylog_cookieconsent  FROM TB_TR_PDPA_POLICYLOG AS p  LEFT JOIN  TB_TR_DOMAINGROUP AS d  ON p.domaingroup_id=d.id_dg LEFT JOIN TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY AS lc ON lc.policy_id=p.id_policylog  WHERE lc.check_edit_consent=1 AND d.acc_id=?  AND (d.namedomain_dg=?  OR p.policylog_ip=? OR p.policylog_sessionid=? OR p.policylog_browser=?) group by p.policylog_cookieconsent order by p.policylog_cookieconsent",
                            [req.session.userid, data.text, data.text, data.text, data.text, data.firstDay, data.lastDay], (err, pie_setting_cookiepolicy) => {
                                conn.query("SELECT policylog_cookieconsent,COUNT(*) as count,DATE_FORMAT(policylog_date,'%d-%m-%Y') as policylog_date FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lc LEFT JOIN TB_TR_PDPA_POLICYLOG as p ON lc.policy_id=p.id_policylog  LEFT JOIN TB_TR_DOMAINGROUP as dg ON p.domaingroup_id=dg.id_dg WHERE lc.check_edit_consent=1 AND  p.policylog_cookieconsent='ปฏิเสธทั้งหมด' AND dg.acc_id=? AND (dg.namedomain_dg=?  OR p.policylog_ip=? OR p.policylog_sessionid=? OR p.policylog_browser=?) AND DATE_FORMAT(policylog_date,'%Y-%m-%d') BETWEEN  ?  AND  ?  GROUP BY DATE_FORMAT(policylog_date,'%d-%m-%Y');",
                                    [req.session.userid, data.text, data.text, data.text, data.text, data.firstDay, data.lastDay], (err, graph_cookie_consent_reject) => {
                                        conn.query("SELECT policylog_cookieconsent,COUNT(*) as count,DATE_FORMAT(policylog_date,'%d-%m-%Y') as policylog_date FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lc LEFT JOIN TB_TR_PDPA_POLICYLOG as p ON lc.policy_id=p.id_policylog  LEFT JOIN TB_TR_DOMAINGROUP as dg ON p.domaingroup_id=dg.id_dg WHERE  lc.check_edit_consent=1 AND p.policylog_cookieconsent='อนุญาตตามที่เลือก' AND dg.acc_id=? AND (dg.namedomain_dg=?  OR p.policylog_ip=? OR p.policylog_sessionid=? OR p.policylog_browser=?) AND DATE_FORMAT(policylog_date,'%Y-%m-%d') BETWEEN  ?  AND  ?  GROUP BY DATE_FORMAT(policylog_date,'%d-%m-%Y');",
                                            [req.session.userid, data.text, data.text, data.text, data.text, data.firstDay, data.lastDay], (err, graph_cookie_consent_accept_custom) => {
                                                conn.query("SELECT policylog_cookieconsent,COUNT(*) as count,DATE_FORMAT(policylog_date,'%d-%m-%Y') as policylog_date FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lc LEFT JOIN TB_TR_PDPA_POLICYLOG as p ON lc.policy_id=p.id_policylog  LEFT JOIN TB_TR_DOMAINGROUP as dg ON p.domaingroup_id=dg.id_dg WHERE lc.check_edit_consent=1 AND  p.policylog_cookieconsent='อนุญาตทั้งหมด' AND dg.acc_id=? AND (dg.namedomain_dg=?  OR p.policylog_ip=? OR p.policylog_sessionid=? OR p.policylog_browser=?) AND DATE_FORMAT(policylog_date,'%Y-%m-%d') BETWEEN  ?  AND  ?  GROUP BY DATE_FORMAT(policylog_date,'%d-%m-%Y');",
                                                    [req.session.userid, data.text, data.text, data.text, data.text, data.firstDay, data.lastDay], (err, graph_cookie_consent_accept_all) => {
                                                        if (log_cookiepolicy.length > 0) {
                                                            res.send({ cookiepolicy, log_cookiepolicy, pie_setting_cookiepolicy, graph_cookie_consent_reject, graph_cookie_consent_accept_custom, graph_cookie_consent_accept_all })
                                                        } else {
                                                            res.send(JSON.stringify("ไม่มีข้อมูล"))
                                                        }
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

controller.api_search_cookiesconsent_date = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_COOKIEPOLICY WHERE acc_id=?  AND  id_status!=4 ", [req.session.userid], (err, cookiepolicy) => {
                conn.query("SELECT id_dg,id_policylog,id_lsc,namedomain_dg,DATE_FORMAT(policylog_date,'%d/%m/%Y %H:%i:%s') as day,cookiepolicy,policylog_ip,policylog_sessionid,policylog_browser FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lsc LEFT JOIN TB_TR_PDPA_POLICYLOG as pl ON lsc.policy_id=pl.id_policylog LEFT JOIN TB_TR_DOMAINGROUP as dg ON lsc.domaingroup_id=dg.id_dg WHERE ( DATE_FORMAT(policylog_date,'%Y-%m-%d') BETWEEN  ?  AND  ?)  AND dg.acc_id=? AND lsc.check_edit_consent=1  order by lsc.id_lsc DESC",
                    [data.date_first, data.date_last, req.session.userid], (err, log_cookiepolicy) => {
                        conn.query("SELECT count(*) as count,p.policylog_cookieconsent  FROM TB_TR_PDPA_POLICYLOG AS p  LEFT JOIN  TB_TR_DOMAINGROUP AS d  ON p.domaingroup_id=d.id_dg LEFT JOIN TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY AS lc ON lc.policy_id=p.id_policylog  WHERE ( DATE_FORMAT(policylog_date,'%Y-%m-%d') BETWEEN  ?  AND  ?) AND d.acc_id=? AND lc.check_edit_consent=1  group by p.policylog_cookieconsent order by p.policylog_cookieconsent",
                            [data.date_first, data.date_last, req.session.userid], (err, pie_setting_cookiepolicy) => {
                                conn.query("SELECT policylog_cookieconsent,COUNT(*) as count,DATE_FORMAT(policylog_date,'%d-%m-%Y') as policylog_date FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lc LEFT JOIN TB_TR_PDPA_POLICYLOG as p ON lc.policy_id=p.id_policylog  LEFT JOIN TB_TR_DOMAINGROUP as dg ON p.domaingroup_id=dg.id_dg WHERE ( DATE_FORMAT(policylog_date,'%Y-%m-%d') BETWEEN  ?  AND  ?) AND p.policylog_cookieconsent='ปฏิเสธทั้งหมด' AND dg.acc_id=? AND lc.check_edit_consent=1  GROUP BY DATE_FORMAT(policylog_date,'%d-%m-%Y');",
                                    [data.date_first, data.date_last, req.session.userid], (err, graph_cookie_consent_reject) => {
                                        conn.query("SELECT policylog_cookieconsent,COUNT(*) as count,DATE_FORMAT(policylog_date,'%d-%m-%Y') as policylog_date FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lc LEFT JOIN TB_TR_PDPA_POLICYLOG as p ON lc.policy_id=p.id_policylog  LEFT JOIN TB_TR_DOMAINGROUP as dg ON p.domaingroup_id=dg.id_dg WHERE ( DATE_FORMAT(policylog_date,'%Y-%m-%d') BETWEEN  ?  AND  ?) AND p.policylog_cookieconsent='อนุญาตตามที่เลือก' AND dg.acc_id=?  AND lc.check_edit_consent=1  GROUP BY DATE_FORMAT(policylog_date,'%d-%m-%Y');",
                                            [data.date_first, data.date_last, req.session.userid], (err, graph_cookie_consent_accept_custom) => {
                                                conn.query("SELECT policylog_cookieconsent,COUNT(*) as count,DATE_FORMAT(policylog_date,'%d-%m-%Y') as policylog_date FROM TB_TR_PDPA_LOG_SETTING_COOKIEPOLICY as lc LEFT JOIN TB_TR_PDPA_POLICYLOG as p ON lc.policy_id=p.id_policylog  LEFT JOIN TB_TR_DOMAINGROUP as dg ON p.domaingroup_id=dg.id_dg WHERE ( DATE_FORMAT(policylog_date,'%Y-%m-%d') BETWEEN  ?  AND  ?) AND p.policylog_cookieconsent='อนุญาตทั้งหมด' AND dg.acc_id=?  AND lc.check_edit_consent=1  GROUP BY DATE_FORMAT(policylog_date,'%d-%m-%Y');",
                                                    [data.date_first, data.date_last, req.session.userid], (err, graph_cookie_consent_accept_all) => {
                                                        if (pie_setting_cookiepolicy.length > 0) {
                                                            res.send({ cookiepolicy, log_cookiepolicy, pie_setting_cookiepolicy, graph_cookie_consent_reject, graph_cookie_consent_accept_custom, graph_cookie_consent_accept_all });
                                                        } else {
                                                            res.send(JSON.stringify("ไม่มีข้อมูล"));
                                                        }
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


module.exports = controller;
