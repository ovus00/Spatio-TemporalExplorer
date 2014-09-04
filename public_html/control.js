/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var property="http://spatial.linkedscience.org/context/amazon/DEFOR_2005";
var datamap = {};
var opacity=0.7;
var highval = 1;
var lowval = 0;
var highval1 = 1;
var lowval1 = 0;
var highval2 = 1;
var lowval2 = 0;

var categories={};

var limit="";
//var limit=" limit 10";
var colorscale = d3.scale.linear()
    .domain([lowval,(lowval+highval)/2,highval])
    .range(["lightgreen","yellow", "red"]);
    
var val1colorscale = d3.scale.linear()
    .domain([lowval1,(lowval1+highval1)/2,highval1])
    .range(["lightgreen","yellow", "red"]);
    
var val2colorscale = d3.scale.linear()
    .domain([lowval2,(lowval2+highval2)/2,highval2])
    .range(["lightgreen","yellow", "red"]);
//    .range(["#254117", "#4AA02C", "#4AA02C", "#FF8040", "#FF0000"]);

var animatefunction;


$(function() {
    
//    $('.selectpicker').selectpicker();
    loadProperties();
    loadSections();
    
//    loadGraph();
});

function doTest(){
    console.log();
}

function stop(){
    clearInterval(animatefunction);
}

function loadGraph(categories,seriesdata,property){
    var prop = property.split('/')[property.split('/').length-1];
//    console.log("seriesdata in loadgraph");
//    console.log(categories);
//    console.log(seriesdata);
    $('#graph').highcharts({
        chart: {
            type: 'scatter',
            zoomType: 'x'
        },
        title: {
            text: 'Values of '+prop
        },
        xAxis: {
            title: {
                enabled: true,
                text: ''
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true
        },
        yAxis: {
            title: {
                text: 'Value'
            }
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
//            x: 100,
//            y: 70,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                cursor: 'pointer',
                events: {
                    click: function(event) {
//                        
//                        console.log(event.point.category);
//                        console.log(categories[event.point.category]);
                        d3.select('#'+categories[event.point.category]).transition().style('opacity',1).style('stroke-width',2).style('stroke',"black").duration(2000);
                        d3.select('#'+categories[event.point.category]).transition().style('opacity',0,3).style('stroke-width',0.1).delay(2000).duration(2000);
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.y} '
                }
            }
        },
        series: [{
            name: prop,
            color: 'rgba(223, 83, 83, .5)',
            data: seriesdata
        }]
    });
}


function loadProperties(){
    $("#loader").show();
//    var results = allpredicates.results.bindings;
//    $.each(results,function(indx,value){
//        $("#properties").append(new Option(value.pred.value, value.pred.value));
//        $("#properties_compare1").append(new Option(value.pred.value, value.pred.value));
//        $("#properties_compare2").append(new Option(value.pred.value, value.pred.value));
//    });
//    $("#loader").hide();
    var query = "prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n\
                SELECT distinct ?pred ?val from <http://spatial.linkedscience.org/context/amazon/> WHERE {\n\
                ?pred a <http://spatial.linkedscience.org/context/amazon/VARIABLE>. \n\
                ?pred rdfs:label ?val} order by ?pred";
    var sparqlurl = "http://spatial.linkedscience.org/sparql";
    $.ajax({
        dataType: "jsonp",
        contentType: 'application/sparql-results+json',
        crossDomain: true,
        data: {
            query: query,
            format: 'json'
        },
        url: sparqlurl,
        success: function(data) {
            console.log(data);
            var results = data.results.bindings;
            $.each(results,function(indx,value){
                $("#properties").append(new Option(value.val.value, value.pred.value));
                $("#properties_compare1").append(new Option(value.val.value, value.pred.value));
                $("#properties_compare2").append(new Option(value.val.value, value.pred.value));
            });
            $("#loader").hide();
        }
    });
}

function showPropertyDetails(property){
    var query = "SELECT ?property ?hasValue ?isValueOf WHERE { \n\
                { <"+property+"> ?property ?hasValue }\n\
                UNION { ?isValueOf ?property <"+property+"> }} "+limit;
    var sparqlurl = "http://spatial.linkedscience.org/sparql";
    $.ajax({
        dataType: "jsonp",
        contentType: 'application/sparql-results+json',
        crossDomain: true,
        data: {
            query: query,
            format: 'json'
        },
        url: sparqlurl,
        success: function(data) {
//            console.log(data);
//            parsedJson, tableId, tableClassName, linkText
            var tablehtml = "<table class='table table-condensed table-striped'>";
            $.each(data.results.bindings,function(indx,val){
                tablehtml+="<tr><td>"+val.property.value.split('/')[val.property.value.split('/').length-1]+"</td><td>"+val.hasValue.value.split('/')[val.hasValue.value.split('/').length-1]+"</td></tr>";
            });
            tablehtml+="</table>";
            $("#details").html(tablehtml);
        }
    });
}



