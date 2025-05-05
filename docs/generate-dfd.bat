@echo off
echo Generating Data Flow Diagrams...

:: Check if PlantUML is available
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Java is required for PlantUML but was not found
    goto :EOF
)

:: Create directory for output
if not exist "diagrams" mkdir diagrams

:: Extract PlantUML code from the Markdown file
findstr /B "```plantuml" /C:"@startuml" /C:"@enduml" /C:" " DataFlowDiagram.md > temp_dfd.puml

:: Download PlantUML jar if not present
if not exist "plantuml.jar" (
    echo Downloading PlantUML...
    powershell -Command "Invoke-WebRequest -Uri https://sourceforge.net/projects/plantuml/files/plantuml.jar/download -OutFile plantuml.jar"
)

:: Generate diagrams
java -jar plantuml.jar -tpng temp_dfd.puml -o diagrams

:: Clean up temporary files
del temp_dfd.puml

echo DFD generation complete. Diagrams saved in the 'diagrams' folder.
