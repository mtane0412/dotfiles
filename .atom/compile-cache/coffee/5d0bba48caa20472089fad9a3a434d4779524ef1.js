(function() {
  var FRONT_MATTER_REGEX, FrontMatter, yaml;

  yaml = require("js-yaml");

  FRONT_MATTER_REGEX = /^(?:---\s*$)?([^:]+:[\s\S]*?)^---\s*$/m;

  module.exports = FrontMatter = (function() {
    function FrontMatter(editor, options) {
      if (options == null) {
        options = {};
      }
      this.editor = editor;
      this.options = options;
      this.content = {};
      this.leadingFence = true;
      this.isEmpty = true;
      this.parseError = null;
      this._findFrontMatter((function(_this) {
        return function(match) {
          var error;
          try {
            _this.content = yaml.safeLoad(match.match[1].trim()) || {};
            _this.leadingFence = match.matchText.startsWith("---");
            return _this.isEmpty = false;
          } catch (error1) {
            error = error1;
            _this.parseError = error;
            _this.content = {};
            if (options["silent"] !== true) {
              return atom.confirm({
                message: "[Markdown Writer] Error!",
                detailedMessage: "Invalid Front Matter:\n" + error.message,
                buttons: ['OK']
              });
            }
          }
        };
      })(this));
    }

    FrontMatter.prototype._findFrontMatter = function(onMatch) {
      return this.editor.buffer.scan(FRONT_MATTER_REGEX, onMatch);
    };

    FrontMatter.prototype.normalizeField = function(field) {
      if (Object.prototype.toString.call(this.content[field]) === "[object Array]") {
        return this.content[field];
      } else if (typeof this.content[field] === "string") {
        return this.content[field] = [this.content[field]];
      } else {
        return this.content[field] = [];
      }
    };

    FrontMatter.prototype.has = function(field) {
      return field && (this.content[field] != null);
    };

    FrontMatter.prototype.get = function(field) {
      return this.content[field];
    };

    FrontMatter.prototype.getArray = function(field) {
      this.normalizeField(field);
      return this.content[field];
    };

    FrontMatter.prototype.set = function(field, content) {
      return this.content[field] = content;
    };

    FrontMatter.prototype.setIfExists = function(field, content) {
      if (this.has(field)) {
        return this.content[field] = content;
      }
    };

    FrontMatter.prototype.getContent = function() {
      return JSON.parse(JSON.stringify(this.content));
    };

    FrontMatter.prototype.getContentText = function() {
      var text;
      text = yaml.safeDump(this.content);
      if (this.leadingFence) {
        return ["---", text + "---", ""].join("\n");
      } else {
        return [text + "---", ""].join("\n");
      }
    };

    FrontMatter.prototype.save = function() {
      return this._findFrontMatter((function(_this) {
        return function(match) {
          return match.replace(_this.getContentText());
        };
      })(this));
    };

    return FrontMatter;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL2hlbHBlcnMvZnJvbnQtbWF0dGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSOztFQUVQLGtCQUFBLEdBQXFCOztFQVNyQixNQUFNLENBQUMsT0FBUCxHQUNNO0lBR1MscUJBQUMsTUFBRCxFQUFTLE9BQVQ7O1FBQVMsVUFBVTs7TUFDOUIsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLElBQUMsQ0FBQSxPQUFELEdBQVc7TUFDWCxJQUFDLENBQUEsT0FBRCxHQUFXO01BQ1gsSUFBQyxDQUFBLFlBQUQsR0FBZ0I7TUFDaEIsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUNYLElBQUMsQ0FBQSxVQUFELEdBQWM7TUFHZCxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7QUFDaEIsY0FBQTtBQUFBO1lBQ0UsS0FBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsUUFBTCxDQUFjLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBZixDQUFBLENBQWQsQ0FBQSxJQUF3QztZQUNuRCxLQUFDLENBQUEsWUFBRCxHQUFnQixLQUFLLENBQUMsU0FBUyxDQUFDLFVBQWhCLENBQTJCLEtBQTNCO21CQUNoQixLQUFDLENBQUEsT0FBRCxHQUFXLE1BSGI7V0FBQSxjQUFBO1lBSU07WUFDSixLQUFDLENBQUEsVUFBRCxHQUFjO1lBQ2QsS0FBQyxDQUFBLE9BQUQsR0FBVztZQUNYLElBQU8sT0FBUSxDQUFBLFFBQUEsQ0FBUixLQUFxQixJQUE1QjtxQkFDRSxJQUFJLENBQUMsT0FBTCxDQUNFO2dCQUFBLE9BQUEsRUFBUywwQkFBVDtnQkFDQSxlQUFBLEVBQWlCLHlCQUFBLEdBQTBCLEtBQUssQ0FBQyxPQURqRDtnQkFFQSxPQUFBLEVBQVMsQ0FBQyxJQUFELENBRlQ7ZUFERixFQURGO2FBUEY7O1FBRGdCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQjtJQVRXOzswQkF1QmIsZ0JBQUEsR0FBa0IsU0FBQyxPQUFEO2FBQ2hCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQWYsQ0FBb0Isa0JBQXBCLEVBQXdDLE9BQXhDO0lBRGdCOzswQkFJbEIsY0FBQSxHQUFnQixTQUFDLEtBQUQ7TUFDZCxJQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQTFCLENBQStCLElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxDQUF4QyxDQUFBLEtBQW1ELGdCQUF0RDtlQUNFLElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxFQURYO09BQUEsTUFFSyxJQUFHLE9BQU8sSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLENBQWhCLEtBQTBCLFFBQTdCO2VBQ0gsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLENBQVQsR0FBa0IsQ0FBQyxJQUFDLENBQUEsT0FBUSxDQUFBLEtBQUEsQ0FBVixFQURmO09BQUEsTUFBQTtlQUdILElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxDQUFULEdBQWtCLEdBSGY7O0lBSFM7OzBCQVFoQixHQUFBLEdBQUssU0FBQyxLQUFEO2FBQVcsS0FBQSxJQUFTO0lBQXBCOzswQkFFTCxHQUFBLEdBQUssU0FBQyxLQUFEO2FBQVcsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBO0lBQXBCOzswQkFFTCxRQUFBLEdBQVUsU0FBQyxLQUFEO01BQ1IsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsS0FBaEI7YUFDQSxJQUFDLENBQUEsT0FBUSxDQUFBLEtBQUE7SUFGRDs7MEJBSVYsR0FBQSxHQUFLLFNBQUMsS0FBRCxFQUFRLE9BQVI7YUFBb0IsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLENBQVQsR0FBa0I7SUFBdEM7OzBCQUVMLFdBQUEsR0FBYSxTQUFDLEtBQUQsRUFBUSxPQUFSO01BQ1gsSUFBNkIsSUFBQyxDQUFBLEdBQUQsQ0FBSyxLQUFMLENBQTdCO2VBQUEsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLENBQVQsR0FBa0IsUUFBbEI7O0lBRFc7OzBCQUdiLFVBQUEsR0FBWSxTQUFBO2FBQUcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUMsQ0FBQSxPQUFoQixDQUFYO0lBQUg7OzBCQUVaLGNBQUEsR0FBZ0IsU0FBQTtBQUNkLFVBQUE7TUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFDLENBQUEsT0FBZjtNQUNQLElBQUcsSUFBQyxDQUFBLFlBQUo7ZUFDRSxDQUFDLEtBQUQsRUFBVyxJQUFELEdBQU0sS0FBaEIsRUFBc0IsRUFBdEIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixJQUEvQixFQURGO09BQUEsTUFBQTtlQUdFLENBQUksSUFBRCxHQUFNLEtBQVQsRUFBZSxFQUFmLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsSUFBeEIsRUFIRjs7SUFGYzs7MEJBT2hCLElBQUEsR0FBTSxTQUFBO2FBQ0osSUFBQyxDQUFBLGdCQUFELENBQWtCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO2lCQUFXLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBQyxDQUFBLGNBQUQsQ0FBQSxDQUFkO1FBQVg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCO0lBREk7Ozs7O0FBeEVSIiwic291cmNlc0NvbnRlbnQiOlsieWFtbCA9IHJlcXVpcmUgXCJqcy15YW1sXCJcblxuRlJPTlRfTUFUVEVSX1JFR0VYID0gLy8vXG4gIF4oPzotLS1cXHMqJCk/ICAjIG1hdGNoIG9wZW4gLS0tIChpZiBhbnkpXG4gIChcbiAgICBbXjpdKzogICAgICAjIG1hdGNoIGF0IGxlYXN0IDEgb3BlbiBrZXlcbiAgICBbXFxzXFxTXSo/ICAgICMgbWF0Y2ggdGhlIHJlc3RcbiAgKVxuICBeLS0tXFxzKiQgICAgICAgIyBtYXRjaCBlbmRpbmcgLS0tXG4gIC8vL21cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRnJvbnRNYXR0ZXJcbiAgIyBvcHRpb25zOlxuICAjICAgc2lsaWVudCA9IHRydWUvZmFsc2VcbiAgY29uc3RydWN0b3I6IChlZGl0b3IsIG9wdGlvbnMgPSB7fSkgLT5cbiAgICBAZWRpdG9yID0gZWRpdG9yXG4gICAgQG9wdGlvbnMgPSBvcHRpb25zXG4gICAgQGNvbnRlbnQgPSB7fVxuICAgIEBsZWFkaW5nRmVuY2UgPSB0cnVlXG4gICAgQGlzRW1wdHkgPSB0cnVlXG4gICAgQHBhcnNlRXJyb3IgPSBudWxsXG5cbiAgICAjIGZpbmQgYW5kIHBhcnNlIGZyb250IG1hdHRlclxuICAgIEBfZmluZEZyb250TWF0dGVyIChtYXRjaCkgPT5cbiAgICAgIHRyeVxuICAgICAgICBAY29udGVudCA9IHlhbWwuc2FmZUxvYWQobWF0Y2gubWF0Y2hbMV0udHJpbSgpKSB8fCB7fVxuICAgICAgICBAbGVhZGluZ0ZlbmNlID0gbWF0Y2gubWF0Y2hUZXh0LnN0YXJ0c1dpdGgoXCItLS1cIilcbiAgICAgICAgQGlzRW1wdHkgPSBmYWxzZVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgQHBhcnNlRXJyb3IgPSBlcnJvclxuICAgICAgICBAY29udGVudCA9IHt9XG4gICAgICAgIHVubGVzcyBvcHRpb25zW1wic2lsZW50XCJdID09IHRydWVcbiAgICAgICAgICBhdG9tLmNvbmZpcm1cbiAgICAgICAgICAgIG1lc3NhZ2U6IFwiW01hcmtkb3duIFdyaXRlcl0gRXJyb3IhXCJcbiAgICAgICAgICAgIGRldGFpbGVkTWVzc2FnZTogXCJJbnZhbGlkIEZyb250IE1hdHRlcjpcXG4je2Vycm9yLm1lc3NhZ2V9XCJcbiAgICAgICAgICAgIGJ1dHRvbnM6IFsnT0snXVxuXG4gIF9maW5kRnJvbnRNYXR0ZXI6IChvbk1hdGNoKSAtPlxuICAgIEBlZGl0b3IuYnVmZmVyLnNjYW4oRlJPTlRfTUFUVEVSX1JFR0VYLCBvbk1hdGNoKVxuXG4gICMgbm9ybWFsaXplIHRoZSBmaWVsZCB0byBhbiBhcnJheVxuICBub3JtYWxpemVGaWVsZDogKGZpZWxkKSAtPlxuICAgIGlmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChAY29udGVudFtmaWVsZF0pID09IFwiW29iamVjdCBBcnJheV1cIlxuICAgICAgQGNvbnRlbnRbZmllbGRdXG4gICAgZWxzZSBpZiB0eXBlb2YgQGNvbnRlbnRbZmllbGRdID09IFwic3RyaW5nXCJcbiAgICAgIEBjb250ZW50W2ZpZWxkXSA9IFtAY29udGVudFtmaWVsZF1dXG4gICAgZWxzZVxuICAgICAgQGNvbnRlbnRbZmllbGRdID0gW11cblxuICBoYXM6IChmaWVsZCkgLT4gZmllbGQgJiYgQGNvbnRlbnRbZmllbGRdP1xuXG4gIGdldDogKGZpZWxkKSAtPiBAY29udGVudFtmaWVsZF1cblxuICBnZXRBcnJheTogKGZpZWxkKSAtPlxuICAgIEBub3JtYWxpemVGaWVsZChmaWVsZClcbiAgICBAY29udGVudFtmaWVsZF1cblxuICBzZXQ6IChmaWVsZCwgY29udGVudCkgLT4gQGNvbnRlbnRbZmllbGRdID0gY29udGVudFxuXG4gIHNldElmRXhpc3RzOiAoZmllbGQsIGNvbnRlbnQpIC0+XG4gICAgQGNvbnRlbnRbZmllbGRdID0gY29udGVudCBpZiBAaGFzKGZpZWxkKVxuXG4gIGdldENvbnRlbnQ6IC0+IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoQGNvbnRlbnQpKVxuXG4gIGdldENvbnRlbnRUZXh0OiAtPlxuICAgIHRleHQgPSB5YW1sLnNhZmVEdW1wKEBjb250ZW50KVxuICAgIGlmIEBsZWFkaW5nRmVuY2VcbiAgICAgIFtcIi0tLVwiLCBcIiN7dGV4dH0tLS1cIiwgXCJcIl0uam9pbihcIlxcblwiKVxuICAgIGVsc2VcbiAgICAgIFtcIiN7dGV4dH0tLS1cIiwgXCJcIl0uam9pbihcIlxcblwiKVxuXG4gIHNhdmU6IC0+XG4gICAgQF9maW5kRnJvbnRNYXR0ZXIgKG1hdGNoKSA9PiBtYXRjaC5yZXBsYWNlKEBnZXRDb250ZW50VGV4dCgpKVxuIl19
