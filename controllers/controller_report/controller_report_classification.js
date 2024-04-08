const session = require("express-session");
const uuidv4 = require('uuid').v4;
const fs = require('fs');

const controller = {};

controller.report_classification = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
} else {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_DATA ", (err, TB_TR_PDPA_DATA) => {

                res.render("cookie/view_report/report_classification", {

                    session: req.session
                    , TB_TR_PDPA_DATA
                });
            });
        });
    }
};
controller.api_classification = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
} else {
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(classify_create,'%d/%m/%Y') as day_classify_create FROM TB_TR_PDPA_CLASSIFICATION join TB_TR_PDPA_PATTERN on TB_TR_PDPA_PATTERN.pattern_id = TB_TR_PDPA_CLASSIFICATION.pattern_id join TB_MM_PDPA_PATTERN_PROCESSING_BASE on TB_MM_PDPA_PATTERN_PROCESSING_BASE.pattern_processing_base_id = TB_TR_PDPA_CLASSIFICATION.pattern_processing_base_id JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id = TB_TR_PDPA_CLASSIFICATION.acc_id WHERE  DATE_FORMAT(classify_create,'%Y-%m') = DATE_FORMAT(NOW(),'%Y-%m') ", (err, classify) => {
                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT ", (err, TB_TR_PDPA_DOCUMENT) => {
                    conn.query("SELECT *,DATE_FORMAT(data_date_start,'%d/%m/%Y') as day_data_date_start,DATE_FORMAT(data_date_end,'%d/%m/%Y') as day_data_date_end FROM TB_TR_PDPA_DATA ", (err, TB_TR_PDPA_DATA) => {
                        var classify_data = []
                        for (let i = 0; i < classify.length; i++) {
                            var pdpa_data = []
                            for (let j = 0; j < TB_TR_PDPA_DATA.length; j++) {
                                if (classify[i].doc_id_person_data_pattern.search(TB_TR_PDPA_DATA[j].data_id) > -1) {
                                    pdpa_data.push(TB_TR_PDPA_DATA[j].data_name+' '+TB_TR_PDPA_DATA[j].day_data_date_start+'-'+TB_TR_PDPA_DATA[j].day_data_date_end+'<br>')
                                }
                            }
                            if (pdpa_data.length == 0) {
                                pdpa_data.push('-')
                            }

                            policy = []
                            for (let k = 0; k < TB_TR_PDPA_DOCUMENT.length; k++) {
                                if (classify[i].doc_id.search(TB_TR_PDPA_DOCUMENT[k].doc_id) > -1) {
                                    policy.push(TB_TR_PDPA_DOCUMENT[k].doc_name)
                                }
                            }
                            if (policy.length == 0) {
                                policy.push('-')
                            }
                            classify_data.push({ classify: classify[i], policy: policy, pdpa_data: pdpa_data })
                        }
                        if (classify_data.length > 0) {
                            res.send({ classify_data });
                        } else {
                            var data_nul = "ไม่มีข้อมูล"
                            res.send({ data_nul, classify_data });
                        }
                    });
                });
            });
        });
    }
};


