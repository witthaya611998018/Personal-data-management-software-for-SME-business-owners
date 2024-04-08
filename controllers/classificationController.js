const controller = {}
const checkDiskSpace = require('check-disk-space').default
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const Base64 = require('crypto-js/enc-base64');
const sha256 = require('crypto-js/sha256');
const path = require('path');

const funchistory = require('./account_controllers')




function check_user_login(req) {
    let user = ''
    if (req.session.acc_id_control) {
        user = req.session.acc_id_control
    } else {
        user = req.session.userid;
    }
    return user
}


function checkMatch(str, arr, index) {
    if (str.includes(arr[index])) {
        return true
    } else {
        if (arr.length == index) {
            return false
        }
        return checkMatch(str, arr, (index + 1))
    }
}

function checkMatch1(str, arr, index) {
    if (str.includes(arr[index])) {
        return true
    } else {
        if (index == arr.length) {
            if (str.includes(arr[index]) == false) {
                return false
            }
        } else {
            return checkMatch1(str, arr, (index + 1))
        }
    }
}
function convert_date(date) {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (String(month).length == 1) {
        month = "0" + String(month)
    }
    if (String(day).length == 1) {
        day = "0" + String(day)
    }
    return date.getFullYear() + "-" + month + "-" + day
}

// Index Page
controller.index = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/')
    } else {
        // const user = req.session.userid;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        funchistory.funchistory(req, "classification", `เข้าสู่เมนู classification`, req.session.userid)
        req.getConnection((err, conn) => {
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_PATTERN WHERE acc_id=?;', [user], (err, pattern) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_CLASSIFICATION WHERE acc_id=?;', [user], (err, classify) => {
                            conn.query('SELECT * FROM TB_MM_PDPA_PATTERN_PROCESSING_BASE', (err, process) => {
                                conn.query('SELECT * FROM TB_MM_PDPA_CLASSIFICATION_SPECIAL_CONDITIONS', (err, special) => {
                                    let word = []
                                    let word1 = []
                                    for (i in words) {
                                        word.push(words[i].words_id)
                                        word1.push(words[i].words_often)
                                    }
                                    if (err) {
                                        res.json(err)
                                    }
                                    let now = convert_date(new Date());
                                    //let classify_total_start = {"start": classify.map(e => e['classify_create']), "process": classify.map(e => e['classify_period_proccess']), "process_follow_policy": classify.map(e => e['classify_period_proccess_follow_policy']),"process_follow_policy_total": classify.map(e => e['classify_period_proccess_follow_policy_total'])}
                                    //let classify_total_end = {"end": classify.map(e => e['classify_period_end']), "end_follow_pattern": classify.map(e => e['classify_period_end_follow_pattern']), "end_follow_pattern_total": classify.map(e => e['classify_period_end_follow_pattern_total'])}
                                    let start_and_end = ['classify_create', 'classify_period_end']
                                    let classify_start = classify.map(e => start_and_end.map(y => e[y]))
                                    let classify_end = classify_start.map(function (e) {
                                        m = new Date(e[0])
                                        m.setDate(m.getDate() + parseInt(e[1]))
                                        return m
                                    })
                                    let check_used = classify_end.filter(function (item) { return convert_date(new Date(item)) != now })
                                    let convert_use_to_percent = 0
                                    if (check_used.length > 0) {
                                        convert_use_to_percent = (check_used.length / classify.length) * 100
                                    }
                                    checkDiskSpace(path.join(__dirname + './')).then((diskSpace) => {
                                        res.render('./classification/index', {
                                            classify: classify,
                                            used: check_used.length,
                                            percent: convert_use_to_percent,
                                            special: special,
                                            pattern: pattern,
                                            process: process,
                                            checkDiskSpace: diskSpace,
                                            history: history,
                                            words: words,
                                            words1: word,
                                            words2: word1,
                                            session: req.session
                                        })
                                    });
                                })
                            })
                        })
                    })
                })
            })
        });
    }
}
// Send Ajax
controller.getIndexClassification = (req, res) => {

    const get_auth = req.body.value;
    const hash = crypto.createHash('sha256').update(get_auth).digest('base64') //or hex
    if (hash == 'eHzafb3gKD2xPFL/XTqPlnztGeZ9BvBHPZCCrnXUNrI=') {
        if (typeof req.session.userid == 'undefined') {
            res.redirect('/')
        } else {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            req.getConnection((err, conn) => {
                funchistory.check_limit(req)
                conn.query('SELECT classify_id FROM TB_TR_PDPA_CLASSIFICATION ORDER BY classify_id DESC;', (err, id_classify) => {
                    // conn.query("SELECT * FROM TB_TR_PDPA_CLASSIFICATION as pc JOIN TB_TR_PDPA_PATTERN as pp ON pc.pattern_id = pp.pattern_id JOIN TB_TR_PDPA_EVENT_PROCESS as pep ON pc.event_process_id = pep.event_process_id JOIN TB_MM_PDPA_PATTERN_PROCESSING_BASE as pppb ON pc.pattern_processing_base_id = pppb.pattern_processing_base_id JOIN TB_TR_PDPA_DOCUMENT as pd ON pp.doc_id = pd.doc_id JOIN TB_TR_ACCOUNT as pu ON pc.acc_id = pu.acc_id ORDER BY classify_id DESC;", (err, classify) => {
                    conn.query("SELECT *, DATE_FORMAT(pc.classify_create, '%Y-%m-%d %H:%i:%s' ) as classify_create_date FROM TB_TR_PDPA_CLASSIFICATION as pc JOIN TB_TR_PDPA_PATTERN as pp ON pc.pattern_id = pp.pattern_id JOIN TB_TR_PDPA_EVENT_PROCESS as pep ON pc.event_process_id = pep.event_process_id JOIN TB_MM_PDPA_PATTERN_PROCESSING_BASE as pppb ON pc.pattern_processing_base_id = pppb.pattern_processing_base_id JOIN TB_TR_ACCOUNT as pu ON pc.acc_id = pu.acc_id ORDER BY classify_id DESC;", (err, classify) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_DATA', (err, data) => {
                            count = 0
                            var name = []
                            var tag_name = []
                            var label = []
                            var name_except = []
                            var tag_except = []
                            var label_except = []
                            for (i in classify) {
                                classify[i].classify_id = count += 1
                                name.push(classify[i].pattern_name)
                                tag_name.push(classify[i].pattern_tag)
                                label.push(classify[i].pattern_label)
                                name_except.push(classify[i].classify_data_exception_or_unnecessary_filter_name)
                                tag_except.push(classify[i].classify_data_exception_or_unnecessary_filter_tag)
                                label_except.push(classify[i].classify_data_exception_or_unnecessary_filter_label)
                            }
                            // var name_convert = new Array(name.length)
                            // var tag_name_convert = new Array(tag_name.length)
                            // var label_convert = new Array(label.length)
                            // for (i in tag_name) {
                            //     if (name[i] == name_except[i]) {
                            //         name_convert[i] = "ถูกยกเว้น"
                            //     } else {
                            //         name_convert[i] = name[i]
                            //     }
                            //     if (tag_name[i] == tag_except[i] || tag_name[i] != tag_except[i]) {
                            //         var arr_tag = tag_name[i].split(',')
                            //         var arr_tag2 = tag_except[i].split(',')
                            //         var newTag = arr_tag.filter(function (item) { return arr_tag2.indexOf(item) === -1 })
                            //         // or String(Array)
                            //         tag_name_convert[i] = newTag.join(',')
                            //     }
                            //     if (label[i] != label_except[i] || label[i] == label_except[i]) {
                            //         var arr_label = label[i].split(',')
                            //         var arr_label2 = label_except[i].split(',')
                            //         var newLabel = arr_label.filter(function (item) { return arr_label2.indexOf(item) === -1 })
                            //         label_convert[i] = String(newLabel)
                            //     }
                            // }
                            // var data_name_total = []
                            // var data_expect_total = []
                            // for (i in tag_name_convert) {
                            //     var data_name = []
                            //     var data_expect = []
                            //     for (j in data) {
                            //         var data_tag_split = ""
                            //         if (data[j].data_tag != null) {
                            //             if (data[j].data_tag.includes(',')) {
                            //                 data_tag_split = data[j].data_tag.split(',')
                            //             } else {
                            //                 data_tag_split = data[j].data_tag
                            //             }
                            //         }
                            //         if (typeof data_tag_split == "string") {
                            //             if (tag_name_convert[i].includes(data[j].data_tag) == true && tag_except[i].includes(data[j].data_tag) == false) {
                            //                 data_name.push(data[j].data_name)
                            //             } else if (tag_name_convert[i].includes(data[j].data_tag) == false && tag_except[i].includes(data[j].data_tag) == true || (tag_name_convert[i].includes(data[j].data_tag) == true && tag_except[i].includes(data[j].data_tag) == true)) {
                            //                 data_expect.push(data[j].data_name)
                            //             }
                            //         } else {
                            //             if (typeof tag_except[i] == 'string') {
                            //                 var option1 = checkMatch(tag_name_convert[i], data_tag_split, 0)
                            //                 var option2 = checkMatch1(tag_except[i], data_tag_split, 0)
                            //                 if (option1 == true && option2 == false) {
                            //                     data_name.push(data[j].data_name)
                            //                 } else if (option1 == false && option2 == true || (option1 == true && option2 == true)) {
                            //                     data_expect.push(data[j].data_name)
                            //                 }
                            //             }
                            //         }
                            //     }
                            //     data_name_total.push([data_name.join(',')])
                            //     var data_expect_convert = data_expect.filter(function (e) { return e; })
                            //     data_expect_total.push([data_expect_convert.join(',')])
                            // }
                            var classify_data_name = [];
                            if (classify.length > 0) {
                                for (let i = 0; i < classify.length; i++) {
                                    var data_name = [];
                                    var have_data_name = 0;
                                    for (let k = 0; k < data.length; k++) {
                                        if (classify[i].doc_id_person_data_pattern.search((data[k].data_id)) > -1) {
                                            data_name.push(data[k].data_name);
                                            have_data_name++;
                                        }
                                    }
                                    if (have_data_name > 0) {
                                        classify_data_name.push(data_name);
                                    } else {
                                        classify_data_name.push('-');

                                    }
                                    data_name = [];
                                    have_data_name = 0;

                                }

                            }
                            if (err) { res.json(err) } else {
                                // res.json({ id_classify, classify, name_convert, tag_name_convert, label_convert, data_name_total, data_expect_total })
                                res.json({ 'limit': req.session.limit, id_classify, classify, classify_data_name })
                            }
                        })
                    })
                })
            })
        }
    } else {
        console.dir(req.body)
    }
}
controller.getIndexPattern = (req, res) => {
    const get_auth = req.body.value;
    const hash = crypto.createHash('sha256').update(get_auth).digest('base64')
    if (hash == "H/uH8bGV60IRYSsYJg/ZbmCSYfz8SMEZW6BfXp7BLag=") {
        if (typeof req.session.userid == 'undefined') {
            res.redirect('/')
        } else {
            req.getConnection((err, conn) => {
                conn.query('SELECT * FROM doc_pdpa_pattern;', (err, id_pattern) => {
                    // conn.query('SELECT * FROM pdpa_pattern ORDER BY pattern_id ASC;', (err, pattern) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_PATTERN as pp JOIN TB_TR_PDPA_DOCUMENT as pd ON pp.doc_id = pd.doc_id JOIN TB_TR_ACCOUNT as pu ON pp.acc_id = pu.acc_id JOIN TB_MM_PDPA_PATTERN_PROCESSING_BASE as pppb ON pp.pattern_processing_base_id = pppb.pattern_processing_base_id ORDER BY pattern_id ASC;', (err, pattern) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_DATA', (err, data) => {
                            count = 0
                            var tag_name = []
                            for (i in pattern) {
                                pattern[i].pattern_id = count += 1
                                tag_name.push(pattern[i].pattern_tag)
                            }
                            var data_name_total = []
                            for (i in tag_name) {
                                var data_name = []
                                for (j in data) {
                                    var data_tag_split = ""
                                    if (data[j].data_tag != null) {
                                        if (data[j].data_tag.includes(',')) {
                                            data_tag_split = data[j].data_tag.split(',')
                                        } else {
                                            data_tag_split = data[j].data_tag
                                        }
                                    }
                                    if (typeof data_tag_split == "string") {
                                        if (tag_name[i].includes(data[j].data_tag)) {
                                            data_name.push(data[j].data_name)
                                        }
                                    } else {
                                        if (checkMatch(tag_name[i], data_tag_split, 0) == true) {
                                            data_name.push(data[j].data_name)
                                        }
                                    }
                                }
                                data_name_total.push(data_name.join(','))
                            }
                            if (err) { res.json(err) } else {
                                res.json({ pattern, id_pattern, data_name_total })
                            }
                        })
                    })
                })
            })
        }
    } else {
    }
}
controller.selectPattern = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/')
    } else {
        var user = check_user_login(req);
        const get_value = req.body.value;
        const id = req.body.id;
        const event_process_id = req.body.event_process_id;
        const hash = crypto.createHash('sha256').update(get_value).digest('base64')
        if (hash == "CvsH3xR0vhTCmFqAhNy99ZHt3DpxCj8kCjlG2q0V05Q=") {
            req.getConnection((err, conn) => {
                conn.query('SELECT * FROM TB_TR_PDPA_PATTERN WHERE pattern_id = ?', [id], (err, pattern) => {
                    conn.query('SELECT * FROM TB_TR_ACCOUNT', (err, users) => {
                        conn.query("SELECT * FROM  TB_TR_PDPA_EVENT_PROCESS WHERE event_process_id=?  ORDER BY event_process_id DESC ", [event_process_id], (err, process) => {
                            conn.query("SELECT *,patternSpecific.specific_id as  specific_id ,DATE_FORMAT(patternSpecific.pattern_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN  AS patternSpecific LEFT JOIN TB_TR_PDPA_EVENT_PROCESS  AS event ON patternSpecific.event_process_id = event.event_process_id WHERE patternSpecific.pattern_id=? ORDER BY patternSpecific.pattern_specific_id DESC", [id], (err, patternSpecific) => {
                                conn.query("SELECT prosecc.event_process_id as event_process_id,prosecc.event_process_name as event_process_name,specifi.specific_id as specific_id,measures.measures_date_count as pattern_measures_date_count,measures.doc_id as pattern_specific_doc_id,measures.measures_section_name as pattern_measures_section_name,measures.measures_supervisor as  pattern_measures_supervisor,measures.measures_detail as pattern_measures_detail,specifi.specific_access_control as pattern_specific_access_control,specifi.specific_audit_trails as  pattern_specific_audit_trails,specifi.specific_privacy_security_awareness as  pattern_specific_privacy_security_awareness,specifi.specific_user_access_management as pattern_specific_user_access_management,specifi.specific_user_responsibilitites as  pattern_specific_user_responsibilitites,specifi.specific_where_incident_occurs as  pattern_specific_where_incident_occurs,specifi.specific_access_control_explain as pattern_specific_access_control_explain,specifi.specific_audit_trails_explain as pattern_specific_audit_trails_explain,specifi.specific_privacy_security_awareness_explain as pattern_specific_privacy_security_awareness_explain,specifi.specific_user_access_management_explain as  pattern_specific_user_access_management_explain,specifi.specific_user_responsibilitites_explain as  pattern_specific_user_responsibilitites_explain,specifi.specific_where_incident_occurs_explain as  pattern_specific_where_incident_occurs_explain,DATE_FORMAT(measures.measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id WHERE measures.specify_id = 3 AND measures.acc_id = ? ORDER BY specifi.specific_id DESC",
                                    [user], (err, specificAll) => {
                                        conn.query("SELECT TB_TR_ACCOUNT.acc_id,TB_TR_ACCOUNT.firstname,TB_TR_ACCOUNT.lastname FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5)", (err, account) => {
                                            if (err) { res.json(err) } else {
                                                let total_users = pattern[0].pattern_processor_inside_id.split(',')
                                                let total_name = ""
                                                if (typeof total_users != 'object') {
                                                    total_name = users.filter(function (item) { return item.user_id == total_users })
                                                } else {
                                                    total_name = users.filter(function (item) { return total_users.toString().indexOf(item.acc_id) != -1 })
                                                }
                                                let total_users1 = pattern[0].pattern_processor_outside_id.split(',')
                                                let total_name1 = ""
                                                if (typeof total_users1 != 'object') {
                                                    total_name1 = users.filter(function (item) { return item.user_id == total_users })
                                                } else {
                                                    total_name1 = users.filter(function (item) { return total_users1.toString().indexOf(item.acc_id) != -1 })
                                                }
                                                let _map_ = ['firstname', 'lastname']
                                                let total_name_inside = total_name.map(o => _map_.map(k => o[k]))
                                                let total_name_outside = total_name1.map(o => _map_.map(k => o[k]))
                                                let data_name_total = pattern[0].pattern_tag.split(',')

                                                let newSpecific = []
                                                if (process.length > 0 && process[0].specific_id != null) {
                                                    let specificID = process[0].specific_id.split(',').map((tiems) => { return parseInt(tiems) });
                                                    specificAll.forEach(element => {
                                                        if (specificID.indexOf(element.specific_id) > -1) {
                                                            newSpecific.push(element)
                                                        }
                                                    });
                                                }
                                                if (newSpecific.length > 0) {
                                                    let arryID = patternSpecific.map(items => { return items.specific_id })
                                                    // หา ข้อมูลไม่ซ่ำระหว่าง มาตราการใน pattern กับ  EVENT_PROCESS ที่เลือกจาก กิจกรรมการประมวลผล
                                                    newSpecific.forEach(element => {
                                                        if (arryID.indexOf(element.specific_id) < 0) {
                                                            patternSpecific.push(element)
                                                        }
                                                    });
                                                }


                                                // console.log("tag", tag);
                                                // console.log("test", pattern[0].pattern_tag == '' || pattern[0].pattern_tag === null);

                                                // let data_name_total = new Array(data.data_tag)
                                                // console.log(data);
                                                // let data_name_total = data.filter(function (e) {
                                                //     let list = e.data_tag.split(',')
                                                //     console.log(list);
                                                //     let _true_ = list.filter(function (item) {
                                                //         console.log("item", item);
                                                //         return tag.includes(item)
                                                //     })
                                                //     console.log("_true_", _true_);
                                                //     if (_true_.length > 0) {
                                                //         console.log("return", e);
                                                //         return e
                                                //     }

                                                // })
                                                // if (pattern[0].pattern_tag == '' || pattern[0].pattern_tag === null) {

                                                // }

                                                // if (specific.length <= 0 || specific.length == "") {
                                                //     specific = "ไม่มีข้อมูล"
                                                // }
                                                // if (doc.length <= 0 || doc.length == "") {
                                                //     doc = "ไม่มีข้อมูล"
                                                // }

                                                // if (specific_classification.length <= 0 || specific_classification.length == "") {
                                                //     specific_classification = "ไม่มีข้อมูล"
                                                // }

                                                patternSpecific = patternSpecific.length > 0 ? patternSpecific : "ไม่มีข้อมูล"

                                                res.json({
                                                    pattern,
                                                    total_name_inside,
                                                    total_name_outside,
                                                    data_name_total,
                                                    patternSpecific,
                                                    account
                                                })
                                            }
                                        })
                                    })
                            })
                        })
                    })
                })
            })
        } else {
        }
    }
}
controller.addEventProcess = (req, res) => {
    const get_value = req.body.value
    const hash = crypto.createHash('sha256').update(get_value).digest('base64')
    if (hash == "gl76BkX3pTWsHPg3ehBXlCm1JkCSwTpnwWOGaudvsTA=") {
        if (typeof req.session.userid == 'undefined') {
            res.redirect('/')
        } else {
            req.getConnection((err, conn) => {
                conn.query('SELECT event_process_id FROM TB_TR_PDPA_EVENT_PROCESS', (err, id_event) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_EVENT_PROCESS', (err, event) => {
                        for (var i = 0; i < event.length; i++) {
                            event[i].event_process_id = (i + 1)
                        }
                        if (err) { res.json(err) } else {
                            res.json({ id_event, event })
                        }
                    })
                })
            })
        }
    } else {
        console.dir(req.body)
    }
}
controller.selectEventProcess = async (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/')
    } else {
        const get_value = req.body.value
        const id = req.body.id
        const pattern_specific_id = req.body.pattern_specific_id
        // console.log("pattern_specific_id", pattern_specific_id);
        // console.log("id", id);

        // const hash = crypto.createHash('sha256').update(get_value).digest('base64')
        var user = check_user_login(req)
        // if (hash == "xgDoEl3WL3koDnlkwFApFmkOaitV9aJ4AxUQj1fQC6M=") {
        req.getConnection((err, conn) => {

            // conn.query('SELECT *,DATE_FORMAT(measures_date,"%Y-%m-%d") as date_measures FROM TB_TR_MEASURES as ms left join TB_TR_MEASURES_TYPE as m_type on ms.measures_type_id=m_type.measures_type_id  WHERE acc_id=? AND specify_id=1', [user], (err, measures) => {
            // conn.query('SELECT *,DATE_FORMAT(measures.measures_date,"%Y-%m-%d") as date_measures FROM TB_TR_MEASURES_RISK_BASED_APPROACH AS approach LEFT JOIN TB_TR_MEASURES AS measures ON approach.measures_id=measures.measures_id LEFT JOIN TB_TR_INFORMATION_ASSETS as assets ON approach.assets_id=assets.assets_id  WHERE measures.acc_id=? and measures.specify_id=2', [user], (err, approach) => {
            // conn.query("SELECT *,specifi.specific_id as pdpa_specific,DATE_FORMAT(measures.measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id  WHERE measures.specify_id=3 AND measures.acc_id=? AND specifi.event_process_id=? ORDER BY specifi.specific_id DESC", [user, id], (err, specific) => {

            // conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE  doc_status=2 AND  type !=3 AND doc_action =0 AND  user_id=?", [user], (err, doc) => {
            //     conn.query("SELECT * FROM  TB_TR_MEASURES_TYPE ORDER BY measures_type_id DESC ", (err, measures_type) => {
            //         conn.query("SELECT * FROM  TB_TR_DEFENSE_IN_DEPTH WHERE acc_id=? ORDER BY depth_id DESC ", [user], (err, depth) => {
            //             conn.query("SELECT * FROM  TB_TR_INFORMATION_ASSETS WHERE acc_id=?  ORDER BY assets_id DESC ", [user], (err, assets) => {
            // conn.query('SELECT *,DATE_FORMAT(classification_measures_date,"%Y-%m-%d") as date_measures FROM TB_TR_MEASURES_CLASSIFICATION as mea_class LEFT JOIN  TB_TR_PDPA_CLASSIFICATION as class ON mea_class.classify_id=class.classify_id LEFT JOIN TB_TR_MEASURES_TYPE AS type_mea ON mea_class.measures_type_id=type_mea.measures_type_id  WHERE mea_class.classify_id= ? and class.event_process_id=?', [id_classify, id], (err, measures_classcific) => {
            // conn.query("SELECT *,DATE_FORMAT(classification_measures_date,'%Y-%m-%d') as date_measures FROM TB_TR_MEASURES_RISK_BASED_APPROACH_CLASSIFICATION AS app_class LEFT JOIN TB_TR_PDPA_CLASSIFICATION as class ON app_class.classify_id=class.classify_id LEFT JOIN TB_TR_INFORMATION_ASSETS as assets ON app_class.assets_id=assets.assets_id WHERE app_class.classify_id=? AND classification_approach_heading_risk_based=1 AND class.event_process_id=?", [id_classify, id], (err, approach_classcific_type_1) => {
            //     conn.query("SELECT *,DATE_FORMAT(classification_measures_date,'%Y-%m-%d') as date_measures FROM TB_TR_MEASURES_RISK_BASED_APPROACH_CLASSIFICATION AS app_class LEFT JOIN TB_TR_PDPA_CLASSIFICATION as class ON app_class.classify_id=class.classify_id LEFT JOIN TB_TR_INFORMATION_ASSETS as assets ON app_class.assets_id=assets.assets_id WHERE app_class.classify_id=? AND classification_approach_heading_risk_based=2 AND class.event_process_id=?", [id_classify, id], (err, approach_classcific_type_2) => {
            //         conn.query('SELECT *,DATE_FORMAT(specific_class.classification_measures_date,"%Y-%m-%d") as date_measures FROM TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION AS specific_class LEFT JOIN TB_TR_PDPA_CLASSIFICATION as class  ON specific_class.classify_id=class.classify_id left join TB_TR_PDPA_EVENT_PROCESS as event ON class.event_process_id=event.event_process_id  WHERE specific_class.classify_id=? AND class.event_process_id=?', [id_classify, id], (err, specific_classification) => {

            conn.query('SELECT * FROM TB_TR_PDPA_EVENT_PROCESS WHERE event_process_id = ? ORDER BY  event_process_id DESC ', [id], (err, event) => {
                conn.query("SELECT *,patternSpecific.specific_id as  specific_id ,DATE_FORMAT(patternSpecific.pattern_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN  AS patternSpecific LEFT JOIN TB_TR_PDPA_EVENT_PROCESS  AS event ON patternSpecific.event_process_id = event.event_process_id WHERE patternSpecific.pattern_id=? ORDER BY patternSpecific.pattern_specific_id DESC", [pattern_specific_id], (err, patternSpecific) => {
                    conn.query("SELECT prosecc.event_process_id as event_process_id,prosecc.event_process_name as event_process_name,specifi.specific_id as specific_id,measures.measures_date_count as pattern_measures_date_count,measures.doc_id as pattern_specific_doc_id,measures.measures_section_name as pattern_measures_section_name,measures.measures_supervisor as  pattern_measures_supervisor,measures.measures_detail as pattern_measures_detail,specifi.specific_access_control as pattern_specific_access_control,specifi.specific_audit_trails as  pattern_specific_audit_trails,specifi.specific_privacy_security_awareness as  pattern_specific_privacy_security_awareness,specifi.specific_user_access_management as pattern_specific_user_access_management,specifi.specific_user_responsibilitites as  pattern_specific_user_responsibilitites,specifi.specific_where_incident_occurs as  pattern_specific_where_incident_occurs,specifi.specific_access_control_explain as pattern_specific_access_control_explain,specifi.specific_audit_trails_explain as pattern_specific_audit_trails_explain,specifi.specific_privacy_security_awareness_explain as pattern_specific_privacy_security_awareness_explain,specifi.specific_user_access_management_explain as  pattern_specific_user_access_management_explain,specifi.specific_user_responsibilitites_explain as  pattern_specific_user_responsibilitites_explain,specifi.specific_where_incident_occurs_explain as  pattern_specific_where_incident_occurs_explain,DATE_FORMAT(measures.measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id WHERE measures.specify_id = 3 AND measures.acc_id = ? ORDER BY specifi.specific_id DESC", [user], (err, specificAll) => {

                        let newSpecific = []
                        if (event.length > 0 && event[0].specific_id != null) {
                            let specificID = event[0].specific_id.split(',').map((tiems) => { return parseInt(tiems) });
                            specificAll.forEach(element => {
                                if (specificID.indexOf(element.specific_id) > -1) {
                                    newSpecific.push(element)
                                }
                            });
                        }
                        if (patternSpecific.length > 0) {
                            let arryID = patternSpecific.map(items => { return items.specific_id })
                            // หา ข้อมูลไม่ซ่ำระหว่าง มาตราการใน pattern กับ  EVENT_PROCESS ที่เลือกจาก กิจกรรมการประมวลผล
                            newSpecific.forEach(element => {
                                if (arryID.indexOf(element.specific_id) < 0) {
                                    patternSpecific.push(element)
                                }
                            });
                            res.json({ specific: patternSpecific, event })
                        } else {
                            newSpecific = newSpecific.length > 0 ? newSpecific : "ไม่มีข้อมูล"
                            res.json({ specific: newSpecific, event })
                        }


                        // console.log("newData", newData);
                        // console.log("specific", specific);

                        // specific.forEach(element => {
                        //     newData.push({
                        //         'event_process_id': element.event_process_id,
                        //         'event_process_name': element.event_process_name,
                        //         'pattern_specific_doc_id': element.doc_id,
                        //         'pattern_measures_date_count': element.measures_date_count,
                        //         'pattern_measures_section_name': element.measures_section_name,
                        //         'pattern_measures_supervisor': element.measures_supervisor,
                        //         'pattern_measures_detail': element.measures_detail,

                        //         'date': element.date,
                        //         'specific_id': element.pdpa_specific,
                        //         'pattern_specific_access_control': element.specific_access_control,
                        //         'pattern_specific_audit_trails': element.specific_audit_trails,
                        //         'pattern_specific_privacy_security_awareness': element.specific_privacy_security_awareness,
                        //         'pattern_specific_user_access_management': element.specific_user_access_management,
                        //         'pattern_specific_user_responsibilitites': element.specific_user_responsibilitites,
                        //         'pattern_specific_where_incident_occurs': element.specific_where_incident_occurs,
                        //         'pattern_specific_access_control_explain': element.specific_access_control_explain,
                        //         'pattern_specific_audit_trails_explain': element.specific_audit_trails_explain,
                        //         'pattern_specific_privacy_security_awareness_explain': element.specific_privacy_security_awareness_explain,
                        //         'pattern_specific_user_access_management_explain': element.specific_user_access_management_explain,
                        //         'pattern_specific_user_responsibilitites_explain': element.specific_user_responsibilitites_explain,
                        //         'pattern_specific_where_incident_occurs_explain': element.specific_where_incident_occurs_explain,
                        //     })
                        // });
                        // if (measures.length <= 0 || measures.length == "") {
                        //     measures = "ไม่มีข้อมูล"
                        // }
                        // if (doc.length <= 0 || doc.length == "") {
                        //     doc = "ไม่มีข้อมูล"
                        // }
                        // if (depth.length <= 0 || depth.length == "") {
                        //     depth = "ไม่มีข้อมูล"
                        // }
                        // if (assets.length <= 0 || depth.length == "") {
                        //     assets = "ไม่มีข้อมูล"
                        // }
                        // if (approach.length <= 0 || approach.length == "") {
                        //     approach = "ไม่มีข้อมูล"
                        // }
                        // if (measures_type.length <= 0 || measures_type.length == "") {
                        //     measures_type = "ไม่มีข้อมูล"
                        // }
                        // if (measures_classcific.length <= 0 || measures_classcific.length == "") {
                        //     measures_classcific = "ไม่มีข้อมูล"
                        // }
                        // if (approach_classcific_type_1.length <= 0 || approach_classcific_type_1.length == "") {
                        //     approach_classcific_type_1 = "ไม่มีข้อมูล"
                        // }
                        // if (approach_classcific_type_2.length <= 0 || approach_classcific_type_2.length == "") {
                        //     approach_classcific_type_2 = "ไม่มีข้อมูล"
                        // }

                        // if (specific_classification.length <= 0 || specific_classification.length == "") {
                        //     specific_classification = "ไม่มีข้อมูล"
                        // }
                        // res.json({ specific, event, measures, approach, doc, measures_type, depth, assets, measures_classcific, approach_classcific_type_1, approach_classcific_type_2, specific_classification })
                        //                                     })
                        //                                 })
                        //                             })
                        //                         })
                        //                     })
                        //                 })
                        //             })
                        //         })
                        //     })
                        // })

                    });
                })
            })
        })
    }
}
controller.addUsers = (req, res) => {
    const get_value = req.body.value;
    const hash = crypto.createHash('sha256').update(get_value).digest('base64')
    if (hash == "ZUjLQnBPqdQD3ZKOtUfP/86euzuY7SJ2B919d+8S8fE=") {
        if (typeof req.session.userid == 'undefined') {
            res.redirect('/')
        } else {
            req.getConnection((err, conn) => {
                conn.query('SELECT acc_id FROM TB_TR_ACCOUNT', (err, id_users) => {
                    conn.query('SELECT * FROM TB_TR_ACCOUNT', (err, users) => {
                        for (var i = 0; i < users.length; i++) {
                            users[i].acc_id = (i + 1)
                        }
                        if (err) { res.json(err) } else {
                            res.json({ id_users, users })
                        }
                    })
                })
            })
        }
    } else {
        console.dir(req.body)
    }
}
controller.selectUser = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/')
    } else {
        const get_value = req.body.value
        const id = req.body.id
        const hash = crypto.createHash('sha256').update(get_value).digest('base64')
        if (hash == "LsOV7c539EZd3c5dfBpZx0yBwRjxU02YAGr7zXuQe74=") {
            req.getConnection((err, conn) => {
                conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE acc_id = ?', [id], (err, user) => {
                    if (err) { res.json(err) } else {
                        res.json(user)
                    }
                })
            })
        } else {
        }
    }
}
controller.InsertEventProcess = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/')
    } else {
        const body = req.body;
        req.getConnection((err, conn) => {
            conn.query('INSERT INTO TB_MM_PDPA_CLASSIFICATION_SPECIAL_CONDITIONS SET ?;', [body], (err, pass) => {
                if (err) { res.json(err) } else { res.json('success') }
            })
        })
    }
}
controller.getClassification = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect('/')
    } else {
        const id = req.body.id
        const get_value = req.body.value
        const hash = crypto.createHash('sha256').update(get_value).digest('base64')
        if (hash == "FKZT43i08dGly9mX5c+DHjk/MN5TPGFwFg05tMktNss=") {
            req.getConnection((err, conn) => {
                conn.query('SELECT *, DATE_FORMAT(pc.classify_create, "%d/%m/%Y %H:%i:%s" ) as classify_create_date FROM TB_TR_PDPA_CLASSIFICATION as pc JOIN TB_TR_ACCOUNT as pu ON pc.acc_id = pu.acc_id JOIN TB_TR_PDPA_PATTERN as pp ON pc.pattern_id = pp.pattern_id WHERE classify_id = ?;', [id], (err, classify) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_DATA;', (err, data) => {
                        // count = 0
                        // var name = []
                        // var tag_name = []
                        // var label = []
                        // var name_except = []
                        // var tag_except = []
                        // var label_except = []
                        // for (i in classify) {
                        //     classify[i].classify_id = (count += 1);
                        //     name.push(classify[i].pattern_name)
                        //     tag_name.push(classify[i].pattern_tag)
                        //     label.push(classify[i].pattern_label)
                        //     name_except.push(classify[i].classify_data_exception_or_unnecessary_filter_name)
                        //     tag_except.push(classify[i].classify_data_exception_or_unnecessary_filter_tag)
                        //     label_except.push(classify[i].classify_data_exception_or_unnecessary_filter_label)
                        // }
                        // var name_convert = new Array(name.length)
                        // var tag_name_convert = new Array(tag_name.length)
                        // var label_convert = new Array(label.length)
                        // for (i in tag_name) {
                        //     if (name[i] == name_except[i]) {
                        //         name_convert[i] = "ถูกยกเว้น"
                        //     } else {
                        //         name_convert[i] = name[i]
                        //     }
                        //     if (tag_name[i] == tag_except[i] || tag_name[i] != tag_except[i]) {
                        //         var arr_tag = tag_name[i].split(',')
                        //         var arr_tag2 = tag_except[i].split(',')
                        //         var newTag = arr_tag.filter(function (item) { return arr_tag2.indexOf(item) === -1 })
                        //         // or String(Array)
                        //         tag_name_convert[i] = newTag.join(',')
                        //     }
                        //     if (label[i] != label_except[i] || label[i] == label_except[i]) {
                        //         var arr_label = label[i].split(',')
                        //         var arr_label2 = label_except[i].split(',')
                        //         var newLabel = arr_label.filter(function (item) { return arr_label2.indexOf(item) === -1 })
                        //         label_convert[i] = String(newLabel)
                        //     }
                        // }
                        // var data_name_total = []
                        // var data_expect_total = []
                        // for (i in tag_name_convert) {
                        //     var data_name = []
                        //     var data_expect = []
                        //     for (j in data) {
                        //         var data_tag_split = ""
                        //         if (data[j].data_tag != null) {
                        //             if (data[j].data_tag.includes(',')) {
                        //                 data_tag_split = data[j].data_tag.split(',')
                        //             } else {
                        //                 data_tag_split = data[j].data_tag
                        //             }
                        //         }
                        //         if (typeof data_tag_split == "string") {
                        //             if (tag_name_convert[i].includes(data[j].data_tag) == true && tag_except[i].includes(data[j].data_tag) == false) {
                        //                 data_name.push(data[j].data_name)
                        //             } else if (tag_name_convert[i].includes(data[j].data_tag) == false && tag_except[i].includes(data[j].data_tag) == true || (tag_name_convert[i].includes(data[j].data_tag) == true && tag_except[i].includes(data[j].data_tag) == true)) {
                        //                 data_expect.push(data[j].data_name)
                        //             }
                        //         } else {
                        //             if (typeof tag_except[i] == 'string') {
                        //                 var option1 = checkMatch(tag_name_convert[i], data_tag_split, 0)
                        //                 var option2 = checkMatch1(tag_except[i], data_tag_split, 0)
                        //                 if (option1 == true && option2 == false) {
                        //                     data_name.push(data[j].data_name)
                        //                 } else if (option1 == false && option2 == true || (option1 == true && option2 == true)) {
                        //                     data_expect.push(data[j].data_name)
                        //                 }
                        //             }
                        //         }
                        //     }
                        //     data_name_total.push([data_name.join(',')])
                        //     var data_expect_convert = data_expect.filter(function (e) { return e; })
                        //     data_expect_total.push([data_expect_convert.join(',')])
                        // }
                        var classify_data_name = [];
                        if (classify.length > 0) {
                            for (let i = 0; i < classify.length; i++) {
                                var data_name = [];
                                var have_data_name = 0;
                                for (let k = 0; k < data.length; k++) {
                                    if (classify[i].doc_id_person_data_pattern.search((data[k].data_id)) > -1) {
                                        data_name.push(data[k].data_name);
                                        have_data_name++;
                                    }
                                }
                                if (have_data_name > 0) {
                                    classify_data_name.push(data_name);
                                } else {
                                    classify_data_name.push('-');

                                }
                                data_name = [];
                                have_data_name = 0;

                            }

                        }

                        if (err) { res.json(err) } else {
                            res.json({ classify, classify_data_name })
                        }
                    })
                })
            })
        } else {
        }
    }
}
controller.selectShowClassify = (req, res) => { // New and add controller hide here
    if (typeof req.session.userid == 'undefined') { res.redirect('/') } else {
        const value = req.body.value;
        const hash = crypto.createHash('sha256').update(value).digest('base64');
        if (hash == "GBvTZiEXoVXY386nogaiFsmsuPnEhHEk132sAHBUNNM=") {
            req.getConnection((err, conn) => {
                conn.query('SELECT * FROM TB_TR_PDPA_CLASSIFICATION;', (err, classify) => {
                    if (err) { res.json(err) } else {
                        res.json(classify)
                    }
                })
            })
        } else {
        }
    }
}
controller.listEventProcess = (req, res) => {
    if (typeof req.session.userid == "undefined") { res.redirect('/') } else {
        let getValue = req.body.value;
        let hash = Base64.stringify(sha256(getValue));
        if (hash == "WhuJb2tqY2mt6gi2681vhgY0uOcoLh/VhKl4iO+NlU4=") {
            req.getConnection((err, conn) => {
                conn.query('SELECT event_process_id FROM TB_TR_PDPA_EVENT_PROCESS;', (err, id_event) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_EVENT_PROCESS;', (err, event) => {
                        if (err) { res.json(err) } else {
                            for (i in event) {
                                event[i].event_process_id = parseInt(i) + 1
                            }
                            res.json({ event, id_event })
                        }
                    })
                })
            })
        } else {
        }
    }
}
controller.selectEventProcess1 = (req, res) => {
    if (typeof req.session.userid == "undefined") { res.redirect('/') } else {
        const getValue = req.body.value;
        const hash = Base64.stringify(sha256(getValue));
        if (hash == "G34A1Pm6gbIiKcty1+gGIr9U1lQeYPsRpC3oupClXFk=") {
            req.getConnection((err, conn) => {
                conn.query('SELECT * FROM TB_TR_PDPA_EVENT_PROCESS WHERE event_process_id = ?;', [req.body.id], (err, event) => {
                    if (err) { res.json(err) } else { res.json(event) }
                })
            })
        } else {
        }
    }
}
// New classify page
controller.newClassification = (req, res) => {
    if (typeof req.session.userid == 'undefined') { res.redirect('/') } else {
        // const user = req.session.userid;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_ACCOUNT;", (err, account) => {

                conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                    conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_EVENT_PROCESS;', (err, event) => {
                            conn.query("SELECT * FROM TB_MM_PDPA_CLASSIFICATION_SPECIAL_CONDITIONS;", (err, special) => {
                                conn.query('SELECT * FROM TB_MM_PDPA_PATTERN_PROCESSING_BASE;', (err, process) => {
                                    let word = []
                                    let word1 = []
                                    for (i in words) {
                                        word.push(words[i].words_id)
                                        word1.push(words[i].words_often)
                                    }
                                    if (err) { res.json(err) } else {
                                        res.render('./classification/classification_new', {
                                            account: account,
                                            process: process,
                                            event: event,
                                            special: special,
                                            history: history,
                                            words: words,
                                            words1: word,
                                            words2: word1,
                                            session: req.session
                                        })
                                    }
                                })
                            })
                        })
                    })
                })
            })
        })
    }
}

