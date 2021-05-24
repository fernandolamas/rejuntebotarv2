var file_system = require('fs');
var archiver = require('archiver');

let isDone = false;

async function createDemos(target,source_dir) {

  //target must be nameofFile.zip

  //source dir must be the folder from where it zips the files

  var output = file_system.createWriteStream(target);
  var archive = archiver('zip');

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  archive.on('error', function (err) {
    throw err;
  });

  



  archive.pipe(output);

  // append files from a sub-directory, putting its contents at the root of archive
  archive.directory(source_dir, false);

  // append files from a sub-directory and naming it `new-subdir` within the archive
  archive.directory('subdir/', 'new-subdir');

  archive.finalize();
  console.log("state is true")
  isDone = true;
}

module.exports = {createDemos, isDone}
