const fs = require('fs')
const path = './functions/match/matchTemplate.json';
const pathMatchs = './functions/match/matchlog';
const pathMap = './functions/match/maps/mapsData.json';
const pathMapBan = './functions/match/maps/mapsBan.json';
const pathServer = './functions/server/serversData.json';
const pathServerBan = './functions/server/serversInUse.json';
const config = require('../../config/config.json');

function getAllServers(){
  var file = fs.readFileSync(pathServer)
  let servers = JSON.parse(file);
  return servers;
}

function getAvailableServers(){
  var servers = getAllServers();
  file = fs.readFileSync(pathServerBan);
  let serversBans = JSON.parse(file);
  var serversAvailable = [];
  servers.forEach(s => {
    if(!serversBans.includes(s)) serversAvailable.push(s);
  });
  return serversAvailable;
}

function setServerUnban(server){
  var file = fs.readFileSync(pathServerBan)
  let serverBans = JSON.parse(file)
  serverBans = serverBans.filter(s=> s != server);
  let data = JSON.stringify(serverBans);
  fs.writeFileSync(pathServerBan, data)
}

function setServerBan(server){
  var file = fs.readFileSync(pathServerBan);
  let serverBans = JSON.parse(file)
  serverBans.push(server)
  let data = JSON.stringify(serverBans);
  fs.writeFileSync(pathServerBan, data);
  setTimeout(function(){setServerUnban(server)},config.matchTimeout)
}

function setMapUnban(map,server){
  var file = fs.readFileSync(pathMapBan);
  let mapsBans = JSON.parse(file);
  var serverMaps =  mapsBans[server]
  serverMaps = serverMaps.filter(m=> m != map);
  mapsBans[server] = serverMaps;
  let data = JSON.stringify(mapsBans);
  fs.writeFileSync(pathMapBan, data);
}

function setMapBan(map, server){
  var file = fs.readFileSync(pathMapBan);
  let mapsBans = JSON.parse(file);
  mapsBans[server].push(map);
  let data = JSON.stringify(mapsBans);
  fs.writeFileSync(pathMapBan, data);
  setTimeout(function(){ setMapUnban(map,server)},config.mapTimeout)
}

function getMatchIncomplete(){
  var matchsIncomplete = [];
  var matchs = fs.readdirSync(pathMatchs);
  matchs.forEach(m => {
    var file = fs.readFileSync(`${pathMatchs}/${m}`);
    let match = JSON.parse(file);
    if(match.state === 'incomplete'){
      matchsIncomplete.push(match);
    }
  })
  return matchsIncomplete;
}

function setMatchComplete(idmatch){
  var file = fs.readFileSync(`${pathMatchs}/match_${idmatch}.json`);
  let match = JSON.parse(file);
  let jsonMatch = {
    ...match,
    ["state"]: "complete"
  }
  let data = JSON.stringify(jsonMatch);
  fs.writeFileSync(`${pathMatchs}/match_${idmatch}.json`, data);
}

function getMapsBannedServer(server){
    var file = fs.readFileSync(pathMapBan);
    let allServersBans = JSON.parse(file);
    return allServersBans[server]; 
}

function getMaps(server) {
  var maps = []
  var file = fs.readFileSync(pathMap);
  let allMaps = JSON.parse(file);
  var bannedMaps = getMapsBannedServer(server);

  while(maps.length<4)
  {
    var random = Math.floor(Math.random() * allMaps.length);
    if(!maps.includes(allMaps[random]) || !bannedMaps.includes(allMaps[random])) maps.push(allMaps[random]);
  }

  return maps;
}

function setMatch(team1, team2, server, map) {
  var file = fs.readFileSync(path);
  let matchJson = JSON.parse(file);

  var fileNameTemplate = `matchTemplate`
  let jsonTemplate = {
    ...matchJson,
    ["id"]: matchJson.id + 1
  }
  let dataTemplate = JSON.stringify(jsonTemplate);
  fs.writeFileSync(`./functions/match/${fileNameTemplate}.json`, dataTemplate);

  var fileName = `match_${matchJson.id}`
  var dateNow = new Date()
  let jsonFile = {
    ...matchJson,
    ["team1"]: team1,
    ["team2"]: team2,
    date: dateNow,
    map: map,
    server: server
  };

  let data = JSON.stringify(jsonFile);
  fs.writeFileSync(`./functions/match/matchlog/${fileName}.json`, data);

  setTimeout(function(){ setMatchComplete(matchJson.id)}, config.matchTimeout)
}

function getUsersInMatchsIncomplete(){
  var playersInMatch = [];
  var matchFiles = fs.readdirSync(pathMatchs);  
  matchFiles.forEach(file => {
      var fileMatch = fs.readFileSync(`${pathMatchs}/${file}`);
      let match = JSON.parse(fileMatch);
      if(match.state === "incomplete")
      {
        match.team1.forEach(userid => {
          playersInMatch.push(userid)
        });
        match.team2.forEach(userid => {
          playersInMatch.push(userid)
        });
      }
  });
  return playersInMatch;
}

module.exports = { setMatch, getMatchIncomplete, getMaps, getUsersInMatchsIncomplete, setMatchComplete,setMapBan, setServerBan, getAllServers, getAvailableServers }