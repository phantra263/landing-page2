/*
 *
 * ログイン画面のロジック
 *
 */
$(document).ready(function() {

    document.addEventListener('deviceready',function(){
      
    },false);

});
function createCategory(){
    var Name = $("#input-event").val();
    var SalesDateFrom = $("#input-event-date-from").val();
    var SalesDateTo = $("#input-event-date-to").val();
	
	if(!Name || Name == ""){
		navigator.notification.alert(
			'必須入力です。',
			function() {
				return false;
			},
			'警告',
			'OK'
		);
		var element = document.getElementById("input-event");
   		element.classList.add("btn-required");	
	}
	else if(Name !== "" && Name.length > 100){
		navigator.notification.alert(
			'100文字を超える入力は出来ません。',
			function() {
				return false;
			},
			'警告',
			'OK'
		);
		var element = document.getElementById("input-event");
   		element.classList.add("btn-required");
	}
	else if(!SalesDateFrom ||  SalesDateFrom == ""){
		navigator.notification.alert(
			'必須入力です。',
			function() {
				return false;
			},
			'警告',
			'OK'
		);
		var element = document.getElementById("input-event-date-from");
   		element.classList.add("btn-required");	
	}else if(!SalesDateTo || SalesDateTo == ""){
		navigator.notification.alert(
			'必須入力です。',
			function() {
				return false;
			},
			'警告',
			'OK'
		);
		var element = document.getElementById("input-event-date-to");
   		element.classList.add("btn-required");	
	}
	else if(SalesDateFrom !== "" && SalesDateTo !== "" && new Date(SalesDateFrom) > new Date(SalesDateTo)){
		navigator.notification.alert(
			'販売開始日は販売終了日以前にしてください。',
			function() {
				return false;
			},
			'警告',
			'OK'
		);
		var element = document.getElementById("input-event-date-to");
   		element.classList.add("btn-required");
	}else if(SalesDateFrom !== "" && !Date.parse(SalesDateFrom)){
		navigator.notification.alert(
			'日付が無効です。',
			function() {
				return false;
			},
			'警告',
			'OK'
		);
		var element = document.getElementById("input-event-date-from");
   		element.classList.add("btn-required");
	}
	else if(SalesDateTo !== "" && !Date.parse(SalesDateTo)){
		navigator.notification.alert(
			'日付が無効です。',
			function() {
				return false;
			},
			'警告',
			'OK'
		);
		var element = document.getElementById("input-event-date-to");
   		element.classList.add("btn-required");
	}
	else if(SalesDateTo !== "" && new Date(SalesDateTo) <= new Date()){
		navigator.notification.alert(
			'販売終了日は本日以前にしてください。',
			function() {
				return false;
			},
			'警告',
			'OK'
		);
		var element = document.getElementById("input-event-date-to");
   		element.classList.add("btn-required");
	}
	else{
		var settings = {
			"url": `${urlPictureOrder}api/addPhotoAlbum`,
			"method": "POST",
			"timeout": 3000,
			"headers": {
			  "Content-Type": "application/json"
			},
			"data": JSON.stringify({
			  "employeeId": "1",
			  "requestId": "1",
			  "data": {
				"BranchId": window.sessionStorage.getItem('BranchId'),
				"Name": Name,
				"SalesDateFrom": new Date(SalesDateFrom).toISOString().substring(0, 10),
				"SalesDateTo": new Date(SalesDateTo).toISOString().substring(0, 10)
			  }
			}),
		  };
		$(".loader-wrap").css("display","");
		$.ajax(settings).done(function (response) {
			$(".loader-wrap").css("display","none");
			window.sessionStorage.setItem('OpenEvent', 'null');
			location.href ="./list_event_upload.html";	
		}).fail(function (error) {
			$(".loader-wrap").css("display","none");
		});
	}
}
function change_location(adr) {
	  window.location.href = adr;
}