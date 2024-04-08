var nodemailer = require("nodemailer");
const controller = {};
const funchistory = require('./account_controllers')
const addDate = require("../utils/addDate")
require('dotenv').config()

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


// function check_user_login(req) {
//     let user = ''
//     if (req.session.acc_id_control) {
//         user = req.session.acc_id_control
//     } else {
//         user = req.session.userid;
//     }
//     return user
// }

controller.doc_list = (req, res) => {

    // funchistory.funchistory(req, "policy_doc", `เข้าสู่เมนู Policy Doc`, req.session.userid)

    var host = sethost(req);
    var html = `
  <body>
  <div class="mt-4 " style="background:  #ffffff;margin-left:15%;margin-right:15%;width: 70%;margin-top:3%;border-radius: 15px;">
  <h2 style="color: orange;">
  PDPA 3in1</h2>
  <p style="border-bottom: 3px solid;color: orange;"></p>
  <h4 style="margin-left:2%;line-height: 2;">
  ✉ เอกสารนโยบาย : #descrips 
  </h4>
  <h4 style="margin-left:2%;line-height: 2;">
  <a href="#host" style="text-align: left;color: orange;" target="_blank"> Link เอกสาร 
  </a>
  </h4>
  <hr>
  <h5 style="text-align: left;">
  เอกสารแชร์ตาม Link ข้างต้น แสดงข้อมูลเอกสารเพื่อให้ท่านตรวจสอบความถูกต้องของข้อมูล
  โดยระบบ PAPD 3in1
  </h5>
  
  </div>
  </body>`;


    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const search_doc_type = "";
        req.getConnection((err, conn) => {
            funchistory.check_limit(req)
            conn.query("SELECT * FROM TB_TR_ACCOUNT where acc_id = ?;", [user], (err, my_user) => {
                conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                    conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE  user_id = ? AND (type_policy=0 OR type_policy=null)", [user], (err, check_new_site) => {
                        if (check_new_site.length < 0 || check_new_site.length == 0) {
                            conn.query("SELECT * FROM  TB_TR_PDPA_DOCTEMP", (err, main_doc) => {
                                for (i in main_doc) {
                                    conn.query("SELECT * FROM TB_TR_PDPA_DOCTEMP_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCTEMP AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? ",
                                        [main_doc[i].doc_id], (err, main_doc_page) => {
                                            conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT SET doc_type_id = ?,doc_name = ?,doc_date_create = ?,user_id =?,doc_status =?,doc_remark=?,doc_action=?,doc_consent_status=?,type=?,check_doc=?,type_policy=0",
                                                [main_doc_page[0].doc_type_id, main_doc_page[0].doc_name, date[0].new, req.session.userid, 1, main_doc[i].doc_remark, main_doc[i].doc_action, main_doc[i].doc_consent_status, 0, main_doc[i].check_doc,],
                                                (err, add_main_doc) => {
                                                    conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 8, log_detail = ? ,user_id = ? ",
                                                        [add_main_doc.insertId, date[0].new, "สร้างเอกสารต้นแบบ เป็น ใช้งาน", req.session.userid,], (err, doc_default) => {
                                                            for (j in main_doc_page) {
                                                                conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_PAGE SET doc_id = ?,page_number = ?,page_content = ?,page_action =?",
                                                                    [add_main_doc.insertId, main_doc_page[j].page_number, main_doc_page[j].page_content, main_doc_page[j].page_action,], (err, add_main_doc_page) => { }
                                                                );
                                                            }
                                                        });
                                                });
                                        });
                                }
                            });
                        }
                        conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC',
                            [user], (err, history) => {
                                conn.query('select DATE_FORMAT(dl.log_date, "%d/%m/%Y %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? and dl.log_detail like "%เป็น ใช้งาน%" order by dl.log_date DESC',
                                    [user], (err, status_date_use) => {
                                        conn.query('select DATE_FORMAT(dl.log_date, "%d/%m/%Y %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? and dl.log_detail like "%เป็น ยกเลิก%" order by dl.log_date DESC',
                                            [user], (err, status_date_cancle) => {
                                                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;", (err, comment_policy) => {
                                                    conn.query('SELECT doc_type_name,d.doc_id,d.doc_type_id,doc_name,DATE_FORMAT(doc_date_create, "%d/%m/%Y %H:%i:%s" ) as doc_date_create,user_id,doc_status,doc_remark,doc_action,doc_consent_status,check_doc,type  FROM TB_TR_PDPA_DOCUMENT as d LEFT JOIN TB_MM_PDPA_DOCUMENT_TYPE as t ON d.doc_type_id=t.doc_type_id WHERE d.doc_action = 0 and d.user_id = ?  and type != 3 and (type_policy !=1 and type_policy !=2)  order by d.doc_type_id',
                                                        [user,], (err, doc) => {
                                                            conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE;", (err, doc_type) => {
                                                                conn.query("SELECT * FROM TB_MM_PDPA_WORDS WHERE user_id=?", [req.session.userid,], (err, words) => {
                                                                    conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE as pdt join TB_TR_PDPA_DOCUMENT as pd on pd.doc_type_id = pdt.doc_type_id WHERE pd.doc_action = 0 and user_id = ?  group by pd.doc_type_id;",
                                                                        [user], (err, have_doc) => {
                                                                            let word = [];
                                                                            let word1 = [];
                                                                            for (i in words) {
                                                                                word.push(words[i].words_id);
                                                                                word1.push(words[i].words_often);
                                                                            }
                                                                            if (err) { res.json(err); }
                                                                            let doc_i = [];
                                                                            let doc_t = [];
                                                                            let doc_n = [];
                                                                            let doc_r = [];
                                                                            let doc_status = [];
                                                                            let doc_consent_status = [];

                                                                            for (i in doc) {
                                                                                doc_i.push(doc[i].doc_id);
                                                                                doc_t.push(doc[i].doc_type_id);
                                                                                doc_n.push(doc[i].doc_name);
                                                                                doc_r.push(doc[i].doc_remark);
                                                                                doc_status.push(doc[i].doc_status);
                                                                                doc_consent_status.push(doc[i].doc_consent_status);
                                                                            }

                                                                            let doc_type_id1 = [];
                                                                            let doc_type_name1 = [];
                                                                            for (i in doc_type) {
                                                                                doc_type_id1.push(
                                                                                    doc_type[i].doc_type_id);
                                                                                doc_type_name1.push(
                                                                                    doc_type[i].doc_type_name);
                                                                            }
                                                                            let have_doc1 = [];
                                                                            for (i in have_doc) {
                                                                                have_doc1.push({ have_doc_id: have_doc[i].doc_type_id, have_doc_name: have_doc[i].doc_type_name, });
                                                                            }

                                                                            let have_doc_type_name = [];
                                                                            for (i in have_doc1) {
                                                                                for (j in doc_type) {
                                                                                    if (have_doc1[i] == doc_type[j].doc_type_id) {
                                                                                        have_doc_type_name.push(doc_type[j].doc_type_name);
                                                                                    }
                                                                                }
                                                                            }

                                                                            res.render(
                                                                                "./main_doc/index",
                                                                                {
                                                                                    html,
                                                                                    host,
                                                                                    my_user,
                                                                                    status_date_use,
                                                                                    status_date_cancle,
                                                                                    search_doc_type,
                                                                                    doc: doc,
                                                                                    doc_i: doc_i,
                                                                                    doc_n: doc_n,
                                                                                    doc_r: doc_r,
                                                                                    doc_t: doc_t,
                                                                                    doc_status,
                                                                                    doc_consent_status,
                                                                                    doc_type: doc_type,
                                                                                    doc_type_id1: doc_type_id1,
                                                                                    doc_type_name1: doc_type_name1,
                                                                                    have_doc1: have_doc1,
                                                                                    have_doc_type_name: have_doc_type_name,
                                                                                    data3: date,
                                                                                    comment_policy,
                                                                                    history: history,
                                                                                    words: words,
                                                                                    words1: word,
                                                                                    words2: word1,
                                                                                    session: req.session,
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
            });
        });
    }
};

controller.doc_list_find = (req, res) => {
    var html = `
    <body>
    <div class="mt-4 " style="background:  #ffffff;margin-left:15%;margin-right:15%;width: 70%;margin-top:3%;border: 4px solid green;padding: 20px;border-radius: 15px;">
    <h2 style="color: orange;">
    Alltra PDPA</h2>
    <p style="border-bottom: 3px solid;color: orange;"></p>
    <h4 style="margin-left:2%;line-height: 2;">
    ✉ เนื้อหา : #descrips 
    </h4>
    <h4 style="margin-left:2%;line-height: 2;">
    <a href="#host" style="text-align: left;color: orange;" target="_blank">▶▶▶ Link เอกสาร ◀◀◀
    </a>
    </h4>
    <hr>
    <h5 style="text-align: left;">
    เอกสารแชร์ตาม Link ข้างต้น แสดงข้อมูลเอกสารเพื่อให้ท่านตรวจสอบความถูกต้องของข้อมูล
    โดยระบบ Alltra PDPA
    </h5>
    <h5 style="text-align: left;">
    หมายเหตุ ใน version นี้ท่านไม่สามารถใส่ Comment ได้หากท่านต้องการ Upgrade 
    เป็นรุ่นที่สามารถติดต่อ
    Sense Info Tech
    </h5>
    <h5 style="text-align: left;">
    Tel <span style="color: blue;">02-582-8273</span>
    </h5>
    <hr>
    <a href="https://www.smartpdpa.com" style="text-align: left;" target="_blank">© Your Site Name
    </a>
    ,&nbsp;&nbsp;
    <a href="http://sales@sense-infotech.com" style="text-align: left;" target="_blank">Sense Info Tech.
    </a>
    </div>
    </body>`;
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        var user = req.session.userid;
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }

        var host = sethost(req);
        const search_doc_type = req.body.search_doc_type;
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_ACCOUNT where acc_id = ?;", [user], (err, my_user) => {
                conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ?  order by dl.log_date DESC',
                    [user], (err, history) => {
                        conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ?  and dl.log_detail like "%เป็น ใช้งาน%" order by dl.log_date DESC',
                            [user], (err, status_date_use) => {
                                conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ?  and dl.log_detail like "%เป็น ยกเลิก%" order by dl.log_date DESC',
                                    [user], (err, status_date_cancle) => {
                                        conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;", (err, comment_policy) => {
                                            conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                                                conn.query('SELECT doc_type_name,d.doc_id,d.doc_type_id,doc_name,DATE_FORMAT(doc_date_create, "%Y-%m-%d %H:%i:%s" ) as doc_date_create,user_id,doc_status,doc_remark,doc_action,doc_consent_status,check_doc,type  FROM TB_TR_PDPA_DOCUMENT as d LEFT JOIN TB_MM_PDPA_DOCUMENT_TYPE as t ON d.doc_type_id=t.doc_type_id WHERE d.doc_action = 0 and d.user_id = ? and d.doc_type_id=? and type != 3 and type_policy =0',
                                                    [user, search_doc_type,], (err, doc) => {
                                                        conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE;", (err, doc_type) => {
                                                            conn.query("SELECT * FROM TB_MM_PDPA_WORDS WHERE user_id = ?", [req.session.userid,], (err, words) => {
                                                                conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE as pdt join TB_TR_PDPA_DOCUMENT as pd on pd.doc_type_id = pdt.doc_type_id WHERE pd.doc_action = 0 and user_id = ? and pd.doc_type_id = ? group by pd.doc_type_id;",
                                                                    [user, search_doc_type,], (err, have_doc) => {
                                                                        let word = [];
                                                                        let word1 = [];
                                                                        for (i in words) {
                                                                            word.push(words[i].words_id);
                                                                            word1.push(words[i].words_often);
                                                                        }
                                                                        if (err) { res.json(err); }
                                                                        let doc_i = [];
                                                                        let doc_t = [];
                                                                        let doc_n = [];
                                                                        let doc_r = [];
                                                                        let doc_status = [];
                                                                        let doc_consent_status = [];

                                                                        for (i in doc) {
                                                                            doc_i.push(doc[i].doc_id); doc_t.push(doc[i].doc_type_id);
                                                                            doc_n.push(doc[i].doc_name); doc_r.push(doc[i].doc_remark);
                                                                            doc_status.push(doc[i].doc_status);
                                                                            doc_consent_status.push(doc[i].doc_consent_status);
                                                                        }

                                                                        let doc_type_id1 = [];
                                                                        let doc_type_name1 = [];
                                                                        for (i in doc_type) {
                                                                            doc_type_id1.push(doc_type[i].doc_type_id);
                                                                            doc_type_name1.push(doc_type[i].doc_type_name);
                                                                        }
                                                                        let have_doc1 = [];
                                                                        for (i in have_doc) {
                                                                            have_doc1.push({
                                                                                have_doc_id: have_doc[i].doc_type_id,
                                                                                have_doc_name: have_doc[i].doc_type_name,
                                                                            });
                                                                        }

                                                                        let have_doc_type_name = [];
                                                                        for (i in have_doc1) {
                                                                            for (j in doc_type) {
                                                                                if (have_doc1[i] == doc_type[j].doc_type_id) {
                                                                                    have_doc_type_name.push(doc_type[j].doc_type_name);
                                                                                }
                                                                            }
                                                                        }

                                                                        res.render(
                                                                            "./main_doc/index",
                                                                            {
                                                                                html,
                                                                                host,
                                                                                my_user,
                                                                                status_date_use,
                                                                                status_date_cancle,
                                                                                doc: doc,
                                                                                search_doc_type,
                                                                                doc_i: doc_i,
                                                                                doc_n: doc_n,
                                                                                doc_r: doc_r,
                                                                                doc_t: doc_t,
                                                                                doc_status,
                                                                                doc_consent_status,
                                                                                doc_type: doc_type,
                                                                                doc_type_id1: doc_type_id1,
                                                                                doc_type_name1: doc_type_name1,
                                                                                have_doc1: have_doc1,
                                                                                have_doc_type_name: have_doc_type_name,
                                                                                data3: date,
                                                                                comment_policy,
                                                                                history: history,
                                                                                words: words,
                                                                                words1: word,
                                                                                words2: word1,
                                                                                session: req.session,
                                                                            }
                                                                        );
                                                                    }
                                                                );
                                                            }
                                                            );
                                                        }
                                                        );
                                                    }
                                                );
                                            }
                                            );
                                        }
                                        );
                                    }
                                );
                            }

                        );
                    }
                );
            }
            );
        }
        );
    }
};

