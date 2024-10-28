// IntersectionPoints

drawIntersectionPoints() {

        var pointsOfIntersection = new THREE.BufferGeometry();

        var a = new THREE.Vector3(),
            b = new THREE.Vector3(),
            c = new THREE.Vector3();
        var planePointA = new THREE.Vector3(),
            planePointB = new THREE.Vector3(),
            planePointC = new THREE.Vector3();
        var lineAB = new THREE.Line3(),
            lineBC = new THREE.Line3(),
            lineCA = new THREE.Line3();

        var pointOfIntersection = new THREE.Vector3();

        var mathPlane = new THREE.Plane();

        const positionAttribute = this.plane.geometry.getAttribute('position');

        const localVertex = new THREE.Vector3();

        localVertex.fromBufferAttribute(positionAttribute, 0);
        this.plane.localToWorld(planePointA.copy(localVertex));
        localVertex.fromBufferAttribute(positionAttribute, 1);
        this.plane.localToWorld(planePointB.copy(localVertex));
        localVertex.fromBufferAttribute(positionAttribute, 2);
        this.plane.localToWorld(planePointC.copy(localVertex));

        mathPlane.setFromCoplanarPoints(planePointA, planePointB, planePointC);

        var positions = [];

        const dodecaPositionAttribute = this.dodeca.geometry.getAttribute('position');
        console.log(dodecaPositionAttribute);
        for (let vertexIndex = 0; vertexIndex < dodecaPositionAttribute.count; vertexIndex += 3) {

            localVertex.fromBufferAttribute(dodecaPositionAttribute, vertexIndex);
            this.dodeca.localToWorld(a.copy(localVertex));
            localVertex.fromBufferAttribute(dodecaPositionAttribute, vertexIndex + 1);
            this.dodeca.localToWorld(b.copy(localVertex));
            localVertex.fromBufferAttribute(dodecaPositionAttribute, vertexIndex) + 2;
            this.dodeca.localToWorld(c.copy(localVertex));

            lineAB = new THREE.Line3(a, b);
            lineBC = new THREE.Line3(b, c);
            lineCA = new THREE.Line3(c, a);

            this.setPointOfIntersection(lineAB, mathPlane, positions, pointOfIntersection);
            this.setPointOfIntersection(lineBC, mathPlane, positions, pointOfIntersection);
            this.setPointOfIntersection(lineCA, mathPlane, positions, pointOfIntersection);
        }

        pointsOfIntersection.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(positions), 3));

        var pointsMaterial = new THREE.PointsMaterial({
            size: 10,
            color: 0xffff00
        });

        var points = new THREE.Points(pointsOfIntersection, pointsMaterial);
        this.scene.add(points);
    }

    setPointOfIntersection(line, plane, positions, pointOfIntersection) {
        pointOfIntersection = plane.intersectLine(line);
        if (pointOfIntersection) {
            var g = pointOfIntersection.clone();
            positions.push(g.x);
            positions.push(g.y);
            positions.push(g.z);
        };
    }