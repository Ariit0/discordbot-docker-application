const Discord = require('discord.js');
const [ jobDB ] = require('../jobs.json');
const pick = require('../Utilities/pick.js')

module.exports = {
    name: 'test',
	description: '---',
	async execute (msg, args) {

        if (typeof args !== 'undefined' && args.length > 0) {
            var arg1 = args[0];
            var jobStats = PickByJobDetail(jobDB[arg1], 'jobStat[A-Za-z]*');
            var jobDmg = PickByJobDetail(jobDB[arg1], 'jobDmg[A-Za-z]*')
            console.log(jobStats);
            console.log(jobDmg);
        }
    }   
}

const PickByJobDetail = (obj, rgx) => {
    const regex = RegExp(rgx);
    var keys = Object.keys(obj).filter(stat => regex.test(stat) === true)

    return pick(obj, keys);
}

