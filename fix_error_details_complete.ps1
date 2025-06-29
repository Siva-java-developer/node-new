# PowerShell script to completely fix error.details occurrences
$filePath = "c:/Users/901148/Downloads/UID (1)/UID/controller/playlist.controller.ts"
$content = Get-Content $filePath -Raw

# Fix the pattern where error.details was removed but left trailing comma and empty line
$pattern1 = ',\s*\n\s*\n\s*\}\);'
$replacement1 = '
                });'

$newContent = $content -replace $pattern1, $replacement1

# Also fix any remaining instances of error: error.details that might have been missed
$pattern2 = ',\s*error:\s*error\.details'
$newContent = $newContent -replace $pattern2, ''

# Fix any trailing commas followed by empty lines before closing braces
$pattern3 = ',\s*\n\s*\n\s*\}\);'
$newContent = $newContent -replace $pattern3, '
                });'

# Write the fixed content back to the file
Set-Content $filePath $newContent

Write-Host "Completely fixed error.details occurrences and formatting in playlist.controller.ts"