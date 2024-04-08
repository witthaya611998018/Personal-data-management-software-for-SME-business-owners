
var data_export = []
var dpo = []
var content_mail = ""


let GetActivityRopaList = () => {
    $.ajax({
        type: 'GET',
        url: '/api/activity-ropa/list',
        success: async function (result) {
            let tiile_edit_text = document.querySelectorAll('.tiile_edit_text')
            let type_user = result.processor
            let classifi = result.classifi_name
            let check_type = result.ropa
            var processor = []
            type_user.forEach(element => {
                if (element.admin == 3) {
                    if (element.del_id == null) {
                        dpo.push(element)
                    }
                }
                if (element.admin == 5) {
                    if (element.del_id == null) {
                        processor.push(element)
                    }
                }
            });
            var option_type_list = "<option  value='all'>เลือก...</option>"
            classifi.forEach(element => {
                option_type_list += `
                 <option  value="${element.classify_id} ">${element.classify_name} </option>
                       `
            });

            if (check_type === "processor") {  // กรณีเป็น ผู้ประมวลผลข้อมูลส่วนบุคคล
                tiile_edit_text.forEach(element => {
                    element.innerHTML = "การบันทึกรายการกิจกรรม (RoPA) สำหรับผู้ประมวลผล"
                });
                document.getElementById('first-hidden').hidden = false

                if (result.data_classify.length > 0) {
                    await DataTable(result)
                } else {
                    DataNull()
                    document.querySelector('.not_allowed').style.cssText = "cursor: not-allowed;"
                    document.getElementById('pdf').style.cssText = "pointer-events: none;"
                    document.getElementById('printer').style.cssText = "pointer-events: none;"
                    document.getElementById('mail').style.cssText = "pointer-events: none;"
                }
                var part_1_data = `
                <tr>
                    <th style="width: 20%;" class="processor-th" label-data="${processor[0].acc_id}">
                        ชื่อ-สกุล/ชื่อองค์กร
                    </th>                        
                    <td style="background-color: #f4f7b9;" class="processor-td">
                    ${processor[0].firstname} ${processor[0].lastname}
                    </td>
                </tr>
                        <tr>
                            <th class="processor-th">
                                ที่อยู่
                            </th>
                            <td style="background-color: #f4f7b9;" class="processor-td">
                                ${processor[0].contact}
                            </td>
                        </tr>
                        <tr>
                            <th class="processor-th">
                                อีเมล
                            </th>
                            <td style="background-color: #f4f7b9;" class="processor-td">
                                ${processor[0].email}
                            </td>
                        </tr>
                        <tr>
                            <th class="processor-th">
                                เบอร์โทรศัพท์
                            </th>
                            <td style="background-color: #f4f7b9;" class="processor-td">
                                ${processor[0].phone}
                            </td>
                        </tr>
                        <tr>
                            <th>
                                เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (หากมี)
                            </th>
                            <td style="background-color: #f4f7b9;">
                                ${dpo[0].firstname} ${dpo[0].lastname}   email : ${dpo[0].email}  เบอร์ติดต่อ : ${dpo[0].phone}
                            </td>
                        </tr>
                `
                document.getElementById('part-1').innerHTML = part_1_data
                document.getElementById('selecte_classifi').innerHTML = option_type_list

            } else { // กรณีเป็น ผู้ควบคุมข้อมูลส่วนบุคคล
                tiile_edit_text.forEach(element => {
                    element.innerHTML = "การบันทึกรายการกิจกรรม (RoPA) สำหรับผู้ควบคุมข้อมูลส่วนบุคคล"
                });
                document.getElementById('first-hidden-data-controller').hidden = false
                if (result.data_classify.length > 0) {
                    await DataTable_DataController(result)
                } else {
                    DataNull('control')
                    document.querySelector('.not_allowed_controller').style.cssText = "cursor: not-allowed;"
                    document.getElementById('pdf-data-controller').style.cssText = "pointer-events: none;"
                    document.getElementById('printer-data-controller').style.cssText = "pointer-events: none;"
                    document.getElementById('mail-data-controller').style.cssText = "pointer-events: none;"
                }
                let Data_Protection = ''
                if (dpo.length == 0) {
                    Data_Protection = `<tr>
                    <th colspan="2" style="background-color: #ccccccde;">
                        <div class="justify-content-between align-self-center d-flex">
                        เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (Data Protection Officer : DPO)(ถ้ามี)
                        <i class="fas fa-pencil-alt fa-2x text-warning" style="cursor: not-allowed"></i>
                    </div>                         
                    </th>
                </tr>
                <tr>
                    <th class="data-Protection-th" label-data="-">
                        ชื่อ-สกุล
                    </th>
                    <td style="background-color: #f4f7b9;" class="data-officer" class="data-Protection-td">
                       -
                    </td>
                </tr>
                <tr>
                    <th class="data-Protection-th">
                        ที่อยู่
                    </th>
                    <td style="background-color: #f4f7b9;" class="data-officer" class="data-Protection-td">
                       -
                    </td>
                </tr>
                <tr>
                    <th class="data-Protection-th">
                        อีเมล
                    </th>
                    <td style="background-color: #f4f7b9;" class="data-officer" class="data-Protection-td">
                        -
                    </td>
                </tr>
                <tr>
                    <th class="data-Protection-th">
                        เบอร์โทรศัพท์
                    </th>
                    <td style="background-color: #f4f7b9;" class="data-officer" class="data-Protection-td">
                        -
                    </td>
                </tr>`
                } else {
                    Data_Protection = `
                    <tr>
                    <th colspan="2" style="background-color: #ccccccde;">
                        <div class="justify-content-between align-self-center d-flex">
                        เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (Data Protection Officer : DPO)(ถ้ามี)
                        <a class="text-warning " data-bs-toggle="modal" 
                         type-label="data-Protection" data-bs-target="#edit_data_modal_protection">
                         <i class="fas fa-pencil-alt fa-2x"></i>
                        </a>
                    </div>                         
                    </th>
                </tr>
                <tr>
                    <th class="data-Protection-th" label-data="${dpo[0].acc_id}">
                        ชื่อ-สกุล
                    </th>
                    <td style="background-color: #f4f7b9;" class="data-officer" class="data-Protection-td">
                        ${dpo[0].firstname} ${dpo[0].lastname} 
                    </td>
                </tr>
                <tr>
                    <th class="data-Protection-th">
                        ที่อยู่
                    </th>
                    <td style="background-color: #f4f7b9;" class="data-officer" class="data-Protection-td">
                        ${dpo[0].contact}
                    </td>
                </tr>
                <tr>
                    <th class="data-Protection-th">
                        อีเมล
                    </th>
                    <td style="background-color: #f4f7b9;" class="data-officer" class="data-Protection-td">
                        ${dpo[0].email}
                    </td>
                </tr>
                <tr>
                    <th class="data-Protection-th">
                        เบอร์โทรศัพท์
                    </th>
                    <td style="background-color: #f4f7b9;" class="data-officer" class="data-Protection-td">
                        ${dpo[0].phone}
                    </td>
                </tr>
                    `
                }

                var part_1_data = `
                         <tr>
                            <th style="width: 20%;" class="data-controller-th" label-data="${processor[0].acc_id}">
                                ชื่อ-สกุล/ชื่อองค์กร
                            </th>
                            <td style="background-color: #d8f1f666;" class="data-controller-td">
                                ${processor[0].firstname} ${processor[0].lastname}
                            </td>
                        </tr>
                        <tr>
                            <th class="data-controller-th">
                                ที่อยู่
                            </th>
                            <td style="background-color: #d8f1f666;" class="data-controller-td">
                                ${processor[0].contact}
                            </td>
                        </tr>
                        <tr>
                            <th class="data-controller-th">
                                อีเมล
                            </th>
                            <td style="background-color: #d8f1f666;" class="data-controller-td">
                                ${processor[0].email}
                            </td>
                        </tr>
                        <tr>
                            <th class="data-controller-th">
                                เบอร์โทรศัพท์
                            </th>
                            <td style="background-color: #d8f1f666;" class="data-controller-td">
                                ${processor[0].phone}
                            </td>
                        </tr>
                        
                `
                document.getElementById('part-1-data-controller').innerHTML = part_1_data + Data_Protection
                document.getElementById('selecte_classifi_data_controller').innerHTML = option_type_list
            }
            await create_function()
        },
        error: function (e) {
            console.log("error", e);
        }
    });
}
GetActivityRopaList()



