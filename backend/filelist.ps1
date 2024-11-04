# Define the output file path
$outputFilePath = "file_list.txt"

# Get all files and folders recursively, excluding those in node_modules and dist
Get-ChildItem -Recurse | Where-Object { 
    # Exclude folders that are node_modules or dist, and any files within them
    -not ($_.FullName -like "*node_modules*" -or $_.FullName -like "*dist*")
    # -not ($_.FullName -like "*node_modules*")
} | 
Select-Object -ExpandProperty FullName |
Out-File -FilePath $outputFilePath

Write-Host "File and folder list saved to $outputFilePath"
