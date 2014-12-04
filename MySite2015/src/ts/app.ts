/// <reference path="./NavigationClient.ts" />

import mns = MntoneSite;

class NavgationController
{
	element: HTMLUListElement;
	client: mns.NavigationClient;

	constructor( element: HTMLUListElement, lang: string )
	{
		this.element = element;
		this.client = new mns.NavigationClient( lang );
	}

	loadAsync()
	{
		return this.client.getDataAsync().then( nav =>
		{
			nav.map( n =>
			{
				var span = <HTMLSpanElement>document.createElement( "span" );
				span.setAttribute( "itemprop", "name" );
				span.appendChild( document.createTextNode( n.title ) );
				var a = <HTMLAnchorElement>document.createElement( "a" );
				a.href = n.url;
				a.setAttribute( "itemprop", "url" );
				a.appendChild( span );
				var li = <HTMLLIElement>document.createElement( "li" );
				li.appendChild( a );
				this.element.appendChild( li );
			});
		} );
	}
}

window.onload = () =>
{
	var lang = document.documentElement.lang;
	var navUl = <HTMLUListElement>document.getElementById( "nav-ul" );
	var con = new NavgationController( navUl, lang );
	con.loadAsync();
};