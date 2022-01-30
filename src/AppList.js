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
import Focus from './ui/Focus';
import AppButton from './AppButton';
import './AppList.css';

export default class AppList extends Component {
  constructor(props) {
    super(props);
    this.apps = [];
    this.state = {
      loading: false,
      loadedPages: 0,
      isLastPage: false,
      selected: 0
    };
    this.savedFilters = props.filters;
  }
  handleKeydown = (e) => {
    var idx = this.state.selected;
    if(e.key === 'ArrowUp'){
      e.preventDefault();
      idx--;
      if(idx >= 0){
        this.setState({
          selected: idx
        });
      }
      else if(idx === -1 && this.props.canNavigateUp){
        this.setState({
          selected: idx
        });
        this.props.onNavigateUp();
      }
    }
    else if(e.key === 'ArrowDown'){
      e.preventDefault();
      idx++;
      if(!this.state.loading){
        if(idx < this.apps.length){
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
    document.addEventListener('keydown', this.handleKeydown);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
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
    }).catch(e => {
      console.error('Failed to load next page', e);
      setTimeout(() => {
        this.loadNextPage();
      }, 3000);
    });
  }
  renderApps() {
    if(this.props.filters !== this.savedFilters){
      this.savedFilters = this.props.filters;
      this.apps = [];
      this.loading = false;
      this.setState({
        loading: false,
        loadedPages: 0,
        isLastPage: false,
        selected: 0
      });
      return;
    }
    if(this.state.loadedPages === 0){
      if(!this.loading){
        this.loading = true;
        this.loadNextPage();
      }
      return 'Loading...';
    }
    if(this.apps.length === 0){
      return (
        <div className='AppListEmpty p-pri'>No results.</div>
      );
    }
    return this.apps.map((app, i) => {
      return (
        <Focus
          isActive={this.props.useFocus && this.state.selected === i}
          settings={{
            behavior: 'smooth',
            block: 'center',
            inline: 'start',
            duration: 600
          }}
        >
          <AppButton app={app} />
        </Focus>
      );
    });
  }
  render() {
    return (
      <div className='AppList'>{this.renderApps()}</div>
    );
  }
}
