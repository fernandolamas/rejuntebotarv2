const fs = require('fs')
const path = './functions/match/matchTemplate.json';

function setMatch(team1,team2,map){
    var file = fs.readFileSync(path);
    let matchJson = JSON.parse(file);
    
    var fileNameTemplate = `matchTemplate`
    let jsonTemplate = {
        ...matchJson,
        ["id"]: matchJson.id+1
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
      map: map
    };

    let data = JSON.stringify(jsonFile);
    fs.writeFileSync(`./functions/match/matchlog/${fileName}.json`, data);
}

module.exports = {setMatch}