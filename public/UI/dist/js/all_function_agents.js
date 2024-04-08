const ajaxLoading = () => {
    $.ajaxSetup({
        method: "POST",
        timeout: 3000
    });
    $(document).on({
        ajaxStart: function(){
            //flag=true;
            //ajaxLoadingTimeout = setTimeout(function() { if(flag){ $("div#alert-loading").css('display', 'flex') } }, 100);
            $("div#alert-loading").css('display', 'flex')
        },
        ajaxComplete: function(){
            /*flag=false;
            setTimeout(ajaxLoadingTimeout);*/
            $("div#alert-loading").css('display', 'none');
        },
        ajaxStop: function(){
            $("div#alert-loading").css('display', 'none');
        }
    })
}
const convert_datetime = (d, o) => {
    let time
    let seconds
    if (o.includes(" ")){
        time = o.split(" ")[1].split(":")
        seconds = time[time.length -1]
    }else{
        time = o.split("T")[1].split(":")
        seconds = time[time.length - 1].split(".")[0]
    }
    return `${("0"+d.getDate()).slice(-2)}/${("0"+(d.getMonth()+1)).slice(-2)}/${d.getFullYear()} ${time[0]}:${time[1]}:${seconds}`
}
const convert_date = (d) => {
    return `${("0"+d.getDate()).slice(-2)}/${("0"+(d.getMonth()+1)).slice(-2)}/${d.getFullYear()}`
}
const checkSameInner = (c, i) =>{
    if(i === c.length){
         return false
    }else if(c[i].innerHTML === c[(c.length - 1) - i].innerHTML){
        return true
    }else{
        return checkSameInner(c, (i+1))
    }
};
const containsOnlyNumbers = (s) =>{
    return /^[0-9]+$/.test(s);
}
const searchData = (t, r, k) => {
    $.post("/agent/search",{ value: "@lltr@@gentSe@rchR@w", from: t, data: r, more: k}).done(function(res){
        if(r !== ""){
            if(Object.keys(res).length !== 0) {
                $('datalist#browers').empty();
                if( t === "log" || t === "file" ){
                    res.forEach(function(e){
                        let name = (f) =>{
                            if(f.slice(-4) === "xlsx"){
                                return f.slice(0, -5)
                            }
                            return f.slice(0, -4)
                        }
                        if(e.device_name.toLowerCase().includes(r.toLowerCase()) || e.device_name.toUpperCase().includes(r.toUpperCase()) || e.device_name.indexOf(r) !== -1) $('datalist#browers').append(new Option('', e.device_name));
                        if(e.os_name.toLowerCase().includes(r.toLowerCase()) || e.os_name.toUpperCase().includes(r.toUpperCase()) || e.os_name.indexOf(r) !== -1) $('datalist#browers').append(new Option('', e.os_name));
                        if(e.name_file.toLowerCase().includes(r.toLowerCase()) || e.name_file.toUpperCase().includes(r.toUpperCase()) || e.name_file.indexOf(r) !== -1) $('datalist#browers').append(new Option('', name(e.name_file)));
                    });
                }
                else if ( t === "db" ){
                    if($('tbody#table-body').children().length !== 1 && $('tbody#table-body').children()[0].querySelectorAll('td')[0].innerHTML !== "กรุณาเลือก");
                    res.forEach(function(e){
                        Object.keys(e).forEach(function(f){
                            let a = e[f].match(/[-:]/g)||[].length;
                            if (a.length === 'undefined' || a.length !== 4){
                                if(e[f] !== null && e[f].toLowerCase().includes(r.toLowerCase()) || e[f].toUpperCase().includes(r.toUpperCase()) || e[f].indexOf(r) !== -1 && containsOnlyNumbers(e[f]) === false) $('datalist#browers').append(new Option('', e[f]));
                            }
                        })
                    })
                }
                else if( t === "sniffer" ){
                    if($('tbody#table-body-sniffer').children().length !== 1 && $('tbody#table-body-sniffer').children()[0].querySelectorAll('td')[0].innerHTML !== "กรุณาเลือกอุปกรณ์");
                    res.forEach(function(e){
                        if(e.toLowerCase().includes(r.toLowerCase()) || e.toUpperCase().includes(r.toUpperCase()) || e.indexOf(r) !== -1) $('datalist#browers').append(new Option('', e));

                    })
                }
                else if( t === "manage" ){
                    res.forEach(function(e){
                        if(e.agm_name.toLowerCase().includes(r.toLowerCase()) || e.agm_name.toUpperCase().includes(r.toUpperCase()) || e.agm_name.indexOf(r) !== -1) $('datalist#browers').append(new Option('', e.agm_name));
                        if (checkSameInner($('datalist#browers').children(), 0) === false){
                            console.log(e)
                            if(e.code.toLowerCase().includes(r.toLowerCase()) || e.code.toUpperCase().includes(r.toUpperCase()) || e.code.indexOf(r) !== -1) $('datalist#browers').append(new Option('', e.code));
                            if(e.name.toLowerCase().includes(r.toLowerCase()) || e.name.toUpperCase().includes(r.toUpperCase()) || e.name.indexOf(r) !== -1) $('datalist#browers').append(new Option('', e.name));
                            if(e.fullname.toLowerCase().includes(r.toLowerCase()) || e.fullname.toUpperCase().includes(r.toUpperCase()) || e.fullname.indexOf(r) !== -1) $('datalist#browers').append(new Option('', e.fullname));
                        }
                    })
                }
            }
        }else{
            $('datalist#browers').empty();
        }
    });
}
const selectSearch = (t, r, k) =>{ 
    if( (t === "db" && $('tbody#table-body').children().length === 1 && $('tbody#table-body').children()[0].querySelectorAll('td')[0].innerHTML === "กรุณาเลือก") || (t === "sniffer" && $('tbody#table-body-sniffer').children().length === 1 && $('tbody#table-body-sniffer').children()[0].querySelectorAll('td')[0].querySelectorAll('span')[0].innerHTML)){
        $('div#err-search').css({'overflow-y': "auto", 'display': ""});
        $('span#content-err').html('ค้นหาข้อมูล');
        $('button:button#btn-err').click(function(){
            $('div#err-search').css('display', 'none');
        });
    }else{
        $.post('/agent/getSearch',{ value: "@lltr@@gentSe1ectSe@rchR@w", from: t, select: r, key: k}).done(function(res){
            let id = res.id;
            let data = res.result;
            // Options for db.
            if( Object.keys(id).length !== 0 && Object.keys(data).length !== 0){
                if ( t === "log" ){
                    $('tbody#table-body').empty();
                    $('span#start-hash').empty();
                    $('span#end-hash').empty();
                    $('span#total-hash').empty();
                    $('ul#pagination-wapper').empty();
                }else if( t === "file" ){
                    $('tbody#table-body').empty();
                    $('span#start-file').empty();
                    $('span#end-file').empty();
                    $('span#total-file').empty();
                    $('ul#pagination-wapper').empty();
                }else if( t === "db" ){
                    $('tbody#table-body').empty();
                    $('span#start').empty();
                    $('span#end').empty();
                    $('span#total-db').empty();
                    $('ul#pagination-wapper').empty();
                }else if ( t === "sniffer" ){
                    $('tbody#table-body-sniffer').empty();
                    $('span#start-files').empty();
                    $('span#end-files').empty();
                    $('span#total-files').empty();
                    $('ul#pagination-wrapper-sniffer').empty();
                }else if ( t === "manage" ){
                    $('tbody#table-body').empty();
                    $('span#start').empty();
                    $('span#end').empty();
                    $('span#total-agent').empty();
                    $('ul#pagination-wapper').empty();
                }
                // Const func of db.
                const tagTd = (d, c, j, b, i) =>{
                    if (j == Object.keys(d).length+1) {
                        return b
                    }else if(j+1 == Object.keys(d).length+1){
                        b.push(`<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist"><b class="tablesaw-cell-label"> ${j+1} </b> <span class="tablesaw-cell-content"> <a href="#" id="${i}:${d['id']}" onclick="_delete(this.id)" class="text-danger" data-bs-toggle="modal" data-bs-target="#delete"><i class="fas fa-trash-alt fa-2x"></i></a> </span></td>`)
                        return tagTd(d, c, (j+1), b, i)
                    }else if(j+2 == Object.keys(d).length+1){
                        b.push(`<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist"><b class="tablesaw-cell-label"> ${j+1} </b> <span class="tablesaw-cell-content"> ${convert_datetime(new Date(d['_get']), d['_get'])} </span></td>`)
                        return tagTd(d, c, (j+1), b, i)
                    }else if(j == 0){
                        b.push(`<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist"><b class="tablesaw-cell-label"> ${j+1} </b> <span class="tablesaw-cell-content"> ${d['id']} </span></td>`)
                        return tagTd(d, c, (j+1), b, i)
                    }else{
                        if (d[c[j-1]].length > 50){
                            b.push(`<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist"><b class="tablesaw-cell-label"> ${j+1} </b> <span class="tablesaw-cell-content"> ${d[c[j-1]].substring(0, d[c[j-1]].length/2)}<br/>${d[c[j-1]].substring(d[c[j-1]].length/2)} </span></td>`)
                        }else if (d[c[j-1]].includes('-') && d[c[j-1]].includes(':') && d[c[j-1]].length == 19){
                            b.push(`<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist"><b class="tablesaw-cell-label"> ${j+1} </b> <span class="tablesaw-cell-content"> ${convert_datetime(new Date(d[c[j-1]]), d[c[j-1]])} </span></td>`)
                        }else{
                            b.push(`<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist"><b class="tablesaw-cell-label"> ${j+1} </b> <span class="tablesaw-cell-content"> ${d[c[j-1]]} </span></td>`)
                        }
                        return tagTd(d, c, (j+1), b, i)
                    }
                } 
                const rowAll = (t, r, i) => {
                    if(i == r.length) return -1
                    t.append("<tr>"+r+"</tr>")
                }
                // End.
                // ============================== Create Prepare ============================
                var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                var state = {
                    'querySet': data,
                    'page': 1,
                    'rows': 20,
                    'window': 10,
                }
            function pagination(querySet, page, rows) {
                var trimStart = (page - 1) * rows
                var trimEnd = trimStart + rows
                var trimmedData = querySet.slice(trimStart, trimEnd)
                var pages = Math.ceil(querySet.length / rows);
                var start_count = 1
                if ( t === "log" ){
                    document.getElementById('start-hash').innerHTML = start_count
                }else if ( t === "file" ){
                    document.getElementById('start-file').innerHTML = start_count
                }else if ( t === "db" && t === "manage"){
                    document.getElementById('start').innerHTML = start_count
                }else if ( t === "sniffer" ){
                    document.getElementById('start-files').innerHTML = start_count
                }
                return {
                    'querySet': trimmedData,
                    'pages': pages,
                }
            }
            // ============================== Create Pagination ============================
                function pageButtons(pages) {
                    if( t === "sniffer" ){
                        var wrapper = document.getElementById('pagination-wrapper-sniffer')
                    }else{
                        var wrapper = document.getElementById('pagination-wapper')
                    }
                    wrapper.innerHTML = ``
                    var maxLeft = (state.page - Math.floor(state.window / 2))
                    var maxRight = (state.page + Math.floor(state.window / 2))
                    if (maxLeft < 1) {
                        maxLeft = 1
                        maxRight = state.window
                    }
                    if (maxRight > pages) {
                        maxLeft = pages - (state.window - 1)
                        if (maxLeft < 1) {
                            maxLeft = 1
                        }
                        maxRight = pages
                    }
                    for (var page = maxLeft; page <= maxRight; page++) {
                        wrapper.innerHTML += `<li class="page-item"><button class="page page-link" value=${page}>${page}</button></li>`
                    }
                    if (state.page == 1) {
                        wrapper.innerHTML = `<li class="page-item disabled"><button value=${1} class="page page-link" >&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                    } else {
                        wrapper.innerHTML = `<li class="page-item"><button value=${1} class="page page-link">&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                    }
                    if (state.page != pages) {
                        wrapper.innerHTML += `<li class="page-item"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                    } else {
                        wrapper.innerHTML += `<li class="page-item disabled"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                    }
                    $('.page').on('click', function () {
                        $('#table-body').empty()
                        state.page = Number($(this).val())
                        buildTable()
                    })
                }
                buildTable()
                // ============================== Create Table ============================
                function buildTable() {
                    if ( t !== "sniffer" ){
                        var table = $('#table-body')
                    }else{
                        var table = $('#table-body-sniffer')
                    }
                    var data = pagination(state.querySet, state.page, state.rows)
                    var myList = data.querySet
                    for (y in myList) {
                        var row = "";
                        if(state.page === 1){
                            // Statement format a form of itself.
                            if (myList[y].id !== "") {
                                //Keep in mind we are using "Template Litterals to create rows"
                                if ( t === "log"){
                                    row = '<tr>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                        '</b> <span class="tablesaw-cell-content">' + myList[y].id + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่ออุปกรณ์ที่ส่งมา</b> <span class="tablesaw-cell-content">' + myList[y].device_name + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ระบบปฏิบัติการ</b> <span class="tablesaw-cell-content">' + myList[y].os_name + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ที่อยู่ของไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].path + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].name_file + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">รายละเอียด</b> <span class="tablesaw-cell-content"><a id="' + id[y].id + '" href="javascript:void(0)" onclick="detail(this.id)" class="text-info" data-bs-toggle="modal" data-bs-target="#detail-hash"><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                        '</tr>'
                                }
                                else if ( t === "file" ){
                                    let name = (f) =>{
                                        if(f.slice(-4) === "xlsx" || f.slice(-4) === "evtx"){
                                            return f.slice(0, -5)
                                        }
                                        return f.slice(0, -4)
                                    }
                                    let extension = (f) =>{
                                        if(f.slice(-4) === "xlsx" || f.slice(-4) === "evtx"){
                                            return f.slice(-5)
                                        }
                                        return f.slice(-4)
                                    }
                                    row = '<tr>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                        '</b> <span class="tablesaw-cell-content">' + myList[y].id + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อไฟล์</b> <span class="tablesaw-cell-content">' + name(myList[y].name_file) + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">นามสกุลไฟล์</b> <span class="tablesaw-cell-content">' + extension(myList[y].name_file) + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ขนาดไฟล์</b> <span class="tablesaw-cell-content">' + convert_size(myList[y].size) + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">เวลา/วันที่ แก้ไขล่าสุด</b> <span class="tablesaw-cell-content">' + convert_datetime(new Date(myList[y]._get), myList[y]._get) + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ดูข้อมูล</b> <span class="tablesaw-cell-content"><a href="#file_log_detail" data-bs-toggle="modal" class="text-info" data-value="'+id[y].id+'"><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                        '</tr>'
                                }
                                else if ( t === "db" ){
                                    rowAll(table, tagTd(myList[y], res.column, 0, [], id[y].id), 0)
                                    end_count = myList[y].id
                                }
                                else if ( t === "sniffer" ){
                                    row = '<tr>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่: </b> <span class="tablesaw-cell-content">' + myList[y].no + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].name + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">สกุลไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].extension + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ขนาดของไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].size + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">รายละเอียด</b> <span class="tablesaw-cell-content"><a href="#detail_file" data-value="'+myList[y].name+myList[y].extension+'" class="text-info" data-bs-toggle="modal" ><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                        '</tr>'
                                }
                                else if ( t === "manage" ){
                                    let check = ""
                                    if(myList[y].agm_status == 1){
                                        check = "checked"
                                    }
                                    let fullname = res.account.filter(i => i.acc_id == myList[y].acc_id)
                                    const last_log = (rs) => {
                                        let selected = rs.filter(function(er){ if (er.agm_id === id[y].agm_id){ return er } })
                                        if(selected.length > 0 && selected.last_access){
                                            let date = new Date(selected[0].last_access)
                                            let time = selected[0].last_access.split("T").pop().split(":")
                                            let second = time[time.length - 1].split(".")
                                            return ("0" + date.getDate()).slice(-2)+"/"+("0" + (date.getMonth()+1)).slice(-2)+"/"+date.getFullYear()+" "+time[0]+":"+time[1]+":"+second[0]
                                        }
                                        return '<span style="color: red;"> - <span>'
                                    }
                                    row = '<tr>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                        '</b> <span class="tablesaw-cell-content">' + myList[y].agm_id + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อกำกับการใช้งาน</b> <span class="tablesaw-cell-content">' + myList[y].agm_name + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">รหัสของ Agent</b> <span class="tablesaw-cell-content">' + myList[y].code + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อของ Agent</b> <span class="tablesaw-cell-content">' + myList[y].name + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">วันที่สร้าง</b> <span class="tablesaw-cell-content">' + convert_date(new Date(myList[y].agm_created)) + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ผู้สร้าง</b> <span class="tablesaw-cell-content">' + fullname[0].firstname + " " + fullname[0].lastname + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">สถานะ</b> <span class="tablesaw-cell-content">' + last_log(res.history) + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">เปิด/ปิดการใช้งาน</b> <span class="tablesaw-cell-content" > <div class=" form-check form-switch"> <input type="checkbox" name="agm_status" class="form-check-input" id="turnOffOn" data-value="'+id[y].agm_id+'"'+ check +' /> </div> ' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ดูข้อมูล</b> <span class="tablesaw-cell-content"><a href="/detail_agent_manage/'+id[y].agm_id+'" class="text-info" ><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">แก้ไขข้อมูล</b> <span class="tablesaw-cell-content"><a href="/edit_agent_manage/'+id[y].agm_id+'" class="text-warning" ><i class="fas fa-pencil-alt fa-2x"></i></a></span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลบช้อมูล</b> <span class="tablesaw-cell-content"><a href="#delete_agent" data-value="'+id[y].agm_id+'" data-index="'+myList[y].ags_id+'" class="text-danger" data-bs-toggle="modal" ><i class="fas fa-trash-alt fa-2x"></i></a></span></td>' +
                                        '</tr>'
                                }
                                table.append(row)
                                end_count = myList[y].id
                            } else {
                                var row = '<tr class="odd"><td valign="top" colspan="20" class="dataTables_empty" style="color: red;">ไม่ข้อมูล</td></tr>'
                                table.append(row)
                            }
                        }else{
                            if (myList[y].id != "") {
                                if ( t === "log" ){
                                    row = '<tr>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                        '</b> <span class="tablesaw-cell-content">' + myList[y].id + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่ออุปกรณ์ที่ส่งมา</b> <span class="tablesaw-cell-content">' + myList[y].device_name + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ระบบปฏิบัติการ</b> <span class="tablesaw-cell-content">' + myList[y].os_name + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ที่อยู่ของไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].path + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].name_file + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">รายละเอียด</b> <span class="tablesaw-cell-content"><a id="' + id[parseInt(y)+parseInt(state.rows)].id + '" href="javascript:void(0)" onclick="detail(this.id)" class="text-info" data-bs-toggle="modal" data-bs-target="#detail-hash"><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                        '</tr>'
                                }
                                else if ( t === "file" ){
                                    let name = (f) =>{
                                        if(f.slice(-4) === "xlsx" || f.slice(-4) === "evtx") {
                                            return f.slice(0, -5)
                                        }
                                        return f.slice(0, -4)
                                    }
                                    let extension = (f) =>{
                                        if(f.slice(-4) === "xlsx" || f.slice(-4) === 'evtx'){
                                            return f.slice(-5)
                                        }
                                        return f.slice(-4)
                                    }
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    row = '<tr>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                        '</b> <span class="tablesaw-cell-content">' + myList[y].id + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อไฟล์</b> <span class="tablesaw-cell-content">' + name(myList[y].name_file) + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">นามสกุลไฟล์</b> <span class="tablesaw-cell-content">' + extension(myList[y].name_file) + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ขนาดไฟล์</b> <span class="tablesaw-cell-content">' + convert_size(myList[y].size) + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">เวลา/วันที่ แก้ไขล่าสุด</b> <span class="tablesaw-cell-content">' + convert_datetime(new Date(myList[y]._get), myList[y]._get) + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ดูข้อมูล</b> <span class="tablesaw-cell-content"><a href="#file_log_detail" data-bs-toggle="modal" class="text-info" data-value="'+id[parseInt(state.rows)+parseInt(y)].id+'"><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                        '</tr>'
                                }
                                else if ( t === "db" ){
                                    rowAll(table, tagTd(myList[y], res.column, 0, [], id[parseInt(state.rows)+parseInt(y)].id), 0);
                                    end_count = myList[y].id
                                }
                                else if ( t === "sniffer" ){
                                    row = '<tr>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่: </b> <span class="tablesaw-cell-content">' + myList[y].no + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].name + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">สกุลไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].extension + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ขนาดของไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].size + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">รายละเอียด</b> <span class="tablesaw-cell-content"><a href="#detail_file" data-value="'+myList[y].name+myList[y].extension+'" class="text-info" data-bs-toggle="modal" ><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                        '</tr>'
                                }
                                else if ( t === "manage" ){
                                    let check = ""
                                    if(myList[y].agm_status == 1){
                                        check = "checked"
                                    }
                                    const last_log = (rs) => {
                                        let selected = rs.filter(function(er){ if (er.agm_id === id[parseInt(state.rows)+parseInt(y)].agm_id){ return er } })
                                        if(selected.length > 0){
                                            let date = new Date(selected[0]._get_)
                                            let time = selected[0]._get_.split("T").pop().split(":")
                                            let second = time[time.length - 1].split(".")
                                            return ("0" + date.getDate()).slice(-2)+"/"+("0" + (date.getMonth()+1)).slice(-2)+"/"+date.getFullYear()+" "+time[0]+":"+time[1]+":"+second[0]
                                        }
                                        return '<span style="color: red;"> - <span>'
                                    }
                                    let fullname = res.account.filter(i => i.acc_id == myList[y].acc_id)
                                    row = '<tr>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                        '</b> <span class="tablesaw-cell-content">' + myList[y].agm_id + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อกำกับการใช้งาน</b> <span class="tablesaw-cell-content">' + myList[y].agm_name + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">รหัสของ Agent</b> <span class="tablesaw-cell-content">' + myList[y].code + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อของ Agent</b> <span class="tablesaw-cell-content">' + myList[y].name + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">วันที่สร้าง</b> <span class="tablesaw-cell-content">' + convert_date(new Date(myList[y].agm_created)) + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ผู้สร้าง</b> <span class="tablesaw-cell-content">' + fullname[0].firstname + " " + fullname[0].lastname + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">สถานะ</b> <span class="tablesaw-cell-content">' + last_log(res.history) + '</span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">เปิด/ปิดการใช้งาน</b> <span class="tablesaw-cell-content"> <div class="form-check form-switch"> <input type="checkbox" class="form-check-input" name="agm_status" id="turnOffOn" data-value="'+id[parseInt(state.rows)+parseInt(y)].agm_id+'"'+ check +' /></div>'+
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ดูข้อมูล</b> <span class="tablesaw-cell-content"><a href="/detail_agent_manage/'+id[parseInt(state.rows)+parseInt(y)].agm_id+'" class="text-info" ><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">แก้ไขข้อมูล</b> <span class="tablesaw-cell-content"><a href="/edit_agent_manage/'+id[parseInt(state.rows)+parseInt(y)].agm_id+'" class="text-warning" ><i class="fas fa-pencil-alt fa-2x"></i></a></span></td>' +
                                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลบช้อมูล</b> <span class="tablesaw-cell-content"><a href="#delete_agent" data-value="'+id[parseInt(state.rows)+parseInt(y)].agm_id+'" data-index="'+myList[y].ags_id+'" class="text-danger" data-bs-toggle="modal" ><i class="fas fa-trash-alt fa-2x"></i></a></span></td>' +
                                        '</tr>'
                                }
                                table.append(row)
                                end_count = myList[y].id
                            } else {
                                var row = '<tr class="odd"><td valign="top" colspan="20" class="dataTables_empty" style="color: red;">ไม่ข้อมูล</td></tr>'
                                table.append(row)
                            }
                        }
                    }
                    // starting and ending records
                    if ( t === "log" ){
                        $('#end-hash').html(end_count)
                        if(myList.length > 0){
                            if (myList[0].id != "") {
                                $('#start-hash').html(myList[0].id)
                            } else {
                                $('#start-hash').html(0)
                            }
                        }
                    }
                    else if (t === "file"){
                        $('#end-file').html(end_count)
                        if(myList.length > 0){
                            if (myList[0].id != "") {
                                $('#start-file').html(myList[0].id)
                            } else {
                                $('#start-file').html(0)
                            }  
                        }
                    }
                    else if ( t === "db" || t === "manage"){
                        $('#end').html(end_count)
                        if(myList.length > 0){
                            if (myList[0].id != "") {
                                $('#start').html(myList[0].id)
                            } else {
                                $('#start').html(0)
                            }
                        }
                        if(t === "db"){
                            $('#total-db').html(data.length);
                        }else{
                            $('#total-agent').html(data.length);
                        }
                    }
                    else if ( t === "sniffer" ){
                        $('#end-files').html(end_count)
                        if(myList.length > 0){
                            if (myList[0].no != "") {
                                $('#start-files').html(myList[0].no)
                                $('#total-files').html(result.info.length)
                            } else {
                                $('#start-files').html(0)
                                $('#total-files').html(0)
                            }
                        }
                    }
                    pageButtons(data.pages)
                    if (myList.length == 0) {
                        if ( t !== "sniffer" ){
                            var table = $('#table-body')
                            var row = '<tr>' +
                                '<td class="text-center" colspan="6" style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td>' +
                                '</tr>'
                            table.append(row)
                            end_count = 0
                        }else{
                            var table = $('#table-body-sniffer')
                            var row = '<tr>' +
                                '<td class="text-center" colspan="5" style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td>' +
                                '</tr>'
                            table.append(row)
                            end_count = 0
                        }
                        if( t === "log" ){
                            $('#end-hash').html(end_count)
                            $('#start-hash').html(0)
                        }else if ( t === "file" ){
                            $('#end-file').html(end_count)
                            $('#start-file').html(0)
                        }else if ( t === "db" && t === "manage" ){
                            $('#end').html(end_count)
                            $('#start').html(0)
                        }else if ( t === "sniffer" ){
                            $('#end-files').html(end_count)
                            $('#start-files').html(0)
                        }
                        pageButtons(data.pages)
                    }
                    // Add-ons of type agent.
                    if ( t === "file" ){
                        $('a[href="#file_log_detail"]').on('click', function(){
                            $.post('/file_log_ag/detail',{id: $(this).attr('data-value')}).done(function(result){
                                $('span#file_name').html(result[0].name_file);
                                if (result[0].name_file.slice(-4).includes(".")){
                                    $('span#file_extension').html(result[0].name_file.slice(-4));
                                }else{
                                    $('span#file_extension').html(result[0].name_file.slice(-5));
                                } 
                                $('span#file_size').html(convert_size(result[0].size));
                                $('span#file_edit_date').html(convert_datetime(new Date(result[0]._get), result[0]._get));
                            })
                        })
                    }
                    else if ( t === "db" ){
                        $('button#button_delete_db').on('click',function(){
                            document.getElementById('form_db_delete').action = "/database_ag/delete"+$(this).attr('data-value')
                            document.getElementById('form_db_delete').submit();
                        })
                    }
                    else if ( t === "sniffer" ){
                        $('a[href="#detail_file"]').on('click', function(){
                            let value = $(this).attr('data-value')
                            $('span#detail-name').text(value)
                            $('span#inside-name').text(value)
                            result.data.forEach(i => {
                                if(i.name == value){
                                    $('textarea#detail-show').text(i.data)
                                }
                            })
                        })
                    }
                    else if ( t === "manage" ){
                        $('input:checkbox[name="agm_status"]').on('click', function(){
                            let value = $(this).attr('data-value');
                            if($(this).prop('checked')){
                                $.post(`/agent_manage/update/status${value}`,{value: "@lltr@@gentUp@teSt@tusM@n@ge", status: 1}).done(function(result){
                                    window.location.replace = "/agent_manage/";
                                })
                            }else{
                                $.post(`/agent_manage/update/status${value}`,{value: "@lltr@@gentUp@teSt@tusM@n@ge", status: 0}).done(function(result){
                                    window.location.replace = "/agent_manage/";
                                })
                            }
                        })
                        $('a[href="#delete_agent"]').on('click',function(){
                            let id = $(this).attr('data-value'); 
                            let index = $(this).attr('data-index');
                            $.post('/agent_manage/selectManage',{id: id, value: "@lltr@@gentSe1ectM@n@ge"}).done(function(result){
                                let res = result.manage;
                                let fullname = result.account.filter(i => i.acc_id == res[0].acc_id)
                                if(res.length > 0){
                                    $('span#agent_manage_name').html(res[0].agm_name)
                                    $('span#code_agent').html(res[0].code);
                                    $('span#name_agent').html(res[0].name);
                                    $('span#some_createdate').html(convert_datetime(new Date(res[0].agm_created), res[0].agm_created));
                                    $('span#some_creator').html(fullname[0].firstname+" "+fullname[0].lastname);
                                }
                            })
                            $('button#button_delete_agent').on('click', function(){
                                document.getElementById('form_delete_agent').action = `/delete_agent_manage/${id}/${index}`
                                document.getElementById('form_delete_agent').submit();
                            })
                        })
                    }
                }
            }else{
                if( t === "sniffer" ){
                    $('#table-body-sniffer').html(`<tr><td class="text-center" colspan="16" style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td></tr>`)
                    $('#end-files').html(0)
                    $('#start-files').html(0)
                    $('#total-files').html(0)
                    $('ul#pagination-wrapper-sniffer').html(`
                        <li class="page-item disabled"><button value=${1} class="page page-link" >&#171; ย้อนกลับ</button></li>
                        <li class="page-item"><button class="page page-link" value=${1}>${1}</button></li>
                        <li class="page-item disabled"></i><button value=${1} class="page page-link" >ถัดไป &#187;</button>
                    `)
                }else{
                    $('#table-body').html(`<tr><td class="text-center" colspan="16" style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td></tr>`)
                    if( t === "log" ){
                        $('#end-hash').html(0)
                        $('#start-hash').html(0)
                        $('#total-hash').html(0)
                    }else if ( t === "file" ){
                        $('#end-file').html(0)
                        $('#start-file').html(0)
                        $('#total-file').html(0)
                    }else if ( t === "db" || t === "manage" ){
                        $('#end').html(0)
                        $('#start').html(0)
                        if( t === "db" ){
                            $('#total-db').html(0)
                        }else{
                            $('#total-agent').html(0)
                        }
                    }
                    $('ul#pagination-wapper').html(`
                        <li class="page-item disabled"><button value=${1} class="page page-link" >&#171; ย้อนกลับ</button></li>
                        <li class="page-item"><button class="page page-link" value=${1}>${1}</button></li>
                        <li class="page-item disabled"></i><button value=${1} class="page page-link" >ถัดไป &#187;</button>
                    `)
                }
            }
        });
    }
}
function convert_size(number) { 
    let kb = number / 1000
    let mb = gb = 0; 
    if (kb > 1024) {
        mb = kb / 1000
    } else {
        return kb.toFixed(1) + " KB"
    }
    if (mb > 1024) {
        gb = mb / 1000
    } else {
        return mb.toFixed(1) + " MB"
    }
    if (gb < 1024) {
        return gb.toFixed(1) + "GB"
    }
}
function findMatchObject(_object, term){
    let query = new RegExp("err", 'i');
    let rs = Object.keys(_object).find(function(q){ return query.test(q) })
    if(typeof rs === 'undefined'){
        return false
    }else{
        return true
    }
}
function appendColumn(table, columns){
    for(const i in columns){
        $(`table#table-show-column-${table}`).append(`
                <div id="div-column-${table}" class="input-group" style="margin-top: 1%;">
                    <input type="text" name="column${table}[]" value="${columns[i]}" class="form-control" readonly />
                    <button data-value="${table}" type="button" class="btn btn-outline-danger" onClick="delColumn(this)"><i class="mdi mdi-close-circle-outline"></i></button>
                </div>
        `)
        //} 
    }
}
function editAppendColumn(_array, table){
    for(const i in _array ){
        $(`table#table-show-column-${table}`).append(`
                <div id="div-column-${table}" class="input-group" style="margin-top: 1%;">
                    <input type="text" name="column${table}[]" value="${_array[i]}" class="form-control" readonly />
                    <button data-value="${table}" data-index="${i}" type="button" class="btn btn-outline-danger" onClick="delColumn(this)"><i class="mdi mdi-close-circle-outline"></i></button>
                </div>
        `)
    }
}
function findLogic(_array){
    return _array.map(function(i){ if(i.indexOf("*") !== -1){ return true }else{ return false } })
}
if(document.getElementById('a-store')){
    $.post('/agent_store',{value: "@lltr@@gentStore"}).done(function(result){
        // ============================== Create Prepare ============================
        var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

        var state = {
            'querySet': result.store,
            'page': 1,
            'rows': 5,
            'window': 10,
        }

        buildTable()

        function pagination(querySet, page, rows) {

            var trimStart = (page - 1) * rows
            var trimEnd = trimStart + rows

            var trimmedData = querySet.slice(trimStart, trimEnd)

            var pages = Math.ceil(querySet.length / rows);

            var start_count = 1
            document.getElementById('start-store').innerHTML = start_count

            return {
                'querySet': trimmedData,
                'pages': pages,

            }
        }
        // ============================== Create Pagination ============================
        function pageButtons(pages) {
            var wrapper = document.getElementById('pagination-wrapper-store')
            wrapper.innerHTML = ``

            var maxLeft = (state.page - Math.floor(state.window / 2))
            var maxRight = (state.page + Math.floor(state.window / 2))

            if (maxLeft < 1) {
                maxLeft = 1
                maxRight = state.window
            }

            if (maxRight > pages) {
                maxLeft = pages - (state.window - 1)

                if (maxLeft < 1) {
                    maxLeft = 1
                }
                maxRight = pages
            }
            for (var page = maxLeft; page <= maxRight; page++) {
                wrapper.innerHTML += `<li class="page-item"><button class="page page-link" value=${page}>${page}</button></li>`
            }

            if (state.page == 1) {
                wrapper.innerHTML = `<li class="page-item disabled"><button value=${1} class="page page-link" >&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
            } else {
                wrapper.innerHTML = `<li class="page-item"><button value=${1} class="page page-link">&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
            }

            if (state.page != pages) {
                wrapper.innerHTML += `<li class="page-item"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
            } else {
                wrapper.innerHTML += `<li class="page-item disabled"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
            }

            $('.page').on('click', function () {
                $('#table-body-sniffer').empty()
                state.page = Number($(this).val())
                buildTable()
            })

        }
        // ============================== Create Table ============================
        function buildTable() {
            var table = $('#table-body-store')
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            for (y in myList) {
                let checked = ""
                if (myList[y].status == 1){
                    checked = "checked"
                }
                if (state.page == 1){
                    if (myList[y].ags_id != "" && myList[y].hide != 1) {
                        var row =
                            `<tr>
                            <td> ${myList[y].ags_id} </td>
                            <td> <a href="/agent_store/detail${result.id_store[y].ags_id}">${myList[y].name}</a> </td>
                            <td> ${myList[y]._limit_} </td>
                            <td class="form-switch">
                                <input type="checkbox" name="status" ${checked} class="form-check-input" data-value="${result.id_store[y].ags_id}" />
                            </td>
                        </tr>`
                        table.append(row)
                        end_count = myList[y].ags_id;
                    } else {
                        var row = '<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                        table.append(row)
                    }
                }else if (state.page > 1){
                    if (myList[y].ags_id != "" && myList[y].hide != 1) {
                        var row =
                            `<tr>
                            <td> ${myList[y].ags_id} </td>
                            <td> <a href="/agent_store/detail${result.id_store[parseInt(state.rows)+parseInt(y)].ags_id}">${myList[y].name}</a> </td>
                            <td> ${myList[y]._limit_} </td>
                            <td> ${convert_datetime(new Date(myList[y].created), myList[y].created)} </td>
                            <td class="form-switch">
                                <input type="checkbox" name="status" ${checked} class="form-check-input" data-value="${result.id_store[parseInt(state.rows)+parseInt(y)].ags_id}"/>
                            </td>
                        </tr>`
                        table.append(row)
                        end_count = myList[y].ags_id;
                    } else {
                        var row = '<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                        table.append(row)
                    }
                }

            }
            $('#end-store').html(end_count)
            if(myList.length > 0){
                if (myList[0].ags_id != "") {
                    $('#start-store').html(myList[0].ags_id)
                    $('#total-store').html(result.store.length)
                } else {
                    $('#start-store').html(0)
                    $('#total-store').html(0)
                }
            }
            pageButtons(data.pages)

            if (myList.length == 0) {
                var table = $('#table-body-store')
                var row = '<tr>' +
                    '<td class="text-center" colspan="4" style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td>' +
                    '</tr>'
                table.append(row)
                end_count = 0
                $('#end-store').html(end_count)
                $('#start-store').html(0)
                $('#total-store').html(result.store.length)
                pageButtons(data.pages)
            }
        }
        $('input:checkbox[name="status"]').on('click', function(){
            if($(this).prop('checked')){
                $.post('/agent_store/update'+$(this).attr('data-value'),{value: "@lltr@@gentUp@teSt@tusStore", status: 1}).done(function(result){
                    window.location.replace = '/agent_store/';
                })
            }else{
                $.post('/agent_store/update'+$(this).attr('data-value'),{value: "@lltr@@gentUp@teSt@tusStore", status: 0}).done(function(result){
                    window.location.replace = '/agent_store/';
                })
            }
        })
    })
}
else if(document.getElementById('a_detail')){
    /*$('li#li_agent').addClass("selected")
    $('a#a_agent').addClass("active")
    $('ul#ui_agent').addClass("in")
    $('li#li_agent_manage').addClass("active")
    $('a#a_agent_manage').addClass("active")*/
    let count = 0;
    $('a#show-password').on('click', function(){
        $.post('/agent_manage/selectManage',{value: "@lltr@@gentSe1ectM@n@ge", id: $(this).attr('data-value')}).done(function(result){
            let obj = result.manage[0].config_detail.split("&")
            if (count == 0){
                $('span#password').text(obj[3])
                $('a#show-password').text('ปิดการมองเห็น')
                count+=1
            }else{
                let conv_passwd = ""
                for (i in obj[3]){
                    conv_passwd+="*"
                }
                $('span#password').text(conv_passwd)
                $('a#show-password').text('เปิดการมองเห็น')
                count = 0
            }
        })
    })
    function clipboard(e){
        let parent = e.parentNode.parentNode;
        let copyText = parent.getElementsByClassName('controller')[0];
        navigator.clipboard.writeText(copyText.value);
        parent.getElementsByTagName('span')[1].innerHTML = "Copied."
    }
    function outFunc(){
        document.getElementsByClassName('Tooltip').innerHTML = "Copy to clipboard"
    }
}
else if(document.getElementById('a_procedure')){
    /*$('li#li_agent').addClass("selected")
    $('a#a_agent').addClass("active")
    $('ul#ui_agent').addClass("in")
    $('li#li_agent_manage').addClass("active")
    $('a#a_agent_manage').addClass("active")*/
    function clipboard(e){
        let parent = e.parentNode.parentNode;
        let copyText = parent.getElementsByClassName('controller')[0].value;
        const unsecuredCopyToClipboard = (text) => { 
            const textArea = document.createElement("textarea"); 
            textArea.value=text; document.body.appendChild(textArea); 
            textArea.focus();textArea.select(); 
            try{ document.execCommand('copy')}
            catch(err){ console.error('Unable to copy to clipboard',err) }
            document.body.removeChild(textArea)
        };
        const copyToClipboard = (content) => {
            if (window.isSecureContext && navigator.clipboard) {
                navigator.clipboard.writeText(content);
                parent.getElementsByTagName('span')[0].innerHTML = "Copied."
            } else {
                unsecuredCopyToClipboard(content);
            }
        };
        copyToClipboard(copyText)
    }
    function outFunc(){
        document.getElementsByClassName('Tooltip').innerHTML = "Copy to clipboard"
    }
}
else if(document.getElementById('a_procedure1')){
    /*$('li#li_agent').addClass("selected")
    $('a#a_agent').addClass("active")
    $('ul#ui_agent').addClass("in")
    $('li#li_agent_manage').addClass("active")
    $('a#a_agent_manage').addClass("active")*/
    function clipboard(e){
        let parent = e.parentNode.parentNode;
        let copyText = parent.getElementsByClassName('controller')[0].value;
        const unsecuredCopyToClipboard = (text) => { 
            const textArea = document.createElement("textarea"); 
            textArea.value=text; document.body.appendChild(textArea); 
            textArea.focus();textArea.select(); 
            try{ document.execCommand('copy')}
            catch(err){ console.error('Unable to copy to clipboard',err) }
            document.body.removeChild(textArea)
        };
        const copyToClipboard = (content) => {
            if (window.isSecureContext && navigator.clipboard) {
                navigator.clipboard.writeText(content);
                parent.getElementsByTagName('span')[0].innerHTML = "Copied."
            } else {
                unsecuredCopyToClipboard(content);
            }
        };
        copyToClipboard(copyText)
    }
    function outFunc(){
        document.getElementsByClassName('Tooltip').innerHTML = "Copy to clipboard"
    }
}
else if (document.getElementById('a_edit')) { 
    /*$('li#li_agent').addClass("selected")
    $('a#a_agent').addClass("active")
    $('ul#ui_agent').addClass("in")
    $('li#li_agent_manage').addClass("active")
    $('a#a_agent_manage').addClass("active")*/
    // ======================= Edit =============================
    $('input[name="agm_name"]#name-agent').on('keypress keyup keydown', function(e){
        if(e.which == 13 || e.which == 44){
            return false;
        }
    })
    $.post('/agent_manage/selectManage',{value: "@lltr@@gentSe1ectM@n@ge", id: $('div#a_edit').attr('data-value')}).done(function(res){
        if($('span#select-agent').attr('data-value')){
            $.post('/agent_manage/selectStore',{value: "@lltr@@gentSe1ectStore", id: $('span#select-agent').attr('data-value')}).done(function(result){
                if (result[0].hide == 0 && result[0].status == 1){ $('span#name').text("("+result[0].name+")")
                    $('table#head-agent').css('display', 'block');
                    $('div#content-agent').html(`
                    <textarea class="form-control text-center" rows="7" style="resize: none;" readonly>

                                                รหัสของ Aegnt: ${result[0].code}
ประเภทของ Agent: ${result[0].type}
                                                จำนวนที่สามารถใช้งานของ Agent: ${result[0]._limit_}
                                                คำอธิบายของ Agent: 
                                                ${result[0].description}
                                            </textarea>
                        `)
                }
                let old_value = res.manage[0].config_detail
                let regex = [".log", ".evtx", ".csv", ".xls", ".xlsx"]
                let checked = ["", "", ""]
                let hash_name = ""
                if(res.manage[0].hash_type == -1){
                    checked[0] = "checked"
                    hash_name = "MD5"
                }else if(res.manage[0].hash_type == 0){
                    checked[1] = "checked"
                    hash_name = "SHA-1"
                }else if(res.manage[0].hash_type == 1){
                    checked[2] = "checked"
                    hash_name = "SHA-256"
                }
                if (result[0].code == "AG1" ){
                    $('div#detail-config').html(`
                    <table class="table table-boardless">
                        <th width="12%" style="text-align: left; font-weight: bold;"> รายการตั้งค่า ${result[0].name} เพื่อนำไปใช้งาน </th>
                    </table>
                    <table class="table table-boardless">
                                <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> ชนิดของ Hash </th>
                                <td style="text-align: left;">
                                    <span style="color: red;">${hash_name}</span>
                                </td>
                            </table>
                            <table class="table table-boardless">
                                <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> 
                                    ระบุที่อยู่ไฟล์จราจร
                                </th>
                                <td style="tet-align: left;">
                                    <div class="input-group">
                                        <input type="text" name="path" placeholder="กรุณาป้อนที่อยู่..." class="form-control" />
                                        <button id="add-path" type="button" class="btn btn-outline-success"><i class="mdi mdi-plus-circle-outline" style="font-size: 15px;"></i></button>
                                    </div>
                                    <div style="margin-top:1%; text-align: left;">
                                        <u>ตัวอย่างเช่น</u>: ./work/ หรือ /home/user/work/ หรือ C:\\Users\\Admin\\Log\\
                                    </div>
                                    <input type="text" name="total_path" value="${old_value}," readonly hidden/>
                                    <div id="show-tags-path" style="text-align: left; margin-top:1%;">
                                    </div>
                                </td>
                            </table>
                        `)
                    if ($("input[name='total_path']").val()){
                        $('div#show-tags-path').empty()
                        let total = $('input[name="total_path"]').val().split(",")
                        total = total.filter(i => i)
                        for ( i in total ){
                            $('div#show-tags-path').append(`
                                            <button type="button" id="del-tags" class="btn btn-light-success text-success px-4 rounded-pill font-weight-medium" data-value="${total[i]}">
                                                ${total[i]} 
                                            </button>
                                    `)
                        }
                    }else{
                        $('div#show-tags-path').html(`
                                    <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                `)
                    }
                    $('button:button#add-path').on('click', function(){
                        if($('input[name="path"]').val()){
                            $('input[name="total_path"]').val($('input[name="total_path"]').val()+$('input[name="path"]').val()+",")
                            $('input[name="path"]').val("");
                        }else{
                            $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
                            $('button:button#alert-table.swal2-cancel.swal2-styled').on('click', function(){
                                $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                            })
                        }
                        if ($("input[name='total_path']").val()){
                            $('div#show-tags-path').empty()
                            let total = $('input[name="total_path"]').val().split(",")
                            total = total.filter(i => i)
                            for ( i in total ){
                                $('div#show-tags-path').append(`
                                            <button type="button" id="del-tags" class="btn btn-light-success text-success px-4 rounded-pill font-weight-medium" data-value="${total[i]}">
                                                ${total[i]} 
                                            </button>
                                    `)
                            }
                        }else{
                            $('div#show-tags-path').html(`
                                    <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                `)
                        }
                        $('button#del-tags').on('click', function(){
                            let value = $(this).attr('data-value')
                            let total = $('input[name="total_path"]').val().split(",")
                            total.pop()
                            total = total.filter(i => i != value && i !== "")
                            $('input[name="total_path"]').val(total+",")
                            if (total.length > 0){
                                for ( i=0;i < $('div#show-tags-path').children().length;i++){
                                    if ($('div#show-tags-path').children()[i].getAttribute('data-value') == value){
                                        $('div#show-tags-path').children()[i].remove()
                                    }
                                }
                            }else{
                                $('div#show-tags-path').html(`
                                        <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                    `)
                            }
                        })
                    })
                    $('button#del-tags').on('click', function(){
                        let value = $(this).attr('data-value')
                        let total = $('input[name="total_path"]').val().split(",")
                        total.pop()
                        total = total.filter(i => i != value && i !== "")
                        $('input[name="total_path"]').val(total+",")
                        if (total.length > 0){
                            for ( i=0;i < $('div#show-tags-path').children().length;i++){
                                if ($('div#show-tags-path').children()[i].getAttribute('data-value') == value){
                                    $('div#show-tags-path').children()[i].remove()
                                }
                            }
                        }else{
                            $('div#show-tags-path').html(`
                                        <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                    `)
                        }
                    })
                }
                else if (result[0].code == "AG2"){
                    old_value =  old_value.split(",")
                    let check = ["","",""]
                    if(old_value.length == 1 && regex.indexOf(old_value[0].substring(old_value[0].length - 4)) !== -1){
                        check[0] = "checked"
                    }else{
                        if(findLogic(old_value).indexOf(true) !== -1){
                            check[1] = "checked"
                        }else{
                            check[2] = "checked"
                        }
                    }
                    $('div#detail-config').html(`
                            <table class="table table-boardless">
                                <th width="12%" style="text-align: left; font-weight: bold;"> รายการตั้งค่า ${result[0].name} เพื่อนำไปใช้งาน </th>
                            </table>
                            <table class="table table-boardless">
                                <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> 
                                    เลือกรูปแบบที่ต้องการ
                                </th>
                                <td style="tet-align: left;">
                                    <div class="row">
                                        <div class="col-md-2">
                                            <div class="form-check form-check-inline">
                                                <input type="radio" name="type_of_path" id="type1" value="-1" class="form-check-input" ${check[0]} required/>
                                                <label for="type1" class="form-check-label"> เฉพาะไฟล์ๆเดียว </label>
                                                <div class="invalid-feedback">
                                                    กรุณาเลือก!!!
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-check form-check-inline">
                                                <input type="radio" name="type_of_path" id="type2" value="0" class="form-check-input" ${check[1]} required/>
                                                <label for="type2" class="form-check-label"> เฉพาะสกุลไฟล์ที่เลือก </label>
                                                <div class="invalid-feedback">
                                                    กรุณาเลือก!!!
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-2">
                                            <div class="form-check form-check-inline">
                                                <input type="radio" name="type_of_path" id="type3" value="1" class="form-check-input" ${check[2]} required/>
                                                <label for="type3" class="form-check-label"> ไฟล์ทั้งหมดในที่อยู่ </label>
                                                <div class="invalid-feedback">
                                                    กรุณาเลือก!!!
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </table>
                            <div id="subject-content"></div>
                        `)
                    if($('input:radio:checked').val()){
                        if($('input:radio:checked').val() == -1){
                            let subject = old_value[0].split('.')
                            if(subject.length > 2){
                                subject.shift()
                                subject[0] = "."+subject[0]
                                subject[1] = "."+subject[1]
                            }else{
                                subject[1] = "."+subject[1]
                            }
                            let select = ["", "", "", ""]
                            if (regex.indexOf(subject[1]) == 0){
                                select[0] = "selected"
                            }else if(regex.indexOf(subject[1]) == 1){
                                select[1] = "selected"
                            }else if(regex.indexOf(subject[1]) == 2){
                                select[2] = "selected"
                            }else if(regex.indexOf(subject[1]) == 3){
                                select[3] = "selected"
                            }else if(regex.indexOf(subject[1]) == 4){
                                select[4] = "selected"
                            }
                            $('div#subject-content').html(`
                                    <table class="table table-boardless">
                                        <th style="text-align: left; font-weight: bold; width: 12%;"> เลือกชนิดของไฟล์ </th>
                                        <td style="text-align: left;">
                                            <select name="extension" class="form-control" required>
                                                <option value disabled selected> กรุณาเลือก </option>
                                                <option value=".log" ${select[0]}> log </option>
                                                <option value=".evtx" ${select[1]}> log (Windows) </option>
                                                <option value=".csv" ${select[2]}> csv </option>
                                                <option value=".xls" ${select[3]}> xls </option>
                                                <option value=".xlsx" ${select[4]}> xlsx </option>
                                            </select>
                                            <div class="invalid-feedback">
                                                กรุณาเลือกชนิดของไฟล์!!!
                                            </div>
                                        </td>
                                    </table>
                                    <table class="table table-boardless">
                                        <th style="text-align: left; font-weight: bold; width: 12%;"> ระบุที่อยู่ไฟล์พร้อมชื่อไฟล์ </th>
                                        <td style="text-align: left;">
                                            <div class="form-group">
                                                <input type="text" name="total_path" value="${subject[0]}" placeholder="กรุณาป้อนที่อยู่และชื่อไฟล์..." class="form-control" required/>
                                                <div class="invalid-feedback">
                                                    กรุณาป้อนที่อยู่พร้อมชื่อไฟล์!!!
                                                </div>
                                                <br/>
                                                <span> <u>ตัวอย่างเช่น</u>: ./work1/file หรือ /home/user/work1/file หรือ C:\\Users\\Admin\\Log\\file </span>
                                            </div>
                                        </td>
                                    </table>
                                `)
                        }else if($('input:radio:checked').val() == 0){
                            let subject = []
                            old_value.forEach(function(i, d){
                                if(parseInt(d)+1 == old_value.length){
                                    subject.push(i.split("*"))
                                }else{
                                    subject.push(i.split("*")[0])
                                }
                            })
                            subject = subject.concat(subject[subject.length - 1])
                            subject = subject.filter(i => typeof i === "string")
                            let type = subject.pop()
                            let select = ["", "", "", ""]
                            if(regex.indexOf(type) == 0){
                                select[0] = "selected"
                            }else if(regex.indexOf(type) == 1){
                                select[1] = "selected"
                            }else if(regex.indexOf(type) == 2){
                                select[2] = "selected"
                            }else if(regex.indexOf(type) == 3){
                                select[3] = "selected"
                            }else if(regex.indexOf(type) == 4){
                                select[4] = "selected"
                            }
                            $('div#subject-content').html(`
                        <table class="table table-boardless">
                            <th style="text-align: left; font-weight: bold; width: 12%;"> เลือกชนิดของไฟล์ </th>
                            <td style="text-align: left;">
                                <select name="extension" class="form-control" required>
                                    <option value disabled selected> กรุณาเลือก </option>
                                    <option value=".log" ${select[0]}> log </option>
                                    <option value=".evtx" ${select[1]}> log (Windows) </option>
                                    <option value=".csv" ${select[2]}> csv </option>
                                    <option value=".xls" ${select[3]}> xls </option>
                                    <option value=".xlsx" ${select[4]}> xlsx </option>
                                </select>
                                            <div class="invalid-feedback">
                                                กรุณาเลือกชนิดของไฟล์!!!
                                            </div>
                                        </td>
                                    </table>
                                    <table class="table table-boardless">
                                        <th style="text-align: left; font-weight: bold; width: 12%;"> ระบุที่อยู่ไฟล์ </th>
                                        <td style="text-align: left;">
                                            <div class="input-group">
                                                <input type="text" name="path" placeholder="กรุณาป้อนที่อยู่และชื่อไฟล์..." class="form-control" />
                                                <button id="add-path" type="button" class="btn btn-outline-success"><i class="mdi mdi-plus-circle-outline" style="font-size: 15px;"></i></button>
                                            </div>
                                            <div style="margin-top:1%; text-align: left;">
                                                <u>ตัวอย่างเช่น</u>: ./work1/ หรือ /home/user/work1/ หรือ C:\\Users\\Admin\\Log\\
                                            </div>
                                            <input type="text" name="total_path" value="${subject}," readonly hidden/>
                                            <div id="show-tags-path" style="text-align: left; margin-top:1%;">
                                            </div>
                                        </td>
                                    </table>
                               `)
                            if($('input[name="total_path"]').val()){
                                $('div#show-tags-path').empty()
                                let total = $('input[name="total_path"]').val().split(",")
                                total = total.filter(i => i)
                                for ( i in total ){
                                    $('div#show-tags-path').append(`
                                            <button type="button" id="del-tags" class="btn btn-light-success text-success px-4 rounded-pill font-weight-medium" data-value="${total[i]}">
                                                ${total[i]} 
                                            </button>
                                            `)
                                }
                                $('button#del-tags').on('click', function(){
                                    let value = $(this).attr('data-value')
                                    let total = $('input[name="total_path"]').val().split(",")
                                    total.pop()
                                    total = total.filter(i => i != value && i !== "")
                                    $('input[name="total_path"]').val(total+",")
                                    if (total.length > 0){
                                        for ( i=0;i < $('div#show-tags-path').children().length;i++){
                                            if ($('div#show-tags-path').children()[i].getAttribute('data-value') == value){
                                                $('div#show-tags-path').children()[i].remove()
                                            }
                                        }
                                    }else{
                                        $('div#show-tags-path').html(`
                                                <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                            `)
                                    }
                                })
                                $('button:button#add-path').on('click', function(){
                                    if($('input[name="path"]').val()){
                                        $('input[name="total_path"]').val($('input[name="total_path"]').val()+$('input[name="path"]').val()+",")
                                        $('input[name="path"]').val("");
                                    }else{
                                        $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
                                        $('button:button#alert-table.swal2-cancel.swal2-styled').on('click', function(){
                                            $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                                        })
                                    }
                                    if ($("input[name='total_path']").val()){
                                        $('div#show-tags-path').empty()
                                        let total = $('input[name="total_path"]').val().split(",")
                                        total = total.filter(i => i)
                                        for ( i in total ){
                                            $('div#show-tags-path').append(`
                                            <button type="button" id="del-tags" class="btn btn-light-success text-success px-4 rounded-pill font-weight-medium" data-value="${total[i]}">
                                                ${total[i]} 
                                            </button>
                                            `)
                                        }
                                    }else{
                                        $('div#show-tags-path').html(`
                                                            <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                                            `)
                                    }
                                    $('button#del-tags').on('click', function(){
                                        let value = $(this).attr('data-value')
                                        let total = $('input[name="total_path"]').val().split(",")
                                        total.pop()
                                        total = total.filter(i => i != value && i !== "")
                                        $('input[name="total_path"]').val(total+",")
                                        if (total.length > 0){
                                            for ( i=0;i < $('div#show-tags-path').children().length;i++){
                                                if ($('div#show-tags-path').children()[i].getAttribute('data-value') == value){
                                                    $('div#show-tags-path').children()[i].remove()
                                                }
                                            }
                                        }else{
                                            $('div#show-tags-path').html(`
                                                <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                                            `)
                                        }
                                    })
                                })
                            }
                        }else if($('input:radio:checked').val() == 1){
                            $('div#subject-content').html(`
                                <table class="table table-boardless">
                                    <th width="12%" style="text-align: left; font-weight: bold;"> รายการตั้งค่า ${result[0].name} เพื่อนำไปใช้งาน </th>
                                </table>
                                <table class="table table-boardless">
                                    <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> 
                                        ระบุที่อยู่ไฟล์จราจร
                                    </th>
                                    <td style="tet-align: left;">
                                        <div class="input-group">
                                            <input type="text" name="path" placeholder="กรุณาป้อนที่อยู่..." class="form-control" />
                                            <button id="add-path" type="button" class="btn btn-outline-success"><i class="mdi mdi-plus-circle-outline" style="font-size: 15px;"></i></button>
                                            </div>
                                            <div style="margin-top:1%; text-align: left;">
                                                <u>ตัวอย่างเช่น</u>: ./work1/ หรือ /home/user/work1/ หรือ C:\\Users\\Admin\\Log\\
                                            </div>
                                            <input type="text" name="total_path" value="${old_value}," readonly hidden/>
                                            <div id="show-tags-path" style="text-align: left; margin-top:1%;">
                                            </div>
                                        </td>
                                    </table>
                                `)
                            if($('input[name="total_path"]').val()){
                                $('div#show-tags-path').empty()
                                let total = $('input[name="total_path"]').val().split(",")
                                total = total.filter(i => i)
                                for ( i in total ){
                                    $('div#show-tags-path').append(`
                                            <button type="button" id="del-tags" class="btn btn-light-success text-success px-4 rounded-pill font-weight-medium" data-value="${total[i]}">
                                                ${total[i]} 
                                            </button>
                                            `)
                                }
                                $('button#del-tags').on('click', function(){
                                    let value = $(this).attr('data-value')
                                    let total = $('input[name="total_path"]').val().split(",")
                                    total.pop()
                                    total = total.filter(i => i != value && i !== "")
                                    $('input[name="total_path"]').val(total+",")
                                    if (total.length > 0){
                                        for ( i=0;i < $('div#show-tags-path').children().length;i++){
                                            if ($('div#show-tags-path').children()[i].getAttribute('data-value') == value){
                                                $('div#show-tags-path').children()[i].remove()
                                            }
                                        }
                                    }else{
                                        $('div#show-tags-path').html(`
                                                <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                            `)
                                    }
                                })
                                $('button:button#add-path').on('click', function(){
                                    if($('input[name="path"]').val()){
                                        $('input[name="total_path"]').val($('input[name="total_path"]').val()+$('input[name="path"]').val()+",")
                                        $('input[name="path"]').val("");
                                    }else{
                                        $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
                                        $('button:button#alert-table.swal2-cancel.swal2-styled').on('click', function(){
                                            $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                                        })
                                    }
                                    if ($("input[name='total_path']").val()){
                                        $('div#show-tags-path').empty()
                                        let total = $('input[name="total_path"]').val().split(",")
                                        total = total.filter(i => i)
                                        for ( i in total ){
                                            $('div#show-tags-path').append(`
                                            <button type="button" id="del-tags" class="btn btn-light-success text-success px-4 rounded-pill font-weight-medium" data-value="${total[i]}">
                                                ${total[i]} 
                                            </button>
                                            `)
                                        }
                                    }else{
                                        $('div#show-tags-path').html(`
                                                                        <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                                                        `)
                                    }
                                    $('button#del-tags').on('click', function(){
                                        let value = $(this).attr('data-value')
                                        let total = $('input[name="total_path"]').val().split(",")
                                        total.pop()
                                        total = total.filter(i => i != value && i !== "")
                                        $('input[name="total_path"]').val(total+",")
                                        if (total.length > 0){
                                            for ( i=0;i < $('div#show-tags-path').children().length;i++){
                                                if ($('div#show-tags-path').children()[i].getAttribute('data-value') == value){
                                                    $('div#show-tags-path').children()[i].remove()
                                                }
                                            }
                                        }else{
                                            $('div#show-tags-path').html(`
                                                <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                                                    `)
                                        }
                                    })
                                })
                            }
                        }
                    }
                    $('input:radio').on('click', function(){
                        if($(this).val() == -1){
                            $('div#subject-content').html(`
                            <table class="table table-boardless">
                                        <th style="text-align: left; font-weight: bold; width: 12%;"> เลือกชนิดของไฟล์ </th>
                                        <td style="text-align: left;">
                                            <select name="extension" class="form-control" required>
                                                <option value disabled selected> กรุณาเลือก </option>
                                                <option value=".log"> log </option>
                                                <option value=".csv"> csv </option>
                                                <option value=".xls"> xls </option>
                                                <option value=".xlsx"> xlsx </option>
                                            </select>
                                            <div class="invalid-feedback">
                                                กรุณาเลือกชนิดของไฟล์!!!
                                            </div>
                                        </td>
                                    </table>
                                    <table class="table table-boardless">
                                        <th style="text-align: left; font-weight: bold; width: 12%;"> ระบุที่อยู่ไฟล์พร้อมชื่อไฟล์ </th>
                                        <td style="text-align: left;">
                                            <div class="form-group">
                                                <input type="text" name="total_path" placeholder="กรุณาป้อนที่อยู่และชื่อไฟล์..." class="form-control" required/>
                                                <div class="invalid-feedback">
                                                    กรุณาป้อนที่อยู่พร้อมชื่อไฟล์!!!
                                                </div>
                                                <br/>
                                                <span> <u>ตัวอย่างเช่น</u>: ./work1/file หรือ /home/user/work1/file </span>
                                            </div>
                                        </td>
                                    </table>
                                `)
                            $('div#show-tags-path').html(`
                                                                    <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                                                        `)
                        }else if($(this).val() == 0){
                            $('div#subject-content').html(`
                                <table class="table table-boardless">
                                    <th style="text-align: left; font-weight: bold; width: 12%;"> เลือกชนิดของไฟล์ </th>
                                    <td style="text-align: left;">
                                        <select name="extension" class="form-control" required>
                                            <option value disabled selected> กรุณาเลือก </option>
                                            <option value=".log"> log </option>
                                            <option value=".csv"> csv </option>
                                            <option value=".xls"> xls </option>
                                            <option value=".xlsx"> xlsx </option>
                                        </select>
                                        <div class="invalid-feedback">
                                            กรุณาเลือกชนิดของไฟล์!!!
                                        </div>
                                    </td>
                                </table>
                                <table class="table table-boardless">
                                        <th style="text-align: left; font-weight: bold; width: 12%;"> ระบุที่อยู่ไฟล์ </th>
                                        <td style="text-align: left;">
                                            <div class="input-group">
                                                <input type="text" name="path" placeholder="กรุณาป้อนที่อยู่และชื่อไฟล์..." class="form-control" />
                                                <button id="add-path" type="button" class="btn btn-outline-success"><i class="mdi mdi-plus-circle-outline" style="font-size: 15px;"></i></button>
                                            </div>
                                            <div style="margin-top:1%; text-align: left;">
                                                <u>ตัวอย่างเช่น</u>: ./work1/ หรือ /home/user/work1/
                                            </div>
                                            <input type="text" name="total_path" readonly hidden/>
                                            <div id="show-tags-path" style="text-align: left; margin-top:1%;">
                                            </div>
                                        </td>
                                    </table>
                               `)
                            $('div#show-tags-path').html(`
                                    <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                `)
                            $('button:button#add-path').on('click', function(){
                                if($('input[name="path"]').val()){
                                    $('input[name="total_path"]').val($('input[name="total_path"]').val()+$('input[name="path"]').val()+",")
                                    $('input[name="path"]').val("");
                                }else{
                                    $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
                                    $('button:button#alert-table.swal2-cancel.swal2-styled').on('click', function(){
                                        $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                                    })
                                }
                                if ($("input[name='total_path']").val()){
                                    $('div#show-tags-path').empty()
                                    let total = $('input[name="total_path"]').val().split(",")
                                    total = total.filter(i => i)
                                    for ( i in total ){
                                        $('div#show-tags-path').append(`
                                            <button type="button" id="del-tags" class="btn btn-light-success text-success px-4 rounded-pill font-weight-medium" data-value="${total[i]}">
                                                ${total[i]} 
                                            </button>
                                            `)
                                    }
                                }else{
                                    $('div#show-tags-path').html(`
                                                        <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                                            `)
                                }
                                $('button#del-tags').on('click', function(){
                                    let value = $(this).attr('data-value')
                                    let total = $('input[name="total_path"]').val().split(",")
                                    total.pop()
                                    total = total.filter(i => i != value && i !== "")
                                    $('input[name="total_path"]').val(total+",")
                                    if (total.length > 0){
                                        for ( i=0;i < $('div#show-tags-path').children().length;i++){
                                            if ($('div#show-tags-path').children()[i].getAttribute('data-value') == value){
                                                $('div#show-tags-path').children()[i].remove()
                                            }
                                        }
                                    }else{
                                        $('div#show-tags-path').html(`
                                        <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                                            `)
                                    }
                                })
                            })
                        }else if($(this).val() == 1){
                            $('div#subject-content').html(`
                            <table class="table table-boardless">
                                <th width="12%" style="text-align: left; font-weight: bold;"> รายการตั้งค่า ${result[0].name} เพื่อนำไปใช้งาน </th>
                            </table>
                            <table class="table table-boardless">
                                <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> 
                                    ระบุที่อยู่ไฟล์จราจร
                                        </th>
                                        <td style="tet-align: left;">
                                            <div class="input-group">
                                                <input type="text" name="path" placeholder="กรุณาป้อนที่อยู่..." class="form-control" />
                                                <button id="add-path" type="button" class="btn btn-outline-success"><i class="mdi mdi-plus-circle-outline" style="font-size: 15px;"></i></button>
                                            </div>
                                            <div style="margin-top:1%; text-align: left;">
                                                <u>ตัวอย่างเช่น</u>: ./work1/ หรือ /home/user/work1/
                                            </div>
                                            <input type="text" name="total_path" readonly hidden/>
                                            <div id="show-tags-path" style="text-align: left; margin-top:1%;">
                                            </div>
                                        </td>
                                    </table>
                                `)
                            $('div#show-tags-path').html(`
                                    <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                `)
                            $('button:button#add-path').on('click', function(){
                                if($('input[name="path"]').val()){
                                    $('input[name="total_path"]').val($('input[name="total_path"]').val()+$('input[name="path"]').val()+",")
                                    $('input[name="path"]').val("");
                                }else{
                                    $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
                                    $('button:button#alert-table.swal2-cancel.swal2-styled').on('click', function(){
                                        $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                                    })
                                }
                                if ($("input[name='total_path']").val()){
                                    $('div#show-tags-path').empty()
                                    let total = $('input[name="total_path"]').val().split(",")
                                    total = total.filter(i => i)
                                    for ( i in total ){
                                        $('div#show-tags-path').append(`
                                            <button type="button" id="del-tags" class="btn btn-light-success text-success px-4 rounded-pill font-weight-medium" data-value="${total[i]}">
                                                ${total[i]} 
                                            </button>
                                            `)
                                    }
                                }else{
                                    $('div#show-tags-path').html(`
                                                                                <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                                                                `)
                                }
                                $('button#del-tags').on('click', function(){
                                    let value = $(this).attr('data-value')
                                    let total = $('input[name="total_path"]').val().split(",")
                                    total.pop()
                                    total = total.filter(i => i != value && i !== "")
                                    $('input[name="total_path"]').val(total+",")
                                    if (total.length > 0){
                                        for ( i=0;i < $('div#show-tags-path').children().length;i++){
                                            if ($('div#show-tags-path').children()[i].getAttribute('data-value') == value){
                                                $('div#show-tags-path').children()[i].remove()
                                            }
                                        }
                                    }else{
                                        $('div#show-tags-path').html(`
                                            <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                                                                `)
                                    }
                                })
                            })
                        }
                    })
                }
                else if (result[0].code == "AG3"){
                    old_value = old_value.split("&")
                    let check = ["", ""]
                    if(old_value[0] == 0){
                        check[0] = "checked"
                    }else if(old_value[0] == 1){
                        check[1] = "checked"
                    }
                    let table = ""
                    let column = []
                    for (i=5;i < old_value.length; i++){
                        if(parseInt(i)+1 == old_value.length){
                            table += old_value[i].split(":")[0]
                            column.push(old_value[i].split(":")[1])
                        }else{
                            table += old_value[i].split(":")[0]+","
                            column.push(old_value[i].split(":")[1])
                        }
                    }
                    let report = ""
                    if (result[0].report_db == 1){
                        report = "<span style='font-size: 20px; color: green; vertical-align: middle;'> <i class='mdi mdi-check'></i> </span>"
                    }else{
                        report = "<span style='font-size: 20px; color: red; vertical-align: middle;'> <i class='mdi mdi-close'></i> </span>"
                    }
                    $('div#detail-config').html(`
                        <table class="table table-boardless">
                            <th width="15%" style="text-align: left; font-weight: bold;"> รายการตั้งค่า ${result[0].name} เพื่อนำไปใช้งาน </th>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> เลือก Service Database ที่คุณใช้ </th>
                            <td style="text-align: left;">
                                <div class="row">
                                    <div class="col-md-2">
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" name="service_database" id="oracle" value="0" ${check[0]} required/>
                                            <label class="form-check-label" for="oracle"> Oracle DB </label>
                                            <div class="invalid-feedback">
                                                กรุณาเลือก!!!
                                            </div>
                                        </div>
                                    </div>
                                   <div class="col-md-2">
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="service_database" id="mysql" value="1" ${check[1]} required/>
                                        <label class="form-check-label" for="mysql"> MySQL </label>
                                        <div class="invalid-feedback">
                                                กรุณาเลือก!!!
                                        </div>
                                    </div>
                                </div> 
                                </div>
                            </td>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> IP หรือ Host ของ service database </th>
                            <td style="text-align: left;">
                                <input type="text" name="host" value="${old_value[1]}" placeholder="กรุณาป้อนIP..." class="form-control" required/>
                                <div class="invalid-feedback">
                                    กรุณาป้อน IP หรือ Host ของ service database!!!
                                </div>
                            </td>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> Username ของ service database </th>
                            <td style="text-align: left;">
                                <input type="text" name="username" value="${old_value[2]}" placeholder="กรุณาป้อนUser..." class="form-control" required/>
                                <div class="invalid-feedback">
                                    กรุณาป้อน Username ของ service database!!!
                                </div>
                            </td>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> Password ของ service database </th>
                            <td style="text-align: left;">
                                <input type="password" name="password" value="${old_value[3]}" placeholder="กรุณาป้อนPass..." class="form-control" required/>
                                <div class="invalid-feedback">
                                    กรุณาป้อน Password ของ service database!!!
                                </div>
                            </td>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> ชื่อของ Database ที่ต้องการของ </th>
                            <td style="text-align: left;">
                                <input type="text" name="database" value="${old_value[4]}" placeholder="กรุณาป้อนDatabase..." class="form-control" required/>
                                <div class="invalid-feedback">
                                    กรุณาป้อนชื่อของ Database ที่ต้องการ!!!
                                </div>
                            </td>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> ทดสอบการเชื่อมต่อ </th>
                            <td style="text-align: left;">
                                <button type="button" id="testDB" class="btn btn-info"> Test connect </button>
                            </td>
                        </table>
                        <table id="show-tables" class="table table-boardless" style="display: block;">
                            <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> Table ของ database ที่เลือก </th>
                            <td style="text-align: left;">
                                <div class="input-group">
                                    <input type="text" name="table" class="form-control" placeholder="กรุณาป้อนชื่อTable..." />
                                    <button id="add-table" type="button" class="form-input-group btn btn-outline-success" onClick="addTable(this)"><i class="mdi mdi-plus-circle-outline" style="font-size: 15px;"></i></button>
                                </div>
                                <input type="text" name="total_table" value="${table}" readonly hidden/>
                                <div id="subject-table" style="margin-top:1%">
                                    <span style="color: red;">ไม่มีข้อมูล, ทดสอบการเชื่อมต่อ หรือ เพิ่ม Table ขึ้นมา </span>
                                </div>
                            </td>
                        </table>
                        `)
                    if($('input[name="total_table"]').val()){
                        $('table#show-tables').css('display', 'block')
                        $('div#subject-table').empty()
                        let tables = table.split(",")
                        tables = tables.filter(i => i)
                        for(i in tables){
                            $('div#subject-table').append(`
                                <div class="accordion" id="database-check-${tables[i]}" style="margin-bottom:1%;">
                                    <div class="accordion-item" data-value="${tables[i]}">
                                        <h2 class="accordion-header" id="heading${tables[i]}">
                                            <button class="accordion-button collapsed" id="show-detail-${tables[i]}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${tables[i]}" aria-expanded="false" aria-controls="collapse${tables[i]}" data-value="${tables[i]}" data-index="${i}">
                                                ${tables[i]}
                                            </button>
                                        </h2>
                                        <div id="collapse${tables[i]}" class="accordion-collapse collapse" aria-labelledby="heading${tables[i]}" data-bs-parent="#database-check-${tables[i]}">
                                            <div class="accordion-body" id="content-column">
                                                <span style="color: red;"> *Column ID หรือ Column primary key จำเป็นต้องมีและควรอยู่อันแรกเสมอ* </span>
                                                <span style="float: right;">
                                                    <a href="javascript:void(0);" id="add-column-${tables[i]}" data-value="${tables[i]}" data-index="${i}" onClick="addColumn(this)"> เพิ่ม Column </a>
                                                    /
                                                    <a href="javascript:void(0);" id="del-table-${tables[i]}" data-value="${tables[i]}" data-index="${i}" onClick="delTable(this)">ลบ Table นี้ </a>
                                                </span>
                                                <table id="table-show-column-${tables[i]}" class="table table-boardless">
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `)
                            editAppendColumn(column[i].split(','), tables[i])
                        }
                    }
                    $('button:button#testDB').on('click', function(){
                        let host = $('input[name="host"]').val()
                        let user = $('input[name="username"]').val()
                        let pass = $('input[name="password"]').val()
                        let db = $('input[name="database"]').val()
                        let type = $('input[name="service_database"]:checked').val()
                        //let type = 0
                        if (host && user && pass && db){
                            $('div#inip').css('display', 'none')
                            $('input[name="host"]').css({
                                'border-color' : '', 
                                'padding-right' : '', 
                                'background-image': "", 
                                'background-repeat': '', 
                                'background-position': '',
                                'background-size': ''
                            })
                            $('div#inusername').css('display', 'none')
                            $('input[name="username"]').css({
                                'border-color' : '', 
                                'padding-right' : '', 
                                'background-image': "", 
                                'background-repeat': '', 
                                'background-position': '',
                                'background-size': ''
                            })
                            $('div#inpassword').css('display', 'none')
                            $('input[name="password"]').css({
                                'border-color' : '', 
                                'padding-right' : '', 
                                'background-image': "", 
                                'background-repeat': '', 
                                'background-position': '',
                                'background-size': ''
                            })
                            $('div#indatabase').css('display', 'none')
                            $('input[name="database"]').css({
                                'border-color' : '', 
                                'padding-right' : '', 
                                'background-image': "", 
                                'background-repeat': '', 
                                'background-position': '',
                                'background-size': ''
                            })
                            $.post('/agent_manage/connect/',{host:host,user:user,pass:pass,db:db,type:type}, "json").done(function(rs){
                                let fm = findMatchObject(rs, "err")
                                if(fm == true && type == 1){
                                    $('h2#alert-success.swal2-title').text("ไม่สามารถเชื่อมต่อได้...")
                                    $('div#alert-content-success.swal2-content').html(`
                                            CODE: ${rs.err.code}<br/>
                                            ERRNO: ${rs.err.errno}
                                        `)
                                    $('div#alert-warning-icon.swal2-icon.swal2-warning.swal2-animate-warning-icon').css('display', "flex")
                                    $('div#alert-success-icon.swal2-icon.swal2-success.swal2-animate-success-icon').css('display', "none")
                                    $('div#alert-success.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'flex');
                                    $('button#alert-success.swal2-confirm.swal2-styled').on('click', function(){
                                        $('div#alert-success.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'none');
                                    })
                                    $('input[name="host"]').val("")
                                    $('input[name="username"]').val("")
                                    $('input[name="password"]').val("")
                                    $('input[name="database"]').val("")
                                }else if(fm == true && type == 0){
                                    $('h2#alert-success.swal2-title').text("ไม่สามารถเชื่อมต่อได้...")
                                    $('div#alert-content-success.swal2-content').html(`
                                            ErrorNum: ${rs.err.errorNum}<br/>
                                            OffSet: ${rs.err.offset}
                                        `)
                                    $('div#alert-warning-icon.swal2-icon.swal2-warning.swal2-animate-warning-icon').css('display', "flex")
                                    $('div#alert-success-icon.swal2-icon.swal2-success.swal2-animate-success-icon').css('display', "none")
                                    $('div#alert-success.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'flex');
                                    $('button#alert-success.swal2-confirm.swal2-styled').on('click', function(){
                                        $('div#alert-success.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'none');
                                    })
                                    $('input[name="host"]').val("")
                                    $('input[name="username"]').val("")
                                    $('input[name="password"]').val("")
                                    $('input[name="database"]').val("")
                                }else if(fm == false && (type == 0 || type == 1)){
                                    $('h2#alert-success.swal2-title').text(rs.message)
                                    $('div#alert-content-success.swal2-content').empty()
                                    $('div#alert-warning-icon.swal2-icon.swal2-warning.swal2-animate-warning-icon').css('display', "none")
                                    $('div#alert-success-icon.swal2-icon.swal2-success.swal2-animate-success-icon').css('display', "flex")
                                    $('div#alert-success.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'flex');
                                    $('button#alert-success.swal2-confirm.swal2-styled').on('click', function(){
                                        $('div#alert-success.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'none');
                                    })
                                    $('table#show-tables').css('display', 'block')
                                    if(Object.keys(rs.result).length > 1){
                                        $('div#subject-table').empty()
                                        let tables = rs.result;
                                        for (const i in tables){
                                            $('input[name="total_table"]').val($('input[name="total_table"]').val()+i+",")
                                            $('div#subject-table').append(`
                                                <div class="accordion" id="database-check-${i}" style="margin-bottom:1%;">
                                                    <div class="accordion-item" data-value="${i}">
                                                        <h2 class="accordion-header" id="heading${i}">
                                                            <button class="accordion-button collapsed" id="show-detail-${i}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}" data-value="${i}">
                                                            ${i}
                                                            </button>
                                                        </h2>
                                                    <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}" data-bs-parent="#database-check-${i}">
                                                        <div class="accordion-body" id="content-column">
                                                            <span style="color: red;"> *Column ID หรือ Column primary key จำเป็นต้องมีและควรอยู่อันแรกเสมอ* </span>
                                                            <span style="float: right;">
                                                                <a href="javascript:void(0);" id="add-column-${i}" data-value="${i}" onClick="addColumn(this)"> เพิ่ม Column </a>
                                                                /
                                                                <a href="javascript:void(0);" id="del-table-${i}" data-value="${i}" onClick="delTable(this)">ลบ Table นี้ </a>
                                                            </span>
                                                                <table id="table-show-column-${i}" class="table table-boardless">
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                `)
                                            appendColumn(i, tables[i])
                                        }
                                    }else{
                                        $('div#subject-table').html(`<span style="color: red;">ไม่พบข้อมูลใน database.</span>`)
                                    }
                                }
                            })
                        }else {
                            if(host !== "" && user !== "" && pass !== "" && db === ""){ // #14
                                $('div#inip').css('display', 'none')
                                $('input[name="host"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inusername').css('display', 'none')
                                $('input[name="username"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inpassword').css('display', 'none')
                                $('input[name="password"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#indatabase').css('display', 'block')
                                $('input[name="database"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                            }else if(host !== "" && user !== "" && pass === "" && db !== ""){ // #13
                                $('div#inip').css('display', 'none')
                                $('input[name="host"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inusername').css('display', 'none')
                                $('input[name="username"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#indatabase').css('display', 'none')
                                $('input[name="database"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inpassword').css('display', 'block')
                                $('input[name="password"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                            }else if(host !== "" && user !== "" && pass !== "" && db !== ""){ // #12
                                $('div#inip').css('display', 'none')
                                $('input[name="host"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inusername').css('display', 'none')
                                $('input[name="username"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inpassword').css('display', 'block')
                                $('input[name="password"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#indatabase').css('display', 'block')
                                $('input[name="database"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                            }else if(host !== "" && user === "" && pass !== "" && db !== ""){ // #11
                                $('div#inip').css('display', 'none')
                                $('input[name="host"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inusername').css('display', 'block')
                                $('input[name="username"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inpassword').css('display', 'none')
                                $('input[name="password"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#indatabase').css('display', 'none')
                                $('input[name="database"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                            }else if(host !== "" && user === "" && pass !== "" && db === ""){ // #10
                                $('div#inip').css('display', 'none')
                                $('input[name="host"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inusername').css('display', 'block')
                                $('input[name="username"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inpassword').css('display', 'none')
                                $('input[name="password"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#indatabase').css('display', 'block')
                                $('input[name="database"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                            }else if(host !== "" && user === "" && pass === "" && db !== ""){ // #9
                                $('div#inip').css('display', 'none')
                                $('input[name="host"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inusername').css('display', 'block')
                                $('input[name="username"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inpassword').css('display', 'block')
                                $('input[name="password"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#indatabase').css('display', 'none')
                                $('input[name="database"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                            }else if(host !== "" && user === "" && pass === "" && db === ""){ // #8
                                $('div#inip').css('display', 'none')
                                $('input[name="host"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inusername').css('display', 'block')
                                $('input[name="username"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inpassword').css('display', 'block')
                                $('input[name="password"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#indatabase').css('display', 'block')
                                $('input[name="database"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                            }else if(host === "" && user !== "" && pass !== "" && db !== ""){ // #7
                                $('div#inip').css('display', 'block')
                                $('input[name="host"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inusername').css('display', 'none')
                                $('input[name="username"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inpassword').css('display', 'none')
                                $('input[name="password"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#indatabase').css('display', 'none')
                                $('input[name="database"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                            }else if(host === "" && user !== "" && pass !== "" && db === ""){ // #6
                                $('div#inip').css('display', 'block')
                                $('input[name="host"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inusername').css('display', 'none')
                                $('input[name="username"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inpassword').css('display', 'none')
                                $('input[name="password"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#indatabase').css('display', 'block')
                                $('input[name="database"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                            }else if(host === "" && user !== "" && pass === "" && db !== ""){ // #5
                                $('div#inip').css('display', 'block')
                                $('input[name="host"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inusername').css('display', 'none')
                                $('input[name="username"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inpassword').css('display', 'block')
                                $('input[name="password"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#indatabase').css('display', 'none')
                                $('input[name="database"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                            }else if(host === "" && user !== "" && pass === "" && db === ""){ // #4
                                $('div#inip').css('display', 'block')
                                $('input[name="host"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inusername').css('display', 'none')
                                $('input[name="username"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inpassword').css('display', 'block')
                                $('input[name="password"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#indatabase').css('display', 'block')
                                $('input[name="database"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                            }else if(host === "" && user === "" && pass !== "" && db !== ""){ // #3
                                $('div#inip').css('display', 'block')
                                $('input[name="host"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inusername').css('display', 'block')
                                $('input[name="username"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inpassword').css('display', 'none')
                                $('input[name="password"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#indatabase').css('display', 'none')
                                $('input[name="database"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                            }else if(host === "" && user === "" && pass !== "" && db === ""){ // #2
                                $('div#inip').css('display', 'block')
                                $('input[name="host"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inusername').css('display', 'block')
                                $('input[name="username"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inpassword').css('display', 'none')
                                $('input[name="password"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#indatabase').css('display', 'block')
                                $('input[name="database"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                            }else if(host === "" && user === "" && pass === "" && db !== ""){ // #1
                                $('div#inip').css('display', 'block')
                                $('input[name="host"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inusername').css('display', 'block')
                                $('input[name="username"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inpassword').css('display', 'block')
                                $('input[name="password"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#indatabase').css('display', 'none')
                                $('input[name="database"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                            }else if(host === "" && user === "" && pass === "" && db === ""){ // #0
                                $('div#inip').css('display', 'block')
                                $('input[name="host"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inusername').css('display', 'block')
                                $('input[name="username"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#inpassword').css('display', 'block')
                                $('input[name="password"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                                $('div#indatabase').css('display', 'block')
                                $('input[name="database"]').css({
                                    'border-color' : '#f62d51', 
                                    'padding-right' : 'calc(1.5em + .75rem)', 
                                    'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                    'background-repeat': 'no-repeat', 
                                    'background-position': 'right calc(.375em + .1875rem) center',
                                    'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                })
                            }else{ //#15
                                $('div#inip').css('display', 'none')
                                $('input[name="host"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inusername').css('display', 'none')
                                $('input[name="username"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inpassword').css('display', 'none')
                                $('input[name="password"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#indatabase').css('display', 'none')
                                $('input[name="database"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                            }
                        }
                    })
                    $(document).on({
                        ajaxStart: function(){
                            $("div#alert-loading").css('display', 'flex')
                        },
                        ajaxComplete: function(){
                            $("div#alert-loading").css('display', 'none')
                        }
                    })
                }
                else if (result[0].code == "AG4"){
                    old_value = old_value.split(",")
                    let check = ["", ""]
                    if (old_value[0] == 0){
                        check[0] = "checked"
                    }else if (old_value[0] == 1){
                        check[1] = "checked"
                    }
                    $('div#detail-config').html(`
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> รายการตั้งค่า ${result[0].name} เพื่อนำไปใช้งาน <span style="color: red;">ไม่รองรับ Windows </span></th>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> เลือกโหมดการใช้งาน </th>
                            <td style="text-align: left;">
                                <div class="row">
                                <div class="col-md-1">
                                <div class="form-check form-check-inline">
                                    <input type="radio" name="mode" value="0" id="mode" class="form-check-input" ${check[0]}/>
                                    <label class="form-check-label" for="mode"> FTP </label>
                                </div>
                                </div>
                                <div class="col-md-4">
                                <div class="form-check form-check-inline">
                                    <input type="radio" name="mode" value="1" id="mode" class="form-check-input" ${check[1]}/>
                                    <label class="form-check-label" for="mode"> Syslogs </label>
                                </div>
                                </div>
                                </div>
                            </td>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> ระบุที่อยู่ของไฟล์เพื่อจัดเก็บ </th>
                            <td style="text-align: left;">
                                <input type="text" name="path" value="${old_value[1]}" placeholder="กรุณาป้อนที่อยู่..." class="form-control" /><br/>
                                <u>ตัวอย่าง</u>: ./sniffer/ หรือ /home/user/sniffer/
                            </td>
                        </table>
                        <div id="subject-mode">
                        </div>
                        `)
                    if(document.getElementById('mode').checked && document.getElementById('mode').value === "0"){
                        $('div#subject-mode').html(`
                            <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> ระบุที่อยู่ของไฟล์เพื่อจัดเก็บ </th>
                            <td style="text-align: left;">
                                <input type="text" name="path" placeholder="กรุณาป้อนที่อยู่..." class="form-control" /><br/>
                                <u>ตัวอย่าง</u>: ./sniffer/ หรือ /home/user/sniffer/
                            </td>
                            </table>
                            `);
                    }else{
                        $('div#subject-mode').empty();
                    }
                }
                else{
                    $('div#detail-config').empty()
                }
            })
        }
    })
    function addTable(e){
        let parent = e.parentNode.parentNode;
        let new_value = $('input[name="table"]').val();
        if ( document.getElementById('subject-table').children[0].nodeName == "SPAN"){
            $('div#subject-table').empty();
            parent.querySelector("[name='total_table']").value += (new_value)+","
            $('div#subject-table').append(`
            <div class="accordion" id="database-check-${new_value}" style="margin-bottom:1%;">
                <div class="accordion-item" data-value="${new_value}">
                    <h2 class="accordion-header" id="heading${new_value}">
                        <button class="accordion-button collapsed" id="show-detail-${new_value}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${new_value}" aria-expanded="false" aria-controls="collapse${new_value}" data-value="${new_value}" data-index="${0}">
                            ${new_value}
                        </button>
                    </h2>
                    <div id="collapse${new_value}" class="accordion-collapse collapse" aria-labelledby="heading${new_value}" data-bs-parent="#database-check-${new_value}">
                        <div class="accordion-body" id="content-column">
                            <span style="color: red;"> *Column ID หรือ Column primary key จำเป็นต้องมีและควรอยู่อันแรกเสมอ* </span>
                            <span style="float: right;">
                                <a href="javascript:void(0);" id="add-column-${new_value}" data-value="${new_value}" data-index="${0}" onClick="addColumn(this)"> เพิ่ม Column </a>
                                    /
                                <a href="javascript:void(0);" id="del-table-${new_value}" data-value="${new_value}" data-index="${0}" onClick="delTable(this)">ลบ Table นี้ </a>
                            </span>
                            <table id="table-show-column-${new_value}" class="table table-boardless">
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            `)
            $('table#table-show-column-'+new_value).append(`
                                    <div id="div-column-${new_value}" class="input-group" style="margin-top: 1%;">
                                        <input type="text" name="column${new_value}[]" value="" class="form-control" placeholder="กรุณาป้อนชื่อColumn..." />
                                        <button data-value="${new_value}" data-index="${0}" type="button" class="btn btn-outline-danger" onClick="delColumn(this)"><i class="mdi mdi-close-circle-outline"></i></button>
                                    </div>
                                        `)
        }else{
            let index = $('div#subject-table').children().length;
            parent.querySelector("[name='total_table']").value += (new_value)+","
            $('div#subject-table').append(`
            <div class="accordion" id="database-check-${new_value}" style="margin-bottom:1%;">
                <div class="accordion-item" data-value="${new_value}">
                    <h2 class="accordion-header" id="heading${new_value}">
                        <button class="accordion-button collapsed" id="show-detail-${new_value}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${new_value}" aria-expanded="false" aria-controls="collapse${new_value}" data-value="${new_value}" data-index="${parseInt(index)}">
                            ${new_value}
                        </button>
                    </h2>
                    <div id="collapse${new_value}" class="accordion-collapse collapse" aria-labelledby="heading${new_value}" data-bs-parent="#database-check-${new_value}">
                        <div class="accordion-body" id="content-column">
                            <span style="color: red;"> *Column ID หรือ Column primary key จำเป็นต้องมีและควรอยู่อันแรกเสมอ* </span>
                            <span style="float: right;">
                                <a href="javascript:void(0);" id="add-column-${new_value}" data-value="${new_value}" data-index="${parseInt(index)}" onClick="addColumn(this)"> เพิ่ม Column </a>
                                /
                                            <a href="javascript:void(0);" id="del-table-${new_value}" data-value="${new_value}" data-index="${parseInt(index)}" onClick="delTable(this)">ลบ Table นี้ </a>
                            </span>
                            <table id="table-show-column-${new_value}" class="table table-boardless">

                            </table>
                        </div>
                    </div>
                </div>
            </div>
            `)
            $('table#table-show-column-'+new_value).append(`
                <div id="div-column-${new_value}" class="input-group" style="margin-top: 1%;">
                    <input type="text" name="column${new_value}[]" value="" class="form-control" placeholder="กรุณาป้อนชื่อColumn..."/>
                    <button data-value="${new_value}" data-index="${parseInt(index)}" type="button" class="btn btn-outline-danger" onClick="delColumn(this)"><i class="mdi mdi-close-circle-outline"></i></button>
                </div>
            `)
        }
        $('input[name="table"]').val("")
    }
    function addColumn(e){
        let value = e.getAttribute('data-value')
        let new_node = `<div id="div-column-${value}" class="input-group" style="margin-top: 1%;">
                            <input type="text" name="column${value}[]" placeholder="กรุณาป้อนชื่อColumn..." class="form-control" />
                        <button data-value="${value}" data-index="${value}" type="button" class="btn btn-outline-danger" onClick="delColumn(this)"><i class="mdi mdi-close-circle-outline"></i></button>
                        </div>`
        if($(`input[name="column${value}[]"]`).val()){
            let old_value = ($(`input[name="column${value}[]"]`).map(function(){ return $(this).val(); }).get())
            let tags = document.getElementById(`database-check-${value}`).querySelector(`table#table-show-column-${value}`).children
            document.getElementById(`database-check-${value}`).querySelector(`table#table-show-column-${value}`).innerHTML += new_node;
            for (i=0;i < tags.length-1; i++){
                tags[i].getElementsByTagName('input')[0].value = old_value[i]
            }
        }else{
            document.getElementById(`database-check-${value}`).querySelector(`table#table-show-column-${value}`).innerHTML += new_node;
        }
    }
    function delColumn(e){
        let parent = e.parentNode;
        let value = e.getAttribute('data-value')
        if($(`table#table-show-column-${value}`).children().length > 1){
            if(parent.getElementsByTagName('input')[0].value){
                $('div#alert-confirm-column.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
                $('span#column-name-modal').text(parent.getElementsByTagName('input')[0].value)
                $('button#alert-confirm-column-yes.swal2-confirm.swal2-styled.btn.btn-danger').on('click', function(){
                    parent.remove()
                    $('div#alert-confirm-column.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                })
                $('button#alert-confirm-column-no.swal2-cancel.swal2-styled.btn.btn-secondary').on('click', function(){
                    $('div#alert-confirm-column.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                })
            }else{
                parent.remove()
            }
        }else{
            $('div#alert-column.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
            $('button#alert-column.swal2-cancel.swal2-styled').on('click', function(){
                $('div#alert-column.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'none')
            })
        }
    }
    function delTable(e){
        let parent = e.parentNode.parentNode;
        let value = e.getAttribute('data-value')
        let old = parent.querySelector(`#table-show-column-${value}`).children
        let total = $('input[name="total_table"]').val().split(",")
        total = total.filter(i => i !== "")
        let logic = false
        for ( i=0; i < old.length; i++ ){
            if (old[i].getElementsByTagName('input')[0]){
                logic = true;
                break
            }
        }
        if (total.length > 0 && logic == true){
            $('span#table-name').text(value)
            $('div#alert-confirm.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
            $('button#alert-confirm-yes').on('click', function(){
                total = total.filter(i => i != value && i !== "")
                $('input[name="total_table"]').val(total.join(",")+",")
                parent.parentNode.parentNode.parentNode.remove()
                $('div#alert-confirm.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                if(document.getElementById('subject-table').children.length == 0){
                    $('div#subject-table').html(`<span style="color: red;">ไม่พบข้อมูล กรุณา Test connect ใหม่อีกครั้ง. </span>`)
                }
            })
            $('button#alert-confirm-no').on('click', function(){
                $('div#alert-confirm.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
            })
        }
        else if (total.length > 0 && logic == false){
            total = total.filter(i => i != value && i !== "")
            $('input[name="total_table"]').val(total.join(",")+",")
            document.getElementById('subject-table').querySelector(`#database-check-${value}`).remove()
        }
        else if (total.length == 0 && logic == true){
            $('span#table-name').text(value)
            $('div#alert-confirm.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
            $('button#alert-confirm-yes').on('click', function(){
                total = total.filter(i => i != value && i !== "")
                $('input[name="total_table"]').val(total.join(",")+",")
                document.getElementById('subject-table').innerHTML = `<span style="color: red;">ไม่พบข้อมูล กรุณา Test connect ใหม่อีกครั้ง. </span>`
                $('div#alert-confirm.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                if($('div#subject-table').children().length == 0){
                    $('div#subject-table').html(`<span style="color: red;">ไม่พบข้อมูล กรุณา Test connect ใหม่อีกครั้ง. </span>`)
                }
            })
            $('button#alert-confirm-no').on('click', function(){
                $('iv#alert-confirm.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
            })
        }
        else if (total.length == 0 && logic == false){
            total = total.filter(i => i != value && i !== "")
            $('input[name="total_table"]').val(total.join(",")+",")
            document.getElementById('subject-table').innerHTML = `<span style="color: red;">ไม่พบข้อมูล กรุณา Test connect ใหม่อีกครั้ง. </span>`
        }
    }
    function handclick(val){
        if(document.getElementById('mode').checked && val === "0"){
            $('div#subject-mode').html(`
                            <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> ระบุที่อยู่ของไฟล์เพื่อจัดเก็บ </th>
                            <td style="text-align: left;">
                                <input type="text" name="path" placeholder="กรุณาป้อนที่อยู่..." class="form-control" /><br/>
                                <u>ตัวอย่าง</u>: ./sniffer/ หรือ /home/user/sniffer/
                            </td>
                            </table>
                            `);
        }else{
            $('div#subject-mode').empty();
        }
    }
} 
else if (document.getElementById('a_new')) { 
    /*$('li#li_agent').addClass("selected")
    $('a#a_agent').addClass("active")
    $('ul#ui_agent').addClass("in")
    $('li#li_agent_manage').addClass("active")
    $('a#a_agent_manage').addClass("active")*/
    // ======================= Add =============================
    $.post('/agent_manage/').done(function(r) {
        $('input[name="agm_name"]#name-agent').on('keypress keyup keydown', function(e){
            if(e.which == 13 || e.which == 44){
                return false;
            }
            let val = $(this).val()
            let selected = r.manage.filter(function(i){ if (i.agm_name == val){ return i }})
            if(selected.length > 0 && val.length > 0){
                $('div#checkName').html('<span style="font-size: 15px; color: red;">มีผู้ใช้งานแล้ว</span>')
            }else if(val.length < 1){
                $('div#checkName').empty()
            }else{
                $('div#checkName').html('<span style="font-size: 15px; color: green;">สามารถใช้งานได้</span>')
            }
        })
    })
    $('select#select-agent').on('change',function(){
        $('select#select-agent option').each(function(){
            if($(this).is(':selected')){
                $.post('/agent_manage/selectStore',{value: "@lltr@@gentSe1ectStore", id: $(this).val()}).done(function(result){
                    if (result[0].hide == 0 && result[0].status == 1){
                        $('span#name').text("("+result[0].name+")")
                        $('table#head-agent').css('display', 'block');
                        $('div#content-agent').html(`
<textarea class="form-control text-center" rows="7" style="resize: none;" readonly>

รหัสของ Aegnt: ${result[0].code}
ประเภทของ Agent: ${result[0].type}
จำนวนที่สามารถใช้งานของ Agent: ${result[0]._limit_}
คำอธิบายของ Agent: 
${result[0].description}
</textarea>
                    `)
                    }
                    if (result[0].code == "AG1" ){
                        $('div#detail-config').html(`
                            <table class="table table-boardless">
                                <th width="12%" style="text-align: left; font-weight: bold;"> รายการตั้งค่า ${result[0].name} เพื่อนำไปใช้งาน </th>
                            </table>
                            <table class="table table-boardless">
                                <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> ชนิดของ Hash </th>
                                <td style="text-align: left;">
                                    <div class="row">
                                        <div class="col-md-2">
                                            <div class="form-check form-check-inline">
                                                <input type="radio" name="hash_type" id="type1" value="-1" class="form-check-input" required="">
                                                <label for="type1" class="form-check-label"> MD5 </label>
                                                <div class="invalid-feedback">
                                                    กรุณาเลือก!!!
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-2">
                                            <div class="form-check form-check-inline">
                                                <input type="radio" name="hash_type" id="type2" value="0" class="form-check-input" required="">
                                                <label for="type2" class="form-check-label"> SHA-1 </label>
                                                <div class="invalid-feedback">
                                                    กรุณาเลือก!!!
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-2">
                                            <div class="form-check form-check-inline">
                                                <input type="radio" name="hash_type" id="type3" value="1" class="form-check-input" required="" checked>
                                                <label for="type3" class="form-check-label"> SHA-256 </label>
                                                <div class="invalid-feedback">
                                                    กรุณาเลือก!!!
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </table>
                            <table class="table table-boardless">
                                <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> 
                                    ระบุที่อยู่ไฟล์จราจร
                                </th>
                                <td style="text-align: left;">
                                    <div class="input-group">
                                        <input type="text" name="path" placeholder="กรุณาป้อนที่อยู่..." class="form-control" />
                                        <button id="add-path" type="button" class="btn btn-outline-success"><i class="mdi mdi-plus-circle-outline" style="font-size: 15px;"></i></button>
                                    </div>
                                    <div style="margin-top:1%; text-align: left;">
                                        <u>ตัวอย่างเช่น</u>: /home/user/work/ หรือ C:\\Users\\Admin\\Log\\
                                    </div>
                                    <input type="text" name="total_path" readonly hidden/>
                                    <div id="show-tags-path" style="text-align: left; margin-top:1%;">
                                    </div>
                                </td>
                            </table>
                        `)
                        $('div#show-tags-path').html(`
                            <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                        `)
                        $('button:button#add-path').on('click', function(){
                            if($('input[name="path"]').val()){
                                $('input[name="total_path"]').val($('input[name="total_path"]').val()+$('input[name="path"]').val()+",")
                                $('input[name="path"]').val("");
                            }
                            if ($("input[name='total_path']").val()){
                                $('div#show-tags-path').empty()
                                let total = $('input[name="total_path"]').val().split(",")
                                total = total.filter(i => i)
                                for ( i in total ){
                                    $('div#show-tags-path').append(`
                                            <button type="button" id="del-tags" class="btn btn-light-success text-success px-4 rounded-pill font-weight-medium" data-value="${total[i]}">
                                                ${total[i]} 
                                            </button>
                                    `)
                                }
                            }else{
                                $('div#show-tags-path').html(`
                                    <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                `)
                            }
                            $('button#del-tags').on('click', function(){
                                let value = $(this).attr('data-value')
                                let total = $('input[name="total_path"]').val().split(",")
                                total.pop()
                                total = total.filter(i => i !== value && i !== "")
                                $('input[name="total_path"]').val(total+",")
                                if (total.length > 0){
                                    for ( i=0;i < $('div#show-tags-path').children().length;i++){
                                        if ($('div#show-tags-path').children()[i].getAttribute('data-value') === value){
                                            $('div#show-tags-path').children()[i].remove()
                                        }
                                    }
                                }else{
                                    $('div#show-tags-path').html(`
                                        <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                    `)
                                }
                            })
                        })
                    }
                    else if (result[0].code == "AG2"){
                        $('div#detail-config').html(`
                            <table class="table table-boardless">
                                <th width="12%" style="text-align: left; font-weight: bold;"> รายการตั้งค่า ${result[0].name} เพื่อนำไปใช้งาน </th>
                            </table>
                            <table class="table table-boardless">
                                <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> 
                                    เลือกรูปแบบที่ต้องการ
                                </th>
                                <td style="tet-align: left;">
                                    <div class="row">
                                        <div class="col-md-2">
                                            <div class="form-check form-check-inline">
                                                <input type="radio" name="type_of_path" id="type1" value="-1" class="form-check-input" required/>
                                                <label for="type1" class="form-check-label"> เฉพาะไฟล์ๆเดียว </label>
                                                <div class="invalid-feedback">
                                                    กรุณาเลือก!!!
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-check form-check-inline">
                                                <input type="radio" name="type_of_path" id="type2" value="0" class="form-check-input" required/>
                                                <label for="type2" class="form-check-label"> เฉพาะสกุลไฟล์ที่เลือก </label>
                                                <div class="invalid-feedback">
                                                    กรุณาเลือก!!!
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-2">
                                            <div class="form-check form-check-inline">
                                                <input type="radio" name="type_of_path" id="type3" value="1" class="form-check-input" required/>
                                                <label for="type3" class="form-check-label"> ไฟล์ทั้งหมดในที่อยู่ </label>
                                                <div class="invalid-feedback">
                                                    กรุณาเลือก!!!
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </table>
                            <div id="subject-content"></div>
                        `)
                        $('input:radio').on('click', function(){
                            if($(this).val() == -1){
                                $('div#subject-content').html(`
                                    <table class="table table-boardless">
                                        <th style="text-align: left; font-weight: bold; width: 12%;"> เลือกชนิดของไฟล์ </th>
                                        <td style="text-align: left;">
                                            <select name="extension" class="form-control" required>
                                                <option value disabled selected> กรุณาเลือก </option>
                                                <option value=".log"> log </option>
                                                <option value=".evtx"> log (Windows) </option>
                                                <option value=".csv"> csv </option>
                                                <option value=".xls"> xls </option>
                                                <option value=".xlsx"> xlsx </option>
                                            </select>
                                            <div class="invalid-feedback">
                                                กรุณาเลือกชนิดไฟล์!!!
                                            </div>
                                        </td>
                                    </table>
                                    <table class="table table-boardless">
                                        <th style="text-align: left; font-weight: bold; width: 12%;"> ระบุที่อยู่ไฟล์พร้อมชื่อไฟล์ </th>
                                        <td style="text-align: left;">
                                            <div class="form-group">
                                                <input type="text" name="total_path" placeholder="กรุณาป้อนที่อยู่พร้อมชื่อไฟล์..." class="form-control" required/>
                                                <div class="invalid-feedback">
                                                    กรุณาป้อนที่อยู่พร้อมชื่อไฟล์!!!
                                                </div>
                                                <br/>
                                                <span> <u>ตัวอย่างเช่น</u>: /home/user/work1/file หรือ C:\\Users\\Admin\\Log\\file </span>
                                            </div>
                                        </td>
                                    </table>
                                `)
                                $('div#show-tags-path').html(`
                                    <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                `)
                            }else if($(this).val() == 0){
                                $('div#subject-content').html(`
                                    <table class="table table-boardless">
                                        <th style="text-align: left; font-weight: bold; width: 12%;"> เลือกชนิดของไฟล์ </th>
                                        <td style="text-align: left;">
                                            <select name="extension" class="form-control" required>
                                                <option value disabled selected> กรุณาเลือก </option>
                                                <option value=".log"> log </option>
                                                <option value=".evtx"> log (Windows) </option>
                                                <option value=".csv"> csv </option>
                                                <option value=".xls"> xls </option>
                                                <option value=".xlsx"> xlsx </option>
                                            </select>
                                            <div class="invalid-feedback">
                                                กรุณาเลือกชนิดของไฟล์
                                            </div>
                                        </td>
                                    </table>
                                    <table class="table table-boardless">
                                        <th style="text-align: left; font-weight: bold; width: 12%;"> ระบุที่อยู่ไฟล์ </th>
                                        <td style="text-align: left;">
                                            <div class="input-group">
                                                <input type="text" name="path" placeholder="กรุณาป้อนที่อยู่และชื่อไฟล์..." class="form-control" />
                                                <button id="add-path" type="button" class="btn btn-outline-success"><i class="mdi mdi-plus-circle-outline" style="font-size: 15px;"></i></button>
                                            </div>
                                            <div style="margin-top:1%; text-align: left;">
                                                <u>ตัวอย่างเช่น</u>: /home/user/work1/  หรือ C:\\Users\\Admin\\Log\\
                                            </div>
                                            <input type="text" name="total_path" readonly hidden/>
                                            <div id="show-tags-path" style="text-align: left; margin-top:1%;">
                                            </div>
                                        </td>
                                    </table>
                                    `)
                                $('div#show-tags-path').html(`
                                    <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                `)
                                $('button:button#add-path').on('click', function(){
                                    if($('input[name="path"]').val()){
                                        $('input[name="total_path"]').val($('input[name="total_path"]').val()+$('input[name="path"]').val()+",")
                                        $('input[name="path"]').val("");
                                    }else{
                                        $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
                                        $('button:button#alert-table.swal2-cancel.swal2-styled').on('click', function(){
                                            $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                                        })
                                    }
                                    if ($("input[name='total_path']").val()){
                                        $('div#show-tags-path').empty()
                                        let total = $('input[name="total_path"]').val().split(",")
                                        total = total.filter(i => i)
                                        for ( i in total ){
                                            $('div#show-tags-path').append(`
                                            <button type="button" id="del-tags" class="btn btn-light-success text-success px-4 rounded-pill font-weight-medium" data-value="${total[i]}">
                                                ${total[i]} 
                                            </button>
                                                `)
                                        }
                                    }else{
                                        $('div#show-tags-path').html(`
                                            <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                                `)
                                    }
                                    $('button#del-tags').on('click', function(){
                                        let value = $(this).attr('data-value')
                                        let total = $('input[name="total_path"]').val().split(",")
                                        total.pop()
                                        total = total.filter(i => i != value && i !== "")
                                        $('input[name="total_path"]').val(total+",")
                                        if (total.length > 0){
                                            for ( i=0;i < $('div#show-tags-path').children().length;i++){
                                                if ($('div#show-tags-path').children()[i].getAttribute('data-value') == value){
                                                    $('div#show-tags-path').children()[i].remove()
                                                }
                                            }
                                        }else{
                                            $('div#show-tags-path').html(`
                                                <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                                `)
                                        }
                                    })
                                })
                            }else if($(this).val() == 1){ 
                                $('div#subject-content').html(`
                                    <table class="table table-boardless">
                                        <th width="12%" style="text-align: left; font-weight: bold;"> รายการตั้งค่า ${result[0].name} เพื่อนำไปใช้งาน </th>
                                    </table>
                                    <table class="table table-boardless">
                                        <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> 
                                            ระบุที่อยู่ไฟล์จราจร
                                        </th>
                                        <td style="tet-align: left;">
                                            <div class="input-group">
                                                <input type="text" name="path" placeholder="กรุณาป้อนที่อยู่..." class="form-control" />
                                                <button id="add-path" type="button" class="btn btn-outline-success"><i class="mdi mdi-plus-circle-outline" style="font-size: 15px;"></i></button>
                                            </div>
                                            <div style="margin-top:1%; text-align: left;">
                                                <u>ตัวอย่างเช่น</u>: /home/user/work1/  หรือ C:\\Users\\Admin\\Log\\ 
                                            </div>
                                            <input type="text" name="total_path" readonly hidden/>
                                            <div id="show-tags-path" style="text-align: left; margin-top:1%;">
                                            </div>
                                        </td>
                                    </table>
                                        `)
                                $('div#show-tags-path').html(`
                                <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                        `)
                                $('button:button#add-path').on('click', function(){
                                    if($('input[name="path"]').val()){
                                        $('input[name="total_path"]').val($('input[name="total_path"]').val()+$('input[name="path"]').val()+",")
                                        $('input[name="path"]').val("");
                                    }else{
                                        $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
                                        $('button:button#alert-table.swal2-cancel.swal2-styled').on('click', function(){
                                            $('div#alert-table.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                                        })
                                    }
                                    if ($("input[name='total_path']").val()){
                                        $('div#show-tags-path').empty()
                                        let total = $('input[name="total_path"]').val().split(",")
                                        total = total.filter(i => i)
                                        for ( i in total ){
                                            $('div#show-tags-path').append(`
                                            <button type="button" id="del-tags" class="btn btn-light-success text-success px-4 rounded-pill font-weight-medium" data-value="${total[i]}">
                                                ${total[i]} 
                                            </button>
                                            `)
                                        }
                                    }else{
                                        $('div#show-tags-path').html(`
                                            <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                        `)
                                    }
                                    $('button#del-tags').on('click', function(){
                                        let value = $(this).attr('data-value')
                                        let total = $('input[name="total_path"]').val().split(",")
                                        total.pop()
                                        total = total.filter(i => i !== value && i !== "")
                                        $('input[name="total_path"]').val(total+",")
                                        if (total.length > 0){
                                            for ( i=0;i < $('div#show-tags-path').children().length;i++){
                                                if ($('div#show-tags-path').children()[i].getAttribute('data-value') === value){
                                                    $('div#show-tags-path').children()[i].remove()
                                                }
                                            }
                                        }else{
                                            $('div#show-tags-path').html(`
                                                <span style="color: red;">ไม่มีข้อมูล กรุณาเพิ่มข้อมูล</span>
                                            `)
                                        }
                                    })
                                })
                            }
                        })
                    }
                    else if (result[0].code == "AG3"){
                        $('div#detail-config').html(`
                        <table class="table table-boardless">
                            <th width="15%" style="text-align: left; font-weight: bold;"> รายการตั้งค่า ${result[0].name} เพื่อนำไปใช้งาน </th>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> เลือก Service Database ที่คุณใช้ </th>
                            <td style="text-align: left;">
                                <div class="row">
                                   <div class="col-md-2">
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" name="service_database" id="oracle" value="0" required/>
                                            <label class="form-check-label" for="oracle"> Oracle DB </label>
                                            <div class="invalid-feedback">
                                                กรุณาเลือก!!!
                                            </div>
                                        </div>
                                    </div>
                                   <div class="col-md-2">
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" name="service_database" id="mysql" value="1" checked required/>
                                            <label class="form-check-label" for="mysql"> MySQL </label>
                                            <div class="invalid-feedback">
                                                กรุณาเลือก!!!
                                            </div>
                                        </div>
                                    </div> 
                                </div>
                            </td>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> IP หรือ Host ของ service database </th>
                            <td style="text-align: left;">
                                <input type="text" name="host" placeholder="กรุณาป้อนIP..." class="form-control" required/>
                                <div id="inip" class="invalid-feedback">
                                    กรุณาป้อน IP หรือ Host ของ service databas!!!
                                </div>
                            </td>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> Username ของ service database </th>
                            <td style="text-align: left;">
                                <input type="text" name="username" placeholder="กรุณาป้อนUser..." class="form-control" required/>
                                <div id="inusername" class="invalid-feedback">
                                    กรุณาป้อน Username ของ service database!!!
                                </div>
                            </td>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> Password ของ service database </th>
                            <td style="text-align: left;">
                                <input type="password" name="password" placeholder="กรุณาป้อนPass..." class="form-control" required/>
                                <div id="inpassword" class="invalid-feedback">
                                    กรุณาป้อน Password ของ service database!!!
                                </div>
                            </td>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> ชื่อของ Database ที่ต้องการของ </th>
                            <td style="text-align: left;">
                                <input type="text" name="database" placeholder="กรุณาป้อนDatabase..." class="form-control" required/>
                                <div id="indatabase" class="invalid-feedback">
                                    กรุณาป้อน Database...
                                </div>
                            </td>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> ทดสอบการเชื่อมต่อ </th>
                            <td style="text-align: left;">
                                <button type="button" id="testDB" class="btn btn-info"> Test connect </button>
                            </td>
                        </table>
                        <table id="show-tables" class="table table-boardless" style="display: block;">
                            <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> Table ของ database ที่เลือก </th>
                            <td style="text-align: left;">
                                <div class="input-group">
                                    <input type="text" name="table" class="form-control" placeholder="กรุณาป้อนชื่อTable..." />
                                    <button id="add-table" type="button" class="form-input-group btn btn-outline-success" onClick="addTable(this)"><i class="mdi mdi-plus-circle-outline" style="font-size: 15px;"></i></button>
                                </div>
                                <input type="text" name="total_table" readonly hidden/>
                                <div id="subject-table" style="margin-top:1%">
                                    <span style="color: red;">ไม่มีข้อมูล, ทดสอบการเชื่อมต่อ หรือ เพิ่ม Table ขึ้นมา </span>
                                </div>
                            </td>
                        </table>
                        `)
                        $('button:button#testDB').on('click', function(){
                            let host = $('input[name="host"]').val()
                            let user = $('input[name="username"]').val()
                            let pass = $('input[name="password"]').val()
                            let db = $('input[name="database"]').val()
                            let type = $('input[name="service_database"]:checked').val()
                            //let type = 0
                            if (host && user && pass && db ){ // #15
                                $('div#inip').css('display', 'none')
                                $('input[name="host"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inusername').css('display', 'none')
                                $('input[name="username"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#inpassword').css('display', 'none')
                                $('input[name="password"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $('div#indatabase').css('display', 'none')
                                $('input[name="database"]').css({
                                    'border-color' : '', 
                                    'padding-right' : '', 
                                    'background-image': "", 
                                    'background-repeat': '', 
                                    'background-position': '',
                                    'background-size': ''
                                })
                                $.post('/agent_manage/connect/',{value:"@lltr@@gentM@n@geTestConnect",host:host,user:user,pass:pass,db:db,type:type}, "json").done(function(rs){
                                    let fm = findMatchObject(rs, "err")
                                    if(fm == true && type == 1){
                                        $('h2#alert-success.swal2-title').text("ไม่สามารถเชื่อมต่อได้...")
                                        $('div#alert-content-success.swal2-content').html(`
                                            CODE: ${rs.err.code}<br/>
                                            ERRNO: ${rs.err.errno}
                                        `)
                                        $('div#alert-warning-icon.swal2-icon.swal2-warning.swal2-animate-warning-icon').css('display', "flex")
                                        $('div#alert-success-icon.swal2-icon.swal2-success.swal2-animate-success-icon').css('display', "none")
                                        $('div#alert-success.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'flex');
                                        $('button#alert-success.swal2-confirm.swal2-styled').on('click', function(){
                                            $('div#alert-success.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'none');
                                        })
                                        $('input[name="host"]').val("")
                                        $('input[name="username"]').val("")
                                        $('input[name="password"]').val("")
                                        $('input[name="database"]').val("")
                                    }else if(fm == true && type == 0){
                                        $('h2#alert-success.swal2-title').text("ไม่สามารถเชื่อมต่อได้...")
                                        $('div#alert-content-success.swal2-content').html(`
                                            ErrorNum: ${rs.err.errorNum}<br/>
                                            OffSet: ${rs.err.offset}
                                        `)
                                        $('div#alert-warning-icon.swal2-icon.swal2-warning.swal2-animate-warning-icon').css('display', "flex")
                                        $('div#alert-success-icon.swal2-icon.swal2-success.swal2-animate-success-icon').css('display', "none")
                                        $('div#alert-success.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'flex');
                                        $('button#alert-success.swal2-confirm.swal2-styled').on('click', function(){
                                            $('div#alert-success.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'none');
                                        })
                                        $('input[name="host"]').val("")
                                        $('input[name="username"]').val("")
                                        $('input[name="password"]').val("")
                                        $('input[name="database"]').val("")
                                    }else if(fm == false && (type == 0 || type == 1)){
                                        $('h2#alert-success.swal2-title').text(rs.message)
                                        $('div#alert-content-success.swal2-content').empty()
                                        $('div#alert-warning-icon.swal2-icon.swal2-warning.swal2-animate-warning-icon').css('display', "none")
                                        $('div#alert-success-icon.swal2-icon.swal2-success.swal2-animate-success-icon').css('display', "flex")
                                        $('div#alert-success.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'flex');
                                        $('button#alert-success.swal2-confirm.swal2-styled').on('click', function(){
                                            $('div#alert-success.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'none');
                                        })
                                        $('table#show-tables').css('display', 'block')
                                        if(Object.keys(rs.result).length > 0){
                                            $('div#subject-table').empty()
                                            let tables = rs.result;
                                            for (var i in tables){
                                                $('input[name="total_table"]').val($('input[name="total_table"]').val()+i+",")
                                                $('div#subject-table').append(`
                                                <div class="accordion" id="database-check-${i}" style="margin-bottom:1%;">
                                                    <div class="accordion-item" data-value="${i}">
                                                        <h2 class="accordion-header" id="heading${i}">
                                                            <button class="accordion-button collapsed" id="show-detail-${i}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}" data-value="${i}">
                                                            ${i}
                                                            </button>
                                                        </h2>
                                                    <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}" data-bs-parent="#database-check-${i}">
                                                        <div class="accordion-body" id="content-column">
                                                            <span style="color: red;"> *Column ID หรือ Column primary key จำเป็นต้องมีและควรอยู่อันแรกเสมอ* </span>
                                                            <span style="float: right;">
                                                                <a href="javascript:void(0);" id="add-column-${i}" data-value="${i}" onClick="addColumn(this)"> เพิ่ม Column </a>
                                                                /
                                                                <a href="javascript:void(0);" id="del-table-${i}" data-value="${i}" onClick="delTable(this)">ลบ Table นี้ </a>
                                                            </span>
                                                                <table id="table-show-column-${i}" class="table table-boardless">
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                `)
                                                appendColumn(i, tables[i])
                                            }
                                        }else{
                                            $('div#subject-table').html(`<span style="color: red;">ไม่พบข้อมูลใน database.</span>`)
                                        }
                                    }
                                })
                            }else{
                                if(host !== "" && user !== "" && pass !== "" && db === ""){ // #14
                                    $('div#inip').css('display', 'none')
                                    $('input[name="host"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inusername').css('display', 'none')
                                    $('input[name="username"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inpassword').css('display', 'none')
                                    $('input[name="password"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#indatabase').css('display', 'block')
                                    $('input[name="database"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                }else if(host !== "" && user !== "" && pass === "" && db !== ""){ // #13
                                    $('div#inip').css('display', 'none')
                                    $('input[name="host"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inusername').css('display', 'none')
                                    $('input[name="username"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#indatabase').css('display', 'none')
                                    $('input[name="database"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inpassword').css('display', 'block')
                                    $('input[name="password"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                }else if(host !== "" && user !== "" && pass !== "" && db !== ""){ // #12
                                    $('div#inip').css('display', 'none')
                                    $('input[name="host"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inusername').css('display', 'none')
                                    $('input[name="username"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inpassword').css('display', 'block')
                                    $('input[name="password"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#indatabase').css('display', 'block')
                                    $('input[name="database"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                }else if(host !== "" && user === "" && pass !== "" && db !== ""){ // #11
                                    $('div#inip').css('display', 'none')
                                    $('input[name="host"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inusername').css('display', 'block')
                                    $('input[name="username"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inpassword').css('display', 'none')
                                    $('input[name="password"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#indatabase').css('display', 'none')
                                    $('input[name="database"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                }else if(host !== "" && user === "" && pass !== "" && db === ""){ // #10
                                    $('div#inip').css('display', 'none')
                                    $('input[name="host"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inusername').css('display', 'block')
                                    $('input[name="username"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inpassword').css('display', 'none')
                                    $('input[name="password"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#indatabase').css('display', 'block')
                                    $('input[name="database"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                }else if(host !== "" && user === "" && pass === "" && db !== ""){ // #9
                                    $('div#inip').css('display', 'none')
                                    $('input[name="host"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inusername').css('display', 'block')
                                    $('input[name="username"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inpassword').css('display', 'block')
                                    $('input[name="password"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#indatabase').css('display', 'none')
                                    $('input[name="database"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                }else if(host !== "" && user === "" && pass === "" && db === ""){ // #8
                                    $('div#inip').css('display', 'none')
                                    $('input[name="host"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inusername').css('display', 'block')
                                    $('input[name="username"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inpassword').css('display', 'block')
                                    $('input[name="password"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#indatabase').css('display', 'block')
                                    $('input[name="database"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                }else if(host === "" && user !== "" && pass !== "" && db !== ""){ // #7
                                    $('div#inip').css('display', 'block')
                                    $('input[name="host"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inusername').css('display', 'none')
                                    $('input[name="username"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inpassword').css('display', 'none')
                                    $('input[name="password"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#indatabase').css('display', 'none')
                                    $('input[name="database"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                }else if(host === "" && user !== "" && pass !== "" && db === ""){ // #6
                                    $('div#inip').css('display', 'block')
                                    $('input[name="host"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inusername').css('display', 'none')
                                    $('input[name="username"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inpassword').css('display', 'none')
                                    $('input[name="password"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#indatabase').css('display', 'block')
                                    $('input[name="database"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                }else if(host === "" && user !== "" && pass === "" && db !== ""){ // #5
                                    $('div#inip').css('display', 'block')
                                    $('input[name="host"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inusername').css('display', 'none')
                                    $('input[name="username"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inpassword').css('display', 'block')
                                    $('input[name="password"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#indatabase').css('display', 'none')
                                    $('input[name="database"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                }else if(host === "" && user !== "" && pass === "" && db === ""){ // #4
                                    $('div#inip').css('display', 'block')
                                    $('input[name="host"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inusername').css('display', 'none')
                                    $('input[name="username"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inpassword').css('display', 'block')
                                    $('input[name="password"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#indatabase').css('display', 'block')
                                    $('input[name="database"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                }else if(host === "" && user === "" && pass !== "" && db !== ""){ // #3
                                    $('div#inip').css('display', 'block')
                                    $('input[name="host"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inusername').css('display', 'block')
                                    $('input[name="username"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inpassword').css('display', 'none')
                                    $('input[name="password"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#indatabase').css('display', 'none')
                                    $('input[name="database"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                }else if(host === "" && user === "" && pass !== "" && db === ""){ // #2
                                    $('div#inip').css('display', 'block')
                                    $('input[name="host"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inusername').css('display', 'block')
                                    $('input[name="username"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inpassword').css('display', 'none')
                                    $('input[name="password"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#indatabase').css('display', 'block')
                                    $('input[name="database"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                }else if(host === "" && user === "" && pass === "" && db !== ""){ // #1
                                    $('div#inip').css('display', 'block')
                                    $('input[name="host"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inusername').css('display', 'block')
                                    $('input[name="username"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inpassword').css('display', 'block')
                                    $('input[name="password"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#indatabase').css('display', 'none')
                                    $('input[name="database"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                }else if(host === "" && user === "" && pass === "" && db === ""){ // #0
                                    $('div#inip').css('display', 'block')
                                    $('input[name="host"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inusername').css('display', 'block')
                                    $('input[name="username"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#inpassword').css('display', 'block')
                                    $('input[name="password"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                    $('div#indatabase').css('display', 'block')
                                    $('input[name="database"]').css({
                                        'border-color' : '#f62d51', 
                                        'padding-right' : 'calc(1.5em + .75rem)', 
                                        'background-image': "url(/UI/assets/images/agent/alert.svg)", 
                                        'background-repeat': 'no-repeat', 
                                        'background-position': 'right calc(.375em + .1875rem) center',
                                        'background-size': 'calc(.75em + .375rem) calc(.75em + .375rem)'
                                    })
                                }else{ //#15
                                    $('div#inip').css('display', 'block')
                                    $('input[name="host"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inusername').css('display', 'block')
                                    $('input[name="username"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#inpassword').css('display', 'block')
                                    $('input[name="password"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                    $('div#indatabase').css('display', 'block')
                                    $('input[name="database"]').css({
                                        'border-color' : '', 
                                        'padding-right' : '', 
                                        'background-image': "", 
                                        'background-repeat': '', 
                                        'background-position': '',
                                        'background-size': ''
                                    })
                                }
                            } 
                        })
                        $(document).on({
                            ajaxStart: function(){
                                $("div#alert-loading").css('display', 'flex')
                            },
                            ajaxComplete: function(){
                                $("div#alert-loading").css('display', 'none')
                            }
                        })
                    }
                    else if (result[0].code == "AG4"){
                        $('div#detail-config').html(`
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> รายการตั้งค่า ${result[0].name} เพื่อนำไปใช้งาน <span style="color: red;">ไม่รองรับ Windows </span></th>
                        </table>
                        <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold;"> เลือกโหมดการใช้งาน </th>
                            <td style="text-align: left;">
                                <div class="row">
                                <div class="col-md-1">
                                <div class="form-check form-check-inline">
                                    <input type="radio" name="mode" value="0" id="mode" class="form-check-input" onclick="handclick(this.value)" checked required/>
                                    <label class="form-check-label" for="mode"> FTP </label>
                                    <div class="invalid-feedback">
                                        กรุณาเลือก!!!
                                    </div>
                                </div>
                                </div>
                                <div class="col-md-4">
                                <div class="form-check form-check-inline">
                                    <input type="radio" name="mode" value="1" id="mode" class="form-check-input" onclick="handclick(this.value)" required/>
                                    <label class="form-check-label" for="mode"> Syslogs </label>
                                    <div class="invalid-feedback">
                                        กรุณาเลือก!!!
                                    </div>
                                </div>
                                </div>
                                </div>
                            </td>
                        </table>
                        <div id="subject-mode">
                        </div>
                        `)
                        if(document.getElementById('mode').checked && document.getElementById('mode').value === "0"){
                            $('div#subject-mode').html(`
                            <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> ระบุที่อยู่ของไฟล์เพื่อจัดเก็บ </th>
                            <td style="text-align: left;">
                                <input type="text" name="path" placeholder="กรุณาป้อนที่อยู่..." class="form-control" /><br/>
                                <u>ตัวอย่าง</u>: ./sniffer/ หรือ /home/user/sniffer/
                            </td>
                            </table>
                            `);
                        }else{
                            $('div#subject-mode').empty();
                        }
                    }
                    else{
                        $('div#detail-config').empty()
                    }
                })
            }
        })
    })
    function handclick(val){
        if(document.getElementById('mode').checked && val === "0"){
            $('div#subject-mode').html(`
                            <table class="table table-boardless">
                            <th width="12%" style="text-align: left; font-weight: bold; vertical-align: top;"> ระบุที่อยู่ของไฟล์เพื่อจัดเก็บ </th>
                            <td style="text-align: left;">
                                <input type="text" name="path" placeholder="กรุณาป้อนที่อยู่..." class="form-control" /><br/>
                                <u>ตัวอย่าง</u>: ./sniffer/ หรือ /home/user/sniffer/
                            </td>
                            </table>
                            `);
        }else{
            $('div#subject-mode').empty();
        }
    }
    function addTable(e){
        let parent = e.parentNode.parentNode;
        let new_value = $('input[name="table"]').val();
        if ( document.getElementById('subject-table').children[0].nodeName == "SPAN"){
            $('div#subject-table').empty();
            parent.querySelector("[name='total_table']").value += (new_value)+","
            $('div#subject-table').append(`
            <div class="accordion" id="database-check-${new_value}" style="margin-bottom:1%;">
                <div class="accordion-item" data-value="${new_value}">
                    <h2 class="accordion-header" id="heading${new_value}">
                        <button class="accordion-button collapsed" id="show-detail-${new_value}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${new_value}" aria-expanded="false" aria-controls="collapse${new_value}" data-value="${new_value}" data-index="${0}">
                            ${new_value}
                        </button>
                    </h2>
                    <div id="collapse${new_value}" class="accordion-collapse collapse" aria-labelledby="heading${new_value}" data-bs-parent="#database-check-${new_value}">
                        <div class="accordion-body" id="content-column">
                            <span style="color: red;"> *Column ID หรือ Column primary key จำเป็นต้องมีและควรอยู่อันแรกเสมอ* </span>
                            <span style="float: right;">
                                <a href="javascript:void(0);" id="add-column-${new_value}" data-value="${new_value}" data-index="${0}" onClick="addColumn(this)"> เพิ่ม Column </a>
                                    /
                                <a href="javascript:void(0);" id="del-table-${new_value}" data-value="${new_value}" data-index="${0}" onClick="delTable(this)">ลบ Table นี้ </a>
                            </span>
                            <table id="table-show-column-${new_value}" class="table table-boardless">
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            `)
            $('table#table-show-column-'+new_value).append(`
                <div id="div-column-${new_value}" class="input-group" style="margin-top: 1%;">
                    <input type="text" name="column${new_value}[]" value="" class="form-control" placeholder="กรุณาป้อนชื่อColumn..." />
                    <button data-value="${new_value}" data-index="${0}" type="button" class="btn btn-outline-danger" onClick="delColumn(this)"><i class="mdi mdi-close-circle-outline"></i></button>
                </div>
            `)
        }else{
            let index = $('div#subject-table').children().length;
            parent.querySelector("[name='total_table']").value += (new_value)+","
            $('div#subject-table').append(`
            <div class="accordion" id="database-check-${new_value}" style="margin-bottom:1%;">
                <div class="accordion-item" data-value="${new_value}">
                    <h2 class="accordion-header" id="heading${new_value}">
                        <button class="accordion-button collapsed" id="show-detail-${new_value}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${new_value}" aria-expanded="false" aria-controls="collapse${new_value}" data-value="${new_value}" data-index="${parseInt(index)}">
                            ${new_value}
                        </button>
                    </h2>
                    <div id="collapse${new_value}" class="accordion-collapse collapse" aria-labelledby="heading${new_value}" data-bs-parent="#database-check-${new_value}">
                        <div class="accordion-body" id="content-column">
                            <span style="color: red;"> *Column ID หรือ Column primary key จำเป็นต้องมีและควรอยู่อันแรกเสมอ* </span>
                            <span style="float: right;">
                                <a href="javascript:void(0);" id="add-column-${new_value}" data-value="${new_value}" data-index="${parseInt(index)}" onClick="addColumn(this)"> เพิ่ม Column </a>
                                    /
                                <a href="javascript:void(0);" id="del-table-${new_value}" data-value="${new_value}" data-index="${parseInt(index)}" onClick="delTable(this)">ลบ Table นี้ </a>
                            </span>
                            <table id="table-show-column-${new_value}" class="table table-boardless">

                            </table>
                        </div>
                    </div>
                </div>
            </div>
            `)
            $('table#table-show-column-'+new_value).append(`
                <div id="div-column-${new_value}" class="input-group" style="margin-top: 1%;">
                    <input type="text" name="column${new_value}[]" value="" class="form-control" placeholder="กรุณาป้อนชื่อColumn..."/>
                    <button data-value="${new_value}" data-index="${parseInt(index)}" type="button" class="btn btn-outline-danger" onClick="delColumn(this)"><i class="mdi mdi-close-circle-outline"></i></button>
                </div>
            `)
        }
        $('input[name="table"]').val("")
    }
    function addColumn(e){
        let value = e.getAttribute('data-value')
        let new_node = `<div id="div-column-${value}" class="input-group" style="margin-top: 1%;">
                            <input type="text" name="column${value}[]" placeholder="กรุณาป้อนชื่อColumn..." class="form-control" />
                        <button data-value="${value}" data-index="${value}" type="button" class="btn btn-outline-danger" onClick="delColumn(this)"><i class="mdi mdi-close-circle-outline"></i></button>
                        </div>`
        if($(`input[name="column${value}[]"]`).val()){
            let old_value = ($(`input[name="column${value}[]"]`).map(function(){ return $(this).val(); }).get())
            let tags = document.getElementById(`database-check-${value}`).querySelector(`table#table-show-column-${value}`).children
            document.getElementById(`database-check-${value}`).querySelector(`table#table-show-column-${value}`).innerHTML += new_node;
            for (i=0;i < tags.length-1; i++){
                tags[i].getElementsByTagName('input')[0].value = old_value[i]
            }
        }else{
            document.getElementById(`database-check-${value}`).querySelector(`table#table-show-column-${value}`).innerHTML += new_node;
        }
    }
    function delColumn(e){
        let parent = e.parentNode;
        let value = e.getAttribute('data-value')
        if($(`table#table-show-column-${value}`).children().length > 1){
            if(parent.getElementsByTagName('input')[0].value){
                $('div#alert-confirm-column.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
                $('span#column-name-modal').text(parent.getElementsByTagName('input')[0].value)
                $('button#alert-confirm-column-yes.swal2-confirm.swal2-styled.btn.btn-danger').on('click', function(){
                    parent.remove()
                    $('div#alert-confirm-column.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                })
                $('button#alert-confirm-column-no.swal2-cancel.swal2-styled.btn.btn-secondary').on('click', function(){
                    $('div#alert-confirm-column.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                })
            }else{
                parent.remove()
            }
        }else{
            $('div#alert-column.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
            $('button#alert-column.swal2-cancel.swal2-styled').on('click', function(){
                $('div#alert-column.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display', 'none')
            })
        }
    }
    function delTable(e){
        let parent = e.parentNode.parentNode;
        let value = e.getAttribute('data-value')
        let old = parent.querySelector(`#table-show-column-${value}`).children
        let total = $('input[name="total_table"]').val().split(",")
        total = total.filter(i => i !== "")
        let logic = false
        for ( i=0; i < old.length; i++ ){
            if (old[i].getElementsByTagName('input')[0]){
                logic = true;
                break
            }
        }
        if (total.length > 0 && logic == true){
            $('span#table-name').text(value)
            $('div#alert-confirm.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
            $('button#alert-confirm-yes').on('click', function(){
                total = total.filter(i => i != value && i !== "")
                $('input[name="total_table"]').val(total.join(",")+",")
                parent.parentNode.parentNode.parentNode.remove()
                $('div#alert-confirm.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                if(document.getElementById('subject-table').children.length == 0){
                    $('div#subject-table').html(`<span style="color: red;">ไม่พบข้อมูล กรุณา Test connect ใหม่อีกครั้ง. </span>`)
                }
            })
            $('button#alert-confirm-no').on('click', function(){
                $('div#alert-confirm.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
            })
        }
        else if (total.length > 0 && logic == false){
            total = total.filter(i => i != value && i !== "")
            $('input[name="total_table"]').val(total.join(",")+",")
            document.getElementById('subject-table').querySelector(`#database-check-${value}`).remove()
        }
        else if (total.length == 0 && logic == true){
            $('span#table-name').text(value)
            $('div#alert-confirm.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','flex')
            $('button#alert-confirm-yes').on('click', function(){
                total = total.filter(i => i != value && i !== "")
                $('input[name="total_table"]').val(total.join(",")+",")
                document.getElementById('subject-table').innerHTML = `<span style="color: red;">ไม่พบข้อมูล กรุณา Test connect ใหม่อีกครั้ง. </span>`
                $('div#alert-confirm.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
                if($('div#subject-table').children().length == 0){
                    $('div#subject-table').html(`<span style="color: red;">ไม่พบข้อมูล กรุณา Test connect ใหม่อีกครั้ง. </span>`)
                }
            })
            $('button#alert-confirm-no').on('click', function(){
                $('iv#alert-confirm.swal2-container.swal2-center.swal2-fade.swal2-shown').css('display','none')
            })
        }
        else if (total.length == 0 && logic == false){
            total = total.filter(i => i != value && i !== "")
            $('input[name="total_table"]').val(total.join(",")+",")
            document.getElementById('subject-table').innerHTML = `<span style="color: red;">ไม่พบข้อมูล กรุณา Test connect ใหม่อีกครั้ง. </span>`
        }
    }
}
else if (document.getElementById('file_log_ag')) {
    $('input[name=search]').on('change keyup keydown', function() {
        searchData('file', $(this).val(), null);
    });
    const creteTableContent = () => {
        $.post('/file_log_ag').done(function (result) {
            $('span#total-size').text(convert_size(result.total))
            // ============================== Create Prepare ============================
            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
            var state = {
                'querySet': result.files,
                'page': 1,
                'rows': 20,
                'window': 10,
            }
            buildTable()
            function pagination(querySet, page, rows) {
                var trimStart = (page - 1) * rows
                var trimEnd = trimStart + rows

                var trimmedData = querySet.slice(trimStart, trimEnd)

                var pages = Math.ceil(querySet.length / rows);

                var start_count = 1
                document.getElementById('start-file').innerHTML = start_count

                return {
                    'querySet': trimmedData,
                    'pages': pages,

                }
            }
            // ============================== Create Pagination ============================
            function pageButtons(pages) {
                var wrapper = document.getElementById('pagination-wapper')
                wrapper.innerHTML = ``

                var maxLeft = (state.page - Math.floor(state.window / 2))
                var maxRight = (state.page + Math.floor(state.window / 2))

                if (maxLeft < 1) {
                    maxLeft = 1
                    maxRight = state.window
                }

                if (maxRight > pages) {
                    maxLeft = pages - (state.window - 1)

                    if (maxLeft < 1) {
                        maxLeft = 1
                    }
                    maxRight = pages
                }
                for (var page = maxLeft; page <= maxRight; page++) {
                    wrapper.innerHTML += `<li class="page-item"><button class="page page-link" value=${page}>${page}</button></li>`
                }

                if (state.page == 1) {
                    wrapper.innerHTML = `<li class="page-item disabled"><button value=${1} class="page page-link" >&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                } else {
                    wrapper.innerHTML = `<li class="page-item"><button value=${1} class="page page-link">&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                }

                if (state.page != pages) {
                    wrapper.innerHTML += `<li class="page-item"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                } else {
                    wrapper.innerHTML += `<li class="page-item disabled"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                }

                $('.page').on('click', function () {
                    $('#table-body').empty()

                    state.page = Number($(this).val())

                    buildTable()
                })
            }
            // ============================== Create Table ============================
            function buildTable() {
                var table = $('#table-body')
                var data = pagination(state.querySet, state.page, state.rows)
                var myList = data.querySet
                for (y in myList) {
                    if(state.page == 1){
                        if (myList[y].id != "") {
                            let name = (f) =>{
                                if(f.slice(-4) === "xlsx" || f.slice(-4) === "evtx"){
                                    return f.slice(0, -5)
                                }
                                return f.slice(0, -4)
                            }
                            let extension = (f) =>{
                                if(f.slice(-4) === "xlsx" || f.slice(-4) === 'evtx'){
                                    return f.slice(-5)
                                }
                                return f.slice(-4)
                            }
                            //Keep in mind we are using "Template Litterals to create rows"
                            var row = '<tr>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                '</b> <span class="tablesaw-cell-content">' + myList[y].id + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อไฟล์</b> <span class="tablesaw-cell-content">' + name(myList[y].name_file) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">นามสกุลไฟล์</b> <span class="tablesaw-cell-content">' + extension(myList[y].name_file) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ขนาดไฟล์</b> <span class="tablesaw-cell-content">' + convert_size(myList[y].size) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">เวลา/วันที่ แก้ไขล่าสุด</b> <span class="tablesaw-cell-content">' + convert_datetime(new Date(myList[y]._get), myList[y]._get) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ดูข้อมูล</b> <span class="tablesaw-cell-content"><a href="#file_log_detail" data-bs-toggle="modal" class="text-info" data-value="'+result.id_files[y].id+'"><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                '</tr>'
                            table.append(row)
                            end_count = myList[y].id
                        } else {
                            var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty" style="color: red;">ไม่ข้อมูล</td></tr>'
                            table.append(row)
                        }
                    }else{
                        if (myList[y].id != "") {
                            let name = (f) =>{
                                if(f.slice(-4) === "xlsx" || f.slice(-4) === 'evtx'){
                                    return f.slice(0, -5)
                                }
                                return f.slice(0, -4)
                            }
                            let extension = (f) =>{
                                if(f.slice(-4) === "xlsx" || f.slice(-4) === 'evtx'){
                                    return f.slice(-5)
                                }
                                return f.slice(-4)
                            }
                            //Keep in mind we are using "Template Litterals to create rows"
                            var row = '<tr>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                '</b> <span class="tablesaw-cell-content">' + myList[y].id + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อไฟล์</b> <span class="tablesaw-cell-content">' + name(myList[y].name_file) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">นามสกุลไฟล์</b> <span class="tablesaw-cell-content">' + extension(myList[y].name_file) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ขนาดไฟล์</b> <span class="tablesaw-cell-content">' + convert_size(myList[y].size) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">เวลา/วันที่ แก้ไขล่าสุด</b> <span class="tablesaw-cell-content">' + convert_datetime(new Date(myList[y]._get), myList[y]._get) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ดูข้อมูล</b> <span class="tablesaw-cell-content"><a href="#file_log_detail" data-bs-toggle="modal" class="text-info" data-value="'+result.id_files[parseInt(state.rows)+parseInt(y)].id+'"><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                '</tr>'
                            table.append(row)
                            end_count = myList[y].id
                        } else {
                            var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty" style="color: red;">ไม่ข้อมูล</td></tr>'
                            table.append(row)
                        }
                    }
                }
                $('#end-file').html(end_count)
                if(myList.length > 0){
                    if (myList[0].id != "") {
                        $('#start-file').html(myList[0].id)
                    } else {
                        $('#start-file').html(0)
                    }  
                }
                pageButtons(data.pages)

                if (myList.length == 0) {
                    var table = $('#table-body')
                    var row = '<tr>' +
                        '<td class="text-center" colspan="6" style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td>' +
                        '</tr>'
                    table.append(row)
                    end_count = 0
                    $('#end').html(end_count)
                    $('#start').html(0)
                    pageButtons(data.pages)
                }
                $('a[href="#file_log_detail"]').on('click', function(){
                    $.post('/file_log_ag/detail',{id: $(this).attr('data-value')}).done(function(result){
                        $('span#file_name').html(result[0].name_file);
                        if (result[0].name_file.slice(-4).includes(".")){
                            $('span#file_extension').html(result[0].name_file.slice(-4));
                        }else{
                            $('span#file_extension').html(result[0].name_file.slice(-5));
                        } 
                        $('span#file_size').html(convert_size(result[0].size));
                        $('span#file_edit_date').html(convert_datetime(new Date(result[0]._get), result[0]._get));
                    })
                })
            }
        })
    }
    creteTableContent();
    $('button:button#btn-search').click(function(){ 
        /* have two method 
            1). send id and get someone same id. or
            2). send same search normal input and get same all this.
         */
        let input = $('input[name="search"]');
        if (input.val() === ""){
            input.css({ 'border-stype': 'soild', 'border-color': 'red' });
        }else{
            selectSearch("file", input.val(), null);
        }
    });
    $('a#refresh-cw').click(function(){
        $('input[name="search"]').val('');
        $('input[name="search"]').css({ 'border-stype': '', 'border-color': '' });
        $('tbody#table-body').empty();
        $('span#start-file').empty();
        $('span#end-file').empty();
        $('span#total-file').empty();
        $('ul#pagination-wapper').empty();
        creteTableContent();
    })
}
else if (document.getElementById('logger_hash_ag')) {
    $('input[name="search"]').on('change keyup keydown', function(){
        searchData('log', $(this).val(), null);
    })
    const createTableContent = () =>{
        $.post('/logger_ag').done(function(result){
            if (result.hash.length > 0) {
                // ============================== Create Prepare ============================
                var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                var state = {
                    'querySet': result.hash,
                    'page': 1,
                    'rows': 20,
                    'window': 10,
                }
                buildTable()
                function pagination(querySet, page, rows) {
                    var trimStart = (page - 1) * rows
                    var trimEnd = trimStart + rows
                    var trimmedData = querySet.slice(trimStart, trimEnd)
                    var pages = Math.ceil(querySet.length / rows);
                    var start_count = 1
                    document.getElementById('start-hash').innerHTML = start_count
                    return {
                        'querySet': trimmedData,
                        'pages': pages,
                    }
                }
                // ============================== Create Pagination ============================
                function pageButtons(pages) {
                    var wrapper = document.getElementById('pagination-wapper')
                    wrapper.innerHTML = ``
                    var maxLeft = (state.page - Math.floor(state.window / 2))
                    var maxRight = (state.page + Math.floor(state.window / 2))
                    if (maxLeft < 1) {
                        maxLeft = 1
                        maxRight = state.window
                    }
                    if (maxRight > pages) {
                        maxLeft = pages - (state.window - 1)
                        if (maxLeft < 1) {
                            maxLeft = 1
                        }
                        maxRight = pages
                    }
                    for (var page = maxLeft; page <= maxRight; page++) {
                        wrapper.innerHTML += `<li class="page-item"><button class="page page-link" value=${page}>${page}</button></li>`
                    }
                    if (state.page == 1) {
                        wrapper.innerHTML = `<li class="page-item disabled"><button value=${1} class="page page-link" >&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                    } else {
                        wrapper.innerHTML = `<li class="page-item"><button value=${1} class="page page-link">&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                    }
                    if (state.page != pages) {
                        wrapper.innerHTML += `<li class="page-item"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                    } else {
                        wrapper.innerHTML += `<li class="page-item disabled"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                    }
                    $('.page').on('click', function () {
                        $('#table-body').empty()
                        state.page = Number($(this).val())
                        buildTable()
                    })
                }
                // ============================== Create Table ============================
                function buildTable() {
                    var table = $('#table-body')
                    var data = pagination(state.querySet, state.page, state.rows)
                    var myList = data.querySet
                    for (y in myList) {
                        if(state.page == 1){
                            if (myList[y].id != "") {
                                //Keep in mind we are using "Template Litterals to create rows"
                                var row = '<tr>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                    '</b> <span class="tablesaw-cell-content">' + myList[y].id + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่ออุปกรณ์ที่ส่งมา</b> <span class="tablesaw-cell-content">' + myList[y].device_name + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ระบบปฏิบัติการ</b> <span class="tablesaw-cell-content">' + myList[y].os_name + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ที่อยู่ของไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].path + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].name_file + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">รายละเอียด</b> <span class="tablesaw-cell-content"><a id="' + result.id_hash[y].id + '" href="javascript:void(0)" onclick="detail(this.id)" class="text-info" data-bs-toggle="modal" data-bs-target="#detail-hash"><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                    '</tr>'
                                table.append(row)
                                end_count = myList[y].id
                            } else {
                                var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty" style="color: red;">ไม่ข้อมูล</td></tr>'
                                table.append(row)
                            }    
                        }else{
                            if (myList[y].id != "") {
                                //Keep in mind we are using "Template Litterals to create rows"
                                var row = '<tr>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                    '</b> <span class="tablesaw-cell-content">' + myList[y].id + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ชื่ออุปกรณ์ที่ส่งมา</b> <span class="tablesaw-cell-content">' + myList[y].device_name + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ระบบปฏิบัติการ</b> <span class="tablesaw-cell-content">' + myList[y].os_name + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ที่อยู่ของไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].path + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ชื่อไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].name_file + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">รายละเอียด</b> <span class="tablesaw-cell-content"><a id="' + result.id_hash[parseInt(state.rows)+parseInt(y)].id + '" href="javascript:void(0)" onclick="detail(this.id)" class="text-info" data-bs-toggle="modal" data-bs-target="#detail-hash"><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                    '</tr>'
                                table.append(row)
                                end_count = myList[y].id
                            } else {
                                var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                table.append(row)
                            }
                        }
                    }
                    $('#end-hash').html(end_count)
                    if(myList.length > 0){
                        if (myList[0].id != "") {
                            $('#start-hash').html(myList[0].id)
                        } else {
                            $('#start-hash').html(0)
                        }
                    }
                    pageButtons(data.pages)
                }
            } else {
                var table = $('#table-body')
                var row = '<tr>' +
                    '<td class="text-center" colspan="6" style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td>' +
                    '</tr>'
                table.append(row)
                end_count = 0
                $('#end').html(end_count)
                $('#start').html(0)
                pageButtons(data.pages)
            }
        })
    }
    createTableContent();
    $('button:button#btn-search').click(function(){
        /* have two method 
            1). send id and get someone same id. or
            2). send same search normal input and get same all this.
         */
        let input = $('input[name="search"]');
        if (input.val() === ""){
            input.css({ 'border-stype': 'soild', 'border-color': 'red' });
        }else{
            selectSearch("log", input.val(), null);
        }
    })
    $('a#refresh-cw').click(function(){
        $('input[name="search"]').val('');
        $('input[name="search"]').css({ 'border-stype': '', 'border-color': '' });
        $('tbody#table-body').empty();
        $('span#start-hash').empty();
        $('span#end-hash').empty();
        $('span#total-hash').empty();
        $('ul#pagination-wapper').empty();
        createTableContent();
    })
    function detail(id) {
        $.ajax({
            method: "POST",
            url: "/logger_ag/select",
            data: { id: id },
            success: function (result) {
                $('#header').html("ข้อมูลของ: " + result.hash[0].device_name + ",<br/>" + result.hash[0].name_file)
                $('#size_logger_ag').html(result.hash[0].total_line)
                $('#recording_time_logger_ag').html(result.hash[0].date_now)
                if (result.sys[0].view_hash_log_export === "md5"){
                    $('span#type_hash').text("MD5")
                    $('#hash_value_logger_ag').html(result.hash[0].value_md5)
                }else if (result.sys[0].view_hash_log_export === "sha1"){
                    $('span#type_hash').text("SHA-1")
                    $('#hash_value_logger_ag').html(result.hash[0].value_sha1)
                }else{
                    $('span#type_hash').text("SHA-256")
                    $('#hash_value_logger_ag').html(result.hash[0].value)
                }
            }
        })
    }
}
else if (document.getElementById('database_ag')) {
    $('select#from_client').change(checkFrom);
    $('tbody#table-body').html('<tr><td style="color: orange;" colspan="13" class="text-center">กรุณาเลือก</td></tr>')
    function checkFrom(){
        $('input[name=search]').val("");
        $('tbody#table-body').empty()
        $('tr#tr_header').html(`<th data-tablesaw-sortable-col data-tablesaw-sortable-default-col data-tablesaw-priority="0" class="border" style="width: 5%;"> ลำดับ </th>`)
        const value = $('select#from_client option:selected').val()
        $.ajax({
            method: "POST",
            url: "/database_ag/select",
            data: { value: value },
            success: function (result) {
                const setHead = (a, i) =>{
                    if(i == a.length+2) {
                        return -1
                    }else if (i+1 == a.length+2){
                        $('tr#tr_header').append(`
                        <td data-tablesaw-sortable-col data-tablesaw-sortable-default-col data-tablesaw-priority="${i+1}" class="border"> ตัวเลือก </td>
                        `)
                        return setHead(a, (i+1))
                    }else if (i+2 == a.length+2){
                        $('tr#tr_header').append(`
                        <td data-tablesaw-sortable-col data-tablesaw-sortable-default-col data-tablesaw-priority="${i+1}" class="border"> วัน/เวลาที่บันทึก </td>
                        `)
                        return setHead(a, (i+1))
                    }else{
                        $('tr#tr_header').append(`
                        <td data-tablesaw-sortable-col data-tablesaw-sortable-default-col data-tablesaw-priority="${i+1}" class="border"> ${a[i]} </td>
                            `)
                        return setHead(a, (i+1))
                    }
                }
                setHead(result.column, 0)
                const tagTd = (d, c, j, b, i) =>{
                    if (j == Object.keys(d).length+1) {
                        return b
                    }else if(j+1 == Object.keys(d).length+1){
                        b.push(`<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist"><b class="tablesaw-cell-label"> ${j+1} </b> <span class="tablesaw-cell-content"> <a href="#" id="${i}:${d['id']}" onclick="_delete(this.id)" class="text-danger" data-bs-toggle="modal" data-bs-target="#delete"><i class="fas fa-trash-alt fa-2x"></i></a> </span></td>`)
                        return tagTd(d, c, (j+1), b, i)
                    }else if(j+2 == Object.keys(d).length+1){
                        b.push(`<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist"><b class="tablesaw-cell-label"> ${j+1} </b> <span class="tablesaw-cell-content"> ${convert_datetime(new Date(d['_get']), d['_get'])} </span></td>`)
                        return tagTd(d, c, (j+1), b, i)
                    }else if(j == 0){
                        b.push(`<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist"><b class="tablesaw-cell-label"> ${j+1} </b> <span class="tablesaw-cell-content"> ${d['id']} </span></td>`)
                        return tagTd(d, c, (j+1), b, i)
                    }else{
                        if (d[c[j-1]].length > 50){
                            b.push(`<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist"><b class="tablesaw-cell-label"> ${j+1} </b> <span class="tablesaw-cell-content"> ${d[c[j-1]].substring(0, d[c[j-1]].length/2)}<br/>${d[c[j-1]].substring(d[c[j-1]].length/2)} </span></td>`)
                        }else if (d[c[j-1]].includes('-') && d[c[j-1]].includes(':') && d[c[j-1]].length == 19){
                            b.push(`<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist"><b class="tablesaw-cell-label"> ${j+1} </b> <span class="tablesaw-cell-content"> ${convert_datetime(new Date(d[c[j-1]]), d[c[j-1]])} </span></td>`)
                        }else{
                            b.push(`<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist"><b class="tablesaw-cell-label"> ${j+1} </b> <span class="tablesaw-cell-content"> ${d[c[j-1]]} </span></td>`)
                        }
                        return tagTd(d, c, (j+1), b, i)
                    }
                } 
                const rowAll = (t, r, i) => {
                    if(i == r.length) return -1
                    t.append("<tr>"+r+"</tr>")
                }
                if (result.data.length > 0) {
                    // ============================== Create Prepare ============================
                    var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                    var state = {
                        'querySet': result.data,
                        'page': 1,
                        'rows': 10,
                        'window': 10,
                    }
                    buildTable()
                    function pagination(querySet, page, rows) {
                        var trimStart = (page - 1) * rows
                        var trimEnd = trimStart + rows
                        var trimmedData = querySet.slice(trimStart, trimEnd)
                        var pages = Math.ceil(querySet.length / rows);
                        var start_count = 1
                        document.getElementById('start').innerHTML = start_count
                        return {
                            'querySet': trimmedData,
                            'pages': pages,
                        }
                    }
                    // ============================== Create Pagination ============================
                    function pageButtons(pages) {
                        var wrapper = document.getElementById('pagination-wapper')
                        wrapper.innerHTML = ``
                        var maxLeft = (state.page - Math.floor(state.window / 2))
                        var maxRight = (state.page + Math.floor(state.window / 2))
                        if (maxLeft < 1) {
                            maxLeft = 1
                            maxRight = state.window
                        }
                        if (maxRight > pages) {
                            maxLeft = pages - (state.window - 1)
                            if (maxLeft < 1) {
                                maxLeft = 1
                            }
                            maxRight = pages
                        }
                        for (var page = maxLeft; page <= maxRight; page++) {
                            wrapper.innerHTML += `<li class="page-item"><button class="page page-link" value=${page}>${page}</button></li>`
                        }
                        if (state.page == 1) {
                            wrapper.innerHTML = `<li class="page-item disabled"><button value=${1} class="page page-link" >&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                        } else {
                            wrapper.innerHTML = `<li class="page-item"><button value=${1} class="page page-link">&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                        }
                        if (state.page != pages) {
                            wrapper.innerHTML += `<li class="page-item"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                        } else {
                            wrapper.innerHTML += `<li class="page-item disabled"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                        }
                        $('.page').on('click', function () {
                            $('#table-body').empty()
                            state.page = Number($(this).val())
                            buildTable()
                        })
                    }
                    // ============================== Create Table ============================
                    function buildTable() {
                        var table = $('#table-body')
                        var data = pagination(state.querySet, state.page, state.rows)
                        var myList = data.querySet
                        for (const y in myList) {
                            if(state.page == 1){
                                if (myList[y].id != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    rowAll(table, tagTd(myList[y], result.column, 0, [], result.id[y].id), 0)
                                    end_count = myList[y].id
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="'+ result.column +'" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            }else{
                                if (myList[y].id != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    rowAll(table, tagTd(myList[y], result.column, 0, [], result.id[parseInt(state.rows)+parseInt(y)].id), 0)
                                    end_count = myList[y].id
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="'+ result.column +'" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            }
                        }
                        $('#end').html(end_count)
                        if(myList.length > 0){
                            if (myList[0].id != "") {
                                $('#start').html(myList[0].id)
                            } else {
                                $('#start').html(0)
                            }
                        }
                        $('#total-db').html(result.data.length);
                        pageButtons(data.pages)
                        $('button#button_delete_db').on('click',function(){
                            document.getElementById('form_db_delete').action = "/database_ag/delete"+$(this).attr('data-value')
                            document.getElementById('form_db_delete').submit();
                        })
                    }
                } else {
                    var table = $('#table-body')
                    var row = '<tr>' +
                        `<td class="text-center" colspan="${result.column.length}" style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td>` +
                        '</tr>'
                    table.append(row)
                    end_count = 0
                    $('#end').html(end_count)
                    $('#start').html(0)
                    pageButtons(data.pages)
                }
            }
        })
    }
    $('input[name=search]').on('change keyup keydown', function(){
        searchData('db', $(this).val(), $('select#from_client').find(":selected").val());
    })
    $('button:button#btn-search').click(function(){
        // select search here not same other agent. by if cannot select can't search.
        let input = $('input[name="search"]');
        if (input.val() === ""){
            input.css({ 'border-stype': 'soild', 'border-color': 'red' });
        }else{
            selectSearch("db", input.val(), $('select#from_client').find(":selected").val());
        }
    })
    $('a#refresh-cw').click(function(){
        const checkLenOne = (t) =>{
            if (t.children()[0].querySelectorAll('td').innerHTML !== "กรุณาเลือก"){
                return true
            }else if(t.children()[0].querySelectorAll('tr')){
                return true
            }else{
                return false
            }
        }
        if( $('tbody#table-body').children().length !== 1 || checkLenOne($('tbody#table-body'))){
            $('input[name="search"]').css({ 'border-stype': '', 'border-color': '' });
            checkFrom();
        }else{
            $('div#err-search').css({'overflow-y': "auto", 'display': ""});
            $('button:button#btn-err').click(function(){
                $('div#err-search').css('display', 'none');
            });
        }
    })
    function _delete(value) {
        const id = value.split(":")[0]
        const no = value.split(":")[1]
        $.ajax({
            method: "POST",
            url: "/database_ag/selectDel",
            data: { id: id },
            success: function (result) {
                $('span#header').html("ยืนยันการลบข้อมูล")
                $('span#db_no').html(no)
                const display = (d, c, j) =>{
                    if (j == Object.keys(d).length) return -1
                    if (j+1 == Object.keys(d).length){
                        $('table#_delete_').append(`<tr><th style="text-align: left; width: 30%;">วัน/เวลาที่บันทึก</th><td style="text-align: left;"><span>${convert_datetime(new Date(d['_get']), d['_get'])}</span></td></tr>`)
                    }else if (d[c[j]].includes('-') && d[c[j]].includes(':')){
                        $('table#_delete_').append(`<tr><th style="text-align: left; width: 30%;">${c[j]}</th><td style="text-align: left;"><span>${convert_datetime(new Date(d[c[j]]), d[c[j]])}</span></td></tr>`)
                    }else{
                        $('table#_delete_').append(`<tr><th style="text-align: left; width: 30%;">${c[j]}</th><td style="text-align: left;"><span>${d[c[j]]}</span></td></tr>`)
                    }
                    return display(d, c, (j+1))
                }
                display(result.data[0], result.column, 0)
                $('button#button_delete_db').attr('data-value', result.id_data[0].id)
            }
        })
    }
}
else if (document.getElementById('a_index')) {
    $('input[name="search"]').on('change keyup keydown', function(){
        searchData('manage', $(this).val(), null);
    })
    // ==================== Table Show =========================
    const createTableContent = () => {
        $.post('/agent_manage').done(function(result){
            // ============================== Create Prepare ============================
            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
            var state = {
                'querySet': result.manage,
                'page': 1,
                'rows': 20,
                'window': 10,
            }
            buildTable()
            function pagination(querySet, page, rows) {
                var trimStart = (page - 1) * rows
                var trimEnd = trimStart + rows
                var trimmedData = querySet.slice(trimStart, trimEnd)
                var pages = Math.ceil(querySet.length / rows);
                var start_count = 1
                document.getElementById('start').innerHTML = start_count
                return {
                    'querySet': trimmedData,
                    'pages': pages,
                }
            }
            // ============================== Create Pagination ============================
            function pageButtons(pages) {
                var wrapper = document.getElementById('pagination-wapper')
                wrapper.innerHTML = ``
                var maxLeft = (state.page - Math.floor(state.window / 2))
                var maxRight = (state.page + Math.floor(state.window / 2))
                if (maxLeft < 1) {
                    maxLeft = 1
                    maxRight = state.window
                }
                if (maxRight > pages) {
                    maxLeft = pages - (state.window - 1)

                    if (maxLeft < 1) {
                        maxLeft = 1
                    }
                    maxRight = pages
                }
                for (var page = maxLeft; page <= maxRight; page++) {
                    wrapper.innerHTML += `<li class="page-item"><button class="page page-link" value=${page}>${page}</button></li>`
                }
                if (state.page == 1) {
                    wrapper.innerHTML = `<li class="page-item disabled"><button value=${1} class="page page-link" >&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                } else {
                    wrapper.innerHTML = `<li class="page-item"><button value=${1} class="page page-link">&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                }
                if (state.page != pages) {
                    wrapper.innerHTML += `<li class="page-item"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                } else {
                    wrapper.innerHTML += `<li class="page-item disabled"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                }
                $('.page').on('click', function () {
                    $('#table-body').empty()

                    state.page = Number($(this).val())

                    buildTable()
                })
            }
            // ============================== Create Table ============================
            function buildTable() {
                var table = $('#table-body')
                var data = pagination(state.querySet, state.page, state.rows)
                var myList = data.querySet
                for (y in myList) {
                    if(state.page == 1){
                        if (myList[y].agm_id != "") {
                            let check = ""
                            if(myList[y].agm_status == 1){
                                check = "checked"
                            }
                            let fullname = result.account.filter(i => i.acc_id == myList[y].acc_id)
                            const last_log = (rs) => {
                                let selected = rs.filter(function(er){ if (er.agm_id === result.id_manage[y].agm_id){ return er } })
                                if(selected.length > 0 && selected.last_access){
                                    let date = new Date(selected[0].last_access)
                                    let time = selected[0].last_access.split("T").pop().split(":")
                                    let second = time[time.length - 1].split(".")
                                    return ("0" + date.getDate()).slice(-2)+"/"+("0" + (date.getMonth()+1)).slice(-2)+"/"+date.getFullYear()+" "+time[0]+":"+time[1]+":"+second[0]
                                }
                                return '<span style="color: red;"> - <span>'
                            }
                            //Keep in mind we are using "Template Litterals to create rows"
                            var row = '<tr>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                '</b> <span class="tablesaw-cell-content">' + myList[y].agm_id + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อกำกับการใช้งาน</b> <span class="tablesaw-cell-content">' + myList[y].agm_name + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">รหัสของ Agent</b> <span class="tablesaw-cell-content">' + myList[y].code + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อของ Agent</b> <span class="tablesaw-cell-content">' + myList[y].name + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">วันที่สร้าง</b> <span class="tablesaw-cell-content">' + convert_date(new Date(myList[y].agm_created)) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ผู้สร้าง</b> <span class="tablesaw-cell-content">' + fullname[0].firstname + " " + fullname[0].lastname + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">สถานะ</b> <span class="tablesaw-cell-content">' + last_log(result.history) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">เปิด/ปิดการใช้งาน</b> <span class="tablesaw-cell-content" > <div class=" form-check form-switch"> <input type="checkbox" name="agm_status" class="form-check-input" id="turnOffOn" data-value="'+result.id_manage[y].agm_id+'"'+ check +' /> </div> ' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ดูข้อมูล</b> <span class="tablesaw-cell-content"><a href="/detail_agent_manage/'+result.id_manage[y].agm_id+'" class="text-info" ><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">แก้ไขข้อมูล</b> <span class="tablesaw-cell-content"><a href="/edit_agent_manage/'+result.id_manage[y].agm_id+'" class="text-warning" ><i class="fas fa-pencil-alt fa-2x"></i></a></span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลบช้อมูล</b> <span class="tablesaw-cell-content"><a href="#delete_agent" data-value="'+result.id_manage[y].agm_id+'" data-index="'+myList[y].ags_id+'" class="text-danger" data-bs-toggle="modal" ><i class="fas fa-trash-alt fa-2x"></i></a></span></td>' +
                                '</tr>'
                            table.append(row)
                            end_count = myList[y].agm_id
                        } else {
                            var row = '<tr class="odd"><td valign="top" colspan="12" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                            table.append(row)
                        }
                    }else{
                        if (myList[y].agm_id != "") {
                            let check = ""
                            if(myList[y].agm_status == 1){
                                check = "checked"
                            }
                            const last_log = (rs) => {
                                let selected = rs.filter(function(er){ if (er.agm_id === result.id_manage[parseInt(state.rows)+parseInt(y)].agm_id){ return er } })
                                if(selected.length > 0){
                                    let date = new Date(selected[0]._get_)
                                    let time = selected[0]._get_.split("T").pop().split(":")
                                    let second = time[time.length - 1].split(".")
                                    return ("0" + date.getDate()).slice(-2)+"/"+("0" + (date.getMonth()+1)).slice(-2)+"/"+date.getFullYear()+" "+time[0]+":"+time[1]+":"+second[0]
                                }
                                return '<span style="color: red;"> - <span>'
                            }
                            let fullname = result.account.filter(i => i.acc_id == myList[y].acc_id)
                            var row = '<tr>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                '</b> <span class="tablesaw-cell-content">' + myList[y].agm_id + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อกำกับการใช้งาน</b> <span class="tablesaw-cell-content">' + myList[y].agm_name + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">รหัสของ Agent</b> <span class="tablesaw-cell-content">' + myList[y].code + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อของ Agent</b> <span class="tablesaw-cell-content">' + myList[y].name + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">วันที่สร้าง</b> <span class="tablesaw-cell-content">' + convert_date(new Date(myList[y].agm_created)) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ผู้สร้าง</b> <span class="tablesaw-cell-content">' + fullname[0].firstname + " " + fullname[0].lastname + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">สถานะ</b> <span class="tablesaw-cell-content">' + last_log(result.history) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">เปิด/ปิดการใช้งาน</b> <span class="tablesaw-cell-content"> <div class="form-check form-switch"> <input type="checkbox" class="form-check-input" name="agm_status" id="turnOffOn" data-value="'+result.id_manage[parseInt(state.rows)+parseInt(y)].agm_id+'"'+ check +' /></div>'+
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ดูข้อมูล</b> <span class="tablesaw-cell-content"><a href="/detail_agent_manage/'+result.id_manage[parseInt(state.rows)+parseInt(y)].agm_id+'" class="text-info" ><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">แก้ไขข้อมูล</b> <span class="tablesaw-cell-content"><a href="/edit_agent_manage/'+result.id_manage[parseInt(state.rows)+parseInt(y)].agm_id+'" class="text-warning" ><i class="fas fa-pencil-alt fa-2x"></i></a></span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลบช้อมูล</b> <span class="tablesaw-cell-content"><a href="#delete_agent" data-value="'+result.id_manage[parseInt(state.rows)+parseInt(y)].agm_id+'" data-index="'+myList[y].ags_id+'" class="text-danger" data-bs-toggle="modal" ><i class="fas fa-trash-alt fa-2x"></i></a></span></td>' +
                                '</tr>'
                            table.append(row)
                            end_count = myList[y].agm_id;
                        } else {
                            var row = '<tr class="odd"><td valign="top" colspan="12" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                            table.append(row)
                        }
                    }
                }
                $('#end').html(end_count)
                if(myList.length > 0){
                    if (myList[0].agm_id != "") {
                        $('#start').html(myList[0].agm_id)
                        $('#total-agent').html(result.id_manage.length)
                    } else {
                        $('#start').html(0)
                        $('#total-agent').html(0)
                    }
                }
                pageButtons(data.pages)
                if (myList.length == 0) {
                    var table = $('#table-body')
                    var row = '<tr>' +
                        '<td class="text-center" colspan="12" style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td>' +
                        '</tr>'
                    table.append(row)
                    end_count = 0
                    $('#end').html(end_count)
                    $('#start').html(0)
                    pageButtons(data.pages)
                }
                $('input:checkbox[name="agm_status"]').on('click', function(){
                    let value = $(this).attr('data-value');
                    if($(this).prop('checked')){
                        $.post(`/agent_manage/update/status${value}`,{value: "@lltr@@gentUp@teSt@tusM@n@ge", status: 1}).done(function(result){
                            window.location.replace = "/agent_manage/";
                        })
                    }else{
                        $.post(`/agent_manage/update/status${value}`,{value: "@lltr@@gentUp@teSt@tusM@n@ge", status: 0}).done(function(result){
                            window.location.replace = "/agent_manage/";
                        })
                    }
                })
                $('a[href="#delete_agent"]').on('click',function(){
                    let id = $(this).attr('data-value'); 
                    let index = $(this).attr('data-index');
                    $.post('/agent_manage/selectManage',{id: id, value: "@lltr@@gentSe1ectM@n@ge"}).done(function(result){
                        let res = result.manage;
                        let fullname = result.account.filter(i => i.acc_id == res[0].acc_id)
                        if(res.length > 0){
                            $('span#agent_manage_name').html(res[0].agm_name)
                            $('span#code_agent').html(res[0].code);
                            $('span#name_agent').html(res[0].name);
                            $('span#some_createdate').html(convert_datetime(new Date(res[0].agm_created), res[0].agm_created));
                            $('span#some_creator').html(fullname[0].firstname+" "+fullname[0].lastname);
                        }
                    })
                    $('button#button_delete_agent').on('click', function(){
                        document.getElementById('form_delete_agent').action = `/delete_agent_manage/${id}/${index}`
                        document.getElementById('form_delete_agent').submit();
                    })
                })
            }
        })
    }
    createTableContent();
    //ajaxLoading();
    $('button:button#btn-search').click(function(){
        /* have two method 
            1). send id and get someone same id. or
            2). send same search normal input and get same all this.
         */
        let input = $('input[name="search"]');
        if (input.val() === ""){
            input.css({ 'border-stype': 'soild', 'border-color': 'red' });
        }else{
            selectSearch("manage", input.val(), null);
        } 
    })
    $('a#refresh-cw').click(function(){
        $('input[name="search"]').val('');
        $('input[name="search"]').css({ 'border-stype': '', 'border-color': '' });
        $('tbody#table-body').empty();
        $('span#start').empty();
        $('span#end').empty();
        $('span#total-agent').empty();
        $('ul#pagination-wapper').empty();
        createTableContent();
    })
}
else if(document.getElementById('a-sniffer')){
    if ($('#table-body-sniffer').children().length == 0){
        $('#table-body-sniffer').append(`<tr><td class="text-center text-warning" colspan="5">กรุณาเลือกอุปกรณ์</td></tr>`);
    }   
    const checkFrom = (e) => {
        if (e === "Default"){
            $('select#path').on('change', function(){
                $('input[name="search"]').val('');
                $('input[name="search"]').css({ 'border-stype': '', 'border-color': '' });
                $('#table-body-sniffer').empty();
                $.post("/agent_sniffer",{value: "@lltr@@gentSn1ffer", fullpath: fullpath, dir: $(this).val()}).done(function(result){
                    // ============================== Create Prepare ============================
                    var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                    var state = {
                        'querySet': result.info,
                        'page': 1,
                        'rows': 20,
                        'window': 10,
                    }
                    buildTable()
                    function pagination(querySet, page, rows) {
                        var trimStart = (page - 1) * rows
                        var trimEnd = trimStart + rows
                        var trimmedData = querySet.slice(trimStart, trimEnd)
                        var pages = Math.ceil(querySet.length / rows);
                        var start_count = 1
                        document.getElementById('start-files').innerHTML = start_count
                        return {
                            'querySet': trimmedData,
                            'pages': pages,
                        }
                    }
                    // ============================== Create Pagination ============================
                    function pageButtons(pages) {
                        var wrapper = document.getElementById('pagination-wrapper-sniffer')
                        wrapper.innerHTML = ``
                        var maxLeft = (state.page - Math.floor(state.window / 2))
                        var maxRight = (state.page + Math.floor(state.window / 2))
                        if (maxLeft < 1) {
                            maxLeft = 1
                            maxRight = state.window
                        }
                        if (maxRight > pages) {
                            maxLeft = pages - (state.window - 1)

                            if (maxLeft < 1) {
                                maxLeft = 1
                            }
                            maxRight = pages
                        }
                        for (var page = maxLeft; page <= maxRight; page++) {
                            wrapper.innerHTML += `<li class="page-item"><button class="page page-link" value=${page}>${page}</button></li>`
                        }
                        if (state.page == 1) {
                            wrapper.innerHTML = `<li class="page-item disabled"><button value=${1} class="page page-link" >&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                        } else {
                            wrapper.innerHTML = `<li class="page-item"><button value=${1} class="page page-link">&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                        }
                        if (state.page != pages) {
                            wrapper.innerHTML += `<li class="page-item"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                        } else {
                            wrapper.innerHTML += `<li class="page-item disabled"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                        }
                        $('.page').on('click', function () {
                            $('#table-body-sniffer').empty()
                            state.page = Number($(this).val())
                            buildTable()
                        })
                    }
                    // ============================== Create Table ============================
                    function buildTable() {
                        var table = $('#table-body-sniffer')
                        var data = pagination(state.querySet, state.page, state.rows)
                        var myList = data.querySet
                        for (y in myList) {
                            if (myList[y].no != "") {
                                var row = '<tr>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่: </b> <span class="tablesaw-cell-content">' + myList[y].no + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].name + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">สกุลไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].extension + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ขนาดของไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].size + '</span></td>' +
                                    '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">รายละเอียด</b> <span class="tablesaw-cell-content"><a href="#detail_file" data-value="'+myList[y].name+myList[y].extension+'" class="text-info" data-bs-toggle="modal" ><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                    '</tr>'
                                table.append(row)
                                end_count = myList[y].no
                            } else {
                                var row = '<tr class="odd"><td valign="top" colspan="5" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                table.append(row)
                            }
                        }
                        $('#end-files').html(end_count)
                        if(myList.length > 0){
                            if (myList[0].no != "") {
                                $('#start-files').html(myList[0].no)
                                $('#total-files').html(result.info.length)
                            } else {
                                $('#start-files').html(0)
                                $('#total-files').html(0)
                            }
                        }
                        pageButtons(data.pages)

                        if (myList.length == 0) {
                            var table = $('#table-body-sniffer')
                            var row = '<tr>' +
                                '<td class="text-center" colspan="5" style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td>' +
                                '</tr>'
                            table.append(row)
                            end_count = 0
                            $('#end-files').html(end_count)
                            $('#start-files').html(0)
                            pageButtons(data.pages)
                        }
                        $('a[href="#detail_file"]').on('click', function(){
                            let value = $(this).attr('data-value')
                            $('span#detail-name').text(value)
                            $('span#inside-name').text(value)
                            result.data.forEach(i => {
                                if(i.name == value){
                                    $('textarea#detail-show').text(i.data)
                                }
                            })
                        })
                    }
                })
            })
        }else{
            $('input[name="search"]').val('');
            $('input[name="search"]').css({ 'border-stype': '', 'border-color': '' });
            $('#table-body-sniffer').empty();
            $.post("/agent_sniffer",{value: "@lltr@@gentSn1ffer", fullpath: fullpath, dir: $('select#path option:selected').val()}).done(function(result){
                // ============================== Create Prepare ============================
                var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                var state = {
                    'querySet': result.info,
                    'page': 1,
                    'rows': 20,
                    'window': 10,
                }
                buildTable()
                function pagination(querySet, page, rows) {
                    var trimStart = (page - 1) * rows
                    var trimEnd = trimStart + rows
                    var trimmedData = querySet.slice(trimStart, trimEnd)
                    var pages = Math.ceil(querySet.length / rows);
                    var start_count = 1
                    document.getElementById('start-files').innerHTML = start_count
                    return {
                        'querySet': trimmedData,
                        'pages': pages,
                    }
                }
                // ============================== Create Pagination ============================
                function pageButtons(pages) {
                    var wrapper = document.getElementById('pagination-wrapper-sniffer')
                    wrapper.innerHTML = ``
                    var maxLeft = (state.page - Math.floor(state.window / 2))
                    var maxRight = (state.page + Math.floor(state.window / 2))
                    if (maxLeft < 1) {
                        maxLeft = 1
                        maxRight = state.window
                    }
                    if (maxRight > pages) {
                        maxLeft = pages - (state.window - 1)

                        if (maxLeft < 1) {
                            maxLeft = 1
                        }
                        maxRight = pages
                    }
                    for (var page = maxLeft; page <= maxRight; page++) {
                        wrapper.innerHTML += `<li class="page-item"><button class="page page-link" value=${page}>${page}</button></li>`
                    }
                    if (state.page == 1) {
                        wrapper.innerHTML = `<li class="page-item disabled"><button value=${1} class="page page-link" >&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                    } else {
                        wrapper.innerHTML = `<li class="page-item"><button value=${1} class="page page-link">&#171; ย้อนกลับ</button></li>` + wrapper.innerHTML
                    }
                    if (state.page != pages) {
                        wrapper.innerHTML += `<li class="page-item"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                    } else {
                        wrapper.innerHTML += `<li class="page-item disabled"></i><button value=${pages} class="page page-link" >ถัดไป &#187;</button>`
                    }
                    $('.page').on('click', function () {
                        $('#table-body-sniffer').empty()
                        state.page = Number($(this).val())
                        buildTable()
                    })
                }
                // ============================== Create Table ============================
                function buildTable() {
                    var table = $('#table-body-sniffer')
                    var data = pagination(state.querySet, state.page, state.rows)
                    var myList = data.querySet
                    for (y in myList) {
                        if (myList[y].no != "") {
                            var row = '<tr>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่: </b> <span class="tablesaw-cell-content">' + myList[y].no + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ชื่อไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].name + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">สกุลไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].extension + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ขนาดของไฟล์</b> <span class="tablesaw-cell-content">' + myList[y].size + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">รายละเอียด</b> <span class="tablesaw-cell-content"><a href="#detail_file" data-value="'+myList[y].name+myList[y].extension+'" class="text-info" data-bs-toggle="modal" ><i class="fas fa-file-alt fa-2x"></i></a></span></td>' +
                                '</tr>'
                            table.append(row)
                            end_count = myList[y].no
                        } else {
                            var row = '<tr class="odd"><td valign="top" colspan="5" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                            table.append(row)
                        }
                    }
                    $('#end-files').html(end_count)
                    if(myList.length > 0){
                        if (myList[0].no != "") {
                            $('#start-files').html(myList[0].no)
                            $('#total-files').html(result.info.length)
                        } else {
                            $('#start-files').html(0)
                            $('#total-files').html(0)
                        }
                    }
                    pageButtons(data.pages)

                    if (myList.length == 0) {
                        var table = $('#table-body-sniffer')
                        var row = '<tr>' +
                            '<td class="text-center" colspan="5" style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td>' +
                            '</tr>'
                        table.append(row)
                        end_count = 0
                        $('#end-files').html(end_count)
                        $('#start-files').html(0)
                        pageButtons(data.pages)
                    }
                    $('a[href="#detail_file"]').on('click', function(){
                        let value = $(this).attr('data-value')
                        $('span#detail-name').text(value)
                        $('span#inside-name').text(value)
                        result.data.forEach(i => {
                            if(i.name == value){
                                $('textarea#detail-show').text(i.data)
                            }
                        })
                    })
                }
            })
        }
    }
    checkFrom("Default");
    $('input[name="search"]').on('change keyup keydown', function(){
        searchData('sniffer', $(this).val(), `${fullpath}${$('select#path').find(":selected").val()}`);
    })
    $('button:button#btn-search').click(function(){
        // select search here not same other agent. by if cannot select can't search.
        let input = $('input[name="search"]');
        if (input.val() === ""){
            input.css({ 'border-stype': 'soild', 'border-color': 'red' });
        }else{
            selectSearch("sniffer", input.val(), `${fullpath}${$('select#path').find(":selected").val()}/`);
        }
    })
    $('a#refresh-cw').click(function(){
        const checkLenOne = (t) =>{
            if (t.children()[0].querySelectorAll('td')[0].querySelectorAll('span')[0].innerHTML !== "กรุณาเลือกอุปกรณ์"){
                return true
            }else{
                return false
            }
        }
        if( $('tbody#table-body-sniffer').children().length !== 1 || checkLenOne($('tbody#table-body-sniffer'))){
            $('input[name="search"]').css({ 'border-stype': '', 'border-color': '' });
            checkFrom('Reset');
        }else{
            $('div#err-search').css({'overflow-y': "auto", 'display': ""});
            $('button:button#btn-err').click(function(){
                $('div#err-search').css('display', 'none');
            });
        }
    })
}
