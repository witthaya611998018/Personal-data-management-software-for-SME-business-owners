document.getElementById("throw_away").addEventListener("click", function () {
    // let email = document.getElementById("email")
    let subject = document.getElementById("subject");
    let formFile = document.getElementById("formFile");
    let message = document.getElementById("message");
    let email_firstname = document.getElementById("email_firstname");
    let email_lastname = document.getElementById("email_lastname");
    // if (email != null) {
    //     email.value = "";
    // }
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
    document.getElementById('subject').click()
    document.getElementById('email_lastname').click()
    document.getElementById('email_firstname').click()
    $('.note-editable').empty()
    $('#default-message').prop('checked', false);
});





function policy_list() {
    $.ajax({
        type: 'get',
        url: '/api/email-inbox-board/policy',
        success: function (result) {
            let policy_selected = ''
            if (result.doc_pdpa_document == "ไม่มีข้อมูล") {
                policy_selected = `<option selected value="0" id="policy_selected">ไม่มีข้อมูลเอกสาร</option>`
            } else {
                let doc_pdpa_document = result.doc_pdpa_document
                policy_doc = ([...doc_pdpa_document])
                host = result.host
                doc_pdpa_document.forEach(element => {
                    policy_selected += `   
                    <option value="${element.doc_id},${element.doc_name}">
                   ${element.doc_name}
                    </option>`
                });
            }
            document.getElementById('policy').innerHTML = policy_selected

        },
        error: function (e) {
            console.log(e);
        }
    });
}
policy_list()


document.getElementById("print-envelopes").addEventListener("click", function () {
    $.ajax({
        type: 'GET',
        url: '/api/email-board/getData/' + 'printEnvelope',
        success: async function (result) {
            console.log(result);
            var processor = []
            result.forEach(element => {
                if (element.admin == 5) {
                    if (element.del_id == null) {
                        processor.push(element)
                    }
                }
            });
            var text = `
        <div>
        <div style="flex-direction: row;display: flex;margin-left: 30px;">
        <span>
            <h2>จาก</h2>
            <h4 style="line-height: 1.7;">
            ${processor[0].firstname} ${processor[0].lastname} <br>
            ${processor[0].contact} <br>
            อีเมล: ${processor[0].email} <br>
            โทร. ${processor[0].phone}
            </h4>
        </span>
        </div>
        <div style="justify-content: center;display: flex;">
        <span>
            <h2>กรุณาส่ง</h2>
            <h4 style="line-height: 1.7;">
                สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล<br>
                120 หมู่ 3 ศูนย์ราชการเฉลิมพระเกียรติ 80 พรรษาฯ อาคารรัฐรัประศาสนภักดี (อาคารบี) <br>
                ชั้น 7 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง <br>
                เขตหลักสี่ กรุงเทพฯ 10210 <br>
                โทร. 02 142 1033, 02 141 6993 <br>
            </h4>
        </span>
        <div>
        </div>
        </div>
        </div>
            `
            var myWindow = window.open('', '_blank');
            myWindow.document.write(text)
            myWindow.document.write(
                `
                <style type="text/css">
                @page { size: size: 4.5in 9.5in landscape;margin: 0; }
                * { font-family: sans-serif }
                </style>
                 <script>
                 window.print();
                 </script>`
            )

        },
        error: function (e) {
            console.log(e);
        }
    });
});


