(function() {
  "use strict";
  var BashBeautify, Beautifier,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = BashBeautify = (function(_super) {
    __extends(BashBeautify, _super);

    function BashBeautify() {
      return BashBeautify.__super__.constructor.apply(this, arguments);
    }

    BashBeautify.prototype.name = "beautysh";

    BashBeautify.prototype.link = "https://github.com/bemeurer/beautysh";

    BashBeautify.prototype.options = {
      Bash: {
        indent_size: true
      }
    };

    BashBeautify.prototype.beautify = function(text, language, options) {
      var file;
      file = this.tempFile("input", text);
      return this.run('beautysh', ['-i', options.indent_size, '-f', file], {
        help: {
          link: "https://github.com/bemeurer/beautysh"
        }
      }).then((function(_this) {
        return function() {
          return _this.readFile(file);
        };
      })(this));
    };

    return BashBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvYmVhdXR5c2guY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFlBQUEsQ0FBQTtBQUFBLE1BQUEsd0JBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUixDQURiLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUNyQixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsMkJBQUEsSUFBQSxHQUFNLFVBQU4sQ0FBQTs7QUFBQSwyQkFDQSxJQUFBLEdBQU0sc0NBRE4sQ0FBQTs7QUFBQSwyQkFFQSxPQUFBLEdBQVM7QUFBQSxNQUNQLElBQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLElBQWI7T0FGSztLQUZULENBQUE7O0FBQUEsMkJBT0EsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsR0FBQTtBQUNSLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQUFQLENBQUE7YUFDQSxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsRUFBaUIsQ0FBRSxJQUFGLEVBQVEsT0FBTyxDQUFDLFdBQWhCLEVBQTZCLElBQTdCLEVBQW1DLElBQW5DLENBQWpCLEVBQTREO0FBQUEsUUFBQSxJQUFBLEVBQU07QUFBQSxVQUFFLElBQUEsRUFBTSxzQ0FBUjtTQUFOO09BQTVELENBQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsUUFBRCxDQUFVLElBQVYsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRE4sRUFGUTtJQUFBLENBUFYsQ0FBQTs7d0JBQUE7O0tBRDBDLFdBSDVDLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tane/.atom/packages/atom-beautify/src/beautifiers/beautysh.coffee
