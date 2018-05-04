(function() {
  var $, CSON, CompositeDisposable, InsertLinkView, TextEditorView, View, config, fs, guid, helper, posts, ref, templateHelper, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View, TextEditorView = ref.TextEditorView;

  CSON = require("season");

  fs = require("fs-plus");

  guid = require("guid");

  config = require("../config");

  utils = require("../utils");

  helper = require("../helpers/insert-link-helper");

  templateHelper = require("../helpers/template-helper");

  posts = null;

  module.exports = InsertLinkView = (function(superClass) {
    extend(InsertLinkView, superClass);

    function InsertLinkView() {
      return InsertLinkView.__super__.constructor.apply(this, arguments);
    }

    InsertLinkView.content = function() {
      return this.div({
        "class": "markdown-writer markdown-writer-dialog"
      }, (function(_this) {
        return function() {
          _this.label("Insert Link", {
            "class": "icon icon-globe"
          });
          _this.div(function() {
            _this.label("Text to be displayed", {
              "class": "message"
            });
            _this.subview("textEditor", new TextEditorView({
              mini: true
            }));
            _this.label("Web Address", {
              "class": "message"
            });
            _this.subview("urlEditor", new TextEditorView({
              mini: true
            }));
            _this.label("Title", {
              "class": "message"
            });
            return _this.subview("titleEditor", new TextEditorView({
              mini: true
            }));
          });
          _this.div({
            "class": "dialog-row"
          }, function() {
            return _this.label({
              "for": "markdown-writer-save-link-checkbox"
            }, function() {
              _this.input({
                id: "markdown-writer-save-link-checkbox"
              }, {
                type: "checkbox",
                outlet: "saveCheckbox"
              });
              return _this.span("Automatically link to this text next time", {
                "class": "side-label"
              });
            });
          });
          return _this.div({
            outlet: "searchBox"
          }, function() {
            _this.label("Search Posts", {
              "class": "icon icon-search"
            });
            _this.subview("searchEditor", new TextEditorView({
              mini: true
            }));
            return _this.ul({
              "class": "markdown-writer-list",
              outlet: "searchResult"
            });
          });
        };
      })(this));
    };

    InsertLinkView.prototype.initialize = function() {
      utils.setTabIndex([this.textEditor, this.urlEditor, this.titleEditor, this.saveCheckbox, this.searchEditor]);
      this.searchEditor.getModel().onDidChange((function(_this) {
        return function() {
          if (posts) {
            return _this.updateSearch(_this.searchEditor.getText());
          }
        };
      })(this));
      this.searchResult.on("click", "li", (function(_this) {
        return function(e) {
          return _this.useSearchResult(e);
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

    InsertLinkView.prototype.onConfirm = function() {
      var link;
      link = {
        text: this.textEditor.getText(),
        url: this.urlEditor.getText().trim(),
        title: this.titleEditor.getText().trim()
      };
      this.editor.transact((function(_this) {
        return function() {
          if (link.url) {
            return _this.insertLink(link);
          } else {
            return _this.removeLink(link.text);
          }
        };
      })(this));
      this.updateSavedLinks(link);
      return this.detach();
    };

    InsertLinkView.prototype.display = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.editor = atom.workspace.getActiveTextEditor();
      this.panel.show();
      this.fetchPosts();
      return this.loadSavedLinks((function(_this) {
        return function() {
          _this._normalizeSelectionAndSetLinkFields();
          if (_this.textEditor.getText()) {
            _this.urlEditor.getModel().selectAll();
            return _this.urlEditor.focus();
          } else {
            return _this.textEditor.focus();
          }
        };
      })(this));
    };

    InsertLinkView.prototype.detach = function() {
      var ref1;
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((ref1 = this.previouslyFocusedElement) != null) {
          ref1.focus();
        }
      }
      return InsertLinkView.__super__.detach.apply(this, arguments);
    };

    InsertLinkView.prototype.detached = function() {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.disposables = null;
    };

    InsertLinkView.prototype._normalizeSelectionAndSetLinkFields = function() {
      this.range = utils.getTextBufferRange(this.editor, "link");
      this.currLink = this._findLinkInRange();
      this.referenceId = this.currLink.id;
      this.range = this.currLink.linkRange || this.range;
      this.definitionRange = this.currLink.definitionRange;
      this.setLink(this.currLink);
      return this.saveCheckbox.prop("checked", this.isInSavedLink(this.currLink));
    };

    InsertLinkView.prototype._findLinkInRange = function() {
      var link, selection;
      link = utils.findLinkInRange(this.editor, this.range);
      if (link != null) {
        if (!link.id) {
          return link;
        }
        if (link.id && link.linkRange && link.definitionRange) {
          return link;
        }
        link.id = null;
        return link;
      }
      selection = this.editor.getTextInRange(this.range);
      if (this.getSavedLink(selection)) {
        return this.getSavedLink(selection);
      }
      return {
        text: selection,
        url: "",
        title: ""
      };
    };

    InsertLinkView.prototype.updateSearch = function(query) {
      var results;
      if (!(query && posts)) {
        return;
      }
      query = query.trim().toLowerCase();
      results = posts.filter(function(post) {
        return post.title.toLowerCase().indexOf(query) >= 0;
      }).map(function(post) {
        return "<li data-url='" + post.url + "'>" + post.title + "</li>";
      });
      return this.searchResult.empty().append(results.join(""));
    };

    InsertLinkView.prototype.useSearchResult = function(e) {
      if (!this.textEditor.getText()) {
        this.textEditor.setText(e.target.textContent);
      }
      this.titleEditor.setText(e.target.textContent);
      this.urlEditor.setText(e.target.dataset.url);
      return this.titleEditor.focus();
    };

    InsertLinkView.prototype.insertLink = function(link) {
      if (this.definitionRange) {
        return this.updateReferenceLink(link);
      } else if (link.title) {
        return this.insertReferenceLink(link);
      } else {
        return this.insertInlineLink(link);
      }
    };

    InsertLinkView.prototype.insertInlineLink = function(link) {
      var text;
      text = templateHelper.create("linkInlineTag", link);
      return this.editor.setTextInBufferRange(this.range, text);
    };

    InsertLinkView.prototype.updateReferenceLink = function(link) {
      var definitionText, inlineLink, inlineText;
      if (link.title) {
        link = this._referenceLink(link);
        inlineText = templateHelper.create("referenceInlineTag", link);
        definitionText = templateHelper.create("referenceDefinitionTag", link);
        if (definitionText) {
          this.editor.setTextInBufferRange(this.range, inlineText);
          return this.editor.setTextInBufferRange(this.definitionRange, definitionText);
        } else {
          return this.replaceReferenceLink(inlineText);
        }
      } else {
        inlineLink = templateHelper.create("linkInlineTag", link);
        return this.replaceReferenceLink(inlineLink);
      }
    };

    InsertLinkView.prototype.insertReferenceLink = function(link) {
      var definitionText, inlineText;
      link = this._referenceLink(link);
      inlineText = templateHelper.create("referenceInlineTag", link);
      definitionText = templateHelper.create("referenceDefinitionTag", link);
      this.editor.setTextInBufferRange(this.range, inlineText);
      if (definitionText) {
        if (config.get("referenceInsertPosition") === "article") {
          return helper.insertAtEndOfArticle(this.editor, definitionText);
        } else {
          return helper.insertAfterCurrentParagraph(this.editor, definitionText);
        }
      }
    };

    InsertLinkView.prototype._referenceLink = function(link) {
      link['indent'] = " ".repeat(config.get("referenceIndentLength"));
      link['title'] = /^[-\*\!]$/.test(link.title) ? "" : link.title;
      link['label'] = this.referenceId || guid.raw().slice(0, 8);
      return link;
    };

    InsertLinkView.prototype.removeLink = function(text) {
      if (this.referenceId) {
        return this.replaceReferenceLink(text);
      } else {
        return this.editor.setTextInBufferRange(this.range, text);
      }
    };

    InsertLinkView.prototype.replaceReferenceLink = function(text) {
      var position;
      this.editor.setTextInBufferRange(this.range, text);
      position = this.editor.getCursorBufferPosition();
      helper.removeDefinitionRange(this.editor, this.definitionRange);
      return this.editor.setCursorBufferPosition(position);
    };

    InsertLinkView.prototype.setLink = function(link) {
      this.textEditor.setText(link.text);
      this.titleEditor.setText(link.title);
      return this.urlEditor.setText(link.url);
    };

    InsertLinkView.prototype.getSavedLink = function(text) {
      var link, ref1;
      link = (ref1 = this.links) != null ? ref1[text.toLowerCase()] : void 0;
      if (!link) {
        return link;
      }
      if (!link.text) {
        link["text"] = text;
      }
      return link;
    };

    InsertLinkView.prototype.isInSavedLink = function(link) {
      var savedLink;
      savedLink = this.getSavedLink(link.text);
      return !!savedLink && !(["text", "title", "url"].some(function(k) {
        return savedLink[k] !== link[k];
      }));
    };

    InsertLinkView.prototype.updateToLinks = function(link) {
      var inSavedLink, linkUpdated;
      linkUpdated = false;
      inSavedLink = this.isInSavedLink(link);
      if (this.saveCheckbox.prop("checked")) {
        if (!inSavedLink && link.url) {
          this.links[link.text.toLowerCase()] = link;
          linkUpdated = true;
        }
      } else if (inSavedLink) {
        delete this.links[link.text.toLowerCase()];
        linkUpdated = true;
      }
      return linkUpdated;
    };

    InsertLinkView.prototype.updateSavedLinks = function(link) {
      if (this.updateToLinks(link)) {
        return CSON.writeFile(config.get("siteLinkPath"), this.links);
      }
    };

    InsertLinkView.prototype.loadSavedLinks = function(callback) {
      return CSON.readFile(config.get("siteLinkPath"), (function(_this) {
        return function(err, data) {
          _this.links = data || {};
          return callback();
        };
      })(this));
    };

    InsertLinkView.prototype.fetchPosts = function() {
      var error, succeed;
      if (posts) {
        return (posts.length < 1 ? this.searchBox.hide() : void 0);
      }
      succeed = (function(_this) {
        return function(body) {
          posts = body.posts;
          if (posts.length > 0) {
            _this.searchBox.show();
            _this.searchEditor.setText(_this.textEditor.getText());
            return _this.updateSearch(_this.textEditor.getText());
          }
        };
      })(this);
      error = (function(_this) {
        return function(err) {
          return _this.searchBox.hide();
        };
      })(this);
      return utils.getJSON(config.get("urlForPosts"), succeed, error);
    };

    return InsertLinkView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL3ZpZXdzL2luc2VydC1saW5rLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwrSEFBQTtJQUFBOzs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLE1BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFNBQUQsRUFBSSxlQUFKLEVBQVU7O0VBQ1YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBQSxHQUFTLE9BQUEsQ0FBUSxXQUFSOztFQUNULEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUjs7RUFDUixNQUFBLEdBQVMsT0FBQSxDQUFRLCtCQUFSOztFQUNULGNBQUEsR0FBaUIsT0FBQSxDQUFRLDRCQUFSOztFQUVqQixLQUFBLEdBQVE7O0VBRVIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLGNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdDQUFQO09BQUwsRUFBc0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BELEtBQUMsQ0FBQSxLQUFELENBQU8sYUFBUCxFQUFzQjtZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8saUJBQVA7V0FBdEI7VUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUE7WUFDSCxLQUFDLENBQUEsS0FBRCxDQUFPLHNCQUFQLEVBQStCO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO2FBQS9CO1lBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQXVCLElBQUksY0FBSixD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QVosQ0FBQSxDQUF0QjttQkFDQSxLQUFDLENBQUEsWUFBRCxDQUFjLEtBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBLENBQWQsRUFIRjs7UUFGUTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFNVixLQUFBLEdBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7aUJBQVMsS0FBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQUE7UUFBVDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7YUFFUixLQUFLLENBQUMsT0FBTixDQUFjLE1BQU0sQ0FBQyxHQUFQLENBQVcsYUFBWCxDQUFkLEVBQXlDLE9BQXpDLEVBQWtELEtBQWxEO0lBWFU7Ozs7S0FyTmU7QUFkN0IiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xueyQsIFZpZXcsIFRleHRFZGl0b3JWaWV3fSA9IHJlcXVpcmUgXCJhdG9tLXNwYWNlLXBlbi12aWV3c1wiXG5DU09OID0gcmVxdWlyZSBcInNlYXNvblwiXG5mcyA9IHJlcXVpcmUgXCJmcy1wbHVzXCJcbmd1aWQgPSByZXF1aXJlIFwiZ3VpZFwiXG5cbmNvbmZpZyA9IHJlcXVpcmUgXCIuLi9jb25maWdcIlxudXRpbHMgPSByZXF1aXJlIFwiLi4vdXRpbHNcIlxuaGVscGVyID0gcmVxdWlyZSBcIi4uL2hlbHBlcnMvaW5zZXJ0LWxpbmstaGVscGVyXCJcbnRlbXBsYXRlSGVscGVyID0gcmVxdWlyZSBcIi4uL2hlbHBlcnMvdGVtcGxhdGUtaGVscGVyXCJcblxucG9zdHMgPSBudWxsICMgdG8gY2FjaGUgcG9zdHNcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSW5zZXJ0TGlua1ZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6IFwibWFya2Rvd24td3JpdGVyIG1hcmtkb3duLXdyaXRlci1kaWFsb2dcIiwgPT5cbiAgICAgIEBsYWJlbCBcIkluc2VydCBMaW5rXCIsIGNsYXNzOiBcImljb24gaWNvbi1nbG9iZVwiXG4gICAgICBAZGl2ID0+XG4gICAgICAgIEBsYWJlbCBcIlRleHQgdG8gYmUgZGlzcGxheWVkXCIsIGNsYXNzOiBcIm1lc3NhZ2VcIlxuICAgICAgICBAc3VidmlldyBcInRleHRFZGl0b3JcIiwgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUpXG4gICAgICAgIEBsYWJlbCBcIldlYiBBZGRyZXNzXCIsIGNsYXNzOiBcIm1lc3NhZ2VcIlxuICAgICAgICBAc3VidmlldyBcInVybEVkaXRvclwiLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgICAgQGxhYmVsIFwiVGl0bGVcIiwgY2xhc3M6IFwibWVzc2FnZVwiXG4gICAgICAgIEBzdWJ2aWV3IFwidGl0bGVFZGl0b3JcIiwgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUpXG4gICAgICBAZGl2IGNsYXNzOiBcImRpYWxvZy1yb3dcIiwgPT5cbiAgICAgICAgQGxhYmVsIGZvcjogXCJtYXJrZG93bi13cml0ZXItc2F2ZS1saW5rLWNoZWNrYm94XCIsID0+XG4gICAgICAgICAgQGlucHV0IGlkOiBcIm1hcmtkb3duLXdyaXRlci1zYXZlLWxpbmstY2hlY2tib3hcIixcbiAgICAgICAgICAgIHR5cGU6XCJjaGVja2JveFwiLCBvdXRsZXQ6IFwic2F2ZUNoZWNrYm94XCJcbiAgICAgICAgICBAc3BhbiBcIkF1dG9tYXRpY2FsbHkgbGluayB0byB0aGlzIHRleHQgbmV4dCB0aW1lXCIsIGNsYXNzOiBcInNpZGUtbGFiZWxcIlxuICAgICAgQGRpdiBvdXRsZXQ6IFwic2VhcmNoQm94XCIsID0+XG4gICAgICAgIEBsYWJlbCBcIlNlYXJjaCBQb3N0c1wiLCBjbGFzczogXCJpY29uIGljb24tc2VhcmNoXCJcbiAgICAgICAgQHN1YnZpZXcgXCJzZWFyY2hFZGl0b3JcIiwgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUpXG4gICAgICAgIEB1bCBjbGFzczogXCJtYXJrZG93bi13cml0ZXItbGlzdFwiLCBvdXRsZXQ6IFwic2VhcmNoUmVzdWx0XCJcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHV0aWxzLnNldFRhYkluZGV4KFtAdGV4dEVkaXRvciwgQHVybEVkaXRvciwgQHRpdGxlRWRpdG9yLFxuICAgICAgQHNhdmVDaGVja2JveCwgQHNlYXJjaEVkaXRvcl0pXG5cbiAgICBAc2VhcmNoRWRpdG9yLmdldE1vZGVsKCkub25EaWRDaGFuZ2UgPT5cbiAgICAgIEB1cGRhdGVTZWFyY2goQHNlYXJjaEVkaXRvci5nZXRUZXh0KCkpIGlmIHBvc3RzXG4gICAgQHNlYXJjaFJlc3VsdC5vbiBcImNsaWNrXCIsIFwibGlcIiwgKGUpID0+IEB1c2VTZWFyY2hSZXN1bHQoZSlcblxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBAZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgQGVsZW1lbnQsIHtcbiAgICAgICAgXCJjb3JlOmNvbmZpcm1cIjogPT4gQG9uQ29uZmlybSgpLFxuICAgICAgICBcImNvcmU6Y2FuY2VsXCI6ICA9PiBAZGV0YWNoKClcbiAgICAgIH0pKVxuXG4gIG9uQ29uZmlybTogLT5cbiAgICBsaW5rID1cbiAgICAgIHRleHQ6IEB0ZXh0RWRpdG9yLmdldFRleHQoKVxuICAgICAgdXJsOiBAdXJsRWRpdG9yLmdldFRleHQoKS50cmltKClcbiAgICAgIHRpdGxlOiBAdGl0bGVFZGl0b3IuZ2V0VGV4dCgpLnRyaW0oKVxuXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgaWYgbGluay51cmwgdGhlbiBAaW5zZXJ0TGluayhsaW5rKSBlbHNlIEByZW1vdmVMaW5rKGxpbmsudGV4dClcblxuICAgIEB1cGRhdGVTYXZlZExpbmtzKGxpbmspXG4gICAgQGRldGFjaCgpXG5cbiAgZGlzcGxheTogLT5cbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcbiAgICBAcHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgIEBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgIyBmZXRjaCByZW1vdGUgYW5kIGxvY2FsIGxpbmtzXG4gICAgQGZldGNoUG9zdHMoKVxuICAgIEBsb2FkU2F2ZWRMaW5rcyA9PlxuICAgICAgQF9ub3JtYWxpemVTZWxlY3Rpb25BbmRTZXRMaW5rRmllbGRzKClcblxuICAgICAgaWYgQHRleHRFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICAgIEB1cmxFZGl0b3IuZ2V0TW9kZWwoKS5zZWxlY3RBbGwoKVxuICAgICAgICBAdXJsRWRpdG9yLmZvY3VzKClcbiAgICAgIGVsc2VcbiAgICAgICAgQHRleHRFZGl0b3IuZm9jdXMoKVxuXG4gIGRldGFjaDogLT5cbiAgICBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgIEBwYW5lbC5oaWRlKClcbiAgICAgIEBwcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQ/LmZvY3VzKClcbiAgICBzdXBlclxuXG4gIGRldGFjaGVkOiAtPlxuICAgIEBkaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgQGRpc3Bvc2FibGVzID0gbnVsbFxuXG4gIF9ub3JtYWxpemVTZWxlY3Rpb25BbmRTZXRMaW5rRmllbGRzOiAtPlxuICAgIEByYW5nZSA9IHV0aWxzLmdldFRleHRCdWZmZXJSYW5nZShAZWRpdG9yLCBcImxpbmtcIilcbiAgICBAY3VyckxpbmsgPSBAX2ZpbmRMaW5rSW5SYW5nZSgpXG5cbiAgICBAcmVmZXJlbmNlSWQgPSBAY3VyckxpbmsuaWRcbiAgICBAcmFuZ2UgPSBAY3VyckxpbmsubGlua1JhbmdlIHx8IEByYW5nZVxuICAgIEBkZWZpbml0aW9uUmFuZ2UgPSBAY3VyckxpbmsuZGVmaW5pdGlvblJhbmdlXG5cbiAgICBAc2V0TGluayhAY3VyckxpbmspXG4gICAgQHNhdmVDaGVja2JveC5wcm9wKFwiY2hlY2tlZFwiLCBAaXNJblNhdmVkTGluayhAY3VyckxpbmspKVxuXG4gIF9maW5kTGlua0luUmFuZ2U6IC0+XG4gICAgbGluayA9IHV0aWxzLmZpbmRMaW5rSW5SYW5nZShAZWRpdG9yLCBAcmFuZ2UpXG4gICAgaWYgbGluaz9cbiAgICAgIHJldHVybiBsaW5rIHVubGVzcyBsaW5rLmlkXG4gICAgICAjIENoZWNrIGlzIGxpbmsgaXQgYW4gb3JwaGFuIHJlZmVyZW5jZSBsaW5rXG4gICAgICByZXR1cm4gbGluayBpZiBsaW5rLmlkICYmIGxpbmsubGlua1JhbmdlICYmIGxpbmsuZGVmaW5pdGlvblJhbmdlXG4gICAgICAjICBSZW1vdmUgbGluay5pZCBpZiBpdCBpcyBvcnBoYW5cbiAgICAgIGxpbmsuaWQgPSBudWxsXG4gICAgICByZXR1cm4gbGlua1xuICAgICMgRmluZCBzZWxlY3Rpb24gaW4gc2F2ZWQgbGlua3MsIGFuZCBhdXRvLXBvcHVsYXRlIGl0XG4gICAgc2VsZWN0aW9uID0gQGVkaXRvci5nZXRUZXh0SW5SYW5nZShAcmFuZ2UpXG4gICAgcmV0dXJuIEBnZXRTYXZlZExpbmsoc2VsZWN0aW9uKSBpZiBAZ2V0U2F2ZWRMaW5rKHNlbGVjdGlvbilcbiAgICAjIERlZmF1bHQgZmFsbGJhY2tcbiAgICB0ZXh0OiBzZWxlY3Rpb24sIHVybDogXCJcIiwgdGl0bGU6IFwiXCJcblxuICB1cGRhdGVTZWFyY2g6IChxdWVyeSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIHF1ZXJ5ICYmIHBvc3RzXG4gICAgcXVlcnkgPSBxdWVyeS50cmltKCkudG9Mb3dlckNhc2UoKVxuICAgIHJlc3VsdHMgPSBwb3N0c1xuICAgICAgLmZpbHRlcigocG9zdCkgLT4gcG9zdC50aXRsZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkpID49IDApXG4gICAgICAubWFwKChwb3N0KSAtPiBcIjxsaSBkYXRhLXVybD0nI3twb3N0LnVybH0nPiN7cG9zdC50aXRsZX08L2xpPlwiKVxuICAgIEBzZWFyY2hSZXN1bHQuZW1wdHkoKS5hcHBlbmQocmVzdWx0cy5qb2luKFwiXCIpKVxuXG4gIHVzZVNlYXJjaFJlc3VsdDogKGUpIC0+XG4gICAgQHRleHRFZGl0b3Iuc2V0VGV4dChlLnRhcmdldC50ZXh0Q29udGVudCkgdW5sZXNzIEB0ZXh0RWRpdG9yLmdldFRleHQoKVxuICAgIEB0aXRsZUVkaXRvci5zZXRUZXh0KGUudGFyZ2V0LnRleHRDb250ZW50KVxuICAgIEB1cmxFZGl0b3Iuc2V0VGV4dChlLnRhcmdldC5kYXRhc2V0LnVybClcbiAgICBAdGl0bGVFZGl0b3IuZm9jdXMoKVxuXG4gIGluc2VydExpbms6IChsaW5rKSAtPlxuICAgIGlmIEBkZWZpbml0aW9uUmFuZ2VcbiAgICAgIEB1cGRhdGVSZWZlcmVuY2VMaW5rKGxpbmspXG4gICAgZWxzZSBpZiBsaW5rLnRpdGxlXG4gICAgICBAaW5zZXJ0UmVmZXJlbmNlTGluayhsaW5rKVxuICAgIGVsc2VcbiAgICAgIEBpbnNlcnRJbmxpbmVMaW5rKGxpbmspXG5cbiAgaW5zZXJ0SW5saW5lTGluazogKGxpbmspIC0+XG4gICAgdGV4dCA9IHRlbXBsYXRlSGVscGVyLmNyZWF0ZShcImxpbmtJbmxpbmVUYWdcIiwgbGluaylcbiAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKEByYW5nZSwgdGV4dClcblxuICB1cGRhdGVSZWZlcmVuY2VMaW5rOiAobGluaykgLT5cbiAgICBpZiBsaW5rLnRpdGxlICMgdXBkYXRlIHRoZSByZWZlcmVuY2UgbGlua1xuICAgICAgbGluayA9IEBfcmVmZXJlbmNlTGluayhsaW5rKVxuICAgICAgaW5saW5lVGV4dCA9IHRlbXBsYXRlSGVscGVyLmNyZWF0ZShcInJlZmVyZW5jZUlubGluZVRhZ1wiLCBsaW5rKVxuICAgICAgZGVmaW5pdGlvblRleHQgPSB0ZW1wbGF0ZUhlbHBlci5jcmVhdGUoXCJyZWZlcmVuY2VEZWZpbml0aW9uVGFnXCIsIGxpbmspXG5cbiAgICAgIGlmIGRlZmluaXRpb25UZXh0XG4gICAgICAgIEBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoQHJhbmdlLCBpbmxpbmVUZXh0KVxuICAgICAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKEBkZWZpbml0aW9uUmFuZ2UsIGRlZmluaXRpb25UZXh0KVxuICAgICAgZWxzZVxuICAgICAgICBAcmVwbGFjZVJlZmVyZW5jZUxpbmsoaW5saW5lVGV4dClcbiAgICBlbHNlICMgcmVwbGFjZSBieSB0byBpbmxpbmUgbGlua1xuICAgICAgaW5saW5lTGluayA9IHRlbXBsYXRlSGVscGVyLmNyZWF0ZShcImxpbmtJbmxpbmVUYWdcIiwgbGluaylcbiAgICAgIEByZXBsYWNlUmVmZXJlbmNlTGluayhpbmxpbmVMaW5rKVxuXG4gIGluc2VydFJlZmVyZW5jZUxpbms6IChsaW5rKSAtPlxuICAgIGxpbmsgPSBAX3JlZmVyZW5jZUxpbmsobGluaylcbiAgICBpbmxpbmVUZXh0ID0gdGVtcGxhdGVIZWxwZXIuY3JlYXRlKFwicmVmZXJlbmNlSW5saW5lVGFnXCIsIGxpbmspXG4gICAgZGVmaW5pdGlvblRleHQgPSB0ZW1wbGF0ZUhlbHBlci5jcmVhdGUoXCJyZWZlcmVuY2VEZWZpbml0aW9uVGFnXCIsIGxpbmspXG5cbiAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKEByYW5nZSwgaW5saW5lVGV4dClcbiAgICBpZiBkZWZpbml0aW9uVGV4dCAjIGluc2VydCBvbmx5IGlmIGRlZmluaXRpb25UZXh0IGV4aXN0c1xuICAgICAgaWYgY29uZmlnLmdldChcInJlZmVyZW5jZUluc2VydFBvc2l0aW9uXCIpID09IFwiYXJ0aWNsZVwiXG4gICAgICAgIGhlbHBlci5pbnNlcnRBdEVuZE9mQXJ0aWNsZShAZWRpdG9yLCBkZWZpbml0aW9uVGV4dClcbiAgICAgIGVsc2VcbiAgICAgICAgaGVscGVyLmluc2VydEFmdGVyQ3VycmVudFBhcmFncmFwaChAZWRpdG9yLCBkZWZpbml0aW9uVGV4dClcblxuICBfcmVmZXJlbmNlTGluazogKGxpbmspIC0+XG4gICAgbGlua1snaW5kZW50J10gPSBcIiBcIi5yZXBlYXQoY29uZmlnLmdldChcInJlZmVyZW5jZUluZGVudExlbmd0aFwiKSlcbiAgICBsaW5rWyd0aXRsZSddID0gaWYgL15bLVxcKlxcIV0kLy50ZXN0KGxpbmsudGl0bGUpIHRoZW4gXCJcIiBlbHNlIGxpbmsudGl0bGVcbiAgICBsaW5rWydsYWJlbCddID0gQHJlZmVyZW5jZUlkIHx8IGd1aWQucmF3KClbMC4uN11cbiAgICBsaW5rXG5cbiAgcmVtb3ZlTGluazogKHRleHQpIC0+XG4gICAgaWYgQHJlZmVyZW5jZUlkXG4gICAgICBAcmVwbGFjZVJlZmVyZW5jZUxpbmsodGV4dCkgIyByZXBsYWNlIHdpdGggcmF3IHRleHRcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKEByYW5nZSwgdGV4dClcblxuICByZXBsYWNlUmVmZXJlbmNlTGluazogKHRleHQpIC0+XG4gICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShAcmFuZ2UsIHRleHQpXG5cbiAgICBwb3NpdGlvbiA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIGhlbHBlci5yZW1vdmVEZWZpbml0aW9uUmFuZ2UoQGVkaXRvciwgQGRlZmluaXRpb25SYW5nZSlcbiAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvc2l0aW9uKVxuXG4gIHNldExpbms6IChsaW5rKSAtPlxuICAgIEB0ZXh0RWRpdG9yLnNldFRleHQobGluay50ZXh0KVxuICAgIEB0aXRsZUVkaXRvci5zZXRUZXh0KGxpbmsudGl0bGUpXG4gICAgQHVybEVkaXRvci5zZXRUZXh0KGxpbmsudXJsKVxuXG4gIGdldFNhdmVkTGluazogKHRleHQpIC0+XG4gICAgbGluayA9IEBsaW5rcz9bdGV4dC50b0xvd2VyQ2FzZSgpXVxuICAgIHJldHVybiBsaW5rIHVubGVzcyBsaW5rXG5cbiAgICBsaW5rW1widGV4dFwiXSA9IHRleHQgdW5sZXNzIGxpbmsudGV4dFxuICAgIHJldHVybiBsaW5rXG5cbiAgaXNJblNhdmVkTGluazogKGxpbmspIC0+XG4gICAgc2F2ZWRMaW5rID0gQGdldFNhdmVkTGluayhsaW5rLnRleHQpXG4gICAgISFzYXZlZExpbmsgJiYgIShbXCJ0ZXh0XCIsIFwidGl0bGVcIiwgXCJ1cmxcIl0uc29tZSAoaykgLT4gc2F2ZWRMaW5rW2tdICE9IGxpbmtba10pXG5cbiAgdXBkYXRlVG9MaW5rczogKGxpbmspIC0+XG4gICAgbGlua1VwZGF0ZWQgPSBmYWxzZVxuICAgIGluU2F2ZWRMaW5rID0gQGlzSW5TYXZlZExpbmsobGluaylcblxuICAgIGlmIEBzYXZlQ2hlY2tib3gucHJvcChcImNoZWNrZWRcIilcbiAgICAgIGlmICFpblNhdmVkTGluayAmJiBsaW5rLnVybFxuICAgICAgICBAbGlua3NbbGluay50ZXh0LnRvTG93ZXJDYXNlKCldID0gbGlua1xuICAgICAgICBsaW5rVXBkYXRlZCA9IHRydWVcbiAgICBlbHNlIGlmIGluU2F2ZWRMaW5rXG4gICAgICBkZWxldGUgQGxpbmtzW2xpbmsudGV4dC50b0xvd2VyQ2FzZSgpXVxuICAgICAgbGlua1VwZGF0ZWQgPSB0cnVlXG5cbiAgICByZXR1cm4gbGlua1VwZGF0ZWRcblxuICAjIHNhdmUgdGhlIG5ldyBsaW5rIHRvIENTT04gZmlsZSBpZiB0aGUgbGluayBoYXMgdXBkYXRlZCBAbGlua3NcbiAgdXBkYXRlU2F2ZWRMaW5rczogKGxpbmspIC0+XG4gICAgQ1NPTi53cml0ZUZpbGUoY29uZmlnLmdldChcInNpdGVMaW5rUGF0aFwiKSwgQGxpbmtzKSBpZiBAdXBkYXRlVG9MaW5rcyhsaW5rKVxuXG4gICMgbG9hZCBzYXZlZCBsaW5rcyBmcm9tIENTT04gZmlsZXNcbiAgbG9hZFNhdmVkTGlua3M6IChjYWxsYmFjaykgLT5cbiAgICBDU09OLnJlYWRGaWxlIGNvbmZpZy5nZXQoXCJzaXRlTGlua1BhdGhcIiksIChlcnIsIGRhdGEpID0+XG4gICAgICBAbGlua3MgPSBkYXRhIHx8IHt9XG4gICAgICBjYWxsYmFjaygpXG5cbiAgIyBmZXRjaCByZW1vdGUgcG9zdHMgaW4gSlNPTiBmb3JtYXRcbiAgZmV0Y2hQb3N0czogLT5cbiAgICByZXR1cm4gKEBzZWFyY2hCb3guaGlkZSgpIGlmIHBvc3RzLmxlbmd0aCA8IDEpIGlmIHBvc3RzXG5cbiAgICBzdWNjZWVkID0gKGJvZHkpID0+XG4gICAgICBwb3N0cyA9IGJvZHkucG9zdHNcbiAgICAgIGlmIHBvc3RzLmxlbmd0aCA+IDBcbiAgICAgICAgQHNlYXJjaEJveC5zaG93KClcbiAgICAgICAgQHNlYXJjaEVkaXRvci5zZXRUZXh0KEB0ZXh0RWRpdG9yLmdldFRleHQoKSlcbiAgICAgICAgQHVwZGF0ZVNlYXJjaChAdGV4dEVkaXRvci5nZXRUZXh0KCkpXG4gICAgZXJyb3IgPSAoZXJyKSA9PiBAc2VhcmNoQm94LmhpZGUoKVxuXG4gICAgdXRpbHMuZ2V0SlNPTihjb25maWcuZ2V0KFwidXJsRm9yUG9zdHNcIiksIHN1Y2NlZWQsIGVycm9yKVxuIl19
