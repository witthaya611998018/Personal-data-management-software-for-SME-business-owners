
var policy = []; // เก็บ เอกสาร policy ที่ดึงมาจาก api
var new_process = []; // เก็บ กิจกรรมประมวลผล ที่ดึงมาจาก api
var data_new = []; // เก็บข้อมูลที่เเก้ไขเเล้ว
var supervisor = [] // ผู้ดูแลข้อมูลหรือผู้ดูแลระบบหรือผู้ควบคุมมาตราการ
var doc_id_select = []; //  เก็บข้อมูล เอกสาร policy 
var data_set_found = []; // เก็บเลขของข้อมูลมาตราการ


async function fetchData() {
    try {
        let result = await $.ajax({
            type: "GET",
            url: "/api/measures/doc/list",
        });
        policy.push([...result.doc]);
        new_process.push([...result.process]);
        result = await $.ajax({
            type: "GET",
            url: "/api/account/list",
        });
        supervisor.push(result);
    } catch (e) {
        console.log(e);
    }
} fetchData();


// ================================ Data Format =================================
function convert_date(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month.toString().length == 1) {
        month = "0" + month.toString()
    }
    if (day.toString().length == 1) {
        day = "0" + day.toString()
    }
    return day.toString() + "/" + month.toString() + "/" + date.getFullYear()
}
Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}
function getDates(startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(currentDate)
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}
function date_diff(date, total) {
    var dateArray = getDates(new Date(date), (new Date()).addDays(total));
    return dateArray[dateArray.length - 1]
}
function convert_datetime(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    if (month.toString().length == 1) {
        month = "0" + month.toString()
    }
    if (day.toString().length == 1) {
        day = "0" + day.toString()
    }
    if (hours.toString().length == 1) {
        hours = "0" + hours.toString()
    }
    if (minutes.toString().length == 1) {
        minutes = "0" + minutes.toString()
    }
    if (seconds.toString().length == 1) {
        seconds = "0" + seconds.toString()
    }
    return day.toString() + "/" + month.toString() + "/" + date.getFullYear() + " " + hours.toString() + ":" + minutes.toString() + ":" + seconds.toString()
}
function checkUsers(all, name, index) {
    if (all[index] == name) {
        return true
    } else {
        if (all.length - 1 == index) {
            return false
        }
        return checkUsers(all, name, (index + 1))
    }
}
function getColorCode() {
    let color = "#";
    for (let i = 0; i < 3; i++) {
        if (document.getElementById('theme-view').checked == true) {
            color += ("0" + Math.floor(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
        } else {
            color += ("0" + Math.floor(Math.random() * Math.pow(16, 2) / 2).toString(16)).slice(-2);
        }
    }
    if (color == '#000000' || color == "#ffffff" || color == "#2C323E" || color == "#363d4a") {
        return getColorCode()
    } else {
        return color;
    }
}


// API in pages
if (document.getElementById('c_index')) {
    // ================================ Data Format =================================
    var date_now = new Date();
    $('#start_time').val(convert_date(date_now));
    // ================================ Statics =====================================
    var convert1 = $('#bar1').text().split('%')
    $('#progress-bar1').css({ 'width': $('#bar1').text(), 'height': '6px' })
    $('#progress-bar1').attr('aria-valuenow', convert1[0])
    var convert2 = $('#bar2').text().split('%')
    $('#progress-bar2').css({ 'width': $('#bar2').text(), 'height': '6px' })
    $('#progress-bar2').attr('aria-valuenow', convert2[0])
    var convert3 = $('#bar3').text().split('%')
    $('#progress-bar3').css({ 'width': $('#bar3').text(), 'height': '6px' })
    $('#progress-bar3').attr('aria-valuenow', convert3[0])
    // ======================== Convert Bytes to GB ==================================
    var convert_gb = parseInt($('#diskSpace').text()) * (10 ** (-9))
    $('#diskSpace').text(convert_gb.toFixed(0))
    // ======================== Build Table Classification ===========================
    $.ajax({
        url: "/classification",
        method: "POST",
        data: { value: "@lltr@Cl@ssific@ti0n" },
        success: function (result) {
            console.log(result);
            let text = ''
            if (result.limit.classification === -1 || result.classify.length < result.limit.classification) {
                text = `
                <a href="/classification/new" class="btn btn-success px-4">
                                        <i class="fas fa-plus"></i>
                                        เพิ่มรูปแบบการประมวลผลข้อมูล
                                    </a>
                `
            } else {
                text = `
                <button class="btn btn-success px-4" disabled>
                <i class="fas fa-plus"></i>
                เพิ่มรูปแบบการประมวลผลข้อมูล
            </button>
                `
            }
            document.getElementById('limit').innerHTML = text
            // ============================== Create Prepare ============================
            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

            var state = {
                'querySet': result.classify,
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
                console.log(myList);

                for (y in myList) {
                    if (myList[y].classify_id != "" && state.page == 1) {
                        //Keep in mind we are using "Template Litterals to create rows"
                        var row = '<tr>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ลำดับที่:' +
                            '</b> <span class="tablesaw-cell-content">' + myList[y].classify_id + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ชื่อประเภท</b> <span class="tablesaw-cell-content">' + myList[y].classify_name + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" style="width:250px"><b class="tablesaw-cell-label">ข้อมูลที่แยกประเภท</b> <span class="tablesaw-cell-content">' + result.classify_data_name[y] + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">วันที่สร้าง</b> <span class="tablesaw-cell-content">' + convert_datetime(new Date(myList[y].classify_create)) + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ผู้สร้าง</b> <span class="tablesaw-cell-content">' + myList[y].firstname + " " + myList[y].lastname + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ดูประเภท</b> <span class="tablesaw-cell-content"><a href="/classification/detail' + result.id_classify[y].classify_id + '" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">แก้ไขประเภท</b> <span class="tablesaw-cell-content"><a href="/classification/edit' + result.id_classify[y].classify_id + '" class="text-warning"><i class="fas fa-pencil-alt fa-2x"></i></a></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ลบประเภท</b> <span class="tablesaw-cell-content"><a href="#delete-classify" id=' + result.id_classify[y].classify_id + ' onClick="delClassify(this.id)" data-bs-toggle="modal"><i class="fas fa-trash-alt fa-2x" style="color: red;"></i></a></td>' +
                            '</tr>'
                        table.append(row)
                        end_count = myList[y].classify_id
                    } else if (myList[y].classify_id != "" && state.page >= 2) {
                        var row = '<tr>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ลำดับที่:' +
                            '</b> <span class="tablesaw-cell-content">' + myList[y].classify_id + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ชื่อประเภท</b> <span class="tablesaw-cell-content">' + myList[y].classify_name + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" style="width:250px"><b class="tablesaw-cell-label">ข้อมูลที่แยกประเภท</b> <span class="tablesaw-cell-content">' + result.classify_data_name[y] + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">วันที่สร้าง</b> <span class="tablesaw-cell-content">' + convert_datetime(new Date(myList[y].classify_create)) + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ผู้สร้าง</b> <span class="tablesaw-cell-content">' + myList[y].firstname + " " + myList[y].lastname + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ดูประเภท</b> <span class="tablesaw-cell-content"><a href="/classification/detail' + result.id_classify[parseInt(state.rows) + parseInt(y)].classify_id + '" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">แก้ไขประเภท</b> <span class="tablesaw-cell-content"><a href="/classification/edit' + result.id_classify[parseInt(state.rows) + parseInt(y)].classify_id + '" class="text-warning"><i class="fas fa-pencil-alt fa-2x"></i></a></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ลบประเภท</b> <span class="tablesaw-cell-content"><a href="#delete-classify" id=' + result.id_classify[parseInt(state.rows) + parseInt(y)].classify_id + ' onClick="delClassify(this.id)" data-bs-toggle="modal"><i class="fas fa-trash-alt fa-2x" style="color: red;"></i></a></td>' +
                            '</tr>'
                        table.append(row)
                        end_count = myList[y].classify_id
                    }
                }
                if (myList.length == 0) {
                    var row = '<tr class="odd"><td valign="top" colspan="10" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                    table.append(row)
                    $('#start').text(0)
                    $('#total').text(0)
                } else {
                    if (myList[0].classify_id != "") {
                        $('#start').text(myList[0].classify_id)
                        $('#total').text(result.classify.length)
                    }
                }
                $('#end').text(end_count)
                pageButtons(data.pages)
            }
        }
    })
    function delClassify(id) {
        let url = '/classification/delete' + id
        $.post('/classification/getDel', { value: "@lltr@Cl@ssifyGetDe1", id: id }).done(function (result) {
            console.log(result);
            $('td#c-name').text(result.classify[0].classify_name)
            $('td#c-data').text(result.classify_data_name)
            // $('td#c-create').text( convert_datetime(new Date(result.classify_create_date)))
            $('td#c-create').text(result.classify[0].classify_create_date + '')
            $('td#c-creator').text(result.classify[0].name)
        })
        $("button#sub-del-classify").on('click', function () {
            $('form#del-classify').attr('action', url).submit();
        })
    }
} else if (document.getElementById('c_detail')) {
    // Sidebar
    $('li#li-data-project-action').addClass('selected')
    $('a#li-data-project-action').addClass('active')
    $('ul#ul-data-project-action').addClass('in')
    $('a#a-export').addClass('active')
    $('ul#ul-export').addClass('in')
    $('a#a-classification').addClass('active')
} else if (document.getElementById('c_new')) { // Edit Hide Here
    // Sidebar
    $('li#li-data-project-action').addClass('selected')
    $('a#li-data-project-action').addClass('active')
    $('ul#ul-data-project-action').addClass('in')
    $('a#a-export').addClass('active')
    $('ul#ul-export').addClass('in')
    $('a#a-classification').addClass('active')
    // ==================== ALL FUNCTION ON NEW PAGE ===================
    $('input:checkbox').on('click', function () {
        // Modal Add User (Inside)
        if ($(this).attr('id') == 'customCheck1') {
            if ($(this).is(':checked') == true) {
                $('input[name="classify_user_access_info_process_inside_from_pattern_not_use"]').removeAttr('hidden')
                $('span#user_access_information_process_inside').html(`
                &nbsp; 
                    <a href="#select-users-inside" class="option-pattern" data-bs-toggle="modal">เลือกสมาชิกในระบบ Alltra</a>&nbsp; &nbsp;
                    <span class="h6" style="font-weight: bold;">รวม</span>
                    <input type="text" name="classify_user_access_info_process_inside_from_new_total" class="form-control" style="display: inline; width: 15%;" placeholder="กรุณาเลือกสมาชิก..." readonly/>&nbsp;
                    <span class="h6" style="font-weight: bold;">คน</span>&nbsp;&nbsp;&nbsp;
                    <span class="span-image" id='user_inside'></span>
                    <input type="text" name="classify_user_access_info_process_inside_from_new_id" class="form-control input-all-number" readonly hidden/>&nbsp;
                `)
                var total_users = []
                var count_click2 = 0
                $('a[href="#select-users-inside"]').on('click', function () {
                    $.post('/users', { value: "@lltr@Cl@ssific@ti0nUser" }, function (result) {
                        count_click2 += 1
                        // ============================== Create Prepare ============================
                        var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                        var state = {
                            'querySet': result.users,
                            'page': 1,
                            'rows': 5,
                            'window': 5,
                        }
                        if (count_click2 == 1) {
                            buildTable()
                        }
                        function pagination(querySet, page, rows) {

                            var trimStart = (page - 1) * rows
                            var trimEnd = trimStart + rows

                            var trimmedData = querySet.slice(trimStart, trimEnd)

                            var pages = Math.ceil(querySet.length / rows);

                            var start_count = 1
                            document.getElementById('start-user-inside-add').innerHTML = start_count

                            return {
                                'querySet': trimmedData,
                                'pages': pages,
                            }
                        }
                        // ============================== Create Pagination ============================
                        function pageButtons(pages) {
                            var wrapper = document.getElementById('pagination-wapper-user-inside-add')
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
                                $('#table-body-user-inside-add').empty()
                                state.page = Number($(this).val())
                                // document.getElementById('page').value = state.page
                                buildTable()
                            })
                        }
                        // ============================== Create Table ============================
                        function buildTable() {
                            var table = $('#table-body-user-inside-add')
                            var data = pagination(state.querySet, state.page, state.rows)
                            var myList = data.querySet
                            for (y in myList) {
                                if (myList[y].acc_id != "") {
                                    let buttonAdd = ""
                                    let buttonDel = ""
                                    let total_users = $('input[name="classify_user_access_info_process_inside_from_new_id"]').val().split(',')
                                    if (state.page == 1) {
                                        if (checkUsers(total_users, result.id_users[y].acc_id, 0) == true) {
                                            buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                            buttonDel = '<a id="_del_users_inside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                        } else {
                                            buttonAdd = '<a id="_add_users_inside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                        }
                                    } else {
                                        if (checkUsers(total_users, result.id_users[parseInt(state.rows) + parseInt(y)].acc_id, 0) == true) {
                                            buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                            buttonDel = '<a id="_del_users_inside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                        } else {
                                            buttonAdd = '<a id="_add_users_inside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                        }
                                    }
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<th style="text-align: left; vertical-align: center;">' +
                                        'ชื่อ-นามสกุล: ' + myList[y].firstname + " " + myList[y].lastname + " <br/>" +
                                        '</th>' +
                                        '<td style="vertical-align: middle; width: 50px;">' +
                                        buttonAdd +
                                        '</td>' +
                                        '<td style="vertical-align: middle; width: 50px;">' +
                                        buttonDel +
                                        '</td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].acc_id
                                }
                            }
                            if (myList.length == 0) {
                                var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                                table.append(row)
                                $('#total-user-inside-add').text(0)
                                $('#start-user-inside-add').html(0)
                            } else {
                                if (myList[0].user_id) {
                                    $('#start-user-inside-add').text(myList[0].acc_id)
                                }
                                pageButtons(data.pages)
                                $('#total-user-inside-add').text(result.users.length)
                            }
                            $('#end-user-inside-add').html(end_count)

                            $('a#_add_users_inside').on('click', function () {
                                $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: $(this).attr('data-value') }).done(function (result) {
                                    total_users.push({ "id": result[0].acc_id, "image": result[0].image })
                                    $('span#user_inside').empty()
                                    var length_users = new Set(total_users)
                                    total_users = [...length_users]
                                    $('input[name="classify_user_access_info_process_inside_from_new_total"]').val(total_users.length)
                                    $('input[name="classify_user_access_info_process_inside_from_new_id"]').val(total_users.map(e => e['id']))
                                    for (var k = 0; k < total_users.length; k++) {
                                        // Image = 600x600
                                        if (k < total_users.length - 1) {
                                            $('span#user_inside').append('<img class="image-users" src="/UI/image/' + total_users[k].image + '" data-mark="' + total_users[k].id + '"/> &nbsp;')
                                        } else {
                                            $('span#user_inside').append('<img class="image-users" src="/UI/image/' + total_users[k].image + '" data-mark="' + total_users[k].id + '"/>')
                                        }
                                    }
                                    $('#table-body-user-inside-add').empty()
                                    buildTable()
                                })
                            })
                            $('a#_del_users_inside').on('click', function () {
                                $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: $(this).attr('data-value') }).done(function (result) {
                                    let new_total_user = total_users.filter(function (item) { return item.id.toString().indexOf(result[0].acc_id) })
                                    total_users = new_total_user
                                    $('input[name="classify_user_access_info_process_inside_from_new_total"]').val(total_users.length)
                                    $('input[name="classify_user_access_info_process_inside_from_new_id"]').val(total_users.map(e => e['id']))
                                    for (var k = 0; k < $('span#user_inside').children().length; k++) {
                                        let old_image = $('span#user_inside').children()[k].getAttribute('data-mark')
                                        if (old_image == result[0].acc_id) {
                                            $('span#user_inside').children()[k].remove()
                                        }
                                    }
                                    $('#table-body-user-inside-add').empty()
                                    buildTable()
                                    if ($('input[name="classify_user_access_info_process_inside_from_new_total"]').val() == "0") {
                                        $('span#user_inside').empty()
                                    }
                                })
                            })
                            //$('input[name="classify_user_access_info_process_inside_from_new_total"]').on('click keyup keydown focus', function () {
                            //    if ($(this).val() == "" || $(this).val() == null) {
                            //        $('span#user_inside').empty()
                            //    } else if ($(this).val() != String(total_image.length)) {
                            //        $('span#user_inside').last().remove()
                            //    }
                            //})
                        }
                    })
                })
            } else {
                $('input[name="classify_user_access_info_process_inside_from_pattern_not_use"]').attr('hidden', 'hidden')
                $('span#user_access_information_process_inside').empty()
                $('tbody#table-body-user-inside-add').empty()
                $('ul#pagination-wapper-user-inside-add').empty()
                $('span#start-user-inside-add').empty()
                $('span#end-user-inside-add').empty()
                $('span#total-user-inside-add').empty()
            }
        }
        // Modal Add User (Outside)
        if ($(this).attr('id') == 'customCheck2') {
            if ($(this).is(':checked') == true) {
                $('input[name="classify_user_access_info_process_outside_from_pattern_not_use"]').removeAttr('hidden')
                $('span#user_access_information_process_outside').html(`
                &nbsp;
                    <a href="#select-users-outside" class="option-pattern" data-bs-toggle="modal">เลือกสมาชิกในระบบ Alltra</a>&nbsp; &nbsp;
                    <span class="h6" style="font-weight: bold;">รวม</span>
                    <input type="text" name="classify_user_access_info_process_outside_from_new_total" class="form-control" style="display: inline; width: 15%;" placeholder="กรุณาเลือกสมาชิก..." readonly/>&nbsp;
                    <span class="h6" style="font-weight: bold;">คน</span>&nbsp;&nbsp;&nbsp;
                    <span class="span-image" id="user_outside">

                    </span>
                    <input type="text" name="classify_user_access_info_process_outside_from_new_id" class="form-control input-all-number" readonly hidden/>&nbsp;
                `)
                var total_users = []
                var count_click3 = 0
                $('a[href="#select-users-outside"]').on('click', function () {
                    $.post('/users', { value: "@lltr@Cl@ssific@ti0nUser" }, function (result) {
                        count_click3 += 1
                        // ============================== Create Prepare ============================
                        var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                        var state = {
                            'querySet': result.users,
                            'page': 1,
                            'rows': 5,
                            'window': 5,
                        }
                        if (count_click3 == 1) {
                            buildTable()
                        }
                        function pagination(querySet, page, rows) {

                            var trimStart = (page - 1) * rows
                            var trimEnd = trimStart + rows

                            var trimmedData = querySet.slice(trimStart, trimEnd)

                            var pages = Math.ceil(querySet.length / rows);

                            var start_count = 1
                            document.getElementById('start-users-outside-add').innerHTML = start_count

                            return {
                                'querySet': trimmedData,
                                'pages': pages,
                            }
                        }
                        // ============================== Create Pagination ============================
                        function pageButtons(pages) {
                            var wrapper = document.getElementById('pagination-wapper-users-outside-add')
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
                                $('#table-body-users-outside-add').empty()
                                state.page = Number($(this).val())
                                // document.getElementById('page').value = state.page
                                buildTable()
                            })
                        }
                        // ============================== Create Table ============================
                        function buildTable() {
                            var table = $('#table-body-users-outside-add')
                            var data = pagination(state.querySet, state.page, state.rows)
                            var myList = data.querySet
                            for (y in myList) {
                                if (myList[y].acc_id != "") {
                                    let buttonAdd = ""
                                    let buttonDel = ""
                                    let total_users = $('input[name="classify_user_access_info_process_outside_from_new_id"]').val().split(',')
                                    if (state.page == 1) {
                                        if (checkUsers(total_users, result.id_users[y].acc_id, 0) == true) {
                                            buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                            buttonDel = '<a id="_del_users_outside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                        } else {
                                            buttonAdd = '<a id="_add_users_outside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                        }
                                    } else {
                                        if (checkUsers(total_users, result.id_users[parseInt(state.rows) + parseInt(y)].acc_id, 0) == true) {
                                            buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                            buttonDel = '<a id="_del_users_outside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                        } else {
                                            buttonAdd = '<a id="_add_users_outside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                        }
                                    }
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<th style="text-align: left; vertical-align: center;">' +
                                        'ชื่อ-นามสกุล: ' + myList[y].firstname + " " + myList[y].lastname + " <br/>" +
                                        '</th>' +
                                        '<td style="vertical-align: middle; width: 50px;">' +
                                        buttonAdd +
                                        '</td>' +
                                        '<td style="vertical-align: middle; width: 50px;">' +
                                        buttonDel +
                                        '</td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].acc_id
                                }
                            }
                            if (myList.length == 0) {
                                var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                                table.append(row)
                                $('#total-users-outside-add').text(0)
                                $('#start-users-outside-add').html(0)
                            } else {
                                if (myList[0].acc_id) {
                                    $('#start-users-outside-add').text(myList[0].acc_id)
                                }
                                pageButtons(data.pages)
                                $('#total-users-outside-add').text(result.users.length)
                            }

                            $('#end-users-outside-add').html(end_count)

                            $('a#_add_users_outside').on('click', function () {
                                $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: $(this).attr('data-value') }).done(function (result) {
                                    $('span#user_outside').empty()
                                    total_users.push({ "id": result[0].acc_id, "image": result[0].image })
                                    var length_users = new Set(total_users)
                                    total_users = [...length_users]
                                    $('input[name="classify_user_access_info_process_outside_from_new_total"]').val(total_users.length)
                                    $('input[name="classify_user_access_info_process_outside_from_new_id"]').val(total_users.map(e => e['id']))
                                    for (var k = 0; k < total_users.length; k++) {
                                        // Image = 600x600
                                        if (k < total_users.length - 1) {
                                            $('span#user_outside').append('<img class="image-users" src="/UI/image/' + total_users[k].image + '" data-mark="' + total_users[k].id + '"/> &nbsp;')
                                        } else {
                                            $('span#user_outside').append('<img class="image-users" src="/UI/image/' + total_users[k].image + '" data-mark="' + total_users[k].id + '"/>')
                                        }
                                    }
                                    $('#table-body-users-outside-add').empty()
                                    buildTable()
                                })
                            })
                            $('a#_del_users_outside').on('click', function () {
                                $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: $(this).attr('data-value') }).done(function (result) {
                                    let new_total_users = total_users.filter(function (item) { return item.id.toString().indexOf(result[0].acc_id) })
                                    total_users = new_total_users
                                    $('input[name="classify_user_access_info_process_outside_from_new_total"]').val(total_users.length)
                                    $('input[name="classify_user_access_info_process_outside_from_new_id"]').val(total_users.map(e => e['id']))
                                    for (var k = 0; k < $('span#user_outside').children().length; k++) {
                                        let old_image = $('span#user_outside').children()[k].getAttribute('data-mark')
                                        if (old_image == result[0].acc_id) {
                                            $('span#user_outside').children()[k].remove()
                                        }
                                    }
                                    if ($('input[name="classify_user_access_info_process_outside_from_new_total"]').val() == 0) {
                                        $('span#user_outside').empty()
                                    }
                                    $('#table-body-users-outside-add').empty()
                                    buildTable()
                                })
                            })
                            //$('input[name="classify_user_access_info_process_outside_from_new_total"]').on('click keyup keydown focus', function () {
                            //    if ($(this).val() == "" || $(this).val() == null) {
                            //        $('span#user_outside').empty()
                            //    }
                            //})
                        }
                    })
                })
            } else {
                $('input[name="classify_user_access_info_process_outside_from_pattern_not_use"]').attr('hidden', 'hidden')
                $('span#user_access_information_process_outside').empty()
                $('tbody#table-body-users-outside-add').empty()
                $('ul#pagination-wapper-users-outside-add').empty()
                $('span#start-users-outside-add').empty()
                $('span#end-users-outside-add').empty()
                $('span#total-users-outside-add').empty()
            }
        }
        if ($(this).attr('id') == 'customCheck3') {
            if ($(this).is(':checked') == true) {
                $('span#period_process_follow_policy').html(`
                <div class="input-group">
                <input type="text" name="classify_period_proccess_follow_policy_total" placeholder="" class="form-control" value="180"  readonly/>
                                        <span class="input-group-text">
                                        วัน
                                        </span>
                                    </div>
                `)
            } else {
                $('span#period_process_follow_policy').empty()
            }
        }
        if ($(this).attr('id') == 'customCheck4') {
            if ($(this).is(':checked') == true) {
                $('input[name="classify_period_end_follow_pattern_total"]').removeAttr('hidden')
                $('span#day_end_pattern').removeAttr('hidden')
            } else {
                $('input[name="classify_period_end_follow_pattern_total"]').attr('hidden', true)
                $('span#day_end_pattern').attr('hidden', true)
            }
        }
    })
    if ($('input:radio[name="classify_risk_assess_only_dpo_data_number_all_used_process_many"]').find('checked')) {
        $('span#risk_assess_only_dpo_data_number_all_used_process_total').html(`
        <div class="row"><div>ระบุ</div><div><input type="text" name="classify_risk_assess_only_dpo_data_number_all_used_process_total" placeholder="กรุณาป้อนจำนวน..." class="form-control"  /> </div></div> 
        `)
    }
    $('input:radio').on('click', function () {
        if ($(this).attr("name") == 'classify_risk_assess_only_dpo_data_number_all_used_process_many') {
            if ($(this).attr('id') == "customRadio5" || $(this).attr('id') == "customRadio4") {
                $('span#classification_risk_assessment_only_dpo_data_number_all_used_process_total').html(`
                <div class="row"><div>ระบุ</div><div><input type="text" name="classify_risk_assess_only_dpo_data_number_all_used_process_total" placeholder="" class="form-control input-radio1" /> </div></div> 
                `)
            }
        }
        //       if ($(this).attr('name') == 'classify_risk_assess_only_dpo_assess_the_impact_of_data') {
        //           if ($(this).attr('id') == "customRadio14" || $(this).attr('id') == "customRadio15" || $(this).attr('id') == "customRadio16") {
        //               $('div#classification_risk_assessment_only_dpo_fix_a_leak_of_data').html(`
        //           <label class="form-check-label h6"
        //                                                                   style="font-weight: bold;">วิธีแก้ไขเมื่อเกิดข้อมูลรั่วไหลหรือผลกระทบต่อเจ้าของข้อมูล</label>
        //                                                               <div>
        //                                                                   <input type="text" name="classify_risk_assess_only_dpo_fix_a_leak_of_data" id="" style="width: 47%;" placeholder="กรุณาป้อนวิธีแก้ไข..." class="form-control">
        //                                                               </div>
        //           `)
        //           }
        //       }
        //       if ($(this).attr('name') == 'classify_risk_assess_only_dpo_assess_the_impact_of_organization') {
        //           if ($(this).attr('id') == "customRadio17" || $(this).attr('id') == "customRadio18" || $(this).attr('id') == "customRadio19") {
        //               $('div#classification_risk_assessment_only_dpo_fix_a_leak_of_organization').html(`
        //           <label class="form-check-label h6"
        //           style="font-weight: bold;">วิธีแก้ไขเมื่อเกิดข้อมูลรั่วไหลหรือผลกระทบต่อองค์กร</label>
        //       <div>
        //           <input type="text" name="classify_risk_assess_only_dpo_fix_a_leak_of_organization" id="" style="width: 47%;" placeholder="กรุณาป้อนวิธีแก้ไข..." class="form-control">
        //       </div>
        //           `)
        //           }
        //       }
        if ($(this).attr('name') == 'classify_type_data_in_event_personal_datamark_check_xxxxxxxxxxxxxxxxxxxxxx') {
            if ($(this).val() == 1) {
                $('span#event_personal_datamark').html(`
                <table class="table table-boardless">
                    <td width="40%">
                        <input type="radio" id="not_use" name="classify_type_data_in_event_personal_datamark1" class="form-check-input" value="3" />
                        <label for="not_use">Anonymized Data (ไม่ระบุข้อมูล) </label>
                    </td>
                    <td width="50%">
                        <input type="radio" id="not_use1" name="classify_type_data_in_event_personal_datamark1" class="form-check-input" checked />
                        <label for="not_used1">Pseudonymized Data (ข้อมูลที่มีการแฝง) </label>
                    </td> 
                </table>
                <span id="pseudonymized"></span>
                <span id="total-pseudonymized"></span>
                `)
                if ($('input:radio[name="classify_type_data_in_event_personal_datamark1"]:checked').length > 0) {
                    if ($('input:radio[name="classify_type_data_in_event_personal_datamark1"]:checked').attr('id') == 'not_use1') {
                        $('span#pseudonymized').html(`
                            <table class="table table-boardless" id="pseudonymized">
                                <td width="32%">
                                    <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark1" value="0" class="form-check-input" checked />
                                    <label for="datamark1" > หัวข้อมูลอย่างเดียว </label>
                                </td>
                                <td width="30%">
                                    <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark2" value="1" class="form-check-input" />
                                    <label for="datamark2" > หัวและท้ายข้อมูล </label>
                                </td>
                                <td>
                                    <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark3" value="2" class="form-check-input" />
                                    <label for="datamark3" > ท้ายข้อมูลอย่างเดียว </label>
                                </td>
                            </table>
                            `)
                        $('span#total-pseudonymized').html(`
                            <table class="table table-boardless" id="total-pseudonymized">
                                <td style="width: 35%; text-align: right;">
                                    <label for="total-digit"> จำนวนตัวอักษรที่แสดง:  </label>
                                </td>
                                <td>
                                    <input type="number" min="1" name="classify_type_data_in_event_personal_datamark_total" placeholder="กรุณาป้อนจำนวน..." class="form-control" />
                                </td>
                            </table>
                            <span id="example-datamark"></span>
                            `)
                        let seleced = $('input:radio[name="classify_type_data_in_event_personal_datamark"]:checked')
                        if (seleced.attr('id') == 'datamark1') {
                            $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["****ย่าง"]
                            </td>
                        </table>
                        `)
                        } else if (seleced.attr('id') == 'datamark2') {
                            $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">3</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["***ย***"]
                            </td>
                        </table>
                        `)
                        } else if (seleced.attr('id') == 'datamark3') {
                            $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["ตัวอ****"]
                            </td>
                        </table>
                        `)
                        }
                    }
                }
                $('input:radio[name="classify_type_data_in_event_personal_datamark1"]').on('click', function () {
                    if ($(this).attr('id') == 'not_use') {
                        $('span#pseudonymized').empty();
                        $('span#total-pseudonymized').empty();
                    } else {
                        $('span#pseudonymized').html(`
                            <table class="table table-boardless" id="pseudonymized">
                                <td width="32%">
                                    <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark1" value="0" class="form-check-input" checked />
                                    <label for="datamark1" > หัวข้อมูลอย่างเดียว </label>
                                </td>
                                <td width="30%">
                                    <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark2" value="1" class="form-check-input" />
                                    <label for="datamark2" > หัวและท้ายข้อมูล </label>
                                </td>
                                <td>
                                    <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark3" value="2" class="form-check-input" />
                                    <label for="datamark3" > ท้ายข้อมูลอย่างเดียว </label>
                                </td>
                            </table>
                            `)
                        $('span#total-pseudonymized').html(`
                            <table class="table table-boardless" id="total-pseudonymized">
                                <td style="width: 35%; text-align: right;">
                                    <label for="total-digit"> จำนวนตัวอักษรที่แสดง:  </label>
                                </td>
                                <td>
                                    <input type="number" min="1" name="classify_type_data_in_event_personal_datamark_total" placeholder="กรุณาป้อนจำนวน..." class="form-control" />
                                </td>
                            </table>
                            <span id="example-datamark"></span>
                            `)
                        let seleced = $('input:radio[name="classify_type_data_in_event_personal_datamark"]:checked')
                        if (seleced.attr('id') == 'datamark1') {
                            $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["****ย่าง"]
                            </td>
                        </table>
                        `)
                        } else if (seleced.attr('id') == 'datamark2') {
                            $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">3</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["***ย***"]
                            </td>
                        </table>
                        `)
                        } else if (seleced.attr('id') == 'datamark3') {
                            $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["ตัวอ****"]
                            </td>
                        </table>
                        `)
                        }
                    }
                    $('input:radio[name="classify_type_data_in_event_personal_datamark"]').on('click', function () {
                        if ($(this).attr('id') == 'datamark1') {
                            $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["****ย่าง"]
                            </td>
                        </table>
                        `)
                        } else if ($(this).attr('id') == 'datamark2') {
                            $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">3</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["***ย***"]
                            </td>
                        </table>
                        `)
                        } else if ($(this).attr('id') == 'datamark3') {
                            $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["ตัวอ****"]
                            </td>
                        </table>
                        `)
                        }
                    })
                })
                $('input:radio[name="classify_type_data_in_event_personal_datamark"]').on('click', function () {
                    if ($(this).attr('id') == 'datamark1') {
                        $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;">ทำเครื่องหมาย</span> ["****ย่าง"]
                            </td>
                        </table>
                        `)
                    } else if ($(this).attr('id') == 'datamark2') {
                        $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">3</span> <br/> ["ตัวอย่าง"] <span style="color: red;">ทำเครื่องหมาย</span> ["***ย***"]
                            </td>
                        </table>
                        `)
                    } else if ($(this).attr('id') == 'datamark3') {
                        $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;">ทำเครื่องหมาย</span> ["ตัวอ****"]
                            </td>
                        </table>
                        `)
                    }
                })
            } else {
                $('span#event_personal_datamark').empty();
            }
        }
    })
    // Modal Add Pattern

    var count_click = 0
    $('a[href="#select-pattern"]').on('click', function () {
        $.post('/pattern', function (result) {
            count_click += 1
            // ============================== Create Prepare ============================
            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
            var state = {
                'querySet': result.pattern,
                'page': 1,
                'rows': 5,
                'window': 5,
            }


            if (count_click == 1) {
                buildTable();
            }
            console.log("count_click", count_click);
            function pagination(querySet, page, rows) {

                var trimStart = (page - 1) * rows
                var trimEnd = trimStart + rows

                var trimmedData = querySet.slice(trimStart, trimEnd)

                var pages = Math.ceil(querySet.length / rows);

                var start_count = 1
                document.getElementById('start-pattern-add').innerHTML = start_count

                return {
                    'querySet': trimmedData,
                    'pages': pages,
                }
            }
            // ============================== Create Pagination ============================
            function pageButtons(pages) {
                var wrapper = document.getElementById('pagination-wapper-pattern-add')
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
                    $('#table-body-pattern-add').empty()
                    state.page = Number($(this).val())
                    // document.getElementById('page').value = state.page
                    buildTable()
                })
            }
            // ============================== Create Table ============================
            function buildTable() {
                var table = $('#table-body-pattern-add')
                var data = pagination(state.querySet, state.page, state.rows)
                var myList = data.querySet
                for (y in myList) {
                    if (myList[y].pattern_id != "") {
                        let buttonAdd = ""
                        let buttonDel = ""
                        if (state.page == 1) {
                            if (result.id_pattern[y].pattern_id == $('input[name="pattern_id"]').val()) {
                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                buttonDel = '<a id="_del_pattern" href="javascript:void(0);" data-value=' + result.id_pattern[y].pattern_id + '  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                            } else {
                                buttonAdd = '<a id="_add_pattern" href="javascript:void(0);" data-value=' + result.id_pattern[y].pattern_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                            }
                        } else {
                            if (result.id_pattern[parseInt(state.rows) + parseInt(y)].pattern_id == $('input[name="pattern_id"]').val()) {
                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                buttonDel = '<a id="_del_pattern" href="javascript:void(0);" data-value=' + result.id_pattern[parseInt(state.rows) + parseInt(y)].pattern_id + '  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                            } else {
                                buttonAdd = '<a id="_add_pattern" href="javascript:void(0);" data-value=' + result.id_pattern[parseInt(state.rows) + parseInt(y)].pattern_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                            }
                        }
                        //Keep in mind we are using "Template Litterals to create rows"
                        var row = '<tr>' +
                            '<th style="vertical-align: center;">' +
                            'ชื่อรูปแบบ: ' + myList[y].pattern_name + " <br/>" +
                            '</th>' +
                            '<td style="vertical-align: middle; width: 50px;">' +
                            buttonAdd +
                            '</td>' +
                            '<td style="vertical-align: middle; width: 50px;">' +
                            buttonDel +
                            '</td>' +
                            '</tr>'
                        table.append(row)
                        end_count = myList[y].pattern_id
                    }
                }
                if (myList.length == 0) {
                    var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                    table.append(row)
                    $('#total-pattern-add').text(0)
                    $('#start-pattern-add').html(0)
                } else {
                    if (myList[0].doc_id != "" && myList[0].doc_action != 1 && myList[0].doc_status == 2) {
                        $('#start-pattern-add').text(myList[0].pattern_id)
                    }
                    pageButtons(data.pages)
                    $('#total-pattern-add').text(result.pattern.length)
                }
                $('#end-pattern-add').html(end_count)

                $('a#_add_pattern').on('click', function () {
                    let specific_measures = Array.from(document.getElementsByClassName('specific_measures'))
                    specific_measures.forEach(element => {
                        element.style.display = "block"
                    });

                    $("#choose_measures_specific").html(`<a class="btn btn-success" data-bs-toggle='modal'  onclick="modalSpecific()"  id="modal_specific" href="#select-measures">เลือกมาตราการรักษาความปลอดภัย</a>`)
                    document.getElementById('pattern_specific_id').value = $(this).attr('data-value')
                    let event_process_id = document.getElementById('event_process_id').value

                    $.post('/pattern/select-pattern', { value: "@lltr@Se1ectP@ttern", id: $(this).attr('data-value'), event_process_id: event_process_id }).done(function (result) {
                        $('input[name="pattern_id"]').val(result.pattern[0].pattern_id)
                        $('select[name="pattern_processing_base_id"]').find('option:selected').removeAttr('selected')
                        $('input[name="classify_name_part1"]').val(result.pattern[0].pattern_name)
                        $('input[name="classify_data_exception_or_unnecessary_filter_name"]').val(result.pattern[0].pattern_name)
                        $('input[name="classify_data_exception_or_unnecessary_filter_tag"]').val(result.pattern[0].pattern_tag)
                        $('input[name="classify_data_exception_or_unnecessary_filter_label"').val(result.pattern[0].pattern_label)
                        let fullname = result.total_name_inside.map(e => e.join(" "))
                        $('input[name="classify_user_access_info_process_inside_from_pattern_not_use"]').val([...fullname])
                        $('input[name="classify_user_access_info_process_inside_from_pattern"]').val(result.pattern[0].pattern_processor_inside_id)
                        let fullname_outside = result.total_name_outside.map(e => e.join(" "))
                        $('input[name="classify_user_access_info_process_outside_from_pattern_not_use"]').val([...fullname_outside])
                        $('input[name="classify_user_access_info_process_outside_from_pattern"]').val(result.pattern[0].pattern_processor_outside_id)
                        createPatternSpecific(result.patternSpecific)
                        let _file_ = result.pattern[0].pattern_type_data_file === 1 ? "มี" : "ไม่มี"
                        let _database_ = result.pattern[0].pattern_type_database === 1 ? result.pattern[0].pattern_type_database_name : "ไม่มี"
                        var _inside_ = ""
                        var _outside_0 = ""
                        var _outside_1 = ""
                        var _outside_2 = ""
                        var _outside_3 = ""
                        if (result.pattern[0].pattern_storage_method_inside == 1) {
                            _inside_ = "มี"
                        } else {
                            _inside_ = "ไม่มี"
                        }
                        if (result.pattern[0].pattern_storage_method_outside == 1) {
                            _outside_0 = "มี"
                            if (result.pattern[0].pattern_storage_method_outside_device == 1) {
                                _outside_1 = result.pattern[0].pattern_storage_method_outside_device_name
                            } else {
                                _outside_1 = "ไม่มี"
                            }
                            if (result.pattern[0].pattern_storage_method_outside_agent == 1) {
                                _outside_2 = result.pattern[0].pattern_storage_method_outside_agent_name
                            } else {
                                _outside_2 = "ไม่มี"
                            }
                            if (result.pattern[0].pattern_storage_method_outside_database_outside == 1) {
                                _outside_3 = result.pattern[0].pattern_storage_method_outside_database_outside_name
                            } else {
                                _outside_3 = "ไม่มี"
                            }
                        } else {
                            _outside_0 = "ไม่มี"
                        }
                        var data_name_total = result.data_name_total.map(e => e['data_name'])
                        data_name_total = data_name_total.join(", ")
                        $('textarea[name="example_pattern"]').text(`ชื่อ: ${result.pattern[0].pattern_name}
ข้อมูล: ${data_name_total}
ระยะเวลา: ${convert_date(new Date(result.pattern[0].pattern_start_date))} ทั้งหมด: ${result.pattern[0].pattern_total_date} วัน
ชนิดข้อมูล:
    File Ms Excel/CSV: ${_file_}
    Database: ${_database_}
วิธีการจัดเก็บข้อมูลส่วนบุคคล:
    ภายใน Alltra: ${_inside_}
    ภายนอก: ${_outside_0}, [ (อุปกรณ์: ${_outside_1}),  (Agent: ${_outside_2}),  (Database: ${_outside_3}) ]`)
                        $('#span_example_pattern').html()
                        check_doc_id_pattern();
                        $('input[name="classify_period_end_follow_pattern_total"]').val(result.pattern[0].pattern_total_date)
                        $('select[name="pattern_processing_base_id"]').find('option[value=' + result.pattern[0].pattern_processing_base_id + ']').attr('selected', 'selected')
                        $('div#select-pattern').modal('hide')
                        $('#table-body-pattern-add').empty()
                        buildTable();
                    })

                })

                $('a#_del_pattern').on('click', function () {
                    $('input[name="pattern_id"]').val(null)
                    $('select[name="pattern_processing_base_id"]').find('option:selected').removeAttr('selected')
                    $('input[name="classify_name_part1"]').val(null)
                    $('input[name="classify_data_exception_or_unnecessary_filter_name"]').val(null)
                    $('input[name="classify_data_exception_or_unnecessary_filter_tag"]').val(null)
                    $('input[name="classify_data_exception_or_unnecessary_filter_label"').val(null)
                    $('input[name="classify_user_access_info_process_inside_from_pattern"]').val(null)
                    $('input[name="classify_user_access_info_process_outside_from_pattern"]').val(null)
                    $('input[name="classify_user_access_info_process_inside_from_pattern_not_use"]').val(null)
                    $('input[name="classify_user_access_info_process_outside_from_pattern_not_use"]').val(null)
                    $('textarea[name="example_pattern"]').text(null)
                    check_doc_id_pattern();
                    $('select[name="pattern_processing_base_id"]').find('option:disabled').attr('selected', 'selected')
                    $('input[name="classify_period_end_follow_pattern_total"]').val(null)
                    $('#table-body-pattern-add').empty()
                    buildTable();

                    let event_process_id = document.getElementById('event_process_id').value
                    let pattern_specific_id = document.getElementById('pattern_specific_id').value = ''
                    if (event_process_id || event_process_id) {
                        $.post('/event_process/get', { value: "@lltr@Cl@ssific@iti0nGetEventPr@cess", id: event_process_id, pattern_specific_id: pattern_specific_id }).done(function (result) {
                            console.log('result.event[0].event_process_id', result.event);
                            $('input[name="event_process_id"]').val(result.event[0].event_process_id)
                            $('input[name="classify_name_part2"]').val(result.event[0].event_process_name)
                            $('div#select-event-process').modal('hide')
                            createPatternSpecific(result.specific) //  สร้าง table มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPAกำหนด (PDPA Specific Measures)
                            // เช็ค ข้อมูลเเก้ไข ว่าตรง กับมาตราการที่เลือกไหม ตอนเลือก pattern
                            let array = result.specific.map((items) => { return items.specific_id })
                            if (data_new.length > 0) {
                                let newData = []
                                data_new.forEach(element => {
                                    if (array.indexOf(parseInt(element.id_specific)) > -1) {
                                        newData.push(element)
                                    }
                                });
                                data_new = [...newData]
                            }
                        })
                    } else {
                        createPatternSpecific("ไม่มีข้อมูล")
                        data_new = []
                    }
                })
            }

        })
    })




    // Modal Select Event-process
    var count_click1 = 0
    $('a[href="#select-event-process"]').on('click', function () {
        $.post('/event_process', { value: "@lltr@Cl@ssific@ti0nEventPr0cess" }, function (result) {
            count_click1 += 1
            // ============================== Create Prepare ============================
            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
            var state = {
                'querySet': result.event,
                'page': 1,
                'rows': 5,
                'window': 5,
            }

            if (count_click1 == 1) {
                buildTable();
            }
            function pagination(querySet, page, rows) {

                var trimStart = (page - 1) * rows
                var trimEnd = trimStart + rows

                var trimmedData = querySet.slice(trimStart, trimEnd)

                var pages = Math.ceil(querySet.length / rows);

                var start_count = 1
                document.getElementById('start-event-add').innerHTML = start_count

                return {
                    'querySet': trimmedData,
                    'pages': pages,
                }
            }
            // ============================== Create Pagination ============================
            function pageButtons(pages) {
                var wrapper = document.getElementById('pagination-wapper-event-add')
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
                    $('#table-body-event-add').empty()
                    state.page = Number($(this).val())
                    // document.getElementById('page').value = state.page
                    buildTable()
                })
            }
            // ============================== Create Table ============================
            function buildTable() {
                var table = $('#table-body-event-add')
                var data = pagination(state.querySet, state.page, state.rows)
                var myList = data.querySet
                for (y in myList) {
                    if (myList[y].event_process_id != "") {
                        let buttonAdd = ""
                        let buttonDel = ""
                        if (state.page == 1) {
                            if (myList[y].event_process_name == $('input[name="classify_name_part2"]').val() && result.id_event[y].event_process_id == $('input[name="event_process_id"]').val()) {
                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                buttonDel = '<a id="_del_event" href="javascript:void(0);" data-value=' + result.id_event[y].event_process_id + '  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                            } else {
                                buttonAdd = '<a id="_add_event" href="javascript:void(0);" data-value=' + result.id_event[y].event_process_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                            }
                        } else {
                            if (myList[y].event_process_name == $('input[name="classify_name_part2"]').val() && result.id_event[parseInt(state.rows) + parseInt(y)].event_process_id == $('input[name="event_process_id"]').val()) {
                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                buttonDel = '<a id="_del_event" href="javascript:void(0);" data-value=' + result.id_event[parseInt(state.rows) + parseInt(y)].event_process_id + '  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                            } else {
                                buttonAdd = '<a id="_add_event" href="javascript:void(0);" data-value=' + result.id_event[parseInt(state.rows) + parseInt(y)].event_process_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                            }
                        }
                        //Keep in mind we are using "Template Litterals to create rows"
                        var row = '<tr>' +
                            '<th style="vertical-align: center;">' +
                            'ชื่อกิจกรรม: ' + myList[y].event_process_name + " <br/>" +
                            '</th>' +
                            '<td style="vertical-align: middle; width: 50px;">' +
                            buttonAdd +
                            '</td>' +
                            '<td style="vertical-align: middle; width: 50px;">' +
                            buttonDel +
                            '</td>' +
                            '</tr>'
                        table.append(row)
                        end_count = myList[y].event_process_id
                    }
                }
                if (myList.length == 0) {
                    var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                    table.append(row)
                    $('#total-event-add').text(0)
                    $('#start-event-add').html(0)
                } else {
                    if (myList[0].event_process_id != "") {
                        $('#start-event-add').text(myList[0].event_process_id)
                    }
                    pageButtons(data.pages)
                    $('#total-event-add').text(result.event.length)
                }
                $('#end-event-add').html(end_count)




                $('a#_add_event').on('click', function () {
                    let pattern_specific_id = document.getElementById('pattern_specific_id').value
                    let specific_measures = Array.from(document.getElementsByClassName('specific_measures'))
                    specific_measures.forEach(element => {
                        element.style.display = "block"
                    });
                    $("#choose_measures_specific").html(`<a class="btn btn-success" data-bs-toggle='modal' onclick="modalSpecific()" id="modal_specific" href="#select-measures">เลือกมาตราการรักษาความปลอดภัย</a>`)
                    $.post('/event_process/get', { value: "@lltr@Cl@ssific@iti0nGetEventPr@cess", id: $(this).attr('data-value'), pattern_specific_id: pattern_specific_id }).done(function (result) {
                        console.log('result.event[0].event_process_id', result.event[0].event_process_id);
                        $('input[name="event_process_id"]').val(result.event[0].event_process_id)
                        $('input[name="classify_name_part2"]').val(result.event[0].event_process_name)
                        $('div#select-event-process').modal('hide')
                        $('#table-body-event-add').empty()
                        buildTable();
                        createPatternSpecific(result.specific) //  สร้าง table มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPAกำหนด (PDPA Specific Measures)
                        // เช็ค ข้อมูลเเก้ไข ว่าตรง กับมาตราการที่เลือกไหม ตอนเลือกกิจกรรม
                        let array = result.specific.map((items) => { return items.specific_id })
                        if (data_new.length > 0) {
                            let newData = []
                            data_new.forEach(element => {
                                if (array.indexOf(parseInt(element.id_specific)) > -1) {
                                    newData.push(element)
                                }
                            });
                            data_new = [...newData]
                        }
                    })
                })
                $('a#_del_event').on('click', function () {
                    $('input[name="event_process_id"]').val(null)
                    $('input[name="classify_name_part2"]').val(null)
                    $('#table-body-event-add').empty()
                    buildTable();
                    let pattern_specific_id = document.getElementById('pattern_specific_id').value
                    let event_process_id = document.getElementById('event_process_id').value

                    if (pattern_specific_id || event_process_id) {
                        // เลือก กิจกรรม ออก 
                        $.post('/pattern/select-pattern', { value: "@lltr@Se1ectP@ttern", id: document.getElementById('pattern_specific_id').value }).done(function (result) {
                            createPatternSpecific(result.patternSpecific)
                            // เช็ค ข้อมูลเเก้ไข ว่าตรง กับมาตราการที่เลือกไหม ตอนเลือกกิจกรรม
                            let array = result.patternSpecific.map((items) => { return items.specific_id })
                            if (data_new.length > 0) {
                                let newData = []
                                data_new.forEach(element => {
                                    if (array.indexOf(parseInt(element.id_specific)) > -1) {
                                        newData.push(element)
                                    }
                                });
                                data_new = [...newData]
                            }
                        })
                    } else {
                        createPatternSpecific("ไม่มีข้อมูล")
                        data_new = []
                    }
                })
            }

        })
    })




    // Modal Add Processing-base
    $('a#btn_add_processing_base').on('click', function () {
        console.log("1111111111");
        $('a#add_processing_base').on('click', function () {
            if ($('input[name="pattern_processing_base_name"]').val() != "") {
                var name = $('input[name="pattern_processing_base_name"]').attr('name')
                var value = $('input[name="pattern_processing_base_name"]').val()
                var obj = {}
                obj[name] = value
                $.ajax({
                    url: "/processing_base",
                    method: "POST",
                    data: obj,
                }).done(function () {
                    $('input[name="pattern_processing_base_name"]').val(null);
                    $('div#add-processing-base').modal('hide');
                    $('#select_processing_base').load(document.URL + ' #select_processing_base ');
                })
            }
        })
    })

    // Modal Add Special-conditions
    $('a#btn_add_special_conditions').on('click', function () {
        $('a#add-special-conditions').on('click', function () {
            if ($('input[name="classification_special_conditions_name"]').val() != "") {
                var name = $('input[name="classification_special_conditions_name"]').attr('name')
                var value = $('input[name="classification_special_conditions_name"]').val()
                var obj = {}
                obj[name] = value
                $.ajax({
                    url: "/event_process/add",
                    method: "POST",
                    data: obj,
                }).done(function () {
                    $('input[name="classification_special_conditions_name"]').val(null)
                    $('div#add_special_conditions').modal('hide')
                    $('#select_special_conditions').load(document.URL + ' #select_special_conditions')
                })
            }
        })
    })

} else if (document.getElementById('c_edit')) {
    // Sidebar
    console.log("มาเเก้ไขเเล้วโว้ยยยย");
    $('li#li-data-project-action').addClass('selected')
    $('a#li-data-project-action').addClass('active')
    $('ul#ul-data-project-action').addClass('in')
    $('a#a-export').addClass('active')
    $('ul#ul-export').addClass('in')
    $('a#a-classification').addClass('active')
    // ==================== ALL FUNCTION ON EDIT PAGE ===================
    var total_users = []
    var total_users_outside = []
    var now_id = document.getElementById('c_edit').getAttribute('data-mark')
    $.post('/classification/selectUsed', { value: "@lltr@Se1ectUsedCl@ssify", id: now_id }).done(function (result) {
        // console.log("wwwwwwwwwwwwwwwwwwwwwwwwwww", result);
        if ($('input[name="pattern_id"]').val() != null || $('input[name="pattern_id"]').val() != "") {
            $.post('/pattern/select-pattern', { value: "@lltr@Se1ectP@ttern", id: $('input[name="pattern_id"]').val(), id_classify: now_id }).done(function (result) {
                console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii", result);
                //  เลือก patter เพื่อหามาตราการ
                $.post('/classification/fetch/specific/edit/search', { firsOne: 0, IDclassifi: now_id, IDproccess: $('input[name="event_process_id"]').val(), IDpattern: $('input[name="pattern_id"]').val() }).done(function (result) {
                    createPatternSpecific(result)
                });

                let fullname = result.total_name_inside.map(e => e.join(" "))
                $('input[name="classify_user_access_info_process_inside_from_pattern_not_use"]').val([...fullname])
                $('input[name="classify_user_access_info_process_inside_from_pattern"]').val(result.pattern[0].pattern_processor_inside_id)
                let fullname_outside = result.total_name_outside.map(e => e.join(" "))
                $('input[name="classify_user_access_info_process_outside_from_pattern_not_use"]').val([...fullname_outside])
                $('input[name="classify_user_access_info_process_outside_from_pattern"]').val(result.pattern[0].pattern_processor_outside_id)
                var _file_ = ""
                var _database_ = ""
                if (result.pattern[0].pattern_type_data_file == 1) {
                    _file_ = "มี"
                } else {
                    _file_ = "ไม่มี"
                }
                if (result.pattern[0].pattern_type_database == 1) {
                    _database_ = result.pattern[0].pattern_type_database_name
                } else {
                    _database_ = "ไม่มี"
                }
                var _inside_ = ""
                var _outside_0 = ""
                var _outside_1 = ""
                var _outside_2 = ""
                var _outside_3 = ""
                if (result.pattern[0].pattern_storage_method_inside == 1) {
                    _inside_ = "มี"
                } else {
                    _inside_ = "ไม่มี"
                }
                if (result.pattern[0].pattern_storage_method_outside == 1) {
                    _outside_0 = "มี"
                    if (result.pattern[0].pattern_storage_method_outside_device == 1) {
                        _outside_1 = result.pattern[0].pattern_storage_method_outside_device_name
                    } else {
                        _outside_1 = "ไม่มี"
                    }
                    if (result.pattern[0].pattern_storage_method_outside_agent == 1) {
                        _outside_2 = result.pattern[0].pattern_storage_method_outside_agent_name
                    } else {
                        _outside_2 = "ไม่มี"
                    }
                    if (result.pattern[0].pattern_storage_method_outside_database_outside == 1) {
                        _outside_3 = result.pattern[0].pattern_storage_method_outside_database_outside_name
                    } else {
                        _outside_3 = "ไม่มี"
                    }
                } else {
                    _outside_0 = "ไม่มี"
                }
                var data_name_total = result.data_name_total.map(e => e['data_name'])
                data_name_total = data_name_total.join(", ")
                $('textarea[name="example_pattern"]').text(`ชื่อ: ${result.pattern[0].pattern_name}
ข้อมูล: ${data_name_total}
ระยะเวลา: ${convert_date(new Date(result.pattern[0].pattern_start_date))} ทั้งหมด: ${result.pattern[0].pattern_total_date} วัน
ชนิดข้อมูล:
    File Ms Excel / CSV: ${_file_}
                Database: ${_database_}
                วิธีการจัดเก็บข้อมูลส่วนบุคคล:
    ภายใน Alltra: ${_inside_}
                ภายนอก: ${_outside_0}, [(อุปกรณ์: ${_outside_1}), (Agent: ${_outside_2}), (Database: ${_outside_3}) ]`)
                check_doc_id_pattern();
                // $('div#select-pattern').modal('hide')
                $('#table-body-pattern-add').empty()
            })


        }
        if ($('input#customCheck1').is(':checked')) {
            $('input[name="classify_user_access_info_process_inside_from_pattern_not_use"]').removeAttr('hidden')
            $('span#user_access_information_process_inside').html(`
                    & nbsp;
                <a href="#select-users-inside" class="option-pattern" data-bs-toggle="modal">เลือกสมาชิกในระบบ Alltra</a> & nbsp; & nbsp;
                    <span class="h6" style="font-weight: bold;">รวม</span>
                    <input type="text" name="classify_user_access_info_process_inside_from_new_total" class="form-control" style="display: inline; width: 15%;" value="${result[0].classify_user_access_info_process_inside}" placeholder="กรุณาเลือกสมาชิก..." readonly/> & nbsp;
                <span class="h6" style="font-weight: bold;">คน</span> & nbsp;& nbsp;& nbsp;
                    <span class="span-image" id='user_inside'></span>
                    <input type="text" name="classify_user_access_info_process_inside_from_new_id" value="${result[0].classify_user_access_info_process_inside_from_new_id}" class="form-control input-all-number" readonly hidden/> & nbsp;
                `)
            let total_acc_id = result[0].classify_user_access_info_process_inside_from_new_id.split(",")
            for (i in total_acc_id) {
                $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: total_acc_id[i] }).done(function (result) {
                    total_users.push({ "id": result[0].acc_id, "image": result[0].image })
                    $('span#user_inside').empty()
                    $('input[name="classify_user_access_info_process_inside_from_new_total"]').val(total_users.length)
                    $('input[name="classify_user_access_info_process_inside_from_new_id"]').val(total_users.map(e => e['id']))
                    for (var k = 0; k < total_users.length; k++) {
                        // Image = 600x600
                        if (k < total_users.length - 1) {
                            $('span#user_inside').append('<img class="image-users" src="/UI/image/' + total_users[k].image + '" data-mark="' + total_users[k].id + '"/> &nbsp;')
                        } else {
                            $('span#user_inside').append('<img class="image-users" src="/UI/image/' + total_users[k].image + '" data-mark="' + total_users[k].id + '"/>')
                        }
                    }
                })
            }
            var count_click2 = 0
            $('a[href="#select-users-inside"]').on('click', function () {
                $.post('/users', { value: "@lltr@Cl@ssific@ti0nUser" }, function (result) {
                    count_click2 += 1
                    // ============================== Create Prepare ============================
                    var end_count = 0 // จำนวนทั้งหมด
                    var state = {
                        'querySet': result.users,
                        'page': 1,
                        'rows': 5,
                        'window': 5,
                    }
                    if (count_click2 == 1) {
                        buildTable()
                    }
                    function pagination(querySet, page, rows) {

                        var trimStart = (page - 1) * rows
                        var trimEnd = trimStart + rows

                        var trimmedData = querySet.slice(trimStart, trimEnd)

                        var pages = Math.ceil(querySet.length / rows);

                        var start_count = 1
                        document.getElementById('start-user-inside-add').innerHTML = start_count

                        return {
                            'querySet': trimmedData,
                            'pages': pages,
                        }
                    }
                    // ============================== Create Pagination ============================
                    function pageButtons(pages) {
                        var wrapper = document.getElementById('pagination-wapper-user-inside-add')
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
                            wrapper.innerHTML = `< li class="page-item" > <button value=${state.page - 1} class="page page-link"> ย้อนกลับ </button></li > `
                        } else {
                            wrapper.innerHTML = `< li class="page-item disabled" > <button value=${state.page - 1} class="page page-link" > ย้อนกลับ </button></li > `
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
                                        wrapper.innerHTML += `< li class="page-item active" > <button class="page page-link" value=${page}>${page}</button></li > `;
                                    }
                                    else {
                                        p = page - 1;
                                        wrapper.innerHTML += `< li class="page-item " > <button class="page page-link" value=${page}>${page}</button></li > `;
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
                                    wrapper.innerHTML += `< li class="page-item active" > <button class="page page-link" value=${page}>${page}</button></li > `
                                } else {
                                    wrapper.innerHTML += `< li class="page-item " > <button class="page page-link" value=${page}>${page}</button></li > `
                                }
                            }
                        }

                        if (state.page < pages) {
                            wrapper.innerHTML += `< li class="page-item" ></i > <button value=${state.page + 1} class="page page-link" > ถัดไป </button>`
                        } else {
                            wrapper.innerHTML += `< li class="page-item disabled" ></i > <button value=${state.page + 1} class="page page-link" > ถัดไป </button>`
                        }

                        $('.page').on('click', function () {
                            $('#table-body-user-inside-add').empty()
                            state.page = Number($(this).val())
                            // document.getElementById('page').value = state.page
                            buildTable()
                        })
                    }
                    // ============================== Create Table ============================
                    function buildTable() {
                        var table = $('#table-body-user-inside-add')
                        var data = pagination(state.querySet, state.page, state.rows)
                        var myList = data.querySet
                        for (y in myList) {
                            if (myList[y].acc_id != "") {
                                let buttonAdd = ""
                                let buttonDel = ""
                                let total_users = $('input[name="classify_user_access_info_process_inside_from_new_id"]').val().split(',')
                                if (state.page == 1) {
                                    if (checkUsers(total_users, result.id_users[y].acc_id, 0) == true) {
                                        buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                        buttonDel = '<a id="_del_users_inside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                    } else {
                                        buttonAdd = '<a id="_add_users_inside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                        buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                    }
                                } else {
                                    if (checkUsers(total_users, result.id_users[parseInt(state.rows) + parseInt(y)].acc_id, 0) == true) {
                                        buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                        buttonDel = '<a id="_del_users_inside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                    } else {
                                        buttonAdd = '<a id="_add_users_inside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                        buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                    }
                                }
                                //Keep in mind we are using "Template Litterals to create rows"
                                var row = '<tr>' +
                                    '<th style="text-align: left; vertical-align: center;">' +
                                    'ชื่อ - นามสกุล: ' + myList[y].firstname + " " + myList[y].lastname + " <br/>" +
                                    '</th>' +
                                    '<td style="vertical-align: middle; width: 50px;">' +
                                    buttonAdd +
                                    '</td>' +
                                    '<td style="vertical-align: middle; width: 50px;">' +
                                    buttonDel +
                                    '</td>' +
                                    '</tr>'
                                table.append(row)
                                end_count = myList[y].acc_id
                            }
                        }
                        if (myList.length == 0) {
                            var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;"> ไม่พบข้อมูล </td></tr>'
                            table.append(row)
                            $('#total-user-inside-add').text(0)
                            $('#start-user-inside-add').html(0)
                        } else {
                            if (myList[0].user_id) {
                                $('#start-user-inside-add').text(myList[0].acc_id)
                            }
                            pageButtons(data.pages)
                            $('#total-user-inside-add').text(result.users.length)
                        }
                        $('#end-user-inside-add').html(end_count)

                        $('a#_add_users_inside').on('click', function () {
                            $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: $(this).attr('data-value') }).done(function (result) {
                                total_users.push({ "id": result[0].acc_id, "image": result[0].image })
                                $('span#user_inside').empty()
                                $('input[name="classify_user_access_info_process_inside_from_new_total"]').val(total_users.length)
                                $('input[name="classify_user_access_info_process_inside_from_new_id"]').val(total_users.map(e => e['id']))
                                for (var k = 0; k < total_users.length; k++) {
                                    // Image = 600x600
                                    if (k < total_users.length - 1) {
                                        $('span#user_inside').append('<img class="image-users" src="/UI/image/' + total_users[k].image + '" data-mark="' + total_users[k].id + '"/> &nbsp;')
                                    } else {
                                        $('span#user_inside').append('<img class="image-users" src="/UI/image/' + total_users[k].image + '" data-mark="' + total_users[k].id + '"/>')
                                    }
                                }
                                $('#table-body-user-inside-add').empty()
                                buildTable()
                            })
                        })
                        $('a#_del_users_inside').on('click', function () {
                            $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: $(this).attr('data-value') }).done(function (result) {
                                let new_total_user = total_users.filter(function (item) { return item.id.toString().indexOf(result[0].acc_id) })
                                total_users = new_total_user
                                $('input[name="classify_user_access_info_process_inside_from_new_total"]').val(total_users.length)
                                $('input[name="classify_user_access_info_process_inside_from_new_id"]').val(total_users.map(e => e['id']))
                                for (var k = 0; k < $('span#user_inside').children().length; k++) {
                                    let old_image = $('span#user_inside').children()[k].getAttribute('data-mark')
                                    if (old_image == result[0].acc_id) {
                                        $('span#user_inside').children()[k].remove()
                                    }
                                }
                                $('#table-body-user-inside-add').empty()
                                buildTable()
                                if ($('input[name="classify_user_access_info_process_inside_from_new_total"]').val() == "0") {
                                    $('span#user_inside').empty()
                                }
                            })
                        })
                        //$('input[name="classify_user_access_info_process_inside_from_new_total"]').on('click keyup keydown focus', function () {
                        //    if ($(this).val() == "" || $(this).val() == null) {
                        //        $('span#user_inside').empty()
                        //    } else if ($(this).val() != String(total_image.length)) {
                        //        $('span#user_inside').last().remove()
                        //    }
                        //})
                    }
                })
            })
        }
        if ($('input#customCheck2').is(':checked')) {
            $('input[name="classify_user_access_info_process_outside_from_pattern_not_use"]').removeAttr('hidden')
            $('span#user_access_information_process_outside').html(`
                    & nbsp;
                <a href="#select-users-outside" class="option-pattern" data-bs-toggle="modal">เลือกสมาชิกในระบบ Alltra</a> & nbsp; & nbsp;
                    <span class="h6" style="font-weight: bold;">รวม</span>
                    <input type="text" name="classify_user_access_info_process_outside_from_new_total" class="form-control" style="display: inline; width: 15%;" value="${result[0].classify_user_access_info_process_outside}" placeholder="กรุณาเลือกสมาชิก..." readonly/> & nbsp;
                <span class="h6" style="font-weight: bold;">คน</span> & nbsp;& nbsp;& nbsp;
                    <span class="span-image" id="user_outside">
                    </span>
                    <input type="text" name="classify_user_access_info_process_outside_from_new_id" value="${result[0].classify_user_access_info_process_outside_from_new_id}" class="form-control input-all-number" readonly hidden/> & nbsp;
                `)
            let total_acc_id_outside = result[0].classify_user_access_info_process_outside_from_new_id.split(',')
            for (i in total_acc_id_outside) {
                $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: total_acc_id_outside[i] }).done(function (result) {
                    $('span#user_outside').empty()
                    total_users_outside.push({ "id": result[0].acc_id, "image": result[0].image })
                    $('input[name="classify_user_access_info_process_outside_from_new_total"]').val(total_users_outside.length)
                    $('input[name="classify_user_access_info_process_outside_from_new_id"]').val(total_users_outside.map(e => e['id']))
                    for (var k = 0; k < total_users_outside.length; k++) {
                        // Image = 600x600
                        if (k < total_users_outside.length - 1) {
                            $('span#user_outside').append('<img class="image-users" src="/UI/image/' + total_users_outside[k].image + '" data-mark="' + total_users_outside[k].id + '"/> &nbsp;')
                        } else {
                            $('span#user_outside').append('<img class="image-users" src="/UI/image/' + total_users_outside[k].image + '" data-mark="' + total_users_outside[k].id + '"/>')
                        }
                    }
                })
            }
            var count_click3 = 0
            $('a[href="#select-users-outside"]').on('click', function () {
                $.post('/users', { value: "@lltr@Cl@ssific@ti0nUser" }, function (result) {
                    count_click3 += 1
                    // ============================== Create Prepare ============================
                    var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                    var state = {
                        'querySet': result.users,
                        'page': 1,
                        'rows': 5,
                        'window': 5,
                    }
                    if (count_click3 == 1) {
                        buildTable()
                    }
                    function pagination(querySet, page, rows) {

                        var trimStart = (page - 1) * rows
                        var trimEnd = trimStart + rows

                        var trimmedData = querySet.slice(trimStart, trimEnd)

                        var pages = Math.ceil(querySet.length / rows);

                        var start_count = 1
                        document.getElementById('start-users-outside-add').innerHTML = start_count

                        return {
                            'querySet': trimmedData,
                            'pages': pages,
                        }
                    }
                    // ============================== Create Pagination ============================
                    function pageButtons(pages) {
                        var wrapper = document.getElementById('pagination-wapper-users-outside-add')
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
                            wrapper.innerHTML = `< li class="page-item" > <button value=${state.page - 1} class="page page-link"> ย้อนกลับ</button></li > `
                        } else {
                            wrapper.innerHTML = `< li class="page-item disabled" > <button value=${state.page - 1} class="page page-link" > ย้อนกลับ</button></li > `
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
                                        wrapper.innerHTML += `< li class="page-item active" > <button class="page page-link" value=${page}>${page}</button></li > `;
                                    }
                                    else {
                                        p = page - 1;
                                        wrapper.innerHTML += `< li class="page-item " > <button class="page page-link" value=${page}>${page}</button></li > `;
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
                                    wrapper.innerHTML += `< li class="page-item active" > <button class="page page-link" value=${page}>${page}</button></li > `
                                } else {
                                    wrapper.innerHTML += `< li class="page-item " > <button class="page page-link" value=${page}>${page}</button></li > `
                                }
                            }
                        }

                        if (state.page < pages) {
                            wrapper.innerHTML += `< li class="page-item" ></i > <button value=${state.page + 1} class="page page-link" >ถัดไป </button>`
                        } else {
                            wrapper.innerHTML += `< li class="page-item disabled" ></i > <button value=${state.page + 1} class="page page-link" >ถัดไป </button>`
                        }

                        $('.page').on('click', function () {
                            $('#table-body-users-outside-add').empty()
                            state.page = Number($(this).val())
                            // document.getElementById('page').value = state.page
                            buildTable()
                        })
                    }
                    // ============================== Create Table ============================
                    function buildTable() {
                        var table = $('#table-body-users-outside-add')
                        var data = pagination(state.querySet, state.page, state.rows)
                        var myList = data.querySet
                        for (y in myList) {
                            if (myList[y].acc_id != "") {
                                let buttonAdd = ""
                                let buttonDel = ""
                                let total_users = $('input[name="classify_user_access_info_process_outside_from_new_id"]').val().split(',')
                                if (state.page == 1) {
                                    if (checkUsers(total_users, result.id_users[y].acc_id, 0) == true) {
                                        buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                        buttonDel = '<a id="_del_users_outside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                    } else {
                                        buttonAdd = '<a id="_add_users_outside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                        buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                    }
                                } else {
                                    if (checkUsers(total_users, result.id_users[parseInt(state.rows) + parseInt(y)].acc_id, 0) == true) {
                                        buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                        buttonDel = '<a id="_del_users_outside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                    } else {
                                        buttonAdd = '<a id="_add_users_outside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                        buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                    }
                                }
                                //Keep in mind we are using "Template Litterals to create rows"
                                var row = '<tr>' +
                                    '<th style="text-align: left; vertical-align: center;">' +
                                    'ชื่อ-นามสกุล: ' + myList[y].firstname + " " + myList[y].lastname + " <br/>" +
                                    '</th>' +
                                    '<td style="vertical-align: middle; width: 50px;">' +
                                    buttonAdd +
                                    '</td>' +
                                    '<td style="vertical-align: middle; width: 50px;">' +
                                    buttonDel +
                                    '</td>' +
                                    '</tr>'
                                table.append(row)
                                end_count = myList[y].acc_id
                            }
                        }
                        if (myList.length == 0) {
                            var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                            table.append(row)
                            $('#total-users-outside-add').text(0)
                            $('#start-users-outside-add').html(0)
                        } else {
                            if (myList[0].acc_id) {
                                $('#start-users-outside-add').text(myList[0].acc_id)
                            }
                            pageButtons(data.pages)
                            $('#total-users-outside-add').text(result.users.length)
                        }

                        $('#end-users-outside-add').html(end_count)

                        $('a#_add_users_outside').on('click', function () {
                            $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: $(this).attr('data-value') }).done(function (result) {
                                $('span#user_outside').empty()
                                total_users_outside.push({ "id": result[0].acc_id, "image": result[0].image })
                                $('input[name="classify_user_access_info_process_outside_from_new_total"]').val(total_users_outside.length)
                                $('input[name="classify_user_access_info_process_outside_from_new_id"]').val(total_users_outside.map(e => e['id']))
                                for (var k = 0; k < total_users_outside.length; k++) {
                                    // Image = 600x600
                                    if (k < total_users_outside.length - 1) {
                                        $('span#user_outside').append('<img class="image-users" src="/UI/image/' + total_users_outside[k].image + '" data-mark="' + total_users_outside[k].id + '"/> &nbsp;')
                                    } else {
                                        $('span#user_outside').append('<img class="image-users" src="/UI/image/' + total_users_outside[k].image + '" data-mark="' + total_users_outside[k].id + '"/>')
                                    }
                                }
                                $('#table-body-users-outside-add').empty()
                                buildTable()
                            })
                        })
                        $('a#_del_users_outside').on('click', function () {
                            $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: $(this).attr('data-value') }).done(function (result) {
                                let new_total_users = total_users_outside.filter(function (item) { return item.id.toString().indexOf(result[0].acc_id) })
                                total_users_outside = new_total_users
                                $('input[name="classify_user_access_info_process_outside_from_new_total"]').val(total_users_outside.length)
                                $('input[name="classify_user_access_info_process_outside_from_new_id"]').val(total_users_outside.map(e => e['id']))
                                for (var k = 0; k < $('span#user_outside').children().length; k++) {
                                    let old_image = $('span#user_outside').children()[k].getAttribute('data-mark')
                                    if (old_image == result[0].acc_id) {
                                        $('span#user_outside').children()[k].remove()
                                    }
                                }
                                if ($('input[name="classify_user_access_info_process_outside_from_new_total"]').val() == 0) {
                                    $('span#user_outside').empty()
                                }
                                $('#table-body-users-outside-add').empty()
                                buildTable()
                            })
                        })
                        //$('input[name="classify_user_access_info_process_outside_from_new_total"]').on('click keyup keydown focus', function () {
                        //    if ($(this).val() == "" || $(this).val() == null) {
                        //        $('span#user_outside').empty()
                        //    }
                        //})
                    }
                })
            })
        }
        if ($('input#customCheck3').is(':checked')) {
            $('span#period_process_follow_policy').html(`
                    & nbsp; <input type="text" name="classify_period_proccess_follow_policy_total" value="${result[0].classify_period_proccess_follow_policy_total}" placeholder="" class="form-control" value="180" style="width: 52%; display: inline;" readonly /> & nbsp;
                <span class="font-bold">วัน</span>
                `)
        }
        if ($('input#customCheck4').is(':checked')) {
            $('input[name="classify_period_end_follow_pattern_total"]').removeAttr('hidden')
            $('span#day_end_pattern').removeAttr('hidden')
        }
        // if ($('input#customRadio21').is(':checked')) {
        //     let datamark_agin1 = ["", ""]

        //     let datamark_agin = ["", "", ""]
        //     if (result[0].classify_type_data_in_event_personal_datamark == 3) {
        //         datamark_agin1[0] = "checked"
        //         datamark_agin[0] = "checked"
        //     } else {
        //         datamark_agin1[1] = "checked"
        //     }
        //     if (result[0].classify_type_data_in_event_personal_datamark == 0) {
        //         datamark_agin[0] = "checked"
        //     } else if (result[0].classify_type_data_in_event_personal_datamark == 1) {
        //         datamark_agin[1] = "checked"
        //     } else if (result[0].classify_type_data_in_event_personal_datamark == 2) {
        //         datamark_agin[2] = "checked"
        //     }
        //     $('span#event_personal_datamark').html(`
        //         <table class="table table-boardless">
        //             <td width="40%">
        //                 <input type="radio" id="not_use" name="classify_type_data_in_event_personal_datamark1" class="form-check-input" value="3" ${datamark_agin1[0]}/>
        //                 <label for="not_use">Anonymized Data (ไม่ระบุข้อมูล) </label>
        //             </td>
        //             <td width="50%">
        //                 <input type="radio" id="not_use1" name="classify_type_data_in_event_personal_datamark1" class="form-check-input" ${datamark_agin1[1]} />
        //                 <label for="not_used1">Pseudonymized Data (ข้อมูลที่มีการแฝง) </label>
        //             </td> 
        //         </table>
        //         <span id="pseudonymized"></span>
        //         <span id="total-pseudonymized"></span>
        //         `)
        //     if ($('input:radio[name="classify_type_data_in_event_personal_datamark1"]:checked').length > 0) {
        //         if ($('input:radio[name="classify_type_data_in_event_personal_datamark1"]:checked').attr('id') == 'not_use1') {
        //             $('span#pseudonymized').html(`
        //                     <table class="table table-boardless" id="pseudonymized">
        //                         <td width="32%">
        //                             <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark1" value="0" class="form-check-input" ${datamark_agin[0]} />
        //                             <label for="datamark1" > หัวข้อมูลอย่างเดียว </label>
        //                         </td>
        //                         <td width="30%">
        //                             <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark2" value="1" class="form-check-input" ${datamark_agin[1]}/>
        //                             <label for="datamark2" > หัวและท้ายข้อมูล </label>
        //                         </td>
        //                         <td>
        //                             <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark3" value="2" class="form-check-input" ${datamark_agin[2]}/>
        //                             <label for="datamark3" > ท้ายข้อมูลอย่างเดียว </label>
        //                         </td>
        //                     </table>
        //                     `)
        //             $('span#total-pseudonymized').html(`
        //                     <table class="table table-boardless" id="total-pseudonymized">
        //                         <td style="width: 35%; text-align: right;">
        //                             <label for="total-digit"> จำนวนตัวอักษรที่แสดง:  </label>
        //                         </td>
        //                         <td>
        //                             <input type="number" min="1" name="classify_type_data_in_event_personal_datamark_total" placeholder="กรุณาป้อนจำนวน..." class="form-control" value="${result[0].classify_type_data_in_event_personal_datamark_total}" />
        //                         </td>
        //                     </table>
        //                     <span id="example-datamark"></span>
        //                     `)
        //             let seleced = $('input:radio[name="classify_type_data_in_event_personal_datamark"]:checked')
        //             if (seleced.attr('id') == 'datamark1') {
        //                 $('span#example-datamark').html(`
        //                 <table class="table table-boardless">
        //                     <td>
        //                         สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["****ย่าง"]
        //                     </td>
        //                 </table>
        //                 `)
        //             } else if (seleced.attr('id') == 'datamark2') {
        //                 $('span#example-datamark').html(`
        //                 <table class="table table-boardless">
        //                     <td>
        //                         สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">3</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["***ย***"]
        //                     </td>
        //                 </table>
        //                 `)
        //             } else if (seleced.attr('id') == 'datamark3') {
        //                 $('span#example-datamark').html(`
        //                 <table class="table table-boardless">
        //                     <td>
        //                         สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["ตัวอ****"]
        //                     </td>
        //                 </table>
        //                 `)
        //             }
        //         }
        //     }
        //     $('input:radio[name="classify_type_data_in_event_personal_datamark1"]').on('click', function () {
        //         if ($(this).attr('id') == 'not_use') {
        //             $('span#pseudonymized').empty();
        //             $('span#total-pseudonymized').empty();
        //         } else {
        //             $('span#pseudonymized').html(`
        //                     <table class="table table-boardless" id="pseudonymized">
        //                         <td width="32%">
        //                             <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark1" value="0" class="form-check-input" ${datamark_agin[0]} />
        //                             <label for="datamark1" > หัวข้อมูลอย่างเดียว </label>
        //                         </td>
        //                         <td width="30%">
        //                             <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark2" value="1" class="form-check-input" ${datamark_agin[1]}/>
        //                             <label for="datamark2" > หัวและท้ายข้อมูล </label>
        //                         </td>
        //                         <td>
        //                             <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark3" value="2" class="form-check-input" ${datamark_agin[2]}/>
        //                             <label for="datamark3" > ท้ายข้อมูลอย่างเดียว </label>
        //                         </td>
        //                     </table>
        //                     `)
        //             $('span#total-pseudonymized').html(`
        //                     <table class="table table-boardless" id="total-pseudonymized">
        //                         <td style="width: 35%; text-align: right;">
        //                             <label for="total-digit"> จำนวนตัวอักษรที่แสดง:  </label>
        //                         </td>
        //                         <td>
        //                             <input type="number" min="1" name="classify_type_data_in_event_personal_datamark_total" placeholder="กรุณาป้อนจำนวน..." class="form-control" value="${result[0].classify_type_data_in_event_personal_datamark_total}" />
        //                         </td>
        //                     </table>
        //                     <span id="example-datamark"></span>
        //                     `)
        //             let seleced = $('input:radio[name="classify_type_data_in_event_personal_datamark"]:checked')
        //             if (seleced.attr('id') == 'datamark1') {
        //                 $('span#example-datamark').html(`
        //                 <table class="table table-boardless">
        //                     <td>
        //                         สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["****ย่าง"]
        //                     </td>
        //                 </table>
        //                 `)
        //             } else if (seleced.attr('id') == 'datamark2') {
        //                 $('span#example-datamark').html(`
        //                 <table class="table table-boardless">
        //                     <td>
        //                         สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">3</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["***ย***"]
        //                     </td>
        //                 </table>
        //                 `)
        //             } else if (seleced.attr('id') == 'datamark3') {
        //                 $('span#example-datamark').html(`
        //                 <table class="table table-boardless">
        //                     <td>
        //                         สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["ตัวอ****"]
        //                     </td>
        //                 </table>
        //                 `)
        //             }
        //         }
        //         $('input:radio[name="classify_type_data_in_event_personal_datamark"]').on('click', function () {
        //             if ($(this).attr('id') == 'datamark1') {
        //                 $('span#example-datamark').html(`
        //                 <table class="table table-boardless">
        //                     <td>
        //                         สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["****ย่าง"]
        //                     </td>
        //                 </table>
        //                 `)
        //             } else if ($(this).attr('id') == 'datamark2') {
        //                 $('span#example-datamark').html(`
        //                 <table class="table table-boardless">
        //                     <td>
        //                         สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">3</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["***ย***"]
        //                     </td>
        //                 </table>
        //                 `)
        //             } else if ($(this).attr('id') == 'datamark3') {
        //                 $('span#example-datamark').html(`
        //                 <table class="table table-boardless">
        //                     <td>
        //                         สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["ตัวอ****"]
        //                     </td>
        //                 </table>
        //                 `)
        //             }
        //         })
        //     })
        // }
        if ($('input[name="classify_risk_assess_only_dpo_data_number_all_used_process_many"]').is(":checked")) {
            $('span#risk_assess_only_dpo_data_number_all_used_process_total').html(`
            <div class="row"><div>ระบุ</div><div><input type="text" name="classify_risk_assess_only_dpo_data_number_all_used_process_total" value="${result[0].classify_risk_assess_only_dpo_data_number_all_used_process_total}"placeholder="กรุณาป้อนจำนวน..." class="form-control"  /></div>  </div>
            `)
        }



    })
    $('input:checkbox').on('click', function () {
        // Modal Add User (Inside)
        if ($(this).attr('id') == 'customCheck1') {
            if ($(this).is(':checked') == true) {
                $.post('/classification/selectUsed', { value: "@lltr@Se1ectUsedCl@ssify", id: now_id }).done(function (result) {
                    $('input[name="classify_user_access_info_process_inside_from_pattern_not_use"]').removeAttr('hidden')
                    $('span#user_access_information_process_inside').html(`
                &nbsp; 
                    <a href="#select-users-inside" class="option-pattern" data-bs-toggle="modal">เลือกสมาชิกในระบบ Alltra</a>&nbsp; &nbsp;
                    <span class="h6" style="font-weight: bold;">รวม</span>
                    <input type="text" name="classify_user_access_info_process_inside_from_new_total" class="form-control" style="display: inline; width: 15%;" value="${result[0].classify_user_access_info_process_inside}" placeholder="กรุณาเลือกสมาชิก..." readonly/>&nbsp;
                    <span class="h6" style="font-weight: bold;">คน</span>&nbsp;&nbsp;&nbsp;
                    <span class="span-image" id='user_inside'></span>
                    <input type="text" name="classify_user_access_info_process_inside_from_new_id" value="${result[0].classify_user_access_info_process_inside_from_new_id}" class="form-control input-all-number" readonly hidden/>&nbsp;
                `)
                    let total_acc_id = result[0].classify_user_access_info_process_inside_from_new_id.split(",")
                    for (i in total_acc_id) {
                        $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: total_acc_id[i] }).done(function (result) {
                            $('span#user_inside').empty()
                            $('input[name="classify_user_access_info_process_inside_from_new_total"]').val(total_users.length)
                            $('input[name="classify_user_access_info_process_inside_from_new_id"]').val(total_users.map(e => e['id']))
                            for (var k = 0; k < total_users.length; k++) {
                                // Image = 600x600
                                if (k < total_users.length - 1) {
                                    $('span#user_inside').append('<img class="image-users" src="/UI/image/' + total_users[k].image + '" data-mark="' + total_users[k].id + '"/> &nbsp;')
                                } else {
                                    $('span#user_inside').append('<img class="image-users" src="/UI/image/' + total_users[k].image + '" data-mark="' + total_users[k].id + '"/>')
                                }
                            }
                        })
                    }
                    var count_click2 = 0
                    $('a[href="#select-users-inside"]').on('click', function () {
                        $.post('/users', { value: "@lltr@Cl@ssific@ti0nUser" }, function (result) {
                            count_click2 += 1
                            // ============================== Create Prepare ============================
                            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                            var state = {
                                'querySet': result.users,
                                'page': 1,
                                'rows': 5,
                                'window': 5,
                            }
                            if (count_click2 == 1) {
                                buildTable()
                            }
                            function pagination(querySet, page, rows) {

                                var trimStart = (page - 1) * rows
                                var trimEnd = trimStart + rows

                                var trimmedData = querySet.slice(trimStart, trimEnd)

                                var pages = Math.ceil(querySet.length / rows);

                                var start_count = 1
                                document.getElementById('start-user-inside-add').innerHTML = start_count

                                return {
                                    'querySet': trimmedData,
                                    'pages': pages,
                                }
                            }
                            // ============================== Create Pagination ============================
                            function pageButtons(pages) {
                                var wrapper = document.getElementById('pagination-wapper-user-inside-add')
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
                                    $('#table-body-user-inside-add').empty()
                                    state.page = Number($(this).val())
                                    // document.getElementById('page').value = state.page
                                    buildTable()
                                })
                            }
                            // ============================== Create Table ============================
                            function buildTable() {
                                var table = $('#table-body-user-inside-add')
                                var data = pagination(state.querySet, state.page, state.rows)
                                var myList = data.querySet
                                for (y in myList) {
                                    if (myList[y].acc_id != "") {
                                        let buttonAdd = ""
                                        let buttonDel = ""
                                        let total_users = $('input[name="classify_user_access_info_process_inside_from_new_id"]').val().split(',')
                                        if (state.page == 1) {
                                            if (checkUsers(total_users, result.id_users[y].acc_id, 0) == true) {
                                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                                buttonDel = '<a id="_del_users_inside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            } else {
                                                buttonAdd = '<a id="_add_users_inside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                            }
                                        } else {
                                            if (checkUsers(total_users, result.id_users[parseInt(state.rows) + parseInt(y)].acc_id, 0) == true) {
                                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                                buttonDel = '<a id="_del_users_inside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            } else {
                                                buttonAdd = '<a id="_add_users_inside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                            }
                                        }
                                        //Keep in mind we are using "Template Litterals to create rows"
                                        var row = '<tr>' +
                                            '<th style="vertical-align: center;">' +
                                            'ชื่อ-นามสกุล: ' + myList[y].firstname + " " + myList[y].lastname + " <br/>" +
                                            '</th>' +
                                            '<td style="vertical-align: middle; width: 50px;">' +
                                            buttonAdd +
                                            '</td>' +
                                            '<td style="vertical-align: middle; width: 50px;">' +
                                            buttonDel +
                                            '</td>' +
                                            '</tr>'
                                        table.append(row)
                                        end_count = myList[y].acc_id
                                    }
                                }
                                if (myList.length == 0) {
                                    var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                                    table.append(row)
                                    $('#total-user-inside-add').text(0)
                                    $('#start-user-inside-add').html(0)
                                } else {
                                    if (myList[0].user_id) {
                                        $('#start-user-inside-add').text(myList[0].acc_id)
                                    }
                                    pageButtons(data.pages)
                                    $('#total-user-inside-add').text(result.users.length)
                                }
                                $('#end-user-inside-add').html(end_count)

                                $('a#_add_users_inside').on('click', function () {
                                    $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: $(this).attr('data-value') }).done(function (result) {
                                        total_users.push({ "id": result[0].acc_id, "image": result[0].image })
                                        $('span#user_inside').empty()
                                        var length_users = new Set(total_users)
                                        total_users = [...length_users]
                                        $('input[name="classify_user_access_info_process_inside_from_new_total"]').val(total_users.length)
                                        $('input[name="classify_user_access_info_process_inside_from_new_id"]').val(total_users.map(e => e['id']))
                                        for (var k = 0; k < total_users.length; k++) {
                                            // Image = 600x600
                                            if (k < total_users.length - 1) {
                                                $('span#user_inside').append('<img class="image-users" src="/UI/image/' + total_users[k].image + '" data-mark="' + total_users[k].id + '"/> &nbsp;')
                                            } else {
                                                $('span#user_inside').append('<img class="image-users" src="/UI/image/' + total_users[k].image + '" data-mark="' + total_users[k].id + '"/>')
                                            }
                                        }
                                        $('#table-body-user-inside-add').empty()
                                        buildTable()
                                    })
                                })
                                $('a#_del_users_inside').on('click', function () {
                                    $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: $(this).attr('data-value') }).done(function (result) {
                                        let new_total_user = total_users.filter(function (item) { return item.id.toString().indexOf(result[0].acc_id) })
                                        total_users = new_total_user
                                        $('input[name="classify_user_access_info_process_inside_from_new_total"]').val(total_users.length)
                                        $('input[name="classify_user_access_info_process_inside_from_new_id"]').val(total_users.map(e => e['id']))
                                        for (var k = 0; k < $('span#user_inside').children().length; k++) {
                                            let old_image = $('span#user_inside').children()[k].getAttribute('data-mark')
                                            if (old_image == result[0].acc_id) {
                                                $('span#user_inside').children()[k].remove()
                                            }
                                        }
                                        $('#table-body-user-inside-add').empty()
                                        buildTable()
                                        if ($('input[name="classify_user_access_info_process_inside_from_new_total"]').val() == "0") {
                                            $('span#user_inside').empty()
                                        }
                                    })
                                })
                                //$('input[name="classify_user_access_info_process_inside_from_new_total"]').on('click keyup keydown focus', function () {
                                //    if ($(this).val() == "" || $(this).val() == null) {
                                //        $('span#user_inside').empty()
                                //    } else if ($(this).val() != String(total_image.length)) {
                                //        $('span#user_inside').last().remove()
                                //    }
                                //})
                            }
                        })
                    })
                })
            } else {
                $('input[name="classify_user_access_info_process_inside_from_pattern_not_use"]').attr('hidden', 'hidden')
                $('span#user_access_information_process_inside').empty()
                $('tbody#table-body-user-inside-add').empty()
                $('ul#pagination-wapper-user-inside-add').empty()
                $('span#start-user-inside-add').empty()
                $('span#end-user-inside-add').empty()
                $('span#total-user-inside-add').empty()
            }
        }
        // Modal Add User (Outside)
        if ($(this).attr('id') == 'customCheck2') {
            if ($(this).is(':checked') == true) {
                $.post('/classification/selectUsed', { value: "@lltr@Se1ectUsedCl@ssify", id: now_id }).done(function (result) {
                    $('input[name="classify_user_access_info_process_outside_from_pattern_not_use"]').removeAttr('hidden')
                    $('span#user_access_information_process_outside').html(`
                &nbsp;
                    <a href="#select-users-outside" class="option-pattern" data-bs-toggle="modal">เลือกสมาชิกในระบบ Alltra</a>&nbsp; &nbsp;
                    <span class="h6" style="font-weight: bold;">รวม</span>
                    <input type="text" name="classify_user_access_info_process_outside_from_new_total" value="${result[0].classify_user_access_info_process_outside}" class="form-control" style="display: inline; width: 15%;" placeholder="กรุณาเลือกสมาชิก..." readonly/>&nbsp;
                    <span class="h6" style="font-weight: bold;">คน</span>&nbsp;&nbsp;&nbsp;
                    <span class="span-image" id="user_outside">

                    </span>
                    <input type="text" name="classify_user_access_info_process_outside_from_new_id" value="${result[0].classify_user_access_info_process_outside_from_new_id}" class="form-control input-all-number" readonly hidden/>&nbsp;
                `)
                    let total_acc_id_outside = result[0].classify_user_access_info_process_outside_from_new_id.split(',')
                    for (i in total_acc_id_outside) {
                        $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: total_acc_id_outside[i] }).done(function (result) {
                            $('span#user_outside').empty()
                            $('input[name="classify_user_access_info_process_outside_from_new_total"]').val(total_users_outside.length)
                            $('input[name="classify_user_access_info_process_outside_from_new_id"]').val(total_users_outside.map(e => e['id']))
                            for (var k = 0; k < total_users_outside.length; k++) {
                                // Image = 600x600
                                if (k < total_users_outside.length - 1) {
                                    $('span#user_outside').append('<img class="image-users" src="/UI/image/' + total_users_outside[k].image + '" data-mark="' + total_users_outside[k].id + '"/> &nbsp;')
                                } else {
                                    $('span#user_outside').append('<img class="image-users" src="/UI/image/' + total_users_outside[k].image + '" data-mark="' + total_users_outside[k].id + '"/>')
                                }
                            }
                        })
                    }
                    var count_click3 = 0
                    $('a[href="#select-users-outside"]').on('click', function () {
                        $.post('/users', { value: "@lltr@Cl@ssific@ti0nUser" }, function (result) {
                            count_click3 += 1
                            // ============================== Create Prepare ============================
                            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                            var state = {
                                'querySet': result.users,
                                'page': 1,
                                'rows': 5,
                                'window': 5,
                            }
                            if (count_click3 == 1) {
                                buildTable()
                            }
                            function pagination(querySet, page, rows) {

                                var trimStart = (page - 1) * rows
                                var trimEnd = trimStart + rows

                                var trimmedData = querySet.slice(trimStart, trimEnd)

                                var pages = Math.ceil(querySet.length / rows);

                                var start_count = 1
                                document.getElementById('start-users-outside-add').innerHTML = start_count

                                return {
                                    'querySet': trimmedData,
                                    'pages': pages,
                                }
                            }
                            // ============================== Create Pagination ============================
                            function pageButtons(pages) {
                                var wrapper = document.getElementById('pagination-wapper-users-outside-add')
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
                                    $('#table-body-users-outside-add').empty()
                                    state.page = Number($(this).val())
                                    // document.getElementById('page').value = state.page
                                    buildTable()
                                })
                            }
                            // ============================== Create Table ============================
                            function buildTable() {
                                var table = $('#table-body-users-outside-add')
                                var data = pagination(state.querySet, state.page, state.rows)
                                var myList = data.querySet
                                for (y in myList) {
                                    if (myList[y].acc_id != "") {
                                        let buttonAdd = ""
                                        let buttonDel = ""
                                        let total_users = $('input[name="classify_user_access_info_process_outside_from_new_id"]').val().split(',')
                                        if (state.page == 1) {
                                            if (checkUsers(total_users, result.id_users[y].acc_id, 0) == true) {
                                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                                buttonDel = '<a id="_del_users_outside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            } else {
                                                buttonAdd = '<a id="_add_users_outside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                            }
                                        } else {
                                            if (checkUsers(total_users, result.id_users[parseInt(state.rows) + parseInt(y)].acc_id, 0) == true) {
                                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                                buttonDel = '<a id="_del_users_outside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            } else {
                                                buttonAdd = '<a id="_add_users_outside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                            }
                                        }
                                        //Keep in mind we are using "Template Litterals to create rows"
                                        var row = '<tr>' +
                                            '<th style="text-align: left; vertical-align: center;">' +
                                            'ชื่อ-นามสกุล: ' + myList[y].firstname + " " + myList[y].lastname + " <br/>" +
                                            '</th>' +
                                            '<td style="vertical-align: middle; width: 50px;">' +
                                            buttonAdd +
                                            '</td>' +
                                            '<td style="vertical-align: middle; width: 50px;">' +
                                            buttonDel +
                                            '</td>' +
                                            '</tr>'
                                        table.append(row)
                                        end_count = myList[y].acc_id
                                    }
                                }
                                if (myList.length == 0) {
                                    var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                                    table.append(row)
                                    $('#total-users-outside-add').text(0)
                                    $('#start-users-outside-add').html(0)
                                } else {
                                    if (myList[0].acc_id) {
                                        $('#start-users-outside-add').text(myList[0].acc_id)
                                    }
                                    pageButtons(data.pages)
                                    $('#total-users-outside-add').text(result.users.length)
                                }

                                $('#end-users-outside-add').html(end_count)

                                $('a#_add_users_outside').on('click', function () {
                                    $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: $(this).attr('data-value') }).done(function (result) {
                                        $('span#user_outside').empty()
                                        total_users_outside.push({ "id": result[0].acc_id, "image": result[0].image })
                                        $('input[name="classify_user_access_info_process_outside_from_new_total"]').val(total_users_outside.length)
                                        $('input[name="classify_user_access_info_process_outside_from_new_id"]').val(total_users_outside.map(e => e['id']))
                                        for (var k = 0; k < total_users_outside.length; k++) {
                                            // Image = 600x600
                                            if (k < total_users_outside.length - 1) {
                                                $('span#user_outside').append('<img class="image-users" src="/UI/image/' + total_users_outside[k].image + '" data-mark="' + total_users_outside[k].id + '"/> &nbsp;')
                                            } else {
                                                $('span#user_outside').append('<img class="image-users" src="/UI/image/' + total_users_outside[k].image + '" data-mark="' + total_users_outside[k].id + '"/>')
                                            }
                                        }
                                        $('#table-body-users-outside-add').empty()
                                        buildTable()
                                    })
                                })
                                $('a#_del_users_outside').on('click', function () {
                                    $.post('/users/get', { value: "@lltr@Cl@ssifyGetUser", id: $(this).attr('data-value') }).done(function (result) {
                                        let new_total_users = total_users_outside.filter(function (item) { return item.id.toString().indexOf(result[0].acc_id) })
                                        total_users_outside = new_total_users
                                        $('input[name="classify_user_access_info_process_outside_from_new_total"]').val(total_users_outside.length)
                                        $('input[name="classify_user_access_info_process_outside_from_new_id"]').val(total_users_outside.map(e => e['id']))
                                        for (var k = 0; k < $('span#user_outside').children().length; k++) {
                                            let old_image = $('span#user_outside').children()[k].getAttribute('data-mark')
                                            if (old_image == result[0].acc_id) {
                                                $('span#user_outside').children()[k].remove()
                                            }
                                        }
                                        if ($('input[name="classify_user_access_info_process_outside_from_new_total"]').val() == 0) {
                                            $('span#user_outside').empty()
                                        }
                                        $('#table-body-users-outside-add').empty()
                                        buildTable()
                                    })
                                })
                                //$('input[name="classify_user_access_info_process_outside_from_new_total"]').on('click keyup keydown focus', function () {
                                //    if ($(this).val() == "" || $(this).val() == null) {
                                //        $('span#user_outside').empty()
                                //    }
                                //})
                            }
                        })
                    })
                })
            } else {
                $('input[name="user_access_info_process_outside_from_pattern_not_use"]').attr('hidden', 'hidden')
                $('span#user_access_information_process_outside').empty()
                $('tbody#table-body-users-outside-add').empty()
                $('ul#pagination-wapper-users-outside-add').empty()
                $('span#start-users-outside-add').empty()
                $('span#end-users-outside-add').empty()
                $('span#total-users-outside-add').empty()
            }
        }
        if ($(this).attr('id') == 'customCheck3') {
            if ($(this).is(':checked') == true) {
                $('span#period_process_follow_policy').html(`

                <div class="input-group">
                <input type="text" name="classify_period_proccess_follow_policy_total" placeholder="" class="form-control" value="180"  readonly/>
                                        <span class="input-group-text">
                                        วัน
                                        </span>
                                    </div>
                `)
            } else {
                $('span#period_process_follow_policy').empty()
            }
        }
        if ($(this).attr('id') == 'customCheck4') {
            if ($(this).is(':checked') == true) {
                $('input[name="classify_period_end_follow_pattern_total"]').removeAttr('hidden')
                $('span#day_end_pattern').removeAttr('hidden')
            } else {
                $('input[name="classify_period_end_follow_pattern_total"]').attr('hidden', true)
                $('span#day_end_pattern').attr('hidden', true)
            }
        }
    })
    $('input:radio').on('click', function () {
        if ($(this).attr("name") == 'classify_risk_assess_only_dpo_data_number_all_used_process_many') {
            if ($(this).attr('id') == "customRadio5" || $(this).attr('id') == "customRadio4") {
                $('span#risk_assess_only_dpo_data_number_all_used_process_total').html(`
                <div class="row"><div>ระบุ</div><div><input type="text" name="classify_risk_assess_only_dpo_data_number_all_used_process_total" value="${result[0].classify_risk_assess_only_dpo_data_number_all_used_process_total}"placeholder="กรุณาป้อนจำนวน..." class="form-control"/>  </div></div>
                `)
            } else {
                $('span#risk_assess_only_dpo_data_number_all_used_process_total').empty();
            }
        }
        //if ($(this).attr('name') == 'classify_risk_assess_only_dpo_assess_the_impact_of_data') {
        //    if ($(this).attr('id') == "customRadio14" || $(this).attr('id') == "customRadio15" || $(this).attr('id') == "customRadio16") {
        //        $('div#classification_risk_assessment_only_dpo_fix_a_leak_of_data').html(`
        //    <label class="form-check-label h6" style="font-weight: bold;">วิธีแก้ไขเมื่อเกิดข้อมูลรั่วไหลหรือผลกระทบต่อเจ้าของข้อมูล</label>
        //    <div>
        //       <input type="text" name="classify_risk_assess_only_dpo_fix_a_leak_of_data" id="" style="width: 47%;" placeholder="กรุณาป้อนวิธีแก้ไข..." class="form-control">
        //    </div>
        //    `)
        //    }
        //}
        //if ($(this).attr('name') == 'classify_risk_assess_only_dpo_assess_the_impact_of_organization') {
        //    if ($(this).attr('id') == "customRadio17" || $(this).attr('id') == "customRadio18" || $(this).attr('id') == "customRadio19") {
        //        $('div#classification_risk_assessment_only_dpo_fix_a_leak_of_organization').html(`
        //    <label class="form-check-label h6"
        //    style="font-weight: bold;">วิธีแก้ไขเมื่อเกิดข้อมูลรั่วไหลหรือผลกระทบต่อองค์กร</label>
        //<div>
        //    <input type="text" name="classify_risk_assess_only_dpo_fix_a_leak_of_organization" id="" style="width: 47%;" placeholder="กรุณาป้อนวิธีแก้ไข..." class="form-control">
        //</div>
        //    `)
        //    }
        //}
        if ($(this).attr('name') == 'classify_type_data_in_event_personal_datamark_check_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
            if ($(this).val() == 1) {
                $.post('/classification/selectUsed', { value: "@lltr@Se1ectUsedCl@ssify", id: now_id }).done(function (result) {
                    let datamark_agin1 = ["", ""]
                    if (result[0].classify_type_data_in_event_personal_datamark == 3) {
                        datamark_agin1[0] = "checked"
                    } else {
                        datamark_agin1[1] = "checked"
                    }
                    let datamark_agin = ["", "", ""]
                    if (result[0].classify_type_data_in_event_personal_datamark == 0) {
                        datamark_agin[0] = "checked"
                    } else if (result[0].classify_type_data_in_event_personal_datamark == 1) {
                        datamark_agin[1] = "checked"
                    } else if (result[0].classify_type_data_in_event_personal_datamark == 2) {
                        datamark_agin[2] = "checked"
                    }
                    $('span#event_personal_datamark').html(`
                <table class="table table-boardless">
                    <td width="40%">
                        <input type="radio" id="not_use" name="classify_type_data_in_event_personal_datamark1" class="form-check-input" value="3" ${datamark_agin1[0]}/>
                        <label for="not_use">Anonymized Data (ไม่ระบุข้อมูล) </label>
                    </td>
                    <td width="50%">
                        <input type="radio" id="not_use1" name="classify_type_data_in_event_personal_datamark1" class="form-check-input" ${datamark_agin1[1]} />
                        <label for="not_used1">Pseudonymized Data (ข้อมูลที่มีการแฝง) </label>
                    </td> 
                </table>
                <span id="pseudonymized"></span>
                <span id="total-pseudonymized"></span>
                `)
                    if ($('input:radio[name="classify_type_data_in_event_personal_datamark1"]:checked').length > 0) {
                        if ($('input:radio[name="classify_type_data_in_event_personal_datamark1"]:checked').attr('id') == 'not_use1') {
                            $('span#pseudonymized').html(`
                            <table class="table table-boardless" id="pseudonymized">
                                <td width="32%">
                                    <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark1" value="0" class="form-check-input" ${datamark_agin[0]} />
                                    <label for="datamark1" > หัวข้อมูลอย่างเดียว </label>
                                </td>
                                <td width="30%">
                                    <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark2" value="1" class="form-check-input" ${datamark_agin[1]}/>
                                    <label for="datamark2" > หัวและท้ายข้อมูล </label>
                                </td>
                                <td>
                                    <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark3" value="2" class="form-check-input" ${datamark_agin[2]}/>
                                    <label for="datamark3" > ท้ายข้อมูลอย่างเดียว </label>
                                </td>
                            </table>
                            `)
                            $('span#total-pseudonymized').html(`
                            <table class="table table-boardless" id="total-pseudonymized">
                                <td style="width: 35%; text-align: right;">
                                    <label for="total-digit"> จำนวนตัวอักษรที่แสดง:  </label>
                                </td>
                                <td>
                                    <input type="number" min="1" name="classify_type_data_in_event_personal_datamark_total" placeholder="กรุณาป้อนจำนวน..." class="form-control" value="${result[0].classify_type_data_in_event_personal_datamark_total}" />
                                </td>
                            </table>
                            <span id="example-datamark"></span>
                            `)
                            let seleced = $('input:radio[name="classify_type_data_in_event_personal_datamark"]:checked')
                            if (seleced.attr('id') == 'datamark1') {
                                $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["****ย่าง"]
                            </td>
                        </table>
                        `)
                            } else if (seleced.attr('id') == 'datamark2') {
                                $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">3</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["***ย***"]
                            </td>
                        </table>
                        `)
                            } else if (seleced.attr('id') == 'datamark3') {
                                $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["ตัวอ****"]
                            </td>
                        </table>
                        `)
                            }
                        }
                    }
                    $('input:radio[name="classify_type_data_in_event_personal_datamark1"]').on('click', function () {
                        if ($(this).attr('id') == 'not_use') {
                            $('span#pseudonymized').empty();
                            $('span#total-pseudonymized').empty();
                        } else {
                            $('span#pseudonymized').html(`
                            <table class="table table-boardless" id="pseudonymized">
                                <td width="32%">
                                    <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark1" value="0" class="form-check-input" ${datamark_agin[0]} />
                                    <label for="datamark1" > หัวข้อมูลอย่างเดียว </label>
                                </td>
                                <td width="30%">
                                    <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark2" value="1" class="form-check-input" ${datamark_agin[1]}/>
                                    <label for="datamark2" > หัวและท้ายข้อมูล </label>
                                </td>
                                <td>
                                    <input type="radio" name="classify_type_data_in_event_personal_datamark" id="datamark3" value="2" class="form-check-input" ${datamark_agin[2]}/>
                                    <label for="datamark3" > ท้ายข้อมูลอย่างเดียว </label>
                                </td>
                            </table>
                            `)
                            $('span#total-pseudonymized').html(`
                            <table class="table table-boardless" id="total-pseudonymized">
                                <td style="width: 35%; text-align: right;">
                                    <label for="total-digit"> จำนวนตัวอักษรที่แสดง:  </label>
                                </td>
                                <td>
                                    <input type="number" min="1" name="classify_type_data_in_event_personal_datamark_total" placeholder="กรุณาป้อนจำนวน..." class="form-control" value="${result[0].classify_type_data_in_event_personal_datamark_total}" />
                                </td>
                            </table>
                            <span id="example-datamark"></span>
                            `)
                            let seleced = $('input:radio[name="classify_type_data_in_event_personal_datamark"]:checked')
                            if (seleced.attr('id') == 'datamark1') {
                                $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["****ย่าง"]
                            </td>
                        </table>
                        `)
                            } else if (seleced.attr('id') == 'datamark2') {
                                $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">3</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["***ย***"]
                            </td>
                        </table>
                        `)
                            } else if (seleced.attr('id') == 'datamark3') {
                                $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["ตัวอ****"]
                            </td>
                        </table>
                        `)
                            }
                        }
                        $('input:radio[name="classify_type_data_in_event_personal_datamark"]').on('click', function () {
                            if ($(this).attr('id') == 'datamark1') {
                                $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["****ย่าง"]
                            </td>
                        </table>
                        `)
                            } else if ($(this).attr('id') == 'datamark2') {
                                $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">3</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["***ย***"]
                            </td>
                        </table>
                        `)
                            } else if ($(this).attr('id') == 'datamark3') {
                                $('span#example-datamark').html(`
                        <table class="table table-boardless">
                            <td>
                                สมมุติจำนวนแสดงตัวอักษร = <span style="color: red;">4</span> <br/> ["ตัวอย่าง"] <span style="color: red;"> ทำเครื่องหมาย </span> ["ตัวอ****"]
                            </td>
                        </table>
                        `)
                            }
                        })
                    })
                })
            } else {
                $('span#event_personal_datamark').empty();
            }
        }
    })
    // Modal Add Pattern
    var count_click = 0
    $('a[href="#select-pattern"]').on('click', function () {
        $.post('/pattern', function (result) {
            count_click += 1
            // ============================== Create Prepare ============================
            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
            var state = {
                'querySet': result.pattern,
                'page': 1,
                'rows': 5,
                'window': 5,
            }
            if (count_click == 1) {
                buildTable()
            }
            function pagination(querySet, page, rows) {

                var trimStart = (page - 1) * rows
                var trimEnd = trimStart + rows

                var trimmedData = querySet.slice(trimStart, trimEnd)

                var pages = Math.ceil(querySet.length / rows);

                var start_count = 1
                document.getElementById('start-pattern-add').innerHTML = start_count

                return {
                    'querySet': trimmedData,
                    'pages': pages,
                }
            }
            // ============================== Create Pagination ============================
            function pageButtons(pages) {
                var wrapper = document.getElementById('pagination-wapper-pattern-add')
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
                    $('#table-body-pattern-add').empty()
                    state.page = Number($(this).val())
                    // document.getElementById('page').value = state.page
                    buildTable()
                })
            }
            // ============================== Create Table ============================
            function buildTable() {
                var table = $('#table-body-pattern-add')
                var data = pagination(state.querySet, state.page, state.rows)
                var myList = data.querySet
                for (y in myList) {
                    if (myList[y].pattern_id != "") {
                        let buttonAdd = ""
                        let buttonDel = ""
                        if (state.page == 1) {
                            if (result.id_pattern[y].pattern_id == $('input[name="pattern_id"]').val()) {
                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                buttonDel = '<a id="_del_pattern" href="javascript:void(0);" data-value=' + result.id_pattern[y].pattern_id + '  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                            } else {
                                buttonAdd = '<a id="_add_pattern" href="javascript:void(0);" data-value=' + result.id_pattern[y].pattern_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                            }
                        } else {
                            if (result.id_pattern[parseInt(state.rows) + parseInt(y)].pattern_id == $('input[name="pattern_id"]').val()) {
                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                buttonDel = '<a id="_del_pattern" href="javascript:void(0);" data-value=' + result.id_pattern[parseInt(state.rows) + parseInt(y)].pattern_id + '  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                            } else {
                                buttonAdd = '<a id="_add_pattern" href="javascript:void(0);" data-value=' + result.id_pattern[parseInt(state.rows) + parseInt(y)].pattern_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                            }
                        }
                        //Keep in mind we are using "Template Litterals to create rows"
                        var row = '<tr>' +
                            '<th style="vertical-align: center;">' +
                            'ชื่อรูปแบบ: ' + myList[y].pattern_name + " <br/>" +
                            '</th>' +
                            '<td style="vertical-align: middle; width: 50px;">' +
                            buttonAdd +
                            '</td>' +
                            '<td style="vertical-align: middle; width: 50px;">' +
                            buttonDel +
                            '</td>' +
                            '</tr>'
                        table.append(row)
                        end_count = myList[y].pattern_id
                    }
                }
                if (myList.length == 0) {
                    var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                    table.append(row)
                    $('#total-pattern-add').text(0)
                    $('#start-pattern-add').html(0)
                } else {
                    if (myList[0].doc_id != "" && myList[0].doc_action != 1 && myList[0].doc_status == 2) {
                        $('#start-pattern-add').text(myList[0].pattern_id)
                    }
                    pageButtons(data.pages)
                    $('#total-pattern-add').text(result.pattern.length)
                }
                $('#end-pattern-add').html(end_count)

                $('a#_add_pattern').on('click', function () {
                    // document.getElementById('specific_measures_check').style.display = 'block'
                    // document.getElementById('hr_specific_measures').style.display = 'block'
                    // let now_id = document.getElementById('c_edit').getAttribute('data-mark')
                    // $.post('/pattern/select-pattern', { value: "@lltr@Se1ectP@ttern", id: $(this).attr('data-value'), id_classify: now_id }).done(function (result) {

                    //  เลือก patter เพื่อหามาตราการ

                    $.post('/classification/fetch/specific/edit/search', { IDclassifi: document.getElementById('c_edit').getAttribute('data-mark'), IDproccess: $('input[name="event_process_id"]').val(), IDpattern: $(this).attr('data-value') }).done(function (result) {
                        createPatternSpecific(result)
                    });

                    $.post('/pattern/select-pattern', { value: "@lltr@Se1ectP@ttern", id: $(this).attr('data-value') }).done(function (result) {
                        $('input[name="pattern_id"]').val(result.pattern[0].pattern_id)
                        $('select[name="pattern_processing_base_id"]').find('option:selected').removeAttr('selected')
                        $('input[name="classify_name_part1"]').val(result.pattern[0].pattern_name)
                        $('input[name="classify_data_exception_or_unnecessary_filter_name"]').val(result.pattern[0].pattern_name)
                        $('input[name="classify_data_exception_or_unnecessary_filter_tag"]').val(result.pattern[0].pattern_tag)
                        $('input[name="classify_data_exception_or_unnecessary_filter_label"').val(result.pattern[0].pattern_label)
                        let fullname = result.total_name_inside.map(e => e.join(" "))
                        $('input[name="classify_user_access_info_process_inside_from_pattern_not_use"]').val([...fullname])
                        $('input[name="classify_user_access_info_process_inside_from_pattern"]').val(result.pattern[0].pattern_processor_inside_id)
                        let fullname_outside = result.total_name_outside.map(e => e.join(" "))
                        $('input[name="classify_user_access_info_process_outside_from_pattern_not_use"]').val([...fullname_outside])
                        $('input[name="classify_user_access_info_process_outside_from_pattern"]').val(result.pattern[0].pattern_processor_outside_id)
                        var _file_ = ""
                        var _database_ = ""
                        if (result.pattern[0].pattern_type_data_file == 1) {
                            _file_ = "มี"
                        } else {
                            _file_ = "ไม่มี"
                        }
                        if (result.pattern[0].pattern_type_database == 1) {
                            _database_ = result.pattern[0].pattern_type_database_name
                        } else {
                            _database_ = "ไม่มี"
                        }
                        var _inside_ = ""
                        var _outside_0 = ""
                        var _outside_1 = ""
                        var _outside_2 = ""
                        var _outside_3 = ""
                        if (result.pattern[0].pattern_storage_method_inside == 1) {
                            _inside_ = "มี"
                        } else {
                            _inside_ = "ไม่มี"
                        }
                        if (result.pattern[0].pattern_storage_method_outside == 1) {
                            _outside_0 = "มี"
                            if (result.pattern[0].pattern_storage_method_outside_device == 1) {
                                _outside_1 = result.pattern[0].pattern_storage_method_outside_device_name
                            } else {
                                _outside_1 = "ไม่มี"
                            }
                            if (result.pattern[0].pattern_storage_method_outside_agent == 1) {
                                _outside_2 = result.pattern[0].pattern_storage_method_outside_agent_name
                            } else {
                                _outside_2 = "ไม่มี"
                            }
                            if (result.pattern[0].pattern_storage_method_outside_database_outside == 1) {
                                _outside_3 = result.pattern[0].pattern_storage_method_outside_database_outside_name
                            } else {
                                _outside_3 = "ไม่มี"
                            }
                        } else {
                            _outside_0 = "ไม่มี"
                        }
                        var data_name_total = result.data_name_total.map(e => e['data_name'])
                        data_name_total = data_name_total.join(", ")
                        $('textarea[name="example_pattern"]').text(`ชื่อ: ${result.pattern[0].pattern_name}
ข้อมูล: ${data_name_total}
ระยะเวลา: ${convert_date(new Date(result.pattern[0].pattern_start_date))} ทั้งหมด: ${result.pattern[0].pattern_total_date} วัน
ชนิดข้อมูล:
    File Ms Excel/CSV: ${_file_}
    Database: ${_database_}
วิธีการจัดเก็บข้อมูลส่วนบุคคล:
    ภายใน Alltra: ${_inside_}
    ภายนอก: ${_outside_0}, [ (อุปกรณ์: ${_outside_1}),  (Agent: ${_outside_2}),  (Database: ${_outside_3}) ]`)
                        check_doc_id_pattern();
                        $('input[name="classify_period_end_follow_pattern_total"]').val(result.pattern[0].pattern_total_date)
                        $('select[name="pattern_processing_base_id"]').find('option[value=' + result.pattern[0].pattern_processing_base_id + ']').attr('selected', 'selected')
                        $('div#select-pattern').modal('hide')
                        $('#table-body-pattern-add').empty()
                        buildTable()
                    })
                })

                $('a#_del_pattern').on('click', function () {
                    // document.getElementById('specific_measures_check').style.display = 'none'
                    createPatternSpecific("ไม่มีข้อมูล")
                    // let selected = $(this).attr('data-value')
                    $('input[name="pattern_id"]').val(null)
                    $('select[name="pattern_processing_base_id"]').find('option:selected').removeAttr('selected')
                    $('input[name="classify_name_part1"]').val(null)
                    $('input[name="classify_data_exception_or_unnecessary_filter_name"]').val(null)
                    $('input[name="classify_data_exception_or_unnecessary_filter_tag"]').val(null)
                    $('input[name="classify_data_exception_or_unnecessary_filter_label"').val(null)
                    $('input[name="classify_user_access_info_process_inside_from_pattern"]').val(null)
                    $('input[name="classify_user_access_info_process_outside_from_pattern"]').val(null)
                    $('input[name="classify_user_access_info_process_inside_from_pattern_not_use"]').val(null)
                    $('input[name="classify_user_access_info_process_outside_from_pattern_not_use"]').val(null)
                    $('textarea[name="example_pattern"]').text(null)
                    check_doc_id_pattern();
                    $('select[name="pattern_processing_base_id"]').find('option:disabled').attr('selected', 'selected')
                    $('input[name="classify_period_end_follow_pattern_total"]').val(null)
                    $('#table-body-pattern-add').empty()
                    buildTable()
                })
            }
        })


    })
    // Modal Select Event-process
    var count_click1 = 0
    $('a[href="#select-event-process"]').on('click', function () {
        $.post('/event_process', { value: "@lltr@Cl@ssific@ti0nEventPr0cess" }, function (result) {
            count_click1 += 1
            // ============================== Create Prepare ============================
            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
            var state = {
                'querySet': result.event,
                'page': 1,
                'rows': 5,
                'window': 5,
            }
            if (count_click1 == 1) {
                buildTable()
            }
            function pagination(querySet, page, rows) {

                var trimStart = (page - 1) * rows
                var trimEnd = trimStart + rows

                var trimmedData = querySet.slice(trimStart, trimEnd)

                var pages = Math.ceil(querySet.length / rows);

                var start_count = 1
                document.getElementById('start-event-add').innerHTML = start_count

                return {
                    'querySet': trimmedData,
                    'pages': pages,
                }
            }
            // ============================== Create Pagination ============================
            function pageButtons(pages) {
                var wrapper = document.getElementById('pagination-wapper-event-add')
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
                    $('#table-body-event-add').empty()
                    state.page = Number($(this).val())
                    // document.getElementById('page').value = state.page
                    buildTable()
                })
            }
            // ============================== Create Table ============================
            function buildTable() {
                var table = $('#table-body-event-add')
                var data = pagination(state.querySet, state.page, state.rows)
                var myList = data.querySet
                for (y in myList) {
                    if (myList[y].event_process_id != "") {
                        let buttonAdd = ""
                        let buttonDel = ""
                        if (state.page == 1) {
                            if (myList[y].event_process_name == $('input[name="classify_name_part2"]').val() && result.id_event[y].event_process_id == $('input[name="event_process_id"]').val()) {
                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                buttonDel = '<a id="_del_event" href="javascript:void(0);" data-value=' + result.id_event[y].event_process_id + '  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                            } else {
                                buttonAdd = '<a id="_add_event" href="javascript:void(0);" data-value=' + result.id_event[y].event_process_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                            }
                        } else {
                            if (myList[y].event_process_name == $('input[name="classify_name_part2"]').val() && result.id_event[parseInt(state.rows) + parseInt(y)].event_process_id == $('input[name="event_process_id"]').val()) {
                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                buttonDel = '<a id="_del_event" href="javascript:void(0);" data-value=' + result.id_event[parseInt(state.rows) + parseInt(y)].event_process_id + '  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                            } else {
                                buttonAdd = '<a id="_add_event" href="javascript:void(0);" data-value=' + result.id_event[parseInt(state.rows) + parseInt(y)].event_process_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                            }
                        }
                        //Keep in mind we are using "Template Litterals to create rows"
                        var row = '<tr>' +
                            '<th style="vertical-align: center;">' +
                            'ชื่อกิจกรรม: ' + myList[y].event_process_name + " <br/>" +
                            '</th>' +
                            '<td style="vertical-align: middle; width: 50px;">' +
                            buttonAdd +
                            '</td>' +
                            '<td style="vertical-align: middle; width: 50px;">' +
                            buttonDel +
                            '</td>' +
                            '</tr>'
                        table.append(row)
                        end_count = myList[y].event_process_id
                    }
                }
                if (myList.length == 0) {
                    var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                    table.append(row)
                    $('#total-event-add').text(0)
                    $('#start-event-add').html(0)
                } else {
                    if (myList[0].event_process_id != "") {
                        $('#start-event-add').text(myList[0].event_process_id)
                    }
                    pageButtons(data.pages)
                    $('#total-event-add').text(result.event.length)
                }
                $('#end-event-add').html(end_count)
                $('a#_add_event').on('click', function () {
                    $.post('/event_process/get', {
                        value: "@lltr@Cl@ssific@iti0nGetEventPr@cess",
                        id: $(this).attr('data-value'),
                        id_classify: now_id
                    }).done(function (result) {
                        $('input[name="event_process_id"]').val(result.event[0].event_process_id)
                        $('input[name="classify_name_part2"]').val(result.event[0].event_process_name)
                        $('div#select-event-process').modal('hide')
                        $('#table-body-event-add').empty()
                        buildTable()
                    })
                    //  เลือก patter เพื่อหามาตราการ
                    $.post('/classification/fetch/specific/edit/search', { IDclassifi: document.getElementById('c_edit').getAttribute('data-mark'), IDproccess: $(this).attr('data-value'), IDpattern: $('input[name="pattern_id"]').val() }).done(function (result) {
                        createPatternSpecific(result)
                    })
                })

                $('a#_del_event').on('click', function () {
                    $('input[name="event_process_id"]').val(null)
                    $('input[name="classify_name_part2"]').val(null)
                    $('#table-body-event-add').empty()
                    buildTable()
                    $.post('/classification/fetch/specific/edit/search', { IDclassifi: document.getElementById('c_edit').getAttribute('data-mark'), IDproccess: '', IDpattern: $('input[name="pattern_id"]').val() }).done(function (result) {
                        createPatternSpecific(result)
                    })
                })
            }
        })
    })

    // function ready_edit() {
    //     console.log("ffffffffffffffffff");
    //     $.post('/event_process/get', {
    //         value: "@lltr@Cl@ssific@iti0nGetEventPr@cess",
    //         id: $('input[name="event_process_id"]').val(),
    //         id_classify: document.getElementById('c_edit').getAttribute('data-mark')
    //     }).done(function (result) {
    //         console.log("edit__________________________result", result);
    //         // $('input[name="event_process_id"]').val(result.event[0].event_process_id)
    //         // $('input[name="classify_name_part2"]').val(result.event[0].event_process_name)
    //         // $('div#select-event-process').modal('hide')
    //         // $('#table-body-event-add').empty()
    //         // buildTable()
    //         // get_measures(result.event[0].event_process_id, result)
    //     })
    // }
    // ready_edit()
    // Modal Add Processing-base
    $('a#btn_add_processing_base').on('click', function () {
        $('a#add_processing_base').on('click', function () {
            console.log("qqqqqqqqqqqqqqqqq");
            if ($('input[name="pattern_processing_base_name"]').val() != "") {
                var name = $('input[name="pattern_processing_base_name"]').attr('name')
                var value = $('input[name="pattern_processing_base_name"]').val()
                var obj = {}
                obj[name] = value
                $.ajax({
                    url: "/processing_base",
                    method: "POST",
                    data: obj,
                }).done(function () {
                    $('input[name="pattern_processing_base_name"]').val(null);
                    $('div#add-processing-base').modal('hide');
                    $('#select_processing_base').load(document.URL + ' #select_processing_base ');
                })
            }
        })
    })
    // Modal Add Special-conditions
    $('a#btn_add_special_conditions').on('click', function () {
        $('a#add-special-conditions').on('click', function () {
            if ($('input[name="classification_special_conditions_name"]').val() != "") {
                var name = $('input[name="classification_special_conditions_name"]').attr('name')
                var value = $('input[name="classification_special_conditions_name"]').val()
                var obj = {}
                obj[name] = value
                $.ajax({
                    url: "/event_process/add",
                    method: "POST",
                    data: obj,
                }).done(function () {
                    $('input[name="classification_special_conditions_name"]').val(null)
                    $('div#add_special_conditions').modal('hide')
                    $('#select_special_conditions').load(document.URL + ' #select_special_conditions')
                })
            }
        })
    })




} else if (document.getElementById('dataflow')) {
    // Sidebar
    $('li#li-dataflow').addClass('selected')
    $('a#li-dataflow').addClass('active')
    $('ul#ul-dataflow').addClass('in')
    $('a#a-export-dataflow').addClass('active')
    $('ul#ul-export-dataflow').addClass('in')
    $('a#a-dataflow').addClass('active')
    // =========================== Main Function =======================
    let selected = new Array(5)
    // ================== Check Theme ==================
    let background_color = "#ffffff";
    let border_color = "#000000";
    let color = "#000000";
    let color_name = "";
    let color_event = "";
    if (document.getElementById('theme-view').checked == true) {
        color_name = "#ffffff";
        color_event = "yellow";
    } else {
        color_name = "#000000";
        color_event = "red";
    }
    $('div#data-content').html('<p style="color:red; text-align: center">ไม่พบข้อมูล...</p>')
    $('button:button#search-dataflow').on('click', function () {
        for (var i = 0; i < $('select').length; i++) {
            selected[i] = $('select')[i].value
        }
        $.post('/dataflow/', { policy: selected[0], pattern: selected[1], classify: selected[2], account: selected[3], data: selected[4] }).done(function (result) {
            let re = result.result
            let raw = result.data
            let user = result.account
            if (re.policy.length > 0 && re.pattern.length > 0 && re.classify.length > 0 && (re.account.length > 0 || re.data.length > 0)) {
                let total_raw_data;
                let total_raw_data_from_pattern;
                let end_date_pattern = new Array(re.pattern.length)
                let total_raw_data_from_classify;
                let end_date_classify = new Array(re.classify.length)
                let set_classify_name = new Array(re.classify.length)
                for (i in re.classify) {
                    set_classify_name[i] = re.classify[i].classify_name.split(/[()]+/).filter(function (item) { return item; })
                }
                // ================== Datail Pattern ===============
                let type_data = []
                let storage_method = []
                let set_end = []
                let dpo = []
                let processor_in = []
                let processor_out = []
                // ================== Datail Classify ===============
                let c_type_data = []
                let c_storage_method = []
                let c_user_info_in = []
                let c_user_info_out = []
                let c_process_time = []
                let c_end_process_time = []
                let c_data_private = []
                let c_base_process = []
                let c_cond_special = []
                let c_time_info = []
                let c_2_factor = []
                let c_identify = []
                let c_total_data_process = []
                let c_control_data_out = []
                let c_protect_data_out = []
                let c_method_of_personal = []
                let c_method_of_organization = []
                // ================== Check runtime ===============
                if (re.policy.length > 0) {
                    let total_data = re.policy.map(e => e['page_content'])
                    let clean_html = total_data.map(e => String(e).replace(/(<([^>]+)>)/gim, ""))
                    let clean_another = clean_html.map(e => String(e).replace(/(\r\n|\n|\r)/gm, ""))
                    let clean_code = clean_another.map(e => String(e).replace(/\&nbsp;/g, ''))
                    clean_code.join("")
                    total_raw_data = raw.filter(function (e) { return clean_code.indexOf(e.data_code) != -1 })
                    total_raw_data = new Set(total_raw_data)
                    total_raw_data = [...total_raw_data]
                    $('div#data-content').html(`
<div id="content-policy" class="col-pop-main" align="center">
    <a id="show-total-data" href="javascript:void(0);" method="${re.policy[0].doc_id}">
    <div style="background-color: ${background_color}; width:140px; height:45px; border-radius: 20px; color: ${color}; vertical-align: middle;border-style: solid; border-color: ${border_color};">
        <p style="padding-top: 2px; text-align: center; ">${total_raw_data.length}&emsp;<img src="/UI/image/${re.policy[0].image}" style="width: 20%; border-radius: 50%; vertical-align: -7px;" /></p>
        <p id="name-policy" style="padding-top: 10px; color: ${color_name}; text-align: center;">${re.policy[0].doc_name}<br>Exp. 12/09/2023</p>
    </div><br/><br/><br/>
    </a>
    <div id="card-total-data" class="card" data-value="${re.policy[0].doc_id}" hidden>
        <div id="total-data" class="card-body" style="background-color: ${background_color}; border-style: solid; border-color: ${border_color}">
        </div>
    </div>
</div>
<div id="arrow_right_pattern" class="col-connect-pattern" hidden>
</div>
<div id="content-pattern" class="col-pop-main" align="center" hidden></div>
<div id="arrow_right_classify" class="col-connect-classify" hidden></div>
<div id="content-classify" class="col-pop-main" align="center" hidden></div>
            `)
                    if (total_raw_data.length > 0) {
                        $('div#total-data').html(`<span style="color: red;">${total_raw_data}</span>`)
                    } else {
                        $('div#total-data').attr('align', 'center');
                        $('div#total-data').html(`<span style="color: red; text-align: center;">ไม่พบข้อมูลส่วนบุคคล</span>`)
                    }
                }
                if (re.pattern.length > 0) {
                    $('div#content-pattern').removeAttr('hidden');
                    let end = re.pattern.map(e => e['pattern_start_date'])
                    let total = re.pattern.map(e => e['pattern_total_date'])
                    for (i in end) {
                        let _end_ = new Date(end[i])
                        _end_.setDate(_end_.getDate() + total[i]);
                        _end_.toLocaleString('th-TH', { timezone: "Asia/Thailand" })
                        let month = _end_.getMonth() + 1
                        let day = _end_.getDate()
                        if (String(month).length == 1) {
                            month = "0" + String(month)
                        }
                        if (String(day).length == 1) {
                            day = "0" + String(day)
                        }
                        end_date_pattern[i] = (day + "/" + month + "/" + (_end_.getFullYear()))
                    }
                    let total_tag = re.pattern.map(e => e['pattern_tag'].split(","))
                    let search_data = total_tag.map(function (e) {
                        return e.map(function (f) {
                            return raw.filter(function (item) { return item.data_tag.indexOf(f) != -1 })
                        })
                    })
                    let convert_search_data = search_data.map(e => e.map(f => f.map(b => b['data_name'])))
                    let convert_search_data1 = convert_search_data.reduce(function (prev, next) {
                        return prev.concat(next)
                    })
                    let convert_search_data2 = convert_search_data1.reduce(function (prev, next) {
                        return prev.concat(next)
                    })
                    let set_data = new Set(convert_search_data2)
                    total_raw_data_from_pattern = [...set_data]
                    for (i in re.pattern) {
                        let set_type_data = { 'file': null, "type_path": null, "path": null, "database": null, "db_name": null }
                        let set_storage_method = { "inside": null, "outside": null, "outside_device": null, "outside_de_name": null, "outside_agent": null, "outside_a_name": null, "outside_db": null, "outside_db_name": null }
                        let _set_end = { "end": null, "total": null }
                        let set_dpo = { 'approve_process': null, "approve_raw_file_out": null }
                        let total_users_in;
                        if (re.pattern[i].pattern_processor_inside_id.includes(',') || re.pattern[i].pattern_processor_inside_id != null || re.pattern[i].pattern_processor_inside_id != "") {
                            total_users_in = re.pattern[i].pattern_processor_inside_id.split(",")
                        } else {
                            total_users_in = 0
                        }
                        let set_processor_in = [];
                        if (total_users_in.length > 0) {
                            total_users_in.forEach(e => set_processor_in.push({ 'inside': null, "full_name": null, "image": null }))
                        } else {
                            set_processor_in = { 'inside': null, "full_name": null, "image": null }
                        }
                        let total_users_out;
                        if (re.pattern[i].pattern_processor_outside_id.includes(',') || re.pattern[i].pattern_processor_outside_id != null || re.pattern[i].pattern_processor_outside_id != "") {
                            total_users_out = re.pattern[i].pattern_processor_outside_id.split(",")
                        } else {
                            total_users_out = 0
                        }
                        let set_processor_out = [];
                        if (total_users_out.length > 0) {
                            total_users_out.forEach(e => set_processor_out.push({ 'outside': null, "full_name": null, "image": null }))
                        } else {
                            total_users_out = { 'outside': null, "full_name": null, "image": null }
                        }
                        if (re.pattern[i].pattern_type_data_file == 1) {
                            set_type_data.file = "มี"
                            if (re.pattern[i].pattern_type_data_file_of_path == 1) {
                                set_type_data.type_path = "Windows"
                                if (re.pattern[i].pattern_type_data_file_path != null || re.pattern[i].pattern_type_data_file_path != "") {
                                    set_type_data.path = re.pattern[i].pattern_type_data_file_path
                                } else {
                                    set_type_data.path = "ไม่ระบุ"
                                }
                            } else if (re.pattern[i].pattern_type_data_file_of_path == 0) {
                                set_type_data.type_path = "Linux"
                                if (re.pattern[i].pattern_type_data_file_path != null || re.pattern[i].pattern_type_data_file_path != "") {
                                    set_type_data.path = re.pattern[i].pattern_type_data_file_path
                                } else {
                                    set_type_data.path = "ไม่ระบุ"
                                }
                            } else {
                                set_type_data.type_path = "ไม่มี"
                            }
                        } else {
                            set_type_data.file = "ไม่มี"
                        }
                        if (re.pattern[i].pattern_type_data_database == 1) {
                            set_type_data.database = "มี"
                            if (re.pattern[i].pattern_type_data_database_name != null || re.pattern[i].pattern_type_data_database_name != "") {
                                set_type_data.db_name = re.pattern[i].pattern_type_data_database_name
                            } else {
                                set_type_data.db_name = "ไม่ระบุ"
                            }
                        } else {
                            set_type_data.database = "ไม่มี"
                        }
                        if (re.pattern[i].pattern_storage_method_inside == 1) {
                            set_storage_method.inside = "มี"
                        } else {
                            set_storage_method.inside = "ไม่มี"
                        }
                        if (re.pattern[i].pattern_storage_method_outside == 1) {
                            set_storage_method.outside = "มี"
                            if (re.pattern[i].pattern_storage_method_outside_device == 1) {
                                set_storage_method.outside_device = "มี"
                                if (re.pattern[i].pattern_storage_method_outside_device_name != null || re.pattern[i].pattern_storage_method_outside_device_name != "") {
                                    set_storage_method.outside_de_name = re.pattern[i].pattern_storage_method_outside_device_name
                                } else {
                                    set_storage_method.outside_de_name = "ไม่ระบุ"
                                }
                            } else {
                                set_storage_method.outside_device = "ไม่มี"
                            }
                            if (re.pattern[i].pattern_storage_method_outside_agent == 1) {
                                set_storage_method.outside_agent = "มี"
                                if (re.pattern[i].pattern_storage_method_outside_agent_name != null || re.pattern[i].pattern_storage_method_outside_agent_name != "") {
                                    set_storage_method.outside_a_name = re.pattern[i].pattern_storage_method_outside_agent_name
                                } else {
                                    set_storage_method.outside_a_name = "ไม่ระบุ"
                                }
                            } else {
                                set_storage_method.outside_agent = "ไม่มี"
                            }
                            if (re.pattern[i].pattern_storage_method_outside_database_outside == 1) {
                                set_storage_method.outside_db = "มี"
                                if (re.pattern[i].pattern_storage_method_outside_database_outside_name != null || re.pattern[i].pattern_storage_method_outside_database_outside_name != "") {
                                    set_storage_method.outside_db_name = re.pattern[i].pattern_storage_method_outside_database_outside_name
                                } else {
                                    set_storage_method.outside_db_name = "ไม่ระบุ"
                                }
                            } else {
                                set_storage_method.outside_db = "ไม่มี"
                            }
                        } else {
                            set_storage_method.outside = "ไม่มี"
                        }
                        if (re.pattern[i].pattern_set_end_date == 1) {
                            _set_end.end = "มี"
                            if (re.pattern[i].pattern_set_end_date_total != null, re.pattern[i].pattern_set_end_date_total != "") {
                                _set_end.total = re.pattern[i].pattern_set_end_date_total
                            } else {
                                _set_end.total = "ไม่ระบุ"
                            }
                        } else {
                            _set_end.end = "ไม่มี"
                        }
                        if (re.pattern[i].pattern_dpo_approve_process == 1) {
                            set_dpo.approve_process = "มี"
                        } else {
                            set_dpo.approve_process = "ไม่มี"
                        }
                        if (re.pattern[i].pattern_dpo_approve_raw_file_out == 1) {
                            set_dpo.approve_raw_file_out = "มี"
                        } else {
                            set_dpo.approve_raw_file_out = "ไม่มี"
                        }
                        if (re.pattern[i].pattern_processor_inside == 1) {
                            if (re.pattern[i].pattern_processor_inside_id != null, re.pattern[i].pattern_processor_inside_id != "") {
                                total_users_in.forEach(function (d, j) {
                                    set_processor_in[j].inside = "มี"
                                    set_processor_in[j].full_name = user.map(function (item) { if (item.acc_id == d) { return item.firstname + " " + item.lastname } }).join("")
                                    set_processor_in[j].image = user.map(function (item) { if (item.acc_id == d) { return item.image } }).join("")
                                })
                            } else {
                                set_processor_in.full_name = "ไม่ระบุ"
                                set_processor_in.image = "ไม่ระบุ"
                            }
                        } else {
                            set_processor_in.inside = "ไม่มี"
                        }
                        if (re.pattern[i].pattern_processor_outside == 1) {
                            if (re.pattern[i].pattern_processor_outside_id != null, re.pattern[i].pattern_processor_outside_id != "") {
                                total_users_out.forEach(function (d, j) {
                                    set_processor_out[j].outside = "มี"
                                    set_processor_out[j].full_name = user.map(function (item) { if (item.acc_id == d) { return item.firstname + " " + item.lastname } }).join("")
                                    set_processor_out[j].image = user.map(function (item) { if (item.acc_id == d) { return item.image } }).join("")
                                })
                            } else {
                                set_processor_out.full_name = "ไม่ระบุ"
                                set_processor_out.image = "ไม่ระบุ"
                            }
                        } else {
                            set_processor_out.outside = "ไม่มี"
                        }
                        type_data.push(set_type_data)
                        storage_method.push(set_storage_method)
                        set_end.push(_set_end)
                        dpo.push(set_dpo)
                        processor_in.push(set_processor_in)
                        processor_out.push(set_processor_out)
                    }
                    $('div#arrow_right_pattern').removeAttr('hidden')
                    for (i in re.pattern) {
                        $('div#content-pattern').append(`
<div id="div-pattern" method="${re.pattern[i].pattern_id}" style="background-color: ${background_color}; width:140px; height:45px; border-radius: 20px; color: ${color}; align-items: center; vertical-align: middle; border: 5px solid ${getColorCode()}">
            <a id="show-total-pattern" href="javascript:void(0);" method="${re.pattern[i].pattern_id}">
            <p style="text-align: center; color: ${color}">${total_raw_data_from_pattern.length}&emsp;<img src="/UI/image/${re.pattern[i].image}" style="width: 20%; border-radius: 50%; vertical-align: -7px;" />
            </p>
            <p id="name-pattern" style="padding-top: 10px; color: ${color_name};">${re.pattern[i].pattern_name}<br>Exp. ${end_date_pattern[i]}</p>
            </a>
</div><br/><br/><br/>
<div id="total-pattern" data-value="${re.pattern[i].pattern_id}" hidden>
<div class="card">
    <div class="card-body" style="background-color: #ffdb99; color: ${color};">
        ${[...total_raw_data_from_pattern]}
    </div>
</div>
<img src="/UI/assets/images/circle/arrow_bottom.png" width="10%" style="margin-bottom: 5%;"/>
<div class="card">
    <div class="card-body" style="background-color: #ffdb99; font-size: 12px; text-align: left; color: ${color};">
ชนิดข้อมูล: File ms excel = <span style="color: green;">${type_data[i].file}</span> ที่จัดเก็บ <span style="color: green;">${type_data[i].type_path}</span><br/>[ <span style="color: green;">${type_data[i].path}</span> ] / Database = <span style="color: green;">${type_data[i].database}</span> คือ <span style="color: green;">${type_data[i].db_name}</span><br/> 
วิธีจัดเก็บ ภายใน และ ภายนอก Alltra: <br/> ภายใน: <span style="color: green;">${storage_method[i].inside}</span><br/> ภายนอก: <span style="color: green;">${storage_method[i].outside}</span> รูปแบบ [ Device: <span style="color:green;">${storage_method[i].outside_device}</span> / <span style="color: green;">${storage_method[i].outside_de_name}</span>, Agent: <span style="color: green;">${storage_method[i].outside_agent}</span> / <span style="color: green;">${storage_method[i].outside_a_name}</span>, Database ภายนอก: <span style="color: green;">${storage_method[i].outside_db}</span> / <span style="color: green;">${storage_method[i].outside_db_name}</span> ]<br/>
ผู้มีสิทธิ์นำข้อมูลไปใช้ (ภายใน): จำนวนทั้งหมด <span style="color: green;">${re.pattern[i].pattern_processor_inside_total}</span> คือ<br/> <span style="color: green;">${processor_in[i].map(e => " " + e['full_name'])}</span><br/>
ผู้มีสิทธิ์นำข้อมูลไปใช้ (ภายนอก): จำนวนทั้งหมด <span style="color: green;">${re.pattern[i].pattern_processor_outside_total}</span> คือ<br/> <span style="color: green;">${processor_out[i].map(e => " " + e['full_name'])}</span><br/>
กำหนดระยะเวลาสิ้นสุด: <span style="color: green;">${set_end[i].end}</span> / <span style="color: green;">${set_end[i].total}</span><br/>
ตรวจสอบโดย DPO: [ ต้องอนุมัติทุกครั้งถึงสามารถประมวลผลได้: <span style="color: green;">${dpo[i].approve_process}</span>, ต้องอนุมัติทุกครั้งที่จะนำข้อมูล Raw file ออกได้: <span style="color: green;">${dpo[i].approve_raw_file_out}</span> ] <br/>
    </div>
</div>
<img src="/UI/assets/images/circle/arrow_bottom.png" width="10%" style="margin-bottom: 5%;"/>
<p id='processor_in'>
</p>
<p style="margin-top: 10%; margin-bottom: 5%">
    <img src="/UI/assets/images/circle/arrow_bottom.png" width="10%"/>
</p>
<p id="processor_out">
</p>
</div>
                    `)
                        processor_in.forEach(function (d, j) {
                            d.map(function (m, k) {
                                $('p#processor_in').append(`<img src="/UI/image/${m.image}" width="10%" style="border-radius: 50%; border: 2px solid #64ff00;"/> &nbsp;`)
                            })
                        })
                        processor_out.forEach(function (d, j) {
                            d.map(function (m, k) {
                                $('p#processor_out').append(`<img src="/UI/image/${m.image}" width="10%" style="border-radius: 50%; border: 2px solid #dd0000;" /> &nbsp;`)
                            })
                        })
                    }
                }
                if (re.classify.length > 0) {
                    $('div#arrow_right_classify').removeAttr('hidden')
                    $('div#content-classify').removeAttr('hidden')
                    let end = re.classify.map(e => e['classify_create'])
                    let total = re.classify.map(e => e['classify_period_end'])
                    for (i in end) {
                        let _end_ = new Date(end[i])
                        _end_.setDate(_end_.getDate() + total[i])
                        _end_.toLocaleString('th-th', { timezone: "asia/thailand" })
                        let month = _end_.getMonth() + 1
                        let day = _end_.getDate()
                        if (String(month).length == 1) {
                            month = "0" + String(month)
                        }
                        if (String(day).length == 1) {
                            day = "0" + String(day)
                        }
                        end_date_classify[i] = (day + "/" + month + "/" + (_end_.getFullYear()))
                    }
                    // ยังไม่สมบูรณ์
                    let total_tag_from_pattern = re.classify.map(e => e['pattern_tag'].split(','))
                    let filter_tag_from_classify = re.classify.map(e => e['classify_data_exception_or_unnecessary_filter_tag'].split(','))
                    let object_clone_data1 = total_tag_from_pattern.map(e => e.map(function (f) {
                        return raw.filter(item => item.data_tag.indexOf(f) != -1)
                    }))

                    let use_data = []
                    object_clone_data1.forEach((e, i) => e.forEach(function (f, j) {
                        f.forEach(function (d, k) {
                            if (typeof filter_tag_from_classify[i][j] != 'undefined') {
                                if (d.data_tag.indexOf(filter_tag_from_classify[i][j]) == -1) {
                                    use_data.push(d.data_name)
                                }
                            }
                        })
                    }))
                    total_raw_data_from_classify = use_data
                    re.classify.forEach(function (e, i) {
                        c_process_time.push(e.classify_period_process)
                        c_end_process_time.push(e.classify_period_end)
                        if (e.classify_type_data_in_event_personal == 1 && e.classify_type_data_in_event_special_personal_sensitive == 1) {
                            c_data_private.push({ 'normal': "มี", "sensitive": "มี" })
                        } else if (e.classify_type_data_in_event_personal == 1 && e.classify_type_data_in_event_special_personal_sensitive == 0) {
                            c_data_private.push({ 'normal': "มี", "sensitive": "ไม่มี" })
                        } else if (e.classify_type_data_in_event_personal == 0 && e.classify_type_data_in_event_special_personal_sensitive == 1) {
                            c_data_private.push({ 'normal': "ไม่มี", "sensitive": "มี" })
                        } else if (e.classify_type_data_in_event_personal == 0 && e.classify_type_data_in_event_special_personal_sensitive == 0) {
                            c_data_private.push({ 'normal': "ไม่มี", "sensitive": "ไม่มี" })
                        }
                        c_base_process.push(e.pattern_processing_base_name)
                        c_cond_special.push(e.classification_special_conditions_name)
                        if (e.classify_protect_data_limit_follow_datetime == 1) {
                            c_time_info.push('จ-ศ 08.00-17.00')
                        } else {
                            c_time_info.push('ไม่มี')
                        }
                        if (e.classify_approach_protect_used_two_factor_from_google_authen == 1 && e.classify_approach_protect_used_two_factor_from_email == 1 && e.classify_approach_protect_used_two_factor_from_sms == 1) {
                            c_2_factor.push(['google-authen ', 'e-mail ', "sms "])
                        } else if (e.classify_approach_protect_used_two_factor_from_google_authen == 1 && e.classify_approach_protect_used_two_factor_from_email == 1 && e.classify_approach_protect_used_two_factor_from_sms == 0) {
                            c_2_factor.push(['google-authen ', 'e-mail '])
                        } else if (e.classify_approach_protect_used_two_factor_from_google_authen == 1 && e.classify_approach_protect_used_two_factor_from_email == 0 && e.classify_approach_protect_used_two_factor_from_sms == 0) {
                            c_2_factor.push('google-authen ')
                        } else if (e.classify_approach_protect_used_two_factor_from_google_authen == 0 && e.classify_approach_protect_used_two_factor_from_email == 1 && e.classify_approach_protect_used_two_factor_from_sms == 1) {
                            c_2_factor.push(['e-mail ', 'sms '])
                        } else if (e.classify_approach_protect_used_two_factor_from_google_authen == 0 && e.classify_approach_protect_used_two_factor_from_email == 1 && e.classify_approach_protect_used_two_factor_from_sms == 0) {
                            c_2_factor.push('e-mail ')
                        } else if (e.classify_approach_protect_used_two_factor_from_google_authen == 1 && e.classify_approach_protect_used_two_factor_from_email == 1 && e.classify_approach_protect_used_two_factor_from_sms == 1) {
                            c_2_factor.push(['google-authen ', 'sms '])
                        } else if (e.classify_approach_protect_used_two_factor_from_google_authen == 0 && e.classify_approach_protect_used_two_factor_from_email == 1 && e.classify_approach_protect_used_two_factor_from_sms == 1) {
                            c_2_factor.push('sms ')
                        } else if (e.classify_approach_protect_used_two_factor_from_google_authen == 0 && e.classify_approach_protect_used_two_factor_from_email == 1 && e.classify_approach_protect_used_two_factor_from_sms == 0) {
                            c_2_factor.push('ไม่มี ')
                        }
                        if (e.classify_risk_assess_only_dpo_data_personal_can_specify == 1) {
                            c_identify.push('ได้โดยตรง')
                        } else if (e.classify_risk_assess_only_dpo_data_personal_can_specify == 2) {
                            c_identify.push('เป็นข้อมูลไม่ระบุได้โดยตรง')
                        } else if (e.classify_risk_assess_only_dpo_data_personal_can_specify == 3) {
                            c_identify.push('มีการทำข้อมูลแฝง')
                        }
                        if (e.classify_risk_assess_only_dpo_data_number_all_used_process_many == 1) {
                            c_total_data_process.push('มาก')
                        } else {
                            c_total_data_process.push('น้อย')
                        }
                        if (e.classify_risk_assess_only_dpo_access_control_outside == 1) {
                            c_control_data_out.push('มี')
                        } else {
                            c_control_data_out.push('ไม่มี')
                        }
                        if (e.classify_risk_assess_only_dpo_protect_data_outside == 1) {
                            c_protect_data_out.push('มี')
                        } else {
                            c_protect_data_out.push('ไม่มี')
                        }
                        c_method_of_personal.push(e.classify_risk_assess_only_dpo_fix_a_leak_of_data)
                        c_method_of_organization.push(e.classify_risk_assess_only_dpo_fix_a_leak_of_organization)
                    })
                    let total_user_in = []
                    re.classify.forEach(e => total_user_in.push(e.classify_user_access_info_process_inside_from_new_id.split(',')))
                    let total_user_out = []
                    re.classify.forEach(e => total_user_out.push(e.classify_user_access_info_process_outside_from_new_id.split(',')))
                    let selected_user = []
                    total_user_in.forEach(function (d, i) {
                        user.map(function (e) {
                            if (String(e['acc_id']).indexOf(d.join(',')) != -1) {
                                selected_user.push({ "name": e['firstname'] + " " + e['lastname'], "image": e['image'] })
                            }
                        })
                    })
                    let selected_user_outside = []
                    total_user_out.forEach(function (d, i) {
                        user.map(function (e) {
                            if (String(e['acc_id']).indexOf(d.join(",")) != -1) {
                                selected_user_outside.push({ "name": e['firstname'] + " " + e['lastname'], "image": e['image'] })
                            }
                        })
                    })
                    c_user_info_in.push(selected_user)
                    c_user_info_out.push(selected_user_outside)
                    for (i in re.classify) {
                        let getColor;
                        for (var j = 0; j < $('div#div-pattern').length; j++) {
                            if ($('div#div-pattern')[j].getAttribute('method') == re.classify[i].pattern_id) {
                                getColor = $('div#div-pattern')[j].style.border;
                            }
                        }
                        $('div#content-classify').append(`
<div style="background-color: ${background_color}; width:140px; height:45px; border-radius: 20px; color: ${color}; text-align: center; align-items: center; vertical-align: middle; border: ${getColor}">
                        <a id="show-total-classify" href="javascript:void(0);" method="${re.classify[i].classify_id}">
                        <p style="text-align: center; color: ${color}">${total_raw_data_from_classify.length}&emsp;<img src="/UI/image/${re.classify[i].image}" style="width: 20%; border-radius: 50%; vertical-align: -7px;" />
                        </p>
                        <p style="padding-top: 10px;"><span id="name-classify" style="color: ${color_name};">${set_classify_name[i][0]}</span><br><span id="name-event" style="color: ${color_event};">${set_classify_name[i][1]}</span><br/><span id="name-classify1" style="color: ${color_name}">exp. ${end_date_classify}</span></p>
                        </a>
</div><br/><br/><br/><br/>
                        <div id="total-classify" data-value="${re.classify[i].classify_id}" hidden>
<div class="card" style="margin-left: 25%; margin-right: 25%;">
    <div class="card-body" style="background-color: #83b9f9; color: ${color};">
        ${total_raw_data_from_classify}
    </div>
</div>
<p style="margin-bottom: 5%;">
    <img src="/UI/assets/images/circle/arrow_bottom.png" width="10%"/>
</p>
<div class="card" style="margin-left: 2%; margin-right: 2%;">
    <div class="card-body" style="background-color: #83b9f9; color: ${color}; font-size: 12px; text-align: left;">
ชนิดข้อมูล: File ms excel = <span style="color: green;">${type_data[i].file}</span> ที่จัดเก็บ <span style="color: green;">${type_data[i].type_path}</span> <br/> [ <span style="color: green;">${type_data[i].path}</span> ] / Database = <span style="color: green;">${type_data[i].database}</span> คือ <span style="color: green;">${type_data[i].db_name}</span><br/>
วิธีจัดเก็บ ภายใน และ ภายนอก alltra: <br/>
ภายใน: <span style="color: green;">${storage_method[i].inside}</span><br/>
ภายนอก: <span style="colo: green;">${storage_method[i].outside}</span> รูปแบบ [ Device: <span style="color: green;">${storage_method[i].outside_device}</span> / <span style="color: green;">${storage_method[i].outside_de_name}</span>, Agent: <span style="color: green;">${storage_method[i].outside_agent}</span> / <span style="color: green;">${storage_method[i].outside_a_name}</span>, Database ภายนอก: <span style="color: green;">${storage_method[i].outside_db}</span> / <span style="color: green;">${storage_method[i].outside_db_name}</span> ]<br/>
ผู้มีสิทธิ์ประมวลผลภายใน <span style="color: green;">${c_user_info_in[i].length}</span> คน คือ <br/>
<span style="color: green;">${c_user_info_in[i].map(e => e['name'])}</span><br/>
ผู้มีสิทธิ์ประมวลผลภายนอก <span style="color: green;">${c_user_info_out[i].length}</span> คน คือ <br/>
<span style="color: green;">${c_user_info_out[i].map(e => e['name'])}</span><br/>
ระยะเวลาประมวลผล <span style="color: green;">${c_process_time}</span> วัน <br/>
ระยะเวลาสิ้นสุด <span style="color: green;">${c_end_process_time}</span> วัน <br/>
&emsp;&emsp; <span style="color: green;">${c_data_private[0].normal}</span> ข้อมูลส่วนุคคล &emsp; <span style="color: green;">${c_data_private[0].sensitive}</span> ข้อมูลอ่อนไหว <br/>
ฐานการประมวลผล <span style="color: green;">${c_base_process}</span> <br/>
เงื่อนไขพิเศษ <span style="color: green;">${c_cond_special}</span> <br/>
กำหนดเวลาเข้าถึงข้อมูล <span style="color: green;">${c_time_info}</span> <br/>
2 factor <span style="color: green;">${c_2_factor}</span> <br/>
ข้อมูลส่วนุคคล สามารถระบุตัวบุคคลได้ <span style="color: green;">${c_identify}</span> <br/>
ปริมาณข้อมูลทั้งหมดที่ใช้ประมวลผล <span style="color: green;">${c_total_data_process}</span> <br/>
การควบคุมการเข้าถึงข้อมูลระบบนอก alltra <span style="color: green;">${c_control_data_out}</span> <br/>
การป้องกันข้อมูลจากระบบนอก alltra <span style="color: green;">${c_protect_data_out}</span> <br/>
วิธีการแก้ไขเมื่อเกิดข้อมูลรั่วไหลหรือผลกระทบต่อเจ้าของข้อมูล <br/> <span style="color: green;">${c_method_of_personal}</span> <br/>
วิธีการแก้ไขเมื่อเกิดข้อมูลรั่วไหลหรือผลกระทบต่อองค์กร <br/> <span style="color: green;">${c_method_of_organization}</span> <br/>
ตรวจสอบโดย DPO <span style="color: green;">${0}</span>
    </div>
</div>
<p style="margin-bottom: 5%;">
    <img src="/UI/assets/images/circle/arrow_bottom.png" width="10%"/>
</p>
<p id='c_processor_in'>
</p>
<p style="margin-bottom: 5%; margin-top: 10%;">
    <img src="/UI/assets/images/circle/arrow_bottom.png" width="10%"/>
</p>
<p id="c_processor_out">
</p>
                        </div>
                    `)
                        c_user_info_in.forEach(e => e.map(f => $('p#c_processor_in').append(`<img src="/UI/image/${f.image}" style="width: 10%; border-radius: 50%; border: 2px solid #64ff00;" />`)))
                        c_user_info_out.forEach(e => e.map(f => $('p#c_processor_out').append(`<img src="/UI/image/${f.image}" style="width: 10%; border-radius: 50%; border: 2px solid #dd0000;" />`)))
                    }
                }
                // ============ Click show detail ====================
                if ($('a#show-total-data').length > 0) {
                    $('a#show-total-data').on('click', function () {
                        let seleted = $(this).attr('method')
                        if ($('div#card-total-data[data-value="' + seleted + '"]')) {
                            if ($('div#card-total-data[data-value="' + seleted + '"]').attr('hidden')) {
                                $('div#card-total-data[data-value="' + seleted + '"]').removeAttr('hidden')
                            } else {
                                $('div#card-total-data[data-value="' + seleted + '"]').attr('hidden', true)
                            }
                        }
                    })
                }
                if ($('a#show-total-pattern').length > 0) {
                    $('a#show-total-pattern').on('click', function () {
                        let selected = $(this).attr('method')
                        if ($('div#total-pattern[data-value="' + selected + '"]')) {
                            if ($('div#total-pattern[data-value="' + selected + '"]').attr('hidden')) {
                                $('div#total-pattern[data-value="' + selected + '"]').removeAttr('hidden')
                            } else {
                                $('div#total-pattern[data-value="' + selected + '"]').attr('hidden', true)
                            }
                        }
                    })
                }
                if ($('a#show-total-classify').length > 0) {
                    $('a#show-total-classify').on('click', function () {
                        let selected = $(this).attr('method')
                        if ($('div#total-classify[data-value="' + selected + '"]')) {
                            if ($('div#total-classify[data-value="' + selected + '"]').attr('hidden')) {
                                $('div#total-classify[data-value="' + selected + '"]').removeAttr('hidden')
                            } else {
                                $('div#total-classify[data-value="' + selected + '"]').attr('hidden', true)
                            }
                        }
                    })
                }
            } else {
                $('div#data-content').html('<p style="color:red; text-align: center">ไม่พบข้อมูล...</p>')
            }
        })
    })
    $('button:button#preview-print').on('click', function () {
        if ($('div#data-content').children().length > 1) {
            $('a#show-total-data').trigger('click')
            $('a#show-total-pattern').trigger('click')
            $('a#show-total-classify').trigger('click')
            document.getElementById('name-policy').style.color = "#000000"
            document.getElementById('name-pattern').style.color = "#000000"
            document.getElementById('name-classify').style.color = "#000000"
            document.getElementById('name-classify1').style.color = "#000000"
            document.getElementById('name-event').style.color = "red";
            html2canvas(document.getElementById('data-content')).then(function (canvas) {
                //document.getElementById('printer').appendChild(canvas);
                var convert = canvas.toDataURL();
                $.ajax({
                    url: "/dataflow/print",
                    type: "POST",
                    data: { value: convert },
                    success: function (result) {
                        var w = window.open('about:blank');
                        w.document.open();
                        w.document.write(result);
                        w.document.close();
                    }
                });
            });
            document.getElementById('name-policy').style.color = color_name;
            document.getElementById('name-pattern').style.color = color_name;
            document.getElementById('name-classify').style.color = color_name;
            document.getElementById('name-classify1').style.color = color_name;
            document.getElementById('name-event').style.color = color_event;
            $('a#show-total-data').trigger('click')
            $('a#show-total-pattern').trigger('click')
            $('a#show-total-classify').trigger('click')
        } else {
            $('div#swal2-dataflow').css('display', "flex", "overflow-y", "auto");
            $('button:button#alert-close').on('click', function () {
                $('div#swal2-dataflow').css('display', "none");
            });
        }
    });
    $('button:button#download-pdf').on('click', function () {
        if ($('div#data-content').children().length > 1) {
            $('a#show-total-data').trigger('click')
            $('a#show-total-pattern').trigger('click')
            $('a#show-total-classify').trigger('click')
            document.getElementById('name-policy').style.color = "#000000"
            document.getElementById('name-pattern').style.color = "#000000"
            document.getElementById('name-classify').style.color = "#000000"
            document.getElementById('name-classify1').style.color = "#000000"
            document.getElementById('name-event').style.color = "red";
            html2canvas(document.getElementById('data-content')).then(canvas => {
                const ondate = new Date();
                let month = ondate.getMonth() + 1;
                let day = ondate.getDate();
                let hours = ondate.getHours();
                let minutes = ondate.getMinutes();
                let seconds = ondate.getSeconds();
                if (String(month).length == 1) {
                    month = "0" + String(month)
                }
                if (String(day).length == 1) {
                    day = "0" + String(day)
                }
                if (String(hours).length == 1) {
                    hours = "0" + String(hours)
                }
                if (String(minutes).length == 1) {
                    minutes = "0" + String(minutes)
                }
                if (String(seconds).length == 1) {
                    seconds = "0" + String(seconds)
                }
                const maxOnDate = ondate.getFullYear() + "-" + month + "-" + day + "Z" + hours + ":" + minutes + ":" + seconds
                const name_file = "Dataflow_" + maxOnDate + ".pdf";
                const img = canvas.toDataURL('image/jpeg', 1);
                window.jsPDF = window.jspdf.jsPDF;
                var doc = new jsPDF("l", "mm", "a4"); // [297, 210] = "w, s" or "a4"
                var width = doc.internal.pageSize.getWidth() * .95;
                var height = doc.internal.pageSize.getHeight() * .95;
                doc.addImage(img, "JPEG", 5, 5, width, height);
                doc.save(name_file);
            });
            document.getElementById('name-policy').style.color = color_name;
            document.getElementById('name-pattern').style.color = color_name;
            document.getElementById('name-classify').style.color = color_name;
            document.getElementById('name-classify1').style.color = color_name;
            document.getElementById('name-event').style.color = color_event;
            $('a#show-total-data').trigger('click')
            $('a#show-total-pattern').trigger('click')
            $('a#show-total-classify').trigger('click')
        } else {
            $('div#swal2-dataflow').css('display', "flex", "overflow-y", "auto");
            $('button:button#alert-close').on('click', function () {
                $('div#swal2-dataflow').css('display', "none");
            });
        }
    });
} else if (document.getElementById('ev_index')) {
    // ============================== Status block =============================
    // let status1 = document.getElementById('bar1').textContent.split("%");
    // document.getElementById('progress-bar1').setAttribute("aria-valuenow", status1[0]);
    // document.getElementById('progress-bar1').style.cssText = `
    //     width: ${document.getElementById('bar1').textContent};
    //     height: 6px;
    // `;
    // let diskspace_value = document.getElementById('diskspace').textContent;
    // document.getElementById('diskspace').innerHTML = (diskspace_value / 1000000000).toFixed(0);
    // let status2 = document.getElementById('bar2').textContent.split("%");
    // document.getElementById('progress-bar2').setAttribute('aria-valuenow', status2[0]);
    // document.getElementById('progress-bar2').style.cssText = `
    //     width: ${document.getElementById('bar2').textContent};
    //     height: 6px;
    // `
    // let status3 = document.getElementById('bar3').textContent.split("%");
    // document.getElementById('progress-bar3').setAttribute('aria-valuenow', status3[0]);
    // document.getElementById('progress-bar3').style.cssText = `
    //     width: ${document.getElementById('bar3').textContent};
    //     height: 6px;
    // `
    // ============================== Table list =============================
    $.post('/classification/listEventProcess/', { value: "@lltr@Cl@ssifyL1stEvent" }).done(function (result) {
        // ============================== Create Prepare ============================
        var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

        var state = {
            'querySet': result.event,
            'page': 1,
            'rows': 30,
            'window': 10,
        }
        buildTable()
        function pagination(querySet, page, rows) {
            var trimStart = (page - 1) * rows
            var trimEnd = trimStart + rows

            var trimmedData = querySet.slice(trimStart, trimEnd)

            var pages = Math.ceil(querySet.length / rows);
            var start_count = 1
            document.getElementById('start-event').innerHTML = start_count

            return {
                'querySet': trimmedData,
                'pages': pages,
            }
        }
        // ============================== Create Pagination ============================
        function pageButtons(pages) {
            var wrapper = document.getElementById('pagination-wrapper-event')
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
                $('#table-body-event').empty()
                state.page = Number($(this).val())
                buildTable()
            })
        }
        // ============================== Create Table ============================
        function buildTable() {
            var table = $('#table-body-event')
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            for (y in myList) {
                let icon_approach = ''
                let icon_measures = ''
                let icon_specific = ''

                if (myList[y].approach_id == '0' || myList[y].approach_id == null) {
                    icon_approach = '<i class="ti-close text-danger"></i>'
                } else {
                    icon_approach = ' <i class="fas fa-check text-success"></i>'
                }
                if (myList[y].measures_id == '0' || myList[y].measures_id == null) {
                    icon_measures = '<i class="ti-close text-danger"></i>'
                } else {
                    icon_measures = ' <i class="fas fa-check text-success"></i>'
                }

                if (myList[y].specific_id == '0' || myList[y].specific_id == null) {
                    icon_specific = '<i class="ti-close text-danger"></i>'
                } else {
                    icon_specific = ' <i class="fas fa-check text-success"></i>'
                }

                if (myList[y].event_process_id != "" && state.page == 1) {
                    //Keep in mind we are using "Template Litterals to create rows"
                    var row = '<tr>' +
                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ลำดับที่:' +
                        '</b> <span class="tablesaw-cell-content">' + myList[y].event_process_id + '</span></td>' +
                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ชื่อกิจกรรมประมวลผล</b> <span class="tablesaw-cell-content">' + myList[y].event_process_code + '</span></td>' +

                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">General Measures</b> <span class="tablesaw-cell-content">' + icon_measures + '</span></td>' +
                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">Risk Base Approach</b> <span class="tablesaw-cell-content">' + icon_approach + '</span></td>' +
                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">Risk Base Approach</b> <span class="tablesaw-cell-content">' + icon_specific + '</span></td>' +

                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ชื่อกิจกรรมประมวลผล</b> <span class="tablesaw-cell-content">' + myList[y].event_process_name + '</span></td>' +
                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">แก้ไขประเภท</b> <span class="tablesaw-cell-content"><a href="/classification/event/edit' + result.id_event[y].event_process_id + '" class="text-warning"><i class="fas fa-pencil-alt fa-2x"></i></a></td>' +
                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ลบประเภท</b> <span class="tablesaw-cell-content"><a href="#delete-event" id=' + result.id_event[y].event_process_id + ' onClick="delEventProcess(this.id)" data-bs-toggle="modal"><i class="fas fa-trash-alt fa-2x" style="color: red;"></i></a></td>' +
                        '</tr>'
                    table.append(row)
                    end_count = myList[y].event_process_id;
                } else if (myList[y].event_process_id != "" && state.page >= 2) {
                    var row = '<tr>' +
                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ลำดับที่:' +
                        '</b> <span class="tablesaw-cell-content">' + myList[y].event_process_id + '</span></td>' +
                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ชื่อประเภท</b> <span class="tablesaw-cell-content">' + myList[y].event_process_code + '</span></td>' +

                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">General Measures</b> <span class="tablesaw-cell-content">' + icon_measures + '</span></td>' +
                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">Risk Base Approach</b> <span class="tablesaw-cell-content">' + icon_approach + '</span></td>' +
                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">Risk Base Approach</b> <span class="tablesaw-cell-content">' + icon_specific + '</span></td>' +


                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ชื่อประเภท</b> <span class="tablesaw-cell-content">' + myList[y].event_process_name + '</span></td>' +
                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">แก้ไขประเภท</b> <span class="tablesaw-cell-content"><a href="/classification/event/edit' + result.id_event[parseInt(state.rows) + parseInt(y)].event_process_id + '" class="text-warning"><i class="fas fa-pencil-alt fa-2x"></i></a></td>' +
                        '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ลบประเภท</b> <span class="tablesaw-cell-content"><a href="#delete-event" id=' + result.id_event[parseInt(state.rows) + parseInt(y)].event_process_id + ' onClick="delEventProcess(this.id)" data-bs-toggle="modal"><i class="fas fa-trash-alt fa-2x" style="color: red;"></i></a></td>' +
                        '</tr>'
                    table.append(row)
                    end_count = myList[y].event_process_id;
                } else {
                }
            }
            if (myList.length == 0) {
                var row = '<tr class="odd"><td valign="top" colspan="10" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                table.append(row)
                $('#start-event').text(0)
                $('#total-event').text(0)
            }
            if (myList[0].event_process_id != "") {
                $('#start-event').text(myList[0].event_process_id)
                $('#total-event').text(result.event.length)
            }
            $('#end-event').text(end_count)
            pageButtons(data.pages)
        }
    })
    function delEventProcess(id) {
        let url = '/classification/event/delete' + id
        $.post('/classification/selectEventProcess/', { value: "@lltr@Cl@ssifySe1ectEvent1", id: id }).done(function (result) {
            $('td#ev-name').text(result[0].event_process_name)
            $('button#sub-del-event').on('click', function () {
                $('form#del-event').attr('action', url).submit();
            })
        })
    }
} else if (document.getElementById('ev_new')) {
    // ============================== Sidebar =============================
    $('li#li_event_process').addClass('selected')
    $('a#a_event_process').addClass('active')
} else if (document.getElementById('ev_edit')) {
    // ============================== Sidebar =============================
    $('li#li_event_process').addClass('selected')
    $('a#a_event_process').addClass('active')
}



