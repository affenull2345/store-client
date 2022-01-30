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
import TextInput from './ui/TextInput';
import SoftKey from './ui/SoftKey';
import AppList from './AppList';
import './Search.css';

export default class Search extends Component {
  constructor(props){
    super(props);
    this.state = {
      keywords: [],
      searchActive: true
    };
    this.appList = null;
    this.search = '';
  }
  handleKeydown = (e) => {
    if(e.key === 'Backspace' && this.props.onClose){
      e.preventDefault();
      this.props.onClose();
    }
  }
  handleKeyup = (e) => {
    if(e.key === 'Enter' && this.state.searchActive){
      this.updateKeywords();
    }
  }
  activateSearch() {
    var node = findDOMNode(this.inp);
    if(node){
      node.focus();
      this.setState({
        searchActive: true
      });
    }
  }
  componentDidMount() {
    this.activateSearch();
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('keyup', this.handleKeyup);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('keyup', this.handleKeyup);
  }
  render() {
    if(!this.appList){
      this.appList = this.state.keywords.length > 0 ?
        <AppList
          store={this.props.store}
          filters={{keywords: this.state.keywords}}
          useFocus={true}
          canNavigateUp={true}
          onNavigateUp={() => this.activateSearch()}
        /> :
        <div className='SearchPlaceholder p-pri'>
          Please enter a search term
        </div>
    }
    return (
      <div className='Search'>
        <TextInput
          onChange={() => this.search = this.inp.props.value}
          onFocus={() => this.setState({searchActive: true})}
          onBlur={() => this.setState({searchActive: false})}
          ref={inp => this.inp = inp}
        />
        {this.appList}
        <SoftKey
          leftText=''
          centerText={this.state.searchActive ? 'Search' : 'Select'}
          rightText=''
        />
      </div>
    );
  }
  updateKeywords() {
    const reg = /[.,; ]+/ig;
    this.appList = null;
    this.setState({
      keywords: this.search.replace(reg, ' ').split(' ').filter(a => a)
    });
  }
}
