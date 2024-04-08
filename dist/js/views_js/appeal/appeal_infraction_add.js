
function get_data() {
    $.ajax({
        type: 'get',
        url: '/api/appeal/infraction/get_data',
        success: async function (result) {
            console.log(result);

            let data_type_id = result.data_type
            let doc = result.doc
            let infractiontype = result.infractiontype
            let approach = result.approach
            let measures = result.measures
            let specific = result.specific

            let option_data_type_id = ``
            let option_doc = ``
            let option_violation = ``
            let option_legal_status = ``
            let option_effect = ``
            let option_effectiveness = ``
            let option_approach_assets = ``
            let option_approach_Network = ``

            let option_measures = ` <label>กรุณาเพิ่ม มาตรการรักษาความมั่นคงปลอดภัยโดยทั่วไป (General Measures)</label>`
            let option_specific = ``

            if (approach != "ไม่มีข้อมูล") {
                approach.forEach(element => {
                    if (element.approach_heading_risk_based == 1) {
                        option_approach_assets += `
                            <option value="${element.approach_id}">${element.assets_name}</option>
                            `
                    } else {
                        option_approach_Network += `
                            <option value="${element.approach_id}">${element.assets_name}</option>
                            `
                    }
                });
            }

            if (measures != "ไม่มีข้อมูล") {
                measures.forEach(element => {
                    option_measures += `
                        <option value="${element.measures_id}">${element.measures_section_name}</option>
                        `
                });
            }
            if (specific != "ไม่มีข้อมูล") {
                specific.forEach(element => {
                    option_specific += `
                        <option value="${element.id_specific}">${element.event_process_name}</option>
                        `
                });
            }
            if (data_type_id != "ไม่มีข้อมูล") {
                data_type_id.forEach(element => {
                    var data_type_id_2 = element.data_type_id;
                    var data_type_name_2 = element.data_type_name;
                    if ($('#data_type_id').val().find((element) => element == data_type_id_2)) {
                        option_data_type_id += `
                        <option value="${data_type_id_2}" selected>${data_type_name_2}</option>
                        `
                    } else {
                        option_data_type_id += `
                        <option value="${data_type_id_2}">${data_type_name_2}</option>
                        `
                    }

                });
            }
            if (doc != "ไม่มีข้อมูล") {
                doc.forEach(element => {
                    option_doc += `
                        <option value="${element.doc_id}">${element.doc_name}</option>
                        `
                });
            }

            if (infractiontype != "ไม่มีข้อมูล") {
                console.log($('#infractiontype_effectiveness_id').val());
                infractiontype.forEach(element => {
                    if (element.infractiontype_type == 1) {
                        var infractiontype_id = element.infractiontype_id;
                        var infractiontype_name = element.infractiontype_name
                        if ($('#infractiontype_type_violation_id').val().find((element) => element == infractiontype_id)) {
                            option_violation += `
                        <option value="${infractiontype_id}" selected>${infractiontype_name}</option>
                        `
                        } else {
                            option_violation += `
                        <option value="${element.infractiontype_id}">${element.infractiontype_name}</option>
                        `
                        }

                    } else if (element.infractiontype_type == 4) {
                        var infractiontype_id = element.infractiontype_id;
                        var infractiontype_name = element.infractiontype_name
                        if ($('#infractiontype_legal_status_id').val().find((element) => element == infractiontype_id)) {
                            option_legal_status += `
                        <option value="${infractiontype_id}" selected>${infractiontype_name}</option>
                        `
                        } else {
                            option_legal_status += `
                        <option value="${infractiontype_id}">${infractiontype_name}</option>
                        `
                        }

                    } else if (element.infractiontype_type == 2) {
                        var infractiontype_id = element.infractiontype_id;
                        var infractiontype_name = element.infractiontype_name
                        if ($('#infractiontype_effect_id').val().find((element) => element == infractiontype_id)) {
                            option_effect += `
                        <option value="${infractiontype_id}" selected>${infractiontype_name}</option>
                        `
                        } else {
                            option_effect += `
                        <option value="${infractiontype_id}">${infractiontype_name}</option>
                        `
                        }

                    } else if (element.infractiontype_type == 3) {
                        var infractiontype_id = element.infractiontype_id;
                        var infractiontype_name = element.infractiontype_name
                        console.log($('#infractiontype_effectiveness_id').val().find((element) => element == infractiontype_id));
                        if ($('#infractiontype_effectiveness_id').val().find((element) => element == infractiontype_id)) {
                            option_effectiveness += `
                        <option value="${infractiontype_id}" selected>${infractiontype_name}</option>
                        `
                        } else {
                            option_effectiveness += `
                        <option value="${infractiontype_id}">${infractiontype_name}</option>
                        `
                        }

                    }
                });
            }
            document.getElementById('data_type_id').innerHTML = option_data_type_id
            document.getElementById('selecte_type_policy').innerHTML = option_doc
            document.getElementById('infractiontype_type_violation_id').innerHTML = option_violation
            document.getElementById('infractiontype_legal_status_id').innerHTML = option_legal_status
            document.getElementById('infractiontype_effect_id').innerHTML = option_effect
            document.getElementById('infractiontype_effectiveness_id').innerHTML = option_effectiveness

            document.getElementById('measures_id').innerHTML = option_measures
            document.getElementById('approach_id').innerHTML = `
                    <optgroup label="Information assets">
                        ${option_approach_assets}
                    </optgroup>
                    <optgroup label="Network and Equipment">
                        ${option_approach_Network}
                    </optgroup>
                    `
            document.getElementById('specific_id').innerHTML = option_specific


        },
        error: function (e) {
            console.log(e);
        }
    })
}
get_data()
function show_infraction(data) {
    let infraction = document.getElementById('infraction')
    let select = infraction.getElementsByTagName('select')
    let input = infraction.getElementsByTagName('input')

    if (data == 2) {
        infraction.style.display = 'none'
        for (let i = 0; i < select.length; i++) {
            select[i].required = false
        }
        for (let i = 0; i < input.length; i++) {
            input[i].required = false
        }
    } else {
        infraction.style.display = ''
        for (let i = 0; i < select.length; i++) {
            select[i].required = true
        }
        for (let i = 0; i < input.length; i++) {
            input[i].required = true
        }
    }
}


