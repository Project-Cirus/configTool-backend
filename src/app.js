/**
 * This file is part of Project Cirus
 *
 * Project Cirus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Project Cirus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Project Cirus. If not, see <http://www.gnu.org/licenses/>.
 */

const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
var cors = require('cors');
const app = express();

const package = require('../package.json')
const config = require('./config');

const Generator = require('./Components/Generator');

app.use(cors());
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))
app.use('/generated', express.static('generated'));
app.use('/.well-known', express.static('.well-known'));


app.get('/info', (req, res) => {
	res.send({
		'name': package.name,
		'version': package.version,
		'status': 'online',
		'endpoints': {
			'/info': {
				'method': ['GET']
			},
			'/generate': {
				'method': ['POST']
			}
		}
	})
});


app.post('/generate', (req, res) => {
	

	const generator = new Generator(req.body);
	const result = generator.generate();

	result.then(zipPath => {
		res.json({
			'success': true,
			'zipPath': zipPath
		}); 
	});	
});


https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/configtool.project-cirus.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/configtool.project-cirus.com/fullchain.pem'),
}, app)
.listen(config.port, function() {
	  console.log(`Configuration tool backend listening on port ${config.port}!`);
});
