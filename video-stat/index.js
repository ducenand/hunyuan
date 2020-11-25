const util = require('util')
const path = require('path')
const fs = require('fs')
const stat = util.promisify(fs.stat)
const readdir = util.promisify(fs.readdir)

const filePath = path.resolve(process.cwd() , process.argv[2])
// 视频信息
const videoInfo = require('./lib/videoInfo')

;(async function () {
    try {
        const stats = await stat(filePath)
        if(stats.isFile()) {
            const data = await videoInfo(filePath)
            const res = `视频名称: ${data.name} ,格式: ${data.format} ,视频总时长:${data.duration}`
            // 输出单个视频文件信息
            console.log(res)
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
                    console.log(res)
                })
            } else {
                console.error('目录为空')
            }
        }
    }catch (e) {
        console.error(e)
    }
})()