const axios = require('axios')
const chalk = require('chalk')
const BASE_URL = 'https://api.github.com'
exports.fetchRepoList = async () => {
  const res = await axios.get(BASE_URL+'/orgs/FE-project-template/repos').catch((err)=>{
    console.log()
    console.log(chalk.red('check your network connection'))
    console.log('error message:' + chalk.red(err.message.trim()))
    process.exit(1)
  })
  if(res.status === 200) {
    return res.data.map(item => {
      return {
        name: item.name,
        full_name: item.full_name,
        html_url: item.html_url,
        clone_url: item.clone_url,
        description: item.description,
        pushed_at: item.pushed_at
      }
    })
  } else {
    console.log(chalk.red('fetch repo list error:' + res.message))
    process.exit(1)
  }

}