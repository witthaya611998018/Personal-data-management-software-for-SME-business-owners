

$(document).ready(function () {
    // $("#xx").click(function () {
    //     $(this).hide();
    // });


    $('#show_flow').hide();

});


$("#flow_download_pdf").click(function () {
    html2canvas(document.getElementById('show_flow')).then(function (canvas) {
        const ondate = new Date();
        let month = ondate.getMonth() + 1;
        let day = ondate.getDate();
        let hours = ondate.getHours();
        let minutes = ondate.getMinutes();
        let seconds = ondate.getSeconds();
        if (String(month).length == 1) {
            month = "0" + String(month)
        }
        if (String(day).length == 1) {
            day = "0" + String(day)
        }
        if (String(hours).length == 1) {
            hours = "0" + String(hours)
        }
        if (String(minutes).length == 1) {
            minutes = "0" + String(minutes)
        }
        if (String(seconds).length == 1) {
            seconds = "0" + String(seconds)
        }
        const maxOnDate = ondate.getFullYear() + "-" + month + "-" + day + "Z" + hours + ":" + minutes + ":" + seconds
        const name_file = "Dataflow_" + maxOnDate + ".pdf";

        const img = canvas.toDataURL('image/jpeg', 1);
        window.jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF("l", "mm", "a4"); // [297, 210] = "w, s" or "a4"
        var width = doc.internal.pageSize.getWidth() * .95;
        var height = doc.internal.pageSize.getHeight() * .95;
        doc.addImage(img, "JPEG", 5, 5, width, height);
        doc.save("name_file");

    })


});

