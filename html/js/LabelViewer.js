function LabelViewer(panels, container) {
    this.panels = panels;
    this.container = container;
    this.labels = [];

    this.draw();
}

LabelViewer.prototype.draw = function () {
    this.panels.all().forEach(function (panel) {
        //if (panel.name == '7P') {
        panel.edges(panels).forEach(function(edge) {
            var label = this.drawOne(edge);
            this.labels.push(label);
            this.container.appendChild(label.dom);
        }.bind(this));
        //}
    }.bind(this));
};

LabelViewer.prototype.drawOne = function (edge) {
    var quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(edge.panel.normal, new THREE.Vector3(0, 0, 1));

    //console.log(edge.panel.name, 'v1', edge.v1, 'v2', edge.v2);
    var v1 = edge.v1.clone().applyQuaternion(quaternion);
    var v2 = edge.v2.clone().applyQuaternion(quaternion);
    //console.log(edge.panel.name, 'v1', v1, 'v2', v2, '*** rotated');

    var vector = v1.clone().sub(v2);
    var angle = Math.atan2(vector.y, -vector.x) / (2 * Math.PI) * 360;
    //console.log('endpoints of edge between ', edge.panel.name, 'and', edge.otherPanel.name, ':', v1, v2, 'angle:', angle);

    return new Label(edge, angle);
};

LabelViewer.prototype.filterLabels = function(re) {
    this.labels.forEach(function(label) {
        var matchesPanel = re.test(label.panel.name);
        console.log(label.panel.name, 'is', matchesPanel);
        label.dom.classList.toggle('invisible', !matchesPanel);
    });
};

function Label(edge, angle) {
    this.edge = edge;
    this.panel = edge.panel;

    var upperEdge = false;

    // no upside-downsies
    if (angle > 90) {
        angle -= 180;
        upperEdge = !upperEdge;
    }
    if (angle < -90) {
        angle += 180;
        upperEdge = !upperEdge;
    }

    this.dom = this.createDiv('label');

    //var borderLeft = this.createDiv('label-border-left');
    //borderLeft.innerText = "x: 14'4 1/2\"\n" +
    //    "y:  7'11 3/8\"\n" +
    //    "z:  4' 3 1/3\"";
    //this.dom.appendChild(borderLeft);

    var nameDiv = this.createDiv('name');
    var re = this.panel.name.match(/^(.+?)([DP]?)$/);
    var nameClass = 'name' + this.panel.name.length;
    nameDiv.innerHTML = '<div class="name ' + nameClass + '">' + re[1] + '<span class="side">' + re[2] + '</span></div>';
    if (this.panel.info) {
        var sectionClass = 'section';
        if (this.panel.info.section.length > 10) {
            sectionClass = 'section section10';
        } else if (this.panel.info.section.length > 6) {
            sectionClass = 'section section8';
        }
      nameDiv.innerHTML += '<div class="' + sectionClass + '">(' + this.panel.info.section + ')</div>';
    }

    nameDiv.style.transform = 'rotate(' + angle + 'deg)';

    // show label rotated:
    this.dom.style.transform = 'rotate(' + (0 - angle) + 'deg)';

    if (edge.otherPanel && edge.otherPanel.isPanel()) {
        var otherPanelName = edge.otherPanel ? edge.otherPanel.name : '';
        var otherPanelDiv = this.createDiv('other', otherPanelName);
        if (!upperEdge) otherPanelDiv.classList.add('lower');
        otherPanelDiv.style.transform = 'rotate(' + angle + 'deg)';
        this.dom.appendChild(otherPanelDiv);

        var otherArrowPanelDiv = this.createDiv('other-arrow');
        if (upperEdge) {
            otherArrowPanelDiv.innerText = '⇧';
        } else {
            otherArrowPanelDiv.innerText = '⇩';
            otherArrowPanelDiv.classList.add('lower');
        }
        this.dom.appendChild(otherArrowPanelDiv);
    }

    this.dom.appendChild(nameDiv);

    var upDiv = this.createDiv('up');
    upDiv.innerHTML = '↑<div class="u">U</div><div class="p">P</div>';
    upDiv.style.transform = 'rotate(' + angle + 'deg)';
    this.dom.appendChild(upDiv);

    var logo = document.createElement('img');
    logo.classList.add('logo');
    logo.src = 'BAAAHS2015LogoWithBorder-320x272.png';
    logo.style.transform = 'rotate(' + angle + 'deg)';
    this.dom.appendChild(logo);
}

Label.prototype.createDiv = function (clazz, innerText) {
    var div = document.createElement('div');
    div.classList.add(clazz);
    if (innerText != null) {
        div.innerText = innerText;
    }
    return div;
};