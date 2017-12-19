(function() {
  var $, $$$, AtomHtmlPreviewView, CompositeDisposable, Disposable, ScrollView, fs, os, path, scrollInjectScript, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  _ref1 = require('atom-space-pen-views'), $ = _ref1.$, $$$ = _ref1.$$$, ScrollView = _ref1.ScrollView;

  path = require('path');

  os = require('os');

  scrollInjectScript = "<script>\n(function () {\n  var scriptTag = document.scripts[document.scripts.length - 1];\n  document.addEventListener('DOMContentLoaded',()=>{\n    var elem = document.createElement(\"span\")\n    try {\n      // Scroll to this current script tag\n      elem.style.width = 100\n      // Center the scrollY\n      elem.style.height = \"20vh\"\n      elem.style.marginTop = \"-20vh\"\n      elem.style.marginLeft = -100\n      elem.style.display = \"block\"\n      var par = scriptTag.parentNode\n      par.insertBefore(elem, scriptTag)\n      elem.scrollIntoView()\n    } catch (error) {}\n    try { elem.remove() } catch (error) {}\n    try { scriptTag.remove() } catch (error) {}\n  }, false)\n})();\n</script>";

  module.exports = AtomHtmlPreviewView = (function(_super) {
    __extends(AtomHtmlPreviewView, _super);

    atom.deserializers.add(AtomHtmlPreviewView);

    AtomHtmlPreviewView.prototype.editorSub = null;

    AtomHtmlPreviewView.prototype.onDidChangeTitle = function() {
      return new Disposable();
    };

    AtomHtmlPreviewView.prototype.onDidChangeModified = function() {
      return new Disposable();
    };

    AtomHtmlPreviewView.deserialize = function(state) {
      return new AtomHtmlPreviewView(state);
    };

    AtomHtmlPreviewView.content = function() {
      return this.div({
        "class": 'atom-html-preview native-key-bindings',
        tabindex: -1
      }, (function(_this) {
        return function() {
          var style;
          style = 'z-index: 2; padding: 2em;';
          _this.div({
            "class": 'show-error',
            style: style
          });
          return _this.div({
            "class": 'show-loading',
            style: style
          }, "Loading HTML");
        };
      })(this));
    };

    function AtomHtmlPreviewView(_arg) {
      var filePath, handles;
      this.editorId = _arg.editorId, filePath = _arg.filePath;
      this.handleEvents = __bind(this.handleEvents, this);
      AtomHtmlPreviewView.__super__.constructor.apply(this, arguments);
      if (this.editorId != null) {
        this.resolveEditor(this.editorId);
        this.tmpPath = this.getPath();
      } else {
        if (atom.workspace != null) {
          this.subscribeToFilePath(filePath);
        } else {
          atom.packages.onDidActivatePackage((function(_this) {
            return function() {
              return _this.subscribeToFilePath(filePath);
            };
          })(this));
        }
      }
      handles = $("atom-pane-resize-handle");
      handles.on('mousedown', (function(_this) {
        return function() {
          return _this.onStartedResize();
        };
      })(this));
    }

    AtomHtmlPreviewView.prototype.onStartedResize = function() {
      this.css({
        'pointer-events': 'none'
      });
      return document.addEventListener('mouseup', this.onStoppedResizing.bind(this));
    };

    AtomHtmlPreviewView.prototype.onStoppedResizing = function() {
      this.css({
        'pointer-events': 'all'
      });
      return document.removeEventListener('mouseup', this.onStoppedResizing);
    };

    AtomHtmlPreviewView.prototype.serialize = function() {
      return {
        deserializer: 'AtomHtmlPreviewView',
        filePath: this.getPath(),
        editorId: this.editorId
      };
    };

    AtomHtmlPreviewView.prototype.destroy = function() {
      if (typeof editorSub !== "undefined" && editorSub !== null) {
        return this.editorSub.dispose();
      }
    };

    AtomHtmlPreviewView.prototype.subscribeToFilePath = function(filePath) {
      this.trigger('title-changed');
      this.handleEvents();
      return this.renderHTML();
    };

    AtomHtmlPreviewView.prototype.resolveEditor = function(editorId) {
      var resolve;
      resolve = (function(_this) {
        return function() {
          var _ref2, _ref3;
          _this.editor = _this.editorForId(editorId);
          if (_this.editor != null) {
            if (_this.editor != null) {
              _this.trigger('title-changed');
            }
            return _this.handleEvents();
          } else {
            return (_ref2 = atom.workspace) != null ? (_ref3 = _ref2.paneForItem(_this)) != null ? _ref3.destroyItem(_this) : void 0 : void 0;
          }
        };
      })(this);
      if (atom.workspace != null) {
        return resolve();
      } else {
        return atom.packages.onDidActivatePackage((function(_this) {
          return function() {
            resolve();
            return _this.renderHTML();
          };
        })(this));
      }
    };

    AtomHtmlPreviewView.prototype.editorForId = function(editorId) {
      var editor, _i, _len, _ref2, _ref3;
      _ref2 = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        editor = _ref2[_i];
        if (((_ref3 = editor.id) != null ? _ref3.toString() : void 0) === editorId.toString()) {
          return editor;
        }
      }
      return null;
    };

    AtomHtmlPreviewView.prototype.handleEvents = function() {
      var changeHandler, contextMenuClientX, contextMenuClientY;
      contextMenuClientX = 0;
      contextMenuClientY = 0;
      this.on('contextmenu', function(event) {
        contextMenuClientY = event.clientY;
        return contextMenuClientX = event.clientX;
      });
      atom.commands.add(this.element, {
        'atom-html-preview:open-devtools': (function(_this) {
          return function() {
            return _this.webview.openDevTools();
          };
        })(this),
        'atom-html-preview:inspect': (function(_this) {
          return function() {
            return _this.webview.inspectElement(contextMenuClientX, contextMenuClientY);
          };
        })(this),
        'atom-html-preview:print': (function(_this) {
          return function() {
            return _this.webview.print();
          };
        })(this)
      });
      changeHandler = (function(_this) {
        return function() {
          var pane;
          _this.renderHTML();
          pane = atom.workspace.paneForURI(_this.getURI());
          if ((pane != null) && pane !== atom.workspace.getActivePane()) {
            return pane.activateItem(_this);
          }
        };
      })(this);
      this.editorSub = new CompositeDisposable;
      if (this.editor != null) {
        if (atom.config.get("atom-html-preview.triggerOnSave")) {
          this.editorSub.add(this.editor.onDidSave(changeHandler));
        } else {
          this.editorSub.add(this.editor.onDidStopChanging(changeHandler));
        }
        return this.editorSub.add(this.editor.onDidChangePath((function(_this) {
          return function() {
            return _this.trigger('title-changed');
          };
        })(this)));
      }
    };

    AtomHtmlPreviewView.prototype.renderHTML = function() {
      this.showLoading();
      if (this.editor != null) {
        if (!atom.config.get("atom-html-preview.triggerOnSave") && (this.editor.getPath() != null)) {
          return this.save(this.renderHTMLCode);
        } else {
          return this.renderHTMLCode();
        }
      }
    };

    AtomHtmlPreviewView.prototype.save = function(callback) {
      var column, editorText, error, fileEnding, findTagBefore, firstSelection, lastTagRE, offset, out, outPath, row, tagIndex, tagRE, _ref2;
      outPath = path.resolve(path.join(os.tmpdir(), this.editor.getTitle() + ".html"));
      out = "";
      fileEnding = this.editor.getTitle().split(".").pop();
      if (atom.config.get("atom-html-preview.enableMathJax")) {
        out += "<script type=\"text/x-mathjax-config\">\nMathJax.Hub.Config({\ntex2jax: {inlineMath: [['\\\\f$','\\\\f$']]},\nmenuSettings: {zoom: 'Click'}\n});\n</script>\n<script type=\"text/javascript\"\nsrc=\"http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML\">\n</script>";
      }
      if (atom.config.get("atom-html-preview.preserveWhiteSpaces") && __indexOf.call(atom.config.get("atom-html-preview.fileEndings"), fileEnding) >= 0) {
        out += "<style type=\"text/css\">\nbody { white-space: pre; }\n</style>";
      } else {
        out += "<base href=\"" + this.getPath() + "\">";
      }
      editorText = this.editor.getText();
      firstSelection = this.editor.getSelections()[0];
      _ref2 = firstSelection.getBufferRange().start, row = _ref2.row, column = _ref2.column;
      if (atom.config.get("atom-html-preview.scrollToCursor")) {
        try {
          offset = this._getOffset(editorText, row, column);
          tagRE = /<((\/[\$\w\-])|br|input|link)\/?>/.source;
          lastTagRE = RegExp("" + tagRE + "(?![\\s\\S]*" + tagRE + ")", "i");
          findTagBefore = function(beforeIndex) {
            var matchedClosingTag;
            matchedClosingTag = editorText.slice(0, beforeIndex).match(lastTagRE);
            if (matchedClosingTag) {
              return matchedClosingTag.index + matchedClosingTag[0].length;
            } else {
              return -1;
            }
          };
          tagIndex = findTagBefore(offset);
          if (tagIndex > -1) {
            editorText = "" + (editorText.slice(0, tagIndex)) + "\n" + scrollInjectScript + "\n" + (editorText.slice(tagIndex));
          }
        } catch (_error) {
          error = _error;
          return -1;
        }
      }
      out += editorText;
      this.tmpPath = outPath;
      return fs.writeFile(outPath, out, (function(_this) {
        return function() {
          try {
            return _this.renderHTMLCode();
          } catch (_error) {
            error = _error;
            return _this.showError(error);
          }
        };
      })(this));
    };

    AtomHtmlPreviewView.prototype.renderHTMLCode = function() {
      var error, webview;
      if (this.webview == null) {
        webview = document.createElement("webview");
        webview.setAttribute("sandbox", "allow-scripts allow-same-origin");
        webview.setAttribute("style", "height: 100%");
        this.webview = webview;
        this.append($(webview));
      }
      this.webview.src = this.tmpPath;
      try {
        this.find('.show-error').hide();
        this.find('.show-loading').hide();
        this.webview.reload();
      } catch (_error) {
        error = _error;
        null;
      }
      return atom.commands.dispatch('atom-html-preview', 'html-changed');
    };

    AtomHtmlPreviewView.prototype._getOffset = function(text, row, column) {
      var line_re, match, match_index, offset;
      if (column == null) {
        column = 0;
      }
      line_re = /\n/g;
      match_index = null;
      while (row--) {
        if (match = line_re.exec(text)) {
          match_index = match.index;
        } else {
          return -1;
        }
      }
      offset = match_index + column;
      if (offset < text.length) {
        return offset;
      } else {
        return -1;
      }
    };

    AtomHtmlPreviewView.prototype.getTitle = function() {
      if (this.editor != null) {
        return "" + (this.editor.getTitle()) + " Preview";
      } else {
        return "HTML Preview";
      }
    };

    AtomHtmlPreviewView.prototype.getURI = function() {
      return "html-preview://editor/" + this.editorId;
    };

    AtomHtmlPreviewView.prototype.getPath = function() {
      if (this.editor != null) {
        return this.editor.getPath();
      }
    };

    AtomHtmlPreviewView.prototype.showError = function(result) {
      var failureMessage;
      failureMessage = result != null ? result.message : void 0;
      return this.find('.show-error').html($$$(function() {
        this.h2('Previewing HTML Failed');
        if (failureMessage != null) {
          return this.h3(failureMessage);
        }
      })).show();
    };

    AtomHtmlPreviewView.prototype.showLoading = function() {
      return this.find('.show-loading').show();
    };

    return AtomHtmlPreviewView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvYXRvbS1odG1sLXByZXZpZXcvbGliL2F0b20taHRtbC1wcmV2aWV3LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVIQUFBO0lBQUE7Ozt5SkFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBd0IsT0FBQSxDQUFRLElBQVIsQ0FBeEIsQ0FBQTs7QUFBQSxFQUNBLE9BQW9DLE9BQUEsQ0FBUSxNQUFSLENBQXBDLEVBQUMsMkJBQUEsbUJBQUQsRUFBc0Isa0JBQUEsVUFEdEIsQ0FBQTs7QUFBQSxFQUVBLFFBQXdCLE9BQUEsQ0FBUSxzQkFBUixDQUF4QixFQUFDLFVBQUEsQ0FBRCxFQUFJLFlBQUEsR0FBSixFQUFTLG1CQUFBLFVBRlQsQ0FBQTs7QUFBQSxFQUdBLElBQUEsR0FBd0IsT0FBQSxDQUFRLE1BQVIsQ0FIeEIsQ0FBQTs7QUFBQSxFQUlBLEVBQUEsR0FBd0IsT0FBQSxDQUFRLElBQVIsQ0FKeEIsQ0FBQTs7QUFBQSxFQU1BLGtCQUFBLEdBQXFCLDJzQkFOckIsQ0FBQTs7QUFBQSxFQStCQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osMENBQUEsQ0FBQTs7QUFBQSxJQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBbkIsQ0FBdUIsbUJBQXZCLENBQUEsQ0FBQTs7QUFBQSxrQ0FFQSxTQUFBLEdBQXNCLElBRnRCLENBQUE7O0FBQUEsa0NBR0EsZ0JBQUEsR0FBc0IsU0FBQSxHQUFBO2FBQU8sSUFBQSxVQUFBLENBQUEsRUFBUDtJQUFBLENBSHRCLENBQUE7O0FBQUEsa0NBSUEsbUJBQUEsR0FBc0IsU0FBQSxHQUFBO2FBQU8sSUFBQSxVQUFBLENBQUEsRUFBUDtJQUFBLENBSnRCLENBQUE7O0FBQUEsSUFNQSxtQkFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLEtB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

//# sourceURL=/Users/tane/.atom/packages/atom-html-preview/lib/atom-html-preview-view.coffee
