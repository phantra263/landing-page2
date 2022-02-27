var flagDown = 0;
var numberLimit = 0;
$(document).ready(function() {
	document.addEventListener('deviceready', function () {
        getDateLimitDown();
	}, false);
});
// 画面遷移
function change_location(adr) {
	window.location.href = adr;
}
function getDateLimitDown() {
    var categoryCode = 4 //購入写真ダウンロード期限
    var getItemInfoByCode = {
        "url": `${urlPictureOrder}api/getItemInfoByCode?categoryCode=${categoryCode}`,
        "method": "GET",
        "timeout": 10000
    };
    $.ajax(getItemInfoByCode).done(function (response) {
        numberLimit = response.data.IntValue1
        loadListAlbum()
    });
}
// load List Album
function loadListAlbum(){
    
    var memberId = window.sessionStorage.getItem('member_no');
    var settings = {
        "url": `${urlPictureOrder}api/getPhotoDownload?userId=${parseInt(memberId)}`,
        "method": "GET",
        "timeout": 10000,
    };
      
    $.ajax(settings).done(function (response) {
        var arr = []
        for (var i = 0; i < numberLimit; i++){
            var date = new Date();
            date.setDate(date.getDate() - i);
            var data = response.data.filter(x => new Date(x.SalesDate).toISOString().substring(0, 10) == date.toISOString().substring(0, 10));
            arr.push({ "SalesDate": date, "data": data});
        }
        window.sessionStorage.setItem('orderHistory', JSON.stringify(arr));
        var htmlTab = "";
        var index = 1;
        arr.forEach(function (item) {
            if(item.data.length > 0){
                var d = new Date(item.SalesDate);
                var year = d.getFullYear();
                var month = d.getMonth()+1;
                var day = d.getDate();
                var dateString = `${year}年${month}月${day}日ご購入分`;
                htmlTab += `<div class="tab">`;
                htmlTab += `<input type="checkbox" id="chck${index}">`;
                htmlTab += `<label class="tab-label" for="chck${index}">${dateString}</label>`;
                htmlTab += `<div class="tab-content">`;
                htmlTab += `<div class="list-img">`;
                item.data.forEach(function (item1){
                    htmlTab += `<div class="div-img relative div-${item1.Id}">`;
                    htmlTab += `<img src="${item1.ThumbnailPath}">`;
                    htmlTab += `</div>`;
                });
                htmlTab += `</div>`;
                htmlTab += `<button class="btn-download" onclick="downloadImage('${item.SalesDate}')" >ダウンロードする</button>`;
                
                htmlTab += `</div>`;
                htmlTab += `</div>`;
                htmlTab += `</div>`;
                
            }
            index++;
        })
        $(".tabs").html(htmlTab);
    });
}

// Download
function downloadImage(SalesDate){
    var orderHistory = window.sessionStorage.getItem("orderHistory");
    if(orderHistory){
        var data = JSON.parse(orderHistory);
        var dataDownload = data.find(x => new Date(x.SalesDate).toISOString().substring(0, 10) == new Date(SalesDate).toISOString().substring(0, 10));
        if(dataDownload && dataDownload.data.length > 0){
            $(".loader-wrap").css("display","");
            dataDownload.data.forEach(function (image) {
                switch (device.platform) {
                    case "Android":
                        downloadFile(image.PhotoPath, dataDownload.data.length);
                        break;
                    case "iOS":
                        window.imagedownloader
                        .download(
                            image.PhotoPath,
                            function successFn() {
                                console.log('Image was downloaded');
                                flagDown++;
                                console.log(flagDown);
                                if(flagDown == dataDownload.data.length){
                                    flagDown = 0;
                                    $(".loader-wrap").css("display","none");
                                }
                            },
                            function failureFn() {
                                console.log('Fail to download image');
                                flagDown++;
                                console.log(flagDown);
                                if(flagDown == dataDownload.data.length){
                                    flagDown = 0;
                                    $(".loader-wrap").css("display","none");
                                }
                            }
                        );
                        break;
                }
            });
        }
    }
}

function downloadFile(urlFile, count) {
	
	let downloadUrl = encodeURI(urlFile);
	var fileTransfer = new FileTransfer();

	// var storageLocation = 'file:///storage/emulated/0/Download/';
    var storageLocation = cordova.file.externalApplicationStorageDirectory;
	var fileName = new Date().getTime() + urlFile.replace(/^.*[\\\/]/, '');
	var path = storageLocation + fileName;
	fileTransfer.download(
		downloadUrl, 
		path, 
		function(entry) {
			console.log("download complete: " + entry.toURL());
            flagDown++;
            if(flagDown == count){
                flagDown = 0;
                $(".loader-wrap").css("display","none");
            }
		},
		function(error) {
			console.log("download error source " + error.source);
			console.log("download error target " + error.target);
			console.log("download error code" + error.code);
            flagDown++;
            if(flagDown == count){
                flagDown = 0;
                $(".loader-wrap").css("display","none");
            }
		},
		true,
		{});
}