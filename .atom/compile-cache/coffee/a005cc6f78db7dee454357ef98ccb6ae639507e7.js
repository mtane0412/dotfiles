(function() {
  var CompositeDisposable, MarkdownMindmapView, createMarkdownMindmapView, isMarkdownMindmapView, url,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  url = require('url');

  CompositeDisposable = require('atom').CompositeDisposable;

  MarkdownMindmapView = null;

  createMarkdownMindmapView = function(state) {
    if (MarkdownMindmapView == null) {
      MarkdownMindmapView = require('./markdown-mindmap-view');
    }
    return new MarkdownMindmapView(state);
  };

  isMarkdownMindmapView = function(object) {
    if (MarkdownMindmapView == null) {
      MarkdownMindmapView = require('./markdown-mindmap-view');
    }
    return object instanceof MarkdownMindmapView;
  };

  atom.deserializers.add({
    name: 'MarkdownMindmapView',
    deserialize: function(state) {
      if (state.constructor === Object) {
        return createMarkdownMindmapView(state);
      }
    }
  });

  module.exports = {
    config: {
      liveUpdate: {
        type: 'boolean',
        "default": true
      },
      autoOpen: {
        type: 'boolean',
        "default": false
      },
      openPreviewInSplitPane: {
        type: 'boolean',
        "default": true
      },
      parseListItems: {
        type: 'boolean',
        "default": true
      },
      theme: {
        type: 'string',
        "default": 'default',
        "enum": ['default', 'colorful', 'default-dark', 'colorful-dark']
      },
      linkShape: {
        type: 'string',
        "default": 'diagonal',
        "enum": ['diagonal', 'bracket']
      },
      truncateLabels: {
        type: 'integer',
        "default": 40,
        minimum: 0,
        description: "Set to 0 to disable truncating"
      },
      grammars: {
        type: 'array',
        "default": ['source.gfm', 'source.litcoffee', 'text.html.basic', 'text.plain', 'text.plain.null-grammar', 'text.md']
      }
    },
    activate: function() {
      var previewFile;
      this.disposables = new CompositeDisposable;
      this.disposables.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(editor) {
          return _this.autoOpen(editor);
        };
      })(this)));
      atom.commands.add('atom-workspace', {
        'markdown-mindmap:toggle-auto-mode': (function(_this) {
          return function() {
            return _this.toggleAutoOpen();
          };
        })(this),
        'markdown-mindmap:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'markdown-mindmap:toggle-break-on-single-newline': function() {
          var keyPath;
          keyPath = 'markdown-mindmap.breakOnSingleNewline';
          return atom.config.set(keyPath, !atom.config.get(keyPath));
        }
      });
      previewFile = this.previewFile.bind(this);
      atom.commands.add('.tree-view .file .name[data-name$=\\.markdown]', 'markdown-mindmap:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.md]', 'markdown-mindmap:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.mdown]', 'markdown-mindmap:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.mkd]', 'markdown-mindmap:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.mkdown]', 'markdown-mindmap:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.ron]', 'markdown-mindmap:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.txt]', 'markdown-mindmap:preview-file', previewFile);
      return atom.workspace.addOpener(function(uriToOpen) {
        var error, host, pathname, protocol, ref;
        try {
          ref = url.parse(uriToOpen), protocol = ref.protocol, host = ref.host, pathname = ref.pathname;
        } catch (error1) {
          error = error1;
          return;
        }
        if (protocol !== 'markdown-mindmap:') {
          return;
        }
        try {
          if (pathname) {
            pathname = decodeURI(pathname);
          }
        } catch (error1) {
          error = error1;
          return;
        }
        if (host === 'editor') {
          return createMarkdownMindmapView({
            editorId: pathname.substring(1)
          });
        } else {
          return createMarkdownMindmapView({
            filePath: pathname
          });
        }
      });
    },
    deactivate: function() {
      return this.disposables.dispose();
    },
    toggle: function() {
      var editor, grammars, ref, ref1;
      if (isMarkdownMindmapView(atom.workspace.getActivePaneItem())) {
        atom.workspace.destroyActivePaneItem();
        return;
      }
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      grammars = (ref = atom.config.get('markdown-mindmap.grammars')) != null ? ref : [];
      if (ref1 = editor.getGrammar().scopeName, indexOf.call(grammars, ref1) < 0) {
        return;
      }
      if (!this.removePreviewForEditor(editor)) {
        return this.addPreviewForEditor(editor);
      }
    },
    toggleAutoOpen: function() {
      var key;
      key = 'markdown-mindmap.autoOpen';
      return atom.config.set(key, !atom.config.get(key));
    },
    uriForEditor: function(editor) {
      return "markdown-mindmap://editor/" + editor.id;
    },
    removePreviewForEditor: function(editor) {
      var previewPane, uri;
      uri = this.uriForEditor(editor);
      previewPane = atom.workspace.paneForURI(uri);
      if (previewPane != null) {
        previewPane.destroyItem(previewPane.itemForURI(uri));
        return true;
      } else {
        return false;
      }
    },
    autoOpen: function(editor) {
      var grammars, newPath, ref, ref1, ref2, ref3;
      if (!(atom.config.get('markdown-mindmap.autoOpen') && ((editor != null ? editor.getPath : void 0) != null))) {
        return;
      }
      if ((ref = editor.element) != null ? ref.classList.contains('markdown-mindmap') : void 0) {
        return;
      }
      grammars = (ref1 = atom.config.get('markdown-mindmap.grammars')) != null ? ref1 : [];
      newPath = editor.getPath();
      if (!(newPath && this.activeEditor !== newPath && (ref2 = typeof editor.getGrammar === "function" ? (ref3 = editor.getGrammar()) != null ? ref3.scopeName : void 0 : void 0, indexOf.call(grammars, ref2) >= 0))) {
        return;
      }
      this.activeEditor = newPath;
      return this.addPreviewForEditor(editor);
    },
    addPreviewForEditor: function(editor) {
      var options, previousActivePane, uri;
      uri = this.uriForEditor(editor);
      previousActivePane = atom.workspace.getActivePane();
      options = {
        searchAllPanes: true
      };
      if (atom.config.get('markdown-mindmap.openPreviewInSplitPane')) {
        options.split = 'right';
      }
      return atom.workspace.open(uri, options).then(function(markdownMindmapView) {
        if (isMarkdownMindmapView(markdownMindmapView)) {
          return previousActivePane.activate();
        }
      });
    },
    previewFile: function(arg) {
      var editor, filePath, i, len, ref, target;
      target = arg.target;
      filePath = target.dataset.path;
      if (!filePath) {
        return;
      }
      ref = atom.workspace.getTextEditors();
      for (i = 0, len = ref.length; i < len; i++) {
        editor = ref[i];
        if (!(editor.getPath() === filePath)) {
          continue;
        }
        this.addPreviewForEditor(editor);
        return;
      }
      return atom.workspace.open("markdown-mindmap://" + (encodeURI(filePath)), {
        searchAllPanes: true
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1taW5kbWFwL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsK0ZBQUE7SUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0VBQ0wsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixtQkFBQSxHQUFzQjs7RUFFdEIseUJBQUEsR0FBNEIsU0FBQyxLQUFEOztNQUMxQixzQkFBdUIsT0FBQSxDQUFRLHlCQUFSOztXQUN2QixJQUFJLG1CQUFKLENBQXdCLEtBQXhCO0VBRjBCOztFQUk1QixxQkFBQSxHQUF3QixTQUFDLE1BQUQ7O01BQ3RCLHNCQUF1QixPQUFBLENBQVEseUJBQVI7O1dBQ3ZCLE1BQUEsWUFBa0I7RUFGSTs7RUFJeEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUNFO0lBQUEsSUFBQSxFQUFNLHFCQUFOO0lBQ0EsV0FBQSxFQUFhLFNBQUMsS0FBRDtNQUNYLElBQW9DLEtBQUssQ0FBQyxXQUFOLEtBQXFCLE1BQXpEO2VBQUEseUJBQUEsQ0FBMEIsS0FBMUIsRUFBQTs7SUFEVyxDQURiO0dBREY7O0VBS0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLFVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BREY7TUFHQSxRQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtPQUpGO01BTUEsc0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BUEY7TUFTQSxjQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FB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QXJCO0lBVFEsQ0FqSFY7SUE0SEEsbUJBQUEsRUFBcUIsU0FBQyxNQUFEO0FBQ25CLFVBQUE7TUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkO01BQ04sa0JBQUEsR0FBcUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUE7TUFDckIsT0FBQSxHQUNFO1FBQUEsY0FBQSxFQUFnQixJQUFoQjs7TUFDRixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5Q0FBaEIsQ0FBSDtRQUNFLE9BQU8sQ0FBQyxLQUFSLEdBQWdCLFFBRGxCOzthQUVBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixHQUFwQixFQUF5QixPQUF6QixDQUFpQyxDQUFDLElBQWxDLENBQXVDLFNBQUMsbUJBQUQ7UUFDckMsSUFBRyxxQkFBQSxDQUFzQixtQkFBdEIsQ0FBSDtpQkFDRSxrQkFBa0IsQ0FBQyxRQUFuQixDQUFBLEVBREY7O01BRHFDLENBQXZDO0lBUG1CLENBNUhyQjtJQXVJQSxXQUFBLEVBQWEsU0FBQyxHQUFEO0FBQ1gsVUFBQTtNQURhLFNBQUQ7TUFDWixRQUFBLEdBQVcsTUFBTSxDQUFDLE9BQU8sQ0FBQztNQUMxQixJQUFBLENBQWMsUUFBZDtBQUFBLGVBQUE7O0FBRUE7QUFBQSxXQUFBLHFDQUFBOztjQUFtRCxNQUFNLENBQUMsT0FBUCxDQUFBLENBQUEsS0FBb0I7OztRQUNyRSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsTUFBckI7QUFDQTtBQUZGO2FBSUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLHFCQUFBLEdBQXFCLENBQUMsU0FBQSxDQUFVLFFBQVYsQ0FBRCxDQUF6QyxFQUFpRTtRQUFBLGNBQUEsRUFBZ0IsSUFBaEI7T0FBakU7SUFSVyxDQXZJYjs7QUFuQkYiLCJzb3VyY2VzQ29udGVudCI6WyJ1cmwgPSByZXF1aXJlICd1cmwnXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5NYXJrZG93bk1pbmRtYXBWaWV3ID0gbnVsbCAjIERlZmVyIHVudGlsIHVzZWRcblxuY3JlYXRlTWFya2Rvd25NaW5kbWFwVmlldyA9IChzdGF0ZSkgLT5cbiAgTWFya2Rvd25NaW5kbWFwVmlldyA/PSByZXF1aXJlICcuL21hcmtkb3duLW1pbmRtYXAtdmlldydcbiAgbmV3IE1hcmtkb3duTWluZG1hcFZpZXcoc3RhdGUpXG5cbmlzTWFya2Rvd25NaW5kbWFwVmlldyA9IChvYmplY3QpIC0+XG4gIE1hcmtkb3duTWluZG1hcFZpZXcgPz0gcmVxdWlyZSAnLi9tYXJrZG93bi1taW5kbWFwLXZpZXcnXG4gIG9iamVjdCBpbnN0YW5jZW9mIE1hcmtkb3duTWluZG1hcFZpZXdcblxuYXRvbS5kZXNlcmlhbGl6ZXJzLmFkZFxuICBuYW1lOiAnTWFya2Rvd25NaW5kbWFwVmlldydcbiAgZGVzZXJpYWxpemU6IChzdGF0ZSkgLT5cbiAgICBjcmVhdGVNYXJrZG93bk1pbmRtYXBWaWV3KHN0YXRlKSBpZiBzdGF0ZS5jb25zdHJ1Y3RvciBpcyBPYmplY3RcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6XG4gICAgbGl2ZVVwZGF0ZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIGF1dG9PcGVuOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIG9wZW5QcmV2aWV3SW5TcGxpdFBhbmU6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBwYXJzZUxpc3RJdGVtczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIHRoZW1lOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdkZWZhdWx0J1xuICAgICAgZW51bTogWydkZWZhdWx0JywgJ2NvbG9yZnVsJywgJ2RlZmF1bHQtZGFyaycsICdjb2xvcmZ1bC1kYXJrJ11cbiAgICBsaW5rU2hhcGU6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2RpYWdvbmFsJ1xuICAgICAgZW51bTogWydkaWFnb25hbCcsICdicmFja2V0J11cbiAgICB0cnVuY2F0ZUxhYmVsczpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogNDBcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlNldCB0byAwIHRvIGRpc2FibGUgdHJ1bmNhdGluZ1wiXG4gICAgZ3JhbW1hcnM6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbXG4gICAgICAgICdzb3VyY2UuZ2ZtJ1xuICAgICAgICAnc291cmNlLmxpdGNvZmZlZSdcbiAgICAgICAgJ3RleHQuaHRtbC5iYXNpYydcbiAgICAgICAgJ3RleHQucGxhaW4nXG4gICAgICAgICd0ZXh0LnBsYWluLm51bGwtZ3JhbW1hcidcbiAgICAgICAgJ3RleHQubWQnXG4gICAgICBdXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAoZWRpdG9yKSA9PlxuICAgICAgQGF1dG9PcGVuKGVkaXRvcilcblxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnbWFya2Rvd24tbWluZG1hcDp0b2dnbGUtYXV0by1tb2RlJzogPT5cbiAgICAgICAgQHRvZ2dsZUF1dG9PcGVuKClcbiAgICAgICdtYXJrZG93bi1taW5kbWFwOnRvZ2dsZSc6ID0+XG4gICAgICAgIEB0b2dnbGUoKVxuICAgICAgIydtYXJrZG93bi1taW5kbWFwOmNvcHktaHRtbCc6ID0+XG4gICAgICAjICBAY29weUh0bWwoKVxuICAgICAgJ21hcmtkb3duLW1pbmRtYXA6dG9nZ2xlLWJyZWFrLW9uLXNpbmdsZS1uZXdsaW5lJzogLT5cbiAgICAgICAga2V5UGF0aCA9ICdtYXJrZG93bi1taW5kbWFwLmJyZWFrT25TaW5nbGVOZXdsaW5lJ1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoa2V5UGF0aCwgbm90IGF0b20uY29uZmlnLmdldChrZXlQYXRoKSlcblxuICAgIHByZXZpZXdGaWxlID0gQHByZXZpZXdGaWxlLmJpbmQodGhpcylcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVxcXFwubWFya2Rvd25dJywgJ21hcmtkb3duLW1pbmRtYXA6cHJldmlldy1maWxlJywgcHJldmlld0ZpbGVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVxcXFwubWRdJywgJ21hcmtkb3duLW1pbmRtYXA6cHJldmlldy1maWxlJywgcHJldmlld0ZpbGVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVxcXFwubWRvd25dJywgJ21hcmtkb3duLW1pbmRtYXA6cHJldmlldy1maWxlJywgcHJldmlld0ZpbGVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVxcXFwubWtkXScsICdtYXJrZG93bi1taW5kbWFwOnByZXZpZXctZmlsZScsIHByZXZpZXdGaWxlXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJy50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cXFxcLm1rZG93bl0nLCAnbWFya2Rvd24tbWluZG1hcDpwcmV2aWV3LWZpbGUnLCBwcmV2aWV3RmlsZVxuICAgIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3IC5maWxlIC5uYW1lW2RhdGEtbmFtZSQ9XFxcXC5yb25dJywgJ21hcmtkb3duLW1pbmRtYXA6cHJldmlldy1maWxlJywgcHJldmlld0ZpbGVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVxcXFwudHh0XScsICdtYXJrZG93bi1taW5kbWFwOnByZXZpZXctZmlsZScsIHByZXZpZXdGaWxlXG5cbiAgICBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIgKHVyaVRvT3BlbikgLT5cbiAgICAgIHRyeVxuICAgICAgICB7cHJvdG9jb2wsIGhvc3QsIHBhdGhuYW1lfSA9IHVybC5wYXJzZSh1cmlUb09wZW4pXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICByZXR1cm5cblxuICAgICAgcmV0dXJuIHVubGVzcyBwcm90b2NvbCBpcyAnbWFya2Rvd24tbWluZG1hcDonXG5cbiAgICAgIHRyeVxuICAgICAgICBwYXRobmFtZSA9IGRlY29kZVVSSShwYXRobmFtZSkgaWYgcGF0aG5hbWVcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiBob3N0IGlzICdlZGl0b3InXG4gICAgICAgIGNyZWF0ZU1hcmtkb3duTWluZG1hcFZpZXcoZWRpdG9ySWQ6IHBhdGhuYW1lLnN1YnN0cmluZygxKSlcbiAgICAgIGVsc2VcbiAgICAgICAgY3JlYXRlTWFya2Rvd25NaW5kbWFwVmlldyhmaWxlUGF0aDogcGF0aG5hbWUpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIGlzTWFya2Rvd25NaW5kbWFwVmlldyhhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpKVxuICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmVJdGVtKClcbiAgICAgIHJldHVyblxuXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3I/XG5cbiAgICBncmFtbWFycyA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tbWluZG1hcC5ncmFtbWFycycpID8gW11cbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lIGluIGdyYW1tYXJzXG5cbiAgICBAYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpIHVubGVzcyBAcmVtb3ZlUHJldmlld0ZvckVkaXRvcihlZGl0b3IpXG5cbiAgdG9nZ2xlQXV0b09wZW46IC0+XG4gICAga2V5ID0gJ21hcmtkb3duLW1pbmRtYXAuYXV0b09wZW4nXG4gICAgYXRvbS5jb25maWcuc2V0KGtleSwgIWF0b20uY29uZmlnLmdldChrZXkpKVxuXG4gIHVyaUZvckVkaXRvcjogKGVkaXRvcikgLT5cbiAgICBcIm1hcmtkb3duLW1pbmRtYXA6Ly9lZGl0b3IvI3tlZGl0b3IuaWR9XCJcblxuICByZW1vdmVQcmV2aWV3Rm9yRWRpdG9yOiAoZWRpdG9yKSAtPlxuICAgIHVyaSA9IEB1cmlGb3JFZGl0b3IoZWRpdG9yKVxuICAgIHByZXZpZXdQYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSSh1cmkpXG4gICAgaWYgcHJldmlld1BhbmU/XG4gICAgICBwcmV2aWV3UGFuZS5kZXN0cm95SXRlbShwcmV2aWV3UGFuZS5pdGVtRm9yVVJJKHVyaSkpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICBhdXRvT3BlbjogKGVkaXRvcikgLT5cbiAgICByZXR1cm4gdW5sZXNzIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tbWluZG1hcC5hdXRvT3BlbicpIGFuZCBlZGl0b3I/LmdldFBhdGg/XG4gICAgcmV0dXJuIGlmIGVkaXRvci5lbGVtZW50Py5jbGFzc0xpc3QuY29udGFpbnMoJ21hcmtkb3duLW1pbmRtYXAnKVxuXG4gICAgZ3JhbW1hcnMgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLW1pbmRtYXAuZ3JhbW1hcnMnKSA/IFtdXG4gICAgbmV3UGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICByZXR1cm4gdW5sZXNzIG5ld1BhdGggYW5kIEBhY3RpdmVFZGl0b3IgIT0gbmV3UGF0aCBhbmQgZWRpdG9yLmdldEdyYW1tYXI/KCk/LnNjb3BlTmFtZSBpbiBncmFtbWFyc1xuXG4gICAgQGFjdGl2ZUVkaXRvciA9IG5ld1BhdGhcbiAgICBAYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpXG5cbiAgYWRkUHJldmlld0ZvckVkaXRvcjogKGVkaXRvcikgLT5cbiAgICB1cmkgPSBAdXJpRm9yRWRpdG9yKGVkaXRvcilcbiAgICBwcmV2aW91c0FjdGl2ZVBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBvcHRpb25zID1cbiAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1taW5kbWFwLm9wZW5QcmV2aWV3SW5TcGxpdFBhbmUnKVxuICAgICAgb3B0aW9ucy5zcGxpdCA9ICdyaWdodCdcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHVyaSwgb3B0aW9ucykudGhlbiAobWFya2Rvd25NaW5kbWFwVmlldykgLT5cbiAgICAgIGlmIGlzTWFya2Rvd25NaW5kbWFwVmlldyhtYXJrZG93bk1pbmRtYXBWaWV3KVxuICAgICAgICBwcmV2aW91c0FjdGl2ZVBhbmUuYWN0aXZhdGUoKVxuXG4gIHByZXZpZXdGaWxlOiAoe3RhcmdldH0pIC0+XG4gICAgZmlsZVBhdGggPSB0YXJnZXQuZGF0YXNldC5wYXRoXG4gICAgcmV0dXJuIHVubGVzcyBmaWxlUGF0aFxuXG4gICAgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpIHdoZW4gZWRpdG9yLmdldFBhdGgoKSBpcyBmaWxlUGF0aFxuICAgICAgQGFkZFByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICAgICAgcmV0dXJuXG5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuIFwibWFya2Rvd24tbWluZG1hcDovLyN7ZW5jb2RlVVJJKGZpbGVQYXRoKX1cIiwgc2VhcmNoQWxsUGFuZXM6IHRydWVcblxuICAjIGNvcHlIdG1sOiAtPlxuICAjICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICMgICByZXR1cm4gdW5sZXNzIGVkaXRvcj9cbiAgI1xuICAjICAgcmVuZGVyZXIgPz0gcmVxdWlyZSAnLi9yZW5kZXJlcidcbiAgIyAgIHRleHQgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkgb3IgZWRpdG9yLmdldFRleHQoKVxuICAjICAgcmVuZGVyZXIudG9IVE1MIHRleHQsIGVkaXRvci5nZXRQYXRoKCksIGVkaXRvci5nZXRHcmFtbWFyKCksIChlcnJvciwgaHRtbCkgLT5cbiAgIyAgICAgaWYgZXJyb3JcbiAgIyAgICAgICBjb25zb2xlLndhcm4oJ0NvcHlpbmcgTWFya2Rvd24gYXMgSFRNTCBmYWlsZWQnLCBlcnJvcilcbiAgIyAgICAgZWxzZVxuICAjICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGh0bWwpXG4iXX0=
