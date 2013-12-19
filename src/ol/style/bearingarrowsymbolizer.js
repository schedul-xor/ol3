goog.provide('ol.style.BearingArrow');

goog.require('goog.asserts');
goog.require('ol.Feature');
goog.require('ol.expr');
goog.require('ol.expr.Expression');
goog.require('ol.expr.Literal');
goog.require('ol.style.BearingArrowLiteral');
goog.require('ol.style.Fill');
goog.require('ol.style.Point');
goog.require('ol.style.Stroke');



/**
 * @constructor
 * @extends {ol.style.Point}
 * @param {olx.style.BearingArrowOptions} options BearingArrow options.
 */
ol.style.BearingArrow = function(options) {

  /**
   * @type {ol.expr.Expression}
   * @private
   */
  this.size_ = !goog.isDefAndNotNull(options.size) ?
      new ol.expr.Literal(ol.style.BearingArrowDefaults.size) :
      (options.size instanceof ol.expr.Expression) ?
          options.size : new ol.expr.Literal(options.size);

  /**
   * @type {ol.expr.Expression}
   * @private
   */
  this.bearing_ = !goog.isDefAndNotNull(options.bearing) ?
      new ol.expr.Literal(ol.style.BearingArrowDefaults.bearing) :
      (options.bearing instanceof ol.expr.Expression) ?
          options.bearing : new ol.expr.Literal(options.bearing);

  /**
   * @type {ol.expr.Expression}
   * @private
   */
  this.arrowLength_ = !goog.isDefAndNotNull(options.arrowLength) ?
      new ol.expr.Literal(ol.style.BearingArrowDefaults.arrowLength) :
      (options.arrowLength instanceof ol.expr.Expression) ?
          options.arrowLength : new ol.expr.Literal(options.arrowLength);

  /**
   * @type {ol.style.Fill}
   * @private
   */
  this.fill_ = goog.isDefAndNotNull(options.fill) ? options.fill : null;

  /**
   * @type {ol.style.Stroke}
   * @private
   */
  this.stroke_ = goog.isDefAndNotNull(options.stroke) ? options.stroke : null;

  // one of stroke or fill can be null, both null is user error
  goog.asserts.assert(this.fill_ || this.stroke_,
      'Stroke or fill must be provided');
};


/**
 * @inheritDoc
 * @return {ol.style.BearingArrowLiteral} Literal bearingArrow symbolizer.
 */
ol.style.BearingArrow.prototype.createLiteral = function(featureOrType) {
  var feature, type;
  if (featureOrType instanceof ol.Feature) {
    feature = featureOrType;
    var geometry = feature.getGeometry();
    type = geometry ? geometry.getType() : null;
  } else {
    type = featureOrType;
  }

  var size = Number(ol.expr.evaluateFeature(this.size_, feature));
  goog.asserts.assert(!isNaN(size), 'size must be a number');

  var bearing = Number(ol.expr.evaluateFeature(this.bearing_, feature));
  goog.asserts.assert(!isNaN(bearing), 'bearing must be a number');

  var arrowLength = Number(ol.expr.evaluateFeature(this.arrowLength_, feature));
  goog.asserts.assert(!isNaN(arrowLength), 'arrowLength must be a number');

  var fillColor, fillOpacity;
  if (!goog.isNull(this.fill_)) {
    fillColor = ol.expr.evaluateFeature(this.fill_.getColor(), feature);
    goog.asserts.assertString(
        fillColor, 'fillColor must be a string');
    fillOpacity = Number(ol.expr.evaluateFeature(
        this.fill_.getOpacity(), feature));
    goog.asserts.assert(!isNaN(fillOpacity), 'fillOpacity must be a number');
  }

  var strokeColor, strokeOpacity, strokeWidth;
  if (!goog.isNull(this.stroke_)) {
    strokeColor = ol.expr.evaluateFeature(this.stroke_.getColor(), feature);
    goog.asserts.assertString(
        strokeColor, 'strokeColor must be a string');
    strokeOpacity = Number(ol.expr.evaluateFeature(
        this.stroke_.getOpacity(), feature));
    goog.asserts.assert(!isNaN(strokeOpacity),
        'strokeOpacity must be a number');
    strokeWidth = Number(ol.expr.evaluateFeature(
        this.stroke_.getWidth(), feature));
    goog.asserts.assert(!isNaN(strokeWidth), 'strokeWidth must be a number');
  }

  return new ol.style.BearingArrowLiteral({
    size: size,
    fillColor: fillColor,
    fillOpacity: fillOpacity,
    strokeColor: strokeColor,
    strokeOpacity: strokeOpacity,
    strokeWidth: strokeWidth,
    bearing: bearing,
    arrowLength: arrowLength
  });
};


/**
 * Get the fill.
 * @return {ol.style.Fill} Shape fill.
 */
ol.style.BearingArrow.prototype.getFill = function() {
  return this.fill_;
};


/**
 * Get the bearingArrow size.
 * @return {ol.expr.Expression} BearingArrow size.
 */
ol.style.BearingArrow.prototype.getSize = function() {
  return this.size_;
};


/**
 * Get the stroke.
 * @return {ol.style.Stroke} Shape stroke.
 */
ol.style.BearingArrow.prototype.getStroke = function() {
  return this.stroke_;
};


/**
 * @return {ol.expr.Expression} Bearing.
 */
ol.style.BearingArrow.prototype.getBearing = function() {
  return this.bearing_;
};


/**
 * @return {ol.expr.Expression} ArrowLength.
 */
ol.style.BearingArrow.prototype.getArrowLength = function() {
  return this.arrowLength_;
};


/**
 * Set the fill.
 * @param {ol.style.Fill} fill Shape fill.
 */
ol.style.BearingArrow.prototype.setFill = function(fill) {
  if (!goog.isNull(fill)) {
    goog.asserts.assertInstanceof(fill, ol.style.Fill);
  }
  this.fill_ = fill;
};


/**
 * Set the bearingArrow size.
 * @param {ol.expr.Expression} size BearingArrow size.
 */
ol.style.BearingArrow.prototype.setSize = function(size) {
  goog.asserts.assertInstanceof(size, ol.expr.Expression);
  this.size_ = size;
};


/**
 * Set the stroke.
 * @param {ol.style.Stroke} stroke Shape stroke.
 */
ol.style.BearingArrow.prototype.setStroke = function(stroke) {
  if (!goog.isNull(stroke)) {
    goog.asserts.assertInstanceof(stroke, ol.style.Stroke);
  }
  this.stroke_ = stroke;
};


/**
 * @param {ol.expr.Expression} bearing Bearing.
 */
ol.style.BearingArrow.prototype.setBearing = function(bearing) {
  this.bearing_ = bearing;
};


/**
 * @param {ol.expr.Expression} arrowLength ArrowLength.
 */
ol.style.BearingArrow.prototype.setArrowLength = function(arrowLength) {
  this.arrowLength_ = arrowLength;
};


/**
 * @type {ol.style.BearingArrowLiteral}
 */
ol.style.BearingArrowDefaults = new ol.style.BearingArrowLiteral({
  size: 5,
  fillColor: '#ffffff',
  fillOpacity: 1,
  strokeColor: '#696969',
  strokeOpacity: 1,
  strokeWidth: 1.5,
  bearing: 0,
  arrowLength: 20
});
