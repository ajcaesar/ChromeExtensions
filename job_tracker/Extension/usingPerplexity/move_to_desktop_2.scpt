
tell application "System Events"
    set frontApp to name of first application process whose frontmost is true
    set frontmost of process "Google Chrome" to false
    delay 0.5 -- Brief delay to ensure the switch
    set frontmost of process frontApp to true
end tell
