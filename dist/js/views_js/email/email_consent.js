
let date_default = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    document.getElementById(`firstDay`).value = firstDay.toLocaleDateString('en-GB').split('/').reverse().join('-')
    document.getElementById(`lastDay`).value = lastDay.toLocaleDateString('en-GB').split('/').reverse().join('-')
}


function resend_mail(id) {
    Swal.fire({
        title: 'ส่งใหม่',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#39c449',
        confirmButtonText: 'ตกลง'
    }).then((result) => {
        if (result.value) {
            Swal.fire(
                'ส่งใหม่สำเร็จ',
                '',
                'success'
            )
            $.ajax({
                type: 'GET',
                url: '/resend-email/' + id,
                success: async function (result) {
                    if (result == "ไม่มีข้อมูล") {
                        ready_datanull()
                    } else {
                        $('#table_sortable').remove()
                        await Tabeldata_ajax(result.pdpa_email)
                    }
                },
                error: function (e) {
                    console.log(e);
                }
            });

            setTimeout(function () {
                Swal.close();
            }, 1000);

        }
    })
}
function get_data() {
    date_default()
    $.ajax({
        type: 'GET',
        url: '/api/email_consent',
        success: async function (result) {
            if (result == "ไม่มีข้อมูล") {
                ready_datanull("first")
                document.getElementById('limit').innerHTML = `
                <a class="btn btn-success" id="inbox-email" href="/inbox-email">
                <i class="fas fa-plus"></i>
                เขียน E-mail</a>
                `
            } else {
                await Tabeldata_ajax(result.pdpa_email)
                if (result.limit_email === -1 || result.pdpa_email.length < result.limit_email) {
                    document.getElementById('limit').innerHTML = `
                    <a class="btn btn-success" id="inbox-email" href="/inbox-email">
                    <i class="fas fa-plus"></i>
                    เขียน E-mail</a>
                    `
                } else {
                    document.getElementById('limit').innerHTML = ` <button type="button" class="btn btn-success" disabled> <i class="fas fa-plus"></i> เขียน E-mail</button>`
                }
            }
        },
        error: function (e) {
            console.log(e);
        }
    });
}
get_data()


function ready_datanull(data) {
    // document.getElementById("email-approve").innerText = "-";
    // $('#email-approve-icon').removeClass().addClass('css-bar mb-0 css-bar-success css-bar-0')
    // document.getElementById("email-wait").innerText = "-";
    // $('#email-wait-icon').removeClass().addClass('css-bar mb-0 css-bar-warning css-bar-0')
    // document.getElementById("email-notagree").innerText = "-";
    // $('#email-notagree-icon').removeClass().addClass('css-bar mb-0 css-bar-danger css-bar-0')
    if (data == "first") {
        var content = '<table class="tablesaw no-wrap table-striped table-bordered table-hover table" id="table_sortable">'
        content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
        content += '</table>'
        $('#table_Data_Email_consent').append(content);
        var table_thead = $('#table-thead');
        var thead = `<tr>
                    <th>ลำดับ</th>
                    <th>อีเมล</th>
                    <th>หัวเรื่องอีเมล</th>
                    <th>วันที่จัดส่ง</th>
                    <th>สถานะ</th>
                    <th>ส่งใหม่</th>
                    </tr>`;
        table_thead.append(thead)
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
        document.querySelector("#show").innerHTML = 0
        document.querySelector("#to_show").innerHTML = 0
        document.querySelector("#show_all").innerHTML = 0
    }
};

document.getElementById('button-search').addEventListener('click', () => {
    var data = ({
        "data": $('#Srearch').val().trim(),
        "date_first": document.getElementById('firstDay').value,
        "date_last": document.getElementById('lastDay').value
    });
    if ($("#Srearch").val() == "") {
        data.data = 'all'
    }
    console.log(data);
    $.ajax({
        type: "post",
        contentType: "application/json",
        url: '/api/email_consent/search/text',
        data: JSON.stringify(data),
        dataType: 'json',
        success: async function (result) {
            if (result == "ไม่มีข้อมูล") {
                ready_datanull()
            } else {
                $('#table_sortable').remove()
                await Tabeldata_ajax(result)
            }
        },
        error: function (e) {
            console.log(e);
        }
    });

});

// document.getElementById('search_date_email').addEventListener('click', () => {
//     $('#Srearch').val()
//     var data = {
//         "date_first": document.getElementById('firstDay').value,
//         "date_last": document.getElementById('lastDay').value,
//     }
//     $.ajax({
//         type: "post",
//         contentType: "application/json",
//         url: '/api/email_consent/search/date',
//         data: JSON.stringify(data),
//         dataType: 'json',
//         success: async function (result) {
//             if (result == "ไม่มีข้อมูล") {
//                 ready_datanull()
//             } else {
//                 $('#table_sortable').remove()
//                 await Tabeldata_ajax(result)
//             }
//         },
//         error: function (e) {
//             console.log(e);
//         }
//     });
// })

