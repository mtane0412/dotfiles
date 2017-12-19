(function() {
  var DotinstallNavigationView, DotinstallPaneView, shell,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.$ = window.jQuery = require('../node_modules/jquery');

  shell = require('shell');

  DotinstallNavigationView = require('./dotinstall-navigation-view.coffee');

  module.exports = DotinstallPaneView = (function() {
    DotinstallPaneView.HANDLE_WIDTH = 8;

    DotinstallPaneView.DEFAULT_PANE_WIDTH = 640;

    DotinstallPaneView.USER_AGENT = 'DotinstallAtomPane/1.0.2';

    function DotinstallPaneView(serializedState) {
      this.stopLoading = __bind(this.stopLoading, this);
      this.startLoading = __bind(this.startLoading, this);
      this.fitHeight = __bind(this.fitHeight, this);
      this.resizeDotinstallStopped = __bind(this.resizeDotinstallStopped, this);
      this.resizeDotinstallPane = __bind(this.resizeDotinstallPane, this);
      this.resizeDotinstallStarted = __bind(this.resizeDotinstallStarted, this);
      var $element, $help, $main, $resizeHandle, url;
      this.resizing = false;
      this.element = document.createElement('div');
      this.webview = document.createElement('webview');
      this.webview.setAttribute('useragent', DotinstallPaneView.USER_AGENT);
      this.webview.addEventListener('new-window', (function(_this) {
        return function(e) {
          if (/^https?:\/\/dotinstall\.com\/(?!help\/415$)/.test(e.url)) {
            return _this.webview.src = e.url;
          } else {
            return shell.openExternal(e.url);
          }
        };
      })(this));
      this.webview.addEventListener('did-start-loading', (function(_this) {
        return function() {
          return _this.startLoading();
        };
      })(this));
      this.webview.addEventListener('did-stop-loading', (function(_this) {
        return function() {
          _this.navigation.setCanGoBack(_this.webview.canGoBack());
          _this.navigation.setCanGoForward(_this.webview.canGoForward());
          return _this.stopLoading();
        };
      })(this));
      $element = $(this.element).addClass('dotinstall-pane');
      $main = $('<div>').attr('id', 'dotinstall_pane_main').appendTo($element);
      $help = $('<div>').attr('id', 'dotinstall_pane_help').append($('<div class="help-body">').html(this.helpHtml())).on('click', function() {
        return $(this).fadeOut();
      }).appendTo($element);
      this.navigation = new DotinstallNavigationView(this.webview, $help);
      $main.append(this.navigation.getElement());
      if ((serializedState != null) && (serializedState.pane_width != null)) {
        this.paneWidth = serializedState.pane_width;
      } else {
        this.paneWidth = DotinstallPaneView.DEFAULT_PANE_WIDTH;
      }
      $('.dotinstall-pane').width(this.paneWidth);
      $main.width(this.paneWidth - DotinstallPaneView.HANDLE_WIDTH);
      url = 'http://dotinstall.com';
      if ((serializedState != null) && (serializedState.src != null)) {
        url = serializedState.src;
      }
      $(this.webview).attr('id', 'dotinstall_view').addClass('native-key-bindings').attr('src', url).appendTo($main);
      $resizeHandle = $('<div>').attr('id', 'dotinstall_resize_handle').on('mousedown', this.resizeDotinstallStarted).appendTo($element);
      this.loadingBar = $('<div>').attr('id', 'dotinstall_loading_bar').appendTo($main);
      $(document).on('mousemove', this.resizeDotinstallPane);
      $(document).on('mouseup', this.resizeDotinstallStopped);
      $(window).on('resize', this.fitHeight);
    }

    DotinstallPaneView.prototype.serialize = function() {
      return {
        src: this.webview.src,
        pane_width: this.paneWidth
      };
    };

    DotinstallPaneView.prototype.destroy = function() {
      return this.element.remove();
    };

    DotinstallPaneView.prototype.getElement = function() {
      return this.element;
    };

    DotinstallPaneView.prototype.reload = function() {
      return this.webview.reload();
    };

    DotinstallPaneView.prototype.resizeDotinstallStarted = function() {
      return this.resizing = true;
    };

    DotinstallPaneView.prototype.resizeDotinstallPane = function(_arg) {
      var pageX, paneWidth, which;
      pageX = _arg.pageX, which = _arg.which;
      if (!(this.resizing && which === 1)) {
        return;
      }
      paneWidth = pageX;
      if (paneWidth < 510) {
        paneWidth = 510;
      }
      $('.dotinstall-pane').width(paneWidth);
      $('#dotinstall_pane_main').width(paneWidth - DotinstallPaneView.HANDLE_WIDTH);
      return this.paneWidth = paneWidth;
    };

    DotinstallPaneView.prototype.resizeDotinstallStopped = function() {
      if (!this.resizing) {
        return;
      }
      return this.resizing = false;
    };

    DotinstallPaneView.prototype.fitHeight = function() {
      return $(this.webview).height($('.dotinstall-pane').height());
    };

    DotinstallPaneView.prototype.startLoading = function() {
      var width;
      this.navigation.startLoading();
      width = 40 + Math.floor(Math.random() * 20);
      return this.loadingBar.show().animate({
        width: "" + width + "%"
      }, 550);
    };

    DotinstallPaneView.prototype.stopLoading = function() {
      this.navigation.stopLoading();
      return this.loadingBar.animate({
        width: '100%'
      }, 180, (function(_this) {
        return function() {
          return _this.loadingBar.hide().width(0);
        };
      })(this));
    };

    DotinstallPaneView.prototype.helpHtml = function() {
      return ['<div class="close-help"><i class="fa fa-times fa-2x"></i></div>', '<dl>', '<dt>Open/Close</dt>', '<dd>Alt (Option) + Shift + D</dd>', '<dt>Play/Pause</dt>', '<dd>Alt (Option) + Shift + Enter</dd>', '<dt>Rewind 5 sec (5秒戻る)</dt>', '<dd>Alt (Option) + Shift + [</dd>', '<dt>Forword 5 sec (5秒進む)</dt>', '<dd>Alt (Option) + Shift + ]</dd>', '</dl>', '<p class="more-info">', '<a href="https://atom.io/packages/dotinstall-pane" target="_blank">https://atom.io/packages/dotinstall-pane</a>', '</p>'].join('');
    };

    return DotinstallPaneView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvZG90aW5zdGFsbC1wYW5lL2xpYi9kb3RpbnN0YWxsLXBhbmUtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbURBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxDQUFQLEdBQVcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsT0FBQSxDQUFRLHdCQUFSLENBQTNCLENBQUE7O0FBQUEsRUFDQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVIsQ0FEUixDQUFBOztBQUFBLEVBR0Esd0JBQUEsR0FBMkIsT0FBQSxDQUFRLHFDQUFSLENBSDNCLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxrQkFBQyxDQUFBLFlBQUQsR0FBc0IsQ0FBdEIsQ0FBQTs7QUFBQSxJQUNBLGtCQUFDLENBQUEsa0JBQUQsR0FBc0IsR0FEdEIsQ0FBQTs7QUFBQSxJQUVBLGtCQUFDLENBQUEsVUFBRCxHQUFzQiwwQkFGdEIsQ0FBQTs7QUFJYSxJQUFBLDRCQUFDLGVBQUQsR0FBQTtBQUNYLHVEQUFBLENBQUE7QUFBQSx5REFBQSxDQUFBO0FBQUEsbURBQUEsQ0FBQTtBQUFBLCtFQUFBLENBQUE7QUFBQSx5RUFBQSxDQUFBO0FBQUEsK0VBQUEsQ0FBQTtBQUFBLFVBQUEsMENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksS0FBWixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBRCxHQUFZLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBRFosQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQUQsR0FBWSxRQUFRLENBQUMsYUFBVCxDQUF1QixTQUF2QixDQUZaLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFB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

//# sourceURL=/Users/tane/.atom/packages/dotinstall-pane/lib/dotinstall-pane-view.coffee
