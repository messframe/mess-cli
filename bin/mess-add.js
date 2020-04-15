#!/usr/bin/env node
const path = require('path')
const program = require('commander');
const download = require('download-git-repo');
const chalk = require('chalk');
const ora = require('ora');
const templateConf = require('../packages/template')
const tools = require('../util/tools')

program.usage('<template-name> [project-name] from [portal-name]')
program.parse(process.argv)

if (program.args.length < 1) return program.help()

let templateName = program.args[0]
let projectName = program.args[1]
let portalName = program.args[3]

if (!templateConf[templateName]) {
    const templates = Object.keys(templateConf).join(',')
    console.log(chalk.red('\n Template must be [' + templates + ']! \n '))
    return
}
if (!projectName) {
    console.log(chalk.red('\n Project should not be empty! \n '))
    return
}

let url = templateConf[templateName]

console.log(chalk.white('\n Start generating... \n'))
const spinner = ora("Downloading...");
spinner.start();

download(
    url,
    projectName,
    err => {
        if (err) {
            spinner.fail();
            console.log(chalk.red(`Generation failed. ${err}`))
            return
        }
        let port = tools.getRandomPort(process.cwd())
        let filePromise = []
        let pName = portalName || 'portal'
        /**
         * Modify name in project React
         */
        if (templateName === 'react') {
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/package.json`, [/mess_react/g, /portal/g, /8236/g], [projectName, pName, port]))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/webpack.config.js`, [/mess_react/g, /portal/g], [projectName, pName]))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/webpack.localDev.js`, [/mess_react/g, /portal/g], [projectName, pName]))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/set-public-path.js`, [/mess_react/g, /portal/g], [projectName, pName]))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/pages/App.js`, [/mess_react/g, /portal/g], [projectName, pName]))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/index.js`, /mess_react/g, projectName))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/pages/page1.js`, /mess_react/g, projectName))
        } else if (templateName === 'vue') {
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/package.json`, [/mess_vue/g, /portal/g], [projectName, pName]))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/vue.config.js`, [/mess_vue/g, /portal/g, /8237/g], [projectName, pName, port]))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/.env.dev`, /portal/g, pName))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/.env.prod`, /portal/g, pName))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/set-public-path.js`, [/mess_vue/g, /portal/g], [projectName, pName]))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/public/index.html`, /mess_vue/g, projectName))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/router/modulesA.js`, /mess_vue/g, projectName))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/pages/about.vue`, /mess_vue/g, projectName))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/pages/home.vue`, /mess_vue/g, projectName))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/pages/demo.vue`, /mess_vue/g, projectName))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/pages/subHome.vue`, /mess_vue/g, projectName))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/index.js`, /mess_vue/g, projectName))
        }
        /**
         * Modify config in portal project
         */
        if (portalName) {
            filePromise.push(tools.modifyPortalConfig(`${process.cwd()}/${portalName}/config.js`, portalName, projectName, port))
        }

        Promise.all(filePromise).then(() => {
            filePromise = []
            if (!portalName) {
                if (templateName === 'react') {
                    filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/webpack.config.js`, new RegExp(`../portal/build/${projectName}`, 'g'), `./build/${projectName}`))
                } else if (templateName === 'vue') {
                    filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/vue.config.js`, new RegExp(`../portal/build/${projectName}`, 'g'), `./build/${projectName}`))
                }
            }
            Promise.all(filePromise).then(() => {
                spinner.succeed();
                console.log(chalk.green('\n Generation completed!'))
                console.log('\n To get started')
                console.log(`\n cd ${projectName} \n`)
                console.log(`\n run npm install \n`)
            }).catch((err) => {
                throw err
            })
            
        }).catch(err => {
            spinner.fail();
            console.log(chalk.red('\n ' + err))
            console.log(chalk.red('\n Generation failed!'))
        })
    }
)