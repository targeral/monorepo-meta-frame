"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUri = void 0;
const url = require("url");
function toUri(pkgName, registry) {
    let encodedName;
    if (pkgName[0] === '@') {
        encodedName = `@${encodeURIComponent(pkgName.substr(1))}`;
    }
    else {
        encodedName = encodeURIComponent(pkgName);
    }
    return new url.URL(encodedName, registry.endsWith('/') ? registry : `${registry}/`).toString();
}
exports.toUri = toUri;
