
$('#myEditor1').summernote({
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
    width: 600,
    height: 842, // set minimum height of editor
    callbacks: {
        onKeyup: function (e) {
            $("#setcode").html($('#myEditor1').val());
            let text = document.getElementById("setcode").innerHTML;
            const code = document.getElementById("code").value
            const code1 = document.getElementById('code1').value
            const code_name = document.getElementById('code_name').value;

            let sort_code = code.split(',')
            let sort_code1 = code1.split(',')
            let sort_code2 = code_name.split(',')
            let obj = []
            for (i in sort_code1) {
                obj.push({ "data_id": sort_code[i], "data_code": sort_code1[i], "data_name": sort_code2[i] })
            }
            for (j in obj) {
                var x = obj[j].data_code
                let position = text.search(x);
                if (position > -1) {
                    text = text.replaceAll(obj[j].data_code, obj[j].data_name)
                    document.getElementById("setcode").innerHTML = text
                }
            }
            summernote_replace_tag();
            summernote_replace_code();
        },
        onInit: function (e) {
            $(".note-editable").on('click', function (e) {
                $("#setcode").html($('#myEditor1').val());
                let text = document.getElementById("setcode").innerHTML;
                const code = document.getElementById("code").value
                const code1 = document.getElementById('code1').value
                const code_name = document.getElementById('code_name').value;

                let sort_code = code.split(',')
                let sort_code1 = code1.split(',')
                let sort_code2 = code_name.split(',')
                let obj = []
                for (i in sort_code1) {
                    obj.push({ "data_id": sort_code[i], "data_code": sort_code1[i], "data_name": sort_code2[i] })
                }
                for (j in obj) {
                    var x = obj[j].data_code
                    let position = text.search(x);
                    if (position > -1) {
                        text = text.replaceAll(obj[j].data_code, obj[j].data_name)
                        document.getElementById("setcode").innerHTML = text
                    }
                }
                summernote_replace_tag();
                summernote_replace_code();
            });
        }
    }

});

var datachecknum = document.getElementById('pages').value
var checknum = 0;
for (x in datachecknum) {
    if (datachecknum[x].page_action != 1) {
        checknum += 1
    }
}
const confirmdel = (num, page_id, doc_id) => {
    if (checknum > 1) {
        Swal.fire({
            title: 'ต้องการลบหน้าที่ ' + num + ' ใช่หรือไม่',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            type: 'warning',
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "/deletepaper/" + page_id,
                    type: "get",
                    success: function (data) {
                        Swal.fire(
                            {
                                type: 'success',
                                title: 'ลบหน้าที่ ' + num + ' เรียบร้อย',
                                showConfirmButton: false,
                                timer: 1000
                            }
                        ).then((result) => {
                            window.location.href = '/paper/' + doc_id;
                        })
                    },
                });
            }
        })
    } else {
        Swal.fire({
            title: 'ไม่สามารถลบได้เนื่องจากมีเพียงหนึ่งหน้า',
            confirmButtonText: 'ตกลง',
            type: 'error',
        })
    }

}

const confirmdel_consent = (num, page_id, doc_id) => {
    if (checknum > 1) {
        Swal.fire({
            title: 'ต้องการลบหน้าที่ ' + num + ' ใช่หรือไม่',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            type: 'warning',
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "/deletepaper_consent/" + page_id,
                    type: "get",
                    success: function (data) {
                        Swal.fire(
                            {
                                type: 'success',
                                title: 'ลบหน้าที่ ' + num + ' เรียบร้อย',
                                showConfirmButton: false,
                                timer: 1000
                            }
                        ).then((result) => {
                            window.location.href = '/editpaper_consent/' + doc_id;
                        })
                    },
                });
            }
        })
    } else {
        Swal.fire({
            title: 'ไม่สามารถลบได้เนื่องจากมีเพียงหนึ่งหน้า',
            confirmButtonText: 'ตกลง',
            type: 'error',
        })
    }

}
summernote_replace();
summernote_replace_1();

