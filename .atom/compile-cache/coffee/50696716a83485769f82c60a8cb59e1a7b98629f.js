(function() {
  var CountWordView;

  module.exports = CountWordView = (function() {
    function CountWordView(serializedState) {
      var allTextResultElm, allTextTitle, selectedTextElm, selectedTextTitle;
      this.element = document.createElement('div');
      this.element.classList.add('count-word');
      allTextTitle = document.createElement('p');
      allTextTitle.textContent = "ALL TEXT";
      allTextTitle.classList.add('count-title');
      this.element.appendChild(allTextTitle);
      allTextResultElm = document.createElement('p');
      allTextResultElm.classList.add('count-message');
      this.element.appendChild(allTextResultElm);
      selectedTextTitle = document.createElement('p');
      selectedTextTitle.textContent = "SELECTED TEXT";
      selectedTextTitle.classList.add('count-title');
      this.element.appendChild(selectedTextTitle);
      selectedTextElm = document.createElement('p');
      selectedTextElm.classList.add('count-message');
      this.element.appendChild(selectedTextElm);
    }

    CountWordView.prototype.serialize = function() {};

    CountWordView.prototype.destroy = function() {
      return this.element.remove();
    };

    CountWordView.prototype.getElement = function() {
      return this.element;
    };

    CountWordView.prototype.setCount = function(wordsCount, charsCount, linesCount, selectedWordsCount, selectedCharsCount, selectedLinesCount) {
      var allTextResult, selectedTextResult;
      allTextResult = "Characters : " + charsCount + "　Words : " + wordsCount + "　Lines : " + linesCount;
      this.element.children[1].textContent = allTextResult;
      if (selectedCharsCount > 0) {
        this.element.children[2].classList.remove('count-hidden');
        this.element.children[3].classList.remove('count-hidden');
        selectedTextResult = "Characters : " + selectedCharsCount + "　Words : " + selectedWordsCount + "　Lines : " + selectedLinesCount;
        return this.element.children[3].textContent = selectedTextResult;
      } else {
        this.element.children[2].classList.add('count-hidden');
        return this.element.children[3].classList.add('count-hidden');
      }
    };

    return CountWordView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvY291bnQtd29yZC9saWIvY291bnQtd29yZC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxhQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsdUJBQUMsZUFBRCxHQUFBO0FBRVgsVUFBQSxrRUFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLFlBQXZCLENBREEsQ0FBQTtBQUFBLE1BR0EsWUFBQSxHQUFlLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCLENBSGYsQ0FBQTtBQUFBLE1BSUEsWUFBWSxDQUFDLFdBQWIsR0FBMkIsVUFKM0IsQ0FBQTtBQUFBLE1BS0EsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUF2QixDQUEyQixhQUEzQixDQUxBLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixZQUFyQixDQU5BLENBQUE7QUFBQSxNQVFBLGdCQUFBLEdBQW1CLFFBQVEsQ0FBQyxhQUFULENBQXVCLEdBQXZCLENBUm5CLENBQUE7QUFBQSxNQVNBLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxHQUEzQixDQUErQixlQUEvQixDQVRBLENBQUE7QUFBQSxNQVVBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixnQkFBckIsQ0FWQSxDQUFBO0FBQUEsTUFZQSxpQkFBQSxHQUFvQixRQUFRLENBQUMsYUFBVCxDQUF1QixHQUF2QixDQVpwQixDQUFBO0FBQUEsTUFhQSxpQkFBaUIsQ0FBQyxXQUFsQixHQUFnQyxlQWJoQyxDQUFBO0FBQUEsTUFjQSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsR0FBNUIsQ0FBZ0MsYUFBaEMsQ0FkQSxDQUFBO0FBQUEsTUFlQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsaUJBQXJCLENBZkEsQ0FBQTtBQUFBLE1BaUJBLGVBQUEsR0FBa0IsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkIsQ0FqQmxCLENBQUE7QUFBQSxNQWtCQSxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQTFCLENBQThCLGVBQTlCLENBbEJBLENBQUE7QUFBQSxNQW1CQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsZUFBckIsQ0FuQkEsQ0FGVztJQUFBLENBQWI7O0FBQUEsNEJBd0JBLFNBQUEsR0FBVyxTQUFBLEdBQUEsQ0F4QlgsQ0FBQTs7QUFBQSw0QkEyQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBLEVBRE87SUFBQSxDQTNCVCxDQUFBOztBQUFBLDRCQThCQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLFFBRFM7SUFBQSxDQTlCWixDQUFBOztBQUFBLDRCQWlDQSxRQUFBLEdBQVUsU0FBQyxVQUFELEVBQWEsVUFBYixFQUF5QixVQUF6QixFQUNBLGtCQURBLEVBQ29CLGtCQURwQixFQUN3QyxrQkFEeEMsR0FBQTtBQUdSLFVBQUEsaUNBQUE7QUFBQSxNQUFBLGFBQUEsR0FDRyxlQUFBLEdBQWUsVUFBZixHQUEwQixXQUExQixHQUFxQyxVQUFyQyxHQUFnRCxXQUFoRCxHQUEyRCxVQUQ5RCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFyQixHQUFtQyxhQUZuQyxDQUFBO0FBSUEsTUFBQSxJQUFHLGtCQUFBLEdBQXFCLENBQXhCO0FBQ0UsUUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUFTLENBQUMsTUFBL0IsQ0FBc0MsY0FBdEMsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUFTLENBQUMsTUFBL0IsQ0FBc0MsY0FBdEMsQ0FEQSxDQUFBO0FBQUEsUUFFQSxrQkFBQSxHQUNHLGVBQUEsR0FBZSxrQkFBZixHQUFrQyxXQUFsQyxHQUE2QyxrQkFBN0MsR0FBZ0UsV0FBaEUsR0FBMkUsa0JBSDlFLENBQUE7ZUFJQSxJQUFDLENBQUEsT0FBTyxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFyQixHQUFtQyxtQkFMckM7T0FBQSxNQUFBO0FBT0UsUUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUFTLENBQUMsR0FBL0IsQ0FBbUMsY0FBbkMsQ0FBQSxDQUFBO2VBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBUyxDQUFDLEdBQS9CLENBQW1DLGNBQW5DLEVBUkY7T0FQUTtJQUFBLENBakNWLENBQUE7O3lCQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tane/.atom/packages/count-word/lib/count-word-view.coffee
