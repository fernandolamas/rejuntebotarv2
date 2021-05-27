const fs = require('fs')
const path = './functions/match/matchTemplate.json';
const pathMap = './functions/match/maps/mapsData.json';
const pathMatchs = './functions/match/matchlog';
const pathMapBan = './functions/match/maps/mapsBan.json';
const timeOut = 10000

function setMapUnban(map,server){
  var file = fs.readFileSync(pathMapBan);
  let mapsBans = JSON.parse(file);
  console.log(mapsBans);
  var serverMaps =  mapsBans[server]
  serverMaps = serverMaps.filter(m=> m != map);
  console.log(serverMaps);
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
  setTimeout(function(){ setMapUnban(map,server)},timeOut)
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
    // Obtengo la lista de mapas general, luego consulto si esta baneado en ese server (tengo q traer el nombre del sv)
    // una vez que sale la votacion y el mapa esta votado tengo que traer servidor y nombre del mapa en otra func y de ahi agregarla
    // en el json de mapa baneado.
    var file = fs.readFileSync(pathMapBan);
    let allServersBans = JSON.parse(file);
    return allServersBans[server]; 
}

function getMaps(server) {
  var maps = []
  var file = fs.readFileSync(pathMap);
  let allMaps = JSON.parse(file);
  var bannedMaps = getMapsBannedServer(server);

  while(maps.length<5)
  {
    var random = Math.floor(Math.random() * allMaps.length);
    if(!maps.includes(allMaps[random]) || !bannedMaps.includes(allMaps[random])) maps.push(allMaps[random]);
  }
/*
  for (let i = 0; i < arr.length; i++) {
    if(!bannedMaps.includes(allMaps[arr[i]])) maps.push(allMaps[arr[i]]);
  }*/ 
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

  setTimeout(function(){ setMatchComplete(matchJson.id)}, 120000)
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

module.exports = { setMatch, getMaps, getUsersInMatchsIncomplete, setMatchComplete,setMapBan }