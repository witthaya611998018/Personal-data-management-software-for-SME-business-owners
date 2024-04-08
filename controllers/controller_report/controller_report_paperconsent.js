const session = require("express-session");
const controller = {};

controller.api_report_paperconsent = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            conn.query("SELECT  dc.doc_consent_id,CONCAT(dc.doc_id,' ',consent_firstname,' ',consent_lastname) as name,dc.doc_id,consent_other_name,dc.doc_consent_status,dc.consent_firstname,dc.consent_lastname,dc.consent_phone,dc.consent_address,dc.consent_other,d.doc_name,DATE_FORMAT(dc.consent_date,'%d/%m/%Y %H:%i:%s') as consent_date  FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA as dc LEFT JOIN TB_TR_PDPA_DOCUMENT as d ON dc.doc_id=d.doc_id  LEFT JOIN TB_TR_PDPA_DOCUMENT_CONSENT as pdc ON pdc.doc_id=d.doc_id  WHERE d.user_id=? AND  DATE_FORMAT(dc.consent_date,'%Y-%m')= DATE_FORMAT(now(),'%Y-%m') AND dc.consent_ckeck =1  ORDER BY dc.doc_consent_id DESC",
                [req.session.userid], (err, doc_pdpa_document_consent) => {
                    if (doc_pdpa_document_consent.length > 0) {
                        res.send(doc_pdpa_document_consent)
                    } else {
                        res.send("ไม่มีข้อมูล");
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};

controller.api_report_paperconsent_search_date = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT dc.doc_consent_id,CONCAT(dc.doc_id,' ',consent_firstname,' ',consent_lastname) as name,consent_other_name,dc.doc_consent_status,dc.consent_firstname,dc.consent_lastname,dc.consent_phone,dc.consent_address,dc.consent_other,d.doc_name,DATE_FORMAT(dc.consent_date,'%d/%m/%Y %H:%i:%s') as consent_date  FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA as dc LEFT JOIN TB_TR_PDPA_DOCUMENT as d ON dc.doc_id=d.doc_id LEFT JOIN TB_TR_PDPA_DOCUMENT_CONSENT as pdc ON pdc.doc_id=d.doc_id  WHERE d.user_id=? AND  (DATE_FORMAT(dc.consent_date,'%Y-%m-%d') BETWEEN ?    AND ? ) AND dc.consent_ckeck =1  ORDER BY dc.doc_consent_id DESC ",
                [req.session.userid, data.date_first, data.date_last], (err, doc_pdpa_document_consent) => {
                    if (doc_pdpa_document_consent.length > 0) {
                        res.send(doc_pdpa_document_consent)
                    } else {
                        res.send(JSON.stringify("ไม่มีข้อมูล"));
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};

controller.api_report_paperconsent_search_text = (req, res) => {
    if (typeof req.session.userid != "undefined" || typeof req.session.userid) {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT dc.doc_consent_id,CONCAT(dc.doc_id,' ',consent_firstname,' ',consent_lastname) as name,consent_other_name,dc.doc_consent_status,dc.consent_firstname,dc.consent_lastname,dc.consent_phone,dc.consent_address,dc.consent_other,d.doc_name,DATE_FORMAT(dc.consent_date,'%d/%m/%Y %H:%i:%s') as consent_date  FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA as dc LEFT JOIN TB_TR_PDPA_DOCUMENT as d ON dc.doc_id=d.doc_id LEFT JOIN TB_TR_PDPA_DOCUMENT_CONSENT as pdc ON pdc.doc_id=d.doc_id  WHERE d.user_id=?  AND ((CONCAT(dc.consent_firstname,' ',dc.consent_lastname)=? OR consent_firstname=?)OR d.doc_name=? OR dc.consent_phone=?) AND (DATE_FORMAT(dc.consent_date,'%Y-%m-%d') BETWEEN  ?  AND ? ) AND dc.consent_ckeck =1 ORDER BY dc.doc_consent_id DESC ",
                [req.session.userid, data.text, data.text, data.text, data.text, data.first, data.last], (err, doc_pdpa_document_consent) => {
                    if (doc_pdpa_document_consent.length > 0) {
                        res.send(doc_pdpa_document_consent)
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
