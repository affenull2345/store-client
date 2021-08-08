import { Component } from 'inferno';
import TabView from './ui/TabView';
import AppList from './AppList';
import BHackersV2Store from './backend/appstore/bhackers-v2';
import './Store.css';

export default class Store extends Component {
  constructor(props) {
    super(props);

    this.stores = [new BHackersV2Store()];
    this.state = {
      store: 0
    };
  }
  render() {
    const tabs = this.stores[this.state.store].categories.map(ctg => (
      <AppList filters={[{type: 'category', ctg}]} />
    ));
    const labels = this.stores[this.state.store].categories.map(
      ctg => ctg.name);
    return (
      <div className='Store'>
        <TabView tabLabels={labels}>{tabs}</TabView>
      </div>
    );
  }
}
