(function() {
  var ManageFrontMatterView, ManagePostCategoriesView, config, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  config = require("../config");

  utils = require("../utils");

  ManageFrontMatterView = require("./manage-front-matter-view");

  module.exports = ManagePostCategoriesView = (function(superClass) {
    extend(ManagePostCategoriesView, superClass);

    function ManagePostCategoriesView() {
      return ManagePostCategoriesView.__super__.constructor.apply(this, arguments);
    }

    ManagePostCategoriesView.labelName = "Manage Post Categories";

    ManagePostCategoriesView.fieldName = config.get("frontMatterNameCategories", {
      allow_blank: false
    });

    ManagePostCategoriesView.prototype.fetchSiteFieldCandidates = function() {
      var error, succeed, uri;
      uri = config.get("urlForCategories");
      succeed = (function(_this) {
        return function(body) {
          return _this.displaySiteFieldItems(body.categories || []);
        };
      })(this);
      error = (function(_this) {
        return function(err) {
          return _this.error.text((err != null ? err.message : void 0) || ("Error fetching categories from '" + uri + "'"));
        };
      })(this);
      return utils.getJSON(uri, succeed, error);
    };

    return ManagePostCategoriesView;

  })(ManageFrontMatterView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL3ZpZXdzL21hbmFnZS1wb3N0LWNhdGVnb3JpZXMtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhEQUFBO0lBQUE7OztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsV0FBUjs7RUFDVCxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVI7O0VBRVIscUJBQUEsR0FBd0IsT0FBQSxDQUFRLDRCQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osd0JBQUMsQ0FBQSxTQUFELEdBQVk7O0lBQ1osd0JBQUMsQ0FBQSxTQUFELEdBQVksTUFBTSxDQUFDLEdBQVAsQ0FBVywyQkFBWCxFQUF3QztNQUFBLFdBQUEsRUFBYSxLQUFiO0tBQXhDOzt1Q0FFWix3QkFBQSxHQUEwQixTQUFBO0FBQ3hCLFVBQUE7TUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLEdBQVAsQ0FBVyxrQkFBWDtNQUNOLE9BQUEsR0FBVSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtpQkFDUixLQUFDLENBQUEscUJBQUQsQ0FBdUIsSUFBSSxDQUFDLFVBQUwsSUFBbUIsRUFBMUM7UUFEUTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFFVixLQUFBLEdBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7aUJBQ04sS0FBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLGdCQUFZLEdBQUcsQ0FBRSxpQkFBTCxJQUFnQixDQUFBLGtDQUFBLEdBQW1DLEdBQW5DLEdBQXVDLEdBQXZDLENBQTVCO1FBRE07TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO2FBRVIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLEVBQW1CLE9BQW5CLEVBQTRCLEtBQTVCO0lBTndCOzs7O0tBSlc7QUFOdkMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25maWcgPSByZXF1aXJlIFwiLi4vY29uZmlnXCJcbnV0aWxzID0gcmVxdWlyZSBcIi4uL3V0aWxzXCJcblxuTWFuYWdlRnJvbnRNYXR0ZXJWaWV3ID0gcmVxdWlyZSBcIi4vbWFuYWdlLWZyb250LW1hdHRlci12aWV3XCJcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTWFuYWdlUG9zdENhdGVnb3JpZXNWaWV3IGV4dGVuZHMgTWFuYWdlRnJvbnRNYXR0ZXJWaWV3XG4gIEBsYWJlbE5hbWU6IFwiTWFuYWdlIFBvc3QgQ2F0ZWdvcmllc1wiXG4gIEBmaWVsZE5hbWU6IGNvbmZpZy5nZXQoXCJmcm9udE1hdHRlck5hbWVDYXRlZ29yaWVzXCIsIGFsbG93X2JsYW5rOiBmYWxzZSlcblxuICBmZXRjaFNpdGVGaWVsZENhbmRpZGF0ZXM6IC0+XG4gICAgdXJpID0gY29uZmlnLmdldChcInVybEZvckNhdGVnb3JpZXNcIilcbiAgICBzdWNjZWVkID0gKGJvZHkpID0+XG4gICAgICBAZGlzcGxheVNpdGVGaWVsZEl0ZW1zKGJvZHkuY2F0ZWdvcmllcyB8fCBbXSlcbiAgICBlcnJvciA9IChlcnIpID0+XG4gICAgICBAZXJyb3IudGV4dChlcnI/Lm1lc3NhZ2UgfHwgXCJFcnJvciBmZXRjaGluZyBjYXRlZ29yaWVzIGZyb20gJyN7dXJpfSdcIilcbiAgICB1dGlscy5nZXRKU09OKHVyaSwgc3VjY2VlZCwgZXJyb3IpXG4iXX0=
