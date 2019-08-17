// Routing based on: https://github.com/krasimir/navigo
var currentPage;
var previousPage;
var hasJS = false;

var pages = ["home", "about", "edit", "login", "logout", "projects", "blog", "editBlog", "contact", "admin"];

// Message of the day
var dismissed = true;
var MOTD = "";

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
					//file does not exists
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
		if(value == currentPage){
			$('#'+currentPage).addClass('active');
		}
	});
}

function routingDefault(){
	loadHTML();
	navbarActive();

	if(firebase.auth().currentUser != null){
		if($id("admin") == null) {
			$id("navbar").innerHTML = $id("navbar").innerHTML + "<li id='admin' class='nav-item'><a onclick='changePage(\"/admin\")' data-navigo class='nav-link'>Admin</a></li>";
		}
		if($id("logout") == null) {
			$id("navbar").innerHTML = $id("navbar").innerHTML + "<li id='logout' class='nav-item'><a onclick='changePage(\"/logout\")' data-navigo class='nav-link'>Logout</a></li>";
		}
	}
	else if($id("admin") != null){
		$id("admin").remove();
		$id("logout").remove();
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

		// loads blog.js
		hasJS = true;
		loadJS();

		// sets navbar active item
		navbarActive();
	}).resolve();

	router.on('/home', function () {
		// track navigation
		previousPage = currentPage;
		currentPage = 'home';

		// navigate
		routingDefault();
	 }).resolve();

	router.on('/edit', function () {
		if(firebase.auth().currentUser != null) {
			firebase.database().ref('/Users/'+firebase.auth().currentUser.uid+'/Admin').once('value', function(snapshot){
				if (snapshot.val() == true) {
					previousPage = currentPage;
					currentPage = 'edit';
					hasJS = true;
					routingDefault();
					setTimeout(function(){tinymceInit();}, 500);
				}
			});
		}
		else{
			$id('view').innerHTML = "You are unauthorized to view this page.";
		}
	  }).resolve();

	router.on('/edit/blog', function () {
		if(firebase.auth().currentUser != null) {
			firebase.database().ref('/Users/'+firebase.auth().currentUser.uid+'/Admin').once('value', function(snapshot){
				if (snapshot.val() == true) {
					previousPage = currentPage;
					currentPage = 'editBlog';
					hasJS = true;
					routingDefault();
					setTimeout(function(){tinymceInit();}, 500);
				}
			});
		}
		else{
			$id('view').innerHTML = "You are unauthorized to view this page.";
		}
		}).resolve();

	router.on('/login', function () {
			previousPage = currentPage;
			currentPage = 'login';
			navbarActive();
			if(firebase.auth().currentUser != null && (previousPage == null || previousPage == "login")){
				$id('view').innerHTML = '<h3>You\'re logged in!</h3>';
			}
			else if(firebase.auth().currentUser == null){
				loadHTML('./pages/login.html', 'view');
			}
			else {
				changePage("/"+previousPage);
			}
	  }).resolve();

	router.on('/logout', function () {
			previousPage = currentPage;
			currentPage = 'logout';
			navbarActive();
	    FirebaseLogout();
	  }).resolve();

	router.on('/admin', function () {
		if(firebase.auth().currentUser != null) {
			firebase.database().ref('/Users/'+firebase.auth().currentUser.uid+'/Admin').once('value', function(snapshot){
				if (snapshot.val() == true) {
					previousPage = currentPage;
					currentPage = 'admin';
					routingDefault();
				}
			});
		}
		else{
			$id('view').innerHTML = "You are unauthorized to view this page.";
		}
	  }).resolve();

	// set the 404 route
	router.notFound((query) = function() {
		currentPage = "";
		navbarActive();
		$id('view').innerHTML = '<h3>Couldn\'t find the page you\'re looking for...</h3>';
	});

	router.resolve();
}

function changePage(page){
	router.navigate(page);
}
