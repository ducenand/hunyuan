const { cache } = require('../config/index')

const refreshRes = (stats,res)=>{
  const {maxAge,expires,cacheControl,etag,lastModified} = cache
  if(cacheControl) {
    res.setHeader('Cache-Control',`max-age:${maxAge}`)
  }
  if(expires){
    res.setHeader('Expires',(new Date(Date.now() + maxAge * 1000)).toUTCString())
  }
  if(lastModified) {
    res.setHeader('Last-Modified', stats.mtime.toUTCString())
  }
  if(etag) {
    res.setHeader('ETag', `${stats.size}-${stats.mtime}`)
  }
}

module.exports = (stats,req,res) =>{
  refreshRes(stats,res)
  const lastModified = req.headers['if-Modified-since']
  const etag = req.headers['if-none-match']
  if(!lastModified && !etag) {
    return false
  }
  if(lastModified && lastModified !== res.getHeader('Last-Modified')) {
    return false
  }
  return !(etag && etag !== res.getHeader('ETag'));
}