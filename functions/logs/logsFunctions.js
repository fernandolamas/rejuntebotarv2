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
        const logsFolderName = "logSubido";
        const logsFolder = path.join(`${__dirname}/${logsFolderName}`);
        
        if (!fs.existsSync(logsFolder)) {
          fs.mkdirSync(logsFolder)
        }
        for (const file of lastTwoFiles) {
          const localFilePath = path.join(`${__dirname}/${logsFolderName}/${file.name}`);
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

          await client.login(token);
          const channel = await client.channels.fetch('1113175589583585371');
          await channel.send(`STATS: ${url} - ${map}`);
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

  } catch (err) {
    console.error(`Error: ${err.message}`);
  } finally {
    sftp.end();
    console.log('Desconectado del servidor SFTP');
  }
}

// Llamar a la función principal al iniciar la aplicación
module.exports = { downloadFiles }
