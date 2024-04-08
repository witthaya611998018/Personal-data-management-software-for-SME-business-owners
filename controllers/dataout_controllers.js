const controller = {};
const path = require("path");
const nodemailer = require("nodemailer");
const fs = require("fs");
let csvToJson = require("convert-csv-to-json");
const checkDiskSpace = require("check-disk-space").default;
const funchistory = require('./account_controllers')
const addDate = require("../utils/addDate")
require('dotenv').config()
function sethost(req,data) {
  var hostset = req.headers;
  var protocol = "http";
  if (hostset.hasOwnProperty("x-forwarded-proto")) {
    protocol = "https";
  }
  var host = ""
  if (data=="pipr") {
    host = process.env.COOKIE_DOMAIN
  }else{
    host = protocol + "://" + req.headers.host
  }
  
  return host;
}
controller.list = (req, res) => {
  //data.pop();
  const user = req.session.userid;
  var host = "http://" + req.rawHeaders[1];
  var hostsend = sethost(req);
  var session = req.session
  session.hostdataout = hostsend
  console.log(hostsend);
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    console.log(user);
    const keygen = makekeygen(8);
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT * FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id WHERE ac.acc_id=? ORDER BY cla.classify_id ASC;",
        [user],
        (err, classi) => {
          conn.query(
            "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE ac.acc_id=? ORDER BY dout.data_out_id ASC;",
            [user],
            (err, dataout) => {
              conn.query(
                'select DATE_FORMAT(dl.log_date, "%d/%m/%Y %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;',
                [user],
                (err, history) => {
                  conn.query(
                    'SELECT * FROM TB_TR_IMPORT',
                    (err, importname) => {
                  // console.log(classi);
                  checkDiskSpace(path.join(__dirname + "./")).then(
                    (diskSpace) => {
                      funchistory.funchistory(req, "dataout", `เข้าสู่เมนู การนำข้อมูลออก`, user)
                      res.render("./data_out/data_out_list", {
                        session: req.session,
                        classi: classi,
                        dataout: dataout,
                        history: history,
                        keygen: keygen,
                        importname,
                        checkDiskSpace: diskSpace,
                      });
                    }
                  );
                }
              );
            }
            );
            }
          );
        }
      );
    });
  }
};

controller.hash_history = (req, res) => {
  //data.pop();
  const user = req.session.userid;
  var host = "http://" + req.rawHeaders[1];
  var hostsend = sethost(req);
  var session = req.session
  session.hostdataout = hostsend
  console.log(hostsend);
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    console.log(user);
    const keygen = makekeygen(8);
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT * FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id WHERE ac.acc_id=? ORDER BY cla.classify_id ASC;",
        [user],
        (err, classi) => {
          conn.query(
            "SELECT *,DATE_FORMAT(datahash.date_download, '%Y-%m-%d %H:%i:%s' ) as date_load,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate,datahash.hash_md5 as md5,datahash.hash_sha1 as sha1,datahash.hash_sha256 as sha256 FROM  TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id right join TB_TR_PDPA_DATA_OUT_HISTORY_HASH as datahash on datahash.data_out_id=dout.data_out_id WHERE ac.acc_id=? ORDER BY datahash.data_out_history_hash_id ASC;",
            [user],
            (err, dataout) => {
              conn.query(
                'select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;',
                [user],
                (err, history) => {
                  conn.query(
                    'SELECT * FROM TB_TR_IMPORT',
                    (err, importname) => {
                      conn.query(
                        "SELECT * FROM TB_MM_SET_SYSTEM as setsytem order by setsytem.sys_id DESC LIMIT 1;",
                        (err, set_system) => {
                  // console.log(classi);
                  checkDiskSpace(path.join(__dirname + "./")).then(
                    (diskSpace) => {
                      funchistory.funchistory(req, "dataout_history", `เข้าสู่เมนู ประวัติการนำข้อมูลออก`, user)
                      res.render("./data_out/data_out_hash_list", {
                        session: req.session,
                        classi: classi,
                        dataout: dataout,
                        history: history,
                        keygen: keygen,
                        importname,
                        set_system,
                        checkDiskSpace: diskSpace,
                      });
                    }
                  );
                }
                );
                }
              );
            }
            );
            }
          );
        }
      );
    });
  }
};

controller.listadd = (req, res) => {
  //data.pop();
  const user = req.session.userid;
  var host = sethost(req) + "/";
  console.log(req.session.hostdataout);
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    console.log(user);
    //sendmailfunc();
    const keygen = makekeygen(8);
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT * FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id WHERE ac.acc_id=? ORDER BY cla.classify_id ASC;",
        [user],
        (err, classi) => {
          conn.query(
            "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE ac.acc_id=? ORDER BY dout.data_out_id ASC;",
            [user],
            (err, dataout) => {
              conn.query(
                'select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;',
                [user],
                (err, history) => {
                  conn.query(
                    "SELECT * FROM TB_MM_SET_SYSTEM as setsytem order by setsytem.sys_id DESC LIMIT 1;",
                    (err, set_system) => {
                  // console.log(classi);
                  res.render("./data_out/data_out_listadd", {
                    session: req.session,
                    classi: classi,
                    dataout: dataout,
                    history: history,
                    keygen: keygen,
                    host: host,
                    set_system
                  });
                }
              );
            }
            );
            }
          );
        }
      );
    });
  }
};

controller.login = (req, res) => {
  const { id } = req.params;
  console.log(id);
  var date = addDate();
  var time = addDatetime();
  console.log(time);
  var host = sethost(req,"pipr") 
  req.getConnection((err, conn) => {
    conn.query(
      "SELECT * FROM TB_TR_PDPA_CLASSIFICATION as clas INNER JOIN TB_TR_PDPA_DATA_OUT as dataout on dataout.classify_id=clas.classify_id WHERE dataout.data_out_id=?;",
      [id],
      (err, checkk) => {
        conn.query(
          "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate,if(DATEDIFF(?,date_create)<=long_date,'yes','no') as checkdate,if(?=date_create,'yes','no') as checksum,if(?<=long_hour,'yes','no') as checktime,if(0=long_hour,'yes','no') as checkday FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE data_out_id=? and dpo_confirm=1 ORDER BY dout.data_out_id ASC;",
          [date, date, time, id],
          (err, classi) => {
            if (classi.length > 0) {
              if (classi[0].checkday == "no") {
                conn.query(
                  "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate,if(DATEDIFF(?,date_create)=long_date+1,'yes','no') as checkdatenow,if(DATEDIFF(?,date_create)<=long_date,'yes','no') as checkdate,if(?<=long_hour,'yes','no') as checktime,if(0=long_hour,'yes','no') as checkday FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE data_out_id=? ORDER BY dout.data_out_id ASC;",
                  [date, date, time, id],
                  (err, check) => {
                    if (
                      classi[0].checksum == "yes" ||
                      check[0].checkdate == "yes"
                    ) {
                      funchistory.funchistory(req, "dataout_email", `เข้าสู่ระบบ การนำข้อมูลออก ประเภท email : ${classi[0].res_link} id : ${classi[0].data_out_id}`, classi[0].acc_id)
                      res.render("./data_out/data_out_loginemail", {
                        id: id,
                        dataout: checkk,
                        data: "1",
                        host,
                        classi: classi,
                      });
                    } else if (
                      check[0].checkdatenow == "yes" &&
                      check[0].checktime == "yes"
                    ) {
                      funchistory.funchistory(req, "dataout_email", `เข้าสู่ระบบ การนำข้อมูลออก ประเภท email : ${classi[0].res_link}  id : ${classi[0].data_out_id}`, classi[0].acc_id)
                      res.render("./data_out/data_out_loginemail", {
                        id: id,
                        dataout: checkk,
                        data: "1",
                        host,
                        classi: classi,
                      });
                    } else {
                      funchistory.funchistory(req, "dataout_email", `เข้าสู่ระบบ การนำข้อมูลออก ประเภท email : ${classi[0].res_link}  id : ${classi[0].data_out_id} ไม่ได้เนื่องจากข้อมูลหมดอายุ `, classi[0].acc_id)
                      res.render("./data_out/data_out_loginemail", {
                        id: id,
                        host,
                        dataout: checkk,
                        data: "0",
                        classi: classi,
                      });
                    }
                  }
                );
              } else {
                conn.query(
                  "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate,if(DATEDIFF(?,date_create)<=long_date,'yes','no') as checkdate,if(?<=long_hour,'yes','no') as checktime,if(0=long_hour,'yes','no') as checkday FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE data_out_id=? ORDER BY dout.data_out_id ASC;",
                  [date, time, id],
                  (err, check) => {
                    if (check[0].checkdate == "yes") {
                      funchistory.funchistory(req, "dataout_email", `เข้าสู่ระบบ การนำข้อมูลออก ประเภท email : ${classi[0].res_link}  id : ${classi[0].data_out_id}`, classi[0].acc_id)
                      res.render("./data_out/data_out_loginemail", {
                        id: id,
                        host,
                        dataout: checkk,
                        data: "1",
                        classi: classi,
                      });
                    } else {
                      funchistory.funchistory(req, "dataout_email", `เข้าสู่ระบบ การนำข้อมูลออก ประเภท email : ${classi[0].res_link} ไม่ได้เนื่องจากข้อมูลหมดอายุ  id : ${classi[0].data_out_id}`, classi[0].acc_id)
                      res.render("./data_out/data_out_loginemail", {
                        id: id,
                        host,
                        dataout: checkk,
                        data: "0",
                        classi: classi,
                      });
                    }
                  }
                );
              }
            } else {
              funchistory.funchistory(req, "dataout_email", `เข้าสู่ระบบ การนำข้อมูลออก ประเภท email ไม่ได้เนื่องจากข้อมูลไม่มีในระบบ`, classi[0].acc_id)
              res.render("./data_out/data_out_loginemail", {
                id: id,
                host,
                dataout: checkk,
                data: "3",
                classi: classi,
              });
            }
          }
        );
      }
    );
  });
};

