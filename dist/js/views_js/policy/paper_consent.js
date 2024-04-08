
document.getElementById("showhide").style.display = "none";
function oncheck() {
    if (document.getElementById('check_show').checked) {
        document.getElementById("showhide").style.display = "";
        document.getElementById("showhide").required = true;
    } else {
        document.getElementById("showhide").style.display = "none";
        document.getElementById("showhide").required = false;
    }
}

function checked_doc_consent() {
    if (document.getElementById('checked_doc_consent').checked) {
        document.getElementById('checked_doc_consent').value = 0
    } else {
        document.getElementById('checked_doc_consent').value = 1
    }
}

function copyfunc1(host, link) {
    //   var host = "${host_doc}"; 
    //   var id = "${id}"; 
    host = host + link
    // navigator.clipboard.writeText(host);
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(host).select();
    document.execCommand("copy");
    $temp.remove();


    Swal.fire({
        position: 'top',
        type: 'success',
        title: 'รับ Link Paper เรียบร้อย',
        showConfirmButton: false,
        timer: 800
    })
}

// function edit_checked_doc_consent(){
//     if(document.getElementById('edit_checked_doc_consent').checked){
//         document.getElementById('edit_checked_doc_consent').value = 0
//         document.getElementById('edit_checked_doc_consent').attributes('checked',false)
//     }else{
//         document.getElementById('edit_checked_doc_consent').value = 1
//         document.getElementById('edit_checked_doc_consent').attributes('checked',true)
//     } 
// }

function setlink(id) {
    var server = window.location.hostname;
    document.getElementById('setlink_id').innerHTML = 'Link: http://' + server + ':8081/api_paperslide/' + id
    document.getElementById('setdoc_id').value = id
    document.getElementById('comment_doc_id').value = id
    document.getElementById('server_doc_path').value = 'http://' + server + ':8081'
}

function copydoc(id) {
    document.getElementById('copydoc_input').innerHTML = '<h5 align="center">ยืนยันการคัดลอกเอกสาร ?</h5>' + '<input type="hidden" name="doc_id" value="' + id + '" readonly>'
}


// function editdoc(id) {
//     const doc_type = document.getElementById("doc_type").value //doc_id
//     console.log("doc_type", doc_type);
//     const doc_id = document.getElementById("doc_i").value //doc_id
//     const doc_name = document.getElementById('doc_n').value //doc_name
//     const doc_type_id = document.getElementById('doc_t').value //doc_type_id
//     const doc_remark = document.getElementById('doc_r').value //doc_remark
//     const doc_status = document.getElementById('doc_status').value //doc_status
//     const doc_consent_status = document.getElementById('doc_consent_status').value //doc_consent_status

//     let sort_doc_id = doc_id.split(',')
//     let sort_doc_name = doc_name.split(',')
//     let sort_doc_type_id = doc_type_id.split(',')
//     let sort_doc_remark = doc_remark.split(',')
//     let sort_doc_status = doc_status.split(',')
//     let sort_doc_consent_status = doc_consent_status.split(',')

//     let obj = []
//     var editdoc = document.getElementById("editdoc");

