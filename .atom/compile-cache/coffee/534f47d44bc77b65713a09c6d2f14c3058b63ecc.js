
/*
  lib/scroll.coffee
 */

(function() {
  var log,
    __slice = [].slice;

  log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    console.log.apply(console, ['markdown-scroll, scroll:'].concat(args));
    return args[0];
  };

  module.exports = {
    chkScroll: function(eventType, auto) {
      var cursorOfs, scrollFrac;
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = null;
      }
      if (!this.editor.alive) {
        this.stopTracking();
        return;
      }
      if (eventType !== 'changed') {
        this.getVisTopHgtBot();
        if (this.scrnTopOfs !== this.lastScrnTopOfs || this.scrnBotOfs !== this.lastScrnBotOfs || this.previewTopOfs !== this.lastPvwTopOfs || this.previewBotOfs !== this.lastPvwBotOfs) {
          this.lastScrnTopOfs = this.scrnTopOfs;
          this.lastScrnBotOfs = this.scrnBotOfs;
          this.lastPvwTopOfs = this.previewTopOfs;
          this.lastPvwBotOfs = this.previewBotOfs;
          this.setMap(false);
        }
      }
      switch (eventType) {
        case 'init':
          cursorOfs = this.editor.getCursorScreenPosition().row * this.chrHgt;
          if ((this.scrnTopOfs <= cursorOfs && cursorOfs <= this.scrnBotOfs)) {
            return this.setScroll(cursorOfs);
          } else {
            return this.setScroll(this.scrnTopOfs);
          }
          break;
        case 'changed':
        case 'cursorMoved':
          this.setScroll(this.editor.getCursorScreenPosition().row * this.chrHgt);
          return this.ignoreScrnScrollUntil = Date.now() + 500;
        case 'newtop':
          if (this.ignoreScrnScrollUntil && Date.now() < this.ignoreScrnScrollUntil) {
            break;
          }
          this.ignoreScrnScrollUntil = null;
          scrollFrac = this.scrnTopOfs / (this.scrnScrollHgt - this.scrnHeight);
          this.setScroll(this.scrnTopOfs + (this.scrnHeight * scrollFrac));
          if (!auto) {
            return this.scrollTimeout = setTimeout(((function(_this) {
              return function() {
                return _this.chkScroll('newtop', true);
              };
            })(this)), 300);
          }
      }
    },
    setScroll: function(scrnPosPix) {
      var botPix, botRow, idx, lastBotPix, lastBotRow, lastMapping, mapping, pix1, pix2, pvwPosPix, row1, row2, spanFrac, topPix, topRow, visOfs, _i, _len, _ref;
      scrnPosPix = Math.max(0, scrnPosPix);
      lastMapping = null;
      _ref = this.map;
      for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
        mapping = _ref[idx];
        topPix = mapping[0], botPix = mapping[1], topRow = mapping[2], botRow = mapping[3];
        if (((topRow * this.chrHgt) <= scrnPosPix && scrnPosPix < ((botRow + 1) * this.chrHgt)) || idx === this.map.length - 1) {
          row1 = topRow;
          row2 = botRow + 1;
          pix1 = topPix;
          pix2 = botPix;
          break;
        } else {
          if (lastMapping == null) {
            lastMapping = mapping;
          }
          lastBotPix = lastMapping[1];
          lastBotRow = lastMapping[3] + 1;
          if (((lastBotRow * this.chrHgt) <= scrnPosPix && scrnPosPix < (topRow * this.chrHgt))) {
            row1 = lastBotRow;
            row2 = topRow;
            pix1 = lastBotPix;
            pix2 = topPix;
            break;
          }
        }
        lastMapping = mapping;
      }
      spanFrac = (scrnPosPix - (row1 * this.chrHgt)) / ((row2 - row1) * this.chrHgt);
      visOfs = scrnPosPix - this.scrnTopOfs;
      pvwPosPix = pix1 + ((pix2 - pix1) * spanFrac);
      return this.previewEle.scrollTop = pvwPosPix - visOfs;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tc2Nyb2xsLXN5bmMvbGliL3Njcm9sbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBOztHQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUEsR0FBQTtJQUFBLGtCQUFBOztBQUFBLEVBSUEsR0FBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLFFBQUEsSUFBQTtBQUFBLElBREssOERBQ0wsQ0FBQTtBQUFBLElBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFaLENBQWtCLE9BQWxCLEVBQTJCLENBQUMsMEJBQUQsQ0FBNEIsQ0FBQyxNQUE3QixDQUFvQyxJQUFwQyxDQUEzQixDQUFBLENBQUE7V0FDQSxJQUFLLENBQUEsQ0FBQSxFQUZEO0VBQUEsQ0FKTixDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FFRTtBQUFBLElBQUEsU0FBQSxFQUFXLFNBQUMsU0FBRCxFQUFZLElBQVosR0FBQTtBQUNULFVBQUEscUJBQUE7QUFBQSxNQUFBLElBQUcsSUFBQyxDQUFBLGFBQUo7QUFDRSxRQUFBLFlBQUEsQ0FBYSxJQUFDLENBQUEsYUFBZCxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBRGpCLENBREY7T0FBQTtBQUlBLE1BQUEsSUFBRyxDQUFBLElBQUssQ0FBQSxNQUFNLENBQUMsS0FBZjtBQUEwQixRQUFBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBQSxDQUFBO0FBQWlCLGNBQUEsQ0FBM0M7T0FKQTtBQU1BLE1BQUEsSUFBRyxTQUFBLEtBQWUsU0FBbEI7QUFDRSxRQUFBLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFELEtBQW9CLElBQUMsQ0FBQSxjQUFyQixJQUNBLElBQUMsQ0FB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

//# sourceURL=/Users/tane/.atom/packages/markdown-scroll-sync/lib/scroll.coffee
