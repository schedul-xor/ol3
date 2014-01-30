goog.require('goog.array');
goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.RendererHint');
goog.require('ol.View2D');
goog.require('ol.control');
goog.require('ol.geom.CubicBezier');
goog.require('ol.geom.LineString');
goog.require('ol.geom.Point');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');
goog.require('ol.style.Circle');
goog.require('ol.style.Fill');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');



var styleArray = [
  new ol.style.Style({
    fill: new ol.style.Fill({
      color: '#013'
    }),
    stroke: new ol.style.Stroke({
      color: '#000',
      width: 1
    })
  })
];

var vectorSource = new ol.source.Vector();
vectorSource.addFeature(new ol.Feature(new ol.geom.CubicBezier([
  [0, -10000000], [10000000, 5000000],
  [-19000000, 0], [0, 10000000]])));

var vector = new ol.layer.Vector({
  styleFunction: function(feature, resolution) {
    return styleArray;
  },
  source: vectorSource
});

var map = new ol.Map({
  layers: [vector],
  controls: ol.control.defaults({
    attribution: false
  }),
  renderer: ol.RendererHint.CANVAS,
  target: 'map',
  view: new ol.View2D({
    center: [0, 0],
    zoom: 1
  })
});

var point = null;
var line = null;
var displaySnap = function(coordinate) {
  var closestFeature = vectorSource.getClosestFeatureToCoordinate(coordinate);
  if (closestFeature === null) {
    point = null;
    line = null;
  }else {
    var geometry = closestFeature.getGeometry();
    var closestPoint = geometry.getClosestPoint(coordinate);
    if (point === null) {
      point = new ol.geom.Point(closestPoint);
    }else {
      point.setCoordinates(closestPoint);
    }
    var lineParams = [coordinate, closestPoint];
    if (line === null) {
      line = new ol.geom.LineString(lineParams);
    }else {
      line.setCoordinates(lineParams);
    }
  }
  map.requestRenderFrame();
};

$(map.getViewport()).on('mousemove', function(evt) {
  var coordinate = map.getEventCoordinate(evt.originalEvent);
  displaySnap(coordinate);
});

var imageStyle = new ol.style.Circle({
  radius: 5,
  fill: null,
  stroke: new ol.style.Stroke({
    color: 'rgba(255,0,0,0.9)',
    width: 1
  })
});
var strokeStyle = new ol.style.Stroke({
  color: 'rgba(255,0,0,0.9)',
  width: 1
});
map.on('postcompose', function(evt) {
  var render = evt.render;
  if (point !== null) {
    render.setImageStyle(imageStyle);
    render.drawPointGeometry(point);
  }
  if (line !== null) {
    render.setFillStrokeStyle(null, strokeStyle);
    render.drawLineStringGeometry(line);
  }
});
