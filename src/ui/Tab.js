import { Component } from 'inferno';
import 'KaiUI/src/components/Tab/Tab.scss';

export default class Tab extends Component {
  render() {
    const cls = this.props.isActive ? 'kai-tab-active' : 'kai-tab-inactive';
    return (
      <div className={cls}>
        <div className={cls + '-label'}>{this.props.label}</div>
      </div>
    );
  }
}
