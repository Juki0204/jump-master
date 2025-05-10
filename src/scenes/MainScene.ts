import Phaser from "phaser";
import Player from "../characters/Player";
import GroundBlock from "../maps/GroundBlock";

class MainScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private player!: Player;
  private platform!: Phaser.Physics.Arcade.StaticGroup;
  private currentGround: any | null = null;
  private currentGroundY: number = 4000;
  private logFlg = false;
  private playerX: number | null = null;
  // private playerY: number | null = null;

  //ステージの広さ
  private mapWidth: number = 1280;
  private mapHeight: number = 4000;

  // private destroyBlocksBelowCurrentGround(): void {
  //   const destroyBlock = this.platform.children.entries.filter(block =>
  //     (block as Phaser.Physics.Arcade.Sprite).y - 200 > this.currentGroundY &&
  //     this.currentGroundY > 4000
  //   );
  //   console.log('今からブロック消えます');
  //   console.log(destroyBlock);

  //   destroyBlock.forEach(block => {
  //     const sprite = block as Phaser.Physics.Arcade.Sprite;

  //     this.tweens.add({
  //       targets: sprite,
  //       alpha: 0,
  //       duration: 500,
  //       ease: 'Cubic.easeIn',
  //       onComplete: () => {
  //         sprite.disableBody(true, true);
  //         sprite.destroy();
  //       }
  //     });
  //   });
  // }

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

    this.platform = this.physics.add.staticGroup();

    //地面の生成
    for (let x = 0; x < this.mapWidth; x += 64) {
      this.platform.create(x, 4000, 'maps', 'terrain_grass_block_top').setScale(1, 1).setOrigin(0, 1).refreshBody();
    }
    // platform.create(640, 800, 'ground').setScale(4.0, 1).setOrigin(0.5, 1).refreshBody();
    // this.platform.create(400, 3850, 'ground').setScale(0.3, 0.8).setOrigin(0.5, 1).refreshBody();
    // this.platform.create(680, 3700, 'ground').setScale(0.3, 0.8).setOrigin(0.5, 1).refreshBody();
    // this.platform.create(1000, 3650, 'ground').setScale(0.2, 0.8).setOrigin(0.5, 1).refreshBody();
    // this.platform.create(1200, 3550, 'ground').setScale(0.2, 0.8).setOrigin(0.5, 1).refreshBody();
    new GroundBlock(this, this.platform, 360, 3750, 3, 'right', 'grass');
    new GroundBlock(this, this.platform, 640, 3550, 3, 'right', 'grass');
    // new GroundBlock(this, this.platform, 950, 3550, 2, 'grass');
    // new GroundBlock(this, this.platform, 1150, 3400, 2, 'grass');

    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight); //カメラの移動範囲
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight) //物理演算の範囲

    Player.createAnims(this);

    this.player = new Player(this, 100, 3950);
    this.physics.add.collider(this.player.sprite, this.platform, (_playerObj, groundObj) => {
      this.currentGround = groundObj;
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
        console.log('着地なう');
        console.log('今接地しているのは:', this.currentGround.texture.key, this.currentGround.frame.name);
        console.log('今接地している足場の高さは:', this.currentGroundY);
        this.logFlg = true;
        this.playerX = (this.player.sprite.body as Phaser.Physics.Arcade.Body).x;
        // this.playerY = (this.player.sprite.body as Phaser.Physics.Arcade.Body).y;

        console.log(this.platform.children.entries.filter(block => (block as Phaser.Physics.Arcade.Sprite).y === this.currentGroundY)); //今乗ってる足場

        //自分の高さより200px以上下にある地面以外の足場の削除
        let destroyBlock = this.platform.children.entries.filter(block => (block as Phaser.Physics.Arcade.Sprite).y - 200 > this.currentGroundY);
        console.log('今からブロック消えます');
        console.log(destroyBlock);
        destroyBlock.forEach(block => {
          const sprite = block as Phaser.Physics.Arcade.Sprite;

          this.tweens.add({
            targets: sprite,
            alpha: { from: 1, to: 0 },
            duration: 500,
            // delay: 300,
            ease: 'Cubic.easeIn',
            onComplete: () => {
              block.destroy();
            }
          });
        });
        // this.destroyBlocksBelowCurrentGround();

        let currentMoreBlock = this.platform.children.entries.filter(block => (block as Phaser.Physics.Arcade.Sprite).y <= this.currentGroundY);
        let currentMoreBlockY = currentMoreBlock.map(obj => (obj as Phaser.Physics.Arcade.Sprite).y);
        let currentMoreBlockCount = new Set(currentMoreBlockY).size
        console.log(currentMoreBlockCount);

        if (currentMoreBlockCount <= 2 && this.currentGroundY < 3600) {
          const randomX = blockCreateRondomX(this.playerX);
          console.log(randomX);

          for (let i = 1; i <= 2; i++) {
            const randomY = Math.floor(Math.random() * (240 - 100 + 1)) + 100;
            const randomLength = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
            // const dir = randomX < this.playerX ? 'left' : 'right';
            console.log(randomY);
            if (i === 1) {
              new GroundBlock(this, this.platform, randomX[0], this.currentGroundY - randomY, randomLength, 'left');
            } else {
              new GroundBlock(this, this.platform, randomX[1], this.currentGroundY - randomY, randomLength, 'right');
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
      const gameoverTxt = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'GAME OVER', { fontSize: 40, fontStyle: 'bold' }).setOrigin(0.5, 0.5).setDepth(10);
      gameoverTxt.setScrollFactor(0);
      this.scene.pause();
    }
  }
}

function blockCreateRondomX(
  playerX: number,
  min = 0,
  max = 1280,
  excludeRange = 200,
  limitRange = 290
): number[] {
  const leftMin = Math.max(min, playerX - limitRange);
  const leftMax = Math.max(min, playerX - excludeRange);

  const rightMin = Math.min(max, playerX + excludeRange);
  const rightMax = Math.min(max, playerX + limitRange);

  const leftWidth = leftMax - leftMin;
  const rightWidth = rightMax - rightMin;

  // if (leftWidth <= 0 && rightWidth <= 0) {
  //   console.warn('有効なX座標の範囲がありません');
  //   return playerX;
  // }

  // どちら側を使うかを、範囲の広さに応じてランダムに選択（偏りを避ける）
  // const totalWidth = leftWidth + rightWidth;
  // const rand = Math.random() * totalWidth;

  // if (rand < leftWidth) {
  //   return Math.floor(Math.random() * leftWidth) + leftMin;
  // } else {
  //   return Math.floor(Math.random() * rightWidth) + rightMin;
  // }

  return [Math.floor(Math.random() * leftWidth) + leftMin, Math.floor(Math.random() * rightWidth) + rightMin];
}

export default MainScene;
