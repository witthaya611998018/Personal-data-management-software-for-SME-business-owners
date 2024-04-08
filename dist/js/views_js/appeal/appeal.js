



$(function () {
    let date_default = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        document.getElementById(`firstDay`).value = firstDay.toLocaleDateString('en-GB').split('/').reverse().join('-')
        document.getElementById(`lastDay`).value = lastDay.toLocaleDateString('en-GB').split('/').reverse().join('-')
    }

    function get_data() {
        date_default()
        $.ajax({ // ready get api date
            type: 'GET',
            url: '/api/get/appeal',
            success: async function (result) {
                if (result == "ไม่มีข้อมูล") {
                    data_null("first")
                } else {
                    await Tabeldata_ajax(result.pdpa_appeal);
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    }
    get_data()


    $("#reface").on("click", function (e) {
        location.reload();
    });

    function data_null(data) {
        if (data == "first") {
            var content = '<table class="tablesaw no-wrap table-striped table-bordered table-hover table" id="table_sortable" data-tablesaw-sortable>'
            content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
            content += '</table>'
            $('#table_Data-appeal').append(content);
            var table_thead = $('#table-thead');
            var thead =
                `<tr>
                    <th data-tablesaw-sortable-col>ลำดับ</th>
                    <th data-tablesaw-sortable-col> ชื่อผู้ร้องเรียน นามสกุล</th>
                    <th data-tablesaw-sortable-col>ที่อยู่</th>
                    <th data-tablesaw-sortable-col>ช่องทางติดต่อ</th>
                    <th data-tablesaw-sortable-col>รายละเอียดร้องเรียน</th>
                    <th data-tablesaw-sortable-col>วันที่ร้องเรียน</th>
                    <th data-tablesaw-sortable-col>เเชร์ข้อมูล</th>
                    <th data-tablesaw-sortable-col>ดูข้อมูล</th>
                    <th data-tablesaw-sortable-col>สถานะ</th>
                    </tr>`;
            table_thead.append(thead)
            $('#table-body').empty().append(`
            <tr>
                <td colspan="20" class="text-center" style="border: none;">
                     <b class="text-danger">ไม่พบข้อมูล</b>
                 </td>
            </tr>`);
            document.querySelector("#show").innerHTML = 0;
            document.querySelector("#to_show").innerHTML = 0;
            document.querySelector("#show_all").innerHTML = 0;
        } else {
            document.getElementById('appeal-wait').innerHTML = "-"
            $('#appeal-wait-icon').removeClass().addClass('css-bar mb-0 css-bar-warning css-bar-0')
            document.getElementById('appeal-notagree').innerHTML = "-"
            $('#appeal-notagree-icon').removeClass().addClass('css-bar mb-0 css-bar-success css-bar-0')
            document.getElementById('appeal-approve').innerHTML = "-"
            $('#appeal-approve-icon').removeClass().addClass('css-bar mb-0 css-bar-success css-bar-0')
            $('#table-body').empty().append(`
            <tr>
                <td colspan="20" class="text-center" style="border: none;">
                     <b class="text-danger">ไม่พบข้อมูล</b>
                 </td>
            </tr>`);
            document.querySelector("#show").innerHTML = 0;
            document.querySelector("#to_show").innerHTML = 0;
            document.querySelector("#show_all").innerHTML = 0;
        }
    };
    document.getElementById('button-search').addEventListener('click', () => {
        var text = (document.getElementById('Srearch').value).trim()
        var data = {
            "text": text,
            'date_first': document.getElementById('firstDay').value,
            'date_last': document.getElementById('lastDay').value,
        }
        if (text == '') {
            data.text = 'all'
        }

        $.ajax({ // Srearch get api date
            type: "post",
            contentType: "application/json",
            url: '/api/get/appeal/search',
            data: JSON.stringify(data),
            dataType: 'json',
            success: async function (result) {
                if (result == "ไม่มีข้อมูล") {
                    data_null()
                } else {
                    $('#table_sortable').remove();
                    await Tabeldata_ajax(result);
                }
            },
            error: function (e) {
                console.log(e);

            }
        });
    })

    // document.getElementById('search_date_appeal').addEventListener('click', () => {
    //     document.getElementById('Srearch').value = null
    //     var data = {
    //         date_first: document.getElementById('firstDay').value,
    //         date_last: document.getElementById('lastDay').value,
    //     }
    //     $.ajax({ // Srearch get api date
    //         type: "post",
    //         contentType: "application/json",
    //         url: '/api/get/appeal/date',
    //         data: JSON.stringify(data),
    //         dataType: 'json',
    //         success: async function (result) {
    //             if (result == "ไม่มีข้อมูล") {
    //                 data_null()
    //             } else {
    //                 $('#table_sortable').remove();
    //                 await Tabeldata_ajax(result);
    //             }
    //         },
    //         error: function (e) {
    //             console.log(e);
    //         }
    //     });

    // });

    async function Tabeldata_ajax(data) {
        console.log(data);
        var Getdata = [];
        var wait = 0;
        var notagree = 0;
        var approve = 0;
        for (var i = 0; i < data.length; i++) {
            Getdata.push({
                "no": (i + 1),
                "id_ap": data[i].id_ap,
                "address": data[i].appeal_address,
                "approved_complaint": data[i].appeal_approved_complaint,
                "contact": data[i].appeal_contact,
                "date": data[i].appeal_date,
                "detail": data[i].appeal_detail,
                "firstname": data[i].appeal_firstname,
                "lastname": data[i].appeal_lastname,
                "prefix": data[i].prefix_name,
                "share": data[i].appeal_share,
                "date_approve": data[i].appeal_date_approve,
                "classify_name": data[i].classify_name,
            });

            if (data[i].appeal_approved_complaint == 0) {
                wait = wait + 1
            } else if (data[i].appeal_approved_complaint == 1) {
                approve = approve + 1
            } else {
                notagree = notagree + 1
            }

        }

        var appeal_wait = document.getElementById('appeal-wait')
        var appeal_notagree = document.getElementById('appeal-notagree')
        var appeal_approve = document.getElementById('appeal-approve')

        if (wait == 0) {
            appeal_wait.innerHTML = "-"
            $('#appeal-wait-icon').removeClass().addClass('css-bar mb-0 css-bar-warning css-bar-0')
        } else {
            appeal_wait.innerHTML = wait
            $('#appeal-wait-icon').removeClass().addClass('css-bar mb-0 css-bar-warning css-bar-100')
        }
        if (notagree == 0) {
            appeal_notagree.innerHTML = "-"
            $('#appeal-notagree-icon').removeClass().addClass('css-bar mb-0 css-bar-success css-bar-0')
        } else {
            appeal_notagree.innerHTML = notagree
            $('#appeal-notagree-icon').removeClass().addClass('css-bar mb-0 css-bar-danger css-bar-100')
        }
        if (approve == 0) {
            appeal_approve.innerHTML = "-"
            $('#appeal-approve-icon').removeClass().addClass('css-bar mb-0 css-bar-success css-bar-0')
        } else {
            appeal_approve.innerHTML = approve
            $('#appeal-approve-icon').removeClass().addClass('css-bar mb-0 css-bar-success css-bar-100')
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
            var content = '<table class="tablesaw no-wrap table-striped table-bordered table-hover table" id="table_sortable" data-tablesaw-sortable>'
            content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
            content += '</table>'
            $('#table_Data-appeal').append(content);
            // $('#table_sortable').attr('data-tablesaw-sortable');
            var table = $('#table-body');
            var table_thead = $('#table-thead');
            var thead =
                `<tr>
                    <th data-tablesaw-sortable-col>ลำดับ</th>
                    <th data-tablesaw-sortable-col> ชื่อผู้ร้องเรียน นามสกุล</th>
                    <th data-tablesaw-sortable-col>ที่อยู่/ข้อมูลติดต่อกลับ</th>
                    <th data-tablesaw-sortable-col>ช่องทางติดต่อกลับ</th>
                    <th data-tablesaw-sortable-col>กิจกรรมการประมวลผล</th>
                    <th data-tablesaw-sortable-col>รายละเอียดร้องเรียน</th>
                    <th data-tablesaw-sortable-col>วันที่ร้องเรียน</th>
                    <th data-tablesaw-sortable-col>วันที่ตอบกลับ</th>
                    <th data-tablesaw-sortable-col>เเชร์ข้อมูล</th>
                    <th data-tablesaw-sortable-col>ดูข้อมูล</th>
                    <th data-tablesaw-sortable-col>สถานะ</th>
                    </tr>`;
            table_thead.append(thead)


            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];


            for (var i in myList) {
                var text_status = "";
                if (myList[i].approved_complaint == 1) {
                    text_status = '<i class="fas fa-check fa-2x text-success"></i>'
                } else if (myList[i].approved_complaint == 0) {
                    text_status = '<i class="fas fa-hourglass-half fa-2x text-warning"></i>'
                } else {
                    text_status = '<i class="fas fa-times fa-2x text-danger"></i>'
                }
                if (myList[i].detail) {
                    myList[i].detail = myList[i].detail
                } else {
                    myList[i].detail = "-"
                }
                if (myList[i].date_approve == null) { myList[i].date_approve = "-" }
                if (myList[i].classify_name == null) { myList[i].classify_name = "-" }
                var row =
                    '<tr><td>' + myList[i].no +
                    '</td><td>' + myList[i].prefix + myList[i].firstname + " " + myList[i].lastname +
                    '</td><td>' + myList[i].address +
                    '</td><td>' + myList[i].contact +
                    '</td><td>' + myList[i].classify_name +
                    '</td><td>' + myList[i].detail +
                    '</td><td>' + myList[i].date +
                    '</td><td>' + myList[i].date_approve +
                    '</td><td>' + 'เเชร์ข้อมูล' +
                    '</td><td>' + '<a class="text-info"  href="/appreal_information/' + myList[i].id_ap + '"><i class=" fas fa-file-alt fa-2x"></i></a>' +
                    '</td><td>' + text_status +
                    '</td></tr>'
                table.append(row)
                show.push(myList[i].no)
            }
            document.querySelector("#show").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
            document.querySelector("#to_show").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
            document.querySelector("#show_all").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
            pageButtons(data.pages)
        };
    };

});