controller.paper_consent_show = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        funchistory.funchistory(req, "paper_consent", `เข้าสู่เมนู Paper Consent`, req.session.userid)
        funchistory.check_limit(req)
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const search_doc_type = "";
        var host = sethost(req);
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_ACCOUNT where acc_id = ?;", [user], (err, my_user) => {
                conn.query("SELECT * FROM TB_TR_ACCOUNT as a join TB_TR_PDPA_DOCUMENT as d on a.acc_id = d.user_id where a.acc_id = ? ;",
                    [user], (err, user_site) => {
                        conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ?  order by dl.log_date DESC',
                                [user], (err, history) => {
                                    conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ?  and dl.log_detail like "%สร้างเอกสาร Paper Consent%" order by dl.log_date DESC',
                                        [user], (err, status_date_use) => {
                                            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ?  and dl.log_detail like "%เป็น ยกเลิก%" order by dl.log_date DESC',
                                                [user], (err, status_date_cancle) => {
                                                    conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;", (err, comment_policy) => {
                                                        conn.query('SELECT doc_id,doc_type_id,doc_name,DATE_FORMAT(doc_date_create, "%Y-%m-%d %H:%i:%s" ) as doc_date_create,user_id,doc_status,doc_remark,doc_action,doc_consent_status,check_doc,type FROM TB_TR_PDPA_DOCUMENT WHERE doc_action = 0 and doc_status = 2 and user_id = ?',
                                                            [user], (err, doc_select) => {
                                                                conn.query('SELECT doc_id,doc_type_id,doc_name,DATE_FORMAT(doc_date_create, "%Y-%m-%d %H:%i:%s" ) as doc_date_create,user_id,doc_status,doc_remark,doc_action,doc_consent_status,check_doc,type FROM TB_TR_PDPA_DOCUMENT WHERE doc_action = 0 and user_id = ? and type = 3',
                                                                    [user], (err, doc) => {
                                                                        conn.query('SELECT doc_id,doc_type_id,doc_name,DATE_FORMAT(doc_date_create, "%Y-%m-%d %H:%i:%s" ) as doc_date_create,user_id,doc_status,doc_remark,doc_action,doc_consent_status,check_doc,type FROM TB_TR_PDPA_DOCUMENT WHERE doc_action = 0 and user_id = ?  and type = 3',
                                                                            [user], (err, doc123) => {
                                                                                conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE;", (err, doc_type) => {
                                                                                    var countconsent = [];
                                                                                    var countconsentun = [];
                                                                                    for (i in doc) {
                                                                                        conn.query("SELECT doc_con.*,d.doc_id,COUNT(*) as numm FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA as doc_con join TB_TR_PDPA_DOCUMENT as d on d.doc_id=doc_con.doc_id where d.doc_id=? and doc_con.doc_consent_status=1;",
                                                                                            [doc[i].doc_id,], (err, doccount) => {
                                                                                                countconsent.push(doccount[0]);
                                                                                            });
                                                                                        conn.query("SELECT doc_con.*,d.doc_id,COUNT(*) as numm FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA as doc_con join TB_TR_PDPA_DOCUMENT as d on d.doc_id=doc_con.doc_id where d.doc_id=? and doc_con.doc_consent_status=0;",
                                                                                            [doc[i].doc_id,], (err, doccountun) => {
                                                                                                countconsentun.push(doccountun[0]);
                                                                                            });
                                                                                    }
                                                                                    conn.query("SELECT * FROM TB_MM_PDPA_WORDS WHERE user_id=?",
                                                                                        [req.session.userid,], (err, words) => {
                                                                                            conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE as pdt join TB_TR_PDPA_DOCUMENT as pd on pd.doc_type_id = pdt.doc_type_id WHERE pd.doc_action = 0 and user_id = ?  group by pd.doc_type_id;",
                                                                                                [user,], (err, have_doc) => {
                                                                                                    let word = [];
                                                                                                    let word1 = [];
                                                                                                    for (i in words) {
                                                                                                        word.push(words[i].words_id);
                                                                                                        word1.push(words[i].words_often);
                                                                                                    }
                                                                                                    if (err) { res.json(err); }
                                                                                                    let doc_i = [];
                                                                                                    let doc_t = [];
                                                                                                    let doc_n = [];
                                                                                                    let doc_r = [];
                                                                                                    let doc_status = [];
                                                                                                    let doc_consent_status = [];

                                                                                                    for (i in doc) {
                                                                                                        doc_i.push(doc[i].doc_id);
                                                                                                        doc_t.push(doc[i].doc_type_id);
                                                                                                        doc_n.push(doc[i].doc_name);
                                                                                                        doc_r.push(doc[i].doc_remark);
                                                                                                        doc_status.push(doc[i].doc_status);
                                                                                                        doc_consent_status.push(doc[i].doc_consent_status);
                                                                                                    }

                                                                                                    let doc_type_id1 = [];
                                                                                                    let doc_type_name1 = [];
                                                                                                    for (i in doc_type) {
                                                                                                        doc_type_id1.push(doc_type[i].doc_type_id);
                                                                                                        doc_type_name1.push(doc_type[i].doc_type_name);
                                                                                                    }
                                                                                                    let have_doc1 = [];
                                                                                                    for (i in have_doc) {
                                                                                                        have_doc1.push({
                                                                                                            have_doc_id: have_doc[i].doc_type_id,
                                                                                                            have_doc_name: have_doc[i].doc_type_name,
                                                                                                        });
                                                                                                    }

                                                                                                    let have_doc_type_name = [];
                                                                                                    for (i in have_doc1) {
                                                                                                        for (j in doc_type) {
                                                                                                            if (have_doc1[i] == doc_type[j].doc_type_id) {
                                                                                                                have_doc_type_name.push(doc_type[j].doc_type_name);
                                                                                                            }
                                                                                                        }
                                                                                                    }

                                                                                                    res.render("./main_doc/paper_consent_show", {
                                                                                                        host,
                                                                                                        countconsent,
                                                                                                        countconsentun,
                                                                                                        my_user,
                                                                                                        status_date_use,
                                                                                                        status_date_cancle,
                                                                                                        user_site,
                                                                                                        search_doc_type,
                                                                                                        doc: doc,
                                                                                                        doc_select,
                                                                                                        doc_i: doc_i,
                                                                                                        doc_n: doc_n,
                                                                                                        doc_r: doc_r,
                                                                                                        doc_t: doc_t,
                                                                                                        doc_status,
                                                                                                        doc_consent_status,
                                                                                                        doc_type: doc_type,
                                                                                                        doc_type_id1: doc_type_id1,
                                                                                                        doc_type_name1: doc_type_name1,
                                                                                                        have_doc1: have_doc1,
                                                                                                        have_doc_type_name: have_doc_type_name,
                                                                                                        data3: date, comment_policy,
                                                                                                        history: history, words: words,
                                                                                                        words1: word,
                                                                                                        words2: word1,
                                                                                                        session: req.session,
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
                        });
                    });
            });
        });
    }
};

controller.paper_consent_add = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        var data = req.body;
        if (data.consent_firstname_status == undefined) {
            data.consent_firstname_status = 0;
        }
        if (data.consent_lastname_status == undefined) {
            data.consent_lastname_status = 0;
        }
        if (data.consent_phone_status == undefined) {
            data.consent_phone_status = 0;
        }
        if (data.consent_address_status == undefined) {
            data.consent_address_status = 0;
        }
        if (data.consent_other_status == undefined) {
            data.consent_other_status = 0;
            data.consent_other_name = "";
        }

        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        if (data.doc_id == "blank_paper") {
            req.getConnection((err, conn) => {
                conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                    conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT SET doc_name = ?, doc_type_id = ?, doc_remark = ?, doc_date_create = ?,doc_status = 2 ,user_id = ?,type = 3,button_consent_position = ?",
                        [data.doc_name, 153, "", date[0].new, user, data.button_consent_position,], (err, d1) => {
                            conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT  ORDER BY doc_id DESC LIMIT 1;", (err, document) => {
                                conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_CONSENT SET doc_id = ?, consent_firstname_status = ?,consent_lastname_status = ?,consent_phone_status = ?,consent_address_status = ?,consent_other_status = ?,consent_other_name = ?",
                                    [document[0].doc_id, data.consent_firstname_status, data.consent_lastname_status, data.consent_phone_status, data.consent_address_status, data.consent_other_status, data.consent_other_name,], (err, du7) => {
                                        conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_PAGE SET doc_id = ?, page_number = 1, page_content = '',page_action=0",
                                            [document[0].doc_id], (err, d2) => {
                                                conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 8, log_detail = ? ,user_id = ? ",
                                                    [document[0].doc_id, date[0].new, "สร้างเอกสาร Paper Consent", req.session.userid,], (err, d3) => {
                                                        funchistory.funchistory(req, "paper_consent", `เพิ่มข้อมูล Paper Consent ${data.doc_name} `, req.session.userid)
                                                        res.redirect("/paper_consent/" + document[0].doc_id);
                                                    });
                                            });
                                    });
                            });
                        });
                });
            });
        } else {
            req.getConnection((err, conn) => {
                conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                    conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE doc_id = ?", [data.doc_id], (err, find_doc) => {
                        conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT SET button_consent_position = ?,doc_name = ?, doc_type_id = ?, doc_remark = ?, doc_date_create = ?,doc_status = 2",
                            [data.button_consent_position, data.doc_name, find_doc[0].doc_type_id, find_doc[0].doc_remark, date[0].new,], (err, d1) => {
                                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT  ORDER BY doc_id DESC LIMIT 1;", (err, document) => {
                                    conn.query("UPDATE TB_TR_PDPA_DOCUMENT SET user_id = ?, type = 3 WHERE doc_id = ?", [user, document[0].doc_id,], (err, du) => {
                                        conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_CONSENT SET doc_id = ?, consent_firstname_status = ?,consent_lastname_status = ?,consent_phone_status = ?,consent_address_status = ?,consent_other_status = ?,consent_other_name = ?",
                                            [document[0].doc_id, data.consent_firstname_status, data.consent_lastname_status, data.consent_phone_status, data.consent_address_status, data.consent_other_status, data.consent_other_name,],
                                            (err, du7) => {
                                                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? and dp.page_action = 0", [data.doc_id], (err, page_doc_find) => {
                                                    for (var j = 0; j < page_doc_find.length; j++) {
                                                        conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_PAGE SET doc_id= ?, page_number = ?, page_content = ?,page_action=0",
                                                            [document[0].doc_id, j + 1, page_doc_find[j].page_content,], (err, d2) => { });
                                                    }
                                                    conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 8, log_detail = ? ,user_id = ? ",
                                                        [document[0].doc_id, date[0].new, "สร้างเอกสาร Paper Consent เป็น ใช้งาน", req.session.userid,], (err, d3) => {
                                                            conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 9, log_detail = ? ,user_id = ?",
                                                                [document[0].doc_id, document[0].doc_date_create, "คัดลอกเอกสารจาก " + find_doc[0].doc_name + " เป็น " + document[0].doc_name, req.session.userid,], (err, d3) => {
                                                                    res.redirect("/paper_consent/" + document[0].doc_id);
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
        }
    }
};

controller.sent_mail = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                conn.query('SELECT doc_id,doc_type_id,doc_name,DATE_FORMAT(doc_date_create, "%Y-%m-%d %H:%i:%s" ) as doc_date_create,user_id,doc_status,doc_remark,doc_action,doc_consent_status,check_doc FROM TB_TR_PDPA_DOCUMENT WHERE doc_action = 0 and user_id = ?;',
                    [user], (err, doc) => {
                        funchistory.funchistory(req, "policy_doc", `แชร์เอกสาร Policy Doc ${doc.doc_name} `, req.session.userid)
                        var query1 = "INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET user_id = " + user + "' ,doc_id = " + req.body.link_doc_id + ", log_date = '" + date[0].new + "', log_action = 7, log_detail = 'แชร์เอกสารไปที่ Email : " + req.body.email_outside + "'";
                        var query2 = "INSERT INTO TB_TR_PDPA_DOCUMENT_COMMENT SET doc_id = '" + req.body.doc_id + "' ,comment_email = '" + req.body.email_outside + "' ,comment_subject = '" + req.body.subject + "', comment_date_sent = '" + date[0].new + "'";
                        var check_doc_num = "UPDATE TB_TR_PDPA_DOCUMENT SET check_doc = ? WHERE doc_id = ? ;";

                        conn.query(query1, (err, d1) => {
                            conn.query(query2, (err, d2) => {
                                conn.query(check_doc_num, [doc[0].check_doc + 1, req.body.doc_id], (err, check_doc_num) => { });
                                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT  ORDER BY comment_id DESC LIMIT 1;", async (err, d3) => {
                                    if (err) {
                                        res.json(err);
                                    } else {
                                        if (process.env.EMAIL_API == "dev") {
                                            var mail = nodemailer.createTransport({
                                                service: "gmail",
                                                auth: {
                                                    user: "smartpdpa@gmail.com",
                                                    pass: "laenkjbuhbzxkikc",
                                                },
                                                from: "smartpdpa@gmail.com",
                                            });

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
                                        }
                                    }
                                }
                                );
                            });
                        });
                    }
                );
            }
            );
        });

        res.redirect("back");
    }
};

controller.paper_consent_thank = (req, res) => {
    res.render("./main_doc/paper_consent_thank");
};

controller.approve_doc = (req, res) => {
    const { id } = req.params;
    const commentid = id;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT WHERE comment_id = ?;', [commentid], (err, comment_data) => {

            if (err) {
                req.json(err)
            } else {
                res.render("main_doc/approve_doc", {
                    commentid: commentid,
                    comment_data,
                    session: req.session
                });
            }
        });
    });
};

controller.confirm_approve = (req, res) => {
    const commentid = req.body.comment_id
    const comment_remark = req.body.comment_remark
    req.getConnection((err, conn) => {
        conn.query("UPDATE TB_TR_PDPA_DOCUMENT_COMMENT SET  comment_status=1,comment_date_answer=NOW(),comment_remark=? WHERE  comment_id=? ", [comment_remark, commentid], (err, updoc_comment) => {
            res.render("main_doc/confirm_doc", {

            });
        });
    });
};

controller.unapprove_doc = (req, res) => {
    const { id } = req.params;
    const commentid = id;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT WHERE comment_id = ?;', [commentid], (err, comment_data) => {

            if (err) {
                req.json(err)
            } else {
                res.render("main_doc/approve_doc", {
                    commentid: commentid,
                    comment_data,
                    session: req.session
                });
            }
        });
    });
};

controller.confirm_unapprove = (req, res) => {
    const commentid = req.body.comment_id
    const comment_remark = req.body.comment_remark
    req.getConnection((err, conn) => {
        conn.query("UPDATE TB_TR_PDPA_DOCUMENT_COMMENT SET  comment_status = 2,comment_date_answer=NOW(),comment_remark=? WHERE  comment_id=? ", [comment_remark, commentid], (err, updoc_comment) => {
        });
        res.render("main_doc/confirm_doc", {
        });
    });
};

