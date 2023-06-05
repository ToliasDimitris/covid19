function current_date(){
    // returns current date in format yyyy-mm-dd
    var today = new Date();
    return dt_tostring(today);
}

function dt_tostring(date){		
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); 
    var yyyy = date.getFullYear();
    var date_to_string = yyyy + '-' + mm + '-' + dd;
    return date_to_string;		
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function comp_areas_list(list_of_dates){
    //list of dates should be without " "
    //when we have all datasets get distinct areas from all datasets
    var all_areas=[];
    var array_length=list_of_dates.length;
    for (var i=0;i<array_length;i++){        
        var dict=JSON.parse(sessionStorage.getItem(list_of_dates[i]));
        var data=dict.data;
        var data_length=data.length;
        for (var j=0;j<data_length;j++){
            var x=data[j];
            var area_name=x.area;
            all_areas.push(area_name);
        }
    } 
    var distinct_areas=all_areas.filter(onlyUnique);
    return distinct_areas;
}

function make_area(areas_list,element_id){
    //make areas dropdown
    var options=make_options(areas_list);
    document.getElementById(element_id).innerHTML=options;
}

function make_options(areas_list){
    //make the options that ll go in the select tag
    //default use ALL areas
    var all_areas="<option selected>ΟΛΕΣ</option>";
    var option_string=all_areas;
    var array_length=areas_list.length;
    for (var i=0;i<array_length;i++){
        var temp="<option>"+areas_list[i]+"</option>";
        option_string+=temp;
    }
    return option_string;
}

function make_date_from(element_id){
    var today=this.current_date();
    //var text="<label>Από:</label><input type=\"date\" id=\"date_from\" name=\"date_from\" min=\"2020-12-28\" max="+today+"></input>";
    var text = `<label>Από:</label><input type="date" id="date_from" name="date_from" min="2020-12-28" max=${today}></input>`;
    document.getElementById(element_id).innerHTML=text;
    let fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 9);
    document.getElementById('date_from').value = dt_tostring(fromDate);
}

function make_date_to(element_id){
    var today=this.current_date();
    var text="<label>Έως:</label><input type=\"date\" id=\"date_to\" name=\"date_to\" min=\"2020-12-28\" max="+today+"></input>";
    document.getElementById(element_id).innerHTML=text;
    document.getElementById('date_to').value=today;
}

