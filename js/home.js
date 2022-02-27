/*
 *
 * ホーム画面
 *
 */
$(function () {
	document.addEventListener('deviceready', function () {
		// Androidの戻るボタン無効化
		document.addEventListener("backbutton", function () { return false; }, false);

		$('.question_disp').on('click', question_dsp);

		homeReturn();
        countUnreadNotifications();
	}, false);
});

// 画面遷移
function change_location(adr) {
	window.location.href = adr;
}

// ホームから取得
function homeReturn() {
	var member_no = window.sessionStorage.getItem('member_no');
	var member_name = window.sessionStorage.getItem('member_name');

	if (member_no != null) {
		$('#member_no').html(member_no);
		$('#member_name').html(member_name + "様");
	}
}

// ご利用に関する説明
function question_dsp() {
	question_disp(null);
}

// T.B.D サーバー側未実装
// PUSH通知のバッジアイコン数の更新
function countUnreadNotifications() {
/*
	var sendJsonStr = {};
	sendJsonStr.member_id = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	var member_id = window.sessionStorage.getItem('member_no');
	sendJsonStr.apl_version = appVersion;
	sendJsonStr.member_id = member_id;

	if(member_id != null) {
		$.ajax({
			url: urlDomain + 'popo_mypage_apls/count_total_message_not_read?member_id=' + member_id,
			method: 'GET',
			success: function(result) {
                var data = JSON.parse(result);
                cordova.plugins.notification.badge.set(data.response);
			},
			error: function (error) {
				console.log('count_unread_notifications_error: '+JSON.stringify(error));
			}
		});
	}
*/
}
