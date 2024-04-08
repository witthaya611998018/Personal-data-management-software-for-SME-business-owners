const controller = {};
const otpGenerator = require('otp-generator')
var nodemailer = require('nodemailer');
const speakeasy = require('speakeasy')

function otp_email() {
    OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    return OTP;

}
controller.otp = (req, res) => {
    const data = req.body;
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        res.render('./OTP/otp', { session: req.session });
    }
};
controller.email = (req, res) => {
    id = req.session.userid;
    const data = req.body;
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {
        req.getConnection((err, conn) => {
            var qwe = otp_email()
            req.session.otp = qwe;
            console.log(qwe);
            conn.query('SELECT * FROM TB_TR_ACCOUNT WHERE acc_id = ? ', [id], (err, account) => {
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'mosbaiyoke@gmail.com',
                        pass: 'ufogutsqimnsmzsy'
                    }
                });
                var mailOptions = {
                    from: 'mosbaiyoke@gmail.com',
                    to: account[0].email,
                    subject: 'OPT by ALLTRA',
                    text: qwe,
                    html: `<h2>${qwe}</h2>`
                };
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log('Email error: ' + error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }

                });
                res.render('./OTP/email_otp', { session: req.session });
            });
        });
    }
};

controller.verify_email = (req, res) => {
    const data = req.body;
    otp = req.session.otp
    id = req.session.userid;

    console.log(otp, data);
    if (otp == data.otp_email) {
        console.log('index2');
        res.redirect('/index2');
    } else {
        res.redirect('/logout');
    }

};
controller.google = (req, res) => {
    id = req.session.userid;
    console.log(id);
    if (typeof req.session.userid == 'undefined') { res.redirect('/'); } else {

        req.getConnection((err, conn) => {
            conn.query('SELECT * FROM `TB_TR_QRCODE` WHERE acc_id =?', [id], (err, data) => {
                //res.json(data);
                console.log(data);
                res.render('./OTP/google_otp', {
                    data: data,
                    session: req.session
                });

            });
        });
    }
};

controller.verify_google = (req, res) => {
    const data = req.body;
    console.log(data);
    var verified = speakeasy.totp.verify({
        secret: data.ascii,
        encoding: 'ascii',
        token: data.token
    })
    console.log(verified);
    if (verified == true) {
        console.log('index2');
        res.redirect('/index2');
    } else {
        res.redirect('/logout');
    }

};
module.exports = controller;