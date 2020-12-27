const {createGzip,createDeflate} = require('zlib')

module.exports = (stream,req,res) => {
  const acceptEncoding = req.headers['accept-encoding']

  if(!acceptEncoding || !acceptEncoding.match(/\b(gzip|defate)\b/)) {
    return stream;
  } else if(acceptEncoding.match(/\bgzip\b/)){
    res.setHeader('Content-Encoding','gzip')
    return stream.pipe(createGzip())
  } else if(acceptEncoding.match(/\bdefalte\b/)) {
    res.setHeader('Content-Encoding','deflate')
    return stream.pipe(createDeflate())
  }
}