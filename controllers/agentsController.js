const controller = {};
const fs = require('fs');
const path = require('path');
const sha256 = require('crypto-js/sha256');
const Base64 = require('crypto-js/enc-base64');
const Utf8 = require('crypto-js/enc-utf8');
const uft8Encode = new TextEncoder();
const tls = require("tls");
var options = {
    key: fs.readFileSync(path.join(process.cwd(), "ssl/private-key.key")),
    cert: fs.readFileSync(path.join(process.cwd(), "ssl/public-cert.crt")),
    rejectUnauthorized: false
}
const HOST = `${process.env.LISTEN_HOST}`;
const PORT = parseInt(`${process.env.LISTEN_PORT}`);
const funHistory = require('./account_controllers');

const modifyConfig = (t, c, e, m) =>{
    if(t === "AG1"){
        c = c.split(",")
        let C =  c.map(function(i){ if(i !== "" && typeof i === "string"){ if (i.split("")[i.length-1].includes("/") === false){ if( ! i.includes(":") ) { return i+"/" } else { return i+"\\" } } else { return i }} else{ return i } }).filter(i => i)
        return C.join(",")
    }else if(t === "AG2"){
        if(parseInt(m) === -1){
            return c+e
        }else{
            c = c.split(",")
            let C = []
            if(parseInt(m) === 0){
                C = c.map(function(i){ if (i[i.length - 1] !== "/" && i !== ""){ if ( ! i.includes(":") ) { return i += `/*${req.body.extension}` } else { return i+= `\\*${req.body.extension}` } } else if(i[i.length - 1] === "/" && i !== "" && i[i.length - 1] === "\\"){ return i += `*${req.body.extension}` } }).filter(i => i)
            }else if(parseInt(m) === 1){
                C = c.map(function(i){ if(typeof i === "string" && i !== ""){ if(i.split("")[i.length-1].includes("/") === false){ if( ! i.includes(":") ){ return i+"/" } else { return i+"\\" } } else { return i } } }).filter( i => i )
            }
            return C.join(",")
        }
    }else if(t === "AG3"){
        let rawTable = c.split(",").filter(i => i)
        let table = "" 
        for ( i in rawTable ){
            let columns = eval(Object.entries(e).map(function(x){ if (x[0] === `column${rawTable[i]}`){ return x[x.length - 1] } }).filter(j => j).pop()).join(",")
            if (parseInt(i)+1 === rawTable.length){
                table += `${rawTable[i]}:${columns}`
            }else{
                table += `${rawTable[i]}:${columns}&`
            }
        }
        return table
    }else{
    }
}
// Send message to socket
const send = (client, msg) => {
    let lenMsg = []
    let sendLength = uft8Encode.encode(String(uft8Encode.encode(msg).length));
    let message = ""
    for( i=0; i < (1024 - sendLength.length); i++ ){
        sendLength += uft8Encode.encode(" ")
    }
    if (msg.includes(',') === true && msg.includes('&&&') === false){
        lenMsg = msg.split(",")
        lenMsg.push(sendLength.length)
        message = lenMsg.join(",")
        message = uft8Encode.encode(message);
    }else if (msg.includes('|') === true){
        lenMsg = msg.split("|")
        message = lenMsg.join("|")
        message = uft8Encode.encode(message)
    }else if (msg.includes("&&&") == true){
        lenMsg = msg.split("&&&")
        message = lenMsg.join("&&&")
        message = uft8Encode.encode(message)
    }
    client.write(message)
    client.end()
}

