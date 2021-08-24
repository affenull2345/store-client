/*
 * Copyright (C) 2021 Affe Null <affenull2345@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { installStatusUpdate } from '../check-installed';
import { Installer, InstalledApp } from '../Installer';

var getAllCachedPromise = null;

if(navigator.mozApps && navigator.mozApps.mgmt){
  navigator.mozApps.mgmt.onuninstall = navigator.mozApps.mgmt.oninstall = ()=>{
    getAllCachedPromise = null;
    installStatusUpdate.emit();
  }
}

function cachedGetAll(){
  if(!getAllCachedPromise){
    getAllCachedPromise = new Promise((resolve, reject) => {
      var req = navigator.mozApps.mgmt.getAll();
      req.onsuccess = function(){
        resolve(req.result);
      }
      req.onerror = function(){
        reject(new Error(req.error.name + ' ' + req.error.message));
      }
    });
  }
  return getAllCachedPromise;
}

class MozAppsImportedApp extends InstalledApp {
  constructor(mozApp){
    super();
    this._mozApp = mozApp;
  }
  open() {
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
  get version() {
    return this._mozApp.manifest.version;
  }
}

class MozAppsImportInstaller extends Installer {
  importPackage(pkg, idHint){
    return navigator.mozApps.mgmt.import(pkg).then(app => {
      return Promise.resolve();
    }).catch(e => {
      if(e instanceof DOMError){
        return Promise.reject(new Error(e.name + ' ' + e.message));
      }
    });
  }
  checkInstalledByOrigin(origin){
    var url = new URL(origin);
    return cachedGetAll().then(all => {
      for(const app of all){
        if(app.origin === url.origin){
          return Promise.resolve(new MozAppsImportedApp(app));
        }
      }
    });
  }
  checkInstalled(manifest_url, idHint){
    return cachedGetAll().then(all => {
      for(const app of all){
        if(app.manifestURL === manifest_url ||
          app.manifestURL === `app://{${idHint}}/manifest.webapp` ||
          app.origin === `app://{${idHint}}`)
        {
          return Promise.resolve(new MozAppsImportedApp(app));
        }
      }
    });
  }
}

const inst = new MozAppsImportInstaller();

export default inst;
