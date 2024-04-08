
// document.getElementById("build_tag").addEventListener("click", function () {
//     $(".topic_use").hide();
//     $(".topic_cancel").hide();
//     $('.cookie-tag').show();
//     $('.note-full-container').hide();
// });

// $.ajax({
//     type: 'GET',
//     url: '/api/get/Tag',
//     success: function (result) {
//         Tabeldata_ajax(result);
//     },
//     error: function (e) {
//         console.log("error", e);
//     }
// });

// $("#reface").on("click", function (e) { // กรณีกดปุ่ม reface
//     $('#Srearch').val(null)
//     data_null()
// });

// $('#Srearch').on("keyup", function () {
//     var data = ({ "data": $(this).val() });
//     if ($(this).val() == "") {
//         data_null()
//     } else {
//         $.ajax({ // Srearch get api date
//             type: "post",
//             contentType: "application/json",
//             url: '/api/get/Tag_search',
//             data: JSON.stringify(data),
//             dataType: 'json',
//             success: function (result) {
//                 $('#table_sortable').remove();
//                 $('#table-body').remove();
//                 Tabeldata_ajax(result);
//             },
//             error: function (e) {
//                 console.log(e);
//             }
//         });
//     }
// });



let ApiCookie = () => {
    $.ajax({
        type: 'GET',
        url: '/ApiCookie',
        success: function (result) {
            if (result == "ไม่มีข้อมูล") {
                DataNull()
                document.getElementById('limit').innerHTML = `
                <button type="button" class="btn btn-success" data-bs-toggle="modal" id="addDomain"
                data-bs-target="#addDomain-modal"><i class="fas fa-plus"></i>
                เพิ่มโดเมน</button>
                `
            } else {
                CookieTable(result.select_domaingroup)
                if (result.limit_cookie === -1 || result.select_domaingroup.length < result.limit_cookie) {
                    document.getElementById('limit').innerHTML = `
                    <button type="button" class="btn btn-success" data-bs-toggle="modal" id="addDomain"
                    data-bs-target="#addDomain-modal"><i class="fas fa-plus"></i>
                    เพิ่มโดเมน</button>
                    `
                } else {
                    document.getElementById('limit').innerHTML = ` 
                    <button type="button" class="btn btn-success" data-bs-toggle="modal" id="addDomain"
                    disabled data-bs-target="#addDomain-modal"><i class="fas fa-plus"></i>
                    เพิ่มโดเมน</button>
                    `
                }
            }
        },
        error: function (e) {
            console.log("error", e);
        }
    });
}
ApiCookie()


let DataNull = () => {
    var content = '<table class="no-wrap table-striped table-bordered table-hover table" id="table_sortable">'
    content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
    content += '</table>'
    $('#CookieTable').append(content);
    var table_thead = $('#table-thead');
    var thead =
        `<tr>          
    <th>ลำดับ </th>
    <th> ชื่อโดเมน </th>
    <th> วันที่สร้าง </th>
    <th> ผู้สร้าง </th>
    <th> ชื่อคุกกี้ </th>
    <th> ข้อความ </th>
    <th> สถานะ </th>
    <th> รับสคริปต์</th>
    <th> ดูข้อมูล </th>
    <th> กำหนดสถานะ </th>
    <th> ลบข้อมูล </th>
</tr> `;
    table_thead.append(thead)
    $('#table-body').empty().append(`
    <tr>
        <td colspan="20" class="text-center" style="border: none;">
             <b class="text-danger">ไม่พบข้อมูล</b>
         </td>
    </tr>`);
    document.querySelector("#show").innerHTML = 0
    document.querySelector("#to_show").innerHTML = 0
    document.querySelector("#show_all").innerHTML = 0
}

