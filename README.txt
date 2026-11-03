Rocket Launch Explorer
======================

GitHub repository: https://github.com/Brayden-I/Rocket-Launch-Explorer

Run it by serving the folder (for example: python3 -m http.server 8000) and
opening http://localhost:8000/index.html. A local server is needed because
Bootstrap 6 is loaded as an ES module, which browsers block on file:// pages.

The page shows a Bootstrap 6 carousel of upcoming launches from the Space Devs
development API (https://lldev.thespacedevs.com/2.3.0). Each slide shows the
launch name above the rocket image. The mission name, launch date and mission
description for the active slide appear below the carousel and update when the
carousel moves. A day selector filters the carousel to launches on one day.

How the callback version works (Part 1)
---------------------------------------
getUpcomingLaunches(callback) is passed a function (handleLaunchList) that it
does not run right away. It creates an XMLHttpRequest and sets onreadystatechange,
which runs every time the request changes state; when readyState is 4 and status
is 200, it uses JSON.parse() on the response text and only then calls
callback(data.results). That means the callback runs after the data has arrived,
which is why the carousel is only built once the launches exist.
getLaunchDetails(launchId, callback) works the same way for one launch.

What changed in the Axios version (Part 2)
------------------------------------------
Both requests now use axios.get(url).then(...).catch(...), and the callback
parameters are gone because the promise chain replaces them. .then() handles a
successful response: it reads the already-parsed data from response.data, clears
the "Loading..." message, and updates the page. .catch() handles a failed
request (a network error or a non-2xx status), logs the error, and shows an
error message in the #status element.

AI disclosure
-------------
I used Claude (Anthropic's AI assistant, through Claude Code) while building
this project. My instructor encourages learning to work with AI agents.

How I prompted it: I shared the assignment page and the starter files and asked
Claude to teach me the project step by step instead of just building it. I chose
the design myself: a Bootstrap 6 carousel with peeking slides, bottom controls
and indicators, a title and description that follow the active launch, and a day
filter. I then asked Claude to write the functions and explain them, to refactor
the requests to Axios and explain how Axios differs from regular promises, and
to write the CSS. When my code threw errors (a misspelled selector, a missing
variable, and missing status helper functions), I pasted the error messages and
Claude explained the causes.

What Claude did: it wrote most of the JavaScript (the XMLHttpRequest callback
version, the Axios version, the carousel and day-filter logic) and the CSS, and
tested them with mock API data in a browser. I could not test against the live
API through Claude, so I ran it myself. What I did: chose the design, ran and
debugged the page, fixed the errors above, made the Git commits, and reviewed
the code so I could explain it. I wrote the explanations in this README in my
own words.

Files
-----
index.html   the page
style.css    custom styling
js/app.js    the JavaScript (Axios version; the callback version is in the Git history)
README.txt   this file
