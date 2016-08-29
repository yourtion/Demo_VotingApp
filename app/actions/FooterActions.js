import alt from '../alt';

class FooterActions {
  constructor() {
    this.generateActions(
      'getTopCharactersSuccess',
      'getTopCharactersFail'
    );
  }

  getTopCharacters() {
    $.ajax({ url: '/api/characters/top' })
      .done((data) => {
        this.getTopCharactersSuccess(data);
      })
      .fail((jqXhr) => {
        this.getTopCharactersFail(jqXhr);
      });
    return {};
  }
}

export default alt.createActions(FooterActions);
