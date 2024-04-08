var policy = []; // เก็บ เอกสาร policy ที่ดึงมาจาก api
var new_process = []; // เก็บ กิจกรรมประมวลผล ที่ดึงมาจาก api
var data_new = []; // เก็บข้อมูลที่เเก้ไขเเล้ว
var supervisor = [] // ผู้ดูแลข้อมูลหรือผู้ดูแลระบบหรือผู้ควบคุมมาตราการ
var doc_id_select = []; //  เก็บข้อมูล เอกสาร policy 
var data_set_found = []; // เก็บเลขของข้อมูลมาตราการ

//  เรื่ม fetch ข้อมูลก่อน
async function fetchData() {
    try {
        let result = await $.ajax({
            type: "GET",
            url: "/api/measures/doc/list",
        });
        policy.push([...result.doc]);
        new_process.push([...result.process]);

        result = await $.ajax({
            type: "GET",
            url: "/api/account/list",
        });
        supervisor.push(result);

        let id = document.getElementById('form_edit_pattern').getAttribute('patternPath');
        result = await $.ajax({
            type: "GET",
            url: `/api/patternSpecific${id}`,
        });
        let myResults = result.patternSpecific;
        myResults.forEach(myResults => {
            data_new.push({
                id_specific: myResults.specific_id,
                pattern_specific_id: myResults.pattern_specific_id,
                doc_id: myResults.pattern_specific_doc_id,

                specific_access_control: myResults.pattern_specific_access_control,
                specific_user_access_management: myResults.pattern_specific_user_access_management,
                specific_user_responsibilitites: myResults.pattern_specific_user_responsibilitites,
                specific_audit_trails: myResults.pattern_specific_audit_trails,
                specific_privacy_security_awareness: myResults.pattern_specific_privacy_security_awareness,
                specific_where_incident_occurs: myResults.pattern_specific_where_incident_occurs,

                section_name: myResults.pattern_measures_section_name,
                measures_date_count: myResults.pattern_measures_date_count,
                measures_date: myResults.date,
                measures_supervisor: myResults.pattern_measures_supervisor,
                measures_detail: myResults.pattern_measures_detail,
                event_process_name: myResults.event_process_name,
                id_event_proccess: myResults.event_process_id,
                specific_access_control_explain: myResults.pattern_specific_access_control_explain,
                specific_user_access_management_explain: myResults.pattern_specific_user_access_management_explain,
                specific_user_responsibilitites_explain: myResults.pattern_specific_user_responsibilitites_explain,
                specific_audit_trails_explain: myResults.pattern_specific_audit_trails_explain,
                specific_privacy_security_awareness_explain: myResults.pattern_specific_privacy_security_awareness_explain,
                specific_where_incident_occurs_explain: myResults.pattern_specific_where_incident_occurs_explain,
            });
        });
        myResults === "ไม่มีข้อมูล" ? await create_table_measures("ไม่มีข้อมูล") : await create_table_measures(myResults);

    } catch (e) {
        console.log(e);
    }
} fetchData();





async function add_preview_policy_measures(id) {
    console.log("doc_id_select", doc_id_select);
    // doc_id_select = [...new Set(doc_id_select)];
    // if (doc_id_select.length > 0) {
    //     $.ajax({
    //         type: "post",
    //         contentType: "application/json",
    //         url: "/api/pattern/measures/check",
    //         data: JSON.stringify(doc_id_select),
    //         dataType: "json",
    //         success: async function (result) {
    //             if (result != "ไม่มีข้อมูล") {
    //                 create_table_measures(result.data_set);
    //             }
    //         },
    //         error: function (e) {
    //             console.log(e);
    //         },
    //     });
    // } else {
    //     $("#tbody-measures").empty().append(`
    //                     <tr>
    //                     <td colspan="20" class="text-center" style="border: none;">
    //                     <b class="text-danger">ไม่พบข้อมูล</b>
    //                      </td>
    //                     </tr>
    //                 `);
    // }
}


