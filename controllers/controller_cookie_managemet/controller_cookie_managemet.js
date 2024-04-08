const session = require("express-session");
const funchistory = require('../account_controllers')
const Create_banner = require('../controller_domain/controller_domain')
require('dotenv').config()
const controller = {};
controller.api_tag = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM  TB_MM_DOMAIN_SETTING_TAG WHERE tag_id = ?", [req.params.id],
                (err, pdpa_tag) => {
                    if (pdpa_tag[0]) {
                        res.send(pdpa_tag);
                    } else {
                        var data_null = "ไม่มีข้อมูล";
                        res.send(data_null);
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};


controller.api_cookie = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_MM_DOMAIN_SETTING_TAG as dst LEFT JOIN TB_TR_DOMAINGROUP as dg ON dst.domaingroup_id=dg.id_dg LEFT JOIN TB_MM_PDPA_TAG_DOMAIN as pt ON dst.tag_id=pt.id_tag",
                (err, domain_setting_tag) => {
                    conn.query("SELECT date_dg,namedomain_dg,id_dg,message FROM  TB_TR_DOMAINGROUP WHERE acc_id=? ORDER BY id_dg DESC", [req.session.userid],
                        (err, domaingroup) => {
                            if (domain_setting_tag[0]) {
                                res.send({ domain_setting_tag, domaingroup, session: req.session });
                            } else {
                                var data_null = "ไม่มีข้อมูล";
                                res.send(data_null);
                            }
                        });
                });
        });
    } else {
        res.redirect("/");
    }
};

controller.dialogs = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const { id } = req.params;
        req.getConnection((err, conn) => {
            controller.check_policy(req, req.session.userid, id)
            setTimeout(() => {
                conn.query("SELECT *,doc.doc_id as cookie_policy FROM TB_TR_DOMAIN_SETTING_COOKIEPOLICY as dscp  LEFT JOIN TB_TR_DOMAINGROUP as d ON dscp.domain_id=d.id_dg LEFT JOIN  TB_TR_COOKIEPOLICY AS c ON dscp.cookiepolicy_id=c.id_cp LEFT JOIN TB_TR_PDPA_DOCUMENT as doc ON d.doc_id=doc.doc_id   WHERE d.id_dg=?  AND d.acc_id=? AND id_status !=4", [id, req.session.userid],
                    (err, cookiepolicy) => {
                        conn.query("SELECT doc_id,status_name,message,name_cookie,height,id_dl,id_dg,id_st,id_dsp,namelocation,nameclass,detail_dialog,namedomain_dg FROM TB_TR_DOMAIN_STYLE_POLICY as dsp LEFT JOIN TB_TR_DOMAINGROUP as d  ON dsp.domaingroup_id=d.id_dg  LEFT JOIN TB_TR_DIALOG as dl ON dsp.dialog_id=dl.id_dl LEFT JOIN TB_TR_STYLES as s ON dsp.style_id=s.id_st LEFT JOIN TB_MM_PDPA_COOKIE_STATUS as cs ON d.status_cookie_id=cs.id_status  WHERE d.id_dg=?", [id],
                            (err, domaingroup) => {
                                conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE type BETWEEN 0 AND 1 AND doc_status=2 AND user_id=?", [req.session.userid], (err, document) => {
                                    funchistory.funchistory(req, "cookies", `เข้าสู่เมนู จัดการเนื้อหา Cookie`, req.session.userid)
                                    if (cookiepolicy.length > 0 && domaingroup.length > 0) {
                                        let url_cookie = `${process.env.COOKIE_DOMAIN}/UI/image/cookie.png`
                                        let url_robot = `${process.env.COOKIE_DOMAIN}/UI/image/robot.png`
                                        let doc = `${process.env.COOKIE_DOMAIN}/show_slide/`
                                        let cookie_policy = ""
                                        if (cookiepolicy[0].doc_status == 2 && cookiepolicy[0].doc_action == 0) {
                                            cookie_policy = `${process.env.COOKIE_DOMAIN + `/show_slide/` + cookiepolicy[0].cookie_policy}`;
                                        } else {
                                            cookie_policy = '#javascript:void(0)'
                                        }
                                        res.render("cookie/view_cookie_managemet/dialog", {
                                            domaingroup: domaingroup[0],
                                            cookiepolicy,
                                            url_robot,
                                            url_cookie,
                                            document,
                                            doc,
                                            cookie_policy,
                                            session: req.session
                                        });
                                    } else {
                                        res.redirect("/");
                                    }
                                });
                            });
                    });
            }, 500);
        });
    } else {
        res.redirect("/");
    }
};

