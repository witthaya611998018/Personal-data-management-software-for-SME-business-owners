
const session = require("express-session");
const funchistory = require('../account_controllers')
require('dotenv').config()
const nodemailer = require('nodemailer');
const controller = {};
const Createdoc = require('../controller_policy/controller_policy_announce')

function sethost(req) {
    var hostset = req.headers;
    var protocol = "http";
    if (hostset.hasOwnProperty("x-forwarded-proto")) {
        protocol = "https";
    }

    var host = ""
    if (process.env.EMAIL_API == "dev") {
        host = protocol + "://" + req.headers.host
    } else {
        host = process.env.COOKIE_DOMAIN
    }
    return host;
}


// controller.AnnouncePolicyAdd = (req, res) => {
//     if (typeof req.session.userid != "undefined") {
//         const data = req.body;
//         // req.getConnection((err, conn) => {
//         //     conn.query("SELECT *FROM TB_TR_DOMAINGROUP WHERE id_dg =? LIMIT 1", [id],
//         //         (err, select_setting_tag) => {
//         //             res.render("cookie/view_cookie_managemet/script_banner", {
//         //                 select_setting_tag: select_setting_tag,
//         //                 session: req.session,
//         //             })
//         //         })
//         // });
//     } else {
//         res.redirect("/");
//     }
// };


// controller.PolicyPaperPages = (req, res) => {

//     if (typeof req.session.userid == "undefined") {
//         res.redirect("/");
//     } else {
//         const id = req.session.doc_id;
//         const user = req.session.userid;
//         var host = sethost(req);
//         console.log("id", id);
//         req.getConnection((err, conn) => {
//             conn.query("SELECT * FROM  TB_MM_QUESTIONNAIRE ;", (err, user_site) => {
//                 conn.query("SELECT * FROM  TB_TR_ACCOUNT WHERE acc_id = ? ;", [user], (err, user_image) => {
//                     conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? and dp.page_action = 0",
//                         [id], (err, pages) => {
//                             conn.query("SELECT * FROM TB_MM_PDPA_WORDS", (err, words) => {
//                                 conn.query("SELECT * FROM TB_TR_PDPA_DATA", (err, pdpa_data) => {
//                                     res.send({ pdpa_data, pages, words })