async function DataTable(data) {
    data_export = []
    let classifi = data.data_classify
    let data_classity = data.data_classify
    let data_person = data.data_set.person_data_name //ข้อมูลส่วนบุคคล
    let objective = data.data_set.policy_data_name // 	วัตถุประสงค์
    let data_out = data.data_set.data_out_new // 	วัตถุประสงค์
    let appeal_data = data.data_set.data_appeal_new // 	เรื่องร้องเรียน
    let previews_data_out = data.data_set.data_out_previews_new

    data_export.push({ data_person, classifi, objective, data_out, appeal_data, previews_data_out })

    for (var i = 0; i < data_classity.length; i++) {
        data_classity[i].no = i + 1
    }
    var state = {
        'querySet': data_classity,
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
        // var wrapper = document.getElementById('pagination-wrapper')
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
        // var num = 1
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
            $('#table_sortable').remove()
            state.page = Number($(this).val())
            buildTable()
        })
    };


    function buildTable() {
        var table = $('#past-2');
        var data = pagination(state.querySet, state.page, state.rows)
        var myList = data.querySet
        var show = [];


        for (var i in myList) {

            var data_person_new = []
            var objective_new = []
            var data_out_new = []
            var appeal_data_new = []
            var data_protection = `
            จำกัดปริมาณข้อมูล : ${myList[i].classify_protect_data_limit_process}
            `
            for (let j = 0; j < data_person.length; j++) {
                if (j == data_person.length - 1) {
                    if (data_person[j] == '-') {
                        data_person_new.push("-")
                    } else {
                        data_person_new.push(`
                        ${data_person[j].toString()}
                        <a href = "/pattern/detail${myList[i].pattern_id}" target="_blank" class= "text-info" > <i class="fas fa-file-alt fa-2x"></i></a>
                        `)
                    }
                } else {
                    if (data_person[j] == '-') {
                        data_person_new.push("-")
                    } else {
                        data_person_new.push(`
                        ${data_person[j].toString()}
                        <a href = "/pattern/detail${myList[i].pattern_id}" target="_blank" class= "text-info" > <i class="fas fa-file-alt fa-2x"></i></a>
                        `)
                    }
                }
            }
            for (let i = 0; i < objective.length; i++) {
                if (i == data_person.length - 1) {
                    objective_new.push(`
                        ${objective[i].toString()}
                        <a href="/pattern/detail${myList[i].pattern_id}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                        `)
                } else {
                    objective_new.push(`
                        ${objective[i].toString()}
                        <a href="/pattern/detail${myList[i].pattern_id}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                        `)
                }
            }

            for (let i = 0; i < data_out.length; i++) {
                if (data_out[i] != '-') {
                    data_out_new.push(`${data_out[i].toString()}`)
                } else {
                    data_out_new.push(`-`)
                }
            }

            for (let i = 0; i < appeal_data.length; i++) {
                appeal_data_new.push(appeal_data[i].toString())
            }
            // <a href="/pattern/detail${myList[i].pattern_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
            // <a href="/dataoutdetails${myList[i].pattern_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
            // กำหนดการเข้าถึงข้อมูล
            if (myList[i].classify_approach_protect_used_two_factor_from_email == 1 || myList[i].classify_approach_protect_used_two_factor_from_google_authen == 1 || myList[i].classify_approach_protect_used_two_factor_from_sms == 1) {
                data_protection += ` กำหนดการเข้าถึงข้อมูล : 2FA  <br>`
            }
            if (myList[i].classify_protect_data_limit_follow_datetime == 1) {
                data_protection += ` กำหนดเวลาเข้าถึงข้อมูล : จันทร์ - ศุกร์ เวลา 08.00 น. - 17.00 น. `
            }

            var row = `
                <tr>
                    <td class="ttt">
                        ${myList[i].no}
                    </td>
                    <td class="ttt">
                        <input type="checkbox" onclick="check_box_export(this)" value="${myList[i].classify_id}">
                    </td>
                    <td>
                      ชื่อ-สกุล/ชื่อองค์กร  ${myList[i].firstname} ${myList[i].lastname} <br>
                      ที่อยู่ ${myList[i].contact} <br>
                      อีเมล ${myList[i].email} <br>
                      เบอร์โทรศัพท์ ${myList[i].phone} <br>
                      เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (หากมี) ${dpo[0].firstname} ${dpo[0].lastname}  <br> email : ${dpo[0].email}  เบอร์ติดต่อ : ${dpo[0].phone}  <a href="/classification/detail${myList[i].classify_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                      </td>
                    <td>
                        ${myList[i].classify_name} 
                         <a href="/classification/detail${myList[i].classify_id}" target="_blank"  class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                    </td>
                    <td>                               
                        ${data_person_new[i]} 
                    </td>
                    <td>
                        ${objective_new[i]} 
                    </td>
                    <td>
                        ${data_out_new[i]} 
                    </td>
                    <td>    
                        ${data_protection} 
                        <a href="/classification/detail${myList[i].classify_id}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                    </td>
                    <td>
                        ${appeal_data_new[i]} 
                    </td>
                </tr>`
            table.append(row)
            show.push(myList[i].no)
        }

        document.querySelector("#show").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
        document.querySelector("#to_show").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
        document.querySelector("#show_all").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
        pageButtons(data.pages)
    };

};

document.getElementById('search_classifi').addEventListener('click', () => { // ค้นหา classifi  ผู้ประมวลผลข้อมูลส่วนบุคคล
    let data = { 'id': $('#selecte_classifi').val() }
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: '/api/activity-ropa/search-classifi',
        data: JSON.stringify(data),
        dataType: 'json',
        success: async function (result) {
            $('#past-2').empty()
            await DataTable(result)
        },
        error: function (e) {
            console.log(e);
        }
    });
})


