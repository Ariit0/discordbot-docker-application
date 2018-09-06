/**
 * This method is responsible for querying job data from DB.json
 * TODO: REFACTOR....
 */
const Discord = require('discord.js');
const fs = require('fs');
const jobDB = require('../DB.json');

exports.run = async (bot, msg, args) => {

	if (typeof args !== 'undefined' && args.length > 0) {

		let jobQuery = args[0];
		let jobType = JSON.stringify(jobDB[jobQuery]['job-type']).replace(/"/g, '');
		let jobName = JSON.stringify(jobDB[jobQuery]['job-name']).replace(/"/g, '');
		let jobClassIcon = JSON.stringify(jobDB[jobQuery]['job-class-icon']).replace(/"/g, '');
		let jobThumbUrl = JSON.stringify(jobDB[jobQuery]['job-thumbnail']).replace(/"/g, '');
		let jobOrbSet1 = JSON.stringify(jobDB[jobQuery]['job-orb-set-1']).replace(/"/g, '');
		let jobOrbSet2 =JSON.stringify(jobDB[jobQuery]['job-orb-set-2']).replace(/"/g, '');
		let jobMpRole = JSON.stringify(jobDB[jobQuery]['job-multiplayer-role']).replace(/"/g, '');

		var jobFieldNames = [];
		var jobFieldValues = [];

		for (var fields in jobDB[jobQuery]) {
			jobFieldNames.push(fields);
			jobFieldValues.push(JSON.stringify(jobDB[jobQuery][fields]).replace(/"/g, ''));
		}

		jobFieldNames = TextCaptialiseNCut(jobFieldNames);

		console.log(jobFieldNames);

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
			    description: `**${jobType}** - ${jobMpRole} : ${jobOrbSet1} || ${jobOrbSet2}`,
			    fields: [{
			    	name:"Stats:",
			        value: JobStatValue(jobFieldNames, jobFieldValues)
			      },
			      {
			    	name:"Auto-Abilities:",
			        value: JobStatValue(jobFieldNames, jobFieldValues)
			      },
			      {
			    	name:"Ultimate:",
			        value: JobStatValue(jobFieldNames, jobFieldValues)
			      },
			      {
			    	name:"Weapon(s):",
			        value: JobStatValue(jobFieldNames, jobFieldValues)
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

function JobStatValue(fieldNames, fieldValues) {
	let string = "```";

	for (var i = 3; i <= 9; i++) {
		let space = "";
		var numSpace = 0;

		if (fieldNames[i].length <= 4) {
			// 4 is the highest amount of characters for a job
			numSpace = 4 - fieldNames[i].length;
		} 

		space += `| ${fieldNames[i]}`;
		for (var j = 0; j < numSpace; j++) {
			space += " ";
		}

		string += `${space} |`;

		numSpace = 0;
		if (fieldValues[i].length <= 5) {
			numSpace = 5 - fieldValues[i].length;
		}

		string += ` ${fieldValues[i]}`;
		space = "";
		for (var j = 0; j < numSpace; j++) {
			space += " ";
		}
		string += `${space} |\n`;
	}
	string += "```";

	return string;
}


function TextCaptialiseNCut(arr) {
	let string = [];
	for (var i = 0; i < arr.length; i++) {
		let tmp = "";
		tmp += arr[i].toUpperCase();
		string.push(tmp.replace(/JOB-/g, ''));
	}
	return string;
}
