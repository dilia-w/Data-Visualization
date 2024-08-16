'use strict';

// import * as d3 from 'd3';
// import './styles/index.scss';
// import * as topojson from 'topojson-client';

let counties, education;
const svg = d3.select('#choropleth-map')
  .attr('preserveAspectRatio', 'xMinYMin meet')
  .attr('viewBox', '-100 -50 1200 615')
  .append('g');

if (
  localStorage.getItem('countiesCache') &&
  localStorage.getItem('educationCache')
) {
  counties = JSON.parse(localStorage.getItem('countiesCache'));
  education = JSON.parse(localStorage.getItem('educationCache'));
  drawMap();
} else {
  const data = [
    'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json',
    'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json',
  ];
  Promise.all(data.map(url => d3.json(url))).then(vals => {
    counties = vals[0];
    education = vals[1];
    localStorage.setItem('countiesCache', JSON.stringify(vals[0]));
    localStorage.setItem('educationCache', JSON.stringify(vals[1]));
    drawMap();
  }).catch(() => {
    alert('Sorry, but needed data can\'t be fetched: ');
  });
}


function drawMap() {

  const min = d3.min(education, d => d.bachelorsOrHigher),
    max = d3.max(education, d => d.bachelorsOrHigher),
    delta = max - min;

  const color = d3.scaleThreshold()
    .domain(d3.range(min, max, delta / 9))
    .range(d3.schemePurples[9]);

  const x = d3.scaleLinear()
    .domain([min, max])
    .rangeRound([500, 1000]);


  const g = svg.append('g')
    .attr('id', 'legend');

  g.selectAll('rect')
    .data(color.range().map(d => {
      const tmp = color.invertExtent(d);
      return [tmp[0] || x.domain()[0], tmp[1] || x.domain()[1]];
    }))
    .enter().append('rect')
    .attr('height', 10)
    .attr('width', d => x(d[1]) - x(d[0]))
    .attr('x', d => x(d[0]))
    .attr('fill', d => color(d[0]));

  g.append('text')
    .attr('x', x.range()[0])
    .attr('y', 0);

  g.call(d3.axisBottom(x)
    .tickSize(10)
    .tickFormat(x => `${Math.round(x)}%`)
    .tickValues(color.domain()))
    .select('.domain')
    .remove();

  const zoom = d3.zoom()
    .scaleExtent([1, 20])
    .on('zoom', zoomed);

  d3.select('#choropleth-map')
    .call(zoom);

  const path = d3.geoPath();
  svg.append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(topojson.feature(counties, counties.objects.counties).features)
    .enter().append('path')
    .attr('class', 'county')
    .attr('data-fips', d => d.id)
    .attr('data-education', d => {
      return education.find(el => el.fips === d.id).bachelorsOrHigher;
    })
    .attr('fill', function (d) {
      return color(education.find(el => el.fips === d.id).bachelorsOrHigher || 0);
    })
    .attr('d', path)
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut);
}

function handleMouseOver(d) {
  const item = education.find(el => el.fips === d.id);
  d3.select('#tooltip')
    .style('top', `${d3.event.pageY + 10}px`)
    .style('left', `${d3.event.pageX + 10}px`)
    .text(item ? `${item.area_name}, ${item.state} - ${item.bachelorsOrHigher}%` : '')
    .attr('data-education', item ? item.bachelorsOrHigher : null)
    .style('opacity', 0.7) // just to pass ffc tests
    .style('visibility', 'visible');
}

function handleMouseOut() {
  d3.select('#tooltip')
    .style('opacity', 0) // just to pass ffc tests
    .style('visibility', 'hidden');
}

/*
* Map zoom
*/
function zoomed() {
  svg.style('stroke-width', `${1 / d3.event.transform.k}px`);
  svg.attr('transform', d3.event.transform);
}
