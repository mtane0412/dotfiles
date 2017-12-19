(function() {
  var Path, Shell, Task, fork;

  Task = require('atom').Task;

  Path = require('path');

  fork = require.resolve('./fork');

  module.exports = Shell = (function() {
    Shell.prototype.child = null;

    function Shell(arg1) {
      var args, disableInput, pwd, shellArguments, shellPath;
      pwd = arg1.pwd, shellPath = arg1.shellPath;
      disableInput = (function(_this) {
        return function() {
          _this.fork = null;
          _this.input = function() {};
          return _this.resize = function() {};
        };
      })(this);
      shellArguments = atom.config.get('terminal-plus.core.shellArguments');
      args = shellArguments.split(/\s+/g).filter(function(arg) {
        return arg;
      });
      if (/zsh|bash/.test(shellPath) && args.indexOf('--login') === -1) {
        args.unshift('--login');
      }
      this.fork = Task.once(fork, Path.resolve(pwd), shellPath, args, disableInput);
    }

    Shell.prototype.destroy = function() {
      return this.terminate();
    };


    /*
    Section: External Methods
     */

    Shell.prototype.input = function(data) {
      if (!this.isStillAlive()) {
        return;
      }
      return this.fork.send({
        event: 'input',
        text: data
      });
    };

    Shell.prototype.resize = function(cols, rows) {
      if (!this.isStillAlive()) {
        return;
      }
      return this.fork.send({
        event: 'resize',
        rows: rows,
        cols: cols
      });
    };

    Shell.prototype.isStillAlive = function() {
      if (!(this.fork && this.fork.childProcess)) {
        return false;
      }
      return this.fork.childProcess.connected && !this.fork.childProcess.killed;
    };

    Shell.prototype.terminate = function() {
      return this.fork.terminate();
    };

    Shell.prototype.on = function(event, handler) {
      return this.fork.on(event, handler);
    };

    Shell.prototype.off = function(event, handler) {
      if (handler) {
        return this.fork.off(event, handler);
      } else {
        return this.fork.off(event);
      }
    };

    return Shell;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvdGVybWluYWwtcGx1cy9saWIvc2hlbGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxNQUFSOztFQUVULElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsUUFBaEI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FDTTtvQkFDSixLQUFBLEdBQU87O0lBRU0sZUFBQyxJQUFEO0FBRVgsVUFBQTtNQUZhLGdCQUFLO01BRWxCLFlBQUEsR0FBZSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDYixLQUFDLENBQUEsSUFBRCxHQUFRO1VBQ1IsS0FBQyxDQUFBLEtBQUQsR0FBUyxTQUFBLEdBQUE7aUJBQ1QsS0FBQyxDQUFBLE1BQUQsR0FBVSxTQUFBLEdBQUE7UUFIRztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFLZixjQUFBLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQ0FBaEI7TUFDakIsSUFBQSxHQUFPLGNBQWMsQ0FBQyxLQUFmLENBQXFCLE1BQXJCLENBQTRCLENBQUMsTUFBN0IsQ0FBb0MsU0FBQyxHQUFEO2VBQVM7TUFBVCxDQUFwQztNQUNQLElBQUcsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBaEIsQ0FBQSxJQUErQixJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsQ0FBQSxLQUEyQixDQUFDLENBQTlEO1FBQ0UsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBREY7O01BR0EsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsRUFBZ0IsSUFBSSxDQUFDLE9BQUwsQ0FBYSxHQUFiLENBQWhCLEVBQW1DLFNBQW5DLEVBQThDLElBQTlDLEVBQW9ELFlBQXBEO0lBWkc7O29CQWNiLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLFNBQUQsQ0FBQTtJQURPOzs7QUFJVDs7OztvQkFJQSxLQUFBLEdBQU8sU0FBQyxJQUFEO01BQ0wsSUFBQSxDQUFjLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBZDtBQUFBLGVBQUE7O2FBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVc7UUFBQSxLQUFBLEVBQU8sT0FBUDtRQUFnQixJQUFBLEVBQU0sSUFBdEI7T0FBWDtJQUhLOztvQkFLUCxNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sSUFBUDtNQUNOLElBQUEsQ0FBYyxJQUFDLENBQUEsWUFBRCxDQUFBLENBQWQ7QUFBQSxlQUFBOzthQUVBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXO1FBQUMsS0FBQSxFQUFPLFFBQVI7UUFBa0IsTUFBQSxJQUFsQjtRQUF3QixNQUFBLElBQXhCO09BQVg7SUFITTs7b0JBS1IsWUFBQSxHQUFjLFNBQUE7TUFDWixJQUFBLENBQUEsQ0FBb0IsSUFBQyxDQUFBLElBQUQsSUFBVSxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQXBDLENBQUE7QUFBQSxlQUFPLE1BQVA7O0FBQ0EsYUFBTyxJQUFDLENBQUEsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFuQixJQUFpQyxDQUFDLElBQUMsQ0FBQSxJQUFJLENBQUMsWUFBWSxDQUFDO0lBRmhEOztvQkFJZCxTQUFBLEdBQVcsU0FBQTthQUNULElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixDQUFBO0lBRFM7O29CQUdYLEVBQUEsR0FBSSxTQUFDLEtBQUQsRUFBUSxPQUFSO2FBQ0YsSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsS0FBVCxFQUFnQixPQUFoQjtJQURFOztvQkFHSixHQUFBLEdBQUssU0FBQyxLQUFELEVBQVEsT0FBUjtNQUNILElBQUcsT0FBSDtlQUNFLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLEtBQVYsRUFBaUIsT0FBakIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxLQUFWLEVBSEY7O0lBREc7Ozs7O0FBbkRQIiwic291cmNlc0NvbnRlbnQiOlsie1Rhc2t9ID0gcmVxdWlyZSAnYXRvbSdcblxuUGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mb3JrID0gcmVxdWlyZS5yZXNvbHZlICcuL2ZvcmsnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFNoZWxsXG4gIGNoaWxkOiBudWxsXG5cbiAgY29uc3RydWN0b3I6ICh7cHdkLCBzaGVsbFBhdGh9KSAtPlxuXG4gICAgZGlzYWJsZUlucHV0ID0gPT5cbiAgICAgIEBmb3JrID0gbnVsbFxuICAgICAgQGlucHV0ID0gLT5cbiAgICAgIEByZXNpemUgPSAtPlxuXG4gICAgc2hlbGxBcmd1bWVudHMgPSBhdG9tLmNvbmZpZy5nZXQgJ3Rlcm1pbmFsLXBsdXMuY29yZS5zaGVsbEFyZ3VtZW50cydcbiAgICBhcmdzID0gc2hlbGxBcmd1bWVudHMuc3BsaXQoL1xccysvZykuZmlsdGVyIChhcmcpIC0+IGFyZ1xuICAgIGlmIC96c2h8YmFzaC8udGVzdChzaGVsbFBhdGgpIGFuZCBhcmdzLmluZGV4T2YoJy0tbG9naW4nKSA9PSAtMVxuICAgICAgYXJncy51bnNoaWZ0ICctLWxvZ2luJ1xuXG4gICAgQGZvcmsgPSBUYXNrLm9uY2UgZm9yaywgUGF0aC5yZXNvbHZlKHB3ZCksIHNoZWxsUGF0aCwgYXJncywgZGlzYWJsZUlucHV0XG5cbiAgZGVzdHJveTogLT5cbiAgICBAdGVybWluYXRlKClcblxuXG4gICMjI1xuICBTZWN0aW9uOiBFeHRlcm5hbCBNZXRob2RzXG4gICMjI1xuXG4gIGlucHV0OiAoZGF0YSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc1N0aWxsQWxpdmUoKVxuXG4gICAgQGZvcmsuc2VuZCBldmVudDogJ2lucHV0JywgdGV4dDogZGF0YVxuXG4gIHJlc2l6ZTogKGNvbHMsIHJvd3MpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXNTdGlsbEFsaXZlKClcblxuICAgIEBmb3JrLnNlbmQge2V2ZW50OiAncmVzaXplJywgcm93cywgY29sc31cblxuICBpc1N0aWxsQWxpdmU6IC0+XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBAZm9yayBhbmQgQGZvcmsuY2hpbGRQcm9jZXNzXG4gICAgcmV0dXJuIEBmb3JrLmNoaWxkUHJvY2Vzcy5jb25uZWN0ZWQgYW5kICFAZm9yay5jaGlsZFByb2Nlc3Mua2lsbGVkXG5cbiAgdGVybWluYXRlOiAtPlxuICAgIEBmb3JrLnRlcm1pbmF0ZSgpXG5cbiAgb246IChldmVudCwgaGFuZGxlcikgLT5cbiAgICBAZm9yay5vbiBldmVudCwgaGFuZGxlclxuXG4gIG9mZjogKGV2ZW50LCBoYW5kbGVyKSAtPlxuICAgIGlmIGhhbmRsZXJcbiAgICAgIEBmb3JrLm9mZiBldmVudCwgaGFuZGxlclxuICAgIGVsc2VcbiAgICAgIEBmb3JrLm9mZiBldmVudFxuIl19
