$(document).ready(function () {
  $("#data_file_csv").hide();
  $("#data_file_database").hide();
  $("#pattern_storage_method_inside").hide();
  $("#pattern_storage_method_outside").hide();
  $("#pattern_storage_method_outside_device_name").hide();
  $("#pattern_storage_method_outside_agent_name").hide();
  $("#pattern_storage_method_outside_database_outside_name").hide();
  $("#pattern_processor_inside").hide();
  $("#pattern_processor_outside").hide();
  $("#pattern_set_end_date").hide();
  $("#dpo_check").hide();

  var date = new Date();

  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();

  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  var today = year + "-" + month + "-" + day;
  $("#start_time").attr("value", today);
  $("#dpo_date").attr("value", today);
});

function dpo_approve() {
  var pattern_dpo_approve_process = 0;
  if ($("#customeCheck_1").prop("checked")) {
    pattern_dpo_approve_process = 1;
  } else {
    pattern_dpo_approve_process = 0;
  }

  var pattern_dpo_approve_raw_file_out = 0;
  if ($("#customeCheck_2").prop("checked")) {
    pattern_dpo_approve_raw_file_out = 1;
  } else {
    pattern_dpo_approve_raw_file_out = 0;
  }

  if (
    pattern_dpo_approve_raw_file_out == 1 &&
    pattern_dpo_approve_process == 0
  ) {
    $("#customeCheck_1").prop("checked", true);
    pattern_dpo_approve_process = 1;
  }
}

var u_select_policy = [];
var u_select_policy_num = 0;
var doc_id_select = [];
async function preview_policy(params, id_policy, doc_name, doc_type_name, page) {
  if ($("#" + params.id).prop("checked")) {
    add_preview_policy(id_policy, doc_name, doc_type_name, page);
    doc_id_select.push(id_policy);
    await add_preview_policy_measures(id_policy);
  } else {
    del_preview_policy(id_policy);
    if (doc_id_select.indexOf(id_policy) > -1) {
      doc_id_select.splice(doc_id_select.indexOf(id_policy), 1);
    }
    await add_preview_policy_measures();
  }
}
function add_preview_policy(id_policy, doc_name, doc_type_name, page) {
  $("#choose_measures_specific").show();
  if (u_select_policy.indexOf(id_policy) == -1) {
    if (u_select_policy_num == 0) {
      $("#previewer_policy").html("");
      $("#previewer_policy").append(`
            <br>
            เอกสาร Policy ที่เลือกแล้ว
            <br>
            <br>
            `);
    }
    u_select_policy_num++;
    u_select_policy.push(id_policy);
    $("#previewer_policy").append(
      `
                                <div id="previewer_` +
      id_policy +
      `">
                                    <div class="row">
                                        <div class="col-5">
                                            ชื่อ : ` +
      doc_name +
      `
                                            <br>
                                            ประเภท : ` +
      doc_type_name +
      `
                                            <br>
                                            จำนวนหน้า : ` +
      page +
      `
                                        </div>
                                        <div class="col-7">
                                            <a class="btn btn btn-info" " href="/show_slide/` +
      id_policy +
      `" target="_blank">Preview Policy</a>
                                        </div>
                                        <hr>
                                    </div>
                                </div>
        `
    );
    $("#doc_id").val(u_select_policy.toString());
    check_doc_id();
  }
}

function del_preview_policy(id_policy) {
  if (u_select_policy.indexOf(id_policy) > -1) {
    u_select_policy.splice(u_select_policy.indexOf(id_policy), 1);
    $("#previewer_" + id_policy).remove();
    u_select_policy_num--;
    if (u_select_policy_num == 0) {
      $("#previewer_policy").html("");
      $("#previewer_policy").append(`
            *ยังไม่ได้เลือกเอกสาร Policy
            <br>
            <br>
            `);
      $("#choose_measures_specific").hide();
    }
    $("#doc_id").val(u_select_policy.toString());
    check_doc_id();
  }
}

