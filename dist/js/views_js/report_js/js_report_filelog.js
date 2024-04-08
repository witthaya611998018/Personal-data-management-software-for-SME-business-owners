$(function () {
    "use strict";
    document.getElementById("csv").addEventListener("click", () => {
        var csvData = []
        var status = []

        for (let i = 0; i < csvFileData.length; i++) {
            csvData.push(
                [csvFileData[i].no,
                csvFileData[i].hostname,
                csvFileData[i].device_name,
                csvFileData[i].date,
                csvFileData[i].name.replaceAll(',', '-'),
                csvFileData[i].hash,
                ]
            )
        }

        var csv = `ลำดับ,อุปกรณ์,โฮสต์เนม,วันเวลา,ชื่อไฟล์,ค่าแฮชของไฟล์(SHA-256)\n`;
        csvData.forEach(function (row) {
            csv += row.join(',');
            csv += "\n";
        });
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'รายงานไฟล์ล็อก.csv';
        hiddenElement.click();
    });
    document.getElementById("excel").addEventListener("click", () => {
        var excel = [];
        var type = []
        var status = []

        for (let i = 0; i < csvFileData.length; i++) {
            var object_exce = {

                ลำดับ: csvFileData[i].no,
                อุปกรณ์: csvFileData[i].hostname,
                โฮสต์เนม: csvFileData[i].device_name,
                วันเวลา: csvFileData[i].date,
                ชื่อไฟล์: csvFileData[i].name.replaceAll(',', '-'),
                ค่าแฮชของไฟล์: csvFileData[i].hash,
            }

            excel.push(object_exce)
        }
        let binaryWS = XLSX.utils.json_to_sheet(excel);
        var wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, binaryWS)
        XLSX.writeFile(wb, 'รายงานไฟล์ล็อก.xlsx');
    });
    document.getElementById('pdf').addEventListener('click', function (event) {
        event.preventDefault();
        var myWindow = window.open('xxx', '_blank');
        var header_content =
            `<table style="margin-top: 15px;">
            <thead> 
            <tr>
                <th>ลำดับ</th>
                <th>อุปกรณ์</th>
                <th>โฮสต์เนม</th>
                <th>วันเวลา</th>
                <th>ชื่อไฟล์</th>
                <th>ค่าแฮชของไฟล์(SHA-256)</th>
            </tr>
            </thead> 
            <tbody>`
        var content = ""
        for (let i = 0; i < csvFileData.length; i++) {
            content +=
                '<tr><td>' + csvFileData[i].no +
                '</td><td>' + csvFileData[i].hostname +
                '</td><td>' + csvFileData[i].device_name +
                '</td><td>' + csvFileData[i].date +
                '</td><td>' + csvFileData[i].name.replaceAll(',', '-') +
                '</td><td>' + csvFileData[i].hash
            '</td></tr>'
        }
        var footer_content = `</tbody></table>`
        myWindow.document.write("รายงานไฟล์ล็อก", header_content + content + footer_content)

        myWindow.document.write(`<style>table {font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}td, th { border: 1px solid #dddddd;text-align: left;padding: 8px; }td { font-size:12px; } </style> <script>
        window.print();
       </script> `);
    });



});

$(function () {
    document.getElementById("accesscsv").addEventListener("click", () => {
        var csvData = []
        for (let i = 0; i < accessFileData.length; i++) {
            csvData.push(
                [accessFileData[i].no,
                accessFileData[i].date,
                accessFileData[i].name,
                accessFileData[i].msg,
                accessFileData[i].hash,
                ]
            )
        }

        var csv = `ลำดับ,วันที่ เวลา,ชื่อผู้ใช้งาน,ข้อความ,ค่าแฮช(${type})\n`;
        csvData.forEach(function (row) {
            csv += row.join(',');
            csv += "\n";
        });
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'รายงานประวัติการใช้งาน.csv';
        hiddenElement.click();
    });

    document.getElementById("accessexcel").addEventListener("click", () => {
        var excel = [];
        for (let i = 0; i < accessFileData.length; i++) {
            var object_exce = {

                ลำดับ: accessFileData[i].no,
                วันที่เวลา: accessFileData[i].date,
                ชื่อผู้ใช้งาน: accessFileData[i].name,
                ข้อความ: accessFileData[i].msg,
                ค่าแฮช: type+': '+accessFileData[i].hash,
            }

            excel.push(object_exce)
        }
        let binaryWS = XLSX.utils.json_to_sheet(excel);
        var wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, binaryWS)
        XLSX.writeFile(wb, 'รายงานประวัติการใช้งาน.xlsx');
    });
    document.getElementById('accesspdf').addEventListener('click', function (event) {
        event.preventDefault();
        var myWindow = window.open('xxx', '_blank');
        var header_content =
            `<table style="margin-top: 15px;">
            <thead> 
            <tr>
                <th>ลำดับ</th>
                <th>วันที่ เวลา</th>
                <th>ชื่อผู้ใช้งาน</th>
                <th>ข้อความ</th>
                <th>ค่าแฮช (`+type+`)</th>
            </tr>
            </thead> 
            <tbody>`
        var content = ""
        for (let i = 0; i < accessFileData.length; i++) {
            content +=
                '<tr><td>' + accessFileData[i].no +
                '</td><td>' + accessFileData[i].date +
                '</td><td>' + accessFileData[i].name +
                '</td><td>' + accessFileData[i].msg +
                '</td><td>' + accessFileData[i].hash
            '</td></tr>'
        }
        var footer_content = `</tbody></table>`
        myWindow.document.write("รายงานประวัติการใช้งาน", header_content + content + footer_content)

        myWindow.document.write(`<style>table {font-family: arial, sans-serif;border-collapse: collapse;width: 100%;}td, th { border: 1px solid #dddddd;text-align: left;padding: 8px; }td { font-size:12px; } </style> <script>
        window.print();
       </script> `);
    });

});