function insertSpecificOnClaascifi(IDunique, idPattern, IDclasscifi, req) { // กรณีที่ไม่มีการเเก้ไขมาตราการหรือว่าเเก้ไขเเล้วเเต่มีบางมาตราการที่ไม่ได้เเก้ไข
    let user = req.session.acc_id_control ? req.session.acc_id_control : req.session.userid;
    req.getConnection((err, conn) => {
        IDunique.forEach(element => {
            conn.query("SELECT *,specifi.specific_id as id_specific,DATE_FORMAT(measures.measures_date,'%Y-%m-%d')  date  FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures  ON specifi.measures_id=measures.measures_id  LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc  ON specifi.event_process_id=prosecc.event_process_id  WHERE measures.specify_id=3  AND measures.acc_id=? AND specifi.specific_id=?  ORDER BY specifi.specific_id DESC",
                [user, element], (err, specific) => {
                    conn.query("SELECT *,patternSpecific.specific_id as  specific_id ,DATE_FORMAT(patternSpecific.pattern_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN  AS patternSpecific LEFT JOIN TB_TR_PDPA_EVENT_PROCESS  AS event ON patternSpecific.event_process_id = event.event_process_id WHERE patternSpecific.pattern_id = ? AND patternSpecific.specific_id=? ORDER BY patternSpecific.pattern_specific_id DESC",
                        [idPattern, element], (err, specificOnPattern) => {
                            if (specificOnPattern.length > 0) {
                                conn.query(`INSERT INTO TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION SET specific_id=?,pattern_id=?,doc_id=?,classification_measures_detail=?,classification_measures_supervisor=?,
                                    classification_measures_date=?,
                                    classification_measures_date_count=?,
                                    classification_measures_section_name=?,
                                    classification_specific_access_control=?, 
                                    classification_specific_user_access_management=?,
                                    classification_specific_user_responsibilitites=?,
                                    classification_specific_audit_trails=?,
                                    classification_specific_privacy_security_awareness=?,
                                    classification_specific_where_incident_occurs=?,
                                    classification_specific_access_control_explain=?,
                                    classification_specific_user_access_management_explain=?,
                                    classification_specific_user_responsibilitites_explain=?,
                                    classification_specific_audit_trails_explain=?,
                                    classification_specific_privacy_security_awareness_explain=?,
                                    classification_specific_where_incident_occurs_explain=?,
                                     event_process_id=?,classify_id=?`,
                                    [specificOnPattern[0].specific_id, idPattern,
                                    specificOnPattern[0].pattern_specific_doc_id.toString(),
                                    specificOnPattern[0].pattern_measures_detail,
                                    specificOnPattern[0].pattern_measures_supervisor.toString(),
                                    specificOnPattern[0].pattern_measures_date,
                                    specificOnPattern[0].pattern_measures_date_count,
                                    specificOnPattern[0].pattern_measures_section_name,
                                    specificOnPattern[0].pattern_specific_access_control,
                                    specificOnPattern[0].pattern_specific_user_access_management,
                                    specificOnPattern[0].pattern_specific_user_responsibilitites,
                                    specificOnPattern[0].pattern_specific_audit_trails,
                                    specificOnPattern[0].pattern_specific_privacy_security_awareness,
                                    specificOnPattern[0].pattern_specific_where_incident_occurs,
                                    specificOnPattern[0].pattern_specific_access_control_explain,
                                    specificOnPattern[0].pattern_specific_user_access_management_explain,
                                    specificOnPattern[0].pattern_specific_user_responsibilitites_explain,
                                    specificOnPattern[0].pattern_specific_audit_trails_explain,
                                    specificOnPattern[0].pattern_specific_privacy_security_awareness_explain,
                                    specificOnPattern[0].pattern_specific_where_incident_occurs_explain,
                                    specificOnPattern[0].event_process_id, IDclasscifi
                                    ], (err_class, inserSpecificONclasscifi) => {
                                        if (err_class) { console.log(err_class) }
                                    })
                            } else {
                                conn.query(`INSERT INTO TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION SET specific_id=?,pattern_id=?,doc_id=?,classification_measures_detail=?,classification_measures_supervisor=?,
                                    classification_measures_date=?,
                                    classification_measures_date_count=?,
                                    classification_measures_section_name=?,
                                    classification_specific_access_control=?, 
                                    classification_specific_user_access_management=?,
                                    classification_specific_user_responsibilitites=?,
                                    classification_specific_audit_trails=?,
                                    classification_specific_privacy_security_awareness=?,
                                    classification_specific_where_incident_occurs=?,
                                    classification_specific_access_control_explain=?,
                                    classification_specific_user_access_management_explain=?,
                                    classification_specific_user_responsibilitites_explain=?,
                                    classification_specific_audit_trails_explain=?,
                                    classification_specific_privacy_security_awareness_explain=?,
                                    classification_specific_where_incident_occurs_explain=?,
                                     event_process_id=?,classify_id=?`,
                                    [specific[0].id_specific, idPattern,
                                    specific[0].doc_id.toString(),
                                    specific[0].measures_detail,
                                    specific[0].measures_supervisor.toString(),
                                    specific[0].measures_date,
                                    specific[0].measures_date_count,
                                    specific[0].measures_section_name,
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
                                    specific[0].specific_where_incident_occurs_explain,
                                    specific[0].event_process_id, IDclasscifi
                                    ], (err_class, inserSpecificONclasscifi) => {
                                        if (err_class) { console.log(err_class) }
                                    })
                            }
                        });
                });
        });
    });
}



