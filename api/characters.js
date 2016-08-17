const async = require('async');
const request = require('request');
const xml2js = require('xml2js');
const Character = require('../models/character');

module.exports = function (app) {

  /**
   * POST /api/characters
   * Adds new character to the database.
   */
  app.post('/api/characters', function(req, res, next) {
    var gender = req.body.gender;
    var characterName = req.body.name;
    var characterIdLookupUrl = 'https://api.eveonline.com/eve/CharacterID.xml.aspx?names=' + characterName;

    var parser = new xml2js.Parser();

    async.waterfall([
      function(callback) {
        request.get(characterIdLookupUrl, function(err, request, xml) {
          if (err) return next(err);
          parser.parseString(xml, function(err, parsedXml) {
            if (err) return next(err);
            try {
              var characterId = parsedXml.eveapi.result[0].rowset[0].row[0].$.characterID;

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
        var characterInfoUrl = 'https://api.eveonline.com/eve/CharacterInfo.xml.aspx?characterID=' + characterId;

        request.get({ url: characterInfoUrl }, function(err, request, xml) {
          if (err) return next(err);
          parser.parseString(xml, function(err, parsedXml) {
            if (err) return res.send(err);
            try {
              var name = parsedXml.eveapi.result[0].characterName[0];
              var race = parsedXml.eveapi.result[0].race[0];
              var bloodline = parsedXml.eveapi.result[0].bloodline[0];

              var character = new Character({
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
}