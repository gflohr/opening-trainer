import { Chess, type Color, type Square, SQUARES, BLACK, WHITE } from 'chess.js';
import { type Config as ChessgroundConfig } from 'chessground/config';
import { Chessground } from 'svelte-chessground';
import { chessTask, configuration } from './store';
import type { Config } from './config';

type LineMove = {
	move: string;
	comments: Array<string>;
	nag: number;
}

type Line = {
	fen: string;
	game_comments: Array<string>;
	moves: Array<LineMove>;
	responses: Array<LineMove>;
};

export type Attempt = LineMove & {
	move?: string;
	correct?: boolean;
};

export class ChessTask {
	private readonly _chess: Chess;
	private readonly _line: Line;
	private readonly _firstMoveNumber: number;
	private readonly _firstColor: Color = WHITE;
	private _currentMoveNumber: number = 1;
	private _currentColor: Color = WHITE;
	private cg: Chessground;
	private _chessgroundConfig: ChessgroundConfig;
	private side: 'question' | 'answer' = 'question';
	private showNumberOfAnswers = true;
	private readonly _attempts: Array<Attempt | string> = [
		{
			move: '',
			comments: [],
			nag: 0,
		},
	];

	constructor(chessground: Chessground, config: ChessgroundConfig) {
		this.cg = chessground;
		this._chessgroundConfig = config;
		const appElement = document.getElementById('app');
		this._line = JSON.parse(appElement?.dataset.line as string) as Line;
		this.side = appElement?.dataset.side as 'question' | 'answer';

		this._chess = new Chess(this._line.fen);
		this._firstMoveNumber = this._chess.moveNumber();
		this._firstColor = this._chess.turn();
		for (const move of this._line.moves) {
			this._chess.move(move.move);
			this._chess.setComment(move.comments.join('\n'));
		}

		configuration.subscribe(config => this.onConfig(config));
	}

	get chess(): Chess {
		return this._chess;
	}

	get line(): Line {
		return this._line;
	}

	get firstMoveNumber(): number {
		return this._firstMoveNumber;
	}

	get firstColor(): Color {
		return this._firstColor;
	}

	get currentMoveNumber(): number {
		return this._currentMoveNumber;
	}

	get currentColor(): Color {
		return this._currentColor;
	}

	get chessgroundConfig(): ChessgroundConfig {
		return this._chessgroundConfig;
	}

	get gameComments(): string {
		return this._line.game_comments.join('\n');
	}

	get attempts(): Array<Attempt | string> {
		return this._attempts;
	}

	private onConfig(config: Config | undefined) {
		if (!config) return;

		this.showNumberOfAnswers = !(this.side === 'question' && !config.studying?.showNumberOfAnswers);
		const numAttemptSlots = this.showNumberOfAnswers ? this._line.responses.length : 1;

		for (let i = 1; i < numAttemptSlots; ++i) {
			this._attempts.push({
				move: '',
				comments: [],
				nag: 0,
			});
		}

		this.updateState();
	}

	private toDests(): Map<Square, Array<Square>> {
		const dests = new Map<Square, Array<Square>>();

		SQUARES.forEach(s => {
			const ms = this._chess.moves({square: s, verbose: true});
			if (ms.length) dests.set(s, ms.map(m => m.to));
		});

		return dests;
	}

	private updateState() {
		this._chessgroundConfig.fen = this._chess.fen();

		this.updateMoveNumberAndColor();
		this.updateLastMove();
		this.updateMovable();

		chessTask.set(this);
	}

	private updateMoveNumberAndColor() {
		this._currentMoveNumber = this._chess.moveNumber();
		this._currentColor = this._chess.turn();
	}

	private updateLastMove() {
		const history = this._chess.history({verbose: true});

		if (!history.length) {
			this._chessgroundConfig.lastMove = [];
		} else {
			let i = (this._currentMoveNumber - this._firstMoveNumber) << 1;
			if (this._currentColor === this._firstColor) {
				--i;
			} else if (this._currentColor === WHITE) {
				i -= 2;
			}

			const entry = history[i];
			this._chessgroundConfig.lastMove = [ entry.from, entry.to ];
		}
	}

	private updateMovable() {
		if (this.side === 'question') {
			this.updateMovableQuestion();
		} else {
			this.updateMovableAnswer();
		}
	}

	private updateMovableQuestion() {
		this._chessgroundConfig.movable = {};
		const movable = this._chessgroundConfig.movable;

		if (this.solved()) {
			this._chessgroundConfig.viewOnly = true;
		} else {
			movable.free = true;
			if (this._chess.turn() === BLACK) {
				movable.color = 'black';
			} else {
				movable.color = 'white';
			}

			movable.dests = this.toDests();
			movable.events = {
				after: this.moveHandler(),
			};
		}
	}

	private updateMovableAnswer() {
		this._chessgroundConfig.movable = {};
		const movable = this._chessgroundConfig.movable

		movable.free = false;
	}

	private solved(): boolean {
		const wanted = this._line.responses.length;
		let got = 0;

		this._attempts.forEach(a => {
			if (typeof a !== 'string' && a.correct) ++got;
		});

		return wanted === got;
	}

	public moveHandler(): (from: string, to: string) => void {
		return (from: string, to: string) => {
			const move = from + to;
			this._chess.move(move);
			this.cg.move(from as Key, to as Key);
			this._chess.undo();
			this.cg.cancelMove();
			this.cg.set(this._chessgroundConfig);
			if (this._chess.turn() === WHITE) {
				this.cg.getState().turnColor = 'white';
			} else {
				this.cg.getState().turnColor = 'black';
			}

			for (const attempt of this._attempts) {
				if (typeof attempt !== 'string') {
					if (attempt.move === move) return;
				}
			}

			let correct = false;
			for (const response of this._line.responses) {
				if (response.move === move) {
					correct = true;
					break;
				}
			}

			// We need a new slot if the answer was wrong or if we do not
			// reveal the number of expected responses.
			if (!correct || !this.showNumberOfAnswers) {
				this._attempts.push({
					move: '',
					comments: [],
					nag: 0,
				})
			}

			// Find a free slot for the move.
			const slot: Attempt = this._attempts.find(a => typeof a !== 'string' && a.move === '') as Attempt;
			if (slot) {
				slot.move = move;
				slot.correct = correct;
			}

			this.updateState();
		};
	}
}
