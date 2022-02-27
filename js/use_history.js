/*
 * 利用履歴/見積一覧 画面固有 ロジック
 *
 */

$(function() {
	document.addEventListener('deviceready', function () {

		// Androidの戻るボタン無効化
		document.addEventListener("backbutton", function() {return false;}, false);

		var arg  = new Object;
		url = location.search.substring(1).split('&');

		for(i = 0; url[i]; i++) {
			var k = url[i].split('=');
			arg[k[0]] = k[1];
		}

		// 'history':利用履歴　'estimate':見積一覧
 		var mode = arg.mode;
		$('#form_mode').html(mode);

		if (mode == 'history') {
			$('.screen_title').html('利用履歴');
			$('.btn_start').html('選択した履歴から見積ｼﾐｭﾚｰｼｮﾝを開始');
		}
		else {
			$('.screen_title').html('見積一覧');
			$('.btn_start').html('選択した見積りで契約・支払いする');
		}

		$('#btn_start').on('click', btn_start_click);
		$('#btn_return').on('click', btn_return_click);
		$('#btn_return_nodata').on('click', btn_return_click);

		GetScreenParam(mode);
	}, false);
});

// 画面遷移
function change_location(adr)
{
	window.location.href = adr;
}

function GetScreenParam(mode)
{
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;

	var ajax_api;
	if (mode=='history') {
		ajax_api = 'popo_mypage_apls/mpack_estimate_create_usage_preparation';
	}
	else {
		ajax_api = 'popo_mypage_apls/mpack_estimate_payment_preparation';
	}

	$(".loader-wrap").css("display","block");
	$.ajax({
		type: "POST",
		url:urlDomain + ajax_api,
		data: sendJsonStr,
		timeout: 30000,
		success: function (data) {
			var resultData = JSON.parse(data);
			if (!resultData.is_error) {
				Set_list(resultData.response);
				$(".loader-wrap").css("display","none");
			}
			else {
				navigator.notification.alert(
					resultData.error_message,
					function() {
						window.location.href="index.html";
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
				function() {
					$(".loader-wrap").css("display","none");
				},
				'エラー',
				'OK'
			);
		}
	});
}

function Set_list(rsp)
{
	var mode = $('#form_mode').text();
	var bill_id = window.sessionStorage.getItem('use_history_select_bill_id');
	var html;

	if (rsp.bills.length > 0) {
		html = '<tr>'
			 + '	<th class="td_normal">選<br>択</th>';
		if (mode=='history') {
			html += '	<th class="td_normal">利用<br>年月</th>';
		}
		html +='	<th class="td_normal">園児</th>'
			 + '	<th class="td_normal">クラス</th>'
			 + '	<th class="td_normal">時間</th>'
			 + '	<th class="td_normal">曜日</th>'
			 + '	<th class="td_normal">詳細</th>'
			 + '</tr>';
	}
	for(var i = 0; i < rsp.bills.length; i++) {
		var rec = rsp.bills[i];
		var rowspan = '';

		if (rec.contracts.length > 1) {
			rowspan = 'rowspan="' + rec.contracts.length + '"';
		}

		var checked = '';

		if (rec.id == bill_id) {
			checked = 'checked';
		}

		for(var j = 0; j < rec.contracts.length; j++) {
			var rec2 = rec.contracts[j];
			if (mode == 'estimate' && rec.is_other_office) {
				html += '<tr class="other_office">';
			}
			else {
				html += '<tr>';
			}

			if (j == 0) {
				var is_disp_check = true;
				if (mode == 'estimate') {
					is_disp_check = rec.is_disp_check;
				}

				html += '<td ' + rowspan + ' class="td_normal col1">';
				if (is_disp_check) {
					html += '	<input type="radio" name="select_bill" class="radio" value="' + rec.id + '" ' + checked + '>';
				}
				html += '</td>';
				if (mode=='history') {
					 html += '<td ' + rowspan + ' class="td_normal col2">' + rec.year + '<br>' + rec.month + '</td>';
				}
			}
			var td = 'td_normal';
			if (rec.contracts.length > 1) {
				if (j == 0) {
					td = 'td_brother_top';
				}
				else if (j == (rec.contracts.length - 1)) {
					td = 'td_brother_low';
				}
				else {
					td = 'td_brother_middle';
				}
			}
			html += '<td class="' + td + ' col3">' + rec2.child_name + '</td>'
				 +  '<td class="' + td + ' col4">' + rec2.cource_name + '</td>';
			if (rec2.childcare_system_type == 'flex') {
				html += '<td class="' + td + ' col5">－</td>'
					 +  '<td class="' + td + ' col6">－</td>';
			}
			else {
				html += '<td class="' + td + ' col5">' + rec2.start_time.substr(0,5) + '<br>' + rec2.end_time.substr(0,5) + '</td>'
					 +  '<td class="' + td + ' col6">' + Create_useWeekDayStr(rec2) + '</td>';
			}
			if (j == 0) {
				html += '<td ' + rowspan + ' class="td_normal col7">'
					 +  '	<div class="btn_detail" data-billId="' + rec.id + '">詳細</div>'
					 +  '</td>';
			}
		}
	}

	$('#main_table').html(html);
	$('.btn_detail').on('click', btn_detail_click );

	if (mode=='history') {
		if (rsp.bills.length > 0) {
			$('#group_btn').show();
		}
		else {
			$('#group_btn_nodata').show();
			$('.msg_nodata.history').show();
		}
	}
	else {
		if (rsp.is_disp_top_message) {
			$('#group_header').html(rsp.top_message);
			$('#group_header').show();
		}
		if (rsp.is_disp_bottom_message) {
			$('#group_footer').html(rsp.bottom_message);
			$('#group_footer').show();
		}
		if (rsp.bills.length > 0) {
			if (rsp.is_disp_payment_button) {
				$('#group_btn').show();
			}
			else {
				$('#group_btn_nodata').show();
			}
		}
		else {
			$('#group_btn_nodata').show();
			if (!rsp.is_disp_top_message && !rsp.is_disp_bottom_message) {
				// 上部/下部メッセージともに無い場合のみ「見積が作成されてません」表示
				$('.msg_nodata.estimate').show();
			}
		}
	}
}

function Create_useWeekDayStr(contract)
{
	var str = '';

	// 表示する曜日数をカウント
	var cnt = 0;
	if (parseInt(contract.day_1)) {
		cnt++;
	}
	if (parseInt(contract.day_2)) {
		cnt++;
	}
	if (parseInt(contract.day_3)) {
		cnt++;
	}
	if (parseInt(contract.day_4)) {
		cnt++;
	}
	if (parseInt(contract.day_5)) {
		cnt++;
	}
	if (parseInt(contract.day_6)) {
		cnt++;
	}
	if (parseInt(contract.day_7)) {
		cnt++;
	}
	if (parseInt(contract.holiday_flg)) {
		cnt++;
	}

	// 折り返す位置を決める
	var brpos = -1;

	if (cnt >= 7) {
		brpos = 4;
	}
	else if (cnt >= 5) {
		brpos = 3;
	}

	var num = 0;
	if (parseInt(contract.day_1)) {
		num++
		str += '<span class="red">日</span>';
		if (num == brpos) {
			str += '<br>';
		}
	}
	if (parseInt(contract.day_2)) {
		num++
		str += '月';
		if (num == brpos) {
			str += '<br>';
		}
	}
	if (parseInt(contract.day_3)) {
		num++
		str += '火';
		if (num == brpos) {
			str += '<br>';
		}
	}
	if (parseInt(contract.day_4)) {
		num++
		str += '水';
		if (num == brpos) {
			str += '<br>';
		}
	}
	if (parseInt(contract.day_5)) {
		num++
		str += '木';
		if (num == brpos) {
			str += '<br>';
		}
	}
	if (parseInt(contract.day_6)) {
		num++
		str += '金';
		if (num == brpos) {
			str += '<br>';
		}
	}
	if (parseInt(contract.day_7)) {
		num++
		str += '土';
		if (num == brpos) {
			str += '<br>';
		}
	}
	if (parseInt(contract.holiday_flg)) {
		num++
		str += '<span class="red">祝</span>';
		if (num == brpos) {
			str += '<br>';
		}
	}

	return str;
}

// [戻る]クリック
function btn_return_click()
{
	window.location.href = "contract_menu.html";
}

// [開始する]クリック
function btn_start_click()
{
	// 入力チェック
	$('.error_message').hide();
	if ($('input[name="select_bill"]:checked').length < 1){
		var mode = $('#form_mode').text();
		var title;
		if (mode == 'history') {
			title = '利用履歴';
		}
		else {
			title = '見積';
		}
		$('#msg_noselect').html(title + 'を選択してください。');
		$('#msg_noselect').show();
		return;
	}

	save_select_bill_id();

	var mode = $('#form_mode').text();
	var bill_id = $('input[name="select_bill"]:checked').val();
	if (mode == 'history') {
		window.location.href = './estimate_simulation.html?mode=use_history&bill_id=' + bill_id;
	}
	else {
		window.location.href = './contract_payment.html?bill_id=' + bill_id;
	}
}

// [詳細]クリック
function btn_detail_click()
{
	save_select_bill_id();

	var mode = $('#form_mode').text();
	var bill_id = $(this).attr('data-billId');
	var url = './use_detail.html?mode=' + mode + '&bill_id=' + bill_id;
	window.location.href = url;
}

function save_select_bill_id()
{
	var bill_id = $('input[name="select_bill"]:checked').val();
	window.sessionStorage.setItem('use_history_select_bill_id', bill_id);
}
