(function() {
  var DotinstallNavigationView,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.$ = window.jQuery = require('../node_modules/jquery');

  module.exports = DotinstallNavigationView = (function() {
    function DotinstallNavigationView(webview, help) {
      this.stopLoading = __bind(this.stopLoading, this);
      this.startLoading = __bind(this.startLoading, this);
      this.openHelp = __bind(this.openHelp, this);
      this.webview = webview;
      this.help = help;
      this.element = $('<div>').addClass('dotinstall-navigation');
      this.backButton = this.createBackButton();
      this.forwardButton = this.createForwardButton();
      this.reloadButton = this.createReloadButton();
      this.helpButton = this.createHelpButton();
      this.element.append(this.backButton).append(this.forwardButton).append(this.reloadButton).append(this.helpButton);
    }

    DotinstallNavigationView.prototype.createBackButton = function() {
      return this.createButton().addClass('disabled').append('<i class="fa fa-chevron-left">').on('click', (function(_this) {
        return function() {
          return _this.goBack();
        };
      })(this));
    };

    DotinstallNavigationView.prototype.createForwardButton = function() {
      return this.createButton().addClass('disabled').append('<i class="fa fa-chevron-right">').on('click', (function(_this) {
        return function() {
          return _this.goForward();
        };
      })(this));
    };

    DotinstallNavigationView.prototype.createReloadButton = function() {
      return this.createButton().append('<i class="fa fa-refresh">').on('click', (function(_this) {
        return function() {
          return _this.reload();
        };
      })(this));
    };

    DotinstallNavigationView.prototype.createHelpButton = function() {
      return this.createButton().addClass('pull-right').addClass('help-button').append('<i class="fa fa-question fa-lg">').on('click', (function(_this) {
        return function() {
          return _this.openHelp();
        };
      })(this));
    };

    DotinstallNavigationView.prototype.createButton = function() {
      return $('<button>').addClass('dotinstall-navigation-back').on('mousedown', function() {
        return $(this).addClass('pushed');
      }).on('mouseup', function() {
        return $(this).removeClass('pushed');
      }).on('mouseleave', function() {
        return $(this).removeClass('pushed');
      });
    };

    DotinstallNavigationView.prototype.getElement = function() {
      return this.element;
    };

    DotinstallNavigationView.prototype.goBack = function() {
      return this.webview.executeJavaScript('history.back()');
    };

    DotinstallNavigationView.prototype.goForward = function() {
      return this.webview.executeJavaScript('history.forward()');
    };

    DotinstallNavigationView.prototype.reload = function() {
      return this.webview.executeJavaScript('location.reload()');
    };

    DotinstallNavigationView.prototype.openHelp = function() {
      return this.help.fadeIn();
    };

    DotinstallNavigationView.prototype.startLoading = function() {
      return this.reloadButton.find('i').addClass('fa-spin');
    };

    DotinstallNavigationView.prototype.stopLoading = function() {
      return this.reloadButton.find('i').removeClass('fa-spin');
    };

    DotinstallNavigationView.prototype.setCanGoBack = function(can) {
      if (can) {
        return this.backButton.removeClass('disabled');
      } else {
        return this.backButton.addClass('disabled');
      }
    };

    DotinstallNavigationView.prototype.setCanGoForward = function(can) {
      if (can) {
        return this.forwardButton.removeClass('disabled');
      } else {
        return this.forwardButton.addClass('disabled');
      }
    };

    return DotinstallNavigationView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvZG90aW5zdGFsbC1wYW5lL2xpYi9kb3RpbnN0YWxsLW5hdmlnYXRpb24tdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0JBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxDQUFQLEdBQVcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsT0FBQSxDQUFRLHdCQUFSLENBQTNCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxrQ0FBQyxPQUFELEVBQVUsSUFBVixHQUFBO0FBQ1gsdURBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSxpREFBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLE9BQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLElBQUQsR0FBVyxJQURYLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxPQUFELEdBQVcsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLFFBQVgsQ0FBb0IsdUJBQXBCLENBSFgsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFVBQUQsR0FBaUIsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FMakIsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBQyxDQUFBLG1CQUFELENBQUEsQ0FOakIsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLFlBQUQsR0FBaUIsSUFBQyxDQUFBLGtCQUFELENBQUEsQ0FQakIsQ0FBQTtBQUFBLE1BUUEsSUFBQyxDQUFBLFVBQUQsR0FBaUIsSUFBQyxDQUFBLGdCQUFELENBQUEsQ0FSakIsQ0FBQTtBQUFBLE1BVUEsSUFBQyxDQUFBLE9BQ0MsQ0FBQyxNQURILENBQ1UsSUFBQyxDQUFBLFVBRFgsQ0FFRSxDQUFDLE1BRkgs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

//# sourceURL=/Users/tane/.atom/packages/dotinstall-pane/lib/dotinstall-navigation-view.coffee
