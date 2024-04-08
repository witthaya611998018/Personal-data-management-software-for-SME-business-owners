var types_policy = []
var host = ""


// let date_default = () => {
//     const now = new Date();
//     const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
//     const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//     document.getElementById(`firstDay`).value = firstDay.toLocaleDateString('en-GB').split('/').reverse().join('-')
//     document.getElementById(`lastDay`).value = lastDay.toLocaleDateString('en-GB').split('/').reverse().join('-')
// }

// date_default()

let GetPolicyAannounce = async () => {
    setTimeout(() => {
        $.ajax({
            type: 'GET',
            url: '/api/get-data/announce-policy',
            success: async function (result) {
                console.log("result", result);
                types_policy = []
                host = result.host
                if (result.limit == "เต็ม") {
                    document.getElementById('limit').disabled = true
                }
                if (result.announce_policy == "ไม่มีข้อมูล") {
                    $('#table_sortable').remove()
                    DataNull()
                } else {
                    await DatabTable(result.announce_policy)
                    types_policy.push(result.document_types)
                    await select_type_policy(result.document_types)
                }
            },
            error: function (e) {
                console.log("error", e);
            }
        });
    }, 500);
}

GetPolicyAannounce()


document.getElementById('search_type_policy').addEventListener('click', () => {
    var value = (document.getElementById('input_search').value).trim()
    let data = {
        'id': $('#selecte_type_policy').val(),
        'value': value
    }
    if (value == '') {
        data.value = 'all'
    }
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: '/api/announce-policy/search-type',
        data: JSON.stringify(data),
        dataType: 'json',
        success: async function (result) {
            console.log(result);
            types_policy = []
            host = result.host
            if (result.announce_policy == "ไม่มีข้อมูล") {
                $('#table_sortable').remove()
                DataNull()
            } else {
                $('#table_sortable').remove()
                types_policy.push(result.document_types)
                await DatabTable(result.announce_policy)
            }
        },
        error: function (e) {
            console.log(e);
        }
    });
})


