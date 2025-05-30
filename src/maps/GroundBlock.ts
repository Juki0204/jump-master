import Phaser from "phaser";

class GroundBlock {
  constructor(
    scene: Phaser.Scene,
    group: Phaser.GameObjects.Group,
    x: number,
    y: number,
    length: number = 1,
    direction: 'left' | 'right' = 'right',
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
    const objectScale = window.innerWidth < 768 ? 0.4 : 0.6;

    const sideBlock1 = direction === 'right' ? frameName.right : frameName.left;
    const sideBlock2 = direction === 'right' ? frameName.left : frameName.right;
    console.log(sideBlock2);

    if (length === 1) { //長さ1のブロック
      const block = scene.add.sprite(x, y, 'maps', frameName.single);
      scene.physics.add.existing(block, true);
      if (direction === 'left') {
        block.setOrigin(1, 0);
      } else if (direction === 'right') {
        block.setOrigin(0, 0);
      }
      block.setScale(objectScale);
      (block.body! as Phaser.Physics.Arcade.Body).updateFromGameObject();

      group.add(block);

    } else if (length === 2) { //長さ2のブロック
      const blockList = [];
      let resultBlockList;
      const offsetX = direction === 'right' ? 64 : -64;

      const leftBlock = scene.add.sprite(x, y, 'maps', sideBlock2);
      blockList.push(leftBlock);
      const rightBlock = scene.add.sprite(x + (offsetX * objectScale), y, 'maps', sideBlock1);
      blockList.push(rightBlock);

      if (direction === 'right') {
        resultBlockList = blockList;
      } else {
        resultBlockList = blockList.reverse();
      }

      resultBlockList.forEach(block => {
        scene.physics.add.existing(block, true);
        if (direction === 'right') {
          block.setOrigin(0, 0);
        } else {
          block.setOrigin(1, 0);
        }
        block.setScale(objectScale);
        (block.body! as Phaser.Physics.Arcade.Body).updateFromGameObject();
        group.add(block);
      });

    } else { //長さ3以上のブロック
      const blockList = [];
      let resultBlockList;
      const offsetX = direction === 'right' ? 64 : -64;

      const leftBlock = scene.add.sprite(x, y, 'maps', sideBlock2);
      blockList.push(leftBlock);

      for (let i = 1; i <= length - 2; i++) {
        const middleBlock = scene.add.sprite(x + i * (offsetX * objectScale), y, 'maps', frameName.middle);
        blockList.push(middleBlock);
      }

      const rightBlock = scene.add.sprite(x + (length - 1) * (offsetX * objectScale), y, 'maps', sideBlock1);
      blockList.push(rightBlock);

      if (direction === 'right') {
        resultBlockList = blockList;
      } else {
        resultBlockList = blockList.reverse();
      }

      resultBlockList.forEach(block => {
        scene.physics.add.existing(block, true);
        if (direction === 'right') {
          block.setOrigin(0, 0);
        } else {
          block.setOrigin(1, 0);
        }
        block.setScale(objectScale);
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