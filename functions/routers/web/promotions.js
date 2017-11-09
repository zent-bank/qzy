const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();


const db = admin.database();


router.post('/createPromotion', function(req, res, next) {
    let params = JSON.parse(req.body);
    let promotionRef = db.ref('promotions').child(params.shop_id)
    promotionRef.set({
        promo_id: 12345,
        promo_image_path: "",
        promo_code: "ABC123",
        promo_start: "01/01/2017",
        promo_end: "31/10/2017",
        promo_description: "ส่วนลด",
        promo_detail: "รายละเอียด Promotion",
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