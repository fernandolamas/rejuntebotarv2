const path = require('path');
const ClientFtp = require('ssh2-sftp-client');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
let { usuario, password, server, port } = require("./ftpData.json");
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('../../config/token.json');
const { url } = require('inspector');



// Configuración de la conexión SFTP
const config = {
  host: server,
  port: port,
  username: usuario,
  password: password,
};

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

async function connectAndUploadFiles() {
  downloadFiles()
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

async function downloadFiles() {
  const sftp = new ClientFtp();

  try {
    await sftp.connect(config);
    console.log('Conectado al servidor SFTP');

    // Obtener la lista de archivos en el directorio
    const files = await sftp.list('/45.235.98.42_27029/logs/');

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

        for (const file of lastTwoFiles) {
          const localFilePath = path.join(__dirname + "/logSubido/", file.name);

          // Descargar el archivo localmente       
          await sftp.get(`/45.235.98.42_27029/logs/${file.name}`, localFilePath);

          // Leer el contenido del archivo
          const fileContent = fs.createReadStream(localFilePath);

          // Agregar el archivo al formulario
          form.append('logs[]', fileContent, { filename: file.name });
        }


        // Realizar la solicitud POST al hampalyzer
        const response = await axios.post('http://app.hampalyzer.com/api/parseGame', form, {
          headers: form.getHeaders()
        });


        console.log('Respuesta del hampalyzer:', response.data);
        const url = "http://app.hampalyzer.com" + response.data.success.path;
        console.log(url);


        const data = {
          site: url,
          logFiles: printFileNames(lastTwoFiles)
        }

        fs.writeFileSync(filepath + "/prevlog.json", JSON.stringify(data))

        //mensaje con la url de los archivos subidos
        setTimeout(async () => {
        const client = new Client({
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMessageReactions,
          ],
        });
        await client.login(token);
        const channel = await client.channels.fetch('1112716589083676712');
        await channel.send(`STATS: ${url}`);
      }, 5000);

      } else {
        console.log('No se encontraron archivos de registro que cumplan con los criterios.');
      }

    } else {
      //aca si los archivos ya fueron subidos
      const client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildMessageReactions,
        ],
      });

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


      await client.login(token);
      const statsChannel = await client.channels.fetch('1114925352087715871');
      await statsChannel.send('Los stats fueron subidos al canal #logs');
      console.log(data.site)
    }

  } catch (err) {
    console.error(`Error: ${err.message}`);
  } finally {
    sftp.end();
    console.log('Desconectado del servidor SFTP');
  }
}

// Llamar a la función principal al iniciar la aplicación
module.exports = { connectAndUploadFiles }
