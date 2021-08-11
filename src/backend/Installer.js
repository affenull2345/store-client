import JSZip from 'jszip';

function pack(data){
  var zip = new JSZip();
  zip.file('metadata.json', JSON.stringify({
    manifestURL: data.manifestURL
  }));
  zip.file('application.zip', data.pkg);
  return zip.generateAsync({type: 'blob'});
}
async function unpack(pkg){
  var zip = await JSZip.loadAsync(pkg);
  var metafile = zip.file('metadata.json');
  if(!metafile) throw new Error('Package is missing metadata file');
  var metadata = JSON.parse(await metafile.async('string'));
  if(!metadata.manifestURL) throw new Error('Metadata is missing manifestURL');
  var appfile = zip.file('application.zip');
  if(!appfile) throw new Error('Package is missing application.zip');
  return {
    manifestURL: metadata.manifestURL,
    pkg: await appfile.async('blob')
  };
}

class Installer {
  importPackage(pkg, calledFromImplementation) {
    if(calledFromImplementation){
      return Promise.reject(
        new Error('This installer cannot import apps'));
    }
    return unpack(pkg).then(unpacked => {
      return this.installPackage(unpacked.manifestURL, unpacked.pkg, true);
    });
  }
  checkImported(pkg, calledFromImplementation) {
    if(calledFromImplementation){
      return Promise.reject(new Error('This installer cannot checkImported'));
    }
    return unpack(pkg).then(unpacked => {
      return this.checkInstalled(unpacked.manifestURL, true);
    });
  }
  installPackage(manifestURL, pkg, calledFromImplementation) {
    if(calledFromImplementation){
      return Promise.reject(
        new Error('This installer cannot install packages'));
    }
    return pack({manifestURL, pkg}).then(packed => {
      return this.importPackage(packed.pkg, true);
    });
  }
  installHosted(manifestURL) {
    return Promise.reject(
      new Error('This installer does not support hosted apps'));
  }
  checkInstalled(manifest_url, calledFromImplementation) {
    return Promise.reject(new Error('This installer cannot checkInstalled'));
  }
}

class InstalledApp {}

export { Installer, InstalledApp }
