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

// ================================== Equal Set =================================
function eqSet(s1, s2) {
    if (s1.size !== s2.size) return false
    for (var i of s1) if (!s2.has(i)) return false
    return true
}

// ================================== Check Tag =================================
function checkTag(all, name, index) {
    if (all[index] == name) {
        return true
    } else if (index == all.length) {
        return false
    } else {
        return checkTag(all, name, (index + 1))
    }
}

// ================================= Check Users ================================
function checkUser(all, name, index) {
    if (all[index] == name) {
        return true
    } else if (index == all.length) {
        return false
    } else {
        return checkUser(all, name, (index + 1))
    }
}

// ================================= API on pages ===============================
if (document.getElementById('index')) {
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
    // ======================== Convert Bytes to GB =================================
    var convert_gb = parseInt($('#diskSpace').text()) * (10 ** (-9))
    $('#diskSpace').text(convert_gb.toFixed(0))
    // ========================= NOTE SET STATE ROWS PAGINATION =====================
    // rows must have all data or rows not less all data divide 2 CAN NOT divide 3
    // =============================== Table Pattern ================================
    $.ajax({
        url: "/pattern",
        method: "POST",
        data: { value: 1 },
        success: function (result) {
            let text = ""
            if (result.limit.pattern === -1 || result.pattern.length < result.limit.pattern) {
                // text = `
                // <a href="/pattern/new" class='btn btn-success'>
                //                         <i class="fas fa-plus"></i>
                //                         เพิ่มรูปแบบข้อมูล
                //                     </a>
                // `
            } else {
                text = `
                <button class='btn btn-success' disabled>
                <i class="fas fa-plus"></i>
                เพิ่มรูปแบบข้อมูล
                 </button>
                `
            }
            // document.getElementById('limit').innerHTML = text
            if (result.pattern.length == 0) {
                // var table = $('#table-body')
                // var row = '<tr class="odd"><td valign="top" colspan="11" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                // table.append(row)
                // $('#start-1').text(0)
                // $('#end').text(0)
                // $('#total').text(0)
            } else {
                // ============================== Create Prepare ============================
                var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

                var state = {
                    'querySet': result.pattern,
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
                    document.getElementById('start-1').innerHTML = start_count

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
                    for (y in myList) {
                        if (myList[y].pattern_id != "" && state.page == 1) {
                            var check = '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" style="width:110px"><b class="tablesaw-cell-label">ลบรูปแบบ</b> <span class="tablesaw-cell-content"><a id="' + result.id_pattern[y].pattern_id + '" onClick="del(this.id)" href="#delete_pattern" class="text-danger" data-bs-toggle="modal"><i class="fas fa-trash-alt fa-2x"></i></a></span></td>'
                            var device = ""
                            var agent = ""
                            var database_out = ""
                            if (myList[y].pattern_storage_method_outside == 1) {
                                if (myList[y].pattern_storage_method_outside_device == 1) {
                                    device = myList[y].pattern_storage_method_outside_device_name
                                } else {
                                    device = "<span style='color:red;'>ไม่มี</span>"
                                }
                                if (myList[y].pattern_storage_method_outside_agent == 1) {
                                    agent = myList[y].pattern_storage_method_outside_agent_name
                                } else {
                                    agent = "<span style='color:red;'>ไม่มี</span>"
                                }
                                if (myList[y].pattern_storage_method_outside_database_outside == 1) {
                                    database_out = myList[y].pattern_storage_method_outside_database_outside_name
                                } else {
                                    database_out = "<span style='color:red;'>ไม่มี</span>"
                                }
                            }
                            //Keep in mind we are using "Template Litterals to create rows"
                            var row = '<tr>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                '</b> <span class="tablesaw-cell-content">' + myList[y].pattern_id + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ชื่อรูปแบบ</b> <span class="tablesaw-cell-content">' + myList[y].pattern_name + ' </span></td>' +
                                // '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" style="width:250px"><b class="tablesaw-cell-label">ข้อมูลที่ใช้</b> <span class="tablesaw-cell-content">' + String(result.data_name_total).replaceAll(',', ", ") + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" style="width:250px"><b class="tablesaw-cell-label">ข้อมูลที่ใช้</b> <span class="tablesaw-cell-content">' + String(result.pattern_data[y]).replaceAll(',', ", ") + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">วันที่สร้าง</b> <span class="tablesaw-cell-content">' + convert_datetime(new Date(myList[y].pattern_create)) + '</span></td>' +
                                // '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">วันที่ใช้</b> <span class="tablesaw-cell-content">' + convert_date(new Date(myList[y].pattern_start_date)) + '</span></td>' +
                                // '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">วันที่สิ้นสุด</b> <span class="tablesaw-cell-content">' + convert_date(new Date(date_diff(myList[y].pattern_start_date, myList[y].pattern_total_date))) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ผู้สร้าง</b> <span class="tablesaw-cell-content">' + myList[y].firstname + " " + myList[y].lastname + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">อุปกรณ์/Agent</b> <span class="tablesaw-cell-content"> ' + result.pattern_storage_method_inside_import_id[y] + " / " + result.pattern_storage_method_inside_agent_name[y] + " / " + result.pattern_storage_method_outside_name[y] + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" style="width:110px"><b class="tablesaw-cell-label">ดูรูปแบบ</b> <span class="tablesaw-cell-content"><a href="/pattern/detail' + result.id_pattern[y].pattern_id + '" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" style="widht:110px"><b class="tablesaw-cell-label">แก้ไขรูปแบบ</b><span class="tablesaw-cell-content"><a href="/pattern/edit' + result.id_pattern[y].pattern_id + '" class="text-warning"><i class="fas fa-pencil-alt fa-2x"></i></a></td>' +
                                check +
                                '</tr>'
                            table.append(row)
                            end_count = myList[y].pattern_id
                        } else if (myList[y].pattern_id != "" && state.page > 1) {
                            var check = '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" style="width:110px"><b class="tablesaw-cell-label">ลบรูปแบบ</b> <span class="tablesaw-cell-content"><a id="' + result.id_pattern[parseInt(state.rows) + parseInt(y)].pattern_id + '" onClick="del(this.id)" href="#delete_pattern" class="text-danger" data-bs-toggle="modal"><i class="fas fa-trash-alt fa-2x"></i></a></span></td>'
                            var device = ""
                            var agent = ""
                            var database_out = ""
                            if (myList[y].pattern_storage_method_outside == 1) {
                                if (myList[y].pattern_storage_method_outside_device == 1) {
                                    device = myList[y].pattern_storage_method_outside_device_name
                                } else {
                                    device = "<span style='color:red;'>ไม่มี</span>"
                                }
                                if (myList[y].pattern_storage_method_outside_agent == 1) {
                                    agent = myList[y].pattern_storage_method_outside_agent_name
                                } else {
                                    agent = "<span style='color:red;'>ไม่มี</span>"
                                }
                                if (myList[y].pattern_storage_method_outside_database_outside == 1) {
                                    database_out = myList[y].pattern_storage_method_outside_database_outside_name
                                } else {
                                    database_out = "<span style='color:red;'>ไม่มี</span>"
                                }
                            }
                            //Keep in mind we are using "Template Litterals to create rows"
                            var row = '<tr>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ลำดับที่:' +
                                '</b> <span class="tablesaw-cell-content">' + myList[y].pattern_id + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ชื่อรูปแบบ</b> <span class="tablesaw-cell-content">' + myList[y].pattern_name + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" style="width:250px"><b class="tablesaw-cell-label">ข้อมูลที่ใช้</b> <span class="tablesaw-cell-content">' + String(result.data_name_total).replaceAll(',', ", ") + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">วันที่สร้าง</b> <span class="tablesaw-cell-content">' + convert_datetime(new Date(myList[y].pattern_create)) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">วันที่ใช้</b> <span class="tablesaw-cell-content">' + convert_date(new Date(myList[y].pattern_start_date)) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">วันที่สิ้นสุด</b> <span class="tablesaw-cell-content">' + convert_date(new Date(date_diff(myList[y].pattern_start_date, myList[y].pattern_total_date))) + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ผู้สร้าง</b> <span class="tablesaw-cell-content">' + myList[y].firstname + " " + myList[y].lastname + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">อุปกรณ์/Agent</b> <span class="tablesaw-cell-content">' + device + " / " + agent + " / " + database_out + '</span></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" style="width:110px"><b class="tablesaw-cell-label">ดูรูปแบบ</b> <span class="tablesaw-cell-content"><a href="/pattern/detail' + result.id_pattern[parseInt(state.rows) + parseInt(y)].pattern_id + '" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a></td>' +
                                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" style="widht:110px"><b class="tablesaw-cell-label">แก้ไขรูปแบบ</b><span class="tablesaw-cell-content"><a href="/pattern/edit' + result.id_pattern[parseInt(state.rows) + parseInt(y)].pattern_id + '" class="text-warning"><i class="fas fa-pencil-alt fa-2x"></i></a></td>' +
                                check +
                                '</tr>'
                            table.append(row)
                            end_count = myList[y].pattern_id
                        }
                    }
                    if (myList.length == 0) {
                        var row = '<tr class="odd"><td valign="top" colspan="10" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                        table.append(row)
                        $('#start-1').text(0)
                        $('#end').text(0)
                        $('#total').text(0)
                    } else {
                        if (myList[0].pattern_id != "") {
                            $('#start-1').text(myList[0].pattern_id)
                        }
                    }
                    $('#end').text(end_count)
                    pageButtons(data.pages)
                    // end_count = table.find('tr').length
                }
            }
        }
    })
    // ============================ Table Document Policy ===========================
    $.ajax({
        url: '/policy',
        method: "POST",
        data: { value: 1 },
        success: function (result) {
            // ============================== Create Prepare ============================
            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

            var state = {
                'querySet': result.policy,
                'page': 1,
                'rows': 5,
                'window': 5,
            }

            buildTable()

            function pagination(querySet, page, rows) {
                var trimStart = (page - 1) * rows
                var trimEnd = trimStart + rows

                var trimmedData = querySet.slice(trimStart, trimEnd)

                var pages = Math.ceil(querySet.length / rows);
                var start_count = 1
                document.getElementById('start-policy').innerHTML = start_count

                return {
                    'querySet': trimmedData,
                    'pages': pages,
                }

            }
            // ============================== Create Pagination ============================
            function pageButtons(pages) {
                var wrapper = document.getElementById('pagination-wapper-policy')
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
                    $('#table-body-policy').empty()
                    state.page = Number($(this).val())
                    buildTable()
                })
            }
            // ============================== Create Table ============================
            function buildTable() {
                var table = $('#table-body-policy')
                var data = pagination(state.querySet, state.page, state.rows)
                var myList = data.querySet
                for (y in myList) {
                    if (myList[y].doc_id != "" && myList[y].doc_action != 1 && myList[y].doc_status == 2 && state.page == 1) {
                        //Keep in mind we are using "Template Litterals to create rows"
                        var row = '<tr>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ลำดับที่:' +
                            '</b> <span class="tablesaw-cell-content">' + myList[y].doc_id + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-left" ><b class="tablesaw-cell-label">ชื่อเอกสาร</b> <span class="tablesaw-cell-content">' + myList[y].doc_name + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ชนิดเอกสาร</b> <span class="tablesaw-cell-content">' + myList[y].doc_type_name + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">วัน/เวลาที่สร้าง</b> <span class="tablesaw-cell-content">' + convert_datetime(new Date(myList[y].doc_date_create)) + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ผู้สร้าง</b> <span class="tablesaw-cell-content">' + myList[y].firstname + " " + myList[y].lastname + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ดูเอกสาร</b> <span class="tablesaw-cell-content"><a href="/paper/' + result.id_document[y].doc_id + '" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a></td>' +
                            '</tr>'
                        table.append(row)
                        end_count = myList[y].doc_id
                    } else if (myList[y].doc_id != "" && myList[y].doc_action != 1 && myList[y].doc_status == 2 && state.page > 1) {
                        var row = '<tr>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ลำดับที่:' +
                            '</b> <span class="tablesaw-cell-content">' + myList[y].doc_id + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-left" ><b class="tablesaw-cell-label">ชื่อเอกสาร</b> <span class="tablesaw-cell-content">' + myList[y].doc_name + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ชนิดเอกสาร</b> <span class="tablesaw-cell-content">' + myList[y].doc_type_name + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">วัน/เวลาที่สร้าง</b> <span class="tablesaw-cell-content">' + convert_datetime(new Date(myList[y].doc_date_create)) + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ผู้สร้าง</b> <span class="tablesaw-cell-content">' + myList[y].firstname + " " + myList[y].lastname + '</span></td>' +
                            '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist text-center" ><b class="tablesaw-cell-label">ดูเอกสาร</b> <span class="tablesaw-cell-content"><a href="/paper/' + result.id_document[parseInt(state.rows) + parseInt(y)].doc_id + '" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a></td>' +
                            '</tr>'
                        table.append(row)
                        end_count = myList[y].doc_id
                    }
                }
                if (myList.length == 0) {
                    var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                    table.append(row)
                    $('#total-policy').text(0)
                    $('#start-policy').text(0)
                } else {
                    if (myList[0].doc_id != "" && myList[0].doc_action != 1 && myList[0].doc_status == 2) {
                        $('#start-policy').text(myList[0].doc_id)
                    }
                    pageButtons(data.pages)
                    $('#total-policy').text(result.policy.length)
                }
                $('#end-policy').text(end_count)
                // end_count = table.find('tr').length
            }
        }
    })
    // ======================== Modal Delete Pattern ======================
    function del(id) {
        let url = '/pattern/delete' + id
        $.post('/pattern/del', { value: "P@tternDe1ete", id: id }).done(function (result) {
            $('td#p_name').text(result.pattern[0].pattern_name)
            $('td#p_data').text(result.pattern_data)
            $('td#p_create').text(convert_datetime(new Date(result.pattern[0].pattern_create)))
            // $('td#p_start').text(convert_date(new Date(result.pattern[0].pattern_start_date)))
            // $('td#p_end').text(convert_date(new Date(date_diff(result.pattern[0].pattern_start_date, result.pattern[0].pattern_total_date))))
            $('td#p_user').text(result.pattern[0].firstname + " " + result.pattern[0].lastname)
            let mixOptions, device, agent, database_out = ""
            if (result.pattern[0].pattern_storage_method_outside == 0) {
                mixOptions = "ไม่มี"
            } else {
                if (result.pattern[0].pattern_storage_method_outside_device == 0) {
                    device = "ไม่มี"
                } else {
                    device = result.pattern[0].pattern_storage_method_outside_device_name
                }
                if (result.pattern[0].pattern_storage_method_outside_agent == 0) {
                    agent = "ไม่มี"
                } else {
                    agent = result.pattern[0].pattern_storage_method_outside_agent_name
                }
                if (result.pattern[0].pattern_storage_method_outside_database_outside == 0) {
                    database_out = "ไม่มี"
                } else {
                    database_out = result.pattern[0].pattern_storage_method_outside_database_outside_name
                }
                mixOptions = device + " / " + agent + " / " + database_out
            }
            $('td#p_options').text(result.pattern_storage_method_inside_import_id + '/' + result.pattern_storage_method_inside_agent_name + '/' + result.pattern_storage_method_outside_name)
        })
        $('button#sub_del_pattern').on('click', function () {
            $('form#del_pattern').attr('action', url).submit();
        })
    }
} else if (document.getElementById('detail')) {
    var format_date = convert_date(new Date($('span#start_date').attr('data-value')))
    $('span#start_date').text(format_date)
    $('li#li_data_protect').addClass('selected')
    $('a#a_data_protect').addClass('active')
    $('ul#ul_data_protect').addClass('in')
    $('li#li_pattern').addClass('selected')
    $('a#a_pattern').addClass('active')
} else if (document.getElementById('datatype')) {
    //============================= Active Sidebar ================================
    $('#li_data_protect').last().addClass('selected')
    $('#a_data_protect').last().addClass('active')
    $('#ul_data_protect').last().addClass('in')
    $('#li_pattern').last().addClass('active')
    $('#a_pattern').last().addClass('active')
    // ================================ Chart =====================================
    $(function () {
        "use strict";
        // -----------------------------------------------------------------------
        // Total revenue chart
        // -----------------------------------------------------------------------
        var option_Total_Revenue1 = {
            series: [
                {
                    name: "2016 ",
                    data: [4, 2, 3.5, 1.5, 4, 3],
                },
            ],
            chart: {
                fontFamily: 'Rubik,sans-serif',
                height: 220,
                type: "line",
                toolbar: {
                    show: false,
                },
            },
            grid: {
                show: true,
                strokeDashArray: 3,
                borderColor: "rgba(0,0,0,0.1)",
                xaxis: {
                    lines: {
                        show: true
                    }
                },
            },
            colors: ["#009efb"],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: "smooth",
                width: 2,
                colors: ["#009efb", "#39c449"],
            },
            markers: {
                size: 3,
                strokeColors: "transparent",
                colors: ["#009efb", "#39c449"],
            },
            xaxis: {
                axisTicks: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                categories: ['0', '4', '8', '12', '16', '20', '24', '30'],
                labels: {
                    style: {
                        colors: "#a1aab2",
                    },
                },
            },
            yaxis: {
                min: 1,
                max: 5,
                tickAmount: 5,
                labels: {
                    style: {
                        colors: "#a1aab2",
                    },
                },
            },
            tooltip: {
                x: {
                    format: "dd/MM/yy HH:mm",
                },
                theme: "dark",
            },
            legend: {
                show: false,
            },
        };
        var chart_area_spline1 = new ApexCharts(document.querySelector("#total-revenue1"), option_Total_Revenue1);
        chart_area_spline1.render();

        var option_Total_Revenue2 = {
            series: [
                {
                    name: "2016 ",
                    data: [4, 2, 3.5, 1.5, 4, 3],
                },
            ],
            chart: {
                fontFamily: 'Rubik,sans-serif',
                height: 220,
                type: "line",
                toolbar: {
                    show: false,
                },
            },
            grid: {
                show: true,
                strokeDashArray: 3,
                borderColor: "rgba(0,0,0,0.1)",
                xaxis: {
                    lines: {
                        show: true
                    }
                },
            },
            colors: ["#009efb"],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: "smooth",
                width: 2,
                colors: ["#009efb", "#39c449"],
            },
            markers: {
                size: 3,
                strokeColors: "transparent",
                colors: ["#009efb", "#39c449"],
            },
            xaxis: {
                axisTicks: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                categories: ['0', '4', '8', '12', '16', '20', '24', '30'],
                labels: {
                    style: {
                        colors: "#a1aab2",
                    },
                },
            },
            yaxis: {
                min: 1,
                max: 5,
                tickAmount: 5,
                labels: {
                    style: {
                        colors: "#a1aab2",
                    },
                },
            },
            tooltip: {
                x: {
                    format: "dd/MM/yy HH:mm",
                },
                theme: "dark",
            },
            legend: {
                show: false,
            },
        };
        var chart_area_spline2 = new ApexCharts(document.querySelector("#total-revenue2"), option_Total_Revenue2);
        chart_area_spline2.render();

        var option_Total_Revenue3 = {
            series: [
                {
                    name: "2016 ",
                    data: [4, 2, 3.5, 1.5, 4, 3],
                },
            ],
            chart: {
                fontFamily: 'Rubik,sans-serif',
                height: 220,
                type: "line",
                toolbar: {
                    show: false,
                },
            },
            grid: {
                show: true,
                strokeDashArray: 3,
                borderColor: "rgba(0,0,0,0.1)",
                xaxis: {
                    lines: {
                        show: true
                    }
                },
            },
            colors: ["#009efb"],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: "smooth",
                width: 2,
                colors: ["#009efb", "#39c449"],
            },
            markers: {
                size: 3,
                strokeColors: "transparent",
                colors: ["#009efb", "#39c449"],
            },
            xaxis: {
                axisTicks: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                categories: ['0', '4', '8', '12', '16', '20', '24', '30'],
                labels: {
                    style: {
                        colors: "#a1aab2",
                    },
                },
            },
            yaxis: {
                min: 1,
                max: 5,
                tickAmount: 5,
                labels: {
                    style: {
                        colors: "#a1aab2",
                    },
                },
            },
            tooltip: {
                x: {
                    format: "dd/MM/yy HH:mm",
                },
                theme: "dark",
            },
            legend: {
                show: false,
            },
        };
        var chart_area_spline3 = new ApexCharts(document.querySelector("#total-revenue3"), option_Total_Revenue3);
        chart_area_spline3.render();
    })
    // ======================== Check Animation Button ==============================
    var totalString = $('h5.card-title.mt-3').text().split(' ')
    totalString = totalString.filter(function (str) { return /\S/.test(str); })
    totalString = totalString.filter(function (item) { return item !== '\n'; }).map(function (item) { return item.replace(/\n/g, '') })
    var count_click = [];
    for (i in totalString) {
        count_click.push({ 'name': "collapse" + totalString[i], "count": 0 })
    }
    var a_herf = $('a.font-weight-medium.d-block.w-100.px-4')
    $('a.font-weight-medium.d-block.w-100.px-4').on('click', function () {
        for (i in count_click) {
            if (count_click[i].name == $(this).attr('aria-controls')) {
                if (count_click[i].count == 0) {
                    $(this).html($(this).text() + ' <i class="ti-angle-up"></i>')
                    count_click[i].count += 1
                } else {
                    $(this).html($(this).text() + ' <i class="ti-angle-down"></i>')
                    count_click[i].count = 0
                }
            }
        }
    })
} else if (document.getElementById('disk')) {
    $('#li_data_protect').last().addClass('selected')
    $('#a_data_protect').last().addClass('active')
    $('#ul_data_protect').last().addClass('in')
    $('#li_pattern').last().addClass('active')
    $('#a_pattern').last().addClass('active')
} else if (document.getElementById('used')) {
    $('#li_data_protect').last().addClass('selected')
    $('#a_data_protect').last().addClass('active')
    $('#ul_data_protect').last().addClass('in')
    $('#li_pattern').last().addClass('active')
    $('#a_pattern').last().addClass('active')
} else if (document.getElementById('new')) {
    $('#li_data_protect').last().addClass('selected')
    $('#a_data_protect').last().addClass('active')
    $('#ul_data_protect').last().addClass('in')
    $('#li_pattern').last().addClass('active')
    $('#a_pattern').last().addClass('active')
    // ================================ Option Input ================================
    var count_click4 = 0
    var count_click5 = 0
    var count_click6 = 0
    var list_users = []
    var list_users_outside = []
    $('input:checkbox').on('click', function () {
        if ($(this).attr('id') == 'customCheck1') { // Bug Image
            if ($(this).is(':checked') == true) {
                $('span#process_inside').html(`
                    &nbsp;&nbsp;&nbsp;&nbsp;<a id="user_inside" href="#add-users" data-bs-toggle="modal" class="option-pattern" style="display: inline; vertical-align: middle;">เลือกสมาชิกในระบบ Alltra</a>
                    &nbsp;&nbsp;<span style="vertical-align: middle;">รวม</span>&nbsp;<input type="text" name="pattern_processor_inside_total" placeholder="กรุณาเลือกสมาชิก..." class="form-control" style="width: 25%; display: inline; vertical-align: middle;" readonly/> &nbsp; <span style="vertical-align: middle;">คน &nbsp;
                `)
                $('a#user_inside').on('click', function () {
                    count_click4 += 1
                    $.ajax({
                        url: "/pattern/user",
                        method: "POST",
                        data: { value: "P@tternUser" },
                        success: function (result) {
                            // ============================== Create Prepare ============================
                            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

                            var state = {
                                'querySet': result.users,
                                'page': 1,
                                'rows': 5,
                                'window': 5,
                            }
                            if (count_click4 == 1) {
                                buildTable()
                            }
                            function pagination(querySet, page, rows) {
                                var trimStart = (page - 1) * rows
                                var trimEnd = trimStart + rows

                                var trimmedData = querySet.slice(trimStart, trimEnd)

                                var pages = Math.ceil(querySet.length / rows);
                                var start_count = 1
                                document.getElementById('start-users').innerHTML = start_count

                                return {
                                    'querySet': trimmedData,
                                    'pages': pages,
                                }

                            }
                            // ============================== Create Pagination ============================
                            function pageButtons(pages) {
                                var wrapper = document.getElementById('pagination-wapper-users')
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
                                    $('#table-body-users').empty()
                                    state.page = Number($(this).val())
                                    buildTable()
                                })
                            }
                            // ============================== Create Table ============================
                            function buildTable() {
                                var table = $('#table-body-users')
                                var data = pagination(state.querySet, state.page, state.rows)
                                var myList = data.querySet
                                for (y in myList) {
                                    if (myList[y].acc_id != "") {
                                        var buttonAdd = ''
                                        var buttonDel = ''
                                        let input_name = $('input[name="pattern_processor_inside_id"]').val().split(',')
                                        if (state.page == 1) {
                                            if (checkUser(input_name, result.id_users[y].acc_id, 0) == false) {
                                                buttonAdd = '<a id="_add_users_inside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                            } else {
                                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                                buttonDel = '<a id="_del_users_inside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            }
                                        } else {
                                            if (checkUser(input_name, result.id_users[parseInt(state.rows) + parseInt(y)].acc_id, 0) == false) {
                                                buttonAdd = '<a id="_add_users_inside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                            } else {
                                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                                buttonDel = '<a id="_del_users_inside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
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
                                    var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                                    table.append(row)
                                    $('#total-users').text(0)
                                    $('#start-users').text(0)
                                } else {
                                    if (myList[0].acc_id != "") {
                                        $('#start-users').text(myList[0].acc_id)
                                    }
                                    pageButtons(data.pages)
                                    $('#total-users').text(result.users.length)
                                }
                                $('#end-users').text(end_count)
                                // end_count = table.find('tr').length

                                $('a#_add_users_inside').on('click', function () {
                                    var selected = $(this).attr('data-value')
                                    $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: selected }).done(function (result) {
                                        list_users.push({ 'id': result[0].acc_id, 'image': result[0].image })
                                        let new_list_users = new Set(list_users)
                                        list_users = [...new_list_users]
                                        $('input[name="pattern_processor_inside_total"]').val(list_users.length)
                                        $('input[name="pattern_processor_inside_id"]').val(list_users.map(e => e['id']))
                                        $('span#users_inside').empty()
                                        for (var k = 0; k < list_users.length; k++) {
                                            $('span#users_inside').append('<img class="image-users1" src="/UI/image/' + list_users[k].image + '" data-mark="' + list_users[k].id + '"/> &nbsp;')
                                        }
                                        $('#table-body-users').empty()
                                        buildTable()
                                    })
                                })
                                $('a#_del_users_inside').on('click', function () {
                                    var selected = $(this).attr('data-value')
                                    $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: selected }).done(function (result) {
                                        let new_list_users = list_users.filter(function (item) { return item.id.toString().indexOf(result[0].acc_id) })
                                        list_users = new_list_users
                                        $('input[name="pattern_processor_inside_total"]').val(list_users.length)
                                        $('input[name="pattern_processor_inside_id"]').val(list_users.map(e => e['id']))
                                        for (var k = 0; k < $('span#users_inside').children().length; k++) {
                                            if (result[0].acc_id == $('span#users_inside').children()[k].getAttribute('data-mark')) {
                                                $('span#users_inside').children()[k].remove()
                                            }
                                        }
                                        if ($('input[name="pattern_processor_inside_total"]').val() == 0) {
                                            $('span#users_inside').empty()
                                        }
                                        $('#table-body-users').empty()
                                        buildTable()
                                    })
                                })
                            }
                        }
                    })
                })
            } else {
                $('span#process_inside').empty()
                $('input[name="pattern_processor_inside_total"]').val(null)
                $('input[name="pattern_processor_inside_id"]').val(null)
                $('span#users_inside').empty()
                list_users.splice(0, list_users.length)
            }
        } else if ($(this).attr('id') == 'customCheck2') {
            if ($(this).is(':checked') == true) {
                $('span#process_outside').html(`
                    &nbsp;<a id="user_outside" href="#add-users-1" data-bs-toggle="modal" class="option-pattern">เลือกสมาชิกในระบบ Alltra</a>
                    &nbsp; รวม <input type="text" name="pattern_processor_outside_total" placeholder="กรุณาเลือกสมาชิก..." class="form-control" style="width: 25%; display: inline;" readonly /> &nbsp; คน &nbsp;
                `)
                $('a#user_outside').on('click', function () {
                    count_click5 += 1
                    $.ajax({
                        url: "/pattern/user",
                        method: "POST",
                        data: { value: "P@tternUser" },
                        success: function (result) {
                            // ============================== Create Prepare ============================
                            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

                            var state = {
                                'querySet': result.users,
                                'page': 1,
                                'rows': 5,
                                'window': 5,
                            }
                            if (count_click5 == 1) {
                                buildTable()
                            }
                            function pagination(querySet, page, rows) {
                                var trimStart = (page - 1) * rows
                                var trimEnd = trimStart + rows

                                var trimmedData = querySet.slice(trimStart, trimEnd)

                                var pages = Math.ceil(querySet.length / rows);
                                var start_count = 1
                                document.getElementById('start-users-1').innerHTML = start_count

                                return {
                                    'querySet': trimmedData,
                                    'pages': pages,
                                }

                            }
                            // ============================== Create Pagination ============================
                            function pageButtons(pages) {
                                var wrapper = document.getElementById('pagination-wapper-users-1')
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
                                    $('#table-body-users-1').empty()
                                    state.page = Number($(this).val())
                                    buildTable()
                                })
                            }
                            // ============================== Create Table ============================
                            function buildTable() {
                                var table = $('#table-body-users-1')
                                var data = pagination(state.querySet, state.page, state.rows)
                                var myList = data.querySet
                                for (y in myList) {
                                    if (myList[y].acc_id != "") {
                                        var buttonAdd = ""
                                        var buttonDel = ""
                                        let input_name_outside = $('input[name="pattern_processor_outside_id"]').val().split(',')
                                        if (state.page == 1) {
                                            if (checkUser(input_name_outside, result.id_users[y].acc_id, 0) == false) {
                                                buttonAdd = '<a id="_add_users_outside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                            } else {
                                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                                buttonDel = '<a id="_del_users_outside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            }
                                        } else {
                                            if (checkUser(input_name_outside, result.id_users[parseInt(state.rows) + parseInt(y)].acc_id, 0) == false) {
                                                buttonAdd = '<a id="_add_users_outside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                            } else {
                                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                                buttonDel = '<a id="_del_users_outside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
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
                                    var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                                    table.append(row)
                                    $('#total-users-1').text(0)
                                    $('#start-users-1').text(0)
                                } else {
                                    if (myList[0].acc_id != "") {
                                        $('#start-users-1').text(myList[0].acc_id)
                                    }
                                    pageButtons(data.pages)
                                    $('#total-users-1').text(result.users.length)
                                }
                                $('#end-users-1').text(end_count)
                                // end_count = table.find('tr').length
                                $('a#_add_users_outside').on('click', function () {
                                    var selected = $(this).attr('data-value')
                                    $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: selected }).done(function (result) {
                                        list_users_outside.push({ 'id': result[0].acc_id, 'image': result[0].image })
                                        let new_list_users_outside = new Set(list_users_outside)
                                        list_users_outside = [...new_list_users_outside]
                                        $('input[name="pattern_processor_outside_total"]').val(list_users_outside.length)
                                        $('input[name="pattern_processor_outside_id"]').val(list_users_outside.map(e => e['id']))
                                        $('span#users_outside').empty()
                                        for (var k = 0; k < list_users_outside.length; k++) {
                                            $('span#users_outside').append('<img class="image-users1" src="/UI/image/' + list_users_outside[k].image + '" data-mark="' + list_users_outside[k].id + '"/> &nbsp;')
                                        }
                                        $('#table-body-users-1').empty()
                                        buildTable()
                                    })
                                })
                                $('a#_del_users_outside').on('click', function () {
                                    var selected = $(this).attr('data-value')
                                    $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: selected }).done(function (result) {
                                        let new_list_users_outside = list_users_outside.filter(function (item) { return item.id.toString().indexOf(result[0].acc_id) })
                                        list_users_outside = new_list_users_outside
                                        $('input[name="pattern_processor_outside_total"]').val(list_users_outside.length)
                                        $('input[name="pattern_processor_outside_id"]').val(list_users_outside.map(e => e['id']))
                                        for (var k = 0; k < $('span#users_outside').children().length; k++) {
                                            if (result[0].acc_id == $('span#users_outside').children()[k].getAttribute('data-mark')) {
                                                $('span#users_outside').children()[k].remove()
                                            }
                                        }
                                        if ($('input[name="pattern_processor_outside_total"]').val() == 0) {
                                            $('span#users_outside').empty()
                                        }
                                        $('#table-body-users-1').empty()
                                        buildTable()
                                    })
                                })
                            }
                        }
                    })
                })
            } else {
                $('span#process_outside').empty()
                $('span#users_outside').empty()
                $('input[name="pattern_processor_outside_total"]').val(null)
                $('input[name="pattern_processror_outside_name"]').val(null)
                list_users_outside = []
            }
        } else if ($(this).attr('id') == 'customCheck3') {
            if ($(this).is(':checked') == true) {
                $(this).css('vertical-align', '-5px');
                $('span#total_stop_time').html(`
                &emsp;&emsp;&emsp;เมื่อหมดระยะเวลาจัดเก็บข้อมูลจะเก็บข้อมูลต่อไปอีกเป็นระยะเวลา &nbsp; <input type="number" value="" min="1" name="pattern_set_end_date_total" placeholder="กรุณาป้อนจำนวนระยะเวลา..." class="form-control" style="display: inline; width: 20%;" /> &nbsp;วัน ถือการสิ้นสุดจะเป็นการเตรียมทำลายข้อมูลและไม่มีการใช้ข้อมูลเพื่อกรประมวลผล
                `)
            } else {
                $(this).css('margin-top', '0.3%')
                $('span#total_stop_time').empty()
            }
        } else if ($(this).attr('id') == 'customCheck4') {
            if ($(this).is(':checked') == true) {
                $('label[for="customCheck4"]').css('margin-bottom', "2%");
                $('span#file_path').html(`
                <br/>&emsp;&emsp;&emsp;<input type="radio" id="customeRaido1" name="pattern_type_data_file_of_path" value='1' class="form-check-input"/>
                <label class='form-check-label h6' for='customeRaido1' stype='font-weight: bold;'>Windows</label><br/>
                &emsp;&emsp;&emsp;<input type="radio" id="customeRaido2" name="pattern_type_data_file_of_path" value="0" class="form-check-input" checked/>
                <label class='form-check-label h6' for='customeRaido2' stype='font-weight: bold;'>Linux</label>
                `)
                if (document.getElementById('customeRaido2').checked == true || document.getElementById('customeRaido1').checked == true) {
                    $('span#path').html('<input type="text" name="pattern_type_data_file_path" placeholder="กรุณาป้อนที่อยู่ไฟล์" class="form-control" style="margin-left: 10%; width: 78%;"></input>')
                }
            } else {
                $('label[for="customCheck4"]').css('margin-bottom', "0%");
                $('span#path').empty()
                $('span#file_path').empty()
            }
        } else if ($(this).attr('id') == 'customCheck5') {
            if ($(this).is(':checked') == true) {
                $('label[for="customCheck5"]').css('margin-bottom', '0%');
                $('input#customCheck4').css('margin-top', "2%")
                $('label[for="customCheck4"]').css('margin-top', '2%')
                $('span#database').html('<input type="text" name="pattern_type_data_database_name" placeholder="กรุณาป้อนDatabase.." class="form-control" style="display: inline; width: 37%; margin-left: 1%;" ></input>')
            } else {
                $('label[for="customCheck5"]').css('margin-bottom', '0%');
                $('input#customCheck4').css('margin-top', "0%")
                $('label[for="customCheck4"]').css('margin-top', '0%')
                $('span#database').empty()
            }
        } else if ($(this).attr('id') == 'customCheck7') {
            if ($(this).is(':checked') == true) {
                $(this).css('vertical-align', "-5px");
                $('input#customCheck6').css('margin-top', '2%')
                $('label[for="customCheck6"]').css('margin-top', '1.7%')
                $('span#outside_storage_method').html('<input type="text" name="pattern_storage_method_outside_name" placeholder="กรุณาป้อนภายนอก.." class="form-control" style="display: inline; width: 36.7%;" >')
                $('span#outside_option-storage_method').html(`
            <div class="">
                <p style="margin-left: 8%;">
                    <input type="checkbox" id="customCheck8" name="pattern_storage_method_outside_device" class="form-check-input" style="vertical-align: middle;">
                    <label class="form-check-label" for="customCheck8" style="vertical-align: middle;">
                        อุปกรณ์                   
                    </label>
                    &nbsp; <input type="text" name="pattern_storage_method_outside_device_name" placeholder="กรุณาเลือกอุปกรณ์.." class="form-control" style="width: 36.7%; display: inline; margin-top: 1%;" hidden/><!-- readonly --> &nbsp; 
                    <a href="#select-device" class="option-pattern" hidden>เลือกอุปกรณ์</a></span>    
                </p>
                <p style="margin-left: 8%;">
                    <input type="checkbox" id="customCheck9" name="pattern_storage_method_outside_agent" class="form-check-input" style="vertical-align: middle;">
                    <label class="form-check-label" for="customCheck9" style="vertical-align: middle;">
                        Agent &nbsp; &nbsp;  
                    </label>
                    <input type="text" name="pattern_storage_method_outside_agent_name" placeholder="กรุณาเลือกAgent.." class="form-control" style="width: 36.7%; display: inline;" readonly hidden/> &nbsp;
                    <a href="#select-agent" data-bs-toggle="modal" class="option-pattern" hidden>เลือก Agent</a></span>
                </p>
                <p style="margin-left: 8%;">
                    <input type="checkbox" id="customCheck10" name="pattern_storage_method_outside_database_outside" class="form-check-input" style="vertical-align: middle;"/>
                    <label class="form-check-label" for="customCheck10" style="vertical-align: middle;">
                        Database ภายนอก 
                    </label>
                    &nbsp; <input type="text" name="pattern_storage_method_outside_database_outside_name" placeholder="กรุณาจัดการConfig.." class="form-control" style="width: 36.7%; display: inline; margin-top: 0%;" hidden/><!-- readonly --> &nbsp; 
                    <a href="#select-db-out" class="option-pattern" hidden>รายละเอียด Config</a></span> 
                </p>
            </div>
            `)
                let check_device = 0;
                let check_agent = 0;
                let check_db_out = 0;
                $('input#customCheck8').on('click', function () {
                    check_device += 1
                    if (check_device == 1) {
                        $('input[name="pattern_storage_method_outside_device_name"]').removeAttr('hidden')
                        $('a[href="#select-device"]').removeAttr('hidden')
                    } else {
                        $('input[name="pattern_storage_method_outside_device_name"]').val(null)
                        $('input[name="pattern_storage_method_outside_device_name"]').attr('hidden', true)
                        $('a[href="#select-device"]').attr('hidden', true)
                        check_device = 0
                    }
                })
                $('input#customCheck9').on('click', function () {
                    check_agent += 1
                    if (check_agent == 1) {
                        $('input[name="pattern_storage_method_outside_agent_name"]').removeAttr('hidden')
                        $('a[href="#select-agent"]').removeAttr('hidden')
                        $('a[href="#select-agent"]').on('click', function () {
                            count_click6 += 1
                            $.post('/pattern/selectAgent', { value: "P@tternSe1ect@gent" }).done(function (result) {
                                // ============================== Create Prepare ============================
                                var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

                                var state = {
                                    'querySet': result.agent,
                                    'page': 1,
                                    'rows': 5,
                                    'window': 5,
                                }
                                if (count_click6 == 1) {
                                    buildTable()
                                }
                                function pagination(querySet, page, rows) {
                                    var trimStart = (page - 1) * rows
                                    var trimEnd = trimStart + rows

                                    var trimmedData = querySet.slice(trimStart, trimEnd)

                                    var pages = Math.ceil(querySet.length / rows);
                                    var start_count = 1
                                    document.getElementById('start-agent').innerHTML = start_count

                                    return {
                                        'querySet': trimmedData,
                                        'pages': pages,
                                    }
                                }
                                // ============================== Create Pagination ============================
                                function pageButtons(pages) {
                                    var wrapper = document.getElementById('pagination-wapper-agent')
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
                                        $('#table-body-agent').empty()
                                        state.page = Number($(this).val())
                                        buildTable()
                                    })
                                }
                                // ============================== Create Table ============================
                                function buildTable() {
                                    var table = $('#table-body-agent')
                                    var data = pagination(state.querySet, state.page, state.rows)
                                    var myList = data.querySet
                                    for (y in myList) {
                                        if (myList[y].agent_manage_id != "") {
                                            var buttonAdd = ''
                                            var buttonDel = ''
                                            if (state.page == 1) {
                                                if ($('input[name="pattern_storage_method_outside_agent_name"]').val() != result.id_agent[y].agent_manage_id) {
                                                    buttonAdd = '<a id="_add_agent" href="javascript:void(0);" data-value=' + result.id_agent[y].agent_manage_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                    buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                                } else {
                                                    buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                                    buttonDel = '<a id="_del_agent" href="javascript:void(0);" data-value=' + result.id_agent[y].agent_manage_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                }
                                            } else {
                                                if ($('input[name="pattern_storage_method_outside_agent_name"]').val() != result.id_agent[parseInt(state.rows) + parseInt(y)].agent_manage_id) {
                                                    buttonAdd = '<a id="_add_agent" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].agent_manage_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                    buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                                } else {
                                                    buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                                    buttonDel = '<a id="_del_agent" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].agent_manage_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                }
                                            }
                                            //Keep in mind we are using "Template Litterals to create rows"
                                            var row = '<tr>' +
                                                '<th style="text-align: left; vertical-align: center;">' +
                                                'ชื่อ: ' + myList[y].agent_name + " (" + myList[y].name + ")" + " <br/>" +
                                                '</th>' +
                                                '<td style="vertical-align: middle; width: 50px;">' +
                                                buttonAdd +
                                                '</td>' +
                                                '<td style="vertical-align: middle; width: 50px;">' +
                                                buttonDel +
                                                '</td>' +
                                                '</tr>'
                                            table.append(row)
                                            end_count = myList[y].agent_manage_id
                                        }
                                    }
                                    if (myList.length == 0) {
                                        var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                                        table.append(row)
                                        $('#total-agent').text(0)
                                        $('#start-agent').text(0)
                                    } else {
                                        if (myList[0].acc_id != "") {
                                            $('#start-agent').text(myList[0].agent_manage_id)
                                        }
                                        pageButtons(data.pages)
                                        $('#total-agent').text(result.agent.length)
                                    }
                                    $('#end-agent').text(end_count)
                                    // end_count = table.find('tr').length

                                    $('a#_add_agent').on('click', function () {
                                        var selected = $(this).attr('data-value')
                                        $.post('/pattern/getAgent', { value: "P@tternGet@gent", id: selected }).done(function (result) {
                                            $('input[name="pattern_storage_method_outside_agent_name"]').val(result[0].agent_manage_id)
                                            $('div#select-agent').modal('hide')
                                            $('#table-body-agent').empty()
                                            buildTable()
                                        })
                                    })
                                    $('a#_del_agent').on('click', function () {
                                        var selected = $(this).attr('data-value')
                                        $.post('/pattern/getAgent', { value: "P@tternGet@gent", id: selected }).done(function (result) {
                                            $('input[name="pattern_storage_method_outside_agent_name"]').val(null)
                                            $('#table-body-agent').empty()
                                            buildTable()
                                        })
                                    })
                                }
                            })
                        })
                    } else {
                        $('input[name="pattern_storage_method_outside_agent_name"]').val(null)
                        $('input[name="pattern_storage_method_outside_agent_name"]').attr('hidden', true)
                        $('a[href="#select-agent"]').attr('hidden', true)
                        check_agent = 0
                    }
                })
                $('input#customCheck10').on('click', function () {
                    check_db_out += 1
                    if (check_db_out == 1) {
                        $('input[name="pattern_storage_method_outside_database_outside_name"]').removeAttr('hidden')
                        $('a[href="#select-db-out"]').removeAttr('hidden')
                    } else {
                        $('input[name="pattern_storage_method_outside_database_outside_name"]').val(null)
                        $('input[name="pattern_storage_method_outside_database_outside_name"]').attr('hidden', true)
                        $('a[href="#select-db-out"]').attr('hidden', true)
                        check_db_out = 0
                    }
                })

            } else {
                $('input#customCheck6').css('margin-top', '0%')
                $('label[for="customCheck6"]').css('margin-top', '0%')
                $('span#outside_storage_method').empty()
                $('span#outside_option-storage_method').empty()
            }
        }
    })
    $('input:radio').on('click', function () {
        if ($(this).attr('name') == "pattern_type_data_file_of_path") {
            $('span#path').html('<br/><input type="text" name="pattern_type_data_file_path" placeholder="กรุณาป้อนที่อยู่ไฟล์" class="form-control"></input>')
        }
    })
    // ========================= Modals Add Policy =====================================
    var count_click1 = 0
    $('a[href="#add-policy"]').on('click', function () {
        $.ajax({
            url: '/policy',
            method: "POST",
            data: { value: 1 },
            success: function (result) {
                count_click1 += 1
                // ============================== Create Prepare ============================
                var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                var state = {
                    'querySet': result.policy,
                    'page': 1,
                    'rows': 2,
                    'window': 5,
                }
                if (count_click1 == 1 && ($('input[name="doc_id"]').val() == "" || $('input[name="doc_id"]').val() == null)) {
                    buildTable()
                } else {
                    $('#table-body-policy-add').empty()
                    buildTable()
                }
                function pagination(querySet, page, rows) {
                    var trimStart = (page - 1) * rows
                    var trimEnd = trimStart + rows

                    var trimmedData = querySet.slice(trimStart, trimEnd)

                    var pages = Math.ceil(querySet.length / rows);

                    var start_count = 1
                    document.getElementById('start-policy-add').innerHTML = start_count

                    return {
                        'querySet': trimmedData,
                        'pages': pages,
                    }
                }
                // ============================== Create Pagination ============================
                function pageButtons(pages) {
                    var wrapper = document.getElementById('pagination-wapper-policy-add')
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
                        $('#table-body-policy-add').empty()
                        state.page = Number($(this).val())
                        // document.getElementById('page').value = state.page
                        buildTable()
                    })
                }
                // ============================== Create Table ============================
                function buildTable() {
                    var table = $('#table-body-policy-add')
                    var data = pagination(state.querySet, state.page, state.rows)
                    var myList = data.querySet
                    for (y in myList) {
                        if (myList[y].doc_id != "" && myList[y].doc_action != 1 && myList[y].doc_status == 2) {
                            var total_page = 0
                            for (var x = 0; x < result.page.length; x++) {
                                if (result.page[x].doc_id == result.id_document[y].doc_id) {
                                    total_page = x + 1
                                }
                            }
                            var buttonAdd = ""
                            var buttonDel = ""
                            if (state.page == 1) {
                                if (result.id_document[y].doc_id == $('input[name="doc_id"]').val()) {
                                    buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                } else {
                                    buttonAdd = '<a id="_add_" href="javascript:void(0);" data-value=' + result.id_document[y].doc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                }
                                if (result.id_document[y].doc_id != $('input[name="doc_id"]').val()) {
                                    buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                } else {
                                    buttonDel = '<a id="_del_" href="javascript:void(0);" data-value=' + result.id_document[y].doc_id + '  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                }
                            } else {
                                if (result.id_document[parseInt(state.rows) + parseInt(y)].doc_id == $('input[name="doc_id"]').val()) {
                                    buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                } else {
                                    buttonAdd = '<a id="_add_" href="javascript:void(0);" data-value=' + result.id_document[parseInt(state.rows) + parseInt(y)].doc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                }
                                if (result.id_document[parseInt(state.rows) + parseInt(y)].doc_id != $('input[name="doc_id"]').val()) {
                                    buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                } else {
                                    buttonDel = '<a id="_del_" href="javascript:void(0);" data-value=' + result.id_document[parseInt(state.rows) + parseInt(y)].doc_id + '  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                }
                            }
                            //Keep in mind we are using "Template Litterals to create rows"
                            var row = '<tr>' +
                                '<th style="vertical-align: center; text-align: left;">' +
                                'เอกสาร: ' + myList[y].doc_name + " <br/>" +
                                'ประเภท: ' + myList[y].doc_type_name + " <br/>" +
                                'จำนวนหน้าทั้งหมด: ' + total_page + " หน้า <br/>" +
                                '</th>' +
                                '<td style="vertical-align: middle; width: 50px;">' +
                                buttonAdd +
                                '</td>' +
                                '<td style="vertical-align: middle; width: 50px;">' +
                                buttonDel +
                                '</td>' +
                                '</tr>'
                            table.append(row)
                            end_count = myList[y].doc_id
                        }
                    }
                    if (myList.length == 0) {
                        var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                        table.append(row)
                        $('#total-policy-add').text(0)
                        $('#start-policy-add').html(0)
                    } else {
                        if (myList[0].doc_id != "" && myList[0].doc_action != 1 && myList[0].doc_status == 2) {
                            $('#start-policy-add').text(myList[0].doc_id)
                        }
                        pageButtons(data.pages)
                        $('#total-policy-add').text(result.policy.length)
                    }
                    $('#end-policy-add').html(end_count)
                    $('a#_add_').on('click', function () {
                        $.post('/policy/select-policy', { value: 'P@tternSe1ectP01icy', id: $(this).attr('data-value') }).done(function (result) {
                            $.ajax({
                                url: "/policy/get",
                                method: "POST",
                                data: { id: result[0].doc_id },
                                success: function (result) {
                                    var data_tag = []
                                    for (i in result._data_) {
                                        if (result._data_[i].data_tag != null) {
                                            data_tag.push(result._data_[i].data_tag)
                                        }
                                    }
                                    var convert_data_tag = new Set([...data_tag])
                                    var join_convert_data_tag = [...convert_data_tag].join(',')

                                    var split_convert_data_tag = join_convert_data_tag.split(',')

                                    var success_data_tag = new Set([...split_convert_data_tag])

                                    if ($("input[name='pattern_tag']").val() == "" && $('input[name="doc_id"]').val() == "") {
                                        $("input[name='pattern_tag']").val([...success_data_tag].join(','))
                                        $('a#previewer').attr({
                                            'href': '/show_slide/' + result.get_value,
                                            'target': "_blank",
                                            'rel': "noopener noreferrer",
                                            'aria-disabled': "false",
                                            'class': "btn btn-info"
                                        })
                                        $('input[name="doc_id"]').val(result.get_value)
                                        check_doc_id();
                                        $('div#add-policy').modal('hide')
                                    } else if ($("input[name='pattern_tag']").val() != "" && $('input[name="doc_id"]').val() == "") {
                                        var old_tag = $("input[name='pattern_tag']").val().split(',')
                                        var new_tag = Array.from([...success_data_tag])
                                        var convert_old_tag = new Set([...old_tag, ...new_tag])
                                        $("input[name='pattern_tag']").val([...convert_old_tag].join(','))
                                        $('a#previewer').attr({
                                            'href': '/show_slide/' + result.get_value,
                                            'target': "_blank",
                                            'rel': "noopener noreferrer",
                                            'aria-disabled': "false",
                                            'class': "btn btn-info"
                                        })
                                        $('input[name="doc_id"]').val(result.get_value)
                                        check_doc_id();
                                        $('div#add-policy').modal('hide')
                                    } else if ($("input[name='pattern_tag']").val() == "" && $('input[name="doc_id"]').val() != "") {
                                        var old_tag = $("input[name='pattern_tag']").val().split(',')
                                        var new_tag = Array.from([...success_data_tag])
                                        var convert_old_tag = new Set([...old_tag, ...new_tag])
                                        $("input[name='pattern_tag']").val([...convert_old_tag].join(','))
                                        $('a#previewer').attr({
                                            'href': '/show_slide/' + result.get_value,
                                            'target': "_blank",
                                            'rel': "noopener noreferrer",
                                            'aria-disabled': "false",
                                            'class': "btn btn-info"
                                        })
                                        $('input[name="doc_id"]').val(result.get_value)
                                        check_doc_id()
                                        $('div#add-policy').modal('hide')
                                    } else if ($("input[name='pattern_tag']").val() != "" && $('input[name="doc_id"]').val() != "") {
                                        var old_tag = $("input[name='pattern_tag']").val().split(',')
                                        var new_tag = Array.from([...success_data_tag])
                                        var convert_old_tag = new Set([...old_tag, ...new_tag])
                                        $("input[name='pattern_tag']").val([...convert_old_tag].join(','))
                                        $('a#previewer').attr({
                                            'href': '/show_slide/' + result.get_value,
                                            'target': "_blank",
                                            'rel': "noopener noreferrer",
                                            'aria-disabled': "false",
                                            'class': "btn btn-info"
                                        })
                                        $('input[name="doc_id"]').val(result.get_value)
                                        check_doc_id();
                                        $('div#add-policy').modal('hide')
                                    }
                                }
                            })
                        })
                    })
                    $('a#_del_').on('click', function () {
                        $('input[name="doc_id"]').val(null)
                        check_doc_id();
                        $('a#previewer').attr({
                            'href': 'javascript:void(0);',
                            'aria-disabled': "true",
                            'class': "btn btn-secondary"
                        })
                        var old_tag = new Set($("input[name='pattern_tag']").val().split(','))
                        $.post('/policy/select-policy', { value: "P@tternSe1ectP01icy", id: $(this).attr('data-value') }).done(function (result) {
                            $.ajax({
                                url: "/policy/get/",
                                method: "POST",
                                data: { id: result.doc_id },
                                success: function (result) {
                                    var data_tag = []
                                    for (i in result._data_) {
                                        if (result._data_[i].data_tag != null) {
                                            data_tag.push(result._data_[i].data_tag)
                                        }
                                    }
                                    var string_data_tag = data_tag.join(',')
                                    var backward = string_data_tag.split(',')
                                    var convert_data_tag = new Set([...backward])
                                    if (eqSet(old_tag, convert_data_tag) == true) {
                                        $("input[name='pattern_tag']").val(null)
                                        $('#table-body-policy-add').empty()
                                        buildTable()
                                    } else if (eqSet(old_tag, convert_data_tag) == false) {
                                        var convert_old_tag = Array.from([...old_tag])
                                        var backward_data_tag = Array.from([...convert_data_tag])
                                        var new_data_tag = convert_old_tag.filter(function (item) { return backward_data_tag.indexOf(item) == -1 })
                                        $("input[name='pattern_tag']").val(new_data_tag)
                                        $('#table-body-policy-add').empty()
                                        buildTable()
                                    }
                                }
                            })
                        })
                    })
                }
            }
        })
    })
    // ============================ Modal Add Tags ========================================
    var count_click2 = 0
    $('a#btn-add-tags').on('click', function () {
        $.ajax({
            url: '/tag',
            method: "POST",
            data: { value: 1 },
            success: function (result) {
                count_click2 += 1
                // ============================== Create Prepare ============================
                var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                var state = {
                    'querySet': result.tag,
                    'page': 1,
                    'rows': 5,
                    'window': 5,
                }
                if (count_click2 == 1 && ($('input[name="pattern_tag"]').val() == "" || $('input[name="pattern_tag"]').val() == null)) {
                    buildTable()
                } else {
                    $('#table-body-tag-add').empty()
                    buildTable()
                }
                function pagination(querySet, page, rows) {

                    var trimStart = (page - 1) * rows
                    var trimEnd = trimStart + rows

                    var trimmedData = querySet.slice(trimStart, trimEnd)

                    var pages = Math.ceil(querySet.length / rows);

                    var start_count = 1
                    document.getElementById('start-tag-add').innerHTML = start_count

                    return {
                        'querySet': trimmedData,
                        'pages': pages,
                    }
                }
                // ============================== Create Pagination ============================
                function pageButtons(pages) {
                    var wrapper = document.getElementById('pagination-wapper-tag-add')
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
                        $('#table-body-tag-add').empty()
                        state.page = Number($(this).val())
                        // document.getElementById('page').value = state.page
                        buildTable()
                    })
                }
                // ============================== Create Table ============================
                function buildTable() {
                    var table = $('#table-body-tag-add')
                    var data = pagination(state.querySet, state.page, state.rows)
                    var myList = data.querySet
                    for (y in myList) {
                        if (myList[y].tag_id != "") {
                            var buttonAdd_tag = ""
                            var buttonDel_tag = ""
                            var old_value = $('input[name="pattern_tag"]').val().split(',')
                            if (checkTag(old_value, myList[y].tag_name, 0) == true) {
                                buttonAdd_tag = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                buttonDel_tag = '<a id="_del_tag_" href="javascript:void(0);" data-value="' + myList[y].tag_name + '"  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                            } else {
                                buttonAdd_tag = '<a id="_add_tag_" href="javascript:void(0);" data-value=' + myList[y].tag_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                buttonDel_tag = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                            }
                            //Keep in mind we are using "Template Litterals to create rows"
                            var row = '<tr>' +
                                '<th style="vertical-align: center;">' +
                                'ชื่อ: ' + myList[y].tag_name + " <br/>" +
                                '</th>' +
                                '<td style="vertical-align: middle; width: 50px;">' +
                                buttonAdd_tag +
                                '</td>' +
                                '<td style="vertical-align: middle; width: 50px;">' +
                                buttonDel_tag +
                                '</td>' +
                                '</tr>'
                            table.append(row)
                            end_count = myList[y].tag_id
                        }
                    }
                    if (myList.length == 0) {
                        var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                        table.append(row)
                        $('#start-tag-add').html(0)
                        $('#total-tag-add').text(0)
                    }
                    $('#end-tag-add').html(end_count)
                    if (myList[0].tag_id != "") {
                        $('#start-tag-add').html(myList[0].tag_id)
                    }
                    $('#total-tag-add').text(result.tag.length)
                    pageButtons(data.pages)
                    $('a#_add_tag_').on('click', function () {
                        var tag_id = parseInt($(this).attr('data-value'))
                        $.ajax({
                            url: "/tag",
                            method: "POST",
                            data: { value: 1 },
                            success: function (result) {
                                for (k in result.tag) {
                                    if (result.tag[k].tag_id == tag_id) {
                                        if ($('input[name="pattern_tag"]').val() != "") {
                                            var old_value = $('input[name="pattern_tag"]').val().split(",")
                                            old_value.push(result.tag[k].tag_name)
                                            var convert_old_value = new Set([...old_value])
                                            var join_convert_tag = [...convert_old_value].join(',')
                                            $('input[name="pattern_tag"]').val(join_convert_tag)
                                        } else {
                                            $('input[name="pattern_tag"]').val(result.tag[k].tag_name)
                                        }
                                    }
                                }
                            }
                        }).done(function () {
                            $('#table-body-tag-add').empty()
                            buildTable()
                        })
                    })
                    $('a#_del_tag_').on('click', function () {
                        var old_tag = $('input[name="pattern_tag"]').val().split(',')
                        var tag = $(this).attr('data-value')
                        var new_tag = old_tag.filter(function (item) { return item != tag })
                        $('input[name="pattern_tag"]').val(new_tag)
                        $('#table-body-tag-add').empty()
                        buildTable()
                    })
                }
            }
        })
    })
    // ============================ (Clear All Tags) ======================================
    // $('input[name="pattern_tag"]').on('click keyup keydown focus', function () {
    //     if ($(this).val() == "") {
    //         $('input[name="doc_id"]').val(null)
    //         $('a#previewer').removeAttr('target')
    //         $('a#previewer').removeAttr('_ref')
    //         $('a#previewer').attr({
    //             'href': 'javascript:void(0);',
    //             'aria-disabled': "true",
    //             'class': "btn btn-secondary"
    //         })
    //     }
    // })
    // var count_click3 = 0
    // ========================= Modal Add Processing_base ================================
    $('a#btn_add_processing_base').on('click', function () {
        $('a#add_processing_base').on('click', function () {
            if ($('input[name="pattern_processing_base_name"]').val() != "") {
                var name = $('input[name="pattern_processing_base_name"]').attr('name')
                var value = $('input[name="pattern_processing_base_name"]').val()
                var obj = {}
                obj[name] = value
                $.ajax({
                    url: '/processing_base',
                    method: "POST",
                    data: obj,
                }).done(function () {
                    $('input[name="pattern_processing_base_name"]').val(null);
                    $('div#add-processing-base').modal('hide');
                    $('#select_processing_base').load(document.URL + ' #select_processing_base');
                    // $('#select_processing_base').load(location.href + "#select_processing_base")
                })
            }
        })
    })
} else if (document.getElementById('edit')) { // Hold and back to fix bug function on page new
    $('#li_data_protect').last().addClass('selected')
    $('#a_data_protect').last().addClass('active')
    $('#ul_data_protect').last().addClass('in')
    $('#li_pattern').last().addClass('active')
    $('#a_pattern').last().addClass('active')
    // ================================ Option Input ================================
    var count_click4 = 0
    var count_click5 = 0
    var count_click6 = 0
    var list_users = []
    var list_image = []
    var list_users_outside = []
    var list_image_outside = []
    $('input:checkbox').attr('checked', function () {
        var checkBox = $(this).attr('id')
        var full = $(this)
        $.post('/pattern/checkPattern', { value: "@lltraP@tternCheckP@ttern", id: $('form#form_edit').attr('data-mark') }).done(function (result) {
            if (checkBox == "customCheck4") {
                let windows = ""
                let linux = ""
                if (result[0].pattern_type_data_file_of_path == 0) {
                    linux = "checked"
                } else if (result[0].pattern_type_data_file_of_path == 1) {
                    windows = "checked"
                }
                $('label[for="customCheck4"]').css('margin-bottom', "2%");
                $('span#file_path').html(`
                <br/>&emsp;&emsp;&emsp;<input type="radio" id="customeRaido1" name="pattern_type_data_file_of_path" value='1' class="form-check-input" ${windows} />
                <label class='form-check-label h6' for='customeRaido1' stype='font-weight: bold;'>Windows</label><br/>
                &emsp;&emsp;&emsp;<input type="radio" id="customeRaido2" name="pattern_type_data_file_of_path" value="0" class="form-check-input" ${linux} />
                <label class='form-check-label h6' for='customeRaido2' stype='font-weight: bold;'>Linux</label>
                `)
                if (document.getElementById('customeRaido2').checked == true || document.getElementById('customeRaido1').checked == true) {
                    $('span#path').html(`<input type="text" name="pattern_type_data_file_path" value="${result[0].pattern_type_data_file_path}" placeholder="กรุณาป้อนที่อยู่ไฟล์" class="form-control" style="margin-left: 10%; width: 78%;"></input>`)
                }
            }
            if (checkBox == "customCheck5") {
                $('label[for="customCheck5"]').css('margin-bottom', '0%');
                $('input#customCheck4').css('margin-top', "2%")
                $('label[for="customCheck4"]').css('margin-top', '2%')
                $('span#database').html(`<input type="text" name="pattern_type_data_database_name" value="${result[0].pattern_type_data_database_name}" placeholder="กรุณาป้อนDatabase.." class="form-control" style="display: inline; width: 37%; margin-left: 1%;" ></input>`)
            }
            if (checkBox == "customCheck7") {
                full.css('vertical-align', "-5px");
                $('input#customCheck6').css('margin-top', '2%')
                $('label[for="customCheck6"]').css('margin-top', '1.7%')
                $('span#outside_storage_method').html(`<input type="text" name="pattern_storage_method_outside_name" value="${result[0].pattern_storage_method_outside_name}" placeholder="กรุณาป้อนภายนอก.." class="form-control" style="display: inline; width: 36.7%;" >`)
                let device = new Array(2)
                let agent = new Array(2)
                let db_out = new Array(2)
                if (result[0].pattern_storage_method_outside_device == 1) {
                    device[0] = "checked"
                    device[1] = result[0].pattern_storage_method_outside_device_name
                }
                if (result[0].pattern_storage_method_outside_agent == 1) {
                    agent[0] = "checked"
                    agent[1] = result[0].pattern_storage_method_outside_agent_name
                }
                if (result[0].pattern_storage_method_outside_database_outside == 1) {
                    db_out[0] = "checked"
                    db_out[1] = result[0].pattern_storage_method_outside_database_outside_name
                }
                $('span#outside_option-storage_method').html(`
            <div class="">
                <p style="margin-left: 8%;">
                    <input type="checkbox" id="customCheck8" name="pattern_storage_method_outside_device" class="form-check-input" style="vertical-align: middle;" ${device[0]}>
                    <label class="form-check-label" for="customCheck8" style="vertical-align: middle;">
                        อุปกรณ์                   
                    </label>
                    &nbsp; <input type="text" name="pattern_storage_method_outside_device_name" value="${device[1]}" placeholder="กรุณาเลือกอุปกรณ์.." class="form-control" style="width: 36.7%; display: inline; margin-top: 1%;" hidden/><!-- readonly --> &nbsp; 
                    <a href="#select-device" class="option-pattern" hidden>เลือกอุปกรณ์</a></span>    
                </p>
                <p style="margin-left: 8%;">
                    <input type="checkbox" id="customCheck9" name="pattern_storage_method_outside_agent" class="form-check-input" style="vertical-align: middle;" ${agent[0]}>
                    <label class="form-check-label" for="customCheck9" style="vertical-align: middle;">
                        Agent &nbsp; &nbsp;  
                    </label>
                    <input type="text" name="pattern_storage_method_outside_agent_name" value="${agent[1]}" placeholder="กรุณาเลือกAgent.." class="form-control" style="width: 36.7%; display: inline;" hidden/><!-- readonly --> &nbsp;
                    <a href="#select-agent" data-bs-toggle="modal" class="option-pattern" hidden>เลือก Agent</a></span>
                </p>
                <p style="margin-left: 8%;">
                    <input type="checkbox" id="customCheck10" name="pattern_storage_method_outside_database_outside" class="form-check-input" style="vertical-align: middle;" ${db_out[0]}/>
                    <label class="form-check-label" for="customCheck10" style="vertical-align: middle;">
                        Database ภายนอก 
                    </label>
                    &nbsp; <input type="text" name="pattern_storage_method_outside_database_outside_name" value="${db_out[1]}" placeholder="กรุณาจัดการConfig.." class="form-control" style="width: 36.7%; display: inline; margin-top: 0%;" hidden/><!-- readonly --> &nbsp; 
                    <a href="#select-db-out" class="option-pattern" hidden>รายละเอียด Config</a></span> 
                </p>
            </div>
            `)
                if (device[0] == "checked") {
                    $('input[name="pattern_storage_method_outside_device_name"]').removeAttr('hidden')
                    $('a[href="#select-device"]').removeAttr('hidden')
                }
                if (agent[0] == "checked") {
                    $('input[name="pattern_storage_method_outside_agent_name"]').removeAttr('hidden')
                    $('a[href="#select-agent"]').removeAttr('hidden')
                    count_click6 += 1
                    $.post('/pattern/selectAgent', { value: "P@tternSe1ect@gent" }).done(function (result) {
                        // ============================== Create Prepare ============================
                        var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

                        var state = {
                            'querySet': result.agent,
                            'page': 1,
                            'rows': 5,
                            'window': 5,
                        }
                        if (count_click6 == 1) {
                            buildTable()
                        }
                        function pagination(querySet, page, rows) {
                            var trimStart = (page - 1) * rows
                            var trimEnd = trimStart + rows

                            var trimmedData = querySet.slice(trimStart, trimEnd)

                            var pages = Math.ceil(querySet.length / rows);
                            var start_count = 1
                            document.getElementById('start-agent').innerHTML = start_count

                            return {
                                'querySet': trimmedData,
                                'pages': pages,
                            }
                        }
                        // ============================== Create Pagination ============================
                        function pageButtons(pages) {
                            var wrapper = document.getElementById('pagination-wapper-agent')
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
                                $('#table-body-agent').empty()
                                state.page = Number($(this).val())
                                buildTable()
                            })
                        }
                        // ============================== Create Table ============================
                        function buildTable() {
                            var table = $('#table-body-agent')
                            var data = pagination(state.querySet, state.page, state.rows)
                            var myList = data.querySet
                            for (y in myList) {
                                if (myList[y].agent_manage_id != "") {
                                    var buttonAdd = ''
                                    var buttonDel = ''
                                    if (state.page == 1) {
                                        if ($('input[name="pattern_storage_method_outside_agent_name"]').val() != result.id_agent[y].agent_manage_id) {
                                            buttonAdd = '<a id="_add_agent" href="javascript:void(0);" data-value=' + result.id_agent[y].agent_manage_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                        } else {
                                            buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                            buttonDel = '<a id="_del_agent" href="javascript:void(0);" data-value=' + result.id_agent[y].agent_manage_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                        }
                                    } else {
                                        if ($('input[name="pattern_storage_method_outside_agent_name"]').val() != result.id_agent[parseInt(state.rows) + parseInt(y)].agent_manage_id) {
                                            buttonAdd = '<a id="_add_agent" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].agent_manage_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                        } else {
                                            buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                            buttonDel = '<a id="_del_agent" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].agent_manage_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                        }
                                    }
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<th style="text-align: left; vertical-align: center;">' +
                                        'ชื่อ: ' + myList[y].agent_name + " (" + myList[y].name + ")" + " <br/>" +
                                        '</th>' +
                                        '<td style="vertical-align: middle; width: 50px;">' +
                                        buttonAdd +
                                        '</td>' +
                                        '<td style="vertical-align: middle; width: 50px;">' +
                                        buttonDel +
                                        '</td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].agent_manage_id
                                }
                            }
                            if (myList.length == 0) {
                                var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                                table.append(row)
                                $('#total-agent').text(0)
                                $('#start-agent').text(0)
                            } else {
                                if (myList[0].acc_id != "") {
                                    $('#start-agent').text(myList[0].agent_manage_id)
                                }
                                pageButtons(data.pages)
                                $('#total-agent').text(result.agent.length)
                            }
                            $('#end-agent').text(end_count)
                            // end_count = table.find('tr').length

                            $('a#_add_agent').on('click', function () {
                                var selected = $(this).attr('data-value')
                                $.post('/pattern/getAgent', { value: "P@tternGet@gent", id: selected }).done(function (result) {
                                    $('input[name="pattern_storage_method_outside_agent_name"]').val(result[0].agent_manage_id)
                                    $('div#select-agent').modal('hide')
                                    $('#table-body-agent').empty()
                                    buildTable()
                                })
                            })
                            $('a#_del_agent').on('click', function () {
                                var selected = $(this).attr('data-value')
                                $.post('/pattern/getAgent', { value: "P@tternGet@gent", id: selected }).done(function (result) {
                                    $('input[name="pattern_storage_method_outside_agent_name"]').val(null)
                                    $('#table-body-agent').empty()
                                    buildTable()
                                })
                            })
                        }
                    })
                }
                if (db_out[0] == "checked") {
                    $('input[name="pattern_storage_method_outside_database_outside_name"]').removeAttr('hidden')
                    $('a[href="#select-db-out"]').removeAttr('hidden')
                }
                let check0 = 1;
                let check1 = 1;
                let check2 = 1;
                $('input#customCheck8').on('click', function () {
                    if (device[0] == "checked") {
                        check0 -= 1
                    }
                    if (check0 == 0) {
                        $('input[name="pattern_storage_method_outside_device_name"]').val(null)
                        $('input[name="pattern_storage_method_outside_device_name"]').attr('hidden', true)
                        $('a[href="#select-device"]').attr('hidden', true)
                    } else {
                        $('input[name="pattern_storage_method_outside_device_name"]').removeAttr('hidden')
                        $('input[name="pattern_storage_method_outside_device_name"]').val(device[1])
                        $('a[href="#select-device"]').removeAttr('hidden')
                        check0 = 1
                    }
                })
                $('input#customCheck9').on('click', function () {
                    if (agent[0] == "checked") {
                        check1 -= 1
                    }
                    if (check1 == 0) {
                        $('input[name="pattern_storage_method_outside_agent_name"]').val(null)
                        $('input[name="pattern_storage_method_outside_agent_name"]').attr('hidden', true)
                        $('a[href="#select-agent"]').attr('hidden', true)
                    } else {
                        $('input[name="pattern_storage_method_outside_agent_name"]').removeAttr('hidden')
                        $('input[name="pattern_storage_method_outside_agent_name"]').val(agent[1])
                        $('a[href="#select-agent"]').removeAttr('hidden')
                        count_click6 += 1
                        $.post('/pattern/selectAgent', { value: "P@tternSe1ect@gent" }).done(function (result) {
                            // ============================== Create Prepare ============================
                            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

                            var state = {
                                'querySet': result.agent,
                                'page': 1,
                                'rows': 5,
                                'window': 5,
                            }
                            if (count_click6 == 1) {
                                buildTable()
                            }
                            function pagination(querySet, page, rows) {
                                var trimStart = (page - 1) * rows
                                var trimEnd = trimStart + rows

                                var trimmedData = querySet.slice(trimStart, trimEnd)

                                var pages = Math.ceil(querySet.length / rows);
                                var start_count = 1
                                document.getElementById('start-agent').innerHTML = start_count

                                return {
                                    'querySet': trimmedData,
                                    'pages': pages,
                                }
                            }
                            // ============================== Create Pagination ============================
                            function pageButtons(pages) {
                                var wrapper = document.getElementById('pagination-wapper-agent')
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
                                    $('#table-body-agent').empty()
                                    state.page = Number($(this).val())
                                    buildTable()
                                })
                            }
                            // ============================== Create Table ============================
                            function buildTable() {
                                var table = $('#table-body-agent')
                                var data = pagination(state.querySet, state.page, state.rows)
                                var myList = data.querySet
                                for (y in myList) {
                                    if (myList[y].agent_manage_id != "") {
                                        var buttonAdd = ''
                                        var buttonDel = ''
                                        if (state.page == 1) {
                                            if ($('input[name="pattern_storage_method_outside_agent_name"]').val() != result.id_agent[y].agent_manage_id) {
                                                buttonAdd = '<a id="_add_agent" href="javascript:void(0);" data-value=' + result.id_agent[y].agent_manage_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                            } else {
                                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                                buttonDel = '<a id="_del_agent" href="javascript:void(0);" data-value=' + result.id_agent[y].agent_manage_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            }
                                        } else {
                                            if ($('input[name="pattern_storage_method_outside_agent_name"]').val() != result.id_agent[parseInt(state.rows) + parseInt(y)].agent_manage_id) {
                                                buttonAdd = '<a id="_add_agent" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].agent_manage_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                            } else {
                                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                                buttonDel = '<a id="_del_agent" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].agent_manage_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            }
                                        }
                                        //Keep in mind we are using "Template Litterals to create rows"
                                        var row = '<tr>' +
                                            '<th style="text-align: left; vertical-align: center;">' +
                                            'ชื่อ: ' + myList[y].agent_name + " (" + myList[y].name + ")" + " <br/>" +
                                            '</th>' +
                                            '<td style="vertical-align: middle; width: 50px;">' +
                                            buttonAdd +
                                            '</td>' +
                                            '<td style="vertical-align: middle; width: 50px;">' +
                                            buttonDel +
                                            '</td>' +
                                            '</tr>'
                                        table.append(row)
                                        end_count = myList[y].agent_manage_id
                                    }
                                }
                                if (myList.length == 0) {
                                    var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                                    table.append(row)
                                    $('#total-agent').text(0)
                                    $('#start-agent').text(0)
                                } else {
                                    if (myList[0].acc_id != "") {
                                        $('#start-agent').text(myList[0].agent_manage_id)
                                    }
                                    pageButtons(data.pages)
                                    $('#total-agent').text(result.agent.length)
                                }
                                $('#end-agent').text(end_count)
                                // end_count = table.find('tr').length

                                $('a#_add_agent').on('click', function () {
                                    var selected = $(this).attr('data-value')
                                    $.post('/pattern/getAgent', { value: "P@tternGet@gent", id: selected }).done(function (result) {
                                        $('input[name="pattern_storage_method_outside_agent_name"]').val(result[0].agent_manage_id)
                                        $('div#select-agent').modal('hide')
                                        $('#table-body-agent').empty()
                                        buildTable()
                                    })
                                })
                                $('a#_del_agent').on('click', function () {
                                    var selected = $(this).attr('data-value')
                                    $.post('/pattern/getAgent', { value: "P@tternGet@gent", id: selected }).done(function (result) {
                                        $('input[name="pattern_storage_method_outside_agent_name"]').val(null)
                                        $('#table-body-agent').empty()
                                        buildTable()
                                    })
                                })
                            }
                        })
                        check1 = 1
                    }
                })
                $('input#customCheck10').on('click', function () {
                    if (db_out[0] == "checked") {
                        check2 -= 1
                    }
                    if (check2 == 0) {
                        $('input[name="pattern_storage_method_outside_database_outside_name"]').val(null)
                        $('input[name="pattern_storage_method_outside_database_outside_name"]').attr('hidden', true)
                        $('a[href="#select-db-out"]').attr('hidden', true)
                    } else {
                        $('input[name="pattern_storage_method_outside_database_outside_name"]').removeAttr('hidden')
                        $('input[name="pattern_storage_method_outside_database_outside_name"]').val(db_out[1])
                        $('a[href="#select-db-out"]').removeAttr('hidden')
                        check2 = 1
                    }
                })
            }
            if (checkBox == "customCheck3") {
                $('input#customCheck3').css('vertical-align', '-5px');
                $('span#total_stop_time').html(`
                &emsp;&emsp;&emsp;เมื่อหมดระยะเวลาจัดเก็บข้อมูลจะเก็บข้อมูลต่อไปอีกเป็นระยะเวลา &nbsp; <input type="number" value="${result[0].pattern_set_end_date_total}" min="1" name="pattern_set_end_date_total" placeholder="กรุณาป้อนจำนวนระยะเวลา..." class="form-control" style="display: inline; width: 20%;" /> &nbsp;วัน ถือการสิ้นสุดจะเป็นการเตรียมทำลายข้อมูลและไม่มีการใช้ข้อมูลเพื่อกรประมวลผล
                `)
            }
        })
    })
    if ($('input#customCheck1').is(":checked")) {
        $.post('/pattern/checkPattern', { value: "@lltraP@tternCheckP@ttern", id: $('form#form_edit').attr('data-mark') }).done(function (result) {
            $('span#process_inside').html(`
                    &nbsp;&nbsp;&nbsp;&nbsp;<a id="user_inside" href="#add-users" data-bs-toggle="modal" class="option-pattern" style="display: inline; vertical-align: middle;">เลือกสมาชิกในระบบ Alltra</a>
                    &nbsp;&nbsp;<span style="vertical-align: middle;">รวม</span>&nbsp;<input type="text" name="pattern_processor_inside_total" value="${result[0].pattern_processor_inside_total}" placeholder="กรุณาเลือกสมาชิก..." class="form-control" style="width: 25%; display: inline; vertical-align: middle;" readonly/> &nbsp; <span style="vertical-align: middle;">คน
                `)
            if (result[0].pattern_processor_inside_id != "" || result[0].pattern_processor_inside_id != null) {
                let users = result[0].pattern_processor_inside_id.split(',')
                for (i in users) {
                    let users_inside = $('span#users_inside');
                    $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: users[i] }).done(function (result) {
                        list_users.push({ "id": result[0].acc_id, "image": result[0].image })
                        if (parseInt(i) != users.length) {
                            users_inside.append('&nbsp; <img class="image-users1" src="/UI/image/' + result[0].image + '" data-mark="' + result[0].acc_id + '"/> &nbsp;')
                        } else {
                            user_inside.append('<img class="image-users1" src="/UI/image/' + result[0].image + '" data-mark="' + result[0].acc_id + '"/>')
                        }
                    })
                }
            }
            $('a#user_inside').on('click', function () {
                count_click4 += 1
                $.ajax({
                    url: "/pattern/user",
                    method: "POST",
                    data: { value: "P@tternUser" },
                    success: function (result) {
                        // ============================== Create Prepare ============================
                        var end_count = 0 // จำนวนทั้งหมด

                        var state = {
                            'querySet': result.users,
                            'page': 1,
                            'rows': 5,
                            'window': 5,
                        }
                        if (count_click4 == 1) {
                            buildTable()
                        }
                        function pagination(querySet, page, rows) {
                            var trimStart = (page - 1) * rows
                            var trimEnd = trimStart + rows

                            var trimmedData = querySet.slice(trimStart, trimEnd)

                            var pages = Math.ceil(querySet.length / rows);
                            var start_count = 1
                            document.getElementById('start-users').innerHTML = start_count

                            return {
                                'querySet': trimmedData,
                                'pages': pages,
                            }
                        }
                        // ============================== Create Pagination ============================
                        function pageButtons(pages) {
                            var wrapper = document.getElementById('pagination-wapper-users')
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
                                wrapper.innerHTML = `<li class="page-item"><button value=${state.page - 1} class="page page-link"> ย้อนกลับ </button></li>`
                            } else {
                                wrapper.innerHTML = `<li class="page-item disabled"><button value=${state.page - 1} class="page page-link" > ย้อนกลับ </button></li>`
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
                                wrapper.innerHTML += `<li class="page-item"></i><button value=${state.page + 1} class="page page-link"> ถัดไป </button>`
                            } else {
                                wrapper.innerHTML += `<li class="page-item disabled"></i><button value=${state.page + 1} class="page page-link" > ถัดไป </button>`
                            }

                            $('.page').on('click', function () {
                                $('#table-body-users').empty()
                                state.page = Number($(this).val())
                                buildTable()
                            })
                        }
                        // ============================== Create Table ============================
                        function buildTable() {
                            var table = $('#table-body-users')
                            var data = pagination(state.querySet, state.page, state.rows)
                            var myList = data.querySet
                            for (y in myList) {
                                if (myList[y].acc_id != "") {
                                    var buttonAdd = ''
                                    var buttonDel = ''
                                    let input_name = $('input[name="pattern_processor_inside_id"]').val().split(',')
                                    if (state.page == 1) {
                                        if (checkUser(input_name, result.id_users[y].acc_id, 0) == false) {
                                            buttonAdd = '<a id="_add_users_inside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                        } else {
                                            buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                            buttonDel = '<a id="_del_users_inside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                        }
                                    } else {
                                        if (checkUser(input_name, result.id_users[parseInt(state.rows) + parseInt(y)].acc_id, 0) == false) {
                                            buttonAdd = '<a id="_add_users_inside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                        } else {
                                            buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                            buttonDel = '<a id="_del_users_inside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
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
                                var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;"> ไม่พบข้อมูล </td></tr>'
                                table.append(row)
                                $('#total-users').text(0)
                                $('#start-users').text(0)
                            } else {
                                if (myList[0].acc_id != "") {
                                    $('#start-users').text(myList[0].acc_id)
                                }
                                pageButtons(data.pages)
                                $('#total-users').text(result.users.length)
                            }
                            $('#end-users').text(end_count)
                            // end_count = table.find('tr').length

                            $('a#_add_users_inside').on('click', function () {
                                var selected = $(this).attr('data-value')
                                $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: selected }).done(function (result) {
                                    list_users.push({ 'id': result[0].acc_id, 'image': result[0].image })
                                    let new_list_users = new Set(list_users)
                                    list_users = [...new_list_users]
                                    $('input[name="pattern_processor_inside_total"]').val(list_users.length)
                                    $('input[name="pattern_processor_inside_id"]').val(list_users.map(e => e['id']))
                                    $('span#users_inside').empty()
                                    for (var k = 0; k < list_users.length; k++) {
                                        $('span#users_inside').append('<img class="image-users1" src="/UI/image/' + list_users[k].image + '" data-mark="' + list_users[k].id + '"/> &nbsp;')
                                    }
                                    $('#table-body-users').empty()
                                    buildTable()
                                })
                            })
                            $('a#_del_users_inside').on('click', function () {
                                var selected = $(this).attr('data-value')
                                $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: selected }).done(function (result) {
                                    let new_list_users = list_users.filter(function (item) { return item.id.toString().indexOf(result[0].acc_id) })
                                    list_users = new_list_users
                                    $('input[name="pattern_processor_inside_total"]').val(list_users.length)
                                    $('input[name="pattern_processor_inside_id"]').val(list_users.map(e => e['id']))
                                    for (var k = 0; k < $('span#users_inside').children().length; k++) {
                                        if (result[0].acc_id == $('span#users_inside').children()[k].getAttribute('data-mark')) {
                                            $('span#users_inside').children()[k].remove()
                                        }
                                    }
                                    if ($('input[name="pattern_processor_inside_total"]').val() == 0) {
                                        $('span#users_inside').empty()
                                    }
                                    $('#table-body-users').empty()
                                    buildTable()
                                })
                            })
                        }
                    }
                })
            })
        })
    }
    if ($('input#customCheck2').is(':checked')) {
        $.post('/pattern/checkPattern', { value: "@lltraP@tternCheckP@ttern", id: $('form#form_edit').attr('data-mark') }).done(function (result) {
            $('span#process_outside').html(`
                    &nbsp;<a id="user_outside" href="#add-users-1" data-bs-toggle="modal" class="option-pattern">เลือกสมาชิกในระบบ Alltra</a>
                    &nbsp; รวม <input type="text" name="pattern_processor_outside_total" value="${result[0].pattern_processor_outside_total}" placeholder="กรุณาเลือกสมาชิก..." class="form-control" style="width: 25%; display: inline;" readonly /> &nbsp; คน &nbsp;
                `)
            if (result[0].pattern_processor_outside_id != "" || result[0].pattern_processor_outside_id != null) {
                let users_outside = result[0].pattern_processor_outside_id.split(',')
                for (i in users_outside) {
                    $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: users_outside[i] }).done(function (result) {
                        list_users_outside.push({ "id": result[0].acc_id, "image": result[0].image })
                        if ($('span#users_outside').children().length == 0) {
                            $('span#users_outside').append('<img class="image-users1" src="/UI/image/' + result[0].image + '" data-mark="' + result[0].acc_id + '" /> &nbsp;')
                        } else {
                            $('span#users_outside').append('<img class="image-users1" src="/UI/image/' + result[0].image + '" data-mark="' + result[0].acc_id + '" />')
                        }
                    })
                }
            }
            $('a#user_outside').on('click', function () {
                count_click5 += 1
                $.ajax({
                    url: "/pattern/user",
                    method: "POST",
                    data: { value: "P@tternUser" },
                    success: function (result) {
                        // ============================== Create Prepare ============================
                        var end_count = 0 // ‡∏à‡∏≥‡∏ô‡∏ß‡∏ô‡∏ó‡∏±‡πâ‡∏á‡∏´‡∏°‡∏î‡πÉ‡∏ô‡πÅ‡∏ï‡πà‡∏•‡∏∞‡∏´‡∏ô‡πâ‡∏≤

                        var state = {
                            'querySet': result.users,
                            'page': 1,
                            'rows': 5,
                            'window': 5,
                        }
                        if (count_click5 == 1) {
                            buildTable()
                        }
                        function pagination(querySet, page, rows) {
                            var trimStart = (page - 1) * rows
                            var trimEnd = trimStart + rows

                            var trimmedData = querySet.slice(trimStart, trimEnd)

                            var pages = Math.ceil(querySet.length / rows);
                            var start_count = 1
                            document.getElementById('start-users-1').innerHTML = start_count

                            return {
                                'querySet': trimmedData,
                                'pages': pages,
                            }

                        }
                        // ============================== Create Pagination ============================
                        function pageButtons(pages) {
                            var wrapper = document.getElementById('pagination-wapper-users-1')
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
                                wrapper.innerHTML = `<li class="page-item"><button value=${state.page - 1} class="page page-link"> ย้อนกลับ </button></li>`
                            } else {
                                wrapper.innerHTML = `<li class="page-item disabled"><button value=${state.page - 1} class="page page-link" > ย้อนกลับ </button></li>`
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
                                wrapper.innerHTML += `<li class="page-item"></i><button value=${state.page + 1} class="page page-link"> ถัดไป </button>`
                            } else {
                                wrapper.innerHTML += `<li class="page-item disabled"></i><button value=${state.page + 1} class="page page-link"> ถัดไป </button>`
                            }

                            $('.page').on('click', function () {
                                $('#table-body-users-1').empty()
                                state.page = Number($(this).val())
                                buildTable()
                            })
                        }
                        // ============================== Create Table ============================
                        function buildTable() {
                            var table = $('#table-body-users-1')
                            var data = pagination(state.querySet, state.page, state.rows)
                            var myList = data.querySet
                            for (y in myList) {
                                if (myList[y].acc_id != "") {
                                    var buttonAdd = ""
                                    var buttonDel = ""
                                    let input_name_outside = $('input[name="pattern_processor_outside_id"]').val().split(',')
                                    if (state.page == 1) {
                                        if (checkUser(input_name_outside, result.id_users[y].acc_id, 0) == false) {
                                            buttonAdd = '<a id="_add_users_outside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                        } else {
                                            buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                            buttonDel = '<a id="_del_users_outside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                        }
                                    } else {
                                        if (checkUser(input_name_outside, result.id_users[parseInt(state.rows) + parseInt(y)].acc_id, 0) == false) {
                                            buttonAdd = '<a id="_add_users_outside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                        } else {
                                            buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                            buttonDel = '<a id="_del_users_outside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
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
                                var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;"> ไม่พบข้อมูล </td></tr>'
                                table.append(row)
                                $('#total-users-1').text(0)
                                $('#start-users-1').text(0)
                            } else {
                                if (myList[0].acc_id != "") {
                                    $('#start-users-1').text(myList[0].acc_id)
                                }
                                pageButtons(data.pages)
                                $('#total-users-1').text(result.users.length)
                            }
                            $('#end-users-1').text(end_count)
                            // end_count = table.find('tr').length
                            //
                            $('a#_add_users_outside').on('click', function () {
                                var selected = $(this).attr('data-value')
                                $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: selected }).done(function (result) {
                                    list_users_outside.push({ 'id': result[0].acc_id, 'image': result[0].image })
                                    $('input[name="pattern_processor_outside_total"]').val(list_users_outside.length)
                                    $('input[name="pattern_processor_outside_id"]').val(list_users_outside.map(e => e['id']))
                                    $('span#users_outside').empty()
                                    for (var k = 0; k < list_users_outside.length; k++) {
                                        $('span#users_outside').append('<img class="image-users1" src="/UI/image/' + list_users_outside[k].image + '" data-mark="' + list_users_outside[k].id + '"/> &nbsp;')
                                    }
                                    $('#table-body-users-1').empty()
                                    buildTable()
                                })
                            })
                            $('a#_del_users_outside').on('click', function () {
                                var selected = $(this).attr('data-value')
                                $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: selected }).done(function (result) {
                                    let new_list_users_outside = list_users_outside.filter(function (item) { return item.id.toString().indexOf(result[0].acc_id) })
                                    list_users_outside = new_list_users_outside
                                    $('input[name="pattern_processor_outside_total"]').val(list_users_outside.length)
                                    $('input[name="pattern_processor_outside_id"]').val(list_users_outside.map(e => e['id']))
                                    for (var k = 0; k < $('span#users_outside').children().length; k++) {
                                        if (result[0].acc_id == $('span#users_outside').children()[k].getAttribute('data-mark')) {
                                            $('span#users_outside').children()[k].remove()
                                        }
                                    }
                                    if ($('input[name="pattern_processor_outside_total"]').val() == 0) {
                                        $('span#users_outside').empty()
                                    }
                                    $('#table-body-users-1').empty()
                                    buildTable()
                                })
                            })
                        }
                    }
                })
            })
        })
    }
    $('input:checkbox').on('click', function () {
        var clickCheckBox = $(this)
        $.post('/pattern/checkPattern', { value: "@lltraP@tternCheckP@ttern", id: $('form#form_edit').attr('data-mark') }).done(function (result) {
            if (clickCheckBox.attr('id') == 'customCheck1') {
                if (clickCheckBox.is(':checked') == true) {
                    $('input[name="pattern_processor_inside_id"]').val(result[0].pattern_processor_inside_id)
                    $('span#process_inside').html(`
                    &nbsp;&nbsp;&nbsp;&nbsp;<a id="user_inside" href="#add-users" data-bs-toggle="modal" class="option-pattern" style="display: inline; vertical-align: middle;">เลือกสมาชิกในระบบ Alltra</a>
                    &nbsp;&nbsp;<span style="vertical-align: middle;">รวม</span>&nbsp;<input type="text" name="pattern_processor_inside_total" value="${result[0].pattern_processor_inside_total}" placeholder="กรุณาเลือกสมาชิก..." class="form-control" style="width: 25%; display: inline; vertical-align: middle;" readonly/> &nbsp; <span style="vertical-align: middle;">คน
                `)
                    if (result[0].pattern_processor_inside_id != "" || result[0].pattern_processor_inside_id != null) {
                        let users = result[0].pattern_processor_inside_id.split(',')
                        for (i in users) {
                            let users_inside = $('span#users_inside');
                            $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: users[i] }).done(function (result) {
                                list_users.push({ "id": result[0].acc_id, "image": result[0].image })
                                if (parseInt(i) != users.length) {
                                    users_inside.append('&nbsp; <img class="image-users1" src="/UI/image/' + result[0].image + '" data-mark="' + result[0].acc_id + '"/> &nbsp;')
                                } else {
                                    user_inside.append('<img class="image-users1" src="/UI/image/' + result[0].image + '" data-mark="' + result[0].acc_id + '"/>')
                                }
                            })
                        }
                    }
                    $('a#user_inside').on('click', function () {
                        count_click4 += 1
                        $.ajax({
                            url: "/pattern/user",
                            method: "POST",
                            data: { value: "P@tternUser" },
                            success: function (result) {
                                // ============================== Create Prepare ============================
                                var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

                                var state = {
                                    'querySet': result.users,
                                    'page': 1,
                                    'rows': 5,
                                    'window': 5,
                                }
                                if (count_click4 == 1) {
                                    buildTable()
                                }
                                function pagination(querySet, page, rows) {
                                    var trimStart = (page - 1) * rows
                                    var trimEnd = trimStart + rows

                                    var trimmedData = querySet.slice(trimStart, trimEnd)

                                    var pages = Math.ceil(querySet.length / rows);
                                    var start_count = 1
                                    document.getElementById('start-users').innerHTML = start_count

                                    return {
                                        'querySet': trimmedData,
                                        'pages': pages,
                                    }

                                }
                                // ============================== Create Pagination ============================
                                function pageButtons(pages) {
                                    var wrapper = document.getElementById('pagination-wapper-users')
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
                                        $('#table-body-users').empty()
                                        state.page = Number($(this).val())
                                        buildTable()
                                    })
                                }
                                // ============================== Create Table ============================
                                function buildTable() {
                                    var table = $('#table-body-users')
                                    var data = pagination(state.querySet, state.page, state.rows)
                                    var myList = data.querySet
                                    for (y in myList) {
                                        if (myList[y].acc_id != "") {
                                            var buttonAdd = ''
                                            var buttonDel = ''
                                            let input_name = $('input[name="pattern_processor_inside_id"]').val().split(',')
                                            if (state.page == 1) {
                                                if (checkUser(input_name, result.id_users[y].acc_id, 0) == false) {
                                                    buttonAdd = '<a id="_add_users_inside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                    buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                                } else {
                                                    buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                                    buttonDel = '<a id="_del_users_inside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                }
                                            } else {
                                                if (checkUser(input_name, result.id_users[parseInt(state.rows) + parseInt(y)].acc_id, 0) == false) {
                                                    buttonAdd = '<a id="_add_users_inside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                    buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                                } else {
                                                    buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                                    buttonDel = '<a id="_del_users_inside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
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
                                        var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                                        table.append(row)
                                        $('#total-users').text(0)
                                        $('#start-users').text(0)
                                    } else {
                                        if (myList[0].acc_id != "") {
                                            $('#start-users').text(myList[0].acc_id)
                                        }
                                        pageButtons(data.pages)
                                        $('#total-users').text(result.users.length)
                                    }
                                    $('#end-users').text(end_count)
                                    // end_count = table.find('tr').length

                                    $('a#_add_users_inside').on('click', function () {
                                        var selected = $(this).attr('data-value')
                                        $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: selected }).done(function (result) {
                                            list_users.push({ 'id': result[0].acc_id, 'image': result[0].image })
                                            $('input[name="pattern_processor_inside_total"]').val(list_users.length)
                                            $('input[name="pattern_processor_inside_id"]').val(list_users.map(e => e['id']))
                                            $('span#users_inside').empty()
                                            for (var k = 0; k < list_users.length; k++) {
                                                $('span#users_inside').append('<img class="image-users1" src="/UI/image/' + list_users[k].image + '" data-mark="' + list_users[k].id + '"/> &nbsp;')
                                            }
                                            $('#table-body-users').empty()
                                            buildTable()
                                        })
                                    })
                                    $('a#_del_users_inside').on('click', function () {
                                        var selected = $(this).attr('data-value')
                                        $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: selected }).done(function (result) {
                                            let new_list_users = list_users.filter(function (item) { return item.id.toString().indexOf(result[0].acc_id) })
                                            list_users = new_list_users
                                            $('input[name="pattern_processor_inside_total"]').val(list_users.length)
                                            $('input[name="pattern_processor_inside_id"]').val(list_users.map(e => e['id']))
                                            for (var k = 0; k < $('span#users_inside').children().length; k++) {
                                                if (result[0].acc_id == $('span#users_inside').children()[k].getAttribute('data-mark')) {
                                                    $('span#users_inside').children()[k].remove()
                                                }
                                            }
                                            if ($('input[name="pattern_processor_inside_total"]').val() == 0) {
                                                $('span#users_inside').empty()
                                            }
                                            $('#table-body-users').empty()
                                            buildTable()
                                        })
                                    })
                                }
                            }
                        })
                    })
                } else {
                    $('span#process_inside').empty()
                    $('input[name="pattern_processor_inside_total"]').val(null)
                    $('input[name="pattern_processor_inside_id"]').val(null)
                    $('span#users_inside').empty()
                    list_users.splice(0, list_users.length)
                }
            } else if (clickCheckBox.attr('id') == 'customCheck2') {
                if (clickCheckBox.is(':checked') == true) {
                    $('input[name="pattern_processor_outside_id"]').val(result[0].pattern_processor_outside_id)
                    $('span#process_outside').html(`
                    &nbsp;<a id="user_outside" href="#add-users-1" data-bs-toggle="modal" class="option-pattern">เลือกสมาชิกในระบบ Alltra</a>
                    &nbsp; รวม <input type="text" name="pattern_processor_outside_total" value="${result[0].pattern_processor_outside_total}" placeholder="กรุณาเลือกสมาชิก..." class="form-control" style="width: 25%; display: inline;" readonly /> &nbsp; คน &nbsp;
                `)
                    if (result[0].pattern_processor_outside_id != "" || result[0].pattern_processor_outside_id != null) {
                        let users = result[0].pattern_processor_outside_id.split(',')
                        for (i in users) {
                            let users_outside = $('span#users_outside');
                            $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: users[i] }).done(function (result) {
                                list_users_outside.push({ "id": result[0].acc_id, "image": result[0].image })
                                if (parseInt(i) != users.length) {
                                    users_outside.append('&nbsp; <img class="image-users1" src="/UI/image/' + result[0].image + '" data-mark="' + result[0].acc_id + '"/> &nbsp;')
                                } else {
                                    user_outside.append('<img class="image-users1" src="/UI/image/' + result[0].image + '" data-mark="' + result[0].acc_id + '"/>')
                                }
                            })
                        }
                    }
                    $('a#user_outside').on('click', function () {
                        count_click5 += 1
                        $.ajax({
                            url: "/pattern/user",
                            method: "POST",
                            data: { value: "P@tternUser" },
                            success: function (result) {
                                // ============================== Create Prepare ============================
                                var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

                                var state = {
                                    'querySet': result.users,
                                    'page': 1,
                                    'rows': 5,
                                    'window': 5,
                                }
                                if (count_click5 == 1) {
                                    buildTable()
                                }
                                function pagination(querySet, page, rows) {
                                    var trimStart = (page - 1) * rows
                                    var trimEnd = trimStart + rows

                                    var trimmedData = querySet.slice(trimStart, trimEnd)

                                    var pages = Math.ceil(querySet.length / rows);
                                    var start_count = 1
                                    document.getElementById('start-users-1').innerHTML = start_count

                                    return {
                                        'querySet': trimmedData,
                                        'pages': pages,
                                    }

                                }
                                // ============================== Create Pagination ============================
                                function pageButtons(pages) {
                                    var wrapper = document.getElementById('pagination-wapper-users-1')
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
                                        $('#table-body-users-1').empty()
                                        state.page = Number($(this).val())
                                        buildTable()
                                    })
                                }
                                // ============================== Create Table ============================
                                function buildTable() {
                                    var table = $('#table-body-users-1')
                                    var data = pagination(state.querySet, state.page, state.rows)
                                    var myList = data.querySet
                                    for (y in myList) {
                                        if (myList[y].acc_id != "") {
                                            var buttonAdd = ""
                                            var buttonDel = ""
                                            let input_name_outside = $('input[name="pattern_processor_outside_id"]').val().split(',')
                                            if (state.page == 1) {
                                                if (checkUser(input_name_outside, result.id_users[y].acc_id, 0) == false) {
                                                    buttonAdd = '<a id="_add_users_outside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                    buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                                } else {
                                                    buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                                    buttonDel = '<a id="_del_users_outside" href="javascript:void(0);" data-value=' + result.id_users[y].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                }
                                            } else {
                                                if (checkUser(input_name_outside, result.id_users[parseInt(state.rows) + parseInt(y)].acc_id, 0) == false) {
                                                    buttonAdd = '<a id="_add_users_outside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                    buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                                } else {
                                                    buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                                    buttonDel = '<a id="_del_users_outside" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].acc_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
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
                                        var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                                        table.append(row)
                                        $('#total-users-1').text(0)
                                        $('#start-users-1').text(0)
                                    } else {
                                        if (myList[0].acc_id != "") {
                                            $('#start-users-1').text(myList[0].acc_id)
                                        }
                                        pageButtons(data.pages)
                                        $('#total-users-1').text(result.users.length)
                                    }
                                    $('#end-users-1').text(end_count)
                                    // end_count = table.find('tr').length
                                    //
                                    $('a#_add_users_outside').on('click', function () {
                                        var selected = $(this).attr('data-value')
                                        $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: selected }).done(function (result) {
                                            list_users_outside.push({ 'id': result[0].acc_id, 'image': result[0].image })
                                            $('input[name="pattern_processor_outside_total"]').val(list_users_outside.length)
                                            $('input[name="pattern_processor_outside_id"]').val(list_users_outside.map(e => e['id']))
                                            $('span#users_outside').empty()
                                            for (var k = 0; k < list_users_outside.length; k++) {
                                                $('span#users_outside').append('<img class="image-users1" src="/UI/image/' + list_users_outside[k].image + '" data-mark="' + list_users_outside[k].id + '" title="' + list_users_outside[k].name + '"/> &nbsp;')
                                            }
                                            $('#table-body-users-1').empty()
                                            buildTable()
                                        })
                                    })
                                    $('a#_del_users_outside').on('click', function () {
                                        var selected = $(this).attr('data-value')
                                        $.post('/pattern/select-users', { value: "P@tternSe1ectUser", id: selected }).done(function (result) {
                                            let new_list_users_outside = list_users_outside.filter(function (item) { return item.id.toString().indexOf(result[0].acc_id) })
                                            list_users_outside = new_list_users_outside
                                            $('input[name="pattern_processor_outside_total"]').val(list_users_outside.length)
                                            $('input[name="pattern_processor_outside_id"]').val(list_users_outside.map(e => e['id']))
                                            for (var k = 0; k < $('span#users_outside').children().length; k++) {
                                                if (result[0].acc_id == $('span#users_outside').children()[k].getAttribute('data-mark')) {
                                                    $('span#users_outside').children()[k].remove()
                                                }
                                            }
                                            if ($('input[name="pattern_processor_outside_total"]').val() == 0) {
                                                $('span#users_outside').empty()
                                            }
                                            $('#table-body-users-1').empty()
                                            buildTable()
                                        })
                                    })
                                }
                            }
                        })
                    })
                } else {
                    $('span#process_outside').empty()
                    $('span#users_outside').empty()
                    $('input[name="pattern_processor_outside_total"]').val(null)
                    $('input[name="pattern_processror_outside_name"]').val(null)
                    list_users_outside = []
                }
            } else if (clickCheckBox.attr('id') == 'customCheck3') {
                if (clickCheckBox.is(':checked') == true) {
                    $.post('/pattern/checkPattern', { value: "@lltraP@tternCheckP@ttern", id: $('form#form_edit').attr('data-mark') }).done(function (result) {
                        clickCheckBox.css('vertical-align', '-5px');
                        $('span#total_stop_time').html(`
                &emsp;&emsp;&emsp;เมื่อหมดระยะเวลาจัดเก็บข้อมูลจะเก็บข้อมูลต่อไปอีกเป็นระยะเวลา &nbsp; <input type="number" min="1" name="pattern_set_end_date_total" value="${parseInt(result[0].pattern_set_end_date_total)}" placeholder="กรุณาป้อนจำนวนระยะเวลา..." class="form-control" style="display: inline; width: 20%;" /> &nbsp;วัน ถือการสิ้นสุดจะเป็นการเตรียมทำลายข้อมูลและไม่มีการใช้ข้อมูลเพื่อกรประมวลผล
                `)
                    })
                } else {
                    $(clickCheckBox).css('margin-top', '0.3%')
                    $('span#total_stop_time').empty()
                }
            } else if (clickCheckBox.attr('id') == 'customCheck4') {
                let windows = ""
                let linix = ""
                if (result[0].pattern_type_data_file_of_path == 0) {
                    linux = "checked"
                } else if (result[0].pattern_type_data_file_of_path == 1) {
                    windows = "checked"
                }
                if (clickCheckBox.is(':checked') == true) {
                    $('label[for="customCheck4"]').css('margin-bottom', "2%");
                    $('span#file_path').html(`
                <br/>&emsp;&emsp;&emsp;<input type="radio" id="customeRaido1" name="pattern_type_data_file_of_path" value='1' class="form-check-input" ${windows}/>
                <label class='form-check-label h6' for='customeRaido1' stype='font-weight: bold;'>Windows</label><br/>
                &emsp;&emsp;&emsp;<input type="radio" id="customeRaido2" name="pattern_type_data_file_of_path" value="0" class="form-check-input" ${linux}/>
                <label class='form-check-label h6' for='customeRaido2' stype='font-weight: bold;'>Linux</label>
                `)
                    if (document.getElementById('customeRaido2').checked == true || document.getElementById('customeRaido1').checked == true) {
                        $('span#path').html(`<input type="text" name="pattern_type_data_file_path" value="${result[0].pattern_type_data_file_path}" placeholder="กรุณาป้อนที่อยู่ไฟล์" class="form-control" style="margin-left: 10%; width: 78%;"></input>`)
                    }
                } else {
                    $('label[for="customCheck4"]').css('margin-bottom', "0%");
                    $('span#path').empty()
                    $('span#file_path').empty()
                }
            } else if (clickCheckBox.attr('id') == 'customCheck5') {
                if (clickCheckBox.is(':checked') == true) {
                    $('label[for="customCheck5"]').css('margin-bottom', '0%');
                    $('input#customCheck4').css('margin-top', "2%")
                    $('label[for="customCheck4"]').css('margin-top', '2%')
                    $('span#database').html(`<input type="text" name="pattern_type_data_database_name" value="${result[0].pattern_type_data_database_name}" placeholder="กรุณาป้อนDatabase.." class="form-control" style="display: inline; width: 37%; margin-left: 1%;" ></input>`)
                } else {
                    $('label[for="customCheck5"]').css('margin-bottom', '0%');
                    $('input#customCheck4').css('margin-top', "0%")
                    $('label[for="customCheck4"]').css('margin-top', '0%')
                    $('span#database').empty()
                }
            } else if (clickCheckBox.attr('id') == 'customCheck7') {
                if (clickCheckBox.is(':checked') == true) {
                    $(clickCheckBox).css('vertical-align', "-5px");
                    $('input#customCheck6').css('margin-top', '2%')
                    $('label[for="customCheck6"]').css('margin-top', '1.7%')
                    $('span#outside_storage_method').html(`<input type="text" name="pattern_storage_method_outside_name" value="${result[0].pattern_storage_method_outside_name}" placeholder="กรุณาป้อนภายนอก.." class="form-control" style="display: inline; width: 36.7%;" >`)
                    let device = new Array(2)
                    let agent = new Array(2)
                    let db_out = new Array(2)
                    if (result[0].pattern_storage_method_outside_device == 1) {
                        device[0] = "checked"
                        device[1] = result[0].pattern_storage_method_outside_device_name
                    }
                    if (result[0].pattern_storage_method_outside_agent == 1) {
                        agent[0] = "checked"
                        agent[1] = result[0].pattern_storage_method_outside_agent_name
                    }
                    if (result[0].pattern_storage_method_outside_database_outside == 1) {
                        db_out[0] = "checked"
                        db_out[1] = result[0].pattern_storage_method_outside_database_outside_name
                    }
                    $('span#outside_option-storage_method').html(`
            <div class="">
                <p style="margin-left: 8%;">
                    <input type="checkbox" id="customCheck8" name="pattern_storage_method_outside_device" class="form-check-input" style="vertical-align: middle;" ${device[0]}>
                    <label class="form-check-label" for="customCheck8" style="vertical-align: middle;">
                        อุปกรณ์                   
                    </label>
                    &nbsp; <input type="text" name="pattern_storage_method_outside_device_name" value="${device[1]}" placeholder="กรุณาเลือกอุปกรณ์.." class="form-control" style="width: 36.7%; display: inline; margin-top: 1%;" hidden/><!-- readonly --> &nbsp; 
                    <a href="#select-device" class="option-pattern" hidden>เลือกอุปกรณ์</a></span>    
                </p>
                <p style="margin-left: 8%;">
                    <input type="checkbox" id="customCheck9" name="pattern_storage_method_outside_agent" class="form-check-input" style="vertical-align: middle;" ${agent[0]}>
                    <label class="form-check-label" for="customCheck9" style="vertical-align: middle;">
                        Agent &nbsp; &nbsp;  
                    </label>
                    <input type="text" name="pattern_storage_method_outside_agent_name" value="${agent[1]}" placeholder="กรุณาเลือกAgent.." class="form-control" style="width: 36.7%; display: inline;" hidden/><!-- readonly --> &nbsp;
                    <a href="#select-agent" data-bs-toggle="modal" class="option-pattern" hidden>เลือก Agent</a></span>
                </p>
                <p style="margin-left: 8%;">
                    <input type="checkbox" id="customCheck10" name="pattern_storage_method_outside_database_outside" class="form-check-input" style="vertical-align: middle;" ${db_out[0]}/>
                    <label class="form-check-label" for="customCheck10" style="vertical-align: middle;">
                        Database ภายนอก 
                    </label>
                    &nbsp; <input type="text" name="pattern_storage_method_outside_database_outside_name" value="${db_out[1]}" placeholder="กรุณาจัดการConfig.." class="form-control" style="width: 36.7%; display: inline; margin-top: 0%;" hidden/><!-- readonly --> &nbsp; 
                    <a href="#select-db-out" class="option-pattern" hidden>รายละเอียด Config</a></span> 
                </p>
            </div>
            `)
                    if (device[0] == "checked") {
                        $('input[name="pattern_storage_method_outside_device_name"]').removeAttr('hidden')
                        $('a[href="#select-device"]').removeAttr('hidden')
                    }
                    if (agent[0] == "checked") {
                        $('input[name="pattern_storage_method_outside_agent_name"]').removeAttr('hidden')
                        $('a[href="#select-agent"]').removeAttr('hidden')
                        count_click6 += 1
                        $.post('/pattern/selectAgent', { value: "P@tternSe1ect@gent" }).done(function (result) {
                            // ============================== Create Prepare ============================
                            var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

                            var state = {
                                'querySet': result.agent,
                                'page': 1,
                                'rows': 5,
                                'window': 5,
                            }
                            if (count_click6 == 1) {
                                buildTable()
                            }
                            function pagination(querySet, page, rows) {
                                var trimStart = (page - 1) * rows
                                var trimEnd = trimStart + rows

                                var trimmedData = querySet.slice(trimStart, trimEnd)

                                var pages = Math.ceil(querySet.length / rows);
                                var start_count = 1
                                document.getElementById('start-agent').innerHTML = start_count

                                return {
                                    'querySet': trimmedData,
                                    'pages': pages,
                                }
                            }
                            // ============================== Create Pagination ============================
                            function pageButtons(pages) {
                                var wrapper = document.getElementById('pagination-wapper-agent')
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
                                    $('#table-body-agent').empty()
                                    state.page = Number($(this).val())
                                    buildTable()
                                })
                            }
                            // ============================== Create Table ============================
                            function buildTable() {
                                var table = $('#table-body-agent')
                                var data = pagination(state.querySet, state.page, state.rows)
                                var myList = data.querySet
                                for (y in myList) {
                                    if (myList[y].agent_manage_id != "") {
                                        var buttonAdd = ''
                                        var buttonDel = ''
                                        if (state.page == 1) {
                                            if ($('input[name="pattern_storage_method_outside_agent_name"]').val() != result.id_agent[y].agent_manage_id) {
                                                buttonAdd = '<a id="_add_agent" href="javascript:void(0);" data-value=' + result.id_agent[y].agent_manage_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                            } else {
                                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                                buttonDel = '<a id="_del_agent" href="javascript:void(0);" data-value=' + result.id_agent[y].agent_manage_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            }
                                        } else {
                                            if ($('input[name="pattern_storage_method_outside_agent_name"]').val() != result.id_agent[parseInt(state.rows) + parseInt(y)].agent_manage_id) {
                                                buttonAdd = '<a id="_add_agent" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].agent_manage_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                            } else {
                                                buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                                buttonDel = '<a id="_del_agent" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].agent_manage_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                            }
                                        }
                                        //Keep in mind we are using "Template Litterals to create rows"
                                        var row = '<tr>' +
                                            '<th style="text-align: left; vertical-align: center;">' +
                                            'ชื่อ: ' + myList[y].agent_name + " (" + myList[y].name + ")" + " <br/>" +
                                            '</th>' +
                                            '<td style="vertical-align: middle; width: 50px;">' +
                                            buttonAdd +
                                            '</td>' +
                                            '<td style="vertical-align: middle; width: 50px;">' +
                                            buttonDel +
                                            '</td>' +
                                            '</tr>'
                                        table.append(row)
                                        end_count = myList[y].agent_manage_id
                                    }
                                }
                                if (myList.length == 0) {
                                    var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                                    table.append(row)
                                    $('#total-agent').text(0)
                                    $('#start-agent').text(0)
                                } else {
                                    if (myList[0].acc_id != "") {
                                        $('#start-agent').text(myList[0].agent_manage_id)
                                    }
                                    pageButtons(data.pages)
                                    $('#total-agent').text(result.agent.length)
                                }
                                $('#end-agent').text(end_count)
                                // end_count = table.find('tr').length

                                $('a#_add_agent').on('click', function () {
                                    var selected = $(this).attr('data-value')
                                    $.post('/pattern/getAgent', { value: "P@tternGet@gent", id: selected }).done(function (result) {
                                        $('input[name="pattern_storage_method_outside_agent_name"]').val(result[0].agent_manage_id)
                                        $('div#select-agent').modal('hide')
                                        $('#table-body-agent').empty()
                                        buildTable()
                                    })
                                })
                                $('a#_del_agent').on('click', function () {
                                    var selected = $(this).attr('data-value')
                                    $.post('/pattern/getAgent', { value: "P@tternGet@gent", id: selected }).done(function (result) {
                                        $('input[name="pattern_storage_method_outside_agent_name"]').val(null)
                                        $('#table-body-agent').empty()
                                        buildTable()
                                    })
                                })
                            }
                        })
                    }
                    if (db_out[0] == "checked") {
                        $('input[name="pattern_storage_method_outside_database_outside_name"]').removeAttr('hidden')
                        $('a[href="#select-db-out"]').removeAttr('hidden')
                    }
                    let check0 = 1;
                    let check1 = 1;
                    let check2 = 1;
                    $('input#customCheck8').on('click', function () {
                        if (device[0] == "checked") {
                            check0 -= 1
                        }
                        if (check0 == 0) {
                            $('input[name="pattern_storage_method_outside_device_name"]').val(null)
                            $('input[name="pattern_storage_method_outside_device_name"]').attr('hidden', true)
                            $('a[href="#select-device"]').attr('hidden', true)
                        } else {
                            $('input[name="pattern_storage_method_outside_device_name"]').removeAttr('hidden')
                            $('input[name="pattern_storage_method_outside_device_name"]').val(device[1])
                            $('a[href="#select-device"]').removeAttr('hidden')
                            check0 = 1
                        }
                    })
                    $('input#customCheck9').on('click', function () {
                        if (agent[0] == "checked") {
                            check1 -= 1
                        }
                        if (check1 == 0) {
                            $('input[name="pattern_storage_method_outside_agent_name"]').val(null)
                            $('input[name="pattern_storage_method_outside_agent_name"]').attr('hidden', true)
                            $('a[href="#select-agent"]').attr('hidden', true)
                        } else {
                            $('input[name="pattern_storage_method_outside_agent_name"]').removeAttr('hidden')
                            $('input[name="pattern_storage_method_outside_agent_name"]').val(agent[1])
                            $('a[href="#select-agent"]').removeAttr('hidden')
                            count_click6 += 1
                            $.post('/pattern/selectAgent', { value: "P@tternSe1ect@gent" }).done(function (result) {
                                // ============================== Create Prepare ============================
                                var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า

                                var state = {
                                    'querySet': result.agent,
                                    'page': 1,
                                    'rows': 5,
                                    'window': 5,
                                }
                                if (count_click6 == 1) {
                                    buildTable()
                                }
                                function pagination(querySet, page, rows) {
                                    var trimStart = (page - 1) * rows
                                    var trimEnd = trimStart + rows

                                    var trimmedData = querySet.slice(trimStart, trimEnd)

                                    var pages = Math.ceil(querySet.length / rows);
                                    var start_count = 1
                                    document.getElementById('start-agent').innerHTML = start_count

                                    return {
                                        'querySet': trimmedData,
                                        'pages': pages,
                                    }
                                }
                                // ============================== Create Pagination ============================
                                function pageButtons(pages) {
                                    var wrapper = document.getElementById('pagination-wapper-agent')
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
                                        $('#table-body-agent').empty()
                                        state.page = Number($(this).val())
                                        buildTable()
                                    })
                                }
                                // ============================== Create Table ============================
                                function buildTable() {
                                    var table = $('#table-body-agent')
                                    var data = pagination(state.querySet, state.page, state.rows)
                                    var myList = data.querySet
                                    for (y in myList) {
                                        if (myList[y].agent_manage_id != "") {
                                            var buttonAdd = ''
                                            var buttonDel = ''
                                            if (state.page == 1) {
                                                if ($('input[name="pattern_storage_method_outside_agent_name"]').val() != result.id_agent[y].agent_manage_id) {
                                                    buttonAdd = '<a id="_add_agent" href="javascript:void(0);" data-value=' + result.id_agent[y].agent_manage_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                    buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                                } else {
                                                    buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                                    buttonDel = '<a id="_del_agent" href="javascript:void(0);" data-value=' + result.id_agent[y].agent_manage_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                }
                                            } else {
                                                if ($('input[name="pattern_storage_method_outside_agent_name"]').val() != result.id_agent[parseInt(state.rows) + parseInt(y)].agent_manage_id) {
                                                    buttonAdd = '<a id="_add_agent" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].agent_manage_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                    buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i><span>'
                                                } else {
                                                    buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></i><span>'
                                                    buttonDel = '<a id="_del_agent" href="javascript:void(0);" data-value=' + result.id_users[parseInt(state.rows) + parseInt(y)].agent_manage_id + ' class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                                }
                                            }
                                            //Keep in mind we are using "Template Litterals to create rows"
                                            var row = '<tr>' +
                                                '<th style="text-align: left; vertical-align: center;">' +
                                                'ชื่อ: ' + myList[y].agent_name + " (" + myList[y].name + ")" + " <br/>" +
                                                '</th>' +
                                                '<td style="vertical-align: middle; width: 50px;">' +
                                                buttonAdd +
                                                '</td>' +
                                                '<td style="vertical-align: middle; width: 50px;">' +
                                                buttonDel +
                                                '</td>' +
                                                '</tr>'
                                            table.append(row)
                                            end_count = myList[y].agent_manage_id
                                        }
                                    }
                                    if (myList.length == 0) {
                                        var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
                                        table.append(row)
                                        $('#total-agent').text(0)
                                        $('#start-agent').text(0)
                                    } else {
                                        if (myList[0].acc_id != "") {
                                            $('#start-agent').text(myList[0].agent_manage_id)
                                        }
                                        pageButtons(data.pages)
                                        $('#total-agent').text(result.agent.length)
                                    }
                                    $('#end-agent').text(end_count)
                                    // end_count = table.find('tr').length

                                    $('a#_add_agent').on('click', function () {
                                        var selected = $(this).attr('data-value')
                                        $.post('/pattern/getAgent', { value: "P@tternGet@gent", id: selected }).done(function (result) {
                                            $('input[name="pattern_storage_method_outside_agent_name"]').val(result[0].agent_manage_id)
                                            $('div#select-agent').modal('hide')
                                            $('#table-body-agent').empty()
                                            buildTable()
                                        })
                                    })
                                    $('a#_del_agent').on('click', function () {
                                        var selected = $(this).attr('data-value')
                                        $.post('/pattern/getAgent', { value: "P@tternGet@gent", id: selected }).done(function (result) {
                                            $('input[name="pattern_storage_method_outside_agent_name"]').val(null)
                                            $('#table-body-agent').empty()
                                            buildTable()
                                        })
                                    })
                                }
                            })
                            check1 = 1
                        }
                    })
                    $('input#customCheck10').on('click', function () {
                        if (db_out[0] == "checked") {
                            check2 -= 1
                        }
                        if (check2 == 0) {
                            $('input[name="pattern_storage_method_outside_database_outside_name"]').val(null)
                            $('input[name="pattern_storage_method_outside_database_outside_name"]').attr('hidden', true)
                            $('a[href="#select-db-out"]').attr('hidden', true)
                        } else {
                            $('input[name="pattern_storage_method_outside_database_outside_name"]').removeAttr('hidden')
                            $('input[name="pattern_storage_method_outside_database_outside_name"]').val(db_out[1])
                            $('a[href="#select-db-out"]').removeAttr('hidden')
                            check2 = 1
                        }
                    })
                } else {
                    $('input#customCheck6').css('margin-top', '0%')
                    $('label[for="customCheck6"]').css('margin-top', '0%')
                    $('span#outside_storage_method').empty()
                    $('span#outside_option-storage_method').empty()
                }
            }
        })
        $('input:radio').on('click', function () {
            if (clickCheckBox.attr('name') == "pattern_type_data_file_of_path") {
                $('span#path').html(`<br/><input type="text" name="pattern_type_data_file_path" value="${result[0].pattern_type_data_file_path}" placeholder="กรุณาป้อนที่อยู่ไฟล์" class="form-control"></input>`)
            }
        })
    })
    // ========================= Modals Add Policy =====================================
    var count_click1 = 0
    $('a[href="#add-policy"]').on('click', function () {
        $.ajax({
            url: '/policy',
            method: "POST",
            data: { value: 1 },
            success: function (result) {
                count_click1 += 1
                // ============================== Create Prepare ============================
                var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                var state = {
                    'querySet': result.policy,
                    'page': 1,
                    'rows': 2,
                    'window': 5,
                }
                if (count_click1 == 1 && ($('input[name="doc_id"]').val() == "" || $('input[name="doc_id"]').val() == null)) {
                    buildTable()
                } else {
                    $('#table-body-policy-add').empty()
                    buildTable()
                }
                function pagination(querySet, page, rows) {

                    var trimStart = (page - 1) * rows
                    var trimEnd = trimStart + rows

                    var trimmedData = querySet.slice(trimStart, trimEnd)

                    var pages = Math.ceil(querySet.length / rows);

                    var start_count = 1
                    document.getElementById('start-policy-add').innerHTML = start_count

                    return {
                        'querySet': trimmedData,
                        'pages': pages,
                    }
                }
                // ============================== Create Pagination ============================
                function pageButtons(pages) {
                    var wrapper = document.getElementById('pagination-wapper-policy-add')
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
                        $('#table-body-policy-add').empty()
                        state.page = Number($(this).val())
                        // document.getElementById('page').value = state.page
                        buildTable()
                    })
                }
                // ============================== Create Table ============================
                function buildTable() {
                    var table = $('#table-body-policy-add')
                    var data = pagination(state.querySet, state.page, state.rows)
                    var myList = data.querySet
                    for (y in myList) {
                        if (myList[y].doc_id != "" && myList[y].doc_action != 1 && myList[y].doc_status == 2) {
                            var total_page = 0
                            for (var x = 0; x < result.page.length; x++) {
                                if (result.page[x].doc_id == result.id_document[y].doc_id) {
                                    total_page = x + 1
                                }
                            }
                            var buttonAdd = ""
                            var buttonDel = ""
                            if (state.page == 1) {
                                if (result.id_document[y].doc_id == $('input[name="doc_id"]').val()) {
                                    buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                } else {
                                    buttonAdd = '<a id="_add_" href="javascript:void(0);" data-value=' + result.id_document[y].doc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                }
                                if (result.id_document[y].doc_id != $('input[name="doc_id"]').val()) {
                                    buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                } else {
                                    buttonDel = '<a id="_del_" href="javascript:void(0);" data-value=' + result.id_document[y].doc_id + '  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                }
                            } else {
                                if (result.id_document[parseInt(state.rows) + parseInt(y)].doc_id == $('input[name="doc_id"]').val()) {
                                    buttonAdd = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                } else {
                                    buttonAdd = '<a id="_add_" href="javascript:void(0);" data-value=' + result.id_document[parseInt(state.rows) + parseInt(y)].doc_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                }
                                if (result.id_document[parseInt(state.rows) + parseInt(y)].doc_id != $('input[name="doc_id"]').val()) {
                                    buttonDel = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                } else {
                                    buttonDel = '<a id="_del_" href="javascript:void(0);" data-value=' + result.id_document[parseInt(state.rows) + parseInt(y)].doc_id + '  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                }
                            }
                            //Keep in mind we are using "Template Litterals to create rows"
                            var row = '<tr>' +
                                '<th style="vertical-align: center; text-align: left;">' +
                                'เอกสาร: ' + myList[y].doc_name + " <br/>" +
                                'ประเภท: ' + myList[y].doc_type_name + " <br/>" +
                                'จำนวนหน้าทั้งหมด: ' + total_page + " หน้า <br/>" +
                                '</th>' +
                                '<td style="vertical-align: middle; width: 50px;">' +
                                buttonAdd +
                                '</td>' +
                                '<td style="vertical-align: middle; width: 50px;">' +
                                buttonDel +
                                '</td>' +
                                '</tr>'
                            table.append(row)
                            end_count = myList[y].doc_id
                        }
                    }
                    if (myList.length == 0) {
                        var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                        table.append(row)
                        $('#total-policy-add').text(0)
                        $('#start-policy-add').html(0)
                    } else {
                        if (myList[0].doc_id != "" && myList[0].doc_action != 1 && myList[0].doc_status == 2) {
                            $('#start-policy-add').text(myList[0].doc_id)
                        }
                        pageButtons(data.pages)
                        $('#total-policy-add').text(result.policy.length)
                    }
                    $('#end-policy-add').html(end_count)
                    $('a#_add_').on('click', function () {
                        $.post('/policy/select-policy', { value: 'P@tternSe1ectP01icy', id: $(this).attr('data-value') }).done(function (result) {
                            $.ajax({
                                url: "/policy/get",
                                method: "POST",
                                data: { id: result[0].doc_id },
                                success: function (result) {
                                    var data_tag = []
                                    for (i in result._data_) {
                                        if (result._data_[i].data_tag != null) {
                                            data_tag.push(result._data_[i].data_tag)
                                        }
                                    }
                                    var convert_data_tag = new Set([...data_tag])
                                    var join_convert_data_tag = [...convert_data_tag].join(',')
                                    var split_convert_data_tag = join_convert_data_tag.split(',')
                                    var success_data_tag = new Set([...split_convert_data_tag])
                                    if ($("input[name='pattern_tag']").val() == "" && $('input[name="doc_id"]').val() == "") {
                                        $("input[name='pattern_tag']").val([...success_data_tag].join(','))
                                        $('a#previewer').attr({
                                            'href': '/show_slide/' + result.get_value,
                                            'target': "_blank",
                                            'rel': "noopener noreferrer",
                                            'aria-disabled': "false",
                                            'class': "btn btn-info"
                                        })
                                        $('input[name="doc_id"]').val(result.get_value)
                                        check_doc_id();
                                        $('div#add-policy').modal('hide')
                                    } else if ($("input[name='pattern_tag']").val() != "" && $('input[name="doc_id"]').val() == "") {
                                        var old_tag = $("input[name='pattern_tag']").val().split(',')
                                        var new_tag = Array.from([...success_data_tag])
                                        var convert_old_tag = new Set([...old_tag, ...new_tag])
                                        $("input[name='pattern_tag']").val([...convert_old_tag].join(','))
                                        $('a#previewer').attr({
                                            'href': '/show_slide/' + result.get_value,
                                            'target': "_blank",
                                            'rel': "noopener noreferrer",
                                            'aria-disabled': "false",
                                            'class': "btn btn-info"
                                        })
                                        $('input[name="doc_id"]').val(result.get_value)
                                        check_doc_id();
                                        $('div#add-policy').modal('hide')
                                    } else if ($("input[name='pattern_tag']").val() == "" && $('input[name="doc_id"]').val() != "") {
                                        var old_tag = $("input[name='pattern_tag']").val().split(',')
                                        var new_tag = Array.from([...success_data_tag])
                                        var convert_old_tag = new Set([...old_tag, ...new_tag])
                                        $("input[name='pattern_tag']").val([...convert_old_tag].join(','))
                                        $('a#previewer').attr({
                                            'href': '/show_slide/' + result.get_value,
                                            'target': "_blank",
                                            'rel': "noopener noreferrer",
                                            'aria-disabled': "false",
                                            'class': "btn btn-info"
                                        })
                                        $('input[name="doc_id"]').val(result.get_value)
                                        check_doc_id();
                                        $('div#add-policy').modal('hide')
                                    } else if ($("input[name='pattern_tag']").val() != "" && $('input[name="doc_id"]').val() != "") {
                                        var old_tag = $("input[name='pattern_tag']").val().split(',')
                                        var new_tag = Array.from([...success_data_tag])
                                        var convert_old_tag = new Set([...old_tag, ...new_tag])
                                        $("input[name='pattern_tag']").val([...convert_old_tag].join(','))
                                        $('a#previewer').attr({
                                            'href': '/show_slide/' + result.get_value,
                                            'target': "_blank",
                                            'rel': "noopener noreferrer",
                                            'aria-disabled': "false",
                                            'class': "btn btn-info"
                                        })
                                        $('input[name="doc_id"]').val(result.get_value)
                                        check_doc_id();
                                        $('div#add-policy').modal('hide')
                                    }
                                }
                            })
                        })
                    })
                    $('a#_del_').on('click', function () {
                        $('input[name="doc_id"]').val(null)
                        check_doc_id()
                        $('a#previewer').attr({
                            'href': 'javascript:void(0);',
                            'aria-disabled': "true",
                            'class': "btn btn-secondary"
                        })
                        var old_tag = new Set($("input[name='pattern_tag']").val().split(','))
                        $.post('/policy/select-policy', { value: "P@tternSe1ectP01icy", id: $(this).attr('data-value') }).done(function (result) {
                            $.ajax({
                                url: "/policy/get/",
                                method: "POST",
                                data: { id: result.doc_id },
                                success: function (result) {
                                    var data_tag = []
                                    for (i in result._data_) {
                                        if (result._data_[i].data_tag != null) {
                                            data_tag.push(result._data_[i].data_tag)
                                        }
                                    }
                                    var string_data_tag = data_tag.join(',')
                                    var backward = string_data_tag.split(',')
                                    var convert_data_tag = new Set([...backward])
                                    if (eqSet(old_tag, convert_data_tag) == true) {
                                        $("input[name='pattern_tag']").val(null)
                                        $('#table-body-policy-add').empty()
                                        buildTable()
                                    } else if (eqSet(old_tag, convert_data_tag) == false) {
                                        var convert_old_tag = Array.from([...old_tag])
                                        var backward_data_tag = Array.from([...convert_data_tag])
                                        var new_data_tag = convert_old_tag.filter(function (item) { return backward_data_tag.indexOf(item) == -1 })
                                        $("input[name='pattern_tag']").val(new_data_tag)
                                        $('#table-body-policy-add').empty()
                                        buildTable()
                                    }
                                }
                            })
                        })
                    })
                }
            }
        })
    })
    // ============================ Modal Add Tags ========================================
    var count_click2 = 0
    $('a#btn-add-tags').on('click', function () {
        $.ajax({
            url: '/tag',
            method: "POST",
            data: { value: 1 },
            success: function (result) {
                count_click2 += 1
                // ============================== Create Prepare ============================
                var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                var state = {
                    'querySet': result.tag,
                    'page': 1,
                    'rows': 5,
                    'window': 5,
                }
                if (count_click2 == 1 && ($('input[name="pattern_tag"]').val() == "" || $('input[name="pattern_tag"]').val() == null)) {
                    buildTable()
                } else {
                    $('#table-body-tag-add').empty()
                    buildTable()
                }
                function pagination(querySet, page, rows) {

                    var trimStart = (page - 1) * rows
                    var trimEnd = trimStart + rows

                    var trimmedData = querySet.slice(trimStart, trimEnd)

                    var pages = Math.ceil(querySet.length / rows);

                    var start_count = 1
                    document.getElementById('start-tag-add').innerHTML = start_count

                    return {
                        'querySet': trimmedData,
                        'pages': pages,
                    }
                }
                // ============================== Create Pagination ============================
                function pageButtons(pages) {
                    var wrapper = document.getElementById('pagination-wapper-tag-add')
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
                        $('#table-body-tag-add').empty()
                        state.page = Number($(this).val())
                        // document.getElementById('page').value = state.page
                        buildTable()
                    })
                }
                // ============================== Create Table ============================
                function buildTable() {
                    var table = $('#table-body-tag-add')
                    var data = pagination(state.querySet, state.page, state.rows)
                    var myList = data.querySet
                    for (y in myList) {
                        if (myList[y].tag_id != "") {
                            var buttonAdd_tag = ""
                            var buttonDel_tag = ""
                            var old_value = $('input[name="pattern_tag"]').val().split(',')
                            if (checkTag(old_value, myList[y].tag_name, 0) == true) {
                                buttonAdd_tag = '<span class="btn btn-secondary"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></span>'
                                buttonDel_tag = '<a id="_del_tag_" href="javascript:void(0);" data-value="' + myList[y].tag_name + '"  class="btn btn-danger"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></a>'
                            } else {
                                buttonAdd_tag = '<a id="_add_tag_" href="javascript:void(0);" data-value=' + myList[y].tag_id + ' class="btn btn-success"><i class="icon-plus" style="font-size: 25px; vertical-align: middle;"></i></a>'
                                buttonDel_tag = '<span class="btn btn-secondary"><i class="icon-close" style="font-size: 25px; vertical-align: middle;"></i></span>'
                            }
                            //Keep in mind we are using "Template Litterals to create rows"
                            var row = '<tr>' +
                                '<th style="vertical-align: center;">' +
                                'ชื่อ: ' + myList[y].tag_name + " <br/>" +
                                '</th>' +
                                '<td style="vertical-align: middle; width: 50px;">' +
                                buttonAdd_tag +
                                '</td>' +
                                '<td style="vertical-align: middle; width: 50px;">' +
                                buttonDel_tag +
                                '</td>' +
                                '</tr>'
                            table.append(row)
                            end_count = myList[y].tag_id
                        }
                    }
                    if (myList.length == 0) {
                        var row = '<tr class="odd"><td valign="top" colspan="9" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                        table.append(row)
                        $('#start-tag-add').html(0)
                        $('#total-tag-add').text(0)
                    }
                    $('#end-tag-add').html(end_count)
                    if (myList[0].tag_id != "") {
                        $('#start-tag-add').html(myList[0].tag_id)
                    }
                    $('#total-tag-add').text(result.tag.length)
                    pageButtons(data.pages)
                    $('a#_add_tag_').on('click', function () {
                        var tag_id = parseInt($(this).attr('data-value'))
                        $.ajax({
                            url: "/tag",
                            method: "POST",
                            data: { value: 1 },
                            success: function (result) {
                                for (k in result.tag) {
                                    if (result.tag[k].tag_id == tag_id) {
                                        if ($('input[name="pattern_tag"]').val() != "") {
                                            var old_value = $('input[name="pattern_tag"]').val().split(",")
                                            old_value.push(result.tag[k].tag_name)
                                            var convert_old_value = new Set([...old_value])
                                            var join_convert_tag = [...convert_old_value].join(',')
                                            $('input[name="pattern_tag"]').val(join_convert_tag)
                                        } else {
                                            $('input[name="pattern_tag"]').val(result.tag[k].tag_name)
                                        }
                                    }
                                }
                            }
                        }).done(function () {
                            $('#table-body-tag-add').empty()
                            buildTable()
                        })
                    })
                    $('a#_del_tag_').on('click', function () {
                        var old_tag = $('input[name="pattern_tag"]').val().split(',')
                        var tag = $(this).attr('data-value')
                        var new_tag = old_tag.filter(function (item) { return item != tag })
                        $('input[name="pattern_tag"]').val(new_tag)
                        $('#table-body-tag-add').empty()
                        buildTable()
                    })
                }
            }
        })
    })
    // ============================ (Clear All Tags) ======================================
    // $('input[name="pattern_tag"]').on('click keyup keydown focus', function () {
    //     if ($(this).val() == "") {
    //         $('input[name="doc_id"]').val(null)
    //         $('a#previewer').removeAttr('target')
    //         $('a#previewer').removeAttr('_ref')
    //         $('a#previewer').attr({
    //             'href': 'javascript:void(0);',
    //             'aria-disabled': "true",
    //             'class': "btn btn-secondary"
    //         })
    //     }
    // })
    // var count_click3 = 0
    // ========================= Modal Add Processing_base ================================
    $('a#btn_add_processing_base').on('click', function () {
        $('a#add_processing_base').on('click', function () {
            if ($('input[name="pattern_processing_base_name"]').val() != "") {
                var name = $('input[name="pattern_processing_base_name"]').attr('name')
                var value = $('input[name="pattern_processing_base_name"]').val()
                var obj = {}
                obj[name] = value
                $.ajax({
                    url: '/processing_base',
                    method: "POST",
                    data: obj,
                }).done(function () {
                    $('input[name="pattern_processing_base_name"]').val(null);
                    $('div#add-processing-base').modal('hide');
                    $('#select_processing_base').load(document.URL + ' #select_processing_base');
                    // $('#select_processing_base').load(location.href + "#select_processing_base")
                })
            }
        })
    })
}










// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
$(document).ready(function () {
    // $('input[name="doc_id"]').change(function(){
    // })


    // $('input[name="doc_id"]').change(function(){
    //   });
});

function check_doc_id() {
    if ($('input[name="doc_id"]').val() != "") {
        // $('#textarea_doc_id').val($('input[name="doc_id"]').val());
        $.ajax({
            type: 'POST',
            url: '/pattern/get/doc_id_detail',
            data: { doc_id: $('input[name="doc_id"]').val() },
            success: function (result) {
                $.each(result, function (i, xxx) {
                    if (xxx.tag.length != 0) {
                        var text_div_text2 = ``;
                        var text_div_text1 = ``;
                        var tbody_table_pattern_data = ``;

                        text_div_text2 += `<br><br><br>`;
                        text_div_text1 += `\nชื่อเอกสาร: ` + xxx.doc.doc_name + `\n`;
                        text_div_text1 += `\nข้อมูลส่วนบุคคล: มี ` + (xxx.tag.length) + ` ข้อมูล\n`;
                        text_div_text1 += `ประเภท: ` + (xxx.doc.doc_type_name) + `\n`;
                        text_div_text1 += `จำนวนหน้าทั้งหมด: มี ` + (xxx.doc.doc_pdpa_document_page) + ` หน้า`;
                        for (let i = 0; i < xxx.tag.length; i++) {

                            tbody_table_pattern_data += `<tr >`
                            tbody_table_pattern_data += `   <td>`
                            tbody_table_pattern_data += `       ` + (i + 1);
                            tbody_table_pattern_data += `   </td>`
                            tbody_table_pattern_data += `   <td>`
                            tbody_table_pattern_data += `       ` + xxx.tag[i].tag_name + ` ( ` + xxx.tag[i].tag_code + ` )`;
                            tbody_table_pattern_data += `   </td>`
                            tbody_table_pattern_data += `   <td>`
                            tbody_table_pattern_data += `       ` + xxx.tag[i].day_start + ` ถึง ` + xxx.tag[i].day_end;
                            tbody_table_pattern_data += `   </td>`
                            tbody_table_pattern_data += `   <td>`
                            tbody_table_pattern_data += `       ` + xxx.tag[i].level_name;
                            tbody_table_pattern_data += `   </td>`
                            tbody_table_pattern_data += `   <td>`
                            tbody_table_pattern_data += `       ` + xxx.tag[i].data_type_name;
                            tbody_table_pattern_data += `   </td>`
                            tbody_table_pattern_data += `   <td>`
                            tbody_table_pattern_data += `       เลือก <input type="checkbox" class="form-check-input" name="doc_id_person_data" value="` + xxx.tag[i].tag_id + `" checked> `;
                            tbody_table_pattern_data += `   </td>`
                            tbody_table_pattern_data += `</tr>`


                            // text_div_text2 += `<br><br>เลือก <input type="checkbox" class="form-check-input" name="doc_id_person_data" value="` + xxx.tag[i].tag_id + `" checked> <br><br><br><br>`;
                            // text_div_text1 += `ลำดับที่ ` + (i + 1) + `<br>`;
                            // text_div_text1 += `      ` + xxx.tag[i].tag_name + ` ( ` + xxx.tag[i].tag_code + ` )<br>`;
                            // text_div_text1 += `      -ระยะเวลา: ` + xxx.tag[i].day_start + ` ถึง ` + xxx.tag[i].day_end + `<br>`;
                            // text_div_text1 += `      -ความเสี่ยง: ` + xxx.tag[i].level_name + `<br>`;
                            // text_div_text1 += `      -ประเภทข้อมูล: ` + xxx.tag[i].data_type_name + `<br>`;
                            // text_div_text1 += `---------------------------------------------------------------------------<br>`;
                        }
                        $('#textarea_doc_id').val(text_div_text1);
                        $('#div_text1').html(text_div_text1);
                        $('#div_text2').html(text_div_text2);
                        $('#tbody_table_pattern_data').html(tbody_table_pattern_data);

                    } else {
                        $('#textarea_doc_id').val('');

                        $('#div_text1').html('ข้อมูลส่วนบุคคล: ไม่มี ข้อมูล');
                        $('#div_text2').html('');
                        $('#tbody_table_pattern_data').html('');


                    }

                });
            },
            error: function (e) {
            }
        });
    } else {
        $('#textarea_doc_id').val("");
        $('#tbody_table_pattern_data').html('');

    }
}



