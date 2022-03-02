const path = require('path');
const packument = require('libnpm/packument');
const manifest = require('libnpm/manifest');
const fs = require('fs-extra');


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

const getDependencies = async (names = []) => {
    return names.reduce(async (ret, currentName) => {
        const { dependencies = {}, } = await manifest(currentName);
        const dependenciesNames = Object.keys(dependencies);
        if (dependenciesNames.length > 0) {
            return [
                ...ret,
                currentName,
                ...(await getDependencies(dependenciesNames.map(dname => `${dname}@${dependencies[dname]}`)))
            ];
        }
        return [...ret, currentName];
    }, []);
};

(async () => {
    // const data = await getData('libnpm');
    // const manifestData = await manifest('libnpm');
    // console.info(manifestData);
    await getDependencies(['libnpm']);
    // const content = JSON.stringify(data);
    // fs.writeFileSync(path.join(__dirname, './data.json'), content, 'utf-8');
    // const pkg = data.versions['17.0.0'];
    // console.info(pkg.dependencies);
})();