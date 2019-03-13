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
	firebase.database().ref('/HTML/' + 'Index').set({
		name: 'Index',
		HTML: tinyMCE.activeEditor.getContent()
	})
}
