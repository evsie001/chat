var DOMS = DOMS || {};

var Flash = function (msg, type, timed) {
    var template = _.template('<div class="flash <%= type %>"><%= message %></div>');
    var $root = $( template({ message: msg, type: type }) );
    $root.prependTo('#flash_container');

    this.remove = function () {
        $root.fadeOut();
    };

    if (timed) setTimeout(this.remove, 3000);
};

var ChatInt = function ($page) {
    var $root = $('<div class="chat" id="chat"></div>');
    $root.appendTo($page);

    var template = _.template('<p><strong><%= user %></strong> <%= msg %></p>');

    DOMS.socket.on('get msg', function (data) {
        $(template(data)).appendTo($root);
    });
};

var PromptInt = function ($page) {
    var $root = $('<div class="prompt" id="prompt"></div>');
    var $name = $('<input placeholder="name" class="name">');
    var $message = $('<textarea placeholder="message" class="message"></textarea>');

    $name.appendTo($root);
    $message.appendTo($root);

    $root.appendTo($page);

    $message.keypress(function (event) {
        var user, message;
        if (event.which === 13) {
            event.preventDefault();
            user = $name.val();
            message = $message.val();
            $message.val('').focus();
            message = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
            DOMS.socket.emit('post msg', { msg: message, user: user });
        } else {
            user = $name.val();
            DOMS.socket.emit('post typing', { user: user });
        }
    });
};

function init () {
    var $page = $('#page');

    DOMS.socket = io.connect('http://' + window.location.hostname);

    DOMS.socket.on('connecting', function () {
        console.log('Connecting...');
        DOMS.loading_flash = new Flash("Connecting...", "info");
    });

    DOMS.socket.on('connect', function () {
        console.log('Connected.');

        DOMS.loading_flash.remove();

        new Flash("Connected!", "notice", true);
        
        DOMS.chat_int = new ChatInt($page);
        DOMS.prompt_int = new PromptInt($page);
    });

    DOMS.socket.on('connect_error', function () {
        DOMS.loading_flash.remove();

        new Flash("Connect Error", "error", true);
    });
}

$(document).ready(init);