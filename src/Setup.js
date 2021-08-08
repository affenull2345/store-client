import { Component } from 'inferno';
import TextInput from './ui/TextInput';
import './Setup.css';

class Setup extends Component {
  constructor(props) {
    super(props);
    this.cb = props.onSetup;
  }
  render() {
    return (
      <div className='Setup'>
        <TextInput label='Login' />
      </div>
    );
  }
  handleSetupComplete() {
    this.cb();
  }
}

export default Setup;
