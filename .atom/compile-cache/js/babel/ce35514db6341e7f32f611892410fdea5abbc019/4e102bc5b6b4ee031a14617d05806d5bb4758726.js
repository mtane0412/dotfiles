'use babel';
/** @jsx etch.dom */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var etch = require('etch');

var _require = require('./outline-tree');

var OutlineTreeView = _require.OutlineTreeView;

var DocumentOutlineView = (function () {
  function DocumentOutlineView() {
    _classCallCheck(this, DocumentOutlineView);

    this.cursorPositionSubscription = null;
    this.outline = [];
    this._depthFirstItems = [];

    this.autoScroll = atom.config.get("document-outline.autoScrollOutline");
    this.doHighlight = atom.config.get("document-outline.highlightCurrentSection");
    etch.initialize(this);
  }

  _createClass(DocumentOutlineView, [{
    key: 'getDefaultLocation',
    value: function getDefaultLocation() {
      return atom.config.get('document-outline.defaultSide');
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      return 'Outline';
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      return 'list-unordered';
    }
  }, {
    key: 'getURI',
    value: function getURI() {
      return 'atom://document-outline/outline';
    }
  }, {
    key: 'getAllowedLocations',
    value: function getAllowedLocations() {
      return ['left', 'right'];
    }
  }, {
    key: 'getPreferredWidth',
    value: function getPreferredWidth() {
      return 200;
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.update({ outline: [] });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      etch.destroy(this);
      if (this.cursorPositionSubscription) {
        this.cursorPositionSubscription.dispose();
      }
    }
  }, {
    key: 'getElement',
    value: function getElement() {
      return this.element;
    }
  }, {
    key: 'update',
    value: function update(props) {
      var _this = this;

      var outline = props.outline;
      var editor = props.editor;

      this.outline = outline;
      // Set the outline, which should rebuild the DOM tree
      // Clear existing events and re-subscribe to make sure we don't accumulate subscriptions
      if (this.cursorPositionSubscription) {
        this.cursorPositionSubscription.dispose();
      }

      if (editor) {
        this.cursorPos = editor.getCursorBufferPosition();

        this.cursorPositionSubscription = editor.onDidChangeCursorPosition(function (event) {
          if (event.oldBufferPosition.row !== event.newBufferPosition.row) {
            _this.cursorPos = editor.getCursorBufferPosition();
            return etch.update(_this);
          }
        });
      }

      this._depthFirstItems = [];
      return etch.update(this);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      this.outlineElements = this.outline.map(function (tree) {
        tree.cursorPos = _this2.cursorPos;
        tree.doHighlight = _this2.doHighlight;
        tree.autoCollapse = atom.config.get('document-outline.collapseByDefault');
        return etch.dom(OutlineTreeView, tree);
      });

      return etch.dom(
        'div',
        { 'class': 'document-outline', id: 'document-outline' },
        etch.dom(
          'ol',
          { 'class': 'list-tree' },
          this.outlineElements
        )
      );
    }
  }, {
    key: 'readAfterUpdate',
    value: function readAfterUpdate() {
      if (this.autoScroll && this.cursorPos) {
        var cursorPos = this.cursorPos;
        var range = undefined;
        var didFindDeepestItem = false;

        // NOTE: getElementsByClassName + filter should be much faster thant
        // querySelectorAll on .list-nested-item.current
        var elements = document.getElementsByClassName('list-nested-item');
        Array.from(elements).map(function (el) {
          return el.classList.remove('current');
        });

        for (var item of this.getDepthFirstItems(this.outline)) {
          range = item.range;
          if (range && range.containsPoint(cursorPos)) {
            var id = 'document-outline-' + item.range.start.row + '-' + item.range.end.row;
            var foundElement = document.getElementById(id);
            if (foundElement) {
              foundElement.scrollIntoView();
              if (!didFindDeepestItem) {
                // This is where to add stuff related to the currently active sub-heading
                // without affecting parents or children
                foundElement.classList.add('current');
                didFindDeepestItem = true;
              }
            }
          }
        }
      }
    }
  }, {
    key: 'getDepthFirstItems',
    value: function getDepthFirstItems(root) {
      // Lazily construct a flat list of items for (in theory) fast iteration
      function collectDepthFirst(item, out) {
        var child = undefined;
        if (Array.isArray(item)) {
          for (child of item) {
            collectDepthFirst(child, out);
          }
        } else {
          for (child of item.children) {
            collectDepthFirst(child, out);
          }
          out.push(item);
        }
      }
      // Lazily get the items depth first. On first run build a flat list of items
      if (!this._depthFirstItems || this._depthFirstItems.length === 0) {
        this._depthFirstItems = [];
        collectDepthFirst(root, this._depthFirstItems);
      }
      return this._depthFirstItems;
    }
  }]);

  return DocumentOutlineView;
})();

