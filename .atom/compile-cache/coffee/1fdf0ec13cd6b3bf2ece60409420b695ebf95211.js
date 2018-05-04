(function() {
  var InsertImage, InsertImageClipboardView, InsertImageFileView, clipboard;

  clipboard = require('clipboard');

  InsertImageFileView = require("../views/insert-image-file-view");

  InsertImageClipboardView = require("../views/insert-image-clipboard-view");

  module.exports = InsertImage = (function() {
    function InsertImage() {}

    InsertImage.prototype.trigger = function(e) {
      var view;
      if (clipboard.readImage().isEmpty()) {
        view = new InsertImageFileView();
        return view.display();
      } else {
        view = new InsertImageClipboardView();
        return view.display();
      }
    };

    return InsertImage;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL2NvbW1hbmRzL2luc2VydC1pbWFnZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFNBQUEsR0FBWSxPQUFBLENBQVEsV0FBUjs7RUFFWixtQkFBQSxHQUFzQixPQUFBLENBQVEsaUNBQVI7O0VBQ3RCLHdCQUFBLEdBQTJCLE9BQUEsQ0FBUSxzQ0FBUjs7RUFFM0IsTUFBTSxDQUFDLE9BQVAsR0FDTTs7OzBCQUNKLE9BQUEsR0FBUyxTQUFDLENBQUQ7QUFDUCxVQUFBO01BQUEsSUFBRyxTQUFTLENBQUMsU0FBVixDQUFBLENBQXFCLENBQUMsT0FBdEIsQ0FBQSxDQUFIO1FBQ0UsSUFBQSxHQUFPLElBQUksbUJBQUosQ0FBQTtlQUNQLElBQUksQ0FBQyxPQUFMLENBQUEsRUFGRjtPQUFBLE1BQUE7UUFJRSxJQUFBLEdBQU8sSUFBSSx3QkFBSixDQUFBO2VBQ1AsSUFBSSxDQUFDLE9BQUwsQ0FBQSxFQUxGOztJQURPOzs7OztBQVBYIiwic291cmNlc0NvbnRlbnQiOlsiY2xpcGJvYXJkID0gcmVxdWlyZSAnY2xpcGJvYXJkJ1xuXG5JbnNlcnRJbWFnZUZpbGVWaWV3ID0gcmVxdWlyZSBcIi4uL3ZpZXdzL2luc2VydC1pbWFnZS1maWxlLXZpZXdcIlxuSW5zZXJ0SW1hZ2VDbGlwYm9hcmRWaWV3ID0gcmVxdWlyZSBcIi4uL3ZpZXdzL2luc2VydC1pbWFnZS1jbGlwYm9hcmQtdmlld1wiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEluc2VydEltYWdlXG4gIHRyaWdnZXI6IChlKSAtPlxuICAgIGlmIGNsaXBib2FyZC5yZWFkSW1hZ2UoKS5pc0VtcHR5KClcbiAgICAgIHZpZXcgPSBuZXcgSW5zZXJ0SW1hZ2VGaWxlVmlldygpXG4gICAgICB2aWV3LmRpc3BsYXkoKVxuICAgIGVsc2VcbiAgICAgIHZpZXcgPSBuZXcgSW5zZXJ0SW1hZ2VDbGlwYm9hcmRWaWV3KClcbiAgICAgIHZpZXcuZGlzcGxheSgpXG4iXX0=
