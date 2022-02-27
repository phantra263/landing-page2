/*
 *
 * 会員情報閲覧・更新画面
 *
 */
$(function () {
	document.addEventListener('deviceready', function () {
		FCMPlugin.onNotification(function (data) {
			getListNotification();
		});
		getListNotification();
	}, false);
});

// 画面遷移
function change_location(adr) {
	window.location.href = adr;
}
function updateNotification(message_id) {
	var notification_id = message_id.split("-")[0]
	var id = "0:" + message_id.split("-")[1].replace("_", "%");
	if(message_id.split("-")[1].indexOf("_") < 0){
		id = message_id.split("-")[1].replace("_", "%");
	}
	var formData = new FormData();
	formData.append('message_id', id);
	$.ajax({
		url: urlDomain + 'popo_mypage_apls/update_notification_to_readed',
		method: 'POST',
		data: formData,
		processData: false,
		contentType: false,
		timeout: 10000,
		success: function (result) {
			var data = JSON.parse(result);
			window.sessionStorage.setItem('notification_id', notification_id);
			location.href = "./notification_detail.html";
		},
		error: function (error) {
			console.log('updateNotification_error: ' + JSON.stringify(error));
		}
	});
}
function getListNotification() {
	var sendJsonStr = {};
	sendJsonStr.member_id = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;

	var member_id = window.sessionStorage.getItem('member_no');
	if (member_id != null) {
		$.ajax({
			url: urlDomain + 'popo_mypage_apls/get_notification_by_member?member_id=' + member_id,
			method: 'GET',
			success: function (result) {
				var data = JSON.parse(result);
				if (data != null && data.response != null) {
					var html = '<div class="list dashboard-menu">'
					data.response.forEach(function (item) {
						if(item.message_id != null){
							var message_id = item.id+"-"+ item.message_id.replace("0:", "");
							message_id = message_id.replace("%", "_");
							// UnReaded
							if (item.is_readed == 0) {
								html += '<a class="item item-icon-right" style="margin-bottom: 5px;" onClick="updateNotification(\'' + message_id+ '\')">';
								html += '<div class="card_notification">';
								html += '<div id="notification' + message_id + '" style="width: 100%; margin-top: 5px;">';
								html += '<strong>' + item.title + '</strong><label class="newLabel">NEW</label>';
								html+= '<p style="text-align: right; color: #a3a3a3;">'+item.notification_date.slice(0, 10)+'<p>';
								html += '</div></div></a>';
							}
							else {
								html += '<a class="item item-icon-right" style="margin-bottom: 5px;" onClick="updateNotification(\'' + message_id + '\')">';
								html += '<div class="card_notification">';
								html += '<div id="notification' + message_id + '" style="width: 100%; margin-top: 5px;">';
								html += '<span>' + item.title + '</span>';
								html+= '<p style="text-align: right; color: #a3a3a3;">'+item.notification_date.slice(0, 10)+'<p>';
								html += '</div></div></a>';
							}
						}
					});

					html += '</div>';
					$("#list-notification").html(html);
				}
			},
			error: function (error) {
				console.log('count_unread_notifications_error: ' + JSON.stringify(error));
			}
		});
	}
}
