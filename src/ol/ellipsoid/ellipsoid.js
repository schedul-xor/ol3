goog.provide('ol.Ellipsoid');

goog.require('goog.math');
goog.require('ol.Coordinate');



/**
 * @constructor
 * @param {number} a Major radius.
 * @param {number} flattening Flattening.
 * @api
 */
ol.Ellipsoid = function(a, flattening) {

  /**
   * @const
   * @type {number}
   */
  this.a = a;

  /**
   * @const
   * @type {number}
   */
  this.flattening = flattening;

  /**
   * @const
   * @type {number}
   */
  this.b = this.a * (1 - this.flattening);

  /**
   * @const
   * @type {number}
   */
  this.eSquared = 2 * flattening - flattening * flattening;

  /**
   * @const
   * @type {number}
   */
  this.e = Math.sqrt(this.eSquared);

};


/**
 * @param {ol.Coordinate} c1 Coordinate 1.
 * @param {ol.Coordinate} c2 Coordinate 1.
 * @param {number=} opt_minDeltaLambda Minimum delta lambda for convergence.
 * @param {number=} opt_maxIterations Maximum iterations.
 * @return {{distance: number, initialBearing: number, finalBearing: number}}
 *     Vincenty.
 * @api
 */
ol.Ellipsoid.prototype.vincenty =
    function(c1, c2, opt_minDeltaLambda, opt_maxIterations) {
  var minDeltaLambda = goog.isDef(opt_minDeltaLambda) ?
      opt_minDeltaLambda : 1e-12;
  var maxIterations = goog.isDef(opt_maxIterations) ?
      opt_maxIterations : 100;
  var f = this.flattening;
  var lat1 = goog.math.toRadians(c1[1]);
  var lat2 = goog.math.toRadians(c2[1]);
  var deltaLon = goog.math.toRadians(c2[0] - c1[0]);
  var U1 = Math.atan((1 - f) * Math.tan(lat1));
  var cosU1 = Math.cos(U1);
  var sinU1 = Math.sin(U1);
  var U2 = Math.atan((1 - f) * Math.tan(lat2));
  var cosU2 = Math.cos(U2);
  var sinU2 = Math.sin(U2);
  var lambda = deltaLon;
  var cosSquaredAlpha, sinAlpha;
  var cosLambda, deltaLambda = Infinity, sinLambda;
  var cos2SigmaM, cosSigma, sigma, sinSigma;
  var i;
  for (i = maxIterations; i > 0; --i) {
    cosLambda = Math.cos(lambda);
    sinLambda = Math.sin(lambda);
    var x = cosU2 * sinLambda;
    var y = cosU1 * sinU2 - sinU1 * cosU2 * cosLambda;
    sinSigma = Math.sqrt(x * x + y * y);
    if (sinSigma === 0) {
      return {
        distance: 0,
        initialBearing: 0,
        finalBearing: 0
      };
    }
    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);
    sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
    cosSquaredAlpha = 1 - sinAlpha * sinAlpha;
    cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSquaredAlpha;
    if (isNaN(cos2SigmaM)) {
      cos2SigmaM = 0;
    }
    var C = f / 16 * cosSquaredAlpha * (4 + f * (4 - 3 * cosSquaredAlpha));
    var lambdaPrime = deltaLon + (1 - C) * f * sinAlpha * (sigma +
        C * sinSigma * (cos2SigmaM +
        C * cosSigma * (2 * cos2SigmaM * cos2SigmaM - 1)));
    deltaLambda = Math.abs(lambdaPrime - lambda);
    lambda = lambdaPrime;
    if (deltaLambda < minDeltaLambda) {
      break;
    }
  }
  if (i === 0) {
    return {
      distance: NaN,
      finalBearing: NaN,
      initialBearing: NaN
    };
  }
  var aSquared = this.a * this.a;
  var bSquared = this.b * this.b;
  var uSquared = cosSquaredAlpha * (aSquared - bSquared) / bSquared;
  var A = 1 + uSquared / 16384 *
      (4096 + uSquared * (uSquared * (320 - 175 * uSquared) - 768));
  var B = uSquared / 1024 *
      (256 + uSquared * (uSquared * (74 - 47 * uSquared) - 128));
  var deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 *
      (cosSigma * (2 * cos2SigmaM * cos2SigmaM - 1) -
       B / 6 * cos2SigmaM * (4 * sinSigma * sinSigma - 3) *
       (4 * cos2SigmaM * cos2SigmaM - 3)));
  cosLambda = Math.cos(lambda);
  sinLambda = Math.sin(lambda);
  var alpha1 = Math.atan2(cosU2 * sinLambda,
                          cosU1 * sinU2 - sinU1 * cosU2 * cosLambda);
  var alpha2 = Math.atan2(cosU1 * sinLambda,
                          cosU1 * sinU2 * cosLambda - sinU1 * cosU2);
  return {
    distance: this.b * A * (sigma - deltaSigma),
    initialBearing: goog.math.toDegrees(alpha1),
    finalBearing: goog.math.toDegrees(alpha2)
  };
};


