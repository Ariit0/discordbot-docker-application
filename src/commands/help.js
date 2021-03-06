const fs = require('fs');

module.exports = {
	name: 'help',
	description: 'Help Menu',
	async execute(msg, args) {

		// Quick implementation
		// Better to call command descriptions/details from a local json file instead of attempting to read all files in a directory.
		// Should be fine for now.

		var message = "To run a command, use \`./<command>\`\n\n**Command List:**\n";
		var desc = ["Displays list of available commands", "Query job database - \`./job\` for more information", "Check bot's ping to the Discord Server","Sets the command prefix", "Generate table for queried job","Updates the cached database"];


		fs.readdir('./src/commands/', (err, files) => {
			if(err) console.log(err);

			// take the name of the javascript file
			files.forEach((file, i) => {
				// file must be a JS file otherwise ignore it
				if (!file.endsWith(".js")) return;

				let cmdName = file.split('.')[0];
				
				message += `\`${cmdName}\` : ${desc[i]}\n`;
			});
			msg.channel.send(`${msg.author.toString()}, Sent you a DM with information.`).catch(console.error);
			msg.author.send(message).catch(console.error);
		});
	}
};
