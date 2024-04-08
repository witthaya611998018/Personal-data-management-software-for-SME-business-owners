function get_data(data) {
    $.ajax({
        type: 'get',
        url: '/api/cookietypes/',
        success: async function (result) {
            if (result == 'ไม่มีข้อมูล') {
                data_null("first")
            } else {
                await Tabeldata_ajax(result)
            }
        },
        error: function (e) {
            console.log(e);
        }
    });
}
get_data();

function editCookietype(data) {
    $('#id_cp').val($(data).closest("tr").find("td").eq(0).attr('class'));
    $('#name_cp_id').val($(data).closest("tr").find("td").eq(1).text().trim());
    $('#detail_cp_id').val($(data).closest("tr").find("td").eq(3).text().trim());
};

function Delete_cookietype(data) {
    let id = $(data).closest("tr").find("td").eq(0).attr('class')
    let id_name = $(data).closest("tr").find("td").eq(1).text().trim()

    console.log(id + id_name);
    $('#id_cp_delete').val(id + "," + id_name);
    $('#name_cp_id_delete').html($(data).closest("tr").find("td").eq(1).text().trim());
    $('#detail_cp_id_delete').html($(data).closest("tr").find("td").eq(3).text().trim());
};


document.getElementById('button-search').addEventListener('click', () => {
    var data = ({ "text": document.getElementById('search').value.trim() });
    if (document.getElementById('search').value == "") {

    } else {
        $.ajax({ // Srearch get api date
            type: "post",
            contentType: "application/json",
            url: '/api/cookietypes/search',
            data: JSON.stringify(data),
            dataType: 'json',
            success: async function (result) {
                if (result == "ไม่มีข้อมูล") {
                    data_null()
                } else {
                    $('#table_sortable').remove()
                    $('#table-body').remove()
                    await Tabeldata_ajax(result)
                }

            },
            error: function (e) {
                console.log(e);
            }
        });
    }
})

$('#reface').on("click", function () {
    location.reload()
});

function data_null(data) { // กรณีค้นหาไม่เจอข้อมูล
    if (data == "first") {
        var content = '<table class="tablesaw no-wrap table-striped table-bordered table-hover table" id="table_sortable">'
        content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
        content += '</table>'
        $('#table_test').append(content);
        var table_thead = $('#table-thead');
        var thead =
            `<tr>
            <th>ลำดับ</th>
            <th>ชื่อหมวดหมู่คุกกี้</th>
            <th  style="width: 20%;">เนื้อหา</th>
            <th>เเก้ไขข้อมูล</th>
            <th>ลบข้อมูล</th>
             </tr>`;
        table_thead.append(thead);
        $('#table-body').empty().append(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
                 <b class="text-danger">ไม่พบข้อมูล</b>
             </td>
        </tr>`);
    } else {
        $('#table-body').empty().append(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
                 <b class="text-danger">ไม่พบข้อมูล</b>
             </td>
        </tr>`);
    }

};


async function Tabeldata_ajax(data) {
    var group = [];
    for (var i = 0; i < data.length; i++) {
        group.push({
            "no": (i + 1),
            "id_cp": data[i].id_cp,
            "name_cp": data[i].name_cp,
            "detail_cp": data[i].detail_cp,
        });
    }

    var state = {
        'querySet': group,
        'page': 1,
        'rows': 30, // จำนวน row
        'window': 10000, // จำนวนหน้าที่เเสดง
    }

    buildTable()

    function pagination(querySet, page, rows) {
        var trimStart = (page - 1) * rows
        var trimEnd = trimStart + rows
        var trimmedData = querySet.slice(trimStart, trimEnd)
        var pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
        return {
            'querySet': trimmedData,
            'pages': pages,
        }
    }

    function pageButtons(pages) {
        var wrapper = document.querySelector('.pagination')
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

        // เช็คหน้าเเรก (ปุ่มย้อนกลับ)
        var num = 1
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
                        wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`
                    }
                    else {
                        wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`
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
                    wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`
                } else {
                    wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`
                }
            }
        }

        if (state.page == 1) {
            wrapper.innerHTML = `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` + wrapper.innerHTML
        } else {
            wrapper.innerHTML = `<li value=${state.page - 1} class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` + wrapper.innerHTML
        }


        // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
        if (state.page == pages) {
            wrapper.innerHTML += `<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>`
        } else {
            wrapper.innerHTML += `<li value=${state.page + 1} class="page page-item"><button class="page-link">ถัดไป</button></li>`
        }


        $('.page').on('click', function () {
            $('#table-body').empty()
            $('#table-thead').empty()
            $('#table_sortable').remove()
            state.page = Number($(this).val())
            buildTable()
        })
    }


    function buildTable() {
        var content = '<table class="tablesaw no-wrap table-striped table-bordered table-hover table" id="table_sortable">'
        content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
        content += '</table>'
        $('#table_test').append(content);
        var table = $('#table-body');
        var table_thead = $('#table-thead');
        var table_sortable = $('#table_sortable').attr('data-tablesaw-sortable');
        var data = pagination(state.querySet, state.page, state.rows)
        var myList = data.querySet
        var show = [];
        var thead =
            `<tr>
                <th>ลำดับ</th>
                <th>ชื่อหมวดหมู่คุกกี้</th>
                <th  style="width: 20%;">เนื้อหา</th>
                <th>เเก้ไขข้อมูล</th>
                <th>ลบข้อมูล</th>
                 </tr>`;
        table_thead.append(thead);
        for (var i in myList) {
            var text_detail = myList[i].detail_cp;
            var result = text_detail.slice(0, 150) + (text_detail.length > 150 ? "..." : "");
            var row = '<tr><td class=' + myList[i].id_cp + '>' + myList[i].no +
                '</td><td>' + myList[i].name_cp +
                '</td><td>' + result +
                '</td><td hidden>' + text_detail +
                '</td><td class="align-top">' + '<a class="text-warning"  data-bs-toggle="modal" data-bs-target="#edit-cookietype-modal" onclick="editCookietype(this)"><i class="fas fa-pencil-alt fa-2x"></i></a>' +
                '</td><td class="align-top">' + '<a  class="text-danger" data-bs-toggle="modal" data-bs-target="#delete-cookietype-modal" onclick="Delete_cookietype(this)"><i class="fas fa-trash-alt fa-2x"></i></a>' + '</td></tr>'
            table.append(row)
            show.push(myList[i].no)
        }
        document.querySelector("#show").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
        document.querySelector("#to_show").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
        document.querySelector("#show_all").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า

        pageButtons(data.pages)
    }
};