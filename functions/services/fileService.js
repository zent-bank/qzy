const admin = require('firebase-admin');
const path = require('path');
const os = require('os');
const fs = require("fs");
const is = require('is_js')
require("babel-polyfill");

async function uploadFileWithBase64(params){
    const tempFilePath = path.join(os.tmpdir(), params.fileName);
    // console.log("tempFilePath: "+tempFilePath);
    fs.writeFile(tempFilePath, params.fileUpload, 'base64', function(err) {
        if(is.not.empty(err) && is.not.undefined(err) && is.not.null(err)){
            console.log(err);
        }
    });
    const downloadUrl = await uploadFileWithStream(params);
    // const bucket = admin.storage().bucket();
    // const uploadedFile = await bucket.upload(tempFilePath,{destination:params.fileUploadPath});
    // const config = {
    //     action: 'read',
    //     expires: '12-31-2025'
    // };
    // const url = await uploadedFile[0].getSignedUrl(config);
    // console.log("url[0]: ",url[0]);
    // return url[0];
    console.log("downloadUrl: ",downloadUrl);
    return downloadUrl;
}

async function getFileDownloadUrl(fileName){
    const bucket = admin.storage().bucket();
    const file = bucket.file(fileName);
    const config = {
        action: 'read',
        expires: '12-31-2025'
    };
    const url = await file.getSignedUrl(config);
    console.log("url[0]: ",url[0]);
    return url[0];
}

async function uploadFileWithStream(params){
    const bucket = admin.storage().bucket();
    const tempFilePath = path.join(os.tmpdir(), params.fileName);
    const uploadedFile = await bucket.upload(tempFilePath,{destination:params.fileUploadPath});
    const config = {
        action: 'read',
        expires: '12-31-2025'
    };
    const url = await uploadedFile[0].getSignedUrl(config);
    console.log("url[0]: ",url[0]);
    return url[0];
}

module.exports = {
    uploadFileWithBase64,
    getFileDownloadUrl,
    uploadFileWithStream
};