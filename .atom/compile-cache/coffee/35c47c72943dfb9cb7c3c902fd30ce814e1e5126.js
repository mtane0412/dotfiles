(function() {
  "use strict";
  var Beautifier, Remark,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = Remark = (function(_super) {
    __extends(Remark, _super);

    function Remark() {
      return Remark.__super__.constructor.apply(this, arguments);
    }

    Remark.prototype.name = "Remark";

    Remark.prototype.link = "https://github.com/wooorm/remark";

    Remark.prototype.options = {
      _: {
        gfm: true,
        yaml: true,
        commonmark: true,
        footnotes: true,
        pedantic: true,
        breaks: true,
        entities: true,
        setext: true,
        closeAtx: true,
        looseTable: true,
        spacedTable: true,
        fence: true,
        fences: true,
        bullet: true,
        listItemIndent: true,
        incrementListMarker: true,
        rule: true,
        ruleRepetition: true,
        ruleSpaces: true,
        strong: true,
        emphasis: true,
        position: true
      },
      Markdown: true
    };

    Remark.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var cleanMarkdown, err, remark;
        try {
          remark = require('remark');
          cleanMarkdown = remark().process(text, options).toString();
          return resolve(cleanMarkdown);
        } catch (_error) {
          err = _error;
          this.error("Remark error: " + err);
          return reject(err);
        }
      });
    };

    return Remark;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcmVtYXJrLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxZQUFBLENBQUE7QUFBQSxNQUFBLGtCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FEYixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsNkJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHFCQUFBLElBQUEsR0FBTSxRQUFOLENBQUE7O0FBQUEscUJBQ0EsSUFBQSxHQUFNLGtDQUROLENBQUE7O0FBQUEscUJBRUEsT0FBQSxHQUFTO0FBQUEsTUFDUCxDQUFBLEVBQUc7QUFBQSxRQUNELEdBQUEsRUFBSyxJQURKO0FBQUEsUUFFRCxJQUFBLEVBQU0sSUFGTDtBQUFBLFFBR0QsVUFBQSxFQUFZLElBSFg7QUFBQSxRQUlELFNBQUEsRUFBVyxJQUpWO0FBQUEsUUFLRCxRQUFBLEVBQVUsSUFMVDtBQUFBLFFBTUQsTUFBQSxFQUFRLElBTlA7QUFBQSxRQU9ELFFBQUEsRUFBVSxJQVBUO0FBQUEsUUFRRCxNQUFBLEVBQVEsSUFSUDtBQUFBLFFBU0QsUUFBQSxFQUFVLElBVFQ7QUFBQSxRQVVELFVBQUEsRUFBWSxJQVZYO0FBQUEsUUFXRCxXQUFBLEVBQWEsSUFYWjtBQUFBLFFBWUQsS0FBQSxFQUFPLElBWk47QUFBQSxRQWFELE1BQUEsRUFBUSxJQWJQO0FBQUEsUUFjRCxNQUFBLEVBQVEsSUFkUDtBQUFBLFFBZUQsY0FBQSxFQUFnQixJQWZmO0FBQUEsUUFnQkQsbUJBQUEsRUFBcUIsSUFoQnBCO0FBQUEsUUFpQkQsSUFBQSxFQUFNLElBakJMO0FBQUEsUUFrQkQsY0FBQSxFQUFnQixJQWxCZjtBQUFBLFFBbUJELFVBQUEsRUFBWSxJQW5CWDtBQUFBLFFBb0JELE1BQUEsRUFBUSxJQXBCUDtBQUFBLFFBcUJELFFBQUEsRUFBVSxJQXJCVDtBQUFBLFFBc0JELFFBQUEsRUFBVSxJQXRCVDtPQURJO0FBQUEsTUF5QlAsUUFBQSxFQUFVLElBekJIO0tBRlQsQ0FBQTs7QUFBQSxxQkE4QkEsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQUNSLGFBQVcsSUFBQSxJQUFDLENBQUEsT0FBRCxDQUFTLFNBQUMsT0FBRCxFQUFVLE1BQVYsR0FBQTtBQUNsQixZQUFBLDBCQUFBO0FBQUE7QUFDRSxVQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUixDQUFULENBQUE7QUFBQSxVQUNBLGFBQUEsR0FBZ0IsTUFBQSxDQUFBLENBQVEsQ0FBQyxPQUFULENBQWlCLElBQWpCLEVBQXVCLE9BQXZCLENBQStCLENBQUMsUUFBaEMsQ0FBQSxDQURoQixDQUFBO2lCQUVBLE9BQUEsQ0FBUSxhQUFSLEVBSEY7U0FBQSxjQUFBO0FBS0UsVUFESSxZQUNKLENBQUE7QUFBQSxVQUFBLElBQUMsQ0FBQSxLQUFELENBQVEsZ0JBQUEsR0FBZ0IsR0FBeEIsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBTkY7U0FEa0I7TUFBQSxDQUFULENBQVgsQ0FEUTtJQUFBLENBOUJWLENBQUE7O2tCQUFBOztLQURvQyxXQUh0QyxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tane/.atom/packages/atom-beautify/src/beautifiers/remark.coffee
