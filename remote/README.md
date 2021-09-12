# Video Hub App remote

This folder is intentionally left blank. It should include the latest built files from [Video Hub App remote](https://github.com/whyboris/Video-Hub-App-remote) repository.

When building VHA, this folder will be included in the build and will be served by VHA if the user turns on the server inside the app.


### How to use

1) After VHA starts, click the button to _start server_ and navigate to the URL the app displays on your phone or tablet. For better experience, proceed:
2) On iOS you can click the _Share_ icon and then "Add to Home Screen".
3) You can now tap the icon on your home screen to use the _Remote_ 🎉


### Development

First, clone the [Video Hub App remote](https://github.com/whyboris/Video-Hub-App-remote) repository and `yarn install`

1) Edit anything if you'd like and run `yarn run build`
2) Move the newly-generated files from `/dist/remote` to _this folder_
3) Start the _server_ inside the running VHA app, go to the URL it tells you (either on your computer, phone, or tablet) to use the _remote_

You do not need to restart the server to update the _remote_ code, just move whatever newly-built files into _this folder_.

If you install VHA, you can do the same by placing the newly-built _remote_ code to:

- `C:\Program Files\Video Hub App 3\resources\remote` on PC
- `Applications\Video Hub App 3\Contents\Resources\remote` on Mac
