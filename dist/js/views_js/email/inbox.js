$(async function () {
    if ($('#exampleRadios1').prop("checked") == true) {
        document.querySelector(".email_csv").style.display = "none";
        document.querySelector('#example_filecsv').style.display = "none"
    }
    // await content("ready")
})


// async function content(data, document_policy) {
//     var dpo_email = ""
//     var dpo_phone = ""
//     var dpo_name = ""
//     var doc_name = ""
//     var limit_date = ""


//     if (data == "ready") {
//         doc_name = "............"
//         dpo_email = "............"
//         dpo_phone = "............"
//         dpo_name = "............"
//         limit_date = "............"
//     } else {
//         let today = new Date();
//         today.setDate(today.getDate() + 7);
//         doc_name = document_policy
//         dpo_email = data[0].email
//         dpo_phone = data[0].phone
//         dpo_name = data[0].firstname + " " + data[0].lastname
//         limit_date = today.toLocaleDateString('en-GB')
//     }

//     var header_content = `
//     <p style="text-align: left;font-size:16.0pt;font-size:16.0pt;font-family:"TH SarabunPSK",sans-serif;mso-fareast-font-family:Sarabun"><b>เรียน</b> ท่านผู้เกี่ยวข้อง จดหมายหรือ e-mail ฉบับนี้ถูกสร้างโดยอัตโนมัติจากระบบ e-mail consent ตาม ${doc_name}</p>
//     <span style="margin-left: 40px;font-size:16.0pt;font-family:"TH SarabunPSK",sans-serif;mso-fareast-font-family:Sarabun">วิธีการทำงานดังนี้</span>
//     <p style="text-align: left;margin-left: 40px;font-size:16.0pt;font-family:"TH SarabunPSK",sans-serif;mso-fareast-font-family:Sarabun">1.อ่านข้อความการขอความยินตอนนี้โดยละเอียด</p>
//     <p style="text-align: left;margin-left: 40px;font-size:16.0pt;font-family:"TH SarabunPSK",sans-serif;mso-fareast-font-family:Sarabun">2.กรอกข้อมูลในช่องว่างที่ปรากฏ เช่น ชื่อ นามสุกล (ถ้ามี)</p>
//     <p style="text-align: left;margin-left: 40px;font-size:16.0pt;font-family:"TH SarabunPSK",sans-serif;mso-fareast-font-family:Sarabun">3.จะปรากฏปุ่มให้ยินยอมหรือปฏิเสธการยินยอม ด้านบนก่อนข้อความเนื้อหา หรือด้านล่าง กรุณากดปุ่ม</p>
//     <p style="text-align: left;margin-left: 40px;font-size:16.0pt;font-family:"TH SarabunPSK",sans-serif;mso-fareast-font-family:Sarabun">4.จะปรากฏหน้า ขัอความยืนยันหรือขอบคุณ เป็นการให้ ความยินยอม หรือปฏิเสธการยินยอม สมบูรณ์</p>
//     <p style="text-align: left;margin-left: 40px;font-size:16.0pt;font-family:"TH SarabunPSK",sans-serif;mso-fareast-font-family:Sarabun">5.กรณีต้องการเปลี่ยนความยินยอมให้กดปุ่ม ยินยอม หรือปฏิเสธการยินยอม ได้ตลอดเวลา</p>`
//     var footer_content = `
//     <p style="text-align: left;font-size:16.0pt;font-family:"TH SarabunPSK",sans-serif;mso-fareast-font-family:Sarabun"><b>หมายเหตุ</b> : ข้อมูลนโยบายจะปรากฏถึงวันที่ ${limit_date} หากท่านต้องการข้อมูลเพิ่มเติมกรุณาติดต่อ (ผู้สร้างข้อมูล)</p>
//     <p style="text-align: left;margin-left: 82px;font-size:16.0pt;font-family:"TH SarabunPSK",sans-serif;mso-fareast-font-family:Sarabun">*** E-mail ฉบับนี้ถูกสร้างและจัดส่งด้วยระบบ Alltra กรุณาอย่า Reply ข้อมูลกลับ ****</p>
//     <p style="text-align: left;margin-left: 82px;font-size:16.0pt;font-family:"TH SarabunPSK",sans-serif;mso-fareast-font-family:Sarabun">ข้อมูลที่จัดส่งนี้ถูกควบคุมภายใต้ พรบ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ.2562 ภายใต้นโยบายคุ้มครองข้อมูลส่วน</p>
//     <p style="text-align: left;margin-left: 82px;font-size:16.0pt;font-family:"TH SarabunPSK",sans-serif;mso-fareast-font-family:Sarabun">ติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล ${dpo_name} เบอร์โทร ${dpo_phone} E-mail ${dpo_email} </p>`

//     if (data == "ready") {
//         document.querySelector('#content').value = header_content + footer_content
//         document.querySelector('.note-editable').innerHTML = `
//         <div class="justify-content-center d-flex">
//         <div style="width: 80%;">
//         ${header_content}
//         <hr>
//         <br>
//         <hr>
//         ${footer_content}
//         <div>
//         <div>`
//     }
//     return { header_content, footer_content }
// }

