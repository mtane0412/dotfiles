(function() {
  var ManageFrontMatterView, ManagePostTagsView, config, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  config = require("../config");

  utils = require("../utils");

  ManageFrontMatterView = require("./manage-front-matter-view");

  module.exports = ManagePostTagsView = (function(superClass) {
    extend(ManagePostTagsView, superClass);

    function ManagePostTagsView() {
      return ManagePostTagsView.__super__.constructor.apply(this, arguments);
    }

    ManagePostTagsView.labelName = "Manage Post Tags";

    ManagePostTagsView.fieldName = config.get("frontMatterNameTags", {
      allow_blank: false
    });

    ManagePostTagsView.prototype.fetchSiteFieldCandidates = function() {
      var error, succeed, uri;
      uri = config.get("urlForTags");
      succeed = (function(_this) {
        return function(body) {
          var tags;
          tags = body.tags.map(function(tag) {
            return {
              name: tag,
              count: 0
            };
          });
          _this.rankTags(tags, _this.editor.getText());
          return _this.displaySiteFieldItems(tags.map(function(tag) {
            return tag.name;
          }));
        };
      })(this);
      error = (function(_this) {
        return function(err) {
          return _this.error.text((err != null ? err.message : void 0) || ("Error fetching tags from '" + uri + "'"));
        };
      })(this);
      return utils.getJSON(uri, succeed, error);
    };

    ManagePostTagsView.prototype.rankTags = function(tags, content) {
      tags.forEach(function(tag) {
        var ref, tagRegex;
        tagRegex = RegExp("" + (utils.escapeRegExp(tag.name)), "ig");
        return tag.count = ((ref = content.match(tagRegex)) != null ? ref.length : void 0) || 0;
      });
      return tags.sort(function(t1, t2) {
        return t2.count - t1.count;
      });
    };

    return ManagePostTagsView;

  })(ManageFrontMatterView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL3ZpZXdzL21hbmFnZS1wb3N0LXRhZ3Mtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHdEQUFBO0lBQUE7OztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsV0FBUjs7RUFDVCxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVI7O0VBRVIscUJBQUEsR0FBd0IsT0FBQSxDQUFRLDRCQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osa0JBQUMsQ0FBQSxTQUFELEdBQVk7O0lBQ1osa0JBQUMsQ0FBQSxTQUFELEdBQVksTUFBTSxDQUFDLEdBQVAsQ0FBVyxxQkFBWCxFQUFrQztNQUFBLFdBQUEsRUFBYSxLQUFiO0tBQWxDOztpQ0FFWix3QkFBQSxHQUEwQixTQUFBO0FBQ3hCLFVBQUE7TUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLEdBQVAsQ0FBVyxZQUFYO01BQ04sT0FBQSxHQUFVLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO0FBQ1IsY0FBQTtVQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQVYsQ0FBYyxTQUFDLEdBQUQ7bUJBQVM7Y0FBQSxJQUFBLEVBQU0sR0FBTjtjQUFXLEtBQUEsRUFBTyxDQUFsQjs7VUFBVCxDQUFkO1VBQ1AsS0FBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWLEVBQWdCLEtBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBLENBQWhCO2lCQUNBLEtBQUMsQ0FBQSxxQkFBRCxDQUF1QixJQUFJLENBQUMsR0FBTCxDQUFTLFNBQUMsR0FBRDttQkFBUyxHQUFHLENBQUM7VUFBYixDQUFULENBQXZCO1FBSFE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BSVYsS0FBQSxHQUFRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO2lCQUNOLEtBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxnQkFBWSxHQUFHLENBQUUsaUJBQUwsSUFBZ0IsQ0FBQSw0QkFBQSxHQUE2QixHQUE3QixHQUFpQyxHQUFqQyxDQUE1QjtRQURNO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTthQUVSLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxFQUFtQixPQUFuQixFQUE0QixLQUE1QjtJQVJ3Qjs7aUNBVzFCLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxPQUFQO01BQ1IsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFDLEdBQUQ7QUFDWCxZQUFBO1FBQUEsUUFBQSxHQUFXLE1BQUEsQ0FBQSxFQUFBLEdBQUssQ0FBQyxLQUFLLENBQUMsWUFBTixDQUFtQixHQUFHLENBQUMsSUFBdkIsQ0FBRCxDQUFMLEVBQXNDLElBQXRDO2VBQ1gsR0FBRyxDQUFDLEtBQUosaURBQW1DLENBQUUsZ0JBQXpCLElBQW1DO01BRnBDLENBQWI7YUFHQSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQUMsRUFBRCxFQUFLLEVBQUw7ZUFBWSxFQUFFLENBQUMsS0FBSCxHQUFXLEVBQUUsQ0FBQztNQUExQixDQUFWO0lBSlE7Ozs7S0FmcUI7QUFOakMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25maWcgPSByZXF1aXJlIFwiLi4vY29uZmlnXCJcbnV0aWxzID0gcmVxdWlyZSBcIi4uL3V0aWxzXCJcblxuTWFuYWdlRnJvbnRNYXR0ZXJWaWV3ID0gcmVxdWlyZSBcIi4vbWFuYWdlLWZyb250LW1hdHRlci12aWV3XCJcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTWFuYWdlUG9zdFRhZ3NWaWV3IGV4dGVuZHMgTWFuYWdlRnJvbnRNYXR0ZXJWaWV3XG4gIEBsYWJlbE5hbWU6IFwiTWFuYWdlIFBvc3QgVGFnc1wiXG4gIEBmaWVsZE5hbWU6IGNvbmZpZy5nZXQoXCJmcm9udE1hdHRlck5hbWVUYWdzXCIsIGFsbG93X2JsYW5rOiBmYWxzZSlcblxuICBmZXRjaFNpdGVGaWVsZENhbmRpZGF0ZXM6IC0+XG4gICAgdXJpID0gY29uZmlnLmdldChcInVybEZvclRhZ3NcIilcbiAgICBzdWNjZWVkID0gKGJvZHkpID0+XG4gICAgICB0YWdzID0gYm9keS50YWdzLm1hcCgodGFnKSAtPiBuYW1lOiB0YWcsIGNvdW50OiAwKVxuICAgICAgQHJhbmtUYWdzKHRhZ3MsIEBlZGl0b3IuZ2V0VGV4dCgpKVxuICAgICAgQGRpc3BsYXlTaXRlRmllbGRJdGVtcyh0YWdzLm1hcCgodGFnKSAtPiB0YWcubmFtZSkpXG4gICAgZXJyb3IgPSAoZXJyKSA9PlxuICAgICAgQGVycm9yLnRleHQoZXJyPy5tZXNzYWdlIHx8IFwiRXJyb3IgZmV0Y2hpbmcgdGFncyBmcm9tICcje3VyaX0nXCIpXG4gICAgdXRpbHMuZ2V0SlNPTih1cmksIHN1Y2NlZWQsIGVycm9yKVxuXG4gICMgcmFuayB0YWdzIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgdGltZXMgdGhleSBhcHBlYXJlZCBpbiBjb250ZW50XG4gIHJhbmtUYWdzOiAodGFncywgY29udGVudCkgLT5cbiAgICB0YWdzLmZvckVhY2ggKHRhZykgLT5cbiAgICAgIHRhZ1JlZ2V4ID0gLy8vICN7dXRpbHMuZXNjYXBlUmVnRXhwKHRhZy5uYW1lKX0gLy8vaWdcbiAgICAgIHRhZy5jb3VudCA9IGNvbnRlbnQubWF0Y2godGFnUmVnZXgpPy5sZW5ndGggfHwgMFxuICAgIHRhZ3Muc29ydCAodDEsIHQyKSAtPiB0Mi5jb3VudCAtIHQxLmNvdW50XG4iXX0=
