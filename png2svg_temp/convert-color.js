const fs = require('fs');
const { Image } = require('canvas');
global.Image = Image;
const ImageTracer = require('imagetracerjs');

ImageTracer.imageToSVG(
    '/Users/charlestalk/AntiGravity/Nordheim/copy-nordheim-logo.png',
    function(svgstr){ fs.writeFileSync('/Users/charlestalk/AntiGravity/Nordheim/copy-nordheim-logo.svg', svgstr); },
    { ltres: 1, qtres: 1, pathomit: 8, colorsampling: 2, numberofcolors: 256, mincolorratio: 0, colorquantcycles: 3 }
);