let cookie_policy = () => {
    $.ajax({
        type: 'GET',
        url: '/cookie_policy',
        success: function (result) {
            var policy = []
            result.forEach(element => {
                if (element.doc_name == "นโยบายการคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy)") {
                    if (element.doc_status != 2) {
                        policy.push(element.doc_name)
                    }
                } else if (element.doc_name == "นโยบายคุกกี้ (Cookies Policy)") {
                    if (element.doc_status != 2) {
                        policy.push(element.doc_name)
                    }
                }
            });
            if (policy.length > 0) {
                document.getElementById('alert').innerHTML = `* ตรวจสอบพบเอกสาร ${policy[0]} ยังไม่เปิดใช้งาน อาจจะทำให้เนื้อหาภายในคุกกี้ป๊อบอัพไม่สมบูรณ์ได้ ถ้าต้องการเปิดใช้งานเอกสาร <a href="/index">คลิกที่นี่</a>`
                document.getElementById('alert_edit').innerHTML = `* ตรวจสอบพบเอกสาร ${policy} ยังไม่เปิดใช้งาน อาจจะทำให้เนื้อหาภายในคุกกี้ป๊อบอัพไม่สมบูรณ์ได้ ถ้าต้องการเปิดใช้งานเอกสาร <a href="/index">คลิกที่นี่</a>`
            }
        },
        error: function (e) {
            console.log("error", e);
        }
    });
}
cookie_policy()

function data_null() { // กรณีค้นหาไม่เจอข้อมูล
    $.ajax({
        type: 'GET',
        url: '/api/get/Tag',
        success: function (result) {
            $('#table_sortable').remove()
            $('#table-body').remove()
            Tabeldata_ajax(result);
        },
        error: function (e) {
            console.log("error", e);
        }
    });
};

function Tabeldata_ajax(data) {
    var Getdata = [];
    for (var i = 0; i < data.length; i++) {
        Getdata.push({
            "no": (i + 1),
            "id_tag": data[i].id_tag,
            "tag_name": data[i].tag_name,
            "tag_styles": data[i].tag_styles
        });
    }

    var state = {
        'querySet': Getdata,
        'page': 1,
        'rows': 10, // จำนวน row
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
    };

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
            $('#table_sortable').remove() // ลบ เพื่อไม่ให้มันสรา้ง row ใน table เปล่าขึ้นมา
            state.page = Number($(this).val())
            buildTable()
        })
    };


    function buildTable() {
        var content = '<table class="table-striped table-bordered table-hover table" id="table_sortable">'
        content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
        content += '</table>'
        $('#table-data-tag').append(content);
        // $('#table_sortable').attr('data-sortable');
        var table = $('#table-body');
        var table_thead = $('#table-thead');
        var thead =
            `<tr>
                <th width="10%">ลำดับ</th>
                <th>ชื่อTag</th>
                <th width="18%">เเก้ไขข้อมูล </th>
                <th width="18%">ลบข้อมูล</th>
                    </tr>`;
        table_thead.append(thead)
        var data = pagination(state.querySet, state.page, state.rows)
        var myList = data.querySet
        var show = [];
        for (var i in myList) {
            var row = '<tr><td class="' + myList[i].id_tag + ' ">' + myList[i].no +
                '</td><td>' + myList[i].tag_name +
                '</td><td>' + ' <a class="text-warning" onclick="edit_tag(this)"data-bs-toggle="modal" data-bs-target="#edit-tag-modal"><i class="fas fa-pencil-alt fa-2x"></i></a>' +
                '</td><td>' + '<a class="text-danger" onclick="delete_Tag(' + myList[i].id_tag + ')"><i class="fas fa-trash-alt fa-2x"></i></a>' +
                '</td></tr>'
            table.append(row);
            show.push(myList[i].no);
        }
        document.querySelector("#show").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
        document.querySelector("#to_show").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
        document.querySelector("#show_all").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
        pageButtons(data.pages)
    };
};

