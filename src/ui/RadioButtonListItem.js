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
import 'KaiUI/src/components/RadioButtonListItem/RadioButtonListItem.scss';
import './RadioButtonListItem.css';

export default class RadioButtonListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false
    };
  }
  handleFocus() {
    if(this.buttonRef) this.buttonRef.focus();
  }
  handleButtonFocus(isFocused) {
    this.setState({ isFocused });
  }
  render() {
    const buttonCls =
      `kai-rbl-button-input-${this.state.isFocused ? 'focused' : 'unfocused'}`;
    const cls =
      `kai-rbl${this.state.isFocused ? ' kai-rbl-focused' : ''}`;
    return (
      <div className={cls} tabIndex={-1} onFocus={() => this.handleFocus()}>
        <div className="kai-rbl-line left">
          <div className="kai-rbl-primary">{this.props.children}</div>
        </div>
        <div className="kai-rbl-button">
          <input
            className={buttonCls}
            tabIndex={-1}
            type="radio"
            checked={this.props.isChecked}
            ref={node => this.buttonRef = node}
            onFocus={() => this.handleButtonFocus(true)}
            onBlur={() => this.handleButtonFocus(false)}
            onClick={() => this.props.onSelect && this.props.onSelect()}
          />
        </div>
      </div>
    );
  }
}
