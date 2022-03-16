import React from "react";
import { Key, useInput } from "ink";

export const UseInput2 = (props: {
	callback: (input: string, key: Key) => void;
}) => {
	useInput((input, key) => {
		props.callback(input, key);
	});

	return <></>;
};
