$(function () {

    let date_default = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        document.getElementById(`firstDay`).value = firstDay.toLocaleDateString('en-GB').split('/').reverse().join('-')
        document.getElementById(`lastDay`).value = lastDay.toLocaleDateString('en-GB').split('/').reverse().join('-')
    }

    function get_data_appeal() {
        $.ajax({
            type: "get",
            url: '/api/report/appeal',
            success: async function (result) {
                date_default()
                if (result == 'ไม่มีข้อมูล') {
                    ready_datanull()
                    icon_close("null")
                } else {
                    icon_close()
                    let data = await check_data(result.data_table)
                    await Tabeldata_report_appeal(data)
                    await graph_appeal(data);
                    await pie_appeal(data);
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    }
    get_data_appeal()

    function ready_datanull() {
        var content = '<table class="tablesaw no-wrap table-striped table-bordered table-hover table" id="table_sortable">'
        content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
        content += '</table>'
        $('#table_data_appeal').append(content);
        var table_thead = $('#table-thead');
        var thead =
            `<tr>
        <th>ลำดับ</th>
        <th>ชื่อ-นามสกุล ผู้ร้องเรียน</th>
        <th>ที่อยู่</th>
        <th>ช่องทางติดต่อ</th>
        <th>รายละเอียดร้องเรียน</th>
        <th>วันที่ร้องเรียน</th>
        <th>วันที่ตอบกลับ</th>
        <th>สถานะ</th>
        </tr>`;
        table_thead.append(thead)
        $('#table-body').empty()
        $('#table-body').empty().append(`
                    <tr>
                        <td colspan="20" class="text-center" style="border: none;">
                            <b class="text-danger">ไม่พบข้อมูล</b>
                        </td>
                    </tr>`);
    };

    let check_data = async (data) => {
        var check_data = []
        var data_after_check = []
        data.forEach(element => {
            if (check_data.indexOf(element.name) < 0) {
                check_data.push(element.name)
                data_after_check.push(element)
            }
        });
        return data_after_check
    }


    function icon_close(data) {
        if (data == "null") {
            document.querySelector('.not_allowed').style.cssText = "cursor: not-allowed;"
            document.getElementById('csv').style.cssText = "pointer-events: none;"
            document.getElementById('excel').style.cssText = "pointer-events: none;"
            document.getElementById('pdf').style.cssText = "pointer-events: none;"
        } else {
            document.querySelector('.not_allowed').style.cssText = ""
            document.getElementById('csv').style.cssText = ""
            document.getElementById('excel').style.cssText = ""
            document.getElementById('pdf').style.cssText = ""
        }

    }

    document.getElementById('reface').addEventListener('click', () => {
        location.reload();
    });

    var csvFileData = []
    document.getElementById("csv").addEventListener("click", () => {
        var csvData = []
        var status = ""
        for (let i = 0; i < csvFileData.length; i++) {
            var complain = ""
            if (csvFileData[i].approved == 1) {
                status = "ยินยอม"
            } else {
                status = "ไม่ยินยอม"
            }
            if (csvFileData[i].appeal_detail == null || csvFileData[i].appeal_detail == "") {
                csvFileData[i].appeal_detail = "-"
            }
            if (csvFileData[i].appeal_contact == null || csvFileData[i].appeal_contact == "") {
                csvFileData[i].appeal_contact = "-"
            }
            if (csvFileData[i].appeal_revoke == 1) { complain += " การเพิกถอนความยินยอม/" }
            if (csvFileData[i].appeal_access == 1) { complain += " การเข้าถึงข้อมูลส่วนบุคคล/" }
            if (csvFileData[i].appeal_edit_information == 1) { complain += " การเเก้ไขข้อมูลส่วนบุคคลให้ถูกต้อง/" }
            if (csvFileData[i].appeal_delet_information == 1) { complain += " การลบข้อมูลส่วนบุคคล/" }
            if (csvFileData[i].appeal_suspend == 1) { complain += " การระงับการประมวลผลข้อมูล/" }
            if (csvFileData[i].appeal_transfer == 1) { complain += " การให้โอนย้ายข้อมูลส่วนบุคคล/" }
            if (csvFileData[i].appeal_oppose == 1) { complain += " การคัดค้านการประมวลผลข้อมูล/" }
            if (csvFileData[i].appeal_decision == 1) { complain += " การไม่ตกอยู่ภายใต้การสินใจอัตโตโนมัตเพียงอย่างเดียว/" }
            csvData.push(
                [csvFileData[i].no,
                csvFileData[i].name,
                csvFileData[i].appeal_address,
                csvFileData[i].appeal_contact,
                csvFileData[i].appeal_detail,
                    complain,
                csvFileData[i].appeal_date,
                csvFileData[i].appeal_date_approve,
                    status
                ]
            )
        }
        var csv = 'ลำดับ,ชื่อ-นามสกุล ผู้ร้องเรียน,ที่อยู่,ช่องทางติดต่อ,รายละเอียดร้องเรียน,สิทธิการร้องเรียน,วันที่ร้องเรียน,วันที่ตอบกลับ,สถานะ\n';
        csvData.forEach(function (row) {
            csv += row.join(',');
            csv += "\n";
        });
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'รับเรื่องร้องเรียน.csv';
        hiddenElement.click();
    });

    document.getElementById("excel").addEventListener("click", () => {
        var excel = [];
        var status = ""
        for (let i = 0; i < csvFileData.length; i++) {
            var complain = ""
            if (csvFileData[i].approved == 1) {
                status = "ยินยอม"
            } else {
                status = "ไม่ยินยอม"
            }
            if (csvFileData[i].appeal_detail == null || csvFileData[i].appeal_detail == "") {
                csvFileData[i].appeal_detail = "-"
            }
            if (csvFileData[i].appeal_contact == null || csvFileData[i].appeal_contact == "") {
                csvFileData[i].appeal_contact = "-"
            }
            if (csvFileData[i].appeal_revoke == 1) { complain += " การเพิกถอนความยินยอม/" }
            if (csvFileData[i].appeal_access == 1) { complain += " การเข้าถึงข้อมูลส่วนบุคคล/" }
            if (csvFileData[i].appeal_edit_information == 1) { complain += " การเเก้ไขข้อมูลส่วนบุคคลให้ถูกต้อง/" }
            if (csvFileData[i].appeal_delet_information == 1) { complain += " การลบข้อมูลส่วนบุคคล/" }
            if (csvFileData[i].appeal_suspend == 1) { complain += " การระงับการประมวลผลข้อมูล/" }
            if (csvFileData[i].appeal_transfer == 1) { complain += " การให้โอนย้ายข้อมูลส่วนบุคคล/" }
            if (csvFileData[i].appeal_oppose == 1) { complain += " การคัดค้านการประมวลผลข้อมูล/" }
            if (csvFileData[i].appeal_decision == 1) { complain += " การไม่ตกอยู่ภายใต้การสินใจอัตโตโนมัตเพียงอย่างเดียว/" }
            excel.push({
                'ลำดับ': csvFileData[i].no,
                'ชื่อ-นามสกุล ผู้ร้องเรียน': csvFileData[i].name,
                'ที่อยู่': csvFileData[i].appeal_address,
                'ช่องทางติดต่อ': csvFileData[i].appeal_contact,
                'รายละเอียดร้องเรียน': csvFileData[i].appeal_detail,
                'สิทธิการร้องเรียน': complain,
                'วันที่ร้องเรียน': csvFileData[i].appeal_date,
                'วันที่ตอบกลับ': csvFileData[i].appeal_date_approve,
                'สถานะ': status
            })
        }
        let binaryWS = XLSX.utils.json_to_sheet(excel);
        var wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, binaryWS)
        XLSX.writeFile(wb, 'รับเรื่องร้องเรียน.xlsx');
    });


    document.getElementById('pdf').addEventListener('click', () => {
        var myWindow = window.open('xxx', '_blank');
        var content = ""
        var status = ""
        for (let i = 0; i < csvFileData.length; i++) {
            var complain = ""
            if (csvFileData[i].approved === 1) {
                status = "ยินยอม"
            } else {
                status = "ไม่ยินยอม"
            }
            if (csvFileData[i].appeal_detail == null || csvFileData[i].appeal_detail == "") {
                csvFileData[i].appeal_detail = "-"
            }
            if (csvFileData[i].appeal_contact == null || csvFileData[i].appeal_contact == "") {
                csvFileData[i].appeal_contact = "-"
            }

            if (csvFileData[i].appeal_revoke == 1) { complain += " การเพิกถอนความยินยอม/" }
            if (csvFileData[i].appeal_access == 1) { complain += " การเข้าถึงข้อมูลส่วนบุคคล/" }
            if (csvFileData[i].appeal_edit_information == 1) { complain += " การเเก้ไขข้อมูลส่วนบุคคลให้ถูกต้อง/" }
            if (csvFileData[i].appeal_delet_information == 1) { complain += " การลบข้อมูลส่วนบุคคล/" }
            if (csvFileData[i].appeal_suspend == 1) { complain += " การระงับการประมวลผลข้อมูล/" }
            if (csvFileData[i].appeal_transfer == 1) { complain += " การให้โอนย้ายข้อมูลส่วนบุคคล/" }
            if (csvFileData[i].appeal_oppose == 1) { complain += " การคัดค้านการประมวลผลข้อมูล/" }
            if (csvFileData[i].appeal_decision == 1) { complain += " การไม่ตกอยู่ภายใต้การสินใจอัตโตโนมัตเพียงอย่างเดียว/" }


            content +=
                '<tr><td>' + csvFileData[i].no +
                '</td><td>' + csvFileData[i].name +
                '</td><td>' + csvFileData[i].appeal_address +
                '</td><td>' + csvFileData[i].appeal_contact +
                '</td><td>' + csvFileData[i].appeal_detail +
                '</td><td>' + complain +
                '</td><td>' + csvFileData[i].appeal_date +
                '</td><td>' + csvFileData[i].appeal_date_approve +
                '</td><td>' + status +
                '</td></tr>'
        }
        var header_content = `<table style="margin-top: 15px;">
        <thead> 
        <tr>
        <th>ลำดับ</th>
        <th>ชื่อ-นามสกุล ผู้ร้องเรียน</th>
        <th>ที่อยู่</th>
        <th>ช่องทางติดต่อ</th>
        <th>รายละเอียดร้องเรียน</th>
        <th>สิทธิการร้องเรียน</th>
        <th>วันที่ร้องเรียน</th>
        <th>วันที่ตอบกลับ</th>
        <th>สถานะ</th>
       </tr>
        </thead> 
        <tbody>`
        var footer_content = `</tbody></table>`
        myWindow.document.write("รับเรื่องร้องเรียน", header_content + content + footer_content)
        myWindow.document.write(`
            <style>
            table {
              font-family: arial, sans-serif;
              border-collapse: collapse;
            }
            td, th {
              border: 1px solid #dddddd;
              text-align: left;
              padding: 8px;
            }
            td {
                font-size:12px;
            }
            </style>
             <script>
              window.print();
             </script>
             `
        );
    })

    document.getElementById('button-addon2').addEventListener('click', () => {
        var data = {
            "text": document.getElementById('Srearch').value.trim(),
            "firstDay": document.getElementById("firstDay").value,
            "lastDay": document.getElementById("lastDay").value,
        }
        $.ajax({
            type: "post",
            contentType: "application/json",
            url: '/api/report/appeal/search_text',
            data: JSON.stringify(data),
            dataType: 'json',
            success: async (result) => {
                if (result == "ไม่มีข้อมูล") {
                    $("#table_sortable").remove()
                    ready_datanull()
                    icon_close("null")
                } else {
                    $("#table_sortable").remove()
                    icon_close()
                    $("#revenue-statistics").empty()
                    let data = await check_data(result.data_table)
                    await Tabeldata_report_appeal(data)
                    await graph_appeal(data);
                    await pie_appeal(data);
                }
            }
        })

    });

    document.getElementById("search_date").addEventListener("click", () => {
        document.getElementById('Srearch').value = null
        var data = {
            "firstDay": document.getElementById("firstDay").value,
            "lastDay": document.getElementById("lastDay").value,
        }
        $.ajax({
            type: "post",
            contentType: "application/json",
            url: '/api/report/appeal/search_date',
            data: JSON.stringify(data),
            dataType: 'json',
            success: async (result) => {
                if (result === "ไม่มีข้อมูล") {
                    $('#table_sortable').remove()
                    ready_datanull()
                    icon_close("null")
                } else {
                    icon_close()
                    $('#table_sortable').remove()
                    $('#revenue-statistics').empty()
                    let data = await check_data(result.data_table)
                    await Tabeldata_report_appeal(data)
                    await graph_appeal(data);
                    await pie_appeal(data);
                }

            },
            error: function (e) {
                console.log(e);
            }
        });
    });

    async function Tabeldata_report_appeal(data) {
        var dataTable = [];
        csvFileData = []
        for (var i = 0; i < data.length; i++) {
            dataTable.push({
                "no": (i + 1),
                "appeal_address": data[i].appeal_address,
                "approved": data[i].appeal_approved_complaint,
                "appeal_detail": data[i].appeal_detail,
                "appeal_contact": data[i].appeal_contact,
                "name": data[i].name,
                "appeal_date": data[i].day,
                "appeal_date_approve": data[i].day_approve,
                "appeal_revoke": data[i].appeal_revoke,
                "appeal_access": data[i].appeal_access,
                "appeal_edit_information": data[i].appeal_edit_information,
                "appeal_delet_information": data[i].appeal_delet_information,
                "appeal_suspend": data[i].appeal_suspend,
                "appeal_transfer": data[i].appeal_transfer,
                "appeal_oppose": data[i].appeal_oppose,
                "appeal_decision": data[i].appeal_decision,
            });
            csvFileData = dataTable
        }
        var state = {
            'querySet': dataTable,
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
            $('#table_data_appeal').append(content);
            var table = $('#table-body');
            var table_thead = $('#table-thead');
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];
            var thead =
                `<tr>
            <th>ลำดับ</th>
            <th>ชื่อ-นามสกุล ผู้ร้องเรียน</th>
            <th>ที่อยู่</th>
            <th>ช่องทางติดต่อ</th>
            <th>รายละเอียดร้องเรียน</th>
            <th>สิทธิการร้องเรียน</th>
            <th>วันที่ร้องเรียน</th>
            <th>วันที่ตอบกลับ</th>
            <th>สถานะ</th>
            </tr>`;
            table_thead.append(thead)
            for (let i in myList) {
                let status;
                var complain = []
                if (myList[i].approved == 1) {
                    status = '<i class="fas fa-check fa-2x text-success"></i>'
                } else {
                    status = '<i class="fas fa-times fa-2x text-danger"></i>'
                }
                if (myList[i].appeal_detail == "") {
                    myList[i].appeal_detail = "-"
                } else {
                    myList[i].appeal_detail = myList[i].appeal_detail
                }
                if (myList[i].appeal_revoke == 1) { complain.push(" การเพิกถอนความยินยอม") }
                if (myList[i].appeal_access == 1) { complain.push(" การเข้าถึงข้อมูลส่วนบุคคล") }
                if (myList[i].appeal_edit_information == 1) { complain.push(" การเเก้ไขข้อมูลส่วนบุคคลให้ถูกต้อง") }
                if (myList[i].appeal_delet_information == 1) { complain.push(" การลบข้อมูลส่วนบุคคล") }
                if (myList[i].appeal_suspend == 1) { complain.push(" การระงับการประมวลผลข้อมูล") }
                if (myList[i].appeal_transfer == 1) { complain.push(" การให้โอนย้ายข้อมูลส่วนบุคคล") }
                if (myList[i].appeal_oppose == 1) { complain.push(" การคัดค้านการประมวลผลข้อมูล") }
                if (myList[i].appeal_decision == 1) { complain.push(" การไม่ตกอยู่ภายใต้การสินใจอัตโตโนมัตเพียงอย่างเดียว") }

                if (complain[4]) {
                    complain[4] = "<br>" + complain[4]
                }
                var row = '<tr><td>' + myList[i].no +
                    '</td><td>' + myList[i].name +
                    '</td><td>' + myList[i].appeal_address +
                    '</td><td>' + myList[i].appeal_contact +
                    '</td><td>' + myList[i].appeal_detail +
                    '</td><td>' + complain +
                    '</td><td>' + myList[i].appeal_date +
                    '</td><td>' + myList[i].appeal_date_approve +
                    '</td><td>' + status +
                    '</td></tr>'
                table.append(row)
                show.push(myList[i].no)
            }
            document.querySelector("#show").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
            document.querySelector("#to_show").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
            document.querySelector("#show_all").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
            pageButtons(data.pages)
        }
    }

    async function graph_appeal(data) {
        var date_all = []
        data.forEach(element => {
            if (date_all.indexOf(element.appeal_date_approve.split(" ")[0]) < 0) {
                date_all.push(element.appeal_date_approve.split(" ")[0])
            }
        });
        let sorteddata = data.sort((r1, r2) => (r1.id_ap > r2.id_ap) ? 1 : (r1.id_ap < r2.id_ap) ? -1 : 0); //sort object
        date_all.sort()


        var grap = []
        var type = ["จำนวนที่อนุมัติ", "จำนวนที่ไม่อนุมัติ"]
        var status = ["1", "2"]
        for (let i = 0; i < type.length; i++) {
            var data_p = {
                name: '',
                data: [0],
            }
            data_p.name = (type[i]);
            for (let a = 0; a < date_all.length; a++) { // date
                if (status[i] == "1") {
                    for (let c = 0; c < sorteddata.length; c++) {
                        if (sorteddata[c].appeal_date_approve == date_all[a] && sorteddata[c].appeal_approved_complaint == status[i]) {
                            data_p.data[a] = data_p.data[a] + 1
                        }
                        else if (sorteddata[c].appeal_date_approve != date_all[a] && data_p.data[a] == 0 || data_p.data[a] == undefined || data_p.data[a] === NaN) {
                            data_p.data[a] = 0
                        }
                    }
                }
                if (status[i] == "2") {
                    for (let c = 0; c < sorteddata.length; c++) {
                        if (sorteddata[c].appeal_date_approve == date_all[a] && sorteddata[c].appeal_approved_complaint == status[i]) {
                            data_p.data[a] = data_p.data[a] + 1
                        }
                        else if (sorteddata[c].appeal_date_approve != date_all[a] && data_p.data[a] == 0 || data_p.data[a] == undefined || data_p.data[a] === NaN) {
                            data_p.data[a] = 0
                        }
                    }
                }
            }
            grap.push(data_p);
        }




        var Revenue_Statistics = {
            series: grap,
            chart: {
                fontFamily: 'Rubik,sans-serif',
                height: 350,
                type: "area",
                toolbar: {
                    show: false,
                },
            },
            fill: {
                type: 'solid',
                opacity: 0.2,
                colors: ["#f62d51", "#39c449"],
            },
            grid: {
                show: true,
                borderColor: "rgba(0,0,0,0.1)",
                strokeDashArray: 3,
                xaxis: {
                    lines: {
                        show: true
                    }
                },
            },
            colors: ["#39c449", "#f62d51"],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: "smooth",
                width: 2,
                colors: ["#39c449", "#f62d51"],
            },
            markers: {
                size: 5,
                colors: ["#39c449", "#f62d51"],
                strokeColors: "transparent",
            },
            xaxis: {
                axisBorder: {
                    show: true,
                },
                axisTicks: {
                    show: true,
                },
                // categories: [day_Graphsend][day_Graphsend], // จำนวน ข้อมูล แกน x
                categories: date_all, // จำนวน ข้อมูล แกน x
                labels: {
                    style: {
                        colors: "#a1aab2",
                    },
                },
            },
            yaxis: {
                // categories: day_Graphsend, // จำนวน ข้อมูล แกน x
                tickAmount: 9,
                labels: {
                    style: {
                        colors: "#a1aab2",
                    },
                },
            },
            tooltip: {
                x: {
                    format: "dd/MM/yy HH:mm",
                },
                theme: "dark",
            },
            legend: {
                show: false,
            },
        };

        var chart_area_spline = new ApexCharts(document.querySelector("#revenue-statistics"), Revenue_Statistics);
        chart_area_spline.render();
    };

    async function pie_appeal(data) {
        var sum_approve = 0;
        var sum_notagree = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i].appeal_approved_complaint == 1) {
                sum_approve = sum_approve + 1
            } else {
                sum_notagree = sum_notagree + 1
            }
        }
        var all = [{
            "value": sum_approve,
            "name": "อนุมัติ"
        },
        {
            "value": sum_notagree,
            "name": "ไม่อนุมัติ"
        }]
        var basicpieChart = echarts.init(document.getElementById('basic-pie-appeal'));
        var option = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
                orient: 'value',
                x: 'left',
            },
            color: ['#39c449', '#f62d51'],
            toolbox: {
                show: true,
                orient: 'vertical',
                feature: {
                    mark: {
                        show: true,
                        title: {
                            mark: 'Markline switch',
                            markUndo: 'Undo markline',
                            markClear: 'Clear markline'
                        }
                    },
                    magicType: {
                        show: true,
                        title: {
                            pie: 'Switch to pies',
                            funnel: 'Switch to funnel',
                        },
                        type: ['pie', 'funnel'],
                        option: {
                            funnel: {
                                x: '25%',
                                y: '20%',
                                width: '50%',
                                height: '70%',
                                funnelAlign: 'left',
                                max: 1548
                            }
                        }
                    }
                }
            },
            // Enable drag recalculate
            calculable: true,
            // Add series
            series: [{
                name: 'รับเรื่องร้องเรียน',
                type: 'pie',
                radius: '60%',
                center: ['50%', '57.5%'],
                data: all
            }]
        };
        basicpieChart.setOption(option);
    };
});