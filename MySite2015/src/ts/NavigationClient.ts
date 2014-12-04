/// <reference path="base/MntoneLibrary.ts" />

module MntoneSite
{
	"use strict";

	export class Navigation
	{
		expand: boolean;
		title: string;
		url: string;
		icon: string;
	}

	export class NavigationClient
	{
		client: MntoneLib.HttpClient;
		lang: string;
		navigations: Array<Navigation>;

		constructor( lang: string )
		{
			this.lang = lang;
			this.client = new MntoneLib.HttpClient();
		}

		getDataAsync(): Promise<Navigation[]>
		{
			return this.client.getAsJsonAsync( "/d/nav-" + this.lang + ".json" ).then( j =>
			{
				return <Navigation[]>j;
			});
		}
	}
}