async function DataTable_DataController(data) {
    data_export = []
    let data_classity = data.data_classify
    let data_person = data.data_set.person_data_name //ข้อมูลส่วนบุคคล
    // let objective = data.data_set.policy_data_name // 	วัตถุประสงค์
    let objective = data.data_set.classify_explain_process // 	วัตถุประสงค์

    let data_out = data.data_set.data_out_new // 	วัตถุประสงค์
    let appeal_data = data.data_set.data_appeal_new // 	เรื่องร้องเรียน
    let appeal_detail_summary = data.data_set.appeal_detail_summary_new // 	หมายเหตุ
    let complaint_approve_reject = data.data_set.complaint_approve_reject_new // 	อนุมัติตามคำร้องเรียน/ปฏิเสธเรื่องร้องเรียน
    let complaint = data.data_set.complaint_new // สิทธิ
    let name_appeal = data.data_set.name_appeal_new // ผู้ร้องเรียน
    let previews_data_out = data.data_set.data_out_previews_new // 	เรื่องร้องเรียน
    // 	อนุมัติตามคำร้องเรียน/ปฏิเสธเรื่องร้องเรียน
    let specific = data.specifics // มาตราการ

    let Complainant = data.data_set.Complainant; // ผู้ร้องเรียน ใหม่ 
    let ComplaintRights = data.data_set.ComplaintRights; // สิทธิการร้องเรียน ใหม่ 
    let IDappeal = data.data_set.data_id_appeal_new
    // console.log("IDappeal", IDappeal);
    // console.log(data);

    data_export.push({ data_person, data_classity, Complainant, ComplaintRights, specific, objective, previews_data_out, appeal_data, appeal_detail_summary, complaint_approve_reject, complaint, name_appeal, data_out })

    for (var i = 0; i < data_classity.length; i++) {
        data_classity[i].no = i + 1
    }
    var state = {
        'querySet': data_classity,
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
        // var wrapper = document.getElementById('pagination-wrapper')
        var wrapper = document.querySelector('.pagination-data-controller')
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
        // var num = 1
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
            $('#table_sortable').remove()
            state.page = Number($(this).val())
            buildTable()
        })
    };


    function buildTable() {
        var table = $('#past-2-data-controller');
        var data = pagination(state.querySet, state.page, state.rows)
        var myList = data.querySet
        var shows = [];
        for (var i in myList) {
            //  มาตราการ
            let specificShow = ""
            specific[i].forEach((element, index) => {
                specificShow += `${index + 1}.${element.classification_measures_section_name} <a href="/classification/detail${myList[i].classify_id}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a><br>`
            });
            var data_person_new = []
            var objective_new = []
            var complaint_approve_reject_new = []
            for (let j = 0; j < data_person.length; j++) {
                if (j == data_person.length - 1) {
                    if (data_person[j] == '-') {
                        data_person_new.push("-")
                    } else {
                        data_person_new.push(`
                        ${data_person[j].toString()}
                        <a href = "/pattern/detail${myList[i].pattern_id}" target="_blank" class= "text-info" > <i class="fas fa-file-alt fa-2x"></i></a>
                        `)
                    }
                } else {
                    if (data_person[j] == '-') {
                        data_person_new.push("-")
                    } else {
                        data_person_new.push(`
                        ${data_person[j].toString()}
                        <a href = "/pattern/detail${myList[i].pattern_id}" target="_blank" class= "text-info" > <i class="fas fa-file-alt fa-2x"></i></a>
                        `)
                    }
                }
            }

            for (let i = 0; i < objective.length; i++) {
                if (i == data_person.length - 1) {
                    objective_new.push(`
                        ${objective[i].toString()}
                        <a href="/pattern/detail${myList[i].pattern_id}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                        `)
                } else {
                    objective_new.push(`
                        ${objective[i].toString()}
                        <a href="/pattern/detail${myList[i].pattern_id}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                        `)
                }
            }
            for (let i = 0; i < complaint_approve_reject.length; i++) {
                complaint_approve_reject_new.push(complaint_approve_reject[i].toString().replace('<br>', ''))
            }
            // สิทธิของเจ้าขอข้อมูลส่วนบุคคล
            let Rights = ""
            if (Complainant[i] !== "-" && ComplaintRights[i] !== "-") {
                Rights = `ผู้ร้องเรียน :  ${Complainant[i]} <a href="/appreal_information/${IDappeal[i]}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a> <br>
                            ${ComplaintRights[i]}`
            } else {
                Rights = '-'
            }

            let date = new Date(myList[i].date_use).toLocaleDateString('en-GB') + " - " + new Date(new Date(myList[i].date_use).getTime() + myList[i].pattern_total_date * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB') + ` <br> ( ${myList[i].pattern_total_date} ) วัน`;
            myList[i].classify_explain_process = myList[i].classify_explain_process != '' ? myList[i].classify_explain_process + ` <a href="/classification/detail${myList[i].classify_id}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>` : '-'
            var row = `
                <tr>
                    <td>
                        ${myList[i].no}
                    </td>
                    <td>
                      <input class="form-check-input secondary check-outline outline-secondary input_checkBox"  onclick="checkBox(this)" type="checkbox" id="${[i]}">
                    </td>
                      <td>
                        ${myList[i].classify_name} 
                         <a href="/classification/detail${myList[i].classify_id}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                    </td>
                    <td>
                        ${myList[i].classify_explain_process} 
                    </td>
                    <td>                               
                        ${data_person_new[i]} 
                    </td>
                    <td >
                        ${myList[i].classify_processing_base_explain} 
                        ${myList[i].pattern_processing_base_name} 
                        <a href="/classification/detail${myList[i].classify_id}" target="_blank"  class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                    </td>
                    <td>    
                        ${date} 
                        <a href="/pattern/detail${myList[i].pattern_id}"  target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                    </td>
                    <td>
                        ${specificShow} 
                    </td>
                    <td>
                     ${Rights}
                    </td>
                    <td>
                         ${complaint_approve_reject_new[i]}
                    </td>
                    <td>
                        -
                    </td>
                </tr>`
            table.append(row)
            shows.push(myList[i].no)
        }
        document.querySelector("#show_data_controller").innerHTML = shows[0];  //  แสดงถึง row เเรกของหน้า 
        document.querySelector("#to_show_data_controller").innerHTML = shows[shows.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
        document.querySelector("#show_all_data_controller").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
        pageButtons(data.pages)
    };

};

document.getElementById('search_classifi_data_controller').addEventListener('click', () => { // ค้นหา classifi  สำหรับผู้ควบคุมข้อมูล
    let data = { 'id': $('#selecte_classifi_data_controller').val() }
    console.log("data", data);
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: '/api/activity-ropa/search-classifi',
        data: JSON.stringify(data),
        dataType: 'json',
        success: async function (result) {
            $('#past-2-data-controller').empty()
            await DataTable_DataController(result)
        },
        error: function (e) {
            console.log(e);
        }
    });
})

