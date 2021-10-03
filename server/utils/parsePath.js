/**
 * Handle the windows and linux path 
 * @param {string} path request path
 * @returns 
 */
module.exports.parsePath = path => process.platform === 'win32' ? path.substring(1) : path;