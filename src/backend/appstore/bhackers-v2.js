import AppStore from '../AppStore'

export default class BHackersV2Store extends AppStore {
  get categories() {
    return [
      {
        name: 'Utilities'
      },
      {
        name: 'Communication'
      }
    ];
  }
}
