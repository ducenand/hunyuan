const chalk = require('chalk')
const { fetchRepoList } = require('./util/gitTemplate')
const { clearConsole } = require('./util/logger')
const { logWithSpinner,stopSpinner } = require('./util/spinner')
module.exports = async ()=>{

  // process.on('exit', () => {
  //   console.log()
  // })
  logWithSpinner(`🗃`, `All of the template`)
  const list = await fetchRepoList().catch((err)=>{
    console.log(err)
    stopSpinner()
  })
  stopSpinner()
  // await clearConsole()
  console.log()
  list.forEach(repo => {
    console.log(
      '  ' + chalk.yellow('★') +
      '  ' + chalk.blue(repo.name) +
      ' - ' + repo.description)
  })
}