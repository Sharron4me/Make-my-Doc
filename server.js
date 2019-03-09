const XLSX = require('xlsx');
const express = require('express');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const roundTo = require('round-to');
const fs = require('fs');
const rn = require('random-number');
const multer = require('multer');

const port = process.env.PORT || 3000;

var app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
hbs.registerPartials(__dirname+'/views/partials')
app.set('view engine','hbs');
app.use(express.static(__dirname+'/public'));

let options = {
        maxAge: 1000 * 60 * 15,
        httpOnly: true,
        signed: true
  }


var Storage = multer.diskStorage({
     destination: function(req, file, callback) {
         callback(null, "./sample");
     },
     filename: function(req, file, callback) {
         callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
     }
});

var upload = multer({
     storage: Storage
 }).array("File", 3)


hbs.registerHelper('table', function(count_table,co_num,file_name,co_level,co_mark1,co_mark2,co_mark3,file_path) {
  console.log("Count TABLE:"+count_table);
  console.log("CO-NUM TABLE:"+co_num);
  console.log("File Name TABLE:"+file_name);

  try{
  console.log("Co-level TABLE:"+file_path["data"]["root"]["co_level"]);
  console.log("CO-mark1 TABLE:"+file_path["data"]["root"]["co_mark1"]);
  console.log("CO-mark2 TABLE:"+file_path["data"]["root"]["co_mark2"]);
  console.log("CO-mark3 TABLE:"+file_path["data"]["root"]["co_mark3"]);
  console.log("file_path TABLE:"+file_path["data"]["root"]["file_path"]);
  co_level=file_path["data"]["root"]["co_level"];
  co_mark1=file_path["data"]["root"]["co_mark1"];
  co_mark2=file_path["data"]["root"]["co_mark2"];
  co_mark3=file_path["data"]["root"]["co_mark3"];
  file_path=file_path["data"]["root"]["file_path"];
  }
  catch(e){
    console.log(e);
  }
  var final_data = [];
  for(var i=0;i<co_num;i++){
    final_data.push(0);
  }
  var threshold=[];

  //console.log(data[0]['Name of Student']);
  var options = {
    min:  0
  , max:  1000
  , integer: true
  }
  var num = rn(options);

  console.log("CO-NUM:"+co_num);
  console.log("NUm:"+num);
  console.log("Error Not here:1");
  console.log("File-path:%j",file_path);

  const workbook = XLSX.readFile(file_path);
  const sheet_name_list = workbook.SheetNames;
  var data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  var str = '<table border = "1" cellpadding = "2" cellspacing = "1">';
  str+='<tr>'
      str+='<th colspan ="5" rowspan="2">Students</th>'
      var header = ","+","+"Student"+","+",";
      console.log("COUNT-TABLE:"+count_table);
      console.log(co_mark1);
      console.log(co_mark2);
      console.log(co_mark3);
      for (var i = 1; i <=co_num; i++ ) {
          str+='<th colspan="3">CO'+i+'</th>'
          header+= ",,"+"CO"+i+",,";
          var added=(co_mark1[i]-0)+(co_mark2[i]-0)+(co_mark3[i]-0);
          str+='<th>'+roundTo((added*(co_level[i-1]/100)),2)+'</th>'
          threshold.push(roundTo((added*(co_level[i-1]/100)),2)-0.1);
          header+=roundTo((added*(co_level[i-1]/100)),2);
      }
      header+="\n"
      header += ","+","+","+","+",";
    str+='</tr>'
  str+='<tr>'
  console.log("Error Not here:2");
  for (var i = 1; i <=co_num; i++ ) {
    str+='<th>CT</th>'
    header+="CT"+",";
    str+='<th>TA</th>'
    header+="TA"+",";
    str+='<th>ESE</th>'
    header+="ESE"+",";
    str+='<th>'+co_level[i-1]+'%</th>'
    header+=co_level[i-1]+"%,";
  }
  header+="\n";
  console.log("Error Not here:3");
  str+='<tr>'
      str+='<th>Roll Number</th>'
      header+="Roll Number"+",";
      str+='<th>Student Name</th>'
      header+="Student Name"+",";
      str+='<th>CT</th>'
      header+="CT"+",";
      str+='<th>TA</th>'
      header+="TA"+",";
      str+='<th>ESE</th>'
      header+="ESE"+",";

      for (var i = 1; i <=co_num; i++ ) {
        str+='<th>'+roundTo(co_mark1[i]/co_mark1[0],2)+'</th>'
        header+=roundTo(co_mark1[i]/co_mark1[0],2)+",";
        str+='<th>'+roundTo(co_mark2[i]/co_mark2[0],2)+'</th>'
        header+=roundTo(co_mark2[i]/co_mark2[0],2)+",";
        str+='<th>'+roundTo(co_mark3[i]/co_mark3[0],2)+'</th>'
        header+=roundTo(co_mark3[i]/co_mark3[0],2)+",";
        var added=(co_mark1[i]-0)+(co_mark2[i]-0)+(co_mark3[i]-0);
        console.log(added);
        str+='<th>'+added+'</th>'

        header+=added+",";
      }
      header+="\n"
  str+='</tr>'
  console.log("Error Not here:4");
  fs.appendFileSync('Download/Download'+num+'.csv',header);

  for (var i = 0; i < (Number(count_table)+3); i++ ) {
    str += '<tr>';
      if(i<count_table){


        if(typeof data[i]['Enrollment No'] =='undefined' || typeof data[i]['Name of Student'] =='undefined'|| typeof data[i]['CT'] =='undefined'|| typeof data[i]['TA'] =='undefined'|| typeof data[i]['ESE'] =='undefined')
        {
          var response_error='<h3><center>Oops! Incorrect Format of file!!<br>Please refer the sample file on home page<br>Check the coloumn names</center></h3>';
          return new hbs.SafeString (response_error);
        }

        str += '<td>' + '<input type="text"   id="RollNo'+i+'" name="RollNo'+i+'" value="'+data[i]['Enrollment No']+'" required>' + '</td>' ;
        data[i]['Enrollment No'] = data[i]['Enrollment No'].trim();
        var data_main= data[i]['Enrollment No']+",";

        str += '<td>' + '<input type="text"   id="Name'+i+'" size="40" name="student_name'+i+'" value="'+data[i]['Name of Student']+'" required>' + '</td>' ;
        data[i]['Name of Student'] = data[i]['Name of Student'].trim();
        data_main+= data[i]['Name of Student']+",";

        str += '<td>' + '<input type="number"  min=0 max=100 id="CT'+i+'" name="CT'+i+'" value="'+data[i]['CT']+'" required>' + '</td>';
        data_main+= data[i]['CT']+",";

        str += '<td>' + '<input type="number"  min=0 max=100 id="TA'+i+'" name="TA'+i+'"  value="'+data[i]['TA']+'" required>' + '</td>';
        data_main+= data[i]['TA']+",";

        str += '<td>' + '<input type="number"  min=0 max=100 id="ESE'+i+'" name="ESE'+i+'" value="'+data[i]['ESE']+'" required>' + '</td>';
        data_main+= data[i]['ESE']+",";
      }
      else if(count_table==Number(i)){
        console.log(Number(i));
        str += '<td colspan ="5" >Number of students above threshold</td>' ;
        data_main= ', Number of students above threshold , ,,,';
      }
      else if((Number(i)==(Number(count_table)+1))){
        console.log(Number(i));
        str += '<td colspan ="5" >Rounded Threshold</td>' ;
        data_main= ', Rounded Threshold , ,,,';
      }
      else{
        console.log(i);
        str += '<td colspan ="5" >Attainment:</td>' ;
        data_main= ', Attainment: , ,,,';
      }
      for (var j = 1; j <=co_num; j++ ) {
        if(i<count_table){

            str += '<td>' + '<input type="number"  min=0 max=100 id="CO'+j+'CT'+i+'" name="CO'+j+'CT'+i+'" value="'+(data[i]['CT']-0)*(roundTo(co_mark1[j]/co_mark1[0],2))+'"  disabled>' + '</td>';
            data_main+=roundTo((data[i]['CT']-0)*(roundTo(co_mark1[j]/co_mark1[0],2)),2)+",";

            str += '<td>' + '<input type="number"  min=0 max=100 id="CO'+j+'TA'+i+'" name="CO'+j+'TA'+i+'" value="'+(data[i]['TA']-0)*(roundTo(co_mark2[j]/co_mark2[0],2))+'" disabled>' + '</td>';
            data_main+=roundTo((data[i]['TA']-0)*(roundTo(co_mark2[j]/co_mark2[0],2)),2)+",";

            str += '<td>' + '<input type="number"  min=0 max=100 id="CO'+j+'ESE'+i+'" name="CO'+j+'ESE'+i+'" value="'+roundTo((data[i]['ESE']-0)*(co_mark3[j]/co_mark3[0]),2)+'" disabled>' + '</td>';
            data_main+=roundTo((data[i]['ESE']-0)*(co_mark3[j]/co_mark3[0]),2)+",";

            var Answer = roundTo((data[i]['CT']-0)*(roundTo(co_mark1[j]/co_mark1[0],2))+(data[i]['TA']-0)*(roundTo(co_mark2[j]/co_mark2[0],2))+roundTo((data[i]['ESE']-0)*(co_mark3[j]/co_mark3[0]),2),2);
            str += '<td>' + '<input type="number"  min=0 max=100 id="CO'+j+'ESE'+i+'" name="CO'+j+'ESE'+i+'" value="'+Answer +'" disabled>' + '</td>';
            console.log("Answer:"+Answer+"-------threshold:"+threshold[j-1]);
            if(Answer>=threshold[j-1]){
              final_data[j-1]++;
            }
            data_main+= Answer+",";
          }
        else if(count_table==i){
          str+='<td></td>';
          str+='<td></td>';
          str+='<td></td>';
          str+='<td>'+final_data[j-1]+'</td>';
          data_main+=",,,"+final_data[j-1]+",";
        }
        else if ((Number(i)==(Number(count_table)+1))){
          str+='<td></td>';
          str+='<td></td>';
          str+='<td></td>';
          str+='<td>'+threshold[j-1]+'</td>';
          data_main+=",,,"+threshold[j-1]+",";
        }
        else{
          str+='<td></td>';
          str+='<td></td>';
          str+='<td></td>';
          str+='<td>'+final_data[j-1]/count_table+'</td>';
          data_main+=",,,"+(final_data[j-1]/count_table)*100+",";
        }
      }
      //console.log(threshold);
      //console.log(final_data);
      //console.log(data_main);
      data_main+="\n";
      console.log("NUM :"+num);
      fs.appendFileSync('Download/Download'+num+'.csv',data_main);
      str += '</tr>';
    }
      str += '</table>';
    if(co_num>0){
      console.log('Download/Download'+num+'.csv');
      str+='<input type="text" value="'+num+'" name="file_name" style="display:none;">'
      str+=`<div class="btn_box"><input type="submit" class="submit_btn" value="Download CSV File" onclick = "javascript:form.action='/down';"></div>`;
      }
  console.log("Error Not here:5");
  return new hbs.SafeString (str);
});



