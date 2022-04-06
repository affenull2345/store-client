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
import { pack, unpack, extractManifest } from './pkgutils';

class Installer {
  importPackage(installedId, pkg, idHint, calledFromImplementation) {
    if(calledFromImplementation){
      return Promise.reject(
        new Error('This installer cannot import apps'));
    }
    return unpack(pkg).then(unpacked => {
      return this.installPackage(installedId,
        unpacked.manifestURL, unpacked.pkg, idHint, true);
    });
  }
  async checkImported(pkg, idHint, calledFromImplementation) {
    if(calledFromImplementation){
      throw new Error('This installer cannot checkImported');
    }
    var unpacked = await unpack(pkg);
    return this.checkInstalled(unpacked.manifestURL, idHint, true) ||
      this.checkInstalledByOrigin((await extractManifest(unpacked.pkg)).origin);
  }
  installPackage(installedId, manifestURL, pkg, idHint, calledFromImplementation) {
    if(calledFromImplementation){
      return Promise.reject(
        new Error('This installer cannot install packages'));
    }
    return pack({manifestURL, pkg}).then(packed => {
      return this.importPackage(installedId, packed.pkg, idHint, true);
    });
  }
  installHosted(manifestURL) {
    return Promise.reject(
      new Error('This installer does not support hosted apps'));
  }
  checkInstalled(manifest_url, idHint, calledFromImplementation) {
    return Promise.reject(new Error('This installer cannot checkInstalled'));
  }
  checkInstalledByOrigin(origin) {
    return false;
  }
}

class InstalledApp {}

export { Installer, InstalledApp }
