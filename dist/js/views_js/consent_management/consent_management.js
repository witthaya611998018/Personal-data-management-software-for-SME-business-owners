/* eslint-disable no-undef */
/* eslint-disable eqeqeq */
const dateDefault = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  document.getElementById('firstDay').value = firstDay.toLocaleDateString('en-GB').split('/').reverse().join('-');
  document.getElementById('lastDay').value = lastDay.toLocaleDateString('en-GB').split('/').reverse().join('-');
};

function getdata() {
  dateDefault();
  $.ajax({
    type: 'post',
    url: '/api/all/consent/management',
    async success(result) {
      if (result.data_null == 'ไม่มีข้อมูล') {
        await ready_datanull(result.cookiepolicy);
      } else {
        await Tabeldata_email(result.email_consent);
        await Tabeldata_cookie(result.log_cookiepolicy, result);
        await Tabeldata_paper(result.select_document_consent);
      }
    },
    error(e) {
      console.log(e);
    },
  });
}
getdata();

function editCookietype(data) {
  $('#id_cp').val($(data).closest('tr').find('td').eq(0)
    .attr('class'));
  $('#name_cp_id').val($(data).closest('tr').find('td').eq(1)
    .text()
    .trim());
  $('#detail_cp_id').val($(data).closest('tr').find('td').eq(2)
    .text()
    .trim());
}

const Search_data = class Search_date_text {
  cookie_consent(data) {
    let url = '';
    if (data.text) {
      url = 'text';
    } else {
      url = 'date';
    }
    $.ajax({
      type: 'post',
      contentType: 'application/json',
      url: `/api/cookie/consent/management/search/${url}`,
      data: JSON.stringify(data),
      dataType: 'json',
      async success(result) {
        if (result == 'ไม่มีข้อมูล') {
          document.getElementById('Cookie-consent').innerHTML = '-';
          $('#Cookie-consent-icon').removeClass().addClass('css-bar mb-0 css-bar-warning css-bar-0');
          $('#table-body-cookie').empty().append(`
                    <tr>
                        <td colspan="20" class="text-center" style="border: none;">
                             <b class="text-danger">ไม่พบข้อมูล</b>
                         </td>
                    </tr>`);
        } else {
          $('#table_sortable_cookie').remove();
          await Tabeldata_cookie(result.log_cookiepolicy, result);
        }
      },
      error(e) {
        console.log(e);
      },
    });
  }

  paper_consent(data) {
    let url = '';
    if (data.text) {
      url = 'text';
    } else {
      url = 'date';
    }
    $.ajax({
      type: 'post',
      contentType: 'application/json',
      url: `/api/paper/consent/management/search/${url}`,
      data: JSON.stringify(data),
      dataType: 'json',
      async success(result) {
        if (result == 'ไม่มีข้อมูล') {
          document.getElementById('Paper-Consent').innerHTML = '-';
          $('#Paper-Consent-icon').removeClass().addClass('css-bar mb-0 css-bar-secondary css-bar-0');
          $('#table-body-paper').empty().append(`
                    <tr>
                        <td colspan="20" class="text-center" style="border: none;">
                             <b class="text-danger">ไม่พบข้อมูล</b>
                         </td>
                    </tr>`);
        } else {
          $('#table_sortable_paper').remove();
          await Tabeldata_paper(result.select_document_consent);
        }
      },
      error(e) {
        console.log(e);
      },
    });
  }

  email_consent(data) {
    let url = '';
    if (data.text) {
      url = 'text';
    } else {
      url = 'date';
    }
    $.ajax({
      type: 'post',
      contentType: 'application/json',
      url: `/api/email/consent/management/search/${url}`,
      data: JSON.stringify(data),
      dataType: 'json',
      async success(result) {
        if (result == 'ไม่มีข้อมูล') {
          document.getElementById('email-month').innerText = '-';
          $('#email-month-icon').removeClass().addClass('css-bar mb-0 css-bar-info css-bar-0');
          $('#table-body-mail').empty().append(`
                    <tr>
                        <td colspan="20" class="text-center" style="border: none;">
                             <b class="text-danger">ไม่พบข้อมูล</b>
                         </td>
                    </tr>`);
        } else {
          $('#table_sortable_email').remove();
          await Tabeldata_email(result.email_consent);
        }
      },
      error(e) {
        console.log(e);
      },
    });
  }
};

