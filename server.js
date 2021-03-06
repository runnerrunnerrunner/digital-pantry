// Digital Pantry Server Side JavaScript

// Node Modules
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('client-sessions');

// Custom Modules
var page_manager = require('./controllers/page_manager');
var table_manager = require('./controllers/table_manager');
var db = new table_manager;

app.use(express.static("."));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.listen(8080, function() {
	console.log("...Server Started...");
});

app.post('/login', function(req, res) {
	db.once('auth', function(msg) {
		if (msg) {
			res.send("Logged in as " + req.body.username);
		}
		else {
			res.send(msg);
		}
	});
	db.authenticate(req.body.username, req.body.password);
});
app.get('/logout', function (req, res) {
	req.session.reset();
	return res.redirect('/');
});
app.post('/create_account', function(req, res) {
	db.once('db_add_user_success', function(msg) {
		console.log("Successfully created a new account.");
		res.send("Successfully logged in.");
	});
	db.once('db_add_user_error', function(msg) {
		console.log("Failed to create a new account.");
		res.send("Failed to log in");
	});
	db.add_user(req.body.username, req.body.password, req.body.first_name,
		req.body.last_name);
});

/*
	/homepage, /view_ingredients_page, /add_ingredients_page,
	/view_recipes_page, /add_recipes_page are all GET requests
	that simply load the HTML data for a particular page.
*/
app.get('/welcome_page', function(req, res) {
	res.send(page_manager.renderWelcomePage());
});
app.get('/login_page', function(req, res) {
	res.send(page_manager.renderLoginPage());
});
app.get('/create_account_page', function(req, res) {
	res.send(page_manager.renderCreateAccountPage());
});
app.get('/homepage', function(req, res) {
	res.send(page_manager.renderHomePage());
});
app.get('/view_ingredients_page', function(req, res) {
	res.send(page_manager.renderViewIngredientsPage());
});
app.get('/add_ingredients_page', function(req, res) {
	res.send(page_manager.renderAddIngredientsPage());
});
app.get('/view_recipes_page', function(req, res) {
	res.send(page_manager.renderViewRecipesPage());
});
app.get('/ingredients_quantity_page', function(req, res) {
	res.send(page_manager.renderIngredientsQuantityPage());
});
app.get('/create_recipe_page', function(req, res) {
	db.once('db_get_rows_success', function(msg) {
		res.send(page_manager.renderCreateRecipePage(req.query.quantity, msg));
	});
	db.once('db_get_rows_error', function(msg) {
		res.send(msg);
	});
	db.get_rows("SELECT * FROM Pantry WHERE user_name = '" + req.query.user_name + "';");
});
app.get('/get_pantry_rows', function(req, res) {
	db.once('db_get_rows_success', function(msg) {
		res.send(msg);
	});
	db.once('db_get_rows_error', function(msg) {
		res.send(msg);
	});
	db.get_rows("SELECT * FROM Pantry WHERE user_name = '" + req.query.user_name + "';");
});

/*	/panel_logged_in and /panel_logged_out send the data for the panel.
*/
app.get('/panel_logged_in', function(req, res) {
	res.send(page_manager.renderPanelLoggedIn());
});
app.get('/panel_logged_out', function(req, res) {
	res.send(page_manager.renderPanelLoggedOut());
});

// pantry_table sends the full table for a particular user.
app.get('/pantry_table', function(req, res) {
	db.once('db_get_pantry_table_success', function(msg) {
		res.send(msg);
		console.log("successful request!");
	});
	db.once('db_get_pantry_table_error', function(msg) {
		res.send(msg);
		console.log("we borked :(");
	});
	db.get_pantry_table(req.query.user_name);
});

// recipes_table sends the full list of recipes.
app.get('/recipes_list', function(req, res) {
	db.once('db_get_recipes_table_success', function(msg) {
		res.send(msg);
	});
	db.once('db_get_recipes_table_error', function(msg) {
		res.send(msg);
	});
	db.get_recipes_table(req.query.user_name);
});

app.get('/ingredient_add', function(req, res) {
	db.once('db_get_row_count_success', function(msg){
		db.add_pantry_item(msg+1, req.query.user_name, req.query.ingredient_name, req.query.measurement_unit, req.query.quantity);
	});
	db.once('db_get_row_count_error', function(msg){
		res.send([false, msg]);
	});
	db.once('db_add_pantry_item_success', function(msg){
		res.send([true]);
	});
	db.once('db_add_pantry_item_error', function(msg){
		res.send([false, msg]);
	});
	db.get_row_count("Pantry");
});
app.post('/recipe_add', function(req, res){
	console.log(req.query.ingredient_names);
	console.log(req.query.measurement_units);
	console.log(req.query.ingredient_counts);
	db.once('db_get_rows_success', function(msg){
		db.once('db_get_row_count_success', function(msg1){
			db.once('db_add_recipe_error', function(msg2){
				console.log(msg2);
				res.send(msg2);
			});
			db.once('db_add_recipe_success', function(msg2){
				res.send(true);
			});
	
			var measurement_units = [];
			
			for (var i = 0; i < msg.length; i++)
			{
				if (req.query.ingredients.includes(msg[i].ingredient_name))
				{
					measurement_units.push(msg[i].quantity);
				}
			}
			//console.log();
			db.add_recipe(msg1, req.query.recipe_name, req.query.ingredient_names, measurement_units, req.query.ingredient_counts, req.query.user_name, req.query.recipe_instructions);
		});

		db.get_row_count("Recipes");
	});
	db.once('db_get_rows_error', function(msg){
		res.send(msg);
	});

	var sqlQ = "SELECT * FROM Pantry WHERE user_name = '" + req.query.user_name + "';";

	db.get_rows(sqlQ);
});
