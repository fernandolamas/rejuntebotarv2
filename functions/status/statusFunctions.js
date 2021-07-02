const Discord = require('discord.js');
const mysql = require('mysql');
const fs = require('fs');
let path = require('path')
let dbpath = path.resolve(__dirname,'dbCredentials.json')
let dbo = JSON.parse(fs.readFileSync(dbpath))

let h = dbo.host
let u = dbo.user
let p = dbo.password
let db = dbo.database

let loopcut = false;

const conn = mysql.createConnection({
    host: h,
    user: u,
    password: p,
    database: db
})

function connectToDatabase() {
    conn.connect((err) => {
        if (err) throw err;
        console.log('Connected!')
    })
}


function getMatchInfo(message) {

    if(loopcut){ return;}

    conn.query('SELECT * FROM tfcbr.partidas;', function (err, results, fields) {
        if (err) throw error;

        let blueCaps = JSON.stringify(results[results.length - 1].CapturasAzul)
        let mapName = JSON.stringify(results[results.length - 1].Mapname)
        let blueTeamPlayers = JSON.stringify(results[results.length - 1].Equipo1)
        let redTeamPlayers = JSON.stringify(results[results.length - 1].Equipo2)

        let embed = new Discord.MessageEmbed()
            .setColor('#2832C2')
            .setTitle('Current status')
            .addFields(
                { name: `Blue Team Score`, value: blueCaps },
                { name: `Blue team Players`, value: blueTeamPlayers},
                { name: `Red team Players`, value: redTeamPlayers},
                { name: `Map`, value: mapName }
            )

        message.channel.send(embed)
            .then(embedMessage => {
                setTimeout(() => {
                    embedMessage.delete()
                    getMatchInfo(message)
                }, 60000)
            })
    })



}

function checkStatus(message, args) {
    if (!message.content.includes('brasil')) { return; }
    if(message.content.includes('on'))
    {
        loopcut = false;
        connectToDatabase()
        setTimeout(() => {
            getMatchInfo(message,'false')
        }, 2000);
    }
    if(message.content.includes('off'))
    {
        statusStopTimer()
    }
    
}

function statusStopTimer(message)
{
    loopcut = true;
}


module.exports = { checkStatus , statusStopTimer}