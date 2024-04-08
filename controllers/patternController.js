// const controller = {}
// const checkDiskSpace = require('check-disk-space').default
// const { validationResult } = require('express-validator');
// const sha256 = require('crypto-js/sha256')
// const Base64 = require('crypto-js/enc-base64')
// const path = require('path')

const controller = {};
const checkDiskSpace = require("check-disk-space").default;
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const Base64 = require("crypto-js/enc-base64");
const sha256 = require("crypto-js/sha256");
const path = require("path");

const funchistory = require("./account_controllers");

// =================== Function other ====================
function checkMatch(str, arr, index) {
  if (str.includes(arr[index])) {
    return true;
  } else {
    if (arr.length == index) {
      return false;
    } else {
      checkMatch(str, arr, index + 1);
    }
  }
}

function objectHaveSameKeys(x, y, i, j) {
  if (x.length == 0 || y.length == 0) {
    return 0;
  } else {
    if (x[i].pattern_id == y[j].pattern_id) {
      return 1;
    } else {
      if (y.length == j) {
        return objectHaveSameKeys(x, y, i + 1, 0);
      } else if (x.length == i) {
        return 0;
      } else {
        return objectHaveSameKeys(x, y, i, j + 1);
      }
    }
  }
}

function date_diff(x) {
  let start_date = x[0];
  let end_date = new Date(start_date);
  end_date.setDate(end_date.getDate() + x[1]);
  let month = end_date.getMonth() + 1;
  let day = end_date.getDate();
  if (String(month).length == 1) {
    month = "0" + String(month);
  }
  if (String(day).length == 1) {
    day = "0" + String(day);
  }
  return end_date.getFullYear() + "-" + month + "-" + day;
}

function convert_date(x) {
  let month = x.getMonth() + 1;
  let day = x.getDate();
  if (String(month).length == 1) {
    month = "0" + String(month);
  }
  if (String(day).length == 1) {
    day = "0" + String(day);
  }
  return x.getFullYear() + "-" + month + "-" + day;
}


function check_user_login(req) {
  let user = req.session.acc_id_control ? req.session.acc_id_control : req.session.userid;
  return user
}

