"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GroupedBarChartCtrl = void 0;

var _sdk = require("app/plugins/sdk");

var _lodash = _interopRequireDefault(require("lodash"));

var _kbn = _interopRequireDefault(require("app/core/utils/kbn"));

var _time_series = _interopRequireDefault(require("app/core/time_series"));

var d3 = _interopRequireWildcard(require("./external/d3.v3.min"));

require("./css/groupedBarChart.css!");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var panelDefaults = {
  legend: {
    show: true,
    position: 'On graph'
  },
  chartType: 'stacked bar chart',
  labelOrientation: 'horizontal',
  orientation: 'vertical',
  avgLineShow: true,
  labelSpace: 40,
  links: [],
  datasource: null,
  maxDataPoints: 3,
  interval: null,
  targets: [{}],
  cacheTimeout: null,
  nullPointMode: 'connected',
  aliasColors: {},
  format: 'short',
  valueName: 'current',
  strokeWidth: 1,
  fontSize: '80%',
  fontColor: '#fff',
  marginTop: 0,
  marginLeft: 40,
  marginBottom: 0,
  marginRight: 0,
  paddingWidth: 40,
  paddingHeight: 80,
  colorSet: [],
  colorSch: []
};

var GroupedBarChartCtrl =
/*#__PURE__*/
function (_MetricsPanelCtrl) {
  _inherits(GroupedBarChartCtrl, _MetricsPanelCtrl);

  function GroupedBarChartCtrl($scope, $injector, $rootScope) {
    var _this;

    _classCallCheck(this, GroupedBarChartCtrl);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(GroupedBarChartCtrl).call(this, $scope, $injector));
    _this.$rootScope = $rootScope;
    _this.hiddenSeries = {};
    _this.data = null;

    _lodash.default.defaults(_this.panel, panelDefaults);

    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_assertThisInitialized(_this)));

    _this.events.on('data-received', _this.onDataReceived.bind(_assertThisInitialized(_this)));

    _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_assertThisInitialized(_this)));

    _this.events.on('data-error', _this.onDataError.bind(_assertThisInitialized(_this)));

    return _this;
  }

  _createClass(GroupedBarChartCtrl, [{
    key: "onInitEditMode",
    value: function onInitEditMode() {
      this.addEditorTab('Options', 'public/plugins/grafana-groupedbarchart-panel/partials/editor.html', 2);
      this.addEditorTab('Colors', 'public/plugins/grafana-groupedbarchart-panel/partials/colors.html', 3);
    }
  }, {
    key: "setUnitFormat",
    value: function setUnitFormat(subItem) {
      this.panel.format = subItem.value;
      this.render();
    }
  }, {
    key: "onDataError",
    value: function onDataError() {
      this.render();
    }
  }, {
    key: "updateColorSet",
    value: function updateColorSet() {
      var _this2 = this;

      this.panel.colorSch = [];
      this.panel.colorSet.forEach(function (d) {
        return _this2.panel.colorSch.push(d.color);
      });
      this.render();
    }
  }, {
    key: "onDataReceived",
    value: function onDataReceived(dataList) {
      if (dataList && dataList.length) {
        var o = _lodash.default.groupBy(dataList[0].rows, function (e) {
          return e[0];
        });

        _lodash.default.forOwn(o, function (e, i) {
          var t = _lodash.default.groupBy(e, function (sta) {
            return sta[1];
          });

          o[i] = _lodash.default.forOwn(t, function (sum, tid) {
            t[tid] = sum.map(function (s) {
              return s[2];
            }).reduce(function (x, y) {
              return x + y;
            });
          });
        });

        var res = [];

        _lodash.default.forOwn(o, function (e, i) {
          e.label = i;
          res.push(e);
        });

        this.data = res; //.sort((a, b) => {return (a.label>b.label)?-1:((b.label>a.label)?1:0)});
      } else {
        this.data = [{
          label: "Machine001",
          "Off": 15,
          "Down": 50,
          "Run": 0,
          "Idle": 40
        }, {
          label: "Machine002",
          "Off": 15,
          "Down": 5,
          "Run": 40,
          "Idle": 15
        }, {
          label: "Machine003",
          "Off": 15,
          "Down": 30,
          "Run": 40,
          "Idle": 15
        }, {
          label: "Machine004",
          "Off": 15,
          "Down": 30,
          "Run": 80,
          "Idle": 15
        }];
      }

      this.render();
    }
  }, {
    key: "formatValue",
    value: function formatValue(value) {
      var decimalInfo = this.getDecimalsForValue(value);
      var formatFunc = _kbn.default.valueFormats[this.panel.format];

      if (formatFunc) {
        return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
      }

      return value;
    }
  }, {
    key: "link",
    value: function link(scope, elem, attrs, ctrl) {
      var groupedBarChart =
      /*#__PURE__*/
      function () {
        function groupedBarChart(opts) {
          var _this3 = this;

          _classCallCheck(this, groupedBarChart);

          this.data = opts.data;
          this.margin = opts.margin;
          this.width = opts.width;
          this.height = opts.height;
          this.showLegend = opts.legend;
          this.legendType = opts.position;
          this.chartType = opts.chartType;
          this.orientation = opts.orientation;
          this.labelSpace = opts.labelSpace;
          this.fontColor = opts.fontColor;
          this.labelOrientation = opts.labelOrientation;
          this.avgLineShow = opts.avgLineShow;
          this.axesConfig = [];
          this.element = elem.find(opts.element)[0];
          this.options = _toConsumableArray(new Set(opts.data.reduce(function (c, r) {
            return c.concat(Object.keys(r).filter(function (k) {
              return k !== 'label';
            }));
          }, [])));
          this.avgList = {};
          this.options.forEach(function (d) {
            _this3.avgList[d] = 0;
          });
          this.options = this.options.filter(function (d) {
            return d !== 'valores';
          });
          this.data.forEach(function (d) {
            var stackVal = 0;
            d.valores = _this3.options.map(function (name, i, o) {
              if (i !== 0) stackVal = stackVal + +d[o[i - 1]];
              _this3.avgList[name] = _this3.avgList[name] + d[name];
              return {
                name: name,
                value: +d[name],
                stackVal: stackVal
              };
            });
          });
          this.options.forEach(function (d) {
            _this3.avgList[d] /= _this3.data.length;
          });

          if (opts.color.length == 0) {
            this.color = d3.scale.ordinal().range(d3.scale.category20().range());
          } else {
            this.color = d3.scale.ordinal().range(opts.color);
          }

          this.draw();
        }

        _createClass(groupedBarChart, [{
          key: "draw",
          value: function draw() {
            d3.select(this.element).html("");
            this.svg = d3.select(this.element).append('svg');
            this.svg.attr('width', this.width).attr('height', this.height) // .attr('viewBox', `0, 0, ${this.width}, ${this.height}`)
            .attr('preserveAspectRatio', 'xMinYMin meet').style('padding', '10px').attr('transform', "translate(0, ".concat(this.margin.top, ")"));
            this.createScales();
            this.addAxes();
            this.addTooltips();
            this.addBar();
            d3.select(this.element).attr('style', "width: ".concat(this.width * 1.5, "px; height: ").concat(this.height * 1.5, "px"));
            if (this.showLegend) this.addLegend(this.legendType);
          }
        }, {
          key: "createScales",
          value: function createScales() {
            switch (this.orientation) {
              case 'horizontal':
                this.y0 = d3.scale.ordinal().rangeRoundBands([+this.height, 0], .2, 0.5);
                this.y1 = d3.scale.ordinal();
                this.x = d3.scale.linear().range([0, +this.width]);
                this.axesConfig = [this.x, this.y0, this.y0, this.y1, this.x];
                break;

              case 'vertical':
                this.x0 = d3.scale.ordinal().rangeRoundBands([0, +this.width], .2, 0.5);
                this.x1 = d3.scale.ordinal();
                this.y = d3.scale.linear().range([0, +this.height]);
                this.axesConfig = [this.x0, this.y, this.x0, this.x1, this.y];
                break;
            }
          }
        }, {
          key: "addAxes",
          value: function addAxes() {
            var axesScale = 1.1;
            this.xAxis = d3.svg.axis().scale(this.axesConfig[0]).tickSize(-this.height).orient('bottom');
            this.yAxis = d3.svg.axis().scale(this.axesConfig[1]).orient('left');
            this.axesConfig[2].domain(this.data.map(function (d) {
              return d.label;
            }));
            this.axesConfig[3].domain(this.options).rangeRoundBands([0, this.axesConfig[2].rangeBand()]);
            var chartScale = this.chartType === 'bar chart' ? 0 : 1;
            var domainCal = this.orientation === 'horizontal' ? [0, d3.max(this.data, function (d) {
              return d3.max(d.valores, function (d) {
                return (d.value + chartScale * d.stackVal) * axesScale;
              });
            })] : [d3.max(this.data, function (d) {
              return d3.max(d.valores, function (d) {
                return (d.value + chartScale * d.stackVal) * axesScale;
              });
            }), 0];
            this.axesConfig[4].domain(domainCal);
            var xAxisConfig = this.svg.append('g').attr('class', 'x axis').attr('transform', "translate(".concat(this.margin.left, ", ").concat(this.height + this.margin.top, ")")).call(this.xAxis).selectAll('text').style('fill', "".concat(this.fontColor));
            var match = this.labelOrientation.match(/^([1-9]\d*) degrees\b|^vertical$/);

            if (match) {
              xAxisConfig.style('text-anchor', 'end').style('transform', 'rotate(-' + (match[1] || 90) + 'deg)');
            }

            var yAxisConfig = this.svg.append('g').attr('class', 'y axis').attr('transform', "translate(".concat(this.margin.left, ", ").concat(this.margin.top, ")")).style('fill', "".concat(this.fontColor)).call(this.yAxis);
            yAxisConfig.selectAll('text').style('fill', "".concat(this.fontColor));
            yAxisConfig.selectAll('path').style('stroke', "".concat(this.fontColor));
          }
        }, {
          key: "addBar",
          value: function addBar() {
            var _this4 = this;

            var scale = this.chartType === 'bar chart' ? 1 : this.options.length;

            switch (this.orientation) {
              case 'horizontal':
                this.avgLineShow && this.options.forEach(function (d) {
                  _this4.svg.append('line').attr('x1', _this4.x(_this4.avgList[d])).attr('y1', _this4.height).attr('x2', _this4.x(_this4.avgList[d])).attr('y2', 0).attr('class', "".concat(d, " avgLine")).attr('transform', "translate(".concat(_this4.margin.left, ", ").concat(_this4.margin.top, ")")).style('display', 'none').style('stroke-width', 2).style('stroke', _this4.color(d)).style('stroke-opacity', 0.7);
                });
                this.bar = this.svg.selectAll('.bar').data(this.data).enter().append('g').attr('class', 'rect').attr('transform', function (d) {
                  return "translate(".concat(_this4.margin.left, ", ").concat(_this4.y0(d.label) + _this4.margin.top, ")");
                });
                this.barC = this.bar.selectAll('rect').data(function (d) {
                  return d.valores;
                }).enter();
                this.barC.append('rect').attr('height', this.y1.rangeBand() * scale).attr('y', function (d) {
                  return _this4.chartType === 'bar chart' ? _this4.y1(d.name) : _this4.y0(d.label);
                }).attr('x', function (d) {
                  return _this4.chartType === 'bar chart' ? 0 : _this4.x(d.stackVal);
                }).attr('value', function (d) {
                  return d.name;
                }).attr('width', function (d) {
                  return _this4.x(d.value);
                }).style('fill', function (d) {
                  return _this4.color(d.name);
                });
                break;

              case 'vertical':
                this.avgLineShow && this.options.forEach(function (d) {
                  _this4.svg.append('line').attr('x1', 0).attr('y1', _this4.y(_this4.avgList[d])).attr('x2', +_this4.width).attr('y2', _this4.y(_this4.avgList[d])).attr('class', "".concat(d, " avgLine")).attr('transform', "translate(".concat(_this4.margin.left, ", ").concat(_this4.margin.top, ")")).style('display', 'none').style('stroke-width', 2).style('stroke', _this4.color(d)).style('stroke-opacity', 0.7);
                });
                this.bar = this.svg.selectAll('.bar').data(this.data).enter().append('g').attr('class', 'rect').attr('transform', function (d, i) {
                  return "translate(".concat(_this4.x0(d.label), ", ").concat(+_this4.height + _this4.margin.top, ")");
                });
                this.barC = this.bar.selectAll('rect').data(function (d) {
                  return d.valores.map(function (e) {
                    e.label = d.label;
                    return e;
                  });
                }).enter();
                this.barC.append('rect').attr('id', function (d, i) {
                  return "".concat(d.label, "_").concat(i);
                }).attr('height', function (d) {
                  return +_this4.height - _this4.y(d.value);
                }).attr('y', function (d) {
                  return _this4.chartType === 'bar chart' ? _this4.y(d.value) - _this4.height : _this4.y(d.value) - 2 * +_this4.height + _this4.y(d.stackVal);
                }).attr('x', function (d, i) {
                  return _this4.chartType === 'bar chart' ? _this4.x1(d.name) + _this4.margin.left : _this4.x1(d.name) - _this4.x1.rangeBand() * i + _this4.margin.left;
                }).attr('value', function (d) {
                  return d.name;
                }).attr('width', this.x1.rangeBand() * scale).style('fill', function (d) {
                  return _this4.color(d.name);
                });
                break;
            }

            this.chartType === 'bar chart' && this.barC.append('text').attr('x', function (d) {
              return _this4.orientation === 'horizontal' ? _this4.x(d.value) + 5 : _this4.x1(d.name) + _this4.x1.rangeBand() / 4 + _this4.margin.left;
            }).attr('y', function (d) {
              return _this4.orientation === 'horizontal' ? _this4.y1(d.name) + _this4.y1.rangeBand() / 2 : _this4.y(d.value) - _this4.height - 8;
            }).attr('dy', '.35em').style('fill', "".concat(this.fontColor)).text(function (d) {
              return d.value ? d.value : '';
            });
            this.bar.on('mouseover', function (d) {
              _this4.tips.style('left', "".concat(10, "px"));

              _this4.tips.style('top', "".concat(15, "px"));

              _this4.tips.style('display', "inline-block");

              var elements = d3.selectAll(':hover')[0];
              var elementData = elements[elements.length - 1].__data__;

              _this4.tips.html("".concat(d.label, " , ").concat(elementData.name, " ,  ").concat(elementData.value));

              if (_this4.avgLineShow) d3.selectAll(".".concat(elementData.name))[0][0].style.display = '';
            });
            this.bar.on('mouseout', function (d) {
              _this4.tips.style('display', "none");

              d3.selectAll('.avgLine')[0].forEach(function (d) {
                d.style.display = 'none';
              });
            });
          }
        }, {
          key: "addLegend",
          value: function addLegend(loc) {
            var _this5 = this;

            var labelSpace = this.labelSpace;

            switch (loc) {
              case 'On graph':
                var defaultOptions = this.chartType == 'bar chart' || this.orientation == 'horizontal' ? this.options.slice() : this.options.slice().reverse();
                this.legend = this.svg.selectAll('.legend').data(defaultOptions).enter().append('g').attr('class', 'legend').attr('transform', function (d, i) {
                  return "translate(50,".concat(i * 20 + _this5.margin.top, ")");
                });
                this.legend.append('rect').attr('x', this.width * 1.1 - 18).attr('width', 18).attr('height', 18).style('fill', this.color);
                this.legend.append('text').attr('x', this.width * 1.1 - 24).attr('y', 9).attr('dy', '.35em').style('text-anchor', 'end').style('fill', "".concat(this.fontColor)).text(function (d) {
                  return d;
                });
                break;

              case 'Under graph':
                this.legend = this.svg.selectAll('.legend').data(this.options.slice()).enter().append('g').attr('class', 'legend').attr('transform', function (d, i) {
                  return "translate(".concat(+i * labelSpace - _this5.width, ",").concat(+_this5.height + 24 + _this5.margin.top, ")");
                });
                this.legend.append('rect').attr('x', function (d, i) {
                  return i * labelSpace + _this5.margin.left + _this5.width * 1 + 0;
                }).attr('width', 18).attr('height', 18).style('fill', this.color);
                this.legend.append('text').attr('x', function (d, i) {
                  return i * labelSpace + _this5.margin.left + _this5.width * 1 + 5;
                }).attr('dx', 18).attr('dy', '1.1em').style('text-anchor', 'start').style('fill', "".concat(this.fontColor)).text(function (d) {
                  return d;
                });
                break;

              default:
                break;
            }
          }
        }, {
          key: "addTooltips",
          value: function addTooltips() {
            this.tips = d3.select(this.element).append('div').attr('class', 'toolTip');
          }
        }]);

        return groupedBarChart;
      }();

      function onRender() {
        if (!ctrl.data) return;
        var Chart = new groupedBarChart({
          data: ctrl.data,
          margin: {
            top: parseInt(ctrl.panel.marginTop, 10),
            left: parseInt(ctrl.panel.marginLeft, 10),
            bottom: parseInt(ctrl.panel.marginBottom, 10),
            right: parseInt(ctrl.panel.marginRight, 10)
          },
          element: '#chart',
          width: elem.width() - parseInt(ctrl.panel.paddingWidth, 10),
          height: ctrl.height - parseInt(ctrl.panel.paddingHeight, 10),
          legend: ctrl.panel.legend.show,
          fontColor: ctrl.panel.fontColor,
          position: ctrl.panel.legend.position,
          chartType: ctrl.panel.chartType,
          orientation: ctrl.panel.orientation,
          labelOrientation: ctrl.panel.labelOrientation,
          labelSpace: ctrl.panel.labelSpace,
          avgLineShow: ctrl.panel.avgLineShow,
          color: ctrl.panel.colorSch
        });
        ctrl.panel.colorSet = [];
        Chart.options.forEach(function (d) {
          ctrl.panel.colorSet.push({
            text: d,
            color: Chart.color(d)
          });
        });
      }

      this.events.on('render', function () {
        onRender();
      });
    }
  }]);

  return GroupedBarChartCtrl;
}(_sdk.MetricsPanelCtrl);

exports.GroupedBarChartCtrl = GroupedBarChartCtrl;
GroupedBarChartCtrl.templateUrl = 'partials/module.html';
//# sourceMappingURL=ctrl.js.map
