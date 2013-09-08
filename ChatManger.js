var ChatManager = function (users, sockets) {

    this.newMessage = function (data) {
        var user = users.findUserById(data.id);
        
        data.name = user.getName();

        sockets.emit('message_down', data);
    };
};

module.exports = ChatManager;