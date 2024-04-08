const session = require("express-session");
const uuidv4 = require('uuid').v4;
const fs = require('fs');

const controller = {};

controller.report_pattern = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_DATA ", (err, TB_TR_PDPA_DATA) => {
                res.render("cookie/view_report/report_pattern", {
                    session: req.session
                    , TB_TR_PDPA_DATA
                });
            });
        });
    }
};
controller.api_pattern = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(pattern_create,'%d/%m/%Y') as day_pattern_create,DATE_FORMAT(pattern_start_date,'%d/%m/%Y') as day_pattern_start_date FROM TB_TR_PDPA_PATTERN join TB_MM_PDPA_PATTERN_PROCESSING_BASE on TB_MM_PDPA_PATTERN_PROCESSING_BASE.pattern_processing_base_id = TB_TR_PDPA_PATTERN.pattern_processing_base_id JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id = TB_TR_PDPA_PATTERN.acc_id WHERE  DATE_FORMAT(pattern_create,'%Y-%m') = DATE_FORMAT(NOW(),'%Y-%m') ", (err, pattern) => {
                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT ", (err, TB_TR_PDPA_DOCUMENT) => {
                    conn.query("SELECT *,DATE_FORMAT(data_date_start,'%d/%m/%Y') as day_data_date_start,DATE_FORMAT(data_date_end,'%d/%m/%Y') as day_data_date_end FROM TB_TR_PDPA_DATA ", (err, TB_TR_PDPA_DATA) => {
                        var pattern_data = []

                        for (let i = 0; i < pattern.length; i++) {
                            var pdpa_data = []
                            for (let j = 0; j < TB_TR_PDPA_DATA.length; j++) {
                                if (pattern[i].doc_id_person_data.search(TB_TR_PDPA_DATA[j].data_id) > -1) {
                                    pdpa_data.push(TB_TR_PDPA_DATA[j].data_name + ' ' + TB_TR_PDPA_DATA[j].day_data_date_start + '-' + TB_TR_PDPA_DATA[j].day_data_date_end + '<br>')
                                }
                            }
                            if (pdpa_data.length == 0) {
                                pdpa_data.push('-')
                            }

                            policy = []
                            for (let k = 0; k < TB_TR_PDPA_DOCUMENT.length; k++) {
                                if (pattern[i].doc_id.search(TB_TR_PDPA_DOCUMENT[k].doc_id) > -1) {
                                    policy.push(TB_TR_PDPA_DOCUMENT[k].doc_name)
                                }
                            }
                            if (policy.length == 0) {
                                policy.push('-')
                            }
                            pattern_data.push({ pattern: pattern[i], policy: policy, pdpa_data: pdpa_data })
                        }
                        if (pattern_data.length > 0) {
                            res.send({ pattern_data });
                        } else {
                            var data_nul = "ไม่มีข้อมูล"
                            res.send({ data_nul, pattern_data });
                        }
                    });
                });
            });
        });
    }
};


