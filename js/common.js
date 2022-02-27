/*
 * 様々な画面で使用する共通ロジックを記述
 *
 */
$(function () {
	document.addEventListener('deviceready', function () {
		$('.sidebar_menu').load('sidebar_menu.html', function () {
			$('.menu_home').on('click', menu_home_click);												// ホームボタン
			$('.menu_regist').on('click', menu_regist_click);											// 会員情報閲覧・更新
			$('.menu_credit_regist').on('click', menu_credit_regist_click);								// クレジットカード情報の登録/参照
			$('.menu_contract_menu').on('click', menu_contract_menu_click);								// 月極契約・支払い
			$('.menu_bills').on('click', menu_bills_click);												// 即時払い確認・支払い
			$('.menu_qrcode').on('click', menu_qrcode_click);											// QRコード
			$('.menu_question').on('click', menu_question_click);										// ご利用に関する説明
			$('.menu_logout').on('click', menu_logout_click);											// ログアウト
			$('.menu_notification_messages').on('click', menu_notification_messages_click); 			// お知らせメッセージ
			$('.menu_buy_kidscom_original_goods').on('click', menu_buy_kidscom_original_goods_click);	// Kidscomオリジナルグッズ購入
			$('.menu_buy_pictures').on('click', menu_buy_pictures_click);								// 写真購入
		});

		$('.menuBtn').on('click', menu_open);															// 右上メニューボタン押下
		$('.close_btn a, .menu_bg, .sidebar_menu').on('click', menu_close);								// メニュー展開中の閉じる操作
	}, false);
});

// ホームボタン
function menu_home_click() {
	change_location('home.html');
	return false;
}

// 会員・園児情報
function menu_regist_click() {
	change_location('member_child_info.html');
	return false;
}

// クレジットカード情報の登録/参照
function menu_credit_regist_click() {
	credit_regist();
	return false;
}

// 月極契約・支払い
function menu_contract_menu_click() {
	change_location('contract_menu.html');
	return false;
}

// 即時払い確認・支払い
function menu_bills_click() {
	change_location('settlement_list.html');
	return false;
}

// QRコード
function menu_qrcode_click() {
	change_location('qrcode.html');
	return false;
}

// お知らせメッセージ
function menu_notification_messages_click() {
	change_location('notification.html');
	return false;
}

// Kidscomオリジナルグッズ購入
function menu_buy_kidscom_original_goods_click() {
	if(!window.open($('#kidscom_url').attr('href'))) {
		location.href = $('#kidscom_url').attr('href');
	}
	else {
		window.open($('#kidscom_url').attr('href'));
	}
	return false;
}

// 写真購入
function menu_buy_pictures_click() {
	$('#shopSelect').dialog({
		buttons: {
			'閉じる': function () {
				$(this).dialog('close');
			}
		},
		modal: true,
		title: '写真購入ショップ選択',
		width: 230,
	});

	$(document).on("click", ".ui-widget-overlay", function () {
		$(this).prev().find(".ui-dialog-content").dialog("close");
	});

	return false;
}

// ご利用に関する説明
function menu_question_click() {
	menu_close();
	question_disp();
	event.stopPropagation();
	return false;
}

// ログアウト
function menu_logout_click() {
	navigator.notification.confirm(
		'ログアウトしますか？',
		function (buttonIndex) {
			if (buttonIndex == 1) {
				window.location.href = "index.html";
			}
		},
		'',
		'はい,いいえ'
	);
	event.stopPropagation();
	return false;
}

function menu_open() {
	$('.menu_bg').show();
	$('.sidebar_menu').show().animate({
		right: 0
	});
}

function menu_close() {
	$('.menu_bg').hide();
	$('.sidebar_menu').animate({
		right: '-' + 80 + '%'
	}, function () {
		$('.sidebar_menu').hide();
	});
}

