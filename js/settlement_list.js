/*
 *
 * 精算画面
 *
 */
$(function(){

	document.addEventListener('deviceready', function () {

		// Androidの戻るボタン無効化
		document.addEventListener("backbutton", function(){return false;}, false);

		settlementList();

		const btn = document.getElementById('increment');
		const btnds = document.getElementById('decrement');

		//現在の年度取得
		const settlement_yearBlock = document.getElementById('settlement_year');

		//右のボタンを押した場合
		btn.addEventListener('click', () => {
			state.count++;		//来年度
			settlementList();
		});

		//左のボタンを押した場合
		btnds.addEventListener('click', () => {
			state.count--;		//前年度
			settlementList();
		});

		document.addEventListener("resume", onResume, false);

	}, false);
});

// 画面遷移
function change_location(adr)
{
	window.location.href = adr;
}

function settlementList()
{
	document.getElementById('settlement_year').innerHTML = state.count;
	settlement_year = state.count;
	var sendJsonStr = {};									//JSON形式の変数
	sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
	sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
	sendJsonStr.apl_version = appVersion;
	sendJsonStr.settlement_year = settlement_year;
	$(".loader-wrap").css("display","block");
	$.ajax({
		type: "POST",
		url:urlDomain + 'popo_mypage_apls/settlement_list', 
		data: sendJsonStr,
		timeout: 30000,									//タイムアウト、(仮で設定)
		success: function (data) {
			
			$(".loader-wrap").css("display","none");
			
			var data = JSON.parse(data);	
			var result = data.is_error;	//通信結果
			//兄弟がいる場合は、兄弟分の名前、プリペイド購入等園児が関わらない場合空欄
			var settlement_date = data.response.settlement_date;
			//請求額
			var price = data.response.price;
			//支払い状態（1=未払い、2=支払済）
			var payment_status = data.response.payment_status;
			//精算ID
			var settlement_id = data.response.settlement_id;

			//ペイジェントアクセス用のURL
			var payment_credit_paygent_url = data.response.payment_credit_paygent_url;
			
			//通信に成功した場合
			if(!result){
				
				makeTable(data.response);

			}
			else{
				//通信に失敗した場合
				navigator.notification.alert(
					data.error_message,
					function(){
						window.location.href="index.html";
					},       			  // callback
					'警告',         	  // title
					'OK'                  // buttonName
				);
			}
		},
		error: function (xhr) {
			
			$(".loader-wrap").css("display","none");
			
			navigator.notification.alert(
				'通信に失敗しました。インターネット環境を確認してください。',  // message
					function(){
						$(".loader-wrap").css("display","none");
					},       			  // callback
					'警告',         	   // title
					'OK'                  // buttonName
			);
		}
	});
}
function makeTable(data){
	
	//データが存在する場合
	
	if(settlement_year!=null){
		var tableElement = document.getElementById("tb_id");
		$("#tb_id").empty();

		//支払ステータス （1=未払い、2=支払済）
		var stsNg = "未"
		var stsOk = "済"
		for(i = 0; i < data.length; i++){
			// 1行分のDOMを生成
			var rowElement = document.createElement("tr");
			// 1セル分のDOMを生成
			var cellElement = document.createElement("td");
			// 園児名をセット
			cellElement.textContent = data[i]['settlement_date'];

			// セルを行のDOMに追加
			rowElement.appendChild(cellElement);
			// 1セル分のDOMを生成
			var cellElement = document.createElement("td");
			// 支払額をセット
			cellElement.textContent = data[i]['price'];
			// セルを行のDOMに追加
			rowElement.appendChild(cellElement);
			// 1セル分のDOMを生成
			var cellElement = document.createElement("td");
			// 支払ステータスをセット （1=未払い、2=支払済）
			if (data[i]['payment_status']=='1'){
				cellElement.textContent = stsNg;
				cellElement.style.color = 'red';
	
				//未支払いの場合は、赤文字
			}
			else {
				//支払い済みの場合は、青文字
				cellElement.textContent = stsOk;
				cellElement.style.color = 'blue';

			}
			// セルを行のDOMに追加
			rowElement.appendChild(cellElement);
			// 1セル分のDOMを生成
			var cellElement = document.createElement("td");
			// 詳細ボタンをセット
			const btnDtl = document.createElement('button');
			btnDtl.innerText = '詳細';

			//詳細画面に遷移
			var settlement_id = data[i]['settlement_id'];
			btnDtl.onclick = function() {
				//window.sessionStorage.setItem('settlement_id',this.value);
				location.href = "./settlement_detail.html?settlement_id=" + this.value;
			};
			btnDtl.style.backgroundColor = "#f5f5f5";
			btnDtl.style.borderColor= "#f5f5f5";
			btnDtl.style.boxShadow =  "#f5f5f5";
			btnDtl.value = settlement_id;
			cellElement.appendChild(btnDtl);

			// セルを行のDOMに追加
			rowElement.appendChild(cellElement);
			// 1セル分のDOMを生成
			var cellElement = document.createElement("td");
			// 支払ボタンをセット
			//支払状態 1=未支払い 2=支払完了
			if (data[i]['payment_status']==2){
				cellElement.textContent = "";
			}
			else{
				const btn = document.createElement('button');
				var payUrl = data[i]['payment_credit_paygent_url'];
				btn.type = "button";
				btn.style.backgroundColor =  "#f5f5f5";
				btn.style.borderColor= "#f5f5f5";
				btn.style.boxShadow =  "#f5f5f5";
				btn.style.width = "5.2em";
				btn.innerText = '決済する';
				btn.value = (i+1);
				const opt1 = document.createElement('input');
				opt1.type = 'hidden';
				opt1.setAttribute("id", "settlementId"+(i+1));
				opt1.value = settlement_id;
				btn.appendChild(opt1);
				const opt2 = document.createElement('input');
				opt2.type = 'hidden';
				opt2.setAttribute("id", "paygentUrl"+(i+1));
				opt2.value = payUrl;
				btn.appendChild(opt2);

				btn.onclick = function() {
					var		recno = this.value;
					var		sett_id = document.getElementById("settlementId"+recno).value;
					var		pay_url = document.getElementById("paygentUrl"+recno).value;

					var sendJsonStr = {};		//JSON形式の変数
					sendJsonStr.member_no = window.sessionStorage.getItem('member_no');
					sendJsonStr.password_hash = window.sessionStorage.getItem('password_hash');
					sendJsonStr.apl_version = appVersion;
					sendJsonStr.settlement_id = sett_id;	 	//請求ID
					sendJsonStr.bugfix = true;
					window.sessionStorage.setItem('settlement_id', settlement_id);
					$(".loader-wrap").css("display","block");
					$.ajax({
						type: "POST",
						url:urlDomain + 'popo_mypage_apls/check_pre_payment', 
						data: sendJsonStr,
						timeout: 300000,									//タイムアウト、(仮で設定)
						success: function (data) {

							$(".loader-wrap").css("display","none");

							var data = JSON.parse(data);
							var result = data.is_error;	//通信結果
							if(!result){    
							
								var  is_canceled = data.response.is_canceled;   // キャンセル済み=true, 未キャンセル=false
								var error_message = data.response.error_message;
								console.log(is_canceled);
								if(is_canceled){
									navigator.notification.alert(
										error_message,  // message
										function(){
											$(".loader-wrap").css("display","none");
										},       			  // callback
										'警告',         	   // title
										'OK'                  // buttonName
									);
								}
								else {
									//ペイジェントサイトに遷移
									navigator.notification.confirm(
										'精算を開始すると中止はできません。続行してもよろしいですか？',
										function(buttonIndex){
											if(buttonIndex==1){
												document.location.href = pay_url;
											}
										},
										'精算を開始しますか？',
										'続行,取り消し'
									);
								}
							}
							else {
								//通信に失敗した場合
								navigator.notification.alert(
									data.error_message,
									function(){
										window.location.href="index.html";
									},       			  // callback
									'警告',         	  // title
									'OK'                  // buttonName
								);
							}
						},

						error: function (xhr) {

							$(".loader-wrap").css("display","none");

							navigator.notification.alert(
								'通信に失敗しました。インターネット環境を確認してください。',  // message
								function(){
									$(".loader-wrap").css("display","none");
								},       			  // callback
								'警告',         	   // title
								'OK'                  // buttonName
							);
						}
					});
				};
				cellElement.appendChild(btn);
			}
			// セルを行のDOMに追加
			rowElement.appendChild(cellElement);
			// 行をテーブルのDOMに追加
			tableElement.appendChild(rowElement);
		}
	}
}

function onResume(){
	settlementList();
}
