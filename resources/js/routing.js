// Routing based on: https://github.com/krasimir/navigo
var currentPage;
var previousPage;
var dismissed = false;
var MOTD = "I'm currently on the job hunt so if you're a reqruiter, reach out!";
var pages = ["home", "about", "edit", "login", "logout", "projects", "blog"];

// getElementById wrapper
function $id(id) {
  return document.getElementById(id);
}

// asyncrhonously fetch the html template partial from the file directory,
// then set its contents to the html of the parent element
function loadHTML(url, id) {
  req = new XMLHttpRequest();
  req.open('GET', url);
  req.send();
  req.onload = function() {
    $id(id).innerHTML = req.responseText;
		loadFirebaseData();
		if(!dismissed){
			Alert("Message of the day:", MOTD, 5000);
		}
  };
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

// Creates routes
function createRoutes(){
	router = new Navigo(null, true, '#');
	router.on('/', function () {
			// track navigation
			previousPage = currentPage;
			currentPage = 'home';
			// update navbar
			navbarActive();
	    // display home page
			loadHTML('./pages/home.html', 'view');
	  }).resolve();

	router.on('/about', function () {
		// track navigation
		previousPage = currentPage;
		currentPage = 'about';
		// update navbar
		navbarActive();
		// display home page
		loadHTML('./pages/about.html', 'view');
	  }).resolve();

	router.on('/projects', function () {
		// track navigation
		previousPage = currentPage;
		currentPage = 'projects';
		// update navbar
		navbarActive();
		// display home page
		loadHTML('./pages/projects.html', 'view');
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

					console.log(html);
				});
				$id('view').innerHTML = html;
				if(!dismissed){
					Alert("Message of the day:", MOTD, 5000);
				}
			});

		};

		}).resolve();

	router.on('/home', function () {
		// track navigation
		previousPage = currentPage;
		currentPage = 'home';
		// update navbar
		navbarActive();
		// display home page
		loadHTML('./pages/home.html', 'view');
	  }).resolve();

	router.on('/edit', function () {
			previousPage = currentPage;
			currentPage = 'edit';
			navbarActive();

			if(firebase.auth().currentUser != null && firebase.auth().currentUser.uid == 'lo2raCbiGReVwUcTfZr62qjXEIC2'){
				loadHTML('./pages/edit.html', 'view');
				setTimeout(function(){
					tinymceInit();
				}, 500);
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