//  ปุ่ม เลือกมาตราการรักษาความปลอดภัยขั้นต่ำที่PDPA (ปุ่มสีเขียว)
document.getElementById("choose_measures_specific").addEventListener("click", function () {
    $.ajax({
        type: "GET",
        url: "/api/security/section/pattern/specific",
        success: async function (result) {
            if (result == "ไม่มีข้อมูล") {
                $("#table-select-measures").empty().append(`
                <tr><td colspan="20" class="text-center" style="border: none;"><b class="text-danger">ไม่พบข้อมูล</b></td></tr>`
                );
            } else {
                await create_choose_measures_specific(result);
            }
        },
        error: function (e) {
            console.log(e);
        },
    });
    // }
});

// func สรา้ง modal มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPA กำหนด (PDPA Specific Measures)
async function create_choose_measures_specific(data) {
    $("#table-select-measures").empty();
    data = data.map((item, index) => { return { ...item, no: index + 1 }; })
    var state = {
        querySet: data,
        page: 1,
        rows: 30, // จำนวน row
        window: 10000, // จำนวนหน้าที่เเสดง
    };

    buildTable();
    function pagination(querySet, page, rows) {
        var trimStart = (page - 1) * rows;
        var trimEnd = trimStart + rows;
        var trimmedData = querySet.slice(trimStart, trimEnd);
        var pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
        return {
            querySet: trimmedData,
            pages: pages,
        };
    }

    function pageButtons(pages) {
        // var wrapper = document.getElementById('pagination-wrapper')
        var wrapper = document.querySelector(".pagination-choose");
        wrapper.innerHTML = ``;
        var maxLeft = state.page - Math.floor(state.window / 2);
        var maxRight = state.page + Math.floor(state.window / 2);

        if (maxLeft < 1) {
            maxLeft = 1;
            maxRight = state.window;
        }
        if (maxRight > pages) {
            maxLeft = pages - (state.window - 1);
            if (maxLeft < 1) {
                maxLeft = 1;
            }
            maxRight = pages;
        }

        // เช็คหน้าเเรก (ปุ่มย้อนกลับ)
        // var num = 1
        if (maxRight > 5) {
            if (state.page > maxRight / 2) {
                if (state.page + 1 > maxRight / 2) {
                    wrapper.innerHTML +=
                        '<li class="page-item"><button class="page page-link" value=1>1</button></li>';
                    wrapper.innerHTML +=
                        '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
                }
            }
            for (var page = maxLeft; page <= maxRight; page++) {
                if (page >= state.page - 2 && page <= state.page + 2) {
                    if (page == state.page) {
                        wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`;
                    } else {
                        wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`;
                    }
                }
            }
            if (state.page <= maxRight / 2) {
                mp = maxRight - 1;
                wrapper.innerHTML +=
                    '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
                wrapper.innerHTML +=
                    '<li class="page-item "><button class="page page-link" value=' +
                    maxRight +
                    ">" +
                    maxRight +
                    "</button></li>";
            }
        } else {
            for (var page = maxLeft; page <= maxRight; page++) {
                if (state.page == page) {
                    wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`;
                } else {
                    wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`;
                }
            }
        }

        if (state.page == 1) {
            wrapper.innerHTML =
                `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` +
                wrapper.innerHTML;
        } else {
            wrapper.innerHTML =
                `<li value=${state.page - 1
                } class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` +
                wrapper.innerHTML;
        }

        // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
        if (state.page == pages) {
            wrapper.innerHTML += `<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>`;
        } else {
            wrapper.innerHTML += `<li value=${state.page + 1
                } class="page page-item"><button class="page-link">ถัดไป</button></li>`;
        }

        $(".page").on("click", function () {
            $("#table-select-measures").empty();
            state.page = Number($(this).val());
            buildTable();
        });
    }

    function buildTable() {
        var table = $("#table-select-measures");
        var data = pagination(state.querySet, state.page, state.rows);
        var myList = data.querySet;
        var show = [];
        for (var i in myList) {
            let policys = policy[0];
            if (data_new.length > 0) {
                // หาข้อมูลที่เเก้ไขเเล้วเพื่อมาสร้าง ตารางตัวเลือกให้ข้อมูลเหมือนที่เเก้ไข
                let map1 = data_new.findIndex((x) => x.specific_id == myList[i].id_specific);
                if (map1 > -1) {
                    myList[i].measures_section_name = data_new[map1].section_name;
                    myList[i].event_process_name = data_new[map1].event_process_name;
                }
            }
            let array_doc_id = myList[i].doc_id.split(",");
            let doc_name = "";
            for (let i = 0; i < policys.length; i++) {
                if (array_doc_id.indexOf(String(policys[i].doc_id)) > -1) {
                    doc_name += policys[i].doc_name + "<br>";
                }
            }
            let input_checkbox = `<input class="form-check-input success check-outline outline-success checkbox_Choose_Specific"  id="${myList[i].id_specific}" type="checkbox" onclick="Choose_Specific(this)" >`;
            if (data_set_found.indexOf(myList[i].id_specific) > -1) {
                input_checkbox = `<input class="form-check-input success check-outline outline-success checkbox_Choose_Specific"  id="${myList[i].id_specific}" type="checkbox" onclick="Choose_Specific(this)" checked>`;
            }

            var row = `<tr>
                        <td>
                        ${input_checkbox}
                        </td>
                        <td>${myList[i].no}</td>
                        <td>${myList[i].event_process_name}</td>           
                        <td>${myList[i].measures_section_name}</td>
                        <td>${doc_name}</td>
                        <td><a class="text-info" target="_blank"  href="/Specific-Measures/details/${myList[i].id_specific}"><i class=" fas fa-file-alt fa-2x"></i></a></td>
                        </tr> `;
            table.append(row);
            show.push(myList[i].no);
        }
        document.querySelector("#show-Specific-Measures-choose").innerHTML = show[0]; //  แสดงถึง row เเรกของหน้า
        document.querySelector("#to-show-Specific-Measures-choose").innerHTML = show[show.length - 1]; //  แสดงถึง row สุดท้ายของหน้า
        document.querySelector("#show-all-Specific-Measures-choose").innerHTML = state.querySet.length; //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
        pageButtons(data.pages);
    }
}


