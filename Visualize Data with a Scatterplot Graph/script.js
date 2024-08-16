var url="https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

//create margins
var margin = {top: 100, right: 20, bottom: 30, left: 60},
    
  width = 900 - margin.left - margin.right,
  height = 630 - margin.top - margin.bottom;

var x = d3.scaleLinear()
            .range([0, width]);
      
var y = d3.scaleTime()
            .range([0, height]);
  
var color = d3.scaleOrdinal(d3.schemeSet1);

var timeFormat = d3.timeFormat('%M:%S');

var xAxis = d3.axisBottom(x).tickFormat(d3.format('d'))
  
var yAxis = d3.axisLeft(y).tickFormat(timeFormat)

//tooltip
var div = d3.select('body')
            .append('div')
            .attr('class','tooltip')
            .attr('id','tooltip')
            .style('opacity',0);

//create SVG element
var svg = d3.select('body')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('class','graph')
            .append('g')
.attr('transform','translate(' + margin.left + ',' + margin.top + ')');

var parsedTime;

d3.json(url).then(function(data){
    data.forEach(function(d){
      d.Place = +d.Place;
      var parsedTime = d.Time.split(':');
      d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1]));
      //console.log(data);
    }); 

  x.domain([d3.min(data, function(d){
     return d.Year - 1;
   }),
     d3.max(data, function(d){
      return d.Year +1;
       })
  ]);
  
  y.domain(d3.extent(data, function(d){
    return d.Time;
  }));

  //create x-axis
  svg.append('g')
     .attr('class','x axis')
     .attr('id','x-axis')
     .attr('transform','translate(0,'+height+')')
     .call(xAxis)
     .append('text')
     .attr('class','x-axis-label')
     .attr('x', width)
     .attr('y', -5)
     .style('text-anchor','end')
     .text('Year');
  
  //create y-axis
  svg.append('g')
    .attr('class', 'y axis')
    .attr('id','y-axis')
    .call(yAxis)
    .append('text')
    .attr('class','label')
    .attr('transform','rotate(-90)')
    .attr('y', 6)
    .attr('dy','71em')
    .style('text-anchor','end')
    .text('Best Time (minutes)')
  
  svg.append('text')
    .attr('transform','rotate(-90)')
    .attr('x', -160)
    .attr('y', -44)
    .attr('font-family','Arial')
    .style('font-size', 20)
    .text('Time in Minutes');

  //create circles in SVG
  svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('class','dot')
    .attr('r', 6)
    .attr('cx', function(d) { return x(d.Year); })
    .attr('cy', function(d) { return y(d.Time); })
    .attr('data-xvalue', function(d){ return d.Year; })
    .attr('data-yvalue', function(d){ return d.Time; })
    .style('fill', function(d){
      return color(d.Doping != '');
    })
    .on('mouseover', function(d) {
      div.style('opacity', .5);
      div.attr('data-year', d.Year)
      div.html(d.Name + ': '+ d.Nationality +'<br/>'
               +'Year: '+d.Year+ '<br/>Time: '+ timeFormat(d.Time) 
               + (d.Doping?'<br/>'+d.Doping:''))
         .style('left', (d3.event.pageX) + 'px')
         .style('top', (d3.event.pageY - 28) + 'px');   
    })
    .on('mouseout',function(d){
      div.style('opacity',0);
  });
  
//title
  svg.append('text')
    .attr('id','title')
    .attr('x',(width/2))
    .attr('y', 0 - (margin.top/2))
    .attr('text-anchor','middle')
    .attr('font-size',48)
    .attr('font-family','Arial')
    .text('Doping in Professional Cycling');

//legend
  var legend = svg.selectAll('.legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class','legend')
    .attr('id','legend')
    .attr('transform', function(d, i){
      return 'translate(0,'+ (height/2 - i * 20)+')';
    });
  
  legend.append('rect')
    .attr('x', width - 18)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill',color)
  
  legend.append('text')
    .attr('x', width - 24)
    .attr('y', 9)
    .attr('dy','.35em')
    .attr('font-family','Arial')
    .style('text-anchor','end')
    .text(function(d) {
    if (d) return "Riders with doping allegations";
    else{ return "No doping allegations";};
  })
});
