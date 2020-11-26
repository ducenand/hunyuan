const util = require('util')
const path = require('path')
const fs = require('fs')
const moment = require('moment')
const open = util.promisify(fs.open)
const read = util.promisify(fs.read)

/**
 * 计算视频资源的时间
 * @param buffer
 * @returns {number}
 */
function getTime (buffer) {
    // 关于 mvhd + 17 可以看下文档
    // https://www.yuque.com/5k/tdu0oz/ok8obr#IQ2ih
    const start = buffer.indexOf(Buffer.from('mvhd')) + 17
    const timeScale = buffer.readUInt32BE(start)
    const duration = buffer.readUInt32BE(start + 4)
    return Math.floor(duration / timeScale)
}

/**
 * 获取格式化时间
 * @param seconds
 * @returns {string}
 */
function getLocaleTime (seconds) {
    return moment
        .duration(seconds, 'seconds')
        .toJSON()
        .replace(/[PTHMSD]/g, str => {
            switch (str) {
            case 'H': return ':'
            case 'M': return ':'
            case 'S': return ''
            default: return ''
            }
        })
}


module.exports = async (filePath) => {
    const fd = await open(filePath, 'r')
    const buff = Buffer.alloc(100)
    const { buffer } = await read(fd, buff, 0, 100, 0)
    const time = getTime(buffer)
    const duration = getLocaleTime(time)
    let format = path.extname(filePath).split('.').pop().toLowerCase()
    let name = path.basename(filePath).split('.')[0]
    return [
        name,
        format,
        duration
    ]
}