hbs.registerHelper('tablePractical', function(count_table,co_num,file_name,co_level,co_mark1,co_mark2,file_path) {
  console.log("Count TABLE:"+count_table);
  console.log("CO-NUM TABLE:"+co_num);
  console.log("File Name TABLE:"+file_name);

  try{
  console.log("Co-level TABLE:"+file_path["data"]["root"]["co_level"]);
  console.log("CO-mark1 TABLE:"+file_path["data"]["root"]["co_mark1"]);
  console.log("CO-mark2 TABLE:"+file_path["data"]["root"]["co_mark2"]);
  console.log("file_path TABLE:"+file_path["data"]["root"]["file_path"]);
  co_level=file_path["data"]["root"]["co_level"];
  co_mark1=file_path["data"]["root"]["co_mark1"];
  co_mark2=file_path["data"]["root"]["co_mark2"];
  file_path=file_path["data"]["root"]["file_path"];
  }
  catch(e){
    console.log(e);
  }
  var final_data = [];
  for(var i=0;i<co_num;i++){
    final_data.push(0);
  }
  var threshold=[];

  //console.log(data[0]['Name of Student']);
  var options = {
    min:  0
  , max:  1000
  , integer: true
  }
  var num = rn(options);

  console.log("CO-NUM:"+co_num);
  console.log("NUm:"+num);
  console.log("Error Not here:1");
  console.log("File-path:%j",file_path);

  const workbook = XLSX.readFile(file_path);
  const sheet_name_list = workbook.SheetNames;
  var data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

    var str = '<table border = "1" cellpadding = "2" cellspacing = "1">';
    str+='<tr>'
        str+='<th colspan ="4" rowspan="2">Students</th>'
        var header = ","+"Student"+","+",";
        console.log("COUNT-TABLE:"+count_table);
        console.log(co_mark1);
        console.log(co_mark2);
        for (var i = 1; i <=co_num; i++ ) {
            str+='<th colspan="2">CO'+i+'</th>'
            header+= ",,"+"CO"+i+",";
            var added=(co_mark1[i]-0)+(co_mark2[i]-0);
            str+='<th>'+roundTo((added*(co_level[i-1]/100)),2)+'</th>'
            threshold.push(roundTo((added*(co_level[i-1]/100)),2)-0.1);
            header+=roundTo((added*(co_level[i-1]/100)),2);
        }
        header+="\n"
        header += ","+","+","+",";
      str+='</tr>'
    str+='<tr>'
    console.log("Error Not here:2");
    for (var i = 1; i <=co_num; i++ ) {
      str+='<th>TW</th>'
      header+="TW"+",";
      str+='<th>Practical</th>'
      header+="Practical"+",";
      str+='<th>'+co_level[i-1]+'%</th>'
      header+=co_level[i-1]+"%,";
    }
    header+="\n";
    console.log("Error Not here:3");
    str+='<tr>'
        str+='<th>Roll Number</th>'
        header+="Roll Number"+",";
        str+='<th>Student Name</th>'
        header+="Student Name"+",";
        str+='<th>CT</th>'
        header+="TW"+",";
        str+='<th>Practical</th>'
        header+="Practical"+",";

        for (var i = 1; i <=co_num; i++ ) {
          str+='<th>'+roundTo(co_mark1[i]/co_mark1[0],2)+'</th>'
          header+=roundTo(co_mark1[i]/co_mark1[0],2)+",";
          str+='<th>'+roundTo(co_mark2[i]/co_mark2[0],2)+'</th>'
          header+=roundTo(co_mark2[i]/co_mark2[0],2)+",";
          var added=(co_mark1[i]-0)+(co_mark2[i]-0);
          console.log(added);
          str+='<th>'+added+'</th>'

          header+=added+",";
        }
        header+="\n"
    str+='</tr>'
    console.log("Error Not here:4");
    fs.appendFileSync('Download/Download'+num+'.csv',header);

    for (var i = 0; i < (Number(count_table)+3); i++ ) {
      str += '<tr>';
        if(i<count_table){
          if(typeof data[i]['Enrollment No'] =='undefined' || typeof data[i]['Name of Student'] =='undefined'|| typeof data[i]['TW'] =='undefined'|| typeof data[i]['Practical'] =='undefined'){
            var response_error='<h3><center>Oops! Incorrect Format of file!!<br>Please refer the sample file on home page<br>Check the coloumn names</center></h3>';
            return new hbs.SafeString (response_error);
          }
          str += '<td>' + '<input type="text"   id="RollNo'+i+'" name="RollNo'+i+'" value="'+data[i]['Enrollment No']+'" required>' + '</td>' ;
          data[i]['Enrollment No'] = data[i]['Enrollment No'].trim();
          var data_main= data[i]['Enrollment No']+",";

          str += '<td>' + '<input type="text"   id="Name'+i+'" size="40" name="student_name'+i+'" value="'+data[i]['Name of Student']+'" required>' + '</td>' ;
          data[i]['Name of Student'] = data[i]['Name of Student'].trim();
          data_main+= data[i]['Name of Student']+",";

          str += '<td>' + '<input type="number"  min=0 max=100 id="TW'+i+'" name="TW'+i+'" value="'+data[i]['TW']+'" required>' + '</td>';
          data_main+= data[i]['TW']+",";

          str += '<td>' + '<input type="number"  min=0 max=100 id="ESE'+i+'" name="ESE'+i+'"  value="'+data[i]['Practical']+'" required>' + '</td>';
          data_main+= data[i]['Practical']+",";

          // str += '<td>' + '<input type="number"  min=0 max=100 id="ESE'+i+'" name="ESE'+i+'" value="'+data[i]['ESE']+'" required>' + '</td>';
          // data_main+= data[i]['ESE']+",";
        }
        else if(count_table==Number(i)){
          console.log(Number(i));
          str += '<td colspan ="4" >Number of students above threshold</td>' ;
          data_main= ', Number of students above threshold , ,,,';
        }
        else if((Number(i)==(Number(count_table)+1))){
          console.log(Number(i));
          str += '<td colspan ="4" >Rounded Threshold</td>' ;
          data_main= ', Rounded Threshold , ,,,';
        }
        else{
          console.log(i);
          str += '<td colspan ="4" >Attainment:</td>' ;
          data_main= ', Attainment: , ,,,';
        }
        for (var j = 1; j <=co_num; j++ ) {
          if(i<count_table){
              str += '<td>' + '<input type="number"  min=0 max=100 id="CO'+j+'TW'+i+'" name="CO'+j+'TW'+i+'" value="'+(data[i]['TW']-0)*(roundTo(co_mark1[j]/co_mark1[0],2))+'"  disabled>' + '</td>';
              data_main+=roundTo((data[i]['TW']-0)*(roundTo(co_mark1[j]/co_mark1[0],2)),2)+",";

              str += '<td>' + '<input type="number"  min=0 max=100 id="CO'+j+'Practical'+i+'" name="CO'+j+'Practical'+i+'" value="'+(data[i]['Practical']-0)*(roundTo(co_mark2[j]/co_mark2[0],2))+'" disabled>' + '</td>';
              data_main+=roundTo((data[i]['Practical']-0)*(roundTo(co_mark2[j]/co_mark2[0],2)),2)+",";

              var Answer = roundTo((data[i]['TW']-0)*(roundTo(co_mark1[j]/co_mark1[0],2))+(data[i]['Practical']-0)*(roundTo(co_mark2[j]/co_mark2[0],2)),2);
              str += '<td>' + '<input type="number"  min=0 max=100 id="CO'+j+'Answer'+i+'" name="CO'+j+'Answer'+i+'" value="'+Answer +'" disabled>' + '</td>';
              console.log("Answer:"+Answer+"-------threshold:"+threshold[j-1]);
              if(Answer>=threshold[j-1]){
                final_data[j-1]++;
              }
              data_main+= Answer+",";
            }
          else if(count_table==i){
            str+='<td></td>';
            str+='<td></td>';
            str+='<td>'+final_data[j-1]+'</td>';
            data_main+=",,"+final_data[j-1]+",";
          }
          else if ((Number(i)==(Number(count_table)+1))){
            str+='<td></td>';
            str+='<td></td>';
            str+='<td>'+threshold[j-1]+'</td>';
            data_main+=",,"+threshold[j-1]+",";
          }
          else{
            str+='<td></td>';
            str+='<td></td>';
            str+='<td>'+final_data[j-1]/count_table+'</td>';
            data_main+=",,"+(final_data[j-1]/count_table)*100+",";
          }
        }
        //console.log(threshold);
        //console.log(final_data);
        //console.log(data_main);
        data_main+="\n";
        console.log("NUM :"+num);
        fs.appendFileSync('Download/Download'+num+'.csv',data_main);
        str += '</tr>';
      }
        str += '</table>';
      if(co_num>0){
        console.log('Download/Download'+num+'.csv');
        str+='<input type="text" value="'+num+'" name="file_name" style="display:none;">'
        str+=`<div class="btn_box"><input type="submit" class="submit_btn" value="Download CSV File" onclick = "javascript:form.action='/down';"></div>`;
        }
  console.log("Error Not here:5");
  return new hbs.SafeString (str);
});