// Add Classification //edit hide here
controller.addClassification = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/')
    } else {


        var classify_name = req.body.classify_name_part1 + " (" + req.body.classify_name_part2 + ")";

        const _classify_user_access_info_process_inside_ = req.body.classify_user_access_info_process_inside
        var classify_user_access_info_process_inside = ""
        if (typeof _classify_user_access_info_process_inside_ == "undefined") {
            classify_user_access_info_process_inside = "0"
        } else {
            classify_user_access_info_process_inside = "1"
        }
        const _classify_user_access_info_process_outside_ = req.body.classify_user_access_info_process_outside
        var classify_user_access_info_process_outside = ""
        if (typeof _classify_user_access_info_process_outside_ == 'undefined') {
            classify_user_access_info_process_outside = "0"
        } else {
            classify_user_access_info_process_outside = '1'
        }
        const _classify_period_proccess_follow_policy_ = req.body.classify_period_proccess_follow_policy
        var classify_period_proccess_follow_policy = ""
        if (typeof _classify_period_proccess_follow_policy_ == "undefined") {
            classify_period_proccess_follow_policy = "0"
        } else {
            classify_period_proccess_follow_policy = "1"
        }
        const _classify_period_end_follow_pattern_ = req.body.classify_period_end_follow_pattern
        var classify_period_end_follow_pattern = ""
        if (typeof _classify_period_end_follow_pattern_ == "undefined") {
            classify_period_end_follow_pattern = "0"
        } else {
            classify_period_end_follow_pattern = "1"
        }
        const _classify_type_data_in_event_personal_ = req.body.classify_type_data_in_event_personal
        var classify_type_data_in_event_personal = ""
        if (typeof _classify_type_data_in_event_personal_ == "undefined") {
            classify_type_data_in_event_personal = "0"
        } else {
            classify_type_data_in_event_personal = "1"
        }
        const _classify_type_data_in_event_special_personal_sensitive_ = req.body.classify_type_data_in_event_special_personal_sensitive
        var classify_type_data_in_event_special_personal_sensitive = ""
        if (typeof _classify_type_data_in_event_special_personal_sensitive_ == "undefined") {
            classify_type_data_in_event_special_personal_sensitive = "0"
        } else {
            classify_type_data_in_event_special_personal_sensitive = "1"
        }
        const _classify_protect_data_limit_follow_datetime_ = req.body.classify_protect_data_limit_follow_datetime
        var classify_protect_data_limit_follow_datetime = ""
        if (typeof _classify_protect_data_limit_follow_datetime_ == "undefined") {
            classify_protect_data_limit_follow_datetime = "0"
        } else {
            classify_protect_data_limit_follow_datetime = "1"
        }
        const _classify_approach_protect_used_two_factor_from_google_authen_ = req.body.classify_approach_protect_used_two_factor_from_google_authen
        var classify_approach_protect_used_two_factor_from_google_authen = ""
        if (typeof _classify_approach_protect_used_two_factor_from_google_authen_ == 'undefined') {
            classify_approach_protect_used_two_factor_from_google_authen = "0"
        } else {
            classify_approach_protect_used_two_factor_from_google_authen = "1"
        }
        const _classify_approach_protect_used_two_factor_from_email_ = req.body.classify_approach_protect_used_two_factor_from_email
        var classify_approach_protect_used_two_factor_from_email = ""
        if (typeof _classify_approach_protect_used_two_factor_from_email_ == "undefined") {
            classify_approach_protect_used_two_factor_from_email = "0"
        } else {
            classify_approach_protect_used_two_factor_from_email = "1"
        }
        const _classify_approach_protect_used_two_factor_from_sms_ = req.body.classify_approach_protect_used_two_factor_from_sms
        var classify_approach_protect_used_two_factor_from_sms = ""
        if (typeof _classify_approach_protect_used_two_factor_from_sms_ == 'undefined') {
            classify_approach_protect_used_two_factor_from_sms = "0"
        } else {
            classify_approach_protect_used_two_factor_from_sms = "1"
        }
        const _classify_type_data_in_event_personal_datamark_check_ = req.body.classify_type_data_in_event_personal_datamark_check;
        var classify_type_data_in_event_personal_datamark_check = 0
        if (typeof _classify_type_data_in_event_personal_datamark_check_ != 'undefined') {
            classify_type_data_in_event_personal_datamark_check = _classify_type_data_in_event_personal_datamark_check_
        }

        const _classify_type_data_in_event_personal_datamark_ = req.body.classify_type_data_in_event_personal_datamark;

        var classify_type_data_in_event_personal_datamark = ""
        // if (typeof _classify_type_data_in_event_personal_datamark_ == 'undefined') {
        //     if (typeof req.body.classify_type_data_in_event_personal_datamark1 == 'undefined') {
        //         classify_type_data_in_event_personal_datamark = -1
        //     } else {
        //         classify_type_data_in_event_personal_datamark = req.body.classify_type_data_in_event_personal_datamark1;
        //     }
        // } else {
        //     classify_type_data_in_event_personal_datamark = req.body.classify_type_data_in_event_personal_datamark
        // }
        if (typeof _classify_type_data_in_event_personal_datamark_ == 'undefined') {
            if (typeof req.body.classify_type_data_in_event_personal_datamark1 == 'undefined') {
                classify_type_data_in_event_personal_datamark = -1
            } else {
                classify_type_data_in_event_personal_datamark = req.body.classify_type_data_in_event_personal_datamark1;
            }
        } else {
            classify_type_data_in_event_personal_datamark = req.body.classify_type_data_in_event_personal_datamark
        }



        const _classify_risk_assess_only_dpo_data_personal_can_specify_ = req.body.classify_risk_assess_only_dpo_data_personal_can_specify
        var classify_risk_assess_only_dpo_data_personal_can_specify = 0
        if (typeof _classify_risk_assess_only_dpo_data_personal_can_specify_ != 'undefined') {
            classify_risk_assess_only_dpo_data_personal_can_specify = _classify_risk_assess_only_dpo_data_personal_can_specify_
        }
        const _classify_risk_assess_only_dpo_data_number_all_used_process_many_ = req.body.classify_risk_assess_only_dpo_data_number_all_used_process_many
        var classify_risk_assess_only_dpo_data_number_all_used_process_many = 0
        if (typeof _classify_risk_assess_only_dpo_data_number_all_used_process_many_ != 'undefined') {
            classify_risk_assess_only_dpo_data_number_all_used_process_many = _classify_risk_assess_only_dpo_data_number_all_used_process_many_
        }
        const _classify_risk_assess_only_dpo_access_control_inside_ = req.body.classify_risk_assess_only_dpo_access_control_inside
        var classify_risk_assess_only_dpo_access_control_inside = 0
        if (typeof _classify_risk_assess_only_dpo_access_control_inside_ != 'undefined') {
            classify_risk_assess_only_dpo_access_control_inside = _classify_risk_assess_only_dpo_access_control_inside_
        }
        const _classify_risk_assess_only_dpo_access_control_outside_ = req.body.classify_risk_assess_only_dpo_access_control_outside
        var classify_risk_assess_only_dpo_access_control_outside = 0
        if (typeof _classify_risk_assess_only_dpo_access_control_outside_ != 'undefined') {
            classify_risk_assess_only_dpo_access_control_outside = _classify_risk_assess_only_dpo_access_control_outside_
        }
        const _classify_risk_assess_only_dpo_protect_data_inside_ = req.body.classify_risk_assess_only_dpo_protect_data_inside
        var classify_risk_assess_only_dpo_protect_data_inside = 0
        if (typeof _classify_risk_assess_only_dpo_protect_data_inside_ != 'undefined') {
            classify_risk_assess_only_dpo_protect_data_inside = _classify_risk_assess_only_dpo_protect_data_inside_
        }
        const _classify_risk_assess_only_dpo_protect_data_outside_ = req.body.classify_risk_assess_only_dpo_protect_data_outside
        var classify_risk_assess_only_dpo_protect_data_outside = 0
        if (typeof _classify_risk_assess_only_dpo_protect_data_outside_ != 'undefined') {
            classify_risk_assess_only_dpo_protect_data_outside = _classify_risk_assess_only_dpo_protect_data_outside_
        }
        const _classify_risk_assess_only_dpo_assess_the_impact_of_data_ = req.body.classify_risk_assess_only_dpo_assess_the_impact_of_data
        var classify_risk_assess_only_dpo_assess_the_impact_of_data = -1
        if (typeof _classify_risk_assess_only_dpo_assess_the_impact_of_data_ != 'undefined') {
            classify_risk_assess_only_dpo_assess_the_impact_of_data = _classify_risk_assess_only_dpo_assess_the_impact_of_data_
        }
        const _classify_risk_assess_only_dpo_assess_the_impact_of_organization_ = req.body.classify_risk_assess_only_dpo_assess_the_impact_of_organization
        var classify_risk_assess_only_dpo_assess_the_impact_of_organization = -1
        if (typeof _classify_risk_assess_only_dpo_assess_the_impact_of_organization_ != 'undefined') {
            classify_risk_assess_only_dpo_assess_the_impact_of_organization = _classify_risk_assess_only_dpo_assess_the_impact_of_organization_
        }

        const _classify_period_proccess_follow_policy_total_ = req.body.classify_period_proccess_follow_policy_total
        var classify_period_proccess_follow_policy_total = 0
        if (typeof _classify_period_proccess_follow_policy_total_ != 'undefined') {
            classify_period_proccess_follow_policy_total = _classify_period_proccess_follow_policy_total_
        }
        const _classify_period_end_follow_pattern_total_ = req.body.classify_period_end_follow_pattern_total
        var classify_period_end_follow_pattern_total = 0
        if (typeof _classify_period_end_follow_pattern_total_ != 'undefined') {
            classify_period_end_follow_pattern_total = _classify_period_end_follow_pattern_total_
        }



        var doc_id_person_data_pattern = req.body.doc_id_person_data_pattern
        if (typeof doc_id_person_data_pattern != 'undefined') {
            doc_id_person_data_pattern = doc_id_person_data_pattern.toString()
        } else {
            doc_id_person_data_pattern = ''
        }

        var classify_dpo_check = req.body.classify_dpo_check
        if (typeof classify_dpo_check != 'undefined') {
            classify_dpo_check = 1
        } else {
            classify_dpo_check = 0
        }

        const body = {
            classify_name: classify_name,
            pattern_id: req.body.pattern_id,
            doc_id_person_data_pattern: doc_id_person_data_pattern,
            event_process_id: req.body.event_process_id,
            classify_explain_process: req.body.classify_explain_process,
            classify_user_access_info_process_inside: classify_user_access_info_process_inside,
            classify_user_access_info_process_inside_from_pattern: req.body.classify_user_access_info_process_inside_from_pattern,
            classify_user_access_info_process_inside_from_new_id: req.body.classify_user_access_info_process_inside_from_new_id + '',
            classify_user_access_info_process_inside_from_new_total: req.body.classify_user_access_info_process_inside_from_new_total,
            classify_user_access_info_process_outside: classify_user_access_info_process_outside,
            classify_user_access_info_process_outside_from_pattern: req.body.classify_user_access_info_process_outside_from_pattern,
            classify_user_access_info_process_outside_from_new_id: req.body.classify_user_access_info_process_outside_from_new_id + '',
            classify_user_access_info_process_outside_from_new_total: req.body.classify_user_access_info_process_outside_from_new_total,
            classify_period_process: req.body.classify_period_process,
            classify_period_proccess_follow_policy: classify_period_proccess_follow_policy,
            classify_period_proccess_follow_policy_total: classify_period_proccess_follow_policy_total,
            classify_period_end: req.body.classify_period_end,
            classify_period_end_follow_pattern: classify_period_end_follow_pattern,
            classify_period_end_follow_pattern_total: classify_period_end_follow_pattern_total,
            classify_type_data_in_event_personal: classify_type_data_in_event_personal,
            classify_type_data_in_event_personal_datamark_check: classify_type_data_in_event_personal_datamark_check,
            classify_type_data_in_event_personal_datamark: classify_type_data_in_event_personal_datamark,
            classify_type_data_in_event_personal_datamark_total: req.body.classify_type_data_in_event_personal_datamark_total,
            classify_type_data_in_event_special_personal_sensitive: classify_type_data_in_event_special_personal_sensitive,
            pattern_processing_base_id: req.body.pattern_processing_base_id,
            classify_processing_base_explain: req.body.classify_processing_base_explain,
            classification_special_conditions_id: req.body.classification_special_conditions_id,
            classify_special_conditiion_explain: req.body.classify_special_conditiion_explain,
            classify_protect_data_limit_process: req.body.classify_protect_data_limit_process,
            classify_protect_data_limit_follow_datetime: classify_protect_data_limit_follow_datetime,
            classify_approach_protect_used_two_factor_from_google_authen: classify_approach_protect_used_two_factor_from_google_authen,
            classify_approach_protect_used_two_factor_from_email: classify_approach_protect_used_two_factor_from_email,
            classify_approach_protect_used_two_factor_from_sms: classify_approach_protect_used_two_factor_from_sms,
            classify_data_exception_or_unnecessary_filter_name: req.body.classify_data_exception_or_unnecessary_filter_name,
            classify_data_exception_or_unnecessary_filter_tag: req.body.classify_data_exception_or_unnecessary_filter_tag,
            classify_data_exception_or_unnecessary_filter_label: req.body.classify_data_exception_or_unnecessary_filter_label,
            classify_risk_assess_only_dpo_data_personal_can_specify: classify_risk_assess_only_dpo_data_personal_can_specify,
            classify_risk_assess_only_dpo_data_number_all_used_process_many: classify_risk_assess_only_dpo_data_number_all_used_process_many,
            classify_risk_assess_only_dpo_data_number_all_used_process_total: req.body.classify_risk_assess_only_dpo_data_number_all_used_process_total,
            classify_risk_assess_only_dpo_access_control_inside: classify_risk_assess_only_dpo_access_control_inside,
            classify_risk_assess_only_dpo_access_control_outside: classify_risk_assess_only_dpo_access_control_outside,
            classify_risk_assess_only_dpo_protect_data_inside: classify_risk_assess_only_dpo_protect_data_inside,
            classify_risk_assess_only_dpo_protect_data_outside: classify_risk_assess_only_dpo_protect_data_outside,
            classify_risk_assess_only_dpo_assess_the_impact_of_data: classify_risk_assess_only_dpo_assess_the_impact_of_data,
            classify_risk_assess_only_dpo_fix_a_leak_of_data: req.body.classify_risk_assess_only_dpo_fix_a_leak_of_data,
            classify_risk_assess_only_dpo_assess_the_impact_of_organization: classify_risk_assess_only_dpo_assess_the_impact_of_organization,
            classify_risk_assess_only_dpo_fix_a_leak_of_organization: req.body.classify_risk_assess_only_dpo_fix_a_leak_of_organization,
            acc_id: req.body.acc_id,
            classify_dpo_check: classify_dpo_check,
            classify_dpo_check_by_acc_id: req.body.acc_id
        };
        req.getConnection((err, conn) => {
            funchistory.funchistory(req, "classification", `เพิ่มข้อมูล classification ${classify_name} `, req.session.userid)
            conn.query('INSERT INTO TB_TR_PDPA_CLASSIFICATION SET ?;', [body], (err_class, insert_classification) => {
                const data = req.body
                let IDclasscifi = insert_classification.insertId;
                if (data.specificEite != '') { // กรณีที่มีการเเก้ไข มาตราการ
                    let IDchooseSpecific = data.chooseSpecific.split(",").map((items) => { return parseInt(items) })
                    let specificEite = JSON.parse(data.specificEite);
                    let IDspecificEite = specificEite.map((items) => { return items.id_specific });
                    let IDunique = IDchooseSpecific.filter((items) => { if (IDspecificEite.indexOf(items) < 0) { return items } });
                    req.getConnection((err, conn) => {
                        specificEite.forEach(element => {
                            conn.query(`INSERT INTO TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION SET pattern_id=?,doc_id=?,classification_measures_detail=?,classification_measures_supervisor=?,
                                classification_measures_date=?,
                                classification_measures_date_count=?,
                                classification_measures_section_name=?,
                                classification_specific_access_control=?, 
                                classification_specific_user_access_management=?,
                                classification_specific_user_responsibilitites=?,
                                classification_specific_audit_trails=?,
                                classification_specific_privacy_security_awareness=?,
                                classification_specific_where_incident_occurs=?,
                                classification_specific_access_control_explain=?,
                                classification_specific_user_access_management_explain=?,
                                classification_specific_user_responsibilitites_explain=?,
                                classification_specific_audit_trails_explain=?,
                                classification_specific_privacy_security_awareness_explain=?,
                                classification_specific_where_incident_occurs_explain=?,
                                event_process_id=?,classify_id=?,specific_id=?`,
                                [data.pattern_id,
                                element.doc_id.toString(),
                                element.measures_detail,
                                element.measures_supervisor.toString(),
                                element.measures_date,
                                element.measures_date_count,
                                element.section_name,
                                element.specific_access_control,
                                element.specific_user_access_management,
                                element.specific_user_responsibilitites,
                                element.specific_audit_trails,
                                element.specific_privacy_security_awareness,
                                element.specific_where_incident_occurs,
                                element.specific_access_control_explain,
                                element.specific_user_access_management_explain,
                                element.specific_user_responsibilitites_explain,
                                element.specific_audit_trails_explain,
                                element.specific_privacy_security_awareness_explain,
                                element.specific_where_incident_occurs_explain,
                                element.id_event_proccess, IDclasscifi,
                                element.id_specific
                                ], (err_class, inserSpecificONclasscifi) => {
                                    if (err_class) { console.log(err_class) }
                                })
                        });
                    })
                    insertSpecificOnClaascifi(IDunique, data.pattern_id, IDclasscifi, req)
                } else {
                    let IDchooseSpecific = data.chooseSpecific.split(",").map((items) => { return parseInt(items) })
                    insertSpecificOnClaascifi(IDchooseSpecific, data.pattern_id, IDclasscifi, req)
                }
                if (err_class) { res.json(err_class) } else { res.redirect('/classification') }
            });
        });
    }
}




// if (req.body.measures != '') {
//     let measure = JSON.parse(req.body.measures)
//     for (let i = 0; i < measure.length; i++) {
//         conn.query('INSERT INTO TB_TR_MEASURES_CLASSIFICATION SET  classification_measures_detail=?,classification_measures_supervisor=?,classification_measures_date=NOW(),classification_measures_date_count=?,classification_measures_section_name=?,doc_id=?,measures_type_id=?,classify_id=?',
//             [measure[i].measures_detail, measure[i].measures_supervisor, measure[i].measures_date_count, measure[i].measures_section_name, measure[i].doc_id.toString(), measure[i].measures_type_id, insert_classification.insertId], (err, insert_measures) => {
//             });
//     }
// }
// if (req.body.assets != '') {
//     let assets = JSON.parse(req.body.assets)
//     for (let i = 0; i < assets.length; i++) {
//         conn.query('INSERT INTO TB_TR_MEASURES_RISK_BASED_APPROACH_CLASSIFICATION SET classification_measures_detail=?,classification_measures_supervisor=?,classification_measures_date=NOW(),classification_measures_date_count=?,classification_measures_section_name=?,doc_id=?,classify_id=?,classification_approach_confidentiality=?,classification_approach_integrity=?,classification_approach_availability=?,classification_approach_confidentiality_explain=?, classification_approach_integrity_explain=?,classification_approach_availability_explain=?,classification_approach_heading_risk_based=1,assets_id=?',
//             [assets[i].measures_detail, assets[i].measures_supervisor, assets[i].measures_date_count, assets[i].measures_section_name, assets[i].doc_id.toString(), insert_classification.insertId, assets[i].confidentiality, assets[i].integrity, assets[i].availability, assets[i].confidentiality_explain, assets[i].integrity_explain, assets[i].availability_explain, assets[i].assets_id], (err, insert_approach) => {
//             });
//     }
// }
// if (req.body.network != '') {
//     let network = JSON.parse(req.body.network)
//     for (let i = 0; i < network.length; i++) {
//         conn.query('INSERT INTO TB_TR_MEASURES_RISK_BASED_APPROACH_CLASSIFICATION SET classification_measures_detail=?,classification_measures_supervisor=?,classification_measures_date=NOW(),classification_measures_date_count=?,classification_measures_section_name=?,doc_id=?,classify_id=?,depth_id_defense=?,classification_approach_defense_principles_explain=?,depth_id_measures=?,classification_approach_defense_protection_explain=?,classification_approach_defense_principles=?,classification_approach_defense_protection=?,classification_approach_heading_risk_based=2,assets_id=?',
//             [network[i].measures_detail, network[i].measures_supervisor, network[i].measures_date_count, network[i].measures_section_name, network[i].doc_id.toString(), insert_classification.insertId, network[i].depth_id_defense.toString(), network[i].defense_explain, network[i].depth_id_measures.toString(), network[i].principles_explain, network[i].approach_defense_principles, network[i].approach_defense_protection, network[i].assets_id], (err, insert_approach) => {
//             });
//     }
// }
// if (req.body.specific != '') {
//     let specific = JSON.parse(req.body.specific)
//     console.log("specific", specific);
//     for (let i = 0; i < specific.length; i++) {
//         conn.query(`INSERT INTO TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION SET classify_id =?, doc_id =?, classification_measures_detail =?, classification_measures_supervisor =?, classification_measures_date =?, classification_measures_date_count =?, classification_measures_section_name =?, classification_specific_access_control =?, classification_specific_user_access_management =?, classification_specific_user_responsibilitites =?, classification_specific_audit_trails =?, classification_specific_privacy_security_awareness =?, classification_specific_where_incident_occurs =?, classification_specific_access_control_explain =?, classification_specific_user_access_management_explain =?, classification_specific_user_responsibilitites_explain =?, classification_specific_audit_trails_explain =?, classification_specific_privacy_security_awareness_explain =?, classification_specific_where_incident_occurs_explain =? `,
//             [insert_classification.insertId, specific[i].doc_id.toString(), specific[i].measures_detail, specific[i].measures_supervisor, specific[i].measures_date, specific[i].measures_date_count, specific[i].measures_section_name, specific[i].access, specific[i].management, specific[i].responsibilitites, specific[i].audit, specific[i].awareness, specific[i].occurs, specific[i].control_explain, specific[i].management_explain, specific[i].responsibilitites_explain, specific[i].audit_explain, specific[i].awareness_explain, specific[i].occurs_explain], (err_class, insert_classification) => {
//             });
//     }
// }




// Detail Classification


controller.detailClassification = (req, res) => {
    if (typeof req.session.userid == "undefined") {
        res.redirect('/')
    } else {
        // const user = req.session.userid
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        const { id } = req.params;
        req.getConnection((err, conn) => {
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                    conn.query('SELECT * FROM TB_TR_ACCOUNT', (err, users) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_CLASSIFICATION as pc LEFT JOIN TB_TR_PDPA_PATTERN as pp ON pc.pattern_id = pp.pattern_id LEFT JOIN TB_TR_PDPA_EVENT_PROCESS as pep ON pc.event_process_id = pep.event_process_id LEFT JOIN TB_MM_PDPA_PATTERN_PROCESSING_BASE as pppb ON pc.pattern_processing_base_id = pppb.pattern_processing_base_id LEFT JOIN TB_MM_PDPA_CLASSIFICATION_SPECIAL_CONDITIONS as pcsc ON pc.classification_special_conditions_id = pcsc.classification_special_conditions_id LEFT JOIN TB_TR_PDPA_DOCUMENT as pd ON pp.doc_id = pd.doc_id  WHERE classify_id = ?;', [id], (err, classify) => {
                            conn.query("SELECT *,DATE_FORMAT(specificClass.classification_measures_date,' %Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION AS  specificClass LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS event ON specificClass.event_process_id = event.event_process_id WHERE specificClass.classify_id = ?", [id], (err, specificONClasssifi) => {
                                conn.query("SELECT TB_TR_ACCOUNT.acc_id,TB_TR_ACCOUNT.firstname,TB_TR_ACCOUNT.lastname FROM TB_TR_ACCOUNT LEFT JOIN TB_TR_MUITIFACTOR as m ON m.acc_id=TB_TR_ACCOUNT.acc_id WHERE TB_TR_ACCOUNT.acc_id NOT IN (SELECT acc_id FROM TB_TR_DEL_ACC) and TB_TR_ACCOUNT.admin in (3,5)", (err, account) => {
                                    conn.query("SELECT * FROM  TB_TR_PDPA_DOCUMENT WHERE doc_status=2 AND  type !=3 AND doc_action =0", [user], (err, doc) => {
                                        funchistory.funchistory(req, "classification", `ดูข้อมูล classification ${classify[0].classify_name}`, req.session.userid)
                                        let word = []
                                        let word1 = []
                                        for (i in words) {
                                            word.push(words[i].words_id)
                                            word1.push(words[i].words_often)
                                        }
                                        if (err) {
                                            res.json(err)
                                        }
                                        let arr_users = []
                                        for (i in users) {
                                            arr_users.push({ 'id': users[i].acc_id, 'name': users[i].firstname + " " + users[i].lastname, 'image': users[i].image })
                                        }
                                        let classify_user = classify[0].classify_user_access_info_process_inside_from_new_id.split(',')
                                        let classifiy_user_outside = classify[0].classify_user_access_info_process_outside_from_new_id.split(',')
                                        let classify_user_convert = arr_users.filter(function (item) { return classify_user.toString().indexOf(item.id) != -1 })
                                        let classify_user_convert_outside = arr_users.filter(function (item) { return classifiy_user_outside.toString().indexOf(item.id) != -1 })



                                        //  มาตราการ ใน classifi
                                        specificONClasssifi = specificONClasssifi.map((items, index) => {
                                            let IDdoc = items.doc_id.split(',').map(function (items) { return parseInt(items) })
                                            let supervisor = items.classification_measures_supervisor.split(',').map(items => { return parseInt(items) })

                                            // เเปลงวันที่ 
                                            items.date = new Date(items.date).toLocaleDateString('en-GB') + " - " + new Date(new Date(items.date).getTime() + items.classification_measures_date_count * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB') + ` <br> ( ${items.classification_measures_date_count} ) วัน`;


                                            let docName = "";
                                            let supervisorName = "";
                                            let countDoc = 0
                                            doc.forEach(items => { if (IDdoc.indexOf(items.doc_id) > -1) { docName += `${countDoc + 1}.${items.doc_name} <br>`, countDoc++ } })
                                            // ผู้ดูแลข้อมูลหรือผู้ดูแลระบบหรือผู้ควบคุมมาตราการ
                                            let count = 0
                                            account.forEach(items => { if (supervisor.indexOf(items.acc_id) > -1) { supervisorName += `${count + 1}.${items.firstname} ${items.lastname} <br>`, count++; } })

                                            items.classification_specific_access_control = items.classification_specific_access_control === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'
                                            items.classification_specific_user_access_management = items.classification_specific_user_access_management === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'
                                            items.classification_specific_user_responsibilitites = items.classification_specific_user_responsibilitites === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'
                                            items.classification_specific_audit_trails = items.classification_specific_audit_trails === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'
                                            items.classification_specific_privacy_security_awareness = items.classification_specific_privacy_security_awareness === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'
                                            items.classification_specific_where_incident_occurs = items.classification_specific_where_incident_occurs === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'

                                            return { ...items, docName: docName, no: index + 1, classification_measures_supervisor: supervisorName }
                                        });

                                        res.render('./classification/detail', {
                                            classify: classify,
                                            users: classify_user_convert,
                                            users_outside: classify_user_convert_outside,
                                            history: history,
                                            words: words,
                                            words1: word,
                                            words2: word1,
                                            specificONClasssifi,
                                            session: req.session
                                        })
                                    })
                                })
                            })
                        });
                    })
                })
            })
        })
    }
}