// document.getElementById('General-Measures-edit').addEventListener('click', () => {
//     console.log("xxxxxxxxxxxxxxxxxxxxxxxxx");
//     let General_Measures = document.getElementById('General-Measures')
//     let Approach = document.getElementById('Approach')
//     // if (Approach.style.display == 'block') {
//     //     Approach.style.display = 'none'
//     // }
//     if (General_Measures.style.display == 'none') {
//         General_Measures.style.display = 'block'
//     } else {
//         General_Measures.style.display = 'none'
//     }
// })


// document.getElementById('Approach-edit').addEventListener('click', function () {
//     let Approach = document.getElementById('Approach')
//     let General_Measures = document.getElementById('General-Measures')
//     // if (General_Measures.style.display == 'block') {
//     //     General_Measures.style.display = 'none'
//     // }
//     if (Approach.style.display == 'none') {
//         Approach.style.display = 'block'
//     } else {
//         Approach.style.display = 'none'
//     }
// })

// document.getElementById('specific_measures_edit').addEventListener('click', function () {
//     // let specific_measures = document.getElementById('specific_measures')
//     if (specific_measures.style.display == 'none') {
//         specific_measures.style.display = 'block'
//     } else {
//         specific_measures.style.display = 'none'
//     }
// })

// $('#head_approach').on('change', async function () {
//     let Defense_Depth_div = document.getElementById("Defense_Depth_div")
//     let Measure_Depth_Div = document.getElementById("Measure_Depth_Div")
//     if ($(this).val() == '1') {
//         Defense_Depth_div.style.display = ""
//         Measure_Depth_Div.style.display = "none"
//         console.log(Defense_Depth_div);
//     } else {
//         Defense_Depth_div.style.display = "none"
//         Measure_Depth_Div.style.display = ""
//         Measure_Depth_Div.getElementsByTagName('select')[0].required = false
//         Measure_Depth_Div.getElementsByTagName('select')[1].required = false
//     }
// })