function tag_class() {
    $.ajax({
        type: 'GET',
        url: '/api/cookie_management',
        success: function (result) {
            if (result != "ไม่มีข้อมูล") {
                var domain_setting_tag = result.domain_setting_tag;
                var domaingroup = result.domaingroup;
                for (let i = 0; i < domain_setting_tag.length; i++) {
                    for (let j = 0; j < domaingroup.length; j++) {
                        if (domain_setting_tag[i].id_dg == domaingroup[j].id_dg) {
                            $('#tag_select_domain_' + domaingroup[j].id_dg).empty();
                            $('#badge-group-item' + domaingroup[j].id_dg).addClass("tag_show_" + domain_setting_tag[i].id_tag);
                            $('#badge-group-item-use' + domaingroup[j].id_dg).addClass("tag_show_" + domain_setting_tag[i].id_tag);
                            $('#badge-group-item-cancel' + domaingroup[j].id_dg).addClass("tag_show_" + domain_setting_tag[i].id_tag);

                            if (domain_setting_tag[i].tag_id == domain_setting_tag[i].id_tag) {
                                $('#text_' + domaingroup[j].id_dg + '_' + domain_setting_tag[i].tag_id).attr('style', 'color:grey');
                                $('.style_select_' + domaingroup[j].id_dg + '_' + domain_setting_tag[i].tag_id).attr('style', 'color:grey');
                            }
                        }
                    }
                }
                for (let i = 0; i < domain_setting_tag.length; i++) {
                    $('#tag_select_domain_' + domain_setting_tag[i].id_dg).append(`<i class="fas fa-tag" data-tag="${domain_setting_tag[i].id_tag + "," + domain_setting_tag[i].tag_name}"  style="font-size: larger;color:${domain_setting_tag[i].tag_styles}"></i>`)
                }
            }
        },
        error: function (e) {
            console.log("error", e);
        }
    });
}
tag_class()
function edit_tag(data) {
    $('#id_tag_model').val($(data).closest("tr").find("td").eq(0).attr('class'));
    $('#edit_tag_model').val($(data).closest("tr").find("td").eq(1).text().trim());
    // $('#detail_cp_id').val($(data).closest("tr").find("td").eq(2).text().trim());
}

// function Delete(id) {
//     // var test = document.querySelector(".domain_" + id);
//     Swal.fire({
//         title: 'คุณแน่ใจไหม',
//         // text: 'test',
//         type: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#39c449',
//         // cancelButtonColor: '#d33',
//         confirmButtonText: 'ตกลง'
//     }).then((result) => {
//         if (result.value) {
//             Swal.fire(
//                 'ลบข้อมูลสำเร็จ',
//                 '',
//                 'success'
//             )
//             timer: 50000,
//                 window.location = '/delete/' + id;
//         }
//     })
// }


function Delete(data, status, id) {
    var data_query = document.querySelector("." + status + "-" + data)
    var text_message = data_query.querySelector("#h6-" + data).innerText.trim()
    var text_namedomain = data_query.querySelector("#p-namedomain-" + data).innerText.trim()
    var text_cookie = data_query.querySelector("#cookie_show-" + data).innerText.trim()
    var delete_status = document.getElementById("delete_status")
    if (status == "cancel") {
        delete_status.innerText = "Cookie ยกเลิก"
    } else if (status == "use") {
        delete_status.innerText = "Cookie ใช้งาน"
    } else {
        delete_status.innerText = "Cookie ร่าง"
    }
    document.getElementById("delete_domain").innerText = text_namedomain;
    document.getElementById("delete_message").innerText = text_message;
    document.getElementById("delete_id").value = id.trim();
    document.getElementById("delete_namecookie").innerText = text_cookie;
}




