goog.provide('ol.style.BearingArrow');
goog.provide('ol.style.BearingArrowLiteral');
goog.provide('ol.style.BearingArrowType');

goog.require('goog.asserts');
goog.require('ol.expr');
goog.require('ol.expr.Expression');
goog.require('ol.expr.Literal');
goog.require('ol.style.Point');
goog.require('ol.style.PointLiteral');


/**
 * @typedef {{size: (number),
 *            fillColor: (string|undefined),
 *            fillOpacity: (number|undefined),
 *            strokeColor: (string|undefined),
 *            strokeOpacity: (number|undefined),
 *            strokeWidth: (number|undefined),
 *            bearing: (number|undefined),
 *            arrowLength: (number|undefined) }}
 */
ol.style.BearingArrowLiteralOptions;



/**
 * @constructor
 * @extends {ol.style.PointLiteral}
 * @param {ol.style.BearingArrowLiteralOptions} options BearingArrow literal options.
 */
ol.style.BearingArrowLiteral = function(options) {

  goog.asserts.assertNumber(options.size, 'size must be a number');
  /** @type {number} */
  this.size = options.size;

  /** @type {string|undefined} */
  this.fillColor = options.fillColor;
  if (goog.isDef(options.fillColor)) {
    goog.asserts.assertString(options.fillColor, 'fillColor must be a string');
  }

  /** @type {number|undefined} */
  this.fillOpacity = options.fillOpacity;
  if (goog.isDef(options.fillOpacity)) {
    goog.asserts.assertNumber(
        options.fillOpacity, 'fillOpacity must be a number');
  }

  /** @type {string|undefined} */
  this.strokeColor = options.strokeColor;
  if (goog.isDef(this.strokeColor)) {
    goog.asserts.assertString(
        this.strokeColor, 'strokeColor must be a string');
  }

  /** @type {number|undefined} */
  this.strokeOpacity = options.strokeOpacity;
  if (goog.isDef(this.strokeOpacity)) {
    goog.asserts.assertNumber(
        this.strokeOpacity, 'strokeOpacity must be a number');
  }

  /** @type {number|undefined} */
  this.strokeWidth = options.strokeWidth;
  if (goog.isDef(this.strokeWidth)) {
    goog.asserts.assertNumber(
        this.strokeWidth, 'strokeWidth must be a number');
  }

  /** @type {number|undefined} */
  this.bearing = options.bearing;
  if (goog.isDef(this.bearing)) {
    goog.asserts.assertNumber(
        this.bearing, 'bearing must be a number');
  }

  /** @type {number|undefined} */
  this.arrowLength = options.arrowLength;
  if (goog.isDef(this.arrowLength)) {
    goog.asserts.assertNumber(
        this.arrowLength, 'arrowLength must be a number');
  }

  // fill and/or stroke properties must be defined
  var fillDef = goog.isDef(this.fillColor) && goog.isDef(this.fillOpacity);
  var strokeDef = goog.isDef(this.strokeColor) &&
      goog.isDef(this.strokeOpacity) &&
      goog.isDef(this.strokeWidth);
  goog.asserts.assert(fillDef || strokeDef,
      'Either fillColor and fillOpacity or ' +
      'strokeColor and strokeOpacity and strokeWidth must be set');

};
goog.inherits(ol.style.BearingArrowLiteral, ol.style.PointLiteral);


/**
 * @inheritDoc
 */
ol.style.BearingArrowLiteral.prototype.equals = function(bearingArrowLiteral) {
  return this.size == bearingArrowLiteral.size &&
        this.fillColor == bearingArrowLiteral.fillColor &&
        this.fillOpacity == bearingArrowLiteral.fillOpacity &&
        this.strokeColor == bearingArrowLiteral.strokeColor &&
        this.strokeOpacity == bearingArrowLiteral.strokeOpacity &&
        this.strokeWidth == bearingArrowLiteral.strokeWidth &&
        this.bearing == bearingArrowLiteral.bearing &&
        this.arrowLength == bearingArrowLiteral.arrowLength;
};



