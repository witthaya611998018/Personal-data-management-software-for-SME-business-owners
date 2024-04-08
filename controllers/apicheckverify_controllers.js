const controller = {};
const funchistory = require('./account_controllers')
const addDate = require("../utils/addDate")

function sethost(req) {
    var hostset = req.headers;
    var protocol = "http";
    if (hostset.hasOwnProperty("x-forwarded-proto")) {
      protocol = "https";
    }
    var checkhost = req.headers.host;
    checkhost = checkhost.split(":");
    var texthost = "";
    if(checkhost.length > 0){
      texthost = checkhost[0]
    }else{
      texthost = req.headers.host
    }
    var host = protocol + "://" + texthost;
    console.log(texthost);
    return host;
  }

controller.list = (req, res) => {
    const data = null;

    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('SELECT a.firstname,a.lastname,a.name,a.image,a.acc_id,a.position,a.descrip,a.contact,a.ext,a.phone,a.email,a.line,a.username,a.password,a.admin,date_format(a.bd,"%Y-%m-%d") as bd,m.otp_sms,m.otp_email,m.otp_2fa,m.otp_login,m.otp_system,au.id as auid,au.genkey,au.confirm FROM TB_TR_ACCOUNT as a LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=a.acc_id left join TB_TR_APIVERIFY_USER as au on au.acc_id=a.acc_id WHERE a.acc_id NOT IN (SELECT acc_id FROM `TB_TR_DEL_ACC`) and a.admin NOT IN (1) ORDER BY a.acc_id;', (err, account_list) => {
                conn.query('SELECT date_format(h.datetime,"%Y-%m-%d %T")as date,h.msg,TB_TR_ACCOUNT.name FROM TB_TR_HISTORY as h JOIN TB_TR_ACCOUNT ON TB_TR_ACCOUNT.acc_id=h.acc_id ORDER BY h.datetime DESC', (err, history) => {
                  funchistory.funchistory(req, "api_pdpa", `เข้าสู่เมนู ข้อมูลกลุ่มผู้ใช้ pdpa`, req.session.userid )  
                  res.render('./apicheckverify/apicheckverify_list', {
                        data: account_list,
                        history: history,
                        session: req.session
                    });
                });
            });
        });
    }
};

controller.add = (req, res) => {
    const data = req.body;
    console.log(data);
    if (typeof req.session.userid == 'undefined' ) { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO TB_TR_APIVERIFY_USER set ?;',[data], (err, account_list) => {
              funchistory.funchistory(req, "api_pdpa", `เพิ่มข้อมูล token ข้อมูลกลุ่มผู้ใช้ pdpa`, req.session.userid )  
                    res.send('yes');
                });
            });
    }
};

controller.changekey = (req, res) => {
    const data = req.body;
    console.log(data);
    if (typeof req.session.userid == 'undefined' ) { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('UPDATE TB_TR_APIVERIFY_USER set genkey = ? WHERE acc_id = ?;',[data.genkey,data.acc_id], (err, account_list) => {
              funchistory.funchistory(req, "api_activity", `แก้ไขข้อมูล token ข้อมูลกลุ่มผู้ใช้ pdpa`, req.session.userid )        
              res.send('yes');
                });
            });
    }
};

controller.block = (req, res) => {
    const data = req.body;
    console.log(data);
    if (typeof req.session.userid == 'undefined' || req.session.admin == '0') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            conn.query('UPDATE TB_TR_APIVERIFY_USER set confirm = ? WHERE acc_id = ?;',[data.re,data.acc_id], (err, account_list) => {
              funchistory.funchistory(req, "api_activity", `เปลี่ยนสิทธิข้อมูล token ข้อมูลกลุ่มผู้ใช้ pdpa `, req.session.userid )       
              res.send('yes');
                });
            });
    }
};

