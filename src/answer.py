from __future__ import annotations

from chess import Board, Color

from page import Page


class Answer(Page):
	def __init__(self,
			  move: str,
			  fullmove_number: int,
			  turn: Color,
			  board: Board,
			  colour: Color) -> None:
		self.move = move
		self.fullmove_number = fullmove_number
		self.turn = turn
		Page.__init__(self, colour=colour)
		self.set_board(board)

	def render(self) -> str:
		rendered = str(self.fullmove_number) + '.'
		if not self.turn:
			rendered += '...'
		rendered += ' ' + self.move
		rendered += self.extra_html()

		return rendered

	def find(self, others: list[Answer]) -> bool:
		for answer in others:
			if (answer.move == self.move
	   			and answer.fullmove_number == self.fullmove_number
				and answer.turn == self.turn):
				return True
		
		return False

	def object_id(self) -> str:
		return 'a'
