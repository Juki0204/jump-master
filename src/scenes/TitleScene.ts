import Phaser from "phaser";

class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  preload() {
  }

  create() {
    const tapToStart = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.3).setDepth(10).setOrigin(0, 0).setInteractive();
    this.add.text(this.cameras.main.width / 2, (this.cameras.main.height / 2) - 70, 'JUMP', { fontSize: 60, fontStyle: 'bold' }).setDepth(12).setOrigin(0.5, 0.5);
    this.add.text(this.cameras.main.width / 2, (this.cameras.main.height / 2) - 20, 'MASTER', { fontSize: 60, fontStyle: 'bold' }).setDepth(12).setOrigin(0.5, 0.5);

    this.add.text(this.cameras.main.width / 2, (this.cameras.main.height / 2) + 100, 'TAP TO START', { fontSize: 30, fontStyle: 'bold' }).setDepth(12).setOrigin(0.5, 0.5);

    tapToStart.on('pointerdown', () => {
      this.scene.stop();
      this.scene.resume('MainScene');
    });
  }
}

export default TitleScene;