function form_add_pattern_submit() {
    if ($('input[name="pattern_name"]').val() == '') {
        $('input[name="pattern_name"]').focus();
        $('input[name="pattern_name"]').addClass('highlighted');
        setTimeout(function () {
            $('input[name="pattern_name"]').removeClass('highlighted');
        }, 1500);
    } else if ($('input[name="doc_id"]').val() == '') {
        $('#btn-add-policy').focus();
        $('#btn-add-policy').addClass('highlighted');
        setTimeout(function () {
            $('#btn-add-policy').removeClass('highlighted');
        }, 1500);
    } else if ($('input[name="pattern_start_date"]').val() == '') {
        $('input[name="pattern_start_date"]').focus();
        $('input[name="pattern_start_date"]').addClass('highlighted');
        setTimeout(function () {
            $('input[name="pattern_start_date"]').removeClass('highlighted');
        }, 1500);
    } else if ($('input[name="pattern_total_date"]').val() == '') {
        $('input[name="pattern_total_date"]').focus();
        $('input[name="pattern_total_date"]').addClass('highlighted');
        setTimeout(function () {
            $('input[name="pattern_total_date"]').removeClass('highlighted');
        }, 1500);
    } else if ($('#pattern_processing_base_id').val() == null) {
        $('#select_processing_base_table').focus();
        $('#select_processing_base_table').addClass('highlighted');
        setTimeout(function () {
            $('#select_processing_base_table').removeClass('highlighted');
        }, 1500);
    } else {
        $('#form_add_pattern').submit();
    }

}