// var measures_types = []
// var policy_doc = []
// var assets_type = []
// var depth_type = []

// function get_measures(id, data) {
//     policy_doc = []
//     measures_types = []
//     measures_types.push(...data.measures_type)
//     policy_doc.push(...data.doc)
//     assets_type.push(...data.assets)
//     depth_type.push(...data.depth)

//     let event_process = data.event
//     console.log("event_process", event_process);
//     console.log("data", data);

//     let measures = data.measures
//     let approach = data.approach
//     let specific = data.specific


//     if (data.measures_classcific != 'ไม่มีข้อมูล') {
//         $('#tbody-General-Measures').empty()
//         Data_Table_Measures(data.measures_classcific)
//     } else {
//         var arr_measures = []
//         if (event_process[0].measures_id != null) {
//             let event_measures_id = event_process[0].measures_id.split(',')
//             for (let i = 0; i < measures.length; i++) {
//                 if ((event_measures_id.indexOf(String(measures[i].measures_id))) > -1) {
//                     arr_measures.push(measures[i])
//                 }
//             }
//             if (arr_measures.length > 0) {
//                 $('#tbody-General-Measures').empty()
//                 Data_Table_Measures(arr_measures)
//             } else {
//                 data_null_measures()
//             }
//         }
//     }

//     if (data.specific_classification != 'ไม่มีข้อมูล') {
//         $('#tbody-specific').empty()
//         Data_Table_Specific(data.specific_classification)
//     } else {
//         var arr_specific = []
//         if (event_process[0].specific_id != null) {
//             let event_measures_id = event_process[0].specific_id.split(',')
//             for (let i = 0; i < specific.length; i++) {
//                 if ((event_measures_id.indexOf(String(specific[i].pdpa_spcecifi))) > -1) {
//                     arr_specific.push(specific[i])
//                 }
//             }
//             if (arr_specific.length > 0) {
//                 $('#tbody-specific').empty()
//                 Data_Table_Specific(arr_specific)
//             } else {
//                 data_null_specific()
//             }
//             console.log("arr_specific", arr_specific);
//         }
//     }




