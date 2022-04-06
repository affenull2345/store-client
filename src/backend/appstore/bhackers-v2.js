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
import { AppStore, StoreApp } from '../AppStore';
import compareVersions from 'compare-versions';

const BHACKERS_SERVERS = [
  "https://banana-hackers.gitlab.io/store-db",
  "https://bananahackers.github.io/store-db",
];
const BHACKERS_RATINGS = [
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

async function countDownload(rating_servers, slug){
  for(let srv of rating_servers){
    try {
      let response = await request('GET', srv + '/download_counter/count/' +
        slug);
      if(response !== 'OK') throw new Error(response);
    }
    catch(e) {
      console.error(`Server ${srv} failed with`, e);
    }
  }
}

async function loadSRSData(rating_servers, data){
  const reg = /[^a-z]/g;
  const saveName = 'bhv2srs-' + rating_servers[0].replace(reg, '$');
  for(let srv of rating_servers){
    try {
      let response = await request('GET', srv + '/download_counter');
      let obj = JSON.parse(response);
      localStorage.setItem(saveName, response);
      data.downloadCount = obj;
      return data;
    }
    catch(e) {
      console.error(`Server ${srv} failed with`, e);
    }
  }
  const saved = localStorage.getItem(saveName);
  if(saved){
    data.downloadCount = JSON.parse(saved);
    return data;
  }
  throw new Error('Could not load SRS data');
}

async function loadData(servers, rating_servers){
  for(let srv of servers){
    try {
      let response = await request('GET', srv + '/data.json', 'string', null);
      let obj = JSON.parse(response);
      localStorage.setItem('bhv2-save', response);
      return await loadSRSData(rating_servers, obj);
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
  constructor(ratings, data, downloadCount, dataVersion){
    super();
    this._data = data;
    this._dataVersion = dataVersion;
    this._downloadCount = downloadCount || 0;
    this.ratings = ratings;
    this.blobPromise = this.manifestPromise = null;
  }
  get name() {
    return this._data.name;
  }
  get description() {
    return this._data.description;
  }
  loadManifest() {
    if(this._dataVersion < 3) return Promise.resolve({
      version: this._data.download.version
    });

    if(!this.manifestPromise){
      this.manifestPromise = request(
        'GET', this._data.download.manifest, 'string', null
      ).then(str => Promise.resolve(JSON.parse(str)));
    }
    return this.manifestPromise;
  }
  getExtendedMetadata() {
    return this.loadManifest().then(mf => Promise.resolve({
      developer: {
        name: this._data.author.map(a => a.replace(/\s*<[^>]*>$/, ''))
              .join(', '),
      },
      source: this._data.git_repo,
      has_ads: this._data.has_ads,
      has_tracking: this._data.has_tracking,
      license: this._data.license,
      type: this._data.type,
      version: mf.version,
      download_count: this._downloadCount
    }));
  }
  findIcon(size) {
    return this._data.icon;
  }
  downloadPackage() {
    if(this.blobPromise)
      return this.blobPromise;
    return this.blobPromise = request(
      'GET', this._data.download.url, 'blob', null, null
    );
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
      countDownload(this.ratings, this._data.slug.toLowerCase());
      this._downloadCount++;
      return {args: [await this.blobPromise, this._data.slug]};
    }];
  }
  getIdentificationMethod() {
    if(this._dataVersion < 3){
      return ['checkImported', async () => {
        if(!this.blobPromise){
          this.blobPromise =
            request('GET', this._data.download.url, 'blob', null);
        }
        return {args: [await this.blobPromise, this._data.slug]};
      }];
    }
    return ['checkInstalled', async () => {
      return {args: [this._data.download.manifest,
        (await this.loadManifest()).origin || this._data.slug
      ]};
    }];
  }
  checkUpdatable(version) {
    return this.loadManifest().then(mf => Promise.resolve(
      (version && mf.version) ?
      (compareVersions(mf.version, version) > 0) : false
    ));
  }
}

export default class BHackersV2Store extends AppStore {
  constructor(
    servers = BHACKERS_SERVERS,
    ratings = BHACKERS_RATINGS,
    name = 'B-Hackers Store'
  ) {
    super();
    this.servers = servers;
    this.ratings = ratings;
    this.name = name;
  }
  load() {
    return loadData(this.servers, this.ratings).then(data => {
      this._data = data;
      console.log('[bhackers-v2] Got data', data);
      if(data.version < 3){
        console.log('[bhackers-v2] Old database version detected');
      }
      else if(data.version > 3){
        console.warn('[bhackers-v2] Database version too new!');
      }
      this.categories = [{
        name: 'Most downloaded', id: '$popular', special: true
      }].concat(Object.keys(data.categories).map(ctg => {
        return { name: data.categories[ctg].name, id: ctg };
      }));
    });
  }
  getApps(filter, start, count) {
    var origSet = this._data.apps;
    if(filter.keywords){
      console.log('[bhackers-v2] Keywords:', filter.keywords);
      origSet = origSet.map(app => {
        var score = 0;

        filter.keywords.forEach(kw => {
          kw = kw.toLowerCase();

          if(app.name.toLowerCase() === kw) score += 5;
          else if(app.name.toLowerCase().includes(kw)) score += 2;

          app.meta.tags.replace(/; */i, ';').split(';').forEach(tag => {
            if(tag.toLowerCase() === kw) score += 3;
            else if(tag.toLowerCase().includes(kw)) score += 1;
          });

          if(app.description.toLowerCase().includes(kw)) score += 2;
        });

        var new_app = Object.create(app);
        new_app.searchScore = score;
        return new_app;
      });
    }
    var filteredSet = origSet.filter(app => {
      var match = true;
      if(filter.categories){
        if(filter.categories[0].id !== '$popular'){
          match &= filter.categories.some(
            ct => app.meta.categories.includes(ct.id));
        }
      }
      if(filter.keywords){
        match &= (app.searchScore > 0);
      }
      return match;
    });
    if(filter.categories && filter.categories[0].id === '$popular'){
      filteredSet.sort((a, b) => {
        return (this._data.downloadCount[b.slug.toLowerCase()] || 0) -
          (this._data.downloadCount[a.slug.toLowerCase()] || 0);
      });
    }
    if(filter.keywords){
      filteredSet.sort((a, b) => b.searchScore - a.searchScore);
    }
    return Promise.resolve({
      apps: filteredSet
        .slice(start, start+count)
        .map(app => new BHackersV2App(
          this.ratings,
          app,
          this._data.downloadCount[app.slug.toLowerCase()],
          this._data.version
        )),
      isLastPage: start+count >= filteredSet.length
    });
  }
}
