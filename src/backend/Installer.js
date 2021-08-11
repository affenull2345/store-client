class Installer {
  importPackage(pkg) {
    return Promise.reject(
      new Error('This installer cannot import apps'));
  }
  checkImported(pkg) {
    return Promise.resolve(false);
  }
  installPackage(manifest_url, pkg) {
    return Promise.reject(
      new Error('This installer cannot install packages'));
  }
  installHosted(manifest_url) {
    return Promise.reject(
      new Error('This installer does not support hosted apps'));
  }
  checkInstalled(manifest_url) {
    return Promise.resolve(false);
  }
}

class InstalledApp {}

export { Installer, InstalledApp }