//     var arr_approach_assets = []
//     var arr_approach_network = []

//     if (data.approach_classcific_type_1 != 'ไม่มีข้อมูล' || data.approach_classcific_type_2 != 'ไม่มีข้อมูล') {
//         if (data.approach_classcific_type_1 != 'ไม่มีข้อมูล') {
//             $('#tbody-Approach-Assets').empty()
//             Data_Table_Approach(data.approach_classcific_type_1)
//         }
//         if (data.approach_classcific_type_2 != 'ไม่มีข้อมูล') {
//             $('#tbody-Approach-Network').empty()
//             Data_Table_Approach_Network(data.approach_classcific_type_2)
//         }
//     } else {
//         if (event_process[0].approach_id != null) {
//             let event_approach_id = event_process[0].approach_id.split(',')
//             for (let i = 0; i < approach.length; i++) {

//                 if ((event_approach_id.indexOf(String(approach[i].approach_id))) > -1 && approach[i].approach_heading_risk_based == 1) {
//                     arr_approach_assets.push(approach[i])
//                 }
//                 if ((event_approach_id.indexOf(String(approach[i].approach_id))) > -1 && approach[i].approach_heading_risk_based == 2) {
//                     arr_approach_network.push(approach[i])
//                 }
//             }

//             if (arr_approach_assets.length > 0) {
//                 $('#tbody-Approach-Assets').empty()
//                 Data_Table_Approach(arr_approach_assets)
//             } else {
//                 $('#tbody-Approach-Assets').empty()
//                 data_null_approach("Assets")
//             }
//             if (arr_approach_network.length > 0) {
//                 $('#tbody-Approach-Network').empty()
//                 Data_Table_Approach_Network(arr_approach_network)
//             } else {
//                 $('#tbody-Approach-Network').empty()
//                 data_null_approach('Network')
//             }