controller.apiguide = (req, res) => {
    //data.pop();
    const user = req.session.userid;
    var host = sethost(req);
    if (typeof req.session.userid == "undefined") {
      res.redirect("/");
    } else {
      console.log(user);
      //sendmailfunc();
      req.getConnection((err, conn) => {
        conn.query(
            'SELECT a.firstname,a.lastname,a.name,a.image,a.acc_id,a.position,a.descrip,a.contact,a.ext,a.phone,a.email,a.line,a.username,a.password,a.admin,date_format(a.bd,"%Y-%m-%d") as bd,m.otp_sms,m.otp_email,m.otp_2fa,m.otp_login,m.otp_system,au.id as auid,au.genkey,au.confirm FROM TB_TR_ACCOUNT as a LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=a.acc_id left join TB_TR_APIVERIFY_USER as au on au.acc_id=a.acc_id WHERE a.acc_id NOT IN (SELECT acc_id FROM `TB_TR_DEL_ACC`) and a.admin NOT IN (1) and a.acc_id=?;',
            [id],
            (err, api) => {
                conn.query(
                    "SELECT * FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id WHERE ac.acc_id=? ORDER BY cla.classify_id ASC;",
                    [user],
                    (err, classi) => {
                conn.query(
                  'select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;',
                  [user],
                  (err, history) => {
                    // console.log(classi);
                    funchistory.funchistory(req, "api_activity", `หน้าคู๋มือการใช้คู่มือกิจกรรมจากภายนอก user ทั่วไป`, user )  
                    res.render("./apicheckverify/apicheckverify_guide", {
                      session: req.session,
                      history: history,
                      host: host,
                      api:api,
                      classi:classi,
                    });
                  }
                );
            }
            );
        }
        );
      });
    }
  };

  controller.apiguideadmin = (req, res) => {
    //data.pop();
    const user = req.session.userid;
    var host = sethost(req);
    if (typeof req.session.userid == "undefined") {
      res.redirect("/");
    } else {
      console.log(user);
      //sendmailfunc();
      req.getConnection((err, conn) => {
                conn.query(
                  'select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;',
                  [user],
                  (err, history) => {
                    // console.log(classi);
                    funchistory.funchistory(req, "api_activity", `หน้าคู๋มือการใช้คู่มือกิจกรรมจากภายนอก`, user )  
                    res.render("./apicheckverify/apicheckverify_guideadmin", {
                      session: req.session,
                      history: history,
                      host: host,
                    });
                  }
                );
            }
            );
    }
  };

  controller.apidatainlog = (req, res) => {
    //data.pop();
    const user = req.session.userid;
    var host = sethost(req);
    if (typeof req.session.userid == "undefined") {
      res.redirect("/");
    } else {
      console.log(user);
      //sendmailfunc();
      req.getConnection((err, conn) => {
        conn.query(
          'SELECT * FROM TB_TR_DEVICE WHERE TB_TR_DEVICE.name="apidatainlog";',
          (err, device_check) => {
            if(device_check.length > 0){
              console.log(device_check);
              conn.query(
                'select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;',
                [user],
                (err, history) => {
                  // console.log(classi);
                  funchistory.funchistory(req, "api_log", `หน้าคู๋มือการใช้คู่มือ API LOG`, user )  
                  res.render("./apicheckverify/apidatainlog_guide", {
                    session: req.session,
                    history: history,
                    host: host,
                    device_check,
                  });
                }
              );
            }else{
              conn.query(
                "INSERT INTO TB_TR_DEVICE (`device_id`, `status`, `de_type`, `data_type`, `sender`, `keep`, `rmfile`, `hostname`, `name`, `location_bu`, `backup`, `de_ip`, `eth`, `hash`, `image`) VALUES (NULL, 'ใช้งาน', 'อื่นๆ', 'ข้อมูลจราจรทางคอมพิวเตอร์จากการเชื่อมต่อเข้าถึงระบบเครือข่าย (Internet Access)', 'api', NULL, NULL, 'user', 'apidatainlog', NULL, NULL, '1.1.1.2', 'api', NULL, '1200px-Circle-icons-computer.svg.png');",
                (err, device_check) => {
                  funchistory.funchistory(req, "device", `เพิ่มข้อมูลอุปกรณ์ของ API LOG`, user )  
                  res.redirect("/apidatainlog/guide")
                });
            }

            });
          });
    }
  };

  controller.apidatainpdpa = (req, res) => {
    //data.pop();
    const user = req.session.userid;
    var host = sethost(req);
    var datetime = addDate();
    if (typeof req.session.userid == "undefined") {
      res.redirect("/");
    } else {
      console.log(user);
      //sendmailfunc();
      req.getConnection((err, conn) => {
        conn.query(
          'SELECT * FROM TB_TR_IMPORT where name="api_import";',
          (err, import_check) => {
            if(import_check.length > 0){
              console.log(import_check);
              conn.query(
                'SELECT * FROM TB_TR_PDPA_DATA order by data_id ASC;',
                (err, data) => {
                  for(x in data){
                    data[x].data_code = data[x].data_code.replace("#", ""); 
                  }
              conn.query(
                'select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;',
                [user],
                (err, history) => {
                  // console.log(classi);
                  funchistory.funchistory(req, "api_pdpa", `หน้าคู๋มือการใช้คู่มือ API PDPA`, user )
                  res.render("./apicheckverify/apidatainpdpa_guide", {
                    session: req.session,
                    history: history,
                    host: host,
                    import_check,
                    data
                  });
                });
                }
              );
            }else{
              conn.query(
                "INSERT INTO `TB_TR_IMPORT` (`name`, `descrip`, `create_date`, `type_import`, `username`, `password`, `create`, `type_file`) VALUES ('api_import', 'importdata_to_db', ?, 'api_import', 'api', 'passw0rd', '1', 'pdpa');",
                [datetime],
                (err, data) => {
                  if(data){
                    funchistory.funchistory(req, "api_pdpa", `เพิ่มข้อมูล import pdpa`, user )
                    res.redirect("/apidatainpdpa/guide")
                  }else{
                    res.redirect("/index2")
                  }
                });
            }

            });
          });
    }
  };
  
