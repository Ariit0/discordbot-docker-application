const config  = require('../config.json');
const request = require('superagent');

/**
 * Sends a GET request (using superagent) to imgur API and randomly pick an image + details
 * to post as a discord embed message
 * @param  {Discord} bot  discord bot object
 * @param  {?object} msg  discord message response object 
 * @param  {?object} args discord command handler arguement
 * @return {[type]}      [description]
 */
exports.run = async (bot, msg, args) => {
	// should cache requests instead of constantly making request calls to the api
	// there is a chance to be rate limited....

	var links = [];
	var desc = [];

	// http get request using superagent
	let {body} = await request
	.get(`https://api.imgur.com/3/album/${config.albumHash}/images`)
	.set('Authorization', `Client-ID ${config.imgurID}`)
	.accept('application/json');

	// push data to arry
	for (var i = 0; i < body.data.length; i++) {
		desc.push(body.data[i].description.replace(/\s/g, ''));
		links.push(body.data[i].link);
	}

	// generate random value
	let max = links.length - 1;
	let min = 0;
	var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

	// use rich embed builder to build embed message 
	let embed = new Discord.RichEmbed()
	.setColor("#ff9900")
	.setTitle("Summoned an ability card!",)
	.setURL(desc[randomNum])
	.setImage(links[randomNum])
	.setTimestamp()
	.setFooter(msg.author.username + "'s request", msg.author.avatarURL);
	
	
	msg.channel.send({embed});
}