hbs.registerHelper('COUNTER_TABLE', function(co_num) {
  var str = '<table border = "1" cellpadding = "2" cellspacing = "1">';
      str+='<tr>'
        str+='<th colspan ="2" rowspan="1">Enter The Reference Levels</th>'
      str+='<tr>'
      for (var i = 1; i <=co_num; i++ ) {
        str+='<tr>'
          str+='<th>Enter the reference level of  CO'+i+'</th>';
          str+='<td>' + '<input type="number"  min=0 max=100 id="co_level" name="co_level[]" required>' + '</td>';
        str+='</tr>'
      }
      str += '</table>';
      str+='<table border = "1" cellpadding = "2" cellspacing = "1">';
        str+='<tr>'
          str+='<th colspan="'+(co_num+1)+'">Assesment Table CT</th>'
        str+='</tr>'
        str+='<tr>'
          str+='<td>CT</td>'
          for (var i = 1; i <=co_num; i++ ) {
            str+='<td>CO'+i+'</td>'
          }
        str+='</tr>'
        str+='<tr>'
          for (var i = 0; i <=co_num; i++ ) {
            str+='<td><input type="number" min=0 max=100 id="" name="co_mark1[]" required></td>'
          }
        str+='</tr>'
      str+='</table>';


      str+='<table border = "1" cellpadding = "2" cellspacing = "1">';
        str+='<tr>'
          str+='<th colspan="'+(co_num+1)+'">Assesment Table TA</th>'
        str+='</tr>'
        str+='<tr>'
          str+='<td>TA</td>'
          for (var i = 1; i <=co_num; i++ ) {
            str+='<td>CO'+i+'</td>'
          }
        str+='</tr>'
        str+='<tr>'
          for (var i = 0; i <=co_num; i++ ) {
            str+='<td><input type="number" min=0 max=100 id="" name="co_mark2[]" required></td>'
          }
        str+='</tr>'
      str+='</table>';

      str+='<table border = "1" cellpadding = "2" cellspacing = "1">';
        str+='<tr>'
          str+='<th colspan="'+(co_num+1)+'">Assesment Table ESE</th>'
        str+='</tr>'
        str+='<tr>'
          str+='<td>ESE</td>'
          for (var i = 1; i <=co_num; i++ ) {
            str+='<td>CO'+i+'</td>'
          }
        str+='</tr>'
        str+='<tr>'
          for (var i = 0; i <=co_num; i++ ) {
            str+='<td><input type="number" min=0 max=100 id="" name="co_mark3[]" required></td>'
          }
        str+='</tr>'

      str+='</table>';

  return new hbs.SafeString (str);
});


