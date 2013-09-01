goog.provide('ol.style.BearingArrowLiteral');
goog.provide('ol.style.BearingArrowType');

goog.require('goog.asserts');
goog.require('ol.style.PointLiteral');


/**
 * @typedef {{size: (number),
 *            bearing: (number),
 *            arrowLength: (number),
 *            fillColor: (string|undefined),
 *            fillOpacity: (number|undefined),
 *            strokeColor: (string|undefined),
 *            strokeOpacity: (number|undefined),
 *            strokeWidth: (number|undefined)}}
 */
ol.style.BearingArrowLiteralOptions;



/**
 * @constructor
 * @extends {ol.style.PointLiteral}
 * @param {ol.style.BearingArrowLiteralOptions} options
 * BearingArrow options.
 */
ol.style.BearingArrowLiteral = function(options) {

  goog.asserts.assertNumber(options.size, 'size must be a number');
  /** @type {number} */
  this.size = options.size;

  /** @type {number} */
  this.bearing = options.bearing;

  /** @type {number} */
  this.arrowLength = options.arrowLength;

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
      this.bearing == bearingArrowLiteral.bearing &&
      this.arrowLength == bearingArrowLiteral.arrowLength &&
      this.fillColor == bearingArrowLiteral.fillColor &&
      this.fillOpacity == bearingArrowLiteral.fillOpacity &&
      this.strokeColor == bearingArrowLiteral.strokeColor &&
      this.strokeOpacity == bearingArrowLiteral.strokeOpacity &&
      this.strokeWidth == bearingArrowLiteral.strokeWidth;
};