//  func สร้างตารางเเสดงมาตราการที่เลือกเเล้ว มาตราการรักษาความปลอดภัยขั้นต่ำที่PDPA กำหนด (PDPA Specific Measures)
async function create_table_measures(data) {
    data_set_found = [];
    if (data == "ไม่มีข้อมูล") {
        $("#tbody-measures").empty().append(`<tr>
            <td colspan="20" class="text-center" style="border: none;">
            <b class="text-danger">ไม่พบข้อมูล</b>
             </td>
            </tr>
        `);
    } else {
        $("#tbody-measures").empty();
        data = data.map((item, index) => { data_set_found.push(Number(item.specific_id)); return { ...item, no: index + 1 }; });
        var state = {
            querySet: data,
            page: 1,
            rows: 30, // จำนวน row
            window: 10000, // จำนวนหน้าที่เเสดง
        };
        buildTable();
        function pagination(querySet, page, rows) {
            var trimStart = (page - 1) * rows;
            var trimEnd = trimStart + rows;
            var trimmedData = querySet.slice(trimStart, trimEnd);
            var pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
            return {
                querySet: trimmedData,
                pages: pages,
            };
        }

        function pageButtons(pages) {
            // var wrapper = document.getElementById('pagination-wrapper')
            var wrapper = document.querySelector(".pagination");
            wrapper.innerHTML = ``;
            var maxLeft = state.page - Math.floor(state.window / 2);
            var maxRight = state.page + Math.floor(state.window / 2);

            if (maxLeft < 1) {
                maxLeft = 1;
                maxRight = state.window;
            }
            if (maxRight > pages) {
                maxLeft = pages - (state.window - 1);
                if (maxLeft < 1) {
                    maxLeft = 1;
                }
                maxRight = pages;
            }

            // เช็คหน้าเเรก (ปุ่มย้อนกลับ)
            // var num = 1
            if (maxRight > 5) {
                if (state.page > maxRight / 2) {
                    if (state.page + 1 > maxRight / 2) {
                        wrapper.innerHTML +=
                            '<li class="page-item"><button class="page page-link" value=1>1</button></li>';
                        wrapper.innerHTML +=
                            '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
                    }
                }
                for (var page = maxLeft; page <= maxRight; page++) {
                    if (page >= state.page - 2 && page <= state.page + 2) {
                        if (page == state.page) {
                            wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`;
                        } else {
                            wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`;
                        }
                    }
                }
                if (state.page <= maxRight / 2) {
                    mp = maxRight - 1;
                    wrapper.innerHTML +=
                        '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
                    wrapper.innerHTML +=
                        '<li class="page-item "><button class="page page-link" value=' +
                        maxRight +
                        ">" +
                        maxRight +
                        "</button></li>";
                }
            } else {
                for (var page = maxLeft; page <= maxRight; page++) {
                    if (state.page == page) {
                        wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`;
                    } else {
                        wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`;
                    }
                }
            }

            if (state.page == 1) {
                wrapper.innerHTML =
                    `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` +
                    wrapper.innerHTML;
            } else {
                wrapper.innerHTML =
                    `<li value=${state.page - 1
                    } class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>` +
                    wrapper.innerHTML;
            }

            // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
            if (state.page == pages) {
                wrapper.innerHTML += `<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>`;
            } else {
                wrapper.innerHTML += `<li value=${state.page + 1
                    } class="page page-item"><button class="page-link">ถัดไป</button></li>`;
            }

            $(".page").on("click", function () {
                $("#table_sortable").remove();
                state.page = Number($(this).val());
                buildTable();
            });
        }
        function buildTable() {
            var table = $("#tbody-measures");
            var data = pagination(state.querySet, state.page, state.rows);
            var myList = data.querySet;
            for (var i in myList) {
                let number_specific = [];
                let number_specific_explain = [];
                //  กรณีมีการเลือกมาตราการเพื่ม เพื่อดึงข้อมูลที่เเก้ไขเเล้วจาก data_new มา insert ใน table 
                if (data_new.length > 0) {
                    for (let j = 0; j < data_new.length; j++) {
                        if (data_new[j].id_specific == myList[i].specific_id) {

                            myList[i].pattern_specific_access_control = data_new[j].specific_access_control;
                            myList[i].pattern_specific_audit_trails = data_new[j].specific_audit_trails;
                            myList[i].pattern_specific_privacy_security_awareness = data_new[j].specific_privacy_security_awareness;
                            myList[i].pattern_specific_user_access_management = data_new[j].specific_user_access_management;
                            myList[i].pattern_specific_user_responsibilitites = data_new[j].specific_user_responsibilitites;
                            myList[i].pattern_specific_where_incident_occurs = data_new[j].specific_where_incident_occurs;

                            myList[i].id_specific = data_new[j].id_specific;
                            myList[i].event_process_id = Number(data_new[j].id_event_proccess);
                            myList[i].pattern_measures_supervisor = data_new[j].measures_supervisor;
                            myList[i].pattern_measures_date_count = Number(data_new[j].measures_date_count);
                            myList[i].date = data_new[j].measures_date;
                            myList[i].event_process_name = data_new[j].event_process_name;
                            myList[i].pattern_specific_access_control_explain = data_new[j].specific_access_control_explain;
                            myList[i].pattern_specific_audit_trails_explain = data_new[j].specific_audit_trails_explain;
                            myList[i].pattern_specific_privacy_security_awareness_explain = data_new[j].specific_privacy_security_awareness_explain;
                            myList[i].pattern_specific_user_access_management_explain = data_new[j].specific_user_access_management_explain;
                            myList[i].pattern_specific_user_responsibilitites_explain = data_new[j].specific_user_responsibilitites_explain;
                            myList[i].pattern_specific_where_incident_occurs_explain = data_new[j].specific_where_incident_occurs_explain;
                        }
                    }
                }

                number_specific_explain.push(
                    myList[i].pattern_specific_access_control_explain,
                    myList[i].pattern_specific_user_access_management_explain,
                    myList[i].pattern_specific_user_responsibilitites_explain,
                    myList[i].pattern_specific_audit_trails_explain,
                    myList[i].pattern_specific_privacy_security_awareness_explain,
                    myList[i].pattern_specific_where_incident_occurs_explain
                );
                number_specific.push(
                    myList[i].pattern_specific_access_control,
                    myList[i].pattern_specific_user_access_management,
                    myList[i].pattern_specific_user_responsibilitites,
                    myList[i].pattern_specific_audit_trails,
                    myList[i].pattern_specific_privacy_security_awareness,
                    myList[i].pattern_specific_where_incident_occurs
                );


                let policys = policy[0];
                let array_doc_id = myList[i].pattern_specific_doc_id.split(",");
                let doc_name = "";
                for (let j = 0; j < policys.length; j++) {
                    if (array_doc_id.indexOf(String(policys[j].doc_id)) > -1) {
                        doc_name += policys[j].doc_name + ", <br>";
                    }
                }
                var row = `<tr id ="${myList[i].specific_id}">
                        <td>
                        <a class="text-warning" doc_id="${myList[i].pattern_specific_doc_id}"  
                        event_process_id = "${myList[i].event_process_id}"
                        measures_detail="${myList[i].pattern_measures_detail}" 
                        pattern_specific_id="${myList[i].pattern_specific_id}"
                        measures_supervisor="${myList[i].pattern_measures_supervisor}" 
                        date="${myList[i].date}" date_count="${myList[i].pattern_measures_date_count}" 
                        data-bs-toggle="modal" data-bs-target="#edit-measures-chooses"
                        onclick="edit_measures_chooses(this,${myList[i].specific_id})">
                        <i class="fas fa-pencil-alt fa-2x"></i>
                        </a>
                        </td>
                        <td class="${number_specific}">${myList[i].no}</td>
                        <td class="${number_specific_explain}">${myList[i].event_process_name}</td>           
                        <td>${myList[i].pattern_measures_section_name}</td>
                        <td>${myList[i].pattern_specific_access_control === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'}</td> 
                        <td>${myList[i].pattern_specific_user_access_management === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'}</td>
                        <td>${myList[i].pattern_specific_user_responsibilitites === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'}</td>
                        <td>${myList[i].pattern_specific_audit_trails === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'}</td>
                        <td>${myList[i].pattern_specific_privacy_security_awareness === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'}</td>
                        <td>${myList[i].pattern_specific_where_incident_occurs === 1 ? `<i class="fas fa-check" style="color: green;"></i>` : '<i class="ti-close text-danger"></i>'}</td>
                        <td>${doc_name}</td>
                        <td><a class="text-info" target="_blank"  href="/Specific-Measures/details/${myList[i].specific_id}"><i class=" fas fa-file-alt fa-2x"></i></a></td>
                        </tr>
                        `;
                table.append(row);
            }
            pageButtons(data.pages);
        }
    }

}


