const cross = (a1, a2, a3, b1, b2, b3) => {
    return [a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1];
}

const mod = (arr) => {
    const mod2 = arr.reduce((acc, v) => { return acc + v * v; }, 0);
    return Math.sqrt(mod2);
}

const norm = (arr) => {
    const mod2 = arr.reduce((acc, v) => { return acc + v * v; }, 0);
    const mod = Math.sqrt(mod2);
    const modi = 1 / mod;
    return arr.map(x => x * modi);
}

const mult = (w1, x1, y1, z1, w2, x2, y2, z2) => { // rotation addition
    return [
        w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
        x2 * w1 + x1 * w2 + y1 * z2 - z1 * y2,
        y2 * w1 + y1 * w2 + z1 * x2 - x1 * z2,
        z2 * w1 + z1 * w2 + x1 * y2 - y1 * x2
    ];
}

const rotate = (x, y, z, q0, q1, q2, q3) => { // quaternion rotation
    const [x2, y2, z2] = [x * 2, y * 2, z * 2];
    const [q02, q12, q22, q32] = [q0 * q0, q1 * q1, q2 * q2, q3 * q3];
    const [q0q1, q0q2, q0q3, q1q2, q1q3, q2q3] = [q0 * q1, q0 * q2, q0 * q3, q1 * q2, q1 * q3, q2 * q3];

    return [
        x * (q02 + q12 - q22 - q32) + y2 * (q1q2 - q0q3) + z2 * (q0q2 + q1q3),
        x2 * (q0q3 + q1q2) + y * (q02 - q12 + q22 - q32) + z2 * (q2q3 - q0q1),
        x2 * (q1q3 - q0q2) + y2 * (q0q1 + q2q3) + z * (q02 - q12 - q22 + q32)
    ];
}

const types = {
    "OrthogonalCamera": 0,
    "PerspectiveCamera": 1,
    "DirectionalLight": 2,
    "PointLight": 3,
}

let ok, ctype;
let cont, contmu, obj, hlp, type, tar, notifyCaller, r;

let x0, y0, x1, y1;
let dragging, panning, rolling, inverse;

let _MBDown, _MMove, _MBUp, _MBMenu, _MWHL;

const orbitObject0 = (pit, yaw) => {

    const cq = obj.quaternion;
    const qt = [cq.w, cq.x, cq.y, cq.z];
    const [cx, cy, cz] = [rotate(1, 0, 0, ...qt), rotate(0, 1, 0, ...qt), rotate(0, 0, -1, ...qt)];
    const rot = [cx[0] * pit + cy[0] * yaw, cx[1] * pit + cy[1] * yaw, cx[2] * pit + cy[2] * yaw];
    const rotm = mod(rot);
    const th = 0.5 * Math.asin(rotm / (rotm * rotm + 1));
    const sin = Math.sin(th);
    const q3 = cross(...rot, ...cz);
    const q = norm([Math.cos(th), ...q3.map(x => x * sin)]); // input rotation quaternion

    const qn = mult(...q, ...qt);
    const czn = rotate(0, 0, -1, ...qn);

    obj.setRotationFromQuaternion({ x: qn[1], y: qn[2], z: qn[3], w: qn[0] });
    obj.position.set(tar[0] - czn[0] * r, tar[1] - czn[1] * r, tar[2] - czn[2] * r);
    if (hlp) hlp.position.copy(obj.position);
}

const orbitObject1 = (fi, th) => {

    fi *= 0.1;
    th *= -0.1;

    const cq = obj.quaternion;
    const qt = [cq.w, cq.x, cq.y, cq.z];

    const qfi = [Math.cos(fi), 0, Math.sin(fi), 0];

    const qn = mult(...qfi, ...qt);
    const qth3 = rotate(1, 0, 0, ...qn);

    const sin = Math.sin(th);
    const qth = norm([Math.cos(th), ...qth3.map(x => x * sin)]);

    const qn2 = mult(...qth, ...qn);
    const czn2 = rotate(0, 0, -1, ...qn2);

    obj.setRotationFromQuaternion({ x: qn2[1], y: qn2[2], z: qn2[3], w: qn2[0] });
    obj.position.set(tar[0] - czn2[0] * r, tar[1] - czn2[1] * r, tar[2] - czn2[2] * r);
    if (hlp) hlp.position.copy(obj.position);
}

const panObject0 = (hor, ver) => {

    const cq = obj.quaternion;
    const qt = [cq.w, cq.x, cq.y, cq.z];
    const [cx, cy, cz] = [rotate(1, 0, 0, ...qt), rotate(0, 1, 0, ...qt), rotate(0, 0, -1, ...qt)];
    const pan = [cx[0] * hor + cy[0] * ver, cx[1] * hor + cy[1] * ver, cx[2] * hor + cy[2] * ver];

    for (let i = 0; i < 3; i++) tar[i] += pan[i];

    obj.position.set(tar[0] - cz[0] * r, tar[1] - cz[1] * r, tar[2] - cz[2] * r);
    if (hlp) hlp.position.copy(obj.position);
}

const panObject1 = panObject0;

const zoomObject0 = () => {
    const cq = obj.quaternion;
    const qt = [cq.w, cq.x, cq.y, cq.z];
    const cz = rotate(0, 0, -1, ...qt);
    obj.position.set(tar[0] - cz[0] * r, tar[1] - cz[1] * r, tar[2] - cz[2] * r);
    if (hlp) hlp.position.copy(obj.position);
}

const zoomObject1 = zoomObject0;

