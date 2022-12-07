const fs = require("fs");
const path = require("path");
module.exports = {
	// source-map关闭
	productionSourceMap: false,
	// devServer: {
	//   https: {
	//     cert: fs.readFileSync(path.join(__dirname, "src/ssl/cert.crt")),
	//     key: fs.readFileSync(path.join(__dirname, "src/ssl/cert.key")),
	//   },
	//   port: 8080,
	//   open: true,
	// },
};
