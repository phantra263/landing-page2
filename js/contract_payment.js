/*
 * 契約・支払い 画面固有 ロジック
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
		var bill_id = arg.bill_id;
		$('#bill_id').html(bill_id);

		$('#btn_start').on('click', btn_start_click);
		$('#btn_return').on('click', btn_return_click);

		$('#popup-wrap').on('click', dlg_btn_abort_click);
		$('#dlg_btn_abort').on('click', dlg_btn_abort_click);
		$('#dlg_btn_continue').on('click',dlg_btn_continue_click);

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
	sendJsonStr.mode = 'payment';

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
					'警告',
					'OK'
			);
		}
	});
}

// [支払いする]クリック
function btn_start_click()
{
	$('#popup').show();
	$('#popup-wrap').show();
}

// [中止する]クリック
function btn_return_click()
{
	window.location.href = 'use_history.html?mode=estimate';
}

// メッセージボックスの[続行]クリック
function dlg_btn_continue_click()
{
	var bill_id = $('#bill_id').text();
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;
	sendJsonStr.bill_id = bill_id;

	$(".loader-wrap").css("display","block");
	dlg_btn_abort_click();
	$.ajax({
		type: "POST",
		url:urlDomain + 'popo_mypage_apls/mpack_estimate_payment',
		data: sendJsonStr,
		timeout: 30000,
		success: function (data) {
			var resultData = JSON.parse(data);
			if (!resultData.is_error) {
				// 通信成功時
				if (resultData.response.success) {
					// 支払い開始成功
					document.location.href = resultData.response.payment_credit_paygent_url ;
					$(".loader-wrap").css("display","none");
				}
				else {
					// 支払い開始失敗
					navigator.notification.alert(
						resultData.response.error_message,
							function(){
								$(".loader-wrap").css("display","none");
							},
							'エラー',
							'OK'
					);
				}
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
		},
		error: function (xhr) {
			$(".loader-wrap").css("display","none");
			navigator.notification.alert(
				'通信に失敗しました。インターネット環境を確認してください。',
					function() {
						$(".loader-wrap").css("display","none");
					},
					'警告',
					'OK'
			);
		}
	});
}

// メッセージボックスの[取り消し]クリック
function dlg_btn_abort_click()
{
	$('#popup').hide();
	$('#popup-wrap').hide();
}
