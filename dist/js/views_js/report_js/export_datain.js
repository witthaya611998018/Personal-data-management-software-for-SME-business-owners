var csvFileData;
$.ajax({ // ready get api date
    type: 'GET',
    url: '/exportdata',
    success: function (result) {
        if (result == "ไม่มีข้อมูล") {
            console.log('ไม่มีข้อมูล');
        } else {
            csvFileData = result
        }
    },
    error: function (e) {
        console.log(e);
    }
});



document.getElementById("csv").addEventListener("click", () => {
    var csvData = []
    for (let i = 0; i < csvFileData.length; i++) {
        csvData.push(
            [i + 1,
            csvFileData[i].fname.replaceAll(",", "/"),
            csvFileData[i].name,
            csvFileData[i].sender,
            csvFileData[i].hl0,
            csvFileData[i].date,
            csvFileData[i].hash,
            csvFileData[i].ch,
            csvFileData[i].hl3,
            csvFileData[i].sav,
            ]
        )
    }
    var csv = 'ลำดับ,ชื่อ File,แหล่งกำเนิด,วิธีจัดส่ง,Hash(Log0),วันที่จัดเก็บ,Hash(Log1),Check,Hash(Log3),การบันทึกข้อมูล\n';
    csvData.forEach(function (row) {
        csv += row.join(',');
        csv += "\n";
    });
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'Datain.csv';
    hiddenElement.click();
});

document.getElementById("excel").addEventListener("click", () => {
    var excel = [];
    for (let i = 0; i < csvFileData.length; i++) {
        excel.push({
            'ลำดับ': i + 1,
            'ชื่อ File': csvFileData[i].fname,
            'แหล่งกำเนิด': csvFileData[i].name,
            'วิธีจัดส่ง': csvFileData[i].sender,
            'Hash(Log0)': csvFileData[i].hl0,
            'วันที่จัดเก็บ': csvFileData[i].date,
            'Hash(Log1)': csvFileData[i].hash,
            'Check': csvFileData[i].ch,
            'Hash(Log3)': csvFileData[i].hl3,
            'การบันทึกข้อมูล': csvFileData[i].sav
        })
    }
    let binaryWS = XLSX.utils.json_to_sheet(excel);
    var wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, binaryWS)
    XLSX.writeFile(wb, 'Datain.xlsx');
});

document.getElementById('pdf').addEventListener('click', function (event) {
    event.preventDefault();
    var myWindow = window.open('xxx', '_blank');
    var content = ""
    for (let i = 0; i < csvFileData.length; i++) {
        
        content +=
            '<tr><td>' + i + 1 +
            '</td><td>' + csvFileData[i].fname +
            '</td><td>' + csvFileData[i].name +
            '</td><td>' + csvFileData[i].sender +
            '</td><td>' + csvFileData[i].hl0 +
            '</td><td>' + csvFileData[i].date +
            '</td><td>' + csvFileData[i].hash +
            '</td><td>' + csvFileData[i].ch +
            '</td><td>' + csvFileData[i].hl3 +
            '</td><td>' + csvFileData[i].sav +
            '</td></tr>'
    }

    var header_content = `<table style="margin-top: 15px;">
<thead> 
<tr>
<th>ลำดับ</th>
<th>ชื่อ File</th>
<th>แหล่งกำเนิด</th>
<th>วิธีจัดส่ง</th>
<th>Hash(Log0)</th>
<th>วันที่จัดเก็บ</th>
<th>Hash(Log1)</th>
<th>Check</th>
<th>Hash(Log3)</th>
<th>การบันทึกข้อมูล</th>
</tr>
</thead> 
<tbody>`
    var footer_content = `</tbody></table>`
    myWindow.document.write("รายงาน Datain", header_content + content + footer_content)
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