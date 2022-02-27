/*
 * 見積シミュレーション画面(結果) 画面固有 ロジック
 *
 */

$(function(){

	document.addEventListener('deviceready', function () {

		// Androidの戻るボタン無効化
		document.addEventListener("backbutton", function(){return false;}, false);

		var html = JSON.parse(window.sessionStorage.getItem('mpack_estimate_simulation_submit_rsp'));
		$('#group_body').html(html);

		$('#btn_finish').on('click', btn_finish_click );
		$('#btn_modify').on('click', btn_modify_click );

	}, false);
});

// 画面遷移
function change_location(adr)
{
	window.location.href = adr;
}

// [見積シミュレーションを終了]クリック
function btn_finish_click()
{
	navigator.notification.confirm(
	    	'メニューに戻ります。よろしいですか？',
	    	function(buttonIndex){
					if(buttonIndex==1){
						window.location.href="./contract_menu.html";
					}
	    	},
	    	'確認',
	    	'はい,いいえ'
		);
}

// [修正する]クリック
function btn_modify_click()
{
	window.location.href="./estimate_simulation.html?mode=modify";
}
