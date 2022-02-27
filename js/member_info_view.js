/*
 *
 * 会員情報閲覧・更新画面
 *
 */
$(function () {
	document.addEventListener('deviceready', function () {
		// Androidの戻るボタン無効化
		document.addEventListener("backbutton", function () { return false; }, false);

		var arg = new Object;
		url = location.search.substring(1).split('&');

		for (i = 0; url[i]; i++) {
			var k = url[i].split('=');
			arg[k[0]] = k[1];
		}
	}, false);

	var arg2 = new Object;
	url = location.search.substring(1).split('&');

	for (i = 0; url[i]; i++) {
		var k = url[i].split('=');
		arg2[k[0]] = k[1];
	}

	getMemberInfo();

	tabCntrol(arg2);
	$('#kihon_tab_id').click();

	$('body').on('click', '.childEdit', function () {
		childEdit($(this));
	});

	$('body').on('click', '.familyEdit', function () {
		familyEdit($(this));
	});

	$('#userEditBtn').click(function () { basicEdit() });
	$('#childAddBtn').click(function () { childAdd() });
	$('#detailEditBtn').click(function () { detailEdit() });
	$('#familyUserAddBtn').click(function () { familyAdd() });
	$('#backBtn').click(function () { changeLocation('home.html'); })

	$('.s_03 .accordion_one .accordion_header').click(function () {
		$(this).next('.accordion_inner').slideToggle();
		$(this).toggleClass("open");

		$('.s_03 .accordion_one .accordion_header').not($(this)).next('.accordion_one .accordion_inner').slideUp();
		$('.s_03 .accordion_one .accordion_header').not($(this)).removeClass("open");

		$('.s_03 .accordion_one .accordion_header>span>i').not($(this).find('span>i')).removeClass('icon-minus');
		$('.s_03 .accordion_one .editStartBtn').css('display', 'none');

		if ($(this).find('span>i').hasClass('icon-minus')) {
			$(this).find('span>i').removeClass('icon-minus');
		}
		else {
			$(this).find('span>i').addClass('icon-minus');
			$(this).prev().css('display', 'block');
		}
	});
});

// 画面遷移
function changeLocation(adr) {
	window.location.href = adr;
}
function setInit() {
	$('#userEditBtn').css('display', 'none');
	$('#detailEditBtn').css('display', 'none');
	$('#childAddBtn').css('display', 'none');
	$('#familyUserAddBtn').css('display', 'none');
}

function basicEdit(elm) {
	changeLocation('member_info_regist.html' + '?info=basic&mode=update');
}
function childEdit(elm) {
	var arr = elm.attr("id").split('_')
	changeLocation('member_info_regist.html' + '?info=child&mode=update&child_id=' + arr[1]);
}
function childAdd() {
	changeLocation('member_info_regist.html' + '?info=child&mode=insert');
}
function detailEdit(elm) {
	changeLocation('member_info_regist.html' + '?info=detail&mode=update');
}
function familyEdit(elm) {
	var arr = elm.attr("id").split('_')
	changeLocation('member_info_regist.html' + '?info=family&mode=update&family_id=' + arr[1]);
}
function familyAdd(elm) {
	changeLocation('member_info_regist.html' + '?info=family&mode=insert');
}

function tabCntrol(arg) {
	$('#userEditBtn').css('display', 'none');
	$('#detailEditBtn').css('display', 'none');
	$('#childAddBtn').css('display', 'none');
	$('#familyUserAddBtn').css('display', 'none');
	if (arg.info == 'kihon') {
		$('#kihon_tab_id').addClass('stay');
		$('#kihon_tab_inner_id').addClass('stay');
		$('#userEditBtn').css('display', 'block');
		$('#kihon_tab_id>span>i').addClass('icon-minus');
	}
	else if (arg.info == 'enji') {
		$('#kihon_tab_inner_id').removeClass('stay');
		$('#childAddBtn').css('display', 'block');
		$('#enji_tab_id').addClass('stay');
		$('#enji_tab_id>span>i').addClass('icon-minus');
		$('#enji_tab_inner_id').addClass('stay');
	}
	else if (arg.info == 'hogosha') {
		$('#detailEditBtn').css('display', 'block');
		$('#hogosha_tab_id').addClass('stay');
		$('#hogosha_tab_inner_id').addClass('stay');
		$('#hogosha_tab_id>span>i').addClass('icon-minus');

	}
	else if (arg.info == 'kazoku') {
		$('#familyUserAddBtn').css('display', 'block');
		$('#kazoku_tab_id').addClass('stay');
		$('#kazoku_tab_inner_id').addClass('stay');
		$('#kazoku_tab_id>span>i').addClass('icon-minus');
	}
}

