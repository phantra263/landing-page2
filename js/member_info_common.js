/*
 *
 * 会員情報閲覧・更新画面 共通処理
 *
 */
// 日付をスラッシュ区切りに整形する
function setDate(dateStr) {
	var ret = '　';

	if (typeof (dateStr) != "undefined" && dateStr !== null && dateStr.length > 0) {
		if(dateStr.length >= 10) {
			dateStr = dateStr.substr(0, 10);
		}

		var wk = dateStr.match(/^(\d{4})(\-|\/?)(\d{2})(\-|\/?)(\d{2})$/)
		if (wk.length == 6) {
			ret = wk[1] + '/' + wk[3] + '/' + wk[5];
		}
	}

	return ret;
}

// 金額をカンマ区切り整形して円を付加する、NULL・空白は0円を返す
function setMoneyCommaDelimited(money) {
	if (money) {
		var moneyStr = String(money);
		return moneyStr.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + '円';
	}
	else {
		return '0円'
	}
}

// 文字列設定　空白の場合、値の行が省略されないよう全角を返す
function setValue(elm) {
	if (typeof elm !== 'undefined' && elm && elm.length !== 0) {
		return elm;
	}
	else {
		return '　';
	}
}

// 日付をセレクトボックスに設定するときに年月の０を取って一致させる
function suppressZero(str) {
	return str.replace(/^0+/, '');
}

// 日付をセレクトボックス以外で表示する時、年・月を0埋めする
function zeroPadding(num, len, val) {
	return (Array(len).join(val) + num).slice(-len);
}

// セレクトボックスに値を設定する、値がnull、空白に対応するため
function setSelectBoxValue(elm) {
	if (typeof elm !== 'undefined' && elm && elm.length !== 0) {
		return elm;
	}
	else {
		return '　';
	}
}

// 姓名を連結した文字列を返す
function setFullName(lastName, firstName) {
	if ((lastName && firstName) && (lastName.length > 0 && firstName.length)) {
		return lastName + '　' + firstName;
	}
	else {
		return '　'
	}
}

// DM種別を返す
function setDmType(dmTypeId) {
	if (dmTypeId) {
		return dmTypeId === 2 ? '受け取る' : '受け取らない';
	}
	else {
		return '　'
	}
}
