const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const { AttachmentBuilder } = require('discord.js');
const fsExtra = require('fs-extra');
const { fullPath, unparsedLogsPath } = require('./logsConfig.json')
const { getLastDemoZip, getDemos } = require('./getdemos');
const { constants } = require('fs/promises');
const { getLastMatch } = require('./../match/matchFunctions')


const filepath = path.join(__dirname)


// Función para ordenar los archivos por fecha de modificación (los más nuevos primero)
function sortByModifiedDate(files) {
  files.sort((a, b) => {
    const numA = parseInt(a.name.match(/\d+/)[0]);
    const numB = parseInt(b.name.match(/\d+/)[0]);
    return numB - numA;
  });
  return [files[0], files[1]];
}

// Función para imprimir los nombres de los archivos en la consola
function printFileNames(files) {
  const fileList = []

  files.forEach(file => {
    console.log(`Archivo: ${file.name}`);
    fileList.push(file.name)
  });
  return fileList
}


async function logExist(listLogFileName) {
  const file = fs.readFileSync(filepath + "/prevlog.json");
  const dataJson = JSON.parse(file);
  const boolFiles = []
  dataJson.logFiles.every(logName => {
    if (listLogFileName.includes(logName)) {
      console.log("El archivo " + logName + " ya existe")
      boolFiles.push(true)
    }
  })
  if (boolFiles[0]) {
    return false
  }
  return true
}

async function getDirectoryContentsWithSize(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        const filePromises = files.map((file) => {
          const filePath = `${directoryPath}/${file}`;
          return fsExtra.stat(filePath).then((stats) => {
            return {
              name: file,
              size: stats.size,
              modifiedTime: stats.birthtimeMs  // Add the modifiedTime property
            };
          });
        });

        Promise.all(filePromises)
          .then((results) => {
            // Sort the results by modifiedTime in descending order
            const sortedResults = results.sort((a, b) => b.modifiedTime - a.modifiedTime);
            resolve(sortedResults);
          })
          .catch((error) => reject(error));
      }
    });
  });
}

async function downloadFiles(discordClient) {

  console.log(fullPath);
  if (!fs.existsSync(fullPath)) {
    let error = `Couldn't load logs config at ${fullPath}`
    console.log(error);
    throw error;
  }

  renameLogFiles();

  let files = await getDirectoryContentsWithSize(fullPath)
  // Filtrar los archivos .log con tamaño mayor a 100 KB
  const filteredFiles = files.filter(file => file.name.endsWith('.log') && file.size > 40000);

  // Ordenar los archivos por fecha de modificación
  if (filteredFiles.length === 0) {
    return;
  }
  const sortedFiles = sortByModifiedDate(filteredFiles);

  // Obtener los nombres de los últimos 2 archivos
  const lastTwoFiles = sortedFiles.slice(0, 2);

  // Imprimir los nombres de los archivos en la consola
  const listFiles = printFileNames(lastTwoFiles);

  const download = await logExist(listFiles)
  if (download) {
    if (lastTwoFiles.length === 2) {
      const form = new FormData();
      const logsFolderName = "logSubido";
      const logsFolder = path.join(`${__dirname}/${logsFolderName}`);

      if (!fs.existsSync(logsFolder)) {
        fs.mkdirSync(logsFolder)
      }

      let files = []
      let filenames = []
      for (const file of lastTwoFiles) {
        const localFilePath = path.join(`${fullPath}/${file.name}`);

        // Leer el contenido del archivo
        const fileContent = fs.createReadStream(localFilePath);
        console.log(file.name)
        filenames.push(file.name);
        files.push(fileContent);

        // Agregar el archivo al formulario
        form.append('logs[]', fileContent, { filename: file.name });
      }

      let url = null;
      let blargResponse = [];
      await parseWithHampalyzer(form).then((res) => {
        url = "http://app.hampalyzer.com" + res;
      }).catch(async (err) => {
        console.error(err);
        await retrieveBlarghalyzerLogs(files, filenames).then((resb) => {
          blargResponse = resb;
        }).catch((err) => {
          console.error(err);
        })
      }).finally(() => {
        const data = {
          site: url,
          logFiles: printFileNames(lastTwoFiles)
        }
        fs.writeFileSync(filepath + "/prevlog.json", JSON.stringify(data))
        let map = getLastMatch().map;
        sendLogsToDiscord(discordClient, map, blargResponse, url)
      });
    } else {
      console.log('No files were found matching the criteria.');
    }

  } else {
    fs.readFile(filepath + "/prevlog.json", 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo JSON:', err);
        return;
      }
      try {
        const url = JSON.parse(data);
        console.log(url.site);
      } catch (error) {
        console.error('Error al parsear el contenido JSON:', error);
      }
    });
  }
}