controller.show_slide = (req, res) => {

    const { id } = req.params;
    var host = sethost(req);
    // const user = req.session.userid;
    var user = ""
    if (req.session.acc_id_control) {
        user = req.session.acc_id_control
    } else {
        user = req.session.userid;
    }
    req.getConnection((err, conn) => {
        conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
            conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                conn.query("SELECT * FROM  TB_TR_ACCOUNT  INNER JOIN TB_TR_PDPA_DOCUMENT as doc on doc.user_id=account.acc_id where doc.doc_id=?;", [id], (err, user_site) => {
                    conn.query("SELECT * FROM  TB_MM_QUESTIONNAIRE", (err, user_list) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? and dp.page_action = 0 ', [id], (err, page) => {
                            conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                                conn.query('SELECT * FROM TB_TR_PDPA_DATA ', (err, pd) => {

                                    let word = []
                                    let word1 = []
                                    for (i in words) {
                                        word.push(words[i].words_id)
                                        word1.push(words[i].words_often)
                                    }
                                    let code = []
                                    let code1 = []
                                    let code_name = []
                                    for (i in pd) {
                                        code.push(pd[i].data_id)
                                        code1.push(pd[i].data_code)
                                        code_name.push(pd[i].data_name)
                                    }


                                    if (err) {
                                        res.json(err)
                                    } else {
                                        res.render('./main_doc/show_slide', {
                                            // res.json({
                                            user_site,
                                            user_list,
                                            host,
                                            id,
                                            data: page,
                                            words: words,
                                            words1: word,
                                            words2: word1,
                                            code: code,
                                            code1: code1,
                                            code_name: code_name,
                                            history: history,
                                            comment_policy,
                                            pd: pd,
                                            session: req.session
                                        });
                                    }
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

controller.api_paperslide = (req, res) => {

    const { id } = req.params;
    var host = sethost(req);
    // const user = req.session.userid;
    var user = ""
    if (req.session.acc_id_control) {
        user = req.session.acc_id_control
    } else {
        user = req.session.userid;
    }
    req.getConnection((err, conn) => {
        conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
            conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                conn.query("SELECT * FROM  TB_TR_ACCOUNT  INNER JOIN TB_TR_PDPA_DOCUMENT as doc on doc.user_id=account.acc_id where doc.doc_id=?;", [id], (err, user_site) => {
                    conn.query("SELECT * FROM  TB_MM_QUESTIONNAIRE", (err, user_list) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? and dp.page_action = 0 ', [id], (err, page) => {
                            conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                                conn.query('SELECT * FROM TB_TR_PDPA_DATA ', (err, pd) => {

                                    let word = []
                                    let word1 = []
                                    for (i in words) {
                                        word.push(words[i].words_id)
                                        word1.push(words[i].words_often)
                                    }
                                    let code = []
                                    let code1 = []
                                    let code_name = []
                                    for (i in pd) {
                                        code.push(pd[i].data_id)
                                        code1.push(pd[i].data_code)
                                        code_name.push(pd[i].data_name)
                                    }


                                    if (err) {
                                        res.json(err)
                                    } else {
                                        res.render('./main_doc/show_slideunlink', {
                                            // res.json({
                                            user_site,
                                            user_list,
                                            host,
                                            id,
                                            data: page,
                                            words: words,
                                            words1: word,
                                            words2: word1,
                                            code: code,
                                            code1: code1,
                                            code_name: code_name,
                                            history: history,
                                            comment_policy,
                                            pd: pd,
                                            session: req.session
                                        });
                                    }
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

controller.print_doc = (req, res) => {

    const { id } = req.params;
    // const user = req.session.userid;
    var user = ""
    if (req.session.acc_id_control) {
        user = req.session.acc_id_control
    } else {
        user = req.session.userid;
    }
    req.getConnection((err, conn) => {
        conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
            conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? and dp.page_action = 0 ', [id], (err, page) => {
                    conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_DATA ', (err, pd) => {
                            conn.query("SELECT * FROM  TB_MM_QUESTIONNAIRE", (err, user_list) => {
                                funchistory.funchistory(req, "policy_doc", `พิมพ์เอกสาร Policy Doc ${page[0].doc_name} `, req.session.userid)
                                let word = []
                                let word1 = []
                                for (i in words) {
                                    word.push(words[i].words_id)
                                    word1.push(words[i].words_often)
                                }
                                let code = []
                                let code1 = []
                                let code_name = []
                                for (i in pd) {
                                    code.push(pd[i].data_id)
                                    code1.push(pd[i].data_code)
                                    code_name.push(pd[i].data_name)
                                }


                                if (err) {
                                    res.json(err)
                                } else {
                                    res.render('./main_doc/print_doc', {
                                        // res.json({
                                        user_list,
                                        data: page,
                                        words: words,
                                        words1: word,
                                        words2: word1,
                                        code: code,
                                        code1: code1,
                                        code_name: code_name,
                                        history: history,
                                        comment_policy,
                                        pd: pd,
                                        session: req.session
                                    });
                                }
                            })
                        })
                    })
                });
            })
        })
    })
}

controller.copydoc_save = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const doc_find = req.body.doc_id;
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE doc_id = ?", [doc_find], (err, find_doc) => {
                    conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT SET doc_name = ?, doc_type_id = ?, doc_remark = ?, doc_date_create = ?, type = 1,type_policy=0", [find_doc[0].doc_name + '(คัดลอก)', find_doc[0].doc_type_id, find_doc[0].doc_remark, date[0].new], (err, d1) => {
                        conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT  ORDER BY doc_id DESC LIMIT 1;", (err, document) => {
                            conn.query("UPDATE TB_TR_PDPA_DOCUMENT SET user_id = ? WHERE doc_id = ?", [user, document[0].doc_id], (err, du) => {
                                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? and dp.page_action = 0', [doc_find], (err, page_doc_find) => {
                                    for (var j = 0; j < page_doc_find.length; j++) {
                                        conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_PAGE SET doc_id= ?, page_number = ?, page_content = ? ;", [document[0].doc_id, j + 1, page_doc_find[j].page_content], (err, d2) => { })
                                    }

                                    conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 9, log_detail = ? ,user_id = ?", [document[0].doc_id, document[0].doc_date_create, 'คัดลอกเอกสารจาก ' + find_doc[0].doc_name + ' เป็น ' + document[0].doc_name, user], (err, d3) => {
                                        if (err) { res.json(err) }
                                    })
                                    funchistory.funchistory(req, "policy_doc", `คัดลอกเอกสารPolicy Doc ${find_doc[0].doc_name} `, req.session.userid)
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

controller.api_paper = (req, res) => {
    const { id } = req.params;
    const user = req.session.userid;
    var host_doc = sethost(req);

    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? and dp.page_action = 0 ",
            [id], (err, page) => {
                conn.query("SELECT * FROM TB_MM_QUESTIONNAIRE", [id], (err, user_site) => {
                    conn.query("SELECT a.image FROM TB_TR_PDPA_DOCUMENT as d inner join TB_TR_ACCOUNT as a on a.acc_id = d.user_id where d.doc_id = ?;",
                        [id], (err, logo_doc) => {
                            conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_CONSENT  WHERE doc_id = ?", [id],
                                (err, page_check) => {
                                    if (page_check.length > 0) {
                                        let page_content =
                                            `<!DOCTYPE html>
                  <html dir="ltr" lang="en">
                  
                  <head>
                      <meta charset="utf-8">
                      <meta http-equiv="X-UA-Compatible" content="IE=edge">
                      <!-- Tell the browser to be responsive to screen width -->
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <meta name="keywords"
                          content="โปรแกรมจัดทำ PDPA, อบรม PDPA, ที่ปรึกษา PDPA, ข้อมูลส่วนบุคคล, PDPA, นโยบาย, ความยินยอม, Consent, คุ้กกี้แบนเนอร์, Cookie, Cookies, Popup, Pattern, Classification, รับเรื่องร้องเรียน">
                      <meta name="description" content="ใช้เป็น PDPA 3in1 ทำ ครบ จบ เรื่อง PDPA ที่นี่">
                      <meta name="robots" content="noindex,nofollow">
                      <title>All Inclusive Security</title>
                      <link rel="icon" type="image/png" sizes="16x16" href="/UI/assets/images/favicon_bak.png">
                      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
                      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
                      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
                      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
                  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>
                  <link rel="preconnect" href="https://fonts.googleapis.com>
                  <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>
                  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;500;600&family=Sarabun:wght@200&display=swap" rel="stylesheet">
                  </head>
                  <style>
                      p {
                          margin-left: .25in;
                          text-align: justify;
                          text-justify: inter-cluster;
                          text-indent: -.25in;
                          mso-list: l0 level1 lfo1;
                          background: transparent
                      }
                      #body{
                          margin-left: .25in;
                          text-align: justify;
                          text-justify: inter-cluster;
                          text-indent: -.25in;
                          mso-list: l0 level1 lfo1;
                          background: transparent;
                          font-family: 'Kanit', sans-serif;
                          font-family: 'Sarabun', sans-serif;
                      }
                  </style>
                  <style>
  div {
  font-family: 'Sarabun', sans-serif !important;
  font-size: 16px !important;
  }
  span{
      font-family: 'Sarabun', sans-serif !important;
      font-size: 16px !important;
  }
  p{
      font-family: 'Sarabun', sans-serif !important;
      font-size: 16px !important;
      line-height: 1.6 !important;
  }
  body{
      font-family: 'Sarabun', sans-serif !important;
      font-size: 16px !important;
  }
  .h5, h5 {
    font-family: 'Sarabun', sans-serif !important;
    font-size: 16px !important;
  }
  table, th, td {
  font-family: 'Sarabun', sans-serif !important;
  font-size: 16px !important;
  }
  </style>
                  
                  <body>
                      <center>
                      <div style="width: 60%;" class="col">
                      <div class="row" style="width:50%">
                          <form method="POST" action="/get_paperconsent">
                          ` +
                                            `<input type="hidden" name="doc_id" value=` +
                                            page[0].doc_id +
                                            `>`;
                                        if (page_check[0].consent_firstname_status == 1) {
                                            page_content =
                                                page_content +
                                                ` <div class="mb-3 row">
                          <label for="inputPassword" class="col-sm-2 col-form-label">ชื่อ</label>
                          <div class="col-sm-10">
                            <input type="text" class="form-control" name="consent_firstname" id="inputPassword" required>
                          </div>
                        </div>`;
                                        }
                                        if (page_check[0].consent_lastname_status == 1) {
                                            page_content =
                                                page_content +
                                                ` <div class="mb-3 row">
                          <label for="inputPassword" class="col-sm-2 col-form-label">นามสกุล</label>
                          <div class="col-sm-10">
                            <input type="text" class="form-control" name="consent_lastname" id="inputPassword" required>
                          </div>
                        </div>`;
                                        }
                                        if (page_check[0].consent_address_status == 1) {
                                            page_content =
                                                page_content +
                                                `<div class="mb-3 row">
                          <label for="inputPassword" class="col-sm-2 col-form-label">ที่อยู่</label>
                          <div class="col-sm-10">
                            <input type="text" class="form-control" name="consent_address" id="inputPassword" required>
                          </div>
                        </div>`;
                                        }
                                        if (page_check[0].consent_phone_status == 1) {
                                            page_content =
                                                page_content +
                                                ` <div class="mb-3 row">
                          <label for="inputPassword" class="col-sm-2 col-form-label">เบอร์โทร</label>
                          <div class="col-sm-10">
                            <input type="text" class="form-control" name="consent_phone" id="inputPassword" required>
                          </div>
                        </div>`;
                                        }
                                        if (page_check[0].consent_other_status == 1) {
                                            page_content =
                                                page_content +
                                                ` <div class="mb-3 row">
                          <label for="inputPassword" class="col-sm-2 col-form-label">${page_check[0].consent_other_name}</label>
                          <div class="col-sm-10">
                            <input type="text" class="form-control" name="consent_other" id="inputPassword" required>
                          </div>
                        </div>`;
                                        }
                                        if (page[0].button_consent_position == 1) {
                                            page_content =
                                                page_content +
                                                ` <hr>
                    <button  class="btn btn-success" type="submit" value="1" name="doc_consent_status">ยินยอม</button>
                    <button  class="btn btn-danger" type="submit" value="0" name="doc_consent_status">ไม่ยินยอม</button>
                    `;
                                        }

                                        page_content = page_content + ` </div><hr>`;
                                        var hostimage = host_doc + "/UI/image/" + logo_doc[0].image;
                                        var hostorigin = "/UI/image/" + logo_doc[0].image;
                                        // var newimage = "<img src=\"/UI/image/logo.png\" style=\"width: 25%;height: 25%;\" alt=\"\">"
                                        for (i in page) {
                                            if (page[i].page_content != null) {
                                                var text = page[i].page_content;
                                                let regex = new RegExp("\r\n", "ig");
                                                text = text.replace(regex, "");

                                                let regex1 = new RegExp(hostorigin, "ig");
                                                text = text.replace(regex1, hostimage);

                                                page_content = page_content + text;
                                                if (i == page.length - 1) {
                                                    if (page[i].button_consent_position == 0) {
                                                        page_content =
                                                            page_content +
                                                            ` <hr>
                          <button  class="btn btn-success" type="submit" value="1" name="doc_consent_status">ยินยอม</button>
                          <button  class="btn btn-danger" type="submit" value="0" name="doc_consent_status">ไม่ยินยอม</button>
                          `;
                                                    } else {
                                                        page_content = page_content + `<hr>`;
                                                    }
                                                    var page1 = `</div>
                                              </form>
                                           </center>
                                          </body><footer class="footer" >
                                          PDPA 3in1 Version 1.0, All right reserved by SGC Service Co., Ltd.
                                      </footer>`;
                                                    page_content = page_content + page1;
                                                }
                                            }
                                        }
                                        var page_content1 = summernote_replace(user_site, page_content)

                                        // res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                                        //res.setHeader('Content-Type', 'text/html');
                                        // res.write(page_content);
                                        // res.end();
                                        // res.send({page_content:page_content})
                                        // res.setHeader({"Content-Type": "text/html; charset=utf-8"});
                                        // res.type("application/json")
                                        // res.set("Content-Type", "text/html");
                                        res.json({ doc_id: id, page_content: page_content1 });
                                    } else {
                                        let page_content =
                                            `<!DOCTYPE html>
                  <html dir="ltr" lang="en">
                  
                  <head>
                      <meta charset="utf-8">
                      <meta http-equiv="X-UA-Compatible" content="IE=edge">
                      <!-- Tell the browser to be responsive to screen width -->
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <meta name="keywords"
                          content="โปรแกรมจัดทำ PDPA, อบรม PDPA, ที่ปรึกษา PDPA, ข้อมูลส่วนบุคคล, PDPA, นโยบาย, ความยินยอม, Consent, คุ้กกี้แบนเนอร์, Cookie, Cookies, Popup, Pattern, Classification, รับเรื่องร้องเรียน">
                      <meta name="description" content="PDPA 3in1 ทำ ครบ จบ เรื่อง PDPA ที่นี่">
                      <meta name="robots" content="noindex,nofollow">
                      <title>All Inclusive Security</title>
                      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
                      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
                      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
                      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
                  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>
                  <link rel="preconnect" href="https://fonts.googleapis.com>
                  <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>
                  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;500;600&family=Sarabun:wght@200&display=swap" rel="stylesheet">
                  </head>
                  <style>
                      p {
                          margin-left: .25in;
                          text-align: justify;
                          text-justify: inter-cluster;
                          text-indent: -.25in;
                          mso-list: l0 level1 lfo1;
                          background: transparent
                      }
                      body{
                          margin-left: .25in;
                          text-align: justify;
                          text-justify: inter-cluster;
                          text-indent: -.25in;
                          mso-list: l0 level1 lfo1;
                          background: transparent
                      }
                  </style>
                  <style>
                  div {
                  font-family: 'Sarabun', sans-serif !important;
                  font-size: 16px !important;
                  }
                  span{
                      font-family: 'Sarabun', sans-serif !important;
                      font-size: 16px !important;
                  }
                  p{
                      font-family: 'Sarabun', sans-serif !important;
                      font-size: 16px !important;
                      line-height: 1.6 !important;
                  }
                  body{
                      font-family: 'Sarabun', sans-serif !important;
                      font-size: 16px !important;
                  }
                  .h5, h5 {
                    font-family: 'Sarabun', sans-serif !important;
                    font-size: 16px !important;
                }
                table, th, td {
                  font-family: 'Sarabun', sans-serif !important;
                  font-size: 16px !important;
              }
                  </style>
                  
                  <body>
                      <center>
                      <div style="width: 60%;" class="col">
                      <div class="row" style="width:50%">
                          <form method="POST" action="/get_paperconsent">
                          ` +
                                            `<input type="hidden" name="doc_id" value=` +
                                            page[0].doc_id +
                                            `>`;

                                        page_content = page_content + ` </div><hr>`;
                                        var hostimage = host_doc + "/UI/image/" + logo_doc[0].image;
                                        var hostorigin = "/UI/image/" + logo_doc[0].image;
                                        // var newimage = "<img src=\"/UI/image/logo.png\" style=\"width: 25%;height: 25%;\" alt=\"\">"
                                        for (i in page) {
                                            if (page[i].page_content != null) {
                                                var text = page[i].page_content;
                                                let regex = new RegExp("\r\n", "ig");
                                                text = text.replace(regex, "");

                                                let regex1 = new RegExp(hostorigin, "ig");
                                                text = text.replace(regex1, hostimage);

                                                page_content = page_content + text;
                                            }
                                        }
                                        var page_content1 = summernote_replace(user_site, page_content)
                                        // res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                                        //res.setHeader('Content-Type', 'text/html');
                                        // res.write(page_content);
                                        // res.end();
                                        // res.send({page_content:page_content})
                                        // res.setHeader({"Content-Type": "text/html; charset=utf-8"});
                                        // res.type("application/json")
                                        // res.set("Content-Type", "text/html");
                                        res.json({ doc_id: id, page_content: page_content1 });
                                    }
                                }
                            );
                        }
                    );
                }
                );
            });
    });
};

controller.api_paperconsent = (req, res) => {
    const { id } = req.params;
    // const user = req.session.userid;
    var user = ""
    if (req.session.acc_id_control) {
        user = req.session.acc_id_control
    } else {
        user = req.session.userid;
    }
    var host_doc = sethost(req);

    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? and dp.page_action = 0 ",
            [id], (err, page) => {
                conn.query("SELECT a.image FROM TB_TR_PDPA_DOCUMENT as d inner join TB_TR_ACCOUNT as a on a.acc_id = d.user_id where d.doc_id = ?;",
                    [id], (err, logo_doc) => {
                        conn.query("SELECT * FROM TB_MM_QUESTIONNAIRE",
                            [id], (err, user_site) => {
                                conn.query("SELECT * FROM  TB_TR_ACCOUNT WHERE acc_id = ? ;",
                                    [user], (err, user_image) => {
                                        conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_CONSENT  WHERE doc_id = ? ",
                                            [id], (err, page_check) => {
                                                let page_content =
                                                    `<!DOCTYPE html>
                  <html dir="ltr" lang="en">
                  
                  <head>
                      <meta charset="utf-8">
                      <meta http-equiv="X-UA-Compatible" content="IE=edge">
                      <!-- Tell the browser to be responsive to screen width -->
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <meta name="keywords"
                          content="โปรแกรมจัดทำ PDPA, อบรม PDPA, ที่ปรึกษา PDPA, ข้อมูลส่วนบุคคล, PDPA, นโยบาย, ความยินยอม, Consent, คุ้กกี้แบนเนอร์, Cookie, Cookies, Popup, Pattern, Classification, รับเรื่องร้องเรียน">
                      <meta name="description" content="PDPA 3in1 ทำ ครบ จบ เรื่อง PDPA ที่นี่">
                      <meta name="robots" content="noindex,nofollow">
                      <title>All Inclusive Security</title>
                      <link rel="icon" type="image/png" sizes="16x16" href="/UI/assets/images/favicon_bak.png">
                      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
                      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
                      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
                      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
                  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>
                  <link rel="preconnect" href="https://fonts.googleapis.com>
                  <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>
                  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;500;600&family=Sarabun:wght@200&display=swap" rel="stylesheet">
                  </head>
                  <style>
                      p {
                          margin-left: .25in;
                          text-align: justify;
                          text-justify: inter-cluster;
                          mso-list: l0 level1 lfo1;
                          background: transparent;
                          font-family: 'Kanit', sans-serif;
                          font-family: 'Sarabun', sans-serif !important;
                      }
                      body{
                          margin-left: .25in;
                          text-align: justify;
                          text-justify: inter-cluster;
                          text-indent: -.25in;
                          mso-list: l0 level1 lfo1;
                          background: transparent;
                          font-family: 'Kanit', sans-serif;
                          font-family: 'Sarabun', sans-serif !important;
                      }
                  </style>
                  <style>
                  div {
                  font-family: 'Sarabun', sans-serif !important;
                  font-size: 16px !important;
                  }
                  span{
                      font-family: 'Sarabun', sans-serif !important;
                      font-size: 16px !important;
                  }
                  p{
                      font-family: 'Sarabun', sans-serif !important;
                      font-size: 16px !important;
                      line-height: 1.6 !important;
                  }
                  body{
                      font-family: 'Sarabun', sans-serif !important;
                      font-size: 16px !important;
                  }
                  .h5, h5 {
                    font-family: 'Sarabun', sans-serif !important;
                    font-size: 16px !important;
                }
                table, th, td {
                  font-family: 'Sarabun', sans-serif !important;
                  font-size: 16px !important;
              }
                  </style>
                  
                  <body>
                      <center>
                      <div style="width: 210mm;" class="col">
                      <div class="row" style="width:50%">
                          <form method="POST" action="/get_paperconsent">
                          ` +
                                                    `<input type="hidden" name="doc_id" value=` +
                                                    page[0].doc_id +
                                                    `>`;
                                                if (page_check[0].consent_firstname_status == 1) {
                                                    page_content =
                                                        page_content +
                                                        `<h2>` +
                                                        page[0].doc_name +
                                                        `</h2>` +
                                                        ` <div class="mb-3 row">
                          <label for="inputPassword" class="col-sm-2 col-form-label">ชื่อ</label>
                          <div class="col-sm-10">
                            <input type="text" class="form-control" name="consent_firstname" id="inputPassword" required>
                          </div>
                        </div>`;
                                                }
                                                if (page_check[0].consent_lastname_status == 1) {
                                                    page_content =
                                                        page_content +
                                                        ` <div class="mb-3 row">
                          <label for="inputPassword" class="col-sm-2 col-form-label">นามสกุล</label>
                          <div class="col-sm-10">
                            <input type="text" class="form-control" name="consent_lastname" id="inputPassword" required>
                          </div>
                        </div>`;
                                                }
                                                if (page_check[0].consent_address_status == 1) {
                                                    page_content =
                                                        page_content +
                                                        `<div class="mb-3 row">
                          <label for="inputPassword" class="col-sm-2 col-form-label">ที่อยู่</label>
                          <div class="col-sm-10">
                            <input type="text" class="form-control" name="consent_address" id="inputPassword" required>
                          </div>
                        </div>`;
                                                }
                                                if (page_check[0].consent_phone_status == 1) {
                                                    page_content =
                                                        page_content +
                                                        ` <div class="mb-3 row">
                          <label for="inputPassword" class="col-sm-2 col-form-label">เบอร์โทร</label>
                          <div class="col-sm-10">
                            <input type="text" class="form-control" name="consent_phone" id="inputPassword" required>
                          </div>
                        </div>`;
                                                }
                                                if (page_check[0].consent_other_status == 1) {
                                                    page_content =
                                                        page_content +
                                                        ` <div class="mb-3 row">
                          <label for="inputPassword" class="col-sm-2 col-form-label">${page_check[0].consent_other_name}</label>
                          <div class="col-sm-10">
                            <input type="text" class="form-control" name="consent_other" id="inputPassword" required>
                          </div>
                        </div>`;
                                                }
                                                if (page[0].button_consent_position == 1) {
                                                    page_content =
                                                        page_content +
                                                        ` <hr>
                    <button  class="btn btn-success" type="submit" value="1" name="doc_consent_status">ยินยอม</button>
                    <button  class="btn btn-danger" type="submit" value="0" name="doc_consent_status">ไม่ยินยอม</button>
                    `;
                                                }
                                                page_content = page_content + ` </div><hr>`;
                                                var hostimage = host_doc + "/UI/image/" + logo_doc[0].image;
                                                var hostorigin = "/UI/image/" + logo_doc[0].image;
                                                // var newimage = "<img src=\"/UI/image/logo.png\" style=\"width: 25%;height: 25%;\" alt=\"\">"
                                                for (i in page) {
                                                    if (page[i].page_content != null) {
                                                        var text = page[i].page_content;
                                                        let regex = new RegExp("\r\n", "ig");
                                                        text = text.replace(regex, "");

                                                        let regex1 = new RegExp(hostorigin, "ig");
                                                        text = text.replace(regex1, hostimage);

                                                        page_content = page_content + text;
                                                        if (i == page.length - 1) {
                                                            if (page[i].button_consent_position == 0) {
                                                                page_content =
                                                                    page_content +
                                                                    ` <hr>
                          <button  class="btn btn-success" type="submit" value="1" name="doc_consent_status">ยินยอม</button>
                          <button  class="btn btn-danger" type="submit" value="0" name="doc_consent_status">ไม่ยินยอม</button>
                          `;
                                                            } else {
                                                                page_content = page_content + `<hr>`;
                                                            }
                                                            var page1 = `</div>
                                              </form>
                                           </center>
                                          </body><footer class="footer" >
                                          PDPA 3in1 Version 1.0, All right reserved by SGC Service Co., Ltd.
                                      </footer>`;
                                                            page_content = page_content + page1;
                                                        }
                                                    }
                                                }
                                                var page_content1 = summernote_replace(user_site, page_content)
                                                res.writeHead(200, {
                                                    "Content-Type": "text/html; charset=utf-8",
                                                });
                                                //res.setHeader('Content-Type', 'text/html');
                                                res.write(page_content1);
                                                res.end();
                                                // res.send({page_content:page_content})
                                                // res.setHeader({"Content-Type": "text/html; charset=utf-8"});
                                                // res.type("application/json")
                                                // res.set("Content-Type", "text/html");
                                                // res.json({page_content:page_content[0]});
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            });
    });
};


controller.get_paperconsent = (req, res) => {

    var data = req.body;
    console.log(data);
    var date_paper = addDate();
    data["consent_date"] = date_paper;

    req.getConnection((err, conn) => {
        conn.query(
            "INSERT INTO TB_TR_PDPA_DOCUMENT_CONSENT_DATA SET ?",
            [data],
            (err, page) => {
                //res.send("<script>window.close();</script > ")
                res.redirect("/paper_consent_thank");
            }
        );
    });
};

controller.api_link = (req, res) => {
    const { id } = req.params;
    const user = req.session.userid;

    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? and dp.page_action = 0 ', [id], (err, page) => {
            conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DATA ', (err, pd) => {

                    let new_data = []
                    if (page.page_content != null) {
                        let page_id = []
                        let doc_id = []
                        let page_number = []
                        let page_content = []
                        let page_action = []
                        let doc_type_id = []
                        let doc_name = []
                        let doc_date_create = []
                        let user_id = []
                        let doc_status = []
                        let doc_remark = []
                        let doc_action = []

                        for (i in page) {
                            page_id.push(page[i].page_id)
                            doc_id.push(page[i].doc_id)
                            page_number.push(page[i].page_number)
                            page_content.push(page[i].page_content)
                            page_action.push(page[i].page_action)
                            doc_type_id.push(page[i].doc_type_id)
                            doc_name.push(page[i].doc_name)
                            doc_date_create.push(page[i].doc_date_create)
                            user_id.push(page[i].user_id)
                            doc_status.push(page[i].doc_status)
                            doc_remark.push(page[i].doc_remark)
                            doc_action.push(page[i].doc_action)
                        }

                        let page_content_replace = []
                        for (i in page_content) {
                            if (page_content[i] != null) {
                                let text = page[i].page_content;
                                for (j in pd) {
                                    let regex = new RegExp(pd[j].data_code, 'ig')
                                    text = text.replace(regex, pd[j].data_name)
                                }
                                page_content_replace.push(text)
                            } else {
                                page_content_replace.push(null)
                            }
                        }


                        for (i in page_id) {
                            new_data.push({
                                "page_id": page_id[i],
                                "doc_id": doc_id[i],
                                "page_number": page_number[i],
                                "page_content": page_content_replace[i],
                                "page_action": page_action[i],
                                "doc_type_id": doc_type_id[i],
                                "doc_name": doc_name[i],
                                "doc_date_create": doc_date_create[i],
                                "user_id": user_id[i],
                                "doc_status": doc_status[i],
                                "doc_remark": doc_remark[i],
                                "doc_action": doc_action[i]
                            })
                        }
                    }
                    if (err) {
                        res.json(err)
                    } else {
                        if (page.page_content != null) {
                            res.json({
                                data: new_data,
                            });
                        } else {
                            res.json({
                                data: page,
                            });
                        }
                    }
                })
            })
        })
    })
}

