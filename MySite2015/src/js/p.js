"use strict";

var _window = window;
var _document = document;
var header, nav;
var original;

function update()
{
	if( header )
	{
		original = header.offsetTop + header.clientHeight;
	}
}

function ignore()
{ }

function onscroll( e )
{
	window.scrollY >= original ? nav.classList.add( "sticky" ) : nav.classList.remove( "sticky" )
}

window.onload = function ()
{
	header = _document.getElementsByTagName( "header" )[0];
	nav = _document.getElementsByTagName( "nav" )[0];
	update();
	_window.addEventListener( "resize", update );
	if( typeof _window.onorientationchange === "object" )
	{
		window.addEventListener( "orientationchange", update );
	}
	_document.addEventListener( "touchstart", ignore );
	_document.addEventListener( "scroll", onscroll );

	if( typeof _document.msCSSOMElementFloatMetrics !== "undefined" )
	{
		_document.msCSSOMElementFloatMetrics = !0
	}
};