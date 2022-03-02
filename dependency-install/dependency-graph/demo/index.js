const path = require('path');
const packument = require('libnpm/packument');
const manifest = require('libnpm/manifest');
const fs = require('fs-extra');
const log = require('signale');
const { toUri } = require('../lib/index');


async function getData(package) {
  const data = await packument(package, {
    // to use custom registry
    registry: 'https://registry.npm.taobao.org',
    // get all meta data
    fullMetadata: true,
    // prefer to get latest online data
    'prefer-online': true
  });
  return data;
}



(async () => {
    // const data = await getData('libnpm');
    // const manifestData = await manifest('libnpm');
    // console.info(manifestData);
    let depsSet = new Set();
    const getDependencies = async (names = []) => {
        for (const name of names) {
            // console.info('fetch', name);
            if (!depsSet.has(name)) {
                depsSet.add(name);
                const { dependencies = {}, } = await manifest(name);
                // console.info(`${name} dependencies`, dependencies);
                const dependenciesWithVersion = Object.keys(dependencies).map(n => `${n}@${dependencies[n]}`);
                
                if (dependenciesWithVersion.length > 0) {
                    await getDependencies(dependenciesWithVersion);
                }
            }
        }
    };
    // log.time();
    // await getDependencies(['@modern-js/utils']);
    // log.timeEnd();
    // // remove repeat
    // const allDepsArray = Array.from(depsSet);
    // const content = JSON.stringify(allDepsArray);
    // var moment = require('moment'); // require
    // const fileName = moment().format('YYYY-MMDD-X');
    // fs.writeFileSync(path.join(__dirname, `./${fileName}.json`), content, 'utf-8');
    // const pkg = data.versions['17.0.0'];
    // console.info(pkg.dependencies);
    const pkgUrl = toUri('@modern-js/utils', 'https://registry.npm.taobao.org');
    console.info(pkgUrl);
    const fetch = require('node-fetch');
    const response = await fetch(pkgUrl);
    const json = await response.json();
    console.info(json.versions['1.3.0'])
})();