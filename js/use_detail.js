/*
 * 利用詳細/見積詳細 画面固有 ロジック
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
 		var mode = arg.mode;
		$('#form_mode').html(mode);		// 'history':利用詳細
										// 'estimate':見積詳細
		var bill_id = arg.bill_id;
		$('#bill_id').html(bill_id);

		if (mode=='history') {
			$('.screen_title').html('利用詳細');
		}
		else {
			$('.screen_title').html('見積詳細');
		}

		$('#btn_return').on('click', btn_return_click);

		GetScreenParam(bill_id);

	}, false);
});

// 画面遷移
function change_location(adr)
{
	window.location.href = adr;
}

function GetScreenParam(bill_id)
{
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;
	sendJsonStr.bill_id = bill_id;
	sendJsonStr.mode = 'reference';

	$(".loader-wrap").css("display","block");
	$.ajax({
		type: "POST",
		url:urlDomain + 'popo_mypage_apls/mpack_detail', 
		//contentType: "application/json",
		data: sendJsonStr,
		timeout: 30000,
		success: function (data) {
			var resultData = JSON.parse(data);	
			if (!resultData.is_error) {
				// 成功時
				$('#group_body').html(resultData.response.html);
				$(".loader-wrap").css("display","none");
			}
			else {
				$(".loader-wrap").css("display","none");
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
		},
		error: function (xhr) {
			$(".loader-wrap").css("display","none");
			navigator.notification.alert(
				'通信に失敗しました。インターネット環境を確認してください。',  // message
					function(){
						$(".loader-wrap").css("display","none");
					},
					'エラー',
					'OK'
			);
		}
	});
}

// [戻る]クリック
function btn_return_click()
{
	var mode = $('#form_mode').text();
	window.location.href = 'use_history.html?mode=' + mode;
}

