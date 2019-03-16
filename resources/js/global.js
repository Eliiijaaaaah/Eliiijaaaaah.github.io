$('document').ready(function(){
	FirebaseInit();
	createRoutes();
});

function FirebaseInit(){
	var config = {
		apiKey: "AIzaSyB3SkOHAP-k3so2Uev1SRK7pt1qKPxm14U",
		authDomain: "eliiijaaaaah.firebaseapp.com",
		databaseURL: "https://eliiijaaaaah.firebaseio.com",
		projectId: "eliiijaaaaah",
		storageBucket: "eliiijaaaaah.appspot.com",
		messagingSenderId: "290384527697"
	};

	firebase.initializeApp(config);
}

function FirebaseLogout(){
	firebase.auth().signOut()
  .then(function() {
    //alert('You have been logged out.');
		router.navigate("/home");
		Alert("Success:", "You have been logged out.", 4000);
  })
  .catch(function(error) {
    // An error happened
  });
}

function FirebaseLogin(){
	firebase.auth().signInWithEmailAndPassword($('#username').val(), $('#password').val()).then(function(){
		// TODO: Success
		window.location = '#/login';
	}).catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	});
}

function Alert(title, msg, timeout){
	req = new XMLHttpRequest();
  req.open('GET', './pages/alert.html');
  req.send();
  req.onload = function() {
    var html = req.responseText;
		html = html.replace('@title', title).replace('@msg', msg);;

		$id('alert').innerHTML = html;
  };

	setTimeout(function(){
		$('.alert').alert('close')
	}, timeout);
}