$('input[type="checkbox"]').on('click', function () {
    if ($(this).prop("checked") == true) {
        // console.log("xxxxxx");
        $(this).prop('checked', false);
        $.ajax({
            type: 'GET',
            url: '/api/email-board/getData/' + 'defaultMessage,0',
            success: function (result) {
                if (result == "ไม่มีข้อมูล") {
                    swal.fire({
                        // icon: "success",
                        title: "ไม่พบข้อความเริ่มต้น",
                        // text: " ",
                        showConfirmButton: false,
                        timer: 3000,
                    })
                } else {
                    $('#default-message').prop('checked', true);
                    let subject = document.getElementById('subject').value
                    document.getElementById('header_default').innerHTML = result[0].message_content
                    $("#message").val($('.note-editable').html());
                    document.getElementById('subject').value = subject + result[0].message_subject
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    } else {
        $(this).prop('checked', false);
        document.getElementById('subject').value = ""
        document.getElementById('header_default').innerHTML = ""
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

function add_text() {
    let header_default = `
        <p id="header_default">
            </p>
        `

    let content = `
        <p id="content">
            </p>
        `
    let policy_footer = `
        <p id="policy_footer">
            </p>
        `
    $('.note-editable').html(`
<div style="display:flex;justify-content: center;">
<div style="width: 80%;text-align: left;">
${header_default}${content}${policy_footer}
 </div>
</div>
`)
}
add_text()


$('#infraction').on('change', async function () {
    var id = $(this).val()
    console.log(id);
    if (id == 0) {
        document.getElementById('content').innerHTML = ''
    } else {
        $.ajax({
            type: 'GET',
            url: `/api/email-owner-personal/inbox/infraction/${id}`,
            success: function (result) {
                console.log(result);
                let infraction = result.infraction
                let data_type = result.data_type
                let approach = result.approach
                let infractiontype = result.infractiontype
                let measures = result.measures
                let specific = result.specific
                let dpo = result.dpo
                let processor = result.processor



                let count_type = 0
                let type_name = ''
                for (let i = 0; i < data_type.length; i++) {
                    let type = infraction[0].data_type_id.split(',')
                    if ((type.indexOf(String(data_type[i].data_type_id))) > -1) {
                        type_name += ` ${count_type + 1}.${data_type[i].data_type_name}`
                        count_type = count_type + 1
                    }
                }
                let count_effect = 0
                let count_effectiveness = 0
                let effect_name = ''
                let effectiveness_name = ''
                for (let i = 0; i < infractiontype.length; i++) {
                    let effect = infraction[0].infractiontype_effect_id.split(',')
                    let effectiveness = infraction[0].infractiontype_effectiveness_id.split(',')
                    if (infractiontype[i].infractiontype_type == 2) {
                        if ((effect.indexOf(String(infractiontype[i].infractiontype_id))) > -1) {
                            effect_name += ` ${count_effect + 1}.${infractiontype[i].infractiontype_name}`
                            count_effect = count_effect + 1
                        }
                    }
                    if (infractiontype[i].infractiontype_type == 3) {
                        if ((effectiveness.indexOf(String(infractiontype[i].infractiontype_id))) > -1) {
                            effectiveness_name += ` ${count_effectiveness + 1}.${infractiontype[i].infractiontype_name}`
                            count_effectiveness = count_effectiveness + 1
                        }
                    }
                }
                let count_measures = 0
                let measures_name = ''
                for (let i = 0; i < measures.length; i++) {
                    let infrac_measures = infraction[0].measures_id.split(',')
                    if ((infrac_measures.indexOf(String(measures[i].measures_id))) > -1) {
                        measures_name += ` ${count_measures + 1}.${measures[i].measures_section_name}`
                        count_measures = count_measures + 1
                    }
                }
                let count_approach_assets = 0
                let approach_name_assets = ''
                let count_approach_network = 0
                let approach_name_network = ''
                for (let i = 0; i < approach.length; i++) {
                    let infrac_approach = infraction[0].approach_id.split(',')
                    if (approach[i].approach_heading_risk_based == 1) {
                        if ((infrac_approach.indexOf(String(approach[i].approach_id))) > -1) {
                            approach_name_assets += ` ${count_approach_assets + 1}.${approach[i].measures_section_name}`
                            count_approach_assets = count_approach_assets + 1
                        }
                    } else {
                        if ((infrac_approach.indexOf(String(approach[i].approach_id))) > -1) {
                            approach_name_network += ` ${count_approach_network + 1}.${approach[i].measures_section_name}`
                            count_approach_network = count_approach_network + 1
                        }
                    }
                }

                let count_specific = 0
                let specific_name = ''
                for (let i = 0; i < specific.length; i++) {
                    let infrac_specific = infraction[0].specific_id.split(',')
                    if ((infrac_specific.indexOf(String(specific[i].id_specifi))) > -1) {
                        specific_name += ` ${count_specific + 1}.${specific[i].measures_section_name}`
                        count_specific = count_specific + 1
                    }
                }
                let dpo_skow = ''
                if (dpo == 'ไม่มีข้อมูล') {
                    dpo_skow = `<div
                            style="padding: 10px;border: 3px solid #d9d9d9;border-radius: 10px;margin-left: 0.5rem;">
                            <label for="RoPA" style="font-weight: bold;">เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (Data
                                Protection Officer :
                                DPO)(ถ้ามี)</label>
                            <div aria-label="ชื่อ-สกุล">
                                <label for="ชื่อ-สกุล">ชื่อ-สกุล :</label>
                                <label for="ชื่อ-สกุล">-</label>
                            </div>
                            <div aria-label="ชื่อ-สกุล">
                                <label for="ที่อยู่">ที่อยู่ :</label>
                                <label for="ที่อยู่">-</label>
                            </div>
                            <div aria-label="อีเมล">
                                <label for="อีเมล">อีเมล :</label>
                                <label for="อีเมล">-</label>
                            </div>
                            <div aria-label="เบอร์โทรศัพท์">
                                <label for="เบอร์โทรศัพท์">เบอร์โทรศัพท์ :</label>
                                <label for="เบอร์โทรศัพท์">-</label>
                            </div>
                        </div>
                        `
                } else {
                    dpo_skow = `<div
                            style="padding: 10px;border: 3px solid #d9d9d9;border-radius: 10px;margin-left: 0.5rem;">
                            <label for="RoPA" style="font-weight: bold;">เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (Data
                                Protection Officer :
                                DPO)(ถ้ามี)</label>
                            <div aria-label="ชื่อ-สกุล">
                                <label for="ชื่อ-สกุล">ชื่อ-สกุล :</label>
                                <label for="ชื่อ-สกุล">${dpo[0].firstname} ${dpo[0].lastname} </label>
                            </div>
                            <div aria-label="ชื่อ-สกุล">
                                <label for="ที่อยู่">ที่อยู่ :</label>
                                <label for="ที่อยู่">${dpo[0].contact}</label>
                            </div>
                            <div aria-label="อีเมล">
                                <label for="อีเมล">อีเมล :</label>
                                <label for="อีเมล">${dpo[0].email}</label>
                            </div>
                            <div aria-label="เบอร์โทรศัพท์">
                                <label for="เบอร์โทรศัพท์">เบอร์โทรศัพท์ :</label>
                                <label for="เบอร์โทรศัพท์">${dpo[0].phone}</label>
                            </div>
                        </div>
                        `
                }

                let content = `
            <div>
                <p style="font-size: large;font-weight: bold;">
                        ข้อมูลการแจ้งละเมิดประเมินมีเสี่ยงสูงที่ส่งเจ้าของข้อมูลส่วนบุคคล
                    </p>
                    <label for="(1)ข้อมูลโดยสังเขปเกี่ยวกับลักษณะของการละเมิดข้อมูลส่วนบุคคล"
                        style="font-weight: bold;">
                        (1) ข้อมูลโดยสังเขปเกี่ยวกับลักษณะของการละเมิดข้อมูลส่วนบุคคล
                    </label>
                    <div style="margin-top: 0.5rem">
                        <label for="(1) ลักษณะและประเภทของการละเมิดข้อมูลส่วนบุคคล">
                            (1) ลักษณะและประเภทของการละเมิดข้อมูลส่วนบุคคล
                        </label>
                    </div>
                    <div style="margin-left: 25px;">
                        <label for="อธิบาย">
                            อธิบาย
                        </label>
                        <label>
                            ${infraction[0].personal_data_breach_explain}
                        </label>
                    </div>
                    <div>
                        <label for="(2) ลักษณะหรือประเภทของข้อมูลส่วนบุคคลที่เกี่ยวข้องกับการละเมิด">
                            (2) ลักษณะหรือประเภทของข้อมูลส่วนบุคคลที่เกี่ยวข้องกับการละเมิด
                        </label>
                    </div>
                    <div style="margin-left: 25px;">
                        <label>
                            ${type_name}
                        </label>
                    </div>
                    <div style="margin-left: 25px;">
                        <label>
                            อธิบาย :
                        </label>
                        <label>
                            ${infraction[0].data_type_explain}
                        </label>
                    </div>
    
                    <div>
                        <label for="(3) ปริมาณของข้อมูลส่วนบุคคลที่เกี่ยวข้องกับการละเมิด/จำนวนรายการ (records)">
                            (3) ปริมาณของข้อมูลส่วนบุคคลที่เกี่ยวข้องกับการละเมิด/จำนวนรายการ (records)
                        </label>
                    </div>
                    <div style="margin-left: 25px;">
                        <label>
                            อธิบาย :
                        </label>
                        <label>
                            ${infraction[0].personal_information_records_explain}
                        </label>
                    </div>
    
                    <div>
                        <label for="(4) ลักษณะประเภทหรือสถานะของเจ้าของข้อมูลส่วนบุคคลที่ได้รับผลกระทบ">
                            (4) ลักษณะประเภทหรือสถานะของเจ้าของข้อมูลส่วนบุคคลที่ได้รับผลกระทบ
                        </label>
                    </div>
                    <div style="margin-left: 25px;">
                        <label>
                           ${effect_name}
                        </label>
                    </div>
                    <div style="margin-left: 25px;">
                        <label>
                            อธิบาย :
                        </label>
                        <label>
                           ${infraction[0].infractiontype_effect_id_explain}
                        </label>
                    </div>
                </div>
                <div style="margin-top: 0.5rem;">
                    <label for="(1)ข้อมูลโดยสังเขปเกี่ยวกับลักษณะของการละเมิดข้อมูลส่วนบุคคล"
                        style="font-weight: bold;">
                        (2) ชื่อสถานที่ติดต่อ และวิธีการติดต่อของเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคลในกรณี
                        ที่มีเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล หรือชื่อ สถานที่ติดต่อ
                        และวิธีการติดต่อของบุคคลที่ผู้ควบคุม ข้อมูล
                        ส่วนบุคคลมอบหมายให้ทำ หน้าที่ประสานงานและให้ข้อมูลเพ่ิมเติม
                    </label>
                    <div style=" display: flex;">
                        <div style="padding: 10px;border: 3px solid #d9d9d9;border-radius: 10px;"
                            aria-label="ผู้ควบคุมข้อมูลส่วนบุคคล">
                            <label for="RoPA" style="font-weight: bold;">ผู้ควบคุมข้อมูลส่วนบุคคล</label>
                            <div aria-label="ชื่อ-สกุล/ชื่อองค์กร">
                                <label for="RoPA">ชื่อ-สกุล/ชื่อองค์กร :</label>
                                <label for="RoPA">${processor[0].firstname} ${processor[0].lastname}</label>
                            </div>
                            <div aria-label="ที่อยู่">
                                <label for="RoPA">ที่อยู่ :</label>
                                <label for="RoPA">${processor[0].contact}</label>
                            </div>
                            <div aria-label="อีเมล">
                                <label for="RoPA">อีเมล :</label>
                                <label for="RoPA">${processor[0].email}</label>
                            </div>
                            <div aria-label="เบอร์โทรศัพท์">
                                <label for="เบอร์โทรศัพท์">เบอร์โทรศัพท์ :</label>
                                <label for="เบอร์โทรศัพท์">${processor[0].phone}</label>
                            </div>
                        </div>
                        ${dpo_skow}
                    </div>
                </div>
                <div style="margin-top: 0.5rem;">
                    <label style="font-weight: bold;"
                        for="(3) ข้อมูลเกี่ยวกับผลกระทบที่อาจเกิดขึ้นกับเจ้าของข้อมูลส่วนบุคคลจากเหตุการละเมิดข้อมูลส่วนบุคคล">(3)
                        ข้อมูลเกี่ยวกับผลกระทบที่อาจเกิดขึ้นกับเจ้าของข้อมูลส่วนบุคคลจากเหตุการละเมิดข้อมูล
                        ส่วนบุคคล
                    </label>
                    <div>
                        <label>
                            (1) ผลกระทบและความเสียหายที่เกิดข้ึนหรืออาจเกิดขึ้นกับเจ้าของข้อมูล
                        </label>
                    </div>
                    <div style="margin-left: 25px;">
                        <label>
                            อธิบาย :
                        </label>
                        <label>                    
                           ${infraction[0].severity_impact_explain}
                        </label>
                    </div>
    
                    <div>
                        <label>
                            (2) กระทบต่อประสิทธิผลของมาตรการที่ผู้ควบคุมข้อมูลส่วนบุคคล
                        </label>
                    </div>
                    <div>
                        <label>
                         ${effectiveness_name}
                        </label>
                    </div>
                    <div style="margin-left: 25px;">
                        <label>
                            อธิบาย :
                        </label>
                        <label>
                           ${infraction[0].infractiontype_effectiveness_id_explain}                                
                        </label>
                    </div>
                    <div>
                        <label>
                            (3) ผลกระทบในวงกว้างต่อธุรกิจหรือการดำเนินการหรือต่อสาธารณะจากเหตุการละเมิด
                        </label>
                    </div>
                    <div style="margin-left: 25px;">
                        <label>
                            อธิบาย :
                        </label>
                        <label>
                            ${infraction[0].violation_action_explain}                                
                        </label>
                    </div>
                </div>
    
                <div style="margin-top: 0.5rem;">
                    <label style="font-weight: bold;">
                        (4) แนวทางการเยียวยาความเสียหายของเจ้าของข้อมูลส่วนบุคคลและข้อมูลโดยสังเขป
                        เกี่ยวกับมาตรการที่ผู้ควบคุมข้อมูลส่วนบุคคลใช้หรือจะใช้เพื่อป้องกันระงับ
                        หรือแก้ไขเหตุการละเมิด
                        ข้อมูลส่วนบุคคลโดยอาจใช้มาตรการทางบุคลากรกระบวนการหรือเทคโนโลยีหรือมาตรการอื่นใด
                        ที่จำเป็นและเหมาะสมรวมถึงข้อแนะนำเกี่ยวกับมาตรการที่เจ้าของข้อมูลส่วนบุคคลอาจดำ
                        เนินการเพิ่มเติมเพี่อป้องกันระงับหรือแก้ไขเหตุการละเมิดข้อมูลส่วนบุคคล
                        หรือเยียวยาความเสียหาย
                    </label>
                    <div>
                        <label>(1) การเยี่ยวยาหรือการบรรเทาผลกระทบที่เกิดขึ้นต่อเจ้าของข้อมูล</label>
                    </div>
                    <div style="margin-left: 25px;">
                        <label>
                            อธิบาย :
                        </label>
                        <label>
                            ${infraction[0].infractiontype_healing_explain}                                
                        </label>
                    </div>
                    <div>
                        <label>(2) ลักษณะของระบบการจัดเก็บข้อมูลส่วนบุคคลที่เกี่ยวข้องกับการละเมิดและมาตรการ รักษา
                            ความมั่นคงปลอดภัยที่เกี่ยวข้องของผู้ควบคุมข้อมูลส่วนบุคคล</label>
                    </div>
                    <div style="margin-left: 25px;">
                        <label>
                            1.มาตรการรักษาความมั่นคงปลอดภัยโดยทั่วไป (General Measures)
                        </label>
                        <br>
                        <label>
                            ${measures_name}
                        </label>
                    </div>
                    <div>
                        <label>
                            2.มาตราการต้องสามารถระบุความเสี่ยงที่สำคัญที่อาจจะเกิด (Risk-based Approach)
                        </label>
                        <br>
                        <label style="margin-left: 25px;">
                            Information assets
                            <br>
                            ${approach_name_assets}
                        </label>
                        <br>
                        <label style="margin-left: 25px;">
                            Network and Equipment
                            <br>
                            ${approach_name_network}
                        </label>
                    </div>
                    <div>
                        <label>
                            3.มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPAกำหนด (PDPA Specific Measures)
                        </label>
                        <br>
                        <label style="margin-left: 25px;">
                          ${specific_name}
                        </label>
                    </div>
                </div>
            `
                document.getElementById('content').innerHTML = content
                $("#message").val($('.note-editable').html());

            },
            error: function (e) {
                console.log(e);
            }
        });
    }

})

$('#policy').on('change', async function () {
    var id = $(this).val()
    if (id.length <= 0) {
        document.getElementById('policy_footer').innerHTML = ''
    } else {
        let policy = `<p style="font-size: large;font-weight: bold;">
                         เอกสาร PDPA
                        </p>
             `
        for (let i = 0; i < id.length; i++) {
            policy += `
            <a href="${host}/show_slide/${id[i].split(',')[0]}" target="_blank">${i + 1} ${id[i].split(',')[1]}</a><br>
            `
        }
        document.getElementById('policy_footer').innerHTML = policy
        $("#message").val($('.note-editable').html());
    }
})