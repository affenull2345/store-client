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
import Requester from './kaistone-requester';

function getKaiOSVersion(){
  var kaiUA = /(KAIOS|B2GOS)\/([^ ]*)/.exec(navigator.userAgent);
  if(kaiUA) return kaiUA[2];
  else return '2.5.4';
}


class KaiStoneApp extends StoreApp {
  constructor(data, requester){
    super();
    this.requester = requester;
    this._data = data;
  }
  get name() {
    return this._data.display || this._data.name;
  }
  get description() {
    return this._data.description;
  }
  findIcon(preferredSize) {
    if(this._data.thumbnail_url) return this._data.thumbnail_url;

    var sizes = Object.keys(this._data.icons);
    var bestSize = null, currentDiff = null;
    sizes.forEach(size => {
      var diff = preferredSize - size;
      if(diff < 0) diff = -diff;
      if(currentDiff === null || diff < currentDiff){
        bestSize = size;
        currentDiff = diff;
      }
    });
    if(!bestSize){
      return null;
    }
    return this._data.icons[bestSize];
  }
  loadManifest() {
    if(!this.manifestPromise){
      this.manifestPromise = this.requester.send({
        method: 'GET',
        path: this._data.manifest_url,
        type: 'json'
      });
    }
    return this.manifestPromise;
  }
  getExtendedMetadata() {
    var getDeveloper;
    if('string' === typeof this._data.developer &&
      'string' === typeof this._data.developer_url)
    {
      getDeveloper = Promise.resolve({
        name: this._data.developer,
        url: this._data.developer_url
      });
    }
    else {
      getDeveloper = this.loadManifest().then(mf => {
        return Promise.resolve(mf.developer);
      });
    }
    return getDeveloper.then(developer => {
      return Promise.resolve({
        developer,
        version: this._data.version,
        type: this._data.type
      });
    });
  }
  async downloadPackage() {
    if(this.blobPromise)
      return await this.blobPromise;
    return await (this.blobPromise = this.requester.send({
      method: 'GET',
      path: this._data.package_path ||
        (await this.loadManifest()).package_path,
      type: 'blob'
    }));
  }
  getInstallationMethod() {
    return ['installPackage', async (reportProgress) => {
      if(!this.blobPromise){
        this.blobPromise = this.requester.send({
          method: 'GET',
          path: this._data.package_path ||
            (await this.loadManifest()).package_path,
          type: 'blob',
          reportProgress
        });
      }
      return {args: [
        this._data.manifest_url,
        await this.blobPromise,
        null, //this._data.id
      ]};
    }];
  }
  getIdentificationMethod() {
    return ['checkInstalled', async () => {
      const manifest = await this.loadManifest();
      return {args: [
        this._data.manifest_url,
        this._data.type === 'web' && (manifest.origin || this._data.id),
        manifest.name
      ]};
    }];
  }
  checkUpdatable(version) {
    return Promise.resolve(
      version ? (compareVersions(this._data.version, version) > 0) : false
    );
  }
}

export default class KaiStone extends AppStore {
  constructor(server='https://api.kaiostech.com', name='KaiStone (KaiStore)') {
    super();
    this.name = name;
    this.settings = {
      dev: {
        model: 'GoFlip2',
        imei: '123456789012345',
        type: 999999,
        brand: 'AlcatelOneTouch',
        os: 'KaiOS',
        version: getKaiOSVersion(),
        ua: 'Mozilla/5.0 (Mobile; GoFlip2; rv:48.0) '
          + 'Gecko/48.0 Firefox/48.0 KAIOS/' + getKaiOSVersion(),
        cu: '4044O-2BAQUS1-R',
        mcc: '0',
        mnc: '0'
      },
      api: {
        app: {
          id: 'CAlTn_6yQsgyJKrr-nCh',
          name: 'KaiOS Plus',
          ver: '2.5.4'
        },
        server: {
          url: server
        },
        ver: '3.0'
      },
      auth: {
        method: 'api-key',
        key: 'baJ_nea27HqSskijhZlT'
      }
    };
  }
  load() {
    return this.loadPromise || (
      this.loadPromise = new Promise((resolve, reject) => {
        this.requester = new Requester(
          this.settings.auth, this.settings.api, this.settings.dev
        );
        this.requester.onload = () => {
          this.requester.send({
            method: 'GET',
            path: '/v3.0/categories',
            type: 'json'
          }).then(ctgs => {
            console.log('[kaistone] Categories', ctgs);
            this.categories = ctgs;
            resolve();
          }).catch(reject);
        }
        this.requester.onerror = e => {
          reject(e);
        }
      })
    );
  }
  getApps(filter, start, count) {
    var isSearch = false, clientSideCategoryFilter = false;
    var path = '/kc_ksfe/v1.0/apps';
    if(Array.isArray(filter.keywords)){
      isSearch = true;
      path =
        `${this.settings.api.server.url.replace('api', 'search')}/v3/_search`;
    }
    path += '?bookmark=false';
    path += '&imei=' + this.settings.dev.imei;
    if(isSearch){
      path += '&platform=' + this.settings.dev.version;
      path += '&page=' + Math.floor(start/count);
      path += '&size=' + count;
    }
    else {
      path += '&os=' + this.settings.dev.version;
      path += '&page_size=' + count;
      path += '&page_num=' + (1+Math.floor(start/count));
    }
    path += '&mnc=' + this.settings.dev.mnc + '&mcc=' + this.settings.dev.mcc;
    if(filter.categories && filter.categories.length > 0){
      if(filter.categories.length === 1)
        path += '&category=' + encodeURIComponent(filter.categories[0].code);
      else
        clientSideCategoryFilter = true;
    }
    if(isSearch){
      path += '&query=' + filter.keywords.join(' ');
      path += '&locale=' + encodeURIComponent(navigator.language);
    }
    return this.requester.send({
      method: 'GET',
      type: 'json',
      path
    }).then(data => {
      var filtered = (isSearch ? data.organic : data.apps).filter(app => {
        var match = true;
        if(clientSideCategoryFilter){
          match &= filter.categories.some(
            ct => app.category_list.includes(ct.code));
        }
        return match;
      });
      return Promise.resolve({
        apps: filtered.map(app => new KaiStoneApp(app, this.requester)),
        isLastPage: isSearch ? data.page === data.total_pages-1 : data.last_page
      });
    });
  }
}
