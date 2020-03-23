#! /usr/bin/env node

const program = require('commander');

program
 .version(require('../package').version)
 .usage('<command> [options]')
 .command('add', 'add a sub module')
 .command('init', 'generate a new project(microservice portal project) from a template')
 .command('bat', 'generate run.bat,build.bat from local project')
  
// 解析命令行参数
program.parse(process.argv)