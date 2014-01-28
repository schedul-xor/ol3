goog.provide('ol.geom.Circle');

goog.require('goog.asserts');
goog.require('ol.extent');
goog.require('ol.geom.GeometryType');
goog.require('ol.geom.SimpleGeometry');
goog.require('ol.geom.flat');



/**
 * @constructor
 * @extends {ol.geom.SimpleGeometry}
 * @param {ol.geom.RawPoint} center Center.
 * @param {number=} opt_radius Radius.
 * @param {ol.geom.GeometryLayout=} opt_layout Layout.
 */
ol.geom.Circle = function(center, opt_radius, opt_layout) {
  goog.base(this);
  var radius = goog.isDef(opt_radius) ? opt_radius : 0;
  this.setCenterAndRadius(center, radius, opt_layout);
};
goog.inherits(ol.geom.Circle, ol.geom.SimpleGeometry);


/**
 * @inheritDoc
 */
ol.geom.Circle.prototype.clone = function() {
  var circle = new ol.geom.Circle(null);
  circle.setFlatCoordinates(this.layout, this.flatCoordinates.slice());
  return circle;
};


/**
 * @inheritDoc
 */
ol.geom.Circle.prototype.closestPointXY =
    function(x, y, closestPoint, minSquaredDistance) {
  var flatCoordinates = this.flatCoordinates;
  var radius = flatCoordinates[this.stride] - flatCoordinates[0];
  var dx = x - flatCoordinates[0];
  var dy = y - flatCoordinates[1];
  var d = Math.sqrt(dx * dx + dy * dy);
  var distance = Math.max(d, 0);
  var squaredDistance = distance * distance;
  if (squaredDistance < minSquaredDistance) {
    if (d === 0) {
      closestPoint[0] = flatCoordinates[0];
      closestPoint[1] = flatCoordinates[1];
    } else {
      var delta = radius / d;
      closestPoint[0] = flatCoordinates[0] + delta * dx;
      closestPoint[1] = flatCoordinates[1] + delta * dy;
    }
    return squaredDistance;
  } else {
    return minSquaredDistance;
  }
};


/**
 * @inheritDoc
 */
ol.geom.Circle.prototype.containsXY = function(x, y) {
  var flatCoordinates = this.flatCoordinates;
  var dx = x - flatCoordinates[0];
  var dy = y - flatCoordinates[1];
  var r = flatCoordinates[this.stride] - flatCoordinates[0];
  return dx * dx + dy * dy <= r;
};


/**
 * @return {ol.geom.RawPoint} Center.
 */
ol.geom.Circle.prototype.getCenter = function() {
  return this.flatCoordinates.slice(0, this.stride);
};


/**
 * @inheritDoc
 */
ol.geom.Circle.prototype.getExtent = function(opt_extent) {
  if (this.extentRevision != this.revision) {
    var flatCoordinates = this.flatCoordinates;
    var radius = flatCoordinates[this.stride] - flatCoordinates[0];
    this.extent = ol.extent.createOrUpdate(
        flatCoordinates[0] - radius, flatCoordinates[1] - radius,
        flatCoordinates[0] + radius, flatCoordinates[1] + radius,
        this.extent);
    this.extentRevision = this.revision;
  }
  goog.asserts.assert(goog.isDef(this.extent));
  return ol.extent.returnOrUpdate(this.extent, opt_extent);
};


/**
 * @return {number} Radius.
 */
ol.geom.Circle.prototype.getRadius = function() {
  var dx = this.flatCoordinates[this.stride] - this.flatCoordinates[0];
  var dy = this.flatCoordinates[this.stride + 1] - this.flatCoordinates[1];
  return Math.sqrt(dx * dx + dy * dy);
};


/**
 * @inheritDoc
 */
ol.geom.Circle.prototype.getSimplifiedGeometry = function(squaredTolerance) {
  return this;
};


/**
 * @inheritDoc
 */
ol.geom.Circle.prototype.getType = function() {
  return ol.geom.GeometryType.CIRCLE;
};


/**
 * @param {ol.geom.RawPoint} center Center.
 */
ol.geom.Circle.prototype.setCenter = function(center) {
  var stride = this.stride;
  goog.asserts.assert(center.length == stride);
  var radius = this.flatCoordinates[stride] - this.flatCoordinates[0];
  var flatCoordinates = center.slice();
  flatCoordinates[stride] = flatCoordinates[0] + radius;
  var i;
  for (i = 1; i < stride; ++i) {
    flatCoordinates[stride + i] = center[i];
  }
  this.setFlatCoordinates(this.layout, flatCoordinates);
};


/**
 * @param {ol.geom.RawPoint} center Center.
 * @param {number} radius Radius.
 * @param {ol.geom.GeometryLayout=} opt_layout Layout.
 */
ol.geom.Circle.prototype.setCenterAndRadius =
    function(center, radius, opt_layout) {
  if (goog.isNull(center)) {
    this.setFlatCoordinates(ol.geom.GeometryLayout.XY, null);
  } else {
    this.setLayout(opt_layout, center, 0);
    if (goog.isNull(this.flatCoordinates)) {
      this.flatCoordinates = [];
    }
    var flatCoordinates = this.flatCoordinates;
    var offset = ol.geom.flat.deflateCoordinate(
        flatCoordinates, 0, center, this.stride);
    flatCoordinates[offset++] = flatCoordinates[0] + radius;
    var i, ii;
    for (i = 1, ii = this.stride; i < ii; ++i) {
      flatCoordinates[offset++] = flatCoordinates[i];
    }
    flatCoordinates.length = offset;
    this.dispatchChangeEvent();
  }
};


/**
 * @param {ol.geom.GeometryLayout} layout Layout.
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 */
ol.geom.Circle.prototype.setFlatCoordinates =
    function(layout, flatCoordinates) {
  this.setFlatCoordinatesInternal(layout, flatCoordinates);
  this.dispatchChangeEvent();
};


/**
 * @param {number} radius Radius.
 */
ol.geom.Circle.prototype.setRadius = function(radius) {
  goog.asserts.assert(!goog.isNull(this.flatCoordinates));
  this.flatCoordinates[this.stride] = this.flatCoordinates[0] + radius;
  this.dispatchChangeEvent();
};


/**
 * @inheritDoc
 */
ol.geom.Circle.prototype.transform = goog.abstractMethod;
