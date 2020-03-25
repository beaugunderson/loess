'use strict';

const d3 = require('d3');
const parse = require('date-fns/parse');
const {regressionLoess} = require('d3-regression');

const xProperty = 'timestamp';
const yProperty = 'heart_rate';

const margin = {left: 30, right: 30, top: 5, bottom: 20};
const aspectRatio = 0.25;

let width;
let height;

const xScale = d3.scaleTime();
const yScale = d3.scaleLinear();

const xAxisGenerator = d3.axisBottom();
const yAxisGenerator = d3.axisLeft();

const loessGenerator = regressionLoess()
  .x(d => xScale(d.x))
  .y(d => yScale(d.y))
  .bandwidth(0.25);

const lineGenerator = d3.line()
  .x(d => d[0])
  .y(d => d[1]);

const svg = d3.select('body').append('svg');

const g = svg.append('g');

const xAxis = g.append('g');
const yAxis = g.append('g');

const circleHolder = g.append('g');

const loessLine = g.append('path').attr('class', 'loess-line');

d3.json('data.json').then(rawData => {
  const data = rawData.map(record => ({
    x: parse(record[xProperty], 'yyyy-MM-dd H:mm:ss', new Date()),
    y: record[yProperty]
  }));

  const x = data.map(d => d.x);
  const y = data.map(d => d.y);

  xScale.domain(d3.extent(x));
  yScale.domain(d3.extent(y));

  const points = circleHolder.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', 2);

  function draw() {
    width = window.innerWidth - margin.left - margin.right;
    height = d3.min([window.innerHeight, (width * aspectRatio)]) - margin.top - margin.bottom;

    xScale.rangeRound([0, width]);
    yScale.range([height, 0]);

    xAxisGenerator.scale(xScale).ticks(width / 100);
    yAxisGenerator.scale(yScale);

    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    g.attr('transform', 'translate(' + [margin.left, margin.top] + ')');

    xAxis
      .attr('transform', 'translate(0, ' + height + ')')
      .call(xAxisGenerator);

    yAxis.call(yAxisGenerator);

    points.attr('transform', d => 'translate(' + [xScale(d.x), yScale(d.y)] + ')');

    loessLine
      .datum(loessGenerator(data))
      .attr('d', lineGenerator);
  }

  draw();

  window.addEventListener('resize', () => draw());
});
