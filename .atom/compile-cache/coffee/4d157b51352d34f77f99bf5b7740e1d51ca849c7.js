(function() {
  var StyleText, config, scopeSelectors, utils;

  config = require("../config");

  utils = require("../utils");

  scopeSelectors = {
    code: ".raw",
    bold: ".bold",
    italic: ".italic",
    strikethrough: ".strike"
  };

  module.exports = StyleText = (function() {
    function StyleText(style) {
      var base, base1;
      this.styleName = style;
      this.style = config.get("textStyles." + style);
      if ((base = this.style).before == null) {
        base.before = "";
      }
      if ((base1 = this.style).after == null) {
        base1.after = "";
      }
    }

    StyleText.prototype.trigger = function(e) {
      this.editor = atom.workspace.getActiveTextEditor();
      return this.editor.transact((function(_this) {
        return function() {
          return _this.editor.getSelections().forEach(function(selection) {
            var retainSelection, text;
            retainSelection = !selection.isEmpty();
            _this.normalizeSelection(selection);
            if (text = selection.getText()) {
              return _this.toggleStyle(selection, text, {
                select: retainSelection
              });
            } else {
              return _this.insertEmptyStyle(selection);
            }
          });
        };
      })(this));
    };

    StyleText.prototype.normalizeSelection = function(selection) {
      var range, scopeSelector;
      scopeSelector = scopeSelectors[this.styleName];
      if (!scopeSelector) {
        return;
      }
      range = utils.getTextBufferRange(this.editor, scopeSelector, selection);
      return selection.setBufferRange(range);
    };

    StyleText.prototype.toggleStyle = function(selection, text, opts) {
      if (this.isStyleOn(text)) {
        text = this.removeStyle(text);
      } else {
        text = this.addStyle(text);
      }
      return selection.insertText(text, opts);
    };

    StyleText.prototype.insertEmptyStyle = function(selection) {
      var position;
      selection.insertText(this.style.before);
      position = selection.cursor.getBufferPosition();
      selection.insertText(this.style.after);
      return selection.cursor.setBufferPosition(position);
    };

    StyleText.prototype.isStyleOn = function(text) {
      if (text) {
        return this.getStylePattern().test(text);
      }
    };

    StyleText.prototype.addStyle = function(text) {
      return "" + this.style.before + text + this.style.after;
    };

    StyleText.prototype.removeStyle = function(text) {
      var matches;
      while (matches = this.getStylePattern().exec(text)) {
        text = matches.slice(1).join("");
      }
      return text;
    };

    StyleText.prototype.getStylePattern = function() {
      var after, before;
      before = this.style.regexBefore || utils.escapeRegExp(this.style.before);
      after = this.style.regexAfter || utils.escapeRegExp(this.style.after);
      return RegExp("^([\\s\\S]*?)" + before + "([\\s\\S]*?)" + after + "([\\s\\S]*?)$", "gm");
    };

    return StyleText;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL2NvbW1hbmRzL3N0eWxlLXRleHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFdBQVI7O0VBQ1QsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSOztFQUdSLGNBQUEsR0FDRTtJQUFBLElBQUEsRUFBTSxNQUFOO0lBQ0EsSUFBQSxFQUFNLE9BRE47SUFFQSxNQUFBLEVBQVEsU0FGUjtJQUdBLGFBQUEsRUFBZSxTQUhmOzs7RUFLRixNQUFNLENBQUMsT0FBUCxHQUNNO0lBUVMsbUJBQUMsS0FBRDtBQUNYLFVBQUE7TUFBQSxJQUFDLENBQUEsU0FBRCxHQUFhO01BQ2IsSUFBQyxDQUFBLEtBQUQsR0FBUyxNQUFNLENBQUMsR0FBUCxDQUFXLGFBQUEsR0FBYyxLQUF6Qjs7WUFFSCxDQUFDLFNBQVU7OzthQUNYLENBQUMsUUFBUzs7SUFMTDs7d0JBT2IsT0FBQSxHQUFTLFNBQUMsQ0FBRDtNQUNQLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO2FBQ1YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDZixLQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQSxDQUF1QixDQUFDLE9BQXhCLENBQWdDLFNBQUMsU0FBRDtBQUM5QixnQkFBQTtZQUFBLGVBQUEsR0FBa0IsQ0FBQyxTQUFTLENBQUMsT0FBVixDQUFBO1lBQ25CLEtBQUMsQ0FBQSxrQkFBRCxDQUFvQixTQUFwQjtZQUVBLElBQUcsSUFBQSxHQUFPLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBVjtxQkFDRSxLQUFDLENBQUEsV0FBRCxDQUFhLFNBQWIsRUFBd0IsSUFBeEIsRUFBOEI7Z0JBQUEsTUFBQSxFQUFRLGVBQVI7ZUFBOUIsRUFERjthQUFBLE1BQUE7cUJBR0UsS0FBQyxDQUFBLGdCQUFELENBQWtCLFNBQWxCLEVBSEY7O1VBSjhCLENBQWhDO1FBRGU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO0lBRk87O3dCQWFULGtCQUFBLEdBQW9CLFNBQUMsU0FBRDtBQUNsQixVQUFBO01BQUEsYUFBQSxHQUFnQixjQUFlLENBQUEsSUFBQyxDQUFBLFNBQUQ7TUFDL0IsSUFBQSxDQUFjLGFBQWQ7QUFBQSxlQUFBOztNQUVBLEtBQUEsR0FBUSxLQUFLLENBQUMsa0JBQU4sQ0FBeUIsSUFBQyxDQUFBLE1BQTFCLEVBQWtDLGFBQWxDLEVBQWlELFNBQWpEO2FBQ1IsU0FBUyxDQUFDLGNBQVYsQ0FBeUIsS0FBekI7SUFMa0I7O3dCQU9wQixXQUFBLEdBQWEsU0FBQyxTQUFELEVBQVksSUFBWixFQUFrQixJQUFsQjtNQUNYLElBQUcsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFYLENBQUg7UUFDRSxJQUFBLEdBQU8sSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFiLEVBRFQ7T0FBQSxNQUFBO1FBR0UsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBVixFQUhUOzthQUtBLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLEVBQTJCLElBQTNCO0lBTlc7O3dCQVFiLGdCQUFBLEdBQWtCLFNBQUMsU0FBRDtBQUNoQixVQUFBO01BQUEsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUE1QjtNQUNBLFFBQUEsR0FBVyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFqQixDQUFBO01BQ1gsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUE1QjthQUNBLFNBQVMsQ0FBQyxNQUFNLENBQUMsaUJBQWpCLENBQW1DLFFBQW5DO0lBSmdCOzt3QkFNbEIsU0FBQSxHQUFXLFNBQUMsSUFBRDtNQUNULElBQWlDLElBQWpDO2VBQUEsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFrQixDQUFDLElBQW5CLENBQXdCLElBQXhCLEVBQUE7O0lBRFM7O3dCQUdYLFFBQUEsR0FBVSxTQUFDLElBQUQ7YUFDUixFQUFBLEdBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFWLEdBQW1CLElBQW5CLEdBQTBCLElBQUMsQ0FBQSxLQUFLLENBQUM7SUFEekI7O3dCQUdWLFdBQUEsR0FBYSxTQUFDLElBQUQ7QUFDWCxVQUFBO0FBQUEsYUFBTSxPQUFBLEdBQVUsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQUFrQixDQUFDLElBQW5CLENBQXdCLElBQXhCLENBQWhCO1FBQ0UsSUFBQSxHQUFPLE9BQVEsU0FBSSxDQUFDLElBQWIsQ0FBa0IsRUFBbEI7TUFEVDtBQUVBLGFBQU87SUFISTs7d0JBS2IsZUFBQSxHQUFpQixTQUFBO0FBQ2YsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLFdBQVAsSUFBc0IsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUExQjtNQUMvQixLQUFBLEdBQVEsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFQLElBQXFCLEtBQUssQ0FBQyxZQUFOLENBQW1CLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBMUI7YUFFN0IsTUFBQSxDQUFBLGVBQUEsR0FFRSxNQUZGLEdBRVMsY0FGVCxHQUVxQixLQUZyQixHQUUyQixlQUYzQixFQUlFLElBSkY7SUFKZTs7Ozs7QUF2RW5CIiwic291cmNlc0NvbnRlbnQiOlsiY29uZmlnID0gcmVxdWlyZSBcIi4uL2NvbmZpZ1wiXG51dGlscyA9IHJlcXVpcmUgXCIuLi91dGlsc1wiXG5cbiMgTWFwIG1hcmtkb3duLXdyaXRlciB0ZXh0IHN0eWxlIGtleXMgdG8gb2ZmaWNpYWwgZ2ZtIHN0eWxlIHNjb3BlIHNlbGVjdG9yc1xuc2NvcGVTZWxlY3RvcnMgPVxuICBjb2RlOiBcIi5yYXdcIlxuICBib2xkOiBcIi5ib2xkXCJcbiAgaXRhbGljOiBcIi5pdGFsaWNcIlxuICBzdHJpa2V0aHJvdWdoOiBcIi5zdHJpa2VcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTdHlsZVRleHRcbiAgIyBAc3R5bGUgY29uZmlnIGNvdWxkIGNvbnRhaW5zOlxuICAjXG4gICMgLSBiZWZvcmUgKHJlcXVpcmVkKVxuICAjIC0gYWZ0ZXIgKHJlcXVpcmVkKVxuICAjIC0gcmVnZXhCZWZvcmUgKG9wdGlvbmFsKSBvdmVyd3JpdGVzIGJlZm9yZSB3aGVuIHRvIG1hdGNoL3JlcGxhY2Ugc3RyaW5nXG4gICMgLSByZWdleEFmdGVyIChvcHRpb25hbCkgb3ZlcndyaXRlcyBhZnRlciB3aGVuIHRvIG1hdGNoL3JlcGxhY2Ugc3RyaW5nXG4gICNcbiAgY29uc3RydWN0b3I6IChzdHlsZSkgLT5cbiAgICBAc3R5bGVOYW1lID0gc3R5bGVcbiAgICBAc3R5bGUgPSBjb25maWcuZ2V0KFwidGV4dFN0eWxlcy4je3N0eWxlfVwiKVxuICAgICMgbWFrZSBzdXJlIGJlZm9yZS9hZnRlciBleGlzdFxuICAgIEBzdHlsZS5iZWZvcmUgPz0gXCJcIlxuICAgIEBzdHlsZS5hZnRlciA/PSBcIlwiXG5cbiAgdHJpZ2dlcjogKGUpIC0+XG4gICAgQGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLmZvckVhY2ggKHNlbGVjdGlvbikgPT5cbiAgICAgICAgcmV0YWluU2VsZWN0aW9uID0gIXNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgICAgQG5vcm1hbGl6ZVNlbGVjdGlvbihzZWxlY3Rpb24pXG5cbiAgICAgICAgaWYgdGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgICAgICBAdG9nZ2xlU3R5bGUoc2VsZWN0aW9uLCB0ZXh0LCBzZWxlY3Q6IHJldGFpblNlbGVjdGlvbilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBpbnNlcnRFbXB0eVN0eWxlKHNlbGVjdGlvbilcblxuICAjIHRyeSB0byBhY3Qgc21hcnQgdG8gY29ycmVjdCB0aGUgc2VsZWN0aW9uIGlmIG5lZWRlZFxuICBub3JtYWxpemVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgc2NvcGVTZWxlY3RvciA9IHNjb3BlU2VsZWN0b3JzW0BzdHlsZU5hbWVdXG4gICAgcmV0dXJuIHVubGVzcyBzY29wZVNlbGVjdG9yXG5cbiAgICByYW5nZSA9IHV0aWxzLmdldFRleHRCdWZmZXJSYW5nZShAZWRpdG9yLCBzY29wZVNlbGVjdG9yLCBzZWxlY3Rpb24pXG4gICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxuXG4gIHRvZ2dsZVN0eWxlOiAoc2VsZWN0aW9uLCB0ZXh0LCBvcHRzKSAtPlxuICAgIGlmIEBpc1N0eWxlT24odGV4dClcbiAgICAgIHRleHQgPSBAcmVtb3ZlU3R5bGUodGV4dClcbiAgICBlbHNlXG4gICAgICB0ZXh0ID0gQGFkZFN0eWxlKHRleHQpXG5cbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCBvcHRzKVxuXG4gIGluc2VydEVtcHR5U3R5bGU6IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQoQHN0eWxlLmJlZm9yZSlcbiAgICBwb3NpdGlvbiA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KEBzdHlsZS5hZnRlcilcbiAgICBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvc2l0aW9uKVxuXG4gIGlzU3R5bGVPbjogKHRleHQpIC0+XG4gICAgQGdldFN0eWxlUGF0dGVybigpLnRlc3QodGV4dCkgaWYgdGV4dFxuXG4gIGFkZFN0eWxlOiAodGV4dCkgLT5cbiAgICBcIiN7QHN0eWxlLmJlZm9yZX0je3RleHR9I3tAc3R5bGUuYWZ0ZXJ9XCJcblxuICByZW1vdmVTdHlsZTogKHRleHQpIC0+XG4gICAgd2hpbGUgbWF0Y2hlcyA9IEBnZXRTdHlsZVBhdHRlcm4oKS5leGVjKHRleHQpXG4gICAgICB0ZXh0ID0gbWF0Y2hlc1sxLi5dLmpvaW4oXCJcIilcbiAgICByZXR1cm4gdGV4dFxuXG4gIGdldFN0eWxlUGF0dGVybjogLT5cbiAgICBiZWZvcmUgPSBAc3R5bGUucmVnZXhCZWZvcmUgfHwgdXRpbHMuZXNjYXBlUmVnRXhwKEBzdHlsZS5iZWZvcmUpXG4gICAgYWZ0ZXIgPSBAc3R5bGUucmVnZXhBZnRlciB8fCB1dGlscy5lc2NhcGVSZWdFeHAoQHN0eWxlLmFmdGVyKVxuXG4gICAgLy8vXG4gICAgXihbXFxzXFxTXSo/KSAgICAgICAgICAgICAgICAgICAgIyByYW5kb20gdGV4dCBhdCBoZWFkXG4gICAgI3tiZWZvcmV9KFtcXHNcXFNdKj8pI3thZnRlcn0gICAgIyB0aGUgc3R5bGUgcGF0dGVybiBhcHBlYXIgb25jZVxuICAgIChbXFxzXFxTXSo/KSQgICAgICAgICAgICAgICAgICAgICMgcmFuZG9tIHRleHQgYXQgZW5kXG4gICAgLy8vZ21cbiJdfQ==
