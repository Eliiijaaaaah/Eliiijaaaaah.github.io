$(document).ready(function(){
	var html = "";

	req = new XMLHttpRequest();
	req.open('GET', './pages/blog.html');
	req.send();
	req.onload = function() {
		var response = req.responseText;
		firebase.database().ref('/HTML/blog').orderByChild('Date').on('value', function(blogs) {
			blogs.forEach(function(snapshot){
				html = response+html;
				html = html.replace("@Title", snapshot.val().Title).replace("@Date", snapshot.val().Date).replace("@Body", snapshot.val().Body);
			});
			$id('view').innerHTML = html;
		});
	};
});
