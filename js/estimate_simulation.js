/*
 * シミュレーション画面固有 ロジック
 *
 */

$(function(){
	document.addEventListener('deviceready', function () {

		// Androidの戻るボタン無効化
		document.addEventListener("backbutton", function(){return false;}, false);

		var arg  = new Object;
		url = location.search.substring(1).split('&');

		for(i=0; url[i]; i++) {
			var k = url[i].split('=');
			arg[k[0]] = k[1];
		}
		// 動作モード取得
 		var mode = arg.mode;
		$('#form_mode').html(mode);		// 'new':[見積シミュレーション]から呼出
										// 'use_history':利用履歴から呼出
										// 'modify':シミュレーション結果から[修正する]押下

		if (mode=='use_history') {
			// 利用履歴から呼出の場合、請求IDも保存
			var bill_id = arg.bill_id;
			$('#bill_id').html(bill_id);
		}

		$('#sim_start').on('click', sim_start_click);
		$('#btn_complete').on('click', btn_complete_click);
		$('#btn_abort').on('click', btn_abort_click);
		$('#question1').on('click', question1_click);
		$('#question2').on('click', question2_click);
		$('#mpack_class').change( change_mpack_class );
		$('#begin_minutes').change( change_begin_minutes );

		//DispPopupDialog();

		$('#current_child').html('0');		// 最初の園児から順に設定

		switch (mode) {
			case 'new':
				DataClear();
				DispPopupDialog();
				break;
			case 'use_history':
				DataClear();
				DispPopupDialog();
				break;
			case 'modify':
				var rsp = getItem_mpack_estimate_simulation_rsp();
				Set_mpack_estimate_simulation(rsp);
				var param = getItem_mpack_simulation_contracts();
				Set_children(rsp, param);
				$(".loader-wrap").css("display","none");
				break;
		}

	}, false);
});

// 画面遷移
function change_location(adr)
{
	window.location.href = adr;
}

function DataClear()
{
	window.sessionStorage.removeItem('mpack_estimate_simulation_rsp');			// 見積シミュレーション画面(作成)表示用データ
	window.sessionStorage.removeItem('mpack_estimate_simulation_submit_rsp');	// 見積シミュレーション画面(結果)表示用HTML
}

// 園児等選択ポップアップ表示用の情報収集と、表示
function DispPopupDialog()
{
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;
	if ($('#form_mode').text()=='use_history'){
		sendJsonStr.bill_id = $('#bill_id').text();
	}

	$(".loader-wrap").css("display","block");
	$.ajax({
		type: "POST",
		url:urlDomain + 'popo_mypage_apls/mpack_estimate_simulation_preparation', 
		//contentType: "application/json",
		data: sendJsonStr,
		timeout: 30000,
		success: function (data) {
			var resultData = JSON.parse(data);	
			if (!resultData.is_error) {
				// 成功時
				$('#popup').css('display','block');
				Set_mpack_estimate_simulation_preparation(resultData.response);
				$(".loader-wrap").css("display","none");
			}
			else {
				// エラー時
				navigator.notification.alert(
					resultData.error_message,
						function(){
							window.location.href="index.html";
						},
						'エラー',
						'OK'
				);
			}
		},
		error: function (xhr) {
			$(".loader-wrap").css("display","none");
			navigator.notification.alert(
				'通信に失敗しました。インターネット環境を確認してください。',  // message
					function(){
						$(".loader-wrap").css("display","none");
					},
					'警告',
					'OK'
			);
		}
	});

}