controller.api_search_pattern_text = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(pattern_create,'%d/%m/%Y') as day_pattern_create,DATE_FORMAT(pattern_start_date,'%d/%m/%Y') as day_pattern_start_date FROM TB_TR_PDPA_PATTERN join TB_MM_PDPA_PATTERN_PROCESSING_BASE on TB_MM_PDPA_PATTERN_PROCESSING_BASE.pattern_processing_base_id = TB_TR_PDPA_PATTERN.pattern_processing_base_id JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id = TB_TR_PDPA_PATTERN.acc_id WHERE (TB_TR_PDPA_PATTERN.pattern_name LIKE ? ) AND  DATE_FORMAT(pattern_create,'%Y-%m-%d') BETWEEN  ?  AND  ? "
                , [('%' + data.text + '%'), data.firstDay, data.lastDay], (err, pattern) => {
                    conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT ", (err, TB_TR_PDPA_DOCUMENT) => {
                        conn.query("SELECT *,DATE_FORMAT(data_date_start,'%d/%m/%Y') as day_data_date_start,DATE_FORMAT(data_date_end,'%d/%m/%Y') as day_data_date_end FROM TB_TR_PDPA_DATA ", (err, TB_TR_PDPA_DATA) => {
                            var pattern_data = []

                            for (let i = 0; i < pattern.length; i++) {
                                var pdpa_data = []
                                for (let j = 0; j < TB_TR_PDPA_DATA.length; j++) {
                                    if (pattern[i].doc_id_person_data.search(TB_TR_PDPA_DATA[j].data_id) > -1) {
                                        pdpa_data.push(TB_TR_PDPA_DATA[j].data_name + ' ' + TB_TR_PDPA_DATA[j].day_data_date_start + '-' + TB_TR_PDPA_DATA[j].day_data_date_end + '<br>')
                                    }
                                }
                                if (pdpa_data.length == 0) {
                                    pdpa_data.push('-')
                                }

                                policy = []
                                for (let k = 0; k < TB_TR_PDPA_DOCUMENT.length; k++) {
                                    if (pattern[i].doc_id.search(TB_TR_PDPA_DOCUMENT[k].doc_id) > -1) {
                                        policy.push(TB_TR_PDPA_DOCUMENT[k].doc_name)
                                    }
                                }
                                if (policy.length == 0) {
                                    policy.push('-')
                                }
                                pattern_data.push({ pattern: pattern[i], policy: policy, pdpa_data: pdpa_data })
                            }
                            if (pattern_data.length > 0) {
                                res.send({ pattern_data });
                            } else {
                                var data_nul = "ไม่มีข้อมูล"
                                res.send({ data_nul, pattern_data });
                            }
                        });
                    });
                });
        });
    }
};

controller.api_search_pattern_date = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(pattern_create,'%d/%m/%Y') as day_pattern_create,DATE_FORMAT(pattern_start_date,'%d/%m/%Y') as day_pattern_start_date FROM TB_TR_PDPA_PATTERN join TB_MM_PDPA_PATTERN_PROCESSING_BASE on TB_MM_PDPA_PATTERN_PROCESSING_BASE.pattern_processing_base_id = TB_TR_PDPA_PATTERN.pattern_processing_base_id JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id = TB_TR_PDPA_PATTERN.acc_id WHERE  DATE_FORMAT(pattern_create,'%Y-%m-%d') BETWEEN  ?  AND  ? ",
                [data.firstDay, data.lastDay], (err, pattern) => {
                    conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT ", (err, TB_TR_PDPA_DOCUMENT) => {
                        conn.query("SELECT *,DATE_FORMAT(data_date_start,'%d/%m/%Y') as day_data_date_start,DATE_FORMAT(data_date_end,'%d/%m/%Y') as day_data_date_end FROM TB_TR_PDPA_DATA ", (err, TB_TR_PDPA_DATA) => {
                            var pattern_data = []

                            for (let i = 0; i < pattern.length; i++) {
                                var pdpa_data = []
                                for (let j = 0; j < TB_TR_PDPA_DATA.length; j++) {
                                    if (pattern[i].doc_id_person_data.search(TB_TR_PDPA_DATA[j].data_id) > -1) {
                                        pdpa_data.push(TB_TR_PDPA_DATA[j].data_name + ' ' + TB_TR_PDPA_DATA[j].day_data_date_start + '-' + TB_TR_PDPA_DATA[j].day_data_date_end + '<br>')
                                    }
                                }
                                if (pdpa_data.length == 0) {
                                    pdpa_data.push('-')
                                }

                                policy = []
                                for (let k = 0; k < TB_TR_PDPA_DOCUMENT.length; k++) {
                                    if (pattern[i].doc_id.search(TB_TR_PDPA_DOCUMENT[k].doc_id) > -1) {
                                        policy.push(TB_TR_PDPA_DOCUMENT[k].doc_name)
                                    }
                                }
                                if (policy.length == 0) {
                                    policy.push('-')
                                }
                                pattern_data.push({ pattern: pattern[i], policy: policy, pdpa_data: pdpa_data })
                            }
                            if (pattern_data.length > 0) {
                                res.send({ pattern_data });
                            } else {
                                var data_nul = "ไม่มีข้อมูล"
                                res.send({ data_nul, pattern_data });
                            }
                        });
                    });
                });
        });

    }
};


module.exports = controller;
