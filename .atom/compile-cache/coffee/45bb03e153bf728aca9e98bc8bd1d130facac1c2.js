(function() {
  var $, CompositeDisposable, FrontMatter, ManageFrontMatterView, TextEditorView, View, config, ref, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View, TextEditorView = ref.TextEditorView;

  config = require("../config");

  utils = require("../utils");

  FrontMatter = require("../helpers/front-matter");

  module.exports = ManageFrontMatterView = (function(superClass) {
    extend(ManageFrontMatterView, superClass);

    function ManageFrontMatterView() {
      return ManageFrontMatterView.__super__.constructor.apply(this, arguments);
    }

    ManageFrontMatterView.labelName = "Manage Field";

    ManageFrontMatterView.fieldName = "fieldName";

    ManageFrontMatterView.content = function() {
      return this.div({
        "class": "markdown-writer markdown-writer-selection"
      }, (function(_this) {
        return function() {
          _this.label(_this.labelName, {
            "class": "icon icon-book"
          });
          _this.p({
            "class": "error",
            outlet: "error"
          });
          _this.subview("fieldEditor", new TextEditorView({
            mini: true
          }));
          return _this.ul({
            "class": "candidates",
            outlet: "candidates"
          }, function() {
            return _this.li("Loading...");
          });
        };
      })(this));
    };

    ManageFrontMatterView.prototype.initialize = function() {
      this.candidates.on("click", "li", (function(_this) {
        return function(e) {
          return _this.appendFieldItem(e);
        };
      })(this));
      this.disposables = new CompositeDisposable();
      return this.disposables.add(atom.commands.add(this.element, {
        "core:confirm": (function(_this) {
          return function() {
            return _this.saveFrontMatter();
          };
        })(this),
        "core:cancel": (function(_this) {
          return function() {
            return _this.detach();
          };
        })(this)
      }));
    };

    ManageFrontMatterView.prototype.display = function() {
      this.editor = atom.workspace.getActiveTextEditor();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.fetchSiteFieldCandidates();
      this.frontMatter = new FrontMatter(this.editor);
      if (this.frontMatter.parseError) {
        return this.detach();
      }
      this.setEditorFieldItems(this.frontMatter.getArray(this.constructor.fieldName));
      this.panel.show();
      return this.fieldEditor.focus();
    };

    ManageFrontMatterView.prototype.detach = function() {
      var ref1;
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((ref1 = this.previouslyFocusedElement) != null) {
          ref1.focus();
        }
      }
      return ManageFrontMatterView.__super__.detach.apply(this, arguments);
    };

    ManageFrontMatterView.prototype.detached = function() {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.disposables = null;
    };

    ManageFrontMatterView.prototype.saveFrontMatter = function() {
      this.frontMatter.set(this.constructor.fieldName, this.getEditorFieldItems());
      this.frontMatter.save();
      return this.detach();
    };

    ManageFrontMatterView.prototype.setEditorFieldItems = function(fieldItems) {
      return this.fieldEditor.setText(fieldItems.join(","));
    };

    ManageFrontMatterView.prototype.getEditorFieldItems = function() {
      return this.fieldEditor.getText().split(/\s*,\s*/).filter(function(c) {
        return !!c.trim();
      });
    };

    ManageFrontMatterView.prototype.fetchSiteFieldCandidates = function() {};

    ManageFrontMatterView.prototype.displaySiteFieldItems = function(siteFieldItems) {
      var fieldItems, tagElems;
      fieldItems = this.frontMatter.getArray(this.constructor.fieldName) || [];
      tagElems = siteFieldItems.map(function(tag) {
        if (fieldItems.indexOf(tag) < 0) {
          return "<li>" + tag + "</li>";
        } else {
          return "<li class='selected'>" + tag + "</li>";
        }
      });
      return this.candidates.empty().append(tagElems.join(""));
    };

    ManageFrontMatterView.prototype.appendFieldItem = function(e) {
      var fieldItem, fieldItems, idx;
      fieldItem = e.target.textContent;
      fieldItems = this.getEditorFieldItems();
      idx = fieldItems.indexOf(fieldItem);
      if (idx < 0) {
        fieldItems.push(fieldItem);
        e.target.classList.add("selected");
      } else {
        fieldItems.splice(idx, 1);
        e.target.classList.remove("selected");
      }
      this.setEditorFieldItems(fieldItems);
      return this.fieldEditor.focus();
    };

    return ManageFrontMatterView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL3ZpZXdzL21hbmFnZS1mcm9udC1tYXR0ZXItdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9HQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBNEIsT0FBQSxDQUFRLHNCQUFSLENBQTVCLEVBQUMsU0FBRCxFQUFJLGVBQUosRUFBVTs7RUFFVixNQUFBLEdBQVMsT0FBQSxDQUFRLFdBQVI7O0VBQ1QsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSOztFQUNSLFdBQUEsR0FBYyxPQUFBLENBQVEseUJBQVI7O0VBRWQsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLHFCQUFDLENBQUEsU0FBRCxHQUFZOztJQUNaLHFCQUFDLENBQUEsU0FBRCxHQUFZOztJQUVaLHFCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTywyQ0FBUDtPQUFMLEVBQXlELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUN2RCxLQUFDLENBQUEsS0FBRCxDQUFPLEtBQUMsQ0FBQSxTQUFSLEVBQW1CO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxnQkFBUDtXQUFuQjtVQUNBLEtBQUMsQ0FBQSxDQUFELENBQUc7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQVA7WUFBZ0IsTUFBQSxFQUFRLE9BQXhCO1dBQUg7VUFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLGFBQVQsRUFBd0IsSUFBSSxjQUFKLENBQW1CO1lBQUEsSUFBQSxFQUFNLElBQU47V0FBbkIsQ0FBeEI7aUJBQ0EsS0FBQyxDQUFBLEVBQUQsQ0FBSTtZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sWUFB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QUFDLFNBQVMsQ0FBQyxNQUFuQixDQUEwQixVQUExQixFQUxGOztNQU1BLElBQUMsQ0FBQSxtQkFBRCxDQUFxQixVQUFyQjthQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsS0FBYixDQUFBO0lBWGU7Ozs7S0FuRWlCO0FBUnBDIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnskLCBWaWV3LCBUZXh0RWRpdG9yVmlld30gPSByZXF1aXJlIFwiYXRvbS1zcGFjZS1wZW4tdmlld3NcIlxuXG5jb25maWcgPSByZXF1aXJlIFwiLi4vY29uZmlnXCJcbnV0aWxzID0gcmVxdWlyZSBcIi4uL3V0aWxzXCJcbkZyb250TWF0dGVyID0gcmVxdWlyZSBcIi4uL2hlbHBlcnMvZnJvbnQtbWF0dGVyXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTWFuYWdlRnJvbnRNYXR0ZXJWaWV3IGV4dGVuZHMgVmlld1xuICBAbGFiZWxOYW1lOiBcIk1hbmFnZSBGaWVsZFwiICMgb3ZlcnJpZGVcbiAgQGZpZWxkTmFtZTogXCJmaWVsZE5hbWVcIiAjIG92ZXJyaWRlXG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogXCJtYXJrZG93bi13cml0ZXIgbWFya2Rvd24td3JpdGVyLXNlbGVjdGlvblwiLCA9PlxuICAgICAgQGxhYmVsIEBsYWJlbE5hbWUsIGNsYXNzOiBcImljb24gaWNvbi1ib29rXCJcbiAgICAgIEBwIGNsYXNzOiBcImVycm9yXCIsIG91dGxldDogXCJlcnJvclwiXG4gICAgICBAc3VidmlldyBcImZpZWxkRWRpdG9yXCIsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuICAgICAgQHVsIGNsYXNzOiBcImNhbmRpZGF0ZXNcIiwgb3V0bGV0OiBcImNhbmRpZGF0ZXNcIiwgPT5cbiAgICAgICAgQGxpIFwiTG9hZGluZy4uLlwiXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAY2FuZGlkYXRlcy5vbiBcImNsaWNrXCIsIFwibGlcIiwgKGUpID0+IEBhcHBlbmRGaWVsZEl0ZW0oZSlcblxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBAZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgQGVsZW1lbnQsIHtcbiAgICAgICAgXCJjb3JlOmNvbmZpcm1cIjogPT4gQHNhdmVGcm9udE1hdHRlcigpXG4gICAgICAgIFwiY29yZTpjYW5jZWxcIjogID0+IEBkZXRhY2goKVxuICAgICAgfSkpXG5cbiAgZGlzcGxheTogLT5cbiAgICBAZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcywgdmlzaWJsZTogZmFsc2UpXG4gICAgQHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9ICQoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcblxuICAgIEBmZXRjaFNpdGVGaWVsZENhbmRpZGF0ZXMoKVxuICAgIEBmcm9udE1hdHRlciA9IG5ldyBGcm9udE1hdHRlcihAZWRpdG9yKVxuICAgIHJldHVybiBAZGV0YWNoKCkgaWYgQGZyb250TWF0dGVyLnBhcnNlRXJyb3JcbiAgICBAc2V0RWRpdG9yRmllbGRJdGVtcyhAZnJvbnRNYXR0ZXIuZ2V0QXJyYXkoQGNvbnN0cnVjdG9yLmZpZWxkTmFtZSkpXG5cbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQGZpZWxkRWRpdG9yLmZvY3VzKClcblxuICBkZXRhY2g6IC0+XG4gICAgaWYgQHBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICBAcGFuZWwuaGlkZSgpXG4gICAgICBAcHJldmlvdXNseUZvY3VzZWRFbGVtZW50Py5mb2N1cygpXG4gICAgc3VwZXJcblxuICBkZXRhY2hlZDogLT5cbiAgICBAZGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIEBkaXNwb3NhYmxlcyA9IG51bGxcblxuICBzYXZlRnJvbnRNYXR0ZXI6IC0+XG4gICAgQGZyb250TWF0dGVyLnNldChAY29uc3RydWN0b3IuZmllbGROYW1lLCBAZ2V0RWRpdG9yRmllbGRJdGVtcygpKVxuICAgIEBmcm9udE1hdHRlci5zYXZlKClcbiAgICBAZGV0YWNoKClcblxuICBzZXRFZGl0b3JGaWVsZEl0ZW1zOiAoZmllbGRJdGVtcykgLT5cbiAgICBAZmllbGRFZGl0b3Iuc2V0VGV4dChmaWVsZEl0ZW1zLmpvaW4oXCIsXCIpKVxuXG4gIGdldEVkaXRvckZpZWxkSXRlbXM6IC0+XG4gICAgQGZpZWxkRWRpdG9yLmdldFRleHQoKS5zcGxpdCgvXFxzKixcXHMqLykuZmlsdGVyKChjKSAtPiAhIWMudHJpbSgpKVxuXG4gIGZldGNoU2l0ZUZpZWxkQ2FuZGlkYXRlczogLT4gIyBvdmVycmlkZVxuXG4gIGRpc3BsYXlTaXRlRmllbGRJdGVtczogKHNpdGVGaWVsZEl0ZW1zKSAtPlxuICAgIGZpZWxkSXRlbXMgPSBAZnJvbnRNYXR0ZXIuZ2V0QXJyYXkoQGNvbnN0cnVjdG9yLmZpZWxkTmFtZSkgfHwgW11cbiAgICB0YWdFbGVtcyA9IHNpdGVGaWVsZEl0ZW1zLm1hcCAodGFnKSAtPlxuICAgICAgaWYgZmllbGRJdGVtcy5pbmRleE9mKHRhZykgPCAwXG4gICAgICAgIFwiPGxpPiN7dGFnfTwvbGk+XCJcbiAgICAgIGVsc2VcbiAgICAgICAgXCI8bGkgY2xhc3M9J3NlbGVjdGVkJz4je3RhZ308L2xpPlwiXG4gICAgQGNhbmRpZGF0ZXMuZW1wdHkoKS5hcHBlbmQodGFnRWxlbXMuam9pbihcIlwiKSlcblxuICBhcHBlbmRGaWVsZEl0ZW06IChlKSAtPlxuICAgIGZpZWxkSXRlbSA9IGUudGFyZ2V0LnRleHRDb250ZW50XG4gICAgZmllbGRJdGVtcyA9IEBnZXRFZGl0b3JGaWVsZEl0ZW1zKClcbiAgICBpZHggPSBmaWVsZEl0ZW1zLmluZGV4T2YoZmllbGRJdGVtKVxuICAgIGlmIGlkeCA8IDBcbiAgICAgIGZpZWxkSXRlbXMucHVzaChmaWVsZEl0ZW0pXG4gICAgICBlLnRhcmdldC5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIilcbiAgICBlbHNlXG4gICAgICBmaWVsZEl0ZW1zLnNwbGljZShpZHgsIDEpXG4gICAgICBlLnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKFwic2VsZWN0ZWRcIilcbiAgICBAc2V0RWRpdG9yRmllbGRJdGVtcyhmaWVsZEl0ZW1zKVxuICAgIEBmaWVsZEVkaXRvci5mb2N1cygpXG4iXX0=
