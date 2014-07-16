goog.require('goog.array');
goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.View');
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

var p1 = [0, -10000000];
var p2 = [10000000, 5000000];
var p3 = [-19000000, 0];
var p4 = [0, 10000000];
var p5 = [10000000, -1000000];
var p6 = [1000000, 5000000];
var p7 = [-1900000, 0];
var p8 = [-2000000, -10000000];
var l1 = [p1, p2, p3, p4];
var l2 = [p5, p6, p7, p8];

var vectorSource = new ol.source.Vector();
vectorSource.addFeature(new ol.Feature(new ol.geom.CubicBezier(l1)));
vectorSource.addFeature(new ol.Feature(new ol.geom.CubicBezier(l2)));
vectorSource.addFeature(new ol.Feature(new ol.geom.LineString(l1)));
vectorSource.addFeature(new ol.Feature(new ol.geom.LineString(l2)));

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
  target: 'map',
  view: new ol.View({
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
