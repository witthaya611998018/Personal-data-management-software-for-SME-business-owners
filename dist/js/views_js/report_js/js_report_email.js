

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
            url: '/api/report/emailconsent',
            success: async function (result) {
                if (result == "ไม่มีข้อมูล") {
                    ready_datanull()
                    icon_close("null")
                } else {
                    let data = await check_data(result)
                    await Tabeldata_ajax(data)
                    await Graph_email(data);
                    await pie_email(data);
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    };
    get_data()

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

    let check_data = async (data) => {
        var check_data = []
        var data_after_check = []
        data.forEach(element => {
            if (check_data.indexOf(element.doc_email) < 0) {
                check_data.push(element.doc_email)
                data_after_check.push(element)
            }
        });
        return data_after_check
    }



    $("#reface").on("click", function (e) { // กรณีกดปุ่ม reface
        location.reload()
    });

    document.getElementById("button-Srearch").addEventListener("click", () => {
        var data = ({
            "text": document.getElementById("Srearch").value.trim(),
            "first": document.getElementById("firstDay").value,
            "last": document.getElementById("lastDay").value,
        });
        $.ajax({ // Srearch get api date
            type: "post",
            contentType: "application/json",
            url: '/api/report/emailconsent/search_text',
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
                    $('#table_sortable').remove();
                    $('#revenue-statistics').empty()
                    let data = await check_data(result)
                    await Tabeldata_ajax(data)
                    await Graph_email(data);
                    await pie_email(data);
                }

            },
            error: function (e) {
                console.log(e);
            }
        });
    });


    document.getElementById("search_date").addEventListener("click", () => {
        document.getElementById("Srearch").value = null
        var data = {
            "date_first": document.getElementById("firstDay").value,
            "date_last": document.getElementById("lastDay").value,
        }
        $.ajax({
            type: "post",
            contentType: "application/json",
            url: '/api/report/emailconsent/search_date',
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
                    $('#table_sortable').remove()
                    $('#revenue-statistics').empty()
                    let data = await check_data(result)
                    await Tabeldata_ajax(data)
                    await pie_email(data)
                    await Graph_email(data)
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    });


    function ready_datanull() {
        var content = '<table class="tablesaw no-wrap table-striped table-bordered table-hover table" id="table_sortable">'
        content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
        content += '</table>'
        $('#table_show').append(content);
        var table_thead = $('#table-thead');
        var thead =
            `<tr>
     <th data-tablesaw-sortable-col data-tablesaw-sortable-default-col>ลำดับ</th>
     <th data-tablesaw-sortable-col data-tablesaw-sortable-default-col>อีเมล</th>
     <th data-tablesaw-sortable-col data-tablesaw-sortable-default-col>หัวข้ออีเมล</th>
     <th data-tablesaw-sortable-col data-tablesaw-sortable-default-col>วันที่ส่ง</th>
     <th data-tablesaw-sortable-col data-tablesaw-sortable-default-col>วันที่ตอบกลับ</th>
     <th data-tablesaw-sortable-col data-tablesaw-sortable-default-col>สถานะ</th>
    </tr>`;
        table_thead.append(thead)
        $('#table-body').empty().append(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
                <b class="text-danger">ไม่พบข้อมูล</b>
            </td>
        </tr>`);
        var graph = document.getElementById('revenue-statistics')
        graph.classList = "information-found"
        graph.innerText = "ไม่พบข้อมูล"
        var pie = document.getElementById('basic-pie-email')
        pie.classList = "information-found"
        pie.innerText = "ไม่พบข้อมูล"
    };


    var csvFileData = []
    document.getElementById("csv").addEventListener("click", () => {
        var csvData = []
        for (let i = 0; i < csvFileData.length; i++) {
            var status;
            if (csvFileData[i].status == 1) {
                status = "ยินยอม"
            } else {
                status = "ไม่ยินยอม"
            }
            csvData.push(
                [csvFileData[i].no,
                csvFileData[i].to,
                csvFileData[i].subject,
                csvFileData[i].email_firstname + " " + csvFileData[i].email_lastname,
                csvFileData[i].date_send,
                csvFileData[i].date_consent, status
                ]
            )
        }
        var csv = 'ลำดับ,อีเมล,หัวข้ออีเมล,ชื่อ-นามสกุล ผู้รับ,วันที่ส่ง,วันที่ตอบกลับ,สถานะ\n';
        csvData.forEach(function (row) {
            csv += row.join(',');
            csv += "\n";
        });
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'รายงาน E-mail Consent.csv';
        hiddenElement.click();
    });


    document.getElementById("excel").addEventListener("click", () => {
        var excel = [];
        for (let i = 0; i < csvFileData.length; i++) {
            var status;
            if (csvFileData[i].status == 1) {
                status = "ยินยอม"
            } else {
                status = "ไม่ยินยอม"
            }
            excel.push({
                'ลำดับ': csvFileData[i].no,
                'อีเมล': csvFileData[i].to,
                'หัวข้ออีเมล': csvFileData[i].subject,
                'ชื่อ-นามสกุล ผู้รับ': csvFileData[i].email_firstname + " " + csvFileData[i].email_lastname,
                'วันที่ส่ง': csvFileData[i].date_send,
                'วันที่ตอบกลับ': csvFileData[i].date_consent,
                'สถานะ': status
            })
        }
        let binaryWS = XLSX.utils.json_to_sheet(excel);
        var wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, binaryWS)
        XLSX.writeFile(wb, 'รายงาน E-mail Consent.xlsx');
    });


    document.getElementById('pdf').addEventListener('click', function (event) {
        event.preventDefault();
        var myWindow = window.open('xxx', '_blank');
        var content = ""
        for (let i = 0; i < csvFileData.length; i++) {
            var status;
            if (csvFileData[i].status == 1) {
                status = 'ยินยอม'
            } else {
                status = 'ไม่ยินยอม'
            }
            if (csvFileData[i].email_firstname == null) {
                csvFileData[i].email_firstname = "-"
            } if (csvFileData[i].email_lastname == null) {
                csvFileData[i].email_lastname = "-"
            }
            content +=
                '<tr><td>' + csvFileData[i].no +
                '</td><td>' + csvFileData[i].to +
                '</td><td>' + csvFileData[i].subject +
                '</td><td>' + csvFileData[i].email_firstname + " " + csvFileData[i].email_lastname +
                '</td><td>' + csvFileData[i].date_send +
                '</td><td>' + csvFileData[i].date_consent +
                '</td><td>' + status +
                '</td></tr>'
        }

        var header_content = `<table style="margin-top: 15px;">
        <thead> 
        <tr>
        <th>ลำดับ</th>
        <th>อีเมล</th>
        <th>หัวข้ออีเมล</th>
        <th>ชื่อ-นามสกุล ผู้รับ</th>
        <th>วันที่ส่ง</th>
        <th>วันที่ตอบกลับ</th>
        <th>สถานะ</th>
       </tr>
        </thead> 
        <tbody>`
        var footer_content = `</tbody></table>`
        myWindow.document.write("รายงาน  E-mail Consent", header_content + content + footer_content)
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
        csvFileData = [];
        var dataTable = [];
        for (var i = 0; i < data.length; i++) {
            dataTable.push({
                "no": (i + 1),
                "date_send": data[i].date_send,
                "date_consent": data[i].date_consent,
                "subject": data[i].email_subject,
                "status": data[i].email_status,
                "to": data[i].email_to,
                "email_firstname": data[i].email_firstname,
                "email_lastname": data[i].email_lastname,
            });
            csvFileData.push({
                "no": (i + 1),
                "date_send": data[i].date_send,
                "date_consent": data[i].date_consent,
                "subject": data[i].email_subject,
                "status": data[i].email_status,
                "to": data[i].email_to,
                "email_firstname": data[i].email_firstname,
                "email_lastname": data[i].email_lastname
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
         <th>อีเมล</th>
         <th>หัวข้ออีเมล</th>
         <th>ชื่อ-นามสกุล ผู้รับ</th>
         <th>วันที่ส่ง</th>
         <th>วันที่ตอบกลับ</th>
         <th>สถานะ</th>
        </tr>`;
            table_thead.append(thead)
            for (var i in myList) {
                var status;
                if (myList[i].status == 1) {
                    status = '<i class="fas fa-check fa-2x text-success"></i>'
                } else {
                    status = '<i class="fas fa-times fa-2x text-danger"></i>'
                }
                if (myList[i].email_firstname == null) {
                    myList[i].email_firstname = "-"
                } if (myList[i].email_lastname == null) {
                    myList[i].email_lastname = "-"
                }
                var row = '<tr><td>' + myList[i].no +
                    '</td><td>' + myList[i].to +
                    '</td><td>' + myList[i].subject +
                    '</td><td>' + myList[i].email_firstname + " " + myList[i].email_lastname +
                    '</td><td>' + myList[i].date_send +
                    '</td><td>' + myList[i].date_consent +
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

    async function Graph_email(data) {
        var date_all = []
        data.forEach(element => {
            if (date_all.indexOf(element.date_consent.split(" ")[0]) < 0) {
                date_all.push(element.date_consent.split(" ")[0])
            }
        });
        let sorteddata = data.sort((r1, r2) => (r1.id_email > r2.id_email) ? 1 : (r1.id_email < r2.id_email) ? -1 : 0); //sort object
        date_all.sort()
        var grap = []
        var type = ["จำนวนที่ยินยอม", "จำนวนที่ไม่ยินยอม"]
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
                        if (sorteddata[c].date_consent.split(" ")[0] == date_all[a] && sorteddata[c].email_status == status[i]) {
                            data_p.data[a] = data_p.data[a] + 1
                        } else if (sorteddata[c].date_consent.split(" ")[0] != date_all[a] && data_p.data[a] === 0 || data_p.data[a] === undefined || data_p.data[a] === NaN) {
                            data_p.data[a] = 0
                        }
                    }
                }
                if (status[i] == "2") {
                    for (let c = 0; c < sorteddata.length; c++) {
                        if (sorteddata[c].date_consent.split(" ")[0] == date_all[a] && sorteddata[c].email_status == status[i]) {
                            data_p.data[a] = data_p.data[a] + 1
                        }
                        else if (sorteddata[c].date_consent.split(" ")[0] != date_all[a] && data_p.data[a] === 0 || data_p.data[a] === undefined || data_p.data[a] === NaN) {
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
                categories: date_all,
                labels: {
                    style: {
                        colors: "#a1aab2",
                    },
                },
            },
            yaxis: {
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

    async function pie_email(data) {
        var sum_approve = 0;
        var sum_notagree = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i].email_status == 1) {
                sum_approve = sum_approve + 1
            } else if (data[i].email_status == 2) {
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
        var basicpieChart = echarts.init(document.getElementById('basic-pie-email'));
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
            calculable: true,
            series: [{
                name: 'E-mail Consent',
                type: 'pie',
                radius: '60%',
                center: ['50%', '50%'],
                data: all
            }]
        };
        basicpieChart.setOption(option);
    };

});