var mouseIsDown = false;
$(document).ready(function() {
	document.addEventListener('deviceready',function() {
        load_event();
        window.sessionStorage.setItem('cartDataTemp',JSON.stringify([]));
	}, false);
});
// 画面遷移
function change_location(adr) {
	window.location.href = adr;
}

// load Album
function load_event(){
    var settings = {
        "url": `${urlPictureOrder}api/getListEvent`,
        "method": "GET",
        "timeout": 10000,
    };
    $(".loader-wrap").css("display","");
    $.ajax(settings).done(function (response) {
        if (response.result && response.data != null){
            var htmlTab = "";
            response.data.forEach(function (item){
                var d = new Date(item.SalesDateTo);
                var year = d.getFullYear();
                var month = d.getMonth()+1;
                var day = d.getDate();
                var dateString = `販売期日：${year}年${month}月${day}日`;
                htmlTab += `<div class="tab">`;
                htmlTab += `<input class="checked-event" type="checkbox" name="skill" value="${item.Id}" id="ck${item.Id}">`;
                htmlTab += `<label class="tab-label tab-label-before" for="ck${item.Id}">${item.Name}</label>`;
                htmlTab += `<div class="tab-content">${dateString}`;
                htmlTab += `<div class="list-img">`;
                item.Images.forEach(function (item1){
                    htmlTab += `<div class="div-img relative div-${item1.Id}" onclick="imagePicker('${item1.Id}','${item1.Price}','${item1.ThumbnailPath}')" ontouchend="touchEnd()" ontouchstart="holdAlbum('${item1.Id}')">`;
                    htmlTab += `<img src="${item1.ThumbnailPath}">`;
                    htmlTab += `<div class="absolute item-picture item-${item1.Id}">`;
                    htmlTab += `<img style="height: 100%;" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAtMzQ2LjM4NCkiPjxwYXRoIGZpbGw9IiMxZWM4MWUiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zMiAzNDYuNGEzMiAzMiAwIDAgMC0zMiAzMiAzMiAzMiAwIDAgMCAzMiAzMiAzMiAzMiAwIDAgMCAzMi0zMiAzMiAzMiAwIDAgMC0zMi0zMnptMjEuMyAxMC4zbC0yNC41IDQxTDkuNSAzNzVsMTcuNyA5LjYgMjYtMjh6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTkuNSAzNzUuMmwxOS4zIDIyLjQgMjQuNS00MS0yNiAyOC4yeiIvPjwvZz48L3N2Zz4=">`;
                    htmlTab += `</div>`;
                    htmlTab += `</div>`;
                });
                htmlTab += `</div>`;
                htmlTab += `</div>`;
                htmlTab += `</div>`;
                htmlTab += `</div>`;
            })

            htmlTab += `<script>
                            $(document).ready(function(){
                                $('input:checkbox').click(function() {
                                    $('input:checkbox').not(this).prop('checked', false);
                                });
                            });
                        </script>`;
            $(".tabs").html(htmlTab);
        }
        $(".loader-wrap").css("display","none");
        $('.checked-event')[0].checked = true;
    }).fail(function (error) {
		console.log(JSON.stringify(error));
        $(".loader-wrap").css("display","none");
	});;
}

function touchEnd(){
    mouseIsDown = false;
}
// hold Album
function holdAlbum(PhotoId){
    mouseIsDown = true;
    timeoutHandle = window.setTimeout( 
        function() {
            if(mouseIsDown) {
                window.sessionStorage.setItem('PhotoId', PhotoId);
                location.href ="./thumbnail_detail.html";
            }
        }, 1000);
    
    document.addEventListener('touchend', function(){
        mouseIsDown = false;
        clearTimeout(timeoutHandle)
    });
}
function imagePicker(PhotoId, Price, ThumbnailPath) {

    var cartData = JSON.parse(window.sessionStorage.getItem('cartDataTemp')) ;
    if(cartData == null) {
        cartData = [];
    }

    var order = {
        "PhotoId" : PhotoId,
        "Price": Price,
        "ThumbnailPath" : ThumbnailPath
    };
    

    var selectItem = ".item-"+PhotoId;

    if($(selectItem).css('display') == 'none')
    {
        $(selectItem).css({ display: "block" });
        cartData.push(order);
    }
    else{
        $(selectItem).css({ display: "none" });
        var index = cartData.findIndex(x => x.PhotoId === PhotoId);
        if (index > -1) {
            cartData.splice(index, 1);
            window.sessionStorage.setItem('cartDataTemp',JSON.stringify(cartData));
        }
    }
    let uniqueObjArray = [
        ...new Map(cartData.map((item) => [item["PhotoId"], item])).values(),
    ];
    window.sessionStorage.setItem('cartDataTemp',JSON.stringify(uniqueObjArray));
}

function addToCart() {

    var cartDataTemp = window.sessionStorage.getItem('cartDataTemp') ? JSON.parse(window.sessionStorage.getItem('cartDataTemp')) : [] ;
    var cartData = window.sessionStorage.getItem('cartData') ? JSON.parse(window.sessionStorage.getItem('cartData')) : [];
    var data = [].concat(cartDataTemp, cartData);
    var x, i;
    x = document.querySelectorAll(".item-picture");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    let uniqueObjArray = [
        ...new Map(data.map((item) => [item["PhotoId"], item])).values(),
    ];
    window.sessionStorage.setItem('cartDataTemp',JSON.stringify([]));
    window.sessionStorage.setItem('cartData',JSON.stringify(uniqueObjArray));
}
function listCart(){
    var cartDataTemp = window.sessionStorage.getItem('cartDataTemp') ? JSON.parse(window.sessionStorage.getItem('cartDataTemp')) : [] ;
    var cartData = window.sessionStorage.getItem('cartData') ? JSON.parse(window.sessionStorage.getItem('cartData')) : [];
    var data = [].concat(cartDataTemp, cartData);
    var x, i;
    x = document.querySelectorAll(".item-picture");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    let uniqueObjArray = [
        ...new Map(data.map((item) => [item["PhotoId"], item])).values(),
    ];
    window.sessionStorage.setItem('cartDataTemp',JSON.stringify([]));
    window.sessionStorage.setItem('cartData',JSON.stringify(uniqueObjArray));
    location.href ="./list_cart.html";
}