hbs.registerHelper('COUNTER_TABLE_Practical', function(co_num) {
  var str = '<table border = "1" cellpadding = "2" cellspacing = "1">';
      str+='<tr>'
        str+='<th colspan ="2" rowspan="1">Enter The Reference Levels</th>'
      str+='<tr>'
      for (var i = 1; i <=co_num; i++ ) {
        str+='<tr>'
          str+='<th>Enter the reference level of  CO'+i+'</th>';
          str+='<td>' + '<input type="number"  min=0 max=100 id="co_level" name="co_level[]" required>' + '</td>';
        str+='</tr>'
      }
      str += '</table>';
      str+='<table border = "1" cellpadding = "2" cellspacing = "1">';
        str+='<tr>'
          str+='<th colspan="'+(co_num+1)+'">Assesment Table TW</th>'
        str+='</tr>'
        str+='<tr>'
          str+='<td>TW</td>'
          for (var i = 1; i <=co_num; i++ ) {
            str+='<td>CO'+i+'</td>'
          }
        str+='</tr>'
        str+='<tr>'
          for (var i = 0; i <=co_num; i++ ) {
            str+='<td><input type="number" min=0 max=100 id="" name="co_mark1[]" required></td>'
          }
        str+='</tr>'
      str+='</table>';


      str+='<table border = "1" cellpadding = "2" cellspacing = "1">';
        str+='<tr>'
          str+='<th colspan="'+(co_num+1)+'">Assesment Table ESE</th>'
        str+='</tr>'
        str+='<tr>'
          str+='<td>ESE</td>'
          for (var i = 1; i <=co_num; i++ ) {
            str+='<td>CO'+i+'</td>'
          }
        str+='</tr>'
        str+='<tr>'
          for (var i = 0; i <=co_num; i++ ) {
            str+='<td><input type="number" min=0 max=100 id="" name="co_mark2[]" required></td>'
          }
        str+='</tr>'
      str+='</table>';

  return new hbs.SafeString (str);
});


