const path = require('path')
const inquirer = require('inquirer')
const execa = require('execa')
const util = require('util')
const generate = require('./generate')
const home = require('user-home')
const logger = require('./logger')
const exists = require('fs').existsSync
const rm = require('rimraf').sync
const downloadGitRepo = util.promisify(require('download-git-repo'))

const EventEmitter = require('events')
const { hasGit,hasProjectGit} = require('./util/verify')
const { logWithSpinner,stopSpinner } = require('./util/spinner')
const { fetchRepoList } = require('./util/gitTemplate')

module.exports = class Creator extends EventEmitter {
  constructor (name,context) {
    super()
    this.name = name
    this.context = context
    this.run = this.run.bind(this)
  }
  async create (cliOpitons = {}) {
    const { run,name,context } = this
    const temPath = await this.downTemplate()
    generate(name, temPath, context,  err => {
      if (err) logger.fatal(err)
    })
  }
  async downTemplate() {
    // 是否有git环境
    const shouldInitGit = this.shouldInitGit()
    const tmp = path.join(home, '.hunyuan-templates')
    if (shouldInitGit) {
      logWithSpinner(`🗃`, `git repository...`)
      const list = await fetchRepoList()
      // console.log(list)
      stopSpinner()
      list.push({
        name: 'Cancel', value: false
      })
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: `Select the front-end project template. Pick an action:`,
          choices: list
        }
      ])
      if(!action) {
        return false
      } else {
        const currentTemplate = list.filter(item => {
          return item.name === action
        })[0]
        const downPath = path.join(tmp,currentTemplate.name)
        //todo 缓存 版本校验
        if (exists(downPath)){
          return downPath
        }
        // rm(downPath)
        logWithSpinner(`🗃`, `Download ${action} ...`)
        await downloadGitRepo(currentTemplate.full_name, downPath)
        stopSpinner()
        return downPath
      }
    }
  }
  run (command, args) {
    if (!args) { [command, ...args] = command.split(/\s+/) }
    return execa(command, args, { cwd: this.context })
  }

  shouldInitGit () {
    if (!hasGit()) {
      return false
    }
    // default: true unless already in a git repo
    return !hasProjectGit(this.context)
  }
}