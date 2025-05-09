import Phaser from "phaser";

class GroundBlock {
  constructor(
    scene: Phaser.Scene,
    group: Phaser.GameObjects.Group,
    x: number,
    y: number,
    length: number = 1,
    type: 'grass' | 'purple' | 'sand' | 'snow' | 'stone' = 'grass',
  ) {
    const frameMap = {
      'grass': {
        'single': 'terrain_grass_block',
        'left': 'terrain_grass_horizontal_left',
        'middle': 'terrain_grass_horizontal_middle',
        'right': 'terrain_grass_horizontal_right',
      },
      'purple': {
        'single': 'terrain_purple_block',
        'left': 'terrain_purple_horizontal_left',
        'middle': 'terrain_purple_horizontal_middle',
        'right': 'terrain_purple_horizontal_right',
      },
      'sand': {
        'single': 'terrain_sand_block',
        'left': 'terrain_sand_horizontal_left',
        'middle': 'terrain_sand_horizontal_middle',
        'right': 'terrain_sand_horizontal_right',
      },
      'snow': {
        'single': 'terrain_snow_block',
        'left': 'terrain_snow_horizontal_left',
        'middle': 'terrain_snow_horizontal_middle',
        'right': 'terrain_snow_horizontal_right',
      },
      'stone': {
        'single': 'terrain_stone_block',
        'left': 'terrain_stone_horizontal_left',
        'middle': 'terrain_stone_horizontal_middle',
        'right': 'terrain_stone_horizontal_right',
      },
    }

    const frameName = frameMap[type] || frameMap['grass'];

    if (length === 1) { //長さ1のブロック
      const block = scene.add.sprite(x, y, 'maps', frameName.single);
      scene.physics.add.existing(block, true);
      block.setOrigin(0, 0);
      (block.body! as Phaser.Physics.Arcade.Body).updateFromGameObject();

      group.add(block);

    } else if (length === 2) { //長さ2のブロック
      const blockList = [];

      const leftBlock = scene.add.sprite(x, y, 'maps', frameName.left);
      blockList.push(leftBlock);
      const rightBlock = scene.add.sprite(x, y, 'maps', frameName.right);
      blockList.push(rightBlock);

      blockList.forEach(block => {
        scene.physics.add.existing(block, true);
        block.setOrigin(0, 0);
        (block.body! as Phaser.Physics.Arcade.Body).updateFromGameObject();
        group.add(block);
      });
      // scene.physics.add.existing(leftBlock, true);
      // scene.physics.add.existing(rightBlock, true);
      // leftBlock.setOrigin(0, 0);
      // rightBlock.setOrigin(0, 0);
      // (leftBlock.body! as Phaser.Physics.Arcade.Body).updateFromGameObject();
      // (rightBlock.body! as Phaser.Physics.Arcade.Body).updateFromGameObject();
      // group.add(leftBlock);
      // group.add(leftBlock);

    } else { //長さ3以上のブロック
      const blockList = [];
      const leftBlock = scene.add.sprite(x, y, 'maps', frameName.left);
      blockList.push(leftBlock);

      for (let i = 1; i <= length - 2; i++) {
        const middleBlock = scene.add.sprite(x + i * 64, y, 'maps', frameName.middle);
        blockList.push(middleBlock);
      }

      const rightBlock = scene.add.sprite(x + (length - 1) * 64, y, 'maps', frameName.right);
      blockList.push(rightBlock);

      blockList.forEach(block => {
        scene.physics.add.existing(block, true);
        block.setOrigin(0, 0);
        (block.body! as Phaser.Physics.Arcade.Body).updateFromGameObject();
        group.add(block);
      });

    }

  }

  static preload(scene: Phaser.Scene) {
    scene.load.atlas('maps', 'assets/maps/spritesheet.png', 'assets/maps/spritesheet.json');
  }
}

export default GroundBlock;