// Edit classify page
controller.editClassification = (req, res) => {
    if (typeof req.session.userid == "undefined") { res.redirect('/') } else {
        // const user = req.session.userid;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        const { id } = req.params;

        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM TB_TR_ACCOUNT;", (err, account) => {
                conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                    conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_EVENT_PROCESS;', (err, event) => {
                            conn.query("SELECT * FROM TB_MM_PDPA_CLASSIFICATION_SPECIAL_CONDITIONS;", (err, special) => {
                                conn.query('SELECT * FROM TB_MM_PDPA_PATTERN_PROCESSING_BASE;', (err, process) => {
                                    conn.query('SELECT * FROM TB_TR_PDPA_CLASSIFICATION where classify_id = ?;', [id], (err, classify) => {

                                        conn.query("SELECT *,DATE_FORMAT(specificClass.classification_measures_date,' %Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION AS  specificClass LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS event ON specificClass.event_process_id = event.event_process_id WHERE specificClass.classify_id = ?", [id], (err, specificONClasssifi) => {
                                            let word = []
                                            let word1 = []
                                            for (i in words) {
                                                word.push(words[i].words_id)
                                                word1.push(words[i].words_often)
                                            }
                                            conn.query("SELECT TB_TR_PDPA_DATA.* ,DATE_FORMAT(TB_TR_PDPA_DATA.data_date_start,'%d-%m-%Y') as day_start,DATE_FORMAT(TB_TR_PDPA_DATA.data_date_end,'%d-%m-%Y') as day_end, TB_MM_PDPA_LEVEL.level_name as level_name ,TB_MM_PDPA_DATA_TYPE.data_type_name as data_type_name FROM TB_TR_PDPA_DATA left join TB_MM_PDPA_LEVEL on TB_TR_PDPA_DATA.data_level_id = TB_MM_PDPA_LEVEL.level_id left join TB_MM_PDPA_DATA_TYPE on TB_TR_PDPA_DATA.data_type_id = TB_MM_PDPA_DATA_TYPE.data_type_id ;", (err, doc_pdpa_data) => {
                                                conn.query('SELECT * FROM TB_TR_PDPA_PATTERN where pattern_id = ? ;', [classify[0].pattern_id], (err, pattern) => {
                                                    var data_out = [{ pattern: pattern[0], datatag: [], datatag_id: [], datatag_name: [], datatag_code: [] }];
                                                    if (pattern[0].doc_id_person_data) {
                                                        for (let i = 0; i < doc_pdpa_data.length; i++) {
                                                            if (pattern[0].doc_id_person_data.search((doc_pdpa_data[i].data_id)) > -1 || pattern[0].doc_id_person_data == doc_pdpa_data[i].data_id) {
                                                                data_out[0].datatag.push(doc_pdpa_data[i]);
                                                                data_out[0].datatag_id.push(doc_pdpa_data[i].data_id);
                                                                data_out[0].datatag_name.push(doc_pdpa_data[i].data_name);
                                                                data_out[0].datatag_code.push(doc_pdpa_data[i].data_code);
                                                            }
                                                        }
                                                    }
                                                    if (err) { res.json(err) } else {
                                                        res.render('./classification/classification_edit', {
                                                            account: account,
                                                            data_out: data_out,
                                                            classify: classify,
                                                            process: process,
                                                            event: event,
                                                            special: special,
                                                            history: history,
                                                            words: words,
                                                            words1: word,
                                                            words2: word1,
                                                            session: req.session
                                                        })
                                                    }
                                                });
                                            });
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    }
}


controller.updateClassification = (req, res) => {
    if (typeof req.session.userid == 'undefined') { res.redirect('/') } else {
        let user = check_user_login(req);

        const data = req.body
        //  เเก้ขไมาตราการ 
        const IDclasscifi = req.params.id;
        if (data.chooseSpecific !== '' && data.specificEite !== '') { // กรณี มีมาตราการเเละเเก้ไข
            // console.log("xxxxxxxxxxxxxxxxxxxxxxxxxx");
            // console.log("IDclasscifi", IDclasscifi);
            let specificEite = JSON.parse(data.specificEite)
            let chooseSpecific = data.chooseSpecific.split(',').map((item) => { return parseInt(item) }) // id ของมาตราการทั้งที่ส่งมา
            let uniques = [] // ค่าที่ไม่ซ้ำ

            //  กรณีที่มีการเพิ่มมาตราการเเละเเก้ไขมาตราการที่เพิ่มมาใหม่
            let id_specific = specificEite.map(items => {
                if (items.pattern_specific_id != undefined) {
                    req.getConnection((err, conn) => {
                        conn.query('UPDATE TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION SET specific_id=?,doc_id=?,classification_measures_detail=?,classification_measures_supervisor=?,classification_measures_date=?,classification_measures_date_count=?,classification_measures_section_name=?,classification_specific_access_control=?,   classification_specific_user_access_management=?,   classification_specific_user_responsibilitites=?,classification_specific_audit_trails=?,classification_specific_privacy_security_awareness=?,classification_specific_where_incident_occurs=?,classification_specific_access_control_explain=?, classification_specific_user_access_management_explain=?, classification_specific_user_responsibilitites_explain=?, classification_specific_audit_trails_explain=?, classification_specific_privacy_security_awareness_explain=?, classification_specific_where_incident_occurs_explain=?,event_process_id=? WHERE classification_specific_id=?',
                            [items.id_specific,
                            items.doc_id.toString(),
                            items.measures_detail,
                            items.measures_supervisor.toString(),
                            items.measures_date,
                            items.measures_date_count,
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
                            items.id_event_proccess,
                            items.pattern_specific_id
                            ], (err, updateSpecificOnClassifi) => {
                                console.log("err", err);

                            })
                    })
                } else {// มาตราการที่เลือกเข้ามาใหม่ด้วยมีการเเก้ไขข้อมูล
                    req.getConnection((err, conn) => {
                        conn.query(`INSERT INTO TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION SET pattern_id=?,doc_id=?,classification_measures_detail=?,classification_measures_supervisor=?,
                                classification_measures_date=?,
                                classification_measures_date_count=?,
                                classification_measures_section_name=?,
                                classification_specific_access_control=?, 
                                classification_specific_user_access_management=?,
                                classification_specific_user_responsibilitites=?,
                                classification_specific_audit_trails=?,
                                classification_specific_privacy_security_awareness=?,
                                classification_specific_where_incident_occurs=?,
                                classification_specific_access_control_explain=?,
                                classification_specific_user_access_management_explain=?,
                                classification_specific_user_responsibilitites_explain=?,
                                classification_specific_audit_trails_explain=?,
                                classification_specific_privacy_security_awareness_explain=?,
                                classification_specific_where_incident_occurs_explain=?,
                                event_process_id=?,specific_id=?,classify_id=?`,
                            [data.pattern_id,
                            items.doc_id.toString(),
                            items.measures_detail,
                            items.measures_supervisor.toString(),
                            items.measures_date,
                            items.measures_date_count,
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
                            items.id_event_proccess,
                            items.id_specific,
                                IDclasscifi,
                            ], (err_class, inserSpecificONclasscifi) => {
                                if (err_class) { console.log(err_class) }
                            });
                    });
                }
                return items.id_specific
            })

            // function หาค่าที่ซ้ำเเละไม่ซ้ำ
            chooseSpecific.forEach(element => {
                if (id_specific.indexOf(Number(element)) < 0) {
                    uniques.push(element);
                }
            });
            // console.log("chooseSpecific", chooseSpecific);
            // console.log("id_specific", id_specific);
            // console.log("uniques", uniques);
            // console.log("data.IDpattern", data.pattern_id);
            // console.log("IDclasscifi", IDclasscifi);

            req.getConnection((err, conn) => {
                conn.query("SELECT specificclass.classification_specific_id as pattern_specific_id,classification_specific_id,specificclass.pattern_id as pattern_id,specificclass.specific_id as specific_id,specificclass.event_process_id as event_process_id,event.event_process_name as event_process_name,specificclass.doc_id as pattern_specific_doc_id,specificclass.classification_measures_detail  as pattern_measures_detail,specificclass.classification_measures_supervisor  as  pattern_measures_supervisor,specificclass.classification_measures_date_count  as  pattern_measures_date_count,specificclass. classification_measures_section_name  as  pattern_measures_section_name,specificclass.classification_specific_access_control  as pattern_specific_access_control,specificclass.classification_specific_user_access_management  as pattern_specific_user_access_management,specificclass.classification_specific_user_responsibilitites  as  pattern_specific_user_responsibilitites,specificclass.classification_specific_audit_trails  as pattern_specific_audit_trails,specificclass.classification_specific_privacy_security_awareness  as pattern_specific_privacy_security_awareness,specificclass.classification_specific_where_incident_occurs  as  pattern_specific_where_incident_occurs,specificclass.classification_specific_access_control_explain   as pattern_specific_access_control_explain,specificclass.classification_specific_user_access_management_explain  as pattern_specific_user_access_management_explain,specificclass.classification_specific_user_responsibilitites_explain  as pattern_specific_user_responsibilitites_explain,specificclass.classification_specific_audit_trails_explain  as pattern_specific_audit_trails_explain,specificclass.classification_specific_privacy_security_awareness_explain  as pattern_specific_privacy_security_awareness_explain,specificclass.classification_specific_where_incident_occurs_explain  as pattern_specific_where_incident_occurs_explain,DATE_FORMAT(specificclass.classification_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION   AS specificclass LEFT JOIN TB_TR_PDPA_EVENT_PROCESS AS event ON specificclass.event_process_id=event.event_process_id LEFT JOIN  TB_TR_PDPA_CLASSIFICATION as class on specificclass.classify_id=class.classify_id WHERE specificclass.classify_id =?  AND  specificclass.pattern_id =?   ORDER BY  specificclass.specific_id DESC",
                    [IDclasscifi, data.pattern_id], (err, specificONclassifi) => {
                        let specificONclassifis = specificONclassifi.map((items) => { return parseInt(items.specific_id) })
                        //  ลบมาตราการที่ ติดออก 
                        specificONclassifi.forEach(element => {
                            if (chooseSpecific.indexOf(element.specific_id) < 0) {
                                conn.query('DELETE FROM TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION WHERE classification_specific_id = ?', [element.classification_specific_id], (err, deletePatternSpecifi) => {
                                    if (err) { console.log(err); }
                                })
                            }
                        });
                        // เพื่มมาตราการที่ติกเลือก
                        uniques.forEach(element => {
                            if (specificONclassifis.indexOf(element) < 0) {
                                conn.query("SELECT *,specifi.specific_id as id_specific,DATE_FORMAT(measures.measures_date,'%Y-%m-%d')  date  FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures  ON specifi.measures_id=measures.measures_id  LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc  ON specifi.event_process_id=prosecc.event_process_id  WHERE measures.specify_id=3  AND measures.acc_id=? AND specifi.specific_id=?  ORDER BY specifi.specific_id DESC",
                                    [user, element], (err, specific) => {
                                        conn.query(`INSERT INTO TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION SET specific_id=?,pattern_id=?,doc_id=?,classification_measures_detail=?,classification_measures_supervisor=?,
                                    classification_measures_date=?,
                                    classification_measures_date_count=?,
                                    classification_measures_section_name=?,
                                    classification_specific_access_control=?, 
                                    classification_specific_user_access_management=?,
                                    classification_specific_user_responsibilitites=?,
                                    classification_specific_audit_trails=?,
                                    classification_specific_privacy_security_awareness=?,
                                    classification_specific_where_incident_occurs=?,
                                    classification_specific_access_control_explain=?,
                                    classification_specific_user_access_management_explain=?,
                                    classification_specific_user_responsibilitites_explain=?,
                                    classification_specific_audit_trails_explain=?,
                                    classification_specific_privacy_security_awareness_explain=?,
                                    classification_specific_where_incident_occurs_explain=?,
                                     event_process_id=?,classify_id=?`,
                                            [specific[0].id_specific, data.pattern_id,
                                            specific[0].doc_id.toString(),
                                            specific[0].measures_detail,
                                            specific[0].measures_supervisor.toString(),
                                            specific[0].measures_date,
                                            specific[0].measures_date_count,
                                            specific[0].measures_section_name,
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
                                            specific[0].specific_where_incident_occurs_explain,
                                            specific[0].event_process_id, IDclasscifi
                                            ], (err_class, inserSpecificONclasscifi) => {
                                                if (err_class) { console.log(err_class) }
                                            })
                                    });
                            }
                        });

                    });
            });

        } else if (data.chooseSpecific !== '' && data.specificEite == '') { // กรณี ไม่มีมาตราการเลย เเล้ว เพิ่มมาตราการ
            let chooseSpecific = data.chooseSpecific.split(',').map((item) => { return parseInt(item) }) // id ของมาตราการทั้งที่ส่งมา
            req.getConnection((err, conn) => {
                conn.query("SELECT specificclass.classification_specific_id as pattern_specific_id,classification_specific_id,specificclass.pattern_id as pattern_id,specificclass.specific_id as specific_id,specificclass.event_process_id as event_process_id,event.event_process_name as event_process_name,specificclass.doc_id as pattern_specific_doc_id,specificclass.classification_measures_detail  as pattern_measures_detail,specificclass.classification_measures_supervisor  as  pattern_measures_supervisor,specificclass.classification_measures_date_count  as  pattern_measures_date_count,specificclass. classification_measures_section_name  as  pattern_measures_section_name,specificclass.classification_specific_access_control  as pattern_specific_access_control,specificclass.classification_specific_user_access_management  as pattern_specific_user_access_management,specificclass.classification_specific_user_responsibilitites  as  pattern_specific_user_responsibilitites,specificclass.classification_specific_audit_trails  as pattern_specific_audit_trails,specificclass.classification_specific_privacy_security_awareness  as pattern_specific_privacy_security_awareness,specificclass.classification_specific_where_incident_occurs  as  pattern_specific_where_incident_occurs,specificclass.classification_specific_access_control_explain   as pattern_specific_access_control_explain,specificclass.classification_specific_user_access_management_explain  as pattern_specific_user_access_management_explain,specificclass.classification_specific_user_responsibilitites_explain  as pattern_specific_user_responsibilitites_explain,specificclass.classification_specific_audit_trails_explain  as pattern_specific_audit_trails_explain,specificclass.classification_specific_privacy_security_awareness_explain  as pattern_specific_privacy_security_awareness_explain,specificclass.classification_specific_where_incident_occurs_explain  as pattern_specific_where_incident_occurs_explain,DATE_FORMAT(specificclass.classification_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION   AS specificclass LEFT JOIN TB_TR_PDPA_EVENT_PROCESS AS event ON specificclass.event_process_id=event.event_process_id LEFT JOIN  TB_TR_PDPA_CLASSIFICATION as class on specificclass.classify_id=class.classify_id WHERE specificclass.classify_id =?  AND  specificclass.pattern_id =?   ORDER BY  specificclass.specific_id DESC",
                    [IDclasscifi, data.pattern_id], (err, specificONclassifi) => {
                        let specificONclassifis = specificONclassifi.map((items) => { return parseInt(items.specific_id) })
                        //  ลบมาตราการที่ ติดออก 
                        specificONclassifi.forEach(element => {
                            if (chooseSpecific.indexOf(element.specific_id) < 0) {
                                conn.query('DELETE FROM TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION WHERE classification_specific_id = ?', [element.classification_specific_id], (err, deletePatternSpecifi) => {
                                    if (err) { console.log(err); }
                                })
                            }
                        });
                        //    ตรวจสอบ มาตราการที่ไม่มีใน classifi เเล้วเพิ่มเข้าไป
                        chooseSpecific.forEach(element => {
                            if (specificONclassifis.indexOf(element) < 0) {
                                conn.query("SELECT *,specifi.specific_id as id_specific,DATE_FORMAT(measures.measures_date,'%Y-%m-%d')  date  FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures  ON specifi.measures_id=measures.measures_id  LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc  ON specifi.event_process_id=prosecc.event_process_id  WHERE measures.specify_id=3  AND measures.acc_id=? AND specifi.specific_id=?  ORDER BY specifi.specific_id DESC",
                                    [user, element], (err, specific) => {
                                        conn.query(`INSERT INTO TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION SET specific_id=?,pattern_id=?,doc_id=?,classification_measures_detail=?,classification_measures_supervisor=?,
                                    classification_measures_date=?,
                                    classification_measures_date_count=?,
                                    classification_measures_section_name=?,
                                    classification_specific_access_control=?, 
                                    classification_specific_user_access_management=?,
                                    classification_specific_user_responsibilitites=?,
                                    classification_specific_audit_trails=?,
                                    classification_specific_privacy_security_awareness=?,
                                    classification_specific_where_incident_occurs=?,
                                    classification_specific_access_control_explain=?,
                                    classification_specific_user_access_management_explain=?,
                                    classification_specific_user_responsibilitites_explain=?,
                                    classification_specific_audit_trails_explain=?,
                                    classification_specific_privacy_security_awareness_explain=?,
                                    classification_specific_where_incident_occurs_explain=?,
                                     event_process_id=?,classify_id=?`,
                                            [specific[0].id_specific, data.pattern_id,
                                            specific[0].doc_id.toString(),
                                            specific[0].measures_detail,
                                            specific[0].measures_supervisor.toString(),
                                            specific[0].measures_date,
                                            specific[0].measures_date_count,
                                            specific[0].measures_section_name,
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
                                            specific[0].specific_where_incident_occurs_explain,
                                            specific[0].event_process_id, IDclasscifi
                                            ], (err_class, inserSpecificONclasscifi) => {
                                                if (err_class) { console.log(err_class) }
                                            })
                                    });
                            }
                        });
                    });
            });
        } else {// กรณี เอามาตราการ ออกหมดเลย
            req.getConnection((err, conn) => {
                conn.query('DELETE FROM TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION WHERE classify_id = ? AND pattern_id=?',
                    [IDclasscifi, data.pattern_id], (err, deletePatternSpecifi) => {
                        if (err) { console.log(err); }
                    })
            });
        }

        var classify_name = req.body.classify_name_part1 + " (" + req.body.classify_name_part2 + ")";
        const { id } = req.params;
        const _classify_user_access_info_process_inside_ = req.body.classify_user_access_info_process_inside
        var classify_user_access_info_process_inside = ""
        if (typeof _classify_user_access_info_process_inside_ == "undefined") {
            classify_user_access_info_process_inside = "0"
        } else {
            classify_user_access_info_process_inside = "1"
        }
        const _classify_user_access_info_process_outside_ = req.body.classify_user_access_info_process_outside
        var classify_user_access_info_process_outside = ""
        if (typeof _classify_user_access_info_process_outside_ == 'undefined') {
            classify_user_access_info_process_outside = "0"
        } else {
            classify_user_access_info_process_outside = '1'
        }
        const _classify_period_proccess_follow_policy_ = req.body.classify_period_proccess_follow_policy
        var classify_period_proccess_follow_policy = ""
        if (typeof _classify_period_proccess_follow_policy_ == "undefined") {
            classify_period_proccess_follow_policy = "0"
        } else {
            classify_period_proccess_follow_policy = "1"
        }
        const _classify_period_end_follow_pattern_ = req.body.classify_period_end_follow_pattern
        var classify_period_end_follow_pattern = ""
        if (typeof _classify_period_end_follow_pattern_ == "undefined") {
            classify_period_end_follow_pattern = "0"
        } else {
            classify_period_end_follow_pattern = "1"
        }
        const _classify_type_data_in_event_personal_ = req.body.classify_type_data_in_event_personal
        var classify_type_data_in_event_personal = ""
        if (typeof _classify_type_data_in_event_personal_ == "undefined") {
            classify_type_data_in_event_personal = "0"
        } else {
            classify_type_data_in_event_personal = "1"
        }
        const _classify_type_data_in_event_special_personal_sensitive_ = req.body.classify_type_data_in_event_special_personal_sensitive
        var classify_type_data_in_event_special_personal_sensitive = ""
        if (typeof _classify_type_data_in_event_special_personal_sensitive_ == "undefined") {
            classify_type_data_in_event_special_personal_sensitive = "0"
        } else {
            classify_type_data_in_event_special_personal_sensitive = "1"
        }
        const _classify_protect_data_limit_follow_datetime_ = req.body.classify_protect_data_limit_follow_datetime
        var classify_protect_data_limit_follow_datetime = ""
        if (typeof _classify_protect_data_limit_follow_datetime_ == "undefined") {
            classify_protect_data_limit_follow_datetime = "0"
        } else {
            classify_protect_data_limit_follow_datetime = "1"
        }
        const _classify_approach_protect_used_two_factor_from_google_authen_ = req.body.classify_approach_protect_used_two_factor_from_google_authen
        var classify_approach_protect_used_two_factor_from_google_authen = ""
        if (typeof _classify_approach_protect_used_two_factor_from_google_authen_ == 'undefined') {
            classify_approach_protect_used_two_factor_from_google_authen = "0"
        } else {
            classify_approach_protect_used_two_factor_from_google_authen = "1"
        }
        const _classify_approach_protect_used_two_factor_from_email_ = req.body.classify_approach_protect_used_two_factor_from_email
        var classify_approach_protect_used_two_factor_from_email = ""
        if (typeof _classify_approach_protect_used_two_factor_from_email_ == "undefined") {
            classify_approach_protect_used_two_factor_from_email = "0"
        } else {
            classify_approach_protect_used_two_factor_from_email = "1"
        }
        const _classify_approach_protect_used_two_factor_from_sms_ = req.body.classify_approach_protect_used_two_factor_from_sms
        var classify_approach_protect_used_two_factor_from_sms = ""
        if (typeof _classify_approach_protect_used_two_factor_from_sms_ == 'undefined') {
            classify_approach_protect_used_two_factor_from_sms = "0"
        } else {
            classify_approach_protect_used_two_factor_from_sms = "1"
        }
        const _classify_type_data_in_event_personal_datamark_check_ = req.body.classify_type_data_in_event_personal_datamark_check;
        var classify_type_data_in_event_personal_datamark_check = 0
        if (typeof _classify_type_data_in_event_personal_datamark_check_ != 'undefined') {
            classify_type_data_in_event_personal_datamark_check = _classify_type_data_in_event_personal_datamark_check_
        }
        const _classify_type_data_in_event_personal_datamark_ = req.body.classify_type_data_in_event_personal_datamark;
        var classify_type_data_in_event_personal_datamark = ""
        if (typeof _classify_type_data_in_event_personal_datamark_ == 'undefined') {
            classify_type_data_in_event_personal_datamark = -1
        } else {
            classify_type_data_in_event_personal_datamark = req.body.classify_type_data_in_event_personal_datamark
        }
        const _classify_risk_assess_only_dpo_data_personal_can_specify_ = req.body.classify_risk_assess_only_dpo_data_personal_can_specify
        var classify_risk_assess_only_dpo_data_personal_can_specify = 0
        if (typeof _classify_risk_assess_only_dpo_data_personal_can_specify_ != 'undefined') {
            classify_risk_assess_only_dpo_data_personal_can_specify = _classify_risk_assess_only_dpo_data_personal_can_specify_
        }
        const _classify_risk_assess_only_dpo_data_number_all_used_process_many_ = req.body.classify_risk_assess_only_dpo_data_number_all_used_process_many
        var classify_risk_assess_only_dpo_data_number_all_used_process_many = 0
        if (typeof _classify_risk_assess_only_dpo_data_number_all_used_process_many_ != 'undefined') {
            classify_risk_assess_only_dpo_data_number_all_used_process_many = _classify_risk_assess_only_dpo_data_number_all_used_process_many_
        }
        const _classify_risk_assess_only_dpo_access_control_inside_ = req.body.classify_risk_assess_only_dpo_access_control_inside
        var classify_risk_assess_only_dpo_access_control_inside = 0
        if (typeof _classify_risk_assess_only_dpo_access_control_inside_ != 'undefined') {
            classify_risk_assess_only_dpo_access_control_inside = _classify_risk_assess_only_dpo_access_control_inside_
        }
        const _classify_risk_assess_only_dpo_access_control_outside_ = req.body.classify_risk_assess_only_dpo_access_control_outside
        var classify_risk_assess_only_dpo_access_control_outside = 0
        if (typeof _classify_risk_assess_only_dpo_access_control_outside_ != 'undefined') {
            classify_risk_assess_only_dpo_access_control_outside = _classify_risk_assess_only_dpo_access_control_outside_
        }
        const _classify_risk_assess_only_dpo_protect_data_inside_ = req.body.classify_risk_assess_only_dpo_protect_data_inside
        var classify_risk_assess_only_dpo_protect_data_inside = 0
        if (typeof _classify_risk_assess_only_dpo_protect_data_inside_ != 'undefined') {
            classify_risk_assess_only_dpo_protect_data_inside = _classify_risk_assess_only_dpo_protect_data_inside_
        }
        const _classify_risk_assess_only_dpo_protect_data_outside_ = req.body.classify_risk_assess_only_dpo_protect_data_outside
        var classify_risk_assess_only_dpo_protect_data_outside = 0
        if (typeof _classify_risk_assess_only_dpo_protect_data_outside_ != 'undefined') {
            classify_risk_assess_only_dpo_protect_data_outside = _classify_risk_assess_only_dpo_protect_data_outside_
        }
        const _classify_risk_assess_only_dpo_assess_the_impact_of_data_ = req.body.classify_risk_assess_only_dpo_assess_the_impact_of_data
        var classify_risk_assess_only_dpo_assess_the_impact_of_data = -1
        if (typeof _classify_risk_assess_only_dpo_assess_the_impact_of_data_ != 'undefined') {
            classify_risk_assess_only_dpo_assess_the_impact_of_data = _classify_risk_assess_only_dpo_assess_the_impact_of_data_
        }
        const _classify_risk_assess_only_dpo_assess_the_impact_of_organization_ = req.body.classify_risk_assess_only_dpo_assess_the_impact_of_organization
        var classify_risk_assess_only_dpo_assess_the_impact_of_organization = -1
        if (typeof _classify_risk_assess_only_dpo_assess_the_impact_of_organization_ != 'undefined') {
            classify_risk_assess_only_dpo_assess_the_impact_of_organization = _classify_risk_assess_only_dpo_assess_the_impact_of_organization_
        }
        var doc_id_person_data_pattern = req.body.doc_id_person_data_pattern
        if (typeof doc_id_person_data_pattern != 'undefined') {
            doc_id_person_data_pattern = doc_id_person_data_pattern.toString()
        } else {
            doc_id_person_data_pattern = ''
        }
        const _classify_user_access_info_process_inside_from_new_id = req.body.classify_user_access_info_process_inside_from_new_id
        var classify_user_access_info_process_inside_from_new_id = -1
        if (typeof _classify_user_access_info_process_inside_from_new_id != 'undefined') {
            classify_user_access_info_process_inside_from_new_id = _classify_user_access_info_process_inside_from_new_id
        }
        const _classify_user_access_info_process_outside_from_new_id = req.body.classify_user_access_info_process_outside_from_new_id
        var classify_user_access_info_process_outside_from_new_id = -1
        if (typeof _classify_user_access_info_process_outside_from_new_id != 'undefined') {
            classify_user_access_info_process_outside_from_new_id = _classify_user_access_info_process_outside_from_new_id
        }
        const _classify_period_proccess_follow_policy_total = req.body.classify_period_proccess_follow_policy_total
        var classify_period_proccess_follow_policy_total = 0
        if (typeof _classify_period_proccess_follow_policy_total != 'undefined') {
            classify_period_proccess_follow_policy_total = _classify_period_proccess_follow_policy_total
        }
        const _classify_period_end_follow_pattern_total = req.body.classify_period_end_follow_pattern_total
        var classify_period_end_follow_pattern_total = 0
        if (typeof _classify_period_end_follow_pattern_total != 'undefined') {
            classify_period_end_follow_pattern_total = _classify_period_end_follow_pattern_total
        }
        req.body.classify_user_access_info_process_inside_from_new_total = req.body.classify_user_access_info_process_inside_from_new_total == '' ? 0 : req.body.classify_user_access_info_process_inside_from_new_total
        req.body.classify_user_access_info_process_outside_from_new_total = req.body.classify_user_access_info_process_outside_from_new_total == '' ? 0 : req.body.classify_user_access_info_process_outside_from_new_total
        const body = {
            classify_name: classify_name,
            pattern_id: req.body.pattern_id,
            doc_id_person_data_pattern: doc_id_person_data_pattern,
            event_process_id: req.body.event_process_id,
            classify_explain_process: req.body.classify_explain_process,
            classify_user_access_info_process_inside: classify_user_access_info_process_inside,
            classify_user_access_info_process_inside_from_pattern: req.body.classify_user_access_info_process_inside_from_pattern,
            classify_user_access_info_process_inside_from_new_id: classify_user_access_info_process_inside_from_new_id + '',
            classify_user_access_info_process_inside_from_new_total: req.body.classify_user_access_info_process_inside_from_new_total,
            classify_user_access_info_process_outside: classify_user_access_info_process_outside,
            classify_user_access_info_process_outside_from_pattern: req.body.classify_user_access_info_process_outside_from_pattern,
            classify_user_access_info_process_outside_from_new_id: classify_user_access_info_process_outside_from_new_id + '',
            classify_user_access_info_process_outside_from_new_total: req.body.classify_user_access_info_process_outside_from_new_total,
            classify_period_process: req.body.classify_period_process,
            classify_period_proccess_follow_policy: classify_period_proccess_follow_policy,
            classify_period_proccess_follow_policy_total: classify_period_proccess_follow_policy_total,
            classify_period_end: req.body.classify_period_end,
            classify_period_end_follow_pattern: classify_period_end_follow_pattern,
            classify_period_end_follow_pattern_total: classify_period_end_follow_pattern_total,
            classify_type_data_in_event_personal: classify_type_data_in_event_personal,
            classify_type_data_in_event_personal_datamark_check: classify_type_data_in_event_personal_datamark_check,
            classify_type_data_in_event_personal_datamark: classify_type_data_in_event_personal_datamark,
            classify_type_data_in_event_personal_datamark_total: req.body.classify_type_data_in_event_personal_datamark_total,
            classify_type_data_in_event_special_personal_sensitive: classify_type_data_in_event_special_personal_sensitive,
            pattern_processing_base_id: req.body.pattern_processing_base_id,
            classify_processing_base_explain: req.body.classify_processing_base_explain,
            classification_special_conditions_id: req.body.classification_special_conditions_id,
            classify_special_conditiion_explain: req.body.classify_special_conditiion_explain,
            classify_protect_data_limit_process: req.body.classify_protect_data_limit_process,
            classify_protect_data_limit_follow_datetime: classify_protect_data_limit_follow_datetime,
            classify_approach_protect_used_two_factor_from_google_authen: classify_approach_protect_used_two_factor_from_google_authen,
            classify_approach_protect_used_two_factor_from_email: classify_approach_protect_used_two_factor_from_email,
            classify_approach_protect_used_two_factor_from_sms: classify_approach_protect_used_two_factor_from_sms,
            classify_data_exception_or_unnecessary_filter_name: req.body.classify_data_exception_or_unnecessary_filter_name,
            classify_data_exception_or_unnecessary_filter_tag: req.body.classify_data_exception_or_unnecessary_filter_tag,
            classify_data_exception_or_unnecessary_filter_label: req.body.classify_data_exception_or_unnecessary_filter_label,
            classify_risk_assess_only_dpo_data_personal_can_specify: classify_risk_assess_only_dpo_data_personal_can_specify,
            classify_risk_assess_only_dpo_data_number_all_used_process_many: classify_risk_assess_only_dpo_data_number_all_used_process_many,
            classify_risk_assess_only_dpo_data_number_all_used_process_total: req.body.classify_risk_assess_only_dpo_data_number_all_used_process_total,
            classify_risk_assess_only_dpo_access_control_inside: classify_risk_assess_only_dpo_access_control_inside,
            classify_risk_assess_only_dpo_access_control_outside: classify_risk_assess_only_dpo_access_control_outside,
            classify_risk_assess_only_dpo_protect_data_inside: classify_risk_assess_only_dpo_protect_data_inside,
            classify_risk_assess_only_dpo_protect_data_outside: classify_risk_assess_only_dpo_protect_data_outside,
            classify_risk_assess_only_dpo_assess_the_impact_of_data: classify_risk_assess_only_dpo_assess_the_impact_of_data,
            classify_risk_assess_only_dpo_fix_a_leak_of_data: req.body.classify_risk_assess_only_dpo_fix_a_leak_of_data,
            classify_risk_assess_only_dpo_assess_the_impact_of_organization: classify_risk_assess_only_dpo_assess_the_impact_of_organization,
            classify_risk_assess_only_dpo_fix_a_leak_of_organization: req.body.classify_risk_assess_only_dpo_fix_a_leak_of_organization,
            acc_id: req.body.acc_id
        };
        req.getConnection((err, conn) => {
            // const data = req.body
            conn.query('UPDATE TB_TR_PDPA_CLASSIFICATION SET ? WHERE classify_id = ?;', [body, id], (err, pass) => {
                if (err) { console.log(err); }
                //  ปิดใว้ก่อนยังไม่ได้ใช้งาน
                // if (req.body.measures != '') {
                //     let measure = JSON.parse(req.body.measures)
                //     for (let i = 0; i < measure.length; i++) {
                //         conn.query('UPDATE TB_TR_MEASURES_CLASSIFICATION SET  classification_measures_detail=?,classification_measures_supervisor=?,classification_measures_date=NOW(),classification_measures_date_count=?,classification_measures_section_name=?,doc_id=?,measures_type_id=? WHERE classification_measures_id=?',
                //             [measure[i].measures_detail, measure[i].measures_supervisor, measure[i].measures_date_count, measure[i].measures_section_name, measure[i].doc_id.toString(), measure[i].measures_type_id, measure[i].measures_id], (err, insert_measures) => {
                //                 console.log(err);
                //             });
                //     }
                // }
                // if (req.body.assets != '') {
                //     let assets = JSON.parse(req.body.assets)
                //     for (let i = 0; i < assets.length; i++) {
                //         conn.query('UPDATE TB_TR_MEASURES_RISK_BASED_APPROACH_CLASSIFICATION SET classification_measures_detail=?,classification_measures_supervisor=?,classification_measures_date=NOW(),classification_measures_date_count=?,classification_measures_section_name=?,doc_id=?,classification_approach_confidentiality=?,classification_approach_integrity=?,classification_approach_availability=?,classification_approach_confidentiality_explain=?, classification_approach_integrity_explain=?,classification_approach_availability_explain=?,classification_approach_heading_risk_based=1,assets_id=? where classification_approach_id=?',
                //             [assets[i].measures_detail, assets[i].measures_supervisor, assets[i].measures_date_count, assets[i].measures_section_name, assets[i].doc_id.toString(), assets[i].confidentiality, assets[i].integrity, assets[i].availability, assets[i].confidentiality_explain, assets[i].integrity_explain, assets[i].availability_explain, assets[i].assets_id, assets[i].approach_id], (err, insert_approach) => {
                //             });
                //     }
                // }
                // if (req.body.network != '') {
                //     let network = JSON.parse(req.body.network)
                //     for (let i = 0; i < network.length; i++) {
                //         conn.query('UPDATE TB_TR_MEASURES_RISK_BASED_APPROACH_CLASSIFICATION SET classification_measures_detail=?,classification_measures_supervisor=?,classification_measures_date=NOW(),classification_measures_date_count=?,classification_measures_section_name=?,doc_id=?,depth_id_defense=?,classification_approach_defense_principles_explain=?,depth_id_measures=?,classification_approach_defense_protection_explain=?,classification_approach_defense_principles=?,classification_approach_defense_protection=?,classification_approach_heading_risk_based=2,assets_id=? where classification_approach_id=?',
                //             [network[i].measures_detail, network[i].measures_supervisor, network[i].measures_date_count, network[i].measures_section_name, network[i].doc_id.toString(), network[i].depth_id_defense.toString(), network[i].defense_explain, network[i].depth_id_measures.toString(), network[i].principles_explain, network[i].approach_defense_principles, network[i].approach_defense_protection, network[i].assets_id, network[i].approach_id], (err, insert_approach) => {
                //             });
                //     }
                // }

                // if (req.body.specific != '') {
                //     // let specific = JSON.parse(req.body.specific)
                //     for (let i = 0; i < specific.length; i++) {
                //         conn.query(`UPDATE TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION SET doc_id =?, classification_measures_detail =?, classification_measures_supervisor =?, classification_measures_date =?, classification_measures_date_count =?, classification_measures_section_name =?, classification_specific_access_control =?, classification_specific_user_access_management =?, classification_specific_user_responsibilitites =?, classification_specific_audit_trails =?, classification_specific_privacy_security_awareness =?, classification_specific_where_incident_occurs =?, classification_specific_access_control_explain =?, classification_specific_user_access_management_explain =?, classification_specific_user_responsibilitites_explain =?, classification_specific_audit_trails_explain =?, classification_specific_privacy_security_awareness_explain =?, classification_specific_where_incident_occurs_explain =? WHERE classification_specific_id =? `,
                //             [specific[i].doc_id.toString(), specific[i].measures_detail, specific[i].measures_supervisor, specific[i].measures_date, specific[i].measures_date_count, specific[i].measures_section_name, specific[i].access, specific[i].management, specific[i].responsibilitites, specific[i].audit, specific[i].awareness, specific[i].occurs, specific[i].control_explain, specific[i].management_explain, specific[i].responsibilitites_explain, specific[i].audit_explain, specific[i].awareness_explain, specific[i].occurs_explain, specific[i].specific_id], (err_class, insert_classification) => {
                //             });
                //     }
                // }

                funchistory.funchistory(req, "classification", `แก้ไขข้อมูล classification ${classify_name}`, req.session.userid)
                res.redirect('/classification')
            })
        })
    }
}
// Delete Data
controller.deleteClassification = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/')
    } else {
        const { id } = req.params;
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_PDPA_CLASSIFICATION WHERE classify_id = ?', [id], (err, classify) => {
                conn.query('DELETE FROM TB_TR_PDPA_CLASSIFICATION WHERE classify_id = ?', [id], (err, pass) => {
                    funchistory.funchistory(req, "classification", `ลบข้อมูล classification ${classify[0].classify_name}`, req.session.userid)
                    if (err) { res.json(err) } else {
                        res.redirect('back')
                    }
                })
            })
        })
    }
}

// // Index dataflow
// controller.dataFlow = (req, res) => {
//     if (typeof req.session.userid == 'undefined') { res.redirect('/') } else {
//         const user = req.session.userid;
//         req.getConnection((err, conn) => {
//             conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                 conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                     conn.query('SELECT * FROM doc_pdpa_document WHERE doc_status = 2 AND doc_action IS NOT TRUE;', (err, policy) => {
//                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                             conn.query("SELECT * FROM account;", (err, account) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification;", (err, classify) => {
//                                     conn.query("SELECT * FROM doc_pdpa_pattern;", (err, pattern) => {
//                                         let word = []
//                                         let word1 = []
//                                         for (i in words) {
//                                             word.push(words[i].words_id)
//                                             word1.push(words[i].words_often)
//                                         }
//                                         if (err) { res.json(err) } else {
//                                             res.render('./classification/dataflow', {
//                                                 result: "ไม่พบข้อมูล....",
//                                                 policy: policy,
//                                                 data: data,
//                                                 account: account,
//                                                 pattern: pattern,
//                                                 classify: classify,
//                                                 history: history,
//                                                 words: words,
//                                                 words1: word,
//                                                 words2: word1,
//                                                 session: req.session
//                                             })
//                                         }
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//             })
//         })
//     }
// }
// // Search dataflow
// controller.searchData = (req, res) => {
//     if (typeof req.session.userid == "undefined") { res.redirect("/") } else {
//         const user = req.session.userid;
//         const policy_id = req.body.policy;
//         const pattern_id = req.body.pattern;
//         const classify_id = req.body.classify;
//         const acc_id = req.body.account;
//         const data_id = req.body.data;
//         req.getConnection((err, conn) => {
//             // 1 1 1 0 0 Success
//             if (policy_id && pattern_id && classify_id && acc_id === "" && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": policy,
//                                                     "pattern": pattern,
//                                                     "classify": classify,
//                                                     "account": account.filter(function (e) { return e.acc_id == acc_id }),
//                                                     "data": data.filter(function (e) { return e.data_id == data_id })
//                                                 }
//                                                 if (err) { res.json(err) } else {
//                                                     if (policy.length > 0 && pattern.length > 0 && classify.length > 0) {
//                                                         if (policy[0].doc_id == pattern[0].doc_id && pattern[0].pattern_id == classify[0].pattern_id) {
//                                                             result.policy = policy
//                                                             result.pattern = pattern
//                                                             result.classify = classify
//                                                             result.account = account.filter(function (e) { return e.acc_id == pattern[0].acc_id && e.acc_id == policy[0].user_id && e.acc_id == classify[0].acc_id })
//                                                             let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                             let all_contents = total_tag.map(e => e.replace(/(\r\n|\r|\n)/gm, "")).join("")
//                                                             result.data = data.filter(function (e) {
//                                                                 let check = all_contents.indexOf(e.data_tag) != -1
//                                                                 let check1 = pattern[0].pattern_tag.indexOf(e.data_tag) != -1
//                                                                 if (check == true || check1 == true) {
//                                                                     return e
//                                                                 }
//                                                             })
//                                                         }
//                                                     }
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 0 0 0 0 Success
//             } else if (policy_id && pattern_id === "" && classify_id === "" && acc_id === "" && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let total_acc_id = policy.map(e => e['user_id']).join(",")
//                                                 let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ''))
//                                                 let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                 let result = {
//                                                     "policy": policy,
//                                                     "pattern": pattern.filter(function (e) { return e.doc_id == policy_id }),
//                                                     "classify": [],
//                                                     "account": account.filter(function (e) { return total_acc_id.indexOf(e.acc_id) != -1 }),
//                                                     "data": []
//                                                 }
//                                                 result.classify = classify.filter(function (e) {
//                                                     let check = result.pattern.map(f => f['pattern_id'] == e.pattern_id)
//                                                     if (check.length > 1) {
//                                                         for (i in check) {
//                                                             if (check[i] == true) {
//                                                                 return e
//                                                             }
//                                                         }
//                                                     } else {
//                                                         if (check.pop() == true) {
//                                                             return e
//                                                         }
//                                                     }
//                                                 });
//                                                 result.data = data.filter(function (e) {
//                                                     let check1 = all_contents.indexOf(e.data_tag) != -1
//                                                     let check2 = result.pattern.map(f => f['pattern_tag'].indexOf(e.data_tag) != -1)
//                                                     if (check2.length > 1) {
//                                                         for (i in check2) {
//                                                             if (check2[i] == true || check1 == true) {
//                                                                 return e
//                                                             }
//                                                         }
//                                                     } else {
//                                                         if (check1 == true || check2.pop() == true) {
//                                                             return e
//                                                         }
//                                                     }
//                                                 })
//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 1 0 0 0 Success
//             } else if (policy_id === "" && pattern_id && classify_id === "" && acc_id === "" && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": policy.filter(function (e) { return e.doc_id == pattern[0].doc_id }),
//                                                     "pattern": pattern,
//                                                     "classify": classify.filter(function (e) { return e.pattern_id == pattern_id }),
//                                                     "account": account.filter(function (e) { return e.acc_id == pattern[0].acc_id }),
//                                                     "data": []
//                                                 }
//                                                 let total_tag = result.policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                 let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                 result.data = data.filter(function (e) {
//                                                     let check1 = all_contents.indexOf(e.data_tag) != -1
//                                                     let check2 = pattern[0].pattern_tag.indexOf(e.data_tag) != -1
//                                                     if (check1 == true || check2 == true) {
//                                                         return e
//                                                     }
//                                                 })
//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 0 1 0 0 hold check data because 1 more policy
//             } else if (policy_id === "" && pattern_id === "" && classify_id && acc_id === "" && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": [],
//                                                     "pattern": pattern.filter(function (e) { return e.pattern_id == classify[0].pattern_id }),
//                                                     "classify": classify,
//                                                     // not sure today use classify
//                                                     "account": account.filter(function (e) { return e.acc_id == classify[0].acc_id }),
//                                                     "data": []
//                                                 }
//                                                 result.policy = policy.filter(function (e) {
//                                                     let check = result.pattern.map(f => f['doc_id'] == e.doc_id)
//                                                     if (check.length > 1) {
//                                                         for (i in check) {
//                                                             if (check[i] == true) {
//                                                                 return e
//                                                             }
//                                                         }
//                                                     } else {
//                                                         if (check.pop() == true) {
//                                                             return e
//                                                         }
//                                                     }
//                                                 })
//                                                 if (result.policy.length > 1) {
//                                                     console.log("Wait to new version.")
//                                                 } else {
//                                                     let total_tag = result.policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                     let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                     result.data = data.filter(function (e) {
//                                                         let check1 = all_contents.indexOf(e.data_tag) != -1
//                                                         let check2 = result.pattern.map(f => f['pattern_tag'].indexOf(e.data_tag) != -1).pop()
//                                                         if (check1 == true || check2 == true) {
//                                                             return e
//                                                         }
//                                                     })
//                                                 }
//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 0 0 1 0 Hold check data bacause 1 more policy
//             } else if (policy_id === "" && pattern_id === "" && classify_id === "" && acc_id && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": policy.filter(function (e) { return e.user_id == account[0].acc_id }),
//                                                     "pattern": pattern.filter(function (e) { return e.acc_id == account[0].acc_id }),
//                                                     "classify": classify.filter(function (e) { return e.acc_id == account[0].acc_id }),
//                                                     "account": account,
//                                                     "data": []
//                                                 }
//                                                 if (result.policy.length > 1) {
//                                                     console.log("Wait to new version")
//                                                 } else {
//                                                     let total_tag = result.policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                     let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                     result.data = data.filter(function (e) {
//                                                         let check1 = all_contents.indexOf(e.data_tag) != -1
//                                                         let check2 = result.pattern.map(f => f['pattern_tag'].indexOf(e.data_tag) != -1).pop()
//                                                         if (check1 == true || check2 == true) {
//                                                             return e
//                                                         }
//                                                     })
//                                                 }

//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 0 0 0 1 
//             } else if (policy_id === "" && pattern_id === "" && classify_id === "" && acc_id === "" && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data;', (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": pattern.filter(function (e) { return e.pattern_tag.indexOf(data[0].data_tag) != -1 }),
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": data,
//                                                     }
//                                                     if (result.pattern.length > 0) {
//                                                         result.policy = policy.filter(function (e) {
//                                                             let check = result.pattern.map(f => f['doc_id'] == e.doc_id).pop()
//                                                             if (check == true) {
//                                                                 return e
//                                                             }
//                                                         })
//                                                         result.classify = classify.filter(function (e) {
//                                                             let check = result.pattern.map(f => f['pattern_id'] == e.pattern_id).pop()
//                                                             if (check == true) {
//                                                                 return e
//                                                             }
//                                                         })

//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data: data1, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 1 0 0 0 Success
//             } else if (policy_id && pattern_id && classify_id === "" && acc_id === "" && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": [],
//                                                     "pattern": [],
//                                                     "classify": [],
//                                                     "account": [],
//                                                     "data": [],
//                                                 }
//                                                 let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*?/gm, ""))
//                                                 let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                 // Check 3 way have the same 2
//                                                 let doc_id = policy.map(e => e['doc_id'])
//                                                 if (pattern.length > 0 && policy.length > 0) {
//                                                     if (pattern[0].doc_id == doc_id[0]) {
//                                                         result.policy = policy
//                                                         result.pattern = pattern
//                                                         result.classify = classify.filter(function (e) { return e.pattern_id == pattern_id })
//                                                         result.account = account.filter(function (e) { return e.acc_id == pattern[0].acc_id && e.acc_id == policy[0].user_id })
//                                                         result.data = data.filter(function (e) {
//                                                             let check1 = all_contents.indexOf(e.data_tag) != -1
//                                                             let check2 = pattern[0].pattern_tag.indexOf(e.data_tag) != -1
//                                                             if (check1 == true || check2 == true) {
//                                                                 return e
//                                                             }
//                                                         })
//                                                     }
//                                                 }
//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 0 1 0 0
//             } else if (policy_id && pattern_id === "" && classify_id && acc_id === "" && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": [],
//                                                     "pattern": [],
//                                                     "classify": [],
//                                                     "account": [],
//                                                     "data": [],
//                                                 }
//                                                 let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                 let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                 // Check 2 way because classify not have doc_id
//                                                 let doc_id = policy.map(e => e['doc_id'])
//                                                 if (classify.length > 0 && policy.length > 0) {
//                                                     result.classify = classify
//                                                     result.pattern = pattern.filter(function (e) { return e.pattern_id == classify[0].pattern_id && e.doc_id == policy_id })
//                                                     if (result.pattern.length > 0) {
//                                                         result.policy = policy
//                                                         result.account = account.filter(function (e) { return e.acc_id == classify[0].acc_id && e.acc_id == policy[0].user_id })
//                                                         result.data = data.filter(function (e) {
//                                                             let check1 = all_contents.indexOf(e.data_tag) != -1
//                                                             let check2 = result.pattern.map(f => f['pattern_tag'].indexOf(e.data_tag) != -1)
//                                                             if (check2.length > 1) {
//                                                                 for (i in check2) {
//                                                                     if (check2[i] == true || check1 == true) {
//                                                                         return e
//                                                                     }
//                                                                 }
//                                                             } else {
//                                                                 if (check1 == true || check2 == true) {
//                                                                     return e
//                                                                 }
//                                                             }
//                                                         })
//                                                     }
//                                                 }
//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 0 0 1 0 Success
//             } else if (policy_id && pattern_id === "" && classify_id === "" && acc_id && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id", (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": [],
//                                                     "pattern": [],
//                                                     "classify": [],
//                                                     "account": [],
//                                                     "data": [],
//                                                 }
//                                                 let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                 let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                 // Check 2 way because account not have doc_id
//                                                 if (account.length > 0 && policy.length > 0) {
//                                                     if (account[0].acc_id == policy[0].user_id) {
//                                                         result.policy = policy
//                                                         result.account = account
//                                                         result.pattern = pattern.filter(function (e) { return e.doc_id == policy[0].doc_id })
//                                                         result.classify = classify.filter(function (e) {
//                                                             let check = result.pattern.map(f => f['pattern_id'] == e.pattern_id)
//                                                             if (check.length > 1) {
//                                                                 for (i in check) {
//                                                                     if (check[i] == true) {
//                                                                         return e
//                                                                     }
//                                                                 }
//                                                             } else {
//                                                                 if (check.pop() == true) {
//                                                                     return e
//                                                                 }
//                                                             }
//                                                         })
//                                                         result.data = data.filter(function (e) {
//                                                             let check1 = all_contents.indexOf(e.data_tag) != -1
//                                                             let check2 = result.pattern.map(f => f['pattern_tag'].indexOf(e.data_tag) != -1)
//                                                             if (check2.length > 1) {
//                                                                 for (i in check2) {
//                                                                     if (check2[i] == true || check1 == true) {
//                                                                         return e
//                                                                     }
//                                                                 }
//                                                             } else {
//                                                                 if (check1 == true || check2.pop() == true) {
//                                                                     return e
//                                                                 }
//                                                             }
//                                                         })
//                                                     }
//                                                 }
//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 0 0 0 1 Success not sure wait from test
//             } else if (policy_id && pattern_id === "" && classify_id === "" && acc_id === "" && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id", (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                     let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                     // Check 2 way because data not have doc_id
//                                                     let data_tag_from_policy = data1.map(function (e) { if (all_contents.indexOf(e['data_tag']) != -1) { return e['data_id'] } else { return 0 } })
//                                                     if (data1.length > 0 && policy.length > 0) {
//                                                         result.data = data1
//                                                         let check = data_tag_from_policy.map(e => e == data1[0].data_id)
//                                                         if (check.length > 1) {
//                                                             for (i in check) {
//                                                                 if (check[i] == true) {
//                                                                     result.policy = policy
//                                                                     result.pattern = pattern.filter(function (e) { return e.doc_id == policy[0].doc_id })
//                                                                     result.classify = classify.filter(function (e) {
//                                                                         let check = result.pattern.map(f => f['pattern_id'] == e.pattern_id)
//                                                                         if (check.length > 1) {
//                                                                             for (i in check) {
//                                                                                 if (check[i] == true) {
//                                                                                     return e
//                                                                                 }
//                                                                             }
//                                                                         } else {
//                                                                             if (check.pop() == true) {
//                                                                                 return e
//                                                                             }
//                                                                         }
//                                                                     })
//                                                                     result.account = account.filter(function (e) { return e.acc_id == policy[0].user_id })
//                                                                 }
//                                                             }
//                                                         } else {
//                                                             if (check.pop() == true) {
//                                                                 result.policy = policy
//                                                                 result.pattern = pattern.filter(function (e) { return e.doc_id == policy[0].doc_id })
//                                                                 result.classify = classify.filter(function (e) {
//                                                                     let check = result.pattern.map(f => f['pattern_id'] == e.pattern_id)
//                                                                     if (check.length > 1) {
//                                                                         for (i in check) {
//                                                                             if (check[i] == true) {
//                                                                                 return e
//                                                                             }
//                                                                         }
//                                                                     } else {
//                                                                         if (check.pop() == true) {
//                                                                             return e
//                                                                         }
//                                                                     }
//                                                                 })
//                                                                 result.account = account.filter(function (e) { return e.acc_id == policy[0].user_id })
//                                                             }
//                                                         }
//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 1 1 0 0 logic here can not check data bacause 1 more policy
//             } else if (policy_id === "" && pattern_id && classify_id && acc_id === "" && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": [],
//                                                     "pattern": [],
//                                                     "classify": [],
//                                                     "account": [],
//                                                     "data": [],
//                                                 }
//                                                 // Check 3 way pattern and classify
//                                                 if (pattern.length > 0 && classify.length > 0) {
//                                                     if (pattern[0].pattern_id == classify[0].pattern_id) {
//                                                         result.policy = policy.filter(function (e) { return e.doc_id == pattern[0].doc_id })
//                                                         result.pattern = pattern
//                                                         result.classify = classify
//                                                         result.account = account.filter(function (e) { return e.acc_id == pattern[0].acc_id })
//                                                         let total_tag = result.policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                         let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                         result.data = data.filter(function (e) {
//                                                             let check1 = pattern[0].pattern_tag.indexOf(e.data_tag) != -1
//                                                             let check2 = all_contents.indexOf(e.data_tag) != -1
//                                                             if (check1 == true || check2 == true) {
//                                                                 return e
//                                                             }
//                                                         })
//                                                     }
//                                                 }
//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 1 0 1 0 logic here can not check data bacause 1 more policy
//             } else if (policy_id === "" && pattern_id && classify_id === "" && acc_id && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": [],
//                                                     "pattern": [],
//                                                     "classify": [],
//                                                     "account": [],
//                                                     "data": [],
//                                                 }
//                                                 // Check 1 way
//                                                 if (pattern.length > 0 && account.length > 0) {
//                                                     if (pattern[0].acc_id == account[0].acc_id) {
//                                                         result.policy = policy.filter(function (e) { return e.doc_id == pattern[0].doc_id })
//                                                         result.pattern = pattern
//                                                         result.classify = classify.filter(function (e) { return e.pattern_id == pattern[0].pattern_id })
//                                                         result.account = account.filter(function (e) { return e.acc_id == pattern[0].acc_id })
//                                                         let total_tag = result.policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                         let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                         result.data = data.filter(function (e) {
//                                                             let check1 = pattern[0].pattern_tag.indexOf(e.data_tag) != -1
//                                                             let check2 = all_contents.indexOf(e.data_tag) != -1
//                                                             if (check1 == true || check2 == true) {
//                                                                 return e
//                                                             }
//                                                         })
//                                                     }
//                                                 }
//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 1 0 0 1 Success
//             } else if (policy_id === "" && pattern_id && classify_id === "" && acc_id === "" && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     // Check 1 way
//                                                     if (pattern.length > 0 && data1.length > 0) {
//                                                         if (pattern[0].pattern_tag.indexOf(data1[0].data_tag) != -1) {
//                                                             result.policy = policy.filter(function (e) { return e.doc_id == pattern[0].doc_id })
//                                                             result.pattern = pattern
//                                                             result.classify = classify.filter(function (e) { return e.pattern_id == pattern[0].pattern_id })
//                                                             // not sure today use pattern
//                                                             result.account = account.filter(function (e) { return e.acc_id == pattern[0].acc_id })
//                                                             result.data = data
//                                                         }
//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 0 1 1 0 Hold check data bacause 1 more policy
//             } else if (policy_id === "" && pattern_id === "" && classify_id && acc_id && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": [],
//                                                     "pattern": [],
//                                                     "classify": [],
//                                                     "account": [],
//                                                     "data": [],
//                                                 }
//                                                 // Check 2 way account, policy
//                                                 if (classify.length > 0 && account.length > 0) {
//                                                     if (classify[0].acc_id == account[0].acc_id) {
//                                                         result.pattern = pattern.filter(function (e) { return e.pattern_id == classify[0].pattern_id })
//                                                         result.classify = classify
//                                                         result.account = account
//                                                         result.policy = policy.filter(function (e) {
//                                                             let check = result.pattern.map(f => f['doc_id'] == e.doc_id)
//                                                             if (check.length > 1) {
//                                                                 for (i in check) {
//                                                                     if (check[i] == true) {
//                                                                         return e
//                                                                     }
//                                                                 }
//                                                             } else {
//                                                                 if (check.pop() == true) {
//                                                                     return e
//                                                                 }
//                                                             }
//                                                         })
//                                                         if (result.policy.length > 1) {
//                                                             console.log("Wait to new version")
//                                                         } else {
//                                                             let total_tag = result.policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                             let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                             result.data = data.filter(function (e) {
//                                                                 let check1 = all_contents.indexOf(e.data_tag)
//                                                                 let check2 = result.pattern.map(f => f['pattern_tag'].indexOf(e.data_tag) != -1).pop()
//                                                                 if (check1 == true || check2 == true) {
//                                                                     return e
//                                                                 }
//                                                             })
//                                                         }
//                                                     }
//                                                 }
//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 0 1 0 1 Success not sure
//             } else if (policy_id === "" && pattern_id === "" && classify_id && acc_id === "" && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     // Check 1 way
//                                                     if (classify.length > 0 && data1.length > 0) {
//                                                         result.pattern = pattern.filter(function (e) { return e.pattern_id == classify[0].pattern_id })
//                                                         result.classify = classify
//                                                         if (result.pattern.map(e => e['pattern_tag'].indexOf(data1[0].data_tag) != -1).pop() == true) {
//                                                             // not sure today use classify
//                                                             result.account = account.filter(function (e) { return e.acc_id == classify[0].acc_id })
//                                                             result.policy = policy.filter(function (e) {
//                                                                 let check = result.pattern.map(f => f['doc_id'] == e.doc_id)
//                                                                 if (check.length > 1) {
//                                                                     for (i in check) {
//                                                                         if (check[i] == true) {
//                                                                             return e
//                                                                         }
//                                                                     }
//                                                                 } else {
//                                                                     if (check == true) {
//                                                                         return e
//                                                                     }
//                                                                 }
//                                                             })
//                                                             result.data = data1
//                                                         }
//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 0 0 1 1  Hold cannot check bug bacause pattern > 1 i'm think function here not success today 05/23/2022
//             } else if (policy_id === "" && pattern_id === "" && classify_id === "" && acc_id && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     // Check 4 way pattern, policy, data
//                                                     if (acc_id.length > 0 && data1.length > 0) {
//                                                         let all_contents = new Array(policy.length);
//                                                         policy.forEach(function (e, i) {
//                                                             let first = e['page_content'].replace(/<[^>]*>?/gm, "")
//                                                             let second = first.replace(/(\r\n|\n|\r)/gm, "")
//                                                             all_contents[i] = { "id": e['doc_id'], "contents": second, "a_id": e['user_id'] }
//                                                         })
//                                                         let _check_ = [];
//                                                         let _check1_ = [];
//                                                         if (account.length > 0 && data1.length > 0) {
//                                                             result.account = account
//                                                             result.data = data1
//                                                             all_contents.forEach(function (e) {
//                                                                 let mapping_pattern = pattern.map(f => f['doc_id'] == e['id'])
//                                                                 if (mapping_pattern.length > 1) {
//                                                                     for (i in mapping_pattern) {
//                                                                         if (e['contents'].indexOf(data1[0].data_tag) != -1 && mapping_pattern[i] == true && account[0].acc_id == e['user_id']) {
//                                                                             _check_.push(e['id'])
//                                                                         } else {
//                                                                             _check_ = 0
//                                                                         }
//                                                                     }
//                                                                 } else {
//                                                                     if (e['contents'].indexOf(data1[0].data_tag) != -1 && mapping_pattern.pop() == true && account[0].acc_id == e['user_id']) {
//                                                                         _check_.push(e['id'])
//                                                                     } else {
//                                                                         _check_ = 0
//                                                                     }
//                                                                 }
//                                                             })
//                                                             pattern.forEach(function (e) {
//                                                                 if (e['pattern_tag'].indexOf(data1[0].data_tag) != -1) {
//                                                                     _check1_.push(e['pattern_id'])
//                                                                 } else {
//                                                                     _check1_ = 0
//                                                                 }
//                                                             })
//                                                             let check;
//                                                             let check1;
//                                                             if (typeof _check_ != "number") {
//                                                                 check = new Set(_check_)
//                                                                 check = [...check]
//                                                             } else {
//                                                                 check = _check_
//                                                             }
//                                                             if (typeof _check1_ != "number") {
//                                                                 check1 = new Set(_check1_)
//                                                                 check1 = [...check1]
//                                                             }
//                                                             if (typeof check == "number" && typeof check1 == "object") {
//                                                                 if (check == 0 && check1.length > 0) {
//                                                                     result.policy = policy.filter(function (e) {
//                                                                         let check_in_side = pattern.map(f => f['doc_id'] == e.doc_id)
//                                                                         if (check_in_side.length > 1) {
//                                                                             for (i in check_in_side) {
//                                                                                 if (check_in_side[i] == true && e.acc_id == account) {
//                                                                                     if (pattern[i].doc_id == e.doc_id) {
//                                                                                         return e
//                                                                                     }
//                                                                                 }
//                                                                             }
//                                                                         } else {
//                                                                             if (check_in_side.pop() == true && e.acc_id == account[0].acc_id) {
//                                                                                 if (pattern[check_in_side.length].doc_id == e.doc_id) {
//                                                                                     return e
//                                                                                 }
//                                                                             }
//                                                                         }

//                                                                     })
//                                                                 } else {
//                                                                     result.policy = policy.filter(function (e) { return e.doc_id == check })
//                                                                 }
//                                                             } else if (typeof check == "object" && typeof check1 == "object") {
//                                                                 if (check.length == check1.length) {
//                                                                     for (i in check) {
//                                                                         if (check[i] == 0) {
//                                                                             let check_in_side = pattern.map(f => f['doc_id'] == e.doc_id)
//                                                                             result.policy = policy.filter(function (e) {
//                                                                                 if (check_in_side.length > 1) {
//                                                                                     check_in_side.forEach(function (f, j) {
//                                                                                         if (f == true && e.acc_id == account[0].acc_id) {
//                                                                                             if (pattern[i].doc_id == e.doc_id) {
//                                                                                                 return e
//                                                                                             }
//                                                                                         }
//                                                                                     })
//                                                                                 } else {
//                                                                                     if (check_in_side.pop() == true && e.acc_id == account[0].acc_id) {
//                                                                                         if (pattern[check_in_side.length].doc_id == e['doc_id']) {
//                                                                                             return e
//                                                                                         }
//                                                                                     }
//                                                                                 }
//                                                                             })
//                                                                         } else {
//                                                                             result.policy = policy.filter(function (e) { return e.doc_id == check[i] })
//                                                                         }
//                                                                     }
//                                                                 } else if (check.length > check1.length) {
//                                                                     let separator = check.length - check1.length
//                                                                     // Hold to new version
//                                                                 } else if (check.length < check1.length) {
//                                                                     let separator = check1.length - check.length
//                                                                     // Hold to new version
//                                                                 }
//                                                             } else if (typeof check == "number" && typeof check1 == "number") {
//                                                                 if (check1 == 0 && check1 > 0) {
//                                                                     result.policy = policy.filter(function (e) {
//                                                                         let doc_id_from_pattern = pattern.map(function (e) {
//                                                                             if (e['pattern_id'] == check1) {
//                                                                                 return e['doc_id']
//                                                                             }
//                                                                         })
//                                                                         if (doc_id_from_pattern.length > 1) {
//                                                                             for (i in doc_id_from_pattern) {
//                                                                                 if (e.acc_id == account[0].acc_id && e.doc_id == doc_id_from_pattern[i]) {
//                                                                                     return e
//                                                                                 }
//                                                                             }
//                                                                         } else {
//                                                                             if (e.acc_id == account[0].acc_id && e.doc_id == doc_id_from_pattern.pop()) {
//                                                                                 return e
//                                                                             }
//                                                                         }
//                                                                     })
//                                                                 } else {
//                                                                     result.policy = policy.filter(function (e) { return e.doc_id == check })
//                                                                 }
//                                                             }
//                                                             if (typeof check1 == "object") {
//                                                                 if (check1.length > 1) {
//                                                                     for (i in check1) {
//                                                                         result.pattern.push(pattern.filter(function (e) { return e.pattern_id == check1[i] && e.acc_id == account[0].acc_id }))
//                                                                     }
//                                                                 } else {
//                                                                     result.pattern = pattern.filter(function (e) { return e.pattern_id == check1[0] && e.acc_id == account[0].acc_id })
//                                                                 }
//                                                             } else if (typeof check1 == "number") {
//                                                                 if (check1 > 0) {
//                                                                     result.pattern = pattern.filter(function (e) {
//                                                                         if (e.pattern_id == check1 && e.acc_id == account[0].acc_id) {
//                                                                             return e
//                                                                         }
//                                                                     })

//                                                                 }
//                                                             }
//                                                             if (result.pattern.length > 0) {
//                                                                 result.classify = classify.filter(function (e) {
//                                                                     let total_pattern_id_from_result = pattern.map(f => f['pattern_id'] == e.pattern_id)
//                                                                     if (total_pattern_id_from_result.length > 1) {
//                                                                         return e
//                                                                     } else {
//                                                                         if (total_pattern_id_from_result[0] == true && e.acc_id == account[0].acc_id) {
//                                                                             return e
//                                                                         }
//                                                                     }
//                                                                 })
//                                                             }
//                                                         }
//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 0 1 1 1 Hold not sure wait new modify
//             } else if (policy_id === "" && pattern_id === "" && classify_id && acc_id && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     // Check 2 way pattern and policy
//                                                     if (classify.length > 0 && data1.length > 0 && account.length > 0) {
//                                                         if (classify[0].acc_id == acc_id) {
//                                                             result.pattern = pattern.filter(function (e) { return e.pattern_id == classify[0].pattern_id })
//                                                             result.classify = classify
//                                                             let check_data_from_pattern = result.pattern.map(e => e['pattern_tag'].indexOf(data1[0].data_tag) != -1)
//                                                             // not sure wait new modify
//                                                             if (check_data_from_pattern.length > 1) {
//                                                                 console.log("Wait to new version.")
//                                                             } else {
//                                                                 if (check_data_from_pattern[0] == true) {
//                                                                     result.account = account
//                                                                     result.policy = policy.filter(function (e) {
//                                                                         let check = result.pattern.map(f => f['doc_id'] == e.doc_id)
//                                                                         if (check.length > 1) {
//                                                                             for (i in check) {
//                                                                                 if (check[i] == true) {
//                                                                                     return e
//                                                                                 }
//                                                                             }
//                                                                         } else {
//                                                                             if (check.pop() == true) {
//                                                                                 return e
//                                                                             }
//                                                                         }

//                                                                     })
//                                                                     result.data = data1
//                                                                 }
//                                                             }
//                                                         }

//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 1 0 1 1 Success
//             } else if (policy_id === "" && pattern_id && classify_id === "" && acc_id && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     // Check 1 way
//                                                     if (pattern.length > 0 && account.length > 0 && data1.length > 0) {
//                                                         if (pattern[0].acc_id == acc_id && pattern[0].pattern_tag.indexOf(data1[0].data_tag) != -1) {
//                                                             result.pattern = pattern
//                                                             result.classify = classify.filter(function (e) { return e.pattern_id == pattern[0].pattern_id })
//                                                             result.account = account
//                                                             result.policy = policy.filter(function (e) {
//                                                                 if (e.doc_id == pattern[0].doc_id) {
//                                                                     return e
//                                                                 }
//                                                             })
//                                                             result.data = data1
//                                                         }
//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 1 1 0 1 Success
//             } else if (policy_id === "" && pattern_id && classify_id && acc_id === "" && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     // Check 1 way
//                                                     if (pattern.length > 0 && classify.length > 0 && data1.length > 0) {
//                                                         if (pattern[0].pattern_id == classify[0].pattern_id && pattern[0].pattern_tag.indexOf(data1[0].data_tag) != -1) {
//                                                             result.pattern = pattern
//                                                             result.classify = classify
//                                                             result.account = account.filter(function (e) { return e.acc_id == pattern[0].acc_id && classify[0].acc_id == e.acc_id })
//                                                             result.policy = policy.filter(function (e) {
//                                                                 if (e.doc_id == pattern[0].doc_id) {
//                                                                     return e
//                                                                 }
//                                                             })
//                                                             result.data = data1
//                                                         }
//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 1 1 1 0 Success
//             } else if (policy_id === "" && pattern_id && classify_id && acc_id && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": [],
//                                                     "pattern": [],
//                                                     "classify": [],
//                                                     "account": [],
//                                                     "data": [],
//                                                 }
//                                                 // Check 1 way
//                                                 if (pattern.length > 0 && classify.length > 0 && account.length > 0) {
//                                                     if (pattern[0].pattern_id == classify[0].pattern_id && pattern[0].acc_id == acc_id && classify[0].acc_id == acc_id) {
//                                                         result.pattern = pattern
//                                                         result.classify = classify
//                                                         result.account = account
//                                                         result.policy = policy.filter(function (e) {
//                                                             if (e.doc_id == pattern[0].doc_id) {
//                                                                 return e
//                                                             }
//                                                         })
//                                                         result.data = data.filter(function (e) { return e.doc_id == pattern[0].doc_id })
//                                                     }
//                                                 }
//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 1 1 1 1 Success
//             } else if (policy_id === "" && pattern_id && classify_id && acc_id && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     // Check 1 way
//                                                     if (pattern.length > 0 && classify.length > 0 && account.length > 0 && data1.length > 0) {
//                                                         if (pattern[0].pattern_id == classify[0].pattern_id && pattern[0].pattern_tag.indexOf(data1[0].data_tag) != -1 && (pattern[0].acc_id == acc_id || classify[0].acc_id == acc_id)) {
//                                                             result.pattern = pattern
//                                                             result.classify = classify
//                                                             result.account = account
//                                                             result.policy = policy.filter(function (e) {
//                                                                 if (e.doc_id == pattern[0].doc_id) {
//                                                                     return e
//                                                                 }
//                                                             })
//                                                             result.data = data1
//                                                         }
//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 0 0 1 1 Success
//             } else if (policy_id && pattern_id === "" && classify_id === "" && acc_id && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     // Check 1 way
//                                                     if (policy.length > 0 && account.length > 0 && data1.length > 0) {
//                                                         let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                         let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                         if (pattern[0].pattern_tag.indexOf(data1[0].data_tag) != -1 && (pattern[0].acc_id == acc_id || classify[0].acc_id == acc_id) && pattern[0].doc_id == policy_id || all_contents.indexOf(data1[0].data_tag) != -1) {
//                                                             result.policy = policy
//                                                             result.pattern = pattern
//                                                             result.classify = classify.filter(function (e) { return e.pattern_id == pattern_id })
//                                                             result.account = account
//                                                             result.data = data1
//                                                         }
//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 0 1 0 1 // Hold not sure wait new modify
//             } else if (policy_id && pattern_id === "" && classify_id && acc_id === "" && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     // Check 2 way pattern
//                                                     if (policy.length > 0 && classify.length > 0 && data1.length > 0) {
//                                                         let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                         let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                         result.pattern = pattern.filter(function (e) {
//                                                             if (e.pattern_id == classify[0].pattern_id && e.doc_id == policy_id) {
//                                                                 return e
//                                                             }
//                                                         })
//                                                         // bacause 1 more pattern
//                                                         if (result.pattern.length > 1) {
//                                                             let total_check = result.pattern.map(e => e['pattern_tag'].indexOf(data1[0].data_tag) != -1)
//                                                             for (i in total_check) {
//                                                                 if (total_check[i] == true || all_contents.indexOf(data1[0].data_tag) != -1) {
//                                                                     result.policy = policy
//                                                                     result.classify = classify
//                                                                     // not sure today use from policy
//                                                                     result.account = account.filter(function (e) { return e.acc_id == policy[0].user_id })
//                                                                     result.data = data1
//                                                                 }
//                                                             }
//                                                         } else {
//                                                             let check_data_from_pattern = result.pattern.map(e => e['pattern_tag'].indexOf(data1[0].data_tag) != -1)
//                                                             // not suse wait new modify
//                                                             if (check_data_from_pattern.length > 1) {
//                                                                 console.log("Wait to new version")
//                                                             } else {
//                                                                 if (check_data_from_pattern[0] == true || all_contents.indexOf(data1[0].data_tag) != -1) {
//                                                                     result.policy = policy
//                                                                     result.classify = classify
//                                                                     // not sure today use from policy
//                                                                     result.account = account.filter(function (e) { return e.acc_id == policy[0].user_id })
//                                                                     result.data = data1
//                                                                 }
//                                                             }
//                                                         }
//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 0 1 1 0 Success
//             } else if (policy_id && pattern_id === "" && classify_id && acc_id && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": [],
//                                                     "pattern": [],
//                                                     "classify": [],
//                                                     "account": [],
//                                                     "data": [],
//                                                 }
//                                                 // Check 2 way pattern
//                                                 if (policy.length > 0 && classify.length > 0 && account.length > 0) {
//                                                     if (policy[0].user_id == account[0].acc_id && classify[0].acc_id == account[0].acc_id) {
//                                                         let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                         let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                         result.pattern = pattern.filter(function (e) {
//                                                             if (e.pattern_id == classify[0].pattern_id && e.acc_id == acc_id && e.doc_id == policy_id) {
//                                                                 return e
//                                                             }
//                                                         })
//                                                         if (result.pattern.length > 0 && result.pattern.map(e => e['doc_id'] == policy_id).pop() == true) {
//                                                             result.policy = policy
//                                                             result.classify = classify
//                                                             result.account = account
//                                                             result.data = data.filter(function (e) {
//                                                                 let check = result.pattern.map(e => e['pattern_tag'].indexOf(e.data_tag) != -1)
//                                                                 let check1 = all_contents.indexOf(e.data_tag) != -1
//                                                                 if (check.length > 1) {
//                                                                     for (i in check) {
//                                                                         if (check[i] == true || check1 == true) {
//                                                                             return e
//                                                                         }
//                                                                     }
//                                                                 } else {
//                                                                     if (check.pop() == true || check1 == true) {
//                                                                         return e
//                                                                     }
//                                                                 }
//                                                             })
//                                                         }
//                                                     }
//                                                 }
//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 0 1 1 1 some have small not sure (Success)
//             } else if (policy_id && pattern_id === "" && classify_id && acc_id && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     if (policy.length > 0 && classify.length > 0 && account.length > 0 && data1.length > 0) {
//                                                         let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                         let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                         if (policy[0].user_id == account[0].acc_id && classify[0].acc_id == account[0].acc_id && all_contents.indexOf(data1[0].data_tag) != -1) {
//                                                             // not sure but today is pattern check a data1
//                                                             result.pattern = pattern.filter(function (e) {
//                                                                 if (e.pattern_id == classify[0].pattern_id && e.acc_id == acc_id && e.doc_id == policy_id && e.pattern_tag.indexOf(data1[0].data_tag) != -1) {
//                                                                     return e
//                                                                 }
//                                                             })
//                                                             if (result.pattern.length > 0 && result.pattern.map(e => e['doc_id'] == policy_id).pop() == true) {
//                                                                 result.policy = policy
//                                                                 result.classify = classify
//                                                                 result.account = account
//                                                                 result.data = data1
//                                                             }
//                                                         }

//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 1 0 0 1 Success
//             } else if (policy_id && pattern_id && classify_id === "" && acc_id === "" && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     if (policy.length > 0 && pattern.length > 0 && data1.length > 0) {
//                                                         let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                         let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                         if (policy[0].doc_id == pattern[0].doc_id && pattern[0].pattern_tag.indexOf(data1[0].data_tag) != -1 && all_contents.indexOf(data1[0].data_tag) != -1) {
//                                                             result.policy = policy
//                                                             result.pattern = pattern
//                                                             result.classify = classify.filter(function (e) {
//                                                                 if (e.pattern_id == pattern[0].pattern_id) {
//                                                                     return e
//                                                                 }
//                                                             })
//                                                             // not sure check today use pattern and policy
//                                                             result.account = account.filter(function (e) {
//                                                                 if (e.acc_id == pattern[0].acc_id && e.acc_id == policy[0].user_id) {
//                                                                     return e
//                                                                 }
//                                                             })
//                                                             result.data = data1
//                                                         }
//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 1 0 1 0 Success
//             } else if (policy_id && pattern_id && classify_id === "" && acc_id && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": [],
//                                                     "pattern": [],
//                                                     "classify": [],
//                                                     "account": [],
//                                                     "data": [],
//                                                 }
//                                                 // Check 2 way pattern
//                                                 if (policy.length > 0 && pattern.length > 0 && account.length > 0) {
//                                                     if (policy[0].doc_id == pattern[0].doc_id && policy[0].user_id == account[0].acc_id && pattern[0].acc_id == account[0].acc_id) {
//                                                         let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                         let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                         result.policy = policy
//                                                         result.pattern = pattern
//                                                         result.classify = classify.filter(function (e) {
//                                                             if (e.pattern_id == pattern[0].pattern_id) {
//                                                                 return e
//                                                             }
//                                                         })
//                                                         result.account = account
//                                                         result.data = data.filter(function (e) {
//                                                             let check = all_contents.indexOf(e.data_tag) != -1
//                                                             let check1 = pattern[0].pattern_tag.indexOf(e.data_tag) != -1
//                                                             if (check1 == true || check == true) {
//                                                                 return e
//                                                             }
//                                                         })
//                                                     }
//                                                 }
//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 1 0 1 1 Success
//             } else if (policy_id && pattern_id && classify_id === "" && acc_id && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     if (policy.length > 0 && pattern.length > 0 && account.length > 0 && data1.length > 0) {
//                                                         let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                         let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                         if (pattern[0].doc_id == policy[0].doc_id && pattern[0].acc_id == account[0].acc_id && policy[0].user_id == account[0].acc_id && (pattern[0].pattern_tag.indexOf(data1[0].data_tag) != -1 || all_contents.indexOf(data1[0].data_tag) != -1)) {
//                                                             result.policy = policy
//                                                             result.pattern = pattern
//                                                             result.classify = classify.filter(function (e) {
//                                                                 if (e.pattern_id == pattern[0].pattern_id && e.acc_id == account[0].acc_id) {
//                                                                     return e
//                                                                 }
//                                                             })
//                                                             result.account = account
//                                                             result.data = data1
//                                                         }
//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 1 1 0 1 Success
//             } else if (policy_id && pattern_id && classify_id && acc_id === "" && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account;', (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     if (policy.length > 0 && pattern.length > 0 && classify.length > 0 && data1.length > 0) {
//                                                         let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                         let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                         if (policy[0].doc_id == pattern[0].doc_id && pattern[0].pattern_id == classify[0].pattern_id && (pattern[0].pattern_tag.index(data1[0].data_tag) != -1 || all_contents.indexOf(data1[0].data_tag) != -1)) {
//                                                             result.policy = policy
//                                                             result.pattern = pattern
//                                                             result.classify = classify
//                                                             // not sure today use pattern, classify, and policy to check
//                                                             result.account = account.filter(function (e) {
//                                                                 if (e.acc_id == pattern[0].acc_id && e.acc_id == policy[0].user_id && e.acc_id == classify[0].acc_id) {
//                                                                     return e
//                                                                 }
//                                                             })
//                                                             result.data = data1
//                                                         }
//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 1 1 1 0 Success
//             } else if (policy_id && pattern_id && classify_id && acc_id && data_id === "") {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             if (err) { res.json(err); } else {
//                                                 let word = []
//                                                 let word1 = []
//                                                 for (i in words) {
//                                                     word.push(words[i].words_id)
//                                                     word1.push(words[i].words_often)
//                                                 }
//                                                 let result = {
//                                                     "policy": [],
//                                                     "pattern": [],
//                                                     "classify": [],
//                                                     "account": [],
//                                                     "data": [],
//                                                 }
//                                                 if (policy.length > 0 && pattern.length > 0 && classify.length > 0 && account.length > 0) {
//                                                     if (pattern[0].doc_id == policy[0].doc_id && pattern[0].pattern_id == classify[0].pattern_id && pattern[0].acc_id == account[0].acc_id && policy[0].user_id == account[0].acc_id && classify[0].acc_id == account[0].acc_id) {
//                                                         let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                         let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                         result.policy = policy
//                                                         result.pattern = pattern
//                                                         result.classify = classify
//                                                         result.account = account
//                                                         result.data = data.filter(function (e) {
//                                                             let check = pattern[0].pattern_tag.indexOf(e.data_tag) != -1
//                                                             let check1 = all_contents.indexOf(e.data_tag) != -1
//                                                             if (check == true || check1 == true) {
//                                                                 return e
//                                                             }
//                                                         })
//                                                     }
//                                                 }
//                                                 if (err) { res.json(err) } else {
//                                                     res.json({ result, data, account })
//                                                 }
//                                             }
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 1 1 1 1 1 Success
//             } else if (policy_id && pattern_id && classify_id && acc_id && data_id) {
//                 conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from doc_pdpa_document as d join doc_pdpa_document_log as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
//                     conn.query('SELECT * FROM doc_pdpa_words ', (err, words) => {
//                         conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE AND dpd.doc_id = ?;', [policy_id], (err, policy) => {
//                             conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id WHERE pattern_id = ?;', [pattern_id], (err, pattern) => {
//                                 conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id WHERE classify_id = ?;", [classify_id], (err, classify) => {
//                                     conn.query('SELECT * FROM account WHERE acc_id = ?;', [acc_id], (err, account) => {
//                                         conn.query('SELECT * FROM doc_pdpa_data;', (err, data) => {
//                                             conn.query('SELECT * FROM doc_pdpa_data WHERE data_id = ?;', [data_id], (err, data1) => {
//                                                 if (err) { res.json(err); } else {
//                                                     let word = []
//                                                     let word1 = []
//                                                     for (i in words) {
//                                                         word.push(words[i].words_id)
//                                                         word1.push(words[i].words_often)
//                                                     }
//                                                     let result = {
//                                                         "policy": [],
//                                                         "pattern": [],
//                                                         "classify": [],
//                                                         "account": [],
//                                                         "data": [],
//                                                     }
//                                                     if (policy.length > 0 && pattern.length > 0 && classify.length > 0 && account.length > 0 && data1.length > 0) {
//                                                         let total_tag = policy.map(e => e['page_content'].replace(/<[^>]*>?/gm, ""))
//                                                         let all_contents = total_tag.map(e => e.replace(/(\r\n|\n|\r)/gm, "")).join("")
//                                                         if (pattern[0].doc_id == policy[0].doc_id && pattern[0].pattern_id == classify[0].pattern_id && pattern[0].acc_id == account[0].acc_id && policy[0].user_id == account[0].acc_id && classify[0].acc_id == account[0].acc_id && (pattern[0].pattern_tag.indexOf(data1[0].data_tag) != -1 || all_contents.indexOf(data1[0].data_tag) != -1)) {
//                                                             result.policy = policy
//                                                             result.pattern = pattern
//                                                             result.classify = classify
//                                                             result.account = account
//                                                             result.data = data1
//                                                         }
//                                                     }
//                                                     if (err) { res.json(err) } else {
//                                                         res.json({ result, data, account })
//                                                     }
//                                                 }
//                                             })
//                                         })
//                                     })
//                                 })
//                             })
//                         })
//                     })
//                 })
//                 // 0 0 0 0 0 Success on page show only policy, pattern, and classify linked
//             } else {
//                 conn.query('SELECT * FROM doc_pdpa_document as dpd JOIN doc_pdpa_document_page as dpdp ON dpdp.doc_id = dpd.doc_id JOIN account as a ON dpd.user_id = a.acc_id WHERE dpd.doc_status = 2 AND dpd.doc_action IS NOT TRUE AND dpdp.page_action IS NOT TRUE;', (err, policy) => {
//                     conn.query('SELECT * FROM doc_pdpa_pattern as dpp JOIN account as a ON dpp.acc_id = a.acc_id;', (err, pattern) => {
//                         conn.query("SELECT * FROM doc_pdpa_classification as dpc JOIN account as a ON dpc.acc_id = a.acc_id JOIN doc_pdpa_pattern as dpp ON dpc.pattern_id = dpp.pattern_id JOIN doc_pdpa_pattern_processing_base as dppp ON dpc.pattern_processing_base_id = dppp.pattern_processing_base_id JOIN doc_pdpa_classification_special_conditions as dpcsc ON dpc.classification_special_conditions_id = dpcsc.classification_special_conditions_id;", (err, classify) => {
//                             conn.query('SELECT * FROM account;', (err, account) => {
//                                 conn.query("SELECT * FROM doc_pdpa_data;", (err, data) => {
//                                     if (err) { res.json(err); } else {
//                                         let result = {
//                                             "policy": policy,
//                                             "pattern": pattern,
//                                             "classify": classify,
//                                             "account": account,
//                                             "data": data
//                                         };
//                                         res.json({ result, account, data });
//                                     }
//                                 })
//                             })
//                         })
//                     })
//                 })
//             }
//         })
//     }
// }

controller.printDataflow = (req, res) => {
    if (typeof req.session.userid == "undefined") { res.redirect('/') } else {
        res.render('./classification/dataflow_print', { message: req.body.value })
    }
}
controller.eventProcessList = (req, res) => {
    if (typeof req.session.userid == "undefined") { res.redirect('/') } else {
        // const user = req.session.userid;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC;', [user], (err, history) => {
                conn.query('SELECT * FROM TB_MM_PDPA_WORDS ', (err, words) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_EVENT_PROCESS;', (err, event) => {
                        let word = []
                        let word1 = []
                        for (i in words) {
                            word.push(words[i].words_id)
                            word1.push(words[i].words_often)
                        }
                        if (err) { res.json(err) } else {
                            checkDiskSpace(path.join(__dirname + './')).then((diskSpace) => {
                                funchistory.funchistory(req, "event_process", `เข้าสู่เมนู กิจกรรมประมวลผล`, req.session.userid)
                                res.render('./classification/eventProcessList', {
                                    session: req.session,
                                    checkdiskspace: diskSpace,
                                    event: event,
                                    used: 0,
                                    history: history,
                                    words: words,
                                    words1: word,
                                    words2: word1,
                                    session: req.session
                                })
                            })
                        }
                    })
                })
            })
        })
    }
}
controller.eventProcessNew = (req, res) => {
    if (typeof req.session.userid == 'undefined') { res.redirect('/') } else {
        // const user = req.session.userid;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_MEASURES as ms left join TB_TR_MEASURES_TYPE as m_type on ms.measures_type_id=m_type.measures_type_id  WHERE acc_id=? AND specify_id=1', [user], (err, measures) => {
                conn.query('SELECT * FROM TB_TR_MEASURES_RISK_BASED_APPROACH AS approach LEFT JOIN TB_TR_MEASURES AS measures ON approach.measures_id=measures.measures_id  WHERE measures.acc_id=? and measures.specify_id=2', [user], (err, approach) => {
                    conn.query("SELECT *,specifi.specific_id as pdpa_spcecifi FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id  WHERE measures.specify_id=3 AND measures.acc_id=? ORDER BY specifi.specific_id DESC", [user], (err, specific) => {
                        if (err) { res.json(err) } else {
                            res.render('./classification/eventProcessNew', {
                                session: req.session,
                                measures,
                                approach,
                                specific,
                                session: req.session
                            })
                        }
                    })
                })
            })
        })
    }
}
controller.eventProcessCreate = (req, res) => {
    if (typeof req.session.userid == 'undefined') { res.redirect('/') } else {
        req.getConnection((err, conn) => {
            const data = req.body
            let measures_id = '0'
            let approach_id = '0'
            let specific_id = '0'
            if (req.body.measures_id) {
                measures_id = data.measures_id.toString()
            }
            if (req.body.approach_id) {
                approach_id = data.approach_id.toString()
            }
            if (req.body.specific_id) {
                specific_id = data.specific_id.toString()
            }
            conn.query('SELECT * FROM TB_TR_PDPA_EVENT_PROCESS order by event_process_id DESC limit 1;', (err, doc_pdpa_event_process) => {
                funchistory.funchistory(req, "event_process", `เพิ่มข้อมูล กิจกรรมประมวลผล ${req.body.event_process_name} `, req.session.userid)
                if (doc_pdpa_event_process.length > 0) {
                    var keycode = 'AC';
                    var code = parseInt(doc_pdpa_event_process[0].event_process_code.split('AC')[1]) + 1;
                    code = keycode + String(code).padStart(4, '0');
                    var data_insert = { event_process_code: code, event_process_name: req.body.event_process_name, measures_id: measures_id, approach_id: approach_id, specific_id: specific_id }  // ปิดใว้ก่อนสำหรับพี่ใหม่ ทดสอบฝห้ลูกค้า 24/02/2566
                    // var data_insert = { event_process_code: code, event_process_name: req.body.event_process_name }
                    conn.query('INSERT INTO TB_TR_PDPA_EVENT_PROCESS SET  ?;', [data_insert], (err, pass) => {
                        if (err) { res.json(err) } else { res.redirect('/classification/event/') }
                    })
                } else {
                    var data_insert = { event_process_code: 'AC0001', event_process_name: req.body.event_process_name, measures_id: measures_id, approach_id: approach_id, specific_id: specific_id } // ปิดใว้ก่อนสำหรับพี่ใหม่ ทดสอบฝห้ลูกค้า 24/02/2566
                    // var data_insert = { event_process_code: 'AC0001', event_process_name: req.body.event_process_name }
                    conn.query('INSERT INTO TB_TR_PDPA_EVENT_PROCESS SET  ?;', [data_insert], (err, pass) => {
                        if (err) { res.json(err) } else { res.redirect('/classification/event/') }
                    })
                }

            })
        })
    }
}
controller.eventProcessEdit = (req, res) => {
    if (typeof req.session.userid == "undefined") { res.redirect('/') } else {
        // const user = req.session.userid;
        var user = '';
        if (req.session.acc_id_control) {
            user = req.session.acc_id_control
        } else {
            user = req.session.userid
        }
        const { id } = req.params;
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_MEASURES WHERE acc_id=? AND specify_id=1 ', [user], (err, measures) => {
                conn.query('SELECT * FROM TB_TR_MEASURES_RISK_BASED_APPROACH AS approach LEFT JOIN TB_TR_MEASURES AS measures ON approach.measures_id=measures.measures_id  WHERE measures.acc_id=? and measures.specify_id=2', [user], (err, approach) => {
                    conn.query('SELECT *,specifi.specific_id as pdpa_spcecifi FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id WHERE measures.specify_id=3 AND measures.acc_id=? ORDER BY specifi.specific_id DESC', [user], (err, specific) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_EVENT_PROCESS WHERE event_process_id = ?;', [id], (err, event) => {
                            if (err) { res.json(err) } else {
                                var arr_approach = []
                                var arr_measures = []
                                var arr_specific = []
                                if (event[0].approach_id) {
                                    arr_approach.push(...event[0].approach_id.split(','))
                                }
                                if (event[0].measures_id) {
                                    arr_measures.push(...event[0].measures_id.split(','))
                                }
                                if (event[0].specific_id) {
                                    arr_specific.push(...event[0].specific_id.split(','))
                                }
                                res.render('./classification/eventProcessEdit', {
                                    event: event,
                                    arr_measures,
                                    arr_approach,
                                    arr_specific,
                                    approach,
                                    measures,
                                    specific,
                                    session: req.session
                                })
                            }
                        })
                    })
                })
            })
        })
    }
}
controller.eventProcessUpdate = (req, res) => {
    if (typeof req.session.userid == "undefined") { res.redirect('/') } else {
        const { id } = req.params;
        req.getConnection((err, conn) => {
            const data = req.body
            let measures_id = '0'
            let approach_id = '0'
            let specific_id = '0'
            if (data.measures_id) {
                measures_id = data.measures_id.toString()
            }
            if (data.approach_id) {
                approach_id = data.approach_id.toString()
            }
            if (data.specific_id) {
                specific_id = data.specific_id.toString()
            }
            conn.query('UPDATE TB_TR_PDPA_EVENT_PROCESS SET event_process_name=?,measures_id=?,approach_id=?,specific_id=? WHERE event_process_id = ?;',
                [data.event_process_name, measures_id, approach_id, specific_id, id], (err, pass) => {
                    if (err) { res.json(err) } else {
                        funchistory.funchistory(req, "event_process", `แก้ไขข้อมูล กิจกรรมประมวลผล  ${req.body.event_process_name}`, req.session.userid)
                        res.redirect('/classification/event/')
                    }
                })
        })
    }
}
controller.eventProcessDelete = (req, res) => {
    if (typeof req.session.userid == 'undefined') { res.redirect('/') } else {
        const { id } = req.params;
        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM TB_TR_PDPA_EVENT_PROCESS WHERE event_process_id = ?', [id], (err, event_process) => {
                conn.query('DELETE FROM TB_TR_PDPA_EVENT_PROCESS WHERE event_process_id = ?;', [id], (err, pass) => {
                    if (err) {
                        res.json(err)
                    } else {
                        funchistory.funchistory(req, "event_process", `ลบข้อมูล กิจกรรมประมวลผล  ${event_process[0].event_process_name}`, req.session.userid)
                        res.redirect('/classification/event/')
                    }
                })
            })
        })
    }
}