async function sendLogsToDiscord(discordClient, map, blargResponse, url) {
  await getDemos().then((res) => {
    getLastDemoZip().then(async (attachment) => {
      sendDiscordMessageWithLogs(attachment, discordClient, blargResponse, map, url)
    }).catch((err) => {
      console.error(`Error making attachment: ${err}`);
      sendDiscordMessageWithLogs(null, discordClient, blargResponse, map, url)
    });
  }).catch((err) => {
    console.error(`Error sending files through discord message: ${err}`)
    sendDiscordMessageWithLogs(null, discordClient, blargResponse, map, url)
  });
}

async function sendDiscordMessageWithLogs(attachment, discordClient, blargResponse, map, url) {
  if(attachment !== null)
  {
    att = new AttachmentBuilder(attachment.path, { name: attachment.name })
  }else{
    att = null;
  }
  //718271966800248844 testing channel
  //1113175589583585371 production channel
  //1132076066232602685 test2 channel
  const channel = await discordClient.channels.fetch('1113175589583585371');
  if (blargResponse.length !== 0) {
    let dcMessage = "";
    blargResponse.forEach(async (v) => {
      dcMessage = dcMessage === "" ? `STATS: ${map} \n${v}\n` : `${dcMessage} ${v}`;
    })
    console.log(dcMessage);
    await channel.send(dcMessage).catch(console.error);
    if (att === null) {
      return;
    }
    await channel.send({
      files: [att],
      content: `Demo`
    }).catch(console.error);;
  } else {
    if (att !== null) {
      await channel.send({
        files: [att],
        content: `STATS: ${url} - ${map}`
      }).catch(console.error);;
    } else {
      await channel.send(`Stats: ${url} - ${map}`).catch(console.error);
    }
  }
}

function retrieveBlarghalyzerLogs(files, filenames) {
  return new Promise(async (resolve, reject) => {
    let blargResponse = [];
    let blargError = [];
    await parseWithBlarghalyzer(files[0], filenames[0]).then(async (res) => {
      blargResponse.push(res)
      await parseWithBlarghalyzer(files[1], filenames[1]).then(async (res2) => {
        blargResponse.push(res2);
        resolve(blargResponse)
      }).catch((err2) => {
        blargError.push(err2);
        reject(blargError);
      })
    }).catch((err) => {
      blargError.push(err);
      reject(blargError);
    })
  })
}

function parseWithHampalyzer(form) {
  return new Promise(async (resolve, reject) => {
    await axios.post('http://app.hampalyzer.com/api/parseGame', form, {
      headers: form.getHeaders(),
    }).then((res) => {
      resolve(res.data.success.path);
    }).catch((err) => {
      reject(err);
    })
  })
}

async function parseWithBlarghalyzer(file, filename) {
  return new Promise(async (resolve, reject) => {
    await axios.post('http://blarghalyzer.com/Blarghalyzer.php', {
      process: 'true',
      inptImage: file,
      language: 'en',
      blarghalyze: 'Blarghalyze!'
    }, {
      timeout: 13000,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then((data) => {
      if (data.includes("shit broke")) {
        reject("error during parse logs")
      } else {
        let logParsedName = filename.replace(".log", "").toLowerCase();
        resolve(`Logs parsed at http://blarghalyzer.com/parsedlogs/${logParsedName}/`)
      }
    });
  })
}

function renameLogFiles() {
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath)
    }
    let dir = fs.readdirSync(unparsedLogsPath)
    dir.forEach((f) => {
      if (f.startsWith("ren")) {
        return;
      }
      let existing = path.resolve(unparsedLogsPath + '/' + f);
      let destination = path.resolve(fullPath + `/ren_latam_${f}`);
      try {
        fs.copyFileSync(existing, destination, constants.COPYFILE_EXCL);
      } catch (err) {
        //ignored
      }
    })
  } catch (error) {
    console.error(error)
  }
}

module.exports = { downloadFiles }
