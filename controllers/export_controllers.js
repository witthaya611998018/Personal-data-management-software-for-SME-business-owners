const controller = {};
const e = require('express');
var md5 = require('md5');
var sha1 = require('sha1');
var sha256 = require('sha256');
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

controller.dataout = (req, res) => {
    id = req.session.userid;
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT out_id,date_format(create_date,"%b %d %T")as date,name,descrip,filters,destination,port,type_alert,alert_status,phone FROM `TB_TR_DATA_OUT`', (err, data_out) => {
                controller.funchistory(req, "dataout", `เข้าสู่เมนู transfer log`, req.session.userid)
                res.render('./export/dataout_list', {
                    data: data_out,
                    session: req.session
                });

            });
        });
    }
};
controller.createdataout = (req, res) => {
    const data = req.body;
    var date = ((data.create_date).replace('T', ' '));
    //res.json(data);
    id = req.session.userid;
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        data.create_date = date
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO TB_TR_DATA_OUT set ?', [data], (err, data_out) => {
                controller.funchistory(req, "dataout", `เพิ่มข้อมูล transfer log ${data.name}`, req.session.userid)
                res.redirect('./dataout')
            });
        });
    }
};
controller.deldataout = (req, res) => {
    const data = req.body;
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        data.create_date = date
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_DATA_OUT WHERE out_id = ?',[data.out_id],(err,data_out))
            conn.query('DELETE FROM `TB_TR_DATA_OUT` WHERE `TB_TR_DATA_OUT`.`out_id` =?', [data.out_id], (err, deldata_out) => {
                controller.funchistory(req, "dataout", `ลบข้อมูล transfer log ${data_out[0].name}`, req.session.userid)
                res.redirect('./dataout')
            });
        });
    }
};
controller.dataoutckeck = (req, res) => {
    const { id } = req.params;
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT ftp_id,date_format(create_date,"%Y-%m-%d %T") as create_date ,date_format(import_date,"%Y-%m-%d %T") as import_date,name,descrip,path,type_import,password,ip,username FROM `ftp` ORDER BY create_date', (err, ftp) => {
                res.render('./export/dataout_check', {
                    data: ftp,
                    session: req.session
                });
            });
        });
    }
};
controller.sumhost = (req, res) => {
    const { id } = req.params;
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT MAX(date_format(TB_TR_LOG.date,"%Y-%m-%d %T")) as date,TB_TR_DEVICE.device_id,de_type,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.device_id as device_id FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_LOG.device_id=TB_TR_DEVICE.device_id GROUP BY TB_TR_DEVICE.device_id', (err, device) => {
                conn.query('SELECT date_format(date,"%Y-%m-%d %T")as date,name,hash FROM `TB_TR_FILE` WHERE device_id = ?', [device[0].device_id], (err, file) => {
                    conn.query('SELECT COUNT(*) as num,TB_TR_DEVICE.device_id,TB_TR_DEVICE.name,TB_TR_DEVICE.de_ip,TB_TR_DEVICE.image,TB_TR_LOG.date FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id GROUP BY TB_TR_LOG.device_id ORDER BY COUNT(*) DESC', (err, device2) => {
                        res.render('./export/sumhost_list', {
                            data: file,
                            data2: device2,
                            session: req.session
                        });
                    });
                });
            });
        });
    }
};
controller.comparehost = (req, res) => {
    const data = req.body;
    // res.json(data)
    var de_id = [];
    de_id = data.comparehost_id;
    var pushdata = []
    var seltect_de = de_id[de_id.length - 1];
    var comparehost_id = []
    if (de_id.length > 1) {
        for (var i = 1; i < de_id.length; i++) {
            comparehost_id = de_id[0].split(',');
        }
        comparehost_id.push(de_id[1])
    }
    // console.log('comparehost_id' + comparehost_id);
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT MAX(date_format(TB_TR_LOG.date,"%Y-%m-%d %T")) as date,TB_TR_DEVICE.device_id,de_type,TB_TR_DEVICE.name as name,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.device_id as device_id FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_LOG.device_id=TB_TR_DEVICE.device_id GROUP BY TB_TR_DEVICE.device_id', (err, device) => {
                conn.query('SELECT date_format(date,"%Y-%m-%d %T")as date,name,hash FROM `TB_TR_FILE` WHERE device_id = ?', [device[0].device_id], (err, file) => {
                    conn.query('SELECT COUNT(*) as num,deTB_TR_DEVICEvice.device_id,TB_TR_DEVICE.name,TB_TR_DEVICE.de_ip,TB_TR_DEVICE.image,TB_TR_LOG.date FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id GROUP BY TB_TR_LOG.device_id ORDER BY COUNT(*) DESC', (err, device2) => {
                        req.session.comparehost_id = comparehost_id;
                        res.render('./export/sumhost_list', {
                            data: file,
                            data2: device2,
                            session: req.session
                        });
                    });
                });
            });
        });
    }
};
controller.overall = (req, res) => {
    const { id } = req.params;
    de_id = []
    if (req.session.device_id) {
        de_id = req.session.device_id
    } else {
        de_id = 0
    }
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.image,TB_TR_LOG.date FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id GROUP BY TB_TR_LOG.device_id ORDER BY COUNT(*) DESC LIMIT 5', (err, Top_Total_Event) => {
                conn.query('SELECT COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.image,TB_TR_LOG.date FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id GROUP BY TB_TR_LOG.date ORDER BY  COUNT(*) DESC LIMIT 5', (err, Top_EPS) => {
                    conn.query('SELECT COUNT(*) as num FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id', (err, Total_Events) => {
                        conn.query('SELECT COUNT(*) as num FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id GROUP BY TB_TR_LOG.date ORDER BY TB_TR_LOG.date DESC LIMIT 15', (err, Total_Events2) => {
                            conn.query('SELECT COUNT(*) as num,TB_TR_DEVICE.de_type FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id GROUP BY TB_TR_DEVICE.de_type', (err, pie) => {
                                conn.query('SELECT d.device_id,d.name FROM `TB_TR_DEVICE`as d join `TB_TR_LOG`as l on l.device_id=d.device_id WHERE d.device_id   NOT IN (?) group by l.device_id ;', [de_id], (err, device) => {
                                    res.render('./export/overall_list', {
                                        data: Top_Total_Event,
                                        data2: Top_EPS,
                                        data3: Total_Events,
                                        data4: Total_Events2,
                                        data5: pie,
                                        data6: device,
                                        session: req.session
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
controller.overallmonth = (req, res) => {
    const { id } = req.params;
    de_id = []
    if (req.session.device_id) {
        de_id = req.session.device_id
    } else {
        de_id = 0
    }
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 0 DAY),"%Y-%m%") as date', (err, datesplit) => {
                conn.query('SELECT (SELECT COUNT(*) FROM `TB_TR_LOG` WHERE date LIKE ?)as num,TB_TR_DEVICE.name,TB_TR_DEVICE.image,TB_TR_LOG.date FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.date LIKE ? GROUP BY TB_TR_LOG.device_id ORDER BY COUNT(*) DESC LIMIT 5;', [datesplit[0].date, datesplit[0].date], (err, Top_Total_Event) => {
                    conn.query('SELECT (SELECT COUNT(*) FROM `TB_TR_LOG` WHERE date LIKE ?)as num,TB_TR_DEVICE.name,TB_TR_DEVICE.image,TB_TR_LOG.date FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.date LIKE ? GROUP BY TB_TR_LOG.date ORDER BY COUNT(*) DESC LIMIT 5;', [datesplit[0].date, datesplit[0].date], (err, Top_EPS) => {
                        conn.query('SELECT COUNT(*) as num FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE date LIKE ?', [datesplit[0].date], (err, Total_Events) => {
                            conn.query('SELECT COUNT(*) as num FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.date LIKE ? GROUP BY TB_TR_LOG.date ORDER BY TB_TR_LOG.date DESC LIMIT 15;', [datesplit[0].date], (err, Total_Events2) => {
                                conn.query('SELECT COUNT(*) as num,TB_TR_DEVICE.de_type FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.date LIKE ? GROUP BY TB_TR_DEVICE.de_type', [datesplit[0].date], (err, pie) => {
                                    conn.query('SELECT d.device_id,d.name FROM `TB_TR_DEVICE`as d join `TB_TR_LOG`as l on l.device_id=d.device_id WHERE d.device_id   NOT IN (?) group by l.device_id ;', [de_id], (err, device) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        res.render('./export/overall_list', {
                                            data: Top_Total_Event,
                                            data2: Top_EPS,
                                            data3: Total_Events,
                                            data4: Total_Events2,
                                            data5: pie,
                                            data6: device,
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
    }
};
controller.overallseven = (req, res) => {
    const { id } = req.params;
    de_id = []
    if (req.session.device_id) {
        de_id = req.session.device_id

    } else {
        de_id = 0
    }
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 7 DAY),"%Y-%m-%d") as date', (err, datesplit2) => {
                conn.query('SELECT DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 0 DAY),"%Y-%m-%d") as date', (err, datesplit) => {
                    conn.query('SELECT (SELECT COUNT(*) FROM `TB_TR_LOG` WHERE date BETWEEN ? AND ?)as num,TB_TR_DEVICE.name,TB_TR_DEVICE.image,TB_TR_LOG.date FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.date BETWEEN ? AND ? GROUP BY TB_TR_LOG.device_id ORDER BY COUNT(*) DESC LIMIT 5;', [datesplit[0].date, datesplit2[0].date,datesplit[0].date, datesplit2[0].date], (err, Top_Total_Event) => {
                        conn.query('SELECT (SELECT COUNT(*) FROM `TB_TR_LOG` WHERE date BETWEEN ? AND ?)as num,TB_TR_DEVICE.name,TB_TR_DEVICE.image,TB_TR_LOG.date FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.date BETWEEN ? AND ? GROUP BY TB_TR_LOG.date ORDER BY COUNT(*) DESC LIMIT 5;', [datesplit[0].date, datesplit2[0].date,datesplit[0].date, datesplit2[0].date], (err, Top_EPS) => {
                            conn.query('SELECT COUNT(*) as num FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE date BETWEEN ? AND ?', [datesplit[0].date, datesplit2[0].date], (err, Total_Events) => {
                                conn.query('SELECT COUNT(*) as num FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.date BETWEEN ? AND ? GROUP BY TB_TR_LOG.date ORDER BY TB_TR_LOG.date DESC LIMIT 15;', [datesplit[0].date,datesplit2[0].date], (err, Total_Events2) => {
                                    conn.query('SELECT COUNT(*) as num,TB_TR_DEVICE.de_type FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.date BETWEEN ? AND ? GROUP BY TB_TR_DEVICE.de_type', [datesplit[0].date,datesplit2[0].date], (err, pie) => {
                                        conn.query('SELECT * FROM `TB_TR_DEVICE` WHERE device_id NOT IN (?)', [de_id], (err, device) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            res.render('./export/overall_list', {
                                                data: Top_Total_Event,
                                                data2: Top_EPS,
                                                data3: Total_Events,
                                                data4: Total_Events2,
                                                data5: pie,
                                                data6: device,
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
controller.comparedevice = (req, res) => {
    const data = req.body;
    var de_id = [];
    de_id = data.device_id;
    var pushdata = []
    var seltect_de = de_id[de_id.length - 1];
    var device_id = []
    if (de_id.length > 1) {
        for (var i = 0; i < de_id.length; i++) {
            device_id = de_id[0].split(',');
        }
        device_id.push(de_id[1])
    }

    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.image,TB_TR_LOG.date FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id GROUP BY TB_TR_LOG.device_id ORDER BY COUNT(*) DESC LIMIT 5', (err, Top_Total_Event) => {
                conn.query('SELECT COUNT(*) as num,TB_TR_DEVICE.name,TB_TR_DEVICE.image,TB_TR_LOG.date FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id GROUP BY TB_TR_LOG.date ORDER BY  COUNT(*) DESC LIMIT 5', (err, Top_EPS) => {
                    conn.query('SELECT COUNT(*) as num FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id', (err, Total_Events) => {
                        conn.query('SELECT COUNT(*) as num FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id GROUP BY TB_TR_LOG.date ORDER BY TB_TR_LOG.date DESC LIMIT 15', (err, Total_Events2) => {
                            conn.query('SELECT COUNT(*) as num,TB_TR_DEVICE.de_type FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id GROUP BY TB_TR_LOG.device_id', (err, pie) => {
                                conn.query('SELECT d.device_id,d.name FROM `TB_TR_DEVICE`as d join `TB_TR_LOG`as l on l.device_id=d.device_id WHERE d.device_id   NOT IN (?) group by l.device_id ;', [device_id], (err, device) => {
                                    req.session.device_id = device_id;
                                    conn.query('SELECT COUNT(*) as num,d.device_id,d.name FROM `TB_TR_LOG`as l join `TB_TR_DEVICE`as d on d.device_id=l.device_id WHERE l.device_id IN (?) GROUP BY l.device_id', [device_id], (err, COUNT_file) => {
                                        conn.query('SELECT COUNT(*) as num,device_id,sum(TB_TR_FILE.size) as size  FROM `TB_TR_FILE` WHERE device_id IN (?) GROUP BY device_id', [device_id], (err, COUNT_events) => {
                                            conn.query('SELECT TB_TR_DEVICE.keep,TB_TR_DEVICE.rmfile,(SELECT DATE_FORMAT(DATE_ADD((TB_TR_DEVICE.rmfile),INTERVAL -(TB_TR_DEVICE.keep) DAY),"%Y-%m-%d") )as date,DATEDIFF(CURDATE(),(SELECT DATE_FORMAT(DATE_ADD((TB_TR_DEVICE.rmfile),INTERVAL -(TB_TR_DEVICE.keep) DAY),"%Y-%m-%d") )) as startdate FROM `TB_TR_DEVICE` WHERE device_id in (?)', [device_id], (err, startdate) => {
                                                conn.query('SELECT COUNT(*) as num,device_id FROM TB_TR_LOG WHERE device_id IN (?) GROUP BY device_id', [device_id], (err, COUNT_log) => {
                                                    var log = []
                                                    var pushlog = []
                                                    for (var i = 0; i < COUNT_file.length; i++) {
                                                        pushdata.push({ file: COUNT_file[i].num, event: COUNT_events[i].num, date: startdate[i].startdate, log: COUNT_log[i].num, size: COUNT_events[i].size,name: COUNT_file[i].name });
                                                    }
                                                    for (var i = 1; i < device_id.length; i++) {
                                                        var id = device_id[i]
                                                        conn.query('SELECT hour(TB_TR_LOG.date) AS hour,COUNT(*) as num,TB_TR_DEVICE.name FROM `TB_TR_LOG` JOIN TB_TR_DEVICE on TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.device_id= ? GROUP BY hour(TB_TR_LOG.date) ORDER BY hour(TB_TR_LOG.date)', [id], (err, COUNT_log2) => {
                                                            if (COUNT_log2) {
                                                                for (var j = 0; j < COUNT_log2.length; j++) {
                                                                    pushlog.push(COUNT_log2[j].num)
                                                                }
                                                            }
                                                            pushlog.push(log);
                                                        });
                                                    }
                                                    conn.query('SELECT COUNT(*) as num FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id', (err, Total_Events2) => {
                                                        req.session.pushdata = pushdata;
                                                        res.render('./export/compare_list', {
                                                            data: Top_Total_Event,
                                                            data2: Top_EPS,
                                                            data3: Total_Events,
                                                            data4: Total_Events2,
                                                            data5: pie,
                                                            data6: device,
                                                            // data7: pushdata,
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
                });
            });
        });
    }
};
module.exports = controller;