// 会員情報初期表示
function getMemberInfo() {
	var sendJsonStr = {};
	sendJsonStr.MemberId = window.sessionStorage.getItem('member_no');
	sendJsonStr.PasswordHash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.AppVer = appVersion;

	$(".loader-wrap").css("display", "block");

	$.ajax({
		type: "POST",
		url: urlDomain + 'api/GetMemberInfo',
		contentType: "application/json",
		data: JSON.stringify(sendJsonStr),
		timeout: 30000,
		success: function (data) {
			var result = data.Result;
			var errMsg = data.ErrorMessage;

			if(result == true) {
				$('#popup').css('display', 'block');
				setMemberInfo(data);
				$(".loader-wrap").css("display", "none");
			}
			else {
				navigator.notification.alert(
					errMsg,
					function () {
						window.location.href = "home.html";
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

	$('.s_05 .accordion_one .accordion_header').click(function () {
		$(this).next('.accordion_inner').slideToggle();
		$(this).toggleClass("open");
	});

	$('.s_05 a.close_btn').click(function () {
		$(this).parents('.s_05 .accordion_one .accordion_inner').slideUp();
		$('.s_05 .accordion_one .accordion_header').removeClass("open");
	});

	$('.s_05 a.close_btn').click(function () {
		var adjust = 0;
		var speed = 500;
		var href = $(this).attr("href");
		var target = $(href == "#" || href == "" ? 'html' : href);
		var position = target.offset().top - adjust;

		$('body,html').animate({ scrollTop: position }, speed, 'swing');

		return false;
	});
}

function setMemberInfo(res) {
	try {
		//// 会員基本情報
		// 会員情報欄
		$('#user_id').text(setValue(res.MemberInfo.id));
		$('#name').text(setFullName(res.MemberInfo.last_name, res.MemberInfo.first_name));
		$('#name_kana').text(setFullName(res.MemberInfo.last_name_kana, res.MemberInfo.first_name_kana));
		$('#birthday').text(setDate(res.MemberInfo.birthday));

		// 配偶者欄
		$('#partner_name').text(setFullName(res.MemberOtherInfo.partner_last_name, res.MemberOtherInfo.partner_first_name));
		$('#partner_birthday').text(setDate(res.MemberOtherInfo.partner_birthday));
		$('#partner_mobile').text(setValue(res.MemberOtherInfo.partner_mobile));

		// 住所欄
		$('#current_zip').text(setValue(res.MemberInfo.zip));
		$('#address_1').text(setValue(res.MemberInfo.address_1));
		$('#address_2').text(setValue(res.MemberInfo.address_2));

		// 連絡先欄
		$('#mobile').text(setValue(res.MemberInfo.mobile));
		$('#tel').text(setValue(res.MemberInfo.tel));
		$('#mobile_mail').text(setValue(res.MemberInfo.mail));
		$('#pc_mail').text(setValue(res.MemberInfo.pc_mail));
		$('#dm_type_id').text(setDmType(res.MemberInfo.dm_type_id));
		$('#SendMailType').text(setValue(res.MemberInfo.send_mail_type_id === 1 ? res.MemberInfo.mail : res.MemberInfo.pc_mail));

		// 契約情報欄
		$('#first_admission_date').text(setDate(res.FirstAdmissionDate));
		$('#user_limit_date').text(setDate(res.MemberInfo.member_limit));
		$('#prepaid_rest').text(setMoneyCommaDelimited(res.PrepaidRest));
		$('#security_money').text(setMoneyCommaDelimited(res.MemberInfo.security_money));
		$('#mpack_cash_security_money').text(setMoneyCommaDelimited(res.MemberInfo.mpack_cash_security_money));

		//// 保護者情報
		// 父親情報
		$('#job_name_1').text(setValue(res.MemberOtherInfo.job_name_1));
		$('#job_address_1').text(setValue(res.MemberOtherInfo.job_address_1));
		$('#job_post_1').text(setValue(res.MemberOtherInfo.job_post_1));
		$('#job_tel_1').text(setValue(res.MemberOtherInfo.job_tel_1));

		// 母親情報
		$('#job_name_2').text(setValue(res.MemberOtherInfo.job_name_2));
		$('#job_address_2').text(setValue(res.MemberOtherInfo.job_address_2));
		$('#job_post_2').text(setValue(res.MemberOtherInfo.job_post_2));
		$('#job_tel_2').text(setValue(res.MemberOtherInfo.job_tel_2));

		// 実家情報
		$('#home_name').text(setValue(res.MemberOtherInfo.home_name));
		$('#home_address').text(setValue(res.MemberOtherInfo.home_address));
		$('#home_tel').text(setValue(res.MemberOtherInfo.home_tel));

		// 保護者代理人情報
		$('#proxy_name').text(setFullName(res.MemberOtherInfo.proxy_last_name, res.MemberOtherInfo.proxy_first_name));
		$('#proxy_relation').text(setValue(res.MemberOtherInfo.proxy_relation));
		$('#proxy_tel').text(setValue(res.MemberOtherInfo.proxy_tel));

		// 緊急連絡先
		$('#UrgentContactType1').text(setSelectBoxValue(res.Master.UrgentContactTypes[res.MemberOtherInfo.urgent_contact_type_id_1]));
		$('#UrgentContactType2').text(setSelectBoxValue(res.Master.UrgentContactTypes[res.MemberOtherInfo.urgent_contact_type_id_2]));
		$('#UrgentContactType3').text(setSelectBoxValue(res.Master.UrgentContactTypes[res.MemberOtherInfo.urgent_contact_type_id_3]));
		$('#UrgentContactType4').text(setSelectBoxValue(res.Master.UrgentContactTypes[res.MemberOtherInfo.urgent_contact_type_id_4]));
		$('#UrgentContactType5').text(setSelectBoxValue(res.Master.UrgentContactTypes[res.MemberOtherInfo.urgent_contact_type_id_5]));
		$('#UrgentContactType6').text(setSelectBoxValue(res.Master.UrgentContactTypes[res.MemberOtherInfo.urgent_contact_type_id_6]));
		$('#UrgentContactType7').text(setSelectBoxValue(res.Master.UrgentContactTypes[res.MemberOtherInfo.urgent_contact_type_id_7]));

		//// 園児情報
		$.each(res.ChildrenInfo, function (index, value) {
			var childHtml = "";
			childHtml = '<tr><td>' + setValue(value.FullName) + '</td><td>'
				+ setValue(res.Master.SexTypes[value.SexTypeId]) + '</td><td>'
				+ setDate(value.Birthday) + '</td><td>'
				+ setValue(value.MoonAge) + '</td><td class="td_edit">'
				+ '<input type="button" class="registUserInfoBtn childEdit " id="child_'
				+ value.Id + '" value="編集""></td>'
			$('#enjiTable').append(childHtml);
		})

		//// 家族会員情報
		$.each(res.FamilyInfo, function (index, value) {
			var familyMemberHtml = "";
			familyMemberHtml = '<tr><td>' + setValue(value.FullName) + '</td><td>'
				+ setValue(value.Relation) + '</td><td>'
				+ setValue(res.Master.SexTypes[value.SexTypeId]) + '</td><td>'
				+ setDate(value.Birthday) + '</td><td>'
				+ setValue(value.Age) + '</td><td class="td_edit">'
				+ '<input type="button" class="registUserInfoBtn familyEdit td_edit" id="family_'
				+ value.id + '" value="編集"></td>'
			$('#familyMemberTable').append(familyMemberHtml);
		})
	}
	catch(e) {
		console.error( "エラー：", e.message );
		navigator.notification.alert(
			"データ表示に失敗しました。",
			function () {
				$(".loader-wrap").css("display", "none");
			},
			'警告',
			'OK'
		);
	}
}
