
function editCookietype(data) {
    let form_edit = (document.getElementById('Edit-measures')).getElementsByTagName('input')

    form_edit[1].value = $(data).closest("tr").find("td").eq(0).attr('id')
    form_edit[0].value = $(data).closest("tr").find("td").eq(1).text().trim()
};

function delete_measures(data) {
    let form_edit = (document.getElementById('Delete-measures')).getElementsByTagName('input')
    let message = document.getElementById('Delete-measures').getElementsByTagName('label')[0]
    form_edit[0].value = $(data).closest("tr").find("td").eq(0).attr('id')
    message.innerHTML = $(data).closest("tr").find("td").eq(1).text().trim()
};

function edit_approach(data) {
    let input = (document.getElementById('Edit-Approach')).getElementsByTagName('input')
    let option = document.getElementById('Edit-Approach').getElementsByTagName('select')[0].getElementsByTagName('option')
    let check_option = $(data).closest("tr").find("td").eq(2).attr('id')
    input[0].value = $(data).closest("tr").find("td").eq(1).text().trim()
    input[1].value = $(data).closest("tr").find("td").eq(0).attr('id')
    if (check_option == 1) {
        option[0].selected = true
    } else {
        option[1].selected = true
    }
};

function delete_approach(data) {
    let input = (document.getElementById('Delete-Approach')).getElementsByTagName('input')
    let label = (document.getElementById('Delete-Approach')).getElementsByTagName('label')
    input[0].value = $(data).closest("tr").find("td").eq(0).attr('id')
    label[0].innerHTML = $(data).closest("tr").find("td").eq(1).text().trim()
    label[1].innerHTML = $(data).closest("tr").find("td").eq(2).text().trim()
};

function edite_assets(data) {
    let form = (document.getElementById('Edit-Assets')).getElementsByTagName('input')
    form[1].value = $(data).closest("tr").find("td").eq(0).attr('id')
    form[0].value = $(data).closest("tr").find("td").eq(1).text().trim()
};

function delete_assets(data) {
    let input = (document.getElementById('Delete-Assets')).getElementsByTagName('input')
    let label = (document.getElementById('Delete-Assets')).getElementsByTagName('label')
    input[0].value = $(data).closest("tr").find("td").eq(0).attr('id')
    label[0].innerHTML = $(data).closest("tr").find("td").eq(1).text().trim()
    // label[1].innerHTML = $(data).closest("tr").find("td").eq(2).text().trim()
};



function nav_link(data) {
    let href = document.getElementById('button-add-measure')
    if (data == 'home') {
        href.href = "#Add-measures"
        href.innerHTML = `<i class="fas fa-plus"></i> เพิ่มหัวเรื่องมาตรการ`
    } else if (data == 'menu1') {
        href.href = "#Add-Approach"
        href.innerHTML = `<i class="fas fa-plus"></i> เพิ่มการป้องกันเชิงลึก`
    } else if (data == 'menu2') {
        href.href = "#Add-Assets"
        href.innerHTML = `<i class="fas fa-plus"></i> เพิ่มทรัพย์สินสารสนเทศ`
    }
}

function get_data() {
    $.ajax({
        type: 'GET',
        url: '/api/manage/measures/list',
        success: async function (result) {
            console.log(result);
            await DataTable_Measure(result.measures_type)
            await DataTable_Depth(result.depth, result.depth_check)
            await DataTable_Assets(result.assets)
        },
        error: function (e) {
            console.log(e);
        }
    });
}
get_data()

