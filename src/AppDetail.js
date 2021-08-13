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
import './AppDetail.css';

export default class AppDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      extendedMetadata: null
    };
  }
  renderExtendedMetadata() {
    if(!this.state.extendedMetadata){
      this.props.app.getExtendedMetadata().then(metadata => {
        this.setState({
          extendedMetadata: metadata
        });
      });
      return null;
    }

    let meta = this.state.extendedMetadata;
    return Object.keys(meta).map(key => {
      switch(key){
        case 'developer':
          return <div><b>Developers:</b>{meta[key].name}</div>;
        case 'license':
          return <div><b>License:</b>{meta[key]}</div>;
        default:
          return null;
      }
    });
  }

  render() {
    return (
      <div className='AppDetail'>
        <div className='p-sec'>
          {this.props.app.description}
        </div>
        <div className='AppDetailMetadata'>
          {this.renderExtendedMetadata()}
        </div>
      </div>
    );
  }
}
