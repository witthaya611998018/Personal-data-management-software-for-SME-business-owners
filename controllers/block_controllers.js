const controller = {};
const fs = require('fs');
const { validationResult } = require('express-validator');
const { format } = require('path');
const path = require('path');

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hours = d.getHours(),
        minutes = d.getMinutes(),
        seconds = d.getSeconds();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    if (hours.length < 2)
        hours = '0' + hours;
    if (minutes.length < 2)
        minutes = '0' + minutes;
    if (seconds.length < 2)
        seconds = '0' + seconds;

    var full = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    return full;
}
function listFiles(dirname) {
    return fs.readdirSync(dirname).sort(function (a, b) { return fs.statSync(dirname + a).mtime.getTime() - fs.statSync(dirname + b).mtime.getTime(); })
}
function listHistory(filename) {
    let data = fs.readFileSync(filename, 'utf-8').split("\n");
    data.pop()
    data.push('Inprogress')
    return data
}

// All List
controller.list = (req, res) => {
    if(typeof req.session.userid == 'undefined'){
        res.redirect('/')
    }else{
        const dir_blocks = path.join(process.cwd(), '/path/local_micro_blockchain/blocks/')
        const dir_logs = path.join(process.cwd(), '/path/local_micro_blockchain/logs/')
        const config_file = path.join(process.cwd(), '/path/local_micro_blockchain/shell_script/config.conf')
        const dir_history = path.join(process.cwd(), '/path/local_micro_blockchain/shell_script/historys/')
        //const dir_blocks = '/Users/kuzan04/Documents/workSpace/CRRU_Year_4.1/CPE4501/Part_2_2/blocks/';
        //const dir_logs = '/Users/kuzan04/Documents/workSpace/CRRU_Year_4.1/CPE4501/Part_2_2/logs/';
        //const config_file = '/Users/kuzan04/Documents/workSpace/CRRU_Year_4.1/CPE4501/Part_2_2/shell_script/config.conf';
        //const dir_history = '/Users/kuzan04/Documents/workSpace/CRRU_Year_4.1/CPE4501/Part_2_2/shell_script/historys/';
        const file_blocks = fs.readdirSync(dir_blocks);
        const file_logs = fs.readdirSync(dir_logs);
        const history_file = fs.readdirSync(dir_history);
        const config = fs.readFileSync(config_file, 'utf-8').split(/\r?\n/);
        let status_chain = [];  // All Status Chain
        let count_h = 0;
        for (var i = 15; i < config.length; i++) {
            var list = config[i].split("=");
            var list2;
            if(list.length > 1 && list[0] != null && list[0] != ""){
                list2 = list[1].split(",");
                count_h += 1
                status_chain.push({ "no": count_h, "name": list[0], "status": list2[0], "time": list2[1] });
            }
        }
        let list_log = [];    // All Logs
        let list_block = []; // All Blocks
        let file_logs_length = 0;
        let file_block_length = 0;
        let count = 0;
        for (var i = 0; i < ((file_blocks.length + file_logs.length) / 2); i++) {
            if (file_logs[i].includes(".DS_Store") === false && file_blocks[i].includes(".DS_Store") === false){
                count += 1
                let mixDir_log = dir_logs + file_logs[i] + "/";
                list_log.push({ "no": count, "name": file_logs[i], "list": listFiles(mixDir_log) })
                file_logs_length += listFiles(mixDir_log).length;
                let mixDir_block = dir_blocks + file_blocks[i] + '/';
                list_block.push({ "no": count, "name": file_blocks[i], "list": listFiles(mixDir_block) })
                file_block_length += listFiles(mixDir_block).length;
            }
        }
        let history_blocks = []; // All History
        let count_hb = 0;
        for (var i = 0; i < history_file.length; i++) {
            if (history_file[i].includes("DS_Store") === false){
                count_hb += 1
                let mixDir_history = dir_history + history_file[i];
                let name = history_file[i].split('.')
                let re_name = name.splice(name[-1], name.length - 1).join(".")
                history_blocks.push({ "no": count_hb, "name": re_name, "status": listHistory(mixDir_history) })
            }
        }
        res.render('./block/block_list', {
            block_length: file_block_length,
            log_length: file_logs_length,
            total_run_chain: (list_log.length + list_block.length) / 2,
            status_chain: status_chain,
            blocks: list_block,
            historys: history_blocks,
            session: req.session
        });
    }
};
// Send to Ajax
controller.list1 = (req, res) => {
    if(typeof req.session.userid == 'undefined'){
        res.redirect('/')
    }else{
        const dir_blocks = path.join(process.cwd(), '/path/local_micro_blockchain/blocks/')
        const dir_logs = path.join(process.cwd(), '/path/local_micro_blockchain/logs/')
        const config_file = path.join(process.cwd(), '/path/local_micro_blockchain/shell_script/config.conf')
        const dir_history = path.join(process.cwd(), '/path/local_micro_blockchain/shell_script/historys/')
        //const dir_blocks = '/Users/kuzan04/Documents/workSpace/CRRU_Year_4.1/CPE4501/Part_2_2/blocks/';
        //const dir_logs = '/Users/kuzan04/Documents/workSpace/CRRU_Year_4.1/CPE4501/Part_2_2/logs/';
        //const config_file = '/Users/kuzan04/Documents/workSpace/CRRU_Year_4.1/CPE4501/Part_2_2/shell_script/config.conf';
        //const dir_history = '/Users/kuzan04/Documents/workSpace/CRRU_Year_4.1/CPE4501/Part_2_2/shell_script/historys/';
        const file_blocks = fs.readdirSync(dir_blocks);
        const file_logs = fs.readdirSync(dir_logs);
        const history_file = fs.readdirSync(dir_history);
        const config = fs.readFileSync(config_file, 'utf-8').split(/\r?\n/);
        let status_chain = [];  // All Status Chain
        let count_h = 0;
        for (var i = 15; i < config.length; i++) {
            var list = config[i].split("=");
            var list2;
            if(list.length > 1 && list[0] != null && list[0] != ""){
                list2 = list[1].split(",");
                count_h += 1
                status_chain.push({ "no": count_h, "name": list[0], "status": list2[0], "time": list2[1] });
            }
        }
        let list_log = [];    // All Logs
        let list_block = []; // All Blocks
        let file_logs_length = 0;
        let file_block_length = 0;
        let count = 0;
        for (var i = 0; i < ((file_blocks.length + file_logs.length) / 2); i++) {
            if(file_logs[i].includes(".DS_Store") === false && file_blocks[i].includes(".DS_Store") === false){
                count += 1
                let mixDir_log = dir_logs + file_logs[i] + "/";
                list_log.push({ "no": count, "name": file_logs[i], "list": listFiles(mixDir_log) })
                file_logs_length += listFiles(mixDir_log).length;
                let mixDir_block = dir_blocks + file_blocks[i] + '/';
                list_block.push({ "no": count, "name": file_blocks[i], "list": listFiles(mixDir_block) })
                file_block_length += listFiles(mixDir_block).length;
            }
        }
        let history_blocks = []; // All History
        let count_hb = 0;
        for (var i = 0; i < history_file.length; i++) {
            if (history_file[i].includes(".DS_Store") === false){
                count_hb += 1
                let mixDir_history = dir_history + history_file[i];
                let name = history_file[i].split('.')
                let re_name = name.splice(name[-1], name.length - 1).join(".")
                history_blocks.push({ "no": count_hb, "name": re_name, "status": listHistory(mixDir_history) })
            }
        }
        res.json({
            block_length: file_block_length,
            log_length: file_logs_length,
            total_run_chain: (list_log.length + list_block.length) / 2,
            status_chain: status_chain,
            blocks: list_block,
            historys: history_blocks,
            session: req.session
        });
    }
};
// Select Details
controller.select = (req, res) => {
    const { name } = req.params;
    const dir = path.join(process.cwd(), '/path/local_micro_blockchain/blocks/')
    //const dir = '/Users/kuzan04/Documents/workSpace/CRRU_Year_4.1/CPE4501/Part_2_2/blocks/';
    const statement = fs.readdirSync(dir);
    var selected = name.split(",");
    var select = [];
    var detail = [];
    for (var i = 0; i < statement.length; i++) {
        if (selected[0] == statement[i]) {
            select.push(fs.readFileSync(dir + selected[0] +"/" + name, 'utf-8').split("\n"));
        }
    }
    for (var i=0; i <select[0].length;i++){
        detail.push(select[0][i])
    }
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM TB_TR_DEVICE WHERE de_ip = ?', [selected[0]], (err, device) => {
            if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
                if (err) {
                    res.json(err)
                }
                res.render('./block/block_detail', {
                    data: detail,
                    device: device,
                    session: req.session
                });
            }
        })
    })
};

module.exports = controller;