controller.dataoutfilter = (req, res) => {
  var datareq = req.body;
  var email = datareq.email;
  const id = datareq.id;
  var namedata = []
  var datasendwait = []
  var datasend = []
  var rows = 0
  var host = sethost(req,"pipr") 
  req.getConnection((err, conn) => {
    conn.query(
      "SELECT *,clas.classify_type_data_in_event_personal_datamark_check as typemark FROM TB_TR_PDPA_CLASSIFICATION as clas INNER JOIN TB_TR_PDPA_DATA_OUT as dataout on dataout.classify_id=clas.classify_id INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=clas.pattern_id WHERE dataout.data_out_id=? and dataout.res_link=?;",
      [id,email],
      (err, classi) => {
        if(classi.length > 0){
          console.log(classi);
          if(classi[0].pattern_storage_method_inside_import == 1){
            var spilt_id = classi[0].pattern_storage_method_inside_import_id
            spilt_id = spilt_id.split(",");
            console.log(spilt_id);
              for(l in spilt_id){
                var numl = parseInt(l)
                conn.query(
                  "SELECT *,? as l FROM TB_TR_IMPORT as im RIGHT JOIN TB_TR_IMPORT_FILE as imfile on im.ftp_id=imfile.import_id WHERE im.ftp_id=? ORDER BY imfile.id ASC;",
                  [l,spilt_id[l]],
                  (err, datainsert01) => {
                    for(ll in datainsert01){
                      var numlll = parseInt(ll)
                      var index = spilt_id[datainsert01[ll].l]
                      conn.query(
                      "SELECT *,REPLACE(data_code, '#', '') as redata_code,? as ll FROM TB_TR_IMPORT as im INNER JOIN TB_TR_IMPORT_FILE as imfile on im.ftp_id=imfile.import_id INNER JOIN TB_TR_IMPORT_DATA as imdata on imfile.id=imdata.import_file_id INNER JOIN TB_TR_PDPA_DATA as dt on dt.data_id=imdata.doc_pdpa_data_id WHERE im.ftp_id=? and imfile.id=? ORDER BY imdata.id ASC;",
                      [ll,index,datainsert01[ll].id],
                      (err, datainsert) => {
                           if(datainsert.length > 0){
                      if(datainsert[0].ll == 0 && datainsert01[0].l == 0){
                        console.log(datainsert[0].ll,datainsert01[0].l);
                        for(ll in datainsert){
                        const isInArray  = namedata.includes(datainsert[ll].redata_code)
                        if(isInArray == false){
                          namedata.push(datainsert[ll].redata_code)
                        }if(datainsert[ll].rows > rows){
                          rows = datainsert[ll].rows+1
                        }
                      }
                      datasend.push(namedata)
                      console.log(rows);
                      }
                      for(llx in namedata){
                        var importdata = []
                        var numllx = parseInt(llx)
                        for(llxx in datainsert){
                          var num1 = parseInt(llxx)
                          if(datainsert[llxx].redata_code == namedata[llx]){
                            // console.log(datainsert[llxx].redata_code);
                            importdata.push(datainsert[llxx].value);
                          }if(num1+1 == datainsert.length){
                            datasendwait.push(importdata)
                          }if(num1+1 == datainsert.length && numllx+1 == namedata.length){
                            console.log("check");
                            for(datai in datasendwait[0]){
                              var req1 = []
                              for(dataii in datasendwait){
                                req1.push(datasendwait[dataii][datai])
                              }
                              datasend.push(req1)
                            }
                            datasendwait = []
                          }
                          var index1 = parseInt(datainsert01[0].l)
                          var index2 = parseInt(datainsert[0].ll)
                          if(num1+1 == datainsert.length && numllx+1 == namedata.length && index1+1 == spilt_id.length && index2+1 == datainsert01.length){
                            console.log("check2");
                            console.log(index1,spilt_id.length,index2,datainsert01.length);
                            if (classi[0].typemark == 0) {
                              var data = datasend;
                            } else {
                              var data = datasend;
                              data = newtext(data, classi[0].classify_type_data_in_event_personal_datamark);
                            }
                            funchistory.funchistory(req, "dataout_email", `เข้าสู่ระบบสำเร็จ การนำข้อมูลออก ประเภท email หน้า filter: ${classi[0].res_link} id : ${classi[0].data_out_id}`, classi[0].acc_id)
                            res.render("./data_out/data_out_filter", {
                              id: id,
                              host,
                              data: data,
                              typefilter: classi[0].type_link,
                            });
                          }
                        }
                      }
                     
              
                    }
                      });
                    }
                  });
                
              }
          }
        }
        else{
          res.redirect("/loginemail/" + id);
        }
      }
    );
  });
};

