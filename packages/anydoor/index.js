const Server = require('./server')
const yargs = require('yargs')
const portfinder = require('portfinder')
const argv = yargs
  .usage('anydoor [option]')
  .option('p',{
    alias: 'port',
    describe:'端口号',
    default:'9000'
  })
  .option('h',{
    alias: 'hostname',
    describe:'host',
    default:'127.0.0.1'
  })
  .option('d',{
    alias: 'root',
    describe:'root path',
    default: process.cwd()
  })
  .version()
  .alias('v','version')
  .help()
  .argv;

portfinder.getPort({
  port: argv.port
},(err,port)=>{
  if(err) return
  if(argv.port!==port) argv.port = port
  const server = new Server(argv)
  server.start()
})