controller.check_policy = (req, id, domain) => {
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE  user_id=?", [id], (err, document) => {
            conn.query("SELECT * FROM TB_TR_DOMAIN_STYLE_POLICY WHERE  domaingroup_id=?", [domain], (err, domain_policy) => {
                let dialog = ""
                // if (domain_policy[0].doc_id != document[5].doc_id) {
                //     if (document[5].doc_status == 2 && document[0].doc_action == 0) {
                //         conn.query("UPDATE TB_TR_DOMAINGROUP SET doc_id=? where id_dg=? ",
                //             [document[5].doc_id, domain], (err, update_domain) => { })
                //     }
                // }
                if (document[0].doc_status == 2 && document[0].doc_action == 0) {
                    dialog = domain_policy[0].detail_dialog.replace("#javascript:void(0)", `${process.env.COOKIE_DOMAIN}/show_slide/${document[0].doc_id}`)
                    conn.query("UPDATE TB_TR_DOMAIN_STYLE_POLICY SET detail_dialog=? where domaingroup_id=? ", [dialog, domain], (err, select_dialog) => { })
                } else {
                    let dialog_check = domain_policy[0].detail_dialog
                    if (dialog_check.includes(`${process.env.COOKIE_DOMAIN}/show_slide/${document[0].doc_id}`)) {
                        dialog = domain_policy[0].detail_dialog.replace(`${process.env.COOKIE_DOMAIN}/show_slide/${document[0].doc_id}`, `#javascript:void(0)`)
                        conn.query("UPDATE TB_TR_DOMAIN_STYLE_POLICY SET detail_dialog=? where domaingroup_id=? ", [dialog, domain], (err, select_dialog) => { });
                    }
                }
            });
        });
    });
}

controller.policy = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE type BETWEEN 0 AND 1 AND  user_id=? AND type_policy=0", [req.session.userid], (err, document) => {
                if (document.length > 0) {
                    res.send(document);
                } else {
                    res.send(JSON.stringify("ไม่มีช้อมูล"));
                }
            })
        });
    } else {
        res.redirect("/");
    }
}


controller.management_cookies = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "cookies", `เข้าสู่เมนู จัดการ Cookie`, req.session.userid)
            funchistory.check_limit(req)
            conn.query("SELECT * FROM TB_MM_PDPA_TAG_DOMAIN", (err, tag) => {
                res.render("cookie/view_cookie_managemet/manage_cookies", {
                    tag,
                    session: req.session
                });
            });
        });
    } else {
        res.redirect("/");
    }
};

