$(document).ready(function() {
    document.addEventListener('deviceready', function () {
        load_event();
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
            var index = 0;
            response.data.forEach(function (item){
                if(index === 0 && window.sessionStorage.getItem('OpenEvent') === 'null'){
                    var OpenEvent = {
                        Id: item.Id,
                        Name: item.Name,
                        SaleDate: item.SalesDateFrom,
                    };
                    window.sessionStorage.setItem('OpenEvent', JSON.stringify(OpenEvent));
                }
                index++;
                htmlTab += `<div class="tab">`;
                htmlTab += `<input class="checked-event" type="checkbox" name="skill" value="${item.Id}" id="ck${item.Id}" onclick="openEvent('${item.Id}','${item.Name}','${item.SalesDateTo}')">`;
                htmlTab += `<label class="tab-label" for="ck${item.Id}"><i class="delete-event far fa-trash-alt" onclick="deleteCategory(${item.Id})"></i>${item.Name}</label>`;
                htmlTab += `<div class="tab-content">`;
                htmlTab += `<div class="list-img">`;

                item.Images.length > 0 && item.Images.forEach(function (item1){
                    htmlTab += `<div class="div-img relative div-${item1.Id}">`;
                    htmlTab += `<img src="${item1.ThumbnailPath}" onclick="showImage('${item1.Id}')">`;
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
        
        if(window.sessionStorage.getItem('OpenEvent') === 'null'){
            $('.checked-event')[0].checked = true;
        }
        else{
            var EventOpened = window.sessionStorage.getItem('OpenEvent');
            var Id = JSON.parse(EventOpened).Id;
            $('input[type=checkbox][value='+Id+']').prop('checked',true);
        }
    }).fail(function (error){
        $(".loader-wrap").css("display","none");
    });
    
}
function openEvent(EventID, EventName, SaleDate){
    var OpenEvent = {
        Id: EventID,
        Name: EventName,
        SaleDate: SaleDate,
    };
    var EventOpened = window.sessionStorage.getItem('OpenEvent');
    if(EventOpened === 'null'){
        window.sessionStorage.setItem('OpenEvent', JSON.stringify(OpenEvent));
    }
    else{
        if(JSON.parse(EventOpened).Id == EventID){
            window.sessionStorage.setItem('OpenEvent', 'null');
        }else{
            window.sessionStorage.setItem('OpenEvent', JSON.stringify(OpenEvent));
        }
    }
}
function uploadImageToEvent(){
    var EventOpened = window.sessionStorage.getItem('OpenEvent');
    if(EventOpened == 'null'){
        navigator.notification.alert(
            'カテゴリを選択してください。',  // message
            function(){
                return false;
            },       		 		 // callback
            '警告',          		  // title
            'OK'            		 // buttonName
        );
    }else{
        location.href ="./upload_image_to_event.html";
    }
}

function deleteCategory(EventID){
    navigator.notification.confirm(
        'このカテゴリーを削除していいですか？', // message
        function(buttonIndex){
            if(buttonIndex==1){
                var settings = {
                    "url": `${urlPictureOrder}api/deletePhotoAlbum/${EventID}`,
                    "method": "PUT",
                    "timeout": 10000,
                };
                
                $.ajax(settings).done(function (response) {
                    navigator.notification.alert(
                        'カテゴリーの削除が削除が完了しました。',
                        function() {
                            return false;
                        },
                        '警告',
                        'OK'
                    );
                    load_event();
                    window.sessionStorage.setItem('OpenEvent', 'null');
                });
            }
        },     // callback to invoke with index of button pressed
        '支払い',           // title
        ['はい','キャンセル']     // buttonLabels
    );

    
}
function showImage(PhotoId){
    window.sessionStorage.setItem('PhotoId', PhotoId);
    location.href ="./thumbnail_detail.html";
}