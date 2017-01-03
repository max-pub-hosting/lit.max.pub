const PubLit = '../../PubLit/';
const fs = require('fs');


addStyle = (name) => {
	return '<style>' + fs.readFileSync(`-lib/${name}.css`, 'utf-8') + '</style>\n\n';
}
makeRow = (url, year, title) => {
	return `
	<tr> 
		<td> ${year} </td> 
		<td> <a href='${url}'> ${title} </a> </td>
	</tr>
`;
}
mkdir = (dir) => {
	try {
		fs.mkdirSync(dir);
	} catch (e) {
		console.log('DIR exists: ' + dir)
	}
}

buildLanguages = () => {
	console.log('buildLanguages');
	var HTML = '';
	HTML += addStyle('base');
	HTML += `<title>Sprachen</title>`;
	HTML += '<main>';
	HTML += `<h1>Sprachen</h1>`;
	HTML += '<table>'
	fs.readdirSync(PubLit).forEach((item) => {
		if (item[0] == '.') return;
		if (item.substr(-3) == '.md') return;
		HTML += makeRow(item.substr(0, 2), '', item.substr(3));
		// mkdir(item.substr(0, 2));
		buildAuthors(item, item.substr(0, 2));
	});
	HTML += '</table>';
	HTML += '</main>';
	fs.writeFileSync('index.html', HTML);
}


buildAuthors = (sourcePath, targetPath) => {
	console.log('buildAuthors', sourcePath, targetPath);
	mkdir(targetPath);
	var HTML = '';
	HTML += addStyle('base');
	HTML += `<title>Autoren</title>`;
	HTML += '<main>';
	HTML += `<h1>Autoren</h1>`;
	fs.readdirSync(PubLit + sourcePath).forEach((type) => {
		if (type[0] == '.') return;
		if (type[0] == '-') return;
		HTML += `<h2>${type}</h2>\n\n`;
		HTML += '<table>\n'
		fs.readdirSync(PubLit + sourcePath + '/' + type).forEach((author) => {
			if (author[0] == '.') return;
			var url = author.substr(5).split(' ').join('');
			HTML += makeRow(url, author.substr(0, 4), author.substr(5));
			// mkdir(targetPath + '/' + url);
			buildBooks(sourcePath + '/' + type + '/' + author, targetPath + '/' + url);
		});
		HTML += '</table>\n\n\n';
	});
	HTML += '</main>';
	fs.writeFileSync(targetPath + '/index.html', HTML);
}


addBiography = (sourcePath, targetPath) => {
	if (!fs.existsSync(PubLit + sourcePath + '/bio.txt')) return '';
	HTML = `<div class='bio'>\n`;
	HTML += addPicture(sourcePath, targetPath);
	var bio = fs.readFileSync(PubLit + sourcePath + '/bio.txt', 'utf-8');
	bio.split('\n\n').forEach((line) => {
		HTML += `<p>${line}</p>\n`;
		return false;
	})
	HTML += '</div>\n';
	return HTML;
	// return '<p>' + bio.split('\n\n').join('</p>\n\n<p>') + '</p>';
}
addCV = (sourcePath) => {
	if (!fs.existsSync(PubLit + sourcePath + '/cv.txt')) return '';
	var cv = fs.readFileSync(PubLit + sourcePath + '/cv.txt', 'utf-8');
	var HTML = '';
	var parts = cv.split('\n');
	HTML += `<h2>${parts[0]}</h2>\n`;
	HTML += `<table>\n`;
	parts.slice(1).forEach((line) => {
		if (!line.trim()) return;
		HTML += `<tr><td>${line.substr(0,4)}</td><td>${line.substr(5)}</td></tr>\n`;
	});
	HTML += `</table>\n`;
	return HTML;
}
addPicture = (sourcePath, targetPath) => {
	if (!fs.existsSync(PubLit + sourcePath + '/pic.jpg')) return '';

	// fs.createReadStream(PubLit + sourcePath + '/pic.jpg').pipe(fs.createWriteStream(targetPath + '/pic.jpg'));
	fs.readFile(PubLit + sourcePath + '/pic.jpg', (err, file) => {
		fs.writeFile(targetPath + '/pic.jpg', file, (err) => {
			if (!err)
				console.log('saved', targetPath + '/pic.jpg');
			else
				console.log("ERROR SAVING ", targetPath + '/pic.jpg')
		});
	});
	return `<img src='pic.jpg'/>`;
}

buildBooks = (sourcePath, targetPath) => {
	console.log('buildBooks', sourcePath, targetPath);
	var author = sourcePath.split('/').slice(-1)[0].substr(5);
	mkdir(targetPath);
	var HTML = '';
	HTML += `<title>${author}</title>\n`;
	HTML += addStyle('base');
	HTML += addStyle('books');
	HTML += '<main>\n';
	HTML += `<h1>${author}</h1>`;
	HTML += addBiography(sourcePath, targetPath);
	HTML += addCV(sourcePath);
	fs.readdirSync(PubLit + sourcePath).forEach((genre) => {
		if (genre.includes('.')) return;
		HTML += `<h2>${genre}</h2>\n\n`;
		HTML += '<table>\n'
		fs.readdirSync(PubLit + sourcePath + '/' + genre).forEach((book) => {
			if (book[0] == '.') return;
			var url = book.substr(5).split(' ').join('').replace('.md', '');
			HTML += makeRow(url, book.substr(0, 4), book.substr(5).replace('.md', ''));
		});
		HTML += '</table>\n\n\n';
	});
	HTML += '</main>\n';
	fs.writeFileSync(targetPath + '/index.html', HTML);
}


buildLanguages();