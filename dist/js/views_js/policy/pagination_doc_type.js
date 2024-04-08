var _no_ = $('#doc_type1').val().split(",");
var _name_ = $('#doc_type2').val().split(",");
var _check_ = $('#doc_check').val().split(",");
var _page_ = $('#page').val();
var _page1_ = $('#page1').val();
// var _list_ = $('#items2').attr('data-method').split("_");

// ============================== Create Object ============================
let doc_type = [];

for (var i = 0; i < _no_.length; i++) {
    doc_type.push({
        "no": (i + 1),
        "doc_type_id": _no_[i],
        "doc_type_name": _name_[i],
        "check": _check_[i]
    });
}

// for (var i = 0; i < block.length; i++) {
//     let convert_list = block[i].list.split(',')
//     let list_ = []
//     for (var j = 0; j < convert_list.length; j += 3) {
//         list_.push(list(convert_list, j))
//     }
//     block[i].list = list_
// }
// ============================== Create Prepare ============================
var end_count = 0 // จำนวนทั้งหมดในแต่ละหน้า
var total = 0 // จำนวนทั้งหมดของข้อมูล


// state = 
// querySet : array(15) ,
// page : rows  = 1:5 

var state = {
    'querySet': doc_type,
    'page': 1,
    'rows': 50,
    'window': 10000,
}

buildTable()

function pagination(querySet, page, rows) {

    var trimStart = (page - 1) * rows
    var trimEnd = trimStart + rows

    var trimmedData = querySet.slice(trimStart, trimEnd)

    var pages = Math.ceil(querySet.length / rows);
    var start_count = 1
    document.getElementById('start').innerHTML = start_count

    return {
        'querySet': trimmedData,
        'pages': pages,
    }


}
// ============================== Create Pagination ============================
function pageButtons(pages) {
    var wrapper = document.getElementById('pagination-wapper')
    wrapper.innerHTML = ``
    // console.log('Pages:', pages)
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

    if (state.page > 1) {
        wrapper.innerHTML = `<li class="page-item"><button value=${state.page - 1} class="page page-link"> ย้อนกลับ</button></li>`
    } else {
        wrapper.innerHTML = `<li class="page-item disabled"><button value=${state.page - 1} class="page page-link" > ย้อนกลับ</button></li>`
    }


    num = 1
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
                    wrapper.innerHTML += `<li class="page-item active"><button class="page page-link" value=${page}>${page}</button></li>`;
                }
                else {
                    p = page - 1;
                    wrapper.innerHTML += `<li class="page-item "><button class="page page-link" value=${page}>${page}</button></li>`;
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
                wrapper.innerHTML += `<li class="page-item active"><button class="page page-link" value=${page}>${page}</button></li>`
            } else {
                wrapper.innerHTML += `<li class="page-item "><button class="page page-link" value=${page}>${page}</button></li>`
            }
        }
    }

    if (state.page < pages) {
        wrapper.innerHTML += `<li class="page-item"></i><button value=${state.page + 1} class="page page-link" >ถัดไป </button>`
    } else {
        wrapper.innerHTML += `<li class="page-item disabled"></i><button value=${state.page + 1} class="page page-link" >ถัดไป </button>`
    }

    $('.page').on('click', function () {
        $('#table-body').empty()
        state.page = Number($(this).val())
        // document.getElementById('page').value = state.page
        buildTable()
    })




}
// ============================== Create Table ============================
function buildTable() {
    var table = $('#table-body')
    var data = pagination(state.querySet, state.page, state.rows)
    var myList = data.querySet
    for (let y = 0; y < myList.length; y++) {
        if (myList[y].doc_type_name != "" && myList[y].doc_type_id != "") {
            let check = ""
            let status = ""
            if (myList[y].check == 0) {
                status = 'ข้อมูลพื้นฐาน'
                check = '<td class="align-top"><i class="fas fa-trash-alt fa-2x" style="color:gray"></i></td>'
            } else {
                status = 'เพิ่มข้อมูล'
                check = '<td class="align-top"><a id="' + myList[y].doc_type_id + '" href="#" onclick="deldoc_type(this.id)" class="text-danger" data-bs-toggle="modal" data-bs-target="#delete_doc_type"><i class="fas fa-trash-alt fa-2x"></i></a></td>'
               
            }
            //Keep in mind we are using "Template Litterals to create rows"
            var row = '<tr>' +
                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label">ลำดับที่:' +
                '</b> <span class="tablesaw-cell-content">' + myList[y].no + '</span></td>' +
                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label"></b> <span class="tablesaw-cell-content">' + myList[y].doc_type_name + '</span></td>' +
                '<td class="title align-top tablesaw-swipe-cellhidden tablesaw-swipe-cellpersist" ><b class="tablesaw-cell-label"></b> <span class="tablesaw-cell-content">' + status + '</span></td>' +
                '<td class="align-top"><a id="' + myList[y].doc_type_id + '" href="#" onclick="edoc_type(this.id)" class="text-warning" data-bs-toggle="modal" data-bs-target="#edit_doc_type"><i class="fas fa-pencil-alt fa-2x"></i></a></td>' +
                check +
                '</tr>'
            table.append(row)
            end_count = myList[y].no
        } else {
            var row = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty text-center" style="color: red;">ไม่พบข้อมูล</td></tr>'
            table.append(row)
        }
    }
    $('#end').html(end_count)
    if (myList[0].doc_type_name != "" && myList[0].doc_type_id != "") {
        $('#start').html(myList[0].no)
    } else {
        $('#start').html(0)
    }
    pageButtons(data.pages)

    // end_count = table.find('tr').length

}



function edoc_type(id) {
    const doc_type1 = document.getElementById("doc_type1").value
    const doc_type2 = document.getElementById('doc_type2').value
    let sort_doc_type_id = doc_type1.split(',')
    let sort_doc_type_name = doc_type2.split(',')
    let obj = []
    var edoc_type = document.getElementById("edoc_type");
    for (i in sort_doc_type_id) {
        obj.push({ "doc_type_id": sort_doc_type_id[i], "doc_type_name": sort_doc_type_name[i] })
    }
    for (var j = 0; j < obj.length; j++) {
        if (parseInt(id) == parseInt(obj[j].doc_type_id)) {
            edoc_type.innerHTML = '<input type="text" name="doc_type_name" placeholder="กรุณาป้อนประเภทเอกสาร.." class="form-control " value="' + obj[j].doc_type_name + '" required><div> <input type="hidden" name="doc_type_id" id="doc_type_id" value="' + obj[j].doc_type_id + '" required></div>'

        }
    }
}

function deldoc_type(id) {
    const doc_type1 = document.getElementById("doc_type1").value
    const doc_type2 = document.getElementById('doc_type2').value
    let sort_doc_type_id = doc_type1.split(',')
    let sort_doc_type_name = doc_type2.split(',')
    let obj = []
    var deletedoc_type = document.getElementById("deletedoc_type");
    for (i in sort_doc_type_id) {
        obj.push({ "doc_type_id": sort_doc_type_id[i], "doc_type_name": sort_doc_type_name[i] })
    }
    for (j in obj) {
        if (id == obj[j].doc_type_id) {
            deletedoc_type.innerHTML = ' <h5>' + obj[j].doc_type_name + ' </h5> ' + '<input type="hidden" name="doc_type_id" id="doc_type_id" value="' + obj[j].doc_type_id + '" >'
        }
    }
}







