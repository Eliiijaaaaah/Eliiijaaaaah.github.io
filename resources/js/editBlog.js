function tinymceInit(){
	firebase.database().ref('/Users/'+firebase.auth().currentUser.uid+'/Admin').once('value', snapshot => {
		if (snapshot.val() == true) {
			tinymce.init({
				selector: 'textarea',
				plugins: 'a11ychecker advcode formatpainter linkchecker media mediaembed pageembed permanentpen powerpaste tinycomments tinydrive tinymcespellchecker image imagetools',
				toolbar: 'a11ycheck addcomment showcomments code formatpainter insertfile pageembed permanentpen',
				tinycomments_mode: 'embedded',
				tinycomments_author: 'Author name',
				image_title: true,
				automatic_uploads: true,
				images_upload_url: '{{url("/admin/upload")}}',
				file_picker_types: 'image',
				file_picker_callback: function(cb, value, meta) {
					var input = document.createElement('input');
					input.setAttribute('type', 'file');
					input.setAttribute('accept', 'image/*');

					input.onchange = function() {
						var ref= firebase.database().ref("Uploads");
						var storage = firebase.storage();
						var pathReference = storage.ref('images/'+value);
						pathReference.getDownloadURL().then(function(url) {
							ref.push().set({
								imgurl: url
							});
						});
						input.click();
					}
				}
			});

			blogTitles();
		}
	});
}

function tinymceSubmit(){
	firebase.database().ref('/Users/'+firebase.auth().currentUser.uid+'/Admin').once('value', snapshot => {
		if (snapshot.val() == true) {
			firebase.database().ref('/HTML/blog' + $("#editPage").val()).set({
				name: 'Index',
				HTML: tinyMCE.activeEditor.getContent()
			})
		}
	});
}

function blogTitles(){
	firebase.database().ref('/Users/'+firebase.auth().currentUser.uid+'/Admin').once('value', snapshot => {
		if (snapshot.val() == true) {
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
	});
}

function loadBlog(){
	firebase.database().ref('/Users/'+firebase.auth().currentUser.uid+'/Admin').once('value', snapshot => {
		if (snapshot.val() == true) {
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
	});
}

function submitBlog(){
	firebase.database().ref('/Users/'+firebase.auth().currentUser.uid+'/Admin').once('value', snapshot => {
		if (snapshot.val() == true) {
			var id;
			var path = "/HTML/blog/missed";
			// var today = new Date();
			// var dd = String(today.getDate()).padStart(2, '0');
			// var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
			// var yyyy = today.getFullYear();

			today = mm + '/' + dd + '/' + yyyy;

			if($('option:selected').val() == "--New Blog--"){
				firebase.database().ref('/HTML/blog/').on('value', function(blogs) {
					id = "post"+blogs.numChildren();
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
					// Date: today,
					Title: $("#blogTitle").val(),
					Body: tinyMCE.activeEditor.getContent()
				});
			}, 200);
		}
	});
}