function make_chart_pts(datasets,area_name){
    //datasets-->//array of datasets in json form{"date":"yyyy-mm-dd", "data": [ {..},{..},..]  }
    //if area selected != ALL return empty on pie1 pie2
    var line1_pts=[];   //[[date, dose1 , dose2 , total_dose ] ,...]
    var line2_pts=[];   //[[date, cum_dose1 , cum_dose2 , cum_total_dose ] ,...]
    var chart1_json={}; //{ "country_name":total_dose1,... }
    var chart2_json={}; //{ "country_name":total_dose2,... }
    var ds_length=datasets.length;
    var cum_dose1=0;
    var cum_dose2=0;
    var cum_total_dose=0;
    var chart1_array=[];
    var chart2_array=[];
    if(area_name=="ΟΛΕΣ"){
       
        for (var i=0;i<ds_length;i++){
            //iterate through each day of records
            var json_dataset=datasets[i];
            var date=json_dataset.date;   //yyyy-mm-dd
            var data=json_dataset.data;   //arrayOf {json api records}  
            var length2=data.length;
            var all_dose1=0;
            var all_dose2=0;
            
            for (j=0;j<length2;j++){
                //iterate through each record
                var record=data[j];
                // RECORD sample
                // {
                //     "area": "ΑΙΤΩΛΟΑΚΑΡΝΑΝΙΑΣ",
                //     "areaid": 701,
                //     "dailydose1": 0,
                //     "dailydose2": 0,
                //     "daydiff": 0,
                //     "daytotal": 0,
                //     "referencedate": "2020-12-28T00:00:00",
                //     "totaldistinctpersons": 0,
                //     "totaldose1": 0,
                //     "totaldose2": 0,
                //     "totalvaccinations": 0
                // }
                var area=record.area;
                var dailydose1=record.dailydose1;
                var dailydose2=record.dailydose2;
                all_dose1+=dailydose1;
                all_dose2+=dailydose2;
                // sum doses per country 
                if (area in chart1_json ){
                    chart1_json[area]+=dailydose1;
                }
                else{
                    chart1_json[area]=dailydose1;
                }
                if (area in chart2_json ){
                    chart2_json[area]+=dailydose2;
                }
                else{
                    chart2_json[area]=dailydose2;
                }

            }
            var all_total_dose=all_dose1+all_dose2;
            cum_dose1+=all_dose1;
            cum_dose2+=all_dose2;
            cum_total_dose=cum_dose1+cum_dose2;
            line1_pts.push([date,all_dose1,all_dose2,all_total_dose]);
            line2_pts.push([date,cum_dose1,cum_dose2,cum_total_dose]);

        }
        //convert json to arrays for the pies!
        // if all daily records of the duration are empty [] --> chart_arrays are empty []
        for(var i in chart1_json)
            chart1_array.push([i, chart1_json[i]]);
        for(var i in chart2_json)
            chart2_array.push([i, chart2_json[i]]);

        var test=JSON.stringify(chart1_array);
        

    }
    else{
        //pie1,pie2=null        
        for (var i=0;i<ds_length;i++){
            //iterate through each day of records
            var json_dataset=datasets[i];
            var date=json_dataset.date;   //yyyy-mm-dd
            var data=json_dataset.data;   //arrayOf {json api records}  
            var length2=data.length;
            //find data of record with country name===area_name
            var area_record=data.find(o=>o.area===area_name);
            if ((area_record===undefined)){
                // if doesnt exist such record put 0 to vaccination values and let cum_values same
                line1_pts.push([date,0,0,0]);
                line2_pts.push([date,cum_dose1,cum_dose2,cum_total_dose])
            }
            else{
                var dose1=area_record.daildose1;
                var dose2=area_record.dailydose2;
                var total_dose=area_record.daytotal;
                cum_dose1+=dose1;
                cum_dose2+=dose2;
                cum_total_dose+=dose1+dose2;
                line1_pts.push([date,dose1,dose2,total_dose]);
                line2_pts.push([date,cum_dose1,cum_dose2,cum_total_dose]);
            }
        }      
 
    }
    return [line1_pts,line2_pts,chart1_array,chart2_array];
}
 
function draw_line(line_pts,element_id,title){
// draw line graph in to the element with element_id
    google.charts.load('current', {packages: ['corechart', 'line']});
    google.charts.setOnLoadCallback(drawCrosshairs);
    var array=[];
    array.push(['Ημ/νια','1η δόση','2η δόση','Σύνολο']);
    var len=line_pts.length;
    for (var i=0;i<len;i++){
        array.push(line_pts[i]);
    }
// var array=[
//     ['Date', 'dose_1', 'dose_2','total_doses'],
//     ['2004-02-02',  1000,      400,1400],
//     ['2005',  1170,      460,1170+460],
//     ['2006',  660,       1120,1120+660],
//     ['2007',  1030,      540,540+1030]
//   ];
//   array.push(['2007',  1030,      540,540+1030]);  

    function drawCrosshairs() {
        var data = google.visualization.arrayToDataTable(array);

        var options = {
            title:title,
            hAxis: {
            title: 'Ημ/νια',
            slantedText:true,
            slantedTextAngle:15,  
            "textStyle" : {
                "color" : "red",
                "fontSize" : "10",
                "italic" : "false",
                "bold" : "true",
                }
            },
            vAxis: {
            title: 'Αριθμός εμβολιασμών'
            },
            colors: ['#a52714', '#097138','#191970'],
            crosshair: {
            color: '#000',
            trigger: 'selection'
            }
        };
        var chart = new google.visualization.LineChart(document.getElementById(element_id));
        chart.draw(data, options);
    }
}