// ajex get doc_id_detail
controller.doc_id_pattern_detail = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/')
    } else {
        var data_in = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT TB_TR_PDPA_DATA.* ,DATE_FORMAT(TB_TR_PDPA_DATA.data_date_start,'%d/%m/%Y') as day_start,DATE_FORMAT(TB_TR_PDPA_DATA.data_date_end,'%d/%m/%Y') as day_end, TB_MM_PDPA_LEVEL.level_name as level_name ,TB_MM_PDPA_DATA_TYPE.data_type_name as data_type_name FROM TB_TR_PDPA_DATA left join TB_MM_PDPA_LEVEL on TB_TR_PDPA_DATA.data_level_id = TB_MM_PDPA_LEVEL.level_id left join TB_MM_PDPA_DATA_TYPE on TB_TR_PDPA_DATA.data_type_id = TB_MM_PDPA_DATA_TYPE.data_type_id ;", (err, doc_pdpa_data) => {
                conn.query('SELECT * FROM TB_TR_PDPA_PATTERN where pattern_id = ? ;', [data_in.pattern_id], (err, pattern) => {
                    var data_out = [{ pattern: pattern[0], datatag: [], datatag_id: [], datatag_name: [], datatag_code: [] }];
                    if (pattern[0].doc_id_person_data) {
                        for (let i = 0; i < doc_pdpa_data.length; i++) {
                            if (pattern[0].doc_id_person_data.search((doc_pdpa_data[i].data_id)) > -1 || pattern[0].doc_id_person_data == doc_pdpa_data[i].data_id) {
                                data_out[0].datatag.push(doc_pdpa_data[i]);
                                data_out[0].datatag_id.push(doc_pdpa_data[i].data_id);
                                data_out[0].datatag_name.push(doc_pdpa_data[i].data_name);
                                data_out[0].datatag_code.push(doc_pdpa_data[i].data_code);
                            }
                        }
                    }
                    res.send(data_out);
                });
            });
        });
    }
}

