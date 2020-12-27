const conf = require('./config/index')
const openUrl = require('./utils/openUrl')
const http = require('http')
const path = require('path')
const route = require('./route')

/**
 * http server
 */
class Server {
  constructor (config) {
    this.config = Object.assign({},conf,config)
  }
  start() {
    const server = http.createServer((req,res)=>{
      const filePath = path.join(this.config.root,req.url)
      route(req,res,filePath,this.config)
    })
    server.listen(this.config.port,this.config.hostname,()=>{
      const url = `http://${this.config.hostname}:${this.config.port}`
      console.log(`Server started at ${url}`)
      openUrl(url)
    })
  }
}

module.exports = Server