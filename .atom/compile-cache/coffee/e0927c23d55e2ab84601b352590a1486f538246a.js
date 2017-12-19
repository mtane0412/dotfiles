(function() {
  var CompositeDisposable, StatusBar, StatusIcon,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  StatusBar = require('./status-bar');

  module.exports = StatusIcon = (function(superClass) {
    extend(StatusIcon, superClass);

    function StatusIcon() {
      return StatusIcon.__super__.constructor.apply(this, arguments);
    }

    StatusIcon.prototype.active = false;

    StatusIcon.prototype.initialize = function(terminal) {
      this.terminal = terminal;
      this.classList.add('status-icon');
      this.icon = document.createElement('i');
      this.icon.classList.add('icon', 'icon-terminal');
      this.appendChild(this.icon);
      this.name = document.createElement('span');
      this.name.classList.add('name');
      this.appendChild(this.name);
      this.addEventListener('click', (function(_this) {
        return function(arg) {
          var ctrlKey, which;
          which = arg.which, ctrlKey = arg.ctrlKey;
          if (which === 1) {
            _this.terminal.getParentView().toggle();
            return true;
          } else if (which === 2) {
            _this.terminal.getParentView().destroy();
            return false;
          }
        };
      })(this));
      this.setupTooltip();
      return this.attach();
    };

    StatusIcon.prototype.attach = function() {
      return StatusBar.addStatusIcon(this);
    };

    StatusIcon.prototype.destroy = function() {
      this.removeTooltip();
      if (this.mouseEnterSubscription) {
        this.mouseEnterSubscription.dispose();
      }
      return this.remove();
    };


    /*
    Section: Tooltip
     */

    StatusIcon.prototype.setupTooltip = function() {
      var onMouseEnter;
      onMouseEnter = (function(_this) {
        return function(event) {
          if (event.detail === 'terminal-plus') {
            return;
          }
          return _this.updateTooltip();
        };
      })(this);
      this.mouseEnterSubscription = {
        dispose: (function(_this) {
          return function() {
            _this.removeEventListener('mouseenter', onMouseEnter);
            return _this.mouseEnterSubscription = null;
          };
        })(this)
      };
      return this.addEventListener('mouseenter', onMouseEnter);
    };

    StatusIcon.prototype.updateTooltip = function() {
      var process;
      this.removeTooltip();
      if (process = this.terminal.getTitle()) {
        this.tooltip = atom.tooltips.add(this, {
          title: process,
          html: false,
          delay: {
            show: 1000,
            hide: 100
          }
        });
      }
      return this.dispatchEvent(new CustomEvent('mouseenter', {
        bubbles: true,
        detail: 'terminal-plus'
      }));
    };

    StatusIcon.prototype.removeTooltip = function() {
      if (this.tooltip) {
        this.tooltip.dispose();
      }
      return this.tooltip = null;
    };


    /*
    Section: Name
     */

    StatusIcon.prototype.getName = function() {
      return this.name.textContent.substring(1);
    };

    StatusIcon.prototype.setName = function(name) {
      if (name) {
        name = "&nbsp;" + name;
      }
      return this.name.innerHTML = name;
    };


    /*
    Section: Active Status
     */

    StatusIcon.prototype.activate = function() {
      this.classList.add('active');
      return this.active = true;
    };

    StatusIcon.prototype.deactivate = function() {
      this.classList.remove('active');
      return this.active = false;
    };

    StatusIcon.prototype.toggle = function() {
      if (this.active) {
        this.classList.remove('active');
      } else {
        this.classList.add('active');
      }
      return this.active = !this.active;
    };

    StatusIcon.prototype.isActive = function() {
      return this.active;
    };


    /*
    Section: External Methods
     */

    StatusIcon.prototype.getTerminal = function() {
      return this.terminal;
    };

    StatusIcon.prototype.getTerminalView = function() {
      return this.terminal.getParentView();
    };

    StatusIcon.prototype.hide = function() {
      this.style.display = 'none';
      return this.deactivate();
    };

    StatusIcon.prototype.show = function() {
      return this.style.display = '';
    };

    return StatusIcon;

  })(HTMLElement);

  module.exports = document.registerElement('status-icon', {
    prototype: StatusIcon.prototype,
    "extends": 'li'
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvc3RhdHVzLWljb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwwQ0FBQTtJQUFBOzs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUjs7RUFFWixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O3lCQUNKLE1BQUEsR0FBUTs7eUJBRVIsVUFBQSxHQUFZLFNBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxXQUFEO01BQ1gsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsYUFBZjtNQUVBLElBQUMsQ0FBQSxJQUFELEdBQVEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkI7TUFDUixJQUFDLENBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFoQixDQUFvQixNQUFwQixFQUE0QixlQUE1QjtNQUNBLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxDQUFBLElBQWQ7TUFFQSxJQUFDLENBQUEsSUFBRCxHQUFRLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCO01BQ1IsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBaEIsQ0FBb0IsTUFBcEI7TUFDQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxJQUFkO01BRUEsSUFBQyxDQUFBLGdCQUFELENBQWtCLE9BQWxCLEVBQTJCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ3pCLGNBQUE7VUFEMkIsbUJBQU87VUFDbEMsSUFBRyxLQUFBLEtBQVMsQ0FBWjtZQUNFLEtBQUMsQ0FBQSxRQUFRLENBQUMsYUFBVixDQUFBLENBQXlCLENBQUMsTUFBMUIsQ0FBQTtBQUNBLG1CQUFPLEtBRlQ7V0FBQSxNQUdLLElBQUcsS0FBQSxLQUFTLENBQVo7WUFDSCxLQUFDLENBQUEs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LE1BQUE7UUFHRSxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxRQUFmLEVBSEY7O2FBSUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFDLElBQUMsQ0FBQTtJQUxOOzt5QkFPUixRQUFBLEdBQVUsU0FBQTtBQUNSLGFBQU8sSUFBQyxDQUFBO0lBREE7OztBQUlWOzs7O3lCQUlBLFdBQUEsR0FBYSxTQUFBO0FBQ1gsYUFBTyxJQUFDLENBQUE7SUFERzs7eUJBR2IsZUFBQSxHQUFpQixTQUFBO0FBQ2YsYUFBTyxJQUFDLENBQUEsUUFBUSxDQUFDLGFBQVYsQ0FBQTtJQURROzt5QkFHakIsSUFBQSxHQUFNLFNBQUE7TUFDSixJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsR0FBaUI7YUFDakIsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQUZJOzt5QkFJTixJQUFBLEdBQU0sU0FBQTthQUNKLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxHQUFpQjtJQURiOzs7O0tBbkhpQjs7RUFzSHpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQVEsQ0FBQyxlQUFULENBQXlCLGFBQXpCLEVBQXdDO0lBQUEsU0FBQSxFQUFXLFVBQVUsQ0FBQyxTQUF0QjtJQUFpQyxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBQTFDO0dBQXhDO0FBM0hqQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cblN0YXR1c0JhciA9IHJlcXVpcmUgJy4vc3RhdHVzLWJhcidcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU3RhdHVzSWNvbiBleHRlbmRzIEhUTUxFbGVtZW50XG4gIGFjdGl2ZTogZmFsc2VcblxuICBpbml0aWFsaXplOiAoQHRlcm1pbmFsKSAtPlxuICAgIEBjbGFzc0xpc3QuYWRkICdzdGF0dXMtaWNvbidcblxuICAgIEBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpXG4gICAgQGljb24uY2xhc3NMaXN0LmFkZCAnaWNvbicsICdpY29uLXRlcm1pbmFsJ1xuICAgIEBhcHBlbmRDaGlsZChAaWNvbilcblxuICAgIEBuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgQG5hbWUuY2xhc3NMaXN0LmFkZCAnbmFtZSdcbiAgICBAYXBwZW5kQ2hpbGQoQG5hbWUpXG5cbiAgICBAYWRkRXZlbnRMaXN0ZW5lciAnY2xpY2snLCAoe3doaWNoLCBjdHJsS2V5fSkgPT5cbiAgICAgIGlmIHdoaWNoIGlzIDFcbiAgICAgICAgQHRlcm1pbmFsLmdldFBhcmVudFZpZXcoKS50b2dnbGUoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgZWxzZSBpZiB3aGljaCBpcyAyXG4gICAgICAgIEB0ZXJtaW5hbC5nZXRQYXJlbnRWaWV3KCkuZGVzdHJveSgpXG4gICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgQHNldHVwVG9vbHRpcCgpXG4gICAgQGF0dGFjaCgpXG5cbiAgYXR0YWNoOiAtPlxuICAgIFN0YXR1c0Jhci5hZGRTdGF0dXNJY29uKHRoaXMpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAcmVtb3ZlVG9vbHRpcCgpXG4gICAgQG1vdXNlRW50ZXJTdWJzY3JpcHRpb24uZGlzcG9zZSgpIGlmIEBtb3VzZUVudGVyU3Vic2NyaXB0aW9uXG4gICAgQHJlbW92ZSgpXG5cblxuICAjIyNcbiAgU2VjdGlvbjogVG9vbHRpcFxuICAjIyNcblxuICBzZXR1cFRvb2x0aXA6IC0+XG4gICAgb25Nb3VzZUVudGVyID0gKGV2ZW50KSA9PlxuICAgICAgcmV0dXJuIGlmIGV2ZW50LmRldGFpbCBpcyAndGVybWluYWwtcGx1cydcbiAgICAgIEB1cGRhdGVUb29sdGlwKClcblxuICAgIEBtb3VzZUVudGVyU3Vic2NyaXB0aW9uID0gZGlzcG9zZTogPT5cbiAgICAgIEByZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKVxuICAgICAgQG1vdXNlRW50ZXJTdWJzY3JpcHRpb24gPSBudWxsXG5cbiAgICBAYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcilcblxuICB1cGRhdGVUb29sdGlwOiAtPlxuICAgIEByZW1vdmVUb29sdGlwKClcblxuICAgIGlmIHByb2Nlc3MgPSBAdGVybWluYWwuZ2V0VGl0bGUoKVxuICAgICAgQHRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCB0aGlzLFxuICAgICAgICB0aXRsZTogcHJvY2Vzc1xuICAgICAgICBodG1sOiBmYWxzZVxuICAgICAgICBkZWxheTpcbiAgICAgICAgICBzaG93OiAxMDAwXG4gICAgICAgICAgaGlkZTogMTAwXG5cbiAgICBAZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ21vdXNlZW50ZXInLCBidWJibGVzOiB0cnVlLCBkZXRhaWw6ICd0ZXJtaW5hbC1wbHVzJykpXG5cbiAgcmVtb3ZlVG9vbHRpcDogLT5cbiAgICBAdG9vbHRpcC5kaXNwb3NlKCkgaWYgQHRvb2x0aXBcbiAgICBAdG9vbHRpcCA9IG51bGxcblxuXG4gICMjI1xuICBTZWN0aW9uOiBOYW1lXG4gICMjI1xuXG4gIGdldE5hbWU6IC0+IEBuYW1lLnRleHRDb250ZW50LnN1YnN0cmluZygxKVxuXG4gIHNldE5hbWU6IChuYW1lKSAtPlxuICAgIG5hbWUgPSBcIiZuYnNwO1wiICsgbmFtZSBpZiBuYW1lXG4gICAgQG5hbWUuaW5uZXJIVE1MID0gbmFtZVxuXG5cbiAgIyMjXG4gIFNlY3Rpb246IEFjdGl2ZSBTdGF0dXNcbiAgIyMjXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQGNsYXNzTGlzdC5hZGQgJ2FjdGl2ZSdcbiAgICBAYWN0aXZlID0gdHJ1ZVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGNsYXNzTGlzdC5yZW1vdmUgJ2FjdGl2ZSdcbiAgICBAYWN0aXZlID0gZmFsc2VcblxuICB0b2dnbGU6IC0+XG4gICAgaWYgQGFjdGl2ZVxuICAgICAgQGNsYXNzTGlzdC5yZW1vdmUgJ2FjdGl2ZSdcbiAgICBlbHNlXG4gICAgICBAY2xhc3NMaXN0LmFkZCAnYWN0aXZlJ1xuICAgIEBhY3RpdmUgPSAhQGFjdGl2ZVxuXG4gIGlzQWN0aXZlOiAtPlxuICAgIHJldHVybiBAYWN0aXZlXG5cblxuICAjIyNcbiAgU2VjdGlvbjogRXh0ZXJuYWwgTWV0aG9kc1xuICAjIyNcblxuICBnZXRUZXJtaW5hbDogLT5cbiAgICByZXR1cm4gQHRlcm1pbmFsXG5cbiAgZ2V0VGVybWluYWxWaWV3OiAtPlxuICAgIHJldHVybiBAdGVybWluYWwuZ2V0UGFyZW50VmlldygpXG5cbiAgaGlkZTogLT5cbiAgICBAc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuICAgIEBkZWFjdGl2YXRlKClcblxuICBzaG93OiAtPlxuICAgIEBzdHlsZS5kaXNwbGF5ID0gJydcblxubW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ3N0YXR1cy1pY29uJywgcHJvdG90eXBlOiBTdGF0dXNJY29uLnByb3RvdHlwZSwgZXh0ZW5kczogJ2xpJylcbiJdfQ==