async function DatabTable(data) {
    for (let i = 0; i < data.length; i++) {
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
        $('#DataTable-Announce-Policy').append(content);
        var table = $('#table-body');
        var table_thead = $('#table-thead');
        var data = pagination(state.querySet, state.page, state.rows)
        var myList = data.querySet
        var show = [];
        var thead =
            `<tr>          
        <th>ลำดับ </th>
        <th> ชื่อเอกสาร </th>
        <th> สถานะ </th>
        <th> ใช้เอกสาร </th>
        <th> ดูข้อมูล </th>
        <th> กำหนดสถานะ </th>
        <th> วันที่สร้าง </th>
        <th> ผู้สร้าง </th>
        <th> วันที่เริ่มใช้งาน </th>
        <th> วันที่ยกเลิก </th>
        <th> ประเภทเอกสาร </th>        
        <th> ลบข้อมูล </th>
    </tr> `;
        table_thead.append(thead)
        for (var i in myList) {
            var status = "";
            var GetScript = {
                "share": `<a href="#"
        onclick="setlink(${myList[i].doc_id},'${myList[i].doc_name}')"
        title="คลิกเพื่อส่ง Email" data-bs-toggle="modal"
        data-bs-target="#setlink-modal"><i class="mdi mdi-email-outline" style="font-size: 25px;"></i></a>`,

                "printer": `
        <a href="/print_doc_policy/${myList[i].doc_id}"
        title="คลิกพิมพ์เอกสาร" target="_blank" class="col-md-1">
        <i class=" mdi mdi-printer" style="font-size: 25px;"></i></a>
        `,

                "copy": `
        <a href="#" id="${myList[i].doc_id}"  policy="${myList[i].doc_name}" onclick="copydoc(this)"
        data-bs-toggle="modal" data-bs-target="#copydoc-modal"
        class="col-md-1"><i class="mdi mdi-content-copy" style="font-size: 23px;"></i></a>
        `,

                "branch": `
        <a href="/api_support/${myList[i].doc_id}"
        title="คลิกเพื่อรับ Link" class="col-md-1"><i
        class="fas fa-code-branch"
        style="font-size: 25px;"></i> </a>
        `,

                "link": `
        <a href="/show_slide/${myList[i].doc_id}"
         title="คลิกแชร์เอกสาร" target="_blank">
         <i class="mdi mdi-link " style="font-size: 26px;"></i></a>
        `,
            };
            var status_name = "";
            if (myList[i].doc_status == 0) {
                status = GetScript.share + GetScript.printer + GetScript.copy
                status_name = `<p id="status-${i}" class="form-control-static text-secondery">ร่าง</p>`
            } else if (myList[i].doc_status == 1) {
                status = GetScript.printer + GetScript.copy
                status_name = `<p id="status-${i}" class="form-control-static text-info">ต้นฉบับ</p>`
            } else if (myList[i].doc_status == 2) {
                status = GetScript.link + GetScript.share + GetScript.printer + GetScript.branch + GetScript.copy
                status_name = `<p id="status-${i}" class="form-control-static text-success">ใช้งาน</p>`
            } else {
                status = "-"
                status_name = `<p id="status-${i}" class="form-control-static text-danger">ยกเลิก</p>`
            }
            if (myList[i].doc_remark == null) { myList[i].doc_remark = "" }
            var row = `<tr>
            <td>${myList[i].no}</td>
            <td style="width: 30%;">${myList[i].doc_name}</td>
            <td>${status_name}</td>
            <td>${status}</td>
            <td><a class="text-info"  href="/paper/${myList[i].doc_id}"><i class=" fas fa-file-alt fa-2x"></i></a></td>
            <td> <a id="${myList[i].doc_id}" doc_remark="${myList[i].doc_remark}" doc_status="${myList[i].doc_status}" 
            doc_type_id="${myList[i].doc_type_id}" onclick="EditeAnnouncePolicy(this)"
            class="text-warning" data-bs-toggle="modal"
            data-bs-target="#edit_announce_policy"><i class="fas fa-pencil-alt fa-2x"></i>
             </a></td>
            <td>${myList[i].date_create}</td>
            <td>${myList[i].firstname}</td>
            <td>${myList[i].date_create}</td>
            <td>-</td>
            <td>${myList[i].doc_type_name}</td>
            <td><a id="${myList[i].doc_id}"  onclick="DeleteAnnouncePolicy(this)"
            class="text-danger" data-bs-toggle="modal"
            data-bs-target="#del_doc"><i class="fas fa-trash-alt fa-2x"></i>
            </a></td>
            </tr>`
            table.append(row)
            show.push(myList[i].no)
        }
        document.querySelector("#show").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
        document.querySelector("#to_show").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
        document.querySelector("#show_all").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
        pageButtons(data.pages)
    }

};

let select_type_policy = async (data) => {
    var option_type = ` <option  value="all"> เลือก.. </option>`
    data.forEach(element => {
        if (element.doc_type_id == 217) {
            option_type += `
            <option selected id="${element.doc_type_id}" value="${element.doc_type_id}">${element.doc_type_name}</option>
            `
        } else {
            option_type += `
            <option id="${element.doc_type_id}" value="${element.doc_type_id}">${element.doc_type_name}</option>
            `
        }
    });
    document.getElementById('selecte_type_policy').innerHTML = option_type
}

function copydoc(data) {
    document.getElementById('copydoc_input').innerHTML =
        `<h5 align="center">ยืนยันการคัดลอกเอกสาร : ${$(data).attr('policy')}</h5>
        <input type="hidden" name="doc_id" value="${data.id}" readonly>`
}

function DeleteAnnouncePolicy(data) {
    var name_policy = $(data).closest("tr").find("td").eq(1).text()
    $('#delete_name_policy').html(
        `<div class="form-group row py-3"><label class="control-label text-end col-md-4 font-weight-medium">ชื่อเอกสาร :</label><div class="col-md-8">
    <p class="form-control-static" style="display: inline">${name_policy}</p></div></div>
        <input type="hidden" name="doc_id" value="${data.id}">`)
}