controller.dpo_edit = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/')
    } else {
        var data_in = req.body;
        const { id } = req.params;
        const user = req.session.userid;
        req.getConnection((err, conn) => {
            conn.query('UPDATE TB_TR_PDPA_CLASSIFICATION SET ? WHERE classify_id = ?;', [req.body, id], (err, pass) => {
                res.redirect('/classification')
            })
        });
    }
}


controller.fetchSpecific = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        let user = check_user_login(req);
        const evenProcessID = req.body.evenProcessID
        const PatternID = req.body.PaaternID
        req.getConnection((err, conn) => {
            conn.query("SELECT doc_id as pattern_specific_doc_id,measures.measures_section_name as pattern_measures_section_name,prosecc.event_process_name as event_process_name ,specifi.specific_id as specific_id FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id WHERE measures.specify_id=3 AND measures.acc_id=? ORDER BY specifi.specific_id DESC",
                [user], (err, specificAll) => {
                    conn.query("SELECT *,patternSpecific.specific_id as  specific_id ,DATE_FORMAT(patternSpecific.pattern_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN  AS patternSpecific LEFT JOIN TB_TR_PDPA_EVENT_PROCESS  AS event ON patternSpecific.event_process_id = event.event_process_id WHERE patternSpecific.pattern_id=? ORDER BY patternSpecific.pattern_specific_id DESC",
                        [PatternID], (err, patternSpecific) => {
                            conn.query('SELECT * FROM TB_TR_PDPA_EVENT_PROCESS WHERE event_process_id = ?', [evenProcessID], (err, event_process) => {
                                if (evenProcessID && PatternID) { // กรณีเลือกทั้ง มาตราเเละกิจกรรม
                                    if (event_process.length > 0 && event_process[0].specific_id != null) {
                                        let specificSelectNew = [] // ข้อมูล ของ มาตราการ
                                        let arrayIDprocessSpecific = event_process[0].specific_id.split(',').map((tiem) => { return parseInt(tiem) })
                                        specificAll.forEach(element => {
                                            if (arrayIDprocessSpecific.indexOf(element.specific_id) > -1) {
                                                specificSelectNew.push(element)
                                            }
                                        });

                                        let arryID = patternSpecific.map(items => { return items.specific_id })
                                        // หา ข้อมูลไม่ซ่ำระหว่าง มาตราการใน pattern กับ  EVENT_PROCESS ที่เลือกจาก กิจกรรมการประมวลผล
                                        specificSelectNew.forEach(element => {
                                            if (arryID.indexOf(element.specific_id) < 0) {
                                                patternSpecific.push(element)
                                            }
                                        });
                                    }
                                    let arrayNewID = patternSpecific.map((items) => { return items.specific_id })
                                    specificAll.forEach(element => {
                                        if (arrayNewID.indexOf(element.specific_id) < 0) {
                                            patternSpecific.push(element)
                                        }
                                    });
                                    res.json(patternSpecific)
                                } else {
                                    if (PatternID) { // มีเเค่ ID Pattern
                                        let arryID = patternSpecific.map(items => { return items.specific_id })
                                        // หา ข้อมูลไม่ซ่ำระหว่าง มาตราการใน pattern กับ  EVENT_PROCESS ที่เลือกจาก กิจกรรมการประมวลผล
                                        specificAll.forEach(element => {
                                            if (arryID.indexOf(element.specific_id) < 0) {
                                                patternSpecific.push(element)
                                            }
                                        });
                                        res.json(patternSpecific)
                                    } else { // มีเเค่ ID กิจกรรม
                                        res.json(specificAll)
                                    }
                                }
                            });
                        });
                });
        });
    } else {
        res.redirect("/");
    }
};