//         }
//     }


// }

// function data_null_approach(data) {
//     $(`#tbody-Approach-${data}`).empty().append(`
//         <tr>
//             <td colspan="20" class="text-center" style="border: none;">
//              <b class="text-danger">ไม่พบข้อมูล</b>
//             </td>
//         </tr>
//         `)
//     document.querySelector(`#show-Approach-${data}`).innerHTML = 0
//     document.querySelector(`#to-show-Approach-${data}`).innerHTML = 0;
//     document.querySelector(`#show-all-Approach-${data}`).innerHTML = 0;

// }

// function data_null_measures() {
//     $('#tbody-General-Measures').empty().append(`
//     <tr>
//         <td colspan="20" class="text-center" style="border: none;">
//          <b class="text-danger">ไม่พบข้อมูล</b>
//         </td>
//     </tr>
//     `)
//     document.querySelector("#show-General-Measures").innerHTML = 0  //  แสดงถึง row เเรกของหน้า 
//     document.querySelector("#to-show-General-Measures").innerHTML = 0;  //  แสดงถึง row สุดท้ายของหน้า
//     document.querySelector("#show-all-General-Measures").innerHTML = 0;
// }


// function Data_Table_Measures(data) {
//     console.log("xxxxxxxxxxxxxxxxxxxxx", data);
//     if (data[0].classification_measures_id) { // กรณีมีการปรับปรุงมาตราการ general
//         for (var i = 0; i < data.length; i++) {
//             data[i].no = i + 1,
//                 data[i].measures_section_name = data[i].classification_measures_section_name,
//                 data[i].measures_detail = data[i].classification_measures_detail,
//                 data[i].measures_date_count = data[i].classification_measures_date_count,
//                 data[i].measures_id = data[i].classification_measures_id,
//                 data[i].measures_supervisor = data[i].classification_measures_supervisor
//         }
//     } else {
//         for (var i = 0; i < data.length; i++) {
//             data[i].no = i + 1
//         }
//     }

