
ajax_searchTable0();

$('#datechange').on('change', function () {
    ajax_searchTable();
});

$('.search-key').on('click', function () {
    ajax_searchTable();
});

$('.clicktag').on('click', function () {
    ajax_searchTable();
});

function ajax_searchTable0() {
    var new_date = document.getElementById("datechange").value;
    var keyword_search = (document.getElementById("myInput").value).trim();
    var tag_007 = document.getElementById("tag_007").value;
    console.log("keyword_search", keyword_search);
    document.getElementById('table-body').innerHTML = '';
    $.ajax({
        url: '/personal_data0',
        method: 'POST',
        data: {
            search_datetime: new_date,
            search: keyword_search,
            tag_007: tag_007,
        },
    }).done(function (result) {
        // var _list_ = $('#items2').attr('data-method').split("_");
        // ============================== Create Object ============================
        let data = [];
        for (var i = 0; i < (result.data_id).length; i++) {
            data.push({
                "no": (i + 1),
                "data_id": result.data_id[i],
                "data_type_id": result.data_type_id[i],
                "data_code": result.data_code[i],
                "data_name": result.data_name[i],
                "data_level_id": result.data_level_id[i],
                "data_detail": result.data_detail[i],
                "data_date_start": result.data_date_start[i],
                "data_date_end": result.data_date_end[i],
                "data_location_name": result.data_location_name[i],
                "data_location_detail": result.data_location_detail[i]
            });
        }
        let level = []

        for (var i = 0; i < (result.level_id).length; i++) {
            level.push({
                "level_id": result.level_id[i],
                "level_name": result.level_name[i],
            })
        }

        let data_type1 = []

        for (var i = 0; i < (result.data_type_id1).length; i++) {
            data_type1.push({
                "data_type_id": result.data_type_id1[i],
                "data_type_name": result.data_type_name[i],
            })
        }

        // for (var i = 0; i < block.length; i++) {
        //     let convert_list = block[i].list.split(',')
        //     let list_ = []
        //     for (var j = 0; j < convert_list.length; j += 3) {
        //         list_.push(list(convert_list, j))
        //     }
        //     block[i].list = list_
        // }
        // ============================== Create Prepare ============================
        var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
        var total = 0 // จำนวนทั้งหมดของข้อมูล

        $('#total').html(data.length)
        // state = 
        // querySet : array(15) ,
        // page : rows  = 1:5 

        var state = {
            'querySet': data,
            'page': 1,
            'rows': 50,
            'window': 100000,
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
                // document.getElementById('page').value = state.page
                buildTable()
            })

        }
        function buildTable() {
            var table = $('#table-body')
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var mypages = data.pages
            for (y in myList) {
                if (mypages > 0) {
                    var selected_level = ""
                    var selected_type = ""
                    for (x in data_type1) {
                        if (data_type1[x].data_type_id == myList[y].data_type_id) {
                            selected_type = '<td><b></b> <span>' + data_type1[x].data_type_name + '</span></td>'
                        }
                    }
                    for (x in level) {
                        if (level[x].level_id == myList[y].data_level_id) {
                            selected_level = '<td>' + level[x].level_name + '</td>'
                        }
                    }
                    var date1 = new Date(myList[y].data_date_start.split(' ')[0].split('/').reverse().join('/'))
                    var date2 = new Date(myList[y].data_date_end.split(' ')[0].split('/').reverse().join('/'))
                    const diffTime = Math.abs(date2 - date1);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    var row = '<tr>' +
                        '<td><b>' +
                        '</b> <span>' + myList[y].no + '</span></td>' +
                        selected_type +
                        '<td >' + myList[y].data_code + '</td>' +
                        '<td>' + myList[y].data_name + '</td>' +
                        selected_level +
                        '<td>' + myList[y].data_detail + ` (จำนวน <span style="color: #24e900;">${diffDays + 1}</span> วัน) ` + '<br>' + myList[y].data_date_start + ' - ' + myList[y].data_date_end +
                        '</td>' +
                        `<td>`;
                    var today = new Date();
                    var endday = new Date(myList[y].data_date_end.split(' ')[0].split('/')[2], myList[y].data_date_end.split(' ')[0].split('/')[1], myList[y].data_date_end.split(' ')[0].split('/')[0], myList[y].data_date_end.split(' ')[1].split(':')[0], myList[y].data_date_end.split(' ')[1].split(':')[1], myList[y].data_date_end.split(' ')[1].split(':')[2]);
                    if (endday > today) {
                        row += `<span style="color: #24e900;">ปกติ</span>`
                    } else {
                        row += `<span style="color: red;">ครบกำหนด</span>`
                    }
                    row += `</td>` +
                        '<td class="align-top"><a href="/file_personal/' + myList[y].data_id + '" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a></td>' +
                        '<td class="align-top"><a href="/edit_personal/' + myList[y].data_id + '"class="text-warning"><i class="fas fa-pencil-alt fa-2x"></i></a></td>' +
                        '<td class="align-top"><a href="#" id="' + myList[y].data_id + '" onclick="delpersonal(this.id)" class="text-danger" data-bs-toggle="modal" data-bs-target="#delete_personal"><i class="fas fa-trash-alt fa-2x"></i></a> </td>' +
                        '</tr>'
                    table.append(row)
                    end_count = myList[y].no
                }

            }
            if (mypages == 0) {
                var row = '<tr class="odd"><td valign="top" colspan="15" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                table.append(row)
                $('#start').html(0)
                pageButtons(1)
            }

            var ppp = table.find('tr').length
            var check_undi = table.find('tr').text()
            $('#end').html(end_count)

            if (check_undi == 'ไม่พบข้อมูล') {
                $('#start').html(0)
                pageButtons(1)
            } else {
                if (ppp > 0) {
                    $('#start').html(myList[0].no)
                    pageButtons(data.pages)
                } else {
                    $('#start').html(0)
                    pageButtons(1)
                }
            }
        }
    })
}