app.get('/',function(req,res){

  res.render('practical_page.hbs',{
    count_table:0,
    co_num:0
  });
})

app.get('/PracticalHome',function(req,res){

  res.render('PracticalMain.hbs',{
    count_table:0,
    co_num:0
  });
})


app.post('/input',function(req,res){
  console.log("HERE!");
  console.log("CO-NUM:"+req.body.co_num);
  res.cookie('co_num',req.body.co_num);
  console.log("CO-NUM:"+req.body.co_num);
  res.cookie('count_table',req.body.count);
  res.cookie('course_code',req.body.course_code);
  res.cookie('course_name',req.course_name);
  res.cookie('co_num',req.body.co_num);
  res.render('input_page.hbs',{
    co_num:req.body.co_num
  });
})

app.post('/inputPractical',function(req,res){
  console.log("HERE!");
  console.log("CO-NUM:"+req.body.co_num);
  res.cookie('co_num',req.body.co_num);
  console.log("CO-NUM:"+req.body.co_num);
  res.cookie('count_table',req.body.count);
  res.cookie('course_code',req.body.course_code);
  res.cookie('course_name',req.course_name);
  res.cookie('co_num',req.body.co_num);
  res.render('input_pagePractical.hbs',{
    co_num:req.body.co_num
  });
})


