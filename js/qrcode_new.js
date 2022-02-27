$(document).ready(function() {
	document.addEventListener('deviceready', function () {
        // Androidの戻るボタン無効化
		document.addEventListener("backbutton", function(){return false;}, false);
	}, false);
});