function insertText(id) {
    const words = document.getElementById("words").value
    const words1 = document.getElementById('swords').value
    let sort_words = words.split(',')
    let sort_swords = words1.split(',')
    let obj = []
    for (i in sort_words) {
        obj.push({ "words_id": sort_words[i], "words_often": sort_swords[i] })
    }
    for (j in obj) {
        if (id == obj[j].words_id) {
            $('#myEditor1').summernote('editor.saveRange');
            // Editor loses selected range (e.g after blur)      
            $('#myEditor1').summernote('editor.restoreRange');
            $('#myEditor1').summernote('editor.focus');
            $('#myEditor1').summernote('editor.insertText', obj[j].words_often);
            $("#setcode").html($('#myEditor1').val());
            summernote_replace();
            summernote_replace_1();
        }
    }
}
function editwords(id) {
    const words = document.getElementById("words").value //words_id
    const words1 = document.getElementById('swords').value //words_often
    let sort_words = words.split(',')
    let sort_swords = words1.split(',')
    let obj = []
    var editwordsx = document.getElementById("editwords1");
    for (i in sort_words) {
        obj.push({ "words_id": sort_words[i], "words_often": sort_swords[i] })
    }
    for (j in obj) {
        if (id == obj[j].words_id) {
            editwordsx.innerHTML = ' <div><input type="text" name="words_often" id="words_often" value="' + obj[j].words_often + '" class="form-control" required></div><div> <input type="hidden" name="words_id" id="words_id" value="' + obj[j].words_id + '" required></div>'
        }
    }
}

function deletewords(id) {
    const words = document.getElementById("words").value //words_id
    const words1 = document.getElementById('swords').value //words_often
    let sort_words = words.split(',')
    let sort_swords = words1.split(',')
    let obj = []
    var deletewordsx = document.getElementById("deletewords1");
    for (i in sort_words) {
        obj.push({ "words_id": sort_words[i], "words_often": sort_swords[i] })
    }
    for (j in obj) {
        if (id == obj[j].words_id) {
            deletewordsx.innerHTML = obj[j].words_often + '<input type="hidden" name="words_id" id="words_id" value="' + obj[j].words_id + '" ></div>'
        }
    }
}

function insertCode(id) {
    const code = document.getElementById("code").value
    const code1 = document.getElementById('code1').value
    let sort_code = code.split(',')
    let sort_code1 = code1.split(',')
    let obj = []
    for (i in sort_code) {
        obj.push({ "data_id": sort_code[i], "data_code": sort_code1[i] })
    }
    console.log("obj", obj);
    for (j in obj) {
        if (id == obj[j].data_id) {
            $('#myEditor1').summernote('editor.saveRange');
            // Editor loses selected range (e.g after blur)   
            $('#myEditor1').summernote('editor.restoreRange');
            $('#myEditor1').summernote('editor.focus');
            $('#myEditor1').summernote('editor.insertText', " " + obj[j].data_code + " ");
            $("#setcode").html($('#myEditor1').val());
            summernote_replace();
            summernote_replace_1()
        }
    }
}


function summernote_replace() {
    $("#setcode").html($('#myEditor1').val());
    let text = document.getElementById("setcode").innerHTML;
    const site_name = document.getElementById("site_name").value;
    const short_name = document.getElementById('short_name').value;
    const image = document.getElementById('image').value;
    const email_company = document.getElementById("email_company").value;
    const phone_company = document.getElementById('phone_company').value;
    const address_company = document.getElementById('address_company').value;
    const number_company = 'number';

    let page_content_replace_company = [];
    let company_replace =
        [
            "@@company_name",
            "@@short_company_name",
            "@@logo_company",
            "@@email_company",
            "@@phone_company",
            "@@address_company",
            "@@number_company",
        ];
    let regex =
        new RegExp(
            company_replace[0],
            "ig"
        );
    let regex_short =
        new RegExp(
            company_replace[1],
            "ig"
        );
    let regex_logo =
        new RegExp(
            company_replace[2],
            "ig"
        );
    let regex_email_company =
        new RegExp(
            company_replace[3],
            "ig"
        );
    let regex_phone_company =
        new RegExp(
            company_replace[4],
            "ig"
        );
    let regex_address_company =
        new RegExp(
            company_replace[5],
            "ig"
        );
    let regex_number_company =
        new RegExp(
            company_replace[6],
            "ig"
        );
    text = text.replace(
        regex, site_name
    );
    text = text.replace(
        regex_short, short_name
    );
    text = text.replace(
        regex_logo, image
    );
    text = text.replace(
        regex_email_company, email_company
    );
    text = text.replace(
        regex_phone_company, phone_company
    );
    text = text.replace(
        regex_address_company, address_company
    );
    text = text.replace(
        regex_number_company, number_company
    );
    page_content_replace_company.push(
        text
    );
    // console.log(page_content_replace_company);
    document.getElementById("setcode").innerHTML = page_content_replace_company
}

