const config  = require('../config.json');
const fs = require('fs'); 

/**
 * Reonspible for changing prefix settings (limited to owner)
 * @param  {[type]}
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
exports.run = async (bot, msg, args) => {
	// only owner can use this command
	console.log(msg.author.id);
	if (msg.author.id !== config.ownerID) return;

	let newPrefix = args[0];
	console.log(args[0]);
	// prefix cannot be empty or the same
	if (newPrefix == null) return;

	config.commandPrefix = newPrefix;

	try {
		fs.writeFile('./src/config.json', JSON.stringify(config), (err) => console.error);
		msg.channel.send(`Now using prefix: \`${config.commandPrefix}\``).catch(console.error);
	} catch (e) {
		console.log(e);
	}
}