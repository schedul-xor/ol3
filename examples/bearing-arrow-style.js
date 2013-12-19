goog.require('ol.Feature');
goog.require('ol.Map');
goog.require('ol.RendererHint');
goog.require('ol.View2D');
goog.require('ol.expr');
goog.require('ol.geom.Point');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');
goog.require('ol.style.BearingArrow');
goog.require('ol.style.Fill');
goog.require('ol.style.Rule');
goog.require('ol.style.Stroke');
goog.require('ol.style.Style');
goog.require('ol.style.Text');


var style = new ol.style.Style({rules: [
  new ol.style.Rule({
    filter: 'geometryType("Point")',
    symbolizers: [
      new ol.style.BearingArrow({
        bearing: ol.expr.parse('bearing'),
        size: 5,
        arrowLength: 60,
        fill: new ol.style.Fill({color: '#666666', opacity: 1})
      }),
      new ol.style.Stroke({
        color: 'white',
        width: 3
      }),
      new ol.style.Text({
        color: '#bada55',
        text: ol.expr.parse('label'),
        fontFamily: 'Calibri,sans-serif',
        fontSize: 14
      })
    ]
  })
]});

var vector = new ol.layer.Vector({
  style: style,
  source: new ol.source.Vector({
    features: [
      new ol.Feature({
        color: '#bada55',
        geometry: new ol.geom.Point([0, 0]),
        bearing: 40 * Math.PI / 180,
        label: 'from here'
      })
    ]
  })
});

var map = new ol.Map({
  layers: [vector],
  renderer: ol.RendererHint.CANVAS,
  target: 'map',
  view: new ol.View2D({
    center: [0, 0],
    zoom: 1
  })
});
