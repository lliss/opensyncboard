class Point {
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  toJSON() {
    return {
      x: this._x,
      y: this._y
    };
  }
}

export default Point;