const rollObject0 = (th) => {
    const cq = obj.quaternion;
    const qt = [cq.w, cq.x, cq.y, cq.z];
    const cz = rotate(0, 0, -1, ...qt);
    th /= 2;
    const sin = Math.sin(th);
    const qn = mult(Math.cos(th), ...cz.map(x => x * sin), ...qt);
    obj.setRotationFromQuaternion({ x: qn[1], y: qn[2], z: qn[3], w: qn[0] });
}

const rollObject1 = rollObject0;

function _orbitObject() { eval(`orbitObject${ctype}(...arguments)`) }
function _panObject() { eval(`panObject${ctype}(...arguments)`) }
function _zoomObject() { eval(`zoomObject${ctype}(...arguments)`) }
function _rollObject() { eval(`rollObject${ctype}(...arguments)`) }

function Translate() { ctype = 2; init.call(this, ...arguments) }
Translate.prototype.getObj = function () { return [obj, tar] }
Translate.prototype.setActive = function (flag) { setActive.call(this, flag) }

function Orbital() { ctype = 1; init.call(this, ...arguments) }
Orbital.prototype.getObj = function () { return [obj, tar] }
Orbital.prototype.setActive = function (flag) { setActive.call(this, flag) }

function Trackball() { ctype = 0; init.call(this, ...arguments) }
Trackball.prototype.getObj = function () { return [obj, tar] } 
Trackball.prototype.setActive = function(flag) { setActive.call(this, flag) }

function init(container, _obj, target, callback, scene, helper, usepage = true) {

    [x0, y0] = [0, 0];
    [x1, y1] = [0, 0];
    [dragging, panning, rolling] = [false, false, false];

    ok = true;
    type = types[_obj.type];
    if (type == undefined) {
        ok = false;
        console.error(`CONTROLS.init: unsupported type '${_obj.type}'`);
        return {};
    }

    cont = container;
    obj = _obj;
    hlp = helper;
    tar = target ? [target.position.x, target.position.y, target.position.z] : [0, 0, 0];
    notifyCaller = callback || function () { };
    contmu = usepage ? document.body : cont; // container for mouse up & move events

    obj.lookAt(...tar);

    inverse = type < 2 ? 1 : -1; // inverse input for cameras

    if (hlp) {
        hlp.position.copy(obj.position);
        scene.add(hlp);
    }

    if (type == 2) { // dir light
        obj.target = target;
        scene.add(target);
    }

    [this.sensX, this.sensY, this.sensZ, this.sensP, this.sensR] = [0.02, 0.01, 1.1, 12.0, 0.8];
}

function setActive(flag) {
    if (!ok) return;
    if (flag) {
        const cpos = obj.position;
        r = mod([cpos.x - tar[0], cpos.y - tar[1], cpos.z - tar[2]]);

        _MBDown = MBDown.bind(this);
        _MMove = MMove.bind(this);
        _MBUp = MBUp.bind(this);
        _MBMenu = MBMenu.bind(this);
        _MWHL = MWHL.bind(this);

        cont.addEventListener('mousedown', _MBDown);
        contmu.addEventListener('mousemove', _MMove);
        contmu.addEventListener('mouseup', _MBUp);
        cont.addEventListener('contextmenu', _MBMenu);
        cont.addEventListener('wheel', _MWHL);
    }
    else {
        cont.removeEventListener('mousedown', _MBDown);
        contmu.removeEventListener('mousemove', _MMove);
        contmu.removeEventListener('mouseup', _MBUp);
        cont.removeEventListener('contextmenu', _MBMenu);
        cont.removeEventListener('wheel', _MWHL);
    }
}

function MBDown(evt) {
    [x0, y0] = [-evt.clientX, -evt.clientY];
    [x1, y1] = [x0, y0];
    if (evt.button == 0 && !evt.ctrlKey && !panning && !rolling)
        dragging = true;
    else if (evt.button == 2 && !dragging && !rolling)
        panning = true;
    else if (evt.button == 0 && evt.ctrlKey && !panning && !dragging)
        rolling = true;
}  

function MMove(evt) {
    if (dragging || panning || rolling) {

        [x1, y1] = [-evt.clientX, -evt.clientY];
        const hor = inverse * (x1 - x0) * this.sensX;
        const ver = inverse * (y0 - y1) * this.sensY;

        if (hor || ver) {
            if (dragging)
                _orbitObject(hor, ver);
            else if (panning)
                _panObject(hor * this.sensP, ver * this.sensP);
            else if (rolling)
                _rollObject(hor * this.sensR);

            notifyCaller();
        }

        [x0, y0] = [x1, y1];
    }
}

function MBUp(evt) {

    if (dragging || panning || rolling) {

        [x1, y1] = [-evt.clientX, -evt.clientY];
        const hor = inverse * (x1 - x0) * this.sensX;
        const ver = inverse * (y0 - y1) * this.sensY;

        if (hor || ver) {
            if (evt.button == 0 && !evt.ctrlKey)
                _orbitObject(hor, ver);
            else if (evt.button == 0 && evt.ctrlKey)
                _rollObject(hor * this.sensR);
            else if (evt.button == 2) 
                _panObject(hor * this.sensP, ver * this.sensP);

            notifyCaller();
        }

        dragging = false;
        panning = false;
        rolling = false;
    }

    [x0, y0] = [0, 0];
    [x1, y1] = [0, 0];
}

function MBMenu(evt) {
    evt.preventDefault();
}

function MWHL(evt) {
    evt.preventDefault();
    const dir = Math.sign(evt.deltaY);
    if (dir > 0)
        r *= this.sensZ;
    else
        r /= this.sensZ;
    _zoomObject();
    notifyCaller();
}

export { Trackball, Orbital, Translate }
