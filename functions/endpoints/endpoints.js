const { connectAndUploadFiles } = require('../logs/logsFunctions.js');
let _app;

const logsEndpoint = () => {
    _app.get("/api/logs", (req, res) => {
        console.log("Server listening to logs endpoint")
        try{
            connectAndUploadFiles()
        }catch(error){
            console.log(error)
        }finally{
            res.send("Logs endpoint replying to your request")
        }
    })
}


const registerEndpoints = (app) => {
    _app = app
    logsEndpoint();
}

module.exports = { registerEndpoints }  