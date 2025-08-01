import Phaser from "phaser";
import Player from "../characters/Player";
import GroundBlock from "../maps/GroundBlock";

let titleSceneLaunched = false;

class MainScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private player!: Player;
  private platform!: Phaser.Physics.Arcade.StaticGroup;
  private currentGroundY: number = 4000;
  private logFlg = false;
  private isGameOver = false;

  //ステージの広さ
  private mapWidth: number = 1280;
  private mapHeight: number = 4000;

  private objectScale: number = window.innerWidth < 768 ? 0.4 : 0.6;

  //UI
  private score: number = this.mapHeight - this.currentGroundY;
  private uiScore!: Phaser.GameObjects.Text;

  //パワーゲージ生成
  private gaugeContainer!: Phaser.GameObjects.Container;
  private gaugeX: number = 50;
  private gaugeY: number = 400;
  private gaugeWidth: number = 20;
  private gaugeMaxHeight: number = 200;
  private flickFlg: boolean = false;
  private startY: number = 0;
  private flickDir: 'minus' | 'plus' | 'equal' = 'equal';

  // private gaugeGradient!: Phaser.GameObjects.Graphics;
  private gaugeMask!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // アセット読み込み時のローディング画面作成
    const progressBarBg = this.add.graphics().setDepth(50);
    progressBarBg.fillStyle(0xffffff, 1);
    progressBarBg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    const fontFamily = '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif';

    const progressBar = this.add.graphics().setDepth(50);
    const loadingTxt = this.add.text(this.cameras.main.width / 2, (this.cameras.main.height / 2) - 30, 'ロード中...', { fontFamily: fontFamily, fontStyle: 'bold', fontSize: 20, color: '#333333', padding: { x: 0, y: 3 } }).setOrigin(0.5, 0.5).setDepth(50);
    const percentTxt = this.add.text(this.cameras.main.width / 2, (this.cameras.main.height / 2) + 30, '0%', { fontFamily: fontFamily, fontStyle: 'bold', fontSize: 20, color: '#333333' }).setOrigin(0.5, 0.5).setDepth(50);

    this.load.on('progress', (value: number) => {
      progressBar.clear();

      progressBar.fillStyle(0x333333, 1);
      progressBar.fillRoundedRect(100, this.cameras.main.height / 2, (this.cameras.main.width - 200) * value, 10, 3);

      percentTxt.setText(Math.floor(value * 100) + '%');
    });

    Player.preload(this);
    // this.load.image('ground', 'assets/platform.png');
    this.load.image('cloud1', 'assets/maps/cloud1.png');
    this.load.image('cloud2', 'assets/maps/cloud2.png');
    this.load.image('cloud3', 'assets/maps/cloud3.png');
    this.load.image('cloud4', 'assets/maps/cloud4.png');
    this.load.image('sky', 'assets/maps/sky.png');
    this.load.image('ground', 'assets/maps/ground.png');
    this.load.atlas('maps', 'assets/maps/spritesheet_dot.png', 'assets/maps/spritesheet.json');

    // ロード完了後にタイトル画面を生成
    this.load.on('complete', () => {
      this.tweens.add({
        targets: [progressBarBg, progressBar, loadingTxt, percentTxt],
        alpha: 0,
        duration: 10,
        onComplete: () => {
          progressBarBg.destroy();
          progressBar.destroy();
          loadingTxt.destroy();
          percentTxt.destroy();

          if (!titleSceneLaunched) {
            this.scene.launch('TitleScene');
            this.scene.pause();
            titleSceneLaunched = true;
          }
        }
      });
    });
  }

  create() {

    this.cursors = this.input!.keyboard!.createCursorKeys();
    this.spaceKey = this.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    //UI
    this.uiScore = this.add.text(10, 10, `登った高さ:${this.score}m`, { fontSize: 32, fontStyle: 'bold', padding: { x: 10, y: 10 } }).setOrigin(0, 0).setDepth(10);
    this.uiScore.setScrollFactor(0);

    //背景の生成
    this.add.image(0, 0, 'sky').setOrigin(0, 0);
    this.add.image(this.mapWidth / 2, this.mapHeight - 40, 'cloud4').setOrigin(0.5, 1);
    this.add.image(0, this.mapHeight, 'ground').setOrigin(0, 1);

    this.add.image(-40, this.mapHeight - 500, 'cloud1').setOrigin(0, 1).setScale(0.5);
    this.add.image(266, this.mapHeight - 800, 'cloud2').setOrigin(0, 1).setScale(0.5);
    this.add.image(900, this.mapHeight - 930, 'cloud3').setOrigin(0, 1).setScale(0.5);
    this.add.image(-260, this.mapHeight - 1340, 'cloud3').setOrigin(0, 1).setScale(0.5);
    this.add.image(640, this.mapHeight - 1400, 'cloud1').setOrigin(0, 1).setScale(0.5);
    this.add.image(266, this.mapHeight - 1920, 'cloud2').setOrigin(0, 1).setScale(0.5);
    this.add.image(1040, this.mapHeight - 1960, 'cloud1').setOrigin(0, 1).setScale(0.5);
    this.add.image(720, this.mapHeight - 2040, 'cloud1').setOrigin(0, 1).setScale(0.5);
    this.add.image(-370, this.mapHeight - 2460, 'cloud2').setOrigin(0, 1).setScale(0.5);
    this.add.image(266, this.mapHeight - 2860, 'cloud3').setOrigin(0, 1).setScale(0.5);
    this.add.image(900, this.mapHeight - 3320, 'cloud2').setOrigin(0, 1).setScale(0.5);
    this.add.image(140, this.mapHeight - 3670, 'cloud1').setOrigin(0, 1).setScale(0.5);

    this.platform = this.physics.add.staticGroup();

    //地面の生成
    for (let x = 0; x * this.objectScale < this.mapWidth; x += 62) {
      this.platform.create(x * this.objectScale, this.mapHeight, 'maps', 'terrain_grass_block_top').setScale(this.objectScale).setOrigin(0, 1).refreshBody();
    }

    new GroundBlock(this, this.platform, 360, this.mapHeight - 170, 3, 'right', 'grass');
    new GroundBlock(this, this.platform, 540, this.mapHeight - 300, 3, 'right', 'grass');

    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight); //カメラの移動範囲
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight); //物理演算の範囲

    Player.createAnims(this);

    this.player = new Player(this, 500, this.mapHeight - 50);
    this.physics.add.collider(this.player.sprite, this.platform, (_playerObj, groundObj) => {
      this.currentGroundY = (groundObj as Phaser.Physics.Arcade.Sprite).y;
    });

    this.cameras.main.startFollow(this.player.sprite, true, 1, 1, -10, 0); //カメラの追従設定

    //パワーゲージ生成
    this.gaugeContainer = this.add.container().setScrollFactor(0).setDepth(2);
    this.gaugeX = 20;
    this.gaugeY = this.cameras.main.height - 20;
    this.gaugeWidth = 20;
    this.gaugeMaxHeight = 200;

    // this.gaugeGradient = this.add.graphics();
    this.gaugeMask = this.add.graphics();
    this.gaugeMask.setDepth(20);

    this.gaugeContainer.add([this.gaugeMask]);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.flickFlg = true;
      this.startY = pointer.y;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.startY < pointer.y) {
        this.flickDir = 'plus';
      } else {
        this.flickDir = 'minus';
      }
    });

    this.input.on('pointerup', (_pointer: Phaser.Input.Pointer) => {
      this.flickFlg = false;
      this.updatePowerGauge(0);
    });

    ////////////////////////// デバッグモード //////////////////////////
    // this.physics.world.createDebugGraphic();
    // this.physics.world.defaults.debugShowBody = true;
    // this.physics.world.defaults.debugShowVelocity = true;
    // this.physics.world.drawDebug = true;
  }

  update() {
    this.player.update(this.cursors, this.spaceKey);

    //ESCキーでシーンリセット
    if (this.escKey.isDown) {
      this.scene.restart();
    }

    //ランダム足場生成
    if ((this.player.sprite.body! as Phaser.Physics.Arcade.Body).onFloor()) {
      if (this.logFlg === false) {
        // console.log('着地なう');
        console.log('今接地している足場の高さは:', this.currentGroundY);
        this.logFlg = true;
        // this.playerX = (this.player.sprite.body as Phaser.Physics.Arcade.Body).x;
        // this.playerY = (this.player.sprite.body as Phaser.Physics.Arcade.Body).y;

        //console.log(this.platform.children.entries.filter(block => (block as Phaser.Physics.Arcade.Sprite).y === this.currentGroundY)); //今乗ってる足場

        //自分の着地した足場より200px以上下にある足場の削除（最下層の地面は除外
        let destroyBlock = this.platform.children.entries.filter(block => (block as Phaser.Physics.Arcade.Sprite).y - 200 > this.currentGroundY && (block as Phaser.Physics.Arcade.Sprite).y < this.mapHeight);
        // console.log('今からブロック消えます');
        // console.log(destroyBlock);
        destroyBlock.forEach(block => {
          const sprite = block as Phaser.Physics.Arcade.Sprite;

          //足場落下アニメーション
          this.tweens.add({
            targets: sprite,
            alpha: { from: 1, to: 0 },
            y: sprite.y + 50,
            duration: 300,
            // delay: 300,
            ease: 'Cubic.easeIn',
            onComplete: () => {
              block.destroy();
            }
          });
        });

        //現在の足場と同時に生成された足場の2つをカウント
        let currentMoreBlock = this.platform.children.entries.filter(block => (block as Phaser.Physics.Arcade.Sprite).y <= this.currentGroundY);
        let currentMoreBlockY = currentMoreBlock.map(obj => (obj as Phaser.Physics.Arcade.Sprite).y);
        let currentMoreBlockCount = new Set(currentMoreBlockY).size
        // console.log(currentMoreBlock);
        console.log(currentMoreBlockCount, this.currentGroundY, this.mapHeight - 290);

        //現在の足場と同時に生成された足場のどちらかに乗った時点で次の足場を生成する（地面と初期生成のブロックは除外）
        if (currentMoreBlockCount <= 2 && this.currentGroundY < this.mapHeight - 290) {
          const currentBlock = this.platform.children.entries.filter(block => (block as Phaser.Physics.Arcade.Sprite).y === this.currentGroundY);

          // console.log(
          //   (currentBlock[0] as Phaser.Physics.Arcade.Sprite).x,
          //   (currentBlock[currentBlock.length - 1] as Phaser.Physics.Arcade.Sprite).x + (currentBlock[currentBlock.length - 1] as Phaser.Physics.Arcade.Sprite).body!.width
          // );

          const leftEndPoint = (currentBlock[0] as Phaser.Physics.Arcade.Sprite).body!.x;
          const rightEndPoint = (currentBlock[currentBlock.length - 1] as Phaser.Physics.Arcade.Sprite).x + (currentBlock[currentBlock.length - 1] as Phaser.Physics.Arcade.Sprite).body!.width;
          const randomX = blockCreateRondomX2(leftEndPoint, rightEndPoint);
          console.log(randomX);

          for (let i = 1; i <= 2; i++) {
            const randomY = Math.floor(Math.random() * (180 - 80 + 1)) + 80; //恐らくジャンプで届く最大高度
            const randomLength = Math.floor(Math.random() * (4 - 2 + 1)) + 2;
            console.log(randomY);

            //着地点から見て左右に1つずつ生成する
            if (i === 1) {
              new GroundBlock(this, this.platform, randomX[0], this.currentGroundY - randomY, randomLength, 'left', 'grass');
            } else {
              new GroundBlock(this, this.platform, randomX[1], this.currentGroundY - randomY, randomLength, 'right', 'grass');
            }
          }
        }
      }
    } else {
      this.logFlg = false;
    }

    //パワーゲージ可変
    if (this.flickFlg && this.flickDir === 'plus') {
      const dragPercent = this.player.getJumpPowerPercent();
      this.updatePowerGauge(dragPercent);
    }

    if (!this.isGameOver) {
      //ゲームオーバー処理
      if ((this.player.sprite.body as Phaser.Physics.Arcade.Body).y && (this.player.sprite.body as Phaser.Physics.Arcade.Body).y - this.currentGroundY > 290) {
        this.isGameOver = true;
        this.scene.launch('ResultScene', { state: 'gameover', scene: this.scene, score: this.score });
        this.scene.pause();
      }

      //ゲームクリア処理
      if (this.currentGroundY < 300) {
        this.isGameOver = true;
        this.scene.launch('ResultScene', { state: 'gameclear', scene: this.scene, score: this.score });
        this.scene.pause();
      }
    }

    this.score = this.mapHeight - this.currentGroundY;
    this.uiScore.setText(`登った高さ:${this.score / 100}m`);
  }

  private getColor(t: number) {
    // 0〜0.5は 緑→黄、0.5〜1は 黄→赤
    let r, g;
    if (t < 0.5) {
      // 緑 (0,255,0) → 黄 (255,255,0)
      r = 255 * (t * 2);
      g = 255;
    } else {
      // 黄 (255,255,0) → 赤 (255,0,0)
      r = 255;
      g = 255 * (1 - (t - 0.5) * 2);
    }
    return Phaser.Display.Color.GetColor(r, g, 0);
  };


  // パワーゲージ更新関数
  private updatePowerGauge(percent: number): void {
    const currentHeight = percent * this.gaugeMaxHeight;

    this.gaugeMask.clear();
    this.gaugeMask.fillStyle(this.getColor(percent), 1); // 透明部分を黒にする
    this.gaugeMask.fillRect(
      this.gaugeX - this.gaugeWidth / 2,
      this.gaugeY - currentHeight,
      this.gaugeWidth,
      currentHeight
    );

  }
}

