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
import 'KaiUI/src/views/TabView/TabView.scss';
import Tabs from './Tabs';
import Tab from './Tab';

export default class TabView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: 0
    };
  }
  handleChangeIndex(idx) {
    this.setState({active: idx});
  }
  renderTabs() {
    return this.props.tabLabels.map((tab, i) => (
      <Tab label={tab} />
    ));
  }
  renderContent() {
    return this.props.children.map((child, i) => (
      i === this.state.active ? child : null
    ));
  }
  render() {
    return (
      <div className='kai-tab-view'>
        <div className='kai-tab-view-tabs'>
          <Tabs onChangeIndex={this.handleChangeIndex.bind(this)}>
            {this.renderTabs()}
          </Tabs>
        </div>
        <div className='kai-tab-view-content'>
          {this.renderContent()}
        </div>
      </div>
    );
  }
}
