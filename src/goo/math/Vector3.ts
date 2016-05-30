var ObjectUtils = require('../util/ObjectUtils');
var MathUtils = require('./MathUtils');
import Vector = require('./Vector');
import Vector4 = require('./Vector4');

/**
 * Vector with 3 components.
 * @extends Vector
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @example
 * var zero = new Vector3();
 * var a = new Vector3(1, 2, 3);
 * var b = new Vector3([1, 2, 3]); // Create from array
 * var c = new Vector3(otherVector); // Create from other Vector3
 *
 * // Methods return the self object and allows for chaining:
 * a.add(b).sub(c); // a = a + b - c
 */
class Vector3 {
	x: number;
	y: number;
	z: number;
	constructor(...args) {
		/*
		// @ifdef DEBUG
		this._x = 0;
		this._y = 0;
		this._z = 0;
		// @endif
		*/

		if (arguments.length === 0) {
			// Nothing given
			this.x = 0;
			this.y = 0;
			this.z = 0;
		} else if (arguments.length === 1 && typeof arguments[0] === 'object') {
			if (arguments[0] instanceof Vector3) {
				// Vector3
				this.copy(arguments[0]);
			} else {
				// Array
				this.x = arguments[0][0];
				this.y = arguments[0][1];
				this.z = arguments[0][2];
			}
		} else {
			// Numbers
			this.x = arguments[0];
			this.y = arguments[1];
			this.z = arguments[2];
		}

		// @ifdef DEBUG
		Object.seal(this);
		// @endif
	}

/*
	// @ifdef DEBUG
	Vector.setupAliases(Vector3.prototype, [['x'], ['y'], ['z']]);
	Vector.setupIndices(Vector3.prototype, 3);
	// @endif
	Vector.setupAliases(Vector3.prototype, [['u', 'r'], ['v', 'g'], ['w', 'b']]);
*/

	/**
	 * Zero-vector (0, 0, 0)
	 * @type {Vector3}
	 */
	static ZERO = new Vector3(0, 0, 0);

	/**
	 * One-vector (1, 1, 1)
	 * @type {Vector3}
	 */
	static ONE = new Vector3(1, 1, 1);

	/**
	 * Unit-X (1, 0, 0)
	 * @type {Vector3}
	 */
	static UNIT_X = new Vector3(1, 0, 0);

	/**
	 * Unit-Y (0, 1, 0)
	 * @type {Vector3}
	 */
	static UNIT_Y = new Vector3(0, 1, 0);

	/**
	 * Unit-Z (0, 0, 1)
	 * @type {Vector3}
	 */
	static UNIT_Z = new Vector3(0, 0, 1);

