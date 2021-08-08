import { Component } from 'inferno';
import Store from './Store'
import Setup from './Setup'
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      setupDone: true
    };
  }
  render() {
    if(!this.state.setupDone){
      return (
        <div className='App'>
          <Setup onSetup={() => this.setState({setupDone: true})} />
        </div>
      );
    }
    else {
      return (
        <div className='App'>
          <Store />
        </div>
      );
    }
  }
}

export default App;
