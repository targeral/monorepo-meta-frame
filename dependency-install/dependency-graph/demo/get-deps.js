import path from 'path';
import request from 'request';
import getRegistry from 'registry-url';
import logger from 'signale';
import semver from 'semver'
import fs from 'fs-extra';
import { fileURLToPath } from 'url';


const registryUrl = getRegistry();
console.info(registryUrl);

const getVersion = (versionString, packageJson) => {
    if (versionString === 'latest') versionString = '*'
  
    var availableVersions = Object.keys(packageJson.versions)
    var version = semver.maxSatisfying(availableVersions, versionString, true)
  
    // check for prerelease-only versions
    if (!version && versionString === '*' && availableVersions.every(function (av) {
      return new semver.SemVer(av, true).prerelease.length
    })) {
      // just use latest then
      version = packageJson['dist-tags'] && packageJson['dist-tags'].latest
    }
  
    if (!version) throw Error('could not find a satisfactory version for string ' + versionString)
    else return version
  }

const getDpes = (name, version, task) => {
    const url = registryUrl.replace(/\/$/, '') + '/' + name;
    return new Promise((resolve) => {
        request.get(url, {json: true}, async (err, res, obj) => {
            if (err || (res.statusCode < 200 || res.statusCode >= 400)) {
                var message = res ? 'status = ' + res.statusCode : 'error = ' + err.message
                logger.info(
                  'could not load ' + name + ' ' + message
                )
                return;
            }
            // console.info(name, version);
            const v = getVersion(version, obj);
            await task(obj.versions[v]);
            resolve()
        });
    });
};
let ret = [];
const walk = async (pkgJson) => {
    const { dependencies = {} } = pkgJson;
    // console.info(dependencies);
    const keys = Object.keys(dependencies);
    ret = [
        ...ret,
        ...keys,
    ];
    await Promise.all(
        keys.map((key) => {
            return getDpes(key, dependencies[key], walk);
        })
    );
};
(async () => {
    
    logger.time();
    await getDpes('@modern-js/utils', '1.3.0', walk);
    // console.info(ret);
    logger.timeEnd();
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    ret = Array.from(new Set(ret));
    fs.writeFileSync(path.join(__dirname, './get-deps.json'), JSON.stringify(ret), 'utf-8');
})();