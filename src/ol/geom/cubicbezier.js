goog.provide('ol.geom.CubicBezier');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('ol.extent');
goog.require('ol.geom.GeometryType');
goog.require('ol.geom.SimpleGeometry');
goog.require('ol.geom.flat.deflate');
goog.require('schedul.math.Algebra');



/**
 * @constructor
 * @extends {ol.geom.SimpleGeometry}
 * @param {Array.<ol.Coordinate>} coordinates
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

  this.xPolyCache_ = null;
  this.yPolyCache_ = null;
};
goog.inherits(ol.geom.CubicBezier, ol.geom.SimpleGeometry);


/**
 * @inheritDoc
 * @api
 */
ol.geom.CubicBezier.prototype.clone = function() {
  var cubicBezier = new ol.geom.CubicBezier(null);
  cubicBezier.setFlatCoordinates(this.layout,
      this.flatCoordinates.slice(),
      this.ends_.slice());
  return cubicBezier;
};


/**
 * @inheritDoc
 * @api
 */
ol.geom.CubicBezier.prototype.closestPointXY = function(x,
    y, closestPoint, minSquaredDistance) {
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

  return ol.extent.createOrUpdate(extent[0], extent[1],
      extent[2], extent[3], opt_extent);
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
  return ol.geom.GeometryType.CUBICBEZIER;
};


/**
 * @param {Array.<ol.Coordinate>} coordinates Coordinates
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
    this.changed();
  }
  this.xPolyCache_ = null;
  this.yPolyCache_ = null;
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
  this.changed();
};


/**
 * @private
 * @param {!number} dimension
 * @param {!Array.<!number>} polyCache
 */
ol.geom.CubicBezier.prototype.preparePolyCache_ =
    function(dimension, polyCache) {
  var bernstein = [this.flatCoordinates[dimension],
                   this.flatCoordinates[dimension + 2],
                   this.flatCoordinates[dimension + 4],
                   this.flatCoordinates[dimension + 6]];
  schedul.math.Algebra.bernstein2poly(bernstein, polyCache);
};


/**
 * @private
 */
ol.geom.CubicBezier.prototype.prepareXPolyCache_ = function() {
  if (!goog.isNull(this.xPolyCache_)) {return;}
  this.xPolyCache_ = [];
  this.preparePolyCache_(0, this.xPolyCache_);
};


/**
 * @private
 */
ol.geom.CubicBezier.prototype.prepareYPolyCache_ = function() {
  if (!goog.isNull(this.yPolyCache_)) {return;}
  this.yPolyCache_ = [];
  this.preparePolyCache_(1, this.yPolyCache_);
};


/**
 * Returns the closest point on bezier curve from (x,y).
 *
 * Points on bezier curves are parametric, so
 *
 * x(t) = a+bt+ct^2+dt^3
 * y(t) = e+ft+gt^2+ht^3
 *
 * distance from (x,y) will be
 *
 * deltaX = x(t)-x = a-x+bt+ct^2+dt^3
 * deltaY = y(t)-y = e-y+ft+gt^2+ht^3
 * Since Math.sqrt is a monotone function, t when d(t)^2
 * is minima should equal t when d(t) is minima.
 *
 * d(t) = deltaX^2+delta^Y which is a sextic. In order to find
 * the minima in t in [0,1), We'll solve quintic d'(t)=0.
 *
 * @param {number} x
 * @param {number} y
 * @return {number} Closest T from given point.
 * @api
 */
ol.geom.CubicBezier.prototype.getClosestTFromPoint = function(x, y) {
  this.prepareXPolyCache_();
  this.prepareYPolyCache_();

  var xpoly = goog.array.clone(this.xPolyCache_); // x(t)
  var ypoly = goog.array.clone(this.yPolyCache_); // y(t)
  xpoly[0] -= x;
  ypoly[0] -= y;
  var xsqpoly = [];
  schedul.math.Algebra.polySquare(xpoly, xsqpoly); // deltaX
  var ysqpoly = [];
  schedul.math.Algebra.polySquare(ypoly, ysqpoly); // deltaY

  var dpoly = [];
  schedul.math.Algebra.polyAdd(xsqpoly, ysqpoly, dpoly); // d(t)
  var derivdpoly = [];
  schedul.math.Algebra.polyDerivative(dpoly, derivdpoly); // d'(t)

  var roots = [];
  schedul.math.Algebra.quinticEqRealRoots(derivdpoly, roots, 0, 1);
  roots.push(1);

  var nearestRoot = 0;
  var nearestSquaredDistance = this.getSquaredDistanceFromXYToT(x, y, 0);
  goog.array.forEach(roots, function(root) {
    if (root < 0 || root > 1) {return;}
    var squaredDistance = this.getSquaredDistanceFromXYToT(x, y, root);
    if (squaredDistance < nearestSquaredDistance) {
      nearestSquaredDistance = squaredDistance;
      nearestRoot = root;
    }
  },this);

  return nearestRoot;
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
ol.geom.CubicBezier.prototype.getVAtTAndDimension_ = function(t, dimension) {
  return ol.geom.CubicBezier.posAt(this.flatCoordinates[dimension],
      this.flatCoordinates[dimension + 2],
      this.flatCoordinates[dimension + 4],
      this.flatCoordinates[dimension + 6], t);
};
