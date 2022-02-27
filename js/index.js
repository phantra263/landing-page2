/*
 *
 * ログイン画面のロジック
 *
 */
$(document).ready(function() {
	document.addEventListener('deviceready',function() {
		location.href ="./register_to_school.html";
		// androidデバイスの戻るボタン無効化
		document.addEventListener("backbutton", function(){return false;}, false);

		$("#loginBtn").on("click",function() {
			$(".loader-wrap").css("display","");
			checkLogin();
		});

		// ログイン情報保持時の読み込み
		loadLoginInfo();
		$(".loader-wrap").css("display","none");

		// リンク先の設定処理
		setLink();

		if (urlDomain != PRODUCTION_DOMAIN) {
			$('#connect_server').html('<br><br><br>接続先：' + urlDomain);
		}

		window.sessionStorage.removeItem('member_name');
	}, false);
});

// ログイン情報をローカルストレージから読み込む
function loadLoginInfo() {
	if(window.localStorage.getItem('member_no') != null) {
		$("#code").val(window.localStorage.getItem('member_no'));
	}
	if(window.localStorage.getItem('password') != null) {
		$("#password").val(window.localStorage.getItem('password'));
	}
	if($("#code").val() != "" && $("#password").val() != null) {
		$("#keepBox").prop('checked',true);
	}
}

// リンク先の書き換え処理
function setLink() {
	$("#passwordlink").attr("href", urlDomain + 'api/password_setting_send_mail');
	$("#creditinfolink").attr("href", urlDomain + 'api/terms_of_credit_card_service');
}

// ログイン動作
function checkLogin() {
	var code = $("#code").val();
	var pass = $("#password").val();
	var is_input_error = false;

	// Phase 2
	if(code.charAt(0) == 'e'){
		var BranchId = 1;
		window.sessionStorage.setItem('BranchId', BranchId);
		location.href ="./home_staff.html";
	}else{
		location.href ="./home.html";
	}

	// 入力欄が空白ではないのか確認する
	if(code == "") {
		navigator.notification.alert(
			'会員Noが入力されてません。',
			function() {
				return false;
			},
			'警告',
			'OK'
		);

		is_input_error = true;
	}
	else if(pass == "") {
		navigator.notification.alert(
			'パスワード入力されてません。',
			function() {
				return false;
			},
			'警告',
			'OK'
		)

		is_input_error = true;
	}

	if(is_input_error == true) {
		// 入力エラーがある場合、ログイン認証でもエラーとなるので、サーバーと通信させない。
		$(".loader-wrap").css("display","none");
		return;
	}

	var sendJsonStr = {};
	sendJsonStr.MemberId = code;
	sendJsonStr.InputPassword = pass;
	sendJsonStr.AppVer = appVersion;

	$.ajax({
		type: "POST",
		url:urlDomain + 'api/LoginAction',
		contentType: "application/json",
		data: JSON.stringify(sendJsonStr),
		timeout: 10000,
		success: function (data) {
			var result = data.Result;
			var errMsg = data.ErrorMessage;

			if(result == true) {
				//// ログイン認証成功
				// セッションに受け取ったユーザー情報を保持
				window.sessionStorage.setItem('member_no', code);
				window.sessionStorage.setItem('member_name', data.MemberName);
				window.sessionStorage.setItem('password_hash', data.Password);

				// 「ログイン情報を保持する」のチェックがONの場合、ローカルストレージにログイン情報を保持する。
				if($("#keepBox").prop('checked')) {
					window.localStorage.setItem('member_no', code);
					window.localStorage.setItem('password', pass);
				}
				else {
					// 保持しない場合は削除しておく
					window.localStorage.removeItem('member_no');
					window.localStorage.removeItem('password');
				}

				// PUSH通知用のデバイストークンをサーバーに保存する。
				saveDeviceToken();

				// Phase 2
				if(code.charAt(0) == 'e'){
					var BranchId = 1;
					window.sessionStorage.setItem('BranchId', BranchId);
					location.href ="./home_staff.html";
				}else{
					location.href ="./home.html";
				}
				
			}
			else {
				navigator.notification.alert(
					errMsg,
					function() {
						$(".loader-wrap").css("display","none");
					},
					'エラー',
					'OK'
				);
			}
		},
		error: function (xhr) {
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

// T.B.D サーバー側未実装
// デバイストークンの保存
function saveDeviceToken() {
	/*
	var member_id = window.sessionStorage.getItem('member_no');
	var device_type = 0;
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;

	// iPhone
	if (navigator.userAgent.indexOf('iPhone') > 0) {
		device_type = 1;
	}
	// iPad
	else if(navigator.userAgent.indexOf('iPad') > 0) {
		device_type = 1;
	}
	// iPod
	else if(navigator.userAgent.indexOf('iPod') > 0) {
		device_type = 1;
	}
	// Android
	else if(navigator.userAgent.indexOf('Android') > 0) {
		device_type = 2;
	}

	FCMPlugin.getToken(function(token) {
		window.sessionStorage.setItem('device_token', token);
		var formData = new FormData();
		formData.append('member_id', parseInt(member_id));
		formData.append('device_token', token);

		// 1: IOS, 2: Android
		formData.append('device_type', device_type);
		if(token != null) {
			$.ajax( {
				url: urlDomain + 'popo_mypage_apls/save_device',
				method: 'POST',
				processData: false,
    			contentType: false,
				data: formData,
				timeout: 10000,
				success: function(result){
					loadLoginInfo();
					location.href ="./home.html";
				},
				error: function (error) {
					console.log('notification_token_error: ' + JSON.stringify(error));
				}
			});
		}
	});
	*/
	// location.href ="./home.html";
}