controller.api_support = (req, res) => {  // ใช้ api ของที่ดินอยู่
    const { id } = req.params;
    const user = req.session.userid;
    var host = sethost(req);
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT *,d.doc_type_id FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? and dp.page_action = 0 ', [id], (err, page) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render('./main_doc/api_support', {
                        host,
                        data: id,
                        page,
                        session: req.session
                    });
                }
            })
        })
    }
}

controller.savedoc = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const data = req.body;
        if (data.doc_consent_status == undefined) {
            data.doc_consent_status = 0;
        }

        req.getConnection((err, conn) => {
            conn.query(
                "INSERT INTO TB_TR_PDPA_DOCUMENT SET doc_name = ?, doc_type_id = ?, doc_remark = ?, doc_date_create = ?, doc_consent_status = ?,user_id = ? , type = 2,check_doc = 0 ,type_policy=0;",
                [
                    data.doc_name,
                    data.doc_type_id,
                    data.doc_remark,
                    data.doc_date_create,
                    data.doc_consent_status,
                    req.session.userid,
                ],
                (err, d1) => {
                    conn.query(
                        "SELECT * FROM TB_TR_PDPA_DOCUMENT  ORDER BY doc_id DESC LIMIT 1;",
                        (err, document) => {
                            conn.query(
                                "INSERT INTO TB_TR_PDPA_DOCUMENT_PAGE SET page_number = 1, doc_id = ?,page_action=0",
                                [document[0].doc_id], (err, d2) => {
                                    if (err) {
                                        res.json(err);
                                    }
                                }
                            );
                            conn.query(
                                "INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 0, log_detail = 'เพิ่มเอกสาร' ,user_id = ?;",
                                [document[0].doc_id, document[0].doc_date_create, user],
                                (err, d3) => {
                                    conn.query(
                                        "INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 1, log_detail = 'ดูเอกสาร ?' ,user_id = ?;",
                                        [
                                            document[0].doc_id,
                                            document[0].doc_date_create,
                                            document[0].doc_name,
                                            user,
                                        ],
                                        (err, d4) => {
                                            conn.query(
                                                "INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 2, log_detail = 'เพิ่มหน้า 1' ,user_id = ?;",
                                                [document[0].doc_id, document[0].doc_date_create, user],
                                                (err, d5) => {
                                                    if (err) {
                                                        res.json(err);
                                                    }
                                                    funchistory.funchistory(req, "policy_doc", `เพิ่มข้อมูล Policy Doc ${data.doc_name} `, req.session.userid)
                                                    // res.redirect("/paper/" + document[0].doc_id);
                                                    res.redirect("/index");
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                            if (err) {
                                res.json(err);
                            }
                        }
                    );
                }
            );
        });
    }
};

controller.updatedoc = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        funchistory.funchistory(req, "policy_doc", `แก้ไขข้อมูล Policy Doc ${req.body.doc_name}`, req.session.userid)
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const data_id = req.body.doc_id;
        //const data = req.body;
        const _doc_consent_status_ = req.body.doc_consent_status;
        let doc_consent_status = 0;
        if (typeof _doc_consent_status_ != 'undefined') {
            doc_consent_status = 1;
        }
        const data = {
            doc_name: req.body.doc_name,
            doc_type_id: req.body.doc_type_id,
            doc_status: req.body.doc_status,
            doc_remark: req.body.doc_remark,
            doc_consent_status: doc_consent_status,
            doc_id: req.body.doc_id
        }
        const status_doc = [{ status_id: '0', status_name: 'ร่าง' }, { status_id: '1', status_name: 'ต้นแบบ' }, { status_id: '2', status_name: 'ใช้งาน' }, { status_id: '3', status_name: 'ยกเลิก' }]
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE doc_id = ?", [data.doc_id], (err, doc_find) => {
                    if (doc_find[0].doc_status != data.doc_status) {
                        for (var i = 0; i < status_doc.length; i++) {
                            if (data.doc_status == 0 && (doc_find[0].doc_status == status_doc[i].status_id)) {
                                conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 8, log_detail = ? ,user_id = ?", [data.doc_id, date[0].new, 'เปลี่ยนสถานะจาก ' + status_doc[i].status_name + ' เป็น ร่าง', user], (err, d1) => { })
                                break
                            }
                            if (data.doc_status == 1 && (doc_find[0].doc_status == status_doc[i].status_id)) {
                                conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 8, log_detail = ? ,user_id = ?", [data.doc_id, date[0].new, 'เปลี่ยนสถานะจาก ' + status_doc[i].status_name + ' เป็น ต้นแบบ', user], (err, d2) => { })
                                break
                            }
                            if (data.doc_status == 2 && (doc_find[0].doc_status == status_doc[i].status_id)) {
                                conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 8, log_detail = ? ,user_id = ?", [data.doc_id, date[0].new, 'เปลี่ยนสถานะจาก ' + status_doc[i].status_name + ' เป็น ใช้งาน', user], (err, d3) => { })
                                break
                            }
                            if (data.doc_status == 3 && (doc_find[0].doc_status == status_doc[i].status_id)) {
                                conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 8, log_detail = ? ,user_id = ?", [data.doc_id, date[0].new, 'เปลี่ยนสถานะจาก ' + status_doc[i].status_name + ' เป็น ยกเลิก', user], (err, d4) => { })
                                break
                            }

                        }
                    }

                    conn.query("UPDATE TB_TR_PDPA_DOCUMENT SET ? WHERE doc_id = ?", [data, data_id], (err, dt) => {
                        if (err) {
                            res.json(err)
                        }
                        if (req.body.paperconsent) {
                            res.redirect('/paper_consent_show');
                        } else {
                            res.redirect('/index');
                        }
                    });
                })
            });
        });
    }
}

controller.deletedoc = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data_id = req.body.doc_id;
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT a WHERE doc_id = ?", [data_id], (err, del) => {
                funchistory.funchistory(req, "policy_doc", `ลบข้อมูล Policy Doc ${del[0].doc_name}`, req.session.userid)
                conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                        conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT as d LEFT JOIN TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE d.doc_id = ?", [data_id], (err, doc) => {
                            conn.query("UPDATE TB_TR_PDPA_DOCUMENT SET doc_action = 1 WHERE doc_id = ?", [data_id], (err, du) => {
                                conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                                    conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 5, log_detail = 'ลบเอกสาร',user_id = ?;", [doc[0].doc_id, date[0].new, user], (err, logdoc) => {
                                        if (err) { console.log(err); }
                                        if (del[0].type === 3) {
                                            res.redirect('/paper_consent_show');
                                        } else {
                                            res.redirect('/index');
                                        }
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

controller.doc_type = (req, res) => {
    let doc_type1 = []
    let doc_type2 = []
    let word = []
    let word1 = []
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE ;", (err, doc_type) => {
                        conn.query('SELECT * FROM TB_MM_PDPA_WORDS', (err, words) => {
                            conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT group by doc_type_id', (err, doc_active) => {
                                if (err) {
                                    res.json(err)
                                }
                                for (i in words) {
                                    word.push(words[i].words_id)
                                    word1.push(words[i].words_often)
                                }
                                var check_used_doc = new Array(doc_type.length).fill(0)
                                for (var i = 0; i < doc_type.length; i++) {
                                    doc_type1.push(doc_type[i].doc_type_id)
                                    doc_type2.push(doc_type[i].doc_type_name)
                                    for (j in doc_active) {
                                        // if (doc_active[j].doc_type_id == doc_type[i].doc_type_id) {
                                        //     check_used_doc[i] = 1
                                        // }
                                        check_used_doc[i] = doc_type[i].default_type
                                    }
                                }
                                funchistory.funchistory(req, "doc_type", `เข้าสู่เมนู ประเภทเอกสาร`, req.session.userid)
                                res.render('./doc_type/doc_type', {
                                    history: history,
                                    comment_policy,
                                    words: words,
                                    doc_type: doc_type,
                                    doc_type1: doc_type1,
                                    doc_type2: doc_type2,
                                    check_used_doc: check_used_doc,
                                    words1: word,
                                    keyword: "",
                                    words2: word1,
                                    session: req.session
                                });
                            });
                        });
                    });
                });
            });
        });
    }
}
// Post Search Find
controller.doc_type_find = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const name = req.body.search;
        let convert_name = "%" + name + "%";
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE WHERE doc_type_name LIKE ? ;', [convert_name], (err, doc_type) => {
                        conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                            conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT group by doc_type_id', (err, doc_active) => {
                                let word = []
                                let word1 = []
                                for (i in words) {
                                    word.push(words[i].words_id)
                                    word1.push(words[i].words_often)
                                }
                                let doc_type1 = []
                                let doc_type2 = []
                                var check_used_doc = new Array(doc_type.length).fill(0)

                                for (var i = 0; i < doc_type.length; i++) {
                                    doc_type1.push(doc_type[i].doc_type_id)
                                    doc_type2.push(doc_type[i].doc_type_name)
                                    for (j in doc_active) {
                                        // if (doc_active[j].doc_type_id == doc_type[i].doc_type_id) {
                                        //     check_used_doc[i] = 1
                                        // }
                                        check_used_doc[i] = doc_type[i].default_type
                                    }
                                }
                                if (err) {
                                    res.json(err)
                                }
                                res.render('./doc_type/doc_type', {
                                    history: history,
                                    comment_policy,
                                    words: words,
                                    doc_type: doc_type,
                                    doc_type1: doc_type1,
                                    doc_type2: doc_type2,
                                    check_used_doc: check_used_doc,
                                    keyword: name,
                                    words1: word,
                                    words2: word1,
                                    session: req.session
                                });
                            });
                        });
                    });
                });
            });
        });
    }
}

controller.save_doc_type = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body.doc_type_name;
        const user = req.session.userid;
        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_MM_PDPA_DOCUMENT_TYPE set doc_type_name = ?;", [data], (err, dt) => {
                if (err) {
                    res.json(err)
                }
                funchistory.funchistory(req, "doc_type", `เพิ่มข้อมูล ประเภทเอกสาร ${data} `, req.session.userid)
                res.redirect('/doc_type')
            });
        });
    }
}

controller.update_doc_type = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body.doc_type_id;
        const data1 = req.body.doc_type_name;
        const user = req.session.userid;
        req.getConnection((err, conn) => {
            conn.query("UPDATE TB_MM_PDPA_DOCUMENT_TYPE SET doc_type_name =? WHERE doc_type_id = ?;", [data1, data], (err, dt) => {
                if (err) {
                    res.json(err)
                }
                funchistory.funchistory(req, "doc_type", `แก้ไขข้อมูล ประเภทเอกสาร ${data1}`, req.session.userid)
                res.redirect('/doc_type')
            });
        });
    }
}

controller.delete_doc_type = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body.doc_type_id;
        const user = req.session.userid;
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_MM_PDPA_DOCUMENT_TYPE WHERE doc_type_id = ?', [data], (err, doc_type) => {
                conn.query("DELETE FROM TB_MM_PDPA_DOCUMENT_TYPE WHERE doc_type_id = ?", [data], (err, dt) => {
                    if (err) {
                        res.json(err)
                    }
                    funchistory.funchistory(req, "doc_type", `ลบข้อมูล ประเภทเอกสาร ${doc_type[0].doc_type_name}`, req.session.userid)
                    res.redirect('back')
                });
            });
        });
    }
}

controller.save_doc_consent = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const { id } = req.params;
        const user = req.session.userid;
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_CONSENT_DATA SET ?;", [data], (err, doc_consent) => {
                if (err) {
                    res.json(err);
                }
                res.redirect('back')
            });
        });
    }
};

controller.update_doc_consent = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const { id } = req.params;
        const user = req.session.userid;
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("UPDATE TB_TR_PDPA_DOCUMENT_CONSENT_DATA SET ? WHERE doc_id = ?;", [data, data.doc_id], (err, doc_consent) => {
                if (err) {
                    res.json(err);
                }
                res.redirect('back')
            });
        });
    }
};

