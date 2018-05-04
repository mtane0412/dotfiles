'use babel';
/** @jsx etch.dom */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var etch = require('etch');

var _require = require('atom');

var Point = _require.Point;

etch.setScheduler(atom.views);

var OutlineTreeView = (function () {
  function OutlineTreeView(props) {
    _classCallCheck(this, OutlineTreeView);

    this.plainText = props.plainText;
    this.childOutlines = props.children ? props.children : [];
    this.startRow = props.startPosition ? props.startPosition.row : null;
    this.endRow = props.endPosition ? props.endPosition.row : null;
    for (var child of this.childOutlines) {
      child.doHighlight = props.doHighlight;
      child.cursorPos = props.cursorPos;
    }
    this.highlight = '';
    if (props.cursorPos) {
      if (props.cursorPos >= this.startRow && props.cursorPos < this.endRow && props.doHighlight) {
        this.highlight = 'item-highlight';
      }
    }
    this.autoCollapse = props.autoCollapse;
    this.showChildren = true;
    this.updateIcon();
    etch.initialize(this);
  }

  _createClass(OutlineTreeView, [{
    key: 'update',
    value: function update(props) {
      // this.cursorPos = props.cursorPos;
      this.plainText = props.plainText;
      this.childOutlines = props.children;
      this.startRow = props.startPosition ? props.startPosition.row : null;
      this.endRow = props.endPosition ? props.endPosition.row : null;

      for (var child of this.childOutlines) {
        child.doHighlight = props.doHighlight;
        child.cursorPos = props.cursorPos;
        child.autoCollapse = props.autoCollapse;
      }

      this.highlight = '';
      if (props.cursorPos) {
        if (props.cursorPos.row >= this.startRow && props.cursorPos.row < this.endRow && props.doHighlight) {
          this.highlight = 'item-highlight';
          this.showChildren = true;
        } else {
          // False if autoCollapse is set, True otherwise
          this.showChildren = !props.autoCollapse;
        }
      }
      this.updateIcon();
      return etch.update(this);
    }
  }, {
    key: 'render',
    value: function render() {
      var sublist = etch.dom('span', null);

      if (this.childOutlines && this.showChildren) {
        sublist = etch.dom(
          'ol',
          { 'class': 'list-tree' },
          this.childOutlines.map(function (child) {
            return etch.dom(OutlineTreeView, child);
          })
        );
      }

      var iconClass = 'icon ' + this.icon;
      var itemClass = 'list-nested-item list-selectable-item ' + this.highlight;
      var itemId = 'document-outline-' + this.startRow + '-' + this.endRow;

      return etch.dom(
        'div',
        { 'class': itemClass,
          startrow: this.startRow, endrow: this.endRow,
          id: itemId,
          key: itemId,
          ref: 'outlineElement'
        },
        etch.dom('span', { 'class': iconClass, on: { click: this.toggleSubtree } }),
        etch.dom(
          'span',
          { 'class': 'tree-item-text', on: {
              click: this.didClick,
              dblclick: this.toggleSubtree } },
          this.plainText
        ),
        sublist
      );
      // draggable="true"
    }

    // // Optional: Destroy the component. Async/await syntax is pretty but optional.
    // async destroy () {
    //   // call etch.destroy to remove the element and destroy child components
    //   await etch.destroy(this)
    //   // then perform custom teardown logic here...
    // }

  }, {
    key: 'didClick',
    value: function didClick() {
      var editor = atom.workspace.getActiveTextEditor();
      var cursorPos = editor.getCursorBufferPosition();
      var documentPos = new Point(this.startRow - 1, 0);
      editor.scrollToBufferPosition(documentPos, { center: true });
      atom.views.getView(editor).focus();

      // NOTE: don't reset to cursor position if we autoCollapse
      // because that would reset the outline view again!
      if (!this.autoCollapse) {
        editor.setCursorBufferPosition(cursorPos, { autoscroll: false });
      }
    }
  }, {
    key: 'toggleSubtree',
    value: function toggleSubtree() {
      this.showChildren = !this.showChildren;
      this.updateIcon();
      return etch.update(this);
    }
  }, {
    key: 'updateIcon',
    value: function updateIcon() {
      if (this.childOutlines && this.childOutlines.length > 0 && this.showChildren) {
        this.icon = 'icon-chevron-down';
      } else if (this.childOutlines && this.childOutlines.length > 0 && !this.showChildren) {
        this.icon = 'icon-chevron-right';
      } else {
        this.icon = 'icon-one-dot';
      }
    }
  }]);

  return OutlineTreeView;
})();

