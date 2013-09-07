var User = require('./User');

var UsersManager = function (sockets) {
    var users = [];

    this.addUser = function (name, id, socket) {
        var user = this.findUserById(id);
        if (!user) {
            user = new User(name);
            users.push(user);
        }
        user.setSocket(socket);

        socket.emit('user_down', user.getData() );

        sockets.emit('user_joined', { name: user.getName() });
    };

    this.getUsers = function () {
        return users;
    };
    this.findUserById = function (id) {
        var user;
        for (var i = 0; i < users.length; i++) {
            if (users[i].getId() == id) {
                user = users[i];
            }
        }
        return user;
    };
};

module.exports = UsersManager;