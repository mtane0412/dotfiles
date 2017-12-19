(function() {
  var DotinstallNavigationView, DotinstallPaneView, shell,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.$ = window.jQuery = require('../node_modules/jquery');

  shell = require('shell');

  DotinstallNavigationView = require('./dotinstall-navigation-view.coffee');

  module.exports = DotinstallPaneView = (function() {
    DotinstallPaneView.HANDLE_WIDTH = 8;

    DotinstallPaneView.DEFAULT_PANE_WIDTH = 640;

    DotinstallPaneView.USER_AGENT = 'DotinstallAtomPane/1.0.3';

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
      this.webview.setAttribute('useragent', window.navigator.userAgent + ' ' + DotinstallPaneView.USER_AGENT);
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
