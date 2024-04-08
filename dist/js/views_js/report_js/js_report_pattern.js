$(function () {
    let date_default = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        document.getElementById(`firstDay`).value = firstDay.toLocaleDateString('en-GB').split('/').reverse().join('-')
        document.getElementById(`lastDay`).value = lastDay.toLocaleDateString('en-GB').split('/').reverse().join('-')
    }
    function get_data(data) {
        date_default()
        $.ajax({ // ready get api date
            type: 'GET',
            url: '/api/report/pattern',
            success: async function (result) {
                if (result.data_nul == "ไม่มีข้อมูล") {
                    await ready_datanull()
                    icon_close("null")
                } else {
                    icon_close()

                    await Tabeldata_ajax(result)
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    };
    get_data()

    $("#reface").on("click", function (e) {
        location.reload();
    });

    async function ready_datanull() {
        $('#revenue-statistics').empty()
        $('#basic-pie-paper').empty()

        var content = '<table class="tablesaw no-wrap table-striped table-bordered table-hover table" id="table_sortable" data-tablesaw-sortable>'
        content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
        content += '</table>'
        $('#table_Data-cookie').append(content);
        $('#table_sortable').attr('data-tablesaw-sortable');
        var table = $('#table-body');
        var table_thead = $('#table-thead');

        var thead =
            '<tr>' +
            '<th>ลำดับ</th>' +
            '<th>ชื่อ Pattern</th>' +
            '<th>ผู้สร้าง</th>' +
            '<th>วันที่สร้าง</th>' +
            '<th>เอกสาร</th>' +
            '<th>ข้อมูลส่วนบุคคล</th>' +
            '<th>เริ่ม</th>' +
            '<th>ระยะเวลาจัดเก็บ</th>' +
            '<th>ฐานประมวลผล</th>' 
            +
            '</tr >';
        table_thead.append(thead)
        $('#table-body').empty().append(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
                 <b class="text-danger">ไม่พบข้อมูล</b>
             </td>
        </tr>`);

    };


    function icon_close() {
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

    document.getElementById("button-addon2").addEventListener("click", () => {
        var data = ({
            "text": document.getElementById('Srearch').value.trim(),
            "firstDay": document.getElementById('firstDay').value,
            "lastDay": document.getElementById('lastDay').value
        });
        $.ajax({
            type: "post",
            contentType: "application/json",
            url: '/api/search/report/pattern',
            data: JSON.stringify(data),
            dataType: 'json',
            success: async function (result) {
                if (result == "ไม่มีข้อมูล") {
                    icon_close("null")
                    ready_datanull()
                } else {
                    icon_close()
                    $('#table_sortable').remove()
                    $('#revenue-statistics').empty()
                    await Tabeldata_ajax(result)
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    });

    document.getElementById("search_date").addEventListener("click", () => {
        var data = {
            "firstDay": document.getElementById("firstDay").value,
            "lastDay": document.getElementById("lastDay").value,
        }
        $.ajax({
            type: "post",
            contentType: "application/json",
            url: '/api/report/pattern/search_date',
            data: JSON.stringify(data),
            dataType: 'json',
            success: async function (result) {
                if (result == "ไม่มีข้อมูล") {
                    icon_close("null")
                    ready_datanull()
                } else {
                    icon_close()
                    $('#table_sortable').remove()
                    $('#revenue-statistics').empty()
                    await Tabeldata_ajax(result)
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    });


    var csvFileData = []
    var cookiepolicy;
    document.getElementById("csv").addEventListener("click", () => {
        var csvData = []
        var status = []
        for (let i = 0; i < csvFileData.length; i++) {
            
            csvData.push(
                [csvFileData[i].no,
                csvFileData[i].pattern_name ,
                csvFileData[i].user,
                csvFileData[i].day_pattern_create ,
                csvFileData[i].list_policy ,
                csvFileData[i].list_data.toString().replace(/,/g, ""),
                csvFileData[i].day_pattern_start_date  ,
                csvFileData[i].pattern_total_date  ,
                csvFileData[i].pattern_processing_base_name  

                ]
            )
        }
        
        var csv = `ลำดับ,ชื่อPattern,ผู้สร้าง,วันที่สร้าง,เอกสาร,ข้อมูลส่วนบุคคล,เริ่ม,ระยะเวลาจัดเก็บ,ฐานประมวลผล\n`;
        csvData.forEach(function (row) {
            csv += row.join(',');
            csv += "\n";
        });
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'ข้อมูลตาม Pattern.csv';
        hiddenElement.click();
    });

    document.getElementById("excel").addEventListener("click", () => {
        var excel = [];
        var type = []
        var status = []
        for (let j = 0; j < cookiepolicy.length; j++) {
            type.push(cookiepolicy[j].name_cp)
        }
        for (let i = 0; i < csvFileData.length; i++) {
            for (var k in cookiepolicy) {
                if (csvFileData[i].cookiepolicy[k] == 1) {
                    status.push("ยินยอม")
                } else {
                    status.push("ไม่ยินยอม")
                }
            }
            var object_exce = {
                ลำดับ: csvFileData[i].no,
                ชื่อPattern: csvFileData[i].pattern_name,
                ผู้สร้าง: csvFileData[i].user,
                วันที่สร้าง: csvFileData[i].day_pattern_create,
                เอกสาร: csvFileData[i].list_policy,
                ข้อมูลส่วนบุคคล: csvFileData[i].list_data,
                เริ่ม: csvFileData[i].day_pattern_start_date,
                ระยะเวลาจัดเก็บ: csvFileData[i].pattern_total_date,
                ฐานประมวลผล: csvFileData[i].pattern_processing_base_name
            }
            
            excel.push(object_exce)
        }
        let binaryWS = XLSX.utils.json_to_sheet(excel);
        var wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, binaryWS)
        XLSX.writeFile(wb, 'ข้อมูลตาม Pattern.xlsx');
    });

    document.getElementById('pdf').addEventListener('click', function (event) {
        event.preventDefault();
        var myWindow = window.open('xxx', '_blank');
        var type = ""
        for (let j = 0; j < cookiepolicy.length; j++) {
            type += `<th>${cookiepolicy[j].name_cp}</th>`
        }
        // var csv = `ลำดับ,ชื่อโดเมน,ไอพีแอดเดรส,เบราว์เซอร์,เซสชั่นไอดี,วันที่${type}\n`;
        var header_content = `<table style="margin-top: 15px;">
        <thead> 
        <tr>
        <th>ลำดับ</th>
        <th>ชื่อPattern</th>
        <th>ผู้สร้าง</th>
        <th>วันที่สร้าง</th>
        <th>เอกสาร</th>
        <th>ข้อมูลส่วนบุคคล</th>
        <th>เริ่ม</th>
        <th>ระยะเวลาจัดเก็บ</th>
        <th>ฐานประมวลผล</th>
       </tr>
        </thead> 
        <tbody>`
        var content = ""
        var status = ""
        for (let i = 0; i < csvFileData.length; i++) {
            
            content +=
                '<tr><td>' + csvFileData[i].no +
                '</td><td>' + csvFileData[i].pattern_name +
                '</td><td>' + csvFileData[i].user +
                '</td><td>' + csvFileData[i].day_pattern_create +
                '</td><td>' + csvFileData[i].list_policy +
                '</td><td>' + csvFileData[i].list_data.toString().replace(/,/g, "") +
                '</td><td>' + csvFileData[i].day_pattern_start_date +
                '</td><td>' + csvFileData[i].pattern_total_date +
                '</td><td>' + csvFileData[i].pattern_processing_base_name +
                status
            '</td></tr>'
        }
        var footer_content = `</tbody></table>`
        myWindow.document.write("ข้อมูลตาม Pattern", header_content + content + footer_content)
        myWindow.document.write(`
            <style>
            table {
              font-family: arial, sans-serif;
              border-collapse: collapse;
              width: 100%;
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


    async function Tabeldata_ajax(data) {
        console.log(data);
        var pattern = data.pattern_data
        var data_pattern = [];
        csvFileData = [];
        for (var i = 0; i < pattern.length; i++) {
            data_pattern.push({
                "no": (i + 1),
                "pattern_name": pattern[i].pattern.pattern_name,
                "user": pattern[i].pattern.name,
                "day_pattern_create": pattern[i].pattern.day_pattern_create,
                "list_policy": pattern[i].policy,
                "list_data": pattern[i].pdpa_data,
                "day_pattern_start_date": pattern[i].pattern.day_pattern_start_date,
                "pattern_total_date": pattern[i].pattern.pattern_total_date,
                "pattern_processing_base_name": pattern[i].pattern.pattern_processing_base_name
            });

            csvFileData.push({
                "no": (i + 1),
                "pattern_name": pattern[i].pattern.pattern_name,
                "user": pattern[i].pattern.name,
                "day_pattern_create": pattern[i].pattern.day_pattern_create,
                "list_policy": pattern[i].policy,
                "list_data": pattern[i].pdpa_data,
                "day_pattern_start_date": pattern[i].pattern.day_pattern_start_date,
                "pattern_total_date": pattern[i].pattern.pattern_total_date,
                "pattern_processing_base_name": pattern[i].pattern.pattern_processing_base_name
            });
        }

        var state = {
            'querySet': data_pattern,
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
            $('#table_Data-cookie').append(content);
            $('#table_sortable').attr('data-tablesaw-sortable');
            var table = $('#table-body');
            var table_thead = $('#table-thead');

            var thead =
            '<tr>' +
            '<th>ลำดับ</th>' +
            '<th>ชื่อ Pattern</th>' +
            '<th>ผู้สร้าง</th>' +
            '<th>วันที่สร้าง</th>' +
            '<th>เอกสาร</th>' +
            '<th>ข้อมูลส่วนบุคคล</th>' +
            '<th>เริ่ม</th>' +
            '<th>ระยะเวลาจัดเก็บ</th>' +
            '<th>ฐานประมวลผล</th>' 
            +
            '</tr >';
            table_thead.append(thead)


            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];
            for (var i in myList) {

                var row = '<tr>' +
                    '<td>' + myList[i].no + '</td>' +
                    '<td>' + myList[i].pattern_name + '</td>' +
                    '<td>' + myList[i].user + '</td>' +
                    '<td>' + myList[i].day_pattern_create + '</td>' +
                    '<td>' + myList[i].list_policy + '</td>' +
                    '<td>' + myList[i].list_data.toString().replace(/,/g, "") + '</td>' +
                    '<td>' + myList[i].day_pattern_start_date + '</td>' +
                    '<td>' + myList[i].pattern_total_date + '</td>' +
                    '<td>' + myList[i].pattern_processing_base_name + '</td>' +
                    '</tr>';
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