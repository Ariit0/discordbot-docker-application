/**
 * This method is responsible for querying job data from DB.json
 * TODO: REFACTOR....
 */
const Discord = require('discord.js');
const fs = require('fs');
const jobDB = require('../DB.json');

exports.run = async (bot, msg, args) => {

	if (typeof args !== 'undefined' && args.length > 0) {

		let jobAutoes = {};
		let jobAutoes2 = {};
		let jobAutoes3 = {};
		let jobAutoTypes = ['Element Enhance', 'Element Resist', 'Ailment Resist', 'Clutch Boons', 'Drive Heal', 'Damage', 'Break', 'Defense', 'Other', 'Job Change Shift', 'Name', 'Range', 'Attack', 'Break Power', 'Crit Chance', 'Added Effects'];

		let jobQuery = args[0];
		let jobType = JSON.stringify(jobDB[jobQuery]['job-type']).replace(/"/g, '');
		let jobName = JSON.stringify(jobDB[jobQuery]['job-name']).replace(/"/g, '');
		let jobClassIcon = JSON.stringify(jobDB[jobQuery]['job-class-icon']).replace(/"/g, '');
		let jobThumbUrl = JSON.stringify(jobDB[jobQuery]['job-thumbnail']).replace(/"/g, '');
		let jobOrbSet1 = JSON.stringify(jobDB[jobQuery]['job-orb-set-1']).replace(/"/g, '');
		let jobOrbSet2 =JSON.stringify(jobDB[jobQuery]['job-orb-set-2']).replace(/"/g, '');
		let jobOrbSet3 =JSON.stringify(jobDB[jobQuery]['job-orb-set-3']).replace(/"/g, '');
		let jobMpRole = JSON.stringify(jobDB[jobQuery]['job-multiplayer-role']).replace(/"/g, '');

		// seperate columns into separate categories
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
		
		var jobUltimateFields = []; // job ultimate
		var jobFieldNames = []; 
		var jobFieldValues = [];

		// 2D array setup for category headings
		var jobCategories = [jobEE, jobERES, jobARES, jobCLU, jobDRI, jobDMG, jobBRK, jobDEF, jobOTH, jobCHG, jobULTname, jobULTrange, jobULTatk, jobULTbrk, jobULTcrit, jobULTeff]; 
		
		// specific case for the azure witch - the only job with 3 orbsets so far...
		var jobDesc = `**${jobType}** - ${jobMpRole} : ${jobOrbSet1} | ${jobOrbSet2}`;
		if (jobQuery === "5-the-azure-witch") jobDesc += ` | ${jobOrbSet3}`;

		for (var fields in jobDB[jobQuery]) {
			let fieldValues =  JSON.stringify(jobDB[jobQuery][fields]).replace(/"/g, '');

			jobFieldNames.push(fields);
			jobFieldValues.push(fieldValues); // remove this later

			// generate datasets
			JobRegex(fields, jobCategories, fieldValues)
		}

		for (var i = 0; i < jobAutoTypes.length; i++) {
			if (i <= 4) {
				jobAutoes[jobAutoTypes[i]] = jobCategories[i];
			} else if (i >= 5 && i <= 9) {
				jobAutoes2[jobAutoTypes[i]] = jobCategories[i];
			} else {
				jobAutoes3[jobAutoTypes[i]] = jobCategories[i];
			}
		}

		jobFieldNames = TextCaptialiseNCut(jobFieldNames, /JOB-/g);

		try {
			msg.channel.send({embed: {
			    color: 3447003,
			    author: {
			      name: jobName,
			      icon_url: jobClassIcon
			    },
			    thumbnail: {
			    	url: jobThumbUrl
			    },
			    description: jobDesc,
			    fields: [{
			    	name:"Stats:",
			        value: JobStatValue(jobFieldNames, jobFieldValues, 3, 9)
			      },
			      {
			    	name:"Auto-Abilities:",
			        value: JobAutoValue(jobAutoes)
			      },
			      {
			    	name:"-",
			        value: JobAutoValue(jobAutoes2)
			      },
			      {
			      	name:"Ultimate:",
			      	value: JobAutoValue(jobAutoes3)
			      }
			    ],
			    timestamp: new Date(),
			    footer: {
			      icon_url: msg.author.avatarURL,
			      text: msg.author.username + "'s request"
			    }
			  }
			});
		} catch (e) {
			console.log(e);
		}
	} else { // print list of jobs + navigation with reaction
		console.log('keepo');
	}
}


/**
 * Pushes matching regex strings to respective arrays
 * @param  {[type]} fields [description]
 * @param  {[type]} arr    [description]
 * @param  {[type]} val    [description]
 * @return {[type]}        [description]
 */
function JobRegex(fields, arr, val) {
	// Test whether at least one element passes the test and
	// if it does push the match to the respective array
	return [
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
 * TODO: Merge Job___Value functions....
 */

function JobStatValue(fieldNames, fieldValues, lowerRange, UpperRange) {
	let string = "```xl\n";

	// 3 = HP to 9 = DEF
	// seperate stat values into seperate array (instead of calling from whole db)?
	for (var i = lowerRange; i <= UpperRange; i++) {
		let space = "";
		var numSpace = 0;

		if (fieldNames[i].length <= 4) {
			// 4 is the highest amount of characters for a stat
			numSpace = 4 - fieldNames[i].length;
		} 

		string += `| ${InsertSpaces(fieldNames[i], numSpace)} |`;

		// can be better....
		numSpace = 0;
		if (fieldValues[i].length <= 5) {
			numSpace = 5 - fieldValues[i].length;
		} 

		string += ` ${InsertSpaces(fieldValues[i], numSpace)}\n`;
	}
	string += "```";

	return string;
}

function JobAutoValue(fieldNames) {

	//console.log(fieldNames);
	let string = "```\n";

	for (var key in fieldNames) {
		let space = "";
		var first = true;
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
			// console.log(fieldNames[key]);
			// console.log(fieldNames[key][i]);
			// console.log(numSpace);
		
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

function TextCaptialiseNCut(arr, regex) {
	let string = [];
	for (var i = 0; i < arr.length; i++) {
		let tmp = "";
		tmp += arr[i].toUpperCase();
		string.push(tmp.replace(regex, ''));
	}
	return string;
}

function InsertSpaces(string, numSpace) {
	let space = "";

	// generate number of spaces after heading 
	for (var i = 0; i < numSpace; i++) {
		space += " ";
	}

	string += `${space}`;

	return string;
} 