// func checkbox มาตราการ เลือก-ไม่เลือก มาตราการ  
async function Choose_Specific(data) {
    let checkbox = $(".checkbox_Choose_Specific");
    let id_specific = [];
    for (let i = 0; i < checkbox.length; i++) {
        if (checkbox[i].checked == true) {
            id_specific.push(checkbox[i].getAttribute("id"));
        }
    }
    let array_data_new = [];
    if (data_new.length > 0) {
        for (let i = 0; i < data_new.length; i++) {
            if (id_specific.indexOf(String(data_new[i].id_specific)) > -1) {
                array_data_new.push(data_new[i]);
            }
        }
    }
    data_new = [];
    data_new.push(...array_data_new);
    let dataQuery = {
        id_specific: id_specific,
        pattern_specific_id: document.getElementById('form_edit_pattern').getAttribute('patternPath')
    }
    $.ajax({
        type: "post",
        contentType: "application/json",
        url: "/api/pattern/get/measures/pecific",
        data: JSON.stringify(dataQuery),
        dataType: "json",
        success: async function (result) {
            if (result == "ไม่มีข้อมูล") {
                await create_table_measures("ไม่มีข้อมูล");
            } else {
                let myResults = result.data_set.map(element => ({
                    event_process_id: element.event_process_id,
                    event_process_name: element.event_process_name,
                    pattern_specific_doc_id: element.doc_id,
                    pattern_measures_date_count: element.measures_date_count,
                    pattern_measures_section_name: element.measures_section_name,
                    pattern_measures_supervisor: element.measures_supervisor,
                    date: element.date,
                    specific_id: element.id_specific,
                    pattern_measures_detail: element.measures_detail,
                    pattern_specific_access_control: element.specific_access_control,
                    pattern_specific_audit_trails: element.specific_audit_trails,
                    pattern_specific_privacy_security_awareness: element.specific_privacy_security_awareness,
                    pattern_specific_user_access_management: element.specific_user_access_management,
                    pattern_specific_user_responsibilitites: element.specific_user_responsibilitites,
                    pattern_specific_where_incident_occurs: element.specific_where_incident_occurs,

                    pattern_specific_access_control_explain: element.specific_access_control_explain,
                    pattern_specific_audit_trails_explain: element.specific_audit_trails_explain,
                    pattern_specific_privacy_security_awareness_explain: element.specific_privacy_security_awareness_explain,
                    pattern_specific_user_access_management_explain: element.specific_user_access_management_explain,
                    pattern_specific_user_responsibilitites_explain: element.specific_user_responsibilitites_explain,
                    pattern_specific_where_incident_occurs_explain: element.specific_where_incident_occurs_explain,
                }));
                console.log("myResults", myResults);
                await create_table_measures(myResults);
            }
        },
        error: function (e) {
            console.log(e);
        },
    });
}