function Set_mpack_estimate_simulation_preparation(rsp)
{
	// 園一覧セット
	var		dlg_branch_list = '';
	for(var i=0; i<rsp.offices.length; i++){
		var		rec = rsp.offices[i];
		var		selected = '';
		if (rec.id == rsp.default.office_id)	selected = 'selected';
		dlg_branch_list += '<option value="' + rec.id + '" ' + selected + '>' + rec.name + '</option>';
	}
	$('#dlg_branch').html(dlg_branch_list);

	// 園児一覧セット
	var		child_list = '';
	for(var i=0; i<rsp.children.length; i++){
		var		rec = rsp.children[i];
		var		selected = '';
		if (("child_ids" in rsp.default) && Array.isArray(rsp.default.child_ids)) {
			for( var j=0; j<rsp.default.child_ids.length; j++){
				if (rec.id == rsp.default.child_ids[j])		selected = 'checked';
			}
		}
		child_list += '<tr><td class="dlg_child_table_cell dlg_child_table_col1" align="center">'
					+ '<input type="checkbox" class="chkbox" id="dlg_child' + (i+1) + '" value="' + rec.id + '" ' + selected + '></td>';
		child_list += '<td class="dlg_child_table_cell dlg_child_table_col2"><label class="dlg_child_list_label" for="dlg_child' + (i+1) + '">' + rec.name + '</label></td></tr>';
	}
	$('#dlg_child_table').html(child_list);
	$('#child_count').html(rsp.children.length);

	var use_ym = rsp.default.year + '-' + ('0'+rsp.default.month).slice(-2);
	var cur_year = parseInt(rsp.default.year);
	var cur_month = parseInt(rsp.default.month);
	var html = '';
	for( var i=0; i<120; i++){		// データ化け時の無限ループ抑制
		var var_ym = cur_year + '-' + ('0'+cur_month).slice(-2);
		var disp_ym = cur_year + '年' + (' '+cur_month).slice(-2) + '月';
		html += '<option value="' + var_ym + '">' + disp_ym + '</option>';
		if (var_ym >= rsp.max_year_month)	break;
		cur_month++;
		if (cur_month>12) {
			cur_month = 1;
			cur_year++;
		}
	}
	$('#dlg_use_ym').html(html);
	//$('#dlg_use_ym').val(use_ym).attr('min',use_ym).attr('max',rsp.max_year_month);
	$('#dlg_use_ym').val(use_ym);
}

// ポップアップ画面で[見積シミュレーションを開始]クリック
function sim_start_click()
{
	// 入力チェック
	var		is_error = false;
	var		use_ym = $('#dlg_use_ym').val();
	if (use_ym==""){
		$('#msg_ym_noselect').css('display', 'block');
		is_error = true;
	}
	else{
		$('#msg_ym_noselect').css('display', 'none');
	}
	var		child_count = $('#child_count').text();
	var		chk_count = 0;
	for(var i=0; i<child_count; i++){
		var		nm = 'dlg_child' + (i+1);
		if ($('#' + nm).prop('checked') == true) {
			chk_count++;
		}
	}
	if (chk_count == 0){
		$('#msg_child_noselect').css('display', 'block');
		is_error = true;
	}
	else {
		$('#msg_child_noselect').css('display', 'none');
	}
	if (is_error)	return false;

	// 
	$('#popup').css('display','none');
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;
	sendJsonStr.child_ids = new Array();
	sendJsonStr.office_id = $('#dlg_branch').val();
	sendJsonStr.year = use_ym.substr(0,4);
	sendJsonStr.month = use_ym.substr(5,4);
	if ($('#form_mode').text()=='use_history'){
		sendJsonStr.bill_id = $('#bill_id').text();
	}
	for(var i=0; i<child_count; i++){
		var		nm = 'dlg_child' + (i+1);
		if ($('#' + nm).prop('checked') == true) {
			sendJsonStr.child_ids.push($('#' + nm).val());
		}
	}

	$(".loader-wrap").css("display","block");
	$.ajax({
		type: "POST",
		url:urlDomain + 'popo_mypage_apls/mpack_estimate_simulation', 
		//contentType: "application/json",
		data: sendJsonStr,
		timeout: 30000,
		success: function (data) {
			var resultData = JSON.parse(data);	
			if (!resultData.is_error) {
				// 成功時
				var rsp = resultData.response;
				setItem_mpack_estimate_simulation_rsp(rsp);
				Set_mpack_estimate_simulation(rsp);
				var param = Create_contracts(rsp);
				Set_children(rsp, param);
				$(".loader-wrap").css("display","none");
			}
			else {
				// エラー時
				navigator.notification.alert(
					resultData.error_message,
						function(){
							window.location.href="index.html";
						},
						'エラー',
						'OK'
				);
			}
		},
		error: function (xhr) {
			$(".loader-wrap").css("display","none");
			navigator.notification.alert(
				'通信に失敗しました。インターネット環境を確認してください。',  // message
					function(){
						$(".loader-wrap").css("display","none");
					},
					'警告',
					'OK'
			);
		}
	});

}

