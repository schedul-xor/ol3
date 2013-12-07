goog.provide('ol.source.MapGuide');

goog.require('goog.object');
goog.require('goog.uri.utils');
goog.require('ol.ImageUrlFunction');
goog.require('ol.extent');
goog.require('ol.source.Image');



/**
 * @constructor
 * @extends {ol.source.Image}
 * @param {ol.source.MapGuideOptions} options Options.
 */
ol.source.MapGuide = function(options) {

  var imageUrlFunction;
  if (goog.isDef(options.url)) {
    var params = goog.isDef(options.params) ? options.params : {};
    imageUrlFunction = ol.ImageUrlFunction.createFromParamsFunction(
        options.url, params, goog.bind(this.getUrl, this));
  } else {
    imageUrlFunction = ol.ImageUrlFunction.nullImageUrlFunction;
  }

  goog.base(this, {
    extent: options.extent,
    projection: options.projection,
    resolutions: options.resolutions,
    imageUrlFunction: imageUrlFunction
  });

  /**
   * @private
   * @type {number}
   */
  this.metersPerUnit_ = goog.isDef(options.metersPerUnit) ?
      options.metersPerUnit : 1;

  /**
   * @private
   * @type {number}
   */
  this.ratio_ = goog.isDef(options.ratio) ? options.ratio : 1;

  /**
   * @private
   * @type {boolean}
   */
  this.useOverlay_ = goog.isDef(options.useOverlay) ?
      options.useOverlay : false;

  /**
   * @private
   * @type {ol.Image}
   */
  this.image_ = null;

};
goog.inherits(ol.source.MapGuide, ol.source.Image);


/**
 * @inheritDoc
 */
ol.source.MapGuide.prototype.getImage =
    function(extent, resolution, projection) {
  resolution = this.findNearestResolution(resolution);

  var image = this.image_;
  if (!goog.isNull(image) &&
      image.getResolution() == resolution &&
      ol.extent.containsExtent(image.getExtent(), extent)) {
    return image;
  }

  if (this.ratio_ != 1) {
    extent = extent.slice();
    ol.extent.scaleFromCenter(extent, this.ratio_);
  }
  var width = (extent[2] - extent[0]) / resolution;
  var height = (extent[3] - extent[1]) / resolution;
  var size = [width, height];

  this.image_ = this.createImage(extent, resolution, size, projection);
  return this.image_;
};


/**
 * @param {ol.Extent} extent The map extents.
 * @param {ol.Size} size the viewport size.
 * @return {number} The computed map scale.
 */
ol.source.MapGuide.prototype.getScale = function(extent, size) {
  var mcsW = extent[2] - extent[0];
  var mcsH = extent[3] - extent[1];
  var devW = size[0];
  var devH = size[1];
  var dpi = 96;
  var mpu = this.metersPerUnit_;
  var mpp = 0.0254 / dpi;
  if (devH * mcsW > devW * mcsH) {
    return mcsW * mpu / (devW * mpp); // width limited
  } else {
    return mcsH * mpu / (devH * mpp); // height limited
  }
};


/**
 * @param {string} baseUrl The mapagent url.
 * @param {Object.<string, string|number>} params Request parameters.
 * @param {ol.Extent} extent Extent.
 * @param {ol.Size} size Size.
 * @param {ol.proj.Projection} projection Projection.
 * @return {string} The mapagent map image request URL.
 */
ol.source.MapGuide.prototype.getUrl =
    function(baseUrl, params, extent, size, projection) {
  var scale = this.getScale(extent, size);
  var baseParams = {
    'OPERATION': this.useOverlay_ ? 'GETDYNAMICMAPOVERLAYIMAGE' : 'GETMAPIMAGE',
    'VERSION': '2.0.0',
    'LOCALE': 'en',
    'CLIENTAGENT': 'ol.source.MapGuide source',
    'CLIP': '1',
    'SETDISPLAYDPI': 96,
    'SETDISPLAYWIDTH': Math.round(size[0]),
    'SETDISPLAYHEIGHT': Math.round(size[1]),
    'SETVIEWSCALE': scale,
    'SETVIEWCENTERX': (extent[0] + extent[2]) / 2,
    'SETVIEWCENTERY': (extent[1] + extent[3]) / 2
  };
  goog.object.extend(baseParams, params);
  return goog.uri.utils.appendParamsFromMap(baseUrl, baseParams);
};
