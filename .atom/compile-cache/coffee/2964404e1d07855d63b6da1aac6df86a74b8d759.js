(function() {
  var $, CompositeDisposable, Emitter, TabView, TerminalView, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  $ = require('atom-space-pen-views').$;

  TerminalView = require('./terminal-view');

  module.exports = TabView = (function(superClass) {
    extend(TabView, superClass);

    function TabView() {
      this.toggleFullscreen = bind(this.toggleFullscreen, this);
      this.hide = bind(this.hide, this);
      this.open = bind(this.open, this);
      this.destroy = bind(this.destroy, this);
      return TabView.__super__.constructor.apply(this, arguments);
    }

    TabView.prototype.opened = false;

    TabView.prototype.lastActiveItem = null;

    TabView.prototype.windowHeight = $(window).height();

    TabView.getFocusedTerminal = function() {
      return TerminalView.getFocusedTerminal();
    };

    TabView.prototype.initialize = function(options) {
      TabView.__super__.initialize.call(this, options);
      this.emitter = new Emitter;
      this.fullscreenBtn = this.addButton('right', this.toggleFullscreen, 'screen-normal');
      this.inputBtn = this.addButton('left', this.promptForInput, 'keyboard');
      this.subscriptions.add(atom.tooltips.add(this.fullscreenBtn, {
        title: 'Minimize'
      }));
      this.subscriptions.add(atom.tooltips.add(this.inputBtn, {
        title: 'Insert Text'
      }));
      this.attach();
      this.terminal.hideIcon();
      return this.terminal.displayView();
    };

    TabView.prototype.destroy = function(arg) {
      var keepTerminal;
      keepTerminal = (arg != null ? arg : {}).keepTerminal;
      this.emitter.dispose();
      return TabView.__super__.destroy.call(this, keepTerminal);
    };


    /*
    Section: Setup
     */

    TabView.prototype.attach = function(pane, index) {
      if (pane == null) {
        pane = atom.workspace.getActivePane();
      }
      if (index == null) {
        index = pane.getItems().length;
      }
      return pane.addItem(this, index);
    };

    TabView.prototype.detach = function() {
      var ref1;
      return (ref1 = atom.workspace.paneForItem(this)) != null ? ref1.removeItem(this, true) : void 0;
    };


    /*
    Section: External Methods
     */

    TabView.prototype.open = function() {
      var pane;
      TabView.__super__.open.call(this);
      if (pane = atom.workspace.paneForItem(this)) {
        pane.activateItem(this);
      }
      return this.focus();
    };

    TabView.prototype.hide = function(arg) {
      var refocus;
      refocus = (arg != null ? arg : {}).refocus;
      if (refocus == null) {
        refocus = true;
      }
      this.blur();
      return TabView.__super__.hide.call(this, refocus);
    };

    TabView.prototype.getIconName = function() {
      return "terminal";
    };

    TabView.prototype.getTitle = function() {
      return this.terminal.getName() || "Terminal-Plus";
    };

    TabView.prototype.getPath = function() {
      return this.terminal.getTitle();
    };

    TabView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    TabView.prototype.updateName = function(name) {
      return this.emitter.emit('did-change-title', name);
    };

    TabView.prototype.toggleFullscreen = function() {
      var panel;
      this.destroy({
        keepTerminal: true
      });
      this.terminal.enableAnimation();
      panel = new (require('./panel-view'))({
        terminal: this.terminal
      });
      if (this.isVisible()) {
        panel.toggle();
      }
      return this.detach();
    };

    TabView.prototype.isVisible = function() {
      var pane;
      pane = atom.workspace.paneForItem(this);
      if (!pane) {
        return false;
      }
      return this === pane.getActiveItem();
    };

    return TabView;

  })(TerminalView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvdGFiLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyREFBQTtJQUFBOzs7O0VBQUEsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyw2Q0FBRCxFQUFzQjs7RUFDckIsSUFBSyxPQUFBLENBQVEsc0JBQVI7O0VBRU4sWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFFZixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7Ozs7OztzQkFDSixNQUFBLEdBQVE7O3NCQUNSLGNBQUEsR0FBZ0I7O3NCQUNoQixZQUFBLEdBQWMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQTs7SUFFZCxPQUFDLENBQUEsa0JBQUQsR0FBcUIsU0FBQTtBQUNuQixhQUFPLFlBQVksQ0FBQyxrQkFBYixDQUFBO0lBRFk7O3NCQUdyQixVQUFBLEdBQVksU0FBQyxPQUFEO01BQ1Ysd0NBQU0sT0FBTjtNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUMsQ0FBQSxTQUFELENBQVcsT0FBWCxFQUFvQixJQUFDLENBQUEsZ0JBQXJCLEVBQXVDLGVBQXZDO01BQ2pCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBQyxDQUFBLFNBQUQsQ0FBVyxNQUFYLEVBQW1CLElBQUMsQ0FBQSxjQUFwQixFQUFvQyxVQUFwQztNQUVaLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLGFBQW5CLEVBQ2pCO1FBQUEsS0FBQSxFQUFPLFVBQVA7T0FEaUIsQ0FBbkI7TUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxRQUFuQixFQUNqQjtRQUFBLEtBQUEsRUFBTyxhQUFQO09BRGlCLENBQW5CO01BR0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFWLENBQUE7SUFkVTs7c0JBZ0JaLE9BQUEsR0FBUyxTQUFDLEdBQUQ7QUFDUCxVQUFBO01BRFMsOEJBQUQsTUFBZTtNQUN2QixJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBQTthQUNBLHFDQUFNLFlBQU47SUFGTzs7O0FBS1Q7Ozs7c0JBSUEsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLEtBQVA7O1FBQ04sT0FBUSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQTs7O1FBQ1IsUUFBUyxJQUFJLENBQUMsUUFBTCxDQUFBLENBQWUsQ0FBQzs7YUFFekIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLEVBQW1CLEtBQW5CO0lBSk07O3NCQU1SLE1BQUEsR0FBUSxTQUFBO0FBQ04sVUFBQTtxRUFBZ0MsQ0FBRSxVQUFsQyxDQUE2QyxJQUE3QyxFQUFtRCxJQUFuRDtJQURNOzs7QUFJUjs7OztzQkFJQSxJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7TUFBQSxnQ0FBQTtNQUNBLElBQUcsSUFBQSxHQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBZixDQUEyQixJQUEzQixDQUFWO1FBQ0UsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsSUFBbEIsRUFERjs7YUFFQSxJQUFDLENBQUEsS0FBRCxDQUFBO0lBSkk7O3NCQU1OLElBQUEsR0FBTSxTQUFDLEdBQUQ7QUFDSixVQUFBO01BRE0seUJBQUQsTUFBVTs7UUFDZixVQUFXOztNQUVYLElBQUMsQ0FBQSxJQUFELENBQUE7YUFDQSxrQ0FBTSxPQUFOO0lBSkk7O3NCQU1OLFdBQUEsR0FBYSxTQUFBO2FBQ1g7SUFEVzs7c0JBR2IsUUFBQSxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsQ0FBQSxDQUFBLElBQXVCO0lBRGY7O3NCQUdWLE9BQUEsR0FBUyxTQUFBO0FBQ1AsYUFBTyxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FBQTtJQURBOztzQkFHVCxnQkFBQSxHQUFrQixTQUFDLFFBQUQ7YUFDaEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksa0JBQVosRUFBZ0MsUUFBaEM7SUFEZ0I7O3NCQUdsQixVQUFBLEdBQVksU0FBQyxJQUFEO2FBQ1YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsa0JBQWQsRUFBa0MsSUFBbEM7SUFEVTs7c0JBR1osZ0JBQUEsR0FBa0IsU0FBQTtBQUNoQixVQUFBO01BQUEsSUFBQyxDQUFBLE9BQUQsQ0FBUztRQUFBLFlBQUEsRUFBYyxJQUFkO09BQVQ7TUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLGVBQVYsQ0FBQTtNQUNBLEtBQUEsR0FBWSxJQUFBLENBQUMsT0FBQSxDQUFRLGNBQVIsQ0FBRCxDQUFBLENBQXlCO1FBQUUsVUFBRCxJQUFDLENBQUEsUUFBRjtPQUF6QjtNQUNaLElBQWtCLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBbEI7UUFBQSxLQUFLLENBQUMsTUFBTixDQUFBLEVBQUE7O2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUxnQjs7c0JBT2xCLFNBQUEsR0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQWYsQ0FBMkIsSUFBM0I7TUFDUCxJQUFBLENBQW9CLElBQXBCO0FBQUEsZUFBTyxNQUFQOztBQUNBLGFBQU8sSUFBQSxLQUFRLElBQUksQ0FBQyxhQUFMLENBQUE7SUFITjs7OztLQWpGUztBQU50QiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG57JH0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuVGVybWluYWxWaWV3ID0gcmVxdWlyZSAnLi90ZXJtaW5hbC12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBUYWJWaWV3IGV4dGVuZHMgVGVybWluYWxWaWV3XG4gIG9wZW5lZDogZmFsc2VcbiAgbGFzdEFjdGl2ZUl0ZW06IG51bGxcbiAgd2luZG93SGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KClcblxuICBAZ2V0Rm9jdXNlZFRlcm1pbmFsOiAtPlxuICAgIHJldHVybiBUZXJtaW5hbFZpZXcuZ2V0Rm9jdXNlZFRlcm1pbmFsKClcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBzdXBlcihvcHRpb25zKVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIEBmdWxsc2NyZWVuQnRuID0gQGFkZEJ1dHRvbiAncmlnaHQnLCBAdG9nZ2xlRnVsbHNjcmVlbiwgJ3NjcmVlbi1ub3JtYWwnXG4gICAgQGlucHV0QnRuID0gQGFkZEJ1dHRvbiAnbGVmdCcsIEBwcm9tcHRGb3JJbnB1dCwgJ2tleWJvYXJkJ1xuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBmdWxsc2NyZWVuQnRuLFxuICAgICAgdGl0bGU6ICdNaW5pbWl6ZSdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGlucHV0QnRuLFxuICAgICAgdGl0bGU6ICdJbnNlcnQgVGV4dCdcblxuICAgIEBhdHRhY2goKVxuICAgIEB0ZXJtaW5hbC5oaWRlSWNvbigpXG4gICAgQHRlcm1pbmFsLmRpc3BsYXlWaWV3KClcblxuICBkZXN0cm95OiAoe2tlZXBUZXJtaW5hbH09e30pID0+XG4gICAgQGVtaXR0ZXIuZGlzcG9zZSgpXG4gICAgc3VwZXIoa2VlcFRlcm1pbmFsKVxuXG5cbiAgIyMjXG4gIFNlY3Rpb246IFNldHVwXG4gICMjI1xuXG4gIGF0dGFjaDogKHBhbmUsIGluZGV4KSAtPlxuICAgIHBhbmUgPz0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgaW5kZXggPz0gcGFuZS5nZXRJdGVtcygpLmxlbmd0aFxuXG4gICAgcGFuZS5hZGRJdGVtIHRoaXMsIGluZGV4XG5cbiAgZGV0YWNoOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpPy5yZW1vdmVJdGVtKHRoaXMsIHRydWUpXG5cblxuICAjIyNcbiAgU2VjdGlvbjogRXh0ZXJuYWwgTWV0aG9kc1xuICAjIyNcblxuICBvcGVuOiA9PlxuICAgIHN1cGVyKClcbiAgICBpZiBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcylcbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtIHRoaXNcbiAgICBAZm9jdXMoKVxuXG4gIGhpZGU6ICh7cmVmb2N1c309e30pID0+XG4gICAgcmVmb2N1cyA/PSB0cnVlXG5cbiAgICBAYmx1cigpXG4gICAgc3VwZXIocmVmb2N1cylcblxuICBnZXRJY29uTmFtZTogLT5cbiAgICBcInRlcm1pbmFsXCJcblxuICBnZXRUaXRsZTogLT5cbiAgICBAdGVybWluYWwuZ2V0TmFtZSgpIG9yIFwiVGVybWluYWwtUGx1c1wiXG5cbiAgZ2V0UGF0aDogLT5cbiAgICByZXR1cm4gQHRlcm1pbmFsLmdldFRpdGxlKClcblxuICBvbkRpZENoYW5nZVRpdGxlOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFja1xuXG4gIHVwZGF0ZU5hbWU6IChuYW1lKSAtPlxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1jaGFuZ2UtdGl0bGUnLCBuYW1lXG5cbiAgdG9nZ2xlRnVsbHNjcmVlbjogPT5cbiAgICBAZGVzdHJveSBrZWVwVGVybWluYWw6IHRydWVcbiAgICBAdGVybWluYWwuZW5hYmxlQW5pbWF0aW9uKClcbiAgICBwYW5lbCA9IG5ldyAocmVxdWlyZSAnLi9wYW5lbC12aWV3Jykge0B0ZXJtaW5hbH1cbiAgICBwYW5lbC50b2dnbGUoKSBpZiBAaXNWaXNpYmxlKClcbiAgICBAZGV0YWNoKClcblxuICBpc1Zpc2libGU6IC0+XG4gICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMpXG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBwYW5lXG4gICAgcmV0dXJuIHRoaXMgPT0gcGFuZS5nZXRBY3RpdmVJdGVtKClcbiJdfQ==
