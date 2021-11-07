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
import { Buffer } from 'buffer';
import * as hawk from 'hawk';

export default class Requester {
  constructor(auth, api, dev){
    this.auth = auth;
    this.api = api;
    this.dev = dev;
    switch(auth.method){
      case 'api-key':
        this.send({
          method: 'POST',
          data: {
            brand: dev.brand,
            device_id: dev.imei,
            device_type: dev.type,
            model: dev.model,
            os: dev.os,
            os_version: dev.version,
            reference: dev.cu
          },
          path: '/v3.0/applications/' + api.app.id + '/tokens',
          headers: {
            'Authorization': 'Key ' + auth.key
          },
          type: 'json'
        }).then(token => {
          this.token = token;
          this.onload();
        }).catch(e => {
          this.onerror(e);
        });
        break;
      default:
        this.onerror(new Error('Unknown authentication method: ' +
          auth.method));
        break;
    }
  }
  send(req){
    return new Promise((resolve, reject) => {
      if(!req.path)
        reject(new TypeError('request missing path'));
      else if(!req.method)
        reject(new TypeError('request missing method'));
      else {
        var xhr = new XMLHttpRequest({mozSystem: true});
        var path = req.path;
        var payload = ['POST', 'PUT'].includes(req.method) ? (
          (req.contentType && req.contentType !== 'application/json') ?
          req.data : JSON.stringify(req.data)
        ) : null;
        var hawkinfo;
        if(path[0] === '/'){
          path = this.api.server.url + path;
        }
        if(req.type === 'blob' || req.type === 'arraybuffer')
          xhr.responseType = req.type;

        xhr.open(req.method, path, true);
        if('object' === typeof req.headers){
          Object.keys(req.headers).forEach(name => {
            xhr.setRequestHeader(name, req.headers[name]);
          });
        }
        xhr.setRequestHeader('Kai-API-Version', this.api.ver);
        xhr.setRequestHeader('Kai-Request-Info',
          'ct="wifi", rt="auto", utc="' +
          Date.now() + '", utc_off="1", ' +
          'mcc="' + this.dev.mcc + '", ' +
          'mnc="' + this.dev.mnc + '", ' +
          'net_mcc="null", ' +
          'net_mnc="null"'
        );
        xhr.setRequestHeader('Kai-Device-Info',
          'imei="' + this.dev.imei + '", curef="' + this.dev.cu + '"');
        xhr.setRequestHeader('User-agent', this.dev.ua);
        xhr.setRequestHeader('Content-type',
          req.contentType || 'application/json');
        if(this.token){
          hawkinfo = {
            credentials: {
              id: this.token.kid,
              algorithm: 'sha256',
              key: new Buffer(this.token.mac_key, 'base64')
            }
          };
          if(payload){
            hawkinfo.payload = payload;
            hawkinfo.contentType = req.contentType || 'application/json';
          }
          xhr.setRequestHeader('Authorization',
            hawk.client.header(path, req.method, hawkinfo).header);
        }
        xhr.onerror = function(){
          reject(new Error('request error'));
        }
        xhr.onprogress = function(e){
          if(req.reportProgress)
            req.reportProgress('Downloading', Math.floor(
              e.loaded / e.total * 100
            ));
        }
        xhr.onload = function(){
          var msg = '';
          if(xhr.status !== 200 && xhr.status !== 201 && xhr.status !== 204){
            if(xhr.responseText){
              try {
                var error = JSON.parse(xhr.responseText);
                msg = ' ' + error.desc + ': ' + error.cause;
              } catch(e) {
                msg = ' ' + xhr.responseText;
              }
            }
            reject('request error ' + xhr.status + ': ' + xhr.statusText + msg);
          }
          if(req.type === 'json'){
            try {
              resolve(JSON.parse(xhr.responseText));
            }
            catch(e){
              reject(e);
            }
          }
          else {
            resolve(xhr.response);
          }
        }
        xhr.send(payload);
      }
    });
  }
}
