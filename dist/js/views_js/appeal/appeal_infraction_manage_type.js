

function data_null() {
    $('#tbody').empty().append(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
             <b class="text-danger">ไม่พบข้อมูล</b>
            </td>
        </tr>
        `)
}

document.getElementById('button-search').addEventListener('click', function () {
    console.log(document.getElementsByTagName("select")[0].value);
    let data = {
        type: document.getElementsByTagName("select")[0].value,
        text: document.getElementById("search").value
    }
    $.ajax({
        type: 'post',
        contentType: 'application/json',
        url: `/api/appeal/infraction/manage/type/search`,
        data: JSON.stringify(data),
        dataType: 'json',
        success: async function (result) {
            if (result == 'ไม่มีข้อมูล') {
                data_null()
            } else {
                $('#tbody').empty()
                Data_Table(result)
            }
        },
        error: function (e) {
            console.log(e);
        }
    })
})



function editType(data, id, type) {
    let form_edit = (document.getElementById('Edit-type')).getElementsByTagName('input')
    let select = (document.getElementById('Edit-type')).getElementsByTagName('select')[0].getElementsByTagName('option')
    form_edit[1].value = id
    form_edit[0].value = $(data).closest("tr").find("td").eq(1).text().trim()
    for (let i = 0; i < select.length; i++) {
        if (select[i].value == type) {
            select[i].selected = true
        }
    }
};

function delType(data, id,type) {
    let form_del = (document.getElementById('del-type')).getElementsByTagName('input')
    let select = (document.getElementById('del-type')).getElementsByTagName('select')[0].getElementsByTagName('option')
    form_del[1].value = id
    form_del[0].value = $(data).closest("tr").find("td").eq(1).text().trim()
    for (let i = 0; i < select.length; i++) {
        if (select[i].value == type) {
            select[i].selected = true
        }
    }
};


function Data_Table(data) {

    if (data == 'ไม่มีข้อมูล') {
        data_null()
    } else {
        for (var i = 0; i < data.length; i++) {
            data[i].no = i + 1
        }
        var state = {
            'querySet': data,
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
            // var wrapper = document.getElementById('pagination-wrapper')
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
            // var num = 1
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
                $('#tbody').empty()
                state.page = Number($(this).val())
                buildTable()
            })
        };


        function buildTable() {
            var table = $('#tbody');
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];
            let infraction_high_risk = ''
            for (var i in myList) {
                let text = '-'
                if (myList[i].infractiontype_type == 1) {
                    text = 'หัวเรื่องการละเมิด'
                } else if (myList[i].infractiontype_type == 2) {
                    text = 'ประเภทหรือสถานะเจ้าข้อมูลส่วนบุคคล'
                } else if (myList[i].infractiontype_type == 3) {
                    text = 'ผลกระทบ'
                } else if (myList[i].infractiontype_type == 4) {
                    text = 'สถานะทางกฏหมายของผู้ควบคุมข้อมูลส่วนบุคคล'
                }
                var row = `<tr>
                        <td>${myList[i].no}</td>
                        <td>${myList[i].infractiontype_name}</td>           
                        <td>${text}</td>
                        <td>
                            <a href="#Edit-type" data-bs-toggle="modal" onclick="editType(this,${myList[i].infractiontype_id},'${myList[i].infractiontype_type}')"  class="text-warning">
                                <i class="fas fa-pencil-alt fa-2x"></i>
                            </a>
                        </td>
                        <td>
                            <a href="#del-type" data-bs-toggle="modal" onclick="delType(this,${myList[i].infractiontype_id},'${myList[i].infractiontype_type}')"  class="text-danger">
                                <i class="fas fa-trash-alt fa-2x"></i>
                            </a>
                        </td>
                        </tr>
                        `
                table.append(row)
                show.push(myList[i].no)
            }
            document.querySelector("#show").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
            document.querySelector("#to-show").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
            document.querySelector("#show-all").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
            pageButtons(data.pages)
        }
    }
}
