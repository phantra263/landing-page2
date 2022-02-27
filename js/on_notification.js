// realtime ontification
$(function(){
	document.addEventListener('deviceready', function () {
		FCMPlugin.onNotification(function(data) {
			if (data.wasTapped) {
			}
			else {
				cordova.plugins.notification.local.schedule({
					title: data.title,
					text: data.body,
					priority: 4,
					sound: "default",
					lockscreen: true,
					foreground: true
				});
			}
		});
	}, false);
});