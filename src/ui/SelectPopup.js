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

/* This component is a derivative of KaiUI's Dialog */

import { Component, createPortal } from 'inferno';
import Focus from './Focus';
import SoftKey from './SoftKey';
import 'KaiUI/src/components/Dialog/Dialog.scss';
import './SelectPopup.css';

/* focus logging
HTMLElement.prototype.realFocus = HTMLElement.prototype.focus;
HTMLElement.prototype.focus = function(){
  console.log('focus', this);
  this.realFocus();
}
*/

const modalRoot = document.getElementById('modal-root');

export default class SelectPopup extends Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
    this.el.className = 'kai-dialog';
    this.el.tabIndex = 0;
    this.state = {
      selected: 0
    };
  }
  handleKeydown = (evt) => {
    // A modal should intercept all keys received, to avoid
    // having them handled by other components
    evt.stopPropagation();
    if(evt.key !== 'Enter') evt.preventDefault();

    switch(evt.key){
      case 'Backspace':
        this.props.onClose && this.props.onClose();
        break;
      case 'ArrowDown':
        this.setState({
          selected: (this.state.selected + 1) % this.props.children.length || 0
        });
        break;
      case 'ArrowUp':
        this.setState({
          selected: (this.state.selected + this.props.children.length - 1) %
            this.props.children.length || 0
        });
        break;
      default:
        break;
    }
  }
  componentDidMount() {
    modalRoot.appendChild(this.el);
    this.el.addEventListener('keydown', this.handleKeydown);
  }
  componentWillUnmount() {
    this.el.removeEventListener('keydown', this.handleKeydown);
    modalRoot.removeChild(this.el);
  }
  render() {
    const {
      header,
      children,
      onClose,
    } = this.props;
    return createPortal(
      <>
        <div className="kai-dialog-wrapper">
          {header && <div className="kai-dialog-header h1">{header}</div>}
          <div className="select-popup-container">
            {children.map((child, i) =>
              <Focus isActive={this.state.selected === i}>{child}</Focus>
            )}
          </div>
        </div>
        <SoftKey
          leftText="Cancel"
          leftCallback={() => { onClose && onClose() }}
          centerText="Select"
          centerCallback={() => {
            document.activeElement.dispatchEvent(new MouseEvent('click'));
          }}
          keyboardReceiver={this.el}
        />
      </>,
      this.el
    );
  }
}
