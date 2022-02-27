var maxFiles = 0;
var fileInput = document.getElementById('fileinput');

var maxWidth = 0;
var maxHeight = 0;

var dataImage = [];

var startPos = 0;
var endPos = 0;

var acceptsFiles = 0;

$(document).ready(function() {
	$( ".list-img" ).sortable();
    $( ".list-img" ).disableSelection();
	document.addEventListener('deviceready', function () {
        eventInfor();
	}, false);
});
// 画面遷移
function change_location(adr) {
	window.location.href = adr;
}

function eventInfor(){
    var eventOpened = window.sessionStorage.getItem('OpenEvent');
    var eventOpenedId = window.sessionStorage.getItem('OpenEventId');
    if (eventOpened == null && eventOpenedId){
        navigator.notification.alert(
            'カテゴリを選択してください。',  // message
            function(){
                return false;
            },       		 		 // callback
            '警告',          		  // title
            'OK'            		 // buttonName
        );
        location.href ="./list_event_upload.html";
    }
    $(".loader-wrap").css("display","");

    var categoryCode = 5; // 写真アップロード上限枚数
    var getItemInfoByCode = {
        "url": `${urlPictureOrder}api/getItemInfoByCode?categoryCode=${categoryCode}`,
        "method": "GET",
        "timeout": 10000
    };
        
    $.ajax(getItemInfoByCode).done(function (response) {
        if(response.result){
            maxFiles = response.data.IntValue1;
            var getEventDetail = {
                "url": `${urlPictureOrder}api/getEventDetail?id=${JSON.parse(eventOpened).Id}`,
                "method": "GET",
                "timeout": 10000,
            };
            
            $.ajax(getEventDetail).done(function (response){
                $("#name-event").val("カテゴリ: "+response.data.Name);
                var htmlImage = "";
                if(response.data.Images.length > 0){
                    var index = 0;
                    response.data.Images.forEach(function (item){
                        var data = {
                            Id: item.Id,
                            PhotoAlbumId: item.PhotoAlbumId,
                            ThumbnailPath: item.ThumbnailPath,
                            PhotoPath: item.PhotoPath,
                            RegisterDate: new Date(item.RegisterDate).toISOString().substring(0, 10),
                            PhotoPriceId: item.PhotoPriceId,
                            OrderNo: item.OrderNo,
                            No: index
                        };
                        dataImage.push(data)
                        htmlImage += `<div class="div-img relative div-${index}" id="${index}">`;
                        htmlImage += `<img src="${item.ThumbnailPath}" onclick="showImage('${item.ThumbnailPath}')">`;
                        htmlImage += `<div class="absolute item-picture item-${index}">`;
                        htmlImage += `<img style="height: 100%;" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAtMzQ2LjM4NCkiPjxwYXRoIGZpbGw9IiMxZWM4MWUiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zMiAzNDYuNGEzMiAzMiAwIDAgMC0zMiAzMiAzMiAzMiAwIDAgMCAzMiAzMiAzMiAzMiAwIDAgMCAzMi0zMiAzMiAzMiAwIDAgMC0zMi0zMnptMjEuMyAxMC4zbC0yNC41IDQxTDkuNSAzNzVsMTcuNyA5LjYgMjYtMjh6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTkuNSAzNzUuMmwxOS4zIDIyLjQgMjQuNS00MS0yNiAyOC4yeiIvPjwvZz48L3N2Zz4=">`;
                        htmlImage += `</div></div>`;
                        index++;
                    })
                }else{
                    $("#create-event").attr("disabled", true);
                }
                $(".list-img").html(htmlImage);
                acceptsFiles = maxFiles - dataImage.length;
                $("#max-file-upload").val(`残りアップロードできる写真の枚数は${acceptsFiles}枚です。`);
                if(acceptsFiles == 0 ){
                    $('#fileinput').attr('disabled', true);
                }
                $(".loader-wrap").css("display","none");
            }).fail(function (error){
                $(".loader-wrap").css("display","none");
            })
        }else{
            $(".loader-wrap").css("display","none");
        }
    }).fail(function (error) {
        console.log(JSON.stringify(error));
        $(".loader-wrap").css("display","none");
    });
}

