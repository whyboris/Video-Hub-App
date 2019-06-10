# Demo

This folder contains files for showing a web preview of the app.

First build the app (`npm run build`) with the web-demo flag `webDemo` set to `true` (in `home.component.ts`). This should populate the `/dist` folder with `index.html`. 

Now when you open the `index.html` within this folder, you should see a web version of the app with sample demo content. 

_Note:_ 

- After release of Video Hub App 1.4.0 the demo code was not maintained and will need editing to get to work (the `.vha` sample object changed its interface significantly since then). 

- The web demo does not have any importing functionality - it only shows the static files hard-coded into the app when building. 

- Please reach out via GitHub _Issues_ if you have trouble getting this to work.
