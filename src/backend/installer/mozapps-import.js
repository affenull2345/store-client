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
