/*
 *  Candlestick by OKViz
 *
 *  Copyright (c) SQLBI. OKViz is a trademark of SQLBI Corp.
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import tooltip = powerbi.extensibility.utils.tooltip;
import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;

module powerbi.extensibility.visual {
    
     interface VisualMeta {
        name: string;
        version: string;
        dev: boolean;
    }

    interface VisualViewModel {
        dataPoints: VisualDataPoint[];
        trendsDataPoints: AccessoryDataPoint[];
        legendDataPoints: LegendDataPoint[];
        domain: VisualDomain;
        categoryIsDate: boolean;
        categoryFormat: string;
        settings: VisualSettings;
    }

    interface VisualDataPoint {
        category?: any;
        open?: number;   
        close?: number;
        high?: number;
        low?: number;   
        format?: string;
        selectionId: any;
        tooltips?: VisualTooltipDataItem[];
    }

    interface AccessoryDataPoint {
        points: any[];
        color?: string;
        selectionId: any;
    }

    interface VisualDomain {
        start?: number;
        end?: number;
        startForced: boolean;
        endForced: boolean;
    }

    interface VisualSettings {
        dataPoint: {
            highLowCaps: boolean;
            showShadowsColor: boolean;
            shadowsFill: Fill;
            bullishFill: Fill;
            bearishFill: Fill;
        };
        trendLines: {
            weight: number;
            interpolation: string;
        };
        xAxis : {
            show: boolean;
            gridline: boolean;
            type: string,
            fontFamily: string,
            fontSize: number,
            fill: Fill;
        };
        yAxis : {
            show: boolean;
            start?: number,
            end?: number,
            fontFamily: string,
            fontSize: number,
            fill: Fill;
            unit?: number;
            precision?: number; 
        };
        legend: {
            show: boolean;
            position: string;
            showTitle: boolean;
            titleText: string;
            labelColor: Fill;
            fontSize: number;
        };

        colorBlind?: {
            vision?: string;
        }
    }

    function defaultSettings(): VisualSettings {

        return {
            dataPoint: {
                highLowCaps: false,
                showShadowsColor: true,
                shadowsFill: {solid: { color: "#777" } },
                bullishFill: {solid: { color: "#399599" } },
                bearishFill: {solid: { color: "#FD625E" } }
            },
            trendLines: {
                weight: 1,
                interpolation: 'linear'
            },
            xAxis: {
                show: true,
                gridline: true,
                type: "categorical",
                fontFamily: "\"Segoe UI\", wf_segoe-ui_normal, helvetica, arial, sans-serif",
                fontSize: 8,
                fill: {solid: { color: "#777" } }
           },
           yAxis: {
               show: true,
               fontFamily: "\"Segoe UI\", wf_segoe-ui_normal, helvetica, arial, sans-serif",
               fontSize: 8,
               fill: {solid: { color: "#777" } },
               unit: 0
            },
            legend: {
                show: false,
                position: 'Top',
                showTitle: false,
                titleText: '',
                labelColor: {solid: { color: "#666" } },
                fontSize: 8
            },

            colorBlind: {
                vision: "Normal"
            }
        };
    }

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): VisualViewModel {

        //Get DataViews
        let dataViews = options.dataViews;
        let hasDataViews = (dataViews && dataViews[0]);
        let hasCategoricalData = (hasDataViews && dataViews[0].categorical && dataViews[0].categorical.values);
        let hasSettings = (hasDataViews && dataViews[0].metadata && dataViews[0].metadata.objects);

        //Get Settings
        let settings: VisualSettings = defaultSettings();
        if (hasSettings) {
            let objects = dataViews[0].metadata.objects;
            settings = {
                dataPoint: {
                    highLowCaps: getValue<boolean>(objects, "dataPoint", "highLowCaps", settings.dataPoint.highLowCaps),
                    showShadowsColor: getValue<boolean>(objects, "dataPoint", "showShadowsColor", settings.dataPoint.showShadowsColor),
                    shadowsFill: getValue<Fill>(objects, "dataPoint", "shadowsFill", settings.dataPoint.shadowsFill),
                    bullishFill: getValue<Fill>(objects, "dataPoint", "bullishFill", settings.dataPoint.bullishFill),
                    bearishFill: getValue<Fill>(objects, "dataPoint", "bearishFill", settings.dataPoint.bearishFill)
                },
                trendLines: {
                    weight: getValue<number>(objects, "trendLines", "weight", settings.trendLines.weight),
                    interpolation: getValue<string>(objects, "trendLines", "interpolation", settings.trendLines.interpolation),
                },
                xAxis: {
                    show: getValue<boolean>(objects, "xAxis", "show", settings.xAxis.show),
                    gridline: getValue<boolean>(objects, "xAxis", "gridline", settings.xAxis.gridline),
                    type: getValue<string>(objects, "xAxis", "type", settings.xAxis.type),
                    fontFamily: getValue<string>(objects, "xAxis", "fontFamily", settings.xAxis.fontFamily),
                    fontSize: getValue<number>(objects, "xAxis", "fontSize", settings.xAxis.fontSize),
                    fill: getValue<Fill>(objects, "xAxis", "fill", settings.xAxis.fill)
                },
                yAxis: {
                    show: getValue<boolean>(objects, "yAxis", "show", settings.yAxis.show),
                    start: getValue<number>(objects, "yAxis", "start", settings.yAxis.start),
                    end: getValue<number>(objects, "yAxis", "end", settings.yAxis.end),
                    fontFamily: getValue<string>(objects, "yAxis", "fontFamily", settings.yAxis.fontFamily),
                    fontSize: getValue<number>(objects, "yAxis", "fontSize", settings.yAxis.fontSize),
                    fill: getValue<Fill>(objects, "yAxis", "fill", settings.yAxis.fill),
                    unit: getValue<number>(objects, "yAxis", "unit", settings.yAxis.unit),
                    precision: getValue<number>(objects, "yAxis", "precision", settings.yAxis.precision)
                },
                legend: {
                    show: getValue<boolean>(objects, "legend", "show", settings.legend.show),
                    position: getValue<string>(objects, "legend", "position", settings.legend.position),
                    showTitle: getValue<boolean>(objects, "legend", "showTitle", settings.legend.showTitle),
                    titleText: getValue<string>(objects, "legend", "titleText", settings.legend.titleText),
                    labelColor: getValue<Fill>(objects, "legend", "labelColor", settings.legend.labelColor),
                    fontSize: getValue<number>(objects, "legend", "fontSize", settings.legend.fontSize)
                },

                colorBlind: {
                     vision: getValue<string>(objects, "colorBlind", "vision", settings.colorBlind.vision),
                }
            }

            //Limit some properties
            if (settings.trendLines.weight < 1) settings.trendLines.weight = 1;
            if (settings.yAxis.precision < 0) settings.yAxis.precision = 0;
            if (settings.yAxis.precision > 5) settings.yAxis.precision = 5;
        }

        //Get DataPoints
        let domain: VisualDomain = { startForced: false, endForced: false };
        if (settings.yAxis.start !== undefined) {
            domain.start = settings.yAxis.start;
            domain.startForced = true;
        }
        if (settings.yAxis.end !== undefined) {
            domain.end = settings.yAxis.end;
            domain.endForced = true;
        }

        let dataPoints: VisualDataPoint[] = [];
        let trendsDataPoints: AccessoryDataPoint[] = [];
        let legendDataPoints: LegendDataPoint[] = [];
        let categoryIsDate = false;
        let categoryFormat = '';

        if (hasCategoricalData) {

            let dataCategorical = dataViews[0].categorical;
            let category = (dataCategorical.categories ? dataCategorical.categories[dataCategorical.categories.length - 1] : null);
            if (category) {
                categoryIsDate = category.source.type.dateTime;
                categoryFormat = category.source.format;
            }
            let categories = (category ? category.values : ['']);

            for (let i = 0; i < categories.length; i++) {

                
                let categoryValue = OKVizUtility.makeMeasureReadable(categories[i]);
                let dataPoint: VisualDataPoint;

                for (let ii = 0; ii < dataCategorical.values.length; ii++) {

                    let dataValue = dataCategorical.values[ii];
                    let roles = ['open', 'close', 'high', 'low'];
                    for (let r = 0; r < roles.length; r++) {
                        let role = roles[r];
                        if (dataValue.source.roles[role]){
                            
                            let value: any = dataValue.values[i];
                            if (value !== null) {
                                if (!dataPoint) {
                                    dataPoint = {
                                        category: categoryValue,
                                        format: dataValue.source.format,
                                        selectionId: host.createSelectionIdBuilder().withCategory(category, i).createSelectionId(),
                                        tooltips: []
                                    };
                                }

                                if (!domain.startForced) 
                                    domain.start = (domain.start !== undefined ? Math.min(domain.start, value) : value);

                                if (!domain.endForced)
                                    domain.end = (domain.end !== undefined ? Math.max(domain.end, value) : value);

                                dataPoint[role] = value;

                                let formattedValue = OKVizUtility.Formatter.format(value, {
                                    format: dataValue.source.format,
                                    formatSingleValues: true,
                                    allowFormatBeautification: false,
                                    cultureSelector: host.locale
                                });
                                
                                dataPoint.tooltips.push(<VisualTooltipDataItem>{
                                    displayName: dataValue.source.displayName,
                                    value: formattedValue
                                });

                            }
                        }
                    }

                    if (dataValue.source.roles['trends']){
                        
                        let value: any = dataValue.values[i];
                        if (value) {

                            let displayName =  dataValue.source.displayName;
                            let trendDataPoint = trendsDataPoints[displayName];
                            if (trendDataPoint) {
                                trendDataPoint.points.push({"x": categoryValue, "y": value});

                            } else {
                               
                                let defaultColor: Fill = { solid: { color: host.colorPalette.getColor(displayName).value } };

                                let color = getValue<Fill>(dataValue.source.objects, 'trendLines', 'fill', defaultColor).solid.color;

                                let identity = host.createSelectionIdBuilder().withMeasure(dataValue.source.queryName).createSelectionId();

                                trendsDataPoints[displayName] = {
                                    points: [{"x": categoryValue, "y": value}],
                                    color: color,
                                    selectionId: identity
                                };

                                if (i == 0) {
                                    legendDataPoints.push({
                                        label: dataValue.source.displayName,
                                        color: color,
                                        icon: LegendIcon.Circle,
                                        identity: identity,
                                        selected: false
                                    });
                                }
                            }

                            
                        }
                    }
                }

                if (dataPoint) {

                     dataPoint.tooltips.unshift(<VisualTooltipDataItem>{
                        displayName: (category.source.displayName || "Axis"),
                        value: dataPoint.category
                    });

                    dataPoints.push(dataPoint);
                }
            }

        }

        if (!domain.start) domain.start = 0;
        if (!domain.end) domain.end = 0;
        if (domain.start > domain.end) 
            domain.end = domain.start;

        return {
            dataPoints: dataPoints,
            trendsDataPoints: trendsDataPoints,
            legendDataPoints: legendDataPoints,
            categoryIsDate: categoryIsDate,
            categoryFormat: categoryFormat,
            domain: domain,
            settings: settings,
        };
    }

    export class Visual implements IVisual {
        private meta: VisualMeta;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private selectionIdBuilder: ISelectionIdBuilder;
        private tooltipServiceWrapper: tooltip.ITooltipServiceWrapper;
        private model: VisualViewModel;
        private legend: ILegend;

        private element: d3.Selection<HTMLElement>;

        constructor(options: VisualConstructorOptions) {

            this.meta = {
                name: 'Candlestick',
                version: '1.0.3',
                dev: false
            };
            console.log('%c' + this.meta.name + ' by OKViz ' + this.meta.version + (this.meta.dev ? ' (BETA)' : ''), 'font-weight:bold');

            this.host = options.host;
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = tooltip.createTooltipServiceWrapper(options.host.tooltipService, options.element);
            this.model = { dataPoints: [], trendsDataPoints: [], legendDataPoints: [], categoryIsDate: false, categoryFormat: '', domain: {startForced: false, endForced: false}, settings: <VisualSettings>{} };

            this.element = d3.select(options.element);
            this.legend = LegendModule.createLegend(options.element, false, null, true, LegendPosition.Top);
        }
        
        public update(options: VisualUpdateOptions) {

            this.model = visualTransform(options, this.host);
            this.element.selectAll('div, svg:not(.legend)').remove();
            if (this.model.dataPoints.length == 0) return;

            let selectionManager  = this.selectionManager;

            let margin = {top: 6, left: 6, bottom: 0, right: 6};
            
            let xAxisHeight = 0;
            let xAxisWidth = 0;
            let yAxisWidth = 0;
            let yAxisFontSize;
            let yFormatter;
            if (this.model.settings.yAxis.show) {
                
                
                yFormatter = OKVizUtility.Formatter.getFormatter({
                    format: this.model.dataPoints[0].format,
                    value: this.model.settings.yAxis.unit,
                    formatSingleValues: (this.model.settings.yAxis.unit == 0),
                    precision: this.model.settings.yAxis.precision,
                    displayUnitSystemType: 0,
                    cultureSelector: this.host.locale
                });

                yAxisFontSize = PixelConverter.fromPoint(this.model.settings.yAxis.fontSize);
                yAxisWidth = TextUtility.measureTextWidth({
                    fontSize: yAxisFontSize,
                    fontFamily: this.model.settings.yAxis.fontFamily,
                    text: (yFormatter ? yFormatter.format(this.model.domain.end) : this.model.domain.end)
                });
                
            }

            //Legend
            if (this.model.settings.legend.show && this.model.legendDataPoints.length > 0) {
        
                this.legend.changeOrientation(<any>LegendPosition[this.model.settings.legend.position]);
                this.legend.drawLegend(<LegendData>{
                    title: this.model.settings.legend.titleText,
                    dataPoints: this.model.legendDataPoints,
                    labelColor: this.model.settings.legend.labelColor.solid.color,
                    fontSize: this.model.settings.legend.fontSize
                }, options.viewport);

                appendLegendMargins(this.legend, margin);
  
            } else {

                this.legend.drawLegend({ dataPoints: [] }, options.viewport);
            }

            let pointMargin = 5;
            let axisPadding = 10;
            
            let scrollbarMargin = 25;

            let containerSize = {
                width: options.viewport.width - margin.left - margin.right,
                height: options.viewport.height - margin.top - margin.bottom
            };

            let ray = Math.max(1.5, Math.min(6, (containerSize.width / this.model.dataPoints.length / 6)));
            let axisMargin = (containerSize.width * 0.05);

            
            let container =  this.element
                .append('div')
                .classed('chart', true)
                .style({
                    'width' :  containerSize.width + 'px',
                    'height':  containerSize.height + 'px',
                    'overflow-x': 'auto',
                    'overflow-y': 'hidden',
                    'margin-top': margin.top + 'px',
                    'margin-left': margin.left + 'px'
                });
            
            let slotWidth = Math.max(containerSize.width / this.model.dataPoints.length, 5 + (pointMargin * 2));

            let plotSize = {
                width: Math.max(slotWidth * this.model.dataPoints.length, containerSize.width),
                height: Math.max(80, containerSize.height)
            };

            let svgContainer = container
                .append('svg')
                .attr({
                    'width':  plotSize.width,
                    'height': plotSize.height - scrollbarMargin
                });

            //X
            let xAxisDataPoints = this.model.dataPoints.map(function (d) { return d.category; });
            let xRange = [yAxisWidth + axisPadding + axisMargin, plotSize.width - axisMargin];
            let x;

            let xIsCategorical = (this.model.settings.xAxis.type === 'categorical');
            if (this.model.categoryIsDate && !xIsCategorical) {

                let dateRange = d3.extent(this.model.dataPoints, function (d) { return d.category; });

                x = d3.time.scale().range(xRange)
                    .domain(dateRange);
            } else {

                x = d3.scale.ordinal().rangePoints(<any>xRange)
                    .domain(xAxisDataPoints)
            
            }

            if (this.model.settings.xAxis.show) {
                
                let longestXAxis = xAxisDataPoints.sort(function (a, b) { return b.length - a.length; })[0];

                let xAxisFontSize = PixelConverter.fromPoint(this.model.settings.xAxis.fontSize);
                xAxisWidth = TextUtility.measureTextWidth({
                    fontSize: xAxisFontSize,
                    fontFamily: this.model.settings.xAxis.fontFamily,
                    text: longestXAxis
                });              

                let numTicks = (this.model.settings.xAxis.type == 'categorical' || !this.model.categoryIsDate ? this.model.dataPoints.length :  (this.model.categoryIsDate ? 4 : Math.max(Math.floor((plotSize.width) / 80), 2)));

                let xAxis = d3.svg.axis().ticks(numTicks).outerTickSize(0).orient('bottom');
                if (this.model.categoryIsDate) {
                    let xFormatter = OKVizUtility.Formatter.getFormatter({
                        format: this.model.categoryFormat,
                        formatSingleValues: false,
                        detectAxisPrecision: true,
                        tickCount: numTicks,
                        cultureSelector: this.host.locale
                    });
                    xAxis.tickFormat(d => xFormatter.format(d));
                }

                let svgAxisContainer = svgContainer
                    .append('svg')
                    .attr('width', plotSize.width);

                let axis = svgAxisContainer.selectAll("g.axis").data([0]);

                axis.enter().append("g").attr("class", "x axis");

                axis.call(xAxis.scale(x));
                //axis.selectAll('line').style('stroke', this.model.settings.xAxis.fill.solid.color);
                let labels = axis.selectAll('text')
                    .style({
                        'fill': this.model.settings.xAxis.fill.solid.color,
                        'font-family': this.model.settings.xAxis.fontFamily,
                        'font-size': xAxisFontSize
                    });

                let computedNumTicks = axis.selectAll('text').size();
                let tickMaxWidth = ((xRange[1] - xRange[0]) / computedNumTicks);

                if (tickMaxWidth < xAxisWidth * 0.8) {
                    labels.attr("transform", "rotate(-90)").attr('dy', '-0.5em').style("text-anchor", "end")
                    .call(TextUtility.truncateAxis, plotSize.height * 0.3, {fontFamily: this.model.settings.xAxis.fontFamily, fontSize: xAxisFontSize});

                } else if (tickMaxWidth < xAxisWidth) {
                    labels.attr("transform", function(d) {
                        return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-35)";
                    }).attr('dy', '0').attr('dx', '2.5em').style("text-anchor", "end")
                    .call(TextUtility.truncateAxis, plotSize.height * 0.3, {fontFamily: this.model.settings.xAxis.fontFamily, fontSize: xAxisFontSize});
                
                } else {
                    labels.call(TextUtility.wrapAxis, tickMaxWidth, {fontFamily: this.model.settings.xAxis.fontFamily, fontSize: xAxisFontSize});
                }


                let n = <any>axis.node();
                xAxisHeight = n.getBBox().height;
        
                axis.attr('transform', 'translate(0,' + (plotSize.height - scrollbarMargin - 5 - xAxisHeight)  + ')');

                if (this.model.settings.xAxis.gridline) {
                    let xGrid = d3.svg.axis().ticks(numTicks).tickSize(plotSize.height - scrollbarMargin - 5 - xAxisHeight - axisPadding, 0);
                    let grid = svgAxisContainer.selectAll("g.grid").data([0]);
                    grid.enter().append("g").attr("class", "x grid");
                    grid.call(xGrid.scale(x));
                    grid.selectAll('text').remove();
                }

            }

            //Y
            let yRange = [axisPadding + pointMargin,  plotSize.height - axisPadding - scrollbarMargin - 5 - xAxisHeight];
            let y = d3.scale.linear()
                .domain([this.model.domain.end, this.model.domain.start]) 
                .range(yRange).nice().nice();   

            if (this.model.settings.yAxis.show) {

                let yAxis = d3.svg.axis().tickPadding(axisPadding).innerTickSize(plotSize.width - yAxisWidth - axisPadding).ticks(Math.max(Math.floor(plotSize.height / 80), 2)).orient("left");
                if (yFormatter) yAxis.tickFormat(function (d) { return yFormatter.format(d); });

                let svgAxisContainer = svgContainer
                    .append('svg')
                    .attr('width', plotSize.width );

                let axis = svgAxisContainer.selectAll("g.axis").data([0]);
                axis.enter().append("g")
                    .attr("class", "y axis")
                    .attr('transform', 'translate(' + plotSize.width + ',0)');


                axis.call(yAxis.scale(y));
                //axis.selectAll('line').style('stroke', this.model.settings.yAxis.fill.solid.color);
                axis.selectAll('text').style({
                    'fill': this.model.settings.yAxis.fill.solid.color,
                    'font-family': this.model.settings.yAxis.fontFamily,
                    'font-size': yAxisFontSize
                });

            }


            for (let i = 0; i < this.model.dataPoints.length; i++) {
                let dataPoint = this.model.dataPoints[i];

                if (dataPoint.low >= this.model.domain.start && dataPoint.high <= this.model.domain.end) {


                    let candleColor = (dataPoint.open > dataPoint.close ? this.model.settings.dataPoint.bearishFill : this.model.settings.dataPoint.bullishFill).solid.color;
                    let shadowsColor = (this.model.settings.dataPoint.showShadowsColor ? this.model.settings.dataPoint.shadowsFill.solid.color : candleColor);

                    let xPos = x(dataPoint.category);
                    let g = svgContainer.append('g')
                            .classed('candle', true)
                            .data([dataPoint])
                            .on('click', function(d) {
                                selectionManager.select(dataPoint.selectionId).then((ids: ISelectionId[]) => {
                                    
                                    d3.selectAll('.candle').attr({
                                        'opacity': (ids.length > 0 ? 0.3 : 1)
                                    });

                                    d3.select(this).attr({
                                        'opacity': 1
                                    });
                                });

                                (<Event>d3.event).stopPropagation();
                            });

                    g.append("line")
                        .style("stroke", shadowsColor)
                        .attr("x1", xPos)
                        .attr("x2", xPos + 0.0001) //Hack to avoid disappearing in some browsers
                        .attr("y1", y(dataPoint.low))
                        .attr("y2", y(dataPoint.high) + 0.0001);

                    if (this.model.settings.dataPoint.highLowCaps) {
                        g.append("line")
                            .style("stroke", shadowsColor)
                            .attr("x1", xPos - ray)
                            .attr("x2", xPos + ray + 1)
                            .attr("y1", y(dataPoint.low))
                            .attr("y2", y(dataPoint.low) + 0.0001);

                        g.append("line")
                            .style("stroke", shadowsColor)
                            .attr("x1", xPos - ray)
                            .attr("x2", xPos + ray + 1)
                            .attr("y1", y(dataPoint.high))
                            .attr("y2", y(dataPoint.high) + 0.0001);
                    }


                    g.append("rect")
                        .style("stroke", shadowsColor)
                        .attr("x", xPos - ray)
                        .attr("y", y(Math.max(dataPoint.open, dataPoint.close)))
                        .attr("height", Math.max(1, y(Math.min(dataPoint.open, dataPoint.close)) - y(Math.max(dataPoint.open, dataPoint.close))))
                        .attr("width", (ray * 2) + 1)
                        .attr("fill", candleColor);

                }
            }

            //Tooltips
            this.tooltipServiceWrapper.addTooltip(svgContainer.selectAll('.candle'), 
                function(tooltipEvent: TooltipEventArgs<number>){
                    let dataPoint: VisualDataPoint = <any>tooltipEvent.data;
                    if (dataPoint && dataPoint.tooltips)
                        return dataPoint.tooltips;
                    
                    return null;
                }
            );

            //Trend lines
            for(let tdp in this.model.trendsDataPoints) {
                let trendDataPoint = this.model.trendsDataPoints[tdp];

                let line = d3.svg.line()
                    .x(function(d: any) { return x(d.x); })
                    .y(function(d: any) { return y(d.y); })
                    .interpolate(this.model.settings.trendLines.interpolation);

                svgContainer
                    .append("path")
                    .attr("d", line(trendDataPoint.points))
                    .attr("stroke", trendDataPoint.color)
                    .attr('stroke-width', this.model.settings.trendLines.weight)
                    .attr('fill', 'none');
            }

            OKVizUtility.t([this.meta.name, this.meta.version], this.element, options, this.host, {
                'cd1': this.model.settings.colorBlind.vision,
                'cd6': this.model.settings.legend.show,
                'cd11': (this.model.legendDataPoints.length > 0),
                'cd15': this.meta.dev
            });

            //Color Blind module
            OKVizUtility.applyColorBlindVision(this.model.settings.colorBlind.vision, this.element);
        }

        public destroy(): void {
           
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var objectName = options.objectName;
            var objectEnumeration: VisualObjectInstance[] = [];

            switch(objectName) {
                case 'xAxis':
                    if (this.model.categoryIsDate) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "type": this.model.settings.xAxis.type
                            },
                            selector: null
                        });
                    }

                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "show": this.model.settings.xAxis.show,
                            "gridline": this.model.settings.xAxis.gridline,
                            "fill": this.model.settings.xAxis.fill,
                            "fontSize": this.model.settings.xAxis.fontSize,
                            "fontFamily": this.model.settings.xAxis.fontFamily
                        },
                        selector: null
                    });

                    

                    break;

                case 'yAxis':
                    
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "show": this.model.settings.yAxis.show,
                            "start": this.model.settings.yAxis.start,
                            "end": this.model.settings.yAxis.end,
                            "fill": this.model.settings.yAxis.fill,
                            "fontSize": this.model.settings.yAxis.fontSize,
                            "fontFamily": this.model.settings.yAxis.fontFamily,
                            "unit": this.model.settings.yAxis.unit,
                            "precision": this.model.settings.yAxis.precision
                        },
                        selector: null
                    });

                    break;

                 case 'dataPoint':

                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "bullishFill": this.model.settings.dataPoint.bullishFill,
                            "bearishFill": this.model.settings.dataPoint.bearishFill,
                            "highLowCaps": this.model.settings.dataPoint.highLowCaps,
                            "showShadowsColor": this.model.settings.dataPoint.showShadowsColor
                        },
                        selector: null
                    });

                    if (this.model.settings.dataPoint.showShadowsColor) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "shadowsFill" : this.model.settings.dataPoint.shadowsFill
                            },
                            selector: null
                        });
                    }

                    break;

                case 'trendLines':
                    
                     objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "interpolation": this.model.settings.trendLines.interpolation,
                            "weight": this.model.settings.trendLines.weight
                        },
                        selector: null
                    });

                    for(let tdp in this.model.trendsDataPoints) {
                        let trendDataPoint = this.model.trendsDataPoints[tdp];

                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: tdp,
                            properties: {
                                "fill": {
                                    solid: {
                                        color: trendDataPoint.color
                                    }
                                }
                            },
                            selector: trendDataPoint.selectionId.getSelector()
                        });

                    }

                    break;

                case 'legend':
               
                    if (this.model.legendDataPoints.length > 0) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "show": this.model.settings.legend.show,
                                "position": this.model.settings.legend.position,
                                "showTitle": this.model.settings.legend.showTitle,
                                "titleText": this.model.settings.legend.titleText,
                                "labelColor": this.model.settings.legend.labelColor,
                                "fontSize": this.model.settings.legend.fontSize
                            },
                            selector: null
                        });
                    }
                    break;
                
                case 'colorBlind':
                    
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "vision": this.model.settings.colorBlind.vision
                        },
                        selector: null
                    });

                    break;
                
            };

            return objectEnumeration;
        }

    }
}