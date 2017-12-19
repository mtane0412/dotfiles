(function() {
  var $, CompositeDisposable, InputDialog, RenameDialog, Shell, StatusIcon, Terminal, TerminalDisplay, View, os, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, View = ref.View;

  TerminalDisplay = null;

  Shell = null;

  InputDialog = null;

  RenameDialog = null;

  StatusIcon = null;

  os = require('os');

  module.exports = Terminal = (function(superClass) {
    extend(Terminal, superClass);

    function Terminal() {
      this.recieveItemOrFile = bind(this.recieveItemOrFile, this);
      this.focusTerminal = bind(this.focusTerminal, this);
      this.blurTerminal = bind(this.blurTerminal, this);
      this.promptForInput = bind(this.promptForInput, this);
      this.promptForRename = bind(this.promptForRename, this);
      this.focus = bind(this.focus, this);
      this.blur = bind(this.blur, this);
      return Terminal.__super__.constructor.apply(this, arguments);
    }

    Terminal.prototype.process = '';

    Terminal.prototype.title = '';

    Terminal.prototype.name = '';

    Terminal.prototype.rowHeight = 20;

    Terminal.prototype.colWidth = 9;

    Terminal.prototype.prevHeight = null;

    Terminal.prototype.currentHeight = null;

    Terminal.prototype.parentView = null;

    Terminal.prototype.shell = null;

    Terminal.prototype.display = null;

    Terminal.prototype.opened = false;

    Terminal.content = function() {
      return this.div({
        "class": 'xterm'
      });
    };

    Terminal.getFocusedTerminal = function() {
      if (!TerminalDisplay) {
        return null;
      }
      return TerminalDisplay.Terminal.focus;
    };

    Terminal.prototype.initialize = function(arg) {
      var override;
      this.shellPath = arg.shellPath, this.pwd = arg.pwd, this.id = arg.id;
      if (TerminalDisplay == null) {
        TerminalDisplay = require('term.js');
      }
      if (Shell == null) {
        Shell = require('./shell');
      }
      if (StatusIcon == null) {
        StatusIcon = require('./status-icon');
      }
      this.subscriptions = new CompositeDisposable();
      this.core = require('./core');
      this.statusIcon = new StatusIcon();
      this.statusIcon.initialize(this);
      this.registerAnimationSpeed();
      override = function(event) {
        if (event.originalEvent.dataTransfer.getData('terminal-plus') === 'true') {
          return;
        }
        event.preventDefault();
        return event.stopPropagation();
      };
      this.on('mouseup', (function(_this) {
        return function(event) {
          var text;
          if (event.which !== 3) {
            text = window.getSelection().toString();
            if (!text) {
              return _this.parentView.focus();
            }
          }
        };
      })(this));
      this.on('dragenter', override);
      this.on('dragover', override);
      this.on('drop', this.recieveItemOrFile);
      return this.on('focus', this.focus);
    };

    Terminal.prototype.destroy = function() {
      this.subscriptions.dispose();
      if (this.shell) {
        this.shell.destroy();
      }
      if (this.display) {
        this.display.destroy();
      }
      this.statusIcon.destroy();
      return this.core.removeTerminal(this);
    };


    /*
    Section: Setup
     */

    Terminal.prototype.applyStyle = function() {
      var config, defaultFont, editorFont, editorFontSize, overrideFont, overrideFontSize, ref1, ref2;
      config = atom.config.get('terminal-plus');
      this.addClass(config.style.theme);
      if (config.toggles.cursorBlink) {
        this.addClass('cursor-blink');
      }
      editorFont = atom.config.get('editor.fontFamily');
      defaultFont = "Menlo, Consolas, 'DejaVu Sans Mono', monospace";
      overrideFont = config.style.fontFamily;
      this.display.element.style.fontFamily = overrideFont || editorFont || defaultFont;
      this.subscriptions.add(atom.config.onDidChange('editor.fontFamily', (function(_this) {
        return function(event) {
          editorFont = event.newValue;
          return _this.display.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.fontFamily', (function(_this) {
        return function(event) {
          overrideFont = event.newValue;
          return _this.display.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      editorFontSize = atom.config.get('editor.fontSize');
      overrideFontSize = config.style.fontSize;
      this.display.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
      this.subscriptions.add(atom.config.onDidChange('editor.fontSize', (function(_this) {
        return function(event) {
          editorFontSize = event.newValue;
          _this.display.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.recalibrateSize();
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('terminal-plus.style.fontSize', (function(_this) {
        return function(event) {
          overrideFontSize = event.newValue;
          _this.display.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.recalibrateSize();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('terminal-plus.style.fontAntialiasing', (function(_this) {
        return function(value) {
          switch (value) {
            case "Antialiased":
              return _this.display.element.style["-webkit-font-smoothing"] = "antialiased";
            case "Default":
              return _this.display.element.style["-webkit-font-smoothing"] = "subpixel-antialiased";
            case "None":
              return _this.display.element.style["-webkit-font-smoothing"] = "none";
          }
        };
      })(this)));
      [].splice.apply(this.display.colors, [0, 8].concat(ref1 = [config.ansiColors.normal.black.toHexString(), config.ansiColors.normal.red.toHexString(), config.ansiColors.normal.green.toHexString(), config.ansiColors.normal.yellow.toHexString(), config.ansiColors.normal.blue.toHexString(), config.ansiColors.normal.magenta.toHexString(), config.ansiColors.normal.cyan.toHexString(), config.ansiColors.normal.white.toHexString()])), ref1;
      return ([].splice.apply(this.display.colors, [8, 8].concat(ref2 = [config.ansiColors.zBright.brightBlack.toHexString(), config.ansiColors.zBright.brightRed.toHexString(), config.ansiColors.zBright.brightGreen.toHexString(), config.ansiColors.zBright.brightYellow.toHexString(), config.ansiColors.zBright.brightBlue.toHexString(), config.ansiColors.zBright.brightMagenta.toHexString(), config.ansiColors.zBright.brightCyan.toHexString(), config.ansiColors.zBright.brightWhite.toHexString()])), ref2);
    };

    Terminal.prototype.attachListeners = function() {
      this.shell.on("terminal-plus:data", (function(_this) {
        return function(data) {
          return _this.display.write(data);
        };
      })(this));
      this.shell.on("terminal-plus:exit", (function(_this) {
        return function() {
          if (atom.config.get('terminal-plus.toggles.autoClose')) {
            return _this.destroy();
          }
        };
      })(this));
      this.display.end = (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this);
      this.display.on("data", (function(_this) {
        return function(data) {
          return _this.shell.input(data);
        };
      })(this));
      this.shell.on("terminal-plus:title", (function(_this) {
        return function(title) {
          return _this.process = title;
        };
      })(this));
      this.display.on("title", (function(_this) {
        return function(title) {
          return _this.title = title;
        };
      })(this));
      return this.display.once("open", (function(_this) {
        return function() {
          var autoRunCommand;
          _this.applyStyle();
          _this.recalibrateSize();
          autoRunCommand = atom.config.get('terminal-plus.core.autoRunCommand');
          if (autoRunCommand) {
            return _this.input("" + autoRunCommand + os.EOL);
          }
        };
      })(this));
    };

    Terminal.prototype.displayView = function() {
      var cols, ref1, rows;
      if (this.opened) {
        return false;
      }
      this.opened = true;
      ref1 = this.getDimensions(), cols = ref1.cols, rows = ref1.rows;
      this.shell = new Shell({
        pwd: this.pwd,
        shellPath: this.shellPath
      });
      this.display = new TerminalDisplay({
        cursorBlink: false,
        scrollback: atom.config.get('terminal-plus.core.scrollback'),
        cols: cols,
        rows: rows
      });
      this.attachListeners();
      this.display.open(this.element);
      return true;
    };

    Terminal.prototype.registerAnimationSpeed = function() {
      return this.subscriptions.add(atom.config.observe('terminal-plus.style.animationSpeed', (function(_this) {
        return function(value) {
          if (value === 0) {
            _this.animationSpeed = 100;
          } else {
            _this.animationSpeed = parseFloat(value);
          }
          return _this.css('transition', "height " + (0.25 / _this.animationSpeed) + "s linear");
        };
      })(this)));
    };


    /*
    Section: External Methods
     */

    Terminal.prototype.blur = function() {
      this.blurTerminal();
      return Terminal.__super__.blur.call(this);
    };

    Terminal.prototype.focus = function() {
      this.recalibrateSize();
      this.focusTerminal();
      this.core.setActiveTerminal(this);
      return Terminal.__super__.focus.call(this);
    };

    Terminal.prototype.getDisplay = function() {
      return this.display;
    };

    Terminal.prototype.getTitle = function() {
      return this.title || this.process;
    };

    Terminal.prototype.getRowHeight = function() {
      return this.rowHeight;
    };

    Terminal.prototype.getColWidth = function() {
      return this.colWidth;
    };

    Terminal.prototype.getId = function() {
      return this.id;
    };

    Terminal.prototype.recalibrateSize = function() {
      var cols, ref1, rows;
      if (!this.display) {
        return;
      }
      ref1 = this.getDimensions(), cols = ref1.cols, rows = ref1.rows;
      if (!(cols > 0 && rows > 0)) {
        return;
      }
      if (this.display.rows === rows && this.display.cols === cols) {
        return;
      }
      this.resize(cols, rows);
      return this.display.resize(cols, rows);
    };

    Terminal.prototype.height = function(height) {
      if (height == null) {
        return Terminal.__super__.height.call(this);
      }
      if (height !== this.currentHeight) {
        this.prevHeight = this.currentHeight;
        this.currentHeight = height;
      }
      return Terminal.__super__.height.call(this, height);
    };

    Terminal.prototype.clearHeight = function() {
      this.prevHeight = this.height();
      return this.css("height", "0");
    };

    Terminal.prototype.getPrevHeight = function() {
      return this.prevHeight;
    };

    Terminal.prototype.input = function(data) {
      return this.shell.input(data);
    };

    Terminal.prototype.resize = function(cols, rows) {
      return this.shell.resize(cols, rows);
    };

    Terminal.prototype.getCols = function() {
      return this.display.cols;
    };

    Terminal.prototype.getRows = function() {
      return this.display.rows;
    };

    Terminal.prototype.isFocused = function() {
      return Terminal.getFocusedTerminal() === this.display;
    };

    Terminal.prototype.isTabView = function() {
      var ref1;
      if (!this.parentView) {
        return false;
      }
      return ((ref1 = this.parentView.constructor) != null ? ref1.name : void 0) === "TabView";
    };

    Terminal.prototype.isPanelView = function() {
      var ref1;
      if (!this.parentView) {
        return false;
      }
      return ((ref1 = this.parentView.constructor) != null ? ref1.name : void 0) === "PanelView";
    };

    Terminal.prototype.setName = function(name) {
      if (this.name !== name) {
        this.name = name;
        return this.parentView.updateName(name);
      }
    };

    Terminal.prototype.getName = function() {
      return this.name;
    };

    Terminal.prototype.promptForRename = function() {
      var dialog;
      if (RenameDialog == null) {
        RenameDialog = require('./rename-dialog');
      }
      dialog = new RenameDialog(this);
      return dialog.attach();
    };

    Terminal.prototype.promptForInput = function() {
      var dialog;
      if (InputDialog == null) {
        InputDialog = require('./input-dialog');
      }
      dialog = new InputDialog(this);
      return dialog.attach();
    };

    Terminal.prototype.copy = function() {
      var lines, rawLines, rawText, text, textarea;
      if (this.display._selected) {
        textarea = this.display.getCopyTextarea();
        text = this.display.grabText(this.display._selected.x1, this.display._selected.x2, this.display._selected.y1, this.display._selected.y2);
      } else {
        rawText = this.display.context.getSelection().toString();
        rawLines = rawText.split(/\r?\n/g);
        lines = rawLines.map(function(line) {
          return line.replace(/\s/g, " ").trimRight();
        });
        text = lines.join("\n");
      }
      return atom.clipboard.write(text);
    };

    Terminal.prototype.paste = function() {
      return this.input(atom.clipboard.read());
    };

    Terminal.prototype.insertSelection = function() {
      var cursor, editor, line, runCommand, selection;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      runCommand = atom.config.get('terminal-plus.toggles.runInsertedText');
      if (selection = editor.getSelectedText()) {
        this.display.stopScrolling();
        return this.input("" + selection + (runCommand ? os.EOL : ''));
      } else if (cursor = editor.getCursorBufferPosition()) {
        line = editor.lineTextForBufferRow(cursor.row);
        this.display.stopScrolling();
        this.input("" + line + (runCommand ? os.EOL : ''));
        return editor.moveDown(1);
      }
    };

    Terminal.prototype.disableAnimation = function() {
      return this.css('transition', "");
    };

    Terminal.prototype.enableAnimation = function() {
      return this.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    Terminal.prototype.getParentView = function() {
      return this.parentView;
    };

    Terminal.prototype.setParentView = function(view) {
      this.parentView = view;
      return this;
    };

    Terminal.prototype.isAnimating = function() {
      return this.parentView.isAnimating();
    };

    Terminal.prototype.open = function() {
      return this.parentView.open();
    };

    Terminal.prototype.toggle = function() {
      return this.parentView.toggle();
    };

    Terminal.prototype.toggleFullscreen = function() {
      return this.parentView.toggleFullscreen();
    };

    Terminal.prototype.toggleFocus = function() {
      return this.parentView.toggleFocus();
    };

    Terminal.prototype.getStatusIcon = function() {
      return this.statusIcon;
    };

    Terminal.prototype.hideIcon = function() {
      return this.statusIcon.hide();
    };

    Terminal.prototype.showIcon = function() {
      return this.statusIcon.show();
    };


    /*
    Section: Helper Methods
     */

    Terminal.prototype.blurTerminal = function() {
      if (!this.display) {
        return;
      }
      this.display.blur();
      return this.display.element.blur();
    };

    Terminal.prototype.focusTerminal = function() {
      if (!this.display) {
        return;
      }
      this.display.focus();
      if (this.display._textarea) {
        return this.display._textarea.focus();
      } else {
        return this.display.element.focus();
      }
    };

    Terminal.prototype.getDimensions = function() {
      var cols, fakeCol, fakeRow, rows;
      fakeRow = $("<div><span>&nbsp;</span></div>");
      if (this.display) {
        this.find('.terminal').append(fakeRow);
        fakeCol = fakeRow.children().first()[0].getBoundingClientRect();
        cols = Math.floor(this.width() / (fakeCol.width || 9));
        rows = Math.floor(this.height() / (fakeCol.height || 20));
        this.rowHeight = fakeCol.height;
        this.colWidth = fakeCol.width;
        fakeRow.remove();
      } else {
        cols = Math.floor(this.width() / 9);
        rows = Math.floor(this.height() / 20);
      }
      return {
        cols: cols,
        rows: rows
      };
    };

    Terminal.prototype.recieveItemOrFile = function(event) {
      var dataTransfer, file, filePath, i, len, ref1, results;
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
        ref1 = dataTransfer.files;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          file = ref1[i];
          results.push(this.input(file.path + " "));
        }
        return results;
      }
    };

    return Terminal;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvdGVybWluYWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw4R0FBQTtJQUFBOzs7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixNQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsU0FBRCxFQUFJOztFQUVKLGVBQUEsR0FBa0I7O0VBQ2xCLEtBQUEsR0FBUTs7RUFDUixXQUFBLEdBQWM7O0VBQ2QsWUFBQSxHQUFlOztFQUNmLFVBQUEsR0FBYTs7RUFFYixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozs7Ozs7Ozs7dUJBQ0osT0FBQSxHQUFTOzt1QkFDVCxLQUFBLEdBQU87O3VCQUNQLElBQUEsR0FBTTs7dUJBQ04sU0FBQSxHQUFXOzt1QkFDWCxRQUFBLEdBQVU7O3VCQUNWLFVBQUEsR0FBWTs7dUJBQ1osYUFBQSxHQUFlOzt1QkFDZixVQUFBLEdBQVk7O3VCQUNaLEtBQUEsR0FBTzs7dUJBQ1AsT0FBQSxHQUFTOzt1QkFDVCxNQUFBLEdBQVE7O0lBRVIsUUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sT0FBUDtPQUFMO0lBRFE7O0lBR1YsUUFBQyxDQUFBLGtCQUFELEdBQXFCLFNBQUE7TUFDbkIsSUFBQSxDQUFtQixlQUFuQjtBQUFBLGVBQU8sS0FBUDs7QUFDQSxhQUFPLGVBQWUsQ0FBQyxRQUFRLENBQUM7SUFGYjs7dUJBSXJCLFVBQUEsR0FBWSxTQUFDLEdBQUQ7QUFDVixVQUFBO01BRFksSUFBQyxDQUFBLGdCQUFBLFdBQVcsSUFBQyxDQUFBLFVBQUEsS0FBSyxJQUFDLENBQUEsU0FBQTs7UUFDL0Isa0JBQW1CLE9BQUEs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OztJQVZZOzs7O0tBclhFO0FBWnZCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnskLCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5UZXJtaW5hbERpc3BsYXkgPSBudWxsXG5TaGVsbCA9IG51bGxcbklucHV0RGlhbG9nID0gbnVsbFxuUmVuYW1lRGlhbG9nID0gbnVsbFxuU3RhdHVzSWNvbiA9IG51bGxcblxub3MgPSByZXF1aXJlICdvcydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVGVybWluYWwgZXh0ZW5kcyBWaWV3XG4gIHByb2Nlc3M6ICcnXG4gIHRpdGxlOiAnJ1xuICBuYW1lOiAnJ1xuICByb3dIZWlnaHQ6IDIwXG4gIGNvbFdpZHRoOiA5XG4gIHByZXZIZWlnaHQ6IG51bGxcbiAgY3VycmVudEhlaWdodDogbnVsbFxuICBwYXJlbnRWaWV3OiBudWxsXG4gIHNoZWxsOiBudWxsXG4gIGRpc3BsYXk6IG51bGxcbiAgb3BlbmVkOiBmYWxzZVxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICd4dGVybSdcblxuICBAZ2V0Rm9jdXNlZFRlcm1pbmFsOiAtPlxuICAgIHJldHVybiBudWxsIHVubGVzcyBUZXJtaW5hbERpc3BsYXlcbiAgICByZXR1cm4gVGVybWluYWxEaXNwbGF5LlRlcm1pbmFsLmZvY3VzXG5cbiAgaW5pdGlhbGl6ZTogKHtAc2hlbGxQYXRoLCBAcHdkLCBAaWR9KSAtPlxuICAgIFRlcm1pbmFsRGlzcGxheSA/PSByZXF1aXJlICd0ZXJtLmpzJ1xuICAgIFNoZWxsID89IHJlcXVpcmUgJy4vc2hlbGwnXG4gICAgU3RhdHVzSWNvbiA/PSByZXF1aXJlICcuL3N0YXR1cy1pY29uJ1xuXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgQGNvcmUgPSByZXF1aXJlICcuL2NvcmUnXG5cbiAgICBAc3RhdHVzSWNvbiA9IG5ldyBTdGF0dXNJY29uKClcbiAgICBAc3RhdHVzSWNvbi5pbml0aWFsaXplKHRoaXMpXG4gICAgQHJlZ2lzdGVyQW5pbWF0aW9uU3BlZWQoKVxuXG4gICAgb3ZlcnJpZGUgPSAoZXZlbnQpIC0+XG4gICAgICByZXR1cm4gaWYgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGVybWluYWwtcGx1cycpIGlzICd0cnVlJ1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICAgIEBvbiAnbW91c2V1cCcsIChldmVudCkgPT5cbiAgICAgIGlmIGV2ZW50LndoaWNoICE9IDNcbiAgICAgICAgdGV4dCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKS50b1N0cmluZygpXG4gICAgICAgIHVubGVzcyB0ZXh0XG4gICAgICAgICAgQHBhcmVudFZpZXcuZm9jdXMoKVxuICAgIEBvbiAnZHJhZ2VudGVyJywgb3ZlcnJpZGVcbiAgICBAb24gJ2RyYWdvdmVyJywgb3ZlcnJpZGVcbiAgICBAb24gJ2Ryb3AnLCBAcmVjaWV2ZUl0ZW1PckZpbGVcbiAgICBAb24gJ2ZvY3VzJywgQGZvY3VzXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAc2hlbGwuZGVzdHJveSgpIGlmIEBzaGVsbFxuICAgIEBkaXNwbGF5LmRlc3Ryb3koKSBpZiBAZGlzcGxheVxuICAgIEBzdGF0dXNJY29uLmRlc3Ryb3koKVxuXG4gICAgQGNvcmUucmVtb3ZlVGVybWluYWwodGhpcylcblxuXG4gICMjI1xuICBTZWN0aW9uOiBTZXR1cFxuICAjIyNcblxuICBhcHBseVN0eWxlOiAtPlxuICAgIGNvbmZpZyA9IGF0b20uY29uZmlnLmdldCAndGVybWluYWwtcGx1cydcblxuICAgIEBhZGRDbGFzcyBjb25maWcuc3R5bGUudGhlbWVcbiAgICBAYWRkQ2xhc3MgJ2N1cnNvci1ibGluaycgaWYgY29uZmlnLnRvZ2dsZXMuY3Vyc29yQmxpbmtcblxuICAgIGVkaXRvckZvbnQgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250RmFtaWx5JylcbiAgICBkZWZhdWx0Rm9udCA9IFwiTWVubG8sIENvbnNvbGFzLCAnRGVqYVZ1IFNhbnMgTW9ubycsIG1vbm9zcGFjZVwiXG4gICAgb3ZlcnJpZGVGb250ID0gY29uZmlnLnN0eWxlLmZvbnRGYW1pbHlcbiAgICBAZGlzcGxheS5lbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSBvdmVycmlkZUZvbnQgb3IgZWRpdG9yRm9udCBvciBkZWZhdWx0Rm9udFxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdlZGl0b3IuZm9udEZhbWlseScsIChldmVudCkgPT5cbiAgICAgIGVkaXRvckZvbnQgPSBldmVudC5uZXdWYWx1ZVxuICAgICAgQGRpc3BsYXkuZWxlbWVudC5zdHlsZS5mb250RmFtaWx5ID0gb3ZlcnJpZGVGb250IG9yIGVkaXRvckZvbnQgb3IgZGVmYXVsdEZvbnRcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3Rlcm1pbmFsLXBsdXMuc3R5bGUuZm9udEZhbWlseScsIChldmVudCkgPT5cbiAgICAgIG92ZXJyaWRlRm9udCA9IGV2ZW50Lm5ld1ZhbHVlXG4gICAgICBAZGlzcGxheS5lbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSBvdmVycmlkZUZvbnQgb3IgZWRpdG9yRm9udCBvciBkZWZhdWx0Rm9udFxuXG4gICAgZWRpdG9yRm9udFNpemUgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250U2l6ZScpXG4gICAgb3ZlcnJpZGVGb250U2l6ZSA9IGNvbmZpZy5zdHlsZS5mb250U2l6ZVxuICAgIEBkaXNwbGF5LmVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSBcIiN7b3ZlcnJpZGVGb250U2l6ZSBvciBlZGl0b3JGb250U2l6ZX1weFwiXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2VkaXRvci5mb250U2l6ZScsIChldmVudCkgPT5cbiAgICAgIGVkaXRvckZvbnRTaXplID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEBkaXNwbGF5LmVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSBcIiN7b3ZlcnJpZGVGb250U2l6ZSBvciBlZGl0b3JGb250U2l6ZX1weFwiXG4gICAgICBAcmVjYWxpYnJhdGVTaXplKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3Rlcm1pbmFsLXBsdXMuc3R5bGUuZm9udFNpemUnLCAoZXZlbnQpID0+XG4gICAgICBvdmVycmlkZUZvbnRTaXplID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEBkaXNwbGF5LmVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSBcIiN7b3ZlcnJpZGVGb250U2l6ZSBvciBlZGl0b3JGb250U2l6ZX1weFwiXG4gICAgICBAcmVjYWxpYnJhdGVTaXplKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICd0ZXJtaW5hbC1wbHVzLnN0eWxlLmZvbnRBbnRpYWxpYXNpbmcnLCAodmFsdWUpID0+XG4gICAgICBzd2l0Y2ggdmFsdWVcbiAgICAgICAgd2hlbiBcIkFudGlhbGlhc2VkXCJcbiAgICAgICAgICBAZGlzcGxheS5lbGVtZW50LnN0eWxlW1wiLXdlYmtpdC1mb250LXNtb290aGluZ1wiXSA9IFwiYW50aWFsaWFzZWRcIlxuICAgICAgICB3aGVuIFwiRGVmYXVsdFwiXG4gICAgICAgICAgQGRpc3BsYXkuZWxlbWVudC5zdHlsZVtcIi13ZWJraXQtZm9udC1zbW9vdGhpbmdcIl0gPSBcInN1YnBpeGVsLWFudGlhbGlhc2VkXCJcbiAgICAgICAgd2hlbiBcIk5vbmVcIlxuICAgICAgICAgIEBkaXNwbGF5LmVsZW1lbnQuc3R5bGVbXCItd2Via2l0LWZvbnQtc21vb3RoaW5nXCJdID0gXCJub25lXCJcblxuICAgICMgZmlyc3QgOCBjb2xvcnMgaS5lLiAnZGFyaycgY29sb3JzXG4gICAgQGRpc3BsYXkuY29sb3JzWzAuLjddID0gW1xuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmJsYWNrLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5yZWQudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmdyZWVuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC55ZWxsb3cudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmJsdWUudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLm1hZ2VudGEudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmN5YW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLndoaXRlLnRvSGV4U3RyaW5nKClcbiAgICBdXG4gICAgIyAnYnJpZ2h0JyBjb2xvcnNcbiAgICBAZGlzcGxheS5jb2xvcnNbOC4uMTVdID0gW1xuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRCbGFjay50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodFJlZC50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEdyZWVuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0WWVsbG93LnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0Qmx1ZS50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodE1hZ2VudGEudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRDeWFuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0V2hpdGUudG9IZXhTdHJpbmcoKVxuICAgIF1cblxuICBhdHRhY2hMaXN0ZW5lcnM6IC0+XG4gICAgQHNoZWxsLm9uIFwidGVybWluYWwtcGx1czpkYXRhXCIsIChkYXRhKSA9PlxuICAgICAgQGRpc3BsYXkud3JpdGUgZGF0YVxuXG4gICAgQHNoZWxsLm9uIFwidGVybWluYWwtcGx1czpleGl0XCIsID0+XG4gICAgICBAZGVzdHJveSgpIGlmIGF0b20uY29uZmlnLmdldCgndGVybWluYWwtcGx1cy50b2dnbGVzLmF1dG9DbG9zZScpXG5cbiAgICBAZGlzcGxheS5lbmQgPSA9PiBAZGVzdHJveSgpXG5cbiAgICBAZGlzcGxheS5vbiBcImRhdGFcIiwgKGRhdGEpID0+XG4gICAgICBAc2hlbGwuaW5wdXQgZGF0YVxuXG4gICAgQHNoZWxsLm9uIFwidGVybWluYWwtcGx1czp0aXRsZVwiLCAodGl0bGUpID0+XG4gICAgICBAcHJvY2VzcyA9IHRpdGxlXG4gICAgQGRpc3BsYXkub24gXCJ0aXRsZVwiLCAodGl0bGUpID0+XG4gICAgICBAdGl0bGUgPSB0aXRsZVxuXG4gICAgQGRpc3BsYXkub25jZSBcIm9wZW5cIiwgPT5cbiAgICAgIEBhcHBseVN0eWxlKClcbiAgICAgIEByZWNhbGlicmF0ZVNpemUoKVxuXG4gICAgICBhdXRvUnVuQ29tbWFuZCA9IGF0b20uY29uZmlnLmdldCgndGVybWluYWwtcGx1cy5jb3JlLmF1dG9SdW5Db21tYW5kJylcbiAgICAgIEBpbnB1dCBcIiN7YXV0b1J1bkNvbW1hbmR9I3tvcy5FT0x9XCIgaWYgYXV0b1J1bkNvbW1hbmRcblxuICBkaXNwbGF5VmlldzogLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQG9wZW5lZFxuICAgIEBvcGVuZWQgPSB0cnVlXG5cbiAgICB7Y29scywgcm93c30gPSBAZ2V0RGltZW5zaW9ucygpXG4gICAgQHNoZWxsID0gbmV3IFNoZWxsIHtAcHdkLCBAc2hlbGxQYXRofVxuXG4gICAgQGRpc3BsYXkgPSBuZXcgVGVybWluYWxEaXNwbGF5IHtcbiAgICAgIGN1cnNvckJsaW5rIDogZmFsc2VcbiAgICAgIHNjcm9sbGJhY2sgOiBhdG9tLmNvbmZpZy5nZXQgJ3Rlcm1pbmFsLXBsdXMuY29yZS5zY3JvbGxiYWNrJ1xuICAgICAgY29scywgcm93c1xuICAgIH1cblxuICAgIEBhdHRhY2hMaXN0ZW5lcnMoKVxuICAgIEBkaXNwbGF5Lm9wZW4gQGVsZW1lbnRcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHJlZ2lzdGVyQW5pbWF0aW9uU3BlZWQ6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3Rlcm1pbmFsLXBsdXMuc3R5bGUuYW5pbWF0aW9uU3BlZWQnLFxuICAgICAgKHZhbHVlKSA9PlxuICAgICAgICBpZiB2YWx1ZSA9PSAwXG4gICAgICAgICAgQGFuaW1hdGlvblNwZWVkID0gMTAwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAYW5pbWF0aW9uU3BlZWQgPSBwYXJzZUZsb2F0KHZhbHVlKVxuICAgICAgICBAY3NzICd0cmFuc2l0aW9uJywgXCJoZWlnaHQgI3swLjI1IC8gQGFuaW1hdGlvblNwZWVkfXMgbGluZWFyXCJcblxuXG4gICMjI1xuICBTZWN0aW9uOiBFeHRlcm5hbCBNZXRob2RzXG4gICMjI1xuXG4gIGJsdXI6ID0+XG4gICAgQGJsdXJUZXJtaW5hbCgpXG4gICAgc3VwZXIoKVxuXG4gIGZvY3VzOiA9PlxuICAgIEByZWNhbGlicmF0ZVNpemUoKVxuICAgIEBmb2N1c1Rlcm1pbmFsKClcbiAgICBAY29yZS5zZXRBY3RpdmVUZXJtaW5hbCh0aGlzKVxuICAgIHN1cGVyKClcblxuICBnZXREaXNwbGF5OiAtPlxuICAgIHJldHVybiBAZGlzcGxheVxuXG4gIGdldFRpdGxlOiAtPlxuICAgIHJldHVybiBAdGl0bGUgb3IgQHByb2Nlc3NcblxuICBnZXRSb3dIZWlnaHQ6IC0+XG4gICAgcmV0dXJuIEByb3dIZWlnaHRcblxuICBnZXRDb2xXaWR0aDogLT5cbiAgICByZXR1cm4gQGNvbFdpZHRoXG5cbiAgZ2V0SWQ6IC0+XG4gICAgcmV0dXJuIEBpZFxuXG4gIHJlY2FsaWJyYXRlU2l6ZTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBkaXNwbGF5XG5cbiAgICB7Y29scywgcm93c30gPSBAZ2V0RGltZW5zaW9ucygpXG4gICAgcmV0dXJuIHVubGVzcyBjb2xzID4gMCBhbmQgcm93cyA+IDBcbiAgICByZXR1cm4gaWYgQGRpc3BsYXkucm93cyBpcyByb3dzIGFuZCBAZGlzcGxheS5jb2xzIGlzIGNvbHNcblxuICAgIEByZXNpemUgY29scywgcm93c1xuICAgIEBkaXNwbGF5LnJlc2l6ZSBjb2xzLCByb3dzXG5cbiAgaGVpZ2h0OiAoaGVpZ2h0KSAtPlxuICAgIHJldHVybiBzdXBlcigpIGlmIG5vdCBoZWlnaHQ/XG5cbiAgICBpZiBoZWlnaHQgIT0gQGN1cnJlbnRIZWlnaHRcbiAgICAgIEBwcmV2SGVpZ2h0ID0gQGN1cnJlbnRIZWlnaHRcbiAgICAgIEBjdXJyZW50SGVpZ2h0ID0gaGVpZ2h0XG4gICAgcmV0dXJuIHN1cGVyKGhlaWdodClcblxuICBjbGVhckhlaWdodDogLT5cbiAgICBAcHJldkhlaWdodCA9IEBoZWlnaHQoKVxuICAgIHJldHVybiBAY3NzIFwiaGVpZ2h0XCIsIFwiMFwiXG5cbiAgZ2V0UHJldkhlaWdodDogLT5cbiAgICByZXR1cm4gQHByZXZIZWlnaHRcblxuICBpbnB1dDogKGRhdGEpIC0+XG4gICAgQHNoZWxsLmlucHV0IGRhdGFcblxuICByZXNpemU6IChjb2xzLCByb3dzKSAtPlxuICAgIEBzaGVsbC5yZXNpemUgY29scywgcm93c1xuXG4gIGdldENvbHM6IC0+XG4gICAgcmV0dXJuIEBkaXNwbGF5LmNvbHNcblxuICBnZXRSb3dzOiAtPlxuICAgIHJldHVybiBAZGlzcGxheS5yb3dzXG5cbiAgaXNGb2N1c2VkOiAtPlxuICAgIHJldHVybiBUZXJtaW5hbC5nZXRGb2N1c2VkVGVybWluYWwoKSA9PSBAZGlzcGxheVxuXG4gIGlzVGFiVmlldzogLT5cbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIEBwYXJlbnRWaWV3XG4gICAgcmV0dXJuIEBwYXJlbnRWaWV3LmNvbnN0cnVjdG9yPy5uYW1lIGlzIFwiVGFiVmlld1wiXG5cbiAgaXNQYW5lbFZpZXc6IC0+XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBAcGFyZW50Vmlld1xuICAgIHJldHVybiBAcGFyZW50Vmlldy5jb25zdHJ1Y3Rvcj8ubmFtZSBpcyBcIlBhbmVsVmlld1wiXG5cbiAgc2V0TmFtZTogKG5hbWUpIC0+XG4gICAgaWYgQG5hbWUgaXNudCBuYW1lXG4gICAgICBAbmFtZSA9IG5hbWVcbiAgICAgIEBwYXJlbnRWaWV3LnVwZGF0ZU5hbWUobmFtZSlcblxuICBnZXROYW1lOiAtPlxuICAgIHJldHVybiBAbmFtZVxuXG4gIHByb21wdEZvclJlbmFtZTogPT5cbiAgICBSZW5hbWVEaWFsb2cgPz0gcmVxdWlyZSAnLi9yZW5hbWUtZGlhbG9nJ1xuICAgIGRpYWxvZyA9IG5ldyBSZW5hbWVEaWFsb2cgdGhpc1xuICAgIGRpYWxvZy5hdHRhY2goKVxuXG4gIHByb21wdEZvcklucHV0OiA9PlxuICAgIElucHV0RGlhbG9nID89IHJlcXVpcmUoJy4vaW5wdXQtZGlhbG9nJylcbiAgICBkaWFsb2cgPSBuZXcgSW5wdXREaWFsb2cgdGhpc1xuICAgIGRpYWxvZy5hdHRhY2goKVxuXG4gIGNvcHk6IC0+XG4gICAgaWYgQGRpc3BsYXkuX3NlbGVjdGVkXG4gICAgICB0ZXh0YXJlYSA9IEBkaXNwbGF5LmdldENvcHlUZXh0YXJlYSgpXG4gICAgICB0ZXh0ID0gQGRpc3BsYXkuZ3JhYlRleHQoXG4gICAgICAgIEBkaXNwbGF5Ll9zZWxlY3RlZC54MSwgQGRpc3BsYXkuX3NlbGVjdGVkLngyLFxuICAgICAgICBAZGlzcGxheS5fc2VsZWN0ZWQueTEsIEBkaXNwbGF5Ll9zZWxlY3RlZC55MilcbiAgICBlbHNlXG4gICAgICByYXdUZXh0ID0gQGRpc3BsYXkuY29udGV4dC5nZXRTZWxlY3Rpb24oKS50b1N0cmluZygpXG4gICAgICByYXdMaW5lcyA9IHJhd1RleHQuc3BsaXQoL1xccj9cXG4vZylcbiAgICAgIGxpbmVzID0gcmF3TGluZXMubWFwIChsaW5lKSAtPlxuICAgICAgICBsaW5lLnJlcGxhY2UoL1xccy9nLCBcIiBcIikudHJpbVJpZ2h0KClcbiAgICAgIHRleHQgPSBsaW5lcy5qb2luKFwiXFxuXCIpXG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUgdGV4dFxuXG4gIHBhc3RlOiAtPlxuICAgIEBpbnB1dCBhdG9tLmNsaXBib2FyZC5yZWFkKClcblxuICBpbnNlcnRTZWxlY3Rpb246IC0+XG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBydW5Db21tYW5kID0gYXRvbS5jb25maWcuZ2V0KCd0ZXJtaW5hbC1wbHVzLnRvZ2dsZXMucnVuSW5zZXJ0ZWRUZXh0JylcblxuICAgIGlmIHNlbGVjdGlvbiA9IGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVxuICAgICAgQGRpc3BsYXkuc3RvcFNjcm9sbGluZygpXG4gICAgICBAaW5wdXQgXCIje3NlbGVjdGlvbn0je2lmIHJ1bkNvbW1hbmQgdGhlbiBvcy5FT0wgZWxzZSAnJ31cIlxuICAgIGVsc2UgaWYgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3Vyc29yLnJvdylcbiAgICAgIEBkaXNwbGF5LnN0b3BTY3JvbGxpbmcoKVxuICAgICAgQGlucHV0IFwiI3tsaW5lfSN7aWYgcnVuQ29tbWFuZCB0aGVuIG9zLkVPTCBlbHNlICcnfVwiXG4gICAgICBlZGl0b3IubW92ZURvd24oMSlcblxuICBkaXNhYmxlQW5pbWF0aW9uOiAtPlxuICAgIEBjc3MgJ3RyYW5zaXRpb24nLCBcIlwiXG5cbiAgZW5hYmxlQW5pbWF0aW9uOiAtPlxuICAgIEBjc3MgJ3RyYW5zaXRpb24nLCBcImhlaWdodCAjezAuMjUgLyBAYW5pbWF0aW9uU3BlZWR9cyBsaW5lYXJcIlxuXG4gIGdldFBhcmVudFZpZXc6IC0+XG4gICAgcmV0dXJuIEBwYXJlbnRWaWV3XG5cbiAgc2V0UGFyZW50VmlldzogKHZpZXcpIC0+XG4gICAgQHBhcmVudFZpZXcgPSB2aWV3XG4gICAgcmV0dXJuIHRoaXNcblxuICBpc0FuaW1hdGluZzogLT5cbiAgICByZXR1cm4gQHBhcmVudFZpZXcuaXNBbmltYXRpbmcoKVxuXG4gIG9wZW46IC0+XG4gICAgQHBhcmVudFZpZXcub3BlbigpXG5cbiAgdG9nZ2xlOiAtPlxuICAgIEBwYXJlbnRWaWV3LnRvZ2dsZSgpXG5cbiAgdG9nZ2xlRnVsbHNjcmVlbjogLT5cbiAgICBAcGFyZW50Vmlldy50b2dnbGVGdWxsc2NyZWVuKClcblxuICB0b2dnbGVGb2N1czogLT5cbiAgICBAcGFyZW50Vmlldy50b2dnbGVGb2N1cygpXG5cbiAgZ2V0U3RhdHVzSWNvbjogLT5cbiAgICByZXR1cm4gQHN0YXR1c0ljb25cblxuICBoaWRlSWNvbjogLT5cbiAgICBAc3RhdHVzSWNvbi5oaWRlKClcblxuICBzaG93SWNvbjogLT5cbiAgICBAc3RhdHVzSWNvbi5zaG93KClcblxuXG4gICMjI1xuICBTZWN0aW9uOiBIZWxwZXIgTWV0aG9kc1xuICAjIyNcblxuICBibHVyVGVybWluYWw6ID0+XG4gICAgcmV0dXJuIHVubGVzcyBAZGlzcGxheVxuXG4gICAgQGRpc3BsYXkuYmx1cigpXG4gICAgQGRpc3BsYXkuZWxlbWVudC5ibHVyKClcblxuICBmb2N1c1Rlcm1pbmFsOiA9PlxuICAgIHJldHVybiB1bmxlc3MgQGRpc3BsYXlcblxuICAgIEBkaXNwbGF5LmZvY3VzKClcbiAgICBpZiBAZGlzcGxheS5fdGV4dGFyZWFcbiAgICAgIEBkaXNwbGF5Ll90ZXh0YXJlYS5mb2N1cygpXG4gICAgZWxzZVxuICAgICAgQGRpc3BsYXkuZWxlbWVudC5mb2N1cygpXG5cbiAgZ2V0RGltZW5zaW9uczogLT5cbiAgICBmYWtlUm93ID0gJChcIjxkaXY+PHNwYW4+Jm5ic3A7PC9zcGFuPjwvZGl2PlwiKVxuXG4gICAgaWYgQGRpc3BsYXlcbiAgICAgIEBmaW5kKCcudGVybWluYWwnKS5hcHBlbmQgZmFrZVJvd1xuICAgICAgZmFrZUNvbCA9IGZha2VSb3cuY2hpbGRyZW4oKS5maXJzdCgpWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb2xzID0gTWF0aC5mbG9vciBAd2lkdGgoKSAvIChmYWtlQ29sLndpZHRoIG9yIDkpXG4gICAgICByb3dzID0gTWF0aC5mbG9vciBAaGVpZ2h0KCkgLyAoZmFrZUNvbC5oZWlnaHQgb3IgMjApXG4gICAgICBAcm93SGVpZ2h0ID0gZmFrZUNvbC5oZWlnaHRcbiAgICAgIEBjb2xXaWR0aCA9IGZha2VDb2wud2lkdGhcbiAgICAgIGZha2VSb3cucmVtb3ZlKClcbiAgICBlbHNlXG4gICAgICBjb2xzID0gTWF0aC5mbG9vciBAd2lkdGgoKSAvIDlcbiAgICAgIHJvd3MgPSBNYXRoLmZsb29yIEBoZWlnaHQoKSAvIDIwXG5cbiAgICB7Y29scywgcm93c31cblxuICByZWNpZXZlSXRlbU9yRmlsZTogKGV2ZW50KSA9PlxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIHtkYXRhVHJhbnNmZXJ9ID0gZXZlbnQub3JpZ2luYWxFdmVudFxuXG4gICAgaWYgZGF0YVRyYW5zZmVyLmdldERhdGEoJ2F0b20tZXZlbnQnKSBpcyAndHJ1ZSdcbiAgICAgIGZpbGVQYXRoID0gZGF0YVRyYW5zZmVyLmdldERhdGEoJ3RleHQvcGxhaW4nKVxuICAgICAgQGlucHV0IFwiI3tmaWxlUGF0aH0gXCIgaWYgZmlsZVBhdGhcbiAgICBlbHNlIGlmIGZpbGVQYXRoID0gZGF0YVRyYW5zZmVyLmdldERhdGEoJ2luaXRpYWxQYXRoJylcbiAgICAgIEBpbnB1dCBcIiN7ZmlsZVBhdGh9IFwiXG4gICAgZWxzZSBpZiBkYXRhVHJhbnNmZXIuZmlsZXMubGVuZ3RoID4gMFxuICAgICAgZm9yIGZpbGUgaW4gZGF0YVRyYW5zZmVyLmZpbGVzXG4gICAgICAgIEBpbnB1dCBcIiN7ZmlsZS5wYXRofSBcIlxuIl19
