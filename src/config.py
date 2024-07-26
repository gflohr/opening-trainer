# generated by datamodel-codegen:
#   filename:  config.schema.json
#   timestamp: 2024-07-26T08:09:47+00:00

from __future__ import annotations

from typing_extensions import Literal, TypedDict

Board = TypedDict(
	'Board',
	{
		'3D': bool,
		'2Dpieces': Literal[
			'alpha',
			'anarcandy',
			'caliente',
			'california',
			'cardinal',
			'cburnett',
			'celtic',
			'chess7',
			'chessnut',
			'companion',
			'cooke',
			'disguised',
			'dubrovny',
			'fantasy',
			'fresca',
			'gioco',
			'governor',
			'horsey',
			'icpieces',
			'kiwen-suwi',
			'kosal',
			'leipzig',
			'letter',
			'libra',
			'maestro',
			'merida',
			'monarchy',
			'mpchess',
			'pirouetti',
			'pixel',
			'reillycraig',
			'riohacha',
			'shapes',
			'spatial',
			'staunty',
			'tatiana',
		],
		'2Dboard': Literal[
			'blue-marble',
			'blue2',
			'blue3',
			'canvas2',
			'green-plastic',
			'grey',
			'horsey',
			'leather',
			'maple',
			'maple2',
			'marble',
			'metal',
			'olive',
			'pink-pyramid',
			'purple-diag',
			'svg/blue',
			'svg/brown',
			'svg/green',
			'svg/ic',
			'svg/newspaper',
			'svg/purple',
			'wood',
			'wood2',
			'wood3',
			'wood4',
		],
		'3Dpieces': Literal[
			'Basic',
			'CubesAndPi',
			'Experimental',
			'Glass',
			'Metal',
			'ModernJade',
			'ModernWood',
			'RedVBlue',
			'Staunton',
			'Trimmed',
			'Wood',
		],
		'3Dboard': Literal[
			'Black-White-Aluminium',
			'Brushed-Aluminium',
			'China-Blue',
			'China-Green',
			'China-Grey',
			'China-Scarlet',
			'China-Yellow',
			'Classic-Blue',
			'Glass',
			'Gold-Silver',
			'Green-Glass',
			'Jade',
			'Light-Wood',
			'Marble',
			'Power-Coated',
			'Purple-Black',
			'Rosewood',
			'Wax',
			'Wood-Glass',
			'Woodi',
		],
	},
)


class Config(TypedDict):
	version: str
	board: Board
