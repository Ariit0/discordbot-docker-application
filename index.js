const Discord = require('discord.js');
const config  = require('./src/config.json');
const { token } = require('./src/token.json');
const bot = new Discord.Client();
const fs = require('fs'); 

/**
 * Bot's awake method, used to intialise and establish bot's current settings 
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
bot.on('ready', async () => {
	console.log(`${bot.user.username} is online on ${bot.guilds.size} servers!`);
	bot.user.setActivity(config.activity, {type: 'STREAMING'});
});


/**
 * Bot's event handler for listening for incoming messages
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
bot.on('message', async (msg) => {
	// prevent botception 
    if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;

	try {
		if (msg.content.startsWith(config.prefix + 'ping')) {
        	msg.channel.send('!gnip');
    	} 
	} catch (e) {
		console.error(e);
	}


});

/**
 * Initialise bot 
 */
bot.login(token);
