/*
 *
 * 会員情報閲覧・更新画面
 *
 */
$(function () {
	//「年」「月」「日」の選択肢を生成
	createYearSelect();
	createMonthSelect();
	createDaySelect();

	document.addEventListener("DOMContentLoaded", function () {
		getdata();
	});

	document.addEventListener('deviceready', function () {
		// Androidの戻るボタン無効化
		document.addEventListener("backbutton", function () { return false; }, false);
	}, false);

	var arg = new Object;
	url = location.search.substring(1).split('&');

	for (i = 0; url[i]; i++) {
		var k = url[i].split('=');
		arg[k[0]] = k[1];
	}

	tabCntrol(arg);
	getInitData(arg);

	$('#userTabLabel').click();
	$('#haigushaNasiBtn').click(function () { haigushaNasi(); });
	$('#clinicNasiBtn').click(function () { clinicNasi(); });
	$('#insuranceNasiBtn').click(function () { insuranceNasi(); });
	$('#chronicNasiBtn').click(function () { chronicNasi(); });
	$('#allergyNasiBtn').click(function () { allergyNasi(); });
	$("#registChildImgStart").click(function () { openChildImgRegistDialog(); });
	$('.cancelUserInfoBtn').click(function () { cancel($(this)); })
	$('.postalButton').click(function () { getAddress(); });
	$('#childImgSelectComplete').click(function () { registChildImageFile(); });

	$('body').on('click', '.beforeBirth', function () { beforeBirth($(this)); });

	// 基本情報登録
	$('#userRegistBtn').click(function () { userInfoRegist('basic'); });
	// 園児情報登録
	$('#childRegistBtn').click(function () { userInfoRegist('child'); });
	// 詳細情報登録
	$('#detailRegistBtn').click(function () { userInfoRegist('detail'); });
	// 家族情報登録
	$('#familyRegistBtn').click(function () { userInfoRegist('family'); });

	$('#mobileNasiBtn').click(function () {
		$('#mobile').val('不所持');
	});

	$('#homeTelNasiBtn').click(function () {
		$('#tel').val('自宅電話なし');
	});

	$('body').on('click', '.vaccinationNasiBtn', function () {
		vaccinationNasi($(this));
	});

	$('body').on('click', '.radioInput', function () {
		manageBloodType($(this));
	});

	$('body').on('click', '.preIllnessDateBtn', function () {
		openCommonCalendarDialog($(this));
	});

	$('body').on('click', '.pINasiOtherBtn', function () {
		pIOtherNasi($(this));
	});
	$('body').on('click', '.pINasiBtn', function () {
		pINasi($(this));
	});
	$('body').on('click', '.pIOtherNasiBtn', function () {
		pIOtherNasi($(this));
	});

	$('#fatherNasiBtn').click(function () { fatherNasi(); });
	$('#motherNasiBtn').click(function () { motherNasi(); });

	$.datepicker.setDefaults({
		dateFormat: 'yy/mm/dd',
		changeYear: true,
		changeMonth: true,
		buttonText: "",
		closeText: '閉じる',
		currentText: '今日',
		monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
		dayNamesMin: ['日', '月', '火', '水', '木', '金', '土'],
		yearSuffix: '年',
		firstDay: 0
	});
});

const modifiedDic = {
	basic: ""
	, child: ""
	, detail: ""
	, family: ""
	, chdPI: { other: "" }
	, chdVacci: {}
};

const modelToIdDic = {
	"UserFamily.name": "family_name",
	"Child.name": "child_name",
	"Child.name_kana": "child_name_kana",
	"Child.birthday": "child_birthday",
};

const maxLengthCheck = {
	name: { key: "User.name", max: 255 },
	name_kana: { key: "User.name_kana", max: 255 },
	mail: { key: "User.mail", max: 255 },
	pc_mail: { key: "User.pc_mail", max: 255 },
	address_1: { key: "User.address_1", max: 255 },
	address_2: { key: "User.address_2", max: 255 },

	partner_name: { key: "UserOtherInfo.partner_name", max: 255 },
	partner_mobile: { key: "UserOtherInfo.partner_mobile", max: 255 },

	job_name_1: { key: "UserOtherInfo.job_name_1", max: 255 },
	job_address_1: { key: "UserOtherInfo.job_address_1", max: 255 },
	job_post_1: { key: "UserOtherInfo.job_post_1", max: 255 },
	job_name_2: { key: "UserOtherInfo.job_name_2", max: 255 },
	job_address_2: { key: "UserOtherInfo.job_address_2", max: 255 },
	job_post_2: { key: "UserOtherInfo.job_post_2", max: 255 },

	home_name: { key: "UserOtherInfo.home_name", max: 255 },
	home_address: { key: "UserOtherInfo.home_address", max: 255 },
	proxy_name: { key: "UserOtherInfo.proxy_name", max: 255 },
	proxy_relation: { key: "UserOtherInfo.proxy_relation", max: 255 },

	child_name: { key: "Child.name", max: 255 },
	child_name_kana: { key: "Child.name_kana", max: 255 },
	child_nick_name: { key: "Child.nick_name", max: 255 },
	clinic_name: { key: "Child.clinic_name", max: 255 },
	insurance_no: { key: "Child.insurance_no", max: 255 },
	insurance_name: { key: "Child.insurance_name", max: 255 },
	insurance_sign: { key: "Child.insurance_sign", max: 255 },
	school_name: { key: "Child.school_name", max: 255 },
	school_class_name: { key: "Child.school_class_name", max: 255 },
	school_charge: { key: "Child.school_charge", max: 255 },

	children_other_textarea: { key: "Child.previous_illness_other", max: 255 },
	chronic: { key: "Child.chronic", max: 255 },
	allergy: { key: "Child.allergy", max: 255 },

	family_name: { key: "Child.name", max: 255 },
	family_relation: { key: "Child.family_relation", max: 255 },
};

