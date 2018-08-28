exports.run = async (bot, msg, args) => {
	msg.channel.send(`Pong! \`${bot.pings[0]}ms\``).catch(console.error);
	console.log(`Pong! ${bot.pings[0]}ms`);
}

exports.help = {
	name: "ping",
	category: "Miscellaneous"
}