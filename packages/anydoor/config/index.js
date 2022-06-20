module.exports = {
  hostname: '127.0.0.1',
  root: process.cwd(),
  port: '9000',
  compress: /\.html|\.js|\.css|\.md|\.json/,
  cache: {
    maxAge: 600,
    expires: true,
    cacheControl: true,
    etag: true,
    lastModified: true
  }
}