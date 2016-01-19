param($settingsFile = "settings.json")

function Resize-Image
{
  Param([string]$srcFile, [string]$dstFile, [int]$width=0, [int]$height=0, [string]$quality="Default")
  Add-Type -Assembly System
  Add-Type -Assembly PresentationCore

  if ((Test-Path $srcFile) -eq $False)
  {
    Write-Host "srcfile is not found!"
    return
  }
  
	$srcImg = New-Object System.Windows.Media.Imaging.BitmapImage
	$srcImg.BeginInit()
	$srcImg.UriSource = New-Object System.Uri($srcFile, [System.UriKind]::Absolute)
	$srcImg.EndInit()

	$scale = 0
	if ($width -gt 0 -and $height -eq 0)
	{
		$scale = $width / $srcImg.PixelWidth
	}
	elseif ($height -gt 0 -and $width -eq 0)
	{
		$scale = $height / $srcImg.PixelHeight
	}
	else
	{
		Write-Host "Input image size."
		return
	}
	
	$resizedImg = New-Object System.Windows.Media.Imaging.TransformedBitmap $srcImg, (New-Object System.Windows.Media.ScaleTransform $scale, $scale)
	$stream = [System.IO.File]::Open($dstFile, "OpenOrCreate")
	$encoder = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
	$encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($resizedImg))
	$encoder.Save($stream)
	$stream.Dispose()
}

$settings = (Get-Content $settingsFile -Encoding UTF8 | ConvertFrom-Json)
foreach ($item in $settings.targets)
{
	foreach ($file in $item.files)
	{
		foreach ($lang in $item.lang)
		{
			$input = $settings.base_dir + ($file.src -F "", $lang)
			Write-Host $input
			#$temp = $settings.base_dir + ((Get-Date).ToString("'t'hhmmss'.png'"))
			#Copy-Item $input $temp
			foreach ($scale in $item.scale)
			{
				$output = $settings.base_dir + ($file.dst -F $scale, $lang)
				Write-Host $output
				[int]$size = $item.size.size * ($scale / 100)

				if ($item.size.mode -eq "width")
				{
					Resize-Image -srcFile $input -dstFile $output -width $size -quality HighQualityBicubic
				}
				else
				{
					Resize-Image -srcFile $input -dstFile $output -height $size -quality HighQualityBicubic
				}
			}
			#Remove-Item $temp
		}
	}
}