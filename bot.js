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
			pingchannel.send(pinglist);
		}, 1000 * 60 * 60 * 3);

	}, untilreset);
});

client.on('message', function(message){

    try{

		//if message starts with prefix and isn't bot
		if (!message.content.startsWith(prefix) || message.author.bot) return;
		//set command to first word and args to array of all other words
		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();

		if(command === 'ping'){
			if(args[0] === 'users'){
				message.channel.send(pinglist);
			} else
			if(args[0] === 'add' && !pinglist.includes(message.member.toString())){
				//add user id to pinglist
				pinglist.push(message.member.toString());
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
		}

    }catch(e){
        console.error(e);
    }
});