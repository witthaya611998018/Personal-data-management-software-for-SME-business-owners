

let date_default = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    document.getElementById(`firstDay`).value = firstDay.toLocaleDateString('en-GB').split('/').reverse().join('-')
    document.getElementById(`lastDay`).value = lastDay.toLocaleDateString('en-GB').split('/').reverse().join('-')
}

function get_data_list(params) {
    date_default()
    $.ajax({
        type: 'get',
        url: '/api/appeal/infraction/list',
        success: async function (result) {
            if (result.infraction == 'ไม่มีข้อมูล') {
                $('#tbody').empty().append(`
                <tr>
                    <td colspan="20" class="text-center" style="border: none;">
                     <b class="text-danger">ไม่พบข้อมูล</b>
                    </td>
                </tr>
                `)
            } else {
                Data_Table(result.infraction, result.infractiontype, result.email_owner_check, result.email_board)
            }
        },
        error: function (e) {
            console.log(e);
        }
    })
}
get_data_list()


function data_null() {
    $('#tbody').empty().append(`
    <tr>
        <td colspan="20" class="text-center" style="border: none;">
         <b class="text-danger">ไม่พบข้อมูล</b>
        </td>
    </tr>
    `)
    var appeal_high_risk = document.getElementById('appeal-high-risk')
    var appeal_risk = document.getElementById('appeal-risk')
    var appeal_note_risk = document.getElementById('appeal-not-risk')
    $('#appeal-high-risk-icon').removeClass().addClass('css-bar mb-0 css-bar-danger css-bar-0')
    $('#appeal-risk-icon').removeClass().addClass('css-bar mb-0 css-bar-warning css-bar-0')
    $('#appeal-not-risk-icon').removeClass().addClass('css-bar mb-0 css-bar-success css-bar-0')
    appeal_high_risk.innerHTML = "-"
    appeal_risk.innerHTML = "-"
    appeal_note_risk.innerHTML = "-"
}
function Data_Table(data, type, email_check, email_check_board) {
    if (data == 'ไม่มีข้อมูล') {
        data_null()
    } else {
        var high_risk = 0;
        var risk = 0;
        var not_risk = 0;
        for (var i = 0; i < data.length; i++) {
            data[i].no = i + 1
            if (data[i].combined_assess_risk == 2) {
                high_risk = high_risk + 1
            } else if (data[i].combined_assess_risk == 1) {
                risk = risk + 1
            } else {
                not_risk = not_risk + 1
            }
        }
        var appeal_high_risk = document.getElementById('appeal-high-risk')
        var appeal_risk = document.getElementById('appeal-risk')
        var appeal_note_risk = document.getElementById('appeal-not-risk')

        if (high_risk == 0) {
            appeal_high_risk.innerHTML = "-"
            $('#appeal-high-risk-icon').removeClass().addClass('css-bar mb-0 css-bar-danger css-bar-0')
        } else {
            appeal_high_risk.innerHTML = high_risk
            $('#appeal-high-risk-icon').removeClass().addClass('css-bar mb-0 css-bar-danger css-bar-100')
        }
        if (risk == 0) {
            appeal_risk.innerHTML = "-"
            $('#appeal-risk-icon').removeClass().addClass('css-bar mb-0 css-bar-warning css-bar-0')
        } else {
            appeal_risk.innerHTML = risk
            $('#appeal-risk-icon').removeClass().addClass('css-bar mb-0 css-bar-warning css-bar-100')
        }
        if (not_risk == 0) {
            appeal_note_risk.innerHTML = "-"
            $('#appeal-not-risk-icon').removeClass().addClass('css-bar mb-0 css-bar-success css-bar-0')
        } else {
            appeal_note_risk.innerHTML = not_risk
            $('#appeal-not-risk-icon').removeClass().addClass('css-bar mb-0 css-bar-success css-bar-100')
        }

        var state = {
            'querySet': data,
            'page': 1,
            'rows': 30, // จำนวน row
            'window': 10000, // จำนวนหน้าที่เเสดง
        }
        var arr_type = []
        var arr_name = []

        for (let j = 0; j < type.length; j++) {
            arr_type.push(type[j].infractiontype_id)
            arr_name.push(type[j].infractiontype_name)
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


        function time_diff(date, date_now) {
            var date1 = new Date(date);
            var date2 = new Date(date_now);
            var diff = date2.getTime() - date1.getTime();
            var msec = diff;
            var hh = Math.floor(msec / 1000 / 60 / 60);
            msec -= hh * 1000 * 60 * 60;
            // var mm = Math.floor(msec / 1000 / 60);
            // msec -= mm * 1000 * 60;
            // var ss = Math.floor(msec / 1000);
            // msec -= ss * 1000;
            // console.log("เวลา", hh);
            return hh
            // if (hh > 0) {
            //     time = hh
            // }
        }


        function buildTable() {
            var table = $('#tbody');
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];


            for (var i in myList) {

                let Violation = ''
                if (myList[i].infractiontype_type_violation_id != null) {
                    let type_Violation = myList[i].infractiontype_type_violation_id.split(',')
                    for (let j = 0; j < arr_type.length; j++) {
                        if ((type_Violation.indexOf(String(arr_type[j]))) > -1) {
                            Violation += arr_name[j] + "<br>"
                        }
                    }
                } else {
                    Violation = '-'
                }

                let id_check = undefined
                let id_board = undefined
                if (email_check != 'ไม่มีข้อมูล') {
                    id_check = email_check.findIndex(item => { return item.infraction_id == myList[i].id_infraction_id });
                }
                if (email_check_board != 'ไม่มีข้อมูล') {
                    id_board = email_check_board.findIndex(item => { return item.infraction_id == myList[i].id_infraction_id });
                }

                let date_personal = '-'
                let date_board = '-'
                let infringements = ''
                let time_show = ''

                if (myList[i].infraction_infringement == 1) {
                    infringements = 'ใช่การละเมิด'
                    if (email_check_board[id_board] != undefined) {
                        date_board = `
                        ส่งเเล้ว
                        <a class="text-info" target="_blank" href="/email-board/view-information/${email_check_board[id_board].board_id}" ><i class=" fas fa-file-alt fa-2x"></i></a>
                        <br>   
                        <label style="font-size: 15px;" class="text-info""> ${email_check_board[id_board].day_inbox}</label>
                        `
                    } else {
                        let time = time_diff(myList[i].date_insert, myList[i].date_now)
                        if (time > 0) {
                            time_show = time
                        }
                        date_board = `
                        ยังไม่ส่ง  <font class="text-danger">${time} ชม </font>
                        `
                    }

                    if (email_check[id_check] != undefined) {
                        date_personal = `
                            ส่งเเล้ว
                            <a class="text-info" target="_blank" href="/email-board/view-information/${email_check[id_check].board_id}" ><i class=" fas fa-file-alt fa-2x"></i></a>
                            <br>
                            <label style="font-size: 15px;" class="text-info""> ${email_check[id_check].day_inbox}</label>
                            `
                    } else {
                        let time = time_diff(myList[i].date_insert, myList[i].date_now)
                        if (time > 0) {
                            time_show = time
                        }
                        date_personal = `
                        ยังไม่ส่ง <font class="text-danger">${time} ชม </font>
                        `
                    }
                } else {
                    infringements = 'ไม่ใช่การละเมิด'
                }
                let risk = ''
                if (myList[i].combined_assess_risk == 1) {
                    risk = `เสี่ยง <a class="text-info" href="/appeal/infraction/detail/${myList[i].id_infraction_id}" ><i class=" fas fa-file-alt fa-2x"></i></a>`
                } else if (myList[i].combined_assess_risk == 2) {
                    risk = `เสี่ยงสูง <a class="text-info" href="/appeal/infraction/detail/${myList[i].id_infraction_id}" ><i class=" fas fa-file-alt fa-2x"></i></a>`
                } else {
                    risk = '-'
                }
                let annotation = '-'
                if (myList[i].combined_annotation != null) {
                    annotation = myList[i].combined_annotation + ` <a class="text-info" target="_blank" href="/appeal/infraction/detail/${myList[i].id_infraction_id}" ><i class=" fas fa-file-alt fa-2x"></i></a>`
                }
                var row = `<tr>
                            <td>${myList[i].no}</td>
                            <td>${myList[i].prefix_name}${myList[i].infraction_firstname} ${myList[i].infraction_lastname}</td>           
                            <td>
                                ${myList[i].infraction_complaint_number}
                                <p style="font-size: 15px;" class="text-info">
                                ${myList[i].day_complaint}
                                </p>
                            </td>
                            <td>${infringements}</td>
                            <td>${Violation}</td>
                            <td><a class="text-info" href="/appeal/infraction/detail/${myList[i].id_infraction_id}" ><i class=" fas fa-file-alt fa-2x"></i></a></td>
                            <td>${risk} </td>
                            <td>
                           ${date_personal}
                            </td>
                            <td>${date_board}</td>
                            <td>${annotation}</td>
                            <td><a href="/appeal/infraction/edit/${myList[i].id_infraction_id}"  class="text-warning">
                                <i class="fas fa-pencil-alt fa-2x"></i>
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


document.getElementById('button-search').addEventListener('click', () => {

    let data = {
        'text': document.getElementById('search').value.trim(),
        'firstDay': document.getElementById('firstDay').value,
        'lastDay': document.getElementById('lastDay').value
    }
    $.ajax({
        type: 'post',
        contentType: 'application/json',
        url: `/api/appeal/infraction/search`,
        data: JSON.stringify(data),
        dataType: 'json',
        success: async function (result) {
            if (result.infraction == 'ไม่มีข้อมูล') {
                data_null()
            } else {
                $('#tbody').empty()
                Data_Table(result.infraction, result.infractiontype)
            }
        },
        error: function (e) {
            console.log(e);
        }
    })
})