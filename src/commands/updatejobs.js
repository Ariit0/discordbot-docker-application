/**
 * This command is responsible for manually updating the JSON database 
 * TODO : Automated update
 */

var Sheet = require('google-spreadsheet');
var auth = require('../client_secret.json');
var fs = require('fs');

// create sheet object using spreadsheet ID
var doc = new Sheet('1V-eQTG1UNTDnG-lrGwd_Iby5rwLZlpZ0nxpuhobp_r4');


exports.run = async (bot, msg, args) => {

	doc.useServiceAccountAuth(auth, function (err)  {
		doc.getRows(1, function (err, rows) {

			/**
			 * Method use to pull row data and sanitise for JSON formatting (pretty messy)
			 */
			var jobDB = {}; 
			var jobData = {};
			var headings = [];
			var data = [];
			var keys =[];

			// convert object to string
			var myJSON = JSON.stringify(rows);

			// grab headings with the prefix "job-" and only store the first occurrence of it
			var colHeading = myJSON.match(/\"([a-z0-9]{3}-[a-z0-9]*-?[a-z0-9]*-?[a-z0-9]*)\"(?![\s\S]+\1)/g);	
			// grabs row data denoted with the prefix ":\""
			var rowData = myJSON.match(/:\"([-A-Z a-z 0-9 /]*)\"/g);

			// sanitise data and store in seperate arrays
			for (var i = 0; i < rowData.length; i++) {
				// remove quotations around string
				if (i < colHeading.length) {
					headings[i] = colHeading[i].toString().replace(/\"/g, '');
				}
				// remove colon and quotations around string
				data[i] = rowData[i].toString().replace(/[^-A-za-z0-9 ]*/g, '');
			}

			let k = 0;
			for (var i = 0; i < data.length; i+=headings.length) {
				keys[k] = data[i];
				k++;
			}


			// 2d array....
			var singleRows = [];
			var numRow = keys.length;
			var numCols = headings.length

			for (var i = 0; i < numRow; i++) { 

				var subSingleRow = [];

				for (var j = (i * numCols); j < (i * numCols) + numCols; j++) { 	
					subSingleRow.push(data[j]);
				}
				singleRows.push(subSingleRow);
			}

			//console.log(headings);
			//console.log(jobData);
			//console.log(keys);
			//console.log(headings);
			//console.log(data);
			console.log(singleRows[0][3]);



			//clean data
			// for (var key in myJSON) {
			// 	if (myJSON.hasOwnProperty(key)) {

			// 		console.log(key + "->" + myJSON[key]);

			// 	}
			// }


			// var buffer = new Buffer(j);

			// fs.open('./src/DB.json', 'w', (err, fd) => {
			// 	if (err) throw err;

			// 	fs.write(fd, buffer, 0, buffer.length, null, (err) => {
			// 		if (err) throw err;

			// 		fs.close(fd, () => {
			// 			console.log('DB Updated');
			// 		});
			// 	});
			// });
		});
	});

}

