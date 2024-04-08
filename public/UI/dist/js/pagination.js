console.log(document.getElementById('micro_block'))
if(document.getElementById('micro_block')){
    $.ajax({
        url: '/micro_block',
        method: "POST",
        data: { get_param: 1 },
        success: function (result) {
            function convert_timestamp(timestamp) {
                let date = new Date(parseInt(timestamp));
                let month = date.getMonth() + 1;
                let day = date.getDate();
                let hours = date.getHours();
                let minutes = date.getMinutes();
                if(String(month).length == 1){
                    month = "0"+String(month)
                }
                if(String(day).length == 1){
                    day = "0"+String(day)
                }
                if(String(hours).length == 1){
                    hours = "0"+String(hours)
                }
                if(String(minutes).length == 1){
                    minutes = "0"+String(minutes)
                }
                return (day + "/" + month + "/" + date.getFullYear() + " " + hours + ":" + minutes)
            }
            function convert_datetime(local){
                let date = new Date(local);
                let month = date.getMonth() + 1;
                let day = date.getDate();
                let hours = date.getHours();
                let minutes = date.getMinutes();
                if(String(month).length == 1){
                    month = "0"+String(month)
                }
                if(String(day).length == 1){
                    day = "0"+String(day)
                }
                if(String(hours).length == 1){
                    hours = "0"+String(hours)
                }
                if(String(minutes).length == 1){
                    minutes = "0"+String(minutes)
                }
                return (day + "/" + month + "/" + date.getFullYear() + " " + hours + ":" + minutes)
            }
            //Start Page
            $('tbody#table-body').append(`
                <tr>
                    <td colspan="5" style="color: orange; text-align: center;">กรุณาเลือก</td>
                </tr>
            `)
            $('span#start').text(0)
            $('span#end').text(0)
            $('span#total').text(0)
            $('#blocks').on('change', function () {
                // ============================== Create Object ============================
                var selectFactory = $(this).val();
                var block = result.blocks.filter(function(item){ return item.name == selectFactory });
                var history = result.historys.filter(function(item){ return item.name == selectFactory });
                var mix = [];
                if(history.length == 0){
                    mix.push({"no": 1, "name": block[0].list[0], "status": "Inprogress", "time": convert_datetime(new Date()) })
                }else{
                    for(var i = history[0].status.length -1; i > -1; i-- ){
                        let get_history = history[0].status[i].split(",")
                        if(get_history.length > 1){
                            mix.push({"no": history[0].status.length - parseInt(i), "name": block[0].list[i], "status": get_history[0], "time": convert_timestamp(get_history[1]) })
                        }else{
                            mix.push({"no": history[0].status.length - parseInt(i), "name": block[0].list[i], "status": get_history[0], "time": convert_datetime(new Date()) })
                        }
                    }
                }
                // ============================== Create Prepare ============================
                var end_count = 0
                var total = 0

                var state = {
                    'querySet': mix,
                    'page': 1,
                    'rows': 10,
                    'window': 128*1024,
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
                    var wrapper = document.getElementById('pagination-wrapper')
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

                    if (state.page > 1) {
                        wrapper.innerHTML = `<li class="page-item"><button value=${state.page - 1} class="page page-link"> ย้อนกลับ</button></li>`
                    } else {
                        wrapper.innerHTML = `<li class="page-item disabled"><button value=${state.page - 1} class="page page-link" > ย้อนกลับ</button></li>`
                    }


                    num = 1
                    if (maxRight > 5) {
                        if (state.page > (maxRight / 2)) {
                            if ((state.page + 1) > (maxRight / 2)) {
                                wrapper.innerHTML += '<li class="page-item"><button class="page page-link" value=1>1</button></li>';
                                wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
                            }
                        }
                        for (var page = maxLeft; page <= maxRight; page++) {
                            if ((page >= state.page - 2) && (page <= state.page + 2)) {
                                if (page == state.page) {
                                    wrapper.innerHTML += `<li class="page-item active"><button class="page page-link" value=${page}>${page}</button></li>`;
                                }
                                else {
                                    p = page - 1;
                                    wrapper.innerHTML += `<li class="page-item "><button class="page page-link" value=${page}>${page}</button></li>`;
                                }
                            }
                        }
                        if ((state.page) <= (maxRight / 2)) {
                            mp = maxRight - 1;
                            wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
                            wrapper.innerHTML += '<li class="page-item "><button class="page page-link" value=' + maxRight + '>' + maxRight + '</button></li>';
                        }
                    }
                    else {
                        for (var page = maxLeft; page <= maxRight; page++) {
                            if (state.page == page) {
                                wrapper.innerHTML += `<li class="page-item active"><button class="page page-link" value=${page}>${page}</button></li>`
                            } else {
                                wrapper.innerHTML += `<li class="page-item "><button class="page page-link" value=${page}>${page}</button></li>`
                            }
                        }
                    }

                    if (state.page < pages) {
                        wrapper.innerHTML += `<li class="page-item"></i><button value=${state.page + 1} class="page page-link" >ถัดไป </button>`
                    } else {
                        wrapper.innerHTML += `<li class="page-item disabled"></i><button value=${state.page + 1} class="page page-link" >ถัดไป </button>`
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
                    table.empty()
                    if(myList.length == 1){
                        var row = '<tr>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" style="text-align: center;"><b class="tablesaw-cell-label">ลำดับที่:' +
                            '</b> <span class="tablesaw-cell-content">' + myList[0].no + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" style="text-align: center;"><b class="tablesaw-cell-label" style="width:90%;">ชื่อล็อกไฟล์:</b> <span class="tablesaw-cell-content">' + myList[0].name + '</span></td>' +
                            // '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" style="text-align: center;"><b class="tablesaw-cell-label">วันที่/เวลา (เริ่ม):</b> <span class="tablesaw-cell-content">' + myList[y].time_start + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" style="text-align: center;"><b class="tablesaw-cell-label">ความน่าเชื่อถือ:</b> <span class="tablesaw-cell-content"><span style="color:gold;">'+myList[0].status+'</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" style="text-align: center;"><b class="tablesaw-cell-label">วันที่/เวลา (ของความเชื่อถือ):</b> <span class="tablesaw-cell-content">' + myList[0].time + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" style="text-align: center;"><b class="tablesaw-cell-label">ตรวจสอบ:</b> <span class="tablesaw-cell-content"><a href="/micro_block/' + myList[0].name + '" class="btn btn-rounded btn-info">ข้อมูลเชน</a></span></td>' +
                            '</tr>'
                        table.append(row)
                        end_count = 1
                        total = myList.length
                    }
                    if(myList.length > 1){
                        for (y in myList) {
                            let status;
                            if (myList[y].status == 'Inprogress'){
                                status = "<span style='color: gold;'>"+myList[y].status+"</span>" 
                            }else if (myList[y].status == 'Accept'){
                                status = "<span style='color: seagreen;'>"+myList[y].status+"</span>"
                            }else if(myList[y].status == "Reject"){
                                status = "<span style='color: red;'>"+myList[y].status+"</span>"
                            }
                            var row = '<tr>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" style="text-align: center;"><b class="tablesaw-cell-label">ลำดับที่:' +
                                '</b> <span class="tablesaw-cell-content">' + myList[y].no + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" style="text-align: center;"><b class="tablesaw-cell-label" style="width:90%;">ชื่อล็อกไฟล์:</b> <span class="tablesaw-cell-content">' + myList[y].name + '</span></td>' +
                                // '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" style="text-align: center;"><b class="tablesaw-cell-label">วันที่/เวลา (เริ่ม):</b> <span class="tablesaw-cell-content">' + myList[y].time_start + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" style="text-align: center;"><b class="tablesaw-cell-label">ความน่าเชื่อถือ:</b> <span class="tablesaw-cell-content">'+ status +'</td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" style="text-align: center;"><b class="tablesaw-cell-label">วันที่/เวลา (ของความเชื่อถือ):</b> <span class="tablesaw-cell-content">' + myList[y].time + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" style="text-align: center;"><b class="tablesaw-cell-label">ตรวจสอบ:</b> <span class="tablesaw-cell-content"><a href="/micro_block/' + myList[y].name + '" class="btn btn-rounded btn-info">ข้อมูลเชน</a></span></td>' +
                                '</tr>'
                            table.append(row)
                            end_count = myList[y].no
                            total = myList.length
                        }
                    }        
                    $('#end').html(end_count)
                    if(myList.length == 1){
                        $('#start').html(1)
                    }else{
                        $('#start').html(myList[0].no)
                    }
                    $('#total').html(total)
                    pageButtons(data.pages)
                }      
            })
        }
    })
}
