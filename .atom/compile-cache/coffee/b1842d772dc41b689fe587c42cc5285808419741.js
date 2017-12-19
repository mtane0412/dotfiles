
/*
  lib/main.coffee
 */

(function() {
  var MarkdownScrlSync, SubAtom, log, mix,
    __slice = [].slice;

  log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return console.log.apply(console, ['markdown-scroll, main:'].concat(args));
  };

  SubAtom = require('sub-atom');

  MarkdownScrlSync = (function() {
    function MarkdownScrlSync() {}

    MarkdownScrlSync.prototype.activate = function(state) {
      var MarkdownPreviewView, TextEditor, pathUtil, prvwPkg, viewPath;
      pathUtil = require('path');
      TextEditor = require('atom').TextEditor;
      this.subs = new SubAtom;
      if (!(prvwPkg = atom.packages.getLoadedPackage('markdown-preview')) && !(prvwPkg = atom.packages.getLoadedPackage('markdown-preview-plus'))) {
        log('markdown preview package not found');
        return;
      }
      viewPath = pathUtil.join(prvwPkg.path, 'lib/markdown-preview-view');
      MarkdownPreviewView = require(viewPath);
      return this.subs.add(atom.workspace.observeActivePaneItem((function(_this) {
        return function(editor) {
          var isMarkdown, previewView, _i, _len, _ref;
          isMarkdown = function(editor) {
            var fext, fpath, name, path, _i, _len, _ref, _ref1, _ref2;
            _ref = ["GitHub Markdown", "CoffeeScript (Literate)"];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              name = _ref[_i];
              if (((_ref1 = editor.getGrammar()) != null ? _ref1.name : void 0) === name) {
                return true;
              }
            }
            if ((path = editor.getPath())) {
              _ref2 = path.split('.'), fpath = _ref2[0], fext = _ref2[_ref2.length - 1];
              if (fext.toLowerCase() === 'md') {
                return true;
              }
            }
            return false;
          };
          if (editor instanceof TextEditor && editor.alive && isMarkdown(editor)) {
            _this.stopTracking();
            _ref = atom.workspace.getPaneItems();
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              previewView = _ref[_i];
              if (previewView instanceof MarkdownPreviewView && previewView.editor === editor) {
                _this.startTracking(editor, previewView);
                break;
              }
            }
            return null;
          }
        };
      })(this)));
    };

    MarkdownScrlSync.prototype.startTracking = function(editor, previewView) {
      this.editor = editor;
      this.editorView = atom.views.getView(this.editor);
      this.previewEle = previewView.element;
      this.chrHgt = this.editor.getLineHeightInPixels();
      this.lastScrnRow = null;
      this.lastChrOfs = 0;
      this.setMap();
      this.chkScroll('init');
      this.subs2 = new SubAtom;
      this.subs2.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          _this.setMap();
          return _this.chkScroll('changed');
        };
      })(this)));
      this.subs2.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function() {
          return _this.chkScroll('cursorMoved');
        };
      })(this)));
      this.subs2.add(this.editorView.onDidChangeScrollTop((function(_this) {
        return function() {
          return _this.chkScroll('newtop');
        };
      })(this)));
      return this.subs2.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.stopTracking();
        };
      })(this)));
    };

    MarkdownScrlSync.prototype.stopTracking = function() {
      if (this.subs2) {
        this.subs2.dispose();
      }
      return this.subs2 = null;
    };

    MarkdownScrlSync.prototype.deactivate = function() {
      this.stopTracking();
      return this.subs.dispose();
    };

    return MarkdownScrlSync;

  })();

  mix = function(mixinName) {
    var key, mixin, _i, _len, _ref, _results;
    mixin = require('./' + mixinName);
    _ref = Object.keys(mixin);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      _results.push(MarkdownScrlSync.prototype[key] = mixin[key]);
    }
    return _results;
  };

  mix('map');

  mix('scroll');

  mix('utils');

  module.exports = new MarkdownScrlSync;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tc2Nyb2xsLXN5bmMvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxNQUFBLG1DQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFJQSxHQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osUUFBQSxJQUFBO0FBQUEsSUFESyw4REFDTCxDQUFBO1dBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFaLENBQWtCLE9BQWxCLEVBQTJCLENBQUMsd0JBQUQsQ0FBMEIsQ0FBQyxNQUEzQixDQUFrQyxJQUFsQyxDQUEzQixFQURJO0VBQUEsQ0FKTixDQUFBOztBQUFBLEVBT0EsT0FBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSLENBUFgsQ0FBQTs7QUFBQSxFQVNNO2tDQUVKOztBQUFBLCtCQUFBLFFBQUEsR0FBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLFVBQUEsNERBQUE7QUFBQSxNQUFBLFFBQUEsR0FBZSxPQUFBLENBQVEsTUFBUixDQUFmLENBQUE7QUFBQSxNQUNDLGFBQWMsT0FBQSxDQUFRLE1BQVIsRUFBZCxVQURELENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxJQUFELEdBQWUsR0FBQSxDQUFBLE9BRmYsQ0FBQTtBQUlBLE1BQUEsSUFBRyxDQUFBLENBQUssT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0Isa0JBQS9CLENBQVgsQ0FBSixJQUNBLENBQUEsQ0FBSyxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQix1QkFBL0IsQ0FBWCxDQURQO0FBRUUsUUFBQSxHQUFBLENBQUksb0NBQUosQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUhGO09BSkE7QUFBQSxNQVNBLFFBQUEsR0FBVyxRQUFR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

//# sourceURL=/Users/tane/.atom/packages/markdown-scroll-sync/lib/main.coffee
