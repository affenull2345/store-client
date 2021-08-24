import { Component } from 'inferno';
import { findDOMNode } from 'inferno-extras';
import TextInput from './ui/TextInput';
import SoftKey from './ui/SoftKey';
import AppList from './AppList';
import './Search.css';

export default class Search extends Component {
  constructor(props){
    super(props);
    this.state = {
      keywords: [],
      searchActive: true
    };
    this.appList = null;
    this.search = '';
  }
  handleKeydown(e) {
    if(e.key === 'Backspace' && this.props.onClose){
      e.preventDefault();
      this.props.onClose();
    }
  }
  handleKeyup(e) {
    if(e.key === 'Enter' && this.state.searchActive){
      this.updateKeywords();
    }
  }
  activateSearch() {
    var node = findDOMNode(this.inp);
    if(node){
      node.focus();
      this.setState({
        searchActive: true
      });
    }
  }
  componentDidMount() {
    this.activateSearch();
    this.handleKeydown_bound = this.handleKeydown.bind(this);
    this.handleKeyup_bound = this.handleKeyup.bind(this);
    document.addEventListener('keydown', this.handleKeydown_bound);
    document.addEventListener('keyup', this.handleKeyup_bound);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown_bound);
    document.removeEventListener('keyup', this.handleKeyup_bound);
  }
  render() {
    if(!this.appList){
      this.appList = this.state.keywords.length > 0 ?
        <AppList
          store={this.props.store}
          filters={{keywords: this.state.keywords}}
          canNavigateUp={true}
          onNavigateUp={this.activateSearch.bind(this)}
        /> :
        <div className='SearchPlaceholder p-pri'>
          Please enter a search term
        </div>
    }
    return (
      <div className='Search'>
        <TextInput
          onChange={() => this.search = this.inp.props.value}
          onFocus={() => this.setState({searchActive: true})}
          onBlur={() => this.setState({searchActive: false})}
          ref={inp => this.inp = inp}
        />
        {this.appList}
        <SoftKey
          leftText=''
          centerText={this.state.searchActive ? 'Search' : 'Select'}
          rightText=''
        />
      </div>
    );
  }
  updateKeywords() {
    const reg = /[.,; ]+/ig;
    this.appList = null;
    this.setState({
      keywords: this.search.replace(reg, ' ').split(' ').filter(a => a)
    });
  }
}
