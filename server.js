var express = require('express');
var pg = require('pg');

var app = express();


function connection(url) {
    return function (query, done, error) {
        pg.connect(url, function (err, client, done) {
            if (err) {
                if (client) {
                    done(client);
                }
                error(err);
                return;
            }

            client.query(query, function (err, result) {
                if (err) {
                    done(client);
                    error(err);
                    return;
                }
                done(result);
            });
        });
    };
}

function handleError(res) {
    return function (err) {
        res.status(500).send({error: err});
    };
};

function name(client, table) {
    var query = {
        name: 'geoname-name',
        text: 'select st_asgeojson(the_geo) from ' + table +
            ' where name=$1 limit=$2 offset=$3'
    };
    return function (req, res) {
        var name = req.query.name;
        var limit = req.query.limit || 50;
        var offset = req.query.offset || 0;
        query.values = [name, limit, offset];
        client(query, function (result) {
            res.json(result);
        }, handleError(res));
    };
}

module.exports = function (url, table) {
    var conn = connection(url);

    table = table || 'geoname';
    app.get('/name', name(conn, table));
    return app;
};
