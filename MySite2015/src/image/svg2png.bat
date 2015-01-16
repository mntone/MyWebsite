@echo off
setlocal enabledelayedexpansion
set INKSCAPE="C:\Program Files\Inkscape-0.48\INKSCAPE"
set DEFAULT_FLAGS=--without-gui
set FILES=home twitter github pencil
set SIZE=32 48 64
set SCALE=10
for %%f in (%FILES%) do (
	for %%s in (%SIZE%) do (
		set /a SCALE=10*%%s/32
		%INKSCAPE% %DEFAULT_FLAGS% --export-width=%%s --file=%%f.svg --export-png=%%f.!SCALE!.png
	)
)
endlocal