controller.paper = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        const { id } = req.params;
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        req.getConnection((err, conn) => {
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC',
                [user], (err, history) => {
                    conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;", (err, comment_policy) => {
                        conn.query(
                            "SELECT * FROM  TB_MM_QUESTIONNAIRE ;",
                            (err, user_site) => {
                                conn.query(
                                    "SELECT * FROM  TB_TR_ACCOUNT WHERE acc_id = ? ;",
                                    [user],
                                    (err, user_image) => {
                                        conn.query(
                                            'SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;',
                                            (err, date) => {
                                                conn.query(
                                                    "SELECT * FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA where doc_id = ?;",
                                                    [id],
                                                    (err, doc_consent) => {
                                                        conn.query(
                                                            "SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? and dp.page_action = 0",
                                                            [id], (err, page) => {
                                                                conn.query(
                                                                    "SELECT * FROM TB_TR_PDPA_DOCUMENT as dd INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=dd.user_id INNER JOIN TB_TR_PDPA_DOCUMENT_CONSENT as doccheck on doccheck.doc_id=dd.doc_id WHERE dd.doc_id= ? ",
                                                                    [id],
                                                                    (err, page_check) => {
                                                                        conn.query(
                                                                            "INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 1, log_detail = ? ,user_id = ? ;",
                                                                            [
                                                                                id,
                                                                                date[0].new,
                                                                                "ดูเอกสาร " + page[0].doc_name,
                                                                                user,
                                                                            ],
                                                                            (err, d4) => { }
                                                                        );

                                                                        if (doc_consent[0]) {
                                                                            if (page[0]) {
                                                                                console.log("0");
                                                                                conn.query(
                                                                                    "SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE dp.page_id = ? ;",
                                                                                    [page[0].page_id],
                                                                                    (err, page1) => {
                                                                                        conn.query(
                                                                                            "SELECT * FROM TB_MM_PDPA_WORDS",
                                                                                            (err, words) => {
                                                                                                conn.query("SELECT * FROM TB_TR_PDPA_DATA", [req.session.userid], (err, pd) => {
                                                                                                    let word = [];
                                                                                                    let word1 = [];
                                                                                                    for (i in words) {
                                                                                                        word.push(words[i].words_id);
                                                                                                        word1.push(words[i].words_often);
                                                                                                    }
                                                                                                    let code = [];
                                                                                                    let code1 = [];
                                                                                                    let code_name = [];
                                                                                                    for (i in pd) {
                                                                                                        code.push(pd[i].data_id);
                                                                                                        code1.push(pd[i].data_code);
                                                                                                        code_name.push(pd[i].data_name);
                                                                                                    }
                                                                                                    if (err) {
                                                                                                        res.json(err);
                                                                                                    } else {
                                                                                                        res.render("./paper/paper", {
                                                                                                            page_check,
                                                                                                            doc_consent,
                                                                                                            user_site,
                                                                                                            user_image,
                                                                                                            doc_number: id,
                                                                                                            data: page,
                                                                                                            data1: page1,
                                                                                                            words: words,
                                                                                                            words1: word,
                                                                                                            words2: word1,
                                                                                                            code: code,
                                                                                                            code1: code1,
                                                                                                            code_name: code_name,
                                                                                                            history: history,
                                                                                                            comment_policy,
                                                                                                            pd: pd,
                                                                                                            session: req.session,
                                                                                                        });
                                                                                                    }
                                                                                                }
                                                                                                );
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                );
                                                                            } else {
                                                                                console.log("1");
                                                                                conn.query(
                                                                                    "SELECT * FROM TB_MM_PDPA_WORDS",
                                                                                    (err, words) => {
                                                                                        conn.query(
                                                                                            "SELECT * FROM TB_TR_PDPA_DATA",
                                                                                            [req.session.userid],
                                                                                            (err, pd) => {
                                                                                                let word = [];
                                                                                                let word1 = [];
                                                                                                for (i in words) {
                                                                                                    word.push(words[i].words_id);
                                                                                                    word1.push(words[i].words_often);
                                                                                                }
                                                                                                let code = [];
                                                                                                let code1 = [];
                                                                                                let code_name = [];
                                                                                                for (i in pd) {
                                                                                                    code.push(pd[i].data_id);
                                                                                                    code1.push(pd[i].data_code);
                                                                                                    code_name.push(pd[i].data_name);
                                                                                                }
                                                                                                if (err) {
                                                                                                    res.json(err);
                                                                                                } else {
                                                                                                    res.render("./paper/paper", {
                                                                                                        page_check,
                                                                                                        doc_consent,
                                                                                                        user_site,
                                                                                                        user_image,
                                                                                                        doc_number: id,
                                                                                                        data: page,
                                                                                                        data1: 0,
                                                                                                        words: words,
                                                                                                        words1: word,
                                                                                                        words2: word1,
                                                                                                        code: code,
                                                                                                        code1: code1,
                                                                                                        code_name: code_name,
                                                                                                        history: history,
                                                                                                        comment_policy,
                                                                                                        pd: pd,
                                                                                                        session: req.session,
                                                                                                    });
                                                                                                }
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                );
                                                                            }
                                                                        } else {
                                                                            if (page[0]) {
                                                                                console.log("2");
                                                                                conn.query(
                                                                                    "SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE dp.page_id = ? ;",
                                                                                    [page[0].page_id],
                                                                                    (err, page1) => {
                                                                                        conn.query(
                                                                                            "SELECT * FROM TB_MM_PDPA_WORDS",
                                                                                            (err, words) => {
                                                                                                conn.query(
                                                                                                    "SELECT * FROM TB_TR_PDPA_DATA ",
                                                                                                    [req.session.userid],
                                                                                                    (err, pd) => {
                                                                                                        let word = [];
                                                                                                        let word1 = [];
                                                                                                        for (i in words) {
                                                                                                            word.push(words[i].words_id);
                                                                                                            word1.push(
                                                                                                                words[i].words_often
                                                                                                            );
                                                                                                        }
                                                                                                        let code = [];
                                                                                                        let code1 = [];
                                                                                                        let code_name = [];
                                                                                                        for (i in pd) {
                                                                                                            code.push(pd[i].data_id);
                                                                                                            code1.push(pd[i].data_code);
                                                                                                            code_name.push(pd[i].data_name);
                                                                                                        }
                                                                                                        if (err) {
                                                                                                            res.json(err);
                                                                                                        } else {
                                                                                                            res.render("./paper/paper", {
                                                                                                                page_check,
                                                                                                                user_site,
                                                                                                                user_image,
                                                                                                                doc_consent: 0,
                                                                                                                doc_number: id,
                                                                                                                data: page,
                                                                                                                data1: page1,
                                                                                                                words: words,
                                                                                                                words1: word,
                                                                                                                words2: word1,
                                                                                                                code: code,
                                                                                                                code1: code1,
                                                                                                                code_name: code_name,
                                                                                                                history: history,
                                                                                                                comment_policy,
                                                                                                                pd: pd,
                                                                                                                session: req.session,
                                                                                                            });
                                                                                                        }
                                                                                                    }
                                                                                                );
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                );
                                                                            } else {
                                                                                console.log("3");
                                                                                conn.query(
                                                                                    "SELECT * FROM TB_MM_PDPA_WORDS",
                                                                                    (err, words) => {
                                                                                        conn.query(
                                                                                            "SELECT * FROM TB_TR_PDPA_DATA ",
                                                                                            [req.session.userid],
                                                                                            (err, pd) => {
                                                                                                let word = [];
                                                                                                let word1 = [];
                                                                                                for (i in words) {
                                                                                                    word.push(words[i].words_id);
                                                                                                    word1.push(words[i].words_often);
                                                                                                }
                                                                                                let code = [];
                                                                                                let code1 = [];
                                                                                                let code_name = [];
                                                                                                for (i in pd) {
                                                                                                    code.push(pd[i].data_id);
                                                                                                    code1.push(pd[i].data_code);
                                                                                                    code_name.push(pd[i].data_name);
                                                                                                }
                                                                                                if (err) {
                                                                                                    res.json(err);
                                                                                                } else {
                                                                                                    res.render("./paper/paper", {
                                                                                                        page_check,
                                                                                                        user_site,
                                                                                                        user_image,
                                                                                                        doc_consent: 0,
                                                                                                        doc_number: id,
                                                                                                        data: page,
                                                                                                        data1: 0,
                                                                                                        words: words,
                                                                                                        words1: word,
                                                                                                        words2: word1,
                                                                                                        code: code,
                                                                                                        code1: code1,
                                                                                                        code_name: code_name,
                                                                                                        history: history,
                                                                                                        comment_policy,
                                                                                                        pd: pd,
                                                                                                        session: req.session,
                                                                                                    });
                                                                                                }
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                );
                                                                            }
                                                                        }
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                    );
                });
        });
    }
};
controller.paper_consent = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        const { id } = req.params;
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        req.getConnection((err, conn) => {
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC',
                [user], (err, history) => {
                    conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;", (err, comment_policy) => {
                        conn.query(
                            "SELECT * FROM  TB_MM_QUESTIONNAIRE ;",
                            (err, user_site) => {
                                conn.query(
                                    "SELECT * FROM  TB_TR_ACCOUNT WHERE acc_id = ? ;",
                                    [user],
                                    (err, user_image) => {
                                        conn.query(
                                            'SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;',
                                            (err, date) => {
                                                conn.query(
                                                    "SELECT * FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA where doc_id = ?;",
                                                    [id],
                                                    (err, doc_consent) => {
                                                        conn.query(
                                                            "SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ? and dp.page_action = 0",
                                                            [id], (err, page) => {
                                                                conn.query(
                                                                    "SELECT * FROM TB_TR_PDPA_DOCUMENT as dd INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=dd.user_id INNER JOIN TB_TR_PDPA_DOCUMENT_CONSENT as doccheck on doccheck.doc_id=dd.doc_id WHERE dd.doc_id= ? ",
                                                                    [id],
                                                                    (err, page_check) => {
                                                                        conn.query(
                                                                            "INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 1, log_detail = ? ,user_id = ? ;",
                                                                            [
                                                                                id,
                                                                                date[0].new,
                                                                                "ดูเอกสาร " + page[0].doc_name,
                                                                                user,
                                                                            ],
                                                                            (err, d4) => { }
                                                                        );

                                                                        if (doc_consent[0]) {
                                                                            if (page[0]) {
                                                                                console.log("0");
                                                                                conn.query(
                                                                                    "SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE dp.page_id = ? ;",
                                                                                    [page[0].page_id],
                                                                                    (err, page1) => {
                                                                                        conn.query(
                                                                                            "SELECT * FROM TB_MM_PDPA_WORDS",
                                                                                            (err, words) => {
                                                                                                conn.query(
                                                                                                    "SELECT * FROM TB_TR_PDPA_DATA",
                                                                                                    [req.session.userid],
                                                                                                    (err, pd) => {
                                                                                                        let word = [];
                                                                                                        let word1 = [];
                                                                                                        for (i in words) {
                                                                                                            word.push(words[i].words_id);
                                                                                                            word1.push(
                                                                                                                words[i].words_often
                                                                                                            );
                                                                                                        }
                                                                                                        let code = [];
                                                                                                        let code1 = [];
                                                                                                        let code_name = [];
                                                                                                        for (i in pd) {
                                                                                                            code.push(pd[i].data_id);
                                                                                                            code1.push(pd[i].data_code);
                                                                                                            code_name.push(pd[i].data_name);
                                                                                                        }
                                                                                                        if (err) {
                                                                                                            res.json(err);
                                                                                                        } else {
                                                                                                            res.render("./paper/paper_consent", {
                                                                                                                page_check,
                                                                                                                doc_consent,
                                                                                                                user_site,
                                                                                                                user_image,
                                                                                                                doc_number: id,
                                                                                                                data: page,
                                                                                                                data1: page1,
                                                                                                                words: words,
                                                                                                                words1: word,
                                                                                                                words2: word1,
                                                                                                                code: code,
                                                                                                                code1: code1,
                                                                                                                code_name: code_name,
                                                                                                                history: history,
                                                                                                                comment_policy,
                                                                                                                pd: pd,
                                                                                                                session: req.session,
                                                                                                            });
                                                                                                        }
                                                                                                    }
                                                                                                );
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                );
                                                                            } else {
                                                                                console.log("1");
                                                                                conn.query(
                                                                                    "SELECT * FROM TB_MM_PDPA_WORDS",
                                                                                    (err, words) => {
                                                                                        conn.query(
                                                                                            "SELECT * FROM TB_TR_PDPA_DATA",
                                                                                            [req.session.userid],
                                                                                            (err, pd) => {
                                                                                                let word = [];
                                                                                                let word1 = [];
                                                                                                for (i in words) {
                                                                                                    word.push(words[i].words_id);
                                                                                                    word1.push(words[i].words_often);
                                                                                                }
                                                                                                let code = [];
                                                                                                let code1 = [];
                                                                                                let code_name = [];
                                                                                                for (i in pd) {
                                                                                                    code.push(pd[i].data_id);
                                                                                                    code1.push(pd[i].data_code);
                                                                                                    code_name.push(pd[i].data_name);
                                                                                                }
                                                                                                if (err) {
                                                                                                    res.json(err);
                                                                                                } else {
                                                                                                    res.render("./paper/paper_consent", {
                                                                                                        page_check,
                                                                                                        doc_consent,
                                                                                                        user_site,
                                                                                                        user_image,
                                                                                                        doc_number: id,
                                                                                                        data: page,
                                                                                                        data1: 0,
                                                                                                        words: words,
                                                                                                        words1: word,
                                                                                                        words2: word1,
                                                                                                        code: code,
                                                                                                        code1: code1,
                                                                                                        code_name: code_name,
                                                                                                        history: history,
                                                                                                        comment_policy,
                                                                                                        pd: pd,
                                                                                                        session: req.session,
                                                                                                    });
                                                                                                }
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                );
                                                                            }
                                                                        } else {
                                                                            if (page[0]) {
                                                                                console.log("2");
                                                                                conn.query(
                                                                                    "SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE dp.page_id = ? ;",
                                                                                    [page[0].page_id],
                                                                                    (err, page1) => {
                                                                                        conn.query(
                                                                                            "SELECT * FROM TB_MM_PDPA_WORDS",
                                                                                            (err, words) => {
                                                                                                conn.query(
                                                                                                    "SELECT * FROM TB_TR_PDPA_DATA ",
                                                                                                    [req.session.userid],
                                                                                                    (err, pd) => {
                                                                                                        let word = [];
                                                                                                        let word1 = [];
                                                                                                        for (i in words) {
                                                                                                            word.push(words[i].words_id);
                                                                                                            word1.push(
                                                                                                                words[i].words_often
                                                                                                            );
                                                                                                        }
                                                                                                        let code = [];
                                                                                                        let code1 = [];
                                                                                                        let code_name = [];
                                                                                                        for (i in pd) {
                                                                                                            code.push(pd[i].data_id);
                                                                                                            code1.push(pd[i].data_code);
                                                                                                            code_name.push(pd[i].data_name);
                                                                                                        }
                                                                                                        if (err) {
                                                                                                            res.json(err);
                                                                                                        } else {
                                                                                                            res.render("./paper/paper_consent", {
                                                                                                                page_check,
                                                                                                                user_site,
                                                                                                                user_image,
                                                                                                                doc_consent: 0,
                                                                                                                doc_number: id,
                                                                                                                data: page,
                                                                                                                data1: page1,
                                                                                                                words: words,
                                                                                                                words1: word,
                                                                                                                words2: word1,
                                                                                                                code: code,
                                                                                                                code1: code1,
                                                                                                                code_name: code_name,
                                                                                                                history: history,
                                                                                                                comment_policy,
                                                                                                                pd: pd,
                                                                                                                session: req.session,
                                                                                                            });
                                                                                                        }
                                                                                                    }
                                                                                                );
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                );
                                                                            } else {
                                                                                console.log("3");
                                                                                conn.query(
                                                                                    "SELECT * FROM TB_MM_PDPA_WORDS",
                                                                                    (err, words) => {
                                                                                        conn.query(
                                                                                            "SELECT * FROM TB_TR_PDPA_DATA ",
                                                                                            [req.session.userid],
                                                                                            (err, pd) => {
                                                                                                let word = [];
                                                                                                let word1 = [];
                                                                                                for (i in words) {
                                                                                                    word.push(words[i].words_id);
                                                                                                    word1.push(words[i].words_often);
                                                                                                }
                                                                                                let code = [];
                                                                                                let code1 = [];
                                                                                                let code_name = [];
                                                                                                for (i in pd) {
                                                                                                    code.push(pd[i].data_id);
                                                                                                    code1.push(pd[i].data_code);
                                                                                                    code_name.push(pd[i].data_name);
                                                                                                }
                                                                                                if (err) {
                                                                                                    res.json(err);
                                                                                                } else {
                                                                                                    res.render("./paper/paper_consent", {
                                                                                                        page_check,
                                                                                                        user_site,
                                                                                                        user_image,
                                                                                                        doc_consent: 0,
                                                                                                        doc_number: id,
                                                                                                        data: page,
                                                                                                        data1: 0,
                                                                                                        words: words,
                                                                                                        words1: word,
                                                                                                        words2: word1,
                                                                                                        code: code,
                                                                                                        code1: code1,
                                                                                                        code_name: code_name,
                                                                                                        history: history,
                                                                                                        comment_policy,
                                                                                                        pd: pd,
                                                                                                        session: req.session,
                                                                                                    });
                                                                                                }
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                );
                                                                            }
                                                                        }
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                    );
                });
        });
    }
};


controller.createpaper = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const { id } = req.params;
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query("SELECT count(*) as lengthpage FROM TB_TR_PDPA_DOCUMENT_PAGE where doc_id = ?", [id], (err, page) => {
                        conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                            conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_PAGE SET doc_id = ?, page_number = ?;", [id, page[0].lengthpage + 1], (err, pagecount) => {
                                if (err) {
                                    res.json(err)
                                }
                            })
                            conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 2, log_detail = ? ,user_id = ?;", [id, date[0].new, "เพิ่มหน้า " + (Number(page[0].lengthpage) + 1), user], (err, logpage) => {
                                if (err) {
                                    res.json(err)
                                }
                            })
                            conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE as dp left join TB_TR_PDPA_DOCUMENT as d on d.doc_id = dp.doc_id left join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dp.page_id =?", [id], (err, actionpaper) => {
                                if (err) {
                                    res.json(err)
                                }
                                res.redirect('back')
                            })
                        })
                    })
                })
            })
        })
    }
}

controller.editpaper_consent = (req, res) => { //devdew
    console.log('editpaper_consent');
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const { id } = req.params;
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE as p1 LEFT JOIN TB_TR_PDPA_DOCUMENT as p2 ON p1.doc_id=p2.doc_id WHERE p1.page_id = ?;', [id], (err, page) => {
                        conn.query("SELECT * FROM  TB_MM_QUESTIONNAIRE ;", (err, user_site) => {
                            conn.query("SELECT * FROM  TB_TR_ACCOUNT WHERE acc_id = ? ;", [user], (err, user_image) => {
                                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE as p1 LEFT JOIN TB_TR_PDPA_DOCUMENT as p2 ON p1.doc_id=p2.doc_id WHERE p2.doc_id = ? and p1.page_action != 1', [page[0].doc_id], (err, page1) => {
                                    conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT as dd  INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=dd.user_id INNER JOIN TB_TR_PDPA_DOCUMENT_CONSENT as doccheck on doccheck.doc_id=dd.doc_id WHERE dd.doc_id= ?", [page[0].doc_id], (err, page_check) => {
                                        conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                                            conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id LEFT JOIN TB_TR_PDPA_DOCUMENT_PAGE as dp ON dp.doc_id = d.doc_id WHERE d.doc_id = ? AND dl.log_action = 4 GROUP BY dl.log_id;', [page[0].doc_id], (err, page2) => {
                                                conn.query('SELECT * FROM TB_TR_PDPA_DATA;', (err, pd) => {
                                                    conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA where doc_id = ?;', [page[0].doc_id], (err, doc_consent) => {
                                                        let word = []
                                                        let word1 = []
                                                        for (i in words) {
                                                            word.push(words[i].words_id)
                                                            word1.push(words[i].words_often)
                                                        }
                                                        let code = []
                                                        let code1 = []
                                                        let code_name = []
                                                        for (i in pd) {
                                                            code.push(pd[i].data_id)
                                                            code1.push(pd[i].data_code)
                                                            code_name.push(pd[i].data_name)
                                                        }
                                                        if (err) {
                                                            res.json(err)
                                                        } else {
                                                            if (doc_consent[0]) {
                                                                res.render('./paper/paper_consent', {
                                                                    user_site,
                                                                    user_image,
                                                                    page_check,
                                                                    doc_consent,
                                                                    doc_number: page[0].doc_id,
                                                                    data: page1,
                                                                    data1: page,
                                                                    words: words,
                                                                    words1: word,
                                                                    words2: word1,
                                                                    history: history,
                                                                    comment_policy,
                                                                    pd: pd,
                                                                    code: code,
                                                                    code1: code1,
                                                                    code_name: code_name,
                                                                    session: req.session
                                                                });
                                                            } else {
                                                                res.render('./paper/paper_consent', {
                                                                    user_site,
                                                                    user_image,
                                                                    page_check,
                                                                    doc_consent: 0,
                                                                    doc_number: page[0].doc_id,
                                                                    data: page1,
                                                                    data1: page,
                                                                    words: words,
                                                                    words1: word,
                                                                    words2: word1,
                                                                    history: history,
                                                                    comment_policy,
                                                                    pd: pd,
                                                                    code: code,
                                                                    code1: code1,
                                                                    code_name: code_name,
                                                                    session: req.session
                                                                });
                                                            }

                                                        }
                                                    })
                                                })
                                            })
                                        })
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
controller.updatepaper_consent = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const { id } = req.params;
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const body = req.body;
        console.log("body", body);
        const page_number = req.body.page_number
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE as p1 LEFT JOIN TB_TR_PDPA_DOCUMENT as p2 ON p1.doc_id=p2.doc_id WHERE p1.page_id = ?;', [id], (err, page2) => {
                conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                    conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 3, log_detail = ? ,user_id = ?;", [page2[0].doc_id, date[0].new, "แก้ไขหน้า " + page_number, user], (err, logpage) => {
                        if (err) {
                            res.json(err);
                        }
                    });
                    conn.query('UPDATE TB_TR_PDPA_DOCUMENT_PAGE SET page_content=? WHERE page_id=?', [body.page_content, id], (err, page1) => {
                        if (err) {
                            res.json(err);
                        }
                    });
                    if (page2[0].doc_type_id == 217) {
                        res.redirect('/announce-policy')
                    } else if (page2[0].doc_type_id == 216) {
                        res.redirect('/warn-policy')
                    } else if (page2[0].type == 3) {
                        res.redirect('/editpaper_consent/' + page2[0].page_id)
                    } else {
                        res.redirect('/editpaper_consent/' + page2[0].page_id)
                    }
                });
            });
        });
    }
};

controller.deletepaper_consent = (req, res) => {
    console.log('delete');
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const { id } = req.params;
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE as p1 LEFT JOIN TB_TR_PDPA_DOCUMENT as p2 ON p1.doc_id=p2.doc_id WHERE p1.page_id = ?;', [id], (err, page2) => {
                        conn.query("UPDATE TB_TR_PDPA_DOCUMENT_PAGE SET page_action = 1 WHERE page_id = ?", [id], (err, du) => {
                            conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                                conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 4, log_detail = ? ,user_id = ?;", [page2[0].doc_id, date[0].new, "ลบหน้า " + page2[0].page_number, user], (err, logpage) => {
                                    if (err) {
                                        res.json(err)
                                    }
                                    res.redirect('back');
                                })
                            })
                        })
                    })
                })
            })
        })
    }
}

