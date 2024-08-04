<script lang="ts">
	import { onDestroy } from 'svelte';
	import { chessTask } from './store';
	import { type Color, type Move, BLACK, WHITE } from 'chess.js';
	import { ChessTask } from './chess-task';

	type MovelistMove = {
		moveNumber: number;
		white: string;
		black: string;
		answerClass?: string;
	};

	type ChessMove = Move & {
		comment: string;
	};

	let moves: Array<MovelistMove | string> = [];
	let attempts: Array<MovelistMove | string> = [];
	let task: ChessTask;
	let responseMoveNumber: number;
	let responseColor: Color;

	const appElement = document.getElementById('app') as HTMLElement;
	const side = appElement.dataset.side;

	const unsubscribeChessTask = chessTask.subscribe(t => {
		task = t;

		responseMoveNumber = task.currentMoveNumber;
		responseColor = task.currentColor;

		const chess = task.chess;

		const history = chess.history({ verbose: true }) as Array<ChessMove>;
		const comments = chess.getComments();

		for (const i in history) {
			history[i].comment = comments[i].comment;
		}

		moves = fillMoves(task, history);
		attempts = fillAttempts(task);
	});

	function fillMoves(task: ChessTask, history: Array<ChessMove>): Array<MovelistMove | string> {
		const moves: Array<MovelistMove | string> = [];

		if (task.gameComments.length) {
			moves.push(task.gameComments);
		}

		let moveNumber = task.firstMoveNumber;
		let move = createMove(moveNumber);

		for (let i = 0; i < history.length; ++i) {
			const entry = history[i];

			if (i === 0 && entry.color === BLACK) {
				move.white = '...';
			}

			if (entry.color === WHITE) {
				move.white = getSAN(entry);
			} else {
				move.black = getSAN(entry);
			}

			if (entry.comment.length) {
				if (entry.color === WHITE) {
					move.black = '...';
					moves.push(move);
					move = createMove(moveNumber);
					move.white = '...';
				} else {
					moves.push(move);
					move = createMove(moveNumber++);
				}

				moves.push(entry.comment);
				continue;
			}

			if (entry.color === BLACK) {
				moves.push(move);
				move = createMove(++moveNumber);
			}
		}

		if (move.white.length) {
			moves.push(move);
		}

		return moves;
	}

	function fillAttempts(task: ChessTask): Array<MovelistMove | string> {
		const entries: Array<MovelistMove | string> = [];

		for (let i = 0; i < task.attempts.length; ++i) {
			const attempt = task.attempts[i];
			const entry = createMove(responseMoveNumber);

			if (typeof attempt !== 'string' && attempt.move !== '') {
				const move = task.chess.move(attempt.move);
				if (responseColor === BLACK) {
					entry.black = getSAN(move);
				} else {
					entry.white = getSAN(move);
				}
				task.chess.undo();

				if (attempt.correct) {
					entry.answerClass = 'right';
				} else {
					entry.answerClass = 'wrong';
				}
			}
			entries.push(entry);

			if (typeof attempt !== 'string') {
				const comments = attempt.comments.join('\n');
				if (comments.length) {
					entries.push(comments);
				}
			}
		}

		return entries;
	}

	function createMove(moveNumber: number): MovelistMove {
		return {
			moveNumber,
			white: '',
			black: '',
		};
	}

	function getSAN(move: Move): string {
		return move.san;
	}

	onDestroy(() => {
		unsubscribeChessTask();
	});
</script>

<chess-navigation>
	<button><i class="bi-three-dots"></i></button>
	<button><i class="bi-skip-backward-fill"></i></button>
	<button><i class="bi-caret-left-fill"></button>
	<button><i class="bi-caret-right-fill"></i></button>
	<button><i class="bi-skip-forward-fill"></i></button>
</chess-navigation>
<chess-movelist>
	{#each moves as entry}
		{#if typeof entry === 'string'}
			{#if side === 'answer'}
			<chess-comment>{entry}</chess-comment>
			{/if}
		{:else}
			<chess-move>
				<chess-move-number>{entry.moveNumber}</chess-move-number>
				<chess-move-white
					class:current-move={task.currentMoveNumber - 1 === entry.moveNumber &&
						task.currentColor === BLACK &&
						entry.white !== '...'}
					class:ellipsis={entry.white === '...'}
				>
					<san>{entry.white}</san>
				</chess-move-white>
				<chess-move-black
					class:current-move={task.currentMoveNumber - 1 === entry.moveNumber &&
						task.currentColor === WHITE &&
						entry.black !== '...'}
					class:ellipsis={entry.black === '...'}
					>
					<san>{entry.black}</san>
				</chess-move-black>
			</chess-move>
		{/if}
	{/each}
	{#each attempts as entry}
		{#if typeof entry === 'string'}
		<chess-comment>{entry}</chess-comment>
		{:else}
		<chess-move>
			<chess-move-number class="answer">{responseMoveNumber}</chess-move-number>
			{#if responseColor === WHITE}
			<chess-move-white class="answer-{entry.answerClass}">{entry.white}</chess-move-white>
			<chess-move-black class="answer-{entry.answerClass} ellipsis"><i class="bi-check-lg"></i></chess-move-black>
			{:else}
			<chess-move-white class="answer-{entry.answerClass} ellipsis"><i class="bi-check-lg"></i></chess-move-white>
			<chess-move-black class="answer-{entry.answerClass}"><san>{entry.black}</san></chess-move-black>
			{/if}
		</chess-move>
		{/if}
	{/each}
</chess-movelist>

<style lang="scss">
	$black-font-color: #666;
	$grey-font-color: #ddd;
	$grey-background-color: #eee;
	$grey-highlighted-background-color: #ccc;

	chess-navigation {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
	}

	chess-navigation button {
		padding: 0.5rem;
		border: none;
		font-size: larger;
		cursor: pointer;
	}

	chess-navigation button:hover {
		background-color: $grey-highlighted-background-color;
	}

	chess-movelist {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		align-content: start;
		overflow-y: auto;
	}

	chess-move {
		grid-column: span 5;
		font-size: 14pt;
		display: grid;
		grid-template-columns: 1fr 2fr 2fr;
		justify-items: center;
	}

	chess-move-number,
	chess-move-white,
	chess-move-black,
	chess-navigation,
	chess-comment {
		border-bottom: 1px solid $grey-font-color;
	}

	chess-move-number,
	chess-comment {
		background-color: $grey-background-color;
	}

	chess-move-number.answer {
		font-weight: bold;
	}

	chess-move-number,
	chess-move-white,
	chess-move-black {
		justify-self: center;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
	}

	chess-move-white,
	chess-move-black,
	chess-comment {
		color: $black-font-color;
		border-right: 1px solid $grey-font-color;
	}

	chess-move-white:not(.ellipsis):hover,
	chess-move-black:not(.ellipsis):hover {
		color: white;
		background-color: #1b78cf;
		cursor: pointer;
	}

	.current-move {
		background-color: lightblue;
	}

	chess-comment {
		grid-column: span 5;
		font-size: 11pt;
		padding: 4pt;
	}

	[class^="answer-"]{
		font-weight: bold;
	}

	.answer-right {
		color: rgb(27, 80, 27);
	}

	.answer-wrong {
		color: rgb(172, 38, 38);
	}

	.answer-empty {
		color: $black-font-color;
	}
</style>