controller.apisend2 = (req, res) => {
  const { token } = req.params;
  var date = addDate();
  var time = addDatetime();
  console.log(time);
  req.getConnection((err, conn) => {
    conn.query(
      "SELECT *,clas.classify_type_data_in_event_personal as typemark FROM TB_TR_PDPA_DATA_OUT as dataout inner JOIN TB_TR_PDPA_CLASSIFICATION as clas on clas.classify_id=dataout.classify_id INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=clas.pattern_id WHERE dataout.res_link=?;",
      [token],
      (err, checkpath) => {
    conn.query(
      "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate,if(DATEDIFF(?,date_create)<=long_date,'yes','no') as checkdate,if(?=date_create,'yes','no') as checksum,if(?<=long_hour,'yes','no') as checktime,if(0=long_hour,'yes','no') as checkday FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE res_link=? and dpo_confirm=1 ORDER BY dout.data_out_id ASC;",
      [date, date, time, token],
      (err, classi) => {
        if (classi.length > 0) {
          if (classi[0].checkday == "no") {
            conn.query(
              "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate,if(DATEDIFF(?,date_create)=long_date+1,'yes','no') as checkdatenow,if(DATEDIFF(?,date_create)<=long_date,'yes','no') as checkdate,if(?<=long_hour,'yes','no') as checktime,if(0=long_hour,'yes','no') as checkday FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE res_link=? ORDER BY dout.data_out_id ASC;",
              [date, date, time, token],
              (err, check) => {
                
                console.log(check[0].checkdatenow);
                if (
                  classi[0].checksum == "yes" ||
                  check[0].checkdate == "yes"
                ) {
                  if (classi[0].type_link == 4) {
                    let json = csvToJson
                      .fieldDelimiter(",")
                      .getJsonFromCsv(checkpath[0].pattern_type_data_file_path);
                    json = convertarr(json, checkpath[0].classify_type_data_in_event_personal_datamark)
                    res.json(json);
                  } else if (classi[0].type_link == 3) {
                    var data = imcsv(checkpath[0].pattern_type_data_file_path);
                    data = newtext(data, checkpath[0].classify_type_data_in_event_personal_datamark);
                    console.log(convertarr(data));
                    res.render("./data_out/data_out_csvdownload", {
                      dataout: classi,
                      data: data,
                    });
                  }
                } else if (
                  check[0].checkdatenow == "yes" &&
                  check[0].checktime == "yes"
                ) {
                  if (classi[0].type_link == 4) {
                    let json = csvToJson
                      .fieldDelimiter(",")
                      .getJsonFromCsv(checkpath[0].pattern_type_data_file_path);
                      json = convertarr(json, checkpath[0].classify_type_data_in_event_personal_datamark)
                    res.json(json);
                  } else if (classi[0].type_link == 3) {
                    var data = imcsv(checkpath[0].pattern_type_data_file_path);
                    data = newtext(data, checkpath[0].classify_type_data_in_event_personal_datamark);
                    console.log(convertarr(data));
                    res.render("./data_out/data_out_csvdownload", {
                      dataout: classi,
                      data: data,
                    });
                  }
                } else if (classi[0].type_link == 4) {
                  res.json([{ data: "ข้อมูลหมดอายุ" }]);
                } else if (classi[0].type_link == 3) {
                  console.log("yes");
                  res.render("./data_out/data_out_csvdownload", {
                    dataout: classi,
                    data: [],
                  });
                }
              }
            );
          } else {
            conn.query(
              "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate,if(DATEDIFF(?,date_create)<=long_date,'yes','no') as checkdate,if(?<=long_hour,'yes','no') as checktime,if(0=long_hour,'yes','no') as checkday FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE res_link=? ORDER BY dout.data_out_id ASC;",
              [date, time, token],
              (err, check) => {
                if (check[0].checkdate == "yes") {
                  if (classi[0].type_link == 4) {
                    let json = csvToJson
                      .fieldDelimiter(",")
                      .getJsonFromCsv(checkpath[0].pattern_type_data_file_path);
                      json = convertarr(json, checkpath[0].classify_type_data_in_event_personal_datamark)
                    res.json(json);
                  } else {
                    var data = imcsv(checkpath[0].pattern_type_data_file_path);
                    data = newtext(data, checkpath[0].classify_type_data_in_event_personal_datamark);
                    console.log(convertarr(data));
                    res.render("./data_out/data_out_csvdownload", {
                      dataout: classi,
                      data: data,
                    });
                  }
                } else if (classi[0].type_link == 4) {
                  res.json([{ data: "ข้อมูลหมดอายุ" }]);
                } else if (classi[0].type_link == 3) {
                  console.log("yes");
                  res.render("./data_out/data_out_csvdownload", {
                    dataout: classi,
                    data: [],
                  });
                }
              }
            );
          }
        } else {
          res.json([{ data: "ไม่มี token นี้ในระบบ" }]);
        }
      }
    );
  });
});
};