//                                     // if (doc_consent[0]) {
//                                     //     if (page[0]) {
//                                     //         conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE dp.page_id = ? ;",
//                                     //             [page[0].page_id], (err, page1) => {
//                                     //                 conn.query("SELECT * FROM TB_MM_PDPA_WORDS",
//                                     //                     (err, words) => {
//                                     //                         conn.query("SELECT * FROM TB_TR_PDPA_DATA",
//                                     //                             [req.session.userid], (err, pd) => {
//                                     //                                 let word = [];
//                                     //                                 let word1 = [];
//                                     //                                 for (i in words) {
//                                     //                                     word.push(words[i].words_id);
//                                     //                                     word1.push(
//                                     //                                         words[i].words_often
//                                     //                                     );
//                                     //                                 }
//                                     //                                 let code = [];
//                                     //                                 let code1 = [];
//                                     //                                 let code_name = [];
//                                     //                                 for (i in pd) {
//                                     //                                     code.push(pd[i].data_id);
//                                     //                                     code1.push(pd[i].data_code);
//                                     //                                     code_name.push(pd[i].data_name);
//                                     //                                 }
//                                     //                                 if (err) {
//                                     //                                     res.json(err);
//                                     //                                 } else {
//                                     //                                     res.render("./paper/paper", {
//                                     //                                         page_check,
//                                     //                                         doc_consent,
//                                     //                                         user_site,
//                                     //                                         user_image,
//                                     //                                         doc_number: id,
//                                     //                                         data: page,
//                                     //                                         data1: page1,
//                                     //                                         words: words,
//                                     //                                         words1: word,
//                                     //                                         words2: word1,
//                                     //                                         code: code,
//                                     //                                         code1: code1,
//                                     //                                         code_name: code_name,
//                                     //                                         history: history,
//                                     //                                         comment_policy,
//                                     //                                         pd: pd,
//                                     //                                         session: req.session,
//                                     //                                     });
//                                     //                                 }
//                                     //                             }
//                                     //                         );
//                                     //                     }
//                                     //                 );
//                                     //             }
//                                     //         );
//                                     //     } else {
//                                     //         conn.query("SELECT * FROM TB_MM_PDPA_WORDS",
//                                     //             (err, words) => {
//                                     //                 conn.query("SELECT * FROM TB_TR_PDPA_DATA", [req.session.userid],
//                                     //                     (err, pd) => {
//                                     //                         let word = [];
//                                     //                         let word1 = [];
//                                     //                         for (i in words) {
//                                     //                             word.push(words[i].words_id);
//                                     //                             word1.push(words[i].words_often);
//                                     //                         }
//                                     //                         let code = [];
//                                     //                         let code1 = [];
//                                     //                         let code_name = [];
//                                     //                         for (i in pd) {
//                                     //                             code.push(pd[i].data_id);
//                                     //                             code1.push(pd[i].data_code);
//                                     //                             code_name.push(pd[i].data_name);
//                                     //                         }
//                                     //                         if (err) {
//                                     //                             res.json(err);
//                                     //                         } else {
//                                     //                             res.render("./paper/paper", {
//                                     //                                 page_check,
//                                     //                                 doc_consent,
//                                     //                                 user_site,
//                                     //                                 user_image,
//                                     //                                 doc_number: id,
//                                     //                                 data: page,
//                                     //                                 data1: 0,
//                                     //                                 words: words,
//                                     //                                 words1: word,
//                                     //                                 words2: word1,
//                                     //                                 code: code,
//                                     //                                 code1: code1,
//                                     //                                 code_name: code_name,
//                                     //                                 history: history,
//                                     //                                 comment_policy,
//                                     //                                 pd: pd,
//                                     //                                 session: req.session,
//                                     //                             });
//                                     //                         }
//                                     //                     }
//                                     //                 );
//                                     //             }
//                                     //         );
//                                     //     }
//                                     // } else {
//                                     //     if (page[0]) {
//                                     //         conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE dp.page_id = ? ;",
//                                     //             [page[0].page_id], (err, page1) => {
//                                     //                 conn.query("SELECT * FROM TB_MM_PDPA_WORDS",
//                                     //                     (err, words) => {
//                                     //                         conn.query("SELECT * FROM TB_TR_PDPA_DATA ",
//                                     //                             [req.session.userid], (err, pd) => {
//                                     //                                 let word = [];
//                                     //                                 let word1 = [];
//                                     //                                 for (i in words) {
//                                     //                                     word.push(words[i].words_id);
//                                     //                                     word1.push(
//                                     //                                         words[i].words_often
//                                     //                                     );
//                                     //                                 }
//                                     //                                 let code = [];
//                                     //                                 let code1 = [];
//                                     //                                 let code_name = [];
//                                     //                                 for (i in pd) {
//                                     //                                     code.push(pd[i].data_id);
//                                     //                                     code1.push(pd[i].data_code);
//                                     //                                     code_name.push(pd[i].data_name);
//                                     //                                 }
//                                     //                                 if (err) {
//                                     //                                     res.json(err);
//                                     //                                 } else {
//                                     //                                     res.render("./paper/paper", {
//                                     //                                         page_check,
//                                     //                                         user_site,
//                                     //                                         user_image,
//                                     //                                         doc_consent: 0,
//                                     //                                         doc_number: id,
//                                     //                                         data: page,
//                                     //                                         data1: page1,
//                                     //                                         words: words,
//                                     //                                         words1: word,
//                                     //                                         words2: word1,
//                                     //                                         code: code,
//                                     //                                         code1: code1,
//                                     //                                         code_name: code_name,
//                                     //                                         history: history,
//                                     //                                         comment_policy,
//                                     //                                         pd: pd,
//                                     //                                         session: req.session,
//                                     //                                     });
//                                     //                                 }
//                                     //                             }
//                                     //                         );
//                                     //                     }
//                                     //                 );
//                                     //             }
//                                     //         );
//                                     //     } else {
//                                     //         conn.query("SELECT * FROM TB_MM_PDPA_WORDS",
//                                     //             (err, words) => {
//                                     //                 conn.query("SELECT * FROM TB_TR_PDPA_DATA ",
//                                     //                     [req.session.userid], (err, pd) => {
//                                     //                         let word = [];
//                                     //                         let word1 = [];
//                                     //                         for (i in words) {
//                                     //                             word.push(words[i].words_id);
//                                     //                             word1.push(words[i].words_often);
//                                     //                         }
//                                     //                         let code = [];
//                                     //                         let code1 = [];
//                                     //                         let code_name = [];
//                                     //                         for (i in pd) {
//                                     //                             code.push(pd[i].data_id);
//                                     //                             code1.push(pd[i].data_code);
//                                     //                             code_name.push(pd[i].data_name);
//                                     //                         }
//                                     //                         if (err) {
//                                     //                             res.json(err);
//                                     //                         } else {
//                                     //                             res.render("./paper/paper", {
//                                     //                                 page_check,
//                                     //                                 user_site,
//                                     //                                 user_image,
//                                     //                                 doc_consent: 0,
//                                     //                                 doc_number: id,
//                                     //                                 data: page,
//                                     //                                 data1: 0,
//                                     //                                 words: words,
//                                     //                                 words1: word,
//                                     //                                 words2: word1,
//                                     //                                 code: code,
//                                     //                                 code1: code1,
//                                     //                                 code_name: code_name,
//                                     //                                 history: history,
//                                     //                                 comment_policy,
//                                     //                                 pd: pd,
//                                     //                                 session: req.session,
//                                     //                             });
//                                     //                         }
//                                     //                     });
//                                     //             });
//                                     //     }
//                                     // }


