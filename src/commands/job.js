const Discord = require('discord.js');
const [ jobDB ] = require('../jobs.json');
const pick = require('../utilities/pick.js');
const pickArray = require('../utilities/pickArray.js');

module.exports = {
    name: 'job',
	description: '---',
	async execute (msg, args) {

        if (typeof args !== 'undefined' && args.length > 0) {
            let arg1 = SearchByJobName(jobDB, args[0]);

            if (!arg1) return; // TODO: provide response for invalid query
            
            let { jobName } = PickByJobDetail(jobDB[arg1], 'jobName[A-Za-z]*');
            let { jobType } = PickByJobDetail(jobDB[arg1], 'jobType[A-Za-z]*');
            let jobOrbs = PickArrayByJobDetail(jobDB[arg1], 'jobOrbSet[A-Za-z]*');            
            let { jobMpRole } = PickByJobDetail(jobDB[arg1], 'jobMpRole[A-Za-z]*');
            let jobStats = PickByJobDetail(jobDB[arg1], 'jobStat[A-Za-z]*');
            let jobDmg = PickByJobDetail(jobDB[arg1], 'jobDmg[A-Za-z]*');
            let jobBrk = PickByJobDetail(jobDB[arg1], 'jobBrk[A-Za-z]*');
            let jobUlt = PickByJobDetail(jobDB[arg1], 'jobUltimate[A-Za-z]*');
            let { jobUrlIcon }  = PickByJobDetail(jobDB[arg1], 'jobUrlIcon[A-Z-a-z]*');

            let orbSet = EmojifyOrbs(jobOrbs);

            msg.channel.send({
                embed: {
                    "thumbnail": {
                        "url": "https://cdn.discordapp.com/embed/avatars/0.png"
                    },
                    "description": `**${jobType}** - ${jobMpRole} : ${orbSet[0]}` + (orbSet[1] != undefined ? ` | ${orbSet[1]}` : "") + (orbSet[2] != undefined ? ` | ${orbSet[2]}` : ""),
                    "author": {
                        "name": jobName,
                        "url": "https://discordapp.com", // redirect to web app
                        "icon_url": jobUrlIcon // job type icon
                    },
                    "fields": [
                        {
                            "name": "**Stats**",
                            "value": (PrintValue(jobStats) || "blank"),
                            "inline": true
                        },
                        {
                            "name": "**Ultimate**",
                            "value": (PrintValue(jobUlt) || "blank"),
                            "inline": true
                        },
                        {
                            "name": "**Damage Autoes**",
                            "value": (PrintValue(jobDmg) || "blank"),
                            "inline": true
                        },
                        {
                            "name": "**Break Autoes**",
                            "value": (PrintValue(jobBrk) || "blank"),
                            "inline": true
                        }
                    ],
                    "footer": {
                        "icon_url": msg.author.avatarURL,
                        "text": `${msg.author.username}'s request`
                    }                
                }
            });
        }
    }   
}

/**
 * Reassign jobOrbs values to emoji values
 * @param {*} jobOrbs 
 */
const EmojifyOrbs = (jobOrbs) => {
    // should we modify the array being passed or only take a reference of it?
    let orbs = [];

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

    return jobOrbs;
}

/**
 * 
 * @param {*} data 
 */
const PrintValue = (data) => {
	var string = "";

	for (var key in data) {
		keyString = key.replace(/job/g, '')
			.replace(/Stat/g, '')
			.replace(/Dmg/g, '')
            .replace(/Brk/g, '')
            .replace(/Ultimate/g, '')
			.replace(/\b\w/g, l => l.toUpperCase())
			.replace(/-/g, ' ');

		string += `**${keyString}**:\t${data[key]}\n`;
	}
	return string;
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
 * @param {*} rgx 
 */
const PickArrayByJobDetail = (obj, rgx) => {
    const regex = new RegExp(rgx);
    var keys = Object.keys(obj).filter(stat => regex.test(stat) === true)

    return pickArray(obj, keys);
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

