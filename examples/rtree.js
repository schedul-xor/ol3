goog.require('goog.dom');
goog.require('ol.Map');
goog.require('ol.RendererHints');
goog.require('ol.View2D');
goog.require('ol.control.MousePosition');
goog.require('ol.control.defaults');
goog.require('ol.coordinate');
goog.require('ol.dom.Input');
goog.require('ol.ellipsoid.WGS84');
goog.require('ol.layer.TileLayer');
goog.require('ol.layer.Vector');
goog.require('ol.parser.GeoJSON');
goog.require('ol.proj');
goog.require('ol.source.OSM');
goog.require('ol.source.Vector');
goog.require('ol.style.Rule');
goog.require('ol.style.Shape');
goog.require('ol.style.Style');
goog.require('ol.style.Text');

var mousePositionControl = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:4326',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
  undefinedHTML: '&nbsp;'
});

var style = new ol.style.Style({
  rules:[new ol.style.Rule({
    filter:'geometryType("point")',
    symbolizers: [
      new ol.style.Shape({
        size: 40,
        fillColor: '#ffffff'
      }),
      new ol.style.Text({
        color: '#333333',
        text: ol.expr.parse('name'),
        fontFamily: 'Calibri,sans-serif',
        fontSize: 10
      })
    ]
  })]
});
var landmarksSource = new ol.source.Vector({
  parser: new ol.parser.GeoJSON(),
  projection: ol.proj.get('EPSG:4326'),
  data:{
    'type':'FeatureCollection',
    'features':[{
      'type':'Feature',
      'properties':{'name':'Burj Khalifa'},
      'geometry':{
        'type':'Point',
        'coordinates':[55.274111, 25.197139]
      }
    },{
      'type':'Feature',
      'properties':{'name':'Tokyo Skytree'},
      'geometry':{
        'type':'Point',
        'coordinates':[139.810833, 35.710139]
      }
    },{
      'type':'Feature',
      'properties':{'name':'Abraj Al Bait'},
      'geometry':{
        'type':'Point',
        'coordinates':[39.826389, 21.418889]
      }
    },{
      'type':'Feature',
      'properties':{'name':'Willis Tower'},
      'geometry':{
        'type':'Point',
        'coordinates':[-87.6358, 41.8789]
      }
    },{
      'type':'Feature',
      'properties':{'name':'Taipei 101'},
      'geometry':{
        'type':'Point',
        'coordinates':[121.565,25.033611]
      }
    },{
      'type':'Feature',
      'properties':{'name':'Shanghai World Financial Center'},
      'geometry':{
        'type':'Point',
        'coordinates':[121.502778,31.236667]
      }
    },{
      'type':'Feature',
      'properties':{'name':'International Commerce Centre'},
      'geometry':{
        'type':'Point',
        'coordinates':[114.160169,22.303392]
      }
    },{
      'type':'Feature',
      'properties':{'name':'John Hancock Center'},
      'geometry':{
        'type':'Point',
        'coordinates':[-87.623,41.8988]
      }
    },{
      'type':'Feature',
      'properties':{'name':'Petronas Towers'},
      'geometry':{
        'type':'Point',
        'coordinates':[101.71165,3.15785]
      }
    },{
      'type':'Feature',
      'properties':{'name':'Zifeng Tower'},
      'geometry':{
        'type':'Point',
        'coordinates':[118.778056,32.062472]
      }
    },{
      'type':'Feature',
      'properties':{'name':'Empire state building'},
      'geometry':{
        'type':'Point',
        'coordinates':[-73.985833, 40.748417]
      }
    },{
      'type':'Feature',
      'properties':{'name':'Eiffel Tower'},
      'geometry':{
        'type':'Point',
        'coordinates':[2.2945, 48.858222]
      }
    }
               ]
  }
});
var landmarksLayer = new ol.layer.Vector({
  style: style,
  source: landmarksSource
});
var map = new ol.Map({
  controls: ol.control.defaults({}, [mousePositionControl]),
  layers: [
    new ol.layer.TileLayer({
      source: new ol.source.OSM()
    }),
    landmarksLayer
  ],
  renderer: ol.RendererHint.CANVAS,
  target: 'map',
  view: new ol.View2D({
    center: [0, 0],
    zoom: 2
  })
});

var transformFrom3857to4326 = ol.proj.getTransform('EPSG:3857','EPSG:4326');
var landmarkPlaceholder = goog.dom.$('nearest-landmark');

var handleMouseMove = function(browserEvent){
  var eventPosition = goog.style.getRelativePosition(
      browserEvent, map.getViewport());
  var b3857 = map.getCoordinateFromPixel([eventPosition.x, eventPosition.y]);
  var nearestPoints = landmarksLayer.featureCache_.rTree_.getNearestKPointsFrom(b3857,function(x1,y1,x2,y2){
    var dx = x1-x2;
    var dy = y1-y2;
    return dx*dx+dy*dy;
  },1);
  var nearestPoint = nearestPoints[0].leaf;
  var nearestGeometry = nearestPoint.values_.geometry;
  var tlng3857 = nearestGeometry.getBounds()[0];
  var tlat3857 = nearestGeometry.getBounds()[2];
  var t3857 = [tlng3857,tlat3857];
  var t4326 = transformFrom3857to4326(t3857);
  var b4326 = transformFrom3857to4326(b3857);
  var vin = ol.ellipsoid.WGS84.vincenty(t4326,b4326);
  
  landmarkPlaceholder.innerHTML = 'Nearest landmark : '+nearestPoint.values_.name + ' ('+Math.floor(vin.distance/1000)+' km)';
};
var viewport = map.getViewport();
goog.events.listen(viewport, goog.events.EventType.MOUSEMOVE,
                   handleMouseMove, false, this);

