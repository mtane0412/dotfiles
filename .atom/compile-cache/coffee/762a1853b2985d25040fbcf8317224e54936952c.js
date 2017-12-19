
/*
  lib/utils.coffee
 */

(function() {
  var log,
    __slice = [].slice;

  log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return console.log.apply(console, ['markdown-scroll, utils:'].concat(args));
  };

  module.exports = {
    getVisTopHgtBot: function() {
      var botScrnScrollRow, edtBotBnd, lineEle, lineEles, lineTopBnd, lines, pvwBotBnd, refLine, refRow, refTopBnd, _i, _j, _len, _len1, _ref, _ref1;
      _ref = this.editorView.getBoundingClientRect(), this.edtTopBnd = _ref.top, edtBotBnd = _ref.bottom;
      lineEles = this.editorView.shadowRoot.querySelectorAll('.lines .line[data-screen-row]');
      lines = [];
      for (_i = 0, _len = lineEles.length; _i < _len; _i++) {
        lineEle = lineEles[_i];
        lineTopBnd = lineEle.getBoundingClientRect().top;
        lines.push([+lineEle.getAttribute('data-screen-row'), lineTopBnd]);
      }
      if (lines.length === 0) {
        log('no visible lines in editor');
        this.scrnTopOfs = this.scrnBotOfs = this.pvwTopB = this.previewTopOfs = this.previewBotOfs = 0;
        return;
      }
      lines.sort();
      for (_j = 0, _len1 = lines.length; _j < _len1; _j++) {
        refLine = lines[_j];
        if (refLine[1] >= this.edtTopBnd) {
          break;
        }
      }
      refRow = refLine[0], refTopBnd = refLine[1];
      this.scrnTopOfs = (refRow * this.chrHgt) - (refTopBnd - this.edtTopBnd);
      this.scrnHeight = edtBotBnd - this.edtTopBnd;
      this.scrnBotOfs = this.scrnTopOfs + this.scrnHeight;
      botScrnScrollRow = this.editor.clipScreenPosition([9e9, 9e9]).row;
      this.scrnScrollHgt = (botScrnScrollRow + 1) * this.chrHgt;
      _ref1 = this.previewEle.getBoundingClientRect(), this.pvwTopBnd = _ref1.top, pvwBotBnd = _ref1.bottom;
      this.previewTopOfs = this.previewEle.scrollTop;
      return this.previewBotOfs = this.previewTopOfs + (pvwBotBnd - this.pvwTopBnd);
    },
    getEleTopHgtBot: function(ele, scrn) {
      var bot, eleBotBnd, eleTopBnd, hgt, top, _ref;
      if (scrn == null) {
        scrn = true;
      }
      _ref = ele.getBoundingClientRect(), eleTopBnd = _ref.top, eleBotBnd = _ref.bottom;
      top = scrn ? this.scrnTopOfs + (eleTopBnd - this.edtTopBnd) : this.previewTopOfs + (eleTopBnd - this.pvwTopBnd);
      hgt = eleBotBnd - eleTopBnd;
      bot = top + hgt;
      return [top, hgt, bot];
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tc2Nyb2xsLXN5bmMvbGliL3V0aWxzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUE7O0dBQUE7QUFBQTtBQUFBO0FBQUEsTUFBQSxHQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFJQSxHQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osUUFBQSxJQUFBO0FBQUEsSUFESyw4REFDTCxDQUFBO1dBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFaLENBQWtCLE9BQWxCLEVBQTJCLENBQUMseUJBQUQsQ0FBMkIsQ0FBQyxNQUE1QixDQUFtQyxJQUFuQyxDQUEzQixFQURJO0VBQUEsQ0FKTixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FFRTtBQUFBLElBQUEsZUFBQSxFQUFpQixTQUFBLEdBQUE7QUFDZixVQUFBLDBJQUFBO0FBQUEsTUFBQSxPQUF1QyxJQUFDLENBQUEsVUFBVSxDQUFDLHFCQUFaLENBQUEsQ0FBdkMsRUFBTSxJQUFDLENBQUEsaUJBQU4sR0FBRCxFQUEwQixpQkFBUixNQUFsQixDQUFBO0FBQUEsTUFDQSxRQUFBLEdBQVcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFVLENBQUMsZ0JBQXZCLENBQXdDLCtCQUF4QyxDQURYLENBQUE7QUFBQSxNQUVBLEtBQUEsR0FBUSxFQUZSLENBQUE7QUFHQSxXQUFBLCtDQUFBOytCQUFBO0FBQ0UsUUFBTSxhQUFjLE9BQU8sQ0FBQyxxQkFBUixDQUFBLEVBQW5CLEdBQUQsQ0FBQTtBQUFBLFFBQ0EsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFDLENBQUEsT0FBUSxDQUFDLFlBQVIsQ0FBcUIsaUJBQXJCLENBQUYsRUFBMkMsVUFBM0MsQ0FBWCxDQURBLENBREY7QUFBQSxPQUhBO0FBTUEsTUFBQSxJQUFHLEtBQUss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

//# sourceURL=/Users/tane/.atom/packages/markdown-scroll-sync/lib/utils.coffee