//                                 });
//                             });
//                         });
//                 });
//             });
//         });
//     }
// };



controller.WarnPolicy = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.check_limit(req)
            var user = '';
            if (req.session.acc_id_control) {
                user = req.session.acc_id_control
            } else {
                user = req.session.userid
            }
            conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE  user_id = ? AND type_policy=0 and type != 3", [user], async (err, check_new_site) => {
                conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE;", (err, doc_type) => {
                    if (check_new_site.length == 0 || check_new_site.length == null) {
                        Createdoc.CreateDocument(req)
                    }
                    funchistory.funchistory(req, "ประกาศนโยบาย/เเจ้งเตือน", `เข้าสู่เมนู การแจ้งเตือนทางอิเล็คทรอนิค`, req.session.userid)
                    if (check_new_site.length < req.session.limit.policy || req.session.limit.policy === -1) {
                        req.session.limit.policy = 'ไม่เต็ม'
                    } else {
                        req.session.limit.policy = 'เต็ม'
                    }
                    res.render("policy/warn/warn_policy", {
                        doc_type,
                        session: req.session,
                    });
                });
            });
        });
    } else {
        res.redirect("/");
    }
};


controller.WarnPolicySearchType = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var host = sethost(req);
        req.getConnection((err, conn) => {
            if (req.body.id == 'all') {
                if (req.body.value == 'all') {
                    QuerySelect = `SELECT *,DATE_FORMAT(duc.doc_date_create, '%d/%m/%Y %H:%i:%s' ) as date_create FROM TB_TR_PDPA_DOCUMENT as duc LEFT JOIN TB_TR_ACCOUNT as acc ON duc.user_id=acc.acc_id  LEFT JOIN TB_MM_PDPA_DOCUMENT_TYPE as ductype ON duc.doc_type_id=ductype.doc_type_id WHERE type_policy=0 AND doc_action=0 AND duc.doc_type_id=216 ORDER BY  ductype.doc_type_id ASC;`
                } else {
                    QuerySelect = `SELECT *,DATE_FORMAT(duc.doc_date_create, '%d/%m/%Y %H:%i:%s' ) as date_create FROM TB_TR_PDPA_DOCUMENT as duc LEFT JOIN TB_TR_ACCOUNT as acc ON duc.user_id=acc.acc_id  LEFT JOIN TB_MM_PDPA_DOCUMENT_TYPE as ductype ON duc.doc_type_id=ductype.doc_type_id WHERE type_policy=0 AND doc_action=0 AND duc.doc_type_id=216 AND duc.doc_name LIKE '%${req.body.value}%' ORDER BY  ductype.doc_type_id ASC;`
                }
                conn.query(QuerySelect, (err, warn_policy) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE", (_, document_types) => {
                        if (warn_policy.length > 0) {
                            res.send({ warn_policy, document_types, host })
                        } else {
                            warn_policy = 'ไม่มีข้อมูล'
                            res.send({ warn_policy, document_types, host })
                        }
                    });
                });
            } else {
                if (req.body.value == 'all') {  // กรณีไม่ได้กรอกข้อมที่ต้องการต้องค้น (input)
                    QuerySelect = `SELECT *,DATE_FORMAT(duc.doc_date_create, '%d/%m/%Y %H:%i:%s' ) as date_create FROM TB_TR_PDPA_DOCUMENT as duc LEFT JOIN TB_TR_ACCOUNT as acc ON duc.user_id=acc.acc_id  LEFT JOIN TB_MM_PDPA_DOCUMENT_TYPE as ductype ON duc.doc_type_id=ductype.doc_type_id WHERE type_policy=0 AND doc_action=0 AND ductype.doc_type_id=${req.body.id} ORDER BY  ductype.doc_type_id ASC;`
                } else {
                    QuerySelect = `SELECT *,DATE_FORMAT(duc.doc_date_create, '%d/%m/%Y %H:%i:%s' ) as date_create FROM TB_TR_PDPA_DOCUMENT as duc LEFT JOIN TB_TR_ACCOUNT as acc ON duc.user_id=acc.acc_id  LEFT JOIN TB_MM_PDPA_DOCUMENT_TYPE as ductype ON duc.doc_type_id=ductype.doc_type_id WHERE type_policy=0 AND doc_action=0 AND ductype.doc_type_id=${req.body.id} AND duc.doc_name LIKE '%${req.body.value}%' ORDER BY  ductype.doc_type_id ASC;`
                }
                conn.query(QuerySelect, (err, warn_policy) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE", (_, document_types) => {
                        if (warn_policy.length > 0) {
                            res.send({ warn_policy, document_types, host })
                        } else {
                            warn_policy = 'ไม่มีข้อมูล'
                            res.send({ warn_policy, document_types, host })
                        }
                    });
                });
            }
        });
    } else {
        res.redirect("/");
    }
};