/**
 * Returns the distance from c1 to c2 using Vincenty.
 *
 * @param {ol.Coordinate} c1 Coordinate 1.
 * @param {ol.Coordinate} c2 Coordinate 1.
 * @param {number=} opt_minDeltaLambda Minimum delta lambda for convergence.
 * @param {number=} opt_maxIterations Maximum iterations.
 * @return {number} Vincenty distance.
 * @api
 */
ol.Ellipsoid.prototype.vincentyDistance =
    function(c1, c2, opt_minDeltaLambda, opt_maxIterations) {
  var vincenty = this.vincenty(c1, c2, opt_minDeltaLambda, opt_maxIterations);
  return vincenty.distance;
};


/**
 * Returns the final bearing from c1 to c2 using Vincenty.
 *
 * @param {ol.Coordinate} c1 Coordinate 1.
 * @param {ol.Coordinate} c2 Coordinate 1.
 * @param {number=} opt_minDeltaLambda Minimum delta lambda for convergence.
 * @param {number=} opt_maxIterations Maximum iterations.
 * @return {number} Initial bearing.
 * @api
 */
ol.Ellipsoid.prototype.vincentyFinalBearing =
    function(c1, c2, opt_minDeltaLambda, opt_maxIterations) {
  var vincenty = this.vincenty(c1, c2, opt_minDeltaLambda, opt_maxIterations);
  return vincenty.finalBearing;
};


/**
 * Returns the initial bearing from c1 to c2 using Vincenty.
 *
 * @param {ol.Coordinate} c1 Coordinate 1.
 * @param {ol.Coordinate} c2 Coordinate 1.
 * @param {number=} opt_minDeltaLambda Minimum delta lambda for convergence.
 * @param {number=} opt_maxIterations Maximum iterations.
 * @return {number} Initial bearing.
 * @api
 */
ol.Ellipsoid.prototype.vincentyInitialBearing =
    function(c1, c2, opt_minDeltaLambda, opt_maxIterations) {
  var vincenty = this.vincenty(c1, c2, opt_minDeltaLambda, opt_maxIterations);
  return vincenty.initialBearing;
};


/**
 * @see http://en.wikipedia.org/wiki/Vincenty%27s_formulae
 * @param {ol.Coordinate} c
 * @param {number} distance
 * @param {number} bearing
 * @param {number=} opt_minDeltaSigma Minimum delta sigma for convergence.
 * @param {number=} opt_maxIterations Maximum iterations.
 * @return {ol.Coordinate}
 * @api
 */
ol.Ellipsoid.prototype.vincentyDirect =
    function(c, distance, bearing, opt_minDeltaSigma, opt_maxIterations) {
  var minDeltaSigma = goog.isDef(opt_minDeltaSigma) ? opt_minDeltaSigma : 1e-8;
  var maxIterations = goog.isDef(opt_maxIterations) ? opt_maxIterations : 100;

  var a = this.a;
  var b = this.b;
  var f = this.flattening;

  var s = distance;
  var alpha1 = goog.math.toRadians(bearing);
  var sinAlpha1 = Math.sin(alpha1);
  var cosAlpha1 = Math.cos(alpha1);

  var tanU1 = (1 - f) * Math.tan(goog.math.toRadians(c[1]));
  var cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
  var sigma1 = Math.atan2(tanU1, cosAlpha1);
  var sinAlpha = cosU1 * sinAlpha1;
  var cosSqAlpha = 1 - sinAlpha * sinAlpha;
  var uSq = cosSqAlpha * (a * a - b * b) / (b * b);
  var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  var cos2SigmaM, sinSigma, cosSigma, deltaSigma, tmp, lat2, lambda, C, L, lon2;

  var sigma = s / (b * A), sigmaP = 2 * Math.PI;
  while (Math.abs(sigma - sigmaP) > minDeltaSigma && maxIterations-- > 0) {
    cos2SigmaM = Math.cos(2 * sigma1 + sigma);
    sinSigma = Math.sin(sigma);
    cosSigma = Math.cos(sigma);
    deltaSigma =
        B * sinSigma * (cos2SigmaM + B / 4 *
        (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
        B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) *
        (-3 + 4 * cos2SigmaM * cos2SigmaM)));
    sigmaP = sigma;
    sigma = s / (b * A) + deltaSigma;
  }

  tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
  lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
      (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp));
  lambda = Math.atan2(sinSigma * sinAlpha1,
      cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1);
  C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
  L = lambda - (1 - C) * f * sinAlpha *
      (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma *
      (-1 + 2 * cos2SigmaM * cos2SigmaM)));
  lon2 = (goog.math.toRadians(c[0]) + L + 3 * Math.PI) %
      (2 * Math.PI) - Math.PI;

  return [goog.math.toDegrees(lon2), goog.math.toDegrees(lat2)];
};
