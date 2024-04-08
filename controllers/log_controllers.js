const controller = {};
const session = require('express-session');
const { validationResult } = require('express-validator');
var md5 = require('md5');
var sha1 = require('sha1');
var sha256 = require('sha256');
const funchistory = require('../controllers/account_controllers')
const addDate = require("../utils/addDate")

controller.funchistory = (req, typehistory, msghistory, acc_id) => {
    const date = addDate();
    console.log(acc_id, date, msghistory, typehistory);
    hashmd5 = md5(acc_id + date + msghistory)
    hashsha1 = sha1(acc_id + date + msghistory)
    hashsha256 = sha256(acc_id + date + msghistory)
    req.getConnection((err, conn) => {
        conn.query('INSERT INTO `TB_TR_HISTORY` (`acc_id`, `datetime`, `msg`, `ht_id`, `type`,`md5`,`sha1`,`sha256`) VALUES (?, ?, ?, NULL, ?,?,?,?);', [acc_id, date, msghistory, typehistory, hashmd5, hashsha1, hashsha256], (err, history_add) => {
        });
    });
}

controller.download = (req, res) => {
    const { id } = req.params;
    var acc_id = req.session.userid;
    const date2 = addDate();
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {

        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM `TB_TR_FILE` WHERE file_id =?', [id], (err, file) => {
                filename = file[0].name;
                res.download('/var/log/alltra/readed/' + filename, function (error) {
                    if (error) {
                        console.log('error');
                        conn.query('SELECT MAX(date_format(date,"%Y-%m-%d")) as date,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 1 DAY),"%Y-%m-%d") as date2 FROM `TB_TR_FILE` ', (err, date) => {
                            day1 = date[0].date + ' 00:00:00';
                            day2 = date[0].date + ' 23:59:59';
                            conn.query('SELECT date_format(date,"%Y-%m-%d %T") as date,name,hash,file_id FROM `TB_TR_FILE` WHERE TB_TR_FILE.date BETWEEN ? AND ? ORDER BY `TB_TR_FILE`.`date` DESC LIMIT 1000 ', [day1, day2], (err, log_list) => {
                                res.render('./log/filelog', {
                                    data: log_list,
                                    datadownload: '1',
                                    session: req.session
                                });
                            });
                        });
                    } else {
                        console.log(acc_id, id, date2);
                        conn.query('INSERT INTO `TB_TR_EXPORTHISTORY` (`exp_id`, `acc_id`, `file_id`,`date`) VALUES (NULL, ?, ?,?);', [acc_id, id, date2], (err, exporthistory) => {
                            console.log(exporthistory);
                        });
                    }
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
            conn.query('SELECT MAX(date_format(TB_TR_LOG.date,"%Y-%m-%d")) as date,TB_TR_LOG.device_id,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 1 DAY),"%Y-%m-%d") as date2 FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id=? GROUP BY dm.de_id ORDER BY TB_TR_LOG.date DESC LIMIT 1', [id], (err, date) => {
                conn.query('SELECT DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 0 DAY),"%Y-%m-%d") as date2', (err, date2) => {

                    if (date) {
                        day1 = date[0].date + ' 00:00:00';
                        day2 = date[0].date2 + ' 23:59:59';
                        device_id = date[0].device_id;
                    } else {
                        day1 = date2[0].date2 + ' 00:00:00';
                        day2 = date2[0].date2 + ' 23:59:59';
                        device_id = 0
                    }
                    console.log(date);
                    console.log(day1, day2, device_id);
                    conn.query('SELECT ROW_NUMBER() OVER() AS no,TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.device_id = ? and TB_TR_LOG.date BETWEEN ? AND ? ORDER BY `TB_TR_LOG`.`date` DESC LIMIT 1000 ', [device_id, day1, day2], (err, log_list) => {
                        // date = select log group by user on last day
                        conn.query('SELECT ROW_NUMBER() OVER() AS no,hour(TB_TR_LOG.date) as no,COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.device_id FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_DEVICE.device_id = ? and TB_TR_LOG.date BETWEEN ? AND ? GROUP BY hour(TB_TR_LOG.date) ORDER BY hour(TB_TR_LOG.date)', [device_id, day1, day2], (err, count_list) => {
                            //count_list = select log group by hour on last day
                            conn.query('SELECT ROW_NUMBER() OVER() AS no,TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.device_id,TB_TR_DEVICE.name as name,TB_TR_DEVICE.image,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id= ? GROUP BY dm.de_id ORDER BY TB_TR_LOG.date DESC', [id], (err, device_list) => {
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
                                res.render('./log/centralized', {
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
controller.ajaxlist = (req, res) => {
    id = req.session.userid;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            var day = 0;
            conn.query('SELECT MAX(date_format(TB_TR_LOG.date,"%Y-%m-%d")) as date,TB_TR_LOG.device_id,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 1 DAY),"%Y-%m-%d") as date2 FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id=? GROUP BY dm.de_id ORDER BY TB_TR_LOG.date DESC LIMIT 1', [id], (err, date) => {
                conn.query('SELECT DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 0 DAY),"%Y-%m-%d") as date2', (err, date2) => {
                    if (date) {
                        day1 = date[0].date + ' 00:00:00';
                        day2 = date[0].date2 + ' 23:59:59';
                        device_id = date[0].device_id;
                    } else {
                        day1 = date2[0].date2 + ' 00:00:00';
                        day2 = date2[0].date2 + ' 23:59:59';
                        device_id = 0
                    }
                    conn.query('SELECT ROW_NUMBER()OVER(ORDER BY TB_TR_LOG.`date` DESC) AS no,TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.device_id = ? and TB_TR_LOG.date BETWEEN ? AND ? ORDER BY `TB_TR_LOG`.`date` DESC ', [device_id, day1, day2], (err, log_list) => {
                        console.log(err);
                        console.log(log_list);
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

                        res.json({
                            data: log_list,

                        });
                    });
                });
            });
        });
    }
};
controller.filelog = (req, res) => {
    const data = null;
    id = req.session.userid;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            var day = 0;
            conn.query('SELECT MIN(date_format(date,"%Y-%m-%d")) as date,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 1 DAY),"%Y-%m-%d") as date2 FROM `TB_TR_FILE` ', (err, date) => {
                day1 = date[0].date + ' 00:00:00';
                day2 = date[0].date + ' 23:59:59';
                console.log(day1);
                console.log(day2);
                conn.query('SELECT ROW_NUMBER()OVER(ORDER BY TB_TR_FILE.`date` DESC) AS no,TB_TR_DEVICE.hostname,TB_TR_DEVICE.name as device_name,date_format(TB_TR_FILE.date,"%d-%m-%Y %T") as date,TB_TR_DEVICE.device_id,TB_TR_FILE.name,TB_TR_FILE.hash,TB_TR_FILE.file_id FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id JOIN TB_TR_FILE ON TB_TR_FILE.device_id=TB_TR_DEVICE.device_id WHERE a.acc_id= ? AND TB_TR_FILE.date BETWEEN ? AND ? GROUP BY TB_TR_FILE.file_id ORDER BY `TB_TR_FILE`.`date` DESC', [id, day1, day2], (err, log_list) => {
                    conn.query('SELECT hour(TB_TR_FILE.date) as no,COUNT(*) as num FROM `TB_TR_FILE` WHERE TB_TR_FILE.date BETWEEN ? AND ? GROUP BY hour(TB_TR_FILE.date) ORDER BY hour(TB_TR_LOG.date)', [day1, day2], (err, count_list) => {
                        conn.query('SELECT MAX(date_format(TB_TR_LOG.date,"%Y-%m-%d %T")) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.device_id as device_id FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_LOG.device_id=TB_TR_DEVICE.device_id GROUP BY TB_TR_DEVICE.device_id', (err, device_list) => {
                            console.log(log_list);
                            res.render('./log/filelog', {
                                data: log_list,
                                data2: count_list,
                                data3: device_list,
                                datadownload: '0',
                                session: req.session
                            });
                        });
                    });
                });
            });
        });
    }
};
controller.ajaxfilelog = (req, res) => {
    const data = null;
    id = req.session.userid;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            var day = 0;
            conn.query('SELECT MIN(date_format(date,"%Y-%m-%d")) as date,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 1 DAY),"%Y-%m-%d") as date2 FROM TB_TR_FILE ', (err, date) => {
                day1 = date[0].date + ' 00:00:00';
                day2 = date[0].date2 + ' 23:59:59';
                console.log(id, day1, day2);
                conn.query('SELECT ROW_NUMBER()OVER(ORDER BY TB_TR_FILE.`date` DESC) AS no,TB_TR_DEVICE.hostname,TB_TR_DEVICE.name as device_name,date_format(TB_TR_FILE.date,"%d-%m-%Y %T") as date,TB_TR_DEVICE.device_id,TB_TR_FILE.name,TB_TR_FILE.hash,TB_TR_FILE.file_id FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id JOIN TB_TR_FILE ON TB_TR_FILE.device_id=TB_TR_DEVICE.device_id WHERE a.acc_id= ? AND TB_TR_FILE.date BETWEEN ? AND ? GROUP BY TB_TR_FILE.file_id ORDER BY `TB_TR_FILE`.`date` DESC', [id, day1, day2], (err, log_list) => {
                    res.json({
                        data: log_list,
                        datadownload: '0',
                    });
                });
            });
        });
    }
};
controller.filesearch = (req, res) => {
    const data = req.body;
    console.log(data);
    const { id } = req.params;
    var day1 = ((data.date1).replace('T', ' '));
    var day2 = ((data.date2).replace('T', ' '));
    userid = req.session.userid;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            var day = 0;
            // console.log('filesearch',data.device_id, day1, day2);
            conn.query('SELECT ROW_NUMBER()OVER(ORDER BY TB_TR_FILE.`date` DESC) AS no,TB_TR_DEVICE.name as device_name,TB_TR_DEVICE.hostname,date_format(TB_TR_FILE.date,"%Y-%m-%d %T") as date,TB_TR_FILE.name,TB_TR_FILE.hash,TB_TR_FILE.file_id FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id JOIN TB_TR_FILE ON TB_TR_FILE.device_id=TB_TR_DEVICE.device_id WHERE a.acc_id= ? AND TB_TR_FILE.date BETWEEN ? AND ? GROUP BY TB_TR_FILE.file_id ORDER BY `TB_TR_FILE`.`date` DESC', [userid, day1, day2], (err, log_list) => {
                res.render('./log/filelog_ajax', {
                    data: log_list,
                    day1: day1,
                    day2: day2,
                    datadownload: '0',
                    session: req.session
                });
            });
        });
    }
};
controller.ajaxfilesearch = (req, res) => {
    const data = req.body;
    console.log(data.day1, data.day2);
    userid = req.session.userid;
    console.log('ajaxfilesearch', userid);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            var day = 0;
            // console.log('filesearch',data.device_id, day1, day2);
            conn.query('SELECT ROW_NUMBER()OVER(ORDER BY TB_TR_FILE.`date` DESC) AS no,TB_TR_DEVICE.name as device_name,TB_TR_DEVICE.hostname,date_format(TB_TR_FILE.date,"%Y-%m-%d %T") as date,TB_TR_FILE.name,TB_TR_FILE.hash,TB_TR_FILE.file_id FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id JOIN TB_TR_FILE ON TB_TR_FILE.device_id=TB_TR_DEVICE.device_id WHERE a.acc_id= ? AND TB_TR_FILE.date BETWEEN ? AND ? GROUP BY TB_TR_FILE.file_id ORDER BY `TB_TR_FILE`.`date` DESC', [userid, data.day1, data.day2], (err, log_list) => {
                res.json({
                    data: log_list,
                    datadownload: '0'
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
    userid = req.session.userid;

    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            var day = 0;
            // console.log(data.device_id, day1, day2);
            conn.query('SELECT * FROM `TB_TR_DEVICE` WHERE device_id =?', [data.device_id], (err, device) => {
                conn.query('SELECT ROW_NUMBER() OVER() AS no,TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE  a.acc_id= ? and TB_TR_LOG.date BETWEEN ? AND ? ORDER BY `TB_TR_LOG`.`date` DESC ', [data.device_id, day1, day2], (err, log_list) => {
                    if (date.length == 0) {
                        device_id = 0
                    } else {
                        device_id = date[0].device_id;
                    }
                    conn.query('SELECT ROW_NUMBER() OVER() AS no,hour(TB_TR_LOG.date) as no,COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.device_id FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_DEVICE.device_id = ? and TB_TR_LOG.date BETWEEN ? AND ? GROUP BY hour(TB_TR_LOG.date) ORDER BY hour(TB_TR_LOG.date)', [data.device_id, day1, day2], (err, count_list) => {
                        // console.log(count_list);
                        conn.query('SELECT TROW_NUMBER() OVER() AS no,B_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.device_id,TB_TR_DEVICE.name as name,TB_TR_DEVICE.image,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id= ? GROUP BY dm.de_id ORDER BY TB_TR_LOG.date DESC', [userid], (err, device_list) => {
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
controller.ajaxsearch = (req, res) => {
    const data = req.body;
    const { id } = req.params;
    userid = req.session.userid;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            var day = 0;
            // console.log(data.device_id, day1, day2);
            conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_LOG`.`date` DESC) AS no,TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE a.acc_id = ? and TB_TR_LOG.date BETWEEN ? AND ? ORDER BY `TB_TR_LOG`.`date` DESC ', [id, day1, day2], (err, log_list) => {
                if (date.length == 0) {
                    device_id = 0
                } else {
                    device_id = date[0].device_id;
                }

                res.json({
                    data: log_list,
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
                conn.query('SELECT MAX(date_format(date,"%Y-%m-%d")) as date,TB_TR_LOG.device_id,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 0 DAY),"%Y-%m-%d") as date2 FROM `TB_TR_LOG` WHERE device_id =?', [id], (err, date) => {
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
                    conn.query('SELECT TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.device_id = ? and TB_TR_LOG.date BETWEEN ? AND ? ORDER BY `TB_TR_LOG`.`date` DESC LIMIT 1000 ', [date[0].device_id, day1, day2], (err, log_list) => {
                        conn.query('SELECT hour(TB_TR_LOG.date) as no,COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.device_id FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_DEVICE.device_id = ? and TB_TR_LOG.date BETWEEN ? AND ? GROUP BY hour(TB_TR_LOG.date) ORDER BY hour(TB_TR_LOG.date)', [date[0].device_id, day1, day2], (err, count_list) => {
                            console.log(count_list);
                            conn.query('SELECT TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.device_id,TB_TR_DEVICE.name as name,TB_TR_DEVICE.image,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id= 176 GROUP BY dm.de_id ORDER BY TB_TR_LOG.date DESC', (err, device_list) => {
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
controller.ajaxcheck = (req, res) => {
    const data = null;
    const { id } = req.params;
    userid = req.session.userid;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            var day = 0;
            conn.query('SELECT MAX(date_format(date,"%Y-%m-%d")) as date,TB_TR_LOG.device_id,DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 0 DAY),"%Y-%m-%d") as date2 FROM `TB_TR_LOG` WHERE device_id =?', [id], (err, date) => {
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
                conn.query('SELECT ROW_NUMBER() OVER(ORDER BY TB_TR_LOG.`date` DESC) AS no,TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM TB_TR_LOG JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.device_id = ? and TB_TR_LOG.date BETWEEN ? AND ? ORDER BY TB_TR_LOG.`date` DESC', [date[0].device_id, day1, day2], (err, log_list) => {
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY TB_TR_LOG.`date` DESC) AS no,hour(TB_TR_LOG.date) as no,COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.device_id FROM TB_TR_LOG JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_DEVICE.device_id = ? and TB_TR_LOG.date BETWEEN ? AND ? GROUP BY hour(TB_TR_LOG.date) ORDER BY hour(TB_TR_LOG.date)', [date[0].device_id, day1, day2], (err, count_list) => {

                        res.json({
                            data: log_list,
                            data2: count_list,
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
            conn.query('SELECT * FROM `TB_TR_LOG` ORDER BY `TB_TR_LOG`.`date` DESC LIMIT 1000 where acc_id=?', [id], (err, admin_delete) => {
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
    var day1 = req.session.day1
    var day2 = req.session.day2
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT view_hash_access_history as type FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, type) => {
                if (type[0].type == 'md5' && day1 == null) {
                    type = 'MD5'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.md5 as hash  FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.render('./log/access_history', {
                                data2: system,
                                data: history,
                                type: type,
                                session: req.session
                            });
                        });
                    });
                } else if (type[0].type == 'md5' && day1 != null) {
                    type = 'MD5'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.md5 as hash FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.datetime between ? and ? ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', [day1, day2], (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.render('./log/access_history', {
                                data2: system,
                                data: history,
                                type: type,
                                session: req.session
                            });
                        });
                    });
                } else if (type[0].type == 'sha1' && day1 == null) {
                    type = 'SHA-1'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.sha1 as hash  FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.render('./log/access_history', {
                                data2: system,
                                data: history,
                                type: type,
                                session: req.session
                            });
                        });
                    });
                } else if (type[0].type == 'sha1' && day1 != null) {
                    type = 'SHA-1'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.sha1 as hash FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.datetime between ? and ? ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', [day1, day2], (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.render('./log/access_history', {
                                data2: system,
                                data: history,
                                type: type,
                                session: req.session
                            });
                        });
                    });
                } else if (type[0].type == 'sha256' && day1 == null) {
                    type = 'SHA-256'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.sha256 as hash FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.render('./log/access_history', {
                                data2: system,
                                data: history,
                                type: type,
                                session: req.session
                            });
                        });
                    });
                } else if (type[0].type == 'sha256' && day1 != null) {
                    type = 'SHA-256'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.sha256 as hash FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.datetime between ? and ? ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', [day1, day2], (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.render('./log/access_history', {
                                data2: system,
                                data: history,
                                type: type,
                                session: req.session
                            });
                        });
                    });
                } else {
                    res.redirect('/index2');
                }
            });
        });
    }
};
controller.ajex_access_history = (req, res) => {
    var day1 = req.session.day1
    var day2 = req.session.day2
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT view_hash_access_history as type FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, type) => {
                if (type[0].type == 'md5' && day1 == null) {
                    type = 'MD5'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.md5 as hash  FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.json({
                                data: history,
                                type: type
                            });
                        });
                    });
                } else if (type[0].type == 'md5' && day1 != null) {
                    type = 'MD5'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.md5 as hash FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.datetime between ? and ? ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', [day1, day2], (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.json({
                                data: history,
                                type: type
                            });
                        });
                    });
                } else if (type[0].type == 'sha1' && day1 == null) {
                    type = 'SHA-1'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.sha1 as hash  FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.json({
                                data: history,
                                type: type
                            });
                        });
                    });
                } else if (type[0].type == 'sha1' && day1 != null) {
                    type = 'SHA-1'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.sha1 as hash FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.datetime between ? and ? ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', [day1, day2], (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.json({
                                data: history,
                                type: type
                            });
                        });
                    });
                } else if (type[0].type == 'sha256' && day1 == null) {
                    type = 'SHA-256'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.sha256 as hash FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.json({
                                data: history,
                                type: type
                            });
                        });
                    });
                } else if (type[0].type == 'sha256' && day1 != null) {
                    type = 'SHA-256'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.sha256 as hash FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.datetime between ? and ? ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', [day1, day2], (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.json({
                                data: history,
                                type: type
                            });
                        });
                    });
                }
            });

        });
    }
};
controller.access_historysearch = (req, res) => {
    const data = req.body;
    var day1 = ((data.date1).replace('T', ' '));
    var day2 = ((data.date2).replace('T', ' '));
    req.session.day1 = day1;
    req.session.day2 = day2;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                // conn.query('SELECT TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%Y-%m-%d %H:%m:%S")as date ,TB_TR_HISTORY.msg,TB_TR_ACCOUNT.name,TB_TR_HISTORY.md5,TB_TR_HISTORY.sha1,TB_TR_HISTORY.sha256 FROM TB_TR_HISTORY  JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.datetime BETWEEN ? and ?  ORDER BY TB_TR_HISTORY.datetime DESC', [day1,day2], (err, history) => {
                conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.sha256 as hash FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.datetime between ? and ? ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', [day1, day2], (err, history) => {
                    funchistory.funchistory(req, "backup", `ค้นหาข้อมูล ${system[0].datetime}${system[0].pw_keep}`, req.session.userid)
                    res.render('./log/access_history', {
                        data: history,
                        data2: system,
                        session: req.session
                    });
                });
            });
        });
    };
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
controller.exporthistorysearch = (req, res) => {
    const data = req.body;
    var day1 = ((data.date1).replace('T', ' '));
    var day2 = ((data.date2).replace('T', ' '));
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT TB_TR_EXPORTHISTORY.exp_id,TB_TR_FILE.name,TB_TR_FILE.hash,TB_TR_ACCOUNT.name as acc_name,date_format(TB_TR_EXPORTHISTORY.date ,"%H:%m:%s %Y-%m-%d ") as date FROM `TB_TR_EXPORTHISTORY` JOIN TB_TR_FILE ON TB_TR_FILE.file_id=TB_TR_EXPORTHISTORY.file_id JOIN TB_TR_ACCOUNT ON TB_TR_EXPORTHISTORY.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_EXPORTHISTORY.date BETWEEN ? AND ? ORDER BY TB_TR_EXPORTHISTORY.exp_id DESC;', [day1, day2], (err, exporthistory) => {
                res.render('./log/exporthistory', {
                    data: exporthistory,
                    session: req.session
                });
            });
        });
    }
};
controller.exporthistory = (req, res) => {
    const data = req.body;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT TB_TR_EXPORTHISTORY.exp_id,TB_TR_FILE.name,TB_TR_FILE.hash,TB_TR_ACCOUNT.name as acc_name,date_format(TB_TR_EXPORTHISTORY.date ,"%H:%m:%s %Y-%m-%d ") as date FROM `TB_TR_EXPORTHISTORY` JOIN TB_TR_FILE ON TB_TR_FILE.file_id=TB_TR_EXPORTHISTORY.file_id JOIN TB_TR_ACCOUNT ON TB_TR_EXPORTHISTORY.acc_id=TB_TR_ACCOUNT.acc_id ORDER BY TB_TR_EXPORTHISTORY.exp_id DESC', (err, exporthistory) => {
                res.render('./log/exporthistory', {
                    data: exporthistory,
                    session: req.session
                });
            });
        });
    }
};
controller.filter = (req, res) => {
    const data = req.body;
    id = req.session.userid;
    var r = ""
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {

        console.log((data.input).split("?").length);
        console.log((data.input).split("*").length);
        if ((data.input).split("*").length > 1) {
            console.log("AND");

            text = (data.input).split("*").join("% AND %");
            text = '%' + text + '%'
            text = (text).split(" AND ")
            console.log(text);
            for (i in text) {
                if (i < (text.length - 1)) {
                    r += '"' + text[i] + '"' + ' AND TB_TR_LOG.msg LIKE '
                } else {
                    r += '"' + text[i] + '"'
                }
            }
            e = 'SELECT CONCAT(year(TB_TR_LOG.date),"-",month(TB_TR_LOG.date),"-",day(TB_TR_LOG.date)) as no,COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.device_id FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_DEVICE.device_id =' + data.device_id + ' AND TB_TR_LOG.msg LIKE ' + r + 'GROUP BY TB_TR_LOG.date ORDER BY TB_TR_LOG.date'
            r = 'SELECT TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.device_id,TB_TR_DEVICE.name as name,TB_TR_DEVICE.image,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id=' + id + ' and TB_TR_LOG.device_id =' + data.device_id + ' AND TB_TR_LOG.msg LIKE ' + r + ' GROUP BY TB_TR_LOG.msg'
        }
        if ((data.input).split("?").length > 1) {
            console.log("OR");
            text = (data.input).split("?").join("% OR %");
            text = '%' + text + '%'
            text = (text).split(" OR ")
            console.log(text);
            for (i in text) {
                if (i < (text.length - 1)) {
                    r += '"' + text[i] + '"' + ' OR TB_TR_LOG.msg LIKE '
                } else {
                    r += '"' + text[i] + '"'
                }
            }
            e = 'SELECT CONCAT(year(TB_TR_LOG.date),"-",month(TB_TR_LOG.date),"-",day(TB_TR_LOG.date)) as no,COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.device_id FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_DEVICE.device_id =' + data.device_id + ' AND TB_TR_LOG.msg LIKE ' + r + 'GROUP BY TB_TR_LOG.date ORDER BY TB_TR_LOG.date'
            r = 'SELECT TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.TB_TR_DEVICE,TB_TR_DEVICE.name as name,TB_TR_DEVICE.image,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id=' + id + ' and TB_TR_LOG.device_id =' + data.device_id + ' AND TB_TR_LOG.msg LIKE ' + r + ' GROUP BY TB_TR_LOG.msg'

        }
        if ((data.input).split("?").length == 1 && (data.input).split("*").length == 1) {
            console.log("else");
            r = 'SELECT TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.device_id,TB_TR_DEVICE.name as name,TB_TR_DEVICE.image,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id=' + id + ' and TB_TR_LOG.device_id =' + data.device_id + ' AND TB_TR_LOG.msg LIKE ' + '"%' + data.input + '%" GROUP BY TB_TR_LOG.msg'
            e = 'SELECT CONCAT(year(TB_TR_LOG.date),"-",month(TB_TR_LOG.date),"-",day(TB_TR_LOG.date)) as no,COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.device_id FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_DEVICE.device_id =' + data.device_id + ' AND TB_TR_LOG.msg LIKE ' + '"%' + data.input + '%"' + 'GROUP BY TB_TR_LOG.date ORDER BY TB_TR_LOG.date'

        }



        console.log("RR " + r);
        console.log("OO " + e);
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM `TB_TR_DEVICE` WHERE device_id =?', [data.device_id], (err, device) => {
                conn.query(r, (err, log_list) => {
                    conn.query(e, (err, count_list) => {
                        conn.query('SELECT MAX(date_format(TB_TR_LOG.date,"%Y-%m-%d %T")) as date,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.device_id as device_id FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id= ? GROUP BY dm.de_id ORDER BY TB_TR_LOG.date DESC', [id], (err, device_list) => {

                            if (err) {
                                res.json(err);
                            }
                            // console.log(filter);
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
    }
};
controller.ajaxfilter = (req, res) => {
    const data = req.body;
    id = req.session.userid;
    var r = ""

    console.log(data.value.input);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {

        console.log((data.value.input).split("?").length);
        console.log((data.value.input).split("*").length);
        if ((data.value.input).split("*").length > 1) {
            console.log("AND");

            text = (data.value.input).split("*").join("% AND %");
            text = '%' + text + '%'
            text = (text).split(" AND ")
            console.log(text);
            for (i in text) {
                if (i < (text.length - 1)) {
                    r += '"' + text[i] + '"' + ' AND TB_TR_LOG.msg LIKE '
                } else {
                    r += '"' + text[i] + '"'
                }
            }
            e = 'SELECT CONCAT(year(TB_TR_LOG.date),"-",month(TB_TR_LOG.date),"-",day(TB_TR_LOG.date)) as no,COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.device_id FROM TB_TR_LOG JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_DEVICE.device_id =' + data.value.device_id + ' AND TB_TR_LOG.msg LIKE ' + r + 'GROUP BY TB_TR_LOG.date ORDER BY TB_TR_LOG.date DESC;'
            r = 'SELECT ROW_NUMBER() OVER(ORDER BY TB_TR_LOG.`date` DESC) AS no,TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.device_id,TB_TR_DEVICE.name as name,TB_TR_DEVICE.image,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM TB_TR_USER_MEMBER as um JOIN TB_TR_GROUP as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id=' + id + ' and TB_TR_LOG.device_id =' + data.value.device_id + ' AND TB_TR_LOG.msg LIKE ' + r + ' GROUP BY TB_TR_LOG.msg ORDER BY ROW_NUMBER() OVER(ORDER BY TB_TR_LOG.`date` DESC)'
        }
        if ((data.value.input).split("?").length > 1) {
            console.log("OR");
            text = (data.value.input).split("?").join("% OR %");
            text = '%' + text + '%'
            text = (text).split(" OR ")
            console.log(text);
            for (i in text) {
                if (i < (text.length - 1)) {
                    r += '"' + text[i] + '"' + ' OR log.msg LIKE '
                } else {
                    r += '"' + text[i] + '"'
                }
            }
            e = 'SELECT CONCAT(year(TB_TR_LOG.date),"-",month(TB_TR_LOG.date),"-",day(TB_TR_LOG.date)) as no,COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.device_id FROM TB_TR_LOG JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_DEVICE.device_id =' + data.value.device_id + ' AND TB_TR_LOG.msg LIKE ' + r + 'GROUP BY TB_TR_LOG.date ORDER BY TB_TR_LOG.date DESC;'
            r = 'SELECT ROW_NUMBER() OVER(ORDER BY TB_TR_LOG.`date` DESC) AS no, TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.device_id,TB_TR_DEVICE.name as name,TB_TR_DEVICE.image,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM TB_TR_USER_MEMBER as um JOIN TB_TR_GROUP as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id=' + id + ' and TB_TR_LOG.device_id =' + data.value.device_id + ' AND TB_TR_LOG.msg LIKE ' + r + ' GROUP BY TB_TR_LOG.msg ORDER BY ROW_NUMBER() OVER(ORDER BY TB_TR_LOG.`date` DESC)'

        }
        if ((data.value.input).split("?").length == 1 && (data.value.input).split("*").length == 1) {
            console.log("else");
            r = 'SELECT ROW_NUMBER() OVER(ORDER BY TB_TR_LOG.`date` DESC) AS no, TB_TR_LOG.msg as msg,date_format(TB_TR_LOG.date,"%Y-%m-%d %T" ) as date,TB_TR_DEVICE.device_id,TB_TR_DEVICE.name as name,TB_TR_DEVICE.image,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.file_name FROM TB_TR_USER_MEMBER as um JOIN TB_TR_GROUP as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id=' + id + ' and TB_TR_LOG.device_id =' + data.value.device_id + ' AND TB_TR_LOG.msg LIKE ' + '"%' + data.value.input + '%" GROUP BY TB_TR_LOG.msg ORDER BY ROW_NUMBER() OVER(ORDER BY TB_TR_LOG.`date` DESC)'
            e = 'SELECT CONCAT(year(TB_TR_LOG.date),"-",month(TB_TR_LOG.date),"-",day(TB_TR_LOG.date)) as no,COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.device_id FROM TB_TR_LOG JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_DEVICE.device_id =' + data.value.device_id + ' AND TB_TR_LOG.msg LIKE ' + '"%' + data.value.input + '%"' + 'GROUP BY TB_TR_LOG.date ORDER BY TB_TR_LOG.date DESC;'

        }

        console.log("RR " + r);
        console.log("OO " + e);
        req.getConnection((err, conn) => {
            conn.query(r, (err, log_list) => {
                conn.query(e, (err, count_list) => {
                    if (err) {
                        res.json(err);
                    }

                    res.json({
                        data: log_list,
                    });
                });
            });
        });
    }
};




controller.api_history_search = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const search = '%' + req.body.text + '%';
        req.getConnection((err, conn) => {
            conn.query('SELECT ROW_NUMBER() OVER(ORDER BY TB_TR_HISTORY.datetime DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.md5 as hash  FROM TB_TR_HISTORY JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.msg LIKE ? ORDER BY TB_TR_HISTORY.datetime DESC;', [search], (err, history) => {
                conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                    conn.query('SELECT view_hash_access_history as type FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, type) => {
                        if (history.length > 0) {
                            res.send({ history, system, type })
                        } else {
                            res.send(JSON.stringify("ไม่มีข้อมูล"));
                        }
                    });
                });
            });
        });
    } else {
        res.redirect("/");
    }
};



controller.access_compare = (req, res) => {
    var day1 = req.session.day1
    var day2 = req.session.day2
    if (typeof req.session.userid == 'undefined' || req.session.admin == '1') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT view_hash_access_history as type FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, type) => {
                if (type[0].type == 'md5' && day1 == null) {
                    type = 'MD5'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.md5 as hash  FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.render('./log/access_compare', {
                                data2: system,
                                data: history,
                                type: type,
                                session: req.session
                            });
                        });
                    });
                } else if (type[0].type == 'md5' && day1 != null) {
                    type = 'MD5'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.md5 as hash FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.datetime between ? and ? ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', [day1, day2], (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.render('./log/access_compare', {
                                data2: system,
                                data: history,
                                type: type,
                                session: req.session
                            });
                        });
                    });
                } else if (type[0].type == 'sha1' && day1 == null) {
                    type = 'SHA-1'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.sha1 as hash  FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.render('./log/access_compare', {
                                data2: system,
                                data: history,
                                type: type,
                                session: req.session
                            });
                        });
                    });
                } else if (type[0].type == 'sha1' && day1 != null) {
                    type = 'SHA-1'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.sha1 as hash FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.datetime between ? and ? ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', [day1, day2], (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.render('./log/access_compare', {
                                data2: system,
                                data: history,
                                type: type,
                                session: req.session
                            });
                        });
                    });
                } else if (type[0].type == 'sha256' && day1 == null) {
                    type = 'SHA-256'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.sha256 as hash FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.render('./log/access_compare', {
                                data2: system,
                                data: history,
                                type: type,
                                session: req.session
                            });
                        });
                    });
                } else if (type[0].type == 'sha256' && day1 != null) {
                    type = 'SHA-256'
                    conn.query('SELECT ROW_NUMBER() OVER(ORDER BY `TB_TR_HISTORY`.`datetime` DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.sha256 as hash FROM `TB_TR_HISTORY`JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.datetime between ? and ? ORDER BY `TB_TR_HISTORY`.`datetime` DESC;', [day1, day2], (err, history) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                            res.render('./log/access_compare', {
                                data2: system,
                                data: history,
                                type: type,
                                session: req.session
                            });
                        });
                    });
                } else {
                    res.redirect('/index2');
                }
            });
        });
    }
};

controller.api_compare_search = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        const data = req.body;
        req.getConnection((err, conn) => {
            if(data.search != '' && data.date1 == '' && data.date2 == ''){
                conn.query('SELECT ROW_NUMBER() OVER(ORDER BY TB_TR_HISTORY.datetime DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.md5 as hash  FROM TB_TR_HISTORY JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.msg LIKE ? or TB_TR_ACCOUNT.name LIKE ? or TB_TR_HISTORY.type LIKE ? ORDER BY TB_TR_HISTORY.datetime DESC;', ['%'+data.search+'%','%'+data.search+'%','%'+data.search+'%'], (err, history) => {
                    conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                        conn.query('SELECT view_hash_access_history as type FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, type) => {
                            if (history.length > 0) {
                                res.send({ history, system, type })
                            } else {
                                res.send(JSON.stringify("ไม่มีข้อมูล"));
                            }
                        });
                    });
                });
            }else if(data.date1 != '' && data.date2 == '' && data.search == ''){
                conn.query('SELECT ROW_NUMBER() OVER(ORDER BY TB_TR_HISTORY.datetime DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.md5 as hash  FROM TB_TR_HISTORY JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE  TB_TR_HISTORY.datetime LIKE ?  ORDER BY TB_TR_HISTORY.datetime DESC;', ['%'+data.date1+'%'], (err, history) => {
                    conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                        conn.query('SELECT view_hash_access_history as type FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, type) => {
                            if (history.length > 0) {
                                res.send({ history, system, type })
                            } else {
                                res.send(JSON.stringify("ไม่มีข้อมูล"));
                            }
                        });
                    });
                });
            }else if(data.date1 != '' && data.date2 != '' && data.search == ''){
                conn.query('SELECT ROW_NUMBER() OVER(ORDER BY TB_TR_HISTORY.datetime DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.md5 as hash  FROM TB_TR_HISTORY JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.datetime BETWEEN ? and ?  ORDER BY TB_TR_HISTORY.datetime DESC;', [data.date1,data.date2], (err, history) => {
                    conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                        conn.query('SELECT view_hash_access_history as type FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, type) => {
                            if (history.length > 0) {
                                res.send({ history, system, type })
                            } else {
                                res.send(JSON.stringify("ไม่มีข้อมูล"));
                            }
                        });
                    });
                });
            }else if(data.date1 != '' && data.date2 != '' && data.search != ''){
                conn.query('SELECT ROW_NUMBER() OVER(ORDER BY TB_TR_HISTORY.datetime DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.md5 as hash  FROM TB_TR_HISTORY JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.msg LIKE ? and TB_TR_HISTORY.datetime between ? and ? or TB_TR_ACCOUNT.name LIKE ? or TB_TR_HISTORY.type LIKE ? ORDER BY TB_TR_HISTORY.datetime DESC;', ['%'+data.search+'%',data.date1,data.date2,'%'+data.search+'%','%'+data.search+'%'], (err, history) => {
                    conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                        conn.query('SELECT view_hash_access_history as type FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, type) => {
                            if (history.length > 0) {
                                res.send({ history, system, type })
                            } else {
                                res.send(JSON.stringify("ไม่มีข้อมูล"));
                            }
                        });
                    });
                });
            }else{
                conn.query('SELECT ROW_NUMBER() OVER(ORDER BY TB_TR_HISTORY.datetime DESC) AS no,TB_TR_HISTORY.ht_id,date_format(TB_TR_HISTORY.datetime,"%d-%m-%Y %T")as date ,TB_TR_HISTORY.msg,TB_TR_HISTORY.type,TB_TR_ACCOUNT.name,TB_TR_HISTORY.md5 as hash  FROM TB_TR_HISTORY JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE  TB_TR_HISTORY.datetime LIKE ?  ORDER BY TB_TR_HISTORY.datetime DESC;', ['%'+data.date2+'%'], (err, history) => {
                    conn.query('SELECT * FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, system) => {
                        conn.query('SELECT view_hash_access_history as type FROM TB_MM_SET_SYSTEM order by datetime DESC limit 1', (err, type) => {
                            if (history.length > 0) {
                                res.send({ history, system, type })
                            } else {
                                res.send(JSON.stringify("ไม่มีข้อมูล"));
                            }
                        });
                    });
                });
            }
        });
    } else {
        res.redirect("/");
    }
};
module.exports = controller;