/**
 * @constructor
 * @extends {ol.style.Point}
 * @param {ol.style.BearingArrowOptions} options BearingArrow options.
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

  // fill handling - if any fill property is supplied, use all defaults
  var fillColor = null,
      fillOpacity = null;

  if (goog.isDefAndNotNull(options.fillColor) ||
      goog.isDefAndNotNull(options.fillOpacity)) {

    if (goog.isDefAndNotNull(options.fillColor)) {
      fillColor = (options.fillColor instanceof ol.expr.Expression) ?
          options.fillColor :
          new ol.expr.Literal(options.fillColor);
    } else {
      fillColor = new ol.expr.Literal(
          /** @type {string} */ (ol.style.BearingArrowDefaults.fillColor));
    }

    if (goog.isDefAndNotNull(options.fillOpacity)) {
      fillOpacity = (options.fillOpacity instanceof ol.expr.Expression) ?
          options.fillOpacity :
          new ol.expr.Literal(options.fillOpacity);
    } else {
      fillOpacity = new ol.expr.Literal(
          /** @type {number} */ (ol.style.BearingArrowDefaults.fillOpacity));
    }

  }

  /**
   * @type {ol.expr.Expression}
   * @private
   */
  this.fillColor_ = fillColor;

  /**
   * @type {ol.expr.Expression}
   * @private
   */
  this.fillOpacity_ = fillOpacity;


  // stroke handling - if any stroke property is supplied, use defaults
  var strokeColor = null,
      strokeOpacity = null,
      strokeWidth = null;

  if (goog.isDefAndNotNull(options.strokeColor) ||
      goog.isDefAndNotNull(options.strokeOpacity) ||
      goog.isDefAndNotNull(options.strokeWidth)) {

    if (goog.isDefAndNotNull(options.strokeColor)) {
      strokeColor = (options.strokeColor instanceof ol.expr.Expression) ?
          options.strokeColor :
          new ol.expr.Literal(options.strokeColor);
    } else {
      strokeColor = new ol.expr.Literal(
          /** @type {string} */ (ol.style.BearingArrowDefaults.strokeColor));
    }

    if (goog.isDefAndNotNull(options.strokeOpacity)) {
      strokeOpacity = (options.strokeOpacity instanceof ol.expr.Expression) ?
          options.strokeOpacity :
          new ol.expr.Literal(options.strokeOpacity);
    } else {
      strokeOpacity = new ol.expr.Literal(
          /** @type {number} */ (ol.style.BearingArrowDefaults.strokeOpacity));
    }

    if (goog.isDefAndNotNull(options.strokeWidth)) {
      strokeWidth = (options.strokeWidth instanceof ol.expr.Expression) ?
          options.strokeWidth :
          new ol.expr.Literal(options.strokeWidth);
    } else {
      strokeWidth = new ol.expr.Literal(
          /** @type {number} */ (ol.style.BearingArrowDefaults.strokeWidth));
    }

  }
  
  var bearing;
  if (goog.isDefAndNotNull(options.bearing)) {
    bearing = (options.bearing instanceof ol.expr.Expression) ?
          options.bearing :
          new ol.expr.Literal(options.bearing);
  } else {
      bearing = new ol.expr.Literal(
        /** @type {number} */ (ol.style.BearingArrowDefaults.bearing));
  }
  
  var arrowLength;
  if (goog.isDefAndNotNull(options.arrowLength)) {
    arrowLength = (options.arrowLength instanceof ol.expr.Expression) ?
          options.arrowLength :
          new ol.expr.Literal(options.arrowLength);
  } else {
      arrowLength = new ol.expr.Literal(
        /** @type {number} */ (ol.style.BearingArrowDefaults.arrowLength));
  }
  

  /**
   * @type {ol.expr.Expression}
   * @private
   */
  this.strokeColor_ = strokeColor;

  /**
   * @type {ol.expr.Expression}
   * @private
   */
  this.strokeOpacity_ = strokeOpacity;

  /**
   * @type {ol.expr.Expression}
   * @private
   */
  this.strokeWidth_ = strokeWidth;
  
  /**
   * @type {ol.expr.Expression}
   * @private
   */
  this.bearing_ = bearing;
  
  /**
   * @type {ol.expr.Expression}
   * @private
   */
  this.arrowLength_ = arrowLength;

  // one of stroke or fill can be null, both null is user error
  var fill = !goog.isNull(this.fillColor_) && !goog.isNull(this.fillOpacity_);
  var stroke = !goog.isNull(this.strokeColor_) &&
      !goog.isNull(this.strokeOpacity_) &&
      !goog.isNull(this.strokeWidth_);
  goog.asserts.assert(fill || stroke,
      'Stroke or fill properties must be provided');

};


/**
 * @inheritDoc
 * @return {ol.style.BearingArrowLiteral} Literal bearingArrow symbolizer.
 */
