goog.provide('ol.geom.CubicBezier');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('ol.extent');
goog.require('ol.geom.GeometryType');
goog.require('ol.geom.SimpleGeometry');
goog.require('ol.geom.flat.deflate');



/**
 * @constructor
 * @extends {ol.geom.SimpleGeometry}
 * @param {ol.geom.RawLinearRing} coordinates
 * @param {ol.geom.GeometryLayout=} opt_layout Layout.
 * @api
 */
ol.geom.CubicBezier = function(coordinates, opt_layout) {
  goog.base(this);

  /**
   * @type {Array.<number>}
   * @private
   */
  this.ends_ = [];
  this.setCoordinates(coordinates, opt_layout);
};
goog.inherits(ol.geom.CubicBezier, ol.geom.SimpleGeometry);


/**
 * @inheritDoc
 * @api
 */
ol.geom.CubicBezier.prototype.clone = function() {
  var cubicBezier = new ol.geom.CubicBezier(null);
  cubicBezier.setFlatCoordinates(
      this.layout, this.flatCoordinates.slice(), this.ends_.slice());
  return cubicBezier;
};


/**
 * @inheritDoc
 * @api
 */
ol.geom.CubicBezier.prototype.closestPointXY =
    function(x, y, closestPoint, minSquaredDistance) {
  var nearestT = this.getClosestTFromPoint(x, y);
  var squaredDistance = this.getSquaredDistanceFromXYToT(x, y, nearestT);
  if (minSquaredDistance < squaredDistance) {
    return minSquaredDistance;
  }
  var distance = Math.sqrt(squaredDistance);
  var nearestX = this.getXAtT_(nearestT);
  var nearestY = this.getYAtT_(nearestT);
  closestPoint[0] = nearestX;
  closestPoint[1] = nearestY;
  return distance;
};


/**
 * @private
 * @param {number} stride Stride.
 * @param {ol.Extent=} opt_extent Extent.
 * @return {ol.Extent}
 */
ol.geom.CubicBezier.prototype.createOrUpdateExtent_ =
    function(stride, opt_extent) {
  var extent = ol.extent.createOrUpdateEmpty(opt_extent);
  var totalDimensions = 2;
  var limitQs = [];

  for (var dimension = 0; dimension < totalDimensions; dimension++) {
    limitQs.length = 0;

    var q0 = this.flatCoordinates[dimension];
    var q1 = this.flatCoordinates[totalDimensions + dimension];
    var q2 = this.flatCoordinates[totalDimensions * 2 + dimension];
    var q3 = this.flatCoordinates[totalDimensions * 3 + dimension];

    var roots = ol.geom.CubicBezier.dRoots(q0, q1, q2, q3);
    goog.array.forEach(roots, function(root, index) {
      if (root > 1 || root < 0) {
        return;
      }
      var q = ol.geom.CubicBezier.posAt(q0, q1, q2, q3, root);
      limitQs.push(q);
    }, this);
    limitQs.push(q0);
    limitQs.push(q3);

    var maxQ = -Infinity;
    var minQ = Infinity;
    goog.array.forEach(limitQs, function(limitQ, index) {
      if (limitQ > maxQ) {
        maxQ = limitQ;
      }
      if (limitQ < minQ) {
        minQ = limitQ;
      }
    }, this);

    extent[dimension] = minQ;
    extent[totalDimensions + dimension] = maxQ;
  }

  return ol.extent.createOrUpdate(
      extent[0], extent[1], extent[2], extent[3], opt_extent);
};


/**
 * @param {ol.Extent=} opt_extent Extent.
 * @return {Array.<number>}
 * @api
 */
ol.geom.CubicBezier.prototype.getExtent = function(opt_extent) {
  if (this.extentRevision != this.getRevision()) {
    this.extent = this.createOrUpdateExtent_(this.stride, opt_extent);
    this.extentRevision = this.getRevision();
  }
  goog.asserts.assert(goog.isDef(this.extent));
  return ol.extent.returnOrUpdate(this.extent, opt_extent);
};


/**
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @param {number} u
 * @return {number}
 * @api
 */
ol.geom.CubicBezier.posABAt = function(a, b, t, u) {
  return a * u + b * t;
};


