const express = require('express');
const router = express.Router();
const dataout_controllers = require('../controllers/dataout_controllers');

//const validator = require('../controllers/validator');
//const upload = require('express-fileupload')
//const multer = require('multer');
//const path = require('path');

router.get('/dataoutlist', dataout_controllers.list);
router.get('/dataouthashhistory', dataout_controllers.hash_history);
router.post('/checkdatamark', dataout_controllers.checkdatamark);
router.get('/dataoutlistadd', dataout_controllers.listadd);
router.post('/dataoutadd', dataout_controllers.add);
router.post('/dataoutselectmonth', dataout_controllers.selectmonth);
router.get('/dataoutchangedpo/:id', dataout_controllers.changedpo);
router.post('/dataoutaddhash/:id', dataout_controllers.dataoutaddhash);
router.get('/dataoutviewchart', dataout_controllers.viewchart);
router.get('/dataoutdporeview/:id/:id2', dataout_controllers.dporeview);
router.get('/dataoutdel/:id', dataout_controllers.del);
router.get('/dataoutdetails/:id', dataout_controllers.details);
router.get('/loginemail/:id', dataout_controllers.login);
router.post('/loginemail/showdataoutfilter', dataout_controllers.dataoutfilter);
router.get('/apisend/:token', dataout_controllers.apisend);




module.exports = router;