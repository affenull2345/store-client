import { Component } from 'inferno';
import AppDetail from './AppDetail';
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
          <AppDetail
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