function check_doc_id() {
  if ($('input[name="doc_id"]').val() != "") {
    // $('#textarea_doc_id').val($('input[name="doc_id"]').val());
    $.ajax({
      type: "POST",
      url: "/pattern/get/doc_id_detail",
      data: { doc_id: $('input[name="doc_id"]').val() },
      success: function (result) {
        console.log(result);
        $.each(result, function (i, xxx) {
          if (xxx.data.length != 0) {
            var tbody_table_pattern_data = ``;
            // for (let i = 0; i < xxx.data.length; i++) {
            //     tbody_table_pattern_data += `<tr >`
            //     tbody_table_pattern_data += `   <td>`
            //     tbody_table_pattern_data += `       ` + (i + 1);
            //     tbody_table_pattern_data += `   </td>`
            //     tbody_table_pattern_data += `   <td>`
            //     tbody_table_pattern_data += `       ` + xxx.data[i].data_name + ` <br>( ` + xxx.data[i].data_code + ` )`;
            //     tbody_table_pattern_data += `   </td>`
            //     tbody_table_pattern_data += `   <td>`
            //     tbody_table_pattern_data += `       ` + xxx.data[i].day_start + ` ถึง ` + xxx.data[i].day_end;
            //     tbody_table_pattern_data += `   </td>`
            //     tbody_table_pattern_data += `   <td>`
            //     tbody_table_pattern_data += `       ` + xxx.data[i].level_name;
            //     tbody_table_pattern_data += `   </td>`
            //     tbody_table_pattern_data += `   <td>`
            //     tbody_table_pattern_data += `       ` + xxx.data[i].data_type_name;
            //     tbody_table_pattern_data += `   </td>`
            //     tbody_table_pattern_data += `   <td>`
            //     tbody_table_pattern_data += `       เลือก <input type="checkbox" class="form-check-input" name="doc_id_person_data" value="` + xxx.data[i].data_id + `" checked> `;
            //     tbody_table_pattern_data += `   </td>`
            //     tbody_table_pattern_data += `</tr>`
            // }

            for (let i = 0; i < xxx.data.length; i++) {
              tbody_table_pattern_data += `<tr >
                                <td>
                                    ${i + 1}
                               </td>
                              <td>
                            ${xxx.data[i].data_name}  <br>( ${xxx.data[i].data_code
                })
                             </td>
                               <td>
                                    ${xxx.data[i].day_start}   ถึง  ${xxx.data[i].day_end
                }
                              </td>
                               <td>
                                   ${xxx.data[i].level_name}
                              </td>
                              <td>
                               ${xxx.data[i].data_type_name}
                               </td>
                               <td>
                                    เลือก <input type="checkbox" class="form-check-input" name="doc_id_person_data" value="${xxx.data[i].data_id
                }" checked> ;
                                </td>
                            </tr>`;
            }

            var tbody_tableadd_tag_pattern = ``;
            success_data_tag = new Set([...xxx.data_tag]);
            success_data_tag = [...success_data_tag].join(",");
            success_data_tag = success_data_tag.split(",");
            success_data_tag = new Set([...success_data_tag]);
            success_data_tag = [...success_data_tag].join(",");
            success_data_tag = success_data_tag.split(",");
            // for (let i = 0; i < success_data_tag.length; i++) {
            //     tbody_tableadd_tag_pattern += `<tr >`
            //     tbody_tableadd_tag_pattern += `   <td>`
            //     tbody_tableadd_tag_pattern += `       ` + (i + 1);
            //     tbody_tableadd_tag_pattern += `   </td>`
            //     tbody_tableadd_tag_pattern += `   <td>`
            //     tbody_tableadd_tag_pattern += `       ` + success_data_tag[i];
            //     tbody_tableadd_tag_pattern += `   </td>`
            //     tbody_tableadd_tag_pattern += `   <td>`
            //     tbody_tableadd_tag_pattern += `       เลือก <input type="checkbox" class="form-check-input" name="doc_id_person_tag" value="` + success_data_tag[i] + `" checked> `;
            //     tbody_tableadd_tag_pattern += `   </td>`
            //     tbody_tableadd_tag_pattern += `</tr>`
            // }

            for (let i = 0; i < success_data_tag.length; i++) {
              tbody_tableadd_tag_pattern += `
                            <tr>
                                <td>
                                    ${i + 1}
                                </td>
                                <td>
                                    ${success_data_tag[i]}
                                </td>
                                <td>
                                    เลือก <input type="checkbox" class="form-check-input" name="doc_id_person_tag" value="${success_data_tag[i]
                }" checked> 
                                </td>
                            </tr>`;
            }

            // var x = document.getElementById("select_tag_pattern");
            // x.value = ''
            // var length = x.options.length;
            // for (i = length - 1; i >= 0; i--) {
            //     x.options[i] = null;
            // }
            for (var i = 0; i < success_data_tag.length; i++) {
              var opt = document.createElement("option");
              opt.value = success_data_tag[i];
              opt.className = "select_tag_pattern_option";
              opt.innerHTML = success_data_tag[i];
              // x.appendChild(opt);
            }
            $(".select_tag_pattern_option").prop("selected", true);
            $("#tbody_table_pattern_data").html(tbody_table_pattern_data);
            $("#tbody_tableadd_tag_pattern").html(tbody_tableadd_tag_pattern);
          } else {
            $("#tbody_table_pattern_data").html("");
            $("#tbody_tableadd_tag_pattern").html("");
          }
        });
      },
      error: function (e) { },
    });
  } else {
    $("#tbody_table_pattern_data").html("");
    $("#tbody_tableadd_tag_pattern").html("");
  }
}

