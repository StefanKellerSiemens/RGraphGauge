RGraph = window.RGraph || {isRGraph: true};
RGraph.Gauge = function (conf) {
    if (typeof conf === 'object' && typeof conf.id === 'string') {
        var id = conf.id
        var canvas = document.getElementById(id);
        var min = conf.min;
        var max = conf.max;
        var value = conf.value;
        var parseConfObjectForOptions = true;
    } else {
        var id = conf;
        var canvas = document.getElementById(id);
        var min = arguments[1];
        var max = arguments[2];
        var value = arguments[3];
    }
    this.id = id;
    this.canvas = canvas;
    this.context = this.canvas.getContext ? this.canvas.getContext("2d", {alpha: (typeof id === 'object' && id.alpha === false) ? false : true}) : null;
    this.canvas.__object__ = this;
    this.type = 'gauge';
    this.min = RGraph.stringsToNumbers(min);
    this.max = RGraph.stringsToNumbers(max);
    this.value = RGraph.stringsToNumbers(value);
    this.isRGraph = true;
    this.currentValue = null;
    this.uid = RGraph.CreateUID();
    this.canvas.uid = this.canvas.uid ? this.canvas.uid : RGraph.CreateUID();
    this.colorsParsed = false;
    this.coordsText = [];
    this.original_colors = [];
    this.firstDraw = true;
    if (typeof (this.value) == 'object') {
        for (var i = 0; i < this.value.length; ++i) {
            if (this.value[i] > this.max) this.value[i] = max;
            if (this.value[i] < this.min) this.value[i] = min;
        }
    } else {
        if (this.value > this.max) this.value = max;
        if (this.value < this.min) this.value = min;
    }
    this.properties = {
        'chart.angles.start': null,
        'chart.angles.end': null,
        'chart.centerx': null,
        'chart.centery': null,
        'chart.radius': null,
        'chart.gutter.left': 15,
        'chart.gutter.right': 15,
        'chart.gutter.top': 15,
        'chart.gutter.bottom': 15,
        'chart.border.width': 10,
        'chart.title.top': '',
        'chart.title.top.font': 'Segoe UI, Arial, Verdana, sans-serif',
        'chart.title.top.size': 14,
        'chart.title.top.color': '#333',
        'chart.title.top.bold': false,
        'chart.title.top.pos': null,
        'chart.title.bottom': '',
        'chart.title.bottom.font': 'Segoe UI, Arial, Verdana, sans-serif',
        'chart.title.bottom.size': 14,
        'chart.title.bottom.color': '#333',
        'chart.title.bottom.bold': false,
        'chart.title.bottom.pos': null,
        'chart.text.font': 'Segoe UI, Arial, Verdana, sans-serif',
        'chart.text.color': '#666',
        'chart.text.size': 12,
        'chart.text.accessible': true,
        'chart.text.accessible.overflow': 'visible',
        'chart.text.accessible.pointerevents': true,
        'chart.background.color': 'white',
        'chart.background.gradient': false,
        'chart.scale.decimals': 0,
        'chart.scale.point': '.',
        'chart.scale.thousand': ',',
        'chart.units.pre': '',
        'chart.units.post': '',
        'chart.value.text': false,
        'chart.value.text.y.pos': 0.5,
        'chart.value.text.units.pre': null,
        'chart.value.text.units.post': null,
        'chart.value.text.color': 'black',
        'chart.value.text.bounding': true,
        'chart.value.text.bounding.fill': 'white',
        'chart.value.text.bounding.stroke': 'black',
        'chart.red.start': 0.9 * this.max,
        'chart.red.color': '#DC3912',
        'chart.red.width': 10,
        'chart.yellow.color': '#FF9900',
        'chart.yellow.width': 10,
        'chart.green.end': 0.7 * this.max,
        'chart.green.color': 'rgba(0,0,0,0)',
        'chart.green.width': 10,
        'chart.colors.ranges': null,
        'chart.needle.size': null,
        'chart.needle.tail': false,
        'chart.needle.colors': ['#D5604D', 'red', 'green', 'yellow'],
        'chart.needle.type': 'triangle',
        'chart.needle.width': 7,
        'chart.border.outer': '#ccc',
        'chart.border.inner': '#f1f1f1',
        'chart.border.outline': 'black',
        'chart.centerpin.color': 'blue',
        'chart.centerpin.radius': null,
        'chart.zoom.background': true,
        'chart.zoom.action': 'zoom',
        'chart.tickmarks.small': 25,
        'chart.tickmarks.small.color': 'black',
        'chart.tickmarks.medium': 0,
        'chart.tickmarks.medium.color': 'black',
        'chart.tickmarks.big': 5,
        'chart.tickmarks.big.color': 'black',
        'chart.labels.count': 5,
        'chart.labels.centered': false,
        'chart.labels.offset.radius': 0,
        'chart.labels.offset.angle': 0,
        'chart.labels.specific': null,
        'chart.labels.offsetx': 0,
        'chart.labels.offsety': 0,
        'chart.border.gradient': false,
        'chart.adjustable': false,
        'chart.shadow': true,
        'chart.shadow.color': 'gray',
        'chart.shadow.offsetx': 0,
        'chart.shadow.offsety': 0,
        'chart.shadow.blur': 15,
        'chart.clearto': 'rgba(0,0,0,0)'
    }
    if (!this.canvas.__rgraph_aa_translated__) {
        this.context.translate(0.5, 0.5);
        this.canvas.__rgraph_aa_translated__ = true;
    }
    var RG = RGraph, ca = this.canvas, co = ca.getContext('2d'), prop = this.properties, pa2 = RG.path2, win = window,
        doc = document, ma = Math
    if (RG.Effects && typeof RG.Effects.decorate === 'function') {
        RG.Effects.decorate(this);
    }
    this.set = this.Set = function (name) {
        var value = typeof arguments[1] === 'undefined' ? null : arguments[1];
        if (arguments.length === 1 && typeof name === 'object') {
            RG.parseObjectStyleConfig(this, name);
            return this;
        }
        if (name.substr(0, 6) != 'chart.') {
            name = 'chart.' + name;
        }
        while (name.match(/([A-Z])/)) {
            name = name.replace(/([A-Z])/, '.' + RegExp.$1.toLowerCase());
        }
        if (name == 'chart.title') name = 'chart.title.top';
        if (name == 'chart.title.font') name = 'chart.title.top.font';
        if (name == 'chart.title.size') name = 'chart.title.top.size';
        if (name == 'chart.title.color') name = 'chart.title.top.color';
        if (name == 'chart.title.bold') name = 'chart.title.top.bold';
        if (name == 'chart.needle.color') {
            name = 'chart.needle.colors';
        }
        if (name == 'chart.labels.offset') {
            name = 'chart.labels.offset.radius';
        }
        prop[name] = value;
        return this;
    };
    this.get = this.Get = function (name) {
        if (name.substr(0, 6) != 'chart.') {
            name = 'chart.' + name;
        }
        while (name.match(/([A-Z])/)) {
            name = name.replace(/([A-Z])/, '.' + RegExp.$1.toLowerCase());
        }
        if (name == 'chart.needle.color') {
            name = 'chart.needle.colors';
        }
        if (name == 'chart.labels.offset') {
            name = 'chart.labels.offset.radius';
        }
        return prop[name];
    };
    this.draw = this.Draw = function () {
        RG.FireCustomEvent(this, 'onbeforedraw');
        this.currentValue = this.value;
        this.gutterLeft = prop['chart.gutter.left'];
        this.gutterRight = prop['chart.gutter.right'];
        this.gutterTop = prop['chart.gutter.top'];
        this.gutterBottom = prop['chart.gutter.bottom'];
        this.centerx = ((ca.width - this.gutterLeft - this.gutterRight) / 2) + this.gutterLeft;
        this.centery = ((ca.height - this.gutterTop - this.gutterBottom) / 2) + this.gutterTop;
        this.radius = Math.min(((ca.width - this.gutterLeft - this.gutterRight) / 2), ((ca.height - this.gutterTop - this.gutterBottom) / 2));
        this.startAngle = prop['chart.angles.start'] ? prop['chart.angles.start'] : (RG.HALFPI / 3) + RG.HALFPI;
        this.endAngle = prop['chart.angles.end'] ? prop['chart.angles.end'] : RG.TWOPI + RG.HALFPI - (RG.HALFPI / 3);
        this.coordsText = [];
        if (typeof (prop['chart.centerx']) == 'number') this.centerx = prop['chart.centerx'];
        if (typeof (prop['chart.centery']) == 'number') this.centery = prop['chart.centery'];
        if (typeof (prop['chart.radius']) == 'number') this.radius = prop['chart.radius'];
        if (!this.colorsParsed) {
            this.parseColors();
            this.colorsParsed = true;
        }
        this.centerpinRadius = 0.16 * this.radius;
        if (typeof (prop['chart.centerpin.radius']) == 'number') {
            this.centerpinRadius = prop['chart.centerpin.radius'];
        }
        if (prop['chart.contextmenu']) {
            RG.ShowContext(this);
        }
        this.DrawBackGround();
        this.DrawGradient();
        this.DrawColorBands();
        this.DrawSmallTickmarks();
        this.DrawMediumTickmarks();
        this.DrawBigTickmarks();
        this.DrawLabels();
        this.DrawTopTitle();
        this.DrawBottomTitle();
        if (typeof (this.value) == 'object') {
            for (var i = 0; i < this.value.length; ++i) {
                this.DrawNeedle(this.value[i], prop['chart.needle.colors'][i], i);
            }
        } else {
            this.DrawNeedle(this.value, prop['chart.needle.colors'][0], 0);
        }
        this.DrawCenterpin();
        if (prop['chart.resizable']) {
            RG.AllowResizing(this);
        }
        RG.InstallEventListeners(this);
        if (this.firstDraw) {
            RG.fireCustomEvent(this, 'onfirstdraw');
            this.firstDraw = false;
            this.firstDrawFunc();
        }
        RG.FireCustomEvent(this, 'ondraw');
        return this;
    };
    this.exec = function (func) {
        func(this);
        return this;
    };
    this.drawBackGround = this.DrawBackGround = function () {
        if (prop['chart.shadow']) {
            RG.SetShadow(this, prop['chart.shadow.color'], prop['chart.shadow.offsetx'], prop['chart.shadow.offsety'], prop['chart.shadow.blur']);
        }
        co.beginPath();
        co.fillStyle = prop['chart.background.color'];
        co.arc(this.centerx, this.centery, this.radius, 0, RG.TWOPI, 0);
        co.fill();
        RG.NoShadow(this);
        var grad = co.createRadialGradient(this.centerx + 50, this.centery - 50, 0, this.centerx + 50, this.centery - 50, 150);
        grad.addColorStop(0, '#eee');
        grad.addColorStop(1, 'white');
        var borderWidth = prop['chart.border.width'];
        co.beginPath();
        co.fillStyle = prop['chart.background.color'];
        co.arc(this.centerx, this.centery, this.radius, 0, RG.TWOPI, 0);
        co.fill();
        co.beginPath();
        co.fillStyle = prop['chart.border.outer'];
        co.arc(this.centerx, this.centery, this.radius, 0, RG.TWOPI, 0);
        co.fill();
        co.beginPath();
        co.fillStyle = prop['chart.border.inner'];
        co.arc(this.centerx, this.centery, this.radius - borderWidth, 0, RG.TWOPI, 0);
        co.fill();
        co.beginPath();
        co.fillStyle = prop['chart.background.color'];
        co.arc(this.centerx, this.centery, this.radius - borderWidth - 4, 0, RG.TWOPI, 0);
        co.fill();
        co.beginPath();
        co.fillStyle = prop['chart.background.color'];
        co.arc(this.centerx, this.centery, this.radius - borderWidth - 4, 0, RG.TWOPI, 0);
        co.fill();
        if (prop['chart.background.gradient']) {
            co.beginPath();
            co.fillStyle = RG.RadialGradient(this, this.centerx, this.centery, 0, this.centerx, this.centery, this.radius, 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.1)');
            co.arc(this.centerx, this.centery, this.radius - borderWidth - 4, 0, RG.TWOPI, 0);
            co.fill();
        }
        co.beginPath();
        co.strokeStyle = prop['chart.border.outline'];
        co.arc(this.centerx, this.centery, this.radius, 0, RG.TWOPI, 0);
        co.stroke();
    };
    this.drawSmallTickmarks = this.DrawSmallTickmarks = function () {
        var numTicks = prop['chart.tickmarks.small'];
        co.lineWidth = 1;
        for (var i = 0; i <= numTicks; ++i) {
            co.beginPath();
            co.strokeStyle = prop['chart.tickmarks.small.color'];
            var a = (((this.endAngle - this.startAngle) / numTicks) * i) + this.startAngle;
            co.arc(this.centerx, this.centery, this.radius - prop['chart.border.width'] - 10, a, a + 0.00001, 0);
            co.arc(this.centerx, this.centery, this.radius - prop['chart.border.width'] - 10 - 5, a, a + 0.00001, 0);
            co.stroke();
        }
    };
    this.drawMediumTickmarks = this.DrawMediumTickmarks = function () {
        if (prop['chart.tickmarks.medium']) {
            var numTicks = prop['chart.tickmarks.medium'];
            co.lineWidth = 3;
            co.lineCap = 'round';
            co.strokeStyle = prop['chart.tickmarks.medium.color'];
            for (var i = 0; i <= numTicks; ++i) {
                co.beginPath();
                var a = (((this.endAngle - this.startAngle) / numTicks) * i) + this.startAngle + (((this.endAngle - this.startAngle) / (2 * numTicks)));
                if (a > this.startAngle && a < this.endAngle) {
                    co.arc(this.centerx, this.centery, this.radius - prop['chart.border.width'] - 10, a, a + 0.00001, 0);
                    co.arc(this.centerx, this.centery, this.radius - prop['chart.border.width'] - 10 - 6, a, a + 0.00001, 0);
                }
                co.stroke();
            }
        }
    };
    this.drawBigTickmarks = this.DrawBigTickmarks = function () {
        var numTicks = prop['chart.tickmarks.big'];
        co.lineWidth = 3;
        co.lineCap = 'round';
        for (var i = 0; i <= numTicks; ++i) {
            co.beginPath();
            co.strokeStyle = prop['chart.tickmarks.big.color'];
            var a = (((this.endAngle - this.startAngle) / numTicks) * i) + this.startAngle;
            co.arc(this.centerx, this.centery, this.radius - prop['chart.border.width'] - 10, a, a + 0.00001, 0);
            co.arc(this.centerx, this.centery, this.radius - prop['chart.border.width'] - 10 - 10, a, a + 0.00001, 0);
            co.stroke();
        }
    };
    this.drawCenterpin = this.DrawCenterpin = function () {
        var offset = 6;
        var grad = co.createRadialGradient(this.centerx + offset, this.centery - offset, 0, this.centerx + offset, this.centery - offset, 25);
        grad.addColorStop(0, '#ddf');
        grad.addColorStop(1, prop['chart.centerpin.color']);
        co.beginPath();
        co.fillStyle = grad;
        co.arc(this.centerx, this.centery, this.centerpinRadius, 0, RG.TWOPI, 0);
        co.fill();
    };
    this.drawLabels = this.DrawLabels = function () {
        co.fillStyle = prop['chart.text.color'];
        var font = prop['chart.text.font'], size = prop['chart.text.size'],
            num = prop['chart.labels.specific'] ? (prop['chart.labels.specific'].length - 1) : prop['chart.labels.count'],
            offsetx = prop['chart.labels.offsetx'], offsety = prop['chart.labels.offsety'],
            offseta = prop['chart.labels.offset.angle']
        co.beginPath();
        if (num) {
            for (var i = 0; i <= num; ++i) {
                var hyp = (this.radius - 25 - prop['chart.border.width']) - prop['chart.labels.offset.radius'];
                var a = (this.endAngle - this.startAngle) / num
                a = this.startAngle + (i * a);
                a -= RG.HALFPI;
                a += offseta;
                var x = this.centerx - (ma.sin(a) * hyp);
                var y = this.centery + (ma.cos(a) * hyp);
                var hAlign = x > this.centerx ? 'right' : 'left';
                var vAlign = y > this.centery ? 'bottom' : 'top';
                if (a == RG.HALFPI) {
                    vAlign = 'center';
                } else if (a == RG.PI) {
                    hAlign = 'center';
                } else if (a == (RG.HALFPI + RG.PI)) {
                    vAlign = 'center';
                }
                if (prop['chart.labels.centered']) {
                    hAlign = 'center';
                    vAlign = 'center';
                }
                var value = (((this.max - this.min) * (i / num)) + this.min);
                RG.text2(this, {
                    'font': font,
                    'size': size,
                    'x': x + offsetx,
                    'y': y + offsety,
                    'text': prop['chart.labels.specific'] ? prop['chart.labels.specific'][i] : RG.numberFormat(this, value.toFixed(value === 0 ? 0 : prop['chart.scale.decimals']), prop['chart.units.pre'], prop['chart.units.post']),
                    'halign': hAlign,
                    'valign': vAlign,
                    'tag': prop['chart.labels.specific'] ? 'labels.specific' : 'labels'
                });
            }
        }
        co.fill();
        if (prop['chart.value.text']) {
            var x = this.centerx;
            var y = this.centery + (prop['chart.value.text.y.pos'] * this.radius);
            var units_pre = typeof (prop['chart.value.text.units.pre']) == 'string' ? prop['chart.value.text.units.pre'] : prop['chart.units.pre'];
            var units_post = typeof (prop['chart.value.text.units.post']) == 'string' ? prop['chart.value.text.units.post'] : prop['chart.units.post'];
            var color = prop['chart.value.text.color'];
            var bounding = prop['chart.value.text.bounding'];
            var boundingFill = prop['chart.value.text.bounding.fill'];
            var boundingStroke = prop['chart.value.text.bounding.stroke'];
            co.fillStyle = color;
            RG.text2(this, {
                'font': font,
                'size': size + 2,
                'x': x,
                'y': y,
                'text': RG.numberFormat(this, this.value.toFixed(prop['chart.value.text.decimals']), units_pre, units_post),
                'halign': 'center',
                'valign': 'center',
                'bounding': bounding,
                'bounding.fill': boundingFill,
                'bounding.stroke': boundingStroke,
                'tag': 'value.text'
            });
        }
    };
    this.drawTopTitle = this.DrawTopTitle = function () {
        var x = this.centerx;
        var y = this.centery - 25;
        if (typeof (prop['chart.title.top.pos']) == 'number') {
            y = this.centery - (this.radius * prop['chart.title.top.pos']);
        }
        if (prop['chart.title.top']) {
            co.fillStyle = prop['chart.title.top.color'];
            RG.Text2(this, {
                'font': prop['chart.title.top.font'],
                'size': prop['chart.title.top.size'],
                'x': x,
                'y': y,
                'text': String(prop['chart.title.top']),
                'halign': 'center',
                'valign': 'bottom',
                'bold': prop['chart.title.top.bold'],
                'tag': 'title.top'
            });
        }
    };
    this.drawBottomTitle = this.DrawBottomTitle = function () {
        var x = this.centerx;
        var y = this.centery + this.centerpinRadius + 10;
        if (typeof (prop['chart.title.bottom.pos']) == 'number') {
            y = this.centery + (this.radius * prop['chart.title.bottom.pos']);
        }
        if (prop['chart.title.bottom']) {
            co.fillStyle = prop['chart.title.bottom.color'];
            RG.Text2(this, {
                'font': prop['chart.title.bottom.font'],
                'size': prop['chart.title.bottom.size'],
                'x': x,
                'y': y,
                'text': String(prop['chart.title.bottom']),
                'halign': 'center',
                'valign': 'top',
                'bold': prop['chart.title.bottom.bold'],
                'tag': 'title.bottom'
            });
        }
    };
    this.drawNeedle = this.DrawNeedle = function (value, color, index) {
        var type = prop['chart.needle.type'];
        co.lineWidth = 0.5;
        co.strokeStyle = 'gray';
        co.fillStyle = color;
        var angle = (this.endAngle - this.startAngle) * ((value - this.min) / (this.max - this.min));
        angle += this.startAngle;
        if (typeof (prop['chart.needle.size']) == 'object' && prop['chart.needle.size'] && typeof (prop['chart.needle.size'][index]) == 'number') {
            var size = prop['chart.needle.size'][index];
        } else if (typeof (prop['chart.needle.size']) == 'number') {
            var size = prop['chart.needle.size'];
        } else {
            var size = this.radius - 25 - prop['chart.border.width'];
        }
        if (type == 'line') {
            co.beginPath();
            co.lineWidth = prop['chart.needle.width'];
            co.strokeStyle = color;
            co.arc(this.centerx, this.centery, size, angle, angle + 0.0001, false);
            co.lineTo(this.centerx, this.centery);
            if (prop['chart.needle.tail']) {
                co.arc(this.centerx, this.centery, this.radius * 0.2, angle + RG.PI, angle + 0.00001 + RG.PI, false);
            }
            co.lineTo(this.centerx, this.centery);
            co.stroke();
        } else {
            co.beginPath();
            co.arc(this.centerx, this.centery, size, angle, angle + 0.00001, false);
            co.arc(this.centerx, this.centery, this.centerpinRadius * 0.5, angle + RG.HALFPI, angle + 0.00001 + RG.HALFPI, false);
            if (prop['chart.needle.tail']) {
                co.arc(this.centerx, this.centery, this.radius * 0.2, angle + RG.PI, angle + 0.00001 + RG.PI, false);
            }
            co.arc(this.centerx, this.centery, this.centerpinRadius * 0.5, angle - RG.HALFPI, angle - 0.00001 - RG.HALFPI, false);
            co.stroke();
            co.fill();
            this.angle = angle;
        }
    };
    this.drawColorBands = this.DrawColorBands = function () {
        if (RG.is_array(prop['chart.colors.ranges'])) {
            var ranges = prop['chart.colors.ranges'];
            for (var i = 0; i < ranges.length; ++i) {
                co.fillStyle = ranges[i][2];
                co.lineWidth = 0;
                co.beginPath();
                co.arc(this.centerx, this.centery, this.radius - 10 - prop['chart.border.width'], (((ranges[i][0] - this.min) / (this.max - this.min)) * (this.endAngle - this.startAngle)) + this.startAngle, (((ranges[i][1] - this.min) / (this.max - this.min)) * (this.endAngle - this.startAngle)) + this.startAngle, false);
                co.arc(this.centerx, this.centery, this.radius - 20 - prop['chart.border.width'], (((ranges[i][1] - this.min) / (this.max - this.min)) * (this.endAngle - this.startAngle)) + this.startAngle, (((ranges[i][0] - this.min) / (this.max - this.min)) * (this.endAngle - this.startAngle)) + this.startAngle, true);
                co.closePath();
                co.fill();
            }
            return;
        }
        co.strokeStyle = prop['chart.green.color'];
        co.fillStyle = prop['chart.green.color'];
        var greenStart = this.startAngle;
        var greenEnd = this.startAngle + (this.endAngle - this.startAngle) * ((prop['chart.green.end'] - this.min) / (this.max - this.min))
        co.beginPath();
        co.arc(this.centerx, this.centery, this.radius - 10 - prop['chart.border.width'], greenStart, greenEnd, false);
        co.arc(this.centerx, this.centery, this.radius - (10 + prop['chart.green.width']) - prop['chart.border.width'], greenEnd, greenStart, true);
        co.fill();
        co.strokeStyle = prop['chart.yellow.color'];
        co.fillStyle = prop['chart.yellow.color'];
        var yellowStart = greenEnd;
        var yellowEnd = this.startAngle + (this.endAngle - this.startAngle) * ((prop['chart.red.start'] - this.min) / (this.max - this.min))
        co.beginPath();
        co.arc(this.centerx, this.centery, this.radius - 10 - prop['chart.border.width'], yellowStart, yellowEnd, false);
        co.arc(this.centerx, this.centery, this.radius - (10 + prop['chart.yellow.width']) - prop['chart.border.width'], yellowEnd, yellowStart, true);
        co.fill();
        co.strokeStyle = prop['chart.red.color'];
        co.fillStyle = prop['chart.red.color'];
        var redStart = yellowEnd;
        var redEnd = this.startAngle + (this.endAngle - this.startAngle) * ((this.max - this.min) / (this.max - this.min))
        co.beginPath();
        co.arc(this.centerx, this.centery, this.radius - 10 - prop['chart.border.width'], redStart, redEnd, false);
        co.arc(this.centerx, this.centery, this.radius - (10 + prop['chart.red.width']) - prop['chart.border.width'], redEnd, redStart, true);
        co.fill();
    };
    this.getShape = function (e) {
    };
    this.getValue = function (e) {
        var mouseXY = RG.getMouseXY(e);
        var mouseX = mouseXY[0];
        var mouseY = mouseXY[1];
        var angle = RG.getAngleByXY(this.centerx, this.centery, mouseX, mouseY);
        if (angle >= 0 && angle <= RG.HALFPI) {
            angle += RG.TWOPI;
        }
        var value = ((angle - this.startAngle) / (this.endAngle - this.startAngle)) * (this.max - this.min);
        value = value + this.min;
        if (value < this.min) {
            value = this.min
        }
        if (value > this.max) {
            value = this.max
        }
        return value;
    };
    this.getObjectByXY = function (e) {
        var mouseXY = RGraph.getMouseXY(e);
        if (mouseXY[0] > (this.centerx - this.radius) && mouseXY[0] < (this.centerx + this.radius) && mouseXY[1] > (this.centery - this.radius) && mouseXY[1] < (this.centery + this.radius) && RG.getHypLength(this.centerx, this.centery, mouseXY[0], mouseXY[1]) <= this.radius) {
            return this;
        }
    };
    this.drawGradient = this.DrawGradient = function () {
        if (prop['chart.border.gradient']) {
            co.beginPath();
            var grad = co.createRadialGradient(this.centerx, this.centery, this.radius, this.centerx, this.centery, this.radius - 15);
            grad.addColorStop(0, 'gray');
            grad.addColorStop(1, 'white');
            co.fillStyle = grad;
            co.arc(this.centerx, this.centery, this.radius, 0, RG.TWOPI, false)
            co.arc(this.centerx, this.centery, this.radius - 15, RG.TWOPI, 0, true)
            co.fill();
        }
    };
    this.adjusting_mousemove = this.Adjusting_mousemove = function (e) {
        if (prop['chart.adjustable'] && RG.Registry.Get('chart.adjusting') && RG.Registry.Get('chart.adjusting').uid == this.uid) {
            this.value = this.getValue(e);
            RG.redrawCanvas(this.canvas);
            RG.fireCustomEvent(this, 'onadjust');
        }
    };
    this.getAngle = function (value) {
        if (value > this.max || value < this.min) {
            return null;
        }
        var angle = (((value - this.min) / (this.max - this.min)) * (this.endAngle - this.startAngle)) + this.startAngle;
        return angle;
    };
    this.parseColors = function () {
        if (this.original_colors.length === 0) {
            this.original_colors['chart.background.color'] = RG.array_clone(prop['chart.background.color']);
            this.original_colors['chart.red.color'] = RG.array_clone(prop['chart.red.color']);
            this.original_colors['chart.yellow.color'] = RG.array_clone(prop['chart.yellow.color']);
            this.original_colors['chart.green.color'] = RG.array_clone(prop['chart.green.color']);
            this.original_colors['chart.border.inner'] = RG.array_clone(prop['chart.border.inner']);
            this.original_colors['chart.border.outer'] = RG.array_clone(prop['chart.border.outer']);
            this.original_colors['chart.colors.ranges'] = RG.array_clone(prop['chart.colors.ranges']);
            this.original_colors['chart.needle.colors'] = RG.array_clone(prop['chart.needle.colors']);
        }
        prop['chart.background.color'] = this.parseSingleColorForGradient(prop['chart.background.color']);
        prop['chart.red.color'] = this.parseSingleColorForGradient(prop['chart.red.color']);
        prop['chart.yellow.color'] = this.parseSingleColorForGradient(prop['chart.yellow.color']);
        prop['chart.green.color'] = this.parseSingleColorForGradient(prop['chart.green.color']);
        prop['chart.border.inner'] = this.parseSingleColorForGradient(prop['chart.border.inner']);
        prop['chart.border.outer'] = this.parseSingleColorForGradient(prop['chart.border.outer']);
        if (prop['chart.colors.ranges']) {
            var ranges = prop['chart.colors.ranges'];
            for (var i = 0; i < ranges.length; ++i) {
                ranges[i][2] = this.parseSingleColorForGradient(ranges[i][2], this.radius - 30);
            }
        }
        if (prop['chart.needle.colors']) {
            var colors = prop['chart.needle.colors'];
            for (var i = 0; i < colors.length; ++i) {
                colors[i] = this.parseSingleColorForGradient(colors[i]);
            }
        }
    };
    this.reset = function () {
    };
    this.parseSingleColorForGradient = function (color) {
        var radiusStart = arguments[1] || 0;
        if (!color || typeof (color) != 'string') {
            return color;
        }
        if (color.match(/^gradient\((.*)\)$/i)) {
            var parts = RegExp.$1.split(':');
            var grad = co.createRadialGradient(this.centerx, this.centery, radiusStart, this.centerx, this.centery, this.radius);
            var diff = 1 / (parts.length - 1);
            grad.addColorStop(0, RG.trim(parts[0]));
            for (var j = 1; j < parts.length; ++j) {
                grad.addColorStop(j * diff, RG.trim(parts[j]));
            }
        }
        return grad ? grad : color;
    };
    this.on = function (type, func) {
        if (type.substr(0, 2) !== 'on') {
            type = 'on' + type;
        }
        if (typeof this[type] !== 'function') {
            this[type] = func;
        } else {
            RG.addCustomEventListener(this, type, func);
        }
        return this;
    };
    this.firstDrawFunc = function () {
    };
    this.grow = function () {
        var obj = this;
        var opt = arguments[0] ? arguments[0] : {};
        var callback = arguments[1] ? arguments[1] : function () {
        };
        var frames = opt.frames || 30;
        var frame = 0;
        if (typeof obj.value === 'number') {
            var origValue = Number(obj.currentValue);
            if (obj.currentValue == null) {
                obj.currentValue = obj.min;
                origValue = obj.min;
            }
            var newValue = obj.value;
            var diff = newValue - origValue;
            var iterator = function () {
                obj.value = ((frame / frames) * diff) + origValue;
                if (obj.value > obj.max) obj.value = obj.max;
                if (obj.value < obj.min) obj.value = obj.min;
                RG.redrawCanvas(obj.canvas);
                if (frame++ < frames) {
                    RG.Effects.updateCanvas(iterator);
                } else {
                    callback(obj);
                }
            };
            iterator();
        } else {
            if (obj.currentValue == null) {
                obj.currentValue = [];
                for (var i = 0; i < obj.value.length; ++i) {
                    obj.currentValue[i] = obj.min;
                }
                origValue = RG.array_clone(obj.currentValue);
            }
            var origValue = RG.array_clone(obj.currentValue);
            var newValue = RG.array_clone(obj.value);
            var diff = [];
            for (var i = 0, len = newValue.length; i < len; ++i) {
                diff[i] = newValue[i] - Number(obj.currentValue[i]);
            }
            var iterator = function () {
                frame++;
                for (var i = 0, len = obj.value.length; i < len; ++i) {
                    obj.value[i] = ((frame / frames) * diff[i]) + origValue[i];
                    if (obj.value[i] > obj.max) obj.value[i] = obj.max;
                    if (obj.value[i] < obj.min) obj.value[i] = obj.min;
                }
                RG.redrawCanvas(obj.canvas);
                if (frame < frames) {
                    RG.Effects.updateCanvas(iterator);
                } else {
                    callback(obj);
                }
            };
            iterator();
        }
        return this;
    };
    RG.att(ca);
    RG.Register(this);
    if (parseConfObjectForOptions) {
        RG.parseObjectStyleConfig(this, conf.options);
    }
};