function setItem_mpack_estimate_simulation_rsp(rsp)
{
	window.sessionStorage.setItem('mpack_estimate_simulation_rsp', JSON.stringify(rsp));
}

function getItem_mpack_estimate_simulation_rsp()
{
	return JSON.parse(window.sessionStorage.getItem('mpack_estimate_simulation_rsp'));
}

function setItem_mpack_simulation_contracts(contracts)
{
	window.sessionStorage.setItem('mpack_simulation_contracts', JSON.stringify(contracts));
}

function getItem_mpack_simulation_contracts()
{
	return JSON.parse(window.sessionStorage.getItem('mpack_simulation_contracts'));
}

// 園児人数分のシミュレーションパラメータを生成
function Create_contracts(rsp)
{
	var jsonStr = {};
	jsonStr.office_id = rsp.office_id;
	jsonStr.year = rsp.year;
	jsonStr.month = rsp.month;
	jsonStr.contracts = new Array();
	for(var i=0; i<rsp.children.length; i++){
		var rec = rsp.children[i];
		var contract = {};
		var found = false;
		if ("default" in rsp && "contracts" in rsp.default) {
			// 初期値がある場合そこから取得
			for( var j=0; j<rsp.default.contracts.length; j++){
				var rec2 = rsp.default.contracts[j];
				if (rec.id==rec2.child_id) {
					contract = rec2;
					found = true;
					break;
				}
			}
		}
		if (found==false) {
			// 初期値が無い場合、生成
			contract.child_id = rec.id;
			contract.cource_type = (rsp.cource_info.cource_types.length==1 ? rsp.cource_info.cource_types[0].id : '');		// 1件しか無い場合、自動選択
			contract.childcare_plan_types = '';
			contract.cource_id = '';
			contract.start_time_hour   = parseInt(rsp.open_time.substr(0,2));
			contract.start_time_minute = parseInt(rsp.open_time.substr(3,2));
			contract.end_time_hour     = parseInt(rsp.close_time.substr(0,2));
			contract.end_time_minute   = parseInt(rsp.close_time.substr(3,2));
			contract.day_1 = 0;
			contract.day_2 = 0;
			contract.day_3 = 0;
			contract.day_4 = 0;
			contract.day_5 = 0;
			contract.day_6 = 0;
			contract.day_7 = 0;
			contract.holiday_flg = 0;
			contract.privilege_ids = new Array();
		}
		jsonStr.contracts.push(contract);
	}
	setItem_mpack_simulation_contracts(jsonStr);
	return jsonStr;
}

function Set_mpack_estimate_simulation(rsp)
{
	// コース
	var html = '';
	for(var i = 0; i < rsp.cource_info.cource_types.length; i++) {
		var rec = rsp.cource_info.cource_types[i];
		var selected = '';

		html += '<tr><td><input type="radio" id="mpack_course' + (i+1) + '" name="mpack_course" value="' + rec.id + '" ' + selected + ">"
		      + '<label for="mpack_course' + (i+1) + '">' + rec.name + '</label></td></tr>';
	}
	$('input[name="mpack_course"]:radio').off();
	$('#tbl_group_course').html(html);
	$('input[name="mpack_course"]:radio').change( change_mpack_cource );

	// 祝日の開園有無
	if (rsp.holiday_open_flg!=0)	$('.use_holiday').show();
	else							$('.use_holiday').hide();

	// 特典
	if (rsp.privileges.length > 0) {
		html = ''
		for(var i=0; i<rsp.privileges.length; i++) {
			var rec = rsp.privileges[i];
			html += '<tr><td>' + rec.name + '</td></tr>';
		}
		$('#group_privilege').css("display","block");
		$('#tbl_privileges').html(html);
	}
	else {
		$('#group_privilege').css("display","none");
	}

	// 時間選択のセレクトボックスに選択肢セット
	Set_select_time(rsp);
}

