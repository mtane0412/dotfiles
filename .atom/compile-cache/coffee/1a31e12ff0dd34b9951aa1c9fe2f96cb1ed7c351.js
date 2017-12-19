(function() {
  var CompositeDisposable, CountWord, CountWordView;

  CountWordView = require('./count-word-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = CountWord = {
    countWordView: null,
    modalPanel: null,
    subscriptions: null,
    activate: function(state) {
      this.countWordView = new CountWordView(state.countWordViewState);
      this.modalPanel = atom.workspace.addModalPanel({
        item: this.countWordView.getElement(),
        visible: false
      });
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'count-word:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      this.modalPanel.destroy();
      this.subscriptions.dispose();
      return this.countWordView.destroy();
    },
    serialize: function() {
      return {
        countWordViewState: this.countWordView.serialize()
      };
    },
    toggle: function() {
      var charsCount, editor, linesCount, selectedCharsCount, selectedLinesCount, selectedText, selectedWords, selectedWordsCount, text, words, wordsCount;
      if (this.modalPanel.isVisible()) {
        return this.modalPanel.hide();
      } else if (atom.workspace.getActiveTextEditor() !== void 0) {
        editor = atom.workspace.getActiveTextEditor();
        text = editor.getText();
        words = text.split(/\s+/);
        wordsCount = words.length;
        charsCount = words.join('').length;
        linesCount = text.split(/\r\n|\r|\n/).length;
        selectedText = editor.getSelectedText();
        selectedWords = selectedText.split(/\s+/);
        selectedWordsCount = selectedWords.length;
        selectedCharsCount = selectedWords.join('').length;
        selectedLinesCount = selectedText.split(/\r\n|\r|\n/).length;
        this.countWordView.setCount(wordsCount, charsCount, linesCount, selectedWordsCount, selectedCharsCount, selectedLinesCount);
        return this.modalPanel.show();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvY291bnQtd29yZC9saWIvY291bnQtd29yZC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkNBQUE7O0FBQUEsRUFBQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxtQkFBUixDQUFoQixDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBLEdBQ2Y7QUFBQSxJQUFBLGFBQUEsRUFBZSxJQUFmO0FBQUEsSUFDQSxVQUFBLEVBQVksSUFEWjtBQUFBLElBRUEsYUFBQSxFQUFlLElBRmY7QUFBQSxJQUlBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBcUIsSUFBQSxhQUFBLENBQWMsS0FBSyxDQUFDLGtCQUFwQixDQUFyQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtBQUFBLFFBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxhQUFhLENBQUMsVUFBZixDQUFBLENBQU47QUFBQSxRQUFtQyxPQUFBLEVBQVMsS0FBNUM7T0FBN0IsQ0FEZCxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBSmpCLENBQUE7YUFPQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztBQUFBLFFBQUEsbUJBQUEsRUFBcUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUFIO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckI7T0FBcEMsQ0FBbkIsRUFSUTtJQUFBLENBSlY7QUFBQSxJQWNBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsRUFIVTtJQUFBLENBZFo7QUFBQSxJQW1CQSxTQUFBLEVBQVcsU0FBQSxHQUFBO2FBQ1Q7QUFBQSxRQUFBLGtCQUFBLEVBQW9CLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBZixDQUFBLENBQXBCO1FBRFM7SUFBQSxDQW5CWDtBQUFBLElBc0JBLE1BQUEsRUFBUSxTQUFBLEdBQUE7QUFFTixVQUFBLGdKQUFBO0FBQUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBWixDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBQSxFQURGO09BQUEsTUFFSyxJQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFBLEtBQXdDLE1BQTNDO0FBQ0gsUUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVQsQ0FBQTtBQUFBLFFBRUEsSUFBQSxHQUFhLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FGYixDQUFBO0FBQUEsUUFHQSxLQUFBLEdBQWEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFYLENBSGIsQ0FBQTtBQUFBLFFBSUEsVUFBQSxHQUFhLEtBQUssQ0FBQyxNQUpuQixDQUFBO0FBQUEsUUFLQSxVQUFBLEdBQWEsS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFYLENBQWMsQ0FBQyxNQUw1QixDQUFBO0FBQUEsUUFNQSxVQUFBLEdBQWEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxZQUFYLENBQXdCLENBQUMsTUFOdEMsQ0FBQTtBQUFBLFFBUUEsWUFBQSxHQUFxQixNQUFNLENBQUMsZUFBUCxDQUFBLENBUnJCLENBQUE7QUFBQSxRQVNBLGFBQUEsR0FBcUIsWUFBWSxDQUFDLEtBQWIsQ0FBbUIsS0FBbkIsQ0FUckIsQ0FBQTtBQUFBLFFBVUEsa0JBQUEsR0FBcUIsYUFBYSxDQUFDLE1BVm5DLENBQUE7QUFBQSxRQVdBLGtCQUFBLEdBQXFCLGFBQWEsQ0FBQyxJQUFkLENBQW1CLEVBQW5CLENBQXNCLENBQUMsTUFYNUMsQ0FBQTtBQUFBLFFBWUEsa0JBQUEsR0FBcUIsWUFBWSxDQUFDLEtBQWIsQ0FBbUIsWUFBbkIsQ0FBZ0MsQ0FBQyxNQVp0RCxDQUFBO0FBQUEsUUFjQSxJQUFDLENBQUEsYUFBYSxDQUFDLFFBQWYsQ0FDRSxVQURGLEVBRUUsVUFGRixFQUdFLFVBSEYsRUFJRSxrQkFKRixFQUtFLGtCQUxGLEVBTUUsa0JBTkYsQ0FkQSxDQUFBO2VBdUJBLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFBLEVBeEJHO09BSkM7SUFBQSxDQXRCUjtHQUpGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tane/.atom/packages/count-word/lib/count-word.coffee