// Index1 Page
controller.indexPattern = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    // const user = req.session.userid;
    var user = req.session.acc_id_control
      ? req.session.acc_id_control
      : req.session.userid;
    // if (req.session.acc_id_control) {
    //     user = req.session.acc_id_control
    // } else {
    //     user = req.session.userid
    // }

    req.getConnection((err, conn) => {
      conn.query(
        'select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join doc_pdpa.pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;',
        [user],
        (err, history) => {
          conn.query("SELECT * FROM TB_MM_PDPA_WORDS ", (err, words) => {
            conn.query("SELECT * FROM TB_TR_PDPA_PATTERN;", (err, pm) => {
              conn.query(
                "SELECT * FROM TB_MM_PDPA_PATTERN_PROCESSING_BASE",
                (err, process) => {
                  conn.query(
                    "SELECT pd.doc_id, pd.doc_type_id, pd.doc_name, pdt.doc_type_name, pd.doc_date_create, pu.firstname, pu.lastname, pd.doc_status, pd.doc_remark, pd.doc_action FROM TB_TR_PDPA_DOCUMENT as pd JOIN TB_MM_PDPA_DOCUMENT_TYPE as pdt ON pd.doc_type_id = pdt.doc_type_id JOIN TB_TR_ACCOUNT as pu ON pd.user_id = pu.acc_id WHERE doc_action is NOT TRUE AND doc_status = 2 ORDER BY doc_id ASC;",
                    (err, policy) => {
                      conn.query(
                        "SELECT * FROM TB_TR_PDPA_DATA as pd JOIN TB_MM_PDPA_DOCUMENT_TYPE as pdt ON pd.data_type_id = pdt.data_type_id JOIN TB_MM_PDPA_LEVEL as pl ON pd.data_level_id = pl.level_id;",
                        (err, data) => {
                          conn.query(
                            "SELECT dpc.pattern_id FROM TB_TR_PDPA_CLASSIFICATION as dpc JOIN TB_TR_PDPA_PATTERN as dpp ON dpc.pattern_id = dpp.pattern_id GROUP BY pattern_id;",
                            (err, used) => {
                              let word = [];
                              let word1 = [];
                              for (i in words) {
                                word.push(words[i].words_id);
                                word1.push(words[i].words_often);
                              }
                              if (err) {
                                res.json(err);
                              }
                              // Check from classify
                              let pattern_use = [];
                              pattern_use.push(
                                objectHaveSameKeys(pm, used, 0, 0)
                              );
                              let pattern_used = pattern_use.reduce(
                                (a, b) => a + b,
                                0
                              );
                              let used_percent =
                                (pattern_used / pm.length) * 100;
                              // Check from date of pattern
                              let filter_pattern = [
                                "pattern_start_date",
                                "pattern_total_date",
                              ];
                              let time_used = pm.map((o) =>
                                filter_pattern.map((k) => o[k])
                              );
                              let convert_time_used = time_used.map((o) =>
                                date_diff(o)
                              );
                              let today = convert_date(new Date());
                              let check_used = convert_time_used.filter(
                                function (e) {
                                  return e != today;
                                }
                              );
                              let time_used_percent = 0;
                              if (check_used.length > 0) {
                                time_used_percent =
                                  (check_used.length / pm.length) * 100;
                              }
                              checkDiskSpace(path.join(__dirname + "./")).then(
                                (diskSpace) => {
                                  funchistory.funchistory(
                                    req,
                                    "pattern",
                                    `เข้าสู่เมนู pattern`,
                                    req.session.userid
                                  );
                                  res.render("./pattern/pattern_index", {
                                    pm: pm,
                                    process: process,
                                    policy: policy,
                                    data: data,
                                    checkDiskSpace: diskSpace,
                                    used: check_used.length,
                                    used_length: time_used_percent,
                                    history: history,
                                    words: words,
                                    words1: word,
                                    words2: word1,
                                    session: req.session,
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
      );
    });
  }
};
// SEND TO AJAX
controller.ajaxIndexPattern = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    funchistory.check_limit(req);
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT * FROM TB_TR_PDPA_PATTERN ORDER BY pattern_id DESC;",
        (err, id_pattern) => {
          conn.query(
            "SELECT * FROM TB_TR_PDPA_PATTERN as pp JOIN TB_MM_PDPA_PATTERN_PROCESSING_BASE as pppb ON pp.pattern_processing_base_id = pppb.pattern_processing_base_id JOIN TB_TR_ACCOUNT as acc ON acc.acc_id = pp.acc_id ORDER BY pattern_id DESC;",
            (err, pattern) => {
              conn.query("SELECT * FROM TB_TR_PDPA_DATA", (err, data) => {
                conn.query(
                  "SELECT * FROM TB_TR_PDPA_DOCUMENT_LOG",
                  (err, document) => {
                    conn.query("SELECT * FROM TB_TR_IMPORT ", (err, ftp) => {
                      conn.query(
                        'SELECT * FROM TB_TR_PDPA_AGENT_MANAGE JOIN TB_TR_PDPA_AGENT_STORE ON TB_TR_PDPA_AGENT_STORE.ags_id = TB_TR_PDPA_AGENT_MANAGE.ags_id where TB_TR_PDPA_AGENT_STORE.code = "AG3" ;',
                        (err, agent) => {
                          count = 0;
                          var tag_name = [];
                          for (i in pattern) {
                            pattern[i].pattern_id = count += 1;
                            tag_name.push(pattern[i].pattern_tag);
                          }
                          var data_name_total = [];
                          for (i in tag_name) {
                            var data_name = [];
                            for (j in data) {
                              var data_tag_split = "";
                              if (data[j].data_tag != null) {
                                if (data[j].data_tag.includes(",")) {
                                  data_tag_split = data[j].data_tag.split(",");
                                } else {
                                  data_tag_split = data[j].data_tag;
                                }
                              }
                              if (typeof data_tag_split == "string") {
                                if (tag_name[i].includes(data[j].data_tag)) {
                                  data_name.push(data[j].data_name);
                                }
                              } else {
                                if (
                                  checkMatch(tag_name[i], data_tag_split, 0) ==
                                  true
                                ) {
                                  data_name.push(data[j].data_name);
                                }
                              }
                            }
                            data_name_total.push(data_name.join(","));
                          }

                          var pattern_data = [];
                          for (let i = 0; i < pattern.length; i++) {
                            var pattern_data_text = [];
                            for (
                              let j = 0;
                              j <
                              pattern[i].doc_id_person_data.split(",").length;
                              j++
                            ) {
                              for (let k = 0; k < data.length; k++) {
                                if (
                                  data[k].data_id ==
                                  pattern[i].doc_id_person_data.split(",")[j]
                                ) {
                                  pattern_data_text.push(data[k].data_name);
                                  // pattern[i].doc_id_person_data.split(',')[j].toString().replace(pattern[i].doc_id_person_data.split(',')[j], data[k].data_name);
                                }
                              }
                            }
                            pattern_data.push(pattern_data_text.toString());
                          }

                          var pattern_storage_method_inside_import_id = [];
                          var _pattern_storage_method_inside_import_id = "";

                          for (let i = 0; i < pattern.length; i++) {
                            if (
                              pattern[i].pattern_storage_method_inside_import ==
                              1
                            ) {
                              if (ftp.length > 0) {
                                for (let j = 0; j < ftp.length; j++) {
                                  // if (pattern[i].pattern_storage_method_inside_import_id != '') {
                                  if (
                                    pattern[
                                      i
                                    ].pattern_storage_method_inside_import_id
                                      .split(",")
                                      .indexOf(ftp[j].ftp_id + "") > -1
                                  ) {
                                    _pattern_storage_method_inside_import_id +=
                                      ftp[j].name + " ";
                                  }
                                  // }
                                }
                              }
                            } else {
                              pattern_storage_method_inside_import_id.push(
                                "ไม่มี"
                              );
                            }
                            pattern_storage_method_inside_import_id.push(
                              _pattern_storage_method_inside_import_id
                            );
                          }

                          var pattern_storage_method_inside_agent_name = [];
                          var _pattern_storage_method_inside_agent_name = "";
                          for (let i = 0; i < pattern.length; i++) {
                            if (
                              pattern[i].pattern_storage_method_inside_agent ==
                              1
                            ) {
                              if (agent.length > 0) {
                                for (let j = 0; j < agent.length; j++) {
                                  // if (pattern[i].pattern_storage_method_inside_agent_name != '') {
                                  if (
                                    pattern[
                                      i
                                    ].pattern_storage_method_inside_agent_name
                                      .split(",")
                                      .indexOf(agent[j].agm_id) > -1
                                  ) {
                                    _pattern_storage_method_inside_agent_name +=
                                      agent[j].agm_name + " ";
                                  }
                                  // }
                                }
                              }
                            } else {
                              pattern_storage_method_inside_agent_name.push(
                                "ไม่มี"
                              );
                            }
                            pattern_storage_method_inside_agent_name.push(
                              _pattern_storage_method_inside_agent_name
                            );
                          }

                          var pattern_storage_method_outside_name = [];
                          for (let i = 0; i < pattern.length; i++) {
                            if (
                              pattern[i].pattern_storage_method_outside == 1
                            ) {
                              pattern_storage_method_outside_name.push(
                                pattern[i].pattern_storage_method_outside_name
                              );
                            } else {
                              pattern_storage_method_outside_name.push("ไม่มี");
                            }
                          }

                          if (err) {
                            console.log(err);
                          } else {
                            res.json({
                              limit: req.session.limit,
                              pattern,
                              id_pattern,
                              data_name_total,
                              pattern_data,
                              document,
                              pattern_storage_method_inside_import_id,
                              pattern_storage_method_inside_agent_name,
                              pattern_storage_method_outside_name,
                            });
                          }
                        }
                      );
                    });
                  }
                );
              });
            }
          );
        }
      );
    });
  }
};
controller.ajaxIndexPolicy = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE doc_action is NOT TRUE AND doc_status = 2 ORDER BY doc_id ASC;",
        (err, id_document) => {
          conn.query(
            "SELECT pd.doc_id, pdg.page_id, pdg.page_number, pdg.page_content, pdg.page_action FROM TB_TR_PDPA_DOCUMENT_PAGE as pdg JOIN TB_TR_PDPA_DOCUMENT as pd ON pdg.doc_id = pd.doc_id WHERE page_action is NOT TRUE ORDER BY doc_id ASC;",
            (err, page) => {
              conn.query(
                "SELECT pd.doc_id, pd.doc_type_id, pd.doc_name, pdt.doc_type_name, pd.doc_date_create, pu.firstname, pu.lastname, pd.doc_status, pd.doc_remark, pd.doc_action FROM TB_TR_PDPA_DOCUMENT as pd JOIN TB_MM_PDPA_DOCUMENT_TYPE as pdt ON pd.doc_type_id = pdt.doc_type_id JOIN TB_TR_ACCOUNT as pu ON pd.user_id = pu.acc_id WHERE doc_action is NOT TRUE AND doc_status = 2 ORDER BY doc_id ASC;",
                (err, policy) => {
                  count = 0;
                  for (i in policy) {
                    policy[i].doc_id = count += 1;
                  }
                  if (err) {
                    res.json(err);
                  } else {
                    res.json({ policy, id_document, page });
                  }
                }
              );
            }
          );
        }
      );
    });
  }
};
controller.ajaxSelectedPolicy = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const get_value = req.body.value;
    const id = req.body.id;
    const hash = Base64.stringify(sha256(get_value));
    if (hash == "MN7qA2QWlA/LDT0ZMNws0IphO8EmdJikPuqjMq3NL2g=") {
      req.getConnection((err, conn) => {
        conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT WHERE doc_id = ? AND doc_action IS NOT TRUE AND doc_status = 2;", [id], (err, policy) => {
          if (err) {
            res.json(err);
          } else {
            res.json(policy);
          }
        }
        );
      });
    } else {
    }
  }
};
controller.ajaxAddPolicy = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const get_value = req.body.id;
    // const regex = /([\u0E00-\u0E7F]+)/gmu;
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT * FROM TB_TR_PDPA_DOCUMENT_PAGE WHERE doc_id = ? AND page_action is NOT TRUE",
        [get_value],
        (err, select_page) => {
          conn.query(
            "SELECT pd.data_id, pd.data_type_id, pd.data_level_id, pd.data_code, pd.data_name, pd.data_detail, pd.data_date_start, pd.data_date_end, pd.data_location_name, pd.data_location_detail, pd.data_tag, pdt.data_type_name, pl.level_name FROM TB_TR_PDPA_DATA as pd JOIN TB_MM_PDPA_DATA_TYPE as pdt ON pd.data_type_id = pdt.data_type_id JOIN TB_MM_PDPA_LEVEL as pl ON pd.data_level_id = pl.level_id;",
            (err, data) => {
              if (err) {
                res.json(err);
              } else {
                var data_code = [];
                for (i in select_page) {
                  if (select_page[i].page_content != null) {
                    let remove_tags = select_page[i].page_content.replace(
                      /(<([^>]+)>)/gi,
                      ""
                    );
                    let get_code = remove_tags.split(" ");
                    for (j in get_code) {
                      if (get_code[j].includes("#") == true) {
                        while (get_code[j].charAt(0) != "#") {
                          get_code[j] = get_code[j].substring(1);
                        }
                        data_code.push(get_code[j]);
                      }
                    }
                  }
                }
                var _data_ = [];
                for (i in data_code) {
                  for (j in data) {
                    if (data_code[i] == data[j].data_code) {
                      _data_.push(data[j]);
                    }
                  }
                }
                res.json({ _data_, get_value });
              }
            }
          );
        }
      );
    });
  }
};
controller.ajaxAddTag = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    req.getConnection((err, conn) => {
      conn.query("SELECT tag_id FROM TB_MM_PDPA_TAG;", (err, id_tag) => {
        conn.query("SELECT * FROM TB_MM_PDPA_TAG;", (err, tag) => {
          if (err) {
            res.json(err);
          } else {
            for (var i = 0; i < tag.length; i++) {
              tag[i].tag_id = i + 1;
            }
            res.json({ tag, id_tag });
          }
        });
      });
    });
  }
};
controller.ajaxAddProcessingBase = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const get_value = req.body;
    req.getConnection((err, conn) => {
      conn.query(
        "INSERT INTO TB_MM_PDPA_PATTERN_PROCESSING_BASE SET ?",
        [get_value],
        (err, pass) => {
          if (err) {
            res.json(err);
          } else {
            res.json("success");
          }
        }
      );
    });
  }
};
controller.ajaxAddUser = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const get_value = req.body.value;
    const hash = Base64.stringify(sha256(get_value));
    if (hash == "1w+jpXjplWAW6mAsD+CCul4u4rSH8+4KhecP8Byp54E=") {
      req.getConnection((err, conn) => {
        conn.query("SELECT acc_id FROM TB_TR_ACCOUNT", (err, id_users) => {
          conn.query("SELECT * FROM TB_TR_ACCOUNT", (err, users) => {
            for (var i = 0; i < users.length; i++) {
              users[i].acc_id = i + 1;
            }
            if (err) {
              res.json(err);
            } else {
              res.json({ id_users, users });
            }
          });
        });
      });
    } else {
    }
  }
};
controller.ajaxSelectedUser = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const get_value = req.body.value;
    const id = req.body.id;
    const hash = Base64.stringify(sha256(get_value));
    if (hash == "dSLgr7/Su48s3lyXfoVCEbFDosB5YTauq22/D348lO4=") {
      req.getConnection((err, conn) => {
        conn.query(
          "SELECT * FROM TB_TR_ACCOUNT WHERE acc_id = ?",
          [id],
          (err, users) => {
            if (err) {
              res.json(err);
            } else {
              res.json(users);
            }
          }
        );
      });
    } else {
    }
  }
};
controller.ajaxSelectAgent = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const getValue = req.body.value;
    const hash = Base64.stringify(sha256(getValue));
    if (hash == "5DlaFsG5wAvZmIUIhTtuhlto9hizDMFxULp8wwkVyMo=") {
      req.getConnection((err, conn) => {
        conn.query(
          "SELECT * FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_MM_PDPA_AGENT_TYPE as pat ON pam.agent_type_id = pat.agent_type_id JOIN TB_MM_PDPA_AGENT_TYPE_NAME as patn ON pat.agent_type_name_id = patn.agent_type_name_id JOIN TB_TR_ACCOUNT as a ON pam.acc_id = a.acc_id JOIN TB_TR_IMPORT as f ON pam.ftp_id = f.ftp_id;",
          (err, agent) => {
            conn.query(
              "SELECT agent_manage_id FROM TB_TR_PDPA_AGENT_MANAGE;",
              (err, id_agent) => {
                for (i in agent) {
                  agent[i].agent_manage_id = parseInt(i) + 1;
                }
                if (err) {
                  res.json(err);
                } else {
                  res.json({ agent, id_agent });
                }
              }
            );
          }
        );
      });
    } else {
    }
  }
};
controller.ajaxGetAgent = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const id = req.body.id;
    const getValue = req.body.value;
    const hash = Base64.stringify(sha256(getValue));
    if (hash == "tZVPi2vUaeJm7CT8nhjbH2u2hMm4pG6vvOvYurw/ycI=") {
      req.getConnection((err, conn) => {
        conn.query(
          "SELECT * FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_MM_PDPA_AGENT_TYPE as pat ON pam.agent_type_id = pat.agent_type_id JOIN TB_MM_PDPA_AGENT_TYPE_NAME as patn ON pat.agent_type_name_id = patn.agent_type_name_id JOIN TB_TR_ACCOUNT as a ON pam.acc_id = a.acc_id JOIN TB_TR_IMPORT as f ON pam.ftp_id = f.ftp_id WHERE agent_manage_id = ?;",
          [id],
          (err, agent) => {
            if (err) {
              res.json(err);
            } else {
              res.json(agent);
            }
          }
        );
      });
    } else {
    }
  }
};
controller.ajaxDeletePattern = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const id = req.body.id;
    const get_value = req.body.value;
    const hash = Base64.stringify(sha256(get_value));
    if (hash == "lsxuSSUAUS4IHurp/AxUc8IpYbv40qhdJZx/AvVL0DM=") {
      req.getConnection((err, conn) => {
        conn.query(
          "SELECT * FROM TB_TR_PDPA_PATTERN as pp JOIN TB_TR_PDPA_DOCUMENT as pd ON pp.doc_id = pd.doc_id JOIN TB_TR_ACCOUNT as pu ON pp.acc_id = pu.acc_id JOIN TB_MM_PDPA_PATTERN_PROCESSING_BASE as pppb ON pp.pattern_processing_base_id = pppb.pattern_processing_base_id WHERE pp.pattern_id = ?;",
          [id],
          (err, pattern) => {
            conn.query("SELECT * FROM TB_TR_PDPA_DATA", (err, data) => {
              conn.query(
                "SELECT * FROM TB_TR_PDPA_DOCUMENT_LOG",
                (err, document) => {
                  conn.query("SELECT * FROM TB_TR_IMPORT ", (err, ftp) => {
                    conn.query(
                      'SELECT * FROM TB_TR_PDPA_AGENT_MANAGE JOIN TB_TR_PDPA_AGENT_STORE ON TB_TR_PDPA_AGENT_STORE.ags_id = TB_TR_PDPA_AGENT_MANAGE.ags_id where TB_TR_PDPA_AGENT_STORE.code = "AG3" ;',
                      (err, agent) => {
                        count = 0;
                        var tag_name = [];
                        for (i in pattern) {
                          pattern[i].pattern_id = count += 1;
                          tag_name.push(pattern[i].pattern_tag);
                        }
                        var data_name_total = [];
                        for (i in tag_name) {
                          var data_name = [];
                          for (j in data) {
                            var data_tag_split = "";
                            if (data[j].data_tag != null) {
                              if (data[j].data_tag.includes(",")) {
                                data_tag_split = data[j].data_tag.split(",");
                              } else {
                                data_tag_split = data[j].data_tag;
                              }
                            }
                            if (typeof data_tag_split == "string") {
                              if (tag_name[i].includes(data[j].data_tag)) {
                                data_name.push(data[j].data_name);
                              }
                            } else {
                              if (
                                checkMatch(tag_name[i], data_tag_split, 0) ==
                                true
                              ) {
                                data_name.push(data[j].data_name);
                              }
                            }
                          }
                          data_name_total.push(data_name.join(","));
                        }

                        var pattern_data = [];
                        for (let i = 0; i < pattern.length; i++) {
                          var pattern_data_text = [];
                          for (
                            let j = 0;
                            j < pattern[i].doc_id_person_data.split(",").length;
                            j++
                          ) {
                            for (let k = 0; k < data.length; k++) {
                              if (
                                data[k].data_id ==
                                pattern[i].doc_id_person_data.split(",")[j]
                              ) {
                                pattern_data_text.push(data[k].data_name);
                                // pattern[i].doc_id_person_data.split(',')[j].toString().replace(pattern[i].doc_id_person_data.split(',')[j], data[k].data_name);
                              }
                            }
                          }
                          pattern_data.push(pattern_data_text.toString());
                        }

                        var pattern_storage_method_inside_import_id = [];
                        var _pattern_storage_method_inside_import_id = "";

                        for (let i = 0; i < pattern.length; i++) {
                          if (
                            pattern[i].pattern_storage_method_inside_import == 1
                          ) {
                            if (ftp.length > 0) {
                              for (let j = 0; j < ftp.length; j++) {
                                // if (pattern[i].pattern_storage_method_inside_import_id != '') {
                                if (
                                  pattern[
                                    i
                                  ].pattern_storage_method_inside_import_id
                                    .split(",")
                                    .indexOf(ftp[j].ftp_id + "") > -1
                                ) {
                                  _pattern_storage_method_inside_import_id +=
                                    ftp[j].name + " ";
                                }
                                // }
                              }
                            }
                          } else {
                            pattern_storage_method_inside_import_id.push(
                              "ไม่มี"
                            );
                          }
                          pattern_storage_method_inside_import_id.push(
                            _pattern_storage_method_inside_import_id
                          );
                        }

                        var pattern_storage_method_inside_agent_name = [];
                        var _pattern_storage_method_inside_agent_name = "";
                        for (let i = 0; i < pattern.length; i++) {
                          if (
                            pattern[i].pattern_storage_method_inside_agent == 1
                          ) {
                            if (agent.length > 0) {
                              for (let j = 0; j < agent.length; j++) {
                                // if (pattern[i].pattern_storage_method_inside_agent_name != '') {
                                if (
                                  pattern[
                                    i
                                  ].pattern_storage_method_inside_agent_name
                                    .split(",")
                                    .indexOf(agent[j].agm_id) > -1
                                ) {
                                  _pattern_storage_method_inside_agent_name +=
                                    agent[j].agm_name + " ";
                                }
                                // }
                              }
                            }
                          } else {
                            pattern_storage_method_inside_agent_name.push(
                              "ไม่มี"
                            );
                          }
                          pattern_storage_method_inside_agent_name.push(
                            _pattern_storage_method_inside_agent_name
                          );
                        }

                        var pattern_storage_method_outside_name = [];
                        for (let i = 0; i < pattern.length; i++) {
                          if (pattern[i].pattern_storage_method_outside == 1) {
                            pattern_storage_method_outside_name.push(
                              pattern[i].pattern_storage_method_outside_name,
                              pattern_storage_method_inside_agent_name
                            );
                          } else {
                            pattern_storage_method_outside_name.push("ไม่มี");
                          }
                        }

                        if (err) {
                          res.json(err);
                        } else {
                          res.json({
                            pattern,
                            data_name_total,
                            pattern_data,
                            pattern_storage_method_inside_import_id,
                            pattern_storage_method_inside_agent_name,
                            pattern_storage_method_outside_name,
                          });
                        }
                      }
                    );
                  });
                }
              );
            });
          }
        );
      });
    } else {
    }
  }
};
controller.ajaxSelectCheckPattern = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const id = req.body.id;
    const value = req.body.value;
    const hash = Base64.stringify(sha256(value));
    if (hash == "srdWhpUZtn5FNxQulEkfnrSggSmIE217/NPdRTNtlBg=") {
      req.getConnection((err, conn) => {
        conn.query(
          "SELECT * FROM TB_TR_PDPA_PATTERN as dpp JOIN TB_TR_PDPA_DOCUMENT as dpd ON dpp.doc_id = dpd.doc_id JOIN TB_TR_ACCOUNT as a ON dpp.acc_id = a.acc_id JOIN TB_MM_PDPA_PATTERN_PROCESSING_BASE as dpb ON dpp.pattern_processing_base_id = dpb.pattern_processing_base_id WHERE pattern_id = ?;",
          [id],
          (err, result) => {
            if (err) {
              res.json(err);
            } else {
              res.json(result);
            }
          }
        );
      });
    }
  }
};
// Page add pattern
// controller.newPattern = (req, res) => {
//     if (typeof req.session.userid == 'undefined') {
//         res.redirect('/')
//     } else {
//         const user = req.session.userid;
//         req.getConnection((err, conn) => {
//             conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history  from doc_pdpa_document as d  join doc_pdpa.pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                 conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                     conn.query('SELECT * FROM doc_pdpa_pattern_processing_base;', (err, process) => {
//                         if (err) { res.json(err) } else {
//                             let word = []
//                             let word1 = []
//                             for (i in words) {
//                                 word.push(words[i].words_id)
//                                 word1.push(words[i].words_often)
//                             }
//                             res.render('./pattern/pattern_new', {
//                                 process: process,
//                                 session: req.session,
//                                 history: history,
//                                 words: words,
//                                 words1: word,
//                                 words2: word1,
//                             })
//                         }
//                     })
//                 })
//             })
//         })
//     }
// }
controller.newPattern = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const user = req.session.userid;
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT TB_TR_PDPA_DOCUMENT .*,TB_MM_PDPA_DOCUMENT_TYPE.doc_type_name as doc_type_name ,count(TB_TR_PDPA_DOCUMENT_PAGE.doc_id) as page FROM TB_TR_PDPA_DOCUMENT join TB_MM_PDPA_DOCUMENT_TYPE on TB_MM_PDPA_DOCUMENT_TYPE.doc_type_id = TB_TR_PDPA_DOCUMENT.doc_type_id join TB_TR_PDPA_DOCUMENT_PAGE on TB_TR_PDPA_DOCUMENT_PAGE.doc_id = TB_TR_PDPA_DOCUMENT.doc_id WHERE  TB_TR_PDPA_DOCUMENT.doc_status = 2 AND doc_action IS NOT TRUE group by  TB_TR_PDPA_DOCUMENT_PAGE.doc_id ;",
        (err, doc_pdpa_document) => {
          conn.query("SELECT * FROM TB_TR_IMPORT ", (err, ftp) => {
            conn.query(
              'SELECT * FROM TB_TR_PDPA_AGENT_MANAGE JOIN TB_TR_PDPA_AGENT_STORE ON TB_TR_PDPA_AGENT_STORE.ags_id = TB_TR_PDPA_AGENT_MANAGE.ags_id where TB_TR_PDPA_AGENT_STORE.code = "AG3" ;',
              (err, doc_pdpa_agent_manage) => {
                conn.query("SELECT * FROM TB_TR_ACCOUNT ", (err, account) => {
                  conn.query(
                    "SELECT * FROM TB_MM_PDPA_PATTERN_PROCESSING_BASE;",
                    (err, process) => {
                      if (err) {
                        res.json(err);
                      } else {
                        res.render("./pattern/pattern_new", {
                          process: process,
                          session: req.session,
                          account: account,
                          ftp: ftp,
                          doc_pdpa_agent_manage: doc_pdpa_agent_manage,
                          doc_pdpa_document: doc_pdpa_document,
                        });
                      }
                    }
                  );
                });
              }
            );
          });
        }
      );
    });
  }
};
// Page Edit pattern
controller.editPattern = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const user = req.session.userid;
    const { id } = req.params;
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT TB_TR_PDPA_PATTERN.*,DATE_FORMAT(TB_TR_PDPA_PATTERN.pattern_start_date,'%Y-%m-%d') as start_date FROM TB_TR_PDPA_PATTERN where pattern_id = ? ;",
        [id],
        (err, pattern) => {
          conn.query(
            "SELECT TB_TR_PDPA_DOCUMENT .*,TB_MM_PDPA_DOCUMENT_TYPE.doc_type_name as doc_type_name ,count(TB_TR_PDPA_DOCUMENT_PAGE.doc_id) as page FROM TB_TR_PDPA_DOCUMENT join TB_MM_PDPA_DOCUMENT_TYPE on TB_MM_PDPA_DOCUMENT_TYPE.doc_type_id = TB_TR_PDPA_DOCUMENT.doc_type_id join TB_TR_PDPA_DOCUMENT_PAGE on TB_TR_PDPA_DOCUMENT_PAGE.doc_id = TB_TR_PDPA_DOCUMENT.doc_id WHERE  TB_TR_PDPA_DOCUMENT.doc_status = 2 AND doc_action IS NOT TRUE group by  TB_TR_PDPA_DOCUMENT_PAGE.doc_id ;",
            (err, doc_pdpa_document) => {
              conn.query(
                "SELECT TB_TR_PDPA_DATA.* ,DATE_FORMAT(TB_TR_PDPA_DATA.data_date_start,'%d/%m/%Y') as day_start,DATE_FORMAT(TB_TR_PDPA_DATA.data_date_end,'%d/%m/%Y') as day_end, TB_MM_PDPA_LEVEL.level_name as level_name ,TB_MM_PDPA_DOCUMENT_TYPE.doc_type_name as data_type_name FROM TB_TR_PDPA_DATA left join TB_MM_PDPA_LEVEL on TB_TR_PDPA_DATA.data_level_id = TB_MM_PDPA_LEVEL.level_id left join TB_MM_PDPA_DOCUMENT_TYPE on TB_TR_PDPA_DATA.data_type_id = TB_MM_PDPA_DOCUMENT_TYPE.doc_type_id ;",
                (err, doc_pdpa_data) => {
                  conn.query("SELECT * FROM TB_TR_IMPORT ", (err, ftp) => {
                    conn.query(
                      "SELECT * FROM TB_TR_PDPA_AGENT_MANAGE where agent_type_id =3",
                      (err, doc_pdpa_agent_manage) => {
                        conn.query(
                          "SELECT * FROM TB_TR_ACCOUNT ",
                          (err, account) => {
                            conn.query(
                              "SELECT * FROM TB_MM_PDPA_PATTERN_PROCESSING_BASE;",
                              (err, process) => {
                                if (err) {
                                  res.json(err);
                                } else {
                                  var doc_id = [];
                                  for (
                                    let i = 0;
                                    i < pattern[0].doc_id.split(",").length;
                                    i++
                                  ) {
                                    if (doc_pdpa_document.length > 0) {
                                      for (
                                        let j = 0;
                                        j < doc_pdpa_document.length;
                                        j++
                                      ) {
                                        if (
                                          pattern[0].doc_id.split(",")[i] ==
                                          doc_pdpa_document[j].doc_id
                                        ) {
                                          doc_id.push(doc_pdpa_document[j]);
                                        }
                                      }
                                    }
                                  }

                                  var data_id = [];
                                  for (
                                    let i = 0;
                                    i <
                                    pattern[0].doc_id_person_data.split(",")
                                      .length;
                                    i++
                                  ) {
                                    if (doc_pdpa_data.length > 0) {
                                      for (
                                        let j = 0;
                                        j < doc_pdpa_data.length;
                                        j++
                                      ) {
                                        if (
                                          pattern[0].doc_id_person_data.split(
                                            ","
                                          )[i] == doc_pdpa_data[j].data_id
                                        ) {
                                          data_id.push(doc_pdpa_data[j]);
                                        }
                                      }
                                    }
                                  }

                                  var text_query_page =
                                    "SELECT TB_TR_PDPA_DOCUMENT.doc_id as doc_id,TB_TR_PDPA_DOCUMENT_PAGE.page_content as page_content FROM TB_TR_PDPA_DOCUMENT join TB_TR_PDPA_DOCUMENT_PAGE on TB_TR_PDPA_DOCUMENT.doc_id = TB_TR_PDPA_DOCUMENT_PAGE.doc_id WHERE TB_TR_PDPA_DOCUMENT.doc_status = 2 AND TB_TR_PDPA_DOCUMENT.doc_action IS NOT TRUE AND ";
                                  var data_in2 = pattern[0].doc_id.split(",");
                                  if (data_in2.length > 0) {
                                    text_query_page +=
                                      " (TB_TR_PDPA_DOCUMENT.doc_id = " +
                                      data_in2[0] +
                                      " ";
                                    if (data_in2.length > 1) {
                                      for (
                                        let i = 1;
                                        i < data_in2.length;
                                        i++
                                      ) {
                                        text_query_page +=
                                          " OR TB_TR_PDPA_DOCUMENT.doc_id = " +
                                          data_in2[i] +
                                          " ";
                                      }
                                    }
                                    text_query_page += " ); ";
                                  }
                                  conn.query(
                                    text_query_page,
                                    (err, doc_pdpa_document_page) => {
                                      var data_out = [
                                        {
                                          data: [],
                                          data_name: [],
                                          data_tag: [],
                                        },
                                      ];
                                      for (
                                        let i = 0;
                                        i < doc_pdpa_data.length;
                                        i++
                                      ) {
                                        var have_data = 0;
                                        for (
                                          let j = 0;
                                          j < doc_pdpa_document_page.length;
                                          j++
                                        ) {
                                          if (
                                            doc_pdpa_document_page[j]
                                              .page_content
                                          ) {
                                            if (
                                              doc_pdpa_document_page[
                                                j
                                              ].page_content.search(
                                                doc_pdpa_data[i].data_code + ""
                                              ) > -1
                                            ) {
                                              have_data++;
                                            }
                                          }
                                        }
                                        if (have_data > 0) {
                                          data_out[0].data.push({
                                            data_id: doc_pdpa_data[i].data_id,
                                            data_code:
                                              doc_pdpa_data[i].data_code,
                                            data_name:
                                              doc_pdpa_data[i].data_name,
                                            day_start:
                                              doc_pdpa_data[i].day_start,
                                            day_end: doc_pdpa_data[i].day_end,
                                            level_name:
                                              doc_pdpa_data[i].level_name,
                                            data_type_name:
                                              doc_pdpa_data[i].data_type_name,
                                          });
                                          data_out[0].data_name.push(
                                            doc_pdpa_data[i].data_name
                                          );
                                          data_out[0].data_tag.push(
                                            doc_pdpa_data[i].data_tag
                                          );
                                          have_data = 0;
                                        }
                                      }

                                      res.render("./pattern/pattern_edit", {
                                        pattern: pattern[0],
                                        process: process,
                                        doc_id: doc_id,
                                        data_id: data_id,
                                        data_out: data_out,
                                        session: req.session,
                                        account: account,
                                        ftp: ftp,
                                        doc_pdpa_agent_manage:
                                          doc_pdpa_agent_manage,
                                        doc_pdpa_document: doc_pdpa_document,
                                      });
                                    }
                                  );
                                }
                              }
                            );
                          }
                        );
                      }
                    );
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

// // Index Add
// controller.addPattern = (req, res) => {
//     if (typeof req.session.userid == "undefined") {
//         res.redirect('/')
//     } else {
//         const user = req.session.userid;
//         const _pattern_type_data_file_ = req.body.pattern_type_data_file;
//         var pattern_type_data_file = -1
//         const _pattern_type_data_database_ = req.body.pattern_type_data_database;
//         var pattern_type_data_database = -1
//         const _pattern_storage_method_inside_ = req.body.pattern_storage_method_inside;
//         var pattern_storage_method_inside = -1
//         const _pattern_storage_method_outside_ = req.body.pattern_storage_method_outside;
//         var pattern_storage_method_outside = -1
//         const _pattern_storage_method_outside_device_ = req.body.pattern_storage_method_outside_device;
//         var pattern_storage_method_outside_device = -1
//         const _pattern_storage_method_outside_agent_ = req.body.pattern_storage_method_outside_agent;
//         var pattern_storage_method_outside_agent = -1
//         const _pattern_storage_method_outside_database_outside_ = req.body.pattern_storage_method_outside_database_outside;
//         var pattern_storage_method_outside_database_outside = -1
//         const _pattern_processor_inside_ = req.body.pattern_processor_inside;
//         var pattern_processor_inside = -1
//         const _pattern_processor_outside_ = req.body.pattern_processor_outside;
//         var pattern_processor_outside = -1
//         const _pattern_set_end_date_ = req.body.pattern_set_end_date;
//         var pattern_set_end_date = -1
//         const _pattern_dpo_approve_process_ = req.body.pattern_dpo_approve_process
//         var pattern_dpo_approve_process = -1
//         const _pattern_dpo_approve_raw_file_out_ = req.body.pattern_dpo_approve_raw_file_out
//         var pattern_dpo_approve_raw_file_out = -1
//         const _pattern_type_data_file_of_path_ = req.body.pattern_type_data_file_of_path
//         var pattern_type_data_file_of_path = -1
//         if (typeof _pattern_type_data_file_ == 'undefined') {
//             pattern_type_data_file = 0
//         } else {
//             pattern_type_data_file = 1
//         }
//         if (typeof _pattern_type_data_database_ == 'undefined') {
//             pattern_type_data_database = 0
//         } else {
//             pattern_type_data_database = 1
//         }
//         if (typeof _pattern_storage_method_inside_ == 'undefined') {
//             pattern_storage_method_inside = 0
//         } else {
//             pattern_storage_method_inside = 1
//         }
//         if (typeof _pattern_storage_method_outside_ == 'undefined') {
//             pattern_storage_method_outside = 0
//         } else {
//             pattern_storage_method_outside = 1
//         }
//         if (typeof _pattern_storage_method_outside_device_ == "undefined") {
//             pattern_storage_method_outside_device = 0
//         } else {
//             pattern_storage_method_outside_device = 1
//         }
//         if (typeof _pattern_storage_method_outside_agent_ == 'undefined') {
//             pattern_storage_method_outside_agent = 0
//         } else {
//             pattern_storage_method_outside_agent = 1
//         }
//         if (typeof _pattern_storage_method_outside_database_outside_ == "undefined") {
//             pattern_storage_method_outside_database_outside = 0
//         } else {
//             pattern_storage_method_outside_database_outside = 1
//         }
//         if (typeof _pattern_processor_inside_ == 'undefined') {
//             pattern_processor_inside = 0
//         } else {
//             pattern_processor_inside = 1
//         }
//         if (typeof _pattern_processor_outside_ == 'undefined') {
//             pattern_processor_outside = 0
//         } else {
//             pattern_processor_outside = 1
//         }
//         if (typeof _pattern_set_end_date_ == 'undefined') {
//             pattern_set_end_date = 0
//         } else {
//             pattern_set_end_date = 1
//         }
//         if (typeof _pattern_dpo_approve_process_ == 'undefined') {
//             pattern_dpo_approve_process = 0
//         } else {
//             pattern_dpo_approve_process = 1
//         }
//         if (typeof _pattern_dpo_approve_raw_file_out_ == 'undefined') {
//             pattern_dpo_approve_raw_file_out = 0
//         } else {
//             pattern_dpo_approve_raw_file_out = 1
//         }
//         if (typeof _pattern_type_data_file_of_path_ == 'undefined') {
//             pattern_type_data_file_of_path = 0
//         } else {
//             pattern_type_data_file_of_path = req.body.pattern_type_data_file_of_path
//         }
//         const body = {
//             "pattern_name": req.body.pattern_name,
//             'doc_id': req.body.doc_id,
//             "doc_id_person_data": (req.body.doc_id_person_data).toString(),
//             "pattern_tag": req.body.pattern_tag,
//             "pattern_label": req.body.pattern_label,
//             "pattern_start_date": req.body.pattern_start_date,
//             "pattern_total_date": req.body.pattern_total_date,
//             "acc_id": user,
//             "pattern_type_data_file": pattern_type_data_file,
//             "pattern_type_data_file_of_path": pattern_type_data_file_of_path,
//             "pattern_type_data_file_path": req.body.pattern_type_data_file_path,
//             "pattern_type_data_database": pattern_type_data_database,
//             "pattern_type_data_database_name": req.body.pattern_type_data_database_name,
//             "pattern_storage_method_inside": pattern_storage_method_inside,
//             "pattern_storage_method_outside": pattern_storage_method_outside,
//             "pattern_storage_method_outside_name": req.body.pattern_storage_method_outside_name,
//             "pattern_storage_method_outside_device": pattern_storage_method_outside_device,
//             "pattern_storage_method_outside_device_name": req.body.pattern_storage_method_outside_device_name,
//             "pattern_storage_method_outside_agent": pattern_storage_method_outside_agent,
//             "pattern_storage_method_outside_agent_name": req.body.pattern_storage_method_outside_agent_name,
//             "pattern_storage_method_outside_database_outside": pattern_storage_method_outside_database_outside,
//             "pattern_storage_method_outside_database_outside_name": req.body.pattern_storage_method_outside_database_outside_name,
//             "pattern_processing_base_id": req.body.pattern_processing_base_id,
//             "pattern_processor_inside": pattern_processor_inside,
//             "pattern_processor_inside_total": req.body.pattern_processor_inside_total,
//             "pattern_processor_inside_id": req.body.pattern_processor_inside_id,
//             "pattern_processor_outside": pattern_processor_outside,
//             "pattern_processor_outside_total": req.body.pattern_processor_outside_total,
//             "pattern_processor_outside_id": req.body.pattern_processor_outside_id,
//             "pattern_set_end_date": pattern_set_end_date,
//             "pattern_set_end_date_total": req.body.pattern_set_end_date_total,
//             "pattern_dpo_approve_process": pattern_dpo_approve_process,
//             "pattern_dpo_approve_raw_file_out": pattern_dpo_approve_raw_file_out
//         }
//         req.getConnection((err, conn) => {
//             if (body.doc_id != "") {
//                 conn.query('INSERT INTO doc_pdpa_pattern SET ?;', [body], (err, pass) => {
//                     if (err) { res.json(err) } else {
//                         res.redirect('/pattern')
//                     }
//                 })
//             } else {
//                 res.redirect("/pattern")
//             }
//         })
//     }
// }


function insertSpecificOnpattern(data, id, req) { // กรณีที่ไม่มีการเเก้ไขมาตราการหรือว่าเเก้ไขเเล้วเเต่มีบางมาตราการที่ไม่ได้เเก้ไข
  let user = req.session.acc_id_control ? req.session.acc_id_control : req.session.userid;
  data.forEach(element => {
    req.getConnection((err, conn) => {
      conn.query("SELECT *,specifi.specific_id as id_specific,DATE_FORMAT(measures.measures_date,'%Y-%m-%d')  date  FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures  ON specifi.measures_id=measures.measures_id  LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc  ON specifi.event_process_id=prosecc.event_process_id  WHERE measures.specify_id=3  AND measures.acc_id=? AND specifi.specific_id=?  ORDER BY specifi.specific_id DESC",
        [user, element], (err, specific) => {
          conn.query('INSERT INTO TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN SET event_process_id=?,pattern_id=?,specific_id=?,pattern_specific_doc_id=?,pattern_measures_section_name=?,pattern_measures_detail=?,pattern_measures_supervisor=?,pattern_measures_date=?,pattern_measures_date_count=?,pattern_specific_access_control=?,pattern_specific_user_access_management=?,pattern_specific_user_responsibilitites =?,pattern_specific_audit_trails=?,pattern_specific_privacy_security_awareness=?,pattern_specific_where_incident_occurs=?,pattern_specific_access_control_explain=?,pattern_specific_user_access_management_explain=?,pattern_specific_user_responsibilitites_explain=?,pattern_specific_audit_trails_explain=?,pattern_specific_privacy_security_awareness_explain=?,pattern_specific_where_incident_occurs_explain=?',
            [specific[0].event_process_id, id, specific[0].id_specific,
            specific[0].doc_id,
            specific[0].measures_section_name,
            specific[0].measures_detail,
            specific[0].measures_supervisor.toString(),
            specific[0].date,
            specific[0].measures_date_count,
            specific[0].specific_access_control,
            specific[0].specific_user_access_management,
            specific[0].specific_user_responsibilitites,
            specific[0].specific_audit_trails,
            specific[0].specific_privacy_security_awareness,
            specific[0].specific_where_incident_occurs,
            specific[0].specific_access_control_explain,
            specific[0].specific_user_access_management_explain,
            specific[0].specific_user_responsibilitites_explain,
            specific[0].specific_audit_trails_explain,
            specific[0].specific_privacy_security_awareness_explain,
            specific[0].specific_where_incident_occurs_explain],
            (err, insert_specific_on_pattern_unique_unique) => {
              if (err) console.log(err);
            });
        });
    });
  });
}

controller.addPattern = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    let user = req.session.acc_id_control ? req.session.acc_id_control : req.session.userid;
    const data_in = req.body;
    var text_query_insert = ` INSERT INTO TB_TR_PDPA_PATTERN SET `;
    text_query_insert += `  pattern_name = '` + data_in.pattern_name + `'`;
    text_query_insert += ` , doc_id = '` + data_in.doc_id + `'`;
    if (Array.isArray(data_in.doc_id_person_data)) {
      text_query_insert += ` , doc_id_person_data = '` + data_in.doc_id_person_data.toString() + `'`;
    } else if (data_in.doc_id_person_data) {
      text_query_insert += ` , doc_id_person_data = '` + data_in.doc_id_person_data + `'`;
    } else {
      text_query_insert += ` , doc_id_person_data = ''`;
    }
    if (Array.isArray(data_in.pattern_tag)) {
      text_query_insert += ` , pattern_tag = '` + data_in.pattern_tag.toString() + `'`;
    } else if (data_in.pattern_tag) {
      text_query_insert += ` , pattern_tag = '` + data_in.pattern_tag + `'`;
    } else {
      text_query_insert += ` , pattern_tag = ''`;
    }
    text_query_insert += ` , pattern_label = '` + data_in.pattern_label + `'`;
    text_query_insert += ` , pattern_start_date = '` + data_in.pattern_start_date + `'`;
    text_query_insert += ` , pattern_total_date = '` + data_in.pattern_total_date + `'`;
    text_query_insert += ` , acc_id = '` + user + `'`;
    if (data_in.pattern_type_data_file == 1) {
      text_query_insert += ` , pattern_type_data_file = '` + data_in.pattern_type_data_file + `'`;
      text_query_insert += ` , pattern_type_data_file_of_path = '` + data_in.pattern_type_data_file_of_path + `'`;
      text_query_insert += ` , pattern_type_data_file_path = '` + data_in.pattern_type_data_file_path + `'`;
    } else {
      text_query_insert += ` , pattern_type_data_file = '0'`;
    }
    if (data_in.pattern_type_data_database == 1) {
      text_query_insert += ` , pattern_type_data_database = '` + data_in.pattern_type_data_database + `'`;
      text_query_insert += ` , pattern_type_data_database_name = '` + data_in.pattern_type_data_database_name + `'`;
    } else {
      text_query_insert += ` , pattern_type_data_database = '0'`;
      text_query_insert += ` , pattern_type_data_database_name = ''`;
    }
    if (data_in.pattern_storage_method_inside == 1) {
      text_query_insert += ` , pattern_storage_method_inside = '` + data_in.pattern_storage_method_inside + `'`;
      if (data_in.pattern_storage_method_inside_import == 1) {
        text_query_insert += ` , pattern_storage_method_inside_import = '1'`;
        text_query_insert += ` , pattern_storage_method_inside_import_id = '` + data_in.pattern_storage_method_inside_import_id + `'`;
      } else {
        text_query_insert += ` , pattern_storage_method_inside_import = '0'`;
        text_query_insert += ` , pattern_storage_method_inside_import_id = ''`;
      }
      if (data_in.pattern_storage_method_inside_agent == 1) {
        text_query_insert += ` , pattern_storage_method_inside_agent = '1'`;
        text_query_insert += ` , pattern_storage_method_inside_agent_name = '` + data_in.pattern_storage_method_inside_agent_name + `'`;
      } else {
        text_query_insert += ` , pattern_storage_method_inside_agent = '0'`;
        text_query_insert += ` , pattern_storage_method_inside_agent_name = ''`;
      }
      if (data_in.pattern_storage_method_inside_database_outside == 1) {
        text_query_insert += ` , pattern_storage_method_inside_database_outside = '1'`;
        text_query_insert += ` , pattern_storage_method_inside_database_outside_name = '` + data_in.pattern_storage_method_inside_database_outside_name + `'`;
      } else {
        text_query_insert += ` , pattern_storage_method_inside_database_outside = '0'`;
        text_query_insert += ` , pattern_storage_method_inside_database_outside_name = ''`;
      }
    } else {
      text_query_insert += ` , pattern_storage_method_inside = '0'`;
      text_query_insert += ` , pattern_storage_method_inside_import = '0'`;
      text_query_insert += ` , pattern_storage_method_inside_import_id = ''`;
      text_query_insert += ` , pattern_storage_method_inside_agent = '0'`;
      text_query_insert += ` , pattern_storage_method_inside_agent_name = ''`;
      text_query_insert += ` , pattern_storage_method_inside_database_outside = '0'`;
      text_query_insert += ` , pattern_storage_method_inside_database_outside_name = ''`;
    }
    if (data_in.pattern_storage_method_outside == 1) {
      text_query_insert += ` , pattern_storage_method_outside = '` + data_in.pattern_storage_method_outside + `'`;
      text_query_insert += ` , pattern_storage_method_outside_name = '` + data_in.pattern_storage_method_outside_name + `'`;
    } else {
      text_query_insert += ` , pattern_storage_method_outside = '0'`;
      text_query_insert += ` , pattern_storage_method_outside_name = ''`;
    }
    text_query_insert += ` , pattern_processing_base_id = '` + data_in.pattern_processing_base_id + `'`;
    if (data_in.pattern_processor_inside == 1) {
      text_query_insert += ` , pattern_processor_inside = '` + data_in.pattern_processor_inside + `'`;
      text_query_insert += ` , pattern_processor_inside_total = '` + data_in.pattern_processor_inside_total + `'`;
      text_query_insert += ` , pattern_processor_inside_id = '` + data_in.pattern_processor_inside_id + `'`;
    } else {
      text_query_insert += ` , pattern_processor_inside = '0'`;
      text_query_insert += ` , pattern_processor_inside_total = '0'`;
      text_query_insert += ` , pattern_processor_inside_id = ''`;
    }
    if (data_in.pattern_processor_outside == 1) {
      text_query_insert += ` , pattern_processor_outside = '` + data_in.pattern_processor_outside + `'`;
      text_query_insert += ` , pattern_processor_outside_total = '` + data_in.pattern_processor_outside_total + `'`;
      text_query_insert += ` , pattern_processor_outside_id = '` + data_in.pattern_processor_outside_id + `'`;
    } else {
      text_query_insert += ` , pattern_processor_outside = '0'`;
      text_query_insert += ` , pattern_processor_outside_total = '0'`;
      text_query_insert += ` , pattern_processor_outside_id = ''`;
    }
    if (data_in.pattern_set_end_date == 1) {
      text_query_insert += ` , pattern_set_end_date = '` + data_in.pattern_set_end_date + `'`;
      text_query_insert += ` , pattern_set_end_date_total = '` + data_in.pattern_set_end_date_total + `'`;
    } else {
      text_query_insert += ` , pattern_set_end_date = '0'`;
    }
    if (data_in.pattern_dpo_approve_process == 1) {
      text_query_insert += ` , pattern_dpo_approve_process = '` + data_in.pattern_dpo_approve_process + `'`;
    } else {
      text_query_insert += ` , pattern_dpo_approve_process = '0'`;
    }
    if (data_in.pattern_dpo_approve_raw_file_out == 1) {
      text_query_insert += ` , pattern_dpo_approve_raw_file_out = '` + data_in.pattern_dpo_approve_raw_file_out + `'`;
    } else {
      text_query_insert += ` , pattern_dpo_approve_raw_file_out = '0'`;
    }
    if (data_in.dpo_c == 1) {
      text_query_insert += ` , pattern_dpo_check = '1'`;
      text_query_insert += ` , pattern_dpo_check_acc_id = '` + user + `'`;
      text_query_insert += ` , pattern_dpo_check_date = '` + data_in.dpo_date + `'`;
      text_query_insert += ` , dpo_pattern_dpo_approve_process = '` + data_in.dpo_pattern_dpo_approve_process + `'`;
      text_query_insert += ` , dpo_pattern_dpo_approve_raw_file_out = '` + data_in.dpo_pattern_dpo_approve_raw_file_out + `'`;
    } else {
      text_query_insert += ` , pattern_dpo_check = '0'`;
    }
    text_query_insert += ` ;`

    req.getConnection((err, conn) => {
      funchistory.funchistory(req, "pattern", `เพิ่มข้อมูล pattern ${data_in.pattern_name} `, req.session.userid)
      if (text_query_insert != "") {
        conn.query(text_query_insert, (err, pass) => {
          let idPattern = pass.insertId;

          if (data_in.new_data_papd_specific != '') { // กรณีที่มีการเเก้ไข มาตราการ
            let new_data_papd_specific = JSON.parse(data_in.new_data_papd_specific)
            let papd_specific = data_in.papd_specific.split(',') // id ของมาตราการทั้งที่ส่งมา
            let id_specific = [] // เก็บ id ของ มาตราการ pdp-specific ที่มีการเเก้ไข
            let unique = [] // ค่าที่ไม่ซ้ำ
            req.getConnection((err, conn) => {
              new_data_papd_specific.forEach(element => {
                conn.query(' INSERT INTO TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN SET event_process_id=?,pattern_id=?,specific_id=?,pattern_specific_doc_id=?, pattern_measures_section_name=?, pattern_measures_detail=?,pattern_measures_supervisor=?,pattern_measures_date=?,pattern_measures_date_count=?, pattern_specific_access_control=?,pattern_specific_user_access_management=?,pattern_specific_user_responsibilitites =?, pattern_specific_audit_trails=?,pattern_specific_privacy_security_awareness=?, pattern_specific_where_incident_occurs=?,pattern_specific_access_control_explain=?, pattern_specific_user_access_management_explain=?, pattern_specific_user_responsibilitites_explain=?, pattern_specific_audit_trails_explain=?, pattern_specific_privacy_security_awareness_explain=?, pattern_specific_where_incident_occurs_explain=?',
                  [element.id_event_proccess, idPattern, element.id_specific,
                  element.doc_id.toString(),
                  element.section_name, element.measures_detail,
                  element.measures_supervisor.toString(), element.measures_date,
                  element.measures_date_count, element.value_checkbox[0],
                  element.value_checkbox[1], element.value_checkbox[2],
                  element.value_checkbox[3], element.value_checkbox[4],
                  element.value_checkbox[5], element.specific_access_control_explain,
                  element.specific_user_access_management_explain, element.specific_user_responsibilitites_explain,
                  element.specific_audit_trails_explain, element.specific_privacy_security_awareness_explain,
                  element.specific_where_incident_occurs_explain,], (err, insert_specific_on_pattern) => {
                    if (err) { console.log(err); }
                  })
                id_specific.push(`${element.id_specific}`)
              });
              papd_specific.forEach(element => { // funcstion หาค่าที่ซ้ำ 
                if (id_specific.indexOf(element) < 0) { unique.push(element); }
              });
              insertSpecificOnpattern(unique, idPattern, req)
            });
          } else { // กรณีที่ไม่มีการเเกไก้ มาตราการ
            let papd_specific = data_in.papd_specific.split(',') // id ของมาตราการทั้งที่ส่งมา
            insertSpecificOnpattern(papd_specific, idPattern, req)
          }
          if (err) { res.json(err) } else {
            res.redirect('/pattern')
          }
        })
      } else {
        res.redirect("/pattern")
      }
    })
  }
};

// POST Update
// controller.updatePattern = (req, res) => {
//     if (typeof req.session.userid == "undefined") {
//         res.redirect('/')
//     } else {
//         const { id } = req.params;
//         const user = req.session.userid;
//         const _pattern_type_data_file_ = req.body.pattern_type_data_file;
//         var pattern_type_data_file = -1
//         const _pattern_type_data_database_ = req.body.pattern_type_data_database;
//         var pattern_type_data_database = -1
//         const _pattern_storage_method_inside_ = req.body.pattern_storage_method_inside;
//         var pattern_storage_method_inside = -1
//         const _pattern_storage_method_outside_ = req.body.pattern_storage_method_outside;
//         var pattern_storage_method_outside = -1
//         const _pattern_storage_method_outside_device_ = req.body.pattern_storage_method_outside_device;
//         var pattern_storage_method_outside_device = -1
//         const _pattern_storage_method_outside_agent_ = req.body.pattern_storage_method_outside_agent;
//         var pattern_storage_method_outside_agent = -1
//         const _pattern_storage_method_outside_database_outside_ = req.body.pattern_storage_method_outside_database_outside;
//         var pattern_storage_method_outside_database_outside = -1
//         const _pattern_processor_inside_ = req.body.pattern_processor_inside;
//         var pattern_processor_inside = -1
//         const _pattern_processor_outside_ = req.body.pattern_processor_outside;
//         var pattern_processor_outside = -1
//         const _pattern_set_end_date_ = req.body.pattern_set_end_date;
//         var pattern_set_end_date = -1
//         const _pattern_dpo_approve_process_ = req.body.pattern_dpo_approve_process
//         var pattern_dpo_approve_process = -1
//         const _pattern_dpo_approve_raw_file_out_ = req.body.pattern_dpo_approve_raw_file_out
//         var pattern_dpo_approve_raw_file_out = -1
//         const _pattern_type_data_file_of_path_ = req.body.pattern_type_data_file_of_path
//         var pattern_type_data_file_of_path = -1
//         if (typeof _pattern_type_data_file_ == 'undefined') {
//             pattern_type_data_file = 0
//         } else {
//             pattern_type_data_file = 1
//         }
//         if (typeof _pattern_type_data_database_ == 'undefined') {
//             pattern_type_data_database = 0
//         } else {
//             pattern_type_data_database = 1
//         }
//         if (typeof _pattern_storage_method_inside_ == 'undefined') {
//             pattern_storage_method_inside = 0
//         } else {
//             pattern_storage_method_inside = 1
//         }
//         if (typeof _pattern_storage_method_outside_ == 'undefined') {
//             pattern_storage_method_outside = 0
//         } else {
//             pattern_storage_method_outside = 1
//         }
//         if (typeof _pattern_storage_method_outside_device_ == "undefined") {
//             pattern_storage_method_outside_device = 0
//         } else {
//             pattern_storage_method_outside_device = 1
//         }
//         if (typeof _pattern_storage_method_outside_agent_ == 'undefined') {
//             pattern_storage_method_outside_agent = 0
//         } else {
//             pattern_storage_method_outside_agent = 1
//         }
//         if (typeof _pattern_storage_method_outside_database_outside_ == "undefined") {
//             pattern_storage_method_outside_database_outside = 0
//         } else {
//             pattern_storage_method_outside_database_outside = 1
//         }
//         if (typeof _pattern_processor_inside_ == 'undefined') {
//             pattern_processor_inside = 0
//         } else {
//             pattern_processor_inside = 1
//         }
//         if (typeof _pattern_processor_outside_ == 'undefined') {
//             pattern_processor_outside = 0
//         } else {
//             pattern_processor_outside = 1
//         }
//         if (typeof _pattern_set_end_date_ == 'undefined') {
//             pattern_set_end_date = 0
//         } else {
//             pattern_set_end_date = 1
//         }
//         if (typeof _pattern_dpo_approve_process_ == 'undefined') {
//             pattern_dpo_approve_process = 0
//         } else {
//             pattern_dpo_approve_process = 1
//         }
//         if (typeof _pattern_dpo_approve_raw_file_out_ == 'undefined') {
//             pattern_dpo_approve_raw_file_out = 0
//         } else {
//             pattern_dpo_approve_raw_file_out = 1
//         }
//         if (typeof _pattern_type_data_file_of_path_ == 'undefined') {
//             pattern_type_data_file_of_path = 0
//         } else {
//             pattern_type_data_file_of_path = req.body.pattern_type_data_file_of_path
//         }
//         const body = {
//             "pattern_name": req.body.pattern_name,
//             'doc_id': req.body.doc_id,
//             "pattern_tag": req.body.pattern_tag,
//             "pattern_label": req.body.pattern_label,
//             "pattern_start_date": req.body.pattern_start_date,
//             "pattern_total_date": req.body.pattern_total_date,
//             "acc_id": user,
//             "pattern_type_data_file": pattern_type_data_file,
//             "pattern_type_data_file_of_path": pattern_type_data_file_of_path,
//             "pattern_type_data_file_path": req.body.pattern_type_data_file_path,
//             "pattern_type_data_database": pattern_type_data_database,
//             "pattern_type_data_database_name": req.body.pattern_type_data_database_name,
//             "pattern_storage_method_inside": pattern_storage_method_inside,
//             "pattern_storage_method_outside": pattern_storage_method_outside,
//             "pattern_storage_method_outside_name": req.body.pattern_storage_method_outside_name,
//             "pattern_storage_method_outside_device": pattern_storage_method_outside_device,
//             "pattern_storage_method_outside_device_name": req.body.pattern_storage_method_outside_device_name,
//             "pattern_storage_method_outside_agent": pattern_storage_method_outside_agent,
//             "pattern_storage_method_outside_agent_name": req.body.pattern_storage_method_outside_agent_name,
//             "pattern_storage_method_outside_database_outside": pattern_storage_method_outside_database_outside,
//             "pattern_storage_method_outside_database_outside_name": req.body.pattern_storage_method_outside_database_outside_name,
//             "pattern_processing_base_id": req.body.pattern_processing_base_id,
//             "pattern_processor_inside": pattern_processor_inside,
//             "pattern_processor_inside_total": req.body.pattern_processor_inside_total,
//             "pattern_processor_inside_id": req.body.pattern_processor_inside_id,
//             "pattern_processor_outside": pattern_processor_outside,
//             "pattern_processor_outside_total": req.body.pattern_processor_outside_total,
//             "pattern_processor_outside_id": req.body.pattern_processor_outside_id,
//             "pattern_set_end_date": pattern_set_end_date,
//             "pattern_set_end_date_total": req.body.pattern_set_end_date_total,
//             "pattern_dpo_approve_process": pattern_dpo_approve_process,
//             "pattern_dpo_approve_raw_file_out": pattern_dpo_approve_raw_file_out
//         }
//         req.getConnection((err, conn) => {
//             if (body.doc_id != "") {
//                 conn.query('UPDATE doc_pdpa_pattern SET ? WHERE pattern_id = ?;', [body, id], (err, pass) => {
//                     if (err) { res.json(err) } else {
//                         res.redirect('/pattern')
//                     }
//                 })
//             } else {
//                 res.redirect("/pattern")
//             }
//         })
//     }
// }
controller.updatePattern = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const { id } = req.params;
    var user = "";
    if (req.session.acc_id_control) {
      user = req.session.acc_id_control;
    } else {
      user = req.session.userid;
    }
    const data_in = req.body;
    if (data_in.papd_specific !== '' && data_in.new_data_papd_specific !== '') { // กรณี มีมาตราการเเละเเก้ไข

      let new_data_papd_specific = JSON.parse(data_in.new_data_papd_specific)
      let papd_specific = data_in.papd_specific.split(',') // id ของมาตราการทั้งที่ส่งมา
      let uniques = [] // ค่าที่ไม่ซ้ำ

      //  กรณีที่มีการเพิ่มมาตราการเเละเเก้ไขมาตราการที่เพิ่มมาใหม่
      let id_specific = new_data_papd_specific.map(items => {
        if (items.pattern_specific_id != undefined) {  // มาตราการ papd_specific มีอยู่เเล้วใน  TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN
          req.getConnection((err, conn) => {
            conn.query('UPDATE TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN SET pattern_measures_date =?, pattern_measures_date_count =?, pattern_measures_supervisor =?, pattern_measures_section_name =?, pattern_specific_access_control =?, pattern_specific_user_access_management =?, pattern_specific_user_responsibilitites =?, pattern_specific_audit_trails =?, pattern_specific_privacy_security_awareness =?, pattern_specific_where_incident_occurs =?, pattern_specific_access_control_explain =?, pattern_specific_user_access_management_explain =?, pattern_specific_user_responsibilitites_explain =?, pattern_specific_audit_trails_explain =?, pattern_specific_privacy_security_awareness_explain =?, pattern_specific_where_incident_occurs_explain =?   WHERE pattern_specific_id = ?; ',
              [items.measures_date,
              items.measures_date_count,
              items.measures_supervisor.toString(),
              items.section_name,
              items.specific_access_control,
              items.specific_user_access_management,
              items.specific_user_responsibilitites,
              items.specific_audit_trails,
              items.specific_privacy_security_awareness,
              items.specific_where_incident_occurs,
              items.specific_access_control_explain,
              items.specific_user_access_management_explain,
              items.specific_user_responsibilitites_explain,
              items.specific_audit_trails_explain,
              items.specific_privacy_security_awareness_explain,
              items.specific_where_incident_occurs_explain,
              items.pattern_specific_id], (err, updatePatternSpecific) => {
                if (err) { console.log(err); }
              });
          });
        } else {  // มาตราการ papd_specific ที่เลือกเข้ามาใหม่ด้วยมีการเเก้ไขข้อมูล
          req.getConnection((err, conn) => {
            conn.query(' INSERT INTO TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN SET event_process_id=?,pattern_id=?,specific_id=?,pattern_specific_doc_id=?, pattern_measures_section_name=?, pattern_measures_detail=?,pattern_measures_supervisor=?,pattern_measures_date=?,pattern_measures_date_count=?, pattern_specific_access_control =?, pattern_specific_user_access_management =?, pattern_specific_user_responsibilitites =?, pattern_specific_audit_trails =?, pattern_specific_privacy_security_awareness =?, pattern_specific_where_incident_occurs =?, pattern_specific_access_control_explain =?, pattern_specific_user_access_management_explain =?, pattern_specific_user_responsibilitites_explain =?, pattern_specific_audit_trails_explain =?, pattern_specific_privacy_security_awareness_explain =?, pattern_specific_where_incident_occurs_explain =?',
              [items.id_event_proccess,
              data_in.pattern_specific_id,
              items.id_specific,
              items.doc_id.toString(),
              items.section_name,
              items.measures_detail,
              items.measures_supervisor.toString(),
              items.measures_date,
              items.measures_date_count,
              items.specific_access_control,
              items.specific_user_access_management,
              items.specific_user_responsibilitites,
              items.specific_audit_trails,
              items.specific_privacy_security_awareness,
              items.specific_where_incident_occurs,
              items.specific_access_control_explain,
              items.specific_user_access_management_explain,
              items.specific_user_responsibilitites_explain,
              items.specific_audit_trails_explain,
              items.specific_privacy_security_awareness_explain,
              items.specific_where_incident_occurs_explain],
              (err, insert_specific_on_pattern) => {
                if (err) { console.log(err); }
              })
          });
          // newInformationSpecifi.push(items)
        }
        return items.id_specific
      })
      // function หาค่าที่ซ้ำเเละไม่ซ้ำ
      papd_specific.forEach(element => {
        if (id_specific.indexOf(Number(element)) < 0) {
          uniques.push(element);
        }
      });
      insertSpecificOnpattern(uniques, data_in.pattern_specific_id, req)
      req.getConnection((err, conn) => {
        conn.query('SELECT * FROM TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN WHERE pattern_id = ?', [data_in.pattern_specific_id], (err, selectPatternSpecifi) => {
          console.log(selectPatternSpecifi[0]);
          selectPatternSpecifi.forEach(element => {
            if (papd_specific.indexOf(element.specific_id.toString()) < 0) {
              conn.query('DELETE FROM TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN WHERE pattern_specific_id = ?', [element.pattern_specific_id], (err, deletePatternSpecifi) => {
                if (err) { res.json(err) }
              })
            }
          });
        });
      });
    } else if (data_in.papd_specific !== '' && data_in.new_data_papd_specific == '') { // กรณี ไม่มีมาตราการเลย เเล้ว เพิ่มมาตราการ
      let papd_specific = data_in.papd_specific.split(',') // id ของมาตราการทั้งที่ส่งมา
      insertSpecificOnpattern(papd_specific, data_in.pattern_specific_id, req)
    } else { // กรณี เอามาตราการ ออกหมดเลย
      req.getConnection((err, conn) => {
        conn.query('DELETE FROM TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN WHERE pattern_id = ?',
          [data_in.pattern_specific_id], (err, deletePatternSpecifi) => {
            if (err) { res.json(err) }
          })
      });
    }

    var text_query_insert = ` UPDATE TB_TR_PDPA_PATTERN SET `;
    text_query_insert += `  pattern_name = '` + data_in.pattern_name + `'`;
    text_query_insert += ` , doc_id = '` + data_in.doc_id + `'`;
    if (Array.isArray(data_in.doc_id_person_data)) {
      text_query_insert +=
        ` , doc_id_person_data = '` +
        data_in.doc_id_person_data.toString() +
        `'`;
    } else if (data_in.doc_id_person_data) {
      text_query_insert +=
        ` , doc_id_person_data = '` + data_in.doc_id_person_data + `'`;
    } else {
      text_query_insert += ` , doc_id_person_data = ''`;
    }
    if (Array.isArray(data_in.doc_id_person_tag)) {
      text_query_insert +=
        ` , pattern_tag = '` + data_in.doc_id_person_tag.toString() + `'`;
    } else if (data_in.doc_id_person_tag) {
      text_query_insert +=
        ` , pattern_tag = '` + data_in.doc_id_person_tag + `'`;
    } else {
      text_query_insert += ` , pattern_tag = ''`;
    }
    text_query_insert += ` , pattern_label = '` + data_in.pattern_label + `'`;
    text_query_insert +=
      ` , pattern_start_date = '` + data_in.pattern_start_date + `'`;
    text_query_insert +=
      ` , pattern_total_date = '` + data_in.pattern_total_date + `'`;
    // text_query_insert += ` , acc_id = '` + user + `'`;
    if (data_in.pattern_type_data_file == 1) {
      text_query_insert +=
        ` , pattern_type_data_file = '` + data_in.pattern_type_data_file + `'`;
      text_query_insert +=
        ` , pattern_type_data_file_of_path = '` +
        data_in.pattern_type_data_file_of_path +
        `'`;
      text_query_insert +=
        ` , pattern_type_data_file_path = '` +
        data_in.pattern_type_data_file_path +
        `'`;
    } else {
      text_query_insert += ` , pattern_type_data_file = '0'`;
    }
    if (data_in.pattern_type_data_database == 1) {
      text_query_insert +=
        ` , pattern_type_data_database = '` +
        data_in.pattern_type_data_database +
        `'`;
      text_query_insert +=
        ` , pattern_type_data_database_name = '` +
        data_in.pattern_type_data_database_name +
        `'`;
    } else {
      text_query_insert += ` , pattern_type_data_database = '0'`;
      text_query_insert += ` , pattern_type_data_database_name = ''`;
    }
    if (data_in.pattern_storage_method_inside == 1) {
      text_query_insert +=
        ` , pattern_storage_method_inside = '` +
        data_in.pattern_storage_method_inside +
        `'`;
      if (data_in.pattern_storage_method_inside_import == 1) {
        text_query_insert += ` , pattern_storage_method_inside_import = '1'`;
        text_query_insert +=
          ` , pattern_storage_method_inside_import_id = '` +
          data_in.pattern_storage_method_inside_import_id +
          `'`;
      } else {
        text_query_insert += ` , pattern_storage_method_inside_import = '0'`;
        text_query_insert += ` , pattern_storage_method_inside_import_id = ''`;
      }
      if (data_in.pattern_storage_method_inside_agent == 1) {
        text_query_insert += ` , pattern_storage_method_inside_agent = '1'`;
        text_query_insert +=
          ` , pattern_storage_method_inside_agent_name = '` +
          data_in.pattern_storage_method_inside_agent_name +
          `'`;
      } else {
        text_query_insert += ` , pattern_storage_method_inside_agent = '0'`;
        text_query_insert += ` , pattern_storage_method_inside_agent_name = ''`;
      }
      if (data_in.pattern_storage_method_inside_database_outside == 1) {
        text_query_insert += ` , pattern_storage_method_inside_database_outside = '1'`;
        text_query_insert +=
          ` , pattern_storage_method_inside_database_outside_name = '` +
          data_in.pattern_storage_method_inside_database_outside_name +
          `'`;
      } else {
        text_query_insert += ` , pattern_storage_method_inside_database_outside = '0'`;
        text_query_insert += ` , pattern_storage_method_inside_database_outside_name = ''`;
      }
    } else {
      text_query_insert += ` , pattern_storage_method_inside = '0'`;
      text_query_insert += ` , pattern_storage_method_inside_import = '0'`;
      text_query_insert += ` , pattern_storage_method_inside_import_id = ''`;
      text_query_insert += ` , pattern_storage_method_inside_agent = '0'`;
      text_query_insert += ` , pattern_storage_method_inside_agent_name = ''`;
      text_query_insert += ` , pattern_storage_method_inside_database_outside = '0'`;
      text_query_insert += ` , pattern_storage_method_inside_database_outside_name = ''`;
    }
    if (data_in.pattern_storage_method_outside == 1) {
      text_query_insert +=
        ` , pattern_storage_method_outside = '` +
        data_in.pattern_storage_method_outside +
        `'`;
      text_query_insert +=
        ` , pattern_storage_method_outside_name = '` +
        data_in.pattern_storage_method_outside_name +
        `'`;
    } else {
      text_query_insert += ` , pattern_storage_method_outside = '0'`;
      text_query_insert += ` , pattern_storage_method_outside_name = ''`;
    }
    text_query_insert +=
      ` , pattern_processing_base_id = '` +
      data_in.pattern_processing_base_id +
      `'`;
    if (data_in.pattern_processor_inside == 1) {
      text_query_insert +=
        ` , pattern_processor_inside = '` +
        data_in.pattern_processor_inside +
        `'`;
      text_query_insert +=
        ` , pattern_processor_inside_total = '` +
        data_in.pattern_processor_inside_total +
        `'`;
      text_query_insert +=
        ` , pattern_processor_inside_id = '` +
        data_in.pattern_processor_inside_id +
        `'`;
    } else {
      text_query_insert += ` , pattern_processor_inside = '0'`;
      text_query_insert += ` , pattern_processor_inside_total = '0'`;
      text_query_insert += ` , pattern_processor_inside_id = ''`;
    }
    if (data_in.pattern_processor_outside == 1) {
      text_query_insert +=
        ` , pattern_processor_outside = '` +
        data_in.pattern_processor_outside +
        `'`;
      text_query_insert +=
        ` , pattern_processor_outside_total = '` +
        data_in.pattern_processor_outside_total +
        `'`;
      text_query_insert +=
        ` , pattern_processor_outside_id = '` +
        data_in.pattern_processor_outside_id +
        `'`;
    } else {
      text_query_insert += ` , pattern_processor_outside = '0'`;
      text_query_insert += ` , pattern_processor_outside_total = '0'`;
      text_query_insert += ` , pattern_processor_outside_id = ''`;
    }
    if (data_in.pattern_set_end_date == 1) {
      text_query_insert +=
        ` , pattern_set_end_date = '` + data_in.pattern_set_end_date + `'`;
      text_query_insert +=
        ` , pattern_set_end_date_total = '` +
        data_in.pattern_set_end_date_total +
        `'`;
    } else {
      text_query_insert += ` , pattern_set_end_date = '0'`;
    }

    if (data_in.dpo_c == 1) {
      text_query_insert += ` , pattern_dpo_check = '1'`;
      text_query_insert += ` , pattern_dpo_check_acc_id = '` + user + `'`;
      text_query_insert +=
        ` , pattern_dpo_check_date = '` + data_in.dpo_date + `'`;
      text_query_insert +=
        ` , dpo_pattern_dpo_approve_process = '` +
        data_in.dpo_pattern_dpo_approve_process +
        `'`;
      text_query_insert +=
        ` , dpo_pattern_dpo_approve_raw_file_out = '` +
        data_in.dpo_pattern_dpo_approve_raw_file_out +
        `'`;
    } else {
      text_query_insert += ` , pattern_dpo_check = '0'`;
    }

    text_query_insert += ` WHERE pattern_id = ` + id + ` ;`;

    req.getConnection((err, conn) => {
      funchistory.funchistory(
        req,
        "pattern",
        `แก้ไขข้อมูล pattern ${data_in.pattern_name}`,
        req.session.userid
      );
      if (text_query_insert != "") {
        conn.query(text_query_insert, (err, pass) => {
          if (err) {
            res.json(err);
          } else {
            res.redirect("/pattern");
          }
        });
      } else {
        res.redirect("/pattern");
      }
    });
  }
};
// Detail from Index1
controller.detailPattern = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    // const user = req.session.userid
    var user = "";
    if (req.session.acc_id_control) {
      user = req.session.acc_id_control;
    } else {
      user = req.session.userid;
    }
    const { id } = req.params;
    req.getConnection((err, conn) => {
      conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;',
        [user], (err, history) => {
          conn.query("SELECT * FROM TB_MM_PDPA_WORDS;", (err, words) => {
            conn.query("SELECT * FROM TB_TR_PDPA_PATTERN as pp JOIN TB_TR_ACCOUNT as pu ON pp.acc_id = pu.acc_id JOIN TB_MM_PDPA_PATTERN_PROCESSING_BASE as pppb ON pp.pattern_processing_base_id = pppb.pattern_processing_base_id WHERE pattern_id = ?",
              [id], (err, pattern) => {
                conn.query("SELECT * FROM TB_TR_ACCOUNT", (err, users) => {
                  conn.query("SELECT * FROM TB_TR_PDPA_DOCUMENT", (err, doc_pdpa_document) => {
                    conn.query("SELECT * FROM TB_TR_PDPA_DATA", (err, doc_pdpa_data) => {
                      conn.query("SELECT *,patternSpecific.specific_id as  specific_id ,DATE_FORMAT(patternSpecific.pattern_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN  AS patternSpecific LEFT JOIN TB_TR_PDPA_EVENT_PROCESS  AS event ON patternSpecific.event_process_id = event.event_process_id WHERE pattern_id = ?",
                        [id], (err, selectPatternSpecific) => {
                          conn.query("SELECT TB_TR_ACCOUNT.acc_id,TB_TR_ACCOUNT.firstname,TB_TR_ACCOUNT.lastname FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5)",
                            (err, account) => {

                              let word = [];
                              let word1 = [];
                              for (i in words) {
                                word.push(words[i].words_id);
                                word1.push(words[i].words_often);
                              }
                              let total_users =
                                pattern[0].pattern_processor_inside_id.split(",");
                              let total_name = "";
                              if (typeof total_users != "object") {
                                total_name = users.filter(function (item) {
                                  return item.acc_id == total_users;
                                });
                              } else {
                                total_name = users.filter(function (item) {
                                  return (total_users.toString().indexOf(item.acc_id) != -1);
                                });
                              }
                              let total_users1 = pattern[0].pattern_processor_outside_id.split(",");
                              let total_name1 = "";
                              if (typeof total_users1 != "object") {
                                total_name1 = users.filter(function (item) { return item.acc_id == total_users1; });
                              } else {
                                total_name1 = users.filter(function (item) { return (total_users1.toString().indexOf(item.acc_id) != -1); });
                              }
                              var doc_id = [];
                              let docOnUser = [] // 

                              for (let i = 0; i < pattern[0].doc_id.toString().split(",").length; i++) {
                                for (let j = 0; j < doc_pdpa_document.length; j++) {
                                  if (pattern[0].doc_id.toString().split(",")[i] == doc_pdpa_document[j].doc_id) {
                                    doc_id.push({
                                      name: doc_pdpa_document[j].doc_name,
                                      id: doc_pdpa_document[j].doc_id,
                                    });
                                  }
                                  // หาเอกสารที่เปิดใช้งานเท่านั้น
                                  if (doc_pdpa_document[j].doc_status == 2 && doc_pdpa_document[j].type !== 3 && doc_pdpa_document[j].doc_action === 0) {
                                    docOnUser.push(doc_pdpa_document[j])
                                  }
                                }
                              }

                              // func จัดการข้อมูลเพื่อนำไปเเสดงหน้าเว็บ 
                              selectPatternSpecific = selectPatternSpecific.map((items, index) => {
                                let pattern_specific_doc_id = items.pattern_specific_doc_id.split(',')
                                let pattern_measures_supervisor = items.pattern_measures_supervisor.split(',');
                                let supervisor = ""
                                let docName = ""
                                // เเปลงวันที่ 
                                items.date = new Date(items.date).toLocaleDateString('en-GB') + " - " + new Date(new Date(items.date).getTime() + items.pattern_measures_date_count * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB') + ` <br> ( ${items.pattern_measures_date_count} ) วัน`;
                                // เอกสารที่เอาไปเเสดงหน้าเว็บ
                                docOnUser.forEach(element => {
                                  if (pattern_specific_doc_id.indexOf(String(element.doc_id)) > -1) {
                                    docName += `${element.doc_name},<br>`;
                                  }
                                });

                                // ผู้ดูแลข้อมูลหรือผู้ดูแลระบบหรือผู้ควบคุมมาตราการ
                                let count = 0
                                account.forEach(element => {
                                  if (pattern_measures_supervisor.indexOf(String(element.acc_id)) > -1) {
                                    supervisor += `${count + 1}.${element.firstname} ${element.lastname} <br>`
                                    count++;
                                  }
                                });
                                items.pattern_measures_supervisor = supervisor
                                items.pattern_specific_access_control = items.pattern_specific_access_control === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'
                                items.pattern_specific_user_access_management = items.pattern_specific_user_access_management === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'
                                items.pattern_specific_user_responsibilitites = items.pattern_specific_user_responsibilitites === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'
                                items.pattern_specific_audit_trails = items.pattern_specific_audit_trails === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'
                                items.pattern_specific_privacy_security_awareness = items.pattern_specific_privacy_security_awareness === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'
                                items.pattern_specific_where_incident_occurs = items.pattern_specific_where_incident_occurs === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'

                                return { ...items, docName, no: index + 1 }
                              })

                              // console.log('selectPatternSpecific', selectPatternSpecific);
                              var data_id = [];
                              for (let i = 0; i < pattern[0].doc_id_person_data.toString().split(",").length; i++) {
                                for (let j = 0; j < doc_pdpa_data.length; j++) {
                                  if (pattern[0].doc_id_person_data.toString().split(",")[i] == doc_pdpa_data[j].data_id) {
                                    data_id.push(doc_pdpa_data[j].data_name);
                                  }
                                }
                              }

                              if (err) {
                                res.json(err);
                              } else {
                                funchistory.funchistory(
                                  req,
                                  "pattern",
                                  `ดูข้อมูล pattern ${pattern[0].pattern_name}`,
                                  req.session.userid
                                );
                                res.render("./pattern/detail", {
                                  pattern: pattern,
                                  doc_id: doc_id,
                                  data_id: data_id,
                                  users_inside: total_name,
                                  users_outside: total_name1,
                                  history: history,
                                  words: words,
                                  words1: word,
                                  words2: word1,
                                  selectPatternSpecific,
                                  session: req.session,
                                });
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
  }
};

controller.deletePattern = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const { id } = req.params;
    req.getConnection((err, conn) => {
      // conn.query('DELETE FROM TB_TR_PDPA_CLASSIFICATION WHERE pattern_id = ?', [id], (err, pass) => {
      //     if (err) { res.json(err) }
      // })
      conn.query(
        "SELECT * FROM TB_TR_PDPA_PATTERN WHERE pattern_id = ?",
        [id],
        (err, pattern) => {
          conn.query(
            "DELETE FROM TB_TR_PDPA_PATTERN WHERE pattern_id = ?",
            [id],
            (err, pass) => {
              funchistory.funchistory(
                req,
                "pattern",
                `ลบข้อมูล pattern ${pattern[0].pattern_name}`,
                req.session.userid
              );
              if (err) {
                res.json(err);
              } else {
                res.redirect(req.get("referer"));
              }
            }
          );
        }
      );
    });
  }
};
// Statistics (All)
controller.datatypePattern = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const user = req.session.userid;
    req.getConnection((err, conn) => {
      // conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join doc_pdpa.pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
      conn.query("SELECT * FROM TB_MM_PDPA_WORDS ", (err, words) => {
        // conn.query('SELECT pm.pm_id, pm.pm_name, pd.data_name, pm.pm_start_time, pm.pm_used_time, pm.pm_total_time, pu.user_fullname, pm.pm_device_agent FROM pdpa_policy_management as pm JOIN pdpa_user as pu ON pm.user_id = pu.user_id JOIN pdpa_policy_management_data as pmd ON pmd.pm_id = pm.pm_id JOIN pdpa_data as pd ON pmd.data_id = pd.data_id;', (err, pm) => {
        //     conn.query('SELECT * FROM pdpa_data', (err, data) => {
        let word = [];
        let word1 = [];
        for (i in words) {
          word.push(words[i].words_id);
          word1.push(words[i].words_often);
        }
        if (err) {
          res.json(err);
        }
        // checkDiskSpace('D:/').then((diskSpace) => {
        res.render("./pattern/datatype", {
          // pm: pm,
          // data: data,
          // checkDiskSpace: diskSpace,
          history: history,
          // words: words,
          words1: word,
          words2: word1,
          session: req.session,
        });
        // })
        //     })
        // })
      });
      // })
    });
  }
};
// Statistics (Disk)
controller.diskPattern = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const user = req.session.userid;
    req.getConnection((err, conn) => {
      // conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history  from TB_TR_PDPA_DOCUMENT as d  join doc_pdpa.pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
      conn.query("SELECT * FROM TB_MM_PDPA_WORDS ", (err, words) => {
        // conn.query('SELECT pm.pm_id, pm.pm_name, pd.data_name, pm.pm_start_time, pm.pm_used_time, pm.pm_total_time, pu.user_fullname, pm.pm_device_agent FROM pdpa_policy_management as pm JOIN pdpa_user as pu ON pm.user_id = pu.user_id JOIN pdpa_policy_management_data as pmd ON pmd.pm_id = pm.pm_id JOIN pdpa_data as pd ON pmd.data_id = pd.data_id;', (err, pm) => {
        //     conn.query('SELECT * FROM pdpa_data', (err, data) => {
        let word = [];
        let word1 = [];
        for (i in words) {
          word.push(words[i].words_id);
          word1.push(words[i].words_often);
        }
        if (err) {
          res.json(err);
        }
        // checkDiskSpace('D:/').then((diskSpace) => {
        res.render("./pattern/disk", {
          // pm: pm,
          // data: data,
          // checkDiskSpace: diskSpace,
          // history: history,
          words: words,
          words1: word,
          words2: word1,
          session: req.session,
        });
        // })
        //     })
        // })
      });
      // })
    });
  }
};
// Statistics (Used)
controller.usedPattern = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const user = req.session.userid;
    req.getConnection((err, conn) => {
      // conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history  from doc_pdpa_document as d  join doc_pdpa.pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
      conn.query("SELECT * FROM TB_MM_PDPA_WORDS ", (err, words) => {
        // conn.query('SELECT pm.pm_id, pm.pm_name, pd.data_name, pm.pm_start_time, pm.pm_used_time, pm.pm_total_time, pu.user_fullname, pm.pm_device_agent FROM pdpa_policy_management as pm JOIN pdpa_user as pu ON pm.user_id = pu.user_id JOIN pdpa_policy_management_data as pmd ON pmd.pm_id = pm.pm_id JOIN pdpa_data as pd ON pmd.data_id = pd.data_id;', (err, pm) => {
        //     conn.query('SELECT * FROM pdpa_data', (err, data) => {
        let word = [];
        let word1 = [];
        for (i in words) {
          word.push(words[i].words_id);
          word1.push(words[i].words_often);
        }
        if (err) {
          res.json(err);
        }
        // checkDiskSpace('D:/').then((diskSpace) => {
        res.render("./pattern/used", {
          // pm: pm,
          // data: data,
          // checkDiskSpace: diskSpace,
          // history: history,
          words: words,
          words1: word,
          words2: word1,
          session: req.session,
        });
        // })
        //     })
        // })
      });
      // })
    });
  }
};

// ajex get doc_id_detail
controller.ajexPatternget_doc_id_detail = (req, res) => {
  var data_in = req.body;
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT TB_TR_PDPA_DATA.* ,DATE_FORMAT(TB_TR_PDPA_DATA.data_date_start,'%d/%m/%Y') as day_start,DATE_FORMAT(TB_TR_PDPA_DATA.data_date_end,'%d/%m/%Y') as day_end, TB_MM_PDPA_LEVEL.level_name as level_name ,TB_MM_PDPA_DOCUMENT_TYPE.doc_type_name as data_type_name FROM TB_TR_PDPA_DATA left join TB_MM_PDPA_LEVEL on TB_TR_PDPA_DATA.data_level_id = TB_MM_PDPA_LEVEL.level_id left join TB_MM_PDPA_DOCUMENT_TYPE on TB_TR_PDPA_DATA.data_type_id = TB_MM_PDPA_DOCUMENT_TYPE.doc_type_id ;",
        (err, doc_pdpa_data) => {
          var text_query_page =
            "SELECT TB_TR_PDPA_DOCUMENT.doc_id as doc_id,TB_TR_PDPA_DOCUMENT_PAGE.page_content as page_content FROM TB_TR_PDPA_DOCUMENT join TB_TR_PDPA_DOCUMENT_PAGE on TB_TR_PDPA_DOCUMENT.doc_id = TB_TR_PDPA_DOCUMENT_PAGE.doc_id WHERE TB_TR_PDPA_DOCUMENT.doc_status = 2 AND TB_TR_PDPA_DOCUMENT.doc_action IS NOT TRUE  ";
          var data_in2 = data_in.doc_id.split(",");
          if (data_in2.length > 0) {
            text_query_page +=
              " AND (TB_TR_PDPA_DOCUMENT.doc_id = " + data_in2[0] + " ";
            if (data_in2.length > 1) {
              for (let i = 1; i < data_in2.length; i++) {
                text_query_page +=
                  " OR TB_TR_PDPA_DOCUMENT.doc_id = " + data_in2[i] + " ";
              }
            }
            text_query_page += " ); ";
          }
          conn.query(text_query_page, (err, doc_pdpa_document_page) => {
            var data_out = [{ data: [], data_name: [], data_tag: [] }];
            for (let i = 0; i < doc_pdpa_data.length; i++) {
              var have_data = 0;
              for (let j = 0; j < doc_pdpa_document_page.length; j++) {
                if (doc_pdpa_document_page[j].page_content) {
                  if (
                    doc_pdpa_document_page[j].page_content.search(
                      doc_pdpa_data[i].data_code + ""
                    ) > -1
                  ) {
                    have_data++;
                  }
                }
              }
              if (have_data > 0) {
                data_out[0].data.push({
                  data_id: doc_pdpa_data[i].data_id,
                  data_code: doc_pdpa_data[i].data_code,
                  data_name: doc_pdpa_data[i].data_name,
                  day_start: doc_pdpa_data[i].day_start,
                  day_end: doc_pdpa_data[i].day_end,
                  level_name: doc_pdpa_data[i].level_name,
                  data_type_name: doc_pdpa_data[i].data_type_name,
                });
                data_out[0].data_name.push(doc_pdpa_data[i].data_name);
                data_out[0].data_tag.push(doc_pdpa_data[i].data_tag);
                have_data = 0;
              }
            }
            res.send(data_out);
          });
        }
      );
    });
  }
};

controller.dpo_edit = (req, res) => {
  var data_in = req.body;
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    var user = "";
    if (req.session.acc_id_control) {
      user = req.session.acc_id_control;
    } else {
      user = req.session.userid;
    }
    req.getConnection((err, conn) => {
      var textquery = " UPDATE TB_TR_PDPA_PATTERN SET ";
      textquery += " pattern_dpo_check = 1 ";
      textquery += " , pattern_dpo_check_acc_id = " + user;
      textquery += ' , pattern_dpo_check_date = "' + (data_in.dpo_date + '"');
      textquery +=
        " , dpo_pattern_dpo_approve_process = " +
        data_in.dpo_pattern_dpo_approve_process;
      textquery +=
        " , dpo_pattern_dpo_approve_raw_file_out = " +
        data_in.dpo_pattern_dpo_approve_raw_file_out;
      textquery += "   where pattern_id = " + data_in.pattern_id + " ;";
      conn.query(textquery, (err, data) => {
        res.redirect("/pattern/detail" + data_in.pattern_id);
      });
    });
  }
};

controller.check_measures = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    var user = "";
    if (req.session.acc_id_control) {
      user = req.session.acc_id_control;
    } else {
      user = req.session.userid;
    }
    const data = req.body;
    req.getConnection((err, conn) => {
      conn.query(
        "SELECT *,specifi.specific_id as id_specific,DATE_FORMAT(measures.measures_date,'%Y-%m-%d')  date  FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id WHERE measures.specify_id=3 AND measures.acc_id=? ORDER BY specifi.specific_id DESC",
        [user],
        (err, specific) => {
          conn.query(
            "SELECT TB_TR_PDPA_DOCUMENT .*,TB_MM_PDPA_DOCUMENT_TYPE.doc_type_name as doc_type_name ,count(TB_TR_PDPA_DOCUMENT_PAGE.doc_id) as page FROM TB_TR_PDPA_DOCUMENT join TB_MM_PDPA_DOCUMENT_TYPE on TB_MM_PDPA_DOCUMENT_TYPE.doc_type_id = TB_TR_PDPA_DOCUMENT.doc_type_id join TB_TR_PDPA_DOCUMENT_PAGE on TB_TR_PDPA_DOCUMENT_PAGE.doc_id = TB_TR_PDPA_DOCUMENT.doc_id WHERE  TB_TR_PDPA_DOCUMENT.doc_status = 2 AND doc_action IS NOT TRUE group by  TB_TR_PDPA_DOCUMENT_PAGE.doc_id ;",
            (err, doc_pdpa_document) => {
              let data_set = [];
              let data_set_found = [];
              let doc_id = [];
              let doc_name = [];
              doc_pdpa_document.forEach((element) => {
                doc_id.push(element.doc_id);
                doc_name.push(element.doc_name);
              });
              for (let j = 0; j < data.length; j++) {
                for (let i = 0; i < specific.length; i++) {
                  let arr = specific[i].doc_id.split(",");
                  if (arr.indexOf(String(data[j])) > -1) {
                    data_set.push(specific[i]);
                    data_set_found.push(data[j]);
                  }
                }
              }
              if (data_set.length > 0) {
                res.send({ data_set, data_set_found, doc_pdpa_document });
              } else {
                res.send(JSON.stringify("ไม่มีข้อมูล"));
              }
            }
          );
        }
      );
    });
  }
};

// controller.fetchSpecific = (req, res) => {
//   if (typeof req.session.userid == "undefined") {
//     res.redirect("/");
//   } else {
//     let user = check_user_login(req);
//     const data = req.body;
//     req.getConnection((err, conn) => {
//       conn.query("SELECT *,specifi.specific_id as id_specific,DATE_FORMAT(measures.measures_date,'%Y-%m-%d')  date  FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures  ON specifi.measures_id=measures.measures_id  LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc  ON specifi.event_process_id=prosecc.event_process_id  WHERE measures.specify_id=3  AND measures.acc_id=?  ORDER BY specifi.specific_id DESC",
//         [user], (err, specific) => {
//           let data_set = [];
//           for (let j = 0; j < data.length; j++) {
//             for (let i = 0; i < specific.length; i++) {
//               if (data[j] == specific[i].id_specific) {
//                 data_set.push(specific[i]);
//               }
//             }
//           }
//           if (data_set.length > 0) {
//             res.send({ data_set });
//           } else {
//             res.send(JSON.stringify("ไม่มีข้อมูล"));
//           }
//         }
//       );
//     });
//   }
// };


//  ดึงข้อมูล ผู้ดูแลข้อมูลหรือผู้ดูแลระบบหรือผู้ควบคุมมาตราการ
controller.accountSupervisor = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    req.getConnection((err, conn) => {
      conn.query("SELECT TB_TR_ACCOUNT.acc_id,TB_TR_ACCOUNT.firstname,TB_TR_ACCOUNT.lastname FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5)",
        (err, account) => {
          res.json({ account })
        });
    });
  }
};

//  ดึงข้อมูล มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPA กำหนด (PDPA Specific Measures) ( pattern edit )
controller.patternSpecific = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    const { id } = req.params;
    req.getConnection((err, conn) => {
      conn.query("SELECT *,patternSpecific.specific_id as  specific_id ,DATE_FORMAT(patternSpecific.pattern_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN  AS patternSpecific LEFT JOIN TB_TR_PDPA_EVENT_PROCESS  AS event ON patternSpecific.event_process_id = event.event_process_id WHERE pattern_id=?", [id],
        (err, patternSpecific) => {
          patternSpecific.length > 0 ? res.json({ patternSpecific }) : res.json("ไม่มีข้อมูล");
        });
    });
  }
};




// fetchPatternSpecific
controller.fetchSpecific = (req, res) => {
  if (typeof req.session.userid == "undefined") {
    res.redirect("/");
  } else {
    let user = check_user_login(req);
    const data = req.body;
    req.getConnection((err, conn) => {
      conn.query("SELECT *,specifi.specific_id as id_specific,DATE_FORMAT(measures.measures_date,'%Y-%m-%d')  date  FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures  ON specifi.measures_id=measures.measures_id  LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc  ON specifi.event_process_id=prosecc.event_process_id  WHERE measures.specify_id=3  AND measures.acc_id=?  ORDER BY specifi.specific_id DESC",
        [user], (err, specific) => {
          conn.query("SELECT *,patternSpecific.specific_id as  specific_id ,DATE_FORMAT(patternSpecific.pattern_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN  AS patternSpecific LEFT JOIN TB_TR_PDPA_EVENT_PROCESS  AS event ON patternSpecific.event_process_id = event.event_process_id WHERE pattern_id=?",
            [data.pattern_specific_id], (err, patternSpecific) => {
              let data_set = [];
              let id_specific = data.id_specific
              for (let j = 0; j < id_specific.length; j++) {
                for (let i = 0; i < specific.length; i++) {
                  if (id_specific[j] == specific[i].id_specific) {
                    data_set.push(specific[i]);
                  }
                }
              }
              if (data_set.length > 0) {
                for (let i = 0; i < patternSpecific.length; i++) {
                  let indexToDelete = data_set.findIndex(item => item.id_specific === patternSpecific[i].specific_id);
                  if (indexToDelete > -1) {
                    data_set.splice(indexToDelete, 1);
                    data_set.push({
                      event_process_id: patternSpecific[i].event_process_id,
                      event_process_name: patternSpecific[i].event_process_name,
                      doc_id: patternSpecific[i].pattern_specific_doc_id,
                      measures_date_count: patternSpecific[i].pattern_measures_date_count,
                      measures_section_name: patternSpecific[i].pattern_measures_section_name,
                      measures_supervisor: patternSpecific[i].pattern_measures_supervisor,
                      date: patternSpecific[i].date,
                      id_specific: patternSpecific[i].specific_id,
                      measures_detail: patternSpecific[i].pattern_measures_detail,
                      specific_access_control: patternSpecific[i].pattern_specific_access_control,
                      specific_audit_trails: patternSpecific[i].pattern_specific_audit_trails,
                      specific_privacy_security_awareness: patternSpecific[i].pattern_specific_privacy_security_awareness,
                      specific_user_access_management: patternSpecific[i].pattern_specific_user_access_management,
                      specific_user_responsibilitites: patternSpecific[i].pattern_specific_user_responsibilitites,
                      specific_where_incident_occurs: patternSpecific[i].pattern_specific_where_incident_occurs,

                      specific_access_control_explain: patternSpecific[i].pattern_specific_access_control_explain,
                      specific_audit_trails_explain: patternSpecific[i].pattern_specific_audit_trails_explain,
                      specific_privacy_security_awareness_explain: patternSpecific[i].pattern_specific_privacy_security_awareness_explain,
                      specific_user_access_management_explain: patternSpecific[i].pattern_specific_user_access_management_explain,
                      specific_user_responsibilitites_explain: patternSpecific[i].pattern_specific_user_responsibilitites_explain,
                      specific_where_incident_occurs_explain: patternSpecific[i].pattern_specific_where_incident_occurs_explain,
                    })
                  }

                }
              }
              // if else one line 
              if (data_set.length > 0) {
                res.send({ data_set });
              } else {
                res.send(JSON.stringify("ไม่มีข้อมูล"));
              }
            });
        });

    });
  }
};

module.exports = controller;


