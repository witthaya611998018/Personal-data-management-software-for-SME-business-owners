/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/bootstrap-cookie-consent-settings
 * License: MIT, see file 'LICENSE'
 */


// console.log(document.getElementById("cookieWow").getAttribute('data-cwcid'));
// console.log(document.getElementById("alltra"));
let domain = document.getElementById("alltra").getAttribute('data-cwcid');
console.log(domain);
var cookieSettings = new BootstrapCookieConsentSettings({
    // contentURL: "../en.html", // ดึงไฟล์ใน folder
    // contentURL: "http://119.81.44.155/wit224.html",
    // contentURL: "http://119.81.197.141:8081/dist/img/ข้าว.jpg", // ดึงไฟล์ใน folder
    // contentURL: "http://127.0.0.51:8081/views/wit224.html", // ดึงไฟล์ใน folder
    // contentURL: "http://127.0.0.51:8081/dist/wit224.html", // ดึงไฟล์ใน folder
    // contentURL: "http://127.0.0.51:8081/dist/file_domain/1231_310.html", // ดึงไฟล์ใน folder
    contentURL: "http://127.0.0.51:8081/dist/file_domain/" + domain +".html", // ดึงไฟล์ใน folder

    // contentURL: "http://127.0.0.51:8081/dist/file_domain/PDPA_278.html", // ดึงไฟล์ใน folder
    // contentURL: "http://119.81.197.141:8081/dist/file_domain/sgc.co.th_302.html", // ดึงไฟล์ใน folder
    // contentURL: "http://127.0.0.51:8081/dist/dist/js/bootstrap-cookie-consent-settings.js", // ดึงไฟล์ใน folder
    // contentURL: "http://119.81.44.155/wit224.html",

})

function showSettingsDialog() {
    cookieSettings.showDialog()
}

if (!localStorage.getItem("cookieBannerDisplayed")) { // เช็คว่า browser มีคุกี้อยู่ไหม
    cookieSettings.showDialog()
}



// $(function () {
//     console.log(document.getElementById("cookieWow"));
//     $("#settingsOutput").text(JSON.stringify(cookieSettings.getSettings()))
//     $("#settingsAnalysisOutput").text(cookieSettings.getSettings("analyses"))
// })

function select() { // sheck banner location middle
    let modal = document.getElementById("modal");
    if (modal.classList[2] == "modal-content_v3") {
        modal.classList.add("modal-content_v3_middle")
        modal.classList.remove("modal-content_v3")
    } else if (modal.classList[2] == "modal-content_v3_middle") {
        modal.classList.add("modal-content_v3")
        modal.classList.remove("modal-content_v3_middle")
    }
}






// function select_un() {
//     console.log("5555555555");
//     let modalun = document.getElementById("unselect")
//     let modal = document.getElementById("modal")
//     modal.setAttribute("class", "modal-dialog modal-lg modal-content_v2")
//     modalun.setAttribute("onclick", "select()")
// }


const sh = { bccs: {} }

