const session = require("express-session");
const funchistory = require('../account_controllers')
const Create_banner = require('../controller_domain/controller_domain')
require('dotenv').config()
const controller = {};
controller.settingcookietypes = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "cookies", `เข้าสู่เมนู จัดการประเภทคุกกี้`, req.session.userid)
            res.render("cookie/view_cookietype/cookietype", {
                session: req.session
            });
        });
    } else {
        res.redirect("/");
    }
};


controller.save = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_TR_COOKIEPOLICY SET name_cp=?,detail_cp=?,acc_id=?",
                [data.name_cp, data.detail_cp, user], (err, insert_cookirtype) => {
                    conn.query("SELECT * FROM TB_TR_DOMAINGROUP ", (err, select_domaingroup) => {
                        for (let i = 0; i < select_domaingroup.length; i++) {
                            conn.query("INSERT INTO TB_TR_DOMAIN_SETTING_COOKIEPOLICY SET approve=0,name_cookietype=?,detail_cookie=?,domain_id=?,cookiepolicy_id=?,check_show=1",
                                [data.name_cp, data.detail_cp, select_domaingroup[i].id_dg, insert_cookirtype.insertId], (err, insert_cookirtype) => { });
                        }
                        Create_Banner(req)
                        funchistory.funchistory(req, "cookies", `เพิ่มข้อมูล ประเภทคุกกี้ ${data.name_cp}`, req.session.userid)
                        res.redirect('/setting/cookietypes');
                    });
                });
        });
    } else {
        res.redirect("/");
    }
};

controller.edit = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("UPDATE  TB_TR_COOKIEPOLICY SET name_cp=?,detail_cp=? WHERE id_cp =?",
                [data.name_cp, data.detail_cp, data.id_cp], (err, update_dialog) => {
                    conn.query("UPDATE  TB_TR_DOMAIN_SETTING_COOKIEPOLICY SET name_cookietype=?,detail_cookie=?  WHERE cookiepolicy_id =?",
                        [data.name_cp, data.detail_cp, data.id_cp], (err, select_domain_setting_cookiepolicy) => {
                            conn.query("INSERT INTO TB_TR_LOG_HISTORY SET log_action ='เเก้ไขข้อมูลประเภทคุกกี้' ,log_detail=?,user_id=?",
                                [data.name_cp, req.session.user_id_u], (err, log_history) => {
                                    Create_Banner(req)
                                    funchistory.funchistory(req, "cookies", `แก้ไขข้อมูล ประเภทคุกกี้ ${data.name_cp}`, req.session.userid)
                                    res.redirect('/setting/cookietypes');

                                });
                        });
                });
        });
    } else {
        res.redirect("/");
    }
};

controller.delete = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        let id = data.id_cp.split(',')
        funchistory.funchistory(req, "cookies", `ลบข้อมูล ประเภทคุกกี้ ${id[1]}`, req.session.userid)
        req.getConnection((err, conn) => {
            conn.query('UPDATE  TB_TR_COOKIEPOLICY SET id_status=4 WHERE id_cp = ? ', [id[0]], (err, delete_cookiepolicy) => {
                setTimeout(() => {
                    Create_Banner(req)
                    res.redirect('/setting/cookietypes');
                }, 500);
            });
        });
    } else {
        res.redirect("/");
    }
};


controller.api_cookietypes = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_COOKIEPOLICY WHERE acc_id=? AND id_status !=4",
                [user], (err, cookiepolicy) => {
                    if (cookiepolicy.length > 0) {
                        res.send(cookiepolicy);
                    } else {
                        res.send("ไม่มีข้อมูล");
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};

controller.api_cookietypes_search = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const search = '%' + req.body.text + '%';
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_COOKIEPOLICY WHERE acc_id=? AND (name_cp LIKE ? OR   detail_cp LIKE ?)  AND id_status !=4 ",
                [user, search, search],
                (err, cookiepolicy) => {
                    if (cookiepolicy.length > 0) {
                        res.send(cookiepolicy)
                    } else {
                        res.send(JSON.stringify("ไม่มีข้อมูล"));
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};

function sethost(req) {
    var hostset = req.headers;
    var protocol = 'http'
    if (hostset.hasOwnProperty('x-forwarded-proto')) {
        protocol = 'https'
    }
    var host = protocol + "://" + req.headers.host
    return host
}


function Create_Banner(req) {
    var host = sethost(req);
    var user = '';
    if (req.session.acc_id_control) {
        user = req.session.acc_id_control
    } else {
        user = req.session.userid
    }
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM  TB_TR_DOMAINGROUP WHERE acc_id=? AND status_dg=1",
            [user], (err, select_domain) => {
                for (let i = 0; i < select_domain.length; i++) {
                    Create_banner.create_banner(req, select_domain[i].id_dg)
                }
            });
    });
}

module.exports = controller;