// Index Manage
controller.manager = (req, res) => {
    if (typeof req.session.userid === "undefined") {
        res.redirect('/')
    } else {
        const user = req.session.userid
        req.getConnection((_, conn) => {
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC LIMIT 30;', [user], (_, history) => {
                conn.query('SELECT * FROM TB_MM_PDPA_WORDS', (err, words) => {
                    let word = []
                    let word1 = []
                    for (i in words) {
                        word.push(words[i].words_id)
                        word1.push(words[i].words_often)
                    }
                    if (err) { res.json(err) } else {
                        res.render('./agent/index_manage', {
                            history: history,
                            words: words,
                            words1: word,
                            words2: word1,
                            session: req.session
                        })
                    }
                    funHistory.funchistory(req, "Agent Manage", "เข้าสู่เมนู สร้างการใช้งาน Agent", user)
                })
            })
        })
    }
}
// New manage
controller.newManager = (req,res) =>{
    if(typeof req.session.userid === 'undefined'){
        res.redirect('/')
    }else{
        const user = req.session.userid; 
        req.getConnection((_, conn) => {
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC LIMIT 30;', [user], (_, history) => {
                conn.query('SELECT * FROM TB_MM_PDPA_WORDS', (_, words) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_AGENT_STORE WHERE status = 1 AND hide = 0 AND _limit_ != 0;', (err,agent) => {
                        let word = []
                        let word1 = []
                        for (i in words) {
                            word.push(words[i].words_id)
                            word1.push(words[i].words_often)
                        }
                        if(err){ res.json(err); }else{
                            res.render('./agent/newAgentToUse',{
                                agent: agent,
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
    }
}
// Add manage
controller.addManage = (req, res) => {
    if (typeof req.session.userid === 'undefined') {
        res.redirect('/')
    } else {
        req.getConnection((_, conn)=>{
            conn.query('SELECT * FROM TB_TR_PDPA_AGENT_STORE WHERE ags_id = ?;',[req.body.ags_id],(_, store)=>{
                let count = parseInt(store[0]._limit_)-1;
                if(store[0].code === "AG1" ){
                    let hashType = -2;
                    if(typeof req.body.hash_type !== "undefined"){
                        hashType = req.body.hash_type;
                    }
                    let body = {
                        "agm_name": req.body.agm_name,
                        "ags_id": req.body.ags_id,
                        "acc_id": req.body.acc_id,
                        "device_plugin": req.body.device_plugin,
                        "ip_plugin": req.body.ip_plugin,
                        "config_detail": modifyConfig(store[0].code, req.body.total_path, null, null),
                        "agm_token": Base64.stringify(Utf8.parse(`${store[0].code}&&&${0}&&&${req.body.agm_name}&&&${HOST}&&&${PORT}&&&${modifyConfig(store[0].code, req.body.total_path, null, null)}`)),
                        "hash_type": hashType
                    }
                    conn.query('INSERT INTO TB_TR_PDPA_AGENT_MANAGE SET ?;',[body],(err, _)=>{
                        if(err){ res.json(err) }else{
                            res.redirect('/agent_manage')
                        }
                    })
                }else if(store[0].code === "AG2"){
                    let config = modifyConfig(store[0].code, req.body.total_path, req.body.extension, req.body.type_of_path)
                    const body = {
                        "agm_name": req.body.agm_name,
                        "ags_id": req.body.ags_id,
                        "acc_id": req.body.acc_id,
                        "device_plugin": req.body.device_plugin,
                        "ip_plugin": req.body.ip_plugin,
                        "config_detail": config,
                        "agm_token": Base64.stringify(Utf8.parse(`${store[0].code}&&&${0}&&&${req.body.agm_name}&&&${HOST}&&&${PORT}&&&${config}`))
                    }
                    conn.query('INSERT INTO TB_TR_PDPA_AGENT_MANAGE SET ?;',[body],(err, _)=>{
                        if(err){ res.json(err) }else{
                            res.redirect('/agent_manage')
                        }
                    })
                }else if(store[0].code === "AG3"){
                    let config = `${req.body.service_database}&${req.body.host}&${req.body.username}&${req.body.password}&${req.body.database}&${modifyConfig(store[0].code, req.body.total_table, req.body, null)}`
                    const body = {
                        "agm_name": req.body.agm_name,
                        "ags_id": req.body.ags_id,
                        "acc_id": req.body.acc_id,
                        "device_plugin": req.body.device_plugin,
                        "ip_plugin": req.body.ip_plugin,
                        "config_detail": config,
                        "agm_token": Base64.stringify(Utf8.parse(`${store[0].code}&&&${0}&&&${req.body.agm_name}&&&${HOST}&&&${PORT}&&&${config}`)),
                    }
                    conn.query('INSERT INTO TB_TR_PDPA_AGENT_MANAGE SET ?;',[body],(err, _)=>{
                        if(err){ res.json(err) }else{
                            res.redirect('/agent_manage')
                        }
                    })
                }else if(store[0].code === "AG4"){
                    let config = `${req.body.mode},${req.body.path}`
                    const body = {
                        "agm_name": req.body.agm_name,
                        "ags_id": req.body.ags_id,
                        "acc_id": req.body.acc_id,
                        "device_plugin": req.body.device_plugin,
                        "ip_plugin": req.body.ip_plugin,
                        "config_detail": config,
                        "agm_token": Base64.stringify(Utf8.parse(`${store[0].code}&&&${0}&&&${req.body.agm_name}&&&${HOST}&&&${PORT}&&&${config}`))
                    }
                    conn.query('INSERT INTO TB_TR_PDPA_AGENT_MANAGE SET ?;',[body],(err,pass)=>{
                        if(err){ res.json(err) }else{
                            res.redirect('/agent_manage')
                        }
                    })
                }
                conn.query(`UPDATE TB_TR_PDPA_AGENT_STORE SET _limit_ = ${count} WHERE ags_id = ${req.body.ags_id};`,(err, _)=>{
                    if(err) res.json(err)
                })
                funHistory.funchistory(req, "Agent Manage", `เพิ่มข้อมูล สร้าง Service Agent ${req.body.agm_name}`, req.session.userid)
            })
        })
    }
}
// Detail manage
controller.detailManage = (req, res) =>{
    if(typeof req.session.userid === 'undefined'){ res.redirect('/') }else{
        const user = req.session.userid;
        const {id} = req.params;
        req.getConnection((_, conn)=>{
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC LIMIT 30;', [user], (_, history) => {
                conn.query('SELECT * FROM TB_MM_PDPA_WORDS', (_, words) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id WHERE agm_id = ?;',[id],(err,manage)=>{
                        let word = []
                        let word1 = []
                        for (i in words) {
                            word.push(words[i].words_id)
                            word1.push(words[i].words_often)
                        }
                        if (err) { res.json(err) } else {
                            res.render('./agent/detailAgentToUse', {
                                manage: manage,
                                history: history,
                                words: words,
                                words1: word,
                                words2: word1,
                                session: req.session
                            })
                        }
                        funHistory.funchistory(req, "Agent Manage", `ดูข้อมูล Service Agent ${manage[0].agm_name}`, user)
                    })
                })
            })
        })
    }
}
// Step install client
controller.procedureManage = (req, res) =>{ if(typeof req.session.userid === "undefined"){ res.redirect('/') }
    const user = req.session.userid;
    const {id} = req.params;
    req.getConnection((_, conn) =>{
        conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC LIMIT 30;', [user], (_, history) => {
            conn.query('SELECT * FROM TB_MM_PDPA_WORDS', (_, words) => {
                conn.query("SELECT * FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id WHERE agm_id = ?;", [id], (err,manage)=>{
                    if(err) res.json(err);
                    let word = []
                    let word1 = []
                    for (i in words) {
                        word.push(words[i].words_id)
                        word1.push(words[i].words_often)
                    }
                    funHistory.funchistory(req, "Agent Manage", `ดูวิธีการติดตั้ง Service Agent ${manage[0].agm_name}`, user)
                    res.render('./agent/procedure',{ manage, history:history, words1: word, words2: word1, session: req.session });
                })
            })
        })
    })
}
// Step install client (Windows)
controller.procedureManage1 = (req, res) =>{ if(typeof req.session.userid === "undefined"){ res.redirect('/') }
    const user = req.session.userid;
    const {id} = req.params;
    req.getConnection((_, conn) =>{
        conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC LIMIT 30;', [user], (_, history) => {
            conn.query('SELECT * FROM TB_MM_PDPA_WORDS', (_, words) => {
                conn.query("SELECT * FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id WHERE agm_id = ?;", [id], (err,manage)=>{
                    if(err) res.json(err);
                    let word = []
                    let word1 = []
                    for (i in words) {
                        word.push(words[i].words_id)
                        word1.push(words[i].words_often)
                    }
                    funHistory.funchistory(req, "Agent Manage", `ดูวิธีการติดตั้ง Service Agent ${manage[0].agm_name} บน Windows`, user)
                    res.render('./agent/procedure1',{ manage, history:history, words1: word, words2: word1, session: req.session });
                })
            })
        })
    })
}
// Edit manage
controller.editManager = (req, res) =>{
    if(typeof req.session.userid === "undefined"){ res.redirect('/') }else{
        const user = req.session.userid
        const {id} = req.params;
        req.getConnection((_, conn) => {
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC LIMIT 30;', [user], (_, history) => {
                conn.query('SELECT * FROM TB_MM_PDPA_WORDS', (_, words) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_AGENT_STORE;',(_, agent)=>{
                        conn.query('SELECT * FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id WHERE agm_id = ?;',[id],(err, manage)=>{
                            let word = []
                            let word1 = []
                            for (i in words) {
                                word.push(words[i].words_id)
                                word1.push(words[i].words_often)
                            }
                            if (err) { res.json(err) } else {
                                res.render('./agent/editAgentToUse', {
                                    agent: agent,
                                    manage: manage,
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
    }
}
// Update manage
controller.updateManage = (req, res) =>{ 
    if(typeof req.session.userid === "undefined"){ res.redirect('/') }else{
        const {id} = req.params;
        req.getConnection((_ ,conn)=>{
            conn.query('SELECT * FROM TB_TR_PDPA_AGENT_STORE WHERE ags_id = ?;',[req.body.ags_id],(_, store)=>{
                if(store[0].code === "AG1" ){
                    const body = {
                        "acc_id": req.body.acc_id,
                        "device_plugin": req.body.device_plugin,
                        "ip_plugin": req.body.ip_plugin,
                        "config_detail": modifyConfig(store[0].code, req.body.total_path, null)
                    }
                    conn.query('UPDATE TB_TR_PDPA_AGENT_MANAGE SET ? WHERE agm_id = ?;',[body, id],(err, _)=>{
                        if(err){ res.json(err) }else{
                            res.redirect('/agent_manage')
                        }
                    })
                }else if(store[0].code === "AG2"){
                    let config = modifyConfig(store[0].code, req.body.total_path, req.body.extension)
                    const body = {
                        "acc_id": req.body.acc_id,
                        "device_plugin": req.body.device_plugin,
                        "ip_plugin": req.body.ip_plugin,
                        "config_detail": config
                    }
                    conn.query('UPDATE TB_TR_PDPA_AGENT_MANAGE SET ? WHERE agm_id = ?;',[body, id],(err, _)=>{
                        if(err){ res.json(err) }else{
                            res.redirect('/agent_manage')
                        }
                    })
                }else if(store[0].code === "AG3"){
                    let config = `${req.body.service_database}&${req.body.host}&${req.body.username}&${req.body.password}&${req.body.database}&${modifyConfig(store[0].code, req.body.total_table, req.body)}`
                    const body = {
                        "acc_id": req.body.acc_id,
                        "device_plugin": req.body.device_plugin,
                        "ip_plugin": req.body.ip_plugin,
                        "config_detail": config
                    }
                    conn.query('UPDATE TB_TR_PDPA_AGENT_MANAGE SET ? WHERE agm_id = ?;',[body, id],(err, _)=>{
                        if(err){ res.json(err) }else{
                            res.redirect('/agent_manage')
                        }
                    })
                }else if(store[0].code === "AG4"){
                    let config = `${req.body.mode},${req.body.path}`
                    const body = {
                        "acc_id": req.body.acc_id,
                        "device_plugin": req.body.device_plugin,
                        "ip_plugin": req.body.ip_plugin,
                        "config_detail": config
                    }
                    conn.query('UPDATE TB_TR_PDPA_AGENT_MANAGE SET ? WHERE agm_id = ?;',[body, id],(err, _)=>{
                        if(err){ res.json(err) }else{
                            res.redirect('/agent_manage')
                        }
                    })
                }
                funHistory.funchistory(req, "Agent Manage", `แก้ไขข้อมูล Service Agent ${req.body.agm_name}`, req.session.userid)
            })
        })
    }
}
// Delete manage
controller.deleteManage = (req, res) =>{
    if(typeof req.session.userid === "undefined"){ res.redirect('/') }else{
        const id = req.params.id;
        const index = req.params.index;
        req.getConnection((_ ,conn)=>{
            conn.query('SELECT * FROM TB_TR_PDPA_AGENT_STORE WHERE ags_id = ?;',[index],(_, store)=>{
                conn.query('SELECT * FROM TB_TR_PDPA_AGENT_MANAGE WHERE agm_id = ?;',[id],(_, manage)=>{
                    conn.query('UPDATE TB_TR_PDPA_AGENT_STORE SET _limit_ = ? WHERE ags_id = ?;',[parseInt(store[0]._limit_)+1, index],(err, _)=>{
                        if(err) res.json(err)
                    })
                    conn.query('DELETE FROM TB_TR_PDPA_AGENT_MANAGE WHERE agm_id = ?;',[id],(err, _)=>{
                        if(err){res.json(err)}else{
                            res.redirect('/agent_manage');
                        }
                    })
                    funHistory.funchistory(req, "Agent Manage", `ลบข้อมูล Service Agent ${manage[0].agm_name}`, req.session.userid)
                })
            })
        })
    }
}
// Send AJAX (POST)
controller.manager1 = (req, res) => {
    if (typeof req.session.userid === 'undefined') { res.redirect('/') } else { 
        req.getConnection((_, conn) => {
            conn.query('SELECT * FROM TB_TR_ACCOUNT;',(_, account)=>{
                conn.query('SELECT agm_id FROM TB_TR_PDPA_AGENT_MANAGE ORDER BY agm_id DESC;', (_, id_manage) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_AGENT_MANAGE pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id ORDER BY agm_id DESC;', (_, manage) => {
                        conn.query('SELECT agm_id, (SELECT _get_ from TB_TR_PDPA_AGENT_LISTEN_HISTORY WHERE agm_id = m.agm_id ORDER BY alh_id desc limit 0,1) as last_access from TB_TR_PDPA_AGENT_MANAGE m ORDER BY agm_id;', (err, history) => {
                            if (manage.length > 0) {
                                for (i in manage) {
                                    manage[i].agm_id = (parseInt(i) + 1)
                                }
                            }
                            if (err) { res.json(err) } else {
                                res.json({ id_manage, manage, account, history })
                            }
                        })
                    })
                })
            })
        })
    }
}
controller.selectStore = (req, res) =>{
    if(typeof req.session.userid === "undefined"){ res.redirect('/') }else{
        const id = req.body.id;
        const getValue = req.body.value;
        const hash = Base64.stringify(sha256(getValue))
        if (hash === "fkrG+10zwl5CXz38BtA+keOm6e2FrI6hDLWX3VDOX/8="){
            req.getConnection((_, conn)=>{
                conn.query("SELECT * FROM TB_TR_PDPA_AGENT_STORE WHERE ags_id = ?;",[id],(err, store)=>{
                    if(err){res.json(err)}else{
                        res.json(store)
                    }
                })
            })
        }else{
            console.log(req.boy)
        }
    }
}
controller.selectManage = (req, res) =>{
    if(typeof req.session.userid === 'undefined'){ res.redirect('/') }else{
        const id = req.body.id;
        const getValue = req.body.value;
        const hash = Base64.stringify(sha256(getValue))
        if(hash === "L2CU1QLqrnLS5/oZPo2E9UitCecrxBo+AHmidGwA9W4="){
            req.getConnection((_, conn)=>{
                conn.query('SELECT * FROM TB_TR_ACCOUNT;',(_, account)=>{
                    conn.query('SELECT * FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id WHERE agm_id = ?;',[id],(err, manage)=>{
                        if(err){res.json(err)}else{
                            res.json({manage, account})
                        }
                    })
                })
            })
        }else{
            console.log(req.body)
        }
    }
}
controller.testConnect = (req,res) =>{
    if(typeof req.session.userid === "undefined") { res.redirect('/') }else{
        const getValue = req.body.value;
        const hash = Base64.stringify(sha256(getValue));
        if(hash === "kwUwAEnFntblMRkVv41u3/tWDZFHmD9jLsgNDSHWJ8U="){
            const host = req.body.host;
            const user = req.body.user;
            const pass = req.body.pass;
            const db = req.body.db;
            const type = req.body.type;
            if (type === 1 || type === 0){
                let message = "";
                if (type === 1){
                    message = "MySQL สามารถเชื่อมต่อได้."
                }else if( type === 0 ){
                    message = "Oracle DB สามารถเชื่อต่อได้."
                }
                new Promise((resolve, _) => {
                    let client = tls.connect(PORT, HOST, options, () => {
                        resolve(client);
                    });
                    client.on('error', err => res.json({err}));
                    send(client, `${type}|${host}|${user}|${pass}|${db}`)
                    client.end()
                }).then(connection => {
                    connection.on('data', data =>{
                        try{
                            res.json({result: JSON.parse(data.toString()), message})
                        } catch(e){
                            res.json({message: data.toString()})
                        }
                    })
                })
            }else{
                let message = "ระบบไม่รองรับ. กรุณาเลือกตามที่แสดงผล!!"
                res.json({message})
            }
        }else{
            console.log(req.body)
        }
    }
}
controller.updateStatusManage = (req,res) =>{ 
    if(typeof req.session.userid === "undefined"){ res.redirect('/') }else{
        const getValue = req.body.value;
        const hash = Base64.stringify(sha256(getValue));
        if(hash === "bDQmT7ynPWpQt3ZbV6/RiV1UrCPbd3+WZE8Z09TGOAU="){
            const {id} = req.params;
            const status = req.body.status;
            req.getConnection((_, conn)=>{
                conn.query('SELECT * FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id WHERE agm_id = ?;',[id],(err, manage)=>{
                    if(err){ res.json(err) }else{
                        if(manage.length > 0){
                            if(parseInt(manage[0].agm_status) == 0){
                                conn.query('UPDATE TB_TR_PDPA_AGENT_MANAGE SET agm_status = ? WHERE agm_id = ?;',[status, id],(err,pass)=>{
                                    if(err){ res.json(err) }else{
                                        res.json(pass)
                                    }
                                })
                            }else if(parseInt(manage[0].agm_status) == 1){
                                conn.query('UPDATE TB_TR_PDPA_AGENT_MANAGE SET agm_status = ? WHERE agm_id = ?;',[status, id],(err,pass)=>{
                                    if(err){ res.json(err) }else{
                                        res.json(pass)
                                    }
                                })
                            }
                        }
                    }
                })
            })
        }else{
            console.log(req.body)
        }
    }
}
controller.fileLogAg1 = (req, res) => {
    if (typeof req.session.userid === 'undefined') { res.redirect('/'); } else {
        req.getConnection((_, conn) => {
            conn.query('SELECT id FROM TB_TR_PDPA_AGENT_FILE_DIR ORDER BY id DESC;', (_, idDir) => {
                conn.query('SELECT * FROM TB_TR_PDPA_AGENT_FILE_DIR ORDER BY id DESC;', (_, dirDevice) => {
                    conn.query('SELECT device_name FROM TB_TR_PDPA_AGENT_FILE_DIR GROUP BY device_name;', (err, allDevice) => {
                        if (err) res.json(err)
                        for (const i in dirDevice){
                            dirDevice[i].id = parseInt(i)+1
                        }
                        const len = (e) =>{
                            let a = 0
                            e.forEach(function(r){
                                a+=r.size
                            })
                            return a
                        }
                        res.json({
                            dir: allDevice.length,
                            id_files: idDir,
                            files: dirDevice,
                            total: len(dirDevice)
                        });
                    })
                })
            })
        });
    }
}
controller.fileLogAg1Detail = (req, res) => {
    if (typeof req.session.userid === 'undefined') { res.redirect('/'); } else {
        const id = req.body.id
        req.getConnection((_, conn) => {
            conn.query('SELECT * FROM TB_TR_PDPA_AGENT_FILE_DIR WHERE id = ?;', [id], (err, dirDevice) => {
                if (err) res.json(err)
                res.json(dirDevice);
            })
        })
    }
}
controller.databaseAg1 = (req, res) => {
    if (typeof req.session.userid ==='undefined') { res.redirect('/'); } else {
        req.getConnection((_, conn) => {
            conn.query('SELECT * FROM TB_TR_PDPA_AGENT_DATABASE_CHECK;',(_, database) => {
                conn.query('SELECT id FROM TB_TR_PDPA_AGENT_DATABASE_CHECK;', (err, idDatabase) => {
                    if (err) {
                        res.json(err)
                    } else {
                        for (i in database) {
                            database[i].id = parseInt(i) + 1
                        }
                        res.json({
                            data: database,
                            id_data: idDatabase,
                        });
                    }
                })
            });
        })
    }
}
controller.databaseAg2 = (req, res) => {
    if (typeof req.session.userid === "undefined") res.redirect("/");
    const value = req.body.value;
    const listColumns = (a, i, b) => {
        if (i === a.length){
            return b
        }else{
            if (i === 9){
                b.push(`field_${0}`)
                return listColumns(a, (i+1), b)
            }else{
                b.push(`field_${i+1}`)
                return listColumns(a, (i+1), b)
            }
        }
    }
    const columns = listColumns(value.split(":")[1].split(","), 0, [])
    req.getConnection((_, conn) =>{
        conn.query("SELECT id FROM TB_TR_PDPA_AGENT_DATABASE_CHECK WHERE from_client = ?;", [value], (_, idSelected) =>{
            conn.query(`SELECT id,${columns},_get FROM TB_TR_PDPA_AGENT_DATABASE_CHECK WHERE from_client = ?;`, [value], (err, selected) =>{
                if(err) res.json(err)
                const convSelected = (d, i) => {
                    if(i === d.length) return d
                    d[i].id = i+1
                    return convSelected(d, (i+1))
                }
                res.json({id: idSelected, data: convSelected(selected, 0), column: columns})
            })
        })
    })
}
controller.databaseAg3 = (req, res) => {
    if (typeof req.session.userid === 'undefined') { res.redirect('/'); } else {
        if (req.body.id){
            const id = req.body.id;
            req.getConnection((_, conn) => {
                conn.query('SELECT * FROM TB_TR_PDPA_AGENT_DATABASE_CHECK WHERE id = ?',[id],(_, database) => {
                    conn.query('SELECT id FROM TB_TR_PDPA_AGENT_DATABASE_CHECK WHERE id = ?',[id], (_, idDatabase) => {
                        const columns = database[0].from_client.split(":")[1].split(",")
                        const listColumns = (c, i, a) => {
                            if(i === c.length) return a
                            a.push(`field_${i+1}`)
                            return listColumns(c, (i+1), a)
                        }
                        conn.query(`SELECT ${listColumns(columns, 0, [])},_get FROM TB_TR_PDPA_AGENT_DATABASE_CHECK WHERE id = ?;`, [id], (err, selected) =>{
                            if (err) {
                                res.json(err)
                            } else {
                                res.json({
                                    data: selected,
                                    id_data: idDatabase,
                                    column: listColumns(columns, 0, []),
                                });
                            }
                        })    
                    })
                })
            });
        }
    }
}
controller.loggerAg1 = (req, res) => {
    if (typeof req.session.userid === 'undefined') { res.redirect('/'); } else {
        req.getConnection((_, conn) => {
            conn.query('SELECT id, device_name,os_name,path,name_file,total_line,DATE_FORMAT(date_now, "%d/%m/%Y %H:%i") as date_now, value FROM TB_TR_PDPA_AGENT_LOG0_HASH;', (_, hash) => {
                conn.query('SELECT id FROM TB_TR_PDPA_AGENT_LOG0_HASH;', (_, hashId) => {
                    conn.query('SELECT path, count(path) as cpath FROM TB_TR_PDPA_AGENT_LOG0_HASH GROUP BY path', (err, path) => {
                        if (err) {
                            res.json(err)
                        } else {
                            for (i in hash) {
                                hash[i].id = parseInt(i) + 1
                            }
                            res.json({
                                hash: hash,
                                id_hash:hashId,
                                path: path,
                            });
                        }
                    })
                })
            })
        });
    }
}
controller.loggerAg2 = (req, res) => {
    if (typeof req.session.userid === 'undefined') { res.redirect('/'); } else {
        const id = req.body.id;
        req.getConnection((_, conn) => {
            conn.query('SELECT id, device_name,os_name,path,name_file,total_line,DATE_FORMAT(date_now, "%d/%m/%Y %H:%i") as date_now, value FROM TB_TR_PDPA_AGENT_LOG0_HASH WHERE id = ?',[id], (_, hash) => {
                conn.query('SELECT id FROM TB_TR_PDPA_AGENT_LOG0_HASH WHERE id = ?;',[id], (_, hashId) => {
                    conn.query('SELECT path, count(path) as cpath FROM TB_TR_PDPA_AGENT_LOG0_HASH GROUP BY path', (_, path) => {
                        conn.query('SELECT * FROM TB_MM_SET_SYSTEM ORDER BY sys_id DESC LIMIT 1;', (err, sys) =>{
                            if (err) {
                                res.json(err)
                            } else {
                                for (i in hash) {
                                    hash[i].id = parseInt(i) + 1
                                }
                                res.json({
                                    hash: hash,
                                    id_hash:hashId,
                                    path: path,
                                    sys: sys
                                });
                            }
                        })
                    })
                })
            })
        });
    }
}
controller.sniffer1 = (req, res) =>{
    if(typeof req.session.userid === 'undefined'){ res.redirect('/') }else{
        const getValue = req.body.value;
        const hash = Base64.stringify(sha256(getValue))
        if(hash === "H5B34RecpaLM0NPclLyC5Z3+3fImERiuFnWUw5FWsGg="){
            let nameDir = req.body.fullpath+req.body.dir+"/";
            let files = fs.readdirSync(nameDir).filter(i => i !== ".DS_Store" && (i.includes('.log') || i.includes('.snf')));
            let convertFiles = []
            let obj = []
            files.forEach(function(i, n){
                data = fs.readFileSync(nameDir+i, 'utf8')
                let status = fs.statSync(nameDir+i)
                obj.push({"name": i, "data": data})
                let name = i.split('.')
                name = name.splice('snf', (name.length-1)).join(".")
                convertFiles.push({"no": parseInt(n)+1, "name": name, "size": status.size, "extension": path.extname(i)})
            })
            res.json({files, data: obj, info: convertFiles})
        }else{
            console.log(req.body)
        }
    }
}
controller.chartSniffer = (req, res) =>{
    if (typeof req.session.userid === 'undefined'){ res.redirect('/') }else{
        const getValue = req.body.value;
        const dir = path.join(process.cwd(), '/path/agent_sniffer/')
        const hash = Base64.stringify(sha256(getValue));
        if(hash === "G/xfQ7esPpJcGm7ZvYk0keBz2gtPqUS31lmjPE3SnKg="){
            let path = fs.readdirSync(dir).filter(i => i !== ".DS_Store" && (i.includes('.log') || i.includes('.snf')));
            let obj = []
            let length = []
            path.forEach(i => {
                let list = fs.readdirSync(dir+i);
                length.push(list.length)
                obj.push({'name': i, 'length': list.length})
            })
            res.json({obj: obj, data: path , len: length})
        }else{
            console.log(req.body)
        }
    }
}
controller.store1 = (req, res) =>{
    if(typeof req.session.userid === 'undefined'){ res.redirect('/') }else{
        const getValue = req.body.value;
        const hash = Base64.stringify(sha256(getValue));
        if (hash === "wj6SXXO5Ema5j3VdpC0+kvo68T2G1Ye/sxZVN8doW24="){
            req.getConnection((_, conn)=>{
                conn.query('SELECT ags_id FROM TB_TR_PDPA_AGENT_STORE;', (_, idStore)=>{
                    conn.query('SELECT * FROM TB_TR_PDPA_AGENT_STORE;', (err, store)=>{
                        if(err){ res.json(err) }else{
                            store.forEach(function(_, i){
                                store[i].ags_id = parseInt(i)+1
                            })
                            res.json({id_store: idStore, store})
                        }
                    });
                });
            });
        }else{
            console.log(req.body)
        }
    }
}
controller.searchGlobal = (req, res) =>{
    if(typeof req.session.userid === 'undefined'){ res.redirect("/"); }else{
        if(Base64.stringify(sha256(req.body.value)) !== "sFN1sLGU2NgyHaVELvJdjcEL3zBByFVV/eFfrXXzS54=") res.json(req.body);
        const from = req.body.from;
        const data = req.body.data;
        const key = req.body.more;
        if (from === "log"){
            req.getConnection((_, conn) => {
                conn.query(`SELECT * FROM TB_TR_PDPA_AGENT_LOG0_HASH WHERE device_name LIKE "%${data}%" OR os_name LIKE "%${data}%" OR path LIKE "%${data}%" OR name_file LIKE "%${data}%";`,(err, result) =>{
                    if(err) res.json(err);
                    res.json(result);
                });
            });
        }else if(from === "file"){
            req.getConnection((_, conn) => {
                conn.query(`SELECT * FROM TB_TR_PDPA_AGENT_FILE_DIR WHERE device_name LIKE "%${data}%" OR os_name LIKE "%${data}%" OR name_file LIKE "%${data}%";`,(err, result) =>{
                    if(err) res.json(err)
                    res.json(result);
                })
            })
        }else if(from === "db"){
            req.getConnection((_, conn) => {
                let field = [];
                let likeField = [];
                for (let i = 0; i < key.split(":")[key.split(":").length - 1].split(",").length; i++){
                    if(parseInt(i)+1 === key.split(":")[key.split(":").length - 1].split(",").length){
                        if(parseInt(i)+1 === 10){
                            field.push(`field_0`);
                            likeField.push(`client.field_0 LIKE "%${data}%";`);
                        }else{
                            field.push(`field_${i+1}`)
                            likeField.push(`client.field_${i+1} LIKE "%${data}%";`);
                        }
                    }else{
                        field.push(`field_${i+1}`)
                        likeField.push(`client.field_${i+1} LIKE "%${data}%" OR`);
                    }
                }
                conn.query(`SELECT * FROM (SELECT ${String(field)} FROM TB_TR_PDPA_AGENT_DATABASE_CHECK WHERE from_client = "${key}") as client WHERE ${likeField.join(" ")}`, (err, result) =>{
                    if(err) res.json(err)
                    res.json(result);
                })
            })
        }else if(from === "sniffer"){
            let files = fs.readdirSync(key).filter(i => i !== ".DS_Store" && (i.includes('.snf') || i.includes('.log')));
            res.json(files)
        }else if(from === "manage"){
            req.getConnection((_, conn) =>{
                conn.query(`SELECT * FROM (SELECT pam.agm_name, pas.code, pas.name, CONCAT(a.firstname, ' ' ,a.lastname) as fullname FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id JOIN TB_TR_ACCOUNT as a ON pam.acc_id = a.acc_id) as manage WHERE manage.agm_name LIKE "%${data}%" OR manage.code LIKE "%${data}%" OR manage.name LIKE "%${data}%" OR manage.fullname LIKE "%${data}%";`, (err,result) =>{
                    if(err) res.json(err);
                    res.json(result);
                })
            })
        }else{
            res.json({message: null})
        }
    }
}
controller.selectSearchGlobal = (req, res) =>{ 
    if(typeof req.session.userid === "undefined"){ res.redirect("/"); }else{
        if(Base64.stringify(sha256(req.body.value)) !== "3W1h5UZkOe4FRuaX8Cm6ZV0/dULCRPewMK1R3XZJ7Do=") res.json(req.body);
        const from = req.body.from;
        const selectData = req.body.select;
        var selectKey = req.body.key;
        if( from === "log" ){
            req.getConnection((_, conn) => {
                conn.query(`SELECT id FROM TB_TR_PDPA_AGENT_LOG0_HASH WHERE device_name LIKE "%${selectData}%" OR os_name LIKE "%${selectData}%" OR path LIKE "%${selectData}%" OR name_file LIKE "%${selectData}%";`,(_, id)=>{
                    conn.query(`SELECT * FROM TB_TR_PDPA_AGENT_LOG0_HASH WHERE device_name LIKE "%${selectData}%" OR os_name LIKE "%${selectData}%" OR path LIKE "%${selectData}%" OR name_file LIKE "%${selectData}%";`,(err, result)=>{
                        if(err) res.json(err)
                        for( let i = 0; i < result.length; i++ ) result[i].id = parseInt(i)+1;
                        res.json({id, result})
                    });
                });
            });
        }else if( from === "file" ){
            req.getConnection((_, conn) => {
                conn.query(`SELECT id FROM TB_TR_PDPA_AGENT_FILE_DIR WHERE device_name LIKE "%${selectData}%" OR os_name LIKE "%${selectData}%" OR name_file LIKE "%${selectData}%";`,(_, id)=>{
                    conn.query(`SELECT * FROM TB_TR_PDPA_AGENT_FILE_DIR WHERE device_name LIKE "%${selectData}%" OR os_name LIKE "%${selectData}%" OR name_file LIKE "%${selectData}%";`,(err, result)=>{
                        if(err) res.json(err)
                        for( let i = 0; i < result.length; i++ ) result[i].id = parseInt(i)+1;
                        res.json({id, result})
                    });
                });
            });
        }else if( from === "db" ){
            let field = ["id",];
            let likeField = [];
            for (let i = 0; i < selectKey.split(":")[selectKey.split(":").length - 1].split(",").length; i++){
                if(parseInt(i)+1 === selectKey.split(":")[selectKey.split(":").length - 1].split(",").length){
                    if(parseInt(i)+1 === 10){
                        field.push(`field_0`);
                        likeField.push(`phase.field_0 LIKE "%${selectData}%";`);
                    }else{
                        field.push(`field_${i+1}`)
                        likeField.push(`phase.field_${i+1} LIKE "%${selectData}%";`);
                    }
                }else{
                    field.push(`field_${i+1}`)
                    likeField.push(`phase.field_${i+1} LIKE "%${selectData}%" OR`);
                }
            }
            req.getConnection((_, conn) =>{
                conn.query(`SELECT * FROM (SELECT ${String(field)},_get FROM TB_TR_PDPA_AGENT_DATABASE_CHECK WHERE from_client = "${selectKey}") as phase WHERE ${likeField.join(" ")};`,(err, result) =>{
                    let id = [];
                    result.map(e => id.push({"id": e.id}));
                    if(err) res.json(err)
                    const convResult = (r) =>{
                        r.forEach(function(_, i){
                            result[i].id = parseInt(i)+1;
                        })
                        return r
                    }
                    field.shift();
                    res.json({id: id, result: convResult(result), column: field});
                });
            });
        }else if( from === "sniffer" ){
            let files = fs.readdirSync(selectKey).filter(i => i !== ".DS_Store" && (i.includes('.snf') || i.includes('.log')));
            if (selectKey.split("/")[selectKey.split("/").length - 1] !== ""){
                selectKey += "/"
            }
            let infoFile = []
            let result = []
            files.forEach(function(i, n){
                if(i.includes(selectData) === true){
                    data = fs.readFileSync(`${selectKey}${i}`, 'utf8')
                    let status = fs.statSync(`${selectKey}${i}`)
                    result.push({"name": i, "data": data})
                    let name = i.split('.')
                    name = name.splice('snf', (name.length-1)).join(".")
                    infoFile.push({"no": parseInt(n)+1, "name": name, "size": status.size, "extension": path.extname(i)})
                }
            })
            res.json({id: [0,0,0], data: result, result: infoFile})
        }else if( from === "manage" ){
            req.getConnection((_, conn) =>{
                conn.query('SELECT * FROM TB_TR_ACCOUNT;',(_, account)=>{
                    conn.query(`SELECT manage.agm_id FROM (SELECT pam.agm_id, pam.agm_name, pas.code, pas.name, CONCAT(a.firstname, ' ' ,a.lastname) as fullname FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id JOIN TB_TR_ACCOUNT as a ON pam.acc_id = a.acc_id) as manage WHERE manage.agm_name LIKE "%${selectData}%" OR manage.code LIKE "%${selectData}%" OR manage.name LIKE "%${selectData}%" OR manage.fullname LIKE "%${selectData}%";`, (_, id) =>{
                        conn.query(`SELECT * FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id JOIN TB_TR_ACCOUNT as a ON pam.acc_id = a.acc_id WHERE pam.agm_name LIKE "%${selectData}%" OR pas.code LIKE "%${selectData}%" OR pas.name LIKE "%${selectData}%" OR a.firstname LIKE "%${selectData}%" OR a.lastname LIKE "%${selectData}%";`, (_,result) =>{
                            conn.query(`SELECT agm_id, (SELECT _get_ from TB_TR_PDPA_AGENT_LISTEN_HISTORY WHERE agm_id = manage.agm_id ORDER BY alh_id desc limit 0,1) as last_access FROM (SELECT pam.agm_id, pam.agm_name, pas.code, pas.name, CONCAT(a.firstname, ' ' ,a.lastname) as fullname FROM TB_TR_PDPA_AGENT_MANAGE as pam JOIN TB_TR_PDPA_AGENT_STORE as pas ON pam.ags_id = pas.ags_id JOIN TB_TR_ACCOUNT as a ON pam.acc_id = a.acc_id) as manage WHERE manage.agm_name LIKE "%${selectData}%" OR manage.code LIKE "%${selectData}%" OR manage.name LIKE "%${selectData}%" OR manage.fullname LIKE "%${selectData}%";`, (err, history) => {
                                if(err) res.json(err);
                                for(let i = 0; i < result.length; i++){
                                    result[i].agm_id = parseInt(i)+1
                                }
                                res.json({id, result, account, history});
                            })
                        })
                    })
                })
            })
        }else{
            res.json({message: null})
        }
    }
}
// File/Log 
controller.fileLogAg = (req, res) => {
    if (typeof req.session.userid === 'undefined') { res.redirect('/'); } else {
        const user = req.session.userid;
        req.getConnection((_, conn) => {
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC LIMIT 30;', [user], (_, history) => {
                conn.query('SELECT * FROM TB_MM_PDPA_WORDS', (_, words) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_AGENT_FILE_DIR;', (err, dirDevice) => {
                        if(err) res.json(err)
                        let word = []
                        let word1 = []
                        for (i in words) {
                            word.push(words[i].words_id)
                            word1.push(words[i].words_often)
                        }
                        res.render('./agent/file_log_ag', {
                            dir: dirDevice.length,
                            files: dirDevice,
                            history: history,
                            words: words,
                            words1: word,
                            words2: word1,
                            session: req.session
                        });
                        funHistory.funchistory(req, "Agent File/Log", `เข้าสู่เมนู ข้อมูล Agent File/Log`, user)
                    })
                });
            });
        })
    }
}
// Datacheck
controller.databaseAg = (req, res) => {
    if (typeof req.session.userid === 'undefined') { res.redirect('/');
    } else {
        const user = req.session.userid;
        req.getConnection((_, conn) => {
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC LIMIT 30;', [user], (_, history) => {
                conn.query('SELECT * FROM TB_MM_PDPA_WORDS', (_, words) => {
                    conn.query('SELECT from_client FROM TB_TR_PDPA_AGENT_DATABASE_CHECK GROUP BY from_client;',(_, client) => {
                        conn.query('SELECT * FROM TB_TR_PDPA_AGENT_DATABASE_CHECK;', (err, database) => {
                            let word = []
                            let word1 = []
                            for (i in words) {
                                word.push(words[i].words_id)
                                word1.push(words[i].words_often)
                            }
                            if (err) {
                                res.json(err)
                            }
                            res.render('./agent/database_ag', {
                                data0: client,
                                data: database,
                                history: history,
                                words: words,
                                words1: word,
                                words2: word1,
                                session: req.session
                            });
                            funHistory.funchistory(req, "Agent Database", `เข้าสู่เมนู ข้อมูล Agent Database`, user)
                        })
                    });
                });
            })
        })
    }
}
// Delete Record (Datacheck)
controller.delDatabaseAg = (req, res) => {
    if (typeof req.session.userid === 'undefined') { res.redirect('/'); } else {
        const data_id = req.params;
        const errorss = { errors: [{ value: '', msg: 'ไม่สามารถลบข้อมูลนี้ได้', param: '', location: '' }] }
        req.getConnection((_, conn) => {
            conn.query("DELETE FROM TB_TR_PDPA_AGENT_DATABASE_CHECK WHERE id = ?", [data_id], (err, _) => {
                if (err) {
                    req.session.errors = errorss;
                    req.session.success = false;
                } else {
                    req.session.success = true;
                    req.session.topic = "ลบข้อมูลเสร็จแล้ว";
                }
                res.redirect(req.get('referrer'));
            });
            res.redirect(req.get('referrer'));
            funHistory.funchistory(req, "Agent Database", `ลบข้อมูล Agent Database`, req.session.userid)
        });
    }
}
// Log0 hash
controller.loggerAg = (req, res) => {
    if (typeof req.session.userid === 'undefined') { res.redirect('/'); } else {
        const user = req.session.userid;
        req.getConnection((_, conn) => {
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC LIMIT 30;', [user], (_, history) => {
                conn.query('SELECT * FROM TB_MM_PDPA_WORDS', (_, words) => {
                    conn.query('SELECT id, device_name,os_name,path,name_file,total_line,DATE_FORMAT(date_now, "%d/%m/%Y %H:%i") as date_now, value FROM TB_TR_PDPA_AGENT_LOG0_HASH;', (_, hash) => {
                        conn.query('SELECT path, count(path) as cpath FROM TB_TR_PDPA_AGENT_LOG0_HASH GROUP BY path;', (err, path) => {
                            let word = []
                            let word1 = []
                            for (i in words) {
                                word.push(words[i].words_id)
                                word1.push(words[i].words_often)
                            }
                            if (err) res.json(err)
                            res.render('./agent/logger_hash_ag', {
                                hash: hash,
                                path: path,
                                history: history,
                                words: words,
                                words1: word,
                                words2: word1,
                                session: req.session
                            });
                            funHistory.funchistory(req, "Agent Logger", `เข้าสู่เมนู ข้อมูล Agent Database`, user)
                        })
                    })
                });
            });
        })
    }
}
// Sniffer
controller.sniffer = (req, res) =>{
    if(typeof req.session.userid == 'undefined'){ res.redirect('/') }else{
        const user = req.session.userid;
        const folder_sniffer = path.join(process.cwd(), '/path/agent_sniffer/');
        req.getConnection((_ , conn) => {
            conn.query('SELECT DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC LIMIT 30;', [user], (_, history) => { conn.query('SELECT * FROM TB_MM_PDPA_WORDS', (err, words) => {
                    let word = []
                    let word1 = []
                    for (i in words) {
                        word.push(words[i].words_id)
                        word1.push(words[i].words_often)
                    }
                    if (err) {
                        res.json(err)
                    }else{
                        let obj = [];
                        let path = fs.readdirSync(folder_sniffer);
                        path.forEach(i =>{
                            if(i != '.DS_Store'){
                                obj.push({"name": i, "files": fs.readdirSync(folder_sniffer+i)})
                            }
                        })
                        res.render('./agent/sniffer', {
                            fullpath: folder_sniffer,
                            total_path: obj,
                            history: history,
                            words: words,
                            words1: word,
                            words2: word1,
                            session: req.session
                        });
                        funHistory.funchistory(req, "Agent Sniffer", `เข้าสู่เมนู ข้อมูล Agent Sniffer`, user)
                    }
                });
            });
        })
    }
}
// Store
controller.store = (req, res) =>{
    if (typeof req.session.userid === 'undefined'){ res.redirect('/') }else{
        const user = req.session.userid;
        req.getConnection((_, conn) => {
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC LIMIT 30;', [user], (_, history) => {
                conn.query('SELECT * FROM TB_MM_PDPA_WORDS', (err, words) => {
                    let word = []
                    let word1 = []
                    for (i in words) {
                        word.push(words[i].words_id)
                        word1.push(words[i].words_often)
                    }
                    if (err) {
                        res.json(err)
                    }else{
                        res.render('./agent/store', {
                            history: history,
                            words: words,
                            words1: word,
                            words2: word1,
                            session: req.session
                        });
                        funHistory.funchistory(req, "Agent Store", `เข้าสู่เมนู ข้อมูล Agent Store`, user)
                    }
                });
            });
        })
    }
}
// Update status
controller.updateStore = (req, res) =>{
    if(typeof req.session.userid === "undefined"){ res.redirect('/') }else{
        const getValue = req.body.value;
        const hash = Base64.stringify(sha256(getValue));
        if(hash === "9E/clr1SIYX6yb2seanamVImfJP20wUyY2Mae99rkUQ="){
            const {id} = req.params;
            const status = req.body.status;
            req.getConnection((_,conn) =>{ 
                conn.query('SELECT * FROM TB_TR_PDPA_AGENT_STORE WHERE ags_id = ?;',[id],(err,store)=>{
                    if(err){ res.json(err) }else{
                        if(store.length > 0){
                            conn.query('UPDATE TB_TR_PDPA_AGENT_STORE SET status = ? WHERE ags_id = ?;',[status,id],(err,pass)=>{
                                if(err){ res.json(err) }else{
                                    res.json(pass)
                                }
                            })
                        }
                    }
                })
            })
        }else{
            console.log(req.body)
        }
    }
}
// Detail service
controller.detailStore = (req, res) =>{
    if (typeof req.session.userid === 'undefined'){ res.redirect('/') }else{
        const user = req.session.userid;
        const {id} = req.params;
        req.getConnection((_, conn) => {
            conn.query('select DATE_FORMAT(dl.log_date, "%Y-%m-%d %H:%i:%s" ) as date_history,dl.log_detail as detail_history ,dl.user_id as user_history,dl.log_action as action_history,d.doc_name as docname_history from TB_TR_PDPA_DOCUMENT as d join TB_TR_PDPA_DOCUMENT_LOG as dl on dl.doc_id = d.doc_id WHERE dl.user_id = ? order by dl.log_date DESC LIMIT 30;', [user], (_, history) => {
                conn.query('SELECT * FROM TB_MM_PDPA_WORDS', (_, words) => {
                    conn.query('SELECT * FROM TB_TR_PDPA_AGENT_STORE WHERE ags_id = ?;',[id],(err, store) => {
                        let word = []
                        let word1 = []
                        for (i in words) {
                            word.push(words[i].words_id)
                            word1.push(words[i].words_often)
                        }
                        if (err) {
                            res.json(err)
                        }else{
                            res.render('./agent/detailStore', {
                                service: store,
                                history: history,
                                words: words,
                                words1: word,
                                words2: word1,
                                session: req.session
                            });
                            funHistory.funchistory(req, "Agent Store", `ดูข้อมูล Agent Store`, user)
                        }
                    });
                });
            });
        })
    }
}

module.exports = controller
