// Sidebar
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

// console.log("1111111111111111111111");
// //  ค้นหา มาตราการ ใน classifi 
// $.post('/classification/fetch/specific/edit', {
//     IDclassifi: now_id,
// }).done(function (result) {
//     console.log("xxxxxxxxxxx", result);
//     createClassifiSpecific(result)
// })

$.post('/classification/selectUsed', { value: "@lltr@Se1ectUsedCl@ssify", id: now_id }).done(function (result) {
    // console.log("wwwwwwwwwwwwwwwwwwwwwwwwwww", result);
    if ($('input[name="pattern_id"]').val() != null || $('input[name="pattern_id"]').val() != "") {
        $.post('/pattern/select-pattern', { value: "@lltr@Se1ectP@ttern", id: $('input[name="pattern_id"]').val(), id_classify: now_id }).done(function (result) {
            // console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii", result);
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
                console.log("c_edit add_pattern", $(this).attr('data-value'));
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
                    // console.log("specific", result.specific);

                    // console.log("specific_classification", result.specific_classification);
                    // if (result.specific != 'ไม่มีข้อมูล') {
                    //     $('#tbody-specific').empty()
                    //     Data_Table_Specific(result.specific, result.process, result.doc, result.specific_classification, result.pattern)
                    // } else {
                    //     data_null_specific()
                    // }

                    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", result);
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
                document.getElementById('hr_specific_measures').style.display = 'none'

                let selected = $(this).attr('data-value')
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
                console.log('_________________________ edit __________________________________', $(this).attr('data-value'));
                $.post('/event_process/get', {
                    value: "@lltr@Cl@ssific@iti0nGetEventPr@cess",
                    id: $(this).attr('data-value'),
                    id_classify: now_id
                }).done(function (result) {
                    console.log("edit__________________________result", result);
                    $('input[name="event_process_id"]').val(result.event[0].event_process_id)
                    $('input[name="classify_name_part2"]').val(result.event[0].event_process_name)
                    $('div#select-event-process').modal('hide')
                    $('#table-body-event-add').empty()
                    buildTable()
                    // get_measures(result.event[0].event_process_id, result)
                })
            })

            $('a#_del_event').on('click', function () {
                $('input[name="event_process_id"]').val(null)
                $('input[name="classify_name_part2"]').val(null)
                $('#table-body-event-add').empty()
                buildTable()
            })
        }
    })
})

function ready_edit() {
    console.log("ffffffffffffffffff");
    $.post('/event_process/get', {
        value: "@lltr@Cl@ssific@iti0nGetEventPr@cess",
        id: $('input[name="event_process_id"]').val(),
        id_classify: document.getElementById('c_edit').getAttribute('data-mark')
    }).done(function (result) {
        console.log("edit__________________________result", result);
        // $('input[name="event_process_id"]').val(result.event[0].event_process_id)
        // $('input[name="classify_name_part2"]').val(result.event[0].event_process_name)
        // $('div#select-event-process').modal('hide')
        // $('#table-body-event-add').empty()
        // buildTable()
        // get_measures(result.event[0].event_process_id, result)
    })
}
ready_edit()
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