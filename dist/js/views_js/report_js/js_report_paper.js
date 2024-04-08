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
        $.ajax({
            type: 'GET',
            url: '/api/report/paperconsent',
            success: async function (result) {
                // console.log(result);
                if (result == "ไม่มีข้อมูล") {
                    ready_datanull()
                    icon_close("null")
                } else {
                    icon_close()
                    var data = await check_data(result)
                    await Tabeldata_paper(data)
                    await pie_paper(data)
                    await Graph_paper(data)
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    };
    get_data();

    let check_data = async (data) => {
        var check_data = []
        var data_after_check = []
        data.forEach(element => {
            if (check_data.indexOf(element.name.toLowerCase()) < 0) {
                check_data.push(element.name.toLowerCase());
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

    function ready_datanull() {
        var content = '<table class="tablesaw no-wrap table-striped table-bordered table-hover table" id="table_sortable">'
        content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
        content += '</table>'
        $('#table_show').append(content);
        var table_thead = $('#table-thead');
        var thead =
            `<tr>
                <th>ลำดับ</th>
                <th>ชื่อเอกสาร</th>
                <th>ชื่อ</th>
                <th>นามสกุล</th>
                <th>เบอร์โทรศัพท์</th>
                <th>ที่อยู่</th>
                <th>อื่นๆ</th>
                <th>วันที่ตอบกลับ</th>
                <th>สถานะ</th>
                </tr>`;
        table_thead.append(thead)
        $('#table-body').empty().append(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
                <b class="text-danger">ไม่พบข้อมูล</b>
            </td>
        </tr>`);
    };

    document.getElementById("search_date").addEventListener("click", () => {
        document.getElementById("Srearch").value = null
        var data = {
            "date_first": document.getElementById("firstDay").value,
            "date_last": document.getElementById("lastDay").value,
        }
        $.ajax({
            type: "post",
            contentType: "application/json",
            url: '/api/report/paperconsent/search_date',
            data: JSON.stringify(data),
            dataType: 'json',
            success: async function (result) {
                if (result == "ไม่มีข้อมูล") {
                    icon_close("null")
                    $('#table-body').empty().append(`
                    <tr>
                        <td colspan="20" class="text-center" style="border: none;">
                            <b class="text-danger">ไม่พบข้อมูล</b>
                        </td>
                    </tr>`);
                } else {
                    icon_close()
                    $('#revenue-statistics').empty()
                    $('#table_sortable').remove()
                    $('#table-body').remove()
                    var data = await check_data(result)
                    await Tabeldata_paper(data)
                    await pie_paper(data)
                    await Graph_paper(data)

                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    });

    document.getElementById("button-Srearch").addEventListener("click", () => {
        var data = {
            "text": document.getElementById("Srearch").value.trim(),
            "first": document.getElementById("firstDay").value,
            "last": document.getElementById("lastDay").value,
        }
        $.ajax({
            type: "post",
            contentType: "application/json",
            url: '/api/report/paperconsent/search_text',
            data: JSON.stringify(data),
            dataType: 'json',
            success: async function (result) {
                if (result == "ไม่มีข้อมูล") {
                    $('#table_sortable').remove()
                    ready_datanull()
                    icon_close("null")
                } else {
                    icon_close()
                    $('#table_sortable').remove()
                    $('#revenue-statistics').empty()
                    var data = await check_data(result)
                    await Tabeldata_paper(data)
                    await pie_paper(data)
                    await Graph_paper(data)
                }
            },
            error: function (e) {
                console.log(e);
                $('#table_sortable').remove()
                ready_datanull()
                icon_close()
            }
        });
    });

    document.getElementById("reface").addEventListener("click", () => {
        location.reload()
    });

    var csvFileData = []
    document.getElementById("csv").addEventListener("click", () => {
        var csvData = []
        var status = ""
        for (let i = 0; i < csvFileData.length; i++) {
            if (csvFileData[i].doc_consent_status == 1) {
                status = "ยินยอม"
            } else {
                status = "ไม่ยินยอม"
            }
            if (csvFileData[i].consent_firstname == null) {
                csvFileData[i].consent_firstname = "-"
            }
            if (csvFileData[i].consent_lastname == null) {
                csvFileData[i].consent_lastname = "-"
            }
            if (csvFileData[i].consent_phone == null) {
                csvFileData[i].consent_phone = "-"
            }
            if (csvFileData[i].consent_address == null) {
                csvFileData[i].consent_address = "-"
            }
            if (csvFileData[i].consent_other == "" || csvFileData[i].consent_other == null) {
                csvFileData[i].consent_other = "-"
            } else {
                csvFileData[i].consent_other = csvFileData[i].consent_other_name + " ( " + csvFileData[i].consent_other + " )"
            }
            csvData.push(
                [csvFileData[i].no,
                csvFileData[i].doc_name,
                csvFileData[i].consent_firstname + " " + csvFileData[i].consent_lastname,
                csvFileData[i].consent_phone,
                csvFileData[i].consent_address,
                csvFileData[i].consent_other,
                csvFileData[i].consent_date,
                    status
                ]
            )
        }
        var csv = 'ลำดับ,ชื่อเอกสาร,ชื่อ-นามสกุล,เบอร์โทรศัพท์,ที่อยู่,อื่นๆ,วันที่ตอบกลับ,สถานะ\n';
        csvData.forEach(function (row) {
            csv += row.join(',');
            csv += "\n";
        });
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'รายงาน Paper Consent.csv';
        hiddenElement.click();
    });

    document.getElementById("excel").addEventListener("click", () => {
        var excel = [];
        var status = ""
        for (let i = 0; i < csvFileData.length; i++) {
            if (csvFileData[i].doc_consent_status == 1) {
                status = "ยินยอม"
            } else {
                status = "ไม่ยินยอม"
            }
            if (csvFileData[i].consent_firstname == null) {
                csvFileData[i].consent_firstname = "-"
            }
            if (csvFileData[i].consent_lastname == null) {
                csvFileData[i].consent_lastname = "-"
            }
            if (csvFileData[i].consent_phone == null) {
                csvFileData[i].consent_phone = "-"
            }
            if (csvFileData[i].consent_address == null) {
                csvFileData[i].consent_address = "-"
            }
            if (csvFileData[i].consent_other == "" || csvFileData[i].consent_other == null) {
                csvFileData[i].consent_other = "-"
            } else {
                csvFileData[i].consent_other = csvFileData[i].consent_other_name + " ( " + csvFileData[i].consent_other + " )"
            }
            excel.push({
                'ลำดับ': csvFileData[i].no,
                'ชื่อเอกสาร': csvFileData[i].doc_name,
                'ชื่อ-นามสกุล': csvFileData[i].consent_firstname + " " + csvFileData[i].consent_lastname,
                'เบอร์โทรศัพท์': csvFileData[i].consent_phone,
                'ที่อยู่': csvFileData[i].consent_address,
                'อื่นๆ': csvFileData[i].consent_other,
                'วันที่ตอบกลับ': csvFileData[i].consent_date,
                'สถานะ': status
            })
        }
        let binaryWS = XLSX.utils.json_to_sheet(excel);
        var wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, binaryWS)
        XLSX.writeFile(wb, 'รายงาน Paper Consent.xlsx');
    });

    document.getElementById('pdf').addEventListener('click', () => {
        console.log("pdf", csvFileData);
        var myWindow = window.open('xxx', '_blank');
        var content = ""
        var status = ""
        for (let i = 0; i < csvFileData.length; i++) {
            if (csvFileData[i].doc_consent_status === 1) {
                status = "ยินยอม"
            } else {
                status = "ไม่ยินยอม"
            }
            if (csvFileData[i].consent_firstname == null) {
                csvFileData[i].consent_firstname = "-"
            }
            if (csvFileData[i].consent_lastname == null) {
                csvFileData[i].consent_lastname = "-"
            }
            if (csvFileData[i].consent_phone == null) {
                csvFileData[i].consent_phone = "-"
            }
            if (csvFileData[i].consent_address == null) {
                csvFileData[i].consent_address = "-"
            }
            if (csvFileData[i].consent_other == "" || csvFileData[i].consent_other == null) {
                csvFileData[i].consent_other = "-"
            } else {
                csvFileData[i].consent_other = csvFileData[i].consent_other_name + " ( " + csvFileData[i].consent_other + " )"
            }
            content +=
                '<tr><td>' + csvFileData[i].no +
                '</td><td>' + csvFileData[i].doc_name +
                '</td><td>' + csvFileData[i].consent_firstname + " " + csvFileData[i].consent_lastname +
                '</td><td>' + csvFileData[i].consent_phone +
                '</td><td>' + csvFileData[i].consent_address +
                '</td><td>' + csvFileData[i].consent_other +
                '</td><td>' + csvFileData[i].consent_date +
                '</td><td>' + status +
                '</td></tr>'
        }
        var header_content = `<table style="margin-top: 15px;">
        <thead> 
        <tr>
        <th>ลำดับ</th>
        <th>ชื่อเอกสาร</th>
        <th>ชื่อ-นามสกุล</th>
        <th>เบอร์โทรศัพท์</th>
        <th>ที่อยู่</th>
        <th>อื่นๆ</th>
        <th>วันที่ตอบกลับ</th>
        <th>สถานะ</th>
       </tr>
        </thead> 
        <tbody>`
        var footer_content = `</tbody></table>`
        myWindow.document.write("รายงาน  Paper Consent", header_content + content + footer_content)
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

    async function Tabeldata_paper(data) {
        var dataTable = [];
        csvFileData = []
        for (var i = 0; i < data.length; i++) {
            dataTable.push({
                "no": (i + 1),
                "consent_date": data[i].consent_date,
                "doc_consent_id": data[i].doc_consent_id,
                "doc_consent_status": data[i].doc_consent_status,
                "doc_date_create": data[i].doc_date_create,
                "doc_id": data[i].doc_id,
                "doc_name": data[i].doc_name,
                "consent_firstname": data[i].consent_firstname,
                "consent_lastname": data[i].consent_lastname,
                "consent_phone": data[i].consent_phone,
                "consent_address": data[i].consent_address,
                "consent_other": data[i].consent_other,
                "consent_other_name": data[i].consent_other_name
            });

            csvFileData.push({
                "no": (i + 1),
                "consent_date": data[i].consent_date,
                "doc_consent_id": data[i].doc_consent_id,
                "doc_consent_status": data[i].doc_consent_status,
                "doc_date_create": data[i].doc_date_create,
                "doc_id": data[i].doc_id,
                "doc_name": data[i].doc_name,
                "consent_firstname": data[i].consent_firstname,
                "consent_lastname": data[i].consent_lastname,
                "consent_phone": data[i].consent_phone,
                "consent_address": data[i].consent_address,
                "consent_other": data[i].consent_other,
                "consent_other_name": data[i].consent_other_name
            });

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
            $('#table_show').append(content);
            var table = $('#table-body');
            var table_thead = $('#table-thead');
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];
            var thead =
                `<tr>
                <th>ลำดับ</th>
                <th>ชื่อเอกสาร</th>
                <th>ชื่อ-นามสกุล</th>
                <th>เบอร์โทรศัพท์</th>
                <th>ที่อยู่</th>
                <th>อื่นๆ</th>
                <th>วันที่ตอบกลับ</th>
                <th>สถานะ</th>
                </tr>`;
            table_thead.append(thead)
            for (var i in myList) {
                var status;
                if (myList[i].doc_consent_status == 1) {
                    status = '<i class="fas fa-check fa-2x text-success"></i>'
                } else {
                    status = '<i class="fas fa-times fa-2x text-danger"></i>'
                }
                if (myList[i].consent_firstname == null) {
                    myList[i].consent_firstname = "-"
                }
                if (myList[i].consent_lastname == null) {
                    myList[i].consent_lastname = "-"
                }
                if (myList[i].consent_phone == null) {
                    myList[i].consent_phone = "-"
                }
                if (myList[i].consent_address == null) {
                    myList[i].consent_address = "-"
                }
                // if (myList[i].consent_other == null) {
                //     myList[i].consent_other = "-"
                // }
                if (myList[i].consent_other == "" || myList[i].consent_other == null) {
                    myList[i].consent_other = "-"
                } else {
                    myList[i].consent_other = myList[i].consent_other_name + " ( " + myList[i].consent_other + " )"
                }


                var row = '<tr><td>' + myList[i].no +
                    '</td><td>' + myList[i].doc_name +
                    '</td><td>' + myList[i].consent_firstname + " " + myList[i].consent_lastname +
                    '</td><td>' + myList[i].consent_phone +
                    '</td><td>' + myList[i].consent_address +
                    '</td><td>' + myList[i].consent_other +
                    '</td><td>' + myList[i].consent_date +
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
    };

    async function pie_paper(data) {
        var paper_consent = data;
        var sum_approve = 0;
        var sum_notagree = 0;
        for (let i = 0; i < paper_consent.length; i++) {
            if (paper_consent[i].doc_consent_status == 1) {
                sum_approve = sum_approve + 1
            } else if (paper_consent[i].doc_consent_status == 0) {
                sum_notagree = sum_notagree + 1
            }
        }
        var all = [{
            "value": sum_approve,
            "name": "ยินยอม"
        },
        {
            "value": sum_notagree,
            "name": "ไม่ยินยอม"
        }]

        var basicpieChart = echarts.init(document.getElementById('basic-pie-paper'));
        var option = {
            // Add title
            // title: {
            //     text: 'สัดส่วนข้อมูลตอบกลับ Paper Consent',
            //     x: 'center'
            // },

            // Add tooltip
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },

            // Add legend
            legend: {
                orient: 'vertical',
                x: 'left',
                data: ['ยินยอม', 'ไม่ยินยอม']
            },

            // Add custom colors
            // color: ['#ffbc34', '#f62d51'],
            color: ['#39c449', '#f62d51'],


            // Display toolbox
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
                    // dataView: {
                    //     show: true,
                    //     readOnly: false,
                    //     title: 'View data',
                    //     lang: ['View chart data', 'Close', 'Update']
                    // },
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
            calculable: true,
            series: [{
                name: 'Paper consent',
                type: 'pie',
                radius: '70%',
                center: ['50%', '57.5%'],
                data: all
            }]
        };
        basicpieChart.setOption(option);
    };

    async function Graph_paper(data) {
        var date_all = []
        data.forEach(element => {
            if (date_all.indexOf(element.consent_date.split(" ")[0]) < 0) {
                date_all.push(element.consent_date.split(" ")[0])
            }
        });
        let sorteddata = data.sort((r1, r2) => (r1.doc_consent_id > r2.doc_consent_id) ? 1 : (r1.doc_consent_id < r2.doc_consent_id) ? -1 : 0); //sort object
        date_all.sort()
        var grap = []
        var type = ["จำนวนที่ยินยอม", "จำนวนที่ไม่ยินยอม"]
        var status = ["1", "0"]
        for (let i = 0; i < type.length; i++) {
            var data_p = {
                name: '',
                data: [0],
            }
            data_p.name = (type[i]);
            for (let a = 0; a < date_all.length; a++) {
                if (status[i] == "1") {
                    for (let c = 0; c < sorteddata.length; c++) {
                        if (sorteddata[c].consent_date.split(" ")[0] == date_all[a] && sorteddata[c].doc_consent_status == status[i]) {
                            data_p.data[a] = data_p.data[a] + 1
                        } else if (sorteddata[c].consent_date.split(" ")[0] != date_all[a] && data_p.data[a] === 0 || data_p.data[a] === undefined || data_p.data[a] === NaN) {
                            data_p.data[a] = 0
                        }
                    }
                }
                if (status[i] == "0") {
                    for (let c = 0; c < sorteddata.length; c++) {
                        if (sorteddata[c].consent_date.split(" ")[0] == date_all[a] && sorteddata[c].doc_consent_status == status[i]) {
                            data_p.data[a] = data_p.data[a] + 1
                        }
                        else if (sorteddata[c].consent_date.split(" ")[0] != date_all[a] && data_p.data[a] === 0 || data_p.data[a] === undefined || data_p.data[a] === NaN) {
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
                colors: ["#39c449", "#f62d51"],
                // colors: ["#39c449", "#009efb"],

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
            // colors: ["#39c449", "#009efb"],

            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: "smooth",
                width: 2,
                colors: ["#39c449", "#f62d51"],
                // colors: ["#39c449", "#009efb"],

            },
            markers: {
                size: 5,
                colors: ["#39c449", "#f62d51"],
                // colors: ["#39c449", "#009efb"],
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

});