function summernote_replace_1() {
    let text = document.getElementById("setcode").innerHTML;
    const code = document.getElementById("code").value
    const code1 = document.getElementById('code1').value
    const code_name = document.getElementById('code_name').value;

    let sort_code = code.split(',')
    let sort_code1 = code1.split(',')
    let sort_code2 = code_name.split(',')
    let obj = []
    for (i in sort_code1) {
        obj.push({ "data_id": sort_code[i], "data_code": sort_code1[i], "data_name": sort_code2[i] })
    }
    for (j in obj) {
        var x = obj[j].data_code
        let position = text.search(x);
        if (position > -1) {
            text = text.replaceAll(obj[j].data_code, obj[j].data_name)
            document.getElementById("setcode").innerHTML = text
        }
    }
}

function summernote_replace_tag() {
    $("#setcode").html($('#myEditor1').val());
    let text = document.getElementById("setcode").innerHTML;
    const site_name = document.getElementById("site_name").value;
    const short_name = document.getElementById('short_name').value;
    const image = document.getElementById('image').value;
    const email_company = document.getElementById("email_company").value;
    const phone_company = document.getElementById('phone_company').value;
    const address_company = document.getElementById('address_company').value;
    const number_company = 'number';

    let page_content_replace_company = [];
    let company_replace =
        [
            "@@company_name",
            "@@short_company_name",
            "@@logo_company",
            "@@email_company",
            "@@phone_company",
            "@@address_company",
            "@@number_company",
        ];
    let regex =
        new RegExp(
            company_replace[0],
            "ig"
        );
    let regex_short =
        new RegExp(
            company_replace[1],
            "ig"
        );
    let regex_logo =
        new RegExp(
            company_replace[2],
            "ig"
        );
    let regex_email_company =
        new RegExp(
            company_replace[3],
            "ig"
        );
    let regex_phone_company =
        new RegExp(
            company_replace[4],
            "ig"
        );
    let regex_address_company =
        new RegExp(
            company_replace[5],
            "ig"
        );
    let regex_number_company =
        new RegExp(
            company_replace[6],
            "ig"
        );
    text = text.replace(
        regex, site_name
    );
    text = text.replace(
        regex_short, short_name
    );
    text = text.replace(
        regex_logo, image
    );
    text = text.replace(
        regex_email_company, email_company
    );
    text = text.replace(
        regex_phone_company, phone_company
    );
    text = text.replace(
        regex_address_company, address_company
    );
    text = text.replace(
        regex_number_company, number_company
    );
    page_content_replace_company.push(
        text
    );
    // console.log(page_content_replace_company);
    document.getElementById("setcode").innerHTML = page_content_replace_company
}

function summernote_replace_code() {
    let text = document.getElementById("setcode").innerHTML;
    const code = document.getElementById("code").value
    const code1 = document.getElementById('code1').value
    const code_name = document.getElementById('code_name').value;

    let sort_code = code.split(',')
    let sort_code1 = code1.split(',')
    let sort_code2 = code_name.split(',')
    let obj = []
    for (i in sort_code1) {
        obj.push({ "data_id": sort_code[i], "data_code": sort_code1[i], "data_name": sort_code2[i] })
    }
    for (j in obj) {
        var x = obj[j].data_code
        let position = text.search(x);
        if (position > -1) {
            text = text.replaceAll(obj[j].data_code, obj[j].data_name)
            document.getElementById("setcode").innerHTML = text
        }
    }
}