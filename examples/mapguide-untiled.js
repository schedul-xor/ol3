goog.require('ol.Map');
goog.require('ol.View2D');
goog.require('ol.layer.Image');
goog.require('ol.source.MapGuide');

var mdf = 'Library://Samples/Sheboygan/Maps/Sheboygan.MapDefinition';
var agentUrl =
    'http://data.mapguide.com/mapguide/mapagent/mapagent.fcgi?USERNAME=Anonymous';
var bounds = [
  -87.865114442365922,
  43.665065564837931,
  -87.595394059497067,
  43.823852564430069
];
var map = new ol.Map({
  layers: [
    new ol.layer.Image({
      source: new ol.source.MapGuide({
        projection: 'EPSG:4326',
        url: agentUrl,
        useOverlay: false,
        metersPerUnit: 111319.4908, //value returned from mapguide
        params: {
          MAPDEFINITION: mdf,
          FORMAT: 'PNG'
        },
        ratio: 2,
        extent: bounds
      })
    })
  ],
  target: 'map',
  view: new ol.View2D({
    center: [-87.7302542509315, 43.744459064634],
    projection: 'EPSG:4326',
    zoom: 12
  })
});