function Edit(data, status, id, tags) {
    var data_query = document.querySelector("." + status + "-" + data)
    var text_message = data_query.querySelector("#h6-" + data).innerText.trim()
    var text_namedomain = data_query.querySelector("#p-namedomain-" + data).innerText.trim()
    var text_cookie = data_query.querySelector("#cookie_show-" + data).innerText.trim()
    var option = document.getElementById("status_edit")
    var protocol = document.getElementById("protocol")

    if (text_namedomain.split('//')[0] === 'https:') {
        console.log("x");
        protocol.innerHTML = `
        <option  selected value="https">https://</option>
        <option  value="http">http://</option>
        `;
    } else {
        console.log("xx");
        protocol.innerHTML = `
        <option   value="https">https://</option>
        <option selected value="http">http://</option>
        `;
    }

    // var option_tag = document.getElementById("option_tag").getElementsByTagName('option')
    // var tag = data_query.querySelector('#tag_select_domain_' + id).getElementsByTagName('i')
    // var option_tags = "";
    // var tag_value = []

    // console.log("option_tag", option_tag);
    // var test = []
    // for (let i = 0; i < option_tag.length; i++) {

    //     // console.log(tag[i]);
    //     if (tag[i] != undefined) {
    //         test.push(tag[i].getAttribute("data-tag").split(",")[0])
    //     } else {
    //         test.push(0)
    //     }
    // }

    // for (let i = 0; i < option_tag.length; i++) {

    //     if (tag[i] != undefined) {
    //         if (tag[i].getAttribute("data-tag").split(",")[0] == option_tag[i].value) {
    //             option_tags += `<option selected value="${tag[i].getAttribute("data-tag").split(",")[0]}">${tag[i].getAttribute("data-tag").split(",")[1]}</option>`
    //         } else if (tag[i]) {
    //             option_tags += `<option selected value="${tag[i].getAttribute("data-tag").split(",")[0]}">${tag[i].getAttribute("data-tag").split(",")[1]}</option>`
    //         }
    //     }
    //     if (test.indexOf(option_tag[i].value) === -1) {
    //         option_tags += `<option value="${option_tag[i].value}">${option_tag[i].outerText.trim()}</option>`
    //     }

    //     // if (test.indexOf(option_tag[i].value) === -1) {
    //     //     console.log("ไม่มี", option_tag[i].value);
    //     //     option_tags += `<option value="${option_tag[i].value}">${option_tag[i].outerText.trim()}</option>`
    //     // }


    //     // if (test == option_tag[i].value) {
    //     //     option_tags += `<option value="${option_tag[i].value}">${option_tag[i].outerText.trim()}</option>`
    //     // }
    //     // option_tags += `<option selected value="${tag[i].getAttribute("data-tag").split(",")[0]}">${tag[i].getAttribute("data-tag").split(",")[1]}</option>`


    //     // if (tag[i].getAttribute("data-tag").split(",")[0] == option_tag[i].value) {
    //     //     // tag_value.push(tag[i].getAttribute("data-tag").split(",")[0])
    //     //     option_tags += `<option selected value="${tag[i].getAttribute("data-tag").split(",")[0]}">${tag[i].getAttribute("data-tag").split(",")[1]}</option>`
    //     // } else {
    //     //     option_tags += `<option value="${option_tag[i].value}">${option_tag[i].outerText.trim()}</option>`
    //     // }
    // }
    // console.log("option_tags", option_tags);
    // for (let i = 0; i < option_tag.length; i++) {
    //     for (let j = 0; j < tag_value.length; j++) {
    //         if (option_tag[i].value == tag_value[j]) {
    //             option_tags += `<option selected value="${option_tag[i].value}">${option_tag[i].outerText.trim()}</option>`
    //         } else if (tag_value[i] == 0) {
    //             console.log("else");
    //             // option_tags += `<option  value="${option_tag[i].value}">${option_tag[i].outerText.trim()}</option>`
    //         }
    //     }
    // }


    // for (let i = 0; i < option_tag.length; i++) {
    //     var tag_value = []


    // }

    // console.log("option_tags", option_tags);
    // option_tag.innerHTML = option_tags

    // document.querySelector('#option_tag_test').innerHTML = option_tags

    if (status == "cancel") {
        option.innerHTML = `
        <option   value="1">Cookie ร่าง</option>
        <option  value="2">Cookie ใช้งาน</option>
        <option selected value="3">Cookie ยกเลิก</option>
        `;
    } else if (status == "use") {
        option.innerHTML = `
        <option   value="1">Cookie ร่าง</option>
        <option selected value="2">Cookie ใช้งาน</option>
        <option  value="3">Cookie ยกเลิก</option>
        `;
    } else {
        option.innerHTML = `
        <option selected   value="1">Cookie ร่าง</option>
        <option  value="2">Cookie ใช้งาน</option>
        <option  value="3">Cookie ยกเลิก</option>
        `;
    }

    document.getElementById("domain_edit").value = text_namedomain.split("//")[1];
    document.getElementById("message_edit").value = text_message;
    document.getElementById("id_edit").value = id.trim();
    document.getElementById("message-cookie_edit").value = text_cookie;
}