var data_set_found = [];
var data_choose_specific = [];
// var count_number = 0;

async function add_preview_policy_measures(id) {
  doc_id_select = [...new Set(doc_id_select)];
  if (doc_id_select.length > 0) {
    $.ajax({
      type: "post",
      contentType: "application/json",
      url: "/api/pattern/measures/check",
      data: JSON.stringify(doc_id_select),
      dataType: "json",
      success: async function (result) {
        if (result != "ไม่มีข้อมูล") {
          // data_choose_specific.push(result.data_set);
          create_table_measures(result.data_set);
        }
      },
      error: function (e) {
        console.log(e);
      },
    });
  } else {
    $("#tbody-measures").empty().append(`
                        <tr>
                        <td colspan="20" class="text-center" style="border: none;">
                        <b class="text-danger">ไม่พบข้อมูล</b>
                         </td>
                        </tr>
                    `);
  }
}

var policy = []; // เก็บ เอกสาร policy ที่ดึงมาจาก api
var new_process = []; // เก็บ กิจกรรมประมวลผล ที่ดึงมาจาก api
var data_new = []; // เก็บข้อมูลที่เเก้ไขเเล้ว
var supervisor = [] // ผู้ดูแลข้อมูลหรือผู้ดูแลระบบหรือผู้ควบคุมมาตราการ
function getData() {
  $.ajax({
    type: "GET",
    url: "/api/measures/doc/list",
    success: async function (result) {
      policy.push([...result.doc]);
      new_process.push([...result.process]);
      let process = result.process;
      let doc_pdpa_document = result.doc_pdpa_document;

      let select_process = "";
      let select_doc = "";

      if (process == "ไม่มีข้อมูล") {
        select_process = `<option value="">ไม่มีเอกสารที่เปิดใช้งาน</option>`;
      } else {
        process.forEach((element) => {
          select_process += `
                <option value="${element.event_process_id}">${element.event_process_name}</option>
                `;
        });
      }

      if (doc_pdpa_document == "ไม่มีข้อมูล") {
        select_doc = `<option value="0">เลือก...</option>`;
      } else {
        doc_pdpa_document.forEach((element) => {
          select_doc += `
                <option value="${element.doc_id}">${element.doc_name}</option>
                `;
        });
      }
    }, error: function (e) {
      console.log(e);
    },
  });
  //  ข้อมูล ผู้ดูแลข้อมูลหรือผู้ดูแลระบบหรือผู้ควบคุมมาตราการ
  $.ajax({
    type: "GET",
    url: "/api/account/list",
    success: async function (result) {
      console.log("ผู้ดูแลข้อมูลหรือผู้ดูแลระบบหรือผู้ควบคุมมาตราการ", result);
      supervisor.push(result)
    }, error: function (e) {
      console.log(e);
    },
  });
}

getData();

function edit_measures_chooses(data, id) { // func เเก้ไขมาตราการ
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
  number_specific[0] === "2" ? specific_access_control[1].checked = true : specific_access_control[0].checked = true;
  number_specific[1] === "2" ? specific_user_access_management[1].checked = true : specific_user_access_management[0].checked = true;
  number_specific[2] === "2" ? specific_user_responsibilitites[1].checked = true : specific_user_responsibilitites[0].checked = true;
  number_specific[3] === "2" ? specific_audit_trails[1].checked = true : specific_audit_trails[0].checked = true;
  number_specific[4] === "2" ? specific_privacy_security_awareness[1].checked = true : specific_privacy_security_awareness[0].checked = true;
  number_specific[5] === "2" ? specific_where_incident_occurs[1].checked = true : specific_where_incident_occurs[0].checked = true;


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
  document.getElementById("submit").setAttribute("onclick", `submit_edite(this,${id})`);
  // }
}


