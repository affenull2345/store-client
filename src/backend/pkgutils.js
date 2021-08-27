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
import JSZip from 'jszip';
function pack(data){
  var zip = new JSZip();
  zip.file('metadata.json', JSON.stringify({
    manifestURL: data.manifestURL
  }));
  zip.file('application.zip', data.pkg);
  return zip.generateAsync({type: 'blob'});
}
async function unpack(pkg){
  var zip = await JSZip.loadAsync(pkg);
  var metafile = zip.file('metadata.json');
  if(!metafile) throw new Error('Package is missing metadata file');
  var metadata = JSON.parse(await metafile.async('string'));
  if(!metadata.manifestURL) throw new Error('Metadata is missing manifestURL');
  var appfile = zip.file('application.zip');
  if(!appfile) throw new Error('Package is missing application.zip');
  return {
    manifestURL: metadata.manifestURL,
    pkg: await appfile.async('blob')
  };
}
async function extractManifest(pkg){
  var zip = await JSZip.loadAsync(pkg);
  var manifest = zip.file('manifest.webapp');
  if(!manifest) throw new Error('Package is missing manifest');
  return JSON.parse(await manifest.async('string'));
}

export { pack, unpack, extractManifest }
