/* eslint-disable max-len */
/* eslint-disable eqeqeq */
const controller = {};
const { validationResult } = require('express-validator');
const path = require('path');
const uuidv4 = require('uuid').v4;
const md5 = require('md5');
const sha1 = require('sha1');
const sha256 = require('sha256');
const addDate = require('../utils/addDate');

controller.funchistory = (req, typehistory, msghistory, accID) => {
  const date = addDate();
  const hashmd5 = md5(accID + date + msghistory);
  const hashsha1 = sha1(accID + date + msghistory);
  const hashsha256 = sha256(accID + date + msghistory);
  req.getConnection((_, conn) => {
    conn.query('INSERT INTO `TB_TR_HISTORY` (`acc_id`,datetime, `msg`, `ht_id`, `type`,`md5`,`sha1`,`sha256`) VALUES (?,?,?, NULL, ?,?,?,?);', [accID, date, msghistory, typehistory, hashmd5, hashsha1, hashsha256], (err) => {
      if (err) {
        console.log(`Insert history login${err}`);
      }
      history(req)
    });
  });
};

controller.profile = (req, res) => {
  const id = req.session.userid;
  if (typeof req.session.userid === 'undefined') {
    res.redirect('/');
  } else {
    req.getConnection((_, conn) => {
      conn.query('SELECT a.firstname,a.lastname,a.name,a.image,a.acc_id,a.position,a.descrip,a.contact,a.ext,a.phone,a.email,a.line,a.username,a.password,a.admin,date_format(a.bd,"%Y-%m-%d") as bd,m.otp_sms,m.otp_email,m.otp_2fa,m.otp_login,m.otp_system FROM TB_TR_ACCOUNT as a LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=a.acc_id WHERE a.acc_id = ?',
        [id], (error1, account) => {
          if (error1) console.log(error1);
          conn.query('SELECT a.firstname,a.lastname,a.name,a.image,a.acc_id,a.position,a.descrip,a.contact,a.ext,a.phone,a.email,a.line,a.username,a.password,a.admin,date_format(a.bd,"%Y-%m-%d") as bd,m.otp_sms,m.otp_email,m.otp_2fa,m.otp_login,m.otp_system,au.id as auid,au.genkey,au.confirm FROM TB_TR_ACCOUNT as a LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=a.acc_id left join TB_TR_APIVERIFY_USER as au on au.acc_id=a.acc_id WHERE a.acc_id NOT IN (SELECT acc_id FROM `TB_TR_DEL_ACC`) and a.admin NOT IN (1) and a.acc_id=?;',
            [id], (error2, api) => {
              if (error2) console.log(error2);
              conn.query('SELECT * FROM `TB_TR_HISTORY` WHERE acc_id = ?',
                [id], (err, history) => {
                  res.render('./account/profile', {
                    data: account,
                    data2: history,
                    api,
                    session: req.session,
                  });
                },
              );
            },
          );
        },
      );
    });
  }
};
controller.login = (req, res) => {
  req.getConnection((_, conn) => {
    conn.query('SELECT * FROM TB_TR_ACCOUNT ', (err, data) => {
      if (err) console.log(err);
      if (data.length > 0) {
        res.render('login', { session: req.session });
      } else {
        res.render('./account/wizard', { session: req.session });
      }
    });
  });
};

