const session = require("express-session");
const fs = require('fs');
require('dotenv').config()
const sha256 = require('js-sha256').sha256;
const funchistory = require('../account_controllers')
const controller = {};
// function sethost(req) {
//     var hostset = req.headers;
//     var protocol = 'http'
//     if (hostset.hasOwnProperty('x-forwarded-proto')) {
//         protocol = 'https'
//     }
//     var host = protocol + "://" + req.headers.host
//     return host
// }

function sethost(req) {
    var hostset = req.headers;
    var protocol = 'http'
    if (hostset.hasOwnProperty('x-forwarded-proto')) {
        protocol = 'https'
    }
    var host = ""
    if (process.env.EMAIL_API == "dev") {
        host = protocol + "://" + req.headers.host
    } else {
        host = process.env.COOKIE_DOMAIN
    }
    console.log("host", host);
    return host
}


controller.adddomain = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var host = sethost(req);
        const data = req.body;
        req.getConnection((err, conn) => {
            // var urlNoProtocol = data.namedomain_dg.replace(/^https?\:\/\//i, "");
            // var urlNoProtocol = data.namedomain_dg;
            // var domain_add = ""
            // if (urlNoProtocol.split(".")[0] == 'www') {
            //     domain_add = urlNoProtocol.split(".")[1]
            // } else {
            //     domain_add = data.namedomain_dg
            // }
            // console.log(domain_add);

            urls = sha256(data.namedomain_dg);
            conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE type BETWEEN 0 AND 1 AND  user_id=?", [req.session.userid], (err, document) => {
                var Cookies_Policy = document[5].doc_id
                conn.query("INSERT INTO TB_TR_DOMAINGROUP SET doc_id=?,dg_file=?,namedomain_dg = ?,message=? ,status_dg=1,name_cookie=?,status_cookie_id=1,acc_id=?",
                    [Cookies_Policy, urls, data.protocol + "://" + data.namedomain_dg, data.message, data.name_cookie, req.session.userid], (err, insert_domaingroup) => {
                        conn.query("SELECT * FROM TB_TR_DOMAINGROUP ORDER BY id_dg DESC", (err, select_domaingroup) => {
                            conn.query("SELECT * FROM TB_TR_COOKIEPOLICY WHERE acc_id=? AND  id_status !=4", [req.session.userid], (err, select_cookiepolicy) => {
                                conn.query("SELECT * FROM TB_MM_PDPA_COOKIEPOLICY_TYPE", (err, select_cookiepolicy_type) => {
                                    if (select_cookiepolicy.length > 0) {
                                        for (let i = 0; i < select_cookiepolicy.length; i++) {
                                            if (select_cookiepolicy[i].type_name == "จำเป็น") {
                                                conn.query("INSERT INTO TB_TR_DOMAIN_SETTING_COOKIEPOLICY SET check_show=1,domain_id=?,cookiepolicy_id=?,name_cookietype=?,detail_cookie=?,approve=1",
                                                    [select_domaingroup[0].id_dg, select_cookiepolicy[i].id_cp, select_cookiepolicy[i].name_cp, select_cookiepolicy[i].detail_cp],
                                                    (err, insert_domain_setting_cookiepolicy) => { });
                                            } else {
                                                conn.query("INSERT INTO TB_TR_DOMAIN_SETTING_COOKIEPOLICY SET check_show=1,domain_id=?,cookiepolicy_id=?,name_cookietype=?,detail_cookie=?,approve=0",
                                                    [select_domaingroup[0].id_dg, select_cookiepolicy[i].id_cp, select_cookiepolicy[i].name_cp, select_cookiepolicy[i].detail_cp],
                                                    (err, insert_domain_setting_cookiepolicy) => { });
                                            }
                                        }
                                    } else {
                                        for (let i = 0; i < select_cookiepolicy_type.length; i++) {
                                            conn.query("INSERT INTO  TB_TR_COOKIEPOLICY SET  name_cp=?,detail_cp=?,acc_id=?",
                                                [select_cookiepolicy_type[i].type_name, select_cookiepolicy_type[i].type_detail, req.session.userid], (err, insert_cookiepolicy) => {
                                                    if (select_cookiepolicy_type[i].type_name == "จำเป็น") {
                                                        conn.query("INSERT INTO TB_TR_DOMAIN_SETTING_COOKIEPOLICY SET check_show=1,domain_id=?,cookiepolicy_id=?,name_cookietype=?,detail_cookie=?,approve=1",
                                                            [select_domaingroup[0].id_dg, insert_cookiepolicy.insertId, select_cookiepolicy_type[i].type_name, select_cookiepolicy_type[i].type_detail],
                                                            (err, insert_domain_setting_cookiepolicy) => { });
                                                    } else {
                                                        conn.query("INSERT INTO TB_TR_DOMAIN_SETTING_COOKIEPOLICY SET check_show=1,domain_id=?,cookiepolicy_id=?,name_cookietype=?,detail_cookie=?,approve=0",
                                                            [select_domaingroup[0].id_dg, insert_cookiepolicy.insertId, select_cookiepolicy_type[i].type_name, select_cookiepolicy_type[i].type_detail],
                                                            (err, insert_domain_setting_cookiepolicy) => { });
                                                    }
                                                });
                                        }
                                    }
                                    var data_domaingroup = select_domaingroup[0];
                                    var script_banner = `<script src="${host}/${process.env.FOLDER_FILESUPLOAD}/file_domain/${urls}.js" type="text/javascript"></script>`;
                                    update_script(req, script_banner, data_domaingroup.id_dg)
                                    //-----------------------การเพิ่ม Dialog กับเเต่ละdomain---------------------------///
                                    conn.query("INSERT INTO  TB_TR_STYLES SET  nameclass='light' ", (err, TB_TR_STYLES) => {
                                        conn.query("SELECT * FROM TB_TR_DIALOG", (err, select_dialog) => {
                                            let dialog = ""
                                            if (document[0].doc_status == 2 && document[0].doc_action == 0) {
                                                dialog = select_dialog[0].dialog_dl.replace("#", `${process.env.COOKIE_DOMAIN}/show_slide/${document[0].doc_id}`)
                                            } else {
                                                dialog = select_dialog[0].dialog_dl.replace("#", `#javascript:void(0)`)
                                            }
                                            conn.query("INSERT INTO TB_TR_DOMAIN_STYLE_POLICY SET domaingroup_id = ?,dialog_id=?,detail_dialog=?,style_id=?",
                                                [data_domaingroup.id_dg, select_dialog[0].id_dl, dialog, TB_TR_STYLES.insertId], (err, insert_domaingroup) => {
                                                    controller.create_banner(req, select_domaingroup[0].id_dg)
                                                });
                                        });
                                    });
                                });
                            });
                        });
                        funchistory.funchistory(req, "cookies", `เพิ่มข้อมูล โดเมน ${data.namedomain_dg}`, req.session.userid)
                        res.redirect('/management/cookies');
                    });
            });
        });
    } else {
        res.redirect("/");
    }
};



