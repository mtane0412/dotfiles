(function() {
  var CountWord;

  CountWord = require('../lib/count-word');

  describe("CountWord", function() {
    var activationPromise, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], activationPromise = _ref[1];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return activationPromise = atom.packages.activatePackage('count-word');
    });
    return describe("when the count-word:toggle event is triggered", function() {
      it("hides and shows the modal panel", function() {
        expect(workspaceElement.querySelector('.count-word')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'count-word:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var countWordElement, countWordPanel;
          expect(workspaceElement.querySelector('.count-word')).toExist();
          countWordElement = workspaceElement.querySelector('.count-word');
          expect(countWordElement).toExist();
          countWordPanel = atom.workspace.panelForItem(countWordElement);
          expect(countWordPanel.isVisible()).toBe(true);
          atom.commands.dispatch(workspaceElement, 'count-word:toggle');
          return expect(countWordPanel.isVisible()).toBe(false);
        });
      });
      return it("hides and shows the view", function() {
        jasmine.attachToDOM(workspaceElement);
        expect(workspaceElement.querySelector('.count-word')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'count-word:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var countWordElement;
          countWordElement = workspaceElement.querySelector('.count-word');
          expect(countWordElement).toBeVisible();
          atom.commands.dispatch(workspaceElement, 'count-word:toggle');
          return expect(countWordElement).not.toBeVisible();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvY291bnQtd29yZC9zcGVjL2NvdW50LXdvcmQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsU0FBQTs7QUFBQSxFQUFBLFNBQUEsR0FBWSxPQUFBLENBQVEsbUJBQVIsQ0FBWixDQUFBOztBQUFBLEVBT0EsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQSxHQUFBO0FBQ3BCLFFBQUEseUNBQUE7QUFBQSxJQUFBLE9BQXdDLEVBQXhDLEVBQUMsMEJBQUQsRUFBbUIsMkJBQW5CLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBbkIsQ0FBQTthQUNBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixZQUE5QixFQUZYO0lBQUEsQ0FBWCxDQUZBLENBQUE7V0FNQSxRQUFBLENBQVMsK0NBQVQsRUFBMEQsU0FBQSxHQUFBO0FBQ3hELE1BQUEsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUEsR0FBQTtBQUdwQyxRQUFBLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixhQUEvQixDQUFQLENBQXFELENBQUMsR0FBRyxDQUFDLE9BQTFELENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFJQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDLG1CQUF6QyxDQUpBLENBQUE7QUFBQSxRQU1BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLGtCQURjO1FBQUEsQ0FBaEIsQ0FOQSxDQUFBO2VBU0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILGNBQUEsZ0NBQUE7QUFBQSxVQUFBLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixhQUEvQixDQUFQLENBQXFELENBQUMsT0FBdEQsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUVBLGdCQUFBLEdBQW1CLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLGFBQS9CLENBRm5CLENBQUE7QUFBQSxVQUdBLE1BQUEsQ0FBTyxnQkFBUCxDQUF3QixDQUFDLE9BQXpCLENBQUEsQ0FIQSxDQUFBO0FBQUEsVUFLQSxjQUFBLEdBQWlCLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBZixDQUE0QixnQkFBNUIsQ0FMakIsQ0FBQTtBQUFBLFVBTUEsTUFBQSxDQUFPLGNBQWMsQ0FBQyxTQUFmLENBQUEsQ0FBUCxDQUFrQyxDQUFDLElBQW5DLENBQXdDLElBQXhDLENBTkEsQ0FBQTtBQUFBLFVBT0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5QyxtQkFBekMsQ0FQQSxDQUFBO2lCQVFBLE1BQUEsQ0FBTyxjQUFjLENBQUMsU0FBZixDQUFBLENBQVAsQ0FBa0MsQ0FBQyxJQUFuQyxDQUF3QyxLQUF4QyxFQVRHO1FBQUEsQ0FBTCxFQVpvQztNQUFBLENBQXRDLENBQUEsQ0FBQTthQXVCQSxFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQSxHQUFBO0FBTzdCLFFBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsZ0JBQXBCLENBQUEsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLGFBQS9CLENBQVAsQ0FBcUQsQ0FBQyxHQUFHLENBQUMsT0FBMUQsQ0FBQSxDQUZBLENBQUE7QUFBQSxRQU1BLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsbUJBQXpDLENBTkEsQ0FBQTtBQUFBLFFBUUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2Qsa0JBRGM7UUFBQSxDQUFoQixDQVJBLENBQUE7ZUFXQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBRUgsY0FBQSxnQkFBQTtBQUFBLFVBQUEsZ0JBQUEsR0FBbUIsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0IsYUFBL0IsQ0FBbkIsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLGdCQUFQLENBQXdCLENBQUMsV0FBekIsQ0FBQSxDQURBLENBQUE7QUFBQSxVQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsbUJBQXpDLENBRkEsQ0FBQTtpQkFHQSxNQUFBLENBQU8sZ0JBQVAsQ0FBd0IsQ0FBQyxHQUFHLENBQUMsV0FBN0IsQ0FBQSxFQUxHO1FBQUEsQ0FBTCxFQWxCNkI7TUFBQSxDQUEvQixFQXhCd0Q7SUFBQSxDQUExRCxFQVBvQjtFQUFBLENBQXRCLENBUEEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tane/.atom/packages/count-word/spec/count-word-spec.coffee