const My_Class = new Search_data();
document.getElementById('Search_Date').addEventListener('click', () => {
  const data = {
    date_first: document.getElementById('firstDay').value,
    date_last: document.getElementById('lastDay').value,
  };
  const tab_consent = document.querySelectorAll('#tab-consent')[0].getElementsByClassName('active')[0].getAttribute('href');
  if (tab_consent == '#cookie') {
    My_Class.cookie_consent(data);
  } else if (tab_consent == '#paper') {
    My_Class.paper_consent(data);
  } else {
    My_Class.email_consent(data);
  }
});

document.getElementById('Search_text').addEventListener('click', () => {
  const data = {
    date_first: document.getElementById('firstDay').value,
    date_last: document.getElementById('lastDay').value,
    text: document.getElementById('Input_text').value.trim(),
  };
  const tab_consent = document.querySelectorAll('#tab-consent')[0].getElementsByClassName('active')[0].getAttribute('href');
  if (tab_consent == '#cookie') {
    My_Class.cookie_consent(data);
  } else if (tab_consent == '#paper') {
    My_Class.paper_consent(data);
  } else {
    My_Class.email_consent(data);
  }
});

document.getElementById('reface').addEventListener('click', () => {
  $('#Input_text').val(null);
  const url = document.querySelectorAll('#tab-consent')[0].getElementsByClassName('active')[0].getAttribute('href').replace('#', '');
  window.location.href = `/consent/management/${url}`;
});

async function ready_datanull(data) {
  var content = '<table class="no-wrap table-striped table-bordered table-hover table" id="table_sortable_email">';
  content += '<thead id="table-thead-email"> </thead>' + '<tbody id="table-body-mail"></tbody>';
  content += '</table>';
  $('#Email_consent').append(content);
  var table = $('#table-body-mail');
  var table_thead = $('#table-thead-email');
  var thead = `<tr>
 <th>ลำดับ</th>
 <th>อีเมล</th>
 <th>หัวข้ออีเมล</th>
 <th>วันที่ส่ง</th>
 <th>วันที่ตอบกลับ</th>
 <th>สถานะ</th>
</tr>`;
  table_thead.append(thead);
  $('#table-body-mail').empty().append(`
    <tr>
        <td colspan="20" class="text-center" style="border: none;">
             <b class="text-danger">ไม่พบข้อมูล</b>
         </td>
    </tr>`);

  let content_paper = '<table class="no-wrap table-striped table-bordered table-hover table" id="table_sortable_paper">';
  content_paper += '<thead id="table-thead-paper"> </thead>' + '<tbody id="table-body-paper"></tbody>';
  content_paper += '</table>';
  $('#paper_consents').append(content_paper);
  const table_paper = $('#table-body-paper');
  const table_thead_paper = $('#table-thead-paper');
  const thead_paper = `<tr>
        <th>ลำดับ</th>
        <th>ชื่อเอกสาร</th>
        <th>วันที่สร้าง</th>
        <th>วันที่ตอบกลับ</th>
        <th>สถานะ</th>
        </tr>`;
  table_thead_paper.append(thead_paper);
  $('#table-body-paper').empty().append(`
    <tr>
        <td colspan="20" class="text-center" style="border: none;">
             <b class="text-danger">ไม่พบข้อมูล</b>
         </td>
    </tr>`);

  var content = '<table class="no-wrap table-striped table-bordered table-hover table" id="table_sortable_cookie">';
  content += '<thead id="table-thead-cookie"> </thead>' + '<tbody id="table-body-cookie"></tbody>';
  content += '</table>';
  $('#cookie_consent').append(content);
  var table = $('#table-body-cookie');
  var table_thead = $('#table-thead-cookie');
  let thead_cookie;
  for (let i = 0; i < data.length; i++) {
    thead_cookie += `<th>${data[i].name_cp}</th>`;
  }
  var thead = '<tr>'
    + '<th>ลำดับ</th>'
    + '<th>ชื่อโดเมน</th>'
    + '<th>ไอพีแอดเดรส</th>'
    + '<th>เบราว์เซอร์</th>'
    + '<th>เซสชั่นไอดี</th>'
    + `<th>วันที่ตอบกลับ</th>${thead_cookie

    }<th>เเก้ไข</th>`
    + '</tr >';
  table_thead.append(thead);
  $('#table-body-cookie').empty().append(`
    <tr>
        <td colspan="20" class="text-center" style="border: none;">
             <b class="text-danger">ไม่พบข้อมูล</b>
         </td>
    </tr>`);
}

