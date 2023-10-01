# Video Hub App 3

[_Video Hub App 3_](https://videohubapp.com/) is the fastest way to browse and search for videos on your computer. Think of it like YouTube for videos on your computer: browse, search, and preview. Works on Windows, Mac, and Linux!

## Download Now

This software is available for $5.00 through [videohubapp.com](https://videohubapp.com/download)

$3.50 of every sale goes to the [_cost-effective_](https://www.givewell.org/charities/top-charities) charity [Against Malaria Foundation](https://www.againstmalaria.com/).

![video-hub-app](https://user-images.githubusercontent.com/17264277/82097107-3ed91700-96d0-11ea-8679-87fa3e07cd0b.jpg)

## About

_Video Hub App_ was created by [Boris Yakubchik](https://videohubapp.com/en/about). It uses the frameworks _Angular_ and _Electron_.

## License

This software was built on top of [`angular-electron`](https://github.com/maximegris/angular-electron) by [Maxime GRIS](https://github.com/maximegris). It carries an _MIT_ license (see the _LICENSE_ file). While the license is permissive, I ask that you do not distribute free copies of this software unless you have significantly changed it.

## Contributing

I would love to see the improvements you make to this app and am happy to accept pull requests. You can reach out if you'd like to coordinate / collaborate, or just _jump to [issues](https://github.com/whyboris/Video-Hub-App/issues)_ to see what's already getting worked on and to add new suggestions!

Please consider improving any of the translations, or [add a new translation](https://github.com/whyboris/Video-Hub-App/tree/master/i18n)!

Please consider improving or adding an icon to the app. It's a simple process, just [follow the instructions](https://github.com/whyboris/Video-Hub-App/tree/master/src/app/components/icon)!

Please see the [Code of Conduct](https://github.com/whyboris/Video-Hub-App/blob/main/CODE_OF_CONDUCT.md) before contributing.

## How to Contribute
Fork the Repository:
- Fork the repository by clicking the fork button at the top of this page. This will create a copy of this repository to your personal account.

Clone the repository to your personal machine:
- Open your forked repository on your GitHub account.
- Click the code button and copy the provided URL.
- Open the terminal and run the following git command: `git clone <Copied URL>`
- Navigate to the repository directory on your machine.

Create a new Branch where you will make your changes:
- Create a new branch by running `git branch <Branch Name>`
- Switch to the new branch using `git checkout <Branch Name>`

Add and commit your changes:
- Add your changes to the branch using `git add`
- Commit your changes using `git commit -m <Changes>`
- Push your changes to your branch using `Git push -u origin <Branch Name>` 

Create a pull request:
- In your personal repository, navigate to the Pull Requests tab and open a new pull request.

## Upcoming features

See [issues](https://github.com/whyboris/Video-Hub-App/issues) for what is in progress.

## Development

⚠ The repository is usually ahead of the publicly [released version](https://github.com/whyboris/Video-Hub-App/releases) - it is 🚧 WIP and may have bugs in it.

How to start:

- `npm install` to install (you may need to run `npm install --legacy-peer-deps` if install fails)
- `npm start` to develop
- `npm run electron` to build

Main dependencies in use:

| Library          | Version | Date      | Comment |
| ---------------- | ------- | --------- | ------- |
| Angular          | v16     | Sept 2023 |         |
| Angular-CLI      | v16     | Sept 2023 |         |
| Electron         | v26     | Sept 2023 | (internally uses Node `v18.16.1` and Chromium 116) |
| Electron Builder | v24     | Sept 2023 |         |

- **Node**: It may be best to use the same version as _Electron_ uses internally (`v18.16.1`)

- **Angular CLI**: not required but may be useful: [Angular CLI](https://cli.angular.io).

- **Mac**: We now have `M1` and `Intel` builds, but you may need to manually update the _FFmpeg_ and _FFprobe_ executables if you're building for a different architecture than you are on.

To help debug a production build of VHA you can use [Debugtron](https://github.com/bytedance/debugtron)

## Remote

👩‍🚀 a new feature in VHA is the option for the user to turn on a _server_ after the app starts. This will let the user open a simpler version of the VHA user interface on their phone or tablet (if both PC and device are on the same WiFi) and use it as remote control to play videos 🚀

For details, see [instructions](https://github.com/whyboris/Video-Hub-App/blob/master/remote/README.md).

## Thank you

This software would not be possible without the tremendous work by other people:

- [Angular](https://github.com/angular/angular)
- [Electron](https://github.com/electron/electron)
- [FFmpeg](https://www.ffmpeg.org/)
- [angular-electron](https://github.com/maximegris/angular-electron)
- [ngx-virtual-scroller](https://github.com/rintoj/ngx-virtual-scroller)
- [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static)
- [@ffprobe-installer/ffprobe](https://github.com/SavageCore/node-ffprobe-installer)
- [ngx-translate](https://github.com/ngx-translate/core)
- [fdir](https://github.com/thecodrr/fdir)
- [async](https://github.com/caolan/async)
- [chokidar](https://github.com/paulmillr/chokidar)
- [trash](https://github.com/sindresorhus/trash)
- [Fuse.js](https://github.com/krisk/Fuse)
- [electron-window-state](https://github.com/mawie81/electron-window-state)

This software uses libraries from the FFmpeg project under the LGPLv2.1 with binaries from [here](https://github.com/kribblo/node-ffmpeg-installer#the-binaries)

Since becoming open source, this software was made better with the awesome contributions by [cal2195](https://github.com/cal2195)
