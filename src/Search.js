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
    this.search = '';
  }
  handleKeydown(e) {
    if(e.key === 'Backspace' && this.props.onClose){
      e.preventDefault();
      this.props.onClose();
    }
    else if(e.key === 'ArrowUp' || e.key === 'ArrowDown'){
      if(this.state.searchActive){
        document.activeElement.blur();
        this.setState({
          searchActive: false
        });
      }
    }
  }
  handleKeyup(e) {
    if(e.key === 'Enter' && this.state.searchActive){
      this.updateKeywords();
    }
  }
  componentDidMount() {
    findDOMNode(this.inp).focus();
    this.setState({
      searchActive: true
    });
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    document.addEventListener('keyup', this.handleKeyup.bind(this));
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
    document.removeEventListener('keyup', this.handleKeyup.bind(this));
  }
  render() {
    return (
      <div className='Search'>
        <TextInput
          onChange={() => this.search = this.inp.props.value}
          ref={inp => this.inp = inp}
        />
        {
          this.state.keywords.length > 0 ?
          <AppList
            store={this.props.store}
            filters={{keywords: this.state.keywords}}
            onEmpty={() => this.setState({searchActive: true})}
          /> :
          <div className='SearchPlaceholder'>Please enter a search term</div>
        }
        <SoftKey
          leftText={this.state.searchActive ? '' : 'Edit'}
          centerText={this.state.searchActive ? 'Search' : 'Select'}
          rightText=''
          leftCallback={() => {
            findDOMNode(this.inp).focus();
            this.setState({
              searchActive: true
            });
          }}
        />
      </div>
    );
  }
  updateKeywords() {
    const reg = /[.,; ]+/ig;
    this.setState({
      keywords: this.search.replace(reg, ' ').split(' '),
      searchActive: false
    });
  }
}
