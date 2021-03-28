const Discord = require("discord.js");
const filesystem = require('fs/promises');

var client = new Discord.Client();

const {token, prefix, channels, pinglist} = require('./config.json');

client.login(token);
//initialize client



client.once('ready', () => {
	var time = new Date();
	var hours = 0;
	var minutes = time.getMinutes();
	//check minutes until reset
	if(minutes >= 12){
		hours = -1;
		minutes = 72 - minutes;
	} else{
		minutes = 12 - minutes;
	}
	//check hours until reset
	for(var i = 1; i <= 3; i++){
		if(!((time.getHours() + hours + i) % 3)){
			hours += i;
		}
	}
	//get time until reset in seconds
	var untilreset = 1000 * 60 * (minutes + hours * 60);

	var pingchannel = client.channels.get(channels[0]);

	setTimeout(function(){
		//ping users on claim reset
		pingchannel.send(pinglist);

		//ping users every 3 hours after first claim reset
		setInterval(function(){
			if(new Date().getHours >= 8 && new Date().getHours <= 23){
			pingchannel.send(pinglist);
			}
		}, 1000 * 60 * 60 * 3);

	}, untilreset);
});

function updateConfig(){
	filesystem.writeFile('config.json', JSON.stringify({
		"token": token,
		"prefix": prefix,
		"channels": channels,
		"pinglist": pinglist
	}, null, "\t")).then(() => {
		console.log("success");
	}).catch(() => {
		console.log("oh no");
	});
}

client.on('message', function(message){
    try{
		//if message starts with prefix and isn't bot
		if (!message.content.startsWith(prefix) || message.author.bot) return;
		//set command to first word and args to array of all other words
		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();

		function send(msg){
			message.channel.send(msg);
		}

		if(command == 'ping'){
			if(args[0] == 'users'){
				if(pinglist.length){
					send(pinglist);
				} else{
					send("The list is empty");
				}
			} else

			if(args[0] == 'add'){
				if(pinglist.includes(message.member.toString())){
					send("You are already on the list");
				} else{
					//add user id to pinglist
					pinglist.push(message.member.toString());
					updateConfig();
					send("You have been added to the list");
				}
			} else
			if(args[0] == 'remove'){
				if(pinglist.includes(message.member.toString())){
					pinglist.splice(pinglist.indexOf(message.member.toString()), 1);
					updateConfig();
					send("You have been removed from the list");
				} else{
					send("You aren't on the list");
				}
			}

		}

    }catch(e){
        console.error(e);
    }
});