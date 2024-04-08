const controller = {};
const { validationResult } = require('express-validator');

controller.download = (req, res) => {
    const { id } = req.params;
    var acc_id = req.session.userid;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        res.download('E:\Web\sniff copy\snifflog.rar');
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO `TB_TR_EXPORTHISTORY` (`exp_id`, `acc_id`, `file_id`) VALUES (NULL, ?, ?);', [acc_id, id], (err, exporthistory) => {
                conn.query('SELECT MAX(date_format(date,"%Y-%m-%d")) as date,log.device_id,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 1 DAY),"%Y-%m-%d") as date2 FROM `log`', (err, date) => {
                    day1 = date[0].date + ' 00:00:00';
                    day2 = date[0].date + ' 23:59:59';
                    conn.query('SELECT log.msg as msg,date_format(log.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,log.file_name FROM `log` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=log.device_id WHERE log.device_id = ? and log.date BETWEEN ? AND ? ORDER BY `log`.`date` DESC LIMIT 1000 ', [date[0].device_id, day1, day2], (err, log_list) => {
                        conn.query('SELECT hour(log.date) as no,COUNT(*) as num FROM `log` WHERE device_id = ? and log.date BETWEEN ? AND ? GROUP BY hour(log.date)', [date[0].device_id, day1, day2], (err, count_list) => {
                            console.log(count_list);
                            conn.query('SELECT date_format(log.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,log.device_id as device_id FROM `log` JOIN TB_TR_DEVICE ON log.device_id=TB_TR_DEVICE.device_id GROUP BY TB_TR_DEVICE.device_id', (err, device_list) => {
                                console.log(exporthistory);
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
    console.log(id);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            var day = 0;
            conn.query('SELECT MAX(date_format(TB_TR_VIEWS.date,"%Y-%m-%d")) as date,TB_TR_VIEWS.device_id,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 0 DAY),"%Y-%m-%d") as date2 FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN device_member as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_VIEWS ON TB_TR_VIEWS.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id= ? GROUP BY dm.de_id ORDER BY TB_TR_VIEWS.date DESC LIMIT 1', [id], (err, date) => {
                conn.query('SELECT DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 0 DAY),"%Y-%m-%d") as date2', (err, date2) => {
                    if (date.length == 0) {
                        // console.log("if");
                        day1 = date2[0].date2 + ' 00:00:00';
                        day2 = date2[0].date2 + ' 23:59:59';
                        device_id = 0
                    } else {
                        // console.log("else");
                        day1 = date[0].date + ' 00:00:00';
                        day2 = date[0].date2 + ' 23:59:59';
                        device_id = date[0].device_id;
                    }
                    console.log(date);
                    console.log(day1, day2, device_id);
                    conn.query('SELECT date_format(TB_TR_VIEWS.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_VIEWS.source,TB_TR_VIEWS.destination,TB_TR_VIEWS.route,TB_TR_VIEWS.packet,TB_TR_VIEWS.time,TB_TR_VIEWS.protocol,TB_TR_VIEWS.msg,TB_TR_VIEWS.other,TB_TR_VIEWS.timestamp FROM `views` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_VIEWS.device_id WHERE TB_TR_VIEWS.device_id = ? and TB_TR_VIEWS.date BETWEEN ? AND ? ORDER BY `views`.`date` DESC LIMIT 1000', [device_id, day1, day2], (err, log_list) => {
                        // date = select log group by user on last day
                        // res.json(log_list)
                        conn.query('SELECT hour(TB_TR_VIEWS.date) as no,COUNT(*) as num,device.name,TB_TR_DEVICE.device_id FROM `views` JOIN device ON TB_TR_DEVICE.device_id=TB_TR_VIEWS.device_id WHERE TB_TR_DEVICE.device_id = ? and TB_TR_VIEWS.date BETWEEN ? AND ? GROUP BY hour(TB_TR_VIEWS.date)', [device_id, day1, day2], (err, count_list) => {
                            //count_list = select log group by hour on last day
                            conn.query('SELECT date_format(TB_TR_VIEWS.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_VIEWS.source,TB_TR_VIEWS.destination,TB_TR_VIEWS.route,TB_TR_VIEWS.packet,TB_TR_VIEWS.time,TB_TR_VIEWS.protocol, TB_TR_VIEWS.msg as msg,TB_TR_VIEWS.other FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN device_member as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_VIEWS ON TB_TR_VIEWS.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id= ? GROUP BY dm.de_id', [id], (err, device_list) => {
                                // console.log(count_list);
                                // console.log(device_list);

                                if (date.length == 0) {
                                    log_list = [];
                                    if (count_list.length == 0) {
                                        count_list = [];
                                    } else {
                                        count_list = count_list;
                                    }
                                    if (device_list.length == 0) {
                                        device_list = [];
                                    } else {
                                        device_list = device_list;
                                    }

                                }
                                console.log(count_list);
                                res.render('./userviews/centralized', {
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
controller.filelog = (req, res) => {
    const data = null;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            var day = 0;

            conn.query('SELECT MAX(date_format(date,"%Y-%m-%d")) as date,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 1 DAY),"%Y-%m-%d") as date2 FROM `file` ', (err, date) => {
                day1 = date[0].date + ' 00:00:00';
                day2 = date[0].date + ' 23:59:59';
                conn.query('SELECT * FROM `TB_TR_FILE` WHERE TB_TR_FILE.date BETWEEN ? AND ? ORDER BY `TB_TR_FILE`.`date` DESC LIMIT 1000 ', [day1, day2], (err, log_list) => {
                    conn.query('SELECT hour(TB_TR_FILE.date) as no,COUNT(*) as num FROM `TB_TR_FILE` WHERE TB_TR_FILE.date BETWEEN ? AND ? GROUP BY hour(TB_TR_FILE.date)', [day1, day2], (err, count_list) => {
                        conn.query('SELECT MAX(date_format(log.date,"%Y-%m-%d %T")) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,log.device_id as device_id FROM `log` JOIN TB_TR_DEVICE ON log.device_id=TB_TR_DEVICE.device_id GROUP BY TB_TR_DEVICE.device_id', (err, device_list) => {
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
    }
};
controller.search = (req, res) => {
    const data = req.body;
    const { id } = req.params;
    var day1 = ((data.date1).replace('T', ' '));
    var day2 = ((data.date2).replace('T', ' '));

    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            var day = 0;
            console.log(data.device_id, day1, day2);
            conn.query('SELECT * FROM `device` WHERE device_id =?', [data.device_id], (err, device) => {
                conn.query('SELECT log.msg as msg,date_format(log.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,log.file_name FROM `log` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=log.device_id WHERE log.device_id = ? and log.date BETWEEN ? AND ? ORDER BY `log`.`date` DESC ', [data.device_id, day1, day2], (err, log_list) => {
                    if (date.length == 0) {
                        device_id = 0
                    } else {
                        device_id = date[0].device_id;
                    }
                    conn.query('SELECT hour(log.date) as no,COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.device_id FROM `log` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=log.device_id WHERE TB_TR_DEVICE.device_id = ? and log.date BETWEEN ? AND ? GROUP BY hour(log.date)', [data.device_id, day1, day2], (err, count_list) => {
                        console.log(count_list);
                        conn.query('SELECT  MAX(date_format(log.date,"%Y-%m-%d %T")) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,log.device_id as device_id FROM `log` JOIN TB_TR_DEVICE ON log.device_id=TB_TR_DEVICE.device_id GROUP BY TB_TR_DEVICE.device_id', (err, device_list) => {
                            res.render('./log/centralized_check', {
                                data: log_list,
                                data2: count_list,
                                data3: device_list,
                                data4: device,
                                day1: day1,
                                day2: day2,
                                session: req.session
                            });
                        });
                    });
                });
            });

        });
    }
};
controller.check = (req, res) => {
    const data = null;
    const { id } = req.params;
    // res.json(id)

    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            var day = 0;
            conn.query('SELECT * FROM `TB_TR_DEVICE` WHERE device_id =?', [id], (err, device) => {
                conn.query('SELECT MAX(date_format(date,"%Y-%m-%d")) as date,log.device_id,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 0 DAY),"%Y-%m-%d") as date2 FROM `log` WHERE device_id =?', [id], (err, date) => {
                    if (date.length == 0) {
                        // console.log("if");
                        day1 = date2[0].date2 + ' 00:00:00';
                        day2 = date2[0].date2 + ' 23:59:59';
                        device_id = 0
                    } else {
                        // console.log("else");
                        day1 = date[0].date + ' 00:00:00';
                        day2 = date[0].date2 + ' 23:59:59';
                        device_id = date[0].device_id;
                    }
                    conn.query('SELECT log.msg as msg,date_format(log.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,log.file_name FROM `log` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=log.device_id WHERE log.device_id = ? and log.date BETWEEN ? AND ? ORDER BY `log`.`date` DESC LIMIT 1000 ', [date[0].device_id, day1, day2], (err, log_list) => {
                        conn.query('SELECT hour(log.date) as no,COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.device_id FROM `log` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=log.device_id WHERE TB_TR_DEVICE.device_id = ? and log.date BETWEEN ? AND ? GROUP BY hour(log.date)', [date[0].device_id, day1, day2], (err, count_list) => {
                            console.log(count_list);
                            conn.query('SELECT  MAX(date_format(log.date,"%Y-%m-%d %T")) as date,image,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,log.device_id as device_id FROM `log` JOIN TB_TR_DEVICE ON log.device_id=TB_TR_DEVICE.device_id GROUP BY TB_TR_DEVICE.device_id', (err, device_list) => {
                                res.render('./log/centralized_check', {
                                    data: log_list,
                                    data2: count_list,
                                    data3: device_list,
                                    data4: device,
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
controller.adduser = (req, res) => {
    const data = req.body;
    const errors = validationResult(req);
    //res.json(data);
    if (data.admin) {
        if (data.admin == 'on') {
            data.admin = 1;
        } else {
            data.admin = 0;
        }
    } else {
        data.admin = 0;
    }
    console.log("data.admin" + data.admin);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        if (!errors.isEmpty()) {
            req.session.errors = errors;
            req.session.success = false;
            res.redirect('/admin/new');
        } else {
            req.session.success = true;
            req.session.topic = "เพิ่มข้อมูลสำเร็จ";
            req.getConnection((err, conn) => {
                conn.query('INSERT INTO TB_TR_LOG (firstname,lastname,name,position,descrip,contact,ext,phone,email,line,username,password,admin ,bd) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [data.firstname, data.lastname, data.name, data.position, data.descrip, data.contact, data.ext, data.phone, data.email, data.line, data.username, data.password, data.admin, data.bd], (err, admin_add) => {
                    console.log(admin_add);
                    if (err) {
                        res.json(err);
                    }
                    res.redirect('/log/list');
                });
            });
        }
    }
};
controller.add = (req, res) => {
    const data = req.body;
    const errors = validationResult(req);
    //res.json(data);
    req.getConnection((err, conn) => {
        conn.query('INSERT INTO TB_TR_LOG (firstname,lastname,name,position,descrip,contact,ext,phone,email,line,username,password,admin ,bd) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [data.firstname, data.lastname, data.name, data.position, data.descrip, data.contact, data.ext, data.phone, data.email, data.line, data.username, data.password, 1, data.bd], (err, admin_add) => {
            console.log(admin_add);
            if (err) {
                res.json(err);
            }
            res.redirect('/login');
        });
    });
};
controller.delete = (req, res) => {
    const { id } = req.params;
    //res.json(id);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM `log` ORDER BY `log`.`date` DESC LIMIT 1000 where acc_id=?', [id], (err, admin_delete) => {
                if (err) {
                    res.json(err);
                }
                res.render('./log/del_log', {
                    data: admin_delete,
                    session: req.session
                });
            });
        });
    }
};
controller.del = (req, res) => {
    const { id } = req.params;
    //res.json(id);
    const errors = validationResult(req);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        if (!errors.isEmpty()) {
            req.session.errors = errors;
            req.session.success = false;
            res.redirect('/log/list' + id);
            console.log("if");
        } else {

            req.getConnection((err, conn) => {
                conn.query('DELETE FROM TB_TR_LOG WHERE acc_id=?', [id], (err, admin_confirmdelete) => {
                    if (err) {

                        req.session.test = "ไม่สามารถลบได้";
                        req.session.success = false;
                        res.redirect('/log/list');
                        return;
                    } else {
                        req.session.success = true;
                        req.session.topic = "ลบข้อมูลสำเร็จ";
                    }
                    console.log(admin_confirmdelete);
                    res.redirect('/log/list');
                });
            });
        }
    }
};
controller.access_history = (req, res) => {
    const data = req.body;
    const { id } = req.params;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%Y-%m-%d %T")as date ,TB_TR_HISTORY.msg,TB_TR_ACCOUNT.name FROM `TB_TR_HISTORY` JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY `TB_TR_HISTORY`.`datetime` DESC', [id], (err, history) => {
                console.log(history);
                res.render('./log/access_history', {
                    data: history,
                    session: req.session
                });
            });
        });
    }
};
controller.save = (req, res) => {
    const { id } = req.params;
    const data = req.body;
    //res.json(id);
    const errors = validationResult(req);
    if (data.admin) {
        if (data.admin == 'on') {
            data.admin = 1;
        } else {
            data.admin = 0;
        }
    } else {
        data.admin = 0;
    }
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        if (!errors.isEmpty()) {
            req.session.errors = errors;
            req.session.success = false;
            res.redirect('/log/edit/' + id)
        } else {
            req.session.success = true;
            req.session.topic = "แก้ไขข้อมูลสำเร็จ";
            req.getConnection((err, conn) => {
                conn.query('UPDATE TB_TR_LOG set firstname =?,lastname =?,name =?,position =?,descrip =?,contact =?,ext =?,phone =?,email =?,line =?,username =?,password =?,admin =? ,bd =? where acc_id = ?', [data.firstname, data.lastname, data.name, data.position, data.descrip, data.contact, data.ext, data.phone, data.email, data.line, data.username, data.password, data.admin, data.bd, id], (err, admin_save) => {
                    if (err) {
                        res.json(err);
                    }
                    console.log(data);
                    res.redirect('/log/list');
                });
            });
        }
    }

}
controller.exporthistory = (req, res) => {
    const data = req.body;
    req.getConnection((err, conn) => {
        req.getConnection((err, conn) => {
            conn.query('SELECT TB_TR_EXPORTHISTORY.exp_id,TB_TR_FILE.name,TB_TR_FILE.hash,TB_TR_ACCOUNT.name as acc_name,date_format(TB_TR_EXPORTHISTORY.date ,"%H:%m:%s %Y-%m-%d ") as date FROM `exporthistory` JOIN TB_TR_FILE ON TB_TR_FILE.file_id=TB_TR_EXPORTHISTORY.file_id JOIN TB_TR_ACCOUNT ON TB_TR_EXPORTHISTORY.acc_id=TB_TR_ACCOUNT.acc_id ORDER BY TB_TR_EXPORTHISTORY.exp_id DESC', (err, exporthistory) => {
                res.render('./log/exporthistory', {
                    data: exporthistory,
                    session: req.session
                });
            });
        });
    });
};
module.exports = controller;