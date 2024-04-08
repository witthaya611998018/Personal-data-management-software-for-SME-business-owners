$(function () {
    if (document.getElementById('centralized')) {
        $.ajax({
            method: "POST",
            url: "/log",
            data: { value: 1 },
            success: function (result) {
                if (result.data.length > 1) {
                    // ============================== Create Prepare ============================
                    var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                    var total = 0 // จำนวนทั้งหมดของข้อมูล
                    var state = {
                        'querySet': result.data,
                        'page': 1,
                        'rows': 10,
                        'window': 5,
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
                        // console.log('Pages:', pages)
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
                            if (state.page == 1) {
                                if (myList[y].no != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].ip + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="text-wrap text-break align-top">' + myList[y].msg + '</span></td>' +
                                        '<td class="align-top">' + myList[y].file_name + '</span></td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].no
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            } else {
                                if (myList[y].no != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].ip + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="text-wrap text-break align-top">' + myList[y].msg + '</span></td>' +
                                        '<td class="align-top">' + myList[y].file_name + '</span></td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].no
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            }

                        }
                        $('#end').html(end_count)
                        if (myList.length > 0) {
                            if (myList[0].no != "") {
                                $('#start').html(myList[0].no)
                            } else {
                                $('#start').html(0)
                            }
                        }
                        $('#total-db').html(result.data.length);
                        pageButtons(data.pages)
                        // end_count = table.find('tr').length
                        $('button#button_delete_db').on('click', function () {
                            document.getElementById('form_delete_db').action = "/database_ag/delete" + $(this).attr('data-value')
                            document.getElementById('form_delete_db').submit();
                        })
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
            }
        })
    }

    if (document.getElementById('ajaxfilelog')) {
        $.ajax({
            method: "POST",
            url: "/filelog",
            data: { value: 1 },
            success: function (result) {
                if (result.data.length > 1) {
                    // ============================== Create Prepare ============================
                    var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                    var total = 0 // จำนวนทั้งหมดของข้อมูล

                    var state = {
                        'querySet': result.data,
                        'page': 1,
                        'rows': 10,
                        'window': 5,
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
                        // console.log('Pages:', pages)
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
                            if (state.page == 1) {
                                if (myList[y].no != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].hostname + '</span></td>' +
                                        '<td class="align-top">' + myList[y].device_name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="text-wrap text-break align-top">' + myList[y].hash + '</span></td>' +
                                        '<td class="align-top"><a href=/log/download/' + myList[y].file_id + '>ดาวน์โหลด</a></span></td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].no
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="7" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            } else {
                                if (myList[y].no != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].hostname + '</span></td>' +
                                        '<td class="align-top">' + myList[y].device_name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="text-wrap text-break align-top">' + myList[y].hash + '</span></td>' +
                                        '<td class="align-top"><a href=/log/download/' + myList[y].file_id + '>ดาวน์โหลด</a></span></td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].no
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="7" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            }
                        }
                        $('#end').html(end_count)
                        if (myList.length > 0) {
                            if (myList[0].no != "") {
                                $('#start').html(myList[0].no)
                            } else {
                                ß
                                $('#start').html(0)
                            }
                        }
                        $('#total-db').html(result.data.length);
                        pageButtons(data.pages)
                        // end_count = table.find('tr').length
                        $('button#button_delete_db').on('click', function () {
                            document.getElementById('form_delete_db').action = "/database_ag/delete" + $(this).attr('data-value')
                            document.getElementById('form_delete_db').submit();
                        })
                    }
                } else {
                    var table = $('#table-body')
                    var row = '<tr>' +
                        '<td class="text-center" colspan="7" style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td>' +
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

    if (document.getElementById('ajaxfilesearch')) {
        $.ajax({
            method: "POST",
            url: "/file/ajaxfilesearch",
            data: { day1: day1,day2:day2},
            success: function (result) {
                if (result.data.length > 1) {
                    // ============================== Create Prepare ============================
                    var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                    var total = 0 // จำนวนทั้งหมดของข้อมูล

                    var state = {
                        'querySet': result.data,
                        'page': 1,
                        'rows': 10,
                        'window': 5,
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
                        // console.log('Pages:', pages)

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
                            if (state.page == 1) {
                                if (myList[y].no != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].hostname + '</span></td>' +
                                        '<td class="align-top">' + myList[y].device_name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="text-wrap text-break align-top">' + myList[y].hash + '</span></td>' +
                                        '<td class="align-top"><a href=/log/download/'+myList[y].file_id+'>ดาวน์โหลด</a></span></td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].no
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="7"class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            } else {
                                if (myList[y].no != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].hostname + '</span></td>' +
                                        '<td class="align-top">' + myList[y].device_name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="text-wrap text-break align-top">' + myList[y].hash + '</span></td>' +
                                        '<td class="align-top"><a href=/log/download/'+myList[y].file_id+'>ดาวน์โหลด</a></span></td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].no
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="7"class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            }

                        }
                        $('#end').html(end_count)
                        if (myList.length > 0) {
                            if (myList[0].no != "") {
                                $('#start').html(myList[0].no)
                            } else {
                                $('#start').html(0)
                            }
                        }
                        $('#total-db').html(result.data.length);
                        pageButtons(data.pages)
                        // end_count = table.find('tr').length
                        $('button#button_delete_db').on('click', function () {
                            document.getElementById('form_delete_db').action = "/database_ag/delete" + $(this).attr('data-value')
                            document.getElementById('form_delete_db').submit();
                        })
                    }
                } else {
                    var table = $('#table-body')
                    var row = '<tr>' +
                        '<td class="text-center" colspan="7"style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td>' +
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

    if (document.getElementById('ajex_access_history')) {
        $.ajax({
            method: "POST",
            url: "/access_history",
            data: { value: 1 },
            success: function (result) {
                if (result.data.length > 1) {
                    // ============================== Create Prepare ============================
                    var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                    var total = 0 // จำนวนทั้งหมดของข้อมูล

                    var state = {
                        'querySet': result.data,
                        'page': 1,
                        'rows': 20,
                        'window': 5,
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
                        // console.log('Pages:', pages)

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
                        if(system[0].view_hash_access_history == 'sha256'){
                            var access_type = 'SHA-256'
                        }else if(system[0].view_hash_access_history == 'sha1'){
                            var access_type = 'SHA-1'
                        }else if(system[0].view_hash_access_history == 'md5'){
                            var access_type = 'MD5'
                        }
                        var table = $('#table-body')
                        var data = pagination(state.querySet, state.page, state.rows)
                        var myList = data.querySet
                        for (y in myList) {
                            if (state.page == 1) {
                                if (myList[y].id != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].type + '</span></td>' +
                                        '<td class="align-top">' + myList[y].msg + '</span></td>' +
                                        '</tr><tr><td colspan="5" style="text-align: center;" >' + access_type + ': ' + myList[y].hash + '</td></tr>'
                                    table.append(row)
                                    end_count = myList[y].id
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="5" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            } else {
                                if (myList[y].id != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].type + '</span></td>' +
                                        '<td class="align-top">' + myList[y].msg + '</span></td>' +
                                        '</tr><tr><td colspan="5" style="text-align: center;" >' + access_type + ': ' + myList[y].hash + '</td></tr>'
                                    table.append(row)
                                    end_count = myList[y].id
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="5" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            }

                        }
                        $('#end').html(end_count)
                        if (myList.length > 0) {
                            if (myList[0].id != "") {
                                $('#start').html(myList[0].id)
                            } else {
                                $('#start').html(0)
                            }
                        }
                        $('#total-db').html(result.data.length);
                        pageButtons(data.pages)
                        // end_count = table.find('tr').length
                        $('button#button_delete_db').on('click', function () {
                            document.getElementById('form_delete_db').action = "/database_ag/delete" + $(this).attr('data-value')
                            document.getElementById('form_delete_db').submit();
                        })
                    }
                } else {
                    var table = $('#table-body')
                    var row = '<tr>' +
                        '<td class="text-center" colspan="5" style="color: red;"><span class="text-center">ไม่พบข้อมูล</span></td>' +
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

    if (document.getElementById('centralizedchack')) {

        $.ajax({
            method: "POST",
            url: "/log/check/" + id,
            data: { value: 1 },
            success: function (result) {
                if (result.data.length > 1) {
                    // ============================== Create Prepare ============================
                    var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                    var total = 0 // จำนวนทั้งหมดของข้อมูล

                    var state = {
                        'querySet': result.data,
                        'page': 1,
                        'rows': 10,
                        'window': 5,
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
                        // console.log('Pages:', pages)

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
                            if (state.page == 1) {
                                if (myList[y].no != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].ip + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="text-wrap text-break align-top">' + myList[y].msg + '</span></td>' +
                                        '<td class="align-top">' + myList[y].file_name + '</span></td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].no
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            } else {
                                if (myList[y].no != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].ip + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="text-wrap text-break align-top">' + myList[y].msg + '</span></td>' +
                                        '<td class="align-top">' + myList[y].file_name + '</span></td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].no
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            }

                        }
                        $('#end').html(end_count)
                        if (myList.length > 0) {
                            if (myList[0].no != "") {
                                $('#start').html(myList[0].no)
                            } else {
                                $('#start').html(0)
                            }
                        }
                        $('#total-db').html(result.data.length);
                        pageButtons(data.pages)
                        // end_count = table.find('tr').length
                        $('button#button_delete_db').on('click', function () {
                            document.getElementById('form_delete_db').action = "/database_ag/delete" + $(this).attr('data-value')
                            document.getElementById('form_delete_db').submit();
                        })
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
            }
        })

    }

    if (document.getElementById('centralizedfilter')) {
        $.ajax({
            method: "POST",
            url: "/ajaxfilter/",
            data: { value: query },
            success: function (result) {
                if (result.data.length > 1) {
                    // ============================== Create Prepare ============================
                    var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                    var total = 0 // จำนวนทั้งหมดของข้อมูล

                    var state = {
                        'querySet': result.data,
                        'page': 1,
                        'rows': 10,
                        'window': 5,
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
                        // console.log('Pages:', pages)

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
                            if (state.page == 1) {
                                if (myList[y].no != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].ip + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="text-wrap text-break align-top">' + myList[y].msg + '</span></td>' +
                                        '<td class="align-top">' + myList[y].file_name + '</span></td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].no
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            } else {
                                if (myList[y].no != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].ip + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="text-wrap text-break align-top">' + myList[y].msg + '</span></td>' +
                                        '<td class="align-top">' + myList[y].file_name + '</span></td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].no
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            }

                        }
                        $('#end').html(end_count)
                        if (myList.length > 0) {
                            if (myList[0].no != "") {
                                $('#start').html(myList[0].no)
                            } else {
                                $('#start').html(0)
                            }
                        }
                        $('#total-db').html(result.data.length);
                        pageButtons(data.pages)
                        // end_count = table.find('tr').length
                        $('button#button_delete_db').on('click', function () {
                            document.getElementById('form_delete_db').action = "/database_ag/delete" + $(this).attr('data-value')
                            document.getElementById('form_delete_db').submit();
                        })
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
            }
        })

    }
    if (document.getElementById('centralizedsearch')) {
        
        $.ajax({
            method: "GET",
            url: "/log/search/"+id,
            data: { value: 1 },
            success: function (result) {
                if (result.data.length > 1) {
                    // ============================== Create Prepare ============================
                    var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
                    var total = 0 // จำนวนทั้งหมดของข้อมูล

                    var state = {
                        'querySet': result.data,
                        'page': 1,
                        'rows': 10,
                        'window': 5,
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
                        // console.log('Pages:', pages)

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
                            if (state.page == 1) {
                                if (myList[y].no != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].ip + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="text-wrap text-break align-top">' + myList[y].msg + '</span></td>' +
                                        '<td class="align-top">' + myList[y].file_name + '</span></td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].no
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            } else {
                                if (myList[y].no != "") {
                                    //Keep in mind we are using "Template Litterals to create rows"
                                    var row = '<tr>' +
                                        '<td class="title align-top">' + myList[y].no + '</span></td>' +
                                        '<td class="align-top">' + myList[y].ip + '</span></td>' +
                                        '<td class="align-top">' + myList[y].name + '</span></td>' +
                                        '<td class="align-top">' + myList[y].date + '</span></td>' +
                                        '<td class="text-wrap text-break align-top">' + myList[y].msg + '</span></td>' +
                                        '<td class="align-top">' + myList[y].file_name + '</span></td>' +
                                        '</tr>'
                                    table.append(row)
                                    end_count = myList[y].no
                                } else {
                                    var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่ข้อมูล</td></tr>'
                                    table.append(row)
                                }
                            }

                        }
                        $('#end').html(end_count)
                        if (myList.length > 0) {
                            if (myList[0].no != "") {
                                $('#start').html(myList[0].no)
                            } else {
                                $('#start').html(0)
                            }
                        }
                        $('#total-db').html(result.data.length);
                        pageButtons(data.pages)
                        // end_count = table.find('tr').length
                        $('button#button_delete_db').on('click', function () {
                            document.getElementById('form_delete_db').action = "/database_ag/delete" + $(this).attr('data-value')
                            document.getElementById('form_delete_db').submit();
                        })
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
            }
        })
       
    }


});