function BootstrapCookieConsentSettings(props) {
    const modalId = "bccs-modal"
    const self = this
    let detailedSettingsShown = false
    this.props = {
        autoShowDialog: true, // disable autoShowModal on the privacy policy and legal notice pages, to make these pages readable
        lang: navigator.language, // the language, in which the modal is shown
        languages: ["wit224"], // supported languages (in ./content/), defaults to first in array
        // contentURL: "http://119.81.44.155/wit224.html", // this URL must contain the dialogs content in the needed languages
        // contentURL: "http://127.0.0.51:8081/views/view_CookieConsent/content",

        cookieName: "cookie-consent-settings",  // the name of the cookie in which the configuration is stored as JSON
        cookieStorageDays: 365, // the duration the cookie configuration is stored on the client
        // postSelectionCallback: undefined // callback function, called after the user has made his selection
    }
    for (const property in props) {
        // noinspection JSUnfilteredForInLoop
        this.props[property] = props[property]
    }
    this.lang = this.props.lang
    if (this.lang.indexOf("-") !== -1) {
        this.lang = this.lang.split("-")[0]
    }
    if (!this.props.languages.includes(this.lang)) {
        this.lang = this.props.languages[0] // fallback
    }
    const Cookie = {
        set: function (name, value, days) {
            let expires = ""
            if (days) {
                const date = new Date()
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
                expires = "; expires=" + date.toUTCString()
            }
            document.cookie = name + "=" + (value || "") + expires + "; Path=/; SameSite=Strict;"
        },
        get: function (name) {
            const nameEQ = name + "="
            const ca = document.cookie.split(';')
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i]
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length)
                }
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length, c.length)
                }
            }
            return undefined
        }
    }
    const Events = {
        documentReady: function (onDocumentReady) {
            if (document.readyState !== 'loading') {
                // console.log("if Events");
                onDocumentReady()
            } else {
                // console.log("else Events");
                document.addEventListener('DOMContentLoaded', onDocumentReady)
            }
        }
    }

    function showDialog() {
        Events.documentReady(function () {
            // console.log("this " + JSON.stringify(this));
            this.modal = document.getElementById(modalId)
            // console.log("self.modal  " + this.modal);
            if (!self.modal) {
                // console.log("เข้า if เปิด modelไม่ได้");
                self.modal = document.createElement("div")
                self.modal.id = modalId
                self.modal.setAttribute("class", "modal fade")
                self.modal.setAttribute("tabindex", "-1")
                self.modal.setAttribute("role", "dialog")
                self.modal.setAttribute("aria-labelledby", modalId)
                document.body.append(self.modal)
                self.$modal = $(self.modal)
                if (self.props.postSelectionCallback) {
                    self.$modal.on("hidden.bs.modal", function () {
                        self.props.postSelectionCallback()
                    })
                }

                // load content
                // fetch(`http://127.0.0.51:8081/views/view_CookieConsent/content/224.ejs`, {});
                // const templateUrl = self.props.contentURL + 'views/view_login/wit224.ejs';
                const templateUrl = self.props.contentURL
                // console.log("templateUrl " + templateUrl);
                $.get(templateUrl)
                    .done(function (data) {
                        self.modal.innerHTML = data
                        $(self.modal).modal({
                            backdrop: "static",
                            keyboard: false
                        })
                        self.$buttonDoNotAgree = $("#bccs-buttonDoNotAgree")
                        self.$buttonAgree = $("#bccs-buttonAgree")
                        self.$buttonSave = $("#bccs-buttonSave")
                        self.$buttonAgreeAll = $("#bccs-buttonAgreeAll")
                        updateButtons()
                        updateOptionsFromCookie()
                        $("#bccs-options").on("hide.bs.collapse", function () {
                            detailedSettingsShown = false
                            updateButtons()
                        }).on("show.bs.collapse", function () {
                            detailedSettingsShown = true
                            updateButtons()
                            check_approve()
                        })

                        self.$buttonDoNotAgree.click(function () {
                            localStorage.setItem("cookieBannerDisplayed", "true");
                            doNotAgree()
                            doNotAgree_cookieTypes()

                        })
                        self.$buttonAgree.click(function () {
                            localStorage.setItem("cookieBannerDisplayed", "true");
                            agreeAll()
                            send_cookieTypes() // function ในการส่งข้อมูลกลับ

                        })
                        self.$buttonSave.click(function () {
                            localStorage.setItem("cookieBannerDisplayed", "true");
                            saveSettings()
                            send_cookieTypes() // function ในการส่งข้อมูลกลับ
                        })

                        self.$buttonAgreeAll.click(function () {
                            localStorage.setItem("cookieBannerDisplayed", "true");
                            agreeAll()
                            send_cookieTypes() // function ในการส่งข้อมูลกลับ
                        })
                        self.$modal.modal("show")

                    })

                    .fail(function () {
                        console.error("You probably need to set `contentURL` in the props")
                        console.error("see documentation at https://github.com/shaack/bootstrap-cookie-banner")
                    })
            } else {
                // console.log("เข้า else SHOW");
                self.$modal.modal("show")
            }
        }.bind(this))
    }

    function updateOptionsFromCookie() {
        const settings = self.getSettings()
        if (settings) {
            for (let setting in settings) {
                const $checkbox = self.$modal.find("#bccs-options .bccs-option[data-name='" + setting + "'] input[type='checkbox']")
                // noinspection JSUnfilteredForInLoop
                $checkbox.prop("checked", settings[setting])
            }
        }
    }

    function updateButtons() {
        if (detailedSettingsShown) {
            self.$buttonDoNotAgree.hide()
            self.$buttonAgree.hide()
            self.$buttonSave.show()
            self.$buttonAgreeAll.show()
        } else {
            self.$buttonDoNotAgree.show()
            self.$buttonAgree.show()
            self.$buttonSave.hide()
            self.$buttonAgreeAll.hide()
        }
    }

    function gatherOptions(setAllExceptNecessary) {

        const $options = self.$modal.find("#bccs-options .bccs-option")
        const options = {}
        for (let i = 0; i < $options.length; i++) {
            const option = $options[i]
            const name = option.getAttribute("data-name")
            if (name === "1") {
                options[name] = true
                options[name] = $checkbox.prop("checked")
            } else if (setAllExceptNecessary === undefined) {
                const $checkbox = $(option).find("input[type='checkbox']")
                options[name] = $checkbox.prop("checked")
            } else {
                options[name] = !!setAllExceptNecessary
            }
        }
        return options
    }

    function send_cookieTypes() { // กรณีกดปุ่ม กดปุ่มอนุญาติ หรือ อนุญาติทั้งหมด 
        var input = document.querySelectorAll('input[name=cookie]');
        var dataType = []
        for (var i = 0; i < input.length; i++) {
            if ($('#bccs-checkboxNecessary_' + (i + 1)).val()) {
                if ($('#bccs-checkboxNecessary_' + (i + 1)).prop("checked") == true) {
                    $('#bccs-checkboxNecessary_' + (i + 1)).prop("checked", true);
                    dataType.push($('#bccs-checkboxNecessary_' + (i + 1)).val())
                    $('#label_approve_' + (i + 1)).text("active").attr('style', 'color:black');

                } else {
                    $('#bccs-checkboxNecessary_' + (i + 1)).prop("checked", false)
                }
            }
        }
        var id_file = self.props.contentURL;
        // $.ajax({
        //     type: "Post",
        //     contentType: "application/json",
        //     url: "http://119.81.197.141:8081/api/send_cookieTypes",
        //     data: JSON.stringify({ dataType, id_file }),
        //     dataType: "json",
        //     error: function (e) {
        //         console.log(e);
        //     }
        // });
        $.ajax({
            type: "Post",
            contentType: "application/json",
            url: "http://127.0.0.51:8081/api/send_cookieTypes",
            data: JSON.stringify({ dataType, id_file }),
            dataType: "json",
            error: function (e) {
                console.log(e);
            }
        });

    }



    function check_approve() { // check  input type="checkbox" ตอนรีโหลดหน้าเว็บ page 
        var input = document.querySelectorAll('input[name=cookie]');
        for (let i = 0; i < input.length; i++) {
            var id = document.getElementById("bccs-checkboxNecessary_" + (i + 1)).value;
            var approve = id.split(",")[1]

            // check ว่า checkbox ตัวไหนบ้างที่ active 
            if (approve == "0") {
                $('#bccs-checkboxNecessary_' + (i + 1)).prop("checked", false) // check กรณีที่ user ไม่อนุญาตประเภทคุกี้ เเต่ละประเภทคุกี้
                // $('#label_approve_' + (i + 1)).attr('style', 'color:red');
                $('#label_approve_' + (i + 1)).text("No active").attr('style', 'color:red;font-size:14px;');
                // $('#label_approve_' + (i + 1)).text("No active").attr('style', 'font-siz:14px');


            } else { // check ว่า checkbox ตัวไหนบ้างที่ ไม่active 
                $('#bccs-checkboxNecessary_' + (i + 1)).prop("checked", true) // check กรณีที่ user ไม่อนุญาตประเภทคุกี้ เเต่ละประเภทคุกี้
                $('#label_approve_' + (i + 1)).text("active").attr('style', 'color:black');
            }

            // check ว่า user กด เปิด-ปิด checkbox  ตัวไหนบ้าง
            $("#bccs-checkboxNecessary_" + (i + 1)).click(function () {
                if ($('#bccs-checkboxNecessary_' + (i + 1)).prop("checked") == true) {
                    $('#label_approve_' + (i + 1)).text("active").attr('style', 'color:black');
                } else {
                    $('#label_approve_' + (i + 1)).text("No active").attr('style', 'color:red;font-size:14px;');
                }
            });

        }
    };


    function doNotAgree_cookieTypes() { // กรณีกดปุ่ม ปฏิเสธ

        var dataType = "0"
        var id_file = self.props.contentURL;
        $.ajax({
            type: "Post",
            contentType: "application/json",
            url: "http://127.0.0.51:8081/api/send_cookieTypes",
            data: JSON.stringify({ dataType, id_file }),
            dataType: "json",
            error: function (e) {
                console.log(e);
            }
        });

        // $.ajax({
        //     type: "Post",
        //     contentType: "application/json",
        //     url: "http://119.81.197.141:8081/api/send_cookieTypes",
        //     data: JSON.stringify({ dataType, id_file }),
        //     dataType: "json",
        //     error: function (e) {
        //         console.log(e);
        //     }
        // });

    }


    function agreeAll() {
        var input = document.querySelectorAll('input[name=cookie]');
        for (var i = 0; i < input.length; i++) {
            $('#bccs-checkboxNecessary_' + (i + 1)).prop("checked", true)
        }
        Cookie.set(self.props.cookieName, JSON.stringify(gatherOptions(true)), self.props.cookieStorageDays)
        self.$modal.modal("hide")
    }

    function doNotAgree() {
        Cookie.set(self.props.cookieName, JSON.stringify(gatherOptions(false)), self.props.cookieStorageDays)
        self.$modal.modal("hide")
    }

    function saveSettings() {
        Cookie.set(self.props.cookieName, JSON.stringify(gatherOptions(this)), self.props.cookieStorageDays)
        self.$modal.modal("hide")
    }

    function includeJs(src) {
        const scriptElement = document.createElement("script")
        scriptElement.type = "text/javascript"
        scriptElement.src = src
        document.head.appendChild(scriptElement)
    }

    // init
    if (Cookie.get(this.props.cookieName) === undefined && this.props.autoShowDialog) {
        showDialog()
    }

    // API

    this.showDialog = function () {
        showDialog()
    }
    this.getSettings = function (optionName) {
        const cookie = Cookie.get(self.props.cookieName)
        if (cookie) {
            const settings = JSON.parse(Cookie.get(self.props.cookieName))
            if (optionName === undefined) {
                return settings
            } else {
                if (settings) {
                    return settings[optionName]
                } else {
                    return false
                }
            }
        } else {
            return undefined
        }
    }
}