// コース 変更
function change_mpack_cource()
{
	var rsp = getItem_mpack_estimate_simulation_rsp();
	Set_mpack_plan(rsp);
	change_mpack_plan();
	Set_mpack_class(rsp);
}

// 園児情報
function Set_children(rsp, param)
{
	var current_child = $('#current_child').text();
	var rec = rsp.children[current_child];
	var ym = rsp.year + '年' + parseInt(rsp.month) + '月分';
	$('#childcare_ym').html(ym);
	$('#child_name').html(rec.name);
	$('#child_age').html(rec.age);
	
	var contract = param.contracts[current_child];

	// コース
	$('input[name="mpack_course"]:checked').prop('checked',false);
	$('input[name="mpack_course"][value="' + contract.cource_type + '"]').prop('checked',true);

	// プラン
	Set_mpack_plan(rsp);
	$('input[name="mpack_plan"]:checked').prop('checked',false);
	$('input[name="mpack_plan"][value="' + contract.childcare_plan_type_id + '"]').prop('checked',true);

	// クラス
	change_mpack_plan();
	Set_mpack_class(rsp);
	$('#mpack_class').val(contract.cource_id);
	Set_mpack_class_detail(rsp);

	// 開始/終了時刻
	$('#begin_hour').val(parseInt(contract.start_time_hour));
	$('#begin_minutes').val(parseInt(contract.start_time_minute));
	change_begin_minutes();
	$('#end_hour').val(parseInt(contract.end_time_hour));
	$('#end_minutes').val(parseInt(contract.end_time_minute));
	// 曜日
	$('#chkbox_day_1').prop("checked", (contract.day_1==1));
	$('#chkbox_day_2').prop("checked", (contract.day_2==1));
	$('#chkbox_day_3').prop("checked", (contract.day_3==1));
	$('#chkbox_day_4').prop("checked", (contract.day_4==1));
	$('#chkbox_day_5').prop("checked", (contract.day_5==1));
	$('#chkbox_day_6').prop("checked", (contract.day_6==1));
	$('#chkbox_day_7').prop("checked", (contract.day_7==1));
	// 祝日も預ける
	$('#chkbox_holiday_time').prop("checked", (contract.holiday_flg==1));
	$('#chkbox_holiday_pack').prop("checked", (contract.holiday_flg==1));
	// 特典ID
}

function Set_mpack_plan(rsp)
{
	// プラン
	var html = '';
	var cource_type = $('input[name="mpack_course"]:checked').val();
	var childcare_plan_type_id = $('input[name="mpack_plan"]:checked').val();	// 現在の選択項目を退避
	var rec_count = 0;		// 表示対象となるレコード数
	for(var i=0; i<rsp.cource_info.childcare_plan_types.length; i++) {
		var		rec = rsp.cource_info.childcare_plan_types[i];
		if (rec.cource_type != cource_type)		continue;
		rec_count++;
	}
	for(var i=0; i<rsp.cource_info.childcare_plan_types.length; i++) {
		var		rec = rsp.cource_info.childcare_plan_types[i];
		if (rec.cource_type != cource_type)		continue;
		var		selected = '';
		if (i==0 && rec_count==1)				selected = 'checked';
		if (rec.id == childcare_plan_type_id)	selected = 'checked';
		html += '<tr><td><input type="radio" id="mpack_plan' + (i+1) + '" name="mpack_plan" value="' + rec.id
		      + '" data-childcareSystemType="' + rec.childcare_system_type + '" ' + selected + '>' 
		      + '<label for="mpack_plan' + (i+1) + '">' + rec.name + '</label></td></tr>';
	}
	$('input[name="mpack_plan"]:radio').off();
	$('#tbl_group_plan').html(html);
	$('input[name="mpack_plan"]:radio').change( change_mpack_plan );
}

