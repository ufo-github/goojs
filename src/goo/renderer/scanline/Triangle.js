define([
	'goo/math/Vector3'
	],
/** @lends Triangle */
function (Vector3) {

	/*
		Send in vertices ( Vector3 )
	*/
	function Triangle(v1, v2, v3) {

		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;
	};

	
	Triangle.prototype.toPixelSpace = function(width, height) {

		var v1 = new Vector3(this.v1);
		var v2 = new Vector3(this.v2);
		var v3 = new Vector3(this.v3);

		v1.x *= width;
		v2.x *= width;
		v3.x *= width;

		v1.y *= height;
		v2.y *= height;
		v3.y *= height;

		return new Triangle(v1, v2, v3);
	};

	return Triangle;
});