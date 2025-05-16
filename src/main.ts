import Phaser from "phaser";
import MainScene from "./scenes/MainScene";

function getResponsiveSize() {
  const breakpoint = 768;
  const isMobile = window.innerWidth < breakpoint;

  const width = isMobile ? window.innerWidth : 1280;
  const height = isMobile ? window.innerHeight : 800;

  return { width, height };
}

const { width, height } = getResponsiveSize();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  parent: 'app',
  width,
  height,
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