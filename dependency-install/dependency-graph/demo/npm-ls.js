var ls = require('npm-remote-ls').ls;
const fs = require('fs-extra');
const log = require('signale');
const path = require('path');

log.time();
ls('@modern-js/utils', 'latest', function(obj) {
//   console.log(obj);
    log.timeEnd();
    let set = new Set();
    const travel = (o) => {
        const keys = Object.keys(o);

        for (const key of keys) {
            if (!set.has(key)) {
                set.add(key);
            }
            travel(o[key]);
        }
    };
    travel(obj);
    var moment = require('moment'); // require
    const fileName = moment().format('YYYY-MMDD-X');
    console.info(fileName);
    fs.writeFileSync(path.join(__dirname, `./${fileName}.json`), JSON.stringify(Array.from(set)), 'utf-8');
});