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
import SelectPopup from './ui/SelectPopup';
import RadioButtonListItem from './ui/RadioButtonListItem';
import toast from './Toaster';
import Search from './Search';
import AppList from './AppList';
import BHackersV2Store from './backend/appstore/bhackers-v2';
import KaiStone from './backend/appstore/kaistone';
import './Store.css';

export default class Store extends Component {
  constructor(props) {
    super(props);

    this.stores = [
      new BHackersV2Store(),
      new BHackersV2Store([
        'https://storedb.opengiraffes.top',
      ], [
        'https://opengiraffes-rating.herokuapp.com',
      ], 'OpenGiraffes (China)'),
      new KaiStone(),
      new KaiStone('https://api.stage.kaiostech.com', 'KaiStone stage'),
      new KaiStone('https://api.test.kaiostech.com', 'KaiStone test'),
    ];
    this.state = {
      store: 0,
      loaded: false,
      loading: false,
      searchOpen: false,
      error: null
    };
  }
  storeLoadComplete(idx) {
    toast(this.stores[idx].name);
    if(this.state.store === idx)
      this.setState({loaded: true, loading: false});
  }
  render() {
    const popup = this.state.selecting && <SelectPopup
      header="Select source"
      onClose={() => this.setState({
        selecting: false
      })}
    >{this.stores.map((store, index) =>
      <RadioButtonListItem
        isChecked={index === this.state.store}
        onSelect={() => this.setState({
          store: index,
          loaded: false,
          loading: false,
          selecting: false,
          error: null
        })}
      >
        {store.name}
      </RadioButtonListItem>
    )}</SelectPopup>;

    if(!this.state.loaded){
      if(this.state.error){
        return (
          <div className='Store'>
            <div className='StoreLoadFailed'>
              <h3>Loading failed</h3>
              {this.state.error}
            </div>
            <SoftKey
              leftText='Quit'
              centerText='Retry'
              rightText='Switch'
              leftCallback={() => window.close()}
              centerCallback={() => this.setState({
                loaded: false,
                loading: false,
                error: null
              })}
              rightCallback={() => this.setState({
                selecting: true
              })}
            />
            {popup}
          </div>
        );
      }
      if(!this.state.loading){
        this.setState({loading: true, loaded: false, error: null});
        this.stores[this.state.store]
          .load()
          .then(() => this.storeLoadComplete(this.state.store))
          .catch(e => {
            toast('Failed');
            this.setState({
              loading: false,
              loaded: false,
              error: e.toString()
            });
          });
      }
      return (
        <div className='Store'>
          Loading...
        </div>
      );
    }

    if(this.state.searchOpen){
      return (
        <Search
          onClose={() => this.setState({ searchOpen: false})}
          store={this.stores[this.state.store]}
        />
      );
    }

    const tabs = this.stores[this.state.store].categories.map(ctg => (
      <AppList
        store={this.stores[this.state.store]}
        filters={{categories: [ctg]}}
        useFocus={!this.state.selecting}
      />
    ));
    const labels = this.stores[this.state.store].categories.map(
      ctg => ctg.name);
    return (
      <div className='Store'>
        <TabView tabLabels={labels}>{tabs}</TabView>
        <SoftKey
          leftIcon='kai-icon-search'
          centerText='Select'
          rightText='Switch'
          leftCallback={() => this.setState({ searchOpen: true })}
          rightCallback={() => this.setState({
            selecting: true
          })}
        />
        {popup}
      </div>
    );
  }
}
