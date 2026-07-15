param(
    [string]$GodotExe = "C:\Users\roder\AppData\Local\Microsoft\WinGet\Packages\GodotEngine.GodotEngine_Microsoft.Winget.Source_8wekyb3d8bbwe\Godot_v4.7.1-stable_win64_console.exe"
)

$projectPath = Split-Path -Parent $PSScriptRoot
$fixturePath = Join-Path $PSScriptRoot "_runner_invalid_suite_fixture.gd"

@'
extends RefCounted

func run_all() -> int:
	this is deliberately malformed
	return 0
'@ | Set-Content -LiteralPath $fixturePath -NoNewline

try {
    $defaultProcess = Start-Process -FilePath $GodotExe -ArgumentList @(
        "--headless",
        "--path", $projectPath,
        "--script", "res://tests/test_runner.gd"
    ) -PassThru -NoNewWindow

    if (-not $defaultProcess.WaitForExit(10000)) {
        $defaultProcess.Kill()
        throw "Godot's default test runner did not exit within 10 seconds."
    }

    if ($defaultProcess.ExitCode -ne 0) {
        throw "Godot's default test runner unexpectedly exited $($defaultProcess.ExitCode)."
    }

    Write-Output "Default-suite regression passed: Godot exited $($defaultProcess.ExitCode)."

    $invalidSuites = @(
        "res://tests/_runner_invalid_suite_fixture.gd",
        "res://tests/_runner_missing_suite.gd"
    )

    foreach ($suitePath in $invalidSuites) {
        $process = Start-Process -FilePath $GodotExe -ArgumentList @(
            "--headless",
            "--path", $projectPath,
            "--script", "res://tests/test_runner.gd",
            "--",
            "--suite=$suitePath"
        ) -PassThru -NoNewWindow

        if (-not $process.WaitForExit(10000)) {
            $process.Kill()
            throw "Godot test runner did not exit within 10 seconds for $suitePath."
        }

        if ($process.ExitCode -eq 0) {
            throw "Godot test runner unexpectedly exited zero for $suitePath."
        }

        Write-Output "Invalid-suite regression passed for ${suitePath}: Godot exited $($process.ExitCode)."
    }
}
finally {
    Remove-Item -LiteralPath $fixturePath -ErrorAction SilentlyContinue
}

exit 0
