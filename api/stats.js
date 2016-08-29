'use strict';

const async = require('async');
const Character = require('../models/character');
const _ = require('underscore');

module.exports = function (app) {

  /**
   * GET /api/stats
   * Returns characters statistics.
   */
  app.get('/api/stats', function(req, res, next) {
    async.parallel([
      function(callback) {
        Character.count({}, function(err, count) {
          callback(err, count);
        });
      },
      function(callback) {
        Character.count({ race: 'Amarr' }, function(err, amarrCount) {
          callback(err, amarrCount);
        });
      },
      function(callback) {
        Character.count({ race: 'Caldari' }, function(err, caldariCount) {
          callback(err, caldariCount);
        });
      },
      function(callback) {
        Character.count({ race: 'Gallente' }, function(err, gallenteCount) {
          callback(err, gallenteCount);
        });
      },
      function(callback) {
        Character.count({ race: 'Minmatar' }, function(err, minmatarCount) {
          callback(err, minmatarCount);
        });
      },
      function(callback) {
        Character.count({ gender: 'Male' }, function(err, maleCount) {
          callback(err, maleCount);
        });
      },
      function(callback) {
        Character.count({ gender: 'Female' }, function(err, femaleCount) {
          callback(err, femaleCount);
        });
      },
      function(callback) {
        Character.aggregate({ $group: { _id: null, total: { $sum: '$wins' } } }, function(err, totalVotes) {
          const total = totalVotes.length ? totalVotes[0].total : 0;
          callback(err, total);
        }
          );
      },
      function(callback) {
        Character
            .find()
            .sort('-wins')
            .limit(100)
            .select('race')
            .exec(function(err, characters) {
              if (err) return next(err);

              const raceCount = _.countBy(characters, function(character) { return character.race; });
              const max = _.max(raceCount, function(race) { return race; });
              const inverted = _.invert(raceCount);
              const topRace = inverted[max];
              const topCount = raceCount[topRace];

              callback(err, { race: topRace, count: topCount });
            });
      },
      function(callback) {
        Character
            .find()
            .sort('-wins')
            .limit(100)
            .select('bloodline')
            .exec(function(err, characters) {
              if (err) return next(err);

              const bloodlineCount = _.countBy(characters, function(character) { return character.bloodline; });
              const max = _.max(bloodlineCount, function(bloodline) { return bloodline; });
              const inverted = _.invert(bloodlineCount);
              const topBloodline = inverted[max];
              const topCount = bloodlineCount[topBloodline];

              callback(err, { bloodline: topBloodline, count: topCount });
            });
      }
    ],
      function(err, results) {
        if (err) return next(err);

        res.send({
          totalCount: results[0],
          amarrCount: results[1],
          caldariCount: results[2],
          gallenteCount: results[3],
          minmatarCount: results[4],
          maleCount: results[5],
          femaleCount: results[6],
          totalVotes: results[7],
          leadingRace: results[8],
          leadingBloodline: results[9]
        });
      });
  });
};