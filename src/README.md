
Overview of the App
-----------------------

app - global state, configuration and entry point
assets - pictures, icons, etc.
components - a component consisting of a typescript file and often a html template and style file.
Only contains components that are used within the page somewhere, not whole pages. Does not handle state changes,
  all events are bubbled up until they reach a page and are handled there (with small exceptions). Data is obtained from parent components or the store
lib - small typescript classes / functions that are used throughout the App
pages - top-level components that contain a complete page and handles event logic by interacting with the store
server - handles communication with the server & contains interfaces for server data
store - caching and storing server data and local state. The store interacts with the server to obtain data and reacts to server and local events,
  i.e. it acts as a model and a controller, especially the 'state' part with handles the local state.
theme - global style files

The whole App is written in TypeScript using ionic 2 with angular 2.
For observing state changes usually mobx is used, with small parts handled in RxJS.