function delete_Tag(params) {
    // console.log(params);
    Swal.fire({
        title: 'คุณแน่ใจไหม',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#39c449',
        confirmButtonText: 'ตกลง'
    }).then((result) => {
        if (result.value) {
            Swal.fire(
                'ลบข้อมูลสำเร็จ',
                '',
                'success'
            )
            timer: 50000,
                window.location = '/deleteTag/' + params;
        }
    })
}

function tag_selecte(data) {
    var tag = data.split(",");
    var id_t = tag[0];
    var id_d = tag[1];
    var color = tag[2];
    var status = tag[3];
    $.ajax({
        type: 'GET',
        url: '/api/group_domain/' + id_t + '/' + id_d,
        success: function (result) {
            if (result.success == "success") {
                $('#tag_select_domain_' + id_d).append('<i class=" fas fa-tag" style="font-size: 20px;color:' + color + '"></i> ')
                document.getElementById("text_" + id_d + "_" + id_t).style.color = "grey";
                document.querySelector(".style_select_" + id_d + "_" + id_t).style.color = "grey";
                if (status == "use") {
                    $('#badge-group-item-use' + id_d).addClass("tag_show_" + id_t);
                } else if (status == "cancel") {
                    $('#badge-group-item-cancel' + id_d).addClass("tag_show_" + id_t);
                } else {
                    $('#badge-group-item' + id_d).addClass("tag_show_" + id_t);
                }
            } else {
                if (status == "use") {
                    $('#badge-group-item-use' + id_d).removeClass("tag_show_" + id_t);
                } else if (status == "cancel") {
                    $('#badge-group-item-cancel' + id_d).removeClass("tag_show_" + id_t);
                } else {
                    $('#badge-group-item' + id_d).removeClass("tag_show_" + id_t);
                }
                // $('#badge-group-item' + id_d).removeClass("tag_show_" + id_t) // ลบ class ไม่เลือกออก
                $('#tag_select_domain_' + result.id).empty() // ถ้าไม่ได้เลือกอะไรสักอย่างให่มันว่าง
                document.getElementById("text_" + id_d + "_" + id_t).style.color = color;
                document.querySelector(".style_select_" + id_d + "_" + id_t).style.color = color;
                for (let i = 0; i < result.domain_setting_tag.length; i++) {
                    $('#tag_select_domain_' + result.domain_setting_tag[i].id_dg).append('<i class=" fas fa-tag" style="font-size: 20px;color:' + result.domain_setting_tag[i].tag_styles + '"></i> ')
                }
            }
        },
        error: function (e) {
            console.log("error" + e);
        }
    });

}

function add_Group(id_group) {
    // var id_tag = id_group[0];
    var id_domain = id_group[1];
    var color = id_group[2];
    var icon = '<i class="icon_width  fas fa-tag" style="font-size: 25px;color:' + color + '"></i> '
    $('#tag_select_domain_' + id_domain).append(icon);

};

//สร้าง tag
var input = document.querySelector('input[name=tag_dg]');
var tagify = new Tagify(input);


