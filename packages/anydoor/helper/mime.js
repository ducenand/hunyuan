const path = require('path');

const mimeTypes = {
  css: {type: 'text/css', icon: 'uk'},
  gif:{type:'image/gif', icon: 'pic'},
  html: {type: 'text/html', icon: 'txt'},
  ico: {type:'image/x-icon', icon: 'pic'},
  jpeg: {type:'image/jpeg',icon:'pic'},
  jpg: {type:'image/jpeg',icon:'pic'},
  js: {type:'text/javascript',icon:'txt'},
  json: {type:'application/json',icon:'txt'},
  pdf: {type:'application/pdf',icon:'pic'},
  png: {type:'image/png',icon:'pic'},
  svg: {type:'image/svg+xml',icon:'pic'},
  swf: {type:'image/svg+xml',icon:'mp4'},
  tiff: {type:'image/tiff',icon:'txt'},
  txt: {type:'text/plain',icon:'txt'},
  wav: {type:'audio/x-wav',icon:'pm4'},
  wma: {type:'audio/x-ms-wma',icon:'mp4'},
  wmv: {type:'video/x-ms-wmv',icon:'pm4'},
  mp4: {type:'video/mp4',icon:'pm4'},
  xml: {type:'text/xml',icon:'pm4'}
};

exports.contentType=  function (filePath){
  let ext = path.extname(filePath).split('.').pop().toLowerCase();
  if (!ext) {
    ext = filePath;
  }
  if(!mimeTypes[ext]) return mimeTypes['txt'].type;
  return mimeTypes[ext].type || mimeTypes['txt'].type;
}

exports.iconPath= function(filePath) {
  let ext = path.extname(filePath).split('.').pop().toLowerCase();
  if (!ext) {
    return 'txt'
  }
  if(!mimeTypes[ext]) return 'uk'
  return mimeTypes[ext].icon || 'uk'
}
