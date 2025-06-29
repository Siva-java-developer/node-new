# PowerShell script to fix error.details occurrences
$filePath = "c:/Users/901148/Downloads/UID (1)/UID/controller/playlist.controller.ts"
$content = Get-Content $filePath -Raw

# Replace all occurrences of "error: error.details" with just the error message
$newContent = $content -replace 'error: error\.details', ''

# Also fix the case where there might be trailing commas
$newContent = $newContent -replace ',\s*error: error\.details', ''

# Write the fixed content back to the file
Set-Content $filePath $newContent

Write-Host "Fixed error.details occurrences in playlist.controller.ts"