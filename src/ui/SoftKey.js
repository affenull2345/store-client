import { Component } from 'inferno';
import 'KaiUI/src/components/SoftKey/SoftKey.scss';

// Most of this is directly copied from KaiUI, credits to Adrian Machado

class SoftKeyButton extends Component {
  handleClick(e) {
    e.preventDefault();
    if(this.props.handleClick) this.props.handleClick();
  }
  // We want to avoid losing focus on the parent element
  handleFocus(e){
    e.preventDefault();
    if(e.relatedTarget){
      // Revert focus back to previous blurrint element
      e.relatedTarget.focus();
    }
    else {
      // No previous focus target, blur instead
      e.currentTarget.blur();
    }
  }
  render() {
    var renderedIcon = null;
    if(this.props.icon){
      if(this.props.icon.toString().indexOf('kai-') === -1){
        renderedIcon = <img src={this.props.icon} width={20} height={20} />;
      }
      else {
        renderedIcon = <span className={this.props.icon} />;
      }
    }
    return (
      <button
        id={this.props.id}
        className='kai-softkey-btn'
        onClick={this.handleClick.bind(this)}
        onFocus={this.handleFocus.bind(this)}
        data-icon={renderedIcon ? 'true' : null}
      >
        {renderedIcon}{this.props.text}
      </button>
    );
  }
}

export default class SoftKey extends Component {
  constructor(props) {
    super(props);
    this.keyboardReceiver = props.keyboardReceiver || document;
  }
  handleKeyDown(e) {
    switch(e.key){
      case 'SoftLeft':
        if(this.props.leftCallback) this.props.leftCallback();
        break;
      case 'SoftRight':
        if(this.props.rightCallback) this.props.rightCallback();
        break;
      case 'Enter':
        if(this.props.centerCallback) this.props.centerCallback();
        break;
      default:
        break;
    }
  }
  componentDidMount() {
    this.keyboardReceiver.addEventListener('keydown',
      this.handleKeyDown.bind(this));
  }
  componentWillUnmount() {
    this.keyboardReceiver.removeEventListener('keydown',
      this.handleKeyDown.bind(this));
  }
  render() {
    return (
      <div className='kai-softkey visible'>
        <SoftKeyButton
          id='sk-left'
          pos='left'
          text={this.props.leftText}
          icon={this.props.leftIcon}
          handleClick={this.props.leftCallback} />
        <SoftKeyButton
          id='sk-center'
          pos='center'
          text={this.props.centerText}
          icon={this.props.centerIcon}
          handleClick={this.props.centerCallback} />
        <SoftKeyButton
          id='sk-right'
          pos='right'
          text={this.props.rightText}
          icon={this.props.rightIcon}
          handleClick={this.props.rightCallback} />
      </div>
    );
  }
}
