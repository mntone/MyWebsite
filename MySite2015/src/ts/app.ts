/// <reference path="./NavigationClient.ts" />

import mns = MntoneSite;

class NavgationController
{
	primaryList: HTMLUListElement;
	secondaryList: HTMLUListElement;
	client: mns.NavigationClient;

	constructor( primaryList: HTMLUListElement, secondaryList: HTMLUListElement, lang: string )
	{
		this.primaryList = primaryList;
		this.secondaryList = secondaryList;
		this.client = new mns.NavigationClient( lang );
	}

	loadAsync()
	{
		return this.client.getDataAsync().then( nav =>
		{
			nav.map( n =>
			{
				var img = <HTMLImageElement>document.createElement( "img" );
				img.src = n.icon;
				img.alt = n.title;
				var icon = <HTMLSpanElement>document.createElement( "span" );
				icon.className = "image";
				icon.appendChild( img );
				var text = <HTMLSpanElement>document.createElement( "span" );
				text.className = "text";
				text.setAttribute( "itemprop", "name" );
				text.appendChild( document.createTextNode( n.title ) );
				var a = <HTMLAnchorElement>document.createElement( "a" );
				a.href = n.url;
				a.setAttribute( "itemprop", "url" );
				a.appendChild( icon );
				a.appendChild( text );
				var li = <HTMLLIElement>document.createElement( "li" );
				li.appendChild( a );
				if( n.expand )
				{
					this.secondaryList.appendChild( li );
				}
				else
				{
					this.primaryList.appendChild( li );
				}
			});
		});
	}
}

window.onload = () =>
{
	var lang = document.documentElement.lang;
	var primary = <HTMLUListElement>document.getElementById( "primary-list" );
	var secondary = <HTMLUListElement>document.getElementById( "secondary-list" );
	var con = new NavgationController( primary, secondary, lang );
	con.loadAsync();
};