module.exports = { OutlineTreeView: OutlineTreeView };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90YW5lL0Ryb3Bib3gvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvZG9jdW1lbnQtb3V0bGluZS9saWIvb3V0bGluZS10cmVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7OztBQUdaLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7ZUFDYixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4QixLQUFLLFlBQUwsS0FBSzs7QUFFWixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7SUFFeEIsZUFBZTtBQUNSLFdBRFAsZUFBZSxDQUNQLEtBQUssRUFBRTswQkFEZixlQUFlOztBQUVqQixRQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDakMsUUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQzFELFFBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7QUFDckUsUUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUMvRCxTQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDcEMsV0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQ3RDLFdBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztLQUNuQztBQUNELFFBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFFBQUksS0FBSyxDQUFDLFNBQVMsRUFBRTtBQUNuQixVQUFJLEtBQUssQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFFBQVEs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QUFhLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQzVFLFlBQUksQ0FBQyxJQUFJLEdBQUcsbUJBQW1CLENBQUM7T0FDakMsTUFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtBQUNwRixZQUFJLENBQUMsSUFBSSxHQUFHLG9CQUFvQixDQUFDO09BQ2xDLE1BQU07QUFDTCxZQUFJLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQztPQUM1QjtLQUNGOzs7U0FsSEcsZUFBZTs7O0FBcUhyQixNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUMsZUFBZSxFQUFmLGVBQWUsRUFBQyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy90YW5lL0Ryb3Bib3gvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvZG9jdW1lbnQtb3V0bGluZS9saWIvb3V0bGluZS10cmVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiogQGpzeCBldGNoLmRvbSAqL1xuXG5jb25zdCBldGNoID0gcmVxdWlyZSgnZXRjaCcpO1xuY29uc3Qge1BvaW50fSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuZXRjaC5zZXRTY2hlZHVsZXIoYXRvbS52aWV3cyk7XG5cbmNsYXNzIE91dGxpbmVUcmVlVmlldyB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgdGhpcy5wbGFpblRleHQgPSBwcm9wcy5wbGFpblRleHQ7XG4gICAgdGhpcy5jaGlsZE91dGxpbmVzID0gcHJvcHMuY2hpbGRyZW4gPyBwcm9wcy5jaGlsZHJlbiA6IFtdO1xuICAgIHRoaXMuc3RhcnRSb3cgPSBwcm9wcy5zdGFydFBvc2l0aW9uID8gcHJvcHMuc3RhcnRQb3NpdGlvbi5yb3cgOiBudWxsO1xuICAgIHRoaXMuZW5kUm93ID0gcHJvcHMuZW5kUG9zaXRpb24gPyBwcm9wcy5lbmRQb3NpdGlvbi5yb3cgOiBudWxsO1xuICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRPdXRsaW5lcykge1xuICAgICAgY2hpbGQuZG9IaWdobGlnaHQgPSBwcm9wcy5kb0hpZ2hsaWdodDtcbiAgICAgIGNoaWxkLmN1cnNvclBvcyA9IHByb3BzLmN1cnNvclBvcztcbiAgICB9XG4gICAgdGhpcy5oaWdobGlnaHQgPSAnJztcbiAgICBpZiAocHJvcHMuY3Vyc29yUG9zKSB7XG4gICAgICBpZiAocHJvcHMuY3Vyc29yUG9zID49IHRoaXMuc3RhcnRSb3cgJiYgcHJvcHMuY3Vyc29yUG9zIDwgdGhpcy5lbmRSb3cgJiYgcHJvcHMuZG9IaWdobGlnaHQpIHtcbiAgICAgICAgdGhpcy5oaWdobGlnaHQgPSAnaXRlbS1oaWdobGlnaHQnO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmF1dG9Db2xsYXBzZSA9IHByb3BzLmF1dG9Db2xsYXBzZTtcbiAgICB0aGlzLnNob3dDaGlsZHJlbiA9IHRydWU7XG4gICAgdGhpcy51cGRhdGVJY29uKCk7XG4gICAgZXRjaC5pbml0aWFsaXplKHRoaXMpO1xuICB9XG5cbiAgdXBkYXRlKHByb3BzKSB7XG4gICAgLy8gdGhpcy5jdXJzb3JQb3MgPSBwcm9wcy5jdXJzb3JQb3M7XG4gICAgdGhpcy5wbGFpblRleHQgPSBwcm9wcy5wbGFpblRleHQ7XG4gICAgdGhpcy5jaGlsZE91dGxpbmVzID0gcHJvcHMuY2hpbGRyZW47XG4gICAgdGhpcy5zdGFydFJvdyA9IHByb3BzLnN0YXJ0UG9zaXRpb24gPyBwcm9wcy5zdGFydFBvc2l0aW9uLnJvdyA6IG51bGw7XG4gICAgdGhpcy5lbmRSb3cgPSBwcm9wcy5lbmRQb3NpdGlvbiA/IHByb3BzLmVuZFBvc2l0aW9uLnJvdyA6IG51bGw7XG5cbiAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkT3V0bGluZXMpIHtcbiAgICAgIGNoaWxkLmRvSGlnaGxpZ2h0ID0gcHJvcHMuZG9IaWdobGlnaHQ7XG4gICAgICBjaGlsZC5jdXJzb3JQb3MgPSBwcm9wcy5jdXJzb3JQb3M7XG4gICAgICBjaGlsZC5hdXRvQ29sbGFwc2UgPSBwcm9wcy5hdXRvQ29sbGFwc2U7XG4gICAgfVxuXG4gICAgdGhpcy5oaWdobGlnaHQgPSAnJztcbiAgICBpZiAocHJvcHMuY3Vyc29yUG9zKSB7XG4gICAgICBpZiAocHJvcHMuY3Vyc29yUG9zLnJvdyA+PSB0aGlzLnN0YXJ0Um93ICYmIHByb3BzLmN1cnNvclBvcy5yb3cgPCB0aGlzLmVuZFJvdyAmJiBwcm9wcy5kb0hpZ2hsaWdodCkge1xuICAgICAgICB0aGlzLmhpZ2hsaWdodCA9ICdpdGVtLWhpZ2hsaWdodCc7XG4gICAgICAgIHRoaXMuc2hvd0NoaWxkcmVuID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZhbHNlIGlmIGF1dG9Db2xsYXBzZSBpcyBzZXQsIFRydWUgb3RoZXJ3aXNlXG4gICAgICAgIHRoaXMuc2hvd0NoaWxkcmVuID0gIXByb3BzLmF1dG9Db2xsYXBzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy51cGRhdGVJY29uKCk7XG4gICAgcmV0dXJuIGV0Y2gudXBkYXRlKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCBzdWJsaXN0ID0gPHNwYW4+PC9zcGFuPjtcblxuICAgIGlmICh0aGlzLmNoaWxkT3V0bGluZXMgJiYgdGhpcy5zaG93Q2hpbGRyZW4pIHtcbiAgICAgIHN1Ymxpc3QgPSA8b2wgY2xhc3M9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAgICB7dGhpcy5jaGlsZE91dGxpbmVzLm1hcChjaGlsZCA9PiB7XG4gICAgICAgICAgICByZXR1cm4gPE91dGxpbmVUcmVlVmlldyB7Li4uY2hpbGR9Lz47XG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvb2w+O1xuICAgIH1cblxuICAgIGxldCBpY29uQ2xhc3MgPSBgaWNvbiAke3RoaXMuaWNvbn1gO1xuICAgIGxldCBpdGVtQ2xhc3MgPSBgbGlzdC1uZXN0ZWQtaXRlbSBsaXN0LXNlbGVjdGFibGUtaXRlbSAke3RoaXMuaGlnaGxpZ2h0fWA7XG4gICAgbGV0IGl0ZW1JZCA9IGBkb2N1bWVudC1vdXRsaW5lLSR7dGhpcy5zdGFydFJvd30tJHt0aGlzLmVuZFJvd31gO1xuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3M9e2l0ZW1DbGFzc31cbiAgICBzdGFydHJvdz17dGhpcy5zdGFydFJvd30gZW5kcm93PXt0aGlzLmVuZFJvd31cbiAgICBpZD17aXRlbUlkfVxuICAgIGtleT17aXRlbUlkfVxuICAgIHJlZj1cIm91dGxpbmVFbGVtZW50XCJcbiAgICA+XG4gICAgPHNwYW4gY2xhc3M9e2ljb25DbGFzc30gb249e3tjbGljazogdGhpcy50b2dnbGVTdWJ0cmVlfX0+PC9zcGFuPlxuICAgIDxzcGFuIGNsYXNzPVwidHJlZS1pdGVtLXRleHRcIiBvbj17e1xuICAgICAgY2xpY2s6IHRoaXMuZGlkQ2xpY2ssXG4gICAgICBkYmxjbGljazogdGhpcy50b2dnbGVTdWJ0cmVlfX0+XG4gICAge3RoaXMucGxhaW5UZXh0fTwvc3Bhbj5cbiAgICB7c3VibGlzdH1cbiAgICA8L2Rpdj47XG4gICAgLy8gZHJhZ2dhYmxlPVwidHJ1ZVwiXG4gIH1cbiAgLy8gLy8gT3B0aW9uYWw6IERlc3Ryb3kgdGhlIGNvbXBvbmVudC4gQXN5bmMvYXdhaXQgc3ludGF4IGlzIHByZXR0eSBidXQgb3B0aW9uYWwuXG4gIC8vIGFzeW5jIGRlc3Ryb3kgKCkge1xuICAvLyAgIC8vIGNhbGwgZXRjaC5kZXN0cm95IHRvIHJlbW92ZSB0aGUgZWxlbWVudCBhbmQgZGVzdHJveSBjaGlsZCBjb21wb25lbnRzXG4gIC8vICAgYXdhaXQgZXRjaC5kZXN0cm95KHRoaXMpXG4gIC8vICAgLy8gdGhlbiBwZXJmb3JtIGN1c3RvbSB0ZWFyZG93biBsb2dpYyBoZXJlLi4uXG4gIC8vIH1cblxuICBkaWRDbGljaygpIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgY29uc3QgY3Vyc29yUG9zID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgY29uc3QgZG9jdW1lbnRQb3MgPSBuZXcgUG9pbnQodGhpcy5zdGFydFJvdyAtIDEsIDApO1xuICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKGRvY3VtZW50UG9zLCB7Y2VudGVyOiB0cnVlfSk7XG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcikuZm9jdXMoKTtcblxuICAgIC8vIE5PVEU6IGRvbid0IHJlc2V0IHRvIGN1cnNvciBwb3NpdGlvbiBpZiB3ZSBhdXRvQ29sbGFwc2VcbiAgICAvLyBiZWNhdXNlIHRoYXQgd291bGQgcmVzZXQgdGhlIG91dGxpbmUgdmlldyBhZ2FpbiFcbiAgICBpZiAoIXRoaXMuYXV0b0NvbGxhcHNlKSB7XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oY3Vyc29yUG9zLCB7YXV0b3Njcm9sbDogZmFsc2V9KTtcbiAgICB9XG4gIH1cblxuICB0b2dnbGVTdWJ0cmVlKCkge1xuICAgIHRoaXMuc2hvd0NoaWxkcmVuID0gIXRoaXMuc2hvd0NoaWxkcmVuO1xuICAgIHRoaXMudXBkYXRlSWNvbigpO1xuICAgIHJldHVybiBldGNoLnVwZGF0ZSh0aGlzKTtcbiAgfVxuXG4gIHVwZGF0ZUljb24oKSB7XG4gICAgaWYgKHRoaXMuY2hpbGRPdXRsaW5lcyAmJiB0aGlzLmNoaWxkT3V0bGluZXMubGVuZ3RoID4gMCAmJiB0aGlzLnNob3dDaGlsZHJlbikge1xuICAgICAgdGhpcy5pY29uID0gJ2ljb24tY2hldnJvbi1kb3duJztcbiAgICB9IGVsc2UgaWYgKHRoaXMuY2hpbGRPdXRsaW5lcyAmJiB0aGlzLmNoaWxkT3V0bGluZXMubGVuZ3RoID4gMCAmJiAhdGhpcy5zaG93Q2hpbGRyZW4pIHtcbiAgICAgIHRoaXMuaWNvbiA9ICdpY29uLWNoZXZyb24tcmlnaHQnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmljb24gPSAnaWNvbi1vbmUtZG90JztcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7T3V0bGluZVRyZWVWaWV3fTtcbiJdfQ==