controller.WarnPolicySearchPolicyName = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var host = sethost(req);
        req.getConnection((err, conn) => {
            if (req.body.policy_name == 'all') {
                conn.query("SELECT *,DATE_FORMAT(duc.doc_date_create, '%d/%m/%Y %H:%i:%s' ) as date_create FROM TB_TR_PDPA_DOCUMENT as duc LEFT JOIN TB_TR_ACCOUNT as acc ON duc.user_id=acc.acc_id  LEFT JOIN TB_MM_PDPA_DOCUMENT_TYPE as ductype ON duc.doc_type_id=ductype.doc_type_id WHERE type_policy=0 AND doc_action=0 ORDER BY  ductype.doc_type_id ASC;", (err, warn_policy) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE", (_, document_types) => {
                        res.send({ warn_policy, document_types, host })
                    });
                });
            } else {
                conn.query("SELECT *,DATE_FORMAT(duc.doc_date_create, '%d/%m/%Y %H:%i:%s' ) as date_create FROM TB_TR_PDPA_DOCUMENT as duc LEFT JOIN TB_TR_ACCOUNT as acc ON duc.user_id=acc.acc_id  LEFT JOIN TB_MM_PDPA_DOCUMENT_TYPE as ductype ON duc.doc_type_id=ductype.doc_type_id WHERE type_policy=0 AND doc_action=0 AND ductype.doc_type_id=216 AND duc.doc_name=? ORDER BY  ductype.doc_type_id ASC;",
                    [req.body.policy_name], (err, warn_policy) => {
                        conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE", (_, document_types) => {
                            if (warn_policy.length > 0) {
                                res.send({ warn_policy, document_types, host })
                            } else {
                                warn_policy = 'ไม่มีข้อมูล'
                                res.send({ warn_policy, document_types, host })
                            }
                        });
                    });
            }
        });
    } else {
        res.redirect("/");
    }
};



