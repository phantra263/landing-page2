/*
 *
 * 精算詳細画面
 *
 */
$(function(){

	document.addEventListener('deviceready', function () {

		// Androidの戻るボタン無効化
		document.addEventListener("backbutton", function(){return false;}, false);

		var arg  = new Object;
		url = location.search.substring(1).split('&');

		for(i=0; url[i]; i++) {
			var k = url[i].split('=');
			arg[k[0]] = k[1];
		}

		settlementDetail(arg.settlement_id);

	}, false);
});

// 画面遷移
function change_location(adr)
{
	window.location.href = adr;
}

function settlementDetail(settlement_id)
{
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;
	sendJsonStr.settlement_id = settlement_id;
	$.ajax({
		type: "POST",
		url:urlDomain + '/popo_mypage_apls/settlement_detail_ver2', 
		data: sendJsonStr,
		timeout: 30000,	
		success: function (data) { 
	
			var resultData = JSON.parse(data);
			//通信結果を確認する
			if(!resultData.is_error){
				var html = resultData.response.html; //精算内容
				document.getElementById('settlementDetail').innerHTML = html;
				$(".loader-wrap").css("display","none");
			}
			else{
				navigator.notification.alert(
					resultData.error_message,
					function(){
						window.location.href="index.html";
					},     			    	// callback
					'エラー',         	  // title
					'OK'                  // buttonName
				);
			}
		},
		error: function (xhr) {
			$(".loader-wrap").css("display","none");
			navigator.notification.alert(
				'通信に失敗しました。', 	 // message
					function(){
						$(".loader-wrap").css("display","none");
					},   			      	// callback
					'警告',         	   // title
					'OK'                  // buttonName
			);
		}
	});
}

