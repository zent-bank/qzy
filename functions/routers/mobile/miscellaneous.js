const express = require('express');
const router = express.Router();

/* GET users listing. */
router.post('/sendQuestion', function(req, res, next) {
    let params = req.body;
    res.send({result:true});
});

router.post('/prepareUserQR', function(req, res, next) {
    let params = req.body;
    res.send({user_qr_path:"http://xxxx.yyyy/path/image"});
});


module.exports = router;