// 画面遷移
function change_location(adr) {
	window.location.href = adr;
}

function pIOtherNasi(obj) {
	if (obj.val() == 'なし') {
		obj.val('クリア');
		$('#children_other_textarea').val('なし');
	}
	else {
		$(obj).val('なし');
		$('#children_other_textarea').val('');
	}
}

function pINasi(obj) {
	wkArr = obj.attr("id").split('_');
	dateId = wkArr[0] + '_date_' + wkArr[2];
	if (obj.val() == 'なし') {
		obj.val('クリア');
		$("#" + dateId).val('なし');
	}
	else {
		obj.val('なし');
		$("#" + dateId).val('');
	}
}

function vaccinationNasi(obj) {
	var wkId = "children_" + obj.attr("id").split('_')[1] + "_vaccination_status";
	$.each($('.vaccinationSelect'), function (index, value) {
		if (wkId == value.id) {
			if ($(obj).val() == 'なし') {
				$(obj).val('クリア');
				$(value).val('9');
			}
			else {
				$(obj).val('なし');
				$(value).val('');
			}
		}
	});
}

function tabCntrol(arg) {
	$('.cp_actab-content.update').css('display', 'block');
	if (arg.info == 'basic') {
		$('#basicTabLabel').css('display', 'block');
		$('#tab-basic').prop('checked', true);
		$('#tab-basic').prop('disabled', 'disabled');
	}
	else if (arg.info == 'child') {
		$('#childTabLabel').css('display', 'block');
		$('#tab-child').prop('checked', true);
		$('#tab-child').prop('disabled', 'disabled');
	}
	else if (arg.info == 'detail') {
		$('#detailTabLabel').css('display', 'block');
		$('#tab-detail').prop('checked', true);
		$('#tab-detail').prop('disabled', 'disabled');
	}
	else if (arg.info == 'family') {
		$('#familyTabLabel').css('display', 'block');
		$('#tab-family').prop('checked', true);
		$('#tab-family').prop('disabled', 'disabled');
	}
}