function colorEncode(prop){
    $("#loader").show();
    if (prop===undefined) prop=property;
    console.log($("#properties option:selected").val());
    prop = $("#properties option:selected").val();
    showPropertyDetails(prop);
    var query = "SELECT ?region ?value from <http://spatial.linkedscience.org/context/amazon/> WHERE \n\
        { ?region a <http://linkedscience.org/lsv/ns#Item>. \n\
        ?region <"+prop+"> ?value. } order by ?value "+limit;
    var sparqlurl = "http://spatial.linkedscience.org/sparql";
    $.ajax({
        dataType: "jsonp",
        contentType: 'application/sparql-results+json',
        crossDomain: true,
        data: {
            query: query,
            format: 'json'
        },
        url: sparqlurl,
        success: function(data) {
            lowval=parseFloat(data.results.bindings[0].value.value);
            highval=parseFloat(data.results.bindings[data.results.bindings.length-1].value.value);
            colorscale.domain([lowval,(lowval+highval)/2,highval]);
            var dataseries = [];
            categories={};
            var results = data.results.bindings;
            $.each(results,function(indx,val){
                var urlid = val.region.value;
                var propval = parseFloat(val.value.value);
                var localname = urlid.split('/')[urlid.split('/').length-1];
                dataseries.push([indx,propval]);
                categories[indx]=localname;
                d3.select('#'+localname).style('fill',null);
                d3.select('#'+localname).style('fill',function(){
//                    console.log(propval + ":"+ colorscale(propval));
                    return colorscale(propval);
                }).style('opacity',0.3);
                
                
//                d3.select('#'+localname).style('fill','tomato').style('opacity',propval);
            });
            console.log("going to load graph");
            loadGraph(categories,dataseries,prop);
            $("#loader").hide();
        }
    });
    
}


function compare(){
     $("#loader").show();
    var prop1 = $("#properties_compare1 option:selected").val();
    var prop2 = $("#properties_compare2 option:selected").val();
    
//    showPropertyDetails(prop);
    var query = "SELECT ?region ?value1 ?value2 from <http://spatial.linkedscience.org/context/amazon/> WHERE \n\
        { ?region a <http://linkedscience.org/lsv/ns#Item>. \n\
          ?region <"+prop1+"> ?value1. \n\
        ?region <"+prop2+"> ?value2. } order by ?value1 ?value2"+limit;
    var sparqlurl = "http://spatial.linkedscience.org/sparql";
    $.ajax({
        dataType: "jsonp",
        contentType: 'application/sparql-results+json',
        crossDomain: true,
        data: {
            query: query,
            format: 'json'
        },
        url: sparqlurl,
        success: function(data) {
            console.log(data);
            
            lowval1=parseFloat(data.results.bindings[0].value1.value);
            highval1=parseFloat(data.results.bindings[data.results.bindings.length-1].value1.value);
            lowval2=parseFloat(data.results.bindings[0].value2.value);
            highval2=parseFloat(data.results.bindings[data.results.bindings.length-1].value2.value);
            val1colorscale.domain([lowval1,(lowval1+highval1)/2,highval1]);
            val2colorscale.domain([lowval2,(lowval2+highval2)/2,highval2]);
            console.log(lowval1);
            console.log(lowval2);
            console.log(highval1);
            console.log(highval2);
//            var dataseries = [];
//            categories={};
            var results = data.results.bindings;
            $.each(results,function(indx,val){
                var urlid = val.region.value;
                var propval1 = parseFloat(val.value1.value);
                var propval2 = parseFloat(val.value2.value);
                var localname = urlid.split('/')[urlid.split('/').length-1];
//                dataseries.push([indx,propval1]);
//                categories[indx]=localname;
//                d3.select('#'+localname).each(function(){
//                        var that = this;
////                        if (d<3) {
//                        setInterval(function(){d3.select(that)
//                            .style("fill","black")
//                            .transition()
//                            .duration(1000)
//                            .style("fill","red")},1000);
////                        }
//                });
                d3.select('#'+localname).style('fill',null);
//                {
                    animatefunction = setInterval(function(){
//                        console.log(d3.select('#'+localname));
                        d3.select('#'+localname)
                            .style('fill',function(){
                                    return val1colorscale(propval1);
                                }).style('opacity',0.3)
                            .transition()
                            .duration(2000)
                            .style("fill",function(){
                                    return val2colorscale(propval2);
                                }).style('opacity',0.3)
                            .transition()
                            .duration(2000)
                            
                            },1000);
//                };

                
//                        style('fill',function(){
//                    return val1colorscale(propval1);
//                }).style('opacity',0.3);
                        
//                        transition().style('fill',function(){
//                    return val2colorscale(propval2);
//                }).style('opacity',0.3).duration(5000);
//                d3.transition()
//                .delay(750)
//                .each("start", function() { d3.select('#'+localname).style("color", "green"); })
//                .style("color", "red");
                
                
//                d3.select('#'+localname).style('fill','tomato').style('opacity',propval);
            });
//            console.log("going to load graph");
//            loadGraph(categories,dataseries,prop);
            $("#loader").hide();
        }
    });
    
}

