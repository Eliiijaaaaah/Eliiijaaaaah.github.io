// getElementById wrapper
function $id(id) {
  return document.getElementById(id);
}

// asyncrhonously fetch the html template partial from the file directory,
// then set its contents to the html of the parent element
function loadHTML(url, id) {
  req = new XMLHttpRequest();
  req.open('GET', url);
	console.log(req);
  req.send();
  req.onload = () => {
    $id(id).innerHTML = req.responseText;
  };
}

// use #! to hash
router = new Navigo('/home', true, '#');
router.on({
  // 'view' is the id of the div element inside which we render the HTML
  'firstroute': () => { loadHTML('./pages/home.html', 'view'); },
});

// set the default route
router.on(() => { $id('view').innerHTML = '<h2>Here by default</h2>'; });

router.on('/about', function () {
    // display about page
		loadHTML('./pages/about.html', 'view');
  }).resolve();

router.on('/home', function () {
    // display home page
		loadHTML('./pages/home.html', 'view');
  }).resolve();

// set the 404 route
router.notFound((query) => { $id('view').innerHTML = '<h3>Couldn\'t find the page you\'re looking for...</h3>'; });

router.resolve();

function changePage(page){
	console.log(page);
	router.navigate(page);
}