module.exports = { DocumentOutlineView: DocumentOutlineView };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90YW5lL0Ryb3Bib3gvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvZG9jdW1lbnQtb3V0bGluZS9saWIvZG9jdW1lbnQtb3V0bGluZS12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7OztBQUdaLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7ZUFDSCxPQUFPLENBQUMsZ0JBQWdCLENBQUM7O0lBQTVDLGVBQWUsWUFBZixlQUFlOztJQUVoQixtQkFBbUI7QUFFWixXQUZQLG1CQUFtQixHQUVUOzBCQUZWLG1CQUFtQjs7QUFHckIsUUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQztBQUN2QyxRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNsQixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDOztBQUUzQixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7QUFDeEUsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0FBQy9FLFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdkI7O2VBVkcsbUJBQW1COztXQVlMLDhCQUFHO0FBQ25CLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztLQUN4RDs7O1dBRU8sb0JBQUc7QUFDVCxhQUFPLFNBQVMsQ0FBQztLQUNsQjs7O1dBRVUsdUJBQUc7QUFDWixhQUFPLGdCQUFnQixDQUFDO0tBQ3pCOzs7V0FFSyxrQkFBRztBQUNQLGFBQU8saUNBQWlDLENBQUM7S0FDMUM7OztXQUVrQiwrQkFBRztBQUNwQixhQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzFCOzs7V0FFZ0IsNkJBQUc7QUFDbEIsYUFBTyxHQUFHLENBQUM7S0FDWjs7O1dBRUksaUJBQUc7QUFDTixVQUFJLENBQUMsTUFBTSxDQUFDLEVBQUMsT0FBTyxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUM7S0FDNUI7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuQixVQUFJLElBQUksQ0FBQywwQkFBMEIsRUFBRTtBQUNuQyxZQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDM0M7S0FDRjs7O1dBRVMsc0JBQUc7QUFDWCxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDckI7OztXQUVLLGdCQUFDLEtBQUssRUFBRTs7O1VBQ1AsT0FBTyxHQUFZLEtBQUssQ0FBeEIsT0FBTztVQUFFLE1BQU0sR0FBSSxLQUFLLENBQWYsTUFBTTs7QUFDcEIsVUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7OztBQUd2QixVQUFJLElBQUksQ0FBQywwQkFBMEIsRUFBRTtBQUNuQyxZQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDM0M7O0FBRUQsVUFBSSxNQUFNLEVBQUU7QUFDVixZQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDOztBQUVsRCxZQUFJLENBQUMsMEJBQTBCLEdBQUcsTUFBTSxDQUFDLHlCQUF5QixDQUFDLFVBQUEsS0FBSyxFQUFJO0FBQzFFLGNBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsS0FBSyxLQUFLLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO0FBQy9ELGtCQUFLLFNBQVMsR0FBRyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztBQUNsRCxtQkFBTyxJQUFJLENBQUMsTUFBTSxPQUFNLENBQUM7V0FDMUI7U0FDRixDQUFDLENBQUM7T0FDSjs7QUFFRCxVQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzNCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMxQjs7O1dBRUssa0JBQUc7OztBQUNQLFVBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDOUMsWUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFLLFNBQVMsQ0FBQztBQUNoQyxZQUFJLENBQUMsV0FBVyxHQUFHLE9BQUssV0FBVyxDQUFDO0FBQ3BDLFlBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztBQUMxRSxlQUFPLFNBQUMsZUFBZSxFQUFLLElBQUksQ0FBRyxDQUFDO09BQ3JDLENBQUMsQ0FBQzs7QUFFSCxhQUFPOztVQUFLLFNBQU0sa0JBQWtCLEVBQUMsRUFBRSxFQUFDLGtCQUFrQjtRQUN0RDs7WUFBSSxTQUFNLFdBQVc7VUFBRSxJQUFJLENBQUMsZUFBZTtTQUFNO09BQzdDLENBQUM7S0FDVjs7O1dBRWMsMkJBQUc7QUFDaEIsVUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDckMsWUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUMvQixZQUFJLEtBQUssWUFBQSxDQUFDO0FBQ1YsWUFBSSxrQkFBa0IsR0FBRyxLQUFLLENBQUM7Ozs7QUFJL0IsWUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDckUsYUFBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFLEVBQUk7QUFDN0IsaUJBQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdkMsQ0FBQyxDQUFDOztBQUVILGFBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUN0RCxlQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNuQixjQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQzNDLGdCQUFJLEVBQUUseUJBQXVCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsU0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEFBQUUsQ0FBQztBQUMxRSxnQkFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMvQyxnQkFBSSxZQUFZLEVBQUU7QUFDaEIsMEJBQVksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM5QixrQkFBSSxDQUFDLGtCQUFrQixFQUFFOzs7QUFHdkIsNEJBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3RDLGtDQUFrQixHQUFHLElBQUksQ0FBQztlQUMzQjthQUNGO1dBQ0Y7U0FDRjtPQUNGO0tBQ0Y7OztXQUVpQiw0QkFBQyxJQUFJLEVBQUU7O0FBRXZCLGVBQVMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtBQUNwQyxZQUFJLEtBQUssWUFBQSxDQUFDO0FBQ1YsWUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3ZCLGVBQUssS0FBSyxJQUFJLElBQUksRUFBRTtBQUNsQiw2QkFBaUIsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7V0FDL0I7U0FDRixNQUFNO0FBQ0wsZUFBSyxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUMzQiw2QkFBaUIsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7V0FDL0I7QUFDRCxhQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2hCO09BQ0Y7O0FBRUQsVUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNoRSxZQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzNCLHlCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztPQUNoRDtBQUNELGFBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0tBQzlCOzs7U0E3SUcsbUJBQW1COzs7QUFnSnpCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsRUFBQyxtQkFBbUIsRUFBbkIsbUJBQW1CLEVBQUMsQ0FBQyIsImZpbGUiOiIvVXNlcnMvdGFuZS9Ecm9wYm94L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2RvY3VtZW50LW91dGxpbmUvbGliL2RvY3VtZW50LW91dGxpbmUtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyoqIEBqc3ggZXRjaC5kb20gKi9cblxuY29uc3QgZXRjaCA9IHJlcXVpcmUoJ2V0Y2gnKTtcbmNvbnN0IHtPdXRsaW5lVHJlZVZpZXd9ID0gcmVxdWlyZSgnLi9vdXRsaW5lLXRyZWUnKTtcblxuY2xhc3MgRG9jdW1lbnRPdXRsaW5lVmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jdXJzb3JQb3NpdGlvblN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgdGhpcy5vdXRsaW5lID0gW107XG4gICAgdGhpcy5fZGVwdGhGaXJzdEl0ZW1zID0gW107XG5cbiAgICB0aGlzLmF1dG9TY3JvbGwgPSBhdG9tLmNvbmZpZy5nZXQoXCJkb2N1bWVudC1vdXRsaW5lLmF1dG9TY3JvbGxPdXRsaW5lXCIpO1xuICAgIHRoaXMuZG9IaWdobGlnaHQgPSBhdG9tLmNvbmZpZy5nZXQoXCJkb2N1bWVudC1vdXRsaW5lLmhpZ2hsaWdodEN1cnJlbnRTZWN0aW9uXCIpO1xuICAgIGV0Y2guaW5pdGlhbGl6ZSh0aGlzKTtcbiAgfVxuXG4gIGdldERlZmF1bHRMb2NhdGlvbigpIHtcbiAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KCdkb2N1bWVudC1vdXRsaW5lLmRlZmF1bHRTaWRlJyk7XG4gIH1cblxuICBnZXRUaXRsZSgpIHtcbiAgICByZXR1cm4gJ091dGxpbmUnO1xuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKSB7XG4gICAgcmV0dXJuICdsaXN0LXVub3JkZXJlZCc7XG4gIH1cblxuICBnZXRVUkkoKSB7XG4gICAgcmV0dXJuICdhdG9tOi8vZG9jdW1lbnQtb3V0bGluZS9vdXRsaW5lJztcbiAgfVxuXG4gIGdldEFsbG93ZWRMb2NhdGlvbnMoKSB7XG4gICAgcmV0dXJuIFsnbGVmdCcsICdyaWdodCddO1xuICB9XG5cbiAgZ2V0UHJlZmVycmVkV2lkdGgoKSB7XG4gICAgcmV0dXJuIDIwMDtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMudXBkYXRlKHtvdXRsaW5lOiBbXX0pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBldGNoLmRlc3Ryb3kodGhpcyk7XG4gICAgaWYgKHRoaXMuY3Vyc29yUG9zaXRpb25TdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuY3Vyc29yUG9zaXRpb25TdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudDtcbiAgfVxuXG4gIHVwZGF0ZShwcm9wcykge1xuICAgIGxldCB7b3V0bGluZSwgZWRpdG9yfSA9IHByb3BzO1xuICAgIHRoaXMub3V0bGluZSA9IG91dGxpbmU7XG4gICAgLy8gU2V0IHRoZSBvdXRsaW5lLCB3aGljaCBzaG91bGQgcmVidWlsZCB0aGUgRE9NIHRyZWVcbiAgICAvLyBDbGVhciBleGlzdGluZyBldmVudHMgYW5kIHJlLXN1YnNjcmliZSB0byBtYWtlIHN1cmUgd2UgZG9uJ3QgYWNjdW11bGF0ZSBzdWJzY3JpcHRpb25zXG4gICAgaWYgKHRoaXMuY3Vyc29yUG9zaXRpb25TdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuY3Vyc29yUG9zaXRpb25TdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgIH1cblxuICAgIGlmIChlZGl0b3IpIHtcbiAgICAgIHRoaXMuY3Vyc29yUG9zID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG5cbiAgICAgIHRoaXMuY3Vyc29yUG9zaXRpb25TdWJzY3JpcHRpb24gPSBlZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbihldmVudCA9PiB7XG4gICAgICAgIGlmIChldmVudC5vbGRCdWZmZXJQb3NpdGlvbi5yb3cgIT09IGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uLnJvdykge1xuICAgICAgICAgIHRoaXMuY3Vyc29yUG9zID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgICAgICAgcmV0dXJuIGV0Y2gudXBkYXRlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9kZXB0aEZpcnN0SXRlbXMgPSBbXTtcbiAgICByZXR1cm4gZXRjaC51cGRhdGUodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgdGhpcy5vdXRsaW5lRWxlbWVudHMgPSB0aGlzLm91dGxpbmUubWFwKHRyZWUgPT4ge1xuICAgICAgdHJlZS5jdXJzb3JQb3MgPSB0aGlzLmN1cnNvclBvcztcbiAgICAgIHRyZWUuZG9IaWdobGlnaHQgPSB0aGlzLmRvSGlnaGxpZ2h0O1xuICAgICAgdHJlZS5hdXRvQ29sbGFwc2UgPSBhdG9tLmNvbmZpZy5nZXQoJ2RvY3VtZW50LW91dGxpbmUuY29sbGFwc2VCeURlZmF1bHQnKTtcbiAgICAgIHJldHVybiA8T3V0bGluZVRyZWVWaWV3IHsuLi50cmVlfS8+O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3M9XCJkb2N1bWVudC1vdXRsaW5lXCIgaWQ9XCJkb2N1bWVudC1vdXRsaW5lXCI+XG4gICAgICAgIDxvbCBjbGFzcz1cImxpc3QtdHJlZVwiPnt0aGlzLm91dGxpbmVFbGVtZW50c308L29sPlxuICAgICAgPC9kaXY+O1xuICB9XG5cbiAgcmVhZEFmdGVyVXBkYXRlKCkge1xuICAgIGlmICh0aGlzLmF1dG9TY3JvbGwgJiYgdGhpcy5jdXJzb3JQb3MpIHtcbiAgICAgIGxldCBjdXJzb3JQb3MgPSB0aGlzLmN1cnNvclBvcztcbiAgICAgIGxldCByYW5nZTtcbiAgICAgIGxldCBkaWRGaW5kRGVlcGVzdEl0ZW0gPSBmYWxzZTtcblxuICAgICAgLy8gTk9URTogZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSArIGZpbHRlciBzaG91bGQgYmUgbXVjaCBmYXN0ZXIgdGhhbnRcbiAgICAgIC8vIHF1ZXJ5U2VsZWN0b3JBbGwgb24gLmxpc3QtbmVzdGVkLWl0ZW0uY3VycmVudFxuICAgICAgY29uc3QgZWxlbWVudHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdsaXN0LW5lc3RlZC1pdGVtJyk7XG4gICAgICBBcnJheS5mcm9tKGVsZW1lbnRzKS5tYXAoZWwgPT4ge1xuICAgICAgICByZXR1cm4gZWwuY2xhc3NMaXN0LnJlbW92ZSgnY3VycmVudCcpO1xuICAgICAgfSk7XG5cbiAgICAgIGZvciAobGV0IGl0ZW0gb2YgdGhpcy5nZXREZXB0aEZpcnN0SXRlbXModGhpcy5vdXRsaW5lKSkge1xuICAgICAgICByYW5nZSA9IGl0ZW0ucmFuZ2U7XG4gICAgICAgIGlmIChyYW5nZSAmJiByYW5nZS5jb250YWluc1BvaW50KGN1cnNvclBvcykpIHtcbiAgICAgICAgICBsZXQgaWQgPSBgZG9jdW1lbnQtb3V0bGluZS0ke2l0ZW0ucmFuZ2Uuc3RhcnQucm93fS0ke2l0ZW0ucmFuZ2UuZW5kLnJvd31gO1xuICAgICAgICAgIGxldCBmb3VuZEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgICAgaWYgKGZvdW5kRWxlbWVudCkge1xuICAgICAgICAgICAgZm91bmRFbGVtZW50LnNjcm9sbEludG9WaWV3KCk7XG4gICAgICAgICAgICBpZiAoIWRpZEZpbmREZWVwZXN0SXRlbSkge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIHdoZXJlIHRvIGFkZCBzdHVmZiByZWxhdGVkIHRvIHRoZSBjdXJyZW50bHkgYWN0aXZlIHN1Yi1oZWFkaW5nXG4gICAgICAgICAgICAgIC8vIHdpdGhvdXQgYWZmZWN0aW5nIHBhcmVudHMgb3IgY2hpbGRyZW5cbiAgICAgICAgICAgICAgZm91bmRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2N1cnJlbnQnKTtcbiAgICAgICAgICAgICAgZGlkRmluZERlZXBlc3RJdGVtID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXREZXB0aEZpcnN0SXRlbXMocm9vdCkge1xuICAgIC8vIExhemlseSBjb25zdHJ1Y3QgYSBmbGF0IGxpc3Qgb2YgaXRlbXMgZm9yIChpbiB0aGVvcnkpIGZhc3QgaXRlcmF0aW9uXG4gICAgZnVuY3Rpb24gY29sbGVjdERlcHRoRmlyc3QoaXRlbSwgb3V0KSB7XG4gICAgICBsZXQgY2hpbGQ7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVtKSkge1xuICAgICAgICBmb3IgKGNoaWxkIG9mIGl0ZW0pIHtcbiAgICAgICAgICBjb2xsZWN0RGVwdGhGaXJzdChjaGlsZCwgb3V0KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChjaGlsZCBvZiBpdGVtLmNoaWxkcmVuKSB7XG4gICAgICAgICAgY29sbGVjdERlcHRoRmlyc3QoY2hpbGQsIG91dCk7XG4gICAgICAgIH1cbiAgICAgICAgb3V0LnB1c2goaXRlbSk7XG4gICAgICB9XG4gICAgfVxuICAgICAgLy8gTGF6aWx5IGdldCB0aGUgaXRlbXMgZGVwdGggZmlyc3QuIE9uIGZpcnN0IHJ1biBidWlsZCBhIGZsYXQgbGlzdCBvZiBpdGVtc1xuICAgIGlmICghdGhpcy5fZGVwdGhGaXJzdEl0ZW1zIHx8IHRoaXMuX2RlcHRoRmlyc3RJdGVtcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuX2RlcHRoRmlyc3RJdGVtcyA9IFtdO1xuICAgICAgY29sbGVjdERlcHRoRmlyc3Qocm9vdCwgdGhpcy5fZGVwdGhGaXJzdEl0ZW1zKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2RlcHRoRmlyc3RJdGVtcztcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtEb2N1bWVudE91dGxpbmVWaWV3fTtcbiJdfQ==