import { writable } from 'svelte/store';
import { type Config } from './config';
import type { ChessTask } from './chess-task';

export const configuration = writable<Config | undefined>();
export const chessTask = writable<ChessTask | undefined>();