function EditeAnnouncePolicy(data) {
    var editdoc = document.getElementById("modal-edite-announce-policy");
    var name_policy = $(data).closest("tr").find("td").eq(1).text()
    let doc_status = $(data).attr('doc_status')
    let doc_type_id = $(data).attr('doc_type_id')
    var types = types_policy[0]
    let option_types = ""
    let option_status = ""

    types.forEach(element => {
        if (element.doc_type_id == doc_type_id) {
            option_types += `<option  value="${element.doc_type_id}" selected>${element.doc_type_name}</option>`
        } else {
            option_types += `<option  value="${element.doc_type_id}">${element.doc_type_name}</option>`
        }
    });


    if (doc_status == '0') {
        option_status = `
        <option  value="0" selected>ร่าง</option>
        <option  value="1" >ต้นฉบับ</option>
        <option value="2"> ใช้งาน</option>
        <option value="3"> ยกเลิก</option>
        `
    } else if (doc_status == '1') {
        option_status = `
        <option  value="0" >ร่าง</option>
        <option  value="1" selected>ต้นฉบับ</option>
        <option value="2"> ใช้งาน</option>
        <option value="3"> ยกเลิก</option>
        `
    } else if (doc_status == '2') {
        option_status = `
        <option  value="0" >ร่าง</option>
        <option  value="1" >ต้นฉบับ</option>
        <option value="2" selected> ใช้งาน</option>
        <option value="3"> ยกเลิก</option>
        `
    } else if (doc_status == '3') {
        option_status = `
        <option  value="0" >ร่าง</option>
        <option  value="1" >ต้นฉบับ</option>
        <option value="2"> ใช้งาน</option>
        <option value="3" selected> ยกเลิก</option>
        `
    }

    editdoc.innerHTML = `
    <div class="mb-2 row">
             <label for="fname" class="col-sm-4 text-start control-label col-form-label"> ชื่อเอกสาร :</label>
             <div class="col-sm-8">
             <input type="text" name="doc_name" value="${name_policy}" placeholder="กรุณาป้อนชื่อเอกสาร.." class="form-control" required>
           </div>
    </div>
    <div class="mb-2 row">
        <label for="lname" class="col-sm-4 text-start control-label col-form-label">ชนิดเอกสาร : </label>
        <div class="col-sm-8">
            <select  name="doc_type_id" class="form-control" required>
            ${option_types}
            </select>
        </div>
    </div>
    <div class="mb-2 row">
         <label for="fname" class="col-sm-4 text-start control-label col-form-label"> สถานะเอกสาร :</label>
         <div class="col-sm-8">
            <select id="edit_status" class="form-control" name="doc_status" > 
                ${option_status}
             </select>
        </div>
    </div>
    <div class="mb-2 row">
            <label for="fname" class="col-sm-4 text-start control-label col-form-label"> หมายเหตุ :</label>
            <div class="col-sm-8">
            <textarea style="height:100px" name="doc_remark" cols="30" rows="10"class="form-control" placeholder="หมายเหตุ..">${$(data).attr('doc_remark')}</textarea>
            </div>
    </div>
    <input type="hidden" name="doc_id" value="${data.id}">

    `
}