controller.WarnPolicylist = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var host = sethost(req);
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(duc.doc_date_create, '%d/%m/%Y %H:%i:%s' ) as date_create FROM TB_TR_PDPA_DOCUMENT as duc LEFT JOIN TB_TR_ACCOUNT as acc ON duc.user_id=acc.acc_id  LEFT JOIN TB_MM_PDPA_DOCUMENT_TYPE as ductype ON duc.doc_type_id=ductype.doc_type_id WHERE type_policy=0 AND doc_action=0 AND duc.doc_type_id=216 AND duc.user_id=? ORDER BY  ductype.doc_type_id ASC;", [user], (err, warn_policy) => {
                conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE", (_, document_types) => {
                    if (warn_policy.length > 0) {
                        res.send({ 'limit': req.session.limit.policy, warn_policy, document_types, host })
                    } else {
                        warn_policy = 'ไม่มีข้อมูล'
                        res.send({ 'limit': req.session.limit.policy, warn_policy, document_types, host })
                    }
                });
            });
        });
    } else {
        res.redirect("/");
    }
};

controller.WarnPolicyAdd = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        // const user = req.session.userid;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        const data = req.body;
        if (data.doc_consent_status == undefined) {
            data.doc_consent_status = 0;
        }
        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT SET doc_name = ?, doc_type_id = ?, doc_remark = ?, doc_date_create = Now(), doc_consent_status = ?,user_id = ? ,type_policy=0,check_doc = 0 ;",
                [data.doc_name, data.doc_type_id, data.doc_remark, data.doc_consent_status, user], (err, InsertDocument) => {
                    conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT  ORDER BY doc_id DESC LIMIT 1;", (err, document) => {
                        conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_PAGE SET page_number = 1, doc_id = ?,page_action=0", [document[0].doc_id], (err, d2) => {
                            conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 0, log_detail = 'เพิ่มเอกสาร' ,user_id = ?;",
                                [document[0].doc_id, document[0].doc_date_create, user], (err, d3) => {
                                    conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 1, log_detail = 'ดูเอกสาร ?' ,user_id = ?;",
                                        [document[0].doc_id, document[0].doc_date_create, document[0].doc_name, user], (err, d4) => {
                                            conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 2, log_detail = 'เพิ่มหน้า 1' ,user_id = ?;",
                                                [document[0].doc_id, document[0].doc_date_create, user], (err, d5) => {
                                                    funchistory.funchistory(req, "ประกาศนโยบายทางอิเล็คทรอนิค", `เพิ่มข้อมูล ประกาศนโยบายทางอิเล็คทรอนิค ${data.doc_name} `, req.session.userid)
                                                    // CreateDocument(req, InsertDocument.insertId)
                                                    res.redirect("/warn-policy");
                                                });
                                        });
                                });
                        });
                    });
                });
        });
    }
};


controller.WarnPolicyDeleted = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data_id = req.body.doc_id;
        // const user = req.session.userid;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT a WHERE doc_id = ?", [data_id], (err, del) => {
                funchistory.funchistory(req, "ประกาศนโยบายทางอิเล็คทรอนิค", `ลบข้อมูล ประกาศนโยบายทางอิเล็คทรอนิค ${del[0].doc_name}`, req.session.userid)
                conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                        conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT as d LEFT JOIN TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE d.doc_id = ?", [data_id], (err, doc) => {
                            conn.query("UPDATE TB_TR_PDPA_DOCUMENT SET doc_action = 1 WHERE doc_id = ?", [data_id], (err, du) => {
                                conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                                    conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = now(), log_action = 5, log_detail = 'ลบเอกสาร',user_id = ?;", [doc[0].doc_id, user], (err, logdoc) => {
                                        res.redirect('/warn-policy');
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    }
}


