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
import TabView from './ui/TabView';
import SoftKey from './ui/SoftKey';
import AppList from './AppList';
import BHackersV2Store from './backend/appstore/bhackers-v2';
import './Store.css';

export default class Store extends Component {
  constructor(props) {
    super(props);

    this.stores = [new BHackersV2Store()];
    this.state = {
      store: 0,
      loaded: false,
      loading: false
    };
  }
  storeLoadComplete(idx) {
    if(this.state.store === idx)
      this.setState({store: idx, loaded: true});
  }
  render() {
    if(!this.state.loaded){
      if(!this.state.loading){
        this.setState({loading: true, loaded: false, store: this.state.store});
        this.stores[this.state.store]
          .load().then(this.storeLoadComplete.bind(this, 0));
      }
      return (
        <div className='Store'>
          Loading...
        </div>
      );
    }

    const tabs = this.stores[this.state.store].categories.map(ctg => (
      <AppList
        store={this.stores[this.state.store]}
        filters={{categories: [ctg]}}
      />
    ));
    const labels = this.stores[this.state.store].categories.map(
      ctg => ctg.name);
    return (
      <div className='Store'>
        <TabView tabLabels={labels}>{tabs}</TabView>
        <SoftKey
          leftText=''
          centerText='Select'
          rightText='Options'
        />
      </div>
    );
  }
}
