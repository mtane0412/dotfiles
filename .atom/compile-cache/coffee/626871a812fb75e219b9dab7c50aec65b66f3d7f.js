(function() {
  var BrowserPlus, BrowserPlusModel, CompositeDisposable, uuid;

  CompositeDisposable = require('atom').CompositeDisposable;

  BrowserPlusModel = require('./browser-plus-model');

  require('JSON2');

  uuid = require('node-uuid');

  module.exports = BrowserPlus = {
    browserPlusView: null,
    subscriptions: null,
    config: {
      fav: {
        title: 'No of Favorites',
        type: 'number',
        "default": 10
      },
      homepage: {
        title: 'HomePage',
        type: 'string',
        "default": 'browser-plus://blank'
      },
      live: {
        title: 'Live Refresh in ',
        type: 'number',
        "default": 500
      },
      currentFile: {
        title: 'Show Current File',
        type: 'boolean',
        "default": true
      },
      openInSameWindow: {
        title: 'Open URLs in Same Window',
        type: 'array',
        "default": ['www.google.com', 'www.stackoverflow.com', 'google.com', 'stackoverflow.com']
      }
    },
    activate: function(state) {
      var $;
      if (!state.noReset) {
        state.favIcon = {};
        state.title = {};
        state.fav = [];
      }
      this.resources = (atom.packages.getPackageDirPaths()[0]) + "/browser-plus/resources/";
      require('jstorage');
      window.bp = {};
      $ = require('jquery');
      window.bp.js = $.extend({}, window.$.jStorage);
      if (!window.bp.js.get('bp.fav')) {
        window.bp.js.set('bp.fav', []);
      }
      if (!window.bp.js.get('bp.history')) {
        window.bp.js.set('bp.history', []);
      }
      if (!window.bp.js.get('bp.favIcon')) {
        window.bp.js.set('bp.favIcon', {});
      }
      if (!window.bp.js.get('bp.title')) {
        window.bp.js.set('bp.title', {});
      }
      atom.workspace.addOpener((function(_this) {
        return function(url, opt) {
          var editor, localhostPattern, pane, path;
          if (opt == null) {
            opt = {};
          }
          path = require('path');
          if (url.indexOf('http:') === 0 || url.indexOf('https:') === 0 || url.indexOf('localhost') === 0 || url.indexOf('file:') === 0 || url.indexOf('browser-plus:') === 0 || url.indexOf('browser-plus~') === 0) {
            localhostPattern = /^(http:\/\/)?localhost/i;
            if (!BrowserPlusModel.checkUrl(url)) {
              return false;
            }
            if (!(url === 'browser-plus://blank' || url.startsWith('file:///') || !opt.openInSameWindow)) {
              editor = BrowserPlusModel.getEditorForURI(url, opt.openInSameWindow);
              if (editor) {
                editor.setText(opt.src);
                if (!opt.src) {
                  editor.refresh(url);
                }
                pane = atom.workspace.paneForItem(editor);
                pane.activateItem(editor);
                return editor;
              }
            }
            return new BrowserPlusModel({
              browserPlus: _this,
              url: url,
              opt: opt
            });
          }
        };
      })(this));
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:open': (function(_this) {
          return function() {
            return _this.open();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:openCurrent': (function(_this) {
          return function() {
            return _this.open(true);
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:history': (function(_this) {
          return function() {
            return _this.history(true);
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:deleteHistory': (function(_this) {
          return function() {
            return _this["delete"](true);
          };
        })(this)
      }));
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'browser-plus:fav': (function(_this) {
          return function() {
            return _this.favr();
          };
        })(this)
      }));
    },
    favr: function() {
      var favList;
      favList = require('./fav-view');
      return new favList(window.bp.js.get('bp.fav'));
    },
    "delete": function() {
      return window.bp.js.set('bp.history', []);
    },
    history: function() {
      return atom.workspace.open("browser-plus://history", {
        split: 'left',
        searchAllPanes: true
      });
    },
    open: function(url, opt) {
      var editor, ref;
      if (opt == null) {
        opt = {};
      }
      if (!url && atom.config.get('browser-plus.currentFile')) {
        editor = atom.workspace.getActiveTextEditor();
        if (url = editor != null ? (ref = editor.buffer) != null ? ref.getUri() : void 0 : void 0) {
          url = "file:///" + url;
        }
      }
      if (!url) {
        url = atom.config.get('browser-plus.homepage');
      }
      if (!opt.split) {
        opt.split = this.getPosition();
      }
      return atom.workspace.open(url, opt);
    },
    getPosition: function() {
      var activePane, orientation, paneAxis, paneIndex, ref;
      activePane = atom.workspace.paneForItem(atom.workspace.getActiveTextEditor());
      if (!activePane) {
        return;
      }
      paneAxis = activePane.getParent();
      if (!paneAxis) {
        return;
      }
      paneIndex = paneAxis.getPanes().indexOf(activePane);
      orientation = (ref = paneAxis.orientation) != null ? ref : 'horizontal';
      if (orientation === 'horizontal') {
        if (paneIndex === 0) {
          return 'right';
        } else {
          return 'left';
        }
      } else {
        if (paneIndex === 0) {
          return 'down';
        } else {
          return 'up';
        }
      }
    },
    deactivate: function() {
      var ref;
      if ((ref = this.browserPlusView) != null) {
        if (typeof ref.destroy === "function") {
          ref.destroy();
        }
      }
      return this.subscriptions.dispose();
    },
    serialize: function() {
      return {
        noReset: true
      };
    },
    getBrowserPlusUrl: function(url) {
      if (url.startsWith('browser-plus://history')) {
        return url = this.resources + "history.html";
      } else {
        return url = '';
      }
    },
    addPlugin: function(requires) {
      var error, key, menu, pkg, pkgPath, pkgs, results, script, val;
      if (this.plugins == null) {
        this.plugins = {};
      }
      results = [];
      for (key in requires) {
        val = requires[key];
        try {
          switch (key) {
            case 'onInit' || 'onExit':
              results.push(this.plugins[key] = (this.plugins[key] || []).concat("(" + (val.toString()) + ")()"));
              break;
            case 'js' || 'css':
              if (!pkgPath) {
                pkgs = Object.keys(atom.packages.activatingPackages).sort();
                pkg = pkgs[pkgs.length - 1];
                pkgPath = atom.packages.activatingPackages[pkg].path + "/";
              }
              if (Array.isArray(val)) {
                results.push((function() {
                  var i, len, results1;
                  results1 = [];
                  for (i = 0, len = val.length; i < len; i++) {
                    script = val[i];
                    if (!script.startsWith('http')) {
                      results1.push(this.plugins[key + "s"] = (this.plugins[key] || []).concat('file:///' + atom.packages.activatingPackages[pkg].path.replace(/\\/g, "/") + "/" + script));
                    } else {
                      results1.push(void 0);
                    }
                  }
                  return results1;
                }).call(this));
              } else {
                if (!val.startsWith('http')) {
                  results.push(this.plugins[key + "s"] = (this.plugins[key] || []).concat('file:///' + atom.packages.activatingPackages[pkg].path.replace(/\\/g, "/") + "/" + val));
                } else {
                  results.push(void 0);
                }
              }
              break;
            case 'menus':
              if (Array.isArray(val)) {
                results.push((function() {
                  var i, len, results1;
                  results1 = [];
                  for (i = 0, len = val.length; i < len; i++) {
                    menu = val[i];
                    menu._id = uuid.v1();
                    results1.push(this.plugins[key] = (this.plugins[key] || []).concat(menu));
                  }
                  return results1;
                }).call(this));
              } else {
                val._id = uuid.v1();
                results.push(this.plugins[key] = (this.plugins[key] || []).concat(val));
              }
              break;
            default:
              results.push(void 0);
          }
        } catch (error1) {
          error = error1;
        }
      }
      return results;
    },
    provideService: function() {
      return {
        model: require('./browser-plus-model'),
        addPlugin: this.addPlugin.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvYnJvd3Nlci1wbHVzL2xpYi9icm93c2VyLXBsdXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQkFBUjs7RUFDbkIsT0FBQSxDQUFRLE9BQVI7O0VBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxXQUFSOztFQUNQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFdBQUEsR0FDZjtJQUFBLGVBQUEsRUFBaUIsSUFBakI7SUFDQSxhQUFBLEVBQWUsSUFEZjtJQUVBLE1BQUEsRUFDRTtNQUFBLEdBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxpQkFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxFQUZUO09BREY7TUFJQSxRQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sVUFBUDtRQUNBLElBQUEsRUFBTSxRQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxzQkFGVDtPQUxGO01BUUEsSUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGtCQUFQO1FBQ0EsSUFBQSxFQUFNLFFBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEdBRlQ7T0FURjtNQVlBLFdBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxtQkFBUDtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUZUO09BYkY7TUFnQkEsZ0JBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTywwQkFBUDtRQUNBLElBQUEsRUFBTSxPQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUFDLGdCQUFELEVBQWtCLHVCQUFsQixFQUEwQyxZQUExQyxFQUF1RCxtQkFBdkQsQ0FGVDtPQWpCRjtLQUhGO0lBd0JBLFFBQUEsRUFBVSxTQUFDLEtB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LENBQUEsT0FBUSxDQUFBLEdBQUEsQ0FBVCxHQUFnQixDQUFDLElBQUMsQ0FBQSxPQUFRLENBQUEsR0FBQSxDQUFULElBQWlCLEVBQWxCLENBQXFCLENBQUMsTUFBdEIsQ0FBNkIsR0FBN0IsR0FObEI7O0FBREc7QUFoQlA7O0FBQUEsV0FERjtTQUFBLGNBQUE7VUEwQk0sZUExQk47O0FBREY7O0lBRlMsQ0F6SFg7SUEwSkEsY0FBQSxFQUFnQixTQUFBO2FBQ2Q7UUFBQSxLQUFBLEVBQU0sT0FBQSxDQUFRLHNCQUFSLENBQU47UUFDQSxTQUFBLEVBQVcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLElBQWhCLENBRFg7O0lBRGMsQ0ExSmhCOztBQU5GIiwic291cmNlc0NvbnRlbnQiOlsiIyBhdG9tLnByb2plY3QucmVzb2x2ZVBhdGhcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5Ccm93c2VyUGx1c01vZGVsID0gcmVxdWlyZSAnLi9icm93c2VyLXBsdXMtbW9kZWwnXG5yZXF1aXJlICdKU09OMidcblxudXVpZCA9IHJlcXVpcmUgJ25vZGUtdXVpZCdcbm1vZHVsZS5leHBvcnRzID0gQnJvd3NlclBsdXMgPVxuICBicm93c2VyUGx1c1ZpZXc6IG51bGxcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuICBjb25maWc6XG4gICAgZmF2OlxuICAgICAgdGl0bGU6ICdObyBvZiBGYXZvcml0ZXMnXG4gICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgZGVmYXVsdDogMTBcbiAgICBob21lcGFnZTpcbiAgICAgIHRpdGxlOiAnSG9tZVBhZ2UnXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2Jyb3dzZXItcGx1czovL2JsYW5rJ1xuICAgIGxpdmU6XG4gICAgICB0aXRsZTogJ0xpdmUgUmVmcmVzaCBpbiAnXG4gICAgICB0eXBlOiAnbnVtYmVyJ1xuICAgICAgZGVmYXVsdDogNTAwXG4gICAgY3VycmVudEZpbGU6XG4gICAgICB0aXRsZTogJ1Nob3cgQ3VycmVudCBGaWxlJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgb3BlbkluU2FtZVdpbmRvdzpcbiAgICAgIHRpdGxlOiAnT3BlbiBVUkxzIGluIFNhbWUgV2luZG93J1xuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogWyd3d3cuZ29vZ2xlLmNvbScsJ3d3dy5zdGFja292ZXJmbG93LmNvbScsJ2dvb2dsZS5jb20nLCdzdGFja292ZXJmbG93LmNvbSddXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICB1bmxlc3Mgc3RhdGUubm9SZXNldFxuICAgICAgc3RhdGUuZmF2SWNvbiA9IHt9XG4gICAgICBzdGF0ZS50aXRsZSA9IHt9XG4gICAgICBzdGF0ZS5mYXYgPSBbXVxuICAgIEByZXNvdXJjZXMgPSBcIiN7YXRvbS5wYWNrYWdlcy5nZXRQYWNrYWdlRGlyUGF0aHMoKVswXX0vYnJvd3Nlci1wbHVzL3Jlc291cmNlcy9cIlxuICAgIHJlcXVpcmUgJ2pzdG9yYWdlJ1xuICAgIHdpbmRvdy5icCA9IHt9XG4gICAgJCA9IHJlcXVpcmUoJ2pxdWVyeScpXG4gICAgd2luZG93LmJwLmpzICA9ICQuZXh0ZW5kKHt9LHdpbmRvdy4kLmpTdG9yYWdlKVxuICAgIHdpbmRvdy5icC5qcy5zZXQoJ2JwLmZhdicsW10pIHVubGVzcyB3aW5kb3cuYnAuanMuZ2V0KCdicC5mYXYnKVxuICAgIHdpbmRvdy5icC5qcy5zZXQoJ2JwLmhpc3RvcnknLFtdKSAgdW5sZXNzIHdpbmRvdy5icC5qcy5nZXQoJ2JwLmhpc3RvcnknKVxuICAgIHdpbmRvdy5icC5qcy5zZXQoJ2JwLmZhdkljb24nLHt9KSAgdW5sZXNzIHdpbmRvdy5icC5qcy5nZXQoJ2JwLmZhdkljb24nKVxuICAgIHdpbmRvdy5icC5qcy5zZXQoJ2JwLnRpdGxlJyx7fSkgIHVubGVzcyB3aW5kb3cuYnAuanMuZ2V0KCdicC50aXRsZScpXG5cbiAgICBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIgKHVybCxvcHQ9e30pPT5cbiAgICAgIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuICAgICAgaWYgKCB1cmwuaW5kZXhPZignaHR0cDonKSBpcyAwIG9yIHVybC5pbmRleE9mKCdodHRwczonKSBpcyAwIG9yXG4gICAgICAgICAgdXJsLmluZGV4T2YoJ2xvY2FsaG9zdCcpIGlzIDAgb3IgdXJsLmluZGV4T2YoJ2ZpbGU6JykgaXMgMCBvclxuICAgICAgICAgIHVybC5pbmRleE9mKCdicm93c2VyLXBsdXM6JykgaXMgMCAgIG9yICNvciBvcHQuc3JjXG4gICAgICAgICAgdXJsLmluZGV4T2YoJ2Jyb3dzZXItcGx1c34nKSBpcyAwIClcbiAgICAgICAgIGxvY2FsaG9zdFBhdHRlcm4gPSAvLy9eXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaHR0cDovLyk/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbGhvc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL2lcbiAgICAgICAgIHJldHVybiBmYWxzZSB1bmxlc3MgQnJvd3NlclBsdXNNb2RlbC5jaGVja1VybCh1cmwpXG4gICAgICAgICAjICBjaGVjayBpZiBpdCBuZWVkIHRvIGJlIG9wZW4gaW4gc2FtZSB3aW5kb3dcbiAgICAgICAgIHVubGVzcyB1cmwgaXMgJ2Jyb3dzZXItcGx1czovL2JsYW5rJyBvciB1cmwuc3RhcnRzV2l0aCgnZmlsZTovLy8nKSBvciBub3Qgb3B0Lm9wZW5JblNhbWVXaW5kb3dcbiAgICAgICAgICAgZWRpdG9yID0gQnJvd3NlclBsdXNNb2RlbC5nZXRFZGl0b3JGb3JVUkkodXJsLG9wdC5vcGVuSW5TYW1lV2luZG93KVxuICAgICAgICAgICBpZiBlZGl0b3JcbiAgICAgICAgICAgICBlZGl0b3Iuc2V0VGV4dChvcHQuc3JjKVxuICAgICAgICAgICAgIGVkaXRvci5yZWZyZXNoKHVybCkgdW5sZXNzIG9wdC5zcmNcbiAgICAgICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yKVxuICAgICAgICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKGVkaXRvcilcbiAgICAgICAgICAgICByZXR1cm4gZWRpdG9yXG5cbiAgICAgICAgIyAgdXJsID0gdXJsLnJlcGxhY2UobG9jYWxob3N0UGF0dGVybiwnaHR0cDovLzEyNy4wLjAuMScpXG4gICAgICAgICBuZXcgQnJvd3NlclBsdXNNb2RlbCB7YnJvd3NlclBsdXM6QCx1cmw6dXJsLG9wdDpvcHR9XG5cbiAgICAjIEV2ZW50cyBzdWJzY3JpYmVkIHRvIGluIGF0b20ncyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgIyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2Jyb3dzZXItcGx1czpvcGVuJzogPT4gQG9wZW4oKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnYnJvd3Nlci1wbHVzOm9wZW5DdXJyZW50JzogPT4gQG9wZW4odHJ1ZSlcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2Jyb3dzZXItcGx1czpoaXN0b3J5JzogPT4gQGhpc3RvcnkodHJ1ZSlcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2Jyb3dzZXItcGx1czpkZWxldGVIaXN0b3J5JzogPT4gQGRlbGV0ZSh0cnVlKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnYnJvd3Nlci1wbHVzOmZhdic6ID0+IEBmYXZyKClcblxuICBmYXZyOiAtPlxuICAgIGZhdkxpc3QgPSByZXF1aXJlICcuL2Zhdi12aWV3J1xuICAgIG5ldyBmYXZMaXN0IHdpbmRvdy5icC5qcy5nZXQoJ2JwLmZhdicpXG5cbiAgZGVsZXRlOiAtPlxuICAgIHdpbmRvdy5icC5qcy5zZXQoJ2JwLmhpc3RvcnknLFtdKVxuXG4gIGhpc3Rvcnk6IC0+XG4gICAgIyBmaWxlOi8vLyN7QHJlc291cmNlc31oaXN0b3J5Lmh0bWxcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuIFwiYnJvd3Nlci1wbHVzOi8vaGlzdG9yeVwiICwge3NwbGl0OiAnbGVmdCcsc2VhcmNoQWxsUGFuZXM6dHJ1ZX1cblxuICBvcGVuOiAodXJsLG9wdCA9IHt9KS0+XG4gICAgaWYgKCBub3QgdXJsIGFuZCBhdG9tLmNvbmZpZy5nZXQoJ2Jyb3dzZXItcGx1cy5jdXJyZW50RmlsZScpKVxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBpZiB1cmwgPSBlZGl0b3I/LmJ1ZmZlcj8uZ2V0VXJpKClcbiAgICAgICAgdXJsID0gXCJmaWxlOi8vL1wiK3VybFxuICAgIHVubGVzcyB1cmxcbiAgICAgIHVybCA9IGF0b20uY29uZmlnLmdldCgnYnJvd3Nlci1wbHVzLmhvbWVwYWdlJylcblxuICAgIG9wdC5zcGxpdCA9IEBnZXRQb3NpdGlvbigpIHVubGVzcyBvcHQuc3BsaXRcbiAgICAjIHVybCA9IFwiYnJvd3Nlci1wbHVzOi8vcHJldmlld34je3VybH1cIiBpZiBzcmNcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuIHVybCwgb3B0XG5cbiAgZ2V0UG9zaXRpb246IC0+XG4gICAgYWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJldHVybiB1bmxlc3MgYWN0aXZlUGFuZVxuICAgIHBhbmVBeGlzID0gYWN0aXZlUGFuZS5nZXRQYXJlbnQoKVxuICAgIHJldHVybiB1bmxlc3MgcGFuZUF4aXNcbiAgICBwYW5lSW5kZXggPSBwYW5lQXhpcy5nZXRQYW5lcygpLmluZGV4T2YoYWN0aXZlUGFuZSlcbiAgICBvcmllbnRhdGlvbiA9IHBhbmVBeGlzLm9yaWVudGF0aW9uID8gJ2hvcml6b250YWwnXG4gICAgaWYgb3JpZW50YXRpb24gaXMgJ2hvcml6b250YWwnXG4gICAgICBpZiAgcGFuZUluZGV4IGlzIDAgdGhlbiAncmlnaHQnIGVsc2UgJ2xlZnQnXG4gICAgZWxzZVxuICAgICAgaWYgIHBhbmVJbmRleCBpcyAwIHRoZW4gJ2Rvd24nIGVsc2UgJ3VwJ1xuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGJyb3dzZXJQbHVzVmlldz8uZGVzdHJveT8oKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICBub1Jlc2V0OiB0cnVlXG5cbiAgZ2V0QnJvd3NlclBsdXNVcmw6ICh1cmwpLT5cbiAgICBpZiB1cmwuc3RhcnRzV2l0aCgnYnJvd3Nlci1wbHVzOi8vaGlzdG9yeScpXG4gICAgICB1cmwgPSBcIiN7QHJlc291cmNlc31oaXN0b3J5Lmh0bWxcIlxuICAgIGVsc2VcbiAgICAgIHVybCA9ICcnXG5cbiAgYWRkUGx1Z2luOiAocmVxdWlyZXMpLT5cbiAgICBAcGx1Z2lucyA/PSB7fVxuICAgIGZvciBrZXksdmFsIG9mIHJlcXVpcmVzXG4gICAgICB0cnlcbiAgICAgICAgc3dpdGNoIGtleVxuICAgICAgICAgIHdoZW4gJ29uSW5pdCcgb3IgJ29uRXhpdCdcbiAgICAgICAgICAgIEBwbHVnaW5zW2tleV0gPSAoQHBsdWdpbnNba2V5XSBvciBbXSkuY29uY2F0IFwiKCN7dmFsLnRvU3RyaW5nKCl9KSgpXCJcbiAgICAgICAgICB3aGVuICdqcycgb3IgJ2NzcydcbiAgICAgICAgICAgIHVubGVzcyAgcGtnUGF0aFxuICAgICAgICAgICAgICBwa2dzID0gT2JqZWN0LmtleXMoYXRvbS5wYWNrYWdlcy5hY3RpdmF0aW5nUGFja2FnZXMpLnNvcnQoKVxuICAgICAgICAgICAgICBwa2cgPSBwa2dzW3BrZ3MubGVuZ3RoIC0gMV1cbiAgICAgICAgICAgICAgcGtnUGF0aCA9IGF0b20ucGFja2FnZXMuYWN0aXZhdGluZ1BhY2thZ2VzW3BrZ10ucGF0aCArIFwiL1wiXG4gICAgICAgICAgICBpZiBBcnJheS5pc0FycmF5KHZhbClcbiAgICAgICAgICAgICAgZm9yIHNjcmlwdCBpbiB2YWxcbiAgICAgICAgICAgICAgICB1bmxlc3Mgc2NyaXB0LnN0YXJ0c1dpdGgoJ2h0dHAnKVxuICAgICAgICAgICAgICAgICAgQHBsdWdpbnNba2V5K1wic1wiXSA9IChAcGx1Z2luc1trZXldIG9yIFtdKS5jb25jYXQgJ2ZpbGU6Ly8vJythdG9tLnBhY2thZ2VzLmFjdGl2YXRpbmdQYWNrYWdlc1twa2ddLnBhdGgucmVwbGFjZSgvXFxcXC9nLFwiL1wiKSArIFwiL1wiICsgc2NyaXB0XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHVubGVzcyB2YWwuc3RhcnRzV2l0aCgnaHR0cCcpXG4gICAgICAgICAgICAgICAgQHBsdWdpbnNba2V5K1wic1wiXSA9IChAcGx1Z2luc1trZXldIG9yIFtdKS5jb25jYXQgJ2ZpbGU6Ly8vJysgYXRvbS5wYWNrYWdlcy5hY3RpdmF0aW5nUGFja2FnZXNbcGtnXS5wYXRoLnJlcGxhY2UoL1xcXFwvZyxcIi9cIikgKyBcIi9cIiArIHZhbFxuXG4gICAgICAgICAgd2hlbiAnbWVudXMnXG4gICAgICAgICAgICBpZiBBcnJheS5pc0FycmF5KHZhbClcbiAgICAgICAgICAgICAgZm9yIG1lbnUgaW4gdmFsXG4gICAgICAgICAgICAgICAgbWVudS5faWQgPSB1dWlkLnYxKClcbiAgICAgICAgICAgICAgICBAcGx1Z2luc1trZXldID0gKEBwbHVnaW5zW2tleV0gb3IgW10pLmNvbmNhdCBtZW51XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHZhbC5faWQgPSB1dWlkLnYxKClcbiAgICAgICAgICAgICAgQHBsdWdpbnNba2V5XSA9IChAcGx1Z2luc1trZXldIG9yIFtdKS5jb25jYXQgdmFsXG5cbiAgICAgIGNhdGNoIGVycm9yXG5cblxuXG4gIHByb3ZpZGVTZXJ2aWNlOiAtPlxuICAgIG1vZGVsOnJlcXVpcmUgJy4vYnJvd3Nlci1wbHVzLW1vZGVsJ1xuICAgIGFkZFBsdWdpbjogQGFkZFBsdWdpbi5iaW5kKEApXG4iXX0=
