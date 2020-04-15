#!/usr/bin/env node
const download = require('download-git-repo');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const templateConf = require('../packages/template')

const tools = require('../util/tools')

let question = [{
    name: "projectName",
    message: "Please enter project name: ",
    validate(val) {
        if (val === '') {
            return 'Name is required!'
        } else {
            return true
        }
    }
}]

inquirer.prompt(question).then(answers => {
    let {
        projectName
    } = answers;
    let url = templateConf['portal']
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
            let filePromise = []
            /**
             * Modify name in project
             */
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/package.json`, /portal/g, projectName))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/mess.config.js`, /portal/g, projectName))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/common-deps.js`, /portal/g, projectName))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/index.html`, /portal/g, projectName))
            filePromise.push(tools.fileStrReplaceAll(`${process.cwd()}/${projectName}/src/config.js`, /portal/g, projectName))

            Promise.all(filePromise).then(() => {
                spinner.succeed();
                console.log(chalk.green('\n Generation completed!'))
                console.log('\n To get started')
                console.log(`\n cd ${projectName} \n`)
                console.log(`\n run npm install \n`)
            }).catch(err => {
                spinner.fail();
                console.log(chalk.red('\n ' + err))
                console.log(chalk.red('\n Generation failed!'))
            })
        }
    )
})