//     var state = {
//         'querySet': data,
//         'page': 1,
//         'rows': 30, // จำนวน row
//         'window': 10000, // จำนวนหน้าที่เเสดง
//     }
//     buildTable()
//     function pagination(querySet, page, rows) {
//         var trimStart = (page - 1) * rows
//         var trimEnd = trimStart + rows
//         var trimmedData = querySet.slice(trimStart, trimEnd)
//         var pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
//         return {
//             'querySet': trimmedData,
//             'pages': pages,
//         }
//     }
//     function pageButtons(pages) {
//         // var wrapper = document.getElementById('pagination-wrapper')
//         var wrapper = document.querySelector('.pagination')
//         wrapper.innerHTML = ``
//         var maxLeft = (state.page - Math.floor(state.window / 2))
//         var maxRight = (state.page + Math.floor(state.window / 2))

//         if (maxLeft < 1) {
//             maxLeft = 1
//             maxRight = state.window
//         }
//         if (maxRight > pages) {
//             maxLeft = pages - (state.window - 1)
//             if (maxLeft < 1) {
//                 maxLeft = 1
//             }
//             maxRight = pages
//         }

//         // เช็คหน้าเเรก (ปุ่มย้อนกลับ)
//         // var num = 1
//         if (maxRight > 5) {
//             if (state.page > (maxRight / 2)) {
//                 if ((state.page + 1) > (maxRight / 2)) {
//                     wrapper.innerHTML += '<li class="page-item"><button class="page page-link" value=1>1</button></li>';
//                     wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
//                 }
//             }
//             for (var page = maxLeft; page <= maxRight; page++) {
//                 if ((page >= state.page - 2) && (page <= state.page + 2)) {
//                     if (page == state.page) {
//                         wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`
//                     }
//                     else {
//                         wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`
//                     }
//                 }
//             }
//             if ((state.page) <= (maxRight / 2)) {
//                 mp = maxRight - 1;
//                 wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
//                 wrapper.innerHTML += '<li class="page-item "><button class="page page-link" value=' + maxRight + '>' + maxRight + '</button></li>';
//             }
//         }
//         else {
//             for (var page = maxLeft; page <= maxRight; page++) {
//                 if (state.page == page) {
//                     wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`
//                 } else {
//                     wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`
//                 }
//             }
//         }

//         if (state.page == 1) {
//             wrapper.innerHTML = `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` + wrapper.innerHTML
//         } else {
//             wrapper.innerHTML = `<li value=${state.page - 1} class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` + wrapper.innerHTML
//         }


//         // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
//         if (state.page == pages) {
//             wrapper.innerHTML += `<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>`
//         } else {
//             wrapper.innerHTML += `<li value=${state.page + 1} class="page page-item"><button class="page-link">ถัดไป</button></li>`
//         }


//         $('.page').on('click', function () {
//             $('#tbody-General-Measures').empty()
//             state.page = Number($(this).val())
//             buildTable()
//         })
//     };

//     function buildTable() {
//         var table = $('#tbody-General-Measures');
//         var data = pagination(state.querySet, state.page, state.rows)
//         var myList = data.querySet
//         var show = [];
//         for (var i in myList) {
//             var doc_show = ''
//             if (policy_doc.length > 0) {
//                 let doc_id = myList[i].doc_id.split(',')
//                 policy_doc.forEach(element => {
//                     if ((doc_id.indexOf(String(element.doc_id))) > -1) {
//                         doc_show += `
//                         ${element.doc_name} <a class="text-info" target="_blank" href="/paper/${element.doc_id}"><i class=" fas fa-file-alt fa-2x"></i></a><br>
//                         `
//                     }
//                 });
//             }
//             var row = `<tr>
//                         <td>${myList[i].no}</td>
//                         <td>${myList[i].measures_type}</td>           
//                         <td>
//                             ${myList[i].measures_section_name}
//                         </td>
//                         <td>${doc_show}</td>
//                         <td>${myList[i].measures_detail}</td>
//                         <td><a id="${myList[i].measures_type_id}" label_control="${myList[i].measures_date_count}"
//                         label_supervisor="${myList[i].measures_supervisor}"
//                         date_measures="${myList[i].date_measures}"
//                           href="#edit-measures" data-bs-toggle="modal" onclick="EditMeasures(this,${myList[i].measures_id},'${myList[i].doc_id}')"  class="text-warning">
//                             <i class="fas fa-pencil-alt fa-2x"></i>
//                             </a>
//                         </td>
//                         </tr>
//                         `
//             table.append(row)
//             show.push(myList[i].no)
//         }
//         document.querySelector("#show-General-Measures").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
//         document.querySelector("#to-show-General-Measures").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
//         document.querySelector("#show-all-General-Measures").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
//         pageButtons(data.pages)
//     }


// }

// function EditMeasures(data, id, doc) {
//     let edit_measures = document.getElementById('edit-measures')
//     let select = edit_measures.getElementsByTagName('select')
//     let input = edit_measures.getElementsByTagName('input')
//     let textarea = edit_measures.getElementsByTagName('textarea')
//     let option_types = ''
//     let option_doc = ''
//     if (measures_types.length > 0) {
//         measures_types.forEach(element => {
//             if (element.measures_type_id == data.id) {
//                 option_types += `
//                 <option selected value="${element.measures_type_id}">${element.measures_type}</option>
//                 `
//             } else {
//                 option_types += `
//                 <option value="${element.measures_type_id}">${element.measures_type}</option>
//                 `
//             }
//         });
//     } else {
//         option_types += `
//         <option id="0">ไม่มีมาตรการ</option>
//         `
//     }

//     if (policy_doc.length > 0) {
//         let doc_id = doc.split(',')
//         policy_doc.forEach(element => {
//             if ((doc_id.indexOf(String(element.doc_id))) > -1) {
//                 option_doc += ` selected
//                 <option selected value="${element.doc_id}">${element.doc_name}</option>
//                 `
//             }
//             else {
//                 option_doc += `
//                 <option value="${element.doc_id}" >${element.doc_name}</option>
//                 `
//             }
//         });
//     }

//     select[0].innerHTML = option_types
//     select[1].innerHTML = option_doc
//     let name = $(data).closest("tr").find("td").eq(1).text().trim()
//     // let section_name = $(data).closest("tr").find("td").eq(2).text().trim()
//     let detail = $(data).closest("tr").find("td").eq(4).text().trim()
//     input[0].value = name
//     input[2].value = data.getAttribute('date_measures')
//     input[3].value = data.getAttribute('label_control')
//     input[4].value = data.getAttribute('label_supervisor')
//     textarea[0].value = detail
//     document.getElementById('submit-measures').setAttribute('measures_id', id)
// }


// function Data_Table_Approach(data) {
//     if (data[0].classification_approach_id) { // กรณีมีการปรับปรุงมาตราการ approach
//         for (var i = 0; i < data.length; i++) {
//             data[i].no = i + 1,
//                 data[i].approach_confidentiality = data[i].classification_approach_confidentiality,
//                 data[i].approach_confidentiality_explain = data[i].classification_approach_confidentiality_explain,
//                 data[i].approach_integrity = data[i].classification_approach_integrity,
//                 data[i].approach_integrity_explain = data[i].classification_approach_integrity_explain,
//                 data[i].approach_availability = data[i].classification_approach_availability,
//                 data[i].approach_availability_explain = data[i].classification_approach_availability_explain,
//                 data[i].approach_id = data[i].classification_approach_id,
//                 data[i].measures_date_count = data[i].classification_measures_date_count,
//                 data[i].measures_supervisor = data[i].classification_measures_supervisor,
//                 data[i].measures_detail = data[i].classification_measures_detail,
//                 data[i].measures_section_name = data[i].classification_measures_section_name

//         }
//     } else {
//         for (var i = 0; i < data.length; i++) {
//             data[i].no = i + 1
//         }
//     }

//     var state = {
//         'querySet': data,
//         'page': 1,
//         'rows': 30, // จำนวน row
//         'window': 10000, // จำนวนหน้าที่เเสดง
//     }
//     buildTable()
//     function pagination(querySet, page, rows) {
//         var trimStart = (page - 1) * rows
//         var trimEnd = trimStart + rows
//         var trimmedData = querySet.slice(trimStart, trimEnd)
//         var pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
//         return {
//             'querySet': trimmedData,
//             'pages': pages,
//         }
//     }
//     function pageButtons(pages) {
//         // var wrapper = document.getElementById('pagination-wrapper')
//         var wrapper = document.querySelector('.pagination-Risk-based-Approach-Assets')
//         wrapper.innerHTML = ``
//         var maxLeft = (state.page - Math.floor(state.window / 2))
//         var maxRight = (state.page + Math.floor(state.window / 2))

//         if (maxLeft < 1) {
//             maxLeft = 1
//             maxRight = state.window
//         }
//         if (maxRight > pages) {
//             maxLeft = pages - (state.window - 1)
//             if (maxLeft < 1) {
//                 maxLeft = 1
//             }
//             maxRight = pages
//         }

//         // เช็คหน้าเเรก (ปุ่มย้อนกลับ)
//         // var num = 1
//         if (maxRight > 5) {
//             if (state.page > (maxRight / 2)) {
//                 if ((state.page + 1) > (maxRight / 2)) {
//                     wrapper.innerHTML += '<li class="page-item"><button class="page page-link" value=1>1</button></li>';
//                     wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
//                 }
//             }
//             for (var page = maxLeft; page <= maxRight; page++) {
//                 if ((page >= state.page - 2) && (page <= state.page + 2)) {
//                     if (page == state.page) {
//                         wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`
//                     }
//                     else {
//                         wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`
//                     }
//                 }
//             }
//             if ((state.page) <= (maxRight / 2)) {
//                 mp = maxRight - 1;
//                 wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
//                 wrapper.innerHTML += '<li class="page-item "><button class="page page-link" value=' + maxRight + '>' + maxRight + '</button></li>';
//             }
//         }
//         else {
//             for (var page = maxLeft; page <= maxRight; page++) {
//                 if (state.page == page) {
//                     wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`
//                 } else {
//                     wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`
//                 }
//             }
//         }

//         if (state.page == 1) {
//             wrapper.innerHTML = `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` + wrapper.innerHTML
//         } else {
//             wrapper.innerHTML = `<li value=${state.page - 1} class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` + wrapper.innerHTML
//         }


//         // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
//         if (state.page == pages) {
//             wrapper.innerHTML += `<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>`
//         } else {
//             wrapper.innerHTML += `<li value=${state.page + 1} class="page page-item"><button class="page-link">ถัดไป</button></li>`
//         }


//         $('.page').on('click', function () {
//             $('#tbody-Approach-Assets').empty()
//             state.page = Number($(this).val())
//             buildTable()
//         })
//     };

//     function buildTable() {
//         var table = $('#tbody-Approach-Assets');
//         var data = pagination(state.querySet, state.page, state.rows)
//         var myList = data.querySet
//         var show = [];
//         for (var i in myList) {
//             let confidentiality = '<i class="ti-close text-danger"></i>'
//             let integrity = '<i class="ti-close text-danger"></i>'
//             let availability = '<i class="ti-close text-danger"></i>'

//             if (myList[i].approach_confidentiality == 1) {
//                 confidentiality = `<i class="fas fa-check" style="color: green;"></i>`
//             }
//             if (myList[i].approach_integrity == 1) {
//                 integrity = `<i class="fas fa-check" style="color: green;"></i>`
//             }
//             if (myList[i].approach_availability == 1) {
//                 availability = `<i class="fas fa-check" style="color: green;"></i>`
//             }
//             var doc_show = ''
//             if (policy_doc.length > 0) {
//                 let doc_id = myList[i].doc_id.split(',')
//                 policy_doc.forEach(element => {
//                     if ((doc_id.indexOf(String(element.doc_id))) > -1) {
//                         doc_show += `
//                         ${element.doc_name} <a class="text-info" target="_blank" href="/paper/${element.doc_id}"><i class=" fas fa-file-alt fa-2x"></i></a><br>
//                         `
//                     }
//                 });
//             }

//             var row = `<tr>
//                         <td id="${myList[i].approach_confidentiality},${myList[i].approach_confidentiality_explain}">${myList[i].no}</td>
//                         <td id="${myList[i].approach_integrity},${myList[i].approach_integrity_explain}">${myList[i].measures_section_name}</td>           
//                         <td id="${myList[i].approach_availability},${myList[i].approach_availability_explain}">${myList[i].assets_name}</td>
//                         <td>${doc_show}</td>
//                         <td>${confidentiality}</td>
//                         <td>${integrity}</td>
//                         <td>${availability}</td>
//                         <td><a class="text-info" target="_blank" href="/Risk-based-Approach/details/${myList[i].approach_id}"><i class=" fas fa-file-alt fa-2x"></i></a></td>
//                         <td><a href="#edit-Information-assets" data-bs-toggle="modal" id="${myList[i].approach_id}"
//                         label_control="${myList[i].measures_date_count}"
//                         label_supervisor="${myList[i].measures_supervisor}"
//                         date_measures="${myList[i].date_measures}"
//                         measures_detail="${myList[i].measures_detail}"
//                         onclick="EditApproachAssets(this,${myList[i].assets_id},'${myList[i].doc_id}')"
//                         class="text-warning">
//                             <i class="fas fa-pencil-alt fa-2x"></i>
//                             </a>
//                         </td>
//                         </tr>
//                         `
//             // console.log("row", row);
//             table.append(row)
//             show.push(myList[i].no)
//         }
//         document.querySelector("#show-Approach-Assets").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
//         document.querySelector("#to-show-Approach-Assets").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
//         document.querySelector("#show-all-Approach-Assets").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
//         pageButtons(data.pages)
//     }


// }


// function EditApproachAssets(data, id, doc) {
//     let edit_assets = document.getElementById('edit-Information-assets')
//     let select = edit_assets.getElementsByTagName('select')
//     let input = edit_assets.getElementsByTagName('input')
//     let textarea = edit_assets.getElementsByTagName('textarea')
//     let option_types = ''
//     let option_doc = ''
//     if (assets_type.length > 0) {
//         assets_type.forEach(element => {
//             if (element.assets_id == id) {
//                 option_types += `
//                 <option selected value="${element.assets_id}">${element.assets_name}</option>
//                 `
//             } else {
//                 option_types += `
//                 <option value="${element.assets_id}">${element.assets_name}</option>
//                 `
//             }
//         });
//     } else {
//         option_types += `
//         <option id="0">ไม่มีมาตรการ</option>
//         `
//     }

//     if (policy_doc.length > 0) {
//         let doc_id = doc.split(',')
//         policy_doc.forEach(element => {
//             if ((doc_id.indexOf(String(element.doc_id))) > -1) {
//                 option_doc += ` selected
//                 <option selected value="${element.doc_id}">${element.doc_name}</option>
//                 `
//             }
//             else {
//                 option_doc += `
//                 <option value="${element.doc_id}">${element.doc_name}</option>
//                 `
//             }
//         });
//     }
//     select[1].innerHTML = option_doc
//     select[0].innerHTML = option_types
//     let name = $(data).closest("tr").find("td").eq(1).text().trim()
//     let approach_confidentiality = $(data).closest("tr").find("td").eq(0).attr('id').split(',')
//     let approach_integrity = $(data).closest("tr").find("td").eq(1).attr('id').split(',')
//     let approach_availability = $(data).closest("tr").find("td").eq(2).attr('id').split(',')

//     if (approach_confidentiality[0] == '1') {
//         input[2].checked = true
//     } else {
//         input[3].checked = true
//     }
//     if (approach_integrity[0] == '1') {
//         input[4].checked = true
//     } else {
//         input[5].checked = true
//     }
//     if (approach_availability[0] == '1') {
//         input[6].checked = true
//     } else {
//         input[7].checked = true
//     }
//     textarea[0].innerHTML = data.getAttribute('measures_detail')
//     textarea[1].innerHTML = approach_confidentiality[1]
//     textarea[2].innerHTML = approach_integrity[1]
//     textarea[3].innerHTML = approach_availability[1]
//     input[0].value = name
//     input[8].value = data.getAttribute('date_measures')
//     input[9].value = data.getAttribute('label_control')
//     input[10].value = data.getAttribute('label_supervisor')
//     // console.log("document.getElementById('submit-assets')",document.getElementById('submit-assets'));
//     document.getElementById('submit-assets').setAttribute('approach_id', data.id)
// }


// function Data_Table_Approach_Network(data) {
//     if (data[0].classification_approach_id) { // กรณีมีการปรับปรุงมาตราการ approach
//         for (var i = 0; i < data.length; i++) {
//             data[i].no = i + 1,
//                 data[i].approach_id = data[i].classification_approach_id,
//                 data[i].measures_date_count = data[i].classification_measures_date_count,
//                 data[i].measures_supervisor = data[i].classification_measures_supervisor,
//                 data[i].measures_detail = data[i].classification_measures_detail,
//                 data[i].measures_section_name = data[i].classification_measures_section_name,
//                 data[i].approach_defense_principles = data[i].classification_approach_defense_principles,
//                 data[i].approach_defense_principles_explain = data[i].classification_approach_defense_principles_explain,
//                 data[i].approach_defense_protection = data[i].classification_approach_defense_protection,
//                 data[i].approach_defense_protection_explain = data[i].classification_approach_defense_protection_explain
//         }
//     } else {
//         for (var i = 0; i < data.length; i++) {
//             data[i].no = i + 1
//         }
//     }
//     var state = {
//         'querySet': data,
//         'page': 1,
//         'rows': 30, // จำนวน row
//         'window': 10000, // จำนวนหน้าที่เเสดง
//     }
//     buildTable()
//     function pagination(querySet, page, rows) {
//         var trimStart = (page - 1) * rows
//         var trimEnd = trimStart + rows
//         var trimmedData = querySet.slice(trimStart, trimEnd)
//         var pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
//         return {
//             'querySet': trimmedData,
//             'pages': pages,
//         }
//     }
//     function pageButtons(pages) {
//         // var wrapper = document.getElementById('pagination-wrapper')
//         var wrapper = document.querySelector('.pagination-Risk-based-Approach-Network')
//         wrapper.innerHTML = ``
//         var maxLeft = (state.page - Math.floor(state.window / 2))
//         var maxRight = (state.page + Math.floor(state.window / 2))

//         if (maxLeft < 1) {
//             maxLeft = 1
//             maxRight = state.window
//         }
//         if (maxRight > pages) {
//             maxLeft = pages - (state.window - 1)
//             if (maxLeft < 1) {
//                 maxLeft = 1
//             }
//             maxRight = pages
//         }

//         // เช็คหน้าเเรก (ปุ่มย้อนกลับ)
//         // var num = 1
//         if (maxRight > 5) {
//             if (state.page > (maxRight / 2)) {
//                 if ((state.page + 1) > (maxRight / 2)) {
//                     wrapper.innerHTML += '<li class="page-item"><button class="page page-link" value=1>1</button></li>';
//                     wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
//                 }
//             }
//             for (var page = maxLeft; page <= maxRight; page++) {
//                 if ((page >= state.page - 2) && (page <= state.page + 2)) {
//                     if (page == state.page) {
//                         wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`
//                     }
//                     else {
//                         wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`
//                     }
//                 }
//             }
//             if ((state.page) <= (maxRight / 2)) {
//                 mp = maxRight - 1;
//                 wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
//                 wrapper.innerHTML += '<li class="page-item "><button class="page page-link" value=' + maxRight + '>' + maxRight + '</button></li>';
//             }
//         }
//         else {
//             for (var page = maxLeft; page <= maxRight; page++) {
//                 if (state.page == page) {
//                     wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`
//                 } else {
//                     wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`
//                 }
//             }
//         }

//         if (state.page == 1) {
//             wrapper.innerHTML = `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` + wrapper.innerHTML
//         } else {
//             wrapper.innerHTML = `<li value=${state.page - 1} class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` + wrapper.innerHTML
//         }


//         // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
//         if (state.page == pages) {
//             wrapper.innerHTML += `<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>`
//         } else {
//             wrapper.innerHTML += `<li value=${state.page + 1} class="page page-item"><button class="page-link">ถัดไป</button></li>`
//         }


//         $('.page').on('click', function () {
//             $('#tbody-Approach-Network').empty()
//             state.page = Number($(this).val())
//             buildTable()
//         })
//     };

//     function buildTable() {
//         var table = $('#tbody-Approach-Network');
//         var data = pagination(state.querySet, state.page, state.rows)
//         var myList = data.querySet
//         var show = [];
//         for (var i in myList) {
//             let principles = '<i class="ti-close text-danger"></i>'
//             let protection = '<i class="ti-close text-danger"></i>'
//             if (myList[i].approach_defense_principles == 1) {
//                 principles = `<i class="fas fa-check" style="color: green;"></i>`
//             }
//             if (myList[i].approach_defense_protection == 1) {
//                 protection = `<i class="fas fa-check" style="color: green;"></i>`
//             }
//             var doc_show = ''
//             if (policy_doc.length > 0) {
//                 let doc_id = myList[i].doc_id.split(',')
//                 policy_doc.forEach(element => {
//                     if ((doc_id.indexOf(String(element.doc_id))) > -1) {
//                         doc_show += `
//                         ${element.doc_name} <a class="text-info" target="_blank" href="/paper/${element.doc_id}"><i class=" fas fa-file-alt fa-2x"></i></a><br>
//                         `
//                     }
//                 });
//             }
//             var row = `<tr>
//             <td id="${myList[i].approach_defense_principles},${myList[i].approach_defense_principles_explain}">${myList[i].no}</td>
//             <td id="${myList[i].approach_defense_protection},${myList[i].approach_defense_protection_explain}">${myList[i].measures_section_name}</td>           
//             <td>${myList[i].assets_name}</td>
//             <td>${doc_show}</td>
//             <td>${principles}</td>
//             <td>${protection}</td>
//             <td><a class="text-info"  href="/Risk-based-Approach/details/${myList[i].approach_id}"><i class=" fas fa-file-alt fa-2x"></i></a></td>
//             <td><a  href="#edit-Information-network" data-bs-toggle="modal"
//             label_control="${myList[i].measures_date_count}"
//             label_supervisor="${myList[i].measures_supervisor}"
//             date_measures="${myList[i].date_measures}"
//             measures_detail="${myList[i].measures_detail}"
//             onclick="EditApproachNetwork(this,${myList[i].approach_id},${myList[i].assets_id},'${myList[i].doc_id}','${myList[i].depth_id_defense}','${myList[i].depth_id_measures}')"
//             class="text-warning">
//             <i class="fas fa-pencil-alt fa-2x"></i>
//             </a>
//              </td>
//             </tr>
//             `
//             table.append(row)
//             show.push(myList[i].no)
//         }
//         document.querySelector("#show-Approach-Network").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
//         document.querySelector("#to-show-Approach-Network").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
//         document.querySelector("#show-all-Approach-Network").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
//         pageButtons(data.pages)
//     }


// }


// function EditApproachNetwork(data, approach_id, id, doc, depth, depth_measures) {
//     let edit_assets = document.getElementById('edit-Information-network')
//     let select = edit_assets.getElementsByTagName('select')
//     let input = edit_assets.getElementsByTagName('input')
//     let textarea = edit_assets.getElementsByTagName('textarea')
//     let name = $(data).closest("tr").find("td").eq(1).text().trim()
//     input[0].value = name
//     let option_types = ''
//     let option_doc = ''
//     let option_depth_1 = ''
//     let option_depth_2 = ''

//     if (assets_type.length > 0) {
//         assets_type.forEach(element => {
//             if (element.assets_id == id) {
//                 option_types += `
//                 <option selected value="${element.assets_id}">${element.assets_name}</option>
//                 `
//             } else {
//                 option_types += `
//                 <option  value="${element.assets_id}">${element.assets_name}</option>
//                 `
//             }
//         });
//     } else {
//         option_types += `
//         <option id="0">ไม่มีมาตรการ</option>
//         `
//     }

//     if (policy_doc.length > 0) {
//         let doc_id = doc.split(',')
//         policy_doc.forEach(element => {
//             if ((doc_id.indexOf(String(element.doc_id))) > -1) {
//                 option_doc += ` selected
//                 <option selected value="${element.doc_id}">${element.doc_name}</option>
//                 `
//             }
//             else {
//                 option_doc += `
//                 <option value="${element.doc_id}">${element.doc_name}</option>
//                 `
//             }
//         });
//     }

//     if (depth_type.length > 0) {
//         let depth_id = depth.split(',')
//         let depth_measures_id = depth_measures.split(',')
//         depth_type.forEach(element => {
//             if (element.depth_type == 1) {
//                 if ((depth_id.indexOf(String(element.depth_id))) > -1) {
//                     option_depth_1 += ` selected
//                     <option selected value="${element.depth_id}">${element.depth_name}</option>
//                     `
//                 }
//                 else {
//                     option_depth_1 += `
//                     <option value="${element.depth_id}">${element.depth_name}</option>
//                     `
//                 }
//             } else {
//                 if ((depth_measures_id.indexOf(String(element.depth_id))) > -1) {
//                     option_depth_2 += ` selected
//                     <option selected value="${element.depth_id}">${element.depth_name}</option>
//                     `
//                 }
//                 else {
//                     option_depth_2 += `
//                     <option value="${element.depth_id}">${element.depth_name}</option>
//                     `
//                 }
//             }
//         });
//     }
//     let approach_defense_principles = $(data).closest("tr").find("td").eq(0).attr('id').split(',')
//     let approach_defense_protection = $(data).closest("tr").find("td").eq(1).attr('id').split(',')
//     if (approach_defense_principles[0] == '1') {
//         input[2].checked = true
//     } else {
//         input[3].checked = true
//     }
//     if (approach_defense_protection[0] == '1') {
//         input[5].checked = true
//     } else {
//         input[6].checked = true
//     }
//     textarea[0].innerHTML = data.getAttribute('measures_detail')
//     textarea[1].innerHTML = approach_defense_principles[1]
//     textarea[2].innerHTML = approach_defense_protection[1]
//     select[0].innerHTML = option_types
//     select[1].innerHTML = option_doc
//     select[2].innerHTML = option_depth_1
//     select[3].innerHTML = option_depth_2
//     input[8].value = data.getAttribute('date_measures')
//     input[9].value = data.getAttribute('label_control')
//     input[10].value = data.getAttribute('label_supervisor')
//     document.getElementById('submit-network').setAttribute('approach_id', approach_id)
// }



// function data_null_specific() {
//     $('#tbody-Specific').empty().append(`
//     <tr>
//         <td colspan="20" class="text-center" style="border: none;">
//          <b class="text-danger">ไม่พบข้อมูล</b>
//         </td>
//     </tr>
//     `)
//     document.querySelector("#show-Specific").innerHTML = 0  //  แสดงถึง row เเรกของหน้า 
//     document.querySelector("#to-show-Specific").innerHTML = 0;  //  แสดงถึง row สุดท้ายของหน้า
//     document.querySelector("#show-all-Specific").innerHTML = 0;
// }


// var doc_specific = []
// var process_specific = []

// function Data_Table_Specific(data) {

//     if (data[0].classification_specific_id) {
//         for (var i = 0; i < data.length; i++) {
//             data[i].no = i + 1,
//                 data[i].specify_id = data[i].classification_specific_id,
//                 data[i].measures_section_name = data[i].classification_measures_section_name,
//                 data[i].measures_supervisor = data[i].classification_measures_supervisor,
//                 data[i].measures_date_count = data[i].classification_measures_date_count,
//                 data[i].measures_detail = data[i].classification_measures_detail,

//                 data[i].specific_access_control = data[i].classification_specific_access_control,
//                 data[i].specific_user_access_management = data[i].classification_specific_user_access_management,
//                 data[i].specific_user_responsibilitites = data[i].classification_specific_user_responsibilitites,
//                 data[i].specific_audit_trails = data[i].classification_specific_audit_trails,
//                 data[i].specific_privacy_security_awareness = data[i].classification_specific_privacy_security_awareness,
//                 data[i].specific_where_incident_occurs = data[i].classification_specific_where_incident_occurs,

//                 data[i].specific_access_control_explain = data[i].classification_specific_access_control_explain,
//                 data[i].specific_user_access_management_explain = data[i].classification_specific_user_access_management_explain,
//                 data[i].specific_user_responsibilitites_explain = data[i].classification_specific_user_responsibilitites_explain,
//                 data[i].specific_audit_trails_explain = data[i].classification_specific_audit_trails_explain,
//                 data[i].specific_privacy_security_awareness_explain = data[i].classification_specific_privacy_security_awareness_explain,
//                 data[i].specific_where_incident_occurs_explain = data[i].classification_specific_where_incident_occurs_explain
//         }

//     } else {
//         for (var i = 0; i < data.length; i++) {
//             data[i].no = i + 1
//         }
//     }

//     var state = {
//         'querySet': data,
//         'page': 1,
//         'rows': 30, // จำนวน row
//         'window': 10000, // จำนวนหน้าที่เเสดง
//     }
//     buildTable()
//     function pagination(querySet, page, rows) {
//         var trimStart = (page - 1) * rows
//         var trimEnd = trimStart + rows
//         var trimmedData = querySet.slice(trimStart, trimEnd)
//         var pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
//         return {
//             'querySet': trimmedData,
//             'pages': pages,
//         }
//     }
//     function pageButtons(pages) {
//         // var wrapper = document.getElementById('pagination-wrapper')
//         var wrapper = document.querySelector('.pagination-Specific ')
//         wrapper.innerHTML = ``
//         var maxLeft = (state.page - Math.floor(state.window / 2))
//         var maxRight = (state.page + Math.floor(state.window / 2))

