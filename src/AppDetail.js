import { Component, createPortal } from 'inferno';
import { findDOMNode } from 'inferno-extras';
import installApp from './backend/install-app';
import SoftKey from './ui/SoftKey';
import './AppDetail.css';

const modalRoot = document.getElementById('modal-root');

const installers = [
  //require('./backend/installer/mozapps-install.js'),
  //require('./backend/installer/self-debug.js'),
  require('./backend/installer/mozapps-import.js'),
];

export default class AppDetail extends Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
    this.el.className = 'AppDetailContainer';
    this.el.tabIndex = 0;
    this.state = {
      status: '',
      extendedMetadata: null,
      installState: 'not-installed'
    };
  }
  open() {
    this.installedApp.open();
  }
  uninstall() {
    if(this.state.installState === 'not-installed' || !this.installedApp)
      return;
    if(!window.confirm('Uninstall ' + this.props.app.name + '?')) return;

    this.installedApp.uninstall().then(() => {
      this.setState({
        status: 'Uninstalled',
        extendedMetadata: this.state.extendedMetadata,
        installState: 'not-installed'
      });
    });
  }
  install() {
    this.setState({
      status: 'Installing',
      extendedMetadata: this.state.extendedMetadata,
      installState: this.state.installState
    });
    installApp(this.props.app, (stage, progress) => {
      this.setState({
        status: `${stage} (${progress}%)`,
        extendedMetadata: this.state.extendedMetadata,
        installState: this.state.installState
      });
    }).then(app => {
      this.setState({
        status: 'Installed!',
        extendedMetadata: this.state.extendedMetadata,
        installState: 'installed'
      });
      this.installedApp = app;
    }).catch(err => {
      alert('While installing app: ' + err);
      this.setState({
        status: 'Failed',
        extendedMetadata: this.state.extendedMetadata,
        installState: this.state.installState
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
        if(this.props.onClose){
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
    this.el.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.el.focus();
  }
  componentWillUnmount() {
    modalRoot.removeChild(this.el);
    this.el.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  renderExtendedMetadata() {
    if(!this.state.extendedMetadata){
      this.props.app.getExtendedMetadata().then(metadata => {
        this.setState({
          status: this.state.status,
          extendedMetadata: metadata,
          installState: this.state.installState
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
    return createPortal(
      (<>
        <div className='AppDetail' ref={r => this.boxRef = r} >
          <div
            className='AppDetailHeader'
            style={`background-image: url(${this.props.app.findIcon(60)})`}
          >
            <h3>{this.props.app.name}</h3>
            <div className='AppDetailStatus'>{this.state.status}</div>
          </div>
          <div className='AppDetailBody'>
            <div className='p-sec'>
              {this.props.app.description}
            </div>
            <div className='AppDetailMetadata'>
              {this.renderExtendedMetadata()}
            </div>
          </div>
        </div>
        <SoftKey
          leftText=''
          centerText={
            this.state.installState === 'installed' ? 'Open' :
            this.state.installState === 'updatable' ? 'Update' : 'Install'
          }
          rightText={
            this.state.installState === 'not-installed' ? '' : 'Uninstall'
          }
          centerCallback={
            this.state.installState === 'installed' ? this.open.bind(this) :
            this.install.bind(this)
          }
          rightCallback={this.uninstall.bind(this)}
          keyboardReceiver={this.el}
        />
      </>),
      this.el
    );
  }
}