controller.apisend = (req, res) => {
  const { token } = req.params;
  var date = addDate();
  var time = addDatetime();
  var id = token
  var namedata = []
  var datasendwait = []
  var datasend = []
  var rows = 0
  console.log(time);
  req.getConnection((err, conn) => {
    conn.query(
      "SELECT * FROM TB_TR_PDPA_CLASSIFICATION as clas INNER JOIN TB_TR_PDPA_DATA_OUT as dataout on dataout.classify_id=clas.classify_id INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=clas.pattern_id WHERE dataout.res_link=?;",
      [token],
      (err, checkpath) => {
    conn.query(
      "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate,if(DATEDIFF(?,date_create)<=long_date,'yes','no') as checkdate,if(?=date_create,'yes','no') as checksum,if(?<=long_hour,'yes','no') as checktime,if(0=long_hour,'yes','no') as checkday FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE res_link=? and dpo_confirm=1 ORDER BY dout.data_out_id ASC;",
      [date, date, time, token],
      (err, classi) => {
        if (classi.length > 0) {
          if (classi[0].checkday == "no") {
            conn.query(
              "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate,if(DATEDIFF(?,date_create)=long_date+1,'yes','no') as checkdatenow,if(DATEDIFF(?,date_create)<=long_date,'yes','no') as checkdate,if(?<=long_hour,'yes','no') as checktime,if(0=long_hour,'yes','no') as checkday FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE res_link=? ORDER BY dout.data_out_id ASC;",
              [date, date, time, token],
              (err, check) => {
                
                console.log(check[0].checkdatenow);
                if (
                  classi[0].checksum == "yes" ||
                  check[0].checkdate == "yes"
                ) {
                  if(classi[0].pattern_storage_method_inside_import == 1){
                    var spilt_id = classi[0].pattern_storage_method_inside_import_id
                    spilt_id = spilt_id.split(",");
                    // console.log(spilt_id);
                      for(l in spilt_id){
                        var numl = parseInt(l)
                        conn.query(
                          "SELECT *,? as l FROM TB_TR_IMPORT as im RIGHT JOIN TB_TR_IMPORT_FILE as imfile on im.ftp_id=imfile.import_id WHERE im.ftp_id=? ORDER BY imfile.id ASC;",
                          [l,spilt_id[l]],
                          (err, datainsert01) => {
                            for(ll in datainsert01){
                              var numlll = parseInt(ll)
                              var index = spilt_id[datainsert01[ll].l]
                              conn.query(
                              "SELECT *,REPLACE(data_code, '#', '') as redata_code,? as ll FROM TB_TR_IMPORT as im INNER JOIN TB_TR_IMPORT_FILE as imfile on im.ftp_id=imfile.import_id INNER JOIN TB_TR_IMPORT_DATA as imdata on imfile.id=imdata.import_file_id INNER JOIN TB_TR_PDPA_DATA as dt on dt.data_id=imdata.doc_pdpa_data_id WHERE im.ftp_id=? and imfile.id=? ORDER BY imdata.id ASC;",
                              [ll,index,datainsert01[ll].id],
                              (err, datainsert) => {
                                   if(datainsert.length > 0){
                              if(datainsert[0].ll == 0 && datainsert01[0].l == 0){
                                // console.log(datainsert[0].ll,datainsert01[0].l);
                                for(ll in datainsert){
                                const isInArray  = namedata.includes(datainsert[ll].redata_code)
                                if(isInArray == false){
                                  namedata.push(datainsert[ll].redata_code)
                                }if(datainsert[ll].rows > rows){
                                  rows = datainsert[ll].rows+1
                                }
                              }
                              datasend.push(namedata)
                              // console.log(rows);
                              }
                              for(llx in namedata){
                                var importdata = []
                                var numllx = parseInt(llx)
                                for(llxx in datainsert){
                                  var num1 = parseInt(llxx)
                                  if(datainsert[llxx].redata_code == namedata[llx]){
                                    // console.log(datainsert[llxx].redata_code);
                                    importdata.push(datainsert[llxx].value);
                                  }if(num1+1 == datainsert.length){
                                    datasendwait.push(importdata)
                                  }if(num1+1 == datainsert.length && numllx+1 == namedata.length){
                                    console.log("check");
                                    for(datai in datasendwait[0]){
                                      var req1 = []
                                      for(dataii in datasendwait){
                                        req1.push(datasendwait[dataii][datai])
                                      }
                                      datasend.push(req1)
                                    }
                                    datasendwait = []
                                  }
                                  var index1 = parseInt(datainsert01[0].l)
                                  var index2 = parseInt(datainsert[0].ll)
                                  if(num1+1 == datainsert.length && numllx+1 == namedata.length && index1+1 == spilt_id.length && index2+1 == datainsert01.length){
                                    // console.log("check2");
                                    // console.log(index1,spilt_id.length,index2,datainsert01.length);
                                    if (classi[0].type_link == 4) {
                                      let data = datasend
                                      data = convertarr(data, checkpath[0].classify_type_data_in_event_personal_datamark)
                                      funchistory.funchistory(req, "dataout_json", `ใช้ข้อมูล การนำข้อมูลออก ประเภท json id : ${classi[0].data_out_id}`, classi[0].acc_id)
                                      res.json(data);
                                    } else if (classi[0].type_link == 3) {
                                      var data = datasend
                                      data = newtext(data, checkpath[0].classify_type_data_in_event_personal_datamark);
                                      // console.log(convertarr(data));
                                      funchistory.funchistory(req, "dataout_csv", `download การนำข้อมูลออก ประเภท csv id : ${classi[0].data_out_id}`, classi[0].acc_id)
                                      res.render("./data_out/data_out_csvdownload", {
                                        dataout: classi,
                                        data: data,
                                      });
                                    }
                                  }
                                }
                              }
                             
                      
                            }
                              });
                            }
                          });
                        
                      }
                  }
                } else if (
                  check[0].checkdatenow == "yes" &&
                  check[0].checktime == "yes"
                ) {
                  if(classi[0].pattern_storage_method_inside_import == 1){
                    var spilt_id = classi[0].pattern_storage_method_inside_import_id
                    spilt_id = spilt_id.split(",");
                    // console.log(spilt_id);
                      for(l in spilt_id){
                        var numl = parseInt(l)
                        conn.query(
                          "SELECT *,? as l FROM TB_TR_IMPORT as im RIGHT JOIN TB_TR_IMPORT_FILE as imfile on im.ftp_id=imfile.import_id WHERE im.ftp_id=? ORDER BY imfile.id ASC;",
                          [l,spilt_id[l]],
                          (err, datainsert01) => {
                            for(ll in datainsert01){
                              var numlll = parseInt(ll)
                              var index = spilt_id[datainsert01[ll].l]
                              conn.query(
                              "SELECT *,REPLACE(data_code, '#', '') as redata_code,? as ll FROM TB_TR_IMPORT as im INNER JOIN TB_TR_IMPORT_FILE as imfile on im.ftp_id=imfile.import_id INNER JOIN TB_TR_IMPORT_DATA as imdata on imfile.id=imdata.import_file_id INNER JOIN TB_TR_PDPA_DATA as dt on dt.data_id=imdata.doc_pdpa_data_id WHERE im.ftp_id=? and imfile.id=? ORDER BY imdata.id ASC;",
                              [ll,index,datainsert01[ll].id],
                              (err, datainsert) => {
                                   if(datainsert.length > 0){
                              if(datainsert[0].ll == 0 && datainsert01[0].l == 0){
                                // console.log(datainsert[0].ll,datainsert01[0].l);
                                for(ll in datainsert){
                                const isInArray  = namedata.includes(datainsert[ll].redata_code)
                                if(isInArray == false){
                                  namedata.push(datainsert[ll].redata_code)
                                }if(datainsert[ll].rows > rows){
                                  rows = datainsert[ll].rows+1
                                }
                              }
                              datasend.push(namedata)
                              // console.log(rows);
                              }
                              for(llx in namedata){
                                var importdata = []
                                var numllx = parseInt(llx)
                                for(llxx in datainsert){
                                  var num1 = parseInt(llxx)
                                  if(datainsert[llxx].redata_code == namedata[llx]){
                                    // console.log(datainsert[llxx].redata_code);
                                    importdata.push(datainsert[llxx].value);
                                  }if(num1+1 == datainsert.length){
                                    datasendwait.push(importdata)
                                  }if(num1+1 == datainsert.length && numllx+1 == namedata.length){
                                    console.log("check");
                                    for(datai in datasendwait[0]){
                                      var req1 = []
                                      for(dataii in datasendwait){
                                        req1.push(datasendwait[dataii][datai])
                                      }
                                      datasend.push(req1)
                                    }
                                    datasendwait = []
                                  }
                                  var index1 = parseInt(datainsert01[0].l)
                                  var index2 = parseInt(datainsert[0].ll)
                                  if(num1+1 == datainsert.length && numllx+1 == namedata.length && index1+1 == spilt_id.length && index2+1 == datainsert01.length){
                                    // console.log("check2");
                                    // console.log(index1,spilt_id.length,index2,datainsert01.length);
                                    if (classi[0].type_link == 4) {
                                      let data = datasend
                                      data = convertarr(data, checkpath[0].classify_type_data_in_event_personal_datamark)
                                      funchistory.funchistory(req, "dataout_json", `ใช้ข้อมูล การนำข้อมูลออก ประเภท json id : ${classi[0].data_out_id}`, classi[0].acc_id)
                                      res.json(data);
                                    } else if (classi[0].type_link == 3) {
                                      var data = datasend
                                      data = newtext(data, checkpath[0].classify_type_data_in_event_personal_datamark);
                                      // console.log(convertarr(data));
                                      funchistory.funchistory(req, "dataout_csv", `download การนำข้อมูลออก ประเภท csv id : ${classi[0].data_out_id}`, classi[0].acc_id)
                                      res.render("./data_out/data_out_csvdownload", {
                                        dataout: classi,
                                        data: data,
                                      });
                                    }
                                  }
                                }
                              }
                             
                      
                            }
                              });
                            }
                          });
                      }
                  }
                } else if (classi[0].type_link == 4) {
                  res.json([{ data: "ข้อมูลหมดอายุ" }]);
                } else if (classi[0].type_link == 3) {
                  console.log("yes");
                  res.render("./data_out/data_out_csvdownload", {
                    dataout: classi,
                    data: [],
                  });
                }
              }
            );
          } else {
            conn.query(
              "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate,if(DATEDIFF(?,date_create)<=long_date,'yes','no') as checkdate,if(?<=long_hour,'yes','no') as checktime,if(0=long_hour,'yes','no') as checkday FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE res_link=? ORDER BY dout.data_out_id ASC;",
              [date, time, token],
              (err, check) => {
                if (check[0].checkdate == "yes") {
                  if(classi[0].pattern_storage_method_inside_import == 1){
                    var spilt_id = classi[0].pattern_storage_method_inside_import_id
                    spilt_id = spilt_id.split(",");
                    // console.log(spilt_id);
                      for(l in spilt_id){
                        var numl = parseInt(l)
                        conn.query(
                          "SELECT *,? as l FROM TB_TR_IMPORT as im RIGHT JOIN TB_TR_IMPORT_FILE as imfile on im.ftp_id=imfile.import_id WHERE im.ftp_id=? ORDER BY imfile.id ASC;",
                          [l,spilt_id[l]],
                          (err, datainsert01) => {
                            for(ll in datainsert01){
                              var numlll = parseInt(ll)
                              var index = spilt_id[datainsert01[ll].l]
                              conn.query(
                              "SELECT *,REPLACE(data_code, '#', '') as redata_code,? as ll FROM TB_TR_IMPORT as im INNER JOIN TB_TR_IMPORT_FILE as imfile on im.ftp_id=imfile.import_id INNER JOIN TB_TR_IMPORT_DATA as imdata on imfile.id=imdata.import_file_id INNER JOIN TB_TR_PDPA_DATA as dt on dt.data_id=imdata.doc_pdpa_data_id WHERE im.ftp_id=? and imfile.id=? ORDER BY imdata.id ASC;",
                              [ll,index,datainsert01[ll].id],
                              (err, datainsert) => {
                                   if(datainsert.length > 0){
                              if(datainsert[0].ll == 0 && datainsert01[0].l == 0){
                                // console.log(datainsert[0].ll,datainsert01[0].l);
                                for(ll in datainsert){
                                const isInArray  = namedata.includes(datainsert[ll].redata_code)
                                if(isInArray == false){
                                  namedata.push(datainsert[ll].redata_code)
                                }if(datainsert[ll].rows > rows){
                                  rows = datainsert[ll].rows+1
                                }
                              }
                              datasend.push(namedata)
                              // console.log(rows);
                              }
                              for(llx in namedata){
                                var importdata = []
                                var numllx = parseInt(llx)
                                for(llxx in datainsert){
                                  var num1 = parseInt(llxx)
                                  if(datainsert[llxx].redata_code == namedata[llx]){
                                    // console.log(datainsert[llxx].redata_code);
                                    importdata.push(datainsert[llxx].value);
                                  }if(num1+1 == datainsert.length){
                                    datasendwait.push(importdata)
                                  }if(num1+1 == datainsert.length && numllx+1 == namedata.length){
                                    // console.log("check");
                                    for(datai in datasendwait[0]){
                                      var req1 = []
                                      for(dataii in datasendwait){
                                        req1.push(datasendwait[dataii][datai])
                                      }
                                      datasend.push(req1)
                                    }
                                    datasendwait = []
                                  }
                                  var index1 = parseInt(datainsert01[0].l)
                                  var index2 = parseInt(datainsert[0].ll)
                                  if(num1+1 == datainsert.length && numllx+1 == namedata.length && index1+1 == spilt_id.length && index2+1 == datainsert01.length){
                                    // console.log("check2");
                                    // console.log(index1,spilt_id.length,index2,datainsert01.length);
                                    if (classi[0].type_link == 4) {
                                      let data = datasend
                                      data = convertarr(data, checkpath[0].classify_type_data_in_event_personal_datamark)
                                      funchistory.funchistory(req, "dataout_json", `ใช้ข้อมูล การนำข้อมูลออก ประเภท json id : ${classi[0].data_out_id}`, classi[0].acc_id)
                                      res.json(data);
                                    } else if (classi[0].type_link == 3) {
                                      var data = datasend
                                      data = newtext(data, checkpath[0].classify_type_data_in_event_personal_datamark);
                                      console.log(convertarr(data));
                                      funchistory.funchistory(req, "dataout_csv", `download การนำข้อมูลออก ประเภท csv id : ${classi[0].data_out_id}`, classi[0].acc_id)
                                      res.render("./data_out/data_out_csvdownload", {
                                        dataout: classi,
                                        data: data,
                                      });
                                    }
                                  }
                                }
                              }
                             
                      
                            }
                              });
                            }
                          });
                      }
                  }
                } else if (classi[0].type_link == 4) {
                  res.json([{ data: "ข้อมูลหมดอายุ" }]);
                } else if (classi[0].type_link == 3) {
                  console.log("yes");
                  res.render("./data_out/data_out_csvdownload", {
                    dataout: classi,
                    data: [],
                  });
                }
              }
            );
          }
        } else {
          res.json([{ data: "ไม่มี token นี้ในระบบ" }]);
        }
      }
    );
  });
});
};

