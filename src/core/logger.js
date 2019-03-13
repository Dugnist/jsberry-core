/*
 * JsBerry
 * Source: https://github.com/Dugnist/jsberry
 *
 * logger
 *
 * Author: Dugnist Alexey (@Dugnist)
 * Released under the MIT license
 */

const CONFIG = require('./config')();
const fs = require('fs');
const chalk = require('chalk');
const logs = CONFIG.logs || 'logs';

let context = '';
let nowDate = '';
let logPath = '';

const Logger = {
  /**
   * logger initialization
   * check for logs directory
   * create initial log file
   * @param  {String} ctx - logger context
   * @type   {function}
   */
  init: async(ctx) => {
    context = ctx;
    nowDate = new Date( Date.now() ).toLocaleString().replace(/ /g, '');

    await Logger.checkLogFolder();

    logPath = `${logs}/${nowDate.replace(/[/,:]/g, '_')}.log`;
  },

  /**
   * logger initialization
   * check for logs directory
   * create initial log file
   * @type {Function}
   */
  checkLogFolder: async() => {
    try {
      const existLogDir = await fs.exists(logs, () => {});
      if (!existLogDir) await fs.mkdir(logs, () => {});
    } catch (error) {
      Logger.logMessage(error.message, chalk.red);
    }
  },

  /**
   * Check for exist log folder and write message to log file
   * @param  {String} type - message type
   * @param  {String} message - message text
   */
  writeToFile: async(type = '', message = '') => {
    try {
      const record = Logger.toJSON({ type, message });

      await Logger.checkLogFolder();
      await fs.writeFile(logPath, record, () => {});
    } catch (error) {
      Logger.logMessage(error.message, chalk.red);
    }
  },

  /**
   * Remove the last log file
   */
  clear: async() => {
    await Logger.checkLogFolder();

    fs.readdir(logs, (err, files) => {
      files.forEach((file) => {
        if (`${logs}/${file}` !== logPath) {
          fs.unlink(`${logs}/${file}`, (error) => {
            if (error) Logger.error('Can\'t delete log file', error);
          });
        }
      });
      Logger.init(context);
    });
  },

  /**
   * Output info message to terminal
   * @param  {String} message - message text
   */
  log: (message = '') => {
    Logger.logMessage(Logger.toJSON(message), chalk.green);
  },

  /**
   * Output warning message to terminal
   * write message text to log file
   * @param  {String} message - message text
   */
  warn: (message = '') => {
    Logger.logMessage(Logger.toJSON(message), chalk.yellow);
    Logger.fileLogger('warn', message);
  },

  /**
   * Output error message to terminal
   * write message text to log file
   * @param  {String} message - message text
   * @param  {String} trace - [description]
   */
  error: (message = '', trace = '') => {
    Logger.logMessage(Logger.toJSON(message), chalk.red);
    Logger.printStackTrace(trace);
    Logger.fileLogger('error', message, trace);
  },

  /**
   * Write message type, message text and trace to log file
   * @param  {String} type - message type
   * @param  {String} message - message text
   * @param  {String} trace - message trace
   */
  fileLogger: (type = 'error', message = '', trace = '') => {
    const mode = CONFIG.mode || 'production';

    // if (mode === 'production') {
    if (mode === 'development') {
      Logger.writeToFile(type, `${message} ${Logger.toJSON(trace)
        .replace(/\\n|"/g, '')}`);
    }
  },

  /**
   * Output colored text to the terminal
   * @param  {String} message - message text
   * @param  {String} color - message color
   */
  logMessage: (message = '', color = '') => {
    process.stdout.write(color(`${CONFIG.name} ${process.pid} - `));
    process.stdout.write(`${nowDate} `);
    process.stdout.write(chalk.yellow(`[${context}] `));
    process.stdout.write(color(message));
    process.stdout.write(`\n`);
  },

  /**
   * Output error trace to the terminal
   * @param  {String} trace - error description
   * @return {log}
   */
  printStackTrace: (trace = '') => process.stdout.write(trace),

  /**
   * Convert JSON object to string
   * @param  {Object} reference - JSON/JS object
   * @return  {String} converted string
   */
  toJSON: (reference = {}) => JSON.stringify(reference),
};

module.exports = {
  init: Logger.init,
  log: Logger.log,
  warn: Logger.warn,
  error: Logger.error,
  clear: Logger.clear,
  logMessage: Logger.logMessage,
  fileLogger: Logger.fileLogger,
  writeToFile: Logger.writeToFile,
  checkLogFolder: Logger.checkLogFolder,
  printStackTrace: Logger.printStackTrace,
  toJSON: Logger.toJSON,
};
