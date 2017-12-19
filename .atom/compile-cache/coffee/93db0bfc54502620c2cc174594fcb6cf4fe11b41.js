(function() {
  var CompositeDisposable, DotinstallPane, DotinstallPaneView;

  DotinstallPaneView = require('./dotinstall-pane-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = DotinstallPane = {
    dotinstallPaneView: null,
    leftPanel: null,
    subscriptions: null,
    DOMAIN: 'dotinstall.com',
    activate: function(state) {
      this.dotinstallPaneView = new DotinstallPaneView(state.dotinstallPaneViewState);
      this.leftPanel = atom.workspace.addLeftPanel({
        item: this.dotinstallPaneView.getElement(),
        visible: false,
        priority: 0
      });
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'dotinstall-pane:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'dotinstall-pane:reload': (function(_this) {
          return function() {
            return _this.reload();
          };
        })(this),
        'dotinstall-pane:search': (function(_this) {
          return function() {
            return _this.search();
          };
        })(this),
        'dotinstall-pane:play': (function(_this) {
          return function() {
            return _this.play();
          };
        })(this),
        'dotinstall-pane:forwardTo': (function(_this) {
          return function() {
            return _this.forwardTo();
          };
        })(this),
        'dotinstall-pane:rewindTo': (function(_this) {
          return function() {
            return _this.rewindTo();
          };
        })(this)
      }));
    },
    deactivate: function() {
      this.leftPanel.destroy();
      this.subscriptions.dispose();
      return this.dotinstallPaneView.destroy();
    },
    serialize: function() {
      return {
        dotinstallPaneViewState: this.dotinstallPaneView.serialize()
      };
    },
    toggle: function() {
      if (this.leftPanel.isVisible()) {
        return this.leftPanel.hide();
      } else {
        this.leftPanel.show();
        return this.dotinstallPaneView.fitHeight();
      }
    },
    reload: function() {
      return this.dotinstallPaneView.reload();
    },
    search: function() {
      var e, q, url;
      e = atom.workspace.getActiveTextEditor();
      if (e == null) {
        return;
      }
      if (e.getSelectedText().length > 0) {
        q = encodeURIComponent(e.getSelectedText());
        url = "http://" + this.DOMAIN + "/search?q=" + q;
        if (!this.leftPanel.isVisible()) {
          this.leftPanel.show();
        }
        return this.dotinstallPaneView.webview.src = url;
      }
    },
    play: function() {
      return this.dotinstallPaneView.webview.executeJavaScript('Dotinstall.videoController.playOrPause()');
    },
    forwardTo: function() {
      return this.dotinstallPaneView.webview.executeJavaScript('Dotinstall.videoController.forwardTo(5)');
    },
    rewindTo: function() {
      return this.dotinstallPaneView.webview.executeJavaScript('Dotinstall.videoController.rewindTo(5)');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvZG90aW5zdGFsbC1wYW5lL2xpYi9kb3RpbnN0YWxsLXBhbmUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVEQUFBOztBQUFBLEVBQUEsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLHdCQUFSLENBQXJCLENBQUE7O0FBQUEsRUFDQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGNBQUEsR0FDZjtBQUFBLElBQUEsa0JBQUEsRUFBb0IsSUFBcEI7QUFBQSxJQUNBLFNBQUEsRUFBVyxJQURYO0FBQUEsSUFFQSxhQUFBLEVBQWUsSUFGZjtBQUFBLElBR0EsTUFBQSxFQUFRLGdCQUhSO0FBQUEsSUFLQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxrQkFBRCxHQUEwQixJQUFBLGtCQUFBLENBQW1CLEtBQUssQ0FBQyx1QkFBekIsQ0FBMUIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQWYsQ0FDVDtBQUFBLFFBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxVQUFwQixDQUFBLENBQU47QUFBQSxRQUNBLE9BQUEsRUFBUyxLQURUO0FBQUEsUUFFQSxRQUFBLEVBQVUsQ0FGVjtPQURTLENBRGIsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQVJqQixDQUFBO2FBV0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7QUFBQSxRQUNyRCx3QkFBQSxFQUEwQixDQUFB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

//# sourceURL=/Users/tane/.atom/packages/dotinstall-pane/lib/dotinstall-pane.coffee
