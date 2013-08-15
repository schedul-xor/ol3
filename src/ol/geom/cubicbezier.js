goog.provide('ol.geom.CubicBezier');

goog.require('ol.Extent');
goog.require('ol.geom.AbstractCollection');
goog.require('ol.geom.SharedVertices');
goog.require('ol.geom.Vertex');
goog.require('ol.geom.VertexArray');
goog.require('ol.geom.Point');



/**
 * @constructor
 * @extends {ol.geom.AbstractCollection}
 * @param {Array.<ol.geom.VertexArray>} vertices Vertices.
 * @param {ol.geom.SharedVertices=} opt_shared Shared vertices.
 */
ol.geom.CubicBezier = function(vertices, opt_shared) {
  goog.base(this);
  goog.asserts.assert(goog.isArray(vertices[0]));
  goog.asserts.assert(vertices.length == 4);
  
  var sharedVertices = opt_shared;
  
  if (!goog.isDef(sharedVertices)) {
    var dimension = vertices[0].length;
    sharedVertices = new ol.geom.SharedVertices({dimension: dimension});
  }
  
  this.sharedVertices_ = sharedVertices;
  this.vertices_ = vertices;
  
  /**
   * @type {number}
   */
  this.dimension = sharedVertices.getDimension();

  this.bounds_ = null;
};
goog.inherits(ol.geom.CubicBezier, ol.geom.AbstractCollection);

/**
 * @return {Array.<number>}
 */
ol.geom.CubicBezier.prototype.getBounds = function(){
  var i,d;
  if (goog.isNull(this.bounds_)) {
    var foundRoots = [];
    var c = [];
    for(i = 0;i < this.vertices_.length;i++){
      c.push(this.vertices_[i]);
    }
    for(d = 0;d < this.dimension;d++){
      var roots = ol.geom.CubicBezier.dRoots(c[0][d],c[1][d],c[2][d],c[3][d]);
      for(i  = 0;i < roots.length;i++){
        if(roots[i] <= 0 || roots[i] >= 1){continue;}
        foundRoots.push(roots[i]);
      }
    }
    for(i = 0; i < foundRoots.length;i++){
      var newp = [];
      for(d = 0;d < this.dimension;d++){
        newp.push(ol.geom.CubicBezier.posAt(c[0][d],c[1][d],c[2][d],c[3][d],foundRoots[i]));
      }
      c.push(newp);
    }
    c.splice(1,2); // Remove anchor points from max/min evaluation targets.
    var maxes = [];
    var mines = [];
    for(d = 0;d < this.dimension;d++){
      maxes.push(-9007199254740992);
      mines.push(9007199254740992);
    }
    for(i = 0;i < c.length;i++){
      for(d = 0;d < this.dimension;d++){
        if(maxes[d] < c[i][d]){
          maxes[d] = c[i][d];
        }
        if(mines[d] > c[i][d]){
          mines[d] = c[i][d];
        }
      }
    }
    var result = [];
    for(d = 0;d < this.dimension;d++){
      result.push(mines[d]);
      result.push(maxes[d]);
    }
    this.bounds_ = [mines[0], maxes[0], mines[1], maxes[1]];
  }
  return this.bounds_;
};

/**
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @param {number} t
 * @return {number}
 */
ol.geom.CubicBezier.posAt = function(a,b,c,d,t){
  t = 1-t;
  var u = 1-t;
  var ab = a*t+b*u;
  var bc = b*t+c*u;
  var cd = c*t+d*u;
  var abc = ab*t+bc*u;
  var bcd = bc*t+cd*u;
  return abc*t+bcd*u;
};

/**
 * @param{number}a
 * @param{number}b
 * @param{number}c
 * @param{number}d
 * @return{number}
 */
ol.geom.CubicBezier.dRootN = function(a,b,c,d){
  return -a+b-c+d;
};

/**
 * @param{number}a
 * @param{number}b
 * @param{number}c
 * @return{number}
 */
ol.geom.CubicBezier.dRootM = function(a,b,c){
  return 3*a-2*b+c;
};

/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
ol.geom.CubicBezier.dRootQ = function(a,b){
  return -3*a+b;
};

/**
 * @param{number}M
 * @param{number}N
 * @param{number}Q
 * @return{number}
 */
ol.geom.CubicBezier.dRootR = function(M,N,Q){
  return M*M-3*N*Q;
};

/**
 * @param{number}a
 * @param{number}b
 * @param{number}c
 * @param{number}d
 * @return{Array.<number>}
 */
ol.geom.CubicBezier.dRoots = function(a,b,c,d){
  var N = ol.geom.CubicBezier.dRootN(a,b,c,d);
  if(N == 0){
    return [];
  }
  var M = ol.geom.CubicBezier.dRootM(a,b,c);
  var Q = ol.geom.CubicBezier.dRootQ(a,b);
  var R = ol.geom.CubicBezier.dRootR(M,N,Q);
  var K = -M/3/N;
  if(R == 0){
    return [K];
  }
  var Rsq = Math.sqrt(R)/3/N;
  return [K+Rsq,K-Rsq];
};

/**
 * @return{ol.geom.GeometryType}
 */
ol.geom.CubicBezier.prototype.getType = function(){
  return ol.geom.GeometryType.CUBICBEZIER;
};

/**
 * @return {Array}
 */
ol.geom.CubicBezier.prototype.getVertices = function(){
  return this.vertices_;
};
