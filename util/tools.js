const fs = require('fs');

function fileStrReplaceAll (path, searchStr, replaceStr) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) reject(err);
            let str = data.toString()
            if (!searchStr.length) {
                str = str.replace(searchStr, replaceStr)
            } else {
                searchStr.forEach((reg, index) => {
                    if (replaceStr[index]) {
                        str = str.replace(reg, replaceStr[index])
                    }
                })
            }
            fs.writeFile(
                path,
                str,
                function (err) {
                    if (err) reject(err);
                    resolve(true)
                })
        });
    })
}

function modifyPortalConfig (path, portalName, projectName, port) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) reject(err);
            let configJson = JSON.parse(data.toString().replace('module.exports = ', ''))
            configJson.components[projectName] = {
                "moduleName": `@${portalName}/${projectName}`,
                "origin": "http://localhost:" + port,
                "entry": `/${projectName}.js`
            }
            fs.writeFile(
                path,
                'module.exports = ' + JSON.stringify(configJson),
                function (err) {
                    if (err) reject(err);
                    resolve(true)
                })
        });
    })
}

function getRandomPort (path) {
    let basePort = 8234
    let files = fs.readdirSync(path);
    let count = 0
    files.forEach(function (itm, index) {
        let stat = fs.statSync(path + '/' + itm);
        if (stat.isDirectory()) {
           count ++
        }
    })
    return basePort + count
}

exports = module.exports = {
    fileStrReplaceAll,
    modifyPortalConfig,
    getRandomPort
}