controller.editpaper = (req, res) => {
    console.log('editpaper');
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const { id } = req.params;
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE as p1 LEFT JOIN TB_TR_PDPA_DOCUMENT as p2 ON p1.doc_id=p2.doc_id WHERE p1.page_id = ?;', [id], (err, page) => {
                        conn.query("SELECT * FROM  TB_MM_QUESTIONNAIRE ;", (err, user_site) => {
                            conn.query("SELECT * FROM  TB_TR_ACCOUNT WHERE acc_id = ? ;", [user], (err, user_image) => {
                                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE as p1 LEFT JOIN TB_TR_PDPA_DOCUMENT as p2 ON p1.doc_id=p2.doc_id WHERE p2.doc_id = ? and p1.page_action != 1', [page[0].doc_id], (err, page1) => {
                                    conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT as dd  INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=dd.user_id INNER JOIN TB_TR_PDPA_DOCUMENT_CONSENT as doccheck on doccheck.doc_id=dd.doc_id WHERE dd.doc_id= ?", [page[0].doc_id], (err, page_check) => {
                                        conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                                            conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id LEFT JOIN TB_TR_PDPA_DOCUMENT_PAGE as dp ON dp.doc_id = d.doc_id WHERE d.doc_id = ? AND dl.log_action = 4 GROUP BY dl.log_id;', [page[0].doc_id], (err, page2) => {
                                                conn.query('SELECT * FROM TB_TR_PDPA_DATA;', (err, pd) => {
                                                    conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_CONSENT_DATA where doc_id = ?;', [page[0].doc_id], (err, doc_consent) => {
                                                        let word = []
                                                        let word1 = []
                                                        for (i in words) {
                                                            word.push(words[i].words_id)
                                                            word1.push(words[i].words_often)
                                                        }
                                                        let code = []
                                                        let code1 = []
                                                        let code_name = []
                                                        for (i in pd) {
                                                            code.push(pd[i].data_id)
                                                            code1.push(pd[i].data_code)
                                                            code_name.push(pd[i].data_name)
                                                        }
                                                        if (err) {
                                                            res.json(err)
                                                        } else {
                                                            if (doc_consent[0]) {
                                                                res.render('./paper/paper', {
                                                                    user_site,
                                                                    user_image,
                                                                    page_check,
                                                                    doc_consent,
                                                                    doc_number: page[0].doc_id,
                                                                    data: page1,
                                                                    data1: page,
                                                                    words: words,
                                                                    words1: word,
                                                                    words2: word1,
                                                                    history: history,
                                                                    comment_policy,
                                                                    pd: pd,
                                                                    code: code,
                                                                    code1: code1,
                                                                    code_name: code_name,
                                                                    session: req.session
                                                                });
                                                            } else {
                                                                res.render('./paper/paper', {
                                                                    user_site,
                                                                    user_image,
                                                                    page_check,
                                                                    doc_consent: 0,
                                                                    doc_number: page[0].doc_id,
                                                                    data: page1,
                                                                    data1: page,
                                                                    words: words,
                                                                    words1: word,
                                                                    words2: word1,
                                                                    history: history,
                                                                    comment_policy,
                                                                    pd: pd,
                                                                    code: code,
                                                                    code1: code1,
                                                                    code_name: code_name,
                                                                    session: req.session
                                                                });
                                                            }

                                                        }
                                                    })
                                                })
                                            })
                                        })
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

controller.updatepaper = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const { id } = req.params;
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const body = req.body;
        const page_number = req.body.page_number
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE as p1 LEFT JOIN TB_TR_PDPA_DOCUMENT as p2 ON p1.doc_id=p2.doc_id WHERE p1.page_id = ?;', [id], (err, page2) => {
                conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                    conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 3, log_detail = ? ,user_id = ?;", [page2[0].doc_id, date[0].new, "แก้ไขหน้า " + page_number, user], (err, logpage) => {
                        if (err) {
                            res.json(err);
                        }
                    });
                    conn.query('UPDATE TB_TR_PDPA_DOCUMENT_PAGE SET page_content=? WHERE page_id=?', [body.page_content, id], (err, page1) => {
                        if (err) {
                            res.json(err);
                        }
                    });
                    if (page2[0].doc_type_id == 217) {
                        res.redirect('/announce-policy')
                    } else if (page2[0].doc_type_id == 216) {
                        res.redirect('/warn-policy')
                    } else if (page2[0].type == 3) {
                        res.redirect('/editpaper/' + page2[0].page_id)
                    } else {
                        res.redirect('/editpaper/' + page2[0].page_id)
                    }
                });
            });
        });
    }
};

controller.deletepaper = (req, res) => {
    console.log('delete');
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const { id } = req.params;
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE as p1 LEFT JOIN TB_TR_PDPA_DOCUMENT as p2 ON p1.doc_id=p2.doc_id WHERE p1.page_id = ?;', [id], (err, page2) => {
                        conn.query("UPDATE TB_TR_PDPA_DOCUMENT_PAGE SET page_action = 1 WHERE page_id = ?", [id], (err, du) => {
                            conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%d %H:%i:%s") as new;', (err, date) => {
                                conn.query("INSERT INTO TB_TR_PDPA_DOCUMENT_LOG SET doc_id = ?, log_date = ?, log_action = 4, log_detail = ? ,user_id = ?;", [page2[0].doc_id, date[0].new, "ลบหน้า " + page2[0].page_number, user], (err, logpage) => {
                                    if (err) {
                                        res.json(err)
                                    }
                                    res.redirect('back');
                                })
                            })
                        })
                    })
                })
            })
        })
    }
}

controller.words = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE d.doc_id = ?', [id], (err, page) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE AS dp LEFT JOIN TB_TR_PDPA_DOCUMENT AS d ON dp.doc_id = d.doc_id WHERE dp.page_id = ?;', [page[0].page_id], (err, page1) => {
                            conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                                let word = []
                                let word1 = []
                                for (i in words) {
                                    word.push(words[i].words_id)
                                    word1.push(words[i].words_often)
                                }
                                if (err) {
                                    res.json(err)
                                } else {
                                    res.render('./paper/paper', {
                                        data: page,
                                        data1: page1,
                                        words: words,
                                        words1: word,
                                        words2: word1,
                                        history: history,
                                        comment_policy,
                                        session: req.session
                                    });
                                }
                            })
                        })
                    })
                })
            })
        })
    }
}

controller.new_word = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body;
        const user = req.session.userid;
        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_MM_PDPA_WORDS SET ?;", [data], (err, words) => {
                if (err) {
                    res.json(err)
                }
                res.redirect('back');
            })
        })
    }
}

controller.updateword = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body.words_id;
        const data1 = req.body.words_often;
        const user = req.session.userid;
        req.getConnection((err, conn) => {
            conn.query("UPDATE TB_MM_PDPA_WORDS SET words_often = ? WHERE words_id = ?;", [data1, data], (err, words) => {
                if (err) {
                    res.json(err)
                }
                res.redirect('back');
            })
        })
    }
}

controller.deleteword = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body.words_id;
        const user = req.session.userid;
        req.getConnection((err, conn) => {
            conn.query("DELETE FROM TB_MM_PDPA_WORDS  WHERE words_id = ?;", [data], (err, words) => {
                if (err) {
                    res.json(err)
                }
                res.redirect('back');
            })
        })
    }
}

controller.data_type = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        req.getConnection((err, conn) => {

            conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                conn.query("SELECT * FROM TB_MM_PDPA_DATA_TYPE ;", (err, data_type) => {
                    conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                        conn.query("SELECT * FROM TB_TR_PDPA_DATA group by data_type_id;", (err, data_active) => {
                            let word = []
                            let word1 = []
                            for (i in words) {
                                word.push(words[i].words_id)
                                word1.push(words[i].words_often)
                            }
                            let data_type1 = []
                            let data_type2 = []
                            var check_used_data = new Array(data_type.length).fill(0)

                            for (i in data_type) {
                                data_type1.push(data_type[i].data_type_id)
                                data_type2.push(data_type[i].data_type_name)
                                for (j in data_active) {
                                    if (data_active[j].data_type_id == data_type[i].data_type_id) {
                                        check_used_data[i] = 1
                                    }
                                }
                            }
                            if (err) {
                                res.json(err)
                            }
                            funchistory.funchistory(req, "data_type", `เข้าสู่เมนู ประเภทข้อมูลส่วนบุคคล`, req.session.userid)
                            res.render('./data_type/data_type', {
                                comment_policy,
                                words: words,
                                words1: word,
                                words2: word1,
                                keyword: "",
                                data_type: data_type,
                                data_type1: data_type1,
                                data_type2: data_type2,
                                check_used_data: check_used_data,
                                session: req.session
                            });
                        });
                    });
                });
            })
        })
    }
}

controller.data_type_find = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const name = req.body.search;
        const convert_name = '%' + name + '%'
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_DATA_TYPE WHERE data_type_name LIKE ? ;", [convert_name], (err, data_type) => {
                        conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                            conn.query("SELECT * FROM TB_TR_PDPA_DATA group by data_type_id ;", (err, data_active) => {
                                let word = []
                                let word1 = []
                                for (i in words) {
                                    word.push(words[i].words_id)
                                    word1.push(words[i].words_often)
                                }
                                let data_type1 = []
                                let data_type2 = []
                                var check_used_data = new Array(data_type.length).fill(0)
                                for (i in data_type) {
                                    data_type1.push(data_type[i].data_type_id)
                                    data_type2.push(data_type[i].data_type_name)
                                    for (j in data_active) {
                                        if (data_active[j].data_type_id == data_type[i].data_type_id) {
                                            check_used_data[i] = 1
                                        }
                                    }
                                }
                                if (err) {
                                    res.json(err)
                                }
                                res.render('./data_type/data_type', {
                                    history: history,
                                    comment_policy,
                                    words: words,
                                    words1: word,
                                    words2: word1,
                                    keyword: name,
                                    data_type: data_type,
                                    data_type1: data_type1,
                                    data_type2: data_type2,
                                    check_used_data: check_used_data,
                                    session: req.session
                                });
                            });
                        });
                    });
                })
            })
        })
    }
}

controller.new_data_type = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const user = req.session.userid;

        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_DATA_TYPE ;", (err, data_type) => {
                        conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                            let word = []
                            let word1 = []
                            for (i in words) {
                                word.push(words[i].words_id)
                                word1.push(words[i].words_often)
                            }
                            if (err) {
                                res.json(err)
                            }
                            res.render('./data_type/new_data_type', {
                                history: history,
                                comment_policy,
                                words: words,
                                words1: word,
                                words2: word1,
                                data_type: data_type,
                                session: req.session
                            });
                        });
                    });
                })
            })
        })
    }
}

controller.save_data_type = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body;
        let redirect = '/data_type'
        if (data.data_type_name_add) {
            data.data_type_name = data.data_type_name_add
            redirect = '/appeal/infraction/add'
        }
        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_MM_PDPA_DATA_TYPE set data_type_name = ? ", [data.data_type_name], (err, dt) => {
                if (err) {
                    res.json(err)
                }
                funchistory.funchistory(req, "data_type", `เพิ่มข้อมูล ประเภทข้อมูลส่วนบุคคล ${data.data_type_name} `, req.session.userid)
                res.redirect(redirect);
            });
        });
    }
}

controller.update_data_type = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body.data_type_id;
        const data1 = req.body.data_type_name;
        const user = req.session.userid;
        req.getConnection((err, conn) => {
            conn.query("UPDATE TB_MM_PDPA_DATA_TYPE SET data_type_name = ? WHERE data_type_id = ?", [data1, data], (err, dt) => {
                if (err) {
                    res.json(err)
                }
                funchistory.funchistory(req, "data_type", `แก้ไขข้อมูล ประเภทข้อมูลส่วนบุคคล ${data1}`, req.session.userid)
                res.redirect('/data_type');
            });
        });
    }
}

