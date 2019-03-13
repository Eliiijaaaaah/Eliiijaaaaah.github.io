// Routing based on: https://github.com/krasimir/navigo

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

function loadFirebaseData(currentPage){
	firebase.database().ref('/HTML/' + currentPage).once('value').then(function(snapshot) {
	  $id('view').innerHTML = snapshot.val().HTML;
	});
}

// use #! to hash
router = new Navigo(null, true, '#');
router.on('/', function () {
    // display home page
		loadFirebaseData('Index');
  }).resolve();

router.on('/about', function () {
    // display about page
		//loadHTML('./pages/about.html', 'view');
		//$id('view').innerHTML = loadFirebaseData('About');
		loadFirebaseData('About');
  }).resolve();

router.on('/home', function () {
    // display home page
		//loadHTML('./pages/home.html', 'view');
		//$id('view').innerHTML = loadFirebaseData('Index');
		loadFirebaseData('Index');
  }).resolve();

router.on('/edit', function () {
    // display home page
		if(firebase.auth().currentUser.uid == 'lo2raCbiGReVwUcTfZr62qjXEIC2'){
			loadHTML('./pages/edit.html', 'view');
		}
		else{
			$id('view').innerHTML = 'Forbidden.';
		}
  }).resolve();

// set the 404 route
router.notFound((query) => { $id('view').innerHTML = '<h3>Couldn\'t find the page you\'re looking for...</h3>'; });

router.resolve();

function changePage(page){
	router.navigate(page);
}
