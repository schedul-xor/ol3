goog.provide('ol.geom.CubicBezier');

goog.require('goog.asserts');
goog.require('ol.CoordinateArray');
goog.require('ol.Extent');
goog.require('ol.geom.AbstractCollection');
goog.require('ol.geom.GeometryType');
goog.require('ol.geom.SharedVertices');



/**
 * @constructor
 * @extends {ol.geom.AbstractCollection}
 * @param {ol.CoordinateArray} coordinates Vertex array
 * (e.g. [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]).
 * @param {ol.geom.SharedVertices=} opt_shared Shared vertices.
 */
ol.geom.CubicBezier = function(coordinates, opt_shared) {
  goog.base(this);
  goog.asserts.assert(goog.isArray(coordinates[0]));
  goog.asserts.assert(coordinates.length == 4);

  var vertices = opt_shared;

  if (!goog.isDef(vertices)) {
    var dimension = coordinates[0].length;
    vertices = new ol.geom.SharedVertices({dimension: dimension});
  }

  /**
   * @type {ol.geom.SharedVertices}
   */
  this.vertices = vertices;

  /**
   * @type {number}
   * @private
   */
  this.sharedId_ = vertices.add(coordinates);

  /**
   * @type {number}
   */
  this.dimension = vertices.getDimension();
  goog.asserts.assert(this.dimension >= 2);

  /**
   * @type {ol.Extent}
   * @private
   */
  this.bounds_ = null;
};
goog.inherits(ol.geom.CubicBezier, ol.geom.AbstractCollection);


/**
 * @param {number} index Vertex index.
 * @param {number} dim Coordinate dimension.
 * @return {number} The vertex coordinate value.
 */
ol.geom.CubicBezier.prototype.get = function(index, dim) {
  return this.vertices.get(this.sharedId_, index, dim);
};


/**
 * @inheritDoc
 * @return {ol.CoordinateArray} Coordinates array.
 */
ol.geom.CubicBezier.prototype.getCoordinates = function() {
  var coordinates = new Array(4);
  var vertex;
  for (var i = 0; i < 4; ++i) {
    vertex = new Array(this.dimension);
    for (var j = 0; j < this.dimension; ++j) {
      vertex[j] = this.get(i, j);
    }
    coordinates[i] = vertex;
  }
  return coordinates;
};


/**
 * @return {Array.<number>}
 */
ol.geom.CubicBezier.prototype.getBounds = function() {
  var i, d;
  var cp = this.getCoordinates();
  if (goog.isNull(this.bounds_)) {
    var foundRoots = [];
    for (d = 0; d < this.dimension; d++) {
      var roots = ol.geom.CubicBezier.dRoots(
          cp[0][d], cp[1][d], cp[2][d], cp[3][d]
          );
      for (i = 0; i < roots.length; i++) {
        if (roots[i] <= 0 || roots[i] >= 1) {continue;}
        foundRoots.push(roots[i]);
      }
    }
    var boundPoints = [];
    for (i = 0; i < foundRoots.length; i++) {
      var newp = [];
      for (d = 0; d < this.dimension; d++) {
        newp.push(ol.geom.CubicBezier.posAt(
            cp[0][d], cp[1][d], cp[2][d], cp[3][d],
            foundRoots[i]));
      }
      boundPoints.push(newp);
    }
    boundPoints.push(cp[0]);
    boundPoints.push(cp[3]);
    var maxes = [];
    var mines = [];
    for (d = 0; d < this.dimension; d++) {
      maxes.push(-9007199254740992);
      mines.push(9007199254740992);
    }
    for (i = 0; i < boundPoints.length; i++) {
      for (d = 0; d < this.dimension; d++) {
        if (maxes[d] < boundPoints[i][d]) {
          maxes[d] = boundPoints[i][d];
        }
        if (mines[d] > boundPoints[i][d]) {
          mines[d] = boundPoints[i][d];
        }
      }
    }
    var result = [];
    for (d = 0; d < this.dimension; d++) {
      result.push(mines[d]);
      result.push(maxes[d]);
    }
    this.bounds_ = [mines[0], mines[1], maxes[0], maxes[1]];
  }
  return this.bounds_;
};


/**
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @param {number} u
 * @return {number}
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
 */
ol.geom.CubicBezier.dRoots = function(a, b, c, d) {
  goog.asserts.assert(goog.isNumber(a));
  goog.asserts.assert(goog.isNumber(b));
  goog.asserts.assert(goog.isNumber(c));
  goog.asserts.assert(goog.isNumber(d));
  var N = ol.geom.CubicBezier.dRootN(a, b, c, d);
  if (N == 0) {
    return [];
  }
  var M = ol.geom.CubicBezier.dRootM(a, b, c);
  var Q = ol.geom.CubicBezier.dRootQ(a, b);
  var R = ol.geom.CubicBezier.dRootR(M, N, Q);
  var K = -M / 3 / N;
  if (R == 0) {
    return [K];
  }else if (R < 0) {
    return [];
  }
  var Rsq = Math.sqrt(R) / 3 / N;
  return [K + Rsq, K - Rsq];
};


/**
 * Get the identifier used to mark this line in the shared vertices structure.
 * @return {number} The identifier.
 */
ol.geom.CubicBezier.prototype.getSharedId = function() {
  return this.sharedId_;
};


/**
 * @inheritDoc
 */
ol.geom.CubicBezier.prototype.getType = function() {
  return ol.geom.GeometryType.CUBICBEZIER;
};
