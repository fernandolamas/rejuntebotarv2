const fs = require('fs');
const { Client } = require('ssh2');
const { usuario, password, server, port } = require('./ftpData.json');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function getLastGameLogs() {
  const SFTP_USER = usuario;
  const SFTP_PASSWD = password;
  const SFTP_SERVER = server;
  const SFTP_PORT = port;

  let prevlog = [];
  if (fs.existsSync('./prevlog.json')) {
    prevlog = JSON.parse(fs.readFileSync('./prevlog.json', 'utf8'));
  }

  let firstLog;
  let secondLog;

  const conn = new Client();

  conn.on('error', (err) => {
    console.error('An error occurred:', err);
  });

  conn.connect({
    host: SFTP_SERVER,
    port: SFTP_PORT,
    username: SFTP_USER,
    password: SFTP_PASSWD,
  });

  conn.on('ready', async () => {    
    conn.sftp(async (err, sftp) => {
      if (err) {
        console.error('Error establishing SFTP connection:', err);
        conn.end();
        return;
      }

      try {
        const logFiles = await new Promise((resolve, reject) => {
          sftp.readdir('/45.235.98.42_27029/logs/', (err, files) => {
            if (err) {
              reject(err);
            } else {
              resolve(files);
            }
          });
        });
        

        const logPromises = logFiles
          .filter((logFile) => logFile.type === 'f' && logFile.name.endsWith('.log'))
          .map(async (logFile) => {
            if (prevlog.logFiles && prevlog.logFiles.includes(logFile.name)) {
              console.log('already parsed the latest log');
              return;
            }

            try {
              const fileInfo = await new Promise((resolve, reject) => {
                sftp.stat(logFile.name, (err, stats) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(stats);
                  }
                });
              });

              if (fileInfo.size > 100000) {
                const logModified = fileInfo.mtimeMs;
                const logModifiedDate = new Date(logModified);
                

                if (!firstLog) {
                  firstLog = { name: logFile.name, modified: logModifiedDate };
                  //console.log(firstLog);
                } else if ((firstLog.modified - logModifiedDate) / 1000 < 3600) {
                  secondLog = { name: logFile.name, modified: logModifiedDate };
                  //console.log(secondLog);
                }
              }
            } catch (error) {
              console.error('Error getting file info:', error);
            }
          });

        await Promise.all(logPromises);
        
        

        if (!firstLog || !secondLog) {
          conn.end();
          return;
        }

        try {
          await new Promise((resolve, reject) => {
            sftp.fastGet(
              '/45.235.98.42_27029/logs/' + firstLog.name,
              'logs/' + firstLog.name,
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });

          await new Promise((resolve, reject) => {
            sftp.fastGet(
              '/45.235.98.42_27029/logs/' + secondLog.name,
              'logs/' + secondLog.name,
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });

          const hampalyze = `curl -X POST -F logs[]=@logs/${secondLog.name} -F logs[]=@logs/${firstLog.name} http://app.hampalyzer.com/api/parseGame`;
          const { stdout, stderr } = await exec(hampalyze);
          console.log(stdout);

          const status = JSON.parse(stdout);
          if (status.success) {
            const site = 'http://app.hampalyzer.com' + status.success.path;
            console.log('Parsed logs available: ' + site);

            prevlog = {
              site: site,
              logFiles: [firstLog.name, secondLog.name],
            };
            fs.writeFileSync('prevlog.json', JSON.stringify(prevlog));
          } else {
            console.log('error parsing logs: ' + stdout);
          }
        } catch (error) {
          console.error('Error downloading or parsing logs:', error);
        }

        conn.end();
      } catch (error) {
        console.error('Error reading directory:', error);
        conn.end();
      }
    });
  });
}

module.exports = { getLastGameLogs };
