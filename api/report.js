'use strict';

const Character = require('../models/character');

module.exports = function (app) {
  /**
   * POST /api/report
   * Reports a character. Character is removed after 4 reports.
   */
  app.post('/api/report', function (req, res, next) {
    const characterId = req.body.characterId;

    Character.findOne({ characterId }, function (err, character) {
      if (err) return next(err);

      if (!character) {
        return res.status(404).send({ message: 'Character not found.' });
      }

      character.reports += 1;

      if (character.reports > 4) {
        character.remove();
        return res.send({ message: character.name + ' has been deleted.' });
      }

      character.save(function (err) {
        if (err) return next(err);
        res.send({ message: character.name + ' has been reported.' });
      });
    });
  });
};