async function create_table_measures(data) {
  data_set_found = [];
  if (data == "ไม่มีข้อมูล") {
    $("#tbody-measures").empty().append(`
            <tr>
            <td colspan="20" class="text-center" style="border: none;">
            <b class="text-danger">ไม่พบข้อมูล</b>
             </td>
            </tr>
        `);
  } else {
    $("#tbody-measures").empty();
    for (let i = 0; i < data.length; i++) {
      data[i].no = i + 1;
      data_set_found.push(data[i].id_specific);
    }
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
      var show = [];
      for (var i in myList) {
        let number_specific = [];
        let number_specific_explain = [];
        //  กรณีมีการเลือกมาตราการเพื่ม เพื่อดึงข้อมูลที่เเก้ไขเเล้วจาก data_new มา insert ใน table 
        if (data_new.length > 0) {
          console.log("เข้าเงื่อนไขนี้ตอนไหนวะ");
          for (let j = 0; j < data_new.length; j++) {
            if (data_new[j].id_specific == myList[i].id_specific) {
              myList[i].specific_access_control = data_new[j].value_checkbox[0];
              myList[i].specific_audit_trails = data_new[j].value_checkbox[1];
              myList[i].specific_privacy_security_awareness = data_new[j].value_checkbox[2];
              myList[i].specific_user_access_management = data_new[j].value_checkbox[3];
              myList[i].specific_user_responsibilitites = data_new[j].value_checkbox[4];
              myList[i].specific_where_incident_occurs = data_new[j].value_checkbox[5];
              myList[i].id_specific = data_new[j].id_specific; myList[i].event_process_id = Number(data_new[j].id_event_proccess);
              myList[i].measures_supervisor = data_new[j].measures_supervisor;
              myList[i].measures_date_count = Number(data_new[j].measures_date_count);
              myList[i].date = data_new[j].measures_date;
              myList[i].event_process_name = data_new[j].event_process_name;

              myList[i].specific_access_control_explain =
                data_new[j].specific_access_control_explain;
              myList[i].specific_audit_trails_explain =
                data_new[j].specific_audit_trails_explain;
              myList[i].specific_privacy_security_awareness_explain =
                data_new[j].specific_privacy_security_awareness_explain;
              myList[i].specific_user_access_management_explain =
                data_new[j].specific_user_access_management_explain;
              myList[i].specific_user_responsibilitites_explain =
                data_new[j].specific_user_responsibilitites_explain;
              myList[i].specific_where_incident_occurs_explain =
                data_new[j].specific_where_incident_occurs_explain;
            }
          }
        }
        number_specific_explain.push(myList[i].specific_access_control_explain);
        number_specific_explain.push(
          myList[i].specific_user_access_management_explain
        );
        number_specific_explain.push(
          myList[i].specific_user_responsibilitites_explain
        );
        number_specific_explain.push(myList[i].specific_audit_trails_explain);
        number_specific_explain.push(
          myList[i].specific_privacy_security_awareness_explain
        );
        number_specific_explain.push(
          myList[i].specific_where_incident_occurs_explain
        );

        let specific_access_control = '<i class="ti-close text-danger"></i>';
        let specific_audit_trails = '<i class="ti-close text-danger"></i>';
        let specific_privacy_security_awareness =
          '<i class="ti-close text-danger"></i>';
        let specific_user_access_management =
          '<i class="ti-close text-danger"></i>';
        let specific_user_responsibilitites =
          '<i class="ti-close text-danger"></i>';
        let specific_where_incident_occurs =
          '<i class="ti-close text-danger"></i>';

        number_specific.push(myList[i].specific_access_control);
        number_specific.push(myList[i].specific_audit_trails);
        number_specific.push(myList[i].specific_privacy_security_awareness);
        number_specific.push(myList[i].specific_user_access_management);
        number_specific.push(myList[i].specific_user_responsibilitites);
        number_specific.push(myList[i].specific_where_incident_occurs);

        let policys = policy[0];
        let array_doc_id = myList[i].doc_id.split(",");
        let doc_name = "";
        for (let i = 0; i < policys.length; i++) {
          if (array_doc_id.indexOf(String(policys[i].doc_id)) > -1) {
            doc_name += policys[i].doc_name + "<br>";
          }
        }

        if (myList[i].specific_access_control == 1) {
          specific_access_control = `<i class="fas fa-check" style="color: green;"></i>`;
        }
        if (myList[i].specific_audit_trails == 1) {
          specific_audit_trails = `<i class="fas fa-check" style="color: green;"></i>`;
        }

        if (myList[i].specific_privacy_security_awareness == 1) {
          specific_privacy_security_awareness = `<i class="fas fa-check" style="color: green;"></i>`;
        }
        if (myList[i].specific_user_access_management == 1) {
          specific_user_access_management = `<i class="fas fa-check" style="color: green;"></i>`;
        }
        if (myList[i].specific_user_responsibilitites == 1) {
          specific_user_responsibilitites = `<i class="fas fa-check" style="color: green;"></i>`;
        }

        if (myList[i].specific_where_incident_occurs == 1) {
          specific_where_incident_occurs = `<i class="fas fa-check" style="color: green;"></i>`;
        }
        var row = `<tr id ="${myList[i].id_specific}">
                        <td>
                        <a class="text-warning" doc_id="${myList[i].doc_id}" event_process_id="${myList[i].event_process_id}" 
                        measures_detail="${myList[i].measures_detail}" measures_supervisor="${myList[i].measures_supervisor}" 
                        date="${myList[i].date}" date_count="${myList[i].measures_date_count}" 
                        data-bs-toggle="modal" data-bs-target="#edit-measures-chooses"
                        onclick="edit_measures_chooses(this,${myList[i].id_specific})">
                        <i class="fas fa-pencil-alt fa-2x"></i>
                        </a>
                        </td>
                        <td class="${number_specific}">${myList[i].no}</td>
                        <td class="${number_specific_explain}">${myList[i].event_process_name}</td>           
                        <td>${myList[i].measures_section_name}</td>
                        <td>${specific_access_control}</td>
                        <td>${specific_audit_trails}</td>
                        <td>${specific_privacy_security_awareness}</td>
                        <td>${specific_user_access_management}</td>
                        <td>${specific_user_responsibilitites}</td>
                        <td>${specific_where_incident_occurs}</td>
                        <td>${doc_name}</td>
                        <td><a class="text-info" target="_blank"  href="/Specific-Measures/details/${myList[i].id_specific}"><i class=" fas fa-file-alt fa-2x"></i></a></td>
                        </tr>
                        `;
        table.append(row);
        show.push(myList[i].no);
      }
      // document.querySelector("#show-Specific-Measures").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า
      // document.querySelector("#to-show-Specific-Measures").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
      // document.querySelector("#show-all-Specific-Measures").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
      pageButtons(data.pages);
    }
  }
}



