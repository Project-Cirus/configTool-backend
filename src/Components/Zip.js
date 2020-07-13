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

const AdmZip = require('adm-zip');
const fs = require('fs');

/**
 * Wrapper calss for AdmZip
 */
class Zip {

	constructor() {
		this.zip = new AdmZip();
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

			this.zip.addLocalFile(path);
		}
	}

	addFolder(path){
		this.zip.addLocalFolder(path, '');
	}

	/**
	 * Wrapper function for adm-zip::writeZip()
	 *
	 * @param {string} Path of the zip to create
     */
	createZip(path){
		console.log("Writing zip to: "+path);
		this.zip.writeZip(path);
	}
}

module.exports = Zip;