let fs = require('fs');
let archiver = require('archiver');
let Path = require('path');
const { promisify } = require('util');
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);
const minimumFileSizeInBytes = 10 * 1024 * 1024; // 10 MB
const { demosFullPath, demosZippedFullpath } = require('./logsConfig.json')
let d = new Date();
let { getLastMatch } = require('../match/matchFunctions');


// Función para obtener el tamaño de un archivo en bytes
async function getFileSize(filename) {
    return statAsync(filename).then((stats) => stats.size);
}

function getLastPickup(){
    try{
        let lastPickup = getLastMatch();
        return lastPickup.map;
    }catch(error)
    {
        console.error(`Error retrieving last pickup ${error}`)
    }
}

function extractMapName(filename) {
    const regex = /LATAM-\d+-([\w-]+)\.dem/;
    const match = filename.match(regex);
    if (match) {
      return match[1];
    }
    return null;
  }

// Función para comprimir los archivos que pesan más de 10 MB
async function getDemos() {
    return readdirAsync(demosFullPath)
        .then((files) => {
            const filesToCompressPromises = files.map((file) => {
                const filePath = `${demosFullPath}/${file}`;
                return getFileSize(filePath).then((size) => ({ filePath, size }));
            });
            return Promise.all(filesToCompressPromises)
                .then((filesToCompress) => {
                    const filesToCompressFiltered = filesToCompress.filter(
                        (fileInfo) => fileInfo.size >= minimumFileSizeInBytes
                    );

                    if (filesToCompressFiltered.length === 0) {
                        throw new Error('There were no files beyond 10MB Size.');
                    }
                    const ultimoMapaArchivo = filesToCompressFiltered[filesToCompressFiltered.length -1];
                    const ultimoMapaNombre = extractMapName(ultimoMapaArchivo.filePath.split('/').pop());

                    let nombreDePickup = '';
                    if(ultimoMapaNombre !== getLastPickup()){
                        nombreDePickup = ultimoMapaNombre;
                    } else {
                        nombreDePickup = getLastPickup()
                    }

                    let demosZipPath = Path.resolve(demosZippedFullpath +`/${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}-${nombreDePickup ?? "tfcmap"}.zip`);
                    // Crea un flujo de escritura para el archivo comprimido
                    const writeStream = fs.createWriteStream(demosZipPath);

                    const archive = archiver('zip', {
                        zlib: { level: 9 } // Nivel de compresión máximo (mejor calidad, más lento)
                      });

                    archive.pipe(writeStream);

                    // Pipe los flujos de lectura de los archivos al flujo de compresión y luego al flujo de escritura
                    let lastTwoFiles = []
                    lastTwoFiles.push(filesToCompressFiltered.pop())
                    lastTwoFiles.push(filesToCompressFiltered.pop())
                    lastTwoFiles.forEach((fileInfo) => {
                        const fileName = fileInfo.filePath.split('/').pop();
                        archive.file(fileInfo.filePath, { name: fileName });
                    });

                    archive.finalize();
                    

                    return new Promise((resolve, reject) => {
                        // Adjunta un evento 'finish' para indicar que el proceso ha terminado
                        writeStream.on('finish', () => {
                            resolve('Files zipped correctly.');
                        });

                        // Manejo de errores durante la compresión
                        writeStream.on('error', (err) => {
                            reject(err);
                        });
                    });
                })
                .catch((err) => {
                    throw new Error('Error obtaining files:', err);
                });
        })
        .catch((err) => {
            throw new Error('Error reading direcotory:', err);
        });
}

function getLastDemoZip() {
    return new Promise((resolve, reject) => {
        let files = fs.readdirSync(demosZippedFullpath)
        if (!Array.isArray(files)) {
            let error = "Error getting last demo zip path"
            console.error(error);
            reject(error);
        }
        let lastFileName = files.pop()
        let lastFilePath = Path.resolve(demosZippedFullpath + '/' + lastFileName);
        resolve({
            name: lastFileName,
            path: lastFilePath
        })
    })
}

module.exports = { getDemos, getLastDemoZip }