import alt from '../alt';
import { assign } from 'underscore';

class NavbarActions {
  constructor() {
    this.generateActions(
      'updateOnlineUsers',
      'updateAjaxAnimation',
      'updateSearchQuery',
      'getCharacterCountSuccess',
      'getCharacterCountFail',
      'findCharacterSuccess',
      'findCharacterFail'
    );
  }

  findCharacter(payload) {
    $.ajax({
      url: '/api/characters/search',
      data: { name: payload.searchQuery },
    })
      .done((data) => {
        assign(payload, data);
        this.findCharacterSuccess(payload);
      })
      .fail(() => {
        this.findCharacterFail(payload);
      });
    return {};
  }

  getCharacterCount() {
    $.ajax({ url: '/api/characters/count' })
      .done((data) => {
        this.getCharacterCountSuccess(data);
      })
      .fail((jqXhr) => {
        this.getCharacterCountFail(jqXhr);
      });
    return {};
  }
}

export default alt.createActions(NavbarActions);
