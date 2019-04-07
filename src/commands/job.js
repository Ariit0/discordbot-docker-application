/**
 * This method is responsible for querying job data from DB.json in table format for reddit wiki
 */
const Discord = require('discord.js');
const fs = require('fs');
const jobDB = require('../DB.json');

module.exports = {
	name: 'job',
	description: '---',
	async execute (msg, args) {

		if (typeof args !== 'undefined' && args.length > 0) {
			try {
				var userInput = args[0]; 
				// less strict querying
				var patt = new RegExp('\\b'+ userInput.replace(/[-\[\]]+/g, '').toLowerCase() + '$\\b');
				var count = 0;
				var matchedQueries = [];
				for (var job in jobDB) {
					count++;
					if (patt.test(job.replace(/[-\[\]]+/g, ''))) {
						jobQuery = job;
						break;
					}

					if (count === Object.keys(jobDB).length) {
						jobQuery = userInput;
						break;
					}
				}

				var jobQueryArgs = ['-stats', '-auto', '-ult'];
				var jobFieldHeadings = ['Stats:', 'Auto-Abilities:', '-', 'Ultimate:'];

				var jobType = JSON.stringify(jobDB[jobQuery]['job-type']).replace(/"/g, '');
				var jobName = JSON.stringify(jobDB[jobQuery]['job-name']).replace(/"/g, '');
				var jobClassIcon = JSON.stringify(jobDB[jobQuery]['job-class-icon']).replace(/"/g, '');
				var jobThumbUrl = JSON.stringify(jobDB[jobQuery]['job-thumbnail']).replace(/"/g, '');
				var jobOrbs = jobDB[jobQuery]['job-orbs'];
				var jobMpRole = JSON.stringify(jobDB[jobQuery]['job-mp-role']).replace(/"/g, '');
				var orbs = [];


				// emojify orbs
				for (var i = 0; i < jobOrbs.length; i++) {
					orbs = jobOrbs[i].split("-");
					for (var j = 0; j < orbs.length; j++) {
						if (/Fire/g.test(orbs[j])) {
							orbs[j] = '<:fireorb:525257561847365634>';
						} else if (/Water/g.test(orbs[j])) {
							orbs[j] = '<:waterorb:525269163942346752>';
						} else if (/Earth/g.test(orbs[j])) {
							orbs[j] = '<:earthorb:525269319198965760>';
						} else if (/Wind/g.test(orbs[j])) {
							orbs[j] = '<:windorb:525269148440330250>';
						} else if (/Light/g.test(orbs[j])) {
							orbs[j] = '<:lightorb:525269217491025920>';
						} else if (/Dark/g.test(orbs[j])) {
							orbs[j] = '<:darkorb:525269450820157449>';
						}
					}
					jobOrbs[i] = orbs.join("");
				}


				// specific case for jobs with 3 orbsets..
				var jobDesc = `**${jobType}** - ${jobMpRole} : ${jobOrbs[0]} | ${jobOrbs[1]}`;
				if (jobQuery === "the-azure-witch" || jobQuery === "freelancer" ) jobDesc += ` | ${jobOrbs[2]}`;
				//			  .setThumbnail(jobThumbUrl)
				// base embed message template (no fields)
				const embedMsg = new Discord.RichEmbed()
				  .setAuthor(jobName, jobClassIcon)
				  .setColor(3447003)
				  .setDescription(jobDesc)
				  .setFooter(msg.author.username + "'s request", msg.author.avatarURL)
				  .setTimestamp();

				  // full embed message with all fields
				if (args.length === 1) {
					msg.channel.send(embedMsg.addField("Stats", PrintData(jobDB[jobQuery]['job-stats']), true)
											 .addField("Ultimate", PrintData(jobDB[jobQuery]['job-ultimate']), true)
											 .addField("Auto-Abilities", PrintAutoes(jobDB[jobQuery]['job-autoes']), true)
											 .addField("bleh", "something somethign", true)).catch(console.error);

				} else if (args.length === 2) { // filtered embed message based on user arg
					try {
						var isMatch = false

						for (var i = 0; i < jobQueryArgs.length; i++) {
							if (args[1] === jobQueryArgs[i]) {
								isMatch = true;

								if (i !== 1) { // embed message for stats and ultimate 
									let index = i;
									if (i == 2) { 
										index = i+1;
										//msg.channel.send(embedMsg.addField(jobFieldHeadings[index], PrintJobStats(jobDB[jobQuery]['job-ultimate']))).catch(console.error);
									} else {
										//msg.channel.send(embedMsg.addField(jobFieldHeadings[index], PrintJobStats(jobDB[jobQuery]['job-stats']))).catch(console.error);
									}
								} else { // embed message for auto-abilties
								 	//msg.channel.send(embedMsg.addField(jobFieldHeadings[i], PrintJobDetails(jobDB[jobQuery]['job-autoes'], 1))
									 		 //.addField(jobFieldHeadings[i+1], PrintJobDetails(jobDB[jobQuery]['job-autoes'], 2))).catch(console.error);
								}
								break;
							} else {
								isMatch = false
							}
						}
						// Error checking for invalid arguement input
						if (isMatch === false) throw argError;

					} catch (argError) {
						console.log(argError);
						msg.channel.send(`:x: \`${args[1]}\` is an invalid argument.`).catch(console.error);
					}
				}
			} catch (e) {
				console.log(e);
				msg.channel.send(`:x: \`${jobQuery}\` is an invalid job.`).catch(console.error);
			}

		} else { // sends a direct message of the list of queryable jobs
			let message = "**Format:** \`./job <job-query> <argument>\`\n**Arguments:** \`-stats\` \`-auto\` \`-ult\` | used to filter specific data types\n";
			msg.channel.send(`${msg.author.toString()}, Sent you a DM with information.`).catch(console.error);
			msg.author.send(message).catch(console.error);
		}
	}
}

function PrintData(data) {
	var string = "";

	for (var key in data) {
		keyString = key.replace(/job-/g, '')
			.replace(/-boost/g, '')
			.replace(/-resist/g, '')
			.replace(/ultimate-/g, '')
			.replace(/\b\w/g, l => l.toUpperCase())
			.replace(/-/g, ' ');

		string += `**${keyString}**:\t${data[key]}\n`;
	}


	return string;
}

function PrintAutoes(data) {
	var string = "";
	var count = 0;

	for (var key in data) {

		keyString = key.replace(/job-/g, '')
			.replace(/-boost/g, '')
			.replace(/auto-/g, '')
			.replace(/ultimate-/g, '')
			.replace(/\b\w/g, l => l.toUpperCase())
			.replace(/-/g, ' ');

		string += `**${keyString}**: `;
		for (var auto in data[key]) {

			autoString = auto.replace(/job-/g, '')
				.replace(/-boost/g, '')
				.replace(/auto-/g, '')
				.replace(/ultimate-/g, '')
				.replace(/\b\w/g, l => l.toUpperCase())
				.replace(/-/g, ' ');

			if (data[key][auto] !== "-") {
				string += `\t${autoString} +${data[key][auto]}%\n`
				console.log(auto);
			}
			count++;
			//string += `${auto}\n`;
		}

		//string += '\n';
	}

	return string;
}