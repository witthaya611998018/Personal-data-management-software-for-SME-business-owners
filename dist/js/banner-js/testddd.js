

var cookieSettings = new BootstrapCookieConsentSettings({
    // contentURL: "../en.html", // ดึงไฟล์ใน folder
    // contentURL: "http://119.81.44.155/wit224.html",
    // contentURL: "http://119.81.197.141:8081/dist/img/ข้าว.jpg", // ดึงไฟล์ใน folder
    // contentURL: "http://127.0.0.51:8081/views/wit224.html", // ดึงไฟล์ใน folder
    // contentURL: "http://127.0.0.51:8081/dist/wit224.html", // ดึงไฟล์ใน folder
    // contentURL: "http://127.0.0.51:8081/dist/file_domain/E-mail_279.html", // ดึงไฟล์ใน folder
    // contentURL: "http://127.0.0.51:8081/dist/file_domain/PDPA_278.html", // ดึงไฟล์ใน folder
    contentURL: "http://127.0.0.51:8081/dist/file_domain/sgc.co.th_302.html", // ดึงไฟล์ใน folder
    // contentURL: "http://127.0.0.51:8081/dist/dist/js/bootstrap-cookie-consent-settings.js", // ดึงไฟล์ใน folder




    // postSelectionCallback: function () {
    //     location.reload(cookieSettings) // reload after selection
    // }
})


function showSettingsDialog() {
    cookieSettings.showDialog()
}



$(document).ready(function () {
    cookieSettings.showDialog()
    $("#settingsOutput").text(JSON.stringify(cookieSettings.getSettings()))
    $("#settingsAnalysisOutput").text(cookieSettings.getSettings("analyses"))
});
