goog.provide('ol.test.geom.CubicBezier');

describe('ol.geom.CubicBezier', function() {
  it('creates an instance', function() {
    var cb = new ol.geom.CubicBezier([[1, 1], [0, 2], [2, 1], [3, 4]]);
    expect(cb).to.be.a(ol.geom.CubicBezier);
  });
});

describe('#dRootN', function() {
  it('with 2 roots', function() {
    var n = ol.geom.CubicBezier.dRootN(1, 2, 1, 4);
    expect(n).to.be(4);
  });
});

describe('#dRootM', function() {
  it('with 2 roots', function() {
    var m = ol.geom.CubicBezier.dRootM(1, 2, 1);
    expect(m).to.be(0);
  });
});

describe('#dRootQ', function() {
  it('with 2 roots', function() {
    var q = ol.geom.CubicBezier.dRootQ(1, 2);
    expect(q).to.be(-1);
  });
});

describe('#dRootR', function() {
  it('with 2 roots', function() {
    var q = ol.geom.CubicBezier.dRootR(0, 4, -1);
    expect(q).to.be(12);
  });
});

describe('#dRoots()', function() {
  it('with no root', function() {
    var r1 = ol.geom.CubicBezier.dRoots(1, 0, 2, 3);
    expect(r1.length).to.be(0);
  });
  it('with 2 roots', function() {
    var r2 = ol.geom.CubicBezier.dRoots(1, 2, 1, 4);
    var sq3_2 = Math.sqrt(3) / 6;
    expect(r2.length).to.be(2);
    expect(r2[0], sq3_2);
    expect(r2[1], -sq3_2);
  });
});

goog.require('ol.geom.CubicBezier');
