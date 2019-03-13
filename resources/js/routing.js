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
		tinymceInit();
  };
}

function loadFirebaseData(){
	firebase.database().ref('/HTML/' + currentPage).once('value').then(function(snapshot) {
	  $id('view').innerHTML = snapshot.val().HTML;
	});
}

function navbarActive(){
	$.each(pages, function(i, value){
		$('#'+value).removeClass('active');
	});
	$('#'+currentPage).addClass('active');
}

// use #! to hash
router = new Navigo(null, true, '#');
router.on('/', function () {
    // display home page
		currentPage = 'home';
		navbarActive();
		loadFirebaseData();
  }).resolve();

router.on('/about', function () {
    // display about page
		//loadHTML('./pages/about.html', 'view');
		//$id('view').innerHTML = loadFirebaseData('About');
		currentPage = 'about';
		navbarActive();
		loadFirebaseData();
  }).resolve();

router.on('/home', function () {
    // display home page
		//loadHTML('./pages/home.html', 'view');
		//$id('view').innerHTML = loadFirebaseData('Index');
		currentPage = 'home';
		navbarActive();
		loadFirebaseData();
  }).resolve();

router.on('/edit', function () {
		currentPage = 'edit';
		navbarActive();
    // display home page
		if(firebase.auth().currentUser != null && firebase.auth().currentUser.uid == 'lo2raCbiGReVwUcTfZr62qjXEIC2'){
			loadHTML('./pages/edit.html', 'view');
		}
		else{
			loadHTML('./pages/login.html', 'view');
		}
  }).resolve();

router.on('/login', function () {
		currentPage = 'login';
		navbarActive();
    // display home page
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

function changePage(page){
	router.navigate(page);
}
