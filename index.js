const Discord = require('discord.js');
// Enable Environmental Variables for online deployment
require('dotenv').config({ path : './src/config.env'});
const fs = require('fs'); 

// user state data
let currUserTime = {}; 
let prevUserTime = {};


/**
 * Initialise Bot
 */
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

/**
 * Reads commands folder and attaches event file to corresponding event
 */
const cmdFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of cmdFiles) {
	const cmd = require(`./src/commands/${file}`);
	//console.log(file);
	bot.commands.set(cmd.name, cmd);
	//console.log(bot.commands);
}


// fs.readdir('./src/commands/', (err, files) => {
// 	if(err) console.log(err);

// 	// take the name of the javascript file as command
// 	files.forEach(file => {
// 		// file must be a JS file otherwise ignore it
// 		if (!file.endsWith(".js")) return;

// 		const cmd = require(`./src/commands/${file}`);
// 		let cmdName = file.split('.')[0];

// 		bot.on(cmdName, cmd.bind(null, bot));
// 		delete require.cache[require.resolve(`./src/commands/${file}`)];
// 	});
// });

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
    const now = new Date(); 

    if (!bot.commands.has(cmd)) return;

	try {
		//let cmdFile = require(`./src/commands/${cmd}.js`);
		currUserTime[msg.author.id] = now;
		if (prevUserTime[msg.author.id] == null) prevUserTime[msg.author.id] = 0;

		if (currUserTime[msg.author.id] - prevUserTime[msg.author.id] > Math.round(0.165 * 60 * 1000)) { // if its been more than 10 seconds
			bot.commands.get(cmd).execute(msg, args);
			//cmdFile.run(bot, msg, args);
			prevUserTime[msg.author.id] = now;
		} else {
			msg.channel.send(`${msg.author.toString()}, you may not use the \`${cmd}\` command for another `+
				`\`${+(Math.round(((Math.round(0.165 * 60 * 1000) - (currUserTime[msg.author.id] - prevUserTime[msg.author.id])) / 1000) + 'e+2') + 'e-2')}\` seconds `);
		}
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
