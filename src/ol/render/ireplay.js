goog.provide('ol.render.IReplayGroup');

goog.require('goog.functions');
goog.require('ol.render.IRender');


/**
 * @enum {string}
 */
ol.render.ReplayType = {
  IMAGE: 'Image',
  LINE_STRING: 'LineString',
  POLYGON: 'Polygon'
};


/**
 * @const
 * @type {Array.<ol.render.ReplayType>}
 */
ol.render.REPLAY_ORDER = [
  ol.render.ReplayType.POLYGON,
  ol.render.ReplayType.LINE_STRING,
  ol.render.ReplayType.IMAGE
];



/**
 * @interface
 */
ol.render.IReplayGroup = function() {
};


/**
 * FIXME empty description for jsdoc
 */
ol.render.IReplayGroup.prototype.finish = function() {
};


/**
 * @param {number|undefined} zIndex Z index.
 * @param {ol.render.ReplayType} replayType Replay type.
 * @return {ol.render.IRender} Replay.
 */
ol.render.IReplayGroup.prototype.getReplay = function(zIndex, replayType) {
};


/**
 * @return {boolean} Is empty.
 */
ol.render.IReplayGroup.prototype.isEmpty = function() {
};
