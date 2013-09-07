var DOMS = DOMS || {};

$.cookie.json = true;

///////////////////////////////
//                          //
//    "Global" Classes     //
//                        //
///////////////////////////
function Flash (msg, type, timed) {
    var template = _.template('<div class="flash <%= type %>"><%= message %></div>');
    var $root = $( template({ message: msg, type: type }) );
    $root.prependTo('#flash_container');

    this.remove = function () {
        $root.fadeOut();
    };

    if (timed) setTimeout(this.remove, 3000);
}

//////////////////////////////
//                         //
//    Manager Classes     //
//                       //
//////////////////////////
function UserManager () {
    var self = this,
        user = $.cookie('DOMS_user'),
        name,
        id,
        user_intf;

    if (user && user.name && user.id) {
        name = user.name;
        id = user.id;

        userUp(name, id);
    } else {
        user_intf = new UserIntf(DOMS.$page);
    }

    if (user_intf) $(user_intf).bind('new_user', newUser);

    DOMS.socket.on('user_down', userDown);

    function newUser (event, name) {
        userUp(name);
    }

    function userUp (name, id) {
        DOMS.socket.emit('user_up', { name: name, id: id });
    }
    function userDown (data) {
        name = data.name;
        id = data.id;

        $.cookie('DOMS_user', { name: name, id: id });

        if (user_intf) user_intf.remove();

        $(self).trigger('finished');
    }

    this.setId = function (id) {
        id = id;
    };
    this.getName = function () {
        return name;
    };
    this.getId = function () {
        return id;
    };
}
function ChatManager () {
    var self = this,
        chat_intf;

    chat_intf = new ChatIntf(DOMS.$page);
    message_intf = new MessageIntf(DOMS.$page);

    DOMS.socket.on('message_down', chat_intf.insertMessage);

    $(message_intf).bind('message_entered', sendMessage);

    function sendMessage (event, message) {
        var data = {
            name: DOMS.user_manager.getName(),
            message: clean(message)
        };
        DOMS.socket.emit('message_up', data);
    }
    function clean (message) {
        return message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
}

////////////////////////////////
//                           //
//    Interface Classes     //
//                         //
////////////////////////////
function UserIntf ($page) {
    var self = this,
        $root = $('<div class="abs-center"></div>'),
        $input = $('<input placeholder="name">'),
        $btn = $('<button>Enter</button>');

    $btn.bind("click", submit);

    $root.append($input, $btn);
    $page.html($root);

    function submit (event) {
        var name = $input.val();

        $(self).trigger('new_user', name);
    }

    this.remove = function () {
        $root.hide();
    };
}
function ChatIntf ($page) {
    var $root = $('<div class="chat" id="chat"></div>'),
        height = $page.innerHeight() - 50;
    $root.css('max-height', height);
    $root.appendTo($page);

    $(window).resize(function(event) {
        height = $page.innerHeight() - 50;
    });

    var message_html = '<p><strong><%= name %></strong> <%= message %></p>',
        messageTemplate = _.template(message_html);

    this.insertMessage = function (data) {
        $(messageTemplate(data)).appendTo($root);
        $root.scrollTop(9999999999);
    };
}
function MessageIntf ($page) {
    var self = this,
        $root = $('<div class="prompt" id="prompt"></div>'),
        $message = $('<textarea placeholder="message" class="message"></textarea>');

    $message.appendTo($root);
    $root.appendTo($page);

    $message.keypress(function (event) {
        var message;

        if (event.which === 13) {
            event.preventDefault();

            message = $message.val();
            $message.val('').focus();

            $(self).trigger('message_entered', message);
        } else {
            // DOMS.socket.emit('typing_up');
        }
    });
}

////////////////////////////////////
//                               //
//    Global Initialization     //
//                             //
////////////////////////////////
function init () {

    DOMS.$page = $('#page');
    DOMS.socket = io.connect('http://' + window.location.hostname);

    DOMS.user_manager = new UserManager();
    $(DOMS.user_manager).bind('finished', function () {
        DOMS.chat_manager = new ChatManager();
    });

    DOMS.socket.on('connecting', function () {
        DOMS.loading_flash = DOMS.loading_flash || new Flash("Connecting...", "info");
    });
    DOMS.socket.on('connect', function () {
        DOMS.loading_flash.remove();
        new Flash("Connected!", "notice", true);
    });
    DOMS.socket.on('connect_error', function () {
        DOMS.loading_flash.remove();
        new Flash("Connect Error", "error", true);
    });
    DOMS.socket.on('disconnect', function () {
        DOMS.loading_flash.remove();
        new Flash("You've been disconnected.", "error", true);
    });

    DOMS.socket.on('user_joined', function (data) {
        new Flash(data.name + " joined.", "notice", true);
    });
}
$(document).ready(init);