ol.style.BearingArrow.prototype.createLiteral = function(opt_feature) {

  var size = ol.expr.evaluateFeature(this.size_, opt_feature);
  goog.asserts.assertNumber(size, 'size must be a number');

  var fillColor;
  if (!goog.isNull(this.fillColor_)) {
    fillColor = ol.expr.evaluateFeature(this.fillColor_, opt_feature);
    goog.asserts.assertString(fillColor, 'fillColor must be a string');
  }

  var fillOpacity;
  if (!goog.isNull(this.fillOpacity_)) {
    fillOpacity = ol.expr.evaluateFeature(this.fillOpacity_, opt_feature);
    goog.asserts.assertNumber(fillOpacity, 'fillOpacity must be a number');
  }

  var strokeColor;
  if (!goog.isNull(this.strokeColor_)) {
    strokeColor = ol.expr.evaluateFeature(this.strokeColor_, opt_feature);
    goog.asserts.assertString(strokeColor, 'strokeColor must be a string');
  }

  var strokeOpacity;
  if (!goog.isNull(this.strokeOpacity_)) {
    strokeOpacity = ol.expr.evaluateFeature(this.strokeOpacity_, opt_feature);
    goog.asserts.assertNumber(strokeOpacity, 'strokeOpacity must be a number');
  }

  var strokeWidth;
  if (!goog.isNull(this.strokeWidth_)) {
    strokeWidth = ol.expr.evaluateFeature(this.strokeWidth_, opt_feature);
    goog.asserts.assertNumber(strokeWidth, 'strokeWidth must be a number');
  }

  var fill = goog.isDef(fillColor) && goog.isDef(fillOpacity);
  var stroke = goog.isDef(strokeColor) && goog.isDef(strokeOpacity) &&
      goog.isDef(strokeWidth);

  goog.asserts.assert(fill || stroke,
      'either fill or stroke properties must be defined');

  var bearing;
  if (!goog.isNull(this.bearing_)) {
    bearing = ol.expr.evaluateFeature(this.bearing_, opt_feature);
    goog.asserts.assertNumber(bearing, 'bearing must be a number');
  }

  var arrowLength;
  if (!goog.isNull(this.arrowLength_)) {
    arrowLength = ol.expr.evaluateFeature(this.arrowLength_, opt_feature);
    goog.asserts.assertNumber(arrowLength, 'arrowLength must be a number');
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
 * Get the fill color.
 * @return {ol.expr.Expression} Fill color.
 */
ol.style.BearingArrow.prototype.getFillColor = function() {
  return this.fillColor_;
};


/**
 * Get the fill opacity.
 * @return {ol.expr.Expression} Fill opacity.
 */
ol.style.BearingArrow.prototype.getFillOpacity = function() {
  return this.fillOpacity_;
};


/**
 * Get the bearingArrow size.
 * @return {ol.expr.Expression} BearingArrow size.
 */
ol.style.BearingArrow.prototype.getSize = function() {
  return this.size_;
};


/**
 * Get the stroke color.
 * @return {ol.expr.Expression} Stroke color.
 */
ol.style.BearingArrow.prototype.getStrokeColor = function() {
  return this.strokeColor_;
};


/**
 * Get the stroke opacity.
 * @return {ol.expr.Expression} Stroke opacity.
 */
ol.style.BearingArrow.prototype.getStrokeOpacity = function() {
  return this.strokeOpacity_;
};


/**
 * Get the stroke width.
 * @return {ol.expr.Expression} Stroke width.
 */
ol.style.BearingArrow.prototype.getStrokeWidth = function() {
  return this.strokeWidth_;
};


/**
 * @return {ol.expr.Expression} Bearing.
 */
ol.style.BearingArrow.prototype.getBearing = function(){
  return this.bearing_;
};

/**
 * @return {ol.expr.Expression} ArrowLength.
 */
ol.style.BearingArrow.prototype.getArrowLength = function(){
  return this.arrowLength_;
};


/**
 * Set the fill color.
 * @param {ol.expr.Expression} fillColor Fill color.
 */
ol.style.BearingArrow.prototype.setFillColor = function(fillColor) {
  goog.asserts.assertInstanceof(fillColor, ol.expr.Expression);
  this.fillColor_ = fillColor;
};


/**
 * Set the fill opacity.
 * @param {ol.expr.Expression} fillOpacity Fill opacity.
 */
ol.style.BearingArrow.prototype.setFillOpacity = function(fillOpacity) {
  goog.asserts.assertInstanceof(fillOpacity, ol.expr.Expression);
  this.fillOpacity_ = fillOpacity;
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
 * Set the stroke color.
 * @param {ol.expr.Expression} strokeColor Stroke color.
 */
ol.style.BearingArrow.prototype.setStrokeColor = function(strokeColor) {
  goog.asserts.assertInstanceof(strokeColor, ol.expr.Expression);
  this.strokeColor_ = strokeColor;
};


/**
 * Set the stroke opacity.
 * @param {ol.expr.Expression} strokeOpacity Stroke opacity.
 */
ol.style.BearingArrow.prototype.setStrokeOpacity = function(strokeOpacity) {
  goog.asserts.assertInstanceof(strokeOpacity, ol.expr.Expression);
  this.strokeOpacity_ = strokeOpacity;
};


/**
 * Set the stroke width.
 * @param {ol.expr.Expression} strokeWidth Stroke width.
 */
ol.style.BearingArrow.prototype.setStrokeWidth = function(strokeWidth) {
  goog.asserts.assertInstanceof(strokeWidth, ol.expr.Expression);
  this.strokeWidth_ = strokeWidth;
};


/**
 * @param {ol.expr.Expression} bearing Bearing.
 */
ol.style.BearingArrow.prototype.setBearing = function(bearing){
  this.bearing_ = bearing;
};

/**
 * @param {ol.expr.Expression} arrowLength ArrowLength.
 */
ol.style.BearingArrow.prototype.setArrowLength = function(arrowLength){
  this.arrowLength_ = arrowLength;
};


/**
 * @type {ol.style.BearingArrowLiteral}
 */
ol.style.BearingArrowDefaults = new ol.style.BearingArrowLiteral({
  size: 5,
  fillColor: '#ffffff',
  fillOpacity: 0.4,
  strokeColor: '#696969',
  strokeOpacity: 0.8,
  strokeWidth: 1.5,
  bearing: 0,
  arrowLength: 20
});
