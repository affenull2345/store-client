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

const settings = {
  dev: {
    model: 'GoFlip2',
    imei: '123456789012345',
    type: 999999,
    brand: 'AlcatelOneTouch',
    os: 'KaiOS',
    version: getKaiOSVersion(),
    ua: 'Mozilla/5.0 (Mobile; GoFlip2; rv:48.0) Gecko/48.0 Firefox/48.0 KAIOS/'+
      getKaiOSVersion(),
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
      url: 'https://api.kaiostech.com'
    },
    ver: '3.0'
  },
  auth: {
    method: 'api-key',
    key: 'baJ_nea27HqSskijhZlT'
  }
};

class KaiStoneApp extends StoreApp {
  constructor(data, requester){
    super();
    this.requester = requester;
    this._data = data;
  }
  get name() {
    return this._data.display;
  }
  get description() {
    return this._data.description;
  }
  findIcon(preferredSize) {
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
  getExtendedMetadata() {
    return Promise.resolve({
      version: this._data.version
    });
  }
  getInstallationMethod() {
    return ['installPackage', async (reportProgress) => {
      if(!this.blobPromise){
        this.blobPromise = this.requester.send({
          method: 'GET',
          path: this._data.package_path,
          type: 'blob'
        });
      }
      return {args: [
        this._data.manifest_url,
        await this.blobPromise,
        this._data.name
      ]};
    }];
  }
  getIdentificationMethod() {
    return ['checkInstalled', async () => {
      return {args: [
        this._data.manifest_url,
        this._data.name
      ]};
    }];
  }
  checkUpdatable(version) {
    return version ? (compareVersions(this._data.version, version) > 0) : false;
  }
}

export default class KaiStone extends AppStore {
  load() {
    return this.loadPromise || (
      this.loadPromise = new Promise((resolve, reject) => {
        this.requester = new Requester(
          settings.auth, settings.api, settings.dev
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
    var path = '/kc_ksfe/v1.0/apps?bookmark=false&link=false';
    path += '&imei=' + settings.dev.imei;
    path += '&page_size=' + count + '&page_num=' + start/count;
    path += '&simMNC=' + settings.dev.mnc + '&simMCC=' + settings.dev.mcc;
    path += '&currentMCC=null&currentMNC=null';
    if(filter.categories && filter.categories.length === 1)
      path += '&category=' + filter.categories[0].code;
    return this.requester.send({
      method: 'GET',
      type: 'json',
      path
    }).then(data => {
      var filtered = data.apps.filter(app => {
        var match = true;
        if(filter.categories && filter.categories.length > 1){
          match &= filter.categories.some(
            ct => app.category_list.includes(ct.code));
        }
        return match;
      });
      return Promise.resolve({
        apps: filtered.map(app => new KaiStoneApp(app, this.requester)),
        isLastPage: data.last_page
      });
    });
  }
  get name() {
    return 'KaiStore (KaiStone backend)';
  }
}
