const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { token } = require('../../config/token.json');
const fsExtra = require('fs-extra');
const { fullPath } = require('./logsConfig.json')
const { calculateWinners } = require('../ranking/ranking')
const { getLastDemoZipPath, getDemos } = require('./getdemos');


const filepath = path.join(__dirname)


// Función para ordenar los archivos por fecha de modificación (los más nuevos primero)
function sortByModifiedDate(files) {
  return files.sort((a, b) => b.modifyTime - a.modifyTime);
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
              modifiedTime: stats.mtimeMs  // Add the modifiedTime property
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

async function downloadFiles() {

  console.log(fullPath);
  if (!fs.existsSync(fullPath)) {
    let error = `Couldn't load logs config at ${fullPath}`
    console.log(error);
    throw error;
  }

  let files = await getDirectoryContentsWithSize(fullPath)
  // Filtrar los archivos .log con tamaño mayor a 100 KB
  const filteredFiles = files.filter(file => file.name.endsWith('.log') && file.size > 100000);

  // Ordenar los archivos por fecha de modificación
  const sortedFiles = sortByModifiedDate(filteredFiles);

  // Obtener los nombres de los últimos 2 archivos
  const lastTwoFiles = sortedFiles.slice(0, 2);

  // Imprimir los nombres de los archivos en la consola
  const listFiles = printFileNames(lastTwoFiles);

  const download = await logExist(listFiles)
  if (download) {
    if (lastTwoFiles.length > 0) {
      const form = new FormData();
      const logsFolderName = "logSubido";
      const logsFolder = path.join(`${__dirname}/${logsFolderName}`);

      if (!fs.existsSync(logsFolder)) {
        fs.mkdirSync(logsFolder)
      }
      try {
        await calculateWinners()
      } catch (err) {
        console.log(`Error while calculating the winners ${err}`)
      }

      let files = []
      let filenames = []
      for (const file of lastTwoFiles) {
        const localFilePath = path.join(`${fullPath}/${file.name}`);

        // Leer el contenido del archivo
        const fileContent = fs.createReadStream(localFilePath);
        filenames.push(file.name);
        files.push(fileContent);

        // Agregar el archivo al formulario
        form.append('logs[]', fileContent, { filename: file.name });
      }


      // Realizar la solicitud POST al hampalyzer
      let response = null;
      try {
        response = await axios.post('http://app.hampalyzer.com/api/parseGame', form, {
          headers: form.getHeaders(),
        });
      } catch (error) {
        console.error("Error during post request");
      }


      let url = null;
      let blargResponse = [];
      if (response === null) {
        url = "Hampalyzer is having trouble parsing the logs"

        try {
          files.forEach(async (f) => {
            const { data } = await axios.post('http://blarghalyzer.com/Blarghalyzer.php', {
              process: 'true',
              inptImage: f,
              language: 'en',
              blarghalyze: 'Blarghalyze!'
            }, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })
            if (data.includes("shit broke")) {
              blargResponse.push("error during parse logs")
            } else {
              blargResponse.push(`Logs parsed at http://blarghalyzer.com/parsedlogs/${v}`)
            }
          })
        }
        catch (error) {
          console.error(error);
        }
      } else {
        console.log('Respuesta del hampalyzer:', response.data);
        url = "http://app.hampalyzer.com" + response.data.success.path;
      }

      console.log(url);


      const data = {
        site: url,
        logFiles: printFileNames(lastTwoFiles)
      }

      fs.writeFileSync(filepath + "/prevlog.json", JSON.stringify(data))
      const client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMessageReactions,
        ],
      });

      const carpeta = path.join(__dirname, "../match/matchlog/");

      // Obtener la lista de archivos en la carpeta
      const archivos = fs.readdirSync(carpeta)
        .filter((archivo) => archivo.endsWith('.json') && archivo.startsWith('match_'));

      // Ordenar los archivos por orden alfabético inverso
      archivos.sort((a, b) => {
        const numeroA = parseInt(a.match(/\d+/)[0]);
        const numeroB = parseInt(b.match(/\d+/)[0]);
        return numeroB - numeroA;
      });

      // Verificar si hay archivos en la carpeta
      if (archivos.length > 0) {
        // Leer el archivo más reciente
        const archivoReciente = archivos[0];
        const rutaArchivoReciente = path.join(carpeta, archivoReciente);

        const contenido = fs.readFileSync(rutaArchivoReciente, 'utf8');
        const datosJSON = JSON.parse(contenido);

        // Extraer el valor de "map"
        const map = datosJSON.map;
        try {
          await client.login(token);
          let att = null;
          try {
            await getDemos();
            let attachment = getLastDemoZipPath();
            att = new AttachmentBuilder(attachment, { name: attachment })
          } catch (error) {
            console.error(`Error making attachment: ${error}`);
          }
          //718271966800248844 testing channel
          //1113175589583585371
          const channel = await client.channels.fetch('1113175589583585371');
          if (blargResponse.length !== 0) {
            blargResponse.forEach(async (v) => {
              channel.send(`STATS: ${blargUrl}${v} - ${map}`);
              console.log(`STATS: ${blargUrl}${v} - ${map}`)
            })
            await channel.send({
              files: [att],
              content: `Demo`
            });
          } else {
            await channel.send({
              files: [att],
              content: `STATS: ${url} - ${map}`
            });
          }
        }catch(error)
        {
          console.error(`Error sending files through discord message: ${error}`)
        }
      }
    } else {
      console.log('No se encontraron archivos de registro que cumplan con los criterios.');
    }

  } else {

    //Leemos la url del ultimo log
    fs.readFile(filepath + "/prevlog.json", 'utf8', (err, data) => {
      if (err) {
        console.error('Error al leer el archivo JSON:', err);
        return;
      }

      try {
        // Parsear el contenido del archivo JSON
        const url = JSON.parse(data);

        // Imprimir el valor de "site"
        console.log(url.site);
      } catch (error) {
        console.error('Error al parsear el contenido JSON:', error);
      }
    });
  }
}

// Llamar a la función principal al iniciar la aplicación
module.exports = { downloadFiles }
