/*
 *
 * QRコード 画面固有 ロジック
 *
 */

$(function(){

	document.addEventListener('deviceready', function () {

		// Androidの戻るボタン無効化
		document.addEventListener("backbutton", function(){return false;}, false);

		getQrCode();

	}, false);
});

 //ホームから取得
function getQrCode(){	
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;
	
	$(".loader-wrap").css("display","block");
	$.ajax({
		type: "POST",
		cache:false,
		data: sendJsonStr,
		url:urlDomain + '/popo_mypage_apls/get_qr_code', 
		timeout: 10000,
		cashe:false,
		success: function (data) { 
			var resultData = JSON.parse(data);	
			if (!resultData.is_error) {
				var html = '';
				var nameList = '';

				if(resultData.response.length == 1){
					html += '<div class="child_qr">' + resultData.response[0]['img'] + '</div>';
					document.getElementById('get_qr_code_test_body').innerHTML = html;
				}
				else{					
					for(i = 0; i < resultData.response.length; i++){
						if (i==0) {
							nameList += '<div class="child_name child_name_first">'
						}
						else {
							nameList += '<div class="child_name">'
						}
						nameList += '<p data-number="' + i + '" onClick="nameClick()">' + resultData.response[i]['name'] + '</p>'
								 +  '</div>';
						html += '<div id="qr_img_num_' + i + '" class="qr_img child_qr nodisp">' + resultData.response[i]['img'] + '</div>';
					}

				}
				document.getElementById('name').innerHTML = nameList;
				document.getElementById('get_qr_code_test_body').innerHTML = html;
			}
			else {
				// エラー時
				navigator.notification.alert(
					resultData.error_message,
						function(){
							window.location.href="index.html";
						},
						'エラー',
						'OK'
				);
			}
			$(".loader-wrap").css("display","none");
		},
		error: function (xhr) {
			$(".loader-wrap").css("display","none");
			navigator.notification.alert(
				'通信に失敗しました。インターネット環境を確認してください。',  // message
					function(){
						$(".loader-wrap").css("display","none");
					},
					'警告',
					'OK'
			);
		}
	});
}

function nameClick()
{
	// QRコードをすべて非表示にする
	var qr_img = document.getElementsByClassName('qr_img');
	for (var i = 0; i < qr_img.length; i++) {
		qr_img.item(i).style.display = 'none';
	}
	// クリックされた名前に対応するQRコードを表示する
	var e = (window.event)? window.event : arguments.callee.caller.arguments[0];
	var self = e.target || e.srcElement;
	var data_number = self.dataset.number;
	document.getElementById('qr_img_num_' + data_number).style.display = 'block';
}

// 画面遷移
function change_location(adr)
{
	window.location.href = adr;
}