// 時間選択のセレクトボックスに選択肢セット
function Set_select_time(rsp)
{
	var hour_bgn = parseInt(rsp.open_time.substr(0,2));
	var hour_end = parseInt(rsp.close_time.substr(0,2));
	var html = '';
	for(var i=hour_bgn; i<=hour_end; i++) {
		html += '<option value="' + i + '">' + ('0'+i).slice(-2) + '</option>';
	}
	$('#begin_hour').html(html);
	$('#end_hour').html(html);
}

// 終了時刻の分セット
function change_begin_minutes()
{
	var end_minute = $('#end_minutes option:selected').val();
	var html = '';
	if ($('#begin_minutes option:selected').val()) {
		var bgn_min = parseInt($('#begin_minutes option:selected').val());
		if (bgn_min>=30)	bgn_min-=30;
		html += '<option value="' + bgn_min + '">' + ('0'+bgn_min).slice(-2) + '</option>';
		bgn_min += 30;
		html += '<option value="' + bgn_min + '">' + ('0'+bgn_min).slice(-2) + '</option>';
	}
	$('#end_minutes').html(html);
	$('#end_minutes').val(end_minute);
}

function change_mpack_plan()
{
	var		rsp = getItem_mpack_estimate_simulation_rsp();
	Set_mpack_class(rsp);

	var radioval = $('input[name="mpack_plan"]:checked').attr('data-childcareSystemType');
	switch(radioval) {
		case 'time':
			$('#group_contidion_time').show();
			$('#end_minutes').css('min-width', $('#begin_minutes').outerWidth(true));	// iOS対策
			$('#group_contidion_pack').hide();
			$('#group_contidion_flex').hide();
			break;
		case 'pack':
			$('#group_contidion_time').hide();
			$('#group_contidion_pack').show();
			$('#group_contidion_flex').hide();
			break;
		case 'flex':
			$('#group_contidion_time').hide();
			$('#group_contidion_pack').hide();
			$('#group_contidion_flex').show();
			break;
		default:
			$('#group_contidion_time').hide();
			$('#group_contidion_pack').hide();
			$('#group_contidion_flex').hide();
			break;
	}
}

function Set_mpack_class(rsp)
{
	// クラス
	var		html = '';
	var		childcare_plan_type_id = $('input[name="mpack_plan"]:checked').val();
	var		cource_id = $('#mpack_class').val();		// 現在の選択項目を退避
	for(var i = 0; i < rsp.cource_info.cources.length; i++) {
		var		rec = rsp.cource_info.cources[i];
		if (rec.childcare_plan_type_id != childcare_plan_type_id) {
			continue;
		}
		var selected = '';
		if (rec.id == cource_id) {
			selected = 'selected';
		}
		html += '<option value="' + rec.id + '" ' + selected + '>' + rec.name + '</option>';
	}
	$('#mpack_class').html(html);
	Set_mpack_class_detail(rsp);
}

function change_mpack_class()
{
	var rsp = getItem_mpack_estimate_simulation_rsp();
	Set_mpack_class_detail(rsp);
	return true;
}

function Set_mpack_class_detail(rsp)
{
	// クラス詳細
	var cource_id = $('#mpack_class option:selected').val();
	var cource = Get_cource(rsp, cource_id);
	if (!cource) {
		return;
	}

	var radioval = $('input[name="mpack_plan"]:checked').attr('data-childcareSystemType');
	switch(radioval) {
		case 'time':
			Set_mpack_class_detail_time(cource);
			break;
		case 'pack':
			Set_mpack_class_detail_pack(cource);
			break;
		case 'flex':
			Set_mpack_class_detail_flex(cource);
			break;
	}
}

function Get_cource(rsp, cource_id)
{
	var ret = null;
	for(var i = 0; i < rsp.cource_info.cources.length; i++){
		if (rsp.cource_info.cources[i].id == cource_id) {
			ret = rsp.cource_info.cources[i];
			break;
		}
	}
	return ret;
}

function Set_mpack_class_detail_time(cource)
{
	if (cource.cource_type=='period') {
		var str = fmtYMD(cource.period_start_date) + '～' + fmtYMD(cource.period_end_date);
		$('#p_limited_time').html(str);
		$('#td_limited_time').show();
	}
	else {
		$('#td_limited_time').hide();
	}
}

