const width = 800;
const height = 400;
const padding = 60;

const svg = d3.select("#chart")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("#tooltip");

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json").then(data => {
  const dataset = data.data;
  
  const parseDate = d3.timeParse("%Y-%m-%d");
  dataset.forEach(d => d[0] = parseDate(d[0]));

  const xScale = d3.scaleTime()
    .domain([d3.min(dataset, d => d[0]), d3.max(dataset, d => d[0])])
    .range([padding, width - padding]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d[1])])
    .range([height - padding, padding]);

  const xAxis = d3.axisBottom(xScale);

  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height - padding})`)
    .call(xAxis)
    .selectAll(".tick text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis);

  svg.selectAll(".bar")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d[0]))
    .attr("y", d => yScale(d[1]))
    .attr("width", (width - 2 * padding) / dataset.length)
    .attr("height", d => height - padding - yScale(d[1]))
    .attr("data-date", d => d3.timeFormat("%Y-%m-%d")(d[0]))
    .attr("data-gdp", d => d[1])
    .on("mouseover", function(event, d) {
      tooltip.style("visibility", "visible")
        .attr("data-date", d3.timeFormat("%Y-%m-%d")(d[0]))
        .text(`Date: ${d3.timeFormat("%Y-%m-%d")(d[0])}\nGDP: $${d[1]} Billion`);
    })
    .on("mousemove", function(event) {
      tooltip.style("top", (event.pageY - 50) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden");
    });
});
