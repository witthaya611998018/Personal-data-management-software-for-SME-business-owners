var csvFileData;
$.ajax({ // ready get api date
    type: 'GET',
    url: '/exportdata_out',
    success: function (result) {
        if (result == "ไม่มีข้อมูล") {
            console.log('ไม่มีข้อมูล');
        } else {
            csvFileData = result
            console.log(result);
        }
    },
    error: function (e) {
        console.log(e);
    }
});



// document.getElementById("csv").addEventListener("click", () => {
//     var csvData = []
//     for (let i = 0; i < csvFileData.length; i++) {
//         csvData.push(
//             [i + 1,
//             csvFileData[i].fname.replaceAll(",", "/"),
//             csvFileData[i].export,
//             csvFileData[i].sender,
//             csvFileData[i].hl3,
//             csvFileData[i].name,
//             csvFileData[i].date,
//             csvFileData[i].hash,
//             csvFileData[i].ch,
//             csvFileData[i].sav,
//             csvFileData[i].hl0,
//             ]
//         )
//     }

//     var csv = 'ลำดับ,ชื่อ File,การส่งออกข้อมูล,วิธีจัดส่ง,Hash(Log3),แหล่งกำเนิด,วันที่จัดเก็บ,Hash(Log1),Check,การบันทึกข้อมูล,Hash(Log0)\n';
//     csvData.forEach(function (row) {
//         csv += row.join(',');
//         csv += "\n";
//     });
//     var hiddenElement = document.createElement('a');
//     hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csv);
//     hiddenElement.target = '_blank';
//     hiddenElement.download = 'Dataout.csv';
//     hiddenElement.click();
// });

// document.getElementById("excel").addEventListener("click", () => {
//     var excel = [];
//     for (let i = 0; i < csvFileData.length; i++) {
//         excel.push({
//             'ลำดับ': i + 1,
//             'ชื่อ File': csvFileData[i].fname,
//             'การส่งออกข้อมูล': csvFileData[i].export,
//             'วิธีจัดส่ง': csvFileData[i].sender,
//             'Hash(Log3)': csvFileData[i].hl3,
//             'แหล่งกำเนิด': csvFileData[i].name,
//             'วันที่จัดเก็บ': csvFileData[i].date,
//             'Hash(Log1)': csvFileData[i].hash,
//             'Check': csvFileData[i].ch,
//             'การบันทึกข้อมูล': csvFileData[i].sav,
//             'Hash(Log0)': csvFileData[i].hl0
//         })
//     }
//     let binaryWS = XLSX.utils.json_to_sheet(excel);
//     var wb = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(wb, binaryWS)
//     XLSX.writeFile(wb, 'Dataout.xlsx');
// });

// document.getElementById('pdf').addEventListener('click', function (event) {
//     event.preventDefault();
//     var myWindow = window.open('xxx', '_blank');
//     var content = ""
//     for (let i = 0; i < csvFileData.length; i++) {
        
//         content +=
//             '<tr><td>' + i + 1 +
//             '</td><td>' + csvFileData[i].fname +
//             '</td><td>' + csvFileData[i].export +
//             '</td><td>' + csvFileData[i].sender +
//             '</td><td>' + csvFileData[i].hl3 +
//             '</td><td>' + csvFileData[i].name +
//             '</td><td>' + csvFileData[i].date +
//             '</td><td>' + csvFileData[i].hash +
//             '</td><td>' + csvFileData[i].ch +
//             '</td><td>' + csvFileData[i].sav +
//             '</td><td>' + csvFileData[i].hl0 +
//             '</td></tr>'
//     }

//     var header_content = `<table style="margin-top: 15px;">
// <thead> 
// <tr>
// <th>ลำดับ</th>
// <th>ชื่อ File</th>
// <th>การส่งออกข้อมูล</th>
// <th>วิธีจัดส่ง</th>
// <th>Hash(Log3)</th>
// <th>แหล่งกำเนิด</th>
// <th>วันที่จัดเก็บ(Log1)</th>
// <th>Hash(Log1)</th>
// <th>Check</th>
// <th>การบันทึกข้อมูล</th>
// <th>Hash(Log0)</th>
// </tr>
// </thead> 
// <tbody>`
//     var footer_content = `</tbody></table>`
//     myWindow.document.write("รายงาน Dataout", header_content + content + footer_content)
//     myWindow.document.write(`
// <style>
// table {
// font-family: arial, sans-serif;
// border-collapse: collapse;
// width: 100%;
// }
// td, th {
// border: 1px solid #dddddd;
// text-align: left;
// padding: 8px;
// }
// td {
// font-size:12px;
// }
// </style>
// <script>
// window.print();
// </script>
// `
// );
// })