// func เเก้ไขมาตราการ
function edit_measures_chooses(data, id) {
    $('input[name="measures_date"]').val(data.getAttribute("date"));
    $('textarea[name="measures_detail"]').val(data.getAttribute("measures_detail"));
    $('input[name="measures_date_count"]').val(data.getAttribute("date_count"));
    let measures_supervisor = data.getAttribute("measures_supervisor").split(',')
    let arrSupervisor = supervisor[0].account
    let option = ''
    // multiple select option 
    arrSupervisor.forEach(arrSupervisor => {
        if (measures_supervisor.indexOf(String(arrSupervisor.acc_id)) > -1) {
            option += `<option selected value='${arrSupervisor.acc_id}'>${arrSupervisor.firstname} ${arrSupervisor.lastname} </option>`
        } else {
            option += `<option value='${arrSupervisor.acc_id}'>${arrSupervisor.firstname} ${arrSupervisor.lastname} </option>`
        }
    });
    $('select[name="measures_supervisor"]').html(option);
    $('select[name="measures_supervisor"]').html(option);
    $('input[name="measures_section_name"]').val($(data).closest("tr").find("td").eq(3).text().trim());

    let number_specific = $(data).closest("tr").find("td").eq(1).attr("class").split(",");
    let number_specific_explain = $(data).closest("tr").find("td").eq(2).attr("class").split(",");

    var specific_access_control = document.querySelectorAll('input[name$="specific_access_control"]');
    var specific_user_access_management = document.querySelectorAll('input[name$="specific_user_access_management"]');
    var specific_user_responsibilitites = document.querySelectorAll('input[name$="specific_user_responsibilitites"]');
    var specific_audit_trails = document.querySelectorAll('input[name$="specific_audit_trails"]');
    var specific_privacy_security_awareness = document.querySelectorAll('input[name$="specific_privacy_security_awareness"]');
    var specific_where_incident_occurs = document.querySelectorAll('input[name$="specific_where_incident_occurs"]');

    $('textarea[name="specific_access_control_explain"]').val(number_specific_explain[0]);
    $('textarea[name="specific_user_access_management_explain"]').val(number_specific_explain[1]);
    $('textarea[name="specific_user_responsibilitites_explain"]').val(number_specific_explain[2]);
    $('textarea[name="specific_audit_trails_explain"]').val(number_specific_explain[3]);
    $('textarea[name="specific_privacy_security_awareness_explain"]').val(number_specific_explain[4]);
    $('textarea[name="specific_where_incident_occurs_explain"]').val(number_specific_explain[5]);

    // if else เเบบ one line  
    number_specific[0] === "2" || number_specific[0] === "0" ? specific_access_control[1].checked = true : specific_access_control[0].checked = true;
    number_specific[1] === "2" || number_specific[1] === "0" ? specific_user_access_management[1].checked = true : specific_user_access_management[0].checked = true;
    number_specific[2] === "2" || number_specific[2] === "0" ? specific_user_responsibilitites[1].checked = true : specific_user_responsibilitites[0].checked = true;
    number_specific[3] === "2" || number_specific[3] === "0" ? specific_audit_trails[1].checked = true : specific_audit_trails[0].checked = true;
    number_specific[4] === "2" || number_specific[4] === "0" ? specific_privacy_security_awareness[1].checked = true : specific_privacy_security_awareness[0].checked = true;
    number_specific[5] === "2" || number_specific[5] === "0" ? specific_where_incident_occurs[1].checked = true : specific_where_incident_occurs[0].checked = true;


    let process = new_process[0];
    let event_process_id = data.getAttribute("event_process_id");
    let event_process = "";
    for (let i = 0; i < process.length; i++) {
        if (event_process_id == process[i].event_process_id) {
            event_process += `<option selected value="${process[i].event_process_id}">${process[i].event_process_name}</option>`;
        } else {
            event_process += `<option value="${process[i].event_process_id}">${process[i].event_process_name}</option>`;
        }
    }
    document.getElementById("process").innerHTML = event_process;

    let policys = policy[0];
    let doc_select = "";
    let doc_id = data.getAttribute("doc_id").split(",");
    for (let i = 0; i < policys.length; i++) {
        for (let j = 0; j < doc_id.length; j++) {
            if (policys[i].doc_id == doc_id[j]) {
                doc_select += `<option selected value="${policys[i].doc_id}">${policys[i].doc_name}</option>`;
            }
        }
        doc_select += `<option value="${policys[i].doc_id}">${policys[i].doc_name}</option>`;
    }
    document.getElementById("selecte_type_policy").innerHTML = doc_select;
    document.getElementById("submit").setAttribute("onclick", `submit_edite(this,${id},${data.getAttribute("pattern_specific_id")})`);


}


