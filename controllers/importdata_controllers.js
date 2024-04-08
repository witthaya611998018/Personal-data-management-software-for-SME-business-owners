const controller = {};
const { validationResult } = require('express-validator');
const fs = require('fs');
const addDate = require("../utils/addDate")

controller.download = (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    var acc_id = req.session.userid;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        res.download('E:\Web\sniff copy\snifflog.rar');
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO `TB_TR_EXPORTHISTORY` (`exp_id`, `acc_id`, `file_id`) VALUES (NULL, ?, ?);', [acc_id, id], (err, exporthistory) => {
                conn.query('SELECT MAX(date_format(date,"%Y-%m-%d")) as date,TB_TR_LOG.device_id,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 1 DAY),"%Y-%m-%d") as date2 FROM `TB_TR_LOG`', (err, date) => {
                    day1 = date[0].date + ' 00:00:00';
                    day2 = date[0].date + ' 23:59:59';
                    conn.query('SELECT TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.device_id = ? and TB_TR_LOG.date BETWEEN ? AND ? ORDER BY `TB_TR_LOG`.`date` DESC LIMIT 1000 ', [date[0].device_id, day1, day2], (err, log_list) => {
                        conn.query('SELECT hour(TB_TR_LOG.date) as no,COUNT(*) as num FROM `TB_TR_LOG` WHERE device_id = ? and TB_TR_LOG.date BETWEEN ? AND ? GROUP BY hour(TB_TR_LOG.date)', [date[0].device_id, day1, day2], (err, count_list) => {
                            conn.query('SELECT date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.device_id as device_id FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_LOG.device_id=TB_TR_DEVICE.device_id GROUP BY TB_TR_DEVICE.device_id', (err, device_list) => {
                                if (err) {
                                    res.json(err);
                                }
                                res.render('./log/filelog', {
                                    data: log_list,
                                    data2: count_list,
                                    data3: device_list,
                                    session: req.session
                                });
                            });

                        });
                    });
                });
            });
        });
    }
};
controller.list = (req, res) => {
    const data = null;
    id = req.session.userid;
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT ftp_id,date_format(create_date,"%d/%m/%Y %T") as create_date ,date_format(import_date,"%Y-%m-%d %T") as import_date,name,descrip,path,type_import,password,ip,username,type_file FROM `TB_TR_IMPORT` ORDER BY create_date', (err, ftp) => {
                conn.query('SELECT * FROM TB_TR_PDPA_AGENT_MANAGE pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id ORDER BY agm_id DESC;', (err, agent) => {
                res.render('./import/ftp_list', {
                    data: ftp,
                    agent: agent,
                    session: req.session
                });

            });
        });
    });
    }
};

controller.views_import = (req, res) => {
    const { id } = req.params;
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT imf.id,imf.name,imf.import_id,imf.rname,imf.status,DATE_FORMAT(imf.date, "%d-%m-%Y %H:%i:%S") as date,im.type_import as type FROM TB_TR_IMPORT_FILE as imf JOIN TB_TR_IMPORT as im on imf.import_id = im.ftp_id WHERE imf.import_id = ?',[id], (err, data) => {
                res.render('./import/views_import', {
                    data: data,
                    id:id,
                    session: req.session
                });
            });
        });
    }
};
controller.import_file = (req, res) => {
    const raw = fs.readFileSync('public/UI/dist/import_file/78e17fcc-34cc-4921-bea8-e2c77343e0ea_FormExcel_19.csv', 'utf8');
    const data  = raw.split(/\r?\n/);
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
    }
};


