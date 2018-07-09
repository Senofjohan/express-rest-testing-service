const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

var DATABASE_ID = 1;
const JENKINS_REMOTE_TRIGGER_TOKEN = 'secretKey';

// mock database to store test runs triggered by users
const database = {
	users: [
	{
		id: '123',
		name: 'Josh',
		email: 'josh@gmail.com',
		password: 'secret'
	},
	{
		id: '124',
		name: 'Axios',
		email: 'axios@gmail.com',
		password: 'password'
	}
	],
	testRuns: [
	]
}

app.get('/', function(req,res){
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/test', (req, res)=> {

	const { testType, duration, platform, testCaseIDS } = req.body;

 	if (testType=="performance") {
 		// mock url for triggering performance test
 		let url = 'https://www.hp-alm.com/performance/' + platform + '/' + duration;
 		console.log("'GET':" + url);
 		axios.get(url)
	  		.then(res => {
	    console.log(res.data);
	  })
	  .catch(error => {
	    console.log(error);
	  });

	  res.send('performance test executed');
 	} else if (testType=="functional") {
		DATABASE_ID++; // TODO: refactor to insert into db
 		database.testRuns.push([ DATABASE_ID, testType, duration, platform, testCaseIDS]);
 		console.log(database.testRuns);

 		// Trigger Jenkins job to run
 		let url = 'https://jenkinsserver.com/view/jobs/functional?remoteBuild&token=' + JENKINS_REMOTE_TRIGGER_TOKEN + '&id=' + DATABASE_ID;
 		console.log("'GET':" + url);
 		axios.get(url)
	  		.then(res => {
	    console.log(res.data);
	  })
	  .catch(error => {
	    console.log(error);
	  });
 		res.send('functional test executed');
 	}
})

app.post('/signin', (req, res)=> {
	if (req.body.email.toLowerCase() === database.users[0].email &&
		req.body.password === database.users[0].password ) {
		res.json('success');
	} else {
		res.status(400).json('error logging in');
	}
	res.json('Signing in');
})

app.listen(3000, ()=> {
	console.log('app is running on port 3000');
})