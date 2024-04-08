const session = require("express-session");
const uuidv4 = require('uuid').v4;
const fs = require('fs');
const controller = {};

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


controller.saveTag = (req, res) => {
    if (typeof req.session.userid != "undefined" || typeof req.session.userid != null) {
        getRandomColor()
        const data = req.body;
        var myObj = JSON.parse(data.tag_dg); // เเปลง  [{"value":"5555"},{"value":"6666"}]' ให้เป็น ["5555","6666"]
        var dta_json_tag = [];
        for (var i = 0; i < myObj.length; i++) {
            dta_json_tag.push(myObj[i].value);

        }
        req.getConnection((err, conn) => {
            conn.query("INSERT INTO TB_TR_LOG_HISTORY SET log_action ='สร้าง Tag',log_detail=?,user_id =?",
                [JSON.stringify(dta_json_tag), req.session.user_id_u], (err, insert_log_history) => { });
        });
        req.getConnection((err, conn) => {
            for (var i = 0; i < dta_json_tag.length; i++) {
                conn.query('INSERT INTO  TB_MM_PDPA_TAG_DOMAIN SET tag_name=? ,tag_styles=?',
                    [dta_json_tag[i], getRandomColor()], (err, INSERT_tag) => { });
            }
            res.redirect('/management/cookies');
        });
    } else {
        res.redirect("/");
    }
};

controller.deleteTag = (req, res) => {
    if (typeof req.session.userid != "undefined" || typeof req.session.userid != null) {
        var { id } = req.params;
        req.getConnection((err, conn) => {
            conn.query("DELETE FROM TB_MM_DOMAIN_SETTING_TAG WHERE tag_id=? ", [id], (err, delete_domain_setting_tag) => {
                conn.query("DELETE FROM TB_MM_PDPA_TAG_DOMAIN WHERE id_tag=? ", [id], (err, delete_pdpa_tag) => {
                    res.redirect('/management/cookies');
                });
            });
        });
    } else {
        res.redirect("/");
    }

}


controller.editTag = (req, res) => {
    if (typeof req.session.userid != "undefined" || typeof req.session.userid != null) {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("UPDATE TB_MM_PDPA_TAG_DOMAIN SET tag_name=? WHERE id_tag=? ", [data.tag_name, data.id_tag],
                (err, delete_domain_setting_tag) => {
                    res.redirect("/management/cookies");
                });
        });
    } else {
        res.redirect("/");
    }
};


controller.api_tag = (req, res) => {
    if (typeof req.session.userid != "undefined" || typeof req.session.userid != null) {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_MM_PDPA_TAG_DOMAIN",
                (err, tag) => {
                    res.send(tag);
                });
        });
    } else {
        res.redirect("/");
    }
};


controller.api_tag_search = (req, res) => {
    if (typeof req.session.userid != "undefined" || typeof req.session.userid != null) {
        const data = req.body;
        var search = '%' + data.data + '%';
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_MM_PDPA_TAG_DOMAIN WHERE  tag_name LIKE ? ", [search],
                (err, tag) => {
                    if (tag[0]) {
                        res.send(tag);
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


module.exports = controller;
