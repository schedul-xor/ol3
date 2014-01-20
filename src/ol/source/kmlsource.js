goog.provide('ol.source.KML');

goog.require('ol.format.KML');
goog.require('ol.source.VectorFile');



/**
 * @constructor
 * @extends {ol.source.VectorFile}
 * @param {olx.source.KMLOptions=} opt_options Options.
 */
ol.source.KML = function(opt_options) {

  var options = goog.isDef(opt_options) ? opt_options : {};

  goog.base(this, {
    attributions: options.attributions,
    doc: options.doc,
    extent: options.extent,
    format: new ol.format.KML({
      defaultStyle: options.defaultStyle
    }),
    logo: options.logo,
    node: options.node,
    projection: options.projection,
    reprojectTo: options.reprojectTo,
    text: options.text,
    url: options.url,
    urls: options.urls
  });

};
goog.inherits(ol.source.KML, ol.source.VectorFile);
