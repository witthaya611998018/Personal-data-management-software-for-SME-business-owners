

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
            url: '/api/report/cookiesconsent',
            success: async function (result) {
                if (result.data_nul == "ไม่มีข้อมูล") {
                    await ready_datanull(result.cookiepolicy)
                    icon_close("null")
                } else {
                    icon_close()
                    await Tabeldata_ajax(result)
                    await build_Pie_Chart(result.pie_setting_cookiepolicy)
                    await Graph_cookie_consent(result)
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

    async function ready_datanull(cookiepolicy) {
        $('#revenue-statistics').empty()
        $('#basic-pie-paper').empty()
        if (cookiepolicy) {
            var content = '<table class="tablesaw no-wrap table-striped table-bordered table-hover table" id="table_sortable" data-tablesaw-sortable>'
            content += '<thead id="table-thead"> </thead>' + '<tbody id="table-body"></tbody>';
            content += '</table>'
            $('#table_Data-cookie').append(content);
            $('#table_sortable').attr('data-tablesaw-sortable');
            var table = $('#table-body');
            var table_thead = $('#table-thead');
            var thead_cookie;
            for (let i = 0; i < cookiepolicy.length; i++) {
                thead_cookie += '<th>' + cookiepolicy[i].name_cp + '</th>';
            }
            var thead =
                '<tr>' +
                '<th>ลำดับ</th>' +
                '<th>ชื่อโดเมน</th>' +
                '<th>ไอพีแอดเดรส</th>' +
                '<th>เบราว์เซอร์</th>' +
                '<th>เซสชั่นไอดี</th>' +
                '<th>วันที่</th>' +
                thead_cookie
                +
                '</tr >';
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
        }
    };


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

    document.getElementById("button-addon2").addEventListener("click", () => {
        var data = ({
            "text": document.getElementById('Srearch').value.trim(),
            "firstDay": document.getElementById('firstDay').value,
            "lastDay": document.getElementById('lastDay').value
        });
        $.ajax({
            type: "post",
            contentType: "application/json",
            url: '/api/search/report/cookiesconsent',
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
                    await build_Pie_Chart(result.pie_setting_cookiepolicy)
                    await Graph_cookie_consent(result)

                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    });

    document.getElementById("search_date").addEventListener("click", () => {
        document.getElementById('Srearch').value = null
        var data = {
            "date_first": document.getElementById("firstDay").value,
            "date_last": document.getElementById("lastDay").value,
        }
        $.ajax({
            type: "post",
            contentType: "application/json",
            url: '/api/report/cookieconsent/search_date',
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
                    await build_Pie_Chart(result.pie_setting_cookiepolicy)
                    await Graph_cookie_consent(result)
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    });


    var csvFileData = []
    var cookiepolicy = ""
    document.getElementById("csv").addEventListener("click", () => {
        var csvData = []
        var status = []
        for (let i = 0; i < csvFileData.length; i++) {
            for (var k in cookiepolicy) {
                if (csvFileData[i].cookiepolicy[k] == 1) {
                    status.push("ยินยอม")
                } else {
                    status.push("ไม่ยินยอม")
                }
            }
            csvData.push(
                [csvFileData[i].no,
                csvFileData[i].namedomain_dg,
                csvFileData[i].policylog_ip,
                csvFileData[i].policylog_browser,
                csvFileData[i].policylog_sessionid,
                csvFileData[i].day, status
                ]
            )
            status = []
        }
        var type = "";
        for (let i = 0; i < cookiepolicy.length; i++) {
            type += "," + cookiepolicy[i].name_cp
        }
        var csv = `ลำดับ,ชื่อโดเมน,ไอพีแอดเดรส,เบราว์เซอร์,เซสชั่นไอดี,วันที่${type}\n`;
        csvData.forEach(function (row) {
            csv += row.join(',');
            csv += "\n";
        });
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'รายงาน Cookie Consent.csv';
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
                ชื่อโดเมน: csvFileData[i].namedomain_dg,
                ไอพีแอดเดรส: csvFileData[i].policylog_ip,
                เบราว์เซอร์: csvFileData[i].policylog_browser,
                เซสชั่นไอดี: csvFileData[i].policylog_sessionid,
                วันที่: csvFileData[i].day
            }
            for (let i = 0; i < type.length; i++) {
                object_exce[type[i]] = status[i];
            }
            excel.push(object_exce)
            status = []
        }
        let binaryWS = XLSX.utils.json_to_sheet(excel);
        var wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, binaryWS)
        XLSX.writeFile(wb, 'รายงาน Cookie Consent.xlsx');
    });

    document.getElementById('pdf').addEventListener('click', function (event) {
        event.preventDefault();
        var myWindow = window.open('xxx', '_blank');
        var type = ""
        for (let j = 0; j < cookiepolicy.length; j++) {
            type += `<th>${cookiepolicy[j].name_cp}</th>`
        }
        var header_content = `<table style="margin-top: 15px;">
        <thead> 
        <tr>
        <th>ลำดับ</th>
        <th>ชื่อโดเมน</th>
        <th>ไอพีแอดเดรส</th>
        <th>เบราว์เซอร์</th>
        <th>เซสชั่นไอดี</th>
        <th>วันที่</th>
        ${type}
       </tr>
        </thead> 
        <tbody>`
        var content = ""
        var status = ""
        for (let i = 0; i < csvFileData.length; i++) {
            for (var k in cookiepolicy) {
                if (csvFileData[i].cookiepolicy[k] == 1) {
                    status += `</td><td>ยินยอม`
                } else {
                    status += `</td><td>ไม่ยินยอม`
                }
            }
            content +=
                '<tr><td>' + csvFileData[i].no +
                '</td><td>' + csvFileData[i].namedomain_dg +
                '</td><td>' + csvFileData[i].policylog_ip +
                '</td><td>' + csvFileData[i].policylog_browser +
                '</td><td>' + csvFileData[i].policylog_sessionid +
                '</td><td>' + csvFileData[i].day +
                status
            '</td></tr>'
            status = ""
        }
        var footer_content = `</tbody></table>`
        myWindow.document.write("รายงาน  Cookie Consent", header_content + content + footer_content)
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
        var data_cookiepolicy = data.cookiepolicy
        var data_log_cookiepolicy = data.log_cookiepolicy
        var log_cookiepolicy = [];
        csvFileData = [];
        cookiepolicy = data.cookiepolicy
        for (var i = 0; i < data_log_cookiepolicy.length; i++) {
            log_cookiepolicy.push({
                "no": (i + 1),
                "id_dg": data_log_cookiepolicy[i].id_dg,
                "id_lsc": data_log_cookiepolicy[i].id_lsc,
                "id_policylog": data_log_cookiepolicy[i].id_policylog,
                "cookiepolicy": data_log_cookiepolicy[i].cookiepolicy,
                "day": data_log_cookiepolicy[i].day,
                "namedomain_dg": data_log_cookiepolicy[i].namedomain_dg,
                "policylog_browser": data_log_cookiepolicy[i].policylog_browser,
                "policylog_ip": data_log_cookiepolicy[i].policylog_ip,
                "policylog_sessionid": data_log_cookiepolicy[i].policylog_sessionid,
            });

            csvFileData.push({
                "no": (i + 1),
                "id_dg": data_log_cookiepolicy[i].id_dg,
                "id_lsc": data_log_cookiepolicy[i].id_lsc,
                "id_policylog": data_log_cookiepolicy[i].id_policylog,
                "cookiepolicy": data_log_cookiepolicy[i].cookiepolicy,
                "day": data_log_cookiepolicy[i].day,
                "namedomain_dg": data_log_cookiepolicy[i].namedomain_dg,
                "policylog_browser": data_log_cookiepolicy[i].policylog_browser,
                "policylog_ip": data_log_cookiepolicy[i].policylog_ip,
                "policylog_sessionid": data_log_cookiepolicy[i].policylog_sessionid,
            });
        }

        var state = {
            'querySet': log_cookiepolicy,
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
            var thead_cookie;
            for (let i = 0; i < data_cookiepolicy.length; i++) {
                thead_cookie += '<th>' + data_cookiepolicy[i].name_cp + '</th>';
            }
            var thead =
                '<tr>' +
                '<th>ลำดับ</th>' +
                '<th>ชื่อโดเมน</th>' +
                '<th>ไอพีแอดเดรส</th>' +
                '<th>เบราว์เซอร์</th>' +
                '<th>เซสชั่นไอดี</th>' +
                '<th>วันที่</th>' +
                thead_cookie
                +
                '</tr >';
            table_thead.append(thead)


            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];
            for (var i in myList) {
                var td_cookie = [];
                for (var k in data_cookiepolicy) {
                    if (myList[i].cookiepolicy[k] == 1) {
                        td_cookie.push('<td><i class="fas fa-check fa-2x text-success"></i></td>');
                    } else {
                        td_cookie.push('<td><i class="fas fa-times fa-2x text-danger"></i></td>');
                    }
                }

                var row = '<tr>' +
                    '<td>' + myList[i].no + '</td>' +
                    '<td>' + myList[i].namedomain_dg + '</td>' +
                    '<td>' + myList[i].policylog_ip + '</td>' +
                    '<td>' + myList[i].policylog_browser + '</td>' +
                    '<td>' + myList[i].policylog_sessionid + '</td>' +
                    '<td>' + myList[i].day + '</td>' +
                    td_cookie +
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

    async function build_Pie_Chart(data) {
        var sum_approve_select = "0";
        var sum_approve_all = "0";
        var sum_notagree = "0";
        for (let i = 0; i < data.length; i++) {
            if (data[i].policylog_cookieconsent == "ปฏิเสธทั้งหมด") {
                sum_notagree = data[i].count
            } else if (data[i].policylog_cookieconsent == "อนุญาตทั้งหมด") {
                sum_approve_all = data[i].count
            } else {
                sum_approve_select = data[i].count
            }
        }

        var all = [{
            "value": sum_notagree,
            "name": "ปฏิเสธทั้งหมด"
        },
        {
            "value": sum_approve_select,
            "name": "อนุญาตตามที่เลือก"
        },
        {
            "value": sum_approve_all,
            "name": "อนุญาตทั้งหมด"
        }]

        var basicpieChart = echarts.init(document.getElementById('basic-pie-paper'));
        var option = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                data: ['ปฏิเสธทั้งหมด', 'อนุญาตตามที่เลือก', 'อนุญาตทั้งหมด']
            },
            color: ['#f62d51', '#009efb', '#39c449'],
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
                    },
                }
            },
            calculable: true,
            series: [{
                name: 'Browsers',
                type: 'pie',
                radius: '60%',
                center: ['50%', '62%'],
                data: all
            }]
        };
        basicpieChart.setOption(option);
    };

    async function Graph_cookie_consent(data) {
        var accept_all = data.graph_cookie_consent_accept_all
        var accept_custom = data.graph_cookie_consent_accept_custom
        var reject = data.graph_cookie_consent_reject

        var date_all = []
        date_all.push(accept_all)
        date_all.push(accept_custom)
        date_all.push(reject)
        var day_array = []
        for (let i = 0; i < accept_all.length; i++) {
            day_array.push(accept_all[i].policylog_date)
        }
        for (let j = 0; j < accept_custom.length; j++) {
            day_array.push(accept_custom[j].policylog_date)
        }
        for (let k = 0; k < reject.length; k++) {
            day_array.push(reject[k].policylog_date)
        }

        const arr = day_array;
        const set = new Set(arr);
        const newArr = [...set].sort();
        var x = []
        var type = ["ปฏิเสธทั้งหมด", "อนุญาตตามที่เลือก", "อนุญาตทั้งหมด"]
        for (let i = 0; i < type.length; i++) {
            var data_p = {
                name: '',
                data: [],
            }
            data_p.name = (type[i]);
            for (let a = 0; a < newArr.length; a++) { // date
                if (type[i] == "ปฏิเสธทั้งหมด") {
                    for (let c = 0; c < reject.length; c++) {
                        if (reject[c].policylog_date == newArr[a] && reject[c].policylog_cookieconsent == type[i]) {
                            data_p.data[a] = reject[c].count
                        }
                        else if (reject[c].policylog_date != newArr[a] && data_p.data[a] == 0 || data_p.data[a] == undefined) {
                            data_p.data[a] = 0
                        }
                    }
                } else if (type[i] == "อนุญาตตามที่เลือก") {
                    for (let c = 0; c < accept_custom.length; c++) {
                        if (accept_custom[c].policylog_date == newArr[a] && accept_custom[c].policylog_cookieconsent == type[i]) {
                            data_p.data[a] = accept_custom[c].count
                        }
                        else if (accept_custom[c].policylog_date != newArr[a] && data_p.data[a] == 0 || data_p.data[a] == undefined) {
                            data_p.data[a] = 0
                        }
                    }
                } else {
                    for (let c = 0; c < accept_all.length; c++) {
                        if (accept_all[c].policylog_date == newArr[a] && accept_all[c].policylog_cookieconsent == type[i]) {
                            data_p.data[a] = accept_all[c].count
                        }
                        else if (accept_all[c].policylog_date != newArr[a] && data_p.data[a] == 0 || data_p.data[a] == undefined) {
                            data_p.data[a] = 0
                        }
                    }
                }
            }
            x.push(data_p);
        }
        var Revenue_Statistics = {
            series: x,
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
                colors: ["#f62d51", "#009efb", "#39c449"],
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
            colors: ["#f62d51", "#009efb", "#39c449"],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: "smooth",
                width: 2,
                colors: ["#f62d51", "#009efb", "#39c449"],
            },
            markers: {
                size: 5,
                colors: ["#f62d51", "#009efb", "#39c449"],
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
                categories: newArr, // จำนวน ข้อมูล แกน x
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