'use strict'

var qr = require('qr-image');

var qr_svg = qr.image('I love QR!', { type: 'png' });
qr_svg.pipe(require('fs').createWriteStream('i_love_qr.png'));

var svg_string = qr.imageSync('I love QR!', { type: 'png' });