function submit_edite(data, id) {
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

  let value_checkbox = [];
  $("input:radio[name=specific_access_control]:checked").each(function () {
    value_checkbox.push($(this).val());
    if ($(this).val() == 1) {
      td[4].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
    } else {
      td[4].innerHTML = `<i class="ti-close text-danger"></i>`;
    }
  });

  $("input:radio[name=specific_user_access_management]:checked").each(
    function () {
      value_checkbox.push($(this).val());
      if ($(this).val() == 1) {
        td[5].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
      } else {
        td[5].innerHTML = `<i class="ti-close text-danger"></i>`;
      }
    }
  );

  $("input:radio[name=specific_user_responsibilitites]:checked").each(
    function () {
      value_checkbox.push($(this).val());
      if ($(this).val() == 1) {
        td[6].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
      } else {
        td[6].innerHTML = `<i class="ti-close text-danger"></i>`;
      }
    }
  );

  $("input:radio[name=specific_audit_trails]:checked").each(function () {
    value_checkbox.push($(this).val());
    if ($(this).val() == 1) {
      td[7].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
    } else {
      td[7].innerHTML = `<i class="ti-close text-danger"></i>`;
    }
  });

  $("input:radio[name=specific_privacy_security_awareness]:checked").each(
    function () {
      value_checkbox.push($(this).val());
      if ($(this).val() == 1) {
        td[8].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
      } else {
        td[8].innerHTML = `<i class="ti-close text-danger"></i>`;
      }
    }
  );

  $("input:radio[name=specific_where_incident_occurs]:checked").each(function () {
    value_checkbox.push($(this).val());
    if ($(this).val() == 1) {
      td[9].innerHTML = `<i class="fas fa-check" style="color: green;"></i>`;
    } else {
      td[9].innerHTML = `<i class="ti-close text-danger"></i>`;
    }
  }
  );

  //  add class in td
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
    doc_id: new_doc_id,
    value_checkbox: value_checkbox,
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
}





