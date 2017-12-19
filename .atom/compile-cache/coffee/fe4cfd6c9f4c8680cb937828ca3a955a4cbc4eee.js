(function() {
  (function() {
    var __slice_, vm;
    RegExp.escape = function(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };
    vm = void 0;
    __slice_ = [].slice;
    vm = require("vm");
    exports.allowUnsafeEval = function(fn) {
      var previousEval;
      previousEval = void 0;
      previousEval = global["eval"];
      try {
        global["eval"] = function(source) {
          return vm.runInThisContext(source);
        };
        return fn();
      } finally {
        global["eval"] = previousEval;
      }
    };
    exports.allowUnsafeNewFunction = function(fn) {
      var previousFunction;
      previousFunction = void 0;
      previousFunction = global.Function;
      try {
        global.Function = exports.Function;
        return fn();
      } finally {
        global.Function = previousFunction;
      }
    };
    exports.allowUnsafe = function(fn) {
      var previousEval, previousFunction;
      previousEval = void 0;
      previousFunction = void 0;
      previousFunction = global.Function;
      previousEval = global["eval"];
      try {
        global.Function = exports.Function;
        global["eval"] = function(source) {
          return vm.runInThisContext(source);
        };
        return fn();
      } finally {
        global["eval"] = previousEval;
        global.Function = previousFunction;
      }
    };
    exports.Function = function() {
      var _i, _j, _len, body, paramList, paramLists, params;
      body = void 0;
      paramList = void 0;
      paramLists = void 0;
      params = void 0;
      _i = void 0;
      _j = void 0;
      _len = void 0;
      paramLists = (2 <= arguments.length ? __slice_.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []));
      body = arguments[_i++];
      params = [];
      _j = 0;
      _len = paramLists.length;
      while (_j < _len) {
        paramList = paramLists[_j];
        if (typeof paramList === "string") {
          paramList = paramList.split(/\s*,\s*/);
        }
        params.push.apply(params, paramList);
        _j++;
      }
      return vm.runInThisContext("(function(" + (params.join(", ")) + ") {\n  " + body + "\n})");
    };
  }).call(this);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvYnJvd3Nlci1wbHVzL2xpYi9ldmFsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLENBQUMsU0FBQTtBQUNBLFFBQUE7SUFBQSxNQUFNLENBQUMsTUFBUCxHQUFlLFNBQUMsQ0FBRDthQUNkLENBQUMsQ0FBQyxPQUFGLENBQVUsd0JBQVYsRUFBb0MsTUFBcEM7SUFEYztJQUVmLEVBQUEsR0FBSztJQUNMLFFBQUEsR0FBVyxFQUFFLENBQUM7SUFDZCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7SUFDTCxPQUFPLENBQUMsZUFBUixHQUEwQixTQUFDLEVBQUQ7QUFDekIsVUFBQTtNQUFBLFlBQUEsR0FBZTtNQUNmLFlBQUEsR0FBZSxNQUFPLENBQUEsTUFBQTtBQUN0QjtRQUNDLE1BQU8sQ0FBQSxNQUFBLENBQVAsR0FBaUIsU0FBQyxNQUFEO2lCQUNoQixFQUFFLENBQUMsZ0JBQUgsQ0FBb0IsTUFBcEI7UUFEZ0I7QUFHakIsZUFBTyxFQUFBLENBQUEsRUFKUjtPQUFBO1FBTUMsTUFBTyxDQUFBLE1BQUEsQ0FBUCxHQUFpQixhQU5sQjs7SUFIeUI7SUFZMUIsT0FBTyxDQUFDLHNCQUFSLEdBQWlDLFNBQUMsRUFBRDtBQUNoQyxVQUFBO01BQUEsZ0JBQUEsR0FBbUI7TUFDbkIsZ0JBQUEsR0FBbUIsTUFBTSxDQUFDO0FBQzFCO1FBQ0MsTUFBTSxDQUFDLFFBQVAsR0FBa0IsT0FBTyxDQUFDO0FBQzFCLGVBQU8sRUFBQSxDQUFBLEVBRlI7T0FBQTtRQUlDLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLGlCQUpuQjs7SUFIZ0M7SUFVakMsT0FBTyxDQUFDLFdBQVIsR0FBc0IsU0FBQyxFQUFEO0FBQ3JCLFVBQUE7TUFBQSxZQUFBLEdBQWU7TUFDZixnQkFBQSxHQUFtQjtNQUNuQixnQkFBQSxHQUFtQixNQUFNLENBQUM7TUFDMUIsWUFBQSxHQUFlLE1BQU8sQ0FBQSxNQUFBO0FBQ3RCO1FBQ0MsTUFBTSxDQUFDLFFBQVAsR0FBa0IsT0FBTyxDQUFDO1FBQzFCLE1BQU8sQ0FBQSxNQUFBLENBQVAsR0FBaUIsU0FBQyxNQUFEO2lCQUNoQixFQUFFLENBQUMsZ0JBQUgsQ0FBb0IsTUFBcEI7UUFEZ0I7QUFHakIsZUFBTyxFQUFBLENBQUEsRUFMUjtPQUFBO1FBT0MsTUFBTyxDQUFBLE1BQUEsQ0FBUCxHQUFpQjtRQUNqQixNQUFNLENBQUMsUUFBUCxHQUFrQixpQkFSbkI7O0lBTHFCO0lBZ0J0QixPQUFPLENBQUMsUUFBUixHQUFtQixTQUFBO0FBQ2xCLFVBQUE7TUFBQSxJQUFBLEdBQU87TUFDUCxTQUFBLEdBQVk7TUFDWixVQUFBLEdBQWE7TUFDYixNQUFBLEdBQVM7TUFDVCxFQUFBLEdBQUs7TUFDTCxFQUFBLEdBQUs7TUFDTCxJQUFBLEdBQU87TUFDUCxVQUFBLEdBQWEsQ0FBSSxDQUFBLElBQUssU0FBUyxDQUFDLE1BQWxCLEdBQThCLFFBQVEsQ0FBQyxJQUFULENBQWMsU0FBZCxFQUF5QixDQUF6QixFQUE0QixFQUFBLEdBQUssU0FBUyxDQUFDLE1BQVYsR0FBbUIsQ0FBcEQsQ0FBOUIsR0FBMEYsQ0FBQyxFQUFBLEdBQUssQ0FBTCxFQUN6RyxFQUR3RyxDQUEzRjtNQUdiLElBQUEsR0FBTyxTQUFVLENBQUEsRUFBQSxFQUFBO01BRWpCLE1BQUEsR0FBUztNQUNULEVBQUEsR0FBSztNQUNMLElBQUEsR0FBTyxVQUFVLENBQUM7QUFFbEIsYUFBTSxFQUFBLEdBQUssSUFBWDtRQUNDLFNBQUEsR0FBWSxVQUFXLENBQUEsRUFBQTtRQUN2QixJQUEwQyxPQUFPLFNBQVAsS0FBb0IsUUFBOUQ7VUFBQSxTQUFBLEdBQVksU0FBUyxDQUFDLEtBQVYsQ0FBZ0IsU0FBaEIsRUFBWjs7UUFDQSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQVosQ0FBa0IsTUFBbEIsRUFBMEIsU0FBMUI7UUFDQSxFQUFBO01BSkQ7YUFLQSxFQUFFLENBQUMsZ0JBQUgsQ0FBb0IsWUFBQSxHQUFlLENBQUMsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQUQsQ0FBZixHQUFxQyxTQUFyQyxHQUFpRCxJQUFqRCxHQUF3RCxNQUE1RTtJQXRCa0I7RUE1Q25CLENBQUQsQ0FxRUMsQ0FBQyxJQXJFRixDQXFFTyxJQXJFUDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiKC0+XG5cdFJlZ0V4cC5lc2NhcGU9IChzKS0+XG5cdFx0cy5yZXBsYWNlIC9bLVxcL1xcXFxeJCorPy4oKXxbXFxde31dL2csICdcXFxcJCYnXG5cdHZtID0gdW5kZWZpbmVkXG5cdF9fc2xpY2VfID0gW10uc2xpY2Vcblx0dm0gPSByZXF1aXJlKFwidm1cIilcblx0ZXhwb3J0cy5hbGxvd1Vuc2FmZUV2YWwgPSAoZm4pIC0+XG5cdFx0cHJldmlvdXNFdmFsID0gdW5kZWZpbmVkXG5cdFx0cHJldmlvdXNFdmFsID0gZ2xvYmFsW1wiZXZhbFwiXVxuXHRcdHRyeVxuXHRcdFx0Z2xvYmFsW1wiZXZhbFwiXSA9IChzb3VyY2UpIC0+XG5cdFx0XHRcdHZtLnJ1bkluVGhpc0NvbnRleHQgc291cmNlXG5cblx0XHRcdHJldHVybiBmbigpXG5cdFx0ZmluYWxseVxuXHRcdFx0Z2xvYmFsW1wiZXZhbFwiXSA9IHByZXZpb3VzRXZhbFxuXHRcdHJldHVyblxuXG5cdGV4cG9ydHMuYWxsb3dVbnNhZmVOZXdGdW5jdGlvbiA9IChmbikgLT5cblx0XHRwcmV2aW91c0Z1bmN0aW9uID0gdW5kZWZpbmVkXG5cdFx0cHJldmlvdXNGdW5jdGlvbiA9IGdsb2JhbC5GdW5jdGlvblxuXHRcdHRyeVxuXHRcdFx0Z2xvYmFsLkZ1bmN0aW9uID0gZXhwb3J0cy5GdW5jdGlvblxuXHRcdFx0cmV0dXJuIGZuKClcblx0XHRmaW5hbGx5XG5cdFx0XHRnbG9iYWwuRnVuY3Rpb24gPSBwcmV2aW91c0Z1bmN0aW9uXG5cdFx0cmV0dXJuXG5cblx0ZXhwb3J0cy5hbGxvd1Vuc2FmZSA9IChmbikgLT5cblx0XHRwcmV2aW91c0V2YWwgPSB1bmRlZmluZWRcblx0XHRwcmV2aW91c0Z1bmN0aW9uID0gdW5kZWZpbmVkXG5cdFx0cHJldmlvdXNGdW5jdGlvbiA9IGdsb2JhbC5GdW5jdGlvblxuXHRcdHByZXZpb3VzRXZhbCA9IGdsb2JhbFtcImV2YWxcIl1cblx0XHR0cnlcblx0XHRcdGdsb2JhbC5GdW5jdGlvbiA9IGV4cG9ydHMuRnVuY3Rpb25cblx0XHRcdGdsb2JhbFtcImV2YWxcIl0gPSAoc291cmNlKSAtPlxuXHRcdFx0XHR2bS5ydW5JblRoaXNDb250ZXh0IHNvdXJjZVxuXG5cdFx0XHRyZXR1cm4gZm4oKVxuXHRcdGZpbmFsbHlcblx0XHRcdGdsb2JhbFtcImV2YWxcIl0gPSBwcmV2aW91c0V2YWxcblx0XHRcdGdsb2JhbC5GdW5jdGlvbiA9IHByZXZpb3VzRnVuY3Rpb25cblx0XHRyZXR1cm5cblxuXHRleHBvcnRzLkZ1bmN0aW9uID0gLT5cblx0XHRib2R5ID0gdW5kZWZpbmVkXG5cdFx0cGFyYW1MaXN0ID0gdW5kZWZpbmVkXG5cdFx0cGFyYW1MaXN0cyA9IHVuZGVmaW5lZFxuXHRcdHBhcmFtcyA9IHVuZGVmaW5lZFxuXHRcdF9pID0gdW5kZWZpbmVkXG5cdFx0X2ogPSB1bmRlZmluZWRcblx0XHRfbGVuID0gdW5kZWZpbmVkXG5cdFx0cGFyYW1MaXN0cyA9IChpZiAyIDw9IGFyZ3VtZW50cy5sZW5ndGggdGhlbiBfX3NsaWNlXy5jYWxsKGFyZ3VtZW50cywgMCwgX2kgPSBhcmd1bWVudHMubGVuZ3RoIC0gMSkgZWxzZSAoX2kgPSAwXG5cdFx0W11cblx0XHQpKVxuXHRcdGJvZHkgPSBhcmd1bWVudHNbX2krK11cblxuXHRcdHBhcmFtcyA9IFtdXG5cdFx0X2ogPSAwXG5cdFx0X2xlbiA9IHBhcmFtTGlzdHMubGVuZ3RoXG5cblx0XHR3aGlsZSBfaiA8IF9sZW5cblx0XHRcdHBhcmFtTGlzdCA9IHBhcmFtTGlzdHNbX2pdXG5cdFx0XHRwYXJhbUxpc3QgPSBwYXJhbUxpc3Quc3BsaXQoL1xccyosXFxzKi8pXHRpZiB0eXBlb2YgcGFyYW1MaXN0IGlzIFwic3RyaW5nXCJcblx0XHRcdHBhcmFtcy5wdXNoLmFwcGx5IHBhcmFtcywgcGFyYW1MaXN0XG5cdFx0XHRfaisrXG5cdFx0dm0ucnVuSW5UaGlzQ29udGV4dCBcIihmdW5jdGlvbihcIiArIChwYXJhbXMuam9pbihcIiwgXCIpKSArIFwiKSB7XFxuICBcIiArIGJvZHkgKyBcIlxcbn0pXCJcblxuXHRyZXR1cm5cbikuY2FsbCB0aGlzXG4iXX0=
