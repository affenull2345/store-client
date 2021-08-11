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
  checkInstalled(manifest_url){
    return new Promise((resolve, reject) => {
      var req = navigator.mozApps.mgmt.getAll();
      req.onsuccess = function(){
        for(var i = 0; i < req.result.length; i++){
          if(req.result[i].manifestURL === manifest_url){
            resolve(new MozAppsImportedApp(req.result[i]));
            return;
          }
        }
        resolve(null);
      }
      req.onerror = function(){
        reject(new Error(req.error.name + ' ' + req.error.message));
      }
    });
  }
}

const inst = new MozAppsImportInstaller();

export default inst;