function Set_mpack_class_detail_pack(cource)
{
	var		html = '';
	html = cource.name + '<br>';
	if (cource.cource_type=='period') {
		html += '期間：' + fmtYMD(cource.period_start_date) + '～' + fmtYMD(cource.period_end_date) + '<br>';
	}
	html += '保育曜日：';
	if (cource.day_1 != 0)	html += '日';
	if (cource.day_2 != 0)	html += '月';
	if (cource.day_3 != 0)	html += '火';
	if (cource.day_4 != 0)	html += '水';
	if (cource.day_5 != 0)	html += '木';
	if (cource.day_6 != 0)	html += '金';
	if (cource.day_7 != 0)	html += '土';
	html +='<br>'
		 + '保育時間：' + parseInt(cource.childcare_start_time.substr(0,2)) + ':' + cource.childcare_start_time.substr(3,2)
		 + '～'         + parseInt(cource.childcare_end_time.substr(0,2)) + ':' + cource.childcare_end_time.substr(3,2);
	$('#group_contidion_pack_detail').html(html);
}

function Set_mpack_class_detail_flex(cource)
{
	var html = '';
	html = cource.ticket_time + '時間/月';
	$('#group_contidion_flex').html(html);
}

function radio_check(name)
{
	var chk = false;
	$('input[name="'+name+'"]').each(function () {
		if ($(this).prop('checked')) { chk=true; }
	});
	return chk;
}

function timestr(min)
{
	var str = '';
	if (min>=60) {
		str += Math.floor(min/60) + '時間';
	}
	if ((min % 60)!=0) {
		str += (min % 60) + '分';
	}
	return str;
}

