

// กลับไปค่าล่าสุด dialog
document.getElementById("Preview-banner").innerHTML = document.getElementById("dialogs").value;
// document.getElementById("Preview-banner-1").innerHTML = document.getElementById("dialogs").value;



document.getElementById("rehistory").addEventListener("click", function () {
    var html_dialog = document.getElementById("rehistory_data").value;
    $('.note-editable').html(html_dialog)
    document.getElementById("Preview-banner").innerHTML = html_dialog;
    // document.getElementById("Preview-banner-1").innerHTML = html_dialog;
});


//  ปรับความสูง Banner Cookie (px)
// document.getElementById("demo").addEventListener("keyup", function () {
//     var height_input = $(this).val();
//     if (height_input <= 100) {
//         document.getElementById("Preview-banner").style.height = "";
//     } else {
//         console.log("else");
//         document.getElementById("Preview-banner").style.height = height_input + "px";
//     }
// });
// ปรับเเต่ง Banner Cookie check prop
// document.getElementById("CheckedBannerCookie").addEventListener("click", function () {
//     var demo_value = document.getElementById('demo').value;
//     console.log(document.getElementById('demo').value);
//     if ($('#CheckedBannerCookie').prop("checked") == true) {
//         document.getElementById('demo').disabled = false;
//     }
//     else {
//         if (demo_value) {
//             document.getElementById('demo').disabled = true;
//             // document.getElementById('demo').value = " ";
//             document.getElementById("Preview-banner").style.height = demo_value;
//         } else {
//             document.getElementById('demo').disabled = true;
//             document.getElementById('demo').value = " ";
//             document.getElementById("Preview-banner").style.height = "";
//         }

//     }
// });

document.getElementById("rehistory_cookiepolicy").addEventListener("click", function () {
    var cookiepolicy = JSON.parse(document.getElementById("cookiepolicy").value);
    console.log(cookiepolicy);


    for (let i = 0; i < cookiepolicy.length; i++) {
        document.getElementById("name_cp_" + cookiepolicy[i].id_dsc).value = cookiepolicy[i].name_cookietype;
        document.getElementById("content_" + cookiepolicy[i].id_dsc).value = cookiepolicy[i].detail_cookie;

        document.getElementById("name_cp_preview_" + cookiepolicy[i].id_dsc).innerText = cookiepolicy[i].name_cookietype;
        document.getElementById("content_preview_" + cookiepolicy[i].id_dsc).innerText = cookiepolicy[i].detail_cookie;

        if (cookiepolicy[i].approve == 1) {
            document.getElementById("active_" + cookiepolicy[i].id_dsc).checked = true;
            document.getElementById("label_" + cookiepolicy[i].id_dsc).innerText = "Active";
            document.getElementById("label_" + cookiepolicy[i].id_dsc).style.color = "black";
            document.getElementById("active_preview_" + cookiepolicy[i].id_dsc).checked = true;
            // document.getElementById("label_preview_" + cookiepolicy[i].id_dsc).innerText = "Active";
            // document.getElementById("label_preview_" + cookiepolicy[i].id_dsc).style.color = "black";
        } else {
            document.getElementById("active_" + cookiepolicy[i].id_dsc).checked = false;
            document.getElementById("active_preview_" + cookiepolicy[i].id_dsc).checked = false;
            document.getElementById("label_" + cookiepolicy[i].id_dsc).innerText = "No active";
            document.getElementById("label_" + cookiepolicy[i].id_dsc).style.color = "red";
            // document.getElementById("label_preview_" + cookiepolicy[i].id_dsc).innerText = "No active";
            // document.getElementById("label_preview_" + cookiepolicy[i].id_dsc).style.color = "red";

        }
    }
});

// ปรับเเต่งค่าประเภทคุกกี้ check prop
// $('.enable_disable').attr('disabled', true);
// $('.check_label').attr('disabled', true);
// $('.button_cookieType').attr('disabled', true);

// document.getElementById("Check_cookiepolicy").addEventListener("click", function () {
//     if ($('#Check_cookiepolicy').prop("checked") == true) {
//         $('.enable_disable').attr('disabled', false);
//         $('.check_label').attr('disabled', false);
//         $('.button_cookieType').attr('disabled', false);

//     } else {
//         $('.enable_disable').attr('disabled', true);
//         $('.check_label').attr('disabled', true);
//         $('.button_cookieType').attr('disabled', true);

//     }
// });