// func บันทึกการ เเก้ไขมาตราการ
function submit_edite(data, id, pattern_specific_id) {

    if (data_new.length > 0) {
        for (let i = 0; i < data_new.length; i++) {  // ลบตำเเหน่งข้อมูลเก่าออก
            if (String(data_new[i].id_specific) == String(id)) {
                data_new.splice(data_new.indexOf(data_new[i]), 1);
            }
        }
    }
    let event_process = document.getElementById("process");
    var id_event_proccess = event_process.value;
    var event_process_name = event_process.options[event_process.selectedIndex].text;
    let section_name = document.querySelectorAll('input[name$="measures_section_name"]')[0].value;
    let measures_date_count = document.querySelectorAll('input[name$="measures_date_count"]')[0].value;
    let measures_date = document.querySelectorAll('input[name$="measures_date"]')[0].value;

    //  หาค่า value จาก mutiple select  
    let measures_supervisor = []
    let select = document.querySelectorAll('select[name$="measures_supervisor"]')[0].options;
    for (let i = 0; i < select.length; i++) {
        select[i].selected == true && measures_supervisor.push(select[i].value)
    }
    let measures_detail = document.querySelectorAll('textarea[name$="measures_detail"]')[0].value;
    let doc_id = document.getElementById("selecte_type_policy");
    let new_doc_id = [];
    for (let i = 0; i < doc_id.length; i++) {
        if (doc_id[i].selected == true) {
            new_doc_id.push(doc_id[i].value);
        }
    }


    let td = document.getElementById(`${id}`).getElementsByTagName("td");
    td[2].innerHTML = event_process_name;
    td[3].innerHTML = section_name;

    let tag_a = td[0].getElementsByTagName("a");
    tag_a[0].setAttribute("doc_id", new_doc_id);
    tag_a[0].setAttribute("event_process_id", id_event_proccess);
    tag_a[0].setAttribute("measures_detail", measures_detail);
    tag_a[0].setAttribute("measures_supervisor", measures_supervisor.toString());
    tag_a[0].setAttribute("date", measures_date);
    tag_a[0].setAttribute("date_count", measures_date_count);

    let specific_access_control = '';
    $("input:radio[name=specific_access_control]:checked").each(function () {
        specific_access_control = $(this).val();
        if ($(this).val() == 1) {
            td[4].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
        } else {
            td[4].innerHTML = `<i class="ti-close text-danger"></i>`;
        }
    });
    let specific_user_access_management = '';
    $("input:radio[name=specific_user_access_management]:checked").each(
        function () {
            specific_user_access_management = $(this).val();
            if ($(this).val() == 1) {
                td[5].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
            } else {
                td[5].innerHTML = `<i class="ti-close text-danger"></i>`;
            }
        });
    let specific_user_responsibilitites = '';
    $("input:radio[name=specific_user_responsibilitites]:checked").each(
        function () {
            specific_user_responsibilitites = $(this).val();
            if ($(this).val() == 1) {
                td[6].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
            } else {
                td[6].innerHTML = `<i class="ti-close text-danger"></i>`;
            }
        });
    let specific_audit_trails = '';
    $("input:radio[name=specific_audit_trails]:checked").each(function () {
        specific_audit_trails = $(this).val();
        if ($(this).val() == 1) {
            td[7].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
        } else {
            td[7].innerHTML = `<i class="ti-close text-danger"></i>`;
        }
    });
    let specific_privacy_security_awareness = '';
    $("input:radio[name=specific_privacy_security_awareness]:checked").each(
        function () {
            specific_privacy_security_awareness = $(this).val();
            if ($(this).val() == 1) {
                td[8].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
            } else {
                td[8].innerHTML = `<i class="ti-close text-danger"></i>`;
            }
        });
    let specific_where_incident_occurs = '';
    $("input:radio[name=specific_where_incident_occurs]:checked").each(function () {
        specific_where_incident_occurs = $(this).val();
        if ($(this).val() == 1) {
            td[9].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
        } else {
            td[9].innerHTML = `<i class="ti-close text-danger"></i>`;
        }
    });
    //  add class in td
    let value_checkbox = [
        specific_access_control,
        specific_user_access_management,
        specific_user_responsibilitites,
        specific_audit_trails,
        specific_privacy_security_awareness,
        specific_where_incident_occurs
    ]
    td[1].setAttribute('class', value_checkbox)

    let explain_all = [];
    explain_all.push(document.querySelectorAll('textarea[name$="specific_access_control_explain"]')[0].value);
    explain_all.push(document.querySelectorAll('textarea[name$="specific_user_access_management_explain"]')[0].value);
    explain_all.push(document.querySelectorAll('textarea[name$="specific_user_responsibilitites_explain"]')[0].value);
    explain_all.push(document.querySelectorAll('textarea[name$="specific_audit_trails_explain"]')[0].value);
    explain_all.push(document.querySelectorAll('textarea[name$="specific_privacy_security_awareness_explain"]')[0].value);
    explain_all.push(document.querySelectorAll('textarea[name$="specific_where_incident_occurs_explain"]')[0].value);
    td[2].setAttribute("class", explain_all);

    data_new.push({
        id_specific: id,
        pattern_specific_id: pattern_specific_id,
        doc_id: new_doc_id,
        // value_checkbox: value_checkbox,
        specific_access_control,
        specific_user_access_management,
        specific_user_responsibilitites,
        specific_audit_trails,
        specific_privacy_security_awareness,
        specific_where_incident_occurs,
        section_name: section_name,
        measures_date_count: measures_date_count,
        measures_date: measures_date,
        measures_supervisor: measures_supervisor,
        measures_detail: measures_detail,
        event_process_name: event_process_name,
        id_event_proccess: id_event_proccess,
        specific_access_control_explain: document.querySelectorAll('textarea[name$="specific_access_control_explain"]')[0].value,
        specific_user_access_management_explain: document.querySelectorAll('textarea[name$="specific_user_access_management_explain"]')[0].value,
        specific_user_responsibilitites_explain: document.querySelectorAll('textarea[name$="specific_user_responsibilitites_explain"]')[0].value,
        specific_audit_trails_explain: document.querySelectorAll('textarea[name$="specific_audit_trails_explain"]')[0].value,
        specific_privacy_security_awareness_explain: document.querySelectorAll('textarea[name$="specific_privacy_security_awareness_explain"]')[0].value,
        specific_where_incident_occurs_explain: document.querySelectorAll('textarea[name$="specific_where_incident_occurs_explain"]')[0].value,
    });
    console.log("data_new หลังจาก เเก้ไขเเล้ว", data_new);
}