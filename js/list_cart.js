var numberOfDaysToAdd = 6;
$(document).ready(function() {
    document.addEventListener('deviceready', function () {
        loadCart();
	}, false);
});
function loadCart(){
    $(".loader-wrap").css("display","");
    var cartData = window.sessionStorage.getItem('cartData');
    var htmlString = "";
    var price = 0;
    if(window.sessionStorage.getItem('cartData') != null){
        var cartData = JSON.parse(window.sessionStorage.getItem('cartData'));
        if(cartData.length == 0){
            $("#btn-payment").attr("disabled", true);
        }
        cartData && cartData.forEach(function (item) {
            price = item.Price;
            htmlString += `<div class="div-img-cart relative">`;
            htmlString += `<div class="div-over-img"><img onclick="showImage('${item.PhotoId}')" src="${item.ThumbnailPath}"></div>`;
            htmlString += `<i onclick="removeToCart('${item.PhotoId}')" class="far fa-trash-alt"></i>`;
            htmlString += `</div>`;
        });
        
        $(".list-img").html(htmlString);
        var quantity = `${cartData.length}枚`;
        var totalAmount = `¥${price * cartData.length}円`;
        var unitPrice = `¥${price}`;
        $(".unit-price").html(unitPrice);
        $(".quantity").html(quantity);
        $(".total-amount").html(totalAmount);
    }else{
        $("#btn-payment").attr("disabled", true);
    }
    $(".loader-wrap").css("display","none");
    var categoryCode = 4 //購入写真ダウンロード期限
    var getItemInfoByCode = {
        "url": `${urlPictureOrder}api/getItemInfoByCode?categoryCode=${categoryCode}`,
        "method": "GET",
        "timeout": 10000
    };
    $.ajax(getItemInfoByCode).done(function (response) {
        numberOfDaysToAdd = response.data.IntValue1 - 1
    });
}

function removeToCart(PhotoId) {
    var cartData = JSON.parse(window.sessionStorage.getItem('cartData'));
    var index = cartData && cartData.findIndex(x => x.PhotoId === PhotoId);
    if (index > -1) {
        cartData.splice(index, 1);
        window.sessionStorage.setItem('cartData',JSON.stringify(cartData));
    }
    loadCart();
}
function showImage(PhotoId){
    window.sessionStorage.setItem('PhotoId', PhotoId);
    location.href ="./thumbnail_detail.html";
}

// 画面遷移
function change_location(adr) {
	window.location.href = adr;
}
function payment(){
    if(JSON.parse(window.sessionStorage.getItem('cartData')).length > 0){
        navigator.notification.confirm(
            '[はい]を選択して、支払い画面に移動します。', // message
            function(buttonIndex){
                if(buttonIndex==1){
                    var member_no = window.sessionStorage.getItem('member_no');
                    var dataSalePhotoHistory = [];
                    if(window.sessionStorage.getItem('cartData') != null){
                        var cartData = JSON.parse(window.sessionStorage.getItem('cartData'));
                        var currentDate = new Date();
                        var newDate = currentDate.setDate(currentDate.getDate() + numberOfDaysToAdd);
                        cartData && cartData.forEach(function (item) {
                            var data = {
                                PhotoId: parseInt(item.PhotoId),
                                SalesDate: new Date().toISOString().substring(0, 10),
                                DownloadLimit: new Date(newDate).toISOString().substring(0, 10),
                                SalesMemberId: parseInt(member_no) 
                            }
                            dataSalePhotoHistory.push(data);
                        })
                        var settings = {
                            "url": `${urlPictureOrder}api/createSalePhotoHistory`,
                            "method": "POST",
                            "headers": {
                            "Content-Type": "application/json"
                            },
                            "data": JSON.stringify({
                                "employeeId": 1,
                                "data": dataSalePhotoHistory
                            }),
                        };
                        $(".loader-wrap").css("display","");
                        $.ajax(settings).done(function (response) {
                            $(".loader-wrap").css("display","none");
                            // Return payment page
                            navigator.notification.alert(
                                'お支払いページは建設しております。',
                                function() {
                                        return false;
                                },
                                '警告',
                                'OK'
                            );
                            window.sessionStorage.setItem('cartData',JSON.stringify([]));
                            location.href ="./list_event.html";
                        }).fail(function (error) {
                            $(".loader-wrap").css("display","none");
                        });
                        
                    }
                }
            },     // callback to invoke with index of button pressed
            '支払い',           // title
            ['はい','キャンセル']     // buttonLabels
        );
    }
}