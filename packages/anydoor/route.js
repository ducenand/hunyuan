const util = require('util')
const fs = require('fs')
const path = require('path')
const Handlebars = require('handlebars')
const stat = util.promisify(fs.stat)
const readir = util.promisify(fs.readdir)
const { contentType,iconPath } = require('./helper/mime')
const temPath = path.join(__dirname,'./template/index.html')
const source = fs.readFileSync(temPath,'utf8')
const template = Handlebars.compile(source)
const cache = require('./helper/cache')
const compress = require('./helper/compress')
const range = require('./helper/range')

module.exports = async (req,res,filePath,config)=>{
  try {
    const stats = await stat(filePath)
    if (stats.isFile()) {
      res.setHeader('Content-Type', contentType(filePath))
      if(cache(stats,req,res)) {
        res.statusCode = 304
        res.end()
        return
      }
      res.statusCode = 200
      let stream
      const {code, start, end} = range(stats.size, req, res);
      if (code === 200) {
        res.statusCode = 200;
        stream = fs.createReadStream(filePath,{flags: 'r'})
      } else {
        res.statusCode = 206;
        stream = fs.createReadStream(filePath, {start, end});
      }
      if(filePath.match(config.compress)) {
        stream = compress(stream,req,res)
      }
      stream.pipe(res)
    } else if (stats.isDirectory()) {
      const files = await readir(filePath)
      const dir = path.relative(config.root, filePath)
      res.statusCode = 200
      const data = {
        title: path.basename(filePath),
        dir: dir ? `/${dir}` : '',
        files: files.map(file => {
          return {
            file,
            icon: iconPath(file)
          }
        })
      }
      res.end(template(data))
    }
  }catch (e) {
    res.statusCode = 400
    res.setHeader('Content-Type','text/plain')
    res.end(`${filePath} is not a directory or file\n ${e.toString()}`)
  }
}