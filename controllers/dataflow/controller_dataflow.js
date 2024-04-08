const controller = {}
const checkDiskSpace = require('check-disk-space').default
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const Base64 = require('crypto-js/enc-base64');
const sha256 = require('crypto-js/sha256');
const path = require('path');

const funchistory = require('../account_controllers')

controller.home = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect('/')
    } else {
        const user = req.session.userid
        const { id } = req.params;
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE doc_status = 2 AND doc_action IS NOT TRUE;', (err, policy) => {
                conn.query("SELECT * FROM TB_TR_PDPA_PATTERN;", (err, pattern) => {
                    conn.query("SELECT * FROM TB_TR_PDPA_CLASSIFICATION;", (err, classify) => {
                        conn.query("SELECT * FROM TB_TR_ACCOUNT;", (err, account) => {
                            conn.query('SELECT * FROM TB_TR_PDPA_DATA;', (err, data) => {

                                funchistory.funchistory(req, "dataflow", `เข้าสู่เมนู แผนผังข้อมูล`, req.session.userid)
                                res.render('./dataflow/home_dataflow', {
                                    policy,
                                    pattern,
                                    classify,
                                    account,
                                    data,
                                    session: req.session
                                })
                            })
                        })
                    })
                })
            })
        })
    }
}

controller.get_search_flow = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {

        funchistory.funchistory(req, "dataflow", `ค้นหา แผนผังข้อมูล`, req.session.userid)
        
        var data_in = req.body;
        data_in.select_personal_data = data_in.select_personal_data.split(',');
        var data_out = [];
        
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_ACCOUNT;", (err, account) => {
                conn.query("SELECT * FROM TB_TR_PDPA_PATTERN;", (err, pattern) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_DATA;', (err, data) => {
                        conn.query('SELECT *,DATE_FORMAT(TB_TR_PDPA_DOCUMENT.doc_date_create, "%d/%m/%Y %H:%i:%s" ) as doc_date_create_date  FROM TB_TR_PDPA_DOCUMENT ;', (err, policy) => {
                            conn.query("SELECT * FROM TB_TR_PDPA_CLASSIFICATION;", (err, classify) => {
                                conn.query("SELECT TB_TR_PDPA_DOCUMENT.doc_id as doc_id,TB_TR_PDPA_DOCUMENT_PAGE.page_content as page_content FROM TB_TR_PDPA_DOCUMENT join TB_TR_PDPA_DOCUMENT_PAGE on TB_TR_PDPA_DOCUMENT.doc_id = TB_TR_PDPA_DOCUMENT_PAGE.doc_id ; ", (err, data_policy) => {
                                    for (let i = 0; i < pattern.length; i++) {
                                        data_out.push({ pattern: [pattern[i]], pattern_name_user_inside: [], pattern_name_user_outside: [], pattern_id_user_inside: [], pattern_id_user_outside: [], pattern_doc_id_person_data_name: [], pattern_doc_id_person_data_code: [], pattern_doc_id_person_data_id: [], policy_name: [], policy_data_code: [], policy_data_name: [], policy_id: [], policy: [], classify_name: [], classify_id: [], classify: [], classify_doc_id_person_data_pattern_name: [], classify_doc_id_person_data_pattern_code: [], classify_name_user_inside: [], classify_name_user_outside: [] })
                                        for (let a = 0; a < account.length; a++) {
                                            if (pattern[i].pattern_processor_inside_id.search(account[a].acc_id) > -1) {
                                                data_out[data_out.length - 1].pattern_id_user_inside.push(account[a].acc_id);
                                                data_out[data_out.length - 1].pattern_name_user_inside.push(account[a].name);
                                            }
                                        }
                                        for (let a = 0; a < account.length; a++) {
                                            if (pattern[i].pattern_processor_outside_id.search(account[a].acc_id) > -1) {
                                                data_out[data_out.length - 1].pattern_id_user_outside.push(account[a].acc_id);
                                                data_out[data_out.length - 1].pattern_name_user_outside.push(account[a].name);
                                            }
                                        }
                                        for (let j = 0; j < data.length; j++) {
                                            if (pattern[i].doc_id_person_data != null) {
                                                if (pattern[i].doc_id_person_data.search(data[j].data_id) > -1) {
                                                    data_out[data_out.length - 1].pattern_doc_id_person_data_id.push(data[j].data_id);
                                                    data_out[data_out.length - 1].pattern_doc_id_person_data_code.push(data[j].data_code);
                                                    data_out[data_out.length - 1].pattern_doc_id_person_data_name.push(data[j].data_name);
                                                }
                                            }
                                        }
                                        for (let j = 0; j < policy.length; j++) {
                                            if (pattern[i].doc_id.search(policy[j].doc_id) > -1) {
                                                data_out[data_out.length - 1].policy.push(policy[j]);
                                                data_out[data_out.length - 1].policy_name.push(policy[j].doc_name);
                                                data_out[data_out.length - 1].policy_id.push(policy[j].doc_id);
                                            }
                                        }
                                        for (let j = 0; j < data_policy.length; j++) {
                                            if (pattern[i].doc_id.search(data_policy[j].doc_id) > -1) {
                                                for (let k = 0; k < data.length; k++) {
                                                    if (data_policy[j].page_content != null) {
                                                        if (data_policy[j].page_content.search(data[k].data_code) > -1) {
                                                            data_out[data_out.length - 1].policy_data_code.push(data[k].data_code);
                                                            data_out[data_out.length - 1].policy_data_name.push(data[k].data_name);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        for (let j = 0; j < classify.length; j++) {
                                            var _classify = ({ classify: [], classify_name_user_inside: [], classify_id_user_inside: [], classify_name_user_outside: [], classify_id_user_outside: [] });
                                            if (classify[j].pattern_id == pattern[i].pattern_id) {
                                                _classify.classify.push(classify[j]);
                                                data_out[data_out.length - 1].classify_name.push(classify[j].classify_name);
                                                data_out[data_out.length - 1].classify_id.push(classify[j].classify_id);
                                                var classify_doc_id_person_data_pattern_code = []
                                                var classify_doc_id_person_data_pattern_name = []
                                                for (let k = 0; k < data.length; k++) {
                                                    if (classify[j].doc_id_person_data_pattern != null) {
                                                        if (classify[j].doc_id_person_data_pattern.search(data[k].data_id) > -1) {
                                                            classify_doc_id_person_data_pattern_code.push(data[k].data_code);
                                                            classify_doc_id_person_data_pattern_name.push(data[k].data_name);
                                                        }
                                                    }

                                                }
                                                data_out[data_out.length - 1].classify_doc_id_person_data_pattern_code.push(classify_doc_id_person_data_pattern_code);
                                                data_out[data_out.length - 1].classify_doc_id_person_data_pattern_name.push(classify_doc_id_person_data_pattern_name);
                                                for (let a = 0; a < account.length; a++) {
                                                    if (classify[j].classify_user_access_info_process_inside_from_new_id.search(account[a].acc_id) > -1) {
                                                        _classify.classify_id_user_inside.push(account[a].acc_id);
                                                        _classify.classify_name_user_inside.push(account[a].name);
                                                    }
                                                }
                                                for (let a = 0; a < account.length; a++) {
                                                    if (classify[j].classify_user_access_info_process_outside_from_new_id.search(account[a].acc_id) > -1) {
                                                        _classify.classify_id_user_outside.push(account[a].acc_id);
                                                        _classify.classify_name_user_outside.push(account[a].name);
                                                    }
                                                }
                                                data_out[data_out.length - 1].classify.push(_classify);
                                            }
                                        }

                                    }
                                    // ค้นหา
                                    // select_policy:
                                    if (data_in.select_policy != '') {
                                        for (let i = 0; i < data_out.length; i++) {
                                            if (data_out[i].policy_id != '') {
                                                if (data_out[i].policy_id.indexOf(parseInt(data_in.select_policy)) == -1) {
                                                    data_out.splice(i, 1);
                                                    i--;
                                                }
                                            }
                                        }
                                    }
                                    // select_pattern
                                    if (data_in.select_pattern != '') {
                                        for (let i = 0; i < data_out.length; i++) {
                                            if (data_out[i].pattern[0].pattern_id != data_in.select_pattern) {
                                                data_out.splice(i, 1);
                                                i--;
                                            }
                                        }
                                    }
                                    // select_classify
                                    if (data_in.select_classify != '') {
                                        for (let i = 0; i < data_out.length; i++) {
                                            if (data_out[i].classify_id != data_in.select_classify) {
                                                data_out.splice(i, 1);
                                                i--;
                                            }
                                        }
                                    }
                                    // select_users
                                    if (data_in.select_users != '') {
                                        for (let i = 0; i < data_out.length; i++) {
                                            var have_c = 0
                                            for (let c = 0; c < data_out[i].classify.length; c++) {
                                                if (data_out[i].classify[c].classify_id_user_inside.indexOf(parseInt(data_in.select_users)) > -1 || data_out[i].classify[c].classify_id_user_outside.indexOf(parseInt(data_in.select_users)) > -1) {
                                                    have_c++
                                                }
                                            }
                                            if (have_c > 0) {
                                                if (have_c == 1) {
                                                    for (let c = 0; c < data_out[i].classify.length; c++) {
                                                        if (data_out[i].classify[c].classify_id_user_inside.indexOf(parseInt(data_in.select_users)) > -1 || data_out[i].classify[c].classify_id_user_outside.indexOf(parseInt(data_in.select_users)) > -1) {

                                                        } else {
                                                            data_out[i].classify.splice(c, 1);
                                                            c--;
                                                        }
                                                    }
                                                }
                                            } else {
                                                if (data_out[i].pattern_id_user_inside.indexOf(parseInt(data_in.select_users)) > -1 || data_out[i].pattern_id_user_outside.indexOf(parseInt(data_in.select_users)) > -1) {

                                                } else {
                                                    data_out.splice(i, 1);
                                                    i--;
                                                }
                                            }
                                        }
                                    }
                                    // select_personal_data
                                    // ค้นหา data แบบ OR 
                                    // if (data_in.select_personal_data[0] != '') {
                                    //     for (let i = 0; i < data_out.length; i++) {
                                    //         var have_data = 0;
                                    //         for (let j = 0; j < data_in.select_personal_data.length; j++) {
                                    //             if (data_out[i].pattern_doc_id_person_data_id.indexOf(parseInt(data_in.select_personal_data[j])) > -1) {
                                    //                 have_data++;
                                    //             }
                                    //         }
                                    //         if (have_data == 0) {
                                    //             data_out.splice(i, 1);
                                    //             i--;
                                    //         }
                                    //     }
                                    // }
                                    // ค้นหา data แบบ AND
                                    if (data_in.select_personal_data[0] != '') {
                                        for (let i = 0; i < data_out.length; i++) {
                                            var have_data = 0;
                                            for (let j = 0; j < data_in.select_personal_data.length; j++) {
                                                if (data_out[i].pattern_doc_id_person_data_id.indexOf(parseInt(data_in.select_personal_data[j])) > -1) {
                                                    have_data++;
                                                }
                                            }
                                            if (have_data != data_in.select_personal_data.length) {
                                                data_out.splice(i, 1);
                                                i--;
                                            }
                                            have_data = 0;
                                        }
                                    }

                                    res.send(data_out);
                                });
                            });
                        });
                    });
                });
            });
        });
    }
}


controller.flow_preview_print = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect('/')
    } else {
        const user = req.session.userid
        const { select_policy } = req.params;
        const { select_pattern } = req.params;
        const { select_classify } = req.params;
        const { select_personal_data } = req.params;
        const { select_users } = req.params;

        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE doc_status = 2 AND doc_action IS NOT TRUE;', (err, policy) => {
                conn.query("SELECT * FROM TB_TR_PDPA_PATTERN;", (err, pattern) => {
                    conn.query("SELECT * FROM TB_TR_PDPA_CLASSIFICATION;", (err, classify) => {
                        conn.query("SELECT * FROM TB_TR_ACCOUNT;", (err, account) => {
                            conn.query('SELECT * FROM TB_TR_PDPA_DATA;', (err, data) => {
                                res.render('./dataflow/home_dataflow', {
                                    policy,
                                    pattern,
                                    classify,
                                    account,
                                    data,
                                    session: req.session
                                })
                            })
                        })
                    })
                })
            })
        })
    }
}



module.exports = controller