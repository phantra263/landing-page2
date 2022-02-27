/*
 * 月極契約・支払いメニュー 画面固有 ロジック
 *
 */
$(function() {
	document.addEventListener('deviceready', function () {
		// Androidの戻るボタン無効化
		document.addEventListener("backbutton", function(){return false;}, false);

		$('#menu_estimate_simulation').on('click', function(){
			location.href = "./estimate_simulation.html?mode=new";
		});

		$('#menu_use_history').on('click', function () {
			window.sessionStorage.setItem('use_history_select_bill_id', '0');
			location.href = "./use_history.html?mode=history";
		});

		$('#menu_estimate_list').on('click', function () {
			window.sessionStorage.setItem('use_history_select_bill_id', '0');
			location.href = "./use_history.html?mode=estimate";
		});

	}, false);
});

// 画面遷移
function change_location(adr)
{
	window.location.href = adr;
}
