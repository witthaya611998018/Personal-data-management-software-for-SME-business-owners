const controller = {};
const { validationResult } = require('express-validator');
const path = require('path');
const uuidv4 = require('uuid').v4;
const addDate = require("../utils/addDate")
controller.list = (req, res) => {
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM `TB_TR_DEVICE` WHERE device_id NOT IN (SELECT device_id FROM `TB_TR_DEL_DEVICE`)', (err, device_list) => {
                conn.query('SELECT date_format(TB_TR_HISTORY.datetime,"%b %d %T")as date,TB_TR_HISTORY.msg,TB_TR_ACCOUNT.name FROM `TB_TR_HISTORY` JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY TB_TR_HISTORY.datetime DESC', (err, history) => {
                    req.session.history = history;
                    if (err) {
                        res.json(err);
                    }

                    res.render('./device/device_list', {
                        data: device_list,
                        session: req.session

                    });
                });
            });
        });
    }
};
controller.blocklist = (req, res) => {
    const data = req.body;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM `TB_TR_BLOCKED`', (err, blocked_list) => {
                conn.query('SELECT date_format(TB_TR_HISTORY.datetime,"%b %d %T")as date,TB_TR_HISTORY.msg,TB_TR_ACCOUNT.name FROM `TB_TR_HISTORY` JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY TB_TR_HISTORY.datetime DESC', (err, history) => {
                    req.session.history = history;
                    if (err) {
                        res.json(err);
                    }

                    res.render('./device/blocked_list', {
                        data: blocked_list,
                        session: req.session

                    });
                });
            });
        });
    }
};
controller.allow = (req, res) => {
    const data = req.body;
    const { id } = req.params;
    console.log(data);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM `TB_TR_BLOCKED` WHERE input_id =? ', [id], (err, allow_list) => {
                conn.query('SELECT date_format(TB_TR_HISTORY.datetime,"%b %d %T")as date,TB_TR_HISTORY.msg,TB_TR_ACCOUNT.name FROM `TB_TR_HISTORY` JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY TB_TR_HISTORY.datetime DESC', (err, history) => {
                    req.session.history = history;
                    if (err) {
                        res.json(err);
                    }

                    res.render('./device/device_allow', {
                        data: allow_list,
                        session: req.session

                    });
                });
            });
        });
    }
};
controller.input = (req, res) => {
    const data = req.body;

    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT i.input_id,i.input_ip,date_format(i.date,"%Y-%m-%d") as date,i.hostname,i.type FROM TB_TR_INPUT as i WHERE i.input_id NOT IN (SELECT input_id FROM `TB_TR_BLOCKED`) AND i.input_id NOT IN (SELECT input_id FROM `TB_TR_DEVICE`)', (err, device_list) => {
                conn.query('SELECT date_format(TB_TR_HISTORY.datetime,"%b %d %T")as date,TB_TR_HISTORY.msg,TB_TR_ACCOUNT.name FROM `TB_TR_HISTORY` JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY TB_TR_HISTORY.datetime DESC', (err, history) => {
                    req.session.history = history;
                    if (err) {
                        res.json(err);
                    }

                    res.render('./device/device_input', {
                        data: device_list,
                        session: req.session

                    });
                });
            });
        });
    }
};
controller.block = (req, res) => {
    const { id } = req.params;
    const data = req.body;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT `input_id`, `input_ip`,date_format(date,"%Y-%m-%d") as date, `hostname`, `type` FROM `TB_TR_INPUT` WHERE input_id = ?', [id], (err, device_block) => {
                conn.query('SELECT date_format(TB_TR_HISTORY.datetime,"%b %d %T")as date,TB_TR_HISTORY.msg,TB_TR_ACCOUNT.name FROM `TB_TR_HISTORY` JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY TB_TR_HISTORY.datetime DESC', (err, history) => {
                    req.session.history = history;
                    if (err) {
                        res.json(err);
                    }

                    res.render('./device/device_block', {
                        data: device_block,
                        session: req.session

                    });
                });
            });
        });
    }
};
controller.blocked = (req, res) => {
    const { id } = req.params;
    id2 = req.session.userid
    const data = req.body;
    date2 = addDate();
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO `TB_TR_BLOCKED` (`b_id`, `b_ip`, `hostname`, `type`,`input_id`) VALUES (NULL, ?, ?, ?,?)', [data.input_ip, data.hostname, data.type, data.id], (err, device_blocked) => {
                conn.query('SELECT date_format(CURDATE(),"%Y-%m-%d") as mouth,CURTIME() as time,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL ? DAY),"%Y-%m-%d") as mouth2', [data.keep], (err, date) => {
                    var day1 = [date[0].mouth + " " + date[0].time]
                    var day2 = [date[0].mouth2 + " " + date[0].time]
                    conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE acc_id = ?  ', [req.session.userid], (err, account) => {
                        var msg = account[0].name + " ระงับอุปกรณ์ " + data.hostname
                        type = "blocked";
                        // conn.query('INSERT INTO `TB_TR_HISTORY` (`acc_id`, `datetime`, `msg`, `ht_id`, `type`) VALUES (?, ?, ?, NULL, ?);', [id2, date2, msg, type], (err, history_add) => {
                            // console.log(device_blocked);
                            if (err) {
                                res.json(err);
                            }

                            res.redirect('/device/input');
                        });
                    // });
                });
            });
        });

    }
};
controller.delblocked = (req, res) => {
    id2 = req.session.userid
    const { id } = req.params;
    const data = req.body;
    date2 = addDate();
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM `TB_TR_BLOCKED` WHERE `TB_TR_BLOCKED`.`input_id` = ?;', [id], (err, blocked) => {
                conn.query('DELETE FROM `TB_TR_BLOCKED` WHERE `TB_TR_BLOCKED`.`input_id` = ?;', [id], (err, device_delblocked) => {
                    conn.query('SELECT date_format(CURDATE(),"%Y-%m-%d") as mouth,CURTIME() as time,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL ? DAY),"%Y-%m-%d") as mouth2', [data.keep], (err, date) => {
                        var day1 = [date[0].mouth + " " + date[0].time]
                        var day2 = [date[0].mouth2 + " " + date[0].time]
                        conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE acc_id = ?  ', [req.session.userid], (err, account) => {
                            //console.log(account);
                            var msg = [account[0].name + " ยกเลิกการระงับอุปกรณ์ " + blocked[0].hostname]
                            type = "delblocked";
                            // conn.query('INSERT INTO `TB_TR_HISTORY` (`acc_id`, `datetime`, `msg`, `ht_id`, `type`) VALUES (?, ?, ?, NULL, ?);', [id2, date2, msg, type], (err, history_add) => {

                                if (err) {
                                    res.json(err);
                                }
                                res.redirect('/device/blocklist');
                            // });
                        });
                    });
                });
            });
        });
    }
};
controller.network = (req, res) => {
    const data = req.body;
    //res.json(data);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO TB_MM_SET_SYSTEM set ?', [data], (err, network_new) => {
                console.log(network_new);
                if (err) {
                    res.json(err);
                }
                res.redirect('index');
            });
        });
    }
};
controller.new = (req, res) => {
    const { id } = req.params;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT `input_id`, `input_ip`,date_format(date,"%Y-%m-%d") as date, `hostname`, `type` FROM `TB_TR_INPUT` WHERE input_id = ?', [id], (err, device_delete) => {
                if (err) {
                    res.json(err);
                }
                res.render('./device/device_new', {
                    data: device_delete,
                    session: req.session
                });
            });
        });
    }
};
controller.add = (req, res) => {
    const data = req.body;
    date = addDate();
    const errors = validationResult(req);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        if (!errors.isEmpty()) {
            req.session.errors = errors;
            req.session.success = false;
            res.redirect('/device/new/' + data.input_id);
        } else {
            req.session.success = true;
            req.session.topic = "เพิ่มข้อมูลสำเร็จ";
            req.getConnection((err, conn) => {
                if (req.files) {
                    var filename = req.files.img;
                    if (!filename.map) {
                        var newfilename = uuidv4() + "." + filename.name.split(".")[1];
                        console.log(newfilename);
                        const savePath = path.join(__dirname, '../public/UI/image', newfilename);
                        filename.mv(savePath);
                        console.log(savePath);
                    }
                    data.image = newfilename;
                }
                conn.query('SELECT date_format(CURDATE(),"%Y-%m-%d") as mouth,CURTIME() as time,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL ? DAY),"%Y-%m-%d") as mouth2', [data.keep], (err, date) => {
                    var day1 = [date[0].mouth + " " + date[0].time]
                    var day2 = [date[0].mouth2 + " " + date[0].time]
                    if (data) {
                        data.rmfile = day2;
                    }
                    conn.query('INSERT INTO `TB_TR_DEVICE` (`device_id`, `status`, `de_type`, `data_type`, `sender`, `keep`, `rmfile`, `hostname`, `name`, `spec`, `location_bu`, `backup`, `de_ip`, `eth`, `hash`, `input_id`, `image`) VALUES (NULL, ?,  ?,  ?,  ?,  ?, ?,  ?,  ?,  ?,  ?,  ?,  ?, ?,  ?,  ?,  ?);', [data.status, data.de_type, data.data_type, data.sender, data.keep, data.rmfile, data.hostname, data.name, data.spec, data.location_bu, data.backup, data.de_ip, data.eth, data.hash, data.input_id, data.image], (err, device_add) => {
                        conn.query('SELECT * FROM `TB_TR_DEVICE` WHERE input_id = ?  ', [data.input_id], (err, device) => {
                            // conn.query('INSERT INTO `checktime` (`check_id`, `device_id`, `time`, `sendmail`) VALUES (NULL, ?, ?, "0");', [device[0].device_id, data.time], (err, checktime) => {
                            conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE acc_id = ?  ', [req.session.userid], (err, account) => {
                                // console.log(checktime);
                                var msg = [account[0].name + " เพิ่มอุปกรณ์ในระบบโดยใช้ชื่อ " + data.name]
                                type = "adddevice"
                                conn.query('INSERT INTO `TB_TR_HISTORY` (`acc_id`, `datetime`, `msg`, `ht_id`, `type`) VALUES (?, ?, ?, NULL, ?);', [req.session.userid, date, msg, type], (err, history_add) => {
                                    res.redirect('/device/input');
                                });
                            });
                            // });
                        });
                    });
                });
            });
        }
    }
};

