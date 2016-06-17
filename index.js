var server = require('./server');

server('postgres://postres@localhost/geonames', 'geoname').listen('3010', function () {
    console.log('listening on port 3010');
});
