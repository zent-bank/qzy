const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();


const db = admin.database();


router.post('/createShop', function(req, res, next) {
    let params = JSON.parse(req.body);
    let shopRef = db.ref('shops')
    shopRef.push({
        shop_name: params.shop_name,
        shop_category: params.category
    },error => {
        if(error){
            console.log("Found error while save to database: ",error);
            res.send({message:error});
        }
        res.send({result:true});
    });

    res.send({promo_list:params});
});


module.exports = router;