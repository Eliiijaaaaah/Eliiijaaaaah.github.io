function tinymceInit(){
	tinymce.init({
	   selector: 'textarea',
	   plugins: 'a11ychecker advcode formatpainter linkchecker media mediaembed pageembed permanentpen powerpaste tinycomments tinydrive tinymcespellchecker',
	   toolbar: 'a11ycheck addcomment showcomments code formatpainter insertfile pageembed permanentpen',
	   tinycomments_mode: 'embedded',
	   tinycomments_author: 'Author name'
	});
}

function tinymceSubmit(){
	firebase.database().ref('/HTML/' + $("#editPage").val()).set({
		name: 'Index',
		HTML: tinyMCE.activeEditor.getContent()
	})
}

function editPage(){
	firebase.database().ref('/HTML/' + $('option:selected').text()).once('value').then(function(snapshot) {
			tinyMCE.get('editor').setContent(snapshot.val().HTML);
	});
}
