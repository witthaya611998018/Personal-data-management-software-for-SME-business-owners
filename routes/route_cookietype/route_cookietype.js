const express = require('express');
const router = express.Router();

const cookietypes = require('../../controllers/controller_cookietype/controller_cookietype');
router.get('/setting/cookietypes', cookietypes.settingcookietypes);

router.post('/save/cookietypes', cookietypes.save); // save-cookietype 
router.post('/edit/cookietypes', cookietypes.edit); // edit-cookietype 
router.post('/delete/cookietypes', cookietypes.delete);


router.get('/api/cookietypes/', cookietypes.api_cookietypes);
router.post('/api/cookietypes/search', cookietypes.api_cookietypes_search);

// router.get('/api/searchName/:fname/:lname/:numname', machinereserve.search);


module.exports = router;