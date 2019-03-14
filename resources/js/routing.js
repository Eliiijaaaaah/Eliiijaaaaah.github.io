// Routing based on: https://github.com/krasimir/navigo
var currentPage;
var previousPage;
var pages = ["home", "about", "edit", "login", "logout"];

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
		loadFirebaseData();
		tinymceInit();
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
			}
			else{
				loadHTML('./pages/login.html', 'view');
			}
	  }).resolve();

	router.on('/login', function () {
			previousPage = currentPage;
			currentPage = 'login';
			navbarActive();
			if(firebase.auth().currentUser == null){
				loadHTML('./pages/login.html', 'view');
			}
			else{
				window.location = "#/"+previousPage;
			}
	  }).resolve();

		router.on('/logout', function () {
				previousPage = currentPage;
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
