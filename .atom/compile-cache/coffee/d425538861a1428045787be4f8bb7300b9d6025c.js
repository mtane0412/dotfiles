(function() {
  var Languages, jsonStringify, langs, languages, _;

  jsonStringify = require('json-stable-stringify');

  Languages = require('../src/languages');

  languages = new Languages().languages;

  _ = require('lodash');

  langs = _.chain(languages).map(function(lang) {
    return {
      name: lang.name,
      namespace: lang.namespace,
      extensions: lang.extensions || [],
      atomGrammars: lang.grammars || [],
      sublimeSyntaxes: []
    };
  }).value();

  console.log(jsonStringify(langs, {
    space: 2
  }));

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zY3JpcHQvbGlzdC1vcHRpb25zLWFuZC1sYW5ndWFnZXMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZDQUFBOztBQUFBLEVBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsdUJBQVIsQ0FBaEIsQ0FBQTs7QUFBQSxFQUNBLFNBQUEsR0FBWSxPQUFBLENBQVEsa0JBQVIsQ0FEWixDQUFBOztBQUFBLEVBRUEsU0FBQSxHQUFZLEdBQUEsQ0FBQSxTQUFJLENBQUEsQ0FBVyxDQUFDLFNBRjVCLENBQUE7O0FBQUEsRUFJQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVIsQ0FKSixDQUFBOztBQUFBLEVBaUJBLEtBQUEsR0FBUSxDQUFDLENBQUMsS0FBRixDQUFRLFNBQVIsQ0FDRSxDQUFDLEdBREgsQ0FDTyxTQUFDLElBQUQsR0FBQTtBQUNILFdBQU87QUFBQSxNQUNMLElBQUEsRUFBTSxJQUFJLENBQUMsSUFETjtBQUFBLE1BRUwsU0FBQSxFQUFXLElBQUksQ0FBQyxTQUZYO0FBQUEsTUFHTCxVQUFBLEVBQVksSUFBSSxDQUFDLFVBQUwsSUFBbUIsRUFIMUI7QUFBQSxNQUlMLFlBQUEsRUFBYyxJQUFJLENBQUMsUUFBTCxJQUFpQixFQUoxQjtBQUFBLE1BS0wsZUFBQSxFQUFpQixFQUxaO0tBQVAsQ0FERztFQUFBLENBRFAsQ0FVRSxDQUFDLEtBVkgsQ0FBQSxDQWpCUixDQUFBOztBQUFBLEVBNEJBLE9BQU8sQ0FBQyxHQUFSLENBQVksYUFBQSxDQUFjLEtBQWQsRUFBcUI7QUFBQSxJQUMvQixLQUFBLEVBQU8sQ0FEd0I7R0FBckIsQ0FBWixDQTVCQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tane/.atom/packages/atom-beautify/script/list-options-and-languages.coffee