// controller.apireq = (req, res) => {
//     var token = req.headers.token;
//     var data = req.body;
//     console.log(data);
//     var checklength = data.personal.length;
//     console.log("token : ", token);
//     console.log("data : ", data.personal.length);
//     if (checklength > 0) {
//       var pushdatatest = [];
//       for (k in data.personal) {
//         for (s in data.personal[k]) {
//           var newdata = [];
//           req.getConnection((err, conn) => {
  
//               var index1 = s;
//               var index2 = parseInt(k);
//               var personalval = data.personal[k][s];
//               var multidata = data.dataname[k][s];
//               multidata = multidata.split(",");
//               var mulupdate = data.dataname[k][s];
//               mulupdate = mulupdate.split(",");
//               conn.query(
//                 'SELECT * FROM doc_pdpa_pattern INNER join doc_pdpa_classification on doc_pdpa_classification.pattern_id=doc_pdpa_pattern.pattern_id INNER join TB_TR_APIVERIFY_USER as au on au.acc_id=doc_pdpa_classification.acc_id WHERE doc_pdpa_classification.classify_id=?  and au.genkey=? and au.confirm="0";',
//                 [data.activity, token],
//                 (err, checkdata) => {
//                     console.log(checkdata);
//                   if (checkdata.length > 0) {
//                   var multidatadoc_data = checkdata[0].doc_id_person_data;
//                   multidatadoc_data = multidatadoc_data.split(",");
//                   for(doc_data in multidatadoc_data){
//                     conn.query(
//                       'SELECT ? as test ',
//                       [doc_data],
//                       (err, checkcount) => {
//                         var t = parseInt(checkcount[0].test)
//                     conn.query(
//                       'SELECT * FROM doc_pdpa_pattern INNER join doc_pdpa_classification on doc_pdpa_classification.pattern_id=doc_pdpa_pattern.pattern_id INNER join doc_pdpa_data on doc_pdpa_data.data_id=? INNER join TB_TR_APIVERIFY_USER as au on au.acc_id=doc_pdpa_classification.acc_id WHERE doc_pdpa_classification.classify_id=? and doc_pdpa_data.data_name=? and au.genkey=? and au.confirm="0";',
//                       [multidatadoc_data[t],data.activity, personalval, token],
//                       (err, check) => {
//                         console.log(personalval);
//                         var doc_num = 0;
//                       if (check.length > 0) {
//                         var datacheck =
//                           check[0].classify_data_exception_or_unnecessary_filter_name;
//                         datacheck = datacheck.split(",");
//                         for (i in datacheck) {
//                           for (x in multidata) {
//                             if (multidata[x] == datacheck[i]) {
//                               mulupdate[x] = "notsend";
//                             }
//                           }
//                         }
//                         for (p in mulupdate) {
//                           if (mulupdate[p] != "notsend") {
//                             newdata.push(mulupdate[p]);
//                           }
//                         }
//                         if (check[0].classify_type_data_in_event_personal == 1) {
//                           newdata = newtext(
//                             newdata,
//                             check[0].classify_type_data_in_event_personal_datamark
//                           );
//                         } 
//                         var test = {}
//                         test[index1] = newdata[0].toString();
//                         pushdatatest.push(test) 
//                         newdata = [];
//                         // console.log(pushdatatest);
//                       }
//                       //  else {
//                       //   // res.send({ status: "ERROR-404", value: data, token: token });
//                       //   var test = {}
//                       //   test[index1] = null;
//                       //   pushdatatest.push(test) 
//                       // }
//                       // console.log(doc_num);
//                       if(data.personal.length == index2+1 && multidatadoc_data.length == t+1){
//                         // console.log(pushdatatest);
//                         // console.log(index2,doc_num,s);
//                         res.send({
//                           status: "success-200",
//                           value: data,
//                           token: token,
//                           dataresponse: pushdatatest,
//                         });
//                       }
//                     }
//                   );
//                 });
//                   }
  
//                   }else if(data.personal.length == index2+1 ){
//                     console.log("erorrrrrrrrrrrrr");
//                     res.send({ status: "ERROR-404", value: data, token: token });
//                   }
//           });
//         });
//         }
//       }
      
//       // var multidata = data.dataname;
//     }
//   };



function newtext(data, typeid) {
    var newdata = [];
    var data = [data]
    for (x in data) {
      var ar = [];
        for (z in data[x]) {
          var text = marktext(data[x][z], typeid);
  
          ar.push(text);
        }
        newdata.push(ar);
    }
    return newdata;
  }
  function marktext(textlabel, type) {
    var text = "";
    var possible = textlabel;
    let count = 0;
    for (var i = 0; i < possible.length; i++) {
      if (i == 0 && type == 0) {
        text += possible[i].replace(possible[i], "*");
      } else if (i == 0 && type == 1) {
        text += possible[i].replace(possible[i], "*");
      } else if (i == possible.length - 1 && type == 1) {
        text += possible[i].replace(possible[i], "*");
      } else if (i == possible.length - 1 && type == 2) {
        text += possible[i].replace(possible[i], "*");
      } else if (type == 3) {
        text += possible[i].replace(possible[i], "*");
      } else {
        text += possible[i];
      }
    }
    return text;
  }


module.exports = controller;