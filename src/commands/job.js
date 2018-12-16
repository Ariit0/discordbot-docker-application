/**
 * This method is responsible for querying job data from DB.json in table format for reddit wiki
 */
const Discord = require('discord.js');
const fs = require('fs');
const jobDB = require('../DB.json');

exports.run = async (bot, msg, args) => {

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
				msg.channel.send(embedMsg.addField("Stats", PrintJobStats(jobDB[jobQuery]['job-stats']))
										 .addField("Auto-Abilities", PrintJobDetails(jobDB[jobQuery]['job-autoes'], 1))
										 .addField("-", PrintJobDetails(jobDB[jobQuery]['job-autoes'], 2))
										 .addField("Ultimate", PrintJobStats(jobDB[jobQuery]['job-ultimate']))).catch(console.error);

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
									msg.channel.send(embedMsg.addField(jobFieldHeadings[index], PrintJobStats(jobDB[jobQuery]['job-ultimate']))).catch(console.error);
								} else {
									msg.channel.send(embedMsg.addField(jobFieldHeadings[index], PrintJobStats(jobDB[jobQuery]['job-stats']))).catch(console.error);
								}
							} else { // embed message for auto-abilties
							 	msg.channel.send(embedMsg.addField(jobFieldHeadings[i], PrintJobDetails(jobDB[jobQuery]['job-autoes'], 1))
								 		 .addField(jobFieldHeadings[i+1], PrintJobDetails(jobDB[jobQuery]['job-autoes'], 2))).catch(console.error);
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


/**
 * Responsible for generating code block format to be displayed in the embed message
 * @param {Array} fieldNames rowdata
 */
function PrintJobStats(fieldNames) {
	var string = "```xl\n";

	for (var key in fieldNames) {
		var numSpace = 0;
		keyString = key.replace(/job-/g, '')
				.replace(/-boost/g, '')
				.replace(/-resist/g, '')
				.replace(/ultimate-/g, '')
				.replace(/\b\w/g, l => l.toUpperCase())
				.replace(/-/g, ' ');
		// 16 char max length for left col
		if (keyString.length <= 15) {
			numSpace = 15 - keyString.length;
		}

		string += `| ${InsertSpaces(keyString, numSpace)} |`;

		numSpace = 0;
		// 10 char max length for right col
		if (fieldNames[key].length <= 10) numSpace = 10 - fieldNames[key].length;
	
		// formatting for clutch boons (there shouldnt be any that are just '-')
		if ((/\//g.test(fieldNames[key])) === true) { 
			var tmp = fieldNames[key].split('\/');

			string += ` ${tmp[0]}\n`
			for (var i = 1; i < tmp.length; i++) {
				string += `|                 | ${tmp[i]}\n`;
			} 
		} else {
			if (/ultimate-attack/g.test(key) || /ultimate-break/g.test(key)) {
				var tmp = `${fieldNames[key]}%`;
				string += ` ${InsertSpaces(tmp, numSpace)}`;
			} else {
				string += ` ${InsertSpaces(fieldNames[key], numSpace)}`;
			}
			string += '\n'; 
		}
	}

	string += "```";
	return string;
}

function PrintJobDetails(fieldNames, autoFieldVal) {
	var string = "```xl\n";
	var count = 0;

	for (var key in fieldNames) {
		count++;
		var firstEntry = true; // first vale of a category
		var numSpace = 0;
		// heading formatting
		if (count == Object.keys(fieldNames).length) {
			keyString = key.replace(/\b\w/g, l => l.toUpperCase()).replace(/-/g, ' '); // job change shift
		} else {
			keyString = key.replace(/job-/g, '').replace(/auto-/g, '').replace(/\b\w/g, l => l.toUpperCase()).replace(/-/g, ' ');
		}

		// 16 char max length for left col
		if (keyString.length <= 15) {
			numSpace = 15 - keyString.length;
		}

		if (autoFieldVal == 1 && count <= 5) {
			string += FormatAutoes(numSpace, key, fieldNames, firstEntry, keyString);
		} else if (autoFieldVal == 2 && count >= 6) {
			string += FormatAutoes(numSpace, key, fieldNames, firstEntry, keyString);
		} 
	}

	string += "```";
	return string;
}

/**
 * Helper function that inserts are set amount of spaces
 * @param {string} string   
 * @param {int} numSpace 
 */
function InsertSpaces(string, numSpace) {
	let space = "";

	// generate number of spaces after heading 
	for (var i = 0; i < numSpace; i++) {
		space += " ";
	}

	string += `${space}`;

	return string;
} 

function FormatAutoes (numSpace, key, fieldNames, firstEntry, keyString) {
	var string = `| ${InsertSpaces(keyString, numSpace)} |`;
	numSpace = 0;
	// 10 char max length for right col
	if (fieldNames[key].length <= 10) numSpace = 10 - fieldNames[key].length;

	// if the variable is an object, iterate the contents....
	if (typeof fieldNames[key] === 'object') {
		var index = 0;
		for (var vals in fieldNames[key]) {
			var auto = vals.replace(/job-/g, '')
							.replace(/def-/g, '')
							.replace(/dmg-/g, '')
							.replace(/brk-/g, '')
							.replace(/-resist/g, '')
							.replace(/-boost/g, '')
							.replace(/heal-/g, '')
							.replace(/\b\w/g, l => l.toUpperCase());

			if (firstEntry && fieldNames[key][vals] !== '-') { // first entry of a category format
				string += ` ${auto}+${fieldNames[key][vals]}`;
				if (/job-element-/g.test(key) || /-damage/g.test(key) || /-break/g.test(key) || /-defense/g.test(key) || /-drive-heal/g.test(key) || /-ailment-resist/g.test(key)) string += '%';
				string += '\n';
				firstEntry = false;
			} else if (firstEntry && fieldNames[key][vals] === '-' && index === Object.keys(fieldNames[key]).length - 1) { // if all entries are '-'
				string += ` ${fieldNames[key][vals]}\n`;
			} else if (!firstEntry && fieldNames[key][vals] !== '-') { // following entries that are not '-'
				string += `|                 | ${auto}+${fieldNames[key][vals]}`;
				if (/job-element-/g.test(key) || /-damage/g.test(key) || /-break/g.test(key) || /-defense/g.test(key) || /-ailment-resist/g.test(key)) string += '%';
				string += '\n';
			}
			index++;
		}
	} else {
		// formatting for clutch boons (there shouldnt be any that are just '-')
		if ((/\//g.test(fieldNames[key])) === true) { 
			var tmp = fieldNames[key].split('\/');

			string += ` ${tmp[0]}\n`
			for (var i = 1; i < tmp.length; i++) {
				string += `|                 | ${tmp[i]}\n`;
			} 
		} else { // job change shift
			string += ` ${fieldNames[key]}`;
		}
	}
	return string;
}