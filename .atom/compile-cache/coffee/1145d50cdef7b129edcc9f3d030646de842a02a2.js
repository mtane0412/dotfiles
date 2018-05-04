(function() {
  var $, CompositeDisposable, Emitter, InputDialog, PlatformIOTerminalView, Pty, Task, Terminal, View, lastActiveElement, lastOpenedView, os, path, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Task = ref.Task, CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, View = ref1.View;

  Pty = require.resolve('./process');

  Terminal = require('term.js');

  InputDialog = null;

  path = require('path');

  os = require('os');

  lastOpenedView = null;

  lastActiveElement = null;

  module.exports = PlatformIOTerminalView = (function(superClass) {
    extend(PlatformIOTerminalView, superClass);

    function PlatformIOTerminalView() {
      this.blurTerminal = bind(this.blurTerminal, this);
      this.focusTerminal = bind(this.focusTerminal, this);
      this.blur = bind(this.blur, this);
      this.focus = bind(this.focus, this);
      this.resizePanel = bind(this.resizePanel, this);
      this.resizeStopped = bind(this.resizeStopped, this);
      this.resizeStarted = bind(this.resizeStarted, this);
      this.onWindowResize = bind(this.onWindowResize, this);
      this.hide = bind(this.hide, this);
      this.open = bind(this.open, this);
      this.recieveItemOrFile = bind(this.recieveItemOrFile, this);
      this.setAnimationSpeed = bind(this.setAnimationSpeed, this);
      return PlatformIOTerminalView.__super__.constructor.apply(this, arguments);
    }

    PlatformIOTerminalView.prototype.animating = false;

    PlatformIOTerminalView.prototype.id = '';

    PlatformIOTerminalView.prototype.maximized = false;

    PlatformIOTerminalView.prototype.opened = false;

    PlatformIOTerminalView.prototype.pwd = '';

    PlatformIOTerminalView.prototype.windowHeight = $(window).height();

    PlatformIOTerminalView.prototype.rowHeight = 20;

    PlatformIOTerminalView.prototype.shell = '';

    PlatformIOTerminalView.prototype.tabView = false;

    PlatformIOTerminalView.content = function() {
      return this.div({
        "class": 'platformio-ide-terminal terminal-view',
        outlet: 'platformIOTerminalView'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-divider',
            outlet: 'panelDivider'
          });
          _this.section({
            "class": 'input-block'
          }, function() {
            return _this.div({
              "class": 'btn-toolbar'
            }, function() {
              _this.div({
                "class": 'btn-group'
              }, function() {
                return _this.button({
                  outlet: 'inputBtn',
                  "class": 'btn icon icon-keyboard',
                  click: 'inputDialog'
                });
              });
              return _this.div({
                "class": 'btn-group right'
              }, function() {
                _this.button({
                  outlet: 'hideBtn',
                  "class": 'btn icon icon-chevron-down',
                  click: 'hide'
                });
                _this.button({
                  outlet: 'maximizeBtn',
                  "class": 'btn icon icon-screen-full',
                  click: 'maximize'
                });
                return _this.button({
                  outlet: 'closeBtn',
                  "class": 'btn icon icon-x',
                  click: 'destroy'
                });
              });
            });
          });
          return _this.div({
            "class": 'xterm',
            outlet: 'xterm'
          });
        };
      })(this));
    };

    PlatformIOTerminalView.getFocusedTerminal = function() {
      return Terminal.Terminal.focus;
    };

    PlatformIOTerminalView.prototype.initialize = function(id, pwd, statusIcon, statusBar, shell, args, env, autoRun) {
      var bottomHeight, override, percent;
      this.id = id;
      this.pwd = pwd;
      this.statusIcon = statusIcon;
      this.statusBar = statusBar;
      this.shell = shell;
      this.args = args != null ? args : [];
      this.env = env != null ? env : {};
      this.autoRun = autoRun != null ? autoRun : [];
      this.subscriptions = new CompositeDisposable;
      this.emitter = new Emitter;
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close'
      }));
      this.subscriptions.add(atom.tooltips.add(this.hideBtn, {
        title: 'Hide'
      }));
      this.subscriptions.add(this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
        title: 'Fullscreen'
      }));
      this.inputBtn.tooltip = atom.tooltips.add(this.inputBtn, {
        title: 'Insert Text'
      });
      this.prevHeight = atom.config.get('platformio-ide-terminal.style.defaultPanelHeight');
      if (this.prevHeight.indexOf('%') > 0) {
        percent = Math.abs(Math.min(parseFloat(this.prevHeight) / 100.0, 1));
        bottomHeight = $('atom-panel.bottom').children(".terminal-view").height() || 0;
        this.prevHeight = percent * ($('.item-views').height() + bottomHeight);
      }
      this.xterm.height(0);
      this.setAnimationSpeed();
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.animationSpeed', this.setAnimationSpeed));
      override = function(event) {
        if (event.originalEvent.dataTransfer.getData('platformio-ide-terminal') === 'true') {
          return;
        }
        event.preventDefault();
        return event.stopPropagation();
      };
      this.xterm.on('mouseup', (function(_this) {
        return function(event) {
          var lines, rawLines, text;
          if (event.which !== 3) {
            text = window.getSelection().toString();
            if (atom.config.get('platformio-ide-terminal.toggles.selectToCopy') && text) {
              rawLines = text.split(/\r?\n/g);
              lines = rawLines.map(function(line) {
                return line.replace(/\s/g, " ").trimRight();
              });
              text = lines.join("\n");
              atom.clipboard.write(text);
            }
            if (!text) {
              return _this.focus();
            }
          }
        };
      })(this));
      this.xterm.on('dragenter', override);
      this.xterm.on('dragover', override);
      this.xterm.on('drop', this.recieveItemOrFile);
      this.on('focus', this.focus);
      this.subscriptions.add({
        dispose: (function(_this) {
          return function() {
            return _this.off('focus', _this.focus);
          };
        })(this)
      });
      if (/zsh|bash/.test(this.shell) && this.args.indexOf('--login') === -1 && Pty.platform !== 'win32' && atom.config.get('platformio-ide-terminal.toggles.loginShell')) {
        return this.args.unshift('--login');
      }
    };

    PlatformIOTerminalView.prototype.attach = function() {
      if (this.panel != null) {
        return;
      }
      return this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
    };

    PlatformIOTerminalView.prototype.setAnimationSpeed = function() {
      this.animationSpeed = atom.config.get('platformio-ide-terminal.style.animationSpeed');
      if (this.animationSpeed === 0) {
        this.animationSpeed = 100;
      }
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    PlatformIOTerminalView.prototype.recieveItemOrFile = function(event) {
      var dataTransfer, file, filePath, i, len, ref2, results;
      event.preventDefault();
      event.stopPropagation();
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('atom-event') === 'true') {
        filePath = dataTransfer.getData('text/plain');
        if (filePath) {
          return this.input(filePath + " ");
        }
      } else if (filePath = dataTransfer.getData('initialPath')) {
        return this.input(filePath + " ");
      } else if (dataTransfer.files.length > 0) {
        ref2 = dataTransfer.files;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          file = ref2[i];
          results.push(this.input(file.path + " "));
        }
        return results;
      }
    };

    PlatformIOTerminalView.prototype.forkPtyProcess = function() {
      return Task.once(Pty, path.resolve(this.pwd), this.shell, this.args, this.env, (function(_this) {
        return function() {
          _this.input = function() {};
          return _this.resize = function() {};
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.getId = function() {
      return this.id;
    };

    PlatformIOTerminalView.prototype.displayTerminal = function() {
      var cols, ref2, rows;
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      this.ptyProcess = this.forkPtyProcess();
      this.terminal = new Terminal({
        cursorBlink: false,
        scrollback: atom.config.get('platformio-ide-terminal.core.scrollback'),
        cols: cols,
        rows: rows
      });
      this.attachListeners();
      this.attachResizeEvents();
      this.attachWindowEvents();
      return this.terminal.open(this.xterm.get(0));
    };

    PlatformIOTerminalView.prototype.attachListeners = function() {
      this.ptyProcess.on("platformio-ide-terminal:data", (function(_this) {
        return function(data) {
          return _this.terminal.write(data);
        };
      })(this));
      this.ptyProcess.on("platformio-ide-terminal:exit", (function(_this) {
        return function() {
          if (atom.config.get('platformio-ide-terminal.toggles.autoClose')) {
            return _this.destroy();
          }
        };
      })(this));
      this.terminal.end = (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this);
      this.terminal.on("data", (function(_this) {
        return function(data) {
          return _this.input(data);
        };
      })(this));
      this.ptyProcess.on("platformio-ide-terminal:title", (function(_this) {
        return function(title) {
          return _this.process = title;
        };
      })(this));
      this.terminal.on("title", (function(_this) {
        return function(title) {
          return _this.title = title;
        };
      })(this));
      return this.terminal.once("open", (function(_this) {
        return function() {
          var autoRunCommand, command, i, len, ref2, results;
          _this.applyStyle();
          _this.resizeTerminalToView();
          if (_this.ptyProcess.childProcess == null) {
            return;
          }
          autoRunCommand = atom.config.get('platformio-ide-terminal.core.autoRunCommand');
          if (autoRunCommand) {
            _this.input("" + autoRunCommand + os.EOL);
          }
          ref2 = _this.autoRun;
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            command = ref2[i];
            results.push(_this.input("" + command + os.EOL));
          }
          return results;
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.destroy = function() {
      var ref2, ref3;
      this.subscriptions.dispose();
      this.statusIcon.destroy();
      this.statusBar.removeTerminalView(this);
      this.detachResizeEvents();
      this.detachWindowEvents();
      if (this.panel.isVisible()) {
        this.hide();
        this.onTransitionEnd((function(_this) {
          return function() {
            return _this.panel.destroy();
          };
        })(this));
      } else {
        this.panel.destroy();
      }
      if (this.statusIcon && this.statusIcon.parentNode) {
        this.statusIcon.parentNode.removeChild(this.statusIcon);
      }
      if ((ref2 = this.ptyProcess) != null) {
        ref2.terminate();
      }
      return (ref3 = this.terminal) != null ? ref3.destroy() : void 0;
    };

    PlatformIOTerminalView.prototype.maximize = function() {
      var btn;
      this.subscriptions.remove(this.maximizeBtn.tooltip);
      this.maximizeBtn.tooltip.dispose();
      this.maxHeight = this.prevHeight + atom.workspace.getCenter().paneContainer.element.offsetHeight;
      btn = this.maximizeBtn.children('span');
      this.onTransitionEnd((function(_this) {
        return function() {
          return _this.focus();
        };
      })(this));
      if (this.maximized) {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Fullscreen'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.prevHeight);
        btn.removeClass('icon-screen-normal').addClass('icon-screen-full');
        return this.maximized = false;
      } else {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Normal'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.maxHeight);
        btn.removeClass('icon-screen-full').addClass('icon-screen-normal');
        return this.maximized = true;
      }
    };

    PlatformIOTerminalView.prototype.open = function() {
      var icon;
      if (lastActiveElement == null) {
        lastActiveElement = $(document.activeElement);
      }
      if (lastOpenedView && lastOpenedView !== this) {
        if (lastOpenedView.maximized) {
          this.subscriptions.remove(this.maximizeBtn.tooltip);
          this.maximizeBtn.tooltip.dispose();
          icon = this.maximizeBtn.children('span');
          this.maxHeight = lastOpenedView.maxHeight;
          this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
            title: 'Normal'
          });
          this.subscriptions.add(this.maximizeBtn.tooltip);
          icon.removeClass('icon-screen-full').addClass('icon-screen-normal');
          this.maximized = true;
        }
        lastOpenedView.hide();
      }
      lastOpenedView = this;
      this.statusBar.setActiveTerminalView(this);
      this.statusIcon.activate();
      this.onTransitionEnd((function(_this) {
        return function() {
          if (!_this.opened) {
            _this.opened = true;
            _this.displayTerminal();
            _this.prevHeight = _this.nearestRow(_this.xterm.height());
            _this.xterm.height(_this.prevHeight);
            return _this.emit("platformio-ide-terminal:terminal-open");
          } else {
            return _this.focus();
          }
        };
      })(this));
      this.panel.show();
      this.xterm.height(0);
      this.animating = true;
      return this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
    };

    PlatformIOTerminalView.prototype.hide = function() {
      var ref2;
      if ((ref2 = this.terminal) != null) {
        ref2.blur();
      }
      lastOpenedView = null;
      this.statusIcon.deactivate();
      this.onTransitionEnd((function(_this) {
        return function() {
          _this.panel.hide();
          if (lastOpenedView == null) {
            if (lastActiveElement != null) {
              lastActiveElement.focus();
              return lastActiveElement = null;
            }
          }
        };
      })(this));
      this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
      this.animating = true;
      return this.xterm.height(0);
    };

    PlatformIOTerminalView.prototype.toggle = function() {
      if (this.animating) {
        return;
      }
      if (this.panel.isVisible()) {
        return this.hide();
      } else {
        return this.open();
      }
    };

    PlatformIOTerminalView.prototype.input = function(data) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      this.terminal.stopScrolling();
      return this.ptyProcess.send({
        event: 'input',
        text: data
      });
    };

    PlatformIOTerminalView.prototype.resize = function(cols, rows) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      return this.ptyProcess.send({
        event: 'resize',
        rows: rows,
        cols: cols
      });
    };

    PlatformIOTerminalView.prototype.pty = function() {
      var wait;
      if (!this.opened) {
        wait = new Promise((function(_this) {
          return function(resolve, reject) {
            _this.emitter.on("platformio-ide-terminal:terminal-open", function() {
              return resolve();
            });
            return setTimeout(reject, 1000);
          };
        })(this));
        return wait.then((function(_this) {
          return function() {
            return _this.ptyPromise();
          };
        })(this));
      } else {
        return this.ptyPromise();
      }
    };

    PlatformIOTerminalView.prototype.ptyPromise = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          if (_this.ptyProcess != null) {
            _this.ptyProcess.on("platformio-ide-terminal:pty", function(pty) {
              return resolve(pty);
            });
            _this.ptyProcess.send({
              event: 'pty'
            });
            return setTimeout(reject, 1000);
          } else {
            return reject();
          }
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.applyStyle = function() {
      var config, defaultFont, editorFont, editorFontSize, overrideFont, overrideFontSize, ref2, ref3;
      config = atom.config.get('platformio-ide-terminal');
      this.xterm.addClass(config.style.theme);
      if (config.toggles.cursorBlink) {
        this.xterm.addClass('cursor-blink');
      }
      editorFont = atom.config.get('editor.fontFamily');
      defaultFont = "Menlo, Consolas, 'DejaVu Sans Mono', monospace";
      overrideFont = config.style.fontFamily;
      this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
      this.subscriptions.add(atom.config.onDidChange('editor.fontFamily', (function(_this) {
        return function(event) {
          editorFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.fontFamily', (function(_this) {
        return function(event) {
          overrideFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      editorFontSize = atom.config.get('editor.fontSize');
      overrideFontSize = config.style.fontSize;
      this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
      this.subscriptions.add(atom.config.onDidChange('editor.fontSize', (function(_this) {
        return function(event) {
          editorFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.fontSize', (function(_this) {
        return function(event) {
          overrideFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      [].splice.apply(this.terminal.colors, [0, 8].concat(ref2 = [config.ansiColors.normal.black.toHexString(), config.ansiColors.normal.red.toHexString(), config.ansiColors.normal.green.toHexString(), config.ansiColors.normal.yellow.toHexString(), config.ansiColors.normal.blue.toHexString(), config.ansiColors.normal.magenta.toHexString(), config.ansiColors.normal.cyan.toHexString(), config.ansiColors.normal.white.toHexString()])), ref2;
      return ([].splice.apply(this.terminal.colors, [8, 8].concat(ref3 = [config.ansiColors.zBright.brightBlack.toHexString(), config.ansiColors.zBright.brightRed.toHexString(), config.ansiColors.zBright.brightGreen.toHexString(), config.ansiColors.zBright.brightYellow.toHexString(), config.ansiColors.zBright.brightBlue.toHexString(), config.ansiColors.zBright.brightMagenta.toHexString(), config.ansiColors.zBright.brightCyan.toHexString(), config.ansiColors.zBright.brightWhite.toHexString()])), ref3);
    };

    PlatformIOTerminalView.prototype.attachWindowEvents = function() {
      return $(window).on('resize', this.onWindowResize);
    };

    PlatformIOTerminalView.prototype.detachWindowEvents = function() {
      return $(window).off('resize', this.onWindowResize);
    };

    PlatformIOTerminalView.prototype.attachResizeEvents = function() {
      return this.panelDivider.on('mousedown', this.resizeStarted);
    };

    PlatformIOTerminalView.prototype.detachResizeEvents = function() {
      return this.panelDivider.off('mousedown');
    };

    PlatformIOTerminalView.prototype.onWindowResize = function() {
      var bottomPanel, clamped, delta, newHeight, overflow;
      if (!this.tabView) {
        this.xterm.css('transition', '');
        newHeight = $(window).height();
        bottomPanel = $('atom-panel-container.bottom').first().get(0);
        overflow = bottomPanel.scrollHeight - bottomPanel.offsetHeight;
        delta = newHeight - this.windowHeight;
        this.windowHeight = newHeight;
        if (this.maximized) {
          clamped = Math.max(this.maxHeight + delta, this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.maxHeight = clamped;
          this.prevHeight = Math.min(this.prevHeight, this.maxHeight);
        } else if (overflow > 0) {
          clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.prevHeight = clamped;
        }
        this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
      }
      return this.resizeTerminalToView();
    };

    PlatformIOTerminalView.prototype.resizeStarted = function() {
      if (this.maximized) {
        return;
      }
      this.maxHeight = this.prevHeight + $('.item-views').height();
      $(document).on('mousemove', this.resizePanel);
      $(document).on('mouseup', this.resizeStopped);
      return this.xterm.css('transition', '');
    };

    PlatformIOTerminalView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizePanel);
      $(document).off('mouseup', this.resizeStopped);
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    PlatformIOTerminalView.prototype.nearestRow = function(value) {
      var rows;
      rows = Math.floor(value / this.rowHeight);
      return rows * this.rowHeight;
    };

    PlatformIOTerminalView.prototype.resizePanel = function(event) {
      var clamped, delta, mouseY;
      if (event.which !== 1) {
        return this.resizeStopped();
      }
      mouseY = $(window).height() - event.pageY;
      delta = mouseY - $('atom-panel-container.bottom').height() - $('atom-panel-container.footer').height();
      if (!(Math.abs(delta) > (this.rowHeight * 5 / 6))) {
        return;
      }
      clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
      if (clamped > this.maxHeight) {
        return;
      }
      this.xterm.height(clamped);
      $(this.terminal.element).height(clamped);
      this.prevHeight = clamped;
      return this.resizeTerminalToView();
    };

    PlatformIOTerminalView.prototype.adjustHeight = function(height) {
      this.xterm.height(height);
      return $(this.terminal.element).height(height);
    };

    PlatformIOTerminalView.prototype.copy = function() {
      var lines, rawLines, rawText, text, textarea;
      if (this.terminal._selected) {
        textarea = this.terminal.getCopyTextarea();
        text = this.terminal.grabText(this.terminal._selected.x1, this.terminal._selected.x2, this.terminal._selected.y1, this.terminal._selected.y2);
      } else {
        rawText = this.terminal.context.getSelection().toString();
        rawLines = rawText.split(/\r?\n/g);
        lines = rawLines.map(function(line) {
          return line.replace(/\s/g, " ").trimRight();
        });
        text = lines.join("\n");
      }
      return atom.clipboard.write(text);
    };

    PlatformIOTerminalView.prototype.paste = function() {
      return this.input(atom.clipboard.read());
    };

    PlatformIOTerminalView.prototype.insertSelection = function(customText) {
      var cursor, editor, line, runCommand, selection, selectionText;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      runCommand = atom.config.get('platformio-ide-terminal.toggles.runInsertedText');
      selectionText = '';
      if (selection = editor.getSelectedText()) {
        this.terminal.stopScrolling();
        selectionText = selection;
      } else if (cursor = editor.getCursorBufferPosition()) {
        line = editor.lineTextForBufferRow(cursor.row);
        this.terminal.stopScrolling();
        selectionText = line;
        editor.moveDown(1);
      }
      return this.input("" + (customText.replace(/\$L/, "" + (editor.getCursorBufferPosition().row + 1)).replace(/\$F/, path.basename(editor.buffer.getPath() ? editor.buffer.getPath() : '.')).replace(/\$D/, path.dirname(editor.buffer.getPath() ? editor.buffer.getPath() : '.')).replace(/\$S/, selectionText).replace(/\$\$/, '$')) + (runCommand ? os.EOL : ''));
    };

    PlatformIOTerminalView.prototype.focus = function(fromWindowEvent) {
      this.resizeTerminalToView();
      this.focusTerminal(fromWindowEvent);
      this.statusBar.setActiveTerminalView(this);
      return PlatformIOTerminalView.__super__.focus.call(this);
    };

    PlatformIOTerminalView.prototype.blur = function() {
      this.blurTerminal();
      return PlatformIOTerminalView.__super__.blur.call(this);
    };

    PlatformIOTerminalView.prototype.focusTerminal = function(fromWindowEvent) {
      if (!this.terminal) {
        return;
      }
      lastActiveElement = $(document.activeElement);
      if (fromWindowEvent && !(lastActiveElement.is('div.terminal') || lastActiveElement.parents('div.terminal').length)) {
        return;
      }
      this.terminal.focus();
      if (this.terminal._textarea) {
        return this.terminal._textarea.focus();
      } else {
        return this.terminal.element.focus();
      }
    };

    PlatformIOTerminalView.prototype.blurTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.blur();
      this.terminal.element.blur();
      if (lastActiveElement != null) {
        return lastActiveElement.focus();
      }
    };

    PlatformIOTerminalView.prototype.resizeTerminalToView = function() {
      var cols, ref2, rows;
      if (!(this.panel.isVisible() || this.tabView)) {
        return;
      }
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      if (!(cols > 0 && rows > 0)) {
        return;
      }
      if (!this.terminal) {
        return;
      }
      if (this.terminal.rows === rows && this.terminal.cols === cols) {
        return;
      }
      this.resize(cols, rows);
      return this.terminal.resize(cols, rows);
    };

    PlatformIOTerminalView.prototype.getDimensions = function() {
      var cols, fakeCol, fakeRow, rows;
      fakeRow = $("<div><span>&nbsp;</span></div>");
      if (this.terminal) {
        this.find('.terminal').append(fakeRow);
        fakeCol = fakeRow.children().first()[0].getBoundingClientRect();
        cols = Math.floor(this.xterm.width() / (fakeCol.width || 9));
        rows = Math.floor(this.xterm.height() / (fakeCol.height || 20));
        this.rowHeight = fakeCol.height;
        fakeRow.remove();
      } else {
        cols = Math.floor(this.xterm.width() / 9);
        rows = Math.floor(this.xterm.height() / 20);
      }
      return {
        cols: cols,
        rows: rows
      };
    };

    PlatformIOTerminalView.prototype.onTransitionEnd = function(callback) {
      return this.xterm.one('webkitTransitionEnd', (function(_this) {
        return function() {
          callback();
          return _this.animating = false;
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.inputDialog = function() {
      var dialog;
      if (InputDialog == null) {
        InputDialog = require('./input-dialog');
      }
      dialog = new InputDialog(this);
      return dialog.attach();
    };

    PlatformIOTerminalView.prototype.rename = function() {
      return this.statusIcon.rename();
    };

    PlatformIOTerminalView.prototype.toggleTabView = function() {
      if (this.tabView) {
        this.panel = atom.workspace.addBottomPanel({
          item: this,
          visible: false
        });
        this.attachResizeEvents();
        this.closeBtn.show();
        this.hideBtn.show();
        this.maximizeBtn.show();
        return this.tabView = false;
      } else {
        this.panel.destroy();
        this.detachResizeEvents();
        this.closeBtn.hide();
        this.hideBtn.hide();
        this.maximizeBtn.hide();
        this.xterm.css("height", "");
        this.tabView = true;
        if (lastOpenedView === this) {
          return lastOpenedView = null;
        }
      }
    };

    PlatformIOTerminalView.prototype.getTitle = function() {
      return this.statusIcon.getName() || "platformio-ide-terminal";
    };

    PlatformIOTerminalView.prototype.getIconName = function() {
      return "terminal";
    };

    PlatformIOTerminalView.prototype.getShell = function() {
      return path.basename(this.shell);
    };

    PlatformIOTerminalView.prototype.getShellPath = function() {
      return this.shell;
    };

    PlatformIOTerminalView.prototype.emit = function(event, data) {
      return this.emitter.emit(event, data);
    };

    PlatformIOTerminalView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    PlatformIOTerminalView.prototype.getPath = function() {
      return this.getTerminalTitle();
    };

    PlatformIOTerminalView.prototype.getTerminalTitle = function() {
      return this.title || this.process;
    };

    PlatformIOTerminalView.prototype.getTerminal = function() {
      return this.terminal;
    };

    PlatformIOTerminalView.prototype.isAnimating = function() {
      return this.animating;
    };

    return PlatformIOTerminalView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9wbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC9saWIvdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVKQUFBO0lBQUE7Ozs7RUFBQSxNQUF1QyxPQUFBLENBQVEsTUFBUixDQUF2QyxFQUFDLGVBQUQsRUFBTyw2Q0FBUCxFQUE0Qjs7RUFDNUIsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFVBQUQsRUFBSTs7RUFFSixHQUFBLEdBQU0sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsV0FBaEI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxTQUFSOztFQUNYLFdBQUEsR0FBYzs7RUFFZCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVMLGNBQUEsR0FBaUI7O0VBQ2pCLGlCQUFBLEdBQW9COztFQUVwQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FDQUNKLFNBQUEsR0FBVzs7cUNBQ1gsRUFBQSxHQUFJOztxQ0FDSixTQUFBLEdBQVc7O3FDQUNYLE1BQUEsR0FBUTs7cUNBQ1IsR0FBQSxHQUFLOztxQ0FDTCxZQUFBLEdBQWMsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBQTs7cUNBQ2QsU0FBQSxHQUFXOztxQ0FDWCxLQUFBLEdBQU87O3FDQUNQLE9BQUEsR0FBUzs7SUFFVCxzQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sdUNBQVA7UUFBZ0QsTUFBQSxFQUFRLHdCQUF4RDtPQUFMLEVBQXVGLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNyRixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO1lBQXdCLE1BQUEsRUFBUSxjQUFoQztXQUFMO1VBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sYUFBUDtXQUFULEVBQStCLFNBQUE7bUJBQzdCLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGFBQVA7YUFBTCxFQUEyQixTQUFBO2NBQ3pCLEtBQUMsQ0FBQSxHQUFELENBQUs7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxXQUFQO2VBQUwsRUFBeUIsU0FBQTt1QkFDdkIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtrQkFBQSxNQUFBLEVBQVEsVUFBUjtrQkFBb0IsQ0FBQSxLQUFBLENBQUEsRUFBTyx3QkFBM0I7a0JBQXFELEtBQUEsRUFBTyxhQUE1RDtpQkFBUjtjQUR1QixDQUF6QjtxQkFFQSxLQUFDLENBQUEsR0FBRCxDQUFLO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8saUJBQVA7ZUFBTCxFQUErQixTQUFBO2dCQUM3QixLQUFDLENBQUEsTUFBRCxDQUFRO2tCQUFBLE1BQUEsRUFBUSxTQUFSO2tCQUFtQixDQUFBLEtBQUEsQ0FBQSxFQUFPLDRCQUExQjtrQkFBd0QsS0FBQSxFQUFPLE1BQS9EO2lCQUFSO2dCQUNBLEtBQUMsQ0FBQSxNQUFELENBQVE7a0JBQUEsTUFBQSxFQUFRLGFBQVI7a0JBQXVCLENBQUEsS0FBQSxDQUFBLEVBQU8sMkJBQTlCO2tCQUEyRCxLQUFBLEVBQU8sVUFBbEU7aUJBQVI7dUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtrQkFBQSxNQUFBLEVBQVEsVUFBUjtrQkFBb0IsQ0FBQSxLQUFBLENBQUEsRUFBTyxpQkFBM0I7a0JBQThDLEtBQUEsRUFBTyxTQUFyRDtpQkFBUjtjQUg2QixDQUEvQjtZQUh5QixDQUEzQjtVQUQ2QixDQUEvQjtpQkFRQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxPQUFQO1lBQWdCLE1BQUEsRUFBUSxPQUF4QjtXQUFMO1FBVnFGO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2RjtJQURROztJQWFWLHNCQUFDLENBQUEsa0JBQUQsR0FBcUIsU0FBQTtBQUNuQixhQUFPLFFBQVEsQ0FBQyxRQUFRLENBQUM7SUFETjs7cUNBR3JCLFVBQUEsR0FBWSxTQUFDLEVBQUQsRUFBTSxHQUFOLEVBQVksVUFBWixFQUF5QixTQUF6QixFQUFxQyxLQUFyQyxFQUE2QyxJQUE3QyxFQUF1RCxHQUF2RCxFQUFnRSxPQUFoRTtBQUNWLFVBQUE7TUFEVyxJQUFDLENBQUEsS0FBRDtNQUFLLElBQUMsQ0FBQSxNQUFEO01BQU0sSUFBQyxDQUFBLGFBQUQ7TUFBYSxJQUFDLENBQUEsWUFBRDtNQUFZLElBQUMsQ0FBQSxRQUFEO01BQVEsSUFBQyxDQUFBLHNCQUFELE9BQU07TUFBSSxJQUFDLENBQUEsb0JBQUQsTUFBSztNQUFJLElBQUMsQ0FBQSw0QkFBRCxVQUFTO01BQ25GLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsUUFBbkIsRUFDakI7UUFBQSxLQUFBLEVBQU8sT0FBUDtPQURpQixDQUFuQjtNQUVBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLE9BQW5CLEVBQ2pCO1FBQUEsS0FBQSxFQUFPLE1BQVA7T0FEaUIsQ0FBbkI7TUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLEdBQXVCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsV0FBbkIsRUFDeEM7UUFBQSxLQUFBLEVBQU8sWUFBUDtPQUR3QyxDQUExQztNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFFBQW5CLEVBQ2xCO1FBQUEsS0FBQSxFQUFPLGFBQVA7T0FEa0I7TUFHcEIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0RBQWhCO01BQ2QsSUFBRyxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBb0IsR0FBcEIsQ0FBQSxHQUEyQixDQUE5QjtRQUNFLE9BQUEsR0FBVSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsVUFBQSxDQUFXLElBQUMsQ0FBQSxVQUFaLENBQUEsR0FBMEIsS0FBbkMsRUFBMEMsQ0FBMUMsQ0FBVDtRQUNWLFlBQUEsR0FBZSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxRQUF2QixDQUFnQyxnQkFBaEMsQ0FBaUQsQ0FBQyxNQUFsRCxDQUFBLENBQUEsSUFBOEQ7UUFDN0UsSUFBQyxDQUFBLFVBQUQsR0FBYyxPQUFBLEdBQVUsQ0FBQyxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLE1BQWpCLENBQUEsQ0FBQSxHQUE0QixZQUE3QixFQUgxQjs7TUFJQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxDQUFkO01BRUEsSUFBQyxDQUFBLGlCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLDhDQUF4QixFQUF3RSxJQUFDLENBQUEsaUJBQXpFLENBQW5CO01BRUEsUUFBQSxHQUFXLFNBQUMsS0FBRDtRQUNULElBQVUsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBakMsQ0FBeUMseUJBQXpDLENBQUEsS0FBdUUsTUFBakY7QUFBQSxpQkFBQTs7UUFDQSxLQUFLLENBQUMsY0FBTixDQUFBO2VBQ0EsS0FBSyxDQUFDLGVBQU4sQ0FBQTtNQUhTO01BS1gsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsU0FBVixFQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNuQixjQUFBO1VBQUEsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLENBQWxCO1lBQ0UsSUFBQSxHQUFPLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBcUIsQ0FBQyxRQUF0QixDQUFBO1lBQ1AsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsOENBQWhCLENBQUEsSUFBb0UsSUFBdkU7Y0FDRSxRQUFBLEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYO2NBQ1gsS0FBQSxHQUFRLFFBQVEsQ0FBQyxHQUFULENBQWEsU0FBQyxJQUFEO3VCQUNuQixJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsR0FBcEIsQ0FBd0IsQ0FBQyxTQUF6QixDQUFBO2NBRG1CLENBQWI7Y0FFUixJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYO2NBQ1AsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFmLENBQXFCLElBQXJCLEVBTEY7O1lBTUEsSUFBQSxDQUFPLElBQVA7cUJBQ0UsS0FBQyxDQUFBLEtBQUQsQ0FBQSxFQURGO2FBUkY7O1FBRG1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtNQVdBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLFdBQVYsRUFBdUIsUUFBdkI7TUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQVAsQ0FBVSxVQUFWLEVBQXNCLFFBQXRCO01BQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixJQUFDLENBQUEsaUJBQW5CO01BRUEsSUFBQyxDQUFBLEVBQUQsQ0FBSSxPQUFKLEVBQWEsSUFBQyxDQUFBLEtBQWQ7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUI7UUFBQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDMUIsS0FBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQWMsS0FBQyxDQUFBLEtBQWY7VUFEMEI7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7T0FBbkI7TUFHQSxJQUFHLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQUMsQ0FBQSxLQUFqQixDQUFBLElBQTRCLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFjLFNBQWQsQ0FBQSxLQUE0QixDQUFDLENBQXpELElBQStELEdBQUcsQ0FBQyxRQUFKLEtBQWtCLE9BQWpGLElBQTZGLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0Q0FBaEIsQ0FBaEc7ZUFDRSxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBYyxTQUFkLEVBREY7O0lBL0NVOztxQ0FrRFosTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFVLGtCQUFWO0FBQUEsZUFBQTs7YUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBZixDQUE4QjtRQUFBLElBQUEsRUFBTSxJQUFOO1FBQVksT0FBQSxFQUFTLEtBQXJCO09BQTlCO0lBRkg7O3FDQUlSLGlCQUFBLEdBQW1CLFNBQUE7TUFDakIsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhDQUFoQjtNQUNsQixJQUF5QixJQUFDLENBQUEsY0FBRCxLQUFtQixDQUE1QztRQUFBLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQWxCOzthQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsRUFBeUIsU0FBQSxHQUFTLENBQUMsSUFBQSxHQUFPLElBQUMsQ0FBQSxjQUFULENBQVQsR0FBaUMsVUFBMUQ7SUFKaUI7O3FDQU1uQixpQkFBQSxHQUFtQixTQUFDLEtBQUQ7QUFDakIsVUFBQTtNQUFBLEtBQUssQ0FBQyxjQUFOLENBQUE7TUFDQSxLQUFLLENBQUMsZUFBTixDQUFBO01BQ0MsZUFBZ0IsS0FBSyxDQUFDO01BRXZCLElBQUcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsWUFBckIsQ0FBQSxLQUFzQyxNQUF6QztRQUNFLFFBQUEsR0FBVyxZQUFZLENBQUMsT0FBYixDQUFxQixZQUFyQjtRQUNYLElBQXlCLFFBQXpCO2lCQUFBLElBQUMsQ0FBQSxLQUFELENBQVUsUUFBRCxHQUFVLEdBQW5CLEVBQUE7U0FGRjtPQUFBLE1BR0ssSUFBRyxRQUFBLEdBQVcsWUFBWSxDQUFDLE9BQWIsQ0FBcUIsYUFBckIsQ0FBZDtlQUNILElBQUMsQ0FBQSxLQUFELENBQVUsUUFBRCxHQUFVLEdBQW5CLEVBREc7T0FBQSxNQUVBLElBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxNQUFuQixHQUE0QixDQUEvQjtBQUNIO0FBQUE7YUFBQSxzQ0FBQTs7dUJBQ0UsSUFBQyxDQUFBLEtBQUQsQ0FBVSxJQUFJLENBQUMsSUFBTixHQUFXLEdBQXBCO0FBREY7dUJBREc7O0lBVlk7O3FDQWNuQixjQUFBLEdBQWdCLFNBQUE7YUFDZCxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsRUFBZSxJQUFJLENBQUMsT0FBTCxDQUFhLElBQUMsQ0FBQSxHQUFkLENBQWYsRUFBbUMsSUFBQyxDQUFBLEtBQXBDLEVBQTJDLElBQUMsQ0FBQSxJQUE1QyxFQUFrRCxJQUFDLENBQUEsR0FBbkQsRUFBd0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3RELEtBQUMsQ0FBQSxLQUFELEdBQVMsU0FBQSxHQUFBO2lCQUNULEtBQUMsQ0FBQSxNQUFELEdBQVUsU0FBQSxHQUFBO1FBRjRDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RDtJQURjOztxQ0FLaEIsS0FBQSxHQUFPLFNBQUE7QUFDTCxhQUFPLElBQUMsQ0FBQTtJQURIOztxQ0FHUCxlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsT0FBZSxJQUFDLENBQUEsYUFBRCxDQUFBLENBQWYsRUFBQyxnQkFBRCxFQUFPO01BQ1AsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsY0FBRCxDQUFBO01BRWQsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLFFBQUosQ0FBYTtRQUN2QixXQUFBLEVBQWtCLEtBREs7UUFFdkIsVUFBQSxFQUFrQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUNBQWhCLENBRks7UUFHdkIsTUFBQSxJQUh1QjtRQUdqQixNQUFBLElBSGlCO09BQWI7TUFNWixJQUFDLENBQUEsZUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLGtCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFlLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLENBQVgsQ0FBZjtJQWJlOztxQ0FlakIsZUFBQSxHQUFpQixTQUFBO01BQ2YsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUFaLENBQWUsOEJBQWYsRUFBK0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7aUJBQzdDLEtBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFnQixJQUFoQjtRQUQ2QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0M7TUFHQSxJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSw4QkFBZixFQUErQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDN0MsSUFBYyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMkNBQWhCLENBQWQ7bUJBQUEsS0FBQyxDQUFBLE9BQUQsQ0FBQSxFQUFBOztRQUQ2QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0M7TUFHQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsR0FBZ0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFFaEIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxFQUFWLENBQWEsTUFBYixFQUFxQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtpQkFDbkIsS0FBQyxDQUFBLEtBQUQsQ0FBTyxJQUFQO1FBRG1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtNQUdBLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLCtCQUFmLEVBQWdELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO2lCQUM5QyxLQUFDLENBQUEsT0FBRCxHQUFXO1FBRG1DO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoRDtNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsRUFBVixDQUFhLE9BQWIsRUFBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7aUJBQ3BCLEtBQUMsQ0FBQSxLQUFELEdBQVM7UUFEVztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7YUFHQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxNQUFmLEVBQXVCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNyQixjQUFBO1VBQUEsS0FBQyxDQUFBLFVBQUQsQ0FBQTtVQUNBLEtBQUMsQ0FBQSxvQkFBRCxDQUFBO1VBRUEsSUFBYyxxQ0FBZDtBQUFBLG1CQUFBOztVQUNBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZDQUFoQjtVQUNqQixJQUF1QyxjQUF2QztZQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8sRUFBQSxHQUFHLGNBQUgsR0FBb0IsRUFBRSxDQUFDLEdBQTlCLEVBQUE7O0FBQ0E7QUFBQTtlQUFBLHNDQUFBOzt5QkFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLEVBQUEsR0FBRyxPQUFILEdBQWEsRUFBRSxDQUFDLEdBQXZCO0FBQUE7O1FBUHFCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QjtJQWpCZTs7cUNBMEJqQixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtNQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBO01BQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxrQkFBWCxDQUE4QixJQUE5QjtNQUNBLElBQUMsQ0FBQSxrQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLGtCQUFELENBQUE7TUFFQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQUg7UUFDRSxJQUFDLENBQUEsSUFBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixFQUZGO09BQUEsTUFBQTtRQUlFLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBLEVBSkY7O01BTUEsSUFBRyxJQUFDLENBQUEsVUFBRCxJQUFnQixJQUFDLENBQUEsVUFBVSxDQUFDLFVBQS9CO1FBQ0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFVLENBQUMsV0FBdkIsQ0FBbUMsSUFBQyxDQUFBLFVBQXBDLEVBREY7OztZQUdXLENBQUUsU0FBYixDQUFBOztrREFDUyxDQUFFLE9BQVgsQ0FBQTtJQWpCTzs7cUNBbUJULFFBQUEsR0FBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLE9BQW5DO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBckIsQ0FBQTtNQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQWYsQ0FBQSxDQUEwQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7TUFDNUUsR0FBQSxHQUFNLElBQUMsQ0FBQSxXQUFXLENBQUMsUUFBYixDQUFzQixNQUF0QjtNQUNOLElBQUMsQ0FBQSxlQUFELENBQWlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsS0FBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO01BRUEsSUFBRyxJQUFDLENBQUEsU0FBSjtRQUNFLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixHQUF1QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFdBQW5CLEVBQ3JCO1VBQUEsS0FBQSxFQUFPLFlBQVA7U0FEcUI7UUFFdkIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBaEM7UUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxVQUFmO1FBQ0EsR0FBRyxDQUFDLFdBQUosQ0FBZ0Isb0JBQWhCLENBQXFDLENBQUMsUUFBdEMsQ0FBK0Msa0JBQS9DO2VBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxNQU5mO09BQUEsTUFBQTtRQVFFLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixHQUF1QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFdBQW5CLEVBQ3JCO1VBQUEsS0FBQSxFQUFPLFFBQVA7U0FEcUI7UUFFdkIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBaEM7UUFDQSxJQUFDLENBQUEsWUFBRCxDQUFjLElBQUMsQ0FBQSxTQUFmO1FBQ0EsR0FBRyxDQUFDLFdBQUosQ0FBZ0Isa0JBQWhCLENBQW1DLENBQUMsUUFBcEMsQ0FBNkMsb0JBQTdDO2VBQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxLQWJmOztJQVJROztxQ0F1QlYsSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBOztRQUFBLG9CQUFxQixDQUFBLENBQUUsUUFBUSxDQUFDLGFBQVg7O01BRXJCLElBQUcsY0FBQSxJQUFtQixjQUFBLEtBQWtCLElBQXhDO1FBQ0UsSUFBRyxjQUFjLENBQUMsU0FBbEI7VUFDRSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFuQztVQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQXJCLENBQUE7VUFDQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFdBQVcsQ0FBQyxRQUFiLENBQXNCLE1BQXRCO1VBRVAsSUFBQyxDQUFBLFNBQUQsR0FBYSxjQUFjLENBQUM7VUFDNUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLEdBQXVCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsV0FBbkIsRUFDckI7WUFBQSxLQUFBLEVBQU8sUUFBUDtXQURxQjtVQUV2QixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFoQztVQUNBLElBQUksQ0FBQyxXQUFMLENBQWlCLGtCQUFqQixDQUFvQyxDQUFDLFFBQXJDLENBQThDLG9CQUE5QztVQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsS0FWZjs7UUFXQSxjQUFjLENBQUMsSUFBZixDQUFBLEVBWkY7O01BY0EsY0FBQSxHQUFpQjtNQUNqQixJQUFDLENBQUEsU0FBUyxDQUFDLHFCQUFYLENBQWlDLElBQWpDO01BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQUE7TUFFQSxJQUFDLENBQUEsZUFBRCxDQUFpQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDZixJQUFHLENBQUksS0FBQyxDQUFBLE1BQVI7WUFDRSxLQUFDLENBQUEsTUFBRCxHQUFVO1lBQ1YsS0FBQyxDQUFBLGVBQUQsQ0FBQTtZQUNBLEtBQUMsQ0FBQSxVQUFELEdBQWMsS0FBQyxDQUFBLFVBQUQsQ0FBWSxLQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBQSxDQUFaO1lBQ2QsS0FBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsS0FBQyxDQUFBLFVBQWY7bUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSx1Q0FBTixFQUxGO1dBQUEsTUFBQTttQkFPRSxLQUFDLENBQUEsS0FBRCxDQUFBLEVBUEY7O1FBRGU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO01BVUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7TUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxDQUFkO01BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYTthQUNiLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFpQixJQUFDLENBQUEsU0FBSixHQUFtQixJQUFDLENBQUEsU0FBcEIsR0FBbUMsSUFBQyxDQUFBLFVBQWxEO0lBbENJOztxQ0FvQ04sSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBOztZQUFTLENBQUUsSUFBWCxDQUFBOztNQUNBLGNBQUEsR0FBaUI7TUFDakIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFaLENBQUE7TUFFQSxJQUFDLENBQUEsZUFBRCxDQUFpQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDZixLQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtVQUNBLElBQU8sc0JBQVA7WUFDRSxJQUFHLHlCQUFIO2NBQ0UsaUJBQWlCLENBQUMsS0FBbEIsQ0FBQTtxQkFDQSxpQkFBQSxHQUFvQixLQUZ0QjthQURGOztRQUZlO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQjtNQU9BLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFpQixJQUFDLENBQUEsU0FBSixHQUFtQixJQUFDLENBQUEsU0FBcEIsR0FBbUMsSUFBQyxDQUFBLFVBQWxEO01BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYTthQUNiLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFjLENBQWQ7SUFkSTs7cUNBZ0JOLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBVSxJQUFDLENBQUEsU0FBWDtBQUFBLGVBQUE7O01BRUEsSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBQSxDQUFIO2VBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxJQUFELENBQUEsRUFIRjs7SUFITTs7cUNBUVIsS0FBQSxHQUFPLFNBQUMsSUFBRDtNQUNMLElBQWMsb0NBQWQ7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsYUFBVixDQUFBO2FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCO1FBQUEsS0FBQSxFQUFPLE9BQVA7UUFBZ0IsSUFBQSxFQUFNLElBQXRCO09BQWpCO0lBSks7O3FDQU1QLE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxJQUFQO01BQ04sSUFBYyxvQ0FBZDtBQUFBLGVBQUE7O2FBRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCO1FBQUMsS0FBQSxFQUFPLFFBQVI7UUFBa0IsTUFBQSxJQUFsQjtRQUF3QixNQUFBLElBQXhCO09BQWpCO0lBSE07O3FDQUtSLEdBQUEsR0FBSyxTQUFBO0FBQ0gsVUFBQTtNQUFBLElBQUcsQ0FBSSxJQUFDLENBQUEsTUFBUjtRQUNFLElBQUEsR0FBTyxJQUFJLE9BQUosQ0FBWSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO1lBQ2pCLEtBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLHVDQUFaLEVBQXFELFNBQUE7cUJBQ25ELE9BQUEsQ0FBQTtZQURtRCxDQUFyRDttQkFFQSxVQUFBLENBQVcsTUFBWCxFQUFtQixJQUFuQjtVQUhpQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWjtlQUtQLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDUixLQUFDLENBQUEsVUFBRCxDQUFBO1VBRFE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVYsRUFORjtPQUFBLE1BQUE7ZUFTRSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBVEY7O0lBREc7O3FDQVlMLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBSSxPQUFKLENBQVksQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO1VBQ1YsSUFBRyx3QkFBSDtZQUNFLEtBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLDZCQUFmLEVBQThDLFNBQUMsR0FBRDtxQkFDNUMsT0FBQSxDQUFRLEdBQVI7WUFENEMsQ0FBOUM7WUFFQSxLQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUI7Y0FBQyxLQUFBLEVBQU8sS0FBUjthQUFqQjttQkFDQSxVQUFBLENBQVcsTUFBWCxFQUFtQixJQUFuQixFQUpGO1dBQUEsTUFBQTttQkFNRSxNQUFBLENBQUEsRUFORjs7UUFEVTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWjtJQURVOztxQ0FVWixVQUFBLEdBQVksU0FBQTtBQUNWLFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQjtNQUVULElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUCxDQUFnQixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQTdCO01BQ0EsSUFBa0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFqRDtRQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUCxDQUFnQixjQUFoQixFQUFBOztNQUVBLFVBQUEsR0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQWhCO01BQ2IsV0FBQSxHQUFjO01BQ2QsWUFBQSxHQUFlLE1BQU0sQ0FBQyxLQUFLLENBQUM7TUFDNUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQXhCLEdBQXFDLFlBQUEsSUFBZ0IsVUFBaEIsSUFBOEI7TUFFbkUsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixtQkFBeEIsRUFBNkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFDOUQsVUFBQSxHQUFhLEtBQUssQ0FBQztpQkFDbkIsS0FBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQXhCLEdBQXFDLFlBQUEsSUFBZ0IsVUFBaEIsSUFBOEI7UUFGTDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0MsQ0FBbkI7TUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLDBDQUF4QixFQUFvRSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtVQUNyRixZQUFBLEdBQWUsS0FBSyxDQUFDO2lCQUNyQixLQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBeEIsR0FBcUMsWUFBQSxJQUFnQixVQUFoQixJQUE4QjtRQUZrQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEUsQ0FBbkI7TUFJQSxjQUFBLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQkFBaEI7TUFDakIsZ0JBQUEsR0FBbUIsTUFBTSxDQUFDLEtBQUssQ0FBQztNQUNoQyxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBeEIsR0FBcUMsQ0FBQyxnQkFBQSxJQUFvQixjQUFyQixDQUFBLEdBQW9DO01BRXpFLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IsaUJBQXhCLEVBQTJDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO1VBQzVELGNBQUEsR0FBaUIsS0FBSyxDQUFDO1VBQ3ZCLEtBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUF4QixHQUFxQyxDQUFDLGdCQUFBLElBQW9CLGNBQXJCLENBQUEsR0FBb0M7aUJBQ3pFLEtBQUMsQ0FBQSxvQkFBRCxDQUFBO1FBSDREO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxDQUFuQjtNQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0Isd0NBQXhCLEVBQWtFLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO1VBQ25GLGdCQUFBLEdBQW1CLEtBQUssQ0FBQztVQUN6QixLQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBeEIsR0FBcUMsQ0FBQyxnQkFBQSxJQUFvQixjQUFyQixDQUFBLEdBQW9DO2lCQUN6RSxLQUFDLENBQUEsb0JBQUQsQ0FBQTtRQUhtRjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEUsQ0FBbkI7TUFNQSwyREFBeUIsQ0FDdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQS9CLENBQUEsQ0FEdUIsRUFFdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQTdCLENBQUEsQ0FGdUIsRUFHdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQS9CLENBQUEsQ0FIdUIsRUFJdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQWhDLENBQUEsQ0FKdUIsRUFLdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQTlCLENBQUEsQ0FMdUIsRUFNdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQWpDLENBQUEsQ0FOdUIsRUFPdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQTlCLENBQUEsQ0FQdUIsRUFRdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQS9CLENBQUEsQ0FSdUIsQ0FBekIsSUFBeUI7YUFXekIsQ0FBQSwyREFBMEIsQ0FDeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQXRDLENBQUEsQ0FEd0IsRUFFeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQXBDLENBQUEsQ0FGd0IsRUFHeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQXRDLENBQUEsQ0FId0IsRUFJeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFdBQXZDLENBQUEsQ0FKd0IsRUFLeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQXJDLENBQUEsQ0FMd0IsRUFNeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLFdBQXhDLENBQUEsQ0FOd0IsRUFPeEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQXJDLENBQUEsQ0FQd0IsRUFReEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFdBQXRDLENBQUEsQ0FSd0IsQ0FBMUIsSUFBMEIsSUFBMUI7SUEzQ1U7O3FDQXNEWixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxFQUFWLENBQWEsUUFBYixFQUF1QixJQUFDLENBQUEsY0FBeEI7SUFEa0I7O3FDQUdwQixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxHQUFWLENBQWMsUUFBZCxFQUF3QixJQUFDLENBQUEsY0FBekI7SUFEa0I7O3FDQUdwQixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLElBQUMsQ0FBQSxZQUFZLENBQUMsRUFBZCxDQUFpQixXQUFqQixFQUE4QixJQUFDLENBQUEsYUFBL0I7SUFEa0I7O3FDQUdwQixrQkFBQSxHQUFvQixTQUFBO2FBQ2xCLElBQUMsQ0FBQSxZQUFZLENBQUMsR0FBZCxDQUFrQixXQUFsQjtJQURrQjs7cUNBR3BCLGNBQUEsR0FBZ0IsU0FBQTtBQUNkLFVBQUE7TUFBQSxJQUFHLENBQUksSUFBQyxDQUFBLE9BQVI7UUFDRSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLEVBQXlCLEVBQXpCO1FBQ0EsU0FBQSxHQUFZLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxNQUFWLENBQUE7UUFDWixXQUFBLEdBQWMsQ0FBQSxDQUFFLDZCQUFGLENBQWdDLENBQUMsS0FBakMsQ0FBQSxDQUF3QyxDQUFDLEdBQXpDLENBQTZDLENBQTdDO1FBQ2QsUUFBQSxHQUFXLFdBQVcsQ0FBQyxZQUFaLEdBQTJCLFdBQVcsQ0FBQztRQUVsRCxLQUFBLEdBQVEsU0FBQSxHQUFZLElBQUMsQ0FBQTtRQUNyQixJQUFDLENBQUEsWUFBRCxHQUFnQjtRQUVoQixJQUFHLElBQUMsQ0FBQSxTQUFKO1VBQ0UsT0FBQSxHQUFVLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLFNBQUQsR0FBYSxLQUF0QixFQUE2QixJQUFDLENBQUEsU0FBOUI7VUFFVixJQUF5QixJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBQSxDQUF6QjtZQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsT0FBZCxFQUFBOztVQUNBLElBQUMsQ0FBQSxTQUFELEdBQWE7VUFFYixJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLFVBQVYsRUFBc0IsSUFBQyxDQUFBLFNBQXZCLEVBTmhCO1NBQUEsTUFPSyxJQUFHLFFBQUEsR0FBVyxDQUFkO1VBQ0gsT0FBQSxHQUFVLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBQTFCLENBQVQsRUFBMkMsSUFBQyxDQUFBLFNBQTVDO1VBRVYsSUFBeUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQUEsQ0FBekI7WUFBQSxJQUFDLENBQUEsWUFBRCxDQUFjLE9BQWQsRUFBQTs7VUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLFFBSlg7O1FBTUwsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxFQUF5QixTQUFBLEdBQVMsQ0FBQyxJQUFBLEdBQU8sSUFBQyxDQUFBLGNBQVQsQ0FBVCxHQUFpQyxVQUExRCxFQXRCRjs7YUF1QkEsSUFBQyxDQUFBLG9CQUFELENBQUE7SUF4QmM7O3FDQTBCaEIsYUFBQSxHQUFlLFNBQUE7TUFDYixJQUFVLElBQUMsQ0FBQSxTQUFYO0FBQUEsZUFBQTs7TUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxNQUFqQixDQUFBO01BQzNCLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxFQUFaLENBQWUsV0FBZixFQUE0QixJQUFDLENBQUEsV0FBN0I7TUFDQSxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLFNBQWYsRUFBMEIsSUFBQyxDQUFBLGFBQTNCO2FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsWUFBWCxFQUF5QixFQUF6QjtJQUxhOztxQ0FPZixhQUFBLEdBQWUsU0FBQTtNQUNiLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxHQUFaLENBQWdCLFdBQWhCLEVBQTZCLElBQUMsQ0FBQSxXQUE5QjtNQUNBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxHQUFaLENBQWdCLFNBQWhCLEVBQTJCLElBQUMsQ0FBQSxhQUE1QjthQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsRUFBeUIsU0FBQSxHQUFTLENBQUMsSUFBQSxHQUFPLElBQUMsQ0FBQSxjQUFULENBQVQsR0FBaUMsVUFBMUQ7SUFIYTs7cUNBS2YsVUFBQSxHQUFZLFNBQUMsS0FBRDtBQUNWLFVBQUE7TUFBQSxJQUFBLGNBQU8sUUFBUyxJQUFDLENBQUE7QUFDakIsYUFBTyxJQUFBLEdBQU8sSUFBQyxDQUFBO0lBRkw7O3FDQUlaLFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFDWCxVQUFBO01BQUEsSUFBK0IsS0FBSyxDQUFDLEtBQU4sS0FBZSxDQUE5QztBQUFBLGVBQU8sSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQUFQOztNQUVBLE1BQUEsR0FBUyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBLENBQUEsR0FBcUIsS0FBSyxDQUFDO01BQ3BDLEtBQUEsR0FBUSxNQUFBLEdBQVMsQ0FBQSxDQUFFLDZCQUFGLENBQWdDLENBQUMsTUFBakMsQ0FBQSxDQUFULEdBQXFELENBQUEsQ0FBRSw2QkFBRixDQUFnQyxDQUFDLE1BQWpDLENBQUE7TUFDN0QsSUFBQSxDQUFBLENBQWMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxLQUFULENBQUEsR0FBa0IsQ0FBQyxJQUFDLENBQUEsU0FBRCxHQUFhLENBQWIsR0FBaUIsQ0FBbEIsQ0FBaEMsQ0FBQTtBQUFBLGVBQUE7O01BRUEsT0FBQSxHQUFVLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBQTFCLENBQVQsRUFBMkMsSUFBQyxDQUFBLFNBQTVDO01BQ1YsSUFBVSxPQUFBLEdBQVUsSUFBQyxDQUFBLFNBQXJCO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsQ0FBYyxPQUFkO01BQ0EsQ0FBQSxDQUFFLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBWixDQUFvQixDQUFDLE1BQXJCLENBQTRCLE9BQTVCO01BQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYzthQUVkLElBQUMsQ0FBQSxvQkFBRCxDQUFBO0lBZFc7O3FDQWdCYixZQUFBLEdBQWMsU0FBQyxNQUFEO01BQ1osSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsTUFBZDthQUNBLENBQUEsQ0FBRSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVosQ0FBb0IsQ0FBQyxNQUFyQixDQUE0QixNQUE1QjtJQUZZOztxQ0FJZCxJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBYjtRQUNFLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBUSxDQUFDLGVBQVYsQ0FBQTtRQUNYLElBQUEsR0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLFFBQVYsQ0FDTCxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQURmLEVBQ21CLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBUyxDQUFDLEVBRHZDLEVBRUwsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFGZixFQUVtQixJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUZ2QyxFQUZUO09BQUEsTUFBQTtRQU1FLE9BQUEsR0FBVSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxZQUFsQixDQUFBLENBQWdDLENBQUMsUUFBakMsQ0FBQTtRQUNWLFFBQUEsR0FBVyxPQUFPLENBQUMsS0FBUixDQUFjLFFBQWQ7UUFDWCxLQUFBLEdBQVEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxTQUFDLElBQUQ7aUJBQ25CLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFvQixHQUFwQixDQUF3QixDQUFDLFNBQXpCLENBQUE7UUFEbUIsQ0FBYjtRQUVSLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsRUFWVDs7YUFXQSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQWYsQ0FBcUIsSUFBckI7SUFaSTs7cUNBY04sS0FBQSxHQUFPLFNBQUE7YUFDTCxJQUFDLENBQUEsS0FBRCxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLENBQVA7SUFESzs7cUNBR1AsZUFBQSxHQUFpQixTQUFDLFVBQUQ7QUFDZixVQUFBO01BQUEsSUFBQSxDQUFjLENBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQWQ7QUFBQSxlQUFBOztNQUNBLFVBQUEsR0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaURBQWhCO01BQ2IsYUFBQSxHQUFnQjtNQUNoQixJQUFHLFNBQUEsR0FBWSxNQUFNLENBQUMsZUFBUCxDQUFBLENBQWY7UUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLGFBQVYsQ0FBQTtRQUNBLGFBQUEsR0FBZ0IsVUFGbEI7T0FBQSxNQUdLLElBQUcsTUFBQSxHQUFTLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQVo7UUFDSCxJQUFBLEdBQU8sTUFBTSxDQUFDLG9CQUFQLENBQTRCLE1BQU0sQ0FBQyxHQUFuQztRQUNQLElBQUMsQ0FBQSxRQUFRLENBQUMsYUFBVixDQUFBO1FBQ0EsYUFBQSxHQUFnQjtRQUNoQixNQUFNLENBQUMsUUFBUCxDQUFnQixDQUFoQixFQUpHOzthQUtMLElBQUMsQ0FBQSxLQUFELENBQU8sRUFBQSxHQUFFLENBQUMsVUFBVSxDQUNsQixPQURRLENBQ0EsS0FEQSxFQUNPLEVBQUEsR0FBRSxDQUFDLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQWdDLENBQUMsR0FBakMsR0FBdUMsQ0FBeEMsQ0FEVCxDQUNxRCxDQUM3RCxPQUZRLENBRUEsS0FGQSxFQUVPLElBQUksQ0FBQyxRQUFMLENBQWlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBZCxDQUFBLENBQUgsR0FBZ0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFkLENBQUEsQ0FBaEMsR0FBNkQsR0FBM0UsQ0FGUCxDQUV1RixDQUMvRixPQUhRLENBR0EsS0FIQSxFQUdPLElBQUksQ0FBQyxPQUFMLENBQWdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBZCxDQUFBLENBQUgsR0FBZ0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFkLENBQUEsQ0FBaEMsR0FBNkQsR0FBMUUsQ0FIUCxDQUdzRixDQUM5RixPQUpRLENBSUEsS0FKQSxFQUlPLGFBSlAsQ0FJcUIsQ0FDN0IsT0FMUSxDQUtBLE1BTEEsRUFLUSxHQUxSLENBQUQsQ0FBRixHQUtpQixDQUFJLFVBQUgsR0FBbUIsRUFBRSxDQUFDLEdBQXRCLEdBQStCLEVBQWhDLENBTHhCO0lBWmU7O3FDQW1CakIsS0FBQSxHQUFPLFNBQUMsZUFBRDtNQUNMLElBQUMsQ0FBQSxvQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBZSxlQUFmO01BQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxxQkFBWCxDQUFpQyxJQUFqQzthQUNBLGdEQUFBO0lBSks7O3FDQU1QLElBQUEsR0FBTSxTQUFBO01BQ0osSUFBQyxDQUFBLFlBQUQsQ0FBQTthQUNBLCtDQUFBO0lBRkk7O3FDQUlOLGFBQUEsR0FBZSxTQUFDLGVBQUQ7TUFDYixJQUFBLENBQWMsSUFBQyxDQUFBLFFBQWY7QUFBQSxlQUFBOztNQUVBLGlCQUFBLEdBQW9CLENBQUEsQ0FBRSxRQUFRLENBQUMsYUFBWDtNQUNwQixJQUFVLGVBQUEsSUFBb0IsQ0FBSSxDQUFDLGlCQUFpQixDQUFDLEVBQWxCLENBQXFCLGNBQXJCLENBQUEsSUFBd0MsaUJBQWlCLENBQUMsT0FBbEIsQ0FBMEIsY0FBMUIsQ0FBeUMsQ0FBQyxNQUFuRixDQUFsQztBQUFBLGVBQUE7O01BRUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQUE7TUFDQSxJQUFHLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBYjtlQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQXBCLENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFsQixDQUFBLEVBSEY7O0lBUGE7O3FDQVlmLFlBQUEsR0FBYyxTQUFBO01BQ1osSUFBQSxDQUFjLElBQUMsQ0FBQSxRQUFmO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQWxCLENBQUE7TUFFQSxJQUFHLHlCQUFIO2VBQ0UsaUJBQWlCLENBQUMsS0FBbEIsQ0FBQSxFQURGOztJQU5ZOztxQ0FTZCxvQkFBQSxHQUFzQixTQUFBO0FBQ3BCLFVBQUE7TUFBQSxJQUFBLENBQUEsQ0FBYyxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBQSxDQUFBLElBQXNCLElBQUMsQ0FBQSxPQUFyQyxDQUFBO0FBQUEsZUFBQTs7TUFFQSxPQUFlLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBZixFQUFDLGdCQUFELEVBQU87TUFDUCxJQUFBLENBQUEsQ0FBYyxJQUFBLEdBQU8sQ0FBUCxJQUFhLElBQUEsR0FBTyxDQUFsQyxDQUFBO0FBQUEsZUFBQTs7TUFDQSxJQUFBLENBQWMsSUFBQyxDQUFBLFFBQWY7QUFBQSxlQUFBOztNQUNBLElBQVUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLEtBQWtCLElBQWxCLElBQTJCLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixLQUFrQixJQUF2RDtBQUFBLGVBQUE7O01BRUEsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFSLEVBQWMsSUFBZDthQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixJQUFqQixFQUF1QixJQUF2QjtJQVRvQjs7cUNBV3RCLGFBQUEsR0FBZSxTQUFBO0FBQ2IsVUFBQTtNQUFBLE9BQUEsR0FBVSxDQUFBLENBQUUsZ0NBQUY7TUFFVixJQUFHLElBQUMsQ0FBQSxRQUFKO1FBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxXQUFOLENBQWtCLENBQUMsTUFBbkIsQ0FBMEIsT0FBMUI7UUFDQSxPQUFBLEdBQVUsT0FBTyxDQUFDLFFBQVIsQ0FBQSxDQUFrQixDQUFDLEtBQW5CLENBQUEsQ0FBMkIsQ0FBQSxDQUFBLENBQUUsQ0FBQyxxQkFBOUIsQ0FBQTtRQUNWLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBLENBQUEsR0FBaUIsQ0FBQyxPQUFPLENBQUMsS0FBUixJQUFpQixDQUFsQixDQUE1QjtRQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxDQUFBLENBQUEsR0FBa0IsQ0FBQyxPQUFPLENBQUMsTUFBUixJQUFrQixFQUFuQixDQUE3QjtRQUNQLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDO1FBQ3JCLE9BQU8sQ0FBQyxNQUFSLENBQUEsRUFORjtPQUFBLE1BQUE7UUFRRSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQSxDQUFBLEdBQWlCLENBQTVCO1FBQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQUEsQ0FBQSxHQUFrQixFQUE3QixFQVRUOzthQVdBO1FBQUMsTUFBQSxJQUFEO1FBQU8sTUFBQSxJQUFQOztJQWRhOztxQ0FnQmYsZUFBQSxHQUFpQixTQUFDLFFBQUQ7YUFDZixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxxQkFBWCxFQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDaEMsUUFBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxTQUFELEdBQWE7UUFGbUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDO0lBRGU7O3FDQUtqQixXQUFBLEdBQWEsU0FBQTtBQUNYLFVBQUE7O1FBQUEsY0FBZSxPQUFBLENBQVEsZ0JBQVI7O01BQ2YsTUFBQSxHQUFTLElBQUksV0FBSixDQUFnQixJQUFoQjthQUNULE1BQU0sQ0FBQyxNQUFQLENBQUE7SUFIVzs7cUNBS2IsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBQTtJQURNOztxQ0FHUixhQUFBLEdBQWUsU0FBQTtNQUNiLElBQUcsSUFBQyxDQUFBLE9BQUo7UUFDRSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBZixDQUE4QjtVQUFBLElBQUEsRUFBTSxJQUFOO1VBQVksT0FBQSxFQUFTLEtBQXJCO1NBQTlCO1FBQ1QsSUFBQyxDQUFBLGtCQUFELENBQUE7UUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBQTtRQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBO1FBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQUE7ZUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLE1BTmI7T0FBQSxNQUFBO1FBUUUsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQUE7UUFDQSxJQUFDLENBQUEsa0JBQUQsQ0FBQTtRQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFBO1FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUE7UUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBQTtRQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFFBQVgsRUFBcUIsRUFBckI7UUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXO1FBQ1gsSUFBeUIsY0FBQSxLQUFrQixJQUEzQztpQkFBQSxjQUFBLEdBQWlCLEtBQWpCO1NBZkY7O0lBRGE7O3FDQWtCZixRQUFBLEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBLENBQUEsSUFBeUI7SUFEakI7O3FDQUdWLFdBQUEsR0FBYSxTQUFBO2FBQ1g7SUFEVzs7cUNBR2IsUUFBQSxHQUFVLFNBQUE7QUFDUixhQUFPLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBQyxDQUFBLEtBQWY7SUFEQzs7cUNBR1YsWUFBQSxHQUFjLFNBQUE7QUFDWixhQUFPLElBQUMsQ0FBQTtJQURJOztxQ0FHZCxJQUFBLEdBQU0sU0FBQyxLQUFELEVBQVEsSUFBUjthQUNKLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLEtBQWQsRUFBcUIsSUFBckI7SUFESTs7cUNBR04sZ0JBQUEsR0FBa0IsU0FBQyxRQUFEO2FBQ2hCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGtCQUFaLEVBQWdDLFFBQWhDO0lBRGdCOztxQ0FHbEIsT0FBQSxHQUFTLFNBQUE7QUFDUCxhQUFPLElBQUMsQ0FBQSxnQkFBRCxDQUFBO0lBREE7O3FDQUdULGdCQUFBLEdBQWtCLFNBQUE7QUFDaEIsYUFBTyxJQUFDLENBQUEsS0FBRCxJQUFVLElBQUMsQ0FBQTtJQURGOztxQ0FHbEIsV0FBQSxHQUFhLFNBQUE7QUFDWCxhQUFPLElBQUMsQ0FBQTtJQURHOztxQ0FHYixXQUFBLEdBQWEsU0FBQTtBQUNYLGFBQU8sSUFBQyxDQUFBO0lBREc7Ozs7S0FyakJzQjtBQWRyQyIsInNvdXJjZXNDb250ZW50IjpbIntUYXNrLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuUHR5ID0gcmVxdWlyZS5yZXNvbHZlICcuL3Byb2Nlc3MnXG5UZXJtaW5hbCA9IHJlcXVpcmUgJ3Rlcm0uanMnXG5JbnB1dERpYWxvZyA9IG51bGxcblxucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5vcyA9IHJlcXVpcmUgJ29zJ1xuXG5sYXN0T3BlbmVkVmlldyA9IG51bGxcbmxhc3RBY3RpdmVFbGVtZW50ID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBQbGF0Zm9ybUlPVGVybWluYWxWaWV3IGV4dGVuZHMgVmlld1xuICBhbmltYXRpbmc6IGZhbHNlXG4gIGlkOiAnJ1xuICBtYXhpbWl6ZWQ6IGZhbHNlXG4gIG9wZW5lZDogZmFsc2VcbiAgcHdkOiAnJ1xuICB3aW5kb3dIZWlnaHQ6ICQod2luZG93KS5oZWlnaHQoKVxuICByb3dIZWlnaHQ6IDIwXG4gIHNoZWxsOiAnJ1xuICB0YWJWaWV3OiBmYWxzZVxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbCB0ZXJtaW5hbC12aWV3Jywgb3V0bGV0OiAncGxhdGZvcm1JT1Rlcm1pbmFsVmlldycsID0+XG4gICAgICBAZGl2IGNsYXNzOiAncGFuZWwtZGl2aWRlcicsIG91dGxldDogJ3BhbmVsRGl2aWRlcidcbiAgICAgIEBzZWN0aW9uIGNsYXNzOiAnaW5wdXQtYmxvY2snLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnYnRuLXRvb2xiYXInLCA9PlxuICAgICAgICAgIEBkaXYgY2xhc3M6ICdidG4tZ3JvdXAnLCA9PlxuICAgICAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdpbnB1dEJ0bicsIGNsYXNzOiAnYnRuIGljb24gaWNvbi1rZXlib2FyZCcsIGNsaWNrOiAnaW5wdXREaWFsb2cnXG4gICAgICAgICAgQGRpdiBjbGFzczogJ2J0bi1ncm91cCByaWdodCcsID0+XG4gICAgICAgICAgICBAYnV0dG9uIG91dGxldDogJ2hpZGVCdG4nLCBjbGFzczogJ2J0biBpY29uIGljb24tY2hldnJvbi1kb3duJywgY2xpY2s6ICdoaWRlJ1xuICAgICAgICAgICAgQGJ1dHRvbiBvdXRsZXQ6ICdtYXhpbWl6ZUJ0bicsIGNsYXNzOiAnYnRuIGljb24gaWNvbi1zY3JlZW4tZnVsbCcsIGNsaWNrOiAnbWF4aW1pemUnXG4gICAgICAgICAgICBAYnV0dG9uIG91dGxldDogJ2Nsb3NlQnRuJywgY2xhc3M6ICdidG4gaWNvbiBpY29uLXgnLCBjbGljazogJ2Rlc3Ryb3knXG4gICAgICBAZGl2IGNsYXNzOiAneHRlcm0nLCBvdXRsZXQ6ICd4dGVybSdcblxuICBAZ2V0Rm9jdXNlZFRlcm1pbmFsOiAtPlxuICAgIHJldHVybiBUZXJtaW5hbC5UZXJtaW5hbC5mb2N1c1xuXG4gIGluaXRpYWxpemU6IChAaWQsIEBwd2QsIEBzdGF0dXNJY29uLCBAc3RhdHVzQmFyLCBAc2hlbGwsIEBhcmdzPVtdLCBAZW52PXt9LCBAYXV0b1J1bj1bXSkgLT5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBjbG9zZUJ0bixcbiAgICAgIHRpdGxlOiAnQ2xvc2UnXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBoaWRlQnRuLFxuICAgICAgdGl0bGU6ICdIaWRlJ1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgIHRpdGxlOiAnRnVsbHNjcmVlbidcbiAgICBAaW5wdXRCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBpbnB1dEJ0bixcbiAgICAgIHRpdGxlOiAnSW5zZXJ0IFRleHQnXG5cbiAgICBAcHJldkhlaWdodCA9IGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuZGVmYXVsdFBhbmVsSGVpZ2h0JylcbiAgICBpZiBAcHJldkhlaWdodC5pbmRleE9mKCclJykgPiAwXG4gICAgICBwZXJjZW50ID0gTWF0aC5hYnMoTWF0aC5taW4ocGFyc2VGbG9hdChAcHJldkhlaWdodCkgLyAxMDAuMCwgMSkpXG4gICAgICBib3R0b21IZWlnaHQgPSAkKCdhdG9tLXBhbmVsLmJvdHRvbScpLmNoaWxkcmVuKFwiLnRlcm1pbmFsLXZpZXdcIikuaGVpZ2h0KCkgb3IgMFxuICAgICAgQHByZXZIZWlnaHQgPSBwZXJjZW50ICogKCQoJy5pdGVtLXZpZXdzJykuaGVpZ2h0KCkgKyBib3R0b21IZWlnaHQpXG4gICAgQHh0ZXJtLmhlaWdodCAwXG5cbiAgICBAc2V0QW5pbWF0aW9uU3BlZWQoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuYW5pbWF0aW9uU3BlZWQnLCBAc2V0QW5pbWF0aW9uU3BlZWRcblxuICAgIG92ZXJyaWRlID0gKGV2ZW50KSAtPlxuICAgICAgcmV0dXJuIGlmIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsJykgaXMgJ3RydWUnXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXG4gICAgQHh0ZXJtLm9uICdtb3VzZXVwJywgKGV2ZW50KSA9PlxuICAgICAgaWYgZXZlbnQud2hpY2ggIT0gM1xuICAgICAgICB0ZXh0ID0gd2luZG93LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKClcbiAgICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC50b2dnbGVzLnNlbGVjdFRvQ29weScpIGFuZCB0ZXh0XG4gICAgICAgICAgcmF3TGluZXMgPSB0ZXh0LnNwbGl0KC9cXHI/XFxuL2cpXG4gICAgICAgICAgbGluZXMgPSByYXdMaW5lcy5tYXAgKGxpbmUpIC0+XG4gICAgICAgICAgICBsaW5lLnJlcGxhY2UoL1xccy9nLCBcIiBcIikudHJpbVJpZ2h0KClcbiAgICAgICAgICB0ZXh0ID0gbGluZXMuam9pbihcIlxcblwiKVxuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHRleHQpXG4gICAgICAgIHVubGVzcyB0ZXh0XG4gICAgICAgICAgQGZvY3VzKClcbiAgICBAeHRlcm0ub24gJ2RyYWdlbnRlcicsIG92ZXJyaWRlXG4gICAgQHh0ZXJtLm9uICdkcmFnb3ZlcicsIG92ZXJyaWRlXG4gICAgQHh0ZXJtLm9uICdkcm9wJywgQHJlY2lldmVJdGVtT3JGaWxlXG5cbiAgICBAb24gJ2ZvY3VzJywgQGZvY3VzXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGRpc3Bvc2U6ID0+XG4gICAgICBAb2ZmICdmb2N1cycsIEBmb2N1c1xuXG4gICAgaWYgL3pzaHxiYXNoLy50ZXN0KEBzaGVsbCkgYW5kIEBhcmdzLmluZGV4T2YoJy0tbG9naW4nKSA9PSAtMSBhbmQgUHR5LnBsYXRmb3JtIGlzbnQgJ3dpbjMyJyBhbmQgYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC50b2dnbGVzLmxvZ2luU2hlbGwnKVxuICAgICAgQGFyZ3MudW5zaGlmdCAnLS1sb2dpbidcblxuICBhdHRhY2g6IC0+XG4gICAgcmV0dXJuIGlmIEBwYW5lbD9cbiAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcblxuICBzZXRBbmltYXRpb25TcGVlZDogPT5cbiAgICBAYW5pbWF0aW9uU3BlZWQgPSBhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLnN0eWxlLmFuaW1hdGlvblNwZWVkJylcbiAgICBAYW5pbWF0aW9uU3BlZWQgPSAxMDAgaWYgQGFuaW1hdGlvblNwZWVkIGlzIDBcblxuICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCBcImhlaWdodCAjezAuMjUgLyBAYW5pbWF0aW9uU3BlZWR9cyBsaW5lYXJcIlxuXG4gIHJlY2lldmVJdGVtT3JGaWxlOiAoZXZlbnQpID0+XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAge2RhdGFUcmFuc2Zlcn0gPSBldmVudC5vcmlnaW5hbEV2ZW50XG5cbiAgICBpZiBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnYXRvbS1ldmVudCcpIGlzICd0cnVlJ1xuICAgICAgZmlsZVBhdGggPSBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGV4dC9wbGFpbicpXG4gICAgICBAaW5wdXQgXCIje2ZpbGVQYXRofSBcIiBpZiBmaWxlUGF0aFxuICAgIGVsc2UgaWYgZmlsZVBhdGggPSBkYXRhVHJhbnNmZXIuZ2V0RGF0YSgnaW5pdGlhbFBhdGgnKVxuICAgICAgQGlucHV0IFwiI3tmaWxlUGF0aH0gXCJcbiAgICBlbHNlIGlmIGRhdGFUcmFuc2Zlci5maWxlcy5sZW5ndGggPiAwXG4gICAgICBmb3IgZmlsZSBpbiBkYXRhVHJhbnNmZXIuZmlsZXNcbiAgICAgICAgQGlucHV0IFwiI3tmaWxlLnBhdGh9IFwiXG5cbiAgZm9ya1B0eVByb2Nlc3M6IC0+XG4gICAgVGFzay5vbmNlIFB0eSwgcGF0aC5yZXNvbHZlKEBwd2QpLCBAc2hlbGwsIEBhcmdzLCBAZW52LCA9PlxuICAgICAgQGlucHV0ID0gLT5cbiAgICAgIEByZXNpemUgPSAtPlxuXG4gIGdldElkOiAtPlxuICAgIHJldHVybiBAaWRcblxuICBkaXNwbGF5VGVybWluYWw6IC0+XG4gICAge2NvbHMsIHJvd3N9ID0gQGdldERpbWVuc2lvbnMoKVxuICAgIEBwdHlQcm9jZXNzID0gQGZvcmtQdHlQcm9jZXNzKClcblxuICAgIEB0ZXJtaW5hbCA9IG5ldyBUZXJtaW5hbCB7XG4gICAgICBjdXJzb3JCbGluayAgICAgOiBmYWxzZVxuICAgICAgc2Nyb2xsYmFjayAgICAgIDogYXRvbS5jb25maWcuZ2V0ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb3JlLnNjcm9sbGJhY2snXG4gICAgICBjb2xzLCByb3dzXG4gICAgfVxuXG4gICAgQGF0dGFjaExpc3RlbmVycygpXG4gICAgQGF0dGFjaFJlc2l6ZUV2ZW50cygpXG4gICAgQGF0dGFjaFdpbmRvd0V2ZW50cygpXG4gICAgQHRlcm1pbmFsLm9wZW4gQHh0ZXJtLmdldCgwKVxuXG4gIGF0dGFjaExpc3RlbmVyczogLT5cbiAgICBAcHR5UHJvY2Vzcy5vbiBcInBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmRhdGFcIiwgKGRhdGEpID0+XG4gICAgICBAdGVybWluYWwud3JpdGUgZGF0YVxuXG4gICAgQHB0eVByb2Nlc3Mub24gXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpleGl0XCIsID0+XG4gICAgICBAZGVzdHJveSgpIGlmIGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwudG9nZ2xlcy5hdXRvQ2xvc2UnKVxuXG4gICAgQHRlcm1pbmFsLmVuZCA9ID0+IEBkZXN0cm95KClcblxuICAgIEB0ZXJtaW5hbC5vbiBcImRhdGFcIiwgKGRhdGEpID0+XG4gICAgICBAaW5wdXQgZGF0YVxuXG4gICAgQHB0eVByb2Nlc3Mub24gXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDp0aXRsZVwiLCAodGl0bGUpID0+XG4gICAgICBAcHJvY2VzcyA9IHRpdGxlXG4gICAgQHRlcm1pbmFsLm9uIFwidGl0bGVcIiwgKHRpdGxlKSA9PlxuICAgICAgQHRpdGxlID0gdGl0bGVcblxuICAgIEB0ZXJtaW5hbC5vbmNlIFwib3BlblwiLCA9PlxuICAgICAgQGFwcGx5U3R5bGUoKVxuICAgICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcblxuICAgICAgcmV0dXJuIHVubGVzcyBAcHR5UHJvY2Vzcy5jaGlsZFByb2Nlc3M/XG4gICAgICBhdXRvUnVuQ29tbWFuZCA9IGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuY29yZS5hdXRvUnVuQ29tbWFuZCcpXG4gICAgICBAaW5wdXQgXCIje2F1dG9SdW5Db21tYW5kfSN7b3MuRU9MfVwiIGlmIGF1dG9SdW5Db21tYW5kXG4gICAgICBAaW5wdXQgXCIje2NvbW1hbmR9I3tvcy5FT0x9XCIgZm9yIGNvbW1hbmQgaW4gQGF1dG9SdW5cblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBzdGF0dXNJY29uLmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXIucmVtb3ZlVGVybWluYWxWaWV3IHRoaXNcbiAgICBAZGV0YWNoUmVzaXplRXZlbnRzKClcbiAgICBAZGV0YWNoV2luZG93RXZlbnRzKClcblxuICAgIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgQGhpZGUoKVxuICAgICAgQG9uVHJhbnNpdGlvbkVuZCA9PiBAcGFuZWwuZGVzdHJveSgpXG4gICAgZWxzZVxuICAgICAgQHBhbmVsLmRlc3Ryb3koKVxuXG4gICAgaWYgQHN0YXR1c0ljb24gYW5kIEBzdGF0dXNJY29uLnBhcmVudE5vZGVcbiAgICAgIEBzdGF0dXNJY29uLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoQHN0YXR1c0ljb24pXG5cbiAgICBAcHR5UHJvY2Vzcz8udGVybWluYXRlKClcbiAgICBAdGVybWluYWw/LmRlc3Ryb3koKVxuXG4gIG1heGltaXplOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZSBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgIEBtYXhpbWl6ZUJ0bi50b29sdGlwLmRpc3Bvc2UoKVxuXG4gICAgQG1heEhlaWdodCA9IEBwcmV2SGVpZ2h0ICsgYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkucGFuZUNvbnRhaW5lci5lbGVtZW50Lm9mZnNldEhlaWdodFxuICAgIGJ0biA9IEBtYXhpbWl6ZUJ0bi5jaGlsZHJlbignc3BhbicpXG4gICAgQG9uVHJhbnNpdGlvbkVuZCA9PiBAZm9jdXMoKVxuXG4gICAgaWYgQG1heGltaXplZFxuICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAbWF4aW1pemVCdG4sXG4gICAgICAgIHRpdGxlOiAnRnVsbHNjcmVlbidcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgQGFkanVzdEhlaWdodCBAcHJldkhlaWdodFxuICAgICAgYnRuLnJlbW92ZUNsYXNzKCdpY29uLXNjcmVlbi1ub3JtYWwnKS5hZGRDbGFzcygnaWNvbi1zY3JlZW4tZnVsbCcpXG4gICAgICBAbWF4aW1pemVkID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgICAgdGl0bGU6ICdOb3JtYWwnXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICAgIEBhZGp1c3RIZWlnaHQgQG1heEhlaWdodFxuICAgICAgYnRuLnJlbW92ZUNsYXNzKCdpY29uLXNjcmVlbi1mdWxsJykuYWRkQ2xhc3MoJ2ljb24tc2NyZWVuLW5vcm1hbCcpXG4gICAgICBAbWF4aW1pemVkID0gdHJ1ZVxuXG4gIG9wZW46ID0+XG4gICAgbGFzdEFjdGl2ZUVsZW1lbnQgPz0gJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuXG4gICAgaWYgbGFzdE9wZW5lZFZpZXcgYW5kIGxhc3RPcGVuZWRWaWV3ICE9IHRoaXNcbiAgICAgIGlmIGxhc3RPcGVuZWRWaWV3Lm1heGltaXplZFxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUgQG1heGltaXplQnRuLnRvb2x0aXBcbiAgICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAuZGlzcG9zZSgpXG4gICAgICAgIGljb24gPSBAbWF4aW1pemVCdG4uY2hpbGRyZW4oJ3NwYW4nKVxuXG4gICAgICAgIEBtYXhIZWlnaHQgPSBsYXN0T3BlbmVkVmlldy5tYXhIZWlnaHRcbiAgICAgICAgQG1heGltaXplQnRuLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCBAbWF4aW1pemVCdG4sXG4gICAgICAgICAgdGl0bGU6ICdOb3JtYWwnXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgICBpY29uLnJlbW92ZUNsYXNzKCdpY29uLXNjcmVlbi1mdWxsJykuYWRkQ2xhc3MoJ2ljb24tc2NyZWVuLW5vcm1hbCcpXG4gICAgICAgIEBtYXhpbWl6ZWQgPSB0cnVlXG4gICAgICBsYXN0T3BlbmVkVmlldy5oaWRlKClcblxuICAgIGxhc3RPcGVuZWRWaWV3ID0gdGhpc1xuICAgIEBzdGF0dXNCYXIuc2V0QWN0aXZlVGVybWluYWxWaWV3IHRoaXNcbiAgICBAc3RhdHVzSWNvbi5hY3RpdmF0ZSgpXG5cbiAgICBAb25UcmFuc2l0aW9uRW5kID0+XG4gICAgICBpZiBub3QgQG9wZW5lZFxuICAgICAgICBAb3BlbmVkID0gdHJ1ZVxuICAgICAgICBAZGlzcGxheVRlcm1pbmFsKClcbiAgICAgICAgQHByZXZIZWlnaHQgPSBAbmVhcmVzdFJvdyhAeHRlcm0uaGVpZ2h0KCkpXG4gICAgICAgIEB4dGVybS5oZWlnaHQoQHByZXZIZWlnaHQpXG4gICAgICAgIEBlbWl0IFwicGxhdGZvcm1pby1pZGUtdGVybWluYWw6dGVybWluYWwtb3BlblwiXG4gICAgICBlbHNlXG4gICAgICAgIEBmb2N1cygpXG5cbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHh0ZXJtLmhlaWdodCAwXG4gICAgQGFuaW1hdGluZyA9IHRydWVcbiAgICBAeHRlcm0uaGVpZ2h0IGlmIEBtYXhpbWl6ZWQgdGhlbiBAbWF4SGVpZ2h0IGVsc2UgQHByZXZIZWlnaHRcblxuICBoaWRlOiA9PlxuICAgIEB0ZXJtaW5hbD8uYmx1cigpXG4gICAgbGFzdE9wZW5lZFZpZXcgPSBudWxsXG4gICAgQHN0YXR1c0ljb24uZGVhY3RpdmF0ZSgpXG5cbiAgICBAb25UcmFuc2l0aW9uRW5kID0+XG4gICAgICBAcGFuZWwuaGlkZSgpXG4gICAgICB1bmxlc3MgbGFzdE9wZW5lZFZpZXc/XG4gICAgICAgIGlmIGxhc3RBY3RpdmVFbGVtZW50P1xuICAgICAgICAgIGxhc3RBY3RpdmVFbGVtZW50LmZvY3VzKClcbiAgICAgICAgICBsYXN0QWN0aXZlRWxlbWVudCA9IG51bGxcblxuICAgIEB4dGVybS5oZWlnaHQgaWYgQG1heGltaXplZCB0aGVuIEBtYXhIZWlnaHQgZWxzZSBAcHJldkhlaWdodFxuICAgIEBhbmltYXRpbmcgPSB0cnVlXG4gICAgQHh0ZXJtLmhlaWdodCAwXG5cbiAgdG9nZ2xlOiAtPlxuICAgIHJldHVybiBpZiBAYW5pbWF0aW5nXG5cbiAgICBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgIEBoaWRlKClcbiAgICBlbHNlXG4gICAgICBAb3BlbigpXG5cbiAgaW5wdXQ6IChkYXRhKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQHB0eVByb2Nlc3MuY2hpbGRQcm9jZXNzP1xuXG4gICAgQHRlcm1pbmFsLnN0b3BTY3JvbGxpbmcoKVxuICAgIEBwdHlQcm9jZXNzLnNlbmQgZXZlbnQ6ICdpbnB1dCcsIHRleHQ6IGRhdGFcblxuICByZXNpemU6IChjb2xzLCByb3dzKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQHB0eVByb2Nlc3MuY2hpbGRQcm9jZXNzP1xuXG4gICAgQHB0eVByb2Nlc3Muc2VuZCB7ZXZlbnQ6ICdyZXNpemUnLCByb3dzLCBjb2xzfVxuXG4gIHB0eTogKCkgLT5cbiAgICBpZiBub3QgQG9wZW5lZFxuICAgICAgd2FpdCA9IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICAgIEBlbWl0dGVyLm9uIFwicGxhdGZvcm1pby1pZGUtdGVybWluYWw6dGVybWluYWwtb3BlblwiLCAoKSA9PlxuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICBzZXRUaW1lb3V0IHJlamVjdCwgMTAwMFxuXG4gICAgICB3YWl0LnRoZW4gKCkgPT5cbiAgICAgICAgQHB0eVByb21pc2UoKVxuICAgIGVsc2VcbiAgICAgIEBwdHlQcm9taXNlKClcblxuICBwdHlQcm9taXNlOiAoKSAtPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBpZiBAcHR5UHJvY2Vzcz9cbiAgICAgICAgQHB0eVByb2Nlc3Mub24gXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDpwdHlcIiwgKHB0eSkgPT5cbiAgICAgICAgICByZXNvbHZlKHB0eSlcbiAgICAgICAgQHB0eVByb2Nlc3Muc2VuZCB7ZXZlbnQ6ICdwdHknfVxuICAgICAgICBzZXRUaW1lb3V0IHJlamVjdCwgMTAwMFxuICAgICAgZWxzZVxuICAgICAgICByZWplY3QoKVxuXG4gIGFwcGx5U3R5bGU6IC0+XG4gICAgY29uZmlnID0gYXRvbS5jb25maWcuZ2V0ICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbCdcblxuICAgIEB4dGVybS5hZGRDbGFzcyBjb25maWcuc3R5bGUudGhlbWVcbiAgICBAeHRlcm0uYWRkQ2xhc3MgJ2N1cnNvci1ibGluaycgaWYgY29uZmlnLnRvZ2dsZXMuY3Vyc29yQmxpbmtcblxuICAgIGVkaXRvckZvbnQgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250RmFtaWx5JylcbiAgICBkZWZhdWx0Rm9udCA9IFwiTWVubG8sIENvbnNvbGFzLCAnRGVqYVZ1IFNhbnMgTW9ubycsIG1vbm9zcGFjZVwiXG4gICAgb3ZlcnJpZGVGb250ID0gY29uZmlnLnN0eWxlLmZvbnRGYW1pbHlcbiAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250RmFtaWx5ID0gb3ZlcnJpZGVGb250IG9yIGVkaXRvckZvbnQgb3IgZGVmYXVsdEZvbnRcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnZWRpdG9yLmZvbnRGYW1pbHknLCAoZXZlbnQpID0+XG4gICAgICBlZGl0b3JGb250ID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSBvdmVycmlkZUZvbnQgb3IgZWRpdG9yRm9udCBvciBkZWZhdWx0Rm9udFxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuZm9udEZhbWlseScsIChldmVudCkgPT5cbiAgICAgIG92ZXJyaWRlRm9udCA9IGV2ZW50Lm5ld1ZhbHVlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250RmFtaWx5ID0gb3ZlcnJpZGVGb250IG9yIGVkaXRvckZvbnQgb3IgZGVmYXVsdEZvbnRcblxuICAgIGVkaXRvckZvbnRTaXplID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IuZm9udFNpemUnKVxuICAgIG92ZXJyaWRlRm9udFNpemUgPSBjb25maWcuc3R5bGUuZm9udFNpemVcbiAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250U2l6ZSA9IFwiI3tvdmVycmlkZUZvbnRTaXplIG9yIGVkaXRvckZvbnRTaXplfXB4XCJcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnZWRpdG9yLmZvbnRTaXplJywgKGV2ZW50KSA9PlxuICAgICAgZWRpdG9yRm9udFNpemUgPSBldmVudC5uZXdWYWx1ZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSBcIiN7b3ZlcnJpZGVGb250U2l6ZSBvciBlZGl0b3JGb250U2l6ZX1weFwiXG4gICAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuZm9udFNpemUnLCAoZXZlbnQpID0+XG4gICAgICBvdmVycmlkZUZvbnRTaXplID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRTaXplID0gXCIje292ZXJyaWRlRm9udFNpemUgb3IgZWRpdG9yRm9udFNpemV9cHhcIlxuICAgICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcblxuICAgICMgZmlyc3QgOCBjb2xvcnMgaS5lLiAnZGFyaycgY29sb3JzXG4gICAgQHRlcm1pbmFsLmNvbG9yc1swLi43XSA9IFtcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5ibGFjay50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwucmVkLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5ncmVlbi50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy5ub3JtYWwueWVsbG93LnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5ibHVlLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5tYWdlbnRhLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5jeWFuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC53aGl0ZS50b0hleFN0cmluZygpXG4gICAgXVxuICAgICMgJ2JyaWdodCcgY29sb3JzXG4gICAgQHRlcm1pbmFsLmNvbG9yc1s4Li4xNV0gPSBbXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEJsYWNrLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0UmVkLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0R3JlZW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRZZWxsb3cudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRCbHVlLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0TWFnZW50YS50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEN5YW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRXaGl0ZS50b0hleFN0cmluZygpXG4gICAgXVxuXG4gIGF0dGFjaFdpbmRvd0V2ZW50czogLT5cbiAgICAkKHdpbmRvdykub24gJ3Jlc2l6ZScsIEBvbldpbmRvd1Jlc2l6ZVxuXG4gIGRldGFjaFdpbmRvd0V2ZW50czogLT5cbiAgICAkKHdpbmRvdykub2ZmICdyZXNpemUnLCBAb25XaW5kb3dSZXNpemVcblxuICBhdHRhY2hSZXNpemVFdmVudHM6IC0+XG4gICAgQHBhbmVsRGl2aWRlci5vbiAnbW91c2Vkb3duJywgQHJlc2l6ZVN0YXJ0ZWRcblxuICBkZXRhY2hSZXNpemVFdmVudHM6IC0+XG4gICAgQHBhbmVsRGl2aWRlci5vZmYgJ21vdXNlZG93bidcblxuICBvbldpbmRvd1Jlc2l6ZTogPT5cbiAgICBpZiBub3QgQHRhYlZpZXdcbiAgICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCAnJ1xuICAgICAgbmV3SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgICBib3R0b21QYW5lbCA9ICQoJ2F0b20tcGFuZWwtY29udGFpbmVyLmJvdHRvbScpLmZpcnN0KCkuZ2V0KDApXG4gICAgICBvdmVyZmxvdyA9IGJvdHRvbVBhbmVsLnNjcm9sbEhlaWdodCAtIGJvdHRvbVBhbmVsLm9mZnNldEhlaWdodFxuXG4gICAgICBkZWx0YSA9IG5ld0hlaWdodCAtIEB3aW5kb3dIZWlnaHRcbiAgICAgIEB3aW5kb3dIZWlnaHQgPSBuZXdIZWlnaHRcblxuICAgICAgaWYgQG1heGltaXplZFxuICAgICAgICBjbGFtcGVkID0gTWF0aC5tYXgoQG1heEhlaWdodCArIGRlbHRhLCBAcm93SGVpZ2h0KVxuXG4gICAgICAgIEBhZGp1c3RIZWlnaHQgY2xhbXBlZCBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgICAgQG1heEhlaWdodCA9IGNsYW1wZWRcblxuICAgICAgICBAcHJldkhlaWdodCA9IE1hdGgubWluKEBwcmV2SGVpZ2h0LCBAbWF4SGVpZ2h0KVxuICAgICAgZWxzZSBpZiBvdmVyZmxvdyA+IDBcbiAgICAgICAgY2xhbXBlZCA9IE1hdGgubWF4KEBuZWFyZXN0Um93KEBwcmV2SGVpZ2h0ICsgZGVsdGEpLCBAcm93SGVpZ2h0KVxuXG4gICAgICAgIEBhZGp1c3RIZWlnaHQgY2xhbXBlZCBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgICAgQHByZXZIZWlnaHQgPSBjbGFtcGVkXG5cbiAgICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCBcImhlaWdodCAjezAuMjUgLyBAYW5pbWF0aW9uU3BlZWR9cyBsaW5lYXJcIlxuICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG5cbiAgcmVzaXplU3RhcnRlZDogPT5cbiAgICByZXR1cm4gaWYgQG1heGltaXplZFxuICAgIEBtYXhIZWlnaHQgPSBAcHJldkhlaWdodCArICQoJy5pdGVtLXZpZXdzJykuaGVpZ2h0KClcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2Vtb3ZlJywgQHJlc2l6ZVBhbmVsKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZXVwJywgQHJlc2l6ZVN0b3BwZWQpXG4gICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsICcnXG5cbiAgcmVzaXplU3RvcHBlZDogPT5cbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNlbW92ZScsIEByZXNpemVQYW5lbClcbiAgICAkKGRvY3VtZW50KS5vZmYoJ21vdXNldXAnLCBAcmVzaXplU3RvcHBlZClcbiAgICBAeHRlcm0uY3NzICd0cmFuc2l0aW9uJywgXCJoZWlnaHQgI3swLjI1IC8gQGFuaW1hdGlvblNwZWVkfXMgbGluZWFyXCJcblxuICBuZWFyZXN0Um93OiAodmFsdWUpIC0+XG4gICAgcm93cyA9IHZhbHVlIC8vIEByb3dIZWlnaHRcbiAgICByZXR1cm4gcm93cyAqIEByb3dIZWlnaHRcblxuICByZXNpemVQYW5lbDogKGV2ZW50KSA9PlxuICAgIHJldHVybiBAcmVzaXplU3RvcHBlZCgpIHVubGVzcyBldmVudC53aGljaCBpcyAxXG5cbiAgICBtb3VzZVkgPSAkKHdpbmRvdykuaGVpZ2h0KCkgLSBldmVudC5wYWdlWVxuICAgIGRlbHRhID0gbW91c2VZIC0gJCgnYXRvbS1wYW5lbC1jb250YWluZXIuYm90dG9tJykuaGVpZ2h0KCkgLSAkKCdhdG9tLXBhbmVsLWNvbnRhaW5lci5mb290ZXInKS5oZWlnaHQoKVxuICAgIHJldHVybiB1bmxlc3MgTWF0aC5hYnMoZGVsdGEpID4gKEByb3dIZWlnaHQgKiA1IC8gNilcblxuICAgIGNsYW1wZWQgPSBNYXRoLm1heChAbmVhcmVzdFJvdyhAcHJldkhlaWdodCArIGRlbHRhKSwgQHJvd0hlaWdodClcbiAgICByZXR1cm4gaWYgY2xhbXBlZCA+IEBtYXhIZWlnaHRcblxuICAgIEB4dGVybS5oZWlnaHQgY2xhbXBlZFxuICAgICQoQHRlcm1pbmFsLmVsZW1lbnQpLmhlaWdodCBjbGFtcGVkXG4gICAgQHByZXZIZWlnaHQgPSBjbGFtcGVkXG5cbiAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuXG4gIGFkanVzdEhlaWdodDogKGhlaWdodCkgLT5cbiAgICBAeHRlcm0uaGVpZ2h0IGhlaWdodFxuICAgICQoQHRlcm1pbmFsLmVsZW1lbnQpLmhlaWdodCBoZWlnaHRcblxuICBjb3B5OiAtPlxuICAgIGlmIEB0ZXJtaW5hbC5fc2VsZWN0ZWRcbiAgICAgIHRleHRhcmVhID0gQHRlcm1pbmFsLmdldENvcHlUZXh0YXJlYSgpXG4gICAgICB0ZXh0ID0gQHRlcm1pbmFsLmdyYWJUZXh0KFxuICAgICAgICBAdGVybWluYWwuX3NlbGVjdGVkLngxLCBAdGVybWluYWwuX3NlbGVjdGVkLngyLFxuICAgICAgICBAdGVybWluYWwuX3NlbGVjdGVkLnkxLCBAdGVybWluYWwuX3NlbGVjdGVkLnkyKVxuICAgIGVsc2VcbiAgICAgIHJhd1RleHQgPSBAdGVybWluYWwuY29udGV4dC5nZXRTZWxlY3Rpb24oKS50b1N0cmluZygpXG4gICAgICByYXdMaW5lcyA9IHJhd1RleHQuc3BsaXQoL1xccj9cXG4vZylcbiAgICAgIGxpbmVzID0gcmF3TGluZXMubWFwIChsaW5lKSAtPlxuICAgICAgICBsaW5lLnJlcGxhY2UoL1xccy9nLCBcIiBcIikudHJpbVJpZ2h0KClcbiAgICAgIHRleHQgPSBsaW5lcy5qb2luKFwiXFxuXCIpXG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUgdGV4dFxuXG4gIHBhc3RlOiAtPlxuICAgIEBpbnB1dCBhdG9tLmNsaXBib2FyZC5yZWFkKClcblxuICBpbnNlcnRTZWxlY3Rpb246IChjdXN0b21UZXh0KSAtPlxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcnVuQ29tbWFuZCA9IGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwudG9nZ2xlcy5ydW5JbnNlcnRlZFRleHQnKVxuICAgIHNlbGVjdGlvblRleHQgPSAnJ1xuICAgIGlmIHNlbGVjdGlvbiA9IGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVxuICAgICAgQHRlcm1pbmFsLnN0b3BTY3JvbGxpbmcoKVxuICAgICAgc2VsZWN0aW9uVGV4dCA9IHNlbGVjdGlvblxuICAgIGVsc2UgaWYgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3Vyc29yLnJvdylcbiAgICAgIEB0ZXJtaW5hbC5zdG9wU2Nyb2xsaW5nKClcbiAgICAgIHNlbGVjdGlvblRleHQgPSBsaW5lXG4gICAgICBlZGl0b3IubW92ZURvd24oMSk7XG4gICAgQGlucHV0IFwiI3tjdXN0b21UZXh0LlxuICAgICAgcmVwbGFjZSgvXFwkTC8sIFwiI3tlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3cgKyAxfVwiKS5cbiAgICAgIHJlcGxhY2UoL1xcJEYvLCBwYXRoLmJhc2VuYW1lKGlmIGVkaXRvci5idWZmZXIuZ2V0UGF0aCgpIHRoZW4gZWRpdG9yLmJ1ZmZlci5nZXRQYXRoKCkgZWxzZSAnLicpKS5cbiAgICAgIHJlcGxhY2UoL1xcJEQvLCBwYXRoLmRpcm5hbWUoaWYgZWRpdG9yLmJ1ZmZlci5nZXRQYXRoKCkgdGhlbiBlZGl0b3IuYnVmZmVyLmdldFBhdGgoKSBlbHNlICcuJykpLlxuICAgICAgcmVwbGFjZSgvXFwkUy8sIHNlbGVjdGlvblRleHQpLlxuICAgICAgcmVwbGFjZSgvXFwkXFwkLywgJyQnKX0je2lmIHJ1bkNvbW1hbmQgdGhlbiBvcy5FT0wgZWxzZSAnJ31cIlxuXG4gIGZvY3VzOiAoZnJvbVdpbmRvd0V2ZW50KSA9PlxuICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG4gICAgQGZvY3VzVGVybWluYWwoZnJvbVdpbmRvd0V2ZW50KVxuICAgIEBzdGF0dXNCYXIuc2V0QWN0aXZlVGVybWluYWxWaWV3KHRoaXMpXG4gICAgc3VwZXIoKVxuXG4gIGJsdXI6ID0+XG4gICAgQGJsdXJUZXJtaW5hbCgpXG4gICAgc3VwZXIoKVxuXG4gIGZvY3VzVGVybWluYWw6IChmcm9tV2luZG93RXZlbnQpID0+XG4gICAgcmV0dXJuIHVubGVzcyBAdGVybWluYWxcblxuICAgIGxhc3RBY3RpdmVFbGVtZW50ID0gJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgIHJldHVybiBpZiBmcm9tV2luZG93RXZlbnQgYW5kIG5vdCAobGFzdEFjdGl2ZUVsZW1lbnQuaXMoJ2Rpdi50ZXJtaW5hbCcpIG9yIGxhc3RBY3RpdmVFbGVtZW50LnBhcmVudHMoJ2Rpdi50ZXJtaW5hbCcpLmxlbmd0aClcblxuICAgIEB0ZXJtaW5hbC5mb2N1cygpXG4gICAgaWYgQHRlcm1pbmFsLl90ZXh0YXJlYVxuICAgICAgQHRlcm1pbmFsLl90ZXh0YXJlYS5mb2N1cygpXG4gICAgZWxzZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuZm9jdXMoKVxuXG4gIGJsdXJUZXJtaW5hbDogPT5cbiAgICByZXR1cm4gdW5sZXNzIEB0ZXJtaW5hbFxuXG4gICAgQHRlcm1pbmFsLmJsdXIoKVxuICAgIEB0ZXJtaW5hbC5lbGVtZW50LmJsdXIoKVxuXG4gICAgaWYgbGFzdEFjdGl2ZUVsZW1lbnQ/XG4gICAgICBsYXN0QWN0aXZlRWxlbWVudC5mb2N1cygpXG5cbiAgcmVzaXplVGVybWluYWxUb1ZpZXc6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcGFuZWwuaXNWaXNpYmxlKCkgb3IgQHRhYlZpZXdcblxuICAgIHtjb2xzLCByb3dzfSA9IEBnZXREaW1lbnNpb25zKClcbiAgICByZXR1cm4gdW5sZXNzIGNvbHMgPiAwIGFuZCByb3dzID4gMFxuICAgIHJldHVybiB1bmxlc3MgQHRlcm1pbmFsXG4gICAgcmV0dXJuIGlmIEB0ZXJtaW5hbC5yb3dzIGlzIHJvd3MgYW5kIEB0ZXJtaW5hbC5jb2xzIGlzIGNvbHNcblxuICAgIEByZXNpemUgY29scywgcm93c1xuICAgIEB0ZXJtaW5hbC5yZXNpemUgY29scywgcm93c1xuXG4gIGdldERpbWVuc2lvbnM6IC0+XG4gICAgZmFrZVJvdyA9ICQoXCI8ZGl2PjxzcGFuPiZuYnNwOzwvc3Bhbj48L2Rpdj5cIilcblxuICAgIGlmIEB0ZXJtaW5hbFxuICAgICAgQGZpbmQoJy50ZXJtaW5hbCcpLmFwcGVuZCBmYWtlUm93XG4gICAgICBmYWtlQ29sID0gZmFrZVJvdy5jaGlsZHJlbigpLmZpcnN0KClbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbHMgPSBNYXRoLmZsb29yIEB4dGVybS53aWR0aCgpIC8gKGZha2VDb2wud2lkdGggb3IgOSlcbiAgICAgIHJvd3MgPSBNYXRoLmZsb29yIEB4dGVybS5oZWlnaHQoKSAvIChmYWtlQ29sLmhlaWdodCBvciAyMClcbiAgICAgIEByb3dIZWlnaHQgPSBmYWtlQ29sLmhlaWdodFxuICAgICAgZmFrZVJvdy5yZW1vdmUoKVxuICAgIGVsc2VcbiAgICAgIGNvbHMgPSBNYXRoLmZsb29yIEB4dGVybS53aWR0aCgpIC8gOVxuICAgICAgcm93cyA9IE1hdGguZmxvb3IgQHh0ZXJtLmhlaWdodCgpIC8gMjBcblxuICAgIHtjb2xzLCByb3dzfVxuXG4gIG9uVHJhbnNpdGlvbkVuZDogKGNhbGxiYWNrKSAtPlxuICAgIEB4dGVybS5vbmUgJ3dlYmtpdFRyYW5zaXRpb25FbmQnLCA9PlxuICAgICAgY2FsbGJhY2soKVxuICAgICAgQGFuaW1hdGluZyA9IGZhbHNlXG5cbiAgaW5wdXREaWFsb2c6IC0+XG4gICAgSW5wdXREaWFsb2cgPz0gcmVxdWlyZSgnLi9pbnB1dC1kaWFsb2cnKVxuICAgIGRpYWxvZyA9IG5ldyBJbnB1dERpYWxvZyB0aGlzXG4gICAgZGlhbG9nLmF0dGFjaCgpXG5cbiAgcmVuYW1lOiAtPlxuICAgIEBzdGF0dXNJY29uLnJlbmFtZSgpXG5cbiAgdG9nZ2xlVGFiVmlldzogLT5cbiAgICBpZiBAdGFiVmlld1xuICAgICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogdGhpcywgdmlzaWJsZTogZmFsc2UpXG4gICAgICBAYXR0YWNoUmVzaXplRXZlbnRzKClcbiAgICAgIEBjbG9zZUJ0bi5zaG93KClcbiAgICAgIEBoaWRlQnRuLnNob3coKVxuICAgICAgQG1heGltaXplQnRuLnNob3coKVxuICAgICAgQHRhYlZpZXcgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgIEBwYW5lbC5kZXN0cm95KClcbiAgICAgIEBkZXRhY2hSZXNpemVFdmVudHMoKVxuICAgICAgQGNsb3NlQnRuLmhpZGUoKVxuICAgICAgQGhpZGVCdG4uaGlkZSgpXG4gICAgICBAbWF4aW1pemVCdG4uaGlkZSgpXG4gICAgICBAeHRlcm0uY3NzIFwiaGVpZ2h0XCIsIFwiXCJcbiAgICAgIEB0YWJWaWV3ID0gdHJ1ZVxuICAgICAgbGFzdE9wZW5lZFZpZXcgPSBudWxsIGlmIGxhc3RPcGVuZWRWaWV3ID09IHRoaXNcblxuICBnZXRUaXRsZTogLT5cbiAgICBAc3RhdHVzSWNvbi5nZXROYW1lKCkgb3IgXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbFwiXG5cbiAgZ2V0SWNvbk5hbWU6IC0+XG4gICAgXCJ0ZXJtaW5hbFwiXG5cbiAgZ2V0U2hlbGw6IC0+XG4gICAgcmV0dXJuIHBhdGguYmFzZW5hbWUgQHNoZWxsXG5cbiAgZ2V0U2hlbGxQYXRoOiAtPlxuICAgIHJldHVybiBAc2hlbGxcblxuICBlbWl0OiAoZXZlbnQsIGRhdGEpIC0+XG4gICAgQGVtaXR0ZXIuZW1pdCBldmVudCwgZGF0YVxuXG4gIG9uRGlkQ2hhbmdlVGl0bGU6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZS10aXRsZScsIGNhbGxiYWNrXG5cbiAgZ2V0UGF0aDogLT5cbiAgICByZXR1cm4gQGdldFRlcm1pbmFsVGl0bGUoKVxuXG4gIGdldFRlcm1pbmFsVGl0bGU6IC0+XG4gICAgcmV0dXJuIEB0aXRsZSBvciBAcHJvY2Vzc1xuXG4gIGdldFRlcm1pbmFsOiAtPlxuICAgIHJldHVybiBAdGVybWluYWxcblxuICBpc0FuaW1hdGluZzogLT5cbiAgICByZXR1cm4gQGFuaW1hdGluZ1xuIl19