controller.delete_data_type = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body.data_type_id;
        const user = req.session.userid;
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_MM_PDPA_DATA_TYPE WHERE data_type_id = ?', [data], (err, data_type) => {
                conn.query("DELETE FROM TB_MM_PDPA_DATA_TYPE  WHERE data_type_id = ?;", [data], (err, delete_data_type) => {
                    if (err) {
                        res.json(err)
                    }
                    funchistory.funchistory(req, "data_type", `ลบข้อมูล ประเภทข้อมูลส่วนบุคคล ${data_type[0].data_type_name}`, req.session.userid)
                    res.redirect('/data_type');
                })
            })
        })
    }
}

controller.level_type = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;

        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }

        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_LEVEL ;", (err, level) => {
                        conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                            conn.query('SELECT * FROM TB_TR_PDPA_DATA group by data_level_id;', (err, data_active) => {

                                let word = []
                                let word1 = []
                                for (i in words) {
                                    word.push(words[i].words_id)
                                    word1.push(words[i].words_often)
                                }
                                let level_type1 = []
                                let level_type2 = []
                                var check_used_level = new Array(level.length).fill(0)
                                for (i in level) {
                                    level_type1.push(level[i].level_id)
                                    level_type2.push(level[i].level_name)
                                    for (j in data_active) {
                                        if (data_active[j].data_level_id == level[i].level_id) {
                                            check_used_level[i] = 1
                                        }
                                    }

                                }
                                if (err) {
                                    res.json(err)
                                }
                                funchistory.funchistory(req, "level_type", `เข้าสู่เมนู ระดับข้อมูลความเป็นส่วนตัว`, req.session.userid)
                                res.render('./level/level_type', {
                                    history: history,
                                    comment_policy,
                                    words: words,
                                    words1: word,
                                    words2: word1,
                                    level: level,
                                    level_type1: level_type1,
                                    level_type2,
                                    level_type2,
                                    keyword: "",
                                    check_used_level,
                                    check_used_level,
                                    session: req.session
                                });
                            })
                        });
                    });
                })
            })
        })
    }
}

controller.level_type_find = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        const name = req.body.search;
        const convert_name = '%' + name + '%'
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_LEVEL WHERE level_name LIKE ? ;", [convert_name], (err, level) => {
                        conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                            conn.query('SELECT * FROM TB_TR_PDPA_DATA group by data_level_id;', (err, data_active) => {

                                let word = []
                                let word1 = []
                                for (i in words) {
                                    word.push(words[i].words_id)
                                    word1.push(words[i].words_often)
                                }
                                let level_type1 = []
                                let level_type2 = []
                                var check_used_level = new Array(level.length).fill(0)
                                for (i in level) {
                                    level_type1.push(level[i].level_id)
                                    level_type2.push(level[i].level_name)
                                    for (j in data_active) {
                                        if (data_active[j].data_level_id == level[i].level_id) {
                                            check_used_level[i] = 1
                                        }
                                    }

                                }
                                if (err) {
                                    res.json(err)
                                }
                                res.render('./level/level_type', {
                                    history: history,
                                    comment_policy,
                                    words: words,
                                    words1: word,
                                    words2: word1,
                                    level: level,
                                    level_type1: level_type1,
                                    level_type2,
                                    level_type2,
                                    keyword: name,
                                    check_used_level,
                                    check_used_level,
                                    session: req.session
                                });
                            })
                        });
                    });
                })
            })
        })
    }
}

controller.new_level = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        // const user = req.session.userid;
        var user = ""
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid;
        }
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_LEVEL;", (err, level) => {
                        conn.query('SELECT * FROM TB_MM_PDPA_WORDS; ', (err, words) => {
                            let word = []
                            let word1 = []
                            for (i in words) {
                                word.push(words[i].words_id)
                                word1.push(words[i].words_often)
                            }
                            if (err) {
                                res.json(err)
                            }
                            res.render('./level/new_level', {
                                history: history,
                                comment_policy,
                                words: words,
                                words1: word,
                                words2: word1,
                                level: level,
                                session: req.session
                            });
                        });
                    });
                })
            })
        })
    }
}

controller.save_level = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body.level_name;
        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_MM_PDPA_LEVEL set level_name = ?", [data], (err, level) => {

                if (err) {
                    res.json(err)
                }
                funchistory.funchistory(req, "level_type", `เพิ่มข้อมูล ระดับข้อมูลความเป็นส่วนตัว ${data} `, req.session.userid)
                res.redirect('/level_type');
            });
        });
    }
}

controller.update_level = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body.level_id;
        const data1 = req.body.level_name;
        req.getConnection((err, conn) => {
            conn.query("UPDATE TB_MM_PDPA_LEVEL SET  level_name = ? WHERE level_id = ?", [data1, data], (err, dt) => {
                if (err) {
                    res.json(err)
                }
                funchistory.funchistory(req, "level_type", `แก้ไขข้อมูล ระดับข้อมูลความเป็นส่วนตัว ${data1}`, req.session.userid)
                res.redirect('/level_type');
            });
        });
    }
}

controller.delete_level = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body.level_id;
        const user = req.session.userid;
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_MM_PDPA_LEVEL WHERE level_id = ?', [data], (err, level) => {
                conn.query("DELETE FROM TB_MM_PDPA_LEVEL WHERE level_id = ?", [data], (err, dt) => {
                    if (err) {
                        res.json(err)
                    }
                    funchistory.funchistory(req, "level_type", `ลบข้อมูล ระดับข้อมูลความเป็นส่วนตัว ${level[0].level_name}`, req.session.userid)
                    res.redirect('/level_type');
                });
            });
        });
    }
}

controller.personal_data = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }

        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(NOW(), "%Y-%m-%dT%H:%i:%s" ) as new;', (err, date) => {
                conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                        conn.query("SELECT * FROM TB_MM_PDPA_DATA_TYPE;", (err, data_type) => {
                            conn.query('SELECT pd.data_id ,pd.data_level_id,pd.data_type_id ,pd.data_name,pd.data_detail ,pd.data_location_name,pd.data_location_detail,pd.data_code,DATE_FORMAT(pd.data_date_start, "%d/%m/%Y %H:%i:%s" ) as data_date_start,DATE_FORMAT(pd.data_date_end, "%d/%m/%Y %H:%i:%s" ) as data_date_end from TB_TR_PDPA_DATA as pd join TB_MM_PDPA_DATA_TYPE as pdt on pdt.data_type_id = pd.data_type_id join TB_MM_PDPA_LEVEL as l on l.level_id = pd.data_level_id WHERE pd.data_date_start <= ?  AND  ? < pd.data_date_end;', [date[0].new, date[0].new], (err, personal) => {
                                conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                                    conn.query("SELECT * FROM TB_MM_PDPA_LEVEL;", (err, level) => {
                                        conn.query("SELECT * FROM TB_MM_PDPA_TAG;", (err, tag) => {


                                            let word = []
                                            let word1 = []
                                            for (i in words) {
                                                word.push(words[i].words_id)
                                                word1.push(words[i].words_often)
                                            }
                                            let data_id = []
                                            let data_type_id = []
                                            let data_code = []
                                            let data_name = []
                                            let data_level_id = []
                                            let data_detail = []
                                            let data_date_start = []
                                            let data_date_end = []
                                            let data_location_name = []
                                            let data_location_detail = []


                                            for (i in personal) {
                                                data_id.push(personal[i].data_id)
                                                data_type_id.push(personal[i].data_type_id)
                                                data_code.push(personal[i].data_code)
                                                data_name.push(personal[i].data_name)
                                                data_level_id.push(personal[i].data_level_id)
                                                data_detail.push(personal[i].data_detail)
                                                data_date_start.push(personal[i].data_date_start)
                                                data_date_end.push(personal[i].data_date_end)
                                                data_location_name.push(personal[i].data_location_name)
                                                data_location_detail.push(personal[i].data_location_detail)
                                            }
                                            //level
                                            let level_id = []
                                            let level_name = []
                                            for (i in level) {
                                                level_id.push(level[i].level_id)
                                                level_name.push(level[i].level_name)
                                            }
                                            //data_type
                                            let data_type_id1 = []
                                            let data_type_name = []
                                            for (i in data_type) {
                                                data_type_id1.push(data_type[i].data_type_id)
                                                data_type_name.push(data_type[i].data_type_name)
                                            }

                                            if (err) {
                                                res.json(err)
                                            }

                                            funchistory.funchistory(req, "personal_data", `เข้าสู่เมนู จัดการข้อมูลสวนบุคคล`, req.session.userid)
                                            res.render('./personal/personal_data', {
                                                history: history,
                                                comment_policy,
                                                words: words,
                                                data_type: data_type,
                                                words1: word,
                                                words2: word1,
                                                //data splite
                                                data_id: data_id,
                                                data_type_id: data_type_id,
                                                data_code: data_code,
                                                data_name: data_name,
                                                data_level_id: data_level_id,
                                                data_detail: data_detail,
                                                data_date_start: data_date_start,
                                                data_date_end: data_date_end,
                                                data_location_name: data_location_name,
                                                data_location_detail: data_location_detail,
                                                //
                                                //level splite
                                                level_id: level_id,
                                                level_name: level_name,
                                                //
                                                //data_type splite
                                                data_type_id1: data_type_id1,
                                                data_type_name: data_type_name,
                                                //
                                                personal: personal,
                                                // personal1: "",
                                                keyword: "",
                                                level: level,
                                                tag: tag,
                                                date: date[0].new,
                                                session: req.session
                                            })
                                        })
                                    });
                                });
                            });
                        });
                    });
                })
            })
        })
    }
}

controller.personal_data_find = (req, res) => {
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
        const keyword = req.body.search;
        const search_datetime = req.body.search_datetime;
        const convert_name = "%" + keyword + "%"
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_MM_PDPA_DATA_TYPE;", (err, data_type) => {
                conn.query('SELECT pd.data_tag ,pd.data_id ,pd.data_level_id,pd.data_type_id ,pd.data_name,pd.data_detail ,pd.data_location_name,pd.data_location_detail,pd.data_code,DATE_FORMAT(pd.data_date_start, "%d/%m/%Y %H:%i:%s" ) as data_date_start,DATE_FORMAT(pd.data_date_end, "%d/%m/%Y %H:%i:%s" ) as data_date_end from TB_TR_PDPA_DATA as pd join TB_MM_PDPA_DATA_TYPE as pdt on pdt.data_type_id = pd.data_type_id join TB_MM_PDPA_LEVEL as l on l.level_id = pd.data_level_id WHERE (data_date_start <= ? and data_date_end > ?) and (data_name LIKE ? or data_code LIKE ?) and acc_id=?;', [search_datetime, search_datetime, convert_name, convert_name, user], (err, personal) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_LEVEL;", (err, level) => {
                        // let word = []
                        // let word1 = []
                        // for (i in words) {
                        //     word.push(words[i].words_id)
                        //     word1.push(words[i].words_often)
                        // }
                        let data_id = []
                        let data_type_id = []
                        let data_code = []
                        let data_name = []
                        let data_level_id = []
                        let data_detail = []
                        let data_date_start = []
                        let data_date_end = []
                        let data_location_name = []
                        let data_location_detail = []


                        for (i in personal) {
                            data_id.push(personal[i].data_id)
                            data_type_id.push(personal[i].data_type_id)
                            data_code.push(personal[i].data_code)
                            data_name.push(personal[i].data_name)
                            data_level_id.push(personal[i].data_level_id)
                            data_detail.push(personal[i].data_detail)
                            data_date_start.push(personal[i].data_date_start)
                            data_date_end.push(personal[i].data_date_end)
                            // data_location_name.push(personal[i].data_location_name)
                            // data_location_detail.push(personal[i].data_location_detail)
                        }
                        //level
                        let level_id = []
                        let level_name = []
                        for (i in level) {
                            level_id.push(level[i].level_id)
                            level_name.push(level[i].level_name)
                        }
                        //data_type
                        let data_type_id1 = []
                        let data_type_name = []
                        for (i in data_type) {
                            data_type_id1.push(data_type[i].data_type_id)
                            data_type_name.push(data_type[i].data_type_name)
                        }
                        res.json({
                            data_type: data_type,
                            data_id: data_id,
                            data_type_id: data_type_id,
                            data_code: data_code,
                            data_name: data_name,
                            data_level_id: data_level_id,
                            data_detail: data_detail,
                            data_date_start: data_date_start,
                            data_date_end: data_date_end,
                            data_location_name: data_location_name,
                            data_location_detail: data_location_detail,
                            level_id: level_id,
                            level_name: level_name,
                            data_type_id1: data_type_id1,
                            data_type_name: data_type_name,
                            personal: personal,
                            keyword: keyword,
                            date: search_datetime,
                            level: level,
                            cookies: req.cookies
                        });
                    })
                });
            });
        });
    }
}

controller.personal_data_find0 = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        const keyword = req.body.search;
        const search_datetime = req.body.search_datetime;
        const convert_name = "%" + keyword + "%"
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_MM_PDPA_DATA_TYPE;", (err, data_type) => {
                conn.query('SELECT pd.data_tag ,pd.data_id ,pd.data_level_id,pd.data_type_id ,pd.data_name,pd.data_detail ,pd.data_location_name,pd.data_location_detail,pd.data_code,DATE_FORMAT(pd.data_date_start, "%d/%m/%Y %H:%i:%s" ) as data_date_start,DATE_FORMAT(pd.data_date_end, "%d/%m/%Y %H:%i:%s" ) as data_date_end from TB_TR_PDPA_DATA as pd join TB_MM_PDPA_DATA_TYPE as pdt on pdt.data_type_id = pd.data_type_id join TB_MM_PDPA_LEVEL as l on l.level_id = pd.data_level_id WHERE acc_id=?  AND  (data_name LIKE ? or data_code LIKE ?) ', [user, convert_name, convert_name], (err, personal) => {
                    // conn.query('SELECT pd.data_tag ,pd.data_id ,pd.data_level_id,pd.data_type_id ,pd.data_name,pd.data_detail ,pd.data_location_name,pd.data_location_detail,pd.data_code,DATE_FORMAT(pd.data_date_start, "%d/%m/%Y %H:%i:%s" ) as data_date_start,DATE_FORMAT(pd.data_date_end, "%d/%m/%Y %H:%i:%s" ) as data_date_end from TB_TR_PDPA_DATA as pd join TB_MM_PDPA_DATA_TYPE as pdt on pdt.data_type_id = pd.data_type_id join TB_MM_PDPA_LEVEL as l on l.level_id = pd.data_level_id WHERE  (data_name LIKE ? or data_code LIKE ?) ', [convert_name, convert_name], (err, personal) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_LEVEL;", (err, level) => {
                        let data_id = []
                        let data_type_id = []
                        let data_code = []
                        let data_name = []
                        let data_level_id = []
                        let data_detail = []
                        let data_date_start = []
                        let data_date_end = []
                        let data_location_name = []
                        let data_location_detail = []


                        for (i in personal) {
                            data_id.push(personal[i].data_id)
                            data_type_id.push(personal[i].data_type_id)
                            data_code.push(personal[i].data_code)
                            data_name.push(personal[i].data_name)
                            data_level_id.push(personal[i].data_level_id)
                            data_detail.push(personal[i].data_detail)
                            data_date_start.push(personal[i].data_date_start)
                            data_date_end.push(personal[i].data_date_end)
                            // data_location_name.push(personal[i].data_location_name) // ไม่ได้ใช้
                            // data_location_detail.push(personal[i].data_location_detail) // ไม่ได้ใช้
                        }
                        //level
                        let level_id = []
                        let level_name = []
                        for (i in level) {
                            level_id.push(level[i].level_id)
                            level_name.push(level[i].level_name)
                        }
                        //data_type
                        let data_type_id1 = []
                        let data_type_name = []
                        for (i in data_type) {
                            data_type_id1.push(data_type[i].data_type_id)
                            data_type_name.push(data_type[i].data_type_name)
                        }
                        if (err) {
                            res.json(err)
                        }
                        res.json({
                            // words: words,
                            data_type: data_type,
                            // words1: word,
                            // words2: word1,
                            //data splite
                            data_id: data_id,
                            data_type_id: data_type_id,
                            data_code: data_code,
                            data_name: data_name,
                            data_level_id: data_level_id,
                            data_detail: data_detail,
                            data_date_start: data_date_start,
                            data_date_end: data_date_end,
                            data_location_name: data_location_name,
                            data_location_detail: data_location_detail,
                            level_id: level_id,
                            level_name: level_name,
                            data_type_id1: data_type_id1,
                            data_type_name: data_type_name,
                            personal: personal,
                            keyword: keyword,
                            date: search_datetime,
                            level: level,
                            cookies: req.cookies
                        });
                    });
                });
            });
        });
    }
}

