const fs = require('fs')
const path = './functions/match/matchTemplate.json';
const pathMap = './functions/match/matchMaps.json';
const pathMatchs = './functions/match/matchlog';

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

function getMaps() {
  var maps = []
  var file = fs.readFileSync(pathMap);
  let allMaps = JSON.parse(file);
  var arr = [];
  while(arr.length<5)
  {
    var random = Math.floor(Math.random() * allMaps.length);
    if(!arr.includes(random)) arr.push(random);
  }

  for (let i = 0; i < arr.length; i++) {
    maps.push(allMaps[arr[i]]);
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

module.exports = { setMatch, getMaps, getUsersInMatchsIncomplete, setMatchComplete }