import Phaser from "phaser";
import MainScene from "./scenes/MainScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  parent: 'app',
  width: 1280,
  height: 800,
  backgroundColor: '#2d2d2d',
  physics: { //物理演算
    default: 'arcade', //使用する物理エンジンの指定
    arcade: { //詳細設定
      gravity: { x: 0, y: 2000 },
      debug: false
    },
  },
  scene: [
    MainScene,
  ]
};

new Phaser.Game(config);