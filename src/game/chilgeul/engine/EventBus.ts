// React ↔ Phaser 간 이벤트 통신용 PubSub 버스

import { Events } from 'phaser';

// Used to emit events between components, HTML and Phaser scenes
export const EventBus = new Events.EventEmitter();