app.post('/practical',function(req,res){

  console.log("CO-level COOOKIE :"+req.cookies["co_level"]);
  console.log("COUNT-TABLE COOKIE:"+req.cookies["count_table"]);
  res.render('practical_page.hbs',{
    count_table:req.cookies["count_table"],
    file_name: 'f1',
    co_level:req.cookies["co_level"],
    co_mark1:req.cookies["co_mark1"],
    co_mark2:req.cookies["co_mark2"],
    co_mark3:req.cookies["co_mark3"],
    file_path:req.cookies["file_path"]
  });
  //  res.send(req.cookies["count_table"]);
})


app.post('/practicalPractical',function(req,res){

  console.log("CO-level COOOKIE :"+req.cookies["co_level"]);
  console.log("COUNT-TABLE COOKIE:"+req.cookies["count_table"]);
  res.render('PracticalMain.hbs',{
    count_table:req.cookies["count_table"],
    file_name: 'f1',
    co_level:req.cookies["co_level"],
    co_mark1:req.cookies["co_mark1"],
    co_mark2:req.cookies["co_mark2"],
    file_path:req.cookies["file_path"]
  });
})


app.post('/down',function(req,res){
  console.log("DOwnload Link:"+"Download/Download"+req.body.file_name+".csv");
  res.download("Download/Download"+req.body.file_name+".csv");
})

