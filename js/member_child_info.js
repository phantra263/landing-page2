/*
 * 会員・園児情報 画面固有 ロジック
 *
 */
$(function(){
	document.addEventListener('deviceready', function () {

		// Androidの戻るボタン無効化
		document.addEventListener("backbutton", function(){return false;}, false);

		$('#member_info_view').on('click', function(){
			location.href = "./member_info_view.html?info=kihon";
		});

		$('#menu_use_history').on('click', function () {
			location.href = "./documents_upload.html";
		});

		$('#child_growth_record').on('click', function () {
			location.href = "./child_growth_record.html";
		});

	}, false);
});

// 画面遷移
function change_location(adr)
{
	window.location.href = adr;
}