controller.checkdatamark = (req, res) => {
  var result = req.body.typeid;
  var id = result[0].valid;
  var id2 = result[0].typemark
  var namedata = []
  var datasendwait = []
  var datasend = []
  var rows = 0
  req.getConnection((err, conn) => {
    conn.query(
      "SELECT * FROM TB_TR_PDPA_CLASSIFICATION as clas INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=clas.pattern_id WHERE clas.classify_id=?;",
      [id],
      (err, classi) => {
        if(classi[0].pattern_storage_method_inside_import == 1){
          var spilt_id = classi[0].pattern_storage_method_inside_import_id
          spilt_id = spilt_id.split(",");
          console.log(spilt_id);
            for(l in spilt_id){
              var numl = parseInt(l)
              conn.query(
                "SELECT *,? as l FROM TB_TR_IMPORT as im RIGHT JOIN TB_TR_IMPORT_FILE as imfile on im.ftp_id=imfile.import_id WHERE im.ftp_id=? ORDER BY imfile.id ASC;",
                [l,spilt_id[l]],
                (err, datainsert01) => {
                  for(ll in datainsert01){
                    var numlll = parseInt(ll)
                    var index = spilt_id[datainsert01[ll].l]
                    conn.query(
                    "SELECT *,REPLACE(data_code, '#', '') as redata_code,? as ll FROM TB_TR_IMPORT as im INNER JOIN TB_TR_IMPORT_FILE as imfile on im.ftp_id=imfile.import_id INNER JOIN TB_TR_IMPORT_DATA as imdata on imfile.id=imdata.import_file_id INNER JOIN TB_TR_PDPA_DATA as dt on dt.data_id=imdata.doc_pdpa_data_id WHERE im.ftp_id=? and imfile.id=? ORDER BY imdata.id ASC LIMIT 0,50;",
                    [ll,index,datainsert01[ll].id],
                    (err, datainsert) => {
                         if(datainsert.length > 0){
                    if(datainsert[0].ll == 0 && datainsert01[0].l == 0){
                      console.log(datainsert[0].ll,datainsert01[0].l);
                      for(ll in datainsert){
                      const isInArray  = namedata.includes(datainsert[ll].redata_code)
                      if(isInArray == false){
                        namedata.push(datainsert[ll].redata_code)
                      }if(datainsert[ll].rows > rows){
                        rows = datainsert[ll].rows+1
                      }
                    }
                    datasend.push(namedata)
                    console.log(rows);
                    }
                    for(llx in namedata){
                      var importdata = []
                      var numllx = parseInt(llx)
                      for(llxx in datainsert){
                        var num1 = parseInt(llxx)
                        if(datainsert[llxx].redata_code == namedata[llx]){
                          // console.log(datainsert[llxx].redata_code);
                          importdata.push(datainsert[llxx].value);
                        }if(num1+1 == datainsert.length){
                          datasendwait.push(importdata)
                        }if(num1+1 == datainsert.length && numllx+1 == namedata.length){
                          console.log("check");
                          for(datai in datasendwait[0]){
                            var req1 = []
                            for(dataii in datasendwait){
                              req1.push(datasendwait[dataii][datai])
                            }
                            datasend.push(req1)
                          }
                          datasendwait = []
                        }
                        var index1 = parseInt(datainsert01[0].l)
                        var index2 = parseInt(datainsert[0].ll)
                        if(num1+1 == datainsert.length && numllx+1 == namedata.length && index1+1 == spilt_id.length && index2+1 == datainsert01.length){
                          console.log("check2");
                          console.log(index1,spilt_id.length,index2,datainsert01.length);
                          if (id2 == 0) {
                            var data = datasend;
                          } else {
                            var data = datasend;
                            data = newtext(data, classi[0].classify_type_data_in_event_personal_datamark);
                          }
                          
                          console.log(data);
                          res.send({
                            data: data,
                          });
                        }
                      }
                    }
                   
            
                  }
                    });
                  }
                });
              
            }
        }else{
          res.send({
            data: [],
          });
        }
      }
    );
  });
};

controller.dporeview = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
  const { id } = req.params;
  const { id2 } = req.params;
  var namedata = []
  var datasendwait = []
  var datasend = []
  var rows = 0
  req.getConnection((err, conn) => {
    conn.query(
      "SELECT * FROM TB_TR_PDPA_CLASSIFICATION as clas INNER JOIN TB_TR_PDPA_DATA_OUT as dataout on dataout.classify_id=clas.classify_id INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=clas.pattern_id WHERE dataout.data_out_id=?;",
      [id],
      (err, classi) => {
        if(classi[0].pattern_storage_method_inside_import == 1){
          var spilt_id = classi[0].pattern_storage_method_inside_import_id
          spilt_id = spilt_id.split(",");
          console.log(spilt_id);
            for(l in spilt_id){
              var numl = parseInt(l)
              conn.query(
                "SELECT *,? as l FROM TB_TR_IMPORT as im RIGHT JOIN TB_TR_IMPORT_FILE as imfile on im.ftp_id=imfile.import_id WHERE im.ftp_id=? ORDER BY imfile.id ASC;",
                [l,spilt_id[l]],
                (err, datainsert01) => {
                  for(ll in datainsert01){
                    var numlll = parseInt(ll)
                    var index = spilt_id[datainsert01[ll].l]
                    conn.query(
                    "SELECT *,REPLACE(data_code, '#', '') as redata_code,? as ll FROM TB_TR_IMPORT as im INNER JOIN TB_TR_IMPORT_FILE as imfile on im.ftp_id=imfile.import_id INNER JOIN TB_TR_IMPORT_DATA as imdata on imfile.id=imdata.import_file_id INNER JOIN TB_TR_PDPA_DATA as dt on dt.data_id=imdata.doc_pdpa_data_id WHERE im.ftp_id=? and imfile.id=? ORDER BY imdata.id ASC;",
                    [ll,index,datainsert01[ll].id],
                    (err, datainsert) => {
                         if(datainsert.length > 0){
                    if(datainsert[0].ll == 0 && datainsert01[0].l == 0){
                      console.log(datainsert[0].ll,datainsert01[0].l);
                      for(ll in datainsert){
                      const isInArray  = namedata.includes(datainsert[ll].redata_code)
                      if(isInArray == false){
                        namedata.push(datainsert[ll].redata_code)
                      }if(datainsert[ll].rows > rows){
                        rows = datainsert[ll].rows+1
                      }
                    }
                    datasend.push(namedata)
                    console.log(rows);
                    }
                    for(llx in namedata){
                      var importdata = []
                      var numllx = parseInt(llx)
                      for(llxx in datainsert){
                        var num1 = parseInt(llxx)
                        if(datainsert[llxx].redata_code == namedata[llx]){
                          // console.log(datainsert[llxx].redata_code);
                          importdata.push(datainsert[llxx].value);
                        }if(num1+1 == datainsert.length){
                          datasendwait.push(importdata)
                        }if(num1+1 == datainsert.length && numllx+1 == namedata.length){
                          console.log("check");
                          for(datai in datasendwait[0]){
                            var req1 = []
                            for(dataii in datasendwait){
                              req1.push(datasendwait[dataii][datai])
                            }
                            datasend.push(req1)
                          }
                          datasendwait = []
                        }
                        var index1 = parseInt(datainsert01[0].l)
                        var index2 = parseInt(datainsert[0].ll)
                        if(num1+1 == datainsert.length && numllx+1 == namedata.length && index1+1 == spilt_id.length && index2+1 == datainsert01.length){
                          console.log("check2");
                          console.log(index1,spilt_id.length,index2,datainsert01.length);
                          if (id2 == 0) {
                            var data = datasend;
                          } else {
                            var data = datasend;
                            console.log(data);
                            data = newtext(data, classi[0].classify_type_data_in_event_personal_datamark);
                          }
                          
                          console.log(data);
                          funchistory.funchistory(req, "dataout", `หน้า dpo-review การนำข้อมูลออก id : ${classi[0].data_out_id}`, classi[0].acc_id)
                            res.render("./data_out/data_out_dporeview", {
                              session: req.session,
                              data: data,
                              typefilter:classi[0].type_link
                            });
                        }
                      }
                    }
                   
            
                  }
                    });
                  }
                });
            }
        }else{
          res.render("./data_out/data_out_dporeview", {
            session: req.session,
            data: [],
            typefilter:0
          });
        }
      }
    );
    });
}
};

