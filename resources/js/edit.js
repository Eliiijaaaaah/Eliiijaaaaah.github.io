function tinymceInit(){
	firebase.database().ref('/Users/'+firebase.auth().currentUser.uid+'/Admin').once('value', snapshot => {
		if (snapshot.val() == true) {
			tinymce.init({
				 selector: 'textarea',
				 plugins: 'a11ychecker advcode formatpainter linkchecker media mediaembed pageembed permanentpen powerpaste tinycomments tinydrive tinymcespellchecker',
				 toolbar: 'a11ycheck addcomment showcomments code formatpainter insertfile pageembed permanentpen',
				 tinycomments_mode: 'embedded',
				 tinycomments_author: 'Author name'
			});

			editPage();
		}
	});
}

function tinymceSubmit(){
	firebase.database().ref('/Users/'+firebase.auth().currentUser.uid+'/Admin').once('value', snapshot => {
		if (snapshot.val() == true) {
			function tinymceSubmit(){
				firebase.database().ref('/HTML/' + $("#editPage").val()).set({
					name: 'Index',
					HTML: tinyMCE.activeEditor.getContent()
				})
			}
		}
	});
}

function editPage(){
	firebase.database().ref('/Users/'+firebase.auth().currentUser.uid+'/Admin').once('value', snapshot => {
		function editPage(){
			firebase.database().ref('/HTML/' + $('option:selected').text()).once('value').then(function(snapshot) {
					tinyMCE.get('editor').setContent(snapshot.val().HTML);
			});
		}
	});
}
