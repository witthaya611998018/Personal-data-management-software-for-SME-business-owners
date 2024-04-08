const session = require("express-session");
const funchistory = require('../account_controllers')
const controller = {};

controller.report_emailconsent = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "report", `เข้าสู่เมนู รายงาน E-mail Consent`, req.session.userid)
            res.render("cookie/view_report/report_emailconsent", {
                session: req.session
            });
        });
    } else {
        res.redirect("/");
    }
};

controller.api_report_emailconsent = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            conn.query("SELECT id_email,CONCAT(doc_id,' ',email_to) as doc_email,email_firstname,email_lastname,doc_id,DATE_FORMAT(email_date_send,'%d/%m/%Y %H:%i:%s') as date_send,DATE_FORMAT(email_date_consent,'%d/%m/%Y %H:%i:%s') as date_consent,DATE_FORMAT(NOW(),'%m-%Y') as date_now,email_to,email_subject,email_date_send,email_subject,email_status FROM  TB_TR_PDPA_EMAIL WHERE email_status between 1 AND 2  AND  acc_id=? AND (DATE_FORMAT(email_date_consent,'%Y-%m')=DATE_FORMAT(NOW(),'%Y-%m'))  ORDER BY id_email DESC ",
                [req.session.userid], (err, log_pdpa_email) => {
                    if (log_pdpa_email.length > 0) {
                        res.send(log_pdpa_email);
                    } else {
                        res.send(JSON.stringify("ไม่มีข้อมูล"));
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};


controller.api_report_emailconsent_search_text = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT  id_email,CONCAT(doc_id,' ',email_to) as doc_email,email_firstname,email_lastname,doc_id,email_status,DATE_FORMAT(email_date_send,'%d/%m/%Y %H:%i:%s') as date_send,DATE_FORMAT(email_date_consent,'%d/%m/%Y %H:%i:%s') as date_consent,DATE_FORMAT(NOW(),'%m-%Y') as date_now,email_to,email_subject,email_date_send,email_subject,email_status FROM  TB_TR_PDPA_EMAIL WHERE   acc_id=?  AND email_status between 1 AND 2  AND  ((CONCAT(email_firstname, ' ',email_lastname)=? OR email_firstname=?) OR  email_subject=? OR email_to=?)  AND (DATE_FORMAT(email_date_consent,'%Y-%m-%d') BETWEEN  ?   AND  ?) AND  email_check_send =1  ORDER  BY id_email DESC",
                [req.session.userid, data.text, data.text, data.text, data.text, data.first, data.last], (err, log_pdpa_email) => {
                    if (log_pdpa_email.length > 0) {
                        res.send(log_pdpa_email);
                    } else {
                        res.send(JSON.stringify("ไม่มีข้อมูล"));
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};


controller.api_report_emailconsent_search_date = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT  id_email,CONCAT(doc_id,' ',email_to) as doc_email,email_firstname,email_lastname,doc_id,email_status,DATE_FORMAT(email_date_send,'%d/%m/%Y %H:%i:%s') as date_send,DATE_FORMAT(email_date_consent,'%d/%m/%Y %H:%i:%s') as date_consent,DATE_FORMAT(NOW(),'%m-%Y') as date_now,email_to,email_subject,email_date_send,email_subject,email_status FROM  TB_TR_PDPA_EMAIL WHERE email_status between 1 AND 2  AND DATE_FORMAT(email_date_consent,'%Y-%m-%d')>=? AND DATE_FORMAT(email_date_consent,'%Y-%m-%d')<=? AND  acc_id=?   ORDER BY id_email DESC",
                [data.date_first, data.date_last, req.session.userid], (err, log_pdpa_email) => {
                    if (log_pdpa_email.length > 0) {
                        res.send(log_pdpa_email)
                    } else {
                        res.send(JSON.stringify("ไม่มีข้อมูล"))
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};



module.exports = controller;