controller.add = (req, res) => {
  //data.pop();
  const data = req.body;
  data.date_create = addDate();
  if (data.type_res == 0) {
    data.res_link = data.linkemail;
    delete data.linkToken;
    delete data.linkemail;
  } else {
    data.res_link = data.linkToken;
    delete data.linkToken;
    delete data.linkemail;
  }
  delete data.myTableclass_length;
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    var host = sethost(req,"pipr") ;
    console.log(host);
    console.log(data);
    req.getConnection((err, conn) => {
      conn.query(
        "INSERT INTO TB_TR_PDPA_DATA_OUT set ?;",
        [data],
        (err, classi) => {
          console.log(classi);
          funchistory.funchistory(req, "dataout", `เพิ่มข้อมูล การนำข้อมูลออก id : ${classi.insertId}`, req.session.userid)
          if (data.type_res == 0 && data.dpo_confirm == 1) {
            conn.query(
              "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE dout.data_out_id=?;",
              [classi.insertId],
              (err, dataout) => {
                if(dataout){
                  var name = dataout[0].firstname+" "+dataout[0].lastname
                  var namedata = "ชื่อประเภท "+dataout[0].classify_name+" ข้อมูลที่แยกประเภท "+dataout[0].pattern_name
                  sendmailfunc(host, data.res_link, classi.insertId,name,dataout[0].datecreate,namedata);
                }else{
                  res.redirect("/dataoutlist");
                }
              });
            
          }
          res.redirect("/dataoutlist");
        }
      );
    });
  }
};

