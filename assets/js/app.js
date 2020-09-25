var svgWidth = 960;
var svgHeight = 510;

var margin = {
  top: 20,
  right: 40,
  bottom: 85,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(popdata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(popdata, d => d[chosenXAxis]) * 0.8,
      d3.max(popdata, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// Function used for updating y-scale variable upon click on axis label.
function yScale(popdata, chosenYAxis) {
    // Create Scales.
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(popdata, d => d[chosenYAxis]) * 0.8,
            d3.max(popdata, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
}


// function used for updating xAxis var upon click on axis label
function renderAxesx(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderAxesy(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
    .duration(1000)
    .call(leftAxis);

return yAxis;
 }





// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circletextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    
    return circletextGroup;
}

// Function used for updating circles group with new tooltip.
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    // Conditional for X Axis.
    if (chosenXAxis === "poverty") {
        var xlabel = "Poverty: ";
    }
    else if (chosenXAxis === "income") {
        var xlabel = "Median Income: "
    }
    else {
        var xlabel = "Age: "
    }

    // Conditional for Y Axis.
    if (chosenYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare: ";
    }
    else if (chosenYAxis === "smokes") {
        var ylabel = "Smokers: "
    }
    else {
        var ylabel = "Obesity: "
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .style("color", "black")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .offset([120, -60])
        .html(function(d) {
            if (chosenXAxis === "age") {
                return (`${d.state}<hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
              } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
                // Display Income in dollars for xAxis.
                return (`${d.state}<hr>${xlabel}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
              } else {
                // Display Poverty as percentage for xAxis.
                return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
              }      
        });
    
    circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(popdata, err) {
  if (err) throw err;

  // parse data
  popdata.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
    console.log(data);
});

  // xLinearScale function above csv import
  var xLinearScale = xScale(popdata, chosenXAxis);

  // yLinearScale function above csv import
  var yLinearScale = yScale(popdata, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(popdata)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "Blue")
    .attr("text-anchor", "middle")
    .attr("opacity", ".9");

    // Add State abbr. text to circles.
 var circletextGroup = chartGroup.selectAll()
     .data(popdata)
     .enter()
     .append("text")
     .text(d => (d.abbr))
     .attr("x", d => xLinearScale(d[chosenXAxis]))
     .attr("y", d => yLinearScale(d[chosenYAxis]))
     .style("font-size", "10px")
     .style("text-anchor", "middle")
     .style('fill', 'white');

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener.
    .classed("active", true)
    .text("In Poverty (%)");

var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener.
    .classed("inactive", true)
    .text("Age (Median)");

var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener.
    .classed("inactive", true)
    .text("Household Income (Median)");

var healthcareLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (margin.left) * 2.5)
    .attr("y", 0 - (height + 80))
    .attr("value", "healthcare") // value to grab for event listener.
    .classed("active", true)
    .text("Lacks Healthcare (%)");

var smokeLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (margin.left) * 2.5)
    .attr("y", 0 - (height + 60))
    .attr("value", "smokes") // value to grab for event listener.
    .classed("inactive", true)
    .text("Smokes (%)");

var obesityLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", (margin.left) * 2.5)
    .attr("y", 0 - (height + 40))
    .attr("value", "obesity") // value to grab for event listener.
    .classed("inactive", true)
    .text("Obesity (%)");




    // Update tool tip function above csv import.
var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
  .on("click", function() {
      // Get value of selection.
      var value = d3.select(this).attr("value");
      if (true) {
        if (value === "poverty" || value === "age" || value === "income") {

            // Replaces chosenXAxis with value.
            chosenXAxis = value;

            console.log(chosenXAxis)

            // Update x scale for new data.
            xLinearScale = xScale(popdata, chosenXAxis);

            // Updates x axis with transition.
            xAxis = renderAxesx(xLinearScale, xAxis);

            // Changes classes to change bold text.
            if (chosenXAxis === "poverty") {
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
            else if (chosenXAxis === "age"){
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
            else {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);

                ageLabel
                    .classed("active", false)
                    .classed("inactive", true)

                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        
        } else {

            chosenYAxis = value;

            // Update y scale for new data.
            yLinearScale = yScale(popdata, chosenYAxis);

            // Updates y axis with transition.
            yAxis = renderAxesy(yLinearScale, yAxis);

            console.log(chosenYAxis)

            // Changes classes to change bold text.
            if (chosenYAxis === "healthcare") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);

                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);

                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "smokes"){
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);

                smokeLabel
                    .classed("active", true)
                    .classed("inactive", false);

                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);

                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);

                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        
        }

        // Update circles with new x values.
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // Update tool tips with new info.
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // Update circles text with new values.
        circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

    }
    
});
}).catch(function(error) {
  console.log(error);
});