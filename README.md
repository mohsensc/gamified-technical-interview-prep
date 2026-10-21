# TechPrep

TechPrep is a coding interview prep app you run on your own computer.
It has lessons, company-tagged problems, quizzes, mini-games and a progress tracker.

## Run it

You need Node.js 22.13 or newer (check with `node -v`). Get it at https://nodejs.org.

```
git clone https://github.com/mohsensc/gamified-technical-interview-prep.git
cd gamified-technical-interview-prep
npm install
npm start
```

Then open http://localhost:5317 in your browser. Press Ctrl+C in the terminal to stop it.
There is no account and no sign-in. Everything stays on your machine.

## Your progress

Progress lives in one file, `data/techprep.db`, created when the app first starts.
Back it up by copying that file, or use Settings, then Export, for a JSON copy.
To start over, use Settings, then Reset, or stop the app and delete the `data` folder.

Want to add or fix content? Start with [docs/](docs/README.md).
