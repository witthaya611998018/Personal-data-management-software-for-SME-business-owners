const express = require('express');
const router = express.Router();
const getdata_controllers = require('../controllers/getdata_controllers');


router.get('/getperformance', getdata_controllers.getperformance);

module.exports = router;