import alt from '../alt';

class CharacterActions {
  constructor() {
    this.generateActions(
      'reportSuccess',
      'reportFail',
      'getCharacterSuccess',
      'getCharacterFail'
    );
  }

  getCharacter(characterId) {
    $.ajax({ url: '/api/characters/' + characterId })
      .done((data) => {
        this.getCharacterSuccess(data);
      })
      .fail((jqXhr) => {
        this.getCharacterFail(jqXhr);
      });
    return {};
  }

  report(characterId) {
    $.ajax({
      type: 'POST',
      url: '/api/report',
      data: { characterId },
    })
      .done(() => {
        this.reportSuccess();
      })
      .fail((jqXhr) => {
        this.reportFail(jqXhr);
      });
    return {};
  }
}

export default alt.createActions(CharacterActions);
