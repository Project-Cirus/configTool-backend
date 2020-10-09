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

const uuid = require('uuid');
const util = require('util');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const config = require('../config'); 
const glob = require('glob');
const Zip = require('./Zip');
var pathResolver = require("path");



/**
 * Class responsible of fetchting the current version of the repository,
 * replacing variables with the user input and ziping it up again.
 */
class Generator {
	
	/**
	 * Generator Contructor
	 * 
	 * @param {Object[]} The list of variable replacements (search => replace)
	 */
	constructor(replacements) {
		this.uuid = uuid.v4();
		this.files = [];
		this.path = null;
		this.workingDir = null;
		this.replacements = replacements;
	}

	/**
	 * Entry point to the class
	 * 
	 * @return {string} path of zip file
	 */
	async generate() {
		try {
			await this.cloneTemplate();
			this.getFilesList();
			await this.replaceVariables();
			const zipPath = await this.zipDirectory();

			return zipPath;
		}
		catch(err) {
			console.log("ERROR:", err)
			return err;
		}
	}

	/**
	 * Use glob to find all files
	 */
	getFilesList() {		
		this.path = pathResolver.join(__dirname, '../../', `${config.temp_path}/${this.uuid}`);
		this.workingDir = pathResolver.join(__dirname, '../../', config.temp_path);
		this.files = glob.sync(`${this.path}/**/*`);
		this.files.push(glob.sync(`${this.path}/**/.env`)[0]);		
	}

	/**
	 * Clone the repo using promises
	 */ 
	cloneTemplate() {
		return new Promise((resolve, reject) => {
			const child = spawn('git', [
					'clone',
					'--depth=1',
					'--branch',
					config.branch,
					config.repo,
					`.${config.temp_path}/${this.uuid}`
				]);

			child.on('exit', (code) => {
			    if(code === 0){
			    	resolve();
			    } else {
			    	reject(`Git process exited with code ${code}`);
			    }
			});
		});
	}

	/**
	 * Make Replacements for the parameters provided by the user.
	 * This function calls all files in the repo
	 */
	replaceVariables() {
		return Promise.all(this.files.map((file) => this.replaceInFile(file)));
	}

	/** 
	 * Make Replacements for the parameters provided by the user.
	 * This function makes the indivitual replacements
	 */
	replaceInFile(path) {

		return new Promise((resolve, reject) => {
			if(fs.lstatSync(path).isDirectory()){
				return resolve();
			}

			fs.readFile(path, 'utf8', (err, data) => {			

				if (err) {
					console.log(err);
					return reject();
				}

				const keys = Object.keys(this.replacements);
				for (let i = 0, len = keys.length; i < len; i++) {
					const key = keys[i];					
					data = data.replace(new RegExp(`{{${key}}}`, "g"), this.replacements[key]);
				}

				fs.writeFile(path, data, 'utf8', err => {
					if (err) {
						console.log(err);
						return reject();
					}
					return resolve();
				});
			});
		});
	}

	/**
	 * Use the Zip component to zip up the generated files
	 *
	 * @return {string} Relative Path to generated zip-file
	 */
	async zipDirectory() {
		const zipPath = pathResolver.join(config.output_path, this.uuid +'.tar.gz')
		const fullPath = pathResolver.join(__dirname, '../../', zipPath);

		const zip = new Zip(this.workingDir);
		zip.addFolder(this.uuid);
		await zip.createZip(fullPath);

		return zipPath;
	}

	/**
	 * List all files in a directory in Node.js 
	 * recursively in a synchronous fashion
	 */
	walkSync(dir, filelist) {

	    const files = fs.readdirSync(dir);
		filelist = filelist || [];
	  	files.forEach(file => {
		    if (fs.statSync(path.join(dir, file)).isDirectory()) {
		      filelist = this.walkSync(path.join(dir, file), filelist);
		    } else {
		      filelist.push(file);
		    }
		});
	  	return filelist;
	};

}

module.exports = Generator;