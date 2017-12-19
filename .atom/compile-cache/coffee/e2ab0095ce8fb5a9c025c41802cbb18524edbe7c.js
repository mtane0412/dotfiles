
/*
Requires http://hhvm.com/
 */

(function() {
  "use strict";
  var Beautifier, HhFormat,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = HhFormat = (function(_super) {
    __extends(HhFormat, _super);

    function HhFormat() {
      return HhFormat.__super__.constructor.apply(this, arguments);
    }

    HhFormat.prototype.name = "hh_format";

    HhFormat.prototype.link = "http://hhvm.com/";

    HhFormat.prototype.options = {
      PHP: false
    };

    HhFormat.prototype.beautify = function(text, language, options) {
      return this.run("hh_format", [this.tempFile("input", text)], {
        help: {
          link: "http://hhvm.com/"
        }
      }).then(function(output) {
        if (output.trim()) {
          return output;
        } else {
          return this.Promise.resolve(new Error("hh_format returned an empty output."));
        }
      });
    };

    return HhFormat;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvaGhfZm9ybWF0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsRUFJQSxZQUpBLENBQUE7QUFBQSxNQUFBLG9CQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FMYixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHVCQUFBLElBQUEsR0FBTSxXQUFOLENBQUE7O0FBQUEsdUJBQ0EsSUFBQSxHQUFNLGtCQUROLENBQUE7O0FBQUEsdUJBR0EsT0FBQSxHQUNFO0FBQUEsTUFBQSxHQUFBLEVBQUssS0FBTDtLQUpGLENBQUE7O0FBQUEsdUJBTUEsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssV0FBTCxFQUFrQixDQUNoQixJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FEZ0IsQ0FBbEIsRUFHQTtBQUFBLFFBQ0UsSUFBQSxFQUFNO0FBQUEsVUFDSixJQUFBLEVBQU0sa0JBREY7U0FEUjtPQUhBLENBT0UsQ0FBQyxJQVBILENBT1EsU0FBQyxNQUFELEdBQUE7QUFHTixRQUFBLElBQUcsTUFBTSxDQUFDLElBQVAsQ0FBQSxDQUFIO2lCQUNFLE9BREY7U0FBQSxNQUFBO2lCQUdFLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFxQixJQUFBLEtBQUEsQ0FBTSxxQ0FBTixDQUFyQixFQUhGO1NBSE07TUFBQSxDQVBSLEVBRFE7SUFBQSxDQU5WLENBQUE7O29CQUFBOztLQURzQyxXQVB4QyxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tane/.atom/packages/atom-beautify/src/beautifiers/hh_format.coffee