// [この園児の作成を完了]クリック
function btn_complete_click()
{
	// ポップアップ表示中は無視
	if ($('#popup').css('display')!='none')	return false;

	// 入力チェック
	$('.error_message').hide();
	// コース
	if (!radio_check('mpack_course')) {
		$('#msg_course_noselect').show();
		return;
	}
	// プラン
	if (!radio_check('mpack_plan')) {
		$('#msg_plan_noselect').show();
		return;
	}
	// クラス
	if (!$('#mpack_class option:selected').val()){
		$('#msg_class_noselect').show();
		return;
	}

	var rsp = getItem_mpack_estimate_simulation_rsp();
	var cource_id = $('#mpack_class option:selected').val();
	var cource = Get_cource(rsp, cource_id);

	// 時間
	if ($('input[name="mpack_plan"]:checked').attr('data-childcareSystemType')=='time'){
		if (!$('#begin_hour option:selected').val() || !$('#begin_minutes option:selected').val()){
			$('#msg_time').html('登園時間を選択してください。');
			$('#msg_time').show();
			return;
		}
		if (!$('#end_hour option:selected').val() || !$('#end_minutes option:selected').val()){
			$('#msg_time').html('降園時間を選択してください。');
			$('#msg_time').show();
			return;
		}
		var bgn_time = parseInt($('#begin_hour option:selected').val())*60 + parseInt($('#begin_minutes option:selected').val());
		var end_time = parseInt($('#end_hour option:selected').val())*60 + parseInt($('#end_minutes option:selected').val());
		if (bgn_time > end_time) {
			$('#msg_time').html('降園時間が登園時間より早いです。');
			$('#msg_time').show();
			return;
		}
		if ((cource.min_childcare_time*60) > (end_time-bgn_time)){
			$('#msg_time').html('最低保育時間(' + timestr(cource.min_childcare_time*60) + ')より短いです。');
			$('#msg_time').show();
			return;
		}
		// 曜日
		var cnt = 0;
		if ($('#chkbox_day_1').prop("checked") && rsp.holiday_open_flg)		cnt++;
		if ($('#chkbox_day_2').prop("checked"))		cnt++;
		if ($('#chkbox_day_3').prop("checked"))		cnt++;
		if ($('#chkbox_day_4').prop("checked"))		cnt++;
		if ($('#chkbox_day_5').prop("checked"))		cnt++;
		if ($('#chkbox_day_6').prop("checked"))		cnt++;
		if ($('#chkbox_day_7').prop("checked"))		cnt++;
		if (cnt != parseInt(cource.childcare_count)) {
			$('#msg_weekday').html('曜日を' + cource.childcare_count + '日選択してください。');
			$('#tr_msg_weekday').show();
			$('#msg_weekday').show();
			return;
		}
	}

	var current_child = parseInt($('#current_child').text());
	var param = getItem_mpack_simulation_contracts();
	param.contracts[current_child].cource_type = $('input[name="mpack_course"]:checked').val();
	param.contracts[current_child].childcare_plan_type_id = $('input[name="mpack_plan"]:checked').val();
	param.contracts[current_child].cource_id = cource_id;
	param.contracts[current_child].start_time_hour = $('#begin_hour option:selected').val();
	param.contracts[current_child].start_time_minute = $('#begin_minutes option:selected').val();
	param.contracts[current_child].end_time_hour = $('#end_hour option:selected').val();
	param.contracts[current_child].end_time_minute = $('#end_minutes option:selected').val();
	param.contracts[current_child].day_1 = $('#chkbox_day_1').prop("checked") ? 1 : 0;
	param.contracts[current_child].day_2 = $('#chkbox_day_2').prop("checked") ? 1 : 0;
	param.contracts[current_child].day_3 = $('#chkbox_day_3').prop("checked") ? 1 : 0;
	param.contracts[current_child].day_4 = $('#chkbox_day_4').prop("checked") ? 1 : 0;
	param.contracts[current_child].day_5 = $('#chkbox_day_5').prop("checked") ? 1 : 0;
	param.contracts[current_child].day_6 = $('#chkbox_day_6').prop("checked") ? 1 : 0;
	param.contracts[current_child].day_7 = $('#chkbox_day_7').prop("checked") ? 1 : 0;
	param.contracts[current_child].holiday_flg = $('#chkbox_holiday_'+cource.childcare_system_type).prop("checked") ? 1 : 0;
	setItem_mpack_simulation_contracts(param);

	if ((current_child+1)<rsp.children.length) {
		current_child++;
		$('#current_child').html(current_child);
		Set_children(rsp, param);
		$(window).scrollTop();
		return;
	}

	var sendJsonStr = JSON.parse(window.sessionStorage.getItem('mpack_simulation_contracts'));
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;

	$(".loader-wrap").css("display","block");
	$.ajax({
		type: "POST",
		url:urlDomain + 'popo_mypage_apls/mpack_estimate_simulation_submit', 
		//contentType: "application/json",
		data: sendJsonStr,
		timeout: 30000,
		success: function (data) {
			$(".loader-wrap").css("display","none");
			var resultData = JSON.parse(data);
			if (!resultData.is_error) {
				// 成功時
				window.sessionStorage.setItem('mpack_estimate_simulation_submit_rsp', JSON.stringify(resultData.response.html));
				window.location.href='./estimate_simulation_result.html';
			}
			else {
				// エラー時
				navigator.notification.alert(
					resultData.error_message,
						function(){
							window.location.href="index.html";
						},
						'エラー',
						'OK'
				);
			}
		},
		error: function (xhr) {
			$(".loader-wrap").css("display","none");
			navigator.notification.alert(
				'通信に失敗しました。インターネット環境を確認してください。',  // message
					function(){
						$(".loader-wrap").css("display","none");
					},
					'警告',
					'OK'
			);
		}
	});
}

// [シミュレーションを中止]クリック
function btn_abort_click()
{
	// ポップアップ表示中は無視
	if ($('#popup').css('display')!='none')	return false;

	navigator.notification.confirm(
	    	'入力を破棄してメニューに戻りますか？',
	    	function(buttonIndex){
					if(buttonIndex==1){
						window.location.href="contract_menu.html";
					}
	    	},
	    	'確認',
	    	'はい,いいえ'
		);
}

function question1_click()
{
	// ポップアップ表示中は無視
	if ($('#popup').css('display')!='none')	return false;

	question_disp('cource_type');
}

function question2_click()
{
	// ポップアップ表示中は無視
	if ($('#popup').css('display')!='none')	return false;

	question_disp('childcare_plan_type');
}