//     for (i in sort_doc_id) {
//         obj.push({ "doc_id": sort_doc_id[i], "doc_name": sort_doc_name[i], "doc_type_id": sort_doc_type_id[i], "doc_remark": sort_doc_remark[i], "doc_status": sort_doc_status[i], "doc_consent_status": sort_doc_consent_status[i] })
//     }
//     console.log("obj", obj);
//     for (j in obj) {
//         if (id == obj[j].doc_id) {
//             if (obj[j].doc_consent_status == 1) {
//                 editdoc.innerHTML = '<div class="mb-2 row"><label for="fname" class="col-sm-4 text-start control-label col-form-label"> ชื่อเอกสาร :</label><div class="col-sm-8"><input type="text" name="doc_name" value="' + obj[j].doc_name + '" placeholder="กรุณาป้อนชื่อเอกสาร.." class="form-control" required></div></div>'
//                     + '<div class="mb-2 row"><label for="lname" class="col-sm-4 text-start control-label col-form-label">ชนิดเอกสาร : </label><div class="col-sm-8"><select id="doc_edit_type" name="doc_type_id" class="form-control" required><option name="" value="">เลือก..</option><% if(doc_type){ %><% for(var i=0;i<doc_type.length;i++){%><option id="option_edit_doc" value="<%= doc_type[i].doc_type_id %>"><%= doc_type[i].doc_type_name %></option> <% } %><% } %></select></div></div>'
//                     + '<div class="mb-2 row"><label for="fname" class="col-sm-4 text-start control-label col-form-label"> สถานะเอกสาร :</label><div class="col-sm-8"><select id="edit_status" class="form-control" name="doc_status" > <option  value="0">ร่าง</option><option  value="1">ต้นฉบับ</option><option value="2"> ใช้งาน</option><option value="3"> ยกเลิก</option></select></div></div>'
//                     + '<div class="mb-2 row"><label for="fname" class="col-sm-4 text-start control-label col-form-label"> หมายเหตุ :</label><div class="col-sm-8"><textarea style="margin-top: 10px;height:100px" name="doc_remark" cols="30" rows="10"class="form-control" placeholder="หมายเหตุ..">' + obj[j].doc_remark + '</textarea></div></div>'
//                     + '<input type="hidden" name="doc_id" value="' + obj[j].doc_id + '" readonly>'
//             }
//             else {
//                 editdoc.innerHTML = '<div class="mb-2 row"><label for="fname" class="col-sm-4 text-start control-label col-form-label"> ชื่อเอกสาร :</label><div class="col-sm-8"><input type="text" name="doc_name" value="' + obj[j].doc_name + '" placeholder="กรุณาป้อนชื่อเอกสาร.." class="form-control" required></div></div>'
//                     + '<div class="mb-2 row"><label for="lname" class="col-sm-4 text-start control-label col-form-label">ชนิดเอกสาร : </label><div class="col-sm-8"><select id="doc_edit_type" name="doc_type_id" class="form-control" required><option name="" value="">เลือก..</option><% if(doc_type){ %><% for(var i=0;i<doc_type.length;i++){%><option id="option_edit_doc" value="<%= doc_type[i].doc_type_id %>"><%= doc_type[i].doc_type_name %></option> <% } %><% } %></select></div></div>'
//                     + ' <div class="mb-2 row"><label for="fname" class="col-sm-4 text-start control-label col-form-label"> สถานะเอกสาร :</label><div class="col-sm-8"><select id="edit_status" class="form-control" name="doc_status" > <option  value="0">ร่าง</option><option  value="1">ต้นฉบับ</option><option value="2"> ใช้งาน</option><option value="3"> ยกเลิก</option></select></div></div>'
//                     + '<div class="mb-2 row"><label for="fname" class="col-sm-4 text-start control-label col-form-label"> หมายเหตุ :</label><div class="col-sm-8"><textarea style="height:100px" name="doc_remark" cols="30" rows="10"class="form-control" placeholder="หมายเหตุ..">' + obj[j].doc_remark + '</textarea></div></div>'
//                     + '<input type="hidden" name="doc_id" value="' + obj[j].doc_id + '" readonly>'
//             }
//         }
//     }
//     var re = new RegExp("[0-9]");
//     var selected = $('select#doc_edit_type')
//     for (j in obj) {
//         if (id == obj[j].doc_id) {
//             console.log(id, obj[j].doc_id)
//             var option = $('option#option_edit_doc').map(function () {
//                 return $(this).val()
//             })
//             for (k in option) {
//                 if (option[k] == obj[j].doc_type_id) {
//                     selected.find('option[value=' + option[k] + ']').attr('selected', 'selected');
//                 }
//             }
//         }
//     }

//     var selected_doc = $('select#edit_status').find('option').map(function () {
//         return $(this).val()
//     })
//     for (a in selected_doc) {
//         for (b in obj) {
//             if (obj[b].doc_id == id) {
//                 if (obj[b].doc_status == selected_doc[a]) {
//                     $('select#edit_status').find('option[value=' + selected_doc[a] + ']').attr('selected', true)
//                 }
//             }
//         }
//     }
// }


