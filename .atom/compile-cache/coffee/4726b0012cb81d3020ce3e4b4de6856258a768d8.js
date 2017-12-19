(function() {
  var $, CompositeDisposable, StatusBar, View, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, View = ref.View;

  StatusBar = (function(superClass) {
    extend(StatusBar, superClass);

    function StatusBar() {
      this.onDropTabBar = bind(this.onDropTabBar, this);
      this.onDrop = bind(this.onDrop, this);
      this.onDragOver = bind(this.onDragOver, this);
      this.onDragEnd = bind(this.onDragEnd, this);
      this.onDragLeave = bind(this.onDragLeave, this);
      this.onDragStart = bind(this.onDragStart, this);
      return StatusBar.__super__.constructor.apply(this, arguments);
    }

    StatusBar.prototype.attached = false;

    StatusBar.prototype.container = null;

    StatusBar.content = function() {
      return this.div({
        "class": 'terminal-plus inline-block',
        style: 'width: 100%;'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'terminal-plus-status-bar'
          }, function() {
            _this.i({
              "class": "icon icon-plus",
              click: 'newTerminalView',
              outlet: 'plusBtn'
            });
            _this.ul({
              "class": "status-container list-inline",
              tabindex: '-1',
              outlet: 'statusContainer'
            });
            return _this.i({
              "class": "icon icon-x",
              style: "color: red;",
              click: 'closeAll',
              outlet: 'closeBtn'
            });
          });
        };
      })(this));
    };

    StatusBar.prototype.initialize = function() {
      this.core = require('./core');
      this.subscriptions = new CompositeDisposable();
      this.subscriptions.add(atom.tooltips.add(this.plusBtn, {
        title: 'New Terminal'
      }));
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close All'
      }));
      this.statusContainer.on('dblclick', (function(_this) {
        return function(event) {
          if (event.target === event.delegateTarget) {
            return _this.newTerminalView();
          }
        };
      })(this));
      this.registerContextMenu();
      return this.registerDragDropInterface();
    };

    StatusBar.prototype.destroy = function() {
      return this.destroyContainer();
    };


    /*
    Section: Setup
     */

    StatusBar.prototype.registerContextMenu = function() {
      var findStatusIcon;
      findStatusIcon = function(event) {
        return $(event.target).closest('.status-icon')[0];
      };
      return this.subscriptions.add(atom.commands.add('.terminal-plus-status-bar', {
        'terminal-plus:status-red': this.setStatusColor,
        'terminal-plus:status-orange': this.setStatusColor,
        'terminal-plus:status-yellow': this.setStatusColor,
        'terminal-plus:status-green': this.setStatusColor,
        'terminal-plus:status-blue': this.setStatusColor,
        'terminal-plus:status-purple': this.setStatusColor,
        'terminal-plus:status-pink': this.setStatusColor,
        'terminal-plus:status-cyan': this.setStatusColor,
        'terminal-plus:status-magenta': this.setStatusColor,
        'terminal-plus:status-default': this.clearStatusColor,
        'terminal-plus:context-close': function(event) {
          return findStatusIcon(event).getTerminalView().destroy();
        },
        'terminal-plus:context-hide': function(event) {
          var statusIcon;
          statusIcon = findStatusIcon(event);
          if (statusIcon.isActive()) {
            return statusIcon.getTerminalView().hide();
          }
        },
        'terminal-plus:context-rename': function(event) {
          return findStatusIcon(event).getTerminal().promptForRename();
        }
      }));
    };

    StatusBar.prototype.registerDragDropInterface = function() {
      this.statusContainer.on('dragstart', '.status-icon', this.onDragStart);
      this.statusContainer.on('dragend', '.status-icon', this.onDragEnd);
      this.statusContainer.on('dragleave', this.onDragLeave);
      this.statusContainer.on('dragover', this.onDragOver);
      return this.statusContainer.on('drop', this.onDrop);
    };

    StatusBar.prototype.registerPaneSubscription = function() {
      if (this.paneSubscription) {
        return;
      }
      return this.subscriptions.add(this.paneSubscription = atom.workspace.observePanes((function(_this) {
        return function(pane) {
          var paneElement, tabBar;
          paneElement = $(atom.views.getView(pane));
          tabBar = paneElement.find('ul');
          tabBar.on('drop', function(event) {
            return _this.onDropTabBar(event, pane);
          });
          tabBar.on('dragstart', function(event) {
            var ref1;
            if (((ref1 = event.target.item) != null ? ref1.constructor.name : void 0) !== 'TabView') {
              return;
            }
            return event.originalEvent.dataTransfer.setData('terminal-plus-tab', 'true');
          });
          return pane.onDidDestroy(function() {
            return tabBar.off('drop', this.onDropTabBar);
          });
        };
      })(this)));
    };


    /*
    Section: Button Handlers
     */

    StatusBar.prototype.closeAll = function() {
      return this.core.closeAll();
    };

    StatusBar.prototype.newTerminalView = function() {
      var ref1;
      return (ref1 = this.core.newTerminalView()) != null ? ref1.toggle() : void 0;
    };


    /*
    Section: Drag and drop
     */

    StatusBar.prototype.onDragStart = function(event) {
      var element;
      event.originalEvent.dataTransfer.setData('terminal-plus-panel', 'true');
      element = $(event.target).closest('.status-icon');
      element.addClass('is-dragging');
      return event.originalEvent.dataTransfer.setData('from-index', element.index());
    };

    StatusBar.prototype.onDragLeave = function(event) {
      return this.removePlaceholder();
    };

    StatusBar.prototype.onDragEnd = function(event) {
      return this.clearDropTarget();
    };

    StatusBar.prototype.onDragOver = function(event) {
      var element, newDropTargetIndex, statusIcons;
      event.preventDefault();
      event.stopPropagation();
      if (event.originalEvent.dataTransfer.getData('terminal-plus-panel') !== 'true') {
        return;
      }
      newDropTargetIndex = this.getDropTargetIndex(event);
      if (newDropTargetIndex == null) {
        return;
      }
      this.removeDropTargetClasses();
      statusIcons = this.getStatusIcons();
      if (newDropTargetIndex < statusIcons.length) {
        element = statusIcons.eq(newDropTargetIndex).addClass('is-drop-target');
        return this.getPlaceholder().insertBefore(element);
      } else {
        element = statusIcons.eq(newDropTargetIndex - 1).addClass('drop-target-is-after');
        return this.getPlaceholder().insertAfter(element);
      }
    };

    StatusBar.prototype.onDrop = function(event) {
      var dataTransfer, fromIndex, pane, paneIndex, panelEvent, tabEvent, toIndex, view;
      dataTransfer = event.originalEvent.dataTransfer;
      panelEvent = dataTransfer.getData('terminal-plus-panel') === 'true';
      tabEvent = dataTransfer.getData('terminal-plus-tab') === 'true';
      if (!(panelEvent || tabEvent)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      toIndex = this.getDropTargetIndex(event);
      this.clearDropTarget();
      if (tabEvent) {
        fromIndex = parseInt(dataTransfer.getData('sortable-index'));
        paneIndex = parseInt(dataTransfer.getData('from-pane-index'));
        pane = atom.workspace.getPanes()[paneIndex];
        view = pane.itemAtIndex(fromIndex);
        pane.removeItem(view, false);
        view.toggleFullscreen();
        fromIndex = this.core.length() - 1;
      } else {
        fromIndex = parseInt(dataTransfer.getData('from-index'));
      }
      return this.updateOrder(fromIndex, toIndex);
    };

    StatusBar.prototype.onDropTabBar = function(event, pane) {
      var dataTransfer, fromIndex, terminal;
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('terminal-plus-panel') !== 'true') {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.clearDropTarget();
      fromIndex = parseInt(dataTransfer.getData('from-index'));
      terminal = this.core.terminalAt(fromIndex);
      return terminal.getParentView().toggleFullscreen();
    };


    /*
    Section: External Methods
     */

    StatusBar.prototype.addStatusIcon = function(icon) {
      return this.statusContainer.append(icon);
    };

    StatusBar.prototype.destroyContainer = function() {
      if (this.container) {
        this.container.destroy();
        return this.container = null;
      }
    };

    StatusBar.prototype.getContainer = function() {
      return this.container;
    };

    StatusBar.prototype.setContainer = function(container) {
      this.container = container;
      return this;
    };


    /*
    Section: Helper Methods
     */

    StatusBar.prototype.clearDropTarget = function() {
      var element;
      element = this.find('.is-dragging');
      element.removeClass('is-dragging');
      this.removeDropTargetClasses();
      return this.removePlaceholder();
    };

    StatusBar.prototype.removeDropTargetClasses = function() {
      this.statusContainer.find('.is-drop-target').removeClass('is-drop-target');
      return this.statusContainer.find('.drop-target-is-after').removeClass('drop-target-is-after');
    };

    StatusBar.prototype.getDropTargetIndex = function(event) {
      var element, elementCenter, statusIcons, target;
      target = $(event.target);
      if (this.isPlaceholder(target)) {
        return;
      }
      statusIcons = this.statusContainer.children('.status-icon');
      element = target.closest('.status-icon');
      if (element.length === 0) {
        element = statusIcons.last();
      }
      if (!element.length) {
        return 0;
      }
      elementCenter = element.offset().left + element.width() / 2;
      if (event.originalEvent.pageX < elementCenter) {
        return statusIcons.index(element);
      } else if (element.next('.status-icon').length > 0) {
        return statusIcons.index(element.next('.status-icon'));
      } else {
        return statusIcons.index(element) + 1;
      }
    };

    StatusBar.prototype.getPlaceholder = function() {
      return this.placeholderEl != null ? this.placeholderEl : this.placeholderEl = $('<li class="placeholder"></li>');
    };

    StatusBar.prototype.removePlaceholder = function() {
      var ref1;
      if ((ref1 = this.placeholderEl) != null) {
        ref1.remove();
      }
      return this.placeholderEl = null;
    };

    StatusBar.prototype.isPlaceholder = function(element) {
      return element.is('.placeholder');
    };

    StatusBar.prototype.getStatusIcons = function() {
      return this.statusContainer.children('.status-icon');
    };

    StatusBar.prototype.moveIconToIndex = function(icon, toIndex) {
      var container, followingIcon;
      followingIcon = this.getStatusIcons()[toIndex];
      container = this.statusContainer[0];
      if (followingIcon != null) {
        return container.insertBefore(icon, followingIcon);
      } else {
        return container.appendChild(icon);
      }
    };

    StatusBar.prototype.updateOrder = function(fromIndex, toIndex) {
      var icon;
      if (fromIndex === toIndex) {
        return;
      }
      if (fromIndex < toIndex) {
        toIndex--;
      }
      icon = this.getStatusIcons().eq(fromIndex).detach();
      this.moveIconToIndex(icon.get(0), toIndex);
      this.core.moveTerminal(fromIndex, toIndex);
      icon.addClass('inserted');
      return icon.one('webkitAnimationEnd', function() {
        return icon.removeClass('inserted');
      });
    };

    StatusBar.prototype.clearStatusColor = function(event) {
      return $(event.target).closest('.status-icon').css('color', '');
    };

    StatusBar.prototype.setStatusColor = function(event) {
      var color;
      color = event.type.match(/\w+$/)[0];
      color = atom.config.get("terminal-plus.iconColors." + color).toRGBAString();
      return $(event.target).closest('.status-icon').css('color', color);
    };

    return StatusBar;

  })(View);

  module.exports = new StatusBar();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvc3RhdHVzLWJhci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDRDQUFBO0lBQUE7Ozs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLE1BQVksT0FBQSxDQUFRLHNCQUFSLENBQVosRUFBQyxTQUFELEVBQUk7O0VBRUU7Ozs7Ozs7Ozs7Ozs7d0JBQ0osUUFBQSxHQUFVOzt3QkFDVixTQUFBLEdBQVc7O0lBRVgsU0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sNEJBQVA7UUFBcUMsS0FBQSxFQUFPLGNBQTVDO09BQUwsRUFBaUUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUMvRCxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTywwQkFBUDtXQUFMLEVBQXdDLFNBQUE7WUFDdEMsS0FBQyxDQUFBLENBQUQsQ0FBRztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZ0JBQVA7Y0FBeUIsS0FBQSxFQUFPLGlCQUFoQztjQUFtRCxNQUFBLEVBQVEsU0FBM0Q7YUFBSDtZQUNBLEtBQUMsQ0FBQSxFQUFELENBQUk7Y0FDRixDQUFBLEtBQUEsQ0FBQSxFQUFPLDhCQURMO2NBRUYsUUFBQSxFQUFVLElBRlI7Y0FHRixNQUFBLEVBQVEsaUJBSE47YUFBSjttQkFLQSxLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQ0QsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUROO2NBRUQsS0FBQSxFQUFPLGFBRk47Y0FHRCxLQUFBLEVBQU8sVUFITjtjQUlELE1BQUEsRUFBUSxVQUpQO2FBQUg7VUFQc0MsQ0FBeEM7UUFEK0Q7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpFO0lBRFE7O3dC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XG57JCwgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuY2xhc3MgU3RhdHVzQmFyIGV4dGVuZHMgVmlld1xuICBhdHRhY2hlZDogZmFsc2VcbiAgY29udGFpbmVyOiBudWxsXG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ3Rlcm1pbmFsLXBsdXMgaW5saW5lLWJsb2NrJywgc3R5bGU6ICd3aWR0aDogMTAwJTsnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ3Rlcm1pbmFsLXBsdXMtc3RhdHVzLWJhcicsID0+XG4gICAgICAgIEBpIGNsYXNzOiBcImljb24gaWNvbi1wbHVzXCIsIGNsaWNrOiAnbmV3VGVybWluYWxWaWV3Jywgb3V0bGV0OiAncGx1c0J0bidcbiAgICAgICAgQHVsIHtcbiAgICAgICAgICBjbGFzczogXCJzdGF0dXMtY29udGFpbmVyIGxpc3QtaW5saW5lXCIsXG4gICAgICAgICAgdGFiaW5kZXg6ICctMScsXG4gICAgICAgICAgb3V0bGV0OiAnc3RhdHVzQ29udGFpbmVyJ1xuICAgICAgICB9XG4gICAgICAgIEBpIHtcbiAgICAgICAgICBjbGFzczogXCJpY29uIGljb24teFwiLFxuICAgICAgICAgIHN0eWxlOiBcImNvbG9yOiByZWQ7XCIsXG4gICAgICAgICAgY2xpY2s6ICdjbG9zZUFsbCcsXG4gICAgICAgICAgb3V0bGV0OiAnY2xvc2VCdG4nXG4gICAgICAgIH1cblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBjb3JlID0gcmVxdWlyZSAnLi9jb3JlJ1xuXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQHBsdXNCdG4sIHRpdGxlOiAnTmV3IFRlcm1pbmFsJ1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAY2xvc2VCdG4sIHRpdGxlOiAnQ2xvc2UgQWxsJ1xuXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZGJsY2xpY2snLCAoZXZlbnQpID0+XG4gICAgICBpZiBldmVudC50YXJnZXQgPT0gZXZlbnQuZGVsZWdhdGVUYXJnZXRcbiAgICAgICAgQG5ld1Rlcm1pbmFsVmlldygpXG5cbiAgICBAcmVnaXN0ZXJDb250ZXh0TWVudSgpXG4gICAgQHJlZ2lzdGVyRHJhZ0Ryb3BJbnRlcmZhY2UoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRlc3Ryb3lDb250YWluZXIoKVxuXG5cbiAgIyMjXG4gIFNlY3Rpb246IFNldHVwXG4gICMjI1xuXG4gIHJlZ2lzdGVyQ29udGV4dE1lbnU6IC0+XG4gICAgZmluZFN0YXR1c0ljb24gPSAoZXZlbnQpIC0+XG4gICAgICByZXR1cm4gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5zdGF0dXMtaWNvbicpWzBdXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy50ZXJtaW5hbC1wbHVzLXN0YXR1cy1iYXInLFxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6c3RhdHVzLXJlZCc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6c3RhdHVzLW9yYW5nZSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6c3RhdHVzLXllbGxvdyc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6c3RhdHVzLWdyZWVuJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAndGVybWluYWwtcGx1czpzdGF0dXMtYmx1ZSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6c3RhdHVzLXB1cnBsZSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6c3RhdHVzLXBpbmsnOiBAc2V0U3RhdHVzQ29sb3JcbiAgICAgICd0ZXJtaW5hbC1wbHVzOnN0YXR1cy1jeWFuJzogQHNldFN0YXR1c0NvbG9yXG4gICAgICAndGVybWluYWwtcGx1czpzdGF0dXMtbWFnZW50YSc6IEBzZXRTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6c3RhdHVzLWRlZmF1bHQnOiBAY2xlYXJTdGF0dXNDb2xvclxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6Y29udGV4dC1jbG9zZSc6IChldmVudCkgLT5cbiAgICAgICAgZmluZFN0YXR1c0ljb24oZXZlbnQpLmdldFRlcm1pbmFsVmlldygpLmRlc3Ryb3koKVxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6Y29udGV4dC1oaWRlJzogKGV2ZW50KSAtPlxuICAgICAgICBzdGF0dXNJY29uID0gZmluZFN0YXR1c0ljb24oZXZlbnQpXG4gICAgICAgIHN0YXR1c0ljb24uZ2V0VGVybWluYWxWaWV3KCkuaGlkZSgpIGlmIHN0YXR1c0ljb24uaXNBY3RpdmUoKVxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6Y29udGV4dC1yZW5hbWUnOiAoZXZlbnQpIC0+XG4gICAgICAgIGZpbmRTdGF0dXNJY29uKGV2ZW50KS5nZXRUZXJtaW5hbCgpLnByb21wdEZvclJlbmFtZSgpXG5cbiAgcmVnaXN0ZXJEcmFnRHJvcEludGVyZmFjZTogLT5cbiAgICBAc3RhdHVzQ29udGFpbmVyLm9uICdkcmFnc3RhcnQnLCAnLnN0YXR1cy1pY29uJywgQG9uRHJhZ1N0YXJ0XG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZHJhZ2VuZCcsICcuc3RhdHVzLWljb24nLCBAb25EcmFnRW5kXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZHJhZ2xlYXZlJywgQG9uRHJhZ0xlYXZlXG4gICAgQHN0YXR1c0NvbnRhaW5lci5vbiAnZHJhZ292ZXInLCBAb25EcmFnT3ZlclxuICAgIEBzdGF0dXNDb250YWluZXIub24gJ2Ryb3AnLCBAb25Ecm9wXG5cbiAgcmVnaXN0ZXJQYW5lU3Vic2NyaXB0aW9uOiAtPlxuICAgIHJldHVybiBpZiBAcGFuZVN1YnNjcmlwdGlvblxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBwYW5lU3Vic2NyaXB0aW9uID0gYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVBhbmVzIChwYW5lKSA9PlxuICAgICAgcGFuZUVsZW1lbnQgPSAkKGF0b20udmlld3MuZ2V0VmlldyhwYW5lKSlcbiAgICAgIHRhYkJhciA9IHBhbmVFbGVtZW50LmZpbmQoJ3VsJylcblxuICAgICAgdGFiQmFyLm9uICdkcm9wJywgKGV2ZW50KSA9PiBAb25Ecm9wVGFiQmFyKGV2ZW50LCBwYW5lKVxuICAgICAgdGFiQmFyLm9uICdkcmFnc3RhcnQnLCAoZXZlbnQpIC0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgZXZlbnQudGFyZ2V0Lml0ZW0/LmNvbnN0cnVjdG9yLm5hbWUgaXMgJ1RhYlZpZXcnXG4gICAgICAgIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEgJ3Rlcm1pbmFsLXBsdXMtdGFiJywgJ3RydWUnXG4gICAgICBwYW5lLm9uRGlkRGVzdHJveSAtPiB0YWJCYXIub2ZmICdkcm9wJywgQG9uRHJvcFRhYkJhclxuXG5cbiAgIyMjXG4gIFNlY3Rpb246IEJ1dHRvbiBIYW5kbGVyc1xuICAjIyNcblxuICBjbG9zZUFsbDogLT5cbiAgICBAY29yZS5jbG9zZUFsbCgpXG5cbiAgbmV3VGVybWluYWxWaWV3OiAtPlxuICAgIEBjb3JlLm5ld1Rlcm1pbmFsVmlldygpPy50b2dnbGUoKVxuXG5cbiAgIyMjXG4gIFNlY3Rpb246IERyYWcgYW5kIGRyb3BcbiAgIyMjXG5cbiAgb25EcmFnU3RhcnQ6IChldmVudCkgPT5cbiAgICBldmVudC5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhICd0ZXJtaW5hbC1wbHVzLXBhbmVsJywgJ3RydWUnXG5cbiAgICBlbGVtZW50ID0gJChldmVudC50YXJnZXQpLmNsb3Nlc3QoJy5zdGF0dXMtaWNvbicpXG4gICAgZWxlbWVudC5hZGRDbGFzcyAnaXMtZHJhZ2dpbmcnXG4gICAgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuc2V0RGF0YSAnZnJvbS1pbmRleCcsIGVsZW1lbnQuaW5kZXgoKVxuXG4gIG9uRHJhZ0xlYXZlOiAoZXZlbnQpID0+XG4gICAgQHJlbW92ZVBsYWNlaG9sZGVyKClcblxuICBvbkRyYWdFbmQ6IChldmVudCkgPT5cbiAgICBAY2xlYXJEcm9wVGFyZ2V0KClcblxuICBvbkRyYWdPdmVyOiAoZXZlbnQpID0+XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgdW5sZXNzIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3Rlcm1pbmFsLXBsdXMtcGFuZWwnKSBpcyAndHJ1ZSdcbiAgICAgIHJldHVyblxuXG4gICAgbmV3RHJvcFRhcmdldEluZGV4ID0gQGdldERyb3BUYXJnZXRJbmRleChldmVudClcbiAgICByZXR1cm4gdW5sZXNzIG5ld0Ryb3BUYXJnZXRJbmRleD9cbiAgICBAcmVtb3ZlRHJvcFRhcmdldENsYXNzZXMoKVxuICAgIHN0YXR1c0ljb25zID0gQGdldFN0YXR1c0ljb25zKClcblxuICAgIGlmIG5ld0Ryb3BUYXJnZXRJbmRleCA8IHN0YXR1c0ljb25zLmxlbmd0aFxuICAgICAgZWxlbWVudCA9IHN0YXR1c0ljb25zLmVxKG5ld0Ryb3BUYXJnZXRJbmRleCkuYWRkQ2xhc3MgJ2lzLWRyb3AtdGFyZ2V0J1xuICAgICAgQGdldFBsYWNlaG9sZGVyKCkuaW5zZXJ0QmVmb3JlKGVsZW1lbnQpXG4gICAgZWxzZVxuICAgICAgZWxlbWVudCA9IHN0YXR1c0ljb25zLmVxKG5ld0Ryb3BUYXJnZXRJbmRleCAtIDEpLmFkZENsYXNzICdkcm9wLXRhcmdldC1pcy1hZnRlcidcbiAgICAgIEBnZXRQbGFjZWhvbGRlcigpLmluc2VydEFmdGVyKGVsZW1lbnQpXG5cbiAgb25Ecm9wOiAoZXZlbnQpID0+XG4gICAge2RhdGFUcmFuc2Zlcn0gPSBldmVudC5vcmlnaW5hbEV2ZW50XG4gICAgcGFuZWxFdmVudCA9IGRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXJtaW5hbC1wbHVzLXBhbmVsJykgaXMgJ3RydWUnXG4gICAgdGFiRXZlbnQgPSBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGVybWluYWwtcGx1cy10YWInKSBpcyAndHJ1ZSdcbiAgICByZXR1cm4gdW5sZXNzIHBhbmVsRXZlbnQgb3IgdGFiRXZlbnRcblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgdG9JbmRleCA9IEBnZXREcm9wVGFyZ2V0SW5kZXgoZXZlbnQpXG4gICAgQGNsZWFyRHJvcFRhcmdldCgpXG5cbiAgICBpZiB0YWJFdmVudFxuICAgICAgZnJvbUluZGV4ID0gcGFyc2VJbnQoZGF0YVRyYW5zZmVyLmdldERhdGEoJ3NvcnRhYmxlLWluZGV4JykpXG4gICAgICBwYW5lSW5kZXggPSBwYXJzZUludChkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnZnJvbS1wYW5lLWluZGV4JykpXG4gICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVtwYW5lSW5kZXhdXG4gICAgICB2aWV3ID0gcGFuZS5pdGVtQXRJbmRleChmcm9tSW5kZXgpXG5cbiAgICAgIHBhbmUucmVtb3ZlSXRlbSh2aWV3LCBmYWxzZSlcbiAgICAgIHZpZXcudG9nZ2xlRnVsbHNjcmVlbigpXG4gICAgICBmcm9tSW5kZXggPSBAY29yZS5sZW5ndGgoKSAtIDFcbiAgICBlbHNlXG4gICAgICBmcm9tSW5kZXggPSBwYXJzZUludChkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnZnJvbS1pbmRleCcpKVxuICAgIEB1cGRhdGVPcmRlcihmcm9tSW5kZXgsIHRvSW5kZXgpXG5cbiAgb25Ecm9wVGFiQmFyOiAoZXZlbnQsIHBhbmUpID0+XG4gICAge2RhdGFUcmFuc2Zlcn0gPSBldmVudC5vcmlnaW5hbEV2ZW50XG4gICAgcmV0dXJuIHVubGVzcyBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGVybWluYWwtcGx1cy1wYW5lbCcpIGlzICd0cnVlJ1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgQGNsZWFyRHJvcFRhcmdldCgpXG5cbiAgICBmcm9tSW5kZXggPSBwYXJzZUludChkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnZnJvbS1pbmRleCcpKVxuICAgIHRlcm1pbmFsID0gQGNvcmUudGVybWluYWxBdChmcm9tSW5kZXgpXG4gICAgdGVybWluYWwuZ2V0UGFyZW50VmlldygpLnRvZ2dsZUZ1bGxzY3JlZW4oKVxuXG5cbiAgIyMjXG4gIFNlY3Rpb246IEV4dGVybmFsIE1ldGhvZHNcbiAgIyMjXG5cbiAgYWRkU3RhdHVzSWNvbjogKGljb24pIC0+XG4gICAgQHN0YXR1c0NvbnRhaW5lci5hcHBlbmQgaWNvblxuXG4gIGRlc3Ryb3lDb250YWluZXI6IC0+XG4gICAgaWYgQGNvbnRhaW5lclxuICAgICAgQGNvbnRhaW5lci5kZXN0cm95KClcbiAgICAgIEBjb250YWluZXIgPSBudWxsXG5cbiAgZ2V0Q29udGFpbmVyOiAtPlxuICAgIHJldHVybiBAY29udGFpbmVyXG5cbiAgc2V0Q29udGFpbmVyOiAoY29udGFpbmVyKSAtPlxuICAgIEBjb250YWluZXIgPSBjb250YWluZXJcbiAgICByZXR1cm4gdGhpc1xuXG5cbiAgIyMjXG4gIFNlY3Rpb246IEhlbHBlciBNZXRob2RzXG4gICMjI1xuXG4gIGNsZWFyRHJvcFRhcmdldDogLT5cbiAgICBlbGVtZW50ID0gQGZpbmQoJy5pcy1kcmFnZ2luZycpXG4gICAgZWxlbWVudC5yZW1vdmVDbGFzcyAnaXMtZHJhZ2dpbmcnXG4gICAgQHJlbW92ZURyb3BUYXJnZXRDbGFzc2VzKClcbiAgICBAcmVtb3ZlUGxhY2Vob2xkZXIoKVxuXG4gIHJlbW92ZURyb3BUYXJnZXRDbGFzc2VzOiAtPlxuICAgIEBzdGF0dXNDb250YWluZXIuZmluZCgnLmlzLWRyb3AtdGFyZ2V0JykucmVtb3ZlQ2xhc3MgJ2lzLWRyb3AtdGFyZ2V0J1xuICAgIEBzdGF0dXNDb250YWluZXIuZmluZCgnLmRyb3AtdGFyZ2V0LWlzLWFmdGVyJykucmVtb3ZlQ2xhc3MgJ2Ryb3AtdGFyZ2V0LWlzLWFmdGVyJ1xuXG4gIGdldERyb3BUYXJnZXRJbmRleDogKGV2ZW50KSAtPlxuICAgIHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIHJldHVybiBpZiBAaXNQbGFjZWhvbGRlcih0YXJnZXQpXG5cbiAgICBzdGF0dXNJY29ucyA9IEBzdGF0dXNDb250YWluZXIuY2hpbGRyZW4oJy5zdGF0dXMtaWNvbicpXG4gICAgZWxlbWVudCA9IHRhcmdldC5jbG9zZXN0KCcuc3RhdHVzLWljb24nKVxuICAgIGVsZW1lbnQgPSBzdGF0dXNJY29ucy5sYXN0KCkgaWYgZWxlbWVudC5sZW5ndGggaXMgMFxuXG4gICAgcmV0dXJuIDAgdW5sZXNzIGVsZW1lbnQubGVuZ3RoXG5cbiAgICBlbGVtZW50Q2VudGVyID0gZWxlbWVudC5vZmZzZXQoKS5sZWZ0ICsgZWxlbWVudC53aWR0aCgpIC8gMlxuXG4gICAgaWYgZXZlbnQub3JpZ2luYWxFdmVudC5wYWdlWCA8IGVsZW1lbnRDZW50ZXJcbiAgICAgIHN0YXR1c0ljb25zLmluZGV4KGVsZW1lbnQpXG4gICAgZWxzZSBpZiBlbGVtZW50Lm5leHQoJy5zdGF0dXMtaWNvbicpLmxlbmd0aCA+IDBcbiAgICAgIHN0YXR1c0ljb25zLmluZGV4KGVsZW1lbnQubmV4dCgnLnN0YXR1cy1pY29uJykpXG4gICAgZWxzZVxuICAgICAgc3RhdHVzSWNvbnMuaW5kZXgoZWxlbWVudCkgKyAxXG5cbiAgZ2V0UGxhY2Vob2xkZXI6IC0+XG4gICAgQHBsYWNlaG9sZGVyRWwgPz0gJCgnPGxpIGNsYXNzPVwicGxhY2Vob2xkZXJcIj48L2xpPicpXG5cbiAgcmVtb3ZlUGxhY2Vob2xkZXI6IC0+XG4gICAgQHBsYWNlaG9sZGVyRWw/LnJlbW92ZSgpXG4gICAgQHBsYWNlaG9sZGVyRWwgPSBudWxsXG5cbiAgaXNQbGFjZWhvbGRlcjogKGVsZW1lbnQpIC0+XG4gICAgZWxlbWVudC5pcygnLnBsYWNlaG9sZGVyJylcblxuICBnZXRTdGF0dXNJY29uczogLT5cbiAgICBAc3RhdHVzQ29udGFpbmVyLmNoaWxkcmVuKCcuc3RhdHVzLWljb24nKVxuXG4gIG1vdmVJY29uVG9JbmRleDogKGljb24sIHRvSW5kZXgpIC0+XG4gICAgZm9sbG93aW5nSWNvbiA9IEBnZXRTdGF0dXNJY29ucygpW3RvSW5kZXhdXG4gICAgY29udGFpbmVyID0gQHN0YXR1c0NvbnRhaW5lclswXVxuICAgIGlmIGZvbGxvd2luZ0ljb24/XG4gICAgICBjb250YWluZXIuaW5zZXJ0QmVmb3JlKGljb24sIGZvbGxvd2luZ0ljb24pXG4gICAgZWxzZVxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGljb24pXG5cbiAgdXBkYXRlT3JkZXI6IChmcm9tSW5kZXgsIHRvSW5kZXgpIC0+XG4gICAgcmV0dXJuIGlmIGZyb21JbmRleCBpcyB0b0luZGV4XG4gICAgdG9JbmRleC0tIGlmIGZyb21JbmRleCA8IHRvSW5kZXhcblxuICAgIGljb24gPSBAZ2V0U3RhdHVzSWNvbnMoKS5lcShmcm9tSW5kZXgpLmRldGFjaCgpXG4gICAgQG1vdmVJY29uVG9JbmRleCBpY29uLmdldCgwKSwgdG9JbmRleFxuICAgIEBjb3JlLm1vdmVUZXJtaW5hbCBmcm9tSW5kZXgsIHRvSW5kZXhcbiAgICBpY29uLmFkZENsYXNzICdpbnNlcnRlZCdcbiAgICBpY29uLm9uZSAnd2Via2l0QW5pbWF0aW9uRW5kJywgLT4gaWNvbi5yZW1vdmVDbGFzcygnaW5zZXJ0ZWQnKVxuXG4gIGNsZWFyU3RhdHVzQ29sb3I6IChldmVudCkgLT5cbiAgICAkKGV2ZW50LnRhcmdldCkuY2xvc2VzdCgnLnN0YXR1cy1pY29uJykuY3NzICdjb2xvcicsICcnXG5cbiAgc2V0U3RhdHVzQ29sb3I6IChldmVudCkgLT5cbiAgICBjb2xvciA9IGV2ZW50LnR5cGUubWF0Y2goL1xcdyskLylbMF1cbiAgICBjb2xvciA9IGF0b20uY29uZmlnLmdldChcInRlcm1pbmFsLXBsdXMuaWNvbkNvbG9ycy4je2NvbG9yfVwiKS50b1JHQkFTdHJpbmcoKVxuICAgICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCcuc3RhdHVzLWljb24nKS5jc3MgJ2NvbG9yJywgY29sb3JcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU3RhdHVzQmFyKClcbiJdfQ==