controller.create = (req, res) => {
    const data = req.body;
    const date = addDate();
    if (data.type_import == 'agent') {
        delete data.username;
        delete data.password;
    }else if (data.type_import == 'ftp') {
        delete data.select_agent;
    }
    if (data.agent_manage_id == '') {
        data.agent_manage_id = 0
    }
    data.create = 0;
    if (data.type_file == 'log' && data.type_import == 'ftp') {
    req.getConnection((err, conn) => {
        conn.query("INSERT INTO `DOL_PDPA_LOCAL`.`TB_TR_DEVICE` (`device_id`, `status`, `de_type`, `data_type`, `sender`, `keep`, `rmfile`, `hostname`, `name`, `location_bu`, `backup`, `de_ip`, `eth`, `hash`, `input_id`, `image`) VALUES (NULL, 'เตรียม', 'เครื่องแม่ข่าย', 'ข้อมูลจราจรทางคอมพิวเตอร์จากการเชื่อมต่อเข้าถึงระบบเครือข่าย (Internet Access)', 'UDP', '120', ?, ?, ?, '0', '0', 'localhost', 'Eth0', '1', '92', 'log_ftp.png');", [date,data.name,data.name], (err, de) => {
        conn.query("INSERT INTO `DOL_PDPA_LOCAL`.`TB_TR_IMPORT` (`name`, `descrip`, `create_date`, `path`, `type_import`, `username`, `password`, `create`, `agent_manage_id`, `type_file`, `device_id`) VALUES (?, ?, ?, ?, ?, ?, ?, '0', '0', 'log', ?);", [data.name,data.descrip,date,data.path,data.type_file,data.username,data.password,de.insertId], (err, ftp) => {
            if (err) {
                res.json(err);
            }
            res.redirect('/import');
        });
    });
    });
    }else{
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO TB_TR_IMPORT set ?', [data], (err, ftp) => {
                if (err) {
                    res.json(err);
                }
                res.redirect('/import');
            });
        });
    }
    
    
};
controller.deleteftp = (req, res) => {
    const { id } = req.params;
    // res.json(id)

    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('DELETE FROM `tb_tr_import` WHERE `tb_tr_import`.`ftp_id` = ?', [id], (err, device_delete) => {
                if (err) {
                    res.json(err);
                }
                res.redirect('/import');
            });
        });
    }
};
controller.alert = (req, res) => {
    const data = null;
    id = req.session.userid;
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM `TB_TR_DEVICE`', (err, device) => {
                conn.query('SELECT TB_TR_ALERT.alert_id,TB_TR_ALERT.name,TB_TR_ALERT.type_alert,TB_TR_ALERT.services,TB_TR_ALERT.disk,TB_TR_ALERT.system,TB_TR_ALERT.web,TB_TR_ALERT.day,TB_TR_ALERT.enable,TB_TR_DEVICE.name as devicename,TB_TR_ALERT.device_id as device_id,TB_TR_DEVICE.image,TB_TR_ALERT.acc_id FROM `TB_TR_ALERT` LEFT JOIN TB_TR_DEVICE ON TB_TR_ALERT.device_id=TB_TR_DEVICE.device_id', (err, alert) => {
                    conn.query('SELECT * FROM `TB_TR_ACCOUNT`', (err, account) => {
                        conn.query('SELECT COUNT( * ) as count FROM `TB_TR_HISTORY_ALERT` WHERE MONTH(date) =MONTH(CURDATE())', (err, history_alert) => {
                            conn.query('SELECT COUNT( * ) as enable FROM `TB_TR_ALERT`WHERE TB_TR_ALERT.enable = 1', (err, enable) => {
                                conn.query('SELECT COUNT( * ) as disable FROM `TB_TR_ALERT`WHERE TB_TR_ALERT.enable = 0', (err, disable) => {
                                    conn.query('SELECT COUNT( * ) as count FROM `TB_TR_ALERT`', (err, COUNT) => {
                                        conn.query('SELECT COUNT( * ) as count FROM `TB_TR_HISTORY_ALERT` ', (err, history) => {

                                            // console.log(acc_id);
                                            res.render('./import/alert_list', {
                                                data: alert,
                                                data2: account,
                                                data6: device,
                                                data3: history_alert,
                                                data4: enable,
                                                data5: disable,
                                                data7: COUNT,
                                                data8: history,
                                                session: req.session
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
controller.createalert = (req, res) => {
    const data = req.body;
    if (data.day < 1) {
        data.day = 0
    }
    id = (data.acc_id).toString();
    data.acc_id = id
        // console.log(id);
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO TB_TR_ALERT set ?', [data], (err, alert) => {
                if (err) {
                    res.json(err);

                }
                res.redirect('/alert');
            });
        });
    }
};
controller.updatealert = (req, res) => {
    const data = req.body;
    const { id } = req.params;
    if (data) {
        if (data.day < 1) {
            data.day = 0
        } else if (data.enable == 'on') {
            data.enable = 1
        } else {
            data.enable = 0
            data.enable = data.day
        }
    }
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('UPDATE TB_TR_ALERT set ? WHERE `TB_TR_ALERT`.`alert_id` =  ?', [data, id], (err, alert) => {
                if (err) {
                    res.json(err);
                }
                res.redirect('/alert');
            });
        });
    }
};
controller.dellert = (req, res) => {
    const data = req.body;
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('DELETE FROM `TB_TR_ALERT` WHERE `TB_TR_ALERT`.`alert_id` =  ?', [data.alert_id], (err, alert) => {
                if (err) {
                    res.json(err);
                }
                res.redirect('/alert');
            });
        });
    }
};
module.exports = controller;