controller.fetchSpecificSearch = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/')
    } else {
        let user = check_user_login(req);
        const data = req.body;
        req.getConnection((err, conn) => {
            conn.query("SELECT measures.doc_id as  pattern_specific_doc_id,measures.measures_detail as pattern_measures_detail,measures.measures_supervisor as pattern_measures_supervisor,measures.measures_date_count as pattern_measures_date_count,measures.measures_section_name as pattern_measures_section_name,DATE_FORMAT(measures.measures_date,'%Y-%m-%d') as date ,prosecc.event_process_name as event_process_name ,specifi.specific_id as specific_id,specifi.specific_access_control as pattern_specific_access_control,specifi.specific_user_access_management as  pattern_specific_user_access_management,specifi.specific_user_responsibilitites as   pattern_specific_user_responsibilitites,specifi.specific_audit_trails as  pattern_specific_audit_trails,specifi.specific_privacy_security_awareness as   pattern_specific_privacy_security_awareness,specifi.specific_where_incident_occurs as   pattern_specific_where_incident_occurs,specifi.specific_access_control_explain as   pattern_specific_access_control_explain,specifi.specific_user_access_management_explain as pattern_specific_user_access_management_explain,specifi.specific_user_responsibilitites_explain as pattern_specific_user_responsibilitites_explain,specifi.specific_audit_trails_explain as pattern_specific_audit_trails_explain,specifi.specific_privacy_security_awareness_explain as   pattern_specific_privacy_security_awareness_explain,specifi.specific_where_incident_occurs_explain as  pattern_specific_where_incident_occurs_explain,prosecc.event_process_name as event_process_name,prosecc.event_process_id as event_process_id FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id WHERE measures.specify_id=3 AND measures.acc_id=? ORDER BY specifi.specific_id DESC",
                [user], (err, specificAll) => {
                    conn.query("SELECT *,patternSpecific.specific_id as  specific_id ,DATE_FORMAT(patternSpecific.pattern_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN  AS patternSpecific LEFT JOIN TB_TR_PDPA_EVENT_PROCESS  AS event ON patternSpecific.event_process_id = event.event_process_id WHERE patternSpecific.pattern_id=? ORDER BY patternSpecific.pattern_specific_id DESC",
                        [data.pattern_specific_id], (err, patternSpecific) => {
                            let id_specific = data.id_specific.map((item) => { return parseInt(item) })
                            let newData = [];
                            let newID = []
                            patternSpecific.forEach((items) => {
                                if (id_specific.indexOf(items.specific_id) > -1) {
                                    newData.push(items)
                                    newID.push(items.specific_id)
                                }
                            })
                            let IDcheck = []
                            data.id_specific.forEach(element => {
                                if (newID.indexOf(parseInt(element)) < 0) {
                                    IDcheck.push(parseInt(element));
                                }
                            });
                            specificAll.forEach((items) => {
                                if (IDcheck.indexOf(items.specific_id) > -1) {
                                    newData.push(items)
                                }
                            })
                            newData = newData.length > 0 ? newData : "ไม่มีข้อมูล"
                            res.json(newData)
                        });
                });
        });
    }
}

