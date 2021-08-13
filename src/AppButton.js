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
import AppView from './AppView';
import './AppButton.css';

export default class AppButton extends Component {
  constructor(props){
    super(props);
    this.state = {
      focused: false,
      open: false
    };
  }
  render() {
    return (
      <div
        className='app-button'
        tabIndex={0}
        onFocus={this.handleFocus.bind(this)}
      >
        <button
          className='app-button-button'
          style={`background-image: url(${this.props.app.findIcon(56)})`}
          onBlur={this.handleBlur.bind(this)}
          onClick={this.handleClick.bind(this)}
          ref={btn => this.btn = btn}
        >{this.props.app.name}</button>
        {this.state.open ? (
          <AppView
            app={this.props.app}
            onClose={this.handleFocus.bind(this)}
          />
        ) : null}
      </div>
    );
  }
  handleClick() {
    this.setState({focused: true, open: true});
  }
  handleFocus() {
    this.setState({focused: true, open: false});
    this.btn.focus();
  }
  handleBlur() {
    this.setState({focused: false, open: this.state.open});
  }
}