// 編集画面初期表示時データ取得
function getInitData(arg) {
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;
	sendJsonStr.info = arg.info;
	sendJsonStr.mode = arg.mode;
	sendJsonStr.child_id = arg.child_id;
	sendJsonStr.family_id = arg.family_id;

	$.ajax({
		type: "POST",
		url: urlDomain + 'popo_mypage_apls/member_info_regist_select',
		data: sendJsonStr,
		timeout: 30000,
		success: function (data) {
			var resultData = JSON.parse(data);
			if (!resultData.is_error) {
				// 成功時
				$('#popup').css('display', 'block');
				set_info(resultData.response);
				$(".loader-wrap").css("display", "none");
				$('.registUserInfoBtn').prop('disabled', false);
				$('.cancelUserInfoBtn').prop('disabled', false);
			}
			else {
				// エラー時
				navigator.notification.alert(
					resultData.error_message,
					function () {
						change_location('member_info_view.html' + '?info=' + arg.info);
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
				function () {
					$(".loader-wrap").css("display", "none");
				},
				'警告',
				'OK'
			);
		}
	});
}

// 編集画面　更新処理
function userInfoRegist(info) {
	performance.mark('userInfoRegistStart');

	$('.registUserInfoBtn').prop('disabled', 'true');
	$('.cancelUserInfoBtn').prop('disabled', 'true');

	// 前回validateエラーを削除
	$('.invalid').text('');
	$.each($('.validateError'), function (index, value) {
		$(value).removeClass('validateError');

	});
	$.each($('.validateErrorBox'), function (index, value) {
		$(value).removeClass('validateErrorBox');
	});
	$.each($('fieldset'), function (index, value) {
		$(value).removeClass('validateErrorBox');
		$(value).addClass('beforeValidate');
	});
	noneAlertText();

	var maxCheckFlg = false;

	for (var elm in maxLengthCheck) {
		maxlength = maxLengthCheck[elm].max;
		if ($('#' + elm).length == 1) {
			strlength = $('#' + elm).val().length;
			if (maxlength < strlength) {
				var wkStr = $('#' + elm).val().slice(0, maxlength - strlength);
				$('#' + elm).val(wkStr);
			}
		}
	}

	// radio未選択
	var checkFlg = false;
	if (info === 'basic') {
		if ($('#posttal_dm>[name="yubindm"]:checked').length == 0) {
			$('.sousinsakiaddress_caution_text').html('必須入力です。');
			$('#dest_address').addClass('validateErrorBox');
			$('#dest_address').removeClass('beforeValidate');
			checkFlg = true;
		}
		if ($('#dest_address>[name="sousinsakiaddress"]:checked').length == 0) {
			$('.postaldm_caution_text').html('必須入力です。');
			$('#posttal_dm').addClass('validateErrorBox');
			$('#posttal_dm').removeClass('beforeValidate');
			checkFlg = true;
		}
	}

	if (info === 'child') {
		if ($('#sex_type_id>[name="gender"]:checked').length == 0) {
			$('.sex_type_id_caution_text').html('必須入力です。');
			$('#sex_type_id').addClass('validateErrorBox');
			$('#sex_type_id').removeClass('beforeValidate');
			checkFlg = true;
		}
		else {
			$('#sex_type_id').addClass('beforeValidate');
		}
	}

	if (info === 'family') {
		if ($('#family_gender>[name="gender"]:checked').length == 0) {
			$('.family_gender_caution_text').html('必須入力です。');
			$('#family_gender').addClass('validateErrorBox');
			$('#family_gender').removeClass('beforeValidate');
			checkFlg = true;
		}
		else {
			$('#family_gender').addClass('beforeValidate');
		}
		if ($('#family_birthday_year').val() == ''
			|| $('#family_birthday_month').val() == ''
			|| $('#family_birthday_day').val() == '') {
			$('.family_birthday_caution_text').html('不正な日付です。');
			$('#family_birthday').addClass('validateErrorBox');
			$('#family_birthday').removeClass('beforeValidate');
			checkFlg = true;
		}
		else {
			$('#family_birthday').addClass('beforeValidate');
		}
	}

	if (checkFlg) {
		alertText();
		$('.registUserInfoBtn').prop('disabled', false);
		$('.cancelUserInfoBtn').prop('disabled', false);
		return false;
	}

	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;
	sendJsonStr.info = info;

	if (info == 'child' && $.trim($('#child_id').val()) == '') {
		sendJsonStr.mode = 'insert';
		sendJsonStr.child_id = '';
	}
	else if (info == 'family' && $.trim($('#family_id').val()) == '') {
		sendJsonStr.mode = 'insert';
		sendJsonStr.family_id = '';
	}
	else {
		sendJsonStr.mode = 'update';
		sendJsonStr.child_id = $('#child_id').val();
		sendJsonStr.family_id = $('#family_id').val();
	}

	sendJsonStr.data = {};

	// 更新項目を設定
	var afterUdateParrameter;
	if (info === 'basic') {
		afterUdateParrameter = '?info=kihon'
		sendJsonStr.data["user_id"] = $('#user_id').text();
		sendJsonStr.data["name"] = $('#name').val();
		sendJsonStr.data["name_kana"] = $('#name_kana').val();

		sendJsonStr.data["partner_name"] = $('#partner_name').val();
		if ($('#partner_birthday_year').val() != ''
			&& $('#partner_birthday_month').val() != ''
			&& $('#partner_birthday_day').val() != ''
		) {
			sendJsonStr.data["partner_birthday"] = zeroPadding($('#partner_birthday_year').val(), 4, "0")
				+ '-' + zeroPadding($('#partner_birthday_month').val(), 2, "0")
				+ '-' + zeroPadding($('#partner_birthday_day').val(), 2, "0");
		}
		else {
			sendJsonStr.data["partner_birthday"] = '';
		}
		sendJsonStr.data["partner_mobile"] = $('#partner_mobile').val();

		sendJsonStr.data["zip"] = $('#zip').val();
		sendJsonStr.data["address_1"] = $('#address_1').val();
		sendJsonStr.data["address_2"] = $('#address_2').val();

		sendJsonStr.data["mobile"] = $('#mobile').val();
		sendJsonStr.data["tel"] = $('#tel').val();
		sendJsonStr.data["mail"] = $('#mail').val();
		sendJsonStr.data["pc_mail"] = $('#pc_mail').val();

		sendJsonStr.data["dm_type_id"] = $('[name="yubindm"]:checked').val();
		sendJsonStr.data["send_mail_type_id"] = $('[name="sousinsakiaddress"]:checked').val();
	}
	else if (info === 'child') {
		afterUdateParrameter = '?info=enji'
		sendJsonStr.data["antenatal_flg"] = $(beforBirth).is(':checked') ? 1 : 0;
		sendJsonStr.data["name"] = $('#child_name').val();
		sendJsonStr.data["name_kana"] = $('#child_name_kana').val();
		sendJsonStr.data["sex_type_id"] = $('[name="gender"]:checked').val();
		sendJsonStr.data["nick_name"] = $('#child_nick_name').val();

		if ($('#child_birthday_year').val() != ''
			&& $('#child_birthday_month').val() != ''
			&& $('#child_birthday_day').val() != ''
		) {
			sendJsonStr.data["birthday"] = zeroPadding($('#child_birthday_year').val(), 4, "0")
				+ '-' + zeroPadding($('#child_birthday_month').val(), 2, "0")
				+ '-' + zeroPadding($('#child_birthday_day').val(), 2, "0");
		}
		else {
			sendJsonStr.data["birthday"] = '';
		}

		sendJsonStr.data["blood_type_id"] = $('[name="child_blood"]:checked').val();
		sendJsonStr.data["blood_rh_type_id"] = $('[name="child_bloodRh"]:checked').val();
		sendJsonStr.data["clinic_name"] = $('#clinic_name').val();
		sendJsonStr.data["clinic_tel"] = $('#clinic_tel').val();
		sendJsonStr.data["insurance_type_id"] = $('#InsuranceType').val();
		sendJsonStr.data["insurance_sign"] = $('#insurance_sign').val();
		sendJsonStr.data["insurance_no"] = $('#insurance_no').val();
		sendJsonStr.data["insurance_name"] = $('#insurance_name').val();
		sendJsonStr.data["school_name"] = $('#school_name').val();
		sendJsonStr.data["school_tel"] = $('#school_tel').val();
		sendJsonStr.data["school_class_name"] = $('#school_class_name').val();
		sendJsonStr.data["school_charge"] = $('#school_charge').val();

		previoutIllnessArray = {};
		$(".preIllnessDate").each(function (index, elm) {
			wkId = elm.id.split('_');
			var arr = {};
			arr.id = index + 1;
			if ($('#' + wkId[0] + '_date_' + wkId[2]).prop('disabled')) {
				// 表示されている場合の処理
				if ($('#' + wkId[0] + '_text_' + wkId[2]).val() == 'なし') {
					arr.date = '9999-12-31';
				}
				else {
					arr.date = $('#' + wkId[0] + '_text_' + wkId[2]).val();
				}
			}
			else {
				// 非表示の場合の処理
				arr.date = elm.value;
			}

			previoutIllnessArray[index] = arr;
		});
		sendJsonStr.data["previousIllness"] = previoutIllnessArray;
		sendJsonStr.data["previousIllness_other"] = $('#children_other_textarea').val();

		vaccinationSelectArray = {};
		$(".vaccinationSelect").each(function (index, elm) {
			var arr = {};
			arr.id = index + 1;
			arr.date = elm.value;
			vaccinationSelectArray[index] = arr;
		});
		sendJsonStr.data["vaccination"] = vaccinationSelectArray;

		sendJsonStr.data["chronic"] = $('#chronic').val();
		sendJsonStr.data["allergy"] = $('#allergy').val();

	}
	else if (info === 'detail') {
		afterUdateParrameter = '?info=hogosha'
		sendJsonStr.data["job_name_1"] = $('#job_name_1').val();
		sendJsonStr.data["job_address_1"] = $('#job_address_1').val();
		sendJsonStr.data["job_post_1"] = $('#job_post_1').val();
		sendJsonStr.data["job_tel_1"] = $('#job_tel_1').val();
		sendJsonStr.data["job_name_2"] = $('#job_name_2').val();
		sendJsonStr.data["job_address_2"] = $('#job_address_2').val();
		sendJsonStr.data["job_post_2"] = $('#job_post_2').val();
		sendJsonStr.data["job_tel_2"] = $('#job_tel_2').val();
		sendJsonStr.data["home_name"] = $('#home_name').val();
		sendJsonStr.data["home_address"] = $('#home_address').val();
		sendJsonStr.data["home_tel"] = $('#home_tel').val();
		sendJsonStr.data["proxy_name"] = $('#proxy_name').val();
		sendJsonStr.data["proxy_relation"] = $('#proxy_relation').val();
		sendJsonStr.data["proxy_tel"] = $('#proxy_tel').val();

		sendJsonStr.data["urgent_contact_type1"] = $('[name=urgent_contact_type1]').val();
		sendJsonStr.data["urgent_contact_type2"] = $('[name=urgent_contact_type2]').val();
		sendJsonStr.data["urgent_contact_type3"] = $('[name=urgent_contact_type3]').val();
		sendJsonStr.data["urgent_contact_type4"] = $('[name=urgent_contact_type4]').val();
		sendJsonStr.data["urgent_contact_type5"] = $('[name=urgent_contact_type5]').val();
		sendJsonStr.data["urgent_contact_type6"] = $('[name=urgent_contact_type6]').val();
		sendJsonStr.data["urgent_contact_type7"] = $('[name=urgent_contact_type7]').val();
	}
	else if (info === 'family') {
		afterUdateParrameter = '?info=kazoku'
		sendJsonStr.data["family_name"] = $('#family_name').val();
		sendJsonStr.data["sex_type_id"] = $('[name="gender"]:checked').val();

		if ($('#family_birthday_year').val() != ''
			&& $('#family_birthday_month').val() != ''
			&& $('#family_birthday_day').val() != ''
		) {
			sendJsonStr.data["family_birthday"] = zeroPadding($('#family_birthday_year').val(), 4, "0")
				+ '-' + zeroPadding($('#family_birthday_month').val(), 2, "0")
				+ '-' + zeroPadding($('#family_birthday_day').val(), 2, "0");
		}
		else {
			sendJsonStr.data["family_birthday"] = '';
		}

		sendJsonStr.data["family_relation"] = $('#family_relation').val();
	}

	performance.mark('userInfoRegistAjaxStart');

	$(".loader-wrap").css("display", "block");

	$.ajax({
		type: "POST",
		url: urlDomain + 'popo_mypage_apls/member_info_regist_update',
		data: sendJsonStr,
		timeout: 10000,
		success: function (data) {
			$(".loader-wrap").css("display", "none");
			performance.mark('userInfoRegistAjaxEnd');
			var resultData = JSON.parse(data);

			if (!resultData.is_error) {
				if ('validate' in resultData.response) {
					var vObj = resultData.response.validate;
					for (var model in vObj) {
						var tbl = vObj[model];
						for (var col in tbl) {
							var key = getColumnDic(col, model)
							$('.' + key + '_caution_text').html(tbl[col]);
							$('#' + key).addClass('validateError');
						}
					}
					alertText();
				}
				else {
					performance.mark('userInfoRegistEnd');
					performance.measure(
						'userInfoRegist',
						'userInfoRegistStart',
						'userInfoRegistEnd'
					);
					performance.measure(
						'userInfoRegistAjax',
						'userInfoRegistAjaxStart',
						'userInfoRegistAjaxEnd'
					);

					const results = performance.getEntriesByName('userInfoRegist');
					console.log(results[0]);
					const results2 = performance.getEntriesByName('userInfoRegistAjax');

					navigator.notification.alert(
						'登録が完了しました。',
						function () { change_location('member_info_view.html' + afterUdateParrameter); },
						'確認',
						'OK'
					);

					if (info === 'basic') {
						window.sessionStorage.setItem('member_name', $('#name').val());
					}
				}
				$('.registUserInfoBtn').prop('disabled', false);
				$('.cancelUserInfoBtn').prop('disabled', false);
			} else {
				// 登録失敗
				navigator.notification.alert(
					'登録に失敗しました。',
					function () { $(".loader-wrap").css("display", "none"); },
					'警告',
					'OK'
				);
			}
		},
		error: function (xhr) {
			$(".loader-wrap").css("display", "none");
			navigator.notification.alert(
				'通信に失敗しました。電波状況の良いところでもう一度お試しください。',
				function () { $(".loader-wrap").css("display", "none"); },
				'警告',
				'OK'
			);
		}
	});
}

// データ取得後の初期表示処理
function set_info(res) {
	$('#office_id').val(setValue(res.user_info.office_id));
	if (res.info === 'basic') {
		// 会員基本情報
		$('#user_id').text(res.user_info.id);
		$('#name').val(res.user_info.name);
		$('#name_kana').val(res.user_info.name_kana);
		$('#birthday').text(setDate(res.user_info.birthday));
		$('#identificationType').text(setSelectBoxValue(res.constant.identification_types[res.user_info.identification_type_id]));
		$('#partner_name').val(res.other_info.partner_name);

		if (res.other_info.partner_birthday !== undefined
			&& res.other_info.partner_birthday !== null
			&& res.other_info.partner_birthday.length !== 0) {
			$("#partner_birthday_year").val(res.other_info.partner_birthday.substring(0, 4));
			$("#partner_birthday_month").val(suppressZero(res.other_info.partner_birthday.substring(5, 7)));
			$("#partner_birthday_day").val(suppressZero(res.other_info.partner_birthday.substring(8, 10)));
		}
		$('#partner_mobile').val(res.other_info.partner_mobile);

		$('#zip').val(res.user_info.zip);
		$('#address_1').val(res.user_info.address_1);
		$('#address_2').val(res.user_info.address_2);

		$('#mobile').val(res.user_info.mobile);
		$('#tel').val(res.user_info.tel);
		$('#mail').val(res.user_info.mail);
		$('#pc_mail').val(res.user_info.pc_mail);

		$("input[name=yubindm][value='" + res.user_info.dm_type_id + "']").prop("checked", true);
		$("input[name=sousinsakiaddress][value='" + res.user_info.send_mail_type_id + "']").prop("checked", true);

		modifiedDic.basic = res.user_info.modified;

	}
	else if (res.info === 'child') {
		// セレクトBOX生成
		createSelect(res.constant.InsuranceType, $('#InsuranceType'));
		createIllness(res.constant.PreviousIllnessType, $('#previousIllnessTarget'));
		createVaccination(res.constant.VaccinationType, $('#childrenVaccinationTarget'));
		createVaccinationSelect(res.constant);
		createBlood(res.constant.blood_type, $('#blood_type_id'));
		createBloodRh(res.constant.blood_rh_type, $('#blood_rh_type_id'));
		createGender(res.constant.sex_type, $('#sex_type_id'));

		// 新規追加時は設定しない
		if (res.mode == 'update') {
			$('#child_id').val(res.child.id);
			$('input[name="beforeBirthCheckBox"]').prop('checked', res.child.antenatal_flg == 1 ? true : false);
			$('#child_name').val(res.child.name);
			$('#child_name_kana').val(res.child.name_kana);

			$("input[name=gender][value='" + res.child.sex_type_id + "']").prop("checked", true);
			$('#child_nick_name').val(res.child.nick_name);

			if (res.child.birthday !== undefined
				&& res.child.birthday !== null
				&& res.child.birthday.length !== 0) {
				$("#child_birthday_year").val(res.child.birthday.substring(0, 4));
				$("#child_birthday_month").val(suppressZero(res.child.birthday.substring(5, 7)));
				$("#child_birthday_day").val(suppressZero(res.child.birthday.substring(8, 10)));
			}
			$("input[name=child_blood][value='" + res.child.blood_type_id + "']").prop("checked", true);
			$("input[name=child_bloodRh][value='" + res.child.blood_rh_type_id + "']").prop("checked", true);

			$('#clinic_name').val(res.child.clinic_name);
			$('#clinic_tel').val(res.child.clinic_tel);

			$('#InsuranceType').val(setSelectBoxValue(res.child.insurance_type_id));
			$('#insurance_sign').val(res.child.insurance_sign);
			$('#insurance_no').val(res.child.insurance_no);
			$('#insurance_name').val(res.child.insurance_name);
			$('#school_name').val(res.child.school_name);
			$('#school_tel').val(res.child.school_tel);
			$('#school_class_name').val(res.child.school_class_name);
			$('#school_charge').val(res.child.school_charge);

			$.each($('.preIllnessDate'), function (index, value) {
				wkid = value.id.split('_');
				for (var key in res.ChildrenPreviousIllness) {
					if (res.ChildrenPreviousIllness[key].previous_illness_type_id == wkid[2]) {
						if (res.ChildrenPreviousIllness[key].previous_illness_date == '9999-12-31') {
							$(value).attr("value", "なし");
						}
						else {
							$(value).attr("value", res.ChildrenPreviousIllness[key].previous_illness_date);
						}
						modifiedDic.chdPI[index] = res.ChildrenPreviousIllness[key].modified;
						break;
					}
				}
			});
			$.each($('.vaccinationNasiBtn'), function (index, value) {
				wkId = value.id.split('_');
				for (var key in res.ChildrenVaccination) {
					if (res.ChildrenVaccination[key].vaccination_type_id == wkId[1]) {
						$('#children_' + res.ChildrenVaccination[key].vaccination_type_id + '_vaccination_status').val(setSelectBoxValue(res.ChildrenVaccination[key].vaccination_status_type_id));
						modifiedDic.chdVacci[index] = res.ChildrenVaccination[index].modified;
					}
				}
			});
			$('#chronic').val(res.child.chronic);
			$('#allergy').val(res.child.allergy);
			$('#children_other_textarea').val(res.child.previous_illness_other);
			modifiedDic.child = res.child.modified;
		}
		else {
			// 新規追加時だけの処理
			$('#childTabLabel span').text('園児情報の追加');
		}

		// 新規・更新ともに既往症日付boxはdatepickerを有効にする
		$.each($('.preIllnessDate'), function (index, value) {
			$(value).datepicker();
		});
	}
	else if (res.info === 'detail') {
		// 会員詳細情報
		// セレクトBOX生成
		$.each($('.urgentContact'), function (index, value) {
			createSelect(res.constant.urgent_contact_types, $(value));
		});

		$('#job_name_1').val(res.other_info.job_name_1);
		$('#job_address_1').val(res.other_info.job_address_1);
		$('#job_post_1').val(res.other_info.job_post_1);
		$('#job_tel_1').val(res.other_info.job_tel_1);

		$('#job_name_2').val(res.other_info.job_name_2);
		$('#job_address_2').val(res.other_info.job_address_2);
		$('#job_post_2').val(res.other_info.job_post_2);
		$('#job_tel_2').val(res.other_info.job_tel_2);

		$('#home_name').val(res.other_info.home_name);
		$('#home_address').val(res.other_info.home_address);
		$('#home_tel').val(res.other_info.home_tel);

		$('#proxy_name').val(res.other_info.proxy_name);
		$('#proxy_relation').val(res.other_info.proxy_relation);
		$('#proxy_tel').val(res.other_info.proxy_tel);

		$('#UrgentContactType1').val(setSelectBoxValue(res.other_info.urgent_contact_type_id_1));
		$('#UrgentContactType2').val(setSelectBoxValue(res.other_info.urgent_contact_type_id_2));
		$('#UrgentContactType3').val(setSelectBoxValue(res.other_info.urgent_contact_type_id_3));
		$('#UrgentContactType4').val(setSelectBoxValue(res.other_info.urgent_contact_type_id_4));
		$('#UrgentContactType5').val(setSelectBoxValue(res.other_info.urgent_contact_type_id_5));
		$('#UrgentContactType6').val(setSelectBoxValue(res.other_info.urgent_contact_type_id_6));
		$('#UrgentContactType7').val(setSelectBoxValue(res.other_info.urgent_contact_type_id_7));
		modifiedDic.detail = res.other_info.modified;
	}
	else if (res.info === 'family') {
		// セレクトBOX生成
		createGender(res.constant.sex_type, $('#family_gender'));

		// 新規追加時は設定しない
		if (res.mode == 'update') {
			$('#family_id').val(res.family_id);
			$('#family_name').val(res.user_family_info.name);
			//TODO ラジオだけど値なかったら？？
			$("input[name=gender][value='" + res.user_family_info.sex_type_id + "']").prop("checked", true);
			$('#family_relation').val(res.user_family_info.family_relation);
			if (res.user_family_info.birthday !== undefined
				&& res.user_family_info.birthday !== null
				&& res.user_family_info.birthday.length !== 0) {
				$("#family_birthday_year").val(res.user_family_info.birthday.substring(0, 4));
				$("#family_birthday_month").val(suppressZero(res.user_family_info.birthday.substring(5, 7)));
				$("#family_birthday_day").val(suppressZero(res.user_family_info.birthday.substring(8, 10)));
			}
			modifiedDic.family = res.user_family_info.modified;
		}
		else {
			$('#familyTabLabel span').text('家族情報の追加');
		}
	}
}

/* 部品生成 */
// 配列、セレクトボックスのidから要素を作成する
function createSelect(arr, selectbox) {
	$.each(arr, function (index, value) {
		selectbox.append($('<option>').html(value).val(index));
	})
}

// 既往症セレクトボックス生成
function createIllness(arr, id) {
	$.each(arr, function (index, value) {
		$('#previousIllnessTarget').append($('<tr><td ><div class="subTitleCell">' + value + '</div></td><td><input id=previousIllness_nasi_' + index + '  type="button" class="nasiBtn pINasiBtn" value="なし"></td><td><input type="text" readonly class="inputBox preIllnessDate" id="previousIllness_date_' + index + '"></td></tr>'));
	});
	id.append($('<tr><td><div class="subTitleCell">その他</div></td><td><input id="previousIllnessNasi_other"  type="button" class="nasiBtn pIOtherNasiBtn" value="なし"></td><td></td><tr><td colspan=3><textarea class="inputBox" id="children_other_textarea" rows="3" cols="40"></textarea></td>'));
}

// 予防接種セレクトボックス生成
function createVaccination(arr, id) {
	$.each(arr, function (index, value) {
		id.append($('<tr><td nowrap><div class="subTitleCell">' + value + '</td><td><input id="vaccinationNasi_' + index + '"  type="button" class="nasiBtn vaccinationNasiBtn" value="なし"></td><td><select class="vaccinationSelect" id="children_' + index + '_vaccination_status"><option value></option></select></td>'));
	});
}
//　予防接種セレクトボックス生成後に、条件に応じて異なる要素を設定する
function createVaccinationSelect(constants) {
	$.each(constants.VaccinationTypeRelation, function (index, value) {
		createSelect(constants['ext_' + value], $('#children_' + index + '_vaccination_status'));
	});
}

// 血液型セレクトボックス生成
function createBlood(arr, id) {
	$.each(arr, function (index, value) {
		id.append($('<input type = "radio" name = "child_blood" class="radioInput" value = "' + index + '" id="blood_' + index + '">'));
		id.append($('<label for="blood_' + index + '" class="radioLabel radioLabelBlood" class="blood_label' + index + '_id">' + value + '</label>'));
	});
}

// 血液RH型セレクトボックス生成
function createBloodRh(arr, id) {
	$.each(arr, function (index, value) {
		id.append($('<input type="radio" name="child_bloodRh" value=' + index + ' id="bloodrh_' + index + '">'));
		id.append($('<label for="bloodrh_' + index + '" class="radioLabel radioLabelRh" id="bloodrh_label' + index + '">' + value + '</label>'));
	});
}

// 性別セレクトボックス生成
function createGender(arr, id) {
	$.each(arr, function (index, value) {
		id.append($('<input type="radio" name="gender" value="' + index + '" id="gender_' + index + '">'));
		id.append($('<label for="gender_' + index + '" class="radioLabel radioLabelSeibetsu ">' + value + '</label>'));
	});
}

/* イベント */
// 血液型不明が選択されている場合はRHも不明とする
function manageBloodType(obj) {
	if (obj.attr("id") == 'blood_5') {
		$("input[name=child_bloodRh][id='bloodrh_3']").prop("checked", true);
	}
}

// 配偶者なし押下
function haigushaNasi() {
	if ($('#haigushaNasiBtn').val() == 'なし') {
		$('#partner_name').val('なし');
		$('#partner_birthday_year').val('');
		$('#partner_birthday_month').val('');
		$('#partner_birthday_day').val('');
		$('#partner_mobile').val('なし');

		$('#partner_name').attr('disabled', true);
		$('#partner_birthday_year').attr('disabled', true);
		$('#partner_birthday_month').attr('disabled', true);
		$('#partner_birthday_day').attr('disabled', true);
		$('#partner_mobile').attr('disabled', true);

		$('#partner_name').addClass('disabled_input');
		$('#partner_birthday_year').addClass('disabled_input');
		$('#partner_birthday_month').addClass('disabled_input');
		$('#partner_birthday_day').addClass('disabled_input');
		$('#partner_mobile').addClass('disabled_input');

		$('#haigushaNasiBtn').val('クリア');

	}
	else if ($('#haigushaNasiBtn').val() == 'クリア') {
		$('#partner_name').val('');
		$('#partner_birthday_year').val('');
		$('#partner_birthday_month').val('');
		$('#partner_birthday_day').val('');
		$('#partner_mobile').val('');

		$('#partner_name').attr('disabled', false);
		$('#partner_birthday_year').attr('disabled', false);
		$('#partner_birthday_month').attr('disabled', false);
		$('#partner_birthday_day').attr('disabled', false);
		$('#partner_mobile').attr('disabled', false);

		$('#partner_name').removeClass('disabled_input');
		$('#partner_birthday_year').removeClass('disabled_input');
		$('#partner_birthday_month').removeClass('disabled_input');
		$('#partner_birthday_day').removeClass('disabled_input');
		$('#partner_mobile').removeClass('disabled_input');

		$('#haigushaNasiBtn').val('なし');
	}
}

// 掛かり付け医なし押下
function clinicNasi() {
	if ($('#clinicNasiBtn').val() == 'なし') {
		$('#clinic_name').val('なし');
		$('#clinic_tel').val('なし');

		$('#clinic_name').attr('disabled', true);
		$('#clinic_tel').attr('disabled', true);

		$('#clinic_name').addClass('disabled_input');
		$('#clinic_tel').addClass('disabled_input');

		$('#clinicNasiBtn').val('クリア');

	}
	else if ($('#clinicNasiBtn').val() == 'クリア') {
		$('#clinic_name').val('');
		$('#clinic_tel').val('');

		$('#clinic_name').attr('disabled', false);
		$('#clinic_tel').attr('disabled', false);

		$('#clinic_name').removeClass('disabled_input');
		$('#clinic_tel').removeClass('disabled_input');

		$('#clinicNasiBtn').val('なし');
	}
}

// 保険証なし押下
function insuranceNasi() {
	if ($('#insuranceNasiBtn').val() == 'なし') {
		$('#InsuranceType').val(7);
		$('#insurance_sign').val('なし');
		$('#insurance_no').val('なし');
		$('#insurance_name').val('なし');

		$('#InsuranceType').attr('disabled', true);
		$('#insurance_sign').attr('disabled', true);
		$('#insurance_no').attr('disabled', true);
		$('#insurance_name').attr('disabled', true);

		$('#InsuranceType').addClass('disabled_input');
		$('#insurance_sign').addClass('disabled_input');
		$('#insurance_no').addClass('disabled_input');
		$('#insurance_name').addClass('disabled_input');

		$('#insuranceNasiBtn').val('クリア');
	}
	else if ($('#insuranceNasiBtn').val() == 'クリア') {
		$('#InsuranceType').val();
		$('#insurance_sign').val('');
		$('#insurance_no').val('');
		$('#insurance_name').val('');

		$('#InsuranceType').attr('disabled', false);
		$('#insurance_sign').attr('disabled', false);
		$('#insurance_no').attr('disabled', false);
		$('#insurance_name').attr('disabled', false);

		$('#InsuranceType').removeClass('disabled_input');
		$('#insurance_sign').removeClass('disabled_input');
		$('#insurance_no').removeClass('disabled_input');
		$('#insurance_name').removeClass('disabled_input');

		$('#insuranceNasiBtn').val('なし');
	}
}

// 持病なし押下
function chronicNasi() {
	if ($('#chronicNasiBtn').val() == 'なし') {
		$('#chronic').val('なし');
		$('#chronicNasiBtn').val('クリア');
	}
	else if ($('#chronicNasiBtn').val() == 'クリア') {
		$('#chronic').val('');
		$('#chronicNasiBtn').val('なし');
	}
}

// アレルギーなし押下
function allergyNasi() {
	if ($('#allergyNasiBtn').val() == 'なし') {
		$('#allergy').val('なし');
		$('#allergyNasiBtn').val('クリア');
	}
	else if ($('#allergyNasiBtn').val() == 'クリア') {
		$('#allergy').val('');
		$('#allergyNasiBtn').val('なし');
	}
}

// 出産前チェックボックス押下
function beforeBirth(obj) {
	if ($('[name="beforeBirthCheckBox"]').prop('checked')) {
		$('#child_birthday_label').text('出産予定');
		$('#child_name').val('出産前　お子様');
		$('#child_name_kana').val('しゅっさんまえ　おこさま');

		$('#gender_3').prop("checked", true);
		$('#blood_5').prop("checked", true);
		$('#bloodrh_3').prop("checked", true);
	}
	else {
		$('#child_birthday_label').text('生年月日');

		// WEBと同じように園児名、園児名かな、愛称、生年月日（出産予定日）、性別、血液型、RH型をクリアする。
		$('#child_name').val('');
		$('#child_name_kana').val('');
		$('#child_nick_name').val('');
		$('#child_birthday_year').val('');
		$('#child_birthday_month').val('');
		$('#child_birthday_day').val('');
		$("input[name=gender]").prop("checked", false);
		$("input[name=child_blood]").prop("checked", false);
		$("input[name=child_bloodRh]").prop("checked", false);
	}
}

// 父親情報なし押下
function fatherNasi() {
	if ($('#fatherNasiBtn').val() == 'なし') {
		$('#job_name_1').val('なし');
		$('#job_address_1').val('なし');
		$('#job_post_1').val('なし');
		$('#job_tel_1').val('なし');
		$('#fatherNasiBtn').val('クリア');
	}
	else if ($('#fatherNasiBtn').val() == 'クリア') {
		$('#job_name_1').val('');
		$('#job_address_1').val('');
		$('#job_post_1').val('');
		$('#job_tel_1').val('');

		$('#fatherNasiBtn').val('なし');
	}
}
// 母親情報なし押下
function motherNasi() {
	if ($('#motherNasiBtn').val() == 'なし') {
		$('#job_name_2').val('なし');
		$('#job_address_2').val('なし');
		$('#job_post_2').val('なし');
		$('#job_tel_2').val('なし');
		$('#motherNasiBtn').val('クリア');
	}
	else if ($('#motherNasiBtn').val() == 'クリア') {
		$('#job_name_2').val('');
		$('#job_address_2').val('');
		$('#job_post_2').val('');
		$('#job_tel_2').val('');

		$('#motherNasiBtn').val('なし');
	}
}

function getdata() {
	if (window.location.search) {
		var n = window.location.search.substring(1, window.location.search.length);
		document.form3.elements["getpram"].value = n;
	}
}

function openChildImgRegistDialog() {
	$("#child_img_dialog").dialog({ dialogClass: 'dialogBox', modal: true });
	$("#consentCheck").prop("disabled", false);
	$(document).on("click", ".ui-widget-overlay", function () {
		$(this).prev().find(".ui-dialog-content").dialog("close");
	});
}

function openCommonCalendarDialog(obj) {
	$('#common_calendar').click();
}

// 郵便番号から住所を取得
function getAddress() {
	var sendJsonStr = {};
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;
	sendJsonStr.zip_code = $('#zip').val();
	$.ajax({
		type: "POST",
		url: urlDomain + 'popo_mypage_apls/zipToAddress',
		data: sendJsonStr,
		timeout: 10000,
		success: function (data) {
			var resultData = JSON.parse(data);
			if (!resultData.is_error) {
				var address1 = resultData.response.zipcodes.address;
				$('#address_1').val(address1);
			}
			else {
				// 取得失敗
				navigator.notification.alert(
					'指定の郵便番号が見つかりませんでした。',
					function () { },
					'確認',
					'OK'
				);
			}
		},
		error: function (xhr) {
			navigator.notification.alert(
				'通信に失敗しました。電波状況の良いところでもう一度お試しください。',
				function () { },
				'警告',
				'OK'
			);
		}
	});
}

function registChildImageFile() {
	/* 画像ファイルの取得・セット */
	var fd = new FormData();
	fd.append("img_file", $('#selectChildImg').prop("files")[0]);

	fd.append("member_no", window.sessionStorage.getItem('member_no'));
	fd.append("password_hash", window.sessionStorage.getItem('password_hash'));
	fd.append("apl_version", appVersion);
	fd.append("office_id", $('#office_id').val());
	fd.append("child_id", $('#child_id').val());

	$.ajax({
		type: "POST",
		url: urlDomain + 'popo_mypage_apls/registChildImageFile',
		data: fd,
		timeout: 10000,
		processData: false,
		contentType: false,
		success: function (data) {
			var resultData = JSON.parse(data);
			if (!resultData.is_error) {
				navigator.notification.alert(
					'写真を登録しました。',
					function () { },
					'確認',
					'OK'
				);
			}
			else {
				// 取得失敗
				navigator.notification.alert(
					'指定の郵便番号が見つかりませんでした。',
					function () { },
					'確認',
					'OK'
				);
			}
		},
		error: function (xhr) {
			navigator.notification.alert(
				'通信に失敗しました。電波状況の良いところでもう一度お試しください。',
				function () { },
				'警告',
				'OK'
			);
		}
	});
}

function getColumnDic(col, model) {
	var value = modelToIdDic[model + '.' + col];
	if (value == undefined || value.length == 0) {
		return col;
	}
	return value;
}

function getByteLength(str) {
	str = (str == null) ? "" : str;
	return encodeURI(str).replace(/%../g, "*").length;
}

/*
 * 警告メッセージ欄の表示/非表示の切り替え
 */
function alertText() {
	var alertText = "赤枠で囲われている箇所を見直してください。";
	$(".alertText").html(alertText);
	$(".alertText").css("display", "inline-block");
	return true;
}
function noneAlertText() {
	$(".alertText").html('');
	$(".alertText").css("display", "none");
	return true;
}

function cancel(obj) {
	var parameter = '?info=';
	if ($(obj).attr('id') == 'userRegistCancelBtn') {
		parameter = parameter + 'kihon';
	}
	else if ($(obj).attr('id') == 'detailRegistCancelBtn') {
		parameter = parameter + 'hogosha';
	}
	else if ($(obj).attr('id') == 'childRegistCancelBtn') {
		parameter = parameter + 'enji';
	}
	else if ($(obj).attr('id') == 'familyUserRegistCancelBtn') {
		parameter = parameter + 'kazoku';
	}
	else {
		return false;
	}
	change_location('member_info_view.html' + parameter);
}
