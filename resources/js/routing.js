// Routing based on: https://github.com/krasimir/navigo
var currentPage;
var pages = ["home", "about"];

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
  req.onload = () => {
    $id(id).innerHTML = req.responseText;
  };
}

function loadFirebaseData(){
	firebase.database().ref('/HTML/' + currentPage).once('value').then(function(snapshot) {
	  	$id('content').innerHTML = snapshot.val().HTML;
	});
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
			currentPage = 'home';
			// update navbar
			navbarActive();
	    // display home page
			$.when(loadHTML('./pages/home.html', 'view')).then(loadFirebaseData());
	  }).resolve();

	router.on('/about', function () {
		// track navigation
		currentPage = 'about';
		// update navbar
		navbarActive();
		// display home page
		$.when(loadHTML('./pages/about.html', 'view')).then(loadFirebaseData());
	  }).resolve();

	router.on('/home', function () {
		// track navigation
		currentPage = 'home';
		// update navbar
		navbarActive();
		// display home page
		$.when(loadHTML('./pages/home.html', 'view')).then(loadFirebaseData());
	  }).resolve();

	router.on('/edit', function () {
			currentPage = 'edit';
			navbarActive();

			if(firebase.auth().currentUser != null && firebase.auth().currentUser.uid == 'lo2raCbiGReVwUcTfZr62qjXEIC2'){
				loadHTML('./pages/edit.html', 'view');
				tinymceInit();
			}
			else{
				loadHTML('./pages/login.html', 'view');
			}
	  }).resolve();

	router.on('/login', function () {
			currentPage = 'login';
			navbarActive();
			if(firebase.auth().currentUser == null){
				loadHTML('./pages/login.html', 'view');
			}
			else{
				setTimeout(function(){$id('view').innerHTML = 'Already logged in.';}, 200);
			}
	  }).resolve();

		router.on('/logout', function () {
				currentPage = 'logout';
				navbarActive();
		    FirebaseLogout();
		  }).resolve();

	// set the 404 route
	router.notFound((query) => { $id('view').innerHTML = '<h3>Couldn\'t find the page you\'re looking for...</h3>'; });

	router.resolve();
}

function changePage(page){
	router.navigate(page);
}