// สี ธีน ให้เป็นสีมืด
function chiangthemedark() {
    const span = document.getElementById("banner");
    const classes = span.classList;
    classes.add("btn-dark");
    document.getElementById("dark").value = "btn-dark";


    var css_preview = document.getElementById('css_preview')
    css_preview.href = '/dist/css/css_preview/dark.css'


    const span1 = document.getElementById("dark-theme-circum");
    const classes1 = span1.classList;
    span1.classList.remove("circum-color-theme-ready");
    span1.classList.add("circum-color-theme");

    const span2 = document.getElementById("light-theme-circum");
    const classes2 = span2.classList;
    span2.classList.remove("circum-color-theme");
    span2.classList.add("circum-color-theme-ready");

    // const span3 = document.getElementById("color-theme-circum");
    // // const classes3 = span3.classList;
    // span3.classList.remove("circum-color-theme");
    // span3.classList.add("circum-color-theme-ready");
}
// เปลี่ยนสี ธีน ให้เป็นสีข้าว
function ChiangthemeLight() {
    const span = document.getElementById("banner");
    const classes = span.classList;
    classes.remove("btn-dark");
    document.getElementById("dark").value = " ";
    var css_preview = document.getElementById('css_preview')
    css_preview.href = '/dist/css/css_preview/light.css'

    const span1 = document.getElementById("dark-theme-circum");
    // const classes1 = span1.classList;
    span1.classList.remove("circum-color-theme");
    span1.classList.add("circum-color-theme-ready");

    const span2 = document.getElementById("light-theme-circum");
    // const classes2 = span2.classList;
    span2.classList.remove("circum-color-theme-ready");
    span2.classList.add("circum-color-theme");

    // const span3 = document.getElementById("color-theme-circum");
    // // const classes3 = span3.classList;
    // span3.classList.remove("circum-color-theme");
    // span3.classList.add("circum-color-theme-ready");

}

// function chiangthemecolor() {
//     document.getElementById("dark").value = " ";

//     const span1 = document.getElementById("color-theme-circum");
//     // const classes1 = span1.classList;
//     span1.classList.remove("circum-color-theme-ready");
//     span1.classList.add("circum-color-theme");

//     const span2 = document.getElementById("light-theme-circum");
//     // const classes2 = span2.classList;
//     span2.classList.remove("circum-color-theme");
//     span2.classList.add("circum-color-theme-ready");

//     const span3 = document.getElementById("dark-theme-circum");
//     // const classes3 = span3.classList;
//     span3.classList.remove("circum-color-theme");
//     span3.classList.add("circum-color-theme-ready");

// }

// function under() {
//     document.getElementById("location-database").value = "under";
//     const span = document.getElementById("color-under");
//     // const classes = span.classList;
//     span.classList.add("circum-color");

//     const span1 = document.getElementById("color-tops");
//     // const classes1 = span1.classList;
//     span1.classList.remove("circum-color");

//     const span2 = document.getElementById("color-middle");
//     // const classes2 = span2.classList;
//     span2.classList.remove("circum-color");

// }

// function tops() {
//     document.getElementById("location-database").value = "top";


//     const span = document.getElementById("color-under");
//     const classes = span.classList;
//     classes.remove("circum-color");

//     const span1 = document.getElementById("color-tops");
//     const classes1 = span1.classList;
//     classes1.add("circum-color");

//     const span3 = document.getElementById("color-middle");
//     const classes3 = span3.classList;
//     classes3.remove("circum-color");

// }

// function middle() {
//     document.getElementById("location-database").value = "middle";
//     const span = document.getElementById("color-middle");
//     const classes = span.classList;
//     classes.add("circum-color");

//     const span1 = document.getElementById("color-tops");
//     const classes1 = span1.classList;
//     classes1.remove("circum-color");

//     const span3 = document.getElementById("color-under");
//     const classes3 = span3.classList;
//     classes3.remove("circum-color");
// }


var aa = 1;

// สร้างปรับเเต่งค่าประเภทคุกกี้ เพิ่ม
function AppendPolicy() {
    var input = document.createElement('input');
    var input1 = document.createElement('input');
    var label = document.createElement('label');
    var b = document.createElement('b');
    var div = document.createElement('div');
    var div1 = document.createElement('div');
    var div2 = document.createElement('div');
    var div3 = document.createElement('div');
    var div4 = document.createElement('div');
    var div5 = document.createElement('div');
    var textarea = document.createElement('textarea');


    // การประกาศ type,class,name,innerHTML(ข้อความ) ให้กับ Element ต่างๆๆ เช่น div input อื่นๆ
    input.type = "text";
    input1.type = "checkbox";
    input.className = "form-control type-cookie";
    input1.className = "form-check-input";
    label.className = "form-check-label";
    div.className = "cookie-policy";
    div1.className = "row";
    div2.className = "col-2";
    div3.className = "col-8";
    div4.className = "col";
    div5.className = "form-check form-switch";
    textarea.className = "form-control";
    textarea.name = "detail_policy_append";
    b.innerHTML = "Active";
    input.name = "name_cp_append";
    input1.name = "approve_cp";
    input1.checked = "true";
    input1.id = "aa" + aa;

    // การ setAttribute funtion ให้กับ input
    input1.setAttribute("onclick", "activeCheck_append()");

    aa += 1;
    div.appendChild(div1);
    div1.appendChild(div2);
    div1.appendChild(div3);
    div1.appendChild(div4);
    div4.appendChild(div5);
    div5.appendChild(input1);
    div5.appendChild(label);
    label.appendChild(b);
    div3.appendChild(textarea);
    div2.appendChild(input);
    document.getElementsByClassName("test-policy")[0].appendChild(div);
    // document.createElement("test-policy")[0].appendChild(div);

}

