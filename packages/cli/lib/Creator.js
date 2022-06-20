const path = require('path')
const inquirer = require('inquirer')
const execa = require('execa')
const util = require('util')
const fs = require('fs-extra')
const home = require('user-home')
const logger = require('./util/logger')
const exists = fs.existsSync
const downloadGitRepo = util.promisify(require('download-git-repo'))
const generate = require('./generate')

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
    const { name,context } = this
    const temPath = await this.downTemplate()
    if(!temPath) return
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
        const isCache = this.cache(tmp,currentTemplate)
        if (exists(downPath) && isCache){
          return downPath
        }
        fs.removeSync(downPath)
        logWithSpinner(`🗃`, `Download ${action} ...`)
        await downloadGitRepo(currentTemplate.full_name, downPath)
        stopSpinner()
        console.log(`🎉  Successfully download project.`)
        return downPath
      }
    }
  }
  cache(tmp,template) {
    const cacheFile = path.join(tmp,'update.json')
    if(!exists(cacheFile)) {
      const updateJson = {}
      updateJson[template.name] = template.pushed_at || ''
      fs.writeJsonSync(cacheFile,updateJson)
      return false
    }else{
      const fileJson = fs.readJsonSync(cacheFile) || {}
      if(fileJson[template.name] && fileJson[template.name]===template.pushed_at) {
        return true
      }else {
        fileJson[template.name] = template.pushed_at
        fs.writeJsonSync(cacheFile,fileJson)
        return false
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