//  ค้นหา มาตราการใน classifi ตอนเลือก pattern ในหน้าเเเก้ไข classifi
controller.fetchSpecificClassificEditSearch = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/')
    } else {
        const data = req.body;
        let user = check_user_login(req);
        req.getConnection((err, conn) => {
            conn.query("SELECT specificclass.classification_specific_id as pattern_specific_id,classification_specific_id,specificclass.pattern_id as pattern_id,specificclass.specific_id as specific_id,specificclass.event_process_id as event_process_id,event.event_process_name as event_process_name,specificclass.doc_id as pattern_specific_doc_id,specificclass.classification_measures_detail  as pattern_measures_detail,specificclass.classification_measures_supervisor  as  pattern_measures_supervisor,specificclass.classification_measures_date_count  as  pattern_measures_date_count,specificclass. classification_measures_section_name  as  pattern_measures_section_name,specificclass.classification_specific_access_control  as pattern_specific_access_control,specificclass.classification_specific_user_access_management  as pattern_specific_user_access_management,specificclass.classification_specific_user_responsibilitites  as  pattern_specific_user_responsibilitites,specificclass.classification_specific_audit_trails  as pattern_specific_audit_trails,specificclass.classification_specific_privacy_security_awareness  as pattern_specific_privacy_security_awareness,specificclass.classification_specific_where_incident_occurs  as  pattern_specific_where_incident_occurs,specificclass.classification_specific_access_control_explain   as pattern_specific_access_control_explain,specificclass.classification_specific_user_access_management_explain  as pattern_specific_user_access_management_explain,specificclass.classification_specific_user_responsibilitites_explain  as pattern_specific_user_responsibilitites_explain,specificclass.classification_specific_audit_trails_explain  as pattern_specific_audit_trails_explain,specificclass.classification_specific_privacy_security_awareness_explain  as pattern_specific_privacy_security_awareness_explain,specificclass.classification_specific_where_incident_occurs_explain  as pattern_specific_where_incident_occurs_explain,DATE_FORMAT(specificclass.classification_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION   AS specificclass LEFT JOIN TB_TR_PDPA_EVENT_PROCESS AS event ON specificclass.event_process_id=event.event_process_id LEFT JOIN  TB_TR_PDPA_CLASSIFICATION as class on specificclass.classify_id=class.classify_id WHERE specificclass.classify_id =?  AND  specificclass.pattern_id =?  AND class.event_process_id=?  ORDER BY  specificclass.specific_id DESC",
                [data.IDclassifi, data.IDpattern, data.IDproccess], (err, specificONclassifi) => {
                    //  กรณีเลือก pattern กับ กิจกรรม(proccess) ตรงกับมาตราการที่บันทึกใน classifi
                    if (data.firsOne) { // ครั้งเเรกที่เข้าหน้าเเก้ไข classifif
                        specificONclassifi = specificONclassifi.length > 0 ? specificONclassifi : "ไม่มีข้อมูล"
                        res.json(specificONclassifi)
                    } else {
                        if (specificONclassifi.length > 0) {
                            specificONclassifi = specificONclassifi.length > 0 ? specificONclassifi : "ไม่มีข้อมูล"
                            res.json(specificONclassifi)
                        } else {
                            conn.query("SELECT *,patternSpecific.specific_id as  specific_id,DATE_FORMAT(patternSpecific.pattern_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN  AS patternSpecific LEFT JOIN TB_TR_PDPA_EVENT_PROCESS  AS event ON patternSpecific.event_process_id = event.event_process_id WHERE patternSpecific.pattern_id=? ORDER BY patternSpecific.specific_id DESC",
                                [data.IDpattern], (err, patternSpecific) => {
                                    conn.query("SELECT * FROM  TB_TR_PDPA_EVENT_PROCESS WHERE event_process_id=?  ORDER BY event_process_id DESC ", [data.IDproccess], (err, process) => {
                                        conn.query("SELECT prosecc.event_process_id ,prosecc.event_process_name,measures.doc_id as pattern_specific_doc_id,specifi.specific_id as  specific_id,DATE_FORMAT(measures.measures_date,'%Y-%m-%d') as date ,measures.measures_supervisor as pattern_measures_supervisor,measures.measures_detail as pattern_measures_detail,measures.measures_date as pattern_measures_date,measures.measures_date_count as pattern_measures_date_count,measures.measures_section_name as pattern_measures_section_name,specifi.specific_access_control  as pattern_specific_access_control,specifi.specific_user_access_management  as pattern_specific_user_access_management,specifi.specific_user_responsibilitites  as  pattern_specific_user_responsibilitites,specifi.specific_audit_trails  as pattern_specific_audit_trails,specifi.specific_privacy_security_awareness  as pattern_specific_privacy_security_awareness,specifi.specific_where_incident_occurs  as  pattern_specific_where_incident_occurs,specifi.specific_access_control_explain   as pattern_specific_access_control_explain,specifi.specific_user_access_management_explain  as pattern_specific_user_access_management_explain,specifi.specific_user_responsibilitites_explain  as pattern_specific_user_responsibilitites_explain,specifi.specific_audit_trails_explain  as pattern_specific_audit_trails_explain,specifi.specific_privacy_security_awareness_explain  as pattern_specific_privacy_security_awareness_explain,specifi.specific_where_incident_occurs_explain  as pattern_specific_where_incident_occurs_explain FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id  WHERE measures.specify_id = 3 AND measures.acc_id = ? ORDER BY specifi.specific_id DESC",
                                            [user], (err, specificAll) => {
                                                // หามาตราการที่เลือก ด้วยอ้างอิง ID มาตราการจาก กิจกรรม (TB_TR_PDPA_EVENT_PROCESS)
                                                let newSpecific = []
                                                if (process.length > 0 && process[0].specific_id != null) {
                                                    let specificID = process[0].specific_id.split(',').map((tiems) => { return parseInt(tiems) });
                                                    specificAll.forEach(element => {
                                                        if (specificID.indexOf(element.specific_id) > -1) {
                                                            newSpecific.push(element)
                                                        }
                                                    });
                                                }
                                                // หา ข้อมูลไม่ซ่ำระหว่าง มาตราการใน pattern กับ  EVENT_PROCESS ที่เลือกจาก กิจกรรมการประมวลผล
                                                if (newSpecific.length > 0) {
                                                    let arryID = patternSpecific.map(items => { return items.specific_id })
                                                    newSpecific.forEach(element => {
                                                        if (arryID.indexOf(element.specific_id) < 0) {
                                                            patternSpecific.push(element)
                                                        }
                                                    });
                                                }
                                                patternSpecific = patternSpecific.length > 0 ? patternSpecific : "ไม่มีข้อมูล"
                                                res.json(patternSpecific)
                                            });
                                    });
                                });
                        }
                    }
                });
        });
    }
}


controller.fetchSpecificEdit = (req, res) => {
    if (typeof req.session.userid != "undefined") {
        let user = check_user_login(req);
        req.getConnection((err, conn) => {
            conn.query("SELECT  specifi.specific_id as specific_id,measures.measures_section_name as pattern_measures_section_name,prosecc.event_process_name as event_process_name,measures.doc_id as pattern_specific_doc_id  FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id  WHERE measures.specify_id = 3 AND measures.acc_id = ? ORDER BY specifi.specific_id DESC",
                [user], (err, specificAll) => {
                    res.json(specificAll)
                });
        });
    } else {
        res.redirect('/')
    }
}

// fetch ข้อมูลมาตราการตอน เลือก checkbox หน้า เเก้ไข classifi
controller.fetchSpecificSearchEdit = (req, res) => {
    if (typeof req.session.userid == 'undefined') {
        res.redirect('/')
    } else {
        const data = req.body;
        let user = check_user_login(req);
        req.getConnection((err, conn) => {
            conn.query("SELECT specificclass.classification_specific_id as pattern_specific_id,classification_specific_id,specificclass.pattern_id as pattern_id,specificclass.specific_id as specific_id,specificclass.event_process_id as event_process_id,event.event_process_name as event_process_name,specificclass.doc_id as pattern_specific_doc_id,specificclass.classification_measures_detail  as pattern_measures_detail,specificclass.classification_measures_supervisor  as  pattern_measures_supervisor,specificclass.classification_measures_date_count  as  pattern_measures_date_count,specificclass. classification_measures_section_name  as  pattern_measures_section_name,specificclass.classification_specific_access_control  as pattern_specific_access_control,specificclass.classification_specific_user_access_management  as pattern_specific_user_access_management,specificclass.classification_specific_user_responsibilitites  as  pattern_specific_user_responsibilitites,specificclass.classification_specific_audit_trails  as pattern_specific_audit_trails,specificclass.classification_specific_privacy_security_awareness  as pattern_specific_privacy_security_awareness,specificclass.classification_specific_where_incident_occurs  as  pattern_specific_where_incident_occurs,specificclass.classification_specific_access_control_explain   as pattern_specific_access_control_explain,specificclass.classification_specific_user_access_management_explain  as pattern_specific_user_access_management_explain,specificclass.classification_specific_user_responsibilitites_explain  as pattern_specific_user_responsibilitites_explain,specificclass.classification_specific_audit_trails_explain  as pattern_specific_audit_trails_explain,specificclass.classification_specific_privacy_security_awareness_explain  as pattern_specific_privacy_security_awareness_explain,specificclass.classification_specific_where_incident_occurs_explain  as pattern_specific_where_incident_occurs_explain,DATE_FORMAT(specificclass.classification_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_CLASSIFICATION   AS specificclass LEFT JOIN TB_TR_PDPA_EVENT_PROCESS AS event ON specificclass.event_process_id=event.event_process_id LEFT JOIN  TB_TR_PDPA_CLASSIFICATION as class on specificclass.classify_id=class.classify_id WHERE specificclass.classify_id =?  AND  specificclass.pattern_id =?  AND class.event_process_id=?  ORDER BY  specificclass.specific_id DESC",
                [data.IDclasscifi, data.IDpattern, data.IDproccess], (err, specificONclassifi) => {
                    conn.query("SELECT * FROM  TB_TR_PDPA_EVENT_PROCESS WHERE event_process_id=?  ORDER BY event_process_id DESC ", [data.IDproccess], (err, process) => {
                        conn.query("SELECT prosecc.event_process_id ,prosecc.event_process_name,measures.doc_id as pattern_specific_doc_id,specifi.specific_id as  specific_id,DATE_FORMAT(measures.measures_date,'%Y-%m-%d') as date ,measures.measures_supervisor as pattern_measures_supervisor,measures.measures_detail as pattern_measures_detail,measures.measures_date as pattern_measures_date,measures.measures_date_count as pattern_measures_date_count,measures.measures_section_name as pattern_measures_section_name,specifi.specific_access_control  as pattern_specific_access_control,specifi.specific_user_access_management  as pattern_specific_user_access_management,specifi.specific_user_responsibilitites  as  pattern_specific_user_responsibilitites,specifi.specific_audit_trails  as pattern_specific_audit_trails,specifi.specific_privacy_security_awareness  as pattern_specific_privacy_security_awareness,specifi.specific_where_incident_occurs  as  pattern_specific_where_incident_occurs,specifi.specific_access_control_explain   as pattern_specific_access_control_explain,specifi.specific_user_access_management_explain  as pattern_specific_user_access_management_explain,specifi.specific_user_responsibilitites_explain  as pattern_specific_user_responsibilitites_explain,specifi.specific_audit_trails_explain  as pattern_specific_audit_trails_explain,specifi.specific_privacy_security_awareness_explain  as pattern_specific_privacy_security_awareness_explain,specifi.specific_where_incident_occurs_explain  as pattern_specific_where_incident_occurs_explain FROM TB_TR_MEASURES_PDPA_SPECIFIC AS specifi LEFT JOIN TB_TR_MEASURES AS  measures ON specifi.measures_id=measures.measures_id LEFT JOIN  TB_TR_PDPA_EVENT_PROCESS AS prosecc ON specifi.event_process_id=prosecc.event_process_id  WHERE measures.specify_id = 3 AND measures.acc_id = ? ORDER BY specifi.specific_id DESC",
                            [user], (err, specificAll) => {
                                conn.query("SELECT *,patternSpecific.specific_id as  specific_id,DATE_FORMAT(patternSpecific.pattern_measures_date,'%Y-%m-%d') as date FROM TB_TR_MEASURES_PDPA_SPECIFIC_PATTERN  AS patternSpecific LEFT JOIN TB_TR_PDPA_EVENT_PROCESS  AS event ON patternSpecific.event_process_id = event.event_process_id WHERE patternSpecific.pattern_id=? ORDER BY patternSpecific.specific_id DESC",
                                    [data.IDpattern], (err, patternSpecific) => {
                                        let id_specific = data.id_specific.map((item) => { return parseInt(item) })
                                        let newData = [];
                                        let newID = []
                                        let newIDno = []
                                        // ตรวจสอบ ข้อมูลระหว่าง specificONclassifi กับ patternSpecific   
                                        let sepecific = specificONclassifi.length > 0 ? specificONclassifi : patternSpecific
                                        sepecific.forEach((items) => {
                                            if (id_specific.indexOf(items.specific_id) > -1) {
                                                newData.push(items)
                                                newID.push(items.specific_id)
                                            }
                                        })
                                        // ตรวจสอบ ID มาตราการที่ส่งมา กับ ID  specificONclassifi ว่าอันไหนไม่ตรงกัน
                                        id_specific.forEach(element => {
                                            if (newID.indexOf(parseInt(element)) < 0) {
                                                newIDno.push(parseInt(element))
                                            }
                                        });
                                        // เพื่ม มาตรากการ ด้วยอ้างอิง ID ที่ส่งมาเเล้วไม่มีข้อมูลใน specificONclassifi
                                        specificAll.forEach(element => {
                                            if (newIDno.indexOf(parseInt(element.specific_id)) > -1) {
                                                newData.push(element);
                                            }
                                        });
                                        newData = newData.length > 0 ? newData : "ไม่มีข้อมูล"
                                        res.json(newData)

                                    });

                            });
                    });
                });
        });
    }
}



module.exports = controller
