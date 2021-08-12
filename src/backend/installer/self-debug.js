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
import FirefoxClient from 'firefox-client';
import { Installer, InstalledApp } from '../Installer';
import mozAppsImportInstaller from './mozapps-import';

const token_alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_.";
const token_file = '/data/local/service/debug-forwarder/.forwarder_token';

function newToken(){
  return new Promise((resolve, reject) => {
    var token = "";
    for(var i = 0; i < 32; i++){
      token += token_alphabet[
        Math.floor(Math.random() *
          token_alphabet.length)];
    }
    try {
      var cmd = navigator.
        engmodeExtension.startUniversalCommand(
          `printf '${token}' > '${token_file}'`,
          true
        );
      cmd.onsuccess = function(){
        resolve(token);
      }
      cmd.onerror = function(){
        alert('Token: ' + token);
        resolve(token);
      }
    }
    catch(e){
      alert('Token: ' + token);
      resolve(token);
    }
  });
}

class SelfDebugInstaller extends Installer {
  constructor(){
    super();
    this.loading = null;
  }
  load() {
    this.loading = newToken().then(token => {
      return new Promise((resolve, reject) => {
        var client = new FirefoxClient();
        client.connect('127.0.0.1', 6000, token, () => {
          resolve(client);
        });
        client.on('error', e => {
          reject(new Error(e.name + ' (' + e.message + ')'));
        });
      });
    }).then(client => {
      return new Promise((resolve, reject) => {
        client.getWebapps((err, webapps) => {
          if(err) reject(err);
          else resolve({
            client,
            webapps
          });
        });
      });
    });
  }
  installPackage(manifestURL, pkg){
    if(!this.loading){
      this.load();
    }
    return this.loading.then(interfaces => {
      var url = new URL(manifestURL);
      return new Promise((resolve, reject) => {
        console.log(`[self-debug] appId=${url.host}, installing`, pkg);
        interfaces.webapps.installPackaged(pkg, url.host, e => {
          if(e) reject(e);
          else mozAppsImportInstaller.checkInstalled(manifestURL).then(app => {
            resolve(app);
          });
        });
      });
    }).catch(e => {
      this.loading = null; // Retry next time
      return Promise.reject(e);
    });
  }
  /* checkInstalled should fall back to mozApps-based installer */
}

const inst = new SelfDebugInstaller();

export default inst;
