import Phaser from "phaser";
import Player from "../characters/Player";
import GroundBlock from "../maps/GroundBlock";

class MainScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private player!: Player;
  private platform!: Phaser.Physics.Arcade.StaticGroup;
  private currentGroundY: number = 4000;
  private logFlg = false;
  private playerX: number | null = null;
  // private playerY: number | null = null;

  //ステージの広さ
  private mapWidth: number = 1280;
  private mapHeight: number = 4000;

  //UI
  private score: number = this.mapHeight - this.currentGroundY;
  private uiScore!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    Player.preload(this);
    this.load.image('ground', 'assets/platform.png');
    this.load.atlas('maps', 'assets/maps/spritesheet.png', 'assets/maps/spritesheet.json');
  }

  create() {
    this.cursors = this.input!.keyboard!.createCursorKeys();
    this.spaceKey = this.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    //UI
    this.uiScore = this.add.text(10, 10, `登った高さ:${this.score}m`, { fontSize: 32, fontStyle: 'bold', padding: { x: 10, y: 10 } }).setOrigin(0, 0);
    this.uiScore.setScrollFactor(0);

    this.platform = this.physics.add.staticGroup();

    //地面の生成
    for (let x = 0; x < this.mapWidth; x += 64) {
      this.platform.create(x, this.mapHeight, 'maps', 'terrain_stone_block_top').setScale(1, 1).setOrigin(0, 1).refreshBody();
    }

    new GroundBlock(this, this.platform, 360, this.mapHeight - 250, 3, 'right', 'stone');
    new GroundBlock(this, this.platform, 640, this.mapHeight - 450, 3, 'right', 'stone');

    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight); //カメラの移動範囲
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight); //物理演算の範囲

    Player.createAnims(this);

    this.player = new Player(this, 100, this.mapHeight - 50);
    this.physics.add.collider(this.player.sprite, this.platform, (_playerObj, groundObj) => {
      this.currentGroundY = (groundObj as Phaser.Physics.Arcade.Sprite).y;
    });

    this.cameras.main.startFollow(this.player.sprite, true, 1, 1); //カメラの追従設定

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
        this.playerX = (this.player.sprite.body as Phaser.Physics.Arcade.Body).x;
        // this.playerY = (this.player.sprite.body as Phaser.Physics.Arcade.Body).y;

        console.log(this.platform.children.entries.filter(block => (block as Phaser.Physics.Arcade.Sprite).y === this.currentGroundY)); //今乗ってる足場

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
        console.log(currentMoreBlockCount);

        //現在の足場と同時に生成された足場のどちらかに乗った時点で次の足場を生成する（地面と初期生成のブロックは除外）
        if (currentMoreBlockCount <= 2 && this.currentGroundY < this.mapHeight - 400) {
          const randomX = blockCreateRondomX(this.playerX);
          console.log(randomX);

          for (let i = 1; i <= 2; i++) {
            const randomY = Math.floor(Math.random() * (240 - 100 + 1)) + 100; //恐らくジャンプで届く最大高度
            const randomLength = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
            console.log(randomY);

            //着地点から見て左右に1つずつ生成する
            if (i === 1) {
              new GroundBlock(this, this.platform, randomX[0], this.currentGroundY - randomY, randomLength, 'left', 'stone');
            } else {
              new GroundBlock(this, this.platform, randomX[1], this.currentGroundY - randomY, randomLength, 'right', 'stone');
            }
          }
        }
      }
    } else {
      this.logFlg = false;
    }

    //ゲームオーバー処理
    if ((this.player.sprite.body as Phaser.Physics.Arcade.Body).y && (this.player.sprite.body as Phaser.Physics.Arcade.Body).y - this.currentGroundY > 300) {
      this.add.rectangle(0, 0, this.mapWidth, this.mapHeight, 0x000000, 0.8).setDepth(10).setOrigin(0, 0);
      const gameoverTxt = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'GAME OVER', { fontSize: 64, fontStyle: 'bold' }).setOrigin(0.5, 0.5).setDepth(10);
      const gameoverScore = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 60, `今回のスコア：${this.score}m`, { fontSize: 32, fontStyle: 'bold', padding: { x: 10, y: 10 } }).setOrigin(0.5, 0.5).setDepth(10);
      gameoverTxt.setScrollFactor(0);
      gameoverScore.setScrollFactor(0);
      this.scene.pause();
    }

    this.score = this.mapHeight - this.currentGroundY;
    this.uiScore.setText(`登った高さ:${this.score}m`);
  }
}

//足場生成
function blockCreateRondomX(
  playerX: number,
  min = 0,
  max = 1280,
  excludeRange = 200,
  limitRange = 290 //恐らくジャンプで届く最大距離
): number[] {
  const leftMin = Math.max(min, playerX - limitRange);
  const leftMax = Math.max(min, playerX - excludeRange);

  const rightMin = Math.min(max, playerX + excludeRange);
  const rightMax = Math.min(max, playerX + limitRange);

  const leftWidth = leftMax - leftMin;
  const rightWidth = rightMax - rightMin;

  //自分の着地位置から左右に1か所ずつ足場生成用のX座標を生成
  return [Math.floor(Math.random() * leftWidth) + leftMin, Math.floor(Math.random() * rightWidth) + rightMin];
}

export default MainScene;
