const session = require("express-session");
const uuidv4 = require('uuid').v4;
const fs = require('fs');

const controller = {};

controller.report_policy = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_DATA ", (err, TB_TR_PDPA_DATA) => {
                res.render("cookie/view_report/report_policy", {
                    session: req.session,
                    TB_TR_PDPA_DATA
                });
            });
        });
    }
};
controller.api_policy = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(doc_date_create,'%d/%m/%Y') as day_doc_date_create FROM TB_TR_PDPA_DOCUMENT JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id = TB_TR_PDPA_DOCUMENT.user_id WHERE doc_status = 2 AND DATE_FORMAT(doc_date_create,'%Y-%m') = DATE_FORMAT(NOW(),'%Y-%m') ", (err, TB_TR_PDPA_DOCUMENT) => {
                conn.query("SELECT *,DATE_FORMAT(data_date_start,'%d/%m/%Y') as day_data_date_start,DATE_FORMAT(data_date_end,'%d/%m/%Y') as day_data_date_end FROM TB_TR_PDPA_DATA ", (err, TB_TR_PDPA_DATA) => {
                    conn.query("SELECT * FROM TB_TR_PDPA_DOCTEMP_PAGE ", (err, TB_TR_PDPA_DOCTEMP_PAGE) => {
                        var policy = []
                        for (let i = 0; i < TB_TR_PDPA_DOCUMENT.length; i++) {
                            var policy_data = []
                            for (let j = 0; j < TB_TR_PDPA_DATA.length; j++) {
                                for (let k = 0; k < TB_TR_PDPA_DOCTEMP_PAGE.length; k++) {
                                    if (TB_TR_PDPA_DOCTEMP_PAGE[k].doc_id == TB_TR_PDPA_DOCUMENT[i].doc_id) {
                                        if (TB_TR_PDPA_DOCTEMP_PAGE[k].page_content.search(TB_TR_PDPA_DATA[j].data_code) > -1) {
                                            policy_data.push(TB_TR_PDPA_DATA[j].data_name + ' ' + TB_TR_PDPA_DATA[j].day_data_date_start + '-' + TB_TR_PDPA_DATA[j].day_data_date_end + '<br>')
                                        }
                                    }
                                }
                            }
                            if (policy_data.length == 0) {
                                policy_data.push('-')
                            }
                            policy.push({ document: TB_TR_PDPA_DOCUMENT[i], data: policy_data })
                        }

                        if (policy.length > 0) {
                            res.send({ policy });
                        } else {
                            var data_nul = "ไม่มีข้อมูล"
                            res.send({ data_nul, TB_TR_PDPA_DOCUMENT });
                        }
                    });
                });
            });
        });
    }
};


controller.api_search_policy_text = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(doc_date_create,'%d/%m/%Y') as day_doc_date_create FROM TB_TR_PDPA_DOCUMENT JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id = TB_TR_PDPA_DOCUMENT.user_id WHERE (TB_TR_PDPA_DOCUMENT.doc_name LIKE ? ) AND (doc_status = 2) AND DATE_FORMAT(doc_date_create,'%Y-%m-%d') BETWEEN  ?  AND  ?  "
                , [('%' + data.text + '%'), data.firstDay, data.lastDay], (err, TB_TR_PDPA_DOCUMENT) => {
                    conn.query("SELECT *,DATE_FORMAT(data_date_start,'%d/%m/%Y') as day_data_date_start,DATE_FORMAT(data_date_end,'%d/%m/%Y') as day_data_date_end FROM TB_TR_PDPA_DATA ", (err, TB_TR_PDPA_DATA) => {
                        conn.query("SELECT * FROM TB_TR_PDPA_DOCTEMP_PAGE ", (err, TB_TR_PDPA_DOCTEMP_PAGE) => {
                            var policy = []
                            for (let i = 0; i < TB_TR_PDPA_DOCUMENT.length; i++) {
                                var policy_data = []
                                for (let j = 0; j < TB_TR_PDPA_DATA.length; j++) {
                                    for (let k = 0; k < TB_TR_PDPA_DOCTEMP_PAGE.length; k++) {
                                        if (TB_TR_PDPA_DOCTEMP_PAGE[k].doc_id == TB_TR_PDPA_DOCUMENT[i].doc_id) {
                                            if (TB_TR_PDPA_DOCTEMP_PAGE[k].page_content.search(TB_TR_PDPA_DATA[j].data_code) > -1) {
                                                policy_data.push(TB_TR_PDPA_DATA[j].data_name + ' ' + TB_TR_PDPA_DATA[j].day_data_date_start + '-' + TB_TR_PDPA_DATA[j].day_data_date_end + '<br>')
                                            }
                                        }
                                    }
                                }
                                if (policy_data.length == 0) {
                                    policy_data.push('-')
                                }
                                policy.push({ document: TB_TR_PDPA_DOCUMENT[i], data: policy_data })
                            }

                            if (policy.length > 0) {
                                res.send({ policy });
                            } else {
                                var data_nul = "ไม่มีข้อมูล"
                                res.send({ data_nul, TB_TR_PDPA_DOCUMENT });
                            }
                        });
                    });
                });
        });
    }
};

controller.api_search_policy_date = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(doc_date_create,'%d/%m/%Y') as day_doc_date_create FROM TB_TR_PDPA_DOCUMENT JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id = TB_TR_PDPA_DOCUMENT.user_id WHERE  (doc_status = 2) AND DATE_FORMAT(doc_date_create,'%Y-%m-%d') BETWEEN  ?  AND  ?  "
                , [data.firstDay, data.lastDay], (err, TB_TR_PDPA_DOCUMENT) => {
                    conn.query("SELECT *,DATE_FORMAT(data_date_start,'%d/%m/%Y') as day_data_date_start,DATE_FORMAT(data_date_end,'%d/%m/%Y') as day_data_date_end FROM TB_TR_PDPA_DATA ", (err, TB_TR_PDPA_DATA) => {
                        conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE ", (err, TB_TR_PDPA_DOCTEMP_PAGE) => {
                            var policy = []
                            for (let i = 0; i < TB_TR_PDPA_DOCUMENT.length; i++) {
                                var policy_data = []
                                for (let j = 0; j < TB_TR_PDPA_DATA.length; j++) {
                                    for (let k = 0; k < TB_TR_PDPA_DOCTEMP_PAGE.length; k++) {
                                        if (TB_TR_PDPA_DOCTEMP_PAGE[k].doc_id == TB_TR_PDPA_DOCUMENT[i].doc_id) {
                                            if (TB_TR_PDPA_DOCTEMP_PAGE[k].page_content.search(TB_TR_PDPA_DATA[j].data_code) > -1) {
                                                policy_data.push(TB_TR_PDPA_DATA[j].data_name + ' ' + TB_TR_PDPA_DATA[j].day_data_date_start + '-' + TB_TR_PDPA_DATA[j].day_data_date_end + '<br>')
                                            }
                                        }
                                    }
                                }
                                if (policy_data.length == 0) {
                                    policy_data.push('-')
                                }
                                policy.push({ document: TB_TR_PDPA_DOCUMENT[i], data: policy_data })
                            }

                            if (policy.length > 0) {
                                res.send({ policy });
                            } else {
                                var data_nul = "ไม่มีข้อมูล"
                                res.send({ data_nul, TB_TR_PDPA_DOCUMENT });
                            }
                        });
                    });
                });
        });
    }
};


module.exports = controller;