//足場生成
// function blockCreateRondomX(
//   playerX: number,
//   min = 0,
//   max = 1280,
//   excludeRange = 150,
//   limitRange = 200 //恐らくジャンプで届く最大距離
// ): number[] {
//   const leftMin = Math.max(min, playerX - limitRange);
//   const leftMax = Math.max(min, playerX - excludeRange);

//   const rightMin = Math.min(max, playerX + excludeRange);
//   const rightMax = Math.min(max, playerX + limitRange);

//   const leftWidth = leftMax - leftMin;
//   const rightWidth = rightMax - rightMin;

//   //自分の着地位置から左右に1か所ずつ足場生成用のX座標を生成
//   return [Math.floor(Math.random() * leftWidth) + leftMin, Math.floor(Math.random() * rightWidth) + rightMin];
// }


function blockCreateRondomX2(
  leftPoint: number,
  rightPoint: number,
  min = 0,
  max = 1280,
  excludeRange = 0,
  limitRange = 140 //恐らくジャンプで届く最大距離
): number[] {
  const leftMin = Math.max(min, leftPoint - limitRange);
  const leftMax = Math.max(min, leftPoint - excludeRange);

  const rightMin = Math.min(max, rightPoint + excludeRange);
  const rightMax = Math.min(max, rightPoint + limitRange);

  const leftWidth = leftMax - leftMin;
  const rightWidth = rightMax - rightMin;

  //自分の着地位置から左右に1か所ずつ足場生成用のX座標を生成
  return [Math.floor(Math.random() * leftWidth) + leftMin, Math.floor(Math.random() * rightWidth) + rightMin];
}

export default MainScene;
