(function() {
  var $, CompositeDisposable, InsertImageClipboardView, TextEditorView, View, clipboard, config, fs, path, ref, templateHelper, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View, TextEditorView = ref.TextEditorView;

  path = require("path");

  fs = require("fs-plus");

  clipboard = require('clipboard');

  config = require("../config");

  utils = require("../utils");

  templateHelper = require("../helpers/template-helper");

  module.exports = InsertImageClipboardView = (function(superClass) {
    extend(InsertImageClipboardView, superClass);

    function InsertImageClipboardView() {
      return InsertImageClipboardView.__super__.constructor.apply(this, arguments);
    }

    InsertImageClipboardView.content = function() {
      return this.div({
        "class": "markdown-writer markdown-writer-dialog"
      }, (function(_this) {
        return function() {
          _this.label("Insert Image from Clipboard", {
            "class": "icon icon-clippy"
          });
          _this.div(function() {
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
            "class": "dialog-row"
          }, function() {
            return _this.span("Save Image To: Missing Title (alt)", {
              outlet: "copyImageMessage"
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

    InsertImageClipboardView.prototype.initialize = function() {
      utils.setTabIndex([this.titleEditor, this.widthEditor, this.heightEditor, this.alignEditor]);
      this.titleEditor.on("keyup", (function(_this) {
        return function() {
          return _this.updateCopyImageDest();
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

    InsertImageClipboardView.prototype.onConfirm = function() {
      var confirmation, destFile, error, title;
      title = this.titleEditor.getText().trim();
      if (!title) {
        return;
      }
      try {
        destFile = this.getCopiedImageDestPath(title);
        if (fs.existsSync(destFile)) {
          confirmation = atom.confirm({
            message: "File already exists!",
            detailedMessage: "Another file already exists at:\n" + destFile + "\nDo you want to overwrite it?",
            buttons: ["No", "Yes"]
          });
          if (confirmation === 0) {
            this.titleEditor.focus();
            return;
          }
        }
        fs.writeFileSync(destFile, this.clipboardImage.toPng());
        clipboard.writeText(destFile);
        this.editor.transact((function(_this) {
          return function() {
            return _this.insertImageTag(destFile);
          };
        })(this));
        return this.detach();
      } catch (error1) {
        error = error1;
        return atom.confirm({
          message: "[Markdown Writer] Error!",
          detailedMessage: "Saving Image:\n" + error.message,
          buttons: ['OK']
        });
      }
    };

    InsertImageClipboardView.prototype.display = function(e) {
      this.clipboardImage = clipboard.readImage();
      if (this.clipboardImage.isEmpty()) {
        e.abortKeyBinding();
        return;
      }
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
      this.setImageContext();
      this.displayImagePreview();
      this.panel.show();
      return this.titleEditor.focus();
    };

    InsertImageClipboardView.prototype.detach = function() {
      var ref1;
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((ref1 = this.previouslyFocusedElement) != null) {
          ref1.focus();
        }
      }
      return InsertImageClipboardView.__super__.detach.apply(this, arguments);
    };

    InsertImageClipboardView.prototype.detached = function() {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.disposables = null;
    };

    InsertImageClipboardView.prototype.setImageContext = function() {
      var height, position, ref1, width;
      ref1 = this.clipboardImage.getSize(), width = ref1.width, height = ref1.height;
      this.widthEditor.setText("" + width);
      this.heightEditor.setText("" + height);
      position = width > 300 ? "center" : "right";
      return this.alignEditor.setText(position);
    };

    InsertImageClipboardView.prototype.updateCopyImageDest = function() {
      var destFile, title;
      title = this.titleEditor.getText().trim();
      if (title) {
        destFile = this.getCopiedImageDestPath(title);
        return this.copyImageMessage.text("Save Image To: " + destFile);
      } else {
        return this.copyImageMessage.text("Save Image To: Missing Title (alt)");
      }
    };

    InsertImageClipboardView.prototype.displayImagePreview = function() {
      this.imagePreview.attr("src", this.clipboardImage.toDataURL());
      return this.imagePreview.error(function() {
        return console.log("Error: Failed to Load Image.");
      });
    };

    InsertImageClipboardView.prototype.insertImageTag = function(imgSource) {
      var img, text;
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
      return this.editor.insertText(text);
    };

    InsertImageClipboardView.prototype.siteLocalDir = function() {
      return utils.getSitePath(config.get("siteLocalDir"));
    };

    InsertImageClipboardView.prototype.siteImagesDir = function() {
      return templateHelper.create("siteImagesDir", this.frontMatter, this.dateTime);
    };

    InsertImageClipboardView.prototype.currentFileDir = function() {
      return path.dirname(this.editor.getPath() || "");
    };

    InsertImageClipboardView.prototype.isInSiteDir = function(file) {
      return file && file.startsWith(this.siteLocalDir());
    };

    InsertImageClipboardView.prototype.getCopiedImageDestPath = function(title) {
      var extension, filename;
      extension = ".png";
      if (!title) {
        title = (new Date()).toISOString().replace(/[:\.]/g, "-");
      }
      title = utils.slugize(title, config.get('slugSeparator'));
      filename = "" + title + extension;
      return path.join(this.siteLocalDir(), this.siteImagesDir(), filename);
    };

    InsertImageClipboardView.prototype.generateImageSrc = function(file) {
      return utils.normalizeFilePath(this._generateImageSrc(file));
    };

    InsertImageClipboardView.prototype._generateImageSrc = function(file) {
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

    InsertImageClipboardView.prototype.generateRelativeImageSrc = function(file, basePath) {
      return utils.normalizeFilePath(this._generateRelativeImageSrc(file, basePath));
    };

    InsertImageClipboardView.prototype._generateRelativeImageSrc = function(file, basePath) {
      if (!file) {
        return "";
      }
      if (utils.isUrl(file)) {
        return file;
      }
      return path.relative(basePath || "~", file);
    };

    return InsertImageClipboardView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL3ZpZXdzL2luc2VydC1pbWFnZS1jbGlwYm9hcmQtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLCtIQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBNEIsT0FBQSxDQUFRLHNCQUFSLENBQTVCLEVBQUMsU0FBRCxFQUFJLGVBQUosRUFBVTs7RUFDVixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLFNBQUEsR0FBWSxPQUFBLENBQVEsV0FBUjs7RUFFWixNQUFBLEdBQVMsT0FBQSxDQUFRLFdBQVI7O0VBQ1QsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSOztFQUNSLGNBQUEsR0FBaUIsT0FBQSxDQUFRLDRCQUFSOztFQUVqQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osd0JBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdDQUFQO09BQUwsRUFBc0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BELEtBQUMsQ0FBQSxLQUFELENBQU8sNkJBQVAsRUFBc0M7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGtCQUFQO1dBQXRDO1VBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSyxTQUFBO1lBQ0gsS0FBQyxDQUFBLEtBQUQsQ0FBTyxhQUFQLEVBQXNCO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO2FBQXRCO1lBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxhQUFULEVBQXdCLElBQUksY0FBSixDQUFtQjtjQUFBLElBQUEsRUFBTSxJQUFOO2FBQW5CLENBQXhC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aUJBQU4sQ0FBd0IsSUFBQyxDQUFBLHlCQUFELENBQTJCLElBQTNCLEVBQWlDLFFBQWpDLENBQXhCO0lBRHdCOzt1Q0FHMUIseUJBQUEsR0FBMkIsU0FBQyxJQUFELEVBQU8sUUFBUDtNQUN6QixJQUFBLENBQWlCLElBQWpCO0FBQUEsZUFBTyxHQUFQOztNQUNBLElBQWUsS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFaLENBQWY7QUFBQSxlQUFPLEtBQVA7O0FBQ0EsYUFBTyxJQUFJLENBQUMsUUFBTCxDQUFjLFFBQUEsSUFBWSxHQUExQixFQUErQixJQUEvQjtJQUhrQjs7OztLQW5LVTtBQVh2QyIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVmlldywgVGV4dEVkaXRvclZpZXd9ID0gcmVxdWlyZSBcImF0b20tc3BhY2UtcGVuLXZpZXdzXCJcbnBhdGggPSByZXF1aXJlIFwicGF0aFwiXG5mcyA9IHJlcXVpcmUgXCJmcy1wbHVzXCJcbmNsaXBib2FyZCA9IHJlcXVpcmUgJ2NsaXBib2FyZCdcblxuY29uZmlnID0gcmVxdWlyZSBcIi4uL2NvbmZpZ1wiXG51dGlscyA9IHJlcXVpcmUgXCIuLi91dGlsc1wiXG50ZW1wbGF0ZUhlbHBlciA9IHJlcXVpcmUgXCIuLi9oZWxwZXJzL3RlbXBsYXRlLWhlbHBlclwiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEluc2VydEltYWdlQ2xpcGJvYXJkVmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogXCJtYXJrZG93bi13cml0ZXIgbWFya2Rvd24td3JpdGVyLWRpYWxvZ1wiLCA9PlxuICAgICAgQGxhYmVsIFwiSW5zZXJ0IEltYWdlIGZyb20gQ2xpcGJvYXJkXCIsIGNsYXNzOiBcImljb24gaWNvbi1jbGlwcHlcIlxuICAgICAgQGRpdiA9PlxuICAgICAgICBAbGFiZWwgXCJUaXRsZSAoYWx0KVwiLCBjbGFzczogXCJtZXNzYWdlXCJcbiAgICAgICAgQHN1YnZpZXcgXCJ0aXRsZUVkaXRvclwiLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgICAgQGRpdiBjbGFzczogXCJjb2wtMVwiLCA9PlxuICAgICAgICAgIEBsYWJlbCBcIldpZHRoIChweClcIiwgY2xhc3M6IFwibWVzc2FnZVwiXG4gICAgICAgICAgQHN1YnZpZXcgXCJ3aWR0aEVkaXRvclwiLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgICAgQGRpdiBjbGFzczogXCJjb2wtMVwiLCA9PlxuICAgICAgICAgIEBsYWJlbCBcIkhlaWdodCAocHgpXCIsIGNsYXNzOiBcIm1lc3NhZ2VcIlxuICAgICAgICAgIEBzdWJ2aWV3IFwiaGVpZ2h0RWRpdG9yXCIsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuICAgICAgICBAZGl2IGNsYXNzOiBcImNvbC0yXCIsID0+XG4gICAgICAgICAgQGxhYmVsIFwiQWxpZ25tZW50XCIsIGNsYXNzOiBcIm1lc3NhZ2VcIlxuICAgICAgICAgIEBzdWJ2aWV3IFwiYWxpZ25FZGl0b3JcIiwgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUpXG4gICAgICBAZGl2IGNsYXNzOiBcImRpYWxvZy1yb3dcIiwgPT5cbiAgICAgICAgQHNwYW4gXCJTYXZlIEltYWdlIFRvOiBNaXNzaW5nIFRpdGxlIChhbHQpXCIsIG91dGxldDogXCJjb3B5SW1hZ2VNZXNzYWdlXCJcbiAgICAgIEBkaXYgY2xhc3M6IFwiaW1hZ2UtY29udGFpbmVyXCIsID0+XG4gICAgICAgIEBpbWcgb3V0bGV0OiAnaW1hZ2VQcmV2aWV3J1xuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgdXRpbHMuc2V0VGFiSW5kZXgoW0B0aXRsZUVkaXRvciwgQHdpZHRoRWRpdG9yLCBAaGVpZ2h0RWRpdG9yLCBAYWxpZ25FZGl0b3JdKVxuXG4gICAgQHRpdGxlRWRpdG9yLm9uIFwia2V5dXBcIiwgPT4gQHVwZGF0ZUNvcHlJbWFnZURlc3QoKVxuXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICBAZWxlbWVudCwge1xuICAgICAgICBcImNvcmU6Y29uZmlybVwiOiA9PiBAb25Db25maXJtKCksXG4gICAgICAgIFwiY29yZTpjYW5jZWxcIjogID0+IEBkZXRhY2goKVxuICAgICAgfSkpXG5cbiAgb25Db25maXJtOiAtPlxuICAgIHRpdGxlID0gQHRpdGxlRWRpdG9yLmdldFRleHQoKS50cmltKClcbiAgICByZXR1cm4gdW5sZXNzIHRpdGxlXG5cbiAgICB0cnlcbiAgICAgIGRlc3RGaWxlID0gQGdldENvcGllZEltYWdlRGVzdFBhdGgodGl0bGUpXG5cbiAgICAgIGlmIGZzLmV4aXN0c1N5bmMoZGVzdEZpbGUpXG4gICAgICAgIGNvbmZpcm1hdGlvbiA9IGF0b20uY29uZmlybVxuICAgICAgICAgIG1lc3NhZ2U6IFwiRmlsZSBhbHJlYWR5IGV4aXN0cyFcIlxuICAgICAgICAgIGRldGFpbGVkTWVzc2FnZTogXCJBbm90aGVyIGZpbGUgYWxyZWFkeSBleGlzdHMgYXQ6XFxuI3tkZXN0RmlsZX1cXG5EbyB5b3Ugd2FudCB0byBvdmVyd3JpdGUgaXQ/XCJcbiAgICAgICAgICBidXR0b25zOiBbXCJOb1wiLCBcIlllc1wiXVxuICAgICAgICAjIGFib3J0IG92ZXJ3cml0ZSBhbmQgZWRpdCB0aXRsZVxuICAgICAgICBpZiBjb25maXJtYXRpb24gPT0gMFxuICAgICAgICAgIEB0aXRsZUVkaXRvci5mb2N1cygpXG4gICAgICAgICAgcmV0dXJuXG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGVzdEZpbGUsIEBjbGlwYm9hcmRJbWFnZS50b1BuZygpKVxuICAgICAgIyB3cml0ZSBkZXN0IHBhdGggdG8gY2xpcGJvYXJkXG4gICAgICBjbGlwYm9hcmQud3JpdGVUZXh0KGRlc3RGaWxlKVxuXG4gICAgICBAZWRpdG9yLnRyYW5zYWN0ID0+IEBpbnNlcnRJbWFnZVRhZyhkZXN0RmlsZSlcbiAgICAgIEBkZXRhY2goKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICBhdG9tLmNvbmZpcm1cbiAgICAgICAgbWVzc2FnZTogXCJbTWFya2Rvd24gV3JpdGVyXSBFcnJvciFcIlxuICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6IFwiU2F2aW5nIEltYWdlOlxcbiN7ZXJyb3IubWVzc2FnZX1cIlxuICAgICAgICBidXR0b25zOiBbJ09LJ11cblxuICBkaXNwbGF5OiAoZSkgLT5cbiAgICAjIHJlYWQgaW1hZ2UgZnJvbSBjbGlwYm9hcmRcbiAgICBAY2xpcGJvYXJkSW1hZ2UgPSBjbGlwYm9hcmQucmVhZEltYWdlKClcbiAgICAjIHNraXAgYW5kIHJldHVyblxuICAgIGlmIEBjbGlwYm9hcmRJbWFnZS5pc0VtcHR5KClcbiAgICAgIGUuYWJvcnRLZXlCaW5kaW5nKClcbiAgICAgIHJldHVyblxuICAgICMgZGlzcGxheSB2aWV3XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcywgdmlzaWJsZTogZmFsc2UpXG4gICAgQHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9ICQoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICBAZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQGZyb250TWF0dGVyID0gdGVtcGxhdGVIZWxwZXIuZ2V0RWRpdG9yKEBlZGl0b3IpXG4gICAgQGRhdGVUaW1lID0gdGVtcGxhdGVIZWxwZXIuZ2V0RGF0ZVRpbWUoKVxuICAgICMgaW5pdGlhbGl6ZSB2aWV3XG4gICAgQHNldEltYWdlQ29udGV4dCgpXG4gICAgQGRpc3BsYXlJbWFnZVByZXZpZXcoKVxuICAgICMgc2hvdyB2aWV3XG4gICAgQHBhbmVsLnNob3coKVxuICAgIEB0aXRsZUVkaXRvci5mb2N1cygpXG5cbiAgZGV0YWNoOiAtPlxuICAgIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgQHBhbmVsLmhpZGUoKVxuICAgICAgQHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudD8uZm9jdXMoKVxuICAgIHN1cGVyXG5cbiAgZGV0YWNoZWQ6IC0+XG4gICAgQGRpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICBAZGlzcG9zYWJsZXMgPSBudWxsXG5cbiAgc2V0SW1hZ2VDb250ZXh0OiAtPlxuICAgIHsgd2lkdGgsIGhlaWdodCB9ID0gQGNsaXBib2FyZEltYWdlLmdldFNpemUoKVxuICAgIEB3aWR0aEVkaXRvci5zZXRUZXh0KFwiXCIgKyB3aWR0aClcbiAgICBAaGVpZ2h0RWRpdG9yLnNldFRleHQoXCJcIiArIGhlaWdodClcblxuICAgIHBvc2l0aW9uID0gaWYgd2lkdGggPiAzMDAgdGhlbiBcImNlbnRlclwiIGVsc2UgXCJyaWdodFwiXG4gICAgQGFsaWduRWRpdG9yLnNldFRleHQocG9zaXRpb24pXG5cbiAgdXBkYXRlQ29weUltYWdlRGVzdDogLT5cbiAgICB0aXRsZSA9IEB0aXRsZUVkaXRvci5nZXRUZXh0KCkudHJpbSgpXG4gICAgaWYgdGl0bGVcbiAgICAgIGRlc3RGaWxlID0gQGdldENvcGllZEltYWdlRGVzdFBhdGgodGl0bGUpXG4gICAgICBAY29weUltYWdlTWVzc2FnZS50ZXh0KFwiU2F2ZSBJbWFnZSBUbzogI3tkZXN0RmlsZX1cIilcbiAgICBlbHNlXG4gICAgICBAY29weUltYWdlTWVzc2FnZS50ZXh0KFwiU2F2ZSBJbWFnZSBUbzogTWlzc2luZyBUaXRsZSAoYWx0KVwiKVxuXG4gIGRpc3BsYXlJbWFnZVByZXZpZXc6IC0+XG4gICAgQGltYWdlUHJldmlldy5hdHRyKFwic3JjXCIsIEBjbGlwYm9hcmRJbWFnZS50b0RhdGFVUkwoKSlcbiAgICBAaW1hZ2VQcmV2aWV3LmVycm9yIC0+IGNvbnNvbGUubG9nKFwiRXJyb3I6IEZhaWxlZCB0byBMb2FkIEltYWdlLlwiKVxuXG4gIGluc2VydEltYWdlVGFnOiAoaW1nU291cmNlKSAtPlxuICAgIGltZyA9XG4gICAgICByYXdTcmM6IGltZ1NvdXJjZSxcbiAgICAgIHNyYzogQGdlbmVyYXRlSW1hZ2VTcmMoaW1nU291cmNlKVxuICAgICAgcmVsYXRpdmVGaWxlU3JjOiBAZ2VuZXJhdGVSZWxhdGl2ZUltYWdlU3JjKGltZ1NvdXJjZSwgQGN1cnJlbnRGaWxlRGlyKCkpXG4gICAgICByZWxhdGl2ZVNpdGVTcmM6IEBnZW5lcmF0ZVJlbGF0aXZlSW1hZ2VTcmMoaW1nU291cmNlLCBAc2l0ZUxvY2FsRGlyKCkpXG4gICAgICBhbHQ6IEB0aXRsZUVkaXRvci5nZXRUZXh0KClcbiAgICAgIHdpZHRoOiBAd2lkdGhFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBoZWlnaHQ6IEBoZWlnaHRFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBhbGlnbjogQGFsaWduRWRpdG9yLmdldFRleHQoKVxuXG4gICAgIyBpbnNlcnQgaW1hZ2UgdGFnIHdoZW4gaW1nLnNyYyBleGlzdHMsIG90aGVyd2lzZSBjb25zaWRlciB0aGUgaW1hZ2Ugd2FzIHJlbW92ZWRcbiAgICBpZiBpbWcuc3JjXG4gICAgICB0ZXh0ID0gdGVtcGxhdGVIZWxwZXIuY3JlYXRlKFwiaW1hZ2VUYWdcIiwgQGZyb250TWF0dGVyLCBAZGF0ZVRpbWUsIGltZylcbiAgICBlbHNlXG4gICAgICB0ZXh0ID0gaW1nLmFsdFxuXG4gICAgQGVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG5cbiAgIyBnZXQgdXNlcidzIHNpdGUgbG9jYWwgZGlyZWN0b3J5XG4gIHNpdGVMb2NhbERpcjogLT4gdXRpbHMuZ2V0U2l0ZVBhdGgoY29uZmlnLmdldChcInNpdGVMb2NhbERpclwiKSlcbiAgIyBnZXQgdXNlcidzIHNpdGUgaW1hZ2VzIGRpcmVjdG9yeVxuICBzaXRlSW1hZ2VzRGlyOiAtPiB0ZW1wbGF0ZUhlbHBlci5jcmVhdGUoXCJzaXRlSW1hZ2VzRGlyXCIsIEBmcm9udE1hdHRlciwgQGRhdGVUaW1lKVxuICAjIGdldCBjdXJyZW50IG9wZW4gZmlsZSBkaXJlY3RvcnlcbiAgY3VycmVudEZpbGVEaXI6IC0+IHBhdGguZGlybmFtZShAZWRpdG9yLmdldFBhdGgoKSB8fCBcIlwiKVxuICAjIGNoZWNrIHRoZSBmaWxlIGlzIGluIHRoZSBzaXRlIGRpcmVjdG9yeVxuICBpc0luU2l0ZURpcjogKGZpbGUpIC0+IGZpbGUgJiYgZmlsZS5zdGFydHNXaXRoKEBzaXRlTG9jYWxEaXIoKSlcblxuICAjIGdldCBjb3B5IGltYWdlIGRlc3RpbmF0aW9uIGZpbGUgcGF0aFxuICBnZXRDb3BpZWRJbWFnZURlc3RQYXRoOiAodGl0bGUpIC0+XG4gICAgZXh0ZW5zaW9uID0gXCIucG5nXCJcbiAgICB0aXRsZSA9IChuZXcgRGF0ZSgpKS50b0lTT1N0cmluZygpLnJlcGxhY2UoL1s6XFwuXS9nLCBcIi1cIikgdW5sZXNzIHRpdGxlXG4gICAgdGl0bGUgPSB1dGlscy5zbHVnaXplKHRpdGxlLCBjb25maWcuZ2V0KCdzbHVnU2VwYXJhdG9yJykpXG4gICAgZmlsZW5hbWUgPSBcIiN7dGl0bGV9I3tleHRlbnNpb259XCJcbiAgICBwYXRoLmpvaW4oQHNpdGVMb2NhbERpcigpLCBAc2l0ZUltYWdlc0RpcigpLCBmaWxlbmFtZSlcblxuICAjIGdlbmVyYXRlIGEgc3JjIHRoYXQgaXMgdXNlZCBpbiBtYXJrZG93biBmaWxlIGJhc2VkIG9uIHVzZXIgY29uZmlndXJhdGlvbiBvciBmaWxlIGxvY2F0aW9uXG4gIGdlbmVyYXRlSW1hZ2VTcmM6IChmaWxlKSAtPlxuICAgIHV0aWxzLm5vcm1hbGl6ZUZpbGVQYXRoKEBfZ2VuZXJhdGVJbWFnZVNyYyhmaWxlKSlcblxuICBfZ2VuZXJhdGVJbWFnZVNyYzogKGZpbGUpIC0+XG4gICAgcmV0dXJuIFwiXCIgdW5sZXNzIGZpbGVcbiAgICByZXR1cm4gZmlsZSBpZiB1dGlscy5pc1VybChmaWxlKVxuICAgIHJldHVybiBwYXRoLnJlbGF0aXZlKEBjdXJyZW50RmlsZURpcigpLCBmaWxlKSBpZiBjb25maWcuZ2V0KCdyZWxhdGl2ZUltYWdlUGF0aCcpXG4gICAgcmV0dXJuIHBhdGgucmVsYXRpdmUoQHNpdGVMb2NhbERpcigpLCBmaWxlKSBpZiBAaXNJblNpdGVEaXIoZmlsZSlcbiAgICByZXR1cm4gcGF0aC5qb2luKFwiL1wiLCBAc2l0ZUltYWdlc0RpcigpLCBwYXRoLmJhc2VuYW1lKGZpbGUpKVxuXG4gICMgZ2VuZXJhdGUgYSByZWxhdGl2ZSBzcmMgZnJvbSB0aGUgYmFzZSBwYXRoIG9yIGZyb20gdXNlcidzIGhvbWUgZGlyZWN0b3J5XG4gIGdlbmVyYXRlUmVsYXRpdmVJbWFnZVNyYzogKGZpbGUsIGJhc2VQYXRoKSAtPlxuICAgIHV0aWxzLm5vcm1hbGl6ZUZpbGVQYXRoKEBfZ2VuZXJhdGVSZWxhdGl2ZUltYWdlU3JjKGZpbGUsIGJhc2VQYXRoKSlcblxuICBfZ2VuZXJhdGVSZWxhdGl2ZUltYWdlU3JjOiAoZmlsZSwgYmFzZVBhdGgpIC0+XG4gICAgcmV0dXJuIFwiXCIgdW5sZXNzIGZpbGVcbiAgICByZXR1cm4gZmlsZSBpZiB1dGlscy5pc1VybChmaWxlKVxuICAgIHJldHVybiBwYXRoLnJlbGF0aXZlKGJhc2VQYXRoIHx8IFwiflwiLCBmaWxlKVxuIl19