function keyupColortheme() {
    var color = document.getElementById("input-color-theme").value;
    document.getElementById("button-color").style.backgroundColor = color, document.getElementById("button-color").style.borderColor = color;
    document.getElementById("dark").value = " ";
}

function defaultDialog() {
    var x = document.getElementById("flexCheckDefault").value;

    if (document.getElementById("flexCheckDefault").value === "0") {
        var demo = document.getElementById("flexCheckDefault").value = "1";
        // console.log(demo);
    } else {
        var demo = document.getElementById("flexCheckDefault").value = "0";
        // console.log(demo);
    }

}


function activeCheck_show(id, number) {
    console.log("number", number);
    // var preview = document.querySelector('#preview_show_' + number)
    // $('#preview_show_' + number).toggle(true);  //shows button
    if ($('#preview_show_' + number).prop("hidden") == true) {
        $('#preview_show_' + number).prop("hidden", false);
        $("#preview_show_" + number).css("display", "");
    } else {
        $('#preview_show_' + number).prop("hidden", true);
        $("#preview_show_" + number).css("display", "");
    }
    if ($('#show_' + id).prop("checked") == true) {
        $('#show_' + id).val(id);
    } else {
        $('#show_' + id).val("");
    }
}

function activeCheck(id) { // ส่วนของ setting 
    if ($('#active_' + id).prop("checked") == true) {
        $('#active_' + id).val(id);
        $('#label_' + id).text("Active");
        $('#label_' + id).attr('style', 'color:black');
        $('#active_preview_' + id).prop("checked", true) // prop คือ ถาม arrt ที่เรียกใช้เป็น checked==true ไหม
        $('#label_preview_' + id).text("Active");
        $('#label_preview_' + id).attr('style', 'color:black');

    } else {
        $('#active_' + id).val(id);
        $('#label_' + id).text("No Active");
        $('#label_' + id).attr('style', 'color:red');
        $('#label_preview_' + id).text("No Active");
        $('#label_preview_' + id).attr('style', 'color:red');
        $('#active_preview_' + id).prop("checked", false);
    }
}


function activeCheck_preview(id) { // ส่วนของ preview 
    if ($('#active_preview_' + id).prop("checked") == true) {
        $('#active_' + id).val(id);
        $('#label_preview_' + id).text("Active");
        $('#label_preview_' + id).attr('style', 'color:black');
        $('#active_' + id).prop("checked", true)
        $('#label_' + id).text("Active");
        $('#label_' + id).attr('style', 'color:black');
    } else {
        $('#active_' + id).val(id);
        $('#label_preview_' + id).text(" No active");
        $('#label_preview_' + id).attr('style', 'color:red');
        $('#label_' + id).text("No Active");
        $('#label_' + id).attr('style', 'color:red');
        $('#active_' + id).prop("checked", false);
    }
}

// function keyupcontent(id) {
//     var content = document.getElementById("content_" + id).value;
//     document.getElementById("content_preview_" + id).innerHTML = content;
// }


// function keyuptype(id) {
//     var content = document.getElementById("name_cp_" + id).value;
//     document.getElementById("name_cp_preview_" + id).innerText = content;
// }


$('#policy').on('change', function () {
    var id = $(this).val()
    var href = $(this)[0].dataset.href
    let preview = document.getElementById('preview_cookie_policy')
    if (id == "#javascript:void(0)") {
        preview.href = id
    } else {
        preview.href = href + id
    }
});

$('#dialogs').summernote({
    fontSizes: ['8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '20', '22', '24'],
    toolbar: [
        ['style', ['style']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['font', ['bold', 'Sarabun', 'underline', 'clear']],
        ['color', ['color']],
        ['para', ['paragraph', 'ul', 'ol']],
        ['height', ['height']],
        ['insert', ['link', 'picture', 'hr']],
        // ['table', ['table']],
        ['view', ['undo', 'redo']],
    ],
    fontNames: ['Sarabun', 'Sans Serif', 'Arial', 'Arial Black', 'Tahoma'],
    fontNamesIgnoreCheck: ['Sarabun', 'Sans Serif', 'Arial', 'Arial Black', 'Tahoma'],
    focus: false,
    height: 350,
    callbacks: {
        onChange: function (e) {
            setTimeout(function () {
                $("#Preview-banner").html($('#dialogs').val());
            }, 100);
        }
    }
});
$('#dialogs').summernote('fontName', 'Sarabun');
$('#dialogs').summernote('fontSize', '16');
