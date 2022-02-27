/*
 *
 * 会員情報閲覧・更新画面
 *
 */
$(function(){
	document.addEventListener('deviceready', function () {
		getNotificationById();
        countUnreadNotifications();
	}, false);

});

// 画面遷移
function change_location(adr)
{
	window.location.href = adr;
}
function getNotificationById(){	
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	var member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;
	var notification_id = window.sessionStorage.getItem('notification_id');
	sendJsonStr.notification_id = notification_id;

	$.ajax({
		url: urlDomain + 'popo_mypage_apls/get_detail_notification?notification_id=' + notification_id + '&member_no=' + member_no,
		method: 'GET',	
		timeout: 10000,	
		beforeSend: function(){
			$("#notification-detail").hide("slide", {direction: "right"}, 100);
		},
		success: function(result){
			var data = JSON.parse(result);
			if (!data.is_error) {
				var html = '<div class="list dashboard-menu" style="padding: 8px;">'
					html += '<div>'
					html += '<strong>'+data.response.title+'</strong>'
					html += '<p >'+data.response.text+'</p>';
					html += '</div></div>';
					$("#notification-detail").html(html).show("slide", {direction: "right"}, 100);
			}			
		},
		error: function (error) {
			console.log('getNotificationById_error: '+JSON.stringify(error));
		}
	});
}
// Count unread notifications
function countUnreadNotifications(){
    var member_id = window.sessionStorage.getItem('member_no');
    if(member_id != null){
        $.ajax({
            url: urlDomain + 'popo_mypage_apls/count_total_message_not_read?member_id='+ member_id,
            method: 'GET',
            success: function(result){
                var data = JSON.parse(result);
                cordova.plugins.notification.badge.set(data.response);
            },
            error: function (error) {
                console.log('count_unread_notifications_error: '+JSON.stringify(error));
            }
        });
    }
}
