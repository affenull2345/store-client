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
import { Component, createPortal } from 'inferno';
import { findDOMNode } from 'inferno-extras';
import installApp from './backend/install-app';
import checkInstalled, { installStatusUpdate } from './backend/check-installed';
import SoftKey from './ui/SoftKey';
import AppDetail from './AppDetail';
import './AppView.css';

const modalRoot = document.getElementById('modal-root');

export default class AppView extends Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
    this.el.className = 'AppViewContainer';
    this.el.tabIndex = 0;
    this.state = {
      status: '',
      installState: 'unknown',
      locked: false
    };
  }
  open() {
    this.installedApp.open();
  }
  uninstall() {
    console.log(this.installedApp);
    if(this.state.installState === 'not-installed' || !this.installedApp)
      return;
    if(!window.confirm('Uninstall ' + this.props.app.name + '?')) return;

    this.installedApp.uninstall().then(() => {
      this.setState({
        status: 'Uninstalled',
        installState: 'not-installed'
      });
    });
  }
  install() {
    this.setState({
      status: 'Installing',
      locked: true
    });
    installApp(this.props.app, (stage, progress) => {
      this.setState({
        status: `${stage} (${progress}%)`
      });
    }).then(() => {
      this.setState({
        status: 'Installed!',
        locked: false
      });
    }).catch(err => {
      alert('While installing app: ' + err);
      this.setState({
        status: 'Failed',
        locked: false
      });
    });
  }

  handleKeyDown(e) {
    // A modal should intercept all keys received, to avoid
    // having them handled by other components
    e.stopPropagation();
    e.preventDefault();

    let node = null;
    switch(e.key){
      case 'Backspace':
        if(!this.state.locked && this.props.onClose){
          this.props.onClose();
        }
        break;
      case 'ArrowDown':
        if(this.boxRef) node = findDOMNode(this.boxRef);
        if(node) node.scrollBy({
          top: 10,
          left: 0
        });
        break;
      case 'ArrowUp':
        if(this.boxRef) node = findDOMNode(this.boxRef);
        if(node) node.scrollBy({
          top: -10,
          left: 0
        });
        break;
      default:
        break;
    }
  }

  componentDidMount() {
    modalRoot.appendChild(this.el);
    this.handleKeyDown_bound = this.handleKeyDown.bind(this);
    this.el.addEventListener('keydown', this.handleKeyDown_bound);
    this.el.focus();
    installStatusUpdate.subscribe(this.updateInstallState.bind(this));
  }
  componentWillUnmount() {
    modalRoot.removeChild(this.el);
    this.el.removeEventListener('keydown', this.handleKeyDown_bound);
    installStatusUpdate.unsubscribe(this.updateInstallState.bind(this));
  }

  updateInstallState() {
    checkInstalled(this.props.app).then(app => {
      if(app){
        this.installedApp = app;
        return this.props.app.checkUpdatable(app.version).then(updatable => {
          this.setState({
            installState: updatable ? 'updatable' : 'installed'
          });
        });
      }
      else {
        this.setState({
          installState: 'not-installed'
        });
      }
    }).catch(e => {
      console.error('Install check failed', e);
      this.setState({
        status: 'Install check failed',
        installState: 'check-failed'
      });
    });
    this.setState({
      installState: 'checking'
    });
  }
  render() {
    if(this.state.installState === 'unknown'){
      this.updateInstallState();
    }
    return createPortal(
      (<>
        <div className='AppView' ref={r => this.boxRef = r} >
          <div
            className='AppViewHeader'
            style={`background-image: url(${this.props.app.findIcon(60)})`}
          >
            <h3>{this.props.app.name}</h3>
            <div className='AppViewStatus'>{this.state.status}</div>
          </div>
          <AppDetail app={this.props.app} />
        </div>
        <SoftKey
          leftText=''
          centerText={
            this.state.locked ? '' :
            this.state.installState === 'installed' ? 'Open' :
            this.state.installState === 'updatable' ? 'Update' : 'Install'
          }
          rightText={
            this.state.locked ? '' :
            this.state.installState === 'not-installed' ? '' :
            this.state.installState === 'checking' ? 'Checking...' :
            'Uninstall'
          }
          centerCallback={
            this.state.locked ? null :
            this.state.installState === 'installed' ? this.open.bind(this) :
            this.install.bind(this)
          }
          rightCallback={this.state.locked ? null : this.uninstall.bind(this)}
          keyboardReceiver={this.el}
        />
      </>),
      this.el
    );
  }
}
