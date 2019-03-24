$(document).ready(function(){
	var storage = firebase.storage();
	var storageRef = storage.ref();
	var database = firebase.database();

	firebase.auth().onAuthStateChanged(function (user) {
		if (user && user.email != undefined)
			email = user.email;
		if (user && user.uid != undefined)
			id = user.uid;
		if (user && id) {
			// User is signed in.
			var adminRef = database.ref('/Users').child(id).child('Admin').once('value', snapshot => {
				if (snapshot.val() == true) {
					function tinymceInit(){
						tinymce.init({
						   selector: 'textarea',
						   plugins: 'a11ychecker advcode formatpainter linkchecker media mediaembed pageembed permanentpen powerpaste tinycomments tinydrive tinymcespellchecker',
						   toolbar: 'a11ycheck addcomment showcomments code formatpainter insertfile pageembed permanentpen',
						   tinycomments_mode: 'embedded',
						   tinycomments_author: 'Author name'
						});

						editPage();
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
				}
			}).then(function() {});
		} else {
			$id('view').innerHTML = "Unauthorized to view this page.";
		}
	});
});
