const Discord = require('discord.js');
// Enable Environmental Variables for online deployment
require('dotenv').config({ path : './src/config.env'});
const fs = require('fs'); 
const mongoose = require('mongoose');

var mongoDBUrl = process.env.MONGOLAB_URI;

const usr = process.env.MONGOLAB_USER
const pwd = process.env.MONGOLAB_PASS

/**
 * Establish mongodb server
 */
mongoose.connect(mongoDBUrl, {useNewUrlParser: true, user: usr, pass: pwd}, function (err, db) {
	if (!err) {
		console.log('Connected to Database');
	} else {
		console.log(err);
	}
});

/**
 * Initialise Bot
 */
const bot = new Discord.Client();

/**
 * Reads commands folder and attaches event file to corresponding event
 */
fs.readdir('./src/commands/', (err, files) => {
	if(err) console.log(err);

	// take the name of the javascript file as command
	files.forEach(file => {
		// file must be a JS file otherwise ignore it
		if (!file.endsWith(".js")) return;

		let cmd = require(`./src/commands/${file}`);
		let cmdName = file.split('.')[0];
		// Call events with variable number of arguments
		bot.on(cmdName, (...args) => eventFunction.run(bot, ...args));
	});
});

/**
 * Bot's awake method, used to intialise and establish bot's current settings 
 */
bot.on('ready', async () => {
	console.log(`${bot.user.username} is online on ${bot.guilds.size} servers!`);
	bot.user.setActivity(process.env.ACTIVITY, {type: 'STREAMING'});
});

/**
 * Bot's event handler for listening for incoming messages
 */
bot.on('message', async (msg) => {
	// Prevent botception and incorrect prefix
    if (!msg.content.startsWith(process.env.PREFIX) || msg.author.bot) return;
    // Define args
    const args = msg.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

	try {
		let cmdFile = require(`./src/commands/${cmd}.js`);
		cmdFile.run(bot, msg, args);
	} catch (e) {
		console.error(e);
		msg.channel.send(`:x: \`${cmd}\` is an invalid command.`).catch(console.error);
	}
});

/**
 * Captures any errors occuring within the application
 */
bot.on('error', (e) => console.error(e));

/**
 * Login bot 
 */
bot.login();
