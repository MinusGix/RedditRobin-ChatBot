function sendMessage(text) {
    new r.robin.models.RobinRoom({
        room_id: r.config.robin_room_id
    }).postMessage(text);
}
var cmd = {
    begin: '#',
    commands: {},
    allNicks: [],
    addCommand: function(name, func) {
        this.commands[name] = {
            name: name,
            func: func
        };
    },
    stripBegin: function(text) {
        if (text[0] === this.begin) {
            text = text.split('');
            text[0] = '';
            text = text.join('');
        }
        return text;
    },
    isCommand: function(name) {
        if (name[0] === this.begin) {
            for (var i in this.commands) {
                if (this.commands[i].name.toLowerCase() === this.stripBegin(name.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    },
    findCommand: function(name) {
        if (name[0] === this.begin) {
            for (var i in this.commands) {
                if (this.commands[i].name.toLowerCase() === this.stripBegin(name.toLowerCase())) {
                    return this.commands[i];
                }
            }
        }
        return {};
    },
    runCommand: function(args) {
        console.log('at run spot for commands: ' + args.text);
        console.log(this.isCommand(args.args[0]));
        if (this.isCommand(args.args[0])) {
            var c = this.findCommand(args.args[0]);
            console.log(c);
            setTimeout(function(){
                c.func(args);
            }, 3000);
        }
    }
};
cmd.addCommand('vote', function(args){
    var ac = args.args[1].toLowerCase();
    if(ac === 'grow' || ac === 'increase'){
        $('.robin-chat--vote-increase').click()
    }else if(ac === 'stay' || ac === 'subreddit' || ac === 'continue'){
        $('.robin-chat--vote-continue').click()
    }else if(ac === 'abandon' || ac === 'leave'){
        sendMessage('sorry, but I don\'t really want to leave.');
        //$('.robin-chat--vote-abandon').click()
    }else{
        sendMessage('Please put a valid name of a vote. grow, stay, or abandon.');
    }
});
cmd.addCommand('highfive', function(args){
    sendMessage(args.nick + ' high-fived ' + args.args[1] + '!');
});
cmd.addCommand('hello', function(args) {
    console.log('the hello command was ran');
    sendMessage('hello ' + args.nick + '.');
});
cmd.addCommand('help', function(args){
    var reply = '';

    for(var i in cmd.commands){
        if(cmd.commands[i] === cmd.commands[Object.keys(cmd.commands)[Object.keys(cmd.commands).length - 1]]){
            reply += cmd.begin + cmd.commands[i].name + '.';
        }else{
            reply += cmd.begin + cmd.commands[i].name + ', ';
        }
    }
    sendMessage(reply);
});
setTimeout((function() {
    var original = jQuery.fn.append;

    jQuery.fn.append = function() {
        if (typeof arguments[0] == 'string') {
            var strToDom = new DOMParser();
            var data = strToDom.parseFromString(arguments[0], "text/xml");
            //console.log(data.childNodes);
            var args = {};
            args.nick = $(data.childNodes).children('.robin--username').text();
            if (args.nick === '') {
                args.nick = cmd.allNicks[(cmd.allNicks.length - 1)];
            }
            cmd.allNicks.push(args.nick);
            args.text = $(data.childNodes).children('.robin-message--message').text();
            args.args = args.text.split(' ');
            if (cmd.isCommand(args.args[0])) {
                cmd.runCommand(args);
            }

            console.log('---');
            console.log(cmd.isCommand(args.args[0]))
            console.log(args);
        }

        return original.apply(this, arguments);
    };
})(), 500);
