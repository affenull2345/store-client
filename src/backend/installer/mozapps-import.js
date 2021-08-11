import { Installer, InstalledApp } from '../Installer';

class MozAppsImportedApp extends InstalledApp {
  constructor(mozApp){
    super();
    this._mozApp = mozApp;
  }
  open() {
    window.debug_mozApp = this._mozApp;
    this._mozApp.launch();
  }
  uninstall() {
    return new Promise((resolve, reject) => {
      var req = navigator.mozApps.mgmt.uninstall(this._mozApp);
      req.onsuccess = function(){
        resolve();
      }
      req.onerror = function(){
        reject(new Error(req.error.name + ' ' + req.error.message));
      }
    });
  }
}

class MozAppsImportInstaller extends Installer {
  importPackage(pkg){
    return navigator.mozApps.mgmt.import(pkg).then(app => {
      return Promise.resolve(new MozAppsImportedApp(app));
    }).catch(e => {
      if(e instanceof DOMError){
        return Promise.reject(new Error(e.name + ' ' + e.message));
      }
    });
  }
}

const inst = new MozAppsImportInstaller();

export default inst;
