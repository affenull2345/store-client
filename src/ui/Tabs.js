/*
 * KaiUI wrapper for InfernoJS
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
import { Component } from 'inferno';
import { cloneVNode } from 'inferno-clone-vnode';
import { findDOMNode } from 'inferno-extras';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';
import 'KaiUI/src/components/Tabs/Tabs.scss';

export default class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0
    };
    this.childRefs = [];
  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }
  renderChildren() {
    return this.props.children.map((tab, i) => {
      return cloneVNode(tab, {
        isActive: this.state.index === i,
        ref: node => this.childRefs[i] = node
      });
    });
  }
  render() {
    return (
      <div className='kai-tabs'>{this.renderChildren()}</div>
    );
  }
  handleKeyDown(e){
    var idx = this.state.index;
    if(e.key === 'ArrowLeft'){
      this.setTabActive(idx, false);
      idx--;
      if(idx < 0) idx = this.props.children.length - 1;
      this.setTabActive(idx, true);
      this.setState({index: idx});
      if(this.props.onChangeIndex) this.props.onChangeIndex(idx);
    }
    else if(e.key === 'ArrowRight'){
      this.setTabActive(idx, false);
      idx++;
      if(idx >= this.props.children.length) idx = 0;
      this.setTabActive(idx, true);
      this.setState({index: idx});
      if(this.props.onChangeIndex) this.props.onChangeIndex(idx);
    }
  }
  setTabActive(idx, isActive) {
    if(this.props.children.length > idx){
      this.props.children[idx].props.isActive = isActive;
      if(isActive && this.childRefs[idx]){
        scrollIntoView(findDOMNode(this.childRefs[idx]), {
          behavior: 'smooth',
          block: 'start',
          inline: 'center'
        });
      }
    }
  }
}