controller.ApiCookie = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT acc.firstname,acc.lastname,status_cookie_id,id_status,status_name,name_cookie,date_dg,namedomain_dg,id_dg,message,DATE_FORMAT(date_dg,'%d/%m/%Y %H:%i:%s') as date_dg FROM  TB_TR_DOMAINGROUP as dg LEFT JOIN TB_MM_PDPA_COOKIE_STATUS as cs ON dg.status_cookie_id=cs.id_status LEFT JOIN  TB_TR_ACCOUNT as acc ON dg.acc_id=acc.acc_id WHERE status_dg = 1 AND dg.acc_id=? ORDER BY id_dg DESC", [user],
                (err, select_domaingroup) => {
                    if (select_domaingroup.length > 0) {
                        res.send({ select_domaingroup, 'limit_cookie': req.session.limit.cookie })
                    } else {
                        res.send('ไม่มีข้อมูล')
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};


controller.SearchCookie = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            if (data.text == '') {
                conn.query("SELECT acc.firstname,acc.lastname,status_cookie_id,id_status,status_name,name_cookie,date_dg,namedomain_dg,id_dg,message,DATE_FORMAT(date_dg,'%d/%m/%Y %H:%i:%s') as date_dg FROM  TB_TR_DOMAINGROUP as dg LEFT JOIN TB_MM_PDPA_COOKIE_STATUS as cs ON dg.status_cookie_id=cs.id_status LEFT JOIN  TB_TR_ACCOUNT as acc ON dg.acc_id=acc.acc_id WHERE status_dg = 1 AND dg.acc_id=? ORDER BY id_dg DESC", [user],
                    (err, select_domaingroup) => {
                        if (select_domaingroup.length > 0) {
                            res.send(select_domaingroup)
                        } else {
                            res.send(JSON.stringify('ไม่มีข้อมูล'))
                        }
                    });
            } else {
                conn.query("SELECT acc.firstname,acc.lastname,status_cookie_id,id_status,status_name,name_cookie,date_dg,namedomain_dg,id_dg,message,DATE_FORMAT(date_dg,'%d/%m/%Y %H:%i:%s') as date_dg FROM  TB_TR_DOMAINGROUP as dg LEFT JOIN TB_MM_PDPA_COOKIE_STATUS as cs ON dg.status_cookie_id=cs.id_status LEFT JOIN  TB_TR_ACCOUNT as acc ON dg.acc_id=acc.acc_id WHERE status_dg = 1 and (dg.namedomain_dg =? OR name_cookie=?) AND dg.acc_id=? ORDER BY id_dg DESC",
                    [data.text, data.text, user], (err, select_domaingroup) => {
                        if (select_domaingroup.length > 0) {
                            res.send(select_domaingroup)
                        } else {
                            res.send(JSON.stringify('ไม่มีข้อมูล'))
                        }
                    });
            }
        });
    } else {
        res.redirect("/");
    }
};



