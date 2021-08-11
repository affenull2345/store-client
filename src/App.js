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
import Store from './Store'
import Setup from './Setup'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      setupDone: true
    };
  }
  render() {
    if(!this.state.setupDone){
      return (
        <div className='App'>
          <Setup onSetup={() => this.setState({setupDone: true})} />
        </div>
      );
    }
    else {
      return (
        <div className='App'>
          <Store />
        </div>
      );
    }
  }
}

export default App;
