import { Component } from 'inferno';
import 'KaiUI/src/views/TabView/TabView.scss';
import Tabs from './Tabs';
import Tab from './Tab';

export default class TabView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: 0
    };
  }
  handleChangeIndex(idx) {
    this.setState({active: idx});
  }
  renderTabs() {
    return this.props.tabLabels.map((tab, i) => (
      <Tab label={tab} />
    ));
  }
  renderContent() {
    return this.props.children.map((child, i) => (
      i === this.state.active ? child : null
    ));
  }
  render() {
    return (
      <div className='kai-tab-view'>
        <div className='kai-tab-view-tabs'>
          <Tabs onChangeIndex={this.handleChangeIndex.bind(this)}>
            {this.renderTabs()}
          </Tabs>
        </div>
        <div className='kai-tab-view-content'>
          {this.renderContent()}
        </div>
      </div>
    );
  }
}