controller.Save = (req, res) => { // save dialogs
    if (typeof req.session.userid || typeof req.session.userid != "undefiend") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            var id = data.id_dg;
            // conn.query("SELECT id_cp,id_dg,id_dsc,name_cookietype,approve,detail_cookie FROM TB_TR_DOMAIN_SETTING_COOKIEPOLICY as dscp LEFT JOIN TB_TR_DOMAINGROUP as d ON dscp.domain_id=d.id_dg LEFT JOIN TB_TR_COOKIEPOLICY as cp ON dscp.cookiepolicy_id=cp.id_cp WHERE d.id_dg=?", [id],
            //     (err, select_cookiepolicy) => {
            conn.query("SELECT *,height,id_dl,id_dg,id_st,id_dsp,namelocation,nameclass,detail_dialog,namedomain_dg FROM TB_TR_DOMAIN_STYLE_POLICY as dsp LEFT JOIN TB_TR_DOMAINGROUP as d  ON dsp.domaingroup_id=d.id_dg  LEFT JOIN TB_TR_DIALOG as dl ON dsp.dialog_id=dl.id_dl LEFT JOIN TB_TR_STYLES as s ON dsp.style_id=s.id_st WHERE d.id_dg=?", [id],
                (err, select_domaingroup) => {
                    //*----------- ปรับเเต่งค่าประเภทคุกกี้ -------------*//
                    var id_dsc = data.id_dsc;
                    var approve_cp = data.approve_cp;

                    //*----------- เปลี่ยน นโยบาบคุกกี้-------------*//
                    if (select_domaingroup[0].doc_id != data.doc_id) {
                        conn.query("UPDATE  TB_TR_DOMAINGROUP SET doc_id=? WHERE id_dg= ? ",
                            [data.doc_id, id], (err, update_cookiepolicy) => { });
                    }
                    // var name_cp_append = data.name_cp_append;
                    // if (data.name_cp_append) {
                    //     //*-----------start insert เพิ่มค่าCookieจัดเก็บ -------------*//
                    //     for (var i = 0; i < name_cp_append.length; i++) {
                    //         conn.query("INSERT INTO cookiepolicy SET name_cp = ?,detail_cp=?", [data.name_cp_append[i], data.detail_policy_append[i]], (err, insertstyles) => { });
                    //     }
                    // } else {
                    //*----------- update ปรับเเต่งค่าประเภทคุกกี้ -------------*//
                    if (data.approve_cookieType) {
                        for (var i = 0; i < id_dsc.length; i++) {
                            conn.query("UPDATE  TB_TR_DOMAIN_SETTING_COOKIEPOLICY SET name_cookietype = ?,detail_cookie=? WHERE id_dsc= ? ",
                                [data.name_cp[i], data.detail_policy[i], data.id_dsc[i]], (err, update_cookiepolicy) => {
                                });
                        }
                    }
                    //*----------- update อนุญาต cookie_policy -------------*//
                    if (approve_cp) {
                        if (!Array.isArray(approve_cp)) {
                            approve_cp = new Array(approve_cp)
                        }
                        conn.query("update TB_TR_DOMAIN_SETTING_COOKIEPOLICY set approve=0   WHERE domain_id=? ", [id], (err, update_approve) => { });
                        for (var i = 0; i < approve_cp.length; i++) {
                            conn.query("UPDATE  TB_TR_DOMAIN_SETTING_COOKIEPOLICY SET approve=1 WHERE id_dsc= ? ", [approve_cp[i]], (err, update_cookiepolicy_approve) => { });
                        }
                    } else {
                        conn.query("update TB_TR_DOMAIN_SETTING_COOKIEPOLICY set approve=0   WHERE domain_id=? ", [id], (err, update_approve) => { });
                    }
                    // }
                    // //*-----------END ปรับเเต่งค่าประเภทคุกกี้ -------------*//


                    //*-----------START  INSERT styles ของตำเเหน่งกับสี theme -------------*//
                    if (data.id_st == "") {
                        //*-----------  INSERT styles ที่เลือกมาinsert (กรณีที่เริ่มต้นเลย) -------------*//
                        // var class_css = "btn";
                        var namelocation = data.namelocation;
                        if (data.class == "btn-dark") {
                            data.class = data.class
                        } else {
                            data.class = "light"
                        }
                        conn.query("INSERT INTO TB_TR_STYLES SET nameclass = ?,namelocation=? ,height=?", [data.class, namelocation, data.height], (err, insertstyles) => {
                            conn.query("SELECT * FROM TB_TR_STYLES ORDER BY id_st DESC ", (err, select_style) => {
                                conn.query("UPDATE  TB_TR_DOMAIN_STYLE_POLICY SET style_id = ? WHERE domaingroup_id=?", [select_style[0].id_st, data.id_dg], (err, update_domain_style_policy) => { });
                            });
                        });
                    } else {
                        //*-----------  upate styles -------------*//
                        if (data.class == "btn-dark") {
                            data.class = data.class
                        } else {
                            data.class = "light"
                        }
                        conn.query('UPDATE  TB_TR_STYLES SET nameclass=?,namelocation=?,height=? WHERE id_st=? ', [data.class, data.namelocation, data.height, data.id_st], (err, updatestyle) => {
                            //เก็บ Log_theme
                            var class_theme = "";
                            if (data.class == "btn-dark") {
                                class_theme = "ดำ";
                            } else {
                                class_theme = "ขาว";
                            }
                            if (select_domaingroup[0].nameclass != data.class) {
                                conn.query("INSERT INTO TB_TR_LOG_HISTORY SET log_action ='สีธีม' ,log_detail=?,domain_id=?,user_id=?", [class_theme, id, user], (err, log_history) => {
                                });
                            }
                            //เก็บ log_ตำเเหน่ง
                            var location = "";
                            if (data.namelocation == "under") {
                                location = "ด้านล่าง";
                            } else if (data.namelocation == "top") {
                                location = "ด้านบน";
                            } else {
                                location = "ตรงกลาง";
                            }
                            if (select_domaingroup[0].namelocation != data.namelocation) {
                                conn.query("INSERT INTO TB_TR_LOG_HISTORY SET log_action ='ตำเเหน่ง' ,log_detail=?,domain_id=?,user_id=?", [location, id, user], (err, log_history) => { });
                            }
                        });
                    }
                    //*-----------END INSERT class ของตำเเหน่งกับสี theme -------------*//
                    //*-----------START ส่วนของ Domaingroup -------------*//
                    conn.query('UPDATE  TB_TR_DOMAIN_STYLE_POLICY SET detail_dialog=? WHERE domaingroup_id=? ', [data.dialogs, data.id_dg], (err, update_dialog) => { });
                    if (!Array.isArray(data.check_show)) {
                        conn.query('UPDATE  TB_TR_DOMAIN_SETTING_COOKIEPOLICY SET check_show=1 WHERE domain_id=? ',
                            [data.id_dg], (err, update_dialog) => {
                                conn.query('UPDATE  TB_TR_DOMAIN_SETTING_COOKIEPOLICY SET check_show=0 WHERE id_dsc=? ',
                                    [data.check_show], (err, update_dialog) => {

                                    });
                            });

                    } else {
                        var check_show = data.check_show;
                        conn.query('UPDATE  TB_TR_DOMAIN_SETTING_COOKIEPOLICY SET check_show=1 WHERE domain_id=? ',
                            [data.id_dg], (err, update_dialog) => {
                                for (let i = 0; i < check_show.length; i++) {
                                    conn.query('UPDATE  TB_TR_DOMAIN_SETTING_COOKIEPOLICY SET check_show=0 WHERE id_dsc=? ',
                                        [check_show[i]], (err, update_dialog) => { });
                                }
                            });
                    }
                    setTimeout(() => {
                        Create_banner.create_banner(req, id)
                        funchistory.funchistory(req, "cookies", `แก้ไขข้อมูล Cookie ${select_domaingroup[0].namedomain_dg}`, req.session.userid)
                        res.redirect(`/dialogs/${id}`);
                    }, 1000)

                });
        });
        // });
    } else {
        res.redirect("/");
    }
};

