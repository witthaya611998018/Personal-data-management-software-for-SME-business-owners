const controller = {};
const { validationResult } = require('express-validator');
const funchistory = require('../controllers/account_controllers')

controller.list = (req, res) => {
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT `TB_TR_GROUP`.`group_id`,`TB_TR_GROUP`.`g_name`,COUNT(`TB_TR_USER_MEMBER`.`acc_id`) as num,TB_TR_USER_MEMBER.acc_id FROM `TB_TR_GROUP` LEFT JOIN TB_TR_USER_MEMBER ON TB_TR_USER_MEMBER.group_id=`TB_TR_GROUP`.group_id GROUP BY `TB_TR_GROUP`.`group_id` ORDER BY group_id', (err, group_list) => {
                conn.query('SELECT * FROM `TB_TR_ACCOUNT`', (err, account_list) => {
                    conn.query('SELECT group_id,COUNT(*) AS num FROM `TB_TR_USER_MEMBER` GROUP BY group_id', (err, group2_list) => {
                        conn.query('SELECT `TB_TR_GROUP`.`group_id`,`TB_TR_GROUP`.`g_name`,COUNT(`TB_TR_DEVICE_MEMBER`.`dm_id`) as num,TB_TR_DEVICE_MEMBER.dm_id FROM `TB_TR_GROUP` LEFT JOIN TB_TR_DEVICE_MEMBER ON TB_TR_DEVICE_MEMBER.group_id=`TB_TR_GROUP`.group_id GROUP BY `TB_TR_GROUP`.`group_id` ORDER BY group_id', (err, davice_list) => {
                            funchistory.funchistory(req, "account_group", `เข้าสู่เมนู กลุ่มผู้ใช้`, req.session.userid)
                            res.render('./group/group_list', {
                                data: group_list,
                                data3: group2_list,
                                data2: account_list,
                                data4: davice_list,
                                session: req.session
                            });
                        });
                    });
                });
            });
        });
    }
};
controller.new = (req, res) => {
    const { id } = req.params;
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE admin != 1 AND acc_id NOT IN (SELECT acc_id FROM TB_TR_USER_MEMBER WHERE group_id = ? )AND acc_id NOT IN (SELECT acc_id FROM `TB_TR_DEL_ACC`)', [id], (err, account_list) => {
                conn.query('SELECT * FROM `TB_TR_DEVICE` WHERE device_id NOT IN (SELECT de_id FROM `TB_TR_DEVICE_MEMBER` WHERE group_id = ?)', [id], (err, device_list) => {
                    conn.query('SELECT * FROM `TB_TR_GROUP` WHERE `TB_TR_GROUP`.`group_id`=?', [id], (err, group_list) => {
                        conn.query('SELECT * FROM `TB_TR_USER_MEMBER` JOIN `TB_TR_ACCOUNT` ON TB_TR_ACCOUNT.acc_id=TB_TR_USER_MEMBER.acc_id WHERE `TB_TR_USER_MEMBER`.`group_id`=?', [id], (err, user_member) => {
                            conn.query('SELECT * FROM `TB_TR_DEVICE_MEMBER` JOIN TB_TR_DEVICE ON TB_TR_DEVICE_MEMBER.de_id=TB_TR_DEVICE.device_id WHERE `TB_TR_DEVICE_MEMBER`.`group_id`=?', [id], (err, device_member) => {
                                res.render('./group/group_new', {
                                    data: account_list,
                                    data2: device_list,
                                    data3: group_list,
                                    data4: user_member,
                                    data5: device_member,
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
    //res.json(data);
    const errors = validationResult(req);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        if (!errors.isEmpty()) {
            req.session.errors = errors;
            req.session.success = false;
            res.redirect('/admin/new');
        } else {
            req.session.success = true;
            req.session.topic = "เพิ่มข้อมูลสำเร็จ";
            var pushacc_id = []
            req.getConnection((err, conn) => {
                conn.query('SELECT TB_TR_USER_MEMBER.*,TB_TR_GROUP.g_name FROM  TB_TR_USER_MEMBER join TB_TR_GROUP ON TB_TR_USER_MEMBER.group_id = TB_TR_GROUP.group_id WHERE TB_TR_USER_MEMBER.group_id = ?;', [data.group_id[1]], (err, group) => {
                    for (var i = 1; i < (data.acc_id).length; i++) {
                        var FOUND1 = group.find(function (post, index) {
                            if (post.acc_id == data.acc_id[i])
                                return true;
                        });
                        console.log(FOUND1);
                        if (FOUND1) {
                            console.log("data.acc_id[i]");
                        } else {
                            console.log("INSERT");
                            conn.query('INSERT INTO `TB_TR_USER_MEMBER` (`um_id`, `acc_id`, `group_id`) VALUES (NULL, ?,?);', [data.acc_id[i], data.group_id[1]], (err, group) => {
                                if (err) {
                                    res.json(err);
                                }
                            });

                        }
                    }
                    conn.query('SELECT * FROM TB_TR_GROUP WHERE group_id = ?',[data.group_id[1]],(err,gropa) =>{
                        funchistory.funchistory(req, "account_group", `แก้ไขข้อมูล กลุ่มผู้ใช้ ${gropa[0].g_name}`, req.session.userid)
                    })
                    
                });
                conn.query('SELECT * FROM `TB_TR_DEVICE_MEMBER` WHERE `group_id`= ? ', [data.group_id[1]], (err, group) => {
                    for (var j = 1; j < (data.de_id).length; j++) {
                        var FOUND2 = group.find(function (post, index) {
                            if (post.de_id == data.de_id[j])
                                return true;

                        });
                        console.log(FOUND2);
                        if (FOUND2) {
                            console.log("data.de_id[i]");
                        } else {
                            console.log("INSERT", data.de_id[j]);
                            conn.query('INSERT INTO `TB_TR_DEVICE_MEMBER` (`dm_id`, `de_id`, `group_id`) VALUES (NULL, ?, ?);', [data.de_id[j], data.group_id[1]], (err, group) => {
                                if (err) {
                                    res.json(err);
                                }
                            });

                        }
                    }

                });
                var getde_id = []
                var getacc_id = []
                for (var j = 1; j < (data.de_id).length; j++) {
                    getde_id.push(data.de_id[j])
                }
                for (var i = 1; i < (data.acc_id).length; i++) {
                    getacc_id.push(data.acc_id[i])
                }
                console.log("push getde_id", getde_id);
                console.log("push getacc_id", getacc_id);
                if (getde_id.length > 0) {
                    conn.query('DELETE FROM `TB_TR_DEVICE_MEMBER` WHERE de_id NOT IN (?) AND group_id = ?', [getde_id, data.group_id[1]], (err, DELETE2) => {
                        if (err) {
                            res.json(err);
                        }
                    });
                } else {
                    conn.query('DELETE FROM `TB_TR_DEVICE_MEMBER` WHERE group_id = ?', [data.group_id[1]], (err, DELETE2) => {
                        if (err) {
                            res.json(err);
                        }
                    });

                }
                if (getacc_id.length > 0) {
                    conn.query('DELETE FROM `TB_TR_USER_MEMBER` WHERE acc_id NOT IN (?) AND group_id = ?', [getacc_id, data.group_id[1]], (err, DELETE) => {
                        if (err) {
                            res.json(err);
                        }
                    });
                } else {
                    conn.query('DELETE FROM `TB_TR_USER_MEMBER` WHERE group_id = ?', [data.group_id[1]], (err, DELETE2) => {
                        if (err) {
                            res.json(err);
                        }
                    });

                }
                res.redirect('/group/list');
            });
        }
    }
};
controller.add = (req, res) => {
    const data = req.body;
    const errors = validationResult(req);
    let val = Object.keys(data)[0];
    const myval = val.split('"');
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO `TB_TR_GROUP` (`group_id`, `g_name`) VALUES (NULL, ?)', [myval[1]], (err, admin_add) => {
                console.log(admin_add);
                if (err) {
                    res.json(err);
                }
                funchistory.funchistory(req, "account_group", `เพิ่มข้อมูล กลุ่มผู้ใช้ ${data.g_name}`, req.session.userid)
                res.redirect('/group/list');
            });
        });
    }
};

controller.check = (req, res) => {
    const { id } = req.params;
    //res.json(id);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM `TB_TR_GROUP`as g JOIN TB_TR_USER_MEMBER as u ON u.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=u.acc_id WHERE g.group_id = ? GROUP BY u.acc_id', [id], (err, acc_list) => {
                conn.query('SELECT * FROM `TB_TR_GROUP`as g JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_DEVICE as d ON d.device_id=dm.de_id WHERE g.group_id = ? GROUP BY d.device_id', [id], (err, device_list) => {
                    if (err) {
                        res.json(err);
                    }
                    conn.query('SELECT * FROM TB_TR_GROUP WHERE group_id = ?',[id],(err,gropa) =>{
                        funchistory.funchistory(req, "account_group", `ดูข้อมูล กลุ่มผู้ใช้ ${gropa[0].g_name}`, req.session.userid)
                        });
                    res.render('./group/group_check', {
                        data: acc_list,
                        data2: device_list,
                        session: req.session
                    });
                });
            });
        });
    }
};

module.exports = controller;