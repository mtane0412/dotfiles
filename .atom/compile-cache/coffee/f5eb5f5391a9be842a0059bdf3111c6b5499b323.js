
/*
  lib/map.coffee
 */

(function() {
  var log,
    __slice = [].slice;

  log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return console.log.apply(console, ['markdown-scroll, map:'].concat(args));
  };

  module.exports = {
    setMap: function(getVis) {
      var addNodeToMap, bot, botRow, bufRow, firstNode, hgt, idx, idxMatch, line, match, matches, maxLen, node, nodeMatch, nodePtr, start, target, text, timings, top, topRow, wlkr, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
      if (getVis == null) {
        getVis = true;
      }
      start = Date.now();
      timings = {};
      if (getVis) {
        this.getVisTopHgtBot();
        timings['getVisTopHgtBot'] = Date.now() - start;
        start = Date.now();
      }
      this.nodes = [];
      wlkr = document.createTreeWalker(this.previewEle, NodeFilter.SHOW_TEXT, null, true);
      while ((node = wlkr.nextNode())) {
        text = node.textContent;
        if (!/\w+/.test(text)) {
          continue;
        }
        _ref = this.getEleTopHgtBot(node.parentNode, false), top = _ref[0], hgt = _ref[1], bot = _ref[2];
        this.nodes.push([top, bot, null, null, text, null]);
      }
      timings['tree walk'] = Date.now() - start;
      start = Date.now();
      nodePtr = 0;
      for (bufRow = _i = 0, _ref1 = this.editor.getLastBufferRow(); 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; bufRow = 0 <= _ref1 ? ++_i : --_i) {
        line = this.editor.lineTextForBufferRow(bufRow);
        if (!(matches = line.match(/[a-z0-9-\s]+/ig))) {
          continue;
        }
        maxLen = 0;
        target = null;
        for (_j = 0, _len = matches.length; _j < _len; _j++) {
          match = matches[_j];
          if (!(/\w+/.test(match))) {
            continue;
          }
          match = match.replace(/^\s+|\s+$/g, '');
          if (match.length > maxLen) {
            maxLen = match.length;
            target = match;
          }
        }
        if (target) {
          nodeMatch = null;
          _ref2 = this.nodes.slice(nodePtr);
          for (idx = _k = 0, _len1 = _ref2.length; _k < _len1; idx = ++_k) {
            node = _ref2[idx];
            if (node[4].includes(target)) {
              if (nodeMatch) {
                nodeMatch = 'dup';
                break;
              }
              nodeMatch = node;
              idxMatch = idx;
            }
          }
          if (!nodeMatch || nodeMatch === 'dup') {
            continue;
          }
          _ref3 = this.editor.screenRangeForBufferRange([[bufRow, 0], [bufRow, 9e9]]), (_ref4 = _ref3.start, topRow = _ref4.row), (_ref5 = _ref3.end, botRow = _ref5.row);
          nodeMatch[2] = topRow;
          nodeMatch[3] = botRow;
          nodeMatch[5] = target;
          nodePtr = idxMatch;
        }
      }
      timings['node match'] = Date.now() - start;
      start = Date.now();
      this.map = [[0, 0, 0, 0]];
      this.lastTopPix = this.lastBotPix = this.lastTopRow = this.lastBotRow = 0;
      firstNode = true;
      addNodeToMap = (function(_this) {
        return function(node) {
          var botPix, topPix;
          topPix = node[0], botPix = node[1], topRow = node[2], botRow = node[3];
          if (topPix < _this.lastBotPix || topRow <= _this.lastBotRow) {
            _this.lastTopPix = Math.min(topPix, _this.lastTopPix);
            _this.lastBotPix = Math.max(botPix, _this.lastBotPix);
            _this.lastTopRow = Math.min(topRow, _this.lastTopRow);
            _this.lastBotRow = Math.max(botRow, _this.lastBotRow);
            _this.map[_this.map.length - 1] = [_this.lastTopPix, _this.lastBotPix, _this.lastTopRow, _this.lastBotRow];
          } else {
            if (firstNode) {
              _this.map[0][1] = topPix;
              _this.map[0][3] = Math.max(0, topRow - 1);
            }
            _this.map.push([_this.lastTopPix = topPix, _this.lastBotPix = botPix, _this.lastTopRow = topRow, _this.lastBotRow = botRow]);
          }
          return firstNode = false;
        };
      })(this);
      _ref6 = this.nodes;
      for (_l = 0, _len2 = _ref6.length; _l < _len2; _l++) {
        node = _ref6[_l];
        if (node[2] !== null) {
          addNodeToMap(node);
        }
      }
      botRow = this.editor.getLastScreenRow();
      topRow = Math.min(botRow, this.lastBotRow + 1);
      addNodeToMap([this.lastBotPix, this.previewEle.scrollHeight, topRow, botRow]);
      return this.nodes = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tc2Nyb2xsLXN5bmMvbGliL21hcC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBOztHQUFBO0FBQUE7QUFBQTtBQUFBLE1BQUEsR0FBQTtJQUFBLGtCQUFBOztBQUFBLEVBSUEsR0FBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLFFBQUEsSUFBQTtBQUFBLElBREssOERBQ0wsQ0FBQTtXQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFsQixFQUEyQixDQUFDLHVCQUFELENBQXlCLENBQUMsTUFBMUIsQ0FBaUMsSUFBakMsQ0FBM0IsRUFESTtFQUFBLENBSk4sQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBRUU7QUFBQSxJQUFBLE1BQUEsRUFBUSxTQUFDLE1BQUQsR0FBQTtBQUNOLFVBQUEsNlBBQUE7O1FBRE8sU0FBUztPQUNoQjtBQUFBLE1BQUEsS0FBQSxHQUFRLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBUixDQUFBO0FBQUEsTUFDQSxPQUFBLEdBQVUsRUFEVixDQUFBO0FBR0EsTUFBQSxJQUFHLE1BQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFDQSxPQUFRLENBQUEsaUJBQUEsQ0FBUixHQUE2QixJQUFJLENBQUMsR0FBTCxDQUFBLENBQUEsR0FBYSxLQUQxQyxDQUFBO0FBQUEsUUFDaUQsS0FBQSxHQUFRLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FEekQsQ0FERjtPQUhBO0FBQUEsTUFPQSxJQUFDLENBQUEsS0FBRCxHQUFTLEVBUFQsQ0FBQTtBQUFBLE1BUUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixJQUFDLENBQUEsVUFBM0IsRUFBdUMsVUFBVSxDQUFDLFNBQWxELEVB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

//# sourceURL=/Users/tane/.atom/packages/markdown-scroll-sync/lib/map.coffee
