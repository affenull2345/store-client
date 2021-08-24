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
import 'KaiUI/src/components/TextInput/TextInput.scss';
import './AppTheme.css';

export default class TextInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false
    };
  }
  render() {
    const cls = this.state.focused ?
        'kai-text-input kai-text-input--focused item-selected' :
        'kai-text-input';
    return (
      <div
        id={this.props.id}
        tabIndex={0}
        className={cls}
        onFocus={this.handleFocus.bind(this)}
      >
        <label className='kai-text-input-label p-thi'>{this.props.label}</label>
        <input
          ref={inp => this.inp = inp}
          type={this.props.type}
          className='kai-text-input-input p-pri'
          onBlur={this.handleBlur.bind(this)}
          onChange={this.handleChange.bind(this)}
          onKeyUpCapture={this.handleKeyUp.bind(this)}
          value={this.props.value}
          placeholder={this.props.placeholder}
        />
      </div>
    );
  }
  handleChange() {
    this.props.value = this.inp.value;
    if(this.props.onChange) this.props.onChange();
  }
  handleKeyUp() {
  }
  handleFocus() {
    if(this.props.onFocus) this.props.onFocus();
    this.setState({focused: true});
    this.inp.focus();
  }
  handleBlur() {
    if(this.props.onBlur) this.props.onBlur();
    this.setState({focused: false});
  }
}
