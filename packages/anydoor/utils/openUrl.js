const { exec } = require('child_process')
/**
 * 浏览器打开
 * @param url
 */
module.exports = (url)=>{
  switch (process.platform) {
    case 'darwin': //mac
      exec(`open ${url}`)
      break
    case 'win32': //window
      exec(`start ${url}`)
      break

  }
}