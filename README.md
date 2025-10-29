# LogAnalyser

##1. Will venv go away when I close VS Code?
No, the venv folder stays permanently in your project folder. It's a real folder on your computer.
However:
When you close VS Code and reopen it, the terminal might NOT show (venv) automatically
You'll need to reactivate it each time you start working: bashsource venv/bin/activate

IMPORTANT: After installing new libraries/packages, update requirements.txt:
pip freeze > requirements.txt
This saves the list of ALL packages so your teammates can install them.
