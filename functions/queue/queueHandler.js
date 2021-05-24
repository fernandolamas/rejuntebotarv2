const fs = require('fs')

module.exports = {

    getQueue: function getQueue(){
        return fs.readFileSync("./queueData.json");
    },

    setQueue: function setQueue(queue){

        let data = JSON.stringify(queue);
        fs.writeFileSync(`./queueData.json`, data);
    }

    
}