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

const tar = require('tar');
const fs = require('fs');

/**
 * Wrapper calss for AdmZip
 */
class Zip {

	constructor(workingDir) {
		this.filesForZip = [];
		this.workingDir = workingDir;
	}

	/**
	 * Wraper function for adm-zip::addLocalFile()
	 *
	 * @param {string[]} A list of files to add
	 */
	addFiles(files){

		for (let i = 0, len = files.length; i < len; i++) {
			
			const path = files[i];
			
			if(fs.lstatSync(path).isDirectory()){
				continue;
			}
			
			this.filesForZip.push(path);
		}
	}

	addFolder(path){
		this.filesForZip.push(path);
	}

	/**
	 * Wrapper function for adm-zip::writeZip()
	 *
	 * @param {string} Path of the zip to create
     */
	async createZip(path){		
		await tar.c({
			gzip: true,
			file: path,
			cwd: this.workingDir,
		}, this.filesForZip);

	}
}

module.exports = Zip;