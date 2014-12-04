/// <reference path="../../../typings/es6-promise/es6-promise.d.ts" />

module MntoneLib
{
	"use strict";

	export class HttpClient
	{
		constructor()
		{ }

		getAsync( url: string ): Promise<string>
		{
			return new Promise( ( resolve, reject ) =>
			{
				var xhr = new XMLHttpRequest();
				xhr.open( "GET", url, true );
				xhr.onload = () =>
				{
					if( xhr.status === 200 )
					{
						resolve( xhr.responseText );
					}
					else
					{
						reject( new Error( xhr.statusText ) );
					}
				};
				xhr.onerror = () => { reject( new Error( xhr.statusText ) ); };
				xhr.send();
			});
		}

		getAsJsonAsync( url: string ): Promise<any>
		{
			return this.getAsync( url ).then( ret=> JSON.parse( ret ) );
		}
	}
}