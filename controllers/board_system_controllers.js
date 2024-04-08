const controller = {};
const uuidv4 = require("uuid").v4;
const addDate = require("../utils/addDate")

var md5 = require('md5');
var sha1 = require('sha1');
var sha256 = require('sha256');

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

controller.monitor = (req, res) => {
    //const data = req.body;
    id = req.session.userid;
    //console.log(req.session);
    var logperhour = [];

    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {

        
        req.getConnection((err, conn) => {
            conn.query("SELECT f.name,f.status FROM TB_TR_FAVORITE as f", (err, favorite) => {
                conn.query('SELECT * FROM TB_TR_LOG as l WHERE DATE_FORMAT(l.date, "%Y-%m-%d") = DATE_FORMAT(now(), "%Y-%m-%d")', (err, data1) => {
                    conn.query('SELECT * FROM TB_TR_LOG as l WHERE NOT DATE_FORMAT(l.date, "%Y-%m-%d") = DATE_FORMAT(now(), "%Y-%m-%d")', (err, data2) => {
                        conn.query('SELECT a.acc_id as acc_id,DATE_FORMAT(ha.date, "%Y-%m-%d") as date FROM TB_TR_HISTORY_ALERT as ha JOIN TB_TR_ALERT as a on ha.alert_id = a.alert_id JOIN TB_TR_DEVICE as d on a.device_id = d.device_id JOIN TB_TR_ACCOUNT as acc on a.acc_id = acc.acc_id WHERE ha.date BETWEEN adddate(now(),-7) and now() and a.type_alert = "email"', (err, data_chart_3) => {
                            conn.query('SELECT CONCAT(d.name, ": ปกติ") as title , DATE_FORMAT(l.date, "%Y-%m-%d") as start, "bg-success" as className FROM TB_TR_LOG as l JOIN TB_TR_DEVICE as d on l.device_id = d.device_id group by DATE_FORMAT(l.date, "%Y-%m-%d"), l.device_id', (err, data7) => {
                                conn.query('SELECT sum(f.size * 0.001) as size FROM TB_TR_EXPORTHISTORY as ex INNER JOIN TB_TR_FILE as f on ex.file_id = f.file_id WHERE ex.date BETWEEN adddate(now(),-7) and now()', (err, data8) => { //จำนวนการ dowsnload 20 วัน
                                    conn.query('SELECT sum(f.size * 0.001) as size FROM TB_TR_EXPORTHISTORY as ex INNER JOIN TB_TR_FILE as f on ex.file_id = f.file_id WHERE ex.date BETWEEN adddate(now(),-7) and now()', (err, data9) => { //จำนวนก่อน dowsnload 20 วัน
                                        conn.query('SELECT "ALLTRA" as name,DATE_FORMAT(ha.date, "%Y-%m-%d") as date FROM TB_TR_HISTORY_ALERT as ha JOIN TB_TR_ALERT as a on ha.alert_id = a.alert_id JOIN TB_TR_DEVICE as d on a.device_id = d.device_id WHERE NOT ha.date BETWEEN adddate(now(),-7) and now() and a.type_alert = "email"', (err, data10) => {
                                            conn.query('SELECT DATE_FORMAT(ha.date, "%Y-%m-%d") as date, a.type_alert, d.name FROM TB_TR_HISTORY_ALERT as ha JOIN TB_TR_ALERT as a on ha.alert_id = a.alert_id JOIN TB_TR_DEVICE as d on a.device_id = d.device_id WHERE ha.date BETWEEN adddate(now(),-7) and now() and not a.type_alert = "email"', (err, data12) => { //data chart3 v2
                                                conn.query('SELECT DATE_FORMAT(ha.date, "%Y-%m-%d") as date, a.type_alert, d.name FROM TB_TR_HISTORY_ALERT as ha JOIN TB_TR_ALERT as a on ha.alert_id = a.alert_id JOIN TB_TR_DEVICE as d on a.device_id = d.device_id WHERE NOT ha.date BETWEEN adddate(now(),-7) and now() and not a.type_alert = "email"', (err, data14) => { //data vs chart3 v2
                                                    conn.query('SELECT * FROM TB_TR_ACCOUNT', (err, data13) => { //account
                                                        if (err) {
                                                            res.json(err);
                                                        }


                                                        v_average_2 = 0;
                                                        v_2 = 0;
                                                        v_compare_2 = 0;

                                                        if (data_chart_3.length, data10.length) {
                                                            v_average_2 = ((data_chart_3.length / data10.length) * 100).toFixed(2);
                                                            v_2 = data_chart_3.length;
                                                            v_compare_2 = data10.length;
                                                        }

                                                        // console.log(v_average_2);
                                                        // console.log(v_2);
                                                        // console.log(v_compare_2);

                                                        data11 = [];
                                                        for (let m = 0; m < data_chart_3.length; m++) {

                                                            if (m + 1 < data_chart_3.length) {
                                                                // console.log(data_chart_3[m].date);
                                                                // console.log(data_chart_3[m + 1].date);
                                                                var aa = new Date(data_chart_3[m].date);
                                                                var bb = new Date(data_chart_3[m + 1].date);
                                                                var cc = (aa - bb) / 86400000;
                                                                var date_mes = { acc_id: data_chart_3[m].acc_id.split(","), date: data_chart_3[m].date, date_ms: `ระบบไม่ส่ง Log มาจำนวนวัน ${cc} วัน`, }
                                                                data11.push(date_mes)
                                                            }
                                                        }
                                                        // console.log(data11);



                                                        v_average_1 = 0;
                                                        v_1 = 0;
                                                        v_compare_1 = 0;

                                                        v_average_3 = 0;
                                                        v_3 = 0;
                                                        v_compare_3 = 0;

                                                        v_average_6 = 0;
                                                        v_6 = 0;
                                                        v_compare_6 = 0;

                                                        if (data1, data2) {
                                                            v_average_1 = ((data1.length / data2.length) * 100).toFixed(2);
                                                            v_1 = data1.length;
                                                            v_compare_1 = data2.length;
                                                        }


                                                        console.log(data12.length, data13.length);

                                                        if (data12, data14) {
                                                            v_average_3 = ((data12.length / data14.length) * 100).toFixed(2);
                                                            v_3 = data12.length;
                                                            v_compare_3 = data14.length;
                                                        }

                                                        if (data8, data9) {
                                                            v_average_6 = ((data8[0].size / data9[0].size) * 100).toFixed(2);
                                                            v_6 = data8[0].size;
                                                            v_compare_6 = data9[0].size;
                                                        }
                                                        // console.log(v_average_1);
                                                        // console.log(v_3);
                                                        // console.log(v_compare_3);
                                                        // console.log(data8[0].size);
                                                        controller.funchistory(req,"monitor_system", "เข้าสู่เมนู แสดงข้อมูลระบบ", req.session.userid)
                                                        res.render("monitor/monitor", {
                                                            v_average_1: v_average_1,
                                                            v_1: v_1,
                                                            v_compare_1: v_compare_1,

                                                            v_average_2: v_average_2,
                                                            v_2: v_2,
                                                            v_compare_2: v_compare_2,

                                                            v_average_3: v_average_3,
                                                            v_3: v_3,
                                                            v_compare_3: v_compare_3,

                                                            v_average_6: v_average_6,
                                                            v_6: v_6,
                                                            v_compare_6: v_compare_6,

                                                            data: favorite,
                                                            data7: data7,
                                                            data8: data8,
                                                            data_chart_3: data_chart_3,
                                                            data11: data11,
                                                            data12: data12,
                                                            data13: data13,
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




controller.favorite = (req, res) => {
    //const data = req.body;
    id = req.session.userid;
    //console.log(req.session);
    var logperhour = [];

    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            conn.query("SELECT f.name,f.status FROM TB_TR_FAVORITE as f", (err, favorite) => {
                conn.query('SELECT * FROM TB_TR_LOG as l WHERE DATE_FORMAT(l.date, "%Y-%m-%d") = DATE_FORMAT(now(), "%Y-%m-%d")', (err, data1) => {
                    conn.query('SELECT * FROM TB_TR_LOG as l WHERE NOT DATE_FORMAT(l.date, "%Y-%m-%d") = DATE_FORMAT(now(), "%Y-%m-%d")', (err, data2) => {
                        conn.query('SELECT a.acc_id as acc_id,DATE_FORMAT(ha.date, "%Y-%m-%d") as date FROM TB_TR_HISTORY_ALERT as ha JOIN TB_TR_ALERT as a on ha.alert_id = a.alert_id JOIN TB_TR_DEVICE as d on a.device_id = d.device_id JOIN TB_TR_ACCOUNT as acc on a.acc_id = acc.acc_id WHERE ha.date BETWEEN adddate(now(),-7) and now() and a.type_alert = "email"', (err, data_chart_3) => {
                            conn.query('SELECT CONCAT(d.name, ": ปกติ") as title , DATE_FORMAT(l.date, "%Y-%m-%d") as start, "bg-success" as className FROM TB_TR_LOG as l JOIN TB_TR_DEVICE as d on l.device_id = d.device_id group by DATE_FORMAT(l.date, "%Y-%m-%d"), l.device_id', (err, data7) => {
                                conn.query('SELECT sum(f.size * 0.001) as size FROM TB_TR_EXPORTHISTORY as ex INNER JOIN TB_TR_FILE as f on ex.file_id = f.file_id WHERE ex.date BETWEEN adddate(now(),-7) and now()', (err, data8) => { //จำนวนการ dowsnload 20 วัน
                                    conn.query('SELECT sum(f.size * 0.001) as size FROM TB_TR_EXPORTHISTORY as ex INNER JOIN TB_TR_FILE as f on ex.file_id = f.file_id WHERE ex.date BETWEEN adddate(now(),-7) and now()', (err, data9) => { //จำนวนก่อน dowsnload 20 วัน
                                        conn.query('SELECT "ALLTRA" as name,DATE_FORMAT(ha.date, "%Y-%m-%d") as date FROM TB_TR_HISTORY_ALERT as ha JOIN TB_TR_ALERT as a on ha.alert_id = a.alert_id JOIN TB_TR_DEVICE as d on a.device_id = d.device_id WHERE NOT ha.date BETWEEN adddate(now(),-7) and now() and a.type_alert = "email"', (err, data10) => {
                                            conn.query('SELECT DATE_FORMAT(ha.date, "%Y-%m-%d") as date, a.type_alert, d.name FROM TB_TR_HISTORY_ALERT as ha JOIN TB_TR_ALERT as a on ha.alert_id = a.alert_id JOIN TB_TR_DEVICE as d on a.device_id = d.device_id WHERE ha.date BETWEEN adddate(now(),-7) and now() and not a.type_alert = "email"', (err, data12) => { //data chart3 v2
                                                conn.query('SELECT DATE_FORMAT(ha.date, "%Y-%m-%d") as date, a.type_alert, d.name FROM TB_TR_HISTORY_ALERT as ha JOIN TB_TR_ALERT as a on ha.alert_id = a.alert_id JOIN TB_TR_DEVICE as d on a.device_id = d.device_id WHERE NOT ha.date BETWEEN adddate(now(),-7) and now() and not a.type_alert = "email"', (err, data14) => { //data vs chart3 v2
                                                    conn.query('SELECT * FROM TB_TR_ACCOUNT', (err, data13) => { //account
                                                        if (err) {
                                                            res.json(err);
                                                        }


                                                        v_average_2 = 0;
                                                        v_2 = 0;
                                                        v_compare_2 = 0;

                                                        if (data_chart_3.length, data10.length) {
                                                            v_average_2 = ((data_chart_3.length / data10.length) * 100).toFixed(2);
                                                            v_2 = data_chart_3.length;
                                                            v_compare_2 = data10.length;
                                                        }

                                                        // console.log(v_average_2);
                                                        // console.log(v_2);
                                                        // console.log(v_compare_2);

                                                        data11 = [];
                                                        for (let m = 0; m < data_chart_3.length; m++) {

                                                            if (m + 1 < data_chart_3.length) {
                                                                // console.log(data_chart_3[m].date);
                                                                // console.log(data_chart_3[m + 1].date);
                                                                var aa = new Date(data_chart_3[m].date);
                                                                var bb = new Date(data_chart_3[m + 1].date);
                                                                var cc = (aa - bb) / 86400000;
                                                                var date_mes = { acc_id: data_chart_3[m].acc_id.split(","), date: data_chart_3[m].date, date_ms: `ระบบไม่ส่ง Log มาจำนวนวัน ${cc} วัน`, }
                                                                data11.push(date_mes)
                                                            }
                                                        }
                                                        // console.log(data11);



                                                        v_average_1 = 0;
                                                        v_1 = 0;
                                                        v_compare_1 = 0;

                                                        v_average_3 = 0;
                                                        v_3 = 0;
                                                        v_compare_3 = 0;

                                                        v_average_6 = 0;
                                                        v_6 = 0;
                                                        v_compare_6 = 0;

                                                        if (data1, data2) {
                                                            v_average_1 = ((data1.length / data2.length) * 100).toFixed(2);
                                                            v_1 = data1.length;
                                                            v_compare_1 = data2.length;
                                                        }


                                                        console.log(data12.length, data13.length);

                                                        if (data12, data14) {
                                                            v_average_3 = ((data12.length / data14.length) * 100).toFixed(2);
                                                            v_3 = data12.length;
                                                            v_compare_3 = data14.length;
                                                        }

                                                        if (data8, data9) {
                                                            v_average_6 = ((data8[0].size / data9[0].size) * 100).toFixed(2);
                                                            v_6 = data8[0].size;
                                                            v_compare_6 = data9[0].size;
                                                        }
                                                        // console.log(v_average_1);
                                                        // console.log(v_3);
                                                        // console.log(v_compare_3);
                                                        // console.log(data8[0].size);
                                                        controller.funchistory(req,"monitor_favorite", "เข้าสู่เมนู ข้อมูลที่ชื่นชอบ", req.session.userid)
                                                        res.render("monitor/favorite", {
                                                            v_average_1: v_average_1,
                                                            v_1: v_1,
                                                            v_compare_1: v_compare_1,

                                                            v_average_2: v_average_2,
                                                            v_2: v_2,
                                                            v_compare_2: v_compare_2,

                                                            v_average_3: v_average_3,
                                                            v_3: v_3,
                                                            v_compare_3: v_compare_3,

                                                            v_average_6: v_average_6,
                                                            v_6: v_6,
                                                            v_compare_6: v_compare_6,

                                                            data: favorite,
                                                            data7: data7,
                                                            data8: data8,
                                                            data_chart_3: data_chart_3,
                                                            data11: data11,
                                                            data12: data12,
                                                            data13: data13,
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



controller.compare = (req, res) => {
    //const data = req.body;
    id = req.session.userid;
    //console.log(req.session);
    var logperhour = [];

    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_DEVICE", (err, data) => {
                conn.query('SELECT DATE_FORMAT(device.rmfile, "%Y-%m-%d") as date FROM TB_TR_DEVICE', (err, data2) => {
                    conn.query('SELECT COUNT(l.log_id) FROM TB_TR_LOG as l JOIN TB_TR_DEVICE as d on l.device_id = d.device_id group by l.device_id', (err, data3) => {
                        conn.query('SELECT d.device_id as did FROM TB_TR_LOG as l JOIN TB_TR_DEVICE as d on l.device_id = d.device_id group by l.date,l.device_id', (err, data4) => {
                            conn.query('SELECT COUNT(l.log_id) as sum_c FROM TB_TR_LOG as l JOIN TB_TR_DEVICE as d on l.device_id = d.device_id group by l.date,l.device_id', (err, data5) => {
                                conn.query('SELECT DATE_FORMAT(l.date, "%Y-%m-%d %H:%i:%s") as date FROM TB_TR_LOG as l JOIN TB_TR_DEVICE as d on l.device_id = d.device_id group by l.date,l.device_id', (err, data6) => {
                                    conn.query('SELECT f.file_id as fid, d.device_id as did,ft.path FROM TB_TR_FILE as f INNER JOIN TB_TR_DEVICE as d on f.device_id = d.device_id INNER JOIN TB_TR_IMPORT as ft on ft.name = d.name', (err, data8) => { //ที่เก็บไฟล์
                                        conn.query('SELECT d.keep,DATE_FORMAT(adddate(now(),-90), "%Y-%m-%d") as start_file FROM TB_TR_DEVICE as d', (err, data9) => {
                                            conn.query('SELECT d.device_id as did FROM TB_TR_DEVICE as d group by d.device_id', (err, ar) => {
                                                conn.query('SELECT f.device_id,sum(f.size) as s_size FROM TB_TR_FILE as f group by f.device_id', (err, data10) => {

                                                    if (err) {
                                                        res.json(err);
                                                    }

                                                    var element = [];
                                                    var element2 = [];
                                                    var element3 = [];
                                                    var element4 = [];
                                                    console.log(data4);
                                                    for (let a = 0; a < data4.length; a++) {
                                                        element.push(data4[a].did)
                                                    }
                                                    for (let b = 0; b < data5.length; b++) {
                                                        element2.push(data5[b].sum_c)
                                                    }
                                                    for (let c = 0; c < data6.length; c++) {
                                                        element3.push(data6[c].date)
                                                    }

                                                    for (let d = 0; d < ar.length; d++) {
                                                        element4.push(ar[d].did)
                                                    }




                                                    // console.log(element);
                                                    // console.log(element2);
                                                    // console.log(element3);

                                                    var arr = element4
                                                    var uniqueArr = [...new Set(arr)]
                                                    // console.log(uniqueArr)

                                                    console.log(uniqueArr);
                                                    controller.funchistory(req,"monitor_compare", "เข้าสู่เมนู เปรียบเทียบอุปกรณ์", req.session.userid)
                                                    res.render("monitor/compare", {
                                                        data: data,
                                                        data2: data2,
                                                        data3: data3,
                                                        data4: element,
                                                        data5: element2,
                                                        data6: element3,
                                                        data7: uniqueArr,
                                                        data8: data8,
                                                        data9: data9,
                                                        data10: data10,
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
    }
};

controller.watchdog = (req, res) => {
    userid = req.session.userid;
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_DEVICE", (err, device) => {
                conn.query("SELECT TB_TR_WATCH_DOG.*,TB_TR_DEVICE.name,TB_TR_DEVICE.sender,TB_TR_DEVICE.data_type,DATE_FORMAT((TB_TR_WATCH_DOG.datetime1),'%Y-%m-%d %T') as datetime1,DATE_FORMAT((TB_TR_WATCH_DOG.datetime2),'%Y-%m-%d %T') as datetime2 FROM `TB_TR_WATCH_DOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_WATCH_DOG.device_id ORDER BY TB_TR_WATCH_DOG.wd_id ASC;", (err, watchdog) => {
                    conn.query("SELECT * FROM `TB_TR_ACCOUNT` WHERE acc_id = ?", [userid], (err, account) => {
                        // conn.query('SELECT DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 0 DAY),"%Y-%m-%d") as date', (err, date1) => {
                        //     conn.query('SELECT DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 1 DAY),"%Y-%m-%d") as date', (err, date2) => {
                        if (err) {
                            res.json(err);
                        }
                        res.render("monitor/watchdog", {
                            device,
                            watchdog,
                            account,
                            session: req.session
                        });
                        //     });
                        // });
                    });
                });
            });
        });
    }
};
controller.delwatch = (req, res) => {
    userid = req.session.userid;
    const { wd_id } = req.params;
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            conn.query("DELETE FROM `DOL_PDPA_LOCAL`.`TB_TR_WATCH_DOG` WHERE (`wd_id` = ?);", [wd_id], (err, watchdog) => {
                if (err) {
                    res.json(err);
                }
                res.redirect("/watchdog");
            });
        });
    }
};

controller.addwatchdog = (req, res) => {
    const data = req.body;
    userid = req.session.userid;
    // res.json(data)
    //frequency_email frequency_share: = 0 เมื่อพบข้อมูล
    // frequency_email = 1  frequency_share: '1' ความถี่ในการส่งต่อ ชม.
    // if (data.frequency_email) {
    //     data.email = 1;
    //     data.share = 0;
    //     data.frequency = data.frequency1
    //     if (data.frequency == "") {
    //         data.frequency = 24
    //     }
    // } else {
    //     data.email = 0;
    //     data.share = 1;
    //     data.frequency = data.frequency2
    //     if (data.frequency == "") {
    //         data.frequency = 0
    //     }
    // }

    var w = (data.datetime1)
    w = w.split("T");
    data.datetime1 = w[0] + ' ' + w[1]
    var q = (data.datetime2)
    q = q.split("T");
    data.datetime1 = w[0] + ' ' + w[1]
    data.datetime2 = q[0] + ' ' + q[1]

    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        id = req.session.userid;
        req.getConnection((err, conn) => {
            var pushdata = []
            pushdata.push({ device_id: data.device_id, wd_name: data.wd_name, user_id: data.user_id, source_ip: data.source_ip, destination_ip: data.destination_ip, port: data.port, datetime1: data.datetime1, datetime2: data.datetime2, access_log: data.access_log, frequency: data.frequency, email_send: data.email_send, share: 24, acc_id: userid });
            console.log(pushdata[0]);
            conn.query("INSERT INTO TB_TR_WATCH_DOG SET ?", [pushdata[0]], (err, log) => {
                if (err) {
                    res.json(err);
                }
                res.redirect("/watchdog");
            });
        });
    }
};
controller.editwatchdog = (req, res) => {
    const data = req.body;
    userid = req.session.userid;
    //frequency_email frequency_share: = 0 เมื่อพบข้อมูล
    // frequency_email = 1  frequency_share: '1' ความถี่ในการส่งต่อ ชม.

    // if (data.frequency_email) {
    //     data.email = 1;
    //     data.share = 0;
    //     data.frequency = data.frequency1
    //     if (data.frequency == "") {
    //         data.frequency = 0
    //     }
    // } else if (data.frequency_share) {
    //     data.email = 0;
    //     data.share = 1;
    //     data.frequency = data.frequency2
    // } else {
    //     data.email = 0;
    //     data.share = 1;
    //     data.frequency = 1
    // }

    var w = (data.datetime1)
    w = w.split("T");
    data.datetime1 = w[0] + ' ' + w[1]
    var q = (data.datetime2)
    q = q.split("T");
    data.datetime1 = w[0] + ' ' + w[1]
    data.datetime2 = q[0] + ' ' + q[1]
    console.log(data);

    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            var pushdata = []
            pushdata.push({ device_id: data.device_id, wd_name: data.wd_name, user_id: data.user_id, source_ip: data.source_ip, destination_ip: data.destination_ip, port: data.port, datetime1: data.datetime1, datetime2: data.datetime2, access_log: data.access_log, frequency: data.frequency, email_send: data.email_send, share: 24, acc_id: userid });
            console.log(pushdata[0]);
            conn.query("UPDATE TB_TR_WATCH_DOG SET ? WHERE wd_id = ?", [pushdata[0], data.wd_id], (err, log) => {
                if (err) {
                    res.json(err);
                }
                res.redirect("/watchdog");
            });
        });
    }
};


controller.exportdata = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT f.name as fname, d.name, d.sender, "-" as hl0, DATE_FORMAT(f.date, "%Y-%m-%d") as date, SUBSTRING(f.hash, 1, 20) as hash, "N/A" as ch, "**********" as hl3, "MySQL" as sav FROM TB_TR_FILE as f JOIN TB_TR_DEVICE as d on f.device_id = d.device_id', (err, data18) => { //
            res.send(data18)
        });
    });
};

controller.exportdata_out = (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT f.name as fname,' - ' as export, d.sender, "**********" as hl3, d.name, DATE_FORMAT(f.date, "%Y-%m-%d") as date, SUBSTRING(f.hash, 1, 20) as hash, "N/A" as ch, "MySQL" as sav,' - ' as hl0 FROM TB_TR_EXPORTHISTORY as ex JOIN TB_TR_FILE as f on ex.file_id = f.file_id JOIN TB_TR_DEVICE as d on f.device_id = d.device_id', (err, data19) => { //
            res.send(data19)
        });
    });
};

controller.datain = (req, res) => {
    //const data = req.body;
    id = req.session.userid;
    //console.log(req.session);
    var logperhour = [];

    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_DEVICE as d", (err, data) => {
                conn.query('SELECT DATE_FORMAT(l.date, "%Y-%m-%d") as date FROM TB_TR_LOG as l group by DATE_FORMAT(l.date, "%Y-%m-%d")', (err, data10) => { //date รวมทั้งหมดของ log
                    conn.query('SELECT COUNT(l.log_id) as s,l.device_id as did, DATE_FORMAT(l.date, "%Y-%m-%d") as date FROM TB_TR_LOG as l group by DATE_FORMAT(l.date, "%Y-%m-%d"),did', (err, data11) => { //device id และ date ของ log
                        conn.query('SELECT * FROM TB_TR_DEVICE as d group by d.device_id', (err, data12) => { //device id ทั้งหมด
                            conn.query('SELECT * FROM TB_TR_DEVICE as d WHERE d.sender = "UDP"', (err, data13) => { //device UDP
                                conn.query('SELECT * FROM TB_TR_DEVICE as d WHERE d.sender = "FTP"', (err, data14) => { //device FTP
                                    conn.query('SELECT * FROM TB_TR_ACCOUNT as a WHERE a.admin = "1"', (err, data15) => { //account ผู้ดูแลระบบ
                                        conn.query('SELECT * FROM TB_TR_DEVICE as d JOIN TB_TR_IMPORT as f on f.device_id = d.device_id', (err, data16) => { //
                                            conn.query('SELECT * FROM  TB_TR_USER_MEMBER as um JOIN TB_TR_ACCOUNT as a on um.acc_id = a.acc_id JOIN TB_TR_GROUP as g on um.group_id = g.group_id', (err, data17) => { //
                                                conn.query('SELECT f.name as fname, d.name, d.sender, DATE_FORMAT(f.date, "%Y-%m-%d") as date, SUBSTRING(f.hash, 1, 20) as hash FROM TB_TR_FILE as f JOIN TB_TR_DEVICE as d on f.device_id = d.device_id', (err, data18) => { //
                                                    conn.query('SELECT DATE_FORMAT(l.date, "%Y-%m") as date FROM TB_TR_LOG as l group by DATE_FORMAT(l.date, "%Y-%m")', (err, data19) => { //
                                                        conn.query('SELECT DATE_FORMAT(l.date, "%Y-%m") as date FROM TB_TR_LOG as l group by DATE_FORMAT(l.date, "%Y-%m")', (err, data20) => { //
                                                            if (err) {
                                                                res.json(err);
                                                            }


                                                            datax = [];
                                                            data_date = [];
                                                            color_r = [];


                                                            for (let b = 0; b < data12.length; b++) { //id deice
                                                                data_p = {
                                                                    name: '',
                                                                    data: [],
                                                                }
                                                                data_p.name = (data12[b].name).toString();

                                                                for (let a = 0; a < data10.length; a++) { // date
                                                                    for (let c = 0; c < data11.length; c++) {

                                                                        if (data11[c].date == data10[a].date && data11[c].did == data12[b].device_id) { // date,count
                                                                            data_p.data.push(data11[c].s)
                                                                        } else if (data11[c].date == data10[a].date && data11[c].did != data12[b].device_id) {
                                                                            data_p.data.push(0)
                                                                        }
                                                                    }

                                                                }
                                                                datax.push(data_p);
                                                            }
                                                            for (let d = 0; d < data11.length; d++) {
                                                                data_date.push(data11[d].date)

                                                            }

                                                            for (let e = 0; e < data12.length; e++) {
                                                                color_r.push(generateRandomColor())

                                                            }

                                                            function generateRandomColor() {
                                                                let maxVal = 0xFFFFFF; // 16777215
                                                                let randomNumber = Math.random() * maxVal;
                                                                randomNumber = Math.floor(randomNumber);
                                                                randomNumber = randomNumber.toString(16);
                                                                let randColor = randomNumber.padStart(6, 0);
                                                                return `#${randColor.toUpperCase()}`
                                                            }

                                                            // console.log(datax);
                                                            // console.log(data_date);
                                                            // console.log(color_r);


                                                            test = [];

                                                            for (let y = 0; y < datax.length; y++) {
                                                                test.push(datax[y].data)

                                                            }
                                                            console.log(data19);
                                                            controller.funchistory(req,"monitor_data_in", "เข้าสู่เมนู แสดงข้อมูลเข้า", req.session.userid)
                                                            res.render("monitor/datain", {
                                                                data: data,
                                                                data10: data10,
                                                                data2: datax, //value ของกราฟ
                                                                data3: data_date, //date
                                                                data5: color_r, //color
                                                                data13: data13,
                                                                data14: data14,
                                                                data15: data15,
                                                                data16: data16,
                                                                data17: data17,
                                                                data18: data18,
                                                                data19: data19,
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
        });
    }
};

controller.dataout = (req, res) => {
    //const data = req.body;
    id = req.session.userid;
    //console.log(req.session);
    var logperhour = [];

    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_DEVICE as d", (err, data) => {
                conn.query('SELECT DATE_FORMAT(l.date, "%Y-%m-%d") as date FROM TB_TR_LOG as l group by DATE_FORMAT(l.date, "%Y-%m-%d")', (err, data10) => { //date รวมทั้งหมดของ log
                    conn.query('SELECT COUNT(l.log_id) as s,l.device_id as did, DATE_FORMAT(l.date, "%Y-%m-%d") as date FROM TB_TR_LOG as l group by DATE_FORMAT(l.date, "%Y-%m-%d"),did', (err, data11) => { //device id และ date ของ log
                        conn.query('SELECT * FROM TB_TR_DEVICE as d group by d.device_id', (err, data12) => { //device id ทั้งหมด
                            conn.query('SELECT * FROM TB_TR_DEVICE as d WHERE d.sender = "UDP"', (err, data13) => { //device UDP
                                conn.query('SELECT * FROM TB_TR_DEVICE as d WHERE d.sender = "FTP"', (err, data14) => { //device FTP
                                    conn.query('SELECT * FROM TB_TR_ACCOUNT as a WHERE a.admin = "1"', (err, data15) => { //account ผู้ดูแลระบบ
                                        conn.query('SELECT * FROM TB_TR_DEVICE as d JOIN TB_TR_IMPORT as f on f.device_id = d.device_id', (err, data16) => { //
                                            conn.query('SELECT * FROM TB_TR_USER_MEMBER as um JOIN TB_TR_ACCOUNT as a on um.acc_id = a.acc_id JOIN TB_TR_GROUP as g on um.group_id = g.group_id', (err, data17) => { //
                                                conn.query('SELECT f.name as fname, d.name, d.sender, DATE_FORMAT(f.date, "%Y-%m-%d") as date, SUBSTRING(f.hash, 1, 20) as hash,DATE_FORMAT(ex.date, "%Y-%m-%d") as exdate FROM TB_TR_EXPORTHISTORY as ex JOIN TB_TR_FILE as f on ex.file_id = f.file_id JOIN TB_TR_DEVICE as d on f.device_id = d.device_id LIMIT 10', (err, data18) => { //
                                                    conn.query('SELECT DATE_FORMAT(l.date, "%Y-%m") as date FROM TB_TR_LOG as l group by DATE_FORMAT(l.date, "%Y-%m")', (err, data19) => { //
                                                        conn.query('SELECT DATE_FORMAT(l.date, "%Y-%m") as date FROM TB_TR_LOG as l group by DATE_FORMAT(l.date, "%Y-%m")', (err, data20) => { //
                                                            if (err) {
                                                                res.json(err);
                                                            }


                                                            datax = [];
                                                            data_date = [];
                                                            color_r = [];


                                                            for (let b = 0; b < data12.length; b++) { //id deice
                                                                data_p = {
                                                                    name: '',
                                                                    data: [],
                                                                }
                                                                data_p.name = (data12[b].name).toString();

                                                                for (let a = 0; a < data10.length; a++) { // date
                                                                    for (let c = 0; c < data11.length; c++) {

                                                                        if (data11[c].date == data10[a].date && data11[c].did == data12[b].device_id) { // date,count
                                                                            data_p.data.push(data11[c].s)
                                                                        } else if (data11[c].date == data10[a].date && data11[c].did != data12[b].device_id) {
                                                                            data_p.data.push(0)
                                                                        }
                                                                    }

                                                                }
                                                                datax.push(data_p);
                                                            }
                                                            for (let d = 0; d < data11.length; d++) {
                                                                data_date.push(data11[d].date)

                                                            }

                                                            for (let e = 0; e < data12.length; e++) {
                                                                color_r.push(generateRandomColor())

                                                            }

                                                            function generateRandomColor() {
                                                                let maxVal = 0xFFFFFF; // 16777215
                                                                let randomNumber = Math.random() * maxVal;
                                                                randomNumber = Math.floor(randomNumber);
                                                                randomNumber = randomNumber.toString(16);
                                                                let randColor = randomNumber.padStart(6, 0);
                                                                return `#${randColor.toUpperCase()}`
                                                            }

                                                            // console.log(datax);
                                                            // console.log(data_date);
                                                            // console.log(color_r);


                                                            test = [];

                                                            for (let y = 0; y < datax.length; y++) {
                                                                test.push(datax[y].data)

                                                            }
                                                            console.log(data19);
                                                            controller.funchistory(req,"monitor_data_out", "เข้าสู่เมนู แสดงข้อมูลออก", req.session.userid)
                                                            res.render("monitor/dataout", {
                                                                data: data,
                                                                data10: data10,
                                                                data2: datax, //value ของกราฟ
                                                                data3: data_date, //date
                                                                data5: color_r, //color
                                                                data13: data13,
                                                                data14: data14,
                                                                data15: data15,
                                                                data16: data16,
                                                                data17: data17,
                                                                data18: data18,
                                                                data19: data19,
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
        });
    }
};


controller.up = (req, res) => {
    const data = req.body;
    // console.log(data);
    req.getConnection((err, conn) => {
        conn.query('UPDATE TB_TR_FAVORITE SET TB_TR_FAVORITE.status = ? WHERE TB_TR_FAVORITE.name = ?', [data.status, data.name], (err, favorite) => {
            res.send({ favorite: favorite })
        });
    });
};


controller.log_chart_1 = (req, res) => {

    req.getConnection((err, conn) => {
        conn.query('SELECT COUNT(l.log_id) as sum, DATE_FORMAT(now(), "%Y-%m-%d") as now,DATE_FORMAT(l.date, "%Y-%m-%d") as ldate,DATE_FORMAT(l.date, "%H:%i:%s") as time FROM TB_TR_LOG as l WHERE DATE_FORMAT(l.date, "%Y-%m-%d") = DATE_FORMAT(now(), "%Y-%m-%d") group by time ORDER by time ASC', (err, log_chart1) => {
            conn.query('SELECT l.log_id, d.hostname, d.de_ip, DATE_FORMAT(l.date, "%H:%i:%s") as date,l.msg FROM TB_TR_LOG as l JOIN TB_TR_DEVICE as d on l.device_id = d.device_id ORDER BY l.date DESC LIMIT 1', (err, data_chart1) => {
                conn.query('SELECT DATE_FORMAT(ha.date, "%Y-%m-%d") as date,COUNT(DATE_FORMAT(ha.date, "%Y-%m-%d")) as cs FROM TB_TR_HISTORY_ALERT as ha JOIN TB_TR_ALERT as a on ha.alert_id = a.alert_id JOIN TB_TR_DEVICE as d on a.device_id = d.device_id WHERE ha.date BETWEEN adddate(now(),-7) and now() and not a.type_alert = "email" group by DATE_FORMAT(ha.date, "%Y-%m-%d")', (err, data_chart3) => {
                    conn.query('SELECT pf.performance_id as id, pf.cpu, pf.cpuused, pf.mem, ROUND(pf.memused,2) as memused, ROUND(sum(memused*100/(mem+memused)), 0) as sum_mem, pf.storage,pf.storageused, pf.storageper FROM TB_TR_PERFORMANCE as pf', (err, pf) => {
                        conn.query('SELECT COUNT(l.log_id) as sum,DATE_FORMAT(l.date, "%Y-%m-%d") as ldate FROM TB_TR_LOG as l group by ldate order by ldate asc', (err, data_chart5) => {
                            conn.query('SELECT DATE_FORMAT(ha.date, "%Y-%m-%d") as date,COUNT(DATE_FORMAT(ha.date, "%Y-%m-%d")) as sdate FROM TB_TR_HISTORY_ALERT as ha JOIN TB_TR_ALERT as a on ha.alert_id = a.alert_id JOIN TB_TR_DEVICE as d on a.device_id = d.device_id WHERE ha.date BETWEEN adddate(now(),-7) and now() and a.type_alert = "email" group by DATE_FORMAT(ha.date, "%Y-%m-%d")', (err, data_chart2) => {


                                res.send({ data: log_chart1, data_chart1, data_chart3, pf, data_chart5, data_chart2 })
                            });
                        });
                    });
                });
            });
        });
    });
};

controller.data_compare = (req, res) => {
    const { id } = req.params;
    // console.log(id);
    req.getConnection((err, conn) => {
        conn.query('SELECT COUNT(l.log_id) as cs FROM TB_TR_LOG as l JOIN TB_TR_DEVICE as d on l.device_id = d.device_id WHERE d.device_id = ?', [id], (err, count_d) => {
            conn.query('SELECT COUNT(l.log_id) as s FROM TB_TR_LOG as l JOIN TB_TR_DEVICE as d on l.device_id = d.device_id', (err, count_sum) => {

                var data_sum = ((count_d[0].cs / count_sum[0].s) * 100).toFixed(2);

                // console.log(data_sum);
                res.send({ data: data_sum })
            });
        });
    });
};

controller.datain_1 = (req, res) => {
    const { id } = req.params;
    console.log(id);
    req.getConnection((err, conn) => {
        conn.query('SELECT COUNT(*) as data_s,DATE_FORMAT(l.date, "%Y-%m-%d") as date FROM TB_TR_LOG as l WHERE DATE_FORMAT(l.date, "%Y-%m") = ? group by DATE_FORMAT(l.date, "%Y-%m-%d")', [id], (err, data1) => {
            conn.query('SELECT DATE_FORMAT(l.date, "%Y-%m-%d") as date FROM TB_TR_LOG as l WHERE DATE_FORMAT(l.date, "%Y-%m") = ? group by DATE_FORMAT(l.date, "%Y-%m-%d")', [id], (err, data10) => { //date รวมทั้งหมดของ log
                conn.query('SELECT * FROM TB_TR_DEVICE as d group by d.device_id', (err, data12) => { //device id ทั้งหมด
                    conn.query('SELECT COUNT(l.log_id) as s,l.device_id as did, DATE_FORMAT(l.date, "%Y-%m-%d") as date FROM TB_TR_LOG as l WHERE DATE_FORMAT(l.date, "%Y-%m") = ? group by DATE_FORMAT(l.date, "%Y-%m-%d"),did', [id], (err, data11) => { //device id และ date ของ log
                        conn.query('SELECT COUNT(*) as sum_c,DATE_FORMAT(l.date, "%Y-%m") as date FROM TB_TR_LOG as l WHERE DATE_FORMAT(l.date, "%Y-%m") = ? group by DATE_FORMAT(l.date, "%Y-%m")', [id], (err, data14) => { //count ทั้งหมด where จาก select
                            conn.query('SELECT COUNT(*) as sum_c,DATE_FORMAT(l.date, "%Y-%m") as date FROM TB_TR_LOG as l group by DATE_FORMAT(l.date, "%Y-%m")', (err, data15) => { //count ช่องที่ 0 Overall Growth
                                conn.query('SELECT COUNT(*) as sum_c FROM TB_TR_LOG as l WHERE NOT DATE_FORMAT(l.date, "%Y-%m") = ?', [id], (err, data16) => { //count รวม นอกจากค่าที่ส่งมา
                                    conn.query('SELECT COUNT(l.log_id) as s, DATE_FORMAT(l.date, "%Y-%m-%d") as date FROM TB_TR_LOG as l WHERE DATE_FORMAT(l.date, "%Y-%m") = ? group by DATE_FORMAT(l.date, "%Y-%m-%d") ORDER BY  DATE_FORMAT(l.date, "%Y-%m-%d") DESC', [id], (err, data17) => { //day
                                        datax = [];
                                        data_date = [];
                                        color_r = [];


                                        for (let b = 0; b < data12.length; b++) { //id deice
                                            data_p = {
                                                name: '',
                                                data: [],
                                            }
                                            data_p.name = (data12[b].name).toString();

                                            for (let a = 0; a < data10.length; a++) { // date
                                                for (let c = 0; c < data11.length; c++) {

                                                    if (data11[c].date == data10[a].date && data11[c].did == data12[b].device_id) { // date,count
                                                        data_p.data.push(data11[c].s)
                                                    } else if (data11[c].date == data10[a].date && data11[c].did != data12[b].device_id) {
                                                        data_p.data.push(0)
                                                    }
                                                }

                                            }
                                            datax.push(data_p);
                                        }

                                        // console.log(data11);
                                        for (let d = 0; d < data11.length; d++) {
                                            data_date.push(data11[d].date)

                                        }

                                        for (let e = 0; e < data12.length; e++) {
                                            color_r.push(generateRandomColor())

                                        }

                                        function generateRandomColor() {
                                            let maxVal = 0xFFFFFF; // 16777215
                                            let randomNumber = Math.random() * maxVal;
                                            randomNumber = Math.floor(randomNumber);
                                            randomNumber = randomNumber.toString(16);
                                            let randColor = randomNumber.padStart(6, 0);
                                            return `#${randColor.toUpperCase()}`
                                        }

                                        // console.log(data15[0].sum_c);
                                        og = ((data14[0].sum_c / data15[0].sum_c) * 100).toFixed(2);
                                        var m = 0;
                                        for (let i = 0; i < data15.length; i++) {
                                            if (data14[0].date == data15[i].date && i != 0) {
                                                var j = i - 1
                                                m = ((data14[0].sum_c / data15[j].sum_c) * 100).toFixed(2);
                                            }
                                            if (data14[0].date == data15[i].date && i == 0) {
                                                m = (100).toFixed(2);
                                            }

                                        }


                                        //==day==
                                        v_day = 0;

                                        if (data17.length > 1) {
                                            v_day = ((data17[0].s / data17[1].s) * 100).toFixed(2);
                                            console.log('t');
                                            console.log(data17.length);
                                        } else {
                                            v_day = (100).toFixed(2)
                                            console.log('f');
                                        }
                                        console.log(v_day);
                                        // console.log(data_date);
                                        // console.log(color_r);

                                        res.send({ data: data1, datax, data_date, color_r, og, m, v_day })
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

controller.user_activity = (req, res) => {
    const { id } = req.params;
    const date = addDate();
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_ACCOUNT', (err, data3) => {
            conn.query('SELECT * FROM TB_TR_ACCOUNT', (err, data2) => {
                if (err) {
                    res.json(err);
                }
                controller.funchistory(req,"monitor_user_activity", "เข้าสู่เมนู ตรวจสอบกิจกรรมของผู้ใช้", req.session.userid)
                res.render("monitor/user_activity", {
                    data2: data2,
                    data3: data3,
                    date: date,
                    session: req.session
                });
            });
        });
        });
    }
};

controller.user_activity_data = (req, res) => {
    const { id } = req.params;
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT h.acc_id,DATE_FORMAT(h.datetime, "%Y-%m-%d %H:%i:%s") as datetime,count(*) as c,h.type FROM TB_TR_HISTORY as h join TB_TR_ACCOUNT as a on h.acc_id = a.acc_id where DATE_FORMAT(h.datetime, "%Y-%m-%d") = DATE_FORMAT(now(), "%Y-%m-%d") group by DATE_FORMAT(h.datetime, "%Y-%m-%d %H"),h.acc_id,h.type order by h.datetime asc;', [id], (err, data) => {
                conn.query('SELECT h.acc_id,DATE_FORMAT(h.datetime, "%Y-%m-%d %H:%i:%s") as datetime,count(*) as c,h.type FROM TB_TR_HISTORY as h join TB_TR_ACCOUNT as a on h.acc_id = a.acc_id where h.type = "dataout_email" or h.type = "dataout_csv" or h.type = "dataout_json" group by DATE_FORMAT(h.datetime, "%Y-%m-%d %H"),h.acc_id order by h.acc_id;', (err, data3) => {
                conn.query('SELECT * FROM TB_TR_ACCOUNT', (err, data2) => {
                    if (err) {
                        res.json(err);
                    }
                    res.send([data, data2, data3])
                });
            });
        });
    });
    }
};

controller.user_activity_data_view = (req, res) => {
    const data = req.body;
    const data_c = [];

    console.log(data);
    data_c.push(data.data_post)


    var data_text = "";
    if (typeof req.session.userid == "undefined") {
        res.redirect("/");
    } else {

        if (data_c[0][0].length > 1) {
            for (let index = 0; index < data.data_post.length; index++) {
                if (index < data.data_post.length && index != data.data_post.length - 1) {
                    data_text += "'" + data.data_post[index] + "',"
                } else {
                    data_text += "'" + data.data_post[index] + "'"
                }
            }
    
            req.getConnection((err, conn) => {
    
                sqlcom = `SELECT * FROM TB_TR_ACCOUNT AS a WHERE a.acc_id IN (${data_text})`
                console.log(sqlcom);
    
                conn.query('SELECT * FROM TB_TR_ACCOUNT', (err, data1) => {
                    conn.query(sqlcom, (err, data2) => {
                        if (err) {
                            res.json(err);
                        }
                        res.render("monitor/user_activity_data_view", {
                            data1: data1,
                            data2: data2,
                            date: data.create_date,
                            session: req.session
                        });
    
                    });
                });
            });
        }else{
            req.getConnection((err, conn) => {
                conn.query('SELECT * FROM TB_TR_ACCOUNT', (err, data1) => {
                        conn.query("SELECT * FROM TB_TR_ACCOUNT AS a WHERE a.acc_id = ?", [data.data_post], (err, data2) => {
                        if (err) {
                            res.json(err);
                        }
                        res.render("monitor/user_activity_data_view", {
                            data1: data1,
                            data2: data2,
                            date: data.create_date,
                            session: req.session
                        });
    
                    });
                });
            });
        }
        
    }
};

controller.user_activity_date = (req, res) => {
    const data = req.body;
    console.log(data,'เข้า');
    if (data.date == '') {
        req.getConnection((err, conn) => {
            conn.query('SELECT h.acc_id,DATE_FORMAT(h.datetime, "%Y-%m-%d %H:%i:%s") as datetime,count(*) as c FROM TB_TR_HISTORY as h join TB_TR_ACCOUNT as a on h.acc_id = a.acc_id group by DATE_FORMAT(h.datetime, "%Y-%m-%d %H"),h.acc_id ORDER BY datetime asc;', (err, data) => {
                conn.query('SELECT * FROM TB_TR_ACCOUNT', (err, data2) => {

                    if (err) {
                        res.json(err);
                    }
                    res.send([data, data2])

                });
            });


        });
    } else {
        console.log([data.date[0], data.date[1]]);
        req.getConnection((err, conn) => {
                    conn.query("SELECT data1.acc_id, data1.datetime, data1.type, count(*) as c from (SELECT h.acc_id,DATE_FORMAT(h.datetime, '%Y-%m-%d %H:%i:%s') as datetime,h.type FROM TB_TR_HISTORY as h join TB_TR_ACCOUNT as a on h.acc_id = a.acc_id where h.datetime BETWEEN ? and ?) as data1 where data1.type = 'dataout_email' or data1.type = 'dataout_csv' or data1.type = 'dataout_json' group by DATE_FORMAT(data1.datetime, '%Y-%m-%d %H'),data1.acc_id,data1.type order by datetime;", [data.date[0], data.date[1]], (err, data11) => {
                        conn.query("SELECT h.acc_id,DATE_FORMAT(h.datetime, '%Y-%m-%d %H:%i:%s') as datetime,count(*) as c FROM TB_TR_HISTORY as h join TB_TR_ACCOUNT as a on h.acc_id = a.acc_id where h.datetime BETWEEN ? and ? group by DATE_FORMAT(h.datetime, '%Y-%m-%d %H'),h.acc_id,h.type order by datetime;", [data.date[0], data.date[1]], (err, data) => {
                            conn.query('SELECT * FROM TB_TR_ACCOUNT', (err, data2) => {
                    if (err) {
                        res.json(err);
                    }
                    res.send([data, data2, data11])

                });
            });
            });
        });

    }

};



module.exports = controller;