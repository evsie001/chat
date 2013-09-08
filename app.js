
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var UsersManager = require('./UsersManager');

var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
    io.set("log level", 2);
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);

var users = new UsersManager(io.sockets);

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {

    socket.on('user_up', function (data) {
        users.addUser(data.name, data.id, socket);
    });

    socket.on('message_up', function (data) {
        var user = users.findUserById(data.id);
        
        data.name = user.getName();

        io.sockets.emit('message_down', data);
    });
});