(function() {
  var CompositeDisposable, Core, PanelView, Path, StatusBar, TabView, exports,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  PanelView = null;

  TabView = null;

  StatusBar = null;

  Path = require('path');

  Core = (function() {
    Core.prototype.subscriptions = null;

    Core.prototype.activeTerminal = null;

    Core.prototype.terminals = [];

    Core.prototype.returnFocus = false;

    function Core() {
      this.moveTerminal = bind(this.moveTerminal, this);
      this.newTerminalView = bind(this.newTerminalView, this);
      this.closeAll = bind(this.closeAll, this);
      this.subscriptions = new CompositeDisposable();
      this.registerCommands();
      this.registerActiveItemSubscription();
      this.registerWindowEvents();
    }

    Core.prototype.destroy = function() {
      var j, len, ref, results, terminal;
      this.subscriptions.dispose();
      ref = this.terminals;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        terminal = ref[j];
        results.push(terminal.destroy());
      }
      return results;
    };


    /*
    Section: Setup
     */

    Core.prototype.registerCommands = function() {
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'terminal-plus:new': (function(_this) {
          return function() {
            var ref;
            return (ref = _this.newTerminalView()) != null ? ref.toggle() : void 0;
          };
        })(this),
        'terminal-plus:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'terminal-plus:next': (function(_this) {
          return function() {
            if (_this.activateNextTerminal()) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'terminal-plus:prev': (function(_this) {
          return function() {
            if (_this.activatePrevTerminal()) {
              return _this.activeTerminal.open();
            }
          };
        })(this),
        'terminal-plus:close': (function(_this) {
          return function() {
            return _this.destroyActiveTerminal();
          };
        })(this),
        'terminal-plus:close-all': (function(_this) {
          return function() {
            return _this.closeAll();
          };
        })(this),
        'terminal-plus:rename': (function(_this) {
          return function() {
            return _this.runInActiveTerminal(function(i) {
              return i.promptForRename();
            });
          };
        })(this),
        'terminal-plus:insert-selected-text': (function(_this) {
          return function() {
            return _this.runInActiveTerminal(function(i) {
              return i.insertSelection();
            });
          };
        })(this),
        'terminal-plus:insert-text': (function(_this) {
          return function() {
            return _this.runInActiveTerminal(function(i) {
              return i.promptForInput();
            });
          };
        })(this),
        'terminal-plus:toggle-focus': (function(_this) {
          return function() {
            return _this.runInActiveTerminal(function(i) {
              return i.toggleFocus();
            });
          };
        })(this),
        'terminal-plus:toggle-full-screen': (function(_this) {
          return function() {
            return _this.runInActiveTerminal(function(i) {
              return i.toggleFullscreen();
            });
          };
        })(this)
      }));
      return this.subscriptions.add(atom.commands.add('.xterm', {
        'terminal-plus:paste': (function(_this) {
          return function() {
            return _this.runInActiveTerminal(function(i) {
              return i.paste();
            });
          };
        })(this),
        'terminal-plus:copy': (function(_this) {
          return function() {
            return _this.runInActiveTerminal(function(i) {
              return i.copy();
            });
          };
        })(this)
      }));
    };

    Core.prototype.registerActiveItemSubscription = function() {
      return this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(item) {
          var mapping, nextTerminal, prevTerminal, ref;
          if (item == null) {
            return;
          }
          if (item.constructor.name === "TabView") {
            return setTimeout(item.focus, 100);
          } else if (item.constructor.name === "TextEditor") {
            mapping = atom.config.get('terminal-plus.core.mapTerminalsTo');
            if (mapping === 'None') {
              return;
            }
            switch (mapping) {
              case 'File':
                nextTerminal = _this.findFirstTerminal(function(terminal) {
                  return item.getPath() === terminal.getId().filePath;
                });
                break;
              case 'Folder':
                nextTerminal = _this.findFirstTerminal(function(terminal) {
                  return Path.dirname(item.getPath()) === terminal.getId().folderPath;
                });
            }
            prevTerminal = _this.getActiveTerminal();
            if (prevTerminal !== nextTerminal) {
              if (nextTerminal == null) {
                if (item.getTitle() !== 'untitled') {
                  if (atom.config.get('terminal-plus.core.mapTerminalsToAutoOpen')) {
                    return nextTerminal = _this.createTerminalView().getTerminal();
                  }
                }
              } else {
                _this.setActiveTerminal(nextTerminal);
                if ((ref = prevTerminal.getParentView()) != null ? ref.panel.isVisible() : void 0) {
                  return nextTerminal.getParentView().toggle();
                }
              }
            }
          }
        };
      })(this)));
    };

    Core.prototype.registerWindowEvents = function() {
      var handleBlur, handleFocus;
      handleBlur = (function(_this) {
        return function() {
          if (_this.activeTerminal && _this.activeTerminal.isFocused()) {
            _this.returnFocus = true;
            return _this.activeTerminal.getParentView().blur();
          }
        };
      })(this);
      handleFocus = (function(_this) {
        return function() {
          if (_this.returnFocus && _this.activeTerminal) {
            return setTimeout(function() {
              _this.activeTerminal.focus();
              return _this.returnFocus = false;
            }, 100);
          }
        };
      })(this);
      window.addEventListener('blur', handleBlur);
      this.subscriptions.add({
        dispose: function() {
          return window.removeEventListener('blur', handleBlur);
        }
      });
      window.addEventListener('focus', handleFocus);
      return this.subscriptions.add({
        dispose: function() {
          return window.removeEventListener('focus', handleFocus);
        }
      });
    };


    /*
    Section: Command Handling
     */

    Core.prototype.activateNextTerminal = function() {
      var index;
      if ((!this.activeTerminal) || this.activeTerminal.isAnimating()) {
        return false;
      }
      index = this.terminals.indexOf(this.activeTerminal);
      if (index < 0) {
        return false;
      }
      return this.activateTerminalAtIndex(index + 1);
    };

    Core.prototype.activatePrevTerminal = function() {
      var index;
      if ((!this.activeTerminal) || this.activeTerminal.isAnimating()) {
        return false;
      }
      index = this.terminals.indexOf(this.activeTerminal);
      if (index < 0) {
        return false;
      }
      return this.activateTerminalAtIndex(index - 1);
    };

    Core.prototype.closeAll = function() {
      var j, len, panel, panels;
      panels = this.getPanelViews();
      this.terminals = this.getTabViews();
      for (j = 0, len = panels.length; j < len; j++) {
        panel = panels[j];
        panel.getParentView().destroy();
      }
      return this.activeTerminal = this.terminals[0];
    };

    Core.prototype.destroyActiveTerminal = function() {
      var index, pane, parent;
      if (this.activeTerminal == null) {
        return;
      }
      index = this.terminals.indexOf(this.activeTerminal);
      this.removeTerminalAt(index);
      if (this.activeTerminal.isTabView()) {
        parent = this.activeTerminal.getParentView();
        if (pane = atom.workspace.paneForItem(parent)) {
          pane.destroyItem(parent);
        }
      } else {
        this.activeTerminal.getParentView().destroy();
      }
      this.activeTerminal = null;
      return this.activateAdjacentTerminal(index);
    };

    Core.prototype.newTerminalView = function() {
      var terminalView;
      if (PanelView == null) {
        PanelView = require('./panel-view');
      }
      if (TabView == null) {
        TabView = require('./tab-view');
      }
      if (StatusBar == null) {
        StatusBar = require('./status-bar');
      }
      StatusBar.registerPaneSubscription();
      if (this.activeTerminal && this.activeTerminal.isAnimating()) {
        return null;
      }
      terminalView = this.createTerminalView();
      this.terminals.push(terminalView.getTerminal());
      return terminalView;
    };

    Core.prototype.runInActiveTerminal = function(callback) {
      var terminal;
      terminal = this.getActiveTerminal();
      if (terminal != null) {
        return callback(terminal);
      }
      return null;
    };

    Core.prototype.toggle = function() {
      if (this.activeTerminal && this.activeTerminal.isAnimating()) {
        return;
      }
      if (this.terminals.length === 0) {
        this.activeTerminal = this.newTerminalView().getTerminal();
      } else if (this.activeTerminal === null) {
        this.activeTerminal = this.terminals[0];
      }
      return this.activeTerminal.toggle();
    };


    /*
    Section: External Methods
     */

    Core.prototype.getActiveTerminal = function() {
      return this.activeTerminal;
    };

    Core.prototype.getActiveTerminalView = function() {
      return this.activeTerminal.getParentView();
    };

    Core.prototype.getTerminals = function() {
      return this.terminals;
    };

    Core.prototype.length = function() {
      return this.terminals.length;
    };

    Core.prototype.removeTerminal = function(terminal) {
      var index;
      index = this.terminals.indexOf(terminal);
      if (index < 0) {
        return;
      }
      this.terminals.splice(index, 1);
      if (terminal === this.activeTerminal) {
        if (!this.activateAdjacentTerminal()) {
          return this.activeTerminal = null;
        }
      }
    };

    Core.prototype.removeTerminalAt = function(index) {
      if (index < 0 || index > this.terminals.length) {
        return;
      }
      return this.terminals.splice(index, 1)[0];
    };

    Core.prototype.removeTerminalView = function(view) {
      return this.removeTerminal(view.getTerminal());
    };

    Core.prototype.setActiveTerminal = function(terminal) {
      return this.activeTerminal = terminal;
    };

    Core.prototype.setActiveTerminalView = function(view) {
      return this.setActiveTerminal(view.getTerminal());
    };

    Core.prototype.terminalAt = function(index) {
      return this.terminals[index];
    };

    Core.prototype.moveTerminal = function(fromIndex, toIndex) {
      var terminal;
      fromIndex = Math.max(0, fromIndex);
      toIndex = Math.min(toIndex, this.terminals.length);
      terminal = this.terminals.splice(fromIndex, 1)[0];
      return this.terminals.splice(toIndex, 0, terminal);
    };


    /*
    Section: Helper Methods
     */

    Core.prototype.activateAdjacentTerminal = function(index) {
      if (index == null) {
        index = 0;
      }
      if (!(this.terminals.length > 0)) {
        return false;
      }
      index = Math.max(0, index - 1);
      return this.activeTerminal = this.terminals[index];
    };

    Core.prototype.activateTerminalAtIndex = function(index) {
      if (this.terminals.length < 2) {
        return false;
      }
      if (index >= this.terminals.length) {
        index = 0;
      }
      if (index < 0) {
        index = this.terminals.length - 1;
      }
      this.activeTerminal = this.terminals[index];
      return true;
    };

    Core.prototype.createTerminalView = function() {
      var ViewType, directory, editorFolder, editorPath, home, id, j, len, projectFolder, pwd, ref, ref1, ref2, shellPath;
      projectFolder = atom.project.getPaths()[0];
      editorPath = (ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0;
      if (editorPath != null) {
        editorFolder = Path.dirname(editorPath);
        ref1 = atom.project.getPaths();
        for (j = 0, len = ref1.length; j < len; j++) {
          directory = ref1[j];
          if (editorPath.indexOf(directory) >= 0) {
            projectFolder = directory;
          }
        }
      }
      if ((projectFolder != null ? projectFolder.indexOf('atom://') : void 0) >= 0) {
        projectFolder = void 0;
      }
      home = process.platform === 'win32' ? process.env.HOMEPATH : process.env.HOME;
      switch (atom.config.get('terminal-plus.core.workingDirectory')) {
        case 'Project':
          pwd = projectFolder || editorFolder || home;
          break;
        case 'Active File':
          pwd = editorFolder || projectFolder || home;
          break;
        default:
          pwd = home;
      }
      id = editorPath || projectFolder || home;
      id = {
        filePath: id,
        folderPath: Path.dirname(id)
      };
      shellPath = atom.config.get('terminal-plus.core.shell');
      ViewType = null;
      switch (atom.config.get('terminal-plus.core.defaultView')) {
        case "Panel":
          ViewType = PanelView;
          break;
        case "Tab":
          ViewType = TabView;
          break;
        case "Match Active Terminal":
          if ((ref2 = this.activeTerminal) != null ? ref2.isTabView() : void 0) {
            ViewType = TabView;
          } else {
            ViewType = PanelView;
          }
      }
      return new ViewType({
        id: id,
        pwd: pwd,
        shellPath: shellPath
      });
    };

    Core.prototype.findFirstTerminal = function(filter) {
      var matches;
      matches = this.terminals.filter(filter);
      return matches[0];
    };

    Core.prototype.iconAtIndex = function(index) {
      return this.getStatusIcons().eq(index);
    };

    Core.prototype.getPanelViews = function() {
      return this.terminals.filter(function(terminal) {
        return terminal.isPanelView();
      });
    };

    Core.prototype.getTabViews = function() {
      return this.terminals.filter(function(terminal) {
        return terminal.isTabView();
      });
    };

    return Core;

  })();

  module.exports = exports = new Core();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvY29yZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVFQUFBO0lBQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixTQUFBLEdBQVk7O0VBQ1osT0FBQSxHQUFVOztFQUNWLFNBQUEsR0FBWTs7RUFFWixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRUQ7bUJBQ0osYUFBQSxHQUFlOzttQkFDZixjQUFBLEdBQWdCOzttQkFDaEIsU0FBQSxHQUFXOzttQkFDWCxXQUFBLEdBQWE7O0lBRUEsY0FBQTs7OztNQUNYLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsbUJBQUEsQ0FBQTtNQUVyQixJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSw4QkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLG9CQUFELENBQUE7SUFMVzs7bUJBT2IsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7QUFDQTtBQUFBO1dBQUEscUNBQUE7O3FCQUNFLFFBQVEsQ0FBQyxPQUFULENBQUE7QUFERjs7SUFGTzs7O0FBS1Q7Ozs7bUJBSUEsZ0JBQUEsR0FBa0IsU0FBQTtNQUNoQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUNqQjtRQUFBLG1CQUFBLEVBQXFCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7QUFBRyxnQkFBQTtnRUFBa0IsQ0FBRSxNQUFwQixDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJCO1FBRUEsc0JBQUEsRUFBd0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxD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YUFBVyxJQUFBLFFBQUEsQ0FBUztRQUNsQixJQUFBLEVBRGtCO1FBQ2QsS0FBQSxHQURjO1FBQ1QsV0FBQSxTQURTO09BQVQ7SUFsQ087O21CQXNDcEIsaUJBQUEsR0FBbUIsU0FBQyxNQUFEO0FBQ2pCLFVBQUE7TUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLE1BQWxCO0FBQ1YsYUFBTyxPQUFRLENBQUEsQ0FBQTtJQUZFOzttQkFJbkIsV0FBQSxHQUFhLFNBQUMsS0FBRDthQUNYLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBaUIsQ0FBQyxFQUFsQixDQUFxQixLQUFyQjtJQURXOzttQkFHYixhQUFBLEdBQWUsU0FBQTthQUNiLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFrQixTQUFDLFFBQUQ7ZUFBYyxRQUFRLENBQUMsV0FBVCxDQUFBO01BQWQsQ0FBbEI7SUFEYTs7bUJBR2YsV0FBQSxHQUFhLFNBQUE7YUFDWCxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsQ0FBa0IsU0FBQyxRQUFEO2VBQWMsUUFBUSxDQUFDLFNBQVQsQ0FBQTtNQUFkLENBQWxCO0lBRFc7Ozs7OztFQUdmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLE9BQUEsR0FBYyxJQUFBLElBQUEsQ0FBQTtBQS9TL0IiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5QYW5lbFZpZXcgPSBudWxsXG5UYWJWaWV3ID0gbnVsbFxuU3RhdHVzQmFyID0gbnVsbFxuXG5QYXRoID0gcmVxdWlyZSAncGF0aCdcblxuY2xhc3MgQ29yZVxuICBzdWJzY3JpcHRpb25zOiBudWxsXG4gIGFjdGl2ZVRlcm1pbmFsOiBudWxsXG4gIHRlcm1pbmFsczogW11cbiAgcmV0dXJuRm9jdXM6IGZhbHNlXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBAcmVnaXN0ZXJDb21tYW5kcygpXG4gICAgQHJlZ2lzdGVyQWN0aXZlSXRlbVN1YnNjcmlwdGlvbigpXG4gICAgQHJlZ2lzdGVyV2luZG93RXZlbnRzKClcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGZvciB0ZXJtaW5hbCBpbiBAdGVybWluYWxzXG4gICAgICB0ZXJtaW5hbC5kZXN0cm95KClcblxuICAjIyNcbiAgU2VjdGlvbjogU2V0dXBcbiAgIyMjXG5cbiAgcmVnaXN0ZXJDb21tYW5kczogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICd0ZXJtaW5hbC1wbHVzOm5ldyc6ID0+IEBuZXdUZXJtaW5hbFZpZXcoKT8udG9nZ2xlKClcblxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6dG9nZ2xlJzogPT4gQHRvZ2dsZSgpXG5cbiAgICAgICd0ZXJtaW5hbC1wbHVzOm5leHQnOiA9PlxuICAgICAgICBAYWN0aXZlVGVybWluYWwub3BlbigpIGlmIEBhY3RpdmF0ZU5leHRUZXJtaW5hbCgpXG4gICAgICAndGVybWluYWwtcGx1czpwcmV2JzogPT5cbiAgICAgICAgQGFjdGl2ZVRlcm1pbmFsLm9wZW4oKSBpZiBAYWN0aXZhdGVQcmV2VGVybWluYWwoKVxuXG4gICAgICAndGVybWluYWwtcGx1czpjbG9zZSc6ID0+IEBkZXN0cm95QWN0aXZlVGVybWluYWwoKVxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6Y2xvc2UtYWxsJzogPT4gQGNsb3NlQWxsKClcblxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6cmVuYW1lJzogPT5cbiAgICAgICAgQHJ1bkluQWN0aXZlVGVybWluYWwgKGkpIC0+IGkucHJvbXB0Rm9yUmVuYW1lKClcbiAgICAgICd0ZXJtaW5hbC1wbHVzOmluc2VydC1zZWxlY3RlZC10ZXh0JzogPT5cbiAgICAgICAgQHJ1bkluQWN0aXZlVGVybWluYWwgKGkpIC0+IGkuaW5zZXJ0U2VsZWN0aW9uKClcbiAgICAgICd0ZXJtaW5hbC1wbHVzOmluc2VydC10ZXh0JzogPT5cbiAgICAgICAgQHJ1bkluQWN0aXZlVGVybWluYWwgKGkpIC0+IGkucHJvbXB0Rm9ySW5wdXQoKVxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6dG9nZ2xlLWZvY3VzJzogPT5cbiAgICAgICAgQHJ1bkluQWN0aXZlVGVybWluYWwgKGkpIC0+IGkudG9nZ2xlRm9jdXMoKVxuICAgICAgJ3Rlcm1pbmFsLXBsdXM6dG9nZ2xlLWZ1bGwtc2NyZWVuJzogPT5cbiAgICAgICAgQHJ1bkluQWN0aXZlVGVybWluYWwgKGkpIC0+IGkudG9nZ2xlRnVsbHNjcmVlbigpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy54dGVybScsXG4gICAgICAndGVybWluYWwtcGx1czpwYXN0ZSc6ID0+XG4gICAgICAgIEBydW5JbkFjdGl2ZVRlcm1pbmFsIChpKSAtPiBpLnBhc3RlKClcbiAgICAgICd0ZXJtaW5hbC1wbHVzOmNvcHknOiA9PlxuICAgICAgICBAcnVuSW5BY3RpdmVUZXJtaW5hbCAoaSkgLT4gaS5jb3B5KClcblxuICByZWdpc3RlckFjdGl2ZUl0ZW1TdWJzY3JpcHRpb246IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pID0+XG4gICAgICByZXR1cm4gdW5sZXNzIGl0ZW0/XG5cbiAgICAgIGlmIGl0ZW0uY29uc3RydWN0b3IubmFtZSBpcyBcIlRhYlZpZXdcIlxuICAgICAgICBzZXRUaW1lb3V0IGl0ZW0uZm9jdXMsIDEwMFxuICAgICAgZWxzZSBpZiBpdGVtLmNvbnN0cnVjdG9yLm5hbWUgaXMgXCJUZXh0RWRpdG9yXCJcbiAgICAgICAgbWFwcGluZyA9IGF0b20uY29uZmlnLmdldCgndGVybWluYWwtcGx1cy5jb3JlLm1hcFRlcm1pbmFsc1RvJylcbiAgICAgICAgcmV0dXJuIGlmIG1hcHBpbmcgaXMgJ05vbmUnXG5cbiAgICAgICAgc3dpdGNoIG1hcHBpbmdcbiAgICAgICAgICB3aGVuICdGaWxlJ1xuICAgICAgICAgICAgbmV4dFRlcm1pbmFsID0gQGZpbmRGaXJzdFRlcm1pbmFsICh0ZXJtaW5hbCkgLT5cbiAgICAgICAgICAgICAgaXRlbS5nZXRQYXRoKCkgPT0gdGVybWluYWwuZ2V0SWQoKS5maWxlUGF0aFxuICAgICAgICAgIHdoZW4gJ0ZvbGRlcidcbiAgICAgICAgICAgIG5leHRUZXJtaW5hbCA9IEBmaW5kRmlyc3RUZXJtaW5hbCAodGVybWluYWwpIC0+XG4gICAgICAgICAgICAgIFBhdGguZGlybmFtZShpdGVtLmdldFBhdGgoKSkgPT0gdGVybWluYWwuZ2V0SWQoKS5mb2xkZXJQYXRoXG5cbiAgICAgICAgcHJldlRlcm1pbmFsID0gQGdldEFjdGl2ZVRlcm1pbmFsKClcbiAgICAgICAgaWYgcHJldlRlcm1pbmFsICE9IG5leHRUZXJtaW5hbFxuICAgICAgICAgIGlmIG5vdCBuZXh0VGVybWluYWw/XG4gICAgICAgICAgICBpZiBpdGVtLmdldFRpdGxlKCkgaXNudCAndW50aXRsZWQnXG4gICAgICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgndGVybWluYWwtcGx1cy5jb3JlLm1hcFRlcm1pbmFsc1RvQXV0b09wZW4nKVxuICAgICAgICAgICAgICAgIG5leHRUZXJtaW5hbCA9IEBjcmVhdGVUZXJtaW5hbFZpZXcoKS5nZXRUZXJtaW5hbCgpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNldEFjdGl2ZVRlcm1pbmFsKG5leHRUZXJtaW5hbClcbiAgICAgICAgICAgIGlmIHByZXZUZXJtaW5hbC5nZXRQYXJlbnRWaWV3KCk/LnBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICAgICAgICAgIG5leHRUZXJtaW5hbC5nZXRQYXJlbnRWaWV3KCkudG9nZ2xlKClcblxuICByZWdpc3RlcldpbmRvd0V2ZW50czogLT5cbiAgICBoYW5kbGVCbHVyID0gPT5cbiAgICAgIGlmIEBhY3RpdmVUZXJtaW5hbCBhbmQgQGFjdGl2ZVRlcm1pbmFsLmlzRm9jdXNlZCgpXG4gICAgICAgIEByZXR1cm5Gb2N1cyA9IHRydWVcbiAgICAgICAgQGFjdGl2ZVRlcm1pbmFsLmdldFBhcmVudFZpZXcoKS5ibHVyKClcblxuICAgIGhhbmRsZUZvY3VzID0gPT5cbiAgICAgIGlmIEByZXR1cm5Gb2N1cyBhbmQgQGFjdGl2ZVRlcm1pbmFsXG4gICAgICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICAgICBAYWN0aXZlVGVybWluYWwuZm9jdXMoKVxuICAgICAgICAgIEByZXR1cm5Gb2N1cyA9IGZhbHNlXG4gICAgICAgICwgMTAwXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnYmx1cicsIGhhbmRsZUJsdXJcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZGlzcG9zZTogLT5cbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdibHVyJywgaGFuZGxlQmx1clxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ2ZvY3VzJywgaGFuZGxlRm9jdXNcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZGlzcG9zZTogLT5cbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdmb2N1cycsIGhhbmRsZUZvY3VzXG5cblxuICAjIyNcbiAgU2VjdGlvbjogQ29tbWFuZCBIYW5kbGluZ1xuICAjIyNcblxuICBhY3RpdmF0ZU5leHRUZXJtaW5hbDogLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgKG5vdCBAYWN0aXZlVGVybWluYWwpIG9yIEBhY3RpdmVUZXJtaW5hbC5pc0FuaW1hdGluZygpXG5cbiAgICBpbmRleCA9IEB0ZXJtaW5hbHMuaW5kZXhPZihAYWN0aXZlVGVybWluYWwpXG4gICAgcmV0dXJuIGZhbHNlIGlmIGluZGV4IDwgMFxuICAgIEBhY3RpdmF0ZVRlcm1pbmFsQXRJbmRleCBpbmRleCArIDFcblxuICBhY3RpdmF0ZVByZXZUZXJtaW5hbDogLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgKG5vdCBAYWN0aXZlVGVybWluYWwpIG9yIEBhY3RpdmVUZXJtaW5hbC5pc0FuaW1hdGluZygpXG5cbiAgICBpbmRleCA9IEB0ZXJtaW5hbHMuaW5kZXhPZihAYWN0aXZlVGVybWluYWwpXG4gICAgcmV0dXJuIGZhbHNlIGlmIGluZGV4IDwgMFxuICAgIEBhY3RpdmF0ZVRlcm1pbmFsQXRJbmRleCBpbmRleCAtIDFcblxuICBjbG9zZUFsbDogPT5cbiAgICBwYW5lbHMgPSBAZ2V0UGFuZWxWaWV3cygpXG4gICAgQHRlcm1pbmFscyA9IEBnZXRUYWJWaWV3cygpXG5cbiAgICBmb3IgcGFuZWwgaW4gcGFuZWxzXG4gICAgICBwYW5lbC5nZXRQYXJlbnRWaWV3KCkuZGVzdHJveSgpXG5cbiAgICBAYWN0aXZlVGVybWluYWwgPSBAdGVybWluYWxzWzBdXG5cbiAgZGVzdHJveUFjdGl2ZVRlcm1pbmFsOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVRlcm1pbmFsP1xuXG4gICAgaW5kZXggPSBAdGVybWluYWxzLmluZGV4T2YoQGFjdGl2ZVRlcm1pbmFsKVxuICAgIEByZW1vdmVUZXJtaW5hbEF0KGluZGV4KVxuICAgIGlmIEBhY3RpdmVUZXJtaW5hbC5pc1RhYlZpZXcoKVxuICAgICAgcGFyZW50ID0gQGFjdGl2ZVRlcm1pbmFsLmdldFBhcmVudFZpZXcoKVxuICAgICAgaWYgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHBhcmVudClcbiAgICAgICAgcGFuZS5kZXN0cm95SXRlbShwYXJlbnQpXG4gICAgZWxzZVxuICAgICAgQGFjdGl2ZVRlcm1pbmFsLmdldFBhcmVudFZpZXcoKS5kZXN0cm95KClcbiAgICBAYWN0aXZlVGVybWluYWwgPSBudWxsXG5cbiAgICBAYWN0aXZhdGVBZGphY2VudFRlcm1pbmFsIGluZGV4XG5cbiAgbmV3VGVybWluYWxWaWV3OiA9PlxuICAgIFBhbmVsVmlldyA/PSByZXF1aXJlICcuL3BhbmVsLXZpZXcnXG4gICAgVGFiVmlldyA/PSByZXF1aXJlICcuL3RhYi12aWV3J1xuICAgIFN0YXR1c0JhciA/PSByZXF1aXJlICcuL3N0YXR1cy1iYXInXG4gICAgU3RhdHVzQmFyLnJlZ2lzdGVyUGFuZVN1YnNjcmlwdGlvbigpXG5cbiAgICByZXR1cm4gbnVsbCBpZiBAYWN0aXZlVGVybWluYWwgYW5kIEBhY3RpdmVUZXJtaW5hbC5pc0FuaW1hdGluZygpXG5cbiAgICB0ZXJtaW5hbFZpZXcgPSBAY3JlYXRlVGVybWluYWxWaWV3KClcbiAgICBAdGVybWluYWxzLnB1c2ggdGVybWluYWxWaWV3LmdldFRlcm1pbmFsKClcbiAgICByZXR1cm4gdGVybWluYWxWaWV3XG5cbiAgcnVuSW5BY3RpdmVUZXJtaW5hbDogKGNhbGxiYWNrKSAtPlxuICAgIHRlcm1pbmFsID0gQGdldEFjdGl2ZVRlcm1pbmFsKClcbiAgICBpZiB0ZXJtaW5hbD9cbiAgICAgIHJldHVybiBjYWxsYmFjayh0ZXJtaW5hbClcbiAgICByZXR1cm4gbnVsbFxuXG4gIHRvZ2dsZTogLT5cbiAgICByZXR1cm4gaWYgQGFjdGl2ZVRlcm1pbmFsIGFuZCBAYWN0aXZlVGVybWluYWwuaXNBbmltYXRpbmcoKVxuXG4gICAgaWYgQHRlcm1pbmFscy5sZW5ndGggPT0gMFxuICAgICAgQGFjdGl2ZVRlcm1pbmFsID0gQG5ld1Rlcm1pbmFsVmlldygpLmdldFRlcm1pbmFsKClcbiAgICBlbHNlIGlmIEBhY3RpdmVUZXJtaW5hbCA9PSBudWxsXG4gICAgICBAYWN0aXZlVGVybWluYWwgPSBAdGVybWluYWxzWzBdXG4gICAgQGFjdGl2ZVRlcm1pbmFsLnRvZ2dsZSgpXG5cblxuICAjIyNcbiAgU2VjdGlvbjogRXh0ZXJuYWwgTWV0aG9kc1xuICAjIyNcblxuICBnZXRBY3RpdmVUZXJtaW5hbDogLT5cbiAgICByZXR1cm4gQGFjdGl2ZVRlcm1pbmFsXG5cbiAgZ2V0QWN0aXZlVGVybWluYWxWaWV3OiAtPlxuICAgIHJldHVybiBAYWN0aXZlVGVybWluYWwuZ2V0UGFyZW50VmlldygpXG5cbiAgZ2V0VGVybWluYWxzOiAtPlxuICAgIHJldHVybiBAdGVybWluYWxzXG5cbiAgbGVuZ3RoOiAtPlxuICAgIHJldHVybiBAdGVybWluYWxzLmxlbmd0aFxuXG4gIHJlbW92ZVRlcm1pbmFsOiAodGVybWluYWwpIC0+XG4gICAgaW5kZXggPSBAdGVybWluYWxzLmluZGV4T2YgdGVybWluYWxcbiAgICByZXR1cm4gaWYgaW5kZXggPCAwXG4gICAgQHRlcm1pbmFscy5zcGxpY2UgaW5kZXgsIDFcblxuICAgIGlmIHRlcm1pbmFsID09IEBhY3RpdmVUZXJtaW5hbFxuICAgICAgdW5sZXNzIEBhY3RpdmF0ZUFkamFjZW50VGVybWluYWwoKVxuICAgICAgICBAYWN0aXZlVGVybWluYWwgPSBudWxsXG5cbiAgcmVtb3ZlVGVybWluYWxBdDogKGluZGV4KSAtPlxuICAgIHJldHVybiBpZiBpbmRleCA8IDAgb3IgaW5kZXggPiBAdGVybWluYWxzLmxlbmd0aFxuICAgIHJldHVybiBAdGVybWluYWxzLnNwbGljZShpbmRleCwgMSlbMF1cblxuICByZW1vdmVUZXJtaW5hbFZpZXc6ICh2aWV3KSAtPlxuICAgIEByZW1vdmVUZXJtaW5hbCB2aWV3LmdldFRlcm1pbmFsKClcblxuICBzZXRBY3RpdmVUZXJtaW5hbDogKHRlcm1pbmFsKSAtPlxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IHRlcm1pbmFsXG5cbiAgc2V0QWN0aXZlVGVybWluYWxWaWV3OiAodmlldykgLT5cbiAgICBAc2V0QWN0aXZlVGVybWluYWwgdmlldy5nZXRUZXJtaW5hbCgpXG5cbiAgdGVybWluYWxBdDogKGluZGV4KSAtPlxuICAgIHJldHVybiBAdGVybWluYWxzW2luZGV4XVxuXG4gIG1vdmVUZXJtaW5hbDogKGZyb21JbmRleCwgdG9JbmRleCkgPT5cbiAgICBmcm9tSW5kZXggPSBNYXRoLm1heCgwLCBmcm9tSW5kZXgpXG4gICAgdG9JbmRleCA9IE1hdGgubWluKHRvSW5kZXgsIEB0ZXJtaW5hbHMubGVuZ3RoKVxuXG4gICAgdGVybWluYWwgPSBAdGVybWluYWxzLnNwbGljZShmcm9tSW5kZXgsIDEpWzBdXG4gICAgQHRlcm1pbmFscy5zcGxpY2UgdG9JbmRleCwgMCwgdGVybWluYWxcblxuXG4gICMjI1xuICBTZWN0aW9uOiBIZWxwZXIgTWV0aG9kc1xuICAjIyNcblxuICBhY3RpdmF0ZUFkamFjZW50VGVybWluYWw6IChpbmRleCA9IDApIC0+XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBAdGVybWluYWxzLmxlbmd0aCA+IDBcblxuICAgIGluZGV4ID0gTWF0aC5tYXgoMCwgaW5kZXggLSAxKVxuICAgIEBhY3RpdmVUZXJtaW5hbCA9IEB0ZXJtaW5hbHNbaW5kZXhdXG5cbiAgYWN0aXZhdGVUZXJtaW5hbEF0SW5kZXg6IChpbmRleCkgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQHRlcm1pbmFscy5sZW5ndGggPCAyXG5cbiAgICBpZiBpbmRleCA+PSBAdGVybWluYWxzLmxlbmd0aFxuICAgICAgaW5kZXggPSAwXG4gICAgaWYgaW5kZXggPCAwXG4gICAgICBpbmRleCA9IEB0ZXJtaW5hbHMubGVuZ3RoIC0gMVxuXG4gICAgQGFjdGl2ZVRlcm1pbmFsID0gQHRlcm1pbmFsc1tpbmRleF1cbiAgICByZXR1cm4gdHJ1ZVxuXG4gIGNyZWF0ZVRlcm1pbmFsVmlldzogLT5cbiAgICBwcm9qZWN0Rm9sZGVyID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICBlZGl0b3JQYXRoID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpPy5nZXRQYXRoKClcblxuICAgIGlmIGVkaXRvclBhdGg/XG4gICAgICBlZGl0b3JGb2xkZXIgPSBQYXRoLmRpcm5hbWUoZWRpdG9yUGF0aClcbiAgICAgIGZvciBkaXJlY3RvcnkgaW4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgICAgaWYgZWRpdG9yUGF0aC5pbmRleE9mKGRpcmVjdG9yeSkgPj0gMFxuICAgICAgICAgIHByb2plY3RGb2xkZXIgPSBkaXJlY3RvcnlcblxuICAgIHByb2plY3RGb2xkZXIgPSB1bmRlZmluZWQgaWYgcHJvamVjdEZvbGRlcj8uaW5kZXhPZignYXRvbTovLycpID49IDBcblxuICAgIGhvbWUgPSBpZiBwcm9jZXNzLnBsYXRmb3JtIGlzICd3aW4zMicgdGhlbiBwcm9jZXNzLmVudi5IT01FUEFUSCBlbHNlIHByb2Nlc3MuZW52LkhPTUVcblxuICAgIHN3aXRjaCBhdG9tLmNvbmZpZy5nZXQoJ3Rlcm1pbmFsLXBsdXMuY29yZS53b3JraW5nRGlyZWN0b3J5JylcbiAgICAgIHdoZW4gJ1Byb2plY3QnIHRoZW4gcHdkID0gcHJvamVjdEZvbGRlciBvciBlZGl0b3JGb2xkZXIgb3IgaG9tZVxuICAgICAgd2hlbiAnQWN0aXZlIEZpbGUnIHRoZW4gcHdkID0gZWRpdG9yRm9sZGVyIG9yIHByb2plY3RGb2xkZXIgb3IgaG9tZVxuICAgICAgZWxzZSBwd2QgPSBob21lXG5cbiAgICBpZCA9IGVkaXRvclBhdGggb3IgcHJvamVjdEZvbGRlciBvciBob21lXG4gICAgaWQgPSBmaWxlUGF0aDogaWQsIGZvbGRlclBhdGg6IFBhdGguZGlybmFtZShpZClcblxuICAgIHNoZWxsUGF0aCA9IGF0b20uY29uZmlnLmdldCAndGVybWluYWwtcGx1cy5jb3JlLnNoZWxsJ1xuXG4gICAgVmlld1R5cGUgPSBudWxsXG4gICAgc3dpdGNoIGF0b20uY29uZmlnLmdldCAndGVybWluYWwtcGx1cy5jb3JlLmRlZmF1bHRWaWV3J1xuICAgICAgd2hlbiBcIlBhbmVsXCIgdGhlbiBWaWV3VHlwZSA9IFBhbmVsVmlld1xuICAgICAgd2hlbiBcIlRhYlwiIHRoZW4gVmlld1R5cGUgPSBUYWJWaWV3XG4gICAgICB3aGVuIFwiTWF0Y2ggQWN0aXZlIFRlcm1pbmFsXCJcbiAgICAgICAgaWYgQGFjdGl2ZVRlcm1pbmFsPy5pc1RhYlZpZXcoKVxuICAgICAgICAgIFZpZXdUeXBlID0gVGFiVmlld1xuICAgICAgICBlbHNlXG4gICAgICAgICAgVmlld1R5cGUgPSBQYW5lbFZpZXdcblxuICAgIHJldHVybiBuZXcgVmlld1R5cGUge1xuICAgICAgaWQsIHB3ZCwgc2hlbGxQYXRoXG4gICAgfVxuXG4gIGZpbmRGaXJzdFRlcm1pbmFsOiAoZmlsdGVyKSAtPlxuICAgIG1hdGNoZXMgPSBAdGVybWluYWxzLmZpbHRlciBmaWx0ZXJcbiAgICByZXR1cm4gbWF0Y2hlc1swXVxuXG4gIGljb25BdEluZGV4OiAoaW5kZXgpIC0+XG4gICAgQGdldFN0YXR1c0ljb25zKCkuZXEoaW5kZXgpXG5cbiAgZ2V0UGFuZWxWaWV3czogLT5cbiAgICBAdGVybWluYWxzLmZpbHRlciAodGVybWluYWwpIC0+IHRlcm1pbmFsLmlzUGFuZWxWaWV3KClcblxuICBnZXRUYWJWaWV3czogLT5cbiAgICBAdGVybWluYWxzLmZpbHRlciAodGVybWluYWwpIC0+IHRlcm1pbmFsLmlzVGFiVmlldygpXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IG5ldyBDb3JlKClcbiJdfQ==