controller.delete = (req, res) => {
    const { id } = req.params;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_DEVICE where device_id = ?', [id], (err, device_delete) => {
                if (err) {
                    res.json(err);
                }
                res.render('./device/device_del', {
                    data: device_delete,
                    session: req.session
                });
            });
        });
    }
};

controller.confirmdelete = (req, res) => {
    const { id } = req.params;
    res.json(id)
    const errors = validationResult(req);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {

        req.getConnection((err, conn) => {
            conn.query('INSERT INTO `TB_TR_DEL_DEVICE` (`del_id`, `device_id`) VALUES (NULL, ?);', [id], (err, device_confirmdelete) => {

                console.log(device_confirmdelete);
                if (err) {
                    res.json(err);
                } else {
                    res.send({ data2: ["OkPacket"] })
                }
            });
        });

    }
};

controller.view = (req, res) => {
    const data = req.body;
    const { id } = req.params;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_DEVICE WHERE device_id = ?', [id], (err, device) => {
                conn.query('SELECT * FROM `checktime` WHERE device_id= ?', [id], (err, checktime) => {
                    console.log(checktime);
                    res.render('./device/device_view', {
                        data: device,
                        data2: checktime,
                        session: req.session
                    });
                });
            });
        });
    }
};
controller.edit = (req, res) => {
    const data = req.body;
    const { id } = req.params;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_DEVICE WHERE device_id = ?', [id], (err, device) => {
                conn.query('SELECT * FROM `TB_TR_CHECKTIME` WHERE device_id= ?', [id], (err, checktime) => {
                    // console.log(device);
                    res.render('./device/device_edit', {
                        // data: device_edit,
                        data: device,
                        data2: checktime,
                        session: req.session
                    });
                });
            });
        });
    }
};
controller.save = (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const errors = validationResult(req);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        if (!errors.isEmpty()) {
            req.session.errors = errors;
            req.session.success = false;
            res.redirect('/device/edit/' + id)
        } else {
            req.session.success = true;
            req.session.topic = "แก้ไขข้อมูลสำเร็จ";
            req.getConnection((err, conn) => {
                if (req.files) {
                    var filename = req.files.img;
                    console.log('sssssssssssssssss');
                    if (!filename.map) {
                        var newfilename = uuidv4() + "." + filename.name.split(".")[1];
                        console.log(newfilename);
                        const savePath = path.join(__dirname, '../public/UI/image', newfilename);
                        filename.mv(savePath);
                        console.log(savePath);
                    }
                    data.image = newfilename;
                }

                console.log(id);
                conn.query('SELECT date_format(CURDATE(),"%Y-%m-%d") as mouth,CURTIME() as time,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL ? DAY),"%Y-%m-%d") as mouth2', [data.keep], (err, date) => {
                    var day1 = [date[0].mouth + " " + date[0].time]
                    var day2 = [date[0].mouth2 + " " + date[0].time]
                    if (data) {
                        data.rmfile = day2;
                    }
                    console.log(data);
                    conn.query('UPDATE TB_TR_DEVICE SET status =?, de_type =?, data_type =?, sender =?, keep =?, rmfile =?, hostname =?, name =?, spec =?, location_bu =?, backup =?, de_ip =?, eth =?, hash =?, input_id =?, image=? WHERE device_id = ? ', [data.status, data.de_type, data.data_type, data.sender, data.keep, data.rmfile, data.hostname, data.name, data.spec, data.location_bu, data.backup, data.de_ip, data.eth, data.hash, data.input_id, data.image, id], (err, device_save) => {
                        conn.query('UPDATE `TB_TR_checktime` SET `sendmail` = "0",`time`=? WHERE `checktime`.`device_id` = ? ', [data.time, id], (err, checktime) => {

                            console.log(device_save);
                            if (err) {
                                res.json(err);
                            }
                            res.redirect('/device/list');
                        });
                    });
                });
            });
        }
    }

}

module.exports = controller;