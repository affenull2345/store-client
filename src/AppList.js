import { Component } from 'inferno';
import { findDOMNode } from 'inferno-extras';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';
import AppButton from './AppButton';
import './AppList.css';

function focusIntoView(ref){
  var node = findDOMNode(ref);
  node.focus();
  scrollIntoView(node, {
    behavior: 'smooth',
    block: 'center',
    inline: 'start',
    duration: 600
  });
}

export default class AppList extends Component {
  constructor(props) {
    super(props);
    this.apps = [];
    this.appRefs = [];
    this.state = {
      loading: false,
      loadedPages: 0,
      isLastPage: false,
      selected: 0
    };
    this.scrolling = Promise.resolve();
  }
  handleKeydown(e) {
    var wrap = false;
    var idx = this.state.selected;
    if(e.key === 'ArrowUp'){
      e.preventDefault();
      idx--;
      if(idx >= 0){
        if(this.appRefs[idx]) focusIntoView(this.appRefs[idx]);
        this.setState({
          loading: this.state.loading,
          selected: idx,
          loadedPages: this.state.loadedPages,
          isLastPage: this.state.isLastPage
        });
      }
    }
    else if(e.key === 'ArrowDown'){
      e.preventDefault();
      idx++;
      if(!this.state.loading){
        if(idx < this.apps.length){
          if(this.appRefs[idx]) focusIntoView(this.appRefs[idx]);
          this.setState({
            loading: this.state.loading,
            selected: idx,
            loadedPages: this.state.loadedPages,
            isLastPage: this.state.isLastPage
          });
        }
        if(idx >= (this.apps.length - 2) && !this.state.isLastPage){
          this.setState({
            loading: true,
            selected: idx,
            loadedPages: this.state.loadedPages,
            isLastPage: false
          });
          this.loadNextPage();
        }
      }
    }
  }
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown.bind(this));
  }
  loadNextPage(after) {
    const nextPage = this.state.loadedPages + 1;
    return this.props.store.getApps(this.props.filters, (nextPage-1)*10, 10)
    .then(({apps, isLastPage}) => {
      console.log('[AppList] Is last page:', isLastPage);
      this.apps = this.apps.concat(apps);
      this.setState({
        loading: false,
        loadedPages: nextPage,
        isLastPage,
        selected: this.state.selected
      });
      if(this.appRefs[this.state.selected])
        focusIntoView(this.appRefs[this.state.selected]);
    }).catch(e => {
      console.error('Failed to load next page', e);
      setTimeout(() => {
        this.loadNextPage();
      }, 3000);
    });
  }
  renderApps() {
    if(this.state.loadedPages === 0){
      if(!this.loading){
        this.loading = true;
        this.loadNextPage();
      }
      return 'Loading...';
    }
    return this.apps.map((app, i) => {
      return (
        <AppButton
          app={app}
          ref={node => this.appRefs[i] = node}
        />
      );
    });
  }
  render() {
    return (
      <div className='AppList'>{this.renderApps()}</div>
    );
  }
}