function ajax_searchTable() {
    var new_date = document.getElementById("datechange").value;
    var keyword_search = document.getElementById("myInput").value.trim();
    document.getElementById('table-body').innerHTML = '';
    $.ajax({
        url: '/personal_data',
        method: 'POST',
        data: {
            search_datetime: new_date,
            search: keyword_search,
        },
    }).done(function (result) {
        let data = [];
        for (var i = 0; i < (result.data_id).length; i++) {
            data.push({
                "no": (i + 1),
                "data_id": result.data_id[i],
                "data_type_id": result.data_type_id[i],
                "data_code": result.data_code[i],
                "data_name": result.data_name[i],
                "data_level_id": result.data_level_id[i],
                "data_detail": result.data_detail[i],
                "data_date_start": result.data_date_start[i],
                "data_date_end": result.data_date_end[i],
                "data_location_name": result.data_location_name[i],
                "data_location_detail": result.data_location_detail[i]
            });
        }
        let level = []

        for (var i = 0; i < (result.level_id).length; i++) {
            level.push({
                "level_id": result.level_id[i],
                "level_name": result.level_name[i],
            })
        }

        let data_type1 = []
        for (var i = 0; i < (result.data_type_id1).length; i++) {
            data_type1.push({
                "data_type_id": result.data_type_id1[i],
                "data_type_name": result.data_type_name[i],
            })
        }
        var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
        var total = 0 // จำนวนทั้งหมดของข้อมูล

        $('#total').html(data.length)
        var state = {
            'querySet': data,
            'page': 1,
            'rows': 50,
            'window': 100000,
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

        function buildTable() {
            var table = $('#table-body')
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var mypages = data.pages
            for (y in myList) {
                if (mypages > 0) {
                    var selected_level = ""
                    var selected_type = ""
                    for (x in data_type1) {
                        if (data_type1[x].data_type_id == myList[y].data_type_id) {
                            selected_type = '<td><b></b> <span>' + data_type1[x].data_type_name + '</span></td>'
                        }
                    }
                    for (x in level) {
                        if (level[x].level_id == myList[y].data_level_id) {
                            selected_level = '<td>' + level[x].level_name + '</td>'
                        }
                    }
                    var date1 = new Date(myList[y].data_date_start.split(' ')[0].split('/').reverse().join('/'))
                    var date2 = new Date(myList[y].data_date_end.split(' ')[0].split('/').reverse().join('/'))
                    const diffTime = Math.abs(date2 - date1);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    var row = '<tr>' +
                        '<td><b>' +
                        '</b> <span>' + myList[y].no + '</span></td>' +
                        selected_type +
                        '<td>' + myList[y].data_code + '</td>' +
                        '<td>' + myList[y].data_name + '</td>' +
                        selected_level +
                        '<td>' + myList[y].data_detail + ` (จำนวน <span style="color: #24e900;">${diffDays + 1}</span> วัน) ` + '<br>' + myList[y].data_date_start + ' - ' + myList[y].data_date_end +
                        '</td>' +
                        `<td>`;
                    var today = new Date();
                    var endday = new Date(myList[y].data_date_end.split(' ')[0].split('/')[2], myList[y].data_date_end.split(' ')[0].split('/')[1], myList[y].data_date_end.split(' ')[0].split('/')[0], myList[y].data_date_end.split(' ')[1].split(':')[0], myList[y].data_date_end.split(' ')[1].split(':')[1], myList[y].data_date_end.split(' ')[1].split(':')[2]);
                    if (endday > today) {
                        row += `<span style="color: #24e900;">ปกติ</span>`
                    } else {
                        row += `<span style="color: red;">ครบกำหนด</span>`
                    }
                    row += `</td>` +
                        '<td class="align-top"><a href="/file_personal/' + myList[y].data_id + '" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a></td>' +
                        '<td class="align-top"><a href="/edit_personal/' + myList[y].data_id + '"class="text-warning"><i class="fas fa-pencil-alt fa-2x"></i></a></td>' +
                        '<td class="align-top"><a href="#" id="' + myList[y].data_id + '" onclick="delpersonal(this.id)" class="text-danger" data-bs-toggle="modal" data-bs-target="#delete_personal"><i class="fas fa-trash-alt fa-2x"></i></a> </td>' +
                        '</tr>'
                    table.append(row)
                    end_count = myList[y].no
                }

            }
            if (mypages == 0) {
                var row = '<tr class="odd"><td valign="top" colspan="15" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล </td></tr>'
                table.append(row)
                $('#start').html(0)
                pageButtons(1)
            }

            var ppp = table.find('tr').length
            var check_undi = table.find('tr').text()
            $('#end').html(end_count)

            if (check_undi == 'ไม่พบข้อมูล') {
                $('#start').html(0)
                pageButtons(1)
            } else {
                if (ppp > 0) {
                    $('#start').html(myList[0].no)
                    pageButtons(data.pages)
                } else {
                    $('#start').html(0)
                    pageButtons(1)
                }
            }
        }
    })
}

var input = document.querySelector('input[name=personal_dataTag]');
var tagify = new Tagify(input);

var $btns = $('.note-link').click(function () {
    $btns.removeClass('active');
    $(this).addClass('active');
})


function delpersonal(id) {
    console.log("cc", id);
    const data_id = document.getElementById("data_id").value
    const data_name = document.getElementById('data_name').value
    const data_code = document.getElementById('data_code').value

    let sort_data_id = data_id.split(',')
    let sort_data_name = data_name.split(',')
    let sort_data_code = data_code.split(',')
    let obj = []
    var deletepersonal = document.getElementById("del_personal");
    for (i in sort_data_id) {
        obj.push({ "data_id": sort_data_id[i], "data_name": sort_data_name[i], "data_code": sort_data_code[i] })

    }
    for (j in obj) {
        if (parseInt(id) == parseInt(obj[j].data_id)) {
            console.log("IF");
            deletepersonal.innerHTML = '<div class="form-group row py-3" style="align-items: center;"><label class="control-label text-end col-md-4 font-weight-medium">ชื่อเอกสาร :</label><div class="col-md-8"><p class="form-control-static">' + obj[j].data_name + ' </p></div></div>'
                + '<div class="form-group row py-3" style="align-items: center;"><label class="control-label text-end col-md-4 font-weight-medium">ชื่อเอกสาร :</label><div class="col-md-8"><p class="form-control-static">' + obj[j].data_code + ' </p></div></div>'
                + '<input type="hidden" name="data_id" id="data_id" value="' + obj[j].data_id + '">'
        } else {
            console.log("EL");
            deletepersonal.innerHTML = '<div class="form-group row py-3" style="align-items: center;"><label class="control-label text-end col-md-4 font-weight-medium">ชื่อเอกสาร :</label><div class="col-md-8"><p class="form-control-static">' + obj[j].data_name + ' </p></div></div>'
                + '<div class="form-group row py-3" style="align-items: center;"><label class="control-label text-end col-md-4 font-weight-medium">ชื่อเอกสาร :</label><div class="col-md-8"><p class="form-control-static">' + obj[j].data_code + ' </p></div></div>'
                + '<input type="hidden" name="data_id" id="data_id" value="' + id + '">'
        }
    }
}

function delete_tag(data) {
    console.log(data.split(','));
    document.getElementById('tag_name').innerHTML = data.split(',')[0]
    document.getElementById('tag_id').value = data.split(',')[1] + "," + data.split(',')[0]
}