const fs = require('fs')
const path = './functions/match/matchTemplate.json';
const pathMap = './functions/match/matchMaps.json'

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
}

module.exports = { setMatch, getMaps }