controller.admin = (req, res) => {
  const id = req.session.userid;
  const logperhour = [];

  if (typeof req.session.userid === 'undefined') { res.redirect('/'); } else {
    req.getConnection((_, conn) => {
      conn.query('SELECT a.firstname,a.lastname,a.name,a.image,a.acc_id,a.position,a.descrip,a.contact,a.ext,a.phone,a.email,a.line,a.username,a.password,a.admin,date_format(a.bd,"%Y-%m-%d") as bd,m.otp_sms,m.otp_email,m.otp_2fa,m.otp_login,m.otp_system FROM TB_TR_ACCOUNT as a LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=a.acc_id WHERE a.acc_id= ?', [id], (err1, account) => {
        if (err1) console.error(err1);
        // conn.query('SELECT COUNT(*) as num,admin FROM TB_TR_ACCOUNT GROUP BY TB_TR_ACCOUNT.admin ORDER BY admin ASC', (err2, account2) => {
        conn.query('SELECT COUNT(*) as num,admin FROM TB_TR_ACCOUNT WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) GROUP BY TB_TR_ACCOUNT.admin ORDER BY admin ASC;', (err2, account2) => {
          if (err2) console.error(err2);
          conn.query('SELECT MAX(date_format(TB_TR_LOG.date,"%Y-%m-%d %T")) as date,status,TB_TR_DEVICE.name as name,TB_TR_DEVICE.image,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.device_id as device_id FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG  ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id=? GROUP BY TB_TR_DEVICE.device_id', [id], (err3, deviceList) => {
            if (err2) console.error(err3);
            conn.query('SELECT DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 0 DAY),"%Y-%m-%d") as date', (err4, date1) => {
              if (err4) console.error(err4);
              conn.query('SELECT DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 1 DAY),"%Y-%m-%d") as date', (err5, date2) => {
                if (err5) console.error(err5);
                conn.query('SELECT day(TB_TR_LOG.date) as no,COUNT(*) as num,TB_TR_DEVICE.device_id,TB_TR_DEVICE.name FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.date BETWEEN ? AND ? GROUP BY device_id', [date1[0].date, date2[0].date], (err6, countlog) => {
                  if (err6) console.error(err6);
                  conn.query('SELECT date_format(TB_TR_HISTORY.datetime,"%b %d %T")as date,TB_TR_HISTORY.type,TB_TR_HISTORY.msg,TB_TR_ACCOUNT.name,TB_TR_ACCOUNT.image FROM `TB_TR_HISTORY` JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id where TB_TR_ACCOUNT.acc_id=? ORDER BY TB_TR_HISTORY.datetime DESC LIMIT 20', [id], (err7, history) => {
                    if (err7) console.error(err7);
                    conn.query('SELECT date_format(TB_TR_HISTORY.datetime,"%b %d %T")as date,TB_TR_HISTORY.msg,TB_TR_ACCOUNT.name,TB_TR_HISTORY.type,TB_TR_ACCOUNT.image FROM `TB_TR_HISTORY` JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.acc_id = ? ORDER BY TB_TR_HISTORY.datetime DESC LIMIT 20', [id], (err8, history2) => {
                      if (err8) console.error(err8);
                      conn.query('SELECT date_format(pw_keep,"%Y-%m-%d %T")as date,ntp,num_admin,num_user,timezone,day_keep FROM `TB_MM_SET_SYSTEM` ORDER BY `TB_MM_SET_SYSTEM`.`sys_id` DESC LIMIT 1', (err9, setSystem) => {
                        if (err9) console.error(err9);
                        conn.query('SELECT date_format(CURDATE(),"%Y-%m-%d") as mouth,CURTIME() as time', (err10, date) => {
                          if (err10) console.error(err10);
                          conn.query('SELECT date_format(date,"%Y-%m-%d %T")as date FROM `TB_TR_PW_CHANGE` WHERE acc_id = ? ORDER BY `TB_TR_PW_CHANGE`.`change_id`  DESC', [id], (err11, pwChange) => {
                            if (err11) console.error(err11);
                            conn.query('SELECT * FROM `TB_TR_DEVICE` JOIN TB_TR_LOG  ON TB_TR_LOG.device_id=TB_TR_DEVICE.device_id GROUP BY TB_TR_LOG.device_id', (err12, device) => {
                              if (err12) console.error(err12);
                              if (device) {
                                for (let i = 0; i < device.length; i++) {
                                  conn.query('SELECT hour(TB_TR_LOG.date) AS hour,COUNT(*) as num,TB_TR_DEVICE.name FROM `TB_TR_LOG` JOIN TB_TR_DEVICE on TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.device_id= ? AND TB_TR_LOG.date BETWEEN ? AND ? GROUP BY hour(TB_TR_LOG.date) ORDER BY hour(TB_TR_LOG.date)', [device[i].device_id, date1[0].date, date2[0].date], (err13, logdate) => {
                                    if (err13) console.error(err13);
                                    const lognum = [];
                                    const hour = [];
                                    if (logdate) {
                                      if (logdate.length > 0) {
                                        for (let j = 0; j < logdate.length; j++) {
                                          lognum.push(logdate[j].num);
                                          hour.push(`${logdate[j].hour}:00`);
                                        }
                                        logperhour.push({ name: logdate[0].name, data: lognum, hours: hour });
                                      }
                                    }
                                  });
                                }
                              }
                              if (account[0].name != 'undefined') {
                                conn.query('SELECT * FROM `TB_TR_THEME` WHERE acc_id = ?', [id], (err13, theme) => {
                                  if (err13) console.error(err13);
                                  conn.query('SELECT date_format(TB_TR_LOG.date,"%M %Y") as month1,date_format(TB_TR_LOG.date,"%Y-%m") as month2 ,date_format(TB_TR_LOG.date,"%M %Y") as month3 FROM `TB_TR_LOG` GROUP BY MONTH(TB_TR_LOG.date) ORDER by TB_TR_LOG.date DESC;', (err14, checkmonth) => {
                                    if (err14) console.error(err13);
                                    const day1 = [`${date[0].mouth} ${date[0].time}`];
                                    req.session.acc_name = account[0].name;
                                    req.session.acc_email = account[0].email;
                                    req.session.acc_id = account[0].acc_id;
                                    req.session.admin = account[0].admin;
                                    req.session.image = account[0].image;
                                    req.session.otp_system = account[0].otp_system;
                                    req.session.theme = theme;
                                    if (setSystem) {
                                      if (setSystem.length > 0) {
                                        req.session.ntp = setSystem[0].ntp;
                                        req.session.num_admin = setSystem[0].num_admin;
                                        req.session.num_user = setSystem[0].num_user;
                                        req.session.timezone = setSystem[0].timezone;
                                        req.session.day_keep = setSystem[0].day_keep;
                                        req.session.set_system = setSystem;
                                      }
                                    }
                                    if (setSystem) {
                                      if (setSystem.set_network > 0) {
                                        req.session.ip = setSystem[0].ip;
                                        req.session.netmark = setSystem[0].netmark;
                                        req.session.gateway = setSystem[0].gateway;
                                        req.session.dns = setSystem[0].dns;
                                        req.session.set_network = setSystem;
                                      }
                                    }
                                    req.session.logperhour = logperhour;

                                    if (account[0].admin == 1) {
                                      req.session.history = history2;
                                    } else {
                                      req.session.history = history;
                                    }

                                    if (account2.length > 1) {
                                      req.session.acc_admin = account2[1].num;
                                      req.session.acc_user = account2[0].num;
                                    } else if (account2.length == 1) {
                                      req.session.acc_admin = account2[0].num;
                                      req.session.acc_user = '0';
                                    }

                                    if (pwChange.length > 0) {
                                      if (day1[0] > pwChange[0].date) {
                                        res.render('./setting/change', {
                                          data: account,
                                          session: req.session,
                                        });
                                      } else {
                                        // res.redirect('/index');
                                        // check type ของ user ที่ login เข้าใช้งาน
                                        if (account[0].admin == 0) {
                                          res.redirect('/index');
                                        } else if (account[0].admin == 1) {
                                          res.redirect('/setting/view');
                                        } else if (account[0].admin == 2) {
                                          res.redirect('/personal_data');
                                        } else if (account[0].admin == 3) {
                                          res.redirect('/index');
                                        } else if (account[0].admin == 4) {
                                          res.redirect('/pattern');
                                        } else if (account[0].admin == 5) {
                                          res.redirect('/index');
                                        }

                                        // res.render('index2', {
                                        //   data: account,
                                        //   data2: deviceList,
                                        //   data3: countlog,
                                        //   data4: checkmonth,
                                        //   session: req.session,
                                        // });
                                      }
                                    } else if (pwChange.length == 0) {
                                      res.render('./setting/change', {
                                        data: account,
                                        session: req.session,
                                      });
                                    } else {
                                      res.redirect('/index');
                                    }
                                  });
                                });
                              } else {
                                res.redirect('/');
                              }
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
controller.indexcheck = (req, res) => {
  const id = req.session.userid;
  const { date } = req.params;
  const dates = `${date}%`;
  const datess = `${date}-01`;
  const logperhour = [];

  if (typeof req.session.userid === 'undefined') { res.redirect('/'); } else {
    req.getConnection((err, conn) => {
      conn.query('SELECT a.firstname,a.lastname,a.name,a.image,a.acc_id,a.position,a.descrip,a.contact,a.ext,a.phone,a.email,a.line,a.username,a.password,a.admin,date_format(a.bd,"%Y-%m-%d") as bd,m.otp_sms,m.otp_email,m.otp_2fa,m.otp_login,m.otp_system FROM TB_TR_ACCOUNT as a LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=a.acc_id WHERE a.acc_id= ?', [id], (err, account) => {
        conn.query('SELECT COUNT(*) as num,admin FROM TB_TR_ACCOUNT GROUP BY TB_TR_ACCOUNT.admin ORDER BY admin ASC', (err, account2) => {
          conn.query('SELECT MAX(date_format(TB_TR_LOG.date,"%Y-%m-%d %T")) as date,status,TB_TR_DEVICE.name as name,TB_TR_DEVICE.image,TB_TR_DEVICE.de_ip as ip,TB_TR_LOG.device_id as device_id FROM `TB_TR_USER_MEMBER` as um JOIN `TB_TR_GROUP` as g ON g.group_id=um.group_id JOIN TB_TR_DEVICE_MEMBER as dm ON dm.group_id=g.group_id JOIN TB_TR_ACCOUNT as a ON a.acc_id=um.acc_id JOIN TB_TR_LOG  ON TB_TR_LOG.device_id=dm.de_id JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=dm.de_id WHERE a.acc_id=? GROUP BY TB_TR_DEVICE.device_id', [id], (err, deviceList) => {
            conn.query('SELECT DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 0 DAY),"%Y-%m-%d") as date', (err, date1) => {
              conn.query('SELECT DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 1 DAY),"%Y-%m-%d") as date', (err, date2) => {
                conn.query('SELECT day(TB_TR_LOG.date) as no,COUNT(*) as num,TB_TR_DEVICE.device_id,TB_TR_DEVICE.name FROM `TB_TR_LOG` JOIN TB_TR_DEVICE ON TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.date LIKE ? GROUP BY device_id', [dates], (err, countlog) => {
                  conn.query('SELECT date_format(TB_TR_HISTORY.datetime,"%b %d %T")as date,TB_TR_HISTORY.type,TB_TR_HISTORY.msg,TB_TR_ACCOUNT.name,TB_TR_ACCOUNT.image FROM `TB_TR_HISTORY` JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY TB_TR_HISTORY.datetime DESC', (err, history) => {
                    conn.query('SELECT date_format(TB_TR_HISTORY.datetime,"%b %d %T")as date,TB_TR_HISTORY.msg,TB_TR_ACCOUNT.name,TB_TR_HISTORY.type,TB_TR_ACCOUNT.image FROM `TB_TR_HISTORY` JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id WHERE TB_TR_HISTORY.acc_id = ? ORDER BY TB_TR_HISTORY.datetime DESC', [id], (err, history2) => {
                      conn.query('SELECT date_format(pw_keep,"%Y-%m-%d %T")as date,ntp,num_admin,num_user,timezone,day_keep FROM `TB_MM_SET_SYSTEM` ORDER BY `TB_MM_SET_SYSTEM`.`sys_id` DESC LIMIT 1', (err, set_system) => {
                        conn.query('SELECT date_format(CURDATE(),"%Y-%m-%d") as mouth,CURTIME() as time', (err, date) => {
                          conn.query('SELECT date_format(date,"%Y-%m-%d %T")as date FROM `TB_TR_PW_CHANGE` WHERE acc_id = ? ORDER BY `TB_TR_PW_CHANGE`.`change_id`  DESC', [id], (err, pw_change) => {
                            conn.query('SELECT * FROM `TB_TR_DEVICE` JOIN TB_TR_LOG  ON TB_TR_LOG.device_id=TB_TR_DEVICE.device_id GROUP BY TB_TR_LOG.device_id', (err, device) => {
                              if (device) {
                                for (let i = 0; i < device.length; i++) {
                                  conn.query('SELECT day(TB_TR_LOG.date) AS hour,COUNT(*) as num,TB_TR_DEVICE.name,date_format(TB_TR_LOG.date,"%d-%m-%Y")as date  FROM `TB_TR_LOG` JOIN TB_TR_DEVICE on TB_TR_DEVICE.device_id=TB_TR_LOG.device_id WHERE TB_TR_LOG.device_id= ? AND TB_TR_LOG.date  LIKE ?  GROUP BY day(TB_TR_LOG.date) ORDER BY day(TB_TR_LOG.date)', [device[i].device_id, dates], (err, logdate) => {
                                    const lognum = [];
                                    const hour = [];
                                    if (logdate.length > 0) {
                                      for (let j = 0; j < logdate.length; j++) {
                                        lognum.push(logdate[j].num);
                                        hour.push(`${logdate[j].hour}:00`);
                                      }
                                      logperhour.push({ name: logdate[0].name, data: lognum, hours: hour });
                                    }
                                  });
                                }
                              }
                              conn.query('SELECT * FROM `TB_MM_SET_SYSTEM` ORDER BY `TB_MM_SET_SYSTEM`.`nw_id`  DESC LIMIT 1', (err, set_network) => {
                                conn.query('SELECT * FROM `TB_TR_THEME` WHERE acc_id = ?', [id], (err, theme) => {
                                  conn.query('SELECT date_format(TB_TR_LOG.date,"%M %Y") as month1,date_format(TB_TR_LOG.date,"%Y-%m") as month2 , date_format(?,"%M %Y")as month3 FROM `TB_TR_LOG` GROUP BY MONTH(TB_TR_LOG.date) ORDER by TB_TR_LOG.date DESC;', [datess], (err, checkmonth) => {

                                    const day1 = [`${date[0].mouth} ${date[0].time}`];
                                    req.session.acc_name = account[0].name;
                                    req.session.acc_email = account[0].email;
                                    req.session.acc_id = account[0].acc_id;
                                    req.session.admin = account[0].admin;
                                    req.session.image = account[0].image;
                                    req.session.otp_system = account[0].otp_system;
                                    req.session.theme = theme;
                                    if (set_system.length > 0) {
                                      req.session.ntp = set_system[0].ntp;
                                      req.session.num_admin = set_system[0].num_admin;
                                      req.session.num_user = set_system[0].num_user;
                                      req.session.timezone = set_system[0].timezone;
                                      req.session.day_keep = set_system[0].day_keep;
                                      req.session.set_system = set_system;
                                    }
                                    if (set_system.set_network > 0) {
                                      req.session.ip = set_network[0].ip;
                                      req.session.netmark = set_network[0].netmark;
                                      req.session.gateway = set_network[0].gateway;
                                      req.session.dns = set_network[0].dns;
                                      req.session.set_network = set_network;
                                    }
                                    req.session.logperhour = logperhour;
                                    if (account[0].admin == 1) {
                                      req.session.history = history2;
                                    } else {
                                      req.session.history = history;
                                    }
                                    if (pw_change.length > 0) {
                                      if (day1[0] > pw_change[0].date) {
                                        res.render('./setting/change', {
                                          data: account,
                                          data2: deviceList,
                                          data3: countlog,
                                          session: req.session,
                                        });
                                      }
                                    }
                                    if (account2.length > 1) {
                                      req.session.acc_admin = account2[1].num;
                                      req.session.acc_user = account2[0].num;
                                    } else if (account2.length == 1) {
                                      req.session.acc_admin = account2[0].num;
                                      req.session.acc_user = '0';
                                    }
                                    if (err) {
                                      res.json(err);
                                    }
                                    // res.render('index2', {
                                    //   data: account,
                                    //   data2: deviceList,
                                    //   data3: countlog,
                                    //   data4: checkmonth,
                                    //   data5: logperhour,
                                    //   session: req.session,
                                    // });
                                    res.redirect('/index');
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
      });
    });
  }
};
controller.check = (req, res) => {
  const data = req.body;
  const getcookie = req.cookies;
  let cookie = JSON.stringify(getcookie);
  cookie = cookie.replace('"connect.sid"', '"connect"');
  const cookieParse = JSON.parse(cookie);
  const date = addDate();
  const dateNow = new Date();
  req.getConnection((err, conn) => {
    controller.check_limit(req); // check limit session login and all pages
    conn.query('SELECT * FROM TB_TR_ACCOUNT JOIN `TB_TR_MUITIFACTOR` ON TB_TR_ACCOUNT.acc_id=TB_TR_MUITIFACTOR.acc_id WHERE username = ? AND password = ? AND  TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM `TB_TR_DEL_ACC`)', [data.username, data.password], (err, data) => {


      conn.query('SELECT * FROM `TB_MM_TIMEZONE`', (err, data3) => {
        conn.query('SELECT * FROM TB_TR_HISTORY ', (err, data2) => {
          if (data.length != 0) { // check Data Account


            msg = `${data[0].name} เข้าใช้งานเมื่อ ${date}`;
            type = 'login';
            hashmd5 = md5(data[0].acc_id + date + msg);
            hashsha1 = sha1(data[0].acc_id + date + msg);
            hashsha256 = sha256(data[0].acc_id + date + msg);
            conn.query('SELECT * FROM TB_TR_LIMIT ', (err, limit) => {
              conn.query('INSERT INTO `TB_TR_HISTORY` (`acc_id`, `datetime`, `msg`, `ht_id`, `type`,`md5`,`sha1`,`sha256`) VALUES (?, ?, ?, NULL, ?,?,?,?);', [data[0].acc_id, date, msg, type, hashmd5, hashsha1, hashsha256], (err, history) => {
                if (err) {
                  console.log(err);
                }



                if (data2.length > 0) {
                  req.session.userid = data[0].acc_id;
                  req.session.admin = data[0].admin;
                  req.session.acc_id_control = data[0].acc_id_control;

                  req.session.success = true;
                  res.redirect('/index2');
                } else if (data2.length == 0 && data[0].admin == 1) {  // No have history user and position user is admin
                  req.session.userid = data[0].acc_id;
                  req.session.admin = data[0].admin;
                  req.session.acc_id_control = data[0].acc_id_control;
                  req.session.success = true;
                  res.render('./setting/setting', {
                    data2: data3,
                    session: req.session,
                  });

                }
              });
            });
          } else {
            req.session.false = true;
            res.redirect('/');
          }

        });
      });
    });
  });
};
controller.list = (req, res) => {
  const data = null;
  if (typeof req.session.userid === 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
    req.getConnection((err, conn) => {
      conn.query(' SELECT TB_TR_ACCOUNT.*,date_format(TB_TR_ACCOUNT.bd,"%Y-%m-%d") as bd,m.otp_sms,m.otp_email,m.otp_2fa,m.otp_login,m.otp_system FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC);', (err, account_list) => {
        conn.query('SELECT date_format(TB_TR_HISTORY.datetime,"%Y-%m-%d %T")as date,TB_TR_HISTORY.msg,TB_TR_ACCOUNT.name FROM `TB_TR_HISTORY` JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id ORDER BY TB_TR_HISTORY.datetime DESC', (err, history) => {
          controller.funchistory(req, 'account', 'เข้าสู่เมนู รายชื่อผู้ใช้', req.session.userid);
          res.render('./account/account_list', {
            data: account_list,
            history,
            session: req.session,
          });
        });
      });
    });
  }
};
controller.quest = (req, res) => {
  const data = null;
  if (typeof req.session.userid === 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
    req.getConnection((err, conn) => {
      conn.query('SELECT * FROM `TB_MM_QUESTIONNAIRE` ORDER BY `TB_MM_QUESTIONNAIRE`.`quest_id` DESC', (err, account_list) => {
        res.render('./account/questionnaire', {
          data: account_list,
          session: req.session,
        });
      });
    });
  }
};
controller.questview = (req, res) => {
  const data = null;
  if (typeof req.session.userid === 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
    req.getConnection((err, conn) => {
      conn.query('SELECT * FROM `TB_MM_QUESTIONNAIRE` ORDER BY `TB_MM_QUESTIONNAIRE`.`quest_id` DESC', (err, account_list) => {
        res.render('./account/questionnaire_view', {
          data: account_list,
          session: req.session,
        });
      });
    });
  }
};
controller.ans = (req, res) => {
  const data = req.body;
  //  res.json(data);
  if (data.md_checkbox_21 == 'on') {
    data.md_checkbox_21 = 1;
  } else {
    data.md_checkbox_21 = 0;
  }
  if (data.md_checkbox_22 == 'on') {
    data.md_checkbox_22 = 1;
  } else {
    data.md_checkbox_22 = 0;
  }
  if (data.md_checkbox_23 == 'on') {
    data.md_checkbox_23 = 1;
  } else {
    data.md_checkbox_23 = 0;
  }
  if (data.md_checkbox_24 == 'on') {
    data.md_checkbox_24 = 1;
  } else {
    data.md_checkbox_24 = 0;
  }
  // if (data.md_checkbox_25 == "on") {
  //     data.md_checkbox_25 = 1;
  // } else {
  //     data.md_checkbox_25 = 0;
  // }
  // if (data.md_checkbox_26 == "on") {
  //     data.md_checkbox_26 = 1;
  // } else {
  //     data.md_checkbox_26 = 0;
  // }
  if (typeof req.session.userid === 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
    req.getConnection((err, conn) => {
      conn.query('INSERT INTO TB_MM_QUESTIONNAIRE set ?', [data], (err, questionnaire) => {
        conn.query('SELECT * FROM `TB_MM_QUESTIONNAIRE` ORDER BY `TB_MM_QUESTIONNAIRE`.`quest_id` DESC', (err, account_list) => {
          // res.redirect('/index2');
          res.render('./account/questionnaire', {
            data: account_list,
            session: req.session,
          });
        });
      });
    });
  }
};
controller.new = (req, res) => {
  const data = null;
  if (typeof req.session.userid === 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
    req.getConnection((err, conn) => {
      conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE admin = 1', (err, account_list1) => {
        conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE admin = 0', (err, account_list2) => {
          conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE admin = 2', (err, account_list3) => {
            conn.query('SELECT * FROM `TB_MM_SET_SYSTEM`  ORDER BY `TB_MM_SET_SYSTEM`.`sys_id` DESC LIMIT 1', (err, set_system) => {
              conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE admin = 5', (err, limit_user) => {
                // if (limit_user.length > 0) {
                if (req.session.limit.user === -1 || limit_user.length < req.session.limit.user) {
                  req.session.limit.user = 'ไม่เต็ม'
                } else {
                  req.session.limit.user = 'เต็ม'
                }
                res.render('./account/account_new', {
                  data1: account_list1,
                  data2: account_list2,
                  data3: account_list3,
                  data4: set_system,
                  session: req.session,
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
  const errors = validationResult(req);
  const data = req.body;
  date = addDate();
  if (data.otp_email == 'on') {
    data.otp_email = 1;
  } else {
    data.otp_email = 0;
  }
  if (data.otp_sms == 'on') {
    data.otp_sms = 1;
  } else {
    data.otp_sms = 0;
  }
  if (data.otp_2fa == 'on') {
    data.otp_2fa = 1;
  } else {
    data.otp_2fa = 0;
  }
  if (data.otp_login == 'on') {
    data.otp_login = 1;
  } else {
    data.otp_login = 0;
  }
  if (data.otp_system == 'on') {
    data.otp_system = 1;
  } else {
    data.otp_system = 0;
  }
  // res.json(data);
  userid = req.session.userid;
  if (data.admin) {
    if (data.admin == '1') {
      data.type_user = 'ผู้ดูแลระบบ';
    } else if (data.admin == '0') {
      data.type_user = 'ผู้ดูแลข้อมูล';
    } else if (data.admin == '2') {
      data.type_user = 'ผู้ใช้งานทั่วไป';
    } else if (data.admin == '3') {
      data.type_user = 'เจ้าหน้าที่คุ้มครองข้อมูล';
    } else if (data.admin == '4') {
      data.type_user = 'ผูัประมวนผลข้อมูล';
    } else if (data.admin == '5') {
      data.type_user = 'ผู้ควบคุมข้อมูล';
    }
  }

  if (typeof req.session.userid === 'undefined' || req.session.admin == '0') { res.redirect('/'); } else if (!errors.isEmpty()) {
    req.session.errors = errors;
    req.session.success = false;
    res.redirect('/account/new');
  } else {
    req.session.success = true;
    req.session.topic = 'เพิ่มข้อมูลสำเร็จ';
    req.getConnection((err, conn) => {
      if (req.files) {
        const filename = req.files.img;
        if (!filename.map) {
          var newfilename = `${uuidv4()}.${filename.name.split('.')[1]}`;
          const savePath = path.join(__dirname, '../public/UI/image', newfilename);
          filename.mv(savePath);
        }
        data.image = newfilename;
      }
      conn.query('INSERT INTO TB_TR_ACCOUNT (firstname,lastname,name,position,descrip,contact,ext,phone,email,line,username,password,admin ,bd,image,type_user) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [data.firstname, data.lastname, data.name, data.position, data.descrip, data.contact, data.ext, data.phone, data.email, data.line, data.username, data.password, data.admin, data.bd, data.image, data.type_user], (err, admin_add) => {
        conn.query('SELECT * FROM `TB_TR_ACCOUNT` WHERE username= ? AND password=?', [data.username, data.password], (err, LIMIT) => {
          conn.query('INSERT INTO `TB_TR_THEME` SET acc_id= ?', [LIMIT[0].acc_id], (err, theme) => {
            conn.query('INSERT INTO `TB_TR_MUITIFACTOR` (`acc_id`, `otp_sms`, `otp_email`, `otp_2fa`, `otp_login`, `otp_system`) VALUES (?, ?, ?, ?, ?, ?);', [LIMIT[0].acc_id, data.otp_sms, data.otp_email, data.otp_2fa, data.otp_login, data.otp_system], (err, muitifactor) => {
              if (err) { console.log((err)) }
              if (data.firstname_dpo) {
                conn.query("INSERT INTO TB_TR_ACCOUNT SET firstname=?,lastname=?,name='เจ้าหน้าที่คุ้มครองข้อมูล',contact=?,phone=?,email=?,image=?,username=0,password=0,admin=3,type_user='เจ้าหน้าที่คุ้มครองข้อมูล'",
                  [data.firstname_dpo, data.lastname_dpo, data.contact_dpo, data.phone_dpo, data.email_dpo, data.image], (err, insert_dpo) => {
                    conn.query('INSERT INTO TB_TR_SITE SET site_name= ?,short_name=?,site_number=?,site_address=?,site_phone=?,acc_id=?,acc_id_dpo=?',
                      [data.site_name, data.short_name, data.site_number, data.site_address, data.site_phone, LIMIT[0].acc_id, insert_dpo.insertId], (err, site) => {
                      });
                  });
              } else if (data.acc_id_control) {
                conn.query('UPDATE  TB_TR_ACCOUNT SET acc_id_control=? WHERE acc_id=? ', [data.acc_id_control, admin_add.insertId], (err, update_ganeral_user) => {
                });
              }
              controller.funchistory(req, 'account', `เพิ่มข้อมูล ผู้ใช้ ${data.name}`, req.session.userid);
              res.redirect('/account/list');
            });
          });
        });
      });
    });
  }
};
controller.add = (req, res) => {
  const data = req.body;
  const errors = validationResult(req);
  if (data.otp_email == 'on') {
    data.otp_email = 1;
  } else {
    data.otp_email = 0;
  }
  if (data.otp_sms == 'on') {
    data.otp_sms = 1;
  } else {
    data.otp_sms = 0;
  }
  if (data.otp_2fa == 'on') {
    data.otp_2fa = 1;
  } else {
    data.otp_2fa = 0;
  }
  if (data.otp_login == 'on') {
    data.otp_login = 1;
  } else {
    data.otp_login = 0;
  }
  if (data.otp_system == 'on') {
    data.otp_system = 1;
  } else {
    data.otp_system = 0;
  }
  if (data.md_checkbox_21 == 'on') {
    data.md_checkbox_21 = 1;
  } else {
    data.md_checkbox_21 = 0;
  }
  if (data.md_checkbox_22 == 'on') {
    data.md_checkbox_22 = 1;
  } else {
    data.md_checkbox_22 = 0;
  }
  if (data.md_checkbox_23 == 'on') {
    data.md_checkbox_23 = 1;
  } else {
    data.md_checkbox_23 = 0;
  }
  if (data.md_checkbox_24 == 'on') {
    data.md_checkbox_24 = 1;
  } else {
    data.md_checkbox_24 = 0;
  }
  // res.json(data);
  if (typeof req.session.userid === 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
    req.getConnection((err, conn) => {
      conn.query('INSERT INTO TB_TR_ACCOUNT (firstname,lastname,name,position,descrip,contact,ext,phone,email,line,username,password,admin ,bd,image) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,"user_pic.png")', [data.firstname, data.lastname, data.name, data.position, data.descrip, data.contact, data.ext, data.phone, data.email, data.line, data.username, data.password, 1, data.bd], (err, admin_add) => {
        conn.query('SELECT * FROM `TB_TR_ACCOUNT` WHERE username= ? AND password=?', [data.username, data.password], (err, account_list) => {
          // conn.query('SELECT DATE_FORMAT(DATE_ADD(( CURDATE()),INTERVAL 0 DAY),"%Y-%m-%d %T") as date', (err, date) => {
          conn.query('INSERT INTO `TB_TR_MUITIFACTOR` (`acc_id`, `otp_sms`, `otp_email`, `otp_2fa`, `otp_login`, `otp_system`) VALUES (?, ?, ?, ?, ?, ?);', [account_list[0].acc_id, data.otp_sms, data.otp_email, data.otp_2fa, data.otp_login, data.otp_system], (err, muitifactor) => {
            conn.query('INSERT INTO `TB_MM_QUESTIONNAIRE` (`quest_id`, `Name1`, `firstName1`, `lastName1`, `emailAddress1`, `phone1`, `shortDescription1`, `service`, `md_checkbox_21`, `md_checkbox_22`, `md_checkbox_23`, `md_checkbox_24`, `store`, `shortDescription2`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [data.Name1, data.firstName1, data.lastName1, data.emailAddress1, data.phone1, data.shortDescription1, data.service, data.md_checkbox_21, data.md_checkbox_22, data.md_checkbox_23, data.md_checkbox_24, data.store, data.shortDescription2], (err, questionnaire) => {
              res.redirect('/');
            });
          });
          // });
        });
      });
    });
  }
};
controller.delete = (req, res) => {
  const { id } = req.params;
  // res.json(id);
  if (typeof req.session.userid === 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
    req.getConnection((err, conn) => {
      conn.query('SELECT TB_TR_ACCOUNT.*,date_format(bd,"%Y-%m-%d") as bd,TB_TR_MUITIFACTOR.otp_sms,TB_TR_MUITIFACTOR.otp_email,TB_TR_MUITIFACTOR.otp_2fa,TB_TR_MUITIFACTOR.otp_login,TB_TR_MUITIFACTOR.otp_system FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR ON TB_TR_MUITIFACTOR.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id=?;', [id], (err, admin_delete) => {
        if (err) {
          res.json(err);
        }
        res.render('./account/del_account', {
          data: admin_delete,
          session: req.session,
        });
      });
    });
  }
};
controller.del = (req, res) => {
  const { id } = req.params;
  id2 = req.session.userid;
  date = addDate();
  const errors = validationResult(req);
  if (typeof req.session.userid === 'undefined' || req.session.admin == '0') { res.redirect('/'); } else if (!errors.isEmpty()) {
    req.session.errors = errors;
    req.session.success = false;
    res.redirect(`/account/list${id}`);
  } else {
    req.getConnection((err, conn) => {
      conn.query('SELECT * FROM `TB_TR_ACCOUNT` WHERE acc_id = ?', [id], (err, account) => {
        conn.query('INSERT INTO `TB_TR_DEL_ACC` (`del_id`, `acc_id`) VALUES (NULL, ?);', [id], (err, admin_confirmdelete) => {
          controller.funchistory(req, 'account', `ลบข้อมูล ผู้ใช้ ${account[0].name}`, req.session.userid);
          res.redirect('/account/list');
        });
      });
    });
  }
};
controller.edit = (req, res) => {
  const data = req.body;
  const { id } = req.params;
  if (typeof req.session.userid === 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
    req.getConnection((err, conn) => {
      // conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE admin = 1', (err, account_list1) => {
      //   conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE admin = 0', (err, account_list2) => {
      //     conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE admin = 2', (err, account_list3) => {
      // conn.query('SELECT * FROM `TB_MM_SET_SYSTEM`  ORDER BY `TB_MM_SET_SYSTEM`.`sys_id` DESC LIMIT 1', (err, set_system) => {
      conn.query('SELECT a.firstname,a.lastname,a.name,a.image,a.acc_id,a.position,a.descrip,a.contact,a.ext,a.phone,a.email,a.line,a.username,a.password,a.admin,date_format(a.bd,"%Y-%m-%d") as bd,m.otp_sms,m.otp_email,m.otp_2fa,m.otp_login,m.otp_system FROM TB_TR_ACCOUNT as a LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=a.acc_id WHERE a.acc_id=?', [id], (err, admin_edit) => {
        conn.query('SELECT * FROM TB_TR_SITE WHERE acc_id = ?', [id], (err, site) => {
          conn.query('SELECT * FROM TB_TR_ACCOUNT  WHERE acc_id_control = ?', [id], (err, general_user) => {
            console.log(site);
            if (site.length > 0) {
              site = site
            } else {
              site = 'ไม่มีข้อมูล'
            }
            res.render('./account/edit_account', {
              data: admin_edit,
              // data1: account_list1,
              // data2: account_list2,
              // data3: account_list3,
              // data4: set_system,
              site,
              general_user,
              session: req.session,
            });
          });
        });
      });
    });
    // });
    //  });
    // });
    // });
  }
};

controller.save = (req, res) => {
  const { id } = req.params;
  const data = req.body;
  id2 = req.session.userid;
  date = addDate();
  const errors = validationResult(req);
  if (data.otp_email == 'on') {
    data.otp_email = 1;
  } else {
    data.otp_email = 0;
  }
  if (data.otp_sms == 'on') {
    data.otp_sms = 1;
  } else {
    data.otp_sms = 0;
  }
  if (data.otp_2fa == 'on') {
    data.otp_2fa = 1;
  } else {
    data.otp_2fa = 0;
  }
  if (data.otp_login == 'on') {
    data.otp_login = 1;
  } else {
    data.otp_login = 0;
  }
  if (data.otp_system == 'on') {
    data.otp_system = 1;
  } else {
    data.otp_system = 0;
  }
  if (data.admin) {
    if (data.admin == '1') {
      data.type_user = 'ผู้ดูแลระบบ';
    } else if (data.admin == '0') {
      data.type_user = 'ผู้ดูแลข้อมูล';
    } else if (data.admin == '2') {
      data.type_user = 'ผู้ใช้งานทั่วไป';
    } else if (data.admin == '3') {
      data.type_user = 'เจ้าหน้าที่คุ้มครองข้อมูล';
    } else if (data.admin == '4') {
      data.type_user = 'ผูัประมวนผลข้อมูล';
    } else if (data.admin == '5') {
      data.type_user = 'ผู้ควบคุมข้อมูล';
    }
  }
  if (typeof req.session.userid === 'undefined' || req.session.admin == '0') { res.redirect('/'); } else if (!errors.isEmpty()) {
    req.session.errors = errors;
    req.session.success = false;
    res.redirect(`/account/edit/${id}`);
  } else {
    req.session.success = true;
    req.session.topic = 'แก้ไขข้อมูลสำเร็จ';
    req.getConnection((err, conn) => {
      if (req.files) {
        const filename = req.files.img;
        if (!filename.map) {
          var newfilename = `${uuidv4()}.${filename.name.split('.')[1]}`;
          const savePath = path.join(__dirname, '../public/UI/image', newfilename);
          filename.mv(savePath);
        }
        data.image = newfilename;
      }
      conn.query('SELECT * FROM `TB_TR_ACCOUNT` WHERE acc_id = ?', [id], (err, account) => {
        conn.query('UPDATE TB_TR_ACCOUNT set firstname =?,lastname =?,name =?,position =?,descrip =?,contact =?,ext =?,phone =?,email =?,line =?,username =?,password =?,admin =? ,bd =?,image=?,type_user =? where acc_id = ?', [data.firstname, data.lastname, data.name, data.position, data.descrip, data.contact, data.ext, data.phone, data.email, data.line, data.username, data.password, data.admin, data.bd, data.image, data.type_user, id], (err, admin_save) => {
          controller.funchistory(req, 'account', `แก้ไขข้อมูล ผู้ใช้ ${account[0].name}`, req.session.userid);
          if (err) { res.json(err); }
          if (data.site_name) {
            conn.query('SELECT * FROM `TB_TR_SITE` WHERE acc_id = ?', [id], (err, site) => {
              conn.query('UPDATE TB_TR_SITE SET site_name=?,short_name=?,site_number=?,site_address=? where site_id = ?',
                [data.site_name, data.short_name, data.site_number, data.site_address, site[0].site_id], (err, update_site) => {
                });
            });
          }
          conn.query('UPDATE `TB_TR_MUITIFACTOR` set `otp_sms`=?, `otp_email`=?, `otp_2fa`=?, `otp_login`=?, `otp_system`=? where acc_id = ?', [data.otp_sms, data.otp_email, data.otp_2fa, data.otp_login, data.otp_system, id], (err, muitifactor) => {
            res.redirect('/account/list');
          });
        });
      });
    });
  }
};



controller.new_general = (req, res) => {
  if (typeof req.session.userid === 'undefined') {
    res.redirect('/');
  } else {
    const { id } = req.params
    req.getConnection((_, conn) => {
      conn.query('SELECT * FROM `TB_TR_ACCOUNT` WHERE acc_id = ?', [id], (_, account) => {
        res.render('./account/account_new_general_user', {
          data_control: account,
          session: req.session,
        });
      });
    });
  }
};



controller.check_limit = (req, res) => {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM TB_TR_LIMIT ', (err, limit) => {
      req.session.limit = {
        'cookie': limit[0].limit_cookie,
        'paper': limit[0].limit_paper,
        'email': limit[0].limit_email,
        'user': limit[0].limit_user,
        'policy': limit[0].limit_policy,
        'pattern': limit[0].limit_pattern,
        'classification': limit[0].limit_classification,
        'email_board': limit[0].limit_email_board,
        'email_personal': limit[0].limit_email_personal,
      }
    });
  });
}

function history(req, res) {
  var user = '';
  if (req.session.acc_id_control) {
    user = req.session.acc_id_control
  } else {
    user = req.session.userid
  }
  req.getConnection((err, conn) => {
    conn.query('SELECT date_format(TB_TR_HISTORY.datetime,"%b %d %T")as date,TB_TR_HISTORY.type,TB_TR_HISTORY.msg,TB_TR_ACCOUNT.name,TB_TR_ACCOUNT.image FROM `TB_TR_HISTORY` JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=TB_TR_HISTORY.acc_id where TB_TR_ACCOUNT.acc_id=? ORDER BY TB_TR_HISTORY.datetime DESC LIMIT 20', [user], (err, history) => {
      req.session.history = history;
    });
  });

}



module.exports = controller;