async function Tabeldata_email(data) {
  if (data.length > 0) {
    const dataTable = [];
    let length_email = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].email_check_send === 1) {
        length_email += 1;
      }
      dataTable.push({
        no: (i + 1),
        date_inbox: data[i].date_inbox,
        email_date_consent: data[i].email_date_consent,
        subject: data[i].email_subject,
        status: data[i].email_status,
        to: data[i].email_to,
        email_status: data[i].email_status,
        id_email: data[i].id_email,
        email_check_send: data[i].email_check_send,
        email_firstname: data[i].email_firstname,
        email_lastname: data[i].email_lastname,
        doc_name: data[i].doc_name,
      });
    }
    if (length_email != 0) {
      document.getElementById('email-month').innerText = length_email;
      $('#email-month-icon').removeClass().addClass('css-bar mb-0 css-bar-info css-bar-100');
    } else {
      $('#email-month-icon').removeClass().addClass('css-bar mb-0 css-bar-info css-bar-0');
    }
    const state = {
      querySet: dataTable,
      page: 1,
      rows: 30, // จำนวน row
      window: 10000, // จำนวนหน้าที่เเสดง
    };
    buildTable();
    function pagination(querySet, page, rows) {
      const trimStart = (page - 1) * rows;
      const trimEnd = trimStart + rows;
      const trimmedData = querySet.slice(trimStart, trimEnd);
      const pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
      return {
        querySet: trimmedData,
        pages,
      };
    }
    function pageButtons(pages) {
      const wrapper = document.querySelector('.pagination-email');
      wrapper.innerHTML = '';
      let maxLeft = (state.page - Math.floor(state.window / 2));
      let maxRight = (state.page + Math.floor(state.window / 2));

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

      //     // เช็คหน้าเเรก (ปุ่มย้อนกลับ)
      const num = 1;
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
              wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`;
            } else {
              wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`;
            }
          }
        }
        if ((state.page) <= (maxRight / 2)) {
          mp = maxRight - 1;
          wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
          wrapper.innerHTML += `<li class="page-item "><button class="page page-link" value=${maxRight}>${maxRight}</button></li>`;
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
        wrapper.innerHTML = `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>${wrapper.innerHTML}`;
      } else {
        wrapper.innerHTML = `<li value=${state.page - 1} class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>${wrapper.innerHTML}`;
      }
      // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
      if (state.page == pages) {
        wrapper.innerHTML += '<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>';
      } else {
        wrapper.innerHTML += `<li value=${state.page + 1} class="page page-item"><button class="page-link">ถัดไป</button></li>`;
      }

      $('.page').on('click', function () {
        $('#table-body-mail').empty();
        $('#table-thead-email').empty();
        $('#table_sortable_email').remove();
        state.page = Number($(this).val());
        buildTable();
      });
    }
    function buildTable() {
      let content = '<table class="no-wrap table-striped table-bordered table-hover table" id="table_sortable_email">';
      content += '<thead id="table-thead-email"> </thead>' + '<tbody id="table-body-mail"></tbody>';
      content += '</table>';
      $('#Email_consent').append(content);
      const table = $('#table-body-mail');
      const table_thead = $('#table-thead-email');
      const data = pagination(state.querySet, state.page, state.rows);
      const myList = data.querySet;
      const show = [];
      const thead = `<tr>
         <th>ลำดับ</th>
         <th>อีเมล</th>
         <th>หัวข้ออีเมล</th>
         <th>ชื่อ-นามสกุล ผู้รับ</th>
         <th>วันที่ส่ง</th>
         <th>วันที่ตอบกลับ</th>
         <th>สถานะ</th>
         <th>เเก้ไข</th>
        </tr>`;
      table_thead.append(thead);
      for (const i in myList) {
        var status;
        var edit;
        if (myList[i].email_status == 1) {
          status = '<i class="fas fa-check fa-2x text-success"></i>';
          if (myList[i].email_check_send == 1) {
            edit = `<a  class="text-warning" onclick="notAgree(${myList[i].id_email})"><i class="fas fa-pencil-alt fa-2x"></i></a>`;
          } else {
            edit = '<a  class="text-secondary"><i class="fas fa-pencil-alt fa-2x"></i></a>';
          }
        } else {
          status = '<i class="fas fa-times fa-2x text-danger"></i>';
          if (myList[i].email_check_send == 1) {
            edit = `<a  class="text-warning" onclick="Approve(${myList[i].id_email})"><i class="fas fa-pencil-alt fa-2x"></i></a>`;
          } else {
            edit = '<a  class="text-secondary"><i class="fas fa-pencil-alt fa-2x"></i></a>';
          }
        }
        const row = `<tr><td>${myList[i].no
          }</td><td id="email_${myList[i].id_email}">  ${myList[i].to} `
          + `</td><td>${myList[i].subject
          }</td><td>${myList[i].email_firstname} ${myList[i].email_lastname
          }</td><td>${myList[i].date_inbox
          }</td><td>${myList[i].email_date_consent
          }</td><td>${status
          }</td><td>${edit
          }</td></tr>`;
        table.append(row);
        show.push(myList[i].no);
      }
      document.querySelector('#show-email').innerHTML = show[0]; //  แสดงถึง row เเรกของหน้า
      document.querySelector('#to_show-email').innerHTML = show[show.length - 1]; //  แสดงถึง row สุดท้ายของหน้า
      document.querySelector('#show_all-email').innerHTML = state.querySet.length; //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
      pageButtons(data.pages);
    }
  } else {
    let content = '<table class="no-wrap table-striped table-bordered table-hover table" id="table_sortable_email">';
    content += '<thead id="table-thead-email"> </thead>' + '<tbody id="table-body-mail"></tbody>';
    content += '</table>';
    $('#Email_consent').append(content);
    const table = $('#table-body-mail');
    const table_thead = $('#table-thead-email');
    const thead = `<tr>
     <th>ลำดับ</th>
     <th>อีเมล</th>
     <th>หัวข้ออีเมล</th>
     <th>วันที่ส่ง</th>
     <th>วันที่ตอบกลับ</th>
     <th>สถานะ</th>
    </tr>`;
    table_thead.append(thead);
    table.append(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
                <b class="text-danger">ไม่พบข้อมูล</b>
            </td>
        </tr>`);
  }
}

async function Tabeldata_cookie(data, data1) {
  if (data.length > 0) {
    console.log(data);
    var data_cookiepolicy = data1.cookiepolicy;
    const log_cookiepolicy = [];
    const cookie_limit = [];
    for (let i = 0; i < data.length; i++) {
      log_cookiepolicy.push({
        no: (i + 1),
        id_dg: data[i].id_dg,
        id_lsc: data[i].id_lsc,
        id_policylog: data[i].id_policylog,
        cookiepolicy: data[i].cookiepolicy,
        day: data[i].policylog_date,
        namedomain_dg: data[i].namedomain_dg,
        policylog_browser: data[i].policylog_browser,
        policylog_ip: data[i].policylog_ip,
        policylog_sessionid: data[i].policylog_sessionid,
        check_edit_consent: data[i].check_edit_consent,
      });
      cookie_limit.push(data[i].namedomain_dg);
    }
    const limit = [...new Set(cookie_limit)];
    document.getElementById('Cookie-consent').innerHTML = data.length;
    $('#Cookie-consent-icon').removeClass().addClass('css-bar mb-0 css-bar-warning css-bar-100');
    const state = {
      querySet: log_cookiepolicy,
      page: 1,
      rows: 30, // จำนวน row
      window: 10000, // จำนวนหน้าที่เเสดง
    };
    buildTable();
    function pagination(querySet, page, rows) {
      const trimStart = (page - 1) * rows;
      const trimEnd = trimStart + rows;
      const trimmedData = querySet.slice(trimStart, trimEnd);
      const pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
      return {
        querySet: trimmedData,
        pages,
      };
    }

    function pageButtons(pages) {
      const wrapper = document.querySelector('.pagination-cookie');
      wrapper.innerHTML = '';
      let maxLeft = (state.page - Math.floor(state.window / 2));
      let maxRight = (state.page + Math.floor(state.window / 2));

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
      const num = 1;
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
              wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`;
            } else {
              wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`;
            }
          }
        }
        if ((state.page) <= (maxRight / 2)) {
          mp = maxRight - 1;
          wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
          wrapper.innerHTML += `<li class="page-item "><button class="page page-link" value=${maxRight}>${maxRight}</button></li>`;
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
        wrapper.innerHTML = `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>${wrapper.innerHTML}`;
      } else {
        wrapper.innerHTML = `<li value=${state.page - 1} class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>${wrapper.innerHTML}`;
      }

      // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
      if (state.page == pages) {
        wrapper.innerHTML += '<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>';
      } else {
        wrapper.innerHTML += `<li value=${state.page + 1} class="page page-item"><button class="page-link">ถัดไป</button></li>`;
      }

      $('.page').on('click', function () {
        $('#table-body-cookie').empty();
        $('#table-thead-cookie').empty();
        $('#table_sortable_cookie').remove(); // ลบ เพื่อไม่ให้มันสรา้ง row ใน table เปล่าขึ้นมา
        state.page = Number($(this).val());
        buildTable();
      });
    }

    function buildTable() {
      let content = '<table class="no-wrap table-striped table-bordered table-hover table" id="table_sortable_cookie">';
      content += '<thead id="table-thead-cookie"> </thead>' + '<tbody id="table-body-cookie"></tbody>';
      content += '</table>';
      $('#cookie_consent').append(content);
      const table = $('#table-body-cookie');
      const table_thead = $('#table-thead-cookie');
      let thead_cookie;
      for (let i = 0; i < data_cookiepolicy.length; i++) {
        thead_cookie += `<th>${data_cookiepolicy[i].name_cp}</th>`;
      }
      const thead = '<tr>'
        + '<th>ลำดับ</th>'
        + '<th>ชื่อโดเมน</th>'
        + '<th>ไอพีแอดเดรส</th>'
        + '<th>เบราว์เซอร์</th>'
        + '<th>เซสชั่นไอดี</th>'
        + `<th>วันที่ตอบกลับ</th>
        ${thead_cookie}<th>เเก้ไข</th>`
        + '</tr >';
      table_thead.append(thead);

      const data = pagination(state.querySet, state.page, state.rows);
      const myList = data.querySet;
      const show = [];

      for (const i in myList) {
        const td_cookie = [];
        for (const k in data_cookiepolicy) {
          if (myList[i].cookiepolicy[k] == 1) {
            td_cookie.push('<td><i class="fas fa-check fa-2x text-success"></i></td>');
          } else {
            td_cookie.push('<td><i class="fas fa-times fa-2x text-danger"></i></td>');
          }
        }
        var edit;
        if (myList[i].check_edit_consent == 1) {
          edit = `<td><a class="text-warning"  href="/consent/management/cookie/${myList[i].id_dg}"><i class="fas fa-pencil-alt fa-2x"></i></a></td> `;
        } else {
          edit = '<td><a class="text-secondary"><i class="fas fa-pencil-alt fa-2x"></i></a></td> ';
        }

        const row = '<tr>'
          + `<td>${myList[i].no}</td>`
          + `<td>${myList[i].namedomain_dg}</td>`
          + `<td>${myList[i].policylog_ip}</td>`
          + `<td>${myList[i].policylog_browser}</td>`
          + `<td>${myList[i].policylog_sessionid}</td>`
          + `<td>${myList[i].day}</td>${td_cookie
          }${edit}</tr>`;
        table.append(row);
        show.push(myList[i].no);
      }
      document.querySelector('#show-cookie').innerHTML = show[0]; //  แสดงถึง row เเรกของหน้า
      document.querySelector('#to_show-cookie').innerHTML = show[show.length - 1]; //  แสดงถึง row สุดท้ายของหน้า
      document.querySelector('#show_all-cookie').innerHTML = state.querySet.length; //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
      pageButtons(data.pages);
    }
  } else {
    var data_cookiepolicy = data1.cookiepolicy;
    let content = '<table class="no-wrap table-striped table-bordered table-hover table" id="table_sortable_cookie">';
    content += '<thead id="table-thead-cookie"> </thead>' + '<tbody id="table-body-cookie"></tbody>';
    content += '</table>';
    $('#cookie_consent').append(content);
    const table = $('#table-body-cookie');
    const table_thead = $('#table-thead-cookie');
    let thead_cookie;
    for (let i = 0; i < data_cookiepolicy.length; i++) {
      thead_cookie += `<th>${data_cookiepolicy[i].name_cp}</th>`;
    }
    const thead = '<tr>'
      + '<th>ลำดับ</th>'
      + '<th>ชื่อโดเมน</th>'
      + '<th>ไอพีแอดเดรส</th>'
      + '<th>เบราว์เซอร์</th>'
      + '<th>เซสชั่นไอดี</th>'
      + `<th>วันที่ตอบกลับ</th>${thead_cookie

      }<th>เเก้ไข</th>`
      + '</tr >';
    table_thead.append(thead);
    table.append(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
                <b class="text-danger">ไม่พบข้อมูล</b>
            </td>
        </tr>`);
  }
}

