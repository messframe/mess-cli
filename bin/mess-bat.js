#!/usr/bin/env node
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs')

const spinner = ora('create run.bat,build.bat...')
console.log(chalk.white('\n Start generating... \n'))

const runTask = new Promise((resolve, reject) => {
    let batStr = '@echo off\n'
    let files = fs.readdirSync(process.cwd());
    files.forEach(function (itm, index) {
        let stat = fs.statSync(process.cwd() + '/' + itm);
        if (stat.isDirectory()) {
            batStr += `start cmd /k "cd ${itm}&&npm run dev"\n`
        }
    })
    fs.writeFile(process.cwd() + "/run.bat", batStr, function(err) {
        if(err) {
            console.log(chalk.red('\n ' + err))
            reject(err)
        }
        resolve()
    });
})

const buildTask = new Promise((resolve, reject) => {
    let batStr = ''
    let files = fs.readdirSync(process.cwd());
    files.forEach(function (itm, index) {
        let stat = fs.statSync(process.cwd() + '/' + itm);
        if (stat.isDirectory()) {
            batStr += `cd ${itm}\n`
            batStr += `call npm run build\n`
            batStr += `cd ..\n`
        }
    })
    batStr += 'pause\n'
    fs.writeFile(process.cwd() + "/build.bat", batStr, function(err) {
        if(err) {
            console.log(chalk.red('\n ' + err))
            reject(err)
        }
        resolve()
    });
})


Promise.all([
    runTask,
    buildTask
]).then(() => {
    spinner.succeed();
    console.log(chalk.green('\n Generation completed!'))
}).catch(() => {
    spinner.fail();
    console.log(chalk.red('\n Generation failed!'))
})