function CookieTable(data) {

    let dataset = []
    for (let i = 0; i < data.length; i++) {
        dataset.push({
            no: i + 1,
            date_dg: data[i].date_dg,
            id_dg: data[i].id_dg,
            id_status: data[i].id_status,
            message: data[i].message,
            name_cookie: data[i].name_cookie,
            namedomain_dg: data[i].namedomain_dg,
            status_cookie_id: data[i].status_cookie_id,
            status_name: data[i].status_name,
            firstname: data[i].firstname,
            lastname: data[i].lastname,
        })
    }
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
        var content = '<table class="no-wrap table-striped table-bordered table-hover table" id="table_sortable">'
        content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
        content += '</table>'
        $('#CookieTable').append(content);
        var table = $('#table-body');
        var table_thead = $('#table-thead');
        var data = pagination(state.querySet, state.page, state.rows)
        var myList = data.querySet
        var show = [];
        var thead =
            `<tr>          
            <th>ลำดับ </th>
            <th> ชื่อโดเมน </th>
            <th> วันที่สร้าง </th>
            <th> ผู้สร้าง </th>
            <th> ชื่อคุกกี้ </th>
            <th> ข้อความ </th>
            <th> สถานะ </th>
            <th> รับสคริปต์</th>
            <th> ดูข้อมูล </th>
            <th> กำหนดสถานะ </th>
            <th> ลบข้อมูล </th>
        </tr> `;
        table_thead.append(thead)
        for (var i in myList) {
            let status = "";
            let GetScript = "-";
            let status_name = "";
            if (myList[i].status_cookie_id == 2) {
                status = "use"
                GetScript = `  <a class="btn btn-info" href="/management/script_banner/${myList[i].id_dg}">รับสคริปต์</a>`
                status_name = `<p id="status-${i}"
                class="form-control-static text-success">
                Cookie ใช้งาน </p>`
            } else if (myList[i].status_cookie_id == 1) {
                status = "draft"
                status_name = `<p id="status-${i}"
                class="form-control-static text-secondary">
                Cookie ร่าง </p>`
            } else {
                status = "cancel"
                status_name = `<p id="status-${i}"
                class="form-control-static text-danger">
                Cookie ร่าง </p>`
            }
            var row = `<tr class="${status}-${i}"><td>` + myList[i].no +
                `</td><td id="p-namedomain-${i}">` + myList[i].namedomain_dg +
                '</td><td>' + myList[i].date_dg +
                '</td><td>' + myList[i].firstname + " " + myList[i].lastname +
                `</td><td id="cookie_show-${i}">` + myList[i].name_cookie +
                `</td><td  id="h6-${i}">` + myList[i].message +
                '</td><td>' + status_name +
                '</td><td>' + GetScript +
                '</td><td>' + `<a class="text-info"  href="/dialogs/${myList[i].id_dg}"><i class=" fas fa-file-alt fa-2x"></i></a>` +
                `</td><td>
                <a onclick=" Edit(${i},'${status}','${myList[i].id_dg}')"
                class="text-warning" data-bs-toggle="modal"
                data-bs-target="#edit"><i class="fas fa-pencil-alt fa-2x"></i>
                </a>` +
                `</td><td>
                <a onclick="Delete(${i},'${status}','${myList[i].id_dg}')"
                data-bs-toggle="modal" data-bs-target="#delete" class="text-danger">
                <i class="fas fa-trash-alt fa-2x"></i></a>`+
                '</td></tr>'
            table.append(row)
            show.push(myList[i].no)
        }
        document.querySelector("#show").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
        document.querySelector("#to_show").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
        document.querySelector("#show_all").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
        pageButtons(data.pages)
    }



    document.getElementById('button-search').addEventListener('click', () => {
        var data = ({
            "text": $('#search').val().trim(),
        });
        $.ajax({
            type: "post",
            contentType: "application/json",
            url: '/api/cookies/search/text',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function (result) {
                if (result == "ไม่มีข้อมูล") {
                    $('#table_sortable').remove()
                    // $('.pagination').empty()
                    DataNull()
                } else {
                    $('#table_sortable').remove()
                    CookieTable(result)
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    });
};