// function sethost(req) {
//     var hostset = req.headers;
//     var protocol = 'http'
//     if (hostset.hasOwnProperty('x-forwarded-proto')) {
//         protocol = 'https'
//     }
//     var host = protocol + "://" + req.headers.host
//     return host
// }

// function sethost(req) {
//     var hostset = req.headers;
//     var protocol = 'http'
//     if (hostset.hasOwnProperty('x-forwarded-proto')) {
//         protocol = 'https'
//     }
//     var host = ""
//     if (process.env.EMAIL_API == "dev") {
//         host = protocol + "://" + req.headers.host
//     } else {
//         host = process.env.COOKIE_DOMAIN
//     }
//     console.log("host", host);
//     return host
// }



controller.group_domain = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const id = req.params.id;
        const id_d = req.params.id_d;
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_MM_DOMAIN_SETTING_TAG WHERE domaingroup_id=? and tag_id=?", [id_d, id],
                (err, select_setting_tag) => {
                    if (select_setting_tag[0]) {
                        conn.query(" DELETE FROM TB_MM_DOMAIN_SETTING_TAG WHERE domaingroup_id=? and tag_id=?", [id_d, id],
                            (err, domain_setting_tag) => {
                                conn.query("SELECT * FROM TB_MM_DOMAIN_SETTING_TAG as dst LEFT JOIN domaingroup as dg ON dst.domaingroup_id=dg.id_dg LEFT JOIN pdpa_tag as pt ON dst.tag_id=pt.id_tag WHERE dg.id_dg=? ",
                                    [id_d], (err, domain_setting_tag) => {
                                        var id = id_d;
                                        res.send({ id, domain_setting_tag })
                                        insert_log_history(req, select_setting_tag, "cancel")
                                    });
                            });
                    } else {
                        conn.query("INSERT INTO TB_MM_DOMAIN_SETTING_TAG SET  domaingroup_id=?,tag_id=?", [id_d, id],
                            (err, insert_setting_tag) => {
                                var success = "success";
                                res.send({ success, insert_setting_tag })
                                insert_log_history(req, select_setting_tag, "select")
                            });
                    }
                });
        });
    } else {
        res.redirect("/");
    }
}

controller.script_banner = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const { id } = req.params;
        req.getConnection((err, conn) => {
            conn.query("SELECT *FROM TB_TR_DOMAINGROUP WHERE id_dg =? LIMIT 1", [id],
                (err, select_setting_tag) => {
                    res.render("cookie/view_cookie_managemet/script_banner", {
                        select_setting_tag: select_setting_tag,
                        session: req.session,
                    })
                })
        });
    } else {
        res.redirect("/");
    }
};

module.exports = controller;