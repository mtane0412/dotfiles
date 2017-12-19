(function() {
  var $, FavView, SelectListView, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, SelectListView = ref.SelectListView;

  $ = require('jquery');

  FavView = (function(superClass) {
    extend(FavView, superClass);

    function FavView() {
      return FavView.__super__.constructor.apply(this, arguments);
    }

    FavView.prototype.initialize = function(items) {
      this.items = items;
      FavView.__super__.initialize.apply(this, arguments);
      this.addClass('overlay from-top');
      this.setItems(this.items);
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.focusFilterEditor();
    };

    FavView.prototype.viewForItem = function(item) {
      var ref1, ref2;
      if (!item.favIcon) {
        item.favIcon = (ref1 = window.bp.js.get('bp.favIcon')) != null ? ref1[item.url] : void 0;
      }
      return "<li><img src='" + item.favIcon + "'width='20' height='20' >&nbsp; &nbsp; " + ((ref2 = item.title) != null ? ref2.slice(0, 31) : void 0) + "</li>";
    };

    FavView.prototype.confirmed = function(item) {
      atom.workspace.open(item.url, {
        split: 'left',
        searchAllPanes: true
      });
      return this.parent().remove();
    };

    FavView.prototype.cancelled = function() {
      return this.parent().remove();
    };

    FavView.prototype.getFilterKey = function() {
      return "title";
    };

    return FavView;

  })(SelectListView);

  module.exports = FavView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RhbmUvLmF0b20vcGFja2FnZXMvYnJvd3Nlci1wbHVzL2xpYi9mYXYtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFDQUFBO0lBQUE7OztFQUFBLE1BQXdCLE9BQUEsQ0FBUSxzQkFBUixDQUF4QixFQUFDLGVBQUQsRUFBTTs7RUFFTixDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0VBQ0U7Ozs7Ozs7c0JBQ0osVUFBQSxHQUFZLFNBQUMsS0FBRDtNQUFDLElBQUMsQ0FBQSxRQUFEO01BQ1gseUNBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsa0JBQVY7TUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxLQUFYOztRQUNBLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFBLElBQUEsRUFBSyxJQUFMO1NBQTdCOztNQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO2FBQ0EsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFOVTs7c0JBUVosV0FBQSxHQUFhLFNBQUMsSUFBRDtBQUNULFVBQUE7TUFBQSxJQUFBLENBQU8sSUFBSSxDQUFDLE9BQVo7UUFDRSxJQUFJLENBQUMsT0FBTCx5REFBK0MsQ0FBQSxJQUFJLENBQUMsR0FBTCxXQURqRDs7YUFFQSxnQkFBQSxHQUFpQixJQUFJLENBQUMsT0FBdEIsR0FBOEIseUNBQTlCLEdBQXNFLG1DQUFhLHNCQUFiLENBQXRFLEdBQTBGO0lBSGpGOztzQkFLYixTQUFBLEdBQVcsU0FBQyxJQUFEO01BQ1AsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLElBQUksQ0FBQyxHQUF6QixFQUE4QjtRQUFDLEtBQUEsRUFBTSxNQUFQO1FBQWMsY0FBQSxFQUFlLElBQTdCO09BQTlCO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFTLENBQUMsTUFBVixDQUFBO0lBRk87O3NCQUlYLFNBQUEsR0FBVyxTQUFBO2FBQ1QsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFTLENBQUMsTUFBVixDQUFBO0lBRFM7O3NCQUdYLFlBQUEsR0FBYyxTQUFBO2FBQ1o7SUFEWTs7OztLQXJCTTs7RUF1QnRCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBMUJqQiIsInNvdXJjZXNDb250ZW50IjpbIntWaWV3LFNlbGVjdExpc3RWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG4kID0gcmVxdWlyZSAnanF1ZXJ5J1xuY2xhc3MgRmF2VmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3XG4gIGluaXRpYWxpemU6IChAaXRlbXMpLT5cbiAgICBzdXBlclxuICAgIEBhZGRDbGFzcyAnb3ZlcmxheSBmcm9tLXRvcCdcbiAgICBAc2V0SXRlbXMgQGl0ZW1zXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwgaXRlbTpAXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgdmlld0Zvckl0ZW06IChpdGVtKS0+XG4gICAgICB1bmxlc3MgaXRlbS5mYXZJY29uXG4gICAgICAgIGl0ZW0uZmF2SWNvbiA9IHdpbmRvdy5icC5qcy5nZXQoJ2JwLmZhdkljb24nKT9baXRlbS51cmxdXG4gICAgICBcIjxsaT48aW1nIHNyYz0nI3tpdGVtLmZhdkljb259J3dpZHRoPScyMCcgaGVpZ2h0PScyMCcgPiZuYnNwOyAmbmJzcDsgI3tpdGVtLnRpdGxlP1swLi4zMF19PC9saT5cIlxuXG4gIGNvbmZpcm1lZDogKGl0ZW0pLT5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gaXRlbS51cmwsIHtzcGxpdDonbGVmdCcsc2VhcmNoQWxsUGFuZXM6dHJ1ZX1cbiAgICAgIEBwYXJlbnQoKS5yZW1vdmUoKVxuXG4gIGNhbmNlbGxlZDogLT5cbiAgICBAcGFyZW50KCkucmVtb3ZlKClcblxuICBnZXRGaWx0ZXJLZXk6IC0+XG4gICAgXCJ0aXRsZVwiXG5tb2R1bGUuZXhwb3J0cyA9IEZhdlZpZXdcbiJdfQ==