function update_script(req, script, id) {
    req.getConnection((err, conn) => {
        conn.query('UPDATE  TB_TR_DOMAINGROUP SET generate_script=? WHERE id_dg = ? ',
            [script, id], (err, editdomaingroup) => { });
    });
}

controller.delete = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM   TB_TR_DOMAINGROUP  WHERE id_dg = ? ',
                [data.id_dg], (err, select_domaingroup) => {
                    conn.query('UPDATE TB_TR_DOMAINGROUP SET status_dg=0 WHERE  id_dg=?',
                        [data.id_dg], (err, update_domaingroup) => {
                            var domain = ""
                            if (select_domaingroup[0].status_cookie_id == 1) {
                                domain = select_domaingroup[0].dg_file + "_close.js"
                            } else if (select_domaingroup[0].status_cookie_id == 2) {
                                domain = select_domaingroup[0].dg_file + ".js"
                            } else {
                                domain = select_domaingroup[0].dg_file + "_close.js"
                            }
                            fs.rename(`./${process.env.FOLDER_FILESUPLOAD}/file_domain/${domain}`, `./${process.env.FOLDER_FILESUPLOAD}/file_domain/${select_domaingroup[0].dg_file}_delete.js`, function (err) {
                                if (err) throw err;
                            });
                            conn.query("INSERT INTO TB_TR_LOG_HISTORY SET log_action = 'ลบไขโดเมน',log_detail=?,user_id=?,domain_id=?",
                                [select_domaingroup[0].namedomain_dg, req.session.useridม, data.id_dg], (err, insert_log_history) => { });
                            funchistory.funchistory(req, "cookies", `ลบข้อมูล โดเมน ${select_domaingroup[0].namedomain_dg}`, req.session.userid)
                            res.redirect("/management/cookies");
                        });
                });
        });
    }
    else {
        res.redirect("/");
    }
};

controller.edit = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM   TB_TR_DOMAINGROUP  WHERE id_dg=?',
                [data.id_dg], (err, select_domaingroup) => {
                    data.namedomain_dg = data.protocol + "://" + data.namedomain_dg;
                    if (data.namedomain_dg != select_domaingroup[0].namedomain_dg) {
                        conn.query("INSERT INTO TB_TR_LOG_HISTORY SET log_action = 'เเก้ไขโดเมน',log_detail=?,user_id=?,domain_id=?",
                            [data.namedomain_dg, req.session.userid, data.id_dg], (err, insert_log_history) => { });
                    }
                    if (data.message != select_domaingroup[0].message) {
                        conn.query("INSERT INTO TB_TR_LOG_HISTORY SET log_action = 'เเก้ไขข้อความ',log_detail=?,user_id=?,domain_id=?",
                            [data.message, req.session.userid, data.id_dg], (err, insert_log_history) => { });
                    }
                    var status = "";
                    if (data.status != select_domaingroup[0].status_cookie_id) {
                        if (data.status == 1) {
                            status = 'Cookies ร่าง'
                            if (select_domaingroup[0].status_cookie_id == 2) {
                                fs.rename(`./${process.env.FOLDER_FILESUPLOAD}/file_domain/` + select_domaingroup[0].dg_file + '.js', `./${process.env.FOLDER_FILESUPLOAD}/file_domain/` + select_domaingroup[0].dg_file + '_close' + '.js', function (err) {
                                    if (err) throw err;
                                });
                            }
                        } else if (data.status == 2) {
                            status = 'Cookies ใช้งาน'
                            if (select_domaingroup[0].status_cookie_id == 3 || select_domaingroup[0].status_cookie_id == 1) {
                                fs.rename(`./${process.env.FOLDER_FILESUPLOAD}/file_domain/` + select_domaingroup[0].dg_file + '_close' + '.js', `./${process.env.FOLDER_FILESUPLOAD}/file_domain/` + select_domaingroup[0].dg_file + '.js', function (err) {
                                    if (err) throw err;
                                });
                            }
                        } else {
                            status = 'Cookies ยกเลิก'
                            if (select_domaingroup[0].status_cookie_id == 2) {
                                fs.rename(`./${process.env.FOLDER_FILESUPLOAD}/file_domain/` + select_domaingroup[0].dg_file + '.js', `./${process.env.FOLDER_FILESUPLOAD}/file_domain/` + select_domaingroup[0].dg_file + '_close' + '.js', function (err) {
                                    if (err) throw err;
                                });
                            }
                        }
                        conn.query("INSERT INTO TB_TR_LOG_HISTORY SET log_action = 'เปลี่ยนสถานะ',log_detail=?,user_id=?,domain_id=?",
                            [status, req.session.userid, data.id_dg], (err, insert_log_history) => { });
                    }
                    conn.query('UPDATE  TB_TR_DOMAINGROUP SET namedomain_dg=?, message=?,name_cookie=?,status_cookie_id=? WHERE id_dg = ? ',
                        [data.namedomain_dg, data.message, data.name_cookie, data.status, data.id_dg], (err, editdomaingroup) => {
                            conn.query("DELETE FROM TB_MM_DOMAIN_SETTING_TAG  WHERE domaingroup_id=?",
                                [data.id_dg], (err, delete_domain_setting_tag) => {
                                    if (data.tag) {
                                        if (!Array.isArray(data.tag)) {
                                            data.tag = new Array(data.tag)
                                        }
                                        for (let i = 0; i < data.tag.length; i++) {
                                            conn.query("INSERT INTO TB_MM_DOMAIN_SETTING_TAG SET domaingroup_id=?,tag_id=? ",
                                                [data.id_dg, data.tag[i]], (err, insert_log_history) => { });
                                        }
                                    }
                                });
                            controller.create_banner(req, data.id_dg)
                            funchistory.funchistory(req, "cookies", `แก้ไขข้อมูล โดเมน ${select_domaingroup[0].namedomain_dg}`, req.session.userid)
                            res.redirect('/management/cookies');
                        });
                });
        });
    } else {
        res.redirect("/");
    }
};

controller.add_status_domain = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        var { text } = req.params;
        var { id } = req.params;
        var status_name = "";
        if (text == "Cookiesยกเลิก") {
            status_name = 3;
        } else if (text == "Cookiesใช้งาน") {
            status_name = 2;
        } else {
            status_name = 1;
        }
        req.getConnection((err, conn) => {
            conn.query("UPDATE TB_TR_DOMAINGROUP SET status_cookie_id=? WHERE id_dg=?",
                [status_name, id], (err, update_domaingroup) => {
                    res.redirect("/management/cookies");
                });
        });
    } else {
        res.redirect("/");
    }
};

