const session = require("express-session");
const controller = {};
controller.api_report_appeal = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        req.getConnection((err, conn) => {
            conn.query("SELECT *, DATE_FORMAT(appeal_date_approve,'%d/%m/%Y %H:%i:%s')  day_approve,DATE_FORMAT(appeal_date,'%d/%m/%Y %H:%i:%s') day,appeal_contact,CONCAT(prefix_name,appeal_firstname,' ',appeal_lastname) as name, DATE_FORMAT(appeal_date,'%d/%m/%Y') appeal_date,DATE_FORMAT(appeal_date_approve,'%d/%m/%Y') appeal_date_approve FROM  TB_TR_PDPA_APPEAL as app left join TB_MM_PREFIX as pre ON app.prefix_id=pre.prefix_id where appeal_approved_complaint  between 1 and 2  AND  DATE_FORMAT(appeal_date_approve,'%Y-%m')= DATE_FORMAT(now(),'%Y-%m') order by id_ap DESC ", (err, data_table) => {
                if (data_table.length > 0) {
                    res.send({ data_table });
                } else {
                    res.send("ไม่มีข้อมูล");
                }

            });
        });
    } else {
        res.redirect("/");
    }
};

controller.api_report_appeal_search_text = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(appeal_date_approve,'%d/%m/%Y %H:%i:%s')  day_approve,DATE_FORMAT(appeal_date,'%d/%m/%Y %H:%i:%s') day,appeal_contact,CONCAT(prefix_name,appeal_firstname,' ',appeal_lastname) as name, DATE_FORMAT(appeal_date,'%d/%m/%Y') appeal_date,DATE_FORMAT(appeal_date_approve,'%d/%m/%Y') appeal_date_approve FROM  TB_TR_PDPA_APPEAL as app left join TB_MM_PREFIX as pre ON app.prefix_id=pre.prefix_id where appeal_approved_complaint  between 1 and 2 AND ((CONCAT(prefix_name,appeal_firstname,' ',appeal_lastname)=? OR appeal_firstname=?) OR appeal_detail=? OR  appeal_contact=? )  AND   (DATE_FORMAT(appeal_date, '%Y-%m-%d') BETWEEN ? 	AND ?  OR DATE_FORMAT(appeal_date_approve, '%Y-%m-%d') BETWEEN ? AND  ? ) order by id_ap DESC ",
                [data.text, data.text, data.text, data.text, data.firstDay, data.lastDay, data.firstDay, data.lastDay], (err, data_table) => {
                    if (data_table.length > 0) {
                        res.send({ data_table });
                    } else {
                        res.send(JSON.stringify("ไม่มีข้อมูล"));
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};


controller.api_report_appeal_search_date = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT *,DATE_FORMAT(appeal_date_approve,'%d/%m/%Y %H:%i:%s')  day_approve,DATE_FORMAT(appeal_date,'%d/%m/%Y %H:%i:%s') day,appeal_contact,CONCAT(prefix_name,appeal_firstname,' ',appeal_lastname) as name, DATE_FORMAT(appeal_date,'%d/%m/%Y') appeal_date,DATE_FORMAT(appeal_date_approve,'%d/%m/%Y') appeal_date_approve FROM  TB_TR_PDPA_APPEAL as app left join TB_MM_PREFIX as pre ON app.prefix_id=pre.prefix_id where appeal_approved_complaint  between 1 and 2 AND (DATE_FORMAT(appeal_date_approve,'%Y-%m-%d') BETWEEN ? AND ? or DATE_FORMAT(appeal_date,'%Y-%m-%d') BETWEEN ? AND ? )  order by id_ap DESC ",
                [data.firstDay, data.lastDay, data.firstDay, data.lastDay], (err, data_table) => {
                    if (data_table.length > 0) {
                        res.send({ data_table });
                    } else {
                        res.send(JSON.stringify("ไม่มีข้อมูล"));
                    }
                });
        });
    } else {
        res.redirect("/");
    }
};

module.exports = controller;