if (typeof mapbox === 'undefined') mapbox = {};


// a `mapbox.map` is a modestmaps object with the
// easey handlers as defaults
mapbox.map = function(el, layer) {
    var m = new MM.Map(el, layer, null, [
            easey.TouchHandler(),
            easey.DragHandler(),
            easey.DoubleClickHandler(),
            easey.MouseWheelHandler()
        ]);

    // Attach easey, ui, and interaction
    m.ease = easey().map(m);
    m.ui = mapbox.ui().map(m);
    m.interaction = mapbox.interaction().map(m);


    // Autoconfigure map with sensible defaults
    m.auto = function() {
        this.ui.auto();
        this.interaction.auto();

        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].tilejson) {
                var tj = this.layers[i].tilejson(),
                    center = tj.center || new MM.Location(0, 0),
                    zoom = tj.zoom || 0;
                this.setCenterZoom(center, zoom);
                break;
            }
        }
        return this;
    }

    var smooth_handlers = [
        easey.TouchHandler,
        easey.DragHandler,
        easey.DoubleClickHandler,
        easey.MouseWheelHandler
    ];

    var default_handlers = [
        MM.TouchHandler,
        MM.DragHandler,
        MM.DoubleClickHandler,
        MM.MouseWheelHandler
    ];

    MM.Map.prototype.smooth = function(_) {
        while (this.eventHandlers.length) {
            this.eventHandlers.pop().remove();
        }

        var handlers = _ ? smooth_handlers : default_handlers;
        for (var j = 0; j < handlers.length; j++) {
            var h = handlers[j]();
            this.eventHandlers.push(h);
            h.init(this);
        }
        return this;
    };


    m.setPanLimits = function(locations) {
        if (locations instanceof MM.Extent) {
            locations = locations.toArray();
        }
        this.coordLimits = [
            this.locationCoordinate(locations[0]).zoomTo(this.coordLimits[0].zoom),
            this.locationCoordinate(locations[1]).zoomTo(this.coordLimits[1].zoom)
        ];
        return this;
    };


    m.center = function(location, animate) {
        if (location && animate) {
            this.ease.location(location).zoom(this.zoom())
                .optimal(null, null, animate.callback);
        } else {
            return MM.Map.prototype.center.call(this, location);
        }
    };

    m.zoom = function(zoom, animate) {
        if (zoom !== undefined && animate) {
            this.ease.to(this.coordinate).zoom(zoom).run(600);
        } else {
            return MM.Map.prototype.zoom.call(this, zoom);
        }
    };

    m.centerzoom = function(location, zoom, animate) {
        if (location && zoom !== undefined && animate) {
            this.ease.location(location).zoom(zoom).optimal(null, null, animate.callback);
        } else if (location && zoom !== undefined) {
            return this.setCenterZoom(location, zoom);
        }
    };

    return m;
};

this.mapbox = mapbox;