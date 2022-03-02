import * as url from 'url'

export function toUri (pkgName: string, registry: string) {
    let encodedName: string
  
    if (pkgName[0] === '@') {
      encodedName = `@${encodeURIComponent(pkgName.substr(1))}`
    } else {
      encodedName = encodeURIComponent(pkgName)
    }
  
    return new url.URL(encodedName, registry.endsWith('/') ? registry : `${registry}/`).toString()
}