controller.api_search_classification_text = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
} else {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(classify_create,'%d/%m/%Y') as day_classify_create FROM TB_TR_PDPA_CLASSIFICATION join TB_TR_PDPA_PATTERN on TB_TR_PDPA_PATTERN.pattern_id = TB_TR_PDPA_CLASSIFICATION.pattern_id join TB_MM_PDPA_PATTERN_PROCESSING_BASE on TB_MM_PDPA_PATTERN_PROCESSING_BASE.pattern_processing_base_id = TB_TR_PDPA_CLASSIFICATION.pattern_processing_base_id JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id = TB_TR_PDPA_CLASSIFICATION.acc_id WHERE  (TB_TR_PDPA_CLASSIFICATION.classify_name LIKE ? ) AND  DATE_FORMAT(classify_create,'%Y-%m-%d') BETWEEN  ?  AND  ? "
            ,[('%' + data.text + '%'), data.firstDay, data.lastDay], (err, classify) => {
                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT ", (err, TB_TR_PDPA_DOCUMENT) => {
                    conn.query("SELECT *,DATE_FORMAT(data_date_start,'%d/%m/%Y') as day_data_date_start,DATE_FORMAT(data_date_end,'%d/%m/%Y') as day_data_date_end FROM TB_TR_PDPA_DATA ", (err, TB_TR_PDPA_DATA) => {
                        var classify_data = []
                        for (let i = 0; i < classify.length; i++) {
                            var pdpa_data = []
                            for (let j = 0; j < TB_TR_PDPA_DATA.length; j++) {
                                if (classify[i].doc_id_person_data_pattern.search(TB_TR_PDPA_DATA[j].data_id) > -1) {
                                    pdpa_data.push(TB_TR_PDPA_DATA[j].data_name+' '+TB_TR_PDPA_DATA[j].day_data_date_start+'-'+TB_TR_PDPA_DATA[j].day_data_date_end+'<br>')
                                }
                            }
                            if (pdpa_data.length == 0) {
                                pdpa_data.push('-')
                            }

                            policy = []
                            for (let k = 0; k < TB_TR_PDPA_DOCUMENT.length; k++) {
                                if (classify[i].doc_id.search(TB_TR_PDPA_DOCUMENT[k].doc_id) > -1) {
                                    policy.push(TB_TR_PDPA_DOCUMENT[k].doc_name)
                                }
                            }
                            if (policy.length == 0) {
                                policy.push('-')
                            }
                            classify_data.push({ classify: classify[i], policy: policy, pdpa_data: pdpa_data })
                        }
                        if (classify_data.length > 0) {
                            res.send({ classify_data });
                        } else {
                            var data_nul = "ไม่มีข้อมูล"
                            res.send({ data_nul, classify_data });
                        }
                    });
                });
            });
        });
    }
};

controller.api_search_classification_date = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
} else {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(classify_create,'%d/%m/%Y') as day_classify_create FROM TB_TR_PDPA_CLASSIFICATION join TB_TR_PDPA_PATTERN on TB_TR_PDPA_PATTERN.pattern_id = TB_TR_PDPA_CLASSIFICATION.pattern_id join TB_MM_PDPA_PATTERN_PROCESSING_BASE on TB_MM_PDPA_PATTERN_PROCESSING_BASE.pattern_processing_base_id = TB_TR_PDPA_CLASSIFICATION.pattern_processing_base_id JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id = TB_TR_PDPA_CLASSIFICATION.acc_id WHERE DATE_FORMAT(classify_create,'%Y-%m-%d') BETWEEN  ?  AND  ?  "
            ,[data.firstDay, data.lastDay], (err, classify) => {
                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT ", (err, TB_TR_PDPA_DOCUMENT) => {
                    conn.query("SELECT *,DATE_FORMAT(data_date_start,'%d/%m/%Y') as day_data_date_start,DATE_FORMAT(data_date_end,'%d/%m/%Y') as day_data_date_end FROM TB_TR_PDPA_DATA ", (err, TB_TR_PDPA_DATA) => {
                        var classify_data = []
                        for (let i = 0; i < classify.length; i++) {
                            var pdpa_data = []
                            for (let j = 0; j < TB_TR_PDPA_DATA.length; j++) {
                                if (classify[i].doc_id_person_data_pattern.search(TB_TR_PDPA_DATA[j].data_id) > -1) {
                                    pdpa_data.push(TB_TR_PDPA_DATA[j].data_name+' '+TB_TR_PDPA_DATA[j].day_data_date_start+'-'+TB_TR_PDPA_DATA[j].day_data_date_end+'<br>')
                                }
                            }
                            if (pdpa_data.length == 0) {
                                pdpa_data.push('-')
                            }

                            policy = []
                            for (let k = 0; k < TB_TR_PDPA_DOCUMENT.length; k++) {
                                if (classify[i].doc_id.search(TB_TR_PDPA_DOCUMENT[k].doc_id) > -1) {
                                    policy.push(TB_TR_PDPA_DOCUMENT[k].doc_name)
                                }
                            }
                            if (policy.length == 0) {
                                policy.push('-')
                            }
                            classify_data.push({ classify: classify[i], policy: policy, pdpa_data: pdpa_data })
                        }
                        if (classify_data.length > 0) {
                            res.send({ classify_data });
                        } else {
                            var data_nul = "ไม่มีข้อมูล"
                            res.send({ data_nul, classify_data });
                        }
                    });
                });
            });
        });
    }
};


module.exports = controller;
