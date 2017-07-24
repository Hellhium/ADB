const Discord = require('discord.js');
const client = new Discord.Client();
var s = require("./config/settings.json");
var request = require('request');
var fs = require('fs')
var jsonfile = require('jsonfile');
//change this file to load from settings (Done)
var file = "./status.json";
var moment = require('moment');

request('http://live.albiononline.com/status.txt', (error, response, body) => {
    var siteResponse = JSON.parse(body.trim())
    jsonfile.writeFile(file, siteResponse, (err) => {
        console.log(err)
    })
})



function retGameStatus(meh) {
    request('http://live.albiononline.com/status.txt', (error, response, body) => {
        console.log(`Albion Online Status:
        ---------------------------------
        Error; ${error}
        Status Code; ${response && response.statusCode}
        Response Body; ${response.body}
        ${moment().format("LLLL")}
        ---------------------------------`)
        var siteResponse = JSON.parse(body.trim())
        jsonfile.readFile(file, (err, obj) => {
            if (obj.status != siteResponse.status) {
                jsonfile.writeFile(file, siteResponse, (err) => {
                    console.log(err)
                })
                console.log(`Updated file.`)
                meh(siteResponse)
                fs.appendFile("./ServerStatus.log", `Albion Online Status:
        ---------------------------------
        Error; ${error}
        Status Code; ${response && response.statusCode}
        Response Body; ${response.body}
        ${moment().format("LLLL")}
        ---------------------------------`)
            } else {
                meh(null)
                console.log(`Everything is up to date.`)
                //console.log(`${moment().format("LLLL")}`)
            }
        })
    })
}

client.on('ready', () => {
    //change dr gray to load from settings (done)
    console.log(`Welcome, ${s.hostsName}
    https://discordapp.com/oauth2/authorize?client_id=${s.cid}&scope=bot
    `)
    //change StatusChannel to load from settings
    const StatusChannel = client.channels.get(s.statusCh)
    setInterval(() => {
        retGameStatus((meh) => {
            if (meh != null) {
                //StatusChannel.bulkDelete(100)
                StatusChannel.send(`Game Status: ${meh.status}\nGame Server Response: ${meh.message}\n${moment().format("LLLL")}`)
            } else {
                null
            }
        })
    }, 10000)
})

client.on('message', (message) => {
    var contents = message.content
    var split = contents.split(' ')
    //Change this command to load from settings (done)
    if (contents.match('!CR') && message.author.id == s.hostsID) {
        if (message.guild.roles)
            var roleName = split[1]
        crRole(roleName)
    }
    if (contents.startsWith('!GR')) {
        console.log(message.mentions.roles.forEach(role => {
            message.member.addRole(role) && message.react('👍')
        }))
    }
    //Message Functions below
    function sendCh(c) {
        message.channel.send(c)
    }

    function crRole(n) {
        message.guild.createRole({
            name: n,
            color: [CG(), CG(), CG()],
            hoist: false,
            mentionable: true
        }).then(role => sendCh(`Created Role ${role}`)).catch(e => console.log(e))
    }
})

//Misc Functions
function CG() {
    return Math.floor(Math.random() * (1 + 255 - 0)) + 0
}


client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));
client.login(s.token).catch(e => {
    console.log(e)
})