//         if (maxLeft < 1) {
//             maxLeft = 1
//             maxRight = state.window
//         }
//         if (maxRight > pages) {
//             maxLeft = pages - (state.window - 1)
//             if (maxLeft < 1) {
//                 maxLeft = 1
//             }
//             maxRight = pages
//         }

//         // เช็คหน้าเเรก (ปุ่มย้อนกลับ)
//         // var num = 1
//         if (maxRight > 5) {
//             if (state.page > (maxRight / 2)) {
//                 if ((state.page + 1) > (maxRight / 2)) {
//                     wrapper.innerHTML += '<li class="page-item"><button class="page page-link" value=1>1</button></li>';
//                     wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
//                 }
//             }
//             for (var page = maxLeft; page <= maxRight; page++) {
//                 if ((page >= state.page - 2) && (page <= state.page + 2)) {
//                     if (page == state.page) {
//                         wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`
//                     }
//                     else {
//                         wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`
//                     }
//                 }
//             }
//             if ((state.page) <= (maxRight / 2)) {
//                 mp = maxRight - 1;
//                 wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
//                 wrapper.innerHTML += '<li class="page-item "><button class="page page-link" value=' + maxRight + '>' + maxRight + '</button></li>';
//             }
//         }
//         else {
//             for (var page = maxLeft; page <= maxRight; page++) {
//                 if (state.page == page) {
//                     wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`
//                 } else {
//                     wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`
//                 }
//             }
//         }

//         if (state.page == 1) {
//             wrapper.innerHTML = `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` + wrapper.innerHTML
//         } else {
//             wrapper.innerHTML = `<li value=${state.page - 1} class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` + wrapper.innerHTML
//         }


//         // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
//         if (state.page == pages) {
//             wrapper.innerHTML += `<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>`
//         } else {
//             wrapper.innerHTML += `<li value=${state.page + 1} class="page page-item"><button class="page-link">ถัดไป</button></li>`
//         }


//         $('.page').on('click', function () {
//             $('#tbody-specific').empty()
//             state.page = Number($(this).val())
//             buildTable()
//         })
//     };

//     function buildTable() {
//         var table = $('#tbody-specific');
//         var data = pagination(state.querySet, state.page, state.rows)
//         var myList = data.querySet
//         var show = [];
//         for (var i in myList) {
//             var doc_show = ''
//             if (policy_doc.length > 0) {
//                 let doc_id = myList[i].doc_id.split(',')
//                 policy_doc.forEach(element => {
//                     if ((doc_id.indexOf(String(element.doc_id))) > -1) {
//                         doc_show += `
//                         ${element.doc_name} <a class="text-info" target="_blank" href="/paper/${element.doc_id}"><i class=" fas fa-file-alt fa-2x"></i></a><br>
//                         `
//                     }
//                 });
//             }
//             let specific_access_control = '<i class="ti-close text-danger"></i>'
//             let specific_audit_trails = '<i class="ti-close text-danger"></i>'

//             let specific_privacy_security_awareness = '<i class="ti-close text-danger"></i>'

//             let specific_user_access_management = '<i class="ti-close text-danger"></i>'

//             let specific_user_responsibilitites = '<i class="ti-close text-danger"></i>'

//             let specific_where_incident_occurs = '<i class="ti-close text-danger"></i>'

//             if (myList[i].specific_access_control == 1) {
//                 specific_access_control = `<i class="fas fa-check" style="color: green;"></i>`
//             }
//             if (myList[i].specific_audit_trails == 1) {
//                 specific_audit_trails = `<i class="fas fa-check" style="color: green;"></i>`
//             }

//             if (myList[i].specific_privacy_security_awareness == 1) {
//                 specific_privacy_security_awareness = `<i class="fas fa-check" style="color: green;"></i>`
//             }
//             if (myList[i].specific_user_access_management == 1) {
//                 specific_user_access_management = `<i class="fas fa-check" style="color: green;"></i>`
//             }
//             if (myList[i].specific_user_responsibilitites == 1) {
//                 specific_user_responsibilitites = `<i class="fas fa-check" style="color: green;"></i>`
//             }

//             if (myList[i].specific_where_incident_occurs == 1) {
//                 specific_where_incident_occurs = `<i class="fas fa-check" style="color: green;"></i>`
//             }

//             var row = `<tr>
//                         <td>${myList[i].no}</td>
//                         <td>${myList[i].event_process_name}</td>           
//                         <td>${myList[i].measures_section_name}</td>
//                         <td>${doc_show}</td>
//                         <td>${specific_access_control}</td>
//                         <td>${specific_audit_trails}</td>
//                         <td>${specific_privacy_security_awareness}</td>
//                         <td>${specific_user_access_management}</td>
//                         <td>${specific_user_responsibilitites}</td>
//                         <td>${specific_where_incident_occurs}</td>
//                         <td>${myList[i].measures_detail}</td>
//                         <td><a id="${myList[i].event_process_id}" label_control="${myList[i].measures_date_count}"
//                         label_supervisor="${myList[i].measures_supervisor}"
//                         event_process_name="${myList[i].event_process_name}"
//                         date_measures="${myList[i].date_measures}"
//                         types="${myList[i].specific_access_control},${myList[i].specific_audit_trails},${myList[i].specific_privacy_security_awareness},${myList[i].specific_user_access_management},${myList[i].specific_user_responsibilitites},${myList[i].specific_where_incident_occurs}"
//                         types_explain="${myList[i].specific_access_control_explain},${myList[i].specific_audit_trails_explain},${myList[i].specific_privacy_security_awareness_explain},${myList[i].specific_user_access_management_explain},${myList[i].specific_user_responsibilitites_explain},${myList[i].specific_where_incident_occurs_explain}"
//                           href="#edit-specific" data-bs-toggle="modal" onclick="EditSpecific(this,${myList[i].specify_id},'${myList[i].doc_id}')"  class="text-warning">
//                             <i class="fas fa-pencil-alt fa-2x"></i>
//                             </a>
//                         </td>
//                         </tr>
//                         `
//             table.append(row)
//             show.push(myList[i].no)
//         }
//         document.querySelector("#show-General-Measures").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
//         document.querySelector("#to-show-General-Measures").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
//         document.querySelector("#show-all-General-Measures").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
//         pageButtons(data.pages)
//     }

// }

// function Data_Table_Specific(data, process, doc, specific_classification, pattern) {

//     doc_specific = []
//     process_specific = []
//     doc_specific.push(...doc)
//     process_specific.push(...process)


//     console.log("bbbbbbbbbbbbbbbbbb", pattern[0].doc_id);
//     console.log("fffffffffffffff", data);

//     // let arr_specific = []
//     // for (let i = 0; i < data.length; i++) {
//     //     let doc_id = data[i].doc_id.split(',')
//     //     if ((doc_id.indexOf(String(pattern[0].doc_id)) > -1)) {
//     //         console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
//     //     } else {
//     //         console.log("222222222222222", [i]);
//     //         arr_specific.push(i)
//     //     }
//     // }

//     // console.log("arr_specific", arr_specific);
//     // for (let i = 0; i < arr_specific.length; i++) {
//     //     data.splice(arr_specific[i], 1);
//     // }

//     let test = []
//     if (specific_classification[0].classification_specific_id) {
//         for (var i = 0; i < data.length; i++) {
//             data[i].no = i + 1,
//                 data[i].specify_id = data[i].classification_specific_id,
//                 data[i].measures_section_name = data[i].classification_measures_section_name,
//                 data[i].measures_supervisor = data[i].classification_measures_supervisor,
//                 data[i].measures_date_count = data[i].classification_measures_date_count,
//                 data[i].measures_detail = data[i].classification_measures_detail,

//                 data[i].specific_access_control = data[i].classification_specific_access_control,
//                 data[i].specific_user_access_management = data[i].classification_specific_user_access_management,
//                 data[i].specific_user_responsibilitites = data[i].classification_specific_user_responsibilitites,
//                 data[i].specific_audit_trails = data[i].classification_specific_audit_trails,
//                 data[i].specific_privacy_security_awareness = data[i].classification_specific_privacy_security_awareness,
//                 data[i].specific_where_incident_occurs = data[i].classification_specific_where_incident_occurs,

//                 data[i].specific_access_control_explain = data[i].classification_specific_access_control_explain,
//                 data[i].specific_user_access_management_explain = data[i].classification_specific_user_access_management_explain,
//                 data[i].specific_user_responsibilitites_explain = data[i].classification_specific_user_responsibilitites_explain,
//                 data[i].specific_audit_trails_explain = data[i].classification_specific_audit_trails_explain,
//                 data[i].specific_privacy_security_awareness_explain = data[i].classification_specific_privacy_security_awareness_explain,
//                 data[i].specific_where_incident_occurs_explain = data[i].classification_specific_where_incident_occurs_explain
//         }

//     } else {
//         for (var i = 0; i < data.length; i++) {
//             data[i].no = i + 1
//         }
//     }

//     var state = {
//         'querySet': data,
//         'page': 1,
//         'rows': 30, // จำนวน row
//         'window': 10000, // จำนวนหน้าที่เเสดง
//     }
//     buildTable()
//     function pagination(querySet, page, rows) {
//         var trimStart = (page - 1) * rows
//         var trimEnd = trimStart + rows
//         var trimmedData = querySet.slice(trimStart, trimEnd)
//         var pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
//         return {
//             'querySet': trimmedData,
//             'pages': pages,
//         }
//     }
//     function pageButtons(pages) {
//         // var wrapper = document.getElementById('pagination-wrapper')
//         var wrapper = document.querySelector('.pagination-Specific ')
//         wrapper.innerHTML = ``
//         var maxLeft = (state.page - Math.floor(state.window / 2))
//         var maxRight = (state.page + Math.floor(state.window / 2))

//         if (maxLeft < 1) {
//             maxLeft = 1
//             maxRight = state.window
//         }
//         if (maxRight > pages) {
//             maxLeft = pages - (state.window - 1)
//             if (maxLeft < 1) {
//                 maxLeft = 1
//             }
//             maxRight = pages
//         }

//         // เช็คหน้าเเรก (ปุ่มย้อนกลับ)
//         // var num = 1
//         if (maxRight > 5) {
//             if (state.page > (maxRight / 2)) {
//                 if ((state.page + 1) > (maxRight / 2)) {
//                     wrapper.innerHTML += '<li class="page-item"><button class="page page-link" value=1>1</button></li>';
//                     wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
//                 }
//             }
//             for (var page = maxLeft; page <= maxRight; page++) {
//                 if ((page >= state.page - 2) && (page <= state.page + 2)) {
//                     if (page == state.page) {
//                         wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`
//                     }
//                     else {
//                         wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`
//                     }
//                 }
//             }
//             if ((state.page) <= (maxRight / 2)) {
//                 mp = maxRight - 1;
//                 wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
//                 wrapper.innerHTML += '<li class="page-item "><button class="page page-link" value=' + maxRight + '>' + maxRight + '</button></li>';
//             }
//         }
//         else {
//             for (var page = maxLeft; page <= maxRight; page++) {
//                 if (state.page == page) {
//                     wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`
//                 } else {
//                     wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`
//                 }
//             }
//         }

//         if (state.page == 1) {
//             wrapper.innerHTML = `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` + wrapper.innerHTML
//         } else {
//             wrapper.innerHTML = `<li value=${state.page - 1} class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` + wrapper.innerHTML
//         }


//         // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
//         if (state.page == pages) {
//             wrapper.innerHTML += `<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>`
//         } else {
//             wrapper.innerHTML += `<li value=${state.page + 1} class="page page-item"><button class="page-link">ถัดไป</button></li>`
//         }


//         $('.page').on('click', function () {
//             $('#tbody-specific').empty()
//             state.page = Number($(this).val())
//             buildTable()
//         })
//     };

//     function buildTable() {
//         var table = $('#tbody-specific');
//         var data = pagination(state.querySet, state.page, state.rows)
//         var myList = data.querySet
//         var show = [];
//         for (var i in myList) {
//             var doc_show = ''
//             if (doc.length > 0) {
//                 let doc_id = myList[i].doc_id.split(',')
//                 doc.forEach(element => {
//                     if ((doc_id.indexOf(String(element.doc_id))) > -1) {
//                         doc_show += `
//                         ${element.doc_name} <a class="text-info" target="_blank" href="/paper/${element.doc_id}"><i class=" fas fa-file-alt fa-2x"></i></a><br>
//                         `
//                     }
//                 });
//             }
//             let specific_access_control = '<i class="ti-close text-danger"></i>'
//             let specific_audit_trails = '<i class="ti-close text-danger"></i>'

//             let specific_privacy_security_awareness = '<i class="ti-close text-danger"></i>'

//             let specific_user_access_management = '<i class="ti-close text-danger"></i>'

//             let specific_user_responsibilitites = '<i class="ti-close text-danger"></i>'

//             let specific_where_incident_occurs = '<i class="ti-close text-danger"></i>'

//             if (myList[i].specific_access_control == 1) {
//                 specific_access_control = `<i class="fas fa-check" style="color: green;"></i>`
//             }
//             if (myList[i].specific_audit_trails == 1) {
//                 specific_audit_trails = `<i class="fas fa-check" style="color: green;"></i>`
//             }

//             if (myList[i].specific_privacy_security_awareness == 1) {
//                 specific_privacy_security_awareness = `<i class="fas fa-check" style="color: green;"></i>`
//             }
//             if (myList[i].specific_user_access_management == 1) {
//                 specific_user_access_management = `<i class="fas fa-check" style="color: green;"></i>`
//             }
//             if (myList[i].specific_user_responsibilitites == 1) {
//                 specific_user_responsibilitites = `<i class="fas fa-check" style="color: green;"></i>`
//             }

//             if (myList[i].specific_where_incident_occurs == 1) {
//                 specific_where_incident_occurs = `<i class="fas fa-check" style="color: green;"></i>`
//             }
//             var row = `<tr>
//                         <td>${myList[i].no}</td>
//                         <td>${myList[i].event_process_name}</td>           
//                         <td>${myList[i].measures_section_name}</td>
//                         <td>${doc_show}</td>
//                         <td>${specific_access_control}</td>
//                         <td>${specific_audit_trails}</td>
//                         <td>${specific_privacy_security_awareness}</td>
//                         <td>${specific_user_access_management}</td>
//                         <td>${specific_user_responsibilitites}</td>
//                         <td>${specific_where_incident_occurs}</td>
//                         <td>${myList[i].measures_detail}</td>
//                         <td><a id="${myList[i].event_process_id}" label_control="${myList[i].measures_date_count}"
//                         label_supervisor="${myList[i].measures_supervisor}"
//                         event_process_name="${myList[i].event_process_name}"
//                         date_measures="${myList[i].date_measures}"
//                         types="${myList[i].specific_access_control},${myList[i].specific_audit_trails},${myList[i].specific_privacy_security_awareness},${myList[i].specific_user_access_management},${myList[i].specific_user_responsibilitites},${myList[i].specific_where_incident_occurs}"
//                         types_explain="${myList[i].specific_access_control_explain},${myList[i].specific_audit_trails_explain},${myList[i].specific_privacy_security_awareness_explain},${myList[i].specific_user_access_management_explain},${myList[i].specific_user_responsibilitites_explain},${myList[i].specific_where_incident_occurs_explain}"
//                           href="#edit-specific" data-bs-toggle="modal" onclick="EditSpecific(this,${myList[i].specify_id},'${myList[i].doc_id}')"  class="text-warning">
//                             <i class="fas fa-pencil-alt fa-2x"></i>
//                             </a>
//                         </td>
//                         </tr>
//                         `
//             table.append(row)
//             show.push(myList[i].no)
//         }
//         document.querySelector("#show-General-Measures").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
//         document.querySelector("#to-show-General-Measures").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
//         document.querySelector("#show-all-General-Measures").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
//         pageButtons(data.pages)
//     }


// }



// function EditSpecific(data, id, doc) {
//     let edit_specific = document.getElementById('edit-specific')
//     let select = edit_specific.getElementsByTagName('select')
//     let input = edit_specific.getElementsByTagName('input')
//     let textarea = edit_specific.getElementsByTagName('textarea')
//     // let option_types = ''
//     let option_doc = ''

//     // if (process_specific.length > 0) {
//     //     process_specific.forEach(element => {
//     //         if (element.event_process_id == data.id) {
//     //             option_types += `
//     //             <option selected value="${element.event_process_id}">${element.event_process_name}</option>
//     //             `
//     //         } else {
//     //             option_types += `
//     //             <option value="${element.event_process_id}">${element.event_process_name}</option>
//     //             `
//     //         }
//     //     });
//     // } else {
//     //     option_types += `
//     //     <option id="0">ไม่มีมาตรการ</option>
//     //     `
//     // }

//     if (policy_doc.length > 0) {
//         let doc_id = doc.split(',')
//         policy_doc.forEach(element => {
//             if ((doc_id.indexOf(String(element.doc_id))) > -1) {
//                 option_doc += ` selected
//                 <option selected value="${element.doc_id}">${element.doc_name}</option>
//                 `
//             }
//             else {
//                 option_doc += `
//                 <option value="${element.doc_id}" >${element.doc_name}</option>
//                 `
//             }
//         });
//     }
//     select[0].innerHTML = `<option >${data.getAttribute('event_process_name')}</option>`
//     select[1].innerHTML = option_doc
//     input[0].value = $(data).closest("tr").find("td").eq(2).text().trim()
//     textarea[0].value = $(data).closest("tr").find("td").eq(10).text().trim()
//     input[14].value = data.getAttribute('date_measures')
//     input[15].value = data.getAttribute('label_control')
//     input[16].value = data.getAttribute('label_supervisor')
//     let types = (data.getAttribute('types')).split(',')
//     let types_explain = (data.getAttribute('types_explain')).split(',')

//     textarea[1].value = types_explain[0]
//     textarea[2].value = types_explain[1]
//     textarea[3].value = types_explain[2]
//     textarea[4].value = types_explain[3]
//     textarea[5].value = types_explain[4]
//     textarea[6].value = types_explain[5]

//     if (types[0] == '1') {
//         input[2].checked = true
//     } else {
//         input[3].checked = true
//     }
//     if (types[1] == '1') {
//         input[4].checked = true
//     } else {
//         input[5].checked = true
//     }

//     if (types[2] == '1') {
//         input[6].checked = true
//     } else {
//         input[7].checked = true
//     }
//     if (types[3] == '1') {
//         input[8].checked = true
//     } else {
//         input[9].checked = true
//     }
//     if (types[4] == '1') {
//         input[10].checked = true
//     } else {
//         input[11].checked = true
//     }
//     if (types[5] == '1') {
//         input[12].checked = true
//     } else {
//         input[13].checked = true
//     }
//     document.getElementById('submit-specific').setAttribute('specific_id', id)

// }



// var data_measures = []
// document.getElementById('submit-measures').addEventListener('click', function () { // ตอนปรับปรุงมาตราการ genaeral 
//     let measures_id = document.getElementById('submit-measures').getAttribute('measures_id')
//     if (data_measures.length > 0) {
//         for (let i = 0; i < data_measures.length; i++) {
//             if (String(data_measures[i].measures_id) == String(measures_id)) {
//                 data_measures.splice(data_measures[i], 1);
//             }
//         }
//     }
//     var data = {}
//     let edit_meeasures = document.getElementById('edit-measures')
//     let select = edit_meeasures.getElementsByTagName('select')
//     let input = edit_meeasures.getElementsByTagName('input')
//     let textarea = edit_meeasures.getElementsByTagName('textarea')
//     var value = select[0].value;
//     var selected = [];
//     for (var option of select[1].options) {
//         if (option.selected) {
//             selected.push(option.value);
//         }
//     }
//     data.measures_type_id = value
//     data.doc_id = selected
//     data.measures_section_name = input[0].value
//     data.measures_date = input[2].value
//     data.measures_date_count = input[3].value
//     data.measures_supervisor = input[4].value
//     data.measures_detail = textarea[0].value
//     data.measures_id = measures_id
//     data_measures.push(data)
//     // console.log("x___________ data_measures ________________x", data_measures);
// })

// function submit_measures() {
//     let measures_id = document.getElementById('submit-measures').getAttribute('measures_id')
//     if (data_measures.length > 0) {
//         for (let i = 0; i < data_measures.length; i++) {
//             if (String(data_measures[i].measures_id) == String(measures_id)) {
//                 data_measures.splice(data_measures[i], 1);
//             }
//         }
//     }
//     var data = {}
//     let edit_meeasures = document.getElementById('edit-measures')
//     let select = edit_meeasures.getElementsByTagName('select')
//     let input = edit_meeasures.getElementsByTagName('input')
//     let textarea = edit_meeasures.getElementsByTagName('textarea')
//     var value = select[0].value;
//     var selected = [];
//     for (var option of select[1].options) {
//         if (option.selected) {
//             selected.push(option.value);
//         }
//     }
//     data.measures_type_id = value
//     data.doc_id = selected
//     data.measures_section_name = input[0].value
//     data.measures_date = input[2].value
//     data.measures_date_count = input[3].value
//     data.measures_supervisor = input[4].value
//     data.measures_detail = textarea[0].value
//     data.measures_id = measures_id
//     data_measures.push(data)
//     // console.log("x___________ data_measures ________________x", data_measures);
// }

// var data_assets = []
// document.getElementById('submit-assets').addEventListener('click', () => {
//     let approach_id = document.getElementById('submit-assets').getAttribute('approach_id')
//     if (data_assets.length > 0) {
//         for (let i = 0; i < data_assets.length; i++) {
//             if (String(data_assets[i].measures_id) == String(approach_id)) {
//                 data_assets.splice(data_assets[i], 1);
//             }
//         }
//     }
//     let edit_assets = document.getElementById('edit-Information-assets')
//     let select = edit_assets.getElementsByTagName('select')
//     let input = edit_assets.getElementsByTagName('input')
//     let textarea = edit_assets.getElementsByTagName('textarea')



//     var data = {}
//     data.measures_detail = textarea[0].value
//     data.confidentiality_explain = textarea[1].value
//     data.integrity_explain = textarea[2].value
//     data.availability_explain = textarea[3].value



//     data.measures_section_name = input[0].value
//     data.measures_date = input[8].value
//     data.measures_date_count = input[9].value
//     data.measures_supervisor = input[10].value

//     if (input[2].checked == true) {
//         data.confidentiality = 1
//     } else {
//         data.confidentiality = 0
//     }

//     if (input[4].checked == true) {
//         data.integrity = 1
//     } else {
//         data.integrity = 0
//     }

//     if (input[6].checked == true) {
//         data.availability = 1
//     } else {
//         data.availability = 0
//     }

//     data.assets_id = select[0].value
//     var selected = [];
//     for (var option of select[1].options) {
//         if (option.selected) {
//             selected.push(option.value);
//         }
//     }
//     data.doc_id = selected
//     data.approach_id = approach_id

//     console.log("z____________ data _________z ", data);
//     data_assets.push(data)
// })

// function submit_assets() {
//     let approach_id = document.getElementById('submit-assets').getAttribute('approach_id')
//     console.log("approach_id asaaaaaaaaaaaaaaaa", approach_id);
//     if (data_assets.length > 0) {
//         for (let i = 0; i < data_assets.length; i++) {
//             console.log(String(data_assets[i]));
//             if (String(data_assets[i].approach_id) == String(approach_id)) {
//                 data_assets.splice(data_assets[i], 1);
//             }
//         }
//     }
//     let edit_assets = document.getElementById('edit-Information-assets')
//     let select = edit_assets.getElementsByTagName('select')
//     let input = edit_assets.getElementsByTagName('input')
//     let textarea = edit_assets.getElementsByTagName('textarea')



//     var data = {}
//     data.measures_detail = textarea[0].value
//     data.confidentiality_explain = textarea[1].value
//     data.integrity_explain = textarea[2].value
//     data.availability_explain = textarea[3].value



//     data.measures_section_name = input[0].value
//     data.measures_date = input[8].value
//     data.measures_date_count = input[9].value
//     data.measures_supervisor = input[10].value

//     if (input[2].checked == true) {
//         data.confidentiality = 1
//     } else {
//         data.confidentiality = 0
//     }

//     if (input[4].checked == true) {
//         data.integrity = 1
//     } else {
//         data.integrity = 0
//     }

//     if (input[6].checked == true) {
//         data.availability = 1
//     } else {
//         data.availability = 0
//     }

//     data.assets_id = select[0].value
//     var selected = [];
//     for (var option of select[1].options) {
//         if (option.selected) {
//             selected.push(option.value);
//         }
//     }
//     data.doc_id = selected
//     data.approach_id = approach_id
//     data_assets.push(data)
// }

// var data_network = []
// document.getElementById('submit-network').addEventListener('click', () => {
//     let approach_id = document.getElementById('submit-network').getAttribute('approach_id')
//     if (data_network.length > 0) {
//         for (let i = 0; i < data_network.length; i++) {
//             if (String(data_network[i].measures_id) == String(approach_id)) {
//                 data_network.splice(data_network[i], 1);
//             }
//         }
//     }
//     let edit_network = document.getElementById('edit-Information-network')
//     let select = edit_network.getElementsByTagName('select')
//     let input = edit_network.getElementsByTagName('input')
//     let textarea = edit_network.getElementsByTagName('textarea')

//     console.log("z__________ input ___________z", input);

//     var data = {}
//     data.measures_detail = textarea[0].value
//     data.defense_explain = textarea[1].value
//     data.principles_explain = textarea[2].value

//     data.assets_id = select[0].value
//     data.approach_id = approach_id

//     data.measures_section_name = input[0].value
//     data.measures_date = input[8].value
//     data.measures_date_count = input[9].value
//     data.measures_supervisor = input[10].value


//     if (input[2].checked == true) {
//         data.approach_defense_principles = 1
//     } else {
//         data.approach_defense_principles = 0
//     }
//     if (input[5].checked == true) {
//         data.approach_defense_protection = 1
//     } else {
//         data.approach_defense_protection = 0
//     }

//     var selected_doc_id = [];
//     for (var option of select[1].options) {
//         if (option.selected) {
//             selected_doc_id.push(option.value);
//         }
//     }
//     data.doc_id = selected_doc_id

//     var selected_depth_1 = [];
//     for (var option of select[2].options) {
//         if (option.selected) {
//             selected_depth_1.push(option.value);
//         }
//     }
//     data.depth_id_defense = selected_depth_1

//     var selected_depth_2 = [];
//     for (var option of select[3].options) {
//         if (option.selected) {
//             selected_depth_2.push(option.value);
//         }
//     }
//     data.depth_id_measures = selected_depth_2
//     data_network.push(data)
//     console.log("z__________ data ___________z", data);

// })

// function submit_network() {
//     let approach_id = document.getElementById('submit-network').getAttribute('approach_id')
//     if (data_network.length > 0) {
//         for (let i = 0; i < data_network.length; i++) {
//             if (String(data_network[i].measures_id) == String(approach_id)) {
//                 data_network.splice(data_network[i], 1);
//             }
//         }
//     }
//     let edit_network = document.getElementById('edit-Information-network')
//     let select = edit_network.getElementsByTagName('select')
//     let input = edit_network.getElementsByTagName('input')
//     let textarea = edit_network.getElementsByTagName('textarea')

//     console.log("z__________ input ___________z", input);

//     var data = {}
//     data.measures_detail = textarea[0].value
//     data.defense_explain = textarea[1].value
//     data.principles_explain = textarea[2].value

//     data.assets_id = select[0].value
//     data.approach_id = approach_id

//     data.measures_section_name = input[0].value
//     data.measures_date = input[8].value
//     data.measures_date_count = input[9].value
//     data.measures_supervisor = input[10].value


//     if (input[2].checked == true) {
//         data.approach_defense_principles = 1
//     } else {
//         data.approach_defense_principles = 0
//     }
//     if (input[5].checked == true) {
//         data.approach_defense_protection = 1
//     } else {
//         data.approach_defense_protection = 0
//     }

//     var selected_doc_id = [];
//     for (var option of select[1].options) {
//         if (option.selected) {
//             selected_doc_id.push(option.value);
//         }
//     }
//     data.doc_id = selected_doc_id

//     var selected_depth_1 = [];
//     for (var option of select[2].options) {
//         if (option.selected) {
//             selected_depth_1.push(option.value);
//         }
//     }
//     data.depth_id_defense = selected_depth_1

//     var selected_depth_2 = [];
//     for (var option of select[3].options) {
//         if (option.selected) {
//             selected_depth_2.push(option.value);
//         }
//     }
//     data.depth_id_measures = selected_depth_2
//     data_network.push(data)
//     console.log("z__________ data ___________z", data);
// }

// function submit_network() {
//     let approach_id = document.getElementById('submit-network').getAttribute('approach_id')
//     if (data_network.length > 0) {
//         for (let i = 0; i < data_network.length; i++) {
//             if (String(data_network[i].approach_id) == String(approach_id)) {
//                 data_network.splice(data_network[i], 1);
//             }
//         }
//     }
//     let edit_network = document.getElementById('edit-Information-network')
//     let select = edit_network.getElementsByTagName('select')
//     let input = edit_network.getElementsByTagName('input')
//     let textarea = edit_network.getElementsByTagName('textarea')

//     console.log("z__________ input ___________z", input);

//     var data = {}
//     data.measures_detail = textarea[0].value
//     data.defense_explain = textarea[1].value
//     data.principles_explain = textarea[2].value

//     data.assets_id = select[0].value
//     data.approach_id = approach_id

//     data.measures_section_name = input[0].value
//     data.measures_date = input[8].value
//     data.measures_date_count = input[9].value
//     data.measures_supervisor = input[10].value


//     if (input[2].checked == true) {
//         data.approach_defense_principles = 1
//     } else {
//         data.approach_defense_principles = 0
//     }
//     if (input[5].checked == true) {
//         data.approach_defense_protection = 1
//     } else {
//         data.approach_defense_protection = 0
//     }

//     var selected_doc_id = [];
//     for (var option of select[1].options) {
//         if (option.selected) {
//             selected_doc_id.push(option.value);
//         }
//     }
//     data.doc_id = selected_doc_id

//     var selected_depth_1 = [];
//     for (var option of select[2].options) {
//         if (option.selected) {
//             selected_depth_1.push(option.value);
//         }
//     }
//     data.depth_id_defense = selected_depth_1

//     var selected_depth_2 = [];
//     for (var option of select[3].options) {
//         if (option.selected) {
//             selected_depth_2.push(option.value);
//         }
//     }
//     data.depth_id_measures = selected_depth_2
//     data_network.push(data)
//     console.log("z__________ data ___________z", data);

// }
// var data_specific = []
// function submit_specific() {
//     let specific_id = document.getElementById('submit-specific').getAttribute('specific_id')
//     let edit_specific = document.getElementById('edit-specific')
//     let select = edit_specific.getElementsByTagName('select')
//     let input = edit_specific.getElementsByTagName('input')
//     let textarea = edit_specific.getElementsByTagName('textarea')
//     console.log("textarea", textarea);
//     if (data_specific.length > 0) {
//         for (let i = 0; i < data_specific.length; i++) {
//             if (String(data_specific[i].specific_id) == String(specific_id)) {
//                 data_specific.splice(data_specific[i], 1);
//             }
//         }
//     }

//     let data = {}
//     data.control_explain = textarea[1].value
//     data.responsibilitites_explain = textarea[2].value
//     data.management_explain = textarea[3].value
//     data.audit_explain = textarea[4].value
//     data.awareness_explain = textarea[5].value
//     data.occurs_explain = textarea[6].value
//     data.measures_detail = textarea[0].value
//     data.measures_section_name = input[0].value
//     data.measures_date = input[14].value
//     data.measures_date_count = input[15].value
//     data.measures_supervisor = input[16].value
//     data.event_process_id = select[0].value
//     data.specific_id = specific_id
//     var selected = [];
//     for (var option of select[1].options) {
//         if (option.selected) {
//             selected.push(option.value);
//         }
//     }
//     data.doc_id = selected
//     if (input[2].checked == true) {
//         data.access = 1
//     } else {
//         data.access = 0
//     }
//     if (input[4].checked == true) {
//         data.management = 1
//     } else {
//         data.management = 0
//     }

//     if (input[6].checked == true) {
//         data.responsibilitites = 1
//     } else {
//         data.responsibilitites = 0
//     }

//     if (input[8].checked == true) {
//         data.audit = 1
//     } else {
//         data.audit = 0
//     }
//     if (input[10].checked == true) {
//         data.awareness = 1
//     } else {
//         data.awareness = 0
//     }
//     if (input[12].checked == true) {
//         data.occurs = 1
//     } else {
//         data.occurs = 0
//     }
//     data_specific.push(data)
// }



// func  สร้าง ตารางมาตราการเเดสงหน้าเว็บหลังจากเลือก patter






