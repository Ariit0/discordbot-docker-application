/**
 * This method is responsible for querying job data from DB.json
 */
const Discord = require('discord.js');
const fs = require('fs');
const jobDB = require('../DB.json');

exports.run = async (bot, msg, args) => {

	if (typeof args !== 'undefined' && args.length > 0) {
		try {
			let jobAutoes = {}; // holds stat data
			let jobAutoes1 = {}; // holds auto ability data
			let jobAutoes2 = {}; // holds auto ability data 2
			let jobAutoes3 = {}; // holds ultmate data
			let jobFields = [jobAutoes, jobAutoes1, jobAutoes2, jobAutoes3];
			let jobQueryArgs = ['+stats', '+auto', '+ult'];
			let jobFieldHeadings = ['Stats:', 'Auto-Abilities:', '-', 'Ultimate:'];
			let jobAutoTypes = ['HP', 'Attack', 'Break Power', 'Magic', 'Crit Chance', 'Speed', 'Defense','Element Enhance', 'Element Resist', 'Ailment Resist', 'Clutch Boons', 'Drive Heal', 'Damage', 'Break', 'Defense', 'Other', 'Job Change Shift', 'Name', 'Range', 'Attack', 'Break Power', 'Crit Chance', 'Added Effects'];
					
			var jobQuery = args[0]; 
			// set variables of specific data of a job query
			let jobType = JSON.stringify(jobDB[jobQuery]['job-type']).replace(/"/g, '');
			let jobName = JSON.stringify(jobDB[jobQuery]['job-name']).replace(/"/g, '');
			let jobClassIcon = JSON.stringify(jobDB[jobQuery]['job-class-icon']).replace(/"/g, '');
			let jobThumbUrl = JSON.stringify(jobDB[jobQuery]['job-thumbnail']).replace(/"/g, '');
			let jobOrbSet1 = JSON.stringify(jobDB[jobQuery]['job-orb-set-1']).replace(/"/g, '');
			let jobOrbSet2 =JSON.stringify(jobDB[jobQuery]['job-orb-set-2']).replace(/"/g, '');
			let jobOrbSet3 =JSON.stringify(jobDB[jobQuery]['job-orb-set-3']).replace(/"/g, '');
			let jobMpRole = JSON.stringify(jobDB[jobQuery]['job-multiplayer-role']).replace(/"/g, '');

			// seperate columns into separate categories
			var jobShp = [];	// stat hp
			var jobSatk = [];	// stat atk
			var jobSbrk = [];	// stat brk
			var jobSmag = [];	// stat mag
			var jobScrt = [];	// stat crit
			var jobSspd = [];	// stat spd
			var jobSdef = [];	// stat def
			var jobEE = [];  	// element enhance
			var jobERES = []; 	//  resist
			var jobARES = []; 	// ailment resist
			var jobCLU = []; 	//  cluch boons
			var jobDRI = []; 	// drive heal
			var jobDMG = []; 	// damage
			var jobBRK = []; 	// break
			var jobDEF = []; 	// defense
			var jobOTH = []; 	// other
			var jobCHG = []; 	// job change shift

			var jobULTname = []; 
			var jobULTrange = [];
			var jobULTatk = [];
			var jobULTbrk = [];
			var jobULTcrit = [];
			var jobULTeff = [];
			// 2D array setup for category headings
			var jobCategories = [jobShp, jobSatk, jobSbrk, jobSmag, jobScrt, jobSspd, jobSdef, jobEE, jobERES, jobARES, jobCLU, jobDRI, jobDMG, jobBRK, jobDEF, jobOTH, jobCHG, jobULTname, jobULTrange, jobULTatk, jobULTbrk, jobULTcrit, jobULTeff]; 
			
			// specific case for the azure witch - the only job with 3 orbsets so far...
			var jobDesc = `**${jobType}** - ${jobMpRole} : ${jobOrbSet1} | ${jobOrbSet2}`;
			if (jobQuery === "the-azure-witch") jobDesc += ` | ${jobOrbSet3}`;

			// iterates through each row property and stores succeeded regex test into its respective array (category)
			for (var fields in jobDB[jobQuery]) {
				let fieldValues =  JSON.stringify(jobDB[jobQuery][fields]).replace(/"/g, '');
				// generate datasets
				JobRegex(fields, jobCategories, fieldValues)
			}
			// splits headings into seperate javascript objects
			// this is done due to the discord embed field character limit (1024 characters)
			for (var i = 0; i < jobAutoTypes.length; i++) {
				if (i <= 6) { 
					jobAutoes[jobAutoTypes[i]] = jobCategories[i];
				} else if (i >= 7 && i <= 11) {
					jobAutoes1[jobAutoTypes[i]] = jobCategories[i];
				} else if (i >= 12 && i <= 16) {
					jobAutoes2[jobAutoTypes[i]] = jobCategories[i];
				} else {
					jobAutoes3[jobAutoTypes[i]] = jobCategories[i];
				}
			}

			// base embed message template (no fields)
			const embedMsg = new Discord.RichEmbed()
			  .setAuthor(jobName, jobClassIcon)
			  .setColor(3447003)
			  .setDescription(jobDesc)
			  .setFooter(msg.author.username + "'s request", msg.author.avatarURL)
			  .setThumbnail(jobThumbUrl)
			  .setTimestamp();


			  // full embed message with all fields
			if (args.length === 1) {
				msg.channel.send(embedMsg.addField("Stats", PrintJobAutoValues(jobAutoes))
										 .addField("Auto-Abilities", PrintJobAutoValues(jobAutoes1))
										 .addField("-", PrintJobAutoValues(jobAutoes2))
										 .addField("Ultimate", PrintJobAutoValues(jobAutoes3))).catch(console.error);

			} else if (args.length === 2){ // filtered embed message based on user arg
				try {
					var isMatch = false

					for (var i = 0; i < jobQueryArgs.length; i++) {
						if (args[1] === jobQueryArgs[i]) {
							isMatch = true;

							if (i !== 1) { // embed message for stats and ultimate 
								let index = i;
								if (i == 2) index = i+1;
								msg.channel.send(embedMsg.addField(jobFieldHeadings[index], PrintJobAutoValues(jobFields[index]))).catch(console.error);
							} else { // embed message for auto-abilties
							 	msg.channel.send(embedMsg.addField(jobFieldHeadings[i], PrintJobAutoValues(jobFields[i]))
								 		 .addField(jobFieldHeadings[i+1], PrintJobAutoValues(jobFields[i+1]))).catch(console.error);
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

		let message = "**Format:** \`./job <job-query> <argument>\`\n**Arguments:** \`+stats\` \`+auto\` \`+ult\` | used to filter specific data types\nList of queryable jobs:\n";
		let index = 0;
		for (let job in jobDB) {
			index++;
			message += `\t${index}.\t\`${job}\`\n`;
		}
		message += "";
		msg.channel.send(`${msg.author.toString()}, Send you a DM with information.`).catch(console.error);
		msg.author.send(message).catch(console.error);
	}
}


/**
 * Pushes matching regex strings to respective arrays
 * @param  {Object} fields 
 * @param  {Array} 	arr    array for the string to be pushed
 * @param  {String} val   sting the regex is tested against
 * @return {Object} ...	 pushed array result      
 */
function JobRegex(fields, arr, val) {
	// Test whether at least one element passes the test and
	// if it does push the match to the respective array
	return [
		/job-hp/g,
		/job-atk/g,
		/job-brk/g,
		/job-mag/g,
		/job-crit/g,
		/job-spd/g,
		/job-def/g,
		/job-[a-z]*-boost/g,
		/job-[a-z]*-resist/g,
		/job-ailment-avert/g,
		/job-clutch-boons/g,
		/job-heal-drive/g,
		/job-auto-damage/g,
		/job-auto-break/g,
		/job-auto-defense/g,
		/job-auto-other/g,
		/job-change-shift/g,
		/job-ultimate-name/g,
		/job-ultimate-range/g,
		/job-ultimate-atk/g,
		/job-ultimate-brk/g,
		/job-ultimate-crit/g,
		/job-ultimate-eff/g
	].some(function(reg, i) {
		try {
			if (reg.test(fields) === true) {
				return arr[i].push(val);
			} 
		} catch (e) {
			console.log(e);
		}
	});
}

/**
 * Responsible for generating code block format to be displayed in the embed message
 * @param {Array} fieldNames rowdata
 */
function PrintJobAutoValues(fieldNames) {

	let string = "```xl\n";

	for (var key in fieldNames) {
		let space = "";
		var first = true; // first value of a category
		var numSpace = 0;

		if (key.length <= 16) {
			// 16 is the larges amount of characters for a heading
			numSpace = 16 - key.length;
		}

		string += `| ${InsertSpaces(key, numSpace)} |`

		// iterate values in a category
		for (var i = 0; i < fieldNames[key].length; i++) {
			numSpace = 0;
			if (fieldNames[key][i].length <= 19) numSpace = 19 - fieldNames[key][i].length;
		
			if (first == true) {
				// print the first value that isnt "-" otherwise print the last value of the column
				if (fieldNames[key][i] !== '-') { 
					// split string by "/" delimiter 
					if ((/\//g.test(fieldNames[key][i])) === true) {
						var tmp = fieldNames[key][i].split('\/');

						string += ` ${tmp[0]}\n`
						for (var j = 1; j < tmp.length; j++) {
							string += `|                  | ${tmp[j]}\n`; // 18 spaces
						}
					} else {
						string += ` ${fieldNames[key][i]}\n`;
					}

					first = false;
					i++;
				} else if (i === fieldNames[key].length - 1) {
					string += ` ${fieldNames[key][i]}\n`;
					first = false;
					i++;
				} 
			}

			if (first == false) {
				if (i >= 0 && fieldNames[key][i] === '-' || i >= 0 && fieldNames[key][i] === undefined) {
					continue; // skip input
				} else {
					string += `|                  | ${fieldNames[key][i]}\n`; // 18 spaces
				}
			}
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