controller.selectmonth = (req, res) => {
  //data.pop();
  const id = req.session.userid;
  const datareq = req.body;
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT COUNT(data_out_id) as countdate,DATE_FORMAT(date_create ,'%d/%m/%Y') as datecreate FROM TB_TR_PDPA_DATA_OUT as dataout INNER JOIN TB_TR_PDPA_CLASSIFICATION as cla on cla.classify_id=dataout.classify_id WHERE cla.acc_id=? and DATE_FORMAT(date_create,'%Y-%m') BETWEEN ? and ? GROUP BY date_create ORDER by date_create asc;",
        [id,datareq.start,datareq.end,datareq.end],
        (err, data) => {
          conn.query(
            "SELECT COUNT(date_create) as countdate,DATE_FORMAT(date_create ,'%d/%m/%Y') as datecreate FROM `TB_TR_PDPA_DATA_OUT` as dataout INNER JOIN TB_TR_PDPA_CLASSIFICATION as cla on cla.classify_id=dataout.classify_id WHERE dpo_confirm=1 and cla.acc_id=? and DATE_FORMAT(date_create,'%Y-%m') BETWEEN ? and ? GROUP BY date_create ORDER by date_create asc;",
            [id,datareq.start,datareq.end],
            (err, datadpo) => {
              conn.query(
                "SELECT COUNT(date_create) as countdate,DATE_FORMAT(date_create ,'%d/%m/%Y') as datecreate FROM `TB_TR_PDPA_DATA_OUT` as dataout INNER JOIN TB_TR_PDPA_CLASSIFICATION as cla on cla.classify_id=dataout.classify_id WHERE dpo_confirm=0 and cla.acc_id=? and DATE_FORMAT(date_create,'%Y-%m') BETWEEN ? and ? GROUP BY date_create ORDER by date_create asc;",
                [id,datareq.start,datareq.end],
                (err, datadpocon) => {
                  conn.query(
                    "SELECT COUNT(date_create) as countdate,DATE_FORMAT(date_create ,'%d/%m/%Y') as datecreate FROM `TB_TR_PDPA_DATA_OUT` as dataout INNER JOIN TB_TR_PDPA_CLASSIFICATION as cla on cla.classify_id=dataout.classify_id WHERE type_res=0 and cla.acc_id=? and DATE_FORMAT(date_create,'%Y-%m') BETWEEN ? and ? GROUP BY date_create ORDER by date_create asc;",
                    [id,datareq.start,datareq.end],
                    (err, dataemail) => {
                      conn.query(
                        "SELECT COUNT(date_create) as countdate,DATE_FORMAT(date_create ,'%d/%m/%Y') as datecreate FROM `TB_TR_PDPA_DATA_OUT` as dataout INNER JOIN TB_TR_PDPA_CLASSIFICATION as cla on cla.classify_id=dataout.classify_id WHERE type_res=1 and cla.acc_id=? and DATE_FORMAT(date_create,'%Y-%m') BETWEEN ? and ? GROUP BY date_create ORDER by date_create asc;",
                        [id,datareq.start,datareq.end],
                        (err, dataapi) => {
                          conn.query(
                            'SELECT DATE_FORMAT(date_create,"%Y-%m") as monthselect FROM TB_TR_PDPA_DATA_OUT as dataout INNER join TB_TR_PDPA_CLASSIFICATION as clas on clas.classify_id=dataout.classify_id WHERE acc_id=176 group by DATE_FORMAT(date_create,"%Y-%m") ORDER BY DATE_FORMAT(date_create,"%Y-%m") desc;',
                            [id],
                            (err, monthselect) => {
                          console.log(data);
                          funchistory.funchistory(req, "dataout", `หน้าเลือกเดือน การนำข้อมูลออก`, id)
                          res.render("./data_out/data_out_chartselect", {
                            session: req.session,
                            data: data,
                            datadpo: datadpo,
                            dataapi: dataapi,
                            dataemail: dataemail,
                            datadpocon: datadpocon,
                            monthselect:monthselect,
                            datareq:datareq
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
  }
};

controller.del = (req, res) => {
  //data.pop();
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const { id } = req.params;
    console.log(id);
    req.getConnection((err, conn) => {
      conn.query(
        "DELETE FROM TB_TR_PDPA_DATA_OUT where TB_TR_PDPA_DATA_OUT.data_out_id=?;",
        [id],
        (err, classi) => {
          console.log(classi);
          funchistory.funchistory(req, "dataout", `ลบข้อมูล การนำข้อมูลออก id : ${id}`, req.session.userid)
          res.redirect("/dataoutlist");
        }
      );
    });
  }
};

controller.details = (req, res) => {
  //data.pop();
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const { id } = req.params;
    console.log(id);
    var host = sethost(req);
    console.log(host);
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE dout.data_out_id=?;",
        [id],
        (err, dataout) => {
          conn.query(
            "SELECT * FROM TB_MM_SET_SYSTEM as setsytem order by setsytem.sys_id DESC LIMIT 1;",
            (err, set_system) => {
              conn.query(
                'SELECT * FROM TB_TR_IMPORT',
                (err, importname) => {
          // console.log(dataout);
          funchistory.funchistory(req, "dataout", `หน้าดูข้อมูล การนำข้อมูลออก id : ${id}`, req.session.userid)
          res.render("./data_out/data_out_details", {
            session: req.session,
            dataout: dataout,
            set_system,
            importname,
            host: host,
          });
        }
      );
    });
  });
  });
  }
};

controller.changedpo = (req, res) => {
  var host = sethost(req);
  console.log(host);
  //data.pop();
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const { id } = req.params;
    console.log(id);
    req.getConnection((err, conn) => {
      conn.query(
        "UPDATE TB_TR_PDPA_DATA_OUT SET dpo_confirm = 1 WHERE TB_TR_PDPA_DATA_OUT.data_out_id = ?;",
        [id],
        (err, classi) => {
          conn.query(
            "SELECT * FROM TB_TR_PDPA_DATA_OUT WHERE data_out_id = ?;",
            [id],
            (err, data) => {
              console.log(data[0]);
              funchistory.funchistory(req, "dataout", `อนุญาตการใช้ DPO การนำข้อมูลออก id : ${id}`, req.session.userid)
              if(data[0].type_res == 0){
                conn.query(
                  "SELECT *,DATE_FORMAT(dout.date_create ,'%d/%m/%Y') as datecreate FROM TB_TR_PDPA_CLASSIFICATION as cla INNER JOIN TB_TR_PDPA_PATTERN as pat on pat.pattern_id=cla.pattern_id INNER JOIN TB_TR_ACCOUNT as ac on ac.acc_id=cla.acc_id INNER join TB_TR_PDPA_DATA_OUT as dout ON dout.classify_id=cla.classify_id WHERE dout.data_out_id=?;",
                  [id],
                  (err, dataout) => {
                    if(dataout){
                      var name = dataout[0].firstname+" "+dataout[0].lastname
                      var namedata = "ชื่อประเภท "+dataout[0].classify_name+" ข้อมูลที่แยกประเภท "+dataout[0].pattern_name
                      sendmailfunc(host, data[0].res_link, id,name,dataout[0].datecreate,namedata);
                    }else{
                      res.redirect("/dataoutlist");
                    }
                  });
              }
              //console.log(data[0].res_link);
              res.redirect("/dataoutlist");
            }
          );
        }
      );
    });
  }
};

controller.dataoutaddhash = (req, res) => {
  var host = sethost(req);
  console.log(host);
    const { id } = req.params;
    var data = req.body;
    var date = addDate();
    console.log(date);
    req.getConnection((err, conn) => {
      conn.query(
        "UPDATE TB_TR_PDPA_DATA_OUT SET `hash_md5` = ?, `hash_sha1` = ?, `hash_sha256` = ? WHERE TB_TR_PDPA_DATA_OUT.res_link = ?;",
        [data.hashTextMD5,data.hashTextSHA1,data.hashTextSHA256,id],
        (err, classi) => {
          if(classi){
            conn.query(
              "SELECT * FROM TB_TR_PDPA_DATA_OUT as dataout inner join TB_TR_PDPA_CLASSIFICATION as cla on cla.classify_id=dataout.classify_id where dataout.res_link=?;",
              [id],
              (err, whereid) => {
                if(whereid.length > 0){
                  console.log(data.hashTextMD5,data.hashTextSHA1,data.hashTextSHA256,data.filename,date,whereid[0].data_out_id);
            conn.query(
              "INSERT INTO `TB_TR_PDPA_DATA_OUT_HISTORY_HASH` (`hash_md5`, `hash_sha1`, `hash_sha256`, `file_name`,`date_download`,`data_out_id`) VALUES (?,?,?,?,?,?);",
              [data.hashTextMD5,data.hashTextSHA1,data.hashTextSHA256,data.filename,date,whereid[0].data_out_id],
              (err, inserthis) => {
                funchistory.funchistory(req, "dataout_history", `hash file csv การนำข้อมูลออก id : ${whereid[0].data_out_id}`, whereid[0].acc_id)
                res.send({ status: "success"});
              }
              );
            }else{
              res.send({ status: "error"});
            }
            }
            );
          }else{
            res.send({ status: "error"});
          }
          
        }
      );
    });
  };

controller.viewchart = (req, res) => {
  //data.pop();
  const id = req.session.userid;
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    console.log(id);
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT COUNT(data_out_id) as countdate,DATE_FORMAT(date_create ,'%d/%m/%Y') as datecreate FROM TB_TR_PDPA_DATA_OUT as dataout INNER JOIN TB_TR_PDPA_CLASSIFICATION as cla on cla.classify_id=dataout.classify_id WHERE cla.acc_id=? GROUP BY date_create ORDER by date_create asc;",
        [id],
        (err, data) => {
          conn.query(
            "SELECT COUNT(date_create) as countdate,DATE_FORMAT(date_create ,'%d/%m/%Y') as datecreate FROM `TB_TR_PDPA_DATA_OUT` as dataout INNER JOIN TB_TR_PDPA_CLASSIFICATION as cla on cla.classify_id=dataout.classify_id WHERE dpo_confirm=1 and cla.acc_id=? GROUP BY date_create ORDER by date_create asc;",
            [id],
            (err, datadpo) => {
              conn.query(
                "SELECT COUNT(date_create) as countdate,DATE_FORMAT(date_create ,'%d/%m/%Y') as datecreate FROM `TB_TR_PDPA_DATA_OUT` as dataout INNER JOIN TB_TR_PDPA_CLASSIFICATION as cla on cla.classify_id=dataout.classify_id WHERE dpo_confirm=0 and cla.acc_id=? GROUP BY date_create ORDER by date_create asc;",
                [id],
                (err, datadpocon) => {
                  conn.query(
                    "SELECT COUNT(date_create) as countdate,DATE_FORMAT(date_create ,'%d/%m/%Y') as datecreate FROM `TB_TR_PDPA_DATA_OUT` as dataout INNER JOIN TB_TR_PDPA_CLASSIFICATION as cla on cla.classify_id=dataout.classify_id WHERE type_res=0 and cla.acc_id=? GROUP BY date_create ORDER by date_create asc;",
                    [id],
                    (err, dataemail) => {
                      conn.query(
                        "SELECT COUNT(date_create) as countdate,DATE_FORMAT(date_create ,'%d/%m/%Y') as datecreate FROM `TB_TR_PDPA_DATA_OUT` as dataout INNER JOIN TB_TR_PDPA_CLASSIFICATION as cla on cla.classify_id=dataout.classify_id WHERE type_res=1 and cla.acc_id=? GROUP BY date_create ORDER by date_create asc;",
                        [id],
                        (err, dataapi) => {
                          conn.query(
                            'SELECT DATE_FORMAT(date_create,"%Y-%m") as monthselect FROM TB_TR_PDPA_DATA_OUT as dataout INNER join TB_TR_PDPA_CLASSIFICATION as clas on clas.classify_id=dataout.classify_id WHERE acc_id=176 group by DATE_FORMAT(date_create,"%Y-%m") ORDER BY DATE_FORMAT(date_create,"%Y-%m") desc;',
                            [id],
                            (err, monthselect) => {
                          console.log(data);
                          funchistory.funchistory(req, "dataout", `หน้าดู chart การนำข้อมูลออก `, id)
                          res.render("./data_out/data_out_chart", {
                            session: req.session,
                            data: data,
                            datadpo: datadpo,
                            dataapi: dataapi,
                            dataemail: dataemail,
                            datadpocon: datadpocon,
                            monthselect:monthselect
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
  }
};

module.exports = controller;

async function sendmailfunc2(host, mail, id) {
  // สร้างออปเจ็ค transporter เพื่อกำหนดการเชื่อมต่อ SMTP และใช้ตอนส่งเมล
  let transporter = nodemailer.createTransport({
    service: "gmail",
                          auth: {
                            user: "smartpdpa@gmail.com",
                            pass: "laenkjbuhbzxkikc",
                          },
                          from: "smartpdpa@gmail.com",
  });
  // เริ่มทำการส่งอีเมล
  let info = await transporter.sendMail({
    from: "ALLTRA <peng.mungmontee@gmail.com>", // อีเมลผู้ส่ง
    // to: '601998015@crru.ac.th', // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
    to: mail,
    subject: "ALLTRA YOUR EMAIL LOGIN LINK", // หัวข้ออีเมล
    text: "Hello. This email is for your email verification.", // plain text body
    html: `      <div style="width: 80%;background:  #ffffff;margin-left:10%;" >
    <h3 style="margin-left:2%;line-height: 2;font-size: 18px;">
        ✉ สวัสดีครับ 
    </h3>
        <h5 style="text-align: left;line-height: 1.3;margin-left:10%;margin-right:10%;font-size: 18px;">
       <span style="color:yellow">●&nbsp;</span> 
       เชิญคลิก Link เพื่อดูข้อมูล Log จาก Server A 
        </h5>
        <h5 style="text-align: left;line-height: 1.3;margin-left:10%;margin-right:10%;font-size: 18px;">
          <span style="color:green">➤&nbsp;</span> 
          โดยใช้ e-mail ของท่าน เป็น E-mail Login
              <br>
           </h5>
        <h5 style="color: #4B0082;text-align: center;font-weight: bold;font-size: 18px;">
          <a  href="${host}/loginemail/${id}" target="_blank"> Link : Login</a>
        </h5>
        <hr>
        <h5 style="text-align: left;margin-left:2%;line-height: 2.5;font-size: 18px;">
           <span style="color:red">❤&nbsp;</span>ทีมผู้พัฒนา
        </h5>
        </div>
        `, // html body
  });
  // log ข้อมูลการส่งว่าส่งได้-ไม่ได้
  console.log("Message sent: %s", info.messageId);
}

async function sendmailfunc(host, mail, id ,nameuser,datacreate,namedata) {
  if (process.env.EMAIL_API == "dev") {
  // สร้างออปเจ็ค transporter เพื่อกำหนดการเชื่อมต่อ SMTP และใช้ตอนส่งเมล
  let transporter = nodemailer.createTransport({
    service: "gmail",
                          auth: {
                            user: "smartpdpa@gmail.com",
                            pass: "laenkjbuhbzxkikc",
                          },
                          from: "smartpdpa@gmail.com",
  });
  // เริ่มทำการส่งอีเมล
  let info = await transporter.sendMail({
    from: "ALLTRA <peng.mungmontee@gmail.com>", // อีเมลผู้ส่ง
    // to: '601998015@crru.ac.th', // อีเมลผู้รับ สามารถกำหนดได้มากกว่า 1 อีเมล โดยขั้นด้วย ,(Comma)
    to: mail,
    subject: "ALLTRA YOUR EMAIL LOGIN LINK", // หัวข้ออีเมล
    text: "Hello. This email is for your email verification.", // plain text body
    html: `<body>
    <div class="mt-4 " style="background:  #ffffff;margin-left:15%;margin-right:15%;width: 70%;margin-top:3%;border-radius: 15px;">
    <h2 style="color: orange;">
    ALLTRA</h2>
    <p style="border-bottom: 3px solid;color: orange;"></p>
    <h4 style="margin-left:2%;line-height: 2;">
    ✉ ข้อมูลที่ปรากฏใน Link  เป็นข้อมูลที่สร้างจาก ${nameuser}
    </h4>
    <h4 style="margin-left:2%;line-height: 1.5;">
        ข้อมูลเบื้องต้น /รายละเอียด
        </h4>
        <h5 style="margin-left:3%;line-height: 1.5;">
            วันที่สร้าง ${datacreate}
            </h5>
            <h5 style="margin-left:3%;line-height: 1.5;">
                สร้างโดย ${nameuser}
                </h5>
                    <h5 style="margin-left:3%;line-height: 1.5;">
                        ${namedata}
                        </h5>
    <hr>
    <h4 style="margin-left:2%;line-height: 2;">
        วิธีการใช้งานข้อมูลภายในLink
        </h4>
        <h5 style="margin-left:3%;line-height: 1.5;">
            1.เมื่อคลิก Link จะปรากฏหน้าโปรแกรม Alltra
            </h5>
            <h5 style="margin-left:3%;line-height: 1.5;">
                2.ใส่ e-mail เพื่อเข้าดูข้อมูล
                </h5>
                <h5 style="margin-left:3%;line-height: 1.5;">
                    3.จะปรากฏข้อมูล
                    </h5>
                    <h5 style="margin-left:4%;line-height: 1.5;">
                        3.1 กรณีมี Filter จะปกปิดข้อมูลไว้ ให้เลื่อน Mouse เพื่อแสดงข้อมูลแต่ละบรรทัด
                        </h5>
                        
    <h4 style="margin-left:2%;line-height: 2;">
        <a href="${host}/loginemail/${id}" style="text-align: left;color: orange;"> Link เอกสาร 
        </a>
        </h4>
        <hr>
    <h4 style="text-align: left;">
        *** E-mail ฉบับนี้ถูกสร้างและจัดส่งด้วยระบบ Alltra กรุณาอย่า Reply ข้อมูลกลับ ****
    </h4>
    
    <h4 style="text-align: left;">
        ข้อมูลที่จัดส่งนี้ถูกควบคุมภายใต้ พรบ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ.2562 ภายใต้นโยบายคุ้มครองข้อมูลส่วนบุคคล
    </h4>
        `, // html body
  });
    // log ข้อมูลการส่งว่าส่งได้-ไม่ได้
  console.log("Message sent: %s", info.messageId);
  } else {
    var data = {
      "from": "pipr@dol.go.th",
      "to": `${mail}`,
      "subject": `ALLTRA YOUR EMAIL LOGIN LINK`,
      "body": `<body>
      <div class="mt-4 " style="background:  #ffffff;margin-left:15%;margin-right:15%;width: 70%;margin-top:3%;border-radius: 15px;">
      <h2 style="color: orange;">
      ALLTRA</h2>
      <p style="border-bottom: 3px solid;color: orange;"></p>
      <h4 style="margin-left:2%;line-height: 2;">
      ✉ ข้อมูลที่ปรากฏใน Link  เป็นข้อมูลที่สร้างจาก ${nameuser}
      </h4>
      <h4 style="margin-left:2%;line-height: 1.5;">
          ข้อมูลเบื้องต้น /รายละเอียด
          </h4>
          <h5 style="margin-left:3%;line-height: 1.5;">
              วันที่สร้าง ${datacreate}
              </h5>
              <h5 style="margin-left:3%;line-height: 1.5;">
                  สร้างโดย ${nameuser}
                  </h5>
                      <h5 style="margin-left:3%;line-height: 1.5;">
                          ${namedata}
                          </h5>
      <hr>
      <h4 style="margin-left:2%;line-height: 2;">
          วิธีการใช้งานข้อมูลภายในLink
          </h4>
          <h5 style="margin-left:3%;line-height: 1.5;">
              1.เมื่อคลิก Link จะปรากฏหน้าโปรแกรม Alltra
              </h5>
              <h5 style="margin-left:3%;line-height: 1.5;">
                  2.ใส่ e-mail เพื่อเข้าดูข้อมูล
                  </h5>
                  <h5 style="margin-left:3%;line-height: 1.5;">
                      3.จะปรากฏข้อมูล
                      </h5>
                      <h5 style="margin-left:4%;line-height: 1.5;">
                          3.1 กรณีมี Filter จะปกปิดข้อมูลไว้ ให้เลื่อน Mouse เพื่อแสดงข้อมูลแต่ละบรรทัด
                          </h5>
                          
      <h4 style="margin-left:2%;line-height: 2;">
          <a href="${host}/loginemail/${id}" style="text-align: left;color: orange;"> Link เอกสาร 
          </a>
          </h4>
          <hr>
      <h4 style="text-align: left;">
          *** E-mail ฉบับนี้ถูกสร้างและจัดส่งด้วยระบบ Alltra กรุณาอย่า Reply ข้อมูลกลับ ****
      </h4>
      
      <h4 style="text-align: left;">
          ข้อมูลที่จัดส่งนี้ถูกควบคุมภายใต้ พรบ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ.2562 ภายใต้นโยบายคุ้มครองข้อมูลส่วนบุคคล
      </h4>
          `, 
  }
  let res = await axios.post(`${process.env.EMAIL_API}`, data).then((response) => {
      console.log(response);
  }, (error) => {
      console.log(error);
  });
  console.log("send_mail_file_first", res);
  }

}
function newtext(data, typeid) {
  var newdata = [];
  for (x in data) {
    var ar = [];
    if (x == 0) {
      newdata.push(data[x]);
    } else {
      for (z in data[x]) {
        var text = marktext(data[x][z], typeid);

        ar.push(text);
      }
      newdata.push(ar);
    }
  }
  console.log(newdata);
  return newdata;
}
function marktext(textlabel, type) {
  var text = "";
  var possible = textlabel;
  let count = 0;
  if(possible != undefined){
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
  }else{
    possible = "";
  }

  return text;
}

function imcsv(filepath) {
  var data = fs
    .readFileSync(filepath)
    .toString() // convert Buffer to string
    .split("\n") // split string to lines
    .map((e) => e.trim()) // remove white spaces for each line
    .map((e) => e.split(",").map((e) => e.trim())); // split each line to array
  return data;
}
function makekeygen(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function addDatetime() {
  function addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }
  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];
  let current_datetime = new Date();
  let formatted_date =
    current_datetime.getFullYear() +
    "-" +
    months[current_datetime.getMonth()] +
    "-" +
    current_datetime.getDate();
  let current_time = new Date();
  //let formatted_time = addZero(current_time.getHours()) + ":" + addZero(current_time.getMinutes()) + ":" + addZero(current_time.getSeconds())
  let formatted_time = addZero(current_time.getHours());
  console.log("formatted_time" + formatted_time);
  return formatted_time;
}

function convertarr(data,type){
  var savedata = []
  for(xx in data){
    var save = {}
    for(xxx in data[xx]){
    var mark = marktext(data[xx][xxx],type)
    save[xxx] = mark
  }
  savedata.push(save)
}
return savedata
}
module.exports = controller;