/**
 * @param {number} b
 * @param {number} c
 * @param {number} t
 * @param {number} u
 * @return {number}
 * @api
 */
ol.geom.CubicBezier.posBCAt = function(b, c, t, u) {
  return b * u + c * t;
};


/**
 * @param {number} c
 * @param {number} d
 * @param {number} t
 * @param {number} u
 * @return {number}
 * @api
 */
ol.geom.CubicBezier.posCDAt = function(c, d, t, u) {
  return c * u + d * t;
};


/**
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} t
 * @param {number} u
 * @return {number}
 * @api
 */
ol.geom.CubicBezier.posABCAt = function(a, b, c, t, u) {
  return ol.geom.CubicBezier.posABAt(a, b, t, u) * u +
      ol.geom.CubicBezier.posBCAt(b, c, t, u) * t;
};


/**
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @param {number} t
 * @param {number} u
 * @return {number}
 * @api
 */
ol.geom.CubicBezier.posBCDAt = function(b, c, d, t, u) {
  return ol.geom.CubicBezier.posBCAt(b, c, t, u) * u +
      ol.geom.CubicBezier.posCDAt(c, d, t, u) * t;
};


/**
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @param {number} t
 * @return {number}
 * @api
 */
ol.geom.CubicBezier.posAt = function(a, b, c, d, t) {
  goog.asserts.assert(goog.isNumber(a));
  goog.asserts.assert(goog.isNumber(b));
  goog.asserts.assert(goog.isNumber(c));
  goog.asserts.assert(goog.isNumber(d));
  goog.asserts.assert(goog.isNumber(t));
  var u = 1 - t;
  return ol.geom.CubicBezier.posABCAt(a, b, c, t, u) * u +
      ol.geom.CubicBezier.posBCDAt(b, c, d, t, u) * t;
};


/**
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @return {number}
 * @api
 */
ol.geom.CubicBezier.dRootN = function(a, b, c, d) {
  goog.asserts.assert(goog.isNumber(a));
  goog.asserts.assert(goog.isNumber(b));
  goog.asserts.assert(goog.isNumber(c));
  goog.asserts.assert(goog.isNumber(d));
  return -a + b - c + d;
};


/**
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @return {number}
 * @api
 */
ol.geom.CubicBezier.dRootM = function(a, b, c) {
  goog.asserts.assert(goog.isNumber(a));
  goog.asserts.assert(goog.isNumber(b));
  goog.asserts.assert(goog.isNumber(c));
  return 3 * a - 2 * b + c;
};


/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 * @api
 */
ol.geom.CubicBezier.dRootQ = function(a, b) {
  goog.asserts.assert(goog.isNumber(a));
  goog.asserts.assert(goog.isNumber(b));
  return -3 * a + b;
};


/**
 * @param {number} M
 * @param {number} N
 * @param {number} Q
 * @return {number}
 * @api
 */
ol.geom.CubicBezier.dRootR = function(M, N, Q) {
  goog.asserts.assert(goog.isNumber(M));
  goog.asserts.assert(goog.isNumber(N));
  goog.asserts.assert(goog.isNumber(Q));
  return M * M - 3 * N * Q;
};


/**
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @return {Array.<number>}
 * @api
 */
ol.geom.CubicBezier.dRoots = function(a, b, c, d) {
  goog.asserts.assert(goog.isNumber(a));
  goog.asserts.assert(goog.isNumber(b));
  goog.asserts.assert(goog.isNumber(c));
  goog.asserts.assert(goog.isNumber(d));
  var N = ol.geom.CubicBezier.dRootN(a, b, c, d);
  if (N === 0) {
    return [];
  }
  var M = ol.geom.CubicBezier.dRootM(a, b, c);
  var Q = ol.geom.CubicBezier.dRootQ(a, b);
  var R = ol.geom.CubicBezier.dRootR(M, N, Q);
  var K = -M / 3 / N;
  if (R === 0) {
    return [K];
  }else if (R < 0) {
    return [];
  }
  var Rsq = Math.sqrt(R) / 3 / N;
  return [K + Rsq, K - Rsq];
};


/**
 * @inheritDoc
 * @api
 */
ol.geom.CubicBezier.prototype.getSimplifiedGeometry =
    function(squaredTolarence) {
  return this;
};


