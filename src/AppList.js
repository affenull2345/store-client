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
import { Component } from 'inferno';
import { findDOMNode } from 'inferno-extras';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';
import AppButton from './AppButton';
import './AppList.css';

function focusIntoView(ref){
  var node = findDOMNode(ref);
  node.focus();
  scrollIntoView(node, {
    behavior: 'smooth',
    block: 'center',
    inline: 'start',
    duration: 600
  });
}

export default class AppList extends Component {
  constructor(props) {
    super(props);
    this.apps = [];
    this.appRefs = [];
    this.state = {
      loading: false,
      loadedPages: 0,
      isLastPage: false,
      selected: 0
    };
    this.scrolling = Promise.resolve();
  }
  handleKeydown(e) {
    var idx = this.state.selected;
    if(e.key === 'ArrowUp'){
      e.preventDefault();
      idx--;
      if(idx >= 0){
        if(this.appRefs[idx]) focusIntoView(this.appRefs[idx]);
        this.setState({
          selected: idx
        });
      }
    }
    else if(e.key === 'ArrowDown'){
      e.preventDefault();
      idx++;
      if(!this.state.loading){
        if(idx < this.apps.length){
          if(this.appRefs[idx]) focusIntoView(this.appRefs[idx]);
          this.setState({
            selected: idx
          });
        }
        if(idx >= (this.apps.length - 2) && !this.state.isLastPage){
          this.setState({
            loading: true,
            selected: idx,
            isLastPage: false
          });
          this.loadNextPage();
        }
      }
    }
  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }
  loadNextPage(after) {
    const nextPage = this.state.loadedPages + 1;
    return this.props.store.getApps(this.props.filters, (nextPage-1)*10, 10)
    .then(({apps, isLastPage}) => {
      console.log('[AppList] Is last page:', isLastPage);
      this.apps = this.apps.concat(apps);
      this.setState({
        loading: false,
        loadedPages: nextPage,
        isLastPage
      });
      if(this.appRefs[this.state.selected])
        focusIntoView(this.appRefs[this.state.selected]);
    }).catch(e => {
      console.error('Failed to load next page', e);
      setTimeout(() => {
        this.loadNextPage();
      }, 3000);
    });
  }
  renderApps() {
    if(this.state.loadedPages === 0){
      if(!this.loading){
        this.loading = true;
        this.loadNextPage();
      }
      return 'Loading...';
    }
    return this.apps.map((app, i) => {
      return (
        <AppButton
          app={app}
          ref={node => this.appRefs[i] = node}
        />
      );
    });
  }
  render() {
    return (
      <div className='AppList'>{this.renderApps()}</div>
    );
  }
}