async function DataTable_Measure(data) {
    if (data == 'ไม่มีข้อมูล') {
        $('#tbody-measure').empty().append(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
                <b class="text-danger">ไม่พบข้อมูล</b>
            </td>
        </tr>
        `)
    } else {
        for (let i = 0; i < data.length; i++) {
            data[i].no = i + 1
        }
        var state = {
            'querySet': data,
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
        }

        function pageButtons(pages) {
            // var wrapper = document.getElementById('pagination-wrapper')
            var wrapper = document.querySelector('.pagination-measures-type')
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
            var table = $('#tbody-measure');
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];
            for (var i in myList) {
                let delete_trash = '<i class="fas fa-trash-alt fa-2x text-secondary"></i>'
                if (myList[i].id_check == null) {
                    delete_trash = `
                    <a  class="text-danger" data-bs-toggle="modal" data-bs-target="#Delete-measures" onclick="delete_measures(this)"><i class="fas fa-trash-alt fa-2x"></i></a>
                    `
                }
                var row = `<tr>
                        <td id="${myList[i].id}">${myList[i].no}</td>
                        <td>${myList[i].measures_type}</td>           
                        <td><a  href="#Edit-measures" data-bs-toggle="modal" onclick="editCookietype(this)" class="text-warning">
                            <i class="fas fa-pencil-alt fa-2x"></i>
                            </a>
                        </td>
                        <td>
                            ${delete_trash}
                        </td>
                        </tr>
                        `
                table.append(row)
                show.push(myList[i].no)
            }
            document.querySelector("#show-General-Measures").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
            document.querySelector("#to-show-General-Measures").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
            document.querySelector("#show-all-General-Measures").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
            pageButtons(data.pages)
        }
    }
}


async function DataTable_Depth(data, check) {
    if (data == 'ไม่มีข้อมูล') {
        $('#tbody-depth').empty().append(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
                <b class="text-danger">ไม่พบข้อมูล</b>
            </td>
        </tr>
        `)
    } else {
        for (let i = 0; i < data.length; i++) {
            data[i].no = i + 1
        }
        var state = {
            'querySet': data,
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
        }

        function pageButtons(pages) {
            // var wrapper = document.getElementById('pagination-wrapper')
            var wrapper = document.querySelector('.pagination-depth')
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
                state.page = Number($(this).val())
                buildTable()
            })
        };
        function buildTable() {
            var table = $('#tbody-depth');
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];
            var arr = []
            // check.forEach(element => {
            //     if (element.depth_id_defense != null) {
            //         arr.push(...element.depth_id_defense.split(','))
            //     }
            //     if (element.depth_id_measures != null) {
            //         arr.push(...element.depth_id_measures.split(','))
            //     }
            // });
            for (let i = 0; i < check.length; i++) {
                if (check[i].depth_id_defense != null) {
                    arr.push(...check[i].depth_id_defense.split(','))
                }
                if (check[i].depth_id_measures != null) {
                    arr.push(...check[i].depth_id_measures.split(','))
                }
            }
            arr = [...new Set(arr)]
            for (var i in myList) {
                let type = ""
                if (myList[i].depth_type == 2) {
                    type = "มาตราการป้องกันเชิงลึก"
                } else {
                    type = "หลักการป้องกันเชิงลึก"
                }
                let delete_trash = '<a  class="text-danger" data-bs-toggle="modal" data-bs-target="#Delete-Approach" onclick="delete_approach(this)"><i class="fas fa-trash-alt fa-2x"></i></a>'
                if ((arr.indexOf((myList[i].depth_id).toString())) > -1) {
                    delete_trash = `
                    <i class="fas fa-trash-alt fa-2x text-secondary"></i>
                    `
                }
                var row = `<tr>
                        <td id="${myList[i].depth_id}">${myList[i].no}</td>
                        <td>${myList[i].depth_name}</td>      
                        <td id="${myList[i].depth_type}">${type}</td>     
                        <td><a href="#Edit-Approach" data-bs-toggle="modal"  onclick="edit_approach(this)"  class="text-warning">
                            <i class="fas fa-pencil-alt fa-2x"></i>
                            </a>
                        </td>
                        <td>
                            ${delete_trash}
                        </td>
                        </tr>
                        `
                table.append(row)
                show.push(myList[i].no)
            }
            document.querySelector("#show-depth").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
            document.querySelector("#to-show-depth").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
            document.querySelector("#show-all-depth").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
            pageButtons(data.pages)
        }
    }
}


async function DataTable_Assets(data) {
    if (data == 'ไม่มีข้อมูล') {
        $('#tbody-assets').empty().append(`
        <tr>
            <td colspan="20" class="text-center" style="border: none;">
                <b class="text-danger">ไม่พบข้อมูล</b>
            </td>
        </tr>
        `)
    } else {
        for (let i = 0; i < data.length; i++) {
            data[i].no = i + 1
        }
        var state = {
            'querySet': data,
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
        }

        function pageButtons(pages) {
            // var wrapper = document.getElementById('pagination-wrapper')
            var wrapper = document.querySelector('.pagination-assets')
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
            var table = $('#tbody-assets');
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];
            for (var i in myList) {
                let delete_trash = '<i class="fas fa-trash-alt fa-2x text-secondary"></i>'
                if (myList[i].id_check == null) {
                    delete_trash = `
                    <a  class="text-danger" data-bs-toggle="modal" data-bs-target="#Delete-Assets" onclick="delete_assets(this)"><i class="fas fa-trash-alt fa-2x"></i></a>
                    `
                }
                var row = `<tr>
                        <td id="${myList[i].assets_id}">${myList[i].no}</td>
                        <td>${myList[i].assets_name}</td>           
                        <td><a  href="#Edit-Assets" data-bs-toggle="modal" onclick="edite_assets(this)" class="text-warning">
                            <i class="fas fa-pencil-alt fa-2x"></i>
                            </a>
                        </td>
                        <td>
                            ${delete_trash}
                        </td>
                        </tr>
                        `
                table.append(row)
                show.push(myList[i].no)
            }
            document.querySelector("#show-General-Measures").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
            document.querySelector("#to-show-General-Measures").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
            document.querySelector("#show-all-General-Measures").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
            pageButtons(data.pages)
        }
    }
}
