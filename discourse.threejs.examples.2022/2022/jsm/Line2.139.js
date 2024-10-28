import { LineSegments2 } from '../jsm/LineSegments2.139.js';
import { LineGeometry } from '../jsm/LineGeometry.139.js';
import { LineMaterial } from '../jsm/LineMaterial.139.js';

class Line2 extends LineSegments2 {

	constructor( geometry = new LineGeometry(), material = new LineMaterial( { color: Math.random() * 0xffffff } ) ) {

		super( geometry, material );

		this.type = 'Line2';

	}

}

Line2.prototype.isLine2 = true;

export { Line2 };
