function tinymceInit(){
	tinymce.init({
	   selector: 'textarea',
	   plugins: 'a11ychecker advcode formatpainter linkchecker media mediaembed pageembed permanentpen powerpaste tinycomments tinydrive tinymcespellchecker',
	   toolbar: 'a11ycheck addcomment showcomments code formatpainter insertfile pageembed permanentpen',
	   tinycomments_mode: 'embedded',
	   tinycomments_author: 'Author name'
	});

	blogTitles();
}

function tinymceSubmit(){
	firebase.database().ref('/HTML/blog' + $("#editPage").val()).set({
		name: 'Index',
		HTML: tinyMCE.activeEditor.getContent()
	})
}

function blogTitles(){
	var select = document.getElementById('blogTitles');

	firebase.database().ref('/HTML/blog').on('value', function(blogs) {
		blogs.forEach(function(snapshot){
			var opt = document.createElement('option');
      opt.text = snapshot.val().Title;
			opt.value = snapshot.val().Id;
			select.add(opt);
		});
	});
}

function loadBlog(){
	if($('option:selected').val() == "--New Blog--"){
		$("#blogTitle").val("");
			tinyMCE.get('editor').setContent("");
	}
	else{
		firebase.database().ref('/HTML/blog/' + $('option:selected').val()).once('value').then(function(snapshot) {
			$("#blogTitle").val(snapshot.val().Title);
				tinyMCE.get('editor').setContent(snapshot.val().Body);
		});
	}
}

function submitBlog(){
	var id;
	var path = "/HTML/blog/missed";
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();

	today = mm + '/' + dd + '/' + yyyy;

	if($('option:selected').val() == "--New Blog--"){
		firebase.database().ref('/HTML/blog/').on('value', function(blogs) {
			id = "post"+blogs.numChildren()+1;
			path = "/HTML/blog/"+id;
		});
	}
	else{
		firebase.database().ref('/HTML/blog/' + $('option:selected').val()).once('value').then(function(snapshot) {
			id = snapshot.val().Id;
			path = "/HTML/blog/" + id;
		});
	}

	setTimeout(function(){
		firebase.database().ref(path).set({
			Id: id,
			Date: today,
			Title: $("#blogTitle").val(),
			Body: tinyMCE.activeEditor.getContent()
		});
	}, 200);
}
