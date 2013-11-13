/*
 * index.js is the main javascript file for rendering the user interface. The basic flow is a websocket flow which works like this:
 * Page is loaded by default based on suer roles - which is checked  by the server.
 * On clicking the submituser button, JSON data is sent to the server. Server does some processing and returns the same JSON object
 * but with additional flags. 
 * Based on these flags different templates are rendered using _ templating engine.
 * So if the flag indicates that the user is a creator - the creator template is rendered. So on.
 */



$ (function() {
  "use strict";
  //Set filepicker permissions and api keys
  filepicker.setKey("AeH7rlXNxQYSSpE4yRdQwz");
  var id;
  var url = "ws://localhost:8888/websocket";
  var hiringRequest = {};
  var template_admin = _.template($('#admin_template').html());
  var template_creator = _.template($('#creator_template').html());
  var template_pending = _.template($('#creator_pending_template').html());
  var approver_pending = _.template($('#approver_template').html());
  var user;
  var creatorFlag;
  $(function() {
    $("#userName").focus();
  });

  // grab all templates to begin with:
  $("#userPassword").keypress(function(event){if(event.keyCode==13){$('#submitUser').trigger("click");}});
  var ws = new WebSocket(url);
  ws.onopen = function() {
    $("#submitUser").keypress(handleReturnKey);
    $("#submitUser").click(handleReturnKey);

  };

  function handleReturnKey (e) {
    e.preventDefault();
    var userDetails = {};
    user = $('#userName').val();
    userDetails.user = user;
    ws.send(JSON.stringify(userDetails));
  }

  function getRandomArbitrary() {
    return Math.floor((Math.random()*1000)+1);
  }
  $("#main").on( 'click', '.submitHiringRequest', function(e) {
    e.preventDefault();
    
    var projectDetails = {};
    projectDetails.project_number = $("#projectNumber").val();
    projectDetails.project_name = $("#projectTitle").val();
    var jobDetails = {};
    
    jobDetails.jobDescription = $("#jobDescription").val();
    jobDetails.jobStartDate = $("#start-date").val();
    jobDetails.jobEndDate = $("#end-date").val();
    jobDetails.jobPosition = $("#positionName").val();
    jobDetails.jobExperience = $("#experienceLevel").val();
    jobDetails.jobReportsTo = $("#reportsTo").val();
  
    var jobAd = {};
    jobAd.dateOfAd = $("#advertisingPlace").val();
    jobAd.placeOfAd = $("#advertisingDate").val();
    hiringRequest.user = 'pradeep';
    hiringRequest.project = projectDetails;
    
    hiringRequest.job_ad = jobAd;

    var emp_name = $('#employeeName').val();
    if (emp_name !== undefined) {
      hiringRequest.status = "employee_identified"
      var emp_details = {};
      emp_details.emp_name = emp_name;
      emp_details.salary = $('#employeeSalary').val();
      emp_details.employeeAddress = $('#employeeAddress').val();
      emp_details.duration= $('#duration').val();
      emp_details.placeOfBirth= $('#placeOfBirth').val();
      emp_details.citizenship= $('#citizenship').val();
      emp_details.contactNo= $('#contactNo').val();
      emp_details.dependents= $('#dependents').val();
      emp_details.institute1= $('#institute1').val();
      emp_details.institute2= $('#institute2').val();
      emp_details.institute3= $('#institute3').val();
      emp_details.major1= $('#major1').val();
      emp_details.major2= $('#major2').val();
      emp_details.major3= $('#major3').val();
      emp_details.degree1= $('#degree1').val();
      emp_details.degree2= $('#degree2').val();
      emp_details.degree3= $('#degree3').val();
      emp_details.date1= $('#date1').val();
      emp_details.date2= $('#date2').val();
      emp_details.date3= $('#date3').val();
      emp_details.language1= $('#language1').val();
      emp_details.language2= $('#language2').val();
      emp_details.language3= $('#language3').val();
      emp_details.proficiencySpeaking1= $('#proficiencySpeaking1').val(); 
      emp_details.proficiencySpeaking2= $('#proficiencySpeaking2').val();
      emp_details.proficiencySpeaking3= $('#proficiencySpeaking3').val();
      emp_details.proficiencyReading1= $('#proficiencyReading1').val();
      emp_details.proficiencyReading2= $('#proficiencyReading2').val();
      emp_details.proficiencyReading3= $('#proficiencyReading3').val();
      emp_details.positionTitle1= $('#positionTitle1').val();
      emp_details.positionTitle2= $('#positionTitle2').val();
      emp_details.positionTitle3= $('#positionTitle3').val();
      emp_details.employer1= $('#employer1').val();
      emp_details.employer2= $('#employer2').val();
      emp_details.employer3= $('#employer3').val();
      emp_details.from1= $('#from1').val();
      emp_details.from2= $('#from2').val();
      emp_details.from3= $('#from3').val();
      emp_details.to1= $('#to1').val();
      emp_details.to2= $('#to2').val();
      emp_details.to3= $('#to3').val();
      emp_details.salary1= $('#salary1').val();
      emp_details.salary2= $('#salary2').val();
      emp_details.salary3= $('#salary3').val();
      hiringRequest.empDetails = emp_details;
      jobDetails.jobId = id;
      hiringRequest.job = jobDetails;
      
    } else {
      id = getRandomArbitrary();
      jobDetails.jobId = id;
      hiringRequest.job = jobDetails;
      hiringRequest.status = "position_requested"
    }
    ws.send(JSON.stringify(hiringRequest));
  });

  /*
   * Check the onMessage function for the return JSON from the server. The JSON structure will be something like this
   * tempData: Object
    job: Object
      jobDescription: "asdfasdf"
      jobEndDate: "asdfasd"
      jobExperience: "0 - 1 Years"
      jobId: "1234"
      jobPosition: "CEO"
      jobReportsTo: "GM"
      jobStartDate: "adsf"
      
    __proto__: Object
    job_ad: Object
      dateOfAd: "asdfas"
      placeOfAd: "asdfasdf"
    __proto__: Object
    project: Object
      project_name: "asdfdf"
      project_number: "asdfasdf"
    __proto__: Object
    role: "creator"
    status: "Approved"
    text: "Approved"
    user: "pradeep"

  Based on the role and status - display different templates. If the role is that of a creator and the status is 'useridIdentified' display
  the empty creator template etc.
   */
  ws.onmessage = function (evt) {
    var tempData = JSON.parse(evt.data);
    var data = tempData.sendData;
    console.log(data);
    var templateToBeDisplayed;
    var $btn;
        var i = 0;
    // Check if the role is that of a creator
    if (tempData.role=== 'admin'){
      $('#main').html(template_admin);
      for(var m=0;m<data.length;m++){
        var tempStr = "<tr><td id='r"+ (m +1) +"1'><div contenteditable>"+data[m]['projectId']+
        "</div></td><td id='r"+ (m+1) +"2'><div contenteditable>"+data[m]['budget']+
        "</div></td><td id='r"+ (m+1) +"3'><div contenteditable>"+data[m]['odc']+
        "<td><button id='r"+(m+1)+"5' class='btn btn-info' rel='popover'>Details</button></td>"+
        "</div></td><td><button id='r"+ (m+1) +"4' class='btn btn-success'" +
        "style='display:none'><strong style='width:10px; height:10px;'>+</strong></td>"
     
        i=m+1;
        $("#dataTable").append(tempStr);
        $("#r" +(i)+ "5").popover( {trigger: "hover",placement:'bottom',  title: 'Project Details', content:'creator:'+data[m]['creator']});
      }
      var tempStr =   "<tr><td id='r"+ (i+1) +"1'><div   contenteditable></div></td><td id='r"+ 
        (i+1) +"2'><div contenteditable></div></td><td id='r"+ (i+1) +"3'><div contenteditable>"+
        "</div></td><td id='r"+ (i+1) + "5'><div></div></td>"+
        "<td><button id='r"+ (i+1) +"4' class='btn btn-success'>"+
        "<b>+</b></td></tr>";
      $("#dataTable").append(tempStr);
      $("#r" +(i+1)+ "4").click(insertData);
      $("#saveBudget").click(saveBudget);
    }else if (tempData.role === 'creator') {
        var clicked = function() {
          $.fallr.hide();
        }; 
        $('#main').html(template_pending);
        for(var n=0; n<data.length;n++){
          if (data[n].status === 'position_approved') {
            $btn = $('<td class="data_cell"><label for="row_1">Submit Employee details</label></td>');
            var row = '<tr class="data_odd">' + '<td class="data_cell">' + data[n].project.project_number + '</td>' +
            '<td class="data_cell">' + data[n].status + '</td>' +
            '<td class="data_cell">' + data[n].project.project_name + '</td>' +
            '<td class="data_cell">' + data[n].job.jobPosition + '</td>';
            $('table.qlabs_grid_container tbody').append(row);
            $btn.appendTo($('table.qlabs_grid_container tbody tr:last')).click(data[n], employeeButtonClick);
          } else if (data[n].status === "client_approved") {
            $btn = $('<td class="data_cell"><label for="row_1">Issue employment agreement</label></td>');
             var row = '<tr class="data_odd">' + '<td class="data_cell">' + data[n].project.project_number + '</td>' +
            '<td class="data_cell">' + data[n].status + '</td>' +
            '<td class="data_cell">' + data[n].project.project_name + '</td>' +
            '<td class="data_cell">' + data[n].job.jobPosition + '</td>';
            $('table.qlabs_grid_container tbody').append(row);
             $btn.appendTo($('table.qlabs_grid_container tbody tr:last')).click(data[n], employeeButtonClick);
           // $btn.click(function employeeButtonClick(data));
             } else {
            var row = '<tr class="data_odd">' + '<td class="data_cell">' + data[n].project.project_number + '</td>' +
            '<td class="data_cell">' + data[n].status + '</td>' +
            '<td class="data_cell">' + data[n].project.project_name + '</td>' +
            '<td class="data_cell">' + data[n].job.jobPosition + '</td>' +
            '<td class="data_cell">' + '<label for="row_1">Await approval</label>' +
            '</tr>'
            $('table.qlabs_grid_container tbody').append(row);
          }
        } 
        $("#newHiring").click(function(e){
          e.preventDefault();
          $('#main').html(template_creator);
        });

    } else if (tempData.role === 'approver') {
      var clicked = function() {
        $.fallr.hide();
      };
      $('#main').html(approver_pending);
      var tr = $('<tr class="data_odd">');
      var td = $('<td class="data-cell">');
      $('#myModal').hide();
      for (var i=0;i<data.length;++i) {
        var individualRecord = data[i];
        if (individualRecord.status === 'employee_identified') {
          $btn = $('<td class="data_cell"><label for="row_1"><a href="#myModal"'+
            ' data-toggle="modal">Obtain client approval</a></label></td>');
        } else if(individualRecord.status=== 'client_approval_sent'){
          $btn = $('<td class="data_cell"><label for="row_1">Click Once Client Approves</label></td>');
        } else{
          $btn = $('<td class="data_cell"><label for="row_1">Approve</label></td>');
        }
        var row = '<tr class="data_odd">' + '<td class="data_cell">' + data[i].project.project_number + '</td>' +
        '<td class="data_cell">' + data[i].user + '</td>' +
        '<td class="data_cell">' + data[i].status + '</td>' +
        '<td class="data_cell">' + data[i].project.project_name + '</td>' +
        '<td class="data_cell">' + data[i].job.jobPosition + '</td>';
        $('table.qlabs_grid_container tbody').append(row);
        $btn.appendTo($('table.qlabs_grid_container tbody tr:last')).click(individualRecord, approverButtonClick);
        //displayEmployeeDetails(individualRecord); 
      }
    }
  
    function employeeButtonClick(data) {
      data = data['data']
      if (data.status === "position_approved") {
        // Pre-fill the template with the previous values.
        $('#main').html(template_creator);

        $("#projectNumber").val(data.project.project_number);
        $("#projectTitle").val(data.project.project_name);

        $("#jobDescription").val(data.job.jobDescription);
        $("#start-date").val(data.job.jobStartDate);
        $("#end-date").val(data.job.jobEndDate);
        $("#positionName").val(data.job.jobPosition);
        $("#experienceLevel").val(data.job.jobExperience);
        $("#reportsTo").val(data.job.jobReportsTo);

        $("#advertisingPlace").val(data.job_ad.dateOfAd);
        $("#advertisingDate").val(data.job_ad.placeOfAd);
        //Apppend additional details to the creator template
        $('#advertisingDiv').append('<div id = "hiringDiv" class="box-no-border">');
        $('#hiringDiv').append('<h2>Employee details</h2>');
        $('#hiringDiv').append('<div class="cell-50-left-ar clear-both">Employee'+
          ' Name<input type="text" id = "employeeName"></div>');
        $('#hiringDiv').append('<div class="cell-50-left-ar clear-both">Employee Salary'+
          '<input type="text" id = "employeeSalary"></div>');
        $('#hiringDiv').append('<div class="cell-45-left-ar " style="margin-right:50px">'+
          'Employee Address<input type="text" id = "employeeAddress"></div>');
        $('#hiringDiv').append('<div class="cell-50-left-ar  clear-both" style="margin-right:50px">'+
          'Duration Of Contract<input type="text" id = "duration"></div>');
        $('#hiringDiv').append('<div class="cell-50-left-ar clear-both">Place Of Birth'+
          '<input type="text" id = "placeOfBirth"></div>');
        $('#hiringDiv').append('<div class="cell-50-left-ar ">Contact No.'+
          '<input type="text" id = "contactNo"></div>');
        $('#hiringDiv').append('<div class="cell-50-left-ar ">Citizenship'+
          '<input type="text" id = "citizenship"></div>');
        $('#hiringDiv').append('<div class="cell-50-left-ar clear-both">'+
          'Name, Ages and Relationship of dependents to accomany individual to country of assignment'+
          '<input type="text" id = "dependents"></div>');
        $('#hiringDiv').append('<div class="cell-50-left-ar clear-both"><h4>Education</h4></div>');
        //$('#hiringDic').append('</div><div class="container clear-both"');
        $('#hiringDiv').append('<div class="span12"><div class="span3">Name</br>'+
          '<input style="width:200px" type="text" id = "institute1"></br>'+
          '<input style="width:200px" type="text" id = "institute2"></br>'+
          '<input style="width:200px" type="text" id = "institute3"></div>'+
          '<div class="span2">Major</br><input style="width:120px" type="text" id = "major1">'+
          '</br><input style="width:120px" type="text" id = "major2"></br>'+
          '<input style="width:120px" type="text" id = "major3"></div>'+
          '<div class="span2">Degree</br><input style="width:120px" type="text" id = "degree1">'+
          '</br><input style="width:120px" type="text" id = "degree2"></br>'+
          '<input style="width:120px" type="text" id = "degree3"></div><div class="span2">'+
          'Date</br><input style="width:120px" type="text" id = "date1"></br>'+
          '<input style="width:120px" type="text" id = "date2"></br>'+
          '<input style="width:120px" type="text" id = "date3"></div></div>');
        $('#hiringDiv').append('<div class="cell-50-left-ar clear-both"><strong>'+
          'Language Proficiency</strong></div>');
        $('#hiringDiv').append('<div class="span12"><div class="span3">Language'+
          '<input type="text" id = "language1"></br><input type="text" id = "language2">'+
          '</br><input type="text" id = "language3"></div><div class="span3">'+
          'Proficiency Speaking<input type="text" id = "proficiencySpeaking1">'+
          '</br><input type="text" id = "proficiencySpeaking2"></br>'+
          '<input type="text" id = "proficiencySpeaking3"></div><div class="span3">'+
          'Proficiency Reading<input type="text" id = "proficiencyReading1"></br>'+
          '<input type="text" id = "proficiencyReading2"></br>'+
          '<input type="text" id = "proficiencyReading3"></div></div>');
        $('#hiringDiv').append('<div class="cell-50-left-ar clear-both"><h4><strong>'+
          'Employment History</strong></h4></div>');
        $('#hiringDiv').append('<div class="span12"><div class="span2"><strong>Position Title'+
          '</strong></br></br><input style="width:120px" type="text" id = "positionTitle1">'+
          '</br><input style="width:120px" type="text" id = "positionTitle2"></br>'+
          '<input style="width:120px" type="text" id = "positionTitle3"></div><div class="span(2)">'+
          '<strong>Name And Address Of Employer</strong></br></br>'+
          '<input type="text" style="width:120px" id = "employer1"></br>'+
          '<input style="width:120px" type="text" id = "employer2"></br>'+
          '<input style="width:120px" type="text" id = "employer3"></div>'+
          '<div class="span4"><strong>Dates Of Employment</strong></br>'+
          '<div class="span1">From</br><input style="width:70px" type="text" id = "from1">'+
          '</br><input style="width:70px" type="text" id = "from2"></br><'+
          'input style="width:70px" type="text" id = "from3"></div><div class="span1">To</br>'+
          '<input style="width:70px" type="text" id = "to1"></br>'+
          '<input style="width:70px" type="text" id = "to2"></br>'+
          '<input style="width:70px"type="text" id = "to3"></div></div>'+
          '<div class="span2"><strong>Annual Salary</strong></br></br>'+
          '<input style="width:90px" type="text" id = "salary1"></br>'+
          '<input style="width:90px" type="text" id = "salary2"></br>'+
          '<input style="width:90px" type="text" id = "salary3"></div></div>');
        $('#hiringDiv').last().append($('<div class="cell-50-left-ar" >Resume'+
          '<input type="filepicker" id = "fileId" name="fileName"></div>'));
        $('#hiringDiv').append('<div class="clear-both"></div> </div>');
      } else if(data.status === "client_approved"){
        console.log("Employee agreement to be issued");
        $("#creator_pending_template").append(displayEmployeeDetails(data));
      }
    }
    function displayEmployeeDetails(individualRecord) {
      var modal = '<div id="myModal" class="modal hide fade" tabindex="-1"'+
      ' style="width:800px;margin-left:-400px" role="dialog" aria-labelledby="myModalLabel"'+
      ' aria-hidden="true">' +
      '<div class="modal-header">' +
      '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>' +
      '<h3 id="myModalLabel">Employee Details</h3> </div>' +
      '<div class="modal-body"  style="width:750px;margin-left:5px" id="Print_Div">'+
      '<table class="table table-bordered">'+
      '<tr class="info"><td colspan="8"><strong>Name</strong> </br> '+
       individualRecord['empDetails']['emp_name']+'</td></tr>'+
      '<tr class="info"><td colspan="4"><strong>Employee Address</strong> </br> '+ 
      individualRecord['empDetails']['employeeAddress']+'<td colspan="2"><strong> Proposed Salary</strong></br>'+ 
      individualRecord['empDetails']['salary']+'</td><td colspan="2"><strong>Duration Of contract</strong></br>'+
      individualRecord['empDetails']['duration']+'</td></tr>'+
      '<tr class="info"><td colspan="2"><strong> Contact No.</strong></br>' + 
      individualRecord['empDetails']['contactNo']+'</td><td colspan="2"><strong>Place Of Birth</strong></br>'+
      individualRecord['empDetails']['placeOfBirth']+'</td><td colspan="4"><strong>Citizenship</strong></br>' + 
      individualRecord['empDetails']['citizenship']+'</td></tr>'+
      '<tr class="info"><td colspan="8"><strong> Name, Ages and Relationship of dependents to accomany individual to country of assignment</strong></br>'+ 
      individualRecord['empDetails']['dependents']+'</td><tr>'+
      '<tr class="success"><td colspan="5"><h5><strong> Education</strong></h5>'+
      '(include all college and universities)</td><td colspan="3"><strong><h5>'+
      'Language Proficiency</strong></h5></td></tr>'+
      '<tr class="success "><td colspan="2"><strong> Name And Location Of Institute</strong></br>'+ 
      individualRecord['empDetails']['institute1']+'</br>'+ individualRecord['empDetails']['institute2']+'</br>'+ 
      individualRecord['empDetails']['institute3']+'</td><td><strong>Major</strong></br></br>'+
      individualRecord['empDetails']['major1']+'</br>'+ individualRecord['empDetails']['major2']+'</br>'+ 
      individualRecord['empDetails']['major3']+'</td><td><strong>Degree</strong></br></br>' + 
      individualRecord['empDetails']['degree1']+'</br>'+ individualRecord['empDetails']['degree2']+'</br>'+ 
      individualRecord['empDetails']['degree3']+'</td><td><strong>Date</strong></br></br>'+ 
      individualRecord['empDetails']['date1']+'</br>'+ individualRecord['empDetails']['date2']+'</br>'+ 
      individualRecord['empDetails']['date3']+'</td><td><strong>Language</strong></br></br>'+ 
      individualRecord['empDetails']['language1']+'</br>' + individualRecord['empDetails']['language2']+'</br>' + 
      individualRecord['empDetails']['language3']+'</td><td><strong>Proficiency Speaking</strong></br>'+ 
      individualRecord['empDetails']['proficiencySpeaking1']+'</br>'+ 
      individualRecord['empDetails']['proficiencySpeaking2']+'</br>'+ 
      individualRecord['empDetails']['proficiencySpeaking3']+'</td><td><strong>Proficiency Reading</strong></br>'+ 
      individualRecord['empDetails']['proficiencyReading1']+'</br>'+ 
      individualRecord['empDetails']['proficiencyReading2']+'</br>'+ 
      individualRecord['empDetails']['proficiencyReading3']+'</td></tr>'+
      '<tr class="info"><td colspan="8"><h5><strong> Employment History</strong></h5></td><tr>'+
      '<tr class="info"><td colspan="2" rowspan="2">Position Title</br></br></br>' + 
      individualRecord['empDetails']['positionTitle1']+'</br>'+ individualRecord['empDetails']['positionTitle2']+'</br>'+ 
      individualRecord['empDetails']['jpositionTitle3']+'</td><td colspan="3" rowspan="2">'+
      'Name And Address Of Employer</br></br>' + individualRecord['empDetails']['employer1']+'</br>'+ 
      individualRecord['empDetails']['employer2']+'</br>'+ individualRecord['empDetails']['employer3']+
      '</td><td colspan="2">Dates Of Employment</td><td>Annual Salary</td></tr>'+
      '<tr class="info"><td>From</br>' + individualRecord['empDetails']['from1']+'</br>'+ 
      individualRecord['empDetails']['from2']+'</br>'+ individualRecord['empDetails']['from3']+'</td><td>To</br>' + 
      individualRecord['empDetails']['to1']+'</br>'+ individualRecord['empDetails']['to2']+'</br>'+ 
      individualRecord['empDetails']['to3']+'</td><td>Dollars</br>' + individualRecord['empDetails']['salary1']+'</br>'+ 
      individualRecord['empDetails']['salary2']+'</br>'+ individualRecord['empDetails']['salary3']+'</td></tr>'+
      '<tr class="success"><td colspan="8"><h5><strong>Certification</strong></h5></td><tr>'+
      '<tr class="success"><td colspan="5">Signature Of Employee</td><td colspan="3">Date</td></tr>'+     
      '</table> </div>' + 
      '<div class="modal-footer"> <button id = "close_client_approval" class="btn"'+
      ' data-dismiss="modal" aria-hidden="true">Close</button>' +
      '<button class="btn btn-primary" onClick=printEmployeeData($("#Print_Div"))>'+
      'Print</button> </div> </div>';
      return modal;
   }

  }

  function approverButtonClick(incomingData) {
    var objToBeSent = {};
    if (this.textContent==="Obtain client approval") {
        var modalToBeDisplayed = displayEmployeeDetails(incomingData);
        $('#approver_template_id').append(modalToBeDisplayed);
        incomingData.data.status = "client_approval_sent";
        incomingData.data.text = "Client Approval Sent";
        objToBeSent.approvedData = incomingData.data;
        objToBeSent.user = user;
        ws.send(JSON.stringify(objToBeSent));
        //this.innerHTML = '<td class="data_cell"><label for="row_1">Click Once Client Approves</label></td>'
    } else if (this.textContent === "Click Once Client Approves") {
      var objToBeSent = {};
      incomingData.data.status = "client_approved";
      incomingData.data.text = "Client Approved";
      objToBeSent.approvedData = incomingData.data;
      objToBeSent.user = user;
      ws.send(JSON.stringify(objToBeSent));
      this.innerHTML = '<td class="data_cell"><label for="row_1">Client Approved</label></td>'
      //$btn.appendTo($('table.qlabs_grid_container tbody tr:last'));
    } else {
      var objToBeSent = {};
      incomingData.data.status = "position_approved";
      incomingData.data.text = "Position Approved";
      objToBeSent.approvedData = incomingData.data;
      objToBeSent.user = user;
      ws.send(JSON.stringify(objToBeSent));
    }
  }

  function printEmployeeData(element){
    var data = element.html();
    var mywindow=window.open('','Print_Div', 'height=400, width=600');
    mywindow.document.write('<html><head><title>Employee Details</title>');
    mywindow.document.write('<link rel = "stylesheet" href = "static/css/bootstrap.css">'+
      ' </head><body><h1>Employee Details</h1>');
    mywindow.document.write(data);
    mywindow.document.write('</body></html>');
    mywindow.print();
    mywindow.close();
    return true;
  }

  function insertData(e){
    e.preventDefault();
    var buttonId = this.id;
    buttonId = parseInt(buttonId.substr(1,1));
    if (document.getElementById("r"+(buttonId)+"1").textContent==="" && 
      document.getElementById("r"+(buttonId)+"2").textContent==="" && 
      document.getElementById("r"+(buttonId)+"3").textContent===""){
    console.log("empty");
    } else{
      var tempStr =   "<tr><td id='r"+ (buttonId+1) + "1'><div  s contenteditable></div></td><td id='r"+ 
        (buttonId + 1) +"2'><div contenteditable></div></td><td id='r"+ (buttonId+1) +
        "3'><div contenteditable></div></td><td id='r"+ (buttonId+1) +"5'><div></div></td><td><button id='r"+ (buttonId +1) +
        "4' class='btn btn-success'><b>+</b></td></tr>";
      $("#dataTable").append(tempStr);
      $("#r" + (buttonId+1)+ "4").click(insertData);
      document.getElementById("r"+(buttonId)+"4").style.display= "none";
    }
  }

  function saveBudget(e){
    console.log("Budget Save Clicked");
    e.preventDefault();
    var budgetSet={};
    budgetSet['data']=[];
    var i=1;
    var m=1;
    budgetSet['user']= user;
    while(m===1){
      if(document.getElementById("r"+i+"1") === null || document.getElementById("r"+i+"1").textContent==="" ){
        m=0;
      }else{
        budgetSet['data'][i-1] = {};
        budgetSet['data'][i-1]['projectId'] = document.getElementById("r"+i+"1").textContent;
        budgetSet['data'][i-1]['budget'] = document.getElementById("r"+i+"2").textContent;
        budgetSet['data'][i-1]['odc'] = document.getElementById("r"+i+"3").textContent;
        budgetSet['data'][i-1]['creator'] = user;
        i++;
      }
    }
    console.log(budgetSet);
    ws.send(JSON.stringify(budgetSet));
  }
});

