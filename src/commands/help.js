const fs = require('fs');

exports.run = async (bot, msg, args) => {

	// Quick implementation
	// Better to call command descriptions/details from a local json file instead of attempting to read all files in a directory.
	// Should be fine for now.

	var message = "To run a command, use \`./<command>\`\n\n**Command List:**\n";
	var desc = ["Gacha (lootbox) simulator pulled from imgur album", "Displays list of available commands", "Query job database - \`./job\` for more information", "Check bot's ping to the Discord Server","Sets the command prefix", "Updates the cached database"];


	fs.readdir('./src/commands/', (err, files) => {
		if(err) console.log(err);

		// take the name of the javascript file
		files.forEach((file, i) => {
			// file must be a JS file otherwise ignore it
			if (!file.endsWith(".js")) return;

			let cmdName = file.split('.')[0];
			
			message += `\`${cmdName}\` : ${desc[i]}\n`;
			console.log(cmdName);
		});
		msg.author.send(message).catch(console.error);
	});
}