controller.WarnPolicyUpdate = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        const data_id = req.body.doc_id;
        const data = req.body
        const status_doc = [{ status_id: '0', status_name: 'ร่าง' }, { status_id: '1', status_name: 'ต้นแบบ' }, { status_id: '2', status_name: 'ใช้งาน' }, { status_id: '3', status_name: 'ยกเลิก' }]
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE doc_id = ?", [data.doc_id], (err, doc_find) => {
                if (doc_find[0].doc_status != data.doc_status) {
                    for (var i = 0; i < status_doc.length; i++) {
                        if (data.doc_status == 0 && (doc_find[0].doc_status == status_doc[i].status_id)) {
                            conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 8, log_detail = ? ,user_id = ?", [data.doc_id, 'เปลี่ยนสถานะจาก ' + status_doc[i].status_name + ' เป็น ร่าง', user], (err, d1) => { })
                            break
                        }
                        if (data.doc_status == 1 && (doc_find[0].doc_status == status_doc[i].status_id)) {
                            conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 8, log_detail = ? ,user_id = ?", [data.doc_id, 'เปลี่ยนสถานะจาก ' + status_doc[i].status_name + ' เป็น ต้นแบบ', user], (err, d2) => { })
                            break
                        }
                        if (data.doc_status == 2 && (doc_find[0].doc_status == status_doc[i].status_id)) {
                            conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 8, log_detail = ? ,user_id = ?", [data.doc_id, 'เปลี่ยนสถานะจาก ' + status_doc[i].status_name + ' เป็น ใช้งาน', user], (err, d3) => { })
                            break
                        }
                        if (data.doc_status == 3 && (doc_find[0].doc_status == status_doc[i].status_id)) {
                            conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 8, log_detail = ? ,user_id = ?", [data.doc_id, 'เปลี่ยนสถานะจาก ' + status_doc[i].status_name + ' เป็น ยกเลิก', user], (err, d4) => { })
                            break
                        }

                    }
                }
                conn.query("UPDATE TB_TR_PDPA_DOCUMENT SET doc_name=?,doc_type_id=?,doc_status=?,doc_remark=? WHERE doc_id = ?",
                    [data.doc_name, data.doc_type_id, data.doc_status, data.doc_remark, data_id], (err, dt) => {
                        funchistory.funchistory(req, "ประกาศนโยบายทางอิเล็คทรอนิค", `แก้ไขข้อมูล ประกาศนโยบายทางอิเล็คทรอนิค ${req.body.doc_name}`, req.session.userid)
                        res.redirect('/warn-policy');
                    });
            })
        });
    }
}

controller.WarnPolicySendMail = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query('SELECT doc_id,doc_type_id,doc_name,DATE_FORMAT(doc_date_create, "%Y-%m-%d %H:%i:%s" ) as doc_date_create,user_id,doc_status,doc_remark,doc_action,doc_consent_status,check_doc FROM TB_TR_PDPA_DOCUMENT WHERE doc_action = 0 and user_id = ?;',
                [user], (err, doc) => {
                    funchistory.funchistory(req, "policy_doc", `แชร์เอกสาร Policy Doc ${doc.doc_name} `, req.session.userid)
                    var query1 = "INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET user_id = " + user + "' ,doc_id = " + req.body.link_doc_id + ", log_date =NOW(), log_action = 7, log_detail = 'แชร์เอกสารไปที่ Email : " + req.body.email_outside + "'";
                    var query2 = "INSERT INTO TB_TR_PDPA_DOCUMENT_COMMENT SET doc_id = '" + req.body.doc_id + "' ,comment_email = '" + req.body.email_outside + "' ,comment_subject = '" + req.body.subject + "', comment_date_sent = NOW()";
                    var check_doc_num = "UPDATE TB_TR_PDPA_DOCUMENT SET check_doc = ? WHERE doc_id = ? ;";

                    conn.query(query1, (err, d1) => {
                        conn.query(query2, (err, d2) => {
                            conn.query(check_doc_num, [doc[0].check_doc + 1, req.body.doc_id], (err, check_doc_num) => { });
                            conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT  ORDER BY comment_id DESC LIMIT 1;",
                                async (err, d3) => {
                                    if (err) {
                                        res.json(err);
                                    } else {
                                        if (process.env.EMAIL_API == "dev") {
                                            var mail = nodemailer.createTransport({
                                                service: 'gmail',
                                                auth: {
                                                    user: 'smartpdpa@gmail.com',
                                                    pass: 'laenkjbuhbzxkikc'
                                                },
                                            })

                                            var mailOptions = {
                                                from: "SMART-PDPA <smartpdpa@gmail.com>",
                                                to: req.body.email_outside,
                                                subject: req.body.subject,
                                                text: "Hello. This email is for your email policy.",
                                                html: req.body.page_content,
                                            };

                                            mail.sendMail(mailOptions, function (error, info) {
                                                if (error) {
                                                    console.log(error);
                                                } else {
                                                    console.log("Email sent: " + info.response);
                                                }
                                            });
                                            res.send(JSON.stringify("success"))
                                        } else {
                                            var data = {
                                                "from": "pipr@dol.go.th",
                                                "to": `${req.body.email_outside}`,
                                                "subject": `${req.body.subject}`,
                                                "body": `${req.body.page_content}`
                                            }
                                            let res = await axios.post(`${process.env.EMAIL_API}`, data).then((response) => {
                                                console.log(response);
                                            }, (error) => {
                                                console.log(error);
                                            });
                                            res.send(JSON.stringify("success"))
                                        }
                                    }
                                });
                        });
                    });
                });
        });
    }
};


