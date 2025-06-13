import Phaser from "phaser";


class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  preload() { };

  create(data: any) {
    //ゲームオーバー処理
    if (data.state == 'gameover') {
      this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8).setDepth(10).setOrigin(0, 0);
      const gameoverTxt = this.add.text(this.cameras.main.width / 2, (this.cameras.main.height / 2) - 100, 'GAME OVER', { fontSize: 64, fontStyle: 'bold' }).setOrigin(0.5, 0.5).setDepth(10);
      const gameoverScore = this.add.text(this.cameras.main.width / 2, (this.cameras.main.height / 2) - 40, `今回のスコア：${data.score / 100}m`, { fontSize: 32, fontStyle: 'bold', padding: { x: 10, y: 10 } }).setOrigin(0.5, 0.5).setDepth(10);
      const restartTxt = this.add.text(this.cameras.main.width / 2, (this.cameras.main.height / 2) + 100, 'RESTART', { fontSize: 30, fontStyle: 'bold' }).setDepth(12).setOrigin(0.5, 0.5).setInteractive();

      restartTxt.setScrollFactor(0);
      gameoverTxt.setScrollFactor(0);
      gameoverScore.setScrollFactor(0);

      restartTxt.on('pointerdown', () => {
        this.scene.stop();
        this.scene.stop('MainScene');
        this.scene.start('MainScene', { restart: true });
      });
    }

    //ゲームクリア処理
    if (data.state == 'gameclear') {
      this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8).setDepth(10).setOrigin(0, 0);
      const gameClearTxt = this.add.text(this.cameras.main.width / 2, (this.cameras.main.height / 2) - 100, 'CLEAR!', { fontSize: 64, fontStyle: 'bold' }).setOrigin(0.5, 0.5).setDepth(10);
      const gameClearScore = this.add.text(this.cameras.main.width / 2, (this.cameras.main.height / 2) - 40, `${data.score / 100}m まで登った！`, { fontSize: 32, fontStyle: 'bold', padding: { x: 10, y: 10 } }).setOrigin(0.5, 0.5).setDepth(10);
      const restartTxt = this.add.text(this.cameras.main.width / 2, (this.cameras.main.height / 2) + 100, 'RESTART', { fontSize: 30, fontStyle: 'bold' }).setDepth(12).setOrigin(0.5, 0.5).setInteractive();

      restartTxt.setScrollFactor(0);
      gameClearTxt.setScrollFactor(0);
      gameClearScore.setScrollFactor(0);

      restartTxt.on('pointerdown', () => {
        this.scene.stop();
        this.scene.stop('MainScene');
        this.scene.start('MainScene', { restart: true });
      });
    }
  }
}

export default ResultScene;
