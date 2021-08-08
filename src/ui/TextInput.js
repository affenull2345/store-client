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
    this.setState({focused: true});
    this.inp.focus();
  }
  handleBlur() {
    this.setState({focused: false});
  }
}
