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

import { findDOMNode } from 'inferno-extras';
import { cloneVNode } from 'inferno-clone-vnode';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

function focusIntoView(ref, settings){
  var node = findDOMNode(ref);
  if(node){
    setTimeout(() => {
      node.focus()
    }, 10);
    scrollIntoView(node, settings);
  }
}

export default function Focus(props){
  const { children, settings, isActive } = props;
  const child = Array.isArray(children) ? children[0] : children;
  return cloneVNode(child, {
    ref: isActive ? node => {
      focusIntoView(node, settings || {
        behavior: 'auto',
        block: 'nearest',
        inline: 'start'
      });
    } : null
  });
}
