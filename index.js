const fs = require('fs');
const path = require('path');
const kebabCase = require('lodash/kebabCase');
const padStart = require('lodash/padStart');
const program = require('commander');
const mm = require('music-metadata');
const sort = require('alphanum-sort');

program
  .version('0.1.0')
  .arguments('<dir> [dirs...]')
  .option('-l, --location', 'List file location not name.')
  .action(function (dir, dirs) {
     dirValues = [dir];
     if (dirs) {
       dirValues = dirValues.concat(dirs);
     }
  });

program.parse(process.argv);

if ( (typeof dirValues === 'undefined') || (dirValues.length === 0) ) {
   console.error('no dir[s] given!');
   process.exit(1);
}


let readData = async function({location}){
  return mm.parseFile(location, {native: true})
};

const main = async function({dir}){

  //
  const files = sort(fs.readdirSync(dir))
  .filter(i=>!i.match(/^\./)) // strip dot files
  .map(i=>path.join(dir, i)) // combine filename and basename
  .map( i => ({ // create object
    location:i,
    name: kebabCase(path.basename(i, path.extname(i))) + path.extname(i)
  }))


  files.forEach(async (entry, index) => {

    try {

      let data = await readData(entry);

      if(!data.common.album) {
        if(program.location){
          console.log('malformed album name: %s', dir)
        }else{
          console.log('malformed album name: %s', entry.location)
        }
        console.log(data.common)
      }

      if(!data.common.title) {
        if(program.location){
          console.log('malformed track title: %s', dir)
        }else{
          console.log('malformed track title: %s', entry.location)
        }
        console.log(data.common)
      }

    } catch(e) {
      // ignore id3 errors.
      // console.error(e.message)
    }

  });

} // main


dirValues.map(dir=>main({dir}))