async function Tabeldata_ajax(data) {
    var Getdata = [];
    for (var i = 0; i < data.length; i++) {
        Getdata.push({
            "no": (i + 1),
            "id_email": data[i].id_email,
            "content": data[i].email_content,
            "files": data[i].email_files,
            "status": data[i].email_status,
            "subject": data[i].email_subject,
            "email_to": data[i].email_to,
            "date_inbox": data[i].date_inbox,
            "email_firstname": data[i].email_firstname,
            "email_lastname": data[i].email_lastname,
            "date_consent": data[i].date_consent,
        });
    }
    var state = {
        'querySet': Getdata,
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
            // $('#table-body').empty()
            // $('#table-thead').empty()
            $('#table_sortable').remove()
            state.page = Number($(this).val())
            buildTable()
        })
    };


    function buildTable() {
        var content = '<table class="tablesaw no-wrap table-striped table-bordered table-hover table" id="table_sortable">'
        content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
        content += '</table>'
        $('#table_Data_Email_consent').append(content);
        var table = $('#table-body');
        var table_thead = $('#table-thead');
        var thead = `<tr>
                    <th>ลำดับ</th>
                    <th>อีเมล</th>
                    <th>หัวเรื่องอีเมล</th>
                    <th>ชื่อ-นามสกุล ผู้รับ</th>
                    <th>วันที่จัดส่ง</th>
                    <th>วันที่ตอบกลับ</th>
                    <th>ดูข้อมูล</th>
                    <th>สถานะ</th>
                    <th>ส่งใหม่</th>
                    </tr>`;
        table_thead.append(thead);
        var data = pagination(state.querySet, state.page, state.rows)
        var myList = data.querySet
        var show = [];
        var email_notagree = 0;
        var email_approve = 0;
        var wait_consent = 0;
        for (var i in myList) {
            var text_status = "";
            if (myList[i].status == 1) {
                text_status = '<i class="fas fa-check fa-2x text-success"></i>'
                email_approve += 1
            } else if (myList[i].status == 0) {
                text_status = '<i class="fas fa-hourglass-half fa-2x text-warning"></i>'
                wait_consent += 1
            } else {
                text_status = '<i class="fas fa-times fa-2x text-danger"></i>'
                email_notagree += 1
            }
            if (myList[i].date_consent == null) {
                myList[i].date_consent = "-"
            } else {
                myList[i].date_consent = myList[i].date_consent;
            }
            var row = '<tr><td>' + myList[i].no +
                '</td><td>' + myList[i].email_to +
                '</td><td>' + myList[i].subject +
                '</td><td>' + myList[i].email_firstname + " " + myList[i].email_lastname +
                '</td><td>' + myList[i].date_inbox +
                '</td><td>' + myList[i].date_consent +
                '</td><td>' + '<a class="text-info id_email"   href="/management/email_consent/previews/' + myList[i].id_email + '"><i class="fas fa-file-alt fa-2x"></i></a>' +
                '</td><td>' + text_status +
                '</td><td>' + '<a class="text-info" onclick="resend_mail(' + myList[i].id_email + ')"><i class="fas fa-sync-alt fa-2x"></i></a>' +
                '</td></tr>'
            table.append(row)
            show.push(myList[i].no)
        }
        document.querySelector("#show").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
        document.querySelector("#to_show").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
        document.querySelector("#show_all").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
        pageButtons(data.pages)



        // document.getElementById("email-approve").innerText = email_approve;
        // document.getElementById("email-notagree").innerText = email_notagree;
        // document.getElementById("email-wait").innerText = wait_consent;

        // if (email_approve == "0") {
        //     document.getElementById("email-approve").innerText = "-";
        //     $('#email-approve-icon').removeClass().addClass('css-bar mb-0 css-bar-success css-bar-0')
        // } else {
        //     document.getElementById("email-approve").innerText = email_approve;
        //     $('#email-approve-icon').removeClass().addClass('css-bar mb-0 css-bar-success css-bar-100')
        // }

        // if (wait_consent == "0") {
        //     document.getElementById("email-wait").innerText = "-";
        //     $('#email-wait-icon').removeClass().addClass('css-bar mb-0 css-bar-warning css-bar-0')
        // } else {
        //     document.getElementById("email-wait").innerText = wait_consent;
        //     $('#email-wait-icon').removeClass().addClass('css-bar mb-0 css-bar-warning css-bar-100')
        // }


        // if (email_notagree == "0") {
        //     document.getElementById("email-notagree").innerText = "-";
        //     $('#email-notagree-icon').removeClass().addClass('css-bar mb-0 css-bar-danger css-bar-0')
        // } else {
        //     document.getElementById("email-notagree").innerText = email_notagree;
        //     $('#email-notagree-icon').removeClass().addClass('css-bar mb-0 css-bar-danger css-bar-100')
        // }

    };
};

