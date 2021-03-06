'use strict';

import alt from '../alt';

class HomeActions {
  constructor() {
    this.generateActions(
      'getTwoCharactersSuccess',
      'getTwoCharactersFail',
      'voteFail'
    );
  }

  getTwoCharacters() {
    $.ajax({ url: '/api/characters' })
      .done(data => {
        this.getTwoCharactersSuccess(data);
      })
      .fail(jqXhr => {
        this.getTwoCharactersFail(jqXhr.responseJSON.message);
      });
    return {};
  }

  vote(winner, loser) {
    $.ajax({
      type: 'PUT',
      url: '/api/characters',
      data: { winner, loser },
    })
      .done(() => {
        this.getTwoCharacters();
      })
      .fail((jqXhr) => {
        this.voteFail(jqXhr.responseJSON.message);
      });
    return {};
  }
}

export default alt.createActions(HomeActions);