controller.new_personal = (req, res) => {
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
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_DATA_TYPE;", (err, data_type) => {
                        conn.query('SELECT pd.data_id, l.level_name,pd.data_name, pdt.data_type_name,pd.data_detail,pd.data_location_name,pd.data_location_detail,pd.data_code,DATE_FORMAT(pd.data_date_start, "%d/%m/%Y %H:%i:%s" ) as data_date_start,DATE_FORMAT(pd.data_date_end, "%d/%m/%Y %H:%i:%s" ) as data_date_end from TB_TR_PDPA_DATA as pd join TB_MM_PDPA_DATA_TYPE as pdt on pdt.data_type_id = pd.data_type_id join TB_MM_PDPA_LEVEL as l on l.level_id = pd.data_level_id  order by pd.data_id Desc;', (err, personal) => {
                            conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                                conn.query("SELECT * FROM TB_MM_PDPA_LEVEL;", (err, level) => {
                                    conn.query("SELECT * FROM TB_MM_PDPA_TAG;", (err, tag) => {
                                        let word = []
                                        let word1 = []

                                        for (i in words) {
                                            word.push(words[i].words_id)
                                            word1.push(words[i].words_often)
                                        }
                                        if (err) {
                                            res.json(err)
                                        }

                                        let codes = []
                                        let codes1 = []
                                        for (i in personal) {
                                            codes.push(personal[i].data_id);
                                            codes1.push(personal[i].data_code);
                                        }
                                        let tag_name = []
                                        for (i in tag) {
                                            tag_name.push(tag[i].tag_name)
                                        }


                                        res.render('./personal/new_personal', {
                                            history: history,
                                            comment_policy,
                                            words: words,
                                            data_type: data_type,
                                            words1: word,
                                            words2: word1,
                                            personal: personal,
                                            tag_name: tag_name,
                                            level: level,
                                            codes: codes,
                                            tag: tag,
                                            codes1: codes1,
                                            session: req.session
                                        });
                                    });
                                });
                            });
                        });
                    });
                })
            })
        })
    }
}

controller.save_personal = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        const data = req.body;
        let mixCode = "#" + data.data_code;
        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_TR_PDPA_DATA SET acc_id=?,data_type_id=?, data_code=?, data_name=?, data_level_id=?, data_detail=?, data_date_start=?, data_date_end=?, data_location_name=?, data_location_detail=?,data_tag=?", [user, data.data_type_id, mixCode, data.data_name, data.data_level_id, data.data_detail, data.data_date_start, data.data_date_end, data.data_location_name, data.data_location_detail, data.personal_dataTag], (err, vvv) => {
                if (err) {
                    res.json(err)
                }
                funchistory.funchistory(req, "personal_data", `เพิ่มข้อมูล ข้อมูลสวนบุคคล ${data.data_name} `, req.session.userid)
                res.redirect('/personal_data');
            });
        });
    }
}

controller.file_personal = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const { id } = req.params;
        // const user = req.session.userid;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_DATA_TYPE;", (err, data_type) => {
                        conn.query('SELECT pd.data_tag,pd.data_id, l.level_name, pd.data_name, pdt.data_type_name,pd.data_detail,pd.data_location_name,pd.data_location_detail,pd.data_code,DATE_FORMAT(pd.data_date_start, "%Y-%m-%d %H:%i:%s" ) as data_date_start,DATE_FORMAT(pd.data_date_end, "%Y-%m-%d %H:%i:%s" ) as data_date_end,pd.data_type_id from TB_TR_PDPA_DATA as pd join TB_MM_PDPA_DATA_TYPE as pdt on pdt.data_type_id = pd.data_type_id join TB_MM_PDPA_LEVEL as l on l.level_id = pd.data_level_id WHERE pd.data_id = ? ;', [id], (err, personal) => {
                            conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                                conn.query("SELECT * FROM TB_MM_PDPA_LEVEL;", (err, level) => {
                                    conn.query('SELECT TB_TR_PDPA_DATA.data_code FROM TB_TR_PDPA_DATA WHERE data_id != ?;', [personal[0].data_id], (err, personal_1) => {
                                        let word = []
                                        let word1 = []
                                        for (i in words) {
                                            word.push(words[i].words_id)
                                            word1.push(words[i].words_often)
                                        }
                                        let codes = []
                                        let codes1 = []
                                        for (i in personal) {
                                            codes.push(personal[i].data_id);
                                            codes1.push(personal[i].data_code);
                                        }
                                        if (err) {
                                            res.json(err)
                                        }
                                        let personal_name = personal[0].data_code.split("#");
                                        var all_code = []
                                        if (typeof personal_1[0] == 'undefined') {
                                            all_code.push("empty")
                                        } else if (typeof personal_1[0] === 'undefined') {
                                            all_code.push(personal_1[0].data_code)
                                        }
                                        // let personal_tag = ""
                                        // for (i in personal) {
                                        //     personal_tag = (personal[i].data_tag.split(','));
                                        // }
                                        funchistory.funchistory(req, "personal_data", `ดูข้อมูล ข้อมูลสวนบุคคล ${personal[0].data_name}`, req.session.userid)
                                        res.render('./personal/file_personal', {
                                            history: history,
                                            comment_policy,
                                            words: words,
                                            data_type: data_type,
                                            words1: word,
                                            words2: word1,
                                            codes: codes,
                                            // codes1: codes1,
                                            personal_1: all_code,
                                            personal_name: personal_name,
                                            // personal_tag: personal_tag,
                                            personal: personal,
                                            level: level,
                                            session: req.session
                                        });
                                    });
                                });
                            });
                        });
                    });
                })
            })
        })
    }
}

controller.edit_personal = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const { id } = req.params;
        // const user = req.session.userid;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query("SELECT * FROM TB_MM_PDPA_DATA_TYPE;", (err, data_type) => {
                        conn.query('SELECT pd.data_tag,pd.data_id, l.level_name, pd.data_name, pdt.data_type_name,pd.data_detail,pd.data_location_name,pd.data_location_detail,pd.data_code,DATE_FORMAT(pd.data_date_start, "%Y-%m-%dT%H:%i:%s" ) as data_date_start,DATE_FORMAT(pd.data_date_end, "%Y-%m-%dT%H:%i:%s" ) as data_date_end,pd.data_type_id from TB_TR_PDPA_DATA as pd join TB_MM_PDPA_DATA_TYPE as pdt on pdt.data_type_id = pd.data_type_id join TB_MM_PDPA_LEVEL as l on l.level_id = pd.data_level_id WHERE pd.data_id = ? ;', [id], (err, personal) => {
                            conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                                conn.query("SELECT * FROM TB_MM_PDPA_LEVEL;", (err, level) => {
                                    conn.query('SELECT doc_pdpa_data.data_code FROM TB_TR_PDPA_DATA as doc_pdpa_data WHERE data_id != ?;', [personal[0].data_id], (err, personal_1) => {
                                        conn.query("SELECT * FROM TB_MM_PDPA_TAG;", (err, tag) => {
                                            let word = []
                                            let word1 = []
                                            for (i in words) {
                                                word.push(words[i].words_id)
                                                word1.push(words[i].words_often)
                                            }
                                            let codes = []
                                            let codes1 = []
                                            for (i in personal) {
                                                codes.push(personal[i].data_id);
                                                codes1.push(personal[i].data_code);
                                            }
                                            if (err) {
                                                res.json(err)
                                            }
                                            let personal_name = personal[0].data_code.split("#");
                                            var all_code = []
                                            if (typeof personal_1[0] == 'undefined') {
                                                all_code.push("empty")
                                            } else {
                                                for (i in personal_1) {
                                                    all_code.push(personal_1[i].data_code)
                                                }
                                            }
                                            let tag_name = []
                                            for (i in tag) {
                                                tag_name.push(tag[i].tag_name)
                                            }
                                            res.render('./personal/edit_personal', {
                                                history: history,
                                                comment_policy,
                                                words: words,
                                                data_type: data_type,
                                                words1: word,
                                                words2: word1,
                                                codes: codes,
                                                tag: tag,
                                                tag_name: tag_name,
                                                // codes1: codes1,
                                                personal_1: all_code,
                                                personal_name: personal_name,
                                                personal: personal,
                                                level: level,
                                                session: req.session
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                })
            })
        })
    }
}

controller.update_personal = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const { id } = req.params;
        const data = req.body;
        let mixCode = "#" + data.data_code;
        const user = req.session.userid;
        req.getConnection((err, conn) => {
            conn.query("UPDATE TB_TR_PDPA_DATA SET data_type_id=?, data_code=?, data_name=?, data_level_id=?, data_detail=?, data_date_start=?, data_date_end=?, data_location_name=?, data_location_detail=?,data_tag=? WHERE data_id=?", [data.data_type_id, mixCode, data.data_name, data.data_level_id, data.data_detail, data.data_date_start, data.data_date_end, data.data_location_name, data.data_location_detail, data.personal_dataTag, id], (err, vvv) => {
                if (err) {
                    res.json(err)
                }
                funchistory.funchistory(req, "personal_data", `แก้ไขข้อมูล ข้อมูลสวนบุคคล ${data.data_name}`, req.session.userid)
                res.redirect('/personal_data');
            });
        });
    }
}

controller.delete_personal = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body.data_id;
        const user = req.session.userid;
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_DATA WHERE data_id=?", [data], (err, code_name) => {
                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE;", (err, search_page_replace) => {
                    console.log(err);
                    for (i in search_page_replace) {
                        if (search_page_replace[i].page_content != null) {
                            let text = search_page_replace[i].page_content
                            const regex = new RegExp(code_name[0].data_code, 'ig')
                            text = text.replace(regex, "")
                            conn.query("UPDATE TB_TR_PDPA_DOCUMENT_PAGE SET page_content = ? WHERE page_id=?", [text, search_page_replace[i].page_id], (err, update_todel) => {
                                if (err) {
                                    res.json(err)
                                }
                            });
                        }
                        else {
                            conn.query("UPDATE TB_TR_PDPA_DOCUMENT_PAGE SET page_content=? WHERE page_id=?", [null, search_page_replace[i].page_id], (err, update_todel1) => {
                                if (err) {
                                    res.json(err)
                                }
                            });
                        }
                    }
                    conn.query("DELETE FROM TB_TR_PDPA_DATA WHERE data_id=?", [data], (err, del_personal_data) => {
                        if (err) {
                            res.json(err)
                        }
                        funchistory.funchistory(req, "personal_data", `ลบข้อมูล ข้อมูลสวนบุคคล ${code_name[0].data_name}`, req.session.userid)
                        res.redirect('/personal_data');
                    });
                });
            });
        });
    }
}

controller.system_setting = (req, res) => {
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
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                        let word = []
                        let word1 = []
                        for (i in words) {
                            word.push(words[i].words_id)
                            word1.push(words[i].words_often)
                        }
                        if (err) {
                            res.json(err)
                        }
                        res.render('./system_setting/system_setting', {
                            history: history,
                            comment_policy,
                            words: words,
                            words1: word,
                            words2: word1,
                            session: req.session
                        });
                    });
                });
            })
        })
    }
}

controller.membership = (req, res) => {
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
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                        let word = []
                        let word1 = []
                        for (i in words) {
                            word.push(words[i].words_id)
                            word1.push(words[i].words_often)
                        }
                        if (err) {
                            res.json(err)
                        }
                        res.render('./membership/membership', {
                            history: history,
                            comment_policy,
                            words: words,
                            words1: word,
                            words2: word1,
                            session: req.session
                        });
                    });
                });
            })
        })
    }
}

controller.protect_policy = (req, res) => {
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
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                        let word = []
                        let word1 = []
                        for (i in words) {
                            word.push(words[i].words_id)
                            word1.push(words[i].words_often)
                        }
                        if (err) {
                            res.json(err)
                        }
                        res.render('./policy/protect_policy', {
                            history: history,
                            comment_policy,
                            words: words,
                            words1: word,
                            words2: word1,
                            session: req.session
                        });
                    });
                });
            })
        })
    }
}

controller.publish_policy = (req, res) => {
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
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_MM_PDPA_WORDS; ', (err, words) => {
                        let word = []
                        let word1 = []
                        for (i in words) {
                            word.push(words[i].words_id)
                            word1.push(words[i].words_often)
                        }
                        if (err) {
                            res.json(err)
                        }
                        res.render('./policy/publish_policy', {
                            history: history,
                            comment_policy,
                            words: words,
                            words1: word,
                            words2: word1,
                            session: req.session
                        });
                    });
                });
            })
        })
    }
}

controller.test_policy = (req, res) => {
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
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_MM_PDPA_WORDS; ', (err, words) => {
                        let word = []
                        let word1 = []
                        for (i in words) {
                            word.push(words[i].words_id)
                            word1.push(words[i].words_often)
                        }
                        if (err) {
                            res.json(err)
                        }
                        res.render('./policy/test_policy', {
                            history: history,
                            comment_policy,
                            words: words,
                            words1: word,
                            words2: word1,
                            session: req.session
                        });
                    });
                });
            })
        })
    }
}

controller.share_policy = (req, res) => {
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
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_MM_PDPA_WORDS; ', (err, words) => {
                        let word = []
                        let word1 = []
                        for (i in words) {
                            word.push(words[i].words_id)
                            word1.push(words[i].words_often)
                        }
                        if (err) {
                            res.json(err)
                        }
                        res.render('./policy/share_policy', {
                            history: history,
                            comment_policy,
                            words: words,
                            words1: word,
                            words2: word1,
                            session: req.session
                        });
                    });
                });
            })
        })
    }
}

controller.monitoring = (req, res) => {
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
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_MM_PDPA_WORDS; ', (err, words) => {
                        let word = []
                        let word1 = []
                        for (i in words) {
                            word.push(words[i].words_id)
                            word1.push(words[i].words_often)
                        }
                        if (err) {
                            res.json(err)
                        }
                        res.render('./monitoring/monitoring', {
                            history: history,
                            comment_policy,
                            words: words,
                            words1: word,
                            words2: word1,
                            session: req.session
                        });
                    });
                });
            })
        })
    }
}

controller.data_gateway = (req, res) => {
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
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,ac.name as name_history, dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id join TB_TR_ACCOUNT as ac on ac.acc_id=dl.user_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_TR_PDPA_DOCUMENT_COMMENT;', (err, comment_policy) => {
                    conn.query('SELECT * FROM TB_MM_PDPA_WORDS; ', (err, words) => {
                        let word = []
                        let word1 = []
                        for (i in words) {
                            word.push(words[i].words_id)
                            word1.push(words[i].words_often)
                        }
                        if (err) {
                            res.json(err)
                        }
                        res.render('./data_protect/data_gateway', {
                            history: history,
                            comment_policy,
                            words: words,
                            words1: word,
                            words2: word1,
                            session: req.session
                        });
                    });
                });
            })
        })
    }
}

controller.docsaveTag = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {

        const user = req.session.userid;
        const data_tag = req.body;
        var myObj = JSON.parse(data_tag.personal_dataTag); // เเปลง  [{"value":"5555"},{"value":"6666"}]' ให้เป็น ["5555","6666"]
        var dta_json_tag = [];
        for (var i = 0; i < myObj.length; i++) {
            dta_json_tag.push(myObj[i].value)
        }
        req.getConnection((err, conn) => {
            for (var j = 0; j < dta_json_tag.length; j++) {
                conn.query('INSERT INTO TB_MM_PDPA_TAG SET tag_name =?', [dta_json_tag[j]], (err, Personal_DataTag) => { })
            }
            if (err) {
                res.json(err)
            }
            res.redirect('/personal_data');
        });
    }
}


controller.delete_tage = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/');
    } else {
        const data = req.body;
        console.log(data.tag_id.split(',')[1]);
        console.log(data.tag_id[1]);
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM  TB_TR_PDPA_DATA  WHERE data_tag like ?", ["%" + data.tag_id.split(',')[1] + "%"], (err, tages) => {
                conn.query("DELETE  FROM TB_MM_PDPA_TAG  WHERE tag_id=?", [data.tag_id.split(',')[0]], (err, delete_tag) => {
                    for (let i = 0; i < tages.length; i++) {
                        const array = tages[i].data_tag.split(',');
                        const index = array.indexOf(data.tag_id.split(',')[1]);
                        if (index > -1) {
                            array.splice(index, 1);
                            conn.query("UPDATE TB_TR_PDPA_DATA  SET data_tag=?  WHERE data_id=?", [array.toString(), tages[i].data_id], (err, tages) => {
                            });
                        }
                    }
                    funchistory.funchistory(req, "personal data", `ลบ ข้อมูลส่วนบุคคล ${data.tag_id.split(',')[1]}`, req.session.userid)
                    res.redirect('/personal_data');
                });
            });
        });
    }
}



function summernote_replace(data, page) {
    let text = page;
    const site_name = data[0].Name1;
    const short_name = data[0].Name1;
    // const image = data_image[0].image;
    const image = 'logo.png';
    const email_company = data[0].emailAddress1;
    const phone_company = data[0].phone1;
    const address_company = data[0].shortDesciption1;
    const number_company = 'number';

    let page_content_replace_company = [];
    let company_replace =
        [
            "@@company_name",
            "@@short_company_name",
            "@@logo_company",
            "@@email_company",
            "@@phone_company",
            "@@address_company",
            "@@number_company",
        ];
    let regex =
        new RegExp(
            company_replace[0],
            "ig"
        );
    let regex_short =
        new RegExp(
            company_replace[1],
            "ig"
        );
    let regex_logo =
        new RegExp(
            company_replace[2],
            "ig"
        );
    let regex_email_company =
        new RegExp(
            company_replace[3],
            "ig"
        );
    let regex_phone_company =
        new RegExp(
            company_replace[4],
            "ig"
        );
    let regex_address_company =
        new RegExp(
            company_replace[5],
            "ig"
        );
    let regex_number_company =
        new RegExp(
            company_replace[6],
            "ig"
        );
    text = text.replace(
        regex, site_name
    );
    text = text.replace(
        regex_short, short_name
    );
    text = text.replace(
        regex_logo, image
    );
    text = text.replace(
        regex_email_company, email_company
    );
    text = text.replace(
        regex_phone_company, phone_company
    );
    text = text.replace(
        regex_address_company, address_company
    );
    text = text.replace(
        regex_number_company, number_company
    );
    page_content_replace_company.push(
        text
    );
    return page_content_replace_company[0]
}

module.exports = controller;