
var hostname = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;
$('#approve').on("click", function () {
    var data = ({ "id": $(this).val(), hostname });
    Swal.fire({
        title: 'อนุมัติ',
        type: 'warning',
        showCancelButton: true,
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#39c449',
        confirmButtonText: 'ตกลง'
    }).then((result) => {
        if (result.value) {
            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: "/update/approve",
                data: JSON.stringify(data),
                dataType: 'json',
                success: function (result) {
                    Swal.fire(
                        'อนุมัติสำเร็จ',
                        '',
                        'success'
                    ), setTimeout(() => {
                        location.reload();
                    }, 1000);
                }
            });
        }
    })
});

$('#deny').on("click", function () {
    var data = ({ "id": $(this).val(), hostname });
    Swal.fire({
        title: 'อนุมัติ',
        type: 'warning',
        showCancelButton: true,
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#39c449',
        confirmButtonText: 'ตกลง'
    }).then((result) => {
        if (result.value) {
            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: "/update/deny",
                data: JSON.stringify(data),
                dataType: 'json',
                success: function (result) {
                    Swal.fire(
                        'ปฏิเสธ',
                        '',
                        'success',
                    ), setTimeout(() => {
                        location.reload();
                    }, 1000);
                }
            });
        }
    })
});