function createPatternSpecific(data) {
    data_set_found = [];
    if (data == "ไม่มีข้อมูล") {
        $("#tbody-specific").empty().append(`<tr>
                                    <td colspan="20" class="text-center" style="border: none;">
                                    <b class="text-danger">ไม่พบข้อมูล</b>
                                    </td>
                                    </tr>
                                `);
    } else {
        data = data.map((item, index) => { data_set_found.push(Number(item.specific_id)); return { ...item, no: index + 1 }; });
        $("#tbody-specific").empty();
        // data = data.map((item, index) => { return { ...item, no: index + 1 }; });

        var state = {
            querySet: data,
            page: 1,
            rows: 30, // จำนวน row
            window: 10000, // จำนวนหน้าที่เเสดง
        };
        buildTable();
        function pagination(querySet, page, rows) {
            var trimStart = (page - 1) * rows;
            var trimEnd = trimStart + rows;
            var trimmedData = querySet.slice(trimStart, trimEnd);
            var pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
            return {
                querySet: trimmedData,
                pages: pages,
            };
        }

        // function pageButtons(pages) {
        //     // var wrapper = document.getElementById('pagination-wrapper')
        //     var wrapper = document.querySelector(".pagination-Specific");
        //     wrapper.innerHTML = ``;
        //     var maxLeft = state.page - Math.floor(state.window / 2);
        //     var maxRight = state.page + Math.floor(state.window / 2);

        //     if (maxLeft < 1) {
        //         maxLeft = 1;
        //         maxRight = state.window;
        //     }
        //     if (maxRight > pages) {
        //         maxLeft = pages - (state.window - 1);
        //         if (maxLeft < 1) {
        //             maxLeft = 1;
        //         }
        //         maxRight = pages;
        //     }

        //     // เช็คหน้าเเรก (ปุ่มย้อนกลับ)
        //     // var num = 1
        //     if (maxRight > 5) {
        //         if (state.page > maxRight / 2) {
        //             if (state.page + 1 > maxRight / 2) {
        //                 wrapper.innerHTML +=
        //                     '<li class="page-item"><button class="page page-link" value=1>1</button></li>';
        //                 wrapper.innerHTML +=
        //                     '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
        //             }
        //         }
        //         for (var page = maxLeft; page <= maxRight; page++) {
        //             if (page >= state.page - 2 && page <= state.page + 2) {
        //                 if (page == state.page) {
        //                     wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`;
        //                 } else {
        //                     wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`;
        //                 }
        //             }
        //         }
        //         if (state.page <= maxRight / 2) {
        //             mp = maxRight - 1;
        //             wrapper.innerHTML +=
        //                 '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
        //             wrapper.innerHTML +=
        //                 '<li class="page-item "><button class="page page-link" value=' +
        //                 maxRight +
        //                 ">" +
        //                 maxRight +
        //                 "</button></li>";
        //         }
        //     } else {
        //         for (var page = maxLeft; page <= maxRight; page++) {
        //             if (state.page == page) {
        //                 wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`;
        //             } else {
        //                 wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`;
        //             }
        //         }
        //     }

        //     if (state.page == 1) {
        //         wrapper.innerHTML =
        //             `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` +
        //             wrapper.innerHTML;
        //     } else {
        //         wrapper.innerHTML =
        //             `<li value=${state.page - 1
        //             } class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` +
        //             wrapper.innerHTML;
        //     }

        //     // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
        //     if (state.page == pages) {
        //         wrapper.innerHTML += `<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>`;
        //     } else {
        //         wrapper.innerHTML += `<li value=${state.page + 1
        //             } class="page page-item"><button class="page-link">ถัดไป</button></li>`;
        //     }

        //     $(".page").on("click", function () {
        //         $("#table_sortable").remove();
        //         state.page = Number($(this).val());
        //         buildTable();
        //     });
        // }
        function buildTable() {
            let table = $("#tbody-specific");
            let data = pagination(state.querySet, state.page, state.rows);
            let myList = data.querySet;
            let policys = policy[0];
            for (let i in myList) {
                let number_specific = [];
                let number_specific_explain = [];
                if (data_new.length > 0) {
                    for (let j = 0; j < data_new.length; j++) {
                        if (data_new[j].id_specific == myList[i].specific_id) {
                            myList[i].pattern_specific_access_control = parseInt(data_new[j].specific_access_control);
                            myList[i].pattern_specific_audit_trails = parseInt(data_new[j].specific_audit_trails);
                            myList[i].pattern_specific_privacy_security_awareness = parseInt(data_new[j].specific_privacy_security_awareness);
                            myList[i].pattern_specific_user_access_management = parseInt(data_new[j].specific_user_access_management);
                            myList[i].pattern_specific_user_responsibilitites = parseInt(data_new[j].specific_user_responsibilitites);
                            myList[i].pattern_specific_where_incident_occurs = parseInt(data_new[j].specific_where_incident_occurs);
                            myList[i].id_specific = data_new[j].id_specific;
                            myList[i].event_process_id = Number(data_new[j].id_event_proccess);
                            myList[i].pattern_measures_supervisor = data_new[j].measures_supervisor;
                            myList[i].pattern_measures_date_count = Number(data_new[j].measures_date_count);
                            myList[i].date = data_new[j].measures_date;
                            myList[i].event_process_name = data_new[j].event_process_name;
                            myList[i].pattern_specific_access_control_explain = data_new[j].specific_access_control_explain;
                            myList[i].pattern_specific_audit_trails_explain = data_new[j].specific_audit_trails_explain;
                            myList[i].pattern_specific_privacy_security_awareness_explain = data_new[j].specific_privacy_security_awareness_explain;
                            myList[i].pattern_specific_user_access_management_explain = data_new[j].specific_user_access_management_explain;
                            myList[i].pattern_specific_user_responsibilitites_explain = data_new[j].specific_user_responsibilitites_explain;
                            myList[i].pattern_specific_where_incident_occurs_explain = data_new[j].specific_where_incident_occurs_explain;
                        }
                    }
                }
                number_specific_explain.push(
                    myList[i].pattern_specific_access_control_explain,
                    myList[i].pattern_specific_user_access_management_explain,
                    myList[i].pattern_specific_user_responsibilitites_explain,
                    myList[i].pattern_specific_audit_trails_explain,
                    myList[i].pattern_specific_privacy_security_awareness_explain,
                    myList[i].pattern_specific_where_incident_occurs_explain
                );
                number_specific.push(
                    myList[i].pattern_specific_access_control,
                    myList[i].pattern_specific_user_access_management,
                    myList[i].pattern_specific_user_responsibilitites,
                    myList[i].pattern_specific_audit_trails,
                    myList[i].pattern_specific_privacy_security_awareness,
                    myList[i].pattern_specific_where_incident_occurs
                );

                let array_doc_id = myList[i].pattern_specific_doc_id.split(",");
                let doc_name = "";
                for (let j = 0; j < policys.length; j++) {
                    if (array_doc_id.indexOf(String(policys[j].doc_id)) > -1) {
                        doc_name += policys[j].doc_name + ", <br>";
                    }
                }
                let row = `<tr id ="${myList[i].specific_id}">
                    <td>
                    <a class="text-warning" doc_id="${myList[i].pattern_specific_doc_id}"  
                    event_process_id = "${myList[i].event_process_id}"
                    measures_detail="${myList[i].pattern_measures_detail}" 
                    pattern_specific_id="${myList[i].pattern_specific_id}"
                    measures_supervisor="${myList[i].pattern_measures_supervisor}" 
                    date="${myList[i].date}" date_count="${myList[i].pattern_measures_date_count}" 
                    data-bs-toggle="modal" data-bs-target="#edit-measures-chooses"
                    onclick="edit_measures_chooses(this,${myList[i].specific_id})">
                    <i class="fas fa-pencil-alt fa-2x"></i>
                    </a>
                    </td>
                    <td class="${number_specific}">${myList[i].no}</td>
                    <td class="${number_specific_explain}">${myList[i].event_process_name}</td>           
                    <td>${myList[i].pattern_measures_section_name}</td>
                    <td>${myList[i].pattern_specific_access_control === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'}</td> 
                    <td>${myList[i].pattern_specific_user_access_management === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'}</td>
                    <td>${myList[i].pattern_specific_user_responsibilitites === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'}</td>
                    <td>${myList[i].pattern_specific_audit_trails === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'}</td>
                    <td>${myList[i].pattern_specific_privacy_security_awareness === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'}</td>
                    <td>${myList[i].pattern_specific_where_incident_occurs === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'}</td>
                    <td>${doc_name}</td>
                    <td><a class="text-info" target="_blank"  href="/Specific-Measures/details/${myList[i].specific_id}"><i class=" fas fa-file-alt fa-2x"></i></a></td>
                    </tr>
                    `;
                table.append(row);
            }
        }
    }
}

// func เเก้ไขมาตราการ
function edit_measures_chooses(data, id) {
    $('input[name="measures_date"]').val(data.getAttribute("date"));
    $('textarea[name="measures_detail"]').val(data.getAttribute("measures_detail"));
    $('input[name="measures_date_count"]').val(data.getAttribute("date_count"));
    let measures_supervisor = data.getAttribute("measures_supervisor").split(',')
    let arrSupervisor = supervisor[0].account
    let option = ''
    // multiple select option 
    arrSupervisor.forEach(arrSupervisor => {
        if (measures_supervisor.indexOf(String(arrSupervisor.acc_id)) > -1) {
            option += `<option selected value='${arrSupervisor.acc_id}'>${arrSupervisor.firstname} ${arrSupervisor.lastname} </option>`
        } else {
            option += `<option value='${arrSupervisor.acc_id}'>${arrSupervisor.firstname} ${arrSupervisor.lastname} </option>`
        }
    });
    $('select[name="measures_supervisor"]').html(option);
    $('select[name="measures_supervisor"]').html(option);
    $('input[name="measures_section_name"]').val($(data).closest("tr").find("td").eq(3).text().trim());

    let number_specific = $(data).closest("tr").find("td").eq(1).attr("class").split(",");
    let number_specific_explain = $(data).closest("tr").find("td").eq(2).attr("class").split(",");

    console.log("number_specific", number_specific);

    var specific_access_control = document.querySelectorAll('input[name$="specific_access_control"]');
    var specific_user_access_management = document.querySelectorAll('input[name$="specific_user_access_management"]');
    var specific_user_responsibilitites = document.querySelectorAll('input[name$="specific_user_responsibilitites"]');
    var specific_audit_trails = document.querySelectorAll('input[name$="specific_audit_trails"]');
    var specific_privacy_security_awareness = document.querySelectorAll('input[name$="specific_privacy_security_awareness"]');
    var specific_where_incident_occurs = document.querySelectorAll('input[name$="specific_where_incident_occurs"]');

    $('textarea[name="specific_access_control_explain"]').val(number_specific_explain[0]);
    $('textarea[name="specific_user_access_management_explain"]').val(number_specific_explain[1]);
    $('textarea[name="specific_user_responsibilitites_explain"]').val(number_specific_explain[2]);
    $('textarea[name="specific_audit_trails_explain"]').val(number_specific_explain[3]);
    $('textarea[name="specific_privacy_security_awareness_explain"]').val(number_specific_explain[4]);
    $('textarea[name="specific_where_incident_occurs_explain"]').val(number_specific_explain[5]);

    // if else เเบบ one line  
    number_specific[0] === "2" || number_specific[0] === "0" ? specific_access_control[1].checked = true : specific_access_control[0].checked = true;
    number_specific[1] === "2" || number_specific[1] === "0" ? specific_user_access_management[1].checked = true : specific_user_access_management[0].checked = true;
    number_specific[2] === "2" || number_specific[2] === "0" ? specific_user_responsibilitites[1].checked = true : specific_user_responsibilitites[0].checked = true;
    number_specific[3] === "2" || number_specific[3] === "0" ? specific_audit_trails[1].checked = true : specific_audit_trails[0].checked = true;
    number_specific[4] === "2" || number_specific[4] === "0" ? specific_privacy_security_awareness[1].checked = true : specific_privacy_security_awareness[0].checked = true;
    number_specific[5] === "2" || number_specific[5] === "0" ? specific_where_incident_occurs[1].checked = true : specific_where_incident_occurs[0].checked = true;


    let process = new_process[0];
    let event_process_id = data.getAttribute("event_process_id");
    let event_process = "";
    for (let i = 0; i < process.length; i++) {
        if (event_process_id == process[i].event_process_id) {
            event_process += `<option selected value="${process[i].event_process_id}">${process[i].event_process_name}</option>`;
        } else {
            event_process += `<option value="${process[i].event_process_id}">${process[i].event_process_name}</option>`;
        }
    }
    document.getElementById("process").innerHTML = event_process;

    let policys = policy[0];
    let doc_select = "";
    let doc_id = data.getAttribute("doc_id").split(",");
    for (let i = 0; i < policys.length; i++) {
        for (let j = 0; j < doc_id.length; j++) {
            if (policys[i].doc_id == doc_id[j]) {
                doc_select += `<option selected value="${policys[i].doc_id}">${policys[i].doc_name}</option>`;
            }
        }
        doc_select += `<option value="${policys[i].doc_id}">${policys[i].doc_name}</option>`;
    }
    document.getElementById("selecte_type_policy").innerHTML = doc_select;
    document.getElementById("submit").setAttribute("onclick", `submit_edite(this,${id},${data.getAttribute("pattern_specific_id")})`);
}

// func บันทึกการ เเก้ไขมาตราการ
function submit_edite(data, id, pattern_specific_id) {
    if (data_new.length > 0) {
        for (let i = 0; i < data_new.length; i++) {  // ลบตำเเหน่งข้อมูลเก่าออก
            if (String(data_new[i].id_specific) == String(id)) {
                data_new.splice(data_new.indexOf(data_new[i]), 1);
            }
        }
    }
    let event_process = document.getElementById("process");
    var id_event_proccess = event_process.value;
    var event_process_name = event_process.options[event_process.selectedIndex].text;
    let section_name = document.querySelectorAll('input[name$="measures_section_name"]')[0].value;
    let measures_date_count = document.querySelectorAll('input[name$="measures_date_count"]')[0].value;
    let measures_date = document.querySelectorAll('input[name$="measures_date"]')[0].value;

    //  หาค่า value จาก mutiple select  
    let measures_supervisor = []
    let select = document.querySelectorAll('select[name$="measures_supervisor"]')[0].options;
    for (let i = 0; i < select.length; i++) {
        select[i].selected == true && measures_supervisor.push(select[i].value)
    }
    let measures_detail = document.querySelectorAll('textarea[name$="measures_detail"]')[0].value;
    let doc_id = document.getElementById("selecte_type_policy");
    let new_doc_id = [];
    for (let i = 0; i < doc_id.length; i++) {
        if (doc_id[i].selected == true) {
            new_doc_id.push(doc_id[i].value);
        }
    }


    let td = document.getElementById(`${id}`).getElementsByTagName("td");
    td[2].innerHTML = event_process_name;
    td[3].innerHTML = section_name;

    let tag_a = td[0].getElementsByTagName("a");
    tag_a[0].setAttribute("doc_id", new_doc_id);
    tag_a[0].setAttribute("event_process_id", id_event_proccess);
    tag_a[0].setAttribute("measures_detail", measures_detail);
    tag_a[0].setAttribute("measures_supervisor", measures_supervisor.toString());
    tag_a[0].setAttribute("date", measures_date);
    tag_a[0].setAttribute("date_count", measures_date_count);

    let specific_access_control = 0;
    $("input:radio[name=specific_access_control]:checked").each(function () {
        specific_access_control = $(this).val();
        if ($(this).val() == 1) {
            td[4].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
        } else {
            td[4].innerHTML = `<i class="ti-close text-danger"></i>`;
        }
    });
    let specific_user_access_management = 0;
    $("input:radio[name=specific_user_access_management]:checked").each(
        function () {
            specific_user_access_management = $(this).val();
            if ($(this).val() == 1) {
                td[5].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
            } else {
                td[5].innerHTML = `<i class="ti-close text-danger"></i>`;
            }
        });
    let specific_user_responsibilitites = 0;
    $("input:radio[name=specific_user_responsibilitites]:checked").each(
        function () {
            specific_user_responsibilitites = $(this).val();
            if ($(this).val() == 1) {
                td[6].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
            } else {
                td[6].innerHTML = `<i class="ti-close text-danger"></i>`;
            }
        });
    let specific_audit_trails = 0;
    $("input:radio[name=specific_audit_trails]:checked").each(function () {
        specific_audit_trails = $(this).val();
        if ($(this).val() == 1) {
            td[7].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
        } else {
            td[7].innerHTML = `<i class="ti-close text-danger"></i>`;
        }
    });
    let specific_privacy_security_awareness = 0;
    $("input:radio[name=specific_privacy_security_awareness]:checked").each(
        function () {
            specific_privacy_security_awareness = $(this).val();
            if ($(this).val() == 1) {
                td[8].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
            } else {
                td[8].innerHTML = `<i class="ti-close text-danger"></i>`;
            }
        });
    let specific_where_incident_occurs = 0;
    $("input:radio[name=specific_where_incident_occurs]:checked").each(function () {
        specific_where_incident_occurs = $(this).val();
        if ($(this).val() == 1) {
            td[9].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
        } else {
            td[9].innerHTML = `<i class="ti-close text-danger"></i>`;
        }
    });
    //  add class in td
    let value_checkbox = [
        specific_access_control,
        specific_user_access_management,
        specific_user_responsibilitites,
        specific_audit_trails,
        specific_privacy_security_awareness,
        specific_where_incident_occurs
    ]
    td[1].setAttribute('class', value_checkbox)

    let explain_all = [];
    explain_all.push(document.querySelectorAll('textarea[name$="specific_access_control_explain"]')[0].value);
    explain_all.push(document.querySelectorAll('textarea[name$="specific_user_access_management_explain"]')[0].value);
    explain_all.push(document.querySelectorAll('textarea[name$="specific_user_responsibilitites_explain"]')[0].value);
    explain_all.push(document.querySelectorAll('textarea[name$="specific_audit_trails_explain"]')[0].value);
    explain_all.push(document.querySelectorAll('textarea[name$="specific_privacy_security_awareness_explain"]')[0].value);
    explain_all.push(document.querySelectorAll('textarea[name$="specific_where_incident_occurs_explain"]')[0].value);
    td[2].setAttribute("class", explain_all);

    data_new.push({
        id_specific: id,
        pattern_specific_id: pattern_specific_id,
        doc_id: new_doc_id,
        specific_access_control,
        specific_user_access_management,
        specific_user_responsibilitites,
        specific_audit_trails,
        specific_privacy_security_awareness,
        specific_where_incident_occurs,
        section_name: section_name,
        measures_date_count: measures_date_count,
        measures_date: measures_date,
        measures_supervisor: measures_supervisor,
        measures_detail: measures_detail,
        event_process_name: event_process_name,
        id_event_proccess: id_event_proccess,
        specific_access_control_explain: document.querySelectorAll('textarea[name$="specific_access_control_explain"]')[0].value,
        specific_user_access_management_explain: document.querySelectorAll('textarea[name$="specific_user_access_management_explain"]')[0].value,
        specific_user_responsibilitites_explain: document.querySelectorAll('textarea[name$="specific_user_responsibilitites_explain"]')[0].value,
        specific_audit_trails_explain: document.querySelectorAll('textarea[name$="specific_audit_trails_explain"]')[0].value,
        specific_privacy_security_awareness_explain: document.querySelectorAll('textarea[name$="specific_privacy_security_awareness_explain"]')[0].value,
        specific_where_incident_occurs_explain: document.querySelectorAll('textarea[name$="specific_where_incident_occurs_explain"]')[0].value,
    });
    console.log("data_new หลังจาก เเก้ไขเเล้ว", data_new);

}


function modalSpecific() {
    let PaaternID = document.getElementById('pattern_specific_id').value
    let evenProcessID = document.getElementById('event_process_id').value
    $.post('/classification/fetch/specific', { PaaternID: PaaternID, evenProcessID: evenProcessID }).done(async function (result) {
        if (result == "ไม่มีข้อมูล") {
            $("#table-select-measures").empty().append(`
                        <tr><td colspan="20" class="text-center" style="border: none;"><b class="text-danger">ไม่พบข้อมูล</b></td></tr>`
            );
        } else {
            console.log("===============================================", result);
            await create_choose_measures_specific(result);
        }
    });
}

function modalSpecificEdit() {
    let IDclasscifi = document.getElementById('c_edit').getAttribute('data-mark')
    let IDproccess = $('input[name="event_process_id"]').val()
    let IDpattern = $('input[name="pattern_id"]').val()

    $.post('/classification/fetch/specific/edit', { IDclasscifi, IDproccess, IDpattern }).done(async function (result) {
        // if (result == "ไม่มีข้อมูล") {
        //     $("#table-select-measures").empty().append(`
        //                 <tr><td colspan="20" class="text-center" style="border: none;"><b class="text-danger">ไม่พบข้อมูล</b></td></tr>`
        //     );
        // } else {
        console.log("result", result);
        await create_choose_measures_specific_edit(result);
        // }
    });
}


// func สรา้ง modal มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPA กำหนด (PDPA Specific Measures)  
async function create_choose_measures_specific(data) {
    $("#table-select-measures").empty();
    data = data.map((item, index) => { return { ...item, no: index + 1 }; })
    var state = {
        querySet: data,
        page: 1,
        rows: 30, // จำนวน row
        window: 10000, // จำนวนหน้าที่เเสดง
    };

    buildTable();
    function pagination(querySet, page, rows) {
        var trimStart = (page - 1) * rows;
        var trimEnd = trimStart + rows;
        var trimmedData = querySet.slice(trimStart, trimEnd);
        var pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
        return {
            querySet: trimmedData,
            pages: pages,
        };
    }

    function pageButtons(pages) {
        // var wrapper = document.getElementById('pagination-wrapper')
        var wrapper = document.querySelector(".pagination-choose");
        wrapper.innerHTML = ``;
        var maxLeft = state.page - Math.floor(state.window / 2);
        var maxRight = state.page + Math.floor(state.window / 2);

        if (maxLeft < 1) {
            maxLeft = 1;
            maxRight = state.window;
        }
        if (maxRight > pages) {
            maxLeft = pages - (state.window - 1);
            if (maxLeft < 1) {
                maxLeft = 1;
            }
            maxRight = pages;
        }

        // เช็คหน้าเเรก (ปุ่มย้อนกลับ)
        // var num = 1
        if (maxRight > 5) {
            if (state.page > maxRight / 2) {
                if (state.page + 1 > maxRight / 2) {
                    wrapper.innerHTML +=
                        '<li class="page-item"><button class="page page-link" value=1>1</button></li>';
                    wrapper.innerHTML +=
                        '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
                }
            }
            for (var page = maxLeft; page <= maxRight; page++) {
                if (page >= state.page - 2 && page <= state.page + 2) {
                    if (page == state.page) {
                        wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`;
                    } else {
                        wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`;
                    }
                }
            }
            if (state.page <= maxRight / 2) {
                mp = maxRight - 1;
                wrapper.innerHTML +=
                    '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
                wrapper.innerHTML +=
                    '<li class="page-item "><button class="page page-link" value=' +
                    maxRight +
                    ">" +
                    maxRight +
                    "</button></li>";
            }
        } else {
            for (var page = maxLeft; page <= maxRight; page++) {
                if (state.page == page) {
                    wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`;
                } else {
                    wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`;
                }
            }
        }

        if (state.page == 1) {
            wrapper.innerHTML =
                `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` +
                wrapper.innerHTML;
        } else {
            wrapper.innerHTML =
                `<li value=${state.page - 1
                } class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` +
                wrapper.innerHTML;
        }

        // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
        if (state.page == pages) {
            wrapper.innerHTML += `<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>`;
        } else {
            wrapper.innerHTML += `<li value=${state.page + 1
                } class="page page-item"><button class="page-link">ถัดไป</button></li>`;
        }

        $(".page").on("click", function () {
            $("#table-select-measures").empty();
            state.page = Number($(this).val());
            buildTable();
        });
    }

    function buildTable() {
        var table = $("#table-select-measures");
        var data = pagination(state.querySet, state.page, state.rows);
        var myList = data.querySet;
        var show = [];
        for (var i in myList) {
            let policys = policy[0];
            if (data_new.length > 0) {
                // หาข้อมูลที่เเก้ไขเเล้วเพื่อมาสร้าง ตารางตัวเลือกให้ข้อมูลเหมือนที่เเก้ไข
                let map1 = data_new.findIndex((x) => x.specific_id == myList[i].specific_id);
                if (map1 > -1) {
                    myList[i].pattern_measures_section_name = data_new[map1].section_name;
                    myList[i].event_process_name = data_new[map1].event_process_name;
                }
            }
            let array_doc_id = myList[i].pattern_specific_doc_id.split(",");
            let doc_name = "";
            for (let i = 0; i < policys.length; i++) {
                if (array_doc_id.indexOf(String(policys[i].doc_id)) > -1) {
                    doc_name += policys[i].doc_name + "<br>";
                }
            }
            let input_checkbox = `<input class="form-check-input success check-outline outline-success checkbox_Choose_Specific"  id="${myList[i].specific_id}" type="checkbox" onclick="Choose_Specific(this)" >`;
            if (data_set_found.indexOf(myList[i].specific_id) > -1) {
                input_checkbox = `<input class="form-check-input success check-outline outline-success checkbox_Choose_Specific"  id="${myList[i].specific_id}" type="checkbox" onclick="Choose_Specific(this)" checked>`;
            }

            var row = `<tr>
                        <td>
                        ${input_checkbox}
                        </td>
                        <td>${myList[i].no}</td>
                        <td>${myList[i].event_process_name}</td>           
                        <td>${myList[i].pattern_measures_section_name}</td>
                        <td>${doc_name}</td>
                        <td><a class="text-info" target="_blank"  href="/Specific-Measures/details/${myList[i].id_specific}"><i class=" fas fa-file-alt fa-2x"></i></a></td>
                        </tr> `;
            table.append(row);
            show.push(myList[i].no);
        }
        document.querySelector("#show-Specific-Measures-choose").innerHTML = show[0]; //  แสดงถึง row เเรกของหน้า
        document.querySelector("#to-show-Specific-Measures-choose").innerHTML = show[show.length - 1]; //  แสดงถึง row สุดท้ายของหน้า
        document.querySelector("#show-all-Specific-Measures-choose").innerHTML = state.querySet.length; //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
        pageButtons(data.pages);
    }
}

// func สรา้ง modal มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPA กำหนด (PDPA Specific Measures)  หน้า เเก้ไข classifi
async function create_choose_measures_specific_edit(data) {
    $("#table-select-measures").empty();
    data = data.map((item, index) => { return { ...item, no: index + 1 }; })
    var state = {
        querySet: data,
        page: 1,
        rows: 30, // จำนวน row
        window: 10000, // จำนวนหน้าที่เเสดง
    };

    buildTable();
    function pagination(querySet, page, rows) {
        var trimStart = (page - 1) * rows;
        var trimEnd = trimStart + rows;
        var trimmedData = querySet.slice(trimStart, trimEnd);
        var pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
        return {
            querySet: trimmedData,
            pages: pages,
        };
    }

    function pageButtons(pages) {
        // var wrapper = document.getElementById('pagination-wrapper')
        var wrapper = document.querySelector(".pagination-choose");
        wrapper.innerHTML = ``;
        var maxLeft = state.page - Math.floor(state.window / 2);
        var maxRight = state.page + Math.floor(state.window / 2);

        if (maxLeft < 1) {
            maxLeft = 1;
            maxRight = state.window;
        }
        if (maxRight > pages) {
            maxLeft = pages - (state.window - 1);
            if (maxLeft < 1) {
                maxLeft = 1;
            }
            maxRight = pages;
        }

        // เช็คหน้าเเรก (ปุ่มย้อนกลับ)
        // var num = 1
        if (maxRight > 5) {
            if (state.page > maxRight / 2) {
                if (state.page + 1 > maxRight / 2) {
                    wrapper.innerHTML +=
                        '<li class="page-item"><button class="page page-link" value=1>1</button></li>';
                    wrapper.innerHTML +=
                        '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
                }
            }
            for (var page = maxLeft; page <= maxRight; page++) {
                if (page >= state.page - 2 && page <= state.page + 2) {
                    if (page == state.page) {
                        wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`;
                    } else {
                        wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`;
                    }
                }
            }
            if (state.page <= maxRight / 2) {
                mp = maxRight - 1;
                wrapper.innerHTML +=
                    '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
                wrapper.innerHTML +=
                    '<li class="page-item "><button class="page page-link" value=' +
                    maxRight +
                    ">" +
                    maxRight +
                    "</button></li>";
            }
        } else {
            for (var page = maxLeft; page <= maxRight; page++) {
                if (state.page == page) {
                    wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`;
                } else {
                    wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`;
                }
            }
        }

        if (state.page == 1) {
            wrapper.innerHTML =
                `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` +
                wrapper.innerHTML;
        } else {
            wrapper.innerHTML =
                `<li value=${state.page - 1
                } class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` +
                wrapper.innerHTML;
        }

        // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
        if (state.page == pages) {
            wrapper.innerHTML += `<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>`;
        } else {
            wrapper.innerHTML += `<li value=${state.page + 1
                } class="page page-item"><button class="page-link">ถัดไป</button></li>`;
        }

        $(".page").on("click", function () {
            $("#table-select-measures").empty();
            state.page = Number($(this).val());
            buildTable();
        });
    }

    function buildTable() {
        var table = $("#table-select-measures");
        var data = pagination(state.querySet, state.page, state.rows);
        var myList = data.querySet;
        var show = [];
        for (var i in myList) {
            let policys = policy[0];
            if (data_new.length > 0) {
                // หาข้อมูลที่เเก้ไขเเล้วเพื่อมาสร้าง ตารางตัวเลือกให้ข้อมูลเหมือนที่เเก้ไข
                let map1 = data_new.findIndex((x) => x.specific_id == myList[i].specific_id);
                if (map1 > -1) {
                    myList[i].pattern_measures_section_name = data_new[map1].section_name;
                    myList[i].event_process_name = data_new[map1].event_process_name;
                }
            }
            let array_doc_id = myList[i].pattern_specific_doc_id.split(",");
            let doc_name = "";
            for (let i = 0; i < policys.length; i++) {
                if (array_doc_id.indexOf(String(policys[i].doc_id)) > -1) {
                    doc_name += policys[i].doc_name + "<br>";
                }
            }
            let input_checkbox = `<input class="form-check-input success check-outline outline-success checkbox_Choose_Specific"  id="${myList[i].specific_id}" type="checkbox" onclick="Choose_Specific_Edit(this)" >`;
            if (data_set_found.indexOf(myList[i].specific_id) > -1) {
                input_checkbox = `<input class="form-check-input success check-outline outline-success checkbox_Choose_Specific"  id="${myList[i].specific_id}" type="checkbox" onclick="Choose_Specific_Edit(this)" checked>`;
            }

            var row = `<tr>
                        <td>
                        ${input_checkbox}
                        </td>
                        <td>${myList[i].no}</td>
                        <td>${myList[i].event_process_name}</td>           
                        <td>${myList[i].pattern_measures_section_name}</td>
                        <td>${doc_name}</td>
                        <td><a class="text-info" target="_blank"  href="/Specific-Measures/details/${myList[i].id_specific}"><i class=" fas fa-file-alt fa-2x"></i></a></td>
                        </tr> `;
            table.append(row);
            show.push(myList[i].no);
        }
        document.querySelector("#show-Specific-Measures-choose").innerHTML = show[0]; //  แสดงถึง row เเรกของหน้า
        document.querySelector("#to-show-Specific-Measures-choose").innerHTML = show[show.length - 1]; //  แสดงถึง row สุดท้ายของหน้า
        document.querySelector("#show-all-Specific-Measures-choose").innerHTML = state.querySet.length; //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
        pageButtons(data.pages);
    }
}

// func checkbox มาตราการ เลือก-ไม่เลือก มาตราการ  
async function Choose_Specific(data) {
    let checkbox = $(".checkbox_Choose_Specific");
    //   ข้อมูล มาตราการที่เลือก checkbox
    let id_specific = [];
    for (let i = 0; i < checkbox.length; i++) {
        if (checkbox[i].checked == true) {
            id_specific.push(checkbox[i].getAttribute("id"));
        }
    }
    // เช็คข้อมูลที่ เเก้ไขเเล้ว
    let array_data_new = [];
    if (data_new.length > 0) {
        for (let i = 0; i < data_new.length; i++) {
            if (id_specific.indexOf(String(data_new[i].id_specific)) > -1) {
                array_data_new.push(data_new[i]);
            }
        }
    }

    data_new = [];
    data_new.push(...array_data_new);
    let dataQuery = {
        id_specific: id_specific,
        pattern_specific_id: document.getElementById('pattern_specific_id').value
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        url: "/classification/fetch/specific/search",
        data: JSON.stringify(dataQuery),
        dataType: "json",
        success: async function (result) {
            createPatternSpecific(result)
        },
        error: function (e) {
            console.log(e);
        },
    });
}

// func checkbox มาตราการ เลือก-ไม่เลือก มาตราการ   หน้าเเก้ไข classifi
async function Choose_Specific_Edit(data) {
    let checkbox = $(".checkbox_Choose_Specific");
    //   ข้อมูล มาตราการที่เลือก checkbox
    let id_specific = [];
    for (let i = 0; i < checkbox.length; i++) {
        if (checkbox[i].checked == true) {
            id_specific.push(checkbox[i].getAttribute("id"));
        }
    }
    // เช็คข้อมูลที่ เเก้ไขเเล้ว
    let array_data_new = [];
    if (data_new.length > 0) {
        for (let i = 0; i < data_new.length; i++) {
            if (id_specific.indexOf(String(data_new[i].id_specific)) > -1) {
                array_data_new.push(data_new[i]);
            }
        }
    }

    data_new = [];
    data_new.push(...array_data_new);
    let dataQuery = {
        id_specific: id_specific,
        IDclasscifi: document.getElementById('c_edit').getAttribute("data-mark"),
        IDpattern: $('input[name="pattern_id"]').val(),
        IDproccess: $('input[name="event_process_id"]').val()

    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        url: "/classification/fetch/specific/search/edit",
        data: JSON.stringify(dataQuery),
        dataType: "json",
        success: async function (result) {
            createPatternSpecific(result)
        },
        error: function (e) {
            console.log(e);
        },
    });


}


function form_add_classify_submit(data) {

    console.log("data_new enddddddddd", data_new);
    console.log("data_set_found enddddddddd", data_set_found);
    if (data_new.length > 0) {
        document.getElementById("specificEite").value = JSON.stringify(data_new);
    }
    document.getElementById("chooseSpecific").value = data_set_found.toString();


    if (data == 'edit') {
        $('#form_edit_classify').submit();
    } else {
        if ($('input[name="pattern_id"]').val() == '') {
            $('#select_pattern').focus();
            $('#select_pattern').addClass('highlighted');
            setTimeout(function () {
                $('#select_pattern').removeClass('highlighted');
            }, 1500);
        } else if ($('input[name="event_process_id"]').val() == '') {
            $('a[href="#select-event-process"]').focus();
            $('a[href="#select-event-process"]').addClass('highlighted');
            setTimeout(function () {
                $('a[href="#select-event-process"]').removeClass('highlighted');
            }, 1500);
        } else if ($('input[name="classify_period_process"]').val() == '') {
            $('input[name="classify_period_process"]').focus();
            $('input[name="classify_period_process"]').addClass('highlighted');
            setTimeout(function () {
                $('input[name="classify_period_process"]').removeClass('highlighted');
            }, 1500);
        } else if ($('input[name="classify_period_end"]').val() == '') {
            $('input[name="classify_period_end"]').focus();
            $('input[name="classify_period_end"]').addClass('highlighted');
            setTimeout(function () {
                $('input[name="classify_period_end"]').removeClass('highlighted');
            }, 1500);
        } else if ($('input[name="classify_user_access_info_process_inside"]').val() == '') {
            $('input[name="classify_user_access_info_process_inside"]').focus();
            $('input[name="classify_user_access_info_process_inside"]').addClass('highlighted');
            setTimeout(function () {
                $('input[name="classify_user_access_info_process_inside"]').removeClass('highlighted');
            }, 1500);
        } else if ($('input[name="classify_user_access_info_process_outside"]').val() == '') {
            $('input[name="classify_user_access_info_process_outside"]').focus();
            $('input[name="classify_user_access_info_process_outside"]').addClass('highlighted');
            setTimeout(function () {
                $('input[name="classify_user_access_info_process_outside"]').removeClass('highlighted');
            }, 1500);
        } else {
            $('#form_add_classify').submit();
        }
    }


    //   ปิดใว้ก่อนเพราะระบบตอนนี้ไม่ให้กรอกข้อมูลในส่วนนี้
    // else if ($('input[name="classify_protect_data_limit_process"]').val() == '') {
    //     $('input[name="classify_protect_data_limit_process"]').focus();
    //     $('input[name="classify_protect_data_limit_process"]').addClass('highlighted');
    //     setTimeout(function () {
    //         $('input[name="classify_protect_data_limit_process"]').removeClass('highlighted');
    //     }, 1500);
    // }
}

