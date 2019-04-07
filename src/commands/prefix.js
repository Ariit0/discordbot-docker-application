const fs = require('fs'); 

/**
 * Reonspible for changing prefix settings (limited to owner)
 */
module.exports = {
	name: 'prefix',
	description: '---',
	async execute (msg, args) {
		// only owner can use this command
		console.log(msg.author.id);
		if (msg.author.id !== process.env.OWNER) return;

		let newPrefix = args[0];
		// prefix cannot be empty or the same
		if (newPrefix == null) return;

		process.env.PREFIX = newPrefix;

		try {
			//fs.writeFile('./src/config.json', JSON.stringify(config), (err) => console.error);
			msg.channel.send(`Now using prefix: \`${process.env.PREFIX}\``).catch(console.error);
		} catch (e) {
			console.log(e);
		}
	}
}