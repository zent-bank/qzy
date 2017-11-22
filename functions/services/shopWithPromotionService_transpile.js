'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var express = require('express');
var admin = require('firebase-admin');
var is = require('is_js');
var _ = require('lodash');
var moment = require('moment');

var router = express.Router();
var db = admin.database();
var constant_promotions = "promotions";
var constant_shops = "shops";
var promotionRef = db.ref(constant_promotions);
var shopRef = db.ref(constant_shops);
require("babel-polyfill");

function shopInfoWithPromotion(currentDate) {
    var promoList, promotionInfo, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _step$value, key, value, shopId, shopInfo, promotion;

    return regeneratorRuntime.async(function shopInfoWithPromotion$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    promoList = [];
                    _context.next = 3;
                    return regeneratorRuntime.awrap(promotionRef.orderByChild("promo_createDate").startAt(currentDate).once("value"));

                case 3:
                    promotionInfo = _context.sent;
                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    _context.prev = 7;
                    _iterator = Object.entries(promotionInfo.val())[Symbol.iterator]();

                case 9:
                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                        _context.next = 26;
                        break;
                    }

                    _step$value = _slicedToArray(_step.value, 2), key = _step$value[0], value = _step$value[1];
                    shopId = value.shop_id;
                    // console.log("shopId: ",shopId);

                    _context.next = 14;
                    return regeneratorRuntime.awrap(shopRef.child(shopId).once("value"));

                case 14:
                    shopInfo = _context.sent;

                    // console.log("shopInfo.val(): ",shopInfo.val());
                    promotion = {};

                    promotion.shop_id = shopId;
                    promotion.shop_name = shopInfo.val().shop_name;
                    promotion.promo_code = value.promo_code;
                    promotion.promo_description = value.promo_description;
                    promotion.promo_id = value.promo_id;
                    promotion.is_fav = false;

                    promoList.push(promotion);

                case 23:
                    _iteratorNormalCompletion = true;
                    _context.next = 9;
                    break;

                case 26:
                    _context.next = 32;
                    break;

                case 28:
                    _context.prev = 28;
                    _context.t0 = _context['catch'](7);
                    _didIteratorError = true;
                    _iteratorError = _context.t0;

                case 32:
                    _context.prev = 32;
                    _context.prev = 33;

                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }

                case 35:
                    _context.prev = 35;

                    if (!_didIteratorError) {
                        _context.next = 38;
                        break;
                    }

                    throw _iteratorError;

                case 38:
                    return _context.finish(35);

                case 39:
                    return _context.finish(32);

                case 40:
                    return _context.abrupt('return', promoList);

                case 41:
                case 'end':
                    return _context.stop();
            }
        }
    }, null, this, [[7, 28, 32, 40], [33,, 35, 39]]);
}

function findPromotionByCurrentDate(currentDate) {
    var promotions;
    return regeneratorRuntime.async(function findPromotionByCurrentDate$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    _context2.next = 2;
                    return regeneratorRuntime.awrap(promotionRef.orderByChild("promo_createDate").startAt(currentDate).once("value"));

                case 2:
                    promotions = _context2.sent;
                    return _context2.abrupt('return', promotions.val());

                case 4:
                case 'end':
                    return _context2.stop();
            }
        }
    }, null, this);
}

function findAllPromotionByShopId(shopId) {
    var promotions;
    return regeneratorRuntime.async(function findAllPromotionByShopId$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    _context3.next = 2;
                    return regeneratorRuntime.awrap(promotionRef.orderByChild("shop_id").startAt(shopId).once("value"));

                case 2:
                    promotions = _context3.sent;
                    return _context3.abrupt('return', promotions.val());

                case 4:
                case 'end':
                    return _context3.stop();
            }
        }
    }, null, this);
}

function findPromotionByPromoId(promoId) {
    var promotion;
    return regeneratorRuntime.async(function findPromotionByPromoId$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    _context4.next = 2;
                    return regeneratorRuntime.awrap(promotionRef.child(promoId).once("value"));

                case 2:
                    promotion = _context4.sent;
                    return _context4.abrupt('return', promotion.val());

                case 4:
                case 'end':
                    return _context4.stop();
            }
        }
    }, null, this);
}

function findShopFromShopId(shopId) {
    var shop;
    return regeneratorRuntime.async(function findShopFromShopId$(_context5) {
        while (1) {
            switch (_context5.prev = _context5.next) {
                case 0:
                    _context5.next = 2;
                    return regeneratorRuntime.awrap(shopRef.child(shopId).once("value"));

                case 2:
                    shop = _context5.sent;
                    return _context5.abrupt('return', shop.val());

                case 4:
                case 'end':
                    return _context5.stop();
            }
        }
    }, null, this);
}

module.exports = {
    shopInfoWithPromotion: shopInfoWithPromotion,
    findPromotionByCurrentDate: findPromotionByCurrentDate,
    findAllPromotionByShopId: findAllPromotionByShopId,
    findPromotionByPromoId: findPromotionByPromoId,
    findShopFromShopId: findShopFromShopId
};