controller.WarnPolicyCopy = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE doc_id = ?", [data.doc_id], (err, find_doc) => {
                conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT SET doc_name = ?, doc_type_id = ?, doc_remark = ?, doc_date_create =NOW(), type = 1 ,type_policy=0", [find_doc[0].doc_name + '(คัดลอก)', find_doc[0].doc_type_id, find_doc[0].doc_remark], (err, d1) => {
                    conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT  ORDER BY doc_id DESC LIMIT 1;", (err, document) => {
                        conn.query("UPDATE TB_TR_PDPA_DOCUMENT SET user_id = ? WHERE doc_id = ?", [user, document[0].doc_id], (err, du) => {
                            conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? and dp.page_action = 0', [data.doc_id], (err, page_doc_find) => {
                                for (var j = 0; j < page_doc_find.length; j++) {
                                    conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_PAGE SET doc_id= ?, page_number = ?, page_content = ?,page_action=0 ;", [document[0].doc_id, j + 1, page_doc_find[j].page_content], (err, d2) => { })
                                }
                                conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 9, log_detail = ? ,user_id = ?", [document[0].doc_id, document[0].doc_date_create, 'คัดลอกเอกสารจาก ' + find_doc[0].doc_name + ' เป็น ' + document[0].doc_name, user], (err, d3) => {
                                    funchistory.funchistory(req, "การแจ้งเตือนทางอิเล็คทรอนิค", `คัดลอกเอกสาร การแจ้งเตือนทางอิเล็คทรอนิค ${find_doc[0].doc_name} `, req.session.userid)
                                    res.redirect('/paper/' + document[0].doc_id);
                                })
                            })
                        })
                    })
                })
            })
        })
    }
}



// function CreateDocument(req, id) {
//     req.getConnection((err, conn) => {
//         conn.query("SELECT * FROM  TB_TR_PDPA_DOCTEMP", (err, main_doc) => {
//             for (i in main_doc) {
//                 conn.query("SELECT * FROM TB_TR_PDPA_DOCTEMP_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCTEMP AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? ",
//                     [main_doc[i].doc_id], (err, main_doc_page) => {
//                         conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT SET doc_type_id = ?,doc_name = ?,doc_date_create = NOW(),user_id =?,doc_status =1,doc_remark=?,doc_action=?,doc_consent_status=?,type_policy=0,check_doc=?,type=0",
//                             [main_doc_page[0].doc_type_id, main_doc_page[0].doc_name, req.session.userid, main_doc[i].doc_remark, main_doc[i].doc_action, main_doc[i].doc_consent_status, main_doc[i].check_doc,],
//                             (err, add_main_doc) => {
//                                 conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = NOW(), log_action = 8, log_detail = ? ,user_id = ? ",
//                                     [add_main_doc.insertId, "สร้างเอกสารต้นแบบ เป็น ใช้งาน", req.session.userid,], (err, doc_default) => {
//                                         for (j in main_doc_page) {
//                                             conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_PAGE SET doc_id = ?,page_number = ?,page_content = ?,page_action =?",
//                                                 [add_main_doc.insertId, main_doc_page[j].page_number, main_doc_page[j].page_content, main_doc_page[j].page_action,], (err, add_main_doc_page) => { }
//                                             );
//                                         }
//                                     });
//                             });
//                     });
//             }
//         });
//     });
// }

module.exports = controller;