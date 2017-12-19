(function() {
  document.addEventListener('DOMContentLoaded', function() {
    window.browserPlus = {};
    browserPlus.menu = function(menu) {
      var submenu;
      if (!browserPlus.contextMenu) {
        browserPlus.contextMenu = jQuery("<ul id='bp-menu'></ul>");
        jQuery('body').append(browserPlus.contextMenu);
        browserPlus.contextMenu.hide();
        jQuery('body').on('contextmenu', function(e) {
          var maxHeight, maxWidth, positionX, positionY;
          if (!browserPlus.contextMenu.has('li').length) {
            return false;
          }
          browserPlus.contextMenu.css({
            top: 'auto',
            left: 'auto',
            bottom: 'auto',
            right: 'auto'
          });
          browserPlus.contextMenu.css({
            left: e.pageX,
            top: e.pageY
          });
          maxHeight = e.clientY + browserPlus.contextMenu.outerHeight();
          if (maxHeight > jQuery(window).height()) {
            positionY = e.pageY - browserPlus.contextMenu.outerHeight() - 10;
          } else {
            positionY = e.pageY + 10;
          }
          maxWidth = e.clientX + browserPlus.contextMenu.outerWidth();
          if (maxWidth > jQuery(window).width() + 10) {
            positionX = e.pageX - browserPlus.contextMenu.outerWidth() - 10;
          } else {
            positionX = e.pageX;
          }
          browserPlus.contextMenu.css({
            top: positionY,
            left: positionX
          });
          browserPlus.contextMenu.show();
          jQuery('body').one('click', function() {
            var children;
            browserPlus.contextMenu.hide();
            children = browserPlus.contextMenu.children('.bp-selector');
            children.off('click');
            return children.remove();
          });
          return false;
        });
      }
      if (menu.name) {
        if (menu.selector) {
          jQuery('body').on('contextmenu', menu.selector, function(e) {
            var submenu;
            if (jQuery('#bp-menu').is(':visible')) {
              return true;
            }
            if (browserPlus.contextMenu.children("[data-bpid='" + menu._id + "']").length) {
              return true;
            }
            if (menu.selectorFilter) {
              if (!eval("(" + menu.selectorFilter + ").bind(this)()")) {
                return true;
              }
            }
            submenu = jQuery("<li class='bp-selector' data-bpid = '" + menu._id + "'> " + menu.name + " </li>");
            submenu.on('click', eval('(' + menu.fn + ').bind(this)'));
            return browserPlus.contextMenu.append(submenu);
          });
        } else {
          submenu = jQuery('<li>' + menu.name + '</li>');
          submenu.on('click', eval('(' + menu.fn + ').bind(this)'));
          browserPlus.contextMenu.append(submenu);
        }
      }
      if (menu.event) {
        if (menu.selector) {
          jQuery('body').on(menu.event, menu.selector, eval('(' + menu.fn + ')'));
        } else {
          jQuery('body').on(menu.event, eval('(' + menu.fn + ')'));
        }
      } else if (menu.ctrlkey) {
        menu.keytype = menu.keytype || 'keyup';
        jQuery('body').on(menu.keytype, menu.selector, menu.ctrlkey, eval('(' + menu.fn + ')'));
      }
    };
    if (typeof jQuery === 'undefined') {
      return console.log('~browser-plus-jquery~');
    } else {
      return console.log('~browser-plus-menu~');
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvYnJvd3Nlci1wbHVzL3Jlc291cmNlcy9icC1jbGllbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxTQUFBO0lBQzVDLE1BQU0sQ0FBQyxXQUFQLEdBQXFCO0lBR3JCLFdBQVcsQ0FBQyxJQUFaLEdBQW1CLFNBQUMsSUFBRDtBQUNqQixVQUFBO01BQUEsSUFBRyxDQUFDLFdBQVcsQ0FBQyxXQUFoQjtRQUNFLFdBQVcsQ0FBQyxXQUFaLEdBQTBCLE1BQUEsQ0FBTyx3QkFBUDtRQUMxQixNQUFBLENBQU8sTUFBUCxDQUFjLENBQUMsTUFBZixDQUFzQixXQUFXLENBQUMsV0FBbEM7UUFDQSxXQUFXLENBQUMsV0FBVyxDQUFDLElBQXhCLENBQUE7UUFDQSxNQUFBLENBQU8sTUFBUCxDQUFjLENBQUMsRUFBZixDQUFrQixhQUFsQixFQUFpQyxTQUFDLENBQUQ7QUFDL0IsY0FBQTtVQUFBLElBQUcsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEdBQXhCLENBQTRCLElBQTVCLENBQWlDLENBQUMsTUFBdEM7QUFDRSxtQkFBTyxNQURUOztVQUVBLFdBQVcsQ0FBQyxXQUFXLENBQUMsR0FBeEIsQ0FDRTtZQUFBLEdBQUEsRUFBSyxNQUFMO1lBQ0EsSUFBQSxFQUFNLE1BRE47WUFFQSxNQUFBLEVBQVEsTUFGUjtZQUdBLEtBQUEsRUFBTyxNQUhQO1dBREY7VUFLQSxXQUFXLENBQUMsV0FBVyxDQUFDLEdBQXhCLENBQTRCO1lBQUUsSUFBQSxFQUFNLENBQUMsQ0FBQyxLQUFWO1lBQWtCLEdBQUEsRUFBSyxDQUFDLENBQUMsS0FBekI7V0FBNUI7VUFDQSxTQUFBLEdBQVksQ0FBQyxDQUFDLE9BQUYsR0FBWSxXQUFXLENBQUMsV0FBVyxDQUFDLFdBQXhCLENBQUE7VUFDeEIsSUFBRyxT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LENBQU8sTUFBUCxDQUFjLENBQUMsRUFBZixDQUFrQixJQUFJLENBQUMsS0FBdkIsRUFBOEIsSUFBSSxDQUFDLFFBQW5DLEVBQTZDLElBQUEsQ0FBSyxHQUFBLEdBQU0sSUFBSSxDQUFDLEVBQVgsR0FBZ0IsR0FBckIsQ0FBN0MsRUFERjtTQUFBLE1BQUE7VUFHRSxNQUFBLENBQU8sTUFBUCxDQUFjLENBQUMsRUFBZixDQUFrQixJQUFJLENBQUMsS0FBdkIsRUFBOEIsSUFBQSxDQUFLLEdBQUEsR0FBTSxJQUFJLENBQUMsRUFBWCxHQUFnQixHQUFyQixDQUE5QixFQUhGO1NBREY7T0FBQSxNQUtLLElBQUcsSUFBSSxDQUFDLE9BQVI7UUFDSCxJQUFJLENBQUMsT0FBTCxHQUFlLElBQUksQ0FBQyxPQUFMLElBQWdCO1FBRS9CLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxFQUFmLENBQWtCLElBQUksQ0FBQyxPQUF2QixFQUFnQyxJQUFJLENBQUMsUUFBckMsRUFBK0MsSUFBSSxDQUFDLE9BQXBELEVBQTZELElBQUEsQ0FBSyxHQUFBLEdBQU0sSUFBSSxDQUFDLEVBQVgsR0FBZ0IsR0FBckIsQ0FBN0QsRUFIRzs7SUFsRFk7SUEyRG5CLElBQUcsT0FBTyxNQUFQLEtBQWlCLFdBQXBCO2FBQ0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSx1QkFBWixFQURGO0tBQUEsTUFBQTthQUdFLE9BQU8sQ0FBQyxHQUFSLENBQVkscUJBQVosRUFIRjs7RUEvRDRDLENBQTlDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICdET01Db250ZW50TG9hZGVkJywgLT5cbiAgd2luZG93LmJyb3dzZXJQbHVzID0ge31cbiAgIyB3aW5kb3cub25oYXNoY2hhbmdlID0gKGV2dCktPlxuICAjICAgY29uc29sZS5sb2cgJ35icm93c2VyLXBsdXMtaHJlZmNoYW5nZX4nICsgZXZ0Lm5ld1VSTFxuICBicm93c2VyUGx1cy5tZW51ID0gKG1lbnUpIC0+XG4gICAgaWYgIWJyb3dzZXJQbHVzLmNvbnRleHRNZW51XG4gICAgICBicm93c2VyUGx1cy5jb250ZXh0TWVudSA9IGpRdWVyeShcIjx1bCBpZD0nYnAtbWVudSc+PC91bD5cIilcbiAgICAgIGpRdWVyeSgnYm9keScpLmFwcGVuZCBicm93c2VyUGx1cy5jb250ZXh0TWVudVxuICAgICAgYnJvd3NlclBsdXMuY29udGV4dE1lbnUuaGlkZSgpXG4gICAgICBqUXVlcnkoJ2JvZHknKS5vbiAnY29udGV4dG1lbnUnLCAoZSkgLT5cbiAgICAgICAgaWYgIWJyb3dzZXJQbHVzLmNvbnRleHRNZW51LmhhcygnbGknKS5sZW5ndGhcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgYnJvd3NlclBsdXMuY29udGV4dE1lbnUuY3NzXG4gICAgICAgICAgdG9wOiAnYXV0bydcbiAgICAgICAgICBsZWZ0OiAnYXV0bydcbiAgICAgICAgICBib3R0b206ICdhdXRvJ1xuICAgICAgICAgIHJpZ2h0OiAnYXV0bydcbiAgICAgICAgYnJvd3NlclBsdXMuY29udGV4dE1lbnUuY3NzKHsgbGVmdDogZS5wYWdlWCAsIHRvcDogZS5wYWdlWX0pXG4gICAgICAgIG1heEhlaWdodCA9IGUuY2xpZW50WSArIGJyb3dzZXJQbHVzLmNvbnRleHRNZW51Lm91dGVySGVpZ2h0KClcbiAgICAgICAgaWYgbWF4SGVpZ2h0ID4galF1ZXJ5KHdpbmRvdykuaGVpZ2h0KClcbiAgICAgICAgICBwb3NpdGlvblkgPSBlLnBhZ2VZIC0gYnJvd3NlclBsdXMuY29udGV4dE1lbnUub3V0ZXJIZWlnaHQoKSAtIDEwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwb3NpdGlvblkgPSBlLnBhZ2VZICsgMTBcbiAgICAgICAgbWF4V2lkdGggPSBlLmNsaWVudFggKyBicm93c2VyUGx1cy5jb250ZXh0TWVudS5vdXRlcldpZHRoKClcbiAgICAgICAgaWYgbWF4V2lkdGggPiBqUXVlcnkod2luZG93KS53aWR0aCgpICsgMTBcbiAgICAgICAgICBwb3NpdGlvblggPSBlLnBhZ2VYIC0gYnJvd3NlclBsdXMuY29udGV4dE1lbnUub3V0ZXJXaWR0aCgpIC0gMTBcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHBvc2l0aW9uWCA9IGUucGFnZVhcbiAgICAgICAgYnJvd3NlclBsdXMuY29udGV4dE1lbnUuY3NzKHt0b3A6cG9zaXRpb25ZLGxlZnQ6cG9zaXRpb25YfSlcbiAgICAgICAgYnJvd3NlclBsdXMuY29udGV4dE1lbnUuc2hvdygpXG4gICAgICAgIGpRdWVyeSgnYm9keScpLm9uZSAnY2xpY2snLCAtPlxuICAgICAgICAgIGJyb3dzZXJQbHVzLmNvbnRleHRNZW51LmhpZGUoKVxuICAgICAgICAgIGNoaWxkcmVuID0gYnJvd3NlclBsdXMuY29udGV4dE1lbnUuY2hpbGRyZW4oJy5icC1zZWxlY3RvcicpXG4gICAgICAgICAgY2hpbGRyZW4ub2ZmICdjbGljaydcbiAgICAgICAgICBjaGlsZHJlbi5yZW1vdmUoKVxuICAgICAgICBmYWxzZVxuICAgIGlmIG1lbnUubmFtZVxuICAgICAgaWYgbWVudS5zZWxlY3RvclxuICAgICAgICBqUXVlcnkoJ2JvZHknKS5vbiAnY29udGV4dG1lbnUnLCBtZW51LnNlbGVjdG9yLCAoZSkgLT5cbiAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBqUXVlcnkoJyNicC1tZW51JykuaXMoJzp2aXNpYmxlJylcbiAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBicm93c2VyUGx1cy5jb250ZXh0TWVudS5jaGlsZHJlbihcIltkYXRhLWJwaWQ9JyN7bWVudS5faWR9J11cIikubGVuZ3RoXG4gICAgICAgICAgcmV0dXJuIHRydWUgdW5sZXNzIGV2YWwoXCIoI3ttZW51LnNlbGVjdG9yRmlsdGVyfSkuYmluZCh0aGlzKSgpXCIpIGlmIG1lbnUuc2VsZWN0b3JGaWx0ZXJcbiAgICAgICAgICBzdWJtZW51ID0galF1ZXJ5KFwiPGxpIGNsYXNzPSdicC1zZWxlY3RvcicgZGF0YS1icGlkID0gJyN7bWVudS5faWR9Jz4gI3ttZW51Lm5hbWV9IDwvbGk+XCIpXG4gICAgICAgICAgc3VibWVudS5vbiAnY2xpY2snLCBldmFsKCcoJyArIG1lbnUuZm4gKyAnKS5iaW5kKHRoaXMpJylcbiAgICAgICAgICBicm93c2VyUGx1cy5jb250ZXh0TWVudS5hcHBlbmQgc3VibWVudVxuICAgICAgZWxzZVxuICAgICAgICBzdWJtZW51ID0galF1ZXJ5KCc8bGk+JyArIG1lbnUubmFtZSArICc8L2xpPicpXG4gICAgICAgIHN1Ym1lbnUub24gJ2NsaWNrJywgZXZhbCgnKCcgKyBtZW51LmZuICsgJykuYmluZCh0aGlzKScpXG4gICAgICAgIGJyb3dzZXJQbHVzLmNvbnRleHRNZW51LmFwcGVuZCBzdWJtZW51XG4gICAgaWYgbWVudS5ldmVudFxuICAgICAgaWYgbWVudS5zZWxlY3RvclxuICAgICAgICBqUXVlcnkoJ2JvZHknKS5vbiBtZW51LmV2ZW50LCBtZW51LnNlbGVjdG9yLCBldmFsKCcoJyArIG1lbnUuZm4gKyAnKScpXG4gICAgICBlbHNlXG4gICAgICAgIGpRdWVyeSgnYm9keScpLm9uIG1lbnUuZXZlbnQsIGV2YWwoJygnICsgbWVudS5mbiArICcpJylcbiAgICBlbHNlIGlmIG1lbnUuY3RybGtleVxuICAgICAgbWVudS5rZXl0eXBlID0gbWVudS5rZXl0eXBlIG9yICdrZXl1cCdcbiAgICAgICMgaWYoY3RybGtleS5oYXMoJ21vdXNld2hlZWx1cCcpKVxuICAgICAgalF1ZXJ5KCdib2R5Jykub24gbWVudS5rZXl0eXBlLCBtZW51LnNlbGVjdG9yLCBtZW51LmN0cmxrZXksIGV2YWwoJygnICsgbWVudS5mbiArICcpJylcbiAgICByZXR1cm5cblxuICAjIGlmIGxvY2F0aW9uLmhyZWYuc3RhcnRzV2l0aCgnZGF0YTp0ZXh0L2h0bWwsJylcbiAgIyBlbHNlXG4gICMgICBjb25zb2xlLmxvZyAnfmJyb3dzZXItcGx1cy1ocmVmficgKyBsb2NhdGlvbi5ocmVmICsgJyAnICsgZG9jdW1lbnQudGl0bGVcbiAgaWYgdHlwZW9mIGpRdWVyeSA9PSAndW5kZWZpbmVkJ1xuICAgIGNvbnNvbGUubG9nICd+YnJvd3Nlci1wbHVzLWpxdWVyeX4nXG4gIGVsc2VcbiAgICBjb25zb2xlLmxvZyAnfmJyb3dzZXItcGx1cy1tZW51fidcbiJdfQ==
