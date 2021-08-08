import { Component } from 'inferno';
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
      <Tab isActive={i === this.state.active} label={tab} />
    ));
  }
  renderContent() {
    if(this.state.active < this.props.children.length)
      return this.props.children[this.state.active];
    else return null;
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
