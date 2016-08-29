import alt from '../alt';

class StatsActions {
  constructor() {
    this.generateActions(
      'getStatsSuccess',
      'getStatsFail'
    );
  }

  getStats() {
    $.ajax({ url: '/api/stats' })
      .done((data) => {
        this.getStatsSuccess(data);
      })
      .fail((jqXhr) => {
        this.getStatsFail(jqXhr);
      });
    return {};
  }
}

export default alt.createActions(StatsActions);
