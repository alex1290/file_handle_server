if (process.env.NODE_ENV === 'production') {
    require('./server.js')
} else {
    require('nodemon')({ script: 'server.js' });
}