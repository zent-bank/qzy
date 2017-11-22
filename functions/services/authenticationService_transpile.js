"use strict";

var admin = require('firebase-admin');
require("babel-polyfill");

function authenticate(req) {
    var token, verifyToken;
    return regeneratorRuntime.async(function authenticate$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    token = req.header("Authorization");
                    _context.next = 3;
                    return regeneratorRuntime.awrap(admin.auth().verifyIdToken(token));

                case 3:
                    verifyToken = _context.sent;
                    return _context.abrupt("return", verifyToken.uid);

                case 5:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
}

module.exports = {
    authenticate: authenticate
};
