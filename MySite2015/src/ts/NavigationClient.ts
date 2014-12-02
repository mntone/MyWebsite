/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../../typings/es6-promises/es6-promises.d.ts" />

module MntoneSite
{
	"use strict";

	export class Navigation
	{
		url: URL;
		title: string;
	}

	export class NavigationClient
	{
		navigations: Array<Navigation>;

		constructor()
		{ }

		getDataAsync()
		{
			return new Promise( () => { } );
		}
	}
}