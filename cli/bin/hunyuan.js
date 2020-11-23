#!/usr/bin/env node
// --inspect-brk
const { program } = require('commander')
const chalk = require('chalk')
const leven = require('leven')

program
  .version(`@hunyuan/cli ${require('../package.json').version}`)
  .usage('<command> [options]')

program
  .command('create <app-name>')
  .description('generate a project from a remote template')
  // .option('-p, --preset <presetName>', 'Skip prompts and use saved or remote preset')
  .action((name,cmd)=>{
    const options = cleanArgs(cmd)
    require('../lib/create')(name,options)
  })

program
  .command('list')
  .description('displays all available templates')
  .action(()=>{
    require('../lib/template')()
  })

program
.command('meta')
.description('meta test')
.action(()=>{
  require('../lib/meta')
})

program
.arguments('<command>')
.action((cmd) => {
  program.outputHelp()
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
  console.log()
  // 命令输入错误，给出建议命令
  suggestCommands(cmd)
})

// 增强帮助信息
program.on('--help', () => {
  console.log()
  console.log(`  Run ${chalk.cyan(`hunyuan <command> --help`)} for detailed usage of given command.`)
  console.log()
})

program.commands.forEach(c => c.on('--help', () => console.log()))

const enhanceErrorMessages = require('../lib/util/enhanceErrorMessages')
// 错误传参
enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})
// 错误选项
enhanceErrorMessages('unknownOption', optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return `Missing required argument for option ${chalk.yellow(option.flags)}` + (
    flag ? `, got ${chalk.yellow(flag)}` : ``
  )
})

program.parse(process.argv);

function suggestCommands (unknownCommand) {
  const availableCommands = program.commands.map(cmd => cmd._name)

  let suggestion

  availableCommands.forEach(cmd => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd
    }
  })

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
  }
}

function camelize (str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''))
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}