app.post('/result',function(req,res){
  console.log("Cookie Check - result :: %j",req.cookies );
  console.log("COUNT-TABLE - result:"+req.cookies["count_table"]);
  res.render('result.hbs',{
    count_table:req.cookies["count_table"],
    co_num:req.cookies["co_num"],
    file_name: 'f1',
    co_level:req.cookies["co_level"],
    co_mark1:req.cookies["co_mark1"],
    co_mark2:req.cookies["co_mark2"],
    co_mark3:req.cookies["co_mark3"],
    file_path:req.cookies["file_path"]
  });
})


app.post('/resultPractical',function(req,res){
  console.log("Cookie Check - result :: %j",req.cookies );
  console.log("COUNT-TABLE - result:"+req.cookies["count_table"]);
  res.render('resultPractical.hbs',{
    count_table:req.cookies["count_table"],
    co_num:req.cookies["co_num"],
    file_name: 'f1',
    co_level:req.cookies["co_level"],
    co_mark1:req.cookies["co_mark1"],
    co_mark2:req.cookies["co_mark2"],
    file_path:req.cookies["file_path"]
  });
})

app.post('/Download',function(req,res){
  console.log("COUNT-TABLE:"+req.cookies["count_table"]);
  res.render('practical_page.hbs',{
    count_table:req.cookies["count_table"],
    co_num:req.cookies["co_num"],
    file_name: 'f1',
    co_level:req.cookies["co_level"],
    co_mark1:req.cookies["co_mark1"],
    co_mark2:req.cookies["co_mark2"],
    co_mark3:req.cookies["co_mark3"],
    file_path:req.cookies["file_path"]
  });

})