function search() {
    console.log("search");
    
}


function loadSections() {


    var results = allregions.results.bindings;
    //        $.each(results,function(indx,result){
    ////           console.log(result);
    //           var pointarr = result.points.value.split(';');
    //        });
    //d3.json("stations.json", function(data) {
    var overlay = new google.maps.OverlayView();
    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {
        var layer = d3.select(this.getPanes().overlayLayer).append("div")
                .attr("class", "stations");
        // Draw each marker as a separate SVG element.
        // We could use a single SVG, but what size would it have?
        overlay.draw = function() {
            var projection = this.getProjection(),
                    padding = 1;
            var marker = layer.selectAll("svg")
                    .data(d3.entries(results))
                    .each(transform) // update existing markers
                    .enter().append("svg:svg")
                    .each(transform)
                    .attr("class", "marker").attr('id',function(d){
                        var urlid=d.value.region.value;
                        return urlid.split('/')[urlid.split('/').length - 1]+'_marker';
                    });

            marker.append("svg:polygon").attr('id', function(d) {
                var urlid = d.value.region.value;
//                        return "value";
                return urlid.split('/')[urlid.split('/').length - 1];
            })
                    .attr("points", function(d) {
                return "0,0 10,0 10,10 0,10 ";
            });
            //          
            //      
            function transform(d) {
                var newpoints = "";
                var points = d.value.points.value.split(';');
                var prevpt = new google.maps.LatLng(points[1].split(",")[1], points[1].split(",")[0]);
                prevpt = projection.fromLatLngToDivPixel(prevpt);
                var highx = 0;
                var highy = 0;
                $.each(points, function(indx, value) {
                    if (indx > 0) {
                        var val = value.split(",");
                        var pt = new google.maps.LatLng(val[1], val[0]);
                        pt = projection.fromLatLngToDivPixel(pt);
                        newpoints += "" + Math.abs(prevpt.y - pt.y) + "," + Math.abs(prevpt.x - pt.x) + " ";
                        if (Math.abs(prevpt.x - pt.x) > highx)
                            highx = Math.abs(prevpt.x - pt.x);
                        if (Math.abs(prevpt.y - pt.y) > highy)
                            highy = Math.abs(prevpt.y - pt.y);
                        prevpt = pt;
                    }
                });

                var firstpoint = points[0].split(',');

                try {
                    var id = this.children[0].attributes.id.value;
//                            console.log(id.value);
                    if (datamap[id] === undefined || datamap[id] === null) {
                        datamap[id] = this;
//                                console.log(datamap);
                    }
//                            console.log(this.children[0].attributes.id);
                    this.children[0].attributes.points.value = '0,0 ' + highx + ',0 ' + highx + ',' + highy + ' 0,' + highy;
//                    console.log('0,0 '+highx+',0 '+highx+','+highy+' 0,'+highy);
                }
                catch (Err) {
//                            console.log(Err);
                }
//                
                d = new google.maps.LatLng(firstpoint[1], firstpoint[0]);
                d = projection.fromLatLngToDivPixel(d);
                return d3.select(this)
                        .style("left", (d.x) + "px")
                        .style("top", (d.y) + "px");
            }
        };
    };
    // Bind our overlay to the map…
    overlay.setMap(map);
    
    
    doTest();

}
 