async function Tabeldata_paper(data) {
  if (data.length > 0) {
    const paper_consent = [];
    let count_paper = 0;
    for (let i = 0; i < data.length; i++) {
      paper_consent.push({
        no: (i + 1),
        doc_id: data[i].doc_id,
        doc_consent_id: data[i].doc_consent_id,
        doc_name: data[i].doc_name,
        doc_date_create: data[i].doc_date_create,
        doc_consent_status: data[i].doc_consent_status,
        consent_date: data[i].consent_date,
        consent_address: data[i].consent_address,
        consent_firstname: data[i].consent_firstname,
        consent_lastname: data[i].consent_lastname,
        consent_other: data[i].consent_other,
        consent_phone: data[i].consent_phone,
        consent_ckeck: data[i].consent_ckeck,
        consent_other_name: data[i].consent_other_name,
      });
      if (data[i].consent_ckeck == 1) {
        count_paper += 1;
      }
    }

    if (count_paper != 0) {
      document.getElementById('Paper-Consent').innerHTML = count_paper;
      $('#Paper-Consent-icon').removeClass().addClass('css-bar mb-0 css-bar-secondary css-bar-100');
    } else {
      $('#Paper-Consent-icon').removeClass().addClass('css-bar mb-0 css-bar-secondary css-bar-0');
    }

    const state = {
      querySet: paper_consent,
      page: 1,
      rows: 30, // จำนวน row
      window: 10000, // จำนวนหน้าที่เเสดง
    };
    buildTable();
    function pagination(querySet, page, rows) {
      const trimStart = (page - 1) * rows;
      const trimEnd = trimStart + rows;
      const trimmedData = querySet.slice(trimStart, trimEnd);
      const pages = Math.ceil(querySet.length / rows); // Math.ceil ปัดทศนิยมขึ้น Math.round ปัดทศนิยมลง
      return {
        querySet: trimmedData,
        pages,
      };
    }

    function pageButtons(pages) {
      const wrapper = document.querySelector('.pagination-paper');
      wrapper.innerHTML = '';
      let maxLeft = (state.page - Math.floor(state.window / 2));
      let maxRight = (state.page + Math.floor(state.window / 2));

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
      const num = 1;
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
              wrapper.innerHTML += `<li value=${page} class="page page-item active"><button class="page-link">${page}</button></li>`;
            } else {
              wrapper.innerHTML += `<li value=${page} class="page page-item "><button class="page-link">${page}</button></li>`;
            }
          }
        }
        if ((state.page) <= (maxRight / 2)) {
          mp = maxRight - 1;
          wrapper.innerHTML += '<li class="page-item disabled"><a class="page-link" href="javascript:void(0)">..</a></li>';
          wrapper.innerHTML += `<li class="page-item "><button class="page page-link" value=${maxRight}>${maxRight}</button></li>`;
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
        wrapper.innerHTML = `<li  class="page-item disabled"><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>${wrapper.innerHTML}`;
      } else {
        wrapper.innerHTML = `<li value=${state.page - 1} class="page page-item "><button class="page-link" tabindex="-1">ย้อนกลับ</button></li>${wrapper.innerHTML}`;
      }

      // เช็คหน้าสุดท้าย (ปุ่มถัดไป)
      if (state.page == pages) {
        wrapper.innerHTML += '<li  class=" page-item disabled"><button class="page-link">ถัดไป</button></li>';
      } else {
        wrapper.innerHTML += `<li value=${state.page + 1} class="page page-item"><button class="page-link">ถัดไป</button></li>`;
      }

      $('.page').on('click', function () {
        $('#table-body-paper').empty();
        $('#table-thead-paper').empty();
        $('#table_sortable_paper').remove(); // ลบ เพื่อไม่ให้มันสรา้ง row ใน table เปล่าขึ้นมา
        state.page = Number($(this).val());
        buildTable();
      });
    }

    function buildTable() {
      let content = '<table class="no-wrap table-striped table-bordered table-hover table" id="table_sortable_paper">';
      content += '<thead id="table-thead-paper"> </thead>' + '<tbody id="table-body-paper"></tbody>';
      content += '</table>';
      $('#paper_consents').append(content);
      const table = $('#table-body-paper');
      const table_thead = $('#table-thead-paper');
      const thead = `<tr>
                <th>ลำดับ</th>
                <th>ชื่อเอกสาร</th>
                <th>ชื่อ-นามสกุล</th>
                <th>ที่อยู่</th>
                <th>เบอร์โทรศัพท์</th>
                <th>อื่นๆ</th>
                <th>วันที่สร้าง</th>
                <th>วันที่ตอบกลับ</th>
                <th>สถานะ</th>
                <th>เเก้ไข</th>
                </tr>`;
      table_thead.append(thead);

      const data = pagination(state.querySet, state.page, state.rows);
      const myList = data.querySet;
      const show = [];

      for (const i in myList) {
        var td_paper;
        var edit;
        if (myList[i].doc_consent_status == 1) {
          td_paper = '<i class="fas fa-check fa-2x text-success"></i>';
          if (myList[i].consent_ckeck == 1) {
            edit = `<a class="text-warning" onclick="notAgree_paper(${myList[i].doc_consent_id})"><i class="fas fa-pencil-alt fa-2x"></i></a>`;
          } else {
            edit = '<a class="text-secondary" ><i class="fas fa-pencil-alt fa-2x"></i></a>';
          }
        } else {
          td_paper = '<i class="fas fa-times fa-2x text-danger"></i>';
          if (myList[i].consent_ckeck == 1) {
            edit = `<a  class="text-warning" onclick="Approve_paper(${myList[i].doc_consent_id})"><i class="fas fa-pencil-alt fa-2x"></i></a>`;
          } else {
            edit = '<a class="text-secondary" ><i class="fas fa-pencil-alt fa-2x"></i></a>';
          }
        }
        if (myList[i].consent_firstname == null) {
          myList[i].consent_firstname = '-';
        }
        if (myList[i].consent_firstname == null) {
          myList[i].consent_firstname = '-';
        }
        if (myList[i].consent_address == null) {
          myList[i].consent_address = '-';
        }

        if (myList[i].consent_phone == null) {
          myList[i].consent_phone = '-';
        }
        if (myList[i].consent_other_name == '') {
          myList[i].consent_other = '-';
        } else {
          myList[i].consent_other = `${myList[i].consent_other} ( ${myList[i].consent_other_name} )`;
        }
        const row = '<tr>'
          + `<td>${myList[i].no}</td>`
          + `<td id="paper_${myList[i].doc_consent_id}"> ${myList[i].doc_name} </td>`
          + `<td>${myList[i].consent_firstname} ${myList[i].consent_lastname}</td>`
          + `<td>${myList[i].consent_address}</td>`
          + `<td>${myList[i].consent_phone}</td>`
          + `<td>${myList[i].consent_other}</td>`
          + `<td>${myList[i].doc_date_create}</td>`
          + `<td>${myList[i].consent_date}</td>`
          + `<td>${td_paper}</td>`
          + `<td>${edit}</td>`
          + '</tr>';
        table.append(row);
        show.push(myList[i].no);
      }
      document.querySelector('#show-paper').innerHTML = show[0]; //  แสดงถึง row เเรกของหน้า
      document.querySelector('#to_show-paper').innerHTML = show[show.length - 1]; //  แสดงถึง row สุดท้ายของหน้า
      document.querySelector('#show_all-paper').innerHTML = state.querySet.length; //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
      pageButtons(data.pages);
    }
  } else {
    let content_paper = '<table class="no-wrap table-striped table-bordered table-hover table" id="table_sortable_paper">';
    content_paper += '<thead id="table-thead-paper"> </thead>' + '<tbody id="table-body-paper"></tbody>';
    content_paper += '</table>';
    $('#paper_consents').append(content_paper);
    const table_paper = $('#table-body-paper');
    const table_thead_paper = $('#table-thead-paper');
    const thead_paper = `<tr>
            <th>ลำดับ</th>
            <th>ชื่อเอกสาร</th>
            <th>วันที่สร้าง</th>
            <th>วันที่ตอบกลับ</th>
            <th>สถานะ</th>
            </tr>`;
    table_thead_paper.append(thead_paper);
    table_paper.append(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
                <b class="text-danger">ไม่พบข้อมูล</b>
            </td>
        </tr>`);
  }
}

function Approve(id) {
  const email = document.getElementById(`email_${id}`).innerText;
  const data = ({
    id,
    edit: 'notAgree',
  });
  Swal.fire({
    html: `
        <font style="font-size: x-large;font-weight: 500;">ปรับสถานะจาก <a style="font-weight: 600;color:#f62d51"">ไม่ยินยอม</a> เป็น <a style="font-weight: 600;color:#39c449">ยินยอม</a>  </font>
        <br>
        อีเมล : ${email}
        `,
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#39c449',
    confirmButtonText: 'ตกลง',
  }).then((result) => {
    if (result.value) {
      Swal.fire(
        'สำเร็จ',
        '',
        'success',
      ),
        $.ajax({ // ready get api date
          type: 'POST',
          contentType: 'application/json',
          url: '/api/email/consent/management/edit',
          // data: data,
          data: JSON.stringify(data),
          dataType: 'json',
          async success(result) {
            $('#table_sortable_email').remove();
            await Tabeldata_email(result.email_consent, result.limit_email);
          },
          error(e) {
            console.log(e);
          },
        });
    }
  });
}

function notAgree(id) {
  const email = document.getElementById(`email_${id}`).innerText;
  const data = ({
    id,
    edit: 'approve',
  });
  Swal.fire({
    // title: 'ปรับสถานะจาก ยินยอม เป็น ไม่ยินยอม' + `<b></b>`,
    // html: `<b>ปรับสถานะจาก</b>`,
    html: `
        <font style="font-size: x-large;font-weight: 500;">ปรับสถานะจาก <a style="font-weight: 600;color:#39c449"">ยินยอม</a> เป็น <a style="font-weight: 600;color:#f62d51">ไม่ยินยอม</a>  </font>
        <br>
        อีเมล : ${email}
        `,
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#39c449',
    confirmButtonText: 'ตกลง',
  }).then((result) => {
    if (result.value) {
      Swal.fire(
        'สำเร็จ',
        '',
        'success',
      ),
        $.ajax({ // ready get api date
          type: 'POST',
          contentType: 'application/json',
          url: '/api/email/consent/management/edit',
          // data: data,
          data: JSON.stringify(data),
          dataType: 'json',
          async success(result) {
            $('#table_sortable_email').remove();
            await Tabeldata_email(result.email_consent, result.limit_email);
          },
          error(e) {
            console.log(e);
          },
        });
    }
  });
}

function Approve_paper(id) {
  const paper = document.getElementById(`paper_${id}`).innerText.trim();
  const data = ({
    id,
    edit: 'approve',

  });
  Swal.fire({
    html: `
        <font style="font-size: x-large;font-weight: 500;">ปรับสถานะจาก <a style="font-weight: 600;color:#f62d51"">ไม่ยินยอม</a> เป็น <a style="font-weight: 600;color:#39c449">ยินยอม</a>  </font>
        <br>
        เอกสาร : ${paper}
        `,
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#39c449',
    confirmButtonText: 'ตกลง',
  }).then((result) => {
    if (result.value) {
      Swal.fire(
        'สำเร็จ',
        '',
        'success',
      );
      $.ajax({ // ready get api date
        type: 'POST',
        contentType: 'application/json',
        url: '/api/paper/consent/management/edit',
        data: JSON.stringify(data),
        dataType: 'json',
        async success(result) {
          $('#table_sortable_paper').remove();
          await Tabeldata_paper(result);
        },
        error(e) {
          console.log(e);
        },
      });
    }
  });
}

function notAgree_paper(id) {
  const paper = document.getElementById(`paper_${id}`).innerText;
  const data = ({
    id,
    // "edit": "approve"
    edit: 'notAgree',

  });
  Swal.fire({
    // title: 'ปรับสถานะเป็น : ยกเลิก',
    // text: "เอกสาร : " + email,
    html: `
        <font style="font-size: x-large;font-weight: 500;">ปรับสถานะจาก <a style="font-weight: 600;color:#39c449"">ยินยอม</a> เป็น <a style="font-weight: 600;color:#f62d51">ไม่ยินยอม</a>  </font>
        <br>
        เอกสาร : ${paper}
        `,
    type: 'warning',
    showCancelButton: true,
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#39c449',
    confirmButtonText: 'ตกลง',
  }).then((result) => {
    if (result.value) {
      Swal.fire(
        'สำเร็จ',
        '',
        'success',
      ),
        $.ajax({ // ready get api date
          type: 'POST',
          contentType: 'application/json',
          url: '/api/paper/consent/management/edit',
          data: JSON.stringify(data),
          dataType: 'json',
          async success(result) {
            $('#table_sortable_paper').remove();
            await Tabeldata_paper(result);
          },
          error(e) {
            console.log(e);
          },
        });
    }
  });
}
