(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    config: {
      visibility: {
        type: 'string',
        "default": 'showButtonsOnMarkdown',
        description: 'Configure toolbar visibility behaviour',
        "enum": ['showToolbarOnMarkdown', 'showButtonsOnMarkdown', 'showButtonsOnAll']
      },
      grammars: {
        type: 'array',
        "default": ['source.gfm', 'source.gfm.nvatom', 'source.litcoffee', 'text.md', 'text.plain', 'text.plain.null-grammar'],
        description: 'Valid file type grammars'
      }
    },
    buttons: [
      {
        'icon': 'file',
        'tooltip': 'Add New Post/Draft',
        'callback': {
          '': 'markdown-writer:new-post',
          'shift': 'markdown-writer:new-draft'
        }
      }, {
        'icon': 'markdown',
        'tooltip': 'Preview Markdown',
        'data': ['markdown-preview', 'markdown-preview-plus'],
        'visible': function(data) {
          var pkg;
          pkg = data.find(function(pkg) {
            return !!atom.packages.getLoadedPackage(pkg);
          });
          if (pkg) {
            return pkg + ":toggle";
          }
        }
      }, {
        'type': 'separator'
      }, {
        'icon': 'tag',
        'tooltip': 'Manage Tags',
        'callback': 'markdown-writer:manage-post-tags'
      }, {
        'icon': 'label',
        'tooltip': 'Manage Categories',
        'callback': 'markdown-writer:manage-post-categories'
      }, {
        'type': 'separator'
      }, {
        'icon': 'link-variant',
        'tooltip': 'Insert Link',
        'callback': {
          '': 'markdown-writer:insert-link',
          'shift': 'markdown-writer:open-link-in-browser'
        }
      }, {
        'icon': 'image',
        'tooltip': 'Insert Image',
        'callback': 'markdown-writer:insert-image'
      }, {
        'type': 'separator'
      }, {
        'icon': 'format-bold',
        'tooltip': 'Bold',
        'callback': 'markdown-writer:toggle-bold-text'
      }, {
        'icon': 'format-italic',
        'tooltip': 'Italic',
        'callback': 'markdown-writer:toggle-italic-text'
      }, {
        'icon': 'code-tags',
        'tooltip': 'Code/Code Block',
        'callback': {
          '': 'markdown-writer:toggle-code-text',
          'shift': 'markdown-writer:toggle-codeblock-text'
        }
      }, {
        'type': 'separator'
      }, {
        'icon': 'format-list-bulleted',
        'tooltip': 'Unordered List',
        'callback': 'markdown-writer:toggle-ul'
      }, {
        'icon': 'format-list-numbers',
        'tooltip': 'Ordered List',
        'callback': {
          '': 'markdown-writer:toggle-ol',
          'shift': 'markdown-writer:correct-order-list-numbers'
        }
      }, {
        'icon': 'playlist-check',
        'tooltip': 'Task List',
        'callback': {
          '': 'markdown-writer:toggle-task',
          'shift': 'markdown-writer:toggle-taskdone'
        }
      }, {
        'type': 'separator'
      }, {
        'icon': 'format-header-1',
        'tooltip': 'Heading 1',
        'callback': 'markdown-writer:toggle-h1'
      }, {
        'icon': 'format-header-2',
        'tooltip': 'Heading 2',
        'callback': 'markdown-writer:toggle-h2'
      }, {
        'icon': 'format-header-3',
        'tooltip': 'Heading 3',
        'callback': 'markdown-writer:toggle-h3'
      }, {
        'type': 'separator'
      }, {
        'icon': 'format-header-decrease',
        'tooltip': 'Jump to Previous Heading',
        'callback': 'markdown-writer:jump-to-previous-heading'
      }, {
        'icon': 'format-header-increase',
        'tooltip': 'Jump to Next Heading',
        'callback': 'markdown-writer:jump-to-next-heading'
      }, {
        'type': 'separator'
      }, {
        'icon': 'table',
        'tooltip': 'Insert Table',
        'callback': 'markdown-writer:insert-table'
      }, {
        'icon': 'table-edit',
        'tooltip': 'Format Table',
        'callback': 'markdown-writer:format-table'
      }
    ],
    consumeToolBar: function(toolBar) {
      this.toolBar = toolBar('tool-bar-markdown-writer');
      this.toolBar.onDidDestroy((function(_this) {
        return function() {
          return _this.toolBar = null;
        };
      })(this));
      return this.addButtons();
    },
    addButtons: function() {
      var button, callback, i, len, ref, results;
      if (this.toolBar == null) {
        return;
      }
      ref = this.buttons;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        button = ref[i];
        if (button['type'] === 'separator') {
          results.push(this.toolBar.addSpacer());
        } else {
          callback = button['callback'];
          if (button['visible'] != null) {
            callback = button['visible'](button['data']);
          }
          if (!callback) {
            continue;
          }
          results.push(this.toolBar.addButton({
            icon: button['icon'],
            data: button['data'],
            callback: callback,
            tooltip: button['tooltip'],
            iconset: button['iconset'] || 'mdi'
          }));
        }
      }
      return results;
    },
    removeButtons: function() {
      var ref;
      return (ref = this.toolBar) != null ? ref.removeItems() : void 0;
    },
    updateToolbarVisible: function(visible) {
      return atom.config.set('tool-bar.visible', visible);
    },
    isToolbarVisible: function() {
      return atom.config.get('tool-bar.visible');
    },
    isMarkdown: function() {
      var editor, grammars;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return false;
      }
      grammars = atom.config.get('tool-bar-markdown-writer.grammars');
      return grammars.indexOf(editor.getGrammar().scopeName) >= 0;
    },
    activate: function() {
      return require('atom-package-deps').install('tool-bar-markdown-writer', true).then((function(_this) {
        return function() {
          return _this.activateBar();
        };
      })(this));
    },
    activateBar: function() {
      this.subscriptions = new CompositeDisposable();
      return this.subscriptions.add(atom.workspace.onDidStopChangingActivePaneItem((function(_this) {
        return function(item) {
          var visibility;
          visibility = atom.config.get('tool-bar-markdown-writer.visibility');
          if (_this.isMarkdown()) {
            _this.removeButtons();
            _this.addButtons();
            if (visibility === 'showToolbarOnMarkdown') {
              return _this.updateToolbarVisible(true);
            }
          } else if (_this.isToolbarVisible()) {
            if (visibility === 'showButtonsOnMarkdown') {
              return _this.removeButtons();
            } else if (visibility === 'showToolbarOnMarkdown') {
              return _this.updateToolbarVisible(false);
            }
          }
        };
      })(this)));
    },
    deactivate: function() {
      this.subscriptions.dispose();
      this.subscriptions = null;
      return this.removeButtons();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy90b29sLWJhci1tYXJrZG93bi13cml0ZXIvbGliL3Rvb2wtYmFyLW1hcmtkb3duLXdyaXRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFFLHNCQUF3QixPQUFBLENBQVEsTUFBUjs7RUFFMUIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLFVBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyx1QkFEVDtRQUVBLFdBQUEsRUFBYSx3Q0FGYjtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FDSix1QkFESSxFQUVKLHVCQUZJLEVBR0osa0JBSEksQ0FITjtPQURGO01BU0EsUUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLE9BQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBQ1AsWUFETyxFQUVQLG1CQUZPLEVBR1Asa0JBSE8sRUFJUCxTQUpPLEVBS1AsWUFMTyxFQU1QLHlCQU5PLENBRFQ7UUFTQSxXQUFBLEVBQWEsMEJBVGI7T0FWRjtLQURGO0lBc0JBLE9BQUEsRUFBUztNQUNQO1FBQ0UsTUFBQSxFQUFRLE1BRFY7UUFFRSxTQUFBLEVBQVcsb0JBRmI7UUFHRSxVQUFBLEVBQ0U7VUFBQSxFQUFBLEVBQUksMEJBQUo7VUFDQSxPQUFBLEVBQVMsMkJBRFQ7U0FKSjtPQURPLEVBUVA7UUFDRSxNQUFBLEVBQVEsVUFEVjtRQUVFLFNBQUEsRUFBVyxrQkFGYjtRQUdFLE1BQUEsRUFBUSxDQUFDLGtCQUFELEVBQXFCLHVCQUFyQixDQUhWO1FBSUUsU0FBQSxFQUFXLFNBQUMsSUFBRDtBQUNULGNBQUE7VUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFDLEdBQUQ7bUJBQVMsQ0FBQyxDQUFDLElBQUks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O2FBSEY7V0FBQSxNQUlLLElBQUcsS0FBQyxDQUFBLGdCQUFELENBQUEsQ0FBSDtZQUNILElBQUcsVUFBQSxLQUFjLHVCQUFqQjtxQkFDRSxLQUFDLENBQUEsYUFBRCxDQUFBLEVBREY7YUFBQSxNQUVLLElBQUcsVUFBQSxLQUFjLHVCQUFqQjtxQkFDSCxLQUFDLENBQUEsb0JBQUQsQ0FBc0IsS0FBdEIsRUFERzthQUhGOztRQVAyRDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0MsQ0FBbkI7SUFGVyxDQXhMYjtJQXVNQSxVQUFBLEVBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO01BQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7YUFDakIsSUFBQyxDQUFBLGFBQUQsQ0FBQTtJQUhVLENBdk1aOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsieyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICB2aXNpYmlsaXR5OlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdzaG93QnV0dG9uc09uTWFya2Rvd24nXG4gICAgICBkZXNjcmlwdGlvbjogJ0NvbmZpZ3VyZSB0b29sYmFyIHZpc2liaWxpdHkgYmVoYXZpb3VyJ1xuICAgICAgZW51bTogW1xuICAgICAgICAnc2hvd1Rvb2xiYXJPbk1hcmtkb3duJ1xuICAgICAgICAnc2hvd0J1dHRvbnNPbk1hcmtkb3duJ1xuICAgICAgICAnc2hvd0J1dHRvbnNPbkFsbCdcbiAgICAgIF1cbiAgICBncmFtbWFyczpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFtcbiAgICAgICAgJ3NvdXJjZS5nZm0nXG4gICAgICAgICdzb3VyY2UuZ2ZtLm52YXRvbSdcbiAgICAgICAgJ3NvdXJjZS5saXRjb2ZmZWUnXG4gICAgICAgICd0ZXh0Lm1kJ1xuICAgICAgICAndGV4dC5wbGFpbidcbiAgICAgICAgJ3RleHQucGxhaW4ubnVsbC1ncmFtbWFyJ1xuICAgICAgXVxuICAgICAgZGVzY3JpcHRpb246ICdWYWxpZCBmaWxlIHR5cGUgZ3JhbW1hcnMnXG5cbiAgYnV0dG9uczogW1xuICAgIHtcbiAgICAgICdpY29uJzogJ2ZpbGUnXG4gICAgICAndG9vbHRpcCc6ICdBZGQgTmV3IFBvc3QvRHJhZnQnXG4gICAgICAnY2FsbGJhY2snOlxuICAgICAgICAnJzogJ21hcmtkb3duLXdyaXRlcjpuZXctcG9zdCdcbiAgICAgICAgJ3NoaWZ0JzogJ21hcmtkb3duLXdyaXRlcjpuZXctZHJhZnQnXG4gICAgfVxuICAgIHtcbiAgICAgICdpY29uJzogJ21hcmtkb3duJ1xuICAgICAgJ3Rvb2x0aXAnOiAnUHJldmlldyBNYXJrZG93bidcbiAgICAgICdkYXRhJzogWydtYXJrZG93bi1wcmV2aWV3JywgJ21hcmtkb3duLXByZXZpZXctcGx1cyddXG4gICAgICAndmlzaWJsZSc6IChkYXRhKSAtPlxuICAgICAgICBwa2cgPSBkYXRhLmZpbmQgKHBrZykgLT4gISFhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UocGtnKVxuICAgICAgICBcIiN7cGtnfTp0b2dnbGVcIiBpZiBwa2dcbiAgICB9XG4gICAgeyAndHlwZSc6ICdzZXBhcmF0b3InIH1cbiAgICB7XG4gICAgICAnaWNvbic6ICd0YWcnXG4gICAgICAndG9vbHRpcCc6ICdNYW5hZ2UgVGFncydcbiAgICAgICdjYWxsYmFjayc6ICdtYXJrZG93bi13cml0ZXI6bWFuYWdlLXBvc3QtdGFncydcbiAgICB9XG4gICAge1xuICAgICAgJ2ljb24nOiAnbGFiZWwnXG4gICAgICAndG9vbHRpcCc6ICdNYW5hZ2UgQ2F0ZWdvcmllcydcbiAgICAgICdjYWxsYmFjayc6ICdtYXJrZG93bi13cml0ZXI6bWFuYWdlLXBvc3QtY2F0ZWdvcmllcydcbiAgICB9XG4gICAgeyAndHlwZSc6ICdzZXBhcmF0b3InIH1cbiAgICB7XG4gICAgICAnaWNvbic6ICdsaW5rLXZhcmlhbnQnXG4gICAgICAndG9vbHRpcCc6ICdJbnNlcnQgTGluaydcbiAgICAgICdjYWxsYmFjayc6XG4gICAgICAgICcnOiAnbWFya2Rvd24td3JpdGVyOmluc2VydC1saW5rJ1xuICAgICAgICAnc2hpZnQnOiAnbWFya2Rvd24td3JpdGVyOm9wZW4tbGluay1pbi1icm93c2VyJ1xuICAgIH1cbiAgICB7XG4gICAgICAnaWNvbic6ICdpbWFnZSdcbiAgICAgICd0b29sdGlwJzogJ0luc2VydCBJbWFnZSdcbiAgICAgICdjYWxsYmFjayc6ICdtYXJrZG93bi13cml0ZXI6aW5zZXJ0LWltYWdlJ1xuICAgIH1cbiAgICB7ICd0eXBlJzogJ3NlcGFyYXRvcicgfVxuICAgIHtcbiAgICAgICdpY29uJzogJ2Zvcm1hdC1ib2xkJ1xuICAgICAgJ3Rvb2x0aXAnOiAnQm9sZCdcbiAgICAgICdjYWxsYmFjayc6ICdtYXJrZG93bi13cml0ZXI6dG9nZ2xlLWJvbGQtdGV4dCdcbiAgICB9XG4gICAge1xuICAgICAgJ2ljb24nOiAnZm9ybWF0LWl0YWxpYydcbiAgICAgICd0b29sdGlwJzogJ0l0YWxpYydcbiAgICAgICdjYWxsYmFjayc6ICdtYXJrZG93bi13cml0ZXI6dG9nZ2xlLWl0YWxpYy10ZXh0J1xuICAgIH1cbiAgICB7XG4gICAgICAnaWNvbic6ICdjb2RlLXRhZ3MnXG4gICAgICAndG9vbHRpcCc6ICdDb2RlL0NvZGUgQmxvY2snXG4gICAgICAnY2FsbGJhY2snOlxuICAgICAgICAnJzogJ21hcmtkb3duLXdyaXRlcjp0b2dnbGUtY29kZS10ZXh0J1xuICAgICAgICAnc2hpZnQnOiAnbWFya2Rvd24td3JpdGVyOnRvZ2dsZS1jb2RlYmxvY2stdGV4dCdcbiAgICB9XG4gICAgeyAndHlwZSc6ICdzZXBhcmF0b3InIH1cbiAgICB7XG4gICAgICAnaWNvbic6ICdmb3JtYXQtbGlzdC1idWxsZXRlZCdcbiAgICAgICd0b29sdGlwJzogJ1Vub3JkZXJlZCBMaXN0J1xuICAgICAgJ2NhbGxiYWNrJzogJ21hcmtkb3duLXdyaXRlcjp0b2dnbGUtdWwnXG4gICAgfVxuICAgIHtcbiAgICAgICdpY29uJzogJ2Zvcm1hdC1saXN0LW51bWJlcnMnXG4gICAgICAndG9vbHRpcCc6ICdPcmRlcmVkIExpc3QnXG4gICAgICAnY2FsbGJhY2snOlxuICAgICAgICAnJzogJ21hcmtkb3duLXdyaXRlcjp0b2dnbGUtb2wnXG4gICAgICAgICdzaGlmdCc6ICdtYXJrZG93bi13cml0ZXI6Y29ycmVjdC1vcmRlci1saXN0LW51bWJlcnMnXG4gICAgfVxuICAgIHtcbiAgICAgICdpY29uJzogJ3BsYXlsaXN0LWNoZWNrJ1xuICAgICAgJ3Rvb2x0aXAnOiAnVGFzayBMaXN0J1xuICAgICAgJ2NhbGxiYWNrJzpcbiAgICAgICAgJyc6ICdtYXJrZG93bi13cml0ZXI6dG9nZ2xlLXRhc2snXG4gICAgICAgICdzaGlmdCc6ICdtYXJrZG93bi13cml0ZXI6dG9nZ2xlLXRhc2tkb25lJ1xuICAgIH1cbiAgICB7ICd0eXBlJzogJ3NlcGFyYXRvcicgfVxuICAgIHtcbiAgICAgICdpY29uJzogJ2Zvcm1hdC1oZWFkZXItMSdcbiAgICAgICd0b29sdGlwJzogJ0hlYWRpbmcgMSdcbiAgICAgICdjYWxsYmFjayc6ICdtYXJrZG93bi13cml0ZXI6dG9nZ2xlLWgxJ1xuICAgIH1cbiAgICB7XG4gICAgICAnaWNvbic6ICdmb3JtYXQtaGVhZGVyLTInXG4gICAgICAndG9vbHRpcCc6ICdIZWFkaW5nIDInXG4gICAgICAnY2FsbGJhY2snOiAnbWFya2Rvd24td3JpdGVyOnRvZ2dsZS1oMidcbiAgICB9XG4gICAge1xuICAgICAgJ2ljb24nOiAnZm9ybWF0LWhlYWRlci0zJ1xuICAgICAgJ3Rvb2x0aXAnOiAnSGVhZGluZyAzJ1xuICAgICAgJ2NhbGxiYWNrJzogJ21hcmtkb3duLXdyaXRlcjp0b2dnbGUtaDMnXG4gICAgfVxuICAgIHsgJ3R5cGUnOiAnc2VwYXJhdG9yJyB9XG4gICAge1xuICAgICAgJ2ljb24nOiAnZm9ybWF0LWhlYWRlci1kZWNyZWFzZSdcbiAgICAgICd0b29sdGlwJzogJ0p1bXAgdG8gUHJldmlvdXMgSGVhZGluZydcbiAgICAgICdjYWxsYmFjayc6ICdtYXJrZG93bi13cml0ZXI6anVtcC10by1wcmV2aW91cy1oZWFkaW5nJ1xuICAgIH1cbiAgICB7XG4gICAgICAnaWNvbic6ICdmb3JtYXQtaGVhZGVyLWluY3JlYXNlJ1xuICAgICAgJ3Rvb2x0aXAnOiAnSnVtcCB0byBOZXh0IEhlYWRpbmcnXG4gICAgICAnY2FsbGJhY2snOiAnbWFya2Rvd24td3JpdGVyOmp1bXAtdG8tbmV4dC1oZWFkaW5nJ1xuICAgIH1cbiAgICB7ICd0eXBlJzogJ3NlcGFyYXRvcicgfVxuICAgIHtcbiAgICAgICdpY29uJzogJ3RhYmxlJ1xuICAgICAgJ3Rvb2x0aXAnOiAnSW5zZXJ0IFRhYmxlJ1xuICAgICAgJ2NhbGxiYWNrJzogJ21hcmtkb3duLXdyaXRlcjppbnNlcnQtdGFibGUnXG4gICAgfVxuICAgIHtcbiAgICAgICdpY29uJzogJ3RhYmxlLWVkaXQnXG4gICAgICAndG9vbHRpcCc6ICdGb3JtYXQgVGFibGUnXG4gICAgICAnY2FsbGJhY2snOiAnbWFya2Rvd24td3JpdGVyOmZvcm1hdC10YWJsZSdcbiAgICB9XG4gIF1cblxuICBjb25zdW1lVG9vbEJhcjogKHRvb2xCYXIpIC0+XG4gICAgQHRvb2xCYXIgPSB0b29sQmFyKCd0b29sLWJhci1tYXJrZG93bi13cml0ZXInKVxuICAgICMgY2xlYW5pbmcgdXAgd2hlbiB0b29sIGJhciBpcyBkZWFjdGl2YXRlZFxuICAgIEB0b29sQmFyLm9uRGlkRGVzdHJveSA9PiBAdG9vbEJhciA9IG51bGxcbiAgICAjIGRpc3BsYXkgYnV0dG9uc1xuICAgIEBhZGRCdXR0b25zKClcblxuICBhZGRCdXR0b25zOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHRvb2xCYXI/XG5cbiAgICBmb3IgYnV0dG9uIGluIEBidXR0b25zXG4gICAgICBpZiBidXR0b25bJ3R5cGUnXSA9PSAnc2VwYXJhdG9yJ1xuICAgICAgICBAdG9vbEJhci5hZGRTcGFjZXIoKVxuICAgICAgZWxzZVxuICAgICAgICBjYWxsYmFjayA9IGJ1dHRvblsnY2FsbGJhY2snXVxuICAgICAgICBjYWxsYmFjayA9IGJ1dHRvblsndmlzaWJsZSddKGJ1dHRvblsnZGF0YSddKSBpZiBidXR0b25bJ3Zpc2libGUnXT9cbiAgICAgICAgY29udGludWUgdW5sZXNzIGNhbGxiYWNrXG5cbiAgICAgICAgQHRvb2xCYXIuYWRkQnV0dG9uKFxuICAgICAgICAgIGljb246IGJ1dHRvblsnaWNvbiddXG4gICAgICAgICAgZGF0YTogYnV0dG9uWydkYXRhJ11cbiAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2tcbiAgICAgICAgICB0b29sdGlwOiBidXR0b25bJ3Rvb2x0aXAnXVxuICAgICAgICAgIGljb25zZXQ6IGJ1dHRvblsnaWNvbnNldCddIHx8ICdtZGknKVxuXG4gIHJlbW92ZUJ1dHRvbnM6IC0+IEB0b29sQmFyPy5yZW1vdmVJdGVtcygpXG5cbiAgdXBkYXRlVG9vbGJhclZpc2libGU6ICh2aXNpYmxlKSAtPlxuICAgIGF0b20uY29uZmlnLnNldCgndG9vbC1iYXIudmlzaWJsZScsIHZpc2libGUpXG5cbiAgaXNUb29sYmFyVmlzaWJsZTogLT4gYXRvbS5jb25maWcuZ2V0KCd0b29sLWJhci52aXNpYmxlJylcblxuICBpc01hcmtkb3duOiAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgZWRpdG9yP1xuXG4gICAgZ3JhbW1hcnMgPSBhdG9tLmNvbmZpZy5nZXQoJ3Rvb2wtYmFyLW1hcmtkb3duLXdyaXRlci5ncmFtbWFycycpXG4gICAgcmV0dXJuIGdyYW1tYXJzLmluZGV4T2YoZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpID49IDBcblxuICBhY3RpdmF0ZTogLT5cbiAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpXG4gICAgICAuaW5zdGFsbCgndG9vbC1iYXItbWFya2Rvd24td3JpdGVyJywgdHJ1ZSlcbiAgICAgIC50aGVuKD0+IEBhY3RpdmF0ZUJhcigpKVxuXG4gIGFjdGl2YXRlQmFyOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLndvcmtzcGFjZS5vbkRpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtIChpdGVtKSA9PlxuICAgICAgdmlzaWJpbGl0eSA9IGF0b20uY29uZmlnLmdldCgndG9vbC1iYXItbWFya2Rvd24td3JpdGVyLnZpc2liaWxpdHknKVxuXG4gICAgICBpZiBAaXNNYXJrZG93bigpXG4gICAgICAgIEByZW1vdmVCdXR0b25zKClcbiAgICAgICAgQGFkZEJ1dHRvbnMoKVxuICAgICAgICBAdXBkYXRlVG9vbGJhclZpc2libGUodHJ1ZSkgaWYgdmlzaWJpbGl0eSA9PSAnc2hvd1Rvb2xiYXJPbk1hcmtkb3duJ1xuICAgICAgZWxzZSBpZiBAaXNUb29sYmFyVmlzaWJsZSgpXG4gICAgICAgIGlmIHZpc2liaWxpdHkgPT0gJ3Nob3dCdXR0b25zT25NYXJrZG93bidcbiAgICAgICAgICBAcmVtb3ZlQnV0dG9ucygpXG4gICAgICAgIGVsc2UgaWYgdmlzaWJpbGl0eSA9PSAnc2hvd1Rvb2xiYXJPbk1hcmtkb3duJ1xuICAgICAgICAgIEB1cGRhdGVUb29sYmFyVmlzaWJsZShmYWxzZSlcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbnVsbFxuICAgIEByZW1vdmVCdXR0b25zKClcbiJdfQ==
