function Panel(mesh) {
    this.mesh = mesh;
    this.name = mesh.name;
    this.info = panelInfos[this.name];
    if (this.info == null) {
        console.log('No info for ' + this.name + '.');
    }

    var label = document.createElement('div');
    label.className = 'panel-label';
    label.innerHTML = '<div class="name">' + this.name + "</div>";
    if (this.info) {
        label.innerHTML += '<div class="section">' + this.info.section + '</div>';
    }
    container.appendChild(label);

    this.geometry = mesh.geometry;

    this.label = label;

    if (this.info) {
        this.color = new THREE.Color(BAAAHS.Geometry.SECTION_COLORS[this.info.section]);
    } else if (BAAAHS.Geometry.SECTION_COLORS[this.name]) {
        this.color = new THREE.Color(BAAAHS.Geometry.SECTION_COLORS[this.name]);
    } else {
        this.color = new THREE.Color("#ffffff");
    }
}

Panel.prototype.updateStyle = function () {
    this.mesh.material.side = THREE.DoubleSide;

    this.mesh.material.color = this.color;

    if (this.outline) this.mesh.parent.add(this.outline);
};

Panel.prototype.getCentroid = function () {
    var centroid = new THREE.Vector3();
    var vertexCount = 0;
    for (var i = 0; i < this.mesh.geometry.vertices.length; i++) {
        centroid.add(this.mesh.geometry.vertices[i]);
        vertexCount++;
    }
    centroid.divideScalar(vertexCount);
    return centroid;
};

Panel.prototype.hideLabel = function () {
    if (!this.label.classList.contains('hidden')) {
        this.label.classList.add('hidden');
    }
};

Panel.prototype.showLabel = function () {
    if (this.label.classList.contains('hidden')) {
        this.label.classList.remove('hidden');
    }
};

Panel.prototype.positionLabel = function () {
//    if (this.name.indexOf('P') > -1) {
//      this.hideLabel();
//      return;
//    }

    var center = this.mesh.localToWorld(this.getCentroid());
    this.geometry.computeBoundingBox();
    var box = this.geometry.boundingBox;
    var boxMin = toScreenPosition(box.min);
    var boxMax = toScreenPosition(box.max);
    boxMin = new THREE.Vector2(boxMin.x, boxMin.y);
    boxMax = new THREE.Vector2(boxMax.x, boxMax.y);
    var boxSize = Math.sqrt(boxMax.distanceToSquared(boxMin));

    if (this.name == '7D') {
        document.getElementById('panel-misc-info-1').innerText =
            'topleft: ' + boxMin.x + ", " + boxMin.y + "\n" +
            'botrght: ' + boxMax.x + ", " + boxMax.y + "\n" +
            'dist: ' + boxSize;
    } else if (this.name == '7P') {
        document.getElementById('panel-misc-info-2').innerText =
            'topleft: ' + boxMin.x + ", " + boxMin.y + "\n" +
            'botrght: ' + boxMax.x + ", " + boxMax.y + "\n" +
            'dist: ' + boxSize;
    }

    var fontSize = (boxSize / 400 * 18).toFixed();
    fontSize = Math.min(fontSize, 36);
//    var size = box.max.clone().sub(box.min);
    var centerPixels = toScreenPosition(center);

    this.label.style.left = centerPixels.x + 'px';
    this.label.style.top = centerPixels.y + 'px';

    var normalMatrix = new THREE.Matrix3().getNormalMatrix(this.mesh.matrixWorld);

    this.mesh.geometry.computeFaceNormals();
    var v = new THREE.Vector3(0);
    this.mesh.geometry.faces.forEach(function (face) {
        v.add(face.normal);
    });
    v.divideScalar(this.mesh.geometry.faces.length);

    var worldNormal = v.clone().applyMatrix3(normalMatrix).normalize();
    var cameraDirection = camera.getWorldDirection();
    var dot = worldNormal.clone().dot(cameraDirection);
    if (dot > -0.5) {
        this.hideLabel();
    } else {
        this.showLabel();
    }

//    if (this.name == '7D') {
//      document.getElementById('panel-7d-direction').innerText = dot;
//    } else if (this.name == '7P') {
//      document.getElementById('panel-7p-direction').innerText = dot;
//    } else if (this.name == '17D') {
//      document.getElementById('panel-17d-direction').innerText = dot;
//    } else if (this.name == '17P') {
//      document.getElementById('panel-17p-direction').innerText = dot;
//    }

    var camDist = camera.position.clone().distanceToSquared(center);
//    var fontSize = 1000000.0 / camDist / 18;
//    if (this.name == '7D') console.log("world normal for " + this.name + ":", v, cameraDirection, '...', dot, '__', fontSize);
//    if (this.name == '7D') console.log('cam dist for ' + this.name + ' is ' + camDist / 1000, boxSize, fontSize);
    this.label.style.fontSize = fontSize + 'pt';
};