import { Component } from 'inferno';
import 'KaiUI/src/components/Tabs/Tabs.scss';

export default class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0
    }
  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }
  render() {
    return (
      <div className='kai-tabs'>{this.props.children}</div>
    );
  }
  handleKeyDown(e){
    var idx = this.state.index;
    if(e.key === 'ArrowLeft'){
      this.setTabActive(idx, false);
      idx--;
      if(idx < 0) idx = this.props.children.length - 1;
      this.setTabActive(idx, true);
      this.setState({index: idx});
      if(this.props.onChangeIndex) this.props.onChangeIndex(idx);
    }
    else if(e.key === 'ArrowRight'){
      this.setTabActive(idx, false);
      idx++;
      if(idx >= this.props.children.length) idx = 0;
      this.setTabActive(idx, true);
      this.setState({index: idx});
      if(this.props.onChangeIndex) this.props.onChangeIndex(idx);
    }
  }
  setTabActive(idx, isActive) {
    if(this.props.children.length > idx){
      this.props.children[idx].props.isActive = isActive;
    }
  }
}
