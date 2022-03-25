#!/usr/bin/env node
import React from "react";
import { render } from "ink";
import meow from "meow";
import App from "./ui";

import { licence } from "./lib/settingWrapers/settWarper";
import checkLicense from "./lib/hyperAuth";

const cli = meow(
	`
	Usage
	  $ parakeet-minter-cli

	Options
		--name  Your name

	Examples
	  $ parakeet-minter-cli --name=Jane
	  Hello, Jane
`,
	{
		flags: {
			name: {
				type: "string",
			},
		},
	}
);

checkLicense(licence).then((v) => {
	if (v.status) {
		render(<App name={cli.flags.name} />);
	} else {
		console.log(v.error);
	}
});