/**
 * @inheritDoc
 * @api
 */
ol.geom.CubicBezier.prototype.getType = function() {
  return ol.geom.GeometryType.CUBIC_BEZIER;
};


/**
 * @param {ol.geom.RawLinearRing} coordinates Coordinates
 * @param {ol.geom.GeometryLayout=} opt_layout Layout.
 * @api
 */
ol.geom.CubicBezier.prototype.setCoordinates =
    function(coordinates, opt_layout) {
  if (goog.isNull(coordinates)) {
    this.setFlatCoordinates(ol.geom.GeometryLayout.XY, null, this.ends_);
  }else {
    this.setLayout(opt_layout, coordinates, 1);
    if (goog.isNull(this.flatCoordinates)) {
      this.flatCoordinates = [];
    }
    this.flatCoordinates.length = ol.geom.flat.deflate.coordinates(
        this.flatCoordinates, 0, coordinates, this.stride);
    this.dispatchChangeEvent();
  }
};


/**
 * @param {ol.geom.GeometryLayout} layout
 * @param {Array.<number>} flatCoordinates
 * @param {Array.<number>} ends Ends.
 * @api
 */
ol.geom.CubicBezier.prototype.setFlatCoordinates =
    function(layout, flatCoordinates, ends) {
  this.setFlatCoordinatesInternal(layout, flatCoordinates);
  this.ends_ = ends;
  this.dispatchChangeEvent();
};


/**
 * @param {number} x
 * @param {number} y
 * @return {number} Closest T from given point.
 * @api
 */
ol.geom.CubicBezier.prototype.getClosestTFromPoint = function(x, y) {
  var currentT = 0.5;
  var currentStep = 0;
  var deltaT = 0.25;
  var minDeltaT = 1e-13;
  var maxSteps = 100;
  var lastSquaredDistance = 0;
  while (currentStep < maxSteps) {
    if (minDeltaT > deltaT) {
      break;
    }

    var plusT = currentT + deltaT;
    var plusSquaredDistance = this.getSquaredDistanceFromXYToT(x, y, plusT);

    var minusT = currentT - deltaT;
    var minusSquaredDistance = this.getSquaredDistanceFromXYToT(x, y, minusT);

    if (plusSquaredDistance < minusSquaredDistance) {
      currentT = plusT;
      lastSquaredDistance = plusSquaredDistance;
    }else {
      currentT = minusT;
      lastSquaredDistance = minusSquaredDistance;
    }

    deltaT /= 2;
    currentStep++;
  }

  var squaredDistanceAt0 = this.getSquaredDistanceFromXYToT(x, y, 0);
  if (lastSquaredDistance > squaredDistanceAt0) {
    currentT = 0;
    lastSquaredDistance = squaredDistanceAt0;
  }
  var squaredDistanceAt1 = this.getSquaredDistanceFromXYToT(x, y, 1);
  if (lastSquaredDistance > squaredDistanceAt1) {
    currentT = 1;
  }

  return currentT;
};


/**
 * @param {number} x
 * @param {number} y
 * @param {number} t
 * @return {number}
 * @api
 */
ol.geom.CubicBezier.prototype.getSquaredDistanceFromXYToT = function(x, y, t) {
  var xOnB = this.getXAtT_(t);
  var yOnB = this.getYAtT_(t);
  var dx = x - xOnB;
  var dy = y - yOnB;
  return dx * dx + dy * dy;
};


/**
 * @private
 * @param {number} t
 * @return {number}
 */
ol.geom.CubicBezier.prototype.getXAtT_ = function(t) {
  return this.getVAtTAndDimension_(t, 0);
};


/**
 * @private
 * @param {number} t
 * @return {number}
 */
ol.geom.CubicBezier.prototype.getYAtT_ = function(t) {
  return this.getVAtTAndDimension_(t, 1);
};


/**
 * @private
 * @param {number} t
 * @param {number} dimension
 * @return {number}
 */
ol.geom.CubicBezier.prototype.getVAtTAndDimension_ =
    function(t, dimension) {
  return ol.geom.CubicBezier.posAt(
      this.flatCoordinates[dimension],
      this.flatCoordinates[dimension + 2],
      this.flatCoordinates[dimension + 4],
      this.flatCoordinates[dimension + 6], t);
};
