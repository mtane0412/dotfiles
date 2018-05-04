'use babel';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom');

var Range = _require.Range;
var Point = _require.Point;

// [TODO] Need overhaul
//  - [ ] Make expandable by selection.getBufferRange().union(this.getRange(selection))
//  - [ ] Count support(priority low)?
var Base = require('./base');
var PairFinder = require('./pair-finder');

var TextObject = (function (_Base) {
  _inherits(TextObject, _Base);

  function TextObject() {
    _classCallCheck(this, TextObject);

    _get(Object.getPrototypeOf(TextObject.prototype), 'constructor', this).apply(this, arguments);

    this.operator = null;
    this.wise = 'characterwise';
    this.supportCount = false;
    this.selectOnce = false;
    this.selectSucceeded = false;
  }

  // Section: Word
  // =========================

  _createClass(TextObject, [{
    key: 'isInner',
    value: function isInner() {
      return this.inner;
    }
  }, {
    key: 'isA',
    value: function isA() {
      return !this.inner;
    }
  }, {
    key: 'isLinewise',
    value: function isLinewise() {
      return this.wise === 'linewise';
    }
  }, {
    key: 'isBlockwise',
    value: function isBlockwise() {
      return this.wise === 'blockwise';
    }
  }, {
    key: 'forceWise',
    value: function forceWise(wise) {
      return this.wise = wise; // FIXME currently not well supported
    }
  }, {
    key: 'resetState',
    value: function resetState() {
      this.selectSucceeded = false;
    }

    // execute: Called from Operator::selectTarget()
    //  - `v i p`, is `VisualModeSelect` operator with @target = `InnerParagraph`.
    //  - `d i p`, is `Delete` operator with @target = `InnerParagraph`.
  }, {
    key: 'execute',
    value: function execute() {
      // Whennever TextObject is executed, it has @operator
      if (!this.operator) throw new Error('in TextObject: Must not happen');
      this.select();
    }
  }, {
    key: 'select',
    value: function select() {
      var _this = this;

      if (this.isMode('visual', 'blockwise')) {
        this.swrap.normalize(this.editor);
      }

      this.countTimes(this.getCount(), function (_ref2) {
        var stop = _ref2.stop;

        if (!_this.supportCount) stop(); // quick-fix for #560

        for (var selection of _this.editor.getSelections()) {
          var oldRange = selection.getBufferRange();
          if (_this.selectTextObject(selection)) _this.selectSucceeded = true;
          if (selection.getBufferRange().isEqual(oldRange)) stop();
          if (_this.selectOnce) break;
        }
      });

      this.editor.mergeIntersectingSelections();
      // Some TextObject's wise is NOT deterministic. It has to be detected from selected range.
      if (this.wise == null) this.wise = this.swrap.detectWise(this.editor);

      if (this.operator['instanceof']('SelectBase')) {
        if (this.selectSucceeded) {
          if (this.wise === 'characterwise') {
            this.swrap.saveProperties(this.editor, { force: true });
          } else if (this.wise === 'linewise') {
            // When target is persistent-selection, new selection is added after selectTextObject.
            // So we have to assure all selection have selction property.
            // Maybe this logic can be moved to operation stack.
            for (var $selection of this.swrap.getSelections(this.editor)) {
              if (this.getConfig('stayOnSelectTextObject')) {
                if (!$selection.hasProperties()) {
                  $selection.saveProperties();
                }
              } else {
                $selection.saveProperties();
              }
              $selection.fixPropertyRowToRowRange();
            }
          }
        }

        if (this.submode === 'blockwise') {
          for (var $selection of this.swrap.getSelections(this.editor)) {
            $selection.normalize();
            $selection.applyWise('blockwise');
          }
        }
      }
    }

    // Return true or false
  }, {
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      var range = this.getRange(selection);
      if (range) {
        this.swrap(selection).setBufferRange(range);
        return true;
      } else {
        return false;
      }
    }

    // to override
  }, {
    key: 'getRange',
    value: function getRange(selection) {}
  }], [{
    key: 'deriveClass',
    value: function deriveClass(innerAndA, innerAndAForAllowForwarding) {
      this.command = false; // HACK: klass to derive child class is not command
      var store = {};
      if (innerAndA) {
        var klassA = this.generateClass(false);
        var klassI = this.generateClass(true);
        store[klassA.name] = klassA;
        store[klassI.name] = klassI;
      }
      if (innerAndAForAllowForwarding) {
        var klassA = this.generateClass(false, true);
        var klassI = this.generateClass(true, true);
        store[klassA.name] = klassA;
        store[klassI.name] = klassI;
      }
      return store;
    }
  }, {
    key: 'generateClass',
    value: function generateClass(inner, allowForwarding) {
      var name = (inner ? 'Inner' : 'A') + this.name;
      if (allowForwarding) {
        name += 'AllowForwarding';
      }

      return (function (_ref) {
        _inherits(_class, _ref);

        _createClass(_class, null, [{
          key: 'name',
          value: name,
          enumerable: true
        }]);

        function _class(vimState) {
          _classCallCheck(this, _class);

          _get(Object.getPrototypeOf(_class.prototype), 'constructor', this).call(this, vimState);
          this.inner = inner;
          if (allowForwarding != null) {
            this.allowForwarding = allowForwarding;
          }
        }

        return _class;
      })(this);
    }
  }, {
    key: 'operationKind',
    value: 'text-object',
    enumerable: true
  }, {
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return TextObject;
})(Base);

var Word = (function (_TextObject) {
  _inherits(Word, _TextObject);

  function Word() {
    _classCallCheck(this, Word);

    _get(Object.getPrototypeOf(Word.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Word, [{
    key: 'getRange',
    value: function getRange(selection) {
      var point = this.getCursorPositionForSelection(selection);

      var _getWordBufferRangeAndKindAtBufferPosition = this.getWordBufferRangeAndKindAtBufferPosition(point, { wordRegex: this.wordRegex });

      var range = _getWordBufferRangeAndKindAtBufferPosition.range;

      return this.isA() ? this.utils.expandRangeToWhiteSpaces(this.editor, range) : range;
    }
  }]);

  return Word;
})(TextObject);

var WholeWord = (function (_Word) {
  _inherits(WholeWord, _Word);

  function WholeWord() {
    _classCallCheck(this, WholeWord);

    _get(Object.getPrototypeOf(WholeWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\S+/;
  }

  // Just include _, -
  return WholeWord;
})(Word);

var SmartWord = (function (_Word2) {
  _inherits(SmartWord, _Word2);

  function SmartWord() {
    _classCallCheck(this, SmartWord);

    _get(Object.getPrototypeOf(SmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  // Just include _, -
  return SmartWord;
})(Word);

var Subword = (function (_Word3) {
  _inherits(Subword, _Word3);

  function Subword() {
    _classCallCheck(this, Subword);

    _get(Object.getPrototypeOf(Subword.prototype), 'constructor', this).apply(this, arguments);
  }

  // Section: Pair
  // =========================

  _createClass(Subword, [{
    key: 'getRange',
    value: function getRange(selection) {
      this.wordRegex = selection.cursor.subwordRegExp();
      return _get(Object.getPrototypeOf(Subword.prototype), 'getRange', this).call(this, selection);
    }
  }]);

  return Subword;
})(Word);

var Pair = (function (_TextObject2) {
  _inherits(Pair, _TextObject2);

  function Pair() {
    _classCallCheck(this, Pair);

    _get(Object.getPrototypeOf(Pair.prototype), 'constructor', this).apply(this, arguments);

    this.supportCount = true;
    this.allowNextLine = null;
    this.adjustInnerRange = true;
    this.pair = null;
    this.inclusive = true;
  }

  // Used by DeleteSurround

  _createClass(Pair, [{
    key: 'isAllowNextLine',
    value: function isAllowNextLine() {
      if (this.allowNextLine != null) {
        return this.allowNextLine;
      } else {
        return this.pair && this.pair[0] !== this.pair[1];
      }
    }
  }, {
    key: 'adjustRange',
    value: function adjustRange(_ref3) {
      var start = _ref3.start;
      var end = _ref3.end;

      // Dirty work to feel natural for human, to behave compatible with pure Vim.
      // Where this adjustment appear is in following situation.
      // op-1: `ci{` replace only 2nd line
      // op-2: `di{` delete only 2nd line.
      // text:
      //  {
      //    aaa
      //  }
      if (this.utils.pointIsAtEndOfLine(this.editor, start)) {
        start = start.traverse([1, 0]);
      }

      if (this.utils.getLineTextToBufferPosition(this.editor, end).match(/^\s*$/)) {
        if (this.mode === 'visual') {
          // This is slightly innconsistent with regular Vim
          // - regular Vim: select new line after EOL
          // - vim-mode-plus: select to EOL(before new line)
          // This is intentional since to make submode `characterwise` when auto-detect submode
          // innerEnd = new Point(innerEnd.row - 1, Infinity)
          end = new Point(end.row - 1, Infinity);
        } else {
          end = new Point(end.row, 0);
        }
      }
      return new Range(start, end);
    }
  }, {
    key: 'getFinder',
    value: function getFinder() {
      var finderName = this.pair[0] === this.pair[1] ? 'QuoteFinder' : 'BracketFinder';
      return new PairFinder[finderName](this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        pair: this.pair,
        inclusive: this.inclusive
      });
    }
  }, {
    key: 'getPairInfo',
    value: function getPairInfo(from) {
      var pairInfo = this.getFinder().find(from);
      if (pairInfo) {
        if (this.adjustInnerRange) {
          pairInfo.innerRange = this.adjustRange(pairInfo.innerRange);
        }
        pairInfo.targetRange = this.isInner() ? pairInfo.innerRange : pairInfo.aRange;
        return pairInfo;
      }
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var originalRange = selection.getBufferRange();
      var pairInfo = this.getPairInfo(this.getCursorPositionForSelection(selection));
      // When range was same, try to expand range
      if (pairInfo && pairInfo.targetRange.isEqual(originalRange)) {
        pairInfo = this.getPairInfo(pairInfo.aRange.end);
      }
      if (pairInfo) {
        return pairInfo.targetRange;
      }
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Pair;
})(TextObject);

var APair = (function (_Pair) {
  _inherits(APair, _Pair);

  function APair() {
    _classCallCheck(this, APair);

    _get(Object.getPrototypeOf(APair.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(APair, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return APair;
})(Pair);

var AnyPair = (function (_Pair2) {
  _inherits(AnyPair, _Pair2);

  function AnyPair() {
    _classCallCheck(this, AnyPair);

    _get(Object.getPrototypeOf(AnyPair.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = false;
    this.member = ['DoubleQuote', 'SingleQuote', 'BackTick', 'CurlyBracket', 'AngleBracket', 'SquareBracket', 'Parenthesis'];
  }

  _createClass(AnyPair, [{
    key: 'getRanges',
    value: function getRanges(selection) {
      var _this2 = this;

      var options = {
        inner: this.inner,
        allowForwarding: this.allowForwarding,
        inclusive: this.inclusive
      };
      var getRangeByMember = function getRangeByMember(member) {
        return _this2.getInstance(member, options).getRange(selection);
      };
      return this.member.map(getRangeByMember).filter(function (v) {
        return v;
      });
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      return this.utils.sortRanges(this.getRanges(selection)).pop();
    }
  }]);

  return AnyPair;
})(Pair);

var AnyPairAllowForwarding = (function (_AnyPair) {
  _inherits(AnyPairAllowForwarding, _AnyPair);

  function AnyPairAllowForwarding() {
    _classCallCheck(this, AnyPairAllowForwarding);

    _get(Object.getPrototypeOf(AnyPairAllowForwarding.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = true;
  }

  _createClass(AnyPairAllowForwarding, [{
    key: 'getRange',
    value: function getRange(selection) {
      var ranges = this.getRanges(selection);
      var from = selection.cursor.getBufferPosition();

      var _$partition = this._.partition(ranges, function (range) {
        return range.start.isGreaterThanOrEqual(from);
      });

      var _$partition2 = _slicedToArray(_$partition, 2);

      var forwardingRanges = _$partition2[0];
      var enclosingRanges = _$partition2[1];

      var enclosingRange = this.utils.sortRanges(enclosingRanges).pop();
      forwardingRanges = this.utils.sortRanges(forwardingRanges);

      // When enclosingRange is exists,
      // We don't go across enclosingRange.end.
      // So choose from ranges contained in enclosingRange.
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function (range) {
          return enclosingRange.containsRange(range);
        });
      }

      return forwardingRanges[0] || enclosingRange;
    }
  }]);

  return AnyPairAllowForwarding;
})(AnyPair);

var AnyQuote = (function (_AnyPair2) {
  _inherits(AnyQuote, _AnyPair2);

  function AnyQuote() {
    _classCallCheck(this, AnyQuote);

    _get(Object.getPrototypeOf(AnyQuote.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = true;
    this.member = ['DoubleQuote', 'SingleQuote', 'BackTick'];
  }

  _createClass(AnyQuote, [{
    key: 'getRange',
    value: function getRange(selection) {
      // Pick range which end.colum is leftmost(mean, closed first)
      return this.getRanges(selection).sort(function (a, b) {
        return a.end.column - b.end.column;
      })[0];
    }
  }]);

  return AnyQuote;
})(AnyPair);

var Quote = (function (_Pair3) {
  _inherits(Quote, _Pair3);

  function Quote() {
    _classCallCheck(this, Quote);

    _get(Object.getPrototypeOf(Quote.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = true;
  }

  _createClass(Quote, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Quote;
})(Pair);

var DoubleQuote = (function (_Quote) {
  _inherits(DoubleQuote, _Quote);

  function DoubleQuote() {
    _classCallCheck(this, DoubleQuote);

    _get(Object.getPrototypeOf(DoubleQuote.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['"', '"'];
  }

  return DoubleQuote;
})(Quote);

var SingleQuote = (function (_Quote2) {
  _inherits(SingleQuote, _Quote2);

  function SingleQuote() {
    _classCallCheck(this, SingleQuote);

    _get(Object.getPrototypeOf(SingleQuote.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ["'", "'"];
  }

  return SingleQuote;
})(Quote);

var BackTick = (function (_Quote3) {
  _inherits(BackTick, _Quote3);

  function BackTick() {
    _classCallCheck(this, BackTick);

    _get(Object.getPrototypeOf(BackTick.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['`', '`'];
  }

  return BackTick;
})(Quote);

var CurlyBracket = (function (_Pair4) {
  _inherits(CurlyBracket, _Pair4);

  function CurlyBracket() {
    _classCallCheck(this, CurlyBracket);

    _get(Object.getPrototypeOf(CurlyBracket.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['{', '}'];
  }

  return CurlyBracket;
})(Pair);

var SquareBracket = (function (_Pair5) {
  _inherits(SquareBracket, _Pair5);

  function SquareBracket() {
    _classCallCheck(this, SquareBracket);

    _get(Object.getPrototypeOf(SquareBracket.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['[', ']'];
  }

  return SquareBracket;
})(Pair);

var Parenthesis = (function (_Pair6) {
  _inherits(Parenthesis, _Pair6);

  function Parenthesis() {
    _classCallCheck(this, Parenthesis);

    _get(Object.getPrototypeOf(Parenthesis.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['(', ')'];
  }

  return Parenthesis;
})(Pair);

var AngleBracket = (function (_Pair7) {
  _inherits(AngleBracket, _Pair7);

  function AngleBracket() {
    _classCallCheck(this, AngleBracket);

    _get(Object.getPrototypeOf(AngleBracket.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['<', '>'];
  }

  return AngleBracket;
})(Pair);

var Tag = (function (_Pair8) {
  _inherits(Tag, _Pair8);

  function Tag() {
    _classCallCheck(this, Tag);

    _get(Object.getPrototypeOf(Tag.prototype), 'constructor', this).apply(this, arguments);

    this.allowNextLine = true;
    this.allowForwarding = true;
    this.adjustInnerRange = false;
  }

  // Section: Paragraph
  // =========================
  // Paragraph is defined as consecutive (non-)blank-line.

  _createClass(Tag, [{
    key: 'getTagStartPoint',
    value: function getTagStartPoint(from) {
      var regex = PairFinder.TagFinder.pattern;
      var options = { from: [from.row, 0] };
      return this.findInEditor('forward', regex, options, function (_ref4) {
        var range = _ref4.range;
        return range.containsPoint(from, true) && range.start;
      });
    }
  }, {
    key: 'getFinder',
    value: function getFinder() {
      return new PairFinder.TagFinder(this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        inclusive: this.inclusive
      });
    }
  }, {
    key: 'getPairInfo',
    value: function getPairInfo(from) {
      return _get(Object.getPrototypeOf(Tag.prototype), 'getPairInfo', this).call(this, this.getTagStartPoint(from) || from);
    }
  }]);

  return Tag;
})(Pair);

var Paragraph = (function (_TextObject3) {
  _inherits(Paragraph, _TextObject3);

  function Paragraph() {
    _classCallCheck(this, Paragraph);

    _get(Object.getPrototypeOf(Paragraph.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.supportCount = true;
  }

  _createClass(Paragraph, [{
    key: 'findRow',
    value: function findRow(fromRow, direction, fn) {
      if (fn.reset) fn.reset();
      var foundRow = fromRow;
      for (var row of this.getBufferRows({ startRow: fromRow, direction: direction })) {
        if (!fn(row, direction)) break;
        foundRow = row;
      }
      return foundRow;
    }
  }, {
    key: 'findRowRangeBy',
    value: function findRowRangeBy(fromRow, fn) {
      var startRow = this.findRow(fromRow, 'previous', fn);
      var endRow = this.findRow(fromRow, 'next', fn);
      return [startRow, endRow];
    }
  }, {
    key: 'getPredictFunction',
    value: function getPredictFunction(fromRow, selection) {
      var _this3 = this;

      var fromRowResult = this.editor.isBufferRowBlank(fromRow);

      if (this.isInner()) {
        return function (row, direction) {
          return _this3.editor.isBufferRowBlank(row) === fromRowResult;
        };
      } else {
        var _ret = (function () {
          var directionToExtend = selection.isReversed() ? 'previous' : 'next';

          var flip = false;
          var predict = function predict(row, direction) {
            var result = _this3.editor.isBufferRowBlank(row) === fromRowResult;
            if (flip) {
              return !result;
            } else {
              if (!result && direction === directionToExtend) {
                return flip = true;
              }
              return result;
            }
          };
          predict.reset = function () {
            return flip = false;
          };
          return {
            v: predict
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var fromRow = this.getCursorPositionForSelection(selection).row;
      if (this.isMode('visual', 'linewise')) {
        if (selection.isReversed()) fromRow--;else fromRow++;
        fromRow = this.getValidVimBufferRow(fromRow);
      }
      var rowRange = this.findRowRangeBy(fromRow, this.getPredictFunction(fromRow, selection));
      return selection.getBufferRange().union(this.getBufferRangeForRowRange(rowRange));
    }
  }]);

  return Paragraph;
})(TextObject);

var Indentation = (function (_Paragraph) {
  _inherits(Indentation, _Paragraph);

  function Indentation() {
    _classCallCheck(this, Indentation);

    _get(Object.getPrototypeOf(Indentation.prototype), 'constructor', this).apply(this, arguments);
  }

  // Section: Comment
  // =========================

  _createClass(Indentation, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _this4 = this;

      var fromRow = this.getCursorPositionForSelection(selection).row;
      var baseIndentLevel = this.editor.indentationForBufferRow(fromRow);
      var rowRange = this.findRowRangeBy(fromRow, function (row) {
        if (_this4.editor.isBufferRowBlank(row)) {
          return _this4.isA();
        } else {
          return _this4.editor.indentationForBufferRow(row) >= baseIndentLevel;
        }
      });
      return this.getBufferRangeForRowRange(rowRange);
    }
  }]);

  return Indentation;
})(Paragraph);

var Comment = (function (_TextObject4) {
  _inherits(Comment, _TextObject4);

  function Comment() {
    _classCallCheck(this, Comment);

    _get(Object.getPrototypeOf(Comment.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(Comment, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _getCursorPositionForSelection = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection.row;

      var rowRange = this.utils.getRowRangeForCommentAtBufferRow(this.editor, row);
      if (rowRange) {
        return this.getBufferRangeForRowRange(rowRange);
      }
    }
  }]);

  return Comment;
})(TextObject);

var CommentOrParagraph = (function (_TextObject5) {
  _inherits(CommentOrParagraph, _TextObject5);

  function CommentOrParagraph() {
    _classCallCheck(this, CommentOrParagraph);

    _get(Object.getPrototypeOf(CommentOrParagraph.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  // Section: Fold
  // =========================

  _createClass(CommentOrParagraph, [{
    key: 'getRange',
    value: function getRange(selection) {
      var inner = this.inner;

      for (var klass of ['Comment', 'Paragraph']) {
        var range = this.getInstance(klass, { inner: inner }).getRange(selection);
        if (range) {
          return range;
        }
      }
    }
  }]);

  return CommentOrParagraph;
})(TextObject);

var Fold = (function (_TextObject6) {
  _inherits(Fold, _TextObject6);

  function Fold() {
    _classCallCheck(this, Fold);

    _get(Object.getPrototypeOf(Fold.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(Fold, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _this5 = this;

      var _getCursorPositionForSelection2 = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection2.row;

      var selectedRange = selection.getBufferRange();

      var foldRanges = this.utils.getCodeFoldRanges(this.editor);
      var foldRangesContainsCursorRow = foldRanges.filter(function (range) {
        return range.start.row <= row && row <= range.end.row;
      });

      var _loop = function (_foldRange) {
        if (_this5.isA()) {
          var conjoined = undefined;
          while (conjoined = foldRanges.find(function (range) {
            return range.end.row === _foldRange.start.row;
          })) {
            _foldRange = _foldRange.union(conjoined);
          }
          while (conjoined = foldRanges.find(function (range) {
            return range.start.row === _foldRange.end.row;
          })) {
            _foldRange = _foldRange.union(conjoined);
          }
        } else {
          if (_this5.utils.doesRangeStartAndEndWithSameIndentLevel(_this5.editor, _foldRange)) {
            _foldRange.end.row -= 1;
          }
          _foldRange.start.row += 1;
        }
        _foldRange = _this5.getBufferRangeForRowRange([_foldRange.start.row, _foldRange.end.row]);
        if (!selectedRange.containsRange(_foldRange)) {
          return {
            v: _foldRange
          };
        }
        foldRange = _foldRange;
      };

      for (var foldRange of foldRangesContainsCursorRow.reverse()) {
        var _ret2 = _loop(foldRange);

        if (typeof _ret2 === 'object') return _ret2.v;
      }
    }
  }]);

  return Fold;
})(TextObject);

var Function = (function (_TextObject7) {
  _inherits(Function, _TextObject7);

  function Function() {
    _classCallCheck(this, Function);

    _get(Object.getPrototypeOf(Function.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.scopeNamesOmittingClosingBrace = ['source.go', 'source.elixir'];
  }

  // Section: Other
  // =========================

  _createClass(Function, [{
    key: 'getFunctionBodyStartRegex',
    // language doesn't include closing `}` into fold.

    value: function getFunctionBodyStartRegex(_ref5) {
      var scopeName = _ref5.scopeName;

      if (scopeName === 'source.python') {
        return (/:$/
        );
      } else if (scopeName === 'source.coffee') {
        return (/-|=>$/
        );
      } else {
        return (/{$/
        );
      }
    }
  }, {
    key: 'isMultiLineParameterFunctionRange',
    value: function isMultiLineParameterFunctionRange(parameterRange, bodyRange, bodyStartRegex) {
      var _this6 = this;

      var isBodyStartRow = function isBodyStartRow(row) {
        return bodyStartRegex.test(_this6.editor.lineTextForBufferRow(row));
      };
      if (isBodyStartRow(parameterRange.start.row)) return false;
      if (isBodyStartRow(parameterRange.end.row)) return parameterRange.end.row === bodyRange.start.row;
      if (isBodyStartRow(parameterRange.end.row + 1)) return parameterRange.end.row + 1 === bodyRange.start.row;
      return false;
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var _this7 = this;

      var editor = this.editor;
      var cursorRow = this.getCursorPositionForSelection(selection).row;
      var bodyStartRegex = this.getFunctionBodyStartRegex(editor.getGrammar());
      var isIncludeFunctionScopeForRow = function isIncludeFunctionScopeForRow(row) {
        return _this7.utils.isIncludeFunctionScopeForRow(editor, row);
      };

      var functionRanges = [];
      var saveFunctionRange = function saveFunctionRange(_ref6) {
        var aRange = _ref6.aRange;
        var innerRange = _ref6.innerRange;

        functionRanges.push({
          aRange: _this7.buildARange(aRange),
          innerRange: _this7.buildInnerRange(innerRange)
        });
      };

      var foldRanges = this.utils.getCodeFoldRanges(editor);
      while (foldRanges.length) {
        var range = foldRanges.shift();
        if (isIncludeFunctionScopeForRow(range.start.row)) {
          var nextRange = foldRanges[0];
          var nextFoldIsConnected = nextRange && nextRange.start.row <= range.end.row + 1;
          var maybeAFunctionRange = nextFoldIsConnected ? range.union(nextRange) : range;
          if (!maybeAFunctionRange.containsPoint([cursorRow, Infinity])) continue; // skip to avoid heavy computation
          if (nextFoldIsConnected && this.isMultiLineParameterFunctionRange(range, nextRange, bodyStartRegex)) {
            var bodyRange = foldRanges.shift();
            saveFunctionRange({ aRange: range.union(bodyRange), innerRange: bodyRange });
          } else {
            saveFunctionRange({ aRange: range, innerRange: range });
          }
        } else {
          var previousRow = range.start.row - 1;
          if (previousRow < 0) continue;
          if (editor.isFoldableAtBufferRow(previousRow)) continue;
          var maybeAFunctionRange = range.union(editor.bufferRangeForBufferRow(previousRow));
          if (!maybeAFunctionRange.containsPoint([cursorRow, Infinity])) continue; // skip to avoid heavy computation

          var isBodyStartOnlyRow = function isBodyStartOnlyRow(row) {
            return new RegExp('^\\s*' + bodyStartRegex.source).test(editor.lineTextForBufferRow(row));
          };
          if (isBodyStartOnlyRow(range.start.row) && isIncludeFunctionScopeForRow(previousRow)) {
            saveFunctionRange({ aRange: maybeAFunctionRange, innerRange: range });
          }
        }
      }

      for (var functionRange of functionRanges.reverse()) {
        var _ref7 = this.isA() ? functionRange.aRange : functionRange.innerRange;

        var start = _ref7.start;
        var end = _ref7.end;

        var range = this.getBufferRangeForRowRange([start.row, end.row]);
        if (!selection.getBufferRange().containsRange(range)) return range;
      }
    }
  }, {
    key: 'buildInnerRange',
    value: function buildInnerRange(range) {
      var endRowTranslation = this.utils.doesRangeStartAndEndWithSameIndentLevel(this.editor, range) ? -1 : 0;
      return range.translate([1, 0], [endRowTranslation, 0]);
    }
  }, {
    key: 'buildARange',
    value: function buildARange(range) {
      // NOTE: This adjustment shoud not be necessary if language-syntax is properly defined.
      var endRowTranslation = this.isGrammarDoesNotFoldClosingRow() ? +1 : 0;
      return range.translate([0, 0], [endRowTranslation, 0]);
    }
  }, {
    key: 'isGrammarDoesNotFoldClosingRow',
    value: function isGrammarDoesNotFoldClosingRow() {
      var _editor$getGrammar = this.editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;
      var packageName = _editor$getGrammar.packageName;

      if (this.scopeNamesOmittingClosingBrace.includes(scopeName)) {
        return true;
      } else {
        // HACK: Rust have two package `language-rust` and `atom-language-rust`
        // language-rust don't fold ending `}`, but atom-language-rust does.
        return scopeName === 'source.rust' && packageName === 'language-rust';
      }
    }
  }]);

  return Function;
})(TextObject);

var Arguments = (function (_TextObject8) {
  _inherits(Arguments, _TextObject8);

  function Arguments() {
    _classCallCheck(this, Arguments);

    _get(Object.getPrototypeOf(Arguments.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Arguments, [{
    key: 'newArgInfo',
    value: function newArgInfo(argStart, arg, separator) {
      var argEnd = this.utils.traverseTextFromPoint(argStart, arg);
      var argRange = new Range(argStart, argEnd);

      var separatorEnd = this.utils.traverseTextFromPoint(argEnd, separator != null ? separator : '');
      var separatorRange = new Range(argEnd, separatorEnd);

      var innerRange = argRange;
      var aRange = argRange.union(separatorRange);
      return { argRange: argRange, separatorRange: separatorRange, innerRange: innerRange, aRange: aRange };
    }
  }, {
    key: 'getArgumentsRangeForSelection',
    value: function getArgumentsRangeForSelection(selection) {
      var options = {
        member: ['CurlyBracket', 'SquareBracket', 'Parenthesis'],
        inclusive: false
      };
      return this.getInstance('InnerAnyPair', options).getRange(selection);
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var _utils = this.utils;
      var splitArguments = _utils.splitArguments;
      var traverseTextFromPoint = _utils.traverseTextFromPoint;
      var getLast = _utils.getLast;

      var range = this.getArgumentsRangeForSelection(selection);
      var pairRangeFound = range != null;

      range = range || this.getInstance('InnerCurrentLine').getRange(selection); // fallback
      if (!range) return;

      range = this.trimBufferRange(range);

      var text = this.editor.getTextInBufferRange(range);
      var allTokens = splitArguments(text, pairRangeFound);

      var argInfos = [];
      var argStart = range.start;

      // Skip starting separator
      if (allTokens.length && allTokens[0].type === 'separator') {
        var token = allTokens.shift();
        argStart = traverseTextFromPoint(argStart, token.text);
      }

      while (allTokens.length) {
        var token = allTokens.shift();
        if (token.type === 'argument') {
          var nextToken = allTokens.shift();
          var separator = nextToken ? nextToken.text : undefined;
          var argInfo = this.newArgInfo(argStart, token.text, separator);

          if (allTokens.length === 0 && argInfos.length) {
            argInfo.aRange = argInfo.argRange.union(getLast(argInfos).separatorRange);
          }

          argStart = argInfo.aRange.end;
          argInfos.push(argInfo);
        } else {
          throw new Error('must not happen');
        }
      }

      var point = this.getCursorPositionForSelection(selection);
      for (var _ref82 of argInfos) {
        var innerRange = _ref82.innerRange;
        var aRange = _ref82.aRange;

        if (innerRange.end.isGreaterThanOrEqual(point)) {
          return this.isInner() ? innerRange : aRange;
        }
      }
    }
  }]);

  return Arguments;
})(TextObject);

var CurrentLine = (function (_TextObject9) {
  _inherits(CurrentLine, _TextObject9);

  function CurrentLine() {
    _classCallCheck(this, CurrentLine);

    _get(Object.getPrototypeOf(CurrentLine.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CurrentLine, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _getCursorPositionForSelection3 = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection3.row;

      var range = this.editor.bufferRangeForBufferRow(row);
      return this.isA() ? range : this.trimBufferRange(range);
    }
  }]);

  return CurrentLine;
})(TextObject);

var Entire = (function (_TextObject10) {
  _inherits(Entire, _TextObject10);

  function Entire() {
    _classCallCheck(this, Entire);

    _get(Object.getPrototypeOf(Entire.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.selectOnce = true;
  }

  _createClass(Entire, [{
    key: 'getRange',
    value: function getRange(selection) {
      return this.editor.buffer.getRange();
    }
  }]);

  return Entire;
})(TextObject);

var Empty = (function (_TextObject11) {
  _inherits(Empty, _TextObject11);

  function Empty() {
    _classCallCheck(this, Empty);

    _get(Object.getPrototypeOf(Empty.prototype), 'constructor', this).apply(this, arguments);

    this.selectOnce = true;
  }

  _createClass(Empty, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Empty;
})(TextObject);

var LatestChange = (function (_TextObject12) {
  _inherits(LatestChange, _TextObject12);

  function LatestChange() {
    _classCallCheck(this, LatestChange);

    _get(Object.getPrototypeOf(LatestChange.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(LatestChange, [{
    key: 'getRange',
    value: function getRange(selection) {
      var start = this.vimState.mark.get('[');
      var end = this.vimState.mark.get(']');
      if (start && end) {
        return new Range(start, end);
      }
    }
  }]);

  return LatestChange;
})(TextObject);

var SearchMatchForward = (function (_TextObject13) {
  _inherits(SearchMatchForward, _TextObject13);

  function SearchMatchForward() {
    _classCallCheck(this, SearchMatchForward);

    _get(Object.getPrototypeOf(SearchMatchForward.prototype), 'constructor', this).apply(this, arguments);

    this.backward = false;
  }

  _createClass(SearchMatchForward, [{
    key: 'findMatch',
    value: function findMatch(from, regex) {
      if (this.backward) {
        if (this.mode === 'visual') {
          from = this.utils.translatePointAndClip(this.editor, from, 'backward');
        }

        var options = { from: [from.row, Infinity] };
        return {
          range: this.findInEditor('backward', regex, options, function (_ref9) {
            var range = _ref9.range;
            return range.start.isLessThan(from) && range;
          }),
          whichIsHead: 'start'
        };
      } else {
        if (this.mode === 'visual') {
          from = this.utils.translatePointAndClip(this.editor, from, 'forward');
        }

        var options = { from: [from.row, 0] };
        return {
          range: this.findInEditor('forward', regex, options, function (_ref10) {
            var range = _ref10.range;
            return range.end.isGreaterThan(from) && range;
          }),
          whichIsHead: 'end'
        };
      }
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var pattern = this.globalState.get('lastSearchPattern');
      if (!pattern) return;

      var fromPoint = selection.getHeadBufferPosition();

      var _findMatch = this.findMatch(fromPoint, pattern);

      var range = _findMatch.range;
      var whichIsHead = _findMatch.whichIsHead;

      if (range) {
        return this.unionRangeAndDetermineReversedState(selection, range, whichIsHead);
      }
    }
  }, {
    key: 'unionRangeAndDetermineReversedState',
    value: function unionRangeAndDetermineReversedState(selection, range, whichIsHead) {
      if (selection.isEmpty()) return range;

      var head = range[whichIsHead];
      var tail = selection.getTailBufferPosition();

      if (this.backward) {
        if (tail.isLessThan(head)) head = this.utils.translatePointAndClip(this.editor, head, 'forward');
      } else {
        if (head.isLessThan(tail)) head = this.utils.translatePointAndClip(this.editor, head, 'backward');
      }

      this.reversed = head.isLessThan(tail);
      return new Range(tail, head).union(this.swrap(selection).getTailBufferRange());
    }
  }, {
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      var range = this.getRange(selection);
      if (range) {
        this.swrap(selection).setBufferRange(range, { reversed: this.reversed != null ? this.reversed : this.backward });
        return true;
      }
    }
  }]);

  return SearchMatchForward;
})(TextObject);

var SearchMatchBackward = (function (_SearchMatchForward) {
  _inherits(SearchMatchBackward, _SearchMatchForward);

  function SearchMatchBackward() {
    _classCallCheck(this, SearchMatchBackward);

    _get(Object.getPrototypeOf(SearchMatchBackward.prototype), 'constructor', this).apply(this, arguments);

    this.backward = true;
  }

  // [Limitation: won't fix]: Selected range is not submode aware. always characterwise.
  // So even if original selection was vL or vB, selected range by this text-object
  // is always vC range.
  return SearchMatchBackward;
})(SearchMatchForward);

var PreviousSelection = (function (_TextObject14) {
  _inherits(PreviousSelection, _TextObject14);

  function PreviousSelection() {
    _classCallCheck(this, PreviousSelection);

    _get(Object.getPrototypeOf(PreviousSelection.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(PreviousSelection, [{
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      var _vimState$previousSelection = this.vimState.previousSelection;
      var properties = _vimState$previousSelection.properties;
      var submode = _vimState$previousSelection.submode;

      if (properties && submode) {
        this.wise = submode;
        this.swrap(this.editor.getLastSelection()).selectByProperties(properties);
        return true;
      }
    }
  }]);

  return PreviousSelection;
})(TextObject);

var PersistentSelection = (function (_TextObject15) {
  _inherits(PersistentSelection, _TextObject15);

  function PersistentSelection() {
    _classCallCheck(this, PersistentSelection);

    _get(Object.getPrototypeOf(PersistentSelection.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  // Used only by ReplaceWithRegister and PutBefore and its' children.

  _createClass(PersistentSelection, [{
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      if (this.vimState.hasPersistentSelections()) {
        this.persistentSelection.setSelectedBufferRanges();
        return true;
      }
    }
  }]);

  return PersistentSelection;
})(TextObject);

var LastPastedRange = (function (_TextObject16) {
  _inherits(LastPastedRange, _TextObject16);

  function LastPastedRange() {
    _classCallCheck(this, LastPastedRange);

    _get(Object.getPrototypeOf(LastPastedRange.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(LastPastedRange, [{
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      for (selection of this.editor.getSelections()) {
        var range = this.vimState.sequentialPasteManager.getPastedRangeForSelection(selection);
        selection.setBufferRange(range);
      }
      return true;
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return LastPastedRange;
})(TextObject);

var VisibleArea = (function (_TextObject17) {
  _inherits(VisibleArea, _TextObject17);

  function VisibleArea() {
    _classCallCheck(this, VisibleArea);

    _get(Object.getPrototypeOf(VisibleArea.prototype), 'constructor', this).apply(this, arguments);

    this.selectOnce = true;
  }

  _createClass(VisibleArea, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _editor$getVisibleRowRange = this.editor.getVisibleRowRange();

      var _editor$getVisibleRowRange2 = _slicedToArray(_editor$getVisibleRowRange, 2);

      var startRow = _editor$getVisibleRowRange2[0];
      var endRow = _editor$getVisibleRowRange2[1];

      return this.editor.bufferRangeForScreenRange([[startRow, 0], [endRow, Infinity]]);
    }
  }]);

  return VisibleArea;
})(TextObject);

var DiffHunk = (function (_TextObject18) {
  _inherits(DiffHunk, _TextObject18);

  function DiffHunk() {
    _classCallCheck(this, DiffHunk);

    _get(Object.getPrototypeOf(DiffHunk.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.selectOnce = true;
  }

  _createClass(DiffHunk, [{
    key: 'getRange',
    value: function getRange(selection) {
      var row = this.getCursorPositionForSelection(selection).row;
      return this.utils.getHunkRangeAtBufferRow(this.editor, row);
    }
  }]);

  return DiffHunk;
})(TextObject);

module.exports = Object.assign({
  TextObject: TextObject,
  Word: Word,
  WholeWord: WholeWord,
  SmartWord: SmartWord,
  Subword: Subword,
  Pair: Pair,
  APair: APair,
  AnyPair: AnyPair,
  AnyPairAllowForwarding: AnyPairAllowForwarding,
  AnyQuote: AnyQuote,
  Quote: Quote,
  DoubleQuote: DoubleQuote,
  SingleQuote: SingleQuote,
  BackTick: BackTick,
  CurlyBracket: CurlyBracket,
  SquareBracket: SquareBracket,
  Parenthesis: Parenthesis,
  AngleBracket: AngleBracket,
  Tag: Tag,
  Paragraph: Paragraph,
  Indentation: Indentation,
  Comment: Comment,
  CommentOrParagraph: CommentOrParagraph,
  Fold: Fold,
  Function: Function,
  Arguments: Arguments,
  CurrentLine: CurrentLine,
  Entire: Entire,
  Empty: Empty,
  LatestChange: LatestChange,
  SearchMatchForward: SearchMatchForward,
  SearchMatchBackward: SearchMatchBackward,
  PreviousSelection: PreviousSelection,
  PersistentSelection: PersistentSelection,
  LastPastedRange: LastPastedRange,
  VisibleArea: VisibleArea
}, Word.deriveClass(true), WholeWord.deriveClass(true), SmartWord.deriveClass(true), Subword.deriveClass(true), AnyPair.deriveClass(true), AnyPairAllowForwarding.deriveClass(true), AnyQuote.deriveClass(true), DoubleQuote.deriveClass(true), SingleQuote.deriveClass(true), BackTick.deriveClass(true), CurlyBracket.deriveClass(true, true), SquareBracket.deriveClass(true, true), Parenthesis.deriveClass(true, true), AngleBracket.deriveClass(true, true), Tag.deriveClass(true), Paragraph.deriveClass(true), Indentation.deriveClass(true), Comment.deriveClass(true), CommentOrParagraph.deriveClass(true), Fold.deriveClass(true), Function.deriveClass(true), Arguments.deriveClass(true), CurrentLine.deriveClass(true), Entire.deriveClass(true), LatestChange.deriveClass(true), PersistentSelection.deriveClass(true), VisibleArea.deriveClass(true), DiffHunk.deriveClass(true));
// FIXME #472, #66
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90YW5lL0Ryb3Bib3gvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdGV4dC1vYmplY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7ZUFFWSxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUEvQixLQUFLLFlBQUwsS0FBSztJQUFFLEtBQUssWUFBTCxLQUFLOzs7OztBQUtuQixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDOUIsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBOztJQUVyQyxVQUFVO1lBQVYsVUFBVTs7V0FBVixVQUFVOzBCQUFWLFVBQVU7OytCQUFWLFVBQVU7O1NBSWQsUUFBUSxHQUFHLElBQUk7U0FDZixJQUFJLEdBQUcsZUFBZTtTQUN0QixZQUFZLEdBQUcsS0FBSztTQUNwQixVQUFVLEdBQUcsS0FBSztTQUNsQixlQUFlLEdBQUcsS0FBSzs7Ozs7O2VBUm5CLFVBQVU7O1dBOENOLG1CQUFHO0FBQ1QsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0tBQ2xCOzs7V0FFRyxlQUFHO0FBQ0wsYUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUE7S0FDbkI7OztXQUVVLHNCQUFHO0FBQ1osYUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQTtLQUNoQzs7O1dBRVcsdUJBQUc7QUFDYixhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFBO0tBQ2pDOzs7V0FFUyxtQkFBQyxJQUFJLEVBQUU7QUFDZixhQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0tBQzFCOzs7V0FFVSxzQkFBRztBQUNaLFVBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFBO0tBQzdCOzs7Ozs7O1dBS08sbUJBQUc7O0FBRVQsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxJQUFJLEtB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dXMvbGliL3RleHQtb2JqZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuY29uc3Qge1JhbmdlLCBQb2ludH0gPSByZXF1aXJlKCdhdG9tJylcblxuLy8gW1RPRE9dIE5lZWQgb3ZlcmhhdWxcbi8vICAtIFsgXSBNYWtlIGV4cGFuZGFibGUgYnkgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24odGhpcy5nZXRSYW5nZShzZWxlY3Rpb24pKVxuLy8gIC0gWyBdIENvdW50IHN1cHBvcnQocHJpb3JpdHkgbG93KT9cbmNvbnN0IEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKVxuY29uc3QgUGFpckZpbmRlciA9IHJlcXVpcmUoJy4vcGFpci1maW5kZXInKVxuXG5jbGFzcyBUZXh0T2JqZWN0IGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gJ3RleHQtb2JqZWN0J1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG5cbiAgb3BlcmF0b3IgPSBudWxsXG4gIHdpc2UgPSAnY2hhcmFjdGVyd2lzZSdcbiAgc3VwcG9ydENvdW50ID0gZmFsc2UgLy8gRklYTUUgIzQ3MiwgIzY2XG4gIHNlbGVjdE9uY2UgPSBmYWxzZVxuICBzZWxlY3RTdWNjZWVkZWQgPSBmYWxzZVxuXG4gIHN0YXRpYyBkZXJpdmVDbGFzcyAoaW5uZXJBbmRBLCBpbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcpIHtcbiAgICB0aGlzLmNvbW1hbmQgPSBmYWxzZSAvLyBIQUNLOiBrbGFzcyB0byBkZXJpdmUgY2hpbGQgY2xhc3MgaXMgbm90IGNvbW1hbmRcbiAgICBjb25zdCBzdG9yZSA9IHt9XG4gICAgaWYgKGlubmVyQW5kQSkge1xuICAgICAgY29uc3Qga2xhc3NBID0gdGhpcy5nZW5lcmF0ZUNsYXNzKGZhbHNlKVxuICAgICAgY29uc3Qga2xhc3NJID0gdGhpcy5nZW5lcmF0ZUNsYXNzKHRydWUpXG4gICAgICBzdG9yZVtrbGFzc0EubmFtZV0gPSBrbGFzc0FcbiAgICAgIHN0b3JlW2tsYXNzSS5uYW1lXSA9IGtsYXNzSVxuICAgIH1cbiAgICBpZiAoaW5uZXJBbmRBRm9yQWxsb3dGb3J3YXJkaW5nKSB7XG4gICAgICBjb25zdCBrbGFzc0EgPSB0aGlzLmdlbmVyYXRlQ2xhc3MoZmFsc2UsIHRydWUpXG4gICAgICBjb25zdCBrbGFzc0kgPSB0aGlzLmdlbmVyYXRlQ2xhc3ModHJ1ZSwgdHJ1ZSlcbiAgICAgIHN0b3JlW2tsYXNzQS5uYW1lXSA9IGtsYXNzQVxuICAgICAgc3RvcmVba2xhc3NJLm5hbWVdID0ga2xhc3NJXG4gICAgfVxuICAgIHJldHVybiBzdG9yZVxuICB9XG5cbiAgc3RhdGljIGdlbmVyYXRlQ2xhc3MgKGlubmVyLCBhbGxvd0ZvcndhcmRpbmcpIHtcbiAgICBsZXQgbmFtZSA9IChpbm5lciA/ICdJbm5lcicgOiAnQScpICsgdGhpcy5uYW1lXG4gICAgaWYgKGFsbG93Rm9yd2FyZGluZykge1xuICAgICAgbmFtZSArPSAnQWxsb3dGb3J3YXJkaW5nJ1xuICAgIH1cblxuICAgIHJldHVybiBjbGFzcyBleHRlbmRzIHRoaXMge1xuICAgICAgc3RhdGljIG5hbWUgPSBuYW1lXG4gICAgICBjb25zdHJ1Y3RvciAodmltU3RhdGUpIHtcbiAgICAgICAgc3VwZXIodmltU3RhdGUpXG4gICAgICAgIHRoaXMuaW5uZXIgPSBpbm5lclxuICAgICAgICBpZiAoYWxsb3dGb3J3YXJkaW5nICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLmFsbG93Rm9yd2FyZGluZyA9IGFsbG93Rm9yd2FyZGluZ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaXNJbm5lciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5uZXJcbiAgfVxuXG4gIGlzQSAoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlubmVyXG4gIH1cblxuICBpc0xpbmV3aXNlICgpIHtcbiAgICByZXR1cm4gdGhpcy53aXNlID09PSAnbGluZXdpc2UnXG4gIH1cblxuICBpc0Jsb2Nrd2lzZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gJ2Jsb2Nrd2lzZSdcbiAgfVxuXG4gIGZvcmNlV2lzZSAod2lzZSkge1xuICAgIHJldHVybiAodGhpcy53aXNlID0gd2lzZSkgLy8gRklYTUUgY3VycmVudGx5IG5vdCB3ZWxsIHN1cHBvcnRlZFxuICB9XG5cbiAgcmVzZXRTdGF0ZSAoKSB7XG4gICAgdGhpcy5zZWxlY3RTdWNjZWVkZWQgPSBmYWxzZVxuICB9XG5cbiAgLy8gZXhlY3V0ZTogQ2FsbGVkIGZyb20gT3BlcmF0b3I6OnNlbGVjdFRhcmdldCgpXG4gIC8vICAtIGB2IGkgcGAsIGlzIGBWaXN1YWxNb2RlU2VsZWN0YCBvcGVyYXRvciB3aXRoIEB0YXJnZXQgPSBgSW5uZXJQYXJhZ3JhcGhgLlxuICAvLyAgLSBgZCBpIHBgLCBpcyBgRGVsZXRlYCBvcGVyYXRvciB3aXRoIEB0YXJnZXQgPSBgSW5uZXJQYXJhZ3JhcGhgLlxuICBleGVjdXRlICgpIHtcbiAgICAvLyBXaGVubmV2ZXIgVGV4dE9iamVjdCBpcyBleGVjdXRlZCwgaXQgaGFzIEBvcGVyYXRvclxuICAgIGlmICghdGhpcy5vcGVyYXRvcikgdGhyb3cgbmV3IEVycm9yKCdpbiBUZXh0T2JqZWN0OiBNdXN0IG5vdCBoYXBwZW4nKVxuICAgIHRoaXMuc2VsZWN0KClcbiAgfVxuXG4gIHNlbGVjdCAoKSB7XG4gICAgaWYgKHRoaXMuaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJykpIHtcbiAgICAgIHRoaXMuc3dyYXAubm9ybWFsaXplKHRoaXMuZWRpdG9yKVxuICAgIH1cblxuICAgIHRoaXMuY291bnRUaW1lcyh0aGlzLmdldENvdW50KCksICh7c3RvcH0pID0+IHtcbiAgICAgIGlmICghdGhpcy5zdXBwb3J0Q291bnQpIHN0b3AoKSAvLyBxdWljay1maXggZm9yICM1NjBcblxuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IG9sZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pKSB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IHRydWVcbiAgICAgICAgaWYgKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzRXF1YWwob2xkUmFuZ2UpKSBzdG9wKClcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0T25jZSkgYnJlYWtcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5lZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAvLyBTb21lIFRleHRPYmplY3QncyB3aXNlIGlzIE5PVCBkZXRlcm1pbmlzdGljLiBJdCBoYXMgdG8gYmUgZGV0ZWN0ZWQgZnJvbSBzZWxlY3RlZCByYW5nZS5cbiAgICBpZiAodGhpcy53aXNlID09IG51bGwpIHRoaXMud2lzZSA9IHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcilcblxuICAgIGlmICh0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoJ1NlbGVjdEJhc2UnKSkge1xuICAgICAgaWYgKHRoaXMuc2VsZWN0U3VjY2VlZGVkKSB7XG4gICAgICAgIGlmICh0aGlzLndpc2UgPT09ICdjaGFyYWN0ZXJ3aXNlJykge1xuICAgICAgICAgIHRoaXMuc3dyYXAuc2F2ZVByb3BlcnRpZXModGhpcy5lZGl0b3IsIHtmb3JjZTogdHJ1ZX0pXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy53aXNlID09PSAnbGluZXdpc2UnKSB7XG4gICAgICAgICAgLy8gV2hlbiB0YXJnZXQgaXMgcGVyc2lzdGVudC1zZWxlY3Rpb24sIG5ldyBzZWxlY3Rpb24gaXMgYWRkZWQgYWZ0ZXIgc2VsZWN0VGV4dE9iamVjdC5cbiAgICAgICAgICAvLyBTbyB3ZSBoYXZlIHRvIGFzc3VyZSBhbGwgc2VsZWN0aW9uIGhhdmUgc2VsY3Rpb24gcHJvcGVydHkuXG4gICAgICAgICAgLy8gTWF5YmUgdGhpcyBsb2dpYyBjYW4gYmUgbW92ZWQgdG8gb3BlcmF0aW9uIHN0YWNrLlxuICAgICAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5nZXRDb25maWcoJ3N0YXlPblNlbGVjdFRleHRPYmplY3QnKSkge1xuICAgICAgICAgICAgICBpZiAoISRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpKSB7XG4gICAgICAgICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNlbGVjdGlvbi5maXhQcm9wZXJ0eVJvd1RvUm93UmFuZ2UoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zdWJtb2RlID09PSAnYmxvY2t3aXNlJykge1xuICAgICAgICBmb3IgKGNvbnN0ICRzZWxlY3Rpb24gb2YgdGhpcy5zd3JhcC5nZXRTZWxlY3Rpb25zKHRoaXMuZWRpdG9yKSkge1xuICAgICAgICAgICRzZWxlY3Rpb24ubm9ybWFsaXplKClcbiAgICAgICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSgnYmxvY2t3aXNlJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybiB0cnVlIG9yIGZhbHNlXG4gIHNlbGVjdFRleHRPYmplY3QgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICB0aGlzLnN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICAvLyB0byBvdmVycmlkZVxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7fVxufVxuXG4vLyBTZWN0aW9uOiBXb3JkXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBXb3JkIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHtyYW5nZX0gPSB0aGlzLmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pXG4gICAgcmV0dXJuIHRoaXMuaXNBKCkgPyB0aGlzLnV0aWxzLmV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlcyh0aGlzLmVkaXRvciwgcmFuZ2UpIDogcmFuZ2VcbiAgfVxufVxuXG5jbGFzcyBXaG9sZVdvcmQgZXh0ZW5kcyBXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcUysvXG59XG5cbi8vIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTbWFydFdvcmQgZXh0ZW5kcyBXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvXG59XG5cbi8vIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTdWJ3b3JkIGV4dGVuZHMgV29yZCB7XG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICB0aGlzLndvcmRSZWdleCA9IHNlbGVjdGlvbi5jdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgcmV0dXJuIHN1cGVyLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBQYWlyXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBQYWlyIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc3VwcG9ydENvdW50ID0gdHJ1ZVxuICBhbGxvd05leHRMaW5lID0gbnVsbFxuICBhZGp1c3RJbm5lclJhbmdlID0gdHJ1ZVxuICBwYWlyID0gbnVsbFxuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgaXNBbGxvd05leHRMaW5lICgpIHtcbiAgICBpZiAodGhpcy5hbGxvd05leHRMaW5lICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmFsbG93TmV4dExpbmVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucGFpciAmJiB0aGlzLnBhaXJbMF0gIT09IHRoaXMucGFpclsxXVxuICAgIH1cbiAgfVxuXG4gIGFkanVzdFJhbmdlICh7c3RhcnQsIGVuZH0pIHtcbiAgICAvLyBEaXJ0eSB3b3JrIHRvIGZlZWwgbmF0dXJhbCBmb3IgaHVtYW4sIHRvIGJlaGF2ZSBjb21wYXRpYmxlIHdpdGggcHVyZSBWaW0uXG4gICAgLy8gV2hlcmUgdGhpcyBhZGp1c3RtZW50IGFwcGVhciBpcyBpbiBmb2xsb3dpbmcgc2l0dWF0aW9uLlxuICAgIC8vIG9wLTE6IGBjaXtgIHJlcGxhY2Ugb25seSAybmQgbGluZVxuICAgIC8vIG9wLTI6IGBkaXtgIGRlbGV0ZSBvbmx5IDJuZCBsaW5lLlxuICAgIC8vIHRleHQ6XG4gICAgLy8gIHtcbiAgICAvLyAgICBhYWFcbiAgICAvLyAgfVxuICAgIGlmICh0aGlzLnV0aWxzLnBvaW50SXNBdEVuZE9mTGluZSh0aGlzLmVkaXRvciwgc3RhcnQpKSB7XG4gICAgICBzdGFydCA9IHN0YXJ0LnRyYXZlcnNlKFsxLCAwXSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy51dGlscy5nZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIGVuZCkubWF0Y2goL15cXHMqJC8pKSB7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSAndmlzdWFsJykge1xuICAgICAgICAvLyBUaGlzIGlzIHNsaWdodGx5IGlubmNvbnNpc3RlbnQgd2l0aCByZWd1bGFyIFZpbVxuICAgICAgICAvLyAtIHJlZ3VsYXIgVmltOiBzZWxlY3QgbmV3IGxpbmUgYWZ0ZXIgRU9MXG4gICAgICAgIC8vIC0gdmltLW1vZGUtcGx1czogc2VsZWN0IHRvIEVPTChiZWZvcmUgbmV3IGxpbmUpXG4gICAgICAgIC8vIFRoaXMgaXMgaW50ZW50aW9uYWwgc2luY2UgdG8gbWFrZSBzdWJtb2RlIGBjaGFyYWN0ZXJ3aXNlYCB3aGVuIGF1dG8tZGV0ZWN0IHN1Ym1vZGVcbiAgICAgICAgLy8gaW5uZXJFbmQgPSBuZXcgUG9pbnQoaW5uZXJFbmQucm93IC0gMSwgSW5maW5pdHkpXG4gICAgICAgIGVuZCA9IG5ldyBQb2ludChlbmQucm93IC0gMSwgSW5maW5pdHkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdywgMClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuICB9XG5cbiAgZ2V0RmluZGVyICgpIHtcbiAgICBjb25zdCBmaW5kZXJOYW1lID0gdGhpcy5wYWlyWzBdID09PSB0aGlzLnBhaXJbMV0gPyAnUXVvdGVGaW5kZXInIDogJ0JyYWNrZXRGaW5kZXInXG4gICAgcmV0dXJuIG5ldyBQYWlyRmluZGVyW2ZpbmRlck5hbWVdKHRoaXMuZWRpdG9yLCB7XG4gICAgICBhbGxvd05leHRMaW5lOiB0aGlzLmlzQWxsb3dOZXh0TGluZSgpLFxuICAgICAgYWxsb3dGb3J3YXJkaW5nOiB0aGlzLmFsbG93Rm9yd2FyZGluZyxcbiAgICAgIHBhaXI6IHRoaXMucGFpcixcbiAgICAgIGluY2x1c2l2ZTogdGhpcy5pbmNsdXNpdmVcbiAgICB9KVxuICB9XG5cbiAgZ2V0UGFpckluZm8gKGZyb20pIHtcbiAgICBjb25zdCBwYWlySW5mbyA9IHRoaXMuZ2V0RmluZGVyKCkuZmluZChmcm9tKVxuICAgIGlmIChwYWlySW5mbykge1xuICAgICAgaWYgKHRoaXMuYWRqdXN0SW5uZXJSYW5nZSkge1xuICAgICAgICBwYWlySW5mby5pbm5lclJhbmdlID0gdGhpcy5hZGp1c3RSYW5nZShwYWlySW5mby5pbm5lclJhbmdlKVxuICAgICAgfVxuICAgICAgcGFpckluZm8udGFyZ2V0UmFuZ2UgPSB0aGlzLmlzSW5uZXIoKSA/IHBhaXJJbmZvLmlubmVyUmFuZ2UgOiBwYWlySW5mby5hUmFuZ2VcbiAgICAgIHJldHVybiBwYWlySW5mb1xuICAgIH1cbiAgfVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBvcmlnaW5hbFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBsZXQgcGFpckluZm8gPSB0aGlzLmdldFBhaXJJbmZvKHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSlcbiAgICAvLyBXaGVuIHJhbmdlIHdhcyBzYW1lLCB0cnkgdG8gZXhwYW5kIHJhbmdlXG4gICAgaWYgKHBhaXJJbmZvICYmIHBhaXJJbmZvLnRhcmdldFJhbmdlLmlzRXF1YWwob3JpZ2luYWxSYW5nZSkpIHtcbiAgICAgIHBhaXJJbmZvID0gdGhpcy5nZXRQYWlySW5mbyhwYWlySW5mby5hUmFuZ2UuZW5kKVxuICAgIH1cbiAgICBpZiAocGFpckluZm8pIHtcbiAgICAgIHJldHVybiBwYWlySW5mby50YXJnZXRSYW5nZVxuICAgIH1cbiAgfVxufVxuXG4vLyBVc2VkIGJ5IERlbGV0ZVN1cnJvdW5kXG5jbGFzcyBBUGFpciBleHRlbmRzIFBhaXIge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG59XG5cbmNsYXNzIEFueVBhaXIgZXh0ZW5kcyBQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gZmFsc2VcbiAgbWVtYmVyID0gWydEb3VibGVRdW90ZScsICdTaW5nbGVRdW90ZScsICdCYWNrVGljaycsICdDdXJseUJyYWNrZXQnLCAnQW5nbGVCcmFja2V0JywgJ1NxdWFyZUJyYWNrZXQnLCAnUGFyZW50aGVzaXMnXVxuXG4gIGdldFJhbmdlcyAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGlubmVyOiB0aGlzLmlubmVyLFxuICAgICAgYWxsb3dGb3J3YXJkaW5nOiB0aGlzLmFsbG93Rm9yd2FyZGluZyxcbiAgICAgIGluY2x1c2l2ZTogdGhpcy5pbmNsdXNpdmVcbiAgICB9XG4gICAgY29uc3QgZ2V0UmFuZ2VCeU1lbWJlciA9IG1lbWJlciA9PiB0aGlzLmdldEluc3RhbmNlKG1lbWJlciwgb3B0aW9ucykuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgIHJldHVybiB0aGlzLm1lbWJlci5tYXAoZ2V0UmFuZ2VCeU1lbWJlcikuZmlsdGVyKHYgPT4gdilcbiAgfVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5zb3J0UmFuZ2VzKHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbikpLnBvcCgpXG4gIH1cbn1cblxuY2xhc3MgQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIEFueVBhaXIge1xuICBhbGxvd0ZvcndhcmRpbmcgPSB0cnVlXG5cbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbilcbiAgICBjb25zdCBmcm9tID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgbGV0IFtmb3J3YXJkaW5nUmFuZ2VzLCBlbmNsb3NpbmdSYW5nZXNdID0gdGhpcy5fLnBhcnRpdGlvbihyYW5nZXMsIHJhbmdlID0+IHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW5PckVxdWFsKGZyb20pKVxuICAgIGNvbnN0IGVuY2xvc2luZ1JhbmdlID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKGVuY2xvc2luZ1JhbmdlcykucG9wKClcbiAgICBmb3J3YXJkaW5nUmFuZ2VzID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKGZvcndhcmRpbmdSYW5nZXMpXG5cbiAgICAvLyBXaGVuIGVuY2xvc2luZ1JhbmdlIGlzIGV4aXN0cyxcbiAgICAvLyBXZSBkb24ndCBnbyBhY3Jvc3MgZW5jbG9zaW5nUmFuZ2UuZW5kLlxuICAgIC8vIFNvIGNob29zZSBmcm9tIHJhbmdlcyBjb250YWluZWQgaW4gZW5jbG9zaW5nUmFuZ2UuXG4gICAgaWYgKGVuY2xvc2luZ1JhbmdlKSB7XG4gICAgICBmb3J3YXJkaW5nUmFuZ2VzID0gZm9yd2FyZGluZ1Jhbmdlcy5maWx0ZXIocmFuZ2UgPT4gZW5jbG9zaW5nUmFuZ2UuY29udGFpbnNSYW5nZShyYW5nZSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGZvcndhcmRpbmdSYW5nZXNbMF0gfHwgZW5jbG9zaW5nUmFuZ2VcbiAgfVxufVxuXG5jbGFzcyBBbnlRdW90ZSBleHRlbmRzIEFueVBhaXIge1xuICBhbGxvd0ZvcndhcmRpbmcgPSB0cnVlXG4gIG1lbWJlciA9IFsnRG91YmxlUXVvdGUnLCAnU2luZ2xlUXVvdGUnLCAnQmFja1RpY2snXVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICAvLyBQaWNrIHJhbmdlIHdoaWNoIGVuZC5jb2x1bSBpcyBsZWZ0bW9zdChtZWFuLCBjbG9zZWQgZmlyc3QpXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbikuc29ydCgoYSwgYikgPT4gYS5lbmQuY29sdW1uIC0gYi5lbmQuY29sdW1uKVswXVxuICB9XG59XG5cbmNsYXNzIFF1b3RlIGV4dGVuZHMgUGFpciB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxufVxuXG5jbGFzcyBEb3VibGVRdW90ZSBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFsnXCInLCAnXCInXVxufVxuXG5jbGFzcyBTaW5nbGVRdW90ZSBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFtcIidcIiwgXCInXCJdXG59XG5cbmNsYXNzIEJhY2tUaWNrIGV4dGVuZHMgUXVvdGUge1xuICBwYWlyID0gWydgJywgJ2AnXVxufVxuXG5jbGFzcyBDdXJseUJyYWNrZXQgZXh0ZW5kcyBQYWlyIHtcbiAgcGFpciA9IFsneycsICd9J11cbn1cblxuY2xhc3MgU3F1YXJlQnJhY2tldCBleHRlbmRzIFBhaXIge1xuICBwYWlyID0gWydbJywgJ10nXVxufVxuXG5jbGFzcyBQYXJlbnRoZXNpcyBleHRlbmRzIFBhaXIge1xuICBwYWlyID0gWycoJywgJyknXVxufVxuXG5jbGFzcyBBbmdsZUJyYWNrZXQgZXh0ZW5kcyBQYWlyIHtcbiAgcGFpciA9IFsnPCcsICc+J11cbn1cblxuY2xhc3MgVGFnIGV4dGVuZHMgUGFpciB7XG4gIGFsbG93TmV4dExpbmUgPSB0cnVlXG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcbiAgYWRqdXN0SW5uZXJSYW5nZSA9IGZhbHNlXG5cbiAgZ2V0VGFnU3RhcnRQb2ludCAoZnJvbSkge1xuICAgIGNvbnN0IHJlZ2V4ID0gUGFpckZpbmRlci5UYWdGaW5kZXIucGF0dGVyblxuICAgIGNvbnN0IG9wdGlvbnMgPSB7ZnJvbTogW2Zyb20ucm93LCAwXX1cbiAgICByZXR1cm4gdGhpcy5maW5kSW5FZGl0b3IoJ2ZvcndhcmQnLCByZWdleCwgb3B0aW9ucywgKHtyYW5nZX0pID0+IHJhbmdlLmNvbnRhaW5zUG9pbnQoZnJvbSwgdHJ1ZSkgJiYgcmFuZ2Uuc3RhcnQpXG4gIH1cblxuICBnZXRGaW5kZXIgKCkge1xuICAgIHJldHVybiBuZXcgUGFpckZpbmRlci5UYWdGaW5kZXIodGhpcy5lZGl0b3IsIHtcbiAgICAgIGFsbG93TmV4dExpbmU6IHRoaXMuaXNBbGxvd05leHRMaW5lKCksXG4gICAgICBhbGxvd0ZvcndhcmRpbmc6IHRoaXMuYWxsb3dGb3J3YXJkaW5nLFxuICAgICAgaW5jbHVzaXZlOiB0aGlzLmluY2x1c2l2ZVxuICAgIH0pXG4gIH1cblxuICBnZXRQYWlySW5mbyAoZnJvbSkge1xuICAgIHJldHVybiBzdXBlci5nZXRQYWlySW5mbyh0aGlzLmdldFRhZ1N0YXJ0UG9pbnQoZnJvbSkgfHwgZnJvbSlcbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBQYXJhZ3JhcGhcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFBhcmFncmFwaCBpcyBkZWZpbmVkIGFzIGNvbnNlY3V0aXZlIChub24tKWJsYW5rLWxpbmUuXG5jbGFzcyBQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcbiAgc3VwcG9ydENvdW50ID0gdHJ1ZVxuXG4gIGZpbmRSb3cgKGZyb21Sb3csIGRpcmVjdGlvbiwgZm4pIHtcbiAgICBpZiAoZm4ucmVzZXQpIGZuLnJlc2V0KClcbiAgICBsZXQgZm91bmRSb3cgPSBmcm9tUm93XG4gICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy5nZXRCdWZmZXJSb3dzKHtzdGFydFJvdzogZnJvbVJvdywgZGlyZWN0aW9ufSkpIHtcbiAgICAgIGlmICghZm4ocm93LCBkaXJlY3Rpb24pKSBicmVha1xuICAgICAgZm91bmRSb3cgPSByb3dcbiAgICB9XG4gICAgcmV0dXJuIGZvdW5kUm93XG4gIH1cblxuICBmaW5kUm93UmFuZ2VCeSAoZnJvbVJvdywgZm4pIHtcbiAgICBjb25zdCBzdGFydFJvdyA9IHRoaXMuZmluZFJvdyhmcm9tUm93LCAncHJldmlvdXMnLCBmbilcbiAgICBjb25zdCBlbmRSb3cgPSB0aGlzLmZpbmRSb3coZnJvbVJvdywgJ25leHQnLCBmbilcbiAgICByZXR1cm4gW3N0YXJ0Um93LCBlbmRSb3ddXG4gIH1cblxuICBnZXRQcmVkaWN0RnVuY3Rpb24gKGZyb21Sb3csIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IGZyb21Sb3dSZXN1bHQgPSB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKGZyb21Sb3cpXG5cbiAgICBpZiAodGhpcy5pc0lubmVyKCkpIHtcbiAgICAgIHJldHVybiAocm93LCBkaXJlY3Rpb24pID0+IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KSA9PT0gZnJvbVJvd1Jlc3VsdFxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkaXJlY3Rpb25Ub0V4dGVuZCA9IHNlbGVjdGlvbi5pc1JldmVyc2VkKCkgPyAncHJldmlvdXMnIDogJ25leHQnXG5cbiAgICAgIGxldCBmbGlwID0gZmFsc2VcbiAgICAgIGNvbnN0IHByZWRpY3QgPSAocm93LCBkaXJlY3Rpb24pID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpID09PSBmcm9tUm93UmVzdWx0XG4gICAgICAgIGlmIChmbGlwKSB7XG4gICAgICAgICAgcmV0dXJuICFyZXN1bHRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIXJlc3VsdCAmJiBkaXJlY3Rpb24gPT09IGRpcmVjdGlvblRvRXh0ZW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZsaXAgPSB0cnVlKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHByZWRpY3QucmVzZXQgPSAoKSA9PiAoZmxpcCA9IGZhbHNlKVxuICAgICAgcmV0dXJuIHByZWRpY3RcbiAgICB9XG4gIH1cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgbGV0IGZyb21Sb3cgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgaWYgKHRoaXMuaXNNb2RlKCd2aXN1YWwnLCAnbGluZXdpc2UnKSkge1xuICAgICAgaWYgKHNlbGVjdGlvbi5pc1JldmVyc2VkKCkpIGZyb21Sb3ctLVxuICAgICAgZWxzZSBmcm9tUm93KytcbiAgICAgIGZyb21Sb3cgPSB0aGlzLmdldFZhbGlkVmltQnVmZmVyUm93KGZyb21Sb3cpXG4gICAgfVxuICAgIGNvbnN0IHJvd1JhbmdlID0gdGhpcy5maW5kUm93UmFuZ2VCeShmcm9tUm93LCB0aGlzLmdldFByZWRpY3RGdW5jdGlvbihmcm9tUm93LCBzZWxlY3Rpb24pKVxuICAgIHJldHVybiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbih0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpKVxuICB9XG59XG5cbmNsYXNzIEluZGVudGF0aW9uIGV4dGVuZHMgUGFyYWdyYXBoIHtcbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IGZyb21Sb3cgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgY29uc3QgYmFzZUluZGVudExldmVsID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coZnJvbVJvdylcbiAgICBjb25zdCByb3dSYW5nZSA9IHRoaXMuZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgcm93ID0+IHtcbiAgICAgIGlmICh0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdykpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNBKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpID49IGJhc2VJbmRlbnRMZXZlbFxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSlcbiAgfVxufVxuXG4vLyBTZWN0aW9uOiBDb21tZW50XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21tZW50IGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIENvbW1lbnRcbiAgd2lzZSA9ICdsaW5ld2lzZSdcblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge3Jvd30gPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCByb3dSYW5nZSA9IHRoaXMudXRpbHMuZ2V0Um93UmFuZ2VGb3JDb21tZW50QXRCdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdylcbiAgICBpZiAocm93UmFuZ2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIENvbW1lbnRPclBhcmFncmFwaCBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7aW5uZXJ9ID0gdGhpc1xuICAgIGZvciAoY29uc3Qga2xhc3Mgb2YgWydDb21tZW50JywgJ1BhcmFncmFwaCddKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0SW5zdGFuY2Uoa2xhc3MsIHtpbm5lcn0pLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIGlmIChyYW5nZSkge1xuICAgICAgICByZXR1cm4gcmFuZ2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gU2VjdGlvbjogRm9sZFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRm9sZCBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cm93fSA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHNlbGVjdGVkUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gICAgY29uc3QgZm9sZFJhbmdlcyA9IHRoaXMudXRpbHMuZ2V0Q29kZUZvbGRSYW5nZXModGhpcy5lZGl0b3IpXG4gICAgY29uc3QgZm9sZFJhbmdlc0NvbnRhaW5zQ3Vyc29yUm93ID0gZm9sZFJhbmdlcy5maWx0ZXIocmFuZ2UgPT4gcmFuZ2Uuc3RhcnQucm93IDw9IHJvdyAmJiByb3cgPD0gcmFuZ2UuZW5kLnJvdylcblxuICAgIGZvciAobGV0IGZvbGRSYW5nZSBvZiBmb2xkUmFuZ2VzQ29udGFpbnNDdXJzb3JSb3cucmV2ZXJzZSgpKSB7XG4gICAgICBpZiAodGhpcy5pc0EoKSkge1xuICAgICAgICBsZXQgY29uam9pbmVkXG4gICAgICAgIHdoaWxlICgoY29uam9pbmVkID0gZm9sZFJhbmdlcy5maW5kKHJhbmdlID0+IHJhbmdlLmVuZC5yb3cgPT09IGZvbGRSYW5nZS5zdGFydC5yb3cpKSkge1xuICAgICAgICAgIGZvbGRSYW5nZSA9IGZvbGRSYW5nZS51bmlvbihjb25qb2luZWQpXG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKChjb25qb2luZWQgPSBmb2xkUmFuZ2VzLmZpbmQocmFuZ2UgPT4gcmFuZ2Uuc3RhcnQucm93ID09PSBmb2xkUmFuZ2UuZW5kLnJvdykpKSB7XG4gICAgICAgICAgZm9sZFJhbmdlID0gZm9sZFJhbmdlLnVuaW9uKGNvbmpvaW5lZClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMudXRpbHMuZG9lc1JhbmdlU3RhcnRBbmRFbmRXaXRoU2FtZUluZGVudExldmVsKHRoaXMuZWRpdG9yLCBmb2xkUmFuZ2UpKSB7XG4gICAgICAgICAgZm9sZFJhbmdlLmVuZC5yb3cgLT0gMVxuICAgICAgICB9XG4gICAgICAgIGZvbGRSYW5nZS5zdGFydC5yb3cgKz0gMVxuICAgICAgfVxuICAgICAgZm9sZFJhbmdlID0gdGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKFtmb2xkUmFuZ2Uuc3RhcnQucm93LCBmb2xkUmFuZ2UuZW5kLnJvd10pXG4gICAgICBpZiAoIXNlbGVjdGVkUmFuZ2UuY29udGFpbnNSYW5nZShmb2xkUmFuZ2UpKSB7XG4gICAgICAgIHJldHVybiBmb2xkUmFuZ2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgRnVuY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcbiAgc2NvcGVOYW1lc09taXR0aW5nQ2xvc2luZ0JyYWNlID0gWydzb3VyY2UuZ28nLCAnc291cmNlLmVsaXhpciddIC8vIGxhbmd1YWdlIGRvZXNuJ3QgaW5jbHVkZSBjbG9zaW5nIGB9YCBpbnRvIGZvbGQuXG5cbiAgZ2V0RnVuY3Rpb25Cb2R5U3RhcnRSZWdleCAoe3Njb3BlTmFtZX0pIHtcbiAgICBpZiAoc2NvcGVOYW1lID09PSAnc291cmNlLnB5dGhvbicpIHtcbiAgICAgIHJldHVybiAvOiQvXG4gICAgfSBlbHNlIGlmIChzY29wZU5hbWUgPT09ICdzb3VyY2UuY29mZmVlJykge1xuICAgICAgcmV0dXJuIC8tfD0+JC9cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIC97JC9cbiAgICB9XG4gIH1cblxuICBpc011bHRpTGluZVBhcmFtZXRlckZ1bmN0aW9uUmFuZ2UgKHBhcmFtZXRlclJhbmdlLCBib2R5UmFuZ2UsIGJvZHlTdGFydFJlZ2V4KSB7XG4gICAgY29uc3QgaXNCb2R5U3RhcnRSb3cgPSByb3cgPT4gYm9keVN0YXJ0UmVnZXgudGVzdCh0aGlzLmVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpKVxuICAgIGlmIChpc0JvZHlTdGFydFJvdyhwYXJhbWV0ZXJSYW5nZS5zdGFydC5yb3cpKSByZXR1cm4gZmFsc2VcbiAgICBpZiAoaXNCb2R5U3RhcnRSb3cocGFyYW1ldGVyUmFuZ2UuZW5kLnJvdykpIHJldHVybiBwYXJhbWV0ZXJSYW5nZS5lbmQucm93ID09PSBib2R5UmFuZ2Uuc3RhcnQucm93XG4gICAgaWYgKGlzQm9keVN0YXJ0Um93KHBhcmFtZXRlclJhbmdlLmVuZC5yb3cgKyAxKSkgcmV0dXJuIHBhcmFtZXRlclJhbmdlLmVuZC5yb3cgKyAxID09PSBib2R5UmFuZ2Uuc3RhcnQucm93XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgZWRpdG9yID0gdGhpcy5lZGl0b3JcbiAgICBjb25zdCBjdXJzb3JSb3cgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgY29uc3QgYm9keVN0YXJ0UmVnZXggPSB0aGlzLmdldEZ1bmN0aW9uQm9keVN0YXJ0UmVnZXgoZWRpdG9yLmdldEdyYW1tYXIoKSlcbiAgICBjb25zdCBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93ID0gcm93ID0+IHRoaXMudXRpbHMuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyhlZGl0b3IsIHJvdylcblxuICAgIGNvbnN0IGZ1bmN0aW9uUmFuZ2VzID0gW11cbiAgICBjb25zdCBzYXZlRnVuY3Rpb25SYW5nZSA9ICh7YVJhbmdlLCBpbm5lclJhbmdlfSkgPT4ge1xuICAgICAgZnVuY3Rpb25SYW5nZXMucHVzaCh7XG4gICAgICAgIGFSYW5nZTogdGhpcy5idWlsZEFSYW5nZShhUmFuZ2UpLFxuICAgICAgICBpbm5lclJhbmdlOiB0aGlzLmJ1aWxkSW5uZXJSYW5nZShpbm5lclJhbmdlKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBmb2xkUmFuZ2VzID0gdGhpcy51dGlscy5nZXRDb2RlRm9sZFJhbmdlcyhlZGl0b3IpXG4gICAgd2hpbGUgKGZvbGRSYW5nZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCByYW5nZSA9IGZvbGRSYW5nZXMuc2hpZnQoKVxuICAgICAgaWYgKGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3cocmFuZ2Uuc3RhcnQucm93KSkge1xuICAgICAgICBjb25zdCBuZXh0UmFuZ2UgPSBmb2xkUmFuZ2VzWzBdXG4gICAgICAgIGNvbnN0IG5leHRGb2xkSXNDb25uZWN0ZWQgPSBuZXh0UmFuZ2UgJiYgbmV4dFJhbmdlLnN0YXJ0LnJvdyA8PSByYW5nZS5lbmQucm93ICsgMVxuICAgICAgICBjb25zdCBtYXliZUFGdW5jdGlvblJhbmdlID0gbmV4dEZvbGRJc0Nvbm5lY3RlZCA/IHJhbmdlLnVuaW9uKG5leHRSYW5nZSkgOiByYW5nZVxuICAgICAgICBpZiAoIW1heWJlQUZ1bmN0aW9uUmFuZ2UuY29udGFpbnNQb2ludChbY3Vyc29yUm93LCBJbmZpbml0eV0pKSBjb250aW51ZSAvLyBza2lwIHRvIGF2b2lkIGhlYXZ5IGNvbXB1dGF0aW9uXG4gICAgICAgIGlmIChuZXh0Rm9sZElzQ29ubmVjdGVkICYmIHRoaXMuaXNNdWx0aUxpbmVQYXJhbWV0ZXJGdW5jdGlvblJhbmdlKHJhbmdlLCBuZXh0UmFuZ2UsIGJvZHlTdGFydFJlZ2V4KSkge1xuICAgICAgICAgIGNvbnN0IGJvZHlSYW5nZSA9IGZvbGRSYW5nZXMuc2hpZnQoKVxuICAgICAgICAgIHNhdmVGdW5jdGlvblJhbmdlKHthUmFuZ2U6IHJhbmdlLnVuaW9uKGJvZHlSYW5nZSksIGlubmVyUmFuZ2U6IGJvZHlSYW5nZX0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2F2ZUZ1bmN0aW9uUmFuZ2Uoe2FSYW5nZTogcmFuZ2UsIGlubmVyUmFuZ2U6IHJhbmdlfSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcHJldmlvdXNSb3cgPSByYW5nZS5zdGFydC5yb3cgLSAxXG4gICAgICAgIGlmIChwcmV2aW91c1JvdyA8IDApIGNvbnRpbnVlXG4gICAgICAgIGlmIChlZGl0b3IuaXNGb2xkYWJsZUF0QnVmZmVyUm93KHByZXZpb3VzUm93KSkgY29udGludWVcbiAgICAgICAgY29uc3QgbWF5YmVBRnVuY3Rpb25SYW5nZSA9IHJhbmdlLnVuaW9uKGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhwcmV2aW91c1JvdykpXG4gICAgICAgIGlmICghbWF5YmVBRnVuY3Rpb25SYW5nZS5jb250YWluc1BvaW50KFtjdXJzb3JSb3csIEluZmluaXR5XSkpIGNvbnRpbnVlIC8vIHNraXAgdG8gYXZvaWQgaGVhdnkgY29tcHV0YXRpb25cblxuICAgICAgICBjb25zdCBpc0JvZHlTdGFydE9ubHlSb3cgPSByb3cgPT5cbiAgICAgICAgICBuZXcgUmVnRXhwKCdeXFxcXHMqJyArIGJvZHlTdGFydFJlZ2V4LnNvdXJjZSkudGVzdChlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KSlcbiAgICAgICAgaWYgKGlzQm9keVN0YXJ0T25seVJvdyhyYW5nZS5zdGFydC5yb3cpICYmIGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3cocHJldmlvdXNSb3cpKSB7XG4gICAgICAgICAgc2F2ZUZ1bmN0aW9uUmFuZ2Uoe2FSYW5nZTogbWF5YmVBRnVuY3Rpb25SYW5nZSwgaW5uZXJSYW5nZTogcmFuZ2V9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBmdW5jdGlvblJhbmdlIG9mIGZ1bmN0aW9uUmFuZ2VzLnJldmVyc2UoKSkge1xuICAgICAgY29uc3Qge3N0YXJ0LCBlbmR9ID0gdGhpcy5pc0EoKSA/IGZ1bmN0aW9uUmFuZ2UuYVJhbmdlIDogZnVuY3Rpb25SYW5nZS5pbm5lclJhbmdlXG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShbc3RhcnQucm93LCBlbmQucm93XSlcbiAgICAgIGlmICghc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuY29udGFpbnNSYW5nZShyYW5nZSkpIHJldHVybiByYW5nZVxuICAgIH1cbiAgfVxuXG4gIGJ1aWxkSW5uZXJSYW5nZSAocmFuZ2UpIHtcbiAgICBjb25zdCBlbmRSb3dUcmFuc2xhdGlvbiA9IHRoaXMudXRpbHMuZG9lc1JhbmdlU3RhcnRBbmRFbmRXaXRoU2FtZUluZGVudExldmVsKHRoaXMuZWRpdG9yLCByYW5nZSkgPyAtMSA6IDBcbiAgICByZXR1cm4gcmFuZ2UudHJhbnNsYXRlKFsxLCAwXSwgW2VuZFJvd1RyYW5zbGF0aW9uLCAwXSlcbiAgfVxuXG4gIGJ1aWxkQVJhbmdlIChyYW5nZSkge1xuICAgIC8vIE5PVEU6IFRoaXMgYWRqdXN0bWVudCBzaG91ZCBub3QgYmUgbmVjZXNzYXJ5IGlmIGxhbmd1YWdlLXN5bnRheCBpcyBwcm9wZXJseSBkZWZpbmVkLlxuICAgIGNvbnN0IGVuZFJvd1RyYW5zbGF0aW9uID0gdGhpcy5pc0dyYW1tYXJEb2VzTm90Rm9sZENsb3NpbmdSb3coKSA/ICsxIDogMFxuICAgIHJldHVybiByYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbZW5kUm93VHJhbnNsYXRpb24sIDBdKVxuICB9XG5cbiAgaXNHcmFtbWFyRG9lc05vdEZvbGRDbG9zaW5nUm93ICgpIHtcbiAgICBjb25zdCB7c2NvcGVOYW1lLCBwYWNrYWdlTmFtZX0gPSB0aGlzLmVkaXRvci5nZXRHcmFtbWFyKClcbiAgICBpZiAodGhpcy5zY29wZU5hbWVzT21pdHRpbmdDbG9zaW5nQnJhY2UuaW5jbHVkZXMoc2NvcGVOYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSEFDSzogUnVzdCBoYXZlIHR3byBwYWNrYWdlIGBsYW5ndWFnZS1ydXN0YCBhbmQgYGF0b20tbGFuZ3VhZ2UtcnVzdGBcbiAgICAgIC8vIGxhbmd1YWdlLXJ1c3QgZG9uJ3QgZm9sZCBlbmRpbmcgYH1gLCBidXQgYXRvbS1sYW5ndWFnZS1ydXN0IGRvZXMuXG4gICAgICByZXR1cm4gc2NvcGVOYW1lID09PSAnc291cmNlLnJ1c3QnICYmIHBhY2thZ2VOYW1lID09PSAnbGFuZ3VhZ2UtcnVzdCdcbiAgICB9XG4gIH1cbn1cblxuLy8gU2VjdGlvbjogT3RoZXJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEFyZ3VtZW50cyBleHRlbmRzIFRleHRPYmplY3Qge1xuICBuZXdBcmdJbmZvIChhcmdTdGFydCwgYXJnLCBzZXBhcmF0b3IpIHtcbiAgICBjb25zdCBhcmdFbmQgPSB0aGlzLnV0aWxzLnRyYXZlcnNlVGV4dEZyb21Qb2ludChhcmdTdGFydCwgYXJnKVxuICAgIGNvbnN0IGFyZ1JhbmdlID0gbmV3IFJhbmdlKGFyZ1N0YXJ0LCBhcmdFbmQpXG5cbiAgICBjb25zdCBzZXBhcmF0b3JFbmQgPSB0aGlzLnV0aWxzLnRyYXZlcnNlVGV4dEZyb21Qb2ludChhcmdFbmQsIHNlcGFyYXRvciAhPSBudWxsID8gc2VwYXJhdG9yIDogJycpXG4gICAgY29uc3Qgc2VwYXJhdG9yUmFuZ2UgPSBuZXcgUmFuZ2UoYXJnRW5kLCBzZXBhcmF0b3JFbmQpXG5cbiAgICBjb25zdCBpbm5lclJhbmdlID0gYXJnUmFuZ2VcbiAgICBjb25zdCBhUmFuZ2UgPSBhcmdSYW5nZS51bmlvbihzZXBhcmF0b3JSYW5nZSlcbiAgICByZXR1cm4ge2FyZ1JhbmdlLCBzZXBhcmF0b3JSYW5nZSwgaW5uZXJSYW5nZSwgYVJhbmdlfVxuICB9XG5cbiAgZ2V0QXJndW1lbnRzUmFuZ2VGb3JTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBtZW1iZXI6IFsnQ3VybHlCcmFja2V0JywgJ1NxdWFyZUJyYWNrZXQnLCAnUGFyZW50aGVzaXMnXSxcbiAgICAgIGluY2x1c2l2ZTogZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW5zdGFuY2UoJ0lubmVyQW55UGFpcicsIG9wdGlvbnMpLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgfVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7c3BsaXRBcmd1bWVudHMsIHRyYXZlcnNlVGV4dEZyb21Qb2ludCwgZ2V0TGFzdH0gPSB0aGlzLnV0aWxzXG4gICAgbGV0IHJhbmdlID0gdGhpcy5nZXRBcmd1bWVudHNSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3QgcGFpclJhbmdlRm91bmQgPSByYW5nZSAhPSBudWxsXG5cbiAgICByYW5nZSA9IHJhbmdlIHx8IHRoaXMuZ2V0SW5zdGFuY2UoJ0lubmVyQ3VycmVudExpbmUnKS5nZXRSYW5nZShzZWxlY3Rpb24pIC8vIGZhbGxiYWNrXG4gICAgaWYgKCFyYW5nZSkgcmV0dXJuXG5cbiAgICByYW5nZSA9IHRoaXMudHJpbUJ1ZmZlclJhbmdlKHJhbmdlKVxuXG4gICAgY29uc3QgdGV4dCA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIGNvbnN0IGFsbFRva2VucyA9IHNwbGl0QXJndW1lbnRzKHRleHQsIHBhaXJSYW5nZUZvdW5kKVxuXG4gICAgY29uc3QgYXJnSW5mb3MgPSBbXVxuICAgIGxldCBhcmdTdGFydCA9IHJhbmdlLnN0YXJ0XG5cbiAgICAvLyBTa2lwIHN0YXJ0aW5nIHNlcGFyYXRvclxuICAgIGlmIChhbGxUb2tlbnMubGVuZ3RoICYmIGFsbFRva2Vuc1swXS50eXBlID09PSAnc2VwYXJhdG9yJykge1xuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgYXJnU3RhcnQgPSB0cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnU3RhcnQsIHRva2VuLnRleHQpXG4gICAgfVxuXG4gICAgd2hpbGUgKGFsbFRva2Vucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIGlmICh0b2tlbi50eXBlID09PSAnYXJndW1lbnQnKSB7XG4gICAgICAgIGNvbnN0IG5leHRUb2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICAgIGNvbnN0IHNlcGFyYXRvciA9IG5leHRUb2tlbiA/IG5leHRUb2tlbi50ZXh0IDogdW5kZWZpbmVkXG4gICAgICAgIGNvbnN0IGFyZ0luZm8gPSB0aGlzLm5ld0FyZ0luZm8oYXJnU3RhcnQsIHRva2VuLnRleHQsIHNlcGFyYXRvcilcblxuICAgICAgICBpZiAoYWxsVG9rZW5zLmxlbmd0aCA9PT0gMCAmJiBhcmdJbmZvcy5sZW5ndGgpIHtcbiAgICAgICAgICBhcmdJbmZvLmFSYW5nZSA9IGFyZ0luZm8uYXJnUmFuZ2UudW5pb24oZ2V0TGFzdChhcmdJbmZvcykuc2VwYXJhdG9yUmFuZ2UpXG4gICAgICAgIH1cblxuICAgICAgICBhcmdTdGFydCA9IGFyZ0luZm8uYVJhbmdlLmVuZFxuICAgICAgICBhcmdJbmZvcy5wdXNoKGFyZ0luZm8pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ211c3Qgbm90IGhhcHBlbicpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBmb3IgKGNvbnN0IHtpbm5lclJhbmdlLCBhUmFuZ2V9IG9mIGFyZ0luZm9zKSB7XG4gICAgICBpZiAoaW5uZXJSYW5nZS5lbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocG9pbnQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzSW5uZXIoKSA/IGlubmVyUmFuZ2UgOiBhUmFuZ2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ3VycmVudExpbmUgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpXG4gICAgcmV0dXJuIHRoaXMuaXNBKCkgPyByYW5nZSA6IHRoaXMudHJpbUJ1ZmZlclJhbmdlKHJhbmdlKVxuICB9XG59XG5cbmNsYXNzIEVudGlyZSBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuYnVmZmVyLmdldFJhbmdlKClcbiAgfVxufVxuXG5jbGFzcyBFbXB0eSBleHRlbmRzIFRleHRPYmplY3Qge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG59XG5cbmNsYXNzIExhdGVzdENoYW5nZSBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KCdbJylcbiAgICBjb25zdCBlbmQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KCddJylcbiAgICBpZiAoc3RhcnQgJiYgZW5kKSB7XG4gICAgICByZXR1cm4gbmV3IFJhbmdlKHN0YXJ0LCBlbmQpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFNlYXJjaE1hdGNoRm9yd2FyZCBleHRlbmRzIFRleHRPYmplY3Qge1xuICBiYWNrd2FyZCA9IGZhbHNlXG5cbiAgZmluZE1hdGNoIChmcm9tLCByZWdleCkge1xuICAgIGlmICh0aGlzLmJhY2t3YXJkKSB7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSAndmlzdWFsJykge1xuICAgICAgICBmcm9tID0gdGhpcy51dGlscy50cmFuc2xhdGVQb2ludEFuZENsaXAodGhpcy5lZGl0b3IsIGZyb20sICdiYWNrd2FyZCcpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7ZnJvbTogW2Zyb20ucm93LCBJbmZpbml0eV19XG4gICAgICByZXR1cm4ge1xuICAgICAgICByYW5nZTogdGhpcy5maW5kSW5FZGl0b3IoJ2JhY2t3YXJkJywgcmVnZXgsIG9wdGlvbnMsICh7cmFuZ2V9KSA9PiByYW5nZS5zdGFydC5pc0xlc3NUaGFuKGZyb20pICYmIHJhbmdlKSxcbiAgICAgICAgd2hpY2hJc0hlYWQ6ICdzdGFydCdcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gJ3Zpc3VhbCcpIHtcbiAgICAgICAgZnJvbSA9IHRoaXMudXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBmcm9tLCAnZm9yd2FyZCcpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7ZnJvbTogW2Zyb20ucm93LCAwXX1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJhbmdlOiB0aGlzLmZpbmRJbkVkaXRvcignZm9yd2FyZCcsIHJlZ2V4LCBvcHRpb25zLCAoe3JhbmdlfSkgPT4gcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4oZnJvbSkgJiYgcmFuZ2UpLFxuICAgICAgICB3aGljaElzSGVhZDogJ2VuZCdcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0U2VhcmNoUGF0dGVybicpXG4gICAgaWYgKCFwYXR0ZXJuKSByZXR1cm5cblxuICAgIGNvbnN0IGZyb21Qb2ludCA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIGNvbnN0IHtyYW5nZSwgd2hpY2hJc0hlYWR9ID0gdGhpcy5maW5kTWF0Y2goZnJvbVBvaW50LCBwYXR0ZXJuKVxuICAgIGlmIChyYW5nZSkge1xuICAgICAgcmV0dXJuIHRoaXMudW5pb25SYW5nZUFuZERldGVybWluZVJldmVyc2VkU3RhdGUoc2VsZWN0aW9uLCByYW5nZSwgd2hpY2hJc0hlYWQpXG4gICAgfVxuICB9XG5cbiAgdW5pb25SYW5nZUFuZERldGVybWluZVJldmVyc2VkU3RhdGUgKHNlbGVjdGlvbiwgcmFuZ2UsIHdoaWNoSXNIZWFkKSB7XG4gICAgaWYgKHNlbGVjdGlvbi5pc0VtcHR5KCkpIHJldHVybiByYW5nZVxuXG4gICAgbGV0IGhlYWQgPSByYW5nZVt3aGljaElzSGVhZF1cbiAgICBjb25zdCB0YWlsID0gc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBpZiAodGhpcy5iYWNrd2FyZCkge1xuICAgICAgaWYgKHRhaWwuaXNMZXNzVGhhbihoZWFkKSkgaGVhZCA9IHRoaXMudXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBoZWFkLCAnZm9yd2FyZCcpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChoZWFkLmlzTGVzc1RoYW4odGFpbCkpIGhlYWQgPSB0aGlzLnV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCh0aGlzLmVkaXRvciwgaGVhZCwgJ2JhY2t3YXJkJylcbiAgICB9XG5cbiAgICB0aGlzLnJldmVyc2VkID0gaGVhZC5pc0xlc3NUaGFuKHRhaWwpXG4gICAgcmV0dXJuIG5ldyBSYW5nZSh0YWlsLCBoZWFkKS51bmlvbih0aGlzLnN3cmFwKHNlbGVjdGlvbikuZ2V0VGFpbEJ1ZmZlclJhbmdlKCkpXG4gIH1cblxuICBzZWxlY3RUZXh0T2JqZWN0IChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgIGlmIChyYW5nZSkge1xuICAgICAgdGhpcy5zd3JhcChzZWxlY3Rpb24pLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCB7cmV2ZXJzZWQ6IHRoaXMucmV2ZXJzZWQgIT0gbnVsbCA/IHRoaXMucmV2ZXJzZWQgOiB0aGlzLmJhY2t3YXJkfSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFNlYXJjaE1hdGNoQmFja3dhcmQgZXh0ZW5kcyBTZWFyY2hNYXRjaEZvcndhcmQge1xuICBiYWNrd2FyZCA9IHRydWVcbn1cblxuLy8gW0xpbWl0YXRpb246IHdvbid0IGZpeF06IFNlbGVjdGVkIHJhbmdlIGlzIG5vdCBzdWJtb2RlIGF3YXJlLiBhbHdheXMgY2hhcmFjdGVyd2lzZS5cbi8vIFNvIGV2ZW4gaWYgb3JpZ2luYWwgc2VsZWN0aW9uIHdhcyB2TCBvciB2Qiwgc2VsZWN0ZWQgcmFuZ2UgYnkgdGhpcyB0ZXh0LW9iamVjdFxuLy8gaXMgYWx3YXlzIHZDIHJhbmdlLlxuY2xhc3MgUHJldmlvdXNTZWxlY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0IChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cHJvcGVydGllcywgc3VibW9kZX0gPSB0aGlzLnZpbVN0YXRlLnByZXZpb3VzU2VsZWN0aW9uXG4gICAgaWYgKHByb3BlcnRpZXMgJiYgc3VibW9kZSkge1xuICAgICAgdGhpcy53aXNlID0gc3VibW9kZVxuICAgICAgdGhpcy5zd3JhcCh0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLnNlbGVjdEJ5UHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIHNlbGVjdFRleHRPYmplY3QgKHNlbGVjdGlvbikge1xuICAgIGlmICh0aGlzLnZpbVN0YXRlLmhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBVc2VkIG9ubHkgYnkgUmVwbGFjZVdpdGhSZWdpc3RlciBhbmQgUHV0QmVmb3JlIGFuZCBpdHMnIGNoaWxkcmVuLlxuY2xhc3MgTGFzdFBhc3RlZFJhbmdlIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0IChzZWxlY3Rpb24pIHtcbiAgICBmb3IgKHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLmdldFBhc3RlZFJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZSlcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuXG5jbGFzcyBWaXNpYmxlQXJlYSBleHRlbmRzIFRleHRPYmplY3Qge1xuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBbc3RhcnRSb3csIGVuZFJvd10gPSB0aGlzLmVkaXRvci5nZXRWaXNpYmxlUm93UmFuZ2UoKVxuICAgIHJldHVybiB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvclNjcmVlblJhbmdlKFtbc3RhcnRSb3csIDBdLCBbZW5kUm93LCBJbmZpbml0eV1dKVxuICB9XG59XG5cbmNsYXNzIERpZmZIdW5rIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByb3cgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0SHVua1JhbmdlQXRCdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdylcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oXG4gIHtcbiAgICBUZXh0T2JqZWN0LFxuICAgIFdvcmQsXG4gICAgV2hvbGVXb3JkLFxuICAgIFNtYXJ0V29yZCxcbiAgICBTdWJ3b3JkLFxuICAgIFBhaXIsXG4gICAgQVBhaXIsXG4gICAgQW55UGFpcixcbiAgICBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nLFxuICAgIEFueVF1b3RlLFxuICAgIFF1b3RlLFxuICAgIERvdWJsZVF1b3RlLFxuICAgIFNpbmdsZVF1b3RlLFxuICAgIEJhY2tUaWNrLFxuICAgIEN1cmx5QnJhY2tldCxcbiAgICBTcXVhcmVCcmFja2V0LFxuICAgIFBhcmVudGhlc2lzLFxuICAgIEFuZ2xlQnJhY2tldCxcbiAgICBUYWcsXG4gICAgUGFyYWdyYXBoLFxuICAgIEluZGVudGF0aW9uLFxuICAgIENvbW1lbnQsXG4gICAgQ29tbWVudE9yUGFyYWdyYXBoLFxuICAgIEZvbGQsXG4gICAgRnVuY3Rpb24sXG4gICAgQXJndW1lbnRzLFxuICAgIEN1cnJlbnRMaW5lLFxuICAgIEVudGlyZSxcbiAgICBFbXB0eSxcbiAgICBMYXRlc3RDaGFuZ2UsXG4gICAgU2VhcmNoTWF0Y2hGb3J3YXJkLFxuICAgIFNlYXJjaE1hdGNoQmFja3dhcmQsXG4gICAgUHJldmlvdXNTZWxlY3Rpb24sXG4gICAgUGVyc2lzdGVudFNlbGVjdGlvbixcbiAgICBMYXN0UGFzdGVkUmFuZ2UsXG4gICAgVmlzaWJsZUFyZWFcbiAgfSxcbiAgV29yZC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgV2hvbGVXb3JkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBTbWFydFdvcmQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFN1YndvcmQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFueVBhaXIuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFueVBhaXJBbGxvd0ZvcndhcmRpbmcuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFueVF1b3RlLmRlcml2ZUNsYXNzKHRydWUpLFxuICBEb3VibGVRdW90ZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgU2luZ2xlUXVvdGUuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEJhY2tUaWNrLmRlcml2ZUNsYXNzKHRydWUpLFxuICBDdXJseUJyYWNrZXQuZGVyaXZlQ2xhc3ModHJ1ZSwgdHJ1ZSksXG4gIFNxdWFyZUJyYWNrZXQuZGVyaXZlQ2xhc3ModHJ1ZSwgdHJ1ZSksXG4gIFBhcmVudGhlc2lzLmRlcml2ZUNsYXNzKHRydWUsIHRydWUpLFxuICBBbmdsZUJyYWNrZXQuZGVyaXZlQ2xhc3ModHJ1ZSwgdHJ1ZSksXG4gIFRhZy5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgUGFyYWdyYXBoLmRlcml2ZUNsYXNzKHRydWUpLFxuICBJbmRlbnRhdGlvbi5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQ29tbWVudC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQ29tbWVudE9yUGFyYWdyYXBoLmRlcml2ZUNsYXNzKHRydWUpLFxuICBGb2xkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBGdW5jdGlvbi5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQXJndW1lbnRzLmRlcml2ZUNsYXNzKHRydWUpLFxuICBDdXJyZW50TGluZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgRW50aXJlLmRlcml2ZUNsYXNzKHRydWUpLFxuICBMYXRlc3RDaGFuZ2UuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFBlcnNpc3RlbnRTZWxlY3Rpb24uZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFZpc2libGVBcmVhLmRlcml2ZUNsYXNzKHRydWUpLFxuICBEaWZmSHVuay5kZXJpdmVDbGFzcyh0cnVlKVxuKVxuIl19