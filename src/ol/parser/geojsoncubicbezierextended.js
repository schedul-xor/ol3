goog.provide('ol.parser.GeoJSONCubicBezierExtended');

goog.require('ol.parser.GeoJSON');
goog.require('ol.parser.GeoJSON.GeometryType');
goog.require('ol.geom.CubicBezier');

ol.parser.GeoJSONCubicBezierExtended = function(){};
goog.inherits(ol.parser.GeoJSONCubicBezierExtended,ol.parser.GeoJSON);

/**
 * @param {GeoJSONFeature} json GeoJSON feature.
 * @param {ol.parser.ReadFeaturesOptions=} opt_options Read options.
 * @return {ol.Feature} Parsed feature.
 * @private
 * @override
 */
ol.parser.GeoJSONCubicBezierExtended.prototype.parseFeature_ = function(json, opt_options){
  var geomJson = json.geometry,
  geometry = null,
  options = opt_options || {};
  var feature = new ol.Feature(json.properties);
  if (goog.isDef(json.id)) {
    feature.setFeatureId(json.id);
  }
  if (geomJson) {
    var type = geomJson.type;
    var callback = options.callback;
    var sharedVertices;
    if (callback) {
      goog.asserts.assert(type in ol.parser.GeoJSONCubicBezierExtended.GeometryType,
                          'Bad geometry type: ' + type);
      sharedVertices = callback(feature, ol.parser.GeoJSONCubicBezierExtended.GeometryType[type]);
    }
    switch (type) {
    case 'Point':
      geometry = this.parsePoint_(geomJson, sharedVertices);
      break;
    case 'LineString':
      geometry = this.parseLineString_(geomJson, sharedVertices);
      break;
    case 'Polygon':
      geometry = this.parsePolygon_(geomJson, sharedVertices);
      break;
    case 'MultiPoint':
      geometry = this.parseMultiPoint_(geomJson, sharedVertices);
      break;
    case 'MultiLineString':
      geometry = this.parseMultiLineString_(geomJson, sharedVertices);
      break;
    case 'MultiPolygon':
      geometry = this.parseMultiPolygon_(geomJson, sharedVertices);
      break;
    case 'CubicBezier':
      geometry = this.parseCubicBezier_(geomJson,sharedVertices);
      break;
    default:
      throw new Error('Bad geometry type: ' + type);
    }
    feature.setGeometry(geometry);
  }
  return feature;
};

/**
 * @private
 * @param {GeoJSONGeometry} json Fake GeoJSON string (GeoJSON doesn't define Bezier curves)
 * @return {ol.geom.CubicBezier}
 */
ol.parser.GeoJSONCubicBezierExtended.prototype.parseCubicBezier_ = function(json,opt_vertices){
  return new ol.geom.CubicBezier(json.coordinates,opt_vertices);
};



/**
 * @enum {ol.parser.GeoJSONCubicBezierExtended.GeometryType}
 */
ol.parser.GeoJSONCubicBezierExtended.GeometryType = {
  'Point': ol.geom.GeometryType.POINT,
  'LineString': ol.geom.GeometryType.LINESTRING,
  'Polygon': ol.geom.GeometryType.POLYGON,
  'MultiPoint': ol.geom.GeometryType.MULTIPOINT,
  'MultiLineString': ol.geom.GeometryType.MULTILINESTRING,
  'MultiPolygon': ol.geom.GeometryType.MULTIPOLYGON,
  'GeometryCollection': ol.geom.GeometryType.GEOMETRYCOLLECTION,
  'CubicBezier':ol.geom.GeometryType.CUBICBEZIER
};
