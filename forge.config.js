module.exports = {
  packagerConfig: {
    "icon": "./chatgpt",
    "name": "chatGPT",
    "executableName": "chatGPT"
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'Bit-Scripts Team',
        name: 'chatGPT',
        loadingGif: '.\\chatgptfond.png',
        setupIcon: '.\\chatgpt.ico',
        icon: '.\\chatgpt.ico',
        iconUrl: 'https://cdn.discordapp.com/attachments/1082898952191483934/1083117919757680691/chatgpt.ico'
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        title: 'chatGPT',
        background: './installBackground.png',
        format: 'ULFO',
        icon: 'chatgpt.icns'
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Bit-Scripts Team',
          icon: 'chatgpt.png'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'Bit-Scripts Team',
          icon: 'chatgpt.png'
        }
      },
    },
  ],
};