function uploadImageToEvent(){
    var eventOpened = window.sessionStorage.getItem('OpenEvent');
    if(eventOpened == null || eventOpened == 0){
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

function uploadToEvent(){
    if(dataImage.length > 0){
        var idsInOrder = $(".list-img").sortable("toArray");
        var dataImageSorted = [];
        for (var i = 0; i < idsInOrder.length; i++){
            var item = dataImage.find(x => parseInt(x.No) === parseInt(idsInOrder[i]));
            item.OrderNo = i;
            dataImageSorted.push(item);x`
        }
        $(".loader-wrap").css("display","");
        var settings = {
            "url": `${urlPictureOrder}api/addPhoto`,
            "method": "POST",
            // "timeout": 10000,
            "headers": {
              "Content-Type": "application/json"
            },
            "data": JSON.stringify({
              "employeeId": "1",
              "requestId": "1",
              "data": dataImageSorted
            }),
          };
          
        $.ajax(settings).done(function (response) {
            $(".loader-wrap").css("display","none");
            navigator.notification.alert(
                '月極会員には連絡しました。他の人に贈る場 合はお知らせメッセージで送信してください。',  // message
                function(){
                    location.href ="./list_event_upload.html";
                },       		 		 // callback
                '警告',          		  // title
                'OK'            		 // buttonName
            );
        }).fail(function (error) {
            $(".loader-wrap").css("display","none");
            console.log(error);
        });
    }
}
function cancel(){
    location.href ="./list_event_upload.html";
}

function processFile(file) {
    // read the files
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    
    reader.onload = function (event) {
        // blob stuff
        var blob = new Blob([event.target.result]); // create blob...
        window.URL = window.URL || window.webkitURL;
        var blobURL = window.URL.createObjectURL(blob); // and get it's URL
        
        // helper Image object
        var image = new Image();
        image.src = blobURL;
        image.onload = function() {
            // have to wait till it's loaded
                maxWidth = this.width;
                maxHeight = this.height;
                var resized = resizeMe(image); // send it to canvas
                var newinput = document.createElement("input");
                newinput.type = 'hidden';
                newinput.name = 'images[]';
                newinput.value = resized; // put result from canvas into new hidden input
            }
    };
}

function readFiles(files) {
    acceptsFiles = maxFiles - dataImage.length;
    for (var i = 0; i < acceptsFiles; i++) {
        processFile(files[i]); // process each file at once
        $("#max-file-upload").val(`残りアップロードできる写真の枚数は${(acceptsFiles-(i+1))}枚です。`);
    }
    if(fileInput.files.length > acceptsFiles){
        navigator.notification.alert(
            `アップロードされた写真の数が最大数を超えています。${acceptsFiles}枚の写真のみをアップロードします。`,  // message
            function(){
                return false;
            },       		 		 // callback
            '警告',          		  // title
            'OK'            		 // buttonName
        );
        $("#fileinput").attr("disabled", true);
        $("#fileinput").attr("readonly", true);
    }
}

fileInput.onchange = function(){
    readFiles(fileInput.files);
    if(fileInput.files.length > 0 ){
        $("#create-event").attr("disabled", false);
    }else{
        $("#create-event").attr("disabled", true);
    }
}

// === RESIZE ====

function resizeMe(img) {
    
    var canvas_photo = document.createElement('canvas');
    canvas_photo.width = maxWidth;
    canvas_photo.height = maxHeight;
    var ctx_photo = canvas_photo.getContext("2d");
    ctx_photo.drawImage(img, 0, 0, maxWidth, maxHeight);

    var canvas_thumbnail = document.createElement('canvas');

    var t_width = Math.round(img.width / 2);
    var t_height = Math.round(img.height / 2);
    
    // resize the canvas and draw the image data into it
    canvas_thumbnail.width = t_width;
    canvas_thumbnail.height = t_height;
    var ctx_thumbnail = canvas_thumbnail.getContext("2d");
    ctx_thumbnail.drawImage(img, 0, 0, t_width, t_height);
    var eventOpened = window.sessionStorage.getItem('OpenEvent');
    // dataImage = JSON.parse(window.sessionStorage.getItem('upload_image'));
    var data = {
        Id: 0,
        PhotoAlbumId: parseInt(JSON.parse(eventOpened).Id),
        ThumbnailPath: canvas_thumbnail.toDataURL("image/jpeg",0.5) ,
        PhotoPath: canvas_photo.toDataURL("image/jpeg",1),
        RegisterDate: new Date().toISOString().substring(0, 10),
        PhotoPriceId: 1,
        OrderNo: dataImage.length,
        No: dataImage.length
    };
    
    dataImage.push(data);
    var htmlImage = "";
    if(dataImage.length > 0){
        var index = 1;
        dataImage.forEach(function (item){
            htmlImage += `<div class="div-img relative div-${index}" id="${item.No}">`;
            htmlImage += `<img src="${item.ThumbnailPath}">`;
            htmlImage += `<div class="absolute item-picture item-${index}">`;
            htmlImage += `<img style="height: 100%;" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAtMzQ2LjM4NCkiPjxwYXRoIGZpbGw9IiMxZWM4MWUiIGZpbGwtb3BhY2l0eT0iLjgiIGQ9Ik0zMiAzNDYuNGEzMiAzMiAwIDAgMC0zMiAzMiAzMiAzMiAwIDAgMCAzMiAzMiAzMiAzMiAwIDAgMCAzMi0zMiAzMiAzMiAwIDAgMC0zMi0zMnptMjEuMyAxMC4zbC0yNC41IDQxTDkuNSAzNzVsMTcuNyA5LjYgMjYtMjh6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTkuNSAzNzUuMmwxOS4zIDIyLjQgMjQuNS00MS0yNiAyOC4yeiIvPjwvZz48L3N2Zz4=">`;
            htmlImage += `</div></div>`;
            index++;
        })
        $("#create-event").attr("disabled", false);
    }else{
        $("#create-event").attr("disabled", true);
    }
    $(".list-img").html(htmlImage);
    return canvas.toDataURL("image/jpeg",0.5);
}
