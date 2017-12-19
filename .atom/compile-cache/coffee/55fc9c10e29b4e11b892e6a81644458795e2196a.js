(function() {
  var BrowserPlus, Disposable, Emitter, HTMLEditor, Model, fs, path, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Disposable = ref.Disposable, Emitter = ref.Emitter;

  Model = require('theorist').Model;

  BrowserPlus = require('./browser-plus').BrowserPlus;

  path = require('path');

  fs = require('fs');

  module.exports = HTMLEditor = (function(superClass) {
    extend(HTMLEditor, superClass);

    atom.deserializers.add(HTMLEditor);

    function HTMLEditor(arg) {
      var i, item, j, len, len1, menu, ref1, ref2;
      this.browserPlus = arg.browserPlus, this.url = arg.url, this.opt = arg.opt;
      if (typeof this.browserPlus === 'string') {
        this.browserPlus = JSON.parse(this.browserPlus);
      }
      if (!this.opt) {
        this.opt = {};
      }
      this.disposable = new Disposable();
      this.emitter = new Emitter;
      this.src = this.opt.src;
      this.orgURI = this.opt.orgURI;
      this._id = this.opt._id;
      if (this.browserPlus && !this.browserPlus.setContextMenu) {
        this.browserPlus.setContextMenu = true;
        ref1 = atom.contextMenu.itemSets;
        for (i = 0, len = ref1.length; i < len; i++) {
          menu = ref1[i];
          if (menu.selector === 'atom-pane') {
            ref2 = menu.items;
            for (j = 0, len1 = ref2.length; j < len1; j++) {
              item = ref2[j];
              item.shouldDisplay = function(evt) {
                var ref3, ref4;
                if ((ref3 = evt.target) != null ? (ref4 = ref3.constructor) != null ? ref4.name = 'webview' : void 0 : void 0) {
                  return false;
                }
                return true;
              };
            }
          }
        }
      }
    }

    HTMLEditor.prototype.getViewClass = function() {
      return require('./browser-plus-view');
    };

    HTMLEditor.prototype.setText = function(src) {
      this.src = src;
      if (this.src) {
        return this.view.setSrc(this.src);
      }
    };

    HTMLEditor.prototype.refresh = function(url) {
      return this.view.refreshPage(url);
    };

    HTMLEditor.prototype.destroyed = function() {
      return this.emitter.emit('did-destroy');
    };

    HTMLEditor.prototype.onDidDestroy = function(cb) {
      return this.emitter.on('did-destroy', cb);
    };

    HTMLEditor.prototype.getTitle = function() {
      var ref1;
      if (((ref1 = this.title) != null ? ref1.length : void 0) > 20) {
        this.title = this.title.slice(0, 20) + '...';
      }
      return this.title || path.basename(this.url);
    };

    HTMLEditor.prototype.getIconName = function() {
      return this.iconName;
    };

    HTMLEditor.prototype.getURI = function() {
      if (this.url === 'browser-plus://blank') {
        return false;
      }
      return this.url;
    };

    HTMLEditor.prototype.getGrammar = function() {};

    HTMLEditor.prototype.setTitle = function(title) {
      this.title = title;
      return this.emit('title-changed');
    };

    HTMLEditor.prototype.updateIcon = function(favIcon) {
      this.favIcon = favIcon;
      return this.emit('icon-changed');
    };

    HTMLEditor.prototype.serialize = function() {
      return {
        data: {
          browserPlus: JSON.stringify(this.browserPlus),
          url: this.url,
          opt: {
            src: this.src,
            iconName: this.iconName,
            title: this.title
          }
        },
        deserializer: 'HTMLEditor'
      };
    };

    HTMLEditor.deserialize = function(arg) {
      var data;
      data = arg.data;
      return new HTMLEditor(data);
    };

    HTMLEditor.checkUrl = function(url) {
      if ((this.checkBlockUrl != null) && this.checkBlockUrl(url)) {
        atom.notifications.addSuccess(url + " Blocked~~Maintain Blocked URL in Browser-Plus Settings");
        return false;
      }
      return true;
    };

    HTMLEditor.getEditorForURI = function(url, sameWindow) {
      var a, a1, editor, i, len, panes, ref1, uri, urls;
      if (url.startsWith('file:///')) {
        return;
      }
      a = document.createElement("a");
      a.href = url;
      if (!sameWindow && (urls = atom.config.get('browser-plus.openInSameWindow')).length) {
        sameWindow = (ref1 = a.hostname, indexOf.call(urls, ref1) >= 0);
      }
      if (!sameWindow) {
        return;
      }
      panes = atom.workspace.getPaneItems();
      a1 = document.createElement("a");
      for (i = 0, len = panes.length; i < len; i++) {
        editor = panes[i];
        uri = editor.getURI();
        a1.href = uri;
        if (a1.hostname === a.hostname) {
          return editor;
        }
      }
      return false;
    };

    return HTMLEditor;

  })(Model);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvYnJvd3Nlci1wbHVzL2xpYi9icm93c2VyLXBsdXMtbW9kZWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQSxrRUFBQTtJQUFBOzs7O0VBQUEsTUFBdUIsT0FBQSxDQUFRLE1BQVIsQ0FBdkIsRUFBQywyQkFBRCxFQUFZOztFQUNYLFFBQVMsT0FBQSxDQUFRLFVBQVI7O0VBQ1QsY0FBZSxPQUFBLENBQVEsZ0JBQVI7O0VBQ2hCLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsTUFBTSxDQUFDLE9BQVAsR0FDUTs7O0lBQ0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUF1QixVQUF2Qjs7SUFDYSxvQkFBQyxHQUFEO0FBQ1gsVUFBQTtNQURjLElBQUMsQ0FBQSxrQkFBQSxhQUFhLElBQUMsQ0FBQSxVQUFBLEtBQUksSUFBQyxDQUFBLFVBQUE7TUFDbEMsSUFBMkMsT0FBTyxJQUFDLENBQUEsV0FBUixLQUF1QixRQUFsRTtRQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFDLENBQUEsV0FBWixFQUFmOztNQUNBLElBQUEsQ0FBaUIsSUFBQyxDQUFBLEdBQWxCO1FBQUEsSUFBQyxDQUFBLEdBQUQsR0FBTyxHQUFQOztNQUNBLElBQUMsQ0FBQSxVQUFELEdBQWtCLElBQUEsVUFBQSxDQUFBO01BQ2xCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxHQUFELEdBQU8sSUFBQyxDQUFBLEdBQUcsQ0FBQztNQUNaLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQztNQUNmLElBQUMsQ0FBQSxHQUFELEdBQU8sSUFBQyxDQUFBLEdBQUcsQ0FBQztNQUNaLElBQUcsSUFBQyxDQUFBLFdB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SyxVQUFMO0FBQ2hCLFVBQUE7TUFBQSxJQUFVLEdBQUcsQ0FBQyxVQUFKLENBQWUsVUFBZixDQUFWO0FBQUEsZUFBQTs7TUFDQSxDQUFBLEdBQUksUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkI7TUFDSixDQUFDLENBQUMsSUFBRixHQUFTO01BQ1QsSUFBRyxDQUFJLFVBQUosSUFBbUIsQ0FBQyxJQUFBLEdBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtCQUFoQixDQUFSLENBQXlELENBQUMsTUFBaEY7UUFDRSxVQUFBLEdBQWEsUUFBQSxDQUFDLENBQUMsUUFBRixFQUFBLGFBQWMsSUFBZCxFQUFBLElBQUEsTUFBQSxFQURmOztNQUdBLElBQUEsQ0FBYyxVQUFkO0FBQUEsZUFBQTs7TUFDQSxLQUFBLEdBQVEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFmLENBQUE7TUFDUixFQUFBLEdBQUssUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkI7QUFDTCxXQUFBLHVDQUFBOztRQUNFLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFBO1FBQ04sRUFBRSxDQUFDLElBQUgsR0FBVTtRQUNWLElBQWlCLEVBQUUsQ0FBQyxRQUFILEtBQWUsQ0FBQyxDQUFDLFFBQWxDO0FBQUEsaUJBQU8sT0FBUDs7QUFIRjtBQUlBLGFBQU87SUFkUzs7OztLQTVFSztBQU4zQiIsInNvdXJjZXNDb250ZW50IjpbIiMgaHR0cDovL3d3dy5za2FuZGFzb2Z0LmNvbS9cbntEaXNwb3NhYmxlLEVtaXR0ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcbntNb2RlbH0gPSByZXF1aXJlICd0aGVvcmlzdCdcbntCcm93c2VyUGx1c30gPSByZXF1aXJlICcuL2Jyb3dzZXItcGx1cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcydcbm1vZHVsZS5leHBvcnRzID1cbiAgY2xhc3MgSFRNTEVkaXRvciBleHRlbmRzIE1vZGVsXG4gICAgYXRvbS5kZXNlcmlhbGl6ZXJzLmFkZCh0aGlzKVxuICAgIGNvbnN0cnVjdG9yOiAoeyBAYnJvd3NlclBsdXMgLEB1cmwsQG9wdCB9KSAtPlxuICAgICAgQGJyb3dzZXJQbHVzID0gSlNPTi5wYXJzZShAYnJvd3NlclBsdXMpIGlmIHR5cGVvZiBAYnJvd3NlclBsdXMgaXMgJ3N0cmluZydcbiAgICAgIEBvcHQgPSB7fSB1bmxlc3MgQG9wdFxuICAgICAgQGRpc3Bvc2FibGUgPSBuZXcgRGlzcG9zYWJsZSgpXG4gICAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgICBAc3JjID0gQG9wdC5zcmNcbiAgICAgIEBvcmdVUkkgPSBAb3B0Lm9yZ1VSSVxuICAgICAgQF9pZCA9IEBvcHQuX2lkXG4gICAgICBpZiBAYnJvd3NlclBsdXMgYW5kIG5vdCBAYnJvd3NlclBsdXMuc2V0Q29udGV4dE1lbnVcbiAgICAgICAgQGJyb3dzZXJQbHVzLnNldENvbnRleHRNZW51ID0gdHJ1ZVxuICAgICAgICBmb3IgbWVudSBpbiBhdG9tLmNvbnRleHRNZW51Lml0ZW1TZXRzXG4gICAgICAgICAgaWYgbWVudS5zZWxlY3RvciBpcyAnYXRvbS1wYW5lJ1xuICAgICAgICAgICAgZm9yIGl0ZW0gaW4gbWVudS5pdGVtc1xuICAgICAgICAgICAgICBpdGVtLnNob3VsZERpc3BsYXkgPSAoZXZ0KS0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlIGlmIGV2dC50YXJnZXQ/LmNvbnN0cnVjdG9yPy5uYW1lID0gJ3dlYnZpZXcnXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIGdldFZpZXdDbGFzczogLT5cbiAgICAgIHJlcXVpcmUgJy4vYnJvd3Nlci1wbHVzLXZpZXcnXG5cbiAgICBzZXRUZXh0OiAoQHNyYyktPlxuICAgICAgQHZpZXcuc2V0U3JjKEBzcmMpIGlmIEBzcmNcblxuICAgIHJlZnJlc2g6ICh1cmwpLT5cbiAgICAgICAgQHZpZXcucmVmcmVzaFBhZ2UodXJsKVxuXG4gICAgZGVzdHJveWVkOiAtPlxuICAgICAgIyBAdW5zdWJzY3JpYmUoKVxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWRlc3Ryb3knXG5cbiAgICBvbkRpZERlc3Ryb3k6IChjYiktPlxuICAgICAgQGVtaXR0ZXIub24gJ2RpZC1kZXN0cm95JywgY2JcblxuICAgIGdldFRpdGxlOiAtPlxuICAgICAgaWYgQHRpdGxlPy5sZW5ndGggPiAyMFxuICAgICAgICBAdGl0bGUgPSBAdGl0bGVbMC4uLjIwXSsnLi4uJ1xuICAgICAgQHRpdGxlIG9yIHBhdGguYmFzZW5hbWUoQHVybClcblxuICAgIGdldEljb25OYW1lOiAtPlxuICAgICAgQGljb25OYW1lXG5cbiAgICBnZXRVUkk6IC0+XG4gICAgICByZXR1cm4gZmFsc2UgaWYgQHVybCBpcyAnYnJvd3Nlci1wbHVzOi8vYmxhbmsnXG4gICAgICBAdXJsXG5cbiAgICBnZXRHcmFtbWFyOiAtPlxuXG4gICAgc2V0VGl0bGU6IChAdGl0bGUpLT5cbiAgICAgIEBlbWl0ICd0aXRsZS1jaGFuZ2VkJ1xuXG4gICAgdXBkYXRlSWNvbjogKEBmYXZJY29uKS0+XG4gICAgICBAZW1pdCAnaWNvbi1jaGFuZ2VkJ1xuXG4gICAgc2VyaWFsaXplOiAtPlxuICAgICAgZGF0YTpcbiAgICAgICAgIyBicm93c2VyUGx1czogSlNPTi5zdHJpbmdpZnkoQGJyb3dzZXJQbHVzKVxuICAgICAgICBicm93c2VyUGx1czogSlNPTi5zdHJpbmdpZnkoQGJyb3dzZXJQbHVzKVxuICAgICAgICB1cmw6IEB1cmxcbiAgICAgICAgb3B0OlxuICAgICAgICAgIHNyYzogIEBzcmNcbiAgICAgICAgICBpY29uTmFtZTogQGljb25OYW1lXG4gICAgICAgICAgdGl0bGU6IEB0aXRsZVxuXG4gICAgICBkZXNlcmlhbGl6ZXI6ICAnSFRNTEVkaXRvcidcblxuICAgIEBkZXNlcmlhbGl6ZTogKHtkYXRhfSkgLT5cbiAgICAgIG5ldyBIVE1MRWRpdG9yKGRhdGEpXG5cbiAgICBAY2hlY2tVcmw6ICh1cmwpLT5cbiAgICAgIGlmIEBjaGVja0Jsb2NrVXJsPyBhbmQgQGNoZWNrQmxvY2tVcmwodXJsKVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhcIiN7dXJsfSBCbG9ja2Vkfn5NYWludGFpbiBCbG9ja2VkIFVSTCBpbiBCcm93c2VyLVBsdXMgU2V0dGluZ3NcIilcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgQGdldEVkaXRvckZvclVSSTogKHVybCxzYW1lV2luZG93KS0+XG4gICAgICByZXR1cm4gaWYgdXJsLnN0YXJ0c1dpdGgoJ2ZpbGU6Ly8vJylcbiAgICAgIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxuICAgICAgYS5ocmVmID0gdXJsXG4gICAgICBpZiBub3Qgc2FtZVdpbmRvdyBhbmQgKHVybHMgPSBhdG9tLmNvbmZpZy5nZXQoJ2Jyb3dzZXItcGx1cy5vcGVuSW5TYW1lV2luZG93JykpLmxlbmd0aFxuICAgICAgICBzYW1lV2luZG93ID0gYS5ob3N0bmFtZSBpbiB1cmxzXG5cbiAgICAgIHJldHVybiB1bmxlc3Mgc2FtZVdpbmRvd1xuICAgICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lSXRlbXMoKVxuICAgICAgYTEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKVxuICAgICAgZm9yIGVkaXRvciBpbiBwYW5lc1xuICAgICAgICB1cmkgPSBlZGl0b3IuZ2V0VVJJKClcbiAgICAgICAgYTEuaHJlZiA9IHVyaVxuICAgICAgICByZXR1cm4gZWRpdG9yIGlmIGExLmhvc3RuYW1lIGlzIGEuaG9zdG5hbWVcbiAgICAgIHJldHVybiBmYWxzZVxuIl19
