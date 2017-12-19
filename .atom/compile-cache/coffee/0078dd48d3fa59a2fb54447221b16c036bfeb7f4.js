(function() {
  var $, BrowserPlusView, CompositeDisposable, View, fs, jQ, path, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), View = ref.View, $ = ref.$;

  $ = jQ = require('jquery');

  require('jquery-ui/autocomplete');

  path = require('path');

  require('JSON2');

  fs = require('fs');

  require('jstorage');

  window.bp = {};

  window.bp.js = $.extend({}, window.$.jStorage);

  RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  module.exports = BrowserPlusView = (function(superClass) {
    extend(BrowserPlusView, superClass);

    function BrowserPlusView(model) {
      this.model = model;
      this.subscriptions = new CompositeDisposable;
      this.model.view = this;
      this.model.onDidDestroy((function(_this) {
        return function() {
          var base1;
          _this.subscriptions.dispose();
          return typeof (base1 = jQ(_this.url)).autocomplete === "function" ? base1.autocomplete('destroy') : void 0;
        };
      })(this));
      atom.notifications.onDidAddNotification(function(notification) {
        if (notification.type === 'info') {
          return setTimeout(function() {
            return notification.dismiss();
          }, 1000);
        }
      });
      BrowserPlusView.__super__.constructor.apply(this, arguments);
    }

    BrowserPlusView.content = function(params) {
      var hideURLBar, ref1, ref2, ref3, ref4, ref5, spinnerClass, url;
      url = params.url;
      spinnerClass = "fa fa-spinner";
      hideURLBar = '';
      if ((ref1 = params.opt) != null ? ref1.hideURLBar : void 0) {
        hideURLBar = 'hideURLBar';
      }
      if ((ref2 = params.opt) != null ? ref2.src : void 0) {
        params.src = BrowserPlusView.checkBase(params.opt.src, params.url);
        params.src = params.src.replace(/"/g, "'");
        if (!((ref3 = params.src) != null ? ref3.startsWith("data:text/html,") : void 0)) {
          params.src = "data:text/html," + params.src;
        }
        if (!url) {
          url = params.src;
        }
      }
      if ((ref4 = params.url) != null ? ref4.startsWith("browser-plus://") : void 0) {
        url = (ref5 = params.browserPlus) != null ? typeof ref5.getBrowserPlusUrl === "function" ? ref5.getBrowserPlusUrl(url) : void 0 : void 0;
        spinnerClass += " fa-custom";
      }
      return this.div({
        "class": 'browser-plus'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "url native-key-bindings " + hideURLBar,
            outlet: 'urlbar'
          }, function() {
            _this.div({
              "class": 'nav-btns-left'
            }, function() {
              _this.span({
                id: 'back',
                "class": 'mega-octicon octicon-arrow-left',
                outlet: 'back'
              });
              _this.span({
                id: 'forward',
                "class": 'mega-octicon octicon-arrow-right',
                outlet: 'forward'
              });
              _this.span({
                id: 'refresh',
                "class": 'mega-octicon octicon-sync',
                outlet: 'refresh'
              });
              _this.span({
                id: 'history',
                "class": 'mega-octicon octicon-book',
                outlet: 'history'
              });
              _this.span({
                id: 'fav',
                "class": 'mega-octicon octicon-star',
                outlet: 'fav'
              });
              _this.span({
                id: 'favList',
                "class": 'octicon octicon-arrow-down',
                outlet: 'favList'
              });
              return _this.a({
                "class": spinnerClass,
                outlet: 'spinner'
              });
            });
            _this.div({
              "class": 'nav-btns'
            }, function() {
              _this.div({
                "class": 'nav-btns-right'
              }, function() {
                _this.span({
                  id: 'newTab',
                  "class": 'octicon',
                  outlet: 'newTab'
                }, "\u2795");
                _this.span({
                  id: 'print',
                  "class": 'icon-browser-pluss icon-print',
                  outlet: 'print'
                });
                _this.span({
                  id: 'remember',
                  "class": 'mega-octicon octicon-pin',
                  outlet: 'remember'
                });
                _this.span({
                  id: 'live',
                  "class": 'mega-octicon octicon-zap',
                  outlet: 'live'
                });
                return _this.span({
                  id: 'devtool',
                  "class": 'mega-octicon octicon-tools',
                  outlet: 'devtool'
                });
              });
              return _this.div({
                "class": 'input-url'
              }, function() {
                return _this.input({
                  "class": "native-key-bindings",
                  type: 'text',
                  id: 'url',
                  outlet: 'url',
                  value: "" + params.url
                });
              });
            });
            return _this.input({
              id: 'find',
              "class": 'find find-hide',
              outlet: 'find'
            });
          });
          return _this.tag('webview', {
            "class": "native-key-bindings",
            outlet: 'htmlv',
            preload: "file:///" + params.browserPlus.resources + "/bp-client.js",
            plugins: 'on',
            src: "" + url,
            disablewebsecurity: 'on',
            allowfileaccessfromfiles: 'on',
            allowPointerLock: 'on'
          });
        };
      })(this));
    };

    BrowserPlusView.prototype.toggleURLBar = function() {
      return this.urlbar.toggle();
    };

    BrowserPlusView.prototype.initialize = function() {
      var base1, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, select, src;
      src = (function(_this) {
        return function(req, res) {
          var _, fav, pattern, searchUrl, urls;
          _ = require('lodash');
          pattern = RegExp("" + (RegExp.escape(req.term)), "i");
          fav = _.filter(window.bp.js.get('bp.fav'), function(fav) {
            return fav.url.match(pattern) || fav.title.match(pattern);
          });
          urls = _.pluck(fav, "url");
          res(urls);
          searchUrl = 'http://api.bing.com/osjson.aspx';
          return (function() {
            return jQ.ajax({
              url: searchUrl,
              dataType: 'json',
              data: {
                query: req.term,
                'web.count': 10
              },
              success: (function(_this) {
                return function(data) {
                  var dat, i, len, ref1, search;
                  urls = urls.slice(0, 11);
                  search = "http://www.google.com/search?as_q=";
                  ref1 = data[1].slice(0, 11);
                  for (i = 0, len = ref1.length; i < len; i++) {
                    dat = ref1[i];
                    urls.push({
                      label: dat,
                      value: search + dat
                    });
                  }
                  return res(urls);
                };
              })(this)
            });
          })();
        };
      })(this);
      select = (function(_this) {
        return function(event, ui) {
          return _this.goToUrl(ui.item.value);
        };
      })(this);
      if (typeof (base1 = jQ(this.url)).autocomplete === "function") {
        base1.autocomplete({
          source: src,
          minLength: 2,
          select: select
        });
      }
      this.subscriptions.add(atom.tooltips.add(this.back, {
        title: 'Back'
      }));
      this.subscriptions.add(atom.tooltips.add(this.forward, {
        title: 'Forward'
      }));
      this.subscriptions.add(atom.tooltips.add(this.refresh, {
        title: 'Refresh-f5/ctrl-f5'
      }));
      this.subscriptions.add(atom.tooltips.add(this.print, {
        title: 'Print'
      }));
      this.subscriptions.add(atom.tooltips.add(this.history, {
        title: 'History'
      }));
      this.subscriptions.add(atom.tooltips.add(this.favList, {
        title: 'View Favorites'
      }));
      this.subscriptions.add(atom.tooltips.add(this.fav, {
        title: 'Favoritize'
      }));
      this.subscriptions.add(atom.tooltips.add(this.live, {
        title: 'Live'
      }));
      this.subscriptions.add(atom.tooltips.add(this.remember, {
        title: 'Remember Position'
      }));
      this.subscriptions.add(atom.tooltips.add(this.newTab, {
        title: 'New Tab'
      }));
      this.subscriptions.add(atom.tooltips.add(this.devtool, {
        title: 'Dev Tools-f12'
      }));
      this.subscriptions.add(atom.commands.add('.browser-plus webview', {
        'browser-plus-view:goBack': (function(_this) {
          return function() {
            return _this.goBack();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.browser-plus webview', {
        'browser-plus-view:goForward': (function(_this) {
          return function() {
            return _this.goForward();
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('.browser-plus', {
        'browser-plus-view:toggleURLBar': (function(_this) {
          return function() {
            return _this.toggleURLBar();
          };
        })(this)
      }));
      this.liveOn = false;
      this.element.onkeydown = (function(_this) {
        return function() {
          return _this.keyHandler(arguments);
        };
      })(this);
      if (this.model.url.indexOf('file:///') >= 0) {
        this.checkFav();
      }
      if ((ref1 = this.htmlv[0]) != null) {
        ref1.addEventListener("permissionrequest", function(e) {
          return e.request.allow();
        });
      }
      if ((ref2 = this.htmlv[0]) != null) {
        ref2.addEventListener("console-message", (function(_this) {
          return function(e) {
            var base2, base3, base4, base5, base6, css, csss, data, i, indx, init, inits, j, js, jss, k, l, left, len, len1, len2, len3, menu, menus, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref3, ref4, ref5, ref6, ref7, ref8, ref9, top;
            if (e.message.includes('~browser-plus-position~') && _this.rememberOn) {
              data = e.message.replace('~browser-plus-position~', '');
              indx = data.indexOf(',');
              top = data.substr(0, indx);
              left = data.substr(indx + 1);
              _this.curPos = {
                "top": top,
                "left": left
              };
              _this.href = _this.url.val();
            }
            if (e.message.includes('~browser-plus-jquery~') || e.message.includes('~browser-plus-menu~')) {
              if (e.message.includes('~browser-plus-jquery~')) {
                if ((base2 = _this.model.browserPlus).jQueryJS == null) {
                  base2.jQueryJS = BrowserPlusView.getJQuery.call(_this);
                }
                if ((ref3 = _this.htmlv[0]) != null) {
                  ref3.executeJavaScript(_this.model.browserPlus.jQueryJS);
                }
              }
              if (_this.rememberOn) {
                if (_this.model.hashurl) {
                  _this.model.url = _this.model.hashurl;
                  _this.model.hashurl = void 0;
                  _this.url.val(_this.model.url);
                  if ((ref4 = _this.htmlv[0]) != null) {
                    ref4.executeJavaScript("location.href = '" + _this.model.url + "'");
                  }
                }
                if (_this.rememberOn && _this.model.url === _this.href) {
                  if ((ref5 = _this.htmlv[0]) != null) {
                    ref5.executeJavaScript("jQuery(window).scrollTop(" + _this.curPos.top + ");\njQuery(window).scrollLeft(" + _this.curPos.left + ");");
                  }
                }
              }
              if ((base3 = _this.model.browserPlus).jStorageJS == null) {
                base3.jStorageJS = BrowserPlusView.getJStorage.call(_this);
              }
              if ((ref6 = _this.htmlv[0]) != null) {
                ref6.executeJavaScript(_this.model.browserPlus.jStorageJS);
              }
              if ((base4 = _this.model.browserPlus).watchjs == null) {
                base4.watchjs = BrowserPlusView.getWatchjs.call(_this);
              }
              if ((ref7 = _this.htmlv[0]) != null) {
                ref7.executeJavaScript(_this.model.browserPlus.watchjs);
              }
              if ((base5 = _this.model.browserPlus).hotKeys == null) {
                base5.hotKeys = BrowserPlusView.getHotKeys.call(_this);
              }
              if ((ref8 = _this.htmlv[0]) != null) {
                ref8.executeJavaScript(_this.model.browserPlus.hotKeys);
              }
              if ((base6 = _this.model.browserPlus).notifyBar == null) {
                base6.notifyBar = BrowserPlusView.getNotifyBar.call(_this);
              }
              if ((ref9 = _this.htmlv[0]) != null) {
                ref9.executeJavaScript(_this.model.browserPlus.notifyBar);
              }
              if (inits = (ref10 = _this.model.browserPlus.plugins) != null ? ref10.onInit : void 0) {
                for (i = 0, len = inits.length; i < len; i++) {
                  init = inits[i];
                  if ((ref11 = _this.htmlv[0]) != null) {
                    ref11.executeJavaScript(init);
                  }
                }
              }
              if (jss = (ref12 = _this.model.browserPlus.plugins) != null ? ref12.jss : void 0) {
                for (j = 0, len1 = jss.length; j < len1; j++) {
                  js = jss[j];
                  if ((ref13 = _this.htmlv[0]) != null) {
                    ref13.executeJavaScript(BrowserPlusView.loadJS.call(_this, js, true));
                  }
                }
              }
              if (csss = (ref14 = _this.model.browserPlus.plugins) != null ? ref14.csss : void 0) {
                for (k = 0, len2 = csss.length; k < len2; k++) {
                  css = csss[k];
                  if ((ref15 = _this.htmlv[0]) != null) {
                    ref15.executeJavaScript(BrowserPlusView.loadCSS.call(_this, css, true));
                  }
                }
              }
              if (menus = (ref16 = _this.model.browserPlus.plugins) != null ? ref16.menus : void 0) {
                for (l = 0, len3 = menus.length; l < len3; l++) {
                  menu = menus[l];
                  if (menu.fn) {
                    menu.fn = menu.fn.toString();
                  }
                  if (menu.selectorFilter) {
                    menu.selectorFilter = menu.selectorFilter.toString();
                  }
                  if ((ref17 = _this.htmlv[0]) != null) {
                    ref17.executeJavaScript("browserPlus.menu(" + (JSON.stringify(menu)) + ")");
                  }
                }
              }
              if ((ref18 = _this.htmlv[0]) != null) {
                ref18.executeJavaScript(BrowserPlusView.loadCSS.call(_this, 'bp-style.css'));
              }
              return (ref19 = _this.htmlv[0]) != null ? ref19.executeJavaScript(BrowserPlusView.loadCSS.call(_this, 'jquery.notifyBar.css')) : void 0;
            }
          };
        })(this));
      }
      if ((ref3 = this.htmlv[0]) != null) {
        ref3.addEventListener("page-favicon-updated", (function(_this) {
          return function(e) {
            var _, fav, favIcon, favr, style, uri;
            _ = require('lodash');
            favr = window.bp.js.get('bp.fav');
            if (fav = _.find(favr, {
              'url': _this.model.url
            })) {
              fav.favIcon = e.favicons[0];
              window.bp.js.set('bp.fav', favr);
            }
            _this.model.iconName = Math.floor(Math.random() * 10000).toString();
            _this.model.favIcon = e.favicons[0];
            _this.model.updateIcon(e.favicons[0]);
            favIcon = window.bp.js.get('bp.favIcon');
            uri = _this.htmlv[0].getURL();
            if (!uri) {
              return;
            }
            favIcon[uri] = e.favicons[0];
            window.bp.js.set('bp.favIcon', favIcon);
            _this.model.updateIcon();
            style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = ".title.icon.icon-" + _this.model.iconName + " {\n  background-size: 16px 16px;\n  background-repeat: no-repeat;\n  padding-left: 20px;\n  background-image: url('" + e.favicons[0] + "');\n  background-position-y: 50%;\n}";
            return document.getElementsByTagName('head')[0].appendChild(style);
          };
        })(this));
      }
      if ((ref4 = this.htmlv[0]) != null) {
        ref4.addEventListener("did-navigate-in-page", (function(_this) {
          return function(evt) {
            return _this.updatePageUrl(evt);
          };
        })(this));
      }
      if ((ref5 = this.htmlv[0]) != null) {
        ref5.addEventListener("did-navigate", (function(_this) {
          return function(evt) {
            return _this.updatePageUrl(evt);
          };
        })(this));
      }
      if ((ref6 = this.htmlv[0]) != null) {
        ref6.addEventListener("page-title-set", (function(_this) {
          return function(e) {
            var _, fav, favr, title, uri;
            _ = require('lodash');
            favr = window.bp.js.get('bp.fav');
            title = window.bp.js.get('bp.title');
            uri = _this.htmlv[0].getURL();
            if (!uri) {
              return;
            }
            title[uri] = e.title;
            window.bp.js.set('bp.title', title);
            if (fav = _.find(favr, {
              'url': _this.model.url
            })) {
              fav.title = e.title;
              window.bp.js.set('bp.fav', favr);
            }
            return _this.model.setTitle(e.title);
          };
        })(this));
      }
      this.devtool.on('click', (function(_this) {
        return function(evt) {
          return _this.toggleDevTool();
        };
      })(this));
      this.spinner.on('click', (function(_this) {
        return function(evt) {
          var ref7;
          return (ref7 = _this.htmlv[0]) != null ? ref7.stop() : void 0;
        };
      })(this));
      this.remember.on('click', (function(_this) {
        return function(evt) {
          _this.rememberOn = !_this.rememberOn;
          return _this.remember.toggleClass('active', _this.rememberOn);
        };
      })(this));
      this.print.on('click', (function(_this) {
        return function(evt) {
          var ref7;
          return (ref7 = _this.htmlv[0]) != null ? ref7.print() : void 0;
        };
      })(this));
      this.newTab.on('click', (function(_this) {
        return function(evt) {
          atom.workspace.open("browser-plus://blank");
          return _this.spinner.removeClass('fa-custom');
        };
      })(this));
      this.history.on('click', (function(_this) {
        return function(evt) {
          return atom.workspace.open("browser-plus://history", {
            split: 'left',
            searchAllPanes: true
          });
        };
      })(this));
      this.live.on('click', (function(_this) {
        return function(evt) {
          _this.liveOn = !_this.liveOn;
          _this.live.toggleClass('active', _this.liveOn);
          if (_this.liveOn) {
            _this.refreshPage();
            _this.liveSubscription = new CompositeDisposable;
            _this.liveSubscription.add(atom.workspace.observeTextEditors(function(editor) {
              return _this.liveSubscription.add(editor.onDidSave(function() {
                var timeout;
                timeout = atom.config.get('browser-plus.live');
                return setTimeout(function() {
                  return _this.refreshPage();
                }, timeout);
              }));
            }));
            return _this.model.onDidDestroy(function() {
              return _this.liveSubscription.dispose();
            });
          } else {
            return _this.liveSubscription.dispose();
          }
        };
      })(this));
      this.fav.on('click', (function(_this) {
        return function(evt) {
          var data, delCount, favs;
          favs = window.bp.js.get('bp.fav');
          if (_this.fav.hasClass('active')) {
            _this.removeFav(_this.model);
          } else {
            if (_this.model.orgURI) {
              return;
            }
            data = {
              url: _this.model.url,
              title: _this.model.title || _this.model.url,
              favIcon: _this.model.favIcon
            };
            favs.push(data);
            delCount = favs.length - atom.config.get('browser-plus.fav');
            if (delCount > 0) {
              favs.splice(0, delCount);
            }
            window.bp.js.set('bp.fav', favs);
          }
          return _this.fav.toggleClass('active');
        };
      })(this));
      if ((ref7 = this.htmlv[0]) != null) {
        ref7.addEventListener('new-window', function(e) {
          return atom.workspace.open(e.url, {
            split: 'left',
            searchAllPanes: true,
            openInSameWindow: false
          });
        });
      }
      if ((ref8 = this.htmlv[0]) != null) {
        ref8.addEventListener("did-start-loading", (function(_this) {
          return function() {
            var ref9;
            _this.spinner.removeClass('fa-custom');
            return (ref9 = _this.htmlv[0]) != null ? ref9.shadowRoot.firstChild.style.height = '95%' : void 0;
          };
        })(this));
      }
      if ((ref9 = this.htmlv[0]) != null) {
        ref9.addEventListener("did-stop-loading", (function(_this) {
          return function() {
            return _this.spinner.addClass('fa-custom');
          };
        })(this));
      }
      this.back.on('click', (function(_this) {
        return function(evt) {
          var ref10, ref11;
          if (((ref10 = _this.htmlv[0]) != null ? ref10.canGoBack() : void 0) && $( this).hasClass('active')) {
            return (ref11 = _this.htmlv[0]) != null ? ref11.goBack() : void 0;
          }
        };
      })(this));
      this.favList.on('click', (function(_this) {
        return function(evt) {
          var favList;
          favList = require('./fav-view');
          return new favList(window.bp.js.get('bp.fav'));
        };
      })(this));
      this.forward.on('click', (function(_this) {
        return function(evt) {
          var ref10, ref11;
          if (((ref10 = _this.htmlv[0]) != null ? ref10.canGoForward() : void 0) && $( this).hasClass('active')) {
            return (ref11 = _this.htmlv[0]) != null ? ref11.goForward() : void 0;
          }
        };
      })(this));
      this.url.on('click', (function(_this) {
        return function(evt) {
          return _this.url.select();
        };
      })(this));
      this.url.on('keypress', (function(_this) {
        return function(evt) {
          var URL, localhostPattern, ref10, url, urls;
          URL = require('url');
          if (evt.which === 13) {
            _this.url.blur();
            urls = URL.parse( this.value);
            url =  this.value;
            if (!url.startsWith('browser-plus://')) {
              if (url.indexOf(' ') >= 0) {
                url = "http://www.google.com/search?as_q=" + url;
              } else {
                localhostPattern = /^(http:\/\/)?localhost/i;
                if (url.search(localhostPattern) < 0 && url.indexOf('.') < 0) {
                  url = "http://www.google.com/search?as_q=" + url;
                } else {
                  if ((ref10 = urls.protocol) === 'http' || ref10 === 'https' || ref10 === 'file:') {
                    if (urls.protocol === 'file:') {
                      url = url.replace(/\\/g, "/");
                    } else {
                      url = URL.format(urls);
                    }
                  } else {
                    urls.protocol = 'http';
                    url = URL.format(urls);
                  }
                }
              }
            }
            return _this.goToUrl(url);
          }
        };
      })(this));
      return this.refresh.on('click', (function(_this) {
        return function(evt) {
          return _this.refreshPage();
        };
      })(this));
    };

    BrowserPlusView.prototype.updatePageUrl = function(evt) {
      var BrowserPlusModel, ref1, ref2, ref3, ref4, title, url;
      BrowserPlusModel = require('./browser-plus-model');
      url = evt.url;
      if (!BrowserPlusModel.checkUrl(url)) {
        url = atom.config.get('browser-plus.homepage') || "http://www.google.com";
        atom.notifications.addSuccess("Redirecting to " + url);
        if ((ref1 = this.htmlv[0]) != null) {
          ref1.executeJavaScript("location.href = '" + url + "'");
        }
        return;
      }
      if (url && url !== this.model.url && !((ref2 = this.url.val()) != null ? ref2.startsWith('browser-plus://') : void 0)) {
        this.url.val(url);
        this.model.url = url;
      }
      title = (ref3 = this.htmlv[0]) != null ? ref3.getTitle() : void 0;
      if (title) {
        if (title !== this.model.getTitle()) {
          this.model.setTitle(title);
        }
      } else {
        this.model.setTitle(url);
      }
      this.live.toggleClass('active', this.liveOn);
      if (!this.liveOn) {
        if ((ref4 = this.liveSubscription) != null) {
          ref4.dispose();
        }
      }
      this.checkNav();
      this.checkFav();
      return this.addHistory();
    };

    BrowserPlusView.prototype.refreshPage = function(url, ignorecache) {
      var pp, ref1, ref2, ref3, ref4, ref5;
      if (this.rememberOn) {
        if ((ref1 = this.htmlv[0]) != null) {
          ref1.executeJavaScript("var left, top;\ncurTop = jQuery(window).scrollTop();\ncurLeft = jQuery(window).scrollLeft();\nconsole.log(`~browser-plus-position~${curTop},${curLeft}`);");
        }
      }
      if (this.model.orgURI && (pp = atom.packages.getActivePackage('pp'))) {
        return pp.mainModule.compilePath(this.model.orgURI, this.model._id);
      } else {
        if (url) {
          this.model.url = url;
          this.url.val(url);
          return (ref2 = this.htmlv[0]) != null ? ref2.src = url : void 0;
        } else {
          if (this.ultraLiveOn && this.model.src) {
            if ((ref3 = this.htmlv[0]) != null) {
              ref3.src = this.model.src;
            }
          }
          if (ignorecache) {
            return (ref4 = this.htmlv[0]) != null ? ref4.reloadIgnoringCache() : void 0;
          } else {
            return (ref5 = this.htmlv[0]) != null ? ref5.reload() : void 0;
          }
        }
      }
    };

    BrowserPlusView.prototype.goToUrl = function(url) {
      var BrowserPlusModel, base1, base2, ref1;
      BrowserPlusModel = require('./browser-plus-model');
      if (!BrowserPlusModel.checkUrl(url)) {
        return;
      }
      if (typeof (base1 = jQ(this.url)).autocomplete === "function") {
        base1.autocomplete("close");
      }
      this.liveOn = false;
      this.live.toggleClass('active', this.liveOn);
      if (!this.liveOn) {
        if ((ref1 = this.liveSubscription) != null) {
          ref1.dispose();
        }
      }
      this.url.val(url);
      this.model.url = url;
      delete this.model.title;
      delete this.model.iconName;
      delete this.model.favIcon;
      this.model.setTitle(null);
      this.model.updateIcon(null);
      if (url.startsWith('browser-plus://')) {
        url = typeof (base2 = this.model.browserPlus).getBrowserPlusUrl === "function" ? base2.getBrowserPlusUrl(url) : void 0;
      }
      return this.htmlv.attr('src', url);
    };

    BrowserPlusView.prototype.keyHandler = function(evt) {
      switch (evt[0].keyIdentifier) {
        case "F12":
          return this.toggleDevTool();
        case "F5":
          if (evt[0].ctrlKey) {
            return this.refreshPage(void 0, true);
          } else {
            return this.refreshPage();
          }
          break;
        case "F10":
          return this.toggleURLBar();
        case "Left":
          if (evt[0].altKey) {
            return this.goBack();
          }
          break;
        case "Right":
          if (evt[0].altKey) {
            return this.goForward();
          }
      }
    };

    BrowserPlusView.prototype.removeFav = function(favorite) {
      var favr, favrs, i, idx, len;
      favrs = window.bp.js.get('bp.fav');
      for (idx = i = 0, len = favrs.length; i < len; idx = ++i) {
        favr = favrs[idx];
        if (favr.url === favorite.url) {
          favrs.splice(idx, 1);
          window.bp.js.set('bp.fav', favrs);
          return;
        }
      }
    };

    BrowserPlusView.prototype.setSrc = function(text) {
      var ref1, url;
      url = this.model.orgURI || this.model.url;
      text = BrowserPlusView.checkBase(text, url);
      this.model.src = "data:text/html," + text;
      return (ref1 = this.htmlv[0]) != null ? ref1.src = this.model.src : void 0;
    };

    BrowserPlusView.checkBase = function(text, url) {
      var $html, base, basePath, cheerio;
      cheerio = require('cheerio');
      $html = cheerio.load(text);
      basePath = path.dirname(url) + "/";
      if ($html('base').length) {
        return text;
      } else {
        if ($html('head').length) {
          base = "<base href='" + basePath + "' target='_blank'>";
          $html('head').prepend(base);
        } else {
          base = "<head><base href='" + basePath + "' target='_blank'></head>";
          $html('html').prepend(base);
        }
        return $html.html();
      }
    };

    BrowserPlusView.prototype.checkFav = function() {
      var favr, favrs, i, len, results;
      this.fav.removeClass('active');
      favrs = window.bp.js.get('bp.fav');
      results = [];
      for (i = 0, len = favrs.length; i < len; i++) {
        favr = favrs[i];
        if (favr.url === this.model.url) {
          results.push(this.fav.addClass('active'));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    BrowserPlusView.prototype.toggleDevTool = function() {
      var open, ref1, ref2, ref3;
      open = (ref1 = this.htmlv[0]) != null ? ref1.isDevToolsOpened() : void 0;
      if (open) {
        if ((ref2 = this.htmlv[0]) != null) {
          ref2.closeDevTools();
        }
      } else {
        if ((ref3 = this.htmlv[0]) != null) {
          ref3.openDevTools();
        }
      }
      return $(this.devtool).toggleClass('active', !open);
    };

    BrowserPlusView.prototype.checkNav = function() {
      var ref1, ref2, ref3;
      $(this.forward).toggleClass('active', (ref1 = this.htmlv[0]) != null ? ref1.canGoForward() : void 0);
      $(this.back).toggleClass('active', (ref2 = this.htmlv[0]) != null ? ref2.canGoBack() : void 0);
      if ((ref3 = this.htmlv[0]) != null ? ref3.canGoForward() : void 0) {
        if (this.clearForward) {
          $(this.forward).toggleClass('active', false);
          return this.clearForward = false;
        } else {
          return $(this.forward).toggleClass('active', true);
        }
      }
    };

    BrowserPlusView.prototype.goBack = function() {
      return this.back.click();
    };

    BrowserPlusView.prototype.goForward = function() {
      return this.forward.click();
    };

    BrowserPlusView.prototype.addHistory = function() {
      var histToday, history, historyURL, obj, today, todayObj, url, yyyymmdd;
      url = this.htmlv[0].getURL().replace(/\\/g, "/");
      if (!url) {
        return;
      }
      historyURL = ("file:///" + this.model.browserPlus.resources + "history.html").replace(/\\/g, "/");
      if (url.startsWith('browser-plus://') || url.startsWith('data:text/html,') || url.startsWith(historyURL)) {
        return;
      }
      yyyymmdd = function() {
        var date, dd, mm, yyyy;
        date = new Date();
        yyyy = date.getFullYear().toString();
        mm = (date.getMonth() + 1).toString();
        dd = date.getDate().toString();
        return yyyy + (mm[1] ? mm : '0' + mm[0]) + (dd[1] ? dd : '0' + dd[0]);
      };
      today = yyyymmdd();
      history = window.bp.js.get('bp.history') || [];
      todayObj = history.find(function(ele, idx, arr) {
        if (ele[today]) {
          return true;
        }
      });
      if (!todayObj) {
        obj = {};
        histToday = [];
        obj[today] = histToday;
        history.unshift(obj);
      } else {
        histToday = todayObj[today];
      }
      histToday.unshift({
        date: new Date().toString(),
        uri: url
      });
      return window.bp.js.set('bp.history', history);
    };

    BrowserPlusView.prototype.getTitle = function() {
      return this.model.getTitle();
    };

    BrowserPlusView.prototype.serialize = function() {};

    BrowserPlusView.prototype.destroy = function() {
      var base1;
      if (typeof (base1 = jQ(this.url)).autocomplete === "function") {
        base1.autocomplete('destroy');
      }
      return this.subscriptions.dispose();
    };

    BrowserPlusView.getJQuery = function() {
      return fs.readFileSync(this.model.browserPlus.resources + "/jquery-2.1.4.min.js", 'utf-8');
    };

    BrowserPlusView.getEval = function() {
      return fs.readFileSync(this.model.browserPlus.resources + "/eval.js", 'utf-8');
    };

    BrowserPlusView.getJStorage = function() {
      return fs.readFileSync(this.model.browserPlus.resources + "/jstorage.min.js", 'utf-8');
    };

    BrowserPlusView.getWatchjs = function() {
      return fs.readFileSync(this.model.browserPlus.resources + "/watch.js", 'utf-8');
    };

    BrowserPlusView.getNotifyBar = function() {
      return fs.readFileSync(this.model.browserPlus.resources + "/jquery.notifyBar.js", 'utf-8');
    };

    BrowserPlusView.getHotKeys = function() {
      return fs.readFileSync(this.model.browserPlus.resources + "/jquery.hotkeys.min.js", 'utf-8');
    };

    BrowserPlusView.loadCSS = function(filename, fullpath) {
      var fpath;
      if (fullpath == null) {
        fullpath = false;
      }
      if (!fullpath) {
        fpath = "file:///" + (this.model.browserPlus.resources.replace(/\\/g, '/'));
        filename = "" + fpath + filename;
      }
      return "jQuery('head').append(jQuery('<link type=\"text/css\" rel=\"stylesheet\" href=\"" + filename + "\">'))";
    };

    BrowserPlusView.loadJS = function(filename, fullpath) {
      var fpath;
      if (fullpath == null) {
        fullpath = false;
      }
      if (!fullpath) {
        fpath = "file:///" + (this.model.browserPlus.resources.replace(/\\/g, '/'));
        filename = "" + fpath + filename;
      }
      return "jQuery('head').append(jQuery('<script type=\"text/javascript\" src=\"" + filename + "\">'))";
    };

    return BrowserPlusView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvYnJvd3Nlci1wbHVzL2xpYi9icm93c2VyLXBsdXMtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGdFQUFBO0lBQUE7OztFQUFDLHNCQUF3QixPQUFBLENBQVEsTUFBUjs7RUFDekIsTUFBVyxPQUFBLENBQVEsc0JBQVIsQ0FBWCxFQUFDLGVBQUQsRUFBTTs7RUFDTixDQUFBLEdBQUksRUFBQSxHQUFLLE9BQUEsQ0FBUSxRQUFSOztFQUNULE9BQUEsQ0FBUSx3QkFBUjs7RUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsT0FBQSxDQUFRLE9BQVI7O0VBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLE9BQUEsQ0FBUSxVQUFSOztFQUNBLE1BQU0sQ0FBQyxFQUFQLEdBQVk7O0VBQ1osTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFWLEdBQWdCLENBQUMsQ0FBQyxNQUFGLENBQVMsRUFBVCxFQUFZLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBckI7O0VBRWhCLE1BQU0sQ0FBQyxNQUFQLEdBQWUsU0FBQyxDQUFEO1dBQ2IsQ0FBQyxDQUFDLE9BQUYsQ0FBVSx3QkFBVixFQUFvQyxNQUFwQztFQURhOztFQUdmLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUNTLHlCQUFDLEtBQUQ7TUFBQyxJQUFDLENBQUEsUUFBRDtNQUNaLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLEdBQWM7TUFDZCxJQUFDLENBQUEsS0FBSyxDQUFDLFlBQVAsQ0FBb0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ2xCLGNBQUE7VUFBQSxLQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTttRkFDUSxDQUFDLGFBQWM7UUFGTDtNQUFBLENBQUEsQ0FBQSxDQUFBLElB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QUdBLGtGQUFBLEdBQzZFLFFBRDdFLEdBQ3NGO0lBTDlFOztJQVFWLGVBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQyxRQUFELEVBQVUsUUFBVjtBQUNQLFVBQUE7O1FBRGlCLFdBQVM7O01BQzFCLElBQUEsQ0FBTyxRQUFQO1FBQ0UsS0FBQSxHQUFRLFVBQUEsR0FBVSxDQUFDLElBQUMsQ0FBQSxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUE3QixDQUFxQyxLQUFyQyxFQUEyQyxHQUEzQyxDQUFEO1FBQ2xCLFFBQUEsR0FBVyxFQUFBLEdBQUcsS0FBSCxHQUFXLFNBRnhCOzthQUlBLHVFQUFBLEdBQ29FLFFBRHBFLEdBQzZFO0lBTnRFOzs7O0tBNWlCbUI7QUFoQjlCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ICA9IHJlcXVpcmUgJ2F0b20nXG57VmlldywkfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuJCA9IGpRID0gcmVxdWlyZSAnanF1ZXJ5J1xucmVxdWlyZSAnanF1ZXJ5LXVpL2F1dG9jb21wbGV0ZSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xucmVxdWlyZSAnSlNPTjInXG5cbmZzID0gcmVxdWlyZSAnZnMnXG5yZXF1aXJlICdqc3RvcmFnZSdcbndpbmRvdy5icCA9IHt9XG53aW5kb3cuYnAuanMgID0gJC5leHRlbmQoe30sd2luZG93LiQualN0b3JhZ2UpXG5cblJlZ0V4cC5lc2NhcGU9IChzKS0+XG4gIHMucmVwbGFjZSAvWy1cXC9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCAnXFxcXCQmJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBCcm93c2VyUGx1c1ZpZXcgZXh0ZW5kcyBWaWV3XG4gIGNvbnN0cnVjdG9yOiAoQG1vZGVsKS0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBtb2RlbC52aWV3ID0gQFxuICAgIEBtb2RlbC5vbkRpZERlc3Ryb3kgPT5cbiAgICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgalEoQHVybCkuYXV0b2NvbXBsZXRlPygnZGVzdHJveScpXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLm9uRGlkQWRkTm90aWZpY2F0aW9uIChub3RpZmljYXRpb24pIC0+XG4gICAgICBpZiBub3RpZmljYXRpb24udHlwZSA9PSAnaW5mbydcbiAgICAgICAgc2V0VGltZW91dCAoKSAtPlxuICAgICAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzKClcbiAgICAgICAgLCAxMDAwXG4gICAgc3VwZXJcblxuICBAY29udGVudDogKHBhcmFtcyktPlxuICAgIHVybCAgPSBwYXJhbXMudXJsXG4gICAgc3Bpbm5lckNsYXNzID0gXCJmYSBmYS1zcGlubmVyXCJcbiAgICBoaWRlVVJMQmFyID0gJydcbiAgICBpZiBwYXJhbXMub3B0Py5oaWRlVVJMQmFyXG4gICAgICBoaWRlVVJMQmFyID0gJ2hpZGVVUkxCYXInXG4gICAgaWYgcGFyYW1zLm9wdD8uc3JjXG4gICAgICBwYXJhbXMuc3JjID0gQnJvd3NlclBsdXNWaWV3LmNoZWNrQmFzZShwYXJhbXMub3B0LnNyYyxwYXJhbXMudXJsKVxuICAgICAgcGFyYW1zLnNyYyA9IHBhcmFtcy5zcmMucmVwbGFjZSgvXCIvZyxcIidcIilcbiAgICAgIHVubGVzcyBwYXJhbXMuc3JjPy5zdGFydHNXaXRoIFwiZGF0YTp0ZXh0L2h0bWwsXCJcbiAgICAgICAgcGFyYW1zLnNyYyA9IFwiZGF0YTp0ZXh0L2h0bWwsI3twYXJhbXMuc3JjfVwiXG4gICAgICB1cmwgPSBwYXJhbXMuc3JjIHVubGVzcyB1cmxcbiAgICBpZiBwYXJhbXMudXJsPy5zdGFydHNXaXRoIFwiYnJvd3Nlci1wbHVzOi8vXCJcbiAgICAgIHVybCA9IHBhcmFtcy5icm93c2VyUGx1cz8uZ2V0QnJvd3NlclBsdXNVcmw/KHVybClcbiAgICAgIHNwaW5uZXJDbGFzcyArPSBcIiBmYS1jdXN0b21cIlxuXG4gICAgQGRpdiBjbGFzczonYnJvd3Nlci1wbHVzJywgPT5cbiAgICAgIEBkaXYgY2xhc3M6XCJ1cmwgbmF0aXZlLWtleS1iaW5kaW5ncyAje2hpZGVVUkxCYXJ9XCIsb3V0bGV0Oid1cmxiYXInLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnbmF2LWJ0bnMtbGVmdCcsID0+XG4gICAgICAgICAgQHNwYW4gaWQ6J2JhY2snLGNsYXNzOidtZWdhLW9jdGljb24gb2N0aWNvbi1hcnJvdy1sZWZ0JyxvdXRsZXQ6ICdiYWNrJ1xuICAgICAgICAgIEBzcGFuIGlkOidmb3J3YXJkJyxjbGFzczonbWVnYS1vY3RpY29uIG9jdGljb24tYXJyb3ctcmlnaHQnLG91dGxldDogJ2ZvcndhcmQnXG4gICAgICAgICAgQHNwYW4gaWQ6J3JlZnJlc2gnLGNsYXNzOidtZWdhLW9jdGljb24gb2N0aWNvbi1zeW5jJyxvdXRsZXQ6ICdyZWZyZXNoJ1xuICAgICAgICAgIEBzcGFuIGlkOidoaXN0b3J5JyxjbGFzczonbWVnYS1vY3RpY29uIG9jdGljb24tYm9vaycsb3V0bGV0OiAnaGlzdG9yeSdcbiAgICAgICAgICBAc3BhbiBpZDonZmF2JyxjbGFzczonbWVnYS1vY3RpY29uIG9jdGljb24tc3Rhcicsb3V0bGV0OiAnZmF2J1xuICAgICAgICAgIEBzcGFuIGlkOidmYXZMaXN0JywgY2xhc3M6J29jdGljb24gb2N0aWNvbi1hcnJvdy1kb3duJyxvdXRsZXQ6ICdmYXZMaXN0J1xuICAgICAgICAgIEBhIGNsYXNzOnNwaW5uZXJDbGFzcywgb3V0bGV0OiAnc3Bpbm5lcidcblxuICAgICAgICBAZGl2IGNsYXNzOiduYXYtYnRucycsID0+XG4gICAgICAgICAgQGRpdiBjbGFzczogJ25hdi1idG5zLXJpZ2h0JywgPT5cbiAgICAgICAgICAgICMgQHNwYW4gaWQ6J3BkZicsY2xhc3M6J21lZ2Etb2N0aWNvbiBvY3RpY29uLWZpbGUtcGRmJyxvdXRsZXQ6ICdwZGYnXG4gICAgICAgICAgICBAc3BhbiBpZDonbmV3VGFiJywgY2xhc3M6J29jdGljb24nLG91dGxldDogJ25ld1RhYicsIFwiXFx1Mjc5NVwiXG4gICAgICAgICAgICBAc3BhbiBpZDoncHJpbnQnLGNsYXNzOidpY29uLWJyb3dzZXItcGx1c3MgaWNvbi1wcmludCcsb3V0bGV0OiAncHJpbnQnXG4gICAgICAgICAgICBAc3BhbiBpZDoncmVtZW1iZXInLGNsYXNzOidtZWdhLW9jdGljb24gb2N0aWNvbi1waW4nLG91dGxldDoncmVtZW1iZXInXG4gICAgICAgICAgICBAc3BhbiBpZDonbGl2ZScsY2xhc3M6J21lZ2Etb2N0aWNvbiBvY3RpY29uLXphcCcsb3V0bGV0OidsaXZlJ1xuICAgICAgICAgICAgQHNwYW4gaWQ6J2RldnRvb2wnLGNsYXNzOidtZWdhLW9jdGljb24gb2N0aWNvbi10b29scycsb3V0bGV0OidkZXZ0b29sJ1xuXG4gICAgICAgICAgQGRpdiBjbGFzczonaW5wdXQtdXJsJywgPT5cbiAgICAgICAgICAgIEBpbnB1dCBjbGFzczpcIm5hdGl2ZS1rZXktYmluZGluZ3NcIiwgdHlwZTondGV4dCcsaWQ6J3VybCcsb3V0bGV0Oid1cmwnLHZhbHVlOlwiI3twYXJhbXMudXJsfVwiICMje0B1cmx9XCJcbiAgICAgICAgQGlucHV0IGlkOidmaW5kJyxjbGFzczonZmluZCBmaW5kLWhpZGUnLG91dGxldDonZmluZCdcbiAgICAgIEB0YWcgJ3dlYnZpZXcnLGNsYXNzOlwibmF0aXZlLWtleS1iaW5kaW5nc1wiLG91dGxldDogJ2h0bWx2JyAscHJlbG9hZDpcImZpbGU6Ly8vI3twYXJhbXMuYnJvd3NlclBsdXMucmVzb3VyY2VzfS9icC1jbGllbnQuanNcIixcbiAgICAgIHBsdWdpbnM6J29uJyxzcmM6XCIje3VybH1cIiwgZGlzYWJsZXdlYnNlY3VyaXR5OidvbicsIGFsbG93ZmlsZWFjY2Vzc2Zyb21maWxlczonb24nLCBhbGxvd1BvaW50ZXJMb2NrOidvbidcblxuICB0b2dnbGVVUkxCYXI6IC0+XG4gICAgQHVybGJhci50b2dnbGUoKVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgICBzcmMgPSAocmVxLHJlcyk9PlxuICAgICAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgICAgICAjIGNoZWNrIGZhdm9yaXRlc1xuICAgICAgICBwYXR0ZXJuID0gLy8vXG4gICAgICAgICAgICAgICAgICAgICN7UmVnRXhwLmVzY2FwZSByZXEudGVybX1cbiAgICAgICAgICAgICAgICAgIC8vL2lcbiAgICAgICAgZmF2ID0gXy5maWx0ZXIgd2luZG93LmJwLmpzLmdldCgnYnAuZmF2JyksKGZhdiktPlxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYXYudXJsLm1hdGNoKHBhdHRlcm4pIG9yIGZhdi50aXRsZS5tYXRjaChwYXR0ZXJuKVxuICAgICAgICB1cmxzID0gXy5wbHVjayhmYXYsXCJ1cmxcIilcblxuICAgICAgICByZXModXJscylcbiAgICAgICAgc2VhcmNoVXJsID0gJ2h0dHA6Ly9hcGkuYmluZy5jb20vb3Nqc29uLmFzcHgnXG4gICAgICAgIGRvIC0+XG4gICAgICAgICAgalEuYWpheFxuICAgICAgICAgICAgICB1cmw6IHNlYXJjaFVybFxuICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICAgIGRhdGE6IHtxdWVyeTpyZXEudGVybSwgJ3dlYi5jb3VudCc6IDEwfVxuICAgICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSk9PlxuICAgICAgICAgICAgICAgIHVybHMgPSB1cmxzWzAuLjEwXVxuICAgICAgICAgICAgICAgIHNlYXJjaCA9IFwiaHR0cDovL3d3dy5nb29nbGUuY29tL3NlYXJjaD9hc19xPVwiXG4gICAgICAgICAgICAgICAgZm9yIGRhdCBpbiBkYXRhWzFdWzAuLjEwXVxuICAgICAgICAgICAgICAgICAgdXJscy5wdXNoXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogZGF0XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc2VhcmNoK2RhdFxuICAgICAgICAgICAgICAgIHJlcyh1cmxzKVxuXG4gICAgICBzZWxlY3QgPSAoZXZlbnQsdWkpPT5cbiAgICAgICAgQGdvVG9VcmwodWkuaXRlbS52YWx1ZSlcblxuICAgICAgalEoQHVybCkuYXV0b2NvbXBsZXRlPyhcbiAgICAgICAgICBzb3VyY2U6IHNyY1xuICAgICAgICAgIG1pbkxlbmd0aDogMlxuICAgICAgICAgIHNlbGVjdDogc2VsZWN0KVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBiYWNrLCB0aXRsZTogJ0JhY2snXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGZvcndhcmQsIHRpdGxlOiAnRm9yd2FyZCdcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAcmVmcmVzaCwgdGl0bGU6ICdSZWZyZXNoLWY1L2N0cmwtZjUnXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQHByaW50LCB0aXRsZTogJ1ByaW50J1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBoaXN0b3J5LCB0aXRsZTogJ0hpc3RvcnknXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGZhdkxpc3QsIHRpdGxlOiAnVmlldyBGYXZvcml0ZXMnXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGZhdiwgdGl0bGU6ICdGYXZvcml0aXplJ1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBsaXZlLCB0aXRsZTogJ0xpdmUnXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQHJlbWVtYmVyLCB0aXRsZTogJ1JlbWVtYmVyIFBvc2l0aW9uJ1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20udG9vbHRpcHMuYWRkIEBuZXdUYWIsIHRpdGxlOiAnTmV3IFRhYidcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLnRvb2x0aXBzLmFkZCBAZGV2dG9vbCwgdGl0bGU6ICdEZXYgVG9vbHMtZjEyJ1xuXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJy5icm93c2VyLXBsdXMgd2VidmlldycsICdicm93c2VyLXBsdXMtdmlldzpnb0JhY2snOiA9PiBAZ29CYWNrKClcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnLmJyb3dzZXItcGx1cyB3ZWJ2aWV3JywgJ2Jyb3dzZXItcGx1cy12aWV3OmdvRm9yd2FyZCc6ID0+IEBnb0ZvcndhcmQoKVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICcuYnJvd3Nlci1wbHVzJywgJ2Jyb3dzZXItcGx1cy12aWV3OnRvZ2dsZVVSTEJhcic6ID0+IEB0b2dnbGVVUkxCYXIoKVxuXG4gICAgICBAbGl2ZU9uID0gZmFsc2VcbiAgICAgIEBlbGVtZW50Lm9ua2V5ZG93biA9ID0+QGtleUhhbmRsZXIoYXJndW1lbnRzKVxuICAgICAgQGNoZWNrRmF2KCkgaWYgQG1vZGVsLnVybC5pbmRleE9mKCdmaWxlOi8vLycpID49IDBcbiAgICAgICMgQXJyYXkub2JzZXJ2ZSBAbW9kZWwuYnJvd3NlclBsdXMuZmF2LCAoZWxlKT0+XG4gICAgICAjICAgQGNoZWNrRmF2KClcblxuICAgICAgQGh0bWx2WzBdPy5hZGRFdmVudExpc3RlbmVyIFwicGVybWlzc2lvbnJlcXVlc3RcIiwgKGUpLT5cbiAgICAgICAgZS5yZXF1ZXN0LmFsbG93KClcblxuICAgICAgQGh0bWx2WzBdPy5hZGRFdmVudExpc3RlbmVyIFwiY29uc29sZS1tZXNzYWdlXCIsIChlKT0+XG4gICAgICAgIGlmIGUubWVzc2FnZS5pbmNsdWRlcygnfmJyb3dzZXItcGx1cy1wb3NpdGlvbn4nKSBhbmQgQHJlbWVtYmVyT25cbiAgICAgICAgICBkYXRhID0gZS5tZXNzYWdlLnJlcGxhY2UoJ35icm93c2VyLXBsdXMtcG9zaXRpb25+JywnJylcbiAgICAgICAgICBpbmR4ID0gZGF0YS5pbmRleE9mKCcsJylcbiAgICAgICAgICB0b3AgPSBkYXRhLnN1YnN0cigwLGluZHgpXG4gICAgICAgICAgbGVmdCA9IGRhdGEuc3Vic3RyKGluZHggKyAxKVxuICAgICAgICAgIEBjdXJQb3MgPSB7XCJ0b3BcIjp0b3AsXCJsZWZ0XCI6bGVmdH1cbiAgICAgICAgICBAaHJlZiA9IEB1cmwudmFsKClcblxuICAgICAgICBpZiBlLm1lc3NhZ2UuaW5jbHVkZXMoJ35icm93c2VyLXBsdXMtanF1ZXJ5ficpIG9yIGUubWVzc2FnZS5pbmNsdWRlcygnfmJyb3dzZXItcGx1cy1tZW51ficpXG4gICAgICAgICAgaWYgZS5tZXNzYWdlLmluY2x1ZGVzKCd+YnJvd3Nlci1wbHVzLWpxdWVyeX4nKVxuICAgICAgICAgICAgQG1vZGVsLmJyb3dzZXJQbHVzLmpRdWVyeUpTID89IEJyb3dzZXJQbHVzVmlldy5nZXRKUXVlcnkuY2FsbCBAXG4gICAgICAgICAgICBAaHRtbHZbMF0/LmV4ZWN1dGVKYXZhU2NyaXB0IEBtb2RlbC5icm93c2VyUGx1cy5qUXVlcnlKU1xuXG4gICAgICAgICAgaWYgQHJlbWVtYmVyT25cbiAgICAgICAgICAgIGlmIEBtb2RlbC5oYXNodXJsXG4gICAgICAgICAgICAgIEBtb2RlbC51cmwgPSBAbW9kZWwuaGFzaHVybFxuICAgICAgICAgICAgICBAbW9kZWwuaGFzaHVybCA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgICBAdXJsLnZhbChAbW9kZWwudXJsKVxuICAgICAgICAgICAgICBAaHRtbHZbMF0/LmV4ZWN1dGVKYXZhU2NyaXB0IFwiXCJcIlxuICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9ICcje0Btb2RlbC51cmx9J1xuICAgICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBpZiBAcmVtZW1iZXJPbiBhbmQgQG1vZGVsLnVybCBpcyBAaHJlZlxuICAgICAgICAgICAgICBAaHRtbHZbMF0/LmV4ZWN1dGVKYXZhU2NyaXB0IFwiXCJcIlxuICAgICAgICAgICAgICAgIGpRdWVyeSh3aW5kb3cpLnNjcm9sbFRvcCgje0BjdXJQb3MudG9wfSk7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KHdpbmRvdykuc2Nyb2xsTGVmdCgje0BjdXJQb3MubGVmdH0pO1xuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIEBtb2RlbC5icm93c2VyUGx1cy5qU3RvcmFnZUpTID89IEJyb3dzZXJQbHVzVmlldy5nZXRKU3RvcmFnZS5jYWxsIEBcbiAgICAgICAgICBAaHRtbHZbMF0/LmV4ZWN1dGVKYXZhU2NyaXB0IEBtb2RlbC5icm93c2VyUGx1cy5qU3RvcmFnZUpTXG5cbiAgICAgICAgICBAbW9kZWwuYnJvd3NlclBsdXMud2F0Y2hqcyA/PSBCcm93c2VyUGx1c1ZpZXcuZ2V0V2F0Y2hqcy5jYWxsIEBcbiAgICAgICAgICBAaHRtbHZbMF0/LmV4ZWN1dGVKYXZhU2NyaXB0IEBtb2RlbC5icm93c2VyUGx1cy53YXRjaGpzXG5cbiAgICAgICAgICBAbW9kZWwuYnJvd3NlclBsdXMuaG90S2V5cyA/PSBCcm93c2VyUGx1c1ZpZXcuZ2V0SG90S2V5cy5jYWxsIEBcbiAgICAgICAgICBAaHRtbHZbMF0/LmV4ZWN1dGVKYXZhU2NyaXB0IEBtb2RlbC5icm93c2VyUGx1cy5ob3RLZXlzXG5cbiAgICAgICAgICBAbW9kZWwuYnJvd3NlclBsdXMubm90aWZ5QmFyID89IEJyb3dzZXJQbHVzVmlldy5nZXROb3RpZnlCYXIuY2FsbCBAXG4gICAgICAgICAgQGh0bWx2WzBdPy5leGVjdXRlSmF2YVNjcmlwdCBAbW9kZWwuYnJvd3NlclBsdXMubm90aWZ5QmFyXG4gICAgICAgICAgaWYgaW5pdHMgPSBAbW9kZWwuYnJvd3NlclBsdXMucGx1Z2lucz8ub25Jbml0XG4gICAgICAgICAgICBmb3IgaW5pdCBpbiBpbml0c1xuICAgICAgICAgICAgICAjIGluaXQgPSBcIigje2luaXQudG9TdHJpbmcoKX0pKClcIlxuICAgICAgICAgICAgICBAaHRtbHZbMF0/LmV4ZWN1dGVKYXZhU2NyaXB0IGluaXRcbiAgICAgICAgICBpZiBqc3MgPSBAbW9kZWwuYnJvd3NlclBsdXMucGx1Z2lucz8uanNzXG4gICAgICAgICAgICBmb3IganMgaW4ganNzXG4gICAgICAgICAgICAgIEBodG1sdlswXT8uZXhlY3V0ZUphdmFTY3JpcHQgQnJvd3NlclBsdXNWaWV3LmxvYWRKUy5jYWxsKEAsanMsdHJ1ZSlcblxuICAgICAgICAgIGlmIGNzc3MgPSBAbW9kZWwuYnJvd3NlclBsdXMucGx1Z2lucz8uY3Nzc1xuICAgICAgICAgICAgZm9yIGNzcyBpbiBjc3NzXG4gICAgICAgICAgICAgIEBodG1sdlswXT8uZXhlY3V0ZUphdmFTY3JpcHQgQnJvd3NlclBsdXNWaWV3LmxvYWRDU1MuY2FsbChALGNzcyx0cnVlKVxuXG4gICAgICAgICAgaWYgbWVudXMgPSBAbW9kZWwuYnJvd3NlclBsdXMucGx1Z2lucz8ubWVudXNcbiAgICAgICAgICAgIGZvciBtZW51IGluIG1lbnVzXG4gICAgICAgICAgICAgIG1lbnUuZm4gPSBtZW51LmZuLnRvU3RyaW5nKCkgaWYgbWVudS5mblxuICAgICAgICAgICAgICBtZW51LnNlbGVjdG9yRmlsdGVyID0gbWVudS5zZWxlY3RvckZpbHRlci50b1N0cmluZygpIGlmIG1lbnUuc2VsZWN0b3JGaWx0ZXJcbiAgICAgICAgICAgICAgQGh0bWx2WzBdPy5leGVjdXRlSmF2YVNjcmlwdCBcImJyb3dzZXJQbHVzLm1lbnUoI3tKU09OLnN0cmluZ2lmeShtZW51KX0pXCJcblxuICAgICAgICAgIEBodG1sdlswXT8uZXhlY3V0ZUphdmFTY3JpcHQgQnJvd3NlclBsdXNWaWV3LmxvYWRDU1MuY2FsbCBALCdicC1zdHlsZS5jc3MnXG4gICAgICAgICAgQGh0bWx2WzBdPy5leGVjdXRlSmF2YVNjcmlwdCBCcm93c2VyUGx1c1ZpZXcubG9hZENTUy5jYWxsIEAsJ2pxdWVyeS5ub3RpZnlCYXIuY3NzJ1xuXG4gICAgICBAaHRtbHZbMF0/LmFkZEV2ZW50TGlzdGVuZXIgXCJwYWdlLWZhdmljb24tdXBkYXRlZFwiLCAoZSk9PlxuICAgICAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgICAgICBmYXZyID0gd2luZG93LmJwLmpzLmdldCgnYnAuZmF2JylcbiAgICAgICAgaWYgZmF2ID0gXy5maW5kKCBmYXZyLHsndXJsJzpAbW9kZWwudXJsfSApXG4gICAgICAgICAgZmF2LmZhdkljb24gPSBlLmZhdmljb25zWzBdXG4gICAgICAgICAgd2luZG93LmJwLmpzLnNldCgnYnAuZmF2JyxmYXZyKVxuXG4gICAgICAgIEBtb2RlbC5pY29uTmFtZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoxMDAwMCkudG9TdHJpbmcoKVxuICAgICAgICBAbW9kZWwuZmF2SWNvbiA9IGUuZmF2aWNvbnNbMF1cbiAgICAgICAgQG1vZGVsLnVwZGF0ZUljb24gZS5mYXZpY29uc1swXVxuICAgICAgICBmYXZJY29uID0gd2luZG93LmJwLmpzLmdldCgnYnAuZmF2SWNvbicpXG4gICAgICAgIHVyaSA9IEBodG1sdlswXS5nZXRVUkwoKVxuICAgICAgICByZXR1cm4gdW5sZXNzIHVyaVxuICAgICAgICBmYXZJY29uW3VyaV0gPSBlLmZhdmljb25zWzBdXG4gICAgICAgIHdpbmRvdy5icC5qcy5zZXQoJ2JwLmZhdkljb24nLGZhdkljb24pXG4gICAgICAgIEBtb2RlbC51cGRhdGVJY29uKClcbiAgICAgICAgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnXG4gICAgICAgIHN0eWxlLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgICAgICAgLnRpdGxlLmljb24uaWNvbi0je0Btb2RlbC5pY29uTmFtZX0ge1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kLXNpemU6IDE2cHggMTZweDtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICAgICAgICAgICAgcGFkZGluZy1sZWZ0OiAyMHB4O1xuICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJyN7ZS5mYXZpY29uc1swXX0nKTtcbiAgICAgICAgICAgICAgYmFja2dyb3VuZC1wb3NpdGlvbi15OiA1MCU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc3R5bGUpXG5cbiAgICAgIEBodG1sdlswXT8uYWRkRXZlbnRMaXN0ZW5lciBcImRpZC1uYXZpZ2F0ZS1pbi1wYWdlXCIsIChldnQpPT5cbiAgICAgICAgQHVwZGF0ZVBhZ2VVcmwoZXZ0KTtcblxuICAgICAgQGh0bWx2WzBdPy5hZGRFdmVudExpc3RlbmVyIFwiZGlkLW5hdmlnYXRlXCIsIChldnQpPT5cbiAgICAgICAgQHVwZGF0ZVBhZ2VVcmwoZXZ0KTtcblxuICAgICAgQGh0bWx2WzBdPy5hZGRFdmVudExpc3RlbmVyIFwicGFnZS10aXRsZS1zZXRcIiwgKGUpPT5cbiAgICAgICAgIyBAbW9kZWwuYnJvd3NlclBsdXMudGl0bGVbQG1vZGVsLnVybF0gPSBlLnRpdGxlXG4gICAgICAgIF8gPSByZXF1aXJlICdsb2Rhc2gnXG4gICAgICAgIGZhdnIgPSB3aW5kb3cuYnAuanMuZ2V0KCdicC5mYXYnKVxuICAgICAgICB0aXRsZSA9IHdpbmRvdy5icC5qcy5nZXQoJ2JwLnRpdGxlJylcbiAgICAgICAgdXJpID0gQGh0bWx2WzBdLmdldFVSTCgpXG4gICAgICAgIHJldHVybiB1bmxlc3MgdXJpXG4gICAgICAgIHRpdGxlW3VyaV0gPSBlLnRpdGxlXG4gICAgICAgIHdpbmRvdy5icC5qcy5zZXQoJ2JwLnRpdGxlJyx0aXRsZSlcbiAgICAgICAgaWYgZmF2ICA9IF8uZmluZCggZmF2cix7J3VybCc6QG1vZGVsLnVybH0gKVxuICAgICAgICAgIGZhdi50aXRsZSA9IGUudGl0bGVcbiAgICAgICAgICB3aW5kb3cuYnAuanMuc2V0KCdicC5mYXYnLGZhdnIpXG4gICAgICAgIEBtb2RlbC5zZXRUaXRsZShlLnRpdGxlKVxuXG4gICAgICBAZGV2dG9vbC5vbiAnY2xpY2snLCAoZXZ0KT0+XG4gICAgICAgIEB0b2dnbGVEZXZUb29sKClcblxuICAgICAgQHNwaW5uZXIub24gJ2NsaWNrJywgKGV2dCk9PlxuICAgICAgICBAaHRtbHZbMF0/LnN0b3AoKVxuXG4gICAgICBAcmVtZW1iZXIub24gJ2NsaWNrJywgKGV2dCk9PlxuICAgICAgICBAcmVtZW1iZXJPbiA9ICFAcmVtZW1iZXJPblxuICAgICAgICBAcmVtZW1iZXIudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScsQHJlbWVtYmVyT24pXG5cbiAgICAgIEBwcmludC5vbiAnY2xpY2snLCAoZXZ0KT0+XG4gICAgICAgIEBodG1sdlswXT8ucHJpbnQoKVxuXG4gICAgICBAbmV3VGFiLm9uICdjbGljaycsIChldnQpPT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbiBcImJyb3dzZXItcGx1czovL2JsYW5rXCJcbiAgICAgICAgQHNwaW5uZXIucmVtb3ZlQ2xhc3MgJ2ZhLWN1c3RvbSdcblxuICAgICAgQGhpc3Rvcnkub24gJ2NsaWNrJywgKGV2dCk9PlxuICAgICAgICAjIGF0b20ud29ya3NwYWNlLm9wZW4gXCJmaWxlOi8vLyN7QG1vZGVsLmJyb3dzZXJQbHVzLnJlc291cmNlc31oaXN0b3J5Lmh0bWxcIiAsIHtzcGxpdDogJ2xlZnQnLHNlYXJjaEFsbFBhbmVzOnRydWV9XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gXCJicm93c2VyLXBsdXM6Ly9oaXN0b3J5XCIgLCB7c3BsaXQ6ICdsZWZ0JyxzZWFyY2hBbGxQYW5lczp0cnVlfVxuXG4gICAgICAjIEBwZGYub24gJ2NsaWNrJywgKGV2dCk9PlxuICAgICAgIyAgIEBodG1sdlswXT8ucHJpbnRUb1BERiB7fSwgKGRhdGEsZXJyKS0+XG5cbiAgICAgIEBsaXZlLm9uICdjbGljaycsIChldnQpPT5cbiAgICAgICAgIyByZXR1cm4gaWYgQG1vZGVsLnNyY1xuICAgICAgICBAbGl2ZU9uID0gIUBsaXZlT25cbiAgICAgICAgQGxpdmUudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScsQGxpdmVPbilcbiAgICAgICAgaWYgQGxpdmVPblxuICAgICAgICAgIEByZWZyZXNoUGFnZSgpXG4gICAgICAgICAgQGxpdmVTdWJzY3JpcHRpb24gPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgICAgICAgIEBsaXZlU3Vic2NyaXB0aW9uLmFkZCBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcik9PlxuICAgICAgICAgICAgICAgICAgQGxpdmVTdWJzY3JpcHRpb24uYWRkIGVkaXRvci5vbkRpZFNhdmUgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQgPSBhdG9tLmNvbmZpZy5nZXQoJ2Jyb3dzZXItcGx1cy5saXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgQHJlZnJlc2hQYWdlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICwgdGltZW91dFxuICAgICAgICAgIEBtb2RlbC5vbkRpZERlc3Ryb3kgPT5cbiAgICAgICAgICAgIEBsaXZlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGxpdmVTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG5cblxuICAgICAgQGZhdi5vbiAnY2xpY2snLChldnQpPT5cbiAgICAgICAgIyByZXR1cm4gaWYgQG1vZGVsLnNyY1xuICAgICAgICAjIHJldHVybiBpZiBAaHRtbHZbMF0/LmdldFVybCgpLnN0YXJ0c1dpdGgoJ2RhdGE6dGV4dC9odG1sLCcpXG4gICAgICAgICMgcmV0dXJuIGlmIEBtb2RlbC51cmwuc3RhcnRzV2l0aCAnYnJvd3Nlci1wbHVzOidcbiAgICAgICAgZmF2cyA9IHdpbmRvdy5icC5qcy5nZXQoJ2JwLmZhdicpXG4gICAgICAgIGlmIEBmYXYuaGFzQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgQHJlbW92ZUZhdihAbW9kZWwpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gaWYgQG1vZGVsLm9yZ1VSSVxuICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICB1cmw6IEBtb2RlbC51cmxcbiAgICAgICAgICAgIHRpdGxlOiBAbW9kZWwudGl0bGUgb3IgQG1vZGVsLnVybFxuICAgICAgICAgICAgZmF2SWNvbjogQG1vZGVsLmZhdkljb25cbiAgICAgICAgICB9XG4gICAgICAgICAgZmF2cy5wdXNoIGRhdGFcbiAgICAgICAgICBkZWxDb3VudCA9IGZhdnMubGVuZ3RoIC0gYXRvbS5jb25maWcuZ2V0ICdicm93c2VyLXBsdXMuZmF2J1xuICAgICAgICAgIGZhdnMuc3BsaWNlIDAsIGRlbENvdW50IGlmIGRlbENvdW50ID4gMFxuICAgICAgICAgIHdpbmRvdy5icC5qcy5zZXQoJ2JwLmZhdicsZmF2cylcbiAgICAgICAgQGZhdi50b2dnbGVDbGFzcyAnYWN0aXZlJ1xuXG4gICAgICBAaHRtbHZbMF0/LmFkZEV2ZW50TGlzdGVuZXIgJ25ldy13aW5kb3cnLCAoZSktPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuIGUudXJsLCB7c3BsaXQ6ICdsZWZ0JyxzZWFyY2hBbGxQYW5lczp0cnVlLG9wZW5JblNhbWVXaW5kb3c6ZmFsc2V9XG5cbiAgICAgIEBodG1sdlswXT8uYWRkRXZlbnRMaXN0ZW5lciBcImRpZC1zdGFydC1sb2FkaW5nXCIsID0+XG4gICAgICAgIEBzcGlubmVyLnJlbW92ZUNsYXNzICdmYS1jdXN0b20nXG4gICAgICAgIEBodG1sdlswXT8uc2hhZG93Um9vdC5maXJzdENoaWxkLnN0eWxlLmhlaWdodCA9ICc5NSUnXG5cbiAgICAgIEBodG1sdlswXT8uYWRkRXZlbnRMaXN0ZW5lciBcImRpZC1zdG9wLWxvYWRpbmdcIiwgPT5cbiAgICAgICAgQHNwaW5uZXIuYWRkQ2xhc3MgJ2ZhLWN1c3RvbSdcblxuICAgICAgQGJhY2sub24gJ2NsaWNrJywgKGV2dCk9PlxuICAgICAgICBpZiBAaHRtbHZbMF0/LmNhbkdvQmFjaygpIGFuZCAkKGAgdGhpc2ApLmhhc0NsYXNzKCdhY3RpdmUnKVxuICAgICAgICAgIEBodG1sdlswXT8uZ29CYWNrKClcblxuICAgICAgQGZhdkxpc3Qub24gJ2NsaWNrJywgKGV2dCk9PlxuICAgICAgICBmYXZMaXN0ID0gcmVxdWlyZSAnLi9mYXYtdmlldydcbiAgICAgICAgbmV3IGZhdkxpc3Qgd2luZG93LmJwLmpzLmdldCgnYnAuZmF2JylcblxuICAgICAgQGZvcndhcmQub24gJ2NsaWNrJywgKGV2dCk9PlxuICAgICAgICBpZiBAaHRtbHZbMF0/LmNhbkdvRm9yd2FyZCgpIGFuZCAkKGAgdGhpc2ApLmhhc0NsYXNzKCdhY3RpdmUnKVxuICAgICAgICAgIEBodG1sdlswXT8uZ29Gb3J3YXJkKClcblxuICAgICAgQHVybC5vbiAnY2xpY2snLChldnQpPT5cbiAgICAgICAgQHVybC5zZWxlY3QoKVxuXG4gICAgICBAdXJsLm9uICdrZXlwcmVzcycsKGV2dCk9PlxuICAgICAgICBVUkwgPSByZXF1aXJlICd1cmwnXG4gICAgICAgIGlmIGV2dC53aGljaCBpcyAxM1xuICAgICAgICAgIEB1cmwuYmx1cigpXG4gICAgICAgICAgdXJscyA9IFVSTC5wYXJzZShgIHRoaXMudmFsdWVgKVxuICAgICAgICAgIHVybCA9IGAgdGhpcy52YWx1ZWBcbiAgICAgICAgICB1bmxlc3MgdXJsLnN0YXJ0c1dpdGgoJ2Jyb3dzZXItcGx1czovLycpXG4gICAgICAgICAgICBpZiB1cmwuaW5kZXhPZignICcpID49IDBcbiAgICAgICAgICAgICAgdXJsID0gXCJodHRwOi8vd3d3Lmdvb2dsZS5jb20vc2VhcmNoP2FzX3E9I3t1cmx9XCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgbG9jYWxob3N0UGF0dGVybiA9IC8vL15cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaHR0cDovLyk/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxob3N0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vaVxuICAgICAgICAgICAgICBpZiB1cmwuc2VhcmNoKGxvY2FsaG9zdFBhdHRlcm4pIDwgMCAgIGFuZCB1cmwuaW5kZXhPZignLicpIDwgMFxuICAgICAgICAgICAgICAgIHVybCA9IFwiaHR0cDovL3d3dy5nb29nbGUuY29tL3NlYXJjaD9hc19xPSN7dXJsfVwiXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiB1cmxzLnByb3RvY29sIGluIFsnaHR0cCcsJ2h0dHBzJywnZmlsZTonXVxuICAgICAgICAgICAgICAgICAgaWYgdXJscy5wcm90b2NvbCBpcyAnZmlsZTonXG4gICAgICAgICAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKC9cXFxcL2csXCIvXCIpXG4gICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHVybCA9IFVSTC5mb3JtYXQodXJscylcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICB1cmxzLnByb3RvY29sID0gJ2h0dHAnXG4gICAgICAgICAgICAgICAgICB1cmwgPSBVUkwuZm9ybWF0KHVybHMpXG4gICAgICAgICAgQGdvVG9VcmwodXJsKVxuXG4gICAgICBAcmVmcmVzaC5vbiAnY2xpY2snLCAoZXZ0KT0+XG4gICAgICAgIEByZWZyZXNoUGFnZSgpXG5cbiAgICAgICMgQG1vYmlsZS5vbiAnY2xpY2snLCAoZXZ0KT0+XG4gICAgICAjICAgQGh0bWx2WzBdPy5zZXRVc2VyQWdlbnQoXCJNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wOyBOZXh1cyA1IEJ1aWxkL01SQTU4TikgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzYxLjAuMzEzNC4wIE1vYmlsZSBTYWZhcmkvNTM3LjM2XCIpXG5cbiAgdXBkYXRlUGFnZVVybDogKGV2dCkgLT5cbiAgICAgIEJyb3dzZXJQbHVzTW9kZWwgPSByZXF1aXJlICcuL2Jyb3dzZXItcGx1cy1tb2RlbCdcbiAgICAgIHVybCA9IGV2dC51cmxcbiAgICAgIHVubGVzcyBCcm93c2VyUGx1c01vZGVsLmNoZWNrVXJsKHVybClcbiAgICAgICAgdXJsID0gYXRvbS5jb25maWcuZ2V0KCdicm93c2VyLXBsdXMuaG9tZXBhZ2UnKSBvciBcImh0dHA6Ly93d3cuZ29vZ2xlLmNvbVwiXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKFwiUmVkaXJlY3RpbmcgdG8gI3t1cmx9XCIpXG4gICAgICAgIEBodG1sdlswXT8uZXhlY3V0ZUphdmFTY3JpcHQgXCJsb2NhdGlvbi5ocmVmID0gJyN7dXJsfSdcIlxuICAgICAgICByZXR1cm5cbiAgICAgIGlmIHVybCBhbmQgdXJsIGlzbnQgQG1vZGVsLnVybCBhbmQgbm90IEB1cmwudmFsKCk/LnN0YXJ0c1dpdGggJ2Jyb3dzZXItcGx1czovLydcbiAgICAgICAgQHVybC52YWwgdXJsXG4gICAgICAgIEBtb2RlbC51cmwgPSB1cmxcbiAgICAgIHRpdGxlID0gQGh0bWx2WzBdPy5nZXRUaXRsZSgpXG4gICAgICBpZiB0aXRsZVxuICAgICAgICAjIEBtb2RlbC5icm93c2VyUGx1cy50aXRsZVtAbW9kZWwudXJsXSA9IHRpdGxlXG4gICAgICAgIEBtb2RlbC5zZXRUaXRsZSh0aXRsZSkgaWYgdGl0bGUgaXNudCBAbW9kZWwuZ2V0VGl0bGUoKVxuICAgICAgZWxzZVxuICAgICAgICAjIEBtb2RlbC5icm93c2VyUGx1cy50aXRsZVtAbW9kZWwudXJsXSA9IHVybFxuICAgICAgICBAbW9kZWwuc2V0VGl0bGUodXJsKVxuXG4gICAgICBAbGl2ZS50b2dnbGVDbGFzcyAnYWN0aXZlJyxAbGl2ZU9uXG4gICAgICBAbGl2ZVN1YnNjcmlwdGlvbj8uZGlzcG9zZSgpIHVubGVzcyBAbGl2ZU9uXG4gICAgICBAY2hlY2tOYXYoKVxuICAgICAgQGNoZWNrRmF2KClcbiAgICAgIEBhZGRIaXN0b3J5KClcblxuICByZWZyZXNoUGFnZTogKHVybCxpZ25vcmVjYWNoZSktPlxuICAgICAgIyBodG1sdiA9IEBtb2RlbC52aWV3Lmh0bWx2WzBdXG4gICAgICBpZiBAcmVtZW1iZXJPblxuICAgICAgICBAaHRtbHZbMF0/LmV4ZWN1dGVKYXZhU2NyaXB0IFwiXCJcIlxuICAgICAgICAgIHZhciBsZWZ0LCB0b3A7XG4gICAgICAgICAgY3VyVG9wID0galF1ZXJ5KHdpbmRvdykuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgY3VyTGVmdCA9IGpRdWVyeSh3aW5kb3cpLnNjcm9sbExlZnQoKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgfmJyb3dzZXItcGx1cy1wb3NpdGlvbn4ke2N1clRvcH0sJHtjdXJMZWZ0fWApO1xuICAgICAgICBcIlwiXCJcbiAgICAgIGlmIEBtb2RlbC5vcmdVUkkgYW5kIHBwID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCdwcCcpXG4gICAgICAgIHBwLm1haW5Nb2R1bGUuY29tcGlsZVBhdGgoQG1vZGVsLm9yZ1VSSSxAbW9kZWwuX2lkKVxuICAgICAgZWxzZVxuICAgICAgICBpZiB1cmxcbiAgICAgICAgICBAbW9kZWwudXJsID0gdXJsXG4gICAgICAgICAgQHVybC52YWwgdXJsXG4gICAgICAgICAgQGh0bWx2WzBdPy5zcmMgPSB1cmxcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIEB1bHRyYUxpdmVPbiBhbmQgQG1vZGVsLnNyY1xuICAgICAgICAgICAgQGh0bWx2WzBdPy5zcmMgPSBAbW9kZWwuc3JjXG4gICAgICAgICAgaWYgaWdub3JlY2FjaGVcbiAgICAgICAgICAgIEBodG1sdlswXT8ucmVsb2FkSWdub3JpbmdDYWNoZSgpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGh0bWx2WzBdPy5yZWxvYWQoKVxuXG4gIGdvVG9Vcmw6ICh1cmwpLT5cbiAgICAgIEJyb3dzZXJQbHVzTW9kZWwgPSByZXF1aXJlICcuL2Jyb3dzZXItcGx1cy1tb2RlbCdcbiAgICAgIHJldHVybiB1bmxlc3MgQnJvd3NlclBsdXNNb2RlbC5jaGVja1VybCh1cmwpXG4gICAgICBqUShAdXJsKS5hdXRvY29tcGxldGU/KFwiY2xvc2VcIilcbiAgICAgIEBsaXZlT24gPSBmYWxzZVxuICAgICAgQGxpdmUudG9nZ2xlQ2xhc3MgJ2FjdGl2ZScsQGxpdmVPblxuICAgICAgQGxpdmVTdWJzY3JpcHRpb24/LmRpc3Bvc2UoKSB1bmxlc3MgQGxpdmVPblxuICAgICAgQHVybC52YWwgdXJsXG4gICAgICBAbW9kZWwudXJsID0gdXJsXG4gICAgICBkZWxldGUgQG1vZGVsLnRpdGxlXG4gICAgICBkZWxldGUgQG1vZGVsLmljb25OYW1lXG4gICAgICBkZWxldGUgQG1vZGVsLmZhdkljb25cbiAgICAgIEBtb2RlbC5zZXRUaXRsZShudWxsKVxuICAgICAgQG1vZGVsLnVwZGF0ZUljb24obnVsbClcbiAgICAgIGlmIHVybC5zdGFydHNXaXRoKCdicm93c2VyLXBsdXM6Ly8nKVxuICAgICAgICB1cmwgPSBAbW9kZWwuYnJvd3NlclBsdXMuZ2V0QnJvd3NlclBsdXNVcmw/KHVybClcbiAgICAgIEBodG1sdi5hdHRyICdzcmMnLHVybFxuXG4gIGtleUhhbmRsZXI6IChldnQpLT5cbiAgICBzd2l0Y2ggZXZ0WzBdLmtleUlkZW50aWZpZXJcbiAgICAgIHdoZW4gIFwiRjEyXCJcbiAgICAgICAgQHRvZ2dsZURldlRvb2woKVxuICAgICAgd2hlbiBcIkY1XCJcbiAgICAgICAgaWYgZXZ0WzBdLmN0cmxLZXlcbiAgICAgICAgICBAcmVmcmVzaFBhZ2UodW5kZWZpbmVkLHRydWUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAcmVmcmVzaFBhZ2UoKVxuICAgICAgd2hlbiBcIkYxMFwiXG4gICAgICAgIEB0b2dnbGVVUkxCYXIoKVxuICAgICAgd2hlbiBcIkxlZnRcIlxuICAgICAgICBAZ29CYWNrKCkgaWYgZXZ0WzBdLmFsdEtleVxuXG4gICAgICB3aGVuIFwiUmlnaHRcIlxuICAgICAgICBAZ29Gb3J3YXJkKCkgaWYgZXZ0WzBdLmFsdEtleVxuXG4gIHJlbW92ZUZhdjogKGZhdm9yaXRlKS0+XG4gICAgZmF2cnMgPSB3aW5kb3cuYnAuanMuZ2V0KCdicC5mYXYnKVxuICAgIGZvciBmYXZyLGlkeCBpbiBmYXZyc1xuICAgICAgaWYgZmF2ci51cmwgaXMgZmF2b3JpdGUudXJsXG4gICAgICAgIGZhdnJzLnNwbGljZSBpZHgsMVxuICAgICAgICB3aW5kb3cuYnAuanMuc2V0KCdicC5mYXYnLGZhdnJzKVxuICAgICAgICByZXR1cm5cblxuICBzZXRTcmM6ICh0ZXh0KS0+XG4gICAgdXJsID0gQG1vZGVsLm9yZ1VSSSBvciBAbW9kZWwudXJsXG4gICAgdGV4dCA9IEJyb3dzZXJQbHVzVmlldy5jaGVja0Jhc2UodGV4dCx1cmwpXG4gICAgQG1vZGVsLnNyYyA9IFwiZGF0YTp0ZXh0L2h0bWwsI3t0ZXh0fVwiXG4gICAgQGh0bWx2WzBdPy5zcmMgPSBAbW9kZWwuc3JjXG5cbiAgQGNoZWNrQmFzZTogKHRleHQsdXJsKS0+XG4gICAgY2hlZXJpbyA9IHJlcXVpcmUgJ2NoZWVyaW8nXG4gICAgJGh0bWwgPSBjaGVlcmlvLmxvYWQodGV4dClcbiAgICAjIGJhc2VQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF0rXCIvXCJcbiAgICBiYXNlUGF0aCA9IHBhdGguZGlybmFtZSh1cmwpK1wiL1wiXG4gICAgaWYgJGh0bWwoJ2Jhc2UnKS5sZW5ndGhcbiAgICAgIHRleHRcbiAgICBlbHNlXG4gICAgICBpZiAkaHRtbCgnaGVhZCcpLmxlbmd0aFxuICAgICAgICBiYXNlICA9IFwiPGJhc2UgaHJlZj0nI3tiYXNlUGF0aH0nIHRhcmdldD0nX2JsYW5rJz5cIlxuICAgICAgICAkaHRtbCgnaGVhZCcpLnByZXBlbmQoYmFzZSlcbiAgICAgIGVsc2VcbiAgICAgICAgYmFzZSAgPSBcIjxoZWFkPjxiYXNlIGhyZWY9JyN7YmFzZVBhdGh9JyB0YXJnZXQ9J19ibGFuayc+PC9oZWFkPlwiXG4gICAgICAgICRodG1sKCdodG1sJykucHJlcGVuZChiYXNlKVxuICAgICAgJGh0bWwuaHRtbCgpXG5cbiAgY2hlY2tGYXY6IC0+XG4gICAgQGZhdi5yZW1vdmVDbGFzcyAnYWN0aXZlJ1xuICAgIGZhdnJzID0gd2luZG93LmJwLmpzLmdldCgnYnAuZmF2JylcbiAgICBmb3IgZmF2ciBpbiBmYXZyc1xuICAgICAgaWYgZmF2ci51cmwgaXMgQG1vZGVsLnVybFxuICAgICAgICBAZmF2LmFkZENsYXNzICdhY3RpdmUnXG5cbiAgdG9nZ2xlRGV2VG9vbDogLT5cbiAgICBvcGVuID0gQGh0bWx2WzBdPy5pc0RldlRvb2xzT3BlbmVkKClcbiAgICBpZiBvcGVuXG4gICAgICBAaHRtbHZbMF0/LmNsb3NlRGV2VG9vbHMoKVxuICAgIGVsc2VcbiAgICAgIEBodG1sdlswXT8ub3BlbkRldlRvb2xzKClcblxuICAgICQoQGRldnRvb2wpLnRvZ2dsZUNsYXNzICdhY3RpdmUnLCAhb3BlblxuXG4gIGNoZWNrTmF2OiAtPlxuICAgICAgJChAZm9yd2FyZCkudG9nZ2xlQ2xhc3MgJ2FjdGl2ZScsQGh0bWx2WzBdPy5jYW5Hb0ZvcndhcmQoKVxuICAgICAgJChAYmFjaykudG9nZ2xlQ2xhc3MgJ2FjdGl2ZScsQGh0bWx2WzBdPy5jYW5Hb0JhY2soKVxuICAgICAgaWYgQGh0bWx2WzBdPy5jYW5Hb0ZvcndhcmQoKVxuICAgICAgICBpZiBAY2xlYXJGb3J3YXJkXG4gICAgICAgICAgJChAZm9yd2FyZCkudG9nZ2xlQ2xhc3MgJ2FjdGl2ZScsZmFsc2VcbiAgICAgICAgICBAY2xlYXJGb3J3YXJkID0gZmFsc2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICQoQGZvcndhcmQpLnRvZ2dsZUNsYXNzICdhY3RpdmUnLHRydWVcblxuICBnb0JhY2s6IC0+XG4gICAgQGJhY2suY2xpY2soKVxuXG4gIGdvRm9yd2FyZDogLT5cbiAgICBAZm9yd2FyZC5jbGljaygpXG5cbiAgYWRkSGlzdG9yeTogLT5cbiAgICB1cmwgPSBAaHRtbHZbMF0uZ2V0VVJMKCkucmVwbGFjZSgvXFxcXC9nLFwiL1wiKVxuICAgIHJldHVybiB1bmxlc3MgdXJsXG4gICAgaGlzdG9yeVVSTCA9IFwiZmlsZTovLy8je0Btb2RlbC5icm93c2VyUGx1cy5yZXNvdXJjZXN9aGlzdG9yeS5odG1sXCIucmVwbGFjZSgvXFxcXC9nLFwiL1wiKVxuICAgIHJldHVybiBpZiB1cmwuc3RhcnRzV2l0aCgnYnJvd3Nlci1wbHVzOi8vJykgb3IgdXJsLnN0YXJ0c1dpdGgoJ2RhdGE6dGV4dC9odG1sLCcpIG9yIHVybC5zdGFydHNXaXRoIGhpc3RvcnlVUkxcbiAgICB5eXl5bW1kZCA9IC0+XG4gICAgICBkYXRlID0gbmV3IERhdGUoKVxuICAgICAgeXl5eSA9IGRhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpXG4gICAgICBtbSA9IChkYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpXG4gICAgICAjIGdldE1vbnRoKCkgaXMgemVyby1iYXNlZFxuICAgICAgZGQgPSBkYXRlLmdldERhdGUoKS50b1N0cmluZygpXG4gICAgICB5eXl5ICsgKGlmIG1tWzFdIHRoZW4gbW0gZWxzZSAnMCcgKyBtbVswXSkgKyAoaWYgZGRbMV0gdGhlbiBkZCBlbHNlICcwJyArIGRkWzBdKVxuICAgIHRvZGF5ID0geXl5eW1tZGQoKVxuICAgIGhpc3RvcnkgPSB3aW5kb3cuYnAuanMuZ2V0KCdicC5oaXN0b3J5Jykgb3IgW11cbiAgICAjIHJldHVybiB1bmxlc3MgaGlzdG9yeSBvciBoaXN0b3J5Lmxlbmd0aCA9IDBcbiAgICB0b2RheU9iaiA9IGhpc3RvcnkuZmluZCAoZWxlLGlkeCxhcnIpLT5cbiAgICAgIHJldHVybiB0cnVlIGlmIGVsZVt0b2RheV1cbiAgICB1bmxlc3MgdG9kYXlPYmpcbiAgICAgIG9iaiA9IHt9XG4gICAgICBoaXN0VG9kYXkgPSBbXVxuICAgICAgb2JqW3RvZGF5XSA9IGhpc3RUb2RheVxuICAgICAgaGlzdG9yeS51bnNoaWZ0IG9ialxuICAgIGVsc2VcbiAgICAgIGhpc3RUb2RheSA9IHRvZGF5T2JqW3RvZGF5XVxuICAgIGhpc3RUb2RheS51bnNoaWZ0IGRhdGU6IChuZXcgRGF0ZSgpLnRvU3RyaW5nKCkpLHVyaTogdXJsXG4gICAgd2luZG93LmJwLmpzLnNldCgnYnAuaGlzdG9yeScsaGlzdG9yeSlcblxuICBnZXRUaXRsZTogLT5cbiAgICBAbW9kZWwuZ2V0VGl0bGUoKVxuXG4gIHNlcmlhbGl6ZTogLT5cblxuICBkZXN0cm95OiAtPlxuICAgIGpRKEB1cmwpLmF1dG9jb21wbGV0ZT8oJ2Rlc3Ryb3knKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gIEBnZXRKUXVlcnk6IC0+XG4gICAgZnMucmVhZEZpbGVTeW5jIFwiI3tAbW9kZWwuYnJvd3NlclBsdXMucmVzb3VyY2VzfS9qcXVlcnktMi4xLjQubWluLmpzXCIsJ3V0Zi04J1xuXG4gIEBnZXRFdmFsOiAtPlxuICAgIGZzLnJlYWRGaWxlU3luYyBcIiN7QG1vZGVsLmJyb3dzZXJQbHVzLnJlc291cmNlc30vZXZhbC5qc1wiLCd1dGYtOCdcblxuICBAZ2V0SlN0b3JhZ2U6IC0+XG4gICAgZnMucmVhZEZpbGVTeW5jIFwiI3tAbW9kZWwuYnJvd3NlclBsdXMucmVzb3VyY2VzfS9qc3RvcmFnZS5taW4uanNcIiwndXRmLTgnXG5cbiAgQGdldFdhdGNoanM6IC0+XG4gICAgZnMucmVhZEZpbGVTeW5jIFwiI3tAbW9kZWwuYnJvd3NlclBsdXMucmVzb3VyY2VzfS93YXRjaC5qc1wiLCd1dGYtOCdcblxuICBAZ2V0Tm90aWZ5QmFyOiAtPlxuICAgIGZzLnJlYWRGaWxlU3luYyBcIiN7QG1vZGVsLmJyb3dzZXJQbHVzLnJlc291cmNlc30vanF1ZXJ5Lm5vdGlmeUJhci5qc1wiLCd1dGYtOCdcblxuICBAZ2V0SG90S2V5czogLT5cbiAgICBmcy5yZWFkRmlsZVN5bmMgXCIje0Btb2RlbC5icm93c2VyUGx1cy5yZXNvdXJjZXN9L2pxdWVyeS5ob3RrZXlzLm1pbi5qc1wiLCd1dGYtOCdcblxuICBAbG9hZENTUzogKGZpbGVuYW1lLGZ1bGxwYXRoPWZhbHNlKS0+XG4gICAgdW5sZXNzIGZ1bGxwYXRoXG4gICAgICBmcGF0aCA9IFwiZmlsZTovLy8je0Btb2RlbC5icm93c2VyUGx1cy5yZXNvdXJjZXMucmVwbGFjZSgvXFxcXC9nLCcvJyl9XCJcbiAgICAgIGZpbGVuYW1lID0gXCIje2ZwYXRofSN7ZmlsZW5hbWV9XCJcbiAgICBcIlwiXCJcbiAgICBqUXVlcnkoJ2hlYWQnKS5hcHBlbmQoalF1ZXJ5KCc8bGluayB0eXBlPVwidGV4dC9jc3NcIiByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIiN7ZmlsZW5hbWV9XCI+JykpXG4gICAgXCJcIlwiXG5cbiAgQGxvYWRKUzogKGZpbGVuYW1lLGZ1bGxwYXRoPWZhbHNlKS0+XG4gICAgdW5sZXNzIGZ1bGxwYXRoXG4gICAgICBmcGF0aCA9IFwiZmlsZTovLy8je0Btb2RlbC5icm93c2VyUGx1cy5yZXNvdXJjZXMucmVwbGFjZSgvXFxcXC9nLCcvJyl9XCJcbiAgICAgIGZpbGVuYW1lID0gXCIje2ZwYXRofSN7ZmlsZW5hbWV9XCJcblxuICAgIFwiXCJcIlxuICAgIGpRdWVyeSgnaGVhZCcpLmFwcGVuZChqUXVlcnkoJzxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiIHNyYz1cIiN7ZmlsZW5hbWV9XCI+JykpXG4gICAgXCJcIlwiXG4iXX0=
