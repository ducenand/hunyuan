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
      // const child = run('npm install')
      const child = execa('npm', ['install'], { cwd: context, stdio: ['inherit', 'inherit', 'inherit']})
      // child.stdout.on('data', buffer => {
      //   process.stdout.write(buffer)
      // })
      child.on('close', code => {
        if (code !== 0) {
          logger.fatal('command failed: npm install')
          return
        }
        console.log()
        logger.success('Generated "%s".', name)
      })

    })
  }

  async downTemplate() {
    // 是否有git环境
    const shouldInitGit = this.shouldInitGit()
    const tmp = path.join(home, '.hunyuan-templates')
    if (shouldInitGit) {
      logWithSpinner(`🗃`, `git repository...`)
      const list = await fetchRepoList()
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
        if (exists(downPath)){
          return downPath
        }
        // rm(downPath)
        logWithSpinner(`🗃`, `Download ${action} ...`)
        await downloadGitRepo(currentTemplate.full_name, downPath)
        stopSpinner()
        return downPath
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