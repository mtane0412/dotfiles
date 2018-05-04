(function() {
  var $, $$$, CompositeDisposable, Disposable, Emitter, File, Grim, MarkdownMindmapView, SVG_PADDING, ScrollView, _, d3, fs, getSVG, markmapMindmap, markmapParse, path, ref, ref1, transformHeadings,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require('path');

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, $$$ = ref1.$$$, ScrollView = ref1.ScrollView;

  Grim = require('grim');

  _ = require('underscore-plus');

  fs = require('fs-plus');

  File = require('atom').File;

  markmapParse = require('markmap/parse.markdown');

  markmapMindmap = require('markmap/view.mindmap');

  transformHeadings = require('markmap/transform.headings');

  d3 = require('d3');

  require('markmap/d3-flextree');

  SVG_PADDING = 15;

  getSVG = function(arg) {
    var body, height, viewbox, width;
    body = arg.body, width = arg.width, height = arg.height, viewbox = arg.viewbox;
    return "<?xml version=\"1.0\" standalone=\"no\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\"\n  \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\"\n     width=\"" + width + "\" height=\"" + height + "\" viewBox=\"" + viewbox + "\">\n  <defs>\n    <style type=\"text/css\"><![CDATA[\n      .markmap-node {\n        cursor: pointer;\n      }\n\n      .markmap-node-circle {\n        fill: #fff;\n        stroke-width: 1.5px;\n      }\n\n      .markmap-node-text {\n        fill:  #000;\n        font: 10px sans-serif;\n      }\n\n      .markmap-link {\n        fill: none;\n      }\n    ]]></style>\n  </defs>\n  " + body + "\n</svg>";
  };

  module.exports = MarkdownMindmapView = (function(superClass) {
    extend(MarkdownMindmapView, superClass);

    MarkdownMindmapView.content = function() {
      return this.div({
        "class": 'markdown-mindmap native-key-bindings',
        tabindex: -1
      });
    };

    function MarkdownMindmapView(arg) {
      this.editorId = arg.editorId, this.filePath = arg.filePath;
      MarkdownMindmapView.__super__.constructor.apply(this, arguments);
      this.emitter = new Emitter;
      this.disposables = new CompositeDisposable;
      this.loaded = false;
    }

    MarkdownMindmapView.prototype.attached = function() {
      if (this.isAttached) {
        return;
      }
      this.isAttached = true;
      if (this.editorId != null) {
        return this.resolveEditor(this.editorId);
      } else {
        if (atom.workspace != null) {
          return this.subscribeToFilePath(this.filePath);
        } else {
          return this.disposables.add(atom.packages.onDidActivateInitialPackages((function(_this) {
            return function() {
              return _this.subscribeToFilePath(_this.filePath);
            };
          })(this)));
        }
      }
    };

    MarkdownMindmapView.prototype.serialize = function() {
      return {
        deserializer: 'MarkdownMindmapView',
        filePath: this.getPath(),
        editorId: this.editorId
      };
    };

    MarkdownMindmapView.prototype.destroy = function() {
      return this.disposables.dispose();
    };

    MarkdownMindmapView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    MarkdownMindmapView.prototype.onDidChangeModified = function(callback) {
      return new Disposable;
    };

    MarkdownMindmapView.prototype.onDidChangeMarkdown = function(callback) {
      return this.emitter.on('did-change-markdown', callback);
    };

    MarkdownMindmapView.prototype.subscribeToFilePath = function(filePath) {
      this.file = new File(filePath);
      this.emitter.emit('did-change-title');
      this.handleEvents();
      return this.renderMarkdown();
    };

    MarkdownMindmapView.prototype.resolveEditor = function(editorId) {
      var resolve;
      resolve = (function(_this) {
        return function() {
          var ref2, ref3;
          _this.editor = _this.editorForId(editorId);
          if (_this.editor != null) {
            if (_this.editor != null) {
              _this.emitter.emit('did-change-title');
            }
            _this.handleEvents();
            return _this.renderMarkdown();
          } else {
            return (ref2 = atom.workspace) != null ? (ref3 = ref2.paneForItem(_this)) != null ? ref3.destroyItem(_this) : void 0 : void 0;
          }
        };
      })(this);
      if (atom.workspace != null) {
        return resolve();
      } else {
        return this.disposables.add(atom.packages.onDidActivateInitialPackages(resolve));
      }
    };

    MarkdownMindmapView.prototype.editorForId = function(editorId) {
      var editor, i, len, ref2, ref3;
      ref2 = atom.workspace.getTextEditors();
      for (i = 0, len = ref2.length; i < len; i++) {
        editor = ref2[i];
        if (((ref3 = editor.id) != null ? ref3.toString() : void 0) === editorId.toString()) {
          return editor;
        }
      }
      return null;
    };

    MarkdownMindmapView.prototype.handleEvents = function() {
      var changeHandler;
      this.disposables.add(atom.grammars.onDidAddGrammar((function(_this) {
        return function() {
          return _.debounce((function() {
            return _this.renderMarkdown();
          }), 250);
        };
      })(this)));
      this.disposables.add(atom.grammars.onDidUpdateGrammar(_.debounce(((function(_this) {
        return function() {
          return _this.renderMarkdown();
        };
      })(this)), 250)));
      atom.commands.add(this.element, {
        'core:save-as': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this.saveAs();
          };
        })(this),
        'core:copy': (function(_this) {
          return function(event) {
            if (_this.copyToClipboard()) {
              return event.stopPropagation();
            }
          };
        })(this)
      });
      changeHandler = (function(_this) {
        return function() {
          var base, pane, ref2;
          _this.renderMarkdown();
          pane = (ref2 = typeof (base = atom.workspace).paneForItem === "function" ? base.paneForItem(_this) : void 0) != null ? ref2 : atom.workspace.paneForURI(_this.getURI());
          if ((pane != null) && pane !== atom.workspace.getActivePane()) {
            return pane.activateItem(_this);
          }
        };
      })(this);
      if (this.file != null) {
        this.disposables.add(this.file.onDidChange(changeHandler));
      } else if (this.editor != null) {
        this.disposables.add(this.editor.getBuffer().onDidStopChanging(function() {
          if (atom.config.get('markdown-mindmap.liveUpdate')) {
            return changeHandler();
          }
        }));
        this.disposables.add(this.editor.onDidChangePath((function(_this) {
          return function() {
            return _this.emitter.emit('did-change-title');
          };
        })(this)));
        this.disposables.add(this.editor.getBuffer().onDidSave(function() {
          if (!atom.config.get('markdown-mindmap.liveUpdate')) {
            return changeHandler();
          }
        }));
        this.disposables.add(this.editor.getBuffer().onDidReload(function() {
          if (!atom.config.get('markdown-mindmap.liveUpdate')) {
            return changeHandler();
          }
        }));
      }
      this.disposables.add(atom.config.observe('markdown-mindmap.theme', changeHandler));
      this.disposables.add(atom.config.observe('markdown-mindmap.linkShape', changeHandler));
      this.disposables.add(atom.config.observe('markdown-mindmap.parseListItems', changeHandler));
      return this.disposables.add(atom.config.observe('markdown-mindmap.truncateLabels', changeHandler));
    };

    MarkdownMindmapView.prototype.renderMarkdown = function() {
      if (!this.loaded) {
        this.showLoading();
      }
      return this.getMarkdownSource().then((function(_this) {
        return function(source) {
          if (source != null) {
            return _this.renderMarkdownText(source);
          }
        };
      })(this));
    };

    MarkdownMindmapView.prototype.getMarkdownSource = function() {
      if (this.file != null) {
        return this.file.read();
      } else if (this.editor != null) {
        return Promise.resolve(this.editor.getText());
      } else {
        return Promise.resolve(null);
      }
    };

    MarkdownMindmapView.prototype.getSVG = function(callback) {
      var body, heightOffset, maxX, maxY, minX, minY, node, nodes, realHeight, realWidth, state, transform;
      state = this.mindmap.state;
      nodes = this.mindmap.layout(state).nodes;
      minX = Math.round(d3.min(nodes, function(d) {
        return d.x;
      }));
      minY = Math.round(d3.min(nodes, function(d) {
        return d.y;
      }));
      maxX = Math.round(d3.max(nodes, function(d) {
        return d.x;
      }));
      maxY = Math.round(d3.max(nodes, function(d) {
        return d.y + d.y_size;
      }));
      realHeight = maxX - minX;
      realWidth = maxY - minY;
      heightOffset = state.nodeHeight;
      minX -= SVG_PADDING;
      minY -= SVG_PADDING;
      realHeight += 2 * SVG_PADDING;
      realWidth += 2 * SVG_PADDING;
      node = this.mindmap.svg.node();
      transform = node.getAttribute('transform');
      node.removeAttribute('transform');
      body = this.mindmap.svg.node().parentNode.innerHTML;
      node.setAttribute('transform', transform);
      return callback(null, getSVG({
        body: body,
        width: realWidth + 'px',
        height: realHeight + 'px',
        viewbox: minY + " " + (minX - heightOffset) + " " + realWidth + " " + (realHeight + heightOffset)
      }));
    };

    MarkdownMindmapView.prototype.hookEvents = function() {
      var nodes, toggleHandler;
      nodes = this.mindmap.svg.selectAll('g.markmap-node');
      toggleHandler = (function(_this) {
        return function() {
          _this.mindmap.click.apply(_this.mindmap, arguments);
          return _this.hookEvents();
        };
      })(this);
      nodes.on('click', null);
      nodes.selectAll('circle').on('click', toggleHandler);
      return nodes.selectAll('text,rect').on('click', (function(_this) {
        return function(d) {
          return _this.scrollToLine(d.line);
        };
      })(this));
    };

    MarkdownMindmapView.prototype.renderMarkdownText = function(text) {
      var cls, data, options;
      this.hideLoading();
      this.loaded = true;
      data = markmapParse(text, {
        lists: atom.config.get('markdown-mindmap.parseListItems')
      });
      data = transformHeadings(data);
      options = {
        preset: atom.config.get('markdown-mindmap.theme').replace(/-dark$/, ''),
        linkShape: atom.config.get('markdown-mindmap.linkShape'),
        truncateLabels: atom.config.get('markdown-mindmap.truncateLabels')
      };
      if (this.mindmap == null) {
        this.mindmap = markmapMindmap($('<svg style="height: 100%; width: 100%"></svg>').appendTo(this).get(0), data, options);
      } else {
        this.mindmap.setData(data).set(options).set({
          duration: 0
        }).update().set({
          duration: 750
        });
      }
      cls = this.attr('class').replace(/markdown-mindmap-theme-[^\s]+/, '');
      cls += ' markdown-mindmap-theme-' + atom.config.get('markdown-mindmap.theme');
      this.attr('class', cls);
      this.hookEvents();
      this.emitter.emit('did-change-markdown');
      return this.originalTrigger('markdown-mindmap:markdown-changed');
    };

    MarkdownMindmapView.prototype.scrollToLine = function(line) {
      return atom.workspace.open(this.getPath(), {
        initialLine: line,
        activatePane: false,
        searchAllPanes: true
      }).then(function(editor) {
        var cursor, pixel, view;
        cursor = editor.getCursorScreenPosition();
        view = atom.views.getView(editor);
        pixel = view.pixelPositionForScreenPosition(cursor).top;
        return editor.getElement().setScrollTop(pixel);
      });
    };

    MarkdownMindmapView.prototype.getTitle = function() {
      if (this.file != null) {
        return (path.basename(this.getPath())) + " Mindmap";
      } else if (this.editor != null) {
        return (this.editor.getTitle()) + " Mindmap";
      } else {
        return "Markdown Mindmap";
      }
    };

    MarkdownMindmapView.prototype.getIconName = function() {
      return "markdown";
    };

    MarkdownMindmapView.prototype.getURI = function() {
      if (this.file != null) {
        return "markdown-mindmap://" + (this.getPath());
      } else {
        return "markdown-mindmap://editor/" + this.editorId;
      }
    };

    MarkdownMindmapView.prototype.getPath = function() {
      if (this.file != null) {
        return this.file.getPath();
      } else if (this.editor != null) {
        return this.editor.getPath();
      }
    };

    MarkdownMindmapView.prototype.getGrammar = function() {
      var ref2;
      return (ref2 = this.editor) != null ? ref2.getGrammar() : void 0;
    };

    MarkdownMindmapView.prototype.getDocumentStyleSheets = function() {
      return document.styleSheets;
    };

    MarkdownMindmapView.prototype.getTextEditorStyles = function() {
      var textEditorStyles;
      textEditorStyles = document.createElement("atom-styles");
      textEditorStyles.setAttribute("context", "atom-text-editor");
      document.body.appendChild(textEditorStyles);
      textEditorStyles.initialize();
      return Array.prototype.slice.apply(textEditorStyles.childNodes).map(function(styleElement) {
        return styleElement.innerText;
      });
    };

    MarkdownMindmapView.prototype.getMarkdownMindmapCSS = function() {
      var cssUrlRefExp, i, j, len, len1, markdowPreviewRules, ref2, ref3, ref4, rule, ruleRegExp, stylesheet;
      markdowPreviewRules = [];
      ruleRegExp = /\.markdown-mindmap/;
      cssUrlRefExp = /url\(atom:\/\/markdown-mindmap\/assets\/(.*)\)/;
      ref2 = this.getDocumentStyleSheets();
      for (i = 0, len = ref2.length; i < len; i++) {
        stylesheet = ref2[i];
        if (stylesheet.rules != null) {
          ref3 = stylesheet.rules;
          for (j = 0, len1 = ref3.length; j < len1; j++) {
            rule = ref3[j];
            if (((ref4 = rule.selectorText) != null ? ref4.match(ruleRegExp) : void 0) != null) {
              markdowPreviewRules.push(rule.cssText);
            }
          }
        }
      }
      return markdowPreviewRules.concat(this.getTextEditorStyles()).join('\n').replace(/atom-text-editor/g, 'pre.editor-colors').replace(/:host/g, '.host').replace(cssUrlRefExp, function(match, assetsName, offset, string) {
        var assetPath, base64Data, originalData;
        assetPath = path.join(__dirname, '../assets', assetsName);
        originalData = fs.readFileSync(assetPath, 'binary');
        base64Data = new Buffer(originalData, 'binary').toString('base64');
        return "url('data:image/jpeg;base64," + base64Data + "')";
      });
    };

    MarkdownMindmapView.prototype.showError = function(result) {
      var failureMessage;
      failureMessage = result != null ? result.message : void 0;
      return this.html($$$(function() {
        this.h2('Previewing Markdown Failed');
        if (failureMessage != null) {
          return this.h3(failureMessage);
        }
      }));
    };

    MarkdownMindmapView.prototype.showLoading = function() {
      var spinner;
      this.loading = true;
      spinner = this.find('>.markdown-spinner');
      if (spinner.length === 0) {
        this.append($$$(function() {
          return this.div({
            "class": 'markdown-spinner'
          }, 'Loading Markdown\u2026');
        }));
      }
      return spinner.show();
    };

    MarkdownMindmapView.prototype.hideLoading = function() {
      this.loading = false;
      return this.find('>.markdown-spinner').hide();
    };

    MarkdownMindmapView.prototype.copyToClipboard = function() {
      if (this.loading) {
        return false;
      }
      this.getSVG(function(error, html) {
        if (error != null) {
          return console.warn('Copying Markdown as SVG failed', error);
        } else {
          return atom.clipboard.write(html);
        }
      });
      return true;
    };

    MarkdownMindmapView.prototype.saveAs = function() {
      var filePath, htmlFilePath, projectPath, title;
      if (this.loading) {
        return;
      }
      filePath = this.getPath();
      title = 'Markdown to SVG';
      if (filePath) {
        title = path.parse(filePath).name;
        filePath += '.svg';
      } else {
        filePath = 'untitled.md.svg';
        if (projectPath = atom.project.getPaths()[0]) {
          filePath = path.join(projectPath, filePath);
        }
      }
      if (htmlFilePath = atom.showSaveDialogSync(filePath)) {
        return this.getSVG((function(_this) {
          return function(error, htmlBody) {
            if (error != null) {
              return console.warn('Saving Markdown as SVG failed', error);
            } else {
              fs.writeFileSync(htmlFilePath, htmlBody);
              return atom.workspace.open(htmlFilePath);
            }
          };
        })(this));
      }
    };

    MarkdownMindmapView.prototype.isEqual = function(other) {
      return this[0] === (other != null ? other[0] : void 0);
    };

    return MarkdownMindmapView;

  })(ScrollView);

  if (Grim.includeDeprecatedAPIs) {
    MarkdownMindmapView.prototype.on = function(eventName) {
      if (eventName === 'markdown-mindmap:markdown-changed') {
        Grim.deprecate("Use MarkdownMindmapView::onDidChangeMarkdown instead of the 'markdown-mindmap:markdown-changed' jQuery event");
      }
      return MarkdownMindmapView.__super__.on.apply(this, arguments);
    };
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1taW5kbWFwL2xpYi9tYXJrZG93bi1taW5kbWFwLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwrTEFBQTtJQUFBOzs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBNkMsT0FBQSxDQUFRLE1BQVIsQ0FBN0MsRUFBQyxxQkFBRCxFQUFVLDJCQUFWLEVBQXNCOztFQUN0QixPQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxVQUFELEVBQUksY0FBSixFQUFTOztFQUNULElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDSixPQUFRLE9BQUEsQ0FBUSxNQUFSOztFQUNULFlBQUEsR0FBZSxPQUFBLENBQVEsd0JBQVI7O0VBQ2YsY0FBQSxHQUFpQixPQUFBLENBQVEsc0JBQVI7O0VBQ2pCLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSw0QkFBUjs7RUFDcEIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLE9BQUEsQ0FBUSxxQkFBUjs7RUFFQSxXQUFBLEdBQWM7O0VBRWQsTUFBQSxHQUFTLFNBQUMsR0FBRDtBQUNQLFFBQUE7SUFEVSxpQkFBTSxtQkFBTyxxQkFBUTtXQUMvQixnT0FBQSxHQUljLEtBSmQsR0FJb0IsY0FKcEIsR0FJZ0MsTUFKaEMsR0FJdUMsZUFKdkMsR0FJb0QsT0FKcEQsR0FJNEQsaVlBSjVELEdBMEJJLElBMUJKLEdBMEJTO0VBM0JGOztFQStCVCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDSixtQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEs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VyxRQUFYLENBQW9CLENBQUM7UUFDN0IsUUFBQSxJQUFZLE9BRmQ7T0FBQSxNQUFBO1FBSUUsUUFBQSxHQUFXO1FBQ1gsSUFBRyxXQUFBLEdBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBd0IsQ0FBQSxDQUFBLENBQXpDO1VBQ0UsUUFBQSxHQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsV0FBVixFQUF1QixRQUF2QixFQURiO1NBTEY7O01BUUEsSUFBRyxZQUFBLEdBQWUsSUFBSSxDQUFDLGtCQUFMLENBQXdCLFFBQXhCLENBQWxCO2VBRUUsSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEtBQUQsRUFBUSxRQUFSO1lBQ04sSUFBRyxhQUFIO3FCQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWEsK0JBQWIsRUFBOEMsS0FBOUMsRUFERjthQUFBLE1BQUE7Y0FHRSxFQUFFLENBQUMsYUFBSCxDQUFpQixZQUFqQixFQUErQixRQUEvQjtxQkFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsWUFBcEIsRUFKRjs7VUFETTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUixFQUZGOztJQWJNOztrQ0FzQlIsT0FBQSxHQUFTLFNBQUMsS0FBRDthQUNQLElBQUUsQ0FBQSxDQUFBLENBQUYsc0JBQVEsS0FBTyxDQUFBLENBQUE7SUFEUjs7OztLQTVVdUI7O0VBK1VsQyxJQUFHLElBQUksQ0FBQyxxQkFBUjtJQUNFLG1CQUFtQixDQUFBLFNBQUUsQ0FBQSxFQUFyQixHQUEwQixTQUFDLFNBQUQ7TUFDeEIsSUFBRyxTQUFBLEtBQWEsbUNBQWhCO1FBQ0UsSUFBSSxDQUFDLFNBQUwsQ0FBZSw4R0FBZixFQURGOzthQUVBLDZDQUFBLFNBQUE7SUFId0IsRUFENUI7O0FBL1hBIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbntFbWl0dGVyLCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgJCQkLCBTY3JvbGxWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuR3JpbSA9IHJlcXVpcmUgJ2dyaW0nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xue0ZpbGV9ID0gcmVxdWlyZSAnYXRvbSdcbm1hcmttYXBQYXJzZSA9IHJlcXVpcmUgJ21hcmttYXAvcGFyc2UubWFya2Rvd24nXG5tYXJrbWFwTWluZG1hcCA9IHJlcXVpcmUgJ21hcmttYXAvdmlldy5taW5kbWFwJ1xudHJhbnNmb3JtSGVhZGluZ3MgPSByZXF1aXJlICdtYXJrbWFwL3RyYW5zZm9ybS5oZWFkaW5ncydcbmQzID0gcmVxdWlyZSAnZDMnXG5yZXF1aXJlICdtYXJrbWFwL2QzLWZsZXh0cmVlJ1xuXG5TVkdfUEFERElORyA9IDE1XG5cbmdldFNWRyA9ICh7IGJvZHksIHdpZHRoLCBoZWlnaHQsIHZpZXdib3ggfSkgLT5cbiAgXCJcIlwiPD94bWwgdmVyc2lvbj1cIjEuMFwiIHN0YW5kYWxvbmU9XCJub1wiPz5cbiAgPCFET0NUWVBFIHN2ZyBQVUJMSUMgXCItLy9XM0MvL0RURCBTVkcgMS4xLy9FTlwiXG4gICAgXCJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGRcIj5cbiAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmVyc2lvbj1cIjEuMVwiXG4gICAgICAgd2lkdGg9XCIje3dpZHRofVwiIGhlaWdodD1cIiN7aGVpZ2h0fVwiIHZpZXdCb3g9XCIje3ZpZXdib3h9XCI+XG4gICAgPGRlZnM+XG4gICAgICA8c3R5bGUgdHlwZT1cInRleHQvY3NzXCI+PCFbQ0RBVEFbXG4gICAgICAgIC5tYXJrbWFwLW5vZGUge1xuICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC5tYXJrbWFwLW5vZGUtY2lyY2xlIHtcbiAgICAgICAgICBmaWxsOiAjZmZmO1xuICAgICAgICAgIHN0cm9rZS13aWR0aDogMS41cHg7XG4gICAgICAgIH1cblxuICAgICAgICAubWFya21hcC1ub2RlLXRleHQge1xuICAgICAgICAgIGZpbGw6ICAjMDAwO1xuICAgICAgICAgIGZvbnQ6IDEwcHggc2Fucy1zZXJpZjtcbiAgICAgICAgfVxuXG4gICAgICAgIC5tYXJrbWFwLWxpbmsge1xuICAgICAgICAgIGZpbGw6IG5vbmU7XG4gICAgICAgIH1cbiAgICAgIF1dPjwvc3R5bGU+XG4gICAgPC9kZWZzPlxuICAgICN7Ym9keX1cbiAgPC9zdmc+XG4gIFwiXCJcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBNYXJrZG93bk1pbmRtYXBWaWV3IGV4dGVuZHMgU2Nyb2xsVmlld1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnbWFya2Rvd24tbWluZG1hcCBuYXRpdmUta2V5LWJpbmRpbmdzJywgdGFiaW5kZXg6IC0xXG5cbiAgY29uc3RydWN0b3I6ICh7QGVkaXRvcklkLCBAZmlsZVBhdGh9KSAtPlxuICAgIHN1cGVyXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGxvYWRlZCA9IGZhbHNlXG5cbiAgYXR0YWNoZWQ6IC0+XG4gICAgcmV0dXJuIGlmIEBpc0F0dGFjaGVkXG4gICAgQGlzQXR0YWNoZWQgPSB0cnVlXG5cbiAgICBpZiBAZWRpdG9ySWQ/XG4gICAgICBAcmVzb2x2ZUVkaXRvcihAZWRpdG9ySWQpXG4gICAgZWxzZVxuICAgICAgaWYgYXRvbS53b3Jrc3BhY2U/XG4gICAgICAgIEBzdWJzY3JpYmVUb0ZpbGVQYXRoKEBmaWxlUGF0aClcbiAgICAgIGVsc2VcbiAgICAgICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVJbml0aWFsUGFja2FnZXMgPT5cbiAgICAgICAgICBAc3Vic2NyaWJlVG9GaWxlUGF0aChAZmlsZVBhdGgpXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIGRlc2VyaWFsaXplcjogJ01hcmtkb3duTWluZG1hcFZpZXcnXG4gICAgZmlsZVBhdGg6IEBnZXRQYXRoKClcbiAgICBlZGl0b3JJZDogQGVkaXRvcklkXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgb25EaWRDaGFuZ2VUaXRsZTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlLXRpdGxlJywgY2FsbGJhY2tcblxuICBvbkRpZENoYW5nZU1vZGlmaWVkOiAoY2FsbGJhY2spIC0+XG4gICAgIyBObyBvcCB0byBzdXBwcmVzcyBkZXByZWNhdGlvbiB3YXJuaW5nXG4gICAgbmV3IERpc3Bvc2FibGVcblxuICBvbkRpZENoYW5nZU1hcmtkb3duOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UtbWFya2Rvd24nLCBjYWxsYmFja1xuXG4gIHN1YnNjcmliZVRvRmlsZVBhdGg6IChmaWxlUGF0aCkgLT5cbiAgICBAZmlsZSA9IG5ldyBGaWxlKGZpbGVQYXRoKVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1jaGFuZ2UtdGl0bGUnXG4gICAgQGhhbmRsZUV2ZW50cygpXG4gICAgQHJlbmRlck1hcmtkb3duKClcblxuICByZXNvbHZlRWRpdG9yOiAoZWRpdG9ySWQpIC0+XG4gICAgcmVzb2x2ZSA9ID0+XG4gICAgICBAZWRpdG9yID0gQGVkaXRvckZvcklkKGVkaXRvcklkKVxuXG4gICAgICBpZiBAZWRpdG9yP1xuICAgICAgICBAZW1pdHRlci5lbWl0ICdkaWQtY2hhbmdlLXRpdGxlJyBpZiBAZWRpdG9yP1xuICAgICAgICBAaGFuZGxlRXZlbnRzKClcbiAgICAgICAgQHJlbmRlck1hcmtkb3duKClcbiAgICAgIGVsc2VcbiAgICAgICAgIyBUaGUgZWRpdG9yIHRoaXMgcHJldmlldyB3YXMgY3JlYXRlZCBmb3IgaGFzIGJlZW4gY2xvc2VkIHNvIGNsb3NlXG4gICAgICAgICMgdGhpcyBwcmV2aWV3IHNpbmNlIGEgcHJldmlldyBjYW5ub3QgYmUgcmVuZGVyZWQgd2l0aG91dCBhbiBlZGl0b3JcbiAgICAgICAgYXRvbS53b3Jrc3BhY2U/LnBhbmVGb3JJdGVtKHRoaXMpPy5kZXN0cm95SXRlbSh0aGlzKVxuXG4gICAgaWYgYXRvbS53b3Jrc3BhY2U/XG4gICAgICByZXNvbHZlKClcbiAgICBlbHNlXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlcyhyZXNvbHZlKVxuXG4gIGVkaXRvckZvcklkOiAoZWRpdG9ySWQpIC0+XG4gICAgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpXG4gICAgICByZXR1cm4gZWRpdG9yIGlmIGVkaXRvci5pZD8udG9TdHJpbmcoKSBpcyBlZGl0b3JJZC50b1N0cmluZygpXG4gICAgbnVsbFxuXG4gIGhhbmRsZUV2ZW50czogLT5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uZ3JhbW1hcnMub25EaWRBZGRHcmFtbWFyID0+IF8uZGVib3VuY2UoKD0+IEByZW5kZXJNYXJrZG93bigpKSwgMjUwKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5ncmFtbWFycy5vbkRpZFVwZGF0ZUdyYW1tYXIgXy5kZWJvdW5jZSgoPT4gQHJlbmRlck1hcmtkb3duKCkpLCAyNTApXG5cbiAgICAjIGRpc2FibGUgZXZlbnRzIGZvciBub3csIG1heWJlIHJlaW1wbGVtZW50IHRoZW0gbGF0ZXJcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBAZWxlbWVudCxcbiAgICAgICMgJ2NvcmU6bW92ZS11cCc6ID0+XG4gICAgICAjICAgQHNjcm9sbFVwKClcbiAgICAgICMgJ2NvcmU6bW92ZS1kb3duJzogPT5cbiAgICAgICMgICBAc2Nyb2xsRG93bigpXG4gICAgICAnY29yZTpzYXZlLWFzJzogKGV2ZW50KSA9PlxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBAc2F2ZUFzKClcbiAgICAgICdjb3JlOmNvcHknOiAoZXZlbnQpID0+XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpIGlmIEBjb3B5VG9DbGlwYm9hcmQoKVxuICAgICAgIyAnbWFya2Rvd24tbWluZG1hcDp6b29tLWluJzogPT5cbiAgICAgICMgICB6b29tTGV2ZWwgPSBwYXJzZUZsb2F0KEBjc3MoJ3pvb20nKSkgb3IgMVxuICAgICAgIyAgIEBjc3MoJ3pvb20nLCB6b29tTGV2ZWwgKyAuMSlcbiAgICAgICMgJ21hcmtkb3duLW1pbmRtYXA6em9vbS1vdXQnOiA9PlxuICAgICAgIyAgIHpvb21MZXZlbCA9IHBhcnNlRmxvYXQoQGNzcygnem9vbScpKSBvciAxXG4gICAgICAjICAgQGNzcygnem9vbScsIHpvb21MZXZlbCAtIC4xKVxuICAgICAgIyAnbWFya2Rvd24tbWluZG1hcDpyZXNldC16b29tJzogPT5cbiAgICAgICMgICBAY3NzKCd6b29tJywgMSlcblxuICAgIGNoYW5nZUhhbmRsZXIgPSA9PlxuICAgICAgQHJlbmRlck1hcmtkb3duKClcblxuICAgICAgIyBUT0RPOiBSZW1vdmUgcGFuZUZvclVSSSBjYWxsIHdoZW4gOjpwYW5lRm9ySXRlbSBpcyByZWxlYXNlZFxuICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtPyh0aGlzKSA/IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoQGdldFVSSSgpKVxuICAgICAgaWYgcGFuZT8gYW5kIHBhbmUgaXNudCBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0odGhpcylcblxuICAgIGlmIEBmaWxlP1xuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBAZmlsZS5vbkRpZENoYW5nZShjaGFuZ2VIYW5kbGVyKVxuICAgIGVsc2UgaWYgQGVkaXRvcj9cbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgQGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFN0b3BDaGFuZ2luZyAtPlxuICAgICAgICBjaGFuZ2VIYW5kbGVyKCkgaWYgYXRvbS5jb25maWcuZ2V0ICdtYXJrZG93bi1taW5kbWFwLmxpdmVVcGRhdGUnXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2VQYXRoID0+IEBlbWl0dGVyLmVtaXQgJ2RpZC1jaGFuZ2UtdGl0bGUnXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRTYXZlIC0+XG4gICAgICAgIGNoYW5nZUhhbmRsZXIoKSB1bmxlc3MgYXRvbS5jb25maWcuZ2V0ICdtYXJrZG93bi1taW5kbWFwLmxpdmVVcGRhdGUnXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRSZWxvYWQgLT5cbiAgICAgICAgY2hhbmdlSGFuZGxlcigpIHVubGVzcyBhdG9tLmNvbmZpZy5nZXQgJ21hcmtkb3duLW1pbmRtYXAubGl2ZVVwZGF0ZSdcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tbWluZG1hcC50aGVtZScsIGNoYW5nZUhhbmRsZXJcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnbWFya2Rvd24tbWluZG1hcC5saW5rU2hhcGUnLCBjaGFuZ2VIYW5kbGVyXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLW1pbmRtYXAucGFyc2VMaXN0SXRlbXMnLCBjaGFuZ2VIYW5kbGVyXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLW1pbmRtYXAudHJ1bmNhdGVMYWJlbHMnLCBjaGFuZ2VIYW5kbGVyXG5cbiAgcmVuZGVyTWFya2Rvd246IC0+XG4gICAgQHNob3dMb2FkaW5nKCkgdW5sZXNzIEBsb2FkZWRcbiAgICBAZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuIChzb3VyY2UpID0+IEByZW5kZXJNYXJrZG93blRleHQoc291cmNlKSBpZiBzb3VyY2U/XG5cbiAgZ2V0TWFya2Rvd25Tb3VyY2U6IC0+XG4gICAgaWYgQGZpbGU/XG4gICAgICBAZmlsZS5yZWFkKClcbiAgICBlbHNlIGlmIEBlZGl0b3I/XG4gICAgICBQcm9taXNlLnJlc29sdmUoQGVkaXRvci5nZXRUZXh0KCkpXG4gICAgZWxzZVxuICAgICAgUHJvbWlzZS5yZXNvbHZlKG51bGwpXG5cbiAgZ2V0U1ZHOiAoY2FsbGJhY2spIC0+XG4gICAgc3RhdGUgPSBAbWluZG1hcC5zdGF0ZVxuICAgIG5vZGVzID0gQG1pbmRtYXAubGF5b3V0KHN0YXRlKS5ub2Rlc1xuICAgIG1pblggPSBNYXRoLnJvdW5kKGQzLm1pbihub2RlcywgKGQpIC0+IGQueCkpXG4gICAgbWluWSA9IE1hdGgucm91bmQoZDMubWluKG5vZGVzLCAoZCkgLT4gZC55KSlcbiAgICBtYXhYID0gTWF0aC5yb3VuZChkMy5tYXgobm9kZXMsIChkKSAtPiBkLngpKVxuICAgIG1heFkgPSBNYXRoLnJvdW5kKGQzLm1heChub2RlcywgKGQpIC0+IGQueSArIGQueV9zaXplKSlcbiAgICByZWFsSGVpZ2h0ID0gbWF4WCAtIG1pblhcbiAgICByZWFsV2lkdGggPSBtYXhZIC0gbWluWVxuICAgIGhlaWdodE9mZnNldCA9IHN0YXRlLm5vZGVIZWlnaHRcblxuICAgIG1pblggLT0gU1ZHX1BBRERJTkc7XG4gICAgbWluWSAtPSBTVkdfUEFERElORztcbiAgICByZWFsSGVpZ2h0ICs9IDIqU1ZHX1BBRERJTkc7XG4gICAgcmVhbFdpZHRoICs9IDIqU1ZHX1BBRERJTkc7XG5cbiAgICBub2RlID0gQG1pbmRtYXAuc3ZnLm5vZGUoKVxuXG4gICAgIyB1bnNldCB0cmFuc2Zvcm1hdGlvbiBiZWZvcmUgd2UgdGFrZSB0aGUgc3ZnLCB3ZSB3aWxsIGhhbmRsZSBpdCB2aWEgdmlld3BvcnQgc2V0dGluZ1xuICAgIHRyYW5zZm9ybSA9IG5vZGUuZ2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nKVxuICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKCd0cmFuc2Zvcm0nKVxuXG4gICAgIyB0YWtlIHRoZSBzdmdcbiAgICBib2R5ID0gQG1pbmRtYXAuc3ZnLm5vZGUoKS5wYXJlbnROb2RlLmlubmVySFRNTFxuXG4gICAgIyByZXN0b3JlIHRoZSB0cmFuc2Zvcm1hdGlvblxuICAgIG5vZGUuc2V0QXR0cmlidXRlKCd0cmFuc2Zvcm0nLCB0cmFuc2Zvcm0pXG5cbiAgICBjYWxsYmFjayhudWxsLCBnZXRTVkcoe1xuICAgICAgYm9keSxcbiAgICAgIHdpZHRoOiByZWFsV2lkdGggKyAncHgnLFxuICAgICAgaGVpZ2h0OiByZWFsSGVpZ2h0ICsgJ3B4JyxcbiAgICAgIHZpZXdib3g6IFwiI3ttaW5ZfSAje21pblggLSBoZWlnaHRPZmZzZXR9ICN7cmVhbFdpZHRofSAje3JlYWxIZWlnaHQgKyBoZWlnaHRPZmZzZXR9XCJcbiAgICB9KSlcblxuICBob29rRXZlbnRzOiAoKSAtPlxuICAgIG5vZGVzID0gQG1pbmRtYXAuc3ZnLnNlbGVjdEFsbCgnZy5tYXJrbWFwLW5vZGUnKVxuICAgIHRvZ2dsZUhhbmRsZXIgPSAoKSA9PlxuICAgICAgQG1pbmRtYXAuY2xpY2suYXBwbHkoQG1pbmRtYXAsIGFyZ3VtZW50cylcbiAgICAgIEBob29rRXZlbnRzKClcbiAgICBub2Rlcy5vbignY2xpY2snLCBudWxsKVxuICAgIG5vZGVzLnNlbGVjdEFsbCgnY2lyY2xlJykub24oJ2NsaWNrJywgdG9nZ2xlSGFuZGxlcilcbiAgICBub2Rlcy5zZWxlY3RBbGwoJ3RleHQscmVjdCcpLm9uICdjbGljaycsIChkKSA9PlxuICAgICAgQHNjcm9sbFRvTGluZSBkLmxpbmVcblxuICByZW5kZXJNYXJrZG93blRleHQ6ICh0ZXh0KSAtPlxuICAgICAgIyBpZiBlcnJvclxuICAgICAgIyAgIEBzaG93RXJyb3IoZXJyb3IpXG4gICAgICAjIGVsc2VcbiAgICAgIEBoaWRlTG9hZGluZygpXG4gICAgICBAbG9hZGVkID0gdHJ1ZVxuXG4gICAgICAjIFRPRE8gcGFyYWxlbCByZW5kZXJpbmdcbiAgICAgIGRhdGEgPSBtYXJrbWFwUGFyc2UodGV4dCwge2xpc3RzOiBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLW1pbmRtYXAucGFyc2VMaXN0SXRlbXMnKX0pXG4gICAgICBkYXRhID0gdHJhbnNmb3JtSGVhZGluZ3MoZGF0YSlcbiAgICAgIG9wdGlvbnMgPVxuICAgICAgICBwcmVzZXQ6IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tbWluZG1hcC50aGVtZScpLnJlcGxhY2UoLy1kYXJrJC8sICcnKVxuICAgICAgICBsaW5rU2hhcGU6IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tbWluZG1hcC5saW5rU2hhcGUnKVxuICAgICAgICB0cnVuY2F0ZUxhYmVsczogYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1taW5kbWFwLnRydW5jYXRlTGFiZWxzJylcbiAgICAgIGlmIG5vdCBAbWluZG1hcD9cbiAgICAgICAgQG1pbmRtYXAgPSBtYXJrbWFwTWluZG1hcCgkKCc8c3ZnIHN0eWxlPVwiaGVpZ2h0OiAxMDAlOyB3aWR0aDogMTAwJVwiPjwvc3ZnPicpLmFwcGVuZFRvKHRoaXMpLmdldCgwKSwgZGF0YSwgb3B0aW9ucylcbiAgICAgIGVsc2VcbiAgICAgICAgQG1pbmRtYXAuc2V0RGF0YShkYXRhKS5zZXQob3B0aW9ucykuc2V0KHtkdXJhdGlvbjogMH0pLnVwZGF0ZSgpLnNldCh7ZHVyYXRpb246IDc1MH0pXG5cbiAgICAgIGNscyA9IHRoaXMuYXR0cignY2xhc3MnKS5yZXBsYWNlKC9tYXJrZG93bi1taW5kbWFwLXRoZW1lLVteXFxzXSsvLCAnJylcbiAgICAgIGNscyArPSAnIG1hcmtkb3duLW1pbmRtYXAtdGhlbWUtJyArIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tbWluZG1hcC50aGVtZScpXG4gICAgICB0aGlzLmF0dHIoJ2NsYXNzJywgY2xzKVxuXG4gICAgICBAaG9va0V2ZW50cygpXG5cbiAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1jaGFuZ2UtbWFya2Rvd24nXG4gICAgICBAb3JpZ2luYWxUcmlnZ2VyKCdtYXJrZG93bi1taW5kbWFwOm1hcmtkb3duLWNoYW5nZWQnKVxuXG4gIHNjcm9sbFRvTGluZTogKGxpbmUpIC0+XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihAZ2V0UGF0aCgpLFxuICAgICAgaW5pdGlhbExpbmU6IGxpbmVcbiAgICAgIGFjdGl2YXRlUGFuZTogZmFsc2VcbiAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICAgIGN1cnNvciA9IGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgICAgIHZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICBwaXhlbCA9IHZpZXcucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKGN1cnNvcikudG9wXG4gICAgICAgIGVkaXRvci5nZXRFbGVtZW50KCkuc2V0U2Nyb2xsVG9wIHBpeGVsXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgaWYgQGZpbGU/XG4gICAgICBcIiN7cGF0aC5iYXNlbmFtZShAZ2V0UGF0aCgpKX0gTWluZG1hcFwiXG4gICAgZWxzZSBpZiBAZWRpdG9yP1xuICAgICAgXCIje0BlZGl0b3IuZ2V0VGl0bGUoKX0gTWluZG1hcFwiXG4gICAgZWxzZVxuICAgICAgXCJNYXJrZG93biBNaW5kbWFwXCJcblxuICBnZXRJY29uTmFtZTogLT5cbiAgICBcIm1hcmtkb3duXCJcblxuICBnZXRVUkk6IC0+XG4gICAgaWYgQGZpbGU/XG4gICAgICBcIm1hcmtkb3duLW1pbmRtYXA6Ly8je0BnZXRQYXRoKCl9XCJcbiAgICBlbHNlXG4gICAgICBcIm1hcmtkb3duLW1pbmRtYXA6Ly9lZGl0b3IvI3tAZWRpdG9ySWR9XCJcblxuICBnZXRQYXRoOiAtPlxuICAgIGlmIEBmaWxlP1xuICAgICAgQGZpbGUuZ2V0UGF0aCgpXG4gICAgZWxzZSBpZiBAZWRpdG9yP1xuICAgICAgQGVkaXRvci5nZXRQYXRoKClcblxuICBnZXRHcmFtbWFyOiAtPlxuICAgIEBlZGl0b3I/LmdldEdyYW1tYXIoKVxuXG4gIGdldERvY3VtZW50U3R5bGVTaGVldHM6IC0+ICMgVGhpcyBmdW5jdGlvbiBleGlzdHMgc28gd2UgY2FuIHN0dWIgaXRcbiAgICBkb2N1bWVudC5zdHlsZVNoZWV0c1xuXG4gIGdldFRleHRFZGl0b3JTdHlsZXM6IC0+XG5cbiAgICB0ZXh0RWRpdG9yU3R5bGVzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImF0b20tc3R5bGVzXCIpXG4gICAgdGV4dEVkaXRvclN0eWxlcy5zZXRBdHRyaWJ1dGUgXCJjb250ZXh0XCIsIFwiYXRvbS10ZXh0LWVkaXRvclwiXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCB0ZXh0RWRpdG9yU3R5bGVzXG5cbiAgICAjIEZvcmNlIHN0eWxlcyBpbmplY3Rpb25cbiAgICB0ZXh0RWRpdG9yU3R5bGVzLmluaXRpYWxpemUoKVxuXG4gICAgIyBFeHRyYWN0IHN0eWxlIGVsZW1lbnRzIGNvbnRlbnRcbiAgICBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkodGV4dEVkaXRvclN0eWxlcy5jaGlsZE5vZGVzKS5tYXAgKHN0eWxlRWxlbWVudCkgLT5cbiAgICAgIHN0eWxlRWxlbWVudC5pbm5lclRleHRcblxuICBnZXRNYXJrZG93bk1pbmRtYXBDU1M6IC0+XG4gICAgbWFya2Rvd1ByZXZpZXdSdWxlcyA9IFtdXG4gICAgcnVsZVJlZ0V4cCA9IC9cXC5tYXJrZG93bi1taW5kbWFwL1xuICAgIGNzc1VybFJlZkV4cCA9IC91cmxcXChhdG9tOlxcL1xcL21hcmtkb3duLW1pbmRtYXBcXC9hc3NldHNcXC8oLiopXFwpL1xuXG4gICAgZm9yIHN0eWxlc2hlZXQgaW4gQGdldERvY3VtZW50U3R5bGVTaGVldHMoKVxuICAgICAgaWYgc3R5bGVzaGVldC5ydWxlcz9cbiAgICAgICAgZm9yIHJ1bGUgaW4gc3R5bGVzaGVldC5ydWxlc1xuICAgICAgICAgICMgV2Ugb25seSBuZWVkIGAubWFya2Rvd24tcmV2aWV3YCBjc3NcbiAgICAgICAgICBtYXJrZG93UHJldmlld1J1bGVzLnB1c2gocnVsZS5jc3NUZXh0KSBpZiBydWxlLnNlbGVjdG9yVGV4dD8ubWF0Y2gocnVsZVJlZ0V4cCk/XG5cbiAgICBtYXJrZG93UHJldmlld1J1bGVzXG4gICAgICAuY29uY2F0KEBnZXRUZXh0RWRpdG9yU3R5bGVzKCkpXG4gICAgICAuam9pbignXFxuJylcbiAgICAgIC5yZXBsYWNlKC9hdG9tLXRleHQtZWRpdG9yL2csICdwcmUuZWRpdG9yLWNvbG9ycycpXG4gICAgICAucmVwbGFjZSgvOmhvc3QvZywgJy5ob3N0JykgIyBSZW1vdmUgc2hhZG93LWRvbSA6aG9zdCBzZWxlY3RvciBjYXVzaW5nIHByb2JsZW0gb24gRkZcbiAgICAgIC5yZXBsYWNlIGNzc1VybFJlZkV4cCwgKG1hdGNoLCBhc3NldHNOYW1lLCBvZmZzZXQsIHN0cmluZykgLT4gIyBiYXNlNjQgZW5jb2RlIGFzc2V0c1xuICAgICAgICBhc3NldFBhdGggPSBwYXRoLmpvaW4gX19kaXJuYW1lLCAnLi4vYXNzZXRzJywgYXNzZXRzTmFtZVxuICAgICAgICBvcmlnaW5hbERhdGEgPSBmcy5yZWFkRmlsZVN5bmMgYXNzZXRQYXRoLCAnYmluYXJ5J1xuICAgICAgICBiYXNlNjREYXRhID0gbmV3IEJ1ZmZlcihvcmlnaW5hbERhdGEsICdiaW5hcnknKS50b1N0cmluZygnYmFzZTY0JylcbiAgICAgICAgXCJ1cmwoJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsI3tiYXNlNjREYXRhfScpXCJcblxuICBzaG93RXJyb3I6IChyZXN1bHQpIC0+XG4gICAgZmFpbHVyZU1lc3NhZ2UgPSByZXN1bHQ/Lm1lc3NhZ2VcblxuICAgIEBodG1sICQkJCAtPlxuICAgICAgQGgyICdQcmV2aWV3aW5nIE1hcmtkb3duIEZhaWxlZCdcbiAgICAgIEBoMyBmYWlsdXJlTWVzc2FnZSBpZiBmYWlsdXJlTWVzc2FnZT9cblxuICBzaG93TG9hZGluZzogLT5cbiAgICBAbG9hZGluZyA9IHRydWVcbiAgICBzcGlubmVyID0gQGZpbmQoJz4ubWFya2Rvd24tc3Bpbm5lcicpXG4gICAgaWYgc3Bpbm5lci5sZW5ndGggPT0gMFxuICAgICAgQGFwcGVuZCAkJCQgLT5cbiAgICAgICAgQGRpdiBjbGFzczogJ21hcmtkb3duLXNwaW5uZXInLCAnTG9hZGluZyBNYXJrZG93blxcdTIwMjYnXG4gICAgc3Bpbm5lci5zaG93KClcblxuICBoaWRlTG9hZGluZzogLT5cbiAgICBAbG9hZGluZyA9IGZhbHNlXG4gICAgQGZpbmQoJz4ubWFya2Rvd24tc3Bpbm5lcicpLmhpZGUoKVxuXG4gIGNvcHlUb0NsaXBib2FyZDogLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQGxvYWRpbmdcblxuICAgIEBnZXRTVkcgKGVycm9yLCBodG1sKSAtPlxuICAgICAgaWYgZXJyb3I/XG4gICAgICAgIGNvbnNvbGUud2FybignQ29weWluZyBNYXJrZG93biBhcyBTVkcgZmFpbGVkJywgZXJyb3IpXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGh0bWwpXG5cbiAgICB0cnVlXG5cbiAgc2F2ZUFzOiAtPlxuICAgIHJldHVybiBpZiBAbG9hZGluZ1xuXG4gICAgZmlsZVBhdGggPSBAZ2V0UGF0aCgpXG4gICAgdGl0bGUgPSAnTWFya2Rvd24gdG8gU1ZHJ1xuICAgIGlmIGZpbGVQYXRoXG4gICAgICB0aXRsZSA9IHBhdGgucGFyc2UoZmlsZVBhdGgpLm5hbWVcbiAgICAgIGZpbGVQYXRoICs9ICcuc3ZnJ1xuICAgIGVsc2VcbiAgICAgIGZpbGVQYXRoID0gJ3VudGl0bGVkLm1kLnN2ZydcbiAgICAgIGlmIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF1cbiAgICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFBhdGgsIGZpbGVQYXRoKVxuXG4gICAgaWYgaHRtbEZpbGVQYXRoID0gYXRvbS5zaG93U2F2ZURpYWxvZ1N5bmMoZmlsZVBhdGgpXG5cbiAgICAgIEBnZXRTVkcgKGVycm9yLCBodG1sQm9keSkgPT5cbiAgICAgICAgaWYgZXJyb3I/XG4gICAgICAgICAgY29uc29sZS53YXJuKCdTYXZpbmcgTWFya2Rvd24gYXMgU1ZHIGZhaWxlZCcsIGVycm9yKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhodG1sRmlsZVBhdGgsIGh0bWxCb2R5KVxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oaHRtbEZpbGVQYXRoKVxuXG4gIGlzRXF1YWw6IChvdGhlcikgLT5cbiAgICBAWzBdIGlzIG90aGVyP1swXSAjIENvbXBhcmUgRE9NIGVsZW1lbnRzXG5cbmlmIEdyaW0uaW5jbHVkZURlcHJlY2F0ZWRBUElzXG4gIE1hcmtkb3duTWluZG1hcFZpZXc6Om9uID0gKGV2ZW50TmFtZSkgLT5cbiAgICBpZiBldmVudE5hbWUgaXMgJ21hcmtkb3duLW1pbmRtYXA6bWFya2Rvd24tY2hhbmdlZCdcbiAgICAgIEdyaW0uZGVwcmVjYXRlKFwiVXNlIE1hcmtkb3duTWluZG1hcFZpZXc6Om9uRGlkQ2hhbmdlTWFya2Rvd24gaW5zdGVhZCBvZiB0aGUgJ21hcmtkb3duLW1pbmRtYXA6bWFya2Rvd24tY2hhbmdlZCcgalF1ZXJ5IGV2ZW50XCIpXG4gICAgc3VwZXJcbiJdfQ==
