var User = function (name) {
    var id = generateId(name),
        socket;

    this.getId = function () {
        return id;
    };
    this.getName = function () {
        return name;
    };
    this.getSocket = function () {
        return socket;
    };
    this.getData = function () {
        return {
            name: name,
            id: id
        };
    };

    this.setSocket = function (socket) {
        socket = socket;
    };

    function generateId (string) {
        return ( new Date().getTime() ) + string;
    }
    function userDown () {
        var data = {
            name: name,
            id: id
        };
        socket.emit('user_down', data);
    }
};

module.exports = User;