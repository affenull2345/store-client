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
import { AppStore, StoreApp } from '../AppStore'
import compareVersions from 'compare-versions';

const servers = [
  "https://banana-hackers.gitlab.io/store-db",
  "https://bananahackers.github.io/store-db",
];
const rating_servers = [
  "https://bhackers.uber.space/srs/v1",
];

function request(meth, url, rtype, data, progress){
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest({mozSystem: true});
    xhr.open(meth, url, true);
    xhr.responseType = rtype;
    xhr.ontimeout = function(){
      reject(new Error('Request Timeout'));
    }
    xhr.onload = function(){
      if(xhr.status === 200){
        resolve(xhr.response);
      }
      else if(xhr.status > 200 && xhr.status < 300){
        resolve(null);
      }
      else {
        reject(new Error(`Got HTTP ${xhr.status} status`));
      }
    }
    xhr.onprogress = function(e){
      if(progress) progress(e.loaded, e.total);
    }
    xhr.onerror = function(e){
      reject(new Error('Request Failure'));
    }
    xhr.send(data);
  });
}

async function loadSRSData(data){
  for(var i = 0; i < rating_servers.length; i++){
    let srv = rating_servers[i];
    try {
      let response = await request('GET', srv + '/download_counter');
      let obj = JSON.parse(response);
      localStorage.setItem('bhv2srs-save', response);
      data.downloadCount = obj;
      return data;
    }
    catch(e) {
      console.error(`Server ${srv} failed with`, e);
    }
  }
  if(localStorage.getItem('bhv2-save')){
    data.downloadCount = JSON.parse(localStorage.getItem('bhv2-save'));
    return data;
  }
  throw new Error('Could not load SRS data');
}

async function loadData(){
  for(var i = 0; i < servers.length; i++){
    let srv = servers[i];
    try {
      let response = await request('GET', srv + '/data.json', 'string', null);
      let obj = JSON.parse(response);
      localStorage.setItem('bhv2-save', response);
      return await loadSRSData(obj);
    }
    catch(e) {
      console.error(`Server ${srv} failed with`, e);
    }
  }
  if(localStorage.getItem('bhv2-save')){
    return JSON.parse(localStorage.getItem('bhv2-save'));
  }
  throw new Error('Could not load data');
}

class BHackersV2App extends StoreApp {
  constructor(data, downloadCount){
    super();
    this._data = data;
    this._downloadCount = downloadCount;
    this.blobPromise = null;
  }
  get name() {
    return this._data.name;
  }
  get description() {
    return this._data.description;
  }
  getExtendedMetadata() {
    return Promise.resolve({
      developer: {
        name: this._data.author.map(a => a.replace(/\s*<[^>]*>$/, ''))
              .join(', '),
      },
      source: this._data.git_repo,
      has_ads: this._data.has_ads,
      has_tracking: this._data.has_tracking,
      license: this._data.license,
      type: this._data.type,
      version: this._data.download.version,
      download_count: this._downloadCount
    });
  }
  findIcon(size) {
    return this._data.icon;
  }
  getInstallationMethod() {
    return ['importPackage', async (reportProgress) => {
      if(!this.blobPromise){
        this.blobPromise =
          request('GET', this._data.download.url, 'blob', null,
            (loaded, total) => {
              reportProgress('Downloading', Math.floor(loaded/total*100));
            });
      }
      return {args: [await this.blobPromise]};
    }];
  }
  getIdentificationMethod() {
    return ['checkImported', async () => {
      if(!this.blobPromise){
        this.blobPromise =
          request('GET', this._data.download.url, 'blob', null);
      }
      return {args: [await this.blobPromise]};
    }];
  }
  checkUpdatable(version) {
    return Promise.resolve(
      compareVersions(this._data.download.version, version) > 0);
  }
}

export default class BHackersV2Store extends AppStore {
  load() {
    return loadData().then(data => {
      this._data = data;
      console.log('[bhackers-v2] Got data', data);
      this.categories = [{
        name: 'Most downloaded', id: '$popular', special: true
      }].concat(Object.keys(data.categories).map(ctg => {
        return { name: data.categories[ctg].name, id: ctg };
      }));
    });
  }
  getApps(filter, start, count) {
    var filteredSet = this._data.apps.filter(app => {
      var match = true;
      if(filter.categories){
        if(filter.categories[0].id !== '$popular'){
          match &= filter.categories.some(
            ct => app.meta.categories.includes(ct.id));
        }
      }
      return match;
    });
    if(filter.categories && filter.categories[0].id === '$popular'){
      filteredSet.sort((a, b) => {
        return (this._data.downloadCount[b.slug] || 0) -
          (this._data.downloadCount[a.slug] || 0);
      });
    }
    return Promise.resolve({
      apps: filteredSet
        .slice(start, start+count)
        .map(app => new BHackersV2App(app, this._data.downloadCount[app.slug])),
      isLastPage: start+count >= filteredSet.length
    });
  }
  get name() {
    return 'B-Hackers Store';
  }
}
