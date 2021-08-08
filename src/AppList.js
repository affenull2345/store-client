import { Component } from 'inferno';
import './AppList.css';

export default class AppList extends Component {
  render() {
    var text = 'This app list is filtered by: ' +
      this.props.filters.map(fil => {
        if(fil.type === 'category') return `Category ${fil.ctg.name}`;
        else return fil.type;
      }).join(', ');
    return (
      <div className='AppList'>{text}</div>
    );
  }
}
