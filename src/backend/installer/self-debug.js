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
import { Installer } from '../Installer';

const token_alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_.";
const binary_name = 'debug-forwarder';
const binary_hash = '1d6a901d3237bfa56fdb8b85d593ed28';
const daemon_base = '/data/local/service/debug-forwarder';
const token_file = '.forwarder_token';
const storage_1 = '/data/media';
const storage_2 = '/sdcard';
const debug_file = '/sdcard/store-self-debug.log';
const daemon_init_cmd =
  `(mkdir -p ${daemon_base} && ` +
  `(cp ${storage_1}/tmp.${binary_name}.bin ${daemon_base}/${binary_name} || ` +
  `cp ${storage_2}/tmp.${binary_name}.bin ${daemon_base}/${binary_name}) && ` +
  `echo 'Copied daemon to ${daemon_base}/' && ` +
  `chmod 700 ${daemon_base}/${binary_name}) > ${debug_file} 2>&1; ` +
  `(md5sum ${daemon_base}/${binary_name} | grep '^${binary_hash}' || ` +
  `(echo 'Failed to verify daemon hash' > ${debug_file} && false)) &&` +
  `${daemon_base}/${binary_name} 6000 /data/local/debugger-socket 127.0.0.1` +
  `>/dev/null </dev/null 2>/dev/null & ` +
  `echo 'Started daemon'; `;

function daemonInit(){
  return new Promise((resolve, reject) => {
    function failure(t){
      alert(`Something went wrong with the daemon initialization.
Please manually follow the instructions at https://gitlab.com/affenull2345/kaios-self-debug and run the following command in 'adb shell'; then dismiss this dialog:

printf '${t}' > '${daemon_base}/${token_file}'`);
    }
    let token = "";
    for(let i = 0; i < 32; i++){
      token += token_alphabet[
        Math.floor(Math.random() *
          token_alphabet.length)];
    }
    function start(){
      try {
        let cmd = navigator
          .engmodeExtension.startUniversalCommand(
            daemon_init_cmd +
            `printf '${token}' > '${daemon_base}/${token_file}'`,
            true
          );
        cmd.onsuccess = function(){
          // Wait for the daemon to spin up
          setTimeout(() => resolve(token), 500);
        }
        cmd.onerror = function(){
          failure(token);
          resolve(token);
        }
      }
      catch(e){
        failure(token);
        resolve(token);
      }
    }
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `/${binary_name}.bin`, true);
    xhr.responseType = 'blob';
    xhr.onload = function(){
      function save(storage){
        let req = storage.addNamed(xhr.response, `tmp.${binary_name}.bin`);
        req.onsuccess = function(){
          console.log('[self-debug] Daemon saved to sdcard0');
          start();
        }
        req.onerror = function(){
          console.error('[self-debug] Failed to save daemon', req.error);
          start();
        }
      }
      if(xhr.status === 200 && xhr.response){
        console.log('[self-debug] Loaded daemon', xhr.response);
        let storages = navigator.getDeviceStorages('sdcard');
        let del_req = storages[0].delete(`tmp.${binary_name}.bin`);
        del_req.onsuccess = function(){
          console.log('[self-debug] Deleted old daemon file on sdcard0');
          save(storages[0]);
        }
        del_req.onerror = function(){
          console.log('[self-debug] Did not delete old daemon file');
          save(storages[0]);
        }
      }
      else {
        console.log('[self-debug] Could not load daemon, unexpected result');
        start();
      }
    }
    xhr.onerror = function(){
      console.error('[self-debug] Could not load daemon, XHR failed');
      start();
    }
    try {
      xhr.send();
    }
    catch(e) {
      console.error('[self-debug] Could not load daemon', e);
      start();
    }
  });
}

class SelfDebugInstaller extends Installer {
  constructor(){
    super();
    this.loading = null;
  }
  load() {
    this.loading = daemonInit().then(token => {
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
  installPackage(manifestURL, pkg, idHint){
    if(!this.loading){
      this.load();
    }
    return this.loading.then(interfaces => {
      var id = '{' + idHint + '}';
      return new Promise((resolve, reject) => {
        console.log(`[self-debug] appId=${id}, installing`, pkg);
        interfaces.webapps.installPackaged(pkg, id, e => {
          if(e) reject(e);
          else resolve();
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
