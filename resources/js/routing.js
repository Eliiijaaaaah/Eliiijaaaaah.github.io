// Routing based on: https://github.com/krasimir/navigo
var currentPage;
var previousPage;
var dismissed = false;
var auth = false;
var hasJS = false;
var MOTD = "I'm currently on the job hunt so if you're a reqruiter, reach out!";
var pages = ["home", "about", "edit", "login", "logout", "projects", "blog", "editBlog", "contact"];

// getElementById wrapper
function $id(id) {
  return document.getElementById(id);
}

// asyncrhonously fetch the html template partial from the file directory,
// then set its contents to the html of the parent element
function loadHTML() {
	var url = "./pages/"+currentPage+".html";
	req = new XMLHttpRequest();
	req.open('GET', url);
	req.send();
	req.onload = function() {
		$id('view').innerHTML = req.responseText;
		//loadFirebaseData();
		loadJS();

		if(!dismissed){
			Alert("Message of the day:", MOTD, 8000);
			setTimeout(function(){dismissed = true}, 8000);
		}
	}
}

function loadJS(){
	if(hasJS) {
		var options = $.extend( options || {}, {
			dataType: "script",
			cache: true,
			url: "./resources/js/"+currentPage+".js",
			error: function()
			{
					//file not exists
			},
			success: function()
			{
					//file exists
			}
		});

		$.ajax( options );
	}

	hasJS = false;
}

function loadFirebaseData(){
	if($id('content') != null){
		firebase.database().ref('/HTML/' + currentPage).once('value').then(function(snapshot) {
			if(snapshot.val() != null){
		  	$id('content').innerHTML = snapshot.val().HTML;
			}
		});
	}
}

function navbarActive(){
	$.each(pages, function(i, value){
		$('#'+value).removeClass('active');
	});

	$('#'+currentPage).addClass('active');
}

function routingDefault(){
	if(auth){
		if(firebase.auth().currentUser != null){
			loadHTML();
			navbarActive();
		}
		else{
			$id('view').innerHTML = "Unauthorized to view this page.";
		}

		auth = false;
	}
	else{
		loadHTML();
		navbarActive();
	}
}

// Creates routes
function createRoutes(){
	router = new Navigo(null, true, '#');
	router.on('/', function () {
			// track navigation
			previousPage = currentPage;
			currentPage = 'home';

			// navigate
			routingDefault();
	  }).resolve();

	router.on('/about', function () {
		// track navigation
		previousPage = currentPage;
		currentPage = 'about';

		// navigate
		routingDefault();
	  }).resolve();

	router.on('/projects', function () {
		// track navigation
		previousPage = currentPage;
		currentPage = 'projects';

		// navigate
		routingDefault();
		}).resolve();

	router.on('/contact', function () {
		// track navigation
		previousPage = currentPage;
		currentPage = 'contact';

		// navigate
		routingDefault();
		}).resolve();

	router.on('/blog', function () {
		// track navigation
		previousPage = currentPage;
		currentPage = 'blog';
		// update navbar
		navbarActive();
		// display home page
		//loadHTML('./pages/blog.html', 'view');
		var html = "";

		req = new XMLHttpRequest();
		req.open('GET', './pages/blog.html');
		req.send();
		req.onload = function() {
			var response = req.responseText;
			firebase.database().ref('/HTML/blog').on('value', function(blogs) {
				blogs.forEach(function(snapshot){
					html = html+response;
					html = html.replace("@Title", snapshot.val().Title).replace("@Date", snapshot.val().Date).replace("@Body", snapshot.val().Body);
				});
				$id('view').innerHTML = html;
				if(!dismissed){
					Alert("Message of the day:", MOTD, 5000);
				}
			});

		};
		hasJS = false;
	}).resolve();

	router.on('/home', function () {
		// track navigation
		previousPage = currentPage;
		currentPage = 'home';

		// navigate
		routingDefault();
	 }).resolve();

	router.on('/edit', function () {
			previousPage = currentPage;
			currentPage = 'edit';
			auth = true;
			hasJS = true;
			routingDefault();

			if(firebase.auth().currentUser != null && firebase.auth().currentUser.uid == 'lo2raCbiGReVwUcTfZr62qjXEIC2'){
				//loadHTML();
				setTimeout(function(){
					tinymceInit();
				}, 2000);
			}
			else{
				loadHTML('./pages/login.html', 'view');
			}
	  }).resolve();

		router.on('/edit/blog', function () {
				previousPage = currentPage;
				currentPage = 'editBlog';
				auth = true;
				hasJS = true;
				routingDefault();

				if(firebase.auth().currentUser != null && firebase.auth().currentUser.uid == 'lo2raCbiGReVwUcTfZr62qjXEIC2'){
					//loadHTML();
					setTimeout(function(){
						tinymceInit();
					}, 2000);
				}
				else{
					loadHTML('./pages/login.html', 'view');
				}
			}).resolve();

	router.on('/login', function () {
			previousPage = currentPage;
			currentPage = 'login';
			navbarActive();
			if(firebase.auth().currentUser != null && previousPage == null){
				$id('view').innerHTML = '<h3>You\'re logged in!</h3>';
			}
			else if(firebase.auth().currentUser == null){
				loadHTML('./pages/login.html', 'view');
			}
			else{
				//TODO: Fix this
				$.when(changePage("/"+previousPage)).then(function(){
					Alert("Success:", "You have been logged in.", 4000);
				});
			}
	  }).resolve();

		router.on('/logout', function () {
				previousPage = currentPage;
				currentPage = 'logout';
				navbarActive();
		    FirebaseLogout();
		  }).resolve();

	// set the 404 route
	router.notFound((query) = function() { $id('view').innerHTML = '<h3>Couldn\'t find the page you\'re looking for...</h3>'; });

	router.resolve();
}

function changePage(page){
	router.navigate(page);
}