document.getElementById('pdf-data-controller').addEventListener('click', () => {
    let myList = data_export[0].data_classity
    let data_person = data_export[0].data_person //ข้อมูลส่วนบุคคล
    let objective = data_export[0].objective // 	วัตถุประสงค์
    let complaint_approve_reject = data_export[0].complaint_approve_reject // 	อนุมัติตามคำร้องเรียน/ปฏิเสธเรื่องร้องเรียน
    var part_1 = document.getElementById('export-part-1-data-controller').outerHTML
    let specific = data_export[0].specific // มาตราการ
    let Complainant = data_export[0].Complainant; // ผู้ร้องเรียน ใหม่ 
    let ComplaintRights = data_export[0].ComplaintRights; // สิทธิการร้องเรียน ใหม่ 
    var content = ""

    // let data_out = data_export[0].data_out // 	วัตถุประสงค์
    // let appeal_data = data_export[0].appeal_data // 	เรื่องร้องเรียน
    // let appeal_detail_summary = data_export[0].appeal_detail_summary // 	หมายเหตุ
    // let complaint = data_export[0].complaint // สิทธิ
    // let name_appeal = data_export[0].name_appeal // ผู้ร้องเรียน


    // จำนวน checkbox ที่เลือก 
    let count = [];
    var inputElements = document.querySelectorAll('.input_checkBox');
    inputElements.forEach(element => {
        if (element.checked === true) {
            count.push(parseInt(element.getAttribute("id")))
        }
    });

    let countNO = 1; // ลำดับข้อมูล
    for (let index = 0; index < count.length; index++) {
        let i = count[index];
        if (i < myList.length) {
            var data_person_new = []
            var objective_new = []
            var complaint_approve_reject_new = []

            // ข้อมูลส่วนบุคคลที่มีการเก็บรวบรวม
            for (let j = 0; j < data_person.length; j++) {
                if (j == data_person.length - 1) {
                    if (data_person[j] == '-') {
                        data_person_new.push("-")
                    } else {
                        data_person_new.push(data_person[j].toString())
                    }
                } else {
                    if (data_person[j] == '-') {
                        data_person_new.push("-")
                    } else {
                        data_person_new.push(data_person[j].toString())
                    }
                }
            }
            // วัตถุประสงค์
            objective.forEach(element => {
                element ? objective_new.push(element.toString()) : objective_new.push("-")
            });
            // การบันทึกรายละเอียดการปฏิเสธคำขอหรือการคัดค้านการใช้สิทธิของเจ้าของ้อมูลส่วนบุคคล
            complaint_approve_reject.forEach(element => {
                complaint_approve_reject_new.push(element.toString().replace('<br>', ''))
            });
            // สิทธิของเจ้าขอข้อมูลส่วนบุคคล
            let Rights = ""
            if (Complainant[i] !== "-" && ComplaintRights[i] !== "-") {
                Rights = `ผู้ร้องเรียน :  ${Complainant[i]}<br>
                            ${ComplaintRights[i]}`
            } else {
                Rights = '-'
            }
            //  มาตราการ
            let specificShow = ""
            specific[i].forEach((element, index) => {
                specificShow += `${index + 1}.${element.classification_measures_section_name} <a href="/classification/detail${myList[i].classify_id}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a><br>`
            });
            let date = new Date(myList[i].date_use).toLocaleDateString('en-GB') + " - " + new Date(new Date(myList[i].date_use).getTime() + myList[i].pattern_total_date * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB') + ` <br> ( ${myList[i].pattern_total_date} ) วัน`;
            var row = `
            <tr>
                <td>
                    ${countNO}
                </td>
                  <td>
                    ${myList[i].classify_name} 
                </td>
                <td>
                    ${objective_new[i]} 
                </td>
                <td>                               
                    ${data_person_new[i]} 
                </td>

                <td>
                    ${myList[i].classify_processing_base_explain} 
                    ${myList[i].pattern_processing_base_name} 
                </td>
                <td>    
                    ${date} 
                </td>
                <td>
                    ${specificShow} 
                </td>
                <td>
                    ${Rights}
                </td>
                <td>
                     ${complaint_approve_reject_new[i]}
                </td>
                <td>
                </td>
            </tr>`
            content += row
            countNO = countNO + 1
        }
    }

    var myWindow = window.open('', '_blank');
    var header_content = `
     <div class="content" style="margin-top: 60px;">
    <table >
    <thead>
    <tr class="color_td">
        <th colspan="11">
            ส่วนที่ 2 : บันทึกรายการ
        </th>
    </tr>
    <tr class="color_td">
        <th rowspan="2">
            ลำดับ
        </th>
        <th colspan="5">
            รายละเอียดทั่วไปของการประมวลผลข้อมูลส่วนบุคคล (เก็บรวบรวม ใช้ เปิดเผย)
        </th>
        <th>
            มาตรการรักษาตวามมั่นคงปลอดภัยตามมาตรา 37 (1)
        </th>
        <th colspan="2">
            การใช้สิทธิ
        </th>
        <th>
            หมายเหตุ
        </th>
    </tr>
    <tr class="color_td">
        <td>
            ชื่อกิจกรรม
        </td>
        <td>
            วัตถุประสงค์
        </td>
        <td>
            ข้อมูลส่วนบุคคลที่มีการเก็บรวบรวม
        </td>
        <td>
            การใช้ / เปิดเผย
        </td>
        <td>
            ระยะเวลา
        </td>
        <td>
            มาตรการรักษาความปลอดภัย
        </td>
        <td>
            สิทธิของเจ้าขอข้อมูลส่วนบุคคล
        </td>
        <td>
            การบันทึกรายละเอียดการปฏิเสธคำขอหรือ<br>การคัดค้านการใช้สิทธิของเจ้าของ้อมูลส่วนบุคคล
        </td>
        <td>

        </td>
        </tr>
        </thead>
    <tbody>`
    var footer_content = `</tbody></table> </div>`
    myWindow.document.write("รายงาน  การบันทึกรายการกิจกรรม (RoPA)", `${part_1} <br>${header_content}${content}${footer_content}`)
    myWindow.document.write(`
        <style>
        @page{size:landscape;}
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
        body {
            height: 100%;
            margin: 0;
            }
        </style>
         <script>
          window.print();
         </script>
         `
    );

})


document.getElementById('printer-data-controller').addEventListener('click', () => {
    let myList = data_export[0].data_classity
    let data_person = data_export[0].data_person //ข้อมูลส่วนบุคคล
    let objective = data_export[0].objective // 	วัตถุประสงค์
    let complaint_approve_reject = data_export[0].complaint_approve_reject // 	อนุมัติตามคำร้องเรียน/ปฏิเสธเรื่องร้องเรียน
    var part_1 = document.getElementById('export-part-1-data-controller').outerHTML
    let specific = data_export[0].specific // มาตราการ
    let Complainant = data_export[0].Complainant; // ผู้ร้องเรียน ใหม่ 
    let ComplaintRights = data_export[0].ComplaintRights; // สิทธิการร้องเรียน ใหม่ 
    var content = ""

    // let data_out = data_export[0].data_out // 	วัตถุประสงค์
    // let appeal_data = data_export[0].appeal_data // 	เรื่องร้องเรียน
    // let appeal_detail_summary = data_export[0].appeal_detail_summary // 	หมายเหตุ
    // let complaint = data_export[0].complaint // สิทธิ
    // let name_appeal = data_export[0].name_appeal // ผู้ร้องเรียน


    // จำนวน checkbox ที่เลือก 
    let count = [];
    var inputElements = document.querySelectorAll('.input_checkBox');
    inputElements.forEach(element => {
        console.log("element", parseInt(element.getAttribute("id")));
        if (element.checked === true) {
            count.push(parseInt(element.getAttribute("id")))
        }
    });

    let countNO = 1; // ลำดับข้อมูล
    for (let index = 0; index < count.length; index++) {
        let i = count[index];
        if (i < myList.length) {
            var data_person_new = []
            var objective_new = []
            var complaint_approve_reject_new = []

            // ข้อมูลส่วนบุคคลที่มีการเก็บรวบรวม
            for (let j = 0; j < data_person.length; j++) {
                if (j == data_person.length - 1) {
                    if (data_person[j] == '-') {
                        data_person_new.push("-")
                    } else {
                        data_person_new.push(data_person[j].toString())
                    }
                } else {
                    if (data_person[j] == '-') {
                        data_person_new.push("-")
                    } else {
                        data_person_new.push(data_person[j].toString())
                    }
                }
            }
            // วัตถุประสงค์
            objective.forEach(element => {
                element ? objective_new.push(element.toString()) : objective_new.push("-")
            });
            // การบันทึกรายละเอียดการปฏิเสธคำขอหรือการคัดค้านการใช้สิทธิของเจ้าของ้อมูลส่วนบุคคล
            complaint_approve_reject.forEach(element => {
                complaint_approve_reject_new.push(element.toString().replace('<br>', ''))
            });
            // สิทธิของเจ้าขอข้อมูลส่วนบุคคล
            let Rights = ""
            if (Complainant[i] !== "-" && ComplaintRights[i] !== "-") {
                Rights = `ผู้ร้องเรียน :  ${Complainant[i]}<br>
                            ${ComplaintRights[i]}`
            } else {
                Rights = '-'
            }
            //  มาตราการ
            let specificShow = ""
            specific[i].forEach((element, index) => {
                specificShow += `${index + 1}.${element.classification_measures_section_name} <a href="/classification/detail${myList[i].classify_id}" target="_blank" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a><br>`
            });
            let date = new Date(myList[i].date_use).toLocaleDateString('en-GB') + " - " + new Date(new Date(myList[i].date_use).getTime() + myList[i].pattern_total_date * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB') + ` <br> ( ${myList[i].pattern_total_date} ) วัน`;
            var row = `
            <tr>
                <td>
                    ${countNO}
                </td>
                  <td>
                    ${myList[i].classify_name} 
                </td>
                <td>
                    ${objective_new[i]} 
                </td>
                <td>                               
                    ${data_person_new[i]} 
                </td>

                <td>
                    ${myList[i].classify_processing_base_explain} 
                    ${myList[i].pattern_processing_base_name} 
                </td>
                <td>    
                    ${date} 
                </td>
                <td>
                    ${specificShow} 
                </td>
                <td>
                    ${Rights}
                </td>
                <td>
                     ${complaint_approve_reject_new[i]}
                </td>
                <td>
                </td>
            </tr>`
            content += row
            countNO = countNO + 1
        }
    }

    var myWindow = window.open('', '_blank');
    var header_content = `
     <div class="content" style="margin-top: 60px;">
    <table >
    <thead>
    <tr class="color_td">
        <th colspan="11">
            ส่วนที่ 2 : บันทึกรายการ
        </th>
    </tr>
    <tr class="color_td">
        <th rowspan="2">
            ลำดับ
        </th>
        <th colspan="5">
            รายละเอียดทั่วไปของการประมวลผลข้อมูลส่วนบุคคล (เก็บรวบรวม ใช้ เปิดเผย)
        </th>
        <th>
            มาตรการรักษาตวามมั่นคงปลอดภัยตามมาตรา 37 (1)
        </th>
        <th colspan="2">
            การใช้สิทธิ
        </th>
        <th>
            หมายเหตุ
        </th>
    </tr>
    <tr class="color_td">
        <td>
            ชื่อกิจกรรม
        </td>
        <td>
            วัตถุประสงค์
        </td>
        <td>
            ข้อมูลส่วนบุคคลที่มีการเก็บรวบรวม
        </td>
        <td>
            การใช้ / เปิดเผย
        </td>
        <td>
            ระยะเวลา
        </td>
        <td>
            มาตรการรักษาความปลอดภัย
        </td>
        <td>
            สิทธิของเจ้าขอข้อมูลส่วนบุคคล
        </td>
        <td>
            การบันทึกรายละเอียดการปฏิเสธคำขอหรือ<br>การคัดค้านการใช้สิทธิของเจ้าของ้อมูลส่วนบุคคล
        </td>
        <td>

        </td>
        </tr>
        </thead>
    <tbody>`
    var footer_content = `</tbody></table> </div>`
    myWindow.document.write("รายงาน  การบันทึกรายการกิจกรรม (RoPA)", `${part_1} <br>${header_content}${content}${footer_content}`)
    myWindow.document.write(`
        <style>
        @page{size:landscape;}
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
        body {
            height: 100%;
            margin: 0;
            }
        </style>
         <script>
          window.print();
         </script>
         `
    );

})

document.getElementById('pdf').addEventListener('click', () => {


    let myList = data_export[0].classifi
    let data_person = data_export[0].data_person //ข้อมูลส่วนบุคคล
    let objective = data_export[0].objective // 	วัตถุประสงค์
    let data_out = data_export[0].data_out // 	วัตถุประสงค์
    let appeal_data = data_export[0].appeal_data // 	เรื่องร้องเรียน

    var part_1 = document.getElementById('export-part-1').outerHTML

    var content = ""
    for (var i in myList) {
        var data_person_new = []
        var objective_new = []
        var data_out_new = []
        var appeal_data_new = []
        var data_protection = `
        จำกัดปริมาณข้อมูล : ${myList[i].classify_protect_data_limit_process}
        `
        for (let j = 0; j < data_person.length; j++) {
            if (j == data_person.length - 1) {
                if (data_person[j] == '-') {
                    data_person_new.push("-")
                } else {
                    data_person_new.push(`
                    ${data_person[j].toString()}
                    <a href = "/pattern/detail${myList[i].pattern_id}" class= "text-info" > <i class="fas fa-file-alt fa-2x"></i></a>
                    `)
                }
            } else {
                if (data_person[j] == '-') {
                    data_person_new.push("-")
                } else {
                    data_person_new.push(`
                    ${data_person[j].toString()}
                    <a href = "/pattern/detail${myList[i].pattern_id}" class= "text-info" > <i class="fas fa-file-alt fa-2x"></i></a>
                    `)
                }
            }
        }
        for (let i = 0; i < objective.length; i++) {
            if (i == data_person.length - 1) {
                objective_new.push(`
                    ${objective[i].toString()}
                    <a href="/pattern/detail${myList[i].pattern_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                    `)
            } else {
                objective_new.push(`
                    ${objective[i].toString()}
                    <a href="/pattern/detail${myList[i].pattern_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                    `)
            }
        }

        for (let i = 0; i < data_out.length; i++) {
            if (data_out[i] != '-') {
                data_out_new.push(`${data_out[i].toString()}`)
            } else {
                data_out_new.push(`-`)
            }
        }

        for (let i = 0; i < appeal_data.length; i++) {
            appeal_data_new.push(appeal_data[i].toString())
        }
        // <a href="/pattern/detail${myList[i].pattern_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
        // <a href="/dataoutdetails${myList[i].pattern_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
        // กำหนดการเข้าถึงข้อมูล
        if (myList[i].classify_approach_protect_used_two_factor_from_email == 1 || myList[i].classify_approach_protect_used_two_factor_from_google_authen == 1 || myList[i].classify_approach_protect_used_two_factor_from_sms == 1) {
            data_protection += ` กำหนดการเข้าถึงข้อมูล : 2FA  <br>`
        }
        if (myList[i].classify_protect_data_limit_follow_datetime == 1) {
            data_protection += ` กำหนดเวลาเข้าถึงข้อมูล : จันทร์ - ศุกร์ เวลา 08.00 น. - 17.00 น. `
        }

        var row = `
            <tr>
                  <td>
                      ${myList[i].no} 
                  </td>
                <td>
                  ชื่อ-สกุล/ชื่อองค์กร  ${myList[i].firstname} ${myList[i].lastname} <br>
                  ที่อยู่ ${myList[i].contact} <br>
                  อีเมล ${myList[i].email} <br>
                  เบอร์โทรศัพท์ ${myList[i].phone} <br>
                  เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (หากมี) ${dpo[0].firstname} ${dpo[0].lastname}  <br> email : ${dpo[0].email}  เบอร์ติดต่อ : ${dpo[0].phone}
                  </td>
                <td>
                    ${myList[i].classify_name} 
                     <a href="/classification/detail${myList[i].classify_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                </td>
                <td>                               
                    ${data_person_new[i]} 
                </td>
                <td>
                    ${objective_new[i]} 
                </td>
                <td>
                    ${data_out_new[i]} 
                </td>
                <td>    
                    ${data_protection} 
                    <a href="/classification/detail${myList[i].classify_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                </td>
                <td>
                    ${appeal_data_new[i]} 
                </td>
            </tr>`
        content += row

    }
    var myWindow = window.open('xxx', '_blank');
    var header_content = `<table style="margin-top: 15px;">
    <thead>
    <tr>
        <th colspan="10" style="background-color: #c5eaf1ab;">
            ส่วนที่ 2 : บันทึกรายการของกิจกรรมการประมวลผลข้อมูลส่วนบุคคล
        </th>
    </tr>
    <tr class="color_td">
        <th rowspan="2" class="ttt">
            ลำดับ
        </th>
        <th>
            ข้อมูลเกี่ยวกับผู้ควบคุมข้อมูลส่วนบุคคล
        </th>
        <th colspan="3">
            รายละเอียดทั่วไปของการประมวลผลข้อมูลส่วนบุคคล [ข้อ 3(4)]
        </th>
        <th>
            การโอนข้อมูลไปยังจ่างประเทศ (หากมี) [ข้อ 3(5)]
        </th>
        <th colspan="3">
            มาตรการรักษาตวามมั่นคงปลอดภัยตามมาตรา 40 วรรณหนึ่ง (2) [ข้อ 3 (6)]
        </th>
    </tr>
    <tr class="color_td">
        <td>
            ผู้ควบคุมข้อมูลส่วนบุคคล (เเละตัวเเทน หากมี)
        </td>
        <td>
            ประเภทหรือลักษณะ (ชื่อกิจกรรม)
        </td>
        <td>
            ข้อมูลส่วนบุคคล
        </td>
        <td>
            วัตถุประสงค์
        </td>
        <td>
            ชื่อประเทศเเละองค์กร/บุคคลปลายทาง
        </td>
        <td>
            คำอธิบายมาตรการรักษาความปลอดภัย
        </td>
        <td>
            บันทึกการเเจ้งเหตุการณ์ละเมิดข้อมูล<br>
            ส่วนบุคคลกับผู้ควบคุมข้อมูล (หากมี)
        </td>
    </tr>
</thead>
    <tbody>`
    var footer_content = `</tbody></table>`
    myWindow.document.write("รายงาน  การบันทึกรายการกิจกรรม (RoPA)", `${part_1} <br>${header_content}${content}${footer_content}`)
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

document.getElementById('printer').addEventListener('click', () => {
    let myList = data_export[0].classifi
    let data_person = data_export[0].data_person //ข้อมูลส่วนบุคคล
    let objective = data_export[0].objective // 	วัตถุประสงค์
    let data_out = data_export[0].data_out // 	วัตถุประสงค์
    let appeal_data = data_export[0].appeal_data // 	เรื่องร้องเรียน

    var part_1 = document.getElementById('export-part-1').outerHTML

    var content = ""
    for (var i in myList) {
        var data_person_new = []
        var objective_new = []
        var data_out_new = []
        var appeal_data_new = []
        var data_protection = `
        จำกัดปริมาณข้อมูล : ${myList[i].classify_protect_data_limit_process}
        `
        for (let j = 0; j < data_person.length; j++) {
            if (j == data_person.length - 1) {
                if (data_person[j] == '-') {
                    data_person_new.push("-")
                } else {
                    data_person_new.push(`
                    ${data_person[j].toString()}
                    <a href = "/pattern/detail${myList[i].pattern_id}" class= "text-info" > <i class="fas fa-file-alt fa-2x"></i></a>
                    `)
                }
            } else {
                if (data_person[j] == '-') {
                    data_person_new.push("-")
                } else {
                    data_person_new.push(`
                    ${data_person[j].toString()}
                    <a href = "/pattern/detail${myList[i].pattern_id}" class= "text-info" > <i class="fas fa-file-alt fa-2x"></i></a>
                    `)
                }
            }
        }
        for (let i = 0; i < objective.length; i++) {
            if (i == data_person.length - 1) {
                objective_new.push(`
                    ${objective[i].toString()}
                    <a href="/pattern/detail${myList[i].pattern_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                    `)
            } else {
                objective_new.push(`
                    ${objective[i].toString()}
                    <a href="/pattern/detail${myList[i].pattern_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                    `)
            }
        }

        for (let i = 0; i < data_out.length; i++) {
            if (data_out[i] != '-') {
                data_out_new.push(`${data_out[i].toString()}`)
            } else {
                data_out_new.push(`-`)
            }
        }

        for (let i = 0; i < appeal_data.length; i++) {
            appeal_data_new.push(appeal_data[i].toString())
        }
        // <a href="/pattern/detail${myList[i].pattern_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
        // <a href="/dataoutdetails${myList[i].pattern_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
        // กำหนดการเข้าถึงข้อมูล
        if (myList[i].classify_approach_protect_used_two_factor_from_email == 1 || myList[i].classify_approach_protect_used_two_factor_from_google_authen == 1 || myList[i].classify_approach_protect_used_two_factor_from_sms == 1) {
            data_protection += ` กำหนดการเข้าถึงข้อมูล : 2FA  <br>`
        }
        if (myList[i].classify_protect_data_limit_follow_datetime == 1) {
            data_protection += ` กำหนดเวลาเข้าถึงข้อมูล : จันทร์ - ศุกร์ เวลา 08.00 น. - 17.00 น. `
        }

        var row = `
            <tr>
                  <td>
                      ${myList[i].no} 
                  </td>
                <td>
                  ชื่อ-สกุล/ชื่อองค์กร  ${myList[i].firstname} ${myList[i].lastname} <br>
                  ที่อยู่ ${myList[i].contact} <br>
                  อีเมล ${myList[i].email} <br>
                  เบอร์โทรศัพท์ ${myList[i].phone} <br>
                  เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (หากมี) ${dpo[0].firstname} ${dpo[0].lastname}  <br> email : ${dpo[0].email}  เบอร์ติดต่อ : ${dpo[0].phone}
                  </td>
                <td>
                    ${myList[i].classify_name} 
                     <a href="/classification/detail${myList[i].classify_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                </td>
                <td>                               
                    ${data_person_new[i]} 
                </td>
                <td>
                    ${objective_new[i]} 
                </td>
                <td>
                    ${data_out_new[i]} 
                </td>
                <td>    
                    ${data_protection} 
                    <a href="/classification/detail${myList[i].classify_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
                </td>
                <td>
                    ${appeal_data_new[i]} 
                </td>
            </tr>`
        content += row

    }
    var myWindow = window.open('xxx', '_blank');
    var header_content = `<table style="margin-top: 15px;">
    <thead>
    <tr>
        <th colspan="10" style="background-color: #c5eaf1ab;">
            ส่วนที่ 2 : บันทึกรายการของกิจกรรมการประมวลผลข้อมูลส่วนบุคคล
        </th>
    </tr>
    <tr class="color_td">
        <th rowspan="2" class="ttt">
            ลำดับ
        </th>
        <th>
            ข้อมูลเกี่ยวกับผู้ควบคุมข้อมูลส่วนบุคคล
        </th>
        <th colspan="3">
            รายละเอียดทั่วไปของการประมวลผลข้อมูลส่วนบุคคล [ข้อ 3(4)]
        </th>
        <th>
            การโอนข้อมูลไปยังจ่างประเทศ (หากมี) [ข้อ 3(5)]
        </th>
        <th colspan="3">
            มาตรการรักษาตวามมั่นคงปลอดภัยตามมาตรา 40 วรรณหนึ่ง (2) [ข้อ 3 (6)]
        </th>
    </tr>
    <tr class="color_td">
        <td>
            ผู้ควบคุมข้อมูลส่วนบุคคล (เเละตัวเเทน หากมี)
        </td>
        <td>
            ประเภทหรือลักษณะ (ชื่อกิจกรรม)
        </td>
        <td>
            ข้อมูลส่วนบุคคล
        </td>
        <td>
            วัตถุประสงค์
        </td>
        <td>
            ชื่อประเทศเเละองค์กร/บุคคลปลายทาง
        </td>
        <td>
            คำอธิบายมาตรการรักษาความปลอดภัย
        </td>
        <td>
            บันทึกการเเจ้งเหตุการณ์ละเมิดข้อมูล<br>
            ส่วนบุคคลกับผู้ควบคุมข้อมูล (หากมี)
        </td>
    </tr>
</thead>
    <tbody>`
    var footer_content = `</tbody></table>`
    myWindow.document.write("รายงาน  การบันทึกรายการกิจกรรม (RoPA)", `${part_1} <br>${header_content}${content}${footer_content}`)
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

document.getElementById('share').addEventListener('click', () => {
    var style = ` <style>
    tbody,
    td,
    tfoot,
    th,
    thead,
    tr {
        border-color: inherit;
        border-style: solid;
    }

    .table {
        --bs-table-bg: transparent;
        --bs-table-striped-color: #212529;
        --bs-table-striped-bg: #ebf3f5;
        --bs-table-active-color: #212529;
        --bs-table-active-bg: rgba(0, 0, 0, 0.1);
        --bs-table-hover-color: #212529;
        --bs-table-hover-bg: #ebf3f5;
        width: 100%;
        margin-bottom: 1rem;
        color: #54667a;
        vertical-align: top;
        border-color: #e8eef3;
    }

    .tablesaw {
        width: 100%;
        max-width: 100%;
        empty-cells: show;
        border-collapse: collapse;
        border: 0;
        padding: 0;
    }
</style>`
    var data = {
        'mail_to': document.getElementById('email').value,
        'subject': document.getElementById('subject').value,
        'content': `${style}${content_mail}`
    }
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: '/api/activity-ropa/send-mail',
        data: JSON.stringify(data),
        dataType: 'json',
        success: async function (result) {
            if (result == 'success') {
                Swal.fire({
                    position: 'top',
                    type: 'success',
                    title: 'ส่งข้อมูลสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                })
                close_mail()
            } else {
                Swal.fire({
                    position: 'top',
                    type: 'warning',
                    title: 'ล้มเหลว',
                    showConfirmButton: false,
                    timer: 1500
                })
                close_mail()
            }
        },
        error: function (e) {
            console.log(e);
        }
    });
})


function close_mail(data) {
    if (data == "data-controller") {
        document.getElementById('email-data-controller').value = ""
        document.getElementById('subject-data-controller').value = ""
        document.getElementById('close-modal-data-controller').click()
    } else {
        document.getElementById('email').value = ""
        document.getElementById('subject').value = ""
        document.getElementById('close-modal').click()
    }

}

function check_box_export(data) {
    let check = data
    if (check.getAttribute('class') == null) {
        check.classList.add("check");
    } else {
        check.removeAttribute("class");
    }
}


let mail = (data) => {
    BuildPreviews(data)
}

let BuildPreviews = (data) => {
    var previews = document.getElementById('previews')

    if (data == 'data-controller') {

        // let data_out = data_export[0].previews_data_out // 	วัตถุประสงค์
        // let appeal_data = data_export[0].appeal_data // 	เรื่องร้องเรียน
        // let appeal_detail_summary = data_export[0].appeal_detail_summary // 	หมายเหตุ
        // let complaint = data_export[0].complaint // สิทธิ
        // let name_appeal = data_export[0].name_appeal // ผู้ร้องเรียน
        var part_1 = document.getElementById('export-part-1-data-controller').outerHTML
        let specific = data_export[0].specific // มาตราการ
        let complaint_approve_reject = data_export[0].complaint_approve_reject // 	อนุมัติตามคำร้องเรียน/ปฏิเสธเรื่องร้องเรียน
        let myList = data_export[0].data_classity
        let data_person = data_export[0].data_person //ข้อมูลส่วนบุคคล
        let objective = data_export[0].objective // 	วัตถุประสงค์
        let Complainant = data_export[0].Complainant; // ผู้ร้องเรียน ใหม่ 
        let ComplaintRights = data_export[0].ComplaintRights; // สิทธิการร้องเรียน ใหม่ 

        // จำนวน checkbox ที่เลือก 
        let count = [];
        var inputElements = document.querySelectorAll('.input_checkBox');
        inputElements.forEach(element => {
            if (element.checked === true) {
                count.push(parseInt(element.getAttribute("id")))
            }
        });
        var content = ""
        let countNO = 1; // ลำดับข้อมูล
        for (let index = 0; index < count.length; index++) {
            let i = count[index];
            if (i < myList.length) {
                let data_person_new = []
                let objective_new = []
                let complaint_approve_reject_new = []
                for (let j = 0; j < data_person.length; j++) {
                    if (j == data_person.length - 1) {
                        if (data_person[j] == '-') {
                            data_person_new.push("-")
                        } else {
                            data_person_new.push(`${data_person[j].toString()}`)
                        }
                    } else {
                        if (data_person[j] == '-') {
                            data_person_new.push("-")
                        } else {
                            data_person_new.push(`${data_person[j].toString()}`)
                        }
                    }
                }
                // วัตถุประสงค์
                objective.forEach(element => {
                    element ? objective_new.push(element.toString()) : objective_new.push("-")
                });

                for (let i = 0; i < complaint_approve_reject.length; i++) {
                    let reject = complaint_approve_reject[i]
                    let rejects = `${reject[0].split("<br>")[1]}`
                    rejects = rejects.replace(/<a[^>]*>.*?<\/a>/g, '').trim()
                    rejects = rejects === "undefined" ? "-" : rejects
                    complaint_approve_reject_new.push(rejects)
                }
                let Rights = ""
                if (Complainant[i] !== "-" && ComplaintRights[i] !== "-") {
                    Rights = `ผู้ร้องเรียน :  ${Complainant[i]}<br>
                            ${ComplaintRights[i]}`
                } else {
                    Rights = '-'
                }
                let specificShow = ""
                specific[i].forEach((element, index) => {
                    specificShow += `${index + 1}.${element.classification_measures_section_name}<br>`
                });
                let date = new Date(myList[i].date_use).toLocaleDateString('en-GB') + " - " + new Date(new Date(myList[i].date_use).getTime() + myList[i].pattern_total_date * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB') + ` <br> ( ${myList[i].pattern_total_date} ) วัน`;

                var row = `
                <tr>
                    <td>
                        ${countNO}
                    </td>
                      <td>
                        ${myList[i].classify_name} 
                       
                    </td>
                    <td>
                        ${objective_new[i]} 
                    </td>
                    <td>                               
                        ${data_person_new[i]} 
                    </td>
                    
                    <td>
                        ${myList[i].pattern_processing_base_name} 
                       
                    </td>
                    <td>    
                        ${date}                       
                    </td>
                    <td>
                        ${specificShow} 

                    </td>
                    <td>
                        ${Rights} 
                    </td>
                    <td>
                         ${complaint_approve_reject_new[i]}
                    </td>
                    <td>
                    </td>
                </tr>`
                content += row
                countNO += 1
            }
        }

        var header_content = `<table class="tablesaw table  no-wrap table-bordered table-hover" style="margin-top: 15px;">
        <thead>
        <tr class="color_td">
            <th colspan="11">
                ส่วนที่ 2 : บันทึกรายการ
            </th>
        </tr>
        <tr class="color_td">
            <th rowspan="2">
                ลำดับ
            </th>
            <th colspan="5">
                รายละเอียดทั่วไปของการประมวลผลข้อมูลส่วนบุคคล (เก็บรวบรวม ใช้ เปิดเผย)
            </th>
            <th>
                มาตรการรักษาตวามมั่นคงปลอดภัยตามมาตรา 37 (1)
            </th>
            <th colspan="2">
                การใช้สิทธิ
            </th>
            <th>
                หมายเหตุ
            </th>
        </tr>
        <tr class="color_td">
            <td>
                ชื่อกิจกรรม
            </td>
            <td>
                วัตถุประสงค์
            </td>
            <td>
                ข้อมูลส่วนบุคคลที่มีการเก็บรวบรวม
            </td>
            <td>
                การใช้ / เปิดเผย
            </td>
            <td>
                ระยะเวลา
            </td>
            <td>
                มาตรการรักษาความปลอดภัย
            </td>
            <td>
                สิทธิของเจ้าขอข้อมูลส่วนบุคคล
            </td>
            <td>
                การบันทึกรายละเอียดการปฏิเสธคำขอหรือ<br>การคัดค้านการใช้สิทธิของเจ้าของ้อมูลส่วนบุคคล
            </td>
            <td>
    
            </td>
        </tr>
    </thead>
        <tbody>`
        var footer_content = `</tbody></table>`
        previews.innerHTML = `<div style=" overflow: auto;text-align: left;">${part_1}${header_content}${content}${footer_content}</div>`
        content_mail = `<div style=" overflow: auto;text-align: left;">${part_1}${header_content}${content}${footer_content}</div>`
    } else {

        let myList = data_export[0].classifi
        let data_person = data_export[0].data_person //ข้อมูลส่วนบุคคล
        let objective = data_export[0].objective // 	วัตถุประสงค์
        let data_out = data_export[0].previews_data_out // 	วัตถุประสงค์
        let appeal_data = data_export[0].appeal_data // 	เรื่องร้องเรียน
        var part_1 = document.getElementById('export-part-1').outerHTML
        var content = ""
        for (var i in myList) {
            var data_person_new = []
            var objective_new = []
            var data_out_new = []
            var appeal_data_new = []
            var data_protection = `
        จำกัดปริมาณข้อมูล : ${myList[i].classify_protect_data_limit_process}
        `
            for (let j = 0; j < data_person.length; j++) {
                if (j == data_person.length - 1) {
                    if (data_person[j] == '-') {
                        data_person_new.push("-")
                    } else {
                        data_person_new.push(`
                    ${data_person[j].toString()}             
                    `)
                    }
                } else {
                    if (data_person[j] == '-') {
                        data_person_new.push("-")
                    } else {
                        data_person_new.push(`
                    ${data_person[j].toString()}
                    
                    `)
                    }
                }
            }
            for (let i = 0; i < objective.length; i++) {
                if (i == data_person.length - 1) {
                    objective_new.push(`
                    ${objective[i].toString()}
                
                    `)
                } else {
                    objective_new.push(`
                    ${objective[i].toString()}
                
                    `)
                }
            }

            for (let i = 0; i < data_out.length; i++) {
                if (data_out[i] != '-') {

                    data_out_new.push(`${data_out[i].toString()}`)

                } else {
                    data_out_new.push(`-`)
                }
            }

            for (let i = 0; i < appeal_data.length; i++) {
                appeal_data_new.push(appeal_data[i].toString())
            }
            // <a href="/pattern/detail${myList[i].pattern_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
            // <a href="/dataoutdetails${myList[i].pattern_id}" class="text-info"><i class="fas fa-file-alt fa-2x"></i></a>
            // กำหนดการเข้าถึงข้อมูล
            if (myList[i].classify_approach_protect_used_two_factor_from_email == 1 || myList[i].classify_approach_protect_used_two_factor_from_google_authen == 1 || myList[i].classify_approach_protect_used_two_factor_from_sms == 1) {
                data_protection += ` กำหนดการเข้าถึงข้อมูล : 2FA  <br>`
            }
            if (myList[i].classify_protect_data_limit_follow_datetime == 1) {
                data_protection += ` กำหนดเวลาเข้าถึงข้อมูล : จันทร์ - ศุกร์ เวลา 08.00 น. - 17.00 น. `
            }

            var row = `
            <tr>
                  <td>
                      ${myList[i].no} 
                  </td>
                <td>
                  ชื่อ-สกุล/ชื่อองค์กร  ${myList[i].firstname} ${myList[i].lastname} <br>
                  ที่อยู่ ${myList[i].contact} <br>
                  อีเมล ${myList[i].email} <br>
                  เบอร์โทรศัพท์ ${myList[i].phone} <br>
                  เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (หากมี) ${dpo[0].firstname} ${dpo[0].lastname}  <br> email : ${dpo[0].email}  เบอร์ติดต่อ : ${dpo[0].phone}
                  </td>
                <td>
                    ${myList[i].classify_name} 
                </td>
                <td>                               
                    ${data_person_new[i]} 
                </td>
                <td>
                    ${objective_new[i]} 
                </td>
                <td>
                    ${data_out_new[i]} 
                </td>
                <td>    
                    ${data_protection} 
                </td>
                <td>
                    ${appeal_data_new[i]} 
                </td>
            </tr>`
            content += row

        }

        var header_content = `<table class="tablesaw table  no-wrap table-bordered table-hover" style="margin-top: 15px;">
    <thead>
    <tr>
        <th colspan="10" style="background-color: #c5eaf1ab;">
            ส่วนที่ 2 : บันทึกรายการของกิจกรรมการประมวลผลข้อมูลส่วนบุคคล
        </th>
    </tr>
    <tr class="color_td">
        <th rowspan="2" class="ttt">
            ลำดับ
        </th>
        <th>
            ข้อมูลเกี่ยวกับผู้ควบคุมข้อมูลส่วนบุคคล
        </th>
        <th colspan="3">
            รายละเอียดทั่วไปของการประมวลผลข้อมูลส่วนบุคคล [ข้อ 3(4)]
        </th>
        <th>
            การโอนข้อมูลไปยังจ่างประเทศ (หากมี) [ข้อ 3(5)]
        </th>
        <th colspan="3">
            มาตรการรักษาตวามมั่นคงปลอดภัยตามมาตรา 40 วรรณหนึ่ง (2) [ข้อ 3 (6)]
        </th>
    </tr>
    <tr class="color_td">
        <td>
            ผู้ควบคุมข้อมูลส่วนบุคคล (เเละตัวเเทน หากมี)
        </td>
        <td>
            ประเภทหรือลักษณะ (ชื่อกิจกรรม)
        </td>
        <td>
            ข้อมูลส่วนบุคคล
        </td>
        <td>
            วัตถุประสงค์
        </td>
        <td>
            ชื่อประเทศเเละองค์กร/บุคคลปลายทาง
        </td>
        <td>
            คำอธิบายมาตรการรักษาความปลอดภัย
        </td>
        <td>
            บันทึกการเเจ้งเหตุการณ์ละเมิดข้อมูล<br>
            ส่วนบุคคลกับผู้ควบคุมข้อมูล (หากมี)
        </td>
    </tr>
</thead>
    <tbody>`
        var footer_content = `</tbody></table>`
        previews.innerHTML = `<div style=" overflow: auto;text-align: left;">${part_1}${header_content}${content}${footer_content}</div>`
        content_mail = `<div style=" overflow: auto;text-align: left;">${part_1}${header_content}${content}${footer_content}</div>`
    }
}

document.getElementById('edit_data').addEventListener('click', () => {
    var types = document.getElementById('edit_data').getAttribute('type-label')
    var data_td = document.querySelectorAll(`.${types}-td`)
    var data_th = document.querySelectorAll(`.${types}-th`)
    var edit_html = `<input type="hidden" name="data_account" value="${data_th[0].getAttribute('label-data')}" class="form-control">`
    for (let i = 0; i < data_td.length; i++) {
        edit_html += `
                <div class="mb-2  d-flex">
                 <label for="fname" class="col-md-4 text-start control-label col-form-label"> ${data_th[i].innerText} :</label>
                    <div class="col-md-8">
                     <input type="text" name="data_account" value="${data_td[i].innerText}"  class="form-control" required>
                 </div>
                </div>`
    }
    let form_edit = document.getElementById('form_edit')
    var title = ''
    if (types == 'data-controller') {
        title = "เเก้ไขข้อมูลผู้ควบคุมข้อมูลส่วนบุคคล"
        form_edit.action = "/activity-ropa/update";
    } else if (types == 'data-Protection') {
        title = "เเก้ไขข้อมูลเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล"
        form_edit.action = "/activity-ropa/update";
    } else if (types == 'processor') {
        form_edit.action = "/activity-ropa/update";
        title = "เเก้ไขข้อมูลผู้ประมวลผลข้อมูลส่วนบุคคล"
    }
    document.getElementById('modal-edite').innerHTML = edit_html
    document.getElementById('title_edit').innerHTML = title
})


document.getElementById('edit_data_processor').addEventListener('click', () => {
    var types = document.getElementById('edit_data_processor').getAttribute('type-label')
    var data_td = document.querySelectorAll(`.${types}-td`)
    var data_th = document.querySelectorAll(`.${types}-th`)
    var edit_html = `<input type="hidden" name="data_account" value="${data_th[0].getAttribute('label-data')}" class="form-control">`
    for (let i = 0; i < data_td.length; i++) {
        edit_html += `
                <div class="mb-2  d-flex">
                 <label for="fname" class="col-md-4 text-start control-label col-form-label"> ${data_th[i].innerText} :</label>
                    <div class="col-md-8">
                     <input type="text" name="data_account" value="${data_td[i].innerText}"  class="form-control" required>
                 </div>
                </div>`
    }
    let form_edit = document.getElementById('form_edit')
    var title = ''
    if (types == 'data-controller') {
        title = "เเก้ไขข้อมูลผู้ควบคุมข้อมูลส่วนบุคคล"
        form_edit.action = "/activity-ropa/update";
    } else if (types == 'data-Protection') {
        title = "เเก้ไขข้อมูลเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล"
        form_edit.action = "/activity-ropa/update";
    } else if (types == 'processor') {
        form_edit.action = "/activity-ropa/update";
        title = "เเก้ไขข้อมูลผู้ประมวลผลข้อมูลส่วนบุคคล"
    }
    document.getElementById('modal-edite').innerHTML = edit_html
    document.getElementById('title_edit').innerHTML = title
})


async function create_function() {
    if (dpo.length > 0) {
        document.getElementById('data_protection_id').value = dpo[0].acc_id
        document.getElementById('data_protection_1').value = dpo[0].firstname + " " + dpo[0].lastname
        document.getElementById('data_protection_2').value = dpo[0].contact
        document.getElementById('data_protection_3').value = dpo[0].email
        document.getElementById('data_protection_4').value = dpo[0].phone
    }
}


let DataNull = (data) => {
    if (data === "control") {
        $('#past-2-data-controller').html(`
     <tr>
         <td colspan="20" class="text-center" style="border: none;">
              <b class="text-danger">ไม่พบข้อมูล</b>
          </td>
     </tr>`);
    } else {
        $('#past-2').html(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
                 <b class="text-danger">ไม่พบข้อมูล</b>
             </td>
        </tr>`);
    }
}

// ปุ่ม เลือกทั้งครบ เ๙็คว่าได้เลือกหรือไม่
function checkboxAll(data) {
    var inputElements = document.getElementsByClassName('input_checkBox');
    for (var i = 0; inputElements[i]; ++i) {
        data.checked === true ? inputElements[i].checked = true : inputElements[i].checked = false
    }
}


//  เช็ค ปุ่ม checkbox ว่าได้เลือกครบทุกปุ่มหรือไม่
let checkBox = (data) => {
    var inputElements = document.querySelectorAll('.input_checkBox');
    let counts = 0
    inputElements.forEach(element => {
        element.checked === false ? document.getElementById("checkboxAll").checked = false : counts = counts + 1;
    });
    if (counts === inputElements.length) {
        document.getElementById("checkboxAll").checked = true
    }
}