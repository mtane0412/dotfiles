(function() {
  var $, CompositeDisposable, InsertImageFileView, TextEditorView, View, config, dialog, fs, lastInsertImageDir, path, ref, remote, templateHelper, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View, TextEditorView = ref.TextEditorView;

  path = require("path");

  fs = require("fs-plus");

  remote = require("remote");

  dialog = remote.dialog || remote.require("dialog");

  config = require("../config");

  utils = require("../utils");

  templateHelper = require("../helpers/template-helper");

  lastInsertImageDir = null;

  module.exports = InsertImageFileView = (function(superClass) {
    extend(InsertImageFileView, superClass);

    function InsertImageFileView() {
      return InsertImageFileView.__super__.constructor.apply(this, arguments);
    }

    InsertImageFileView.content = function() {
      return this.div({
        "class": "markdown-writer markdown-writer-dialog"
      }, (function(_this) {
        return function() {
          _this.label("Insert Image", {
            "class": "icon icon-device-camera"
          });
          _this.div(function() {
            _this.label("Image Path (src)", {
              "class": "message"
            });
            _this.subview("imageEditor", new TextEditorView({
              mini: true
            }));
            _this.div({
              "class": "dialog-row"
            }, function() {
              _this.button("Choose Local Image", {
                outlet: "openImageButton",
                "class": "btn"
              });
              return _this.label({
                outlet: "message",
                "class": "side-label"
              });
            });
            _this.label("Title (alt)", {
              "class": "message"
            });
            _this.subview("titleEditor", new TextEditorView({
              mini: true
            }));
            _this.div({
              "class": "col-1"
            }, function() {
              _this.label("Width (px)", {
                "class": "message"
              });
              return _this.subview("widthEditor", new TextEditorView({
                mini: true
              }));
            });
            _this.div({
              "class": "col-1"
            }, function() {
              _this.label("Height (px)", {
                "class": "message"
              });
              return _this.subview("heightEditor", new TextEditorView({
                mini: true
              }));
            });
            return _this.div({
              "class": "col-2"
            }, function() {
              _this.label("Alignment", {
                "class": "message"
              });
              return _this.subview("alignEditor", new TextEditorView({
                mini: true
              }));
            });
          });
          _this.div({
            outlet: "copyImagePanel",
            "class": "hidden dialog-row"
          }, function() {
            return _this.label({
              "for": "markdown-writer-copy-image-checkbox"
            }, function() {
              _this.input({
                id: "markdown-writer-copy-image-checkbox"
              }, {
                type: "checkbox",
                outlet: "copyImageCheckbox"
              });
              return _this.span("Copy Image To: Missing Image Path (src) or Title (alt)", {
                "class": "side-label",
                outlet: "copyImageMessage"
              });
            });
          });
          return _this.div({
            "class": "image-container"
          }, function() {
            return _this.img({
              outlet: 'imagePreview'
            });
          });
        };
      })(this));
    };

    InsertImageFileView.prototype.initialize = function() {
      utils.setTabIndex([this.imageEditor, this.openImageButton, this.titleEditor, this.widthEditor, this.heightEditor, this.alignEditor, this.copyImageCheckbox]);
      this.imageEditor.on("blur", (function(_this) {
        return function() {
          var file;
          file = _this.imageEditor.getText().trim();
          _this.updateImageSource(file);
          return _this.updateCopyImageDest(file);
        };
      })(this));
      this.titleEditor.on("blur", (function(_this) {
        return function() {
          return _this.updateCopyImageDest(_this.imageEditor.getText().trim());
        };
      })(this));
      this.openImageButton.on("click", (function(_this) {
        return function() {
          return _this.openImageDialog();
        };
      })(this));
      this.disposables = new CompositeDisposable();
      return this.disposables.add(atom.commands.add(this.element, {
        "core:confirm": (function(_this) {
          return function() {
            return _this.onConfirm();
          };
        })(this),
        "core:cancel": (function(_this) {
          return function() {
            return _this.detach();
          };
        })(this)
      }));
    };

    InsertImageFileView.prototype.onConfirm = function() {
      var callback, imgSource;
      imgSource = this.imageEditor.getText().trim();
      if (!imgSource) {
        return;
      }
      callback = (function(_this) {
        return function() {
          _this.editor.transact(function() {
            return _this.insertImageTag();
          });
          return _this.detach();
        };
      })(this);
      if (!this.copyImageCheckbox.hasClass('hidden') && this.copyImageCheckbox.prop("checked")) {
        return this.copyImage(this.resolveImagePath(imgSource), callback);
      } else {
        return callback();
      }
    };

    InsertImageFileView.prototype.display = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.editor = atom.workspace.getActiveTextEditor();
      this.frontMatter = templateHelper.getEditor(this.editor);
      this.dateTime = templateHelper.getDateTime();
      this.setFieldsFromSelection();
      this.panel.show();
      return this.imageEditor.focus();
    };

    InsertImageFileView.prototype.detach = function() {
      var ref1;
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((ref1 = this.previouslyFocusedElement) != null) {
          ref1.focus();
        }
      }
      return InsertImageFileView.__super__.detach.apply(this, arguments);
    };

    InsertImageFileView.prototype.detached = function() {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.disposables = null;
    };

    InsertImageFileView.prototype.setFieldsFromSelection = function() {
      var img, selection;
      this.range = utils.getTextBufferRange(this.editor, "link");
      selection = this.editor.getTextInRange(this.range);
      if (!selection) {
        return;
      }
      if (utils.isImage(selection)) {
        img = utils.parseImage(selection);
      } else if (utils.isImageTag(selection)) {
        img = utils.parseImageTag(selection);
      } else {
        img = {
          alt: selection
        };
      }
      this.titleEditor.setText(img.alt || "");
      this.widthEditor.setText(img.width || "");
      this.heightEditor.setText(img.height || "");
      this.imageEditor.setText(img.src || "");
      return this.updateImageSource(img.src);
    };

    InsertImageFileView.prototype.openImageDialog = function() {
      var files;
      files = dialog.showOpenDialog({
        properties: ['openFile'],
        defaultPath: lastInsertImageDir || this.siteLocalDir()
      });
      if (!(files && files.length > 0)) {
        return;
      }
      this.imageEditor.setText(files[0]);
      this.updateImageSource(files[0]);
      if (!utils.isUrl(files[0])) {
        lastInsertImageDir = path.dirname(files[0]);
      }
      return this.titleEditor.focus();
    };

    InsertImageFileView.prototype.updateImageSource = function(file) {
      if (!file) {
        return;
      }
      this.displayImagePreview(file);
      if (utils.isUrl(file) || this.isInSiteDir(this.resolveImagePath(file))) {
        return this.copyImagePanel.addClass("hidden");
      } else {
        return this.copyImagePanel.removeClass("hidden");
      }
    };

    InsertImageFileView.prototype.updateCopyImageDest = function(file) {
      var destFile;
      if (!file) {
        return;
      }
      destFile = this.getCopiedImageDestPath(file, this.titleEditor.getText());
      return this.copyImageMessage.text("Copy Image To: " + destFile);
    };

    InsertImageFileView.prototype.displayImagePreview = function(file) {
      if (this.imageOnPreview === file) {
        return;
      }
      if (utils.isImageFile(file)) {
        this.message.text("Opening Image Preview ...");
        this.imagePreview.attr("src", this.resolveImagePath(file));
        this.imagePreview.load((function(_this) {
          return function() {
            _this.message.text("");
            return _this.setImageContext();
          };
        })(this));
        this.imagePreview.error((function(_this) {
          return function() {
            _this.message.text("Error: Failed to Load Image.");
            return _this.imagePreview.attr("src", "");
          };
        })(this));
      } else {
        if (file) {
          this.message.text("Error: Invalid Image File.");
        }
        this.imagePreview.attr("src", "");
        this.widthEditor.setText("");
        this.heightEditor.setText("");
        this.alignEditor.setText("");
      }
      return this.imageOnPreview = file;
    };

    InsertImageFileView.prototype.setImageContext = function() {
      var naturalHeight, naturalWidth, position, ref1;
      ref1 = this.imagePreview.context, naturalWidth = ref1.naturalWidth, naturalHeight = ref1.naturalHeight;
      this.widthEditor.setText("" + naturalWidth);
      this.heightEditor.setText("" + naturalHeight);
      position = naturalWidth > 300 ? "center" : "right";
      return this.alignEditor.setText(position);
    };

    InsertImageFileView.prototype.insertImageTag = function() {
      var img, imgSource, text;
      imgSource = this.imageEditor.getText().trim();
      img = {
        rawSrc: imgSource,
        src: this.generateImageSrc(imgSource),
        relativeFileSrc: this.generateRelativeImageSrc(imgSource, this.currentFileDir()),
        relativeSiteSrc: this.generateRelativeImageSrc(imgSource, this.siteLocalDir()),
        alt: this.titleEditor.getText(),
        width: this.widthEditor.getText(),
        height: this.heightEditor.getText(),
        align: this.alignEditor.getText()
      };
      if (img.src) {
        text = templateHelper.create("imageTag", this.frontMatter, this.dateTime, img);
      } else {
        text = img.alt;
      }
      return this.editor.setTextInBufferRange(this.range, text);
    };

    InsertImageFileView.prototype.copyImage = function(file, callback) {
      var confirmation, destFile, error, performWrite;
      if (utils.isUrl(file) || !fs.existsSync(file)) {
        return callback();
      }
      try {
        destFile = this.getCopiedImageDestPath(file, this.titleEditor.getText());
        performWrite = true;
        if (fs.existsSync(destFile)) {
          confirmation = atom.confirm({
            message: "File already exists!",
            detailedMessage: "Another file already exists at:\n" + destFile + "\nDo you want to overwrite it?",
            buttons: ["No", "Yes"]
          });
          performWrite = confirmation === 1;
        }
        if (performWrite) {
          return fs.copy(file, destFile, (function(_this) {
            return function() {
              _this.imageEditor.setText(destFile);
              return callback();
            };
          })(this));
        }
      } catch (error1) {
        error = error1;
        return atom.confirm({
          message: "[Markdown Writer] Error!",
          detailedMessage: "Copying Image:\n" + error.message,
          buttons: ['OK']
        });
      }
    };

    InsertImageFileView.prototype.siteLocalDir = function() {
      return utils.getSitePath(config.get("siteLocalDir"));
    };

    InsertImageFileView.prototype.siteImagesDir = function() {
      return templateHelper.create("siteImagesDir", this.frontMatter, this.dateTime);
    };

    InsertImageFileView.prototype.currentFileDir = function() {
      return path.dirname(this.editor.getPath() || "");
    };

    InsertImageFileView.prototype.isInSiteDir = function(file) {
      return file && file.startsWith(this.siteLocalDir());
    };

    InsertImageFileView.prototype.getCopiedImageDestPath = function(file, title) {
      var extension, filename;
      filename = path.basename(file);
      if (config.get("renameImageOnCopy") && title) {
        extension = path.extname(file);
        title = utils.slugize(title, config.get('slugSeparator'));
        filename = "" + title + extension;
      }
      return path.join(this.siteLocalDir(), this.siteImagesDir(), filename);
    };

    InsertImageFileView.prototype.resolveImagePath = function(file) {
      var absolutePath, relativePath;
      if (!file) {
        return "";
      }
      if (utils.isUrl(file) || fs.existsSync(file)) {
        return file;
      }
      absolutePath = path.join(this.siteLocalDir(), file);
      if (fs.existsSync(absolutePath)) {
        return absolutePath;
      }
      relativePath = path.join(this.currentFileDir(), file);
      if (fs.existsSync(relativePath)) {
        return relativePath;
      }
      return file;
    };

    InsertImageFileView.prototype.generateImageSrc = function(file) {
      return utils.normalizeFilePath(this._generateImageSrc(file));
    };

    InsertImageFileView.prototype._generateImageSrc = function(file) {
      if (!file) {
        return "";
      }
      if (utils.isUrl(file)) {
        return file;
      }
      if (config.get('relativeImagePath')) {
        return path.relative(this.currentFileDir(), file);
      }
      if (this.isInSiteDir(file)) {
        return path.relative(this.siteLocalDir(), file);
      }
      return path.join("/", this.siteImagesDir(), path.basename(file));
    };

    InsertImageFileView.prototype.generateRelativeImageSrc = function(file, basePath) {
      return utils.normalizeFilePath(this._generateRelativeImageSrc(file, basePath));
    };

    InsertImageFileView.prototype._generateRelativeImageSrc = function(file, basePath) {
      if (!file) {
        return "";
      }
      if (utils.isUrl(file)) {
        return file;
      }
      return path.relative(basePath || "~", file);
    };

    return InsertImageFileView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL3ZpZXdzL2luc2VydC1pbWFnZS1maWxlLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxtSkFBQTtJQUFBOzs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLE1BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUQsRUFBSSxlQUFKLEVBQVU7O0VBQ1YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBQ1QsTUFBQSxHQUFTLE1BQU0sQ0FBQyxNQUFQLElBQWlCLE1BQU0sQ0FBQyxPQUFQLENBQWUsUUFBZjs7RUFFMUIsTUFBQSxHQUFTLE9BQUEsQ0FBUSxXQUFSOztFQUNULEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUjs7RUFDUixjQUFBLEdBQWlCLE9BQUEsQ0FBUSw0QkFBUjs7RUFFakIsa0JBQUEsR0FBcUI7O0VBRXJCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixtQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sd0NBQVA7T0FBTCxFQUFzRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDcEQsS0FBQyxDQUFBLEtBQUQsQ0FBTyxjQUFQLEVBQXVCO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx5QkFBUDtXQUF2QjtVQUNBLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQTtZQUNILEtBQUMsQ0FBQSxLQUFELENBQU8sa0JBQVAsRUFBMkI7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7YUFBM0I7WUFDQSxL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LEtBQVA7O0FBQ0EsYUFBTyxJQUFJLENBQUMsUUFBTCxDQUFjLFFBQUEsSUFBWSxHQUExQixFQUErQixJQUEvQjtJQUhrQjs7OztLQXBQSztBQWRsQyIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVmlldywgVGV4dEVkaXRvclZpZXd9ID0gcmVxdWlyZSBcImF0b20tc3BhY2UtcGVuLXZpZXdzXCJcbnBhdGggPSByZXF1aXJlIFwicGF0aFwiXG5mcyA9IHJlcXVpcmUgXCJmcy1wbHVzXCJcbnJlbW90ZSA9IHJlcXVpcmUgXCJyZW1vdGVcIlxuZGlhbG9nID0gcmVtb3RlLmRpYWxvZyB8fCByZW1vdGUucmVxdWlyZSBcImRpYWxvZ1wiXG5cbmNvbmZpZyA9IHJlcXVpcmUgXCIuLi9jb25maWdcIlxudXRpbHMgPSByZXF1aXJlIFwiLi4vdXRpbHNcIlxudGVtcGxhdGVIZWxwZXIgPSByZXF1aXJlIFwiLi4vaGVscGVycy90ZW1wbGF0ZS1oZWxwZXJcIlxuXG5sYXN0SW5zZXJ0SW1hZ2VEaXIgPSBudWxsICMgcmVtZW1iZXIgbGFzdCBpbnNlcnRlZCBpbWFnZSBkaXJlY3RvcnlcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSW5zZXJ0SW1hZ2VGaWxlVmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogXCJtYXJrZG93bi13cml0ZXIgbWFya2Rvd24td3JpdGVyLWRpYWxvZ1wiLCA9PlxuICAgICAgQGxhYmVsIFwiSW5zZXJ0IEltYWdlXCIsIGNsYXNzOiBcImljb24gaWNvbi1kZXZpY2UtY2FtZXJhXCJcbiAgICAgIEBkaXYgPT5cbiAgICAgICAgQGxhYmVsIFwiSW1hZ2UgUGF0aCAoc3JjKVwiLCBjbGFzczogXCJtZXNzYWdlXCJcbiAgICAgICAgQHN1YnZpZXcgXCJpbWFnZUVkaXRvclwiLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgICAgQGRpdiBjbGFzczogXCJkaWFsb2ctcm93XCIsID0+XG4gICAgICAgICAgQGJ1dHRvbiBcIkNob29zZSBMb2NhbCBJbWFnZVwiLCBvdXRsZXQ6IFwib3BlbkltYWdlQnV0dG9uXCIsIGNsYXNzOiBcImJ0blwiXG4gICAgICAgICAgQGxhYmVsIG91dGxldDogXCJtZXNzYWdlXCIsIGNsYXNzOiBcInNpZGUtbGFiZWxcIlxuICAgICAgICBAbGFiZWwgXCJUaXRsZSAoYWx0KVwiLCBjbGFzczogXCJtZXNzYWdlXCJcbiAgICAgICAgQHN1YnZpZXcgXCJ0aXRsZUVkaXRvclwiLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgICAgQGRpdiBjbGFzczogXCJjb2wtMVwiLCA9PlxuICAgICAgICAgIEBsYWJlbCBcIldpZHRoIChweClcIiwgY2xhc3M6IFwibWVzc2FnZVwiXG4gICAgICAgICAgQHN1YnZpZXcgXCJ3aWR0aEVkaXRvclwiLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgICAgQGRpdiBjbGFzczogXCJjb2wtMVwiLCA9PlxuICAgICAgICAgIEBsYWJlbCBcIkhlaWdodCAocHgpXCIsIGNsYXNzOiBcIm1lc3NhZ2VcIlxuICAgICAgICAgIEBzdWJ2aWV3IFwiaGVpZ2h0RWRpdG9yXCIsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuICAgICAgICBAZGl2IGNsYXNzOiBcImNvbC0yXCIsID0+XG4gICAgICAgICAgQGxhYmVsIFwiQWxpZ25tZW50XCIsIGNsYXNzOiBcIm1lc3NhZ2VcIlxuICAgICAgICAgIEBzdWJ2aWV3IFwiYWxpZ25FZGl0b3JcIiwgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUpXG4gICAgICBAZGl2IG91dGxldDogXCJjb3B5SW1hZ2VQYW5lbFwiLCBjbGFzczogXCJoaWRkZW4gZGlhbG9nLXJvd1wiLCA9PlxuICAgICAgICBAbGFiZWwgZm9yOiBcIm1hcmtkb3duLXdyaXRlci1jb3B5LWltYWdlLWNoZWNrYm94XCIsID0+XG4gICAgICAgICAgQGlucHV0IGlkOiBcIm1hcmtkb3duLXdyaXRlci1jb3B5LWltYWdlLWNoZWNrYm94XCIsXG4gICAgICAgICAgICB0eXBlOlwiY2hlY2tib3hcIiwgb3V0bGV0OiBcImNvcHlJbWFnZUNoZWNrYm94XCJcbiAgICAgICAgICBAc3BhbiBcIkNvcHkgSW1hZ2UgVG86IE1pc3NpbmcgSW1hZ2UgUGF0aCAoc3JjKSBvciBUaXRsZSAoYWx0KVwiLCBjbGFzczogXCJzaWRlLWxhYmVsXCIsIG91dGxldDogXCJjb3B5SW1hZ2VNZXNzYWdlXCJcbiAgICAgIEBkaXYgY2xhc3M6IFwiaW1hZ2UtY29udGFpbmVyXCIsID0+XG4gICAgICAgIEBpbWcgb3V0bGV0OiAnaW1hZ2VQcmV2aWV3J1xuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgdXRpbHMuc2V0VGFiSW5kZXgoW0BpbWFnZUVkaXRvciwgQG9wZW5JbWFnZUJ1dHRvbiwgQHRpdGxlRWRpdG9yLFxuICAgICAgQHdpZHRoRWRpdG9yLCBAaGVpZ2h0RWRpdG9yLCBAYWxpZ25FZGl0b3IsIEBjb3B5SW1hZ2VDaGVja2JveF0pXG5cbiAgICBAaW1hZ2VFZGl0b3Iub24gXCJibHVyXCIsID0+XG4gICAgICBmaWxlID0gQGltYWdlRWRpdG9yLmdldFRleHQoKS50cmltKClcbiAgICAgIEB1cGRhdGVJbWFnZVNvdXJjZShmaWxlKVxuICAgICAgQHVwZGF0ZUNvcHlJbWFnZURlc3QoZmlsZSlcbiAgICBAdGl0bGVFZGl0b3Iub24gXCJibHVyXCIsID0+XG4gICAgICBAdXBkYXRlQ29weUltYWdlRGVzdChAaW1hZ2VFZGl0b3IuZ2V0VGV4dCgpLnRyaW0oKSlcbiAgICBAb3BlbkltYWdlQnV0dG9uLm9uIFwiY2xpY2tcIiwgPT4gQG9wZW5JbWFnZURpYWxvZygpXG5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgQGRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgIEBlbGVtZW50LCB7XG4gICAgICAgIFwiY29yZTpjb25maXJtXCI6ID0+IEBvbkNvbmZpcm0oKSxcbiAgICAgICAgXCJjb3JlOmNhbmNlbFwiOiAgPT4gQGRldGFjaCgpXG4gICAgICB9KSlcblxuICBvbkNvbmZpcm06IC0+XG4gICAgaW1nU291cmNlID0gQGltYWdlRWRpdG9yLmdldFRleHQoKS50cmltKClcbiAgICByZXR1cm4gdW5sZXNzIGltZ1NvdXJjZVxuXG4gICAgY2FsbGJhY2sgPSA9PlxuICAgICAgQGVkaXRvci50cmFuc2FjdCA9PiBAaW5zZXJ0SW1hZ2VUYWcoKVxuICAgICAgQGRldGFjaCgpXG5cbiAgICBpZiAhQGNvcHlJbWFnZUNoZWNrYm94Lmhhc0NsYXNzKCdoaWRkZW4nKSAmJiBAY29weUltYWdlQ2hlY2tib3gucHJvcChcImNoZWNrZWRcIilcbiAgICAgIEBjb3B5SW1hZ2UoQHJlc29sdmVJbWFnZVBhdGgoaW1nU291cmNlKSwgY2FsbGJhY2spXG4gICAgZWxzZVxuICAgICAgY2FsbGJhY2soKVxuXG4gIGRpc3BsYXk6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcywgdmlzaWJsZTogZmFsc2UpXG4gICAgQHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9ICQoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICBAZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQGZyb250TWF0dGVyID0gdGVtcGxhdGVIZWxwZXIuZ2V0RWRpdG9yKEBlZGl0b3IpXG4gICAgQGRhdGVUaW1lID0gdGVtcGxhdGVIZWxwZXIuZ2V0RGF0ZVRpbWUoKVxuICAgIEBzZXRGaWVsZHNGcm9tU2VsZWN0aW9uKClcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQGltYWdlRWRpdG9yLmZvY3VzKClcblxuICBkZXRhY2g6IC0+XG4gICAgaWYgQHBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICBAcGFuZWwuaGlkZSgpXG4gICAgICBAcHJldmlvdXNseUZvY3VzZWRFbGVtZW50Py5mb2N1cygpXG4gICAgc3VwZXJcblxuICBkZXRhY2hlZDogLT5cbiAgICBAZGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIEBkaXNwb3NhYmxlcyA9IG51bGxcblxuICBzZXRGaWVsZHNGcm9tU2VsZWN0aW9uOiAtPlxuICAgIEByYW5nZSA9IHV0aWxzLmdldFRleHRCdWZmZXJSYW5nZShAZWRpdG9yLCBcImxpbmtcIilcbiAgICBzZWxlY3Rpb24gPSBAZWRpdG9yLmdldFRleHRJblJhbmdlKEByYW5nZSlcbiAgICByZXR1cm4gdW5sZXNzIHNlbGVjdGlvblxuXG4gICAgaWYgdXRpbHMuaXNJbWFnZShzZWxlY3Rpb24pXG4gICAgICBpbWcgPSB1dGlscy5wYXJzZUltYWdlKHNlbGVjdGlvbilcbiAgICBlbHNlIGlmIHV0aWxzLmlzSW1hZ2VUYWcoc2VsZWN0aW9uKVxuICAgICAgaW1nID0gdXRpbHMucGFyc2VJbWFnZVRhZyhzZWxlY3Rpb24pXG4gICAgZWxzZVxuICAgICAgaW1nID0geyBhbHQ6IHNlbGVjdGlvbiB9XG5cbiAgICBAdGl0bGVFZGl0b3Iuc2V0VGV4dChpbWcuYWx0IHx8IFwiXCIpXG4gICAgQHdpZHRoRWRpdG9yLnNldFRleHQoaW1nLndpZHRoIHx8IFwiXCIpXG4gICAgQGhlaWdodEVkaXRvci5zZXRUZXh0KGltZy5oZWlnaHQgfHwgXCJcIilcbiAgICBAaW1hZ2VFZGl0b3Iuc2V0VGV4dChpbWcuc3JjIHx8IFwiXCIpXG5cbiAgICBAdXBkYXRlSW1hZ2VTb3VyY2UoaW1nLnNyYylcblxuICBvcGVuSW1hZ2VEaWFsb2c6IC0+XG4gICAgZmlsZXMgPSBkaWFsb2cuc2hvd09wZW5EaWFsb2dcbiAgICAgIHByb3BlcnRpZXM6IFsnb3BlbkZpbGUnXVxuICAgICAgZGVmYXVsdFBhdGg6IGxhc3RJbnNlcnRJbWFnZURpciB8fCBAc2l0ZUxvY2FsRGlyKClcbiAgICByZXR1cm4gdW5sZXNzIGZpbGVzICYmIGZpbGVzLmxlbmd0aCA+IDBcblxuICAgIEBpbWFnZUVkaXRvci5zZXRUZXh0KGZpbGVzWzBdKVxuICAgIEB1cGRhdGVJbWFnZVNvdXJjZShmaWxlc1swXSlcblxuICAgIGxhc3RJbnNlcnRJbWFnZURpciA9IHBhdGguZGlybmFtZShmaWxlc1swXSkgdW5sZXNzIHV0aWxzLmlzVXJsKGZpbGVzWzBdKVxuICAgIEB0aXRsZUVkaXRvci5mb2N1cygpXG5cbiAgdXBkYXRlSW1hZ2VTb3VyY2U6IChmaWxlKSAtPlxuICAgIHJldHVybiB1bmxlc3MgZmlsZVxuICAgIEBkaXNwbGF5SW1hZ2VQcmV2aWV3KGZpbGUpXG5cbiAgICBpZiB1dGlscy5pc1VybChmaWxlKSB8fCBAaXNJblNpdGVEaXIoQHJlc29sdmVJbWFnZVBhdGgoZmlsZSkpXG4gICAgICBAY29weUltYWdlUGFuZWwuYWRkQ2xhc3MoXCJoaWRkZW5cIilcbiAgICBlbHNlXG4gICAgICBAY29weUltYWdlUGFuZWwucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIilcblxuICB1cGRhdGVDb3B5SW1hZ2VEZXN0OiAoZmlsZSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIGZpbGVcbiAgICBkZXN0RmlsZSA9IEBnZXRDb3BpZWRJbWFnZURlc3RQYXRoKGZpbGUsIEB0aXRsZUVkaXRvci5nZXRUZXh0KCkpXG4gICAgQGNvcHlJbWFnZU1lc3NhZ2UudGV4dChcIkNvcHkgSW1hZ2UgVG86ICN7ZGVzdEZpbGV9XCIpXG5cbiAgZGlzcGxheUltYWdlUHJldmlldzogKGZpbGUpIC0+XG4gICAgcmV0dXJuIGlmIEBpbWFnZU9uUHJldmlldyA9PSBmaWxlXG5cbiAgICBpZiB1dGlscy5pc0ltYWdlRmlsZShmaWxlKVxuICAgICAgQG1lc3NhZ2UudGV4dChcIk9wZW5pbmcgSW1hZ2UgUHJldmlldyAuLi5cIilcbiAgICAgIEBpbWFnZVByZXZpZXcuYXR0cihcInNyY1wiLCBAcmVzb2x2ZUltYWdlUGF0aChmaWxlKSlcbiAgICAgIEBpbWFnZVByZXZpZXcubG9hZCA9PlxuICAgICAgICBAbWVzc2FnZS50ZXh0KFwiXCIpXG4gICAgICAgIEBzZXRJbWFnZUNvbnRleHQoKVxuICAgICAgQGltYWdlUHJldmlldy5lcnJvciA9PlxuICAgICAgICBAbWVzc2FnZS50ZXh0KFwiRXJyb3I6IEZhaWxlZCB0byBMb2FkIEltYWdlLlwiKVxuICAgICAgICBAaW1hZ2VQcmV2aWV3LmF0dHIoXCJzcmNcIiwgXCJcIilcbiAgICBlbHNlXG4gICAgICBAbWVzc2FnZS50ZXh0KFwiRXJyb3I6IEludmFsaWQgSW1hZ2UgRmlsZS5cIikgaWYgZmlsZVxuICAgICAgQGltYWdlUHJldmlldy5hdHRyKFwic3JjXCIsIFwiXCIpXG4gICAgICBAd2lkdGhFZGl0b3Iuc2V0VGV4dChcIlwiKVxuICAgICAgQGhlaWdodEVkaXRvci5zZXRUZXh0KFwiXCIpXG4gICAgICBAYWxpZ25FZGl0b3Iuc2V0VGV4dChcIlwiKVxuXG4gICAgQGltYWdlT25QcmV2aWV3ID0gZmlsZSAjIGNhY2hlIHByZXZpZXcgaW1hZ2Ugc3JjXG5cbiAgc2V0SW1hZ2VDb250ZXh0OiAtPlxuICAgIHsgbmF0dXJhbFdpZHRoLCBuYXR1cmFsSGVpZ2h0IH0gPSBAaW1hZ2VQcmV2aWV3LmNvbnRleHRcbiAgICBAd2lkdGhFZGl0b3Iuc2V0VGV4dChcIlwiICsgbmF0dXJhbFdpZHRoKVxuICAgIEBoZWlnaHRFZGl0b3Iuc2V0VGV4dChcIlwiICsgbmF0dXJhbEhlaWdodClcblxuICAgIHBvc2l0aW9uID0gaWYgbmF0dXJhbFdpZHRoID4gMzAwIHRoZW4gXCJjZW50ZXJcIiBlbHNlIFwicmlnaHRcIlxuICAgIEBhbGlnbkVkaXRvci5zZXRUZXh0KHBvc2l0aW9uKVxuXG4gIGluc2VydEltYWdlVGFnOiAtPlxuICAgIGltZ1NvdXJjZSA9IEBpbWFnZUVkaXRvci5nZXRUZXh0KCkudHJpbSgpXG4gICAgaW1nID1cbiAgICAgIHJhd1NyYzogaW1nU291cmNlLFxuICAgICAgc3JjOiBAZ2VuZXJhdGVJbWFnZVNyYyhpbWdTb3VyY2UpXG4gICAgICByZWxhdGl2ZUZpbGVTcmM6IEBnZW5lcmF0ZVJlbGF0aXZlSW1hZ2VTcmMoaW1nU291cmNlLCBAY3VycmVudEZpbGVEaXIoKSlcbiAgICAgIHJlbGF0aXZlU2l0ZVNyYzogQGdlbmVyYXRlUmVsYXRpdmVJbWFnZVNyYyhpbWdTb3VyY2UsIEBzaXRlTG9jYWxEaXIoKSlcbiAgICAgIGFsdDogQHRpdGxlRWRpdG9yLmdldFRleHQoKVxuICAgICAgd2lkdGg6IEB3aWR0aEVkaXRvci5nZXRUZXh0KClcbiAgICAgIGhlaWdodDogQGhlaWdodEVkaXRvci5nZXRUZXh0KClcbiAgICAgIGFsaWduOiBAYWxpZ25FZGl0b3IuZ2V0VGV4dCgpXG5cbiAgICAjIGluc2VydCBpbWFnZSB0YWcgd2hlbiBpbWcuc3JjIGV4aXN0cywgb3RoZXJ3aXNlIGNvbnNpZGVyIHRoZSBpbWFnZSB3YXMgcmVtb3ZlZFxuICAgIGlmIGltZy5zcmNcbiAgICAgIHRleHQgPSB0ZW1wbGF0ZUhlbHBlci5jcmVhdGUoXCJpbWFnZVRhZ1wiLCBAZnJvbnRNYXR0ZXIsIEBkYXRlVGltZSwgaW1nKVxuICAgIGVsc2VcbiAgICAgIHRleHQgPSBpbWcuYWx0XG5cbiAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKEByYW5nZSwgdGV4dClcblxuICBjb3B5SW1hZ2U6IChmaWxlLCBjYWxsYmFjaykgLT5cbiAgICByZXR1cm4gY2FsbGJhY2soKSBpZiB1dGlscy5pc1VybChmaWxlKSB8fCAhZnMuZXhpc3RzU3luYyhmaWxlKVxuXG4gICAgdHJ5XG4gICAgICBkZXN0RmlsZSA9IEBnZXRDb3BpZWRJbWFnZURlc3RQYXRoKGZpbGUsIEB0aXRsZUVkaXRvci5nZXRUZXh0KCkpXG4gICAgICBwZXJmb3JtV3JpdGUgPSB0cnVlXG5cbiAgICAgIGlmIGZzLmV4aXN0c1N5bmMoZGVzdEZpbGUpXG4gICAgICAgIGNvbmZpcm1hdGlvbiA9IGF0b20uY29uZmlybVxuICAgICAgICAgIG1lc3NhZ2U6IFwiRmlsZSBhbHJlYWR5IGV4aXN0cyFcIlxuICAgICAgICAgIGRldGFpbGVkTWVzc2FnZTogXCJBbm90aGVyIGZpbGUgYWxyZWFkeSBleGlzdHMgYXQ6XFxuI3tkZXN0RmlsZX1cXG5EbyB5b3Ugd2FudCB0byBvdmVyd3JpdGUgaXQ/XCJcbiAgICAgICAgICBidXR0b25zOiBbXCJOb1wiLCBcIlllc1wiXVxuICAgICAgICBwZXJmb3JtV3JpdGUgPSAoY29uZmlybWF0aW9uID09IDEpXG5cbiAgICAgIGlmIHBlcmZvcm1Xcml0ZVxuICAgICAgICBmcy5jb3B5IGZpbGUsIGRlc3RGaWxlLCA9PlxuICAgICAgICAgIEBpbWFnZUVkaXRvci5zZXRUZXh0KGRlc3RGaWxlKVxuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICBjYXRjaCBlcnJvclxuICAgICAgYXRvbS5jb25maXJtXG4gICAgICAgIG1lc3NhZ2U6IFwiW01hcmtkb3duIFdyaXRlcl0gRXJyb3IhXCJcbiAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBcIkNvcHlpbmcgSW1hZ2U6XFxuI3tlcnJvci5tZXNzYWdlfVwiXG4gICAgICAgIGJ1dHRvbnM6IFsnT0snXVxuXG4gICMgZ2V0IHVzZXIncyBzaXRlIGxvY2FsIGRpcmVjdG9yeVxuICBzaXRlTG9jYWxEaXI6IC0+IHV0aWxzLmdldFNpdGVQYXRoKGNvbmZpZy5nZXQoXCJzaXRlTG9jYWxEaXJcIikpXG4gICMgZ2V0IHVzZXIncyBzaXRlIGltYWdlcyBkaXJlY3RvcnlcbiAgc2l0ZUltYWdlc0RpcjogLT4gdGVtcGxhdGVIZWxwZXIuY3JlYXRlKFwic2l0ZUltYWdlc0RpclwiLCBAZnJvbnRNYXR0ZXIsIEBkYXRlVGltZSlcbiAgIyBnZXQgY3VycmVudCBvcGVuIGZpbGUgZGlyZWN0b3J5XG4gIGN1cnJlbnRGaWxlRGlyOiAtPiBwYXRoLmRpcm5hbWUoQGVkaXRvci5nZXRQYXRoKCkgfHwgXCJcIilcbiAgIyBjaGVjayB0aGUgZmlsZSBpcyBpbiB0aGUgc2l0ZSBkaXJlY3RvcnlcbiAgaXNJblNpdGVEaXI6IChmaWxlKSAtPiBmaWxlICYmIGZpbGUuc3RhcnRzV2l0aChAc2l0ZUxvY2FsRGlyKCkpXG5cbiAgIyBnZXQgY29weSBpbWFnZSBkZXN0aW5hdGlvbiBmaWxlIHBhdGhcbiAgZ2V0Q29waWVkSW1hZ2VEZXN0UGF0aDogKGZpbGUsIHRpdGxlKSAtPlxuICAgIGZpbGVuYW1lID0gcGF0aC5iYXNlbmFtZShmaWxlKVxuXG4gICAgaWYgY29uZmlnLmdldChcInJlbmFtZUltYWdlT25Db3B5XCIpICYmIHRpdGxlXG4gICAgICBleHRlbnNpb24gPSBwYXRoLmV4dG5hbWUoZmlsZSlcbiAgICAgIHRpdGxlID0gdXRpbHMuc2x1Z2l6ZSh0aXRsZSwgY29uZmlnLmdldCgnc2x1Z1NlcGFyYXRvcicpKVxuICAgICAgZmlsZW5hbWUgPSBcIiN7dGl0bGV9I3tleHRlbnNpb259XCJcblxuICAgIHBhdGguam9pbihAc2l0ZUxvY2FsRGlyKCksIEBzaXRlSW1hZ2VzRGlyKCksIGZpbGVuYW1lKVxuXG4gICMgdHJ5IHRvIHJlc29sdmUgZmlsZSB0byBhIHZhbGlkIHNyYyB0aGF0IGNvdWxkIGJlIGRpc3BsYXllZFxuICByZXNvbHZlSW1hZ2VQYXRoOiAoZmlsZSkgLT5cbiAgICByZXR1cm4gXCJcIiB1bmxlc3MgZmlsZVxuICAgIHJldHVybiBmaWxlIGlmIHV0aWxzLmlzVXJsKGZpbGUpIHx8IGZzLmV4aXN0c1N5bmMoZmlsZSlcbiAgICBhYnNvbHV0ZVBhdGggPSBwYXRoLmpvaW4oQHNpdGVMb2NhbERpcigpLCBmaWxlKVxuICAgIHJldHVybiBhYnNvbHV0ZVBhdGggaWYgZnMuZXhpc3RzU3luYyhhYnNvbHV0ZVBhdGgpXG4gICAgcmVsYXRpdmVQYXRoID0gcGF0aC5qb2luKEBjdXJyZW50RmlsZURpcigpLCBmaWxlKVxuICAgIHJldHVybiByZWxhdGl2ZVBhdGggaWYgZnMuZXhpc3RzU3luYyhyZWxhdGl2ZVBhdGgpXG4gICAgcmV0dXJuIGZpbGUgIyBmYWxsYmFjayB0byBub3QgcmVzb2x2ZVxuXG4gICMgZ2VuZXJhdGUgYSBzcmMgdGhhdCBpcyB1c2VkIGluIG1hcmtkb3duIGZpbGUgYmFzZWQgb24gdXNlciBjb25maWd1cmF0aW9uIG9yIGZpbGUgbG9jYXRpb25cbiAgZ2VuZXJhdGVJbWFnZVNyYzogKGZpbGUpIC0+XG4gICAgdXRpbHMubm9ybWFsaXplRmlsZVBhdGgoQF9nZW5lcmF0ZUltYWdlU3JjKGZpbGUpKVxuXG4gIF9nZW5lcmF0ZUltYWdlU3JjOiAoZmlsZSkgLT5cbiAgICByZXR1cm4gXCJcIiB1bmxlc3MgZmlsZVxuICAgIHJldHVybiBmaWxlIGlmIHV0aWxzLmlzVXJsKGZpbGUpXG4gICAgcmV0dXJuIHBhdGgucmVsYXRpdmUoQGN1cnJlbnRGaWxlRGlyKCksIGZpbGUpIGlmIGNvbmZpZy5nZXQoJ3JlbGF0aXZlSW1hZ2VQYXRoJylcbiAgICByZXR1cm4gcGF0aC5yZWxhdGl2ZShAc2l0ZUxvY2FsRGlyKCksIGZpbGUpIGlmIEBpc0luU2l0ZURpcihmaWxlKVxuICAgIHJldHVybiBwYXRoLmpvaW4oXCIvXCIsIEBzaXRlSW1hZ2VzRGlyKCksIHBhdGguYmFzZW5hbWUoZmlsZSkpXG5cbiAgIyBnZW5lcmF0ZSBhIHJlbGF0aXZlIHNyYyBmcm9tIHRoZSBiYXNlIHBhdGggb3IgZnJvbSB1c2VyJ3MgaG9tZSBkaXJlY3RvcnlcbiAgZ2VuZXJhdGVSZWxhdGl2ZUltYWdlU3JjOiAoZmlsZSwgYmFzZVBhdGgpIC0+XG4gICAgdXRpbHMubm9ybWFsaXplRmlsZVBhdGgoQF9nZW5lcmF0ZVJlbGF0aXZlSW1hZ2VTcmMoZmlsZSwgYmFzZVBhdGgpKVxuXG4gIF9nZW5lcmF0ZVJlbGF0aXZlSW1hZ2VTcmM6IChmaWxlLCBiYXNlUGF0aCkgLT5cbiAgICByZXR1cm4gXCJcIiB1bmxlc3MgZmlsZVxuICAgIHJldHVybiBmaWxlIGlmIHV0aWxzLmlzVXJsKGZpbGUpXG4gICAgcmV0dXJuIHBhdGgucmVsYXRpdmUoYmFzZVBhdGggfHwgXCJ+XCIsIGZpbGUpXG4iXX0=
