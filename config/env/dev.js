module.exports = {
    db: {
        url: 'mongodb://localhost/sentinel',
        options: {
            user: '',
            pass: '',
            promiseLibrary: require('bluebird'),
          }
    }
}