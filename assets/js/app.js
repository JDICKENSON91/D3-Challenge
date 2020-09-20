// @TODO: YOUR CODE HERE!

// Setup SVG Width, Height & Margins

var svgWidth = 1200;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create the SVG wrapper, append an SVG group that will hold the chart, shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight + 40);

var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

 // Scale Functions
 var xLinearScale = xScale(pop_data, chosenXAxis);
 var yLinearScale = yScale(pop_data, chosenYAxis);

 // Axis Functions
 var bottomAxis = d3.axisBottom(xLinearScale);
 var leftAxis = d3.axisLeft(yLinearScale);

 // Append x and y axes to the chart
 var xAxis = chartGroup.append("g")
   .attr("transform", `translate(0, ${height})`)
   .call(bottomAxis);

 var yAxis = chartGroup.append("g")
   .call(leftAxis);

// Retrieve data from the CSV file.
d3.csv("assets/data/data.csv").then(function(pop_data, err) {
    if (err) throw err;

  
    // Parse the data.
    pop_data.forEach(function(data) {
      data.state = data.state;
      data.abbr = data.abbr;  
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });
  

  // Create scatterplot and append initial circles
  var circlesGroup = chartGroup.selectAll("g circle")
    .data(pop_data)
    .enter()
    .append("g");
  
  var circlesXY = circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .classed("Circle_pop", true);
  
  var circlesText = circlesGroup.append("text")
    .text(d => d.abbr)
    .attr("dx", d => xLinearScale(d[chosenXAxis]))
    .attr("dy", d => yLinearScale(d[chosenYAxis]) + 5)
    .classed("stext_pop", true);

  // Create group for 3 x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 25)
    .attr("value", "poverty")
    .text("In Poverty (%)")
    .classed("active", true);

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 50)
    .attr("value", "age")
    .text("Age (Median)")
    .classed("inactive", true);

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 75)
    .attr("value", "income")
    .text("Household Income (Median)")
    .classed("inactive", true);

  // Create group for 3 y-axis labels
  var ylabelsGroup = chartGroup.append("g");

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -25)
    .attr("value", "healthcare")
    .text("Lacks Healthcare (%)")
    .classed("active", true);

  var smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -50)
    .attr("value", "smokes")
    .text("Smokes (%)")
    .classed("inactive", true);

  var obeseLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -75)
    .attr("value", "obesity")
    .text("Obese (%)")
    .classed("inactive", true);

  // initial tooltips
  circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      // updates x scale for new data
      xLinearScale = xScale(pop_data, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesXY = renderXCircles(circlesXY, xLinearScale, chosenXAxis);

      // updates circles text with new x values
      circlesText = renderXText(circlesText, xLinearScale, chosenXAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

      // changes classes to change bold text
      if (chosenXAxis === "age") {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenXAxis === "income") {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
      }
      else {
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
    }
  });

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenYAxis with value
      chosenYAxis = value;

      // updates y scale for new data
      yLinearScale = yScale(pop_data, chosenYAxis);

      // updates y axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new y values
      circlesXY = renderYCircles(circlesXY, yLinearScale, chosenYAxis);

      // updates circles text with new y values
      circlesText = renderYText(circlesText, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

      // changes classes to change bold text
      if (chosenYAxis === "smokes") {
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "obesity"){
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obeseLabel
          .classed("active", true)
          .classed("inactive", false);
      }
      else {
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
    }

});
}).catch(function(error) {
  console.log(error);
});
