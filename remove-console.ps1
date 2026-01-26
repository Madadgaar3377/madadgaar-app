# PowerShell script to remove all console statements from TypeScript/TSX files
# This script removes console.log, console.error, console.warn, console.info, console.debug

$projectPath = "e:\madadgar\madadgaar"
$fileExtensions = @("*.ts", "*.tsx")

# Regex pattern to match console statements (single and multi-line)
$consolePattern = '^\s*console\.(log|error|warn|info|debug)\([^;]*\);?\s*$'

$filesProcessed = 0
$linesRemoved = 0

foreach ($ext in $fileExtensions) {
    $files = Get-ChildItem -Path $projectPath -Filter $ext -Recurse -File | 
             Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.expo\\' }
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        $originalLineCount = ($content -split "`n").Count
        
        # Remove single-line console statements
        $newContent = $content -replace '(?m)^\s*console\.(log|error|warn|info|debug)\([^\n]*\);?\s*\r?\n', ''
        
        # Remove multi-line console statements (basic pattern)
        $newContent = $newContent -replace '(?ms)^\s*console\.(log|error|warn|info|debug)\(\s*\{[^}]*\}\s*\);?\s*\r?\n', ''
        
        if ($content -ne $newContent) {
            $newLineCount = ($newContent -split "`n").Count
            $removed = $originalLineCount - $newLineCount
            $linesRemoved += $removed
            $filesProcessed++
            
            Set-Content -Path $file.FullName -Value $newContent -NoNewline
            Write-Host "Processed: $($file.FullName) - Removed $removed lines"
        }
    }
}

Write-Host "`nSummary:"
Write-Host "Files processed: $filesProcessed"
Write-Host "Lines removed: $linesRemoved"
Write-Host "Console statements removed successfully!"