function question_disp(display_area) {
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;
	if (display_area) sendJsonStr.display_area = display_area;

	$(".loader-wrap").css("display", "block");
	$.ajax({
		type: "POST",
		url: urlDomain + 'popo_mypage_apls/explanation_about_usage',
		data: sendJsonStr,
		timeout: 30000,
		success: function (data) {
			var resultData = JSON.parse(data);
			if (!resultData.is_error) {
				document.location.href = resultData.response.url;
				$(".loader-wrap").css("display", "none");
			}
			else {
				navigator.notification.alert(
					resultData.error_message,
					function () {
						window.location.href = "index.html";
					},
					'エラー',
					'OK'
				);
			}
		},
		error: function (xhr) {
			$(".loader-wrap").css("display", "none");
			navigator.notification.alert(
				'通信に失敗しました。インターネット環境を確認してください。',
				function () {
					$(".loader-wrap").css("display", "none");
				},
				'エラー',
				'OK'
			);
		}
	});
}

// yyyy-MM-dd形式を表示形式(yyyy/MM/dd、前ゼロなし)に変換
function fmtYMD(ymd) {
	return parseInt(ymd.substr(0, 4)) + '/' + parseInt(ymd.substr(5, 2)) + '/' + parseInt(ymd.substr(8, 2));
}

/*
 * class="inputYear"に対して年の選択肢を今年まで自動生成
 */
function createYearSelect() {
	var today = new Date();

	// 年の選択肢一覧を格納
	var yearOpt = "";

	//年の選択肢を生成(開始年は1920に仮設定)
	for (var i = today.getFullYear(); i >= 1920; i--) {
		yearOpt += "<option>" + i + "</option>\n";
	}

	// <option>を挿入
	var elem = $(".inputYear")
	for (var i = 0; i <= elem.length; i++) {
		$(elem[i]).append(yearOpt);
	}
}

function createMonthSelect() {
	// 月の選択肢一覧を格納
	var monthOpt = "";

	// 月の選択肢を生成
	for (var i = 1; i <= 12; i++) {
		monthOpt += "<option>" + i + "</option>\n";
	}

	//<option>を挿入
	var elem = $(".inputMonth")
	for (var i = 0; i <= elem.length; i++) {
		$(elem[i]).append(monthOpt);
	}
}

function createDaySelect() {
	// 日の選択肢一覧を格納
	var dayOpt = "";

	// 日の選択肢を生成
	for (var i = 1; i <= 31; i++) {
		dayOpt += "<option>" + i + "</option>\n";
	}

	// <option>を挿入
	var elem = $(".inputDay")
	for (var i = 0; i <= elem.length; i++) {
		$(elem[i]).append(dayOpt);
	}
}

function getBrowserUrl() {
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;
	sendJsonStr.code = 2;

	$.ajax({
		type: "POST",
		url: urlDomain + '/popo_mypage_apls/get_external_url',
		data: sendJsonStr,
		timeout: 10000,
		success: function (data) {
			var resultData = JSON.parse(data);
			if (!resultData.is_error) {
				var url = resultData.response.url;
				$('#photoTarget').empty('');
				for(var wkValue in url) {
					var addline = "";
					addline = '<li><i class="icon-new-tab"></i><a href="' + url[wkValue].url + '">' + url[wkValue].site_name + '</a></li>';
					$('#photoTarget').append(addline);
				}

				return;
			}
			else {
				navigator.notification.alert(
					resultData.error_message,
					function () {
						window.location.href = "index.html";
					},
					'警告',
					'OK'
				);
			}
		},
		error: function (xhr) {
			navigator.notification.alert(
				'通信に失敗しました。',
				function () {
					$(".loader-wrap").css("display", "none");
				},
				'警告',
				'OK'
			);
		}
	});
}

function credit_regist() {
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;

	$.ajax({
		type: "POST",
		url: urlDomain + '/popo_mypage_apls/reister_credit_info',
		data: sendJsonStr,
		timeout: 10000,
		success: function (data) {
			var data = JSON.parse(data);
			var result = data.is_error;
			var reister_credit_paygent_url = data.response.reister_credit_paygent_url;

			if (!result) {
				if(!window.open(reister_credit_paygent_url)) {
					location.href = reister_credit_paygent_url;
				}
				else {
					window.open(reister_credit_paygent_url);
				}
			}
			else {
				navigator.notification.alert(
					data.error_message,
					function () {
						window.location.href = "index.html";
					},
					'警告',
					'OK'
				);
			}
		},
		error: function (xhr) {
			navigator.notification.alert(
				'通信に失敗しました。',
				function () {
					$(".loader-wrap").css("display", "none");
				},
				'警告',
				'OK'
			);
		}
	});
}
