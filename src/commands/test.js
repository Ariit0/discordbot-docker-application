const Discord = require('discord.js');
const [ jobDB ] = require('../jobs.json');
const pick = require('../utilities/pick.js')

module.exports = {
    name: 'test',
	description: '---',
	async execute (msg, args) {

        if (typeof args !== 'undefined' && args.length > 0) {
            var arg1 = SearchByJobName(jobDB, args[0]);

            if (!arg1) return; // TODO: provide response for invalid query
            
            var { jobName } = PickByJobDetail(jobDB[arg1], 'jobName[A-Za-z]*')
            var jobStats = PickByJobDetail(jobDB[arg1], 'jobStat[A-Za-z]*');
            var jobDmg = PickByJobDetail(jobDB[arg1], 'jobDmg[A-Za-z]*');
            var jobBrk = PickByJobDetail(jobDB[arg1], 'jobBrk[A-Za-z]*');

            console.log(jobName);
            console.log(jobStats);
            console.log(jobDmg);
            console.log(jobBrk);

            msg.channel.send({embed: {
                "thumbnail": {
                    "url": "https://cdn.discordapp.com/embed/avatars/0.png"
                },
                "description": "orbs n stuff",
                "author": {
                    "name": jobName,
                    "url": "https://discordapp.com", // redirect to web app
                    "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png" // job type icon
                },
                "footer": {
                    "icon_url": msg.author.avatarURL,
                    "text": `${msg.author.username}'s request`
                }

                
                }
            });
        }
    }   
}

const EmbededMessage = {

}

/**
 * 
 * @param {*} obj 
 * @param {*} rgx 
 */
const PickByJobDetail = (obj, rgx) => {
    const regex = new RegExp(rgx);
    var keys = Object.keys(obj).filter(stat => regex.test(stat) === true)

    return pick(obj, keys);
}

/**
 * 
 * @param {*} obj 
 * @param {*} input 
 */
const SearchByJobName = (obj, input) => {
    // match exact input
    try {
        // sanitises user input
        const regex = new RegExp('\\b'+ input.replace(/[-\[\]]+/g, '').toLowerCase() + '\\b');

        var jobName = Object.keys(obj).filter(job => { 
            // removes numbers, hyphen and brackets in id
            return regex.test(job.replace(/[0-9]*[-\[\]/(/)]+/g, '')) === true
        });
       
        return (jobName[0].length !== 0 ? jobName[0] : null); 
    } catch (e) {
        console.error(e)
    }
}

