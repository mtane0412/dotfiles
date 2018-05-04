(function() {
  var $, FrontMatter, config, create, getDateTime, getEditor, getFileRelativeDir, getFileSlug, getFrontMatter, getFrontMatterDate, getTemplateVariables, parseFrontMatterDate, path, utils,
    slice = [].slice;

  $ = require("atom-space-pen-views").$;

  path = require("path");

  config = require("../config");

  utils = require("../utils");

  FrontMatter = require("./front-matter");

  create = function() {
    var data, key;
    key = arguments[0], data = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    data = $.extend.apply($, [{}, getTemplateVariables()].concat(slice.call(data)));
    return utils.template(config.get(key), data);
  };

  getTemplateVariables = function() {
    return $.extend({
      site: config.get("siteUrl")
    }, config.get("templateVariables") || {});
  };

  getDateTime = function(date) {
    if (date == null) {
      date = new Date();
    }
    return utils.getDate(date);
  };

  getFrontMatterDate = function(dateTime) {
    return utils.template(config.get("frontMatterDate"), dateTime);
  };

  parseFrontMatterDate = function(str) {
    var dateHash, fn;
    fn = utils.untemplate(config.get("frontMatterDate"));
    dateHash = fn(str);
    if (dateHash) {
      return utils.parseDate(dateHash);
    }
  };

  getFrontMatter = function(frontMatter) {
    return {
      layout: frontMatter.getLayout(),
      published: frontMatter.getPublished(),
      title: frontMatter.getTitle(),
      slug: frontMatter.getSlug(),
      date: frontMatter.getDate(),
      extension: frontMatter.getExtension()
    };
  };

  getFileSlug = function(filePath) {
    var filename, hash, i, len, template, templates;
    if (!filePath) {
      return "";
    }
    filename = path.basename(filePath);
    templates = [config.get("newPostFileName"), config.get("newDraftFileName"), "{slug}{extension}"];
    for (i = 0, len = templates.length; i < len; i++) {
      template = templates[i];
      hash = utils.untemplate(template)(filename);
      if (hash && (hash["slug"] || hash["title"])) {
        return hash["slug"] || hash["title"];
      }
    }
  };

  getFileRelativeDir = function(filePath) {
    var fileDir, siteDir;
    if (!filePath) {
      return "";
    }
    siteDir = utils.getSitePath(config.get("siteLocalDir"));
    fileDir = path.dirname(filePath);
    return path.relative(siteDir, fileDir);
  };

  getEditor = function(editor) {
    var data, frontMatter;
    frontMatter = new FrontMatter(editor, {
      silent: true
    });
    data = frontMatter.getContent();
    data["category"] = frontMatter.getArray(config.get("frontMatterNameCategories", {
      allow_blank: false
    }))[0];
    data["tag"] = frontMatter.getArray(config.get("frontMatterNameTags", {
      allow_blank: false
    }))[0];
    data["directory"] = getFileRelativeDir(editor.getPath());
    data["slug"] = getFileSlug(editor.getPath()) || utils.slugize(data["title"], config.get("slugSeparator"));
    data["extension"] = path.extname(editor.getPath()) || config.get("fileExtension");
    return data;
  };

  module.exports = {
    create: create,
    getTemplateVariables: getTemplateVariables,
    getDateTime: getDateTime,
    getFrontMatter: getFrontMatter,
    getFrontMatterDate: getFrontMatterDate,
    parseFrontMatterDate: parseFrontMatterDate,
    getEditor: getEditor,
    getFileSlug: getFileSlug
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvRHJvcGJveC9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi13cml0ZXIvbGliL2hlbHBlcnMvdGVtcGxhdGUtaGVscGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0xBQUE7SUFBQTs7RUFBQyxJQUFLLE9BQUEsQ0FBUSxzQkFBUjs7RUFDTixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBQSxHQUFTLE9BQUEsQ0FBUSxXQUFSOztFQUNULEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUjs7RUFDUixXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUdkLE1BQUEsR0FBUyxTQUFBO0FBQ1AsUUFBQTtJQURRLG9CQUFLO0lBQ2IsSUFBQSxHQUFPLENBQUMsQ0FBQyxNQUFGLFVBQVMsQ0FBQSxFQUFBLEVBQUksb0JBQUEsQ0FBQSxDQUF3QixTQUFBLFdBQUEsSUFBQSxDQUFBLENBQXJDO1dBQ1AsS0FBSyxDQUFDLFFBQU4sQ0FBZSxNQUFNLENBQUMsR0FBUCxDQUFXLEdBQVgsQ0FBZixFQUFnQyxJQUFoQztFQUZPOztFQUlULG9CQUFBLEdBQXVCLFNBQUE7V0FDckIsQ0FBQyxDQUFDLE1BQUYsQ0FBUztNQUFFLElBQUEsRUFBTSxNQUFNLENBQUMsR0FBUCxDQUFXLFNBQVgsQ0FBUjtLQUFULEVBQTBDLE1BQU0sQ0FBQyxHQUFQLENBQVcsbUJBQVgsQ0FBQSxJQUFtQyxFQUE3RTtFQURxQjs7RUFHdkIsV0FBQSxHQUFjLFNBQUMsSUFBRDs7TUFBQyxPQUFPLElBQUksSUFBSixDQUFBOztXQUNwQixLQUFLLENBQUMsT0FBTixDQUFjLElBQWQ7RUFEWTs7RUFHZCxrQkFBQSxHQUFxQixTQUFDLFFBQUQ7V0FDbkIsS0FBSyxDQUFDLFFBQU4sQ0FBZSxNQUFNLENBQUMsR0FBUCxDQUFXLGlCQUFYLENBQWYsRUFBOEMsUUFBOUM7RUFE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QSxDQUFMLEdBQW9CLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFiLENBQUEsSUFBa0MsTUFBTSxDQUFDLEdBQVAsQ0FBVyxlQUFYO1dBQ3REO0VBUlU7O0VBVVosTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFBUSxNQUFSO0lBQ0Esb0JBQUEsRUFBc0Isb0JBRHRCO0lBRUEsV0FBQSxFQUFhLFdBRmI7SUFHQSxjQUFBLEVBQWdCLGNBSGhCO0lBSUEsa0JBQUEsRUFBb0Isa0JBSnBCO0lBS0Esb0JBQUEsRUFBc0Isb0JBTHRCO0lBTUEsU0FBQSxFQUFXLFNBTlg7SUFPQSxXQUFBLEVBQWEsV0FQYjs7QUE5REYiLCJzb3VyY2VzQ29udGVudCI6WyJ7JH0gPSByZXF1aXJlIFwiYXRvbS1zcGFjZS1wZW4tdmlld3NcIlxucGF0aCA9IHJlcXVpcmUgXCJwYXRoXCJcblxuY29uZmlnID0gcmVxdWlyZSBcIi4uL2NvbmZpZ1wiXG51dGlscyA9IHJlcXVpcmUgXCIuLi91dGlsc1wiXG5Gcm9udE1hdHRlciA9IHJlcXVpcmUgXCIuL2Zyb250LW1hdHRlclwiXG5cbiMgQWxsIHRlbXBsYXRlIHNob3VsZCBiZSBjcmVhdGVkIGZyb20gaGVyZVxuY3JlYXRlID0gKGtleSwgZGF0YS4uLikgLT5cbiAgZGF0YSA9ICQuZXh0ZW5kKHt9LCBnZXRUZW1wbGF0ZVZhcmlhYmxlcygpLCBkYXRhLi4uKVxuICB1dGlscy50ZW1wbGF0ZShjb25maWcuZ2V0KGtleSksIGRhdGEpXG5cbmdldFRlbXBsYXRlVmFyaWFibGVzID0gLT5cbiAgJC5leHRlbmQoeyBzaXRlOiBjb25maWcuZ2V0KFwic2l0ZVVybFwiKSB9LCBjb25maWcuZ2V0KFwidGVtcGxhdGVWYXJpYWJsZXNcIikgfHwge30pXG5cbmdldERhdGVUaW1lID0gKGRhdGUgPSBuZXcgRGF0ZSgpKSAtPlxuICB1dGlscy5nZXREYXRlKGRhdGUpXG5cbmdldEZyb250TWF0dGVyRGF0ZSA9IChkYXRlVGltZSkgLT5cbiAgdXRpbHMudGVtcGxhdGUoY29uZmlnLmdldChcImZyb250TWF0dGVyRGF0ZVwiKSwgZGF0ZVRpbWUpXG5cbnBhcnNlRnJvbnRNYXR0ZXJEYXRlID0gKHN0cikgLT5cbiAgZm4gPSB1dGlscy51bnRlbXBsYXRlKGNvbmZpZy5nZXQoXCJmcm9udE1hdHRlckRhdGVcIikpXG4gIGRhdGVIYXNoID0gZm4oc3RyKVxuICB1dGlscy5wYXJzZURhdGUoZGF0ZUhhc2gpIGlmIGRhdGVIYXNoXG5cbmdldEZyb250TWF0dGVyID0gKGZyb250TWF0dGVyKSAtPlxuICBsYXlvdXQ6IGZyb250TWF0dGVyLmdldExheW91dCgpXG4gIHB1Ymxpc2hlZDogZnJvbnRNYXR0ZXIuZ2V0UHVibGlzaGVkKClcbiAgdGl0bGU6IGZyb250TWF0dGVyLmdldFRpdGxlKClcbiAgc2x1ZzogZnJvbnRNYXR0ZXIuZ2V0U2x1ZygpXG4gIGRhdGU6IGZyb250TWF0dGVyLmdldERhdGUoKVxuICBleHRlbnNpb246IGZyb250TWF0dGVyLmdldEV4dGVuc2lvbigpXG5cbmdldEZpbGVTbHVnID0gKGZpbGVQYXRoKSAtPlxuICByZXR1cm4gXCJcIiB1bmxlc3MgZmlsZVBhdGhcblxuICBmaWxlbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpXG4gIHRlbXBsYXRlcyA9IFtjb25maWcuZ2V0KFwibmV3UG9zdEZpbGVOYW1lXCIpLCBjb25maWcuZ2V0KFwibmV3RHJhZnRGaWxlTmFtZVwiKSwgXCJ7c2x1Z317ZXh0ZW5zaW9ufVwiXVxuICBmb3IgdGVtcGxhdGUgaW4gdGVtcGxhdGVzXG4gICAgaGFzaCA9IHV0aWxzLnVudGVtcGxhdGUodGVtcGxhdGUpKGZpbGVuYW1lKVxuICAgIGlmIGhhc2ggJiYgKGhhc2hbXCJzbHVnXCJdIHx8IGhhc2hbXCJ0aXRsZVwiXSkgIyB0aXRsZSBpcyB0aGUgbGVnYWN5IHNsdWcgYWxpYXMgaW4gZmlsZW5hbWVcbiAgICAgIHJldHVybiBoYXNoW1wic2x1Z1wiXSB8fCBoYXNoW1widGl0bGVcIl1cblxuZ2V0RmlsZVJlbGF0aXZlRGlyID0gKGZpbGVQYXRoKSAtPlxuICByZXR1cm4gXCJcIiB1bmxlc3MgZmlsZVBhdGhcblxuICBzaXRlRGlyID0gdXRpbHMuZ2V0U2l0ZVBhdGgoY29uZmlnLmdldChcInNpdGVMb2NhbERpclwiKSlcbiAgZmlsZURpciA9IHBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgcGF0aC5yZWxhdGl2ZShzaXRlRGlyLCBmaWxlRGlyKVxuXG5nZXRFZGl0b3IgPSAoZWRpdG9yKSAtPlxuICBmcm9udE1hdHRlciA9IG5ldyBGcm9udE1hdHRlcihlZGl0b3IsIHsgc2lsZW50OiB0cnVlIH0pXG4gIGRhdGEgPSBmcm9udE1hdHRlci5nZXRDb250ZW50KClcbiAgZGF0YVtcImNhdGVnb3J5XCJdID0gZnJvbnRNYXR0ZXIuZ2V0QXJyYXkoY29uZmlnLmdldChcImZyb250TWF0dGVyTmFtZUNhdGVnb3JpZXNcIiwgYWxsb3dfYmxhbms6IGZhbHNlKSlbMF1cbiAgZGF0YVtcInRhZ1wiXSA9IGZyb250TWF0dGVyLmdldEFycmF5KGNvbmZpZy5nZXQoXCJmcm9udE1hdHRlck5hbWVUYWdzXCIsIGFsbG93X2JsYW5rOiBmYWxzZSkpWzBdXG4gIGRhdGFbXCJkaXJlY3RvcnlcIl0gPSBnZXRGaWxlUmVsYXRpdmVEaXIoZWRpdG9yLmdldFBhdGgoKSlcbiAgZGF0YVtcInNsdWdcIl0gPSBnZXRGaWxlU2x1ZyhlZGl0b3IuZ2V0UGF0aCgpKSB8fCB1dGlscy5zbHVnaXplKGRhdGFbXCJ0aXRsZVwiXSwgY29uZmlnLmdldChcInNsdWdTZXBhcmF0b3JcIikpXG4gIGRhdGFbXCJleHRlbnNpb25cIl0gPSBwYXRoLmV4dG5hbWUoZWRpdG9yLmdldFBhdGgoKSkgfHwgY29uZmlnLmdldChcImZpbGVFeHRlbnNpb25cIilcbiAgZGF0YVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNyZWF0ZTogY3JlYXRlXG4gIGdldFRlbXBsYXRlVmFyaWFibGVzOiBnZXRUZW1wbGF0ZVZhcmlhYmxlc1xuICBnZXREYXRlVGltZTogZ2V0RGF0ZVRpbWVcbiAgZ2V0RnJvbnRNYXR0ZXI6IGdldEZyb250TWF0dGVyXG4gIGdldEZyb250TWF0dGVyRGF0ZTogZ2V0RnJvbnRNYXR0ZXJEYXRlXG4gIHBhcnNlRnJvbnRNYXR0ZXJEYXRlOiBwYXJzZUZyb250TWF0dGVyRGF0ZVxuICBnZXRFZGl0b3I6IGdldEVkaXRvclxuICBnZXRGaWxlU2x1ZzogZ2V0RmlsZVNsdWdcbiJdfQ==
