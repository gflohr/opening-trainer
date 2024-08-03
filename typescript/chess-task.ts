import { Chess, type Color, type Square, type Move, SQUARES, BLACK, WHITE } from 'chess.js';
import { type Config as ChessgroundConfig } from 'chessground/config';
import { chessTask } from './store';

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

type Attempt = LineMove & {
	correct: boolean;
};

export class ChessTask {
	private readonly _chess: Chess;
	private readonly _line: Line;
	private readonly _firstMoveNumber: number;
	private readonly _firstColor: Color = WHITE;
	private _currentMoveNumber: number = 1;
	private _currentColor: Color = WHITE;
	private _config: ChessgroundConfig;
	private readonly attempts: Array<Attempt> = [];

	constructor(config: ChessgroundConfig) {
		this._config = config;
		const appElement = document.getElementById('app');
		this._line = JSON.parse(appElement?.dataset.line as string) as Line;

		this._chess = new Chess(this._line.fen);
		this._firstMoveNumber = this._chess.moveNumber();
		this._firstColor = this._chess.turn();
		for (const move of this._line.moves) {
			this._chess.move(move.move);
			this._chess.setComment(move.comments.join('\n'));
		}

		this.updateState(false);
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
		return this._config;
	}

	get gameComments(): string {
		return this._line.game_comments.join('\n');
	}

	private toDests(): Map<Square, Array<Square>> {
		const dests = new Map<Square, Array<Square>>();

		SQUARES.forEach(s => {
			const ms = this._chess.moves({square: s, verbose: true});
			if (ms.length) dests.set(s, ms.map(m => m.to));
		});

		return dests;
	}

	private updateState(doSet: boolean) {
		this._config.fen = this._chess.fen();

		this.updateMoveNumberAndColor();
		this.updateLastMove();
		this.updateMovable();
		if (doSet) {
			chessTask.set(this);
		}
	}

	private updateMoveNumberAndColor() {
		this._currentMoveNumber = this._chess.moveNumber();
		this._currentColor = this._chess.turn();
	}

	private updateLastMove() {
		const history = this._chess.history({verbose: true});

		if (!history.length) {
			this._config.lastMove = [];
		} else {
			let i = (this._currentMoveNumber - this._firstMoveNumber) << 1;
			if (this._currentColor === this._firstColor) {
				--i;
			} else if (this._currentColor === WHITE) {
				i -= 2;
			}

			const entry = history[i];
			this._config.lastMove = [ entry.from, entry.to ];
		}
	}

	private updateMovable() {
		this._config.movable = {};
		const movable = this._config.movable

		movable.free = false;
		movable.dests = this.toDests();

		if (this._chess.turn() === BLACK) {
			movable.color = 'black';
		} else {
			movable.color = 'white';
		}
	}

	public moveHandler(): (from: string, to: string) => void {
		return (from: string, to: string) => {
			const move = from + to;

			for (const attempt of this.attempts) {
				if (attempt.move === move) return;
			}

			const attempt: Attempt = {
				move,
				comments: [],
				nag: 0,
				correct: false.
			};
			this.attempts.push(attempt);

			for (const response of this._line.responses) {
				if (response.move === move) {
					attempt.correct = true;
					attempt.comments.push(...response.comments);
					attempt.nag = response.nag;
				}

				break;
			}
		};
	}
}
