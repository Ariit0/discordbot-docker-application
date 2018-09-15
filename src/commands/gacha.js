const Discord = require('discord.js');
const myToken = require('../imgur_secret.json');
const config  = require('../config.json');
const superagent = require('superagent');

exports.run = async (bot, msg, args) => {



	superagent
	.get(`https://api.imgur.com/3/gallery/t/cats`)
	.set('Authorization', `Client-ID 3430fb97cadaee8`)
	.then(res => {
		console.log(res);
	});

	  // get (url) {
	  //   return fetch(rootUrl + url, {
	  //     headers: {
	  //       'Authorization': `${config.imgurID} ` + apiKey
	  //     }
	  //   })
	  //   .then((response) => {
	  //     return response.json()
	  //   })
	  // }





	// let embed = new Discord.RichEmbed()
	// .setColor("#ff9900")
	// .setTitle("Test")
	// .setImage('https://imgur.com/gallery/TnAHNiv');
	
	
	// msg.channel.send('https://mobius.gamepedia.com/Cactuar_(Card)');
	
	// console.log(body);

}
