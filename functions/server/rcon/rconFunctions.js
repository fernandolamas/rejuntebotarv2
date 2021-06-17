const Rcon = require('rcon');
const fs = require('fs');
const { getMatchIncomplete } = require('../../match/matchHandler');
const pathCredentials = './functions/server/rcon/credentials/RconCredentials.json';

//Options beign used by goldsource engine shouldn't be changed
const options = {
    tcp: false, //udp
    challenge: true //hlds uses challenge

};

const conn = {
    brasil: {
        name: 'brasil',
        connection: undefined
    },
    useast: {
        name: 'useast',
        connection: undefined
    },
    uscentral: {
        name: 'uscentral',
        connection: undefined
    }
}

function turnOnRconConnection(message, _servername) {
    const serverCredentialsFile = fs.readFileSync(pathCredentials)
    const serverCredentials = JSON.parse(serverCredentialsFile);
    conn[_servername].connection = new Rcon(serverCredentials[_servername].ip, serverCredentials[_servername].port, serverCredentials[_servername].rconPassword, options);
    conn[_servername].connection.connect();
    console.log("Establishing connection with the server");
    console.log("servername", _servername);
    console.log("Ip: ", serverCredentials[_servername].ip);

    conn[_servername].connection.on('auth', function () {
        console.log("Authenticated with the hlds server ", _servername);

    }).on('response', function (str) {
        console.log("The server ", _servername, " answered : \n" + str);

    }).on('end', function () {
        console.log("The connection with server ", _servername, " has been closed");
    }).on('error', function () {
        console.log("Error while trying to connect to the hlds server ", _servername, " by rcon");
    });

    message.channel.send("Estableciendo conneccion rcon con el servidor");

    return conn;
}

function sendRconResponse(message, args) {

    let currentMatches = getMatchIncomplete();
    let currentMatch;
    currentMatches.forEach(m => {
        if (m.server === args[0]) {
            currentMatch = m;
        }
    })

    //si pregunta por equipos pasarle los equipos

    switch (args[1]) {
        case 'teams':
            console.log("Current match: ", currentMatch);



            var team1 = "";
            currentMatch.team1.forEach(uid => {
                team1 += message.client.users.cache.get(uid).username + " ";
            })
            var team2 = "";
            currentMatch.team2.forEach(uid => {
                team2 += message.client.users.cache.get(uid).username + " ";
            })

            conn[currentMatch.server].connection.send("say Equipo rojo");
            conn[currentMatch.server].connection.send("say " + team1);
            conn[currentMatch.server].connection.send("say Equipo azul");
            conn[currentMatch.server].connection.send("say " + team2);

            break;
    }
    message.channel.send("Enviando la informacion de los equipos")


}

module.exports = { turnOnRconConnection, sendRconResponse };