var preview = ""
var doc_id_mail = ""
function setlink(id, name_policy) {
    doc_id_mail = id
    preview = `
            <body>
            <div class="mt-4 " style="background:  #ffffff;margin-left:15%;margin-right:15%;width: 70%;margin-top:3%;border-radius: 15px;">
            <h2 style="color: orange;">
            PDPA 3in1</h2>
            <p style="border-bottom: 3px solid;color: orange;"></p>
            <h4 style="margin-left:2%;line-height: 2;">
            ✉ เอกสารนโยบาย : ${name_policy} 
            </h4>
            <h4 style="margin-left:2%;line-height: 2;">
            <a href="${host}/show_slide/${id}" style="text-align: left;color: orange;" target="_blank"> Link เอกสาร 
            </a>
            </h4>
            <hr>
            <h5 style="text-align: left;">
            เอกสารแชร์ตาม Link ข้างต้น แสดงข้อมูลเอกสารเพื่อให้ท่านตรวจสอบความถูกต้องของข้อมูล
            โดยระบบ PDPA 3in1
            </h5>
            </div>
            </body>`;
    $("#preview_share_polciy").html(preview);
    $('.note-editable').html(preview);
}

document.getElementById('share').addEventListener('click', () => {
    let data = {
        'email_outside': document.getElementById('email').value,
        'subject': document.getElementById('subject').value,
        'page_content': preview,
        'doc_id': doc_id_mail
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        url: '/api/announce-policy/send-mail',
        data: JSON.stringify(data),
        dataType: 'json',
        success: function (result) {
            console.log(typeof result);
            if (result == "success") {
                Swal.fire({
                    type: 'success',
                    title: 'จัดส่ง เรียบร้อย',
                    showConfirmButton: false,
                    timer: 1500,

                }).then(() => {
                    document.getElementById('email').value = ""
                    document.getElementById('subject').value = ""
                    document.getElementById("close-modal").click();
                })
            } else {
                Swal.fire({
                    type: 'warning',
                    title: 'จัดส่ง ล้มเลว',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    document.getElementById('email').value = ""
                    document.getElementById('subject').value = ""
                    document.getElementById("close-modal").click();
                })
            }

        },
        error: function (e) {
            console.log(e);
        }
    });
})


document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('email').value = ""
    document.getElementById('subject').value = ""
})

let DataNull = () => {
    var content = '<table class="tablesaw no-wrap  table-striped table-bordered table-hover table" id="table_sortable">'
    content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
    content += '</table>'
    $('#DataTable-Announce-Policy').append(content);
    var table = $('#table-body');
    var table_thead = $('#table-thead');
    var thead =
        `<tr>          
    <th>ลำดับ </th>
    <th> ชื่อเอกสาร </th>
    <th> สถานะ </th>
    <th> ใช้เอกสาร </th>
    <th> ดูข้อมูล </th>
    <th> กำหนดสถานะ </th>
    <th> วันที่สร้าง </th>
    <th> ผู้สร้าง </th>
    <th> วันที่เริ่มใช้งาน </th>
    <th> วันที่ยกเลิก </th>
    <th> ประเภทเอกสาร </th>        
    <th> ลบข้อมูล </th>
</tr> `;
    table_thead.append(thead)

    table.append(`
                <tr>
                    <td colspan="20" class="text-center" style="border: none;">
                         <b class="text-danger">ไม่พบข้อมูล</b>
                     </td>
                </tr>`);
    document.querySelector("#show").innerHTML = 0
    document.querySelector("#to_show").innerHTML = 0
    document.querySelector("#show_all").innerHTML = 0
}

$('#editer_share_polciy').summernote({
    fontSizes: ['8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '20', '22', '24'],
    toolbar: [
        ['style', ['style']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['font', ['bold', 'Sarabun', 'underline', 'clear']],
        ['color', ['color']],
        ['para', ['paragraph', 'ul', 'ol']],
        ['height', ['height']],
        ['insert', ['link', 'picture', 'hr']],
        // ['table', ['table']],
        ['view', ['undo', 'redo']],
    ],
    fontNames: ['Sarabun', 'Sans Serif', 'Arial', 'Arial Black', 'Tahoma'],
    fontNamesIgnoreCheck: ['Sarabun', 'Sans Serif', 'Arial', 'Arial Black', 'Tahoma'],
    focus: false,
    height: 350,
});
$('#editer_share_polciy').summernote('fontName', 'Sarabun');
$('#editer_share_polciy').summernote('fontSize', '16');