controller.create_banner = (req, id) => {
    var host = process.env.COOKIE_DOMAIN
    req.getConnection((err, conn) => {
        conn.query("SELECT * FROM  TB_TR_DOMAIN_SETTING_COOKIEPOLICY as dsc LEFT JOIN TB_TR_COOKIEPOLICY AS c ON dsc.cookiepolicy_id=c.id_cp  where dsc.domain_id=? AND check_show=1 AND id_status!=4;", [id], (err, domain_setting_cookiepolicy) => {
            conn.query("SELECT *,doc.doc_id as cookie_policy FROM TB_TR_DOMAIN_STYLE_POLICY as dsp  LEFT JOIN TB_TR_STYLES as st ON dsp.style_id=st.id_st LEFT JOIN TB_TR_DOMAINGROUP as dg ON dsp.domaingroup_id=dg.id_dg LEFT JOIN TB_TR_PDPA_DOCUMENT as doc ON dg.doc_id=doc.doc_id where domaingroup_id=?;", [id], (err, domain_style_policy) => {
                var cookie_policy = ""
                if (domain_style_policy[0].doc_status == 2 && domain_style_policy[0].doc_action == 0) {
                    cookie_policy = `${host + `/show_slide/` + domain_style_policy[0].cookie_policy}`;
                } else {
                    cookie_policy = '#javascript:void(0)'
                }
                var domain = "";
                if (domain_style_policy[0].status_cookie_id == 1 || domain_style_policy[0].status_cookie_id == 3) {
                    domain = domain_style_policy[0].dg_file + "_close.js"
                } else {
                    domain = domain_style_policy[0].dg_file + ".js"
                }
                var background_popup = "";
                var color_text = "";
                var background = "";
                var color_desc = "";
                var color_title = "";
                var color_footer = "";
                var color_lcc_porfile = "";
                var background_popup_policy = "";
                if (domain_style_policy[0].nameclass == "light") {
                    color_text = "#000"
                    background_popup = "#ffffff"
                    background = "#fffe";
                    background_popup_policy = "#f0f0f0";
                    color_desc = "#000";
                    color_title = "#000";
                    color_footer = "#999";
                    color_lcc_porfile = "#333";
                } else {
                    color_text = "#fff"
                    background_popup = "#263238"
                    background = "#263238";
                    background_popup_policy = "#808080";
                    color_desc = "#fff"
                    color_title = "#fff";
                    color_footer = "#fff";
                    color_lcc_porfile = "#fff";
                }
                var x = "`"
                var ikeys = []
                var form_consents = '';
                var true_callback = '';
                var cookie_items = '';
                var minikeys = '';
                var saved_consents = '';
                var match = '';
                var consents_true = ''
                var consents_false = ''
                var val = ''
                console.log("minikeys", minikeys);
                var yyyyy = `
                'th': {
                'reject_link': 'ปิดโดยไม่ยอมรับทั้งหมด',
                'accept_button': 'ยอมรับทั้งหมด',
                'reject_button': 'ไม่ยอมรับทั้งหมด',
                'save_button': 'บันทึกการตั้งค่า',
                'setting_button': 'ตั้งค่าคุกกี้',
                'readmore': 'เรียนรู้เพิ่มเติม',
                'popup_header': 'ตั้งค่าความเป็นส่วนตัว',
                'popup_message': '',
                'popup_title': 'กำหนดความยินยอมคุกกี้',
                'policy_title': 'Cookie Policy (นโยบายคุ้กกี้)',
                `;
                for (let i = 0; i < domain_setting_cookiepolicy.length; i++) {
                    var xxx = "`" + domain_setting_cookiepolicy[i].detail_cookie + "`"
                    if (i + 1 != domain_setting_cookiepolicy.length) {
                        yyyyy +=
                            `                  
                cookietype_${domain_setting_cookiepolicy[i].id_dsc}: {
                title: '${domain_setting_cookiepolicy[i].name_cookietype}',
                desc: ${xxx},
                },
                `
                    } else {
                        yyyyy +=
                            `
                'cookietype_${domain_setting_cookiepolicy[i].id_dsc}': {
                title: '${domain_setting_cookiepolicy[i].name_cookietype}',
                desc: ${xxx},
                },
                }
                `
                    }

                    ikeys.push(`
                'cookietype_${domain_setting_cookiepolicy[i].id_dsc}' 
                `
                    )
                    form_consents += 'cookietype_' + domain_setting_cookiepolicy[i].id_dsc + ":" + domain_setting_cookiepolicy[i].approve + ","
                    true_callback += 'cookietype_' + domain_setting_cookiepolicy[i].id_dsc + ":" + "[]" + ","
                    cookie_items += `{
                key:'cookietype_${domain_setting_cookiepolicy[i].id_dsc}'
                },`

                    minikeys += `
                                            type_${domain_setting_cookiepolicy[i].id_dsc}:'cookietype_${domain_setting_cookiepolicy[i].id_dsc}'
                                            `
                    match += `type_${domain_setting_cookiepolicy[i].id_dsc}(0|1)`
                    saved_consents += `
                cookietype_${domain_setting_cookiepolicy[i].id_dsc}:(match[${i + 1}]=='1') ? 1:0,
                `
                    consents_true += `
                cookietype_${domain_setting_cookiepolicy[i].id_dsc}:1,
                `
                    consents_false += `
                cookietype_${domain_setting_cookiepolicy[i].id_dsc}:0,
                `
                    if (i + 1 != domain_setting_cookiepolicy.length) {
                        val += `'type_${domain_setting_cookiepolicy[i].id_dsc}'+(consents.cookietype_${domain_setting_cookiepolicy[i].id_dsc} ?'1':'0')+`
                    } else {
                        val += `'type_${domain_setting_cookiepolicy[i].id_dsc}'+(consents.cookietype_${domain_setting_cookiepolicy[i].id_dsc} ?'1':'0')`
                    }
                }


                var sss = `
                :root {
                --lcc_color:${x}+ customize.color +${x};
                }            .cookie-flexLR {
                display: flex;
                justify-content: space-between;
                flex-wrap: nowrap;
                }
                .clear {
                clear: both;
                }
                #lcc_setting {
                margin: auto;
                text-align: left;
                }
                #lcc_setting .fa.icon-chevron-right,
                #lcc_setting .fa.icon-chevron-down {
                color: #999;
                }
                #lcc_setting .close_link {
                height: 22px;
                width: 22px;
                position: relative;
                color: #34aaff;
                cursor: pointer;
                }
                #lcc_setting .close_link::before,
                #lcc_setting .close_link::after {
                content: "";
                height: 0px;
                width: 22px;
                border-bottom: 2px solid #34aaff;
                position: absolute;
                top: 10px;
                left: 0;
                }
                #lcc_setting .close_link::before {
                transform: rotate(45deg);
                }
                #lcc_setting .close_link::after {
                transform: rotate(135deg);
                }
                #lcc_setting .custom_font {
                font-family: 'sukhumvit set', 'Prachason', 'sans-serif', 'tahoma';
                }
                #lcc_setting .lcc_setting_header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0;
                flex-wrap: wrap;
                }
                #lcc_setting .lcc_setting_header b {
                font-size: 24px;
                color: ${color_text};
                margin: 0;
                }
                #lcc_setting .lcc_setting_body {
                margin: 1em 0;
                }
                #lcc_setting .lcc_setting_body a:hover {
                text-decoration: none;
                }
                #lcc_setting .lcc_setting_body label {
                font-size: 18px;
                font-weight: bold;
                margin: 1em 0 0;
                color:${color_text};
                }
                #lcc_setting .lcc_setting_body .lcc_profile,
                #lcc_setting .lcc_setting_body .lcc_setting_type {
                background: ${background_popup_policy};
                border-radius: 10px;
                margin: 1em 0;
                }

                #lcc_setting .lcc_setting_body .lcc_profile {
                color: ${color_lcc_porfile};
                padding: 12px 24px;
                font-size: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                }
                #lcc_setting .lcc_setting_body .lcc_profile .bullet {
                width: 8px;
                height: 8px;
                border-top: 2px solid #999;
                border-right: 2px solid #999;
                color: #999;
                margin-right: 10px;
                transform: rotate(45deg);
                padding: 0;
                }
                #lcc_setting .lcc_setting_body .lcc_profile img {
                width: 50px;
                max-height: 50px;
                border-radius: 50px;
                vertical-align: middle;
                margin-right: 20px;
                float: left;
                }
                #lcc_setting .lcc_setting_body .lcc_profile b {
                display: block;
                margin: 5px 0 0;
                }
                #lcc_setting .lcc_setting_body .lcc_profile .minor {
                color: ${color_text};
                font-size: 14px;
                }
                #lcc_setting .lcc_setting_body p {
                flex-basis: 100%;
                color: #9e9e9e;
                margin: 1em 0;
                }
                #lcc_setting .lcc_setting_body .setting {
                display: flex;
                padding: 16px 24px;
                line-height: normal;
                justify-content: space-between;
                align-items: start;
                flex-wrap: nowrap;
                border-bottom: 1px solid #e0e0e0;
                }
                #lcc_setting .lcc_setting_body .setting:last-child {
                border-bottom: 0;
                }
                #lcc_setting .lcc_setting_body .setting .title {
                color: ${color_title};
                font-size: 16px;
                cursor: pointer;
                }
                #lcc_setting .lcc_setting_body .setting .title .bullet {
                width: 8px;
                height: 8px;
                border-top: 2px solid #999;
                border-right: 2px solid #999;
                transform: rotate(45deg);
                color: #999;
                padding: 0;
                margin-right: 20px;
                display: inline-block;
                transition: transform .3s;
                }
                #lcc_setting .lcc_setting_body .setting.show_desc .title .bullet {
                transform: rotate(135deg);
                }
                #lcc_setting .lcc_setting_body .setting .desc {
                color: ${color_desc};
                font-size: 13px;
                line-height: 1.5;
                margin-top: 10px;
                padding-left: 35px;
                display: none;
                }
                #lcc_setting .lcc_setting_body .setting.show_desc .desc {
                display: block;
                }
                #lcc_setting .lcc_setting_body .setting .switch {
                position: relative;
                display: inline-block;
                box-sizing: border-box;
                width: 50px;
                height: 30px;
                margin: 0 0 0 40px;
                padding: 3px;
                cursor: pointer;
                transition: 0.5s;
                text-align: right;
                vertical-align: middle;
                color: #ccc;
                border-radius: 20px;
                background: #dce5e9 none;
                }
                #lcc_setting .lcc_setting_body .setting .switch.switchOn {
                background-color: #00aeef;
                }
                #lcc_setting .lcc_setting_body .setting .switch:after {
                position: absolute;
                left: 3px;
                display: inline-block;
                width: 24px;
                height: 24px;
                content: '';
                transition: left 0.3s;
                border-radius: 50%;
                background: white;
                }
                #lcc_setting .lcc_setting_body .setting .switch.switchOn:after {
                left: 23px;
                }
                #lcc_setting .lcc_setting_body .setting .switch.disableSwitch:after {
                background-repeat: no-repeat;
                background-position: center center;
                background-size: 12px;
                }
                #lcc_setting .lcc_setting_body .setting .switch.disableSwitch {
                cursor: not-allowed;
                user-select: none;
                }

                @media screen and (max-width: 720px) {
                #lcc_setting .lcc_setting_header {
                padding: 0 16px;
                }
                #lcc_setting .lcc_setting_header b {
                flex-basis: 100%;
                order: 1;
                }
                #lcc_setting .lcc_setting_header a {
                flex-basis: 100%;
                order: 3;
                text-align: center;
                }
                #lcc_setting .lcc_setting_body {
                margin: 2em 0;
                }
                #lcc_setting .lcc_setting_body p {
                order: 2;
                margin-top: 1em;
                margin-bottom: 2em;
                }
                #lcc_setting .lcc_setting_body .setting {
                align-items: flex-start;
                padding: 24px 16px;
                }
                #lcc_setting .lcc_setting_body .setting .switch {
                margin-left: 20px;
                }
                }
                body.alltra_cookie_consent_popup-open {
                overflow: hidden;
                }
                #alltra_cookie_consent_popup {
                padding: 10px 30px;
                background: #0006 none;
                height: 100%;
                width: 100%;
                box-sizing: border-box;
                position: fixed;
                z-index: 2222222222;
                top: 0;
                left: 0;
                overflow-y: auto;
                }

                #alltra_cookie_consent_popup .alltra_cookie_consent_preference_popup {
                background-color: ${background_popup};
                border-radius: 30px;
                padding: 30px 0;
                max-width: 720px;
                margin: auto;
                }

                .alltra_cookie_consent_preference_popup #lcc_setting .lcc_setting_header,
                .alltra_cookie_consent_preference_popup #lcc_setting .lcc_setting_body,
                .alltra_cookie_consent_preference_popup #lcc_setting .lcc_setting_footer {
                padding-left: 40px;
                padding-right: 40px;
                }
                .alltra_cookie_consent_preference_popup #lcc_setting .lcc_setting_footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: ${color_footer};
                }
                .alltra_cookie_consent_preference_popup #lcc_setting .save_button,
                .alltra_cookie_consent_preference_popup #lcc_setting .accept_button,
                .alltra_cookie_consent_preference_popup #lcc_setting .reject_button{
                display: inline-block;
                background: var(--lcc_color);
                font-size: 16px;
                font-weight: 600;
                color: #fff;
                padding: 12px 25px;
                border-radius: 5px;
                text-decoration: none;
                box-sizing: border-box;
                white-space: nowrap;
                cursor: pointer;
                }
                .alltra_cookie_consent_preference_popup #lcc_setting .reject_button{
                background: transparent;
                border: 1px solid var(--lcc_color);
                color: var(--lcc_color);
                margin-right: 10px;
                }
                .alltra_cookie_consent_preference_popup .close {
                display: inline-block;
                background: #fff;
                border: 1px solid #e0e0e0;
                color: #00aeef;
                font-size: 14px;
                padding: 8px 16px;
                border-radius: 8px;
                }
                .alltra_cookie_consent_preference_popup .close:hover {
                text-decoration: none;
                }

                #alltra_cookie_consent_banner {
                background: ${background};
                border-radius: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: nowrap;
                padding: 20px 30px;
                width: 95vw;
                max-width: 800px;
                -webkit-animation: lcc-bounce-up 1s ease;
                position: fixed;
                bottom: 18px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 2099999999;
                gap: 40px;
                font-family: 'Sukhumvit Set', MS Sans Serif,sans-serif,Tahoma,Arial;
                box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.1);
                box-sizing: border-box;
                -webkit-backdrop-filter: saturate(200%) blur(20px);
                backdrop-filter: saturate(200%) blur(20px);
                }

                @keyframes lcc-bounce-up {
                0% {
                opacity: 0;
                -webkit-transform: translateX(-50%) translateY(25px);
                transform: translateX(-50%) translateY(25px);
                }

                50% {
                opacity: 1;
                -webkit-transform: translateX(-50%) translateY(-5px);
                transform: translateX(-50%) translateY(-5px);
                }

                100% {
                opacity: 1;
                -webkit-transform: translateX(-50%) translateY(0px);
                transform: translateX(-50%) translateY(0px);
                }
                }
                #alltra_cookie_consent_banner .cookie_info {
                display: flex;
                flex-wrap: nowrap;
                align-items: center;
                line-height: normal;
                }
                #alltra_cookie_consent_banner .cookie_info img {
                max-width: 100px;
                max-height: 70px;
                margin-right: 24px;
                }
                #alltra_cookie_consent_banner .cookie_info b {
                font-size: 20px;
                margin: 0 0 10px 0;
                display: block;
                color: ${color_text};
                }
                #alltra_cookie_consent_banner .cookie_info p {
                font-size: 14px;
                margin: 0;
                color:${color_text};
                }
                
                #alltra_cookie_consent_banner .cookie_info u {
                    color: ${color_text};
                }

                #alltra_cookie_consent_banner .cookie_info a {
                font-size: 14px;
                margin: 0;
                color: #009efb;
                }

                #alltra_cookie_consent_banner .cookie_action {
                font-size: 14px;
                text-align: right;
                align-self: flex-end;
                }
                #alltra_cookie_consent_banner .cookie_action .cookie_button {
                display: flex;
                flex-wrap: nowrap;
                flex-direction: row-reverse;
                gap: 10px;
                align-items: center;
                justify-content: space-between;
                margin-top: 10px;
                }
                #alltra_cookie_consent_banner .cookie_action .cookie_button .accept_button,
                #alltra_cookie_consent_banner .cookie_action .cookie_button .setting_button {
                white-space: nowrap;
                flex: 1;
                display: block;
                background: var(--lcc_color);
                font-size: 16px;
                font-weight: 600;
                color: #fff;
                padding: 12px 25px;
                border-radius: 5px;
                text-decoration: none;
                box-sizing: border-box;
                cursor: pointer;
                }
                #alltra_cookie_consent_banner .cookie_action .cookie_button .setting_button {
                background: #eee;
                color: #666;
                }
                #alltra_cookie_consent_banner .cookie_action .cookie_button .accept_button:hover {
                background: var(--lcc_color));
                text-decoration: none;
                }
                #alltra_cookie_consent_banner .cookie_action .reject_link {
                color: var(--lcc_color);
                font-size: 14px;
                text-decoration: none;
                }
                #alltra_cookie_consent_banner .cookie_action .reject_link:hover {
                color: var(--lcc_color);
                text-decoration: underline;
                }
                #alltra_cookie_consent_banner.hide_reject_link .cookie_action .reject_link {
                display:none;
                }

                #alltra_cookie_consent_banner.position_left_bottom {

                flex-wrap: wrap;
                padding: 12px;
                border-radius: 12px;
                gap: 0;
                width: 360px;
                left: 220px;
                }
                #alltra_cookie_consent_banner.position_left_bottom .cookie_info {
                flex-basis: 100%;
                padding: 8px 16px 0;
                align-items: flex-start;
                position: relative;
                }
                #alltra_cookie_consent_banner.position_left_bottom .cookie_info img {
                max-height: 30px;
                position: absolute;
                right: 0px;
                margin-right: 16px;
                }
                #alltra_cookie_consent_banner.position_left_bottom .cookie_info h2 {
                font-size: 16px !important;
                }
                #alltra_cookie_consent_banner.position_left_bottom .cookie_action {
                flex-basis: 100%;
                margin-left: 0;
                display: flex;
                flex-wrap: wrap;
                flex-direction: column-reverse;
                text-align: center;
                }
                #alltra_cookie_consent_banner.position_left_bottom .cookie_action a.reject_link {
                padding: 10px 0;
                margin: 0 16px;
                }
                #alltra_cookie_consent_banner.position_left_bottom .cookie_action a.reject_link:hover {
                padding-top: 10px;
                padding-bottom: 10px;
                }
                #alltra_cookie_consent_banner.position_left_bottom .cookie_action .cookie_button {
                display: block;
                flex-direction: row;
                gap: 0;
                padding: 8px 16px 0;
                font-size: 16px;
                }
                #alltra_cookie_consent_banner.position_left_bottom .cookie_action .cookie_button .accept_button,
                #alltra_cookie_consent_banner.position_left_bottom .cookie_action .cookie_button .setting_button {
                margin-bottom: 10px;
                }

                @media screen and (max-width: 720px) {
                #alltra_cookie_consent_banner.position_left_bottom {
                left: 50%;
                }
                #alltra_cookie_consent_banner {
                flex-wrap: wrap;
                padding: 12px;
                border-radius: 12px;
                gap: 0;
                }
                #alltra_cookie_consent_banner .cookie_info {
                flex-basis: 100%;
                padding: 8px 16px 0;
                align-items: flex-start;
                position: relative;
                }
                #alltra_cookie_consent_banner .cookie_info img {
                max-height: 30px;
                position: absolute;
                right: 0px;
                margin-right: 16px;
                }
                #alltra_cookie_consent_banner .cookie_info h2 {
                font-size: 16px !important;
                }
                #alltra_cookie_consent_banner .cookie_action {
                flex-basis: 100%;
                margin-left: 0;
                display: flex;
                flex-wrap: wrap;
                flex-direction: column-reverse;
                text-align: center;
                }
                #alltra_cookie_consent_banner .cookie_action a.reject_link {
                padding: 10px 0;
                margin: 0 16px;
                }
                #alltra_cookie_consent_banner .cookie_action a.reject_link:hover {
                padding-top: 10px;
                padding-bottom: 10px;
                }
                #alltra_cookie_consent_banner .cookie_action .cookie_button {
                display: block;
                flex-direction: row;
                gap: 0;
                padding: 8px 16px 0;
                font-size: 16px;
                }
                #alltra_cookie_consent_banner .cookie_action .cookie_button .accept_button,
                #alltra_cookie_consent_banner .cookie_action .cookie_button .setting_button {
                margin-bottom: 10px;
                }
                #alltra_cookie_consent_popup {
                padding: 10px 0 0;
                }
                #alltra_cookie_consent_popup .alltra_cookie_consent_preference_popup {
                border-radius: 15px 15px 0 0;
                }
                .alltra_cookie_consent_preference_popup #lcc_setting .lcc_setting_header,
                .alltra_cookie_consent_preference_popup #lcc_setting .lcc_setting_body,
                .alltra_cookie_consent_preference_popup #lcc_setting .lcc_setting_footer {
                padding-left: 24px;
                padding-right: 24px;
                font-size: 12px;
                }
                .alltra_cookie_consent_preference_popup #lcc_setting .lcc_setting_header {
                flex-wrap: nowrap;
                flex-direction: row-reverse;
                }
                #lcc_setting .lcc_setting_body .lcc_profile b {
                font-size: 14px;
                }
                .cookie-flexLR {
                flex-wrap: wrap;
                gap: 15px;
                }
                .alltra_cookie_consent_preference_popup #lcc_setting .cookie-all-button {
                flex-basis: 100%;
                display: flex;
                justify-content: space-between;
                gap: 15px;
                }
                .alltra_cookie_consent_preference_popup #lcc_setting .accept_button,
                .alltra_cookie_consent_preference_popup #lcc_setting .reject_button {
                flex-grow: 1;
                text-align: center;
                }
                .alltra_cookie_consent_preference_popup #lcc_setting .reject_button {
                margin-right: 0;
                }
                #lcc_setting .lcc_setting_body .setting .title {
                font-size: 16px;
                }
                #lcc_setting .lcc_setting_body .setting .title .bullet {
                margin-right: 10px;
                }
                                        }`;

                var html =
                    `
                <div class="alltra_cookie_consent_preference_popup">
                <div id="lcc_setting">
                <div class="lcc_setting_header">
                <b class="custom_font">${x}+ texts.popup_header + ${x}</b>
                <div class="close_link"></div>
                </div>
                <div class="lcc_setting_body">${x}+ (data.policy_url ? ${x}
                <a href="${x} + data.policy_url + ${x}" target="_blank" class="lcc_profile">
                <div style="flex-grow: 1">
                  <img src="${x} + data.web_avatar+ ${x}" width="50" height="50">
                  <b>${x} +texts.policy_title + ${x}</b>
                  <span class="minor">${x} + data.web_domain + ${x}</span>
                  <div class="clear"></div>
                </div>
                <div class="bullet"></div>
                </a>${x}: '') + ${x}
                <p>${x} + texts.popup_message + ${x}</p>
                <div class="cookie-flexLR">
                <label>${x} + texts.popup_title + ${x}</label>
                <div class="cookie-all-button">
                  <div class="reject_button custom_font">${x} + texts.reject_button + ${x}</div>
                  <div class="accept_button custom_font">${x} + texts.accept_button + ${x}</div>
                </div>
                </div>
                <div class="clear"></div>
                <div class="lcc_setting_type"></div>
                </div>
                <div class="lcc_setting_footer">
                <div>
                PDPA Cookie Consent Management
                </div>
                <div class="save_button custom_font">${x} + texts.save_button + ${x}</div>
                <input type="hidden" id="domain" value="${id}">
                </div>
                </div>
                </div>
                `
                var banner = `
                <div class="cookie_info">
                <img src="${x}+ customize.image +${x}">
                <div>
                <p>
                 ${x} + customize.desc + ${x}
                <a href="#" style="color: #666;" class="readmore"><u>${x}+ texts.readmore + ${x}</u></a>
                </p>
                </div>
                </div>
                <div class="cookie_action">
                <a href="#" class="reject_link">${x}+ texts.reject_link + ${x}</a>
                <div class="cookie_button custom_font">
                <div class="accept_button">${x}+ texts.accept_button + ${x}</div> <div class="setting_button">${x} + texts.setting_button + ${x}</div>
                <input type="hidden" id="domain" value="${id}">
                </div>
                </div>`;
                var value = '${value}'
                var desc = domain_style_policy[0].detail_dialog
                var js_file_popup = `(function (){`;
                js_file_popup +=
                    `
                    var Name = "${domain_style_policy[0].dg_file}"
                    function encode(s) {
                        var chrsz = 8; var hexcase = 0; function safe_add(x, y) { var lsw = (x & 0xFFFF) + (y & 0xFFFF); var msw = (x >> 16) + (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xFFFF); }
                        function S(X, n) { return (X >>> n) | (X << (32 - n)); }
                        function R(X, n) { return (X >>> n); }
                        function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
                        function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
                        function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
                        function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
                        function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
                        function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }
                        function core_sha256(m, l) {
                            var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2); var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19); var W = new Array(64); var a, b, c, d, e, f, g, h, i, j; var T1, T2; m[l >> 5] |= 0x80 << (24 - l % 32); m[((l + 64 >> 9) << 4) + 15] = l; for (var i = 0; i < m.length; i += 16) {
                                a = HASH[0]; b = HASH[1]; c = HASH[2]; d = HASH[3]; e = HASH[4]; f = HASH[5]; g = HASH[6]; h = HASH[7]; for (var j = 0; j < 64; j++) { if (j < 16) W[j] = m[j + i]; else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]); T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]); T2 = safe_add(Sigma0256(a), Maj(a, b, c)); h = g; g = f; f = e; e = safe_add(d, T1); d = c; c = b; b = a; a = safe_add(T1, T2); }
                                HASH[0] = safe_add(a, HASH[0]); HASH[1] = safe_add(b, HASH[1]); HASH[2] = safe_add(c, HASH[2]); HASH[3] = safe_add(d, HASH[3]); HASH[4] = safe_add(e, HASH[4]); HASH[5] = safe_add(f, HASH[5]); HASH[6] = safe_add(g, HASH[6]); HASH[7] = safe_add(h, HASH[7]);
                            }
                            return HASH;
                        }
                        function str2binb(str) {
                            var bin = Array(); var mask = (1 << chrsz) - 1; for (var i = 0; i < str.length * chrsz; i += chrsz) { bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32); }
                            return bin;
                        }
                        function Utf8Encode(string) {
                           var utftext = ''; for (var n = 0; n < string.length; n++) {
                                var c = string.charCodeAt(n); if (c < 128) { utftext += String.fromCharCode(c); }
                                else if ((c > 127) && (c < 2048)) { utftext += String.fromCharCode((c >> 6) | 192); utftext += String.fromCharCode((c & 63) | 128); }
                                else { utftext += String.fromCharCode((c >> 12) | 224); utftext += String.fromCharCode(((c >> 6) & 63) | 128); utftext += String.fromCharCode((c & 63) | 128); }
                            }
                            return utftext;
                        }
                        function binb2hex(binarray) {
                            var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef'; var str = ''; for (var i = 0; i < binarray.length * 4; i++) {
                                str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                                    hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
                            }
                            return str;
                        }
                        s = Utf8Encode(s); return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
                    }

                    var browser = (function (agent) {
                        switch (true) {
                            case agent.indexOf("edge") > -1: return "edge";
                            case agent.indexOf("edg/") > -1: return "edge"; // Match also / to avoid matching for the older Edge
                            case agent.indexOf("opr") > -1 && !!window.opr: return "opera";
                            case agent.indexOf("chrome") > -1 && !!window.chrome: return "chrome";
                            case agent.indexOf("trident") > -1: return "ie";
                            case agent.indexOf("firefox") > -1: return "firefox";
                            case agent.indexOf("safari") > -1: return "safari";
                            default: return "other";
                        }
                    })(window.navigator.userAgent.toLowerCase());


                    if (encode(window.location.hostname) == Name) {
                var w = window, d = document;
                var app = d.createElement('div');
                var banner = d.createElement('div');
                var popup = d.createElement('div');
                var is_append_app = false;
                var is_append_popup = false;
                var is_append_banner = false;
                var ikeys =[${ikeys}];
                var form_consents = {${form_consents}};
                var data = {
                policy_url: '${cookie_policy}',
                web_avatar: '${host}/UI/image/robot.png',
                web_domain: '${domain_style_policy[0].namedomain_dg}',
                web_ukey: 'alltra',
                cpath: '/',
                lang: 'th'                          
                }
                var langs = {
                ${yyyyy}
                }                       
                var customize = {
                position: 'bottom',
                color: '#007bff',
                title: 'เราใช้คุกกี้ !',
                image: '${host}/UI/image/cookie.png',
                desc: ${x}${desc}${x},
                close_button: 0,
                default_consents: {
                ${form_consents}
                }
                }
                var true_callback = {
                ${true_callback}
                }
                var false_callback = {
                ${true_callback}
                }

                if (typeof w._lckd !== 'undefined') {
                w._lckd.forEach(function (ddd) {
                if (ddd[0] == 'config') {
                var dddd = ddd[1];
                Object.keys(dddd).forEach(function (dkey) {
                    var dval = dddd[dkey];
                    if (dkey === 'customize') {
                        Object.keys(dval).forEach(function (ckey) {
                            customize[ckey] = dval[ckey];
                        });
                    } else if (typeof data[dkey] !== 'undefined') {
                        data[dkey] = dval;
                    }
                });
                } else {
                var dkey = ddd[0];
                var dval = ddd[1];
                if (dkey == 'customize') {
                    Object.keys(dval).forEach(function (ckey) {
                        customize[ckey] = dval[ckey];
                    });
                } else if (typeof data[dkey] !== 'undefined') {
                    data[dkey] = dval;
                } else if (typeof form_consents[dkey] !== 'undefined') {
                    if (dval) {
                        true_callback[dkey].push(ddd[2]);
                    } else {
                        false_callback[dkey].push(ddd[2]);
                    }
                }
                }
                });
                }

                Object.keys(customize.default_consents).forEach(function (ikey) {
                if (ikeys.indexOf(ikey) > -1) {
                form_consents[ikey] = customize.default_consents[ikey];
                }
                });

                var texts = langs[data.lang] || langs.th;
                var cookie_items = [${cookie_items}];

                function setCookie(cname, cvalue, exdays) {
                const ddd = new Date();
                ddd.setTime(ddd.getTime() + (exdays * 24 * 60 * 60 * 1000));
                let expires = "expires=" + ddd.toUTCString();
                var ccc = cname + "=" + cvalue + ";" + expires + ";path=" + data.cpath + ";SameSite=Lax";
                //console.info(ccc);
                d.cookie = ccc;
                //console.info(d.cookie);
                }
                function resetCookie(cname) {
                const ddd = new Date();
                ddd.setTime(0);
                let expires = "expires=" + ddd.toUTCString();
                d.cookie = cname + "=;" + expires + ";path=" + data.cpath + ";SameSite=None;Secure";
                }
                function getCookie(cname) {
                let name = cname + "=";
                let decodedCookie = decodeURIComponent(d.cookie);
                let ca = decodedCookie.split(';');
                for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
                }
                }
                return "";
                }

                var saved_consents = null;
                var cookie_key = data.web_ukey;
                var tmp = getCookie(cookie_key);

                if (tmp !== '') {
                tmp = w.atob(tmp);
                var match = tmp.match(/^${match}$/);
                if (match) {
                saved_consents = {
                ${saved_consents}
                }

                Object.keys(saved_consents).forEach(function (ikey) {
                if (ikeys.indexOf(ikey) > -1) {
                form_consents[ikey] = saved_consents[ikey];
                }
                });
                }
                }
                function run_consents(update_consents) {
                if (is_append_app) {
                d.body.removeChild(app);
                is_append_app = false;
                d.body.classList.remove('alltra_cookie_consent_popup-open');
                }
                }
                function action_new_consents(kkk) {
                var new_consents = get_consents(kkk);
                var old_consents = {};
                if (saved_consents === null) {
                old_consents = customize.default_consents;
                } else {
                old_consents = saved_consents;
                }
                var update_consents = {};
                Object.keys(new_consents).forEach(function (ikey) {
                if (new_consents[ikey] != old_consents[ikey]) {
                update_consents[ikey] = new_consents[ikey];
                }
                });
                run_consents(update_consents);
                Object.keys(new_consents).forEach(function (ikey) {
                if (ikeys.indexOf(ikey) > -1) {
                form_consents[ikey] = new_consents[ikey];
                }
                });
                return new_consents;
                }
                app.id = 'alltra_cookie_consent';
                banner.id = 'alltra_cookie_consent_banner';
                if (customize.position == 'left_bottom') {
                banner.classList.add('position_left_bottom');
                }
                if (!customize.close_button) {
                banner.classList.add('hide_reject_link');
                }
                banner.innerHTML =${x}${banner}${x}

                var sss = d.createElement('style');
                sss.type = 'text/css';
                sss.innerHTML=${x}${sss}${x}
                app.appendChild(sss);
                var is_inited_popup = false;
                popup.id = 'alltra_cookie_consent_popup';
                var setting_type_eles = {};

                function show_detail(e) {
                if (e) {
                e.preventDefault();
                }
                if (!is_inited_popup) {
                var html =
                ${x}
                ${html}
                ${x};
                popup.innerHTML = html;
                var setting_type = popup.querySelector('.lcc_setting_type');

                cookie_items.forEach(function (item) {
                var ele = d.createElement('div');
                ele.dataset.ikey = item.key;
                ele.className = 'setting';
                var title = texts[item.key].title;
                var desc = texts[item.key].desc;
                var value = texts[item.key].value;
                ele.innerHTML =${x}
                <div>
                <div class="title"><span class="bullet"></span>   ${x}+ title +  ${x}</div>
                <div class="desc">  ${x}+ desc +   ${x}</div >
                <input type="hidden" id="test8" value="${value}" class="value">
                </div>
                <div class="setting_switch">
                <div class="switch  ${x}+ (item.force ? ' switchOn disableSwitch' : (form_consents[item.key] ? ' switchOn' : '')) +   ${x}"></div>
                </div>${x};

                ele.querySelector('.title').addEventListener('click', function (e) {
                var it = e.target.closest('.setting');
                if (it.classList.contains('show_desc')) {
                it.classList.remove('show_desc');
                } else {
                it.classList.add('show_desc');
                }
                });
                ele.querySelector('.switch').addEventListener('click', function (e) {
                var sw = e.target;
                if (!sw.classList.contains('disableSwitch')) {
                var it = sw.closest('.setting');
                if (sw.classList.contains('switchOn')) {
                form_consents[it.dataset.ikey] = 0;
                sw.classList.remove('switchOn');
                } else {
                form_consents[it.dataset.ikey] = 1;
                sw.classList.add('switchOn');
                }
                }
                });
                setting_type_eles[item.key] = ele;
                setting_type.appendChild(ele);
                });
                popup.querySelector('.close_link').addEventListener('click', close_popup);
                popup.querySelector('.reject_button').addEventListener('click', reject_all);
                popup.querySelector('.accept_button').addEventListener('click', accept_all);
                popup.querySelector('.save_button').addEventListener('click', accept_custom);
                is_inited_popup = true;
                } else {
                ikeys.forEach(function (ikey) {
                if (form_consents[ikey]) {
                setting_type_eles[ikey].querySelector('.switch').classList.add('switchOn');
                } else {
                setting_type_eles[ikey].querySelector('.switch').classList.remove('switchOn');
                }
                })

                }
                app.appendChild(popup);
                is_append_popup = true;
                if (!is_append_app) {
                d.body.appendChild(app);
                is_append_app = true;
                }
                d.body.classList.add('alltra_cookie_consent_popup-open');
                }


                w.show_detail = show_detail;

                function close_popup() {
                app.removeChild(popup);
                is_append_popup = false;
                d.body.classList.remove('alltra_cookie_consent_popup-open');
                }

                function reject_all(e) {
                var id = document.getElementById('domain').value
                e.preventDefault();
                var consents = action_new_consents(false);
                save_data(consents, id,"reject_all");
                }
                function accept_all(e) {
                var id = document.getElementById('domain').value
                e.preventDefault();
                var consents = action_new_consents(true);
                save_data(consents, id,"accept_all");
                }
                function accept_custom(e) {
                var id = document.getElementById('domain').value
                e.preventDefault();
                var consents = action_new_consents(form_consents);
                save_data(consents, id,"accept_custom");
                }
                function get_consents(kkk) {
                var consents = {};
                if (kkk === true) {
                consents = {${consents_true}
                }
                } else if (kkk === false) {
                consents = {${consents_false}}
                } else {
                if (saved_consents === null) {
                consents = JSON.parse(JSON.stringify(customize.default_consents));
                } else {
                consents = JSON.parse(JSON.stringify(saved_consents));
                }
                ikeys.forEach(function (ikey) {
                if (typeof kkk[ikey] !== 'undefiend') {
                consents[ikey] = kkk[ikey];
                }
                });
                }
                return consents;
                }
                function save_data(kkk, t,status) {
                    let xhr = new XMLHttpRequest();
                    xhr.open("POST", "${process.env.COOKIE_API}");
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader("Content-Type", "application/json");
                    // xhr.onload = () => console.log(xhr.responseText);
                    xhr.send(JSON.stringify({ t, kkk,status,browser}));


                if (kkk === null) {
                resetCookie(cookie_key);
                saved_consents = null;

                Object.keys(customize.default_consents).forEach(function (ikey) {
                if (ikeys.indexOf(ikey) > -1) {
                form_consents[ikey] = customize.default_consents[ikey];
                }
                });
                }else {
                var consents = get_consents(kkk);
                var val = ${val};
                val = w.btoa(val);
                setCookie(cookie_key, val, 1);
                saved_consents = consents;

                Object.keys(saved_consents).forEach(function (ikey) {
                if (ikeys.indexOf(ikey) > -1) {
                form_consents[ikey] = saved_consents[ikey];
                }
                });
                }
                }
                banner.querySelector('.readmore').addEventListener('click', show_detail);
                banner.querySelector('.setting_button').addEventListener('click', show_detail);
                banner.querySelector('.reject_link').addEventListener('click', reject_all);
                banner.querySelector('.accept_button').addEventListener('click', accept_all);
                d.addEventListener("DOMContentLoaded", function () {
                if (saved_consents === null) {
                app.appendChild(banner);
                is_append_banner = true;
                d.body.appendChild(app);
                is_append_app = true;
                } else {
                run_consents(saved_consents);
                }
                });
                } else {
                    alert("ติดตั้ง script ไม่ตรงกับโดเมนที่ลงทะเบียน")
                }
                })()
                `
                fs.writeFile(`./${process.env.FOLDER_FILESUPLOAD}/file_domain/${domain}`, js_file_popup, function (err, file) {
                    if (err) throw err;
                });
            });
        });
    });
}

module.exports = controller;