function draw_pie(chart_array,element_id,title){
    //draw pie graph in to the element with element_id
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(drawChart);

        var pie_arr=[];
        pie_arr.push(['Πόλη','Σύνολο εμβολιασμών']);
        var len=chart_array.length;
        for (var i=0;i<len;i++){
        	
        	pie_arr.push(chart_array[i]);
        }
        
        function drawChart() {
            // sample data 
            // [
            //     ['Task', 'Hours per Day'],
            //     ['Work',     11],
            //     ['Eat',      2],
            //     ['Commute',  2],
            //     ['Watch TV', 2],
            //     ['Sleep',    7]
            //     ]
            var data = google.visualization.arrayToDataTable(pie_arr);
            var options = {
                 title: title
            };
            var chart = new google.visualization.PieChart(document.getElementById(element_id));
            chart.draw(data, options);
        }

}

function comp_betw_dates(){
    var date1=new Date(document.getElementById("date_from").value);
    var date2=new Date(document.getElementById("date_to").value);
    var arr=[];

    for(dt=date1;dt<=date2;dt.setDate(dt.getDate()+1)){
        var yyyy=dt.getFullYear();
        var mm=String(dt.getMonth()+1).padStart(2, '0');
        var dd=String(dt.getDate()).padStart(2, '0');
        var date_string=yyyy+"-"+mm+"-"+dd;
        arr.push(date_string);
    } 
    return arr;    
    // return "all_dates" array;
    //date is in form yyyy-mm-dd
}

function area_updated(){
     //remove pie1 and pie2!!!
     document.getElementById("left_pie").innerHTML="";
     document.getElementById("right_pie").innerHTML="";       
     
     var betw_dates=comp_betw_dates();
     var json_datasets=[];   //array of datasets in json form{"date":"yyyy-mm-dd", "data": [ {..},{..},..]  }
     var array_length=betw_dates.length;
     for (var i=0;i<array_length;i++){
        var dict=JSON.parse(sessionStorage.getItem(betw_dates[i]));
        json_datasets.push(dict);
     }  

     //get area_option
     var selections=document.getElementById("Areas"); 
     var area_name=selections.options[selections.selectedIndex].text;
    //make_chart_points
    var pts_array=make_chart_pts(json_datasets,area_name);
    //[line1_pts,line2_pts,chart1_array,chart2_array]
    var line1_pts=pts_array[0];
    var line2_pts=pts_array[1];
    var chart1_array=pts_array[2];
    var chart2_array=pts_array[3];
    //make lines  , if ALL-areas make pies too!!
    draw_line(line1_pts,"left_line","Ημερήσια κατανομή εμβολιασμών");
    draw_line(line2_pts,"right_line","Ημερήσια αθροιστική κατανομή");
    if (area_name=="ΟΛΕΣ"){
    	if (chart1_array.length!=0){
    		//if array empty--> we have empty data for all the duration
    		var pie1_top10=top_10(chart1_array);
    		draw_pie(pie1_top10,"left_pie","Οι 10 Περιοχές με τον μεγαλύτερο αριθμό εμβολιασμών της 1ης δόσης");
    	}
        if (chart2_array.length!=0){
        	//if array empty--> we have empty data for all the duration
        	var pie2_top10=top_10(chart2_array);
        	draw_pie(pie2_top10,"right_pie","Οι 10 Περιοχές με τον μεγαλύτερο αριθμό εμβολιασμών της 2ης δόσης");
        }
    }  
    
}

