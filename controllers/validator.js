const { check } = require('express-validator');

exports.setting = [
    check('num_admin', "กรุณากรอกข้อมูลให้ถูกต้อง !!").not().isEmpty().isNumeric(),
    check('num_user', "กรุณากรอกพาสเวิร์ดให้ถูกต้อง !!").not().isEmpty().isNumeric(),
    check('pw_keep', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty().isNumeric(),
    check('ntp', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('timezone', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('ip', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('netmark', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('gateway', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('dns', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty()
];
exports.adddevice = [
    check('status', "กรุณากรอกข้อมูลให้ถูกต้อง !!").not().isEmpty(),
    check('de_type', "กรุณากรอกพาสเวิร์ดให้ถูกต้อง !!").not().isEmpty(),
    check('data_type', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('sender', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('eth', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('port', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('hostname', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('name', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty()
];
exports.addaccount = [
    check('firstname', "กรุณากรอกข้อมูลให้ถูกต้อง !!").not().isEmpty(),
    check('lastname', "กรุณากรอกพาสเวิร์ดให้ถูกต้อง !!").not().isEmpty(),
    check('name', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('position', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('email', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('phone', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('contact', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('ext', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('line', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('bd', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('username', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty(),
    check('password', "กรุณากรอกข้อมูลชื่อให้ถูกต้อง !!").not().isEmpty()
];