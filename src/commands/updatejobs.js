/**
 * This command is responsible for manually updating the JSON database 
 * TODO : Refactor code.......
 */
const config  = require('../config.json');
const Sheet = require('google-spreadsheet');
const auth = require('../client_secret.json');
const fs = require('fs');

// create sheet object using spreadsheet ID
var doc = new Sheet('1V-eQTG1UNTDnG-lrGwd_Iby5rwLZlpZ0nxpuhobp_r4');

exports.run = async (bot, msg, args) => {
	// only owner can use this command
	if (msg.author.id !== config.ownerID) return;

	doc.useServiceAccountAuth(auth, function (err)  {
		doc.getRows(1, function (err, rows) {

			/**
			 * Method use to pull row data and sanitise for JSON formatting (pretty messy)
			 */
			var jobDB = {}; 
			var headings = [];
			var data = [];
			var keys = [];

			var rowRegex = /\"[-A-Z a-z 0-9 /&+%.]*\"}|\"([-A-Z a-z 0-9 /&+%.]*)\",|"https?:\/\/[imgur.-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)"/g;

			// convert object to string
			var myJSON = JSON.stringify(rows);

			// grab headings with the prefix "job-" and only store the first occurrence of it
			var colHeading = myJSON.match(/\"([a-z0-9]{3}-[a-z0-9]*-?[a-z0-9]*-?[a-z0-9]*)\"(?![\s\S]+\1)/g);	

			// grabs row data denoted with the prefix ":\""
			var rowData = myJSON.match(rowRegex);


			//console.log(myJSON);
			// sanitise data and store in seperate arrays-
			for (var i = 0; i < rowData.length; i++) {
				// remove quotations around string
				if (i < colHeading.length) {
					headings[i] = colHeading[i].toString().replace(/\"/g, '');
				}
				// remove colon and quotations around string
				data[i] = rowData[i].toString().replace(/[^-A-za-z0-9 /&+%.:]*/g, '');
			}

			// parent key 
			let k = 0;
			for (var i = 0; i < data.length; i+=headings.length ) {
				keys[k] = data[i];
				k++;
			}
			console.log(colHeading.length);
			//console.log(data[68]);
			// seperates child keys and child object pairs into seperate arrays (can be done better....just quick solution)
			// improve naming of variables...
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
				headerArray.push(subHeaderArray);
			}

			// merge child key and child object pairs into a single parent object
			for (var i = 0; i < numRow; i++) { 
				var jobData = {}; 
				for (var j = 0; j < numCols; j++) { 
					jobData[headerArray[i][j]] = singleRows[i][j];
				}

				jobDB[keys[i]] = jobData;
			}
			// convert to string
			var JSONfile = JSON.stringify(jobDB, null, 4);

			// save output as json
			var buffer = new Buffer(JSONfile);

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
				msg.channel.send('DB Updated');
}