app.post('/DownloadPractical',function(req,res){
  console.log("COUNT-TABLE:"+req.cookies["count_table"]);
  res.render('PracticalMain.hbs',{
    count_table:req.cookies["count_table"],
    co_num:req.cookies["co_num"],
    file_name: 'f1',
    co_level:req.cookies["co_level"],
    co_mark1:req.cookies["co_mark1"],
    co_mark2:req.cookies["co_mark2"],
    co_mark3:req.cookies["co_mark3"],
    file_path:req.cookies["file_path"]
  });

})


app.post('/upload',function(req,res){
  console.log(req.cookies);
  console.log("REQ--BODY::%j",req.body);
  console.log(req.body.co_level);
  console.log(req.body.co_mark1);
  console.log(req.body.co_mark2);
  console.log(req.body.co_mark3);
  res.cookie("co_level",req.body.co_level);
  res.cookie("co_mark1",req.body.co_mark1);
  res.cookie("co_mark2",req.body.co_mark2);
  res.cookie("co_mark3",req.body.co_mark3);
  res.render('upload.hbs');
})

app.post('/uploadPractical',function(req,res){
  console.log(req.cookies);
  console.log("REQ--BODY::%j",req.body);
  console.log(req.body.co_level);
  console.log(req.body.co_mark1);
  console.log(req.body.co_mark2);
  res.cookie("co_level",req.body.co_level);
  res.cookie("co_mark1",req.body.co_mark1);
  res.cookie("co_mark2",req.body.co_mark2);
  res.render('uploadPractical.hbs');
})


app.post('/preresult', function(req, res) {

  upload(req, res, function(err)  {

         if (err) {
           console.log(err);
             return res.end("Something went wrong!");
         }
         console.log("COOOKIE :"+req.cookies["co_level"]);
         console.log("COUNT-TABLE:"+req.cookies["count_table"]);

         file_add=req.files[0].path;
         console.log("FILE -PATH preresult::"+req.files[0].path);
         res.cookie("file_path",req.files[0].path);
         console.log("File_path COOKIE:"+req.cookies["file_path"]);
         console.log("COOKIE BODY::%j",req.cookies);

         res.render('practical_page.hbs',{
           count_table:req.cookies["count_table"],
           file_name: 'f1',
           co_level:req.cookies["co_level"],
           co_mark1:req.cookies["co_mark1"],
           co_mark2:req.cookies["co_mark2"],
           co_mark3:req.cookies["co_mark3"],
           file_path:req.files[0].path
         });
     });
})

app.post('/preresultPractical', function(req, res) {

  upload(req, res, function(err)  {

         if (err) {
           console.log(err);
             return res.end("Something went wrong!");
         }
         console.log("COOOKIE :"+req.cookies["co_level"]);
         console.log("COUNT-TABLE:"+req.cookies["count_table"]);

        file_add=req.files[0].path;
         console.log("FILE -PATH preresult::"+req.files[0].path);
         res.cookie("file_path",req.files[0].path);
         console.log("File_path COOKIE:"+req.cookies["file_path"]);
         console.log("COOKIE BODY::%j",req.cookies);

         res.render('PracticalMain.hbs',{
           count_table:req.cookies["count_table"],
           file_name: 'f1',
           co_level:req.cookies["co_level"],
           co_mark1:req.cookies["co_mark1"],
           co_mark2:req.cookies["co_mark2"],
           file_path:req.files[0].path
         });
     });
})


app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    console.log("User Tried to access:"+req.url);
    url: req.url
    res.render('Error.hbs');
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});


app.listen(port,()=>{
  console.log(`Server running on ${port}! `);
});