$("#flow_preview_print").click(function () {
    var myWindow = window.open('xxx', '_blank');
    myWindow.document.write($('#show_flow').html());
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
    `);
});

$("#search_flow").click(function () {
    var select_policy = $('#select-policy').val();
    var select_pattern = $('#select-pattern').val();
    var select_classify = $('#select-classify').val();
    var select_personal_data = $('#input_select_personal_data').val();
    var select_users = $('#select-users').val();
    get_search_flow(select_policy, select_pattern, select_classify, select_personal_data, select_users);
});


function get_search_flow(select_policy, select_pattern, select_classify, select_personal_data, select_users) {
    var data = { select_policy: select_policy, select_pattern: select_pattern, select_classify: select_classify, select_personal_data: select_personal_data, select_users: select_users }
    $.ajax({
        type: 'POST',
        url: '/dataFlow2/get/get_search_flow',
        data: data,
        success: function (result) {
            $('#show_flow').html("");
            if (result.length > 0) {
                var html_text_table1_tbody = ` <div class="col-12">
            <table class="" style="width: 100%; border-radius: 1px;">
                <thead>
                    <tr>
                        <th>
                            No
                        </th>
                        <th>
                        Policy  <br>(ชือ นโยบาย/กิจกรรม/สัญญา)
                        </th>
                        <th>
                        ข้อมูลส่วนบุคคล: Policy
                        </th>
                        <th>
                        Pattern <br>(ชื่อ การรวบรวมเก็บข้อมูล)
                        </th>
                        <th>
                        ข้อมูลส่วนบุคคล: Pattern
                        </th>
                        <th>
                        Classification <br>(ชื่อ การใช้งานเปิดเผยข้อมูล)
                        </th>
                        <th>
                        ข้อมูลส่วนบุคคล: Classification
                        </th>
                    </tr>
                </thead>
                <tbody id="show_flow_table1_tbody" style="vertical-align: top;">`;
                $.each(result, function (i, xxx) {
                    $('#show_flow').show();
                    html_text_table1_tbody += `<tr>`;
                    html_text_table1_tbody += `<td>` + (i + 1) + `</td>`;
                    html_text_table1_tbody += `<td>`;
                    
                    if (xxx.policy_name.length == 1) {
                        html_text_table1_tbody += `<div class="card" style="outline: 1px solid ;"><div class="card-body">`;
                        html_text_table1_tbody += xxx.policy_name;
                        html_text_table1_tbody += '<br>';
                        html_text_table1_tbody += 'รายละเอียด : สร้างเมื่อ ';
                        html_text_table1_tbody += xxx.policy[0].doc_date_create_date
                        html_text_table1_tbody += '<br>';
                        html_text_table1_tbody += `</div></div>`;
                    } else {
                        for (let i = 0; i < xxx.policy_name.length; i++) {
                            // if (i > 0 && i == xxx.policy_name.length - 1) {
                            // }
                            html_text_table1_tbody += `<div class="card" style="outline: 1px solid ;"><div class="card-body">`;
                            html_text_table1_tbody += xxx.policy_name[i];
                            html_text_table1_tbody += '<br>';
                            html_text_table1_tbody += 'รายละเอียด :สร้างเมื่อ ';
                            html_text_table1_tbody += xxx.policy[0].doc_date_create_date
                            html_text_table1_tbody += '<br>';
                            html_text_table1_tbody += `</div></div>`;

                        }
                    }
                    html_text_table1_tbody += `</td>`;
                    html_text_table1_tbody += `<td>`;
                    html_text_table1_tbody += `มีข้อมูลจำนวน ` + xxx.policy_data_name.length + ` ข้อมูล<br>`;
                    if (xxx.policy_data_name.length > 0) {
                        for (let i = 0; i < xxx.policy_data_name.length; i++) {
                            html_text_table1_tbody += i + 1 + `. `;
                            html_text_table1_tbody += xxx.policy_data_name[i] + `<br>`;

                        }

                    }
                    html_text_table1_tbody += `</td>`;
                    html_text_table1_tbody += `<td>`;
                    html_text_table1_tbody += xxx.pattern[0].pattern_name;
                    html_text_table1_tbody += '<br>';
                    html_text_table1_tbody += 'รายละเอียด :';
                    html_text_table1_tbody += `ชื่อรูปแบบ: ` + xxx.pattern[0].pattern_name + `<br>`;
                    html_text_table1_tbody += `ชื่อรูปแบบชนิดข้อมูล File ms: `;
                    if (xxx.pattern[0].pattern_type_data_file == 1) {
                        if (xxx.pattern[0].pattern_type_data_file_of_path == 1) {
                            html_text_table1_tbody += `Windows[ ` + xxx.pattern[0].pattern_type_data_file_path + ` ]`;
                            if (xxx.pattern[0].pattern_type_data_database == 1) {
                                html_text_table1_tbody += ` / Database [ ` + xxx.pattern[0].pattern_type_data_database_name + ` ]<br>`;
                            } else {
                                html_text_table1_tbody += ` / Database [ ไม่มีข้อมูล ]<br>`;
                            }
                        } else {
                            html_text_table1_tbody += `Linux: [ ` + xxx.pattern[0].pattern_type_data_file_path + ` ]`;
                            if (xxx.pattern[0].pattern_type_data_database == 1) {
                                html_text_table1_tbody += ` / Database [ ` + xxx.pattern[0].pattern_type_data_database_name + ` ]<br>`;

                            } else {
                                html_text_table1_tbody += ` / Database [ ไม่มีข้อมูล ]<br>`;
                            }
                        }
                    } else {
                        html_text_table1_tbody += `ไม่มีข้อมูล` + `<br>`;
                    }
                    html_text_table1_tbody += `วิธีจัดเก็บภายใน Alltra: `;
                    if (xxx.pattern[0].pattern_storage_method_inside == 1) {
                        html_text_table1_tbody += `มี <br>`;
                        html_text_table1_tbody += ` รูปแบบการจัดเก็บข้อมูลภายใน: <br>`;
                        if (xxx.pattern[0].pattern_storage_method_inside_import == 1) {
                            html_text_table1_tbody += ` -Device: มี / ` + xxx.pattern[0].pattern_storage_method_inside_import_id + `<br>`;
                        } else {
                            html_text_table1_tbody += ` -Device: ไม่มี <br>`;
                        }
                        if (xxx.pattern[0].pattern_storage_method_inside_agent == 1) {
                            html_text_table1_tbody += ` -Agent: มี / ` + xxx.pattern[0].pattern_storage_method_inside_agent_name + `<br>`;
                        } else {
                            html_text_table1_tbody += ` -Agent: ไม่มี <br>`;
                        }
                        // if (xxx.pattern[0].pattern_storage_method_inside_database_outside == 1) {
                        //     html_text_table1_tbody += ` -Database ภายนอก: มี / ` + xxx.pattern[0].pattern_storage_method_inside_database_outside_name + `<br>`;
                        // } else {
                        //     html_text_table1_tbody += ` -Database ภายนอก: ไม่มี <br>`;
                        // }
                    } else {
                        html_text_table1_tbody += `ไม่มี <br>`;
                    }
                    html_text_table1_tbody += `วิธีจัดเก็บภายนอก Alltra: `;
                    if (xxx.pattern[0].pattern_storage_method_outside == 1) {
                        html_text_table1_tbody += `มี <br>`;
                        html_text_table1_tbody += ` -จัดเก็บ:  ` + xxx.pattern[0].pattern_storage_method_outside_name + `<br>`;


                    } else {
                        html_text_table1_tbody += `ไม่มี <br>`;
                    }
                    if (xxx.pattern[0].pattern_processor_inside == 1) {
                        html_text_table1_tbody += `ผู้มีสิทธิ์นำข้อมูลไปใช้ (ภายใน): มี ` + xxx.pattern[0].pattern_processor_inside_total + ` คน คือ :`;
                        html_text_table1_tbody += xxx.pattern_name_user_inside + `<br>`;
                    } else {
                        html_text_table1_tbody += `ผู้มีสิทธิ์นำข้อมูลไปใช้ (ภายใน): ไม่มี <br>`;
                    }
                    if (xxx.pattern[0].pattern_processor_outside == 1) {
                        html_text_table1_tbody += `ผู้มีสิทธิ์นำข้อมูลไปใช้ (ภายนอก): มี ` + xxx.pattern[0].pattern_processor_outside_total + ` คน คือ :`;
                        html_text_table1_tbody += xxx.pattern_name_user_outside + `<br>`;
                    } else {
                        html_text_table1_tbody += `ผู้มีสิทธิ์นำข้อมูลไปใช้ (ภายนอก): ไม่มี<br>`;
                    }

                    if (xxx.pattern[0].pattern_set_end_date == 1) {
                        html_text_table1_tbody += `กำหนดระยะเวลาสิ้นสุด: ` + xxx.pattern[0].pattern_set_end_date_total + ` วัน<br>`;
                    } else {
                        html_text_table1_tbody += `กำหนดระยะเวลาสิ้นสุด: ไม่มี<br>`;
                    }
                    html_text_table1_tbody += `ตรวจสอบโดย DPO : <br>`;
                    if (xxx.pattern[0].pattern_set_end_date == 1) {
                        html_text_table1_tbody += `-ต้องอนุมัติทุกครั้งถึงสามารถประมวลผลได้: `;
                        if (xxx.pattern[0].pattern_dpo_approve_process == 1) {
                            html_text_table1_tbody += `มี <br>`;
                        } else {
                            html_text_table1_tbody += `ไม่มี <br>`;

                        }
                        html_text_table1_tbody += `-ต้องอนุมัติทุกครั้งที่จะนำข้อมูล Raw file ออกได้: `;
                        if (xxx.pattern[0].pattern_dpo_approve_raw_file_out == 1) {
                            html_text_table1_tbody += `มี <br>`;
                        } else {
                            html_text_table1_tbody += `ไม่มี <br>`;

                        }
                    }
                    html_text_table1_tbody += `</td>`;
                    html_text_table1_tbody += `<td>`;
                    html_text_table1_tbody += `มีข้อมูลจำนวน ` + xxx.pattern_doc_id_person_data_name.length + ` ข้อมูล<br>`;
                    if (xxx.pattern_doc_id_person_data_name.length > 0) {
                        for (let i = 0; i < xxx.pattern_doc_id_person_data_name.length; i++) {
                            html_text_table1_tbody += i + 1 + `. `;
                            html_text_table1_tbody += xxx.pattern_doc_id_person_data_name[i] + `<br>`;

                        }

                    }
                    html_text_table1_tbody += `</td>`;
                    html_text_table1_tbody += `<td>`;
                    if (xxx.classify.length == 1) {
                        // html_text_table1_tbody += `<div class="card" style="outline: 2px solid ;"><div class="card-body">`;
                        html_text_table1_tbody += xxx.classify_name;
                        html_text_table1_tbody += '<br>';
                        html_text_table1_tbody += 'รายละเอียด :';
                        html_text_table1_tbody += '<br>';
                        html_text_table1_tbody += `ชื่อรูปแบบชนิดข้อมูล File ms: `;
                        if (xxx.pattern[0].pattern_type_data_file == 1) {
                            if (xxx.pattern[0].pattern_type_data_file_of_path == 1) {
                                html_text_table1_tbody += `Windows[ ` + xxx.pattern[0].pattern_type_data_file_path + ` ]`;
                                if (xxx.pattern[0].pattern_type_data_database == 1) {
                                    html_text_table1_tbody += ` / Database [ ` + xxx.pattern[0].pattern_type_data_database_name + ` ]<br>`;
                                } else {
                                    html_text_table1_tbody += ` / Database [ ไม่มีข้อมูล ]<br>`;
                                }
                            } else {
                                html_text_table1_tbody += `Linux: [ ` + xxx.pattern[0].pattern_type_data_file_path + ` ]`;
                                if (xxx.pattern[0].pattern_type_data_database == 1) {
                                    html_text_table1_tbody += ` / Database [ ` + xxx.pattern[0].pattern_type_data_database_name + ` ]<br>`;

                                } else {
                                    html_text_table1_tbody += ` / Database [ ไม่มีข้อมูล ]<br>`;
                                }
                            }
                        } else {
                            html_text_table1_tbody += `ไม่มีข้อมูล` + `<br>`;
                        }
                        html_text_table1_tbody += `วิธีจัดเก็บภายใน Alltra: `;
                        if (xxx.pattern[0].pattern_storage_method_inside == 1) {
                            html_text_table1_tbody += `มี <br>`;
                        } else {
                            html_text_table1_tbody += `ไม่มี <br>`;
                        }
                        html_text_table1_tbody += `วิธีจัดเก็บภายนอก Alltra: `;
                        if (xxx.pattern[0].pattern_storage_method_outside == 1) {
                            html_text_table1_tbody += `มี <br>`;
                            html_text_table1_tbody += ` รูปแบบการจัดเก็บข้อมูลภายนอก: <br>`;
                            if (xxx.pattern[0].pattern_storage_method_outside_device == 1) {
                                html_text_table1_tbody += ` -Device: มี / ` + xxx.pattern[0].pattern_storage_method_outside_device_name + `<br>`;
                            } else {
                                html_text_table1_tbody += ` -Device: ไม่มี <br>`;
                            }
                            if (xxx.pattern[0].pattern_storage_method_outside_agent == 1) {
                                html_text_table1_tbody += ` -Agent: มี / ` + xxx.pattern[0].pattern_storage_method_outside_agent_name + `<br>`;
                            } else {
                                html_text_table1_tbody += ` -Agent: ไม่มี <br>`;
                            }
                            // if (xxx.pattern[0].pattern_storage_method_outside_database_outside == 1) {
                            //     html_text_table1_tbody += ` -Database ภายนอก: มี / ` + xxx.pattern[0].pattern_storage_method_outside_database_outside_name + `<br>`;
                            // } else {
                            //     html_text_table1_tbody += ` -Database ภายนอก: ไม่มี <br>`;
                            // }
                        } else {
                            html_text_table1_tbody += `ไม่มี <br>`;
                        }
                        if (xxx.classify[0].classify[0].classify_user_access_info_process_inside == 1) {
                            html_text_table1_tbody += `ผู้มีสิทธิ์ประมวลผล (ภายใน): มี ` + xxx.classify[0].classify[0].classify_user_access_info_process_inside_from_new_total + ` คน คือ : <t id="xxxxx">`;
                            html_text_table1_tbody += xxx.classify[0].classify_name_user_inside + `</t><br>`;
                        } else {
                            html_text_table1_tbody += `ผู้มีสิทธิ์ประมวลผล (ภายใน): ไม่มี <br>`;
                        }
                        if (xxx.classify[0].classify[0].classify_user_access_info_process_outside == 1) {
                            html_text_table1_tbody += `ผู้มีสิทธิ์ประมวลผล (ภายนอก): มี ` + xxx.classify[0].classify[0].classify_user_access_info_process_outside_from_new_total + ` คน คือ :`;
                            html_text_table1_tbody += xxx.classify[0].classify_name_user_outside + `<br>`;
                        } else {
                            html_text_table1_tbody += `ผู้มีสิทธิ์ประมวลผล (ภายนอก): ไม่มี<br>`;
                        }
                        html_text_table1_tbody += `ระยะเวลาประมวลผล: ` + xxx.classify[0].classify[0].classify_period_process + `  วัน<br>`;
                        html_text_table1_tbody += `ระยะเวลาสิ้นสุด: ` + xxx.classify[0].classify[0].classify_period_end + `  วัน<br>`;
                        html_text_table1_tbody += `ข้อมูลส่วนุคคล: `;
                        if (xxx.classify[0].classify[0].classify_type_data_in_event_personal == 1) {
                            html_text_table1_tbody += `มี <br> `;
                        } else {
                            html_text_table1_tbody += `ไม่มี <br> `;
                        }
                        html_text_table1_tbody += `ข้อมูลอ่อนไหว: `;
                        if (xxx.classify[0].classify[0].classify_type_data_in_event_special_personal_sensitive == 1) {
                            html_text_table1_tbody += `มี <br> `;
                        } else {
                            html_text_table1_tbody += `ไม่มี <br> `;
                        }
                        html_text_table1_tbody += `ฐานการประมวลผล: `;
                        if (xxx.classify[0].classify[0].pattern_processing_base_id) {
                            html_text_table1_tbody += xxx.classify[0].classify[0].pattern_processing_base_id + `<br> `;
                        } else {
                            html_text_table1_tbody += `ไม่มี <br> `;
                        }
                        html_text_table1_tbody += `เงื่อนไขพิเศษ: `;
                        if (xxx.classify[0].classify[0].classification_special_conditions_id) {
                            html_text_table1_tbody += xxx.classify[0].classify[0].classification_special_conditions_id + `<br> `;
                        } else {
                            html_text_table1_tbody += `ไม่มี <br> `;
                        }
                        html_text_table1_tbody += `กำหนดเวลาเข้าถึงข้อมูล: `;
                        if (xxx.classify[0].classify[0].classify_protect_data_limit_follow_datetime == 1) {
                            html_text_table1_tbody += `จ-ศ 08.00-17.00 <br> `;
                        } else {
                            html_text_table1_tbody += `ไม่มี <br> `;
                        }
                        html_text_table1_tbody += `2 factor: `;

                        if (xxx.classify[0].classify[0].classify_approach_protect_used_two_factor_from_google_authen == 1 || xxx.classify[0].classify[0].classify_approach_protect_used_two_factor_from_google_authen == 1 || xxx.classify[0].classify[0].classify_approach_protect_used_two_factor_from_sms == 1) {
                            if (xxx.classify[0].classify[0].classify_approach_protect_used_two_factor_from_google_authen == 1) {
                                html_text_table1_tbody += `google-authen `;
                            }
                            if (xxx.classify[0].classify[0].classify_approach_protect_used_two_factor_from_google_authen == 1) {
                                html_text_table1_tbody += `email `;
                            }
                            if (xxx.classify[0].classify[0].classify_approach_protect_used_two_factor_from_sms == 1) {
                                html_text_table1_tbody += `sms `;
                            }
                        } else {
                            html_text_table1_tbody += `ไม่มี `;
                        }
                        html_text_table1_tbody += `<br> `;
                        html_text_table1_tbody += `ตรวจสอบโดย DPO:  `;
                        html_text_table1_tbody += `<br> `;
                        html_text_table1_tbody += `ข้อมูลส่วนุคคล สามารถระบุตัวบุคคลได้: `;
                        if (xxx.classify[0].classify[0].classify_risk_assess_only_dpo_data_personal_can_specify == 1) {
                            html_text_table1_tbody += `ได้โดยตรง <br> `;
                        } else {
                            html_text_table1_tbody += `ไม่ได้โยตรง <br> `;
                        }
                        html_text_table1_tbody += `ปริมาณข้อมูลทั้งหมดที่ใช้ประมวลผล: `;
                        if (xxx.classify[0].classify[0].classify_risk_assess_only_dpo_data_number_all_used_process_many == 1) {
                            html_text_table1_tbody += `มาก <br> `;
                        } else {
                            html_text_table1_tbody += `น้อย <br> `;
                        }
                        html_text_table1_tbody += `การควบคุมการเข้าถึงข้อมูลใน Alltra: `;
                        if (xxx.classify[0].classify[0].classify_risk_assess_only_dpo_access_control_inside == 1) {
                            html_text_table1_tbody += `มี <br> `;
                        } else {
                            html_text_table1_tbody += `ไม่มี <br> `;
                        }
                        html_text_table1_tbody += `การควบคุมการเข้าถึงข้อมูลระบบนอก Alltra: `;
                        if (xxx.classify[0].classify[0].classify_risk_assess_only_dpo_access_control_outside == 1) {
                            html_text_table1_tbody += `มี <br> `;
                        } else {
                            html_text_table1_tbody += `ไม่มี <br> `;
                        }
                        html_text_table1_tbody += `การป้องกันข้อมูลใน Alltra: `;
                        if (xxx.classify[0].classify[0].classify_risk_assess_only_dpo_protect_data_inside == 1) {
                            html_text_table1_tbody += `มี <br> `;
                        } else {
                            html_text_table1_tbody += `ไม่มี <br> `;
                        }
                        html_text_table1_tbody += `การป้องกันข้อมูลจากระบบนอก Alltra: `;
                        if (xxx.classify[0].classify[0].classify_risk_assess_only_dpo_protect_data_outside == 1) {
                            html_text_table1_tbody += `มี <br> `;
                        } else {
                            html_text_table1_tbody += `ไม่มี <br> `;
                        }
                        html_text_table1_tbody += `วิธีการแก้ไขเมื่อเกิดข้อมูลรั่วไหลหรือผลกระทบต่อเจ้าของข้อมูล: ` + xxx.classify[0].classify[0].classify_risk_assess_only_dpo_fix_a_leak_of_data + `<br>`;
                        html_text_table1_tbody += `วิธีการแก้ไขเมื่อเกิดข้อมูลรั่วไหลหรือผลกระทบต่อองค์กร: ` + xxx.classify[0].classify[0].classify_risk_assess_only_dpo_fix_a_leak_of_organization + `<br>`;
                        // html_text_table1_tbody += `</div></div>`;
                    } else {
                        for (let i = 0; i < xxx.classify.length; i++) {
                            if (i > 0 && i == xxx.classify.length - 1) {
                                // html_text_table1_tbody += `</div></div>`;
                                // html_text_table1_tbody += `<div class="card" style="outline: 2px solid ;"><div class="card-body">`;
                                html_text_table1_tbody += `</td>`;
                                // html_text_table1_tbody += `<td>` + xxx.classify_doc_id_person_data_pattern_name[i - 1] + `</td>`;
                                html_text_table1_tbody += `<td>`;
                                html_text_table1_tbody += `มีข้อมูลจำนวน ` + xxx.classify_doc_id_person_data_pattern_name[i - 1].length + ` ข้อมูล<br>`;
                                if (xxx.classify_doc_id_person_data_pattern_name[i - 1].length > 0) {
                                    for (let x = 0; x < xxx.classify_doc_id_person_data_pattern_name[i - 1].length; x++) {
                                        html_text_table1_tbody += x + 1 + `. `;
                                        html_text_table1_tbody += xxx.classify_doc_id_person_data_pattern_name[i - 1][x] + `<br>`;

                                    }

                                }
                                html_text_table1_tbody += `</td>`;
                                html_text_table1_tbody += `</tr>`;
                                html_text_table1_tbody += `<tr>`;
                                html_text_table1_tbody += `<td></td>`;
                                html_text_table1_tbody += `<td></td>`;
                                html_text_table1_tbody += `<td></td>`;
                                html_text_table1_tbody += `<td></td>`;
                                html_text_table1_tbody += `<td></td>`;
                                html_text_table1_tbody += `<td>`;

                            }
                            // html_text_table1_tbody += `<div class="card" style="outline: 2px solid ;"><div class="card-body">`;
                            html_text_table1_tbody += xxx.classify_name[i];
                            html_text_table1_tbody += '<br>';
                            html_text_table1_tbody += 'รายละเอียด :';
                            html_text_table1_tbody += '<br>';
                            html_text_table1_tbody += `ชื่อรูปแบบชนิดข้อมูล File ms: `;
                            if (xxx.pattern[0].pattern_type_data_file == 1) {
                                if (xxx.pattern[0].pattern_type_data_file_of_path == 1) {
                                    html_text_table1_tbody += `Windows[ ` + xxx.pattern[0].pattern_type_data_file_path + ` ]`;
                                    if (xxx.pattern[0].pattern_type_data_database == 1) {
                                        html_text_table1_tbody += ` / Database [ ` + xxx.pattern[0].pattern_type_data_database_name + ` ]<br>`;
                                    } else {
                                        html_text_table1_tbody += ` / Database [ ไม่มีข้อมูล ]<br>`;
                                    }
                                } else {
                                    html_text_table1_tbody += `Linux: [ ` + xxx.pattern[0].pattern_type_data_file_path + ` ]`;
                                    if (xxx.pattern[0].pattern_type_data_database == 1) {
                                        html_text_table1_tbody += ` / Database [ ` + xxx.pattern[0].pattern_type_data_database_name + ` ]<br>`;

                                    } else {
                                        html_text_table1_tbody += ` / Database [ ไม่มีข้อมูล ]<br>`;
                                    }
                                }
                            } else {
                                html_text_table1_tbody += `ไม่มีข้อมูล` + `<br>`;
                            }
                            html_text_table1_tbody += `วิธีจัดเก็บภายใน Alltra: `;
                            if (xxx.pattern[0].pattern_storage_method_inside == 1) {
                                html_text_table1_tbody += `มี <br>`;
                            } else {
                                html_text_table1_tbody += `ไม่มี <br>`;
                            }
                            html_text_table1_tbody += `วิธีจัดเก็บภายนอก Alltra: `;
                            if (xxx.pattern[0].pattern_storage_method_outside == 1) {
                                html_text_table1_tbody += `มี <br>`;
                                html_text_table1_tbody += ` รูปแบบการจัดเก็บข้อมูลภายนอก: <br>`;
                                if (xxx.pattern[0].pattern_storage_method_outside_device == 1) {
                                    html_text_table1_tbody += ` -Device: มี / ` + xxx.pattern[0].pattern_storage_method_outside_device_name + `<br>`;
                                } else {
                                    html_text_table1_tbody += ` -Device: ไม่มี <br>`;
                                }
                                if (xxx.pattern[0].pattern_storage_method_outside_agent == 1) {
                                    html_text_table1_tbody += ` -Agent: มี / ` + xxx.pattern[0].pattern_storage_method_outside_agent_name + `<br>`;
                                } else {
                                    html_text_table1_tbody += ` -Agent: ไม่มี <br>`;
                                }
                                // if (xxx.pattern[0].pattern_storage_method_outside_database_outside == 1) {
                                //     html_text_table1_tbody += ` -Database ภายนอก: มี / ` + xxx.pattern[0].pattern_storage_method_outside_database_outside_name + `<br>`;
                                // } else {
                                //     html_text_table1_tbody += ` -Database ภายนอก: ไม่มี <br>`;
                                // }
                            } else {
                                html_text_table1_tbody += `ไม่มี <br>`;
                            }
                            if (xxx.classify[i].classify[0].classify_user_access_info_process_inside == 1) {
                                html_text_table1_tbody += `ผู้มีสิทธิ์ประมวลผล (ภายใน): มี ` + xxx.classify[i].classify[0].classify_user_access_info_process_inside_from_new_total + ` คน คือ : <t id="xxxxx">`;
                                html_text_table1_tbody += xxx.classify[i].classify_name_user_inside + `</t><br>`;
                            } else {
                                html_text_table1_tbody += `ผู้มีสิทธิ์ประมวลผล (ภายใน): ไม่มี <br>`;
                            }
                            if (xxx.classify[i].classify[0].classify_user_access_info_process_outside == 1) {
                                html_text_table1_tbody += `ผู้มีสิทธิ์ประมวลผล (ภายนอก): มี ` + xxx.classify[i].classify[0].classify_user_access_info_process_outside_from_new_total + ` คน คือ :`;
                                html_text_table1_tbody += xxx.classify[i].classify_name_user_outside + `<br>`;
                            } else {
                                html_text_table1_tbody += `ผู้มีสิทธิ์ประมวลผล (ภายนอก): ไม่มี<br>`;
                            }
                            html_text_table1_tbody += `ระยะเวลาประมวลผล: ` + xxx.classify[i].classify[0].classify_period_process + `  วัน<br>`;
                            html_text_table1_tbody += `ระยะเวลาสิ้นสุด: ` + xxx.classify[i].classify[0].classify_period_end + `  วัน<br>`;
                            html_text_table1_tbody += `ข้อมูลส่วนุคคล: `;
                            if (xxx.classify[i].classify[0].classify_type_data_in_event_personal == 1) {
                                html_text_table1_tbody += `มี <br> `;
                            } else {
                                html_text_table1_tbody += `ไม่มี <br> `;
                            }
                            html_text_table1_tbody += `ข้อมูลอ่อนไหว: `;
                            if (xxx.classify[i].classify[0].classify_type_data_in_event_special_personal_sensitive == 1) {
                                html_text_table1_tbody += `มี <br> `;
                            } else {
                                html_text_table1_tbody += `ไม่มี <br> `;
                            }
                            html_text_table1_tbody += `ฐานการประมวลผล: `;
                            if (xxx.classify[i].classify[0].pattern_processing_base_id) {
                                html_text_table1_tbody += xxx.classify[i].classify[0].pattern_processing_base_id + `<br> `;
                            } else {
                                html_text_table1_tbody += `ไม่มี <br> `;
                            }
                            html_text_table1_tbody += `เงื่อนไขพิเศษ: `;
                            if (xxx.classify[i].classify[0].classification_special_conditions_id) {
                                html_text_table1_tbody += xxx.classify[i].classify[0].classification_special_conditions_id + `<br> `;
                            } else {
                                html_text_table1_tbody += `ไม่มี <br> `;
                            }
                            html_text_table1_tbody += `กำหนดเวลาเข้าถึงข้อมูล: `;
                            if (xxx.classify[i].classify[0].classify_protect_data_limit_follow_datetime == 1) {
                                html_text_table1_tbody += `จ-ศ 08.00-17.00 <br> `;
                            } else {
                                html_text_table1_tbody += `ไม่มี <br> `;
                            }
                            html_text_table1_tbody += `2 factor: `;

                            if (xxx.classify[i].classify[0].classify_approach_protect_used_two_factor_from_google_authen == 1 || xxx.classify[i].classify[0].classify_approach_protect_used_two_factor_from_google_authen == 1 || xxx.classify[i].classify[0].classify_approach_protect_used_two_factor_from_sms == 1) {
                                if (xxx.classify[i].classify[0].classify_approach_protect_used_two_factor_from_google_authen == 1) {
                                    html_text_table1_tbody += `google-authen `;
                                }
                                if (xxx.classify[i].classify[0].classify_approach_protect_used_two_factor_from_google_authen == 1) {
                                    html_text_table1_tbody += `email `;
                                }
                                if (xxx.classify[i].classify[0].classify_approach_protect_used_two_factor_from_sms == 1) {
                                    html_text_table1_tbody += `sms `;
                                }
                            } else {
                                html_text_table1_tbody += `ไม่มี `;
                            }
                            html_text_table1_tbody += `<br> `;
                            html_text_table1_tbody += `ตรวจสอบโดย DPO:  `;
                            html_text_table1_tbody += `<br> `;
                            html_text_table1_tbody += `ข้อมูลส่วนุคคล สามารถระบุตัวบุคคลได้: `;
                            if (xxx.classify[i].classify[0].classify_risk_assess_only_dpo_data_personal_can_specify == 1) {
                                html_text_table1_tbody += `ได้โดยตรง <br> `;
                            } else {
                                html_text_table1_tbody += `ไม่ได้โยตรง <br> `;
                            }
                            html_text_table1_tbody += `ปริมาณข้อมูลทั้งหมดที่ใช้ประมวลผล: `;
                            if (xxx.classify[i].classify[0].classify_risk_assess_only_dpo_data_number_all_used_process_many == 1) {
                                html_text_table1_tbody += `มาก <br> `;
                            } else {
                                html_text_table1_tbody += `น้อย <br> `;
                            }
                            html_text_table1_tbody += `การควบคุมการเข้าถึงข้อมูลใน Alltra: `;
                            if (xxx.classify[i].classify[0].classify_risk_assess_only_dpo_access_control_inside == 1) {
                                html_text_table1_tbody += `มี <br> `;
                            } else {
                                html_text_table1_tbody += `ไม่มี <br> `;
                            }
                            html_text_table1_tbody += `การควบคุมการเข้าถึงข้อมูลระบบนอก Alltra: `;
                            if (xxx.classify[i].classify[0].classify_risk_assess_only_dpo_access_control_outside == 1) {
                                html_text_table1_tbody += `มี <br> `;
                            } else {
                                html_text_table1_tbody += `ไม่มี <br> `;
                            }
                            html_text_table1_tbody += `การป้องกันข้อมูลใน Alltra: `;
                            if (xxx.classify[i].classify[0].classify_risk_assess_only_dpo_protect_data_inside == 1) {
                                html_text_table1_tbody += `มี <br> `;
                            } else {
                                html_text_table1_tbody += `ไม่มี <br> `;
                            }
                            html_text_table1_tbody += `การป้องกันข้อมูลจากระบบนอก Alltra: `;
                            if (xxx.classify[i].classify[0].classify_risk_assess_only_dpo_protect_data_outside == 1) {
                                html_text_table1_tbody += `มี <br> `;
                            } else {
                                html_text_table1_tbody += `ไม่มี <br> `;
                            }
                            html_text_table1_tbody += `วิธีการแก้ไขเมื่อเกิดข้อมูลรั่วไหลหรือผลกระทบต่อเจ้าของข้อมูล: ` + xxx.classify[i].classify[0].classify_risk_assess_only_dpo_fix_a_leak_of_data + `<br>`;
                            html_text_table1_tbody += `วิธีการแก้ไขเมื่อเกิดข้อมูลรั่วไหลหรือผลกระทบต่อองค์กร: ` + xxx.classify[i].classify[0].classify_risk_assess_only_dpo_fix_a_leak_of_organization + `<br>`;
                            // html_text_table1_tbody += `</div></div>`;
                        }
                    }
                    html_text_table1_tbody += `</td>`;
                    if (xxx.classify_doc_id_person_data_pattern_name.length > 0) {
                        // html_text_table1_tbody += `<td>` + xxx.classify_doc_id_person_data_pattern_name[xxx.classify_doc_id_person_data_pattern_name.length - 1] + `</td>`;
                        html_text_table1_tbody += `<td>`;
                                html_text_table1_tbody += `มีข้อมูลจำนวน ` + xxx.classify_doc_id_person_data_pattern_name[xxx.classify_doc_id_person_data_pattern_name.length - 1].length + ` ข้อมูล<br>`;
                                if (xxx.classify_doc_id_person_data_pattern_name[xxx.classify_doc_id_person_data_pattern_name.length - 1].length > 0) {
                                    for (let x = 0; x < xxx.classify_doc_id_person_data_pattern_name[xxx.classify_doc_id_person_data_pattern_name.length - 1].length; x++) {
                                        html_text_table1_tbody += x + 1 + `. `;
                                        html_text_table1_tbody += xxx.classify_doc_id_person_data_pattern_name[xxx.classify_doc_id_person_data_pattern_name.length - 1][x] + `<br>`;

                                    }

                                }
                                html_text_table1_tbody += `</td>`;

                    } else {
                        html_text_table1_tbody += `<td>` + `</td>`;

                    }
                    html_text_table1_tbody += `</tr>`;


                });

                html_text_table1_tbody += `    
            </tbody>
        </table>
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
            th {
                font-size:14px;
              }
            td {
              font-size:12px;
            }
            .highlight {
                background-color: yellow;
              }
        </style>
    </div>`;

                // search
                var name_user = ($('#select-users')[0].selectedOptions[0].label);



                let regex1 = new RegExp($('#select-users')[0].selectedOptions[0].label, "ig");
                // html_text_table1_tbody = html_text_table1_tbody.replace(regex1, `<mark>`+name_user+`</mark>`);
                html_text_table1_tbody = html_text_table1_tbody.replace(regex1, `<mark class="highlight">${name_user}</mark>`);

                // let regex1 = new RegExp(hostorigin, "ig");
                // text = text.replace(regex1, hostimage);



                $('#show_flow').append(html_text_table1_tbody);

                // let text = document.getElementById("show_flow").innerHTML;
                // let regex1 = new RegExp(name_user, "ig");

                // let resultx = text.replace(regex1, "red");
                // document.getElementById("show_flow").innerHTML = resultx;



                // highlight($('#select-users')[0].selectedOptions[0].label)


            } else {
                $('#show_flow').append(`<p style="color:red; text-align: center">ไม่พบข้อมูล...</p>`);
            }

        },
        error: function (e) {
        }
    });
}





function select_personal_data() {
    var id_personal_data = $('#select-personal-data').val();
    var name_personal_data = $('#select-personal-data').select()[0].selectedOptions[0].label;
    $('#option_personal_data_' + id_personal_data).hide();
    $('#input_personal_data').append(`
                                        <div id="input_personal_data_`+ id_personal_data + `" class="input-group mb-3">
                                            <div class="input-group-prepend" style="width: 25%;">
                                                <button class="btn btn-light-info text-info" type="button" onclick="$('#input_input_personal_data_`+ id_personal_data + `').select();"
                                                    style="width: 100%;">
                                                    `+ name_personal_data + `
                                                </button>
                                            </div>
                                            <input  id="input_input_personal_data_`+ id_personal_data + `" type="text" class="form-control input_input_personal_data" placeholder="" aria-label=""
                                                aria-describedby="basic-addon1" name="personal_data_details">
                                            <button class="btn btn-light-danger text-danger" type="button"
                                                onclick="$('#option_personal_data_`+ id_personal_data + `').show(),$('#input_personal_data_` + id_personal_data + `').remove(),chack_select_personal_data()">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                    class="feather feather-trash-2 fill-white feather-sm">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path
                                                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                                                    </path>
                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                            </button>
                                        </div>
    `);
    $('#select-personal-data').val("");
    chack_select_personal_data();
}


function chack_select_personal_data() {
    var class_pd = $('.input_input_personal_data');
    var text_pd = [];
    for (let i = 0; i < class_pd.length; i++) {
        text_pd.push(class_pd[i].id.split("input_input_personal_data_")[1]);
    }
    $('#input_select_personal_data').val(text_pd);

}


// function highlight(text) {
//     var inputText = document.querySelector("#show_flow");
//     var innerHTML = inputText.innerHTML;
//     var index = innerHTML.indexOf(text);
//     if (index > -1) {
//         innerHTML = innerHTML.substring(0, index) + "<span class='highlight'>" + innerHTML.substring(index, index + text.length) + "</span>" + innerHTML.substring(index + text.length);
//         inputText.innerHTML = innerHTML;
//     }
// }


