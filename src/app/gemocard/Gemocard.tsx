import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class CardScene extends Phaser.Scene {
  private flipped: Phaser.GameObjects.Rectangle[] = [];
  private matched = 0;

  create() {
    const colors = Phaser.Utils.Array.Shuffle([
      0xff0000,
      0xff0000,
      0x00ff00,
      0x00ff00,
    ]);

    for (let i = 0; i < 4; i++) {
      const x = 100 + (i % 2) * 120;
      const y = 100 + Math.floor(i / 2) * 180;
      const card = this.add
        .rectangle(x, y, 100, 150, 0x555555)
        .setInteractive();
      card.setData('color', colors[i]);
      card.setData('flipped', false);
      card.on('pointerup', () => this.handleClick(card));
    }
  }

  private handleClick(card: Phaser.GameObjects.Rectangle) {
    if (card.getData('flipped') || this.flipped.length >= 2) return;
    card.setFillStyle(card.getData('color'));
    card.setData('flipped', true);
    this.flipped.push(card);
    if (this.flipped.length === 2) {
      this.time.delayedCall(500, () => this.checkMatch());
    }
  }

  private checkMatch() {
    const [a, b] = this.flipped;
    if (a.getData('color') === b.getData('color')) {
      a.disableInteractive();
      b.disableInteractive();
      this.matched += 2;
    } else {
      a.setFillStyle(0x555555);
      a.setData('flipped', false);
      b.setFillStyle(0x555555);
      b.setData('flipped', false);
    }
    this.flipped = [];
    if (this.matched === 4) {
      this.add.text(130, 50, 'You Win!', {
        fontSize: '32px',
        color: '#ffffff',
      });
    }
  }
}

export default function Gemocard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game>();

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 300,
        height: 400,
        parent: containerRef.current,
        backgroundColor: '#222222',
        scene: CardScene,
      };
      gameRef.current = new Phaser.Game(config);
    }
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = undefined;
    };
  }, []);

  return <div ref={containerRef} style={{ width: 300, height: 400 }} />;
}