	/**
	 * Returns the vector component associated with the given index.
	 * Vector components are numbered from 0 to 2 in this order: x, y, z.
	 * @param {number} index
	 * @returns {number}
	 */
	getComponent(index) {
		switch (index) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
		}
	};

	/**
	 * Sets the vector component associated with the given index to a given value.
	 * Vector components are numbered from 0 to 2 in this order: x, y, z.
	 * @param {number} index
	 * @param {number} value
	 * @returns {Vector3} Self to allow chaining
	 */
	setComponent(index, value) {
		switch (index) {
			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
		}
		return this;
	};

	/**
	 * Adds a vector to the current vector
	 * @param {Vector3} rhs
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var a = new Vector3(1, 2, 3);
	 * var b = new Vector3(4, 5, 6);
	 * a.add(b); // a == (5, 7, 9)
	 */
	add(rhs) {
		if (rhs instanceof Vector3) {
			this.x += rhs.x;
			this.y += rhs.y;
			this.z += rhs.z;
		} else if (rhs instanceof Vector4) {
			console.warn('Passing a Vector4 argument to Vector3.prototype.add is deprecated. Consider using .addDirect instead.');
			this.x += rhs.x;
			this.y += rhs.y;
			this.z += rhs.z;
		} else if (typeof (rhs) === 'object' && typeof (rhs.length) === 'number') {
			console.warn('Passing arrays to Vector3.prototype.add is deprecated - use Vector3.prototype.addDirect instead.');
			this.x += rhs[0];
			this.y += rhs[1];
			this.z += rhs[2];
		} else if (typeof (rhs) === 'number') {
			console.warn('Passing numbers to Vector3.prototype.add is deprecated - use Vector3.prototype.addDirect instead.');
			this.x += rhs;
			this.y += rhs;
			this.z += rhs;
		} else {
			console.warn('Vector3.prototype.add only supports vector arguments now.');
		}

		return this;
	};

	/**
	 * Adds numbers 'x', 'y', 'z' to the current Vector3 values
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(1, 2, 3);
	 * v.addDirect(2, 4, 6); // v == (3, 6, 9)
	 */
	addDirect(x, y, z) {
		this.x += x;
		this.y += y;
		this.z += z;

		return this;
	};

	/**
	 * Adds a vector from the current vector
	 * @param {Vector3} rhs
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var a = new Vector3(4, 5, 6);
	 * var b = new Vector3(1, 2, 3);
	 * a.sub(b); // a == (3, 3, 3)
	 */
	sub(rhs) {
		this.x -= rhs.x;
		this.y -= rhs.y;
		this.z -= rhs.z;

		return this;
	};

	/**
	 * Subtracts numbers 'x', 'y', 'z' from the current Vector3
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(); // v == (0, 0, 0)
	 * v.subDirect(1, 2, 3); // v == (-1, -2, -3)
	 */
	subDirect(x, y, z) {
		this.x -= x;
		this.y -= y;
		this.z -= z;

		return this;
	};

	/**
	 * Performs component-wise negation of the vector
	 * @returns {Vector3} Self to allow chaining
	 */
	negate() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;

		return this;
	};

	/**
	 * Multiplies the current vector by another vector
	 * @param {Vector3} rhs
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var a = new Vector3(4, 5, 6);
	 * var b = new Vector3(1, 2, 3);
	 * a.mul(b); // a == (4, 10, 18)
	 */
	mul(rhs) {
		if (typeof (rhs) === 'number') {
			console.warn('Vector3.prototype.mul only accepts vector arguments now. Please use Vector3.prototype.scale instead.');
			this.x *= rhs;
			this.y *= rhs;
			this.z *= rhs;
		} else {
			this.x *= rhs.x;
			this.y *= rhs.y;
			this.z *= rhs.z;
		}

		return this;
	};

	/**
	 * Multiplies the current Vector3 by numbers 'x', 'y', 'z' as inputs
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(1, 2, 3);
	 * v.mulDirect(2, 4, 6); // v == (2, 8, 18)
	 */
	mulDirect(x, y, z) {
		this.x *= x;
		this.y *= y;
		this.z *= z;

		return this;
	};

	/**
	 * Scales the vector by a factor
	 * @param {number} factor
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(1, 2, 3);
	 * v.scale(2); // v == (2, 4, 6)
	 */
	scale(factor) {
		this.x *= factor;
		this.y *= factor;
		this.z *= factor;

		return this;
	};

	/**
	 * Divides the current Vector3 by another vector
	 * @param {Vector3} rhs
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(2, 4, 6);
	 * v.div(1, 2, 3); // v == (2, 2, 2)
	 */
	div(rhs) {
		if (typeof (rhs) === 'number') {
			console.warn('Passing a number argument to Vector3.prototype.div is deprecated. Use Vector3.prototype.divDirect instead.');
			this.x /= rhs;
			this.y /= rhs;
			this.z /= rhs;
		} else {
			this.x /= rhs.x;
			this.y /= rhs.y;
			this.z /= rhs.z;
		}

		return this;
	};

	/**
	 * Divides the current Vector3 by numbers 'x', 'y', 'z' as inputs
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(2, 4, 6);
	 * v.divDirect(1, 2, 3); // v == (2, 2, 2)
	 */
	divDirect(x, y, z) {
		this.x /= x;
		this.y /= y;
		this.z /= z;

		return this;
	};

	/**
	 * Computes the dot product between the current vector and another vector
	 * @param {Vector3} rhs
	 * @returns {number}
	 * @example
	 * var a = new Vector3(1, 0, 0);
	 * var b = new Vector3(0, 1, 0);
	 * a.dot(b) === 0; // true
	 */
	dot(rhs) {
		return this.x * rhs.x +
			this.y * rhs.y +
			this.z * rhs.z;
	};

	/**
	 * Computes the dot product between the current vector and another vector given as 3 values
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {number}
	 */
	dotDirect(x, y, z) {
		return this.x * x +
			this.y * y +
			this.z * z;
	};

	/**
	 * Returns whether this vector is aproximately equal to a given vector
	 * @param rhs
	 * @returns {boolean}
	 */
	equals(rhs) {
		var eps = MathUtils.EPSILON;
		return (Math.abs(this.x - rhs.x) <= eps) &&
			(Math.abs(this.y - rhs.y) <= eps) &&
			(Math.abs(this.z - rhs.z) <= eps);
	};

	/**
	 * Returns whether this vector is approximately equal to a given vector given as 3 values
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {boolean}
	 */
	equalsDirect(x, y, z) {
		var eps = MathUtils.EPSILON;
		return (Math.abs(this.x - x) <= eps) &&
			(Math.abs(this.y - y) <= eps) &&
			(Math.abs(this.z - z) <= eps);
	};

	/**
	 * Computes the cross product between the current Vector3 and another vector
	 * @param {Vector3} rhs
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var a = new Vector3(0, 1, 0);
	 * var b = new Vector3(0, 0, -1);
	 * a.cross(b); // a == (-1, 0, 0)
	 */
	cross(rhs) {
		var x = this.x;
		var y = this.y;
		var z = this.z;

		this.x = rhs.z * y - rhs.y * z;
		this.y = rhs.x * z - rhs.z * x;
		this.z = rhs.y * x - rhs.x * y;

		return this;
	};

	/**
	 * Computes the cross product between the current Vector3 and another vector given as 3 values
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var a = new Vector3(0, 1, 0);
	 * var b = new Vector3(0, 0, -1);
	 * a.cross(b); // a == (-1, 0, 0)
	 */
	crossDirect(x, y, z) {
		var thisX = this.x;
		var thisY = this.y;
		var thisZ = this.z;

		this.x = z * thisY - y * thisZ;
		this.y = x * thisZ - z * thisX;
		this.z = y * thisX - x * thisY;

		return this;
	};

	/**
	 * Linearly interpolates between the current Vector3 and an 'end' Vector3
	 * @param {Vector3} end End Vector3
	 * @param {number} factor Interpolation factor between 0.0 and 1.0
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var from = new Vector3(1, 2, 3);
	 * var to = new Vector3(3, 4, 5);
	 * var midway = from.clone().lerp(to, 0.5); // midway == (2, 3, 4)
	 */
	lerp(end, factor) {
		this.x += (end.x - this.x) * factor;
		this.y += (end.y - this.y) * factor;
		this.z += (end.z - this.z) * factor;

		return this;
	};

	/**
	 * Reflects a vector relative to the plane obtained from the normal parameter.
	 * @param {Vector3} normal Defines the plane that reflects the vector. Assumed to be of unit length.
	 * @returns {Vector3} Self to allow chaining
	 */
	reflect(normal) {
		var tmpVec = new Vector3();
		tmpVec.copy(normal);
		tmpVec.scale(2 * this.dot(normal));
		this.sub(tmpVec);
		return this;
	}

	/**
	 * Sets the vector's values from another vector's values
	 * @param {Vector3} rhs
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(); // v == (0, 0, 0)
	 * v.set(new Vector3(2, 4, 6)); // v == (2, 4, 6)
	 */
	set(rhs) {
		if (rhs instanceof Vector3 || rhs instanceof Vector4) {
			this.x = rhs.x;
			this.y = rhs.y;
			this.z = rhs.z;
		} else {
			this.x = arguments[0];
			this.y = arguments[1];
			this.z = arguments[2];
		}

		return this;
	};

	/**
	 * Sets the vector's values from 3 numeric arguments
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3} Self to allow chaining
	 * @example
	 * var v = new Vector3(); // v == (0, 0, 0)
	 * v.setDirect(2, 4, 6); // v == (2, 4, 6)
	 */
	setDirect(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;

		return this;
	};

	setValue(componentIndex, value){
		if (componentIndex === 0) {
			this.x = value;
		} else if (componentIndex === 1) {
			this.y = value;
		} else if (componentIndex === 2) {
			this.z = value;
		}
	}

	/**
	 * Calculates the squared length/magnitude of the current Vector3.
	 * Note: When comparing the relative distances between two points it is usually sufficient
	 * to compare the squared distances, thus avoiding an expensive square root operation.
	 * @returns {number} squared length
	 * @example
	 * var v = new Vector3(0, 9, 0);
	 * v.lengthSquared(); // 81
	 */
	lengthSquared() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	};

	/**
	 * Calculates length squared of vector
	 * @returns {number} length squared
	 */
	length() {
		return Math.sqrt(this.lengthSquared());
	};

	/**
	 * Normalizes the current vector
	 * @returns {Vector3} Self to allow chaining
	 */
	normalize() {
		var length = this.length();

		if (length < MathUtils.EPSILON) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
		} else {
			this.x /= length;
			this.y /= length;
			this.z /= length;
		}

		return this;
	};

	/**
	 * Normalizes the current vector; this method does not perform special checks for zero length vectors
	 * @returns {Vector3} Self to allow chaining
	 */
	unsafeNormalize() {
		var length = this.length();

		this.x /= length;
		this.y /= length;
		this.z /= length;

		return this;
	};

	/**
	 * Computes the squared distance between the current Vector3 and another Vector3.
	 * Note: When comparing the relative distances between two points it is usually sufficient
	 * to compare the squared distances, thus avoiding an expensive square root operation.
	 * @param {Vector3} rhs Vector3
	 * @returns {number} distance squared
	 * @example
	 * var a = new Vector3(); // a == (0, 0, 0)
	 * var b = new Vector3(0, 9, 0);
	 * a.distanceSquared(b); // 81
	 */
	distanceSquared(rhs) {
		var deltaX = this.x - rhs.x;
		var deltaY = this.y - rhs.y;
		var deltaZ = this.z - rhs.z;

		return deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
	};

	/**
	 * Computes the distance between the current Vector3 and another Vector3.
	 * Note: When comparing the relative distances between two points it is usually sufficient
	 * to compare the squared distances, thus avoiding an expensive square root operation.
	 * @param {Vector3} rhs Vector3
	 * @returns {number} distance
	 * @example
	 * var a = new Vector3(); // a == (0, 0, 0)
	 * var b = new Vector3(0, 9, 0);
	 * a.distance(b); // 9
	 */
	distance(rhs) {
		return Math.sqrt(this.distanceSquared(rhs));
	};

	/**
	 * Multiplies this vector with a Matrix3
	 * @param {Matrix3} matrix
	 * @returns {Vector3} Self to allow chaining
	 */
	applyPre(matrix) {
		var source = matrix.data;

		var x = this.x;
		var y = this.y;
		var z = this.z;

		this.x = source[0] * x + source[1] * y + source[2] * z;
		this.y = source[3] * x + source[4] * y + source[5] * z;
		this.z = source[6] * x + source[7] * y + source[8] * z;

		return this;
	};

	/**
	 * Multiplies a Matrix3 with this vector
	 * @param {Matrix3} matrix
	 * @returns {Vector3} Self to allow chaining
	 */
	applyPost(matrix) {
		var source = matrix.data;

		var x = this.x;
		var y = this.y;
		var z = this.z;

		this.x = source[0] * x + source[3] * y + source[6] * z;
		this.y = source[1] * x + source[4] * y + source[7] * z;
		this.z = source[2] * x + source[5] * y + source[8] * z;

		return this;
	};

	/**
	 * Applies a Matrix4 (rotation, scale, translation) to this vector
	 * @param {Matrix4} matrix
	 * @returns {Vector3} Self to allow chaining
	 */
	applyPostPoint(matrix) {
		var source = matrix.data;

		var x = this.x;
		var y = this.y;
		var z = this.z;

		this.x = source[0] * x + source[4] * y + source[ 8] * z + source[12];
		this.y = source[1] * x + source[5] * y + source[ 9] * z + source[13];
		this.z = source[2] * x + source[6] * y + source[10] * z + source[14];

		return this;
	};

	/**
	 * Applies a Matrix4 (rotation, scale) to this vector
	 * @param {Matrix4} matrix
	 * @returns {Vector3} Self to allow chaining
	 */
	applyPostVector(matrix) {
		var source = matrix.data;

		var x = this.x;
		var y = this.y;
		var z = this.z;

		this.x = source[0] * x + source[4] * y + source[8] * z;
		this.y = source[1] * x + source[5] * y + source[9] * z;
		this.z = source[2] * x + source[6] * y + source[10] * z;

		return this;
	};

	/**
	 * Clones the vector
	 * @returns {Vector3} Clone of self
	 */
	clone() {
		return new Vector3(this.x, this.y, this.z);
	};

	/**
	 * Copies the values of another vector to this vector; an alias for .setVector
	 * @param {Vector3} Source vector
	 * @returns {Vector3} Self to allow chaining
	 */
	copy(v){
		return this.set(v);
	}

	/**
	 * Copies this vector over another. Not equivalent to `target.copy(this)` when
	 * the target vector has more components than the source vector
	 * @param {Vector} target
	 * @returns {Vector3} Self to allow chaining
	 */
	copyTo(target) {
		target.x = this.x;
		target.y = this.y;
		target.z = this.z;

		return this;
	};

	/**
	 * Returns the components of the vector in array form
	 * @returns {Array<number>}
	 */
	toArray() {
		return [this.x, this.y, this.z];
	};

	/**
	 * Creates a Vector3 given an array
	 * @param {Array<number>} array
	 * @returns {Vector3}
	 */
	static fromArray(array) {
		return new Vector3(array[0], array[1], array[2]);
	};

	/**
	 * Creates a Vector3 given 3 numbers, an array, an {x, y, z} object or another Vector3
	 * @returns {Vector3}
	 */
	static fromAny() {
		if (arguments.length === 3) {
			return Vector3.fromArray(arguments);
		} else if (arguments[0] instanceof Array) {
			return Vector3.fromArray(arguments[0]);
		} else {
			var vectorLike = arguments[0];
			return new Vector3(vectorLike.x, vectorLike.y, vectorLike.z);
		}
	};

	/**
	 * Sets the vector content from an array of numbers.
	 * @param {Array<number>} array
	 */
	setArray(array) {
		this.x = array[0];
		this.y = array[1];
		this.z = array[2];

		return this;
	};

	/*
	// @ifdef DEBUG
	Vector.addReturnChecks(Vector3.prototype, [
		'dot', 'dotDirect',
		'length', 'lengthSquared',
		'distance', 'distanceSquared'
	]);
	// @endif
	*/
}

export = Vector3;