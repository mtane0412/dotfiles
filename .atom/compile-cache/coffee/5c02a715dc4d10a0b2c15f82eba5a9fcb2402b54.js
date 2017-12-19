(function() {
  var $, CompositeDisposable, Terminal, TerminalView, View, lastActiveItem, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, View = ref.View;

  Terminal = require('./terminal');

  lastActiveItem = null;

  module.exports = TerminalView = (function(superClass) {
    extend(TerminalView, superClass);

    function TerminalView() {
      this.hide = bind(this.hide, this);
      this.open = bind(this.open, this);
      this.blur = bind(this.blur, this);
      this.focus = bind(this.focus, this);
      this.onWindowResize = bind(this.onWindowResize, this);
      return TerminalView.__super__.constructor.apply(this, arguments);
    }

    TerminalView.prototype.subscriptions = null;

    TerminalView.prototype.core = null;

    TerminalView.prototype.emitter = null;

    TerminalView.prototype.animating = false;

    TerminalView.content = function(arg) {
      var id, pwd, shellPath, terminal;
      terminal = arg.terminal, shellPath = arg.shellPath, pwd = arg.pwd, id = arg.id;
      return this.div({
        "class": 'terminal-plus'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'terminal-view'
          }, function() {
            _this.div({
              "class": 'panel-divider',
              outlet: 'panelDivider'
            });
            _this.div({
              "class": 'btn-toolbar',
              outlet: 'toolbar'
            });
            terminal = terminal || new Terminal({
              shellPath: shellPath,
              pwd: pwd,
              id: id
            });
            return _this.subview('terminal', terminal.setParentView(_this));
          });
        };
      })(this));
    };

    TerminalView.getFocusedTerminal = function() {
      return Terminal.getFocusedTerminal();
    };

    TerminalView.prototype.initialize = function() {
      this.subscriptions = new CompositeDisposable();
      return this.attachWindowEvents();
    };

    TerminalView.prototype.destroy = function(keepTerminal) {
      this.subscriptions.dispose();
      if (this.terminal && !keepTerminal) {
        return this.terminal.destroy();
      }
    };


    /*
    Section: Window Events
     */

    TerminalView.prototype.attachWindowEvents = function() {
      return $(window).on('resize', this.onWindowResize);
    };

    TerminalView.prototype.detachWindowEvents = function() {
      return $(window).off('resize', this.onWindowResize);
    };

    TerminalView.prototype.onWindowResize = function() {
      return this.terminal.recalibrateSize();
    };


    /*
    Section: External Methods
     */

    TerminalView.prototype.focus = function() {
      var ref1;
      if ((ref1 = this.terminal) != null) {
        ref1.focus();
      }
      return TerminalView.__super__.focus.call(this);
    };

    TerminalView.prototype.blur = function() {
      var ref1;
      if ((ref1 = this.terminal) != null) {
        ref1.blur();
      }
      return TerminalView.__super__.blur.call(this);
    };

    TerminalView.prototype.open = function() {
      return lastActiveItem != null ? lastActiveItem : lastActiveItem = atom.workspace.getActiveTextEditor();
    };

    TerminalView.prototype.hide = function(refocus) {
      var activeEditor, pane;
      if (lastActiveItem && refocus) {
        if (pane = atom.workspace.paneForItem(lastActiveItem)) {
          if (activeEditor = atom.workspace.getActiveTextEditor()) {
            if (lastActiveItem !== activeEditor) {
              lastActiveItem = activeEditor;
            }
          }
          pane.activateItem(lastActiveItem);
          atom.views.getView(lastActiveItem).focus();
          return lastActiveItem = null;
        }
      }
    };

    TerminalView.prototype.toggle = function() {
      if (this.isAnimating()) {
        return;
      }
      if (this.isVisible()) {
        return this.hide();
      } else {
        return this.open();
      }
    };

    TerminalView.prototype.toggleFocus = function() {
      var pane;
      if (!this.isVisible()) {
        return;
      }
      if (this.terminal.isFocused()) {
        this.blur();
        if (lastActiveItem) {
          if (pane = atom.workspace.paneForItem(lastActiveItem)) {
            pane.activateItem(lastActiveItem);
            atom.views.getView(lastActiveItem).focus();
            return lastActiveItem = null;
          }
        }
      } else {
        if (lastActiveItem == null) {
          lastActiveItem = atom.workspace.getActiveTextEditor();
        }
        return this.focus();
      }
    };

    TerminalView.prototype.addButton = function(side, onClick, icon) {
      var button;
      if (icon.indexOf('icon-') < 0) {
        icon = 'icon-' + icon;
      }
      button = $("<button/>").addClass("btn inline-block-tight " + side);
      button.click(onClick);
      button.append($("<span class=\"icon " + icon + "\"></span>"));
      this.toolbar.append(button);
      return button;
    };

    TerminalView.prototype.isAnimating = function() {
      return this.animating;
    };

    TerminalView.prototype.isFocused = function() {
      return this.terminal.isFocused();
    };

    TerminalView.prototype.getTerminal = function() {
      return this.terminal;
    };

    TerminalView.prototype.getDisplay = function() {
      return this.terminal.getDisplay();
    };

    return TerminalView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvdGVybWluYWwtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHlFQUFBO0lBQUE7Ozs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLE1BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxTQUFELEVBQUk7O0VBRUosUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLGNBQUEsR0FBaUI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7Ozs7OzsyQkFDSixhQUFBLEdBQWU7OzJCQUNmLElBQUEsR0FBTTs7MkJBQ04sT0FBQSxHQUFTOzsyQkFDVCxTQUFBLEdBQVc7O0lBRVgsWUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLEdBQUQ7QUFDUixVQUFBO01BRFUseUJBQVUsMkJBQVcsZUFBSzthQUNwQyxJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO09BQUwsRUFBNkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUMzQixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO1dBQUwsRUFBNkIsU0FBQTtZQUMzQixLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO2NBQXdCLE1BQUEsRUFBUSxjQUFoQzthQUFMO1lBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sYUFBUDtjQUFzQixNQUFBLEVBQU8sU0FBN0I7YUFBTDtZQUNBLFFBQUEsR0FBVyxRQUFBLElBQWdCLElBQUEsUUFBQSxDQUFTO2NBQUMsV0FBQSxTQUFEO2NBQVksS0FBQSxHQUFaO2NBQWlCLElBQUEsRUFBakI7YUFBVDttQkFDM0IsS0FBQyxDQUFBLE9BQUQsQ0FBUyxVQUFULEVBQXFCLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBQXJCO1VBSjJCLENBQTdCO1FBRDJCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QjtJQURROztJQVFWLFlBQUMsQ0FBQSxrQkFBRCxHQUFxQixTQUFBO0FBQ25CLGFBQU8sUUFBUSxDQUFDLGtCQUFULENBQUE7SUFEWTs7MkJBR3JCLFVBQUEsR0FBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxtQkFBQSxDQUFBO2FBQ3JCLElBQUMsQ0FBQSxrQkFBRCxDQUFBO0lBRlU7OzJCQUlaLE9BQUEsR0FBUyxTQUFDLFlBQUQ7TUFDUCxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtNQUNBLElBQXVCLElBQUMsQ0FBQSxRQUFELElBQWMsQ0FBSSxZQUF6QztlQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFBLEVBQUE7O0lBRk87OztBQUtUOzs7OzJCQUlBLGtCQUFBLEdBQW9CLFNBQUE7YUFDbEIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEVBQVYsQ0FBYSxRQUFiLEVBQXVCLElBQUMsQ0FBQSxjQUF4QjtJQURrQjs7MkJBR3BCLGtCQUFBLEdBQW9CLFNBQUE7YUFDbEIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEdBQVYsQ0FBYyxRQUFkLEVBQXdCLElBQUMsQ0FBQSxjQUF6QjtJQURrQjs7MkJBR3BCLGNBQUEsR0FBZ0IsU0FBQTthQUNkLElBQUMsQ0FBQSxRQUFRLENBQUMsZUFBVixDQUFBO0lBRGM7OztBQUloQjs7OzsyQkFJQSxLQUFBLEdBQU8sU0FBQTtBQUNMLFVBQUE7O1lBQVMsQ0FBRSxLQUFYLENBQUE7O2FBQ0Esc0NBQUE7SUFGSzs7MkJBSVAsSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBOztZQUFTLENBQUUsSUFBWCxDQUFBOzthQUNBLHFDQUFBO0lBRkk7OzJCQUlOLElBQUEsR0FBTSxTQUFBO3NDQUNKLGlCQUFBLGlCQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7SUFEZDs7MkJBR04sSUFBQSxHQUFNLFNBQUMsT0FBRDtBQUNKLFVBQUE7TUFBQSxJQUFHLGNBQUEsSUFBbUIsT0FBdEI7UUFDRSxJQUFHLElBQUEsR0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQWYsQ0FBMkIsY0FBM0IsQ0FBVjtVQUNFLElBQUcsWUFBQSxHQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFsQjtZQUNFLElBQUcsY0FBQSxLQUFrQixZQUFyQjtjQUNFLGNBQUEsR0FBaUIsYUFEbkI7YUFERjs7VUFHQSxJQUFJLENBQUMsWUFBTCxDQUFrQixjQUFsQjtVQUNBLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixjQUFuQixDQUFrQyxDQUFDLEtBQW5DLENBQUE7aUJBQ0EsY0FBQSxHQUFpQixLQU5uQjtTQURGOztJQURJOzsyQkFVTixNQUFBLEdBQVEsU0FBQTtNQUNOLElBQVUsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFWO0FBQUEsZUFBQTs7TUFFQSxJQUFHLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBSDtlQUNFLElBQUMsQ0FBQSxJQUFELENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBSEY7O0lBSE07OzJCQVFSLFdBQUEsR0FBYSxTQUFBO0FBQ1gsVUFBQTtNQUFBLElBQUEsQ0FBYyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQWQ7QUFBQSxlQUFBOztNQUVBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQUEsQ0FBSDtRQUNFLElBQUMsQ0FBQSxJQUFELENBQUE7UUFDQSxJQUFHLGNBQUg7VUFDRSxJQUFHLElBQUEsR0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQWYsQ0FBMkIsY0FBM0IsQ0FBVjtZQUNFLElBQUksQ0FBQyxZQUFMLENBQWtCLGNBQWxCO1lBQ0EsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLGNBQW5CLENBQWtDLENBQUMsS0FBbkMsQ0FBQTttQkFDQSxjQUFBLEdBQWlCLEtBSG5CO1dBREY7U0FGRjtPQUFBLE1BQUE7O1VBUUUsaUJBQWtCLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTs7ZUFDbEIsSUFBQyxDQUFBLEtBQUQsQ0FBQSxFQVRGOztJQUhXOzsyQkFjYixTQUFBLEdBQVcsU0FBQyxJQUFELEVBQU8sT0FBUCxFQUFnQixJQUFoQjtBQUNULFVBQUE7TUFBQSxJQUFHLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBYixDQUFBLEdBQXdCLENBQTNCO1FBQ0UsSUFBQSxHQUFPLE9BQUEsR0FBVSxLQURuQjs7TUFHQSxNQUFBLEdBQVMsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLFFBQWYsQ0FBd0IseUJBQUEsR0FBMEIsSUFBbEQ7TUFDVCxNQUFNLENBQUMsS0FBUCxDQUFhLE9BQWI7TUFDQSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQUEsQ0FBRSxxQkFBQSxHQUFzQixJQUF0QixHQUEyQixZQUE3QixDQUFkO01BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLE1BQWhCO2FBQ0E7SUFUUzs7MkJBV1gsV0FBQSxHQUFhLFNBQUE7QUFDWCxhQUFPLElBQUMsQ0FBQTtJQURHOzsyQkFHYixTQUFBLEdBQVcsU0FBQTtBQUNULGFBQU8sSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQUE7SUFERTs7MkJBR1gsV0FBQSxHQUFhLFNBQUE7QUFDWCxhQUFPLElBQUMsQ0FBQTtJQURHOzsyQkFHYixVQUFBLEdBQVksU0FBQTtBQUNWLGFBQU8sSUFBQyxDQUFBLFFBQVEsQ0FBQyxVQUFWLENBQUE7SUFERzs7OztLQTNHYTtBQVIzQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuVGVybWluYWwgPSByZXF1aXJlICcuL3Rlcm1pbmFsJ1xuXG5sYXN0QWN0aXZlSXRlbSA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVGVybWluYWxWaWV3IGV4dGVuZHMgVmlld1xuICBzdWJzY3JpcHRpb25zOiBudWxsXG4gIGNvcmU6IG51bGxcbiAgZW1pdHRlcjogbnVsbFxuICBhbmltYXRpbmc6IGZhbHNlXG5cbiAgQGNvbnRlbnQ6ICh7dGVybWluYWwsIHNoZWxsUGF0aCwgcHdkLCBpZH0pIC0+XG4gICAgQGRpdiBjbGFzczogJ3Rlcm1pbmFsLXBsdXMnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ3Rlcm1pbmFsLXZpZXcnLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAncGFuZWwtZGl2aWRlcicsIG91dGxldDogJ3BhbmVsRGl2aWRlcidcbiAgICAgICAgQGRpdiBjbGFzczogJ2J0bi10b29sYmFyJywgb3V0bGV0Oid0b29sYmFyJ1xuICAgICAgICB0ZXJtaW5hbCA9IHRlcm1pbmFsIG9yIG5ldyBUZXJtaW5hbCh7c2hlbGxQYXRoLCBwd2QsIGlkfSlcbiAgICAgICAgQHN1YnZpZXcgJ3Rlcm1pbmFsJywgdGVybWluYWwuc2V0UGFyZW50Vmlldyh0aGlzKVxuXG4gIEBnZXRGb2N1c2VkVGVybWluYWw6IC0+XG4gICAgcmV0dXJuIFRlcm1pbmFsLmdldEZvY3VzZWRUZXJtaW5hbCgpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBAYXR0YWNoV2luZG93RXZlbnRzKClcblxuICBkZXN0cm95OiAoa2VlcFRlcm1pbmFsKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEB0ZXJtaW5hbC5kZXN0cm95KCkgaWYgQHRlcm1pbmFsIGFuZCBub3Qga2VlcFRlcm1pbmFsXG5cblxuICAjIyNcbiAgU2VjdGlvbjogV2luZG93IEV2ZW50c1xuICAjIyNcblxuICBhdHRhY2hXaW5kb3dFdmVudHM6IC0+XG4gICAgJCh3aW5kb3cpLm9uICdyZXNpemUnLCBAb25XaW5kb3dSZXNpemVcblxuICBkZXRhY2hXaW5kb3dFdmVudHM6IC0+XG4gICAgJCh3aW5kb3cpLm9mZiAncmVzaXplJywgQG9uV2luZG93UmVzaXplXG5cbiAgb25XaW5kb3dSZXNpemU6ID0+XG4gICAgQHRlcm1pbmFsLnJlY2FsaWJyYXRlU2l6ZSgpXG5cblxuICAjIyNcbiAgU2VjdGlvbjogRXh0ZXJuYWwgTWV0aG9kc1xuICAjIyNcblxuICBmb2N1czogPT5cbiAgICBAdGVybWluYWw/LmZvY3VzKClcbiAgICBzdXBlcigpXG5cbiAgYmx1cjogPT5cbiAgICBAdGVybWluYWw/LmJsdXIoKVxuICAgIHN1cGVyKClcblxuICBvcGVuOiA9PlxuICAgIGxhc3RBY3RpdmVJdGVtID89IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gIGhpZGU6IChyZWZvY3VzKSA9PlxuICAgIGlmIGxhc3RBY3RpdmVJdGVtIGFuZCByZWZvY3VzXG4gICAgICBpZiBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0obGFzdEFjdGl2ZUl0ZW0pXG4gICAgICAgIGlmIGFjdGl2ZUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICAgIGlmIGxhc3RBY3RpdmVJdGVtICE9IGFjdGl2ZUVkaXRvclxuICAgICAgICAgICAgbGFzdEFjdGl2ZUl0ZW0gPSBhY3RpdmVFZGl0b3JcbiAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0gbGFzdEFjdGl2ZUl0ZW1cbiAgICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGxhc3RBY3RpdmVJdGVtKS5mb2N1cygpXG4gICAgICAgIGxhc3RBY3RpdmVJdGVtID0gbnVsbFxuXG4gIHRvZ2dsZTogLT5cbiAgICByZXR1cm4gaWYgQGlzQW5pbWF0aW5nKClcblxuICAgIGlmIEBpc1Zpc2libGUoKVxuICAgICAgQGhpZGUoKVxuICAgIGVsc2VcbiAgICAgIEBvcGVuKClcblxuICB0b2dnbGVGb2N1czogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc1Zpc2libGUoKVxuXG4gICAgaWYgQHRlcm1pbmFsLmlzRm9jdXNlZCgpXG4gICAgICBAYmx1cigpXG4gICAgICBpZiBsYXN0QWN0aXZlSXRlbVxuICAgICAgICBpZiBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0obGFzdEFjdGl2ZUl0ZW0pXG4gICAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0gbGFzdEFjdGl2ZUl0ZW1cbiAgICAgICAgICBhdG9tLnZpZXdzLmdldFZpZXcobGFzdEFjdGl2ZUl0ZW0pLmZvY3VzKClcbiAgICAgICAgICBsYXN0QWN0aXZlSXRlbSA9IG51bGxcbiAgICBlbHNlXG4gICAgICBsYXN0QWN0aXZlSXRlbSA/PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIEBmb2N1cygpXG5cbiAgYWRkQnV0dG9uOiAoc2lkZSwgb25DbGljaywgaWNvbikgLT5cbiAgICBpZiBpY29uLmluZGV4T2YoJ2ljb24tJykgPCAwXG4gICAgICBpY29uID0gJ2ljb24tJyArIGljb25cblxuICAgIGJ1dHRvbiA9ICQoXCI8YnV0dG9uLz5cIikuYWRkQ2xhc3MoXCJidG4gaW5saW5lLWJsb2NrLXRpZ2h0ICN7c2lkZX1cIilcbiAgICBidXR0b24uY2xpY2sob25DbGljaylcbiAgICBidXR0b24uYXBwZW5kICQoXCI8c3BhbiBjbGFzcz1cXFwiaWNvbiAje2ljb259XFxcIj48L3NwYW4+XCIpXG5cbiAgICBAdG9vbGJhci5hcHBlbmQgYnV0dG9uXG4gICAgYnV0dG9uXG5cbiAgaXNBbmltYXRpbmc6IC0+XG4gICAgcmV0dXJuIEBhbmltYXRpbmdcblxuICBpc0ZvY3VzZWQ6IC0+XG4gICAgcmV0dXJuIEB0ZXJtaW5hbC5pc0ZvY3VzZWQoKVxuXG4gIGdldFRlcm1pbmFsOiAtPlxuICAgIHJldHVybiBAdGVybWluYWxcblxuICBnZXREaXNwbGF5OiAtPlxuICAgIHJldHVybiBAdGVybWluYWwuZ2V0RGlzcGxheSgpXG4iXX0=
