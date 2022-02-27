$(document).ready(function() {
	document.addEventListener('deviceready', function () {
		getAlbumDetailById();
	}, false);
});
function getAlbumDetailById(){
	$(".loader-wrap").css("display","");
	var PhotoId = window.sessionStorage.getItem('PhotoId');
	var settings = {
		"url": `${urlPictureOrder}api/getPhotoDetail?id=${PhotoId}`,
		"method": "GET",
		"timeout": 10000,
	};
	
	$.ajax(settings).done(function (response) {
		if(response && response.data != null){
			var imgUrl = response.data.PhotoPath;
			var album_name = response.data.PhotoAlbumName;
			var d = new Date(response.data.SalesDateTo);
			var year = d.getFullYear();
            var month = d.getMonth()+1;
            var day = d.getDate();
			var dateString = `販売期日：${year}年${month}月${day}日`;
			$("#img_forest").attr("src", imgUrl);
			$(".album_name").html(`< ${album_name} >`);
			$(".album_date").html(dateString);
		}
		$(".loader-wrap").css("display","none");
	}).fail(function (error){
		$(".loader-wrap").css("display","none");
	});
}

function change_location(adr) {
	window.location.href = adr;
}
function successCallback(result) {
    console.log(result); // true - enabled, false - disabled
}
   
function errorCallback(error) {
    console.log(error);
}