function add_infraction(types) {
    let infraction = document.getElementById('Add-infraction')
    let h4 = infraction.getElementsByTagName('h4')[0]
    let h5 = infraction.getElementsByTagName('h5')[0]
    let input = infraction.getElementsByTagName('input')
    input[0].value = ''
    input[1].value = ''
    if (types == 'เพิ่มหัวเรื่องการละเมิด') {
        h4.innerHTML = types
        h5.innerHTML = 'หัวเรื่องการละเมิด'
        input[1].value = 1
    } else if (types == 'เพิ่มสถานะทางกฏหมายของผู้ควบคุมข้อมูลส่วนบุคคล') {
        h4.innerHTML = types
        h5.innerHTML = 'สถานะทางกฏหมายของผู้ควบคุมข้อมูลส่วนบุคคล'
        input[1].value = 4
    } else if (types == 'เพิ่มประเภทหรือสถานะเจ้าข้อมูลส่วนบุคคล') {
        h4.innerHTML = types
        h5.innerHTML = 'ประเภทหรือสถานะเจ้าข้อมูลส่วนบุคคล'
        input[1].value = 2
    } else if (types == 'เพิ่มผลกระทบ') {
        h4.innerHTML = types
        h5.innerHTML = 'ผลกระทบ'
        input[1].value = 3
    }
}



// document.getElementById('button-submit').addEventListener('click', function () {
//     let infraction = document.getElementById('Add-infraction')
//     let input = infraction.getElementsByTagName('input')

//     if (input[0].value != '') {
//         $('#Add-infraction').modal('hide');
//         let data = {
//             'infractiontype_type': input[0].getAttribute('infractiontype_type'),
//             'infractiontype_name_ajax': input[0].value
//         }
//         $.ajax({
//             type: "post",
//             contentType: "application/json",
//             url: '/appeal/infraction/add/type/save',
//             data: JSON.stringify(data),
//             dataType: 'json',
//             success: async function (result) {
//                 console.log(result);
//                 Swal.fire(
//                     'บันทึกข้อมูลสำเร็จ',
//                     '',
//                     'success',
//                 )
//             },
//             error: function (e) {
//                 console.log(e);
//             }
//         });
//     }
// })