function top_10(array){
    //gets an array with key-vals 
    // returns an array with key-vals for the top 9 and  Others-sum(othervalues)
    array.sort(compareSecondColumn);

    function compareSecondColumn(a, b) {
        if (a[1] === b[1]) {
            var str1=a[0];
            var str2=b[0];
            return str1.localeCompare(str2);                
        }
        else {
            return (a[1] > b[1]) ? -1 : 1;
        }
    }

    var sum=0;
    for (var i=9;i<array.length;i++){
        sum+=array[i][1];
    }

    var top_10=[];
    for (var j=0;j<9;j++){
        top_10.push(array[j]);
    }
    top_10.push(["ΛΟΙΠΕΣ",sum]);
    
    return top_10;
}

async function date_updated(){
    var dates_array=comp_betw_dates();
    var missing_dates=compute_missing_datasets_list(dates_array);
    if(missing_dates.length>0){
    	var server_response=await getAllData(missing_dates);
    	store_missing_datasets(server_response);
    }	

    var distinct_areas=comp_areas_list(dates_array);
    if (distinct_areas.length<1){
    	alert("No data for the date range selected");
    }
    make_area(distinct_areas,"Areas");
    area_updated();    
}


function store_date_dataset(json_dataset){
    // form--> { "data":[ {},{},..  ]  ,  "date":yyyy-mm-dd   }
    //store dataset as json string with name the relevant date on sessionstorage
    var date=json_dataset.match("\"date\":\"....-..-..\"")[0].split(":")[1].slice(1,-1);
    sessionStorage.setItem(date,json_dataset);
}

function compute_missing_datasets_list(dates_array){
    var missing_dates=[]
    var arr_length=dates_array.length;
    for (var i=0;i<arr_length;i++){
        var date=dates_array[i];
        if (sessionStorage.getItem(date)===null)
            missing_dates.push(date);
    }
    return missing_dates;
}

function store_missing_datasets(server_response){
    //resp will be array of objects ---> [ { "data": [{...},{...}]  ,"date":yyyy-mm-dd  } ,  { ....} , {..}     ]
	var arr=JSON.parse(server_response);  
    var len=arr.length;
    for(var i=0;i<len;i++){
        var obj=arr[i];
        store_date_dataset(JSON.stringify(obj));
    }
}

async function callGovApi(date) {
    const GOVURL = "https://data.gov.gr/api/v1/query/mdg_emvolio";
    const TOKEN = "Token b7e25c4b73ff3d44ae24214261f3c47e35f61fab";
    let params = "?date_from=" + date + "&date_to=" + date;

    const response = await fetch(GOVURL+params, {
      method: "GET",
      headers: {
        "Authorization": TOKEN
      },
    });
    let resp = await response.text();
    return resp;
}

function form_response(resp, date) {
    return `{"data":${resp},"date":"${date}"}`;	
}

async function getAllData(dates_list) {
    let str = '[';
    for (const date of dates_list) {
        let resp = await callGovApi(date);
        resp = form_response(resp, date);
        str += resp + ',';
    }
    str = str.substring(0, str.length-1) + "]";
    return str;
}

async function compxyz(){    		
	var run_date=new Date();
	//date.setDate(date.getDate() - 1);   --> how to get prev date
	var x=0;
	var y=0;
	var z=0;
	while(true){
		 var str_date=dt_tostring(run_date);
		 var resp= await getAllData([str_date]);
		 var arr=JSON.parse(resp);
		 if(arr[0].data.length>0){
			 //server didnt return an empty array
			 //compute and set results
			 //we asked only one date so array should have only one result
			 var data=arr[0].data;
			 var len=data.length;
			 for (var i=0;i<len;i++){
				 var json=data[i];
				 x+=json.totaldistinctpersons;
				 y+=json.totaldose1;
				 z+=json.totaldose2;
			 }
			 
			 break;  
		 }
		 //if we get here it means server return empty array
		 //its ok ask again for prev_date
		 run_date.setDate(run_date.getDate()-1);
	}
	//set x,y,z	
	document.getElementById("x").innerHTML=x.toLocaleString();
	document.getElementById("y").innerHTML=y.toLocaleString();
	document.getElementById("z").innerHTML=z.toLocaleString();
}