function deldoc(id) {
    const doc_id = document.getElementById("doc_i").value //doc_id
    const doc_name = document.getElementById('doc_n').value //doc_name
    const doc_type_id = document.getElementById('doc_t').value //doc_type_id
    const doc_remark = document.getElementById('doc_r').value //doc_remark


    let sort_doc_id = doc_id.split(',')
    let sort_doc_name = doc_name.split(',')
    let sort_doc_type_id = doc_type_id.split(',')
    let sort_doc_remark = doc_remark.split(',')


    let obj = []
    var deletedoc = document.getElementById("deletedoc");
    for (i in sort_doc_id) {
        obj.push({ "doc_id": sort_doc_id[i], "doc_name": sort_doc_name[i], "doc_type_id": sort_doc_type_id[i], "doc_remark": sort_doc_remark[i] })
    }
    for (j in obj) {
        if (id == obj[j].doc_id) {
            deletedoc.innerHTML = '<div class="form-group row py-3"><label class="control-label text-end col-md-4 font-weight-medium">ชื่อเอกสาร :</label><div class="col-md-8"><p class="form-control-static" style="display: inline">' + obj[j].doc_name + ' </p></div></div>'
                + '<input type="hidden" name="doc_id" value="' + obj[j].doc_id + '" readonly>'
        }
    }
}



