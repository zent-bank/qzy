'use strict';

var admin = require('firebase-admin');
var path = require('path');
var os = require('os');
var fs = require("fs");
var is = require('is_js');
require("babel-polyfill");

function uploadFileWithBase64(params) {
    var tempFilePath, downloadUrl;
    return regeneratorRuntime.async(function uploadFileWithBase64$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    tempFilePath = path.join(os.tmpdir(), params.fileName);
                    // console.log("tempFilePath: "+tempFilePath);

                    fs.writeFile(tempFilePath, params.fileUpload, 'base64', function (err) {
                        if (is.not.empty(err) && is.not.undefined(err) && is.not.null(err)) {
                            console.log(err);
                        }
                    });
                    _context.next = 4;
                    return regeneratorRuntime.awrap(uploadFileWithStream(params));

                case 4:
                    downloadUrl = _context.sent;

                    // const bucket = admin.storage().bucket();
                    // const uploadedFile = await bucket.upload(tempFilePath,{destination:params.fileUploadPath});
                    // const config = {
                    //     action: 'read',
                    //     expires: '12-31-2025'
                    // };
                    // const url = await uploadedFile[0].getSignedUrl(config);
                    // console.log("url[0]: ",url[0]);
                    // return url[0];
                    console.log("downloadUrl: ", downloadUrl);
                    return _context.abrupt('return', downloadUrl);

                case 7:
                case 'end':
                    return _context.stop();
            }
        }
    }, null, this);
}

function getFileDownloadUrl(fileName) {
    var bucket, file, config, url;
    return regeneratorRuntime.async(function getFileDownloadUrl$(_context2) {
        while (1) {
            switch (_context2.prev = _context2.next) {
                case 0:
                    bucket = admin.storage().bucket();
                    file = bucket.file(fileName);
                    config = {
                        action: 'read',
                        expires: '12-31-2025'
                    };
                    _context2.next = 5;
                    return regeneratorRuntime.awrap(file.getSignedUrl(config));

                case 5:
                    url = _context2.sent;

                    console.log("url[0]: ", url[0]);
                    return _context2.abrupt('return', url[0]);

                case 8:
                case 'end':
                    return _context2.stop();
            }
        }
    }, null, this);
}

function uploadFileWithStream(params) {
    var bucket, tempFilePath, uploadedFile, config, url;
    return regeneratorRuntime.async(function uploadFileWithStream$(_context3) {
        while (1) {
            switch (_context3.prev = _context3.next) {
                case 0:
                    bucket = admin.storage().bucket();
                    tempFilePath = path.join(os.tmpdir(), params.fileName);
                    _context3.next = 4;
                    return regeneratorRuntime.awrap(bucket.upload(tempFilePath, { destination: params.fileUploadPath }));

                case 4:
                    uploadedFile = _context3.sent;
                    config = {
                        action: 'read',
                        expires: '12-31-2025'
                    };
                    _context3.next = 8;
                    return regeneratorRuntime.awrap(uploadedFile[0].getSignedUrl(config));

                case 8:
                    url = _context3.sent;

                    console.log("url[0]: ", url[0]);
                    return _context3.abrupt('return', url[0]);

                case 11:
                case 'end':
                    return _context3.stop();
            }
        }
    }, null, this);
}

module.exports = {
    uploadFileWithBase64: uploadFileWithBase64,
    getFileDownloadUrl: getFileDownloadUrl,
    uploadFileWithStream: uploadFileWithStream
};
