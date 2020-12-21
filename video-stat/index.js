const util = require('util')
const path = require('path')
const fs = require('fs')
const stat = util.promisify(fs.stat)
const readdir = util.promisify(fs.readdir)
const Table = require('cli-table')
const clc = require("cli-color")

const table = new Table({
    head: ['name', 'format', 'duration'],
    chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
        , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
        , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
        , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
})

const filePath = path.resolve(process.cwd() , process.argv[2])
// 视频信息
const videoInfo = require('./lib/videoInfo')

;(async function () {
    try {
        const stats = await stat(filePath)
        if(stats.isFile()) {
            const data = await videoInfo(filePath)
            // 输出单个视频文件信息
            table.push(data)
            console.log(clc.blue(table.toString()))
        } else if (stats.isDirectory()) {
            const files = await readdir(filePath)
            if(Array.isArray(files)) {
                let total = []
                for (const item of files) {
                    const formatList = ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv', 'wmv', 'asf', 'dat', 'f4v', 'mpg', 'ts', 'webm', 'vob', 'mov']
                    const format = path.extname(item).split('.').pop().toLowerCase()
                    if(formatList.includes(format)){
                        const file = path.resolve(filePath ,item )
                        const data = videoInfo(file)
                        total.push(data)
                    }
                }
                // eslint-disable-next-line no-undef
                Promise.all(total).then((res)=>{
                    // 输出目录下所有视频
                    table.push(...res)
                    console.log(clc.blue(table.toString()))
                })
            } else {
                console.error('目录为空')
            }
        }
    }catch (e) {
        console.error(e)
    }
})()