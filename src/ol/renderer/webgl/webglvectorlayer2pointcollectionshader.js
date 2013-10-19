// This file is automatically generated, do not edit
goog.provide('ol.renderer.webgl.vectorlayer2.shader.PointCollection');

goog.require('ol.webgl.shader');



/**
 * @constructor
 * @extends {ol.webgl.shader.Fragment}
 */
ol.renderer.webgl.vectorlayer2.shader.PointCollectionFragment = function() {
  goog.base(this, ol.renderer.webgl.vectorlayer2.shader.PointCollectionFragment.SOURCE);
};
goog.inherits(ol.renderer.webgl.vectorlayer2.shader.PointCollectionFragment, ol.webgl.shader.Fragment);
goog.addSingletonGetter(ol.renderer.webgl.vectorlayer2.shader.PointCollectionFragment);


/**
 * @const
 * @type {string}
 */
ol.renderer.webgl.vectorlayer2.shader.PointCollectionFragment.DEBUG_SOURCE = 'precision mediump float;\nuniform vec4 u_color;\n\nvoid main(void) {\n  gl_FragColor = u_color;\n}\n';


/**
 * @const
 * @type {string}
 */
ol.renderer.webgl.vectorlayer2.shader.PointCollectionFragment.OPTIMIZED_SOURCE = 'precision mediump float;uniform vec4 d;void main(void){gl_FragColor=d;}';


/**
 * @const
 * @type {string}
 */
ol.renderer.webgl.vectorlayer2.shader.PointCollectionFragment.SOURCE = goog.DEBUG ?
    ol.renderer.webgl.vectorlayer2.shader.PointCollectionFragment.DEBUG_SOURCE :
    ol.renderer.webgl.vectorlayer2.shader.PointCollectionFragment.OPTIMIZED_SOURCE;



/**
 * @constructor
 * @extends {ol.webgl.shader.Vertex}
 */
ol.renderer.webgl.vectorlayer2.shader.PointCollectionVertex = function() {
  goog.base(this, ol.renderer.webgl.vectorlayer2.shader.PointCollectionVertex.SOURCE);
};
goog.inherits(ol.renderer.webgl.vectorlayer2.shader.PointCollectionVertex, ol.webgl.shader.Vertex);
goog.addSingletonGetter(ol.renderer.webgl.vectorlayer2.shader.PointCollectionVertex);


/**
 * @const
 * @type {string}
 */
ol.renderer.webgl.vectorlayer2.shader.PointCollectionVertex.DEBUG_SOURCE = 'attribute vec2 a_position;\nuniform float u_pointSize;\nuniform mat4 u_modelViewMatrix;\n\nvoid main(void) {\n  gl_Position = u_modelViewMatrix * vec4(a_position, 0., 1.);\n  gl_PointSize = u_pointSize;\n}\n\n\n';


/**
 * @const
 * @type {string}
 */
ol.renderer.webgl.vectorlayer2.shader.PointCollectionVertex.OPTIMIZED_SOURCE = 'attribute vec2 a;uniform float b;uniform mat4 c;void main(void){gl_Position=c*vec4(a,0.,1.);gl_PointSize=b;}';


/**
 * @const
 * @type {string}
 */
ol.renderer.webgl.vectorlayer2.shader.PointCollectionVertex.SOURCE = goog.DEBUG ?
    ol.renderer.webgl.vectorlayer2.shader.PointCollectionVertex.DEBUG_SOURCE :
    ol.renderer.webgl.vectorlayer2.shader.PointCollectionVertex.OPTIMIZED_SOURCE;



/**
 * @constructor
 * @param {WebGLRenderingContext} gl GL.
 * @param {WebGLProgram} program Program.
 */
ol.renderer.webgl.vectorlayer2.shader.PointCollection.Locations = function(gl, program) {

  /**
   * @type {WebGLUniformLocation}
   */
  this.u_color = gl.getUniformLocation(
      program, goog.DEBUG ? 'u_color' : 'd');

  /**
   * @type {WebGLUniformLocation}
   */
  this.u_modelViewMatrix = gl.getUniformLocation(
      program, goog.DEBUG ? 'u_modelViewMatrix' : 'c');

  /**
   * @type {WebGLUniformLocation}
   */
  this.u_pointSize = gl.getUniformLocation(
      program, goog.DEBUG ? 'u_pointSize' : 'b');

  /**
   * @type {number}
   */
  this.a_position = gl.getAttribLocation(
      program, goog.DEBUG ? 'a_position' : 'a');
};
