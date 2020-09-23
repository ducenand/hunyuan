const path = require('path')
const inquirer = require('inquirer')
const execa = require('execa')
const util = require('util')
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
    // 是否有git环境
    const shouldInitGit = this.shouldInitGit()
    if (shouldInitGit) {
      logWithSpinner(`🗃`, `git repository...`)
      const list = await fetchRepoList().catch(()=>{
        stopSpinner()
      })
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
        return
      } else {
        const currentTemplate = list.filter(item => {
          return item.name === action
        })[0].full_name
        logWithSpinner(`🗃`, `Download ${action} ...`)
        const result = await downloadGitRepo(currentTemplate,context + '/tmp').catch(()=>{
          stopSpinner()
        })
        stopSpinner()
      }

      // this.emit('creation', { event: 'git-init' })
      // await run('git init')
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