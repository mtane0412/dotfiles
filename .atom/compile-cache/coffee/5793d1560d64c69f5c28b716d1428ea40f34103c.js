
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Languages, extend, _;

  _ = require('lodash');

  extend = null;

  module.exports = Languages = (function() {
    Languages.prototype.languageNames = ["apex", "arduino", "bash", "c-sharp", "c", "clojure", "coffeescript", "coldfusion", "cpp", "crystal", "css", "csv", "d", "ejs", "elm", "erb", "erlang", "gherkin", "glsl", "go", "fortran", "handlebars", "haskell", "html", "jade", "java", "javascript", "json", "jsx", "latex", "less", "lua", "markdown", 'marko', "mustache", "nunjucks", "objective-c", "ocaml", "pawn", "perl", "php", "puppet", "python", "r", "riotjs", "ruby", "rust", "sass", "scss", "spacebars", "sql", "svg", "swig", "tss", "twig", "typescript", "ux_markup", "vala", "vue", "visualforce", "xml", "xtemplate"];


    /*
    Languages
     */

    Languages.prototype.languages = null;


    /*
    Namespaces
     */

    Languages.prototype.namespaces = null;


    /*
    Constructor
     */

    function Languages() {
      this.languages = _.map(this.languageNames, function(name) {
        return require("./" + name);
      });
      this.namespaces = _.map(this.languages, function(language) {
        return language.namespace;
      });
    }


    /*
    Get language for grammar and extension
     */

    Languages.prototype.getLanguages = function(_arg) {
      var extension, grammar, name, namespace;
      name = _arg.name, namespace = _arg.namespace, grammar = _arg.grammar, extension = _arg.extension;
      return _.union(_.filter(this.languages, function(language) {
        return _.isEqual(language.name, name);
      }), _.filter(this.languages, function(language) {
        return _.isEqual(language.namespace, namespace);
      }), _.filter(this.languages, function(language) {
        return _.includes(language.grammars, grammar);
      }), _.filter(this.languages, function(language) {
        return _.includes(language.extensions, extension);
      }));
    };

    return Languages;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL2luZGV4LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFHQSxZQUhBLENBQUE7QUFBQSxNQUFBLG9CQUFBOztBQUFBLEVBS0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBTEosQ0FBQTs7QUFBQSxFQU1BLE1BQUEsR0FBUyxJQU5ULENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUlyQix3QkFBQSxhQUFBLEdBQWUsQ0FDYixNQURhLEVBRWIsU0FGYSxFQUdiLE1BSGEsRUFJYixTQUphLEVBS2IsR0FMYSxFQU1iLFNBTmEsRUFPYixjQVBhLEVBUWIsWUFSYSxFQVNiLEtBVGEsRUFVYixTQVZhLEVBV2IsS0FYYSxFQVliLEtBWmEsRUFhYixHQWJhLEVBY2IsS0FkYSxFQWViLEtBZmEsRUFnQmIsS0FoQmEsRUFpQmIsUUFqQmEsRUFrQmIsU0FsQmEsRUFtQmIsTUFuQmEsRUFvQmIsSUFwQmEsRUFxQmIsU0FyQmEsRUFzQmIsWUF0QmEsRUF1QmIsU0F2QmEsRUF3QmIsTUF4QmEsRUF5QmIsTUF6QmEsRUEwQmIsTUExQmEsRUEyQmIsWUEzQmEsRUE0QmIsTUE1QmEsRUE2QmIsS0E3QmEsRUE4QmIsT0E5QmEsRUErQmIsTUEvQmEsRUFnQ2IsS0FoQ2EsRUFpQ2IsVUFqQ2EsRUFrQ2IsT0FsQ2EsRUFtQ2IsVUFuQ2EsRUFvQ2IsVUFwQ2EsRUFxQ2IsYUFyQ2EsRUFzQ2IsT0F0Q2EsRUF1Q2IsTUF2Q2EsRUF3Q2IsTUF4Q2EsRUF5Q2IsS0F6Q2EsRUEwQ2IsUUExQ2EsRUEyQ2IsUUEzQ2EsRUE0Q2IsR0E1Q2EsRUE2Q2IsUUE3Q2EsRUE4Q2IsTUE5Q2EsRUErQ2IsTUEvQ2EsRUFnRGIsTUFoRGEsRUFpRGIsTUFqRGEsRUFrRGIsV0FsRGEsRUFtRGIsS0FuRGEsRUFvRGIsS0FwRGEsRUFxRGIsTUFyRGEsRUFzRGIsS0F0RGEsRUF1RGIsTUF2RGEsRUF3RGIsWUF4RGEsRUF5RGIsV0F6RGEsRUEwRGIsTUExRGEsRUEyRGIsS0EzRGEsRUE0RGIsYUE1RGEsRUE2RGIsS0E3RGEsRUE4RGIsV0E5RGEsQ0FBZixDQUFBOztBQWlFQTtBQUFBOztPQWpFQTs7QUFBQSx3QkFvRUEsU0FBQSxHQUFXLElBcEVYLENBQUE7O0FBc0VBO0FBQUE7O09BdEVBOztBQUFBLHdCQXlFQSxVQUFBLEdBQVksSUF6RVosQ0FBQTs7QUEyRUE7QUFBQTs7T0EzRUE7O0FBOEVhLElBQUEsbUJBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxhQUFQLEVBQXNCLFNBQUMsSUFBRCxHQUFBO2VBQ2pDLE9BQUEsQ0FBUyxJQUFBLEdBQUksSUFBYixFQURpQztNQUFBLENBQXRCLENBQWIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxTQUFQLEVBQWtCLFNBQUMsUUFBRCxHQUFBO2VBQWMsUUFBUSxDQUFDLFVBQXZCO01BQUEsQ0FBbEIsQ0FIZCxDQURXO0lBQUEsQ0E5RWI7O0FBb0ZBO0FBQUE7O09BcEZBOztBQUFBLHdCQXVGQSxZQUFBLEdBQWMsU0FBQyxJQUFELEdBQUE7QUFFWixVQUFBLG1DQUFBO0FBQUEsTUFGYyxZQUFBLE1BQU0saUJBQUEsV0FBVyxlQUFBLFNBQVMsaUJBQUEsU0FFeEMsQ0FBQTthQUFBLENBQUMsQ0FBQyxLQUFGLENBQ0UsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxPQUFGLENBQVUsUUFBUSxDQUFDLElBQW5CLEVBQXlCLElBQXpCLEVBQWQ7TUFBQSxDQUFyQixDQURGLEVBRUUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxPQUFGLENBQVUsUUFBUSxDQUFDLFNBQW5CLEVBQThCLFNBQTlCLEVBQWQ7TUFBQSxDQUFyQixDQUZGLEVBR0UsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsUUFBUSxDQUFDLFFBQXBCLEVBQThCLE9BQTlCLEVBQWQ7TUFBQSxDQUFyQixDQUhGLEVBSUUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQsR0FBQTtlQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsUUFBUSxDQUFDLFVBQXBCLEVBQWdDLFNBQWhDLEVBQWQ7TUFBQSxDQUFyQixDQUpGLEVBRlk7SUFBQSxDQXZGZCxDQUFBOztxQkFBQTs7TUFiRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tane/.atom/packages/atom-beautify/src/languages/index.coffee
