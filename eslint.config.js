export default [
	{
		files: ["src/**/*.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module"
		},
		rules: {
			"no-unused-vars": "warn",
			"no-undef": "error"
		}
	}
];
