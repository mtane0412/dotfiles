(function() {
  var $, CompositeDisposable, PanelView, TerminalView, defaultHeight, lastOpenedTerminal,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  $ = require('atom-space-pen-views').$;

  TerminalView = require('./terminal-view');

  lastOpenedTerminal = null;

  defaultHeight = (function() {
    var bottomHeight, height, percent;
    height = atom.config.get('terminal-plus.style.defaultPanelHeight');
    if (height.indexOf('%') > 0) {
      percent = Math.abs(Math.min(parseFloat(height) / 100.0, 1));
      bottomHeight = $('atom-panel.bottom').children(".terminal-view").height() || 0;
      height = percent * ($('.item-views').height() + bottomHeight);
    }
    return height;
  })();

  module.exports = PanelView = (function(superClass) {
    extend(PanelView, superClass);

    function PanelView() {
      this.toggleFullscreen = bind(this.toggleFullscreen, this);
      this.hide = bind(this.hide, this);
      this.open = bind(this.open, this);
      this.resizePanel = bind(this.resizePanel, this);
      this.resizeStopped = bind(this.resizeStopped, this);
      this.resizeStarted = bind(this.resizeStarted, this);
      this.onWindowResize = bind(this.onWindowResize, this);
      this.destroy = bind(this.destroy, this);
      return PanelView.__super__.constructor.apply(this, arguments);
    }

    PanelView.prototype.animating = false;

    PanelView.prototype.windowHeight = atom.getSize().height;

    PanelView.getFocusedTerminal = function() {
      return TerminalView.getFocusedTerminal();
    };

    PanelView.prototype.initialize = function(options) {
      PanelView.__super__.initialize.call(this, options);
      this.addDefaultButtons();
      this.terminal.showIcon();
      this.updateName(this.terminal.getName());
      this.attachResizeEvents();
      return this.attach();
    };

    PanelView.prototype.destroy = function(arg) {
      var keepTerminal;
      keepTerminal = (arg != null ? arg : {}).keepTerminal;
      this.detachResizeEvents();
      if (this.panel.isVisible() && !keepTerminal) {
        this.onTransitionEnd((function(_this) {
          return function() {
            return _this.panel.destroy();
          };
        })(this));
        this.hide();
      } else {
        this.panel.destroy();
      }
      return PanelView.__super__.destroy.call(this, keepTerminal);
    };


    /*
    Section: Setup
     */

    PanelView.prototype.addDefaultButtons = function() {
      this.closeBtn = this.addButton('right', this.destroy, 'x');
      this.hideBtn = this.addButton('right', this.hide, 'chevron-down');
      this.fullscreenBtn = this.addButton('right', this.toggleFullscreen, 'screen-full');
      this.inputBtn = this.addButton('left', this.promptForInput, 'keyboard');
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close'
      }));
      this.subscriptions.add(atom.tooltips.add(this.hideBtn, {
        title: 'Hide'
      }));
      this.subscriptions.add(atom.tooltips.add(this.fullscreenBtn, {
        title: 'Maximize'
      }));
      return this.subscriptions.add(atom.tooltips.add(this.inputBtn, {
        title: 'Insert Text'
      }));
    };

    PanelView.prototype.attach = function() {
      if (this.panel != null) {
        return;
      }
      return this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
    };


    /*
    Section: Resizing
     */

    PanelView.prototype.attachResizeEvents = function() {
      return this.panelDivider.on('mousedown', this.resizeStarted);
    };

    PanelView.prototype.detachResizeEvents = function() {
      return this.panelDivider.off('mousedown');
    };

    PanelView.prototype.onWindowResize = function(event) {
      var delta, lines, newHeight, offset;
      this.terminal.disableAnimation();
      delta = atom.getSize().height - this.windowHeight;
      if (lines = delta / this.terminal.getRowHeight() | 0) {
        offset = lines * this.terminal.getRowHeight();
        newHeight = this.terminal.height() + offset;
        if (newHeight >= this.terminal.getRowHeight()) {
          this.terminal.height(newHeight);
          this.maxHeight += offset;
          this.windowHeight += offset;
        } else {
          this.terminal.height(this.terminal.getRowHeight());
        }
      }
      this.terminal.enableAnimation();
      return PanelView.__super__.onWindowResize.call(this);
    };

    PanelView.prototype.resizeStarted = function() {
      if (this.maximized) {
        return;
      }
      this.maxHeight = this.terminal.getPrevHeight() + $('.item-views').height();
      $(document).on('mousemove', this.resizePanel);
      $(document).on('mouseup', this.resizeStopped);
      return this.terminal.disableAnimation();
    };

    PanelView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizePanel);
      $(document).off('mouseup', this.resizeStopped);
      return this.terminal.enableAnimation();
    };

    PanelView.prototype.resizePanel = function(event) {
      var clamped, delta, mouseY, nearestRow;
      if (event.which !== 1) {
        return this.resizeStopped();
      }
      mouseY = $(window).height() - event.pageY;
      delta = mouseY - $('atom-panel-container.bottom').height();
      if (!(Math.abs(delta) > (this.terminal.getRowHeight() * 5 / 6))) {
        return;
      }
      nearestRow = this.nearestRow(this.terminal.height() + delta);
      clamped = Math.max(nearestRow, this.terminal.getRowHeight());
      if (clamped > this.maxHeight) {
        return;
      }
      this.terminal.height(clamped);
      return this.terminal.recalibrateSize();
    };


    /*
    Section: External Methods
     */

    PanelView.prototype.open = function() {
      PanelView.__super__.open.call(this);
      this.terminal.getStatusIcon().activate();
      if (lastOpenedTerminal && lastOpenedTerminal !== this.terminal) {
        lastOpenedTerminal.getParentView().hide({
          refocus: false
        });
      }
      lastOpenedTerminal = this.terminal;
      this.onTransitionEnd((function(_this) {
        return function() {
          var height;
          if (_this.terminal.displayView()) {
            height = _this.nearestRow(_this.terminal.height());
            _this.terminal.height(height);
          }
          return _this.focus();
        };
      })(this));
      this.panel.show();
      this.terminal.height(0);
      this.animating = true;
      return this.terminal.height(this.terminal.getPrevHeight() || defaultHeight);
    };

    PanelView.prototype.hide = function(arg) {
      var refocus;
      refocus = (arg != null ? arg : {}).refocus;
      if (refocus == null) {
        refocus = true;
      }
      lastOpenedTerminal = null;
      this.terminal.getStatusIcon().deactivate();
      this.onTransitionEnd((function(_this) {
        return function() {
          _this.panel.hide();
          return PanelView.__super__.hide.call(_this, refocus);
        };
      })(this));
      this.terminal.height(this.terminal.getPrevHeight());
      this.animating = true;
      return this.terminal.height(0);
    };

    PanelView.prototype.updateName = function(name) {
      return this.terminal.getStatusIcon().setName(name);
    };

    PanelView.prototype.toggleFullscreen = function() {
      var tabView;
      this.destroy({
        keepTerminal: true
      });
      this.terminal.clearHeight().disableAnimation();
      tabView = new (require('./tab-view'))({
        terminal: this.terminal
      });
      tabView.toggle();
      return this.remove();
    };

    PanelView.prototype.isVisible = function() {
      return this.panel.isVisible();
    };


    /*
    Section: Helper Methods
     */

    PanelView.prototype.nearestRow = function(value) {
      var rowHeight;
      rowHeight = this.terminal.getRowHeight();
      return rowHeight * Math.round(value / rowHeight);
    };

    PanelView.prototype.onTransitionEnd = function(callback) {
      return this.terminal.one('webkitTransitionEnd', (function(_this) {
        return function() {
          callback();
          return _this.animating = false;
        };
      })(this));
    };

    return PanelView;

  })(TerminalView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvcGFuZWwtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtGQUFBO0lBQUE7Ozs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3ZCLElBQUssT0FBQSxDQUFRLHNCQUFSOztFQUVOLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBRWYsa0JBQUEsR0FBcUI7O0VBRXJCLGFBQUEsR0FBbUIsQ0FBQSxTQUFBO0FBQ2pCLFFBQUE7SUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQjtJQUNULElBQUcsTUFBTSxDQUFDLE9BQVAsQ0FBZSxHQUFmLENBQUEsR0FBc0IsQ0FBekI7TUFDRSxPQUFBLEdBQVUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLFVBQUEsQ0FBVyxNQUFYLENBQUEsR0FBcUIsS0FBOUIsRUFBcUMsQ0FBckMsQ0FBVDtNQUNWLFlBQUEsR0FBZSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxRQUF2QixDQUFnQyxnQkFBaEMsQ0FBaUQsQ0FBQyxNQUFsRCxDQUFBLENBQUEsSUFBOEQ7TUFDN0UsTUFBQSxHQUFTLE9BQUEsR0FBVSxDQUFDLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsTUFBakIsQ0FBQSxDQUFBLEdBQTRCLFlBQTdCLEVBSHJCOztBQUlBLFdBQU87RUFOVSxDQUFBLENBQUgsQ0FBQTs7RUFRaEIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozs7Ozs7Ozs7O3dCQUNKLFNBQUEsR0FBVzs7d0JBQ1gsWUFBQSxHQUFjLElBQUksQ0FBQyxPQUFMLENBQUEsQ0FBYyxDQUFDOztJQUU3QixTQUFDLENBQUEsa0JBQUQsR0FBcUIsU0FBQTtBQUNuQixhQUFPLFlBQVksQ0FBQyxrQkFB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QUFuQjtJQUZUOzt3QkFJWixlQUFBLEdBQWlCLFNBQUMsUUFBRDthQUNmLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLHFCQUFkLEVBQXFDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNuQyxRQUFBLENBQUE7aUJBQ0EsS0FBQyxDQUFBLFNBQUQsR0FBYTtRQUZzQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckM7SUFEZTs7OztLQXZLSztBQWhCeEIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xueyR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cblRlcm1pbmFsVmlldyA9IHJlcXVpcmUgJy4vdGVybWluYWwtdmlldydcblxubGFzdE9wZW5lZFRlcm1pbmFsID0gbnVsbFxuXG5kZWZhdWx0SGVpZ2h0ID0gZG8gLT5cbiAgaGVpZ2h0ID0gYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hbC1wbHVzLnN0eWxlLmRlZmF1bHRQYW5lbEhlaWdodCcpXG4gIGlmIGhlaWdodC5pbmRleE9mKCclJykgPiAwXG4gICAgcGVyY2VudCA9IE1hdGguYWJzKE1hdGgubWluKHBhcnNlRmxvYXQoaGVpZ2h0KSAvIDEwMC4wLCAxKSlcbiAgICBib3R0b21IZWlnaHQgPSAkKCdhdG9tLXBhbmVsLmJvdHRvbScpLmNoaWxkcmVuKFwiLnRlcm1pbmFsLXZpZXdcIikuaGVpZ2h0KCkgb3IgMFxuICAgIGhlaWdodCA9IHBlcmNlbnQgKiAoJCgnLml0ZW0tdmlld3MnKS5oZWlnaHQoKSArIGJvdHRvbUhlaWdodClcbiAgcmV0dXJuIGhlaWdodFxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQYW5lbFZpZXcgZXh0ZW5kcyBUZXJtaW5hbFZpZXdcbiAgYW5pbWF0aW5nOiBmYWxzZVxuICB3aW5kb3dIZWlnaHQ6IGF0b20uZ2V0U2l6ZSgpLmhlaWdodFxuXG4gIEBnZXRGb2N1c2VkVGVybWluYWw6IC0+XG4gICAgcmV0dXJuIFRlcm1pbmFsVmlldy5nZXRGb2N1c2VkVGVybWluYWwoKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIHN1cGVyKG9wdGlvbnMpXG5cbiAgICBAYWRkRGVmYXVsdEJ1dHRvbnMoKVxuXG4gICAgQHRlcm1pbmFsLnNob3dJY29uKClcbiAgICBAdXBkYXRlTmFtZShAdGVybWluYWwuZ2V0TmFtZSgpKVxuXG4gICAgQGF0dGFjaFJlc2l6ZUV2ZW50cygpXG4gICAgQGF0dGFjaCgpXG5cbiAgZGVzdHJveTogKHtrZWVwVGVybWluYWx9PXt9KSA9PlxuICAgIEBkZXRhY2hSZXNpemVFdmVudHMoKVxuXG4gICAgaWYgQHBhbmVsLmlzVmlzaWJsZSgpIGFuZCBub3Qga2VlcFRlcm1pbmFsXG4gICAgICBAb25UcmFuc2l0aW9uRW5kID0+XG4gICAgICAgIEBwYW5lbC5kZXN0cm95KClcbiAgICAgIEBoaWRlKClcbiAgICBlbHNlXG4gICAgICBAcGFuZWwuZGVzdHJveSgpXG5cbiAgICBzdXBlcihrZWVwVGVybWluYWwpXG5cbiAgIyMjXG4gIFNlY3Rpb246IFNldHVwXG4gICMjI1xuXG4gIGFkZERlZmF1bHRCdXR0b25zOiAtPlxuICAgIEBjbG9zZUJ0biA9IEBhZGRCdXR0b24gJ3JpZ2h0JywgQGRlc3Ryb3ksICd4J1xuICAgIEBoaWRlQnRuID0gQGFkZEJ1dHRvbiAncmlnaHQnLCBAaGlkZSwgJ2NoZXZyb24tZG93bidcbiAgICBAZnVsbHNjcmVlbkJ0biA9IEBhZGRCdXR0b24gJ3JpZ2h0JywgQHRvZ2dsZUZ1bGxzY3JlZW4sICdzY3JlZW4tZnVsbCdcbiAgICBAaW5wdXRCdG4gPSBAYWRkQnV0dG9uICdsZWZ0JywgQHByb21wdEZvcklucHV0LCAna2V5Ym9hcmQnXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGNsb3NlQnRuLFxuICAgICAgdGl0bGU6ICdDbG9zZSdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGhpZGVCdG4sXG4gICAgICB0aXRsZTogJ0hpZGUnXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBmdWxsc2NyZWVuQnRuLFxuICAgICAgdGl0bGU6ICdNYXhpbWl6ZSdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGlucHV0QnRuLFxuICAgICAgdGl0bGU6ICdJbnNlcnQgVGV4dCdcblxuICBhdHRhY2g6IC0+XG4gICAgcmV0dXJuIGlmIEBwYW5lbD9cbiAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcblxuXG4gICMjI1xuICBTZWN0aW9uOiBSZXNpemluZ1xuICAjIyNcblxuICBhdHRhY2hSZXNpemVFdmVudHM6IC0+XG4gICAgQHBhbmVsRGl2aWRlci5vbiAnbW91c2Vkb3duJywgQHJlc2l6ZVN0YXJ0ZWRcblxuICBkZXRhY2hSZXNpemVFdmVudHM6IC0+XG4gICAgQHBhbmVsRGl2aWRlci5vZmYgJ21vdXNlZG93bidcblxuICBvbldpbmRvd1Jlc2l6ZTogKGV2ZW50KSA9PlxuICAgIEB0ZXJtaW5hbC5kaXNhYmxlQW5pbWF0aW9uKClcbiAgICBkZWx0YSA9IGF0b20uZ2V0U2l6ZSgpLmhlaWdodCAtIEB3aW5kb3dIZWlnaHRcblxuICAgIGlmIGxpbmVzID0gKGRlbHRhIC8gQHRlcm1pbmFsLmdldFJvd0hlaWdodCgpfDApXG4gICAgICBvZmZzZXQgPSBsaW5lcyAqIEB0ZXJtaW5hbC5nZXRSb3dIZWlnaHQoKVxuICAgICAgbmV3SGVpZ2h0ID0gQHRlcm1pbmFsLmhlaWdodCgpICsgb2Zmc2V0XG5cbiAgICAgIGlmIG5ld0hlaWdodCA+PSBAdGVybWluYWwuZ2V0Um93SGVpZ2h0KClcbiAgICAgICAgQHRlcm1pbmFsLmhlaWdodCBuZXdIZWlnaHRcbiAgICAgICAgQG1heEhlaWdodCArPSBvZmZzZXRcbiAgICAgICAgQHdpbmRvd0hlaWdodCArPSBvZmZzZXRcbiAgICAgIGVsc2VcbiAgICAgICAgQHRlcm1pbmFsLmhlaWdodCBAdGVybWluYWwuZ2V0Um93SGVpZ2h0KClcblxuICAgIEB0ZXJtaW5hbC5lbmFibGVBbmltYXRpb24oKVxuICAgIHN1cGVyKClcblxuICByZXNpemVTdGFydGVkOiA9PlxuICAgIHJldHVybiBpZiBAbWF4aW1pemVkXG4gICAgQG1heEhlaWdodCA9IEB0ZXJtaW5hbC5nZXRQcmV2SGVpZ2h0KCkgKyAkKCcuaXRlbS12aWV3cycpLmhlaWdodCgpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIEByZXNpemVQYW5lbClcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsIEByZXNpemVTdG9wcGVkKVxuICAgIEB0ZXJtaW5hbC5kaXNhYmxlQW5pbWF0aW9uKClcblxuICByZXNpemVTdG9wcGVkOiA9PlxuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vtb3ZlJywgQHJlc2l6ZVBhbmVsKVxuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2V1cCcsIEByZXNpemVTdG9wcGVkKVxuICAgIEB0ZXJtaW5hbC5lbmFibGVBbmltYXRpb24oKVxuXG4gIHJlc2l6ZVBhbmVsOiAoZXZlbnQpID0+XG4gICAgcmV0dXJuIEByZXNpemVTdG9wcGVkKCkgdW5sZXNzIGV2ZW50LndoaWNoIGlzIDFcblxuICAgIG1vdXNlWSA9ICQod2luZG93KS5oZWlnaHQoKSAtIGV2ZW50LnBhZ2VZXG4gICAgZGVsdGEgPSBtb3VzZVkgLSAkKCdhdG9tLXBhbmVsLWNvbnRhaW5lci5ib3R0b20nKS5oZWlnaHQoKVxuICAgIHJldHVybiB1bmxlc3MgTWF0aC5hYnMoZGVsdGEpID4gKEB0ZXJtaW5hbC5nZXRSb3dIZWlnaHQoKSAqIDUgLyA2KVxuXG4gICAgbmVhcmVzdFJvdyA9IEBuZWFyZXN0Um93KEB0ZXJtaW5hbC5oZWlnaHQoKSArIGRlbHRhKVxuICAgIGNsYW1wZWQgPSBNYXRoLm1heChuZWFyZXN0Um93LCBAdGVybWluYWwuZ2V0Um93SGVpZ2h0KCkpXG4gICAgcmV0dXJuIGlmIGNsYW1wZWQgPiBAbWF4SGVpZ2h0XG5cbiAgICBAdGVybWluYWwuaGVpZ2h0IGNsYW1wZWRcbiAgICBAdGVybWluYWwucmVjYWxpYnJhdGVTaXplKClcblxuXG4gICMjI1xuICBTZWN0aW9uOiBFeHRlcm5hbCBNZXRob2RzXG4gICMjI1xuXG4gIG9wZW46ID0+XG4gICAgc3VwZXIoKVxuICAgIEB0ZXJtaW5hbC5nZXRTdGF0dXNJY29uKCkuYWN0aXZhdGUoKVxuXG4gICAgaWYgbGFzdE9wZW5lZFRlcm1pbmFsIGFuZCBsYXN0T3BlbmVkVGVybWluYWwgIT0gQHRlcm1pbmFsXG4gICAgICBsYXN0T3BlbmVkVGVybWluYWwuZ2V0UGFyZW50VmlldygpLmhpZGUoe3JlZm9jdXM6IGZhbHNlfSlcbiAgICBsYXN0T3BlbmVkVGVybWluYWwgPSBAdGVybWluYWxcblxuICAgIEBvblRyYW5zaXRpb25FbmQgPT5cbiAgICAgIGlmIEB0ZXJtaW5hbC5kaXNwbGF5VmlldygpXG4gICAgICAgIGhlaWdodCA9IEBuZWFyZXN0Um93KEB0ZXJtaW5hbC5oZWlnaHQoKSlcbiAgICAgICAgQHRlcm1pbmFsLmhlaWdodChoZWlnaHQpXG4gICAgICBAZm9jdXMoKVxuXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEB0ZXJtaW5hbC5oZWlnaHQgMFxuICAgIEBhbmltYXRpbmcgPSB0cnVlXG4gICAgQHRlcm1pbmFsLmhlaWdodCBAdGVybWluYWwuZ2V0UHJldkhlaWdodCgpIG9yIGRlZmF1bHRIZWlnaHRcblxuICBoaWRlOiAoe3JlZm9jdXN9PXt9KT0+XG4gICAgcmVmb2N1cyA/PSB0cnVlXG4gICAgbGFzdE9wZW5lZFRlcm1pbmFsID0gbnVsbFxuICAgIEB0ZXJtaW5hbC5nZXRTdGF0dXNJY29uKCkuZGVhY3RpdmF0ZSgpXG5cbiAgICBAb25UcmFuc2l0aW9uRW5kID0+XG4gICAgICBAcGFuZWwuaGlkZSgpXG4gICAgICBzdXBlcihyZWZvY3VzKVxuXG4gICAgQHRlcm1pbmFsLmhlaWdodCBAdGVybWluYWwuZ2V0UHJldkhlaWdodCgpXG4gICAgQGFuaW1hdGluZyA9IHRydWVcbiAgICBAdGVybWluYWwuaGVpZ2h0IDBcblxuICB1cGRhdGVOYW1lOiAobmFtZSkgLT5cbiAgICBAdGVybWluYWwuZ2V0U3RhdHVzSWNvbigpLnNldE5hbWUobmFtZSlcblxuICB0b2dnbGVGdWxsc2NyZWVuOiA9PlxuICAgIEBkZXN0cm95IGtlZXBUZXJtaW5hbDogdHJ1ZVxuICAgIEB0ZXJtaW5hbC5jbGVhckhlaWdodCgpLmRpc2FibGVBbmltYXRpb24oKVxuICAgIHRhYlZpZXcgPSBuZXcgKHJlcXVpcmUgJy4vdGFiLXZpZXcnKSB7QHRlcm1pbmFsfVxuICAgIHRhYlZpZXcudG9nZ2xlKClcbiAgICBAcmVtb3ZlKClcblxuICBpc1Zpc2libGU6IC0+XG4gICAgQHBhbmVsLmlzVmlzaWJsZSgpXG5cblxuICAjIyNcbiAgU2VjdGlvbjogSGVscGVyIE1ldGhvZHNcbiAgIyMjXG5cbiAgbmVhcmVzdFJvdzogKHZhbHVlKSAtPlxuICAgIHJvd0hlaWdodCA9IEB0ZXJtaW5hbC5nZXRSb3dIZWlnaHQoKVxuICAgIHJldHVybiByb3dIZWlnaHQgKiBNYXRoLnJvdW5kKHZhbHVlIC8gcm93SGVpZ2h0KVxuXG4gIG9uVHJhbnNpdGlvbkVuZDogKGNhbGxiYWNrKSAtPlxuICAgIEB0ZXJtaW5hbC5vbmUgJ3dlYmtpdFRyYW5zaXRpb25FbmQnLCA9PlxuICAgICAgY2FsbGJhY2soKVxuICAgICAgQGFuaW1hdGluZyA9IGZhbHNlXG4iXX0=
