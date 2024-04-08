const controller = {};
const { validationResult } = require('express-validator');
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const path = require('path');
var md5 = require('md5');
var sha1 = require('sha1');
var sha256 = require('sha256');
const funchistory = require('../controllers/account_controllers')
const addDate = require("../utils/addDate")

controller.update = (req, res) => {
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query('UPDATE  TB_MM_QUESTIONNAIRE SET Name1=?,emailAddress1=?,phone1=?,shortDescription1=? WHERE quest_id=?',
                [data.Name1, data.emailAddress1, data.phone1, data.shortDescription1, data.quest_id], (err, update) => {
                    if (err) { console.log(err); }
                    res.redirect('/setting/view');
                });
        });
    }
};

controller.new = (req, res) => {
    const data = req.body;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM `TB_MM_SET_SYSTEM` ORDER BY sys_id DESC LIMIT 1', (err, setting_list) => {
                conn.query('SELECT * FROM `TB_MM_TIMEZONE`', (err, setting) => {
                    conn.query('SELECT * FROM `TB_MM_SET_NETWORK` ORDER BY nw_id DESC LIMIT 1', (err, set_network) => {
                        if (err) {
                            res.json(err);
                        }

                        res.render('./setting/setting_list', {
                            data: setting_list,
                            data2: setting,
                            data3: set_network,
                            session: req.session

                        });
                    });
                });
            });
        });
    }
};
controller.view = (req, res) => {
    const data = req.body;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_MM_QUESTIONNAIRE LIMIT 1', (err, setting_list) => {
                if (err) { console.log(err); }
                res.render('./setting/setting_view', {
                    setting_list,
                    session: req.session
                });
            });
        });
    }
};
controller.construction = (req, res) => {
    const data = req.body;
    // if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM `TB_MM_SET_SYSTEM`ORDER BY sys_id DESC LIMIT 1', (err, setting_list) => {
            conn.query('SELECT * FROM `TB_MM_TIMEZONE`', (err, setting) => {
                conn.query('SELECT * FROM `TB_MM_SET_NETWORK` ORDER BY nw_id DESC LIMIT 1', (err, set_network) => {
                    if (err) {
                        res.json(err);
                    }

                    res.render('./setting/construction', {
                        data: setting_list,
                        data2: setting,
                        data3: set_network,
                        session: req.session

                    });
                });
            });
        });
    });
    // }
};
controller.change = (req, res) => {
    const data = req.body;
    id = req.session.userid;

    // res.json(data);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM `TB_TR_ACCOUNT` WHERE acc_id = ?', [id], [data], (err, account) => {
                console.log(account);
                if (err) {
                    res.json(err);
                }
                res.redirect('./index2');
            });
        });
    }
};
controller.changepw = (req, res) => {
    const data = req.body;
    const id = req.session.userid;
    // res.json(data);

    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            console.log(id, data.password);
            conn.query('SELECT date_format(CURDATE(),"%Y-%m-%d") as mouth,CURTIME() as time,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL ? DAY),"%Y-%m-%d") as mouth2', [data.pw_keep], (err, date) => {
                var day1 = [date[0].mouth + " " + date[0].time]
                var day2 = [date[0].mouth2 + " " + date[0].time]
                // res.json(id, day2, data.password)
                // console.log(date);
                conn.query('INSERT INTO `TB_TR_PW_CHANGE` (`change_id`, `acc_id`, `date`) VALUES (NULL, ?, ?);', [id, day2], (err, pw_change) => {
                    conn.query('UPDATE TB_TR_ACCOUNT SET password=? WHERE acc_id = ? ', [data.password, id], (err, setting_save) => {
                        // res.json(pw_change);
                        console.log(pw_change);
                        if (err) {
                            res.json(err);
                        }
                        res.redirect('/index2');
                        // res.render('index2', {

                        //     session: req.session
                        // });
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
            conn.query('INSERT INTO TB_MM_SET_NETWORK set ?', [data], (err, network_new) => {
                console.log(network_new);
                if (err) {
                    res.json(err);
                }
                res.redirect('./index2');
            });
        });
    }
};
controller.settingadd = (req, res) => {
    const data = req.body;
    const date2 = addDate();
    const errors = validationResult(req);
    id = req.session.userid;
    //res.json(data);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        if (!errors.isEmpty()) {
            req.session.errors = errors;
            req.session.success = false;
            res.redirect('/setting');
        } else {
            req.session.success = true;
            req.session.topic = "เพิ่มข้อมูลสำเร็จ";
            req.getConnection((err, conn) => {
                conn.query('SELECT date_format(CURDATE(),"%Y-%m-%d") as mouth,CURTIME() as time,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL ? DAY),"%Y-%m-%d") as mouth2', [data.pw_keep], (err, date) => {
                    var day1 = [date[0].mouth + " " + date[0].time]
                    var day2 = [date[0].mouth2 + " " + date[0].time]
                    console.log(day1 + day2);
                    type = "setting"
                    // conn.query('SELECT DATE_FORMAT(CURRENT_TIMESTAMP(),"%Y-%m-%d %H:%m:%s") as date', (err, date2) => {
                    conn.query('INSERT INTO TB_MM_SET_SYSTEM (sys_id,datetime,pw_keep,ntp,num_admin,num_user,timezone,day_keep,view_hash_log_export,view_hash_access_history,view_hash_pdpa_dataout) VALUES (null,?,?,?,?,?,?,?,?,?,?) ', [day1, day2, data.ntp, data.num_admin, data.num_user, data.timezone, data.pw_keep, data.view_hash_log_export, data.view_hash_access_history, data.view_hash_pdpa_dataout], (err, set_system) => {
                        console.log(err);
                        conn.query('INSERT INTO `TB_MM_SET_NETWORK` (`nw_id`, `ip`, `netmark`, `gateway`, `dns`) VALUES (NULL, ?, ?, ?, ?);', [data.ip, data.netmark, data.gateway, data.dns], (err, set_network) => {
                            conn.query('INSERT INTO `TB_TR_PW_CHANGE` (`change_id`, `acc_id`, `date`) VALUES (NULL, ?, ?);', [id, day2], (err, pw_change) => {
                                conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE acc_id = ?  ', [id], (err, account) => {
                                    var msg = [account[0].name + " Config Number of Admin " + data.num_admin + ",Number of User " + data.num_user + ",Time for Password " + data.pw_keep + " day,NTP Server " + data.ntp]
                                    hashmd5 = md5(id + date2 + msg)
                                    hashsha1 = sha1(id + date2 + msg)
                                    hashsha256 = sha256(id + date2 + msg)
                                    conn.query('INSERT INTO `TB_TR_HISTORY` (`acc_id`, `datetime`, `msg`, `ht_id`, `type`,`md5`,`sha1`,`sha256`) VALUES (?, ?, ?, NULL, ?,?,?,?);', [id, date2, msg, type, hashmd5, hashsha1, hashsha256], (err, history_add) => {

                                        console.log("history_add", err);
                                        if (err) {
                                            res.json(err);
                                        }
                                        res.redirect('./setting/view');
                                    });
                                });
                            });
                        });
                    });
                    // });
                });
            });
        }
    }
};
controller.add = (req, res) => {
    const data = req.body;
    const errors = validationResult(req);
    // res.json(data);
    id = req.session.userid;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        if (!errors.isEmpty()) {
            req.session.errors = errors;
            req.session.success = false;
            res.redirect('/setting/new');
        } else {
            req.session.success = true;
            req.session.topic = "เพิ่มข้อมูลสำเร็จ";
            req.getConnection((err, conn) => {
                conn.query('SELECT date_format(CURDATE(),"%Y-%m-%d") as mouth,CURTIME() as time,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL ? DAY),"%Y-%m-%d") as mouth2', [data.pw_keep], (err, date) => {
                    var day1 = [date[0].mouth + " " + date[0].time]
                    var day2 = [date[0].mouth2 + " " + date[0].time]
                    conn.query('INSERT INTO TB_MM_SET_SYSTEM (sys_id,datetime,pw_keep,ntp,num_admin,num_user,timezone) VALUES (null,?,?,?,?,?,?) ', [day1, day2, data.ntp, data.num_admin, data.num_user, data.timezone], (err, setting_add) => {
                        //console.log(setting_add);
                        conn.query('INSERT INTO `TB_TR_PW_CHANGE` (`change_id`, `acc_id`, `date`) VALUES (NULL, ?, ?);', [id, day2], (err, pw_change) => {

                            conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE acc_id = ?  ', [id], (err, account) => {
                                var msg = [account[0].name + " Config Number of Admin " + data.num_admin + ",Number of User " + data.num_user + ",Time for Password " + data.pw_keep + " day,NTP Server " + data.ntp]
                                //console.log(msg);
                                conn.query('INSERT INTO TB_TR_HISTORY (`acc_id`, `datetime`, `msg`, `ht_id`) VALUES (?,?,?,null) ', [id, day1, msg], (err, history_add) => {
                                    //console.log(history_add);
                                });
                                conn.query('INSERT INTO TB_MM_SET_SYSTEM (sys_id,datetime,pw_keep,ntp,num_admin,num_user,timezone,day_keep) VALUES (null,?,?,?,?,?,?,?) ', [day1, day2, data.ntp, data.num_admin, data.num_user, data.timezone, data.pw_keep], (err, set_system) => {
                                    conn.query('INSERT INTO `TB_MM_SET_NETWORK` (`nw_id`, `ip`, `netmark`, `gateway`, `dns`) VALUES (NULL, ?, ?, ?, ?);', [data.ip, data.netmark, data.gateway, data.dns], (err, set_network) => {
                                        res.redirect('/');
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
controller.qr = (req, res) => {
    //const id = req.session.userid
    const data = req.body;
    var val = data.value;
    var id = data.userid;
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        var secret = speakeasy.generateSecret({
            name: id
        })
        qrcode.toDataURL(secret.otpauth_url, function (err, data) {
            req.getConnection((err, conn) => {
                conn.query('SELECT * FROM `TB_TR_QRCODE` WHERE acc_id = ?', [id], (err, check) => {
                    conn.query('SELECT * FROM `TB_TR_ACCOUNT` WHERE acc_id = ? AND password = ?', [id, val], (err, account) => {
                        // console.log("rrrrrrrrrrrrrrrrr" + check.length + account.length);
                        if (check.length == 0 && account.length == 1) {
                            console.log("if");
                            conn.query('INSERT INTO `TB_TR_QRCODE` (`qr_id`, `acc_id` , `image`, `ascii`) VALUES (NULL, ?, ?, ?);', [id, data, secret.ascii], (err, qrcode) => {
                                conn.query('SELECT * FROM `TB_TR_QRCODE` WHERE acc_id= ?', [id], (err, qrcodecheck) => {
                                    console.log(qrcode);
                                    if (err) {
                                        res.json(err);
                                    }
                                    // res.render('./setting/qr', {
                                    //     data1: qrcodecheck,
                                    //     session: req.session
                                    // });
                                    res.send({ data: qrcodecheck, data2: [] })
                                });
                            });
                        } else {
                            console.log("else");
                            conn.query('SELECT TB_TR_QRCODE.image FROM `TB_TR_QRCODE` JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_QRCODE.acc_id WHERE TB_TR_ACCOUNT.acc_id =? AND TB_TR_ACCOUNT.password =?', [id, val], (err, qrcodecheck) => {
                                console.log("else" + qrcodecheck.length);
                                if (qrcodecheck.length == 0) {
                                    res.send({ data: [] })
                                } else {
                                    res.send({ data: qrcodecheck })

                                }
                            });
                        }

                    });
                });
            });
        })
    }
};
controller.checkqr = (req, res) => {
    const data = req.body;
    //res.json(data);
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        var verified = speakeasy.totp.verify({
            secret: data.ascii,
            encoding: 'ascii',
            token: data.token
        })
        console.log(verified);
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_MM_SET_SYSTEM  ', [id], (err, setting_delete) => {
                if (err) {
                    res.json(err);
                }
                // res.render('./setting/qr', {
                //     data: setting_delete,
                //     session: req.session
                // });
                res.redirect('/qr');
            });
        });
    }
};
controller.confirmdelete = (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        if (!errors.isEmpty()) {
            req.session.errors = errors;
            req.session.success = false;
            res.redirect('/setting/delete' + id);
        } else {
            req.getConnection((err, conn) => {
                conn.query('DELETE FROM setting WHERE id=?', [id], (err, setting_confirmdelete) => {
                    if (err) {

                        req.session.test = "ไม่สามารถลบได้";
                        req.session.success = false;

                        res.redirect('/setting');
                        return;
                    } else {
                        req.session.success = true;
                        req.session.topic = "ลบข้อมูลสำเร็จ";

                    }
                    console.log(setting_confirmdelete);
                    res.redirect('/setting/');
                });
            });
        }
    }
};
controller.edit = (req, res) => {
    const data = req.body;
    const { id } = req.params;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM setting ', [id], (err, setting) => {
                conn.query('SELECT u.id,u.fname,u.lname,date_format(u.age,"%Y-%m-%d")as age,u.weight,u.high,u.sex,u.address,u.phone FROM `setting` as u where id = ?', [id], (err, setting_edit) => {
                    res.render('setting_edit', {
                        data: setting_edit,
                        data1: setting,
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
            res.redirect('/setting/edit/' + id)
        } else {
            req.session.success = true;
            req.session.topic = "แก้ไขข้อมูลสำเร็จ";
            req.getConnection((err, conn) => {
                conn.query('UPDATE setting SET ? WHERE id = ? ', [data, id], (err, setting_save) => {
                    if (err) {
                        res.json(err);
                    }
                    console.log(data);
                    res.redirect('/setting/');
                });
            });
        }
    }

}
controller.ajaxcheckuser = (req, res) => {
    const data = req.body;
    var val = data.value;
    var userid = data.userid;
    console.log(data);
    var token = val;
    console.log(val);
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE acc_id = ? ', [userid, val[0]], (err, dataresult) => {
            conn.query('SELECT * FROM `TB_TR_QRCODE` WHERE acc_id = ?', [userid], (err, qrcode) => {
                var verified = speakeasy.totp.verify({
                    secret: qrcode[0].ascii,
                    encoding: 'ascii',
                    token: token
                })
                if (err) {
                    res.json(err);
                }
                if (verified == true && dataresult.length > 0) {
                    res.send({ data: dataresult })

                } else {
                    res.send({ data: [] })

                }
            });
        });
    });
}
controller.ajaxchecktheme = (req, res) => {
    const data = req.body;
    console.log(data);
    id = req.session.userid;
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM `TB_TR_THEME` WHERE TB_TR_THEME.acc_id = ? ', [id], (err, account) => {
            console.log(account.length);
            if (account.length == 0) {
                data.acc_id = id;
                console.log(data);
                conn.query('INSERT INTO `TB_TR_THEME` SET ? ', [data], (err, theme) => {
                    console.log(theme);
                });
            } else {
                console.log(data);
                conn.query('UPDATE `TB_TR_THEME` SET ? WHERE `TB_TR_THEME`.`acc_id` = ?;', [data, id], (err, theme) => {
                    console.log(theme);
                });
            }

        });
    });
}
controller.download = (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    var acc_id = req.session.userid;
    const date2 = addDate();
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        const savePath = path.join(__dirname, '../backup');
        console.log(savePath);
        res.download(savePath + '/' + id, function (error) {
            console.log(error);
        });
    }
};
controller.backup = (req, res) => {
    const data = req.body;
    //res.json(data);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT date_format(datetime,"%Y-%m-%d %T") as date,file_name,type_backup FROM `TB_TR_BACKUP_RESTOREHISTORY` ', (err, backup) => {
                if (err) {
                    res.json(err);
                }
                funchistory.funchistory(req, "backup", `เข้าสู่เมนู การสำรองฐานข้อมูล`, req.session.userid)
                res.render('./setting/backup', {
                    data: backup,
                    session: req.session
                });
            });
        });
    }
};
controller.ajaxbackup = (req, res) => {
    const data = req.body;
    const date = addDate();
    console.log(data.types);
    req.getConnection((err, conn) => {
        conn.query('INSERT INTO `TB_TR_BACKUP_RESTORE` (`br_id`, `datetime`, `backup_type`, `restore_type`, `check_br`) VALUES (NULL, ?, ?, "0", "0");', [date, data.types], (err, backup_restore) => {
            if (err) {
                console.log(err);
            }
            console.log(backup_restore);
            // if (verified == true && dataresult.length > 0) {
            //     res.send({ data: dataresult })

            // } else {
            //     res.send({ data: [] })

            // }
        });
    });
}
controller.restore = (req, res) => {
    const data = req.body;
    //res.json(data);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM `TB_TR_BACKUP_RESTORE` WHERE restore_type = "restore"', (err, restore) => {
                if (err) {
                    res.json(err);
                }
                funchistory.funchistory(req, "restore", `เข้าสู่เมนู การคืนข้อมูล`, req.session.userid)
                res.render('./setting/restore', {
                    data: restore,
                    session: req.session
                });
            });
        });
    }
};
controller.filerestore = (req, res) => {
    const data = req.body;
    const date = addDate();
    if (req.files.filerestoreconfig) {
        console.log(req.files.filerestoreconfig);
        console.log(req.files.filerestoredatabase);
        var filename = req.files.filerestoreconfig;
    } else {
        res.redirect('/restore');
    }
    if (req.files.filerestoredatabase) {
        console.log(req.files.filerestoreconfig);
        console.log(req.files.filerestoredatabase);
        var filename = req.files.filerestoredatabase;
    }
    // 
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        const savePath = path.join(__dirname, '../restore', filename.name);
        filename.mv(savePath);
        if (req.files.filerestoreconfig) {
            req.getConnection((err, conn) => {
                conn.query('SELECT * FROM `TB_TR_HISTORY` WHERE type = "restore"', (err, restore) => {
                    conn.query('INSERT INTO `TB_TR_BACKUP_RESTORE` (`br_id`, `datetime`, `backup_type`, `restore_type`, `check_br`) VALUES (NULL, ?,"0", "restore config","0");', [date], (err, restore2) => {
                        conn.query('INSERT INTO `TB_TR_BACKUP_RESTOREHISTORY` (`brhr_id`, `datetime`, `file_name`, `type_backup`,`check_br`) VALUES (NULL, ?, ?, "restore config","0");', [date, filename.name], (err, TB_TR_BACKUP_RESTOREHISTORY) => {
                            if (err) {
                                res.json(err);
                            }
                            funchistory.funchistory(req, "restore", `คืนค่าการตั้งค่าข้อมูล ${filename} `, req.session.userid)
                            res.render('./setting/restore', {
                                data: restore,
                                session: req.session
                            });
                        });
                    });
                });
            });
        } else if (req.files.filerestoredatabase) {
            req.getConnection((err, conn) => {
                conn.query('SELECT * FROM `TB_TR_HISTORY` WHERE type = "restore"', (err, restore) => {
                    conn.query('INSERT INTO `TB_TR_BACKUP_RESTORE` (`br_id`, `datetime`, `backup_type`, `restore_type`, `check_br`) VALUES (NULL, ?,"restore database", "0","0");', [date], (err, restore2) => {
                        conn.query('INSERT INTO `TB_TR_BACKUP_RESTOREHISTORY` (`brhr_id`, `datetime`, `file_name`, `type_backup`,`check_br`) VALUES (NULL, ?, ?, "restore database","0");', [date, filename.name], (err, TB_TR_BACKUP_RESTOREHISTORY) => {
                            if (err) {
                                res.json(err);
                            }
                            funchistory.funchistory(req, "restore", `คืนค่าฐานข้อมูล ${data.filerestoredatabase} `, req.session.userid)
                            res.render('./setting/restore', {
                                data: restore,
                                session: req.session
                            });
                        });
                    });
                });
            });
        } else {
            req.getConnection((err, conn) => {
                conn.query('SELECT * FROM `TB_TR_HISTORY` WHERE type = "restore"', (err, restore) => {
                    if (err) {
                        res.json(err);
                    }
                    funchistory.funchistory(req, "restore", `เข้าสู่เมนู การคืนข้อมูล`, req.session.userid)
                    res.render('./setting/restore', {
                        data: restore,
                        session: req.session
                    });
                });
            });
        }
    }
};
module.exports = controller;