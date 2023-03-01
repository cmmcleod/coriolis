import nodeResolve from "@rollup/plugin-node-resolve";

export default {
	  entry: "d3-funcs.js",
	  format: "umd",
	  moduleName: "d3",
	  plugins: [nodeResolve({jsnext: true})],
	  dest: "d3.js"
};
