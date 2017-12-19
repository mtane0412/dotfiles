(function() {
  module.exports = {
    config: require('./config-schema'),
    core: null,
    statusBar: null,
    activate: function() {
      this.core = require('./core');
      return this.statusBar = require('./status-bar');
    },
    deactivate: function() {
      this.core.destroy();
      this.statusBar.destroy();
      this.core = null;
      return this.statusBar = null;
    },
    consumeStatusBar: function(atomStatusBar) {
      return atom.config.observe('terminal-plus.core.statusBar', (function(_this) {
        return function(value) {
          _this.statusBar.destroyContainer();
          switch (value) {
            case "Full":
              return _this.statusBar.setContainer(atom.workspace.addBottomPanel({
                item: _this.statusBar,
                priority: 100
              }));
            case "Collapsed":
              return _this.statusBar.setContainer(atomStatusBar.addLeftTile({
                item: _this.statusBar,
                priority: 100
              }));
          }
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvdGVybWluYWwtcGx1cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQUFSO0lBQ0EsSUFBQSxFQUFNLElBRE47SUFFQSxTQUFBLEVBQVcsSUFGWDtJQUlBLFFBQUEsRUFBVSxTQUFBO01BQ1IsSUFBQyxDQUFBLElBQUQsR0FBUSxPQUFBLENBQVEsUUFBUjthQUNSLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBQSxDQUFRLGNBQVI7SUFGTCxDQUpWO0lBUUEsVUFBQSxFQUFZLFNBQUE7TUFDVixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQTtNQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFBO01BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTthQUNSLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFKSCxDQVJaO0lBY0EsZ0JBQUEsRUFBa0IsU0FBQyxhQUFEO2FBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQiw4QkFBcEIsRUFBb0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFDbEQsS0FBQyxDQUFBLFNBQVMsQ0FBQyxnQkFBWCxDQUFBO0FBRUEsa0JBQU8sS0FBUDtBQUFBLGlCQUNPLE1BRFA7cUJBRUksS0FBQyxDQUFBLFNBQVMsQ0FBQyxZQUFYLENBQXdCLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBZixDQUE4QjtnQkFDcEQsSUFBQSxFQUFNLEtBQUMsQ0FBQSxTQUQ2QztnQkFFcEQsUUFBQSxFQUFVLEdBRjBDO2VBQTlCLENBQXhCO0FBRkosaUJBTU8sV0FOUDtxQkFPSSxLQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBd0IsYUFBYSxDQUFDLFdBQWQsQ0FBMEI7Z0JBQ2hELElBQUEsRUFBTSxLQUFDLENBQUEsU0FEeUM7Z0JBRWhELFFBQUEsRUFBVSxHQUZzQztlQUExQixDQUF4QjtBQVBKO1FBSGtEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwRDtJQURnQixDQWRsQjs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOiByZXF1aXJlICcuL2NvbmZpZy1zY2hlbWEnXG4gIGNvcmU6IG51bGxcbiAgc3RhdHVzQmFyOiBudWxsXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQGNvcmUgPSByZXF1aXJlICcuL2NvcmUnXG4gICAgQHN0YXR1c0JhciA9IHJlcXVpcmUgJy4vc3RhdHVzLWJhcidcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBjb3JlLmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXIuZGVzdHJveSgpXG4gICAgQGNvcmUgPSBudWxsXG4gICAgQHN0YXR1c0JhciA9IG51bGxcblxuICBjb25zdW1lU3RhdHVzQmFyOiAoYXRvbVN0YXR1c0JhcikgLT5cbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICd0ZXJtaW5hbC1wbHVzLmNvcmUuc3RhdHVzQmFyJywgKHZhbHVlKSA9PlxuICAgICAgQHN0YXR1c0Jhci5kZXN0cm95Q29udGFpbmVyKClcblxuICAgICAgc3dpdGNoIHZhbHVlXG4gICAgICAgIHdoZW4gXCJGdWxsXCJcbiAgICAgICAgICBAc3RhdHVzQmFyLnNldENvbnRhaW5lciBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbCB7XG4gICAgICAgICAgICBpdGVtOiBAc3RhdHVzQmFyXG4gICAgICAgICAgICBwcmlvcml0eTogMTAwXG4gICAgICAgICAgfVxuICAgICAgICB3aGVuIFwiQ29sbGFwc2VkXCJcbiAgICAgICAgICBAc3RhdHVzQmFyLnNldENvbnRhaW5lciBhdG9tU3RhdHVzQmFyLmFkZExlZnRUaWxlIHtcbiAgICAgICAgICAgIGl0ZW06IEBzdGF0dXNCYXJcbiAgICAgICAgICAgIHByaW9yaXR5OiAxMDBcbiAgICAgICAgICB9XG4iXX0=
