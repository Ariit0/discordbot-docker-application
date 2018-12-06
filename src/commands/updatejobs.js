/**
 * This command is responsible for manually updating the JSON database 
 */
const config  = require('../config.json');
const Sheet = require('google-spreadsheet');
const auth = require('../client_secret.json');
const fs = require('fs');
const mongoose = require('mongoose');
const JobSchema = require('../models/jobmodel');

// create sheet object using spreadsheet ID
var doc = new Sheet(config.sheetID);

exports.run = async (bot, msg, args) => {
	// only owner can use this command
	if (msg.author.id !== process.env.OWNER) return;

	doc.useServiceAccountAuth(auth, function (err)  {
		doc.getRows(1, function (err, rows) {

			/**
			 * Method use to pull row data and sanitise for JSON formatting (pretty messy)
			 */
			var jobDB = {}; 
			var headings = [];
			var data = [];
			var keys = [];
			// regex to test against to pull row cell data
			var rowRegex = /\"[-A-Z a-z 0-9 /&+%.]*\"}|\"([-A-Z a-z 0-9 /&+%.]*)\",|"https?:\/\/[imgur.-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)"/g;

			// convert object to string
			var myJSON = JSON.stringify(rows);

			// grab headings with the prefix "job-" and only store the first occurrence of it
			var colHeading = myJSON.match(/\"([a-z0-9]{3}-[a-z0-9]*-?[a-z0-9]*-?[a-z0-9]*)\"(?![\s\S]+\1)/g);	

			// grabs row data denoted with the prefix ":\""
			var rowData = myJSON.match(rowRegex);

			// sanitise data and store in seperate arrays-
			for (var i = 0; i < rowData.length; i++) {
				// remove quotations around string
				if (i < colHeading.length) {
					headings[i] = colHeading[i].toString().replace(/\"/g, '');
				}
				// remove colon and quotations around string
				data[i] = rowData[i].toString().replace(/[^-A-za-z0-9 /&+%.:]*/g, '');
			}

			// parent key (the field the user uses to search)
			let k = 0;
			for (var i = 0; i < data.length; i+=headings.length ) {
				keys[k] = data[i];
				k++;
			}

			// seperates child keys and child object pairs into seperate arrays (can be done better....just quick solution)
			var singleRows = [];
			var headerArray = [];
			var numRow = keys.length;
			var numCols = headings.length

			for (var i = 0; i < numRow; i++) { 
				var subSingleRow = [];
				var subHeaderArray = [];

				var n = 0;
				// iterate each row and add to subarrays
				for (var j = (i * numCols); j < (i * numCols) + numCols; j++) { 	
					subSingleRow.push(data[j]);
					subHeaderArray.push(headings[n]);
					n++;
				}
	
				singleRows.push(subSingleRow);
				headerArray.push(subHeaderArray); // column headings
			}
			// merge child key and child object pairs into a single parent object
			// also group key pairs of the same type under a sub-parent key
			// TODO: restructure for weapon columns....
			for (var i = 0; i < numRow; i++) { 
				// wtb better solution 
				var jobData = {}; 
				var jobStats = {};
				var jobOrbs = {};
				var jobEleBoost = {};
				var jobEleResist = {};
				var jobAverts = {};
				var jobHealDrive = {};
				var jobUltimate = {};
				var jobAutoDmg = {};
				var jobAutoBrk = {};
				var jobAutoDef = {};
				var jobAutoOther = {};
				for (var j = 0; j < numCols; j++) { 
					var nest = true;

					// instead of using column values we should regex test the key and append it to the associated group object?
					if (j >= 3 && j <= 9) { // job stats
						jobStats[headerArray[i][j]] = singleRows[i][j];
					} else if (j >= 10 && j <= 12) { // job orbs
						jobOrbs[headerArray[i][j]] = singleRows[i][j];
					} else if (j >= 14 && j <= 19) { // job element boost
						jobEleBoost[headerArray[i][j]] = singleRows[i][j];
					} else if (j >= 20 && j <= 25) { // job element resist
						jobEleResist[headerArray[i][j]] = singleRows[i][j];
					} else if (j >= 26 && j <= 34) { // job averts
						jobAverts[headerArray[i][j]] = singleRows[i][j];
					} else if (j >= 36 && j <= 42) { // job heal drive
						jobHealDrive[headerArray[i][j]] = singleRows[i][j];
					} else if (j >= 43 && j <= 48) { // job ultimate
						jobUltimate[headerArray[i][j]] = singleRows[i][j];
					} else if (j >= 49 && j <= 57) { // job auto damage
						jobAutoDmg[headerArray[i][j]] = singleRows[i][j];
					} else if (j >= 58 && j <= 60) { // job auto break
						jobAutoBrk[headerArray[i][j]] = singleRows[i][j];
					} else if (j >= 61 && j <= 63) { // job auto defense
						jobAutoDef[headerArray[i][j]] = singleRows[i][j];
					} else if (j >= 64 && j <= 74) { // job auto other
						jobAutoOther[headerArray[i][j]] = singleRows[i][j];
					} else {
						nest = false;
					}

					if (j == 9) {
						jobData['job-stats'] = jobStats;
					} else if (j == 12) {
						jobData['job-orbs'] = jobOrbs;
					} else if (j == 19) {
						jobData['job-element-boost'] = jobEleBoost;
					} else if (j == 25) { 
						jobData['job-element-resist'] = jobEleResist;
					} else if (j == 34) {
						jobData['job-ailment-avert'] = jobAverts;
					} else if (j == 42) {
						jobData['job-heal-drive'] = jobHealDrive;
					} else if (j == 48) {
						jobData['job-ultimate'] = jobUltimate;
					} else if (j == 57) {
						jobData['job-auto-damage'] = jobAutoDmg;
					} else if (j == 60) {
						jobData['job-auto-break'] = jobAutoBrk;
					} else if (j == 63) {
						jobData['job-auto-defense'] = jobAutoDef;
					} else if (j == 74) {
						jobData['job-auto-other'] = jobAutoOther;
					}
					
					if (nest == false) {
						jobData[headerArray[i][j]] = singleRows[i][j];
					}	
				}
	
				jobDB[keys[i].replace(/[^a-zA-Z-\[\]]-?/g, '')] = jobData;
			}
			// convert to string
			var JSONfile = JSON.stringify(jobDB, null, 4);

			// save output as json
			var buffer = new Buffer(JSONfile);

			// handles writing to DB.json
			fs.open('./src/DB.json', 'w', (err, fd) => {
				if (err) throw err;

				fs.write(fd, buffer, 0, buffer.length, null, (err) => {
					if (err) throw err;

					fs.close(fd, () => {
						console.log('DB Updated');
					});
				});
			});
		});
	});
				msg.channel.send('DB Updated').catch(console.error);
}

