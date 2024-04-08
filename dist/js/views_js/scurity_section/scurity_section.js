function nav_link(data) {
    let href = document.getElementById('button-add-measure')
    if (data == 'home') {
        href.href = "/security/section/General-Measures/add"
    } else if (data == 'menu1') {
        href.href = "/security/section/Risk-based-Approach/add"
    } else if (data == 'menu2') {
        href.href = "/security/section/Specific-Measures/add"
    }
}


function get_data() {
    $.ajax({
        type: 'GET',
        url: '/api/security/section/list',
        success: async function (result) {
            console.log(result);
            // if (condition) {

            // } else {

            // }
            await DatabTable_General_Measures(result.measures, result.doc)
            await DatabTable_Risk_Based_Approach_Information(result.approach_Information, result.doc)
            await DatabTable_Risk_Based_Approach_Network(result.approach_Network, result.doc)
            await DatabTable_Risk_Based_Papa_Specific(result.specific, result.doc)

        },
        error: function (e) {
            console.log(e);
        }
    });
}

get_data()


async function DatabTable_General_Measures(data, doc) {
    if (data == 'ไม่มีข้อมูล') {
        $('#tbody-General-Measures').empty().append(`
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
            var wrapper = document.querySelector('.pagination-General-Measures')
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
            var table = $('#tbody-General-Measures');
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];
            for (var i in myList) {

                var doc_show = ''
                if (doc.length > 0) {
                    let doc_id = myList[i].doc_id_measures.split(',')
                    doc.forEach(element => {
                        if ((doc_id.indexOf(String(element.doc_id))) > -1) {
                            doc_show += `
                            ${element.doc_name} <a class="text-info" target="_blank" href="/paper/${element.doc_id}"><i class=" fas fa-file-alt fa-2x"></i></a><br>
                            `
                        }
                    });
                }

                var row = `<tr>
                <td>${myList[i].no}</td>
                <td>${myList[i].measures_type}</td>           
                <td>${myList[i].measures_section_name}</td>
                <td>${doc_show}</td>
                <td>${myList[i].measures_detail}</td>
                <td><a id="1" href="/General-Measures/edit/${myList[i].measures_id}" class="text-warning">
                    <i class="fas fa-pencil-alt fa-2x"></i>
                    </a>
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


async function DatabTable_Risk_Based_Approach_Information(Information, doc) {
    if (Information == 'ไม่มีข้อมูล') {
        $('#tbody-Risk-based-Approach-Information').empty().append(`
            <tr>
        <td colspan="20" class="text-center" style="border: none;">
             <b class="text-danger">ไม่พบข้อมูล</b>
         </td>
    </tr>
                `)
    } else {
        for (let i = 0; i < Information.length; i++) {
            Information[i].no = i + 1
        }
        var state = {
            'querySet': Information,
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
            var wrapper = document.querySelector('.pagination-Risk-based-Approach')
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
            var table = $('#tbody-Risk-based-Approach-Information');
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];
            for (var i in myList) {
                let confidentiality = '<i class="ti-close text-danger"></i>'
                let integrity = '<i class="ti-close text-danger"></i>'
                let availability = '<i class="ti-close text-danger"></i>'

                if (myList[i].approach_confidentiality == 1) {
                    confidentiality = `<i class="fas fa-check" style="color: green;"></i>`
                }
                if (myList[i].approach_integrity == 1) {
                    integrity = `<i class="fas fa-check" style="color: green;"></i>`
                }
                if (myList[i].approach_availability == 1) {
                    availability = `<i class="fas fa-check" style="color: green;"></i>`
                }

                var doc_show = ''
                if (doc.length > 0) {
                    let doc_id = myList[i].doc_id.split(',')
                    doc.forEach(element => {
                        if ((doc_id.indexOf(String(element.doc_id))) > -1) {
                            doc_show += `
                            ${element.doc_name} <a class="text-info" target="_blank" href="/paper/${element.doc_id}"><i class=" fas fa-file-alt fa-2x"></i></a><br>
                            `
                        }
                    });
                }

                var row = `<tr>
                <td>${myList[i].no}</td>
                <td>${myList[i].measures_section_name}</td>           
                <td>${myList[i].assets_name}</td>
                <td>${doc_show}</td>
                <td>${confidentiality}</td>
                <td>${integrity}</td>
                <td>${availability}</td>
                <td>  <a class="text-info" href="/Risk-based-Approach/details/${myList[i].approach_id}"><i class=" fas fa-file-alt fa-2x"></i></a></td>
                <td><a  href="/Risk-based-Approach/edit/${myList[i].approach_id} " class="text-warning">
                <i class="fas fa-pencil-alt fa-2x"></i>
                </a>
                 </td>
                </tr>
                `
                table.append(row)
                show.push(myList[i].no)
            }
            document.querySelector("#show-Risk-based-Approach").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
            document.querySelector("#to-show-Risk-based-Approach").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
            document.querySelector("#show-all-Risk-based-Approach").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
            pageButtons(data.pages)
        }
    }
}

async function DatabTable_Risk_Based_Approach_Network(Network, doc) {
    if (Network == 'ไม่มีข้อมูล') {
        $('#tbody-Risk-based-Approach-Network').empty().append(`
            <tr>
        <td colspan="20" class="text-center" style="border: none;">
             <b class="text-danger">ไม่พบข้อมูล</b>
         </td>
    </tr>
                `)
    } else {
        for (let i = 0; i < Network.length; i++) {
            Network[i].no = i + 1
        }
        var state = {
            'querySet': Network,
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
            var wrapper = document.querySelector('.pagination-Risk-based-Approach-Network')
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
            var table = $('#tbody-Risk-based-Approach-Network');
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];
            for (var i in myList) {
                let principles = '<i class="ti-close text-danger"></i>'
                let protection = '<i class="ti-close text-danger"></i>'
                if (myList[i].approach_defense_principles == 1) {
                    principles = `<i class="fas fa-check" style="color: green;"></i>`
                }
                if (myList[i].approach_defense_protection == 1) {
                    protection = `<i class="fas fa-check" style="color: green;"></i>`
                }

                var doc_show = ''
                if (doc.length > 0) {
                    let doc_id = myList[i].doc_id.split(',')
                    doc.forEach(element => {
                        if ((doc_id.indexOf(String(element.doc_id))) > -1) {
                            doc_show += `
                            ${element.doc_name} <a class="text-info" target="_blank" href="/paper/${element.doc_id}"><i class=" fas fa-file-alt fa-2x"></i></a><br>
                            `
                        }
                    });
                }

                var row = `<tr>
                <td>${myList[i].no}</td>
                <td>${myList[i].measures_section_name}</td>           
                <td>${myList[i].assets_name}</td>
                <td>${doc_show}</td>
                <td>${principles}</td>
                <td>${protection}</td>
                <td><a class="text-info"  href="/Risk-based-Approach/details/${myList[i].approach_id}"><i class=" fas fa-file-alt fa-2x"></i></a></td>
                <td><a href="/Risk-based-Approach/edit/${myList[i].approach_id}" class="text-warning">
                <i class="fas fa-pencil-alt fa-2x"></i>
                </a>
                 </td>
                </tr>
                `
                table.append(row)
                show.push(myList[i].no)
            }
            document.querySelector("#show-Risk-based-Approach-Network").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
            document.querySelector("#to-show-Risk-based-Approach-Network").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
            document.querySelector("#show-all-Risk-based-Approach-Network").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
            pageButtons(data.pages)
        }
    }
}

async function DatabTable_Risk_Based_Papa_Specific(specific, doc) {
    if (specific == 'ไม่มีข้อมูล') {
        $('#tbody-Risk-based-Specific-Measures').empty().append(`
            <tr>
        <td colspan="20" class="text-center" style="border: none;">
             <b class="text-danger">ไม่พบข้อมูล</b>
         </td>
    </tr>
                `)
    } else {
        for (let i = 0; i < specific.length; i++) {
            specific[i].no = i + 1
        }
        var state = {
            'querySet': specific,
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
            var wrapper = document.querySelector('.pagination-Specific-Measures')
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
            var table = $('#tbody-Risk-based-Specific-Measures');
            var data = pagination(state.querySet, state.page, state.rows)
            var myList = data.querySet
            var show = [];
            for (var i in myList) {
                let specific_access_control = '<i class="ti-close text-danger"></i>'
                let specific_audit_trails = '<i class="ti-close text-danger"></i>'

                let specific_privacy_security_awareness = '<i class="ti-close text-danger"></i>'

                let specific_user_access_management = '<i class="ti-close text-danger"></i>'

                let specific_user_responsibilitites = '<i class="ti-close text-danger"></i>'

                let specific_where_incident_occurs = '<i class="ti-close text-danger"></i>'

                if (myList[i].specific_access_control == 1) {
                    specific_access_control = `<i class="fas fa-check" style="color: green;"></i>`
                }
                if (myList[i].specific_audit_trails == 1) {
                    specific_audit_trails = `<i class="fas fa-check" style="color: green;"></i>`
                }

                if (myList[i].specific_privacy_security_awareness == 1) {
                    specific_privacy_security_awareness = `<i class="fas fa-check" style="color: green;"></i>`
                }
                if (myList[i].specific_user_access_management == 1) {
                    specific_user_access_management = `<i class="fas fa-check" style="color: green;"></i>`
                }
                if (myList[i].specific_user_responsibilitites == 1) {
                    specific_user_responsibilitites = `<i class="fas fa-check" style="color: green;"></i>`
                }

                if (myList[i].specific_where_incident_occurs == 1) {
                    specific_where_incident_occurs = `<i class="fas fa-check" style="color: green;"></i>`
                }
                var doc_show = ''
                if (doc.length > 0) {
                    let doc_id = myList[i].doc_id.split(',')
                    doc.forEach(element => {
                        if ((doc_id.indexOf(String(element.doc_id))) > -1) {
                            doc_show += `
                            ${element.doc_name} <a class="text-info" target="_blank" href="/paper/${element.doc_id}"><i class=" fas fa-file-alt fa-2x"></i></a><br>
                            `
                        }
                    });
                }


                var row = `<tr>
                <td>${myList[i].no}</td>
                <td>${myList[i].event_process_name}</td>           
                <td>${myList[i].measures_section_name}</td>
                <td>${doc_show}</td>
                <td>${specific_access_control}</td>
                <td>${specific_audit_trails}</td>
                <td>${specific_privacy_security_awareness}</td>
                <td>${specific_user_access_management}</td>
                <td>${specific_user_responsibilitites}</td>
                <td>${specific_where_incident_occurs}</td>
                <td><a class="text-info"  href="/Specific-Measures/details/${myList[i].id_specific}"><i class=" fas fa-file-alt fa-2x"></i></a></td>
                <td><a href="/Specific-Measures/edit/${myList[i].id_specific}" class="text-warning">
                <i class="fas fa-pencil-alt fa-2x"></i>
                </a>
                 </td>
                </tr>
                `
                table.append(row)
                show.push(myList[i].no)
            }
            document.querySelector("#show-Specific-Measures").innerHTML = show[0];  //  แสดงถึง row เเรกของหน้า 
            document.querySelector("#to-show-Specific-Measures").innerHTML = show[show.length - 1];  //  แสดงถึง row สุดท้ายของหน้า
            document.querySelector("#show-all-Specific-Measures").innerHTML = state.querySet.length;  //  แสดงถึงจำนวนข้อมูลทั้งหมดของหน้า
            pageButtons(data.pages)
        }
    }
}