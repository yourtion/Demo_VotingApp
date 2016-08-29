'use strict';

const async = require('async');
const request = require('request');
const xml2js = require('xml2js');
const Character = require('../models/character');
const _ = require('underscore');

module.exports = function (app) {

  /**
   * GET /api/characters/count
   * Returns the total number of characters.
   */
  app.get('/api/characters/count', function(req, res, next) {
    Character.count({}, function(err, count) {
      if (err) return next(err);
      res.send({ count: count });
    });
  });

  /**
   * GET /api/characters/top
   * Return 100 highest ranked characters. Filter by gender, race and bloodline.
   */
  app.get('/api/characters/top', function(req, res, next) {
    const params = req.query;
    const conditions = {};

    _.each(params, function(value, key) {
      conditions[key] = new RegExp('^' + value + '$', 'i');
    });

    Character
      .find(conditions)
      .sort('-wins') // Sort in descending order (highest wins on top)
      .limit(100)
      .exec(function(err, characters) {
        if (err) return next(err);

        // Sort by winning percentage
        characters.sort(function(a, b) {
          if (a.wins / (a.wins + a.losses) < b.wins / (b.wins + b.losses)) { return 1; }
          if (a.wins / (a.wins + a.losses) > b.wins / (b.wins + b.losses)) { return -1; }
          return 0;
        });

        res.send(characters);
      });
  });

  /**
   * GET /api/characters/search
   * Looks up a character by name. (case-insensitive)
   */
  app.get('/api/characters/search', function(req, res, next) {
    const characterName = new RegExp(req.query.name, 'i');

    Character.findOne({ name: characterName }, function(err, character) {
      if (err) return next(err);

      if (!character) {
        return res.status(404).send({ message: 'Character not found.' });
      }

      res.send(character);
    });
  });

  /**
   * GET /api/characters/:id
   * Returns detailed character information.
   */
  app.get('/api/characters/:id', function(req, res, next) {
    const id = req.params.id;

    Character.findOne({ characterId: id }, function(err, character) {
      if (err) return next(err);

      if (!character) {
        return res.status(404).send({ message: 'Character not found.' });
      }

      res.send(character);
    });
  });

  /**
   * GET /api/characters/shame
   * Returns 100 lowest ranked characters.
   */
  app.get('/api/characters/shame', function(req, res, next) {
    Character
      .find()
      .sort('-losses')
      .limit(100)
      .exec(function(err, characters) {
        if (err) return next(err);
        res.send(characters);
      });
  });

  /**
   * POST /api/characters
   * Adds new character to the database.
   */
  app.post('/api/characters', function(req, res, next) {
    const gender = req.body.gender;
    const characterName = req.body.name;
    const characterIdLookupUrl = 'https://api.eveonline.com/eve/CharacterID.xml.aspx?names=' + characterName;

    const parser = new xml2js.Parser();

    async.waterfall([
      function(callback) {
        request.get(characterIdLookupUrl, function(err, request, xml) {
          if (err) return next(err);
          parser.parseString(xml, function(err, parsedXml) {
            if (err) return next(err);
            try {
              const characterId = parsedXml.eveapi.result[0].rowset[0].row[0].$.characterID;

              Character.findOne({ characterId: characterId }, function(err, character) {
                if (err) return next(err);

                if (character) {
                  return res.status(409).send({ message: character.name + ' is already in the database.' });
                }

                callback(err, characterId);
              });
            } catch (e) {
              return res.status(400).send({ message: 'XML Parse Error' });
            }
          });
        });
      },
      function(characterId) {
        const characterInfoUrl = 'https://api.eveonline.com/eve/CharacterInfo.xml.aspx?characterID=' + characterId;

        request.get({ url: characterInfoUrl }, function(err, request, xml) {
          if (err) return next(err);
          parser.parseString(xml, function(err, parsedXml) {
            if (err) return res.send(err);
            try {
              const name = parsedXml.eveapi.result[0].characterName[0];
              const race = parsedXml.eveapi.result[0].race[0];
              const bloodline = parsedXml.eveapi.result[0].bloodline[0];

              const character = new Character({
                characterId: characterId,
                name: name,
                race: race,
                bloodline: bloodline,
                gender: gender,
                random: [Math.random(), 0]
              });

              character.save(function(err) {
                if (err) return next(err);
                res.send({ message: characterName + ' has been added successfully!' });
              });
            } catch (e) {
              res.status(404).send({ message: characterName + ' is not a registered citizen of New Eden.' });
            }
          });
        });
      }
    ]);
  });

  /**
   * GET /api/characters
   * Returns 2 random characters of the same gender that have not been voted yet.
   */
  app.get('/api/characters', function(req, res, next) {
    const choices = ['Female', 'Male'];
    const randomGender = _.sample(choices);

    Character.find({ random: { $near: [Math.random(), 0] } })
      .where('voted', false)
      .where('gender', randomGender)
      .limit(2)
      .exec(function(err, characters) {
        if (err) return next(err);

        if (characters.length === 2) {
          return res.send(characters);
        }

        const oppositeGender = _.first(_.without(choices, randomGender));

        Character
          .find({ random: { $near: [Math.random(), 0] } })
          .where('voted', false)
          .where('gender', oppositeGender)
          .limit(2)
          .exec(function(err, characters) {
            if (err) return next(err);

            if (characters.length === 2) {
              return res.send(characters);
            }

            Character.update({}, { $set: { voted: false } }, { multi: true }, function(err) {
              if (err) return next(err);
              res.send([]);
            });
          });
      });
  });

  /**
   * PUT /api/characters
   * Update winning and losing count for both characters.
   */
  app.put('/api/characters', function(req, res, next) {
    const winner = req.body.winner;
    const loser = req.body.loser;

    if (!winner || !loser) {
      return res.status(400).send({ message: 'Voting requires two characters.' });
    }

    if (winner === loser) {
      return res.status(400).send({ message: 'Cannot vote for and against the same character.' });
    }

    async.parallel([
      function(callback) {
        Character.findOne({ characterId: winner }, function(err, winner) {
          callback(err, winner);
        });
      },
      function(callback) {
        Character.findOne({ characterId: loser }, function(err, loser) {
          callback(err, loser);
        });
      }
    ],
      function(err, results) {
        if (err) return next(err);

        const winner = results[0];
        const loser = results[1];

        if (!winner || !loser) {
          return res.status(404).send({ message: 'One of the characters no longer exists.' });
        }

        if (winner.voted || loser.voted) {
          return res.status(200).end();
        }

        async.parallel([
          function(callback) {
            winner.wins++;
            winner.voted = true;
            winner.random = [Math.random(), 0];
            winner.save(function(err) {
              callback(err);
            });
          },
          function(callback) {
            loser.losses++;
            loser.voted = true;
            loser.random = [Math.random(), 0];
            loser.save(function(err) {
              callback(err);
            });
          }
        ], function(err) {
          if (err) return next(err);
          res.status(200).end();
        });
      });
  });

};