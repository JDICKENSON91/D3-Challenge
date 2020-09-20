// @TODO: YOUR CODE HERE!

//Setup SVG Width, Height & Margins

var svgWidth = 960;
var svgHeight = 500;

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
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "smokes_%";

// function used for updating x-scale var upon click on axis label
function xScale(pop_data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(pop_data, d => d[chosenXAxis]) * 0.8,
        d3.max(pop_data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  }

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var label;
  
    if (chosenXAxis === "Smokes_%") {
      label = "Smokes (%)";
    }
    else if (chosenXAxis === "Obese_%") {
      label = "Obese (%)";
    }

    else {
        label = "Lacks Healthcare (%)";
      }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.abbr}<br>${label} ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }


  // Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(pop_data, err) {
    if (err) throw err;
  
    // parse data
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
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(pop_data, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(pop_data, d => d.poverty)])
      .range([height, 0]);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    chartGroup.append("g")
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(pop_data)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.poverty))
      .attr("r", 20)
      .attr("fill", "pink")
      .attr("opacity", ".5");
  
    // Create group for x-axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var smokes_label = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "smokes_%") // value to grab for event listener
      .classed("active", true)
      .text("Smokes %");
  
    var obesity_label = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "obesity_%") // value to grab for event listener
      .classed("inactive", true)
      .text("Obesity %");

    var healthcare_label = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "healthcare_%") // value to grab for event listener
      .classed("inactive", true)
      .text("Healthcare %"); 
  
    // append y axis

    var YlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var smokes_label = YlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "smokes_%") // value to grab for event listener
    .classed("active", true)
    .text("Smokes %");

  var obesity_label = YlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "obesity_%") // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity %");

  var healthcare_label = YlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "healthcare_%") // value to grab for event listener
    .classed("inactive", true)
    .text("Healthcare %"); 

    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Number of Billboard 500 Hits");
  
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(pop_data, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenXAxis === "obesity_%") {
            obesity_label
              .classed("active", true)
              .classed("inactive", false);
            smokes_label
              .classed("active", false)
              .classed("inactive", true);
            healthcare_label
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "smokes_%") {
            smokes_label
              .classed("active", true)
              .classed("inactive", false);
            obesity_label
              .classed("active", false)
              .classed("inactive", true);
            healthcare_label
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            healthcare_label
              .classed("active", true)
              .classed("inactive", false);
            obesity_label
              .classed("active", false)
              .classed("inactive", true);
            smopkes_label
              .classed("active", false)
              .classed("inactive", true);
          } 
        }
      });
  }).catch(function(error) {
    console.log(error);
  });
  
  