document.getElementById("choose_measures_specific").addEventListener("click", function () {
  // if (count_number == 0) {
  // count_number = count_number + 1;
  $.ajax({
    type: "GET",
    url: "/api/security/section/pattern/specific",
    success: async function (result) {
      if (result == "ไม่มีข้อมูล") {
        $("#table-select-measures")
          .empty()
          .append(
            `<tr><td colspan="20" class="text-center" style="border: none;"><b class="text-danger">ไม่พบข้อมูล</b></td></tr>`
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

// var new_data = []

async function create_choose_measures_specific(data) {
  $("#table-select-measures").empty();
  for (let i = 0; i < data.length; i++) {
    data[i].no = i + 1;
  }

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
        // หาข้อมูลที่เเก้ไขเเล้วเพื่อมาสร้าง ตารางตัวเลือกให้ข้อมุลเหมือนที่เเก้ไข
        let map1 = data_new.findIndex(
          (x) => x.id_specific == myList[i].id_specific
        );
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
    document.querySelector("#show-Specific-Measures-choose").innerHTML =
      show[0]; //  แสดงถึง row เเรกของหน้า
    document.querySelector("#to-show-Specific-Measures-choose").innerHTML =
      show[show.length - 1]; //  แสดงถึง row สุดท้ายของหน้า
    document.querySelector("#show-all-Specific-Measures-choose").innerHTML =
      state.querySet.length; //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
    pageButtons(data.pages);
  }
}

async function Choose_Specific(data) {
  let checkbox = $(".checkbox_Choose_Specific");
  let id_specific = [];
  for (let i = 0; i < checkbox.length; i++) {
    if (checkbox[i].checked == true) {
      id_specific.push(checkbox[i].getAttribute("id"));
    }
  }
  let arrya_data_new = [];
  if (data_new.length > 0) {
    for (let i = 0; i < data_new.length; i++) {
      if (id_specific.indexOf(String(data_new[i].id_specific)) > -1) {
        arrya_data_new.push(data_new[i]);
      }
    }
  }
  data_new = [];
  data_new.push(...arrya_data_new);
  let dataFetch = {
    'id_specific': id_specific
  }
  $.ajax({
    type: "post",
    contentType: "application/json",
    url: "/api/pattern/get/measures/pecific",
    data: JSON.stringify(dataFetch),
    dataType: "json",
    success: async function (result) {
      await create_table_measures(result.data_set);
    },
    error: function (e) {
      console.log(e);
    },
  });
}



function form_add_pattern_submit() {
  if ($('input[name="doc_id"]').val() == "") {
    console.log("1");
    $("#btn-add-policy").focus();
    $("#doc_id_policy").addClass("highlighted");
    setTimeout(function () {
      $("#doc_id_policy").removeClass("highlighted");
    }, 1500);
  } else if ($("#pattern_processing_base_id").val() == null) {
    console.log("2222222");
    $("#select_processing_base_table").focus();
    $("#select_processing_base_table").addClass("highlighted");
    setTimeout(function () {
      $("#select_processing_base_table").removeClass("highlighted");
    }, 1500);
  } else {
    console.log("submit_1", data_new);
    console.log("submit_1", data_new.length);

    if (data_new.length > 0) {
      console.log("gggg");
      // document.querySelectorAll('input[name$="new_data_papd_specific"]')[0].value = JSON.stringify(data_new)
      document.getElementById("new_data_papd_specific").value = JSON.stringify(data_new);
    }
    document.getElementById("papd_specific").value = data_set_found.toString();
    $("#form_add_pattern_submit_b").click();
    if ($('input[name="pattern_name"]').val() == "") {
      $('input[name="pattern_name"]').focus();
    } else if ($('input[name="pattern_start_date"]').val() == "") {
      $('input[name="pattern_start_date"]').focus();
    } else if ($('input[name="pattern_total_date"]').val() == "") {
      $('input[name="pattern_total_date"]').focus();
    }
  }
}
