(function() {
  var DotinstallPane;

  DotinstallPane = require('../lib/dotinstall-pane');

  describe("DotinstallPane", function() {
    var activationPromise, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], activationPromise = _ref[1];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return activationPromise = atom.packages.activatePackage('dotinstall-pane');
    });
    return describe("when the dotinstall-pane:toggle event is triggered", function() {
      it("hides and shows the modal panel", function() {
        expect(workspaceElement.querySelector('.dotinstall-pane')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'dotinstall-pane:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var dotinstallPaneElement, dotinstallPanePanel;
          expect(workspaceElement.querySelector('.dotinstall-pane')).toExist();
          dotinstallPaneElement = workspaceElement.querySelector('.dotinstall-pane');
          expect(dotinstallPaneElement).toExist();
          dotinstallPanePanel = atom.workspace.panelForItem(dotinstallPaneElement);
          expect(dotinstallPanePanel.isVisible()).toBe(true);
          atom.commands.dispatch(workspaceElement, 'dotinstall-pane:toggle');
          return expect(dotinstallPanePanel.isVisible()).toBe(false);
        });
      });
      return it("hides and shows the view", function() {
        jasmine.attachToDOM(workspaceElement);
        expect(workspaceElement.querySelector('.dotinstall-pane')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'dotinstall-pane:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var dotinstallPaneElement;
          dotinstallPaneElement = workspaceElement.querySelector('.dotinstall-pane');
          expect(dotinstallPaneElement).toBeVisible();
          atom.commands.dispatch(workspaceElement, 'dotinstall-pane:toggle');
          return expect(dotinstallPaneElement).not.toBeVisible();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvZG90aW5zdGFsbC1wYW5lL3NwZWMvZG90aW5zdGFsbC1wYW5lLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGNBQUE7O0FBQUEsRUFBQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSx3QkFBUixDQUFqQixDQUFBOztBQUFBLEVBT0EsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEsR0FBQTtBQUN6QixRQUFBLHlDQUFBO0FBQUEsSUFBQSxPQUF3QyxFQUF4QyxFQUFDLDBCQUFELEVBQW1CLDJCQUFuQixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQW5CLENBQUE7YUFDQSxpQkFBQSxHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsaUJBQTlCLEVBRlg7SUFBQSxDQUFYLENBRkEsQ0FBQTtXQU1BLFFBQUEsQ0FBUyxvREFBVCxFQUErRCxTQUFBLEdBQUE7QUFDN0QsTUFBQSxFQUFBLENBQUcsaUNBQUgsRUFBc0MsU0FBQSxHQUFBO0FBR3BDLFFBQUEsTUFBQSxDQUFPLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLGtCQUEvQixDQUFQLENBQTBELENBQUMsR0FBRyxDQUFDLE9BQS9ELENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFJQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDLHdCQUF6QyxDQUpBLENBQUE7QUFBQSxRQU1BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLGtCQURjO1FBQUEsQ0FBaEIsQ0FOQSxDQUFBO2VBU0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILGNBQUEsMENBQUE7QUFBQSxVQUFBLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixrQkFBL0IsQ0FBUCxDQUEwRCxDQUFDLE9BQTNELENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFFQSxxQkFBQSxHQUF3QixnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixrQkFBL0IsQ0FGeEIsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLHFCQUFQLENBQTZCLENBQUMsT0FBOUIsQ0FBQSxDQUhBLENBQUE7QUFBQSxVQUtBLG1CQUFBLEdBQXNCLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBZixDQUE0QixxQkFBNUIsQ0FMdEIsQ0FBQTtBQUFBLFVBTUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFNBQXBCLENBQUEsQ0FBUCxDQUF1QyxDQUFDLElBQXhDLENBQTZDLElBQTdDLENBTkEsQ0FBQTtBQUFBLFVBT0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5Qyx3QkFBekMsQ0FQQSxDQUFBO2lCQVFBLE1BQUEsQ0FBTyxtQkFBbUIsQ0FBQyxTQUFwQixDQUFBLENBQVAsQ0FBdUMsQ0FBQyxJQUF4QyxDQUE2QyxLQUE3QyxFQVRHO1FBQUEsQ0FBTCxFQVpvQztNQUFBLENBQXRDLENBQUEsQ0FBQTthQXVCQSxFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQSxHQUFBO0FBTzdCLFFBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsZ0JBQXBCLENBQUEsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLGtCQUEvQixDQUFQLENBQTBELENBQUMsR0FBRyxDQUFDLE9BQS9ELENBQUEsQ0FGQSxDQUFBO0FBQUEsUUFNQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDLHdCQUF6QyxDQU5BLENBQUE7QUFBQSxRQVFBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLGtCQURjO1FBQUEsQ0FBaEIsQ0FSQSxDQUFBO2VBV0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUVILGNBQUEscUJBQUE7QUFBQSxVQUFBLHFCQUFBLEdBQXdCLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLGtCQUEvQixDQUF4QixDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8scUJBQVAsQ0FBNkIsQ0FBQyxXQUE5QixDQUFBLENBREEsQ0FBQTtBQUFBLFVBRUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5Qyx3QkFBekMsQ0FGQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxxQkFBUCxDQUE2QixDQUFDLEdBQUcsQ0FBQyxXQUFsQyxDQUFBLEVBTEc7UUFBQSxDQUFMLEVBbEI2QjtNQUFBLENBQS9CLEVBeEI2RDtJQUFBLENBQS9ELEVBUHlCO0VBQUEsQ0FBM0IsQ0FQQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tane/.atom/packages/dotinstall-pane/spec/dotinstall-pane-spec.coffee