document.getElementById("exampleRadios1").addEventListener("click", function () {
    document.querySelector(".email").style.display = "";
    document.querySelector(".email_csv").style.display = "none";
    document.querySelector("#firstname").style.display = "";
    document.querySelector("#lastname").style.display = "";
    document.querySelector('#example_filecsv').style.display = "none"
    $('#firstname').html(`<label class="mb-1">ขื่อผู้รับ</label>
                    <input type="text" name="email_firstname" class="form-control" placeholder="ขื่อผู้รับ" id="email_firstname"
                        required>`)
    $('#lastname').html(` <label class="mb-1">นามสกุลผู้รับ</label>
                    <input class="form-control" type="text" name="email_lastname" placeholder="นามสกุลผู้รับ" id="email_lastname"
                        required>`)
    $('.email').html(`<label class="mb-1">ผู้รับ</label>
                    <input type="email" id="email" name="email_to" class="form-control" placeholder="email"
                        required>`)
});

document.getElementById("exampleRadios2").addEventListener("click", function () {
    document.querySelector(".email").style.display = "none";
    document.querySelector(".email_csv").style.display = "";
    document.querySelector("#firstname").style.display = "none";
    document.querySelector("#lastname").style.display = "none";
    document.querySelector('#example_filecsv').style.display = ""
    $('#firstname').empty()
    $('#lastname').empty()
    $('.email').empty()
});


document.getElementById("throw_away").addEventListener("click", function () {
    // content("ready")
    document.getElementById('policy_selected').selected = true
    let email = document.getElementById("email")
    let subject = document.getElementById("subject");
    let formFile = document.getElementById("formFile");
    let message = document.getElementById("message");
    let email_csv = document.getElementById("email_csv");
    let email_firstname = document.getElementById("email_firstname");
    let email_lastname = document.getElementById("email_lastname");
    if (email != null) {
        email.value = "";
    }
    if (subject != null) {
        subject.value = "";
    }
    if (email_firstname != null) {
        email_firstname.value = "";
    }
    if (email_lastname != null) {
        email_lastname.value = "";
    }
    formFile.value = "";
    message.value = null;
    email_csv.value = "";
    document.getElementById('subject').click()
    document.getElementById('email_lastname').click()
    document.getElementById('email_firstname').click()
    $('.note-editable').empty()
});

$('#policy').on('change', async function () {
    var id = { "id": $(this).val().trim() };
    var subject = "ขอความยินยอม "
    var doc_name = $('#' + $(this).val()).text().trim();
    if (id.id == "0") {
        document.getElementById('subject').value = subject
        // await content("ready", doc_name)
    } else {
        document.getElementById('subject').value = subject + $('#' + $(this).val()).text().trim()
        $.ajax({
            type: 'POST',
            contentType: "application/json",
            url: '/api/email_consent/policy',
            data: JSON.stringify(id),
            dataType: 'json',
            success: async function (result) {
                // var data_content = await content(result.account, doc_name);
                // dpo_name = result.account[0].firstname
                const site_name = result.user_site[0].Name1;
                const short_name = result.user_site[0].Name1;
                const image = result.user_site[0].image;
                const email_company = result.user_site[0].emailAddress1;
                const phone_company = result.user_site[0].phone1;
                const address_company = result.user_site[0].Name1;
                const dpo = result.user_site[0].firstname + " " + result.user_site[0].lastname;
                const number_company = 'number';
                let text = "";
                for (let i = 0; i < result.data.length; i++) {
                    if (result.data.length != null) {
                        if (i == 0) {
                            text += result.data[i].page_content
                        } else {
                            text += result.data[i].page_content

                        }
                    }
                }
                text = text.replaceAll('/UI/image/@@logo_company', `${result.host}/UI/image/logo.png`)

                let page_content_replace_company = [];
                let company_replace =
                    [
                        "@@company_name",
                        "@@short_company_name",
                        "@@logo_company",
                        "@@email_company",
                        "@@phone_company",
                        "@@address_company",
                        "@@number_company",
                        "@@dpo_company",
                    ];
                let regex =
                    new RegExp(
                        company_replace[0],
                        "ig"
                    );
                let regex_short =
                    new RegExp(
                        company_replace[1],
                        "ig"
                    );
                let regex_logo =
                    new RegExp(
                        company_replace[2],
                        "ig"
                    );
                let regex_email_company =
                    new RegExp(
                        company_replace[3],
                        "ig"
                    );
                let regex_phone_company =
                    new RegExp(
                        company_replace[4],
                        "ig"
                    );
                let regex_address_company =
                    new RegExp(
                        company_replace[5],
                        "ig"
                    );
                let regex_number_company =
                    new RegExp(
                        company_replace[6],
                        "ig"
                    );
                let regex_dpo =
                    new RegExp(
                        company_replace[7],
                        "ig"
                    );
                text = text.replace(
                    regex, site_name
                );
                text = text.replace(
                    regex_short, short_name
                );
                // text = text.replace(
                //     regex_logo, 'http://127.0.0.51:8081/UI/image/logo.png'
                // );
                text = text.replace(
                    regex_email_company, email_company
                );
                text = text.replace(
                    regex_phone_company, phone_company
                );
                text = text.replace(
                    regex_address_company, address_company
                );
                text = text.replace(
                    regex_number_company, number_company
                );
                text = text.replace(
                    regex_dpo, dpo
                );
                page_content_replace_company.push(
                    text
                );
                document.getElementById('content').value = text;
                document.querySelector('.note-editable').innerHTML = `
                <div class="justify-content-center d-flex">
                <div style="width: 80%;">
                 ${text}
                <div>
                <div>
                `;

            },
            error: function (e) {
                console.log(e);
            }
        });
    }
});


$('#message').summernote({
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
    height: 350, // set minimum height of editor
    callbacks: {
        onChange: function (e) {
            setTimeout(function () {
                $("#message").val($('.note-editable').html());
            }, 100);
        },
    }
});

$('#message').summernote('fontName', 'Sarabun');
$('#message').summernote('fontSize', '16');