function DatabTable() {
    var dataget = JSON.parse(document.getElementById('Data_set').value)
    console.log("dataget", dataget);
    if (dataget.length > 0) {
        var my_user = document.getElementById('my_user').value.replaceAll('"', "")
        let countconsentun = JSON.parse(document.getElementById('countconsentun').value)
        let countconsent = JSON.parse(document.getElementById('countconsent').value)
        let host = document.getElementById('host').value
        var status_date_cancle = JSON.parse(document.getElementById('status_date_cancle').value)

        let dataset = []
        for (let i = 0; i < dataget.length; i++) {
            dataset.push({
                'no': i + 1,
                'check_doc': dataget[i].check_doc,
                'doc_action': dataget[i].doc_action,
                'doc_consent_status': dataget[i].doc_consent_status,
                'doc_date_create': dataget[i].doc_date_create,
                'doc_id': dataget[i].doc_id,
                'doc_name': dataget[i].doc_name,
                'doc_remark': dataget[i].doc_remark,
                'doc_status': dataget[i].doc_status,
                'doc_type_id': dataget[i].doc_type_id,
                'type': dataget[i].type,
                'user_id': dataget[i].user_id
            })
        }
        console.log(dataset);
        var state = {
            'querySet': dataset,
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
            $('#DataTable-PaperConsent').append(content);
            var table = $('#table-body');
            var table_thead = $('#table-thead');
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];
            var thead =
                `<tr>          
            <th>ลำดับ </th>
            <th> ชื่อเอกสาร </th>
            <th> วันที่สร้าง </th>
            <th> ผู้สร้าง </th>
            <th> จำนวน Consent </th>
            <td> จำนวน Unconsent </td>
            <td> ใช้งาน </td>
            <td> ยกเลิก </td>
            <td> สถานะ </td>
            <td> ใช้เอกสาร </td>
            <td> Link </td>
            <td> ดูข้อมูล </td>
            <th> กำหนดสถานะ </th>
            <th> ลบข้อมูล </th>
        </tr> `;
            table_thead.append(thead)
            for (var i in myList) {
                let dateEnd = "-";
                let status = "";
                let status_name = "";
                let GetScript = {

                    "share": `<a href="#" id="${myList[i].doc_id}"
                    onclick="setlink(this.id,'${myList[i].doc_id}')"
                    title="คลิกเพื่อส่ง Email" data-bs-toggle="modal"
                    data-bs-target="#setlink-modal"><i
                    data-feather="share-2"></i></a>`,

                    "printer": `
                    <a href="/print_doc_policy/${myList[i].doc_id}"
                    title="คลิกพิมพ์เอกสาร" target="_blank"
                    rel="noopener noreferrer" class="col-md-1"><i
                    data-feather="printer"></i></a>
                    `,

                    "copy": `
                    <a href="#" id="${myList[i].doc_id}>" onclick="copydoc(this.id)"
                    data-bs-toggle="modal" data-bs-target="#copydoc-modal"
                    class="col-md-1"><i data-feather="copy"></i></a>
                    `,

                    "branch": `
                    <a href="/api_support/${myList[i].doc_id}"
                    title="คลิกเพื่อรับ Link" class="col-md-1"><i
                    class="fas fa-code-branch"
                    style="font-size: 27px;"></i> </a>
                    `,

                    "link": `
                    <a href="/api_paperslide/${myList[i].doc_id}"
                     title="คลิกแชร์เอกสาร" target="_blank"
                     rel="noopener noreferrer"><i
                     data-feather="link-2"></i></a>
                    `,
                };

                if (myList[i].doc_status == 0) {
                    status = GetScript.link + GetScript.printer

                    status_name = `<p id="status-${i}"
                class="form-control-static text-secondery">ร่าง</p>`
                } else if (myList[i].doc_status == 1) {
                    status = GetScript.link + GetScript.printer
                    status_name = `<p id="status-${i}"
                class="form-control-static text-info">ต้นฉบับ</p>`
                } else if (myList[i].doc_status == 2) {
                    status = GetScript.link + GetScript.printer + GetScript.branch
                    status_name = `<p id="status-${i}"
                class="form-control-static text-success">ใช้งาน</p>`
                } else {
                    dateEnd = `${status_date_cancle[0].date_history}`
                    status = "-"
                    status_name = `<p id="status-${i}"
                class="form-control-static text-danger">ยกเลิก</p>`
                }
                var row = `<tr><td>` + myList[i].no +
                    `</td><td>` + myList[i].doc_name +
                    '</td><td>' + myList[i].doc_date_create +
                    '</td><td>' + my_user +
                    `</td><td>` + countconsent[i].numm +
                    `</td><td>` + countconsentun[i].numm +
                    `</td><td>` + myList[i].doc_date_create +
                    '</td><td>' + dateEnd +
                    `</td><td> ${status_name}` +
                    `</td><td> ${status}` +
                    '</td><td>' +
                    ` <a title="คลิกเพื่อรับ Link Paper consent"
                         onclick="copyfunc1('${host}','/api_paperconsent/${myList[i].doc_id}')"
                         class="btn btn-info">Link Paper</a>` +
                    `</td><td>  <a class="text-info" href="/paper_consent/${myList[i].doc_id}" title="คลิก เพื่อปรับปรุงเอกสาร">
                        <i class=" fas fa-file-alt fa-2x"></i></a>` +

                    `</td><td>
                        <a id="${myList[i].doc_id}" href="#" onclick="editdoc(this.id,${myList[i].doc_status})"
                        class="text-warning" data-bs-toggle="modal"
                        data-bs-target="#edit_doc"><i class="fas fa-pencil-alt fa-2x"></i>
                         </a>` +
                    `</td><td>
                    <a id="${myList[i].doc_id}" href="#" onclick="deldoc(this.id)"
                     class="text-danger" data-bs-toggle="modal"
                     data-bs-target="#del_doc"><i class="fas fa-trash-alt fa-2x"></i>
                     </a>`+
                    '</td></tr>'
                table.append(row)
                show.push(myList[i].no)
            }
            document.querySelector("#show").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
            document.querySelector("#to_show").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
            document.querySelector("#show_all").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
            pageButtons(data.pages)
        }
    } else {
        var content = '<table class="tablesaw no-wrap table-striped table-bordered table-hover table" id="table_sortable">'
        content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
        content += '</table>'
        $('#DataTable-PaperConsent').append(content);
        var table = $('#table-body');
        var table_thead = $('#table-thead');
        var thead =
            `<tr>          
            <th>ลำดับ </th>
            <th> ชื่อเอกสาร </th>
            <th> วันที่สร้าง </th>
            <th> ผู้สร้าง </th>
            <th> จำนวน Consent </th>
            <td> จำนวน Unconsent </td>
            <td> ใช้งาน </td>
            <td> ยกเลิก </td>
            <td> สถานะ </td>
            <td> ใช้เอกสาร </td>
            <td> Link </td>
            <td> ดูข้อมูล </td>
            <th> กำหนดสถานะ </th>
            <th> ลบข้อมูล </th>
        </tr> `;
        table_thead.append(thead)
        table.append(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
                 <b class="text-danger">ไม่พบข้อมูล</b>
             </td>
        </tr>`);
        $('#show').empty()
        $('#to_show').empty()
        $('#show_all').empty()
    }
};
DatabTable()
